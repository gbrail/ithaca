'use strict';

// Compression / Decompression Transforms
//
// Creates bare native zlib handles via internalBinding('zlib'), bypassing
// the stream.Transform / ZlibBase / EventEmitter machinery entirely.
// Compression runs on the libuv threadpool via handle.write() (async) so
// I/O and upstream transforms can overlap with compression work.
// Each factory returns a transform descriptor that can be passed to pull().
function _empty() {}
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
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
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
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
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
var _earlyReturn = /*#__PURE__*/{};
function _catchInGenerator(body, recover) {
  return _catch(body, function (e) {
    if (e === _earlyReturn) {
      throw e;
    }
    return recover(e);
  });
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
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator",
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
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  MathMax,
  NumberIsNaN,
  ObjectEntries,
  ObjectKeys,
  PromiseWithResolvers,
  StringPrototypeStartsWith,
  SymbolAsyncIterator,
  TypedArrayPrototypeFill,
  TypedArrayPrototypeGetByteLength,
  TypedArrayPrototypeSlice,
  Uint32Array
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  codes: {
    ERR_BROTLI_INVALID_PARAM,
    ERR_INVALID_ARG_TYPE,
    ERR_OUT_OF_RANGE,
    ERR_ZSTD_INVALID_PARAM
  },
  genericNodeError
} = require('internal/errors');
var {
  lazyDOMException
} = require('internal/util');
var {
  isArrayBufferView,
  isAnyArrayBuffer
} = require('internal/util/types');
var {
  kValidatedTransform
} = require('internal/streams/iter/types');
var {
  checkRangesOrGetDefault,
  validateFiniteNumber,
  validateObject
} = require('internal/validators');
var binding = internalBinding('zlib');
var constants = internalBinding('constants').zlib;
var {
  // Zlib modes
  DEFLATE,
  INFLATE,
  GZIP,
  GUNZIP,
  BROTLI_ENCODE,
  BROTLI_DECODE,
  ZSTD_COMPRESS,
  ZSTD_DECOMPRESS,
  // Zlib flush
  Z_NO_FLUSH,
  Z_FINISH,
  // Zlib defaults
  Z_DEFAULT_WINDOWBITS,
  Z_DEFAULT_STRATEGY,
  // Brotli flush
  BROTLI_OPERATION_PROCESS,
  BROTLI_OPERATION_FINISH,
  // Zlib ranges
  Z_MIN_CHUNK,
  Z_MIN_WINDOWBITS,
  Z_MAX_WINDOWBITS,
  Z_MIN_LEVEL,
  Z_MAX_LEVEL,
  Z_MIN_MEMLEVEL,
  Z_MAX_MEMLEVEL,
  Z_FIXED,
  // Zstd flush
  ZSTD_e_continue,
  ZSTD_e_end
} = constants;

// ---------------------------------------------------------------------------
// Option validation helpers (matching lib/zlib.js validation patterns)
// ---------------------------------------------------------------------------

// Default output buffer size for compression transforms. Larger than
// Z_DEFAULT_CHUNK (16KB) to reduce the number of threadpool re-entries
// when the engine has more output than fits in one buffer. 64KB matches
// BATCH_HWM and the typical input chunk size from pull().
var DEFAULT_OUTPUT_SIZE = 64 * 1024;

// Batch high water mark - yield output in chunks of approximately this size.
var BATCH_HWM = DEFAULT_OUTPUT_SIZE;

