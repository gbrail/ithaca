'use strict';

function _usingCtx2() { var r = "function" == typeof SuppressedError ? SuppressedError : function (r, e) { var n = Error(); return n.name = "SuppressedError", n.error = r, n.suppressed = e, n; }, e = {}, n = []; function using(r, e) { if (null != e) { if (Object(e) !== e) throw new TypeError("using declarations can only be used with objects, functions, null, or undefined."); if (r) var o = e[Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]; if (void 0 === o && (o = e[Symbol.dispose || Symbol.for("Symbol.dispose")], r)) var t = o; if ("function" != typeof o) throw new TypeError("Object is not disposable."); t && (o = function () { try { t.call(e); } catch (r) { return Promise.reject(r); } }), n.push({ v: e, d: o, a: r }); } else r && n.push({ d: e, a: r }); return e; } return { e: e, u: using.bind(null, !1), a: using.bind(null, !0), d: function () { var o, t = this.e, s = 0; function next() { for (; o = n.pop();) try { if (!o.a && 1 === s) return s = 0, n.push(o), Promise.resolve().then(next); if (o.d) { var r = o.d.call(o.v); if (o.a) return s |= 2, Promise.resolve(r).then(next, err); } else s |= 1; } catch (r) { return err(r); } if (1 === s) return t !== e ? Promise.reject(t) : Promise.resolve(); if (t !== e) throw t; } function err(n) { return t = t !== e ? new r(n, t) : n, next(); } return next(); } }; }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypeAt,
  ArrayPrototypeIndexOf,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeSlice,
  ArrayPrototypeSplice,
  ObjectDefineProperty,
  ObjectGetPrototypeOf,
  ObjectSetPrototypeOf,
  PromisePrototypeThen,
  PromiseReject,
  ReflectApply,
  SafeFinalizationRegistry,
  SafeMap,
  SymbolDispose,
  SymbolHasInstance
} = primordials;
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = require('internal/errors');
var {
  validateFunction
} = require('internal/validators');
var {
  triggerUncaughtException
} = internalBinding('errors');
var dc_binding = internalBinding('diagnostics_channel');
var {
  subscribers: subscriberCounts
} = dc_binding;
var {
  WeakReference
} = require('internal/util');
var {
  isPromise
} = require('internal/util/types');

