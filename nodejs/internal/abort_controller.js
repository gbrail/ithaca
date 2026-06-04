'use strict';

// Modeled very closely on the AbortController implementation
// in https://github.com/mysticatea/abort-controller (MIT license)
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
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
/**
 * @param {AbortSignal} signal
 * @param {any} resource
 * @returns {Promise<void>}
 */
var aborted = _async(function (signal, resource) {
  converters.AbortSignal(signal, {
    __proto__: null,
    context: 'signal'
  });
  validateObject(resource, 'resource', kValidateObjectAllowObjects);
  if (signal.aborted) return PromiseResolve();
  var abortPromise = PromiseWithResolvers();
  var opts = {
    __proto__: null,
    [kWeakHandler]: resource,
    once: true,
    [kResistStopPropagation]: true
  };
  signal.addEventListener('abort', abortPromise.resolve, opts);
  return abortPromise.promise;
});
var {
  ArrayPrototypePush,
  ObjectAssign,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  PromiseResolve,
  PromiseWithResolvers,
  SafeFinalizationRegistry,
  SafeSet,
  SafeWeakRef,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  defineEventHandler,
  EventTarget,
  Event,
  kTrustEvent,
  kNewListener,
  kRemoveListener,
  kResistStopPropagation,
  kWeakHandler
} = require('internal/event_target');
var {
  kMaxEventTargetListeners
} = require('events');
var {
  customInspectSymbol,
  kEmptyObject,
  kEnumerableProperty
} = require('internal/util');
var {
  inspect
} = require('internal/util/inspect');
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_THIS
  }
} = require('internal/errors');
var {
  converters,
  createInterfaceConverter,
  createSequenceConverter
} = require('internal/webidl');
var {
  validateObject,
  validateUint32,
  kValidateObjectAllowObjects
} = require('internal/validators');
var {
  DOMException
} = internalBinding('messaging');
var {
  clearTimeout,
  setTimeout
} = require('timers');
var assert = require('internal/assert');
var {
  kDeserialize,
  kTransfer,
  kTransferList,
  markTransferMode
} = require('internal/worker/js_transferable');
var _MessageChannel;
var kDontThrowSymbol = _Symbol('kDontThrowSymbol');

// Loading the MessageChannel and markTransferable have to be done lazily
// because otherwise we'll end up with a require cycle that ends up with
// an incomplete initialization of abort_controller.

