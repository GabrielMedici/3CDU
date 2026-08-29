// Worker que fica na frente do site estático (servido via [assets] no
// wrangler.toml) e adiciona uma rota /img/<caminho> que faz proxy + cache de
// borda das fotos.
//
// Por que: a galeria carrega as fotos por essa rota em vez de direto da
// origem, e o cache aqui evita repetir a busca na origem pras próximas
// pessoas que verem a mesma foto (Workers free = ilimitado para assets
// estáticos).
//
// Origem das fotos: primeiro tenta o bucket R2 (binding PHOTOS_R2). Se o
// objeto ainda não estiver lá (migração incompleta, foto recém-publicada
// antes de rodar o script de cópia, binding indisponível), cai pro Supabase
// Storage, exatamente como funcionava antes de existir o R2 — nenhuma foto
// deixa de carregar por causa da migração.
//
// Qualquer rota que NÃO seja /img/* nunca passa por aqui — o Cloudflare já
// serve os arquivos estáticos direto, sem invocar este Worker.

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias — mais que o evento inteiro

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/img/")) {
      return env.ASSETS.fetch(request);
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const objectPath = url.pathname.slice("/img/".length);

    let body = null;
    let contentType = "image/jpeg";

    if (env.PHOTOS_R2) {
      const object = await env.PHOTOS_R2.get(objectPath);
      if (object) {
        body = object.body;
        contentType = object.httpMetadata?.contentType || contentType;
      }
    }

    if (!body) {
      const bucket = env.PHOTOS_BUCKET || "photos";
      const originUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
      const originResponse = await fetch(originUrl);
      if (!originResponse.ok) {
        return originResponse;
      }
      body = originResponse.body;
      contentType = originResponse.headers.get("content-type") || contentType;
    }

    const response = new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}, immutable`,
      },
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};
