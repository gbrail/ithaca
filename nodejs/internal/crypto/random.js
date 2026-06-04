'use strict';

var {
  Array,
  ArrayBufferPrototypeGetByteLength,
  ArrayPrototypeForEach,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  ArrayPrototypeSplice,
  BigInt,
  BigIntPrototypeToString,
  DataView,
  DataViewPrototypeGetUint8,
  DateNow,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  MathMin,
  NumberIsNaN,
  NumberIsSafeInteger,
  NumberPrototypeToString,
  StringFromCharCodeApply,
  StringPrototypePadStart,
  TypedArrayPrototypeGetBuffer
} = primordials;
var {
  RandomBytesJob,
  RandomPrimeJob,
  CheckPrimeJob,
  kCryptoJobAsync,
  kCryptoJobSync,
  secureBuffer
} = internalBinding('crypto');
var {
  kEmptyObject,
  lazyDOMException
} = require('internal/util');
var {
  Buffer,
  kMaxLength
} = require('buffer');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_OPERATION_FAILED,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var {
  validateNumber,
  validateBoolean,
  validateFunction,
  validateInt32,
  validateObject
} = require('internal/validators');
var {
  isArrayBufferView,
  isAnyArrayBuffer,
  isTypedArray,
  isFloat16Array,
  isFloat32Array,
  isFloat64Array
} = require('internal/util/types');
var {
  FastBuffer
} = require('internal/buffer');
var kMaxInt32 = 2 ** 31 - 1;
var kMaxPossibleLength = MathMin(kMaxLength, kMaxInt32);
function assertOffset(offset, elementSize, length) {
  validateNumber(offset, 'offset');
  offset *= elementSize;
  var maxLength = MathMin(length, kMaxPossibleLength);
  if (NumberIsNaN(offset) || offset > maxLength || offset < 0) {
    throw new ERR_OUT_OF_RANGE('offset', `>= 0 && <= ${maxLength}`, offset);
  }
  return offset >>> 0; // Convert to uint32.
}
function assertSize(size, elementSize, offset, length) {
  validateNumber(size, 'size');
  size *= elementSize;
  if (NumberIsNaN(size) || size > kMaxPossibleLength || size < 0) {
    throw new ERR_OUT_OF_RANGE('size', `>= 0 && <= ${kMaxPossibleLength}`, size);
  }
  if (size + offset > length) {
    throw new ERR_OUT_OF_RANGE('size + offset', `<= ${length}`, size + offset);
  }
  return size >>> 0; // Convert to uint32.
}
function randomBytes(size, callback) {
  size = assertSize(size, 1, 0, Infinity);
  if (callback !== undefined) {
    validateFunction(callback, 'callback');
  }
  var buf = new FastBuffer(size);
  if (callback === undefined) {
    randomFillSync(TypedArrayPrototypeGetBuffer(buf), 0, size);
    return buf;
  }

  // Keep the callback as a regular function so this is propagated.
  randomFill(TypedArrayPrototypeGetBuffer(buf), 0, size, function (error) {
    if (error) return FunctionPrototypeCall(callback, this, error);
    FunctionPrototypeCall(callback, this, null, buf);
  });
}
function randomFillSync(buf) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var size = arguments.length > 2 ? arguments[2] : undefined;
  if (!isAnyArrayBuffer(buf) && !isArrayBufferView(buf)) {
    throw new ERR_INVALID_ARG_TYPE('buf', ['ArrayBuffer', 'ArrayBufferView'], buf);
  }
  var elementSize = buf.BYTES_PER_ELEMENT || 1;
  offset = assertOffset(offset, elementSize, buf.byteLength);
  if (size === undefined) {
    size = buf.byteLength - offset;
  } else {
    size = assertSize(size, elementSize, offset, buf.byteLength);
  }
  if (size === 0) return buf;
  var job = new RandomBytesJob(kCryptoJobSync, buf, offset, size);
  var err = job.run()[0];
  if (err) throw err;
  return buf;
}
function randomFill(buf, offset, size, callback) {
  if (!isAnyArrayBuffer(buf) && !isArrayBufferView(buf)) {
    throw new ERR_INVALID_ARG_TYPE('buf', ['ArrayBuffer', 'ArrayBufferView'], buf);
  }
  var elementSize = buf.BYTES_PER_ELEMENT || 1;
  if (typeof offset === 'function') {
    callback = offset;
    offset = 0;
    // Size is a length here, assertSize() call turns it into a number of bytes
    size = buf.length;
  } else if (typeof size === 'function') {
    callback = size;
    size = buf.length - offset;
  } else {
    validateFunction(callback, 'callback');
  }
  offset = assertOffset(offset, elementSize, buf.byteLength);
  if (size === undefined) {
    size = buf.byteLength - offset;
  } else {
    size = assertSize(size, elementSize, offset, buf.byteLength);
  }
  if (size === 0) {
    callback(null, buf);
    return;
  }
  var job = new RandomBytesJob(kCryptoJobAsync, buf, offset, size);
  job.ondone = FunctionPrototypeBind(onJobDone, job, buf, callback);
  job.run();
}

