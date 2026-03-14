/*
|--------------------------------------------------------------------------
| DASHKEY STATIC
|--------------------------------------------------------------------------
|
| A lightweight personal dashboard with a powerful launcher-style search.
| Ported from PHP to static HTML/JS/CSS
|
| Features
| --------
| • Instant launcher search (Spotlight-style)
| • Smart multi-engine search (!)
| • Hidden/secret bookmarks (@)
| • Fuzzy search ranking
| • Local analytics (most used links)
| • Search history
| • Mobile-friendly interface
|
| Keyboard Shortcuts
| ------------------
| Ctrl + F     → Open search launcher
| Arrow keys   → Navigate results
| Enter        → Open selected result
| Escape       → Close launcher
| Ctrl + L     → Clear search (dev utility)
|
| Special Commands
| ----------------
| !term        → Smart multi-search (YouTube, Wikipedia, etc.)
| @term        → Search secret links
|
| Original Author: Rafael Meirim
| Static Port: Your Name
| License: MIT
|
*/

// ==============================
// GLOBAL VARIABLES & CONFIG
// ==============================

// Get configuration from window object (set by config.js)
const CONFIG = window.DASHKEY_CONFIG || {
    site_title: "Dashkey",
    locale: "en_US",
    theme: "default",
    showThemeSwitcher: "true",
    search: { debounce: 0, min_score: 20 },
    typography: {},
    layout: {},
    background: {},
    style_overrides: {}
};

// Get themes
const THEMES = window.DASHKEY_THEMES || {};

// Get links data
const LINKS = window.DASHKEY_LINKS || { categories: [] };

const THEME_STORAGE_KEY = "dashkey_theme";

// Available themes in order
const THEMES_LIST = ['default', 'dracula', 'nord', 'ocean', 'midnight', 'light'];

// Translation function
function t(key) {
    // Get translations based on current locale
    const locale = CONFIG.locale || "en_US";
    const translations = locale === "pt_BR" ? window.TRANSLATIONS_PT : window.TRANSLATIONS_EN;
    
    // Fallback translations
    const fallback = {
        search_placeholder: "Search favorites...",
        search_fake_placeholder: "Search...",
        close_button: "Close",
        no_results: "No results found",
        google_search: "Search on Google",
        tips_title: "⚡ Tips",
        tips_description: "@secret | ! web search",
        secret_mode_active: "🔒 Secret Mode Active",
        secret_mode_description: "Type after @ to search secret links",
        secret_links_available: "secret links available",
        no_secret_results: "🔍 No secret links found",
        try_other_terms: "Try different search terms",
        recent_searches: "🕘 Recent Searches",
        click_to_search: "Click to search",
        top_favorites: "Most Used",
        smart_search_placeholder: "Type to search",
        uncategorized: "Uncategorized",
        shortcut_secret: "@ for secret links",
        shortcut_web_search: "! for web search"
    };
    
    return (translations && translations[key]) || fallback[key] || key;
}

// ==============================
// CONSTANTS
// ==============================

const STORAGE_KEY = "fav_stats";
const SEARCH_HISTORY_KEY = "search_history";
let searchTimer = null;
const SEARCH_DELAY = CONFIG.search?.debounce ?? 0;
const SEARCH_INDEX = [];

// ==============================
// DEVICE DETECTION
// ==============================

const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ==============================
// DOM ELEMENTS
// ==============================

const elements = {
    pageSearch: document.getElementById("search"),
    inputSearch: document.getElementById("searchInput"),
    launcher: document.getElementById("launcher"),
    inputView: document.getElementById("launcherInput"),
    mobileSearchInput: document.getElementById("mobileSearchInput"),
    resultsBox: document.getElementById("results"),
    grid: document.getElementById("grid"),
    cards: () => document.querySelectorAll(".card") // Make it dynamic
};

// ==============================
// APPLICATION STATE
// ==============================

let buffer = "";
let results = [];
let index = -1;
let launcherState = 'closed';
let isScrolling = false;
let touchStartY = 0;
let touchStartTime = 0;
let secretMode = false;
let secretItems = [];

// ==============================
// THEME MANAGEMENT
// ==============================

/**
 * Apply theme by name
 * @param {string} themeName - Name of the theme to apply
 */
function applyTheme(themeName) {   
    // Remove all theme classes from body
    const themeClasses = ['theme-default', 'theme-dracula', 'theme-nord', 
                         'theme-ocean', 'theme-midnight', 'theme-light'];
    document.body.classList.remove(...themeClasses);
    
    // Add current theme class
    document.body.classList.add(`theme-${themeName}`);
    
    // Apply style overrides if any
    applyStyleOverrides();
}

function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY);
}

function saveTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function cycleTheme() {
    const current = getSavedTheme() || CONFIG.theme || 'default';

    let index = THEMES_LIST.indexOf(current);
    if (index === -1) index = 0;

    index++;
    if (index >= THEMES_LIST.length) index = 0;

    const nextTheme = THEMES_LIST[index];

    applyTheme(nextTheme);
    saveTheme(nextTheme);
}

/**
 * Apply custom style overrides from config
 */
function applyStyleOverrides() {
    const overrides = CONFIG.style_overrides || {};
    
    Object.entries(overrides).forEach(([key, value]) => {
        if (value) {
            // Apply directly to :root with higher specificity
            document.documentElement.style.setProperty(`--${key}`, value);
        }
    });
}

/**
 * Apply search settings
 */
function applySearchSettings() {
    const search = CONFIG.search || {};
    
    // Update global search config
    window.SEARCH_CONFIG = {
        debounce: search.debounce || 0,
        min_score: search.min_score || 20,
        fuzzy_threshold: search.fuzzy_threshold || 0.3,
        max_results: search.max_results || 10,
        show_history: search.show_history !== false,
        show_favorites: search.show_favorites !== false
    };

}

/**
 * Apply header settings
 */
