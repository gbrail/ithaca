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
  Symbol: _Symbol
} = primordials;
var {
  setImmediate
} = require('timers');
var assert = require('internal/assert');
var {
  Socket
} = require('net');
var {
  JSStream
} = internalBinding('js_stream');
var uv = internalBinding('uv');
var debug = require('internal/util/debuglog').debuglog('stream_socket', fn => {
  debug = fn;
});
var {
  owner_symbol
} = require('internal/async_hooks').symbols;
var {
  ERR_STREAM_WRAP
} = require('internal/errors').codes;
var {
  kBoundSession
} = require('internal/stream_base_commons');
var kCurrentWriteRequest = _Symbol('kCurrentWriteRequest');
var kCurrentShutdownRequest = _Symbol('kCurrentShutdownRequest');
var kPendingShutdownRequest = _Symbol('kPendingShutdownRequest');
var kPendingClose = _Symbol('kPendingClose');
function isClosing() {
  return this[owner_symbol].isClosing();
}
function onreadstart() {
  return this[owner_symbol].readStart();
}
function onreadstop() {
  return this[owner_symbol].readStop();
}
function onshutdown(req) {
  return this[owner_symbol].doShutdown(req);
}
function onwrite(req, bufs) {
  return this[owner_symbol].doWrite(req, bufs);
}

/* This class serves as a wrapper for when the C++ side of Node wants access
 * to a standard JS stream. For example, TLS or HTTP do not operate on network
 * resources conceptually, although that is the common case and what we are
 * optimizing for; in theory, they are completely composable and can work with
 * any stream resource they see.
 *
 * For the common case, i.e. a TLS socket wrapping around a net.Socket, we
 * can skip going through the JS layer and let TLS access the raw C++ handle
 * of a net.Socket. The flipside of this is that, to maintain composability,
 * we need a way to create "fake" net.Socket instances that call back into a
 * "real" JavaScript stream. JSStreamSocket is exactly this.
 */