// Largest integer we can read from a buffer.
// e.g.: Buffer.from("ff".repeat(6), "hex").readUIntBE(0, 6);
var RAND_MAX = 0xFFFF_FFFF_FFFF;

// Cache random data to use in randomInt. The cache size must be evenly
// divisible by 6 because each attempt to obtain a random int uses 6 bytes.
var randomCache = new FastBuffer(6 * 1024);
var randomCacheOffset = randomCache.length;
var asyncCacheFillInProgress = false;
var asyncCachePendingTasks = [];

// Generates an integer in [min, max) range where min is inclusive and max is
// exclusive.
function randomInt(min, max, callback) {
  // Detect optional min syntax
  // randomInt(max)
  // randomInt(max, callback)
  var minNotSpecified = typeof max === 'undefined' || typeof max === 'function';
  if (minNotSpecified) {
    callback = max;
    max = min;
    min = 0;
  }
  var isSync = typeof callback === 'undefined';
  if (!isSync) {
    validateFunction(callback, 'callback');
  }
  if (!NumberIsSafeInteger(min)) {
    throw new ERR_INVALID_ARG_TYPE('min', 'a safe integer', min);
  }
  if (!NumberIsSafeInteger(max)) {
    throw new ERR_INVALID_ARG_TYPE('max', 'a safe integer', max);
  }
  if (max <= min) {
    throw new ERR_OUT_OF_RANGE('max', `greater than the value of "min" (${min})`, max);
  }

  // First we generate a random int between [0..range)
  var range = max - min;
  if (!(range <= RAND_MAX)) {
    throw new ERR_OUT_OF_RANGE(`max${minNotSpecified ? '' : ' - min'}`, `<= ${RAND_MAX}`, range);
  }

  // For (x % range) to produce an unbiased value greater than or equal to 0 and
  // less than range, x must be drawn randomly from the set of integers greater
  // than or equal to 0 and less than randLimit.
  var randLimit = RAND_MAX - RAND_MAX % range;

  // If we don't have a callback, or if there is still data in the cache, we can
  // do this synchronously, which is super fast.
  while (isSync || randomCacheOffset < randomCache.length) {
    if (randomCacheOffset === randomCache.length) {
      // This might block the thread for a bit, but we are in sync mode.
      randomFillSync(randomCache);
      randomCacheOffset = 0;
    }
    var x = randomCache.readUIntBE(randomCacheOffset, 6);
    randomCacheOffset += 6;
    if (x < randLimit) {
      var n = x % range + min;
      if (isSync) return n;
      process.nextTick(callback, undefined, n);
      return;
    }
  }

  // At this point, we are in async mode with no data in the cache. We cannot
  // simply refill the cache, because another async call to randomInt might
  // already be doing that. Instead, queue this call for when the cache has
  // been refilled.
  ArrayPrototypePush(asyncCachePendingTasks, {
    min,
    max,
    callback
  });
  asyncRefillRandomIntCache();
}
function asyncRefillRandomIntCache() {
  if (asyncCacheFillInProgress) return;
  asyncCacheFillInProgress = true;
  randomFill(randomCache, err => {
    asyncCacheFillInProgress = false;
    var tasks = asyncCachePendingTasks;
    var errorReceiver = err && ArrayPrototypeShift(tasks);
    if (!err) randomCacheOffset = 0;

    // Restart all pending tasks. If an error occurred, we only notify a single
    // callback (errorReceiver) about it. This way, every async call to
    // randomInt has a chance of being successful, and it avoids complex
    // exception handling here.
    ArrayPrototypeForEach(ArrayPrototypeSplice(tasks, 0), task => {
      randomInt(task.min, task.max, task.callback);
    });

    // This is the only call that might throw, and is therefore done at the end.
    if (errorReceiver) errorReceiver.callback(err);
  });
}
function onJobDone(buf, callback, error) {
  if (error) return FunctionPrototypeCall(callback, this, error);
  FunctionPrototypeCall(callback, this, null, buf);
}

