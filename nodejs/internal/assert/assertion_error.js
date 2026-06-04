'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ArrayPrototypeJoin,
  ArrayPrototypePop,
  ArrayPrototypeSlice,
  Error,
  ErrorCaptureStackTrace,
  ObjectAssign,
  ObjectDefineProperty,
  ObjectGetPrototypeOf,
  ObjectPrototypeHasOwnProperty,
  SafeSet,
  String: _String,
  StringPrototypeRepeat,
  StringPrototypeSlice,
  StringPrototypeSplit
} = primordials;
var {
  isError
} = require('internal/util');
var {
  inspect
} = require('internal/util/inspect');
var colors = require('internal/util/colors');
var {
  validateObject
} = require('internal/validators');
var {
  isErrorStackTraceLimitWritable
} = require('internal/errors');
var {
  myersDiff,
  printMyersDiff,
  printSimpleMyersDiff
} = require('internal/assert/myers_diff');
var kReadableOperator = {
  deepStrictEqual: 'Expected values to be strictly deep-equal:',
  partialDeepStrictEqual: 'Expected values to be partially and strictly deep-equal:',
  strictEqual: 'Expected values to be strictly equal:',
  strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
  deepEqual: 'Expected values to be loosely deep-equal:',
  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
  notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
  notIdentical: 'Values have same structure but are not reference-equal:',
  notDeepEqualUnequal: 'Expected values not to be loosely deep-equal:'
};
var kMaxShortStringLength = 12;
var kMaxLongStringLength = 512;
var kMethodsWithCustomMessageDiff = new SafeSet().add('deepStrictEqual').add('strictEqual').add('partialDeepStrictEqual');
function copyError(source) {
  var target = ObjectAssign({
    __proto__: ObjectGetPrototypeOf(source)
  }, source);
  ObjectDefineProperty(target, 'message', {
    __proto__: null,
    value: source.message
  });
  if (ObjectPrototypeHasOwnProperty(source, 'cause')) {
    var {
      cause
    } = source;
    if (isError(cause)) {
      cause = copyError(cause);
    }
    ObjectDefineProperty(target, 'cause', {
      __proto__: null,
      value: cause
    });
  }
  return target;
}
function inspectValue(val) {
  // The util.inspect default values could be changed. This makes sure the
  // error messages contain the necessary information nevertheless.
  return inspect(val, {
    compact: false,
    customInspect: false,
    depth: 1000,
    maxArrayLength: Infinity,
    // Assert compares only enumerable properties (with a few exceptions).
    showHidden: false,
    // Assert does not detect proxies currently.
    showProxy: false,
    sorted: true,
    // Inspect getters as we also check them when comparing entries.
    getters: true
  });
}
function getErrorMessage(operator, message) {
  return message || kReadableOperator[operator];
}
function checkOperator(actual, expected, operator) {
  // In case both values are objects or functions explicitly mark them as not
  // reference equal for the `strictEqual` operator.
  if (operator === 'strictEqual' && (typeof actual === 'object' && actual !== null && typeof expected === 'object' && expected !== null || typeof actual === 'function' && typeof expected === 'function')) {
    operator = 'strictEqualObject';
  }
  return operator;
}
function getColoredMyersDiff(actual, expected) {
  var header = `${colors.green}actual${colors.white} ${colors.red}expected${colors.white}`;
  var skipped = false;
  var diff = myersDiff(StringPrototypeSplit(actual, ''), StringPrototypeSplit(expected, ''));
  var message = printSimpleMyersDiff(diff);
  if (skipped) {
    message += '...';
  }
  return {
    message,
    header,
    skipped
  };
}
function getStackedDiff(actual, expected) {
  var isStringComparison = typeof actual === 'string' && typeof expected === 'string';
  var message = `\n${colors.green}+${colors.white} ${actual}\n${colors.red}- ${colors.white}${expected}`;
  var stringsLen = actual.length + expected.length;
  var maxTerminalLength = process.stderr.isTTY ? process.stderr.columns : 80;
  var showIndicator = isStringComparison && stringsLen <= maxTerminalLength;
  if (showIndicator) {
    var indicatorIdx = -1;
    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) {
        // Skip the indicator for the first 2 characters because the diff is immediately apparent
        // It is 3 instead of 2 to account for the quotes
        if (i >= 3) {
          indicatorIdx = i;
        }
        break;
      }
    }
    if (indicatorIdx !== -1) {
      message += `\n${StringPrototypeRepeat(' ', indicatorIdx + 2)}^`;
    }
  }
  return {
    message
  };
}
function getSimpleDiff(originalActual, actual, originalExpected, expected) {
  var stringsLen = actual.length + expected.length;
  // Accounting for the quotes wrapping strings
  if (typeof originalActual === 'string') {
    stringsLen -= 2;
  }
  if (typeof originalExpected === 'string') {
    stringsLen -= 2;
  }
  if (stringsLen <= kMaxShortStringLength && (originalActual !== 0 || originalExpected !== 0)) {
    return {
      message: `${actual} !== ${expected}`,
      header: ''
    };
  }
  var isStringComparison = typeof originalActual === 'string' && typeof originalExpected === 'string';
  // colored myers diff
  if (isStringComparison && colors.hasColors) {
    return getColoredMyersDiff(actual, expected);
  }
  return getStackedDiff(actual, expected);
}
function isSimpleDiff(actual, inspectedActual, expected, inspectedExpected) {
  if (inspectedActual.length > 1 || inspectedExpected.length > 1) {
    return false;
  }
  return typeof actual !== 'object' || actual === null || typeof expected !== 'object' || expected === null;
}
function createErrDiff(actual, expected, operator, customMessage) {
  var diffType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'simple';
  operator = checkOperator(actual, expected, operator);
  var skipped = false;
  var message = '';
  var inspectedActual = inspectValue(actual);
  var inspectedExpected = inspectValue(expected);
  var inspectedSplitActual = StringPrototypeSplit(inspectedActual, '\n');
  var inspectedSplitExpected = StringPrototypeSplit(inspectedExpected, '\n');
  var showSimpleDiff = isSimpleDiff(actual, inspectedSplitActual, expected, inspectedSplitExpected);
  var header = `${colors.green}+ actual${colors.white} ${colors.red}- expected${colors.white}`;
  if (showSimpleDiff) {
    var simpleDiff = getSimpleDiff(actual, inspectedSplitActual[0], expected, inspectedSplitExpected[0]);
    message = simpleDiff.message;
    if (typeof simpleDiff.header !== 'undefined') {
      header = simpleDiff.header;
    }
    if (simpleDiff.skipped) {
      skipped = true;
    }
  } else if (inspectedActual === inspectedExpected) {
    // Handles the case where the objects are structurally the same but different references
    operator = 'notIdentical';
    if (inspectedSplitActual.length > 50 && diffType !== 'full') {
      message = `${ArrayPrototypeJoin(ArrayPrototypeSlice(inspectedSplitActual, 0, 50), '\n')}\n...}`;
      skipped = true;
    } else {
      message = ArrayPrototypeJoin(inspectedSplitActual, '\n');
    }
    header = '';
  } else {
    var checkCommaDisparity = actual != null && typeof actual === 'object';
    var diff = myersDiff(inspectedSplitActual, inspectedSplitExpected, checkCommaDisparity);
    var myersDiffMessage = printMyersDiff(diff, operator);
    message = myersDiffMessage.message;
    if (operator === 'partialDeepStrictEqual') {
      header = `${colors.gray}${colors.hasColors ? '' : '+ '}actual${colors.white} ${colors.red}- expected${colors.white}`;
    }
    if (myersDiffMessage.skipped) {
      skipped = true;
    }
  }
  var headerMessage = `${getErrorMessage(operator, customMessage)}\n${header}`;
  var skippedMessage = skipped ? '\n... Skipped lines' : '';
  return `${headerMessage}${skippedMessage}\n${message}\n`;
}
function addEllipsis(string) {
  var lines = StringPrototypeSplit(string, '\n', 11);
  if (lines.length > 10) {
    lines.length = 10;
    return `${ArrayPrototypeJoin(lines, '\n')}\n...`;
  } else if (string.length > kMaxLongStringLength) {
    return `${StringPrototypeSlice(string, kMaxLongStringLength)}...`;
  }
  return string;
}
var AssertionError = /*#__PURE__*/function (_Error, _inspect$custom) {
  function AssertionError(options) {
    var _this;
    _classCallCheck(this, AssertionError);
    validateObject(options, 'options');
    var {
      message,
      operator,
      stackStartFn,
      details,
      // Compatibility with older versions.
      stackStartFunction,
      diff = 'simple'
    } = options;
    var {
      actual,
      expected
    } = options;
    var limit = Error.stackTraceLimit;
    if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = 0;
    if (message != null) {
      if (kMethodsWithCustomMessageDiff.has(operator)) {
        _this = _callSuper(this, AssertionError, [createErrDiff(actual, expected, operator, message, diff)]);
      } else {
        _this = _callSuper(this, AssertionError, [_String(message)]);
      }
    } else {
      // Reset colors on each call to make sure we handle dynamically set environment
      // variables correct.
      colors.refresh();
      // Prevent the error stack from being visible by duplicating the error
      // in a very close way to the original in case both sides are actually
      // instances of Error.
      if (typeof actual === 'object' && actual !== null && typeof expected === 'object' && expected !== null && 'stack' in actual && actual instanceof Error && 'stack' in expected && expected instanceof Error) {
        actual = copyError(actual);
        expected = copyError(expected);
      }
      if (kMethodsWithCustomMessageDiff.has(operator)) {
        _this = _callSuper(this, AssertionError, [createErrDiff(actual, expected, operator, message, diff)]);
      } else if (operator === 'notDeepStrictEqual' || operator === 'notStrictEqual') {
        // In case the objects are equal but the operator requires unequal, show
        // the first object and say A equals B
        var base = kReadableOperator[operator];
        var res = StringPrototypeSplit(inspectValue(actual), '\n');

        // In case "actual" is an object or a function, it should not be
        // reference equal.
        if (operator === 'notStrictEqual' && (typeof actual === 'object' && actual !== null || typeof actual === 'function')) {
          base = kReadableOperator.notStrictEqualObject;
        }

        // Only remove lines in case it makes sense to collapse those.
        if (res.length > 50 && diff !== 'full') {
          res[46] = `${colors.blue}...${colors.white}`;
          while (res.length > 47) {
            ArrayPrototypePop(res);
          }
        }

        // Only print a single input.
        if (res.length === 1) {
          _this = _callSuper(this, AssertionError, [`${base}${res[0].length > 5 ? '\n\n' : ' '}${res[0]}`]);
        } else {
          _this = _callSuper(this, AssertionError, [`${base}\n\n${ArrayPrototypeJoin(res, '\n')}\n`]);
        }
      } else {
        var _res = inspectValue(actual);
        var other = inspectValue(expected);
        var knownOperator = kReadableOperator[operator];
        if (operator === 'notDeepEqual' && _res === other) {
          _res = `${knownOperator}\n\n${_res}`;
          if (_res.length > 1024 && diff !== 'full') {
            _res = `${StringPrototypeSlice(_res, 0, 1021)}...`;
          }
          _this = _callSuper(this, AssertionError, [_res]);
        } else {
          if (_res.length > kMaxLongStringLength && diff !== 'full') {
            _res = `${StringPrototypeSlice(_res, 0, 509)}...`;
          }
          if (other.length > kMaxLongStringLength && diff !== 'full') {
            other = `${StringPrototypeSlice(other, 0, 509)}...`;
          }
          if (operator === 'deepEqual') {
            _res = `${knownOperator}\n\n${_res}\n\nshould loosely deep-equal\n\n`;
          } else {
            var newOp = kReadableOperator[`${operator}Unequal`];
            if (newOp) {
              _res = `${newOp}\n\n${_res}\n\nshould not loosely deep-equal\n\n`;
            } else {
              other = ` ${operator} ${other}`;
            }
          }
          _this = _callSuper(this, AssertionError, [`${_res}${other}`]);
        }
      }
    }
    if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = limit;
    _this.generatedMessage = !message;
    ObjectDefineProperty(_assertThisInitialized(_this), 'name', {
      __proto__: null,
      value: 'AssertionError [ERR_ASSERTION]',
      enumerable: false,
      writable: true,
      configurable: true
    });
    _this.code = 'ERR_ASSERTION';
    if (details) {
      _this.actual = undefined;
      _this.expected = undefined;
      _this.operator = undefined;
      for (var i = 0; i < details.length; i++) {
        _this['message ' + i] = details[i].message;
        _this['actual ' + i] = details[i].actual;
        _this['expected ' + i] = details[i].expected;
        _this['operator ' + i] = details[i].operator;
        _this['stack trace ' + i] = details[i].stack;
      }
    } else {
      _this.actual = actual;
      _this.expected = expected;
      _this.operator = operator;
    }
    ErrorCaptureStackTrace(_assertThisInitialized(_this), stackStartFn || stackStartFunction);
    // Create error message including the error code in the name.
    _this.stack; // eslint-disable-line no-unused-expressions
    // Reset the name.
    _this.name = 'AssertionError';
    _this.diff = diff;
    return _assertThisInitialized(_this);
  }
  _inherits(AssertionError, _Error);
  return _createClass(AssertionError, [{
    key: "toString",
    value: function toString() {
      return `${this.name} [${this.code}]: ${this.message}`;
    }
  }, {
    key: _inspect$custom,
    value: function (recurseTimes, ctx) {
      // Long strings should not be fully inspected.
      var tmpActual = this.actual;
      var tmpExpected = this.expected;
      if (typeof this.actual === 'string') {
        this.actual = addEllipsis(this.actual);
      }
      if (typeof this.expected === 'string') {
        this.expected = addEllipsis(this.expected);
      }

      // This limits the `actual` and `expected` property default inspection to
      // the minimum depth. Otherwise those values would be too verbose compared
      // to the actual error message which contains a combined view of these two
      // input values.
      var result = inspect(this, _objectSpread(_objectSpread({}, ctx), {}, {
        customInspect: false,
        depth: 0
      }));

      // Reset the properties after inspection.
      this.actual = tmpActual;
      this.expected = tmpExpected;
      return result;
    }
  }]);
}(Error, inspect.custom);
module.exports = AssertionError;

