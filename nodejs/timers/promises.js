'use strict';

function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
var _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;
    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        var value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _for(test, update, body) {
  var stage;
  for (;;) {
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
    if (shouldContinue.then) {
      stage = 0;
      break;
    }
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.s;
      } else {
        stage = 1;
        break;
      }
    }
    if (update) {
      var updateValue = update();
      if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
        stage = 2;
        break;
      }
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    do {
      if (update) {
        updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          updateValue.then(_resumeAfterUpdate).then(void 0, reject);
          return;
        }
      }
      shouldContinue = test();
      if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
        _settle(pact, 1, result);
        return;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (_isSettledPact(result)) {
        result = result.v;
      }
    } while (!result || !result.then);
    result.then(_resumeAfterBody).then(void 0, reject);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
      } else {
        _resumeAfterBody(result);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
  function _resumeAfterUpdate() {
    if (shouldContinue = test()) {
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
      } else {
        _resumeAfterTest(shouldContinue);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
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
var _earlyReturn = /*#__PURE__*/{},
  _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator",
  _AsyncGenerator = /*#__PURE__*/function () {
    function _AsyncGenerator(entry) {
      this._entry = entry;
      this._pact = null;
      this._resolve = null;
      this._return = null;
      this._promise = null;
    }
    function _wrapReturnedValue(value) {
      return {
        value: value,
        done: true
      };
    }
    function _wrapYieldedValue(value) {
      return {
        value: value,
        done: false
      };
    }
    _AsyncGenerator.prototype._yield = function (value) {
      // Yield the value to the pending next call
      this._resolve(value && value.then ? value.then(_wrapYieldedValue) : _wrapYieldedValue(value));
      // Return a pact for an upcoming next/return/throw call
      return this._pact = new _Pact();
    };
    _AsyncGenerator.prototype.next = function (value) {
      // Advance the generator, starting it if it has yet to be started
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          var _entry = _this._entry;
          if (_entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the next call!
            return resolve(_this._promise);
          }
          // Start the generator
          _this._entry = null;
          _this._resolve = resolve;
          function returnValue(value) {
            _this._resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
            _this._pact = null;
            _this._resolve = null;
          }
          var result = _entry(_this);
          if (result && result.then) {
            result.then(returnValue, function (error) {
              if (error === _earlyReturn) {
                returnValue(_this._return);
              } else {
                var pact = new _Pact();
                _this._resolve(pact);
                _this._pact = null;
                _this._resolve = null;
                _resolve(pact, 2, error);
              }
            });
          } else {
            returnValue(result);
          }
        } else {
          // Generator is started and a yield expression is pending, settle it
          _this._pact = null;
          _this._resolve = resolve;
          _settle(_pact, 1, value);
        }
      });
    };
    _AsyncGenerator.prototype.return = function (value) {
      // Early return from the generator if started, otherwise abandons the generator
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the return call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return the specified value
          _this._entry = null;
          return resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
        }
        // Settle the yield expression with a rejected "early return" value
        _this._return = value;
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, _earlyReturn);
      });
    };
    _AsyncGenerator.prototype.throw = function (error) {
      // Inject an exception into the pending yield expression
      var _this = this;
      return _this._promise = new Promise(function (resolve, reject) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the throw call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return a rejected Promise containing the error
          _this._entry = null;
          return reject(error);
        }
        // Settle the yield expression with the value as a rejection
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, error);
      });
    };
    _AsyncGenerator.prototype[_asyncIteratorSymbol] = function () {
      return this;
    };
    return _AsyncGenerator;
  }();
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var setInterval = function (after, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
  return new _AsyncGenerator(function (_generator) {
    if (typeof after !== 'undefined') {
      validateNumber(after, 'delay');
    }
    validateObject(options, 'options');
    if (typeof options?.signal !== 'undefined') {
      validateAbortSignal(options.signal, 'options.signal');
    }
    if (typeof options?.ref !== 'undefined') {
      validateBoolean(options.ref, 'options.ref');
    }
    var {
      signal,
      ref = true
    } = options;
    if (signal?.aborted) {
      throw new AbortError(undefined, {
        cause: signal.reason
      });
    }
    var onCancel;
    var interval;
    return _finallyRethrows(function () {
      var notYielded = 0;
      var callback;
      interval = new Timeout(() => {
        notYielded++;
        if (callback) {
          callback();
          callback = undefined;
        }
      }, after, undefined, true, ref);
      insert(interval, interval._idleTimeout);
      if (signal) {
        onCancel = () => {
          clearInterval(interval);
          if (callback) {
            callback(PromiseReject(new AbortError(undefined, {
              cause: signal.reason
            })));
            callback = undefined;
          }
        };
        kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
        signal.addEventListener('abort', onCancel, {
          __proto__: null,
          once: true,
          [kResistStopPropagation]: true
        });
      }
      return _continue(_for(function () {
        return !signal?.aborted;
      }, void 0, function () {
        return _invoke(function () {
          if (notYielded === 0) {
            return _awaitIgnored(new Promise(resolve => callback = resolve));
          }
        }, function () {
          return _continueIgnored(_for(function () {
            return notYielded > 0;
          }, function () {
            return notYielded--;
          }, function () {
            return _generator._yield(value).then(_empty);
          }));
        });
      }), function () {
        throw new AbortError(undefined, {
          cause: signal?.reason
        });
      });
    }, function (_wasThrown, _result) {
      clearInterval(interval);
      signal?.removeEventListener('abort', onCancel);
      return _rethrow(_wasThrown, _result);
    });
  });
}; // TODO(@jasnell): Scheduler is an API currently being discussed by WICG
// for Web Platform standardization: https://github.com/WICG/scheduling-apis
// The scheduler.yield() and scheduler.wait() methods correspond roughly to
// the awaitable setTimeout and setImmediate implementations here. This api
// should be considered to be experimental until the spec for these are
// finalized. Note, also, that Scheduler is expected to be defined as a global,
// but while the API is experimental we shouldn't expose it as such.
var {
  FunctionPrototypeBind,
  Promise,
  PromiseReject,
  PromiseWithResolvers,
  ReflectConstruct,
  SafePromisePrototypeFinally,
  Symbol: _Symbol
} = primordials;
var {
  Timeout,
  Immediate,
  insert
} = require('internal/timers');
var {
  clearImmediate,
  clearInterval,
  clearTimeout
} = require('timers');
var {
  AbortError,
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_THIS
  }
} = require('internal/errors');
var {
  validateAbortSignal,
  validateBoolean,
  validateObject,
  validateNumber
} = require('internal/validators');
var {
  kEmptyObject
} = require('internal/util');
var kScheduler = _Symbol('kScheduler');
var kResistStopPropagation;
function cancelListenerHandler(clear, reject, signal) {
  if (!this._destroyed) {
    clear(this);
    reject(new AbortError(undefined, {
      cause: signal?.reason
    }));
  }
}
function setTimeout(after, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
  try {
    if (typeof after !== 'undefined') {
      validateNumber(after, 'delay');
    }
    validateObject(options, 'options');
    if (typeof options?.signal !== 'undefined') {
      validateAbortSignal(options.signal, 'options.signal');
    }
    if (typeof options?.ref !== 'undefined') {
      validateBoolean(options.ref, 'options.ref');
    }
  } catch (err) {
    return PromiseReject(err);
  }
  var {
    signal,
    ref = true
  } = options;
  if (signal?.aborted) {
    return PromiseReject(new AbortError(undefined, {
      cause: signal.reason
    }));
  }
  var oncancel;
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  var timeout = new Timeout(resolve, after, [value], false, ref);
  insert(timeout, timeout._idleTimeout);
  if (signal) {
    oncancel = FunctionPrototypeBind(cancelListenerHandler, timeout, clearTimeout, reject, signal);
    kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
    signal.addEventListener('abort', oncancel, {
      __proto__: null,
      [kResistStopPropagation]: true
    });
  }
  return oncancel !== undefined ? SafePromisePrototypeFinally(promise, () => signal.removeEventListener('abort', oncancel)) : promise;
}
function setImmediate(value) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  try {
    validateObject(options, 'options');
    if (typeof options?.signal !== 'undefined') {
      validateAbortSignal(options.signal, 'options.signal');
    }
    if (typeof options?.ref !== 'undefined') {
      validateBoolean(options.ref, 'options.ref');
    }
  } catch (err) {
    return PromiseReject(err);
  }
  var {
    signal,
    ref = true
  } = options;
  if (signal?.aborted) {
    return PromiseReject(new AbortError(undefined, {
      cause: signal.reason
    }));
  }
  var oncancel;
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  var immediate = new Immediate(resolve, [value]);
  if (!ref) immediate.unref();
  if (signal) {
    oncancel = FunctionPrototypeBind(cancelListenerHandler, immediate, clearImmediate, reject, signal);
    kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
    signal.addEventListener('abort', oncancel, {
      __proto__: null,
      [kResistStopPropagation]: true
    });
  }
  return oncancel !== undefined ? SafePromisePrototypeFinally(promise, () => signal.removeEventListener('abort', oncancel)) : promise;
}
var Scheduler = /*#__PURE__*/function () {
  function Scheduler() {
    _classCallCheck(this, Scheduler);
    throw new ERR_ILLEGAL_CONSTRUCTOR();
  }

  /**
   * @returns {Promise<void>}
   */
  return _createClass(Scheduler, [{
    key: "yield",
    value: function _yield() {
      if (!this[kScheduler]) throw new ERR_INVALID_THIS('Scheduler');
      return setImmediate();
    }

    /**
     * @typedef {import('../internal/abort_controller').AbortSignal} AbortSignal
     * @param {number} delay
     * @param {{ signal?: AbortSignal }} [options]
     * @returns {Promise<void>}
     */
  }, {
    key: "wait",
    value: function wait(delay, options) {
      if (!this[kScheduler]) throw new ERR_INVALID_THIS('Scheduler');
      return setTimeout(delay, undefined, options);
    }
  }]);
}();
module.exports = {
  setTimeout,
  setImmediate,
  setInterval,
  scheduler: ReflectConstruct(function () {
    this[kScheduler] = true;
  }, [], Scheduler)
};

