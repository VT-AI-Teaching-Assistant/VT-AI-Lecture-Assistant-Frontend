/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vt-maroon': '#630031',
        'vt-orange': '#FF6600',
        'vt-gray': '#54585A',
        'vt-light-gray': '#F5F5F5',
        maroon: {
          DEFAULT: '#861F41',
          dark: '#6b1934',
          light: '#a12650',
        },
        orange: {
          DEFAULT: '#E5751F',
          dark: '#c46319',
          light: '#f18a3f',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in forwards',
        'fade-in-delay': 'fadeIn 0.6s ease-in 0.2s forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-up-delay': 'slideUp 0.6s ease-out 0.1s forwards',
        'rise': 'rise 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'rise-d1': 'rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
        'rise-d2': 'rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
        'rise-d3': 'rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s forwards',
        'rise-d4': 'rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s forwards',
        'rise-d5': 'rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards',
        'reveal': 'reveal 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'reveal-d1': 'reveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards',
        'reveal-d2': 'reveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in-right': 'slideInRight 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} 