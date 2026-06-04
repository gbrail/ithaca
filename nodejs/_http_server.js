// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var {
  ArrayIsArray,
  Error,
  MathMin,
  NumberIsFinite,
  ObjectKeys,
  ObjectSetPrototypeOf,
  ReflectApply,
  Symbol: _Symbol,
  SymbolAsyncDispose,
  SymbolFor
} = primordials;
var {
  Duplex
} = require('stream');
var net = require('net');
var EE = require('events');
var assert = require('internal/assert');
var {
  parsers,
  freeParser,
  continueExpression,
  chunkExpression,
  kIncomingMessage,
  kSocket,
  HTTPParser,
  calculateLenientFlags,
  _checkInvalidHeaderChar: checkInvalidHeaderChar,
  prepareError
} = require('_http_common');
var {
  ConnectionsList
} = internalBinding('http_parser');
var {
  kUniqueHeaders,
  parseUniqueHeadersOption,
  OutgoingMessage,
  validateHeaderName,
  validateHeaderValue
} = require('_http_outgoing');
var {
  kOutHeaders,
  kNeedDrain,
  isTraceHTTPEnabled,
  traceBegin,
  traceEnd,
  getNextTraceEventId
} = require('internal/http');
var {
  defaultTriggerAsyncIdScope,
  getOrSetAsyncId
} = require('internal/async_hooks');
var {
  IncomingMessage
} = require('_http_incoming');
var {
  ConnResetException,
  codes: {
    ERR_HTTP_HEADERS_SENT,
    ERR_HTTP_INVALID_STATUS_CODE,
    ERR_HTTP_REQUEST_TIMEOUT,
    ERR_HTTP_SOCKET_ASSIGNED,
    ERR_HTTP_SOCKET_ENCODING,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_CHAR,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var {
  assignFunctionName,
  kEmptyObject,
  promisify
} = require('internal/util');
var {
  validateInteger,
  validateBoolean,
  validateOneOf,
  validateLinkHeaderValue,
  validateObject,
  validateFunction
} = require('internal/validators');
var Buffer = require('buffer').Buffer;
var {
  setInterval,
  clearInterval
} = require('timers');
var debug = require('internal/util/debuglog').debuglog('http', fn => {
  debug = fn;
});
var dc = require('diagnostics_channel');
var onRequestStartChannel = dc.channel('http.server.request.start');
var onResponseCreatedChannel = dc.channel('http.server.response.created');
var onResponseFinishChannel = dc.channel('http.server.response.finish');
var kServerResponse = _Symbol('ServerResponse');
var kServerResponseStatistics = _Symbol('ServerResponseStatistics');
var kUpgradeStream = _Symbol('UpgradeStream');
var kOptimizeEmptyRequests = _Symbol('OptimizeEmptyRequestsOption');
var {
  hasObserver,
  startPerf,
  stopPerf
} = require('internal/perf/observe');
var STATUS_CODES = {
  100: 'Continue',
  // RFC 7231 6.2.1
  101: 'Switching Protocols',
  // RFC 7231 6.2.2
  102: 'Processing',
  // RFC 2518 10.1 (obsoleted by RFC 4918)
  103: 'Early Hints',
  // RFC 8297 2
  200: 'OK',
  // RFC 7231 6.3.1
  201: 'Created',
  // RFC 7231 6.3.2
  202: 'Accepted',
  // RFC 7231 6.3.3
  203: 'Non-Authoritative Information',
  // RFC 7231 6.3.4
  204: 'No Content',
  // RFC 7231 6.3.5
  205: 'Reset Content',
  // RFC 7231 6.3.6
  206: 'Partial Content',
  // RFC 7233 4.1
  207: 'Multi-Status',
  // RFC 4918 11.1
  208: 'Already Reported',
  // RFC 5842 7.1
  226: 'IM Used',
  // RFC 3229 10.4.1
  300: 'Multiple Choices',
  // RFC 7231 6.4.1
  301: 'Moved Permanently',
  // RFC 7231 6.4.2
  302: 'Found',
  // RFC 7231 6.4.3
  303: 'See Other',
  // RFC 7231 6.4.4
  304: 'Not Modified',
  // RFC 7232 4.1
  305: 'Use Proxy',
  // RFC 7231 6.4.5
  307: 'Temporary Redirect',
  // RFC 7231 6.4.7
  308: 'Permanent Redirect',
  // RFC 7238 3
  400: 'Bad Request',
  // RFC 7231 6.5.1
  401: 'Unauthorized',
  // RFC 7235 3.1
  402: 'Payment Required',
  // RFC 7231 6.5.2
  403: 'Forbidden',
  // RFC 7231 6.5.3
  404: 'Not Found',
  // RFC 7231 6.5.4
  405: 'Method Not Allowed',
  // RFC 7231 6.5.5
  406: 'Not Acceptable',
  // RFC 7231 6.5.6
  407: 'Proxy Authentication Required',
  // RFC 7235 3.2
  408: 'Request Timeout',
  // RFC 7231 6.5.7
  409: 'Conflict',
  // RFC 7231 6.5.8
  410: 'Gone',
  // RFC 7231 6.5.9
  411: 'Length Required',
  // RFC 7231 6.5.10
  412: 'Precondition Failed',
  // RFC 7232 4.2
  413: 'Payload Too Large',
  // RFC 7231 6.5.11
  414: 'URI Too Long',
  // RFC 7231 6.5.12
  415: 'Unsupported Media Type',
  // RFC 7231 6.5.13
  416: 'Range Not Satisfiable',
  // RFC 7233 4.4
  417: 'Expectation Failed',
  // RFC 7231 6.5.14
  418: 'I\'m a Teapot',
  // RFC 7168 2.3.3
  421: 'Misdirected Request',
  // RFC 7540 9.1.2
  422: 'Unprocessable Entity',
  // RFC 4918 11.2
  423: 'Locked',
  // RFC 4918 11.3
  424: 'Failed Dependency',
  // RFC 4918 11.4
  425: 'Too Early',
  // RFC 8470 5.2
  426: 'Upgrade Required',
  // RFC 2817 and RFC 7231 6.5.15
  428: 'Precondition Required',
  // RFC 6585 3
  429: 'Too Many Requests',
  // RFC 6585 4
  431: 'Request Header Fields Too Large',
  // RFC 6585 5
  451: 'Unavailable For Legal Reasons',
  // RFC 7725 3
  500: 'Internal Server Error',
  // RFC 7231 6.6.1
  501: 'Not Implemented',
  // RFC 7231 6.6.2
  502: 'Bad Gateway',
  // RFC 7231 6.6.3
  503: 'Service Unavailable',
  // RFC 7231 6.6.4
  504: 'Gateway Timeout',
  // RFC 7231 6.6.5
  505: 'HTTP Version Not Supported',
  // RFC 7231 6.6.6
  506: 'Variant Also Negotiates',
  // RFC 2295 8.1
  507: 'Insufficient Storage',
  // RFC 4918 11.5
  508: 'Loop Detected',
  // RFC 5842 7.2
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  // RFC 2774 7
  511: 'Network Authentication Required' // RFC 6585 6
};
var kOnExecute = HTTPParser.kOnExecute | 0;
var kOnTimeout = HTTPParser.kOnTimeout | 0;
var kConnections = _Symbol('http.server.connections');
var kConnectionsCheckingInterval = _Symbol('http.server.connectionsCheckingInterval');
var HTTP_SERVER_TRACE_EVENT_NAME = 'http.server.request';
var HTTPServerAsyncResource = /*#__PURE__*/_createClass(function HTTPServerAsyncResource(type, socket) {
  _classCallCheck(this, HTTPServerAsyncResource);
  this.type = type;
  this.socket = socket;
});
function ServerResponse(req, options) {
  OutgoingMessage.call(this, options);
  if (req.method === 'HEAD') this._hasBody = false;
  this.req = req;
  this.sendDate = true;
  this._sent100 = false;
  this._expect_continue = false;
  if (req.httpVersionMajor < 1 || req.httpVersionMinor < 1) {
    this.useChunkedEncodingByDefault = chunkExpression.test(req.headers.te);
    this.shouldKeepAlive = false;
  }
  if (hasObserver('http')) {
    startPerf(this, kServerResponseStatistics, {
      type: 'http',
      name: 'HttpRequest',
      detail: {
        req: {
          method: req.method,
          url: req.url,
          headers: req.headers
        }
      }
    });
  }
  if (isTraceHTTPEnabled()) {
    this._traceEventId = getNextTraceEventId();
    traceBegin(HTTP_SERVER_TRACE_EVENT_NAME, this._traceEventId);
  }
  if (onResponseCreatedChannel.hasSubscribers) {
    onResponseCreatedChannel.publish({
      request: req,
      response: this
    });
  }
}
ObjectSetPrototypeOf(ServerResponse.prototype, OutgoingMessage.prototype);
ObjectSetPrototypeOf(ServerResponse, OutgoingMessage);
ServerResponse.prototype._finish = function _finish() {
  if (this[kServerResponseStatistics] && hasObserver('http')) {
    stopPerf(this, kServerResponseStatistics, {
      detail: {
        res: {
          statusCode: this.statusCode,
          statusMessage: this.statusMessage,
          headers: typeof this.getHeaders === 'function' ? this.getHeaders() : {}
        }
      }
    });
  }
  OutgoingMessage.prototype._finish.call(this);
  if (isTraceHTTPEnabled() && typeof this._traceEventId === 'number') {
    var data = {
      url: this.req?.url,
      statusCode: this.statusCode
    };
    traceEnd(HTTP_SERVER_TRACE_EVENT_NAME, this._traceEventId, data);
  }
};
ServerResponse.prototype.statusCode = 200;
ServerResponse.prototype.statusMessage = undefined;
function onServerResponseClose() {
  // EventEmitter.emit makes a copy of the 'close' listeners array before
  // calling the listeners. detachSocket() unregisters onServerResponseClose
  // but if detachSocket() is called, directly or indirectly, by a 'close'
  // listener, onServerResponseClose is still in that copy of the listeners
  // array. That is, in the example below, b still gets called even though
  // it's been removed by a:
  //
  //   const EventEmitter = require('events');
  //   const obj = new EventEmitter();
  //   obj.on('event', a);
  //   obj.on('event', b);
  //   function a() { obj.removeListener('event', b) }
  //   function b() { throw "BAM!" }
  //   obj.emit('event');  // throws
  //
  // Ergo, we need to deal with stale 'close' events and handle the case
  // where the ServerResponse object has already been deconstructed.
  // Fortunately, that requires only a single if check. :-)
  if (this._httpMessage) {
    emitCloseNT(this._httpMessage);
  }
}
ServerResponse.prototype.assignSocket = function assignSocket(socket) {
  if (socket._httpMessage) {
    throw new ERR_HTTP_SOCKET_ASSIGNED();
  }
  socket._httpMessage = this;
  socket.on('close', onServerResponseClose);
  this.socket = socket;
  this.emit('socket', socket);
  this._flush();
};
ServerResponse.prototype.detachSocket = function detachSocket(socket) {
  assert(socket._httpMessage === this);
  socket.removeListener('close', onServerResponseClose);
  socket._httpMessage = null;
  this.socket = null;
};
ServerResponse.prototype.writeInformation = function writeInformation(statusCode, headers, cb) {
  if (this._header) {
    throw new ERR_HTTP_HEADERS_SENT('write');
  }
  validateInteger(statusCode, 'statusCode', 100, 199);
  if (statusCode === 101) {
    throw new ERR_HTTP_INVALID_STATUS_CODE(statusCode);
  }
  var statusMessage = STATUS_CODES[statusCode] || 'unknown';
  var head = `HTTP/1.1 ${statusCode} ${statusMessage}\r\n`;
  var lenient = this._isLenientHeaderValidation();
  if (headers !== undefined && headers !== null) {
    if (ArrayIsArray(headers)) {
      if (headers.length && ArrayIsArray(headers[0])) {
        for (var i = 0; i < headers.length; i++) {
          var entry = headers[i];
          head += processInformationHeader(entry[0], entry[1], lenient);
        }
      } else {
        if (headers.length % 2 !== 0) {
          throw new ERR_INVALID_ARG_VALUE('headers', headers);
        }
        for (var _i = 0; _i < headers.length; _i += 2) {
          head += processInformationHeader(headers[_i], headers[_i + 1], lenient);
        }
      }
    } else {
      validateObject(headers, 'headers');
      var keys = ObjectKeys(headers);
      for (var _i2 = 0; _i2 < keys.length; _i2++) {
        var key = keys[_i2];
        head += processInformationHeader(key, headers[key], lenient);
      }
    }
  }
  head += '\r\n';
  return this._writeRaw(head, 'ascii', cb);
};
function processInformationHeader(name, value, lenient) {
  validateHeaderName(name);
  validateHeaderValue(name, value, lenient);
  return `${name}: ${value}\r\n`;
}
ServerResponse.prototype.writeContinue = function writeContinue(cb) {
  this.writeInformation(100, null, cb);
  this._sent100 = true;
};
ServerResponse.prototype.writeProcessing = function writeProcessing(cb) {
  this.writeInformation(102, null, cb);
};
ServerResponse.prototype.writeEarlyHints = function writeEarlyHints(hints, cb) {
  validateObject(hints, 'hints');
  if (hints.link === null || hints.link === undefined) {
    return;
  }
  var link = validateLinkHeaderValue(hints.link);
  if (link.length === 0) {
    return;
  }
  if (checkInvalidHeaderChar(link)) {
    throw new ERR_INVALID_CHAR('header content', 'Link');
  }
  var headers = {
    __proto__: null,
    Link: link
  };
  var keys = ObjectKeys(hints);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key !== 'link') {
      headers[key] = hints[key];
    }
  }
  this.writeInformation(103, headers, cb);
};
ServerResponse.prototype._implicitHeader = function _implicitHeader() {
  this.writeHead(this.statusCode);
};
ServerResponse.prototype.writeHead = writeHead;
function writeHead(statusCode, reason, obj) {
  if (this._header) {
    throw new ERR_HTTP_HEADERS_SENT('write');
  }
  var originalStatusCode = statusCode;
  statusCode |= 0;
  if (statusCode < 100 || statusCode > 999) {
    throw new ERR_HTTP_INVALID_STATUS_CODE(originalStatusCode);
  }
  if (typeof reason === 'string') {
    // writeHead(statusCode, reasonPhrase[, headers])
    this.statusMessage = reason;
  } else {
    // writeHead(statusCode[, headers])
    this.statusMessage ||= STATUS_CODES[statusCode] || 'unknown';
    obj ??= reason;
  }
  this.statusCode = statusCode;
  var headers;
  if (this[kOutHeaders]) {
    // Slow-case: when progressive API and header fields are passed.
    var k;
    if (ArrayIsArray(obj)) {
      if (obj.length % 2 !== 0) {
        throw new ERR_INVALID_ARG_VALUE('headers', obj);
      }

      // Headers in obj should override previous headers but still
      // allow explicit duplicates. To do so, we first remove any
      // existing conflicts, then use appendHeader.

      for (var n = 0; n < obj.length; n += 2) {
        k = obj[n + 0];
        this.removeHeader(k);
      }
      for (var _n = 0; _n < obj.length; _n += 2) {
        k = obj[_n + 0];
        if (k) this.appendHeader(k, obj[_n + 1]);
      }
    } else if (obj) {
      var keys = ObjectKeys(obj);
      // Retain for(;;) loop for performance reasons
      // Refs: https://github.com/nodejs/node/pull/30958
      for (var i = 0; i < keys.length; i++) {
        k = keys[i];
        if (k) this.setHeader(k, obj[k]);
      }
    }
    // Only progressive api is used
    headers = this[kOutHeaders];
  } else {
    // Only writeHead() called
    headers = obj;
  }
  if (checkInvalidHeaderChar(this.statusMessage)) throw new ERR_INVALID_CHAR('statusMessage');
  var statusLine = `HTTP/1.1 ${statusCode} ${this.statusMessage}\r\n`;
  if (statusCode === 204 || statusCode === 304 || statusCode >= 100 && statusCode <= 199) {
    // RFC 2616, 10.2.5:
    // The 204 response MUST NOT include a message-body, and thus is always
    // terminated by the first empty line after the header fields.
    // RFC 2616, 10.3.5:
    // The 304 response MUST NOT contain a message-body, and thus is always
    // terminated by the first empty line after the header fields.
    // RFC 2616, 10.1 Informational 1xx:
    // This class of status code indicates a provisional response,
    // consisting only of the Status-Line and optional headers, and is
    // terminated by an empty line.
    this._hasBody = false;
  }

  // Don't keep alive connections where the client expects 100 Continue
  // but we sent a final status; they may put extra bytes on the wire.
  if (this._expect_continue && !this._sent100) {
    this.shouldKeepAlive = false;
  }
  this._storeHeader(statusLine, headers);
  return this;
}
function storeHTTPOptions(options) {
  this[kIncomingMessage] = options.IncomingMessage || IncomingMessage;
  this[kServerResponse] = options.ServerResponse || ServerResponse;
  var maxHeaderSize = options.maxHeaderSize;
  if (maxHeaderSize !== undefined) validateInteger(maxHeaderSize, 'maxHeaderSize', 0);
  this.maxHeaderSize = maxHeaderSize;
  var optimizeEmptyRequests = options.optimizeEmptyRequests;
  if (optimizeEmptyRequests !== undefined) validateBoolean(optimizeEmptyRequests, 'options.optimizeEmptyRequests');
  this[kOptimizeEmptyRequests] = optimizeEmptyRequests || false;
  var insecureHTTPParser = options.insecureHTTPParser;
  if (insecureHTTPParser !== undefined) validateBoolean(insecureHTTPParser, 'options.insecureHTTPParser');
  this.insecureHTTPParser = insecureHTTPParser;
  var httpValidation = options.httpValidation;
  if (httpValidation !== undefined) {
    validateOneOf(httpValidation, 'options.httpValidation', ['strict', 'relaxed', 'insecure']);
    if (insecureHTTPParser !== undefined) {
      throw new ERR_INVALID_ARG_VALUE('options.httpValidation', httpValidation, 'cannot be used together with options.insecureHTTPParser');
    }
  }
  this.httpValidation = httpValidation;
  var requestTimeout = options.requestTimeout;
  if (requestTimeout !== undefined) {
    validateInteger(requestTimeout, 'requestTimeout', 0);
    this.requestTimeout = requestTimeout;
  } else {
    this.requestTimeout = 300_000; // 5 minutes
  }
  var headersTimeout = options.headersTimeout;
  if (headersTimeout !== undefined) {
    validateInteger(headersTimeout, 'headersTimeout', 0);
    this.headersTimeout = headersTimeout;
  } else {
    this.headersTimeout = MathMin(60_000, this.requestTimeout); // Minimum between 60 seconds or requestTimeout
  }
  if (this.requestTimeout > 0 && this.headersTimeout > 0 && this.headersTimeout > this.requestTimeout) {
    throw new ERR_OUT_OF_RANGE('headersTimeout', '<= requestTimeout', headersTimeout);
  }
  var keepAliveTimeout = options.keepAliveTimeout;
  if (keepAliveTimeout !== undefined) {
    validateInteger(keepAliveTimeout, 'keepAliveTimeout', 0);
    this.keepAliveTimeout = keepAliveTimeout;
  } else {
    this.keepAliveTimeout = 65_000; // 65 seconds;
  }
  var keepAliveTimeoutBuffer = options.keepAliveTimeoutBuffer;
  if (keepAliveTimeoutBuffer !== undefined) {
    validateInteger(keepAliveTimeoutBuffer, 'keepAliveTimeoutBuffer', 0);
    this.keepAliveTimeoutBuffer = keepAliveTimeoutBuffer;
  } else {
    this.keepAliveTimeoutBuffer = 1000;
  }
  var connectionsCheckingInterval = options.connectionsCheckingInterval;
  if (connectionsCheckingInterval !== undefined) {
    validateInteger(connectionsCheckingInterval, 'connectionsCheckingInterval', 0);
    this.connectionsCheckingInterval = connectionsCheckingInterval;
  } else {
    this.connectionsCheckingInterval = 30_000; // 30 seconds
  }
  var requireHostHeader = options.requireHostHeader;
  if (requireHostHeader !== undefined) {
    validateBoolean(requireHostHeader, 'options.requireHostHeader');
    this.requireHostHeader = requireHostHeader;
  } else {
    this.requireHostHeader = true;
  }
  var joinDuplicateHeaders = options.joinDuplicateHeaders;
  if (joinDuplicateHeaders !== undefined) {
    validateBoolean(joinDuplicateHeaders, 'options.joinDuplicateHeaders');
  }
  this.joinDuplicateHeaders = joinDuplicateHeaders;
  var rejectNonStandardBodyWrites = options.rejectNonStandardBodyWrites;
  if (rejectNonStandardBodyWrites !== undefined) {
    validateBoolean(rejectNonStandardBodyWrites, 'options.rejectNonStandardBodyWrites');
    this.rejectNonStandardBodyWrites = rejectNonStandardBodyWrites;
  } else {
    this.rejectNonStandardBodyWrites = false;
  }
  var shouldUpgradeCallback = options.shouldUpgradeCallback;
  if (shouldUpgradeCallback !== undefined) {
    validateFunction(shouldUpgradeCallback, 'options.shouldUpgradeCallback');
    this.shouldUpgradeCallback = shouldUpgradeCallback;
  } else {
    this.shouldUpgradeCallback = function () {
      return this.listenerCount('upgrade') > 0;
    };
  }
}
function setupConnectionsTracking() {
  // Start connection handling
  this[kConnections] ||= new ConnectionsList();
  if (this[kConnectionsCheckingInterval]) {
    clearInterval(this[kConnectionsCheckingInterval]);
  }
  // This checker is started without checking whether any headersTimeout or requestTimeout is non zero
  // otherwise it would not be started if such timeouts are modified after createServer.
  this[kConnectionsCheckingInterval] = setInterval(checkConnections.bind(this), this.connectionsCheckingInterval).unref();
}
function httpServerPreClose(server) {
  server.closeIdleConnections();
  clearInterval(server[kConnectionsCheckingInterval]);
}
function Server(options, requestListener) {
  if (!(this instanceof Server)) return new Server(options, requestListener);
  if (typeof options === 'function') {
    requestListener = options;
    options = kEmptyObject;
  } else if (options == null) {
    options = kEmptyObject;
  } else {
    validateObject(options, 'options');
  }
  storeHTTPOptions.call(this, options);
  net.Server.call(this, {
    allowHalfOpen: true,
    noDelay: options.noDelay ?? true,
    keepAlive: options.keepAlive,
    keepAliveInitialDelay: options.keepAliveInitialDelay,
    highWaterMark: options.highWaterMark
  });
  if (requestListener) {
    this.on('request', requestListener);
  }

  // Similar option to this. Too lazy to write my own docs.
  // http://www.squid-cache.org/Doc/config/half_closed_clients/
  // https://wiki.squid-cache.org/SquidFaq/InnerWorkings#What_is_a_half-closed_filedescriptor.3F
  this.httpAllowHalfOpen = false;
  this.on('connection', connectionListener);
  this.on('listening', setupConnectionsTracking);
  this.timeout = 0;
  this.maxHeadersCount = null;
  this.maxRequestsPerSocket = 0;
  this[kUniqueHeaders] = parseUniqueHeadersOption(options.uniqueHeaders);
}
ObjectSetPrototypeOf(Server.prototype, net.Server.prototype);
ObjectSetPrototypeOf(Server, net.Server);
Server.prototype.close = function close() {
  httpServerPreClose(this);
  ReflectApply(net.Server.prototype.close, this, arguments);
  return this;
};
Server.prototype[SymbolAsyncDispose] = assignFunctionName(SymbolAsyncDispose, _async(function () {
  var _this = this;
  return _awaitIgnored(promisify(_this.close).call(_this));
}));
Server.prototype.closeAllConnections = function closeAllConnections() {
  if (!this[kConnections]) {
    return;
  }
  var connections = this[kConnections].all();
  for (var i = 0, l = connections.length; i < l; i++) {
    connections[i].socket.destroy();
  }
};
Server.prototype.closeIdleConnections = function closeIdleConnections() {
  if (!this[kConnections]) {
    return;
  }
  var connections = this[kConnections].idle();
  for (var i = 0, l = connections.length; i < l; i++) {
    if (connections[i].socket._httpMessage && !connections[i].socket._httpMessage.finished) {
      continue;
    }
    connections[i].socket.destroy();
  }
};
Server.prototype.setTimeout = function setTimeout(msecs, callback) {
  this.timeout = msecs;
  if (callback) this.on('timeout', callback);
  return this;
};
Server.prototype[EE.captureRejectionSymbol] = assignFunctionName(EE.captureRejectionSymbol, function (err, event) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  switch (event) {
    case 'request':
      {
        var {
          1: res
        } = args;
        if (!res.headersSent && !res.writableEnded) {
          // Don't leak headers.
          var names = res.getHeaderNames();
          for (var i = 0; i < names.length; i++) {
            res.removeHeader(names[i]);
          }
          res.statusCode = 500;
          res.end(STATUS_CODES[500]);
        } else {
          res.destroy();
        }
        break;
      }
    default:
      ReflectApply(net.Server.prototype[SymbolFor('nodejs.rejection')], this, arguments);
  }
});
function checkConnections() {
  if (this.headersTimeout === 0 && this.requestTimeout === 0) {
    return;
  }
  var expired = this[kConnections].expired(this.headersTimeout, this.requestTimeout);
  for (var i = 0; i < expired.length; i++) {
    var socket = expired[i].socket;
    if (socket) {
      onRequestTimeout(socket);
    }
  }
}
function connectionListener(socket) {
  defaultTriggerAsyncIdScope(getOrSetAsyncId(socket), connectionListenerInternal, this, socket);
}
function connectionListenerInternal(server, socket) {
  debug('SERVER new http connection');

  // Ensure that the server property of the socket is correctly set.
  // See https://github.com/nodejs/node/issues/13435
  socket.server = server;

  // If the user has added a listener to the server,
  // request, or response, then it's their responsibility.
  // otherwise, destroy on timeout by default
  if (server.timeout && typeof socket.setTimeout === 'function') socket.setTimeout(server.timeout);
  socket.on('timeout', socketOnTimeout);
  var parser = parsers.alloc();
  var lenientFlags = calculateLenientFlags(server.httpValidation, server.insecureHTTPParser);

  // TODO(addaleax): This doesn't play well with the
  // `async_hooks.currentResource()` proposal, see
  // https://github.com/nodejs/node/pull/21313
  parser.initialize(HTTPParser.REQUEST, new HTTPServerAsyncResource('HTTPINCOMINGMESSAGE', socket), server.maxHeaderSize || 0, lenientFlags, server[kConnections]);
  parser.socket = socket;
  socket.parser = parser;

  // Propagate headers limit from server instance to parser
  if (typeof server.maxHeadersCount === 'number') {
    parser.maxHeaderPairs = server.maxHeadersCount << 1;
  }
  var state = {
    onData: null,
    onEnd: null,
    onClose: null,
    onDrain: null,
    outgoing: [],
    incoming: [],
    // `outgoingData` is an approximate amount of bytes queued through all
    // inactive responses. If more data than the high watermark is queued - we
    // need to pause TCP socket/HTTP parser, and wait until the data will be
    // sent to the client.
    outgoingData: 0,
    requestsCount: 0,
    keepAliveTimeoutSet: false
  };
  state.onData = socketOnData.bind(undefined, server, socket, parser, state);
  state.onEnd = socketOnEnd.bind(undefined, server, socket, parser, state);
  state.onClose = socketOnClose.bind(undefined, socket, state);
  state.onDrain = socketOnDrain.bind(undefined, socket, state);
  socket.on('data', state.onData);
  socket.on('error', socketOnError);
  socket.on('end', state.onEnd);
  socket.on('close', state.onClose);
  socket.on('drain', state.onDrain);
  parser.onIncoming = parserOnIncoming.bind(undefined, server, socket, state);

  // We are consuming socket, so it won't get any actual data
  socket.on('resume', onSocketResume);
  socket.on('pause', onSocketPause);

  // Overrides to unconsume on `data`, `readable` listeners
  socket.on = generateSocketListenerWrapper('on');
  socket.addListener = generateSocketListenerWrapper('addListener');
  socket.prependListener = generateSocketListenerWrapper('prependListener');
  socket.setEncoding = socketSetEncoding;

  // We only consume the socket if it has never been consumed before.
  if (socket._handle?.isStreamBase && !socket._handle._consumed) {
    parser._consumed = true;
    socket._handle._consumed = true;
    parser.consume(socket._handle);
  }
  parser[kOnExecute] = onParserExecute.bind(undefined, server, socket, parser, state);
  parser[kOnTimeout] = onParserTimeout.bind(undefined, server, socket);
  socket._paused = false;
}
function socketSetEncoding() {
  throw new ERR_HTTP_SOCKET_ENCODING();
}
function updateOutgoingData(socket, state, delta) {
  state.outgoingData += delta;
  socketOnDrain(socket, state);
}
function socketOnDrain(socket, state) {
  var needPause = state.outgoingData > socket.writableHighWaterMark;

  // If we previously paused, then start reading again.
  if (socket._paused && !needPause) {
    socket._paused = false;
    if (socket.parser) socket.parser.resume();
    socket.resume();
  }
  var msg = socket._httpMessage;
  // Only emit 'drain' once the message has no data pending anywhere, so that
  // msg.writableLength === 0 when the event fires. socketOnDrain is called
  // synchronously from updateOutgoingData during _flushOutput, at which point
  // the bytes we just handed to the socket (or the stale outputSize) mean
  // the message is not actually drained yet - we wait for the socket's
  // own 'drain' event instead.
  if (msg && !msg.finished && msg[kNeedDrain] && msg.writableLength === 0) {
    msg[kNeedDrain] = false;
    msg.emit('drain');
  }
}
function socketOnTimeout() {
  var req = this.parser?.incoming;
  var reqTimeout = req && !req.complete && req.emit('timeout', this);
  var res = this._httpMessage;
  var resTimeout = res && res.emit('timeout', this);
  var serverTimeout = this.server.emit('timeout', this);
  if (!reqTimeout && !resTimeout && !serverTimeout) this.destroy();
}
function socketOnClose(socket, state) {
  debug('server socket close');
  freeParser(socket.parser, null, socket);
  abortIncoming(state.incoming);
  abortOutgoing(state.outgoing);
}
function abortIncoming(incoming) {
  while (incoming.length) {
    var req = incoming.shift();
    req.destroy(new ConnResetException('aborted'));
  }
}
function abortOutgoing(outgoing) {
  while (outgoing.length) {
    var req = outgoing.shift();
    req.destroy(new ConnResetException('aborted'));
  }
}
function socketOnEnd(server, socket, parser, state) {
  var ret = parser.finish();
  if (ret instanceof Error) {
    debug('parse error');
    // socketOnError has additional logic and will call socket.destroy(err).
    socketOnError.call(socket, ret);
  } else if (!server.httpAllowHalfOpen) {
    socket.end();
  } else if (state.outgoing.length) {
    state.outgoing[state.outgoing.length - 1]._last = true;
  } else if (socket._httpMessage) {
    socket._httpMessage._last = true;
  } else {
    socket.end();
  }
}
function socketOnData(server, socket, parser, state, d) {
  assert(!socket._paused);
  debug('SERVER socketOnData %d', d.length);
  var ret = parser.execute(d);
  onParserExecuteCommon(server, socket, parser, state, ret, d);
}
function onRequestTimeout(socket) {
  // socketOnError has additional logic and will call socket.destroy(err).
  socketOnError.call(socket, new ERR_HTTP_REQUEST_TIMEOUT());
}
function onParserExecute(server, socket, parser, state, ret) {
  // When underlying `net.Socket` instance is consumed - no
  // `data` events are emitted, and thus `socket.setTimeout` fires the
  // callback even if the data is constantly flowing into the socket.
  // See, https://github.com/nodejs/node/commit/ec2822adaad76b126b5cccdeaa1addf2376c9aa6
  socket._unrefTimer();
  debug('SERVER socketOnParserExecute %d', ret);
  onParserExecuteCommon(server, socket, parser, state, ret, undefined);
}
function onParserTimeout(server, socket) {
  var serverTimeout = server.emit('timeout', socket);
  if (!serverTimeout) socket.destroy();
}
var noop = () => {};
var badRequestResponse = Buffer.from(`HTTP/1.1 400 ${STATUS_CODES[400]}\r\n` + 'Connection: close\r\n\r\n', 'ascii');
var requestTimeoutResponse = Buffer.from(`HTTP/1.1 408 ${STATUS_CODES[408]}\r\n` + 'Connection: close\r\n\r\n', 'ascii');
var requestHeaderFieldsTooLargeResponse = Buffer.from(`HTTP/1.1 431 ${STATUS_CODES[431]}\r\n` + 'Connection: close\r\n\r\n', 'ascii');
var requestChunkExtensionsTooLargeResponse = Buffer.from(`HTTP/1.1 413 ${STATUS_CODES[413]}\r\n` + 'Connection: close\r\n\r\n', 'ascii');
function socketOnError(e) {
  // Ignore further errors
  this.removeListener('error', socketOnError);
  if (this.listenerCount('error', noop) === 0) {
    this.on('error', noop);
  }
  if (!this.server.emit('clientError', e, this)) {
    // Caution must be taken to avoid corrupting the remote peer.
    // Reply an error segment if there is no in-flight `ServerResponse`,
    // or no data of the in-flight one has been written yet to this socket.
    if (this.writable && (!this._httpMessage || !this._httpMessage._headerSent)) {
      var response;
      switch (e.code) {
        case 'HPE_HEADER_OVERFLOW':
          response = requestHeaderFieldsTooLargeResponse;
          break;
        case 'HPE_CHUNK_EXTENSIONS_OVERFLOW':
          response = requestChunkExtensionsTooLargeResponse;
          break;
        case 'ERR_HTTP_REQUEST_TIMEOUT':
          response = requestTimeoutResponse;
          break;
        default:
          response = badRequestResponse;
          break;
      }
      this.write(response);
    }
    this.destroy(e);
  }
}
var UpgradeStream = /*#__PURE__*/function (_Duplex) {
  function UpgradeStream(socket, req) {
    var _this2;
    _classCallCheck(this, UpgradeStream);
    _this2 = _callSuper(this, UpgradeStream, [{
      allowHalfOpen: socket.allowHalfOpen
    }]);
    _this2[kSocket] = socket;
    _this2[kIncomingMessage] = req;

    // Proxy error, end & closure events immediately.
    socket.on('error', err => _this2.destroy(err));
    socket.on('close', () => _this2.destroy());
    _this2.on('close', () => socket.destroy());
    socket.on('end', () => {
      _this2.push(null);

      // Match the socket behaviour, where 'end' will fire despite no 'data'
      // listeners if a socket with no pending data ends:
      if (_this2.readableLength === 0) {
        _this2.resume();
      }
    });

    // Other events (most notably, reading) all only
    // activate after requestBodyCompleted is called.
    return _this2;
  }
  _inherits(UpgradeStream, _Duplex);
  return _createClass(UpgradeStream, [{
    key: "requestBodyCompleted",
    value: function requestBodyCompleted(upgradeHead) {
      this[kIncomingMessage] = null;

      // When the request body is completed, we begin streaming all the
      // post-body data for the upgraded protocol:
      if (upgradeHead?.length > 0) {
        if (!this.push(upgradeHead)) {
          this[kSocket].pause();
        }
      }
      this[kSocket].on('data', data => {
        if (!this.push(data)) {
          this[kSocket].pause();
        }
      });
    }
  }, {
    key: "_read",
    value: function _read(size) {
      // Reading the upgrade stream starts the request stream flowing. It's
      // important that this happens, even if there are no listeners, or it
      // would be impossible to read this without explicitly reading all the
      // request body first, which is backward incompatible & awkward.
      this[kIncomingMessage]?.resume();
      this[kSocket].resume();
    }
  }, {
    key: "_final",
    value: function _final(callback) {
      this[kSocket].end(callback);
    }
  }, {
    key: "_write",
    value: function _write(chunk, encoding, callback) {
      this[kSocket].write(chunk, encoding, callback);
    }
  }, {
    key: "_destroy",
    value: function _destroy(err, callback) {
      this[kSocket].destroy(err);
      callback(err);
    }
  }]);
}(Duplex);
function onParserExecuteCommon(server, socket, parser, state, ret, d) {
  if (ret instanceof Error) {
    prepareError(ret, parser, d);
    debug('parse error', ret);
    socketOnError.call(socket, ret);
  } else if (parser.incoming?.upgrade) {
    // Upgrade or CONNECT
    var req = parser.incoming;
    debug('SERVER upgrade or connect', req.method);
    var eventName = req.method === 'CONNECT' ? 'connect' : 'upgrade';
    var upgradeStream;
    if (req.complete) {
      d ||= parser.getCurrentBuffer();
      socket.removeListener('data', state.onData);
      socket.removeListener('end', state.onEnd);
      socket.removeListener('close', state.onClose);
      socket.removeListener('drain', state.onDrain);
      socket.removeListener('error', socketOnError);
      socket.removeListener('timeout', socketOnTimeout);
      unconsume(parser, socket);
      parser.finish();
      freeParser(parser, req, socket);
      parser = null;

      // If the request is complete (no body, or all body read upfront) then
      // we just emit the socket directly as the upgrade stream.
      upgradeStream = socket;
    } else {
      // If the body hasn't been fully parsed yet, we emit immediately but
      // we add a wrapper around the socket to not expose incoming data
      // until the request body has finished.

      if (socket[kUpgradeStream]) {
        // We've already emitted the incomplete upgrade - nothing do to
        // until actual body parsing completion.
        return;
      }
      d ||= Buffer.alloc(0);
      upgradeStream = new UpgradeStream(socket, req);
      socket[kUpgradeStream] = upgradeStream;
    }
    if (server.listenerCount(eventName) > 0) {
      debug('SERVER have listener for %s', eventName);
      var bodyHead = d.slice(ret, d.length);
      if (req.complete && socket[kUpgradeStream]) {
        // Previously emitted, now completed - just activate the stream
        socket[kUpgradeStream].requestBodyCompleted(bodyHead);
      } else {
        socket.readableFlowing = null;
        server.emit(eventName, req, upgradeStream, bodyHead);
      }
    } else {
      // Got upgrade or CONNECT method, but have no handler.
      socket.destroy();
    }
  } else if (parser.incoming && parser.incoming.method === 'PRI') {
    debug('SERVER got PRI request');
    socket.destroy();
  }
  if (socket._paused && socket.parser) {
    // onIncoming paused the socket, we should pause the parser as well
    debug('pause parser');
    socket.parser.pause();
  }
}
function clearIncoming(req) {
  req ||= this;
  var parser = req.socket?.parser;
  // Reset the .incoming property so that the request object can be gc'ed.
  if (parser && parser.incoming === req) {
    if (req.readableEnded) {
      parser.incoming = null;
    } else {
      req.on('end', clearIncoming);
    }
  }
}
function resOnFinish(req, res, socket, state, server) {
  if (onResponseFinishChannel.hasSubscribers) {
    onResponseFinishChannel.publish({
      request: req,
      response: res,
      socket,
      server
    });
  }

  // Usually the first incoming element should be our request.  it may
  // be that in the case abortIncoming() was called that the incoming
  // array will be empty.
  assert(state.incoming.length === 0 || state.incoming[0] === req);
  state.incoming.shift();

  // If the user never called req.read(), and didn't pipe() or
  // .resume() or .on('data'), then we call req._dump() so that the
  // bytes will be pulled off the wire.
  if (!req._consuming && !req._readableState.resumeScheduled) req._dump();
  res.detachSocket(socket);
  clearIncoming(req);
  process.nextTick(emitCloseNT, res);
  if (res._last) {
    if (typeof socket.destroySoon === 'function') {
      socket.destroySoon();
    } else {
      socket.end();
    }
  } else if (state.outgoing.length === 0) {
    var keepAliveTimeout = NumberIsFinite(server.keepAliveTimeout) && server.keepAliveTimeout >= 0 ? server.keepAliveTimeout : 0;
    var keepAliveTimeoutBuffer = NumberIsFinite(server.keepAliveTimeoutBuffer) && server.keepAliveTimeoutBuffer >= 0 ? server.keepAliveTimeoutBuffer : 1e3;
    if (keepAliveTimeout && typeof socket.setTimeout === 'function') {
      // Extend the internal timeout by the configured buffer to reduce
      // the likelihood of ECONNRESET errors.
      // This allows fine-tuning beyond the advertised keepAliveTimeout.
      socket.setTimeout(keepAliveTimeout + keepAliveTimeoutBuffer);
      state.keepAliveTimeoutSet = true;
    }
  } else {
    // Start sending the next message
    var m = state.outgoing.shift();
    if (m) {
      m.assignSocket(socket);
    }
  }
}
function emitCloseNT(self) {
  if (!self._closed) {
    self.destroyed = true;
    self._closed = true;
    self.emit('close');
  }
}
function hasBodyHeaders(headers) {
  return 'content-length' in headers || 'transfer-encoding' in headers;
}

