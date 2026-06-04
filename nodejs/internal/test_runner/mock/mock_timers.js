'use strict';

var _excluded = ["prototype"];
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
}
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
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
var _promisifyTimer = _async(function (_ref) {
  var {
    timerFn,
    clearFn,
    ms,
    result,
    options
  } = _ref;
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  var abortListener;
  if (options?.signal) {
    validateAbortSignal(options.signal, 'options.signal');
    if (options.signal.aborted) {
      throw abortIt(options.signal);
    }
    abortListener = addAbortListener(options.signal, () => {
      reject(abortIt(options.signal));
    });
  }
  var timer = timerFn(resolve, ms);
  return _finallyRethrows(function () {
    return _await(promise, function () {
      return result;
    });
  }, function (_wasThrown, _result) {
    abortListener?.[SymbolDispose]();
    clearFn(timer);
    return _rethrow(_wasThrown, _result);
  });
});
var _setIntervalPromisified = function (interval, result, options) {
  return new _AsyncGenerator(function (_generator) {
    var _this = this;
    var emitter = new EventEmitter();
    var abortListener;
    if (options?.signal) {
      validateAbortSignal(options.signal, 'options.signal');
      if (options.signal.aborted) {
        throw abortIt(options.signal);
      }
      abortListener = addAbortListener(options.signal, () => {
        emitter.emit('error', abortIt(options.signal));
      });
    }
    var eventIt = EventEmitter.on(emitter, 'data');
    var timer = _assertClassBrand(_MockTimers_brand, _this, _createTimer).call(_this, true, () => emitter.emit('data'), interval, options);
    return _continueIgnored(_finallyRethrows(function () {
      // eslint-disable-next-line no-unused-vars
      return _continueIgnored(_forAwaitOf(eventIt, function (event) {
        return _generator._yield(result).then(_empty);
      }));
    }, function (_wasThrown2, _result2) {
      abortListener?.[SymbolDispose]();
      _classPrivateFieldGet(_clearInterval, _this).call(_this, timer);
      return _rethrow(_wasThrown2, _result2);
    }));
  });
};
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  DatePrototypeGetTime,
  DatePrototypeToString,
  FunctionPrototypeBind,
  FunctionPrototypeToString,
  NumberIsNaN,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetOwnPropertyDescriptors,
  PromiseWithResolvers,
  ReflectApply,
  Symbol: _Symbol,
  SymbolDispose,
  globalThis
} = primordials;
var {
  validateAbortSignal,
  validateNumber,
  validateStringArray,
  validateUint32
} = require('internal/validators');
var {
  AbortError,
  codes: {
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE
  }
} = require('internal/errors');
var {
  addAbortListener
} = require('internal/events/abort_listener');
var {
  AbortController,
  AbortSignal
} = require('internal/abort_controller');
var {
  TIMEOUT_MAX
} = require('internal/timers');
var PriorityQueue = require('internal/priority_queue');
var nodeTimers = require('timers');
var nodeTimersPromises = require('timers/promises');
var EventEmitter = require('events');

// Internal reference to the MockTimers class inside MockDate
var kMock;
// Initial epoch to which #now should be set to
var kInitialEpoch = 0;
function compareTimersLists(a, b) {
  return a.runAt - b.runAt || a.id - b.id;
}
function setPosition(node, pos) {
  node.priorityQueuePosition = pos;
}
function abortIt(signal) {
  return new AbortError(undefined, {
    __proto__: null,
    cause: signal.reason
  });
}

/**
 * @typedef {('setTimeout'|'setInterval'|'setImmediate'|'Date'|'scheduler.wait'|'AbortSignal.timeout')[]} SupportedApis
 * Supported timers that can be enabled via MockTimers.enable({ apis: [...] })
 */
