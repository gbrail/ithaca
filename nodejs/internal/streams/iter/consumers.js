'use strict';

// New Streams API - Consumers & Utilities
//
// bytes(), text(), arrayBuffer() - collect entire stream
// tap(), tapSync() - observe without modifying
// merge() - temporal combining of sources
// ondrain() - backpressure drain utility
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
/**
 * Collect all chunks as an array from an async or sync source.
 * @param {AsyncIterable<Uint8Array[]>|Iterable<Uint8Array[]>} source
 * @param {{ signal?: AbortSignal, limit?: number }} [options]
 * @returns {Promise<Uint8Array[]>}
 */
var array = _async(function (source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateConsumerOptions(options);
  return collectAsync(source, options.signal, options.limit);
}); // =============================================================================
// Tap Utilities
// =============================================================================
/**
 * Create a pass-through transform that observes chunks without modifying them.
 * @param {Function} callback
 * @returns {Function}
 */
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
/**
 * Collect bytes as ArrayBuffer from an async or sync source.
 * @param {AsyncIterable<Uint8Array[]>|Iterable<Uint8Array[]>} source
 * @param {{ signal?: AbortSignal, limit?: number }} [options]
 * @returns {Promise<ArrayBuffer>}
 */
var arrayBuffer = _async(function (source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateConsumerOptions(options);
  return _await(collectAsync(source, options.signal, options.limit), function (chunks) {
    return toArrayBuffer(concatBytes(chunks));
  });
});
function _empty() {}
/**
 * Collect and decode text from an async or sync source.
 * @param {AsyncIterable<Uint8Array[]>|Iterable<Uint8Array[]>} source
 * @param {{ encoding?: string, signal?: AbortSignal, limit?: number }} [options]
 * @returns {Promise<string>}
 */
var text = _async(function (source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateConsumerOptions(options);
  return _await(collectAsync(source, options.signal, options.limit), function (chunks) {
    var data = concatBytes(chunks);
    var decoder = new TextDecoder(options.encoding ?? 'utf-8', {
      __proto__: null,
      fatal: true
    });
    return decoder.decode(data);
  });
});
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
// =============================================================================
// Async Consumers
// =============================================================================
/**
 * Collect all bytes from an async or sync source.
 * @param {AsyncIterable<Uint8Array[]>|Iterable<Uint8Array[]>} source
 * @param {{ signal?: AbortSignal, limit?: number }} [options]
 * @returns {Promise<Uint8Array>}
 */
var bytes = _async(function (source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateConsumerOptions(options);
  return _await(collectAsync(source, options.signal, options.limit), concatBytes);
});
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
/**
 * Collect chunks from an async or sync source into an array.
 * @param {AsyncIterable<Uint8Array[]>|Iterable<Uint8Array[]>} source
 * @param {AbortSignal} [signal]
 * @param {number} [limit]
 * @returns {Promise<Uint8Array[]>}
 */
