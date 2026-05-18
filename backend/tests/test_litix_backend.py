"""
LITIX Capacitación - Backend regression tests
Covers: root, categories, courses (CRUD + filters), auth (login/me/logout),
contact (public submit + admin list/patch/delete).
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://litix-platform.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "admin@litix.com"
ADMIN_PASSWORD = "Litix2026!"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Auth failed: {r.status_code} {r.text}")
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ---------------- ROOT & CATEGORIES ----------------
class TestRoot:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        d = r.json()
        assert d.get("status") == "ok"
        assert "service" in d

    def test_categories(self, api):
        r = api.get(f"{BASE_URL}/api/categories")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 9
        keys = [c["key"] for c in data]
        assert "derecho-penal" in keys
        assert "derecho-familiar" in keys


# ---------------- COURSES (public) ----------------
class TestCoursesPublic:
    def test_list_courses(self, api):
        r = api.get(f"{BASE_URL}/api/courses")
        assert r.status_code == 200
        courses = r.json()
        assert isinstance(courses, list)
        assert len(courses) >= 6
        c = courses[0]
        for f in ["id", "slug", "title", "category", "status"]:
            assert f in c

    def test_filter_status_published(self, api):
        r = api.get(f"{BASE_URL}/api/courses?status=published")
        assert r.status_code == 200
        for c in r.json():
            assert c["status"] == "published"

    def test_filter_category(self, api):
        r = api.get(f"{BASE_URL}/api/courses?category=derecho-penal")
        assert r.status_code == 200
        for c in r.json():
            assert c["category"] == "derecho-penal"

    def test_get_course_by_slug(self, api):
        listing = api.get(f"{BASE_URL}/api/courses").json()
        slug = listing[0]["slug"]
        r = api.get(f"{BASE_URL}/api/courses/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_get_course_not_found(self, api):
        r = api.get(f"{BASE_URL}/api/courses/does-not-exist-xyz")
        assert r.status_code == 404


# ---------------- AUTH ----------------
class TestAuth:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 10
        # httpOnly cookie should be set
        assert "access_token" in r.cookies or any("access_token" in (h or "") for h in r.headers.get("set-cookie", "").split(","))

    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pw-1234"})
        assert r.status_code == 401

    def test_me_with_bearer(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"

    def test_me_no_auth(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401


# ---------------- COURSES CRUD (auth) ----------------
class TestCoursesCRUD:
    created_id = None
    created_slug = None

    def test_create_unauth(self):
        # Use a fresh request (no session cookies) to verify unauthenticated rejection
        r = requests.post(f"{BASE_URL}/api/courses", json={
            "title": "TEST Unauth Course",
            "short_description": "x",
            "category": "derecho-civil",
        })
        assert r.status_code == 401

    def test_create_course(self, auth_headers):
        payload = {
            "title": "TEST Curso de Prueba Pytest",
            "short_description": "Descripción corta de prueba",
            "long_description": "Descripción larga de prueba",
            "category": "derecho-civil",
            "instructor": "Test Instructor",
            "duration": "5 horas",
            "modality": "Online",
            "hotmart_link": "https://hotmart.com/es",
            "syllabus": [{"title": "Modulo 1", "description": "Intro"}],
            "status": "draft",
            "featured": False,
            "thumbnail": ""
        }
        r = requests.post(f"{BASE_URL}/api/courses", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == payload["title"]
        assert d["slug"]
        TestCoursesCRUD.created_id = d["id"]
        TestCoursesCRUD.created_slug = d["slug"]

        # verify via GET
        rg = requests.get(f"{BASE_URL}/api/courses/{d['slug']}")
        assert rg.status_code == 200
        assert rg.json()["id"] == d["id"]

    def test_update_course(self, auth_headers):
        assert TestCoursesCRUD.created_id, "Create test must run first"
        payload = {
            "title": "TEST Curso Actualizado Pytest",
            "short_description": "Updated short",
            "long_description": "Updated long",
            "category": "derecho-civil",
            "instructor": "Updated Instructor",
            "duration": "6 horas",
            "modality": "Online",
            "hotmart_link": "https://hotmart.com/es",
            "syllabus": [],
            "status": "published",
            "featured": True,
            "thumbnail": ""
        }
        r = requests.put(f"{BASE_URL}/api/courses/{TestCoursesCRUD.created_id}", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == payload["title"]
        assert d["status"] == "published"
        TestCoursesCRUD.created_slug = d["slug"]

    def test_delete_course(self, auth_headers):
        assert TestCoursesCRUD.created_id
        r = requests.delete(f"{BASE_URL}/api/courses/{TestCoursesCRUD.created_id}", headers=auth_headers)
        assert r.status_code == 200
        # Verify deletion
        rg = requests.get(f"{BASE_URL}/api/courses/{TestCoursesCRUD.created_slug}")
        assert rg.status_code == 404


# ---------------- CONTACT ----------------
class TestContact:
    created_id = None

    def test_submit_public(self, api):
        r = api.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST Contact",
            "email": "test_contact@example.com",
            "phone": "+5215555555555",
            "message": "Mensaje de prueba pytest"
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == "TEST Contact"
        assert d["read"] is False
        TestContact.created_id = d["id"]

    def test_list_requires_auth(self, api):
        r = requests.get(f"{BASE_URL}/api/contact")
        assert r.status_code == 401

    def test_list_with_auth(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/contact", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # newly created should be present
        ids = [m["id"] for m in data]
        assert TestContact.created_id in ids

    def test_mark_read(self, auth_headers):
        assert TestContact.created_id
        r = requests.patch(f"{BASE_URL}/api/contact/{TestContact.created_id}/read", headers=auth_headers)
        assert r.status_code == 200

    def test_delete_contact(self, auth_headers):
        r = requests.delete(f"{BASE_URL}/api/contact/{TestContact.created_id}", headers=auth_headers)
        assert r.status_code == 200


# ---------------- LOGOUT ----------------
class TestLogout:
    def test_logout(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/auth/logout", headers=auth_headers)
        assert r.status_code == 200
