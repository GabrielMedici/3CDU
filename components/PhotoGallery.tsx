"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import DownloadButton from "@/components/DownloadButton";
import { handleImageRetry } from "@/lib/imageRetry";

interface Photo {
  id: string;
  dia_evento: number;
  thumbnail_url: string | null;
  watermarked_url: string | null;
  created_at: string;
}

// Quantas miniaturas mostrar por página. Com >1000 fotos por dia e Supabase
// no plano gratuito (10GB de banda/mês), renderizar tudo de uma vez estoura
// a cota rápido — só carrega a página atual, e trocar de página descarrega
// as anteriores (ao contrário de "carregar mais", que ia empilhando tudo).
const PAGE_SIZE = 24;

// Lista de números de página truncada (com "…") em vez de listar todas —
// com ~60 páginas isso ficaria enorme. Sempre mostra a primeira, a última,
// e uma vizinhança em torno da página atual.
function getPageNumbers(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const pages: (number | "…")[] = [];
  let prev = 0;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      if (prev && i - prev > 1) pages.push("…");
      pages.push(i);
      prev = i;
    }
  }
  return pages;
}

/* ── Grid de fotos + visualizador em tela cheia ───────────────────────────
   Clicar numa foto abre ela em tamanho grande (watermarked_url) antes do
   download, em vez de baixar direto a partir da miniatura. */
export default function PhotoGallery({
  photos,
  diaNum,
}: {
  photos: Photo[];
  diaNum: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [diaNum]);

  const totalPages = Math.max(1, Math.ceil(photos.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visiblePhotos = photos.slice(pageStart, pageStart + PAGE_SIZE);

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, prev, next]);

  const openPhoto = photos[openIndex ?? -1];

  return (
    <>
      {/* Grid Masonry-like */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {visiblePhotos.map((photo, i) => {
          const idx = pageStart + i; // índice absoluto dentro do dia inteiro
          return (
          <div
            key={photo.id}
            id={`photo-card-${photo.id}`}
            className="photo-card group"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Thumbnail — div (não <button>) porque contém o botão de download dentro */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenIndex(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIndex(idx);
                }
              }}
              className="relative aspect-square overflow-hidden w-full block cursor-zoom-in"
              aria-label={`Ampliar foto ${idx + 1}`}
            >
              {photo.thumbnail_url ? (
                <Image
                  src={photo.thumbnail_url}
                  alt={`Foto ${idx + 1} — Dia ${diaNum} do 3CDU`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  loading={i < 10 ? "eager" : "lazy"}
                  onError={handleImageRetry}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[rgba(43,0,87,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="rgba(163,102,255,0.4)" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                  </svg>
                </div>
              )}

              {/* Overlay com botão de download (Visível no mobile, Hover no Desktop) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.4)] to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3 sm:p-4">
                {photo.watermarked_url ? (
                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <DownloadButton
                      url={photo.watermarked_url}
                      filename={`3CDU_dia${diaNum}_foto${idx + 1}.jpg`}
                      id={`download-btn-${photo.id}`}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[rgba(232,170,26,0.15)] border border-[rgba(232,170,26,0.4)] text-[#e8aa1a] text-xs font-bold active:bg-[rgba(232,170,26,0.4)] md:hover:bg-[rgba(232,170,26,0.3)] md:hover:border-[rgba(232,170,26,0.7)] transition-all duration-200 backdrop-blur-sm disabled:opacity-60"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                      </svg>
                      Baixar
                    </DownloadButton>
                  </div>
                ) : (
                  <p className="text-xs text-[#a399b8] text-center w-full">
                    Processando...
                  </p>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Paginação numerada — pular direto pro meio/fim sem carregar tudo */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 mt-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(232,170,26,0.3)] text-[#e8aa1a] hover:bg-[rgba(232,170,26,0.08)] hover:border-[rgba(232,170,26,0.6)] transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            {getPageNumbers(currentPage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-sm text-[#6b5e82]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`min-w-9 h-9 px-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    p === currentPage
                      ? "btn-gold shadow-gold"
                      : "border border-[rgba(232,170,26,0.3)] text-[#c299ff] hover:border-[rgba(232,170,26,0.6)] hover:text-white hover:bg-[rgba(232,170,26,0.08)]"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(232,170,26,0.3)] text-[#e8aa1a] hover:bg-[rgba(232,170,26,0.08)] hover:border-[rgba(232,170,26,0.6)] transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-[#6b5e82]">
            Página {currentPage} de {totalPages} — {photos.length} fotos ao todo
          </p>
        </div>
      )}

      {/* ── Visualizador em tela cheia ─────────────────────────────────── */}
      {openPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
          onClick={close}
        >
          {/* Fechar */}
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.16)] transition-colors z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Anterior */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Foto anterior"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.16)] transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Imagem */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={openPhoto.watermarked_url || openPhoto.thumbnail_url || ""}
              alt={`Foto ${(openIndex ?? 0) + 1} — Dia ${diaNum} do 3CDU`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onError={handleImageRetry}
            />
          </div>

          {/* Próxima */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Próxima foto"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.16)] transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Baixar */}
          {openPhoto.watermarked_url && (
            <div
              className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <DownloadButton
                url={openPhoto.watermarked_url}
                filename={`3CDU_dia${diaNum}_foto${(openIndex ?? 0) + 1}.jpg`}
                className="px-6 py-3 flex items-center gap-2 rounded-full bg-[#e8aa1a] text-[#1a0033] text-sm font-bold hover:bg-[#f5c842] transition-colors disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Baixar em alta resolução
              </DownloadButton>
            </div>
          )}
        </div>
      )}
    </>
  );
}
