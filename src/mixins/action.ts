type Constructor<T = {}> = new (...args: any[]) => T;

export const Actor = <T extends Constructor<EventTarget>>(superClass: T) =>
  class extends superClass {
    action<TDetail>(type: string, detail: TDetail): TDetail {
      const event = new CustomEvent<TDetail>(type, {
        detail: detail,
        bubbles: true,
        composed: true,
      });

      this.dispatchEvent(event);

      return event.detail;
    }
  };
