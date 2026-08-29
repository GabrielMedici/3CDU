// Publica fotos já convertidas (saída de convert-raw.mjs): sobe display+thumb
// direto pro bucket R2 (é quem realmente serve as fotos, via worker/index.js)
// e cria a linha na tabela `photos` do Supabase — sem precisar do painel
// /admin/upload nem de nenhuma Edge Function.
//
// Antes fazia upload pro Supabase Storage também, mas isso duplicava os
// arquivos (Storage + R2) e ia estourar o 1GB grátis do Supabase à toa, já
// que o Storage não serve mais tráfego de visitante nenhum — só o R2. A URL
// gravada no banco continua no MESMO formato de antes (prefixo
// /storage/v1/object/public/<bucket>/) mesmo sem o arquivo existir de fato
// lá, porque é só isso que o proxy do Worker (lib/imageProxy.ts) usa pra
// montar o caminho /img/<...> — o Worker busca o bytes no R2, não no Storage.
//
// Precisa de um .env na raiz do projeto com:
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=xxxx   (Settings → API → service_role, NÃO a anon key)
//   SUPABASE_PHOTOS_BUCKET=photos    (opcional, padrão "photos" — só pro formato da URL)
//   R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET
//
// Uso:
//   node --env-file=.env scripts/publish.mjs --dia 1 "<pasta convertidas>"
//   npm run publish -- --dia 1 "<pasta convertidas>"
//
// É seguro rodar de novo na mesma pasta: fotos já publicadas (mesmo nome de
// arquivo, mesmo dia) são puladas, então dá para rodar a cada leva nova de fotos.
//
// Use --force para reenviar TUDO de novo mesmo o que já foi publicado (ex:
// depois de trocar a marca d'água ou reprocessar o lote inteiro) — sobrescreve
// os arquivos no R2 sem duplicar linha na tabela.

import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { readdir, readFile } from "fs/promises";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || "photos"; // só define o formato da URL gravada no banco

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Crie um .env na raiz do projeto (veja o topo deste arquivo) e rode com:\n" +
      "  node --env-file=.env scripts/publish.mjs --dia 1 \"<pasta convertidas>\""
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const diaIdx = args.indexOf("--dia");
const dia = diaIdx !== -1 ? Number(args[diaIdx + 1]) : null;
const force = args.includes("--force");
const inputDir = args.filter((a, i) => a !== "--dia" && args[i - 1] !== "--dia" && a !== "--force")[0];

if (!dia || ![1, 2, 3].includes(dia) || !inputDir) {
  console.error('Uso: node --env-file=.env scripts/publish.mjs --dia <1|2|3> "<pasta convertidas>"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  // Sem timeout, uma conexão travada trava o processo inteiro indefinidamente
  // (visto na prática publicando o Dia 3) — com timeout ela vira um erro
  // normal, cai no catch do loop e a foto pode ser reenviada depois.
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 10_000,
    requestTimeout: 30_000,
  }),
  maxAttempts: 3,
});

async function uploadOne(localPath, storagePath) {
  const fileBuf = await readFile(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: storagePath,
      Body: fileBuf,
      ContentType: "image/jpeg",
    })
  );
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

// supabase-js não tem timeout embutido — uma conexão travada trava o processo
// inteiro indefinidamente (visto na prática publicando o Dia 3). Com timeout
// vira um erro normal, cai no catch do loop, e a foto pode ser reenviada depois.
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout (${ms}ms) em ${label}`)), ms)),
  ]);
}

async function alreadyPublished(thumbnailUrl) {
  const { data, error } = await withTimeout(
    supabase.from("photos").select("id").eq("thumbnail_url", thumbnailUrl).limit(1),
    15_000,
    "alreadyPublished"
  );
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function main() {
  const displayDir = path.join(inputDir, "display");
  const thumbDir = path.join(inputDir, "thumb");
  const files = (await readdir(displayDir)).filter((f) => f.toLowerCase().endsWith(".jpg"));

  if (files.length === 0) {
    console.log("Nenhuma foto encontrada em", displayDir);
    return;
  }

  console.log(`Publicando ${files.length} foto(s) do Dia ${dia} no R2...`);

  let published = 0;
  let overwritten = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, file] of files.entries()) {
    const baseName = path.basename(file, ".jpg");
    const displayLocal = path.join(displayDir, file);
    const thumbLocal = path.join(thumbDir, file);

    try {
      const thumbnailUrl = await uploadOne(thumbLocal, `dia_${dia}/thumb/${baseName}.jpg`);
      const exists = await alreadyPublished(thumbnailUrl);

      if (exists && !force) {
        skipped++;
        process.stdout.write(`\r[${i + 1}/${files.length}] ${file} já publicada, pulando          `);
        continue;
      }

      const watermarkedUrl = await uploadOne(displayLocal, `dia_${dia}/display/${baseName}.jpg`);

      if (exists) {
        // --force: arquivo já sobrescrito no R2 acima, linha do banco
        // continua igual (mesma URL, não precisa mexer na tabela).
        overwritten++;
        process.stdout.write(`\r[${i + 1}/${files.length}] ${file} sobrescrita          `);
        continue;
      }

      const { error } = await withTimeout(
        supabase.from("photos").insert({
          dia_evento: dia,
          thumbnail_url: thumbnailUrl,
          watermarked_url: watermarkedUrl,
        }),
        15_000,
        "insert"
      );
      if (error) throw error;

      published++;
      process.stdout.write(`\r[${i + 1}/${files.length}] ${file} publicada          `);
    } catch (err) {
      failed++;
      console.log(`\n[${i + 1}/${files.length}] ${file} FALHOU: ${err.message}`);
    }
  }

  console.log("\n\n=== Resumo ===");
  console.log(`Publicadas (novas): ${published}  |  Sobrescritas: ${overwritten}  |  Puladas: ${skipped}  |  Falharam: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
