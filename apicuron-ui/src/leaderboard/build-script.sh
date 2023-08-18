#!/bin/bash

touch dist/leaderboard/apicuron-leaderboard.js
cat dist/leaderboard/runtime.js dist/leaderboard/polyfills.js  dist/leaderboard/main.js > src/leaderboard/widget/apicuron-leaderboard.js