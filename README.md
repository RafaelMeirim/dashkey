# Dashkey

A lightweight personal dashboard with a powerful launcher-style search.

🔗 **Live Demo:** [https://rafaelmeirim.github.io/dashkey](https://rafaelmeirim.github.io/dashkey)

## ✨ Features

### 🔍 **Spotlight Search**
Press `Ctrl+F` anywhere to open the launcher. Start typing and watch results appear instantly with fuzzy search ranking.

### 🌐 **Smart Web Search**
Type `!` followed by your search term to search across multiple engines:
- `!python tutorial` → Search YouTube
- `!einstein` → Search Wikipedia  
- `!clean code` → Search Anna's Archive
- `!design patterns` → Search Z-Library

### 🔒 **Secret Mode**
Type `@` to access hidden bookmarks. Perfect for private links that don't show up in the main grid.

### 🎨 **Multiple Themes**
Choose from 6 beautiful themes:
- `default` - Dark theme
- `dracula` - Dracula theme
- `nord` - Nord theme
- `ocean` - Ocean theme  
- `midnight` - Midnight theme
- `light` - Light theme

### 📱 **Mobile Friendly**
Fully responsive design that works perfectly on phones and tablets.

### 📊 **Local Analytics**
Tracks your most used links and shows them in search results.

### 🕘 **Search History**
Remembers your recent searches for quick access.

### ⚡ **Blazing Fast**
Pure HTML, CSS and JavaScript - no backend, no database, no loading times.

## 🚀 Quick Start

## Option 1: GitHub Pages (Recommended - Free & Easy)
### 1. Create a GitHub account (if you don't have one) at github.com

### 2. Fork the project (copy to your account)

* Go to: https://github.com/RafaelMeirim/dashkey

* Click the "Fork" button (top right corner)

* Done! Now you have your own copy of the project

### 3. Edit your links directly on the website

* In your repository, navigate to data/links.js

* Click the pencil icon (✏️) to edit

* Add your links following the examples

* Scroll down and click "Commit changes"

### 4. Enable GitHub Pages

* In your repository, go to Settings → Pages

* Under "Branch", select main and folder /root

* Click Save

* Wait 2 minutes

### Done! Your dashboard will be available at:
https://YOUR_USERNAME.github.io/dashkey

## Option 2
### 1. Fork this repository
```bash
git clone https://github.com/rafaelmeirim/dashkey.git
cd dashkey
```
### 2. Add your bookmarks
For Windows/Mac/Linux users - no terminal needed:
Edit data/links.js:
```bash
{
    name: "GitHub",
    url: "https://github.com",
    icon: "simpleicons-github",  // simpleicons-name, lucide-itens, auto (automatic icon) or direct URL
    iconmode: "mono",             // mono, black, invert, color
    keywords: ["git", "code", "repository"]
}
```
### 3. Configure your preferences

Edit config.js:
```bash
{
    locale: "en_US",              // or "pt_BR"
    theme: "nord",             // default, dracula, nord, ocean, midnight, light
    smart_search: [               // Customize your ! search engines
        {
            name: "YouTube",
            icon: "▶",
            url: "https://youtube.com/results?search_query={query}"
        }
    ]
}
```
### 4. Configure your preferences

* Go to repository Settings → Pages

* Select branch: main → folder: /root

* Click Save
### 5. Done! 🎉

Your dashboard will be live at https://YOUR_USERNAME.github.io/dashkey

## Contributing
Contributions are welcome! Feel free to:

🐛 Report bugs

💡 Suggest features

🎨 Add new themes

🌍 Improve translations

📝 Fix documentation

📄 License
MIT © Rafael Meirim

## ⭐ If you like this project, give it a star! ⭐
