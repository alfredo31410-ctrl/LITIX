import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkBase = "text-sm font-medium transition-colors hover:text-[#E60000]";
  const active = "text-[#E60000]";
  const inactive = "text-gray-700";

  const links = [
    { to: "/", label: "Inicio", end: true },
    { to: "/cursos", label: "Cursos" },
    { to: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center" data-testid="header-logo-link">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={() => navigate("/admin/login")}
            className="text-sm font-medium text-gray-500 hover:text-[#E60000] transition-colors"
            data-testid="nav-link-admin"
          >
            Acceso Admin
          </button>
          <button
            onClick={() => navigate("/cursos")}
            className="bg-[#E60000] hover:bg-[#B30000] text-white text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors"
            data-testid="header-cta-ver-cursos"
          >
            Ver cursos
          </button>
        </nav>

        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
          data-testid="header-mobile-toggle"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white" data-testid="mobile-nav">
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
                data-testid={`mobile-nav-${l.label.toLowerCase()}`}
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={() => { setOpen(false); navigate("/admin/login"); }}
              className="text-left text-sm font-medium text-gray-500"
              data-testid="mobile-nav-admin"
            >
              Acceso Admin
            </button>
            <button
              onClick={() => { setOpen(false); navigate("/cursos"); }}
              className="bg-[#E60000] text-white text-sm font-semibold px-5 py-2.5 rounded-sm"
              data-testid="mobile-cta-ver-cursos"
            >
              Ver cursos
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
