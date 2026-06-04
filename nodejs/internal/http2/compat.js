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
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  ArrayIsArray,
  Boolean: _Boolean,
  ObjectAssign,
  ObjectHasOwn,
  ObjectKeys,
  Proxy,
  ReflectGetPrototypeOf,
  Symbol: _Symbol
} = primordials;
var assert = require('internal/assert');
var Stream = require('stream');
var {
  Readable
} = Stream;
var {
  constants: {
    HTTP2_HEADER_AUTHORITY,
    HTTP2_HEADER_CONNECTION,
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_STATUS,
    HTTP_STATUS_CONTINUE,
    HTTP_STATUS_EARLY_HINTS,
    HTTP_STATUS_EXPECTATION_FAILED,
    HTTP_STATUS_METHOD_NOT_ALLOWED,
    HTTP_STATUS_OK
  }
} = internalBinding('http2');
var {
  codes: {
    ERR_HTTP2_HEADERS_SENT,
    ERR_HTTP2_INFO_STATUS_NOT_ALLOWED,
    ERR_HTTP2_INVALID_HEADER_VALUE,
    ERR_HTTP2_INVALID_STREAM,
    ERR_HTTP2_NO_SOCKET_MANIPULATION,
    ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED,
    ERR_HTTP2_STATUS_INVALID,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_HTTP_TOKEN,
    ERR_STREAM_WRITE_AFTER_END
  },
  hideStackFrames
} = require('internal/errors');
var {
  validateFunction,
  validateString,
  validateLinkHeaderValue,
  validateObject
} = require('internal/validators');
var {
  kSocket,
  kRequest,
  kProxySocket,
  assertValidPseudoHeader,
  getAuthority
} = require('internal/http2/util');
var {
  _checkIsHttpToken: checkIsHttpToken
} = require('_http_common');
var kBeginSend = _Symbol('begin-send');
var kState = _Symbol('state');
var kStream = _Symbol('stream');
var kResponse = _Symbol('response');
var kHeaders = _Symbol('headers');
var kRawHeaders = _Symbol('rawHeaders');
var kTrailers = _Symbol('trailers');
var kRawTrailers = _Symbol('rawTrailers');
var kSetHeader = _Symbol('setHeader');
var kAppendHeader = _Symbol('appendHeader');
var kAborted = _Symbol('aborted');
var statusMessageWarned = false;
var statusConnectionHeaderWarned = false;

// Defines and implements an API compatibility layer on top of the core
// HTTP/2 implementation, intended to provide an interface that is as
// close as possible to the current require('http') API

