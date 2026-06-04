'use strict';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
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
  Symbol: _Symbol
} = primordials;
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR
  }
} = require('internal/errors');
var {
  customInspectSymbol: kInspect,
  kEnumerableProperty
} = require('internal/util');
var {
  validateThisInternalField
} = require('internal/validators');
var {
  inspect
} = require('util');
var kName = _Symbol('PerformanceEntry.Name');
var kEntryType = _Symbol('PerformanceEntry.EntryType');
var kStartTime = _Symbol('PerformanceEntry.StartTime');
var kDuration = _Symbol('PerformanceEntry.Duration');
var kDetail = _Symbol('NodePerformanceEntry.Detail');
var kSkipThrow = _Symbol('kSkipThrow');
function isPerformanceEntry(obj) {
  return obj?.[kName] !== undefined;
}
var PerformanceEntry = /*#__PURE__*/function () {
  function PerformanceEntry() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
    var duration = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
    _classCallCheck(this, PerformanceEntry);
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    this[kName] = name;
    this[kEntryType] = type;
    this[kStartTime] = start;
    this[kDuration] = duration;
  }
  return _createClass(PerformanceEntry, [{
    key: "name",
    get: function () {
      validateThisInternalField(this, kName, 'PerformanceEntry');
      return this[kName];
    }
  }, {
    key: "entryType",
    get: function () {
      validateThisInternalField(this, kEntryType, 'PerformanceEntry');
      return this[kEntryType];
    }
  }, {
    key: "startTime",
    get: function () {
      validateThisInternalField(this, kStartTime, 'PerformanceEntry');
      return this[kStartTime];
    }
  }, {
    key: "duration",
    get: function () {
      validateThisInternalField(this, kDuration, 'PerformanceEntry');
      return this[kDuration];
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `${this.constructor.name} ${inspect(this.toJSON(), opts)}`;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      validateThisInternalField(this, kName, 'PerformanceEntry');
      return {
        name: this[kName],
        entryType: this[kEntryType],
        startTime: this[kStartTime],
        duration: this[kDuration]
      };
    }
  }]);
}();
ObjectDefineProperties(PerformanceEntry.prototype, {
  name: kEnumerableProperty,
  entryType: kEnumerableProperty,
  startTime: kEnumerableProperty,
  duration: kEnumerableProperty,
  toJSON: kEnumerableProperty
});
function createPerformanceEntry(name, type, start, duration) {
  return new PerformanceEntry(kSkipThrow, name, type, start, duration);
}

/**
 * Node.js specific extension to PerformanceEntry.
 */
var PerformanceNodeEntry = /*#__PURE__*/function (_PerformanceEntry) {
  function PerformanceNodeEntry() {
    _classCallCheck(this, PerformanceNodeEntry);
    return _callSuper(this, PerformanceNodeEntry, arguments);
  }
  _inherits(PerformanceNodeEntry, _PerformanceEntry);
  return _createClass(PerformanceNodeEntry, [{
    key: "detail",
    get: function () {
      validateThisInternalField(this, kDetail, 'NodePerformanceEntry');
      return this[kDetail];
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      validateThisInternalField(this, kName, 'PerformanceEntry');
      return {
        name: this[kName],
        entryType: this[kEntryType],
        startTime: this[kStartTime],
        duration: this[kDuration],
        detail: this[kDetail]
      };
    }
  }]);
}(PerformanceEntry);
function createPerformanceNodeEntry(name, type, start, duration, detail) {
  var entry = new PerformanceNodeEntry(kSkipThrow, name, type, start, duration);
  entry[kDetail] = detail;
  return entry;
}
module.exports = {
  createPerformanceEntry,
  PerformanceEntry,
  isPerformanceEntry,
  PerformanceNodeEntry,
  createPerformanceNodeEntry,
  kSkipThrow
};

