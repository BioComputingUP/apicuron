#!/bin/bash
REGISTRY="registry.biocomputingup.it"
CONTEXT="ermes2"



if [[ "$1" != "dev" && "$1" != "prod" ]]; then
  echo "Expected arg1 target to be (prod/dev) to select deployment target"
  exit 1
else
  ENV=$1
fi

# Get current commit hash or use 'latest' tag
if [ -z "$2" ]; then
  echo "No commit hash provided in arg2, using 'latest' tag"
  CURRENT_HASH="latest"
else
  CURRENT_HASH="$2"
fi


## SET Varibles

project_name="apicuron-$ENV"
COMPOSE_FILE="docker-compose.$ENV.yaml"

fail() {
  echo "Failed to $1. Aborting deployment."
  exit 1
}

pull_images() {
  echo "Pulling images from registry with $COMPOSE_FILE with tag $CURRENT_HASH on $CONTEXT"
  CURRENT_HASH=$CURRENT_HASH docker -c $CONTEXT compose -f $COMPOSE_FILE -p $project_name pull || fail 'pull images'
}

restart_containers() {
  echo "Starting containers with tag: $CURRENT_HASH"
  CURRENT_HASH=$CURRENT_HASH docker -c $CONTEXT compose -f $COMPOSE_FILE -p $project_name up -d --force-recreate --pull always || fail 'recreate containers'
}

follow_logs() {
  echo "Following container logs (Ctrl+C to exit)..."
  CURRENT_HASH=$CURRENT_HASH docker -c $CONTEXT compose -f $COMPOSE_FILE -p $project_name logs -f || fail 'follow logs'
}


# Execute steps
pull_images
restart_containers

echo "Production run completed successfully!"

# Follow logs
# follow_logs