// Pre-allocated empty buffer for flush/finalize calls.
var kEmpty = Buffer.alloc(0);
function validateChunkSize(options) {
  var chunkSize = options.chunkSize;
  if (!validateFiniteNumber(chunkSize, 'options.chunkSize')) {
    chunkSize = DEFAULT_OUTPUT_SIZE;
  } else if (chunkSize < Z_MIN_CHUNK) {
    throw new ERR_OUT_OF_RANGE('options.chunkSize', `>= ${Z_MIN_CHUNK}`, chunkSize);
  }
  return chunkSize;
}
function validateDictionary(dictionary) {
  if (dictionary === undefined) return undefined;
  if (isArrayBufferView(dictionary)) return dictionary;
  if (isAnyArrayBuffer(dictionary)) return Buffer.from(dictionary);
  throw new ERR_INVALID_ARG_TYPE('options.dictionary', ['Buffer', 'TypedArray', 'DataView', 'ArrayBuffer'], dictionary);
}
function validateParams(params, maxParam, errClass) {
  if (params === undefined) return;
  if (typeof params !== 'object' || params === null) {
    throw new ERR_INVALID_ARG_TYPE('options.params', 'Object', params);
  }
  var keys = ObjectKeys(params);
  for (var i = 0; i < keys.length; i++) {
    var origKey = keys[i];
    var key = +origKey;
    if (NumberIsNaN(key) || key < 0 || key > maxParam) {
      throw new errClass(origKey);
    }
    var value = params[origKey];
    if (typeof value !== 'number' && typeof value !== 'boolean') {
      throw new ERR_INVALID_ARG_TYPE('options.params[key]', 'number', value);
    }
  }
}

// ---------------------------------------------------------------------------
// Brotli / Zstd parameter arrays (computed once, reused per init call).
// Mirrors the pattern in lib/zlib.js.
// ---------------------------------------------------------------------------
var kMaxBrotliParam = MathMax.apply(void 0, _toConsumableArray(ArrayPrototypeMap(ObjectEntries(constants), _ref => {
  var {
    0: key,
    1: value
  } = _ref;
  return StringPrototypeStartsWith(key, 'BROTLI_PARAM_') ? value : 0;
})));
var brotliInitParamsArray = new Uint32Array(kMaxBrotliParam + 1);
var kMaxZstdCParam = MathMax.apply(void 0, _toConsumableArray(ArrayPrototypeMap(ObjectKeys(constants), key => StringPrototypeStartsWith(key, 'ZSTD_c_') ? constants[key] : 0)));
var zstdInitCParamsArray = new Uint32Array(kMaxZstdCParam + 1);
var kMaxZstdDParam = MathMax.apply(void 0, _toConsumableArray(ArrayPrototypeMap(ObjectKeys(constants), key => StringPrototypeStartsWith(key, 'ZSTD_d_') ? constants[key] : 0)));
var zstdInitDParamsArray = new Uint32Array(kMaxZstdDParam + 1);

// ---------------------------------------------------------------------------
// Handle creation - bare native handles, no Transform/EventEmitter overhead.
//
// Each factory accepts a processCallback (called from the threadpool
// completion path in C++) and an onError handler.
// ---------------------------------------------------------------------------

/**
 * Create a bare Zlib handle (gzip, gunzip, deflate, inflate).
 * @returns {{ handle: object, writeState: Uint32Array, chunkSize: number }}
 */
function createZlibHandle(mode, options, processCallback, onError) {
  // Validate all options before creating the native handle to avoid
  // "close before init" assertion if validation throws.
  var chunkSize = validateChunkSize(options);
  var windowBits = checkRangesOrGetDefault(options.windowBits, 'options.windowBits', Z_MIN_WINDOWBITS, Z_MAX_WINDOWBITS, Z_DEFAULT_WINDOWBITS);
  // Default compression level 4 (not Z_DEFAULT_COMPRESSION which maps to
  // level 6). Level 4 is ~1.5x faster with only ~5-10% worse compression
  // ratio - the sweet spot for streaming and HTTP content-encoding.
  var level = checkRangesOrGetDefault(options.level, 'options.level', Z_MIN_LEVEL, Z_MAX_LEVEL, 4);
  // memLevel 9 uses ~128KB more memory than 8 but provides faster hash
  // lookups during compression. Negligible memory cost for the speed gain.
  var memLevel = checkRangesOrGetDefault(options.memLevel, 'options.memLevel', Z_MIN_MEMLEVEL, Z_MAX_MEMLEVEL, 9);
  var strategy = checkRangesOrGetDefault(options.strategy, 'options.strategy', Z_DEFAULT_STRATEGY, Z_FIXED, Z_DEFAULT_STRATEGY);
  var dictionary = validateDictionary(options.dictionary);
  var handle = new binding.Zlib(mode);
  var writeState = new Uint32Array(2);
  handle.onerror = onError;
  handle.init(windowBits, level, memLevel, strategy, writeState, processCallback, dictionary);
  return {
    __proto__: null,
    handle,
    writeState,
    chunkSize
  };
}

