// const { guessProductionMode } = require("@ngneat/tailwind");

module.exports = {
  // prefix: "",
  //
  content: ["./src/**/*.{html,ts}"],
  // darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        "dm-sans": "'DM Sans', sans-serif",
      },
      colors: {
        "apicuron-purple": "#4D194D",
        "apicuron-red": '#9A031E',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
