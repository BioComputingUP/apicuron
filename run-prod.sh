#!/bin/bash
REGISTRY="registry.biocomputingup.it"
COMPOSE_FILE="docker-compose.prod.yaml"
DIRECTORY="/home/biocomp/apicuron"

update_repo() {
  echo "Pulling repository..."
  git pull
  if [ $? -ne 0 ]; then
    echo "Git pull failed. Aborting deployment."
    exit 1
  fi
  echo "Repository updated successfully."
}

# Get current commit hash or use 'latest' tag
if [ -z "$1" ]; then
  echo "No commit hash provided, using 'latest' tag"
  CURRENT_HASH="latest"
else
  CURRENT_HASH="$1"
fi

fail() {
  echo "Failed to $1. Aborting deployment."
  exit 1
}

pull_images() {
  echo "Pulling images from registry with tag: $CURRENT_HASH"
  CURRENT_HASH=$CURRENT_HASH docker compose -f $COMPOSE_FILE pull || fail 'pull images'
}

recreate_containers() {
  echo "Starting containers with tag: $CURRENT_HASH"
  CURRENT_HASH=$CURRENT_HASH docker compose -f $COMPOSE_FILE up -d --force-recreate || fail 'recreate containers'
}

follow_logs() {
  echo "Following container logs (Ctrl+C to exit)..."
  CURRENT_HASH=$CURRENT_HASH docker compose -f $COMPOSE_FILE logs -f || fail 'follow logs'
}

# Enter the directory
cd $DIRECTORY || fail "cd to $DIRECTORY"

# Execute steps
update_repo
pull_images
recreate_containers

echo "Production run completed successfully!"

# Follow logs
# follow_logs
