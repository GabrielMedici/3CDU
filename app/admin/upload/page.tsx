"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── Tipos ─────────────────────────────────────────────────────────────────
interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  previewUrl: string;
}

// ── Componente Admin Upload ────────────────────────────────────────────────
export default function AdminUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dia, setDia] = useState<1 | 2 | 3>(1);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [globalStatus, setGlobalStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  // ── Adicionar arquivos ──────────────────────────────────────────────────
  const addFiles = useCallback((raw: FileList | File[]) => {
    const accepted = Array.from(raw).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    const newItems: UploadFile[] = accepted.map((f) => ({
      id:         crypto.randomUUID(),
      file:       f,
      status:     "pending",
      progress:   0,
      previewUrl: URL.createObjectURL(f),
    }));
    setFiles((prev) => [...prev, ...newItems]);
  }, []);

  // ── Drag & Drop ────────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  // ── Remover arquivo ────────────────────────────────────────────────────
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  // ── Upload direto para raw-photos ──────────────────────────────────────
  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (!pending.length) return;

    setGlobalStatus("uploading");

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Você precisa estar logado para fazer upload.");
      router.push("/admin/login");
      return;
    }

    await Promise.all(
      pending.map(async (item) => {
        // Atualizar status → uploading
        setFiles((prev) =>
          prev.map((f) => f.id === item.id ? { ...f, status: "uploading", progress: 0 } : f)
        );

        const ext      = item.file.name.split(".").pop() ?? "jpg";
        const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path     = `dia_${dia}/${Date.now()}_${safeName}`;

        // Upload direto para o bucket raw-photos (client-side, sem passar pela API Next.js)
        const { error } = await supabase.storage
          .from("raw-photos")
          .upload(path, item.file, {
            contentType: item.file.type,
            upsert:      false,
          });

        if (error) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "error", error: error.message } : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "done", progress: 100 } : f
            )
          );
        }
      })
    );

    // Verificar resultado final
    setFiles((prev) => {
      const hasError = prev.some((f) => f.status === "error");
      setGlobalStatus(hasError ? "error" : "done");
      return prev;
    });
  };

  // ── Contadores ─────────────────────────────────────────────────────────
  const totalPending   = files.filter((f) => f.status === "pending").length;
  const totalDone      = files.filter((f) => f.status === "done").length;
  const totalError     = files.filter((f) => f.status === "error").length;
  const totalUploading = files.filter((f) => f.status === "uploading").length;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0d0019" }}>

      {/* ── Topo Admin ────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between glass border-b border-[rgba(232,170,26,0.15)]"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#e8aa1a] shadow-[0_0_8px_rgba(232,170,26,0.9)]"
          />
          <span className="text-sm font-bold text-white tracking-wide">
            3CDU <span className="text-[#a399b8] font-normal">— Painel Admin</span>
          </span>
        </div>
        <span className="text-xs text-[#6b5e82] font-medium tracking-wider uppercase">
          Upload de Fotos
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Upload de{" "}
          <span className="text-gold-glow">Fotos</span>
        </h1>
        <p className="text-[#a399b8] mb-10">
          Os arquivos são enviados diretamente ao bucket{" "}
          <code className="text-[#e8aa1a] bg-[rgba(232,170,26,0.1)] px-1.5 py-0.5 rounded text-xs">
            raw-photos
          </code>{" "}
          do Supabase e processados automaticamente pela Edge Function.
        </p>

        {/* ── Seletor de Dia ─────────────────────────────────────────── */}
        <div className="mb-8">
          <label className="block text-xs font-bold tracking-[0.2em] text-[#e8aa1a] uppercase mb-3">
            Dia do Evento
          </label>
          <div className="flex gap-3">
            {([1, 2, 3] as const).map((d) => (
              <button
                key={d}
                id={`select-dia-${d}`}
                onClick={() => setDia(d)}
                className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  dia === d
                    ? "btn-gold shadow-gold"
                    : "glass border border-[rgba(232,170,26,0.2)] text-[#c299ff] hover:border-[rgba(232,170,26,0.5)] hover:text-white"
                }`}
              >
                Dia {d}
              </button>
            ))}
          </div>
        </div>

        {/* ── Dropzone ──────────────────────────────────────────────── */}
        <div
          id="dropzone"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragOver
              ? "dropzone-active"
              : "border-[rgba(232,170,26,0.2)] hover:border-[rgba(232,170,26,0.45)] hover:bg-[rgba(232,170,26,0.03)]"
          }`}
          style={{ background: "rgba(26,0,51,0.35)" }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(43,0,87,0.6)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.2}
                stroke={isDragOver ? "#e8aa1a" : "rgba(163,102,255,0.7)"}
                className="w-8 h-8 transition-colors duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {isDragOver
                  ? "Solte as fotos aqui!"
                  : "Arraste e solte as fotos aqui"}
              </p>
              <p className="text-[#a399b8] text-sm mt-1">
                ou{" "}
                <span className="text-[#e8aa1a] font-semibold underline underline-offset-2">
                  clique para selecionar
                </span>
              </p>
            </div>
            <p className="text-xs text-[#6b5e82]">
              JPG, PNG ou WebP · Múltiplos arquivos · Máx. 50MB por foto
            </p>
          </div>
        </div>

        {/* ── Lista de Arquivos ──────────────────────────────────────── */}
        {files.length > 0 && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">
                {files.length} {files.length === 1 ? "arquivo" : "arquivos"} selecionado(s)
              </p>
              <button
                onClick={() => {
                  files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                  setFiles([]);
                  setGlobalStatus("idle");
                }}
                className="text-xs text-[#a399b8] hover:text-white transition-colors"
              >
                Limpar tudo
              </button>
            </div>

            {/* Grid de preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${
                    item.status === "done"
                      ? "border-[rgba(34,197,94,0.5)]"
                      : item.status === "error"
                      ? "border-[rgba(239,68,68,0.5)]"
                      : item.status === "uploading"
                      ? "border-[rgba(232,170,26,0.5)]"
                      : "border-[rgba(232,170,26,0.2)]"
                  }`}
                >
                  {/* Preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full aspect-square object-cover"
                  />

                  {/* Status overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(13,0,25,0.6)] opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <p className="text-xs text-white font-medium text-center px-2 truncate w-full text-center">
                      {item.file.name}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "done"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "error"
                        ? "bg-red-500/20 text-red-400"
                        : item.status === "uploading"
                        ? "bg-[rgba(232,170,26,0.2)] text-[#e8aa1a]"
                        : "bg-[rgba(43,0,87,0.7)] text-[#a399b8]"
                    }`}
                  >
                    {item.status === "done"      && "✓ Enviado"}
                    {item.status === "error"     && "✗ Erro"}
                    {item.status === "uploading" && "↑ Enviando"}
                    {item.status === "pending"   && "Aguardando"}
                  </div>

                  {/* Botão remover (apenas se pending) */}
                  {item.status === "pending" && (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[rgba(13,0,25,0.8)] flex items-center justify-center text-[#a399b8] hover:text-white hover:bg-red-500/40 transition-all text-xs"
                    >
                      ✕
                    </button>
                  )}

                  {/* Erro message */}
                  {item.status === "error" && item.error && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[rgba(13,0,25,0.9)] p-1.5">
                      <p className="text-[9px] text-red-400 truncate">{item.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resumo e botão de upload */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[rgba(232,170,26,0.1)]">
              <div className="flex flex-wrap gap-4 text-xs font-medium flex-1">
                {totalPending > 0 && (
                  <span className="text-[#a399b8]">{totalPending} pendente(s)</span>
                )}
                {totalUploading > 0 && (
                  <span className="text-[#e8aa1a]">{totalUploading} enviando...</span>
                )}
                {totalDone > 0 && (
                  <span className="text-green-400">{totalDone} concluído(s)</span>
                )}
                {totalError > 0 && (
                  <span className="text-red-400">{totalError} com erro</span>
                )}
              </div>

              <button
                id="upload-submit-btn"
                onClick={uploadAll}
                disabled={totalPending === 0 || globalStatus === "uploading"}
                className={`btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
              >
                {globalStatus === "uploading" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0L5.2 6.735a.75.75 0 0 0 1.09 1.03L9.25 4.636v8.614Z" />
                      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                    </svg>
                    Enviar {totalPending > 0 ? `${totalPending} foto(s)` : "Fotos"} — Dia {dia}
                  </>
                )}
              </button>
            </div>

            {/* Sucesso global */}
            {globalStatus === "done" && totalError === 0 && (
              <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <p className="text-green-400 font-semibold text-sm">Upload concluído!</p>
                  <p className="text-[#a399b8] text-xs mt-0.5">
                    A Edge Function irá processar a marca d&apos;água automaticamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Instruções ────────────────────────────────────────────── */}
        <div className="mt-12 glass border-gold-glow rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#e8aa1a] mb-3">ℹ️ Como funciona</h3>
          <ol className="space-y-2 text-sm text-[#a399b8]">
            <li className="flex gap-2">
              <span className="text-[#e8aa1a] font-bold">1.</span>
              Selecione o dia do evento e arraste as fotos para o campo acima.
            </li>
            <li className="flex gap-2">
              <span className="text-[#e8aa1a] font-bold">2.</span>
              As fotos são enviadas diretamente ao bucket{" "}
              <code className="text-[#e8aa1a] text-xs">raw-photos</code> do Supabase.
            </li>
            <li className="flex gap-2">
              <span className="text-[#e8aa1a] font-bold">3.</span>
              A Edge Function detecta automaticamente e adiciona a marca d&apos;água.
            </li>
            <li className="flex gap-2">
              <span className="text-[#e8aa1a] font-bold">4.</span>
              As versões processadas são publicadas na galeria em instantes.
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
