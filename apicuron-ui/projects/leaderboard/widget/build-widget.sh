#!/bin/sh

# Script meant to be ran from the root directory of the project

echo "Building the Leaderboard Widget";
npx ng build leaderboard --configuration=production --build-optimizer --output-hashing=none
cat src/assets/widgets/leaderboard/runtime.js src/assets/widgets/leaderboard/polyfills.js src/assets/widgets/leaderboard/main.js > src/assets/widgets/apicuron-leaderboard.js && echo "Successfully merged build files"
