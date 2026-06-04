'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypePush,
  FunctionPrototypeCall,
  MathMin
} = primordials;
var {
  constants: {
    kReadFileBufferLength,
    kReadFileUnknownBufferLength
  }
} = require('internal/fs/utils');
var {
  Buffer
} = require('buffer');
var {
  FSReqCallback,
  close: _close,
  read: _read
} = internalBinding('fs');
var {
  AbortError,
  aggregateTwoErrors
} = require('internal/errors');
function readFileAfterRead(err, bytesRead) {
  var context = this.context;
  if (err) return context.close(err);
  context.pos += bytesRead;
  if (context.pos === context.size || bytesRead === 0) {
    context.close();
  } else {
    if (context.size === 0) {
      // Unknown size, just read until we don't get bytes.
      var buffer = bytesRead === kReadFileUnknownBufferLength ? context.buffer : context.buffer.slice(0, bytesRead);
      ArrayPrototypePush(context.buffers, buffer);
    }
    context.read();
  }
}
function readFileAfterClose(err) {
  var context = this.context;
  var callback = context.callback;
  var buffer = null;
  if (context.err || err) return callback(aggregateTwoErrors(err, context.err));
  try {
    if (context.size === 0) buffer = Buffer.concat(context.buffers, context.pos);else if (context.pos < context.size) buffer = context.buffer.slice(0, context.pos);else buffer = context.buffer;
    if (context.encoding) buffer = buffer.toString(context.encoding);
  } catch (err) {
    return callback(err);
  }
  callback(null, buffer);
}
var ReadFileContext = /*#__PURE__*/function () {
  function ReadFileContext(callback, encoding) {
    _classCallCheck(this, ReadFileContext);
    this.fd = undefined;
    this.isUserFd = undefined;
    this.size = 0;
    this.callback = callback;
    this.buffers = null;
    this.buffer = null;
    this.pos = 0;
    this.encoding = encoding;
    this.err = null;
    this.signal = undefined;
  }
  return _createClass(ReadFileContext, [{
    key: "read",
    value: function read() {
      var buffer;
      var offset;
      var length;
      if (this.signal?.aborted) {
        return this.close(new AbortError(undefined, {
          cause: this.signal.reason
        }));
      }
      if (this.size === 0) {
        buffer = Buffer.allocUnsafeSlow(kReadFileUnknownBufferLength);
        offset = 0;
        length = kReadFileUnknownBufferLength;
        this.buffer = buffer;
      } else {
        buffer = this.buffer;
        offset = this.pos;
        length = MathMin(kReadFileBufferLength, this.size - this.pos);
      }
      var req = new FSReqCallback();
      req.oncomplete = readFileAfterRead;
      req.context = this;
      _read(this.fd, buffer, offset, length, -1, req);
    }
  }, {
    key: "close",
    value: function close(err) {
      if (this.isUserFd) {
        process.nextTick(function tick(context) {
          FunctionPrototypeCall(readFileAfterClose, {
            context
          }, null);
        }, this);
        return;
      }
      var req = new FSReqCallback();
      req.oncomplete = readFileAfterClose;
      req.context = this;
      this.err = err;
      _close(this.fd, req);
    }
  }]);
}();
module.exports = ReadFileContext;

