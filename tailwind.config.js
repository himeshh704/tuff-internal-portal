/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f9ff',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#554336',
        primary: '#8d4b00',
        'primary-amber': '#d97706',
        'primary-container': '#b15f00',
        'primary-fixed': '#ffdcc3',
        'primary-fixed-dim': '#ffb77d',
        'on-primary': '#ffffff',
        'on-primary-fixed': '#2f1500',
        secondary: '#565e74',
        'secondary-container': '#dae2fd',
        tertiary: '#0051d5',
        'tertiary-container': '#316bf3',
        outline: '#887364',
        'outline-variant': '#dbc2b0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
