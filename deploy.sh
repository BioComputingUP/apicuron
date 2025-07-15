
if [[ -z "$1" ]]; then
  echo "Usage: $0 <CURRENT_HASH>"
  echo "Error: Current hash argument is required"
  return 1 2>/dev/null || exit 1  # Use return if sourced, exit if executed
fi


fail() {
  echo "Failed to $1. Aborting deployment."
  exit 1
}
build_images() {
  if [[ -z $1 ]]; then
    echo "Missing Current Hash, Cannot build images"
    exit 1
  fi
  CURRENT_HASH=$1 docker compose -f ./docker-compose.build.yaml build --no-cache || fail 'build images'
}

push_images() {
  echo "Pusing images to registry, nginx will be skipped and that's expected"
  CURRENT_HASH=$1 docker compose -f ./docker-compose.build.yaml push || fail 'push images'
}

build_images "$1"
push_images "$1"

echo "Published to docker registry"