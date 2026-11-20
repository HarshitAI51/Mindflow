/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFFFF',
          100: '#FFFDF9', // Floating card surface (Ref 4 & 5)
          200: '#FAF5EC', // Base page background
          300: '#EFE6D5', // Borders & dividers
        },
        sage: {
          light: '#E2EBE0',
          DEFAULT: '#D0DCD0', // Section background (Ref 4)
          dark: '#2A483A',    // Primary deep text/buttons
        },
        pastel: {
          pink: '#FADCD9',    // Ref 5 Soft Pink
          pinkText: '#7A221E',
          yellow: '#FCE8CC',  // Ref 5 Peach/Yellow
          yellowText: '#6E4515',
          mint: '#D8EFE0',    // Ref 5 Soft Mint
          mintText: '#1B5233',
          purple: '#E5DFFB',  // Ref 5 Soft Purple
          purpleText: '#3D2A78',
          blue: '#D2E6F5',
          blueText: '#18486B',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}