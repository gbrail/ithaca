/* eslint jsdoc/require-jsdoc: "error" */

'use strict';

var {
  ArrayIsArray,
  ArrayPrototypeIncludes,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  NumberIsFinite,
  NumberIsInteger,
  NumberIsNaN,
  NumberMAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER,
  NumberParseInt,
  ObjectPrototypeHasOwnProperty,
  RegExpPrototypeExec,
  String,
  StringPrototypeToUpperCase,
  StringPrototypeTrim
} = primordials;
var {
  codes: {
    ERR_INVALID_ARG_TYPE: {
      HideStackFramesError: ERR_INVALID_ARG_TYPE
    },
    ERR_INVALID_ARG_VALUE: {
      HideStackFramesError: ERR_INVALID_ARG_VALUE
    },
    ERR_INVALID_THIS: {
      HideStackFramesError: ERR_INVALID_THIS
    },
    ERR_OUT_OF_RANGE: {
      HideStackFramesError: ERR_OUT_OF_RANGE
    },
    ERR_SOCKET_BAD_PORT: {
      HideStackFramesError: ERR_SOCKET_BAD_PORT
    },
    ERR_UNKNOWN_SIGNAL: {
      HideStackFramesError: ERR_UNKNOWN_SIGNAL
    }
  },
  hideStackFrames
} = require('internal/errors');
var {
  normalizeEncoding
} = require('internal/util');
var {
  isAsyncFunction,
  isArrayBufferView,
  isRegExp
} = require('internal/util/types');
var {
  signals
} = internalBinding('constants').os;

/**
 * @param {*} value
 * @returns {boolean}
 */
function isInt32(value) {
  return value === (value | 0);
}

/**
 * @param {*} value
 * @returns {boolean}
 */
function isUint32(value) {
  return value === value >>> 0;
}
var octalReg = /^[0-7]+$/;
var modeDesc = 'must be a 32-bit unsigned integer or an octal string';

/**
 * Parse and validate values that will be converted into mode_t (the S_*
 * constants). Only valid numbers and octal strings are allowed. They could be
 * converted to 32-bit unsigned integers or non-negative signed integers in the
 * C++ land, but any value higher than 0o777 will result in platform-specific
 * behaviors.
 * @param {*} value Values to be validated
 * @param {string} name Name of the argument
 * @param {number} [def] If specified, will be returned for invalid values
 * @returns {number}
 */
function parseFileMode(value, name, def) {
  value ??= def;
  if (typeof value === 'string') {
    if (RegExpPrototypeExec(octalReg, value) === null) {
      throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
    }
    value = NumberParseInt(value, 8);
  }
  validateUint32(value, name);
  // Coerce -0 to +0.
  return value + 0;
}

/**
 * @callback validateInteger
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateInteger} */
var validateInteger = hideStackFrames(function (value, name) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : NumberMIN_SAFE_INTEGER;
  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : NumberMAX_SAFE_INTEGER;
  if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
  if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
});

/**
 * @callback validateInt32
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateInt32} */
var validateInt32 = hideStackFrames(function (value, name) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -2147483648;
  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2147483647;
  // The defaults for min and max correspond to the limits of 32-bit integers.
  if (typeof value !== 'number') {
    throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  }
  if (!NumberIsInteger(value)) {
    throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
  }
  if (value < min || value > max) {
    throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
  }
});

/**
 * @callback validateUint32
 * @param {*} value
 * @param {string} name
 * @param {boolean} [positive=false]
 * @returns {asserts value is number}
 */

/** @type {validateUint32} */
var validateUint32 = hideStackFrames(function (value, name) {
  var positive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (typeof value !== 'number') {
    throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  }
  if (!NumberIsInteger(value)) {
    throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
  }
  var min = positive ? 1 : 0;
  // 2 ** 32 === 4294967296
  var max = 4_294_967_295;
  if (value < min || value > max) {
    throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
  }
});

/**
 * @callback validateString
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is string}
 */

/** @type {validateString} */
var validateString = hideStackFrames((value, name) => {
  if (typeof value !== 'string') throw new ERR_INVALID_ARG_TYPE(name, 'string', value);
});

/**
 * @callback validateNumber
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateNumber} */
var validateNumber = hideStackFrames(function (value, name) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var max = arguments.length > 3 ? arguments[3] : undefined;
  if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value)) {
    throw new ERR_OUT_OF_RANGE(name, `${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${max != null ? `<= ${max}` : ''}`, value);
  }
});

