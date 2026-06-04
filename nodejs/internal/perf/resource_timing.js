'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming
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
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR
  }
} = require('internal/errors');
var {
  PerformanceEntry,
  kSkipThrow
} = require('internal/perf/performance_entry');
var assert = require('internal/assert');
var {
  enqueue,
  bufferResourceTiming
} = require('internal/perf/observe');
var {
  validateThisInternalField
} = require('internal/validators');
var {
  kEnumerableProperty
} = require('internal/util');
var kCacheMode = _Symbol('kCacheMode');
var kRequestedUrl = _Symbol('kRequestedUrl');
var kTimingInfo = _Symbol('kTimingInfo');
var kInitiatorType = _Symbol('kInitiatorType');
var kDeliveryType = _Symbol('kDeliveryType');
var kResponseStatus = _Symbol('kResponseStatus');
var PerformanceResourceTiming = /*#__PURE__*/function (_PerformanceEntry) {
  function PerformanceResourceTiming() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    _classCallCheck(this, PerformanceResourceTiming);
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    return _callSuper(this, PerformanceResourceTiming, [skipThrowSymbol, name, type]);
  }
  _inherits(PerformanceResourceTiming, _PerformanceEntry);
  return _createClass(PerformanceResourceTiming, [{
    key: "name",
    get: function () {
      validateThisInternalField(this, kRequestedUrl, 'PerformanceResourceTiming');
      return this[kRequestedUrl];
    }
  }, {
    key: "startTime",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].startTime;
    }
  }, {
    key: "duration",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].endTime - this[kTimingInfo].startTime;
    }
  }, {
    key: "initiatorType",
    get: function () {
      validateThisInternalField(this, kInitiatorType, 'PerformanceResourceTiming');
      return this[kInitiatorType];
    }
  }, {
    key: "workerStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalServiceWorkerStartTime;
    }
  }, {
    key: "redirectStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].redirectStartTime;
    }
  }, {
    key: "redirectEnd",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].redirectEndTime;
    }
  }, {
    key: "fetchStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].postRedirectStartTime;
    }
  }, {
    key: "domainLookupStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalConnectionTimingInfo?.domainLookupStartTime;
    }
  }, {
    key: "domainLookupEnd",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalConnectionTimingInfo?.domainLookupEndTime;
    }
  }, {
    key: "connectStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalConnectionTimingInfo?.connectionStartTime;
    }
  }, {
    key: "connectEnd",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalConnectionTimingInfo?.connectionEndTime;
    }
  }, {
    key: "secureConnectionStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalConnectionTimingInfo?.secureConnectionStartTime;
    }
  }, {
    key: "nextHopProtocol",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalConnectionTimingInfo?.ALPNNegotiatedProtocol;
    }
  }, {
    key: "requestStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalNetworkRequestStartTime;
    }
  }, {
    key: "responseStart",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].finalNetworkResponseStartTime;
    }
  }, {
    key: "responseEnd",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].endTime;
    }
  }, {
    key: "encodedBodySize",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].encodedBodySize;
    }
  }, {
    key: "decodedBodySize",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kTimingInfo].decodedBodySize;
    }
  }, {
    key: "transferSize",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      if (this[kCacheMode] === 'local') return 0;
      if (this[kCacheMode] === 'validated') return 300;
      return this[kTimingInfo].encodedBodySize + 300;
    }
  }, {
    key: "deliveryType",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kDeliveryType];
    }
  }, {
    key: "responseStatus",
    get: function () {
      validateThisInternalField(this, kTimingInfo, 'PerformanceResourceTiming');
      return this[kResponseStatus];
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      validateThisInternalField(this, kInitiatorType, 'PerformanceResourceTiming');
      return {
        name: this.name,
        entryType: this.entryType,
        startTime: this.startTime,
        duration: this.duration,
        initiatorType: this[kInitiatorType],
        nextHopProtocol: this.nextHopProtocol,
        workerStart: this.workerStart,
        redirectStart: this.redirectStart,
        redirectEnd: this.redirectEnd,
        fetchStart: this.fetchStart,
        domainLookupStart: this.domainLookupStart,
        domainLookupEnd: this.domainLookupEnd,
        connectStart: this.connectStart,
        connectEnd: this.connectEnd,
        secureConnectionStart: this.secureConnectionStart,
        requestStart: this.requestStart,
        responseStart: this.responseStart,
        responseEnd: this.responseEnd,
        transferSize: this.transferSize,
        encodedBodySize: this.encodedBodySize,
        decodedBodySize: this.decodedBodySize,
        deliveryType: this.deliveryType,
        responseStatus: this.responseStatus
      };
    }
  }]);
}(PerformanceEntry);
ObjectDefineProperties(PerformanceResourceTiming.prototype, {
  initiatorType: kEnumerableProperty,
  nextHopProtocol: kEnumerableProperty,
  workerStart: kEnumerableProperty,
  redirectStart: kEnumerableProperty,
  redirectEnd: kEnumerableProperty,
  fetchStart: kEnumerableProperty,
  domainLookupStart: kEnumerableProperty,
  domainLookupEnd: kEnumerableProperty,
  connectStart: kEnumerableProperty,
  connectEnd: kEnumerableProperty,
  secureConnectionStart: kEnumerableProperty,
  requestStart: kEnumerableProperty,
  responseStart: kEnumerableProperty,
  responseEnd: kEnumerableProperty,
  transferSize: kEnumerableProperty,
  encodedBodySize: kEnumerableProperty,
  decodedBodySize: kEnumerableProperty,
  deliveryType: kEnumerableProperty,
  responseStatus: kEnumerableProperty,
  toJSON: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'PerformanceResourceTiming'
  }
});
function createPerformanceResourceTiming(requestedUrl, initiatorType, timingInfo) {
  var cacheMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var bodyInfo = arguments.length > 4 ? arguments[4] : undefined;
  var responseStatus = arguments.length > 5 ? arguments[5] : undefined;
  var deliveryType = arguments.length > 6 ? arguments[6] : undefined;
  var resourceTiming = new PerformanceResourceTiming(kSkipThrow, requestedUrl, 'resource');
  resourceTiming[kInitiatorType] = initiatorType;
  resourceTiming[kRequestedUrl] = requestedUrl;
  // https://fetch.spec.whatwg.org/#fetch-timing-info
  // This class is using timingInfo assuming it's already validated.
  // The spec doesn't say to validate it in the class construction.
  resourceTiming[kTimingInfo] = timingInfo;
  resourceTiming[kCacheMode] = cacheMode;
  resourceTiming[kDeliveryType] = deliveryType;
  resourceTiming[kResponseStatus] = responseStatus;
  return resourceTiming;
}

// https://w3c.github.io/resource-timing/#dfn-mark-resource-timing
function markResourceTiming(timingInfo, requestedUrl, initiatorType, global, cacheMode, bodyInfo, responseStatus) {
  var deliveryType = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';
  // https://w3c.github.io/resource-timing/#dfn-setup-the-resource-timing-entry
  assert(cacheMode === '' || cacheMode === 'local', 'cache must be an empty string or \'local\'');
  var resource = createPerformanceResourceTiming(requestedUrl, initiatorType, timingInfo, cacheMode, bodyInfo, responseStatus, deliveryType);
  enqueue(resource);
  bufferResourceTiming(resource);
  return resource;
}
module.exports = {
  PerformanceResourceTiming,
  markResourceTiming
};

