'use strict';

function _empty() {}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
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
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
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
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
function _forTo(array, body, check) {
  var i = -1,
    pact,
    reject;
  function _cycle(result) {
    try {
      while (++i < array.length && (!check || !check())) {
        result = body(i);
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
            return;
          }
        }
      }
      if (pact) {
        _settle(pact, 1, result);
      } else {
        pact = result;
      }
    } catch (e) {
      _settle(pact || (pact = new _Pact()), 2, e);
    }
  }
  _cycle();
  return pact;
}
function _forOf(target, body, check) {
  if (typeof target[_iteratorSymbol] === "function") {
    var iterator = target[_iteratorSymbol](),
      step,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (!(step = iterator.next()).done && (!check || !check())) {
          result = body(step.value);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    if (iterator.return) {
      var _fixup = function (value) {
        try {
          if (!step.done) {
            iterator.return();
          }
        } catch (e) {}
        return value;
      };
      if (pact && pact.then) {
        return pact.then(_fixup, function (e) {
          throw _fixup(e);
        });
      }
      _fixup();
    }
    return pact;
  }
  // No support for Symbol.iterator
  if (!("length" in target)) {
    throw new TypeError("Object is not iterable");
  }
  // Handle live collections properly
  var values = [];
  for (var i = 0; i < target.length; i++) {
    values.push(target[i]);
  }
  return _forTo(values, function (i) {
    return body(values[i]);
  }, check);
}
function _forAwaitOf(target, body, check) {
  if (typeof target[_asyncIteratorSymbol] === "function") {
    var pact = new _Pact();
    var iterator = target[_asyncIteratorSymbol]();
    iterator.next().then(_resumeAfterNext).then(void 0, _reject);
    return pact;
    function _resumeAfterBody(result) {
      if (check && check()) {
        return _settle(pact, 1, iterator.return ? iterator.return().then(function () {
          return result;
        }) : result);
      }
      iterator.next().then(_resumeAfterNext).then(void 0, _reject);
    }
    function _resumeAfterNext(step) {
      if (step.done) {
        _settle(pact, 1);
      } else {
        Promise.resolve(body(step.value)).then(_resumeAfterBody).then(void 0, _reject);
      }
    }
    function _reject(error) {
      _settle(pact, 2, iterator.return ? iterator.return().then(function () {
        return error;
      }) : error);
    }
  }
  return Promise.resolve(_forOf(target, function (value) {
    return Promise.resolve(value).then(body);
  }, check));
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
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
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var toArray = _async(function (options) {
  var _exit0 = false;
  var _this0 = this;
  if (options != null) {
    validateObject(options, 'options');
  }
  if (options?.signal != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  var result = [];
  return _continue(_forAwaitOf(_this0, function (val) {
    if (options?.signal?.aborted) {
      throw new AbortError(undefined, {
        cause: options.signal.reason
      });
    }
    ArrayPrototypePush(result, val);
  }, function () {
    return _exit0;
  }), function (_result11) {
    return _exit0 ? _result11 : result;
  });
});
var reduce = _async(function (reducer, initialValue, options) {
  var _exit8 = false;
  var _arguments = arguments,
    _this9 = this;
  validateFunction(reducer, 'reducer');
  if (options != null) {
    validateObject(options, 'options');
  }
  if (options?.signal != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  var hasInitialValue = _arguments.length > 1;
  return _invoke(function () {
    if (options?.signal?.aborted) {
      var err = new AbortError(undefined, {
        cause: options.signal.reason
      });
      _this9.once('error', () => {}); // The error is already propagated
      return _await(finished(_this9.destroy(err)), function () {
        throw err;
      });
    }
  }, function (_result0) {
    var _exit9 = false;
    if (_exit8) return _result0;
    var ac = new AbortController();
    var signal = ac.signal;
    if (options?.signal) {
      var opts = {
        once: true,
        [kWeakHandler]: _this9,
        [kResistStopPropagation]: true
      };
      options.signal.addEventListener('abort', () => ac.abort(), opts);
    }
    var gotAnyItemFromStream = false;
    return _continue(_finallyRethrows(function () {
      return _continue(_forAwaitOf(_this9, function (value) {
        gotAnyItemFromStream = true;
        if (options?.signal?.aborted) {
          throw new AbortError();
        }
        return _invokeIgnored(function () {
          if (!hasInitialValue) {
            initialValue = value;
            hasInitialValue = true;
          } else {
            return _await(reducer(initialValue, value, {
              signal
            }), function (_reducer) {
              initialValue = _reducer;
            });
          }
        });
      }, function () {
        return _exit9;
      }), function (_result1) {
        if (_exit9) return _result1;
        if (!gotAnyItemFromStream && !hasInitialValue) {
          throw new ReduceAwareErrMissingArgs();
        }
      });
    }, function (_wasThrown3, _result10) {
      ac.abort();
      return _rethrow(_wasThrown3, _result10);
    }), function (_result10) {
      return _exit9 ? _result10 : initialValue;
    });
  });
});
var forEach = _async(function (fn, options) {
  var _this8 = this;
  var forEachFn = _async(function (value, options) {
    return _await(fn(value, options), function () {
      return kEmpty;
    });
  }); // eslint-disable-next-line no-unused-vars
  validateFunction(fn, 'fn');
  return _continueIgnored(_forAwaitOf(map.call(_this8, forEachFn, options), function (unused) {
    ;
  }));
});
var find = _async(function (fn, options) {
  var _exit7 = false;
  var _this7 = this;
  return _continue(_forAwaitOf(filter.call(_this7, fn, options), function (result) {
    _exit7 = true;
    return result;
  }, function () {
    return _exit7;
  }), function (_result9) {
    return _exit7 ? _result9 : undefined;
  });
});
var every = _async(function (fn) {
  var _this6 = this;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  validateFunction(fn, 'fn');
  // https://en.wikipedia.org/wiki/De_Morgan%27s_laws
  return _await(some.call(_this6, _async(function () {
    return _await(fn.apply(void 0, arguments), function (_fn2) {
      return !_fn2;
    });
  }), options), function (_some$call) {
    return !_some$call;
  });
});
var some = _async(function (fn) {
  var _exit6 = false;
  var _this5 = this;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  return _continue(_forAwaitOf(filter.call(_this5, fn, options), function (unused) {
    _exit6 = true;
    return true;
  }, function () {
    return _exit6;
  }), function (_result8) {
    return _exit6 ? _result8 : false;
  });
});
var {
  ArrayPrototypePush,
  Boolean: _Boolean,
  MathFloor,
  Number: _Number,
  NumberIsNaN,
  Promise,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  Symbol: _Symbol
} = primordials;
var {
  AbortController,
  AbortSignal
} = require('internal/abort_controller');
var {
  AbortError,
  codes: {
    ERR_MISSING_ARGS,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var {
  validateAbortSignal,
  validateInteger,
  validateObject,
  validateFunction
} = require('internal/validators');
var {
  kWeakHandler,
  kResistStopPropagation
} = require('internal/event_target');
var {
  finished
} = require('internal/streams/end-of-stream');
var kEmpty = _Symbol('kEmpty');
var kEof = _Symbol('kEof');
function map(fn, options) {
  validateFunction(fn, 'fn');
  if (options != null) {
    validateObject(options, 'options');
  }
  if (options?.signal != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  var concurrency = 1;
  if (options?.concurrency != null) {
    concurrency = MathFloor(options.concurrency);
  }
  var highWaterMark = concurrency - 1;
  if (options?.highWaterMark != null) {
    highWaterMark = MathFloor(options.highWaterMark);
  }
  validateInteger(concurrency, 'options.concurrency', 1);
  validateInteger(highWaterMark, 'options.highWaterMark', 0);
  highWaterMark += concurrency;
  return function map() {
    return new _AsyncGenerator(function (_generator) {
      var _exit = false;
      var _this = this;
      var pump = _async(function () {
        var _exit2 = false;
        return _finallyRethrows(function () {
          return _catch(function () {
            return _continue(_forAwaitOf(stream, function (val) {
              if (done) {
                _exit2 = true;
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              try {
                val = fn(val, signalOpt);
                if (val === kEmpty) {
                  return;
                }
                val = PromiseResolve(val);
              } catch (err) {
                val = PromiseReject(err);
              }
              cnt += 1;
              PromisePrototypeThen(val, afterItemProcessed, onCatch);
              queue.push(val);
              if (next) {
                next();
                next = null;
              }
              return _invokeIgnored(function () {
                if (!done && (queue.length >= highWaterMark || cnt >= concurrency)) {
                  return _awaitIgnored(new Promise(resolve => {
                    resume = resolve;
                  }));
                }
              });
            }, function () {
              return _exit2;
            }), function (_result4) {
              if (_exit2) return _result4;
              queue.push(kEof);
            });
          }, function (err) {
            var val = PromiseReject(err);
            PromisePrototypeThen(val, afterItemProcessed, onCatch);
            queue.push(val);
          });
        }, function (_wasThrown2, _result5) {
          done = true;
          if (next) {
            next();
            next = null;
          }
          return _rethrow(_wasThrown2, _result5);
        });
      });
      var signal = AbortSignal.any([options?.signal].filter(_Boolean));
      var stream = _this;
      var queue = [];
      var signalOpt = {
        signal
      };
      var next;
      var resume;
      var done = false;
      function onCatch() {
        done = true;
        afterItemProcessed();
      }
      function afterItemProcessed() {
        cnt -= 1;
        maybeResume();
      }
      function maybeResume() {
        if (resume && !done && cnt < concurrency && queue.length < highWaterMark) {
          resume();
          resume = null;
        }
      }
      var cnt = 0;
      pump();
      return _finallyRethrows(function () {
        return _for(function () {
          return !_exit;
        }, void 0, function () {
          return _continue(_for(function () {
            return !_exit && queue.length > 0;
          }, void 0, function () {
            return _await(queue[0], function (val) {
              if (val === kEof) {
                _exit = true;
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              return _invoke(function () {
                if (val !== kEmpty) {
                  return _generator._yield(val).then(_empty);
                }
              }, function () {
                queue.shift();
                maybeResume();
              });
            });
          }), function (_result) {
            return _exit ? _result : _awaitIgnored(new Promise(resolve => {
              next = resolve;
            }));
          });
        });
      }, function (_wasThrown, _result3) {
        done = true;
        if (resume) {
          resume();
          resume = null;
        }
        return _rethrow(_wasThrown, _result3);
      });
    });
  }.call(this);
}
function filter(fn, options) {
  var filterFn = _async(function (value, options) {
    var _exit3 = false;
    return _await(fn(value, options), function (_fn) {
      if (_fn) {
        _exit3 = true;
        return value;
      }
      return kEmpty;
    });
  });
  validateFunction(fn, 'fn');
  return map.call(this, filterFn, options);
}

// Specific to provide better error to reduce since the argument is only
// missing if the stream has no items in it - but the code is still appropriate
var ReduceAwareErrMissingArgs = /*#__PURE__*/function (_ERR_MISSING_ARGS) {
  function ReduceAwareErrMissingArgs() {
    var _this2;
    _classCallCheck(this, ReduceAwareErrMissingArgs);
    _this2 = _callSuper(this, ReduceAwareErrMissingArgs, ['reduce']);
    _this2.message = 'Reduce of an empty stream requires an initial value';
    return _this2;
  }
  _inherits(ReduceAwareErrMissingArgs, _ERR_MISSING_ARGS);
  return _createClass(ReduceAwareErrMissingArgs);
}(ERR_MISSING_ARGS);
function flatMap(fn, options) {
  var values = map.call(this, fn, options);
  return function flatMap() {
    return new _AsyncGenerator(function (_generator2) {
      return _continueIgnored(_forAwaitOf(values, function (val) {
        return _generator2._yield(val).then(_empty);
      }));
    });
  }.call(this);
}
function toIntegerOrInfinity(number) {
  // We coerce here to align with the spec
  // https://github.com/tc39/proposal-iterator-helpers/issues/169
  number = _Number(number);
  if (NumberIsNaN(number)) {
    return 0;
  }
  if (number < 0) {
    throw new ERR_OUT_OF_RANGE('number', '>= 0', number);
  }
  return number;
}
function drop(number) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (options != null) {
    validateObject(options, 'options');
  }
  if (options?.signal != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  number = toIntegerOrInfinity(number);
  return function drop() {
    return new _AsyncGenerator(function (_generator3) {
      var _exit4 = false;
      var _this3 = this;
      if (options?.signal?.aborted) {
        throw new AbortError();
      }
      return _forAwaitOf(_this3, function (val) {
        if (options?.signal?.aborted) {
          throw new AbortError();
        }
        return _invokeIgnored(function () {
          if (number-- <= 0) {
            return _generator3._yield(val).then(_empty);
          }
        });
      }, function () {
        return _exit4;
      });
    });
  }.call(this);
}
function take(number) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (options != null) {
    validateObject(options, 'options');
  }
  if (options?.signal != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  number = toIntegerOrInfinity(number);
  return function take() {
    return new _AsyncGenerator(function (_generator4) {
      var _exit5 = false;
      var _this4 = this;
      if (options?.signal?.aborted) {
        throw new AbortError();
      }
      return _forAwaitOf(_this4, function (val) {
        if (options?.signal?.aborted) {
          throw new AbortError();
        }
        return _invoke(function () {
          if (number-- > 0) {
            return _generator4._yield(val).then(_empty);
          }
        }, function () {
          if (number <= 0) {
            _exit5 = true;
          }
        }); // Don't get another item from iterator in case we reached the end
      }, function () {
        return _exit5;
      });
    });
  }.call(this);
}
module.exports.streamReturningOperators = {
  drop,
  filter,
  flatMap,
  map,
  take
};
module.exports.promiseReturningOperators = {
  every,
  forEach,
  reduce,
  toArray,
  some,
  find
};

