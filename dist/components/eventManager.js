export class EventManager {
    constructor() {
        this.events = [];
    }
    register(element, event, callback) {
        element.addEventListener(event, callback);
        this.events.push({ element, event, callback });
    }
    unregister(element, event, callback) {
        this.events = this.events.filter((registered) => {
            if (registered.element === element &&
                registered.event === event &&
                (!callback || registered.callback === callback)) {
                element.removeEventListener(event, registered.callback);
                return false;
            }
            return true;
        });
    }
    cleanup() {
        this.events.forEach(({ element, event, callback }) => {
            element.removeEventListener(event, callback);
        });
        this.events = [];
    }
}
