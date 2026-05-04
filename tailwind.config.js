/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F8F7F2',
        dark: '#1B2A4A',
        mid: '#6B6B67',
        light: '#A8A8A4',
        border: '#E4E1D8',
        accent: {
          DEFAULT: '#F5A623',
          light: '#FEF3DC',
          dark: '#D4891A',
        },
        green: {
          DEFAULT: '#2D7A4F',
          light: '#E1F5EE',
        },
        blue: {
          DEFAULT: '#1A5EA8',
          light: '#E6F1FB',
        },
        red: {
          DEFAULT: '#A32D2D',
          light: '#FCEBEB',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        lg: '14px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,.07)',
        'card-hover': '0 8px 32px rgba(0,0,0,.11)',
      },
    },
  },
  plugins: [],
}