function applyHeaderSettings() {
    const header = CONFIG.layout?.header || {};
    const headerEl = document.querySelector('.header');
    
    if (!headerEl) return;
    
    // Sticky header
    if (header.sticky === false) {
        headerEl.style.position = 'static';
    }
    
    // Blur effect
    if (header.blur === false) {
        headerEl.style.backdropFilter = 'none';
        headerEl.style.webkitBackdropFilter = 'none';
    }
    
    // Padding
    if (header.padding) {
        headerEl.style.padding = header.padding;
    }

    // Background color
    if (header.backgroundColor) {
        headerEl.style.backgroundColor = header.backgroundColor;
    } else {
        headerEl.style.backgroundColor = 'var(--color-bg)';
    }
    
    // Border bottom
    if (header.showBorder === false) {
        headerEl.style.borderBottom = 'none';
    } else {
        headerEl.style.borderBottom = `1px solid ${header.borderColor || 'var(--color-surface)'}`;
    }

}

/**
 * Apply column settings
 */
function applyColumnSettings() {
    const columns = CONFIG.layout?.columns || {};
    
    if (columns.min_width) {
        document.documentElement.style.setProperty('--column-min-width', columns.min_width);
    }
    
    if (columns.flex) {
        document.documentElement.style.setProperty('--column-flex', columns.flex);
    }

}

/**
 * Apply launcher settings
 */
function applyLauncherSettings() {
    const launcher = CONFIG.layout?.launcher || {};
    const launcherEl = document.getElementById('launcher');
    
    if (!launcherEl) return;
    
    // Animation type
    if (launcher.animation) {
        launcherEl.setAttribute('data-animation', launcher.animation);
    }
    
    // Width
    if (launcher.width) {
        document.documentElement.style.setProperty('--launcher-width', launcher.width);
    }
    
    // Blur
    if (launcher.backdrop_blur) {
        document.documentElement.style.setProperty('--launcher-blur', launcher.backdrop_blur);
    }

}

/**
 * Apply animation settings
 */
function applyAnimationSettings() {
    const animations = CONFIG.animations || {};
    
    // Control animation name based on enabled state
    if (animations.enabled === false) {
        document.documentElement.style.setProperty('--animation-name', 'none');
        document.documentElement.style.setProperty('--animation-stagger', '0');
        document.body.classList.add('no-animations');
    } else {
        document.documentElement.style.setProperty('--animation-name', 'fadeInUp');
        document.documentElement.style.setProperty('--animation-stagger', animations.stagger ? '1' : '0');
        document.body.classList.remove('no-animations');
    }
    
    // Animation duration
    if (animations.duration) {
        document.documentElement.style.setProperty('--animation-duration', animations.duration);
    }

}

/**
 * Apply icon settings
 */
function applyIconSettings() {
    const icons = CONFIG.icons || {};
    
    // Store icon config globally
    window.ICON_CONFIG = {
        lazy_load: icons.lazy_load !== false,
        fallback: icons.fallback || 'globe',
        cache: icons.cache !== false
    };

}

/**
 * Apply card layout settings from config
 */
function applyCardLayout() {
    const cardSettings = CONFIG.layout?.card || {};
    
    // Apply each setting as a CSS variable
    Object.entries(cardSettings).forEach(([key, value]) => {
        if (value) {
            // Convert padding_top to --card-padding-top
            const cssVar = `--card-${key.replace(/_/g, '-')}`;
            document.documentElement.style.setProperty(cssVar, value);
        }
    });
}

/**
 * Apply typography settings from config
 */
function applyTypography() {
    const typography = CONFIG.typography || {};
    
    Object.entries(typography).forEach(([key, value]) => {
        if (value) {
            // Convert camelCase to kebab-case for CSS variables
            const cssVar = key.replace(/_/g, '-');
            document.documentElement.style.setProperty(`--${cssVar}`, value);
        }
    });
}

/**
 * Apply layout settings from config
 */
function applyLayout() {
    const layout = CONFIG.layout || {};
    
    Object.entries(layout).forEach(([key, value]) => {
        if (value) {
            // Convert camelCase to kebab-case for CSS variables
            const cssVar = key.replace(/_/g, '-');
            document.documentElement.style.setProperty(`--${cssVar}`, value);
        }
    });
}

/**
 * Apply background image settings from config
 */
function applyBackground() {
    const bg = CONFIG.background || {};
    
    if (bg.image) {
        document.body.style.backgroundImage = `url('${bg.image}')`;
        document.body.style.backgroundSize = bg.size || 'cover';
        document.body.style.backgroundPosition = bg.position || 'center';
        document.body.style.backgroundRepeat = bg.repeat || 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.classList.add('has-background-image');
    } else {
        // Reset background if no image
        document.body.style.backgroundImage = '';
        document.body.classList.remove('has-background-image');
    }
}

// ==============================
// COLLAPSE CATEGORIES
// ==============================

const COLLAPSE_STORAGE_KEY = "dashkey_collapsed";

/**
 * Load collapsed states from localStorage
 */
function loadCollapsedStates() {
    try {
        const saved = localStorage.getItem(COLLAPSE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.warn('Failed to load collapse states', e);
        return {};
    }
}

/**
 * Save collapsed states to localStorage
 */
function saveCollapsedStates(states) {
    try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(states));
    } catch (e) {
        console.warn('Failed to save collapse states', e);
    }
}

/**
 * Toggle category collapse
 * @param {HTMLElement} columnEl - The column element
 * @param {string} categoryName - Category name for storage
 */
function toggleCollapse(columnEl, categoryName) {
    const isCollapsed = columnEl.classList.contains('collapsed');
    
    if (isCollapsed) {
        columnEl.classList.remove('collapsed');
    } else {
        columnEl.classList.add('collapsed');
    }
    
    // Save state to localStorage
    const states = loadCollapsedStates();
    states[categoryName] = !isCollapsed; // true = collapsed
    saveCollapsedStates(states);
}

// ==============================
// COLLAPSE CATEGORIES WITH MOBILE DETECTION
// ==============================

