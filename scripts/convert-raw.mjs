// Converte fotos RAW (.CR2, .NEF, .ARW, .DNG, ...) para JPEG otimizado pronto pra
// subir na galeria, e faz uma triagem automática de qualidade (foco, exposição,
// possíveis duplicatas de rajada) pra facilitar a limpeza manual.
//
// Extrai a prévia JPEG em resolução total já gravada dentro do arquivo RAW pela
// câmera (rápido, sem demosaicing) e gera duas versões de cada foto:
//   - display (2400px, qualidade 82) — a foto em si, com marca d'água, usada
//             pra download (usa public/images/watermark-logo.png)
//   - thumb   (600px,  qualidade 75) — miniatura pro grid da galeria, sem marca
//
// A triagem é só um AUXÍLIO — nada é apagado. Fotos com sinal de problema
// (desfocada, muito escura/estourada, possível duplicata de rajada) continuam
// normalmente em display/thumb, e além disso ganham uma cópia dentro de
// revisar/<motivo>/ pra você bater o olho rapidamente só nessas, em vez de
// rever a pasta inteira.
//
// A nitidez é avaliada RELATIVA ao próprio lote (percentil), porque um valor
// fixo não faz sentido comparando câmeras/lentes/cenários diferentes — o que
// importa é achar as fotos mais moles perto das outras do mesmo eventos.
// Duplicata de rajada exige hash visual parecido E horário de captura próximo
// (few segundos), pra não confundir "mesmo fundo do evento" com "mesma foto".
//
// Uso:
//   npm run convert-raw -- "<pasta com os RAW>" [pasta-de-saida]
//
// Se a pasta de saída não for informada, cria "<pasta-com-os-raw>/convertidas".

import { exiftool } from "exiftool-vendored";
import sharp from "sharp";
import { readdir, mkdir, copyFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WATERMARK_PATH = path.join(__dirname, "..", "public", "images", "watermark-logo.png");
const WATERMARK_OPACITY = 0.8;       // 0-1
const WATERMARK_WIDTH_RATIO = 0.22;  // % da largura da foto
const WATERMARK_MARGIN_RATIO = 0.03; // % da largura da foto, distância das bordas

const RAW_EXTENSIONS = [".cr2", ".cr3", ".nef", ".arw", ".dng", ".raf", ".orf"];

// Limiares da triagem automática — ajuste aqui se estiver pegando fotos boas
// como "ruins" ou deixando passar fotos ruins.
const BLUR_PERCENTILE = 0.10;          // as 10% menos nítidas do lote vão pra revisão
const DARK_MEAN_THRESHOLD = 25;        // abaixo disso (0-255) = muito escura (absoluto, não relativo)
const BRIGHT_MEAN_THRESHOLD = 230;     // acima disso (0-255) = estourada (absoluto)
const DUPLICATE_HAMMING_THRESHOLD = 3; // diferença de bits <= isso = hash visual parecido
const DUPLICATE_MAX_SECONDS = 3;       // ...E tirada a até N segundos da foto anterior

const inputDir = process.argv[2];
if (!inputDir) {
  console.error('Uso: npm run convert-raw -- "<pasta com os RAW>" [pasta-de-saida]');
  process.exit(1);
}
const outputDir = process.argv[3] || path.join(inputDir, "convertidas");

const LAPLACIAN_KERNEL = { width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] };

