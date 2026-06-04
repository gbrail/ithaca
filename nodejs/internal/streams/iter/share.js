'use strict';

// New Streams API - Share
//
// Pull-model multi-consumer streaming. Shares a single source among
// multiple consumers with explicit buffering.
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
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
function _switch(discriminant, cases) {
  var dispatchIndex = -1;
  var awaitBody;
  outer: {
    for (var i = 0; i < cases.length; i++) {
      var test = cases[i][0];
      if (test) {
        var testValue = test();
        if (testValue && testValue.then) {
          break outer;
        }
        if (testValue === discriminant) {
          dispatchIndex = i;
          break;
        }
      } else {
        // Found the default case, set it as the pending dispatch case
        dispatchIndex = i;
      }
    }
    if (dispatchIndex !== -1) {
      do {
        var body = cases[dispatchIndex][1];
        while (!body) {
          dispatchIndex++;
          body = cases[dispatchIndex][1];
        }
        var result = body();
        if (result && result.then) {
          awaitBody = true;
          break outer;
        }
        var fallthroughCheck = cases[dispatchIndex][2];
        dispatchIndex++;
      } while (fallthroughCheck && !fallthroughCheck());
      return result;
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (awaitBody ? result.then(_resumeAfterBody) : testValue.then(_resumeAfterTest)).then(void 0, reject);
  return pact;
  function _resumeAfterTest(value) {
    for (;;) {
      if (value === discriminant) {
        dispatchIndex = i;
        break;
      }
      if (++i === cases.length) {
        if (dispatchIndex !== -1) {
          break;
        } else {
          _settle(pact, 1, result);
          return;
        }
      }
      test = cases[i][0];
      if (test) {
        value = test();
        if (value && value.then) {
          value.then(_resumeAfterTest).then(void 0, reject);
          return;
        }
      } else {
        dispatchIndex = i;
      }
    }
    do {
      var body = cases[dispatchIndex][1];
      while (!body) {
        dispatchIndex++;
        body = cases[dispatchIndex][1];
      }
      var result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
        return;
      }
      var fallthroughCheck = cases[dispatchIndex][2];
      dispatchIndex++;
    } while (fallthroughCheck && !fallthroughCheck());
    _settle(pact, 1, result);
  }
  function _resumeAfterBody(result) {
    for (;;) {
      var fallthroughCheck = cases[dispatchIndex][2];
      if (!fallthroughCheck || fallthroughCheck()) {
        break;
      }
      dispatchIndex++;
      var body = cases[dispatchIndex][1];
      while (!body) {
        dispatchIndex++;
        body = cases[dispatchIndex][1];
      }
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
        return;
      }
    }
    _settle(pact, 1, result);
  }
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
// Internal methods
var _waitForBufferSpace = _async(function () {
  var _exit2 = false;
  var _this2 = this;
  var _this$bufferStart, _this$bufferStart2;
  return _continue(_for(function () {
    return !_exit2 && _classPrivateFieldGet(_buffer, _this2).length >= _classPrivateFieldGet(_options, _this2).highWaterMark;
  }, void 0, function () {
    var _interrupt = false;
    if (_classPrivateFieldGet(_cancelled, _this2) || _classPrivateFieldGet(_sourceError, _this2) || _classPrivateFieldGet(_sourceExhausted, _this2)) {
      var _classPrivateFieldGet2 = !_classPrivateFieldGet(_cancelled, _this2);
      _exit2 = true;
      return _classPrivateFieldGet2;
    }
    return _switch(_classPrivateFieldGet(_options, _this2).backpressure, [[function () {
      return 'strict';
    }, function () {
      throw new ERR_OUT_OF_RANGE('buffer size', `<= ${_classPrivateFieldGet(_options, _this2).highWaterMark}`, _classPrivateFieldGet(_buffer, _this2).length);
    }], [function () {
      return 'block';
    }, function () {
      {
        var {
          promise,
          resolve
        } = PromiseWithResolvers();
        ArrayPrototypePush(_classPrivateFieldGet(_pullWaiters, _this2), resolve);
        return _await(promise, function () {
          _interrupt = true;
        });
      }
    }], [function () {
      return 'drop-oldest';
    }, function () {
      _classPrivateFieldGet(_buffer, _this2).shift();
      _classPrivateFieldSet(_bufferStart, _this2, (_this$bufferStart = _classPrivateFieldGet(_bufferStart, _this2), _this$bufferStart2 = _this$bufferStart++, _this$bufferStart)), _this$bufferStart2;
      for (var consumer of _classPrivateFieldGet(_consumers, _this2)) {
        if (consumer.cursor < _classPrivateFieldGet(_bufferStart, _this2)) {
          _assertClassBrand(_ShareImpl_brand, _this2, _deleteConsumerFromMin).call(_this2, consumer);
          consumer.cursor = _classPrivateFieldGet(_bufferStart, _this2);
        }
      }
      _assertClassBrand(_ShareImpl_brand, _this2, _recomputeMinCursor).call(_this2);
      _exit2 = true;
      return true;
    }], [function () {
      return 'drop-newest';
    }, function () {
      _exit2 = true;
      return true;
    }]]);
  }), function (_result4) {
    return _exit2 ? _result4 : true;
  });
});
var {
  ArrayPrototypePush,
  PromisePrototypeThen,
  PromiseResolve,
  PromiseWithResolvers,
  SafeSet,
  SymbolAsyncIterator,
  SymbolDispose,
  SymbolIterator
} = primordials;
var {
  shareProtocol,
  shareSyncProtocol
} = require('internal/streams/iter/types');
var {
  from,
  fromSync,
  isAsyncIterable,
  isSyncIterable
} = require('internal/streams/iter/from');
var {
  pull: pullWithTransforms,
  pullSync: pullSyncWithTransforms
} = require('internal/streams/iter/pull');
var {
  kMultiConsumerDefaultHWM,
  clampHWM,
  getMinCursor,
  hasProtocol,
  onSignalAbort,
  wrapError,
  parsePullArgs,
  validateBackpressure
} = require('internal/streams/iter/utils');
var {
  RingBuffer
} = require('internal/streams/iter/ringbuffer');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_RETURN_VALUE,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var {
  validateAbortSignal,
  validateInteger,
  validateObject
} = require('internal/validators');

// =============================================================================
// Async Share Implementation
// =============================================================================
var _source = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _buffer = /*#__PURE__*/new WeakMap();
var _bufferStart = /*#__PURE__*/new WeakMap();
var _consumers = /*#__PURE__*/new WeakMap();
var _sourceIterator = /*#__PURE__*/new WeakMap();
var _sourceExhausted = /*#__PURE__*/new WeakMap();
var _sourceError = /*#__PURE__*/new WeakMap();
var _cancelled = /*#__PURE__*/new WeakMap();
var _pulling = /*#__PURE__*/new WeakMap();
var _pullWaiters = /*#__PURE__*/new WeakMap();
var _cachedMinCursor = /*#__PURE__*/new WeakMap();
var _cachedMinCursorConsumers = /*#__PURE__*/new WeakMap();
var _ShareImpl_brand = /*#__PURE__*/new WeakSet();
var ShareImpl = /*#__PURE__*/function () {
  function ShareImpl(source, options) {
    _classCallCheck(this, ShareImpl);
    _classPrivateMethodInitSpec(this, _ShareImpl_brand);
    _classPrivateFieldInitSpec(this, _source, void 0);
    _classPrivateFieldInitSpec(this, _options, void 0);
    _classPrivateFieldInitSpec(this, _buffer, new RingBuffer());
    _classPrivateFieldInitSpec(this, _bufferStart, 0);
    _classPrivateFieldInitSpec(this, _consumers, new SafeSet());
    _classPrivateFieldInitSpec(this, _sourceIterator, null);
    _classPrivateFieldInitSpec(this, _sourceExhausted, false);
    _classPrivateFieldInitSpec(this, _sourceError, null);
    _classPrivateFieldInitSpec(this, _cancelled, false);
    _classPrivateFieldInitSpec(this, _pulling, false);
    _classPrivateFieldInitSpec(this, _pullWaiters, []);
    _classPrivateFieldInitSpec(this, _cachedMinCursor, 0);
    _classPrivateFieldInitSpec(this, _cachedMinCursorConsumers, 0);
    _classPrivateFieldSet(_source, this, source);
    _classPrivateFieldSet(_options, this, options);
  }
  return _createClass(ShareImpl, [{
    key: "consumerCount",
    get: function () {
      return _classPrivateFieldGet(_consumers, this).size;
    }
  }, {
    key: "bufferSize",
    get: function () {
      return _classPrivateFieldGet(_buffer, this).length;
    }
  }, {
    key: "pull",
    value: function pull() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var {
        transforms,
        options
      } = parsePullArgs(args);
      var rawConsumer = _assertClassBrand(_ShareImpl_brand, this, _createRawConsumer).call(this);
      if (transforms.length > 0) {
        if (options) {
          return pullWithTransforms.apply(void 0, [rawConsumer].concat(_toConsumableArray(transforms), [options]));
        }
        return pullWithTransforms.apply(void 0, [rawConsumer].concat(_toConsumableArray(transforms)));
      }
      return rawConsumer;
    }
  }, {
    key: "cancel",
    value: function cancel(reason) {
      if (_classPrivateFieldGet(_cancelled, this)) return;
      _classPrivateFieldSet(_cancelled, this, true);
      if (reason !== undefined) {
        _classPrivateFieldSet(_sourceError, this, reason);
      }
      if (_classPrivateFieldGet(_sourceIterator, this)?.return) {
        PromisePrototypeThen(_classPrivateFieldGet(_sourceIterator, this).return(), undefined, () => {});
      }
      for (var consumer of _classPrivateFieldGet(_consumers, this)) {
        if (consumer.resolve) {
          if (reason !== undefined) {
            consumer.reject?.(reason);
          } else {
            consumer.resolve({
              __proto__: null,
              done: true,
              value: undefined
            });
          }
          consumer.resolve = null;
          consumer.reject = null;
        }
        consumer.detached = true;
      }
      _classPrivateFieldGet(_consumers, this).clear();
      for (var i = 0; i < _classPrivateFieldGet(_pullWaiters, this).length; i++) {
        _classPrivateFieldGet(_pullWaiters, this)[i]();
      }
      _classPrivateFieldSet(_pullWaiters, this, []);
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.cancel();
    }
  }]);
}(); // =============================================================================
// Sync Share Implementation
// =============================================================================
function _createRawConsumer() {
  var state = {
    __proto__: null,
    cursor: _classPrivateFieldGet(_bufferStart, this),
    resolve: null,
    reject: null,
    detached: false,
    pendingNext: PromiseResolve()
  };
  _classPrivateFieldGet(_consumers, this).add(state);
  if (_classPrivateFieldGet(_consumers, this).size === 1) {
    _classPrivateFieldSet(_cachedMinCursor, this, state.cursor);
    _classPrivateFieldSet(_cachedMinCursorConsumers, this, 1);
  } else if (state.cursor === _classPrivateFieldGet(_cachedMinCursor, this)) {
    var _this$cachedMinCursor, _this$cachedMinCursor2;
    _classPrivateFieldSet(_cachedMinCursorConsumers, this, (_this$cachedMinCursor = _classPrivateFieldGet(_cachedMinCursorConsumers, this), _this$cachedMinCursor2 = _this$cachedMinCursor++, _this$cachedMinCursor)), _this$cachedMinCursor2;
  } else {
    _assertClassBrand(_ShareImpl_brand, this, _recomputeMinCursor).call(this);
  }
  var self = this;
  return {
    __proto__: null,
    [SymbolAsyncIterator]() {
      var getNext = _async(function () {
        var _exit = false;
        if (_classPrivateFieldGet(_sourceError, self)) {
          state.detached = true;
          _classPrivateFieldGet(_consumers, self).delete(state);
          throw _classPrivateFieldGet(_sourceError, self);
        }

        // Loop until we get data, source is exhausted, or
        // consumer is detached. Multiple consumers may be woken
        // after a single pull - those that find no data at their
        // cursor must re-pull rather than terminating prematurely.
        return _for(function () {
          return !_exit;
        }, void 0, function () {
          if (state.detached) {
            if (_classPrivateFieldGet(_sourceError, self)) throw _classPrivateFieldGet(_sourceError, self);
            var _proto__$done$value = {
              __proto__: null,
              done: true,
              value: undefined
            };
            _exit = true;
            return _proto__$done$value;
          }
          if (_classPrivateFieldGet(_cancelled, self)) {
            state.detached = true;
            _assertClassBrand(_ShareImpl_brand, self, _deleteConsumer).call(self, state);
            var _proto__$done$value2 = {
              __proto__: null,
              done: true,
              value: undefined
            };
            _exit = true;
            return _proto__$done$value2;
          }

          // Check if data is available in buffer
          var bufferIndex = state.cursor - _classPrivateFieldGet(_bufferStart, self);
          if (bufferIndex < _classPrivateFieldGet(_buffer, self).length) {
            var _self$cachedMinCursor;
            var chunk = _classPrivateFieldGet(_buffer, self).get(bufferIndex);
            var cursor = state.cursor;
            state.cursor++;
            if (cursor === _classPrivateFieldGet(_cachedMinCursor, self) && _classPrivateFieldSet(_cachedMinCursorConsumers, self, (_self$cachedMinCursor = _classPrivateFieldGet(_cachedMinCursorConsumers, self), --_self$cachedMinCursor)) === 0) {
              _assertClassBrand(_ShareImpl_brand, self, _tryTrimBuffer).call(self);
            }
            var _proto__$done$value3 = {
              __proto__: null,
              done: false,
              value: chunk
            };
            _exit = true;
            return _proto__$done$value3;
          }
          if (_classPrivateFieldGet(_sourceExhausted, self)) {
            state.detached = true;
            _assertClassBrand(_ShareImpl_brand, self, _deleteConsumer).call(self, state);
            if (_classPrivateFieldGet(_sourceError, self)) throw _classPrivateFieldGet(_sourceError, self);
            var _proto__$done$value4 = {
              __proto__: null,
              done: true,
              value: undefined
            };
            _exit = true;
            return _proto__$done$value4;
          }

          // Need to pull from source - check buffer limit
          return _await(_assertClassBrand(_ShareImpl_brand, self, _waitForBufferSpace).call(self), function (canPull) {
            if (!canPull) {
              state.detached = true;
              _assertClassBrand(_ShareImpl_brand, self, _deleteConsumer).call(self, state);
              if (_classPrivateFieldGet(_sourceError, self)) throw _classPrivateFieldGet(_sourceError, self);
              var _proto__$done$value5 = {
                __proto__: null,
                done: true,
                value: undefined
              };
              _exit = true;
              return _proto__$done$value5;
            }
            return _awaitIgnored(_assertClassBrand(_ShareImpl_brand, self, _pullFromSource).call(self));
          });
        });
      });
      return {
        __proto__: null,
        next() {
          var next = PromisePrototypeThen(state.pendingNext, getNext, getNext);
          state.pendingNext = PromisePrototypeThen(next, undefined, () => {});
          return next;
        },
        return: _async(function () {
          state.detached = true;
          state.resolve = null;
          state.reject = null;
          if (_assertClassBrand(_ShareImpl_brand, self, _deleteConsumer).call(self, state)) {
            _assertClassBrand(_ShareImpl_brand, self, _tryTrimBuffer).call(self);
          }
          return {
            __proto__: null,
            done: true,
            value: undefined
          };
        }),
        throw: _async(function () {
          state.detached = true;
          state.resolve = null;
          state.reject = null;
          if (_assertClassBrand(_ShareImpl_brand, self, _deleteConsumer).call(self, state)) {
            _assertClassBrand(_ShareImpl_brand, self, _tryTrimBuffer).call(self);
          }
          return {
            __proto__: null,
            done: true,
            value: undefined
          };
        })
      };
    }
  };
}
function _pullFromSource() {
  var _this = this;
  if (_classPrivateFieldGet(_sourceExhausted, this) || _classPrivateFieldGet(_cancelled, this)) {
    return PromiseResolve();
  }
  if (_classPrivateFieldGet(_pulling, this)) {
    var {
      promise,
      resolve
    } = PromiseWithResolvers();
    ArrayPrototypePush(_classPrivateFieldGet(_pullWaiters, this), resolve);
    return promise;
  }
  _classPrivateFieldSet(_pulling, this, true);
  return _async(function () {
    return _finallyRethrows(function () {
      return _catch(function () {
        if (!_classPrivateFieldGet(_sourceIterator, _this)) {
          if (isAsyncIterable(_classPrivateFieldGet(_source, _this))) {
            _classPrivateFieldSet(_sourceIterator, _this, _classPrivateFieldGet(_source, _this)[SymbolAsyncIterator]());
          } else if (isSyncIterable(_classPrivateFieldGet(_source, _this))) {
            var syncIterator = _classPrivateFieldGet(_source, _this)[SymbolIterator]();
            _classPrivateFieldSet(_sourceIterator, _this, {
              __proto__: null,
              next: _async(function () {
                return syncIterator.next();
              }),
              return: _async(function () {
                return syncIterator.return?.() ?? {
                  __proto__: null,
                  done: true,
                  value: undefined
                };
              })
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE('source', ['AsyncIterable', 'Iterable'], _classPrivateFieldGet(_source, _this));
          }
        }
        return _await(_classPrivateFieldGet(_sourceIterator, _this).next(), function (result) {
          if (result.done) {
            _classPrivateFieldSet(_sourceExhausted, _this, true);
          } else {
            _classPrivateFieldGet(_buffer, _this).push(result.value);
          }
        });
      }, function (error) {
        _classPrivateFieldSet(_sourceError, _this, wrapError(error));
        _classPrivateFieldSet(_sourceExhausted, _this, true);
      });
    }, function (_wasThrown, _result2) {
      _classPrivateFieldSet(_pulling, _this, false);
      for (var i = 0; i < _classPrivateFieldGet(_pullWaiters, _this).length; i++) {
        _classPrivateFieldGet(_pullWaiters, _this)[i]();
      }
      _classPrivateFieldSet(_pullWaiters, _this, []);
      return _rethrow(_wasThrown, _result2);
    });
  })();
}
function _tryTrimBuffer() {
  if (_classPrivateFieldGet(_cachedMinCursorConsumers, this) === 0) {
    _assertClassBrand(_ShareImpl_brand, this, _recomputeMinCursor).call(this);
  }
  var trimCount = _classPrivateFieldGet(_cachedMinCursor, this) - _classPrivateFieldGet(_bufferStart, this);
  if (trimCount > 0) {
    _classPrivateFieldGet(_buffer, this).trimFront(trimCount);
    _classPrivateFieldSet(_bufferStart, this, _classPrivateFieldGet(_cachedMinCursor, this));
    for (var i = 0; i < _classPrivateFieldGet(_pullWaiters, this).length; i++) {
      _classPrivateFieldGet(_pullWaiters, this)[i]();
    }
    _classPrivateFieldSet(_pullWaiters, this, []);
  }
}
function _recomputeMinCursor() {
  var {
    minCursor,
    minCursorConsumers
  } = getMinCursor(_classPrivateFieldGet(_consumers, this), _classPrivateFieldGet(_bufferStart, this) + _classPrivateFieldGet(_buffer, this).length);
  _classPrivateFieldSet(_cachedMinCursor, this, minCursor);
  _classPrivateFieldSet(_cachedMinCursorConsumers, this, minCursorConsumers);
}
function _deleteConsumerFromMin(consumer) {
  if (consumer.cursor === _classPrivateFieldGet(_cachedMinCursor, this)) {
    var _this$cachedMinCursor3, _this$cachedMinCursor4;
    _classPrivateFieldSet(_cachedMinCursorConsumers, this, (_this$cachedMinCursor3 = _classPrivateFieldGet(_cachedMinCursorConsumers, this), _this$cachedMinCursor4 = _this$cachedMinCursor3--, _this$cachedMinCursor3)), _this$cachedMinCursor4;
    return _classPrivateFieldGet(_cachedMinCursorConsumers, this) === 0;
  }
  return false;
}
function _deleteConsumer(consumer) {
  if (_classPrivateFieldGet(_consumers, this).delete(consumer)) {
    return _assertClassBrand(_ShareImpl_brand, this, _deleteConsumerFromMin).call(this, consumer);
  }
  return false;
}
var _source2 = /*#__PURE__*/new WeakMap();
var _options2 = /*#__PURE__*/new WeakMap();
var _buffer2 = /*#__PURE__*/new WeakMap();
var _bufferStart2 = /*#__PURE__*/new WeakMap();
var _consumers2 = /*#__PURE__*/new WeakMap();
var _sourceIterator2 = /*#__PURE__*/new WeakMap();
var _sourceExhausted2 = /*#__PURE__*/new WeakMap();
var _sourceError2 = /*#__PURE__*/new WeakMap();
var _cancelled2 = /*#__PURE__*/new WeakMap();
var _cachedMinCursor2 = /*#__PURE__*/new WeakMap();
var _cachedMinCursorConsumers2 = /*#__PURE__*/new WeakMap();
var _SyncShareImpl_brand = /*#__PURE__*/new WeakSet();
var SyncShareImpl = /*#__PURE__*/function () {
  function SyncShareImpl(source, options) {
    _classCallCheck(this, SyncShareImpl);
    _classPrivateMethodInitSpec(this, _SyncShareImpl_brand);
    _classPrivateFieldInitSpec(this, _source2, void 0);
    _classPrivateFieldInitSpec(this, _options2, void 0);
    _classPrivateFieldInitSpec(this, _buffer2, new RingBuffer());
    _classPrivateFieldInitSpec(this, _bufferStart2, 0);
    _classPrivateFieldInitSpec(this, _consumers2, new SafeSet());
    _classPrivateFieldInitSpec(this, _sourceIterator2, null);
    _classPrivateFieldInitSpec(this, _sourceExhausted2, false);
    _classPrivateFieldInitSpec(this, _sourceError2, null);
    _classPrivateFieldInitSpec(this, _cancelled2, false);
    _classPrivateFieldInitSpec(this, _cachedMinCursor2, 0);
    _classPrivateFieldInitSpec(this, _cachedMinCursorConsumers2, 0);
    _classPrivateFieldSet(_source2, this, source);
    _classPrivateFieldSet(_options2, this, options);
  }
  return _createClass(SyncShareImpl, [{
    key: "consumerCount",
    get: function () {
      return _classPrivateFieldGet(_consumers2, this).size;
    }
  }, {
    key: "bufferSize",
    get: function () {
      return _classPrivateFieldGet(_buffer2, this).length;
    }
  }, {
    key: "pull",
    value: function pull() {
      var rawConsumer = _assertClassBrand(_SyncShareImpl_brand, this, _createRawConsumer2).call(this);
      for (var _len2 = arguments.length, transforms = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        transforms[_key2] = arguments[_key2];
      }
      if (transforms.length > 0) {
        return pullSyncWithTransforms.apply(void 0, [rawConsumer].concat(transforms));
      }
      return rawConsumer;
    }
  }, {
    key: "cancel",
    value: function cancel(reason) {
      if (_classPrivateFieldGet(_cancelled2, this)) return;
      _classPrivateFieldSet(_cancelled2, this, true);
      if (reason !== undefined) {
        _classPrivateFieldSet(_sourceError2, this, reason);
      }
      if (_classPrivateFieldGet(_sourceIterator2, this)?.return) {
        _classPrivateFieldGet(_sourceIterator2, this).return();
      }
      for (var consumer of _classPrivateFieldGet(_consumers2, this)) {
        consumer.detached = true;
      }
      _classPrivateFieldGet(_consumers2, this).clear();
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.cancel();
    }
  }]);
}();
function _createRawConsumer2() {
  var state = {
    __proto__: null,
    cursor: _classPrivateFieldGet(_bufferStart2, this),
    detached: false
  };
  _classPrivateFieldGet(_consumers2, this).add(state);
  if (_classPrivateFieldGet(_consumers2, this).size === 1) {
    _classPrivateFieldSet(_cachedMinCursor2, this, state.cursor);
    _classPrivateFieldSet(_cachedMinCursorConsumers2, this, 1);
  } else if (state.cursor === _classPrivateFieldGet(_cachedMinCursor2, this)) {
    var _this$cachedMinCursor5, _this$cachedMinCursor6;
    _classPrivateFieldSet(_cachedMinCursorConsumers2, this, (_this$cachedMinCursor5 = _classPrivateFieldGet(_cachedMinCursorConsumers2, this), _this$cachedMinCursor6 = _this$cachedMinCursor5++, _this$cachedMinCursor5)), _this$cachedMinCursor6;
  } else {
    _assertClassBrand(_SyncShareImpl_brand, this, _recomputeMinCursor2).call(this);
  }
  var self = this;
  return {
    __proto__: null,
    [SymbolIterator]() {
      return {
        __proto__: null,
        next() {
          var _self$bufferStart, _self$bufferStart2;
          if (state.detached) {
            return {
              __proto__: null,
              done: true,
              value: undefined
            };
          }
          if (_classPrivateFieldGet(_sourceError2, self)) {
            state.detached = true;
            _assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state);
            throw _classPrivateFieldGet(_sourceError2, self);
          }
          if (_classPrivateFieldGet(_cancelled2, self)) {
            state.detached = true;
            _assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state);
            return {
              __proto__: null,
              done: true,
              value: undefined
            };
          }
          var bufferIndex = state.cursor - _classPrivateFieldGet(_bufferStart2, self);
          if (bufferIndex < _classPrivateFieldGet(_buffer2, self).length) {
            var _self$cachedMinCursor2;
            var chunk = _classPrivateFieldGet(_buffer2, self).get(bufferIndex);
            var cursor = state.cursor;
            state.cursor++;
            if (cursor === _classPrivateFieldGet(_cachedMinCursor2, self) && _classPrivateFieldSet(_cachedMinCursorConsumers2, self, (_self$cachedMinCursor2 = _classPrivateFieldGet(_cachedMinCursorConsumers2, self), --_self$cachedMinCursor2)) === 0) {
              _assertClassBrand(_SyncShareImpl_brand, self, _tryTrimBuffer2).call(self);
            }
            return {
              __proto__: null,
              done: false,
              value: chunk
            };
          }
          if (_classPrivateFieldGet(_sourceExhausted2, self)) {
            state.detached = true;
            _assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state);
            return {
              __proto__: null,
              done: true,
              value: undefined
            };
          }

          // Check buffer limit
          if (_classPrivateFieldGet(_buffer2, self).length >= _classPrivateFieldGet(_options2, self).highWaterMark) {
            switch (_classPrivateFieldGet(_options2, self).backpressure) {
              case 'strict':
                throw new ERR_OUT_OF_RANGE('buffer size', `<= ${_classPrivateFieldGet(_options2, self).highWaterMark}`, _classPrivateFieldGet(_buffer2, self).length);
              case 'block':
                throw new ERR_OUT_OF_RANGE('buffer size', `<= ${_classPrivateFieldGet(_options2, self).highWaterMark} ` + '(blocking not available in sync context)', _classPrivateFieldGet(_buffer2, self).length);
              case 'drop-oldest':
                _classPrivateFieldGet(_buffer2, self).shift();
                _classPrivateFieldSet(_bufferStart2, self, (_self$bufferStart = _classPrivateFieldGet(_bufferStart2, self), _self$bufferStart2 = _self$bufferStart++, _self$bufferStart)), _self$bufferStart2;
                for (var consumer of _classPrivateFieldGet(_consumers2, self)) {
                  if (consumer.cursor < _classPrivateFieldGet(_bufferStart2, self)) {
                    _assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumerFromMin2).call(self, consumer);
                    consumer.cursor = _classPrivateFieldGet(_bufferStart2, self);
                  }
                }
                _assertClassBrand(_SyncShareImpl_brand, self, _recomputeMinCursor2).call(self);
                break;
              case 'drop-newest':
                state.detached = true;
                _assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state);
                return {
                  __proto__: null,
                  done: true,
                  value: undefined
                };
            }
          }
          _assertClassBrand(_SyncShareImpl_brand, self, _pullFromSource2).call(self);
          if (_classPrivateFieldGet(_sourceError2, self)) {
            state.detached = true;
            _assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state);
            throw _classPrivateFieldGet(_sourceError2, self);
          }
          var newBufferIndex = state.cursor - _classPrivateFieldGet(_bufferStart2, self);
          if (newBufferIndex < _classPrivateFieldGet(_buffer2, self).length) {
            var _self$cachedMinCursor3;
            var _chunk = _classPrivateFieldGet(_buffer2, self).get(newBufferIndex);
            var _cursor = state.cursor;
            state.cursor++;
            if (_cursor === _classPrivateFieldGet(_cachedMinCursor2, self) && _classPrivateFieldSet(_cachedMinCursorConsumers2, self, (_self$cachedMinCursor3 = _classPrivateFieldGet(_cachedMinCursorConsumers2, self), --_self$cachedMinCursor3)) === 0) {
              _assertClassBrand(_SyncShareImpl_brand, self, _tryTrimBuffer2).call(self);
            }
            return {
              __proto__: null,
              done: false,
              value: _chunk
            };
          }
          if (_classPrivateFieldGet(_sourceExhausted2, self)) {
            state.detached = true;
            _assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state);
            return {
              __proto__: null,
              done: true,
              value: undefined
            };
          }
          return {
            __proto__: null,
            done: true,
            value: undefined
          };
        },
        return() {
          state.detached = true;
          if (_assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state)) {
            _assertClassBrand(_SyncShareImpl_brand, self, _tryTrimBuffer2).call(self);
          }
          return {
            __proto__: null,
            done: true,
            value: undefined
          };
        },
        throw() {
          state.detached = true;
          if (_assertClassBrand(_SyncShareImpl_brand, self, _deleteConsumer2).call(self, state)) {
            _assertClassBrand(_SyncShareImpl_brand, self, _tryTrimBuffer2).call(self);
          }
          return {
            __proto__: null,
            done: true,
            value: undefined
          };
        }
      };
    }
  };
}
function _pullFromSource2() {
  if (_classPrivateFieldGet(_sourceExhausted2, this) || _classPrivateFieldGet(_cancelled2, this)) return;
  try {
    _classPrivateFieldGet(_sourceIterator2, this) || _classPrivateFieldSet(_sourceIterator2, this, _classPrivateFieldGet(_source2, this)[SymbolIterator]());
    var result = _classPrivateFieldGet(_sourceIterator2, this).next();
    if (result.done) {
      _classPrivateFieldSet(_sourceExhausted2, this, true);
    } else {
      _classPrivateFieldGet(_buffer2, this).push(result.value);
    }
  } catch (error) {
    _classPrivateFieldSet(_sourceError2, this, wrapError(error));
    _classPrivateFieldSet(_sourceExhausted2, this, true);
  }
}
function _tryTrimBuffer2() {
  if (_classPrivateFieldGet(_cachedMinCursorConsumers2, this) === 0) {
    _assertClassBrand(_SyncShareImpl_brand, this, _recomputeMinCursor2).call(this);
  }
  var trimCount = _classPrivateFieldGet(_cachedMinCursor2, this) - _classPrivateFieldGet(_bufferStart2, this);
  if (trimCount > 0) {
    _classPrivateFieldGet(_buffer2, this).trimFront(trimCount);
    _classPrivateFieldSet(_bufferStart2, this, _classPrivateFieldGet(_cachedMinCursor2, this));
  }
}
function _recomputeMinCursor2() {
  var {
    minCursor,
    minCursorConsumers
  } = getMinCursor(_classPrivateFieldGet(_consumers2, this), _classPrivateFieldGet(_bufferStart2, this) + _classPrivateFieldGet(_buffer2, this).length);
  _classPrivateFieldSet(_cachedMinCursor2, this, minCursor);
  _classPrivateFieldSet(_cachedMinCursorConsumers2, this, minCursorConsumers);
}
function _deleteConsumerFromMin2(consumer) {
  if (consumer.cursor === _classPrivateFieldGet(_cachedMinCursor2, this)) {
    var _this$cachedMinCursor7, _this$cachedMinCursor8;
    _classPrivateFieldSet(_cachedMinCursorConsumers2, this, (_this$cachedMinCursor7 = _classPrivateFieldGet(_cachedMinCursorConsumers2, this), _this$cachedMinCursor8 = _this$cachedMinCursor7--, _this$cachedMinCursor7)), _this$cachedMinCursor8;
    return _classPrivateFieldGet(_cachedMinCursorConsumers2, this) === 0;
  }
  return false;
}
function _deleteConsumer2(consumer) {
  if (_classPrivateFieldGet(_consumers2, this).delete(consumer)) {
    return _assertClassBrand(_SyncShareImpl_brand, this, _deleteConsumerFromMin2).call(this, consumer);
  }
  return false;
}
function onShareCancel(shareImpl, signal) {
  onSignalAbort(signal, () => shareImpl.cancel(signal.reason));
}