// The following callback is issued after the headers have been read on a
// new message. In this callback we setup the response object and pass it
// to the user.
function parserOnIncoming(server, socket, state, req, keepAlive) {
  resetSocketTimeout(server, socket, state);
  if (req.upgrade) {
    req.upgrade = req.method === 'CONNECT' || !!server.shouldUpgradeCallback(req);
    if (req.upgrade) {
      return 0;
    }
  }
  state.incoming.push(req);

  // If the writable end isn't consuming, then stop reading
  // so that we don't become overwhelmed by a flood of
  // pipelined requests that may never be resolved.
  if (!socket._paused) {
    var ws = socket._writableState;
    if (ws.needDrain || state.outgoingData >= socket.writableHighWaterMark) {
      socket._paused = true;
      // We also need to pause the parser, but don't do that until after
      // the call to execute, because we may still be processing the last
      // chunk.
      socket.pause();
    }
  }
  var res = new server[kServerResponse](req, {
    highWaterMark: socket.writableHighWaterMark,
    rejectNonStandardBodyWrites: server.rejectNonStandardBodyWrites
  });
  res._keepAliveTimeout = server.keepAliveTimeout;
  res._maxRequestsPerSocket = server.maxRequestsPerSocket;
  res._onPendingData = updateOutgoingData.bind(undefined, socket, state);
  res.shouldKeepAlive = keepAlive;
  res[kUniqueHeaders] = server[kUniqueHeaders];
  if (onRequestStartChannel.hasSubscribers) {
    onRequestStartChannel.publish({
      request: req,
      response: res,
      socket,
      server
    });
  }

  // Check if we should optimize empty requests (those without Content-Length or Transfer-Encoding headers)
  var shouldOptimize = server[kOptimizeEmptyRequests] === true && !hasBodyHeaders(req.headers);
  if (shouldOptimize) {
    // Fast processing where emitting 'data', 'end' and 'close' events is
    // skipped and data is dumped.
    // This avoids a lot of unnecessary overhead otherwise introduced by
    // stream.Readable life cycle rules. The downside is that this will
    // break some servers that read bodies for methods that don't have body headers.
    req._dumpAndCloseReadable();
    req._read();
  }
  if (socket._httpMessage) {
    // There are already pending outgoing res, append.
    state.outgoing.push(res);
  } else {
    res.assignSocket(socket);
  }

  // When we're finished writing the response, check if this is the last
  // response, if so destroy the socket.
  res.on('finish', resOnFinish.bind(undefined, req, res, socket, state, server));
  var handled = false;
  if (req.httpVersionMajor === 1 && req.httpVersionMinor === 1) {
    // From RFC 7230 5.4 https://datatracker.ietf.org/doc/html/rfc7230#section-5.4
    // A server MUST respond with a 400 (Bad Request) status code to any
    // HTTP/1.1 request message that lacks a Host header field
    if (server.requireHostHeader && req.headers.host === undefined) {
      res.writeHead(400, ['Connection', 'close']);
      res.end();
      return 0;
    }
    var isRequestsLimitSet = typeof server.maxRequestsPerSocket === 'number' && server.maxRequestsPerSocket > 0;
    if (isRequestsLimitSet) {
      state.requestsCount++;
      res.maxRequestsOnConnectionReached = server.maxRequestsPerSocket <= state.requestsCount;
    }
    if (isRequestsLimitSet && server.maxRequestsPerSocket < state.requestsCount) {
      handled = true;
      server.emit('dropRequest', req, socket);
      res.writeHead(503);
      res.end();
    } else if (req.headers.expect !== undefined) {
      handled = true;
      if (continueExpression.test(req.headers.expect)) {
        res._expect_continue = true;
        if (server.listenerCount('checkContinue') > 0) {
          server.emit('checkContinue', req, res);
        } else {
          res.writeContinue();
          server.emit('request', req, res);
        }
      } else if (server.listenerCount('checkExpectation') > 0) {
        server.emit('checkExpectation', req, res);
      } else {
        res.writeHead(417);
        res.end();
      }
    }
  }
  if (!handled) {
    server.emit('request', req, res);
  }
  return 0; // No special treatment.
}
function resetSocketTimeout(server, socket, state) {
  if (!state.keepAliveTimeoutSet) return;
  socket.setTimeout(server.timeout || 0);
  state.keepAliveTimeoutSet = false;
}
function onSocketResume() {
  // It may seem that the socket is resumed, but this is an enemy's trick to
  // deceive us! `resume` is emitted asynchronously, and may be called from
  // `incoming.readStart()`. Stop the socket again here, just to preserve the
  // state.
  //
  // We don't care about stream semantics for the consumed socket anyway.
  if (this._paused) {
    this.pause();
    return;
  }
  if (this._handle && !this._handle.reading) {
    this._handle.reading = true;
    this._handle.readStart();
  }
}
function onSocketPause() {
  if (this._handle?.reading) {
    this._handle.reading = false;
    this._handle.readStop();
  }
}
function unconsume(parser, socket) {
  if (socket._handle) {
    if (parser._consumed) parser.unconsume();
    parser._consumed = false;
    socket.removeListener('pause', onSocketPause);
    socket.removeListener('resume', onSocketResume);
  }
}
function generateSocketListenerWrapper(originalFnName) {
  return function socketListenerWrap(ev, fn) {
    var res = net.Socket.prototype[originalFnName].call(this, ev, fn);
    if (!this.parser) {
      this.on = net.Socket.prototype.on;
      this.addListener = net.Socket.prototype.addListener;
      this.prependListener = net.Socket.prototype.prependListener;
      return res;
    }
    if (ev === 'data' || ev === 'readable') unconsume(this.parser, this);
    return res;
  };
}
module.exports = {
  STATUS_CODES,
  Server,
  ServerResponse,
  setupConnectionsTracking,
  storeHTTPOptions,
  _connectionListener: connectionListener,
  kServerResponse,
  httpServerPreClose,
  kConnectionsCheckingInterval
};

