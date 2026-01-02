// GameStateManager
export class GameStateManager {
  private initialized = false;
  private aiThinking = false;
  private focusedCellIndex = 0;

  isInitialized(): boolean {
    return this.initialized;
  }

  setInitialized(value: boolean): void {
    this.initialized = value;
  }

  isAIThinking(): boolean {
    return this.aiThinking;
  }

  setAIThinking(value: boolean): void {
    this.aiThinking = value;
  }

  getFocusedCellIndex(): number {
    return this.focusedCellIndex;
  }

  setFocusedCellIndex(index: number): void {
    this.focusedCellIndex = index;
  }

  reset(): void {
    this.initialized = false;
    this.aiThinking = false;
    this.focusedCellIndex = 0;
  }
}
