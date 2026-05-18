import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit3, Trash2, Eye, EyeOff, LogOut, Upload, X, Mail, MailOpen, ExternalLink, Star } from "lucide-react";
import { Logo } from "@/components/litix/Logo";
import { useAuth } from "@/context/AuthContext";
import api, { resolveImageUrl, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const EMPTY_COURSE = {
  title: "", slug: "", short_description: "", long_description: "",
  category: "derecho-civil", thumbnail: "", instructor: "", duration: "",
  modality: "", objective: "", target_audience: "", syllabus: [],
  hotmart_link: "", status: "draft", featured: false,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // course or null
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cr, mr, catr] = await Promise.all([
        api.get("/courses"),
        api.get("/contact"),
        api.get("/categories"),
      ]);
      setCourses(cr.data || []);
      setMessages(mr.data || []);
      setCategories(catr.data || []);
    } catch (e) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const onDeleteCourse = async (id) => {
    if (!window.confirm("¿Eliminar este curso? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Curso eliminado");
      fetchData();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const onToggleStatus = async (course) => {
    try {
      const updated = { ...course, status: course.status === "published" ? "draft" : "published" };
      delete updated.id;
      delete updated.created_at;
      delete updated.updated_at;
      await api.put(`/courses/${course.id}`, updated);
      toast.success("Estado actualizado");
      fetchData();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const onMarkRead = async (id) => {
    try { await api.patch(`/contact/${id}/read`); fetchData(); } catch (_) {}
  };

  const onDeleteMessage = async (id) => {
    if (!window.confirm("¿Eliminar este mensaje?")) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success("Mensaje eliminado");
      fetchData();
    } catch (_) {}
  };

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="admin-dashboard">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center"><Logo size="md" /></Link>
            <span className="hidden md:inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gray-500 pl-8 border-l border-gray-200">
              Panel administrativo
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-sm text-gray-700">
              {user?.name} <span className="text-gray-400">·</span> <span className="text-gray-500">{user?.email}</span>
            </span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#E60000]"
              data-testid="admin-logout"
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200" data-testid="admin-tabs">
          <button
            onClick={() => setTab("courses")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === "courses" ? "border-[#E60000] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
            data-testid="tab-courses"
          >
            Cursos ({courses.length})
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              tab === "messages" ? "border-[#E60000] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
            data-testid="tab-messages"
          >
            Mensajes ({messages.length})
            {unread > 0 && (
              <span className="bg-[#E60000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">Cargando…</div>
        ) : tab === "courses" ? (
          <CoursesPanel
            courses={courses}
            categories={categories}
            onEdit={(c) => setEditing(c)}
            onCreate={() => setEditing({ ...EMPTY_COURSE })}
            onDelete={onDeleteCourse}
            onToggleStatus={onToggleStatus}
          />
        ) : (
          <MessagesPanel messages={messages} onRead={onMarkRead} onDelete={onDeleteMessage} />
        )}
      </div>

      {/* Editor modal */}
      {editing && (
        <CourseEditor
          course={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function CoursesPanel({ courses, categories, onEdit, onCreate, onDelete, onToggleStatus }) {
  const catMap = Object.fromEntries(categories.map((c) => [c.key, c.label]));
  return (
    <div data-testid="courses-panel">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Gestión de cursos</h2>
          <p className="text-sm text-gray-600 mt-1">Crea, edita, publica o elimina cursos del catálogo.</p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-[#E60000] hover:bg-[#B30000] text-white font-semibold px-5 py-3 rounded-sm transition-colors"
          data-testid="admin-create-course"
        >
          <Plus size={16} /> Nuevo curso
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        {courses.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No hay cursos aún. Crea el primero.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-6 p-5 hover:bg-gray-50" data-testid={`admin-course-row-${c.id}`}>
                <div className="w-20 h-20 bg-gray-100 shrink-0 overflow-hidden">
                  {c.thumbnail ? (
                    <img src={resolveImageUrl(c.thumbnail)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{c.title}</h3>
                    {c.featured && <Star size={14} className="text-[#E60000] fill-[#E60000]" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{catMap[c.category] || c.category}</span>
                    <span>·</span>
                    <span>{c.duration || "Sin duración"}</span>
                    <span>·</span>
                    <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider ${
                      c.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                    }`}>
                      {c.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleStatus(c)}
                    className="p-2 hover:bg-gray-100 rounded-sm text-gray-600 hover:text-gray-900"
                    title={c.status === "published" ? "Cambiar a borrador" : "Publicar"}
                    data-testid={`admin-toggle-status-${c.id}`}
                  >
                    {c.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => onEdit(c)}
                    className="p-2 hover:bg-gray-100 rounded-sm text-gray-600 hover:text-gray-900"
                    title="Editar"
                    data-testid={`admin-edit-course-${c.id}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="p-2 hover:bg-red-50 rounded-sm text-gray-600 hover:text-[#E60000]"
                    title="Eliminar"
                    data-testid={`admin-delete-course-${c.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesPanel({ messages, onRead, onDelete }) {
  const [open, setOpen] = useState(null);
  return (
    <div data-testid="messages-panel">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">Mensajes de contacto</h2>
      <p className="text-sm text-gray-600 mb-6">Mensajes recibidos desde el formulario público.</p>

      <div className="bg-white border border-gray-200">
        {messages.length === 0 ? (
          <div className="py-20 text-center text-gray-500" data-testid="messages-empty">Aún no hay mensajes.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((m) => (
              <div key={m.id} className={`p-5 ${!m.read ? "bg-red-50/30" : ""}`} data-testid={`admin-message-${m.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {m.read ? <MailOpen size={18} className="text-gray-400 mt-1" /> : <Mail size={18} className="text-[#E60000] mt-1" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{m.name}</h4>
                        {!m.read && <span className="bg-[#E60000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Nuevo</span>}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {m.email}{m.phone ? ` · ${m.phone}` : ""} · {new Date(m.created_at).toLocaleString()}
                      </div>
                      <p className={`text-sm text-gray-700 leading-relaxed ${open === m.id ? "" : "line-clamp-2"}`}>
                        {m.message}
                      </p>
                      {m.message.length > 140 && (
                        <button onClick={() => setOpen(open === m.id ? null : m.id)} className="text-xs font-semibold text-[#E60000] hover:underline mt-2">
                          {open === m.id ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!m.read && (
                      <button onClick={() => onRead(m.id)} className="p-2 hover:bg-gray-100 rounded-sm text-gray-600" title="Marcar como leído" data-testid={`admin-msg-read-${m.id}`}>
                        <MailOpen size={16} />
                      </button>
                    )}
                    <a href={`mailto:${m.email}`} className="p-2 hover:bg-gray-100 rounded-sm text-gray-600" title="Responder por correo" data-testid={`admin-msg-reply-${m.id}`}>
                      <ExternalLink size={16} />
                    </a>
                    <button onClick={() => onDelete(m.id)} className="p-2 hover:bg-red-50 rounded-sm text-gray-600 hover:text-[#E60000]" title="Eliminar" data-testid={`admin-msg-delete-${m.id}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseEditor({ course, categories, onClose, onSaved }) {
  const isNew = !course.id;
  const [data, setData] = useState({ ...course });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setField = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const addModule = () => setField("syllabus", [...(data.syllabus || []), { title: "", description: "" }]);
  const updateModule = (i, k, v) => {
    const s = [...data.syllabus];
    s[i] = { ...s[i], [k]: v };
    setField("syllabus", s);
  };
  const removeModule = (i) => setField("syllabus", data.syllabus.filter((_, idx) => idx !== i));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data: res } = await api.post("/uploads/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setField("thumbnail", res.url);
      toast.success("Imagen subida");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!data.title || !data.short_description) {
      toast.error("Completa título y descripción corta");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...data };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) {
        await api.post("/courses", payload);
        toast.success("Curso creado");
      } else {
        await api.put(`/courses/${course.id}`, payload);
        toast.success("Curso actualizado");
      }
      onSaved();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-stretch justify-end overflow-hidden" data-testid="course-editor-modal">
      <div className="w-full max-w-3xl bg-white h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{isNew ? "Nuevo curso" : "Editar curso"}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Completa la información del curso.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-sm" data-testid="editor-close">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <Field label="Título">
            <input type="text" value={data.title} onChange={(e) => setField("title", e.target.value)} className={inputCls} data-testid="editor-title" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select value={data.category} onChange={(e) => setField("category", e.target.value)} className={inputCls} data-testid="editor-category">
                {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select value={data.status} onChange={(e) => setField("status", e.target.value)} className={inputCls} data-testid="editor-status">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </Field>
          </div>

          <Field label="Descripción corta">
            <textarea rows={2} value={data.short_description} onChange={(e) => setField("short_description", e.target.value)} className={inputCls} data-testid="editor-short-desc" />
          </Field>

          <Field label="Descripción larga">
            <textarea rows={5} value={data.long_description} onChange={(e) => setField("long_description", e.target.value)} className={inputCls} data-testid="editor-long-desc" />
          </Field>

          <Field label="Miniatura">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="https://… o sube una imagen abajo"
                value={data.thumbnail}
                onChange={(e) => setField("thumbnail", e.target.value)}
                className={inputCls}
                data-testid="editor-thumbnail-url"
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:border-gray-900 cursor-pointer rounded-sm text-sm font-medium text-gray-700">
                  <Upload size={14} />
                  {uploading ? "Subiendo…" : "Subir imagen local"}
                  <input type="file" accept="image/*" onChange={onUpload} className="hidden" data-testid="editor-thumbnail-file" />
                </label>
                {data.thumbnail && (
                  <div className="w-20 h-14 bg-gray-100 border border-gray-200 overflow-hidden">
                    <img src={resolveImageUrl(data.thumbnail)} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Puedes pegar una URL externa o subir una imagen desde tu PC.</p>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Instructor">
              <input type="text" value={data.instructor} onChange={(e) => setField("instructor", e.target.value)} className={inputCls} data-testid="editor-instructor" />
            </Field>
            <Field label="Duración">
              <input type="text" placeholder="ej. 12 horas" value={data.duration} onChange={(e) => setField("duration", e.target.value)} className={inputCls} data-testid="editor-duration" />
            </Field>
          </div>

          <Field label="Modalidad">
            <input type="text" placeholder="Online en vivo / a tu ritmo" value={data.modality} onChange={(e) => setField("modality", e.target.value)} className={inputCls} data-testid="editor-modality" />
          </Field>

          <Field label="Objetivo del curso">
            <textarea rows={2} value={data.objective} onChange={(e) => setField("objective", e.target.value)} className={inputCls} data-testid="editor-objective" />
          </Field>

          <Field label="A quién va dirigido">
            <textarea rows={2} value={data.target_audience} onChange={(e) => setField("target_audience", e.target.value)} className={inputCls} data-testid="editor-target" />
          </Field>

          <Field label="Link de Hotmart">
            <input type="text" placeholder="https://hotmart.com/..." value={data.hotmart_link} onChange={(e) => setField("hotmart_link", e.target.value)} className={inputCls} data-testid="editor-hotmart" />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold tracking-wider uppercase text-gray-700">Temario</label>
              <button onClick={addModule} className="text-xs font-semibold text-[#E60000] hover:underline inline-flex items-center gap-1" data-testid="editor-add-module">
                <Plus size={12} /> Añadir módulo
              </button>
            </div>
            <div className="space-y-3">
              {(data.syllabus || []).map((m, i) => (
                <div key={i} className="border border-gray-200 p-4 rounded-sm" data-testid={`editor-module-${i}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-[#E60000] mt-2.5">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Título del módulo" value={m.title} onChange={(e) => updateModule(i, "title", e.target.value)} className={inputCls} />
                      <input type="text" placeholder="Descripción breve" value={m.description || ""} onChange={(e) => updateModule(i, "description", e.target.value)} className={inputCls} />
                    </div>
                    <button onClick={() => removeModule(i)} className="p-2 text-gray-400 hover:text-[#E60000]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {(data.syllabus || []).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-300 rounded-sm">Aún no hay módulos.</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(e) => setField("featured", e.target.checked)}
              className="w-4 h-4 accent-[#E60000]"
              data-testid="editor-featured"
            />
            <span className="text-sm text-gray-700">Mostrar como curso destacado en la página principal</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-5 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-3 border border-gray-300 hover:border-gray-900 rounded-sm text-sm font-semibold text-gray-700" data-testid="editor-cancel">
            Cancelar
          </button>
          <button onClick={onSave} disabled={saving} className="px-6 py-3 bg-[#E60000] hover:bg-[#B30000] disabled:opacity-60 text-white rounded-sm text-sm font-semibold" data-testid="editor-save">
            {saving ? "Guardando…" : isNew ? "Crear curso" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider uppercase text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
