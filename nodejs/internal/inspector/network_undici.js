'use strict';

var {
  DateNow,
  StringPrototypeToLowerCase
} = primordials;
var {
  kInspectorRequestId,
  kResourceType,
  getMonotonicTime,
  getNextRequestId,
  registerDiagnosticChannels,
  sniffMimeType
} = require('internal/inspector/network');
var {
  Network
} = require('inspector');
var {
  Buffer
} = require('buffer');

// Convert an undici request headers array to a plain object (Map<string, string>)
function requestHeadersArrayToDictionary(headers) {
  var dict = {};
  var charset;
  var mimeType;
  for (var idx = 0; idx < headers.length; idx += 2) {
    var key = `${headers[idx]}`;
    var value = `${headers[idx + 1]}`;
    dict[key] = value;
    if (StringPrototypeToLowerCase(key) === 'content-type') {
      var result = sniffMimeType(value);
      charset = result.charset;
      mimeType = result.mimeType;
    }
  }
  return [dict, charset, mimeType];
}
;

// Convert an undici response headers array to a plain object (Map<string, string>)
function responseHeadersArrayToDictionary(headers) {
  var dict = {};
  var charset;
  var mimeType;
  for (var idx = 0; idx < headers.length; idx += 2) {
    var key = `${headers[idx]}`;
    var lowerCasedKey = StringPrototypeToLowerCase(key);
    var value = `${headers[idx + 1]}`;
    var prevValue = dict[key];
    if (lowerCasedKey === 'content-type') {
      var result = sniffMimeType(value);
      charset = result.charset;
      mimeType = result.mimeType;
    }
    if (typeof prevValue === 'string') {
      // ChromeDevTools frontend treats 'set-cookie' as a special case
      // https://github.com/ChromeDevTools/devtools-frontend/blob/4275917f84266ef40613db3c1784a25f902ea74e/front_end/core/sdk/NetworkRequest.ts#L1368
      if (lowerCasedKey === 'set-cookie') dict[key] = `${prevValue}\n${value}`;else dict[key] = `${prevValue}, ${value}`;
    } else {
      dict[key] = value;
    }
  }
  return [dict, charset, mimeType];
}
;

/**
 * When a client request starts, emit Network.requestWillBeSent event.
 * https://chromedevtools.github.io/devtools-protocol/1-3/Network/#event-requestWillBeSent
 * @param {{ request: undici.Request }} event
 */
function onClientRequestStart(_ref) {
  var {
    request
  } = _ref;
  var url = `${request.origin}${request.path}`;
  request[kInspectorRequestId] = getNextRequestId();
  var {
    0: headers,
    1: charset
  } = requestHeadersArrayToDictionary(request.headers);
  Network.requestWillBeSent({
    requestId: request[kInspectorRequestId],
    timestamp: getMonotonicTime(),
    wallTime: DateNow(),
    charset,
    request: {
      url,
      method: request.method,
      headers: headers,
      hasPostData: request.body != null
    }
  });
}

/**
 * When a client request errors, emit Network.loadingFailed event.
 * https://chromedevtools.github.io/devtools-protocol/1-3/Network/#event-loadingFailed
 * @param {{ request: undici.Request, error: any }} event
 */
function onClientRequestError(_ref2) {
  var {
    request,
    error
  } = _ref2;
  if (typeof request[kInspectorRequestId] !== 'string') {
    return;
  }
  Network.loadingFailed({
    requestId: request[kInspectorRequestId],
    timestamp: getMonotonicTime(),
    // TODO(legendecas): distinguish between `undici.request` and `undici.fetch`.
    type: kResourceType.Fetch,
    errorText: error.message
  });
}

/**
 * When a chunk of the request body is being sent, cache it until `getRequestPostData` request.
 * https://chromedevtools.github.io/devtools-protocol/1-3/Network/#method-getRequestPostData
 * @param {{ request: undici.Request, chunk: Uint8Array | string }} event
 */
function onClientRequestBodyChunkSent(_ref3) {
  var {
    request,
    chunk
  } = _ref3;
  if (typeof request[kInspectorRequestId] !== 'string') {
    return;
  }
  var buffer = Buffer.from(chunk);
  Network.dataSent({
    requestId: request[kInspectorRequestId],
    timestamp: getMonotonicTime(),
    dataLength: buffer.byteLength,
    data: buffer
  });
}

