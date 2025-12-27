/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: '#FFFFFF', // White background
        secondary: '#1a1a1a', // Dark text
        accent: '#F0769C', // Soft Pink from logo
        'accent-light': '#FDF2F5', // Very light pink for backgrounds
        'accent-hover': '#E05580', // Slightly darker pink for hover
        muted: '#6B7280', // Gray for secondary text
        'muted-light': '#9CA3AF', // Lighter gray
        surface: '#F9FAFB', // Light gray surface
        'surface-dark': '#F3F4F6', // Slightly darker surface
        border: '#E5E7EB', // Border color
      },
    },
  },
  plugins: [],
};
