import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B4F1B',
          dark: '#143d14',
        },
        grove: {
          DEFAULT: '#2E7D32',
          light: '#3a9440',
          mint: '#EDF3ED',
        },
        gold: {
          DEFAULT: '#F0B429',
          dark: '#e0a516',
        },
        ink: '#1A1D1A',
        muted: '#707A70',
        subtle: '#4a544a',
        sage: '#8DBE2E',
        site: '#F9FAFB',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(27,79,27,0.07)',
        'card-hover': '0 10px 30px rgba(27,79,27,0.13)',
        'card-featured': '0 8px 34px rgba(27,79,27,0.16)',
        'gold-glow': '0 4px 18px rgba(240,180,41,0.28)',
        calc: '0 6px 34px rgba(27,79,27,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
