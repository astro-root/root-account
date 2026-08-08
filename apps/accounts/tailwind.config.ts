import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: '#0B1220',
          surface: '#141F33',
          surface2: '#1B2740',
          border: '#28324A',
          text: '#E8ECF4',
          muted: '#8792A8',
        },
        brass: {
          DEFAULT: '#E3A857',
          dim: '#B8862B',
        },
        sage: {
          DEFAULT: '#4FA37D',
          dim: '#2F6B52',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(232,236,244,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(232,236,244,0.035) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
    },
  },
  plugins: [],
} satisfies Config
