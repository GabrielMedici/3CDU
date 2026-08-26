# 3CDU — Imagens

## Já resolvidos
- `logo.png` — logo pequena do menu (transparente), usada em `components/Navbar.tsx`.
- `logo-3cdu.png` — logo grande do Hero, usada em `components/Hero.tsx`.
- `watermark-logo.png` — marca d'água aplicada nas fotos por `scripts/convert-raw.mjs`.
- `speakers/` — fotos dos palestrantes confirmados, usadas em `components/SpeakersCarousel.tsx`.

## Ainda falta
- `hero-bg.jpg` — foto de fundo do Hero. Enquanto não existir, `components/Hero.tsx`
  usa um gradiente CSS provisório no lugar (ver comentário no topo do arquivo).
  Quando tiver a foto oficial do evento, salve em `public/images/hero-bg.jpg` e
  troque o gradiente pela tag `<Image src="/images/hero-bg.jpg" fill
  className="object-cover object-center" priority quality={90} />`, como descrito
  no comentário do componente.
