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

function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
var {
  ArrayIsArray,
  ArrayPrototypePop,
  ArrayPrototypePush,
  Error,
  ErrorCaptureStackTrace,
  FunctionPrototypeBind,
  NumberIsSafeInteger,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptors,
  ObjectGetOwnPropertyNames,
  ObjectKeys,
  ObjectSetPrototypeOf,
  ObjectValues,
  ReflectApply,
  RegExpPrototypeExec,
  SafeMap,
  StringPrototypeSlice,
  StringPrototypeToWellFormed
} = primordials;
var {
  ErrnoException,
  ExceptionWithHostPort,
  codes: {
    ERR_FALSY_VALUE_REJECTION,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_OUT_OF_RANGE
  },
  isErrorStackTraceLimitWritable
} = require('internal/errors');
var {
  Buffer
} = require('buffer');
var {
  format,
  formatWithOptions,
  inspect,
  stripVTControlCharacters
} = require('internal/util/inspect');
var {
  debuglog
} = require('internal/util/debuglog');
var {
  validateBoolean,
  validateFunction,
  validateNumber,
  validateString,
  validateOneOf,
  validateObject,
  validateInteger
} = require('internal/validators');
var {
  isReadableStream,
  isWritableStream,
  isNodeStream
} = require('internal/streams/utils');
var types = require('internal/util/types');
var utilColors;
function lazyUtilColors() {
  utilColors ??= require('internal/util/colors');
  return utilColors;
}
var {
  getOptionValue
} = require('internal/options');
var binding = internalBinding('util');
var {
  convertProcessSignalToExitCode,
  deprecate: internalDeprecate,
  getLazy,
  getSystemErrorMap,
  getSystemErrorName: internalErrorName,
  getSystemErrorMessage: internalErrorMessage,
  promisify,
  defineLazyProperties
} = require('internal/util');
var abortController;
function lazyAbortController() {
  abortController ??= require('internal/abort_controller');
  return abortController;
}
var internalDeepEqual;

// Pre-computed ANSI escape code constants
var kEscape = '\u001b[';
var kEscapeEnd = 'm';

// Codes for dim (2) and bold (1) - these share close code 22
var kDimCode = 2;
var kBoldCode = 1;

// Close sequence for 24-bit foreground colors (reset to default foreground)
var kHexCloseSeq = kEscape + '39' + kEscapeEnd;
var styleCache;
var kHexStyleCacheMax = 256;
var hexStyleCache;
function getHexStyleCache() {
  hexStyleCache ??= new SafeMap();
  return hexStyleCache;
}
function getStyleCache() {
  if (styleCache === undefined) {
    styleCache = {
      __proto__: null
    };
    var colors = inspect.colors;
    for (var key of ObjectGetOwnPropertyNames(colors)) {
      var codes = colors[key];
      if (codes) {
        var openNum = codes[0];
        var closeNum = codes[1];
        styleCache[key] = {
          __proto__: null,
          openSeq: kEscape + openNum + kEscapeEnd,
          closeSeq: kEscape + closeNum + kEscapeEnd,
          keepClose: openNum === kDimCode || openNum === kBoldCode
        };
      }
    }
  }
  return styleCache;
}

/**
 * Returns the cached ANSI escape sequences for a hex color.
 * Computes and caches on first use to avoid repeated Buffer allocations.
 * @param {string} hex A valid hex color string (#RGB or #RRGGBB)
 * @returns {{openSeq: string, closeSeq: string}}
 */
function getHexStyle(hex) {
  var cache = getHexStyleCache();
  var cached = cache.get(hex);
  if (cached !== undefined) return cached;
  var {
    0: r,
    1: g,
    2: b
  } = hexToRgb(hex);
  var style = {
    __proto__: null,
    openSeq: kEscape + rgbToAnsi24Bit(r, g, b) + kEscapeEnd,
    closeSeq: kHexCloseSeq
  };
  if (cache.size >= kHexStyleCacheMax) cache.delete(cache.keys().next().value);
  cache.set(hex, style);
  return style;
}
function replaceCloseCode(str, closeSeq, openSeq, keepClose) {
  var closeLen = closeSeq.length;
  var index = str.indexOf(closeSeq);
  if (index === -1) return str;
  var result = '';
  var lastIndex = 0;
  var replacement = keepClose ? closeSeq + openSeq : openSeq;
  do {
    var afterClose = index + closeLen;
    if (afterClose < str.length) {
      result += str.slice(lastIndex, index) + replacement;
      lastIndex = afterClose;
    } else {
      break;
    }
    index = str.indexOf(closeSeq, lastIndex);
  } while (index !== -1);
  return result + str.slice(lastIndex);
}

