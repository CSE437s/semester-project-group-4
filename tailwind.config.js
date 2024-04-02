/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}",
  "node_modules/flowbite-react/lib/esm/**/*.js"],
  theme: {
    extend: {colors: {
      'custom-purple': '#5C63FF',
    },},
  },
  plugins: [require('flowbite/plugin')],
  
}

// module.exports = {
//   darkMode: 'className',
//   // ...
// }