function initCollapsibleCategories() {
    const savedStates = loadCollapsedStates();
    const isMobile = window.innerWidth <= 768;
    
    document.querySelectorAll('.column').forEach(column => {
        const titleEl = column.querySelector('.column-title');
        const categoryName = titleEl?.textContent?.trim();
        
        if (!categoryName) return;
        
        // Find category in LINKS data
        const categoryData = LINKS.categories.find(c => c.name === categoryName);
        
        // Only make collapsible if explicitly set to true
        if (!categoryData?.collapsible) return;
        
        // Make title clickable
        titleEl.classList.add('collapsible');
        
        // Add collapse icon
        const icon = document.createElement('span');
        icon.className = 'collapse-icon';
        icon.innerHTML = '▼';
        icon.setAttribute('aria-hidden', 'true');
        titleEl.appendChild(icon);
        
        // Determine initial state based on device
        let shouldBeCollapsed = false;
        
        if (isMobile) {
            // MOBILE: Use mobileCollapsed setting or default to true
            shouldBeCollapsed = categoryData.mobileCollapsed !== false; // default true
        } else {
            // DESKTOP: Use saved state or default from config
            if (savedStates.hasOwnProperty(categoryName)) {
                shouldBeCollapsed = savedStates[categoryName];
            } else {
                shouldBeCollapsed = categoryData.collapsed === true;
            }
        }
        
        if (shouldBeCollapsed) {
            column.classList.add('collapsed');
        }
        
        // Add click handler (works same on both devices)
        titleEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCollapse(column, categoryName);
        });
    });
}

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', function() {    
    // Apply theme first (most important)
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme || CONFIG.theme || 'default');

    // Initialize clock
    initClock();
    
    // Apply all new settings
    applySearchSettings();
    applyHeaderSettings();
    applyColumnSettings();
    renderDashboard();
    applyLauncherSettings();
    applyAnimationSettings();
    applyIconSettings();
    applyCardLayout();
    applyTypography();
    applyLayout();
    applyBackground();
    
    // Set site title
    document.title = CONFIG.site_title || "Dashkey";
    
    // Set author meta
    const authorMeta = document.querySelector('meta[name="author"]');
    if (authorMeta && CONFIG.author) {
        authorMeta.setAttribute('content', CONFIG.author);
    }
    
    // Render the dashboard
    renderDashboard();
    
    // Initialize search index after cards are rendered
    setTimeout(() => {
        buildSearchIndex();
    }, 100);
    
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Extract secret items
    extractSecretItems();
    
    // If page loaded with hash, open launcher
    if (window.location.hash === '#search') {
        setTimeout(() => {
            openLauncher(true);
        }, 300);
    }
    
    // Set placeholders with translations
    updatePlaceholders();
    
    const themeBtn = document.getElementById("themeIndicator");

    if (themeBtn && CONFIG.showThemeSwitcher) {
        themeBtn.style.display = "flex";
        themeBtn.addEventListener("click", cycleTheme);
    }

});

// ==============================
// DASHBOARD RENDERING
// ==============================

function renderDashboard() {
    if (!elements.grid) return;
    
    let html = '';
    
    LINKS.categories.forEach(category => {
        // Skip categories with only secret items
        const visibleItems = category.items.filter(item => !item.secret);
        if (visibleItems.length === 0) return;
        
        html += `<section class="column">`;
        html += `<h2 class="column-title">${escapeHtml(category.name)}</h2>`;
        
        visibleItems.forEach(item => {
            html += `<a
                class="card"
                href="${escapeHtml(item.url)}"
                target="_blank"
                data-name="${escapeHtml(item.name.toLowerCase())}"
                data-keywords="${escapeHtml((item.keywords || []).join(' ').toLowerCase())}"
                data-secret="false"
                data-category="${escapeHtml(category.name)}"
                data-icon="${escapeHtml(item.icon || 'auto')}"
                data-iconmode="${escapeHtml(item.iconmode || '')}"
            >`;
            
            html += `<span class="icon">`;
            html += renderIcon(item);
            html += `</span>`;
            
            html += `<span class="title">${escapeHtml(item.name)}</span>`;
            html += `</a>`;
        });
        
        html += `</section>`;
    });
    
    elements.grid.innerHTML = html;
    
    // Initialize collapse after rendering
    setTimeout(() => {
        initCollapsibleCategories();
    }, 50);
    
    // Re-initialize Lucide icons
    setTimeout(() => {
        if (window.lucide) {
            lucide.createIcons();
        }
    }, 100);
}

// ==============================
// ICON RENDERING
// ==============================

function renderIcon(item) {
    const icon = item.icon || 'auto';
    const iconmode = item.iconmode || '';
    const url = item.url || '';
    const domain = extractDomain(url);
    
    // Base classes
    let classAttr = 'site-icon';
    if (iconmode) {
        classAttr += ` icon-${iconmode}`;
    }
    
    // ========================================
    // 1. AUTO - Favicon automático do Google
    // ========================================
    if (icon === 'auto') {
        return `<img 
            src="https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}" 
            class="${classAttr}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='assets/icons/fallback-globe.png'"
        >`;
    }
    
    // ========================================
    // 2. LUCIDE - Ícones do Lucide (vetoriais)
    // ========================================
    if (icon.startsWith('lucide-')) {
        const lucideName = icon.replace('lucide-', '');
        return `<i data-lucide="${escapeHtml(lucideName)}" class="${classAttr}"></i>`;
    }
    
    // ========================================
    // 3. SIMPLEICONS - Ícones do Simple Icons
    // ========================================
    if (icon.startsWith('simpleicons-')) {
        const simpleName = icon.replace('simpleicons-', '');
        return `<img 
            src="https://cdn.simpleicons.org/${escapeHtml(simpleName)}" 
            class="${classAttr}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}'"
        >`;
    }
    
    // ========================================
    // 4. CUSTOM URL - Imagem externa
    // ========================================
    if (icon.startsWith('http')) {
        return `<img 
            src="${escapeHtml(icon)}" 
            class="${classAttr}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}'"
        >`;
    }
    
    // ========================================
    // 5. FALLBACK - Se não reconhecer, tenta como simpleicons mesmo
    // ========================================
    return `<img 
        src="https://cdn.simpleicons.org/${escapeHtml(icon)}" 
        class="${classAttr}" 
        loading="lazy"
        onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}'"
    >`;
}

