import React from 'react';

// Nube de Fresa artesanal con mejillas sonrosadas y trazos limpios de papelería
export function CloudIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.5 20C5.5 20 3 17.5 3 14.2C3 11.2 5.2 8.7 8.1 8.5C9 4.8 12.3 2 16.2 2C20.6 2 24.1 5.3 24.6 9.6C27.2 10.1 29 12.3 29 15C29 17.8 26.8 20 24 20H8.5Z"
        fill="#FFFDF8"
        stroke="#633248"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Rubor rosa suave */}
      <circle cx="10" cy="14" r="1.6" fill="#F7D8DF" />
      <circle cx="22" cy="14" r="1.6" fill="#F7D8DF" />
      {/* Ojos serenos */}
      <circle cx="12.5" cy="12.5" r="0.8" fill="#382C35" />
      <circle cx="19.5" cy="12.5" r="0.8" fill="#382C35" />
      <path d="M15 14C15.5 14.7 16.5 14.7 17 14" stroke="#382C35" strokeWidth="0.85" strokeLinecap="round" />
    </svg>
  );
}

// Fresa kawaii de papelería con hojitas verde salvia
export function StrawberryIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hojitas verde salvia */}
      <path
        d="M12 2C10.8 1 8.8 1.5 8 2.8C9.2 3.8 10.2 4.2 12 4.5C13.8 4.2 14.8 3.8 16 2.8C15.2 1.5 13.2 1 12 2Z"
        fill="#DCE8D3"
        stroke="#633248"
        strokeWidth="0.9"
      />
      {/* Fruto rosa empolvado */}
      <path
        d="M12 5C7.8 5 5 8 5.5 13C6.2 18 10 21.5 12 22C14 21.5 17.8 18 18.5 13C19 8 16.2 5 12 5Z"
        fill="#F7D8DF"
        stroke="#633248"
        strokeWidth="1.1"
      />
      {/* Semillitas en ciruela */}
      <circle cx="9" cy="10" r="0.6" fill="#633248" />
      <circle cx="12" cy="10" r="0.6" fill="#633248" />
      <circle cx="15" cy="10" r="0.6" fill="#633248" />
      <circle cx="10.5" cy="14" r="0.6" fill="#633248" />
      <circle cx="13.5" cy="14" r="0.6" fill="#633248" />
      <circle cx="12" cy="18" r="0.5" fill="#633248" />
    </svg>
  );
}

// Clip de papelería estilo alambre vintage
export function PaperclipIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.5 6.5L9.5 13.5C8.4 14.6 8.4 16.4 9.5 17.5C10.6 18.6 12.4 18.6 13.5 17.5L20 11C21.7 9.3 21.7 6.7 20 5C18.3 3.3 15.7 3.3 14 5L7 12C4.8 14.2 4.8 17.8 7 20C9.2 22.2 12.8 22.2 15 20L21 14"
        stroke="#633248"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sello postal vintage japonés con borde dentado
export function PostageStampIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fondo dentado de sello */}
      <rect x="2" y="2" width="32" height="38" rx="2" fill="#FFFDF8" stroke="#633248" strokeWidth="1" strokeDasharray="2 2" />
      <rect x="5" y="5" width="26" height="32" fill="#F7D8DF" fillOpacity="0.4" stroke="#E7D8CF" strokeWidth="0.8" />
      {/* Mini fresa central */}
      <circle cx="18" cy="20" r="5" fill="#F7D8DF" stroke="#633248" strokeWidth="0.8" />
      <circle cx="18" cy="20" r="2" fill="#633248" fillOpacity="0.2" />
      {/* Texto de sello */}
      <text x="18" y="11" textAnchor="middle" fill="#633248" fontSize="4.5" fontFamily="sans-serif" fontWeight="700">CR · 2026</text>
      <text x="18" y="33" textAnchor="middle" fill="#633248" fontSize="3.8" fontFamily="sans-serif" letterSpacing="0.05em">NUBE FRESA</text>
    </svg>
  );
}

// Borde de encaje / festoneado decorativo tipo My Melody
export function ScallopHeaderLace({ className = 'w-full h-3 text-[#F7D8DF]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 12" fill="currentColor" preserveAspectRatio="none">
      <path d="M0,0 Q12.5,12 25,0 Q37.5,12 50,0 Q62.5,12 75,0 Q87.5,12 100,0 Q112.5,12 125,0 Q137.5,12 150,0 Q162.5,12 175,0 Q187.5,12 200,0 Q212.5,12 225,0 Q237.5,12 250,0 Q262.5,12 275,0 Q287.5,12 300,0 Q312.5,12 325,0 Q337.5,12 350,0 Q362.5,12 375,0 Q387.5,12 400,0 Q412.5,12 425,0 Q437.5,12 450,0 Q462.5,12 475,0 Q487.5,12 500,0 Q512.5,12 525,0 Q537.5,12 550,0 Q562.5,12 575,0 Q587.5,12 600,0 L600,0 L0,0 Z" />
    </svg>
  );
}

// Fila de anillas de libreta (efecto espiral de agenda)
export function SpiralBinderRings({ count = 8, className = '' }: { count?: number; className?: string }) {
  const rings = Array.from({ length: count });
  return (
    <div className={`flex flex-col justify-around py-4 ${className}`}>
      {rings.map((_, i) => (
        <div key={i} className="relative flex items-center justify-center my-1.5">
          {/* Anilla metálica curva */}
          <div className="w-5 h-2.5 rounded-full border-[1.5px] border-[#633248] bg-[#F7D8DF]/60 shadow-xs z-10 -ml-2" />
          {/* Agujero perforado en el papel */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#E5D7CC] border border-[#CDBEAF] shadow-inner" />
        </div>
      ))}
    </div>
  );
}