/**
 * Create a bare Brotli handle.
 * @returns {{ handle: object, writeState: Uint32Array, chunkSize: number }}
 */
function createBrotliHandle(mode, options, processCallback, onError) {
  // Validate before creating native handle.
  var chunkSize = validateChunkSize(options);
  var dictionary = validateDictionary(options.dictionary);
  validateParams(options.params, kMaxBrotliParam, ERR_BROTLI_INVALID_PARAM);
  var handle = mode === BROTLI_ENCODE ? new binding.BrotliEncoder(mode) : new binding.BrotliDecoder(mode);
  var writeState = new Uint32Array(2);
  TypedArrayPrototypeFill(brotliInitParamsArray, -1);
  // Streaming-appropriate defaults: quality 6 (not 11) and lgwin 20 (1MB,
  // not 4MB). Quality 11 is intended for offline/build-time compression
  // and allocates ~400MB of internal state. Quality 6 is ~10x faster with
  // only ~10-15% worse compression ratio - the standard for dynamic HTTP
  // content-encoding (nginx, Caddy, Cloudflare all use 4-6).
  if (mode === BROTLI_ENCODE) {
    brotliInitParamsArray[constants.BROTLI_PARAM_QUALITY] = 6;
    brotliInitParamsArray[constants.BROTLI_PARAM_LGWIN] = 20;
  }
  if (options.params) {
    // User-supplied params override the defaults above.
    var params = options.params;
    var keys = ObjectKeys(params);
    for (var i = 0; i < keys.length; i++) {
      var key = +keys[i];
      brotliInitParamsArray[key] = params[keys[i]];
    }
  }
  handle.onerror = onError;
  handle.init(brotliInitParamsArray, writeState, processCallback, dictionary);
  return {
    __proto__: null,
    handle,
    writeState,
    chunkSize
  };
}

/**
 * Create a bare Zstd handle.
 * @returns {{ handle: object, writeState: Uint32Array, chunkSize: number }}
 */
function createZstdHandle(mode, options, processCallback, onError) {
  var isCompress = mode === ZSTD_COMPRESS;

  // Validate before creating native handle.
  var chunkSize = validateChunkSize(options);
  var dictionary = validateDictionary(options.dictionary);
  var maxParam = isCompress ? kMaxZstdCParam : kMaxZstdDParam;
  validateParams(options.params, maxParam, ERR_ZSTD_INVALID_PARAM);
  var pledgedSrcSize = options.pledgedSrcSize;
  if (pledgedSrcSize !== undefined) {
    if (typeof pledgedSrcSize !== 'number' || NumberIsNaN(pledgedSrcSize)) {
      throw new ERR_INVALID_ARG_TYPE('options.pledgedSrcSize', 'number', pledgedSrcSize);
    }
    if (pledgedSrcSize < 0) {
      throw new ERR_OUT_OF_RANGE('options.pledgedSrcSize', '>= 0', pledgedSrcSize);
    }
  }
  var handle = isCompress ? new binding.ZstdCompress() : new binding.ZstdDecompress();
  var writeState = new Uint32Array(2);
  var initArray = isCompress ? zstdInitCParamsArray : zstdInitDParamsArray;
  TypedArrayPrototypeFill(initArray, -1);
  if (options.params) {
    var params = options.params;
    var keys = ObjectKeys(params);
    for (var i = 0; i < keys.length; i++) {
      var key = +keys[i];
      initArray[key] = params[keys[i]];
    }
  }
  handle.onerror = onError;
  handle.init(initArray, pledgedSrcSize, writeState, processCallback, dictionary);
  return {
    __proto__: null,
    handle,
    writeState,
    chunkSize
  };
}