// Matches #RGB or #RRGGBB
var hexColorRegExp = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Parses a hex color string into RGB components.
 * Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) formats.
 * @param {string} hex A valid hex color string
 * @returns {Buffer} The RGB components
 */
function hexToRgb(hex) {
  // Normalize to 6 digits
  var hexStr;
  if (hex.length === 4) {
    // Expand #RGB to #RRGGBB
    hexStr = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  } else if (hex.length === 7) {
    hexStr = StringPrototypeSlice(hex, 1);
  } else {
    throw new ERR_OUT_OF_RANGE('hex', '#RGB or #RRGGBB', hex);
  }

  // TODO(araujogui): use Uint8Array.fromHex
  return Buffer.from(hexStr, 'hex');
}

/**
 * Generates the ANSI TrueColor (24-bit) escape sequence for a foreground color.
 * @param {number} r Red component (0-255)
 * @param {number} g Green component (0-255)
 * @param {number} b Blue component (0-255)
 * @returns {string} The ANSI escape sequence
 */
function rgbToAnsi24Bit(r, g, b) {
  return `38;2;${r};${g};${b}`;
}

/**
 * @param {string | string[]} format
 * @param {string} text
 * @param {object} [options]
 * @param {boolean} [options.validateStream] - Whether to validate the stream.
 * @param {Stream} [options.stream] - The stream used for validation.
 * @returns {string}
 */
function styleText(format, text, options) {
  var validateStream = options?.validateStream ?? true;
  var cache = getStyleCache();

  // Fast path: single format string with validateStream=false
  if (!validateStream && typeof format === 'string' && typeof text === 'string') {
    if (format === 'none') return text;
    var style = cache[format];
    if (style !== undefined) {
      var processed = replaceCloseCode(text, style.closeSeq, style.openSeq, style.keepClose);
      return style.openSeq + processed + style.closeSeq;
    }
    if (format[0] === '#') {
      var hexStyle = getHexStyleCache().get(format);
      if (hexStyle === undefined && RegExpPrototypeExec(hexColorRegExp, format) !== null) {
        hexStyle = getHexStyle(format);
      }
      if (hexStyle !== undefined) {
        var _processed = replaceCloseCode(text, hexStyle.closeSeq, hexStyle.openSeq, false);
        return hexStyle.openSeq + _processed + hexStyle.closeSeq;
      }
    }
  }
  validateString(text, 'text');
  if (options !== undefined) {
    validateObject(options, 'options');
  }
  validateBoolean(validateStream, 'options.validateStream');
  var skipColorize;
  if (validateStream) {
    var stream = options?.stream ?? process.stdout;
    if (!isReadableStream(stream) && !isWritableStream(stream) && !isNodeStream(stream)) {
      throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream);
    }
    skipColorize = !lazyUtilColors().shouldColorize(stream);
  }
  var formatArray = ArrayIsArray(format) ? format : [format];
  var openCodes = '';
  var closeCodes = '';
  var processedText = text;
  for (var key of formatArray) {
    if (key === 'none') continue;
    if (typeof key === 'string' && key[0] === '#') {
      var _hexStyle = getHexStyleCache().get(key);
      if (_hexStyle === undefined) {
        if (RegExpPrototypeExec(hexColorRegExp, key) === null) {
          throw new ERR_INVALID_ARG_VALUE('format', key, 'must be a valid hex color (#RGB or #RRGGBB)');
        }
        if (skipColorize) continue;
        _hexStyle = getHexStyle(key);
      } else if (skipColorize) {
        continue;
      }
      openCodes += _hexStyle.openSeq;
      closeCodes = _hexStyle.closeSeq + closeCodes;
      processedText = replaceCloseCode(processedText, _hexStyle.closeSeq, _hexStyle.openSeq, false);
      continue;
    }
    var _style = cache[key];
    if (_style === undefined) {
      validateOneOf(key, 'format', ObjectGetOwnPropertyNames(inspect.colors));
    }
    openCodes += _style.openSeq;
    closeCodes = _style.closeSeq + closeCodes;
    processedText = replaceCloseCode(processedText, _style.closeSeq, _style.openSeq, _style.keepClose);
  }
  if (skipColorize) return text;
  return `${openCodes}${processedText}${closeCodes}`;
}

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 * @param {Function} ctor Constructor function which needs to inherit the
 *   prototype.
 * @param {Function} superCtor Constructor function to inherit prototype from.
 * @throws {TypeError} Will error if either constructor is null, or if
 * the super constructor lacks a prototype.
 */
