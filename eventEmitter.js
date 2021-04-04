function EventEmitter() {
  this._events = {};
}

EventEmitter.prototype.on = function (eventName, callback) {
  if (!this._events) {
    this._events = {};
  }
  if (!this._events[eventName]) {
    this._events[eventName] = [];
  }
  this._events[eventName].push(callback);
};

EventEmitter.prototype.emit = function (eventName, ...args) {
  this._events[eventName] &&
    this._events[eventName].forEach((fn) => {
      fn(...args);
    });
};

EventEmitter.prototype.off = function (eventName, callback) {
  if(this._events[eventName]) {
    this._events[eventName] = this._events[eventName].filter(fn => fn !== callback && fn.l !== callback)
 }};

EventEmitter.prototype.once = function (eventName, callback) {
  let one = (...args) => {
    callback.call(this, ...args)
    this.off(eventName, one)
  }
  one.l = callback
  this.on(eventName, one)
};


module.exports = EventEmitter