var JSStreamSocket = /*#__PURE__*/function (_Socket) {
  function JSStreamSocket(stream) {
    var _this;
    _classCallCheck(this, JSStreamSocket);
    var handle = new JSStream();
    handle.close = cb => {
      debug('close');
      _this.doClose(cb);
    };
    // Inside of the following functions, `this` refers to the handle
    // and `this[owner_symbol]` refers to this JSStreamSocket instance.
    handle.isClosing = isClosing;
    handle.onreadstart = onreadstart;
    handle.onreadstop = onreadstop;
    handle.onshutdown = onshutdown;
    handle.onwrite = onwrite;
    stream.pause();
    stream.on('error', err => _this.emit('error', err));
    var ondata = chunk => {
      if (typeof chunk === 'string' || stream.readableObjectMode === true) {
        // Make sure that no further `data` events will happen.
        stream.pause();
        stream.removeListener('data', ondata);
        _this.emit('error', new ERR_STREAM_WRAP());
        return;
      }
      debug('data', chunk.length);
      if (_this._handle) _this._handle.readBuffer(chunk);
    };
    stream.on('data', ondata);
    stream.once('end', () => {
      debug('end');
      if (_this._handle) _this._handle.emitEOF();
    });
    // Some `Stream` don't pass `hasError` parameters when closed.
    stream.once('close', () => {
      // Errors emitted from `stream` have also been emitted to this instance
      // so that we don't pass errors to `destroy()` again.
      _this.destroy();
    });
    _this = _callSuper(this, JSStreamSocket, [{
      handle,
      manualStart: true
    }]);
    _this.stream = stream;
    _this[kCurrentWriteRequest] = null;
    _this[kCurrentShutdownRequest] = null;
    _this[kPendingShutdownRequest] = null;
    _this[kPendingClose] = false;
    _this.readable = stream.readable;
    _this.writable = stream.writable;

    // Start reading.
    _this.read(0);
    return _this;
  }

  // Allow legacy requires in the test suite to keep working:
  //   const { StreamWrap } = require('internal/js_stream_socket')
  _inherits(JSStreamSocket, _Socket);
  return _createClass(JSStreamSocket, [{
    key: "isClosing",
    value: function isClosing() {
      return !this.readable || !this.writable;
    }
  }, {
    key: "readStart",
    value: function readStart() {
      this.stream.resume();
      return 0;
    }
  }, {
    key: "readStop",
    value: function readStop() {
      this.stream.pause();
      return 0;
    }
  }, {
    key: "doShutdown",
    value: function doShutdown(req) {
      // TODO(addaleax): It might be nice if we could get into a state where
      // DoShutdown() is not called on streams while a write is still pending.
      //
      // Currently, the only part of the code base where that happens is the
      // TLS implementation, which calls both DoWrite() and DoShutdown() on the
      // underlying network stream inside of its own DoShutdown() method.
      // Working around that on the native side is not quite trivial (yet?),
      // so for now that is supported here.

      if (this[kCurrentWriteRequest] !== null) {
        this[kPendingShutdownRequest] = req;
        return 0;
      }
      assert(this[kCurrentWriteRequest] === null);
      assert(this[kCurrentShutdownRequest] === null);
      this[kCurrentShutdownRequest] = req;
      if (this[kPendingClose]) {
        // If doClose is pending, the stream & this._handle are gone. We can't do
        // anything. doClose will call finishShutdown with ECANCELED for us shortly.
        return 0;
      }
      var handle = this._handle;
      assert(handle !== null);
      process.nextTick(() => {
        // Ensure that write is dispatched asynchronously.
        this.stream.end(() => {
          this.finishShutdown(handle, 0);
        });
      });
      return 0;
    }

    // handle === this._handle except when called from doClose().
  }, {
    key: "finishShutdown",
    value: function finishShutdown(handle, errCode) {
      // The shutdown request might already have been cancelled.
      if (this[kCurrentShutdownRequest] === null) return;
      var req = this[kCurrentShutdownRequest];
      this[kCurrentShutdownRequest] = null;
      handle.finishShutdown(req, errCode);
    }
  }, {
    key: "doWrite",
    value: function doWrite(req, bufs) {
      assert(this[kCurrentWriteRequest] === null);
      assert(this[kCurrentShutdownRequest] === null);
      if (this[kPendingClose]) {
        // If doClose is pending, the stream & this._handle are gone. We can't do
        // anything. doClose will call finishWrite with ECANCELED for us shortly.
        this[kCurrentWriteRequest] = req; // Store req, for doClose to cancel
        return 0;
      } else if (this._handle === null) {
        // If this._handle is already null, there is nothing left to do with a
        // pending write request, so we discard it.
        return 0;
      }
      var handle = this._handle;
      var self = this;
      var pending = bufs.length;
      this.stream.cork();
      // Use `var` over `let` for performance optimization.
      // eslint-disable-next-line no-var
      for (var i = 0; i < bufs.length; ++i) this.stream.write(bufs[i], done);
      this.stream.uncork();

      // Only set the request here, because the `write()` calls could throw.
      this[kCurrentWriteRequest] = req;
      function done(err) {
        if (!err && --pending !== 0) return;

        // Ensure that this is called once in case of error
        pending = 0;
        var errCode = 0;
        if (err) {
          errCode = uv[`UV_${err.code}`] || uv.UV_EPIPE;
        }

        // Ensure that write was dispatched
        setImmediate(() => {
          self.finishWrite(handle, errCode);
        });
      }
      return 0;
    }

    // handle === this._handle except when called from doClose().
  }, {
    key: "finishWrite",
    value: function finishWrite(handle, errCode) {
      // The write request might already have been cancelled.
      if (this[kCurrentWriteRequest] === null) return;
      var req = this[kCurrentWriteRequest];
      this[kCurrentWriteRequest] = null;
      handle.finishWrite(req, errCode);
      if (this[kPendingShutdownRequest]) {
        var _req = this[kPendingShutdownRequest];
        this[kPendingShutdownRequest] = null;
        this.doShutdown(_req);
      }
    }
  }, {
    key: "doClose",
    value: function doClose(cb) {
      this[kPendingClose] = true;
      var handle = this._handle;

      // When sockets of the "net" module destroyed, they will call
      // `this._handle.close()` which will also emit EOF if not emitted before.
      // This feature makes sockets on the other side emit "end" and "close"
      // even though we haven't called `end()`. As `stream` are likely to be
      // instances of `net.Socket`, calling `stream.destroy()` manually will
      // avoid issues that don't properly close wrapped connections.
      this.stream.destroy();
      setImmediate(() => {
        // Should be already set by net.js
        assert(this._handle === null);
        this.finishWrite(handle, uv.UV_ECANCELED);
        this.finishShutdown(handle, uv.UV_ECANCELED);
        this[kPendingClose] = false;
        cb();
      });
    }
  }, {
    key: kBoundSession,
    get: function () {
      return this.stream[kBoundSession];
    }
  }, {
    key: kBoundSession,
    set: function (session) {
      this.stream[kBoundSession] = session;
    }
  }], [{
    key: "StreamWrap",
    get: function () {
      return JSStreamSocket;
    }
  }]);
}(Socket);
module.exports = JSStreamSocket;