var collectAsync = _async(function (source, signal, limit) {
  var _exit3 = false;
  signal?.throwIfAborted();

  // Normalize source via from() - accepts strings, ArrayBuffers, protocols, etc.
  var normalized = from(source);
  var chunks = [];

  // Fast path: no signal and no limit
  return _invoke(function () {
    if (!signal && limit === undefined) {
      return _continue(_forAwaitOf(normalized, function (batch) {
        for (var i = 0; i < batch.length; i++) {
          ArrayPrototypePush(chunks, batch[i]);
        }
      }), function () {
        _exit3 = true;
        return chunks;
      });
    }
  }, function (_result5) {
    var _exit4 = false;
    if (_exit3) return _result5;
    // Slow path: with signal or limit checks
    var totalBytes = 0;
    return _continue(_forAwaitOf(normalized, function (batch) {
      signal?.throwIfAborted();
      for (var i = 0; i < batch.length; i++) {
        var chunk = batch[i];
        if (limit !== undefined) {
          totalBytes += TypedArrayPrototypeGetByteLength(chunk);
          if (totalBytes > limit) {
            throw new ERR_OUT_OF_RANGE('totalBytes', `<= ${limit}`, totalBytes);
          }
        }
        ArrayPrototypePush(chunks, chunk);
      }
    }, function () {
      return _exit4;
    }), function (_result6) {
      return _exit4 ? _result6 : chunks;
    });
  });
});
/**
 * Convert a Uint8Array to its backing ArrayBuffer, slicing if necessary.
 * Handles both ArrayBuffer and SharedArrayBuffer backing stores.
 * @param {Uint8Array} data
 * @returns {ArrayBuffer|SharedArrayBuffer}
 */
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
var {
  ArrayBufferIsView,
  ArrayBufferPrototypeGetByteLength,
  ArrayBufferPrototypeSlice,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  Promise,
  PromisePrototypeThen,
  SafePromiseAllReturnVoid,
  SymbolAsyncIterator,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength,
  TypedArrayPrototypeGetByteOffset
} = primordials;
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
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
var {
  TextDecoder
} = require('internal/encoding');
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
var {
  validateAbortSignal,
  validateFunction,
  validateInteger,
  validateObject
} = require('internal/validators');
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var {
  from,
  fromSync,
  isAsyncIterable,
  isSyncIterable
} = require('internal/streams/iter/from');
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
var {
  concatBytes
} = require('internal/streams/iter/utils');
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
var {
  drainableProtocol,
  toAsyncStreamable,
  toStreamable
} = require('internal/streams/iter/types');
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var {
  isAnyArrayBuffer,
  isSharedArrayBuffer
} = require('internal/util/types');

// =============================================================================
// Type Guards
// =============================================================================

const _earlyReturn = /*#__PURE__*/{},
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
  }(); // =============================================================================
// Shared chunk collection helpers
// =============================================================================

