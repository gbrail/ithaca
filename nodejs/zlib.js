// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

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
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayBuffer,
  MathMax,
  NumberIsNaN,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectEntries,
  ObjectFreeze,
  ObjectKeys,
  ObjectSetPrototypeOf,
  Symbol: _Symbol,
  Uint32Array
} = primordials;
var {
  codes: {
    ERR_BROTLI_INVALID_PARAM,
    ERR_BUFFER_TOO_LARGE,
    ERR_INVALID_ARG_TYPE,
    ERR_OUT_OF_RANGE,
    ERR_TRAILING_JUNK_AFTER_STREAM_END,
    ERR_ZSTD_INVALID_PARAM
  },
  genericNodeError
} = require('internal/errors');
var {
  Transform,
  finished
} = require('stream');
var {
  deprecateInstantiation
} = require('internal/util');
var {
  isArrayBufferView,
  isAnyArrayBuffer,
  isUint8Array
} = require('internal/util/types');
var binding = internalBinding('zlib');
var {
  crc32: crc32Native
} = binding;
var assert = require('internal/assert');
var {
  Buffer,
  kMaxLength
} = require('buffer');
var {
  owner_symbol
} = require('internal/async_hooks').symbols;
var {
  checkRangesOrGetDefault,
  validateFunction,
  validateUint32,
  validateFiniteNumber
} = require('internal/validators');
var {
  FastBuffer
} = require('internal/buffer');
var kFlushFlag = _Symbol('kFlushFlag');
var kError = _Symbol('kError');
var constants = internalBinding('constants').zlib;
var {
  // Zlib flush levels
  Z_NO_FLUSH,
  Z_BLOCK,
  Z_PARTIAL_FLUSH,
  Z_SYNC_FLUSH,
  Z_FULL_FLUSH,
  Z_FINISH,
  // Zlib option values
  Z_MIN_CHUNK,
  Z_MIN_WINDOWBITS,
  Z_MAX_WINDOWBITS,
  Z_MIN_LEVEL,
  Z_MAX_LEVEL,
  Z_MIN_MEMLEVEL,
  Z_MAX_MEMLEVEL,
  Z_DEFAULT_CHUNK,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFAULT_WINDOWBITS,
  Z_DEFAULT_MEMLEVEL,
  Z_FIXED,
  // Node's compression stream modes (node_zlib_mode)
  DEFLATE,
  DEFLATERAW,
  INFLATE,
  INFLATERAW,
  GZIP,
  GUNZIP,
  UNZIP,
  BROTLI_DECODE,
  BROTLI_ENCODE,
  ZSTD_COMPRESS,
  ZSTD_DECOMPRESS,
  // Brotli operations (~flush levels)
  BROTLI_OPERATION_PROCESS,
  BROTLI_OPERATION_FLUSH,
  BROTLI_OPERATION_FINISH,
  BROTLI_OPERATION_EMIT_METADATA,
  // Zstd end directives (~flush levels)
  ZSTD_e_continue,
  ZSTD_e_flush,
  ZSTD_e_end
} = constants;

