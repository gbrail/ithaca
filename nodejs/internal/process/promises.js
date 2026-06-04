'use strict';

function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Error,
  ObjectPrototypeHasOwnProperty,
  SafeMap,
  SafeWeakMap
} = primordials;
var FixedQueue = require('internal/fixed_queue');
var {
  tickInfo,
  promiseRejectEvents: {
    kPromiseRejectWithNoHandler,
    kPromiseHandlerAddedAfterReject
  },
  setPromiseRejectCallback
} = internalBinding('task_queue');
var {
  noSideEffectsToString,
  triggerUncaughtException,
  exitCodes: {
    kGenericUserError
  }
} = internalBinding('errors');
var {
  pushAsyncContext,
  popAsyncContext,
  symbols: {
    async_id_symbol: kAsyncIdSymbol,
    trigger_async_id_symbol: kTriggerAsyncIdSymbol
  }
} = require('internal/async_hooks');
var {
  isErrorStackTraceLimitWritable
} = require('internal/errors');
var AsyncContextFrame = require('internal/async_context_frame');

// *Must* match Environment::TickInfo::Fields in src/env.h.
var kHasRejectionToWarn = 1;

/**
 * Errors & Warnings
 */
var UnhandledPromiseRejection = /*#__PURE__*/function (_Error) {
  /**
   * @param {Error} reason
   */
  function UnhandledPromiseRejection(reason) {
    var _this;
    _classCallCheck(this, UnhandledPromiseRejection);
    _this = _callSuper(this, UnhandledPromiseRejection, ['This error originated either by throwing inside of an ' + 'async function without a catch block, or by rejecting a promise which ' + 'was not handled with .catch(). The promise rejected with the reason "' + noSideEffectsToString(reason) + '".']);
    _defineProperty(_this, "code", 'ERR_UNHANDLED_REJECTION');
    _defineProperty(_this, "name", 'UnhandledPromiseRejection');
    return _this;
  }
  _inherits(UnhandledPromiseRejection, _Error);
  return _createClass(UnhandledPromiseRejection);
}(Error);
var UnhandledPromiseRejectionWarning = /*#__PURE__*/function (_Error2) {
  /**
   * @param {number} uid
   */
  function UnhandledPromiseRejectionWarning(uid) {
    var _this2;
    _classCallCheck(this, UnhandledPromiseRejectionWarning);
    var message = 'Unhandled promise rejection. This error originated either by ' + 'throwing inside of an async function without a catch block, ' + 'or by rejecting a promise which was not handled with .catch(). ' + 'To terminate the node process on unhandled promise ' + 'rejection, use the CLI flag `--unhandled-rejections=strict` (see ' + 'https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). ' + `(rejection id: ${uid})`;

    // UnhandledPromiseRejectionWarning will get the stack trace from the
    // reason, so we can disable the stack trace limit temporarily for better
    // performance.
    if (isErrorStackTraceLimitWritable()) {
      var stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 0;
      _this2 = _callSuper(this, UnhandledPromiseRejectionWarning, [message]);
      _defineProperty(_assertThisInitialized(_this2), "name", 'UnhandledPromiseRejectionWarning');
      Error.stackTraceLimit = stackTraceLimit;
    } else {
      _this2 = _callSuper(this, UnhandledPromiseRejectionWarning, [message]);
      _defineProperty(_assertThisInitialized(_this2), "name", 'UnhandledPromiseRejectionWarning');
    }
    return _assertThisInitialized(_this2);
  }
  _inherits(UnhandledPromiseRejectionWarning, _Error2);
  return _createClass(UnhandledPromiseRejectionWarning);
}(Error);
var PromiseRejectionHandledWarning = /*#__PURE__*/function (_Error3) {
  /**
   * @param {number} uid
   */
  function PromiseRejectionHandledWarning(uid) {
    var _this3;
    _classCallCheck(this, PromiseRejectionHandledWarning);
    _this3 = _callSuper(this, PromiseRejectionHandledWarning, [`Promise rejection was handled asynchronously (rejection id: ${uid})`]);
    _defineProperty(_this3, "name", 'PromiseRejectionHandledWarning');
    _this3.id = uid;
    return _this3;
  }
  _inherits(PromiseRejectionHandledWarning, _Error3);
  return _createClass(PromiseRejectionHandledWarning);
}(Error);
/**
 * @typedef PromiseInfo
 * @property {*} reason the reason for the rejection
 * @property {number} uid the unique id of the promise
 * @property {boolean} warned whether the rejection has been warned
 * @property {object} [domain] the domain the promise was created in
 */
/**
 * @type {WeakMap<Promise, PromiseInfo>}
 */
var maybeUnhandledPromises = new SafeWeakMap();

/**
 * Using a Mp causes the promise to be referenced at least for one tick.
 * @type {Map<Promise, PromiseInfo>}
 */
var pendingUnhandledRejections = new SafeMap();

