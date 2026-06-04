'use strict';

// New Streams API - Push Stream Implementation
//
// Creates a bonded pair of writer and async iterable for push-based streaming
// with built-in backpressure.
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
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
var {
  ArrayIsArray,
  ArrayPrototypePush,
  MathMax,
  PromiseReject,
  PromiseResolve,
  PromiseWithResolvers,
  SymbolAsyncDispose,
  SymbolAsyncIterator,
  SymbolDispose,
  TypedArrayPrototypeGetByteLength
} = primordials;
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_STATE
  }
} = require('internal/errors');
var {
  isError,
  lazyDOMException
} = require('internal/util');
var {
  validateAbortSignal,
  validateInteger
} = require('internal/validators');
var {
  drainableProtocol,
  kSyncWriteAccepted,
  kSyncWriteAcceptedOnFalse
} = require('internal/streams/iter/types');
var {
  kPushDefaultHWM,
  kResolvedPromise,
  clampHWM,
  onSignalAbort,
  toUint8Array,
  convertChunks,
  parsePullArgs,
  validateBackpressure
} = require('internal/streams/iter/utils');
var {
  pull: pullWithTransforms
} = require('internal/streams/iter/pull');
var {
  RingBuffer
} = require('internal/streams/iter/ringbuffer');

// =============================================================================
// PushQueue - Internal Queue with Chunk-Based Backpressure
// =============================================================================
var _slots = /*#__PURE__*/new WeakMap();
var _pendingWrites = /*#__PURE__*/new WeakMap();
var _pendingReads = /*#__PURE__*/new WeakMap();
var _pendingDrains = /*#__PURE__*/new WeakMap();
var _writerState = /*#__PURE__*/new WeakMap();
var _consumerState = /*#__PURE__*/new WeakMap();
var _error = /*#__PURE__*/new WeakMap();
var _bytesWritten = /*#__PURE__*/new WeakMap();
var _pendingEnd = /*#__PURE__*/new WeakMap();
var _highWaterMark = /*#__PURE__*/new WeakMap();
var _backpressure = /*#__PURE__*/new WeakMap();
var _signal = /*#__PURE__*/new WeakMap();
var _abortHandler = /*#__PURE__*/new WeakMap();
var _PushQueue_brand = /*#__PURE__*/new WeakSet();
var PushQueue = /*#__PURE__*/function () {
  function PushQueue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      __proto__: null
    };
    _classCallCheck(this, PushQueue);
    /**
     * Create a pending write promise, optionally racing against a signal.
     * If the signal fires, the entry is removed from pendingWrites and the
     * promise rejects. Signal listeners are cleaned up on normal resolution.
     * @returns {Promise<void>}
     */
    _classPrivateMethodInitSpec(this, _PushQueue_brand);
    /** Buffered chunks (each slot is from one write/writev call) */
    _classPrivateFieldInitSpec(this, _slots, new RingBuffer());
    /** Pending writes waiting for buffer space */
    _classPrivateFieldInitSpec(this, _pendingWrites, new RingBuffer());
    /** Pending reads waiting for data */
    _classPrivateFieldInitSpec(this, _pendingReads, new RingBuffer());
    /** Pending drains waiting for backpressure to clear */
    _classPrivateFieldInitSpec(this, _pendingDrains, []);
    /** Writer state: 'open' | 'closing' | 'closed' | 'errored' */
    _classPrivateFieldInitSpec(this, _writerState, 'open');
    /** Consumer state: 'active' | 'returned' | 'thrown' */
    _classPrivateFieldInitSpec(this, _consumerState, 'active');
    /** Error that closed the stream */
    _classPrivateFieldInitSpec(this, _error, null);
    /** Total bytes written */
    _classPrivateFieldInitSpec(this, _bytesWritten, 0);
    /** Pending end promise (resolves when consumer drains past end sentinel) */
    _classPrivateFieldInitSpec(this, _pendingEnd, null);
    /** Configuration */
    _classPrivateFieldInitSpec(this, _highWaterMark, void 0);
    _classPrivateFieldInitSpec(this, _backpressure, void 0);
    _classPrivateFieldInitSpec(this, _signal, void 0);
    _classPrivateFieldInitSpec(this, _abortHandler, void 0);
    var {
      highWaterMark = kPushDefaultHWM,
      backpressure = 'strict',
      signal: _signal2
    } = options;
    validateInteger(highWaterMark, 'options.highWaterMark');
    validateBackpressure(backpressure);
    if (_signal2 !== undefined) {
      validateAbortSignal(_signal2, 'options.signal');
    }
    _classPrivateFieldSet(_highWaterMark, this, clampHWM(highWaterMark));
    _classPrivateFieldSet(_backpressure, this, backpressure);
    _classPrivateFieldSet(_signal, this, _signal2);
    _classPrivateFieldSet(_abortHandler, this, undefined);
    if (_classPrivateFieldGet(_signal, this)) {
      _classPrivateFieldSet(_abortHandler, this, () => {
        this.fail(isError(_classPrivateFieldGet(_signal, this).reason) ? _classPrivateFieldGet(_signal, this).reason : lazyDOMException('Aborted', 'AbortError'));
      });
      onSignalAbort(_classPrivateFieldGet(_signal, this), _classPrivateFieldGet(_abortHandler, this));
    }
  }

  // ===========================================================================
  // Writer Methods
  // ===========================================================================

  /**
   * Get slots available before hitting highWaterMark.
   * Returns null if writer is closed/errored or consumer has terminated.
   * @returns {number | null}
   */
  return _createClass(PushQueue, [{
    key: "desiredSize",
    get: function () {
      if (_classPrivateFieldGet(_writerState, this) !== 'open' || _classPrivateFieldGet(_consumerState, this) !== 'active') {
        return null;
      }
      return MathMax(0, _classPrivateFieldGet(_highWaterMark, this) - _classPrivateFieldGet(_slots, this).length);
    }

    /**
     * Check if a sync write would be accepted.
     * @returns {boolean}
     */
  }, {
    key: "canWriteSync",
    value: function canWriteSync() {
      if (_classPrivateFieldGet(_writerState, this) !== 'open') return false;
      if (_classPrivateFieldGet(_consumerState, this) !== 'active') return false;
      if ((_classPrivateFieldGet(_backpressure, this) === 'strict' || _classPrivateFieldGet(_backpressure, this) === 'block') && _classPrivateFieldGet(_slots, this).length >= _classPrivateFieldGet(_highWaterMark, this)) {
        return false;
      }
      return true;
    }

    /**
     * Write chunks synchronously if possible.
     * Returns true if write completed, false if buffer is full.
     * @returns {boolean}
     */
  }, {
    key: "writeSync",
    value: function writeSync(chunks) {
      if (_classPrivateFieldGet(_writerState, this) !== 'open') return false;
      if (_classPrivateFieldGet(_consumerState, this) !== 'active') return false;
      if (_classPrivateFieldGet(_slots, this).length >= _classPrivateFieldGet(_highWaterMark, this)) {
        switch (_classPrivateFieldGet(_backpressure, this)) {
          case 'strict':
            return false;
          case 'block':
            return false;
          case 'drop-oldest':
            if (_classPrivateFieldGet(_slots, this).length > 0) {
              _classPrivateFieldGet(_slots, this).shift();
            }
            break;
          case 'drop-newest':
            // Discard this write, but return true
            for (var i = 0; i < chunks.length; i++) {
              _classPrivateFieldSet(_bytesWritten, this, _classPrivateFieldGet(_bytesWritten, this) + TypedArrayPrototypeGetByteLength(chunks[i]));
            }
            return true;
        }
      }
      _classPrivateFieldGet(_slots, this).push(chunks);
      for (var _i = 0; _i < chunks.length; _i++) {
        _classPrivateFieldSet(_bytesWritten, this, _classPrivateFieldGet(_bytesWritten, this) + TypedArrayPrototypeGetByteLength(chunks[_i]));
      }
      _assertClassBrand(_PushQueue_brand, this, _resolvePendingReads).call(this);
      return true;
    }

    /**
     * Write chunks asynchronously.
     * If signal is provided, a write blocked on backpressure will reject
     * immediately when the signal fires. The cancelled write is removed from
     * pendingWrites so it does not occupy a slot. The queue itself is NOT put
     * into an error state - this is per-operation cancellation, not terminal
     * failure.
     * @returns {Promise<void>}
     */
  }, {
    key: "writeAsync",
    value: function writeAsync(chunks, signal) {
      try {
        var _this = this;
        // Check writer state before signal (spec order: state, then signal)
        if (_classPrivateFieldGet(_writerState, _this) === 'closed') {
          throw new ERR_INVALID_STATE.TypeError('Writer is closed');
        }
        if (_classPrivateFieldGet(_writerState, _this) === 'closing') {
          throw new ERR_INVALID_STATE.TypeError('Writer is closing');
        }
        if (_classPrivateFieldGet(_writerState, _this) === 'errored') {
          throw _classPrivateFieldGet(_error, _this);
        }
        if (_classPrivateFieldGet(_consumerState, _this) !== 'active') {
          throw _classPrivateFieldGet(_consumerState, _this) === 'thrown' && _classPrivateFieldGet(_error, _this) ? _classPrivateFieldGet(_error, _this) : new ERR_INVALID_STATE.TypeError('Stream closed by consumer');
        }

        // Check for pre-aborted signal (after state checks per spec)
        signal?.throwIfAborted();

        // Try sync first
        if (_this.writeSync(chunks)) {
          return _await();
        }

        // Buffer is full
        switch (_classPrivateFieldGet(_backpressure, _this)) {
          case 'strict':
            if (_classPrivateFieldGet(_pendingWrites, _this).length >= _classPrivateFieldGet(_highWaterMark, _this)) {
              throw new ERR_INVALID_STATE.RangeError('Backpressure violation: too many pending writes. ' + 'Await each write() call to respect backpressure.');
            }
            return _await(_assertClassBrand(_PushQueue_brand, _this, _createPendingWrite).call(_this, chunks, signal));
          case 'block':
            return _await(_assertClassBrand(_PushQueue_brand, _this, _createPendingWrite).call(_this, chunks, signal));
          default:
            throw new ERR_INVALID_STATE('Unexpected: writeSync should have handled non-strict policy');
        }
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "end",
    value:
    /**
     * Signal end of stream. Returns total bytes written.
     * @returns {number}
     */
    function end() {
      if (_classPrivateFieldGet(_writerState, this) === 'errored') {
        return -2; // Signal to reject with stored error
      }
      if (_classPrivateFieldGet(_writerState, this) === 'closing') {
        return -3; // Signal to PushWriter: wait for drain to complete
      }
      if (_classPrivateFieldGet(_writerState, this) === 'closed') {
        return _classPrivateFieldGet(_bytesWritten, this); // Idempotent
      }
      _assertClassBrand(_PushQueue_brand, this, _cleanup).call(this);
      _assertClassBrand(_PushQueue_brand, this, _rejectPendingWrites).call(this, new ERR_INVALID_STATE.TypeError('Writer closed'));
      _assertClassBrand(_PushQueue_brand, this, _resolvePendingDrains).call(this, false);

      // If buffer is empty, close immediately
      if (_classPrivateFieldGet(_slots, this).length === 0) {
        _classPrivateFieldSet(_writerState, this, 'closed');
        _assertClassBrand(_PushQueue_brand, this, _resolvePendingReads).call(this);
        return _classPrivateFieldGet(_bytesWritten, this);
      }

      // Buffer has data: transition to closing, defer completion until drained
      _classPrivateFieldSet(_writerState, this, 'closing');
      return -3; // Signal to PushWriter: create deferred end promise
    }

    /**
     * Called by the read path when the consumer has drained all data while
     * the writer is in the 'closing' state. Transitions to 'closed' and
     * resolves the pending end promise.
     */
  }, {
    key: "endDrained",
    value: function endDrained() {
      if (_classPrivateFieldGet(_writerState, this) !== 'closing') return;
      _classPrivateFieldSet(_writerState, this, 'closed');
      if (_classPrivateFieldGet(_pendingEnd, this)) {
        _classPrivateFieldGet(_pendingEnd, this).resolve(_classPrivateFieldGet(_bytesWritten, this));
        _classPrivateFieldSet(_pendingEnd, this, null);
      }
    }

    /**
     * Put queue into terminal error state.
     * No-op if errored or closed (fully drained).
     * If closing (draining), short-circuits the drain.
     */
  }, {
    key: "fail",
    value: function fail(reason) {
      if (_classPrivateFieldGet(_writerState, this) === 'errored' || _classPrivateFieldGet(_writerState, this) === 'closed') {
        return;
      }
      var wasClosing = _classPrivateFieldGet(_writerState, this) === 'closing';
      _classPrivateFieldSet(_writerState, this, 'errored');
      _classPrivateFieldSet(_error, this, reason ?? new ERR_INVALID_STATE('Failed'));
      _assertClassBrand(_PushQueue_brand, this, _cleanup).call(this);
      _assertClassBrand(_PushQueue_brand, this, _rejectPendingReads).call(this, _classPrivateFieldGet(_error, this));
      _assertClassBrand(_PushQueue_brand, this, _rejectPendingDrains).call(this, _classPrivateFieldGet(_error, this));
      if (wasClosing) {
        // Short-circuit the graceful drain: reject the pending end promise
        if (_classPrivateFieldGet(_pendingEnd, this)) {
          _classPrivateFieldGet(_pendingEnd, this).reject(_classPrivateFieldGet(_error, this));
          _classPrivateFieldSet(_pendingEnd, this, null);
        }
      } else {
        _assertClassBrand(_PushQueue_brand, this, _rejectPendingWrites).call(this, _classPrivateFieldGet(_error, this));
      }
    }
  }, {
    key: "totalBytesWritten",
    get: function () {
      return _classPrivateFieldGet(_bytesWritten, this);
    }
  }, {
    key: "error",
    get: function () {
      return _classPrivateFieldGet(_error, this);
    }
  }, {
    key: "backpressurePolicy",
    get: function () {
      return _classPrivateFieldGet(_backpressure, this);
    }
  }, {
    key: "writerState",
    get: function () {
      return _classPrivateFieldGet(_writerState, this);
    }
  }, {
    key: "pendingEndPromise",
    get: function () {
      return _classPrivateFieldGet(_pendingEnd, this)?.promise ?? null;
    }
  }, {
    key: "setPendingEnd",
    value: function setPendingEnd(pending) {
      _classPrivateFieldSet(_pendingEnd, this, pending);
    }

    /**
     * Force-enqueue chunks into the slots buffer, bypassing capacity checks.
     * Used by PushWriter.writeSync() for 'block' policy where the data is
     * accepted but false is returned as a backpressure signal.
     */
  }, {
    key: "forceEnqueue",
    value: function forceEnqueue(chunks) {
      _classPrivateFieldGet(_slots, this).push(chunks);
      for (var i = 0; i < chunks.length; i++) {
        _classPrivateFieldSet(_bytesWritten, this, _classPrivateFieldGet(_bytesWritten, this) + TypedArrayPrototypeGetByteLength(chunks[i]));
      }
      _assertClassBrand(_PushQueue_brand, this, _resolvePendingReads).call(this);
    }

    /**
     * Wait for backpressure to clear (desiredSize > 0).
     * @returns {Promise<void>}
     */
  }, {
    key: "waitForDrain",
    value: function waitForDrain() {
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

    // ===========================================================================
    // Consumer Methods
    // ===========================================================================
  }, {
    key: "read",
    value: function read() {
      try {
        var _this2 = this;
        // If there's data in the buffer, return it immediately
        if (_classPrivateFieldGet(_slots, _this2).length > 0) {
          var result = _assertClassBrand(_PushQueue_brand, _this2, _drain).call(_this2);
          _assertClassBrand(_PushQueue_brand, _this2, _resolvePendingWrites).call(_this2);
          // After draining, check if writer was closing and buffer is now empty
          if (_classPrivateFieldGet(_writerState, _this2) === 'closing' && _classPrivateFieldGet(_slots, _this2).length === 0) {
            _this2.endDrained();
          }
          return _await({
            __proto__: null,
            done: false,
            value: result
          });
        }

        // Buffer empty and writer closing = drain complete
        if (_classPrivateFieldGet(_writerState, _this2) === 'closing') {
          _this2.endDrained();
          return _await({
            __proto__: null,
            done: true,
            value: undefined
          });
        }
        if (_classPrivateFieldGet(_writerState, _this2) === 'closed') {
          return _await({
            __proto__: null,
            done: true,
            value: undefined
          });
        }
        if (_classPrivateFieldGet(_writerState, _this2) === 'errored' && _classPrivateFieldGet(_error, _this2)) {
          throw _classPrivateFieldGet(_error, _this2);
        }
        var {
          promise,
          resolve,
          reject
        } = PromiseWithResolvers();
        _classPrivateFieldGet(_pendingReads, _this2).push({
          __proto__: null,
          resolve,
          reject
        });
        return _await(promise);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "consumerReturn",
    value: function consumerReturn() {
      if (_classPrivateFieldGet(_consumerState, this) !== 'active') return;
      _classPrivateFieldSet(_consumerState, this, 'returned');
      _assertClassBrand(_PushQueue_brand, this, _cleanup).call(this);
      _assertClassBrand(_PushQueue_brand, this, _resolvePendingReads).call(this);
      _assertClassBrand(_PushQueue_brand, this, _rejectPendingWrites).call(this, new ERR_INVALID_STATE.TypeError('Stream closed by consumer'));
      // If closing, reject the pending end promise
      if (_classPrivateFieldGet(_writerState, this) === 'closing' && _classPrivateFieldGet(_pendingEnd, this)) {
        _classPrivateFieldGet(_pendingEnd, this).reject(new ERR_INVALID_STATE.TypeError('Stream closed by consumer'));
        _classPrivateFieldSet(_pendingEnd, this, null);
      }
      // Resolve pending drains with false - no more data will be consumed
      _assertClassBrand(_PushQueue_brand, this, _resolvePendingDrains).call(this, false);
    }
  }, {
    key: "consumerThrow",
    value: function consumerThrow(error) {
      if (_classPrivateFieldGet(_consumerState, this) !== 'active') return;
      _classPrivateFieldSet(_consumerState, this, 'thrown');
      _classPrivateFieldSet(_error, this, error);
      _assertClassBrand(_PushQueue_brand, this, _cleanup).call(this);
      _assertClassBrand(_PushQueue_brand, this, _rejectPendingReads).call(this, error);
      _assertClassBrand(_PushQueue_brand, this, _rejectPendingWrites).call(this, error);
      if (_classPrivateFieldGet(_writerState, this) === 'closing' && _classPrivateFieldGet(_pendingEnd, this)) {
        _classPrivateFieldGet(_pendingEnd, this).reject(error);
        _classPrivateFieldSet(_pendingEnd, this, null);
      }
      // Reject pending drains - the consumer errored
      _assertClassBrand(_PushQueue_brand, this, _rejectPendingDrains).call(this, error);
    }

    // ===========================================================================
    // Private Methods
    // ===========================================================================
  }]);
}(); // =============================================================================
// PushWriter Implementation
// =============================================================================
function _createPendingWrite(chunks, signal) {
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  var entry = {
    __proto__: null,
    chunks,
    resolve,
    reject
  };
  _classPrivateFieldGet(_pendingWrites, this).push(entry);
  if (signal) {
    var onAbort = () => {
      // Remove from queue so it doesn't occupy a slot
      var idx = _classPrivateFieldGet(_pendingWrites, this).indexOf(entry);
      if (idx !== -1) _classPrivateFieldGet(_pendingWrites, this).removeAt(idx);
      reject(signal.reason ?? lazyDOMException('Aborted', 'AbortError'));
    };

    // Wrap resolve/reject to clean up signal listener
    entry.resolve = function () {
      signal.removeEventListener('abort', onAbort);
      resolve();
    };
    entry.reject = function (reason) {
      signal.removeEventListener('abort', onAbort);
      reject(reason);
    };
    signal.addEventListener('abort', onAbort, {
      __proto__: null,
      once: true
    });
  }
  return promise;
}
function _drain() {
  if (_classPrivateFieldGet(_slots, this).length === 1) {
    return _classPrivateFieldGet(_slots, this).shift();
  }
  var result = [];
  for (var i = 0; i < _classPrivateFieldGet(_slots, this).length; i++) {
    var slot = _classPrivateFieldGet(_slots, this).get(i);
    for (var j = 0; j < slot.length; j++) {
      ArrayPrototypePush(result, slot[j]);
    }
  }
  _classPrivateFieldGet(_slots, this).clear();
  return result;
}
function _resolvePendingReads() {
  while (_classPrivateFieldGet(_pendingReads, this).length > 0) {
    if (_classPrivateFieldGet(_slots, this).length > 0) {
      var pending = _classPrivateFieldGet(_pendingReads, this).shift();
      var result = _assertClassBrand(_PushQueue_brand, this, _drain).call(this);
      _assertClassBrand(_PushQueue_brand, this, _resolvePendingWrites).call(this);
      pending.resolve({
        __proto__: null,
        done: false,
        value: result
      });
    } else if (_classPrivateFieldGet(_writerState, this) === 'closing' && _classPrivateFieldGet(_slots, this).length === 0) {
      this.endDrained();
      var _pending = _classPrivateFieldGet(_pendingReads, this).shift();
      _pending.resolve({
        __proto__: null,
        done: true,
        value: undefined
      });
    } else if (_classPrivateFieldGet(_writerState, this) === 'closed') {
      var _pending2 = _classPrivateFieldGet(_pendingReads, this).shift();
      _pending2.resolve({
        __proto__: null,
        done: true,
        value: undefined
      });
    } else if (_classPrivateFieldGet(_writerState, this) === 'errored' && _classPrivateFieldGet(_error, this)) {
      var _pending3 = _classPrivateFieldGet(_pendingReads, this).shift();
      _pending3.reject(_classPrivateFieldGet(_error, this));
    } else if (_classPrivateFieldGet(_consumerState, this) === 'returned') {
      var _pending4 = _classPrivateFieldGet(_pendingReads, this).shift();
      _pending4.resolve({
        __proto__: null,
        done: true,
        value: undefined
      });
    } else {
      break;
    }
  }
}
function _resolvePendingWrites() {
  while (_classPrivateFieldGet(_pendingWrites, this).length > 0 && _classPrivateFieldGet(_slots, this).length < _classPrivateFieldGet(_highWaterMark, this)) {
    var pending = _classPrivateFieldGet(_pendingWrites, this).shift();
    _classPrivateFieldGet(_slots, this).push(pending.chunks);
    for (var i = 0; i < pending.chunks.length; i++) {
      _classPrivateFieldSet(_bytesWritten, this, _classPrivateFieldGet(_bytesWritten, this) + TypedArrayPrototypeGetByteLength(pending.chunks[i]));
    }
    pending.resolve();
  }
  if (_classPrivateFieldGet(_slots, this).length < _classPrivateFieldGet(_highWaterMark, this)) {
    _assertClassBrand(_PushQueue_brand, this, _resolvePendingDrains).call(this, true);
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
function _rejectPendingReads(error) {
  while (_classPrivateFieldGet(_pendingReads, this).length > 0) {
    _classPrivateFieldGet(_pendingReads, this).shift().reject(error);
  }
}
function _rejectPendingWrites(error) {
  while (_classPrivateFieldGet(_pendingWrites, this).length > 0) {
    _classPrivateFieldGet(_pendingWrites, this).shift().reject(error);
  }
}
function _cleanup() {
  if (_classPrivateFieldGet(_signal, this) && _classPrivateFieldGet(_abortHandler, this)) {
    _classPrivateFieldGet(_signal, this).removeEventListener('abort', _classPrivateFieldGet(_abortHandler, this));
    _classPrivateFieldSet(_abortHandler, this, undefined);
  }
}
var _queue = /*#__PURE__*/new WeakMap();
var _syncWriteAccepted = /*#__PURE__*/new WeakMap();
var PushWriter = /*#__PURE__*/function () {
  function PushWriter(queue) {
    _classCallCheck(this, PushWriter);
    _classPrivateFieldInitSpec(this, _queue, void 0);
    _classPrivateFieldInitSpec(this, _syncWriteAccepted, false);
    _classPrivateFieldSet(_queue, this, queue);
  }
  return _createClass(PushWriter, [{
    key: kSyncWriteAccepted,
    value: function () {
      return _classPrivateFieldGet(_syncWriteAccepted, this);
    }
  }, {
    key: drainableProtocol,
    value: function () {
      var desired = this.desiredSize;
      if (desired === null) return null;
      if (desired > 0) return PromiseResolve(true);
      return _classPrivateFieldGet(_queue, this).waitForDrain();
    }
  }, {
    key: "desiredSize",
    get: function () {
      return _classPrivateFieldGet(_queue, this).desiredSize;
    }
  }, {
    key: kSyncWriteAcceptedOnFalse,
    get: function () {
      return _classPrivateFieldGet(_queue, this).backpressurePolicy === 'block';
    }
  }, {
    key: "write",
    value: function write(chunk, options) {
      if (!options?.signal && _classPrivateFieldGet(_queue, this).canWriteSync()) {
        var _bytes = toUint8Array(chunk);
        _classPrivateFieldGet(_queue, this).writeSync([_bytes]);
        return kResolvedPromise;
      }
      var bytes = toUint8Array(chunk);
      return _classPrivateFieldGet(_queue, this).writeAsync([bytes], options?.signal);
    }
  }, {
    key: "writev",
    value: function writev(chunks, options) {
      if (!ArrayIsArray(chunks)) {
        throw new ERR_INVALID_ARG_TYPE('chunks', 'Array', chunks);
      }
      if (!options?.signal && _classPrivateFieldGet(_queue, this).canWriteSync()) {
        var _bytes2 = convertChunks(chunks);
        _classPrivateFieldGet(_queue, this).writeSync(_bytes2);
        return kResolvedPromise;
      }
      var bytes = convertChunks(chunks);
      return _classPrivateFieldGet(_queue, this).writeAsync(bytes, options?.signal);
    }
  }, {
    key: "writeSync",
    value: function writeSync(chunk) {
      _classPrivateFieldSet(_syncWriteAccepted, this, false);
      var bytes = toUint8Array(chunk);
      var result = _classPrivateFieldGet(_queue, this).writeSync([bytes]);
      if (!result && _classPrivateFieldGet(_queue, this).backpressurePolicy === 'block' && _classPrivateFieldGet(_queue, this).desiredSize === 0) {
        // Block policy: force-enqueue and return false as backpressure signal.
        // Data IS accepted; false tells caller to slow down.
        _classPrivateFieldGet(_queue, this).forceEnqueue([bytes]);
        _classPrivateFieldSet(_syncWriteAccepted, this, true);
        return false;
      }
      _classPrivateFieldSet(_syncWriteAccepted, this, result);
      return result;
    }
  }, {
    key: "writevSync",
    value: function writevSync(chunks) {
      _classPrivateFieldSet(_syncWriteAccepted, this, false);
      if (!ArrayIsArray(chunks)) {
        throw new ERR_INVALID_ARG_TYPE('chunks', 'Array', chunks);
      }
      var bytes = convertChunks(chunks);
      var result = _classPrivateFieldGet(_queue, this).writeSync(bytes);
      if (!result && _classPrivateFieldGet(_queue, this).backpressurePolicy === 'block' && _classPrivateFieldGet(_queue, this).desiredSize === 0) {
        _classPrivateFieldGet(_queue, this).forceEnqueue(bytes);
        _classPrivateFieldSet(_syncWriteAccepted, this, true);
        return false;
      }
      _classPrivateFieldSet(_syncWriteAccepted, this, result);
      return result;
    }
  }, {
    key: "end",
    value: function end(options) {
      var result = _classPrivateFieldGet(_queue, this).end();
      if (result === -2) {
        // Errored: reject with stored error
        return PromiseReject(_classPrivateFieldGet(_queue, this).error);
      }
      if (result === -3) {
        // Closing: buffer has data, create deferred promise that resolves
        // when consumer drains past the end sentinel
        var pendingEndPromise = _classPrivateFieldGet(_queue, this).pendingEndPromise;
        if (pendingEndPromise !== null) {
          return pendingEndPromise;
        }
        var {
          promise,
          resolve,
          reject
        } = PromiseWithResolvers();
        _classPrivateFieldGet(_queue, this).setPendingEnd({
          __proto__: null,
          promise,
          resolve,
          reject
        });
        return promise;
      }
      // >= 0: byte count (immediate close or idempotent)
      return PromiseResolve(result);
    }
  }, {
    key: "endSync",
    value: function endSync() {
      var result = _classPrivateFieldGet(_queue, this).end();
      if (result === -2) return -1; // Errored
      if (result === -3) return -1; // Buffer not empty, can't wait
      return result;
    }
  }, {
    key: "fail",
    value: function fail(reason) {
      _classPrivateFieldGet(_queue, this).fail(reason);
    }
  }, {
    key: SymbolAsyncDispose,
    value: function () {
      var state = _classPrivateFieldGet(_queue, this).writerState;
      if (state === 'closing') {
        // Wait for graceful drain
        return _classPrivateFieldGet(_queue, this).pendingEndPromise ?? PromiseResolve();
      }
      if (state === 'open') {
        this.fail();
      }
      return PromiseResolve();
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.fail();
    }
  }]);
}(); // =============================================================================
// Readable Implementation
// =============================================================================
function createReadable(queue) {
  return {
    __proto__: null,
    [SymbolAsyncIterator]() {
      return {
        __proto__: null,
        next: _async(function () {
          return queue.read();
        }),
        return: _async(function () {
          queue.consumerReturn();
          return {
            __proto__: null,
            done: true,
            value: undefined
          };
        }),
        throw: _async(function (error) {
          queue.consumerThrow(error);
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

// =============================================================================
// Stream.push() Factory
// =============================================================================

function parseArgs(args) {
  var result = parsePullArgs(args);
  // PushQueue constructor requires a non-undefined options object.
  if (result.options === undefined) {
    result.options = {
      __proto__: null
    };
  }
  return result;
}

/**
 * Create a push stream with optional transforms.
 * @param {...(Function|object)} args - Transforms, then options (optional)
 * @returns {{ writer: Writer, readable: AsyncIterable<Uint8Array[]> }}
 */
function push() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  var {
    transforms,
    options
  } = parseArgs(args);
  var queue = new PushQueue(options);
  var writer = new PushWriter(queue);
  var rawReadable = createReadable(queue);

  // Apply transforms lazily if provided
  var readable;
  if (transforms.length > 0) {
    if (options.signal) {
      readable = pullWithTransforms.apply(void 0, [rawReadable].concat(_toConsumableArray(transforms), [{
        __proto__: null,
        signal: options.signal
      }]));
    } else {
      readable = pullWithTransforms.apply(void 0, [rawReadable].concat(_toConsumableArray(transforms)));
    }
  } else {
    readable = rawReadable;
  }
  return {
    __proto__: null,
    writer,
    readable
  };
}
module.exports = {
  push
};

