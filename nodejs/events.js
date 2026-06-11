// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
/**
 * Creates a `Promise` that is fulfilled when the emitter
 * emits the given event.
 * @param {EventEmitter} emitter
 * @param {string | symbol} name
 * @param {{ signal: AbortSignal; }} [options]
 * @returns {Promise}
 */
var once = _async(function (emitter, name) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
  validateObject(options, 'options');
  var {
    signal
  } = options;
  validateAbortSignal(signal, 'options.signal');
  if (signal?.aborted) throw new AbortError(undefined, {
    cause: signal.reason
  });
  return new Promise((resolve, reject) => {
    var errorListener = err => {
      emitter.removeListener(name, resolver);
      if (signal != null) {
        eventTargetAgnosticRemoveListener(signal, 'abort', abortListener);
      }
      reject(err);
    };
    var resolver = function () {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      if (signal != null) {
        eventTargetAgnosticRemoveListener(signal, 'abort', abortListener);
      }
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      resolve(args);
    };
    kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
    var opts = {
      __proto__: null,
      once: true,
      [kResistStopPropagation]: true
    };
    eventTargetAgnosticAddListener(emitter, name, resolver, opts);
    if (name !== 'error' && typeof emitter.once === 'function') {
      // EventTarget does not have `error` event semantics like Node
      // EventEmitters, we listen to `error` events only on EventEmitters.
      emitter.once('error', errorListener);
    }
    function abortListener() {
      eventTargetAgnosticRemoveListener(emitter, name, resolver);
      eventTargetAgnosticRemoveListener(emitter, 'error', errorListener);
      reject(new AbortError(undefined, {
        cause: signal?.reason
      }));
    }
    if (signal != null) {
      eventTargetAgnosticAddListener(signal, 'abort', abortListener, {
        __proto__: null,
        once: true,
        [kResistStopPropagation]: true
      });
    }
  });
});
var {
  ArrayPrototypeJoin,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  AsyncIteratorPrototype,
  Boolean: _Boolean,
  Error,
  ErrorCaptureStackTrace,
  FunctionPrototypeBind,
  NumberMAX_SAFE_INTEGER,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectGetPrototypeOf,
  ObjectSetPrototypeOf,
  Promise,
  PromiseReject,
  PromiseResolve,
  ReflectApply,
  ReflectOwnKeys,
  String: _String,
  StringPrototypeSplit,
  Symbol: _Symbol,
  SymbolAsyncIterator,
  SymbolDispose,
  SymbolFor
} = primordials;
var kRejection = SymbolFor('nodejs.rejection');
var {
  kEmptyObject,
  spliceOne
} = require('internal/util');
var {
  inspect,
  identicalSequenceRange
} = require('internal/util/inspect');
var FixedQueue;
var kFirstEventParam;
var kResistStopPropagation;
var {
  AbortError,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_UNHANDLED_ERROR
  },
  genericNodeError,
  kEnhanceStackBeforeInspector
} = require('internal/errors');
var {
  validateInteger,
  validateAbortSignal,
  validateBoolean,
  validateFunction,
  validateNumber,
  validateObject,
  validateString
} = require('internal/validators');
var {
  addAbortListener
} = require('internal/events/abort_listener');
var kCapture = _Symbol('kCapture');
var kErrorMonitor = _Symbol('events.errorMonitor');
var kShapeMode = _Symbol('shapeMode');
var kEmitting = _Symbol('events.emitting');
var kMaxEventTargetListeners = _Symbol('events.maxEventTargetListeners');
var kMaxEventTargetListenersWarned = _Symbol('events.maxEventTargetListenersWarned');
var kWatermarkData = SymbolFor('nodejs.watermarkData');
var EventEmitterAsyncResource;
// The EventEmitterAsyncResource has to be initialized lazily because event.js
// is loaded so early in the bootstrap process, before async_hooks is available.
//
// This implementation was adapted straight from addaleax's
// eventemitter-asyncresource MIT-licensed userland module.
// https://github.com/addaleax/eventemitter-asyncresource
function lazyEventEmitterAsyncResource() {
  if (EventEmitterAsyncResource === undefined) {
    var _asyncResource;
    var {
      AsyncResource
    } = require('async_hooks');
    var _eventEmitter = /*#__PURE__*/new WeakMap();
    var EventEmitterReferencingAsyncResource = /*#__PURE__*/function (_AsyncResource) {
      /**
       * @param {EventEmitter} ee
       * @param {string} [type]
       * @param {{
       *   triggerAsyncId?: number,
       *   requireManualDestroy?: boolean,
       * }} [options]
       */
      function EventEmitterReferencingAsyncResource(ee, type, options) {
        var _this;
        _classCallCheck(this, EventEmitterReferencingAsyncResource);
        _this = _callSuper(this, EventEmitterReferencingAsyncResource, [type, options]);
        _classPrivateFieldInitSpec(_this, _eventEmitter, void 0);
        _classPrivateFieldSet(_eventEmitter, _this, ee);
        return _this;
      }

      /**
       * @type {EventEmitter}
       */
      _inherits(EventEmitterReferencingAsyncResource, _AsyncResource);
      return _createClass(EventEmitterReferencingAsyncResource, [{
        key: "eventEmitter",
        get: function () {
          return _classPrivateFieldGet(_eventEmitter, this);
        }
      }]);
    }(AsyncResource);
    EventEmitterAsyncResource = (_asyncResource = /*#__PURE__*/new WeakMap(), /*#__PURE__*/function (_EventEmitter) {
      /**
       * @param {{
       *   name?: string,
       *   triggerAsyncId?: number,
       *   requireManualDestroy?: boolean,
       * }} [options]
       */
      function EventEmitterAsyncResource() {
        var _this2;
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
        _classCallCheck(this, EventEmitterAsyncResource);
        var name;
        if (typeof options === 'string') {
          name = options;
          options = undefined;
        } else {
          if ((this instanceof EventEmitterAsyncResource ? this.constructor : void 0) === EventEmitterAsyncResource) {
            validateString(options?.name, 'options.name');
          }
          name = options?.name || (this instanceof EventEmitterAsyncResource ? this.constructor : void 0).name;
        }
        _this2 = _callSuper(this, EventEmitterAsyncResource, [options]);
        _classPrivateFieldInitSpec(_this2, _asyncResource, void 0);
        _classPrivateFieldSet(_asyncResource, _this2, new EventEmitterReferencingAsyncResource(_this2, name, options));
        return _this2;
      }

      /**
       * @param {symbol|string} event
       * @param {any[]} args
       * @returns {boolean}
       */
      _inherits(EventEmitterAsyncResource, _EventEmitter);
      return _createClass(EventEmitterAsyncResource, [{
        key: "emit",
        value: function emit(event) {
          var asyncResource = _classPrivateFieldGet(_asyncResource, this);
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          ArrayPrototypeUnshift(args, _superPropGet(EventEmitterAsyncResource, "emit", this, 1), this, event);
          return ReflectApply(asyncResource.runInAsyncScope, asyncResource, args);
        }

        /**
         * @returns {void}
         */
      }, {
        key: "emitDestroy",
        value: function emitDestroy() {
          _classPrivateFieldGet(_asyncResource, this).emitDestroy();
        }

        /**
         * @type {number}
         */
      }, {
        key: "asyncId",
        get: function () {
          return _classPrivateFieldGet(_asyncResource, this).asyncId();
        }

        /**
         * @type {number}
         */
      }, {
        key: "triggerAsyncId",
        get: function () {
          return _classPrivateFieldGet(_asyncResource, this).triggerAsyncId();
        }

        /**
         * @type {EventEmitterReferencingAsyncResource}
         */
      }, {
        key: "asyncResource",
        get: function () {
          return _classPrivateFieldGet(_asyncResource, this);
        }
      }]);
    }(EventEmitter));
  }
  return EventEmitterAsyncResource;
}

