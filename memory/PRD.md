# LITIX Capacitación — PRD

## Problem Statement
LITIX Capacitación es una plataforma de educación profesional para abogados, despachos jurídicos, estudiantes de derecho y profesionales del sector legal. La web funciona como vitrina de cursos legales con redirección a Hotmart para inscripciones y un dashboard administrativo para gestionar el catálogo.

## Stack & Architecture
- **Frontend**: React 19 + Tailwind + Shadcn (admin), tipografía Outfit + IBM Plex Sans
- **Backend**: FastAPI + Motor (MongoDB async)
- **Auth**: JWT custom (httpOnly cookies + Bearer fallback en localStorage), bcrypt
- **Storage**: Emergent Object Storage para uploads de imágenes
- **Identidad visual**: rojo #E60000 acento, blanco fondo, negro textos

## User Personas
- Abogado litigante que busca actualización y técnica forense
- Despacho jurídico que capacita a su equipo
- Estudiante avanzado de derecho
- Administrador interno de LITIX (gestiona catálogo)

## Core Requirements (Static)
1. Home con hero, pilares, cursos destacados, posicionamiento, CTA, footer
2. Listado de cursos con filtros por 9 categorías legales + búsqueda
3. Detalle de curso (portada, objetivo, audiencia, temario, instructor, modalidad, duración, CTA a Hotmart)
4. Formulario de contacto (guarda en DB)
5. Login admin protegido + dashboard CRUD cursos
6. Subida de miniaturas: URL externa o archivo local

## What's Been Implemented (2026-02-18)
- ✅ Backend FastAPI con endpoints: auth (login/logout/me), courses CRUD, contact submit/list/read/delete, uploads/image, files serving, categories
- ✅ Seed automático: admin admin@litix.com + 6 cursos demo realistas
- ✅ Frontend completo: Home, Cursos, CourseDetail, Contacto, AdminLogin, AdminDashboard
- ✅ Header sticky con navegación + logo LITIX
- ✅ Footer completo con redes sociales y navegación
- ✅ Editor de cursos full-featured con upload de miniatura (URL o archivo)
- ✅ Sección de mensajes con badge de no leídos en dashboard admin
- ✅ Diseño Swiss/High-Contrast siguiendo design_guidelines.json
- ✅ Tests E2E: 100% backend pass, 100% frontend pass

## Prioritized Backlog
### P1 (siguiente fase)
- [ ] SEO: meta tags, Open Graph, sitemap.xml
- [ ] Analytics (Google Analytics o Plausible)
- [ ] Página "Sobre nosotros" / instructores destacados
- [ ] Sección de testimonios reales en home

### P2 (futuro)
- [ ] Multi-usuario con roles (admin, editor)
- [ ] Sistema de cupones / promociones
- [ ] Email automático al recibir mensajes (Resend)
- [ ] Newsletter integration
- [ ] Blog jurídico para SEO

## Test Credentials
- Admin: admin@litix.com / Litix2026!
- File: /app/memory/test_credentials.md
