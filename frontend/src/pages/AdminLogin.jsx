import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/litix/Logo";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error || "Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-login-page">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="md" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#E60000]" data-testid="admin-back-home">
            <ArrowLeft size={14} /> Volver al sitio
          </Link>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left visual panel */}
        <div className="hidden lg:flex bg-gray-900 text-white p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E60000]" />
          <div className="relative z-10 max-w-md self-end">
            <div className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E60000] mb-6">
              Panel administrativo
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter leading-tight">
              Gestiona el catálogo
              <br />
              de capacitación
              <br />
              <span className="text-[#E60000]">jurídica.</span>
            </h1>
            <p className="mt-6 text-gray-400 leading-relaxed">
              Administra cursos, miniaturas, vínculos a Hotmart y mensajes de contacto
              desde un panel centralizado y seguro.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center p-8 lg:p-16">
          <form onSubmit={onSubmit} className="w-full max-w-sm" data-testid="admin-login-form">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-sm mb-8">
              <Lock size={12} className="text-[#E60000]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-700">Acceso seguro</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Iniciar sesión</h2>
            <p className="mt-3 text-sm text-gray-600">Accede al dashboard de LITIX Capacitación.</p>

            <div className="mt-10 space-y-5">
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-gray-700 mb-2">Correo</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm"
                  data-testid="admin-login-email"
                  placeholder="admin@litix.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-gray-700 mb-2">Contraseña</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm"
                  data-testid="admin-login-password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-sm" data-testid="admin-login-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E60000] hover:bg-[#B30000] disabled:opacity-60 text-white font-semibold py-4 rounded-sm transition-all"
                data-testid="admin-login-submit"
              >
                {loading ? "Verificando…" : "Entrar al dashboard"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
