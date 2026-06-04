'use strict';

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
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypeJoin,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  ArrayPrototypeUnshift,
  Date,
  DatePrototypeToLocaleString
} = primordials;
var assert = require('assert');
var Transform = require('internal/streams/transform');
var colors = require('internal/util/colors');
var {
  kSubtestsFailed
} = require('internal/test_runner/test');
var {
  getCoverageReport
} = require('internal/test_runner/utils');
var {
  relative
} = require('path');
var {
  formatTestReport,
  indent,
  reporterColorMap,
  reporterUnicodeSymbolMap
} = require('internal/test_runner/reporter/utils');
var _stack = /*#__PURE__*/new WeakMap();
var _reported = /*#__PURE__*/new WeakMap();
var _failedTests = /*#__PURE__*/new WeakMap();
var _cwd = /*#__PURE__*/new WeakMap();
var _SpecReporter_brand = /*#__PURE__*/new WeakSet();
var SpecReporter = /*#__PURE__*/function (_Transform) {
  function SpecReporter() {
    var _this;
    _classCallCheck(this, SpecReporter);
    _this = _callSuper(this, SpecReporter, [{
      __proto__: null,
      writableObjectMode: true
    }]);
    _classPrivateMethodInitSpec(_this, _SpecReporter_brand);
    _classPrivateFieldInitSpec(_this, _stack, []);
    _classPrivateFieldInitSpec(_this, _reported, []);
    _classPrivateFieldInitSpec(_this, _failedTests, []);
    _classPrivateFieldInitSpec(_this, _cwd, process.cwd());
    colors.refresh();
    return _this;
  }
  _inherits(SpecReporter, _Transform);
  return _createClass(SpecReporter, [{
    key: "_transform",
    value: function _transform(_ref, encoding, callback) {
      var {
        type,
        data
      } = _ref;
      callback(null, _assertClassBrand(_SpecReporter_brand, this, _handleEvent).call(this, {
        __proto__: null,
        type,
        data
      }));
    }
  }, {
    key: "_flush",
    value: function _flush(callback) {
      callback(null, _assertClassBrand(_SpecReporter_brand, this, _formatFailedTestResults).call(this));
    }
  }]);
}(Transform);
function _formatFailedTestResults() {
  if (_classPrivateFieldGet(_failedTests, this).length === 0) {
    return '';
  }
  var results = [`\n${reporterColorMap['test:fail']}${reporterUnicodeSymbolMap['test:fail']}failing tests:${colors.white}\n`];
  for (var i = 0; i < _classPrivateFieldGet(_failedTests, this).length; i++) {
    var test = _classPrivateFieldGet(_failedTests, this)[i];
    var formattedErr = formatTestReport('test:fail', test);
    if (test.file) {
      var relPath = relative(_classPrivateFieldGet(_cwd, this), test.file);
      var location = `test at ${relPath}:${test.line}:${test.column}`;
      ArrayPrototypePush(results, location);
    }
    ArrayPrototypePush(results, formattedErr);
  }
  _classPrivateFieldSet(_failedTests, this, []); // Clean up the failed tests
  return ArrayPrototypeJoin(results, '\n');
}
function _handleTestReportEvent(type, data) {
  var subtest = ArrayPrototypeShift(_classPrivateFieldGet(_stack, this)); // This is the matching `test:start` event
  if (subtest) {
    assert(subtest.type === 'test:start');
    assert(subtest.data.nesting === data.nesting);
    assert(subtest.data.name === data.name);
  }
  var prefix = '';
  while (_classPrivateFieldGet(_stack, this).length) {
    // Report all the parent `test:start` events
    var parent = ArrayPrototypePop(_classPrivateFieldGet(_stack, this));
    assert(parent.type === 'test:start');
    var msg = parent.data;
    ArrayPrototypeUnshift(_classPrivateFieldGet(_reported, this), msg);
    prefix += `${indent(msg.nesting)}${reporterUnicodeSymbolMap['arrow:right']}${msg.name}\n`;
  }
  var indentation = indent(data.nesting);
  return `${formatTestReport(type, data, false, prefix, indentation)}\n`;
}
function _handleEvent(_ref2) {
  var {
    type,
    data
  } = _ref2;
  switch (type) {
    case 'test:fail':
      if (data.details?.error?.failureType !== kSubtestsFailed) {
        ArrayPrototypePush(_classPrivateFieldGet(_failedTests, this), data);
      }
      return _assertClassBrand(_SpecReporter_brand, this, _handleTestReportEvent).call(this, type, data);
    case 'test:pass':
      return _assertClassBrand(_SpecReporter_brand, this, _handleTestReportEvent).call(this, type, data);
    case 'test:start':
      ArrayPrototypeUnshift(_classPrivateFieldGet(_stack, this), {
        __proto__: null,
        data,
        type
      });
      break;
    case 'test:stderr':
    case 'test:stdout':
      return data.message;
    case 'test:diagnostic':
      {
        var diagnosticColor = reporterColorMap[data.level] || reporterColorMap['test:diagnostic'];
        return `${diagnosticColor}${indent(data.nesting)}${reporterUnicodeSymbolMap[type]}${data.message}${colors.white}\n`;
      }
    case 'test:coverage':
      return getCoverageReport(indent(data.nesting), data.summary, reporterUnicodeSymbolMap['test:coverage'], colors.blue, true);
    case 'test:summary':
      // We report only the root test summary
      if (data.file === undefined) {
        return _assertClassBrand(_SpecReporter_brand, this, _formatFailedTestResults).call(this);
      }
      break;
    case 'test:watch:restarted':
      return `\nRestarted at ${DatePrototypeToLocaleString(new Date())}\n`;
    case 'test:interrupted':
      return _assertClassBrand(_SpecReporter_brand, this, _formatInterruptedTests).call(this, data.tests);
  }
}
function _formatInterruptedTests(tests) {
  if (tests.length === 0) {
    return '';
  }
  var results = [`\n${colors.yellow}Interrupted while running:${colors.white}\n`];
  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    var msg = `${indent(test.nesting)}${reporterUnicodeSymbolMap['warning:alert']}${test.name}`;
    if (test.file) {
      var relPath = relative(_classPrivateFieldGet(_cwd, this), test.file);
      msg += ` ${colors.gray}(${relPath}:${test.line}:${test.column})${colors.white}`;
    }
    ArrayPrototypePush(results, msg);
  }
  return ArrayPrototypeJoin(results, '\n') + '\n';
}
module.exports = SpecReporter;