function lazyMessageChannel() {
  _MessageChannel ??= require('internal/worker/io').MessageChannel;
  return new _MessageChannel();
}
var clearTimeoutRegistry = new SafeFinalizationRegistry(clearTimeout);
var dependantSignalsCleanupRegistry = new SafeFinalizationRegistry(_ref => {
  var {
    sourceSignalRef,
    dependantSignalRef,
    sourceSignalsCleanupToken
  } = _ref;
  sourceSignalsCleanupRegistry.unregister(sourceSignalsCleanupToken);
  var sourceSignal = sourceSignalRef.deref();
  if (sourceSignal === undefined) {
    return;
  }
  sourceSignal[kDependantSignals].delete(dependantSignalRef);
});
var gcPersistentSignals = new SafeSet();
var sourceSignalsCleanupRegistry = new SafeFinalizationRegistry(_ref2 => {
  var {
    sourceSignalRef,
    composedSignalRef
  } = _ref2;
  var composedSignal = composedSignalRef.deref();
  if (composedSignal !== undefined) {
    composedSignal[kSourceSignals].delete(sourceSignalRef);
    if (composedSignal[kSourceSignals].size === 0) {
      // This signal will no longer abort. There's no need to keep it in the gcPersistentSignals set.
      gcPersistentSignals.delete(composedSignal);
    }
  }
});
var kAborted = _Symbol('kAborted');
var kReason = _Symbol('kReason');
var kCloneData = _Symbol('kCloneData');
var kTimeout = _Symbol('kTimeout');
var kMakeTransferable = _Symbol('kMakeTransferable');
var kComposite = _Symbol('kComposite');
var kFollowing = _Symbol('kFollowing');
var kResultSignalWeakRef = _Symbol('kResultSignalWeakRef');
var kSourceSignals = _Symbol('kSourceSignals');
var kDependantSignals = _Symbol('kDependantSignals');
function customInspect(self, obj, depth, options) {
  if (depth < 0) return self;
  var opts = ObjectAssign({}, options, {
    depth: options.depth === null ? null : options.depth - 1
  });
  return `${self.constructor.name} ${inspect(obj, opts)}`;
}
function validateThisAbortSignal(obj) {
  if (obj?.[kAborted] === undefined) throw new ERR_INVALID_THIS('AbortSignal');
}
function refreshCompositeSignal(signal) {
  if (!signal[kComposite] || signal[kAborted] || !signal[kSourceSignals]?.size) {
    return;
  }
  for (var sourceSignalWeakRef of signal[kSourceSignals]) {
    var sourceSignal = sourceSignalWeakRef.deref();
    if (sourceSignal === undefined) {
      signal[kSourceSignals].delete(sourceSignalWeakRef);
      continue;
    }
    if (sourceSignal.aborted) {
      abortSignal(signal, sourceSignal.reason);
      return;
    }
  }
}
function followCompositeSignal(signal) {
  if (signal[kFollowing] || signal[kAborted] || !signal[kSourceSignals]?.size) {
    return;
  }
  var resultSignalWeakRef = signal[kResultSignalWeakRef] ??= new SafeWeakRef(signal);
  for (var sourceSignalWeakRef of signal[kSourceSignals]) {
    var sourceSignal = sourceSignalWeakRef.deref();
    if (sourceSignal === undefined) {
      signal[kSourceSignals].delete(sourceSignalWeakRef);
      continue;
    }
    if (sourceSignal.aborted) {
      abortSignal(signal, sourceSignal.reason);
      return;
    }
    sourceSignal[kDependantSignals] ??= new SafeSet();
    sourceSignal[kDependantSignals].add(resultSignalWeakRef);
    dependantSignalsCleanupRegistry.register(signal, {
      sourceSignalRef: sourceSignalWeakRef,
      dependantSignalRef: resultSignalWeakRef,
      sourceSignalsCleanupToken: sourceSignalWeakRef
    });
    sourceSignalsCleanupRegistry.register(sourceSignal, {
      sourceSignalRef: sourceSignalWeakRef,
      composedSignalRef: resultSignalWeakRef
    }, sourceSignalWeakRef);
  }
  signal[kFollowing] = true;
}