/**
 * @type {import('internal/fixed_queue')<{promise: Promise, warning: Error}>}
 */
var asyncHandledRejections = new FixedQueue();

/**
 * @type {number}
 */
var lastPromiseId = 0;

/**
 * @param {boolean} value
 */
function setHasRejectionToWarn(value) {
  tickInfo[kHasRejectionToWarn] = value ? 1 : 0;
}

/**
 * @returns {boolean}
 */
function hasRejectionToWarn() {
  return tickInfo[kHasRejectionToWarn] === 1;
}

/**
 * @param {string|Error} obj
 * @returns {obj is Error}
 */
function isErrorLike(obj) {
  return typeof obj === 'object' && obj !== null && ObjectPrototypeHasOwnProperty(obj, 'stack');
}

/**
 * @param {0|1|2|3} type
 * @param {Promise} promise
 * @param {Error} reason
 */
function promiseRejectHandler(type, promise, reason) {
  if (unhandledRejectionsMode === undefined) {
    unhandledRejectionsMode = getUnhandledRejectionsMode();
  }
  // kPromiseRejectAfterResolved and kPromiseResolveAfterResolved are
  // filtered out in C++ (src/node_task_queue.cc) and never reach JS.
  switch (type) {
    case kPromiseRejectWithNoHandler:
      // 0
      unhandledRejection(promise, reason);
      break;
    case kPromiseHandlerAddedAfterReject:
      // 1
      handledRejection(promise);
      break;
  }
}

/**
 * @param {Promise} promise
 * @param {PromiseInfo} promiseInfo
 * @returns {boolean}
 */
var emitUnhandledRejection = (promise, promiseInfo) => {
  return promiseInfo.domain ? promiseInfo.domain.emit('error', promiseInfo.reason) : process.emit('unhandledRejection', promiseInfo.reason, promise);
};

/**
 * @param {Promise} promise
 * @param {Error} reason
 */
function unhandledRejection(promise, reason) {
  pendingUnhandledRejections.set(promise, {
    reason,
    uid: ++lastPromiseId,
    warned: false,
    domain: process.domain,
    contextFrame: AsyncContextFrame.current()
  });
  setHasRejectionToWarn(true);
}

/**
 * @param {Promise} promise
 */
function handledRejection(promise) {
  if (pendingUnhandledRejections.has(promise)) {
    pendingUnhandledRejections.delete(promise);
    return;
  }
  var promiseInfo = maybeUnhandledPromises.get(promise);
  if (promiseInfo !== undefined) {
    maybeUnhandledPromises.delete(promise);
    if (promiseInfo.warned) {
      // Generate the warning object early to get a good stack trace.
      var warning = new PromiseRejectionHandledWarning(promiseInfo.uid);
      asyncHandledRejections.push({
        promise,
        warning
      });
      setHasRejectionToWarn(true);
    }
  }
}
var unhandledRejectionErrName = UnhandledPromiseRejectionWarning.name;

/**
 * @param {PromiseInfo} promiseInfo
 */
function emitUnhandledRejectionWarning(promiseInfo) {
  var warning = new UnhandledPromiseRejectionWarning(promiseInfo.uid);
  var reason = promiseInfo.reason;
  try {
    if (isErrorLike(reason)) {
      warning.stack = reason.stack;
      process.emitWarning(reason.stack, unhandledRejectionErrName);
    } else {
      process.emitWarning(noSideEffectsToString(reason), unhandledRejectionErrName);
    }
  } catch {
    try {
      process.emitWarning(noSideEffectsToString(reason), unhandledRejectionErrName);
    } catch {
      // Ignore.
    }
  }
  process.emitWarning(warning);
}

/**
 * @callback UnhandledRejectionsModeHandler
 * @param {Promise} promise
 * @param {PromiseInfo} promiseInfo
 * @param {number} [promiseAsyncId]
 * @returns {boolean}
 */

/**
 * The mode of unhandled rejections.
 * @type {UnhandledRejectionsModeHandler}
 */
var unhandledRejectionsMode;

/**
 * --unhandled-rejections=strict:
 * Emit 'uncaughtException'. If it's not handled, print the error to stderr
 * and exit the process.
 * Otherwise, emit 'unhandledRejection'. If 'unhandledRejection' is not
 * handled, emit 'UnhandledPromiseRejectionWarning'.
 * @type {UnhandledRejectionsModeHandler}
 */
function strictUnhandledRejectionsMode(promise, promiseInfo, promiseAsyncId) {
  var reason = promiseInfo.reason;
  var err = isErrorLike(reason) ? reason : new UnhandledPromiseRejection(reason);
  // This destroys the async stack, don't clear it after
  triggerUncaughtException(err, true /* fromPromise */);
  if (promiseAsyncId !== undefined) {
    pushAsyncContext(promise[kAsyncIdSymbol], promise[kTriggerAsyncIdSymbol], promise);
  }
  var handled = emitUnhandledRejection(promise, promiseInfo);
  if (!handled) emitUnhandledRejectionWarning(promiseInfo);
  return true;
}

