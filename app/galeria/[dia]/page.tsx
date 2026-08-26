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

  // Passa as URLs pelo proxy de cache do Worker (ver worker/index.js) em vez
  // do Supabase direto. Se o dia ainda não tem fotos publicadas, retorna uma
  // lista vazia — a página mostra o estado "Em breve..." nesse caso, sem
  // recorrer a fotos de exemplo (evita mostrar imagens genéricas para quem
  // está acompanhando o evento de verdade).
  return (data ?? []).map((photo) => ({
    ...photo,
    thumbnail_url: toProxiedUrl(photo.thumbnail_url),
    watermarked_url: toProxiedUrl(photo.watermarked_url),
  }));
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
        <p className="text-xs text-[#a399b8] mb-3 animate-fade-in">
          Clique no dia que quer ver as fotos para carregar todas
        </p>
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
          /* Estado "Em breve..." */
          <div className="flex flex-col items-center justify-center py-32 gap-8 text-center animate-fade-in-up">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-glow-pulse"
                style={{
                  background:
                    "radial-gradient(circle, #e8aa1a 0%, rgba(232,170,26,0) 70%)",
                }}
              />
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center glass border-gold-glow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.3}
                  stroke="#e8aa1a"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
            </div>

            <div className="max-w-md">
              <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-3">
                3CDU · Dia {diaNum}
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                <span className="text-gold-glow">Em breve...</span>
              </h2>
              <p className="text-[#a399b8] text-base leading-relaxed">
                As fotos do Dia {diaNum} estão sendo preparadas com todo carinho
                e chegam aqui assim que o processamento terminar. Volte daqui a
                pouco!
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
