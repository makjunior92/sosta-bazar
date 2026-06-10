#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/sosta-bazar}"
COMPOSE_FILE="docker-compose.prod.yml"

cd "$APP_DIR/deploy"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
docker compose -f "$COMPOSE_FILE" restart nginx
docker image prune -f

echo "Deployed. App: https://quantumflux.cloud/sostabazar/"
