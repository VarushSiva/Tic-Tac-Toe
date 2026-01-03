// AccessibilityManager
import { saveToStorage, loadFromStorage } from "./utils.js";
export class AccessibilityManager {
    setupToggle(checkbox, storageKey, className, callback) {
        // Load saved preference
        const saved = loadFromStorage(storageKey);
        if (saved === "true") {
            checkbox.checked = true;
            this.applyToggle(className, true);
            if (callback)
                callback(true);
        }
        // Setup Event Listner
        checkbox.addEventListener("change", () => {
            const isEnabled = checkbox.checked;
            this.applyToggle(className, isEnabled);
            saveToStorage(storageKey, isEnabled.toString());
            if (callback)
                callback(isEnabled);
        });
    }
    // System Preference
    setupSystemPreference(mediaQuery, checkbox, className, storageKey) {
        const saved = loadFromStorage(storageKey);
        if (window.matchMedia(mediaQuery).matches && !saved) {
            checkbox.checked = true;
            this.applyToggle(className, true);
        }
    }
    applyToggle(className, enabled) {
        if (enabled) {
            document.body.classList.add(className);
        }
        else {
            document.body.classList.remove(className);
        }
    }
}
