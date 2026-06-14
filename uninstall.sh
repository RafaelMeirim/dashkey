#!/bin/bash
INSTALL_DIR="/opt/stacks/dashkey"

echo "🗑️  Uninstalling Dashkey..."

docker compose -f "$INSTALL_DIR/docker-compose.yml" down

rm -rf "$INSTALL_DIR"

echo "✅ Dashkey removed"