/**
 * @callback validateOneOf
 * @template T
 * @param {T} value
 * @param {string} name
 * @param {T[]} oneOf
 */

/** @type {validateOneOf} */
var validateOneOf = hideStackFrames((value, name, oneOf) => {
  if (!ArrayPrototypeIncludes(oneOf, value)) {
    var allowed = ArrayPrototypeJoin(ArrayPrototypeMap(oneOf, v => typeof v === 'string' ? `'${v}'` : String(v)), ', ');
    var reason = 'must be one of: ' + allowed;
    throw new ERR_INVALID_ARG_VALUE(name, value, reason);
  }
});

/**
 * @callback validateBoolean
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is boolean}
 */

/** @type {validateBoolean} */
var validateBoolean = hideStackFrames((value, name) => {
  if (typeof value !== 'boolean') throw new ERR_INVALID_ARG_TYPE(name, 'boolean', value);
});
var kValidateObjectNone = 0;
var kValidateObjectAllowNullable = 1 << 0;
var kValidateObjectAllowArray = 1 << 1;
var kValidateObjectAllowFunction = 1 << 2;
var kValidateObjectAllowObjects = kValidateObjectAllowArray | kValidateObjectAllowFunction;
var kValidateObjectAllowObjectsAndNull = kValidateObjectAllowNullable | kValidateObjectAllowArray | kValidateObjectAllowFunction;

/**
 * @callback validateObject
 * @param {*} value
 * @param {string} name
 * @param {number} [options]
 */

/** @type {validateObject} */
var validateObject = hideStackFrames(function (value, name) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kValidateObjectNone;
  if (options === kValidateObjectNone) {
    if (value === null || ArrayIsArray(value)) {
      throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
    }
    if (typeof value !== 'object') {
      throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
    }
  } else {
    var throwOnNullable = (kValidateObjectAllowNullable & options) === 0;
    if (throwOnNullable && value === null) {
      throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
    }
    var throwOnArray = (kValidateObjectAllowArray & options) === 0;
    if (throwOnArray && ArrayIsArray(value)) {
      throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
    }
    var throwOnFunction = (kValidateObjectAllowFunction & options) === 0;
    var typeofValue = typeof value;
    if (typeofValue !== 'object' && (throwOnFunction || typeofValue !== 'function')) {
      throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
    }
  }
});

/**
 * @callback validateDictionary - We are using the Web IDL Standard definition
 *                                of "dictionary" here, which means any value
 *                                whose Type is either Undefined, Null, or
 *                                Object (which includes functions).
 * @param {*} value
 * @param {string} name
 * @see https://webidl.spec.whatwg.org/#es-dictionary
 * @see https://tc39.es/ecma262/#table-typeof-operator-results
 */

/** @type {validateDictionary} */
var validateDictionary = hideStackFrames((value, name) => {
  if (value != null && typeof value !== 'object' && typeof value !== 'function') {
    throw new ERR_INVALID_ARG_TYPE(name, 'a dictionary', value);
  }
});

/**
 * @callback validateArray
 * @param {*} value
 * @param {string} name
 * @param {number} [minLength]
 * @returns {asserts value is any[]}
 */

/** @type {validateArray} */
var validateArray = hideStackFrames(function (value, name) {
  var minLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  if (!ArrayIsArray(value)) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
  }
  if (value.length < minLength) {
    var reason = `must have a length of at least ${minLength}`;
    throw new ERR_INVALID_ARG_VALUE(name, value, reason);
  }
});

/**
 * @callback validateStringArray
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is string[]}
 */

/** @type {validateStringArray} */
var validateStringArray = hideStackFrames((value, name) => {
  validateArray(value, name);
  for (var i = 0; i < value.length; ++i) {
    // Don't use validateString here for performance reasons, as
    // we would generate intermediate strings for the name.
    if (typeof value[i] !== 'string') {
      throw new ERR_INVALID_ARG_TYPE(`${name}[${i}]`, 'string', value[i]);
    }
  }
});

/**
 * @callback validateBooleanArray
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is boolean[]}
 */

/** @type {validateBooleanArray} */
var validateBooleanArray = hideStackFrames((value, name) => {
  validateArray(value, name);
  for (var i = 0; i < value.length; ++i) {
    // Don't use validateBoolean here for performance reasons, as
    // we would generate intermediate strings for the name.
    if (value[i] !== true && value[i] !== false) {
      throw new ERR_INVALID_ARG_TYPE(`${name}[${i}]`, 'boolean', value[i]);
    }
  }
});

