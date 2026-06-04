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
  ObjectSetPrototypeOf,
  SafeMap
} = primordials;
var {
  getContinuationPreservedEmbedderData,
  setContinuationPreservedEmbedderData
} = internalBinding('async_context_frame');
var enabled_;
var ActiveAsyncContextFrame = /*#__PURE__*/function (_SafeMap) {
  function ActiveAsyncContextFrame() {
    _classCallCheck(this, ActiveAsyncContextFrame);
    return _callSuper(this, ActiveAsyncContextFrame, arguments);
  }
  _inherits(ActiveAsyncContextFrame, _SafeMap);
  return _createClass(ActiveAsyncContextFrame, null, [{
    key: "enabled",
    get: function () {
      return true;
    }
  }, {
    key: "current",
    value: function current() {
      return getContinuationPreservedEmbedderData();
    }
  }, {
    key: "set",
    value: function set(frame) {
      setContinuationPreservedEmbedderData(frame);
    }
  }, {
    key: "exchange",
    value: function exchange(frame) {
      var prior = this.current();
      this.set(frame);
      return prior;
    }
  }, {
    key: "disable",
    value: function disable(store) {
      var frame = this.current();
      frame?.disable(store);
    }
  }]);
}(SafeMap);
function checkEnabled() {
  var enabled = require('internal/options').getOptionValue('--async-context-frame');

  // If enabled, swap to active prototype so we don't need to check status
  // on every interaction with the async context frame.
  if (enabled) {
    // eslint-disable-next-line no-use-before-define
    ObjectSetPrototypeOf(AsyncContextFrame, ActiveAsyncContextFrame);
  }
  return enabled;
}
var InactiveAsyncContextFrame = /*#__PURE__*/function (_SafeMap2) {
  function InactiveAsyncContextFrame() {
    _classCallCheck(this, InactiveAsyncContextFrame);
    return _callSuper(this, InactiveAsyncContextFrame, arguments);
  }
  _inherits(InactiveAsyncContextFrame, _SafeMap2);
  return _createClass(InactiveAsyncContextFrame, null, [{
    key: "enabled",
    get: function () {
      enabled_ ??= checkEnabled();
      return enabled_;
    }
  }, {
    key: "current",
    value: function current() {}
  }, {
    key: "set",
    value: function set(frame) {}
  }, {
    key: "exchange",
    value: function exchange(frame) {}
  }, {
    key: "disable",
    value: function disable(store) {}
  }]);
}(SafeMap);
var AsyncContextFrame = /*#__PURE__*/function (_InactiveAsyncContext) {
  function AsyncContextFrame(store, data) {
    var _this;
    _classCallCheck(this, AsyncContextFrame);
    _this = _callSuper(this, AsyncContextFrame, [AsyncContextFrame.current()]);
    _this.set(store, data);
    return _this;
  }
  _inherits(AsyncContextFrame, _InactiveAsyncContext);
  return _createClass(AsyncContextFrame, [{
    key: "disable",
    value: function disable(store) {
      this.delete(store);
    }
  }]);
}(InactiveAsyncContextFrame);
module.exports = AsyncContextFrame;

