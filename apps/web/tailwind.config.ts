import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7fd',
          100: '#ccf0fb',
          200: '#8ddcf8',
          300: '#5fccf5',
          400: '#32bcf2',
          500: '#19b6f0',
          600: '#0ea0d8',
          700: '#0b87b8',
          800: '#096d96',
          900: '#065473',
          950: '#032b3a',
        },
        brand: {
          red: '#681617',
          'red-light': '#8b1e1f',
          'red-dark': '#4a1010',
          olive: '#898257',
          'olive-light': '#a8a070',
          'olive-dark': '#6b6640',
          'blue-gray': '#a6bccf',
          'blue-gray-light': '#c4d4e0',
          'blue-gray-dark': '#7a96ad',
        },
        agro: {
          green: '#16a34a',
          yellow: '#ca8a04',
          brown: '#92400e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.10)',
        glow: '0 0 28px rgba(25,182,240,0.28)',
        'glow-sm': '0 0 12px rgba(25,182,240,0.18)',
        sidebar: '2px 0 20px rgba(0,0,0,0.06)',
        nav: '0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(145deg, #f0f9ff 0%, #e6f7fd 40%, #f8fafc 100%)',
        'blue-gradient': 'linear-gradient(135deg, #19b6f0 0%, #0b87b8 100%)',
        'blue-deep': 'linear-gradient(135deg, #096d96 0%, #032b3a 100%)',
        'red-gradient': 'linear-gradient(135deg, #681617 0%, #4a1010 100%)',
        'olive-gradient': 'linear-gradient(135deg, #898257 0%, #6b6640 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.35s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