/**
 * Creates a new `EventEmitter` instance.
 * @param {{ captureRejections?: boolean; }} [opts]
 * @constructs EventEmitter
 */
function EventEmitter(opts) {
  EventEmitter.init.call(this, opts);
}
module.exports = EventEmitter;
module.exports.addAbortListener = addAbortListener;
module.exports.once = once;
module.exports.on = on;
module.exports.getEventListeners = getEventListeners;
module.exports.getMaxListeners = getMaxListeners;
module.exports.listenerCount = listenerCount;
// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.usingDomains = false;
EventEmitter.captureRejectionSymbol = kRejection;
ObjectDefineProperty(EventEmitter, 'captureRejections', {
  __proto__: null,
  get() {
    return EventEmitter.prototype[kCapture];
  },
  set(value) {
    validateBoolean(value, 'EventEmitter.captureRejections');
    EventEmitter.prototype[kCapture] = value;
  },
  enumerable: true
});
ObjectDefineProperty(EventEmitter, 'EventEmitterAsyncResource', {
  __proto__: null,
  enumerable: true,
  get: lazyEventEmitterAsyncResource,
  set: undefined,
  configurable: true
});
EventEmitter.errorMonitor = kErrorMonitor;

// The default for captureRejections is false
ObjectDefineProperty(EventEmitter.prototype, kCapture, {
  __proto__: null,
  value: false,
  writable: true,
  enumerable: false
});
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;
var isEventTarget;
function checkListener(listener) {
  validateFunction(listener, 'listener');
}
ObjectDefineProperty(EventEmitter, 'defaultMaxListeners', {
  __proto__: null,
  enumerable: true,
  get: function () {
    return defaultMaxListeners;
  },
  set: function (arg) {
    validateNumber(arg, 'defaultMaxListeners', 0);
    defaultMaxListeners = arg;
  }
});
ObjectDefineProperties(EventEmitter, {
  kMaxEventTargetListeners: {
    __proto__: null,
    value: kMaxEventTargetListeners,
    enumerable: false,
    configurable: false,
    writable: false
  },
  kMaxEventTargetListenersWarned: {
    __proto__: null,
    value: kMaxEventTargetListenersWarned,
    enumerable: false,
    configurable: false,
    writable: false
  }
});

