'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ReflectConstruct,
  SafeMap,
  Symbol: _Symbol,
  SymbolDispose
} = primordials;
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_THIS
  }
} = require('internal/errors');
var {
  createELDHistogram
} = internalBinding('performance');
var {
  validateInteger,
  validateObject
} = require('internal/validators');
var {
  Histogram,
  kHandle,
  kMap
} = require('internal/histogram');
var {
  kEmptyObject
} = require('internal/util');
var {
  markTransferMode
} = require('internal/worker/js_transferable');
var kEnabled = _Symbol('kEnabled');
var ELDHistogram = /*#__PURE__*/function (_Histogram) {
  function ELDHistogram() {
    var _this;
    _classCallCheck(this, ELDHistogram);
    throw new ERR_ILLEGAL_CONSTRUCTOR();
    return _assertThisInitialized(_this);
  }

  /**
   * @returns {boolean}
   */
  _inherits(ELDHistogram, _Histogram);
  return _createClass(ELDHistogram, [{
    key: "enable",
    value: function enable() {
      if (this[kEnabled] === undefined) throw new ERR_INVALID_THIS('ELDHistogram');
      if (this[kEnabled]) return false;
      this[kEnabled] = true;
      this[kHandle].start();
      return true;
    }

    /**
     * @returns {boolean}
     */
  }, {
    key: "disable",
    value: function disable() {
      if (this[kEnabled] === undefined) throw new ERR_INVALID_THIS('ELDHistogram');
      if (!this[kEnabled]) return false;
      this[kEnabled] = false;
      this[kHandle].stop();
      return true;
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.disable();
    }
  }]);
}(Histogram);
/**
 * @param {{
 *   resolution : number
 * }} [options]
 * @returns {ELDHistogram}
 */
function monitorEventLoopDelay() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  validateObject(options, 'options');
  var {
    resolution = 10
  } = options;
  validateInteger(resolution, 'options.resolution', 1);
  return ReflectConstruct(function () {
    markTransferMode(this, true, false);
    this[kEnabled] = false;
    this[kHandle] = createELDHistogram(resolution);
    this[kMap] = new SafeMap();
  }, [], ELDHistogram);
}
module.exports = monitorEventLoopDelay;