function extractDomain(url) {
    try {
        const u = new URL(url);
        return u.hostname;
    } catch {
        return url;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==============================
// SEARCH INDEX BUILDING
// ==============================

function buildSearchIndex() {
    SEARCH_INDEX.length = 0; // Clear array
    
    document.querySelectorAll(".card").forEach(card => {
        const name = card.dataset.name || "";
        const keywords = card.dataset.keywords || "";
        
        SEARCH_INDEX.push({
            el: card,
            url: card.href,
            name: name,
            nameNorm: normalizeText(name),
            keywords: keywords,
            keywordsNorm: normalizeText(keywords),
            keywordList: keywords
                .split(" ")
                .map(k => normalizeText(k.trim()))
                .filter(Boolean)
        });
    });
}

// ==============================
// SECRET ITEMS EXTRACTION
// ==============================

function extractSecretItems() {
    secretItems = [];
    
    LINKS.categories.forEach(category => {
        category.items.forEach(item => {
            if (item.secret === true) {
                secretItems.push({
                    name: item.name,
                    url: item.url,
                    icon: item.icon || '',
                    keywords: item.keywords || [],
                    secret: true
                });
            }
        });
    });
    
    window.secretItems = secretItems;
}

// ==============================
// UTILITY FUNCTIONS
// ==============================

function normalizeText(text) {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function prettyUrl(url) {
    try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        const shortPath = parts.length ? "/" + parts[0] : "";
        return u.hostname + shortPath + (parts.length > 1 ? "/…" : "");
    } catch {
        return url;
    }
}

function updatePlaceholders() {
    if (elements.inputSearch) {
        elements.inputSearch.placeholder = t('search_placeholder');
    }
    if (elements.pageSearch) {
        elements.pageSearch.placeholder = t('search_fake_placeholder');
    }
    if (elements.mobileSearchInput) {
        elements.mobileSearchInput.placeholder = t('search_placeholder');
    }
}

// ==============================
// LOCAL ANALYTICS
// ==============================

function getStats() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveStats(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function getSearchHistory() {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
}

function saveSearchHistory(term) {
    if (!term || term.length < 2) return;
    let hist = getSearchHistory();
    hist = hist.filter(t => t !== term);
    hist.unshift(term);
    hist = hist.slice(0, 8);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(hist));
}

function trackClick(url) {
    const stats = getStats();
    stats[url] = (stats[url] || 0) + 1;
    saveStats(stats);
}

// ==============================
// SMART SEARCH ENGINES
// ==============================

// Get smart search engines from config or use defaults
const SMART_SEARCH_ENGINES = CONFIG.smart_search || [
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
        url: "https://{lang}.wikipedia.org/wiki/Especial:Pesquisar?search={query}"
    },
    {
        id: "ddg",
        name: "DuckDuckGo",
        icon: "🦆",
        url: "https://duckduckgo.com/?q={query}"
    }
];

//  URL placeholders
function buildSearchUrl(template, query) {
    let url = template.replace(/{query}/g, encodeURIComponent(query));
    
    // Replace language placeholder if exists
    const lang = CONFIG.locale === 'pt_BR' ? 'pt' : 'en';
    url = url.replace(/{lang}/g, lang);
    
    // You can add more placeholders here if needed
    // url = url.replace(/{date}/g, new Date().toISOString().split('T')[0]);
    
    return url;
}

// ==============================
// FUZZY SEARCH SCORE
// ==============================

function fuzzyScore(text, query) {
    if (!query || query.length < 2 || !text) return 0;
    
    text = normalizeText(text);
    query = normalizeText(query);
    
    let score = 0;
    let ti = 0;
    
    for (let qi = 0; qi < query.length; qi++) {
        const qChar = query[qi];
        const found = text.indexOf(qChar, ti);
        if (found === -1) return 0;
        
        score += 10 - (found - ti);
        ti = found + 1;
    }
    
    return score;
}

// ==============================
// LAUNCHER CONTROL
// ==============================

function updateHashForLauncher(open) {
    if (!('history' in window)) return;
    
    if (open) {
        history.pushState({ launcherOpen: true }, '', '#search');
        launcherState = 'open';
    } else {
        if (window.location.hash === '#search') {
            history.back();
        }
        launcherState = 'closed';
    }
}

function createCloseButton() {
    const existingBtn = document.getElementById('closeLauncherBtn');
    if (existingBtn) existingBtn.remove();
    
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeLauncherBtn';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', t('close_button'));
    closeBtn.title = t('close_button');
    
    const handleClose = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeLauncher();
    };
    
    closeBtn.addEventListener('click', handleClose);
    closeBtn.addEventListener('touchend', handleClose);
    
    document.body.appendChild(closeBtn);
}

function removeCloseButton() {
    const closeBtn = document.getElementById('closeLauncherBtn');
    if (closeBtn) closeBtn.remove();
}

/**
 * Open the search launcher
 * @param {boolean} skipHistory - Skip adding to browser history
 */
function openLauncher(skipHistory = false) {
    if (elements.launcher.classList.contains("hidden")) {
        elements.launcher.classList.remove("hidden");
        
        // Prevent body scrolling when launcher is open
        document.body.classList.add('launcher-open');
        
        if (!skipHistory) {
            updateHashForLauncher(true);
        }
        
        if (isMobile) {
            // Small delay to ensure launcher is visible
            setTimeout(() => {
                createCloseButton();
                
                if (elements.mobileSearchInput) {
                    // Clear previous value
                    elements.mobileSearchInput.value = "";
                    
                    // Force focus on mobile input
                    elements.mobileSearchInput.focus({ preventScroll: false });
                    
                    // Scroll to make input visible
                    setTimeout(() => {
                        elements.mobileSearchInput.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        
                        // Focus again after scroll
                        elements.mobileSearchInput.focus();
                    }, 100);
                }
            }, 150);
        }
        
        // Preload results if buffer is empty
        if (buffer.length === 0) {
            preloadLauncherResults();
        }
    }
}

/**
 * Close the search launcher
 * @param {boolean} skipHistory - Skip browser history
 * @param {boolean} clearInputs - Clear input fields
 */
