'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ObjectDefineProperties,
  ReflectConstruct,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
var {
  EventTarget,
  Event,
  kTrustEvent,
  initEventTarget,
  defineEventHandler
} = require('internal/event_target');
var {
  now: _now,
  getTimeOriginTimestamp
} = require('internal/perf/utils');
var {
  markResourceTiming
} = require('internal/perf/resource_timing');
var {
  mark: _mark,
  measure: _measure,
  clearMarkTimings
} = require('internal/perf/usertiming');
var {
  clearEntriesFromBuffer,
  filterBufferMapByNameAndType,
  setResourceTimingBufferSize: _setResourceTimingBufferSize,
  setDispatchBufferFull
} = require('internal/perf/observe');
var {
  eventLoopUtilization
} = require('internal/perf/event_loop_utilization');
var nodeTiming = require('internal/perf/nodetiming');
var timerify = require('internal/perf/timerify');
var {
  customInspectSymbol: kInspect,
  kEnumerableProperty,
  kEmptyObject
} = require('internal/util');
var {
  inspect
} = require('util');
var {
  validateThisInternalField
} = require('internal/validators');
var {
  converters
} = require('internal/webidl');
var kPerformanceBrand = _Symbol('performance');
var Performance = /*#__PURE__*/function (_EventTarget) {
  function Performance() {
    var _this;
    _classCallCheck(this, Performance);
    throw new ERR_ILLEGAL_CONSTRUCTOR();
    return _assertThisInitialized(_this);
  }
  _inherits(Performance, _EventTarget);
  return _createClass(Performance, [{
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `Performance ${inspect({
        nodeTiming: this.nodeTiming,
        timeOrigin: this.timeOrigin
      }, opts)}`;
    }
  }, {
    key: "clearMarks",
    value: function clearMarks() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (name !== undefined) {
        name = `${name}`;
      }
      clearMarkTimings(name);
      clearEntriesFromBuffer('mark', name);
    }
  }, {
    key: "clearMeasures",
    value: function clearMeasures() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (name !== undefined) {
        name = `${name}`;
      }
      clearEntriesFromBuffer('measure', name);
    }
  }, {
    key: "clearResourceTimings",
    value: function clearResourceTimings() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (name !== undefined) {
        name = `${name}`;
      }
      clearEntriesFromBuffer('resource', name);
    }
  }, {
    key: "getEntries",
    value: function getEntries() {
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      return filterBufferMapByNameAndType();
    }
  }, {
    key: "getEntriesByName",
    value: function getEntriesByName(name) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('name');
      }
      name = `${name}`;
      if (type !== undefined) {
        type = `${type}`;
      }
      return filterBufferMapByNameAndType(name, type);
    }
  }, {
    key: "getEntriesByType",
    value: function getEntriesByType(type) {
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('type');
      }
      type = `${type}`;
      return filterBufferMapByNameAndType(undefined, type);
    }
  }, {
    key: "mark",
    value: function mark(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('name');
      }
      return _mark(name, options);
    }
  }, {
    key: "measure",
    value: function measure(name) {
      var startOrMeasureOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      var endMark = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('name');
      }
      return _measure(name, startOrMeasureOptions, endMark);
    }
  }, {
    key: "now",
    value: function now() {
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      return _now();
    }
  }, {
    key: "setResourceTimingBufferSize",
    value: function setResourceTimingBufferSize(maxSize) {
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('maxSize');
      }
      maxSize = converters['unsigned long'](maxSize, {
        __proto__: null,
        context: 'maxSize'
      });
      return _setResourceTimingBufferSize(maxSize);
    }
  }, {
    key: "timeOrigin",
    get: function () {
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      return getTimeOriginTimestamp();
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      validateThisInternalField(this, kPerformanceBrand, 'Performance');
      return {
        nodeTiming: this.nodeTiming,
        timeOrigin: this.timeOrigin,
        eventLoopUtilization: this.eventLoopUtilization()
      };
    }
  }]);
}(EventTarget);
ObjectDefineProperties(Performance.prototype, {
  clearMarks: kEnumerableProperty,
  clearMeasures: kEnumerableProperty,
  clearResourceTimings: kEnumerableProperty,
  getEntries: kEnumerableProperty,
  getEntriesByName: kEnumerableProperty,
  getEntriesByType: kEnumerableProperty,
  mark: kEnumerableProperty,
  measure: kEnumerableProperty,
  now: kEnumerableProperty,
  timeOrigin: kEnumerableProperty,
  toJSON: kEnumerableProperty,
  setResourceTimingBufferSize: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'Performance'
  },
  // Node.js specific extensions.
  eventLoopUtilization: {
    __proto__: null,
    configurable: true,
    // Node.js specific extensions.
    enumerable: false,
    writable: true,
    value: eventLoopUtilization
  },
  nodeTiming: {
    __proto__: null,
    configurable: true,
    // Node.js specific extensions.
    enumerable: false,
    writable: true,
    value: nodeTiming
  },
  // In the browser, this function is not public.  However, it must be used inside fetch
  // which is a Node.js dependency, not a internal module
  markResourceTiming: {
    __proto__: null,
    configurable: true,
    // Node.js specific extensions.
    enumerable: false,
    writable: true,
    value: markResourceTiming
  },
  timerify: {
    __proto__: null,
    configurable: true,
    // Node.js specific extensions.
    enumerable: false,
    writable: true,
    value: timerify
  }
});
defineEventHandler(Performance.prototype, 'resourcetimingbufferfull');
function createPerformance() {
  return ReflectConstruct(function Performance() {
    initEventTarget(this);
    this[kPerformanceBrand] = true;
  }, [], Performance);
}
var performance = createPerformance();
function dispatchBufferFull(type) {
  var event = new Event(type, {
    [kTrustEvent]: true
  });
  performance.dispatchEvent(event);
}
setDispatchBufferFull(dispatchBufferFull);
module.exports = {
  Performance,
  performance
};

