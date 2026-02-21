/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Public Sans"', 'sans-serif'],
      },
      colors: {
        neo: {
          black:      '#000000',
          paper:      '#F4F3EE',
          lemon:      '#FFEAA7',
          coral:      '#FF7675',
          mint:       '#55EFC4',
          periwinkle: '#6C5CE7',
          blue:       '#74b9ff',
          dark:       '#2d3436',
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neo-md': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'neo-xl': '8px 8px 0px 0px rgba(0,0,0,1)',
      }
    }
  },
  plugins: [],
}
