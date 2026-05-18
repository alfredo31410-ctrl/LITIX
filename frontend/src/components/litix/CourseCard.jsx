import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, BookOpen } from "lucide-react";
import { resolveImageUrl } from "@/lib/api";

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

export function CourseCard({ course }) {
  const catLabel = CATEGORY_LABELS[course.category] || course.category;
  return (
    <Link
      to={`/cursos/${course.slug}`}
      className="group bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-gray-900 hover:shadow-xl transition-all duration-300 flex flex-col"
      data-testid={`course-card-${course.slug}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img
            src={resolveImageUrl(course.thumbnail)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <BookOpen size={40} />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="inline-block bg-white text-gray-900 text-[10px] font-semibold tracking-wider uppercase px-3 py-1.5 border border-gray-200">
            {catLabel}
          </span>
        </div>
      </div>

      <div className="p-7 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-3 group-hover:text-[#E60000] transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1 line-clamp-3">
          {course.short_description}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {course.duration && (
              <>
                <Clock size={13} />
                <span>{course.duration}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#E60000] group-hover:gap-2.5 transition-all">
            Ver curso <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
