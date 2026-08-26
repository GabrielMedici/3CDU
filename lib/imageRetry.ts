// Se uma foto falhar ao carregar (ex: soluço passageiro do Worker/Supabase
// logo após um deploy, com o cache de borda ainda "frio"), tenta de novo
// sozinho algumas vezes em vez de deixar o ícone de imagem quebrada — sem o
// visitante precisar recarregar a página.
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 600;

export function handleImageRetry(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = e.currentTarget;
  const attempt = Number(img.dataset.retryCount || "0");
  if (attempt >= MAX_RETRIES) return; // desistiu — deixa o navegador mostrar o ícone padrão

  img.dataset.retryCount = String(attempt + 1);
  const baseSrc = img.dataset.baseSrc || img.src.replace(/[?&]__retry=\d+$/, "");
  img.dataset.baseSrc = baseSrc;

  setTimeout(() => {
    // Query string força um pedido novo (não serve um erro em cache) sem
    // afetar qual arquivo o proxy busca no Supabase.
    img.src = `${baseSrc}${baseSrc.includes("?") ? "&" : "?"}__retry=${attempt + 1}`;
  }, BASE_DELAY_MS * (attempt + 1));
}
