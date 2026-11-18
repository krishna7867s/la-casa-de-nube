/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nube: {
          crema: '#FFF8EF',
          hoja: '#FFFDF8',
          rosa: '#F7D8DF',
          'rosa-suave': '#FCEEF1',
          salvia: '#DCE8D3',
          'salvia-suave': '#EFF5EC',
          mantequilla: '#FFF2D6',
          lavanda: '#EBDCE8',
          arena: '#F5EDE4',
          ciruela: '#633248',
          'ciruela-light': '#7A3F59',
          'ciruela-dark': '#482133',
          terracota: '#9E4758',
          texto: '#382C35',
          'texto-suave': '#6B5A66',
          borde: '#E7D8CF',
          'borde-fino': '#EFE4DC',
        },
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Instrument Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        agenda: '16px',
        card: '12px',
      },
      boxShadow: {
        agenda: '0 4px 20px rgba(99, 50, 72, 0.05)',
        sello: '0 2px 8px rgba(99, 50, 72, 0.08)',
        memo: '0 2px 6px rgba(99, 50, 72, 0.04)',
      },
    },
  },
  plugins: [],
};