function inherits(ctor, superCtor) {
  if (ctor === undefined || ctor === null) throw new ERR_INVALID_ARG_TYPE('ctor', 'Function', ctor);
  if (superCtor === undefined || superCtor === null) throw new ERR_INVALID_ARG_TYPE('superCtor', 'Function', superCtor);
  if (superCtor.prototype === undefined) {
    throw new ERR_INVALID_ARG_TYPE('superCtor.prototype', 'Object', superCtor.prototype);
  }
  ObjectDefineProperty(ctor, 'super_', {
    __proto__: null,
    value: superCtor,
    writable: true,
    configurable: true
  });
  ObjectSetPrototypeOf(ctor.prototype, superCtor.prototype);
}

/**
 * @deprecated since v6.0.0
 * @template T
 * @template S
 * @param {T} target
 * @param {S} source
 * @returns {(T & S) | null}
 */
function _extend(target, source) {
  // Don't do anything if source isn't an object
  if (source === null || typeof source !== 'object') return target;
  var keys = ObjectKeys(source);
  var i = keys.length;
  while (i--) {
    target[keys[i]] = source[keys[i]];
  }
  return target;
}
var callbackifyOnRejected = (reason, cb) => {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    reason = new ERR_FALSY_VALUE_REJECTION.HideStackFramesError(reason);
    ErrorCaptureStackTrace(reason, callbackifyOnRejected);
  }
  return cb(reason);
};

/**
 * Converts a Promise-returning function to callback style
 * @param {Function} original
 * @returns {Function}
 */
function callbackify(original) {
  validateFunction(original, 'original');

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var maybeCb = ArrayPrototypePop(args);
    validateFunction(maybeCb, 'last argument');
    var cb = FunctionPrototypeBind(maybeCb, this);
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    ReflectApply(original, this, args).then(ret => process.nextTick(cb, null, ret), rej => process.nextTick(callbackifyOnRejected, rej, cb));
  }
  var descriptors = ObjectGetOwnPropertyDescriptors(original);
  // It is possible to manipulate a functions `length` or `name` property. This
  // guards against the manipulation.
  if (typeof descriptors.length.value === 'number') {
    descriptors.length.value++;
  }
  if (typeof descriptors.name.value === 'string') {
    descriptors.name.value += 'Callbackified';
  }
  var propertiesValues = ObjectValues(descriptors);
  for (var i = 0; i < propertiesValues.length; i++) {
    // We want to use null-prototype objects to not rely on globally mutable
    // %Object.prototype%.
    ObjectSetPrototypeOf(propertiesValues[i], null);
  }
  ObjectDefineProperties(callbackified, descriptors);
  return callbackified;
}

/**
 * @param {number} err
 * @returns {string}
 */
function getSystemErrorMessage(err) {
  validateNumber(err, 'err');
  if (err >= 0 || !NumberIsSafeInteger(err)) {
    throw new ERR_OUT_OF_RANGE('err', 'a negative integer', err);
  }
  return internalErrorMessage(err);
}

/**
 * @param {number} err
 * @returns {string}
 */
function getSystemErrorName(err) {
  validateNumber(err, 'err');
  if (err >= 0 || !NumberIsSafeInteger(err)) {
    throw new ERR_OUT_OF_RANGE('err', 'a negative integer', err);
  }
  return internalErrorName(err);
}
function _errnoException() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  if (isErrorStackTraceLimitWritable()) {
    var limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    var e = _construct(ErrnoException, args);
    Error.stackTraceLimit = limit;
    ErrorCaptureStackTrace(e, _errnoException);
    return e;
  }
  return _construct(ErrnoException, args);
}
function _exceptionWithHostPort() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }
  if (isErrorStackTraceLimitWritable()) {
    var limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    var e = _construct(ExceptionWithHostPort, args);
    Error.stackTraceLimit = limit;
    ErrorCaptureStackTrace(e, _exceptionWithHostPort);
    return e;
  }
  return _construct(ExceptionWithHostPort, args);
}

/**
 * Parses the content of a `.env` file.
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseEnv(content) {
  validateString(content, 'content');
  return binding.parseEnv(content);
}
var lazySourceMap = getLazy(() => require('internal/source_map/source_map_cache'));

/**
 * @typedef {object} CallSite // The call site
 * @property {string} scriptName // The name of the resource that contains the
 *   script for the function for this StackFrame
 * @property {string} functionName // The name of the function associated with this stack frame
 * @property {number} lineNumber // The number, 1-based, of the line for the associate function call
 * @property {number} columnNumber // The 1-based column offset on the line for the associated function call
 */

/**
 * @param {CallSite} callSite // The call site object to reconstruct from source map
 * @returns {CallSite | undefined} // The reconstructed call site object
 */
