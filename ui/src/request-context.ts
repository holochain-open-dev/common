import { property } from 'lit/decorators.js';
import { ContextController } from './context-controller';
import { ContextEvent, ContextTypeMap } from './context-event';

export const requestContext = (contextName: string) => {
  return function (proto: any, propertyKey: string) {
    property()(proto, propertyKey);
    const callback = proto.connectedCallback as any;

    proto.connectedCallback = function () {
      callback.call(this);

      const controller = new ContextController(
        this,
        value => (this[propertyKey] = value),
        contextName as keyof ContextTypeMap
      );
    };
  };
};
