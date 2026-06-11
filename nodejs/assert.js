// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
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
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
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
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var waitForActual = _async(function (promiseFn) {
  var _exit = false;
  var resultPromise;
  if (typeof promiseFn === 'function') {
    // Return a rejected promise if `promiseFn` throws synchronously.
    resultPromise = promiseFn();
    // Fail in case no promise is returned.
    if (!checkIsPromise(resultPromise)) {
      throw new ERR_INVALID_RETURN_VALUE('instance of Promise', 'promiseFn', resultPromise);
    }
  } else if (checkIsPromise(promiseFn)) {
    resultPromise = promiseFn;
  } else {
    throw new ERR_INVALID_ARG_TYPE('promiseFn', ['Function', 'Promise'], promiseFn);
  }
  return _continue(_catch(function () {
    return _awaitIgnored(resultPromise);
  }, function (e) {
    _exit = true;
    return e;
  }), function (_result) {
    return _exit ? _result : NO_EXCEPTION_SENTINEL;
  });
});
var {
  ArrayPrototypeForEach,
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  Error,
  FunctionPrototypeCall,
  NumberIsNaN,
  ObjectAssign,
  ObjectDefineProperty,
  ObjectIs,
  ObjectKeys,
  ObjectPrototypeIsPrototypeOf,
  RegExpPrototypeExec,
  String: _String,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeSplit,
  Symbol: _Symbol
} = primordials;
var {
  codes: {
    ERR_AMBIGUOUS_ARGUMENT,
    ERR_CONSTRUCT_CALL_REQUIRED,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_RETURN_VALUE,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
var AssertionError = require('internal/assert/assertion_error');
var {
  inspect
} = require('internal/util/inspect');
var {
  isPromise,
  isRegExp
} = require('internal/util/types');
var {
  isError,
  setOwnProperty
} = require('internal/util');
var {
  innerOk,
  innerFail
} = require('internal/assert/utils');
var {
  validateFunction,
  validateOneOf
} = require('internal/validators');
var kOptions = _Symbol('options');
var isDeepEqual;
var isDeepStrictEqual;
var isPartialStrictEqual;
function lazyLoadComparison() {
  var comparison = require('internal/util/comparisons');
  isDeepEqual = comparison.isDeepEqual;
  isDeepStrictEqual = comparison.isDeepStrictEqual;
  isPartialStrictEqual = comparison.isPartialStrictEqual;
}

// The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

module.exports = assert;
var NO_EXCEPTION_SENTINEL = {};

/**
 * Assert options.
 * @typedef {object} AssertOptions
 * @property {'full'|'simple'} [diff='simple'] - If set to 'full', shows the full diff in assertion errors.
 * @property {boolean} [strict=true] - If set to true, non-strict methods behave like their corresponding
 *   strict methods.
 * @property {boolean} [skipPrototype=false] - If set to true, skips comparing prototypes
 *   in deep equality checks.
 */

/**
 * @class Assert
 * @param {AssertOptions} [options] - Optional configuration for assertions.
 * @throws {ERR_CONSTRUCT_CALL_REQUIRED} If not called with `new`.
 */
function Assert(options) {
  if (!(this instanceof Assert ? this.constructor : void 0)) {
    throw new ERR_CONSTRUCT_CALL_REQUIRED('Assert');
  }
  options = ObjectAssign({
    __proto__: null,
    strict: true,
    skipPrototype: false
  }, options);
  var allowedDiffs = ['simple', 'full'];
  if (options.diff !== undefined) {
    validateOneOf(options.diff, 'options.diff', allowedDiffs);
  }
  this.AssertionError = AssertionError;
  ObjectDefineProperty(this, kOptions, {
    __proto__: null,
    value: options,
    enumerable: false,
    configurable: false,
    writable: false
  });
  if (options.strict) {
    this.equal = this.strictEqual;
    this.deepEqual = this.deepStrictEqual;
    this.notEqual = this.notStrictEqual;
    this.notDeepEqual = this.notDeepStrictEqual;
  }
}

// All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided. All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

// DESTRUCTURING WARNING: All Assert.prototype methods use optional chaining
// (this?.[kOptions]) to safely access instance configuration. When methods are
// destructured from an Assert instance (e.g., const {strictEqual} = myAssert),
// they lose their `this` context and will use default behavior instead of the
// instance's custom options.

/**
 * Throws an AssertionError with the given message.
 * @param {any | Error} [message]
 */
Assert.prototype.fail = function fail(message) {
  if (isError(message)) throw message;
  var internalMessage = false;
  if (message === undefined) {
    message = 'Failed';
    internalMessage = true;
  }

  // IMPORTANT: When adding new references to `this`, ensure they use optional chaining
  // (this?.[kOptions]?.diff) to handle cases where the method is destructured from an
  // Assert instance and loses its context. Destructured methods will fall back
  // to default behavior when `this` is undefined.
  var errArgs = {
    operator: 'fail',
    stackStartFn: fail,
    message,
    diff: this?.[kOptions]?.diff
  };
  var err = new AssertionError(errArgs);
  if (internalMessage) {
    err.generatedMessage = true;
  }
  throw err;
};

// The AssertionError is defined in internal/error.
assert.AssertionError = AssertionError;

/**
 * Pure assertion tests whether a value is truthy, as determined
 * by !!value.
 * @param {...any} args
 * @returns {void}
 */
function assert() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  innerOk.apply(void 0, [assert].concat(args));
}

/**
 * Pure assertion tests whether a value is truthy, as determined
 * by !!value.
 * Duplicated as the other `ok` function is supercharged and exposed as default export.
 * @param {...any} args
 * @returns {void}
 */
Assert.prototype.ok = function ok() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  innerOk.apply(void 0, [ok].concat(args));
};

