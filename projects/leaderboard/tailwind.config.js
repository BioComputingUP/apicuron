const mainConfig = require("../../tailwind.config");

mainConfig.content = [
  "./projects/apicuron-util/src/lib/**/*.{html,ts}",
  "./projects/leaderboard/src/app/leaderboard/**/*.{html,ts}",
];

module.exports = mainConfig;