function closeLauncher(skipHistory = false, clearInputs = true) {
    if (!elements.launcher.classList.contains("hidden")) {
        elements.launcher.classList.add("hidden");
        
        // Restore body scrolling
        document.body.classList.remove('launcher-open');
        
        // Clear state
        buffer = "";
        index = -1;
        results = [];
        secretMode = false;
        
        elements.inputView.textContent = "";
        elements.resultsBox.innerHTML = "";
        
        // Reset visual indicators
        if (isMobile && elements.mobileSearchInput) {
            elements.mobileSearchInput.style.borderLeft = '';
            elements.mobileSearchInput.style.paddingLeft = '';
            elements.mobileSearchInput.style.color = '';
            elements.mobileSearchInput.blur(); // Remove focus
        } else {
            elements.inputView.style.color = '';
            elements.inputView.style.borderLeft = '';
            elements.inputView.style.paddingLeft = '';
        }
        
        // Remove close button on mobile
        if (isMobile) {
            removeCloseButton();
        }
        
        // Handle history
        if (!skipHistory) {
            updateHashForLauncher(false);
        }
        
        // Clear inputs if requested
        if (clearInputs) {
            if (isMobile) {
                if (elements.mobileSearchInput) {
                    elements.mobileSearchInput.value = "";
                }
                elements.inputSearch.value = "";
                elements.inputSearch.blur();
            } else {
                elements.pageSearch.value = "";
                elements.inputSearch.value = "";
            }
        }
    }
}

// ==============================
// SEARCH FUNCTIONS
// ==============================

function triggerSearch(query) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        runLauncherSearch(query);
    }, SEARCH_DELAY);
}

function preloadLauncherResults() {
    elements.resultsBox.innerHTML = "";
    results = [];
    index = -1;
    
    const stats = getStats();
    const history = getSearchHistory();
    const cards = document.querySelectorAll(".card");
    const cardsArr = [...cards];
    
    // Top favorites
    if (cardsArr.length > 0) {
        const topTitle = document.createElement("div");
        topTitle.className = "result section-title";
        topTitle.innerHTML = `<div class="result-title">⭐ ${t('top_favorites')}</div>`;
        elements.resultsBox.appendChild(topTitle);
    }
    
    cardsArr
        .sort((a, b) => (stats[b.href] || 0) - (stats[a.href] || 0))
        .slice(0, 5)
        .forEach((card, i) => {
            results.push(card);
            
            const item = document.createElement("div");
            item.className = "result";
            if (i === 0) {
                item.classList.add("active");
                index = 0;
            }
            
            const title = card.querySelector(".title")?.textContent || card.dataset.name || "Link";
            
            item.innerHTML = `
                <div class="result-title">${escapeHtml(title)}</div>
                <span class="result-url">${prettyUrl(card.href)}</span>
            `;
            
            item.onclick = () => {
                trackClick(card.href);
                window.open(card.href, "_blank", "noopener,noreferrer");
                closeLauncher();
            };
            
            elements.resultsBox.appendChild(item);
        });
    
    // Search history
    if (history.length) {
        const sep = document.createElement("div");
        sep.className = "result section-title";
        sep.innerHTML = `<div class="result-title">${t('recent_searches')}</div>`;
        elements.resultsBox.appendChild(sep);
        
        history.forEach(term => {
            const item = document.createElement("div");
            item.className = "result";
            item.innerHTML = `
                <div class="result-title">${escapeHtml(term)}</div>
                <span class="result-url">${t('click_to_search')}</span>
            `;
            
            item.onclick = () => {
                buffer = term;
                elements.inputView.textContent = term;
                runLauncherSearch(term);
            };
            
            elements.resultsBox.appendChild(item);
        });
    }
    
    // Tips
    const help = document.createElement("div");
    help.className = "result";
    help.innerHTML = `
        <div class="result-title">${t('tips_title')}</div>
        <span class="result-url">${t('tips_description')}</span>
    `;
    elements.resultsBox.appendChild(help);
}

function showSearchEnginesHelp() {
    elements.resultsBox.innerHTML = "";
    results = [];
    index = -1;
    
    SMART_SEARCH_ENGINES.forEach(engine => {
        const item = document.createElement("div");
        item.className = "result";
        
        item.innerHTML = `
            <div class="result-title">${engine.icon} ${engine.name}</div>
            <span class="result-url">${engine.url.replace(/{query}/g, '[search term]').replace(/{lang}/g, CONFIG.locale === 'pt_BR' ? 'pt' : 'en')}</span>
        `;
        
        elements.resultsBox.appendChild(item);
    });
}

function showSmartSearchResults(term) {
    elements.resultsBox.innerHTML = "";
    results = [];
    index = -1;
    
    SMART_SEARCH_ENGINES.forEach((engine, i) => {
        // Build URL with placeholders
        const url = buildSearchUrl(engine.url, term);
        
        const item = document.createElement("div");
        item.className = "result";
        if (i === 0) {
            item.classList.add("active");
            index = 0;
        }
        
        item.innerHTML = `
            <div class="result-title">${engine.icon} ${engine.name}: ${escapeHtml(term)}</div>
            <span class="result-url">${prettyUrl(url)}</span>
        `;
        
        item.onclick = () => {
            trackClick(url);
            window.open(url, "_blank", "noopener,noreferrer");
            closeLauncher();
        };
        
        elements.resultsBox.appendChild(item);
        results.push({ href: url });
    });
}

function showSecretHelp() {
    const help = document.createElement("div");
    help.className = "result";
    help.innerHTML = `
        <div class="result-title">${t('secret_mode_active')}</div>
        <span class="result-url">${t('secret_mode_description')}</span>
    `;
    elements.resultsBox.appendChild(help);
    
    if (secretItems && secretItems.length > 0) {
        const count = document.createElement("div");
        count.className = "result";
        count.innerHTML = `
            <div class="result-title">${secretItems.length} ${t('secret_links_available')}</div>
            <span class="result-url">${t('smart_search_placeholder')}</span>
        `;
        elements.resultsBox.appendChild(count);
    }
}

