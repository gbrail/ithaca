'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
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
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypePush,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  NumberMAX_SAFE_INTEGER,
  Symbol: _Symbol
} = primordials;
var Readable = require('internal/streams/readable');
var kEmitMessage = _Symbol('kEmitMessage');
var _buffer = /*#__PURE__*/new WeakMap();
var _canPush = /*#__PURE__*/new WeakMap();
var _TestsStream_brand = /*#__PURE__*/new WeakSet();
var TestsStream = /*#__PURE__*/function (_Readable) {
  function TestsStream() {
    var _this;
    _classCallCheck(this, TestsStream);
    _this = _callSuper(this, TestsStream, [{
      __proto__: null,
      objectMode: true,
      highWaterMark: NumberMAX_SAFE_INTEGER
    }]);
    _classPrivateMethodInitSpec(_this, _TestsStream_brand);
    _classPrivateFieldInitSpec(_this, _buffer, void 0);
    _classPrivateFieldInitSpec(_this, _canPush, void 0);
    _classPrivateFieldSet(_buffer, _this, []);
    _classPrivateFieldSet(_canPush, _this, true);
    return _this;
  }
  _inherits(TestsStream, _Readable);
  return _createClass(TestsStream, [{
    key: "_read",
    value: function _read() {
      _classPrivateFieldSet(_canPush, this, true);
      while (_classPrivateFieldGet(_buffer, this).length > 0) {
        var obj = ArrayPrototypeShift(_classPrivateFieldGet(_buffer, this));
        if (!_assertClassBrand(_TestsStream_brand, this, _tryPush).call(this, obj)) {
          return;
        }
      }
    }
  }, {
    key: "fail",
    value: function fail(nesting, loc, testNumber, name, details, directive, testId, parentId, tags) {
      this[kEmitMessage]('test:fail', _objectSpread(_objectSpread({
        __proto__: null,
        name,
        nesting,
        testNumber,
        testId,
        parentId,
        details,
        tags: ArrayPrototypeSlice(tags)
      }, loc), directive));
    }
  }, {
    key: "ok",
    value: function ok(nesting, loc, testNumber, name, details, directive, testId, parentId, tags) {
      this[kEmitMessage]('test:pass', _objectSpread(_objectSpread({
        __proto__: null,
        name,
        nesting,
        testNumber,
        testId,
        parentId,
        details,
        tags: ArrayPrototypeSlice(tags)
      }, loc), directive));
    }
  }, {
    key: "complete",
    value: function complete(nesting, loc, testNumber, name, details, directive, testId, parentId, tags) {
      this[kEmitMessage]('test:complete', _objectSpread(_objectSpread({
        __proto__: null,
        name,
        nesting,
        testNumber,
        testId,
        parentId,
        details,
        tags: ArrayPrototypeSlice(tags)
      }, loc), directive));
    }
  }, {
    key: "plan",
    value: function plan(nesting, loc, count) {
      this[kEmitMessage]('test:plan', _objectSpread({
        __proto__: null,
        nesting,
        count
      }, loc));
    }
  }, {
    key: "getSkip",
    value: function getSkip() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      return {
        __proto__: null,
        skip: reason ?? true
      };
    }
  }, {
    key: "getTodo",
    value: function getTodo() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      return {
        __proto__: null,
        todo: reason ?? true
      };
    }
  }, {
    key: "getXFail",
    value: function getXFail() {
      var expectation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      return {
        __proto__: null,
        expectFailure: expectation ?? true
      };
    }
  }, {
    key: "enqueue",
    value: function enqueue(nesting, loc, name, type, testId, parentId, tags) {
      this[kEmitMessage]('test:enqueue', _objectSpread({
        __proto__: null,
        nesting,
        name,
        type,
        testId,
        parentId,
        tags: ArrayPrototypeSlice(tags)
      }, loc));
    }
  }, {
    key: "dequeue",
    value: function dequeue(nesting, loc, name, type, testId, parentId, tags) {
      this[kEmitMessage]('test:dequeue', _objectSpread({
        __proto__: null,
        nesting,
        name,
        type,
        testId,
        parentId,
        tags: ArrayPrototypeSlice(tags)
      }, loc));
    }
  }, {
    key: "start",
    value: function start(nesting, loc, name, testId, parentId, tags) {
      this[kEmitMessage]('test:start', _objectSpread({
        __proto__: null,
        nesting,
        name,
        testId,
        parentId,
        tags: ArrayPrototypeSlice(tags)
      }, loc));
    }
  }, {
    key: "diagnostic",
    value: function diagnostic(nesting, loc, message) {
      var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'info';
      this[kEmitMessage]('test:diagnostic', _objectSpread({
        __proto__: null,
        nesting,
        message,
        level
      }, loc));
    }
  }, {
    key: "coverage",
    value: function coverage(nesting, loc, summary) {
      this[kEmitMessage]('test:coverage', _objectSpread({
        __proto__: null,
        nesting,
        summary
      }, loc));
    }
  }, {
    key: "summary",
    value: function summary(nesting, file, success, counts, duration_ms) {
      this[kEmitMessage]('test:summary', {
        __proto__: null,
        success,
        counts,
        duration_ms,
        file
      });
    }
  }, {
    key: "interrupted",
    value: function interrupted(tests) {
      this[kEmitMessage]('test:interrupted', {
        __proto__: null,
        tests
      });
    }
  }, {
    key: "end",
    value: function end() {
      _assertClassBrand(_TestsStream_brand, this, _tryPush).call(this, null);
    }
  }, {
    key: kEmitMessage,
    value: function (type, data) {
      this.emit(type, data);
      // Disabling as this going to the user-land
      // eslint-disable-next-line node-core/set-proto-to-null-in-object
      _assertClassBrand(_TestsStream_brand, this, _tryPush).call(this, {
        type,
        data
      });
    }
  }]);
}(Readable);
function _tryPush(message) {
  if (_classPrivateFieldGet(_canPush, this)) {
    _classPrivateFieldSet(_canPush, this, this.push(message));
  } else {
    ArrayPrototypePush(_classPrivateFieldGet(_buffer, this), message);
  }
  return _classPrivateFieldGet(_canPush, this);
}
module.exports = {
  TestsStream,
  kEmitMessage
};

