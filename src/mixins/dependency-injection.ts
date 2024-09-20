interface DIEventDetail {
  key: string;
  instance: any;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export const Requestor = <T extends Constructor<EventTarget>>(superClass: T) =>
  class extends superClass {
    requestInstance<TInstance>(key: string): TInstance | null {
      const event = new CustomEvent<DIEventDetail>("request-instance", {
        detail: { key: key, instance: null },
        bubbles: true,
        composed: true,
      });

      this.dispatchEvent(event); //synchronous

      return event.detail.instance;
    }
  };

export const Provider = <T extends Constructor<EventTarget>>(superClass: T) =>
  class extends superClass {
    _instances = new Map<string, any>();

    constructor(...args: any[]) {
      super(...args);

      addEventListener("request-instance", (event: CustomEvent<DIEventDetail>) => {
        const key = event.detail.key;
        if (this._instances.has(key)) {
          event.detail.instance = this._instances.get(key);
          event.stopPropagation();
        }
      });
    }

    provideInstance(key: string, instance: any) {
      this._instances.set(key, instance);
    }
  };
