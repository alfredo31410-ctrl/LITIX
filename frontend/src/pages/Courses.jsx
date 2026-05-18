import { useEffect, useState } from "react";
import { Layout } from "@/components/litix/Layout";
import { CourseCard } from "@/components/litix/CourseCard";
import api from "@/lib/api";
import { Search } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/courses", { params: { status: "published" } }),
      api.get("/categories"),
    ]).then(([cr, catr]) => {
      setCourses(cr.data || []);
      setCategories(catr.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchCat = active === "all" || c.category === active;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.short_description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-20 lg:py-28" data-testid="courses-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="red-accent-bar" />
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-900">
              Catálogo de cursos jurídicos.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Capacitaciones diseñadas para fortalecer tu criterio, técnica y resultados
              en distintas áreas del ejercicio profesional.
            </p>
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-16 lg:py-20 bg-white" data-testid="courses-grid-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Search bar */}
          <div className="mb-10 max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar curso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm"
                data-testid="courses-search-input"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-gray-200" data-testid="courses-filters">
            <button
              onClick={() => setActive("all")}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border rounded-sm transition-all ${
                active === "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
              }`}
              data-testid="filter-all"
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border rounded-sm transition-all ${
                  active === c.key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                }`}
                data-testid={`filter-${c.key}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-20 text-center text-gray-500" data-testid="courses-loading">Cargando cursos…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center" data-testid="courses-empty">
              <p className="text-lg text-gray-500">No encontramos cursos con esos filtros.</p>
              <button
                onClick={() => { setActive("all"); setSearch(""); }}
                className="mt-4 text-sm font-semibold text-[#E60000] hover:underline"
                data-testid="courses-reset-filters"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="courses-grid">
              {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
