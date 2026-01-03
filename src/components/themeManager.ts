// Theme Manager
import { saveToStorage, loadFromStorage } from "./utils.js";
import { STORAGE_KEYS } from "./constants.js";

export interface Theme {
  backgroundLight: string;
  backgroundMedium: string;
  backgroundContainer: string;
  highlight: string;
  highlightRgb: string;
  text: string;
}

export class ThemeManager {
  private themes: Record<string, Theme>;
  private currentTheme: string = "default";

  constructor(themes: Record<string, Theme>) {
    this.themes = themes;
    this.loadSavedTheme();
  }

  applyTheme(themeName: string): void {
    if (!this.themes[themeName]) return;

    const theme = this.themes[themeName];
    const root = document.documentElement;

    // Set Colours from theme data to css variables
    root.style.setProperty("--color-background-light", theme.backgroundLight);
    root.style.setProperty("--color-background-medium", theme.backgroundMedium);
    root.style.setProperty(
      "--color-background-container",
      theme.backgroundContainer
    );
    root.style.setProperty("--color-highlight", theme.highlight);
    root.style.setProperty("--color-highlight-rgb", theme.highlightRgb);
    root.style.setProperty("--color-text", theme.text);

    // Set data-theme attribute for background pattern
    document.body.setAttribute("data-theme", themeName);
    this.currentTheme = themeName;
    saveToStorage(STORAGE_KEYS.THEME, themeName);

    this.updateActiveButton(themeName);
  }

  cycleTheme(): void {
    const themeNames = Object.keys(this.themes);
    const currentIndex = themeNames.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    this.applyTheme(themeNames[nextIndex]);
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  private updateActiveButton(themeName: string): void {
    // Update active state on theme buttons
    document.querySelectorAll(".themeBtn").forEach((button) => {
      button.classList.remove("active");
    });
    const activeBtn = document.querySelector<HTMLButtonElement>(
      `[data-theme="${themeName}"]`
    );
    activeBtn?.classList.add("active");
  }

  private loadSavedTheme(): void {
    const saved = loadFromStorage(STORAGE_KEYS.THEME);
    if (saved && this.themes[saved]) {
      this.applyTheme(saved);
    } else {
      this.applyTheme("default");
    }
  }
}