// =============================================================================
// Public API
// =============================================================================

function share(source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    __proto__: null
  };
  // Normalize source via from() - accepts strings, ArrayBuffers, protocols, etc.
  var normalized = from(source);
  validateObject(options, 'options');
  var {
    highWaterMark = kMultiConsumerDefaultHWM,
    backpressure = 'strict',
    signal
  } = options;
  validateInteger(highWaterMark, 'options.highWaterMark');
  validateBackpressure(backpressure);
  if (signal !== undefined) {
    validateAbortSignal(signal, 'options.signal');
  }
  var opts = {
    __proto__: null,
    highWaterMark: clampHWM(highWaterMark),
    backpressure,
    signal
  };
  var shareImpl = new ShareImpl(normalized, opts);
  if (signal) {
    onShareCancel(shareImpl, signal);
  }
  return shareImpl;
}
function shareSync(source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    __proto__: null
  };
  // Normalize source via fromSync() - accepts strings, ArrayBuffers, protocols, etc.
  var normalized = fromSync(source);
  validateObject(options, 'options');
  var {
    highWaterMark = kMultiConsumerDefaultHWM,
    backpressure = 'strict'
  } = options;
  validateInteger(highWaterMark, 'options.highWaterMark');
  validateBackpressure(backpressure);
  var opts = {
    __proto__: null,
    highWaterMark: clampHWM(highWaterMark),
    backpressure
  };
  return new SyncShareImpl(normalized, opts);
}
function isShareable(value) {
  return hasProtocol(value, shareProtocol);
}
function isSyncShareable(value) {
  return hasProtocol(value, shareSyncProtocol);
}
var Share = {
  __proto__: null,
  from(input, options) {
    if (isShareable(input)) {
      var result = input[shareProtocol](options);
      if (result === null || typeof result !== 'object') {
        throw new ERR_INVALID_RETURN_VALUE('an object', '[Symbol.for(\'Stream.shareProtocol\')]', result);
      }
      return result;
    }
    if (isAsyncIterable(input) || isSyncIterable(input)) {
      return share(input, options);
    }
    throw new ERR_INVALID_ARG_TYPE('input', ['Shareable', 'AsyncIterable', 'Iterable'], input);
  }
};
var SyncShare = {
  __proto__: null,
  fromSync(input, options) {
    if (isSyncShareable(input)) {
      var result = input[shareSyncProtocol](options);
      if (result === null || typeof result !== 'object') {
        throw new ERR_INVALID_RETURN_VALUE('an object', '[Symbol.for(\'Stream.shareSyncProtocol\')]', result);
      }
      return result;
    }
    if (isSyncIterable(input)) {
      return shareSync(input, options);
    }
    throw new ERR_INVALID_ARG_TYPE('input', ['SyncShareable', 'Iterable'], input);
  }
};
module.exports = {
  Share,
  SyncShare,
  share,
  shareSync
};

