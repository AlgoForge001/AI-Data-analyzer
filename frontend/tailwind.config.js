/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--color-pure-white) / <alpha-value>)',
        anthropic: {
          'near-black': 'rgb(var(--color-near-black) / <alpha-value>)',
          'dark-surface': 'rgb(var(--color-dark-surface) / <alpha-value>)',
          'dark-warm': 'rgb(var(--color-dark-warm) / <alpha-value>)',
          'charcoal-warm': 'rgb(var(--color-charcoal-warm) / <alpha-value>)',
          'olive-gray': 'rgb(var(--color-olive-gray) / <alpha-value>)',
          'stone-gray': 'rgb(var(--color-stone-gray) / <alpha-value>)',
          'warm-silver': 'rgb(var(--color-warm-silver) / <alpha-value>)',
          'parchment': 'rgb(var(--color-parchment) / <alpha-value>)',
          'ivory': 'rgb(var(--color-ivory) / <alpha-value>)',
          'pure-white': 'rgb(var(--color-pure-white) / <alpha-value>)',
          'warm-sand': 'rgb(var(--color-warm-sand) / <alpha-value>)',
          'border-cream': 'rgb(var(--color-border-cream) / <alpha-value>)',
          'border-warm': 'rgb(var(--color-border-warm) / <alpha-value>)',
          'border-dark': 'rgb(var(--color-border-dark) / <alpha-value>)',
          'terracotta': 'rgb(var(--color-terracotta) / <alpha-value>)',
          'coral': 'rgb(var(--color-coral) / <alpha-value>)',
          'error': 'rgb(var(--color-error) / <alpha-value>)',
          'focus': 'rgb(var(--color-focus) / <alpha-value>)',
          'ring-warm': 'rgb(var(--color-ring-warm) / <alpha-value>)',
          'ring-subtle': 'rgb(var(--color-ring-subtle) / <alpha-value>)',
          'ring-deep': 'rgb(var(--color-ring-deep) / <alpha-value>)'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['monospace'],
      },
      boxShadow: {
        'ring-warm': '0px 0px 0px 1px rgb(var(--color-ring-warm))',
        'ring-subtle': '0px 0px 0px 1px rgb(var(--color-ring-subtle))',
        'ring-deep': '0px 0px 0px 1px rgb(var(--color-ring-deep))',
        'ring-terracotta': '0px 0px 0px 1px rgb(var(--color-terracotta))',
        'ring-dark': '0px 0px 0px 1px rgb(var(--color-border-dark))',
        'whisper': '0px 4px 24px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