function showNoResults(query) {
    const noResults = document.createElement("div");
    noResults.className = "result no-results";
    
    if (secretMode) {
        noResults.innerHTML = `
            <div class="result-title">${t('no_secret_results')}</div>
            <span class="result-url">${t('try_other_terms')}</span>
        `;
    } else {
        noResults.innerHTML = `
            <div class="result-title">🔍 ${t('no_results')}</div>
            <span class="result-url">${t('tips_description')}</span>
        `;
        
        if (query.length > 0) {
            const google = document.createElement("div");
            google.className = "result active";
            google.innerHTML = `
                <div class="result-title">${t('google_search')}</div>
                <span class="result-url">google.com/search?q=${escapeHtml(query)}</span>
            `;
            
            const googleSearch = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (isScrolling) return;
                window.open("https://www.google.com/search?q=" + encodeURIComponent(query), "_blank", "noopener,noreferrer");
                closeLauncher();
            };
            
            google.addEventListener("click", googleSearch);
            
            if (isMobile) {
                google.addEventListener("touchend", (e) => {
                    if (!isScrolling) googleSearch(e);
                });
            }
            
            elements.resultsBox.appendChild(google);
            results = [{
                href: "https://www.google.com/search?q=" + encodeURIComponent(query)
            }];
            index = 0;
        }
    }
    
    elements.resultsBox.appendChild(noResults);
}

function showResults(searchQuery) {
    results.forEach((card, i) => {
        const item = document.createElement("div");
        item.className = "result";
        
        const isSecretItem = !card.querySelector;
        const catName = card.dataset?.category || t('uncategorized');
        
        if (isSecretItem) {
            item.innerHTML = `
                <div class="result-title">${escapeHtml(card.dataset?.name || 'Secret link')}</div>
                <span class="result-url">${prettyUrl(card.href)}</span>
            `;
            item.dataset.secret = "true";
        } else {
            const title = card.querySelector('.title')?.textContent || card.dataset?.name || 'Link';
            item.innerHTML = `
                <div class="result-title">
                    ${escapeHtml(title)}
                    <span class="category-badge">${escapeHtml(catName)}</span>
                </div>
                <span class="result-url">${prettyUrl(card.href)}</span>
            `;
            item.dataset.secret = card.dataset.secret || "false";
        }
        
        if (i === 0) {
            item.classList.add("active");
            index = 0;
        }
        
        let linkOpened = false;
        
        const openLink = (e) => {
            if (linkOpened) return;
            linkOpened = true;
            
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            if (isScrolling) {
                linkOpened = false;
                return;
            }
            
            saveSearchHistory(buffer);
            trackClick(card.href);
            window.open(card.href, "_blank", "noopener,noreferrer");
            closeLauncher();
            
            if (!isMobile) {
                setTimeout(() => {
                    elements.pageSearch.focus({ preventScroll: true });
                }, 100);
            }
            
            setTimeout(() => {
                linkOpened = false;
            }, 300);
        };
        
        if (!isMobile) {
            item.addEventListener("mouseenter", () => {
                if (!isScrolling) setActive(i);
            });
        }
        
        item.removeEventListener("click", openLink);
        item.removeEventListener("touchend", openLink);
        
        item.addEventListener("click", openLink);
        
        if (isMobile) {
            item.addEventListener("touchstart", (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                isScrolling = false;
            }, { passive: true });
            
            item.addEventListener("touchmove", (e) => {
                const touchY = e.touches[0].clientY;
                const deltaY = Math.abs(touchY - touchStartY);
                if (deltaY > 10) isScrolling = true;
            }, { passive: true });
            
            item.addEventListener("touchend", (e) => {
                const touchTime = Date.now() - touchStartTime;
                if (touchTime < 300 && !isScrolling) openLink(e);
                setTimeout(() => { isScrolling = false; }, 100);
            });
        }
        
        elements.resultsBox.appendChild(item);
    });
}

function setActive(i) {
    const items = elements.resultsBox.querySelectorAll(".result");
    items.forEach(el => el.classList.remove("active"));
    
    if (items[i]) {
        items[i].classList.add("active");
        index = i;
    }
}

function updateSecretModeVisual() {
    if (buffer.startsWith('@')) {
        if (isMobile && elements.mobileSearchInput) {
            elements.mobileSearchInput.style.borderLeft = '3px solid #ff6b6b';
            elements.mobileSearchInput.style.paddingLeft = 'calc(var(--spacing-md) - 3px)';
        } else {
            elements.inputView.style.color = '#ff6b6b';
            elements.inputView.style.borderLeft = '2px solid #ff6b6b';
            elements.inputView.style.paddingLeft = '4px';
        }
    } else {
        if (isMobile && elements.mobileSearchInput) {
            elements.mobileSearchInput.style.borderLeft = '';
            elements.mobileSearchInput.style.paddingLeft = '';
        } else {
            elements.inputView.style.color = '';
            elements.inputView.style.borderLeft = '';
            elements.inputView.style.paddingLeft = '';
        }
    }
}

function updateSmartModeVisual() {
    if (buffer.startsWith('!')) {
        if (isMobile && elements.mobileSearchInput) {
            elements.mobileSearchInput.style.color = '#6bcfff';
        } else {
            elements.inputView.style.color = '#6bcfff';
        }
    } else {
        if (!buffer.startsWith('@')) {
            if (isMobile && elements.mobileSearchInput) {
                elements.mobileSearchInput.style.color = '';
            } else {
                elements.inputView.style.color = '';
            }
        }
    }
}

function clearSearch() {
    buffer = "";
    secretMode = false;
    
    elements.inputView.textContent = "";
    elements.resultsBox.innerHTML = "";
    
    if (isMobile && elements.mobileSearchInput) {
        elements.mobileSearchInput.value = "";
        elements.mobileSearchInput.style.borderLeft = '';
        elements.mobileSearchInput.style.paddingLeft = '';
        elements.mobileSearchInput.style.color = '';
    } else {
        elements.pageSearch.value = "";
        elements.inputSearch.value = "";
        elements.inputView.style.color = '';
        elements.inputView.style.borderLeft = '';
        elements.inputView.style.paddingLeft = '';
    }
    
    results = [];
    index = -1;
}