/**
 * The equality assertion tests shallow, coercive equality with ==.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.equal = function equal(actual, expected) {
  for (var _len3 = arguments.length, message = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    message[_key3 - 2] = arguments[_key3];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  // eslint-disable-next-line eqeqeq
  if (actual != expected && (!NumberIsNaN(actual) || !NumberIsNaN(expected))) {
    innerFail({
      actual,
      expected,
      message,
      operator: '==',
      stackStartFn: equal,
      diff: this?.[kOptions]?.diff
    });
  }
};

/**
 * The non-equality assertion tests for whether two objects are not
 * equal with !=.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.notEqual = function notEqual(actual, expected) {
  for (var _len4 = arguments.length, message = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
    message[_key4 - 2] = arguments[_key4];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  // eslint-disable-next-line eqeqeq
  if (actual == expected || NumberIsNaN(actual) && NumberIsNaN(expected)) {
    innerFail({
      actual,
      expected,
      message,
      operator: '!=',
      stackStartFn: notEqual,
      diff: this?.[kOptions]?.diff
    });
  }
};

/**
 * The deep equivalence assertion tests a deep equality relation.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.deepEqual = function deepEqual(actual, expected) {
  for (var _len5 = arguments.length, message = new Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
    message[_key5 - 2] = arguments[_key5];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (!isDeepEqual(actual, expected)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'deepEqual',
      stackStartFn: deepEqual,
      diff: this?.[kOptions]?.diff
    });
  }
};

/**
 * The deep non-equivalence assertion tests for any deep inequality.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.notDeepEqual = function notDeepEqual(actual, expected) {
  for (var _len6 = arguments.length, message = new Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
    message[_key6 - 2] = arguments[_key6];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (isDeepEqual(actual, expected)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'notDeepEqual',
      stackStartFn: notDeepEqual,
      diff: this?.[kOptions]?.diff
    });
  }
};

/**
 * The deep strict equivalence assertion tests a deep strict equality
 * relation.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.deepStrictEqual = function deepStrictEqual(actual, expected) {
  for (var _len7 = arguments.length, message = new Array(_len7 > 2 ? _len7 - 2 : 0), _key7 = 2; _key7 < _len7; _key7++) {
    message[_key7 - 2] = arguments[_key7];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (!isDeepStrictEqual(actual, expected, this?.[kOptions]?.skipPrototype)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'deepStrictEqual',
      stackStartFn: deepStrictEqual,
      diff: this?.[kOptions]?.diff
    });
  }
};

/**
 * The deep strict non-equivalence assertion tests for any deep strict
 * inequality.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected) {
  for (var _len8 = arguments.length, message = new Array(_len8 > 2 ? _len8 - 2 : 0), _key8 = 2; _key8 < _len8; _key8++) {
    message[_key8 - 2] = arguments[_key8];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (isDeepStrictEqual(actual, expected, this?.[kOptions]?.skipPrototype)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'notDeepStrictEqual',
      stackStartFn: notDeepStrictEqual,
      diff: this?.[kOptions]?.diff
    });
  }
}

/**
 * The strict equivalence assertion tests a strict equality relation.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.strictEqual = function strictEqual(actual, expected) {
  for (var _len9 = arguments.length, message = new Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
    message[_key9 - 2] = arguments[_key9];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (!ObjectIs(actual, expected)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'strictEqual',
      stackStartFn: strictEqual,
      diff: this?.[kOptions]?.diff
    });
  }
};

/**
 * The strict non-equivalence assertion tests for any strict inequality.
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.notStrictEqual = function notStrictEqual(actual, expected) {
  for (var _len0 = arguments.length, message = new Array(_len0 > 2 ? _len0 - 2 : 0), _key0 = 2; _key0 < _len0; _key0++) {
    message[_key0 - 2] = arguments[_key0];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (ObjectIs(actual, expected)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'notStrictEqual',
      stackStartFn: notStrictEqual,
      diff: this?.[kOptions]?.diff
    });
  }
};

/**
 * The strict equivalence assertion test between two objects
 * @param {any} actual
 * @param {any} expected
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.partialDeepStrictEqual = function partialDeepStrictEqual(actual, expected) {
  for (var _len1 = arguments.length, message = new Array(_len1 > 2 ? _len1 - 2 : 0), _key1 = 2; _key1 < _len1; _key1++) {
    message[_key1 - 2] = arguments[_key1];
  }
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (!isPartialStrictEqual(actual, expected)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'partialDeepStrictEqual',
      stackStartFn: partialDeepStrictEqual,
      diff: this?.[kOptions]?.diff
    });
  }
};
var Comparison = /*#__PURE__*/_createClass(function Comparison(obj, keys, actual) {
  _classCallCheck(this, Comparison);
  for (var key of keys) {
    if (key in obj) {
      if (actual !== undefined && typeof actual[key] === 'string' && isRegExp(obj[key]) && RegExpPrototypeExec(obj[key], actual[key]) !== null) {
        this[key] = actual[key];
      } else {
        this[key] = obj[key];
      }
    }
  }
});
function compareExceptionKey(actual, expected, key, message, keys, fn) {
  if (!(key in actual) || !isDeepStrictEqual(actual[key], expected[key])) {
    if (!message) {
      // Create placeholder objects to create a nice output.
      var a = new Comparison(actual, keys);
      var b = new Comparison(expected, keys, actual);
      var err = new AssertionError({
        actual: a,
        expected: b,
        operator: 'deepStrictEqual',
        stackStartFn: fn,
        diff: this?.[kOptions]?.diff
      });
      err.actual = actual;
      err.expected = expected;
      err.operator = fn.name;
      throw err;
    }
    innerFail({
      actual,
      expected,
      message: [message],
      operator: fn.name,
      stackStartFn: fn,
      diff: this?.[kOptions]?.diff
    });
  }
}
function expectedException(actual, expected, message, fn) {
  var generatedMessage = false;
  var throwError = false;
  if (typeof expected !== 'function') {
    // Handle regular expressions.
    if (isRegExp(expected)) {
      var str = _String(actual);
      if (RegExpPrototypeExec(expected, str) !== null) return;
      if (!message) {
        generatedMessage = true;
        message = 'The input did not match the regular expression ' + `${inspect(expected)}. Input:\n\n${inspect(str)}\n`;
      }
      throwError = true;
      // Handle primitives properly.
    } else if (typeof actual !== 'object' || actual === null) {
      var err = new AssertionError({
        actual,
        expected,
        message,
        operator: 'deepStrictEqual',
        stackStartFn: fn,
        diff: this?.[kOptions]?.diff
      });
      err.operator = fn.name;
      throw err;
    } else {
      // Handle validation objects.
      var keys = ObjectKeys(expected);
      // Special handle errors to make sure the name and the message are
      // compared as well.
      if (expected instanceof Error) {
        ArrayPrototypePush(keys, 'name', 'message');
      } else if (keys.length === 0) {
        throw new ERR_INVALID_ARG_VALUE('error', expected, 'may not be an empty object');
      }
      if (isDeepEqual === undefined) lazyLoadComparison();
      for (var key of keys) {
        if (typeof actual[key] === 'string' && isRegExp(expected[key]) && RegExpPrototypeExec(expected[key], actual[key]) !== null) {
          continue;
        }
        compareExceptionKey(actual, expected, key, message, keys, fn);
      }
      return;
    }
    // Guard instanceof against arrow functions as they don't have a prototype.
    // Check for matching Error classes.
  } else if (expected.prototype !== undefined && actual instanceof expected) {
    return;
  } else if (ObjectPrototypeIsPrototypeOf(Error, expected)) {
    if (!message) {
      generatedMessage = true;
      message = 'The error is expected to be an instance of ' + `"${expected.name}". Received `;
      if (isError(actual)) {
        var name = actual.constructor?.name || actual.name;
        if (expected.name === name) {
          message += 'an error with identical name but a different prototype.';
        } else {
          message += `"${name}"`;
        }
        if (actual.message) {
          message += `\n\nError message:\n\n${actual.message}`;
        }
      } else {
        message += `"${inspect(actual, {
          depth: -1
        })}"`;
      }
    }
    throwError = true;
  } else {
    // Check validation functions return value.
    var res = FunctionPrototypeCall(expected, {}, actual);
    if (res !== true) {
      if (!message) {
        generatedMessage = true;
        var _name = expected.name ? `"${expected.name}" ` : '';
        message = `The ${_name}validation function is expected to return` + ` "true". Received ${inspect(res)}`;
        if (isError(actual)) {
          message += `\n\nCaught error:\n\n${actual}`;
        }
      }
      throwError = true;
    }
  }
  if (throwError) {
    var _err = new AssertionError({
      actual,
      expected,
      message,
      operator: fn.name,
      stackStartFn: fn,
      diff: this?.[kOptions]?.diff
    });
    _err.generatedMessage = generatedMessage;
    throw _err;
  }
}
function getActual(fn) {
  validateFunction(fn, 'fn');
  try {
    fn();
  } catch (e) {
    return e;
  }
  return NO_EXCEPTION_SENTINEL;
}
function checkIsPromise(obj) {
  // Accept native ES6 promises and promises that are implemented in a similar
  // way. Do not accept thenables that use a function as `obj` and that have no
  // `catch` handler.
  return isPromise(obj) || obj !== null && typeof obj === 'object' && typeof obj.then === 'function' && typeof obj.catch === 'function';
}
function expectsError(stackStartFn, actual, error, message) {
  if (typeof error === 'string') {
    if (arguments.length === 4) {
      throw new ERR_INVALID_ARG_TYPE('error', ['Object', 'Error', 'Function', 'RegExp'], error);
    }
    if (typeof actual === 'object' && actual !== null) {
      if (actual.message === error) {
        throw new ERR_AMBIGUOUS_ARGUMENT('error/message', `The error message "${actual.message}" is identical to the message.`);
      }
    } else if (actual === error) {
      throw new ERR_AMBIGUOUS_ARGUMENT('error/message', `The error "${actual}" is identical to the message.`);
    }
    message = error;
    error = undefined;
  } else if (error != null && typeof error !== 'object' && typeof error !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('error', ['Object', 'Error', 'Function', 'RegExp'], error);
  }
  if (actual === NO_EXCEPTION_SENTINEL) {
    var details = '';
    if (error?.name) {
      details += ` (${error.name})`;
    }
    details += message ? `: ${message}` : '.';
    var fnType = stackStartFn === Assert.prototype.rejects ? 'rejection' : 'exception';
    innerFail({
      actual: undefined,
      expected: error,
      operator: stackStartFn.name,
      message: [`Missing expected ${fnType}${details}`],
      stackStartFn,
      diff: this?.[kOptions]?.diff
    });
  }
  if (!error) return;
  expectedException.call(this, actual, error, message, stackStartFn);
}
function hasMatchingError(actual, expected) {
  if (typeof expected !== 'function') {
    if (isRegExp(expected)) {
      var str = _String(actual);
      return RegExpPrototypeExec(expected, str) !== null;
    }
    throw new ERR_INVALID_ARG_TYPE('expected', ['Function', 'RegExp'], expected);
  }
  // Guard instanceof against arrow functions as they don't have a prototype.
  if (expected.prototype !== undefined && actual instanceof expected) {
    return true;
  }
  if (ObjectPrototypeIsPrototypeOf(Error, expected)) {
    return false;
  }
  return FunctionPrototypeCall(expected, {}, actual) === true;
}
function expectsNoError(stackStartFn, actual, error, message) {
  if (actual === NO_EXCEPTION_SENTINEL) return;
  if (typeof error === 'string') {
    message = error;
    error = undefined;
  }
  if (!error || hasMatchingError(actual, error)) {
    var details = message ? `: ${message}` : '.';
    var fnType = stackStartFn === Assert.prototype.doesNotReject ? 'rejection' : 'exception';
    innerFail({
      actual,
      expected: error,
      operator: stackStartFn.name,
      message: [`Got unwanted ${fnType}${details}\n` + `Actual message: "${actual?.message}"`],
      stackStartFn,
      diff: this?.[kOptions]?.diff
    });
  }
  throw actual;
}

