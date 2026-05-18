from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Query, Header
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from fastapi.responses import Response as FastResponse

# ---------------- Config ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
APP_NAME = "litix-capacitacion"
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="LITIX Capacitación API")
api_router = APIRouter(prefix="/api")

# ---------------- Auth Helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(hours=8), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ---------------- Object Storage ----------------
storage_key: Optional[str] = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Almacenamiento no disponible")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Almacenamiento no disponible")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------- Models ----------------
class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str

class Module(BaseModel):
    title: str
    description: Optional[str] = ""

class CourseInput(BaseModel):
    title: str
    slug: Optional[str] = None
    short_description: str
    long_description: str = ""
    category: str
    thumbnail: str = ""
    instructor: str = ""
    duration: str = ""
    modality: str = ""
    objective: str = ""
    target_audience: str = ""
    syllabus: List[Module] = []
    hotmart_link: str = ""
    status: str = "draft"  # draft | published
    featured: bool = False

class CourseOut(CourseInput):
    id: str
    created_at: str
    updated_at: str

class ContactInput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str

class ContactOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    message: str
    read: bool
    created_at: str

# ---------------- Utility ----------------
def slugify(text: str) -> str:
    import re
    import unicodedata
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def now_iso():
    return datetime.now(timezone.utc).isoformat()

# ---------------- AUTH ENDPOINTS ----------------
@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    access = create_access_token(user["id"], user["email"])
    refresh = create_refresh_token(user["id"])
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=28800, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {
        "id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"],
        "access_token": access
    }

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Sesión cerrada"}