// ==============================
// MAIN SEARCH FUNCTION
// ==============================

function runLauncherSearch(query) {
    elements.resultsBox.innerHTML = "";
    index = -1;
    results = [];
    
    if (query.startsWith("!")) {
        const term = query.slice(1).trim();
        
        if (!term || term === "!" || term === "search") {
            showSearchEnginesHelp();
            return;
        }
        
        if (term.length >= 1) {
            showSmartSearchResults(term);
            return;
        }
    }
    
    secretMode = query.startsWith('@');
    const searchQuery = secretMode ? query.substring(1).trim() : query;
    
    if (secretMode && !searchQuery) {
        showSecretHelp();
        return;
    }
    
    const normalizedQuery = normalizeText(searchQuery);
    const stats = getStats();
    
    let scoredResults = [];
    
    // Normal search (non-secret)
    if (!secretMode || searchQuery) {
        SEARCH_INDEX.forEach(item => {
            const card = item.el;
            const url = item.url;
            const name = item.name;
            const keys = item.keywords;
            const nName = item.nameNorm;
            const nKeys = item.keywordsNorm;
            const keyList = item.keywordList;
            
            const hasExactKeyword = keyList.includes(normalizedQuery);
            const hasNameMatch = nName.includes(normalizedQuery);
            const hasKeywordMatch = nKeys.includes(normalizedQuery);
            
            if (!hasExactKeyword && !hasNameMatch && !hasKeywordMatch) {
                const fuzzyNameScore = fuzzyScore(name, searchQuery);
                const fuzzyKeysScore = fuzzyScore(keys, searchQuery);
                if (fuzzyNameScore === 0 && fuzzyKeysScore === 0) return;
            }
            
            let score = 0;
            
            if (hasExactKeyword) score += 1000;
            
            if (nName.includes(normalizedQuery)) {
                if (nName.startsWith(normalizedQuery)) score += 120;
                else score += 100;
            }
            
            if (nKeys.includes(normalizedQuery)) score += 80;
            
            score += Math.min(fuzzyScore(name, searchQuery), 30);
            score += Math.min(fuzzyScore(keys, searchQuery), 30);
            
            if (stats[url]) {
                if (!hasExactKeyword) score += stats[url] * 15;
                else score += stats[url] * 3;
            }
            
            const MIN_SCORE = CONFIG.search?.min_score || 20;
            if (score >= MIN_SCORE) {
                scoredResults.push({ card, score });
            }
        });
    }
    
    // Secret search
    if (secretMode && searchQuery && secretItems.length > 0) {
        secretItems.forEach(item => {
            const name = item.name || "";
            const keys = (item.keywords || []).join(" ");
            const keyList = (item.keywords || []).map(k => normalizeText(k));
            const url = item.url;
            
            const nName = normalizeText(name);
            const nKeys = normalizeText(keys);
            
            const hasExactKeyword = keyList.includes(normalizedQuery);
            const hasNameMatch = nName.includes(normalizedQuery);
            const hasKeywordMatch = nKeys.includes(normalizedQuery);
            
            if (!hasExactKeyword && !hasNameMatch && !hasKeywordMatch) {
                const fuzzyNameScore = fuzzyScore(name, searchQuery);
                const fuzzyKeysScore = fuzzyScore(keys, searchQuery);
                if (fuzzyNameScore === 0 && fuzzyKeysScore === 0) return;
            }
            
            let score = 0;
            
            if (hasExactKeyword) score += 1000;
            if (nName.startsWith(normalizedQuery)) score += 200;
            else if (nName.includes(normalizedQuery)) score += 100;
            
            if (nKeys.includes(normalizedQuery)) score += 80;
            
            score += Math.min(fuzzyScore(name, searchQuery), 30);
            score += Math.min(fuzzyScore(keys, searchQuery), 30);
            
            if (stats[url]) {
                if (!hasExactKeyword && !nName.startsWith(normalizedQuery)) {
                    score += stats[url] * 10;
                } else {
                    score += stats[url] * 5;
                }
            }
            
            const MIN_SCORE = CONFIG.search?.min_score || 20;
            if (score >= MIN_SCORE) {
                scoredResults.push({
                    card: {
                        href: url,
                        dataset: { name: name, keywords: keys, secret: "true" }
                    },
                    score
                });
            }
        });
    }
    
    scoredResults.sort((a, b) => b.score - a.score);
    results = scoredResults.map(r => r.card);
    
    if (results.length > 0) {
        showResults(searchQuery);
    } else {
        showNoResults(searchQuery);
    }
}

// ==============================
// CLOCK AND DATE FUNCTIONS - COMPLETE WITH CONFIG
// ==============================

let clockInterval = null;

/**
 * Format time with config options
 */
function formatTime(date) {
    const clockConfig = CONFIG.clock || { 
        enabled: true, 
        format24h: true, 
        showSeconds: false,
        showDate: true 
    };
    
    let hours, minutes, seconds;
    
    if (clockConfig.format24h) {
        hours = date.getHours().toString().padStart(2, '0');
    } else {
        // 12-hour format
        let h = date.getHours();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // 0 becomes 12
        hours = h.toString();
    }
    
    minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (clockConfig.showSeconds) {
        seconds = date.getSeconds().toString().padStart(2, '0');
        
        if (clockConfig.format24h) {
            return `${hours}:${minutes}:${seconds}`;
        } else {
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
            return `${hours}:${minutes}:${seconds} ${ampm}`;
        }
    } else {
        if (clockConfig.format24h) {
            return `${hours}:${minutes}`;
        } else {
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
            return `${hours}:${minutes} ${ampm}`;
        }
    }
}

/**
 * Format date based on locale and config
 */
function formatDate(date) {
    const clockConfig = CONFIG.clock || { showDate: true };
    
    // Don't show date if disabled
    if (clockConfig.showDate === false) {
        return '';
    }
    
    const locale = CONFIG.locale || 'en_US';
    
    if (locale === 'pt_BR') {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).replace(/^(\w)/, (c) => c.toUpperCase());
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }
}

/**
 * Update clock display
 */
