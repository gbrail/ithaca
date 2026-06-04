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
  ArrayPrototypeForEach,
  ArrayPrototypePush,
  ErrorCaptureStackTrace,
  FunctionPrototypeBind,
  JSONParse,
  JSONStringify,
  ObjectKeys,
  ObjectValues,
  Promise
} = primordials;
var Buffer = require('buffer').Buffer;
var crypto = require('crypto');
var {
  ERR_DEBUGGER_ERROR
} = require('internal/errors').codes;
var {
  EventEmitter,
  once
} = require('events');
var http = require('http');
var {
  URL
} = require('internal/url');
var {
  FastBuffer
} = require('internal/buffer');
var debuglog = require('internal/util/debuglog').debuglog('inspect');
var kOpCodeText = 0x1;
var kOpCodeClose = 0x8;
var kFinalBit = 0x80;
var kReserved1Bit = 0x40;
var kReserved2Bit = 0x20;
var kReserved3Bit = 0x10;
var kOpCodeMask = 0xF;
var kMaskBit = 0x80;
var kPayloadLengthMask = 0x7F;
var kMaxSingleBytePayloadLength = 125;
var kMaxTwoBytePayloadLength = 0xFFFF;
var kTwoBytePayloadLengthField = 126;
var kEightBytePayloadLengthField = 127;
var kMaskingKeyWidthInBytes = 4;

