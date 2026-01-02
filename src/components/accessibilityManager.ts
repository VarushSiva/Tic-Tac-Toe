// AccessibilityManager
import { saveToStorage, loadFromStorage } from "./utils";

type ToggleCallback = (enabled: boolean) => void;

export class AccessibilityManager {
  setupToggle(
    checkbox: HTMLInputElement,
    storageKey: string,
    className: string,
    callback?: ToggleCallback
  ): void {
    // Load saved preference
    const saved = loadFromStorage(storageKey);
    if (saved === "true") {
      checkbox.checked = true;
      this.applyToggle(className, true);
      if (callback) callback(true);
    }

    // Setup Event Listner
    checkbox.addEventListener("change", () => {
      const isEnabled = checkbox.checked;
      this.applyToggle(className, isEnabled);
      saveToStorage(storageKey, isEnabled.toString());
      if (callback) callback(isEnabled);
    });
  }

  // System Preference
  setupSystemPreference(
    mediaQuery: string,
    checkbox: HTMLInputElement,
    className: string,
    storageKey: string
  ): void {
    const saved = loadFromStorage(storageKey);
    if (window.matchMedia(mediaQuery).matches && !saved) {
      checkbox.checked = true;
      this.applyToggle(className, true);
    }
  }

  private applyToggle(className: string, enabled: boolean): void {
    if (enabled) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }
}
