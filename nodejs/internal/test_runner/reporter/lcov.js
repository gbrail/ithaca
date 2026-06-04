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
  relative
} = require('path');
var Transform = require('internal/streams/transform');

// This reporter is based on the LCOV format, as described here:
// https://ltp.sourceforge.net/coverage/lcov/geninfo.1.php
// Excerpts from this documentation are included in the comments that make up
// the _transform function below.
var LcovReporter = /*#__PURE__*/function (_Transform) {
  function LcovReporter(options) {
    _classCallCheck(this, LcovReporter);
    return _callSuper(this, LcovReporter, [_objectSpread(_objectSpread({}, options), {}, {
      writableObjectMode: true,
      __proto__: null
    })]);
  }
  _inherits(LcovReporter, _Transform);
  return _createClass(LcovReporter, [{
    key: "_transform",
    value: function _transform(event, _encoding, callback) {
      if (event.type !== 'test:coverage') {
        return callback(null);
      }
      var lcov = '';
      // A tracefile is made up of several human-readable lines of text, divided
      // into sections. If available, a tracefile begins with the testname which
      // is stored in the following format:
      // ## TN:\<test name\>
      lcov += 'TN:\n';
      var {
        data: {
          summary: {
            workingDirectory
          }
        }
      } = event;
      try {
        for (var i = 0; i < event.data.summary.files.length; i++) {
          var file = event.data.summary.files[i];
          // For each source file referenced in the .da file, there is a section
          // containing filename and coverage data:
          // ## SF:\<path to the source file\>
          lcov += `SF:${relative(workingDirectory, file.path)}\n`;

          // Following is a list of line numbers for each function name found in
          // the source file:
          // ## FN:\<line number of function start\>,\<function name\>
          //
          // After, there is a list of execution counts for each instrumented
          // function:
          // ## FNDA:\<execution count\>,\<function name\>
          //
          // This loop adds the FN lines to the lcov variable as it goes and
          // gathers the FNDA lines to be added later. This way we only loop
          // through the list of functions once.
          var fnda = '';
          for (var j = 0; j < file.functions.length; j++) {
            var func = file.functions[j];
            var name = func.name || `anonymous_${j}`;
            lcov += `FN:${func.line},${name}\n`;
            fnda += `FNDA:${func.count},${name}\n`;
          }
          lcov += fnda;

          // This list is followed by two lines containing the number of
          // functions found and hit:
          // ## FNF:\<number of functions found\>
          // ## FNH:\<number of function hit\>
          lcov += `FNF:${file.totalFunctionCount}\n`;
          lcov += `FNH:${file.coveredFunctionCount}\n`;

          // Branch coverage information is stored which one line per branch:
          // ## BRDA:\<line number\>,\<block number\>,\<branch number\>,\<taken\>
          // Block number and branch number are gcc internal IDs for the branch.
          // Taken is either '-' if the basic block containing the branch was
          // never executed or a number indicating how often that branch was
          // taken.
          for (var _j = 0; _j < file.branches.length; _j++) {
            lcov += `BRDA:${file.branches[_j].line},${_j},0,${file.branches[_j].count}\n`;
          }

          // Branch coverage summaries are stored in two lines:
          // ## BRF:\<number of branches found\>
          // ## BRH:\<number of branches hit\>
          lcov += `BRF:${file.totalBranchCount}\n`;
          lcov += `BRH:${file.coveredBranchCount}\n`;

          // Then there is a list of execution counts for each instrumented line
          // (i.e. a line which resulted in executable code):
          // ## DA:\<line number\>,\<execution count\>[,\<checksum\>]
          var sortedLines = file.lines.toSorted((a, b) => a.line - b.line);
          for (var _j2 = 0; _j2 < sortedLines.length; _j2++) {
            lcov += `DA:${sortedLines[_j2].line},${sortedLines[_j2].count}\n`;
          }

          // At the end of a section, there is a summary about how many lines
          // were found and how many were actually instrumented:
          // ## LH:\<number of lines with a non-zero execution count\>
          // ## LF:\<number of instrumented lines\>
          lcov += `LH:${file.coveredLineCount}\n`;
          lcov += `LF:${file.totalLineCount}\n`;

          // Each sections ends with:
          // end_of_record
          lcov += 'end_of_record\n';
        }
      } catch (error) {
        return callback(error);
      }
      return callback(null, lcov);
    }
  }]);
}(Transform);
module.exports = LcovReporter;

