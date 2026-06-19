import type { Metadata } from "next";
import "./globals.css";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "3º Congresso de Direito Unicesumar — 3CDU",
  description:
    "O maior evento jurídico do Paraná. Palestrantes de excelência, debates transformadores e networking de alto nível. Garanta seu ingresso para o 3CDU.",
  keywords: ["congresso direito", "Unicesumar", "3CDU", "evento jurídico", "Maringá"],
  openGraph: {
    title: "3º Congresso de Direito Unicesumar",
    description: "O maior evento jurídico do Paraná.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="particle-bg min-h-screen"
        style={{ backgroundColor: "#0d0019", fontFamily: "'Outfit', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
