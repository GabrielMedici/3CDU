import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { toProxiedUrl } from "@/lib/imageProxy";
import RetryImage from "@/components/RetryImage";

interface PreviewPhoto {
  id: string;
  dia_evento: number;
  thumbnail_url: string | null;
}

async function getPreviewPhotos(): Promise<PreviewPhoto[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy"
    );

    // Pega uma leva recente (não precisa da tabela inteira só pra uma prévia)
    // e embaralha aqui — é "aleatório" a cada build, o suficiente pra uma prévia.
    const { data } = await supabase
      .from("photos")
      .select("id, dia_evento, thumbnail_url")
      .order("created_at", { ascending: false })
      .limit(60);

    if (!data || data.length === 0) return [];

    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10).map((photo) => ({
      ...photo,
      thumbnail_url: toProxiedUrl(photo.thumbnail_url),
    }));
  } catch {
    return [];
  }
}

export default async function GalleryPreview() {
  const photos = await getPreviewPhotos();

  if (photos.length === 0) {
    return (
      <div className="glass border-gold-glow rounded-3xl p-12 text-center">
        <p className="text-[#a399b8] text-lg">
          As fotos do evento aparecerão aqui após o congresso.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {photos.map((photo) => (
        <Link
          key={photo.id}
          href={`/galeria/${photo.dia_evento}`}
          className="relative aspect-square rounded-xl overflow-hidden group"
        >
          {photo.thumbnail_url && (
            <RetryImage
              src={photo.thumbnail_url}
              alt={`Prévia da galeria — Dia ${photo.dia_evento}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Dia {photo.dia_evento}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
