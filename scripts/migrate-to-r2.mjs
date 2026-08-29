// Copia todos os objetos do bucket "photos" do Supabase Storage pro bucket R2.
// Não mexe no Supabase (só lê) nem no site em produção — é só a cópia dos arquivos.
// Idempotente: pula o que já existe no R2, então pode rodar de novo se cair no meio.
//
// Uso: node --env-file=.env scripts/migrate-to-r2.mjs

import { createClient } from "@supabase/supabase-js";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_SUPABASE = "photos";
const BUCKET_R2 = process.env.R2_BUCKET;
const CONCURRENCY = 3;
const PREFIXES = ["dia_1/display", "dia_1/thumb", "dia_2/display", "dia_2/thumb"];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function listSupabaseKeys(prefix) {
  const keys = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase.storage
      .from(BUCKET_SUPABASE)
      .list(prefix, { limit: PAGE, offset });
    if (error) throw error;
    for (const f of data) keys.push(`${prefix}/${f.name}`);
    if (data.length < PAGE) break;
  }
  return keys;
}

async function listR2Keys() {
  const existing = new Set();
  let ContinuationToken;
  do {
    const resp = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET_R2, ContinuationToken })
    );
    for (const obj of resp.Contents ?? []) existing.add(obj.Key);
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return existing;
}

async function copyOne(key) {
  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_SUPABASE}/${key}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_R2,
      Key: key,
      Body: buf,
      ContentType: resp.headers.get("content-type") || "image/jpeg",
    })
  );
}

async function main() {
  console.log("Listando arquivos no Supabase...");
  let allKeys = [];
  for (const prefix of PREFIXES) {
    const keys = await listSupabaseKeys(prefix);
    console.log(`  ${prefix}: ${keys.length}`);
    allKeys = allKeys.concat(keys);
  }
  console.log(`Total no Supabase: ${allKeys.length}`);

  console.log("Listando o que já existe no R2...");
  const existing = await listR2Keys();
  console.log(`Já no R2: ${existing.size}`);

  const pending = allKeys.filter((k) => !existing.has(k));
  console.log(`Faltam copiar: ${pending.length}`);

  let done = 0;
  let failed = [];
  let idx = 0;

  async function worker() {
    while (idx < pending.length) {
      const key = pending[idx++];
      try {
        await copyOne(key);
        done++;
        if (done % 50 === 0 || done === pending.length) {
          console.log(`[${done}/${pending.length}] copiados`);
        }
      } catch (err) {
        failed.push({ key, error: String(err) });
        console.error(`FALHOU: ${key} -> ${err}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log("\n=== Resumo ===");
  console.log(`Copiados agora: ${done}  |  Já existiam: ${existing.size}  |  Falharam: ${failed.length}`);
  if (failed.length) {
    console.log("Falhas:", JSON.stringify(failed, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
