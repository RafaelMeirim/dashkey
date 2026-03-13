// data/links.js
// ========================================
// DASHKEY LINKS CONFIGURATION
// ========================================

/* 
EXAMPLE FOR ITEMS:
{
    name: "GitHub",
    url: "https://github.com",
    icon: "simpleicons-github",  // simpleicons-name, lucide-name, auto, or direct URL
    iconmode: "mono",            // optional - mono, black, invert, color (default)
    keywords: ["git", "code", "repository"]
}

EXAMPLE FOR CATEGORIES:
{
    name: "Category Name",
    collapsible: true,           // optional - allows collapsing (default: false)
    collapsed: false,            // optional - initial state (default: false)
    items: [ ... ]
}
*/

const DASHKEY_LINKS = {
    categories: [
        // ========================================
        // Artificial Intelligence
        // ========================================
        {
            name: "AI",
            collapsible: true,        // Can be collapsed
            collapsed: false,          // Starts expanded
            items: [
                {
                    name: "ChatGPT",
                    url: "https://chatgpt.com/",
                    icon: "auto",
                    keywords: ["openai", "gpt", "chat"]
                },
                {
                    name: "Gemini",
                    url: "https://gemini.google.com/",
                    icon: "auto",
                    iconmode: "mono",
                    keywords: ["google", "ai", "bard"]
                },
                {
                    name: "Perplexity",
                    url: "https://www.perplexity.ai/",
                    icon: "auto",
                    iconmode: "black",
                    keywords: ["search", "ai", "research"]
                },
                {
                    name: "DeepSeek",
                    url: "https://chat.deepseek.com/",
                    icon: "auto",
                    iconmode: "mono",
                    keywords: ["deepseek", "chat", "ai"]
                },
                {
                    name: "Grok",
                    url: "https://grok.com/",
                    icon: "auto",
                    iconmode: "black",
                    keywords: ["xai", "elon", "musk", "ai"]
                }
            ]
        },
        
        // ========================================
        // Finance
        // ========================================
        {
            name: "Finance",
            collapsible: true,        // Can be collapsed
            collapsed: true,           // Starts collapsed (saves space)
            items: [
                {
                    name: "App Sobrou",
                    url: "https://appsobrou.com.br/",
                    icon: "https://appsobrou.com.br/images/favicon.ico",
                    iconmode: "mono",
                    keywords: ["stocks", "finance", "investing"]
                }
            ]
        },
        
        // ========================================
        // Useful Tools
        // ========================================
        {
            name: "Tools",
            collapsible: true,        // Can be collapsed
            collapsed: true,          // Starts expanded
            items: [
                {
                    name: "Gmail",
                    url: "https://mail.google.com/",
                    icon: "simpleicons-gmail",
                    iconmode: "mono",
                    keywords: ["email", "google", "mail"]
                },
                {
                    name: "Google Drive",
                    url: "https://drive.google.com/",
                    icon: "simpleicons-googledrive",
                    iconmode: "mono",
                    keywords: ["cloud", "storage", "files"]
                },
                {
                    name: "Google Docs",
                    url: "https://docs.google.com/document/",
                    icon: "simpleicons-googledocs",
                    iconmode: "mono",
                    keywords: ["documents", "writing", "google"]
                },
                {
                    name: "PDF Tools",
                    url: "https://tools.pdf24.org/",
                    icon: "lucide-file-text",
                    keywords: ["pdf", "editor", "convert"]
                },
                {
                    name: "Fast Speed Test",
                    url: "https://fast.com/",
                    icon: "auto",
                    iconmode: "black",
                    keywords: ["internet", "speed", "netflix"]
                }
            ]
        },
        
        // ========================================
        // Example Sites
        // ========================================
        {
            name: "Examples",
            collapsible: false,       // Cannot be collapsed (no arrow)
            items: [
                {
                    name: "GitHub",
                    url: "https://github.com",
                    icon: "lucide-github",
                    keywords: ["git", "code", "repository"]
                },
                {
                    name: "YouTube",
                    url: "https://youtube.com",
                    icon: "lucide-youtube",
                    keywords: ["video", "streaming", "watch"]
                },
                {
                    name: "Reddit",
                    url: "https://reddit.com",
                    icon: "auto",
                    iconmode: "mono",
                    keywords: ["forum", "community", "discussion"]
                },
                {
                    name: "Secret Example",
                    url: "https://secret.example",
                    icon: "lock",
                    secret: true,
                    keywords: ["hidden", "private", "secret"]
                }
            ]
        }
    ]
};

// Make it globally available
window.DASHKEY_LINKS = DASHKEY_LINKS;