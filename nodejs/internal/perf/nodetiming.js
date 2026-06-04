'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ObjectDefineProperties,
  ObjectSetPrototypeOf
} = primordials;
var {
  PerformanceEntry
} = require('internal/perf/performance_entry');
var {
  now,
  getMilestoneTimestamp
} = require('internal/perf/utils');
var {
  customInspectSymbol: kInspect
} = require('internal/util');
var {
  inspect
} = require('util');
var {
  constants: {
    NODE_PERFORMANCE_MILESTONE_NODE_START,
    NODE_PERFORMANCE_MILESTONE_V8_START,
    NODE_PERFORMANCE_MILESTONE_LOOP_START,
    NODE_PERFORMANCE_MILESTONE_LOOP_EXIT,
    NODE_PERFORMANCE_MILESTONE_BOOTSTRAP_COMPLETE,
    NODE_PERFORMANCE_MILESTONE_ENVIRONMENT
  },
  loopIdleTime,
  uvMetricsInfo
} = internalBinding('performance');
var PerformanceNodeTiming = /*#__PURE__*/function () {
  function PerformanceNodeTiming() {
    _classCallCheck(this, PerformanceNodeTiming);
    ObjectDefineProperties(this, {
      name: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        value: 'node'
      },
      entryType: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        value: 'node'
      },
      startTime: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        value: 0
      },
      duration: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get: now
      },
      nodeStart: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get() {
          return getMilestoneTimestamp(NODE_PERFORMANCE_MILESTONE_NODE_START);
        }
      },
      v8Start: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get() {
          return getMilestoneTimestamp(NODE_PERFORMANCE_MILESTONE_V8_START);
        }
      },
      environment: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get() {
          return getMilestoneTimestamp(NODE_PERFORMANCE_MILESTONE_ENVIRONMENT);
        }
      },
      loopStart: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get() {
          return getMilestoneTimestamp(NODE_PERFORMANCE_MILESTONE_LOOP_START);
        }
      },
      loopExit: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get() {
          return getMilestoneTimestamp(NODE_PERFORMANCE_MILESTONE_LOOP_EXIT);
        }
      },
      bootstrapComplete: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get() {
          return getMilestoneTimestamp(NODE_PERFORMANCE_MILESTONE_BOOTSTRAP_COMPLETE);
        }
      },
      idleTime: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get: loopIdleTime
      },
      uvMetricsInfo: {
        __proto__: null,
        enumerable: true,
        configurable: true,
        get: () => {
          var metrics = uvMetricsInfo();
          return {
            loopCount: metrics[0],
            events: metrics[1],
            eventsWaiting: metrics[2]
          };
        }
      }
    });
  }
  return _createClass(PerformanceNodeTiming, [{
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `PerformanceNodeTiming ${inspect(this.toJSON(), opts)}`;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        name: 'node',
        entryType: 'node',
        startTime: this.startTime,
        duration: this.duration,
        nodeStart: this.nodeStart,
        v8Start: this.v8Start,
        bootstrapComplete: this.bootstrapComplete,
        environment: this.environment,
        loopStart: this.loopStart,
        loopExit: this.loopExit,
        idleTime: this.idleTime
      };
    }
  }]);
}();
ObjectSetPrototypeOf(PerformanceNodeTiming.prototype, PerformanceEntry.prototype);
module.exports = new PerformanceNodeTiming();

