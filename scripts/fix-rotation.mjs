// Gira fotos específicas que saíram de lado (sem etiqueta EXIF pra detectar
// automaticamente) e reenvia pro Supabase, sobrescrevendo o arquivo no mesmo
// caminho — não precisa mexer na tabela `photos` nem publicar de novo, porque
// a URL pública não muda.
//
// Uso:
//   node --env-file=.env scripts/fix-rotation.mjs --dia 1 --graus 90 "<pasta convertidas>" _MG_0512 _MG_0530
//
// --graus aceita 90 (sentido horário), 180 ou 270 (equivalente a 90 anti-horário).
// Pode passar quantos nomes de arquivo quiser no final (sem extensão).

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import path from "path";
import { readFile } from "fs/promises";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || "photos";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Rode com: node --env-file=.env scripts/fix-rotation.mjs ...");
  process.exit(1);
}

const args = process.argv.slice(2);
const diaIdx = args.indexOf("--dia");
const grausIdx = args.indexOf("--graus");
const dia = diaIdx !== -1 ? Number(args[diaIdx + 1]) : null;
const graus = grausIdx !== -1 ? Number(args[grausIdx + 1]) : null;
const rest = args.filter((a, i) => {
  if (a === "--dia" || a === "--graus") return false;
  if (args[i - 1] === "--dia" || args[i - 1] === "--graus") return false;
  return true;
});
const convertidasDir = rest[0];
const baseNames = rest.slice(1);

if (!dia || ![1, 2, 3].includes(dia) || ![90, 180, 270].includes(graus) || !convertidasDir || baseNames.length === 0) {
  console.error('Uso: node --env-file=.env scripts/fix-rotation.mjs --dia <1|2|3> --graus <90|180|270> "<pasta convertidas>" arquivo1 arquivo2 ...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixOne(baseName) {
  const displayPath = path.join(convertidasDir, "display", `${baseName}.jpg`);
  const thumbPath = path.join(convertidasDir, "thumb", `${baseName}.jpg`);

  const displayBuf = await sharp(await readFile(displayPath)).rotate(graus).jpeg({ quality: 82 }).toBuffer();
  const thumbBuf = await sharp(await readFile(thumbPath)).rotate(graus).jpeg({ quality: 75 }).toBuffer();

  // Sobrescreve local também, pra ficar consistente se rodar de novo
  await sharp(displayBuf).toFile(displayPath);
  await sharp(thumbBuf).toFile(thumbPath);

  const { error: e1 } = await supabase.storage
    .from(BUCKET)
    .upload(`dia_${dia}/display/${baseName}.jpg`, displayBuf, { contentType: "image/jpeg", upsert: true });
  if (e1) throw e1;

  const { error: e2 } = await supabase.storage
    .from(BUCKET)
    .upload(`dia_${dia}/thumb/${baseName}.jpg`, thumbBuf, { contentType: "image/jpeg", upsert: true });
  if (e2) throw e2;
}

async function main() {
  console.log(`Girando ${baseNames.length} foto(s) em ${graus}° e reenviando pro Supabase (Dia ${dia})...`);
  for (const baseName of baseNames) {
    try {
      await fixOne(baseName);
      console.log(`✓ ${baseName}`);
    } catch (err) {
      console.log(`✗ ${baseName} FALHOU: ${err.message}`);
    }
  }
  console.log("\nPronto. Como a URL pública não muda, o site vai mostrar a versão corrigida no próximo build (a imagem em si não precisa de rebuild, mas o Cloudflare pode ter cacheado a versão antiga — dá um tempo ou limpe o cache se não atualizar).");
}

main();
