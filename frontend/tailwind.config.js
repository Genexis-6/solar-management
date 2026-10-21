/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        pastel: {
          mint: {
            DEFAULT: '#D5EBE5',
            light: '#E5F4F0',
            dark: '#225B50',
            border: '#BFE0D7',
          },
          pink: {
            DEFAULT: '#FCD8E2',
            light: '#FDECF0',
            dark: '#7D2944',
            border: '#F9BED0',
          },
          yellow: {
            DEFAULT: '#FDE896',
            light: '#FEF6D2',
            dark: '#7A5B0B',
            border: '#F6DB75',
          },
          purple: {
            DEFAULT: '#EAE2F8',
            light: '#F4EFFC',
            dark: '#543B88',
            border: '#D8CBF3',
          },
          blue: {
            DEFAULT: '#DCEBFA',
            light: '#EEF5FD',
            dark: '#215286',
            border: '#C2DCF5',
          },
          canvas: '#EAEFF2',
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      boxShadow: {
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.02)',
        'floating': '0 25px 60px -15px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