// This guid is defined in the Websocket Protocol RFC
// https://tools.ietf.org/html/rfc6455#section-1.3
var WEBSOCKET_HANDSHAKE_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
function unpackError(_ref) {
  var {
    code,
    message
  } = _ref;
  var err = new ERR_DEBUGGER_ERROR(`${message}`);
  err.code = code;
  ErrorCaptureStackTrace(err, unpackError);
  return err;
}
function validateHandshake(requestKey, responseKey) {
  var expectedResponseKeyBase = requestKey + WEBSOCKET_HANDSHAKE_GUID;
  var shasum = crypto.createHash('sha1');
  shasum.update(expectedResponseKeyBase);
  var shabuf = shasum.digest();
  if (shabuf.toString('base64') !== responseKey) {
    throw new ERR_DEBUGGER_ERROR(`WebSocket secret mismatch: ${requestKey} did not match ${responseKey}`);
  }
}
function encodeFrameHybi17(payload) {
  var dataLength = payload.length;
  var singleByteLength;
  var additionalLength;
  if (dataLength > kMaxTwoBytePayloadLength) {
    singleByteLength = kEightBytePayloadLengthField;
    additionalLength = Buffer.alloc(8);
    var remaining = dataLength;
    for (var i = 0; i < 8; ++i) {
      additionalLength[7 - i] = remaining & 0xFF;
      remaining >>= 8;
    }
  } else if (dataLength > kMaxSingleBytePayloadLength) {
    singleByteLength = kTwoBytePayloadLengthField;
    additionalLength = Buffer.alloc(2);
    additionalLength[0] = (dataLength & 0xFF00) >> 8;
    additionalLength[1] = dataLength & 0xFF;
  } else {
    additionalLength = new FastBuffer();
    singleByteLength = dataLength;
  }
  var header = Buffer.from([kFinalBit | kOpCodeText, kMaskBit | singleByteLength]);
  var mask = Buffer.alloc(4);
  var masked = Buffer.alloc(dataLength);
  for (var _i = 0; _i < dataLength; ++_i) {
    masked[_i] = payload[_i] ^ mask[_i % kMaskingKeyWidthInBytes];
  }
  return Buffer.concat([header, additionalLength, mask, masked]);
}
function decodeFrameHybi17(data) {
  var dataAvailable = data.length;
  var notComplete = {
    closed: false,
    payload: null,
    rest: data
  };
  var payloadOffset = 2;
  if (dataAvailable - payloadOffset < 0) return notComplete;
  var firstByte = data[0];
  var secondByte = data[1];
  var final = (firstByte & kFinalBit) !== 0;
  var reserved1 = (firstByte & kReserved1Bit) !== 0;
  var reserved2 = (firstByte & kReserved2Bit) !== 0;
  var reserved3 = (firstByte & kReserved3Bit) !== 0;
  var opCode = firstByte & kOpCodeMask;
  var masked = (secondByte & kMaskBit) !== 0;
  var compressed = reserved1;
  if (compressed) {
    throw new ERR_DEBUGGER_ERROR('Compressed frames not supported');
  }
  if (!final || reserved2 || reserved3) {
    throw new ERR_DEBUGGER_ERROR('Only compression extension is supported');
  }
  if (masked) {
    throw new ERR_DEBUGGER_ERROR('Masked server frame - not supported');
  }
  var closed = false;
  switch (opCode) {
    case kOpCodeClose:
      closed = true;
      break;
    case kOpCodeText:
      break;
    default:
      throw new ERR_DEBUGGER_ERROR(`Unsupported op code ${opCode}`);
  }
  var payloadLength = secondByte & kPayloadLengthMask;
  switch (payloadLength) {
    case kTwoBytePayloadLengthField:
      payloadOffset += 2;
      payloadLength = (data[2] << 8) + data[3];
      break;
    case kEightBytePayloadLengthField:
      payloadOffset += 8;
      payloadLength = 0;
      for (var i = 0; i < 8; ++i) {
        payloadLength <<= 8;
        payloadLength |= data[2 + i];
      }
      break;
    default:
    // Nothing. We already have the right size.
  }
  if (dataAvailable - payloadOffset - payloadLength < 0) return notComplete;
  var payloadEnd = payloadOffset + payloadLength;
  return {
    payload: data.slice(payloadOffset, payloadEnd),
    rest: data.slice(payloadEnd),
    closed
  };
}
var Client = /*#__PURE__*/function (_EventEmitter) {
  function Client() {
    var _this;
    _classCallCheck(this, Client);
    _this = _callSuper(this, Client);
    _this.handleChunk = FunctionPrototypeBind(_this._handleChunk, _this);
    _this._port = undefined;
    _this._host = undefined;
    _this.reset();
    return _this;
  }
  _inherits(Client, _EventEmitter);
  return _createClass(Client, [{
    key: "_handleChunk",
    value: function _handleChunk(chunk) {
      this._unprocessed = Buffer.concat([this._unprocessed, chunk]);
      while (this._unprocessed.length > 2) {
        var {
          closed,
          payload: payloadBuffer,
          rest
        } = decodeFrameHybi17(this._unprocessed);
        this._unprocessed = rest;
        if (closed) {
          this.reset();
          return;
        }
        if (payloadBuffer === null || payloadBuffer.length === 0) break;
        var payloadStr = payloadBuffer.toString();
        debuglog('< %s', payloadStr);
        var lastChar = payloadStr[payloadStr.length - 1];
        if (payloadStr[0] !== '{' || lastChar !== '}') {
          throw new ERR_DEBUGGER_ERROR(`Payload does not look like JSON: ${payloadStr}`);
        }
        var payload = void 0;
        try {
          payload = JSONParse(payloadStr);
        } catch (parseError) {
          parseError.string = payloadStr;
          throw parseError;
        }
        var {
          id,
          method,
          params,
          result,
          error
        } = payload;
        if (id) {
          var handler = this._pending[id];
          if (handler) {
            delete this._pending[id];
            handler(error, result);
          }
        } else if (method) {
          this.emit('debugEvent', method, params);
          this.emit(method, params);
        } else {
          throw new ERR_DEBUGGER_ERROR(`Unsupported response: ${payloadStr}`);
        }
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      var pending = this._pending;
      if (pending) {
        ArrayPrototypeForEach(ObjectValues(pending), handler => {
          handler({
            code: 'ERR_DEBUGGER_ERROR',
            message: 'Debugger session ended'
          });
        });
      }
      if (this._http) {
        this._http.destroy();
      }
      if (this._socket) {
        this._socket.destroy();
      }
      this._http = null;
      this._lastId = 0;
      this._socket = null;
      this._pending = {};
      this._unprocessed = new FastBuffer();
    }
  }, {
    key: "callMethod",
    value: function callMethod(method, params) {
      return new Promise((resolve, reject) => {
        if (!this._socket) {
          reject(new ERR_DEBUGGER_ERROR('Use `run` to start the app again.'));
          return;
        }
        var data = {
          id: ++this._lastId,
          method,
          params
        };
        this._pending[data.id] = (error, result) => {
          if (error) reject(unpackError(error));else resolve(ObjectKeys(result).length ? result : undefined);
        };
        var json = JSONStringify(data);
        debuglog('> %s', json);
        this._socket.write(encodeFrameHybi17(Buffer.from(json)));
      });
    }
  }, {
    key: "_fetchJSON",
    value: function _fetchJSON(urlPath) {
      return new Promise((resolve, reject) => {
        var httpReq = http.get({
          host: this._host,
          port: this._port,
          path: urlPath
        });
        var chunks = [];
        function onResponse(httpRes) {
          function parseChunks() {
            var resBody = Buffer.concat(chunks).toString();
            if (httpRes.statusCode !== 200) {
              reject(new ERR_DEBUGGER_ERROR(`Unexpected ${httpRes.statusCode}: ${resBody}`));
              return;
            }
            try {
              resolve(JSONParse(resBody));
            } catch {
              reject(new ERR_DEBUGGER_ERROR(`Response didn't contain JSON: ${resBody}`));
            }
          }
          httpRes.on('error', reject);
          httpRes.on('data', chunk => ArrayPrototypePush(chunks, chunk));
          httpRes.on('end', parseChunks);
        }
        httpReq.on('error', reject);
        httpReq.on('response', onResponse);
      });
    }
  }, {
    key: "connect",
    value: function connect(port, host) {
      try {
        var _this2 = this;
        _this2._port = port;
        _this2._host = host;
        return _await(_this2._discoverWebsocketPath(), function (urlPath) {
          return _this2._connectWebsocket(urlPath);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "_discoverWebsocketPath",
    value: function _discoverWebsocketPath() {
      try {
        var _this3 = this;
        return _await(_this3._fetchJSON('/json'), function (_ref2) {
          var {
            0: {
              webSocketDebuggerUrl
            }
          } = _ref2;
          var {
            pathname,
            search
          } = new URL(webSocketDebuggerUrl);
          return `${pathname}${search}`;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "_connectWebsocket",
    value: function _connectWebsocket(urlPath) {
      this.reset();
      var requestKey = crypto.randomBytes(16).toString('base64');
      debuglog('request WebSocket', requestKey);
      var httpReq = this._http = http.request({
        host: this._host,
        port: this._port,
        path: urlPath,
        headers: {
          'Connection': 'Upgrade',
          'Upgrade': 'websocket',
          'Sec-WebSocket-Key': requestKey,
          'Sec-WebSocket-Version': '13'
        }
      });
      httpReq.on('error', e => {
        this.emit('error', e);
      });
      httpReq.on('response', httpRes => {
        if (httpRes.statusCode >= 400) {
          process.stderr.write(`Unexpected HTTP code: ${httpRes.statusCode}\n`);
          httpRes.pipe(process.stderr);
        } else {
          httpRes.pipe(process.stderr);
        }
      });
      var handshakeListener = (res, socket) => {
        validateHandshake(requestKey, res.headers['sec-websocket-accept']);
        debuglog('websocket upgrade');
        this._socket = socket;
        socket.on('data', this.handleChunk);
        socket.on('close', () => {
          this.emit('close');
        });
        this.emit('ready');
      };
      var onReady = once(this, 'ready');
      httpReq.on('upgrade', handshakeListener);
      httpReq.end();
      return onReady;
    }
  }]);
}(EventEmitter);
module.exports = Client;