/**
 * Expects the function `promiseFn` to throw an error.
 * @param {() => any} promiseFn
 * @param {...any} [args]
 * @returns {void}
 */
Assert.prototype.throws = function throws(promiseFn) {
  for (var _len10 = arguments.length, args = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
    args[_key10 - 1] = arguments[_key10];
  }
  expectsError.apply(void 0, [throws, getActual(promiseFn)].concat(args));
};

/**
 * Expects `promiseFn` function or its value to reject.
 * @param {() => Promise<any>} promiseFn
 * @param {...any} [args]
 * @returns {Promise<void>}
 */
Assert.prototype.rejects = function rejects(promiseFn) {
  for (var _len11 = arguments.length, args = new Array(_len11 > 1 ? _len11 - 1 : 0), _key11 = 1; _key11 < _len11; _key11++) {
    args[_key11 - 1] = arguments[_key11];
  }
  return _await(waitForActual(promiseFn), function (_waitForActual) {
    expectsError.apply(void 0, [rejects, _waitForActual].concat(args));
  });
};

/**
 * Asserts that the function `fn` does not throw an error.
 * @param {() => any} fn
 * @param {...any} [args]
 * @returns {void}
 */
Assert.prototype.doesNotThrow = function doesNotThrow(fn) {
  for (var _len12 = arguments.length, args = new Array(_len12 > 1 ? _len12 - 1 : 0), _key12 = 1; _key12 < _len12; _key12++) {
    args[_key12 - 1] = arguments[_key12];
  }
  expectsNoError.apply(void 0, [doesNotThrow, getActual(fn)].concat(args));
};

