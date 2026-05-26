#!/bin/bash

# Configuration
REGISTRY="registry.biocomputingup.it"
COMPOSE_FILE="docker-compose.build.yml"
CONTEXT="ermes2"
BUILD_SERVICE_LIST=("apicuron-ui-" "apicuron-ws-" "mongodb-")

# Argument parsing

if [[ -z "$1" ]]; then
  echo "Usage: $0 <CURRENT_HASH> [ENVIRONMENT]"
  echo "Error: Current hash argument is required"
  echo "ENVIRONMENT can be 'dev', 'prod', or 'both' (default: both)"
  return 1 2>/dev/null || exit 1  # Use return if sourced, exit if executed
fi

ENVIRONMENT=${1:-both}

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" && "$ENVIRONMENT" != "both" ]]; then
  echo "Error: Environment must be 'dev', 'prod', or 'both'"
  exit 1
fi

# --- Utility Functions ---

fail() {
  echo "Failed to $1. Aborting deployment."
  exit 1
}

current_commit() {
  git rev-parse HEAD
}

build_images() {
  if [[ -z $1 ]] || [[ -z $2 ]]; then
    echo "Missing Current Hash or Environment, Cannot build images"
    exit 1
  fi
  local current_hash=$1
  local env=$2
  
  case $env in
    "dev")
      echo "Building dev images with hash: $current_hash"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml build apicuron-ws-dev apicuron-ui-dev mongodb-dev || fail "build dev images"
      ;;
    "prod")
      echo "Building prod images with hash: $current_hash"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml build apicuron-ws-prod apicuron-ui-prod mongodb-prod || fail "build prod images"
      ;;
    "both")
      echo "Building both dev and prod images with hash: $current_hash"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml build || fail "build images"
      ;;
  esac
}

push_images() {
  if [[ -z $1 ]] || [[ -z $2 ]]; then
    echo "Missing Current Hash or Environment, Cannot push images"
    exit 1
  fi
  local current_hash=$1
  local env=$2
  
  case $env in
    "dev")
      echo "Pushing dev images to registry"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml push apicuron-ws-dev mongodb-dev apicuron-ui-dev || fail "push dev images"
      ;;
    "prod")
      echo "Pushing prod images to registry"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml push apicuron-ws-prod mongodb-prod apicuron-ui-prod || fail "push prod images"
      ;;
    "both")
      echo "Pushing all images to registry"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml push || fail "push images"
      ;;
  esac
}

# --- Main ---

# Acquire current commit
CURRENT_HASH=$(current_commit)


build_images "$CURRENT_HASH" "$ENVIRONMENT"
push_images "$CURRENT_HASH" "$ENVIRONMENT"

echo "Published $ENVIRONMENT images to docker registry"

# Deploying to the host target
if [[ $ENVIRONMENT == 'both' ]]; then
  ./run-prod.sh 'prod' $CURRENT_HASH
  ./run-prod.sh 'dev' $CURRENT_HASH
else
  ./run-prod.sh $ENVIRONMENT $CURRENT_HASH
fi

# echo "Deploying to $HOST_TARGET"

# ssh biocomp@$HOST_TARGET 'bash -s' < ./run-prod.sh