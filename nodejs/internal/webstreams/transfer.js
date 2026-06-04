'use strict';

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
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
var {
  ObjectDefineProperties,
  PromiseResolve,
  PromiseWithResolvers,
  ReflectConstruct
} = primordials;
var {
  kState,
  setPromiseHandled
} = require('internal/webstreams/util');
var {
  DOMException
} = internalBinding('messaging');
var {
  ReadableStream,
  readableStreamDefaultControllerEnqueue,
  readableStreamDefaultControllerClose,
  readableStreamDefaultControllerError,
  readableStreamPipeTo
} = require('internal/webstreams/readablestream');
var {
  WritableStream,
  writableStreamDefaultControllerErrorIfNeeded
} = require('internal/webstreams/writablestream');
var assert = require('internal/assert');
var {
  markTransferMode,
  kClone,
  kDeserialize
} = require('internal/worker/js_transferable');

// This class is a bit of a hack. The Node.js implementation of
// DOMException is not transferable/cloneable. This provides us
// with a variant that is. Unfortunately, it means playing around
// a bit with the message, name, and code properties and the
// prototype. We can revisit this if DOMException is ever made
// properly cloneable.
var CloneableDOMException = /*#__PURE__*/function (_DOMException) {
  function CloneableDOMException(message, name) {
    var _this;
    _classCallCheck(this, CloneableDOMException);
    _this = _callSuper(this, CloneableDOMException, [message, name]);
    markTransferMode(_this, true, false);
    _this[kDeserialize]({
      message: _this.message,
      name: _this.name,
      code: _this.code
    });
    return _this;
  }
  _inherits(CloneableDOMException, _DOMException);
  return _createClass(CloneableDOMException, [{
    key: kClone,
    value: function () {
      return {
        data: {
          message: this.message,
          name: this.name,
          code: this.code
        },
        deserializeInfo: 'internal/webstreams/transfer:InternalCloneableDOMException'
      };
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        message,
        name,
        code
      } = _ref;
      ObjectDefineProperties(this, {
        message: {
          __proto__: null,
          configurable: true,
          enumerable: true,
          get() {
            return message;
          }
        },
        name: {
          __proto__: null,
          configurable: true,
          enumerable: true,
          get() {
            return name;
          }
        },
        code: {
          __proto__: null,
          configurable: true,
          enumerable: true,
          get() {
            return code;
          }
        }
      });
    }
  }]);
}(DOMException);
function InternalCloneableDOMException() {
  return ReflectConstruct(CloneableDOMException, [], DOMException);
}
InternalCloneableDOMException[kDeserialize] = () => {};
var CrossRealmTransformReadableSource = /*#__PURE__*/function () {
  function CrossRealmTransformReadableSource(port, unref) {
    _classCallCheck(this, CrossRealmTransformReadableSource);
    this[kState] = {
      port,
      controller: undefined,
      unref
    };
    port.onmessage = _ref2 => {
      var {
        data
      } = _ref2;
      var {
        controller
      } = this[kState];
      var {
        type,
        value
      } = data;
      switch (type) {
        case 'chunk':
          readableStreamDefaultControllerEnqueue(controller, value);
          break;
        case 'close':
          readableStreamDefaultControllerClose(controller);
          port.close();
          break;
        case 'error':
          readableStreamDefaultControllerError(controller, value);
          port.close();
          break;
      }
    };
    port.onmessageerror = () => {
      var error = new CloneableDOMException('Internal transferred ReadableStream error', 'DataCloneError');
      port.postMessage({
        type: 'error',
        value: error
      });
      readableStreamDefaultControllerError(this[kState].controller, error);
      port.close();
    };
    port.unref();
  }
  return _createClass(CrossRealmTransformReadableSource, [{
    key: "start",
    value: function start(controller) {
      this[kState].controller = controller;
    }
  }, {
    key: "pull",
    value: function pull() {
      try {
        var _this2 = this;
        if (_this2[kState].unref) {
          _this2[kState].unref = false;
          _this2[kState].port.ref();
        }
        _this2[kState].port.postMessage({
          type: 'pull'
        });
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "cancel",
    value: function cancel(reason) {
      try {
        var _this3 = this;
        try {
          _this3[kState].port.postMessage({
            type: 'error',
            value: reason
          });
        } catch (error) {
          if (error instanceof DOMException) {
            // eslint-disable-next-line no-ex-assign
            error = new CloneableDOMException(error.message, error.name);
          }
          _this3[kState].port.postMessage({
            type: 'error',
            value: error
          });
          throw error;
        } finally {
          _this3[kState].port.close();
        }
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);
}();
var CrossRealmTransformWritableSink = /*#__PURE__*/function () {
  function CrossRealmTransformWritableSink(port, unref) {
    _classCallCheck(this, CrossRealmTransformWritableSink);
    this[kState] = {
      port,
      controller: undefined,
      backpressurePromise: PromiseWithResolvers(),
      unref
    };
    port.onmessage = _ref3 => {
      var {
        data
      } = _ref3;
      assert(typeof data === 'object');
      var {
        type,
        value
      } = _objectSpread({}, data);
      assert(typeof type === 'string');
      switch (type) {
        case 'pull':
          if (this[kState].backpressurePromise !== undefined) this[kState].backpressurePromise.resolve?.();
          this[kState].backpressurePromise = undefined;
          break;
        case 'error':
          writableStreamDefaultControllerErrorIfNeeded(this[kState].controller, value);
          if (this[kState].backpressurePromise !== undefined) this[kState].backpressurePromise.resolve?.();
          this[kState].backpressurePromise = undefined;
          break;
      }
    };
    port.onmessageerror = () => {
      var error = new CloneableDOMException('Internal transferred ReadableStream error', 'DataCloneError');
      port.postMessage({
        type: 'error',
        value: error
      });
      writableStreamDefaultControllerErrorIfNeeded(this[kState].controller, error);
      port.close();
    };
    port.unref();
  }
  return _createClass(CrossRealmTransformWritableSink, [{
    key: "start",
    value: function start(controller) {
      this[kState].controller = controller;
    }
  }, {
    key: "write",
    value: function write(chunk) {
      try {
        var _this4 = this;
        if (_this4[kState].unref) {
          _this4[kState].unref = false;
          _this4[kState].port.ref();
        }
        if (_this4[kState].backpressurePromise === undefined) {
          _this4[kState].backpressurePromise = {
            promise: PromiseResolve(),
            resolve: undefined,
            reject: undefined
          };
        }
        return _await(_this4[kState].backpressurePromise.promise, function () {
          _this4[kState].backpressurePromise = PromiseWithResolvers();
          try {
            _this4[kState].port.postMessage({
              type: 'chunk',
              value: chunk
            });
          } catch (error) {
            if (error instanceof DOMException) {
              // eslint-disable-next-line no-ex-assign
              error = new CloneableDOMException(error.message, error.name);
            }
            _this4[kState].port.postMessage({
              type: 'error',
              value: error
            });
            _this4[kState].port.close();
            throw error;
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "close",
    value: function close() {
      this[kState].port.postMessage({
        type: 'close'
      });
      this[kState].port.close();
    }
  }, {
    key: "abort",
    value: function abort(reason) {
      try {
        this[kState].port.postMessage({
          type: 'error',
          value: reason
        });
      } catch (error) {
        if (error instanceof DOMException) {
          // eslint-disable-next-line no-ex-assign
          error = new CloneableDOMException(error.message, error.name);
        }
        this[kState].port.postMessage({
          type: 'error',
          value: error
        });
        throw error;
      } finally {
        this[kState].port.close();
      }
    }
  }]);
}();
function newCrossRealmReadableStream(writable, port) {
  // MessagePort should always be unref.
  // There is a problem with the process not terminating.
  // https://github.com/nodejs/node/issues/44985
  var readable = new ReadableStream(new CrossRealmTransformReadableSource(port, false));
  var promise = readableStreamPipeTo(readable, writable, false, false, false);
  setPromiseHandled(promise);
  return {
    readable,
    promise
  };
}
function newCrossRealmWritableSink(readable, port) {
  // MessagePort should always be unref.
  // There is a problem with the process not terminating.
  // https://github.com/nodejs/node/issues/44985
  var writable = new WritableStream(new CrossRealmTransformWritableSink(port, false));
  var promise = readableStreamPipeTo(readable, writable, false, false, false);
  setPromiseHandled(promise);
  return {
    writable,
    promise
  };
}
module.exports = {
  newCrossRealmReadableStream,
  newCrossRealmWritableSink,
  CrossRealmTransformWritableSink,
  CrossRealmTransformReadableSource,
  CloneableDOMException,
  InternalCloneableDOMException
};

