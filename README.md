# Dashkey

A lightweight personal dashboard with a powerful launcher-style search.

🔗 **Live Demo:** [https://rafaelmeirim.github.io/dashkey](https://rafaelmeirim.github.io/dashkey)

---

## ✨ Features

### 🔍 Spotlight Search
Press `Ctrl+F` anywhere to open the launcher. Start typing and watch results appear instantly with fuzzy search ranking.

### 🌐 Smart Web Search
Type `!` followed by your search term to search across multiple engines:
- `!python tutorial` → Search YouTube
- `!einstein` → Search Wikipedia
- `!clean code` → Search Anna's Archive
- `!design patterns` → Search Z-Library

### 🔒 Secret Mode
Type `@` to access hidden bookmarks. Perfect for private links that don't show up in the main grid.

### 🎨 Multiple Themes
Choose from 6 beautiful themes: `default`, `dracula`, `nord`, `ocean`, `midnight`, `light`

### 📱 Mobile Friendly
Fully responsive design that works perfectly on phones and tablets.

### 📊 Local Analytics
Tracks your most used links and shows them in search results.

### 🕘 Search History
Remembers your recent searches for quick access.

### 💬 Motivational Messages
Displays rotating motivational messages — configurable interval, position, and content.

### ⚡ Blazing Fast
Pure HTML, CSS and JavaScript — no backend, no database, no loading times.

---

## 🚀 Quick Start

### Option 1: GitHub Pages (Free & Easy)

Perfect if you want your dashboard accessible from anywhere without a server.

1. [Fork this repository](https://github.com/RafaelMeirim/dashkey/fork)
2. Edit `data/links.js` directly on GitHub (click the ✏️ pencil icon)
3. Go to **Settings → Pages**, select branch `main` and folder `/root`, click Save
4. Wait 2 minutes — your dashboard will be live at `https://YOUR_USERNAME.github.io/dashkey`

---

### Option 2: Self-Hosted with Docker (Recommended for homelabs)

One command to install everything:

```bash
curl -sSL https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/install.sh | bash
```

This will:
- Create `/opt/stacks/dashkey/` with your config files
- Pull the Docker image
- Start the container automatically

Your dashboard will be available at `http://YOUR_IP:3080`

**To edit your links after installation:**
```bash
nano /opt/stacks/dashkey/data/links.js
# No restart needed — just refresh the browser
```

**To replace the background image:**
```bash
cp your-image.jpg /opt/stacks/dashkey/images/background.jpg
# No restart needed — just refresh the browser
```

**To uninstall:**
```bash
curl -sSL https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/uninstall.sh | bash
```

---

## ⚙️ Configuration

All configuration is done by editing the files in `/opt/stacks/dashkey/` (Docker) or directly in the repo (GitHub Pages).

### Adding links — `data/links.js`

```js
{
    name: "GitHub",
    url: "https://github.com",
    icon: "simpleicons-github",  // simpleicons-name, lucide-name, "auto" or direct URL
    iconmode: "mono",             // mono, color, black, invert
    keywords: ["git", "code", "repository"]
}
```

### General settings — `config.js`

```js
{
    locale: "en_US",          // or "pt_BR"
    theme: "nord",            // default, dracula, nord, ocean, midnight, light
    smart_search: [           // customize your ! search engines
        {
            name: "YouTube",
            icon: "▶",
            url: "https://youtube.com/results?search_query={query}"
        }
    ]
}
```

### Background image — `images/background.jpg`

Replace the file with your own image. Changes reflect immediately without restarting the container.

### Favicon — `icons/favicon.ico`

Replace with your own icon. Changes reflect immediately without restarting the container.

### Language — `index.html`

Edit the `lang` attribute to match your language:

```html
<html lang="pt-BR" translate="no">  <!-- Portuguese -->
<html lang="en" translate="no">     <!-- English -->
```

---

## 🐳 Docker — Manual Setup

If you prefer to set things up manually instead of using the install script:

```bash
mkdir -p /opt/stacks/dashkey/data /opt/stacks/dashkey/images /opt/stacks/dashkey/icons
cd /opt/stacks/dashkey

curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/config.js
curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/index.html
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/data/links.js -o data/links.js
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/images/background.jpg -o images/background.jpg
curl -s https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/icons/favicon.ico -o icons/favicon.ico
curl -sO https://raw.githubusercontent.com/rafaelmeirim/dashkey/main/docker-compose.yml

docker compose up -d
```

`docker-compose.yml`:
```yaml
services:
  dashkey:
    image: rafaelmeirim/dashkey:latest
    container_name: dashkey
    restart: unless-stopped
    ports:
      - "3080:80"  # change 3080 to any available port on your host
    volumes:
      - ./config.js:/usr/share/nginx/html/config.js:ro
      - ./data/links.js:/usr/share/nginx/html/data/links.js:ro
      - ./images:/usr/share/nginx/html/images:ro
      - ./icons:/usr/share/nginx/html/icons:ro
      - ./index.html:/usr/share/nginx/html/index.html:ro
```

---

## 🔄 Updating

To update to the latest version:

```bash
cd /opt/stacks/dashkey
docker compose down
docker pull rafaelmeirim/dashkey:latest
docker compose up -d
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 🎨 Add new themes
- 🌍 Improve translations
- 📝 Fix documentation

---

## 📄 License

MIT © Rafael Meirim

---

⭐ If you find this useful, give it a star!