/**
 * Expects `fn` or its value to not reject.
 * @param {() => Promise<any>} fn
 * @param {...any} [args]
 * @returns {Promise<void>}
 */
Assert.prototype.doesNotReject = function doesNotReject(fn) {
  for (var _len13 = arguments.length, args = new Array(_len13 > 1 ? _len13 - 1 : 0), _key13 = 1; _key13 < _len13; _key13++) {
    args[_key13 - 1] = arguments[_key13];
  }
  return _await(waitForActual(fn), function (_waitForActual2) {
    expectsNoError.apply(void 0, [doesNotReject, _waitForActual2].concat(args));
  });
};

/**
 * Throws `AssertionError` if the value is not `null` or `undefined`.
 * @param {any} err
 * @returns {void}
 */
Assert.prototype.ifError = function ifError(err) {
  if (err !== null && err !== undefined) {
    var message = 'ifError got unwanted exception: ';
    if (typeof err === 'object' && typeof err.message === 'string') {
      if (err.message.length === 0 && err.constructor) {
        message += err.constructor.name;
      } else {
        message += err.message;
      }
    } else {
      message += inspect(err);
    }
    var newErr = new AssertionError({
      actual: err,
      expected: null,
      operator: 'ifError',
      message,
      stackStartFn: ifError,
      diff: this?.[kOptions]?.diff
    });

    // Make sure we actually have a stack trace!
    var origStack = err.stack;
    if (typeof origStack === 'string') {
      // This will remove any duplicated frames from the error frames taken
      // from within `ifError` and add the original error frames to the newly
      // created ones.
      var origStackStart = StringPrototypeIndexOf(origStack, '\n    at');
      if (origStackStart !== -1) {
        var originalFrames = StringPrototypeSplit(StringPrototypeSlice(origStack, origStackStart + 1), '\n');
        // Filter all frames existing in err.stack.
        var newFrames = StringPrototypeSplit(newErr.stack, '\n');
        for (var errFrame of originalFrames) {
          // Find the first occurrence of the frame.
          var pos = ArrayPrototypeIndexOf(newFrames, errFrame);
          if (pos !== -1) {
            // Only keep new frames.
            newFrames = ArrayPrototypeSlice(newFrames, 0, pos);
            break;
          }
        }
        var stackStart = ArrayPrototypeJoin(newFrames, '\n');
        var stackEnd = ArrayPrototypeJoin(originalFrames, '\n');
        newErr.stack = `${stackStart}\n${stackEnd}`;
      }
    }
    throw newErr;
  }
};
function internalMatch(string, regexp, message, fn) {
  if (!isRegExp(regexp)) {
    throw new ERR_INVALID_ARG_TYPE('regexp', 'RegExp', regexp);
  }
  var match = fn === Assert.prototype.match;
  if (typeof string !== 'string' || RegExpPrototypeExec(regexp, string) !== null !== match) {
    var generatedMessage = message.length === 0;

    // 'The input was expected to not match the regular expression ' +
    message[0] ||= typeof string !== 'string' ? 'The "string" argument must be of type string. Received type ' + `${typeof string} (${inspect(string)})` : (match ? 'The input did not match the regular expression ' : 'The input was expected to not match the regular expression ') + `${inspect(regexp)}. Input:\n\n${inspect(string)}\n`;
    innerFail({
      actual: string,
      expected: regexp,
      message,
      operator: fn.name,
      stackStartFn: fn,
      diff: this?.[kOptions]?.diff,
      generatedMessage: generatedMessage
    });
  }
}

