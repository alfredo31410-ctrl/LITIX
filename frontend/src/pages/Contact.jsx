import { useState } from "react";
import { Mail, MessageCircle, MapPin, Send } from "lucide-react";
import { Layout } from "@/components/litix/Layout";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      toast.success("Mensaje enviado correctamente. Te responderemos pronto.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Error al enviar el mensaje");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-white border-b border-gray-200 py-20 lg:py-28" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="red-accent-bar" />
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-900">
              Hablemos de tu formación profesional.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Responde tus dudas, recibe orientación sobre cursos y conoce cómo LITIX
              puede fortalecer tu práctica jurídica.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 bg-white" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-gray-700 mb-2">Nombre completo</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm"
                  data-testid="contact-input-name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-gray-700 mb-2">Correo electrónico</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm"
                    data-testid="contact-input-email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-gray-700 mb-2">Teléfono <span className="text-gray-400 normal-case font-normal">(opcional)</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm"
                    data-testid="contact-input-phone"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-gray-700 mb-2">Mensaje</label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] outline-none rounded-sm text-sm resize-none"
                  data-testid="contact-input-message"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-[#E60000] hover:bg-[#B30000] disabled:opacity-60 text-white font-semibold px-8 py-4 rounded-sm transition-all"
                data-testid="contact-submit-button"
              >
                {submitting ? "Enviando…" : (<>Enviar mensaje <Send size={16} /></>)}
              </button>

              {success && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 p-4 rounded-sm" data-testid="contact-success">
                  Tu mensaje fue recibido. Te responderemos a la brevedad.
                </p>
              )}
            </form>
          </div>

          {/* Sidebar info */}
          <aside className="lg:col-span-5">
            <div className="border border-gray-200 p-10 bg-[#FAFAFA]" data-testid="contact-info">
              <div className="red-accent-bar" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">Canales directos</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail size={20} className="text-[#E60000] mt-1" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Correo</div>
                    <a href="mailto:contacto@litixcapacitacion.com" className="text-base text-gray-900 hover:text-[#E60000] font-medium">
                      contacto@litixcapacitacion.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MessageCircle size={20} className="text-[#E60000] mt-1" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">WhatsApp</div>
                    <a href="https://wa.me/521" target="_blank" rel="noreferrer" className="text-base text-gray-900 hover:text-[#E60000] font-medium">
                      Chat directo
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-[#E60000] mt-1" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Atención</div>
                    <div className="text-base text-gray-900 font-medium">Lunes a viernes · 9:00 – 18:00</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Si buscas información sobre un curso específico, indícanos el nombre y
                  te responderemos con detalles, modalidad y acceso por Hotmart.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
