'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  TraceSigintWatchdog
} = internalBinding('watchdog');
var SigintWatchdog = /*#__PURE__*/function (_TraceSigintWatchdog) {
  function SigintWatchdog() {
    var _this;
    _classCallCheck(this, SigintWatchdog);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, SigintWatchdog, [].concat(args));
    _defineProperty(_this, "_started", false);
    _defineProperty(_this, "_effective", false);
    _defineProperty(_this, "_onNewListener", eve => {
      if (eve === 'SIGINT' && _this._effective) {
        _superPropGet((_this, SigintWatchdog), "stop", _this, 3)([]);
        _this._effective = false;
      }
    });
    _defineProperty(_this, "_onRemoveListener", eve => {
      if (eve === 'SIGINT' && process.listenerCount('SIGINT') === 0 && !_this._effective) {
        _superPropGet((_this, SigintWatchdog), "start", _this, 3)([]);
        _this._effective = true;
      }
    });
    return _this;
  }
  _inherits(SigintWatchdog, _TraceSigintWatchdog);
  return _createClass(SigintWatchdog, [{
    key: "start",
    value: function start() {
      if (this._started) {
        return;
      }
      this._started = true;
      // Prepend sigint newListener to remove stop watchdog before signal wrap
      // been activated. Also make sigint removeListener been ran after signal
      // wrap been stopped.
      process.prependListener('newListener', this._onNewListener);
      process.addListener('removeListener', this._onRemoveListener);
      if (process.listenerCount('SIGINT') === 0) {
        _superPropGet(SigintWatchdog, "start", this, 3)([]);
        this._effective = true;
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      if (!this._started) {
        return;
      }
      this._started = false;
      process.removeListener('newListener', this._onNewListener);
      process.removeListener('removeListener', this._onRemoveListener);
      if (this._effective) {
        _superPropGet(SigintWatchdog, "stop", this, 3)([]);
        this._effective = false;
      }
    }
  }]);
}(TraceSigintWatchdog);
module.exports = {
  SigintWatchdog
};

