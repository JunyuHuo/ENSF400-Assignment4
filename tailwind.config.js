/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx,js,jsx}',
    './src/components/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cinematic: {
          bg: '#0a0a0a',
          bgAlt: '#111111',
          red: '#e50914',
          redDeep: '#c0392b',
          grayLight: '#e6e6e6',
          grayMuted: '#cfcfcf',
        },
      },
      fontFamily: {
        heading: ['Georgia', 'Times New Roman', 'serif'],
        display: ['"Oswald"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cinematic-strong': '0 30px 60px rgba(0,0,0,0.65)',
      },
    },
  },
  plugins: [],
};
