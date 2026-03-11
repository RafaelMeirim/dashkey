/*
|--------------------------------------------------------------------------
| Meirim Dashboard
|--------------------------------------------------------------------------
|
| A lightweight personal dashboard with a powerful launcher-style search.
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
| Author: Rafael Meirim
| License: MIT
|
*/

/*
|--------------------------------------------------------------------------
| Architecture Overview
|--------------------------------------------------------------------------
|
| The launcher works as a global keyboard-driven search system.
|
| Flow:
|
| User Input
|     ↓
| runLauncherSearch()
|     ↓
| Score + Ranking
|     ↓
| showResults() / showNoResults()
|     ↓
| UI Rendering
|
*/

// ==============================
// GLOBAL CONSTANTS
// ==============================

const STORAGE_KEY = "fav_stats";
const SEARCH_HISTORY_KEY = "search_history";
let searchTimer = null;
const SEARCH_DELAY = window.APP_CONFIG?.searchDebounce ?? 0;
const SEARCH_INDEX = [];

// ==============================
// CONFIGURATION AND DEVICE DETECTION
// ==============================

const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ==============================
// INTERNATIONALIZATION
// ==============================

// Fallback translations
const DEFAULT_TRANSLATIONS = {
    search_placeholder: "Search favorites...",
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
    top_favorites: "Most",
    smart_search_placeholder: "Type to search",
    uncategorized: "Uncategorized"
};

// Use translations from PHP if available
const t = window.I18N || DEFAULT_TRANSLATIONS;

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
  cards: document.querySelectorAll(".card")
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

// ==============================
// UTILITY FUNCTIONS
// ==============================

function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function prettyUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);

    // pega só o primeiro path útil
    const shortPath = parts.length ? "/" + parts[0] : "";

    return u.hostname + shortPath + (parts.length > 1 ? "/…" : "");
  } catch {
    return url;
  }
}

// ==============================
// LOCAL ANALYTICS (MOST USED FAVORITES)
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
  hist = hist.filter(t => t !== term); // remove duplicado
  hist.unshift(term);
  hist = hist.slice(0, 8); // top 8
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(hist));
}


function trackClick(url) {
  const stats = getStats();
  stats[url] = (stats[url] || 0) + 1;
  saveStats(stats);
}

// ==============================
// DEBOUNCED SEARCH TRIGGER
// ==============================

function triggerSearch(query){

  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {

    runLauncherSearch(query);

  }, SEARCH_DELAY);

}

// ==============================
// SMART SEARCH ENGINES (!)
// ==============================

const SMART_SEARCH_ENGINES = [
  {
    id: "yt",
    name: "YouTube",
    icon: "▶",
    url: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
  },
  {
    id: "wp",
    name: "Wikipedia",
    icon: "📚",
    url: q => `https://pt.wikipedia.org/wiki/Especial:Pesquisar?search=${encodeURIComponent(q)}`
  },
  {
    id: "ac",
    name: "Anna’s Archive",
    icon: "📖",
    url: q => `https://annas-archive.gl/search?q=${encodeURIComponent(q)}&ext=epub&lang=pt`
  },
  {
    id: "zl",
    name: "Z-Library",
    icon: "📖",
    url: q => `https://pt.z-lib.fm/s/${encodeURIComponent(q)}/?languages%5B%5D=brazilian&extensions%5B%5D=EPUB`
  }
];

// ==============================
// FUZZY SEARCH SCORE
// ==============================

