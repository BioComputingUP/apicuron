import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";

export default {
  prefix: "tw-",
  content: ["./src/**/*.{html,ts}", "./src/app/**/*.{html,ts}", "./projects/apicuron-util/**/*.{html,ts}"],
  darkMode: "class",
  safeList: [
    {
      pattern: "odd:bg-gray-50",
      variants: ["odd"],
    },
    "odd:bg-gray-50",
  ],
  // darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        "dm-sans": "'DM Sans', sans-serif",
      },
      colors: {
        "apicuron-purple": "#4D194D",
        "apicuron-bright-purple": "#742574",
        "apicuron-purple-100": "hsl(300, 51%, 89%)",
        "apicuron-purple-500": "hsl(300, 51%, 40%)",
        "apicuron-red": "#9A031E",
        invalidation: "#b33e27",
        revision: "#bd9522",
        generation: "#41915f",
        // orange: {
        //   50: '#fff7ed',
        //   100: '#ffedd5',
        //   200: '#fed7aa',
        //   300: '#fdba74',
        //   400: '#fb923c',
        //   500: '#f97316',
        //   600: '#ea580c',
        //   700: '#c2410c',
        //   800: '#9a3412',
        // }
      },

      // borderWidth: ['hover']
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    typography,
    containerQueries
  ],
};
