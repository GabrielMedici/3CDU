"use client";

import { useState } from "react";

/* ── Botão de download forçado ────────────────────────────────────────────
   O atributo `download` do <a> só é respeitado pelo navegador quando o link
   é do mesmo domínio — como as fotos vêm do Supabase/Unsplash (outro
   domínio), o navegador ignorava o `download` e só abria a imagem direto.
   Aqui a gente busca o arquivo via fetch, monta um blob local (mesmo
   domínio) e dispara o download a partir dele. */
export default function DownloadButton({
  url,
  filename,
  id,
  className,
  children,
}: {
  url: string;
  filename: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Se o fetch falhar (ex: CORS bloqueado pelo bucket), cai pro
      // comportamento padrão: abre a foto numa aba nova pra salvar manualmente.
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button id={id} onClick={handleDownload} disabled={loading} className={className}>
      {loading ? "Baixando..." : children}
    </button>
  );
}