function fuzzyScore(text, query) {
  if (!query || query.length < 2) return 0; // evita fuzzy lixo

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
// HISTORY CONTROL (BROWSER BACK BUTTON)
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

// ==============================
// CLOSE BUTTON (MOBILE)
// ==============================

function createCloseButton() {
  // Remove if it already exists
  const existingBtn = document.getElementById('closeLauncherBtn');
  if (existingBtn) {
    existingBtn.remove();
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.id = 'closeLauncherBtn';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', t.close_button);
  closeBtn.title = t.close_button;
  
  // Button events
  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeLauncher();
  };
  
  closeBtn.addEventListener('click', handleClose);
  closeBtn.addEventListener('touchend', (e) => {
    handleClose(e);
  });
  
  document.body.appendChild(closeBtn);
}

function removeCloseButton() {
  const closeBtn = document.getElementById('closeLauncherBtn');
  if (closeBtn) {
    closeBtn.remove();
  }
}

// ==============================
// LAUNCHER CONTROL
// ==============================

function openLauncher(skipHistory = false) {
  if (elements.launcher.classList.contains("hidden")) {
    elements.launcher.classList.remove("hidden");
    
    if (!skipHistory) {
      updateHashForLauncher(true);
    }
    
    // On mobile: create close button and focus the mobile input
    if (isMobile) {
      setTimeout(() => {
        createCloseButton();
        if (elements.mobileSearchInput) {
          elements.mobileSearchInput.value = "";
          elements.mobileSearchInput.focus();
        }
      }, 50);
    }
  }
}

function closeLauncher(skipHistory = false, clearInputs = true) {
  if (!elements.launcher.classList.contains("hidden")) {
    elements.launcher.classList.add("hidden");
    
    // CLEAR EVERYTHING: buffer, results, state
    buffer = "";
    index = -1;
    results = [];
    secretMode = false;
    
    elements.inputView.textContent = "";
    elements.resultsBox.innerHTML = "";
    
    // Remove visual indicator of secret mode
    if (isMobile && elements.mobileSearchInput) {
      elements.mobileSearchInput.style.borderLeft = '';
      elements.mobileSearchInput.style.paddingLeft = '';
    } else {
      elements.inputView.style.color = '';
      elements.inputView.style.borderLeft = '';
      elements.inputView.style.paddingLeft = '';
    }
    
    // Remove close button on mobile
    if (isMobile) {
      removeCloseButton();
    }
    
    if (!skipHistory) {
      updateHashForLauncher(false);
    }
    
    // Clear inputs if requested
    if (clearInputs) {
      if (isMobile) {
        // On mobile, clear both inputs
        if (elements.mobileSearchInput) {
          elements.mobileSearchInput.value = "";
          elements.mobileSearchInput.blur();
        }
        elements.inputSearch.value = "";
        elements.inputSearch.blur();
      } else {
        // On desktop, clear the fake input
        elements.pageSearch.value = "";
        elements.inputSearch.value = "";
      }
    }
  }
}

// ==============================
// SMART SEARCH UI (!)
// ==============================

function showSearchEnginesHelp() {
  elements.resultsBox.innerHTML = "";
  results = [];
  index = -1;

  SMART_SEARCH_ENGINES.forEach(engine => {
    const item = document.createElement("div");
    item.className = "result";

    item.innerHTML = `
      <div class="result-title">${engine.icon} ${engine.name}</div>
      <span class="result-url">${t.smart_search_placeholder}</span>
    `;

    elements.resultsBox.appendChild(item);
  });
}

function preloadLauncherResults() {
  elements.resultsBox.innerHTML = "";
  results = [];
  index = -1;

  const stats = getStats();
  const history = getSearchHistory();

// =====================
// TOP FAVORITES (most clicked)
// =====================
  const cardsArr = [...elements.cards];

  // Adicionar título "Mais usados" se houver cards
  if (cardsArr.length > 0) {
    const topTitle = document.createElement("div");
    topTitle.className = "result section-title";
    topTitle.innerHTML = `<div class="result-title">⭐ ${t.top_favorites}</div>`;
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

      item.innerHTML = `
        <div class="result-title">${card.querySelector(".title").textContent}</div>
        <span class="result-url">${prettyUrl(card.href)}</span>
      `;

      item.onclick = () => {
        trackClick(card.href);
        window.open(card.href, "_blank", "noopener,noreferrer");
        closeLauncher();
      };

      elements.resultsBox.appendChild(item);
    });

// =====================
// SEARCH HISTORY
// =====================
  if (history.length) {
    const sep = document.createElement("div");
    sep.className = "result";
    sep.innerHTML = `<div class="result-title">${t.recent_searches}</div>`;
    elements.resultsBox.appendChild(sep);

    history.forEach(term => {
      const item = document.createElement("div");
      item.className = "result";
      item.innerHTML = `
        <div class="result-title">${term}</div>
        <span class="result-url">Clique para pesquisar</span>
      `;

      item.onclick = () => {
        buffer = term;
        elements.inputView.textContent = term;
        runLauncherSearch(term);
      };

      elements.resultsBox.appendChild(item);
    });
  }

  // =====================
  // HELP QUICK KEYS
  // =====================
  const help = document.createElement("div");
  help.className = "result";
  help.innerHTML = `
    <div class="result-title">${t.tips_title}</div>
    <span class="result-url">${t.tips_description}</span>
  `;
  elements.resultsBox.appendChild(help);
}

