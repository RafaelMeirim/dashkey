#!/bin/bash
INSTALL_DIR="/opt/stacks/dashkey"

echo "🚀 Installing Dashkey..."

mkdir -p "$INSTALL_DIR/data" "$INSTALL_DIR/images" "$INSTALL_DIR/icons"
cd "$INSTALL_DIR"

curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/config.js
curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/index.html
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/data/links.js -o data/links.js
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/images/background.jpg -o images/background.jpg
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/icons/favicon.ico -o icons/favicon.ico
curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/docker-compose.yml

docker compose up -d

echo ""
echo "✅ Dashkey installed at $INSTALL_DIR"
echo "📝 Edit your links: $INSTALL_DIR/data/links.js"
echo "🌐 Access at: http://localhost:3080"
