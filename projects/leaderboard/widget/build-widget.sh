#!/bin/sh

# Script meant to be ran from the root directory of the project

if [ "$1" = "dev" ];
then
    echo "Building dev version of the Leaderboard Widget";
    npx ng build leaderboard --configuration=development --build-optimizer --output-hashing=none
    cat dist/leaderboard/runtime.js dist/leaderboard/polyfills.js dist/leaderboard/main.js > src/assets/widgets/apicuron-leaderboard-dev.js && echo "Successfully merged build files"
fi


if [ "$1" = "prod" ];
then
    echo "Building prod version of the Leaderboard Widget";
    npx ng build leaderboard --configuration=production --build-optimizer --output-hashing=none
    cat dist/leaderboard/runtime.js dist/leaderboard/polyfills.js dist/leaderboard/main.js > src/assets/widgets/apicuron-leaderboard.js && echo "Successfully merged build files"
fi

exit