import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, MessageCircle } from "lucide-react";

const WHATSAPP_GROUP_URL =
  process.env.REACT_APP_WHATSAPP_GROUP_URL || "https://chat.whatsapp.com/REEMPLAZA_ESTE_ENLACE";

export default function MercantileThanks() {
  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(230,0,0,0.28),transparent_28%),linear-gradient(135deg,#050505_0%,#171717_58%,#090909_100%)]" />
        <div className="absolute -left-32 top-24 h-44 w-[45rem] -rotate-12 bg-[#d71920]/65" />
        <div className="absolute bottom-10 right-[-12rem] h-56 w-[45rem] -rotate-12 bg-[#9f171c]/70" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-10 font-bold leading-none tracking-tight">
              <div className="text-4xl">LITIX</div>
              <div className="text-sm font-semibold">CAPACITACIÓN</div>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#111]">
              <CheckCircle2 size={18} className="text-[#e60000]" />
              Registro confirmado
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-7xl">
              Gracias por registrarte al curso gratuito
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/78">
              El siguiente paso es unirte al grupo de WhatsApp. Ahí recibirás el enlace de acceso,
              recordatorios y avisos importantes antes de la clase.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold uppercase tracking-wide">
              <span className="inline-flex items-center gap-2 rounded-sm border border-white/25 px-4 py-3 text-white">
                <CalendarDays size={18} /> 4 de junio / 10:00 AM
              </span>
              <span className="rounded-sm border border-white/25 px-4 py-3 text-white">Hora CDMX</span>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-sm bg-[#25D366] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-[#07150b] transition hover:bg-[#1ebe5d]"
              >
                <MessageCircle size={22} />
                Unirme al grupo de WhatsApp
              </a>
              <Link
                to="/litigio-mercantil-gratis"
                className="inline-flex items-center justify-center gap-3 rounded-sm border border-white/30 px-8 py-4 text-base font-bold uppercase tracking-wide text-white transition hover:border-white"
              >
                <ArrowLeft size={20} />
                Volver a la landing
              </Link>
            </div>
          </div>

          <div className="relative hidden justify-center lg:flex">
            <div className="absolute bottom-4 h-48 w-72 -rotate-12 bg-[#e60000]/70" />
            <img
              src="/zayra-litix-mercantil.png"
              alt="Zayra Lizbeth León Cisneros"
              className="relative z-10 max-h-[34rem] w-auto object-contain"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
