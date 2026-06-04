'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  Array,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  ObjectAssign,
  ObjectCreate,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptors,
  ObjectGetPrototypeOf,
  ObjectSetPrototypeOf,
  ObjectValues,
  ReflectApply,
  Symbol: _Symbol,
  SymbolFor
} = primordials;
var {
  assignFunctionName,
  kEnumerableProperty,
  setOwnProperty
} = require('internal/util');
var {
  handle_onclose: handleOnCloseSymbol,
  oninit: onInitSymbol,
  no_message_symbol: noMessageSymbol
} = internalBinding('symbols');
var {
  privateSymbols: {
    transfer_mode_private_symbol
  },
  constants: {
    kCloneable
  }
} = internalBinding('util');
var {
  MessagePort,
  MessageChannel,
  broadcastChannel,
  drainMessagePort,
  moveMessagePortToContext,
  receiveMessageOnPort: receiveMessageOnPort_,
  stopMessagePort,
  DOMException
} = internalBinding('messaging');
var {
  getEnvMessagePort
} = internalBinding('worker');
var {
  Readable,
  Writable
} = require('stream');
var {
  Event,
  EventTarget,
  NodeEventTarget,
  defineEventHandler,
  initNodeEventTarget,
  kCreateEvent,
  kNewListener,
  kRemoveListener
} = require('internal/event_target');
var {
  inspect
} = require('internal/util/inspect');
var {
  codes: {
    ERR_INVALID_THIS,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
var kHandle = _Symbol('kHandle');
var kIncrementsPortRef = _Symbol('kIncrementsPortRef');
var kName = _Symbol('kName');
var kOnMessage = _Symbol('kOnMessage');
var kOnMessageError = _Symbol('kOnMessageError');
var kPort = _Symbol('kPort');
var kWaitingStreams = _Symbol('kWaitingStreams');
var kWritableCallback = _Symbol('kWritableCallback');
var kStartedReading = _Symbol('kStartedReading');
var kStdioWantsMoreDataCallback = _Symbol('kStdioWantsMoreDataCallback');
var kCurrentlyReceivingPorts = SymbolFor('nodejs.internal.kCurrentlyReceivingPorts');
var kType = _Symbol('kType');
var messageTypes = {
  UP_AND_RUNNING: 'upAndRunning',
  COULD_NOT_SERIALIZE_ERROR: 'couldNotSerializeError',
  ERROR_MESSAGE: 'errorMessage',
  STDIO_PAYLOAD: 'stdioPayload',
  STDIO_WANTS_MORE_DATA: 'stdioWantsMoreData',
  LOAD_SCRIPT: 'loadScript'
};

// createFastMessageEvent skips webidl argument validation when the arguments
// passed are known to be valid.
var fastCreateMessageEvent;
function lazyMessageEvent(type, init) {
  fastCreateMessageEvent ??= require('internal/deps/undici/undici').createFastMessageEvent;
  return fastCreateMessageEvent(type, init);
}

// We have to mess with the MessagePort prototype a bit, so that a) we can make
// it inherit from NodeEventTarget, even though it is a C++ class, and b) we do
// not provide methods that are not present in the Browser and not documented
// on our side (e.g. stopMessagePort).
var messagePortPrototypePropertyDescriptors = ObjectGetOwnPropertyDescriptors(MessagePort.prototype);
var propertiesValues = ObjectValues(messagePortPrototypePropertyDescriptors);
for (var i = 0; i < propertiesValues.length; i++) {
  // We want to use null-prototype objects to not rely on globally mutable
  // %Object.prototype%.
  ObjectSetPrototypeOf(propertiesValues[i], null);
}
// Save a copy of the original set of methods as a shallow clone.
var MessagePortPrototype = ObjectCreate(ObjectGetPrototypeOf(MessagePort.prototype), messagePortPrototypePropertyDescriptors);
// Set up the new inheritance chain.
ObjectSetPrototypeOf(MessagePort, NodeEventTarget);
ObjectSetPrototypeOf(MessagePort.prototype, NodeEventTarget.prototype);
// Copy methods that are inherited from HandleWrap, because
// changing the prototype of MessagePort.prototype implicitly removed them.
MessagePort.prototype.ref = MessagePortPrototype.ref;
MessagePort.prototype.unref = MessagePortPrototype.unref;
MessagePort.prototype.hasRef = function hasRef() {
  return !!FunctionPrototypeCall(MessagePortPrototype.hasRef, this);
};
var originalCreateEvent = EventTarget.prototype[kCreateEvent];
ObjectDefineProperty(MessagePort.prototype, kCreateEvent, {
  __proto__: null,
  value: assignFunctionName(kCreateEvent, function (data, type) {
    if (type !== 'message' && type !== 'messageerror') {
      return ReflectApply(originalCreateEvent, this, arguments);
    }
    var ports = this[kCurrentlyReceivingPorts];
    this[kCurrentlyReceivingPorts] = undefined;
    return lazyMessageEvent(type, {
      data,
      ports
    });
  }),
  configurable: false,
  writable: false,
  enumerable: false
});

// This is called from inside the `MessagePort` constructor.
function oninit() {
  initNodeEventTarget(this);
  setupPortReferencing(this, this, 'message');
  this[kCurrentlyReceivingPorts] = undefined;
}
defineEventHandler(MessagePort.prototype, 'message');
defineEventHandler(MessagePort.prototype, 'messageerror');
ObjectDefineProperty(MessagePort.prototype, onInitSymbol, {
  __proto__: null,
  enumerable: true,
  writable: false,
  value: oninit
});
var MessagePortCloseEvent = /*#__PURE__*/function (_Event) {
  function MessagePortCloseEvent() {
    _classCallCheck(this, MessagePortCloseEvent);
    return _callSuper(this, MessagePortCloseEvent, ['close']);
  }
  _inherits(MessagePortCloseEvent, _Event);
  return _createClass(MessagePortCloseEvent);
}(Event); // This is called after the underlying `uv_async_t` has been closed.
function onclose() {
  this.dispatchEvent(new MessagePortCloseEvent());
}
ObjectDefineProperty(MessagePort.prototype, handleOnCloseSymbol, {
  __proto__: null,
  enumerable: false,
  writable: false,
  value: onclose
});
MessagePort.prototype.close = function close(cb) {
  if (typeof cb === 'function') this.once('close', cb);
  FunctionPrototypeCall(MessagePortPrototype.close, this);
};
ObjectDefineProperty(MessagePort.prototype, inspect.custom, {
  __proto__: null,
  enumerable: false,
  writable: false,
  value: function inspect() {
    // eslint-disable-line func-name-matching
    var ref;
    try {
      // This may throw when `this` does not refer to a native object,
      // e.g. when accessing the prototype directly.
      ref = FunctionPrototypeCall(MessagePortPrototype.hasRef, this);
    } catch {
      return this;
    }
    return ObjectAssign({
      __proto__: MessagePort.prototype
    }, ref === undefined ? {
      active: false
    } : {
      active: true,
      refed: ref
    }, this);
  }
});
function setupPortReferencing(port, eventEmitter, eventName) {
  // Keep track of whether there are any workerMessage listeners:
  // If there are some, ref() the channel so it keeps the event loop alive.
  // If there are none or all are removed, unref() the channel so the worker
  // can shutdown gracefully.
  port.unref();
  eventEmitter.on('newListener', function (name) {
    if (name === eventName) newListener(eventEmitter.listenerCount(name));
  });
  eventEmitter.on('removeListener', function (name) {
    if (name === eventName) removeListener(eventEmitter.listenerCount(name));
  });
  var origNewListener = eventEmitter[kNewListener];
  setOwnProperty(eventEmitter, kNewListener, function (size, type) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    if (type === eventName) newListener(size - 1);
    return ReflectApply(origNewListener, this, arguments);
  });
  var origRemoveListener = eventEmitter[kRemoveListener];
  setOwnProperty(eventEmitter, kRemoveListener, function (size, type) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }
    if (type === eventName) removeListener(size);
    return ReflectApply(origRemoveListener, this, arguments);
  });
  function newListener(size) {
    if (size === 0) {
      port.ref();
      FunctionPrototypeCall(MessagePortPrototype.start, port);
    }
  }
  function removeListener(size) {
    if (size === 0) {
      stopMessagePort(port);
      port.unref();
    }
  }
}
var ReadableWorkerStdio = /*#__PURE__*/function (_Readable) {
  function ReadableWorkerStdio(port, name) {
    var _this;
    _classCallCheck(this, ReadableWorkerStdio);
    _this = _callSuper(this, ReadableWorkerStdio);
    _this[kPort] = port;
    _this[kName] = name;
    _this[kIncrementsPortRef] = true;
    _this[kStartedReading] = false;
    _this.on('end', () => {
      if (_this[kStartedReading] && _this[kIncrementsPortRef]) {
        if (--_this[kPort][kWaitingStreams] === 0) _this[kPort].unref();
      }
    });
    return _this;
  }
  _inherits(ReadableWorkerStdio, _Readable);
  return _createClass(ReadableWorkerStdio, [{
    key: "_read",
    value: function _read() {
      if (!this[kStartedReading] && this[kIncrementsPortRef]) {
        this[kStartedReading] = true;
        if (this[kPort][kWaitingStreams]++ === 0) this[kPort].ref();
      }
      this[kPort].postMessage({
        type: messageTypes.STDIO_WANTS_MORE_DATA,
        stream: this[kName]
      });
    }
  }]);
}(Readable);
var WritableWorkerStdio = /*#__PURE__*/function (_Writable) {
  function WritableWorkerStdio(port, name) {
    var _this2;
    _classCallCheck(this, WritableWorkerStdio);
    _this2 = _callSuper(this, WritableWorkerStdio, [{
      decodeStrings: false
    }]);
    _this2[kPort] = port;
    _this2[kName] = name;
    _this2[kWritableCallback] = null;
    return _this2;
  }
  _inherits(WritableWorkerStdio, _Writable);
  return _createClass(WritableWorkerStdio, [{
    key: "_writev",
    value: function _writev(chunks, cb) {
      var toSend = new Array(chunks.length);

      // We avoid .map() because it's a hot path
      for (var _i = 0; _i < chunks.length; _i++) {
        var {
          chunk,
          encoding
        } = chunks[_i];
        toSend[_i] = {
          chunk,
          encoding
        };
      }
      this[kPort].postMessage({
        type: messageTypes.STDIO_PAYLOAD,
        stream: this[kName],
        chunks: toSend
      });
      if (process._exiting) {
        cb();
      } else {
        // Only one writev happens at any given time,
        // so we can safely overwrite the callback.
        this[kWritableCallback] = cb;
        if (this[kPort][kWaitingStreams]++ === 0) this[kPort].ref();
      }
    }
  }, {
    key: "_final",
    value: function _final(cb) {
      this[kPort].postMessage({
        type: messageTypes.STDIO_PAYLOAD,
        stream: this[kName],
        chunks: [{
          chunk: null,
          encoding: ''
        }]
      });
      cb();
    }
  }, {
    key: kStdioWantsMoreDataCallback,
    value: function () {
      var cb = this[kWritableCallback];
      if (cb) {
        this[kWritableCallback] = null;
        cb();
        if (--this[kPort][kWaitingStreams] === 0) this[kPort].unref();
      }
    }
  }]);
}(Writable);
function createWorkerStdio() {
  var port = getEnvMessagePort();
  port[kWaitingStreams] = 0;
  return {
    stdin: new ReadableWorkerStdio(port, 'stdin'),
    stdout: new WritableWorkerStdio(port, 'stdout'),
    stderr: new WritableWorkerStdio(port, 'stderr')
  };
}
function receiveMessageOnPort(port) {
  var message = receiveMessageOnPort_(port?.[kHandle] ?? port);
  if (message === noMessageSymbol) return undefined;
  return {
    message
  };
}
function onMessageEvent(type, data) {
  this.dispatchEvent(lazyMessageEvent(type, {
    data
  }));
}
function isBroadcastChannel(value) {
  return value?.[kType] === 'BroadcastChannel';
}
var BroadcastChannel = /*#__PURE__*/function (_EventTarget, _inspect$custom) {
  /**
   * @param {string} name
   */
  function BroadcastChannel(name) {
    var _this3;
    _classCallCheck(this, BroadcastChannel);
    if (arguments.length === 0) throw new ERR_MISSING_ARGS('name');
    _this3 = _callSuper(this, BroadcastChannel);
    _this3[kType] = 'BroadcastChannel';
    _this3[kName] = `${name}`;
    _this3[kHandle] = broadcastChannel(_this3[kName]);
    _this3[kOnMessage] = FunctionPrototypeBind(onMessageEvent, _this3, 'message');
    _this3[kOnMessageError] = FunctionPrototypeBind(onMessageEvent, _this3, 'messageerror');
    _this3[kHandle].on('message', _this3[kOnMessage]);
    _this3[kHandle].on('messageerror', _this3[kOnMessageError]);
    return _this3;
  }
  _inherits(BroadcastChannel, _EventTarget);
  return _createClass(BroadcastChannel, [{
    key: _inspect$custom,
    value: function (depth, options) {
      if (!isBroadcastChannel(this)) throw new ERR_INVALID_THIS('BroadcastChannel');
      if (depth < 0) return 'BroadcastChannel';
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `BroadcastChannel ${inspect({
        name: this[kName],
        active: this[kHandle] !== undefined
      }, opts)}`;
    }

    /**
     * @type {string}
     */
  }, {
    key: "name",
    get: function () {
      if (!isBroadcastChannel(this)) throw new ERR_INVALID_THIS('BroadcastChannel');
      return this[kName];
    }

    /**
     * @returns {void}
     */
  }, {
    key: "close",
    value: function close() {
      if (!isBroadcastChannel(this)) throw new ERR_INVALID_THIS('BroadcastChannel');
      if (this[kHandle] === undefined) return;
      this[kHandle].off('message', this[kOnMessage]);
      this[kHandle].off('messageerror', this[kOnMessageError]);
      this[kOnMessage] = undefined;
      this[kOnMessageError] = undefined;
      this[kHandle].close();
      this[kHandle] = undefined;
    }

    /**
     *
     * @param {any} message
     * @returns {void}
     */
  }, {
    key: "postMessage",
    value: function postMessage(message) {
      if (!isBroadcastChannel(this)) throw new ERR_INVALID_THIS('BroadcastChannel');
      if (arguments.length === 0) throw new ERR_MISSING_ARGS('message');
      if (this[kHandle] === undefined) throw new DOMException('BroadcastChannel is closed.', 'InvalidStateError');
      if (this[kHandle].postMessage(message) === undefined) throw new DOMException('Message could not be posted.');
    }

    // The ref() method is Node.js specific and not part of the standard
    // BroadcastChannel API definition. Typically we shouldn't extend Web
    // Platform APIs with Node.js specific methods but ref and unref
    // are a bit special.
    /**
     * @returns {BroadcastChannel}
     */
  }, {
    key: "ref",
    value: function ref() {
      if (!isBroadcastChannel(this)) throw new ERR_INVALID_THIS('BroadcastChannel');
      if (this[kHandle]) this[kHandle].ref();
      return this;
    }

    // The unref() method is Node.js specific and not part of the standard
    // BroadcastChannel API definition. Typically we shouldn't extend Web
    // Platform APIs with Node.js specific methods but ref and unref
    // are a bit special.
    /**
     * @returns {BroadcastChannel}
     */
  }, {
    key: "unref",
    value: function unref() {
      if (!isBroadcastChannel(this)) throw new ERR_INVALID_THIS('BroadcastChannel');
      if (this[kHandle]) this[kHandle].unref();
      return this;
    }
  }]);
}(EventTarget, inspect.custom);
ObjectDefineProperties(BroadcastChannel.prototype, {
  name: kEnumerableProperty,
  close: kEnumerableProperty,
  postMessage: kEnumerableProperty
});
defineEventHandler(BroadcastChannel.prototype, 'message');
defineEventHandler(BroadcastChannel.prototype, 'messageerror');
function markAsUncloneable(obj) {
  if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
    return;
  }
  obj[transfer_mode_private_symbol] &= ~kCloneable;
}
module.exports = {
  drainMessagePort,
  messageTypes,
  kPort,
  kIncrementsPortRef,
  kWaitingStreams,
  kStdioWantsMoreDataCallback,
  markAsUncloneable,
  moveMessagePortToContext,
  MessagePort,
  MessageChannel,
  receiveMessageOnPort,
  setupPortReferencing,
  ReadableWorkerStdio,
  WritableWorkerStdio,
  createWorkerStdio,
  BroadcastChannel
};

