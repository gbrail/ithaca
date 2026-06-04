'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  Error,
  ErrorCaptureStackTrace,
  ErrorPrototypeToString,
  StringPrototypeCharCodeAt,
  StringPrototypeReplace
} = primordials;
var {
  codes: {
    ERR_AMBIGUOUS_ARGUMENT,
    ERR_INVALID_ARG_TYPE
  },
  isErrorStackTraceLimitWritable
} = require('internal/errors');
var AssertionError = require('internal/assert/assertion_error');
var {
  isError
} = require('internal/util');
var {
  format
} = require('internal/util/inspect');
var {
  getErrorSourceExpression
} = require('internal/errors/error_source');

// Escape control characters but not \n and \t to keep the line breaks and
// indentation intact.
// eslint-disable-next-line no-control-regex
var escapeSequencesRegExp = /[\x00-\x08\x0b\x0c\x0e-\x1f]/g;
var meta = ['\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004', '\\u0005', '\\u0006', '\\u0007', '\\b', '', '', '\\u000b', '\\f', '', '\\u000e', '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013', '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018', '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d', '\\u001e', '\\u001f'];
var escapeFn = str => meta[StringPrototypeCharCodeAt(str, 0)];

/**
 * A function that derives the failure message from the actual and expected values.
 * It is invoked only when the assertion fails.
 *
 * Other return values than a string are ignored.
 * @callback MessageFactory
 * @param {any} actual
 * @param {any} expected
 * @returns {string}
 */

/**
 * Raw message input is always passed internally as a tuple array.
 * Accepted shapes:
 *  - []
 *  - [string]
 *  - [string, ...any[]] (printf-like substitutions)
 *  - [Error]
 *  - [MessageFactory]
 *
 * Additional elements after [Error] or [MessageFactory] are rejected with ERR_AMBIGUOUS_ARGUMENT.
 * A first element that is neither string, Error nor function is rejected with ERR_INVALID_ARG_TYPE.
 * @typedef {[] | [string] | [string, ...any[]] | [Error] | [MessageFactory]} MessageTuple
 */

/**
 * Options consumed by innerFail to construct and throw the AssertionError.
 * @typedef {object} InnerFailOptions
 * @property {any} actual Actual value
 * @property {any} expected Expected value
 * @property {MessageTuple} message Message
 * @property {string} operator Operator
 * @property {Function} stackStartFn Stack start function
 * @property {'simple' | 'full'} [diff] Diff mode
 * @property {boolean} [generatedMessage] Generated message
 */

function getErrMessage(fn) {
  var tmpLimit = Error.stackTraceLimit;
  var errorStackTraceLimitIsWritable = isErrorStackTraceLimitWritable();
  // Make sure the limit is set to 1. Otherwise it could fail (<= 0) or it
  // does to much work.
  if (errorStackTraceLimitIsWritable) Error.stackTraceLimit = 1;
  // We only need the stack trace. To minimize the overhead use an object
  // instead of an error.
  var err = {};
  ErrorCaptureStackTrace(err, fn);
  if (errorStackTraceLimitIsWritable) Error.stackTraceLimit = tmpLimit;
  var source = getErrorSourceExpression(err);
  if (source) {
    source = StringPrototypeReplace(source, escapeSequencesRegExp, escapeFn);
    return `The expression evaluated to a falsy value:\n\n  ${source}\n`;
  }
}

/**
 * @param {InnerFailOptions} obj
 */
function innerFail(obj) {
  if (obj.message.length === 0) {
    obj.message = undefined;
  } else if (typeof obj.message[0] === 'string') {
    if (obj.message.length > 1) {
      obj.message = format.apply(void 0, _toConsumableArray(obj.message));
    } else {
      obj.message = obj.message[0];
    }
  } else if (isError(obj.message[0])) {
    if (obj.message.length > 1) {
      throw new ERR_AMBIGUOUS_ARGUMENT('message', `The error message was passed as error object "${ErrorPrototypeToString(obj.message[0])}" has trailing arguments that would be ignored.`);
    }
    throw obj.message[0];
  } else if (typeof obj.message[0] === 'function') {
    if (obj.message.length > 1) {
      throw new ERR_AMBIGUOUS_ARGUMENT('message', `The error message with function "${obj.message[0].name || 'anonymous'}" has trailing arguments that would be ignored.`);
    }
    try {
      obj.message = obj.message[0](obj.actual, obj.expected);
      if (typeof obj.message !== 'string') {
        obj.message = undefined;
      }
    } catch {
      // Ignore and use default message instead
      obj.message = undefined;
    }
  } else {
    throw new ERR_INVALID_ARG_TYPE('message', ['string', 'function'], obj.message[0]);
  }
  var error = new AssertionError(obj);
  if (obj.generatedMessage !== undefined) {
    error.generatedMessage = obj.generatedMessage;
  }
  throw error;
}

/**
 * Internal ok handler delegating to innerFail for message handling.
 * @param {Function} fn
 * @param {...any} args
 */
function innerOk(fn) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  if (!args[0]) {
    var generatedMessage = false;
    var messageArgs;
    if (args.length === 0) {
      generatedMessage = true;
      messageArgs = ['No value argument passed to `assert.ok()`'];
    } else if (args.length === 1 || args[1] == null) {
      generatedMessage = true;
      messageArgs = [getErrMessage(fn)];
    } else {
      messageArgs = args.slice(1);
    }
    innerFail({
      actual: args[0],
      expected: true,
      message: messageArgs,
      operator: '==',
      stackStartFn: fn,
      generatedMessage
    });
  }
}
module.exports = {
  innerOk,
  innerFail
};