// Because the AbortSignal timeout cannot be canceled, we don't want the
// presence of the timer alone to keep the AbortSignal from being garbage
// collected if it otherwise no longer accessible. We also don't want the
// timer to keep the Node.js process open on it's own. Therefore, we wrap
// the AbortSignal in a WeakRef and have the setTimeout callback close
// over the WeakRef rather than directly over the AbortSignal, and we unref
// the created timer object. Separately, we add the signal to a
// FinalizerRegistry that will clear the timeout when the signal is gc'd.
function setWeakAbortSignalTimeout(weakRef, delay) {
  var timeout = setTimeout(() => {
    var signal = weakRef.deref();
    if (signal !== undefined) {
      clearTimeoutRegistry.unregister(signal);
      gcPersistentSignals.delete(signal);
      abortSignal(signal, new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
    }
  }, delay);
  timeout.unref();
  return timeout;
}
var AbortSignal = /*#__PURE__*/function (_EventTarget) {
  /**
   * @param {symbol | undefined} dontThrowSymbol
   * @param {{
   *   aborted? : boolean,
   *   reason? : any,
   *   transferable? : boolean,
   *   composite? : boolean,
   * }} [init]
   * @private
   */
  function AbortSignal() {
    var _this;
    var dontThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, AbortSignal);
    if (dontThrowSymbol !== kDontThrowSymbol) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    _this = _callSuper(this, AbortSignal);
    _this[kMaxEventTargetListeners] = 0;
    var {
      aborted = false,
      reason = undefined,
      transferable = false,
      composite = false
    } = init;
    _this[kAborted] = aborted;
    _this[kReason] = reason;
    _this[kComposite] = composite;
    if (transferable) {
      markTransferMode(_this, false, true);
    }
    return _this;
  }

  /**
   * @type {boolean}
   */
  _inherits(AbortSignal, _EventTarget);
  return _createClass(AbortSignal, [{
    key: "aborted",
    get: function () {
      validateThisAbortSignal(this);
      refreshCompositeSignal(this);
      return !!this[kAborted];
    }

    /**
     * @type {any}
     */
  }, {
    key: "reason",
    get: function () {
      validateThisAbortSignal(this);
      refreshCompositeSignal(this);
      return this[kReason];
    }
  }, {
    key: "throwIfAborted",
    value: function throwIfAborted() {
      validateThisAbortSignal(this);
      refreshCompositeSignal(this);
      if (this[kAborted]) {
        throw this[kReason];
      }
    }
  }, {
    key: customInspectSymbol,
    value: function (depth, options) {
      return customInspect(this, {
        aborted: this.aborted
      }, depth, options);
    }

    /**
     * @param {any} [reason]
     * @returns {AbortSignal}
     */
  }, {
    key: kNewListener,
    value: function (size, type, listener, once, capture, passive, weak) {
      _superPropGet(AbortSignal, kNewListener, this, 3)([size, type, listener, once, capture, passive, weak]);
      if (this[kComposite] && type === 'abort' && !this.aborted && size === 1) {
        followCompositeSignal(this);
      }
      var isTimeoutOrNonEmptyCompositeSignal = this[kTimeout] || this[kComposite] && this[kSourceSignals]?.size;
      if (isTimeoutOrNonEmptyCompositeSignal && type === 'abort' && !this.aborted && !weak && size === 1) {
        // If this is a timeout signal, or a non-empty composite signal, and we're adding a non-weak abort
        // listener, then we don't want it to be gc'd while the listener
        // is attached and the timer still hasn't fired. So, we retain a
        // strong ref that is held for as long as the listener is registered.
        gcPersistentSignals.add(this);
      }
    }
  }, {
    key: kRemoveListener,
    value: function (size, type, listener, capture) {
      _superPropGet(AbortSignal, kRemoveListener, this, 3)([size, type, listener, capture]);
      var isTimeoutOrNonEmptyCompositeSignal = this[kTimeout] || this[kComposite] && this[kSourceSignals]?.size;
      if (isTimeoutOrNonEmptyCompositeSignal && type === 'abort' && size === 0) {
        gcPersistentSignals.delete(this);
      }
    }
  }, {
    key: kTransfer,
    value: function () {
      validateThisAbortSignal(this);
      var aborted = this.aborted;
      if (aborted) {
        var reason = this.reason;
        return {
          data: {
            aborted,
            reason
          },
          deserializeInfo: 'internal/abort_controller:ClonedAbortSignal'
        };
      }
      var {
        port1,
        port2
      } = this[kCloneData];
      this[kCloneData] = undefined;
      this.addEventListener('abort', () => {
        port1.postMessage(this.reason);
        port1.close();
      }, {
        once: true
      });
      return {
        data: {
          port: port2
        },
        deserializeInfo: 'internal/abort_controller:ClonedAbortSignal'
      };
    }
  }, {
    key: kTransferList,
    value: function () {
      if (!this.aborted) {
        var {
          port1,
          port2
        } = lazyMessageChannel();
        port1.unref();
        port2.unref();
        this[kCloneData] = {
          port1,
          port2
        };
        return [port2];
      }
      return [];
    }
  }, {
    key: kDeserialize,
    value: function (_ref3) {
      var {
        aborted,
        reason,
        port
      } = _ref3;
      if (aborted) {
        this[kAborted] = aborted;
        this[kReason] = reason;
        return;
      }
      port.onmessage = _ref4 => {
        var {
          data
        } = _ref4;
        abortSignal(this, data);
        port.close();
        port.onmessage = undefined;
      };
      // The receiving port, by itself, should never keep the event loop open.
      // The unref() has to be called *after* setting the onmessage handler.
      port.unref();
    }
  }], [{
    key: "abort",
    value: function abort() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new DOMException('This operation was aborted', 'AbortError');
      return new AbortSignal(kDontThrowSymbol, {
        aborted: true,
        reason
      });
    }

    /**
     * @param {number} delay
     * @returns {AbortSignal}
     */
  }, {
    key: "timeout",
    value: function timeout(delay) {
      validateUint32(delay, 'delay', false);
      var signal = new AbortSignal(kDontThrowSymbol);
      signal[kTimeout] = true;
      clearTimeoutRegistry.register(signal, setWeakAbortSignalTimeout(new SafeWeakRef(signal), delay), signal);
      return signal;
    }

    /**
     * @param {AbortSignal[]} signals
     * @returns {AbortSignal}
     */
  }, {
    key: "any",
    value: function any(signals) {
      var signalsArray = converters['sequence<AbortSignal>'](signals, {
        __proto__: null,
        context: 'signals'
      });
      var resultSignal = new AbortSignal(kDontThrowSymbol, {
        composite: true
      });
      if (!signalsArray.length) {
        return resultSignal;
      }
      resultSignal[kSourceSignals] = new SafeSet();

      // Track if we have any timeout signals
      var hasTimeoutSignals = false;
      for (var i = 0; i < signalsArray.length; i++) {
        var signal = signalsArray[i];

        // Check if this is a timeout signal
        if (signal[kTimeout]) {
          hasTimeoutSignals = true;

          // Add the timeout signal to gcPersistentSignals to keep it alive
          // This is what the kNewListener method would do when adding abort listeners
          gcPersistentSignals.add(signal);
        }
        if (signal.aborted) {
          abortSignal(resultSignal, signal.reason);
          return resultSignal;
        }
        if (!signal[kComposite]) {
          var signalWeakRef = new SafeWeakRef(signal);
          resultSignal[kSourceSignals].add(signalWeakRef);
        } else if (!signal[kSourceSignals]) {
          continue;
        } else {
          refreshCompositeSignal(signal);
          if (signal.aborted) {
            abortSignal(resultSignal, signal.reason);
            return resultSignal;
          }
          for (var sourceSignalWeakRef of signal[kSourceSignals]) {
            var sourceSignal = sourceSignalWeakRef.deref();
            if (!sourceSignal) {
              continue;
            }
            assert(!sourceSignal[kComposite]);
            if (sourceSignal.aborted) {
              abortSignal(resultSignal, sourceSignal.reason);
              return resultSignal;
            }
            if (resultSignal[kSourceSignals].has(sourceSignalWeakRef)) {
              continue;
            }
            resultSignal[kSourceSignals].add(sourceSignalWeakRef);
          }
        }
      }
      if (hasTimeoutSignals && resultSignal[kSourceSignals].size > 0) {
        resultSignal[kTimeout] = true;
      }
      return resultSignal;
    }
  }]);
}(EventTarget);
converters.AbortSignal = createInterfaceConverter('AbortSignal', AbortSignal.prototype);
converters['sequence<AbortSignal>'] = createSequenceConverter(converters.AbortSignal);
function ClonedAbortSignal() {
  return new AbortSignal(kDontThrowSymbol, {
    transferable: true
  });
}
ClonedAbortSignal.prototype[kDeserialize] = () => {};
ObjectDefineProperties(AbortSignal.prototype, {
  aborted: kEnumerableProperty
});
ObjectDefineProperty(AbortSignal.prototype, SymbolToStringTag, {
  __proto__: null,
  writable: false,
  enumerable: false,
  configurable: true,
  value: 'AbortSignal'
});
defineEventHandler(AbortSignal.prototype, 'abort');

