// Monta "folhas de contato" — mosaicos com várias miniaturas numeradas em
// uma imagem só — a partir de uma pasta de thumbs já convertidos. Serve
// pra revisar visualmente um lote grande de fotos MUITO mais rápido do que
// abrindo uma por uma no site (ex: procurar fotos giradas de lado).
//
// Uso:
//   node scripts/contact-sheet.mjs "<pasta>/convertidas/thumb" [pasta-de-saida]

import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import path from "path";

const inputDir = process.argv[2];
if (!inputDir) {
  console.error('Uso: node scripts/contact-sheet.mjs "<pasta>/convertidas/thumb" [pasta-de-saida]');
  process.exit(1);
}
const outputDir = process.argv[3] || path.join(path.dirname(inputDir), "contact-sheets");

const CELL = 260; // tamanho de cada miniatura no mosaico (quadrado)
const LABEL_H = 24; // faixa de legenda embaixo de cada miniatura
const COLS = 8;
const ROWS = 8; // 8x8 = 64 fotos por folha
const PER_SHEET = COLS * ROWS;

function labelSvg(text) {
  return Buffer.from(
    `<svg width="${CELL}" height="${LABEL_H}">
      <rect width="100%" height="100%" fill="black" fill-opacity="0.75"/>
      <text x="50%" y="17" text-anchor="middle" font-size="15" fill="white" font-family="monospace">${text}</text>
    </svg>`
  );
}

async function main() {
  const files = (await readdir(inputDir)).filter((f) => f.toLowerCase().endsWith(".jpg")).sort();
  if (files.length === 0) {
    console.log("Nenhuma miniatura encontrada em", inputDir);
    return;
  }
  await mkdir(outputDir, { recursive: true });

  const totalSheets = Math.ceil(files.length / PER_SHEET);
  console.log(`${files.length} miniaturas -> ${totalSheets} folha(s) de contato...`);

  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    const sheetFiles = files.slice(sheetIdx * PER_SHEET, (sheetIdx + 1) * PER_SHEET);
    const cols = Math.min(COLS, sheetFiles.length);
    const rows = Math.ceil(sheetFiles.length / COLS);
    const canvasW = cols * CELL;
    const canvasH = rows * (CELL + LABEL_H);

    const composites = [];
    for (const [i, file] of sheetFiles.entries()) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const left = col * CELL;
      const top = row * (CELL + LABEL_H);
      const baseName = path.basename(file, ".jpg");
      // Só o sufixo numérico do nome (ex: "_MG_1982" -> "1982") pra caber na legenda
      const shortLabel = baseName.replace(/^_?MG_?/i, "");

      const cellBuf = await sharp(path.join(inputDir, file))
        .resize(CELL, CELL, { fit: "cover" })
        .toBuffer();

      composites.push({ input: cellBuf, left, top });
      composites.push({ input: labelSvg(shortLabel), left, top: top + CELL });
    }

    const sheetPath = path.join(outputDir, `sheet-${String(sheetIdx + 1).padStart(2, "0")}.jpg`);
    await sharp({
      create: { width: canvasW, height: canvasH, channels: 3, background: "#1a0033" },
    })
      .composite(composites)
      .jpeg({ quality: 70 })
      .toFile(sheetPath);

    console.log(`[${sheetIdx + 1}/${totalSheets}] ${sheetPath} (${sheetFiles.length} fotos, de ${sheetFiles[0].replace(".jpg", "")} a ${sheetFiles[sheetFiles.length - 1].replace(".jpg", "")})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