async function analyzeQuality(previewPath) {
  const smallBuf = await sharp(previewPath)
    .rotate()
    .resize(400, 400, { fit: "inside" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = smallBuf;
  const { width, height } = info;

  // Exposição: média de luminância (0-255)
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  const mean = sum / data.length;

  // Foco: desvio-padrão do filtro Laplaciano (quanto mais nítida, mais alto)
  const lapStats = await sharp(data, { raw: { width, height, channels: 1 } })
    .convolve(LAPLACIAN_KERNEL)
    .stats();
  const sharpness = lapStats.channels[0].stdev;

  // Hash perceptual simples (aHash 8x8) pra detectar rajadas quase idênticas
  const hashBuf = await sharp(previewPath).rotate().resize(8, 8, { fit: "fill" }).greyscale().raw().toBuffer();
  let hashSum = 0;
  for (const v of hashBuf) hashSum += v;
  const hashMean = hashSum / hashBuf.length;
  let hash = "";
  for (const v of hashBuf) hash += v >= hashMean ? "1" : "0";

  return { mean, sharpness, hash };
}

async function loadWatermark() {
  const { data, info } = await sharp(WATERMARK_PATH).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * WATERMARK_OPACITY);
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

async function applyWatermark(imageBuf, watermarkBase) {
  const meta = await sharp(imageBuf).metadata();
  const wmWidth = Math.round(meta.width * WATERMARK_WIDTH_RATIO);
  const wmResized = await sharp(watermarkBase).resize({ width: wmWidth }).toBuffer();
  const wmMeta = await sharp(wmResized).metadata();
  const margin = Math.round(meta.width * WATERMARK_MARGIN_RATIO);

  return sharp(imageBuf)
    .composite([
      {
        input: wmResized,
        left: Math.max(0, meta.width - wmMeta.width - margin),
        top: Math.max(0, meta.height - wmMeta.height - margin),
      },
    ])
    .jpeg({ quality: 82 })
    .toBuffer();
}

function hammingDistance(a, b) {
  let dist = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

function captureEpochSeconds(tags) {
  // exiftool-vendored já devolve DateTimeOriginal como objeto ExifDateTime quando dá pra parsear
  const dt = tags.DateTimeOriginal || tags.CreateDate;
  if (!dt) return null;
  const ms = dt.toMillis ? dt.toMillis() : Date.parse(String(dt));
  if (!ms || Number.isNaN(ms)) return null;
  const subSec = Number(tags.SubSecTimeOriginal || 0) / 1000;
  return ms / 1000 + subSec;
}

async function main() {
  const entries = await readdir(inputDir);
  const rawFiles = entries
    .filter((f) => RAW_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();

  if (rawFiles.length === 0) {
    console.log("Nenhum arquivo RAW encontrado em", inputDir);
    await exiftool.end();
    return;
  }

  const displayDir = path.join(outputDir, "display");
  const thumbDir = path.join(outputDir, "thumb");
  const reviewBlurDir = path.join(outputDir, "revisar", "desfocada");
  const reviewExposureDir = path.join(outputDir, "revisar", "exposicao");
  const reviewDupDir = path.join(outputDir, "revisar", "possivel-duplicata");
  await mkdir(displayDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });
  await mkdir(reviewBlurDir, { recursive: true });
  await mkdir(reviewExposureDir, { recursive: true });
  await mkdir(reviewDupDir, { recursive: true });

  const watermarkBase = await loadWatermark();

  console.log(`Convertendo e analisando ${rawFiles.length} arquivo(s) RAW de "${inputDir}"...`);

  // ── Passo 1: converter e coletar métricas de todo mundo ──────────────────
  const items = [];
  let failed = 0;

  for (const [i, file] of rawFiles.entries()) {
    const srcPath = path.join(inputDir, file);
    const baseName = path.basename(file, path.extname(file));
    const tempPreview = path.join(outputDir, `${baseName}__preview.jpg`);
    const displayOut = path.join(displayDir, `${baseName}.jpg`);
    const thumbOut = path.join(thumbDir, `${baseName}.jpg`);

    try {
      await exiftool.extractPreview(srcPath, tempPreview);
      const tags = await exiftool.read(srcPath);

      const resizedBuf = await sharp(tempPreview)
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
      const displayBuf = await applyWatermark(resizedBuf, watermarkBase);
      await sharp(displayBuf).toFile(displayOut);

      const thumbBuf = await sharp(tempPreview)
        .rotate()
        .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
      await sharp(thumbBuf).toFile(thumbOut);

      const { mean, sharpness, hash } = await analyzeQuality(tempPreview);

      items.push({
        baseName,
        displayOut,
        displayBytes: displayBuf.length,
        thumbBytes: thumbBuf.length,
        mean,
        sharpness,
        hash,
        captureSec: captureEpochSeconds(tags),
      });

      await unlink(tempPreview).catch(() => {});
      process.stdout.write(`\r[${i + 1}/${rawFiles.length}] ${file} convertida`);
    } catch (err) {
      failed++;
      console.log(`\n[${i + 1}/${rawFiles.length}] ${file} FALHOU: ${err.message}`);
    }
  }

  await exiftool.end();

  // ── Passo 2: nitidez é relativa ao lote — calcula o limiar pelo percentil ─
  const sortedSharpness = [...items].map((x) => x.sharpness).sort((a, b) => a - b);
  const blurCutoffIdx = Math.floor(sortedSharpness.length * BLUR_PERCENTILE);
  const blurThreshold = sortedSharpness[blurCutoffIdx] ?? 0;

  // ── Passo 3: sinalizar e copiar pra revisar/, na ordem original de captura ─
  let flaggedBlur = 0;
  let flaggedExposure = 0;
  let flaggedDup = 0;
  let prevHash = null;
  let prevCaptureSec = null;
  const report = [];

  for (const item of items) {
    const reasons = [];

    if (item.sharpness <= blurThreshold) {
      reasons.push("desfocada-relativa");
      flaggedBlur++;
      await copyFile(item.displayOut, path.join(reviewBlurDir, `${item.baseName}.jpg`));
    }
    if (item.mean < DARK_MEAN_THRESHOLD || item.mean > BRIGHT_MEAN_THRESHOLD) {
      reasons.push(item.mean < DARK_MEAN_THRESHOLD ? "muito-escura" : "estourada");
      flaggedExposure++;
      await copyFile(item.displayOut, path.join(reviewExposureDir, `${item.baseName}.jpg`));
    }
    if (prevHash !== null) {
      const visuallyClose = hammingDistance(item.hash, prevHash) <= DUPLICATE_HAMMING_THRESHOLD;
      const timeClose =
        item.captureSec !== null &&
        prevCaptureSec !== null &&
        Math.abs(item.captureSec - prevCaptureSec) <= DUPLICATE_MAX_SECONDS;
      if (visuallyClose && timeClose) {
        reasons.push("possivel-duplicata-rajada");
        flaggedDup++;
        await copyFile(item.displayOut, path.join(reviewDupDir, `${item.baseName}.jpg`));
      }
    }
    prevHash = item.hash;
    prevCaptureSec = item.captureSec;

    report.push({
      file: `${item.baseName}.jpg`,
      sharpness: item.sharpness.toFixed(1),
      brightness: item.mean.toFixed(0),
      reasons: reasons.join("|") || "ok",
    });
  }

  const csvLines = ["arquivo,nitidez,brilho,motivo", ...report.map((r) => `${r.file},${r.sharpness},${r.brightness},${r.reasons}`)];
  await writeFile(path.join(outputDir, "relatorio.csv"), csvLines.join("\n"), "utf-8");

  const totalBytes = items.reduce((s, x) => s + x.displayBytes + x.thumbBytes, 0);
  const ok = items.length;
  const avgPerPhotoKB = ok > 0 ? totalBytes / ok / 1024 : 0;

  console.log("\n\n=== Resumo ===");
  console.log(`Convertidas: ${ok}  |  Falharam: ${failed}`);
  console.log(`Limiar de nitidez calculado pra esse lote: ${blurThreshold.toFixed(1)} (percentil ${(BLUR_PERCENTILE * 100).toFixed(0)}%)`);
  console.log(`Sinalizadas p/ revisão -> desfocada: ${flaggedBlur}  |  exposição: ${flaggedExposure}  |  possível duplicata: ${flaggedDup}`);
  console.log(`Tamanho total (display+thumb): ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Média por foto: ${avgPerPhotoKB.toFixed(0)} KB`);
  if (ok > 0) {
    const freeCapGB = 1; // capacidade aproximada do Supabase Storage no plano free
    const capacity = Math.floor((freeCapGB * 1024 * 1024) / avgPerPhotoKB);
    console.log(`Capacidade estimada no free tier (1GB): ~${capacity} fotos nesse padrão`);
  }
  console.log(`\nSaída em: ${outputDir}`);
  console.log(`Relatório completo (nitidez/brilho por foto): ${path.join(outputDir, "relatorio.csv")}`);
  console.log(`Revise rapidamente: ${path.join(outputDir, "revisar")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
