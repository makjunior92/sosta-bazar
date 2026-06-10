#!/usr/bin/env bash
# First-time VPS setup for Sosta Bazar (Ubuntu/Debian).
# Run as root or with sudo on your VPS.
set -euo pipefail

APP_DIR="/opt/sosta-bazar"
REPO="https://github.com/makjunior92/sosta-bazar.git"

apt-get update
apt-get install -y git docker.io docker-compose-v2

systemctl enable --now docker

mkdir -p "$APP_DIR"
if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR/deploy"
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo ""
  echo "Edit $APP_DIR/deploy/.env — set POSTGRES_PASSWORD before starting."
fi

chmod +x deploy.sh

echo ""
echo "Next steps:"
echo "  1. Edit $APP_DIR/deploy/.env"
echo "  2. Add nginx snippet from deploy/nginx/quantumflux.host.conf.example to quantumflux.cloud"
echo "  3. docker login ghcr.io  (PAT with read:packages)"
echo "  4. ./deploy.sh"
echo ""
echo "Configure GitHub Actions secrets: VPS_HOST, VPS_USER, VPS_SSH_KEY, GHCR_TOKEN"
