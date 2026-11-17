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
          salvia: '#DCE8D3',
          ciruela: '#633248',
          'ciruela-light': '#7A3F59',
          texto: '#382C35',
          'texto-suave': '#6B5A66',
          borde: '#E7D8CF',
        },
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Instrument Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        agenda: '14px',
      },
    },
  },
  plugins: [],
};
