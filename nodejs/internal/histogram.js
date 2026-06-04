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
  Map,
  MapPrototypeClear,
  MapPrototypeEntries,
  NumberIsNaN,
  NumberMAX_SAFE_INTEGER,
  ObjectFromEntries,
  ReflectConstruct,
  Symbol: _Symbol
} = primordials;
var {
  Histogram: _Histogram
} = internalBinding('performance');
var {
  customInspectSymbol: kInspect,
  kEmptyObject
} = require('internal/util');
var {
  inspect
} = require('util');
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_THIS,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var {
  validateInteger,
  validateNumber,
  validateObject
} = require('internal/validators');
var kDestroy = _Symbol('kDestroy');
var kHandle = _Symbol('kHandle');
var kMap = _Symbol('kMap');
var kRecordable = _Symbol('kRecordable');
var {
  kClone,
  kDeserialize,
  markTransferMode
} = require('internal/worker/js_transferable');
function isHistogram(object) {
  return object?.[kHandle] !== undefined;
}
var kSkipThrow = _Symbol('kSkipThrow');
var Histogram = /*#__PURE__*/function () {
  function Histogram() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, Histogram);
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
  }
  return _createClass(Histogram, [{
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `Histogram ${inspect({
        min: this.min,
        max: this.max,
        mean: this.mean,
        exceeds: this.exceeds,
        stddev: this.stddev,
        count: this.count,
        percentiles: this.percentiles
      }, opts)}`;
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "count",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.count();
    }

    /**
     * @readonly
     * @type {bigint}
     */
  }, {
    key: "countBigInt",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.countBigInt();
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "min",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.min();
    }

    /**
     * @readonly
     * @type {bigint}
     */
  }, {
    key: "minBigInt",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.minBigInt();
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "max",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.max();
    }

    /**
     * @readonly
     * @type {bigint}
     */
  }, {
    key: "maxBigInt",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.maxBigInt();
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "mean",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.mean();
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "exceeds",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.exceeds();
    }

    /**
     * @readonly
     * @type {bigint}
     */
  }, {
    key: "exceedsBigInt",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.exceedsBigInt();
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "stddev",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      return this[kHandle]?.stddev();
    }

    /**
     * @param {number} percentile
     * @returns {number}
     */
  }, {
    key: "percentile",
    value: function percentile(_percentile) {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      validateNumber(_percentile, 'percentile');
      if (NumberIsNaN(_percentile) || _percentile <= 0 || _percentile > 100) throw new ERR_OUT_OF_RANGE('percentile', '> 0 && <= 100', _percentile);
      return this[kHandle]?.percentile(_percentile);
    }

    /**
     * @param {number} percentile
     * @returns {bigint}
     */
  }, {
    key: "percentileBigInt",
    value: function percentileBigInt(percentile) {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      validateNumber(percentile, 'percentile');
      if (NumberIsNaN(percentile) || percentile <= 0 || percentile > 100) throw new ERR_OUT_OF_RANGE('percentile', '> 0 && <= 100', percentile);
      return this[kHandle]?.percentileBigInt(percentile);
    }

    /**
     * @readonly
     * @type {Map<number,number>}
     */
  }, {
    key: "percentiles",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      MapPrototypeClear(this[kMap]);
      this[kHandle]?.percentiles(this[kMap]);
      return this[kMap];
    }

    /**
     * @readonly
     * @type {Map<number,bigint>}
     */
  }, {
    key: "percentilesBigInt",
    get: function () {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      MapPrototypeClear(this[kMap]);
      this[kHandle]?.percentilesBigInt(this[kMap]);
      return this[kMap];
    }

    /**
     * @returns {void}
     */
  }, {
    key: "reset",
    value: function reset() {
      if (!isHistogram(this)) throw new ERR_INVALID_THIS('Histogram');
      this[kHandle]?.reset();
    }
  }, {
    key: kClone,
    value: function () {
      var handle = this[kHandle];
      return {
        data: {
          handle
        },
        deserializeInfo: 'internal/histogram:ClonedHistogram'
      };
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        handle
      } = _ref;
      this[kHandle] = handle;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        count: this.count,
        min: this.min,
        max: this.max,
        mean: this.mean,
        exceeds: this.exceeds,
        stddev: this.stddev,
        percentiles: ObjectFromEntries(MapPrototypeEntries(this.percentiles))
      };
    }
  }]);
}();
var RecordableHistogram = /*#__PURE__*/function (_Histogram2) {
  function RecordableHistogram() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, RecordableHistogram);
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    return _callSuper(this, RecordableHistogram, [skipThrowSymbol]);
  }

  /**
   * @param {number|bigint} val
   * @returns {void}
   */
  _inherits(RecordableHistogram, _Histogram2);
  return _createClass(RecordableHistogram, [{
    key: "record",
    value: function record(val) {
      if (this[kRecordable] === undefined) throw new ERR_INVALID_THIS('RecordableHistogram');
      if (typeof val === 'bigint') {
        this[kHandle]?.record(val);
        return;
      }
      validateInteger(val, 'val', 1);
      this[kHandle]?.record(val);
    }

    /**
     * @returns {void}
     */
  }, {
    key: "recordDelta",
    value: function recordDelta() {
      if (this[kRecordable] === undefined) throw new ERR_INVALID_THIS('RecordableHistogram');
      this[kHandle]?.recordDelta();
    }

    /**
     * @param {RecordableHistogram} other
     */
  }, {
    key: "add",
    value: function add(other) {
      if (this[kRecordable] === undefined) throw new ERR_INVALID_THIS('RecordableHistogram');
      if (other[kRecordable] === undefined) throw new ERR_INVALID_ARG_TYPE('other', 'RecordableHistogram', other);
      this[kHandle]?.add(other[kHandle]);
    }
  }, {
    key: kClone,
    value: function () {
      var handle = this[kHandle];
      return {
        data: {
          handle
        },
        deserializeInfo: 'internal/histogram:ClonedRecordableHistogram'
      };
    }
  }, {
    key: kDeserialize,
    value: function (_ref2) {
      var {
        handle
      } = _ref2;
      this[kHandle] = handle;
    }
  }]);
}(Histogram);
function ClonedHistogram(handle) {
  return ReflectConstruct(function () {
    markTransferMode(this, true, false);
    this[kHandle] = handle;
    this[kMap] = new Map();
  }, [], Histogram);
}
ClonedHistogram.prototype[kDeserialize] = () => {};
function ClonedRecordableHistogram(handle) {
  var histogram = new RecordableHistogram(kSkipThrow);
  markTransferMode(histogram, true, false);
  histogram[kRecordable] = true;
  histogram[kMap] = new Map();
  histogram[kHandle] = handle;
  histogram.constructor = RecordableHistogram;
  return histogram;
}
ClonedRecordableHistogram.prototype[kDeserialize] = () => {};
function createRecordableHistogram(handle) {
  return new ClonedRecordableHistogram(handle);
}

/**
 * @param {{
 *   lowest? : number,
 *   highest? : number,
 *   figures? : number
 * }} [options]
 * @returns {RecordableHistogram}
 */
function createHistogram() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  validateObject(options, 'options');
  var {
    lowest = 1,
    highest = NumberMAX_SAFE_INTEGER,
    figures = 3
  } = options;
  if (typeof lowest !== 'bigint') validateInteger(lowest, 'options.lowest', 1, NumberMAX_SAFE_INTEGER);
  if (typeof highest !== 'bigint') {
    validateInteger(highest, 'options.highest', 2 * lowest, NumberMAX_SAFE_INTEGER);
  } else if (highest < 2n * lowest) {
    throw new ERR_INVALID_ARG_VALUE.RangeError('options.highest', highest);
  }
  validateInteger(figures, 'options.figures', 1, 5);
  return createRecordableHistogram(new _Histogram(lowest, highest, figures));
}
module.exports = {
  Histogram,
  RecordableHistogram,
  ClonedHistogram,
  ClonedRecordableHistogram,
  isHistogram,
  kDestroy,
  kHandle,
  kMap,
  createHistogram
};

