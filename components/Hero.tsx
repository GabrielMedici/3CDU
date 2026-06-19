import Image from "next/image";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────────────────────
   Hero Section
   Background: 1001236245.jpg com overlay radial roxo profundo
   ────────────────────────────────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >

      {/* ── Background Image ───────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="3º Congresso de Direito Unicesumar"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Overlay radial: roxo profundo mescla com o fundo da página */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 90% at 50% 45%,
                rgba(43,0,87,0.55) 0%,
                rgba(26,0,51,0.82) 45%,
                rgba(13,0,25,0.97) 80%,
                #0d0019 100%
              )
            `,
          }}
        />
        {/* Overlay inferior para transição suave com a próxima seção */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, #0d0019 100%)",
          }}
        />
      </div>

      {/* ── Partículas decorativas (pseudo-stars) ─────────────────────── */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width:  `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top:    `${Math.random() * 100}%`,
              left:   `${Math.random() * 100}%`,
              background:
                i % 3 === 0
                  ? "rgba(232,170,26,0.6)"
                  : i % 3 === 1
                  ? "rgba(133,51,240,0.5)"
                  : "rgba(255,255,255,0.3)",
              boxShadow:
                i % 3 === 0
                  ? "0 0 6px rgba(232,170,26,0.8)"
                  : "0 0 4px rgba(133,51,240,0.6)",
              animation: `float ${4 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* ── Conteúdo Principal ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-16">

        {/* Selo / Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[rgba(232,170,26,0.35)] bg-[rgba(232,170,26,0.1)] mb-9 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="w-2 h-2 rounded-full bg-[#e8aa1a] shadow-[0_0_7px_rgba(232,170,26,0.9)]" />
          <span className="text-sm sm:text-base font-bold tracking-[0.2em] text-[#e8aa1a] uppercase">
            3º Edição · 2026
          </span>
        </div>

        {/* Logo / Título Principal */}
        <h1 className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {/* Texto oculto para SEO */}
          <span className="sr-only">3º Congresso de Direito Unicesumar</span>

          {/* Logo imagem — flutuante com sombras em camadas */}
          <div
            className="relative w-full max-w-5xl mx-auto mb-2 rounded-3xl overflow-hidden"
            style={{
              animation: "heroFloat 4s ease-in-out infinite",
              /* Sombra inferior simula elevação sobre a superfície */
              filter:
                "drop-shadow(0 40px 30px rgba(0,0,0,0.55))" +
                " drop-shadow(0 0 40px rgba(232,170,26,0.35))" +
                " drop-shadow(0 0 80px rgba(133,51,240,0.2))",
            }}
          >
            <Image
              src="/images/logo-3cdu.png"
              alt="3º Congresso de Direito Unicesumar — Logo"
              width={1100}
              height={440}
              className="w-full h-auto"
              style={{ mixBlendMode: "screen" }}
              priority
            />
          </div>
        </h1>

        {/* Keyframe de flutuação específico para o hero */}
        <style>{`
          @keyframes heroFloat {
            0%, 100% { transform: translateY(0px);   }
            50%       { transform: translateY(-14px); }
          }
        `}</style>

        {/* Subtítulo */}
        <p
          className="text-lg sm:text-xl md:text-2xl text-[#c299ff] font-light max-w-2xl mx-auto mb-4 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          O maior evento jurídico do Paraná.
        </p>
        <p
          className="text-base sm:text-lg text-[#a399b8] font-light max-w-xl mx-auto mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          Palestrantes de excelência, debates transformadores e networking de alto nível.
        </p>

        {/* Detalhes do Evento */}
        <div
          className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.55s" }}
        >
          {[
            { icon: "📅", label: "Data", value: "Em breve" },
            { icon: "📍", label: "Local", value: "Maringá · PR" },
            { icon: "🏆", label: "Edição", value: "3º - 2026" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 px-7 py-4 rounded-2xl glass border-gold-glow"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="text-left">
                <p className="text-xs text-[#a399b8] uppercase tracking-widest font-semibold">
                  {item.label}
                </p>
                <p className="text-lg md:text-xl text-white font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center animate-fade-in-up"
          style={{ animationDelay: "0.65s" }}
        >
          {/* Botão Primário: Ingresso */}
          <Link
            href="https://www.even3.com.br/3cdu/"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-cta-primary"
            className="btn-gold w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold tracking-wide animate-glow-pulse"
          >
            <span>Garantir Meu Ingresso</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>

          {/* Botão Secundário: Editais */}
          <Link
            href="#"
            id="hero-cta-editais"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.4)] transition-all duration-300 backdrop-blur-sm"
          >
            <span>Acessar Editais</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </Link>

          {/* Botão Terciário: Galeria */}
          <Link
            href="#galeria-preview"
            id="hero-cta-gallery"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-[rgba(133,51,240,0.25)] border border-[rgba(163,102,255,0.6)] shadow-[0_0_15px_rgba(133,51,240,0.4)] hover:bg-[rgba(133,51,240,0.45)] hover:border-[rgba(163,102,255,1)] hover:shadow-[0_0_25px_rgba(133,51,240,0.6)] transition-all duration-300 backdrop-blur-sm"
          >
            <span>Ver Galeria</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </Link>
        </div>
      </div>


    </section>
  );
}
