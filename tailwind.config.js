/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        supremeRed: "#ee2c29",
      },
      fontFamily: {
        courierPrime: ["Courier Prime", "monospace"],
      },
    },
  },
  plugins: [],
};
