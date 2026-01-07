// Theme Manager
import { saveToStorage, loadFromStorage } from "./utils.js";
import { STORAGE_KEYS } from "./constants.js";
export class ThemeManager {
    constructor(themes) {
        this.currentTheme = "default";
        this.themes = themes;
        this.loadSavedTheme();
    }
    applyTheme(themeName) {
        if (!this.themes[themeName])
            return;
        const theme = this.themes[themeName];
        const root = document.documentElement;
        // Set Colours from theme data to css variables
        root.style.setProperty("--color-background-light", theme.backgroundLight);
        root.style.setProperty("--color-background-medium", theme.backgroundMedium);
        root.style.setProperty("--color-background-container", theme.backgroundContainer);
        root.style.setProperty("--color-highlight", theme.highlight);
        root.style.setProperty("--color-highlight-rgb", theme.highlightRgb);
        root.style.setProperty("--color-text", theme.text);
        // Set data-theme attribute for background pattern
        document.body.setAttribute("data-theme", themeName);
        this.currentTheme = themeName;
        saveToStorage(STORAGE_KEYS.THEME, themeName);
        this.updateActiveButton(themeName);
    }
    cycleTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        this.applyTheme(themeNames[nextIndex]);
    }
    getCurrentTheme() {
        return this.currentTheme;
    }
    updateActiveButton(themeName) {
        // Update active state on theme buttons
        document.querySelectorAll(".themeBtn").forEach((button) => {
            button.classList.remove("active");
            button.setAttribute("aria-checked", "false");
        });
        const activeBtn = document.querySelector(`.themeBtn[data-theme="${themeName}"]`);
        activeBtn?.classList.add("active");
        activeBtn?.setAttribute("aria-checked", "true");
    }
    loadSavedTheme() {
        const saved = loadFromStorage(STORAGE_KEYS.THEME);
        if (saved && this.themes[saved]) {
            this.applyTheme(saved);
        }
        else {
            this.applyTheme("default");
        }
    }
}
