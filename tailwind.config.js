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
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in forwards',
        'fade-in-delay': 'fadeIn 0.6s ease-in 0.2s forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-up-delay': 'slideUp 0.6s ease-out 0.1s forwards',
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
      },
    },
  },
  plugins: [],
} 