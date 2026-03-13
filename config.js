// config.js
// ========================================
// DASHKEY STATIC MAIN CONFIGURATION
// ========================================

const DASHKEY_CONFIG = {
    // Site information
    site_title: "Dashkey",
    author: "Rafael Meirim",
    
    // Locale (language)
    // Options: "en_US" or "pt_BR"
    locale: "en_US",
    
    // Default theme
    // Options: "default", "dracula", "nord", "ocean", "midnight", "light"
    theme: "default",
    showThemeSwitcher: true, //true or false to hidden button
    // ========================================
    // SEARCH SETTINGS
    // ========================================
    search: {
        debounce: 0,                    // Delay in ms (0 = instant)
        min_score: 50,                   // Minimum score to show results
        fuzzy_threshold: 0.3,            // How fuzzy the search is (0-1)
        max_results: 10,                  // Maximum number of results
        show_history: true,               // Show search history
        show_favorites: true               // Show most used links
    },
    
    // ========================================
    // SMART SEARCH ENGINES (!)
    // Customize your web search engines here
    // Use {query} placeholder for the search term
    // Use {lang} placeholder for language (pt/en)
    // ========================================
    smart_search: [
        {
            id: "yt",
            name: "YouTube",
            icon: "▶",
            url: "https://www.youtube.com/results?search_query={query}"
        },
        {
            id: "wp",
            name: "Wikipedia",
            icon: "📚",
            url: "https://{lang}.wikipedia.org/wiki/Special:Search?search={query}"
        },
        {
            id: "ac",
            name: "Anna's Archive",
            icon: "📖",
            url: "https://annas-archive.gl/search?index=&page=1&sort=&ext=epub&ext=pdf&lang=pt&display=&q={query}"
        },
        {
            id: "zl",
            name: "Z-Library",
            icon: "📖",
            url: "https://pt.z-lib.fm/s/{query}/?languages[]=brazilian&extensions[]=EPUB"
        }
    ],
    
    // ========================================
    // TYPOGRAPHY SETTINGS
    // ========================================
    typography: {
        font_size_base: "14px",
        font_size_title: "20px",
        font_size_card: "14px",
        font_size_input: "18px",
        font_family: "system-ui, -apple-system, sans-serif"
    },
    
    // ========================================
    // LAYOUT SETTINGS
    // ========================================
    layout: {
        // Main grid settings
        grid_padding: "20px",
        grid_max_width: "1600px", //more then 5 colluns 1920px
        grid_gap: "24px",
        
        // Column settings
        columns: {
            min_width: "250px",
            flex: "1 1 250px"
        },
        
        // Border radius settings
        border_radius_card: "8px",
        border_radius_launcher: "12px",
        border_radius_input: "12px",
        
        // Header settings
        header: {
            sticky: true,           // Fixed header at top
            blur: true,              // Blur effect on background
            padding: "20px",           // Header padding
            backgroundColor: "transparent",
            showBorder: true,        // NOVO: controla a borda inferior
            borderColor: "var(--color-surface)"  // NOVO: cor da borda
        },
        
        // Launcher settings
        launcher: {
            width: "700px",           // Maximum width
            backdrop_blur: "5px",     // Blur intensity
            animation: "fade"         // Animation type: scale, fade, slide
        },
        
        // Card settings
        card: {
            icon_size: "20px",
            gap: "12px",
            padding_top: "8px",
            padding_bottom: "8px",
            padding_left: "10px",
            padding_right: "0px",
            margin_bottom: "10px"
        }
    },
    
    // ========================================
    // ANIMATION SETTINGS
    // ========================================
    animations: {
        enabled: true,               // Enable/disable all animations
        duration: "0.3s",             // Animation duration
        stagger: true                 // Stagger effect on columns
    },
    
    // ========================================
    // ICON SETTINGS
    // ========================================
    icons: {
        lazy_load: true,              // Load icons on demand
        fallback: "globe",             // Default icon if fails
        cache: true                    // Local cache of icons
    },
    
    // ========================================
    // BACKGROUND SETTINGS
    // ========================================
    background: {
        image: "none",                   // Background image URL
        size: "cover",
        position: "center",
        repeat: "no-repeat"
    },
    
    // ========================================
    // STYLE OVERRIDES
    // Overwrites theme colors
    // Set to null to use theme defaults
    // ========================================
    style_overrides: {
        color_bg: null,
        color_surface: null,
        color_surface_hover: null,
        color_text: null,
        color_text_secondary: null,
        color_accent: null,
        launcher_bg: null,
        launcher_box_bg: null,
        launcher_border: null
    }
};

// Make it globally available
window.DASHKEY_CONFIG = DASHKEY_CONFIG;