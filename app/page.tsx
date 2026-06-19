import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SpeakersCarousel from "@/components/SpeakersCarousel";
import ScheduleBoard from "@/components/ScheduleBoard";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />

      {/* ── Seção: Palestrantes ───────────────────────────────────────── */}
      <SpeakersCarousel />

      {/* ── Seção: Sobre o Congresso ──────────────────────────────────── */}
      <section id="sobre" className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-4">
            Sobre o evento
          </p>
          <div className="max-w-4xl mx-auto glass border border-[rgba(232,170,26,0.2)] rounded-3xl p-8 md:p-12 text-left relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Background glow effects inside the card */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#e8aa1a] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#8533f0] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 relative z-10 leading-snug">
              Vem aí o <span className="text-gold-glow">3º CDU</span> – Congresso de Direito UniCesumar
            </h2>

            <div className="space-y-6 text-[17px] md:text-lg text-[#c299ff] font-light leading-relaxed relative z-10">
              <p className="text-xl text-white font-medium">
                Um dos maiores eventos acadêmicos da área jurídica da região, e você é nosso convidado para fazer parte dessa experiência!
              </p>
              
              <p>
                Promovido pelo curso de Direito da <strong className="text-white font-medium">UniCesumar – Campus Maringá</strong>, o congresso chega à sua terceira edição consolidado como um espaço de aprendizado, pesquisa, inovação e troca de experiências. Durante os dias do evento, estudantes, professores, pesquisadores e profissionais do Direito terão a oportunidade de participar de palestras com especialistas renomados, minicursos temáticos e apresentações de trabalhos científicos nas modalidades de banner e artigo.
              </p>
              
              <p>
                Mais do que um evento acadêmico, o 3º CDU é um ambiente de construção do conhecimento, incentivo à pesquisa e fortalecimento das conexões entre universidade, comunidade jurídica e mercado profissional. É a oportunidade ideal para compartilhar produções científicas, ampliar horizontes, debater temas atuais e desenvolver competências essenciais para a formação jurídica.
              </p>
              
              <p>
                Com uma programação diversificada e voltada aos desafios contemporâneos do Direito, o 3º CDU reafirma o compromisso da UniCesumar com a excelência acadêmica e a formação de profissionais preparados para transformar a sociedade.
              </p>
              
              <p className="text-[#e8aa1a] font-medium pt-4 text-xl border-t border-[rgba(232,170,26,0.15)] mt-6">
                Participe, apresente sua pesquisa, amplie sua rede de contatos e viva uma experiência que marcará sua trajetória acadêmica e profissional.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: "30+", label: "Palestrantes" },
              { value: "3",   label: "Dias de Evento" },
              { value: "500+", label: "Participantes" },
              { value: "10+",  label: "Painéis Temáticos" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass border-gold-glow rounded-2xl py-8 px-4 flex flex-col items-center gap-2"
              >
                <span className="text-4xl font-extrabold text-gold-glow">
                  {stat.value}
                </span>
                <span className="text-sm text-[#a399b8] font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção: Programação ────────────────────────────────────────── */}
      <ScheduleBoard />

      {/* ── Seção: Galeria Preview ────────────────────────────────────── */}
      <section id="galeria-preview" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-2">
                Memórias
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Galeria de Fotos
              </h2>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((dia) => (
                <Link
                  key={dia}
                  href={`/galeria/${dia}`}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold border border-[rgba(232,170,26,0.3)] text-[#e8aa1a] hover:bg-[rgba(232,170,26,0.1)] hover:border-[rgba(232,170,26,0.6)] transition-all duration-200"
                >
                  Dia {dia}
                </Link>
              ))}
            </div>
          </div>
          <div className="glass border-gold-glow rounded-3xl p-12 text-center">
            <p className="text-[#a399b8] text-lg">
              As fotos do evento aparecerão aqui após o congresso.
            </p>
          </div>
        </div>
      </section>

      {/* ── Seção: CTA Ingresso ───────────────────────────────────────── */}
      <section
        id="ingresso"
        className="py-28 px-6 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(43,0,87,0.6) 0%, transparent 80%)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-block p-px rounded-3xl mb-12"
            style={{
              background:
                "linear-gradient(135deg, rgba(232,170,26,0.6) 0%, rgba(133,51,240,0.4) 50%, rgba(232,170,26,0.6) 100%)",
            }}
          >
            <div className="glass rounded-3xl px-10 py-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Não fique de fora
              </h2>
              <p className="text-lg text-[#c299ff] mb-8">
                Vagas limitadas. Garanta sua participação no maior evento jurídico do Paraná.
              </p>
              <a
                href="https://www.even3.com.br/3cdu/"
                target="_blank"
                rel="noopener noreferrer"
                id="ingresso-cta-btn"
                className="btn-gold inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold tracking-wide animate-glow-pulse"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                </svg>
                Garantir Meu Ingresso Agora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(232,170,26,0.1)] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#a399b8]">
            © 2026 · 3º Congresso de Direito Unicesumar
          </p>
          <p className="text-xs text-[#6b5e82]">
            Desenvolvido por{" "}
            <span className="text-[#e8aa1a]">Gabriel Médici</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
