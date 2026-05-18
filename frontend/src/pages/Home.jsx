import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Scale, Gavel, BookOpenCheck, Shield, GraduationCap, Briefcase } from "lucide-react";
import { Layout } from "@/components/litix/Layout";
import { CourseCard } from "@/components/litix/CourseCard";
import api from "@/lib/api";

const PILLARS = [
  { icon: BookOpenCheck, title: "Actualización legal", desc: "Reformas, criterios y jurisprudencia vigente al día." },
  { icon: Scale, title: "Criterio jurídico", desc: "Análisis técnico para tomar decisiones con mayor solidez." },
  { icon: Gavel, title: "Aplicación práctica", desc: "Capacitación enfocada en problemas reales del ejercicio." },
  { icon: GraduationCap, title: "Especialización profesional", desc: "Programas por materia para profundizar tu práctica." },
  { icon: Shield, title: "Seguridad al ejercer", desc: "Herramientas que respaldan tu trabajo en tribunales." },
  { icon: Briefcase, title: "Formación continua", desc: "Crecimiento profesional sostenido para abogados." },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/courses", { params: { status: "published" } })
      .then((r) => setFeatured((r.data || []).filter(c => c.featured).slice(0, 3)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-gray-200" data-testid="hero-section">
        <div className="absolute inset-0 litix-grid-bg opacity-60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-[#E60000]/5 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
              <span className="w-8 h-px bg-[#E60000]" />
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E60000]">
                Capacitación jurídica profesional
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-gray-900 leading-[1.05] animate-fade-up">
              Capacitación jurídica
              <br />
              práctica para abogados
              <br />
              <span className="text-[#E60000]">que ejercen con criterio.</span>
            </h1>
            <p className="mt-8 text-lg text-gray-600 max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: "0.15s" }}>
              Cursos y entrenamientos legales diseñados para llevar el conocimiento jurídico
              a la práctica profesional real. Sin teoría vacía. Sin relleno. Solo aplicación.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link
                to="/cursos"
                className="inline-flex items-center justify-center gap-2 bg-[#E60000] hover:bg-[#B30000] text-white font-semibold px-8 py-4 rounded-sm transition-all group"
                data-testid="hero-cta-ver-cursos"
              >
                Ver cursos
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-8 py-4 rounded-sm transition-all"
                data-testid="hero-cta-contactar"
              >
                Contactar
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
            {[
              { n: "9", l: "Áreas del derecho" },
              { n: "100%", l: "Práctica aplicada" },
              { n: "Online", l: "Modalidad flexible" },
              { n: "Hotmart", l: "Acceso garantizado" },
            ].map((s, i) => (
              <div key={i} className="bg-white px-8 py-8" data-testid={`hero-stat-${i}`}>
                <div className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">{s.n}</div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-24 lg:py-32 bg-white" data-testid="pillars-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-20">
            <div className="red-accent-bar" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900">
              Lo que fortalecemos en tu práctica profesional.
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Cada curso de LITIX está diseñado para entregar capacidades reales
              que se traducen en mejores resultados al ejercer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-white p-10 hover:bg-gray-50 transition-colors group" data-testid={`pillar-${i}`}>
                  <Icon size={28} className="text-[#E60000] mb-6" strokeWidth={1.5} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-24 lg:py-32 bg-[#FAFAFA] border-y border-gray-200" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="red-accent-bar" />
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900">
                Cursos destacados.
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Una selección de capacitaciones con alto enfoque práctico
                para distintas áreas del ejercicio jurídico.
              </p>
            </div>
            <Link
              to="/cursos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-[#E60000] transition-colors group"
              data-testid="featured-view-all"
            >
              Ver todos los cursos
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500" data-testid="featured-empty">
              Próximamente publicaremos nuestros cursos destacados.
            </div>
          )}
        </div>
      </section>

      {/* POSITIONING */}
      <section className="py-24 lg:py-32 bg-white" data-testid="positioning-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="red-accent-bar" />
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900 leading-tight">
                No enseñamos teoría vacía.
                <br />
                Enseñamos cómo ejercer.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:pl-10 lg:border-l border-gray-200">
              <p className="text-lg text-gray-700 leading-relaxed">
                LITIX Capacitación nace para resolver un problema concreto del ejercicio profesional:
                muchos cursos no preparan al abogado para los escenarios reales que enfrenta en
                tribunales, despachos y negociación.
              </p>
              <p className="mt-6 text-lg text-gray-700 leading-relaxed">
                Nuestro enfoque es directo: capacitación clara, aplicada a problemas reales,
                con criterios actualizados y técnica forense que se nota desde la primera audiencia.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6 pt-10 border-t border-gray-200">
                <div>
                  <div className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E60000] mb-2">Enfoque</div>
                  <div className="text-base text-gray-900 font-medium">Práctica forense aplicada</div>
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E60000] mb-2">Método</div>
                  <div className="text-base text-gray-900 font-medium">Caso · análisis · aplicación</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 lg:py-32 bg-gray-900 text-white relative overflow-hidden" data-testid="cta-final-section">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#E60000]" />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-tight">
            Explora nuestros cursos y
            <br />
            fortalece tu <span className="text-[#E60000]">práctica jurídica.</span>
          </h2>
          <p className="mt-8 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Capacitación profesional diseñada para abogados que no quieren quedarse atrás.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cursos"
              className="inline-flex items-center justify-center gap-2 bg-[#E60000] hover:bg-[#B30000] text-white font-semibold px-8 py-4 rounded-sm transition-all group"
              data-testid="cta-final-cursos"
            >
              Ver cursos disponibles
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-sm transition-all"
              data-testid="cta-final-contacto"
            >
              Hablar con asesoría
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
