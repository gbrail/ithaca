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
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  JSONParse,
  JSONStringify,
  SafeMap,
  SymbolDispose
} = primordials;
var {
  ERR_INSPECTOR_ALREADY_ACTIVATED,
  ERR_INSPECTOR_ALREADY_CONNECTED,
  ERR_INSPECTOR_CLOSED,
  ERR_INSPECTOR_COMMAND,
  ERR_INSPECTOR_NOT_AVAILABLE,
  ERR_INSPECTOR_NOT_CONNECTED,
  ERR_INSPECTOR_NOT_ACTIVE,
  ERR_INSPECTOR_NOT_WORKER
} = require('internal/errors').codes;
var {
  isLoopback
} = require('internal/net');
var {
  hasInspector
} = internalBinding('config');
if (!hasInspector) throw new ERR_INSPECTOR_NOT_AVAILABLE();
var EventEmitter = require('events');
var {
  queueMicrotask
} = require('internal/process/task_queues');
var {
  kEmptyObject
} = require('internal/util');
var {
  isUint32,
  validateFunction,
  validateInt32,
  validateObject,
  validateString
} = require('internal/validators');
var {
  isMainThread
} = require('worker_threads');
var {
  _debugEnd
} = internalBinding('process_methods');
var {
  put
} = require('internal/inspector/network_resources');
var {
  Connection,
  MainThreadConnection,
  open,
  url,
  isEnabled,
  waitForDebugger,
  console,
  emitProtocolEvent
} = internalBinding('inspector');
var _connection = /*#__PURE__*/new WeakMap();
var _nextId = /*#__PURE__*/new WeakMap();
var _messageCallbacks = /*#__PURE__*/new WeakMap();
var _Session_brand = /*#__PURE__*/new WeakSet();
var Session = /*#__PURE__*/function (_EventEmitter) {
  function Session() {
    var _this;
    _classCallCheck(this, Session);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Session, [].concat(args));
    _classPrivateMethodInitSpec(_this, _Session_brand);
    _classPrivateFieldInitSpec(_this, _connection, null);
    _classPrivateFieldInitSpec(_this, _nextId, 1);
    _classPrivateFieldInitSpec(_this, _messageCallbacks, new SafeMap());
    return _this;
  }
  _inherits(Session, _EventEmitter);
  return _createClass(Session, [{
    key: "connect",
    value:
    /**
     * Connects the session to the inspector back-end.
     * @returns {void}
     */
    function connect() {
      if (_classPrivateFieldGet(_connection, this)) throw new ERR_INSPECTOR_ALREADY_CONNECTED('The inspector session');
      _classPrivateFieldSet(_connection, this, new Connection(message => _assertClassBrand(_Session_brand, this, _onMessage).call(this, message)));
    }

    /**
     * Connects the session to the main thread
     * inspector back-end.
     * @returns {void}
     */
  }, {
    key: "connectToMainThread",
    value: function connectToMainThread() {
      if (isMainThread) throw new ERR_INSPECTOR_NOT_WORKER();
      if (_classPrivateFieldGet(_connection, this)) throw new ERR_INSPECTOR_ALREADY_CONNECTED('The inspector session');
      _classPrivateFieldSet(_connection, this, new MainThreadConnection(message => queueMicrotask(() => _assertClassBrand(_Session_brand, this, _onMessage).call(this, message))));
    }
  }, {
    key: "post",
    value:
    /**
     * Posts a message to the inspector back-end.
     * @param {string} method
     * @param {Record<unknown, unknown>} [params]
     * @param {Function} [callback]
     * @returns {void}
     */
    function post(method, params, callback) {
      var _this$nextId, _this$nextId2;
      validateString(method, 'method');
      if (!callback && typeof params === 'function') {
        callback = params;
        params = null;
      }
      if (params) {
        validateObject(params, 'params');
      }
      if (callback) {
        validateFunction(callback, 'callback');
      }
      if (!_classPrivateFieldGet(_connection, this)) {
        throw new ERR_INSPECTOR_NOT_CONNECTED();
      }
      var id = (_classPrivateFieldSet(_nextId, this, (_this$nextId = _classPrivateFieldGet(_nextId, this), _this$nextId2 = _this$nextId++, _this$nextId)), _this$nextId2);
      var message = {
        id,
        method
      };
      if (params) {
        message.params = params;
      }
      if (callback) {
        _classPrivateFieldGet(_messageCallbacks, this).set(id, callback);
      }
      _classPrivateFieldGet(_connection, this).dispatch(JSONStringify(message));
    }

    /**
     * Immediately closes the session, all pending
     * message callbacks will be called with an
     * error.
     * @returns {void}
     */
  }, {
    key: "disconnect",
    value: function disconnect() {
      if (!_classPrivateFieldGet(_connection, this)) return;
      _classPrivateFieldGet(_connection, this).disconnect();
      _classPrivateFieldSet(_connection, this, null);
      var remainingCallbacks = _classPrivateFieldGet(_messageCallbacks, this).values();
      for (var callback of remainingCallbacks) {
        process.nextTick(callback, new ERR_INSPECTOR_CLOSED());
      }
      _classPrivateFieldGet(_messageCallbacks, this).clear();
      _classPrivateFieldSet(_nextId, this, 1);
    }
  }]);
}(EventEmitter);
/**
 * Activates inspector on host and port.
 * @param {number} [port]
 * @param {string} [host]
 * @param {boolean} [wait]
 * @returns {void}
 */
