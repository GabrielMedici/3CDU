export default function LocationSection() {
  const address = "Av. Guedner, 1610, Jardim Aclimação, Maringá - PR, 87050-900";

  return (
    <section id="localizacao" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.3em] text-[#e8aa1a] uppercase mb-2">
            Onde Estaremos
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Localização do <span className="text-gold-glow">Evento</span>
          </h2>
        </div>

        <div className="glass border-gold-glow rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">Campus UniCesumar</h3>
            <p className="text-[#e8aa1a] font-semibold mb-4">Maringá - PR</p>
            <p className="text-[#a399b8] leading-relaxed mb-6">
              O evento será realizado no auditório principal do campus sede da UniCesumar.
              Um espaço moderno, com estrutura de ponta para receber congressistas, salas de
              apresentações científicas e amplas áreas de convivência.
            </p>

            <p className="text-xs font-bold tracking-[0.2em] text-[#e8aa1a] uppercase mb-1">
              Endereço Completo
            </p>
            <p className="text-white font-medium mb-6">{address}</p>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              id="localizacao-mapa-btn"
              className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
              Traçar Rota no Mapa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
