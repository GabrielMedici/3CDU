// Worker que fica na frente do site estático (servido via [assets] no
// wrangler.toml) e adiciona uma rota /img/<caminho> que faz proxy + cache de
// borda das fotos do Supabase Storage.
//
// Por que: a galeria carrega as fotos direto do Supabase, e o plano
// gratuito do Supabase só dá 10GB de banda/mês — pouco para um evento com
// milhares de visitantes vendo as mesmas fotos. Com esse proxy, a primeira
// requisição de cada foto por região busca no Supabase e guarda em cache na
// borda da Cloudflare (Workers free = ilimitado para assets estáticos, e o
// cache aqui evita repetir a busca no Supabase pras próximas pessoas).
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
    const bucket = env.PHOTOS_BUCKET || "photos";
    const originUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;

    const originResponse = await fetch(originUrl);
    if (!originResponse.ok) {
      return originResponse;
    }

    const response = new Response(originResponse.body, originResponse);
    response.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}, immutable`);

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};