/**
 * Collect chunks from a sync source into an array.
 * @param {Iterable<Uint8Array[]>} source
 * @param {number} [limit]
 * @returns {Uint8Array[]}
 */

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
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function isMergeOptions(value) {
  return value !== null && typeof value === 'object' && !ArrayBufferIsView(value) && typeof value[toStreamable] !== 'function' && typeof value[toAsyncStreamable] !== 'function' && !isAsyncIterable(value) && !isSyncIterable(value) && !isAnyArrayBuffer(value);
}
function collectSync(source, limit) {
  // Normalize source via fromSync() - accepts strings, ArrayBuffers, protocols, etc.
  var normalized = fromSync(source);
  var chunks = [];
  var totalBytes = 0;
  for (var batch of normalized) {
    for (var i = 0; i < batch.length; i++) {
      var chunk = batch[i];
      if (limit !== undefined) {
        totalBytes += TypedArrayPrototypeGetByteLength(chunk);
        if (totalBytes > limit) {
          throw new ERR_OUT_OF_RANGE('totalBytes', `<= ${limit}`, totalBytes);
        }
      }
      ArrayPrototypePush(chunks, chunk);
    }
  }
  return chunks;
}
function toArrayBuffer(data) {
  var byteOffset = TypedArrayPrototypeGetByteOffset(data);
  var byteLength = TypedArrayPrototypeGetByteLength(data);
  var buffer = TypedArrayPrototypeGetBuffer(data);
  // SharedArrayBuffer is not available in primordials, so use
  // direct property access for its byteLength and slice.
  if (isSharedArrayBuffer(buffer)) {
    if (byteOffset === 0 && byteLength === buffer.byteLength) {
      return buffer;
    }
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  if (byteOffset === 0 && byteLength === ArrayBufferPrototypeGetByteLength(buffer)) {
    return buffer;
  }
  return ArrayBufferPrototypeSlice(buffer, byteOffset, byteOffset + byteLength);
}

// =============================================================================
// Shared option validation
// =============================================================================

function validateBaseConsumerOptions(options) {
  validateObject(options, 'options');
  if (options.limit !== undefined) {
    validateInteger(options.limit, 'options.limit', 0);
  }
  if (options.encoding !== undefined) {
    if (typeof options.encoding !== 'string') {
      throw new ERR_INVALID_ARG_TYPE('options.encoding', 'string', options.encoding);
    }
    try {
      new TextDecoder(options.encoding);
    } catch {
      throw new ERR_INVALID_ARG_VALUE.RangeError('options.encoding', options.encoding);
    }
  }
}
function validateConsumerOptions(options) {
  validateBaseConsumerOptions(options);
  if (options.signal !== undefined) {
    validateAbortSignal(options.signal, 'options.signal');
  }
}
function validateSyncConsumerOptions(options) {
  validateBaseConsumerOptions(options);
}

// =============================================================================
// Sync Consumers
// =============================================================================

var kNullPrototype = {
  __proto__: null
};

/**
 * Collect all bytes from a sync source.
 * @param {Iterable<Uint8Array[]>} source
 * @param {{ limit?: number }} [options]
 * @returns {Uint8Array}
 */
function bytesSync(source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateSyncConsumerOptions(options);
  return concatBytes(collectSync(source, options.limit));
}

/**
 * Collect and decode text from a sync source.
 * @param {Iterable<Uint8Array[]>} source
 * @param {{ encoding?: string, limit?: number }} [options]
 * @returns {string}
 */
function textSync(source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateSyncConsumerOptions(options);
  var data = concatBytes(collectSync(source, options.limit));
  var decoder = new TextDecoder(options.encoding ?? 'utf-8', {
    __proto__: null,
    fatal: true
  });
  return decoder.decode(data);
}

/**
 * Collect bytes as ArrayBuffer from a sync source.
 * @param {Iterable<Uint8Array[]>} source
 * @param {{ limit?: number }} [options]
 * @returns {ArrayBuffer}
 */
function arrayBufferSync(source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateSyncConsumerOptions(options);
  return toArrayBuffer(concatBytes(collectSync(source, options.limit)));
}

/**
 * Collect all chunks as an array from a sync source.
 * @param {Iterable<Uint8Array[]>} source
 * @param {{ limit?: number }} [options]
 * @returns {Uint8Array[]}
 */
function arraySync(source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  validateSyncConsumerOptions(options);
  return collectSync(source, options.limit);
}
function tap(callback) {
  validateFunction(callback, 'callback');
  return _async(function (chunks, options) {
    return _await(callback(chunks, options), function () {
      return chunks;
    });
  });
}

/**
 * Create a sync pass-through transform that observes chunks.
 * @param {Function} callback
 * @returns {Function}
 */
function tapSync(callback) {
  validateFunction(callback, 'callback');
  return chunks => {
    callback(chunks);
    return chunks;
  };
}

// =============================================================================
// Drain Utility
// =============================================================================

/**
 * Wait for a drainable object's backpressure to clear.
 * @param {object} drainable
 * @returns {Promise<boolean>|null}
 */
function ondrain(drainable) {
  if (drainable === null || drainable === undefined || typeof drainable !== 'object') {
    return null;
  }
  if (!(drainableProtocol in drainable) || typeof drainable[drainableProtocol] !== 'function') {
    return null;
  }
  return drainable[drainableProtocol]();
}

// =============================================================================
// Merge Utility
// =============================================================================

/**
 * Merge multiple async iterables by yielding values in temporal order.
 * @param {...(AsyncIterable<Uint8Array[]>|object)} args
 * @returns {AsyncIterable<Uint8Array[]>}
 */
function merge() {
  var sources;
  var options;
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  if (args.length > 0 && isMergeOptions(args[args.length - 1])) {
    options = args[args.length - 1];
    sources = ArrayPrototypeSlice(args, 0, -1);
  } else {
    sources = args;
  }
  if (options?.signal !== undefined) {
    validateAbortSignal(options.signal, 'options.signal');
  }

  // Normalize each source via from()
  var normalized = ArrayPrototypeMap(sources, source => from(source));
  return {
    __proto__: null,
    [SymbolAsyncIterator]: function () {
      return new _AsyncGenerator(function (_generator) {
        var _exit = false;
        var signal = options?.signal;
        signal?.throwIfAborted();
        if (normalized.length === 0) return;
        return _invoke(function () {
          if (normalized.length === 1) {
            return _continue(_forAwaitOf(normalized[0], function (batch) {
              signal?.throwIfAborted();
              return _generator._yield(batch).then(_empty);
            }), function () {
              _exit = true;
            });
          }
        }, function (_result) {
          var _exit2 = false;
          if (_exit) return _result;
          // Multiple sources - use a ready queue so that batches that settle
          // between consumer pulls are drained synchronously without an extra
          // async tick per batch. Each source has at most one pending .next()
          // at a time. Every batch from every source is preserved.
          var ready = [];
          var activeCount = normalized.length;
          var waitResolve = null;

          // Called when a source's .next() settles. Pushes the result into
          // the ready queue and wakes the consumer if it's waiting.
          var onSettled = (iterator, result) => {
            if (result.done) {
              activeCount--;
            } else {
              ArrayPrototypePush(ready, result.value);
              // Immediately request the next value from this source
              // (at most one pending .next() per source)
              PromisePrototypeThen(iterator.next(), r => onSettled(iterator, r), err => {
                ArrayPrototypePush(ready, {
                  __proto__: null,
                  error: err
                });
                if (waitResolve) {
                  waitResolve();
                  waitResolve = null;
                }
              });
            }
            if (waitResolve) {
              waitResolve();
              waitResolve = null;
            }
          };

          // Start one .next() per source
          var iterators = [];
          var _loop = function () {
            var iterator = normalized[i][SymbolAsyncIterator]();
            ArrayPrototypePush(iterators, iterator);
            PromisePrototypeThen(iterator.next(), r => onSettled(iterator, r), err => {
              ArrayPrototypePush(ready, {
                __proto__: null,
                error: err
              });
              if (waitResolve) {
                waitResolve();
                waitResolve = null;
              }
            });
          };
          for (var i = 0; i < normalized.length; i++) {
            _loop();
          }
          return _finallyRethrows(function () {
            return _for(function () {
              return !_exit2 && (activeCount > 0 || ready.length > 0);
            }, void 0, function () {
              signal?.throwIfAborted();

              // Drain ready queue synchronously
              return _continue(_for(function () {
                return !_exit2 && ready.length > 0;
              }, void 0, function () {
                var item = ArrayPrototypeShift(ready);
                if (item?.error) {
                  throw item.error;
                }
                return _generator._yield(item).then(_empty);
              }), function (_result2) {
                return _exit2 ? _result2 : _invokeIgnored(function () {
                  if (activeCount > 0) {
                    return _awaitIgnored(new Promise(resolve => {
                      waitResolve = resolve;
                    }));
                  }
                });
              }); // If sources are still active, wait for the next settlement
            });
          }, function (_wasThrown, _result4) {
            // Clean up: return all iterators
            return _await(SafePromiseAllReturnVoid(iterators, _async(function (iterator) {
              return _invokeIgnored(function () {
                if (iterator.return) {
                  return _continueIgnored(_catch(function () {
                    return _awaitIgnored(iterator.return());
                  }, _empty));
                }
              });
            })), function () {
              return _rethrow(_wasThrown, _result4);
            });
          });
        });
      });
    }
  };
}
module.exports = {
  array,
  arrayBuffer,
  arrayBufferSync,
  arraySync,
  bytes,
  bytesSync,
  merge,
  ondrain,
  tap,
  tapSync,
  text,
  textSync
};