// ---------------------------------------------------------------------------
// Core: makeZlibTransform
//
// Uses async handle.write() so compression runs on the libuv threadpool.
// The generator manually iterates the source with pre-reading: the next
// upstream read+transform is started before awaiting the current compression,
// so I/O and upstream work overlap with threadpool compression.
// ---------------------------------------------------------------------------
function makeZlibTransform(createHandleFn, processFlag, finishFlag) {
  return {
    __proto__: null,
    [kValidatedTransform]: true,
    transform: function (source, options) {
      return new _AsyncGenerator(function (_generator) {
        var {
          signal
        } = options;

        // Fail fast if already aborted - don't allocate a native handle.
        signal?.throwIfAborted();

        // ---- Per-invocation state shared with the write callback ----
        var outBuf;
        var outOffset = 0;
        var chunkSize;
        var pending = [];
        var pendingBytes = 0;

        // Current write operation state (read by the callback for looping).
        var resolveWrite, rejectWrite;
        var writeInput, writeFlush;
        // processCallback: called by C++ AfterThreadPoolWork when compression
        // on the threadpool completes. Collects output, loops if the engine
        // has more output to produce (availOut === 0), then resolves the
        // promise when all output for this input chunk is collected.
        function onWriteComplete() {
          var availOut = writeState[0];
          var availInAfter = writeState[1];
          var have = writeAvailOutBefore - availOut;
          var bufferExhausted = availOut === 0 || outOffset + have >= chunkSize;
          if (have > 0) {
            if (bufferExhausted && outOffset === 0) {
              // Entire buffer filled from start - yield directly, no copy.
              ArrayPrototypePush(pending, outBuf);
            } else if (bufferExhausted) {
              // Tail of buffer filled and buffer is being replaced -
              // subarray is safe since outBuf reference is overwritten below.
              ArrayPrototypePush(pending, outBuf.subarray(outOffset, outOffset + have));
            } else {
              // Partial fill, buffer will be reused - must copy.
              ArrayPrototypePush(pending, TypedArrayPrototypeSlice(outBuf, outOffset, outOffset + have));
            }
            pendingBytes += have;
            outOffset += have;
          }

          // Reallocate output buffer if exhausted.
          if (bufferExhausted) {
            outBuf = Buffer.allocUnsafe(chunkSize);
            outOffset = 0;
          }
          if (availOut === 0) {
            // Engine has more output - but if aborted, don't loop.
            if (!resolveWrite) return;
            var consumed = writeAvailIn - availInAfter;
            writeInOff += consumed;
            writeAvailIn = availInAfter;
            writeAvailOutBefore = chunkSize - outOffset;
            handle.write(writeFlush, writeInput, writeInOff, writeAvailIn, outBuf, outOffset, writeAvailOutBefore);
            return; // Will call onWriteComplete again.
          }

          // All input consumed and output collected.
          handle.buffer = null;
          var resolve = resolveWrite;
          resolveWrite = undefined;
          rejectWrite = undefined;
          if (resolve) resolve();
        }

        // onError: called by C++ when the engine encounters an error.
        // Fires instead of onWriteComplete - reject the promise.
        function onError(message, errno, code) {
          var error = genericNodeError(message, {
            __proto__: null,
            errno,
            code
          });
          error.errno = errno;
          error.code = code;
          var reject = rejectWrite;
          resolveWrite = undefined;
          rejectWrite = undefined;
          if (reject) reject(error);
        }

        // ---- Create the handle with our callbacks ----
        var writeInOff, writeAvailIn, writeAvailOutBefore;
        var result = createHandleFn(onWriteComplete, onError);
        var handle = result.handle;
        var writeState = result.writeState;
        chunkSize = result.chunkSize;
        outBuf = Buffer.allocUnsafe(chunkSize);

        // Abort handler: reject any in-flight threadpool operation so the
        // generator doesn't block waiting for compression to finish.
        var onAbort = () => {
          var reject = rejectWrite;
          resolveWrite = undefined;
          rejectWrite = undefined;
          if (reject) {
            reject(signal.reason ?? lazyDOMException('The operation was aborted', 'AbortError'));
          }
        };
        // Dispatch input to the threadpool and return a promise.
        function processInputAsync(input, flushFlag) {
          var {
            promise,
            resolve,
            reject
          } = PromiseWithResolvers();
          resolveWrite = resolve;
          rejectWrite = reject;
          writeInput = input;
          writeFlush = flushFlag;
          writeInOff = 0;
          writeAvailIn = TypedArrayPrototypeGetByteLength(input);
          writeAvailOutBefore = chunkSize - outOffset;

          // Keep input alive while the threadpool references it.
          handle.buffer = input;
          handle.write(flushFlag, input, 0, writeAvailIn, outBuf, outOffset, writeAvailOutBefore);
          return promise;
        }
        function drainBatch() {
          if (pendingBytes <= BATCH_HWM) {
            // Swap instead of splice - avoids copying the array.
            var _batch = pending;
            pending = [];
            pendingBytes = 0;
            return _batch;
          }
          var batch = [];
          var batchBytes = 0;
          while (pending.length > 0 && batchBytes < BATCH_HWM) {
            var buf = ArrayPrototypeShift(pending);
            ArrayPrototypePush(batch, buf);
            var len = TypedArrayPrototypeGetByteLength(buf);
            batchBytes += len;
            pendingBytes -= len;
          }
          return batch;
        }
        signal.addEventListener('abort', onAbort, {
          __proto__: null,
          once: true
        });
        var finalized = false;
        var iter = source[SymbolAsyncIterator]();
        return _continueIgnored(_finallyRethrows(function () {
          var _interrupt = false;
          // Manually iterate the source so we can pre-read: calling
          // iter.next() starts the upstream read + transform on libuv
          // before we await the current compression on the threadpool.
          var nextResult = iter.next();
          return _continue(_for(function () {
            return !_interrupt;
          }, void 0, function () {
            return _await(nextResult, function (_ref2) {
              var {
                value: chunks,
                done
              } = _ref2;
              if (done) {
                _interrupt = true;
                return;
              }
              signal?.throwIfAborted();
              return _invoke(function () {
                if (chunks === null) {
                  // Flush signal - finalize the engine.
                  return _invoke(function () {
                    if (!finalized) {
                      finalized = true;
                      return _await(processInputAsync(kEmpty, finishFlag), function () {
                        return _continueIgnored(_for(function () {
                          return pending.length > 0;
                        }, void 0, function () {
                          return _generator._yield(drainBatch()).then(_empty);
                        }));
                      });
                    }
                  }, function () {
                    nextResult = iter.next();
                  });
                }
              }, function () {
                // Pre-read: start upstream I/O + transform for the NEXT batch
                // while we compress the current batch on the threadpool.
                nextResult = iter.next();
                return _continue(_forTo(chunks, function (i) {
                  return _awaitIgnored(processInputAsync(chunks[i], processFlag));
                }), function () {
                  return _invoke(function () {
                    if (pendingBytes >= BATCH_HWM) {
                      return _continueIgnored(_for(function () {
                        return pending.length > 0 && pendingBytes >= BATCH_HWM;
                      }, void 0, function () {
                        return _generator._yield(drainBatch()).then(_empty);
                      }));
                    }
                  }, function () {
                    return _invokeIgnored(function () {
                      if (pending.length > 0) {
                        return _generator._yield(drainBatch()).then(_empty);
                      }
                    });
                  });
                });
              });
            });
          }), function () {
            // Source ended - finalize if not already done by a null signal.
            return _invokeIgnored(function () {
              if (!finalized && !signal.aborted) {
                finalized = true;
                return _await(processInputAsync(kEmpty, finishFlag), function () {
                  return _continueIgnored(_for(function () {
                    return pending.length > 0;
                  }, void 0, function () {
                    return _generator._yield(drainBatch()).then(_empty);
                  }));
                });
              }
            });
          });
        }, function (_wasThrown, _result) {
          signal.removeEventListener('abort', onAbort);
          handle.close();
          // Close the upstream iterator so its finally blocks run promptly
          // rather than waiting for GC.
          return _continue(_catchInGenerator(function () {
            return _awaitIgnored(iter.return?.());
          }, _empty), function () {
            return _rethrow(_wasThrown, _result);
          });
        }));
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Compression factories
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Core: makeZlibTransformSync
//
// Synchronous counterpart to makeZlibTransform. Uses handle.writeSync()
// which runs compression directly on the main thread (no threadpool).
// Returns a stateful sync transform (generator function).
// ---------------------------------------------------------------------------
function makeZlibTransformSync(createHandleFn, processFlag, finishFlag) {
  return {
    __proto__: null,
    transform: function* (source) {
      // The processCallback is never called in sync mode, but handle.init()
      // requires it. Pass a no-op.
      var error = null;
      function onError(message, errno, code) {
        error = genericNodeError(message, {
          __proto__: null,
          errno,
          code
        });
        error.errno = errno;
        error.code = code;
      }
      var result = createHandleFn(() => {}, onError);
      var handle = result.handle;
      var writeState = result.writeState;
      var chunkSize = result.chunkSize;
      var outBuf = Buffer.allocUnsafe(chunkSize);
      var outOffset = 0;
      var pending = [];
      var pendingBytes = 0;
      function processSyncInput(input, flushFlag) {
        var inOff = 0;
        var availIn = TypedArrayPrototypeGetByteLength(input);
        var availOutBefore = chunkSize - outOffset;
        handle.writeSync(flushFlag, input, inOff, availIn, outBuf, outOffset, availOutBefore);
        if (error) throw error;
        while (true) {
          var availOut = writeState[0];
          var availInAfter = writeState[1];
          var have = availOutBefore - availOut;
          var bufferExhausted = availOut === 0 || outOffset + have >= chunkSize;
          if (have > 0) {
            if (bufferExhausted && outOffset === 0) {
              // Entire buffer filled - yield directly, no copy.
              ArrayPrototypePush(pending, outBuf);
            } else if (bufferExhausted) {
              // Tail filled, buffer being replaced - subarray is safe.
              ArrayPrototypePush(pending, outBuf.subarray(outOffset, outOffset + have));
            } else {
              // Partial fill, buffer reused - must copy.
              ArrayPrototypePush(pending, TypedArrayPrototypeSlice(outBuf, outOffset, outOffset + have));
            }
            pendingBytes += have;
            outOffset += have;
          }
          if (bufferExhausted) {
            outBuf = Buffer.allocUnsafe(chunkSize);
            outOffset = 0;
          }
          if (availOut === 0) {
            // Engine has more output - loop.
            var consumed = availIn - availInAfter;
            inOff += consumed;
            availIn = availInAfter;
            availOutBefore = chunkSize - outOffset;
            handle.writeSync(flushFlag, input, inOff, availIn, outBuf, outOffset, availOutBefore);
            if (error) throw error;
            continue;
          }

          // All input consumed.
          break;
        }
      }
      function drainBatch() {
        if (pendingBytes <= BATCH_HWM) {
          var _batch2 = pending;
          pending = [];
          pendingBytes = 0;
          return _batch2;
        }
        var batch = [];
        var batchBytes = 0;
        while (pending.length > 0 && batchBytes < BATCH_HWM) {
          var buf = ArrayPrototypeShift(pending);
          var len = TypedArrayPrototypeGetByteLength(buf);
          ArrayPrototypePush(batch, buf);
          batchBytes += len;
          pendingBytes -= len;
        }
        return batch;
      }
      try {
        for (var batch of source) {
          if (batch === null) {
            // Flush signal - finalize the engine.
            processSyncInput(Buffer.alloc(0), finishFlag);
            while (pending.length > 0) {
              yield drainBatch();
            }
            continue;
          }
          for (var _i = 0; _i < batch.length; _i++) {
            processSyncInput(batch[_i], processFlag);
          }
          if (pendingBytes >= BATCH_HWM) {
            while (pending.length > 0 && pendingBytes >= BATCH_HWM) {
              yield drainBatch();
            }
          }
          if (pending.length > 0) {
            yield drainBatch();
          }
        }
      } finally {
        handle.close();
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Async compression factories
// ---------------------------------------------------------------------------

var kNullPrototype = {
  __proto__: null
};
function compressGzip() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createZlibHandle(GZIP, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function compressDeflate() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createZlibHandle(DEFLATE, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function compressBrotli() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createBrotliHandle(BROTLI_ENCODE, options, cb, onErr), BROTLI_OPERATION_PROCESS, BROTLI_OPERATION_FINISH);
}
function compressZstd() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createZstdHandle(ZSTD_COMPRESS, options, cb, onErr), ZSTD_e_continue, ZSTD_e_end);
}

// ---------------------------------------------------------------------------
// Decompression factories
// ---------------------------------------------------------------------------

function decompressGzip() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createZlibHandle(GUNZIP, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function decompressDeflate() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createZlibHandle(INFLATE, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function decompressBrotli() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createBrotliHandle(BROTLI_DECODE, options, cb, onErr), BROTLI_OPERATION_PROCESS, BROTLI_OPERATION_FINISH);
}
function decompressZstd() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransform((cb, onErr) => createZstdHandle(ZSTD_DECOMPRESS, options, cb, onErr), ZSTD_e_continue, ZSTD_e_end);
}

// ---------------------------------------------------------------------------
// Sync compression factories
// ---------------------------------------------------------------------------

function compressGzipSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createZlibHandle(GZIP, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function compressDeflateSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createZlibHandle(DEFLATE, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function compressBrotliSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createBrotliHandle(BROTLI_ENCODE, options, cb, onErr), BROTLI_OPERATION_PROCESS, BROTLI_OPERATION_FINISH);
}
function compressZstdSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createZstdHandle(ZSTD_COMPRESS, options, cb, onErr), ZSTD_e_continue, ZSTD_e_end);
}

// ---------------------------------------------------------------------------
// Sync decompression factories
// ---------------------------------------------------------------------------

function decompressGzipSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createZlibHandle(GUNZIP, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function decompressDeflateSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createZlibHandle(INFLATE, options, cb, onErr), Z_NO_FLUSH, Z_FINISH);
}
function decompressBrotliSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createBrotliHandle(BROTLI_DECODE, options, cb, onErr), BROTLI_OPERATION_PROCESS, BROTLI_OPERATION_FINISH);
}
function decompressZstdSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
  validateObject(options, 'options');
  return makeZlibTransformSync((cb, onErr) => createZstdHandle(ZSTD_DECOMPRESS, options, cb, onErr), ZSTD_e_continue, ZSTD_e_end);
}
module.exports = {
  compressBrotli,
  compressBrotliSync,
  compressDeflate,
  compressDeflateSync,
  compressGzip,
  compressGzipSync,
  compressZstd,
  compressZstdSync,
  decompressBrotli,
  decompressBrotliSync,
  decompressDeflate,
  decompressDeflateSync,
  decompressGzip,
  decompressGzipSync,
  decompressZstd,
  decompressZstdSync
};

