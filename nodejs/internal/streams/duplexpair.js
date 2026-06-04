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
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  Symbol: _Symbol
} = primordials;
var {
  Duplex
} = require('stream');
var assert = require('internal/assert');
var kCallback = _Symbol('Callback');
var kInitOtherSide = _Symbol('InitOtherSide');
var _otherSide = /*#__PURE__*/new WeakMap();
var DuplexSide = /*#__PURE__*/function (_Duplex) {
  function DuplexSide(options) {
    var _this;
    _classCallCheck(this, DuplexSide);
    _this = _callSuper(this, DuplexSide, [options]);
    _classPrivateFieldInitSpec(_this, _otherSide, null);
    _this[kCallback] = null;
    _classPrivateFieldSet(_otherSide, _this, null);
    return _this;
  }
  _inherits(DuplexSide, _Duplex);
  return _createClass(DuplexSide, [{
    key: kInitOtherSide,
    value: function (otherSide) {
      // Ensure this can only be set once, to enforce encapsulation.
      if (_classPrivateFieldGet(_otherSide, this) === null) {
        _classPrivateFieldSet(_otherSide, this, otherSide);
      } else {
        assert(_classPrivateFieldGet(_otherSide, this) === null);
      }
    }
  }, {
    key: "_read",
    value: function _read() {
      var callback = this[kCallback];
      if (callback) {
        this[kCallback] = null;
        callback();
      }
    }
  }, {
    key: "_write",
    value: function _write(chunk, encoding, callback) {
      assert(_classPrivateFieldGet(_otherSide, this) !== null);
      assert(_classPrivateFieldGet(_otherSide, this)[kCallback] === null);
      if (chunk.length === 0) {
        process.nextTick(callback);
      } else {
        _classPrivateFieldGet(_otherSide, this).push(chunk);
        _classPrivateFieldGet(_otherSide, this)[kCallback] = callback;
      }
    }
  }, {
    key: "_final",
    value: function _final(callback) {
      _classPrivateFieldGet(_otherSide, this).on('end', callback);
      _classPrivateFieldGet(_otherSide, this).push(null);
    }
  }, {
    key: "_destroy",
    value: function _destroy(err, callback) {
      var otherSide = _classPrivateFieldGet(_otherSide, this);
      if (otherSide !== null && !otherSide.destroyed) {
        // Use nextTick to avoid crashing the current execution stack (like HTTP parser)
        process.nextTick(() => {
          if (otherSide.destroyed) return;
          if (err) {
            // Destroy the other side, without passing the 'err' object.
            // This closes the other side gracefully so it doesn't hang,
            // but prevents the "Unhandled error" crash.
            otherSide.destroy();
          } else {
            // Standard graceful close
            otherSide.push(null);
          }
        });
      }
      callback(err);
    }
  }]);
}(Duplex);
function duplexPair(options) {
  var side0 = new DuplexSide(options);
  var side1 = new DuplexSide(options);
  side0[kInitOtherSide](side1);
  side1[kInitOtherSide](side0);
  return [side0, side1];
}
module.exports = duplexPair;

