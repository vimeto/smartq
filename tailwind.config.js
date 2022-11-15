/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    container: false
  },
  // purge: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    ({ addComponents }) => {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '640px',
          },
          '@screen md': {
            maxWidth: '640px',
          },
          '@screen lg': {
            maxWidth: '640px',
          },
          '@screen xl': {
            maxWidth: '640px',
          },
        }
      })
    },
    require("daisyui"),
  ],
  daisyui: {
    themes: false,
  },
}
