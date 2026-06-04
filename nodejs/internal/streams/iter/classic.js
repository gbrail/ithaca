'use strict';

// Interop utilities between classic Node.js streams and the stream/iter API.
//
// These are Node.js-specific (not part of the stream/iter spec) and are
// exported from 'stream/iter' as top-level utility functions:
//
//   fromReadable(readable)       -- classic Readable (or duck-type) -> stream/iter source
//   fromWritable(writable, opts) -- classic Writable (or duck-type) -> stream/iter Writer
//   toReadable(source, opts)     -- stream/iter source -> classic Readable
//   toReadableSync(source, opts) -- stream/iter source (sync) -> classic Readable
//   toWritable(writer)           -- stream/iter Writer -> classic Writable
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var createBatchedAsyncIterator = function (stream, normalize) {
  return new _AsyncGenerator(function (_generator) {
    var _exit3 = false;
    function next(resolve) {
      if (this === stream) {
        callback();
        callback = nop;
      } else {
        callback = resolve;
      }
    }
    var callback = nop;
    stream.on('readable', next);
    var error;
    var cleanup = eos(stream, {
      writable: false
    }, err => {
      error = err ? aggregateTwoErrors(error, err) : null;
      callback();
      callback = nop;
    });
    return _finallyRethrows(function () {
      return _catchInGenerator(function () {
        return _for(function () {
          return !_exit3;
        }, void 0, function () {
          var chunk = stream.destroyed ? null : stream.read();
          return function () {
            if (chunk !== null) {
              var _batch = [chunk];
              while (_batch.length < MAX_DRAIN_BATCH && stream._readableState?.length > 0) {
                var c = stream.read();
                if (c === null) break;
                ArrayPrototypePush(_batch, c);
              }
              return _invokeIgnored(function () {
                if (normalize !== null) {
                  return _await(normalize(_batch), function (result) {
                    return _invokeIgnored(function () {
                      if (result !== null) {
                        return _generator._yield(result).then(_empty);
                      }
                    });
                  });
                } else {
                  return _generator._yield(_batch).then(_empty);
                }
              });
            } else return function () {
              if (error) {
                throw error;
              } else return function () {
                if (error === null) {
                  _exit3 = true;
                } else {
                  return _awaitIgnored(new Promise(next));
                }
              }();
            }();
          }();
        });
      }, function (err) {
        error = aggregateTwoErrors(error, err);
        throw error;
      });
    }, function (_wasThrown, _result9) {
      if (error === undefined || stream._readableState?.autoDestroy) {
        destroyImpl.destroyer(stream, null);
      } else {
        stream.off('readable', next);
        cleanup();
      }
      return _rethrow(_wasThrown, _result9);
    });
  });
};
/**
 * Convert a classic Readable (or duck-type) to a stream/iter async iterable.
 *
 * If the object implements the toAsyncStreamable protocol, delegates to it.
 * Otherwise, duck-type checks for read() + EventEmitter (on/off) and
 * wraps with a batched async iterator.
 * @param {object} readable - A classic Readable or duck-type with
 *   read() and on()/off() methods.
 * @returns {AsyncIterable<Uint8Array[]>} A stream/iter async iterable source.
 */
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
// Normalize a batch of raw chunks from an object-mode or encoded
// Readable into Uint8Array values. Returns the normalized batch,
// or null if normalization produced no output.
var normalizeBatch = _async(function (raw) {
  var batch = [];
  return _continue(_forTo(raw, function (i) {
    var value = raw[i];
    return _invokeIgnored(function () {
      if (isUint8Array(value)) {
        ArrayPrototypePush(batch, value);
      } else {
        // normalizeAsyncValue may await for async protocols (e.g.
        // toAsyncStreamable on yielded objects). Stream events during
        // the suspension are queued, not lost -- errors will surface
        // on the next loop iteration after this yield completes.
        return _continueIgnored(_forAwaitOf(normalizeAsyncValue(value), function (normalized) {
          ArrayPrototypePush(batch, normalized);
        }));
      }
    });
  }), function () {
    return batch.length > 0 ? batch : null;
  });
}); // Batched async iterator for Readable streams. Same mechanism as
// createAsyncIterator (same event setup, same stream.read() to
// trigger _read(), same teardown) but drains all currently buffered
// chunks into a single Uint8Array[] batch per yield, amortizing the
// Promise/microtask cost across multiple chunks.
//
// When normalize is provided (object-mode / encoded streams), each
// drained batch is passed through it to convert chunks to Uint8Array.
// When normalize is null (byte-mode), chunks are already Buffers
// (Uint8Array subclass) and are yielded directly.
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
var {
  ArrayIsArray,
  ArrayPrototypePush,
  MathMax,
  NumberMAX_SAFE_INTEGER,
  Promise,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  PromiseWithResolvers,
  SafeMap,
  SafeWeakMap,
  SymbolAsyncDispose,
  SymbolAsyncIterator,
  SymbolDispose,
  SymbolIterator,
  TypedArrayPrototypeGetByteLength
} = primordials;
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
  AbortError,
  aggregateTwoErrors,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE,
    ERR_STREAM_WRITE_AFTER_END
  }
} = require('internal/errors');
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
var {
  validateInteger,
  validateObject
} = require('internal/validators');
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
var {
  eos
} = require('internal/streams/end-of-stream');
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator",
  _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
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
var {
  addAbortSignal: addAbortSignalNoValidate
} = require('internal/streams/add-abort-signal');
function _empty() {}
var {
  queueMicrotask
} = require('internal/process/task_queues');
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
var {
  toAsyncStreamable: kToAsyncStreamable,
  kValidatedSource,
  kSyncWriteAccepted,
  drainableProtocol
} = require('internal/streams/iter/types');
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var {
  validateBackpressure,
  toUint8Array
} = require('internal/streams/iter/utils');
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
var {
  Buffer
} = require('buffer');
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
var destroyImpl = require('internal/streams/destroy');

