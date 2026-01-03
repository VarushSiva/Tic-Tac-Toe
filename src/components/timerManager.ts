import {
  DEFAULT_TIMER_DURATION,
  TIMER_WARNING_THRESHOLD_RATIO,
  STORAGE_KEYS,
} from "./constants.js";
import { saveToStorage, loadFromStorage } from "./utils.js";

export class TimerManager {
  private duration: number = DEFAULT_TIMER_DURATION;
  private currentTime: number = this.duration;
  private pausedTime: number | null = null;
  private interval: number | null = null;
  private isEnabled: boolean = false;

  constructor(
    private timerBar: HTMLElement,
    private timerText: HTMLElement,
    private timerContainer: HTMLElement,
    private onExpire: () => void
  ) {
    this.loadPreferences();
  }

  start(): void {
    if (!this.isEnabled) return;

    this.stop();
    this.currentTime = this.duration;
    this.updateDisplay();
    this.timerContainer.classList.add("active");

    this.interval = window.setInterval(() => {
      this.currentTime--;
      this.updateDisplay();

      const warningThreshold = Math.floor(
        this.duration * TIMER_WARNING_THRESHOLD_RATIO
      );
      if (this.currentTime <= warningThreshold) {
        this.timerBar.classList.add("warning");
      }

      if (this.currentTime <= 0) {
        this.onExpire();
      }
    }, 1000);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.timerBar.classList.remove("warning");
  }

  pause(): void {
    if (this.interval) {
      this.pausedTime = this.currentTime;
      this.stop();
    }
  }

  resume(): void {
    if (this.pausedTime !== null) {
      this.currentTime = this.pausedTime;
      this.pausedTime = null;
      this.updateDisplay();
      this.timerContainer.classList.add("active");

      this.interval = window.setInterval(() => {
        this.currentTime--;
        this.updateDisplay();

        const warningThreshold = Math.floor(
          this.duration * TIMER_WARNING_THRESHOLD_RATIO
        );
        if (this.currentTime <= warningThreshold) {
          this.timerBar.classList.add("warning");
        }

        if (this.currentTime <= 0) {
          this.onExpire();
        }
      }, 1000);
    }
  }

  setDuration(seconds: number): void {
    this.duration = seconds;
    this.currentTime = seconds;
    this.updateDisplay();
    saveToStorage(STORAGE_KEYS.TIMER_DURATION, seconds.toString());
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
      this.timerContainer.classList.remove("active");
    }
    saveToStorage(STORAGE_KEYS.TIMER_ENABLED, enabled.toString());
  }

  showWaitingMessage(): void {
    this.timerContainer.classList.add("active");
    this.timerBar.style.width = "100%";
    this.timerText.textContent = "Waiting for Next Round";
    this.timerBar.classList.remove("warning");
  }

  getDuration(): number {
    return this.duration;
  }

  isTimerEnabled(): boolean {
    return this.isEnabled;
  }

  private updateDisplay(): void {
    const percentage = (this.currentTime / this.duration) * 100;
    this.timerBar.style.width = `${percentage}%`;
    this.timerText.textContent = `${this.currentTime}s`;
  }

  private loadPreferences(): void {
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
