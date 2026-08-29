// Pré-aquece o cache de borda da Cloudflare pra fotos recém-publicadas,
// visitando a URL de cada uma (thumb + display) pelo domínio ao vivo. Assim,
// a primeira pessoa que abrir a galeria depois de uma publicação nova não é
// quem "paga" o cache miss (busca no R2 + gravação no cache) — isso já
// aconteceu antes, de propósito, rodando esse script.
//
// Não é obrigatório rodar (o cache aquece sozinho conforme visitantes veem
// as fotos), mas é recomendado logo depois de publicar um lote novo, pra
// evitar um primeiro carregamento mais lento pra quem chegar primeiro.
//
// Uso:
//   node --env-file=.env scripts/warm-cache.mjs --dia 2 "<pasta convertidas>"

const DOMAIN = process.env.WARM_CACHE_DOMAIN || "https://direitocdu.com";
const CONCURRENCY = 10;

import { readdir } from "fs/promises";
import path from "path";

const args = process.argv.slice(2);
const diaIdx = args.indexOf("--dia");
const dia = diaIdx !== -1 ? Number(args[diaIdx + 1]) : null;
const inputDir = args.filter((a, i) => a !== "--dia" && args[i - 1] !== "--dia")[0];

if (!dia || ![1, 2, 3].includes(dia) || !inputDir) {
  console.error('Uso: node --env-file=.env scripts/warm-cache.mjs --dia <1|2|3> "<pasta convertidas>"');
  process.exit(1);
}

async function main() {
  const displayDir = path.join(inputDir, "display");
  const files = (await readdir(displayDir)).filter((f) => f.toLowerCase().endsWith(".jpg"));

  if (files.length === 0) {
    console.log("Nenhuma foto encontrada em", displayDir);
    return;
  }

  const urls = files.flatMap((f) => [
    `${DOMAIN}/img/dia_${dia}/thumb/${f}`,
    `${DOMAIN}/img/dia_${dia}/display/${f}`,
  ]);

  console.log(`Aquecendo ${urls.length} URL(s) (${files.length} fotos, thumb+display) em ${DOMAIN}...`);

  let done = 0;
  let failed = 0;
  let idx = 0;

  async function worker() {
    while (idx < urls.length) {
      const url = urls[idx++];
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        await resp.arrayBuffer(); // consome o corpo pra garantir que o cache.put no Worker termina
        done++;
      } catch (err) {
        failed++;
        console.log(`FALHOU: ${url} -> ${err}`);
      }
      if ((done + failed) % 50 === 0 || done + failed === urls.length) {
        console.log(`[${done + failed}/${urls.length}] aquecidas`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log("\n=== Resumo ===");
  console.log(`Aquecidas: ${done}  |  Falharam: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
