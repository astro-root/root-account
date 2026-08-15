import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        line: '#E5E5E5',
        surface: '#FAFAFA',
        muted: '#737373',
        accent: '#171717',
        brand: '#6D28D9',
        gold: '#B45309',
        danger: '#DC2626',
        success: '#16A34A',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
