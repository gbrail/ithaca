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

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  MathMin,
  Symbol: _Symbol,
  Uint8Array
} = primordials;
var {
  setImmediate
} = require('timers');
var {
  methods,
  allMethods,
  HTTPParser
} = internalBinding('http_parser');
var {
  getOptionValue
} = require('internal/options');
var insecureHTTPParser = getOptionValue('--insecure-http-parser');
var FreeList = require('internal/freelist');
var incoming = require('_http_incoming');
var {
  IncomingMessage,
  readStart,
  readStop
} = incoming;
var kIncomingMessage = _Symbol('IncomingMessage');
var kSkipPendingData = _Symbol('SkipPendingData');
var kOnMessageBegin = HTTPParser.kOnMessageBegin | 0;
var kOnHeaders = HTTPParser.kOnHeaders | 0;
var kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0;
var kOnBody = HTTPParser.kOnBody | 0;
var kOnMessageComplete = HTTPParser.kOnMessageComplete | 0;
var kOnExecute = HTTPParser.kOnExecute | 0;
var kOnTimeout = HTTPParser.kOnTimeout | 0;
var MAX_HEADER_PAIRS = 2000;

// Only called in the slow case where slow means
// that the request headers were either fragmented
// across multiple TCP packets or too large to be
// processed in a single run. This method is also
// called to process trailing HTTP headers.
function parserOnHeaders(headers, url) {
  // Once we exceeded headers limit - stop collecting them
  var capacity = this.maxHeaderPairs - this._headers.length;
  if (this.maxHeaderPairs <= 0 || capacity >= headers.length) {
    var _this$_headers;
    (_this$_headers = this._headers).push.apply(_this$_headers, _toConsumableArray(headers));
  } else if (capacity > 0) {
    var _this$_headers2;
    (_this$_headers2 = this._headers).push.apply(_this$_headers2, _toConsumableArray(headers.slice(0, capacity)));
  }
  this._url += url;
}
var HTTP_VERSION_1_1 = '1.1';

// `headers` and `url` are set only if .onHeaders() has not been called for
// this request.
// `url` is not set for response parsers but that's not applicable here since
// all our parsers are request parsers.
function parserOnHeadersComplete(versionMajor, versionMinor, headers, method, url, statusCode, statusMessage, upgrade, shouldKeepAlive) {
  var parser = this;
  var {
    socket
  } = parser;
  if (headers === undefined) {
    headers = parser._headers;
    parser._headers = [];
  }
  if (url === undefined) {
    url = parser._url;
    parser._url = '';
  }

  // Parser is also used by http client
  var ParserIncomingMessage = socket?.server?.[kIncomingMessage] || IncomingMessage;
  var incoming = parser.incoming = new ParserIncomingMessage(socket);
  incoming.httpVersionMajor = versionMajor;
  incoming.httpVersionMinor = versionMinor;
  incoming.httpVersion = versionMajor === 1 && versionMinor === 1 ? HTTP_VERSION_1_1 : `${versionMajor}.${versionMinor}`;
  incoming.joinDuplicateHeaders = socket?.server?.joinDuplicateHeaders || parser.joinDuplicateHeaders;
  incoming.url = url;
  incoming.upgrade = upgrade;
  var n = headers.length;

  // If parser.maxHeaderPairs <= 0 assume that there's no limit.
  if (parser.maxHeaderPairs > 0) n = MathMin(n, parser.maxHeaderPairs);
  incoming._addHeaderLines(headers, n);
  if (typeof method === 'number') {
    // server only
    incoming.method = allMethods[method];
  } else {
    // client only
    incoming.statusCode = statusCode;
    incoming.statusMessage = statusMessage;
  }
  return parser.onIncoming(incoming, shouldKeepAlive);
}
function parserOnBody(b) {
  var stream = this.incoming;

  // If the stream has already been removed, then drop it.
  if (stream === null || stream[kSkipPendingData]) return;

  // Pretend this was the result of a stream._read call.
  if (!stream._dumped) {
    var ret = stream.push(b);
    if (!ret) readStop(this.socket);
  }
}
function parserOnMessageComplete() {
  var parser = this;
  var stream = parser.incoming;
  if (stream !== null && !stream[kSkipPendingData]) {
    stream.complete = true;
    // Emit any trailing headers.
    var headers = parser._headers;
    if (headers.length) {
      stream._addHeaderLines(headers, headers.length);
      parser._headers = [];
      parser._url = '';
    }

    // For emit end event
    stream.push(null);
  }

  // Force to read the next incoming message
  readStart(parser.socket);
}
var parsers = new FreeList('parsers', 1000, function parsersCb() {
  var parser = new HTTPParser();
  cleanParser(parser);
  parser[kOnHeaders] = parserOnHeaders;
  parser[kOnHeadersComplete] = parserOnHeadersComplete;
  parser[kOnBody] = parserOnBody;
  parser[kOnMessageComplete] = parserOnMessageComplete;
  return parser;
});
function closeParserInstance(parser) {
  parser.close();
}

