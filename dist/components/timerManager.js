import { DEFAULT_TIMER_DURATION, TIMER_WARNING_THRESHOLD_RATIO, STORAGE_KEYS, } from "./constants.js";
import { saveToStorage, loadFromStorage } from "./utils.js";
export class TimerManager {
    constructor(timerBar, timerText, timerContainer, onExpire) {
        this.timerBar = timerBar;
        this.timerText = timerText;
        this.timerContainer = timerContainer;
        this.onExpire = onExpire;
        this.duration = DEFAULT_TIMER_DURATION;
        this.currentTime = this.duration;
        this.pausedTime = null;
        this.interval = null;
        this.isEnabled = false;
        this.loadPreferences();
    }
    start() {
        if (!this.isEnabled)
            return;
        this.stop();
        this.currentTime = this.duration;
        this.updateDisplay();
        this.timerContainer.classList.add("active");
        this.interval = window.setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            const warningThreshold = Math.floor(this.duration * TIMER_WARNING_THRESHOLD_RATIO);
            if (this.currentTime <= warningThreshold) {
                this.timerBar.classList.add("warning");
            }
            if (this.currentTime <= 0) {
                this.onExpire();
            }
        }, 1000);
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.timerBar.classList.remove("warning");
    }
    pause() {
        if (this.interval) {
            this.pausedTime = this.currentTime;
            this.stop();
        }
    }
    resume() {
        if (this.pausedTime !== null) {
            this.currentTime = this.pausedTime;
            this.pausedTime = null;
            this.updateDisplay();
            this.timerContainer.classList.add("active");
            this.interval = window.setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                const warningThreshold = Math.floor(this.duration * TIMER_WARNING_THRESHOLD_RATIO);
                if (this.currentTime <= warningThreshold) {
                    this.timerBar.classList.add("warning");
                }
                if (this.currentTime <= 0) {
                    this.onExpire();
                }
            }, 1000);
        }
    }
    setDuration(seconds) {
        this.duration = seconds;
        this.currentTime = seconds;
        this.updateDisplay();
        saveToStorage(STORAGE_KEYS.TIMER_DURATION, seconds.toString());
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stop();
            this.timerContainer.classList.remove("active");
        }
        saveToStorage(STORAGE_KEYS.TIMER_ENABLED, enabled.toString());
    }
    showWaitingMessage() {
        this.timerContainer.classList.add("active");
        this.timerBar.style.width = "100%";
        this.timerText.textContent = "Waiting for Next Round";
        this.timerBar.classList.remove("warning");
    }
    getDuration() {
        return this.duration;
    }
    isTimerEnabled() {
        return this.isEnabled;
    }
    updateDisplay() {
        const percentage = (this.currentTime / this.duration) * 100;
        this.timerBar.style.width = `${percentage}%`;
        this.timerText.textContent = `${this.currentTime}s`;
    }
    loadPreferences() {
        const savedDuration = loadFromStorage(STORAGE_KEYS.TIMER_DURATION);
        if (savedDuration) {
            this.duration = parseInt(savedDuration);
            this.currentTime = this.duration;
        }
        const savedEnabled = loadFromStorage(STORAGE_KEYS.TIMER_ENABLED);
        if (savedEnabled === "true") {
            this.isEnabled = true;
        }
    }
}
