// Organiza os RAWs já convertidos/publicados em lotes de 50 dentro de uploads/,
// pra facilitar upload manual pra nuvem (Drive/Mega costumam limitar por lote).
// Move os arquivos (não copia) pra não dobrar o uso de disco.
//
// Uso: node scripts/organize-uploads.mjs

import { readdir, mkdir, rename } from "fs/promises";
import path from "path";

const RAW_EXT = [".cr2", ".cr3", ".nef", ".arw", ".raf", ".dng"];
const BATCH_SIZE = 50;
const root = process.cwd();
const uploadsDir = path.join(root, "uploads");

const groups = [
  { dia: "dia_1", sources: ["fotos_dia_1"] },
  { dia: "dia_2", sources: ["fotos_dia_2", "Fotos_Dia_2.1"] },
];

async function organizeGroup(dia, sources) {
  let allFiles = [];
  for (const src of sources) {
    const srcPath = path.join(root, src);
    let entries = [];
    try {
      entries = await readdir(srcPath);
    } catch {
      continue;
    }
    const raws = entries
      .filter((f) => RAW_EXT.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => ({ src, name: f }));
    allFiles = allFiles.concat(raws);
  }

  if (allFiles.length === 0) {
    console.log(`${dia}: nenhum RAW encontrado, pulando.`);
    return;
  }

  const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE);
  console.log(`${dia}: ${allFiles.length} arquivo(s) -> ${totalBatches} lote(s) de até ${BATCH_SIZE}`);

  for (let b = 0; b < totalBatches; b++) {
    const batchFiles = allFiles.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const loteDir = path.join(uploadsDir, dia, `lote_${String(b + 1).padStart(2, "0")}`);
    await mkdir(loteDir, { recursive: true });
    for (const { src, name } of batchFiles) {
      const from = path.join(root, src, name);
      const to = path.join(loteDir, name);
      await rename(from, to);
    }
    console.log(`  lote_${String(b + 1).padStart(2, "0")}: ${batchFiles.length} arquivo(s)`);
  }
}

async function main() {
  await mkdir(uploadsDir, { recursive: true });
  for (const { dia, sources } of groups) {
    await organizeGroup(dia, sources);
  }
  console.log("\nPronto.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