/**
 * Sets the max listeners.
 * @param {number} n
 * @param {EventTarget[] | EventEmitter[]} [eventTargets]
 * @returns {void}
 */
EventEmitter.setMaxListeners = function () {
  var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMaxListeners;
  validateNumber(n, 'setMaxListeners', 0);
  if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 0) {
    defaultMaxListeners = n;
  } else {
    if (isEventTarget === undefined) isEventTarget = require('internal/event_target').isEventTarget;
    for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
      var target = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
      if (isEventTarget(target)) {
        target[kMaxEventTargetListeners] = n;
        target[kMaxEventTargetListenersWarned] = false;
      } else if (typeof target.setMaxListeners === 'function') {
        target.setMaxListeners(n);
      } else {
        throw new ERR_INVALID_ARG_TYPE('eventTargets', ['EventEmitter', 'EventTarget'], target);
      }
    }
  }
};

// If you're updating this function definition, please also update any
// re-definitions, such as the one in the Domain module (lib/domain.js).
EventEmitter.init = function (opts) {
  if (this._events === undefined || this._events === ObjectGetPrototypeOf(this)._events) {
    this._events = {
      __proto__: null
    };
    this._eventsCount = 0;
    this[kShapeMode] = false;
  } else {
    this[kShapeMode] = true;
  }
  this._maxListeners ||= undefined;
  if (opts?.captureRejections) {
    validateBoolean(opts.captureRejections, 'options.captureRejections');
    this[kCapture] = _Boolean(opts.captureRejections);
  } else {
    // Assigning the kCapture property directly saves an expensive
    // prototype lookup in a very sensitive hot path.
    this[kCapture] = EventEmitter.prototype[kCapture];
  }
};
function addCatch(that, promise, type, args) {
  if (!that[kCapture]) {
    return;
  }

  // Handle Promises/A+ spec, then could be a getter
  // that throws on second use.
  try {
    var then = promise.then;
    if (typeof then === 'function') {
      then.call(promise, undefined, function (err) {
        // The callback is called with nextTick to avoid a follow-up
        // rejection from this promise.
        process.nextTick(emitUnhandledRejectionOrErr, that, err, type, args);
      });
    }
  } catch (err) {
    that.emit('error', err);
  }
}
function emitUnhandledRejectionOrErr(ee, err, type, args) {
  if (typeof ee[kRejection] === 'function') {
    ee[kRejection].apply(ee, [err, type].concat(_toConsumableArray(args)));
  } else {
    // We have to disable the capture rejections mechanism, otherwise
    // we might end up in an infinite loop.
    var prev = ee[kCapture];

    // If the error handler throws, it is not catchable and it
    // will end up in 'uncaughtException'. We restore the previous
    // value of kCapture in case the uncaughtException is present
    // and the exception is handled.
    try {
      ee[kCapture] = false;
      ee.emit('error', err);
    } finally {
      ee[kCapture] = prev;
    }
  }
}