/**
 * @callback validateAbortSignalArray
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is AbortSignal[]}
 */

/** @type {validateAbortSignalArray} */
function validateAbortSignalArray(value, name) {
  validateArray(value, name);
  for (var i = 0; i < value.length; i++) {
    var signal = value[i];
    var indexedName = `${name}[${i}]`;
    if (signal == null) {
      throw new ERR_INVALID_ARG_TYPE(indexedName, 'AbortSignal', signal);
    }
    validateAbortSignal(signal, indexedName);
  }
}

/**
 * @param {*} signal
 * @param {string} [name='signal']
 * @returns {asserts signal is keyof signals}
 */
var validateSignalName = hideStackFrames(function (signal) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'signal';
  validateString(signal, name);
  if (signals[signal] === undefined) {
    if (signals[StringPrototypeToUpperCase(signal)] !== undefined) {
      throw new ERR_UNKNOWN_SIGNAL(signal + ' (signals must use all capital letters)');
    }
    throw new ERR_UNKNOWN_SIGNAL(signal);
  }
});

/**
 * @callback validateBuffer
 * @param {*} buffer
 * @param {string} [name='buffer']
 * @returns {asserts buffer is ArrayBufferView}
 */

/** @type {validateBuffer} */
var validateBuffer = hideStackFrames(function (buffer) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'buffer';
  if (!isArrayBufferView(buffer)) {
    throw new ERR_INVALID_ARG_TYPE(name, ['Buffer', 'TypedArray', 'DataView'], buffer);
  }
});

/**
 * @param {string} data
 * @param {string} encoding
 */
var validateEncoding = hideStackFrames((data, encoding) => {
  var normalizedEncoding = normalizeEncoding(encoding);
  var length = data.length;
  if (normalizedEncoding === 'hex' && length % 2 !== 0) {
    throw new ERR_INVALID_ARG_VALUE('encoding', encoding, `is invalid for data of length ${length}`);
  }
});

/**
 * Check that the port number is not NaN when coerced to a number,
 * is an integer and that it falls within the legal range of port numbers.
 * @param {*} port
 * @param {string} [name='Port']
 * @param {boolean} [allowZero=true]
 * @returns {number}
 */
var validatePort = hideStackFrames(function (port) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Port';
  var allowZero = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  if (typeof port !== 'number' && typeof port !== 'string' || typeof port === 'string' && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 0xFFFF || port === 0 && !allowZero) {
    throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
  }
  return port | 0;
});

/**
 * @callback validateAbortSignal
 * @param {*} signal
 * @param {string} name
 */

/** @type {validateAbortSignal} */
var validateAbortSignal = hideStackFrames((signal, name) => {
  if (signal !== undefined && (signal === null || typeof signal !== 'object' || !('aborted' in signal))) {
    throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
  }
});

/**
 * @callback validateFunction
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is Function}
 */

/** @type {validateFunction} */
var validateFunction = hideStackFrames((value, name) => {
  if (typeof value !== 'function') throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
});

/**
 * @callback validatePlainFunction
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is Function}
 */

/** @type {validatePlainFunction} */
var validatePlainFunction = hideStackFrames((value, name) => {
  if (typeof value !== 'function' || isAsyncFunction(value)) throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
});

/**
 * @callback validateUndefined
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is undefined}
 */

/** @type {validateUndefined} */
var validateUndefined = hideStackFrames((value, name) => {
  if (value !== undefined) throw new ERR_INVALID_ARG_TYPE(name, 'undefined', value);
});

/**
 * @template T
 * @param {T} value
 * @param {string} name
 * @param {T[]} union
 */
function validateUnion(value, name, union) {
  if (!ArrayPrototypeIncludes(union, value)) {
    throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, '|')}')`, value);
  }
}

