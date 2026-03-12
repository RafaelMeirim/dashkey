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
    
    // Search settings
    search: {
        debounce: 0,  // Delay in ms (0 = instant search)
        min_score: 20 // Minimum score to show results
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
    
    // Typography settings
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
        // Padding around the main grid
        grid_padding: "20px",
        // Maximum width of the grid  
        // For 6 columns I recommend 1920px, for fewer than 6 columns 1600px
        grid_max_width: "1600px",
             
        // Border radius settings
        border_radius_card: "8px",
        border_radius_launcher: "12px",
        
        // Grid spacing between columns
        grid_gap: "24px",
        
        // ========================================
        // CARD SPACING SETTINGS
        // Fine-tune your card appearance here
        // ========================================
        card: {
            // Icon size (width and height)
            icon_size: "20px",
            
            // Space between icon and text
            gap: "12px",
            
            // Individual padding controls
            padding_top: "8px",     // Space above card content
            padding_bottom: "8px",  // Space below card content
            padding_left: "12px",    // Space on the left side
            padding_right: "0px",    // Space on the right side (0 = flush with edge)
            
            // Space between cards
            margin_bottom: "10px"
        }
    },
    
    // Background settings
    background: {
        image: null,  // Background image URL
        size: "cover",
        position: "center",
        repeat: "no-repeat"
    },
    
    // Style overrides (overwrites theme)
    // Set to null to use theme defaults
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