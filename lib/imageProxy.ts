// Reescreve URLs públicas do Supabase Storage para passar pelo proxy de
// cache do Worker (worker/index.js, rota /img/*) em vez de bater direto no
// Supabase. Isso tira a banda das fotos do free tier do Supabase e coloca
// no free tier do Cloudflare Workers (que cacheia na borda — a mesma foto
// só sai do Supabase uma vez por região, não uma vez por visitante).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const PHOTOS_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PHOTOS_BUCKET || "photos";
const STORAGE_PREFIX = `${supabaseUrl}/storage/v1/object/public/${PHOTOS_BUCKET}/`;

export function toProxiedUrl(url: string | null): string | null {
  if (!url) return url;
  if (!url.startsWith(STORAGE_PREFIX)) return url; // ex: mocks do Unsplash em dev
  return `/img/${url.slice(STORAGE_PREFIX.length)}`;
}