function showSmartSearchResults(term) {
  elements.resultsBox.innerHTML = "";
  results = [];
  index = -1;

  SMART_SEARCH_ENGINES.forEach((engine, i) => {
    const url = engine.url(term);

    const item = document.createElement("div");
    item.className = "result";
    if (i === 0) {
      item.classList.add("active");
      index = 0;
    }

    item.innerHTML = `
      <div class="result-title">${engine.icon} ${engine.name}: ${term}</div>
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

// ==============================
// MAIN SEARCH FUNCTION
// ==============================

function runLauncherSearch(query) {
  elements.resultsBox.innerHTML = "";
  index = -1;
  results = [];

  if (query.startsWith("!")) {
    const term = query.slice(1).trim();

    // !search → show search engines
    if (!term || term === "!" || term === "search") {
      showSearchEnginesHelp();
      return;
    }

    // !rock → multi-search suggestions
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

  // Temporary array for scored results
  let scoredResults = [];

// ==============================
// NORMAL SEARCH
// ==============================
  if (!secretMode || searchQuery) {
    SEARCH_INDEX.forEach(item => {

      const card = item.el;
      const url = item.url;

      const name = item.name;
      const keys = item.keywords;

      const nName = item.nameNorm;
      const nKeys = item.keywordsNorm;
      const keyList = item.keywordList;

      // If there is no match at all, skip
      const hasExactKeyword = keyList.includes(normalizedQuery);
      const hasNameMatch = nName.includes(normalizedQuery);
      const hasKeywordMatch = nKeys.includes(normalizedQuery);
      
      if (!hasExactKeyword && !hasNameMatch && !hasKeywordMatch) {
        // Try fuzzy search as a last resort
        const fuzzyNameScore = fuzzyScore(name, searchQuery);
        const fuzzyKeysScore = fuzzyScore(keys, searchQuery);
        
        if (fuzzyNameScore === 0 && fuzzyKeysScore === 0) {
          return; // No match found, discard
        }
      }

      // ===== NEW SCORING SYSTEM =====
      let score = 0;

      // 1. MAX PRIORITY: exact keyword (1000 points)
      if (hasExactKeyword) {
        score += 1000;
      }

      // 2. Name match — now with closer weights
      if (nName.includes(normalizedQuery)) {
        // Small bonus if match is at the beginning
        if (nName.startsWith(normalizedQuery)) {
          score += 120;
        } else {
          score += 100;
        }
      }

      // 3. Keyword match (80 points)
      if (nKeys.includes(normalizedQuery)) {
        score += 80;
      }

      // 4. Fuzzy match (max 30 points)
      score += Math.min(fuzzyScore(name, searchQuery), 30);
      score += Math.min(fuzzyScore(keys, searchQuery), 30);

      // 5. POPULARITY — higher weight for generic searches
      if (stats[url]) {
        // Generic search (no exact keyword)
        if (!hasExactKeyword) {
          // 15 points per click to increase popularity weight
          score += stats[url] * 15;
        } else {
          // Specific search: lower weight
          score += stats[url] * 3;
        }
      }

      // Minimum score required
      const MIN_SCORE = 20;
      if (score >= MIN_SCORE) {
        scoredResults.push({ card, score });
      }
    });
  }

// ==============================
// SECRET SEARCH
// ==============================
  if (secretMode && searchQuery && window.secretItems) {
    window.secretItems.forEach(item => {
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
        
        if (fuzzyNameScore === 0 && fuzzyKeysScore === 0) {
          return;
        }
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

      if (score >= 20) {
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
  
  // Sort by score DESC
  scoredResults.sort((a, b) => b.score - a.score);
    
  results = scoredResults.map(r => r.card);

  if (results.length > 0) {
    showResults(searchQuery);
  } else {
    showNoResults(searchQuery);
  }
}

// ==============================
// FUNCTION TO SHOW SECRET MODE HELP
// ==============================

function showSecretHelp() {
  const help = document.createElement("div");
  help.className = "result";
  help.innerHTML = `
    <div class="result-title">${t.secret_mode_active}</div>
    <span class="result-url">${t.secret_mode_description}</span>
  `;
  elements.resultsBox.appendChild(help);
  
  if (window.secretItems && window.secretItems.length > 0) {
    const count = document.createElement("div");
    count.className = "result";
    count.innerHTML = `
      <div class="result-title">${window.secretItems.length} ${t.secret_links_available}</div>
      <span class="result-url">${t.smart_search_placeholder}</span>
    `;
    elements.resultsBox.appendChild(count);
  }
}

// ==============================
// FUNCTION TO SHOW "NO RESULTS"
// ==============================

function showNoResults(query) {
  const noResults = document.createElement("div");
  noResults.className = "result";
  
  if (secretMode) {
    noResults.innerHTML = `
      <div class="result-title">${t.no_secret_results}</div>
      <span class="result-url">${t.try_other_terms}</span>
    `;
  } else {
    noResults.innerHTML = `
      <div class="result-title">🔍 ${t.no_results}</div>
      <span class="result-url">${t.tips_description}</span>
    `;
    
    // Google fallback only for normal search
    if (query.length > 0) {
      const google = document.createElement("div");
      google.className = "result active";
      google.innerHTML = `
        <div class="result-title">${t.google_search}</div>
        <span class="result-url">google.com/search?q=${query}</span>
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
          if (!isScrolling) {
            googleSearch(e);
          }
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

// ==============================
// FUNCTION TO RENDER RESULTS
// ==============================
function showResults(searchQuery) {
  results.forEach((card, i) => {
    const item = document.createElement("div");
    item.className = "result";
    
    // Check if it is a secret item (fake card has no querySelector)
    const isSecretItem = !card.querySelector;
    const catName = card.dataset.category || t.uncategorized;
    
    if (isSecretItem) {
      // Secret item
      item.innerHTML = `
        <div class="result-title">${card.dataset?.name || 'Link secreto'}</div>
        <span class="result-url">${prettyUrl(card.href)}</span>
      `;
      item.dataset.secret = "true";
    } else {
      // Normal item
      item.innerHTML = `
        <div class="result-title">
          ${card.querySelector('.title')?.textContent || card.dataset?.name}
          <span class="category-badge">${catName}</span>
        </div>
        <span class="result-url">${prettyUrl(card.href)}</span>
      `;
      item.dataset.secret = card.dataset.secret || "false";
    }

    if (i === 0) {
      item.classList.add("active");
      index = 0;
    }

    let linkOpened = false; // Flag to prevent duplicate execution
    
    const openLink = (e) => {
      // Prevent multiple execution
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
      
      // Open the link
      saveSearchHistory(buffer);
      trackClick(card.href);
      window.open(card.href, "_blank", "noopener,noreferrer");
      
      // Close the launcher and CLEAR EVERYTHING
      closeLauncher();
      
      // On desktop, focus the search field for the next query
      if (!isMobile) {
        setTimeout(() => {
          elements.pageSearch.focus({ preventScroll: true });
        }, 100);
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        linkOpened = false;
      }, 300);
    };
    
    // Mouse desktop
    if (!isMobile) {
      item.addEventListener("mouseenter", () => {
        if (!isScrolling) {
          setActive(i);
        }
      });
    }
    
    // Remove old event listeners to avoid duplication
    item.removeEventListener("click", openLink);
    item.removeEventListener("touchend", openLink);
    
    // Click — FIXED to clear after clicking
    item.addEventListener("click", openLink);
    
    // Touch support for mobile with scroll prevention
    if (isMobile) {
      item.addEventListener("touchstart", (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
      }, { passive: true });
      
      item.addEventListener("touchmove", (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = Math.abs(touchY - touchStartY);
        
        // If moved more than 10px, consider it a scroll
        if (deltaY > 10) {
          isScrolling = true;
        }
      }, { passive: true });
      
      item.addEventListener("touchend", (e) => {
        const touchTime = Date.now() - touchStartTime;
        
        // If it was a quick tap and not scrolling, open the link
        if (touchTime < 300 && !isScrolling) {
          openLink(e);
        }
        
        // Reset after a short delay
        setTimeout(() => {
          isScrolling = false;
        }, 100);
      });
    }

    elements.resultsBox.appendChild(item);
  });
}

// ==============================
// ACTIVE ITEM CONTROL
// ==============================

function setActive(i) {
  const items = elements.resultsBox.querySelectorAll(".result");
  items.forEach(el => el.classList.remove("active"));

  if (items[i]) {
    items[i].classList.add("active");
    index = i;
  }
}

// ==============================
// UPDATE VISUAL INDICATOR FOR SECRET MODE (@)
// ==============================

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

// ==============================
// UPDATE VISUAL INDICATOR FOR SMART SEARCH (!)
// ==============================

function updateSmartModeVisual() {
  if (buffer.startsWith('!')) {
    if (isMobile && elements.mobileSearchInput) {
      elements.mobileSearchInput.style.color = '#6bcfff';
    } else {
      elements.inputView.style.color = '#6bcfff';
    }
  } else {
    // Reset only if not in secret mode
    if (!buffer.startsWith('@')) {
      if (isMobile && elements.mobileSearchInput) {
        elements.mobileSearchInput.style.color = '';
      } else {
        elements.inputView.style.color = '';
      }
    }
  }
}

// ==============================
// CLEAR SEARCH COMPLETELY
// ==============================

function clearSearch() {
  buffer = "";
  secretMode = false;
  

  elements.inputView.textContent = "";
  elements.resultsBox.innerHTML = "";
  
  if (isMobile && elements.mobileSearchInput) {
    elements.mobileSearchInput.value = "";
    elements.mobileSearchInput.style.borderLeft = '';
    elements.mobileSearchInput.style.paddingLeft = '';
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
// EVENT LISTENERS — DESKTOP
// ==============================

if (!isMobile) {
  // Typing anywhere
  document.addEventListener("keydown", e => {
    const el = document.activeElement;
    if (el === elements.pageSearch) return;

    // Ctrl+F = Spotlight-style launcher
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      e.stopPropagation();
      openLauncher();
      preloadLauncherResults();
      return;
    }
   

    // BLOCK native browser shortcuts
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    // ESC closes and clears
    if (e.key === "Escape") {
      closeLauncher();
      return;
    }

    // Backspace in search
    if (e.key === "Backspace") {
      if (!elements.launcher.classList.contains("hidden") && buffer.length > 0) {
        buffer = buffer.slice(0, -1);
        elements.inputView.textContent = buffer;
        
        // Update secret mode visual indicator
        updateSecretModeVisual();
        updateSmartModeVisual();

        
        triggerSearch(buffer);
      }
      return;
    }

    // Enter selects result
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

    // Navigation
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

    // Normal characters
    if (e.key.length === 1) {
      if (elements.launcher.classList.contains("hidden")) {
        openLauncher();
        elements.pageSearch.value = "";
      }
      buffer += e.key;
      elements.inputView.textContent = buffer;
      
      // Update secret mode visual indicator
      updateSecretModeVisual();
      updateSmartModeVisual();
      
      triggerSearch(buffer);
    }
  });

  // Click outside closes and clears
  document.addEventListener("mousedown", e => {
    if (e.target === elements.launcher) {
      closeLauncher();
    }
  });

  // First letter in the search field
  elements.pageSearch.addEventListener("keydown", e => {
    if (e.key.length !== 1) return;
    e.stopPropagation();
    elements.pageSearch.blur();

    if (elements.launcher.classList.contains("hidden")) {
      openLauncher();
    }

    buffer = e.key;
    elements.inputView.textContent = buffer;
    
    // Update secret mode visual indicator
    updateSecretModeVisual();
    updateSmartModeVisual();
    
    triggerSearch(buffer);
  });
}

// ==============================
// DESKTOP INPUT HANDLER
// ==============================

elements.inputSearch.addEventListener("input", (e) => {

  const value = e.target.value.trim();

  if (value.length === 0) return;

  // open launcher if needed
  if (elements.launcher.classList.contains("hidden")) {
    openLauncher();
  }

  buffer = value;
  elements.inputView.textContent = buffer;

  updateSecretModeVisual();
  updateSmartModeVisual();

  triggerSearch(buffer);

});

// ==============================
// TRACK DIRECT CARD CLICKS
// ==============================

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    trackClick(card.href);
  });
});


