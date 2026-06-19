"use client";

import { useState } from "react";

const SCHEDULE_DATA = [
  {
    id: "day1",
    date: "terça, 25/08",
    activities: [
      {
        time: "09:00 - 11:40",
        title: "EXPOSIÇÃO DE PAINEL (BANNER)",
        type: "Exposição",
      },
      {
        time: "19:00 - 22:50",
        title: "PALESTRA DE ABERTURA",
        type: "Palestra",
      },
    ],
  },
  {
    id: "day2",
    date: "quarta, 26/08",
    activities: [
      {
        time: "08:00 - 11:40",
        title: "MINICURSOS",
        type: "Curso",
      },
      {
        time: "14:00 - 17:30",
        title: "APRESENTAÇÃO VIRTUAL DE ARTIGO CIENTÍFICO",
        type: "Apresentação",
      },
      {
        time: "19:00 - 22:50",
        title: "PALESTRAS",
        type: "Palestra",
      },
    ],
  },
  {
    id: "day3",
    date: "quinta, 27/08",
    activities: [
      {
        time: "08:00 - 11:40",
        title: "MINICURSOS",
        type: "Curso",
      },
      {
        time: "19:00 - 22:50",
        title: "PALESTRAS",
        type: "Palestra",
      },
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
