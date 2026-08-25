"use client";

import { useState } from "react";

const FAQ_DATA = [
  {
    q: "O evento possui certificado de horas complementares?",
    a: "Sim! Todos os participantes que atingirem a frequência mínima receberão um certificado de 30 horas complementares, válido para comprovação de atividades acadêmicas extracurriculares.",
  },
  {
    q: "Posso submeter um trabalho científico se não for aluno da UniCesumar?",
    a: "Com certeza. O 3CDU é aberto para estudantes e pesquisadores de todas as instituições de ensino do Brasil. Consulte o edital no painel do Even3 para conferir as regras de submissão.",
  },
  {
    q: "Como funciona a apresentação dos trabalhos?",
    a: "Os trabalhos aprovados serão apresentados em formato de Banner Digital ou Comunicação Oral, de acordo com a modalidade escolhida durante a submissão. Os horários e salas serão divulgados próximo à data do evento.",
  },
  {
    q: "As palestras serão transmitidas online?",
    a: "Não. Para garantir a melhor experiência de networking e imersão, o 3CDU será um evento 100% presencial, realizado no campus sede da UniCesumar em Maringá.",
  },
  {
    q: "Até quando posso garantir meu ingresso?",
    a: "As vagas são limitadas devido à capacidade do auditório. Os ingressos serão vendidos até esgotarem os lotes. Recomendamos garantir o seu o quanto antes para não ficar de fora.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-2">
            Tire suas Dúvidas
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Perguntas <span className="text-gold-glow">Frequentes</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass border border-[rgba(232,170,26,0.15)] rounded-2xl overflow-hidden"
              >
                <button
                  id={`faq-toggle-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-sm sm:text-base font-bold text-white">{item.q}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#e8aa1a"
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <div
                  className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-[#a399b8] leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
