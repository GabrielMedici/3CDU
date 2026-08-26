"use client";

import Image from "next/image";

/* ── Dados dos palestrantes ─────────────────────────────────────────────────
   Substitua os campos pelos dados reais. Para fotos, coloque os arquivos em
   public/images/speakers/ e atualize o campo `photo`.
   ────────────────────────────────────────────────────────────────────────── */
const SPEAKERS = [
  {
    id: 1,
    name: "Pedro Lenza",
    title: "Palestra em 25 de Agosto",
    area: "Direito Constitucional",
    photo: "/images/speakers/pedro-lenza.jpg",
    initials: "PL",
  },
  {
    id: 2,
    name: "Rogério Greco",
    title: "Palestra em 26 de Agosto",
    area: "Direito Penal",
    photo: "/images/speakers/rogerio-greco.jpg",
    initials: "RG",
  },
  {
    id: 3,
    name: "Pedro Barretto",
    title: "Palestra em 26 de Agosto",
    area: "Direito",
    photo: "/images/speakers/pedro-barretto.jpg",
    initials: "PB",
  },
  {
    id: 4,
    name: "Bruno Zampier",
    title: "Palestra em 27 de Agosto",
    area: "Direito",
    photo: "/images/speakers/bruno-zampier.jpg",
    initials: "BZ",
  },
];

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
      className="w-full rounded-2xl overflow-hidden group cursor-default select-none"
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
      {/* Fotos reais vêm de flyers com nome/data já gravados na parte inferior da
          imagem; usamos um recorte mais baixo (em vez de aspect-square) pra cortar
          essa faixa de texto e evitar duplicar com o nome exibido abaixo do card. */}
      <div className={`relative w-full overflow-hidden ${photo ? "aspect-[4/3]" : "aspect-square"}`}>
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
        {/* Badge de área — fotos reais já vêm com o cabeçalho "3°CDU" gravado no
            topo, então o selo aqui em cima entraria em conflito visual com ele */}
        {!photo && (
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
        )}
      </div>

      {/* Informações */}
      <div className="px-5 py-5">
        <h3 className="text-lg font-bold text-white leading-snug mb-1.5 group-hover:text-[#f5c842] transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-[#a399b8] leading-relaxed">{title}</p>

        {/* Linha dourada decorativa */}
        <div
          className="mt-4 h-px w-10 rounded-full transition-all duration-300 group-hover:w-full"
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

      {/* ── Grid estático ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {SPEAKERS.map((speaker) => (
            <SpeakerCard key={speaker.id} {...speaker} />
          ))}
        </div>
      </div>
    </section>
  );
}
