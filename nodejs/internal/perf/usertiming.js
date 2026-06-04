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
var {
  ObjectDefineProperties,
  SafeArrayIterator,
  SafeMap,
  SafeSet,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  PerformanceEntry,
  kSkipThrow
} = require('internal/perf/performance_entry');
var {
  now
} = require('internal/perf/utils');
var {
  enqueue,
  bufferUserTiming
} = require('internal/perf/observe');
var nodeTiming = require('internal/perf/nodetiming');
var {
  validateNumber,
  validateObject,
  validateString,
  validateThisInternalField
} = require('internal/validators');
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_VALUE,
    ERR_MISSING_ARGS,
    ERR_PERFORMANCE_INVALID_TIMESTAMP,
    ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS
  }
} = require('internal/errors');
var {
  structuredClone
} = require('internal/worker/js_transferable');
var {
  lazyDOMException,
  kEnumerableProperty
} = require('internal/util');
var kDetail = _Symbol('kDetail');
var markTimings = new SafeMap();
var nodeTimingReadOnlyAttributes = new SafeSet(new SafeArrayIterator(['nodeStart', 'v8Start', 'environment', 'loopStart', 'loopExit', 'bootstrapComplete']));
function getMark(name) {
  if (name === undefined) return;
  if (typeof name === 'number') {
    if (name < 0) throw new ERR_PERFORMANCE_INVALID_TIMESTAMP(name);
    return name;
  }
  name = `${name}`;
  if (nodeTimingReadOnlyAttributes.has(name)) return nodeTiming[name];
  var ts = markTimings.get(name);
  if (ts === undefined) throw lazyDOMException(`The "${name}" performance mark has not been set`, 'SyntaxError');
  return ts;
}
var PerformanceMark = /*#__PURE__*/function (_PerformanceEntry) {
  function PerformanceMark(name) {
    var _this;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    _classCallCheck(this, PerformanceMark);
    if (arguments.length === 0) {
      throw new ERR_MISSING_ARGS('name');
    }
    name = `${name}`;
    if (nodeTimingReadOnlyAttributes.has(name)) throw new ERR_INVALID_ARG_VALUE('name', name);
    if (options != null) {
      validateObject(options, 'options');
    }
    var startTime = options?.startTime ?? now();
    validateNumber(startTime, 'startTime');
    if (startTime < 0) throw new ERR_PERFORMANCE_INVALID_TIMESTAMP(startTime);
    markTimings.set(name, startTime);
    var detail = options?.detail;
    detail = detail != null ? structuredClone(detail) : null;
    _this = _callSuper(this, PerformanceMark, [kSkipThrow, name, 'mark', startTime, 0]);
    _this[kDetail] = detail;
    return _this;
  }
  _inherits(PerformanceMark, _PerformanceEntry);
  return _createClass(PerformanceMark, [{
    key: "detail",
    get: function () {
      validateThisInternalField(this, kDetail, 'PerformanceMark');
      return this[kDetail];
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        name: this.name,
        entryType: this.entryType,
        startTime: this.startTime,
        duration: this.duration,
        detail: this[kDetail]
      };
    }
  }]);
}(PerformanceEntry);
ObjectDefineProperties(PerformanceMark.prototype, {
  detail: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'PerformanceMark'
  }
});
var PerformanceMeasure = /*#__PURE__*/function (_PerformanceEntry2) {
  function PerformanceMeasure() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
    var duration = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
    _classCallCheck(this, PerformanceMeasure);
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    return _callSuper(this, PerformanceMeasure, [skipThrowSymbol, name, type, start, duration]);
  }
  _inherits(PerformanceMeasure, _PerformanceEntry2);
  return _createClass(PerformanceMeasure, [{
    key: "detail",
    get: function () {
      validateThisInternalField(this, kDetail, 'PerformanceMeasure');
      return this[kDetail];
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        name: this.name,
        entryType: this.entryType,
        startTime: this.startTime,
        duration: this.duration,
        detail: this[kDetail]
      };
    }
  }]);
}(PerformanceEntry);
ObjectDefineProperties(PerformanceMeasure.prototype, {
  detail: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'PerformanceMeasure'
  }
});
function createPerformanceMeasure(name, start, duration, detail) {
  var measure = new PerformanceMeasure(kSkipThrow, name, 'measure', start, duration);
  measure[kDetail] = detail;
  return measure;
}
function mark(name, options) {
  var mark = new PerformanceMark(name, options);
  enqueue(mark);
  bufferUserTiming(mark);
  return mark;
}
function calculateStartDuration(startOrMeasureOptions, endMark) {
  startOrMeasureOptions ??= 0;
  var start;
  var end;
  var duration;
  var optionsValid = false;
  if (typeof startOrMeasureOptions === 'object') {
    ({
      start,
      end,
      duration
    } = startOrMeasureOptions);
    optionsValid = start !== undefined || end !== undefined;
  }
  if (optionsValid) {
    if (endMark !== undefined) {
      throw new ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS('endMark must not be specified');
    }
    if (start === undefined && end === undefined) {
      throw new ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS('One of options.start or options.end is required');
    }
    if (start !== undefined && end !== undefined && duration !== undefined) {
      throw new ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS('Must not have options.start, options.end, and ' + 'options.duration specified');
    }
  }
  if (endMark !== undefined) {
    end = getMark(endMark);
  } else if (optionsValid && end !== undefined) {
    end = getMark(end);
  } else if (optionsValid && start !== undefined && duration !== undefined) {
    end = getMark(start) + getMark(duration);
  } else {
    end = now();
  }
  if (typeof startOrMeasureOptions === 'string') {
    start = getMark(startOrMeasureOptions);
  } else if (optionsValid && start !== undefined) {
    start = getMark(start);
  } else if (optionsValid && duration !== undefined && end !== undefined) {
    start = end - getMark(duration);
  } else {
    start = 0;
  }
  duration = end - start;
  return {
    start,
    duration
  };
}
function measure(name, startOrMeasureOptions, endMark) {
  validateString(name, 'name');
  var {
    start,
    duration
  } = calculateStartDuration(startOrMeasureOptions, endMark);
  var detail = startOrMeasureOptions?.detail;
  detail = detail != null ? structuredClone(detail) : null;
  var measure = createPerformanceMeasure(name, start, duration, detail);
  enqueue(measure);
  bufferUserTiming(measure);
  return measure;
}
function clearMarkTimings(name) {
  if (name !== undefined) {
    name = `${name}`;
    if (nodeTimingReadOnlyAttributes.has(name)) throw new ERR_INVALID_ARG_VALUE('name', name);
    markTimings.delete(name);
    return;
  }
  markTimings.clear();
}
module.exports = {
  PerformanceMark,
  PerformanceMeasure,
  clearMarkTimings,
  mark,
  measure
};

