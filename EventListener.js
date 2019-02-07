module.exports = class EventListener {
  constructor(client) {
    const methodsArray = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(m => !['constructor'].includes(m));
    methodsArray.forEach((methodName) => {
      console.log(methodName);
      const method = this[methodName];
      if (typeof method !== 'function') return;
      client.on(methodName, method);
    });
  }
};
