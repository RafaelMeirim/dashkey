// themes/themes.js
// ========================================
// DASHKEY THEMES
// ========================================

const DASHKEY_THEMES = {
    // Default theme (dark)
    default: {
        color_bg: "#0f172a",
        color_surface: "#1e293b",
        color_surface_hover: "#334155",
        color_text: "#f1f5f9",
        color_text_secondary: "#94a3b8",
        color_accent: "#3b82f6",
        launcher_bg: "rgba(0, 0, 0, 0.8)",
        launcher_box_bg: "#1e293b",
        launcher_border: "#334155"
    },
    
    // Dracula theme
    dracula: {
        color_bg: "#282a36",
        color_surface: "#44475a",
        color_surface_hover: "#6272a4",
        color_text: "#f8f8f2",
        color_text_secondary: "#bd93f9",
        color_accent: "#ff79c6",
        launcher_bg: "rgba(40, 42, 54, 0.95)",
        launcher_box_bg: "#44475a",
        launcher_border: "#6272a4"
    },
    
    // Nord theme
    nord: {
        color_bg: "#2e3440",
        color_surface: "#3b4252",
        color_surface_hover: "#434c5e",
        color_text: "#eceff4",
        color_text_secondary: "#d8dee9",
        color_accent: "#88c0d0",
        launcher_bg: "rgba(46, 52, 64, 0.95)",
        launcher_box_bg: "#3b4252",
        launcher_border: "#4c566a"
    },
    
    // Ocean theme
    ocean: {
        color_bg: "#1a2639",
        color_surface: "#2a3b4c",
        color_surface_hover: "#3a4f63",
        color_text: "#e8f0fe",
        color_text_secondary: "#a0b9d6",
        color_accent: "#4ea5d9",
        launcher_bg: "rgba(26, 38, 57, 0.95)",
        launcher_box_bg: "#2a3b4c",
        launcher_border: "#3a4f63"
    },
    
    // Midnight theme
    midnight: {
        color_bg: "#0a0c10",
        color_surface: "#14181c",
        color_surface_hover: "#1e2429",
        color_text: "#e6edf3",
        color_text_secondary: "#7a8b9b",
        color_accent: "#5f7e97",
        launcher_bg: "rgba(10, 12, 16, 0.95)",
        launcher_box_bg: "#14181c",
        launcher_border: "#1e2429"
    },
    
    // Light theme
    light: {
        color_bg: "#fd2f0b",
        color_surface: "#ffffff",
        color_surface_hover: "#f1f5f9",
        color_text: "#0f172a",
        color_text_secondary: "#475569",
        color_accent: "#3b82f6",
        launcher_bg: "rgba(255, 255, 255, 0.95)",
        launcher_box_bg: "#ffffff",
        launcher_border: "#e2e8f0"
    }
};

// Make it globally available
window.DASHKEY_THEMES = DASHKEY_THEMES;