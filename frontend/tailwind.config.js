/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
      'side': '96px',
    },
    colors:{
      'primaryColor': '#b52327',
      'secondaryColor': '#338779',
    },
   
     keyframes:{
      ringing: {
    '0%': {
      boxShadow: '0 0 0 0 rgba(181,35,39,0.7)',
    },
    '40%': {
      boxShadow: '0 0 0 10px rgba(181,35,39,0.3)',
    },
    '70%': {
      boxShadow: '0 0 0 15px rgba(181,35,39,0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(181,35,39,0)',
    },
  },
  marquee: {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' },
  },
  marqueeReverse: {
    '0%': { transform: 'translateX(-50%)' },
    '100%': { transform: 'translateX(0)' },
  },
},
animation: {
  ringing: 'ringing 1.2s ease-out infinite',
  marquee: 'marquee 60s linear infinite',
  'marquee-reverse': 'marqueeReverse 60s linear infinite',
},
    },
  },
  plugins: [],
}

