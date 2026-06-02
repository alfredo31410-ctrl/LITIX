import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, X } from "lucide-react";

const ACTIVE_CAMPAIGN_FORM_URL =
  process.env.REACT_APP_ACTIVE_CAMPAIGN_FORM_URL || "https://litix.activecampaign.com/f/1";

export default function MercantileFreeLanding() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const handleMessage = (event) => {
      const payload = String(event.data || "").toLowerCase();
      const isActiveCampaign = String(event.origin || "").includes("activecampaign");

      if (isActiveCampaign && (payload.includes("submitted") || payload.includes("success"))) {
        window.location.href = "/gracias-litigio-mercantil";
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isModalOpen]);

  const openForm = () => setIsModalOpen(true);

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(135deg,#050505_0%,#171717_52%,#0c0c0c_100%)]" />
        <div className="absolute left-[-14%] top-[18%] h-44 w-[55%] -rotate-12 bg-[#d71920]/75" />
        <div className="absolute bottom-[3%] left-[22%] h-56 w-[62%] -rotate-12 bg-[#a8181f]/70" />
        <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-black/20 to-transparent" />
        <div className="absolute left-4 top-8 hidden h-[28rem] w-2 -rotate-[42deg] bg-white/10 lg:block" />
        <div className="absolute left-16 top-10 hidden h-[28rem] w-2 -rotate-[42deg] bg-white/10 lg:block" />
        <div className="absolute left-28 top-12 hidden h-[28rem] w-2 -rotate-[42deg] bg-white/10 lg:block" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-8 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div className="relative order-2 flex items-end justify-center lg:order-1 lg:h-full lg:justify-start">
            <img
              src="/zayra-litix-mercantil.png"
              alt="Abogada Zayra Lizbeth León Cisneros"
              className="relative z-10 max-h-[62vh] w-auto object-contain lg:max-h-[86vh]"
            />
          </div>

          <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:items-end lg:text-right">
            <div className="mb-10 text-right font-bold leading-none tracking-tight">
              <div className="text-4xl">LITIX</div>
              <div className="text-sm font-semibold">CAPACITACIÓN</div>
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Curso gratis en línea</p>
            <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-7xl">
              Lo que la universidad <span className="text-[#ff3030]">no</span> te enseñó sobre litigio mercantil
            </h1>

            <div className="mt-8 text-lg uppercase tracking-[0.22em] text-white/85">
              Impartido por la abogada:
              <strong className="mt-1 block text-base tracking-[0.18em] text-white">Zayra Lizbeth León Cisneros</strong>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-bold uppercase tracking-wide lg:justify-end">
              <span className="inline-flex items-center gap-2 rounded-sm bg-white px-4 py-3 text-[#111]">
                <CalendarDays size={18} /> 4 de junio
              </span>
              <span className="inline-flex items-center gap-2 rounded-sm bg-white px-4 py-3 text-[#111]">
                <Clock size={18} /> 10:00 AM
              </span>
              <span className="rounded-sm border border-white/30 px-4 py-3 text-white">Hora CDMX</span>
            </div>

            <button
              type="button"
              onClick={openForm}
              className="mt-10 inline-flex items-center justify-center gap-3 rounded-sm bg-[#e60000] px-9 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_18px_45px_rgba(230,0,0,0.35)] transition hover:bg-[#b90000]"
            >
              Registrarme gratis
              <ArrowRight size={20} />
            </button>

            <p className="mt-4 text-xs uppercase tracking-[0.45em] text-white/75">100% en línea</p>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 text-[#111]">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            "Criterios útiles para demandar y defender asuntos mercantiles.",
            "Errores que la universidad no aterriza al ejercicio real.",
            "Ruta práctica para llegar preparado a tus audiencias.",
          ].map((item) => (
            <div key={item} className="flex gap-4 border border-gray-200 p-6">
              <CheckCircle2 className="mt-1 shrink-0 text-[#e60000]" size={24} />
              <p className="text-base font-medium leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="relative h-[86vh] w-full max-w-2xl overflow-hidden rounded-sm bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
              aria-label="Cerrar formulario"
            >
              <X size={20} />
            </button>
            <iframe
              ref={iframeRef}
              title="Formulario de registro LITIX"
              src={ACTIVE_CAMPAIGN_FORM_URL}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      )}
    </main>
  );
}
