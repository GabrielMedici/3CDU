import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const runtime = "edge";

// ── Tipos ─────────────────────────────────────────────────────────────────
interface Photo {
  id: string;
  dia_evento: number;
  thumbnail_url: string | null;
  watermarked_url: string | null;
  created_at: string;
}

// ── Parâmetros da rota dinâmica ───────────────────────────────────────────
interface PageProps {
  params: Promise<{ dia: string }>;
}

// ── Busca Server-Side (RSC) ───────────────────────────────────────────────
async function getPhotos(dia: number): Promise<Photo[]> {
  let data: Photo[] | null = null;
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy"
    );

    const result = await supabase
      .from("photos")
      .select("id, dia_evento, thumbnail_url, watermarked_url, created_at")
      .eq("dia_evento", dia)
      .order("created_at", { ascending: false });
      
    data = result.data;
  } catch (error) {
    // Falha silenciosa no modo dev (ex: sem internet ou sem chaves .env)
    // para não quebrar a tela e ir direto para o Mock.
  }

  // Se retornou dados válidos do Supabase, usamos.
  if (data && data.length > 0) {
    return data;
  }

  // ── MOCK DATA PARA SIMULAÇÃO DA GALERIA ──
  const MOCK_PHOTOS: Record<number, Photo[]> = {
    1: [
      { id: "mock-1-1", dia_evento: 1, thumbnail_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-1-2", dia_evento: 1, thumbnail_url: "https://images.unsplash.com/photo-1475721025505-1113afabc169?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1475721025505-1113afabc169?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-1-3", dia_evento: 1, thumbnail_url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-1-4", dia_evento: 1, thumbnail_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1600&q=90", created_at: new Date().toISOString() },
    ],
    2: [
      { id: "mock-2-1", dia_evento: 2, thumbnail_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-2-2", dia_evento: 2, thumbnail_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-2-3", dia_evento: 2, thumbnail_url: "https://images.unsplash.com/photo-1560523159-4a9692d222f9?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1560523159-4a9692d222f9?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-2-4", dia_evento: 2, thumbnail_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=90", created_at: new Date().toISOString() },
    ],
    3: [
      { id: "mock-3-1", dia_evento: 3, thumbnail_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-3-2", dia_evento: 3, thumbnail_url: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-3-3", dia_evento: 3, thumbnail_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=90", created_at: new Date().toISOString() },
      { id: "mock-3-4", dia_evento: 3, thumbnail_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", watermarked_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=90", created_at: new Date().toISOString() },
    ],
  };

  return MOCK_PHOTOS[dia] || [];
}

// ── Metadados dinâmicos ───────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps) {
  const { dia } = await params;
  return {
    title: `Galeria — Dia ${dia} | 3º Congresso de Direito Unicesumar`,
    description: `Reviva os melhores momentos do Dia ${dia} do 3CDU. Faça o download das fotos em alta resolução com marca d'água oficial.`,
  };
}

// ── Componente da Página (Server Component) ───────────────────────────────
export default async function GaleriaPage({ params }: PageProps) {
  const { dia } = await params;
  const diaNum = Math.min(3, Math.max(1, parseInt(dia) || 1));
  const photos = await getPhotos(diaNum);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0d0019" }}>
      <Navbar />

      {/* ── Header da Galeria ───────────────────────────────────────────── */}
      <div
        className="relative pt-32 pb-16 px-6 text-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(43,0,87,0.8) 0%, transparent 80%)",
        }}
      >
        <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-3 animate-fade-in">
          3CDU · Memórias
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 animate-fade-in-up">
          Galeria de Fotos{" "}
          <span className="text-gold-glow">— Dia {diaNum}</span>
        </h1>
        <p className="text-[#a399b8] text-base max-w-xl mx-auto mb-8 animate-fade-in-up">
          Reviva cada momento. Baixe as fotos com a marca d&apos;água oficial do 3CDU.
        </p>

        {/* Seletores de Dia */}
        <div className="flex justify-center gap-3 animate-fade-in">
          {[1, 2, 3].map((d) => (
            <Link
              key={d}
              href={`/galeria/${d}`}
              id={`galeria-dia-${d}-btn`}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                d === diaNum
                  ? "btn-gold shadow-gold"
                  : "border border-[rgba(232,170,26,0.3)] text-[#c299ff] hover:border-[rgba(232,170,26,0.6)] hover:text-white hover:bg-[rgba(232,170,26,0.08)]"
              }`}
            >
              Dia {d}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Grid de Fotos ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        {photos.length === 0 ? (
          /* Estado vazio */
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "rgba(43,0,87,0.5)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="rgba(163,102,255,0.6)"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg mb-2">
                Nenhuma foto disponível ainda
              </p>
              <p className="text-[#a399b8] text-sm">
                As fotos do Dia {diaNum} aparecerão aqui após o processamento.
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full border border-[rgba(232,170,26,0.35)] text-[#e8aa1a] text-sm font-semibold hover:bg-[rgba(232,170,26,0.08)] transition-all duration-200"
            >
              ← Voltar ao Início
            </Link>
          </div>
        ) : (
          <>
            {/* Contador */}
            <p className="text-sm text-[#a399b8] mb-8 font-medium">
              {photos.length}{" "}
              {photos.length === 1 ? "foto disponível" : "fotos disponíveis"}
            </p>

            {/* Grid Masonry-like */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  id={`photo-card-${photo.id}`}
                  className="photo-card group"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square overflow-hidden">
                    {photo.thumbnail_url ? (
                      <Image
                        src={photo.thumbnail_url}
                        alt={`Foto ${idx + 1} — Dia ${diaNum} do 3CDU`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading={idx < 10 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[rgba(43,0,87,0.5)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="rgba(163,102,255,0.4)" className="w-10 h-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                        </svg>
                      </div>
                    )}

                    {/* Overlay com botão de download (Visível no mobile, Hover no Desktop) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.4)] to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3 sm:p-4">
                      {photo.watermarked_url ? (
                        <a
                          href={photo.watermarked_url}
                          download={`3CDU_dia${diaNum}_foto${idx + 1}.jpg`}
                          id={`download-btn-${photo.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[rgba(232,170,26,0.15)] border border-[rgba(232,170,26,0.4)] text-[#e8aa1a] text-xs font-bold active:bg-[rgba(232,170,26,0.4)] md:hover:bg-[rgba(232,170,26,0.3)] md:hover:border-[rgba(232,170,26,0.7)] transition-all duration-200 backdrop-blur-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                          </svg>
                          Baixar
                        </a>
                      ) : (
                        <p className="text-xs text-[#a399b8] text-center w-full">
                          Processando...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
