#!/bin/bash

# Configuration
REGISTRY="registry.biocomputingup.it"
COMPOSE_FILE="docker-compose.build.yml"
HOST_TARGET="ermes2"


if [[ -z "$1" ]]; then
  echo "Usage: $0 <CURRENT_HASH> [ENVIRONMENT]"
  echo "Error: Current hash argument is required"
  echo "ENVIRONMENT can be 'dev', 'prod', or 'both' (default: both)"
  return 1 2>/dev/null || exit 1  # Use return if sourced, exit if executed
fi

ENVIRONMENT=${2:-both}

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" && "$ENVIRONMENT" != "both" ]]; then
  echo "Error: Environment must be 'dev', 'prod', or 'both'"
  exit 1
fi

fail() {
  echo "Failed to $1. Aborting deployment."
  exit 1
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
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml build --no-cache apicuron-ws-dev apicuron-ui-dev || fail "build dev images"
      ;;
    "prod")
      echo "Building prod images with hash: $current_hash"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml build --no-cache apicuron-ws-prod apicuron-ui-prod || fail "build prod images"
      ;;
    "both")
      echo "Building both dev and prod images with hash: $current_hash"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml build --no-cache || fail "build images"
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
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml push apicuron-ws-dev apicuron-ui-dev || fail "push dev images"
      ;;
    "prod")
      echo "Pushing prod images to registry"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml push apicuron-ws-prod apicuron-ui-prod || fail "push prod images"
      ;;
    "both")
      echo "Pushing all images to registry"
      CURRENT_HASH=$current_hash docker compose -f ./docker-compose.build.yaml push || fail "push images"
      ;;
  esac
}

build_images "$1" "$ENVIRONMENT"
push_images "$1" "$ENVIRONMENT"

echo "Published $ENVIRONMENT images to docker registry"

# Deploying to the host target

echo "Deploying to $HOST_TARGET"

ssh biocomp@$HOST_TARGET 'bash -s' < ./run-prod.sh