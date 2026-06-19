"use client";

import Image from "next/image";

/* ── Dados dos palestrantes ─────────────────────────────────────────────────
   Substitua os campos pelos dados reais. Para fotos, coloque os arquivos em
   public/images/speakers/ e atualize o campo `photo`.
   ────────────────────────────────────────────────────────────────────────── */
const SPEAKERS = [
  {
    id: 1,
    name: "Dr. Carlos Mendonça",
    title: "Ministro do STJ",
    area: "Direito Constitucional",
    photo: null,
    initials: "CM",
  },
  {
    id: 2,
    name: "Dra. Ana Paula Lira",
    title: "Desembargadora TJ-PR",
    area: "Direito Civil",
    photo: null,
    initials: "AL",
  },
  {
    id: 3,
    name: "Prof. Dr. Roberto Farias",
    title: "Professor Titular USP",
    area: "Direito Penal",
    photo: null,
    initials: "RF",
  },
  {
    id: 4,
    name: "Dra. Fernanda Costa",
    title: "Procuradora da República",
    area: "Direito Administrativo",
    photo: null,
    initials: "FC",
  },
  {
    id: 5,
    name: "Dr. Marcelo Zanetti",
    title: "Advogado Criminalista",
    area: "Direito Processual",
    photo: null,
    initials: "MZ",
  },
  {
    id: 6,
    name: "Dra. Juliana Braga",
    title: "Juíza Federal",
    area: "Direito Tributário",
    photo: null,
    initials: "JB",
  },
  {
    id: 7,
    name: "Prof. Dr. Henrique Luz",
    title: "Doutor em Direito — UFPR",
    area: "Direito Digital",
    photo: null,
    initials: "HL",
  },
  {
    id: 8,
    name: "Dra. Patrícia Moura",
    title: "Promotora de Justiça",
    area: "Direito da Família",
    photo: null,
    initials: "PM",
  },
];

// Duplica para criar o efeito de loop infinito sem salto
const TRACK = [...SPEAKERS, ...SPEAKERS];

/* ── Card Individual ────────────────────────────────────────────────────── */
function SpeakerCard({
  name,
  title,
  area,
  photo,
  initials,
}: (typeof SPEAKERS)[0]) {
  return (
    <div
      className="flex-shrink-0 w-56 rounded-2xl overflow-hidden group cursor-default select-none"
      style={{
        background:
          "linear-gradient(145deg, rgba(43,0,87,0.7) 0%, rgba(26,0,51,0.85) 100%)",
        border: "1px solid rgba(232,170,26,0.18)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px) scale(1.02)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 16px 40px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(232,170,26,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(232,170,26,0.18)";
      }}
    >
      {/* Foto / Avatar */}
      <div className="relative w-full aspect-square overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Placeholder avatar com iniciais */
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at 30% 30%, rgba(133,51,240,0.5) 0%, rgba(43,0,87,0.8) 60%, rgba(13,0,25,0.9) 100%)",
            }}
          >
            {/* Grade decorativa */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(232,170,26,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(232,170,26,0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Círculo de fundo */}
            <div
              className="relative z-10 w-36 h-36 rounded-full flex items-center justify-center text-5xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,170,26,0.08) 0%, rgba(133,51,240,0.1) 100%)",
                border: "1px solid rgba(232,170,26,0.2)",
                color: "rgba(232,170,26,0.9)",
                textShadow: "0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              {initials}
            </div>
          </div>
        )}
        {/* Gradiente inferior sobre a foto */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            background:
              "linear-gradient(to top, rgba(26,0,51,0.95) 0%, transparent 100%)",
          }}
        />
        {/* Badge de área */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-full"
            style={{
              background: "rgba(232,170,26,0.15)",
              border: "1px solid rgba(232,170,26,0.35)",
              color: "#e8aa1a",
            }}
          >
            {area}
          </span>
        </div>
      </div>

      {/* Informações */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-bold text-white leading-snug mb-1 group-hover:text-[#f5c842] transition-colors duration-300">
          {name}
        </h3>
        <p className="text-[11px] text-[#a399b8] leading-relaxed">{title}</p>

        {/* Linha dourada decorativa */}
        <div
          className="mt-3 h-px w-8 rounded-full transition-all duration-300 group-hover:w-full"
          style={{
            background:
              "linear-gradient(90deg, #e8aa1a 0%, rgba(232,170,26,0.2) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Componente Principal ───────────────────────────────────────────────── */
export default function SpeakersCarousel() {
  return (
    <section id="palestrantes" className="py-24 overflow-hidden">
      {/* Cabeçalho da seção */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-2">
              Confirmados
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Nossos{" "}
              <span
                style={{
                  color: "#e8aa1a",
                  textShadow:
                    "0 0 10px rgba(232,170,26,0.6), 0 0 25px rgba(232,170,26,0.3)",
                }}
              >
                Palestrantes
              </span>
            </h2>
          </div>
          <p className="text-sm text-[#a399b8] max-w-xs">
            Referências nacionais que vão transformar sua visão do Direito.
          </p>
        </div>
      </div>

      {/* ── Trilha de scroll infinito ──────────────────────────────────── */}
      {/*
        A `div.track` anima com translateX de 0 a -50% (metade = 1 cópia
        dos cards), criando loop perfeito. `animation-play-state: paused`
        ao hover do wrapper para.
      */}
      <div
        className="relative"
        style={
          {
            /* Máscara de gradiente nas bordas laterais */
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          } as React.CSSProperties
        }
        onMouseEnter={(e) => {
          const track = e.currentTarget.querySelector<HTMLDivElement>(".marquee-track");
          if (track) track.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          const track = e.currentTarget.querySelector<HTMLDivElement>(".marquee-track");
          if (track) track.style.animationPlayState = "running";
        }}
      >
        <div
          className="marquee-track flex gap-5"
          style={{
            width: "max-content",
            animation: "marqueeScroll 40s linear infinite",
            willChange: "transform",
          }}
        >
          {TRACK.map((speaker, idx) => (
            <SpeakerCard key={`${speaker.id}-${idx}`} {...speaker} />
          ))}
        </div>
      </div>

      {/* Keyframe injetado via style tag */}
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
