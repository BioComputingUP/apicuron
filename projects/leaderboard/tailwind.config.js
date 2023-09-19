module.exports = {
  prefix: "tw-",
  content: [
    "./projects/leaderboard/src/app/leaderboard/*.{html,ts}",
    // "./src/app/leaderboard/**/*.{html,ts}",
  ],
  darkMode: "class",
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
        "test-color": '#fff',
        invalidation: "#F76135",
        revision: "#EDBF3A",
        generation: "#59C794",
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
  ],
};