/**
 * Expects the `string` input to match the regular expression.
 * @param {string} string
 * @param {RegExp} regexp
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.match = function match(string, regexp) {
  for (var _len14 = arguments.length, message = new Array(_len14 > 2 ? _len14 - 2 : 0), _key14 = 2; _key14 < _len14; _key14++) {
    message[_key14 - 2] = arguments[_key14];
  }
  internalMatch(string, regexp, message, match);
};

/**
 * Expects the `string` input not to match the regular expression.
 * @param {string} string
 * @param {RegExp} regexp
 * @param {string | Error | MessageFactory} [message]
 * @returns {void}
 */
Assert.prototype.doesNotMatch = function doesNotMatch(string, regexp) {
  for (var _len15 = arguments.length, message = new Array(_len15 > 2 ? _len15 - 2 : 0), _key15 = 2; _key15 < _len15; _key15++) {
    message[_key15 - 2] = arguments[_key15];
  }
  internalMatch(string, regexp, message, doesNotMatch);
};

/**
 * Expose a strict only variant of assert.
 * @param {...any} args
 * @returns {void}
 */
function strict() {
  for (var _len16 = arguments.length, args = new Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
    args[_key16] = arguments[_key16];
  }
  innerOk.apply(void 0, [strict].concat(args));
}
ArrayPrototypeForEach(['ok', 'fail', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'deepStrictEqual', 'notDeepStrictEqual', 'strictEqual', 'notStrictEqual', 'partialDeepStrictEqual', 'match', 'doesNotMatch', 'throws', 'rejects', 'doesNotThrow', 'doesNotReject', 'ifError'], name => {
  setOwnProperty(assert, name, Assert.prototype[name]);
});
assert.strict = ObjectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.Assert = Assert;
assert.strict.strict = assert.strict;
assert.Assert = Assert;

