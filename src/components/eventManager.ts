// EventManager
type EventCallback = EventListener;

interface RegisteredEvent {
  element: Element;
  event: string;
  callback: EventCallback;
}

export class EventManager {
  private events: RegisteredEvent[] = [];

  register(element: Element, event: string, callback: EventCallback): void {
    element.addEventListener(event, callback);
    this.events.push({ element, event, callback });
  }

  unregister(element: Element, event: string, callback?: EventCallback): void {
    this.events = this.events.filter((registered) => {
      if (
        registered.element === element &&
        registered.event === event &&
        (!callback || registered.callback === callback)
      ) {
        element.removeEventListener(event, registered.callback);
        return false;
      }
      return true;
    });
  }

  cleanup(): void {
    this.events.forEach(({ element, event, callback }) => {
      element.removeEventListener(event, callback);
    });
    this.events = [];
  }
}