// https://dom.spec.whatwg.org/#dom-abortsignal-abort
function abortSignal(signal, reason) {
  // 1. If signal is aborted, then return.
  if (signal[kAborted]) return;

  // 2. Set signal's abort reason to reason if it is given;
  //    otherwise to a new "AbortError" DOMException.
  signal[kAborted] = true;
  signal[kReason] = reason;

  // 3. Let dependentSignalsToAbort be a new list.
  var dependentSignalsToAbort = ObjectSetPrototypeOf([], null);

  // 4. For each dependentSignal of signal's dependent signals:
  signal[kDependantSignals]?.forEach(s => {
    var dependentSignal = s.deref();
    // 1. If dependentSignal is not aborted, then:
    if (dependentSignal && !dependentSignal[kAborted]) {
      // 1. Set dependentSignal's abort reason to signal's abort reason.
      dependentSignal[kReason] = reason;
      dependentSignal[kAborted] = true;
      // 2. Append dependentSignal to dependentSignalsToAbort.
      ArrayPrototypePush(dependentSignalsToAbort, dependentSignal);
    }
  });

  // 5. Run the abort steps for signal
  runAbort(signal);

  // 6. For each dependentSignal of dependentSignalsToAbort,
  //    run the abort steps for dependentSignal.
  for (var i = 0; i < dependentSignalsToAbort.length; i++) {
    var dependentSignal = dependentSignalsToAbort[i];
    runAbort(dependentSignal);
  }

  // Clean up the signal from gcPersistentSignals
  gcPersistentSignals.delete(signal);

  // If this is a composite signal, also remove all of its source signals from gcPersistentSignals
  // when they get dereferenced from the signal's kSourceSignals set
  if (signal[kComposite] && signal[kSourceSignals]) {
    signal[kSourceSignals].forEach(sourceWeakRef => {
      var sourceSignal = sourceWeakRef.deref();
      if (sourceSignal) {
        gcPersistentSignals.delete(sourceSignal);
      }
    });
  }
}