// Free the parser and also break any links that it
// might have to any other things.
// TODO: All parser data should be attached to a
// single object, so that it can be easily cleaned
// up by doing `parser.data = {}`, which should
// be done in FreeList.free.  `parsers.free(parser)`
// should be all that is needed.
function freeParser(parser, req, socket) {
  if (parser) {
    if (parser._consumed) parser.unconsume();
    parser.remove();
    cleanParser(parser);
    if (parsers.free(parser) === false) {
      // Make sure the parser's stack has unwound before deleting the
      // corresponding C++ object through .close().
      setImmediate(closeParserInstance, parser);
    } else {
      // Since the Parser destructor isn't going to run the destroy() callbacks
      // it needs to be triggered manually.
      parser.free();
    }
  }
  if (req) {
    req.parser = null;
  }
  if (socket) {
    socket.parser = null;
  }
}

// Character code ranges for valid HTTP tokens
// Valid chars: ^_`a-zA-Z-0-9!#$%&'*+.|~
// Based on RFC 7230 Section 3.2.6 token definition
// See https://tools.ietf.org/html/rfc7230#section-3.2.6
var tokenRegExp = /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]+$/;
var validTokenChars = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 0-15
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 16-31
0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
// 32-47 (!"#$%&'()*+,-./)
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
// 48-63 (0-9:;<=>?)
0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 64-79 (@A-O)
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
// 80-95 (P-Z[\]^_)
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 96-111 (`a-o)
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0,
// 112-127 (p-z{|}~)
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 128-143
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 144-159
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 160-175
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 176-191
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 192-207
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 208-223
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 224-239
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 // 240-255
]);

/**
 * Verifies that the given val is a valid HTTP token
 * per the rules defined in RFC 7230
 * See https://tools.ietf.org/html/rfc7230#section-3.2.6
 * @param {string} val
 * @returns {boolean}
 */
function checkIsHttpToken(val) {
  if (val.length >= 10) {
    return tokenRegExp.test(val);
  }
  if (val.length === 0) return false;

  // Use lookup table for short strings, regex for longer ones
  for (var i = 0; i < val.length; i++) {
    if (!validTokenChars[val.charCodeAt(i)]) {
      return false;
    }
  }
  return true;
}

// Strict header value regex per RFC 7230 (original/default behavior):
// field-value = *( field-content / obs-fold )
// field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
// field-vchar = VCHAR / obs-text
// This rejects control characters (0x00-0x1f except HTAB) and DEL (0x7f).
var strictHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

// Lenient header value regex per Fetch spec (https://fetch.spec.whatwg.org/#header-value):
// - Must contain no 0x00 (NUL) or HTTP newline bytes (0x0a LF, 0x0d CR)
// - Must be byte sequences (0x00-0xff), not arbitrary unicode
// This allows most control characters except NUL, CR, and LF.
// eslint-disable-next-line no-control-regex
var lenientHeaderCharRegex = /[\x00\x0a\x0d]|[^\x00-\xff]/;

/**
 * True if val contains an invalid header value character.
 * By default uses strict validation per RFC 7230.
 * When lenient=true, uses relaxed validation per Fetch spec.
 * @param {string} val
 * @param {boolean} [lenient] - Use lenient validation (Fetch spec rules)
 * @returns {boolean}
 */
function checkInvalidHeaderChar(val) {
  var lenient = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var regex = lenient ? lenientHeaderCharRegex : strictHeaderCharRegex;
  return regex.test(val);
}
function cleanParser(parser) {
  parser._headers = [];
  parser._url = '';
  parser.socket = null;
  parser.incoming = null;
  parser.outgoing = null;
  parser.maxHeaderPairs = MAX_HEADER_PAIRS;
  parser[kOnMessageBegin] = null;
  parser[kOnExecute] = null;
  parser[kOnTimeout] = null;
  parser._consumed = false;
  parser.onIncoming = null;
  parser.joinDuplicateHeaders = null;
}
function prepareError(err, parser, rawPacket) {
  err.rawPacket = rawPacket || parser.getCurrentBuffer();
  if (typeof err.reason === 'string') err.message = `Parse Error: ${err.reason}`;
}
var warnedLenient = false;
function isLenient() {
  if (insecureHTTPParser && !warnedLenient) {
    warnedLenient = true;
    process.emitWarning('Using insecure HTTP parsing');
  }
  return insecureHTTPParser;
}
function calculateLenientFlags(httpValidation, insecureHTTPParserOption) {
  if (httpValidation === 'strict') {
    return HTTPParser.kLenientNone | 0;
  } else if (httpValidation === 'relaxed') {
    return HTTPParser.kLenientHeaderValueRelaxed | 0;
  } else if (httpValidation === 'insecure') {
    return HTTPParser.kLenientAll | 0;
  }
  var lenient = insecureHTTPParserOption === undefined ? isLenient() : insecureHTTPParserOption;
  return lenient ? HTTPParser.kLenientAll | 0 : HTTPParser.kLenientNone | 0;
}
module.exports = {
  _checkInvalidHeaderChar: checkInvalidHeaderChar,
  _checkIsHttpToken: checkIsHttpToken,
  chunkExpression: /(?:^|\W)chunked(?:$|\W)/i,
  continueExpression: /(?:^|\W)100-continue(?:$|\W)/i,
  CRLF: '\r\n',
  // TODO: Deprecate this.
  freeParser,
  methods,
  parsers,
  kIncomingMessage,
  HTTPParser,
  isLenient,
  calculateLenientFlags,
  prepareError,
  kSkipPendingData
};