/**
 * Increases the max listeners of the event emitter.
 * @param {number} n
 * @returns {EventEmitter}
 */
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  validateNumber(n, 'setMaxListeners', 0);
  this._maxListeners = n;
  return this;
};
function _getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

/**
 * Returns the current max listener value for the event emitter.
 * @returns {number}
 */
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};
function enhanceStackTrace(err, own) {
  var ctorInfo = '';
  try {
    var {
      name
    } = this.constructor;
    if (name !== 'EventEmitter') ctorInfo = ` on ${name} instance`;
  } catch {
    // Continue regardless of error.
  }
  var sep = `\nEmitted 'error' event${ctorInfo} at:\n`;
  var errStack = ArrayPrototypeSlice(StringPrototypeSplit(err.stack, '\n'), 1);
  var ownStack = ArrayPrototypeSlice(StringPrototypeSplit(own.stack, '\n'), 1);
  var {
    len,
    offset
  } = identicalSequenceRange(ownStack, errStack);
  if (len > 0) {
    ArrayPrototypeSplice(ownStack, offset + 1, len - 2, '    [... lines matching original stack trace ...]');
  }
  return err.stack + sep + ArrayPrototypeJoin(ownStack, '\n');
}

/**
 * Synchronously calls each of the listeners registered
 * for the event.
 * @param {string | symbol} type
 * @param {...any} [args]
 * @returns {boolean}
 */
