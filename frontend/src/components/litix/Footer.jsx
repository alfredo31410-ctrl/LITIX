import { Link } from "react-router-dom";
import { Mail, MessageCircle, Linkedin, Instagram } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo size="lg" />
            <p className="text-sm text-gray-600 mt-6 max-w-md leading-relaxed">
              Capacitación jurídica práctica para abogados que quieren ejercer con mayor criterio,
              seguridad y actualización profesional.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="mailto:contacto@litixcapacitacion.com" className="w-10 h-10 border border-gray-300 hover:border-[#E60000] hover:text-[#E60000] rounded-sm flex items-center justify-center transition-colors" data-testid="footer-email-link">
                <Mail size={16} />
              </a>
              <a href="https://wa.me/521" target="_blank" rel="noreferrer" className="w-10 h-10 border border-gray-300 hover:border-[#E60000] hover:text-[#E60000] rounded-sm flex items-center justify-center transition-colors" data-testid="footer-whatsapp-link">
                <MessageCircle size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-gray-300 hover:border-[#E60000] hover:text-[#E60000] rounded-sm flex items-center justify-center transition-colors" data-testid="footer-linkedin-link">
                <Linkedin size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-gray-300 hover:border-[#E60000] hover:text-[#E60000] rounded-sm flex items-center justify-center transition-colors" data-testid="footer-instagram-link">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-gray-900 uppercase mb-5">
              Navegación
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-gray-600 hover:text-[#E60000]">Inicio</Link></li>
              <li><Link to="/cursos" className="text-gray-600 hover:text-[#E60000]">Cursos</Link></li>
              <li><Link to="/contacto" className="text-gray-600 hover:text-[#E60000]">Contacto</Link></li>
              <li><Link to="/admin/login" className="text-gray-600 hover:text-[#E60000]">Acceso Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-gray-900 uppercase mb-5">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>contacto@litixcapacitacion.com</li>
              <li>WhatsApp directo</li>
              <li>Lunes a viernes · 9:00–18:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} LITIX Capacitación. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-500">
            Plataforma de capacitación jurídica profesional · Aviso de privacidad
          </p>
        </div>
      </div>
    </footer>
  );
}