// Translation table for return codes.
var codes = {
  Z_OK: constants.Z_OK,
  Z_STREAM_END: constants.Z_STREAM_END,
  Z_NEED_DICT: constants.Z_NEED_DICT,
  Z_ERRNO: constants.Z_ERRNO,
  Z_STREAM_ERROR: constants.Z_STREAM_ERROR,
  Z_DATA_ERROR: constants.Z_DATA_ERROR,
  Z_MEM_ERROR: constants.Z_MEM_ERROR,
  Z_BUF_ERROR: constants.Z_BUF_ERROR,
  Z_VERSION_ERROR: constants.Z_VERSION_ERROR
};
for (var ckey of ObjectKeys(codes)) {
  codes[codes[ckey]] = ckey;
}
function zlibBuffer(engine, buffer, callback) {
  validateFunction(callback, 'callback');
  // Streams do not support non-Uint8Array ArrayBufferViews yet. Convert it to a
  // Buffer without copying.
  if (isArrayBufferView(buffer) && !isUint8Array(buffer)) {
    buffer = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (isAnyArrayBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  }
  engine.buffers = null;
  engine.nread = 0;
  engine.cb = callback;
  engine.on('data', zlibBufferOnData);
  engine.on('error', zlibBufferOnError);
  engine.on('end', zlibBufferOnEnd);
  engine.end(buffer);
}
function zlibBufferOnData(chunk) {
  if (!this.buffers) {
    this.buffers = [chunk];
  } else {
    this.buffers.push(chunk);
  }
  this.nread += chunk.length;
  if (this.nread > this._maxOutputLength) {
    this.close();
    this.removeAllListeners('end');
    this.cb(new ERR_BUFFER_TOO_LARGE(this._maxOutputLength));
  }
}
function zlibBufferOnError(err) {
  this.removeAllListeners('end');
  this.cb(err);
}
function zlibBufferOnEnd() {
  var buf;
  if (this.nread === 0) {
    buf = new FastBuffer();
  } else {
    var bufs = this.buffers;
    buf = bufs.length === 1 ? bufs[0] : Buffer.concat(bufs, this.nread);
  }
  this.close();
  if (this._info) this.cb(null, {
    buffer: buf,
    engine: this
  });else this.cb(null, buf);
}
function zlibBufferSync(engine, buffer) {
  if (typeof buffer === 'string') {
    buffer = Buffer.from(buffer);
  } else if (!isArrayBufferView(buffer)) {
    if (isAnyArrayBuffer(buffer)) {
      buffer = Buffer.from(buffer);
    } else {
      throw new ERR_INVALID_ARG_TYPE('buffer', ['string', 'Buffer', 'TypedArray', 'DataView', 'ArrayBuffer'], buffer);
    }
  }
  buffer = processChunkSync(engine, buffer, engine._finishFlushFlag);
  if (engine._info) return {
    buffer,
    engine
  };
  return buffer;
}
function zlibOnError(message, errno, code) {
  var self = this[owner_symbol];
  // There is no way to cleanly recover.
  // Continuing only obscures problems.

  var error = genericNodeError(message, {
    errno,
    code
  });
  error.errno = errno;
  error.code = code;
  self.destroy(error);
  self[kError] = error;
}
var FLUSH_BOUND = [[Z_NO_FLUSH, Z_BLOCK], [BROTLI_OPERATION_PROCESS, BROTLI_OPERATION_EMIT_METADATA], [ZSTD_e_continue, ZSTD_e_end]];
var FLUSH_BOUND_IDX_NORMAL = 0;
var FLUSH_BOUND_IDX_BROTLI = 1;
var FLUSH_BOUND_IDX_ZSTD = 2;

/**
 * The base class for all Zlib-style streams.
 * @class
 */
function ZlibBase(opts, mode, handle, _ref) {
  var {
    flush,
    finishFlush,
    fullFlush
  } = _ref;
  var chunkSize = Z_DEFAULT_CHUNK;
  var maxOutputLength = kMaxLength;
  // The ZlibBase class is not exported to user land, the mode should only be
  // passed in by us.
  assert(typeof mode === 'number');
  assert(mode >= DEFLATE && mode <= ZSTD_DECOMPRESS);
  var flushBoundIdx;
  if (mode === BROTLI_ENCODE || mode === BROTLI_DECODE) {
    flushBoundIdx = FLUSH_BOUND_IDX_BROTLI;
  } else if (mode === ZSTD_COMPRESS || mode === ZSTD_DECOMPRESS) {
    flushBoundIdx = FLUSH_BOUND_IDX_ZSTD;
  } else {
    flushBoundIdx = FLUSH_BOUND_IDX_NORMAL;
  }
  if (opts) {
    chunkSize = opts.chunkSize;
    if (!validateFiniteNumber(chunkSize, 'options.chunkSize')) {
      chunkSize = Z_DEFAULT_CHUNK;
    } else if (chunkSize < Z_MIN_CHUNK) {
      throw new ERR_OUT_OF_RANGE('options.chunkSize', `>= ${Z_MIN_CHUNK}`, chunkSize);
    }
    flush = checkRangesOrGetDefault(opts.flush, 'options.flush', FLUSH_BOUND[flushBoundIdx][0], FLUSH_BOUND[flushBoundIdx][1], flush);
    finishFlush = checkRangesOrGetDefault(opts.finishFlush, 'options.finishFlush', FLUSH_BOUND[flushBoundIdx][0], FLUSH_BOUND[flushBoundIdx][1], finishFlush);
    maxOutputLength = checkRangesOrGetDefault(opts.maxOutputLength, 'options.maxOutputLength', 1, kMaxLength, kMaxLength);
    if (opts.encoding || opts.objectMode || opts.writableObjectMode) {
      opts = _objectSpread({}, opts);
      opts.encoding = null;
      opts.objectMode = false;
      opts.writableObjectMode = false;
    }
  }
  Transform.call(this, _objectSpread({
    autoDestroy: true
  }, opts));
  this[kError] = null;
  this.bytesWritten = 0;
  this._handle = handle;
  handle[owner_symbol] = this;
  // Used by processCallback() and zlibOnError()
  handle.onerror = zlibOnError;
  this._outBuffer = Buffer.allocUnsafe(chunkSize);
  this._outOffset = 0;
  this._chunkSize = chunkSize;
  this._defaultFlushFlag = flush;
  this._finishFlushFlag = finishFlush;
  this._defaultFullFlushFlag = fullFlush;
  this._info = opts?.info;
  this._maxOutputLength = maxOutputLength;
  this._rejectGarbageAfterEnd = opts?.rejectGarbageAfterEnd === true;
}
ObjectSetPrototypeOf(ZlibBase.prototype, Transform.prototype);
ObjectSetPrototypeOf(ZlibBase, Transform);
ObjectDefineProperty(ZlibBase.prototype, '_closed', {
  __proto__: null,
  configurable: true,
  enumerable: true,
  get() {
    return !this._handle;
  }
});

/**
 * @this {ZlibBase}
 * @returns {void}
 */
ZlibBase.prototype.reset = function () {
  assert(this._handle, 'zlib binding closed');
  return this._handle.reset();
};

/**
 * This is the _flush function called by the transform class,
 * internally, when the last chunk has been written.
 * @returns {void}
 * @this {ZlibBase}
 */
ZlibBase.prototype._flush = function (callback) {
  this._transform(new FastBuffer(), '', callback);
};

/**
 * Force Transform compat behavior.
 * @returns {void}
 * @this {ZlibBase}
 */
ZlibBase.prototype._final = function (callback) {
  callback();
};

// If a flush is scheduled while another flush is still pending, a way to figure
// out which one is the "stronger" flush is needed.
// This is currently only used to figure out which flush flag to use for the
// last chunk.
// Roughly, the following holds:
// Z_NO_FLUSH < Z_BLOCK < Z_PARTIAL_FLUSH <
//     Z_SYNC_FLUSH < Z_FULL_FLUSH < Z_FINISH
var flushiness = [];
var kFlushFlagList = [Z_NO_FLUSH, Z_BLOCK, Z_PARTIAL_FLUSH, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH];
for (var i = 0; i < kFlushFlagList.length; i++) {
  flushiness[kFlushFlagList[i]] = i;
}
function maxFlush(a, b) {
  return flushiness[a] > flushiness[b] ? a : b;
}

// Set up a list of 'special' buffers that can be written using .write()
// from the .flush() code as a way of introducing flushing operations into the
// write sequence.
var kFlushBuffers = [];
{
  var dummyArrayBuffer = new ArrayBuffer();
  for (var flushFlag of kFlushFlagList) {
    kFlushBuffers[flushFlag] = Buffer.from(dummyArrayBuffer);
    kFlushBuffers[flushFlag][kFlushFlag] = flushFlag;
  }
}
ZlibBase.prototype.flush = function (kind, callback) {
  if (typeof kind === 'function' || kind === undefined && !callback) {
    callback = kind;
    kind = this._defaultFullFlushFlag;
  }
  if (this.writableFinished) {
    if (callback) process.nextTick(callback);
  } else if (this.writableEnded) {
    if (callback) this.once('end', callback);
  } else {
    this.write(kFlushBuffers[kind], '', callback);
  }
};

/**
 * @this {import('stream').Transform}
 * @param {(err?: Error) => any} [callback]
 */
ZlibBase.prototype.close = function (callback) {
  if (callback) finished(this, callback);
  this.destroy();
};
ZlibBase.prototype._destroy = function (err, callback) {
  _close(this);
  callback(err);
};
ZlibBase.prototype._transform = function (chunk, encoding, cb) {
  var flushFlag = this._defaultFlushFlag;
  // We use a 'fake' zero-length chunk to carry information about flushes from
  // the public API to the actual stream implementation.
  if (typeof chunk[kFlushFlag] === 'number') {
    flushFlag = chunk[kFlushFlag];
  }

  // For the last chunk, also apply `_finishFlushFlag`.
  if (this.writableEnded && this.writableLength === chunk.byteLength) {
    flushFlag = maxFlush(flushFlag, this._finishFlushFlag);
  }
  processChunk(this, chunk, flushFlag, cb);
};
ZlibBase.prototype._processChunk = function (chunk, flushFlag, cb) {
  // _processChunk() is left for backwards compatibility
  if (typeof cb === 'function') processChunk(this, chunk, flushFlag, cb);else return processChunkSync(this, chunk, flushFlag);
};
function processChunkSync(self, chunk, flushFlag) {
  var availInBefore = chunk.byteLength;
  var availOutBefore = self._chunkSize - self._outOffset;
  var inOff = 0;
  var availOutAfter;
  var availInAfter;
  var buffers = [];
  var nread = 0;
  var inputRead = 0;
  var state = self._writeState;
  var handle = self._handle;
  var buffer = self._outBuffer;
  var offset = self._outOffset;
  var chunkSize = self._chunkSize;
  var error;
  self.on('error', function onError(er) {
    error = er;
  });
  while (true) {
    handle.writeSync(flushFlag, chunk,
    // in
    inOff,
    // in_off
    availInBefore,
    // in_len
    buffer,
    // out
    offset,
    // out_off
    availOutBefore); // out_len
    if (error) throw error;else if (self[kError]) throw self[kError];
    availOutAfter = state[0];
    availInAfter = state[1];
    var inDelta = availInBefore - availInAfter;
    inputRead += inDelta;
    var have = availOutBefore - availOutAfter;
    if (have > 0) {
      var out = buffer.slice(offset, offset + have);
      offset += have;
      buffers.push(out);
      nread += out.byteLength;
      if (nread > self._maxOutputLength) {
        _close(self);
        throw new ERR_BUFFER_TOO_LARGE(self._maxOutputLength);
      }
    } else {
      assert(have === 0, 'have should not go down');
    }

    // Exhausted the output buffer, or used all the input create a new one.
    if (availOutAfter === 0 || offset >= chunkSize) {
      availOutBefore = chunkSize;
      offset = 0;
      buffer = Buffer.allocUnsafe(chunkSize);
    }
    if (availOutAfter === 0) {
      // Not actually done. Need to reprocess.
      // Also, update the availInBefore to the availInAfter value,
      // so that if we have to hit it a third (fourth, etc.) time,
      // it'll have the correct byte counts.
      inOff += inDelta;
      availInBefore = availInAfter;
    } else {
      break;
    }
  }
  self.bytesWritten = inputRead;
  _close(self);
  if (nread === 0) return new FastBuffer();
  return buffers.length === 1 ? buffers[0] : Buffer.concat(buffers, nread);
}
function processChunk(self, chunk, flushFlag, cb) {
  var handle = self._handle;
  if (!handle) return process.nextTick(cb);
  handle.buffer = chunk;
  handle.cb = cb;
  handle.availOutBefore = self._chunkSize - self._outOffset;
  handle.availInBefore = chunk.byteLength;
  handle.inOff = 0;
  handle.flushFlag = flushFlag;
  handle.write(flushFlag, chunk,
  // in
  0,
  // in_off
  handle.availInBefore,
  // in_len
  self._outBuffer,
  // out
  self._outOffset,
  // out_off
  handle.availOutBefore); // out_len
}
function processCallback() {
  // This callback's context (`this`) is the `_handle` (ZCtx) object. It is
  // important to null out the values once they are no longer needed since
  // `_handle` can stay in memory long after the buffer is needed.
  var handle = this;
  var self = this[owner_symbol];
  var state = self._writeState;
  if (self.destroyed) {
    this.buffer = null;
    this.cb();
    return;
  }
  var availOutAfter = state[0];
  var availInAfter = state[1];
  var inDelta = handle.availInBefore - availInAfter;
  self.bytesWritten += inDelta;
  var have = handle.availOutBefore - availOutAfter;
  var streamBufferIsFull = false;
  if (have > 0) {
    var out = self._outBuffer.slice(self._outOffset, self._outOffset + have);
    self._outOffset += have;
    streamBufferIsFull = !self.push(out);
  } else {
    assert(have === 0, 'have should not go down');
  }
  if (self.destroyed) {
    this.cb();
    return;
  }

  // Exhausted the output buffer, or used all the input create a new one.
  if (availOutAfter === 0 || self._outOffset >= self._chunkSize) {
    handle.availOutBefore = self._chunkSize;
    self._outOffset = 0;
    self._outBuffer = Buffer.allocUnsafe(self._chunkSize);
  }
  if (availOutAfter === 0) {
    // Not actually done. Need to reprocess.
    // Also, update the availInBefore to the availInAfter value,
    // so that if we have to hit it a third (fourth, etc.) time,
    // it'll have the correct byte counts.
    handle.inOff += inDelta;
    handle.availInBefore = availInAfter;
    if (!streamBufferIsFull) {
      this.write(handle.flushFlag, this.buffer,
      // in
      handle.inOff,
      // in_off
      handle.availInBefore,
      // in_len
      self._outBuffer,
      // out
      self._outOffset,
      // out_off
      self._chunkSize); // out_len
    } else {
      var oldRead = self._read;
      self._read = n => {
        self._read = oldRead;
        this.write(handle.flushFlag, this.buffer,
        // in
        handle.inOff,
        // in_off
        handle.availInBefore,
        // in_len
        self._outBuffer,
        // out
        self._outOffset,
        // out_off
        self._chunkSize); // out_len
        self._read(n);
      };
    }
    return;
  }
  if (availInAfter > 0) {
    // If we have more input that should be written, but we also have output
    // space available, that means that the compression library was not
    // interested in receiving more data, and in particular that the input
    // stream has ended early.
    // This applies to streams where we don't check data past the end of
    // what was consumed; that is, everything except Gunzip/Unzip.

    if (self._rejectGarbageAfterEnd) {
      var err = new ERR_TRAILING_JUNK_AFTER_STREAM_END();
      self.destroy(err);
      this.cb(err);
      return;
    }
    self.push(null);
  }

  // Finished with the chunk.
  this.buffer = null;
  this.cb();
}

/**
 * @param {ZlibBase} engine
 * @private
 */
function _close(engine) {
  // Caller may invoke .close after a zlib error (which will null _handle)
  engine._handle?.close();
  engine._handle = null;
}
var zlibDefaultOpts = {
  flush: Z_NO_FLUSH,
  finishFlush: Z_FINISH,
  fullFlush: Z_FULL_FLUSH
};
// Base class for all streams actually backed by zlib and using zlib-specific
// parameters.
function Zlib(opts, mode) {
  var windowBits = Z_DEFAULT_WINDOWBITS;
  var level = Z_DEFAULT_COMPRESSION;
  var memLevel = Z_DEFAULT_MEMLEVEL;
  var strategy = Z_DEFAULT_STRATEGY;
  var dictionary;
  if (opts) {
    // windowBits is special. On the compression side, 0 is an invalid value.
    // But on the decompression side, a value of 0 for windowBits tells zlib
    // to use the window size in the zlib header of the compressed stream.
    if ((opts.windowBits == null || opts.windowBits === 0) && (mode === INFLATE || mode === GUNZIP || mode === UNZIP)) {
      windowBits = 0;
    } else {
      // `{ windowBits: 8 }` is valid for deflate but not gzip.
      var min = Z_MIN_WINDOWBITS + (mode === GZIP ? 1 : 0);
      windowBits = checkRangesOrGetDefault(opts.windowBits, 'options.windowBits', min, Z_MAX_WINDOWBITS, Z_DEFAULT_WINDOWBITS);
    }
    level = checkRangesOrGetDefault(opts.level, 'options.level', Z_MIN_LEVEL, Z_MAX_LEVEL, Z_DEFAULT_COMPRESSION);
    memLevel = checkRangesOrGetDefault(opts.memLevel, 'options.memLevel', Z_MIN_MEMLEVEL, Z_MAX_MEMLEVEL, Z_DEFAULT_MEMLEVEL);
    strategy = checkRangesOrGetDefault(opts.strategy, 'options.strategy', Z_DEFAULT_STRATEGY, Z_FIXED, Z_DEFAULT_STRATEGY);
    dictionary = opts.dictionary;
    if (dictionary !== undefined && !isArrayBufferView(dictionary)) {
      if (isAnyArrayBuffer(dictionary)) {
        dictionary = Buffer.from(dictionary);
      } else {
        throw new ERR_INVALID_ARG_TYPE('options.dictionary', ['Buffer', 'TypedArray', 'DataView', 'ArrayBuffer'], dictionary);
      }
    }
  }
  var handle = new binding.Zlib(mode);
  // Ideally, we could let ZlibBase() set up _writeState. I haven't been able
  // to come up with a good solution that doesn't break our internal API,
  // and with it all supported npm versions at the time of writing.
  this._writeState = new Uint32Array(2);
  handle.init(windowBits, level, memLevel, strategy, this._writeState, processCallback, dictionary);
  ZlibBase.call(this, opts, mode, handle, zlibDefaultOpts);
  this._level = level;
  this._strategy = strategy;
  this._mode = mode;
}
ObjectSetPrototypeOf(Zlib.prototype, ZlibBase.prototype);
ObjectSetPrototypeOf(Zlib, ZlibBase);

// This callback is used by `.params()` to wait until a full flush happened
// before adjusting the parameters. In particular, the call to the native
// `params()` function should not happen while a write is currently in progress
// on the threadpool.
function paramsAfterFlushCallback(level, strategy, callback) {
  assert(this._handle, 'zlib binding closed');
  this._handle.params(level, strategy);
  if (!this.destroyed) {
    this._level = level;
    this._strategy = strategy;
    if (callback) callback();
  }
}
Zlib.prototype.params = function params(level, strategy, callback) {
  checkRangesOrGetDefault(level, 'level', Z_MIN_LEVEL, Z_MAX_LEVEL);
  checkRangesOrGetDefault(strategy, 'strategy', Z_DEFAULT_STRATEGY, Z_FIXED);
  if (this._level !== level || this._strategy !== strategy) {
    this.flush(Z_SYNC_FLUSH, paramsAfterFlushCallback.bind(this, level, strategy, callback));
  } else {
    process.nextTick(callback);
  }
};

// generic zlib
// minimal 2-byte header
function Deflate(opts) {
  if (!(this instanceof Deflate)) {
    return deprecateInstantiation(Deflate, 'DEP0184', opts);
  }
  Zlib.call(this, opts, DEFLATE);
}
ObjectSetPrototypeOf(Deflate.prototype, Zlib.prototype);
ObjectSetPrototypeOf(Deflate, Zlib);
function Inflate(opts) {
  if (!(this instanceof Inflate)) {
    return deprecateInstantiation(Inflate, 'DEP0184', opts);
  }
  Zlib.call(this, opts, INFLATE);
}
ObjectSetPrototypeOf(Inflate.prototype, Zlib.prototype);
ObjectSetPrototypeOf(Inflate, Zlib);
function Gzip(opts) {
  if (!(this instanceof Gzip)) {
    return deprecateInstantiation(Gzip, 'DEP0184', opts);
  }
  Zlib.call(this, opts, GZIP);
}
ObjectSetPrototypeOf(Gzip.prototype, Zlib.prototype);
ObjectSetPrototypeOf(Gzip, Zlib);
function Gunzip(opts) {
  if (!(this instanceof Gunzip)) {
    return deprecateInstantiation(Gunzip, 'DEP0184', opts);
  }
  Zlib.call(this, opts, GUNZIP);
}
ObjectSetPrototypeOf(Gunzip.prototype, Zlib.prototype);
ObjectSetPrototypeOf(Gunzip, Zlib);
function DeflateRaw(opts) {
  if (opts && opts.windowBits === 8) opts.windowBits = 9;
  if (!(this instanceof DeflateRaw)) {
    return deprecateInstantiation(DeflateRaw, 'DEP0184', opts);
  }
  Zlib.call(this, opts, DEFLATERAW);
}
ObjectSetPrototypeOf(DeflateRaw.prototype, Zlib.prototype);
ObjectSetPrototypeOf(DeflateRaw, Zlib);
function InflateRaw(opts) {
  if (!(this instanceof InflateRaw)) {
    return deprecateInstantiation(InflateRaw, 'DEP0184', opts);
  }
  Zlib.call(this, opts, INFLATERAW);
}
ObjectSetPrototypeOf(InflateRaw.prototype, Zlib.prototype);
ObjectSetPrototypeOf(InflateRaw, Zlib);
function Unzip(opts) {
  if (!(this instanceof Unzip)) {
    return deprecateInstantiation(Unzip, 'DEP0184', opts);
  }
  Zlib.call(this, opts, UNZIP);
}
ObjectSetPrototypeOf(Unzip.prototype, Zlib.prototype);
ObjectSetPrototypeOf(Unzip, Zlib);
function createConvenienceMethod(ctor, sync) {
  if (sync) {
    return function syncBufferWrapper(buffer, opts) {
      return zlibBufferSync(new ctor(opts), buffer);
    };
  }
  return function asyncBufferWrapper(buffer, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    return zlibBuffer(new ctor(opts), buffer, callback);
  };
}
var kMaxBrotliParam = MathMax.apply(void 0, _toConsumableArray(ObjectEntries(constants).map(_ref2 => {
  var {
    0: key,
    1: value
  } = _ref2;
  return key.startsWith('BROTLI_PARAM_') ? value : 0;
})));
var brotliInitParamsArray = new Uint32Array(kMaxBrotliParam + 1);
var brotliDefaultOpts = {
  flush: BROTLI_OPERATION_PROCESS,
  finishFlush: BROTLI_OPERATION_FINISH,
  fullFlush: BROTLI_OPERATION_FLUSH
};
function Brotli(opts, mode) {
  assert(mode === BROTLI_DECODE || mode === BROTLI_ENCODE);
  brotliInitParamsArray.fill(-1);
  if (opts?.params) {
    ObjectKeys(opts.params).forEach(origKey => {
      var key = +origKey;
      if (NumberIsNaN(key) || key < 0 || key > kMaxBrotliParam || (brotliInitParamsArray[key] | 0) !== -1) {
        throw new ERR_BROTLI_INVALID_PARAM(origKey);
      }
      var value = opts.params[origKey];
      if (typeof value !== 'number' && typeof value !== 'boolean') {
        throw new ERR_INVALID_ARG_TYPE('options.params[key]', 'number', opts.params[origKey]);
      }
      brotliInitParamsArray[key] = value;
    });
  }
  var dictionary = opts?.dictionary;
  if (dictionary !== undefined && !isArrayBufferView(dictionary)) {
    if (isAnyArrayBuffer(dictionary)) {
      dictionary = Buffer.from(dictionary);
    } else {
      throw new ERR_INVALID_ARG_TYPE('options.dictionary', ['Buffer', 'TypedArray', 'DataView', 'ArrayBuffer'], dictionary);
    }
  }
  var handle = mode === BROTLI_DECODE ? new binding.BrotliDecoder(mode) : new binding.BrotliEncoder(mode);
  this._writeState = new Uint32Array(2);
  handle.init(brotliInitParamsArray, this._writeState, processCallback, dictionary);
  ZlibBase.call(this, opts, mode, handle, brotliDefaultOpts);
}
ObjectSetPrototypeOf(Brotli.prototype, Zlib.prototype);
ObjectSetPrototypeOf(Brotli, Zlib);
function BrotliCompress(opts) {
  if (!(this instanceof BrotliCompress)) {
    return deprecateInstantiation(BrotliCompress, 'DEP0184', opts);
  }
  Brotli.call(this, opts, BROTLI_ENCODE);
}
ObjectSetPrototypeOf(BrotliCompress.prototype, Brotli.prototype);
ObjectSetPrototypeOf(BrotliCompress, Brotli);
function BrotliDecompress(opts) {
  if (!(this instanceof BrotliDecompress)) {
    return deprecateInstantiation(BrotliDecompress, 'DEP0184', opts);
  }
  Brotli.call(this, opts, BROTLI_DECODE);
}
ObjectSetPrototypeOf(BrotliDecompress.prototype, Brotli.prototype);
ObjectSetPrototypeOf(BrotliDecompress, Brotli);
var zstdDefaultOpts = {
  flush: ZSTD_e_continue,
  finishFlush: ZSTD_e_end,
  fullFlush: ZSTD_e_flush
};
var Zstd = /*#__PURE__*/function (_ZlibBase) {
  function Zstd(opts, mode, initParamsArray, maxParam) {
    var _this;
    _classCallCheck(this, Zstd);
    assert(mode === ZSTD_COMPRESS || mode === ZSTD_DECOMPRESS);
    initParamsArray.fill(-1);
    if (opts?.params) {
      ObjectKeys(opts.params).forEach(origKey => {
        var key = +origKey;
        if (NumberIsNaN(key) || key < 0 || key > maxParam || (initParamsArray[key] | 0) !== -1) {
          throw new ERR_ZSTD_INVALID_PARAM(origKey);
        }
        var value = opts.params[origKey];
        if (typeof value !== 'number' && typeof value !== 'boolean') {
          throw new ERR_INVALID_ARG_TYPE('options.params[key]', 'number', opts.params[origKey]);
        }
        initParamsArray[key] = value;
      });
    }
    var handle = mode === ZSTD_COMPRESS ? new binding.ZstdCompress() : new binding.ZstdDecompress();
    var pledgedSrcSize = opts?.pledgedSrcSize ?? undefined;
    var writeState = new Uint32Array(2);
    handle.init(initParamsArray, pledgedSrcSize, writeState, processCallback, opts?.dictionary && isArrayBufferView(opts.dictionary) ? opts.dictionary : undefined);
    _this = _callSuper(this, Zstd, [opts, mode, handle, zstdDefaultOpts]);
    _this._writeState = writeState;
    return _this;
  }
  _inherits(Zstd, _ZlibBase);
  return _createClass(Zstd);
}(ZlibBase);
var kMaxZstdCParam = MathMax.apply(void 0, _toConsumableArray(ObjectKeys(constants).map(key => key.startsWith('ZSTD_c_') ? constants[key] : 0)));
var zstdInitCParamsArray = new Uint32Array(kMaxZstdCParam + 1);
var ZstdCompress = /*#__PURE__*/function (_Zstd) {
  function ZstdCompress(opts) {
    _classCallCheck(this, ZstdCompress);
    return _callSuper(this, ZstdCompress, [opts, ZSTD_COMPRESS, zstdInitCParamsArray, kMaxZstdCParam]);
  }
  _inherits(ZstdCompress, _Zstd);
  return _createClass(ZstdCompress);
}(Zstd);
var kMaxZstdDParam = MathMax.apply(void 0, _toConsumableArray(ObjectKeys(constants).map(key => key.startsWith('ZSTD_d_') ? constants[key] : 0)));
var zstdInitDParamsArray = new Uint32Array(kMaxZstdDParam + 1);
var ZstdDecompress = /*#__PURE__*/function (_Zstd2) {
  function ZstdDecompress(opts) {
    _classCallCheck(this, ZstdDecompress);
    return _callSuper(this, ZstdDecompress, [opts, ZSTD_DECOMPRESS, zstdInitDParamsArray, kMaxZstdDParam]);
  }
  _inherits(ZstdDecompress, _Zstd2);
  return _createClass(ZstdDecompress);
}(Zstd);
function createProperty(ctor) {
  return {
    __proto__: null,
    configurable: true,
    enumerable: true,
    value: function (options) {
      return new ctor(options);
    }
  };
}
function crc32(data) {
  var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (typeof data !== 'string' && !isArrayBufferView(data)) {
    throw new ERR_INVALID_ARG_TYPE('data', ['Buffer', 'TypedArray', 'DataView', 'string'], data);
  }
  validateUint32(value, 'value');
  // Coerce -0 to +0.
  value += 0;
  return crc32Native(data, value);
}

// Legacy alias on the C++ wrapper object. This is not public API, so we may
// want to runtime-deprecate it at some point. There's no hurry, though.
ObjectDefineProperty(binding.Zlib.prototype, 'jsref', {
  __proto__: null,
  get() {
    return this[owner_symbol];
  },
  set(v) {
    return this[owner_symbol] = v;
  }
});
module.exports = {
  crc32,
  Deflate,
  Inflate,
  Gzip,
  Gunzip,
  DeflateRaw,
  InflateRaw,
  Unzip,
  BrotliCompress,
  BrotliDecompress,
  ZstdCompress,
  ZstdDecompress,
  // Convenience methods.
  // compress/decompress a string or buffer in one step.
  deflate: createConvenienceMethod(Deflate, false),
  deflateSync: createConvenienceMethod(Deflate, true),
  gzip: createConvenienceMethod(Gzip, false),
  gzipSync: createConvenienceMethod(Gzip, true),
  deflateRaw: createConvenienceMethod(DeflateRaw, false),
  deflateRawSync: createConvenienceMethod(DeflateRaw, true),
  unzip: createConvenienceMethod(Unzip, false),
  unzipSync: createConvenienceMethod(Unzip, true),
  inflate: createConvenienceMethod(Inflate, false),
  inflateSync: createConvenienceMethod(Inflate, true),
  gunzip: createConvenienceMethod(Gunzip, false),
  gunzipSync: createConvenienceMethod(Gunzip, true),
  inflateRaw: createConvenienceMethod(InflateRaw, false),
  inflateRawSync: createConvenienceMethod(InflateRaw, true),
  brotliCompress: createConvenienceMethod(BrotliCompress, false),
  brotliCompressSync: createConvenienceMethod(BrotliCompress, true),
  brotliDecompress: createConvenienceMethod(BrotliDecompress, false),
  brotliDecompressSync: createConvenienceMethod(BrotliDecompress, true),
  zstdCompress: createConvenienceMethod(ZstdCompress, false),
  zstdCompressSync: createConvenienceMethod(ZstdCompress, true),
  zstdDecompress: createConvenienceMethod(ZstdDecompress, false),
  zstdDecompressSync: createConvenienceMethod(ZstdDecompress, true)
};
ObjectDefineProperties(module.exports, {
  createDeflate: createProperty(Deflate),
  createInflate: createProperty(Inflate),
  createDeflateRaw: createProperty(DeflateRaw),
  createInflateRaw: createProperty(InflateRaw),
  createGzip: createProperty(Gzip),
  createGunzip: createProperty(Gunzip),
  createUnzip: createProperty(Unzip),
  createBrotliCompress: createProperty(BrotliCompress),
  createBrotliDecompress: createProperty(BrotliDecompress),
  createZstdCompress: createProperty(ZstdCompress),
  createZstdDecompress: createProperty(ZstdDecompress),
  constants: {
    __proto__: null,
    configurable: false,
    enumerable: true,
    value: constants
  },
  codes: {
    __proto__: null,
    enumerable: true,
    writable: false,
    value: ObjectFreeze(codes)
  }
});

// These should be considered deprecated
// expose all the zlib constants
for (var {
  0: key,
  1: value
} of ObjectEntries(constants)) {
  if (key.startsWith('BROTLI')) continue;
  ObjectDefineProperty(module.exports, key, {
    __proto__: null,
    enumerable: false,
    value,
    writable: false
  });
}