function reconstructCallSite(callSite) {
  var {
    scriptName,
    lineNumber,
    columnNumber
  } = callSite;
  var sourceMap = lazySourceMap().findSourceMap(scriptName);
  if (!sourceMap) return;
  var entry = sourceMap.findEntry(lineNumber - 1, columnNumber - 1);
  if (!entry?.originalSource) return;
  return {
    __proto__: null,
    // If the name is not found, it is an empty string to match the behavior of `util.getCallSite()`
    functionName: entry.name ?? '',
    scriptName: entry.originalSource,
    lineNumber: entry.originalLine + 1,
    column: entry.originalColumn + 1,
    columnNumber: entry.originalColumn + 1
  };
}

/**
 *
 * The call site array to map
 * @param {CallSite[]} callSites
 *   Array of objects with the reconstructed call site
 * @returns {CallSite[]}
 */
function mapCallSite(callSites) {
  var result = [];
  for (var i = 0; i < callSites.length; ++i) {
    var callSite = callSites[i];
    var found = reconstructCallSite(callSite);
    ArrayPrototypePush(result, found ?? callSite);
  }
  return result;
}

/**
 * @typedef {object} CallSiteOptions // The call site options
 * @property {boolean} sourceMap // Enable source map support
 */

/**
 * Returns the callSite
 * @param {number} frameCount
 * @param {CallSiteOptions} options
 * @returns {CallSite[]}
 */
function getCallSites() {
  var frameCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  var options = arguments.length > 1 ? arguments[1] : undefined;
  // If options is not provided check if frameCount is an object
  if (options === undefined) {
    if (typeof frameCount === 'object') {
      // If frameCount is an object, it is the options object
      options = frameCount;
      validateObject(options, 'options');
      if (options.sourceMap !== undefined) {
        validateBoolean(options.sourceMap, 'options.sourceMap');
      }
      frameCount = 10;
    } else {
      // If options is not provided, set it to an empty object
      options = {};
    }
    ;
  } else {
    // If options is provided, validate it
    validateObject(options, 'options');
    if (options.sourceMap !== undefined) {
      validateBoolean(options.sourceMap, 'options.sourceMap');
    }
  }

  // Using kDefaultMaxCallStackSizeToCapture as reference
  validateInteger(frameCount, 'frameCount', 1, 200);
  // If options.sourceMaps is true or if sourceMaps are enabled but the option.sourceMaps is not set explicitly to false
  if (options.sourceMap === true || getOptionValue('--enable-source-maps') && options.sourceMap !== false) {
    return mapCallSite(binding.getCallSites(frameCount));
  }
  return binding.getCallSites(frameCount);
}
;

// Public util.deprecate API
function deprecate(fn, msg, code) {
  var {
    modifyPrototype
  } = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return internalDeprecate(fn, msg, code, undefined, modifyPrototype);
}

// Keep the `exports =` so that various functions can still be monkeypatched
module.exports = {
  _errnoException,
  _exceptionWithHostPort,
  _extend: internalDeprecate(_extend, 'The `util._extend` API is deprecated. Please use Object.assign() instead.', 'DEP0060'),
  callbackify,
  convertProcessSignalToExitCode,
  debug: debuglog,
  debuglog,
  deprecate,
  format,
  styleText,
  formatWithOptions,
  getCallSites,
  getSystemErrorMap,
  getSystemErrorName,
  getSystemErrorMessage,
  inherits,
  inspect,
  isArray: internalDeprecate(ArrayIsArray, 'The `util.isArray` API is deprecated. Please use `Array.isArray()` instead.', 'DEP0044'),
  isDeepStrictEqual(a, b, skipPrototype) {
    if (internalDeepEqual === undefined) {
      internalDeepEqual = require('internal/util/comparisons').isDeepStrictEqual;
    }
    return internalDeepEqual(a, b, skipPrototype);
  },
  promisify,
  stripVTControlCharacters,
  toUSVString(input) {
    return StringPrototypeToWellFormed(`${input}`);
  },
  get transferableAbortSignal() {
    return lazyAbortController().transferableAbortSignal;
  },
  get transferableAbortController() {
    return lazyAbortController().transferableAbortController;
  },
  get aborted() {
    return lazyAbortController().aborted;
  },
  types,
  parseEnv
};
defineLazyProperties(module.exports, 'internal/util/parse_args/parse_args', ['parseArgs']);
defineLazyProperties(module.exports, 'internal/encoding', ['TextDecoder', 'TextEncoder']);
defineLazyProperties(module.exports, 'internal/mime', ['MIMEType', 'MIMEParams']);
defineLazyProperties(module.exports, 'internal/util/diff', ['diff']);
defineLazyProperties(module.exports, 'internal/util/trace_sigint', ['setTraceSigInt']);

