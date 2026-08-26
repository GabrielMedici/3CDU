// Remove fotos publicadas (Storage + linha na tabela `photos`) pelo nome do
// arquivo — útil pra tirar do ar fotos de teste, borradas, ou enviadas por
// engano, sem precisar mexer no restante do dia.
//
// Uso:
//   node --env-file=.env scripts/remove-photos.mjs --dia 2 _MG_1982 _MG_1983 _MG_1984

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || "photos";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Rode com: node --env-file=.env scripts/remove-photos.mjs --dia <1|2|3> <nome1> <nome2> ...");
  process.exit(1);
}

const args = process.argv.slice(2);
const diaIdx = args.indexOf("--dia");
const dia = diaIdx !== -1 ? Number(args[diaIdx + 1]) : null;
const baseNames = args.filter((a, i) => a !== "--dia" && args[i - 1] !== "--dia");

if (!dia || ![1, 2, 3].includes(dia) || baseNames.length === 0) {
  console.error('Uso: node --env-file=.env scripts/remove-photos.mjs --dia <1|2|3> <nome1> <nome2> ...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const thumbPaths = baseNames.map((n) => `dia_${dia}/thumb/${n}.jpg`);
  const displayPaths = baseNames.map((n) => `dia_${dia}/display/${n}.jpg`);

  const { error: storageError } = await supabase.storage.from(BUCKET).remove([...thumbPaths, ...displayPaths]);
  if (storageError) {
    console.error("Erro removendo do Storage:", storageError);
  } else {
    console.log(`Removidos ${thumbPaths.length + displayPaths.length} arquivo(s) do Storage.`);
  }

  const thumbUrls = thumbPaths.map((p) => supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl);
  const { error: dbError, count } = await supabase
    .from("photos")
    .delete({ count: "exact" })
    .eq("dia_evento", dia)
    .in("thumbnail_url", thumbUrls);

  if (dbError) {
    console.error("Erro removendo do banco:", dbError);
    process.exit(1);
  }
  console.log(`Removida(s) ${count} linha(s) da tabela photos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
