
const checkType = (value, type) => {
  if (typeof value !== type) throw new Error(`value is not a ${type} - it's ${typeof value}`)
  return value
}

const checkFunc = (func) => {
  return checkType(func, 'function')
}

const checkName = (name) => {
  return checkType(name, 'string') && name.length
}

const checkArgs = (name, func) => {
  return {
    name: checkName(name),
    func: checkFunc(func)
  }
}

/**
 * an event can have a number of listeners associated
 * @class BmEvent
 * 
 */
export class BmEvent {
  /**
   * @param {string} name event name 
   * @param {boolean} [strict=false] whether to fail if referenced listeners are not found 
   * @returns {BmEvent}
   */
  constructor(name, strict = false) {
    this._listeners = new Map()
    this._name = name
    this._strict = strict
  }

  /**
   * returns {boolean}
   */
  get strict() {
    return this._strict
  }

  /**
   * @returns {Map <BmListener>}
   */
  get listeners() {
    return this._listeners
  }

  /**
   * @returns {string} the event name this listener belongs to
   */
  get name() {
    return this._name
  }

  /**
   * only throws an error if strict is set true
   * @param {string} message 
   */
  _thrower(message) {
    if (this.strict) throw new Error(message)
  }

  /**
   * add a listener
   * if already exists it ignores
   * @param {function} func what to do on emit
   * @param {boolean} once whether its once only 
   * @returns {BmListener}
   */
  addListener(func, once) {

    if (!this.listeners.has(func)) {
      // we can use the function as a key
      this.listeners.set(func, {
        name: this.name,
        func,
        once
      })
    } else {
      this._thrower(`${this.name} already has a listener for ${func}`)
    }
    return this.fetchListener(func)
  }

  /**
   * remove a listeber
   * @param {function} func what to do on emit
   * @param {boolean} once whether its once only 
   * @returns {BmListener}
   */
  removeListener(func) {
    checkFunc(func)
    const listener = this.fetchListener(func)
    if (listener) {
      this.listeners.delete(func)
    }
    return listener
  }

  /**
   * get the listener or maybe fail
   * @param {function} func what to ex on emit
   * @returns {object} {listener:BmListener, event: BmEvent }
   */
  fetchListener(func) {
    checkFunc(func)
    if (!this.listeners.has(func)) {
      this._thrower(`listener ${func} not found for event ${this.name}`)
    }
    return this.listeners.get(func)
  }

  /**
   * emit event
   * @param  {...any} args any args
   * @returns {BmEvent}
   */
  emit(...args) {

    // execute each listener in turn
    for (const listener of this.listeners.values()) {

      if (listener.once) {
        this.removeListener(listener.func)
      }
      listener.func(...args)
    }
    return this
  }

  removeAllListeners() {
    this._listeners = new Map()
  }

}

/**
 * @class BmListener
 */
export class BmListener {
  /**
   * @constructor
   * @param {string} name event name this listener belongs to
   * @param {function} func the func to execute
   * @param {boolean} [once=false] whether to execute just once
   * @returns {BmListener}
   */
  constructor(name, func, once = false) {
    this._name = name
    this._func = func
    this._once = once
  }
  get func() {
    return this._func
  }
  get once() {
    return this._once
  }
  get name() {
    return this._name
  }
}

/**
 * @class BmEmitter
 * constroller for events
 */
export class BmEmitter {

  /**
   * @constructor
   * @param {boolean} [strict=false] whether to throw error if attempts are made to access non exitent things
   * @returns {BmEmitter} 
   */
  constructor(strict = false) {
    this._events = new Map()
    this._strict = strict
  }

  /**
   * returns {boolean}
   */
  get strict() {
    return this._strict
  }

  /**
   * set a new event listener - add the event name if it doesnt exist
   * @param {string} name event name
   * @param {function} func what to execute on emit
   * @returns {BmListener}
   */
  on(name, func) {
    return this._on(name, func, false)
  }

  /**
   * set a new event listener to run once only - add the event name if it doesnt exist
   * @param {string} name event name
   * @param {function} func what to execute on emit
   * @returns {BmListener}
   */
  once(name, func) {
    return this._on(name, func, true)
  }


  /**
   * set a new event listener - add the event name if it doesnt exist
   * @param {string} name event name
   * @param {function} func what to run on emit
   * @param {boolean} once whether its a once off emit
   * @returns {BmListener}
   */
  _on(name, func, once) {
    checkArgs(name, func)

    if (!this.events.has(name)) {
      this._events.set(name, new BmEvent(name, this.strict))
    }
    return this.events.get(name).addListener(func, once)
  }

  /**
 * only throws an error if strict is set true
 * @param {string} message 
 */
  _thrower(message) {
    if (this.strict) throw new Error(message)
  }

  /**
   * remove an event listener - remove the event if there's no more listeners
   * @param {string} name event name
   * @param {function} func what to execute on emit
   * @returns {BmListener} the removed listener
   */
  off(name, func) {
    checkArgs(name, func)
    const e = this.fetchEvent(name)
    if (!e) {
      return null
    }
    const listener = e.removeListener(func)
    this.prune (e)
    return listener
  }

  /**
   * get the events 
   * @returns {Map <BmEvent>}
   */
  get events() {
    return this._events
  }

  /**
   * extract the known event names
   * return {string []} the event names
   */
  get eventNames() {
    return Array.from(this.events.keys())
  }


  /**
   * how many listeners are registers
   * @param {string} name the event name
   * @returns {number}
   */
  listenerCount(name) {
    const e = this.fetchEvent(name)
    return e.listeners.size
  }

  /**
   * get the event or fail
   * @param {string} name the event name
   * @returns {BmEvent}
   */
  fetchEvent(name) {
    checkName(name)
    if (!this.events.has(name)) {
      this._thrower(`event ${name} doesn't exist`)
    }
    return this.events.get(name)
  }


  /**
   * remove all listeners from an event
   * @param {string} name event name 
   * @return {BmEvent}
   */
  removeAllListeners(name) {
    const e = this.fetchEvent(name)
    if (!e) return null

    e.removeAllListeners()
    this.prune (e)
    return e
  }

  /**
   * emit event
   * @param {string} name the event name
   * @param  {...any} args any args
   * @returns {BmEvent}
   */
  emit(name, ...args) {
    const e = this.fetchEvent(name)
    if (!e) return null
    const result = e.emit(...args)
    this.prune(e)
    return result
  }

  
  prune(e) {

    // drop the event if stict and there are no listeners left 
    if (e && e.strict && !e.listenerCount) {
      this.events.delete(e.name)
    }
    return e
  }


}