var SUPPORTED_APIS = ['setTimeout', 'setInterval', 'setImmediate', 'Date', 'scheduler.wait', 'AbortSignal.timeout'];
var TIMERS_DEFAULT_INTERVAL = {
  __proto__: null,
  setImmediate: -1
};
var _clear = /*#__PURE__*/new WeakMap();
var Timeout = /*#__PURE__*/function () {
  function Timeout(opts) {
    _classCallCheck(this, Timeout);
    _classPrivateFieldInitSpec(this, _clear, void 0);
    this.id = opts.id;
    this.callback = opts.callback;
    this.runAt = opts.runAt;
    this.interval = opts.interval;
    this.args = opts.args;
    _classPrivateFieldSet(_clear, this, opts.clear);
  }
  return _createClass(Timeout, [{
    key: "hasRef",
    value: function hasRef() {
      return true;
    }
  }, {
    key: "ref",
    value: function ref() {
      return this;
    }
  }, {
    key: "unref",
    value: function unref() {
      return this;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      return this;
    }
  }, {
    key: "close",
    value: function close() {
      _classPrivateFieldGet(_clear, this).call(this, this);
      return this;
    }
  }, {
    key: SymbolDispose,
    value: function () {
      _classPrivateFieldGet(_clear, this).call(this, this);
    }
  }]);
}();
var _realSetTimeout = /*#__PURE__*/new WeakMap();
var _realClearTimeout = /*#__PURE__*/new WeakMap();
var _realSetInterval = /*#__PURE__*/new WeakMap();
var _realClearInterval = /*#__PURE__*/new WeakMap();
var _realSetImmediate = /*#__PURE__*/new WeakMap();
var _realClearImmediate = /*#__PURE__*/new WeakMap();
var _realPromisifiedSetTimeout = /*#__PURE__*/new WeakMap();
var _realPromisifiedSetInterval = /*#__PURE__*/new WeakMap();
var _realTimersPromisifiedSchedulerWait = /*#__PURE__*/new WeakMap();
var _realTimersSetTimeout = /*#__PURE__*/new WeakMap();
var _realTimersClearTimeout = /*#__PURE__*/new WeakMap();
var _realTimersSetInterval = /*#__PURE__*/new WeakMap();
var _realTimersClearInterval = /*#__PURE__*/new WeakMap();
var _realTimersSetImmediate = /*#__PURE__*/new WeakMap();
var _realTimersClearImmediate = /*#__PURE__*/new WeakMap();
var _realPromisifiedSetImmediate = /*#__PURE__*/new WeakMap();
var _nativeDateDescriptor = /*#__PURE__*/new WeakMap();
var _realAbortSignalTimeout = /*#__PURE__*/new WeakMap();
var _timersInContext = /*#__PURE__*/new WeakMap();
var _isEnabled = /*#__PURE__*/new WeakMap();
var _currentTimer = /*#__PURE__*/new WeakMap();
var _now = /*#__PURE__*/new WeakMap();
var _executionQueue = /*#__PURE__*/new WeakMap();
var _setTimeout = /*#__PURE__*/new WeakMap();
var _clearTimeout = /*#__PURE__*/new WeakMap();
var _setInterval = /*#__PURE__*/new WeakMap();
var _clearInterval = /*#__PURE__*/new WeakMap();
var _clearImmediate = /*#__PURE__*/new WeakMap();
var _MockTimers_brand = /*#__PURE__*/new WeakSet();
var MockTimers = /*#__PURE__*/function () {
  function MockTimers() {
    _classCallCheck(this, MockTimers);
    _classPrivateMethodInitSpec(this, _MockTimers_brand);
    _classPrivateFieldInitSpec(this, _realSetTimeout, void 0);
    _classPrivateFieldInitSpec(this, _realClearTimeout, void 0);
    _classPrivateFieldInitSpec(this, _realSetInterval, void 0);
    _classPrivateFieldInitSpec(this, _realClearInterval, void 0);
    _classPrivateFieldInitSpec(this, _realSetImmediate, void 0);
    _classPrivateFieldInitSpec(this, _realClearImmediate, void 0);
    _classPrivateFieldInitSpec(this, _realPromisifiedSetTimeout, void 0);
    _classPrivateFieldInitSpec(this, _realPromisifiedSetInterval, void 0);
    _classPrivateFieldInitSpec(this, _realTimersPromisifiedSchedulerWait, void 0);
    _classPrivateFieldInitSpec(this, _realTimersSetTimeout, void 0);
    _classPrivateFieldInitSpec(this, _realTimersClearTimeout, void 0);
    _classPrivateFieldInitSpec(this, _realTimersSetInterval, void 0);
    _classPrivateFieldInitSpec(this, _realTimersClearInterval, void 0);
    _classPrivateFieldInitSpec(this, _realTimersSetImmediate, void 0);
    _classPrivateFieldInitSpec(this, _realTimersClearImmediate, void 0);
    _classPrivateFieldInitSpec(this, _realPromisifiedSetImmediate, void 0);
    _classPrivateFieldInitSpec(this, _nativeDateDescriptor, void 0);
    _classPrivateFieldInitSpec(this, _realAbortSignalTimeout, void 0);
    _classPrivateFieldInitSpec(this, _timersInContext, []);
    _classPrivateFieldInitSpec(this, _isEnabled, false);
    _classPrivateFieldInitSpec(this, _currentTimer, 1);
    _classPrivateFieldInitSpec(this, _now, kInitialEpoch);
    _classPrivateFieldInitSpec(this, _executionQueue, new PriorityQueue(compareTimersLists, setPosition));
    _classPrivateFieldInitSpec(this, _setTimeout, FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _createTimer), this, false));
    _classPrivateFieldInitSpec(this, _clearTimeout, FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _clearTimer), this));
    _classPrivateFieldInitSpec(this, _setInterval, FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _createTimer), this, true));
    _classPrivateFieldInitSpec(this, _clearInterval, FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _clearTimer), this));
    _classPrivateFieldInitSpec(this, _clearImmediate, FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _clearTimer), this));
  }
  return _createClass(MockTimers, [{
    key: "tick",
    value:
    /**
     * Advances the virtual time of MockTimers by the specified duration (in milliseconds).
     * This method simulates the passage of time and triggers any scheduled timers that are due.
     * @param {number} [time] - The amount of time (in milliseconds) to advance the virtual time.
     * @throws {ERR_INVALID_STATE} If MockTimers are not enabled.
     * @throws {ERR_INVALID_ARG_VALUE} If a negative time value is provided.
     */
    function tick() {
      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      _assertClassBrand(_MockTimers_brand, this, _assertTimersAreEnabled).call(this);
      _assertClassBrand(_MockTimers_brand, this, _assertTimeArg).call(this, time);
      _classPrivateFieldSet(_now, this, _classPrivateFieldGet(_now, this) + time);
      var timer = _classPrivateFieldGet(_executionQueue, this).peek();
      while (timer) {
        if (timer.runAt > _classPrivateFieldGet(_now, this)) break;
        ReflectApply(timer.callback, undefined, timer.args);

        // Check if the timeout was cleared by calling clearTimeout inside its own callback
        var afterCallback = _classPrivateFieldGet(_executionQueue, this).peek();
        if (afterCallback?.id === timer.id) {
          _classPrivateFieldGet(_executionQueue, this).shift();
          timer.priorityQueuePosition = undefined;
        }
        if (timer.interval !== undefined) {
          timer.runAt += timer.interval;
          _classPrivateFieldGet(_executionQueue, this).insert(timer);
        }
        timer = _classPrivateFieldGet(_executionQueue, this).peek();
      }
    }

    /**
     * @typedef {{apis: SupportedApis;now: number | Date;}} EnableOptions Options to enable the timers
     * @property {SupportedApis} apis List of timers to enable, defaults to all
     * @property {number | Date} now The epoch to which the timers should be set to, defaults to 0
     */

    /**
     * Enables the MockTimers replacing the native timers with the fake ones.
     * @param {EnableOptions} [options]
     */
  }, {
    key: "enable",
    value: function enable() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        __proto__: null,
        apis: SUPPORTED_APIS,
        now: 0
      };
      var internalOptions = _objectSpread({
        __proto__: null
      }, options);
      if (_classPrivateFieldGet(_isEnabled, this)) {
        throw new ERR_INVALID_STATE('MockTimers is already enabled!');
      }
      if (NumberIsNaN(internalOptions.now)) {
        throw new ERR_INVALID_ARG_VALUE('now', internalOptions.now, `epoch must be a positive integer received ${internalOptions.now}`);
      }
      internalOptions.now ||= 0;
      internalOptions.apis ||= SUPPORTED_APIS;

      // Check that the timers passed are supported
      validateStringArray(internalOptions.apis, 'options.apis');
      ArrayPrototypeForEach(internalOptions.apis, timer => {
        if (!ArrayPrototypeIncludes(SUPPORTED_APIS, timer)) {
          throw new ERR_INVALID_ARG_VALUE('options.apis', timer, `option ${timer} is not supported`);
        }
      });
      _classPrivateFieldSet(_timersInContext, this, internalOptions.apis);

      // Checks if the second argument is the initial time
      if (_assertClassBrand(_MockTimers_brand, this, _isValidDateWithGetTime).call(this, internalOptions.now)) {
        _classPrivateFieldSet(_now, this, DatePrototypeGetTime(internalOptions.now));
      } else if (validateNumber(internalOptions.now, 'initialTime') === undefined) {
        _assertClassBrand(_MockTimers_brand, this, _assertTimeArg).call(this, internalOptions.now);
        _classPrivateFieldSet(_now, this, internalOptions.now);
      }
      _assertClassBrand(_MockTimers_brand, this, _toggleEnableTimers).call(this, true);
    }

    /**
     * Sets the current time to the given epoch.
     * @param {number} time The epoch to set the current time to.
     */
  }, {
    key: "setTime",
    value: function setTime() {
      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kInitialEpoch;
      validateNumber(time, 'time');
      _assertClassBrand(_MockTimers_brand, this, _assertTimeArg).call(this, time);
      _assertClassBrand(_MockTimers_brand, this, _assertTimersAreEnabled).call(this);
      _classPrivateFieldSet(_now, this, time);
    }

    /**
     * An alias for `this.reset()`, allowing the disposal of the `MockTimers` instance.
     */
  }, {
    key: SymbolDispose,
    value: function () {
      this.reset();
    }

    /**
     * Resets MockTimers, disabling any enabled timers and clearing the execution queue.
     * Does nothing if MockTimers are not enabled.
     */
  }, {
    key: "reset",
    value: function reset() {
      // Ignore if not enabled
      if (!_classPrivateFieldGet(_isEnabled, this)) return;
      _assertClassBrand(_MockTimers_brand, this, _toggleEnableTimers).call(this, false);
      _classPrivateFieldSet(_timersInContext, this, []);
      _classPrivateFieldSet(_now, this, kInitialEpoch);
      var timer = _classPrivateFieldGet(_executionQueue, this).peek();
      while (timer) {
        _classPrivateFieldGet(_executionQueue, this).shift();
        timer = _classPrivateFieldGet(_executionQueue, this).peek();
      }
    }

    /**
     * Runs all scheduled timers until there are no more pending timers.
     * @throws {ERR_INVALID_STATE} If MockTimers are not enabled.
     */
  }, {
    key: "runAll",
    value: function runAll() {
      _assertClassBrand(_MockTimers_brand, this, _assertTimersAreEnabled).call(this);
      var longestTimer = _classPrivateFieldGet(_executionQueue, this).peekBottom();
      if (!longestTimer) return;
      this.tick(longestTimer.runAt - _classPrivateFieldGet(_now, this));
    }
  }]);
}();
function _restoreSetImmediate() {
  ObjectDefineProperty(globalThis, 'setImmediate', _classPrivateFieldGet(_realSetImmediate, this));
  ObjectDefineProperty(globalThis, 'clearImmediate', _classPrivateFieldGet(_realClearImmediate, this));
  ObjectDefineProperty(nodeTimers, 'setImmediate', _classPrivateFieldGet(_realTimersSetImmediate, this));
  ObjectDefineProperty(nodeTimers, 'clearImmediate', _classPrivateFieldGet(_realTimersClearImmediate, this));
  ObjectDefineProperty(nodeTimersPromises, 'setImmediate', _classPrivateFieldGet(_realPromisifiedSetImmediate, this));
}
function _restoreOriginalSetInterval() {
  ObjectDefineProperty(globalThis, 'setInterval', _classPrivateFieldGet(_realSetInterval, this));
  ObjectDefineProperty(globalThis, 'clearInterval', _classPrivateFieldGet(_realClearInterval, this));
  ObjectDefineProperty(nodeTimers, 'setInterval', _classPrivateFieldGet(_realTimersSetInterval, this));
  ObjectDefineProperty(nodeTimers, 'clearInterval', _classPrivateFieldGet(_realTimersClearInterval, this));
  ObjectDefineProperty(nodeTimersPromises, 'setInterval', _classPrivateFieldGet(_realPromisifiedSetInterval, this));
}
function _restoreOriginalSchedulerWait() {
  nodeTimersPromises.scheduler.wait = FunctionPrototypeBind(_classPrivateFieldGet(_realTimersPromisifiedSchedulerWait, this), this);
}
function _restoreOriginalSetTimeout() {
  ObjectDefineProperty(globalThis, 'setTimeout', _classPrivateFieldGet(_realSetTimeout, this));
  ObjectDefineProperty(globalThis, 'clearTimeout', _classPrivateFieldGet(_realClearTimeout, this));
  ObjectDefineProperty(nodeTimers, 'setTimeout', _classPrivateFieldGet(_realTimersSetTimeout, this));
  ObjectDefineProperty(nodeTimers, 'clearTimeout', _classPrivateFieldGet(_realTimersClearTimeout, this));
  ObjectDefineProperty(nodeTimersPromises, 'setTimeout', _classPrivateFieldGet(_realPromisifiedSetTimeout, this));
}
function _storeOriginalSetImmediate() {
  _classPrivateFieldSet(_realSetImmediate, this, ObjectGetOwnPropertyDescriptor(globalThis, 'setImmediate'));
  _classPrivateFieldSet(_realClearImmediate, this, ObjectGetOwnPropertyDescriptor(globalThis, 'clearImmediate'));
  _classPrivateFieldSet(_realTimersSetImmediate, this, ObjectGetOwnPropertyDescriptor(nodeTimers, 'setImmediate'));
  _classPrivateFieldSet(_realTimersClearImmediate, this, ObjectGetOwnPropertyDescriptor(nodeTimers, 'clearImmediate'));
  _classPrivateFieldSet(_realPromisifiedSetImmediate, this, ObjectGetOwnPropertyDescriptor(nodeTimersPromises, 'setImmediate'));
}
function _storeOriginalSetInterval() {
  _classPrivateFieldSet(_realSetInterval, this, ObjectGetOwnPropertyDescriptor(globalThis, 'setInterval'));
  _classPrivateFieldSet(_realClearInterval, this, ObjectGetOwnPropertyDescriptor(globalThis, 'clearInterval'));
  _classPrivateFieldSet(_realTimersSetInterval, this, ObjectGetOwnPropertyDescriptor(nodeTimers, 'setInterval'));
  _classPrivateFieldSet(_realTimersClearInterval, this, ObjectGetOwnPropertyDescriptor(nodeTimers, 'clearInterval'));
  _classPrivateFieldSet(_realPromisifiedSetInterval, this, ObjectGetOwnPropertyDescriptor(nodeTimersPromises, 'setInterval'));
}
function _storeOriginalSchedulerWait() {
  _classPrivateFieldSet(_realTimersPromisifiedSchedulerWait, this, FunctionPrototypeBind(nodeTimersPromises.scheduler.wait, this));
}
function _storeOriginalSetTimeout() {
  _classPrivateFieldSet(_realSetTimeout, this, ObjectGetOwnPropertyDescriptor(globalThis, 'setTimeout'));
  _classPrivateFieldSet(_realClearTimeout, this, ObjectGetOwnPropertyDescriptor(globalThis, 'clearTimeout'));
  _classPrivateFieldSet(_realTimersSetTimeout, this, ObjectGetOwnPropertyDescriptor(nodeTimers, 'setTimeout'));
  _classPrivateFieldSet(_realTimersClearTimeout, this, ObjectGetOwnPropertyDescriptor(nodeTimers, 'clearTimeout'));
  _classPrivateFieldSet(_realPromisifiedSetTimeout, this, ObjectGetOwnPropertyDescriptor(nodeTimersPromises, 'setTimeout'));
}
function _storeOriginalAbortSignalTimeout() {
  _classPrivateFieldSet(_realAbortSignalTimeout, this, ObjectGetOwnPropertyDescriptor(AbortSignal, 'timeout'));
}
function _restoreOriginalAbortSignalTimeout() {
  ObjectDefineProperty(AbortSignal, 'timeout', _classPrivateFieldGet(_realAbortSignalTimeout, this));
}
function _createTimer(isInterval, callback, delay) {
  var _this$currentTimer, _this$currentTimer2;
  if (delay > TIMEOUT_MAX) {
    delay = 1;
  }
  var timerId = (_classPrivateFieldSet(_currentTimer, this, (_this$currentTimer = _classPrivateFieldGet(_currentTimer, this), _this$currentTimer2 = _this$currentTimer++, _this$currentTimer)), _this$currentTimer2);
  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }
  var opts = {
    __proto__: null,
    id: timerId,
    callback,
    runAt: _classPrivateFieldGet(_now, this) + delay,
    interval: isInterval ? delay : undefined,
    args,
    clear: _classPrivateFieldGet(_clearTimeout, this)
  };
  var timer = new Timeout(opts);
  _classPrivateFieldGet(_executionQueue, this).insert(timer);
  return timer;
}
function _clearTimer(timer) {
  if (timer?.priorityQueuePosition !== undefined) {
    _classPrivateFieldGet(_executionQueue, this).removeAt(timer.priorityQueuePosition);
    timer.priorityQueuePosition = undefined;
    timer.interval = undefined;
  }
}
function _createDate() {
  kMock ??= _Symbol('MockTimers');
  var NativeDateConstructor = _classPrivateFieldGet(_nativeDateDescriptor, this).value;
  if (NativeDateConstructor.isMock) {
    throw new ERR_INVALID_STATE('Date is already being mocked!');
  }
  /**
   * Function to mock the Date constructor, treats cases as per ECMA-262
   * and returns a Date object with a mocked implementation
   * @typedef {Date} MockDate
   * @returns {MockDate} a mocked Date object
   */
  function MockDate(year, month, date, hours, minutes, seconds, ms) {
    var mockTimersSource = MockDate[kMock];
    var nativeDate = _classPrivateFieldGet(_nativeDateDescriptor, mockTimersSource).value;

    // As of the fake-timers implementation for Sinon
    // ref https://github.com/sinonjs/fake-timers/blob/a4c757f80840829e45e0852ea1b17d87a998388e/src/fake-timers-src.js#L456
    // This covers the Date constructor called as a function ref.
    // ECMA-262 Edition 5.1 section 15.9.2.
    // and ECMA-262 Edition 14 Section 21.4.2.1
    // replaces 'this instanceof MockDate' with a more reliable check
    // from ECMA-262 Edition 14 Section 13.3.12.1 NewTarget
    if (!new.target) {
      return DatePrototypeToString(new nativeDate(_classPrivateFieldGet(_now, mockTimersSource)));
    }

    // Cases where Date is called as a constructor
    // This is intended as a defensive implementation to avoid
    // having unexpected returns
    switch (arguments.length) {
      case 0:
        return new nativeDate(_classPrivateFieldGet(_now, MockDate[kMock]));
      case 1:
        return new nativeDate(year);
      case 2:
        return new nativeDate(year, month);
      case 3:
        return new nativeDate(year, month, date);
      case 4:
        return new nativeDate(year, month, date, hours);
      case 5:
        return new nativeDate(year, month, date, hours, minutes);
      case 6:
        return new nativeDate(year, month, date, hours, minutes, seconds);
      default:
        return new nativeDate(year, month, date, hours, minutes, seconds, ms);
    }
  }

  // Prototype is read-only, and non assignable through Object.defineProperties
  // eslint-disable-next-line no-unused-vars -- used to get the prototype out of the object
  var _ObjectGetOwnProperty = ObjectGetOwnPropertyDescriptors(NativeDateConstructor),
    {
      prototype
    } = _ObjectGetOwnProperty,
    dateProps = _objectWithoutProperties(_ObjectGetOwnProperty, _excluded);

  // Binds all the properties of Date to the MockDate function
  ObjectDefineProperties(MockDate, dateProps);
  MockDate.now = function now() {
    return _classPrivateFieldGet(_now, MockDate[kMock]);
  };

  // This is just to print the function { native code } in the console
  // when the user prints the function and not the internal code
  MockDate.toString = function toString() {
    return FunctionPrototypeToString(_classPrivateFieldGet(_nativeDateDescriptor, MockDate[kMock]).value);
  };

  // We need to pollute the prototype of this
  ObjectDefineProperties(MockDate, {
    __proto__: null,
    [kMock]: {
      __proto__: null,
      enumerable: false,
      configurable: false,
      writable: false,
      value: this
    },
    isMock: {
      __proto__: null,
      enumerable: true,
      configurable: false,
      writable: false,
      value: true
    }
  });
  MockDate.prototype = NativeDateConstructor.prototype;
  MockDate.parse = NativeDateConstructor.parse;
  MockDate.UTC = NativeDateConstructor.UTC;
  MockDate.prototype.toUTCString = NativeDateConstructor.prototype.toUTCString;
  return MockDate;
}
function _setImmediate(callback) {
  var _assertClassBrand2;
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  return (_assertClassBrand2 = _assertClassBrand(_MockTimers_brand, this, _createTimer)).call.apply(_assertClassBrand2, [this, false, callback, TIMERS_DEFAULT_INTERVAL.setImmediate].concat(args));
}
function _setImmediatePromisified(result, options) {
  return _assertClassBrand(_MockTimers_brand, this, _promisifyTimer).call(this, {
    __proto__: null,
    timerFn: FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _setImmediate), this),
    clearFn: FunctionPrototypeBind(_classPrivateFieldGet(_clearImmediate, this), this),
    ms: TIMERS_DEFAULT_INTERVAL.setImmediate,
    result,
    options
  });
}
function _setTimeoutPromisified(ms, result, options) {
  return _assertClassBrand(_MockTimers_brand, this, _promisifyTimer).call(this, {
    __proto__: null,
    timerFn: FunctionPrototypeBind(_classPrivateFieldGet(_setTimeout, this), this),
    clearFn: FunctionPrototypeBind(_classPrivateFieldGet(_clearTimeout, this), this),
    ms,
    result,
    options
  });
}
function _assertTimersAreEnabled() {
  if (!_classPrivateFieldGet(_isEnabled, this)) {
    throw new ERR_INVALID_STATE('You should enable MockTimers first by calling the .enable function');
  }
}
function _assertTimeArg(time) {
  if (time < 0) {
    throw new ERR_INVALID_ARG_VALUE('time', 'positive integer', time);
  }
}
function _isValidDateWithGetTime(maybeDate) {
  // Validation inspired on https://github.com/inspect-js/is-date-object/blob/main/index.js#L3-L11
  try {
    DatePrototypeGetTime(maybeDate);
    return true;
  } catch {
    return false;
  }
}
function _toggleEnableTimers(activate) {
  var options = {
    __proto__: null,
    toFake: {
      '__proto__': null,
      'scheduler.wait': () => {
        _assertClassBrand(_MockTimers_brand, this, _storeOriginalSchedulerWait).call(this);
        nodeTimersPromises.scheduler.wait = (delay, options) => _assertClassBrand(_MockTimers_brand, this, _setTimeoutPromisified).call(this, delay, undefined, options);
      },
      'setTimeout': () => {
        _assertClassBrand(_MockTimers_brand, this, _storeOriginalSetTimeout).call(this);
        globalThis.setTimeout = _classPrivateFieldGet(_setTimeout, this);
        globalThis.clearTimeout = _classPrivateFieldGet(_clearTimeout, this);
        nodeTimers.setTimeout = _classPrivateFieldGet(_setTimeout, this);
        nodeTimers.clearTimeout = _classPrivateFieldGet(_clearTimeout, this);
        nodeTimersPromises.setTimeout = FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _setTimeoutPromisified), this);
      },
      'setInterval': () => {
        _assertClassBrand(_MockTimers_brand, this, _storeOriginalSetInterval).call(this);
        globalThis.setInterval = _classPrivateFieldGet(_setInterval, this);
        globalThis.clearInterval = _classPrivateFieldGet(_clearInterval, this);
        nodeTimers.setInterval = _classPrivateFieldGet(_setInterval, this);
        nodeTimers.clearInterval = _classPrivateFieldGet(_clearInterval, this);
        nodeTimersPromises.setInterval = FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _setIntervalPromisified), this);
      },
      'setImmediate': () => {
        _assertClassBrand(_MockTimers_brand, this, _storeOriginalSetImmediate).call(this);

        // setImmediate functions needs to bind MockTimers
        // otherwise it will throw an error when called
        // "Receiver must be an instance of MockTimers"
        // because #setImmediate is the only function here
        // that calls #createTimer and it's not bound to MockTimers
        globalThis.setImmediate = FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _setImmediate), this);
        globalThis.clearImmediate = _classPrivateFieldGet(_clearImmediate, this);
        nodeTimers.setImmediate = FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _setImmediate), this);
        nodeTimers.clearImmediate = _classPrivateFieldGet(_clearImmediate, this);
        nodeTimersPromises.setImmediate = FunctionPrototypeBind(_assertClassBrand(_MockTimers_brand, this, _setImmediatePromisified), this);
      },
      'Date': () => {
        _classPrivateFieldSet(_nativeDateDescriptor, this, ObjectGetOwnPropertyDescriptor(globalThis, 'Date'));
        globalThis.Date = _assertClassBrand(_MockTimers_brand, this, _createDate).call(this);
      },
      'AbortSignal.timeout': () => {
        _assertClassBrand(_MockTimers_brand, this, _storeOriginalAbortSignalTimeout).call(this);
        var mock = this;
        ObjectDefineProperty(AbortSignal, 'timeout', {
          __proto__: null,
          configurable: true,
          writable: true,
          value: function value(delay) {
            validateUint32(delay, 'delay', false);
            var controller = new AbortController();
            // Don't keep an unused binding to the timer; mock tick controls it
            _classPrivateFieldGet(_setTimeout, mock).call(mock, () => {
              controller.abort();
            }, delay);
            return controller.signal;
          }
        });
      }
    },
    toReal: {
      '__proto__': null,
      'scheduler.wait': () => {
        _assertClassBrand(_MockTimers_brand, this, _restoreOriginalSchedulerWait).call(this);
      },
      'setTimeout': () => {
        _assertClassBrand(_MockTimers_brand, this, _restoreOriginalSetTimeout).call(this);
      },
      'setInterval': () => {
        _assertClassBrand(_MockTimers_brand, this, _restoreOriginalSetInterval).call(this);
      },
      'setImmediate': () => {
        _assertClassBrand(_MockTimers_brand, this, _restoreSetImmediate).call(this);
      },
      'Date': () => {
        ObjectDefineProperty(globalThis, 'Date', _classPrivateFieldGet(_nativeDateDescriptor, this));
      },
      'AbortSignal.timeout': () => {
        _assertClassBrand(_MockTimers_brand, this, _restoreOriginalAbortSignalTimeout).call(this);
      }
    }
  };
  var target = activate ? options.toFake : options.toReal;
  ArrayPrototypeForEach(_classPrivateFieldGet(_timersInContext, this), timer => target[timer]());
  _classPrivateFieldSet(_isEnabled, this, activate);
}
module.exports = {
  MockTimers
};