EventEmitter.prototype.emit = function emit(type) {
  var doError = type === 'error';
  var events = this._events;
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  if (events !== undefined) {
    if (doError && events[kErrorMonitor] !== undefined) this.emit.apply(this, [kErrorMonitor].concat(args));
    doError &&= events.error === undefined;
  } else if (!doError) return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0) er = args[0];
    if (er instanceof Error) {
      try {
        var capture = {};
        ErrorCaptureStackTrace(capture, EventEmitter.prototype.emit);
        ObjectDefineProperty(er, kEnhanceStackBeforeInspector, {
          __proto__: null,
          value: FunctionPrototypeBind(enhanceStackTrace, this, er, capture),
          configurable: true
        });
      } catch {
        // Continue regardless of error.
      }

      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    var stringifiedEr;
    try {
      stringifiedEr = inspect(er);
    } catch {
      stringifiedEr = er;
    }

    // At least give some kind of context to the user
    var err = new ERR_UNHANDLED_ERROR(stringifiedEr);
    err.context = er;
    throw err; // Unhandled 'error' event
  }
  var handler = events[type];
  if (handler === undefined) return false;
  if (typeof handler === 'function') {
    var result = ReflectApply(handler, this, args);

    // We check if result is undefined first because that
    // is the most common case so we do not pay any perf
    // penalty
    if (result !== undefined && result !== null) {
      addCatch(this, result, type, args);
    }
  } else {
    handler[kEmitting]++;
    try {
      for (var i = 0; i < handler.length; ++i) {
        var _result = ReflectApply(handler[i], this, args);

        // We check if result is undefined first because that
        // is the most common case so we do not pay any perf
        // penalty.
        // This code is duplicated because extracting it away
        // would make it non-inlineable.
        if (_result !== undefined && _result !== null) {
          addCatch(this, _result, type, args);
        }
      }
    } finally {
      handler[kEmitting]--;
    }
  }
  return true;
};
function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;
  checkListener(listener);
  events = target._events;
  if (events === undefined) {
    events = target._events = {
      __proto__: null
    };
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type, listener.listener ?? listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }
  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = prepend ? [listener, existing] : [existing, listener];
      existing[kEmitting] = 0;
      events[type] = existing;
      // If we've already got an array, just append.
    } else {
      existing = ensureMutableListenerArray(events, type, existing);
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      var w = genericNodeError(`Possible EventEmitter memory leak detected. ${existing.length} ${_String(type)} listeners ` + `added to ${inspect(target, {
        depth: -1
      })}. MaxListeners is ${m}. Use emitter.setMaxListeners() to increase limit`, {
        name: 'MaxListenersExceededWarning',
        emitter: target,
        type: type,
        count: existing.length
      });
      process.emitWarning(w);
    }
  }
  return target;
}

/**
 * Adds a listener to the event emitter.
 * @param {string | symbol} type
 * @param {Function} listener
 * @returns {EventEmitter}
 */
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;

/**
 * Adds the `listener` function to the beginning of
 * the listeners array.
 * @param {string | symbol} type
 * @param {Function} listener
 * @returns {EventEmitter}
 */
EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};
function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0) return this.listener.call(this.target);
    return ReflectApply(this.listener, this.target, arguments);
  }
}
function _onceWrap(target, type, listener) {
  var state = {
    fired: false,
    wrapFn: undefined,
    target,
    type,
    listener
  };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

/**
 * Adds a one-time `listener` function to the event emitter.
 * @param {string | symbol} type
 * @param {Function} listener
 * @returns {EventEmitter}
 */
EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

/**
 * Adds a one-time `listener` function to the beginning of
 * the listeners array.
 * @param {string | symbol} type
 * @param {Function} listener
 * @returns {EventEmitter}
 */
EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  checkListener(listener);
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
};

/**
 * Removes the specified `listener` from the listeners array.
 * @param {string | symbol} type
 * @param {Function} listener
 * @returns {EventEmitter}
 */
EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  checkListener(listener);
  var events = this._events;
  if (events === undefined) return this;
  var list = events[type];
  if (list === undefined) return this;
  if (list === listener || list.listener === listener) {
    this._eventsCount -= 1;
    if (this[kShapeMode]) {
      events[type] = undefined;
    } else if (this._eventsCount === 0) {
      this._events = {
        __proto__: null
      };
    } else {
      delete events[type];
    }
    if (events.removeListener !== undefined) this.emit('removeListener', type, list.listener || listener);
  } else if (typeof list !== 'function') {
    list = ensureMutableListenerArray(events, type, list);
    var position = -1;
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        position = i;
        break;
      }
    }
    if (position < 0) return this;
    if (position === 0) list.shift();else {
      spliceOne(list, position);
    }
    if (list.length === 1) events[type] = list[0];
    if (events.removeListener !== undefined) this.emit('removeListener', type, listener);
  }
  return this;
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