var assertValidHeader = hideStackFrames((name, value) => {
  if (name === '' || typeof name !== 'string' || name.includes(' ')) {
    throw new ERR_INVALID_HTTP_TOKEN.HideStackFramesError('Header name', name);
  }
  if (isPseudoHeader(name)) {
    throw new ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED.HideStackFramesError();
  }
  if (value === undefined || value === null) {
    throw new ERR_HTTP2_INVALID_HEADER_VALUE.HideStackFramesError(value, name);
  }
  if (!isConnectionHeaderAllowed(name, value)) {
    connectionHeaderMessageWarn();
  }
});
function isPseudoHeader(name) {
  switch (name) {
    case HTTP2_HEADER_STATUS: // :status
    case HTTP2_HEADER_METHOD: // :method
    case HTTP2_HEADER_PATH: // :path
    case HTTP2_HEADER_AUTHORITY: // :authority
    case HTTP2_HEADER_SCHEME:
      // :scheme
      return true;
    default:
      return false;
  }
}
function statusMessageWarn() {
  if (statusMessageWarned === false) {
    process.emitWarning('Status message is not supported by HTTP/2 (RFC7540 8.1.2.4)', 'UnsupportedWarning');
    statusMessageWarned = true;
  }
}
function isConnectionHeaderAllowed(name, value) {
  return name !== HTTP2_HEADER_CONNECTION || value === 'trailers';
}
function connectionHeaderMessageWarn() {
  if (statusConnectionHeaderWarned === false) {
    process.emitWarning('The provided connection header is not valid, ' + 'the value will be dropped from the header and ' + 'will never be in use.', 'UnsupportedWarning');
    statusConnectionHeaderWarned = true;
  }
}
function onStreamData(chunk) {
  var request = this[kRequest];
  if (request !== undefined && !request.push(chunk)) this.pause();
}
function onStreamTrailers(trailers, flags, rawTrailers) {
  var request = this[kRequest];
  if (request !== undefined) {
    var _request$kRawTrailers;
    ObjectAssign(request[kTrailers], trailers);
    (_request$kRawTrailers = request[kRawTrailers]).push.apply(_request$kRawTrailers, _toConsumableArray(rawTrailers));
  }
}
function onStreamEnd() {
  // Cause the request stream to end as well.
  var request = this[kRequest];
  if (request !== undefined) this[kRequest].push(null);
}
function onStreamError(error) {
  // This is purposefully left blank
  //
  // errors in compatibility mode are
  // not forwarded to the request
  // and response objects.
}
function onRequestPause() {
  this[kStream].pause();
}
function onRequestResume() {
  this[kStream].resume();
}
function onStreamDrain() {
  var response = this[kResponse];
  if (response !== undefined) response.emit('drain');
}
function onStreamAbortedRequest() {
  var request = this[kRequest];
  if (request !== undefined && request[kState].closed === false) {
    request[kAborted] = true;
    request.emit('aborted');
  }
}
function onStreamAbortedResponse() {
  // non-op for now
}
function resumeStream(stream) {
  stream.resume();
}
var proxySocketHandler = {
  has(stream, prop) {
    var ref = stream.session !== undefined ? stream.session[kSocket] : stream;
    return prop in stream || prop in ref;
  },
  get(stream, prop) {
    switch (prop) {
      case 'on':
      case 'once':
      case 'end':
      case 'emit':
      case 'destroy':
        return stream[prop].bind(stream);
      case 'writable':
      case 'destroyed':
        return stream[prop];
      case 'readable':
        {
          if (stream.destroyed) return false;
          var request = stream[kRequest];
          return request ? request.readable : stream.readable;
        }
      case 'setTimeout':
        {
          var session = stream.session;
          if (session !== undefined) return session.setTimeout.bind(session);
          return stream.setTimeout.bind(stream);
        }
      case 'write':
      case 'read':
      case 'pause':
      case 'resume':
        throw new ERR_HTTP2_NO_SOCKET_MANIPULATION();
      default:
        {
          var ref = stream.session !== undefined ? stream.session[kSocket] : stream;
          var value = ref[prop];
          return typeof value === 'function' ? value.bind(ref) : value;
        }
    }
  },
  getPrototypeOf(stream) {
    if (stream.session !== undefined) return ReflectGetPrototypeOf(stream.session[kSocket]);
    return ReflectGetPrototypeOf(stream);
  },
  set(stream, prop, value) {
    switch (prop) {
      case 'writable':
      case 'readable':
      case 'destroyed':
      case 'on':
      case 'once':
      case 'end':
      case 'emit':
      case 'destroy':
        stream[prop] = value;
        return true;
      case 'setTimeout':
        {
          var session = stream.session;
          if (session !== undefined) session.setTimeout = value;else stream.setTimeout = value;
          return true;
        }
      case 'write':
      case 'read':
      case 'pause':
      case 'resume':
        throw new ERR_HTTP2_NO_SOCKET_MANIPULATION();
      default:
        {
          var ref = stream.session !== undefined ? stream.session[kSocket] : stream;
          ref[prop] = value;
          return true;
        }
    }
  }
};
function onStreamCloseRequest() {
  var req = this[kRequest];
  if (req === undefined) return;
  var state = req[kState];
  state.closed = true;
  req.push(null);
  // If the user didn't interact with incoming data and didn't pipe it,
  // dump it for compatibility with http1
  if (!state.didRead && !req._readableState.resumeScheduled) req.resume();
  this[kProxySocket] = null;
  this[kRequest] = undefined;
  req.emit('close');
}
function onStreamTimeout(kind) {
  return function onStreamTimeout() {
    var obj = this[kind];
    obj.emit('timeout');
  };
}
var Http2ServerRequest = /*#__PURE__*/function (_Readable) {
  function Http2ServerRequest(stream, headers, options, rawHeaders) {
    var _this;
    _classCallCheck(this, Http2ServerRequest);
    _this = _callSuper(this, Http2ServerRequest, [_objectSpread({
      autoDestroy: false
    }, options)]);
    _this[kState] = {
      closed: false,
      didRead: false
    };
    // Headers in HTTP/1 are not initialized using Object.create(null) which,
    // although preferable, would simply break too much code. Ergo header
    // initialization using Object.create(null) in HTTP/2 is intentional.
    _this[kHeaders] = headers;
    _this[kRawHeaders] = rawHeaders;
    _this[kTrailers] = {
      __proto__: null
    };
    _this[kRawTrailers] = [];
    _this[kStream] = stream;
    _this[kAborted] = false;
    stream[kProxySocket] = null;
    stream[kRequest] = _this;

    // Pause the stream..
    stream.on('trailers', onStreamTrailers);
    stream.on('end', onStreamEnd);
    stream.on('error', onStreamError);
    stream.on('aborted', onStreamAbortedRequest);
    stream.on('close', onStreamCloseRequest);
    stream.on('timeout', onStreamTimeout(kRequest));
    _this.on('pause', onRequestPause);
    _this.on('resume', onRequestResume);
    return _this;
  }
  _inherits(Http2ServerRequest, _Readable);
  return _createClass(Http2ServerRequest, [{
    key: "aborted",
    get: function () {
      return this[kAborted];
    }
  }, {
    key: "complete",
    get: function () {
      return this[kAborted] || this.readableEnded || this[kState].closed || this[kStream].destroyed;
    }
  }, {
    key: "stream",
    get: function () {
      return this[kStream];
    }
  }, {
    key: "headers",
    get: function () {
      return this[kHeaders];
    }
  }, {
    key: "rawHeaders",
    get: function () {
      return this[kRawHeaders];
    }
  }, {
    key: "trailers",
    get: function () {
      return this[kTrailers];
    }
  }, {
    key: "rawTrailers",
    get: function () {
      return this[kRawTrailers];
    }
  }, {
    key: "httpVersionMajor",
    get: function () {
      return 2;
    }
  }, {
    key: "httpVersionMinor",
    get: function () {
      return 0;
    }
  }, {
    key: "httpVersion",
    get: function () {
      return '2.0';
    }
  }, {
    key: "socket",
    get: function () {
      var stream = this[kStream];
      var proxySocket = stream[kProxySocket];
      if (proxySocket === null) return stream[kProxySocket] = new Proxy(stream, proxySocketHandler);
      return proxySocket;
    }
  }, {
    key: "connection",
    get: function () {
      return this.socket;
    }
  }, {
    key: "_read",
    value: function _read(nread) {
      var state = this[kState];
      assert(!state.closed);
      if (!state.didRead) {
        state.didRead = true;
        this[kStream].on('data', onStreamData);
      } else {
        process.nextTick(resumeStream, this[kStream]);
      }
    }
  }, {
    key: "method",
    get: function () {
      return this[kHeaders][HTTP2_HEADER_METHOD];
    },
    set: function (method) {
      validateString(method, 'method');
      if (method.trim() === '') throw new ERR_INVALID_ARG_VALUE('method', method);
      this[kHeaders][HTTP2_HEADER_METHOD] = method;
    }
  }, {
    key: "authority",
    get: function () {
      return getAuthority(this[kHeaders]);
    }
  }, {
    key: "scheme",
    get: function () {
      return this[kHeaders][HTTP2_HEADER_SCHEME];
    }
  }, {
    key: "url",
    get: function () {
      return this[kHeaders][HTTP2_HEADER_PATH];
    },
    set: function (url) {
      this[kHeaders][HTTP2_HEADER_PATH] = url;
    }
  }, {
    key: "setTimeout",
    value: function setTimeout(msecs, callback) {
      if (!this[kState].closed) this[kStream].setTimeout(msecs, callback);
      return this;
    }
  }]);
}(Readable);
function onStreamTrailersReady() {
  this.sendTrailers(this[kResponse][kTrailers]);
}
function onStreamCloseResponse() {
  var res = this[kResponse];
  if (res === undefined) return;
  var state = res[kState];
  if (this.headRequest !== state.headRequest) return;
  state.closed = true;
  this[kProxySocket] = null;
  this.removeListener('wantTrailers', onStreamTrailersReady);
  this[kResponse] = undefined;
  res.emit('finish');
  res.emit('close');
}
var Http2ServerResponse = /*#__PURE__*/function (_Stream) {
  function Http2ServerResponse(stream, options) {
    var _this2;
    _classCallCheck(this, Http2ServerResponse);
    _this2 = _callSuper(this, Http2ServerResponse, [options]);
    _this2[kState] = {
      closed: false,
      ending: false,
      destroyed: false,
      headRequest: false,
      sendDate: true,
      statusCode: HTTP_STATUS_OK
    };
    _this2[kHeaders] = {
      __proto__: null
    };
    _this2[kTrailers] = {
      __proto__: null
    };
    _this2[kStream] = stream;
    stream[kProxySocket] = null;
    stream[kResponse] = _this2;
    _this2.writable = true;
    _this2.req = stream[kRequest];
    stream.on('drain', onStreamDrain);
    stream.on('aborted', onStreamAbortedResponse);
    stream.on('close', onStreamCloseResponse);
    stream.on('wantTrailers', onStreamTrailersReady);
    stream.on('timeout', onStreamTimeout(kResponse));
    return _this2;
  }

  // User land modules such as finalhandler just check truthiness of this
  // but if someone is actually trying to use this for more than that
  // then we simply can't support such use cases
  _inherits(Http2ServerResponse, _Stream);
  return _createClass(Http2ServerResponse, [{
    key: "_header",
    get: function () {
      return this.headersSent;
    }
  }, {
    key: "writableEnded",
    get: function () {
      var state = this[kState];
      return state.ending;
    }
  }, {
    key: "finished",
    get: function () {
      var state = this[kState];
      return state.ending;
    }
  }, {
    key: "socket",
    get: function () {
      // This is compatible with http1 which removes socket reference
      // only from ServerResponse but not IncomingMessage
      if (this[kState].closed) return undefined;
      var stream = this[kStream];
      var proxySocket = stream[kProxySocket];
      if (proxySocket === null) return stream[kProxySocket] = new Proxy(stream, proxySocketHandler);
      return proxySocket;
    }
  }, {
    key: "connection",
    get: function () {
      return this.socket;
    }
  }, {
    key: "stream",
    get: function () {
      return this[kStream];
    }
  }, {
    key: "headersSent",
    get: function () {
      return this[kStream].headersSent;
    }
  }, {
    key: "sendDate",
    get: function () {
      return this[kState].sendDate;
    },
    set: function (bool) {
      this[kState].sendDate = _Boolean(bool);
    }
  }, {
    key: "statusCode",
    get: function () {
      return this[kState].statusCode;
    },
    set: function (code) {
      code |= 0;
      if (code >= 100 && code < 200) throw new ERR_HTTP2_INFO_STATUS_NOT_ALLOWED();
      if (code < 100 || code > 599) throw new ERR_HTTP2_STATUS_INVALID(code);
      this[kState].statusCode = code;
    }
  }, {
    key: "writableCorked",
    get: function () {
      return this[kStream].writableCorked;
    }
  }, {
    key: "writableHighWaterMark",
    get: function () {
      return this[kStream].writableHighWaterMark;
    }
  }, {
    key: "writableObjectMode",
    get: function () {
      return this[kStream].writableObjectMode;
    }
  }, {
    key: "writableFinished",
    get: function () {
      return this[kStream].writableFinished;
    }
  }, {
    key: "writableLength",
    get: function () {
      return this[kStream].writableLength;
    }
  }, {
    key: "writableNeedDrain",
    get: function () {
      return this[kStream].writableNeedDrain;
    }
  }, {
    key: "setTrailer",
    value: function setTrailer(name, value) {
      validateString(name, 'name');
      name = name.trim().toLowerCase();
      assertValidHeader(name, value);
      this[kTrailers][name] = value;
    }
  }, {
    key: "addTrailers",
    value: function addTrailers(headers) {
      var keys = ObjectKeys(headers);
      var key = '';
      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        this.setTrailer(key, headers[key]);
      }
    }
  }, {
    key: "getHeader",
    value: function getHeader(name) {
      validateString(name, 'name');
      name = name.trim().toLowerCase();
      return this[kHeaders][name];
    }
  }, {
    key: "getHeaderNames",
    value: function getHeaderNames() {
      return ObjectKeys(this[kHeaders]);
    }
  }, {
    key: "getHeaders",
    value: function getHeaders() {
      var headers = {
        __proto__: null
      };
      return ObjectAssign(headers, this[kHeaders]);
    }
  }, {
    key: "hasHeader",
    value: function hasHeader(name) {
      validateString(name, 'name');
      name = name.trim().toLowerCase();
      return ObjectHasOwn(this[kHeaders], name);
    }
  }, {
    key: "removeHeader",
    value: function removeHeader(name) {
      validateString(name, 'name');
      if (this[kStream].headersSent) throw new ERR_HTTP2_HEADERS_SENT();
      name = name.trim().toLowerCase();
      if (name === 'date') {
        this[kState].sendDate = false;
        return;
      }
      delete this[kHeaders][name];
    }
  }, {
    key: "setHeader",
    value: function setHeader(name, value) {
      validateString(name, 'name');
      if (this[kStream].headersSent) throw new ERR_HTTP2_HEADERS_SENT();
      this[kSetHeader](name, value);
    }
  }, {
    key: kSetHeader,
    value: function (name, value) {
      name = name.trim().toLowerCase();
      assertValidHeader(name, value);
      if (!isConnectionHeaderAllowed(name, value)) {
        return;
      }
      if (name[0] === ':') assertValidPseudoHeader(name);else if (!checkIsHttpToken(name)) this.destroy(new ERR_INVALID_HTTP_TOKEN('Header name', name));
      this[kHeaders][name] = value;
    }
  }, {
    key: "appendHeader",
    value: function appendHeader(name, value) {
      validateString(name, 'name');
      if (this[kStream].headersSent) throw new ERR_HTTP2_HEADERS_SENT();
      this[kAppendHeader](name, value);
    }
  }, {
    key: kAppendHeader,
    value: function (name, value) {
      name = name.trim().toLowerCase();
      assertValidHeader(name, value);
      if (!isConnectionHeaderAllowed(name, value)) {
        return;
      }
      if (name[0] === ':') assertValidPseudoHeader(name);else if (!checkIsHttpToken(name)) this.destroy(new ERR_INVALID_HTTP_TOKEN('Header name', name));

      // Handle various possible cases the same as OutgoingMessage.appendHeader:
      var headers = this[kHeaders];
      if (headers === null || !headers[name]) {
        return this.setHeader(name, value);
      }
      if (!ArrayIsArray(headers[name])) {
        headers[name] = [headers[name]];
      }
      var existingValues = headers[name];
      if (ArrayIsArray(value)) {
        for (var i = 0, length = value.length; i < length; i++) {
          existingValues.push(value[i]);
        }
      } else {
        existingValues.push(value);
      }
    }
  }, {
    key: "statusMessage",
    get: function () {
      statusMessageWarn();
      return '';
    },
    set: function (msg) {
      statusMessageWarn();
    }
  }, {
    key: "flushHeaders",
    value: function flushHeaders() {
      var state = this[kState];
      if (!state.closed && !this[kStream].headersSent) this.writeHead(state.statusCode);
    }
  }, {
    key: "writeHead",
    value: function writeHead(statusCode, statusMessage, headers) {
      var state = this[kState];
      if (state.closed || this.stream.destroyed || this.stream.closed) return this;
      if (this[kStream].headersSent) throw new ERR_HTTP2_HEADERS_SENT();
      if (typeof statusMessage === 'string') statusMessageWarn();
      if (headers === undefined && typeof statusMessage === 'object') headers = statusMessage;
      var i;
      if (ArrayIsArray(headers)) {
        if (this[kHeaders]) {
          // Headers in obj should override previous headers but still
          // allow explicit duplicates. To do so, we first remove any
          // existing conflicts, then use appendHeader. This is the
          // slow path, which only applies when you use setHeader and
          // then pass headers in writeHead too.

          // We need to handle both the tuple and flat array formats, just
          // like the logic further below.
          if (headers.length && ArrayIsArray(headers[0])) {
            for (var n = 0; n < headers.length; n += 1) {
              var key = headers[n + 0][0];
              this.removeHeader(key);
            }
          } else {
            for (var _n = 0; _n < headers.length; _n += 2) {
              var _key = headers[_n + 0];
              this.removeHeader(_key);
            }
          }
        }

        // Append all the headers provided in the array:
        if (headers.length && ArrayIsArray(headers[0])) {
          for (i = 0; i < headers.length; i++) {
            var header = headers[i];
            this[kAppendHeader](header[0], header[1]);
          }
        } else {
          if (headers.length % 2 !== 0) {
            throw new ERR_INVALID_ARG_VALUE('headers', headers);
          }
          for (i = 0; i < headers.length; i += 2) {
            this[kAppendHeader](headers[i], headers[i + 1]);
          }
        }
      } else if (typeof headers === 'object') {
        var keys = ObjectKeys(headers);
        var _key2 = '';
        for (i = 0; i < keys.length; i++) {
          _key2 = keys[i];
          this[kSetHeader](_key2, headers[_key2]);
        }
      }
      state.statusCode = statusCode;
      this[kBeginSend]();
      return this;
    }
  }, {
    key: "cork",
    value: function cork() {
      this[kStream].cork();
    }
  }, {
    key: "uncork",
    value: function uncork() {
      this[kStream].uncork();
    }
  }, {
    key: "write",
    value: function write(chunk, encoding, cb) {
      var state = this[kState];
      if (typeof encoding === 'function') {
        cb = encoding;
        encoding = 'utf8';
      }
      var err;
      if (state.ending) {
        err = new ERR_STREAM_WRITE_AFTER_END();
      } else if (state.closed) {
        err = new ERR_HTTP2_INVALID_STREAM();
      } else if (state.destroyed) {
        return false;
      }
      if (err) {
        if (typeof cb === 'function') process.nextTick(cb, err);
        this.destroy(err);
        return false;
      }
      var stream = this[kStream];
      if (!stream.headersSent) this.writeHead(state.statusCode);
      return stream.write(chunk, encoding, cb);
    }
  }, {
    key: "end",
    value: function end(chunk, encoding, cb) {
      var stream = this[kStream];
      var state = this[kState];
      if (typeof chunk === 'function') {
        cb = chunk;
        chunk = null;
      } else if (typeof encoding === 'function') {
        cb = encoding;
        encoding = 'utf8';
      }
      if ((state.closed || state.ending) && state.headRequest === stream.headRequest) {
        if (typeof cb === 'function') {
          process.nextTick(cb);
        }
        return this;
      }
      if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);
      state.headRequest = stream.headRequest;
      state.ending = true;
      if (typeof cb === 'function') {
        if (stream.writableEnded) this.once('finish', cb);else stream.once('finish', cb);
      }
      if (!stream.headersSent) this.writeHead(this[kState].statusCode);
      if (this[kState].closed || stream.destroyed) onStreamCloseResponse.call(stream);else stream.end();
      return this;
    }
  }, {
    key: "destroy",
    value: function destroy(err) {
      if (this[kState].destroyed) return;
      this[kState].destroyed = true;
      this[kStream].destroy(err);
    }
  }, {
    key: "setTimeout",
    value: function setTimeout(msecs, callback) {
      if (this[kState].closed) return;
      this[kStream].setTimeout(msecs, callback);
    }
  }, {
    key: "createPushResponse",
    value: function createPushResponse(headers, callback) {
      validateFunction(callback, 'callback');
      if (this[kState].closed) {
        process.nextTick(callback, new ERR_HTTP2_INVALID_STREAM());
        return;
      }
      this[kStream].pushStream(headers, {}, (err, stream, headers, options) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, new Http2ServerResponse(stream));
      });
    }
  }, {
    key: kBeginSend,
    value: function () {
      var state = this[kState];
      var headers = this[kHeaders];
      headers[HTTP2_HEADER_STATUS] = state.statusCode;
      var options = {
        endStream: state.ending,
        waitForTrailers: true,
        sendDate: state.sendDate
      };
      this[kStream].respond(headers, options);
    }
  }, {
    key: "writeInformation",
    value: function writeInformation(statusCode, headers) {
      if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 199) {
        throw new ERR_HTTP2_STATUS_INVALID(statusCode);
      }
      if (statusCode === 101) {
        throw new ERR_HTTP2_STATUS_INVALID(statusCode);
      }
      var stream = this[kStream];
      if (stream.headersSent || this[kState].closed) return false;
      var outHeaders = {
        __proto__: null
      };
      if (headers !== undefined && headers !== null) {
        validateObject(headers, 'headers');
        var keys = ObjectKeys(headers);
        for (var i = 0; i < keys.length; i++) {
          outHeaders[keys[i]] = headers[keys[i]];
        }
      }
      outHeaders[HTTP2_HEADER_STATUS] = statusCode;
      stream.additionalHeaders(outHeaders);
      return true;
    }

    // TODO doesn't support callbacks
  }, {
    key: "writeContinue",
    value: function writeContinue() {
      return this.writeInformation(HTTP_STATUS_CONTINUE);
    }
  }, {
    key: "writeEarlyHints",
    value: function writeEarlyHints(hints) {
      validateObject(hints, 'hints');
      var headers = {
        __proto__: null
      };
      var linkHeaderValue = validateLinkHeaderValue(hints.link);
      for (var key of ObjectKeys(hints)) {
        if (key !== 'link') {
          var name = key.trim().toLowerCase();
          assertValidHeader(name, hints[key]);
          if (!checkIsHttpToken(name)) throw new ERR_INVALID_HTTP_TOKEN('Header name', name);
          headers[name] = hints[key];
        }
      }
      if (linkHeaderValue.length === 0) {
        return false;
      }
      headers.Link = linkHeaderValue;
      return this.writeInformation(HTTP_STATUS_EARLY_HINTS, headers);
    }
  }]);
}(Stream);
function onServerStream(ServerRequest, ServerResponse, stream, headers, flags, rawHeaders) {
  var server = this;
  var request = new ServerRequest(stream, headers, undefined, rawHeaders);
  var response = new ServerResponse(stream);

  // Check for the CONNECT method
  var method = headers[HTTP2_HEADER_METHOD];
  if (method === 'CONNECT') {
    if (!server.emit('connect', request, response)) {
      response.statusCode = HTTP_STATUS_METHOD_NOT_ALLOWED;
      response.end();
    }
    return;
  }

  // Check for Expectations
  if (headers.expect !== undefined) {
    if (headers.expect === '100-continue') {
      if (server.listenerCount('checkContinue')) {
        server.emit('checkContinue', request, response);
      } else {
        response.writeContinue();
        server.emit('request', request, response);
      }
    } else if (server.listenerCount('checkExpectation')) {
      server.emit('checkExpectation', request, response);
    } else {
      response.statusCode = HTTP_STATUS_EXPECTATION_FAILED;
      response.end();
    }
    return;
  }
  server.emit('request', request, response);
}
module.exports = {
  onServerStream,
  Http2ServerRequest,
  Http2ServerResponse
};

