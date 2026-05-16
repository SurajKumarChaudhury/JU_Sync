/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        textReveal: {
          '0%': { opacity: '0', letterSpacing: '-0.2em', filter: 'blur(8px)' },
          '100%': { opacity: '1', letterSpacing: '0.05em', filter: 'blur(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        tilt: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        glow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
        }
      },
      animation: {
        'zoom-in': 'zoomIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'text-reveal': 'textReveal 1.2s cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        'fade-up': 'fadeUp 1.5s ease forwards',
        'float': 'float 4s ease-in-out infinite',
        'tilt': 'tilt 5s ease-in-out infinite',
        'blob': 'blob 10s infinite',
        'glow': 'glow 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}