/**
 * --unhandled-rejections=none:
 * Emit 'unhandledRejection', but do not emit any warning.
 * @type {UnhandledRejectionsModeHandler}
 */
function ignoreUnhandledRejectionsMode(promise, promiseInfo) {
  emitUnhandledRejection(promise, promiseInfo);
  return true;
}

/**
 * --unhandled-rejections=warn:
 * Emit 'unhandledRejection', then emit 'UnhandledPromiseRejectionWarning'.
 * @type {UnhandledRejectionsModeHandler}
 */
function alwaysWarnUnhandledRejectionsMode(promise, promiseInfo) {
  emitUnhandledRejection(promise, promiseInfo);
  emitUnhandledRejectionWarning(promiseInfo);
  return true;
}

/**
 * --unhandled-rejections=throw:
 * Emit 'unhandledRejection', if it's unhandled, emit
 * 'uncaughtException'. If it's not handled, print the error to stderr
 * and exit the process.
 * @type {UnhandledRejectionsModeHandler}
 */
function throwUnhandledRejectionsMode(promise, promiseInfo) {
  var reason = promiseInfo.reason;
  var handled = emitUnhandledRejection(promise, promiseInfo);
  if (!handled) {
    var err = isErrorLike(reason) ? reason : new UnhandledPromiseRejection(reason);
    // This destroys the async stack, don't clear it after
    triggerUncaughtException(err, true /* fromPromise */);
    return false;
  }
  return true;
}

/**
 * --unhandled-rejections=warn-with-error-code:
 * Emit 'unhandledRejection', if it's unhandled, emit
 * 'UnhandledPromiseRejectionWarning', then set process exit code to 1.
 * @type {UnhandledRejectionsModeHandler}
 */
function warnWithErrorCodeUnhandledRejectionsMode(promise, promiseInfo) {
  var handled = emitUnhandledRejection(promise, promiseInfo);
  if (!handled) {
    emitUnhandledRejectionWarning(promiseInfo);
    process.exitCode = kGenericUserError;
  }
  return true;
}

/**
 * @returns {UnhandledRejectionsModeHandler}
 */
function getUnhandledRejectionsMode() {
  var {
    getOptionValue
  } = require('internal/options');
  switch (getOptionValue('--unhandled-rejections')) {
    case 'none':
      return ignoreUnhandledRejectionsMode;
    case 'warn':
      return alwaysWarnUnhandledRejectionsMode;
    case 'strict':
      return strictUnhandledRejectionsMode;
    case 'throw':
      return throwUnhandledRejectionsMode;
    case 'warn-with-error-code':
      return warnWithErrorCodeUnhandledRejectionsMode;
    default:
      return throwUnhandledRejectionsMode;
  }
}

// If this method returns true, we've executed user code or triggered
// a warning to be emitted which requires the microtask and next tick
// queues to be drained again.
function processPromiseRejections() {
  var maybeScheduledTicksOrMicrotasks = !asyncHandledRejections.isEmpty();
  while (!asyncHandledRejections.isEmpty()) {
    var {
      promise,
      warning
    } = asyncHandledRejections.shift();
    if (!process.emit('rejectionHandled', promise)) {
      process.emitWarning(warning);
    }
  }
  var needPop = true;
  var promiseAsyncId;
  var pending = pendingUnhandledRejections;
  pendingUnhandledRejections = new SafeMap();
  for (var {
    0: _promise,
    1: promiseInfo
  } of pending.entries()) {
    maybeUnhandledPromises.set(_promise, promiseInfo);
    promiseInfo.warned = true;

    // We need to check if async_hooks are enabled
    // don't use enabledHooksExist as a Promise could
    // come from a vm.* context and not have an async id
    promiseAsyncId = _promise[kAsyncIdSymbol];
    if (promiseAsyncId !== undefined) {
      pushAsyncContext(promiseAsyncId, _promise[kTriggerAsyncIdSymbol], _promise);
    }
    var {
      contextFrame
    } = promiseInfo;
    var priorContextFrame = AsyncContextFrame.exchange(contextFrame);
    try {
      needPop = unhandledRejectionsMode(_promise, promiseInfo, promiseAsyncId);
    } finally {
      AsyncContextFrame.set(priorContextFrame);
      needPop && promiseAsyncId !== undefined && popAsyncContext(promiseAsyncId);
    }
    maybeScheduledTicksOrMicrotasks = true;
  }
  return maybeScheduledTicksOrMicrotasks || pendingUnhandledRejections.size !== 0;
}
function listenForRejections() {
  setPromiseRejectCallback(promiseRejectHandler);
}
module.exports = {
  hasRejectionToWarn,
  setHasRejectionToWarn,
  listenForRejections,
  processPromiseRejections
};

