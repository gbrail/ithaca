'use strict';

// New Streams API - Broadcast
//
// Push-model multi-consumer streaming. A single writer can push data to
// multiple consumers. Each consumer has an independent cursor into a
// shared buffer.
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator";
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
  }(),
  _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
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
var _writevSlow = _async(function (chunks, options) {
  var _this = this;
  var signal = options?.signal;

  // Check for pre-aborted
  signal?.throwIfAborted();
  if (_assertClassBrand(_BroadcastWriter_brand, _this, _isClosedOrAborted).call(_this)) {
    throw new ERR_INVALID_STATE.TypeError('Writer is closed');
  }
  var converted = convertChunks(chunks);
  if (_classPrivateFieldGet(_broadcast, _this)[kWrite](converted)) {
    for (var i = 0; i < converted.length; i++) {
      _classPrivateFieldSet(_totalBytes, _this, _classPrivateFieldGet(_totalBytes, _this) + TypedArrayPrototypeGetByteLength(converted[i]));
    }
    return;
  }
  var policy = _classPrivateFieldGet(_broadcast, _this).backpressurePolicy;
  var hwm = _classPrivateFieldGet(_broadcast, _this).highWaterMark;
  if (policy === 'strict') {
    if (_classPrivateFieldGet(_pendingWrites, _this).length >= hwm) {
      throw new ERR_INVALID_STATE.TypeError('Backpressure violation: too many pending writes. ' + 'Await each write() call to respect backpressure.');
    }
    return _assertClassBrand(_BroadcastWriter_brand, _this, _createPendingWrite).call(_this, converted, signal);
  }

  // 'block' policy
  return _assertClassBrand(_BroadcastWriter_brand, _this, _createPendingWrite).call(_this, converted, signal);
});
var {
  ArrayIsArray,
  ArrayPrototypePush,
  MathMax,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  PromiseWithResolvers,
  SafeSet,
  Symbol: _Symbol,
  SymbolAsyncDispose,
  SymbolAsyncIterator,
  SymbolDispose,
  TypedArrayPrototypeGetByteLength
} = primordials;
var {
  lazyDOMException
} = require('internal/util');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_RETURN_VALUE,
    ERR_INVALID_STATE
  }
} = require('internal/errors');
var {
  validateAbortSignal,
  validateInteger,
  validateObject
} = require('internal/validators');
var {
  broadcastProtocol,
  drainableProtocol
} = require('internal/streams/iter/types');
var {
  isAsyncIterable,
  isSyncIterable
} = require('internal/streams/iter/from');
var {
  pull: pullWithTransforms
} = require('internal/streams/iter/pull');
var {
  kMultiConsumerDefaultHWM,
  kResolvedPromise,
  clampHWM,
  convertChunks,
  getMinCursor,
  hasProtocol,
  onSignalAbort,
  parsePullArgs,
  wrapError,
  toUint8Array,
  validateBackpressure
} = require('internal/streams/iter/utils');
var {
  RingBuffer
} = require('internal/streams/iter/ringbuffer');
var kCancelWriter = _Symbol('kCancelWriter');
var kWrite = _Symbol('kWrite');
var kEnd = _Symbol('kEnd');
var kAbort = _Symbol('kAbort');
var kGetDesiredSize = _Symbol('kGetDesiredSize');
var kCanWrite = _Symbol('kCanWrite');
var kOnBufferDrained = _Symbol('kOnBufferDrained');

