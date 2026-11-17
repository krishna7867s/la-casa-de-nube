import React from 'react';

// Nube suave dibujada a mano con rubor delicado
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
      {/* Rubor rosa suave tipo papelería japonesa */}
      <circle cx="10" cy="14" r="1.5" fill="#F7D8DF" />
      <circle cx="22" cy="14" r="1.5" fill="#F7D8DF" />
      {/* Ojos y sonrisa sutil */}
      <circle cx="12.5" cy="12.5" r="0.75" fill="#382C35" />
      <circle cx="19.5" cy="12.5" r="0.75" fill="#382C35" />
      <path d="M15 14C15.5 14.8 16.5 14.8 17 14" stroke="#382C35" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

// Pequeña fresa kawaii de Nube de Fresa con trazos finos
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
      {/* Semillitas en ciruela tenue */}
      <circle cx="9" cy="10" r="0.6" fill="#633248" />
      <circle cx="12" cy="10" r="0.6" fill="#633248" />
      <circle cx="15" cy="10" r="0.6" fill="#633248" />
      <circle cx="10.5" cy="14" r="0.6" fill="#633248" />
      <circle cx="13.5" cy="14" r="0.6" fill="#633248" />
      <circle cx="12" cy="18" r="0.5" fill="#633248" />
    </svg>
  );
}

// Sobre de carta con sello fino
export function EnvelopeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="15" rx="2" fill="#FFFDF8" stroke="#633248" strokeWidth="1.1" />
      <path d="M3 3L12 11L21 3" stroke="#633248" strokeWidth="1" strokeLinecap="round" />
      <circle cx="12" cy="11" r="2" fill="#F7D8DF" stroke="#633248" strokeWidth="0.8" />
    </svg>
  );
}

// Borde de encaje / festoneado decorativo inspirado en My Melody
export function ScallopHeaderLace({ className = 'w-full h-3 text-nube-rosa' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 12" fill="currentColor" preserveAspectRatio="none">
      <path d="M0,0 Q12.5,12 25,0 Q37.5,12 50,0 Q62.5,12 75,0 Q87.5,12 100,0 Q112.5,12 125,0 Q137.5,12 150,0 Q162.5,12 175,0 Q187.5,12 200,0 Q212.5,12 225,0 Q237.5,12 250,0 Q262.5,12 275,0 Q287.5,12 300,0 Q312.5,12 325,0 Q337.5,12 350,0 Q362.5,12 375,0 Q387.5,12 400,0 Q412.5,12 425,0 Q437.5,12 450,0 Q462.5,12 475,0 Q487.5,12 500,0 Q512.5,12 525,0 Q537.5,12 550,0 Q562.5,12 575,0 Q587.5,12 600,0 L600,0 L0,0 Z" />
    </svg>
  );
}