// Really just the Web Crypto API alternative
// to require('crypto').randomFillSync() with an
// additional limitation that the input buffer is
// not allowed to exceed 65536 bytes, and can only
// be an integer-type TypedArray.
function getRandomValues(data) {
  if (!isTypedArray(data) || isFloat16Array(data) || isFloat32Array(data) || isFloat64Array(data)) {
    // Ordinarily this would be an ERR_INVALID_ARG_TYPE. However,
    // the Web Crypto API and web platform tests expect this to
    // be a DOMException with type TypeMismatchError.
    throw lazyDOMException('The data argument must be an integer-type TypedArray', 'TypeMismatchError');
  }
  if (data.byteLength > 65536) {
    var {
      QuotaExceededError
    } = internalBinding('messaging');
    throw new QuotaExceededError('The requested length exceeds 65,536 bytes');
  }
  randomFillSync(data, 0);
  return data;
}

// Implements an RFC 4122 version 4 random UUID.
// To improve performance, random data is generated in batches
// large enough to cover kBatchSize UUID's at a time. The uuidData
// buffer is reused. Each call to randomUUID() consumes 16 bytes
// from the buffer.

var kBatchSize = 128;
var uuidData;
var uuidNotBuffered;
var uuidBatch = 0;
var hexBytesCache;
function getHexBytes() {
  if (hexBytesCache === undefined) {
    hexBytesCache = new Array(256);
    for (var i = 0; i < hexBytesCache.length; i++) {
      var hex = NumberPrototypeToString(i, 16);
      hexBytesCache[i] = StringPrototypePadStart(hex, 2, '0');
    }
  }
  return hexBytesCache;
}
function serializeUUID(buf, version, variant) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var kHexBytes = getHexBytes();
  // xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return kHexBytes[buf[offset]] + kHexBytes[buf[offset + 1]] + kHexBytes[buf[offset + 2]] + kHexBytes[buf[offset + 3]] + '-' + kHexBytes[buf[offset + 4]] + kHexBytes[buf[offset + 5]] + '-' + kHexBytes[buf[offset + 6] & 0x0f | version] + kHexBytes[buf[offset + 7]] + '-' + kHexBytes[buf[offset + 8] & 0x3f | variant] + kHexBytes[buf[offset + 9]] + '-' + kHexBytes[buf[offset + 10]] + kHexBytes[buf[offset + 11]] + kHexBytes[buf[offset + 12]] + kHexBytes[buf[offset + 13]] + kHexBytes[buf[offset + 14]] + kHexBytes[buf[offset + 15]];
}
function getBufferedUUID() {
  uuidData ??= secureBuffer(16 * kBatchSize);
  if (uuidData === undefined) throw new ERR_OPERATION_FAILED('Out of memory');
  if (uuidBatch === 0) randomFillSync(uuidData);
  uuidBatch = (uuidBatch + 1) % kBatchSize;
  return serializeUUID(uuidData, 0x40, 0x80, uuidBatch * 16);
}
function getUnbufferedUUID() {
  uuidNotBuffered ??= secureBuffer(16);
  if (uuidNotBuffered === undefined) throw new ERR_OPERATION_FAILED('Out of memory');
  randomFillSync(uuidNotBuffered);
  return serializeUUID(uuidNotBuffered, 0x40, 0x80);
}
function randomUUID(options) {
  if (options !== undefined) validateObject(options, 'options');
  var {
    disableEntropyCache = false
  } = options || kEmptyObject;
  validateBoolean(disableEntropyCache, 'options.disableEntropyCache');
  return disableEntropyCache ? getUnbufferedUUID() : getBufferedUUID();
}
function writeTimestamp(buf, offset) {
  var now = DateNow();
  var msb = now / 2 ** 32;
  buf[offset] = msb >>> 8;
  buf[offset + 1] = msb;
  buf[offset + 2] = now >>> 24;
  buf[offset + 3] = now >>> 16;
  buf[offset + 4] = now >>> 8;
  buf[offset + 5] = now;
}
function getBufferedUUIDv7() {
  uuidData ??= secureBuffer(16 * kBatchSize);
  if (uuidData === undefined) throw new ERR_OPERATION_FAILED('Out of memory');
  if (uuidBatch === 0) randomFillSync(uuidData);
  uuidBatch = (uuidBatch + 1) % kBatchSize;
  var offset = uuidBatch * 16;
  writeTimestamp(uuidData, offset);
  return serializeUUID(uuidData, 0x70, 0x80, offset);
}
function getUnbufferedUUIDv7() {
  uuidNotBuffered ??= secureBuffer(16);
  if (uuidNotBuffered === undefined) throw new ERR_OPERATION_FAILED('Out of memory');
  randomFillSync(uuidNotBuffered, 6);
  writeTimestamp(uuidNotBuffered, 0);
  return serializeUUID(uuidNotBuffered, 0x70, 0x80);
}
function randomUUIDv7(options) {
  if (options !== undefined) validateObject(options, 'options');
  var {
    disableEntropyCache = false
  } = options || kEmptyObject;
  validateBoolean(disableEntropyCache, 'options.disableEntropyCache');
  return disableEntropyCache ? getUnbufferedUUIDv7() : getBufferedUUIDv7();
}
function createRandomPrimeJob(type, size, options) {
  validateObject(options, 'options');
  var {
    safe = false,
    bigint = false
  } = options;
  var {
    add,
    rem
  } = options;
  validateBoolean(safe, 'options.safe');
  validateBoolean(bigint, 'options.bigint');
  if (add !== undefined) {
    if (typeof add === 'bigint') {
      add = unsignedBigIntToBuffer(add, 'options.add');
    } else if (!isAnyArrayBuffer(add) && !isArrayBufferView(add)) {
      throw new ERR_INVALID_ARG_TYPE('options.add', ['ArrayBuffer', 'TypedArray', 'Buffer', 'DataView', 'bigint'], add);
    }
  }
  if (rem !== undefined) {
    if (typeof rem === 'bigint') {
      rem = unsignedBigIntToBuffer(rem, 'options.rem');
    } else if (!isAnyArrayBuffer(rem) && !isArrayBufferView(rem)) {
      throw new ERR_INVALID_ARG_TYPE('options.rem', ['ArrayBuffer', 'TypedArray', 'Buffer', 'DataView', 'bigint'], rem);
    }
  }
  var job = new RandomPrimeJob(type, size, safe, add, rem);
  job.result = bigint ? arrayBufferToUnsignedBigInt : p => p;
  return job;
}
function generatePrime(size, options, callback) {
  validateInt32(size, 'size', 1);
  if (typeof options === 'function') {
    callback = options;
    options = kEmptyObject;
  }
  validateFunction(callback, 'callback');
  var job = createRandomPrimeJob(kCryptoJobAsync, size, options);
  job.ondone = (err, prime) => {
    if (err) {
      callback(err);
      return;
    }
    callback(undefined, job.result(prime));
  };
  job.run();
}
function generatePrimeSync(size) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  validateInt32(size, 'size', 1);
  var job = createRandomPrimeJob(kCryptoJobSync, size, options);
  var {
    0: err,
    1: prime
  } = job.run();
  if (err) throw err;
  return job.result(prime);
}

