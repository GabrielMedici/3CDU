import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PhotoGallery from "@/components/PhotoGallery";
import { toProxiedUrl } from "@/lib/imageProxy";

export function generateStaticParams() {
  return [{ dia: "1" }, { dia: "2" }, { dia: "3" }];
}

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

    // O PostgREST do Supabase limita cada resposta a no máximo 1000 linhas
    // (max_rows), então com >1000 fotos por dia precisamos paginar com
    // .range() até uma página vir incompleta.
    const PAGE_SIZE = 1000;
    const pages: Photo[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const result = await supabase
        .from("photos")
        .select("id, dia_evento, thumbnail_url, watermarked_url, created_at")
        .eq("dia_evento", dia)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (result.error) {
        console.error(`[getPhotos] Supabase retornou erro pro dia ${dia}:`, result.error);
        break;
      }
      const page = result.data ?? [];
      pages.push(...page);
      if (page.length < PAGE_SIZE) break;
    }
    data = pages;
  } catch (error) {
    // Falha silenciosa no modo dev (ex: sem internet ou sem chaves .env)
    // para não quebrar a tela e ir direto para o Mock.
  }

  // Se retornou dados válidos do Supabase, usamos — passando as URLs pelo
  // proxy de cache do Worker (ver worker/index.js) em vez do Supabase direto.
  if (data && data.length > 0) {
    return data.map((photo) => ({
      ...photo,
      thumbnail_url: toProxiedUrl(photo.thumbnail_url),
      watermarked_url: toProxiedUrl(photo.watermarked_url),
    }));
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

            <PhotoGallery photos={photos} diaNum={diaNum} />
          </>
        )}
      </section>
    </main>
  );
}
