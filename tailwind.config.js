module.exports = {
  prefix: 'tw-',
  content: ["./src/**/*.{html,ts}", "./src/app/**/*.{html,ts}"],
  // darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        "dm-sans": "'DM Sans', sans-serif",
      },
      colors: {
        "apicuron-purple": "#4D194D",
        "apicuron-red": "#9A031E",
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
  plugins: [],
};
