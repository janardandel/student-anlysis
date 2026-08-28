/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitthu: {
          red: '#F40009',
          'red-dark': '#A30006',
          'red-light': 'rgba(244,0,9,0.15)',
          'red-glow': 'rgba(244,0,9,0.25)',
          base: '#0D0D0D',
          surface: '#161616',
          elevated: '#1E1E1E',
          card: '#1A1A1A',
          input: '#242424',
          border: '#2A2A2A',
          'border-light': '#333333',
          text: '#F0F0F0',
          'text-secondary': '#A0A0A0',
          'text-muted': '#777777',
        }
      },
      boxShadow: {
        'pitthu-red': '0 8px 32px rgba(244,0,9,0.3)',
        'pitthu-card': '0 4px 20px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}
