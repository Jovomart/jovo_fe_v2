import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0E0E10',
        cream: {
          DEFAULT: '#FBEFE3',
          deep: '#F6E2CF',
          light: '#FDF8F2',
        },
        sand: '#F7F3EC',
        sky: {
          DEFAULT: '#D9EBF8',
          deep: '#C2DFF3',
          soft: '#EAF4FB',
        },
        mint: {
          DEFAULT: '#D3E8D9',
          deep: '#B7DBC3',
        },
        lilac: {
          DEFAULT: '#DCCBF6',
          deep: '#C6ACEF',
        },
        peach: '#FBD9C2',
        brand: {
          red: '#B42225',
          'red-dark': '#8f1b1e',
          orange: '#FF8C00',
          'off-white': '#FBEFE3',
          black: '#0A0A0A',
        },
      },
      fontFamily: {
        display: ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      borderRadius: {
        'brand-sm': '10px',
        'brand-md': '16px',
        'brand-lg': '24px',
        'brand-xl': '32px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14,14,16,.04), 0 18px 40px -28px rgba(14,14,16,.25)',
        lift: '0 24px 64px -34px rgba(14,14,16,.35)',
        pill: '0 12px 28px -14px rgba(14,14,16,.5)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(.22,.61,.36,1)',
      },
      animation: {
        ticker: 'ticker 42s linear infinite',
        float: 'floatY 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'pop-in': 'popIn .3s cubic-bezier(.22,.61,.36,1)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.55', transform: 'scale(.86)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'translateY(6px) scale(.98)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [],
}

export default config