function _onMessage(message) {
  var parsed = JSONParse(message);
  try {
    if (parsed.id) {
      var callback = _classPrivateFieldGet(_messageCallbacks, this).get(parsed.id);
      _classPrivateFieldGet(_messageCallbacks, this).delete(parsed.id);
      if (callback) {
        if (parsed.error) {
          return callback(new ERR_INSPECTOR_COMMAND(parsed.error.code, parsed.error.message));
        }
        callback(null, parsed.result);
      }
    } else {
      this.emit(parsed.method, parsed);
      this.emit('inspectorNotification', parsed);
    }
  } catch (error) {
    process.emitWarning(error);
  }
}
function inspectorOpen(port, host, wait) {
  if (isEnabled()) {
    throw new ERR_INSPECTOR_ALREADY_ACTIVATED();
  }
  // inspectorOpen() currently does not typecheck its arguments and adding
  // such checks would be a potentially breaking change. However, the native
  // open() function requires the port to fit into a 16-bit unsigned integer,
  // causing an integer overflow otherwise, so we at least need to prevent that.
  if (isUint32(port)) {
    validateInt32(port, 'port', 0, 65535);
  }
  if (host && !isLoopback(host)) {
    process.emitWarning('Binding the inspector to a public IP with an open port is insecure, ' + 'as it allows external hosts to connect to the inspector ' + 'and perform a remote code execution attack. ' + 'Documentation can be found at ' + 'https://nodejs.org/api/cli.html#--inspecthostport', 'SecurityWarning');
  }
  open(port, host);
  if (wait) waitForDebugger();
  return {
    __proto__: null,
    [SymbolDispose]() {
      _debugEnd();
    }
  };
}

/**
 * Blocks until a client (existing or connected later)
 * has sent the `Runtime.runIfWaitingForDebugger`
 * command.
 * @returns {void}
 */
function inspectorWaitForDebugger() {
  if (!waitForDebugger()) throw new ERR_INSPECTOR_NOT_ACTIVE();
}
function broadcastToFrontend(eventName) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  validateString(eventName, 'eventName');
  validateObject(params, 'params');
  emitProtocolEvent(eventName, params);
}
var Network = {
  requestWillBeSent: params => broadcastToFrontend('Network.requestWillBeSent', params),
  responseReceived: params => broadcastToFrontend('Network.responseReceived', params),
  loadingFinished: params => broadcastToFrontend('Network.loadingFinished', params),
  loadingFailed: params => broadcastToFrontend('Network.loadingFailed', params),
  dataSent: params => broadcastToFrontend('Network.dataSent', params),
  dataReceived: params => broadcastToFrontend('Network.dataReceived', params),
  webSocketCreated: params => broadcastToFrontend('Network.webSocketCreated', params),
  webSocketClosed: params => broadcastToFrontend('Network.webSocketClosed', params),
  webSocketHandshakeResponseReceived: params => broadcastToFrontend('Network.webSocketHandshakeResponseReceived', params)
};
var NetworkResources = {
  put
};
var DOMStorage = {
  domStorageItemAdded: params => broadcastToFrontend('DOMStorage.domStorageItemAdded', params),
  domStorageItemRemoved: params => broadcastToFrontend('DOMStorage.domStorageItemRemoved', params),
  domStorageItemUpdated: params => broadcastToFrontend('DOMStorage.domStorageItemUpdated', params),
  domStorageItemsCleared: params => broadcastToFrontend('DOMStorage.domStorageItemsCleared', params),
  // Pseudo-event: not part of the CDP DOMStorage domain.
  // Call DOMStorageAgent::registerStorage in inspector/dom_storage_agent.cc.
  registerStorage: params => broadcastToFrontend('DOMStorage.registerStorage', params)
};
module.exports = {
  open: inspectorOpen,
  close: _debugEnd,
  url,
  waitForDebugger: inspectorWaitForDebugger,
  console,
  Session,
  Network,
  NetworkResources,
  DOMStorage
};