/**
 * Mark a request body as fully sent.
 * @param {{request: undici.Request}} event
 */
function onClientRequestBodySent(_ref4) {
  var {
    request
  } = _ref4;
  if (typeof request[kInspectorRequestId] !== 'string') {
    return;
  }
  Network.dataSent({
    requestId: request[kInspectorRequestId],
    finished: true
  });
}

/**
 * When response headers are received, emit Network.responseReceived event.
 * https://chromedevtools.github.io/devtools-protocol/1-3/Network/#event-responseReceived
 * @param {{ request: undici.Request, response: undici.Response }} event
 */
function onClientResponseHeaders(_ref5) {
  var {
    request,
    response
  } = _ref5;
  if (typeof request[kInspectorRequestId] !== 'string') {
    return;
  }
  var {
    0: headers,
    1: charset,
    2: mimeType
  } = responseHeadersArrayToDictionary(response.headers);
  var url = `${request.origin}${request.path}`;
  Network.responseReceived({
    requestId: request[kInspectorRequestId],
    timestamp: getMonotonicTime(),
    // TODO(legendecas): distinguish between `undici.request` and `undici.fetch`.
    type: kResourceType.Fetch,
    response: {
      url,
      status: response.statusCode,
      statusText: response.statusText,
      headers,
      mimeType,
      charset
    }
  });
}

/**
 * When a chunk of the response body has been received, cache it until `getResponseBody` request
 * https://chromedevtools.github.io/devtools-protocol/1-3/Network/#method-getResponseBody or
 * stream it with `streamResourceContent` request.
 * https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-streamResourceContent
 * @param {{ request: undici.Request, chunk: Uint8Array | string }} event
 */
function onClientRequestBodyChunkReceived(_ref6) {
  var {
    request,
    chunk
  } = _ref6;
  if (typeof request[kInspectorRequestId] !== 'string') {
    return;
  }
  Network.dataReceived({
    requestId: request[kInspectorRequestId],
    timestamp: getMonotonicTime(),
    dataLength: chunk.byteLength,
    encodedDataLength: chunk.byteLength,
    data: chunk
  });
}

/**
 * When a response is completed, emit Network.loadingFinished event.
 * https://chromedevtools.github.io/devtools-protocol/1-3/Network/#event-loadingFinished
 * @param {{ request: undici.Request, response: undici.Response }} event
 */
function onClientResponseFinish(_ref7) {
  var {
    request
  } = _ref7;
  if (typeof request[kInspectorRequestId] !== 'string') {
    return;
  }
  Network.loadingFinished({
    requestId: request[kInspectorRequestId],
    timestamp: getMonotonicTime()
  });
}

// TODO: Move Network.webSocketCreated to the actual creation time of the WebSocket.
// undici:websocket:open fires when the connection is established, but this results
// in an inaccurate stack trace.
function onWebSocketOpen(_ref8) {
  var {
    websocket,
    handshakeResponse
  } = _ref8;
  websocket[kInspectorRequestId] = getNextRequestId();
  var url = websocket.url.toString();
  Network.webSocketCreated({
    requestId: websocket[kInspectorRequestId],
    url
  });
  Network.webSocketHandshakeResponseReceived({
    requestId: websocket[kInspectorRequestId],
    timestamp: getMonotonicTime(),
    response: handshakeResponse
  });
}
function onWebSocketClose(_ref9) {
  var {
    websocket
  } = _ref9;
  if (typeof websocket[kInspectorRequestId] !== 'string') {
    return;
  }
  Network.webSocketClosed({
    requestId: websocket[kInspectorRequestId],
    timestamp: getMonotonicTime()
  });
}
module.exports = registerDiagnosticChannels([['undici:request:create', onClientRequestStart], ['undici:request:error', onClientRequestError], ['undici:request:headers', onClientResponseHeaders], ['undici:request:trailers', onClientResponseFinish], ['undici:request:bodyChunkSent', onClientRequestBodyChunkSent], ['undici:request:bodySent', onClientRequestBodySent], ['undici:request:bodyChunkReceived', onClientRequestBodyChunkReceived], ['undici:websocket:open', onWebSocketOpen], ['undici:websocket:close', onWebSocketClose]]);