/**
 * Removes all listeners from the event emitter. (Only
 * removes listeners for a specific event name if specified
 * as `type`).
 * @param {string | symbol} [type]
 * @returns {EventEmitter}
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var events = this._events;
  if (events === undefined) return this;

  // Not listening for removeListener, no need to emit
  if (events.removeListener === undefined) {
    if (arguments.length === 0) {
      this._events = {
        __proto__: null
      };
      this._eventsCount = 0;
    } else if (events[type] !== undefined) {
      if (--this._eventsCount === 0) this._events = {
        __proto__: null
      };else delete events[type];
    }
    this[kShapeMode] = false;
    return this;
  }

  // Emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (var key of ReflectOwnKeys(events)) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {
      __proto__: null
    };
    this._eventsCount = 0;
    this[kShapeMode] = false;
    return this;
  }
  var listeners = events[type];
  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners !== undefined) {
    // LIFO order
    for (var i = listeners.length - 1; i >= 0; i--) {
      this.removeListener(type, listeners[i]);
    }
  }
  return this;
};
function _listeners(target, type, unwrap) {
  var events = target._events;
  if (events === undefined) return [];
  var evlistener = events[type];
  if (evlistener === undefined) return [];
  if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener);
}

/**
 * Returns a copy of the array of listeners for the event name
 * specified as `type`.
 * @param {string | symbol} type
 * @returns {Function[]}
 */
EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

/**
 * Returns a copy of the array of listeners and wrappers for
 * the event name specified as `type`.
 * @param {string | symbol} type
 * @returns {Function[]}
 */
EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

/**
 * Returns the number of listeners listening to event name
 * specified as `type`.
 * @param {string | symbol} type
 * @param {Function} [listener]
 * @returns {number}
 */
EventEmitter.prototype.listenerCount = function listenerCount(type, listener) {
  var events = this._events;
  if (events !== undefined) {
    var evlistener = events[type];
    if (typeof evlistener === 'function') {
      if (listener != null) {
        return listener === evlistener || listener === evlistener.listener ? 1 : 0;
      }
      return 1;
    } else if (evlistener !== undefined) {
      if (listener != null) {
        var matching = 0;
        for (var i = 0, l = evlistener.length; i < l; i++) {
          if (evlistener[i] === listener || evlistener[i].listener === listener) {
            matching++;
          }
        }
        return matching;
      }
      return evlistener.length;
    }
  }
  return 0;
};

/**
 * Returns an array listing the events for which
 * the emitter has registered listeners.
 * @returns {(string | symbol)[]}
 */
EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};
function arrayClone(arr) {
  // At least since V8 8.3, this implementation is faster than the previous
  // which always used a simple for-loop
  switch (arr.length) {
    case 2:
      return [arr[0], arr[1]];
    case 3:
      return [arr[0], arr[1], arr[2]];
    case 4:
      return [arr[0], arr[1], arr[2], arr[3]];
    case 5:
      return [arr[0], arr[1], arr[2], arr[3], arr[4]];
    case 6:
      return [arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]];
  }
  return ArrayPrototypeSlice(arr);
}
function cloneEventListenerArray(arr) {
  var copy = arrayClone(arr);
  copy[kEmitting] = 0;
  if (arr.warned) {
    copy.warned = true;
  }
  return copy;
}
function ensureMutableListenerArray(events, type, handler) {
  if (handler[kEmitting] > 0) {
    var copy = cloneEventListenerArray(handler);
    events[type] = copy;
    return copy;
  }
  return handler;
}
function unwrapListeners(arr) {
  var ret = arrayClone(arr);
  for (var i = 0; i < ret.length; ++i) {
    var orig = ret[i].listener;
    if (typeof orig === 'function') ret[i] = orig;
  }
  return ret;
}

/**
 * Returns a copy of the array of listeners for the event name
 * specified as `type`.
 * @param {EventEmitter | EventTarget} emitterOrTarget
 * @param {string | symbol} type
 * @returns {Function[]}
 */
