/**
 * Basic event firing and listening functionality
 */
/*
 * utility function for promise-mode cases where no handler is passed in
 * (in that case, the hander is the resolver of the promise we will return)
 */
let promiseHandler = () => {
	var handler;
	var promise = new Promise((resolve, reject) => {
		handler = resolve;
	});
	return {
		promise: promise,
		handler: handler
	};
}
/*
 * given a function that may or may not return a promise,
 * return a function that does return a promise
 */
let promisify = (func) => {
	return (...args) => {
		return Promise.resolve().then(() => func.apply(func, args));
	};
};

/**
 * take a handler and make it remove itself once it gets called
 */
let onceify = (event, eventName, func) => {
	var oncefunc = (...args) => {
		var rval = func.apply(func, args);
		event.off(eventName, oncefunc);
		return rval;
	};
	return oncefunc;
};

export class EventBus {
	constructor() {
		Object.assign(this, {
			handlers: {},
			payloads: {}
		});
	}
	/**
	 * fire the named event, along with optional payload
	 * return a promise that resolves when all handlers have completed
	 * If there is only one handler, resolve with the return value of that handler
	 * else resolve with array from all handlers
	 */
	fire(eventName, payload) {
		this.payloads[eventName] = payload;
		if (!(this.handlers[eventName] && this.handlers[eventName].length)) {
			return Promise.resolve();
		}
		if (this.handlers[eventName].length == 1) {
			let handler = promisify(this.handlers[eventName][0]);
			return handler(payload);
		}
		return Promise.all(this.handlers[eventName].map(handler => {
			handler = promisify(handler);
			return handler(payload);
		}));
	}
	/**
	 * add a handler for an event
	 * @eventName {String} the name of the event to listen for
	 * @handler {Function} a callback function to handle the event (will be sent a payload if there is one)
	 * @refire {boolean} {optional} set to false IF you don't want to have the last event re-fired
	 */
	on(eventName, handler, refire = true) {
		// make sure we replace if called multiple
		this.off(eventName, handler);
		this.handlers[eventName] = this.handlers[eventName] || [];
		this.handlers[eventName].push(handler);
		// If the event has already fired, call the handler right back, fixes late listener problems
		if (refire && this.payloads[eventName]) {
			handler(this.payloads[eventName]);
		}
	}
	/**
	 * remove a handler for an event
	 */
	off(eventName, handler) {
		if (this.handlers[eventName]) {
			var position = this.handlers[eventName].indexOf(handler);
			if (position != -1) {
				this.handlers[eventName].splice(position, 1);
			}
		}
	}
	/*
	 * add a one-time handler for an event
	 * handler: optional callback function, but can also be used inpromise mode
	 *
	 * event.once("tick", function...)
	 * event.once("tick").then(function...)
	 */
	once(eventName, h, refire = false) {
		var p;
		var {promise,handler} = promiseHandler();
		if (!h) {
			p = promise;
			h = handler;
		}
		this.on(eventName, onceify(this, eventName, h), refire);
		return p;
	}
	/*
	 * replay the most recent firing of this event, or if it hasn't fired at all yet, wait for it
	 *
	 * handler: optional callback function, but can also be used in promise mode
	 *
	 * event.last("login", function....)
	 * event.last("login").then(function...)
	 */
	last(eventName, handler) {
		var payload = this.payloads[eventName];
		if (payload) {
			let promise = Promise.resolve(payload);
			return handler ? promise.then(handler) : promise;
		}
		return this.once(eventName, handler);
	}
};

/**
 * Create a shared event bus, handy for firing events from es6 and listening in ts, or vice-versa
 */
if (typeof window != "undefined") {
	if (typeof window.SharedEventBus == "undefined") {
		window.SharedEventBus = new EventBus();
	}
}
