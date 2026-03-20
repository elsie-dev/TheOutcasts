/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:        '#07090f',
        surface:   '#0e1221',
        surface2:  '#162036',
        surface3:  '#1d2a45',
        bdr:       '#1c2d4a',
        bdr2:      '#253d62',
        tx:        '#dde6f3',
        tx2:       '#7a9bbf',
        txm:       '#3a5880',
        cgreen:    '#22c55e',
        cred:      '#ef4444',
        camber:    '#f59e0b',
        cblue:     '#4f8ef5',
        cpurple:   '#a78bfa',
        corange:   '#f97316',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'slide-up':  'slide-up 0.25s ease',
        'fade-in':   'fade-in 0.3s ease',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)'   },
          '50%':      { opacity: '0.4', transform: 'scale(1.7)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)'   },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%231c2d4a' stroke-width='0.5'%3E%3Cpath d='M0 40L40 0M0 0l40 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
