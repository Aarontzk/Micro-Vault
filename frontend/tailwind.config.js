/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ThaiCloud brand palette (PMS-matched)
        primary: '#0671B8',          // CTAs, links, focus, active — blue
        'primary-hover': '#035897',  // darker blue hover
        'primary-dark': '#035897',   // alias
        secondary: '#00A8A7',        // teal brand highlight
        neutral: '#9C9C9C',          // muted text, placeholders, disabled
        background: '#FAFAFA',       // page bg
        surface: '#FFFFFF',          // cards, panels, nav
        ink: {
          DEFAULT: '#0A0A0A',        // headings / body (near-black)
          secondary: '#6B6B6B',      // descriptions / metadata
        },
        edge: '#E8E8EC',             // borders, dividers
        success: '#00A8A7',          // teal
        warning: '#FAB217',          // gold
        error: '#F37521',            // orange
        info: '#60C7D3',             // light-blue
        // Biosafety levels mapped to semantic states
        'bsl-1': '#00A8A7',
        'bsl-2': '#FAB217',
        'bsl-3': '#F37521',
        'bsl-4': '#C0392B',
      },
      fontFamily: {
        sans: ['Merriweather', '"Book Antiqua"', 'Palatino', 'Georgia', 'serif'],
        display: ['Merriweather', '"Book Antiqua"', 'Palatino', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,0.08)',     // card hover
        glow: '0 4px 12px rgba(6,113,184,0.35)', // primary button hover
        focus: '0 0 0 3px rgba(6,113,184,0.12)', // focus ring
      },
    },
  },
  plugins: [],
}
