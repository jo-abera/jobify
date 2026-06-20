/**
 * Tailwind configuration.
 *
 * Semantic color names (bg-card, text-primary, etc.) reference CSS variables
 * in index.css so light/dark mode does not require duplicate utility classes.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-card': 'var(--color-bg-card)',
        'bg-hover': 'var(--color-bg-hover)',
        'blue-primary': 'var(--color-blue-primary)',
        'blue-hover': 'var(--color-blue-hover)',
        'blue-light': 'var(--color-blue-light)',
        'blue-text': 'var(--color-blue-text)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        saved: 'var(--color-saved)',
        applied: 'var(--color-applied)',
        interviewing: 'var(--color-interviewing)',
        offered: 'var(--color-offered)',
        rejected: 'var(--color-rejected)'
      },
      borderRadius: {
        card: '12px'
      }
    }
  },
  plugins: []
}
