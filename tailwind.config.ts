import type { Config } from 'tailwindcss';

/**
 * Design tokens theo storyboard:
 * #8B0000 đỏ đậm (primary) · #D4AF37 vàng (gold) · #FFF8E7 kem (cream)
 * #333333 chữ · #F5F5F5 nền · Font: Noto Sans / Roboto
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: '#8B0000', foreground: '#FFFFFF', dark: '#6d0000', light: '#a51212' },
        gold: { DEFAULT: '#D4AF37', light: '#e6cc7a', dark: '#b8952b' },
        cream: { DEFAULT: '#F8F2E8', dark: '#efe4cf' },
        ink: '#1C1917',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: '#dc2626', foreground: '#ffffff' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'Roboto', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif"', '"Times New Roman"', 'Georgia', 'serif'],
      },
      borderRadius: { lg: '12px', md: '10px', sm: '8px' },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in .3s ease-out both' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
