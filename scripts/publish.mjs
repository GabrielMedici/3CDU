// Publica fotos já convertidas (saída de convert-raw.mjs) direto no Supabase:
// sobe display+thumb pro Storage e cria a linha na tabela `photos` — sem
// precisar do painel /admin/upload nem de nenhuma Edge Function.
//
// Precisa de um .env na raiz do projeto com:
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=xxxx   (Settings → API → service_role, NÃO a anon key)
//   SUPABASE_PHOTOS_BUCKET=photos    (opcional, padrão "photos")
//
// Uso:
//   node --env-file=.env scripts/publish.mjs --dia 1 "<pasta convertidas>"
//   npm run publish -- --dia 1 "<pasta convertidas>"
//
// É seguro rodar de novo na mesma pasta: fotos já publicadas (mesmo nome de
// arquivo, mesmo dia) são puladas, então dá pra rodar a cada leva nova de fotos.

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "fs/promises";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || "photos";

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
const inputDir = args.filter((a, i) => a !== "--dia" && args[i - 1] !== "--dia")[0];

if (!dia || ![1, 2, 3].includes(dia) || !inputDir) {
  console.error('Uso: node --env-file=.env scripts/publish.mjs --dia <1|2|3> "<pasta convertidas>"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" não existe, criando (público)...`);
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
  }
}

async function uploadOne(localPath, storagePath) {
  const fileBuf = await readFile(localPath);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuf, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function alreadyPublished(thumbnailUrl) {
  const { data, error } = await supabase
    .from("photos")
    .select("id")
    .eq("thumbnail_url", thumbnailUrl)
    .limit(1);
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

  await ensureBucket();
  console.log(`Publicando ${files.length} foto(s) do Dia ${dia}...`);

  let published = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, file] of files.entries()) {
    const baseName = path.basename(file, ".jpg");
    const displayLocal = path.join(displayDir, file);
    const thumbLocal = path.join(thumbDir, file);

    try {
      const thumbnailUrl = await uploadOne(thumbLocal, `dia_${dia}/thumb/${baseName}.jpg`);

      if (await alreadyPublished(thumbnailUrl)) {
        skipped++;
        process.stdout.write(`\r[${i + 1}/${files.length}] ${file} já publicada, pulando          `);
        continue;
      }

      const watermarkedUrl = await uploadOne(displayLocal, `dia_${dia}/display/${baseName}.jpg`);

      const { error } = await supabase.from("photos").insert({
        dia_evento: dia,
        thumbnail_url: thumbnailUrl,
        watermarked_url: watermarkedUrl,
      });
      if (error) throw error;

      published++;
      process.stdout.write(`\r[${i + 1}/${files.length}] ${file} publicada          `);
    } catch (err) {
      failed++;
      console.log(`\n[${i + 1}/${files.length}] ${file} FALHOU: ${err.message}`);
    }
  }

  console.log("\n\n=== Resumo ===");
  console.log(`Publicadas: ${published}  |  Já existiam: ${skipped}  |  Falharam: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