function getEventListeners(emitterOrTarget, type) {
  // First check if EventEmitter
  if (typeof emitterOrTarget.listeners === 'function') {
    return emitterOrTarget.listeners(type);
  }
  // Require event target lazily to avoid always loading it
  var {
    isEventTarget,
    kEvents
  } = require('internal/event_target');
  if (isEventTarget(emitterOrTarget)) {
    var root = emitterOrTarget[kEvents].get(type);
    var listeners = [];
    var handler = root?.next;
    while (handler?.listener !== undefined) {
      var listener = handler.listener?.deref ? handler.listener.deref() : handler.listener;
      listeners.push(listener);
      handler = handler.next;
    }
    return listeners;
  }
  throw new ERR_INVALID_ARG_TYPE('emitter', ['EventEmitter', 'EventTarget'], emitterOrTarget);
}

/**
 * Returns the max listeners set.
 * @param {EventEmitter | EventTarget} emitterOrTarget
 * @returns {number}
 */
function getMaxListeners(emitterOrTarget) {
  if (typeof emitterOrTarget?.getMaxListeners === 'function') {
    return _getMaxListeners(emitterOrTarget);
  } else if (typeof emitterOrTarget?.[kMaxEventTargetListeners] === 'number') {
    return emitterOrTarget[kMaxEventTargetListeners];
  }
  throw new ERR_INVALID_ARG_TYPE('emitter', ['EventEmitter', 'EventTarget'], emitterOrTarget);
}

/**
 * Returns the number of registered listeners for `type`.
 * @param {EventEmitter | EventTarget} emitterOrTarget
 * @param {string | symbol} type
 * @returns {number}
 */
function listenerCount(emitterOrTarget, type) {
  if (typeof emitterOrTarget.listenerCount === 'function') {
    return emitterOrTarget.listenerCount(type);
  }
  var {
    isEventTarget,
    kEvents
  } = require('internal/event_target');
  if (isEventTarget(emitterOrTarget)) {
    return emitterOrTarget[kEvents].get(type)?.size ?? 0;
  }
  throw new ERR_INVALID_ARG_TYPE('emitter', ['EventEmitter', 'EventTarget'], emitterOrTarget);
}
function createIterResult(value, done) {
  return {
    done,
    value
  };
}
function eventTargetAgnosticRemoveListener(emitter, name, listener, flags) {
  if (typeof emitter.removeListener === 'function') {
    emitter.removeListener(name, listener);
  } else if (typeof emitter.removeEventListener === 'function') {
    emitter.removeEventListener(name, listener, flags);
  } else {
    throw new ERR_INVALID_ARG_TYPE('emitter', 'EventEmitter', emitter);
  }
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags?.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    emitter.addEventListener(name, listener, flags);
  } else {
    throw new ERR_INVALID_ARG_TYPE('emitter', 'EventEmitter', emitter);
  }
}

/**
 * Returns an `AsyncIterator` that iterates `event` events.
 * @param {EventEmitter} emitter
 * @param {string | symbol} event
 * @param {{
 *    signal: AbortSignal;
 *    close?: string[];
 *    highWaterMark?: number,
 *    lowWaterMark?: number
 *   }} [options]
 * @returns {AsyncIterator}
 */
