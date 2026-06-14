#!/bin/bash
INSTALL_DIR="/opt/stacks/dashkey"

cd ~ 2>/dev/null || true

echo "🚀 Installing Dashkey..."

mkdir -p "$INSTALL_DIR/data" "$INSTALL_DIR/images" "$INSTALL_DIR/icons"
cd "$INSTALL_DIR"

curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/config.js
curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/index.html
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/data/links.js -o data/links.js
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/images/background.jpg -o images/background.jpg
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/icons/favicon.ico -o icons/favicon.ico
curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/docker-compose.yml

docker pull rafaelmeirim/dashkey:latest
docker compose up -d

echo ""
echo "✅ Dashkey installed at $INSTALL_DIR"
echo "📝 Edit your links:       nano $INSTALL_DIR/data/links.js"
echo "⚙️  Edit your config:      nano $INSTALL_DIR/config.js"
echo "🖼️  Replace background:    cp your-image.jpg $INSTALL_DIR/images/background.jpg"
echo "🌐 Access at:             http://$(hostname -I | awk '{print $1}'):3080"
echo ""
echo "💡 After replacing the background image, no restart is needed — just refresh the browser."
echo ""
echo "👉 cd $INSTALL_DIR"
