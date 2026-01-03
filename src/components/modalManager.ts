// ModalManager
import { openModal, closeModal } from "./utils.js";

export class ModalManager {
  private activeFocus: Array<() => void> = [];

  constructor(private onPause?: () => void, private onResume?: () => void) {}

  open(
    overlayElement: HTMLElement,
    modalElement: HTMLElement,
    focusElement: HTMLElement
  ): void {
    openModal(overlayElement);

    if (this.onPause) this.onPause();

    const cleanup = this.setupFocus(modalElement);
    if (cleanup) this.activeFocus.push(cleanup);

    focusElement.focus();
  }

  close(overlayElement: HTMLElement, returnFocusElement?: HTMLElement): void {
    closeModal(overlayElement);

    this.clearFocus();

    if (this.onResume) this.onResume();

    if (returnFocusElement) {
      setTimeout(() => returnFocusElement.focus(), 50);
    }
  }

  // Focus Restrictions when modal open
  private setupFocus(container: HTMLElement): (() => void) | void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    return () => container.removeEventListener("keydown", handleTabKey);
  }

  private clearFocus(): void {
    this.activeFocus.forEach((cleanup) => cleanup());
    this.activeFocus = [];
  }
}
