"use client";

import { useState } from "react";

const SCHEDULE_DATA = [
  {
    id: "day1",
    date: "terça, 25/08",
    activities: [
      { time: "09:00 - 11:40", title: "EXPOSIÇÃO DE PAINEL (BANNER)", type: "Exposição" },
      { time: "17:00 - 19:30", title: "ENTRADA — Leitura do QRCode", type: "Credenciamento" },
      { time: "19:00 - 22:50", title: "PALESTRA DE ABERTURA — Pedro Lenza", type: "Palestra" },
      { time: "21:30 - 23:00", title: "SAÍDA — Leitura do QRCode", type: "Credenciamento" },
    ],
  },
  {
    id: "day2",
    date: "quarta, 26/08",
    activities: [
      { time: "00:00 - 23:59", title: "ONLINE — Alta Performance na Pesquisa Científica: Métodos, Leitura e Produção", type: "Online" },
      { time: "08:00 - 11:40", title: "Análise dos pontos essenciais do processo de conhecimento", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Balística forense (Turma 01)", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Direito Cooperativo no Agronegócio: desafios jurídicos e oportunidades", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Direito das famílias e sucessões: Soluções Extrajudiciais na Prática", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Direitos Humanos e a Luta Anticapacitista: Como Construir um Brasil Verdadeiramente Inclusivo?", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "O Ministério Público e as políticas públicas de segurança", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "O que Todo Advogado Precisa Saber sobre Perícia Médica", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Oficina de Declaração de Imposto sobre a Renda da Pessoa Física", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Oficina de Escrita Acadêmica: Descomplicando a Produção Científica no Direito", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Por trás das dívidas: o papel do advogado nas crises empresariais — uma visão prática do direito bancário", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Você escolhe ou é escolhido? Consumo e manipulação na economia digital", type: "Minicurso" },
      { time: "14:00 - 16:00", title: "SALA VIRTUAL 001 — GT2: Direito Civil e Processo Civil Contemporâneo | GT9: Biodireito e Bioética", type: "Apresentação" },
      { time: "14:00 - 16:30", title: "SALA VIRTUAL 002 — GT3: Ciências Criminais, Processo Penal e Legislação Penal Especial (Grupo 1)", type: "Apresentação" },
      { time: "14:00 - 16:00", title: "SALA VIRTUAL 003 — GT3: Ciências Criminais, Processo Penal e Legislação Penal Especial (Grupo 2)", type: "Apresentação" },
      { time: "14:00 - 16:30", title: "SALA VIRTUAL 004 — GT3: Ciências Criminais, Processo Penal e Legislação Penal Especial (Grupo 3)", type: "Apresentação" },
      { time: "14:00 - 16:30", title: "SALA VIRTUAL 005 — GT3: Ciências Criminais, Processo Penal e Legislação Penal Especial (Grupo 4)", type: "Apresentação" },
      { time: "14:00 - 16:30", title: "SALA VIRTUAL 006 — GT4: Direito Constitucional, Sociedade, Justiça e Democracia | GT8: Direito, Arte e Literatura", type: "Apresentação" },
      { time: "14:00 - 16:30", title: "SALA VIRTUAL 007 — GT5: Direito Empresarial, Direito Tributário e Direito do Consumidor", type: "Apresentação" },
      { time: "14:00 - 16:30", title: "SALA VIRTUAL 008 — GT6: Direito Digital, Governança e Novas Tecnologias | GT7: Direito do Trabalho e Processual do Trabalho", type: "Apresentação" },
      { time: "19:00 - 22:50", title: "PALESTRAS — Rogério Greco e Pedro Barretto", type: "Palestra" },
    ],
  },
  {
    id: "day3",
    date: "quinta, 27/08",
    activities: [
      { time: "00:01 - 23:59", title: "ONLINE — Quem decide o que você consome? Escolhas e influência na era digital", type: "Online" },
      { time: "08:00 - 11:40", title: "Advogar Não Basta: O Advogado que a IA Não Substitui", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Antes que Seja Tarde: A Linha de Frente Policial Contra o Feminicídio", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Balística forense (Turma 02)", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Capacitação teórico-prático em ITCMD: ponderações da legislação para a advocacia", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Direito & Agronegócio", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Do papel à Tribuna: prática previdenciária e técnicas de sustentação oral", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Estratégias para excelência na pesquisa, estudo e rigor metodológico", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Gestão de Escritório: do Planejamento ao Resultado", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Inovação no Direito: Autoridade, Ética, Marketing e Inteligência Artificial", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Método de negociação de Harvard: uma experiência prática", type: "Minicurso" },
      { time: "08:00 - 11:40", title: "Primeiros Passos na Advocacia: Construindo sua Carreira a partir dos Juizados Especiais", type: "Minicurso" },
      { time: "19:00 - 22:50", title: "PALESTRAS — Bruno Zampier", type: "Palestra" },
    ],
  },
];

export default function ScheduleBoard() {
  const [activeTab, setActiveTab] = useState(SCHEDULE_DATA[0].id);

  return (
    <section id="programacao" className="relative py-28 px-6 overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#8533f0] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[#e8aa1a] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-2">
            Atividades
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Programação do <span className="text-gold-glow">Evento</span>
          </h2>
        </div>

        {/* Board Container */}
        <div className="glass border border-[rgba(232,170,26,0.15)] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Tabs */}
          <div className="flex border-b border-[rgba(232,170,26,0.15)]">
            {SCHEDULE_DATA.map((day) => {
              const isActive = activeTab === day.id;
              return (
                <button
                  key={day.id}
                  onClick={() => setActiveTab(day.id)}
                  className={`flex-1 py-5 text-sm sm:text-base font-bold transition-all duration-300 relative ${
                    isActive
                      ? "text-[#e8aa1a] bg-[rgba(232,170,26,0.05)]"
                      : "text-[#a399b8] hover:text-white hover:bg-[rgba(255,255,255,0.02)]"
                  }`}
                >
                  {day.date}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-[#e8aa1a] shadow-[0_0_10px_rgba(232,170,26,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-10 min-h-[300px]">
            {SCHEDULE_DATA.map((day) => (
              <div
                key={day.id}
                className={`flex flex-col gap-4 transition-all duration-500 transform ${
                  activeTab === day.id
                    ? "opacity-100 translate-y-0 relative z-10"
                    : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                }`}
              >
                {day.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(26,0,51,0.4)] hover:bg-[rgba(43,0,87,0.6)] hover:border-[rgba(232,170,26,0.3)] transition-all duration-300 cursor-default"
                  >
                    {/* Linha dourada lateral (aparece no hover) */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#e8aa1a] group-hover:h-3/4 transition-all duration-300 rounded-r-full shadow-[0_0_8px_rgba(232,170,26,0.8)]" />

                    <div className="pl-4">
                      <span className="inline-block px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase mb-2 border border-[rgba(255,255,255,0.1)] text-[#c299ff]">
                        {activity.type}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e8aa1a] transition-colors">
                        {activity.title}
                      </h3>
                    </div>
                    <div className="pl-4 mt-3 sm:mt-0 sm:text-right flex-shrink-0">
                      <div className="flex items-center gap-2 text-[#a399b8] group-hover:text-white transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 text-[#e8aa1a]"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        <span className="font-mono text-sm">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