function updateClock() {
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');
    const clockConfig = CONFIG.clock || { enabled: true };
    
    if (!timeEl || !dateEl) return;
    
    // Check if clock is enabled
    if (clockConfig.enabled === false) {
        const container = document.querySelector('.datetime-container');
        if (container) container.style.display = 'none';
        return;
    }
    
    const now = new Date();
    timeEl.textContent = formatTime(now);
    
    const dateStr = formatDate(now);
    dateEl.textContent = dateStr;
    
    // Hide date element if string is empty
    if (dateStr === '') {
        dateEl.style.display = 'none';
    } else {
        dateEl.style.display = 'block';
    }
}

/**
 * Initialize clock with config
 */
function initClock() {
    const clockConfig = CONFIG.clock || { 
        enabled: true, 
        format24h: true, 
        showSeconds: false,
        showDate: true 
    };
    
    console.log('Initializing clock with config:', clockConfig);
    
    // Hide completely if disabled
    if (clockConfig.enabled === false) {
        const container = document.querySelector('.datetime-container');
        if (container) container.style.display = 'none';
        console.log('Clock disabled');
        return;
    }
    
    // Update immediately
    updateClock();
    
    // Clear existing interval if any
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    
    // Update interval based on showSeconds
    const intervalTime = clockConfig.showSeconds ? 1000 : 60000; // 1s or 1min
    clockInterval = setInterval(updateClock, intervalTime);
    
    console.log(`✅ Clock initialized (update every ${intervalTime/1000}s)`);
}

// ==============================
// EVENT LISTENERS
// ==============================

if (!isMobile) {
    // Desktop keyboard handling
    document.addEventListener("keydown", e => {
        const el = document.activeElement;
        if (el === elements.pageSearch) return;
        
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
            e.preventDefault();
            e.stopPropagation();
            openLauncher();
            preloadLauncherResults();
            return;
        }
        
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        if (e.key === "Escape") {
            closeLauncher();
            return;
        }
        
        if (e.key === "Backspace") {
            if (!elements.launcher.classList.contains("hidden") && buffer.length > 0) {
                buffer = buffer.slice(0, -1);
                elements.inputView.textContent = buffer;
                updateSecretModeVisual();
                updateSmartModeVisual();
                triggerSearch(buffer);
            }
            return;
        }
        
        if (e.key === "Enter") {
            if (!elements.launcher.classList.contains("hidden") && results[index]) {
                e.preventDefault();
                saveSearchHistory(buffer);
                trackClick(results[index].href);
                window.open(results[index].href, "_blank", "noopener,noreferrer");
                closeLauncher();
            }
            return;
        }
        
        if (!elements.launcher.classList.contains("hidden")) {
            if (e.key === "ArrowDown") {
                if (index < results.length - 1) setActive(index + 1);
                return;
            }
            if (e.key === "ArrowUp") {
                if (index > 0) setActive(index - 1);
                return;
            }
        }
        
        if (e.key.length === 1) {
            if (elements.launcher.classList.contains("hidden")) {
                openLauncher();
                elements.pageSearch.value = "";
            }
            buffer += e.key;
            elements.inputView.textContent = buffer;
            updateSecretModeVisual();
            updateSmartModeVisual();
            triggerSearch(buffer);
        }
    });
    
    document.addEventListener("mousedown", e => {
        if (e.target === elements.launcher) {
            closeLauncher();
        }
    });
    
    elements.pageSearch.addEventListener("keydown", e => {
        if (e.key.length !== 1) return;
        e.stopPropagation();
        elements.pageSearch.blur();
        
        if (elements.launcher.classList.contains("hidden")) {
            openLauncher();
        }
        
        buffer = e.key;
        elements.inputView.textContent = buffer;
        updateSecretModeVisual();
        updateSmartModeVisual();
        triggerSearch(buffer);
    });
}

// Desktop input handler
elements.inputSearch.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value.length === 0) return;
    
    if (elements.launcher.classList.contains("hidden")) {
        openLauncher();
    }
    
    buffer = value;
    elements.inputView.textContent = buffer;
    updateSecretModeVisual();
    updateSmartModeVisual();
    triggerSearch(buffer);
});

// Track direct card clicks
document.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) {
        trackClick(card.href);
    }
});

// Mobile event listeners
if (isMobile) {
    elements.inputSearch.addEventListener("focus", () => {
        openLauncher();
        buffer = "";
        elements.inputView.textContent = "";
        elements.resultsBox.innerHTML = "";
    });
    
    if (elements.mobileSearchInput) {
        elements.mobileSearchInput.addEventListener("input", (e) => {
            buffer = e.target.value;
            elements.inputView.textContent = buffer;
            updateSecretModeVisual();
            updateSmartModeVisual();
            triggerSearch(buffer);
        });
        
        elements.mobileSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (results[index]) {
                    saveSearchHistory(buffer);
                    trackClick(results[index].href);
                    window.open(results[index].href, "_blank", "noopener,noreferrer");
                    closeLauncher();
                }
            }
            
            if (e.key === "Escape") {
                closeLauncher();
            }
        });
    }
    
    if (elements.resultsBox) {
        elements.resultsBox.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isScrolling = false;
        }, { passive: true });
        
        elements.resultsBox.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = Math.abs(touchY - touchStartY);
            if (deltaY > 10) isScrolling = true;
        }, { passive: true });
        
        elements.resultsBox.addEventListener('touchend', () => {
            setTimeout(() => { isScrolling = false; }, 150);
        }, { passive: true });
    }
}

// Global event listeners
window.addEventListener('popstate', (event) => {
    if (launcherState === 'open' && !window.location.hash) {
        closeLauncher(true);
    }
    
    if (window.location.hash === '#search' && elements.launcher.classList.contains('hidden')) {
        openLauncher(true);
    }
});

// Autofocus for desktop
window.addEventListener("load", () => {
    if (!isMobile) {
        requestAnimationFrame(() => {
            elements.pageSearch.focus({ preventScroll: true });
        });
    }
});

// Hotkey to clear everything (Ctrl+L)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearSearch();
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    // Debounce to avoid too many calls
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        // Re-initialize with new device size
        initCollapsibleCategories();
    }, 250);
});