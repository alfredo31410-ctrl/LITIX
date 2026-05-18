import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Clock, User, Monitor, Target, Users, ExternalLink, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/litix/Layout";
import api, { resolveImageUrl } from "@/lib/api";

const CATEGORY_LABELS = {
  "derecho-familiar": "Derecho Familiar",
  "derecho-civil": "Derecho Civil",
  "derecho-mercantil": "Derecho Mercantil",
  "derecho-laboral": "Derecho Laboral",
  "derecho-penal": "Derecho Penal",
  "derecho-fiscal": "Derecho Fiscal",
  "derecho-corporativo": "Derecho Corporativo",
  "actualizacion-juridica": "Actualización Jurídica",
  "habilidades-abogados": "Habilidades para Abogados",
};

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/courses/${slug}`)
      .then((r) => setCourse(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <Layout><div className="py-32 text-center text-gray-500" data-testid="course-detail-loading">Cargando curso…</div></Layout>;
  }

  if (notFound || !course) {
    return (
      <Layout>
        <div className="py-32 text-center max-w-md mx-auto px-6" data-testid="course-detail-notfound">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Curso no encontrado</h1>
          <p className="text-gray-600 mb-8">No pudimos encontrar el curso que buscas.</p>
          <button onClick={() => navigate("/cursos")} className="bg-[#E60000] hover:bg-[#B30000] text-white font-semibold px-6 py-3 rounded-sm">
            Ver todos los cursos
          </button>
        </div>
      </Layout>
    );
  }

  const catLabel = CATEGORY_LABELS[course.category] || course.category;
  const hotmart = course.hotmart_link || "https://hotmart.com/es";

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white" data-testid="course-breadcrumb">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5">
          <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#E60000]">
            <ArrowLeft size={14} /> Volver a cursos
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200" data-testid="course-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-[#E60000] mb-6">
                {catLabel}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900 leading-[1.1]">
                {course.title}
              </h1>
              <p className="mt-8 text-lg text-gray-700 leading-relaxed">{course.short_description}</p>

              <div className="mt-10 flex flex-wrap gap-6 pt-8 border-t border-gray-200">
                {course.instructor && (
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-[#E60000] mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Instructor</div>
                      <div className="text-sm font-semibold text-gray-900">{course.instructor}</div>
                    </div>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[#E60000] mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Duración</div>
                      <div className="text-sm font-semibold text-gray-900">{course.duration}</div>
                    </div>
                  </div>
                )}
                {course.modality && (
                  <div className="flex items-start gap-3">
                    <Monitor size={18} className="text-[#E60000] mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Modalidad</div>
                      <div className="text-sm font-semibold text-gray-900">{course.modality}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href={hotmart}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#E60000] hover:bg-[#B30000] text-white font-semibold px-8 py-4 rounded-sm transition-all group"
                  data-testid="course-cta-inscribirme"
                >
                  Inscribirme
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href={hotmart}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-8 py-4 rounded-sm transition-all"
                  data-testid="course-cta-hotmart"
                >
                  Ir a Hotmart <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/5] bg-gray-100 border border-gray-200 overflow-hidden">
                {course.thumbnail ? (
                  <img src={resolveImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 lg:py-24 bg-white" data-testid="course-content">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {course.long_description && (
              <div data-testid="course-description">
                <div className="red-accent-bar" />
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-6">Descripción general</h2>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{course.long_description}</p>
              </div>
            )}

            {course.objective && (
              <div data-testid="course-objective">
                <div className="flex items-center gap-3 mb-4">
                  <Target size={22} className="text-[#E60000]" />
                  <h2 className="text-2xl font-semibold text-gray-900">Objetivo del curso</h2>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{course.objective}</p>
              </div>
            )}

            {course.target_audience && (
              <div data-testid="course-target">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={22} className="text-[#E60000]" />
                  <h2 className="text-2xl font-semibold text-gray-900">A quién va dirigido</h2>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{course.target_audience}</p>
              </div>
            )}

            {course.syllabus && course.syllabus.length > 0 && (
              <div data-testid="course-syllabus">
                <div className="red-accent-bar" />
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">Temario</h2>
                <div className="border border-gray-200">
                  {course.syllabus.map((m, i) => (
                    <div key={i} className="flex gap-6 p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors" data-testid={`syllabus-module-${i}`}>
                      <div className="text-sm font-semibold text-[#E60000] w-10 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{m.title}</h3>
                        {m.description && <p className="text-sm text-gray-600 leading-relaxed">{m.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 text-white p-10 lg:p-12 rounded-sm" data-testid="course-promise">
              <CheckCircle2 size={32} className="text-[#E60000] mb-6" />
              <p className="text-xl lg:text-2xl font-medium leading-snug">
                Este curso está diseñado para ayudarte a aplicar el conocimiento jurídico en
                situaciones reales de la práctica profesional.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 border border-gray-200 p-8 bg-white" data-testid="course-sidebar">
              <div className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E60000] mb-3">
                Acceso por Hotmart
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Comienza hoy mismo</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                Inscríbete a través de Hotmart y obtén acceso inmediato a los contenidos del curso.
              </p>
              <a
                href={hotmart}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-[#E60000] hover:bg-[#B30000] text-white font-semibold px-6 py-4 rounded-sm transition-all mb-3"
                data-testid="sidebar-cta-inscribirme"
              >
                Inscribirme
              </a>
              <Link
                to="/contacto"
                className="block w-full text-center border border-gray-300 hover:border-gray-900 text-gray-900 font-semibold px-6 py-4 rounded-sm transition-all"
                data-testid="sidebar-cta-asesoria"
              >
                Solicitar asesoría
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