// ==============================
// EVENT LISTENERS — MOBILE
// ==============================

if (isMobile) {
  // Header input controls the launcher
  elements.inputSearch.addEventListener("focus", () => {
    openLauncher();
    buffer = "";
    elements.inputView.textContent = "";
    elements.resultsBox.innerHTML = "";
  });

  // Mobile input inside the launcher
  if (elements.mobileSearchInput) {
    elements.mobileSearchInput.addEventListener("input", (e) => {
      buffer = e.target.value;
      elements.inputView.textContent = buffer;
      
      // Secret mode visual indicator
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
  
  // Prevent accidental scrolling
  if (elements.resultsBox) {
    elements.resultsBox.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isScrolling = false;
    }, { passive: true });
    
    elements.resultsBox.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const deltaY = Math.abs(touchY - touchStartY);
      
      if (deltaY > 10) {
        isScrolling = true;
      }
    }, { passive: true });
    
    elements.resultsBox.addEventListener('touchend', () => {
      setTimeout(() => {
        isScrolling = false;
      }, 150);
    }, { passive: true });
  }
}

// ==============================
// GLOBAL EVENT LISTENERS
// ==============================

// Browser back button
window.addEventListener('popstate', (event) => {
  if (launcherState === 'open' && !window.location.hash) {
    closeLauncher(true);
  }
  
  if (window.location.hash === '#search' && elements.launcher.classList.contains('hidden')) {
    openLauncher(true);
  }
});

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', function() {
  launcherState = 'closed';
  
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // If page loaded with hash, open launcher
  if (window.location.hash === '#search') {
    setTimeout(() => {
      openLauncher(true);
    }, 300);
  }
});

// Autofocus hack for desktop
window.addEventListener("load", () => {
  if (!isMobile) {
    requestAnimationFrame(() => {
      elements.pageSearch.focus({ preventScroll: true });
      
      requestAnimationFrame(() => {
        elements.pageSearch.focus({ preventScroll: true });
      });
    });
  }
});

// Hotkey to clear everything (Ctrl+L) — useful for development
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    clearSearch();
  }
});

  // ==============================
  // BUILD SEARCH INDEX
  // ==============================

  elements.cards.forEach(card => {

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
        .split(",")
        .map(k => normalizeText(k.trim()))
        .filter(Boolean)

    });

  });