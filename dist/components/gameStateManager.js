// GameStateManager
export class GameStateManager {
    constructor() {
        this.initialized = false;
        this.aiThinking = false;
        this.focusedCellIndex = 0;
    }
    isInitialized() {
        return this.initialized;
    }
    setInitialized(value) {
        this.initialized = value;
    }
    isAIThinking() {
        return this.aiThinking;
    }
    setAIThinking(value) {
        this.aiThinking = value;
    }
    getFocusedCellIndex() {
        return this.focusedCellIndex;
    }
    setFocusedCellIndex(index) {
        this.focusedCellIndex = index;
    }
    reset() {
        this.initialized = false;
        this.aiThinking = false;
        this.focusedCellIndex = 0;
    }
}