// To run the abort steps for an AbortSignal signal
function runAbort(signal) {
  var event = new Event('abort', {
    [kTrustEvent]: true
  });
  signal.dispatchEvent(event);
}
var _signal = /*#__PURE__*/new WeakMap();
var AbortController = /*#__PURE__*/function () {
  function AbortController() {
    _classCallCheck(this, AbortController);
    _classPrivateFieldInitSpec(this, _signal, void 0);
  }
  return _createClass(AbortController, [{
    key: "signal",
    get:
    /**
     * @type {AbortSignal}
     */
    function () {
      _classPrivateFieldGet(_signal, this) ?? _classPrivateFieldSet(_signal, this, new AbortSignal(kDontThrowSymbol));
      return _classPrivateFieldGet(_signal, this);
    }

    /**
     * @param {any} [reason]
     */
  }, {
    key: "abort",
    value: function abort() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new DOMException('This operation was aborted', 'AbortError');
      abortSignal(_classPrivateFieldGet(_signal, this) ?? _classPrivateFieldSet(_signal, this, new AbortSignal(kDontThrowSymbol)), reason);
    }
  }, {
    key: customInspectSymbol,
    value: function (depth, options) {
      return customInspect(this, {
        signal: this.signal
      }, depth, options);
    }
  }], [{
    key: kMakeTransferable,
    value: function () {
      var controller = new AbortController();
      _classPrivateFieldSet(_signal, controller, new AbortSignal(kDontThrowSymbol, {
        transferable: true
      }));
      return controller;
    }
  }]);
}();
/**
 * Enables the AbortSignal to be transferable using structuredClone/postMessage.
 * @param {AbortSignal} signal
 * @returns {AbortSignal}
 */
function transferableAbortSignal(signal) {
  if (signal?.[kAborted] === undefined) throw new ERR_INVALID_ARG_TYPE('signal', 'AbortSignal', signal);
  markTransferMode(signal, false, true);
  return signal;
}

/**
 * Creates an AbortController with a transferable AbortSignal
 * @returns {AbortController}
 */
function transferableAbortController() {
  return AbortController[kMakeTransferable]();
}
ObjectDefineProperties(AbortController.prototype, {
  signal: kEnumerableProperty,
  abort: kEnumerableProperty
});
ObjectDefineProperty(AbortController.prototype, SymbolToStringTag, {
  __proto__: null,
  writable: false,
  enumerable: false,
  configurable: true,
  value: 'AbortController'
});
module.exports = {
  AbortController,
  AbortSignal,
  ClonedAbortSignal,
  aborted,
  transferableAbortSignal,
  transferableAbortController
};