// Can't delete when weakref count reaches 0 as it could increment again.
// Only GC can be used as a valid time to clean up the channels map.
var _finalizers = /*#__PURE__*/new WeakMap();
var WeakRefMap = /*#__PURE__*/function (_SafeMap) {
  function WeakRefMap() {
    var _this;
    _classCallCheck(this, WeakRefMap);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, WeakRefMap, [].concat(args));
    _classPrivateFieldInitSpec(_this, _finalizers, new SafeFinalizationRegistry(key => {
      // Check that the key doesn't have any value before deleting, as the WeakRef for the key
      // may have been replaced since finalization callbacks aren't synchronous with GC.
      if (!_this.has(key)) _this.delete(key);
    }));
    return _this;
  }
  _inherits(WeakRefMap, _SafeMap);
  return _createClass(WeakRefMap, [{
    key: "set",
    value: function set(key, value) {
      _classPrivateFieldGet(_finalizers, this).register(value, key);
      return _superPropGet(WeakRefMap, "set", this, 3)([key, new WeakReference(value)]);
    }
  }, {
    key: "get",
    value: function get(key) {
      return _superPropGet(WeakRefMap, "get", this, 3)([key])?.get();
    }
  }, {
    key: "has",
    value: function has(key) {
      return !!this.get(key);
    }
  }, {
    key: "incRef",
    value: function incRef(key) {
      return _superPropGet(WeakRefMap, "get", this, 3)([key])?.incRef();
    }
  }, {
    key: "decRef",
    value: function decRef(key) {
      return _superPropGet(WeakRefMap, "get", this, 3)([key])?.decRef();
    }
  }]);
}(SafeMap);
function markActive(channel) {
  // eslint-disable-next-line no-use-before-define
  ObjectSetPrototypeOf(channel, ActiveChannel.prototype);
  channel._subscribers = [];
  channel._stores = new SafeMap();
}
function maybeMarkInactive(channel) {
  // When there are no more active subscribers or bound, restore to fast prototype.
  if (!channel._subscribers.length && !channel._stores.size) {
    // eslint-disable-next-line no-use-before-define
    ObjectSetPrototypeOf(channel, Channel.prototype);
    channel._subscribers = undefined;
    channel._stores = undefined;
  }
}
var _stack = /*#__PURE__*/new WeakMap();
var RunStoresScope = /*#__PURE__*/function () {
  function RunStoresScope(activeChannel, data) {
    try {
      var _usingCtx = _usingCtx2();
      _classCallCheck(this, RunStoresScope);
      _classPrivateFieldInitSpec(this, _stack, void 0);
      // eslint-disable-next-line no-restricted-globals
      var _stack2 = _usingCtx.u(new DisposableStack());

      // Enter stores using withScope
      if (activeChannel._stores) {
        var _loop = function () {
          var store = entry[0];
          var transform = entry[1];
          var newContext = data;
          if (transform) {
            try {
              newContext = transform(data);
            } catch (err) {
              process.nextTick(() => {
                triggerUncaughtException(err, false);
              });
              return 1; // continue
            }
          }
          _stack2.use(store.withScope(newContext));
        };
        for (var entry of activeChannel._stores.entries()) {
          if (_loop()) continue;
        }
      }

      // Publish data
      activeChannel.publish(data);

      // Transfer ownership of the stack
      _classPrivateFieldSet(_stack, this, _stack2.move());
    } catch (_) {
      _usingCtx.e = _;
    } finally {
      _usingCtx.d();
    }
  }
  return _createClass(RunStoresScope, [{
    key: SymbolDispose,
    value: function () {
      _classPrivateFieldGet(_stack, this)[SymbolDispose]();
    }
  }]);
}(); // TODO(qard): should there be a C++ channel interface?
var ActiveChannel = /*#__PURE__*/function () {
  function ActiveChannel() {
    _classCallCheck(this, ActiveChannel);
  }
  return _createClass(ActiveChannel, [{
    key: "subscribe",
    value: function subscribe(subscription) {
      validateFunction(subscription, 'subscription');
      this._subscribers = ArrayPrototypeSlice(this._subscribers);
      ArrayPrototypePush(this._subscribers, subscription);
      channels.incRef(this.name);
      if (this._index !== undefined) subscriberCounts[this._index]++;
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(subscription) {
      var index = ArrayPrototypeIndexOf(this._subscribers, subscription);
      if (index === -1) return false;
      var before = ArrayPrototypeSlice(this._subscribers, 0, index);
      var after = ArrayPrototypeSlice(this._subscribers, index + 1);
      this._subscribers = before;
      ArrayPrototypePushApply(this._subscribers, after);
      channels.decRef(this.name);
      if (this._index !== undefined) subscriberCounts[this._index]--;
      maybeMarkInactive(this);
      return true;
    }
  }, {
    key: "bindStore",
    value: function bindStore(store, transform) {
      var replacing = this._stores.has(store);
      if (!replacing) {
        channels.incRef(this.name);
        if (this._index !== undefined) subscriberCounts[this._index]++;
      }
      this._stores.set(store, transform);
    }
  }, {
    key: "unbindStore",
    value: function unbindStore(store) {
      if (!this._stores.has(store)) {
        return false;
      }
      this._stores.delete(store);
      channels.decRef(this.name);
      if (this._index !== undefined) subscriberCounts[this._index]--;
      maybeMarkInactive(this);
      return true;
    }
  }, {
    key: "hasSubscribers",
    get: function () {
      return true;
    }
  }, {
    key: "publish",
    value: function publish(data) {
      var _this2 = this;
      var subscribers = this._subscribers;
      var _loop2 = function () {
        try {
          var onMessage = subscribers[i];
          onMessage(data, _this2.name);
        } catch (err) {
          process.nextTick(() => {
            triggerUncaughtException(err, false);
          });
        }
      };
      for (var i = 0; i < (subscribers?.length || 0); i++) {
        _loop2();
      }
    }
  }, {
    key: "withStoreScope",
    value: function withStoreScope(data) {
      return new RunStoresScope(this, data);
    }
  }, {
    key: "runStores",
    value: function runStores(data, fn, thisArg) {
      try {
        var _usingCtx3 = _usingCtx2();
        // eslint-disable-next-line no-unused-vars
        var _scope = _usingCtx3.u(this.withStoreScope(data));
        for (var _len2 = arguments.length, args = new Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
          args[_key2 - 3] = arguments[_key2];
        }
        return ReflectApply(fn, thisArg, args);
      } catch (_) {
        _usingCtx3.e = _;
      } finally {
        _usingCtx3.d();
      }
    }
  }]);
}();
var Channel = /*#__PURE__*/function () {
  function Channel(name) {
    _classCallCheck(this, Channel);
    this._subscribers = undefined;
    this._stores = undefined;
    this.name = name;
    if (typeof name === 'string') {
      this._index = dc_binding.getOrCreateChannelIndex(name);
    }
    channels.set(name, this);
  }
  return _createClass(Channel, [{
    key: "subscribe",
    value: function subscribe(subscription) {
      markActive(this);
      this.subscribe(subscription);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe() {
      return false;
    }
  }, {
    key: "bindStore",
    value: function bindStore(store, transform) {
      markActive(this);
      this.bindStore(store, transform);
    }
  }, {
    key: "unbindStore",
    value: function unbindStore() {
      return false;
    }
  }, {
    key: "hasSubscribers",
    get: function () {
      return false;
    }
  }, {
    key: "publish",
    value: function publish() {}
  }, {
    key: "runStores",
    value: function runStores(data, fn, thisArg) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
        args[_key3 - 3] = arguments[_key3];
      }
      return ReflectApply(fn, thisArg, args);
    }
  }, {
    key: "withStoreScope",
    value: function withStoreScope() {
      // Return no-op disposable for inactive channels
      return {
        [SymbolDispose]() {}
      };
    }
  }], [{
    key: SymbolHasInstance,
    value: function (instance) {
      var prototype = ObjectGetPrototypeOf(instance);
      return prototype === Channel.prototype || prototype === ActiveChannel.prototype;
    }
  }]);
}();
var channels = new WeakRefMap();
function channel(name) {
  var channel = channels.get(name);
  if (channel) return channel;
  if (typeof name !== 'string' && typeof name !== 'symbol') {
    throw new ERR_INVALID_ARG_TYPE('channel', ['string', 'symbol'], name);
  }
  return new Channel(name);
}
function subscribe(name, subscription) {
  return channel(name).subscribe(subscription);
}
function unsubscribe(name, subscription) {
  return channel(name).unsubscribe(subscription);
}
function hasSubscribers(name) {
  var channel = channels.get(name);
  if (!channel) return false;
  return channel.hasSubscribers;
}
var boundedEvents = ['start', 'end'];
function assertChannel(value, name) {
  if (!(value instanceof Channel)) {
    throw new ERR_INVALID_ARG_TYPE(name, ['Channel'], value);
  }
}
function emitNonThenableWarning(fn) {
  process.emitWarning(`tracePromise was called with the function '${fn.name || '<anonymous>'}', ` + 'which returned a non-thenable.');
}
function channelFromMap(nameOrChannels, name, className) {
  if (typeof nameOrChannels === 'string') {
    return channel(`tracing:${nameOrChannels}:${name}`);
  }
  if (typeof nameOrChannels === 'object' && nameOrChannels !== null) {
    var _channel = nameOrChannels[name];
    assertChannel(_channel, `nameOrChannels.${name}`);
    return _channel;
  }
  throw new ERR_INVALID_ARG_TYPE('nameOrChannels', ['string', 'object', className], nameOrChannels);
}
var _context = /*#__PURE__*/new WeakMap();
var _end = /*#__PURE__*/new WeakMap();
var _scope2 = /*#__PURE__*/new WeakMap();
var BoundedChannelScope = /*#__PURE__*/function () {
  function BoundedChannelScope(boundedChannel, context) {
    _classCallCheck(this, BoundedChannelScope);
    _classPrivateFieldInitSpec(this, _context, void 0);
    _classPrivateFieldInitSpec(this, _end, void 0);
    _classPrivateFieldInitSpec(this, _scope2, void 0);
    // Only proceed if there are subscribers
    if (!boundedChannel.hasSubscribers) {
      return;
    }
    var {
      start,
      end
    } = boundedChannel;
    _classPrivateFieldSet(_context, this, context);
    _classPrivateFieldSet(_end, this, end);

    // Use RunStoresScope for the start channel
    _classPrivateFieldSet(_scope2, this, new RunStoresScope(start, context));
  }
  return _createClass(BoundedChannelScope, [{
    key: SymbolDispose,
    value: function () {
      if (!_classPrivateFieldGet(_scope2, this)) {
        return;
      }

      // Publish end event
      _classPrivateFieldGet(_end, this).publish(_classPrivateFieldGet(_context, this));

      // Dispose the start scope to restore stores
      _classPrivateFieldGet(_scope2, this)[SymbolDispose]();
      _classPrivateFieldSet(_scope2, this, undefined);
    }
  }]);
}();
var BoundedChannel = /*#__PURE__*/function () {
  function BoundedChannel(nameOrChannels) {
    _classCallCheck(this, BoundedChannel);
    for (var i = 0; i < boundedEvents.length; ++i) {
      var eventName = boundedEvents[i];
      ObjectDefineProperty(this, eventName, {
        __proto__: null,
        value: channelFromMap(nameOrChannels, eventName, 'BoundedChannel')
      });
    }
  }
  return _createClass(BoundedChannel, [{
    key: "hasSubscribers",
    get: function () {
      return this.start?.hasSubscribers || this.end?.hasSubscribers;
    }
  }, {
    key: "subscribe",
    value: function subscribe(handlers) {
      for (var i = 0; i < boundedEvents.length; ++i) {
        var name = boundedEvents[i];
        if (!handlers[name]) continue;
        this[name]?.subscribe(handlers[name]);
      }
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(handlers) {
      var done = true;
      for (var i = 0; i < boundedEvents.length; ++i) {
        var name = boundedEvents[i];
        if (!handlers[name]) continue;
        if (!this[name]?.unsubscribe(handlers[name])) {
          done = false;
        }
      }
      return done;
    }
  }, {
    key: "withScope",
    value: function withScope() {
      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return new BoundedChannelScope(this, context);
    }
  }, {
    key: "run",
    value: function run(context, fn, thisArg) {
      try {
        var _usingCtx4 = _usingCtx2();
        context ??= {};
        // eslint-disable-next-line no-unused-vars
        var _scope3 = _usingCtx4.u(this.withScope(context));
        for (var _len4 = arguments.length, args = new Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) {
          args[_key4 - 3] = arguments[_key4];
        }
        return ReflectApply(fn, thisArg, args);
      } catch (_) {
        _usingCtx4.e = _;
      } finally {
        _usingCtx4.d();
      }
    }
  }]);
}();
function boundedChannel(nameOrChannels) {
  return new BoundedChannel(nameOrChannels);
}
var _callWindow = /*#__PURE__*/new WeakMap();
var _continuationWindow = /*#__PURE__*/new WeakMap();
var TracingChannel = /*#__PURE__*/function () {
  function TracingChannel(nameOrChannels) {
    _classCallCheck(this, TracingChannel);
    _classPrivateFieldInitSpec(this, _callWindow, void 0);
    _classPrivateFieldInitSpec(this, _continuationWindow, void 0);
    // Create a BoundedChannel for start/end (call window)
    if (typeof nameOrChannels === 'string') {
      _classPrivateFieldSet(_callWindow, this, new BoundedChannel(nameOrChannels));
      _classPrivateFieldSet(_continuationWindow, this, new BoundedChannel({
        start: channel(`tracing:${nameOrChannels}:asyncStart`),
        end: channel(`tracing:${nameOrChannels}:asyncEnd`)
      }));
    } else if (typeof nameOrChannels === 'object') {
      _classPrivateFieldSet(_callWindow, this, new BoundedChannel({
        start: nameOrChannels.start,
        end: nameOrChannels.end
      }));
      _classPrivateFieldSet(_continuationWindow, this, new BoundedChannel({
        start: nameOrChannels.asyncStart,
        end: nameOrChannels.asyncEnd
      }));
    }

    // Create individual channel for error
    ObjectDefineProperty(this, 'error', {
      __proto__: null,
      value: channelFromMap(nameOrChannels, 'error', 'TracingChannel')
    });
  }
  return _createClass(TracingChannel, [{
    key: "start",
    get: function () {
      return _classPrivateFieldGet(_callWindow, this).start;
    }
  }, {
    key: "end",
    get: function () {
      return _classPrivateFieldGet(_callWindow, this).end;
    }
  }, {
    key: "asyncStart",
    get: function () {
      return _classPrivateFieldGet(_continuationWindow, this).start;
    }
  }, {
    key: "asyncEnd",
    get: function () {
      return _classPrivateFieldGet(_continuationWindow, this).end;
    }
  }, {
    key: "hasSubscribers",
    get: function () {
      return _classPrivateFieldGet(_callWindow, this).hasSubscribers || _classPrivateFieldGet(_continuationWindow, this).hasSubscribers || this.error?.hasSubscribers;
    }
  }, {
    key: "subscribe",
    value: function subscribe(handlers) {
      // Subscribe to call window (start/end)
      if (handlers.start || handlers.end) {
        _classPrivateFieldGet(_callWindow, this).subscribe({
          start: handlers.start,
          end: handlers.end
        });
      }

      // Subscribe to continuation window (asyncStart/asyncEnd)
      if (handlers.asyncStart || handlers.asyncEnd) {
        _classPrivateFieldGet(_continuationWindow, this).subscribe({
          start: handlers.asyncStart,
          end: handlers.asyncEnd
        });
      }

      // Subscribe to error channel
      if (handlers.error) {
        this.error.subscribe(handlers.error);
      }
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(handlers) {
      var done = true;

      // Unsubscribe from call window
      if (handlers.start || handlers.end) {
        if (!_classPrivateFieldGet(_callWindow, this).unsubscribe({
          start: handlers.start,
          end: handlers.end
        })) {
          done = false;
        }
      }

      // Unsubscribe from continuation window
      if (handlers.asyncStart || handlers.asyncEnd) {
        if (!_classPrivateFieldGet(_continuationWindow, this).unsubscribe({
          start: handlers.asyncStart,
          end: handlers.asyncEnd
        })) {
          done = false;
        }
      }

      // Unsubscribe from error channel
      if (handlers.error) {
        if (!this.error.unsubscribe(handlers.error)) {
          done = false;
        }
      }
      return done;
    }
  }, {
    key: "traceSync",
    value: function traceSync(fn) {
      try {
        var _usingCtx5 = _usingCtx2();
        var _context2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var _thisArg = arguments.length > 2 ? arguments[2] : undefined;
        for (var _len5 = arguments.length, args = new Array(_len5 > 3 ? _len5 - 3 : 0), _key5 = 3; _key5 < _len5; _key5++) {
          args[_key5 - 3] = arguments[_key5];
        }
        if (!this.hasSubscribers) {
          return ReflectApply(fn, _thisArg, args);
        }
        var {
          error: _error
        } = this;

        // eslint-disable-next-line no-unused-vars
        var _scope4 = _usingCtx5.u(_classPrivateFieldGet(_callWindow, this).withScope(_context2));
        try {
          var result = ReflectApply(fn, _thisArg, args);
          _context2.result = result;
          return result;
        } catch (err) {
          _context2.error = err;
          _error.publish(_context2);
          throw err;
        }
      } catch (_) {
        _usingCtx5.e = _;
      } finally {
        _usingCtx5.d();
      }
    }
  }, {
    key: "tracePromise",
    value: function tracePromise(fn) {
      try {
        var _usingCtx6 = _usingCtx2();
        var _context3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var _thisArg2 = arguments.length > 2 ? arguments[2] : undefined;
        for (var _len6 = arguments.length, args = new Array(_len6 > 3 ? _len6 - 3 : 0), _key6 = 3; _key6 < _len6; _key6++) {
          args[_key6 - 3] = arguments[_key6];
        }
        if (!this.hasSubscribers) {
          var result = ReflectApply(fn, _thisArg2, args);
          if (typeof result?.then !== 'function') {
            emitNonThenableWarning(fn);
          }
          return result;
        }
        var {
          error: _error2
        } = this;
        var _continuationWindow2 = _classPrivateFieldGet(_continuationWindow, this);
        function reject(err) {
          try {
            var _usingCtx7 = _usingCtx2();
            _context3.error = err;
            _error2.publish(_context3);
            // Use continuation window for asyncStart/asyncEnd
            // eslint-disable-next-line no-unused-vars
            var _scope5 = _usingCtx7.u(_continuationWindow2.withScope(_context3));
            // TODO: Is there a way to have asyncEnd _after_ the continuation?
            return PromiseReject(err);
          } catch (_) {
            _usingCtx7.e = _;
          } finally {
            _usingCtx7.d();
          }
        }
        function resolve(result) {
          try {
            var _usingCtx8 = _usingCtx2();
            _context3.result = result;
            // Use continuation window for asyncStart/asyncEnd
            // eslint-disable-next-line no-unused-vars
            var _scope6 = _usingCtx8.u(_continuationWindow2.withScope(_context3));
            // TODO: Is there a way to have asyncEnd _after_ the continuation?
            return result;
          } catch (_) {
            _usingCtx8.e = _;
          } finally {
            _usingCtx8.d();
          }
        }

        // eslint-disable-next-line no-unused-vars
        var _scope7 = _usingCtx6.u(_classPrivateFieldGet(_callWindow, this).withScope(_context3));
        try {
          var _result = ReflectApply(fn, _thisArg2, args);
          // If the return value is not a thenable, return it directly with a warning.
          // Do not publish to asyncStart/asyncEnd.
          if (typeof _result?.then !== 'function') {
            emitNonThenableWarning(fn);
            _context3.result = _result;
            return _result;
          }
          // For native Promises use PromisePrototypeThen to avoid user overrides.
          if (isPromise(_result)) {
            return PromisePrototypeThen(_result, resolve, reject);
          }
          // For custom thenables, call .then() directly to preserve the thenable type.
          return _result.then(resolve, reject);
        } catch (err) {
          _context3.error = err;
          _error2.publish(_context3);
          throw err;
        }
      } catch (_) {
        _usingCtx6.e = _;
      } finally {
        _usingCtx6.d();
      }
    }
  }, {
    key: "traceCallback",
    value: function traceCallback(fn) {
      try {
        var _usingCtx9 = _usingCtx2();
        var _position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
        var _context4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var _thisArg3 = arguments.length > 3 ? arguments[3] : undefined;
        for (var _len7 = arguments.length, args = new Array(_len7 > 4 ? _len7 - 4 : 0), _key7 = 4; _key7 < _len7; _key7++) {
          args[_key7 - 4] = arguments[_key7];
        }
        if (!this.hasSubscribers) {
          return ReflectApply(fn, _thisArg3, args);
        }
        var {
          error: _error3
        } = this;
        var _continuationWindow3 = _classPrivateFieldGet(_continuationWindow, this);
        function wrappedCallback(err, res) {
          try {
            var _usingCtx0 = _usingCtx2();
            if (err) {
              _context4.error = err;
              _error3.publish(_context4);
            } else {
              _context4.result = res;
            }

            // Use continuation window for asyncStart/asyncEnd around callback
            // eslint-disable-next-line no-unused-vars
            var _scope8 = _usingCtx0.u(_continuationWindow3.withScope(_context4));
            return ReflectApply(_callback, this, arguments);
          } catch (_) {
            _usingCtx0.e = _;
          } finally {
            _usingCtx0.d();
          }
        }
        var _callback = ArrayPrototypeAt(args, _position);
        validateFunction(_callback, 'callback');
        ArrayPrototypeSplice(args, _position, 1, wrappedCallback);

        // eslint-disable-next-line no-unused-vars
        var _scope9 = _usingCtx9.u(_classPrivateFieldGet(_callWindow, this).withScope(_context4));
        try {
          return ReflectApply(fn, _thisArg3, args);
        } catch (err) {
          _context4.error = err;
          _error3.publish(_context4);
          throw err;
        }
      } catch (_) {
        _usingCtx9.e = _;
      } finally {
        _usingCtx9.d();
      }
    }
  }]);
}();
function tracingChannel(nameOrChannels) {
  return new TracingChannel(nameOrChannels);
}
dc_binding.linkNativeChannel(name => channel(name));
module.exports = {
  channel,
  hasSubscribers,
  subscribe,
  tracingChannel,
  unsubscribe,
  boundedChannel,
  Channel,
  BoundedChannel
};

