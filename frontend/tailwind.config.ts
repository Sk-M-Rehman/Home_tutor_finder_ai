import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 500: '#4f46e5', 600: '#4338ca', 700: '#3730a3', 800: '#312e81', 900: '#1e1b4b', 950: '#0f172a' },
        accent: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59' },
      },
      boxShadow: { card: '0 1px 3px rgba(30,27,75,.08), 0 4px 12px rgba(30,27,75,.06)' },
    },
  },
  plugins: [],
};
export default config;