function on(emitter, event) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
  // Parameters validation
  validateObject(options, 'options');
  var signal = options.signal;
  validateAbortSignal(signal, 'options.signal');
  if (signal?.aborted) throw new AbortError(undefined, {
    cause: signal.reason
  });
  // Support both highWaterMark and highWatermark for backward compatibility
  var highWatermark = options.highWaterMark ?? options.highWatermark ?? NumberMAX_SAFE_INTEGER;
  validateInteger(highWatermark, 'options.highWaterMark', 1);
  // Support both lowWaterMark and lowWatermark for backward compatibility
  var lowWatermark = options.lowWaterMark ?? options.lowWatermark ?? 1;
  validateInteger(lowWatermark, 'options.lowWaterMark', 1);

  // Preparing controlling queues and variables
  FixedQueue ??= require('internal/fixed_queue');
  var unconsumedEvents = new FixedQueue();
  var unconsumedPromises = new FixedQueue();
  var paused = false;
  var error = null;
  var finished = false;
  var size = 0;
  var iterator = ObjectSetPrototypeOf({
    next() {
      // First, we consume all unread events
      if (size) {
        var value = unconsumedEvents.shift();
        size--;
        if (paused && size < lowWatermark) {
          emitter.resume(); // Can not be finished yet
          paused = false;
        }
        return PromiseResolve(createIterResult(value, false));
      }

      // Then we error, if an error happened
      // This happens one time if at all, because after 'error'
      // we stop listening
      if (error) {
        var p = PromiseReject(error);
        // Only the first element errors
        error = null;
        return p;
      }

      // If the iterator is finished, resolve to done
      if (finished) return closeHandler();

      // Wait until an event happens
      return new Promise(function (resolve, reject) {
        unconsumedPromises.push({
          resolve,
          reject
        });
      });
    },
    return() {
      return closeHandler();
    },
    throw(err) {
      if (!err || !(err instanceof Error)) {
        throw new ERR_INVALID_ARG_TYPE('EventEmitter.AsyncIterator', 'Error', err);
      }
      errorHandler(err);
    },
    [SymbolAsyncIterator]() {
      return this;
    },
    [kWatermarkData]: {
      /**
       * The current queue size
       * @returns {number}
       */
      get size() {
        return size;
      },
      /**
       * The low watermark. The emitter is resumed every time size is lower than it
       * @returns {number}
       */
      get low() {
        return lowWatermark;
      },
      /**
       * The high watermark. The emitter is paused every time size is higher than it
       * @returns {number}
       */
      get high() {
        return highWatermark;
      },
      /**
       * It checks whether the emitter is paused by the watermark controller or not
       * @returns {boolean}
       */
      get isPaused() {
        return paused;
      }
    }
  }, AsyncIteratorPrototype);

  // Adding event handlers
  var {
    addEventListener,
    removeAll
  } = listenersController();
  kFirstEventParam ??= require('internal/events/symbols').kFirstEventParam;
  addEventListener(emitter, event, options[kFirstEventParam] ? eventHandler : function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    return eventHandler(args);
  });
  if (event !== 'error' && typeof emitter.on === 'function') {
    addEventListener(emitter, 'error', errorHandler);
  }
  var closeEvents = options?.close;
  if (closeEvents?.length) {
    for (var i = 0; i < closeEvents.length; i++) {
      addEventListener(emitter, closeEvents[i], closeHandler);
    }
  }
  var abortListenerDisposable = signal ? addAbortListener(signal, abortListener) : null;
  return iterator;
  function abortListener() {
    errorHandler(new AbortError(undefined, {
      cause: signal?.reason
    }));
  }
  function eventHandler(value) {
    if (unconsumedPromises.isEmpty()) {
      size++;
      if (!paused && size > highWatermark) {
        paused = true;
        emitter.pause();
      }
      unconsumedEvents.push(value);
    } else unconsumedPromises.shift().resolve(createIterResult(value, false));
  }
  function errorHandler(err) {
    if (unconsumedPromises.isEmpty()) error = err;else unconsumedPromises.shift().reject(err);
    closeHandler();
  }
  function closeHandler() {
    abortListenerDisposable?.[SymbolDispose]();
    removeAll();
    finished = true;
    paused = false;
    var doneResult = createIterResult(undefined, true);
    while (!unconsumedPromises.isEmpty()) {
      unconsumedPromises.shift().resolve(doneResult);
    }
    return PromiseResolve(doneResult);
  }
}
function listenersController() {
  var listeners = [];
  return {
    addEventListener(emitter, event, handler, flags) {
      eventTargetAgnosticAddListener(emitter, event, handler, flags);
      ArrayPrototypePush(listeners, [emitter, event, handler, flags]);
    },
    removeAll() {
      while (listeners.length > 0) {
        ReflectApply(eventTargetAgnosticRemoveListener, undefined, ArrayPrototypePop(listeners));
      }
    }
  };
}