// Lazy-loaded to avoid circular dependencies. Readable and Writable
// both require this module's parent, so we defer the require.
var _earlyReturn = /*#__PURE__*/{};
function _catchInGenerator(body, recover) {
  return _catch(body, function (e) {
    if (e === _earlyReturn) {
      throw e;
    }
    return recover(e);
  });
}
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
var Readable;
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
var Writable;
const _AsyncGenerator = /*#__PURE__*/function () {
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
    const _this = this;
    return _this._promise = new Promise(function (resolve) {
      const _pact = _this._pact;
      if (_pact === null) {
        const _entry = _this._entry;
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
              const pact = new _Pact();
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
    const _this = this;
    return _this._promise = new Promise(function (resolve) {
      const _pact = _this._pact;
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
    const _this = this;
    return _this._promise = new Promise(function (resolve, reject) {
      const _pact = _this._pact;
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
function lazyReadable() {
  if (Readable === undefined) {
    Readable = require('internal/streams/readable');
  }
  return Readable;
}
function lazyWritable() {
  if (Writable === undefined) {
    Writable = require('internal/streams/writable');
  }
  return Writable;
}

// ============================================================================
// fromReadable(readable) -- classic Readable -> stream/iter async iterable
// ============================================================================

// Cache: one stream/iter source per Readable instance.
var fromReadableCache = new SafeWeakMap();

// Maximum chunks to drain into a single batch. Bounds peak memory when
// _read() synchronously pushes many chunks into the buffer.
var MAX_DRAIN_BATCH = 128;
var {
  normalizeAsyncValue
} = require('internal/streams/iter/from');
var {
  isUint8Array
} = require('internal/util/types');
var nop = () => {};
function fromReadable(readable) {
  if (readable == null || typeof readable !== 'object') {
    throw new ERR_INVALID_ARG_TYPE('readable', 'Readable', readable);
  }

  // Check cache first.
  var cached = fromReadableCache.get(readable);
  if (cached !== undefined) return cached;

  // Protocol path: object implements toAsyncStreamable.
  if (typeof readable[kToAsyncStreamable] === 'function') {
    var result = readable[kToAsyncStreamable]();
    fromReadableCache.set(readable, result);
    return result;
  }

  // Duck-type path: object has read() and EventEmitter methods.
  if (typeof readable.read !== 'function' || typeof readable.on !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('readable', 'Readable', readable);
  }

  // Determine normalization. If the stream has _readableState, use it
  // to detect object-mode / encoding. Otherwise assume byte-mode.
  var state = readable._readableState;
  var normalize = state && (state.objectMode || state.encoding) ? normalizeBatch : null;
  var iter = createBatchedAsyncIterator(readable, normalize);
  iter[kValidatedSource] = true;
  iter.stream = readable;
  fromReadableCache.set(readable, iter);
  return iter;
}

// ============================================================================
// toReadable(source, options) -- stream/iter source -> classic Readable
// ============================================================================

var kNullPrototype = {
  __proto__: null
};

/**
 * Create a byte-mode Readable from an AsyncIterable<Uint8Array[]>.
 * The source must yield Uint8Array[] batches (the stream/iter native
 * format). Each Uint8Array in a batch is pushed as a separate chunk.
 * @param {AsyncIterable<Uint8Array[]>} source
 * @param {object} [options]
 * @param {number} [options.highWaterMark]
 * @param {AbortSignal} [options.signal]
 * @returns {stream.Readable}
 */
function toReadable(source) {
  var pump = _async(function () {
    var _exit = false;
    return _catch(function () {
      return _for(function () {
        return !_exit && !done;
      }, void 0, function () {
        return _await(iterator.next(), function (_ref) {
          var _exit2 = false;
          var {
            value: batch,
            done: iterDone
          } = _ref;
          if (iterDone) {
            done = true;
            readable.push(null);
            _exit = true;
            return;
          }
          return _forTo(batch, function (i) {
            return function () {
              if (!readable.push(batch[i])) {
                backpressure = PromiseWithResolvers();
                return _await(backpressure.promise, function () {
                  if (done) {
                    _exit = true;
                  }
                });
              }
            }();
          }, function () {
            return _exit2;
          });
        });
      });
    }, function (err) {
      done = true;
      readable.destroy(err);
    });
  });
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  if (typeof source?.[SymbolAsyncIterator] !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('source', 'AsyncIterable', source);
  }
  validateObject(options, 'options');
  var {
    highWaterMark = 64 * 1024,
    signal
  } = options;
  validateInteger(highWaterMark, 'options.highWaterMark', 0);
  var ReadableCtor = lazyReadable();
  var iterator = source[SymbolAsyncIterator]();
  var backpressure;
  var pumping = false;
  var done = false;
  var readable = new ReadableCtor({
    __proto__: null,
    highWaterMark,
    read() {
      if (backpressure) {
        var {
          resolve
        } = backpressure;
        backpressure = null;
        resolve();
      } else if (!pumping && !done) {
        pumping = true;
        pump();
      }
    },
    destroy(err, cb) {
      done = true;
      // Wake up the pump if it's waiting on backpressure so it
      // can see done === true and exit cleanly.
      if (backpressure) {
        backpressure.resolve();
        backpressure = null;
      }
      if (typeof iterator.return === 'function') {
        PromisePrototypeThen(iterator.return(), () => cb(err), e => cb(e || err));
      } else {
        cb(err);
      }
    }
  });
  if (signal) {
    addAbortSignalNoValidate(signal, readable);
  }
  return readable;
}

// ============================================================================
// toReadableSync(source, options) -- stream/iter source (sync) -> Readable
// ============================================================================

/**
 * Create a byte-mode Readable from an Iterable<Uint8Array[]>.
 * Fully synchronous -- _read() pulls from the iterator directly.
 * @param {Iterable<Uint8Array[]>} source
 * @param {object} [options]
 * @param {number} [options.highWaterMark]
 * @returns {stream.Readable}
 */
function toReadableSync(source) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  if (typeof source?.[SymbolIterator] !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('source', 'Iterable', source);
  }
  validateObject(options, 'options');
  var {
    highWaterMark = 64 * 1024
  } = options;
  validateInteger(highWaterMark, 'options.highWaterMark', 0);
  var ReadableCtor = lazyReadable();
  var iterator = source[SymbolIterator]();
  var hasBatch = false;
  var batch;
  var batchIndex = 0;
  return new ReadableCtor({
    __proto__: null,
    highWaterMark,
    read() {
      for (;;) {
        if (hasBatch) {
          while (batchIndex < batch.length) {
            if (!this.push(batch[batchIndex++])) return;
          }
          batch = undefined;
          hasBatch = false;
          batchIndex = 0;
        }
        var result = iterator.next();
        var {
          done
        } = result;
        if (done) {
          this.push(null);
          return;
        }
        batch = result.value;
        hasBatch = true;
      }
    },
    destroy(err, cb) {
      batch = undefined;
      hasBatch = false;
      if (typeof iterator.return === 'function') iterator.return();
      cb(err);
    }
  });
}

// ============================================================================
// fromWritable(writable, options) -- classic Writable -> stream/iter Writer
// ============================================================================

// Cache: one Writer adapter per Writable instance.
var fromWritableCache = new SafeWeakMap();

/**
 * Create a stream/iter Writer adapter from a classic Writable (or duck-type).
 *
 * Duck-type requirements: write() and on()/off() methods.
 * Falls back to sensible defaults for missing properties like
 * writableHighWaterMark, writableLength, writableObjectMode.
 * @param {object} writable - A classic Writable or duck-type.
 * @param {object} [options]
 * @param {string} [options.backpressure] - 'strict', 'block',
 *   'drop-newest'. 'drop-oldest' is not supported.
 * @returns {object} A stream/iter Writer adapter.
 */
function fromWritable(writable) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototype;
  if (writable == null || typeof writable.write !== 'function' || typeof writable.on !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('writable', 'Writable', writable);
  }
  validateObject(options, 'options');
  var {
    backpressure = 'strict'
  } = options;
  validateBackpressure(backpressure);

  // The Writer interface is bytes-only. Object-mode Writables expect
  // arbitrary JS values, which is incompatible.
  if (writable.writableObjectMode) {
    throw new ERR_INVALID_STATE('Cannot create a stream/iter Writer from an object-mode Writable');
  }

  // drop-oldest is not supported for classic stream.Writable. The
  // Writable's internal buffer stores individual { chunk, encoding,
  // callback } entries with no concept of batch boundaries. A writev()
  // call fans out into N separate buffer entries, so a subsequent
  // drop-oldest eviction could partially tear apart an earlier atomic
  // writev batch. The PushWriter avoids this because writev occupies a
  // single slot. Supporting drop-oldest here would require either
  // accepting partial writev eviction or adding batch tracking to the
  // buffer -- neither is acceptable without a deeper rework of Writable
  // internals.
  if (backpressure === 'drop-oldest') {
    throw new ERR_INVALID_ARG_VALUE('options.backpressure', backpressure, 'drop-oldest is not supported for classic stream.Writable');
  }

  // Return cached adapter if available. Backpressure policy changes writer
  // behavior, so cache one adapter per policy.
  var cachedByBackpressure = fromWritableCache.get(writable);
  if (cachedByBackpressure !== undefined) {
    var cached = cachedByBackpressure.get(backpressure);
    if (cached !== undefined) return cached;
  } else {
    cachedByBackpressure = new SafeMap();
    fromWritableCache.set(writable, cachedByBackpressure);
  }

  // Fall back to sensible defaults for duck-typed streams that may not
  // expose the full stream.Writable property set.
  var hwm = writable.writableHighWaterMark ?? 16384;
  var totalBytes = 0;

  // Waiters pending on backpressure resolution (block policy only).
  // Multiple un-awaited writes can each add a waiter, so this must be
  // a list. A single persistent 'drain' listener and 'error' listener
  // (installed once lazily) resolve or reject all waiters to avoid
  // accumulating per-write listeners on the stream.
  var waiters = [];
  var listenersInstalled = false;
  var onDrain;
  var onError;
  function installListeners() {
    if (listenersInstalled) return;
    listenersInstalled = true;
    onDrain = () => {
      var pending = waiters;
      waiters = [];
      for (var _i = 0; _i < pending.length; _i++) {
        pending[_i].resolve();
      }
    };
    onError = err => {
      var pending = waiters;
      waiters = [];
      for (var _i2 = 0; _i2 < pending.length; _i2++) {
        pending[_i2].reject(err);
      }
    };
    writable.on('drain', onDrain);
    writable.on('error', onError);
  }

  // Reject all pending waiters and remove the drain/error listeners.
  function cleanup(err) {
    var pending = waiters;
    waiters = [];
    for (var _i3 = 0; _i3 < pending.length; _i3++) {
      pending[_i3].reject(err ?? new AbortError());
    }
    if (!listenersInstalled) return;
    listenersInstalled = false;
    writable.removeListener('drain', onDrain);
    writable.removeListener('error', onError);
  }
  function waitForDrain() {
    var {
      promise,
      resolve,
      reject
    } = PromiseWithResolvers();
    ArrayPrototypePush(waiters, {
      __proto__: null,
      resolve,
      reject
    });
    installListeners();
    return promise;
  }
  function isWritable() {
    // Duck-typed streams may not have these properties -- treat missing
    // as false (i.e., writable is still open).
    return !(writable.destroyed ?? false) && !(writable.writableFinished ?? false) && !(writable.writableEnded ?? false);
  }
  function isFull() {
    return (writable.writableLength ?? 0) >= hwm;
  }
  function writeChunks(chunks) {
    var ok = true;
    for (var _i4 = 0; _i4 < chunks.length; _i4++) {
      var bytes = toUint8Array(chunks[_i4]);
      totalBytes += TypedArrayPrototypeGetByteLength(bytes);
      ok = writable.write(bytes);
    }
    return ok;
  }
  var writer = {
    __proto__: null,
    get desiredSize() {
      if (!isWritable()) return null;
      return MathMax(0, hwm - (writable.writableLength ?? 0));
    },
    writeSync(chunk) {
      return false;
    },
    writevSync(chunks) {
      return false;
    },
    // Backpressure semantics: write() resolves when the data is accepted
    // into the Writable's internal buffer, NOT when _write() has flushed
    // it to the underlying resource. This matches the Writer spec -- the
    // PushWriter resolves on buffer acceptance too. Classic Writable flow
    // control works the same way: write rapidly until write() returns
    // false, then wait for 'drain'. The _write callback is involved in
    // backpressure indirectly -- 'drain' fires after callbacks drain the
    // buffer below highWaterMark. Per-write errors from _write surface
    // as 'error' events caught by our generic error handler, rejecting
    // the next pending operation rather than the already-resolved one.
    //
    // The options.signal parameter from the Writer interface is ignored.
    // Classic stream.Writable has no per-write abort signal support;
    // cancellation should be handled at the pipeline level instead.
    write(chunk) {
      if (!isWritable()) {
        return PromiseReject(new ERR_STREAM_WRITE_AFTER_END());
      }
      var bytes;
      try {
        bytes = toUint8Array(chunk);
      } catch (err) {
        return PromiseReject(err);
      }
      if (backpressure === 'strict' && isFull()) {
        return PromiseReject(new ERR_INVALID_STATE.RangeError('Backpressure violation: buffer is full. ' + 'Await each write() call to respect backpressure.'));
      }
      if (backpressure === 'drop-newest' && isFull()) {
        // Silently discard. Still count bytes for consistency with
        // PushWriter, which counts dropped bytes in totalBytes.
        totalBytes += TypedArrayPrototypeGetByteLength(bytes);
        return PromiseResolve();
      }
      totalBytes += TypedArrayPrototypeGetByteLength(bytes);
      var ok = writable.write(bytes);
      if (ok) return PromiseResolve();

      // backpressure === 'block' (or strict with room that filled on
      // this write -- writable.write() accepted the data but returned
      // false indicating the buffer is now at/over hwm).
      if (backpressure === 'block') {
        return waitForDrain();
      }

      // strict: the write was accepted (there was room before writing)
      // but the buffer is now full. Resolve -- the *next* write will
      // be rejected if the caller ignores backpressure.
      return PromiseResolve();
    },
    writev(chunks) {
      if (!ArrayIsArray(chunks)) {
        throw new ERR_INVALID_ARG_TYPE('chunks', 'Array', chunks);
      }
      if (!isWritable()) {
        return PromiseReject(new ERR_STREAM_WRITE_AFTER_END());
      }
      if (backpressure === 'strict' && isFull()) {
        return PromiseReject(new ERR_INVALID_STATE.RangeError('Backpressure violation: buffer is full. ' + 'Await each write() call to respect backpressure.'));
      }
      if (backpressure === 'drop-newest' && isFull()) {
        // Discard entire batch.
        for (var _i5 = 0; _i5 < chunks.length; _i5++) {
          totalBytes += TypedArrayPrototypeGetByteLength(toUint8Array(chunks[_i5]));
        }
        return PromiseResolve();
      }
      var ok = true;
      if (typeof writable.cork === 'function' && typeof writable.uncork === 'function') {
        writable.cork();
        try {
          ok = writeChunks(chunks);
        } finally {
          writable.uncork();
        }
      } else {
        ok = writeChunks(chunks);
      }
      if (ok) return PromiseResolve();
      if (backpressure === 'block') {
        return waitForDrain();
      }
      return PromiseResolve();
    },
    endSync() {
      return -1;
    },
    // options.signal is ignored for the same reason as write().
    end() {
      if ((writable.writableFinished ?? false) || (writable.destroyed ?? false)) {
        cleanup();
        return PromiseResolve(totalBytes);
      }
      var {
        promise,
        resolve,
        reject
      } = PromiseWithResolvers();
      if (!(writable.writableEnded ?? false)) {
        writable.end();
      }
      eos(writable, {
        writable: true,
        readable: false
      }, err => {
        cleanup(err);
        if (err) reject(err);else resolve(totalBytes);
      });
      return promise;
    },
    fail(reason) {
      cleanup(reason);
      if (typeof writable.destroy === 'function') {
        writable.destroy(reason);
      }
    },
    [SymbolAsyncDispose]() {
      if (isWritable()) {
        cleanup();
        if (typeof writable.destroy === 'function') {
          writable.destroy();
        }
      }
      return PromiseResolve();
    },
    [SymbolDispose]() {
      if (isWritable()) {
        cleanup();
        if (typeof writable.destroy === 'function') {
          writable.destroy();
        }
      }
    }
  };

  // drainableProtocol
  writer[drainableProtocol] = function () {
    if (!isWritable()) return null;
    if ((writable.writableLength ?? 0) < hwm) {
      return PromiseResolve(true);
    }
    var {
      promise,
      resolve
    } = PromiseWithResolvers();
    ArrayPrototypePush(waiters, {
      __proto__: null,
      resolve() {
        resolve(true);
      },
      reject() {
        resolve(false);
      }
    });
    installListeners();
    return promise;
  };
  cachedByBackpressure.set(backpressure, writer);
  return writer;
}

// ============================================================================
// toWritable(writer) -- stream/iter Writer -> classic Writable
// ============================================================================

/**
 * Create a classic stream.Writable backed by a stream/iter Writer.
 * Each _write/_writev call delegates to the Writer's methods,
 * attempting the sync path first (writeSync/writevSync/endSync) and
 * falling back to async if the sync path returns false or throws.
 * @param {object} writer - A stream/iter Writer (only write() is required).
 * @returns {stream.Writable}
 */
function toWritable(writer) {
  if (typeof writer?.write !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('writer', 'Writer', writer);
  }
  var WritableCtor = lazyWritable();
  var hasWriteSync = typeof writer.writeSync === 'function';
  var hasWritev = typeof writer.writev === 'function';
  var hasWritevSync = hasWritev && typeof writer.writevSync === 'function';
  var hasEnd = typeof writer.end === 'function';
  var hasEndSync = hasEnd && typeof writer.endSync === 'function';
  var hasFail = typeof writer.fail === 'function';
  var hasSyncWriteAccepted = typeof writer[kSyncWriteAccepted] === 'function';
  function syncWriteAccepted() {
    return hasSyncWriteAccepted && writer[kSyncWriteAccepted]();
  }
  function finishAfterSyncBackpressure(cb) {
    var ondrain;
    try {
      if (typeof writer[drainableProtocol] === 'function') {
        ondrain = writer[drainableProtocol]();
      }
    } catch (err) {
      cb(err);
      return;
    }
    if (ondrain !== null && ondrain !== undefined) {
      PromisePrototypeThen(ondrain, drained => {
        if (drained === false) {
          cb(new ERR_INVALID_STATE.TypeError('Stream closed by consumer'));
          return;
        }
        cb();
      }, cb);
      return;
    }
    queueMicrotask(cb);
  }

  // Try-sync-first pattern: attempt the synchronous method and fall back to the
  // async method if it returns false without accepting the data, or if it
  // throws. When the sync path succeeds, the callback is deferred via
  // queueMicrotask to preserve the async resolution contract that Writable
  // internals expect from _write/_writev/_final callbacks.

  function _write(chunk, encoding, cb) {
    var bytes = typeof chunk === 'string' ? Buffer.from(chunk, encoding) : chunk;
    if (hasWriteSync) {
      try {
        if (writer.writeSync(bytes)) {
          queueMicrotask(cb);
          return;
        }
        if (syncWriteAccepted()) {
          // The chunk was accepted; false only signaled backpressure.
          finishAfterSyncBackpressure(cb);
          return;
        }
      } catch {
        // Sync path threw -- fall through to async.
      }
    }
    try {
      PromisePrototypeThen(writer.write(bytes), () => cb(), cb);
    } catch (err) {
      cb(err);
    }
  }
  function _writev(entries, cb) {
    var chunks = [];
    for (var _i6 = 0; _i6 < entries.length; _i6++) {
      var {
        chunk,
        encoding
      } = entries[_i6];
      chunks[_i6] = typeof chunk === 'string' ? Buffer.from(chunk, encoding) : chunk;
    }
    if (hasWritevSync) {
      try {
        if (writer.writevSync(chunks)) {
          queueMicrotask(cb);
          return;
        }
        if (syncWriteAccepted()) {
          // The chunks were accepted; false only signaled backpressure.
          finishAfterSyncBackpressure(cb);
          return;
        }
      } catch {
        // Sync path threw -- fall through to async.
      }
    }
    try {
      PromisePrototypeThen(writer.writev(chunks), () => cb(), cb);
    } catch (err) {
      cb(err);
    }
  }
  function _final(cb) {
    if (!hasEnd) {
      queueMicrotask(cb);
      return;
    }
    if (hasEndSync) {
      try {
        var result = writer.endSync();
        if (result >= 0) {
          queueMicrotask(cb);
          return;
        }
      } catch {
        // Sync path threw -- fall through to async.
      }
    }
    try {
      PromisePrototypeThen(writer.end(), () => cb(), cb);
    } catch (err) {
      cb(err);
    }
  }
  function _destroy(err, cb) {
    if (err && hasFail) {
      writer.fail(err);
    }
    cb();
  }
  var writableOptions = {
    __proto__: null,
    // Use MAX_SAFE_INTEGER to effectively disable the Writable's
    // internal buffering. The underlying stream/iter Writer has its
    // own backpressure handling; we want _write to be called
    // immediately so the Writer can manage flow control directly.
    highWaterMark: NumberMAX_SAFE_INTEGER,
    write: _write,
    final: _final,
    destroy: _destroy
  };
  if (hasWritev) {
    writableOptions.writev = _writev;
  }
  return new WritableCtor(writableOptions);
}
module.exports = {
  // Shared helpers used by Readable.prototype[toAsyncStreamable] in
  // readable.js to avoid duplicating the batched iterator logic.
  createBatchedAsyncIterator,
  normalizeBatch,
  // Public utilities exported from 'stream/iter'.
  fromReadable,
  fromWritable,
  toReadable,
  toReadableSync,
  toWritable
};