@api_router.get("/auth/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)

# ---------------- COURSES ----------------
@api_router.get("/courses", response_model=List[CourseOut])
async def list_courses(category: Optional[str] = None, status: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if status:
        query["status"] = status
    if featured is not None:
        query["featured"] = featured
    courses = await db.courses.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return courses

@api_router.get("/courses/{slug}", response_model=CourseOut)
async def get_course(slug: str):
    course = await db.courses.find_one({"slug": slug}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return course

@api_router.post("/courses", response_model=CourseOut)
async def create_course(data: CourseInput, current_user: dict = Depends(get_current_user)):
    cid = str(uuid.uuid4())
    slug = data.slug or slugify(data.title)
    # ensure unique slug
    if await db.courses.find_one({"slug": slug}):
        slug = f"{slug}-{cid[:6]}"
    doc = data.model_dump()
    doc["id"] = cid
    doc["slug"] = slug
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    doc["syllabus"] = [m if isinstance(m, dict) else m.model_dump() for m in data.syllabus]
    await db.courses.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/courses/{course_id}", response_model=CourseOut)
async def update_course(course_id: str, data: CourseInput, current_user: dict = Depends(get_current_user)):
    existing = await db.courses.find_one({"id": course_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    update = data.model_dump()
    update["syllabus"] = [m if isinstance(m, dict) else m.model_dump() for m in data.syllabus]
    if not update.get("slug"):
        update["slug"] = slugify(data.title)
    # check slug collision
    other = await db.courses.find_one({"slug": update["slug"], "id": {"$ne": course_id}})
    if other:
        update["slug"] = f"{update['slug']}-{course_id[:6]}"
    update["updated_at"] = now_iso()
    await db.courses.update_one({"id": course_id}, {"$set": update})
    refreshed = await db.courses.find_one({"id": course_id}, {"_id": 0})
    return refreshed

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return {"message": "Curso eliminado"}

# ---------------- UPLOADS ----------------
@api_router.post("/uploads/image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    if ext not in ["jpg", "jpeg", "png", "gif", "webp"]:
        raise HTTPException(status_code=400, detail="Formato no soportado")
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/courses/{file_id}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "image/jpeg")
    # public URL through our backend
    public_url = f"/api/files/{result['path']}"
    await db.files.insert_one({
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", 0),
        "is_deleted": False,
        "created_at": now_iso()
    })
    return {"url": public_url, "path": result["path"]}

@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    data, content_type = get_object(path)
    return FastResponse(content=data, media_type=record.get("content_type", content_type))

# ---------------- CONTACT MESSAGES ----------------
@api_router.post("/contact", response_model=ContactOut)
async def submit_contact(data: ContactInput):
    cid = str(uuid.uuid4())
    doc = data.model_dump()
    doc["id"] = cid
    doc["read"] = False
    doc["created_at"] = now_iso()
    doc["phone"] = doc.get("phone") or ""
    await db.contact_messages.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/contact", response_model=List[ContactOut])
async def list_contacts(current_user: dict = Depends(get_current_user)):
    msgs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for m in msgs:
        m["phone"] = m.get("phone") or ""
    return msgs

@api_router.patch("/contact/{msg_id}/read")
async def mark_contact_read(msg_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.contact_messages.update_one({"id": msg_id}, {"$set": {"read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return {"message": "Marcado como leído"}

@api_router.delete("/contact/{msg_id}")
async def delete_contact(msg_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.contact_messages.delete_one({"id": msg_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return {"message": "Eliminado"}

# ---------------- CATEGORIES ----------------
CATEGORIES = [
    {"key": "derecho-familiar", "label": "Derecho Familiar"},
    {"key": "derecho-civil", "label": "Derecho Civil"},
    {"key": "derecho-mercantil", "label": "Derecho Mercantil"},
    {"key": "derecho-laboral", "label": "Derecho Laboral"},
    {"key": "derecho-penal", "label": "Derecho Penal"},
    {"key": "derecho-fiscal", "label": "Derecho Fiscal"},
    {"key": "derecho-corporativo", "label": "Derecho Corporativo"},
    {"key": "actualizacion-juridica", "label": "Actualización Jurídica"},
    {"key": "habilidades-abogados", "label": "Habilidades para Abogados"},
]

@api_router.get("/categories")
async def get_categories():
    return CATEGORIES

@api_router.get("/")
async def root():
    return {"service": "LITIX Capacitación", "status": "ok"}

# ---------------- STARTUP ----------------
@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.courses.create_index("slug", unique=True)
    await db.courses.create_index("id", unique=True)
    await db.contact_messages.create_index("id", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@litix.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Litix2026!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrador LITIX",
            "role": "admin",
            "created_at": now_iso()
        })
        logger.info(f"Admin seeded: {admin_email}")
    else:
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
            logger.info("Admin password updated")

    # Seed demo courses
    count = await db.courses.count_documents({})
    if count == 0:
        demos = [
            {
                "title": "Estrategia Procesal en Derecho Familiar",
                "short_description": "Aprende a estructurar estrategias procesales sólidas en juicios familiares con enfoque práctico y jurisprudencial.",
                "long_description": "Este curso te brinda las herramientas técnicas y estratégicas para llevar juicios familiares con criterio jurídico, dominio probatorio y argumentación oral. Está diseñado para abogados que buscan resultados reales en tribunales familiares.",
                "category": "derecho-familiar",
                "thumbnail": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
                "instructor": "Mtra. Alejandra Ruiz",
                "duration": "12 horas",
                "modality": "Online en vivo",
                "objective": "Dotar al abogado de herramientas estratégicas y procesales para conducir con éxito juicios en materia familiar.",
                "target_audience": "Abogados litigantes, postulantes y estudiantes avanzados de derecho con interés en la práctica familiar.",
                "syllabus": [
                    {"title": "Marco normativo del derecho familiar contemporáneo", "description": "Reformas, criterios y principios rectores."},
                    {"title": "Teoría del caso aplicada a juicios familiares", "description": "Construcción estratégica desde la primera audiencia."},
                    {"title": "Prueba pericial y testimonial en familia", "description": "Validación, ofrecimiento y desahogo eficaz."},
                    {"title": "Argumentación oral en audiencia familiar", "description": "Técnicas para persuadir al juzgador."}
                ],
                "hotmart_link": "https://hotmart.com/es",
                "status": "published",
                "featured": True
            },
            {
                "title": "Litigio Mercantil Oral: Práctica Forense",
                "short_description": "Domina las audiencias del juicio oral mercantil con técnicas probadas en tribunales.",
                "long_description": "Curso intensivo enfocado en la práctica real del juicio oral mercantil. Incluye análisis de casos, simulaciones de audiencia y revisión de criterios jurisprudenciales recientes.",
                "category": "derecho-mercantil",
                "thumbnail": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
                "instructor": "Lic. Roberto Mendoza",
                "duration": "16 horas",
                "modality": "Online a tu ritmo",
                "objective": "Capacitar al litigante en la conducción técnica y estratégica del procedimiento oral mercantil.",
                "target_audience": "Abogados corporativos, litigantes mercantiles y áreas legales empresariales.",
                "syllabus": [
                    {"title": "Estructura del juicio oral mercantil", "description": "Etapas, plazos y formalidades."},
                    {"title": "Demanda y contestación: técnica redaccional", "description": "Precisión y solidez argumentativa."},
                    {"title": "Audiencia preliminar y de juicio", "description": "Conducción estratégica."},
                    {"title": "Recursos y medios de impugnación", "description": "Apelación y amparo mercantil."}
                ],
                "hotmart_link": "https://hotmart.com/es",
                "status": "published",
                "featured": True
            },
            {
                "title": "Defensa Penal Estratégica",
                "short_description": "Construye defensas penales sólidas en el sistema acusatorio con enfoque práctico y argumentativo.",
                "long_description": "Capacitación intensiva para defensores penales que desean fortalecer su criterio, técnica y argumentación en el sistema acusatorio adversarial mexicano.",
                "category": "derecho-penal",
                "thumbnail": "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1200&q=80",
                "instructor": "Dr. Eduardo Lara",
                "duration": "20 horas",
                "modality": "Online en vivo",
                "objective": "Formar defensores capaces de construir teorías del caso sólidas y litigar con técnica en audiencia.",
                "target_audience": "Defensores penales, asesores jurídicos y litigantes con práctica penal.",
                "syllabus": [
                    {"title": "Sistema acusatorio: principios y garantías", "description": "Fundamentos constitucionales."},
                    {"title": "Teoría del caso en materia penal", "description": "Construcción y narrativa."},
                    {"title": "Interrogatorio y contrainterrogatorio", "description": "Técnicas de litigación oral."},
                    {"title": "Alegatos de apertura y clausura", "description": "Persuasión jurídica eficaz."}
                ],
                "hotmart_link": "https://hotmart.com/es",
                "status": "published",
                "featured": True
            },
            {
                "title": "Reforma Laboral: Aplicación Práctica",
                "short_description": "Análisis aplicado de la reforma laboral mexicana y su impacto en la práctica profesional.",
                "long_description": "Análisis integral de la reforma laboral con enfoque en su aplicación práctica: nuevos tribunales, conciliación obligatoria, contratación colectiva y procedimiento ordinario actualizado.",
                "category": "derecho-laboral",
                "thumbnail": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
                "instructor": "Mtra. Lucía Hernández",
                "duration": "10 horas",
                "modality": "Online a tu ritmo",
                "objective": "Aplicar correctamente los cambios sustantivos y procesales de la reforma laboral en casos reales.",
                "target_audience": "Abogados laboralistas, áreas de recursos humanos y consultores jurídicos.",
                "syllabus": [
                    {"title": "Centros de conciliación y nuevos tribunales", "description": "Estructura y competencias."},
                    {"title": "Conciliación prejudicial obligatoria", "description": "Estrategia y procedimiento."},
                    {"title": "Procedimiento ordinario laboral", "description": "Audiencias y desahogo de pruebas."},
                    {"title": "Negociación colectiva y voto personal", "description": "Nuevas reglas y representatividad."}
                ],
                "hotmart_link": "https://hotmart.com/es",
                "status": "published",
                "featured": False
            },
            {
                "title": "Actualización Fiscal para Abogados",
                "short_description": "Domina las reformas fiscales recientes y su impacto en el ejercicio profesional.",
                "long_description": "Curso de actualización que aborda las reformas fiscales más recientes, criterios del SAT, defensa fiscal y planeación legal aplicable al ejercicio profesional.",
                "category": "derecho-fiscal",
                "thumbnail": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
                "instructor": "Lic. Carlos Vega",
                "duration": "8 horas",
                "modality": "Online a tu ritmo",
                "objective": "Actualizar al profesional jurídico en materia fiscal y dotarlo de criterio para asesorar y defender.",
                "target_audience": "Abogados fiscalistas, contadores y consultores empresariales.",
                "syllabus": [
                    {"title": "Reformas fiscales vigentes", "description": "Cambios sustantivos relevantes."},
                    {"title": "Defensa fiscal: medios ordinarios y extraordinarios", "description": "Recursos y juicio contencioso."},
                    {"title": "Estrategia y planeación legal", "description": "Optimización dentro del marco legal."}
                ],
                "hotmart_link": "https://hotmart.com/es",
                "status": "published",
                "featured": False
            },
            {
                "title": "Argumentación Jurídica Avanzada",
                "short_description": "Fortalece tu capacidad argumentativa con técnicas de razonamiento jurídico aplicado.",
                "long_description": "Programa para abogados que buscan elevar su capacidad argumentativa con técnicas de lógica jurídica, retórica forense y construcción de premisas sólidas.",
                "category": "habilidades-abogados",
                "thumbnail": "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=1200&q=80",
                "instructor": "Dra. Patricia Ortiz",
                "duration": "14 horas",
                "modality": "Online en vivo",
                "objective": "Desarrollar habilidades superiores de argumentación, redacción y razonamiento jurídico.",
                "target_audience": "Abogados litigantes, asesores y profesionales del derecho de cualquier área.",
                "syllabus": [
                    {"title": "Lógica jurídica aplicada", "description": "Construcción de premisas y conclusiones."},
                    {"title": "Retórica forense moderna", "description": "Persuasión ética en tribunales."},
                    {"title": "Redacción jurídica de alto nivel", "description": "Claridad, precisión y fuerza."},
                    {"title": "Argumentación constitucional", "description": "Ponderación y proporcionalidad."}
                ],
                "hotmart_link": "https://hotmart.com/es",
                "status": "published",
                "featured": False
            }
        ]
        for c in demos:
            c["id"] = str(uuid.uuid4())
            c["slug"] = slugify(c["title"])
            c["created_at"] = now_iso()
            c["updated_at"] = now_iso()
        await db.courses.insert_many(demos)
        logger.info(f"Seeded {len(demos)} demo courses")

    # Init storage
    init_storage()

@app.on_event("shutdown")
async def shutdown_db():
    client.close()

# ---------------- ROUTER & CORS ----------------
app.include_router(api_router)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
origins = [frontend_url, "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