/*
  The rules for the Link header field are described here:
  https://www.rfc-editor.org/rfc/rfc8288.html#section-3

  This regex validates any string surrounded by angle brackets
  (not necessarily a valid URI reference) followed by zero or more
  link-params separated by semicolons.
*/
var linkValueRegExp = /^(?:<[^>\r\n]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;

/**
 * @param {any} value
 * @param {string} name
 */
var validateLinkHeaderFormat = hideStackFrames((value, name) => {
  if (typeof value === 'undefined' || !RegExpPrototypeExec(linkValueRegExp, value)) {
    throw new ERR_INVALID_ARG_VALUE(name, value, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
});

/**
 * Validate provided `this` object by checking that it has specific own property
 * @param {any} object
 * @param {string|symbol} fieldKey
 * @param {string} className
 */
var validateThisInternalField = hideStackFrames((object, fieldKey, className) => {
  if (typeof object !== 'object' || object === null || !ObjectPrototypeHasOwnProperty(object, fieldKey)) {
    throw new ERR_INVALID_THIS(className);
  }
});

/**
 * @param {any} hints
 * @returns {string}
 */
var validateLinkHeaderValue = hideStackFrames(hints => {
  if (typeof hints === 'string') {
    validateLinkHeaderFormat.withoutStackTrace(hints, 'hints');
    return hints;
  } else if (ArrayIsArray(hints)) {
    var hintsLength = hints.length;
    var result = '';
    if (hintsLength === 0) {
      return result;
    }
    for (var i = 0; i < hintsLength; i++) {
      var link = hints[i];
      validateLinkHeaderFormat.withoutStackTrace(link, 'hints');
      result += link;
      if (i !== hintsLength - 1) {
        result += ', ';
      }
    }
    return result;
  }
  throw new ERR_INVALID_ARG_VALUE('hints', hints, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
});

/**
 * Validates a single ignore option element (string, RegExp, or Function).
 * @param {*} value
 * @param {string} name
 */
var validateIgnoreOptionElement = hideStackFrames((value, name) => {
  if (typeof value === 'string') {
    if (value.length === 0) throw new ERR_INVALID_ARG_VALUE(name, value, 'must be a non-empty string');
    return;
  }
  if (isRegExp(value)) return;
  if (typeof value === 'function') return;
  throw new ERR_INVALID_ARG_TYPE(name, ['string', 'RegExp', 'Function'], value);
});

/**
 * Validates the ignore option for fs.watch.
 * @param {*} value
 * @param {string} name
 */
var validateIgnoreOption = hideStackFrames((value, name) => {
  if (value == null) return;
  if (ArrayIsArray(value)) {
    for (var i = 0; i < value.length; i++) {
      validateIgnoreOptionElement(value[i], `${name}[${i}]`);
    }
    return;
  }
  validateIgnoreOptionElement(value, name);
});

// 1. Returns false for undefined and NaN
// 2. Returns true for finite numbers
// 3. Throws ERR_INVALID_ARG_TYPE for non-numbers
// 4. Throws ERR_OUT_OF_RANGE for infinite numbers
var validateFiniteNumber = hideStackFrames((number, name) => {
  // Common case
  if (number === undefined) {
    return false;
  }
  if (NumberIsFinite(number)) {
    return true; // Is a valid number
  }
  if (NumberIsNaN(number)) {
    return false;
  }
  validateNumber(number, name);

  // Infinite numbers
  throw new ERR_OUT_OF_RANGE(name, 'a finite number', number);
});

// 1. Returns def for number when it's undefined or NaN
// 2. Returns number for finite numbers >= lower and <= upper
// 3. Throws ERR_INVALID_ARG_TYPE for non-numbers
// 4. Throws ERR_OUT_OF_RANGE for infinite numbers or numbers > upper or < lower
var checkRangesOrGetDefault = hideStackFrames((number, name, lower, upper, def) => {
  if (!validateFiniteNumber(number, name)) {
    return def;
  }
  if (number < lower || number > upper) {
    throw new ERR_OUT_OF_RANGE(name, `>= ${lower} and <= ${upper}`, number);
  }
  return number;
});
module.exports = {
  isInt32,
  isUint32,
  parseFileMode,
  validateArray,
  validateStringArray,
  validateBooleanArray,
  validateAbortSignalArray,
  validateBoolean,
  validateBuffer,
  validateDictionary,
  validateEncoding,
  validateFunction,
  validateIgnoreOption,
  validateInt32,
  validateInteger,
  validateNumber,
  validateObject,
  kValidateObjectNone,
  kValidateObjectAllowNullable,
  kValidateObjectAllowArray,
  kValidateObjectAllowFunction,
  kValidateObjectAllowObjects,
  kValidateObjectAllowObjectsAndNull,
  validateOneOf,
  validatePlainFunction,
  validatePort,
  validateSignalName,
  validateString,
  validateUint32,
  validateUndefined,
  validateUnion,
  validateAbortSignal,
  validateLinkHeaderValue,
  validateThisInternalField,
  validateFiniteNumber,
  checkRangesOrGetDefault
};