/**
 * 48 is the ASCII code for '0', 97 is the ASCII code for 'a'.
 * @param {number} number An integer between 0 and 15.
 * @returns {number} corresponding to the ASCII code of the hex representation
 *   of the parameter.
 */
var numberToHexCharCode = number => (number < 10 ? 48 : 87) + number;

/**
 * @param {ArrayBuffer} buf An ArrayBuffer.
 * @returns {bigint}
 */
function arrayBufferToUnsignedBigInt(buf) {
  var length = ArrayBufferPrototypeGetByteLength(buf);
  var chars = Array(length * 2);
  var view = new DataView(buf);
  for (var i = 0; i < length; i++) {
    var val = DataViewPrototypeGetUint8(view, i);
    chars[2 * i] = numberToHexCharCode(val >> 4);
    chars[2 * i + 1] = numberToHexCharCode(val & 0xf);
  }
  return BigInt(`0x${StringFromCharCodeApply(chars)}`);
}
function unsignedBigIntToBuffer(bigint, name) {
  if (bigint < 0) {
    throw new ERR_OUT_OF_RANGE(name, '>= 0', bigint);
  }
  var hex = BigIntPrototypeToString(bigint, 16);
  var padded = StringPrototypePadStart(hex, hex.length + hex.length % 2, 0);
  return Buffer.from(padded, 'hex');
}
function checkPrime(candidate) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var callback = arguments.length > 2 ? arguments[2] : undefined;
  if (typeof candidate === 'bigint') candidate = unsignedBigIntToBuffer(candidate, 'candidate');
  if (!isAnyArrayBuffer(candidate) && !isArrayBufferView(candidate)) {
    throw new ERR_INVALID_ARG_TYPE('candidate', ['ArrayBuffer', 'TypedArray', 'Buffer', 'DataView', 'bigint'], candidate);
  }
  if (typeof options === 'function') {
    callback = options;
    options = kEmptyObject;
  }
  validateFunction(callback, 'callback');
  validateObject(options, 'options');
  var {
    checks = 0
  } = options;

  // The checks option is unsigned but must fit into a signed C int for OpenSSL.
  validateInt32(checks, 'options.checks', 0);
  // Coerce -0 to +0.
  checks += 0;
  var job = new CheckPrimeJob(kCryptoJobAsync, candidate, checks);
  job.ondone = callback;
  job.run();
}
function checkPrimeSync(candidate) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  if (typeof candidate === 'bigint') candidate = unsignedBigIntToBuffer(candidate, 'candidate');
  if (!isAnyArrayBuffer(candidate) && !isArrayBufferView(candidate)) {
    throw new ERR_INVALID_ARG_TYPE('candidate', ['ArrayBuffer', 'TypedArray', 'Buffer', 'DataView', 'bigint'], candidate);
  }
  validateObject(options, 'options');
  var {
    checks = 0
  } = options;

  // The checks option is unsigned but must fit into a signed C int for OpenSSL.
  validateInt32(checks, 'options.checks', 0);
  // Coerce -0 to +0.
  checks += 0;
  var job = new CheckPrimeJob(kCryptoJobSync, candidate, checks);
  var {
    0: err,
    1: result
  } = job.run();
  if (err) throw err;
  return result;
}
module.exports = {
  checkPrime,
  checkPrimeSync,
  randomBytes,
  randomFill,
  randomFillSync,
  randomInt,
  getRandomValues,
  randomUUID,
  randomUUIDv7,
  generatePrime,
  generatePrimeSync
};

