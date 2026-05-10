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
        brand: {
          red: '#B42225',
          'red-dark': '#8f1b1e',
          orange: '#FF8C00',
          'off-white': '#FFF8F5',
          black: '#0A0A0A',
        },
        gray: {
          900: '#111111',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#444444',
          500: '#555555',
          400: '#888888',
          300: '#cccccc',
          200: '#e5e5e5',
          100: '#f5f5f5',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #B42225, #FF8C00)',
        'brand-gradient-reverse': 'linear-gradient(135deg, #FF8C00, #B42225)',
      },
      boxShadow: {
        brand: '0 2px 8px rgba(0,0,0,.08)',
        'brand-md': '0 8px 32px rgba(0,0,0,.12)',
        'brand-lg': '0 20px 60px rgba(0,0,0,.18)',
        'brand-xl': '0 32px 80px rgba(0,0,0,.24)',
        'red-glow': '0 4px 14px rgba(180,34,37,.25)',
        'orange-glow': '0 4px 14px rgba(255,140,0,.4)',
      },
      borderRadius: {
        'brand-sm': '8px',
        'brand-md': '14px',
        'brand-lg': '20px',
        'brand-xl': '28px',
      },
      animation: {
        ticker: 'ticker 32s linear infinite',
        'float-y': 'floatY 5s ease-in-out infinite',
        'float-y-2': 'floatY 6s ease-in-out infinite 0.8s',
        'float-y-3': 'floatY 7s ease-in-out infinite 0.4s',
        'orb-float': 'orbFloat 8s ease-in-out infinite',
        'orb-float-2': 'orbFloat 10s ease-in-out infinite reverse',
        'orb-float-3': 'orbFloat 12s ease-in-out infinite',
        'loader-pulse': 'loaderPulse 1s ease-in-out infinite',
        'loader-bar': 'loaderBar 1.2s ease-out forwards',
        'loader-dot-1': 'loaderDot 0.9s ease-in-out infinite',
        'loader-dot-2': 'loaderDot 0.9s ease-in-out 0.15s infinite',
        'loader-dot-3': 'loaderDot 0.9s ease-in-out 0.3s infinite',
        'bolt-pulse': 'boltPulse 2s ease-in-out infinite',
        'live-pulse': 'livePulse 2s ease-in-out infinite',
        'colon-blink': 'colonBlink 1s step-end infinite',
        'scroll-wheel': 'scrollWheel 1.5s ease-in-out infinite',
        'notif-slide': 'notifSlide 0.8s ease 0.5s both',
        'fade-in': 'fadeIn 0.3s ease',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        flip: 'flipAnim 0.3s ease-in-out',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-13px)' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'scale(1) translate(0,0)' },
          '33%': { transform: 'scale(1.05) translate(18px,-12px)' },
          '66%': { transform: 'scale(0.97) translate(-8px,8px)' },
        },
        loaderPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.06)', opacity: '0.85' },
        },
        loaderBar: {
          '0%': { width: '0' },
          '40%': { width: '60%' },
          '70%': { width: '80%' },
          '100%': { width: '100%' },
        },
        loaderDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        boltPulse: {
          '0%, 100%': { boxShadow: '0 4px 14px rgba(255,140,0,.4)' },
          '50%': { boxShadow: '0 4px 26px rgba(255,140,0,.7)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        colonBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scrollWheel: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        notifSlide: {
          from: { opacity: '0', transform: 'translateX(-28px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        flipAnim: {
          '0%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