// =============================================================================
// Broadcast Implementation
// =============================================================================
var _buffer = /*#__PURE__*/new WeakMap();
var _bufferStart = /*#__PURE__*/new WeakMap();
var _consumers = /*#__PURE__*/new WeakMap();
var _waiters = /*#__PURE__*/new WeakMap();
var _ended = /*#__PURE__*/new WeakMap();
var _error = /*#__PURE__*/new WeakMap();
var _cancelled = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _writer = /*#__PURE__*/new WeakMap();
var _cachedMinCursor = /*#__PURE__*/new WeakMap();
var _cachedMinCursorConsumers = /*#__PURE__*/new WeakMap();
var _BroadcastImpl_brand = /*#__PURE__*/new WeakSet();
var BroadcastImpl = /*#__PURE__*/function () {
  function BroadcastImpl(options) {
    _classCallCheck(this, BroadcastImpl);
    _classPrivateMethodInitSpec(this, _BroadcastImpl_brand);
    _classPrivateFieldInitSpec(this, _buffer, new RingBuffer());
    _classPrivateFieldInitSpec(this, _bufferStart, 0);
    _classPrivateFieldInitSpec(this, _consumers, new SafeSet());
    _classPrivateFieldInitSpec(this, _waiters, []);
    // Consumers with pending resolve (subset of #consumers)
    _classPrivateFieldInitSpec(this, _ended, false);
    _classPrivateFieldInitSpec(this, _error, null);
    _classPrivateFieldInitSpec(this, _cancelled, false);
    _classPrivateFieldInitSpec(this, _options, void 0);
    _classPrivateFieldInitSpec(this, _writer, null);
    _classPrivateFieldInitSpec(this, _cachedMinCursor, 0);
    _classPrivateFieldInitSpec(this, _cachedMinCursorConsumers, 0);
    _classPrivateFieldSet(_options, this, options);
    this[kOnBufferDrained] = null;
  }
  return _createClass(BroadcastImpl, [{
    key: "setWriter",
    value: function setWriter(writer) {
      _classPrivateFieldSet(_writer, this, writer);
    }
  }, {
    key: "backpressurePolicy",
    get: function () {
      return _classPrivateFieldGet(_options, this).backpressure;
    }
  }, {
    key: "highWaterMark",
    get: function () {
      return _classPrivateFieldGet(_options, this).highWaterMark;
    }
  }, {
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
    key: "push",
    value: function push() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var {
        transforms,
        options
      } = parsePullArgs(args);
      var rawConsumer = _assertClassBrand(_BroadcastImpl_brand, this, _createRawConsumer).call(this);

      // When transforms are present, delegate to pull() which creates its
      // own internal AbortController that follows the external signal.
      // When no transforms, return rawConsumer directly (controller elided
      // per PULL-02 optimization -- no transforms means no signal recipient).
      if (transforms.length > 0) {
        var pullArgs = _toConsumableArray(transforms);
        if (options?.signal) {
          ArrayPrototypePush(pullArgs, {
            __proto__: null,
            signal: options.signal
          });
        }
        return pullWithTransforms.apply(void 0, [rawConsumer].concat(_toConsumableArray(pullArgs)));
      }
      return rawConsumer;
    }
  }, {
    key: "cancel",
    value: function cancel(reason) {
      if (_classPrivateFieldGet(_cancelled, this)) return;
      _classPrivateFieldSet(_cancelled, this, true);
      _classPrivateFieldSet(_ended, this, true); // Prevents [kAbort]() from redundantly iterating consumers

      if (reason !== undefined) {
        _classPrivateFieldSet(_error, this, reason);
      }

      // Reject pending writes on the writer so the pump doesn't hang
      _classPrivateFieldGet(_writer, this)?.[kCancelWriter]();
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
      _classPrivateFieldSet(_cachedMinCursorConsumers, this, 0);
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.cancel();
    }

    // Methods accessed by BroadcastWriter via symbol keys
  }, {
    key: kWrite,
    value: function (chunk) {
      var _this$bufferStart, _this$bufferStart2;
      if (_classPrivateFieldGet(_ended, this) || _classPrivateFieldGet(_cancelled, this)) return false;
      if (_classPrivateFieldGet(_buffer, this).length >= _classPrivateFieldGet(_options, this).highWaterMark) {
        switch (_classPrivateFieldGet(_options, this).backpressure) {
          case 'strict':
          case 'block':
            return false;
          case 'drop-oldest':
            _classPrivateFieldGet(_buffer, this).shift();
            _classPrivateFieldSet(_bufferStart, this, (_this$bufferStart = _classPrivateFieldGet(_bufferStart, this), _this$bufferStart2 = _this$bufferStart++, _this$bufferStart)), _this$bufferStart2;
            for (var consumer of _classPrivateFieldGet(_consumers, this)) {
              if (consumer.cursor < _classPrivateFieldGet(_bufferStart, this)) {
                _assertClassBrand(_BroadcastImpl_brand, this, _deleteConsumerFromMin).call(this, consumer);
                consumer.cursor = _classPrivateFieldGet(_bufferStart, this);
              }
            }
            _assertClassBrand(_BroadcastImpl_brand, this, _recomputeMinCursor).call(this);
            break;
          case 'drop-newest':
            return true;
        }
      }
      _classPrivateFieldGet(_buffer, this).push(chunk);
      _assertClassBrand(_BroadcastImpl_brand, this, _notifyConsumers).call(this);
      return true;
    }
  }, {
    key: kEnd,
    value: function () {
      if (_classPrivateFieldGet(_ended, this)) return;
      _classPrivateFieldSet(_ended, this, true);
      for (var consumer of _classPrivateFieldGet(_consumers, this)) {
        if (consumer.resolve) {
          var bufferIndex = consumer.cursor - _classPrivateFieldGet(_bufferStart, this);
          if (bufferIndex < _classPrivateFieldGet(_buffer, this).length) {
            var _this$cachedMinCursor3;
            var chunk = _classPrivateFieldGet(_buffer, this).get(bufferIndex);
            var cursor = consumer.cursor;
            consumer.cursor++;
            if (cursor === _classPrivateFieldGet(_cachedMinCursor, this) && _classPrivateFieldSet(_cachedMinCursorConsumers, this, (_this$cachedMinCursor3 = _classPrivateFieldGet(_cachedMinCursorConsumers, this), --_this$cachedMinCursor3)) === 0) {
              _assertClassBrand(_BroadcastImpl_brand, this, _tryTrimBuffer).call(this);
            }
            consumer.resolve({
              __proto__: null,
              done: false,
              value: chunk
            });
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
      }
    }
  }, {
    key: kAbort,
    value: function (reason) {
      if (_classPrivateFieldGet(_ended, this) || _classPrivateFieldGet(_error, this)) return;
      _classPrivateFieldSet(_error, this, reason);
      _classPrivateFieldSet(_ended, this, true);

      // Notify all waiting consumers and detach them
      for (var consumer of _classPrivateFieldGet(_consumers, this)) {
        if (consumer.reject) {
          consumer.reject(reason);
          consumer.resolve = null;
          consumer.reject = null;
        }
        consumer.detached = true;
      }
      _classPrivateFieldGet(_consumers, this).clear();
      _classPrivateFieldSet(_cachedMinCursorConsumers, this, 0);
    }
  }, {
    key: kGetDesiredSize,
    value: function () {
      if (_classPrivateFieldGet(_ended, this) || _classPrivateFieldGet(_cancelled, this)) return null;
      return MathMax(0, _classPrivateFieldGet(_options, this).highWaterMark - _classPrivateFieldGet(_buffer, this).length);
    }
  }, {
    key: kCanWrite,
    value: function () {
      if (_classPrivateFieldGet(_ended, this) || _classPrivateFieldGet(_cancelled, this)) return false;
      if ((_classPrivateFieldGet(_options, this).backpressure === 'strict' || _classPrivateFieldGet(_options, this).backpressure === 'block') && _classPrivateFieldGet(_buffer, this).length >= _classPrivateFieldGet(_options, this).highWaterMark) {
        return false;
      }
      return true;
    }

    // Private methods
  }]);
}(); // =============================================================================
// BroadcastWriter
// =============================================================================
function _createRawConsumer() {
  var state = {
    __proto__: null,
    // Start at the oldest buffered entry so late-joining consumers
    // can read data already in the buffer.
    cursor: _classPrivateFieldGet(_bufferStart, this),
    resolve: null,
    reject: null,
    detached: false
  };
  _classPrivateFieldGet(_consumers, this).add(state);
  if (_classPrivateFieldGet(_consumers, this).size === 1) {
    _classPrivateFieldSet(_cachedMinCursor, this, state.cursor);
    _classPrivateFieldSet(_cachedMinCursorConsumers, this, 1);
  } else if (state.cursor === _classPrivateFieldGet(_cachedMinCursor, this)) {
    var _this$cachedMinCursor, _this$cachedMinCursor2;
    _classPrivateFieldSet(_cachedMinCursorConsumers, this, (_this$cachedMinCursor = _classPrivateFieldGet(_cachedMinCursorConsumers, this), _this$cachedMinCursor2 = _this$cachedMinCursor++, _this$cachedMinCursor)), _this$cachedMinCursor2;
  } else {
    _assertClassBrand(_BroadcastImpl_brand, this, _recomputeMinCursor).call(this);
  }
  var self = this;
  var kDone = PromiseResolve({
    __proto__: null,
    done: true,
    value: undefined
  });
  function detach() {
    state.detached = true;
    state.resolve?.({
      __proto__: null,
      done: true,
      value: undefined
    });
    state.resolve = null;
    state.reject = null;
    if (_assertClassBrand(_BroadcastImpl_brand, self, _deleteConsumer).call(self, state)) {
      _assertClassBrand(_BroadcastImpl_brand, self, _tryTrimBuffer).call(self);
    }
  }
  return {
    __proto__: null,
    [SymbolAsyncIterator]() {
      return {
        __proto__: null,
        next() {
          if (state.detached) {
            if (_classPrivateFieldGet(_error, self)) return PromiseReject(_classPrivateFieldGet(_error, self));
            return kDone;
          }
          var bufferIndex = state.cursor - _classPrivateFieldGet(_bufferStart, self);
          if (bufferIndex < _classPrivateFieldGet(_buffer, self).length) {
            var _self$cachedMinCursor;
            var chunk = _classPrivateFieldGet(_buffer, self).get(bufferIndex);
            var cursor = state.cursor;
            state.cursor++;
            if (cursor === _classPrivateFieldGet(_cachedMinCursor, self) && _classPrivateFieldSet(_cachedMinCursorConsumers, self, (_self$cachedMinCursor = _classPrivateFieldGet(_cachedMinCursorConsumers, self), --_self$cachedMinCursor)) === 0) {
              _assertClassBrand(_BroadcastImpl_brand, self, _tryTrimBuffer).call(self);
            }
            return PromiseResolve({
              __proto__: null,
              done: false,
              value: chunk
            });
          }
          if (_classPrivateFieldGet(_error, self)) {
            state.detached = true;
            _assertClassBrand(_BroadcastImpl_brand, self, _deleteConsumer).call(self, state);
            return PromiseReject(_classPrivateFieldGet(_error, self));
          }
          if (_classPrivateFieldGet(_ended, self) || _classPrivateFieldGet(_cancelled, self)) {
            detach();
            return kDone;
          }
          var {
            promise,
            resolve,
            reject
          } = PromiseWithResolvers();
          state.resolve = resolve;
          state.reject = reject;
          ArrayPrototypePush(_classPrivateFieldGet(_waiters, self), state);
          return promise;
        },
        return() {
          detach();
          return kDone;
        },
        throw() {
          detach();
          return kDone;
        }
      };
    }
  };
}
function _recomputeMinCursor() {
  var {
    minCursor,
    minCursorConsumers
  } = getMinCursor(_classPrivateFieldGet(_consumers, this), _classPrivateFieldGet(_bufferStart, this) + _classPrivateFieldGet(_buffer, this).length);
  _classPrivateFieldSet(_cachedMinCursor, this, minCursor);
  _classPrivateFieldSet(_cachedMinCursorConsumers, this, minCursorConsumers);
}
function _tryTrimBuffer() {
  if (_classPrivateFieldGet(_cachedMinCursorConsumers, this) === 0) {
    _assertClassBrand(_BroadcastImpl_brand, this, _recomputeMinCursor).call(this);
  }
  var trimCount = _classPrivateFieldGet(_cachedMinCursor, this) - _classPrivateFieldGet(_bufferStart, this);
  if (trimCount > 0) {
    _classPrivateFieldGet(_buffer, this).trimFront(trimCount);
    _classPrivateFieldSet(_bufferStart, this, _classPrivateFieldGet(_cachedMinCursor, this));
    if (this[kOnBufferDrained] && _classPrivateFieldGet(_buffer, this).length < _classPrivateFieldGet(_options, this).highWaterMark) {
      this[kOnBufferDrained]();
    }
  }
}
function _notifyConsumers() {
  var waiters = _classPrivateFieldGet(_waiters, this);
  if (waiters.length === 0) return;
  // Swap out the waiters list so consumers that re-wait during
  // resolve don't get processed twice in this cycle.
  _classPrivateFieldSet(_waiters, this, []);
  for (var i = 0; i < waiters.length; i++) {
    var consumer = waiters[i];
    if (consumer.resolve) {
      var bufferIndex = consumer.cursor - _classPrivateFieldGet(_bufferStart, this);
      if (bufferIndex < _classPrivateFieldGet(_buffer, this).length) {
        var _this$cachedMinCursor4;
        var chunk = _classPrivateFieldGet(_buffer, this).get(bufferIndex);
        var cursor = consumer.cursor;
        consumer.cursor++;
        if (cursor === _classPrivateFieldGet(_cachedMinCursor, this) && _classPrivateFieldSet(_cachedMinCursorConsumers, this, (_this$cachedMinCursor4 = _classPrivateFieldGet(_cachedMinCursorConsumers, this), --_this$cachedMinCursor4)) === 0) {
          _assertClassBrand(_BroadcastImpl_brand, this, _tryTrimBuffer).call(this);
        }
        var resolve = consumer.resolve;
        consumer.resolve = null;
        consumer.reject = null;
        resolve({
          __proto__: null,
          done: false,
          value: chunk
        });
      } else {
        // Still waiting -- put back
        ArrayPrototypePush(_classPrivateFieldGet(_waiters, this), consumer);
      }
    }
  }
}
function _deleteConsumerFromMin(consumer) {
  if (consumer.cursor === _classPrivateFieldGet(_cachedMinCursor, this)) {
    var _this$cachedMinCursor5, _this$cachedMinCursor6;
    _classPrivateFieldSet(_cachedMinCursorConsumers, this, (_this$cachedMinCursor5 = _classPrivateFieldGet(_cachedMinCursorConsumers, this), _this$cachedMinCursor6 = _this$cachedMinCursor5--, _this$cachedMinCursor5)), _this$cachedMinCursor6;
    return _classPrivateFieldGet(_cachedMinCursorConsumers, this) === 0;
  }
  return false;
}
function _deleteConsumer(consumer) {
  if (_classPrivateFieldGet(_consumers, this).delete(consumer)) {
    return _assertClassBrand(_BroadcastImpl_brand, this, _deleteConsumerFromMin).call(this, consumer);
  }
  return false;
}
var getBroadcastPendingWrites;
var _broadcast = /*#__PURE__*/new WeakMap();
var _totalBytes = /*#__PURE__*/new WeakMap();
var _closed = /*#__PURE__*/new WeakMap();
var _aborted = /*#__PURE__*/new WeakMap();
var _pendingWrites = /*#__PURE__*/new WeakMap();
var _pendingDrains = /*#__PURE__*/new WeakMap();
var _BroadcastWriter_brand = /*#__PURE__*/new WeakSet();
var BroadcastWriter = /*#__PURE__*/function () {
  function BroadcastWriter(broadcastImpl) {
    _classCallCheck(this, BroadcastWriter);
    _classPrivateMethodInitSpec(this, _BroadcastWriter_brand);
    _classPrivateFieldInitSpec(this, _broadcast, void 0);
    _classPrivateFieldInitSpec(this, _totalBytes, 0);
    _classPrivateFieldInitSpec(this, _closed, void 0);
    _classPrivateFieldInitSpec(this, _aborted, false);
    _classPrivateFieldInitSpec(this, _pendingWrites, new RingBuffer());
    _classPrivateFieldInitSpec(this, _pendingDrains, []);
    _classPrivateFieldSet(_broadcast, this, broadcastImpl);
    _classPrivateFieldGet(_broadcast, this)[kOnBufferDrained] = () => {
      _assertClassBrand(_BroadcastWriter_brand, this, _resolvePendingWrites).call(this);
      _assertClassBrand(_BroadcastWriter_brand, this, _resolvePendingDrains).call(this, true);
    };
  }

  // The drainable protocol works with Stream.ondrain to provide a notification
  // when the writer can accept more data after being backpressured.
  return _createClass(BroadcastWriter, [{
    key: drainableProtocol,
    value: function () {
      var desired = this.desiredSize;
      if (desired === null) return null;
      if (desired > 0) return PromiseResolve(true);
      var {
        promise,
        resolve,
        reject
      } = PromiseWithResolvers();
      ArrayPrototypePush(_classPrivateFieldGet(_pendingDrains, this), {
        __proto__: null,
        resolve,
        reject
      });
      return promise;
    }
  }, {
    key: "desiredSize",
    get: function () {
      return _assertClassBrand(_BroadcastWriter_brand, this, _isClosedOrAborted).call(this) ? null : _classPrivateFieldGet(_broadcast, this)[kGetDesiredSize]();
    }
  }, {
    key: "write",
    value: function write(chunk, options) {
      // Fast path: no signal, writer open, buffer has space
      if (_assertClassBrand(_BroadcastWriter_brand, this, _canUseWriteFastPath).call(this, options)) {
        var converted = toUint8Array(chunk);
        _classPrivateFieldGet(_broadcast, this)[kWrite]([converted]);
        _classPrivateFieldSet(_totalBytes, this, _classPrivateFieldGet(_totalBytes, this) + TypedArrayPrototypeGetByteLength(converted));
        return kResolvedPromise;
      }
      return _assertClassBrand(_BroadcastWriter_brand, this, _writevSlow).call(this, [chunk], options);
    }
  }, {
    key: "writev",
    value: function writev(chunks, options) {
      if (!ArrayIsArray(chunks)) {
        throw new ERR_INVALID_ARG_TYPE('chunks', 'Array', chunks);
      }
      // Fast path: no signal, writer open, buffer has space
      if (_assertClassBrand(_BroadcastWriter_brand, this, _canUseWriteFastPath).call(this, options)) {
        var converted = convertChunks(chunks);
        _classPrivateFieldGet(_broadcast, this)[kWrite](converted);
        for (var i = 0; i < converted.length; i++) {
          _classPrivateFieldSet(_totalBytes, this, _classPrivateFieldGet(_totalBytes, this) + TypedArrayPrototypeGetByteLength(converted[i]));
        }
        return kResolvedPromise;
      }
      return _assertClassBrand(_BroadcastWriter_brand, this, _writevSlow).call(this, chunks, options);
    }
  }, {
    key: "writeSync",
    value: function writeSync(chunk) {
      if (_assertClassBrand(_BroadcastWriter_brand, this, _isClosedOrAborted).call(this)) return false;
      if (!_classPrivateFieldGet(_broadcast, this)[kCanWrite]()) return false;
      var converted = toUint8Array(chunk);
      if (_classPrivateFieldGet(_broadcast, this)[kWrite]([converted])) {
        _classPrivateFieldSet(_totalBytes, this, _classPrivateFieldGet(_totalBytes, this) + TypedArrayPrototypeGetByteLength(converted));
        return true;
      }
      return false;
    }
  }, {
    key: "writevSync",
    value: function writevSync(chunks) {
      if (!ArrayIsArray(chunks)) {
        throw new ERR_INVALID_ARG_TYPE('chunks', 'Array', chunks);
      }
      if (_assertClassBrand(_BroadcastWriter_brand, this, _isClosedOrAborted).call(this)) return false;
      if (!_classPrivateFieldGet(_broadcast, this)[kCanWrite]()) return false;
      var converted = convertChunks(chunks);
      if (_classPrivateFieldGet(_broadcast, this)[kWrite](converted)) {
        for (var i = 0; i < converted.length; i++) {
          _classPrivateFieldSet(_totalBytes, this, _classPrivateFieldGet(_totalBytes, this) + TypedArrayPrototypeGetByteLength(converted[i]));
        }
        return true;
      }
      return false;
    }

    // end() is synchronous internally - signal accepted for interface compliance.
  }, {
    key: "end",
    value: function end(options) {
      if (_assertClassBrand(_BroadcastWriter_brand, this, _isClosed).call(this)) return _classPrivateFieldGet(_closed, this);
      _classPrivateFieldSet(_closed, this, PromiseResolve(_classPrivateFieldGet(_totalBytes, this)));
      _classPrivateFieldGet(_broadcast, this)[kEnd]();
      _assertClassBrand(_BroadcastWriter_brand, this, _resolvePendingDrains).call(this, false);
      return _classPrivateFieldGet(_closed, this);
    }
  }, {
    key: "endSync",
    value: function endSync() {
      if (_classPrivateFieldGet(_closed, this)) return _classPrivateFieldGet(_totalBytes, this);
      _classPrivateFieldSet(_closed, this, PromiseResolve(_classPrivateFieldGet(_totalBytes, this)));
      _classPrivateFieldGet(_broadcast, this)[kEnd]();
      _assertClassBrand(_BroadcastWriter_brand, this, _resolvePendingDrains).call(this, false);
      return _classPrivateFieldGet(_totalBytes, this);
    }
  }, {
    key: "fail",
    value: function fail(reason) {
      if (_assertClassBrand(_BroadcastWriter_brand, this, _isClosedOrAborted).call(this)) return;
      _classPrivateFieldSet(_aborted, this, true);
      _classPrivateFieldSet(_closed, this, PromiseResolve(_classPrivateFieldGet(_totalBytes, this)));
      var error = reason ?? new ERR_INVALID_STATE.TypeError('Failed');
      _assertClassBrand(_BroadcastWriter_brand, this, _rejectPendingWrites).call(this, error);
      _assertClassBrand(_BroadcastWriter_brand, this, _rejectPendingDrains).call(this, error);
      _classPrivateFieldGet(_broadcast, this)[kAbort](error);
    }
  }, {
    key: SymbolAsyncDispose,
    value: function () {
      this.fail();
      return PromiseResolve();
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.fail();
    }
  }, {
    key: kCancelWriter,
    value: function () {
      if (_assertClassBrand(_BroadcastWriter_brand, this, _isClosed).call(this)) return;
      _classPrivateFieldSet(_closed, this, PromiseResolve(_classPrivateFieldGet(_totalBytes, this)));
      _assertClassBrand(_BroadcastWriter_brand, this, _rejectPendingWrites).call(this, lazyDOMException('Broadcast cancelled', 'AbortError'));
      _assertClassBrand(_BroadcastWriter_brand, this, _resolvePendingDrains).call(this, false);
    }

    /**
     * Create a pending write promise, optionally racing against a signal.
     * If the signal fires, the entry is removed from pendingWrites and the
     * promise rejects. Signal listeners are cleaned up on normal resolution.
     * @returns {Promise<void>}
     */
  }]);
}();
function _isClosed() {
  return _classPrivateFieldGet(_closed, this) !== undefined;
}
function _isClosedOrAborted() {
  return _assertClassBrand(_BroadcastWriter_brand, this, _isClosed).call(this) || _classPrivateFieldGet(_aborted, this);
}
function _canUseWriteFastPath(options) {
  return !options?.signal && !_assertClassBrand(_BroadcastWriter_brand, this, _isClosed).call(this) && !_classPrivateFieldGet(_aborted, this) && _classPrivateFieldGet(_broadcast, this)[kCanWrite]();
}
function _createPendingWrite(chunk, signal) {
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  var entry = {
    __proto__: null,
    chunk,
    resolve,
    reject
  };
  _classPrivateFieldGet(_pendingWrites, this).push(entry);
  if (signal) {
    wireBroadcastWriteSignal(entry, signal, resolve, reject, this);
  }
  return promise;
}
function _resolvePendingWrites() {
  while (_classPrivateFieldGet(_pendingWrites, this).length > 0 && _classPrivateFieldGet(_broadcast, this)[kCanWrite]()) {
    var pending = _classPrivateFieldGet(_pendingWrites, this).shift();
    if (_classPrivateFieldGet(_broadcast, this)[kWrite](pending.chunk)) {
      for (var i = 0; i < pending.chunk.length; i++) {
        _classPrivateFieldSet(_totalBytes, this, _classPrivateFieldGet(_totalBytes, this) + TypedArrayPrototypeGetByteLength(pending.chunk[i]));
      }
      pending.resolve();
    } else {
      _classPrivateFieldGet(_pendingWrites, this).unshift(pending);
      break;
    }
  }
}
function _rejectPendingWrites(error) {
  while (_classPrivateFieldGet(_pendingWrites, this).length > 0) {
    _classPrivateFieldGet(_pendingWrites, this).shift().reject(error);
  }
}
function _resolvePendingDrains(canWrite) {
  var drains = _classPrivateFieldGet(_pendingDrains, this);
  _classPrivateFieldSet(_pendingDrains, this, []);
  for (var i = 0; i < drains.length; i++) {
    drains[i].resolve(canWrite);
  }
}
function _rejectPendingDrains(error) {
  var drains = _classPrivateFieldGet(_pendingDrains, this);
  _classPrivateFieldSet(_pendingDrains, this, []);
  for (var i = 0; i < drains.length; i++) {
    drains[i].reject(error);
  }
}
// Used in wireBroadcastWriteSignal ensure the signal listener can be
// constructed without closing over the chunk data, which may be large.
getBroadcastPendingWrites = obj => _classPrivateFieldGet(_pendingWrites, obj);
function wireBroadcastWriteSignal(entry, signal, resolve, reject, self) {
  var onAbort = () => {
    var pendingWrites = getBroadcastPendingWrites(self);
    var idx = pendingWrites.indexOf(entry);
    if (idx !== -1) pendingWrites.removeAt(idx);
    entry.chunk = null;
    reject(signal.reason ?? lazyDOMException('Aborted', 'AbortError'));
  };
  entry.resolve = function () {
    signal.removeEventListener('abort', onAbort);
    entry.chunk = null;
    resolve();
  };
  entry.reject = function (reason) {
    signal.removeEventListener('abort', onAbort);
    entry.chunk = null;
    reject(reason);
  };
  signal.addEventListener('abort', onAbort, {
    __proto__: null,
    once: true
  });
}
function onBroadcastCancel(broadcastImpl, signal) {
  onSignalAbort(signal, () => broadcastImpl.cancel(signal.reason));
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Create a broadcast channel for push-model multi-consumer streaming.
 * @param {{ highWaterMark?: number, backpressure?: string, signal?: AbortSignal }} [options]
 * @returns {{ writer: Writer, broadcast: Broadcast }}
 */
function broadcast() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    __proto__: null
  };
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
  var broadcastImpl = new BroadcastImpl(opts);
  var writer = new BroadcastWriter(broadcastImpl);
  broadcastImpl.setWriter(writer);
  if (signal) {
    onBroadcastCancel(broadcastImpl, signal);
  }
  return {
    __proto__: null,
    writer,
    broadcast: broadcastImpl
  };
}
function isBroadcastable(value) {
  return hasProtocol(value, broadcastProtocol);
}
var Broadcast = {
  __proto__: null,
  from(input, options) {
    if (isBroadcastable(input)) {
      var bc = input[broadcastProtocol](options);
      if (bc === null || typeof bc !== 'object') {
        throw new ERR_INVALID_RETURN_VALUE('an object', '[Symbol.for(\'Stream.broadcastProtocol\')]', bc);
      }
      return {
        __proto__: null,
        writer: {
          __proto__: null
        },
        broadcast: bc
      };
    }
    if (!isAsyncIterable(input) && !isSyncIterable(input)) {
      throw new ERR_INVALID_ARG_TYPE('input', ['Broadcastable', 'AsyncIterable', 'Iterable'], input);
    }
    var result = broadcast(options);
    var signal = options?.signal;
    var pump = _async(function () {
      var w = result.writer;
      return _continueIgnored(_catch(function () {
        return _invoke(function () {
          if (isAsyncIterable(input)) {
            return _continueIgnored(_forAwaitOf(input, function (chunks) {
              signal?.throwIfAborted();
              return _invokeIgnored(function () {
                if (ArrayIsArray(chunks)) {
                  return _invokeIgnored(function () {
                    if (!w.writevSync(chunks)) {
                      return _awaitIgnored(w.writev(chunks, signal ? {
                        signal
                      } : undefined));
                    }
                  });
                } else return _invokeIgnored(function () {
                  if (!w.writeSync(chunks)) {
                    return _awaitIgnored(w.write(chunks, signal ? {
                      signal
                    } : undefined));
                  }
                });
              });
            }));
          } else return _invokeIgnored(function () {
            if (isSyncIterable(input)) {
              return _continueIgnored(_forOf(input, function (chunks) {
                signal?.throwIfAborted();
                return _invokeIgnored(function () {
                  if (ArrayIsArray(chunks)) {
                    return _invokeIgnored(function () {
                      if (!w.writevSync(chunks)) {
                        return _awaitIgnored(w.writev(chunks, signal ? {
                          signal
                        } : undefined));
                      }
                    });
                  } else return _invokeIgnored(function () {
                    if (!w.writeSync(chunks)) {
                      return _awaitIgnored(w.write(chunks, signal ? {
                        signal
                      } : undefined));
                    }
                  });
                });
              }));
            }
          });
        }, function () {
          return _invokeIgnored(function () {
            if (w.endSync() < 0) {
              return _awaitIgnored(w.end(signal ? {
                signal
              } : undefined));
            }
          });
        });
      }, function (error) {
        w.fail(wrapError(error));
      }));
    });
    PromisePrototypeThen(pump(), undefined, () => {});
    return result;
  }
};
module.exports = {
  Broadcast,
  broadcast
};

