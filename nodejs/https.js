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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypeIndexOf,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  FunctionPrototypeCall,
  JSONStringify,
  NumberParseInt,
  ObjectAssign,
  ObjectSetPrototypeOf,
  ReflectApply,
  ReflectConstruct,
  SymbolAsyncDispose
} = primordials;
var {
  assertCrypto,
  kEmptyObject,
  promisify,
  once
} = require('internal/util');
var {
  ERR_PROXY_TUNNEL
} = require('internal/errors').codes;
assertCrypto();
var tls = require('tls');
var {
  kProxyConfig,
  checkShouldUseProxy,
  kWaitForProxyTunnel,
  getGlobalAgent
} = require('internal/http');
var {
  Agent: HttpAgent
} = require('_http_agent');
var {
  httpServerPreClose,
  Server: HttpServer,
  setupConnectionsTracking,
  storeHTTPOptions,
  _connectionListener
} = require('_http_server');
var {
  ClientRequest
} = require('_http_client');
var debug = require('internal/util/debuglog').debuglog('https', fn => {
  debug = fn;
});
var net = require('net');
var {
  URL,
  urlToHttpOptions,
  isURL
} = require('internal/url');
var {
  validateObject
} = require('internal/validators');
var {
  isIP
} = require('internal/net');
var assert = require('internal/assert');
var {
  getOptionValue
} = require('internal/options');
function Server(opts, requestListener) {
  if (!(this instanceof Server)) return new Server(opts, requestListener);
  var ALPNProtocols = ['http/1.1'];
  if (typeof opts === 'function') {
    requestListener = opts;
    opts = kEmptyObject;
  } else if (opts == null) {
    opts = kEmptyObject;
  } else {
    validateObject(opts, 'options');
    // Only one of ALPNProtocols and ALPNCallback can be set, so make sure we
    // only set a default ALPNProtocols if the caller has not set either of them
    if (opts.ALPNProtocols || opts.ALPNCallback) ALPNProtocols = undefined;
  }
  FunctionPrototypeCall(storeHTTPOptions, this, opts);
  FunctionPrototypeCall(tls.Server, this, _objectSpread({
    noDelay: true,
    ALPNProtocols
  }, opts), _connectionListener);
  this.httpAllowHalfOpen = false;
  if (requestListener) {
    this.addListener('request', requestListener);
  }
  this.addListener('tlsClientError', function addListener(err, conn) {
    if (!this.emit('clientError', err, conn)) conn.destroy(err);
  });
  this.timeout = 0;
  this.maxHeadersCount = null;
  this.on('listening', setupConnectionsTracking);
}
ObjectSetPrototypeOf(Server.prototype, tls.Server.prototype);
ObjectSetPrototypeOf(Server, tls.Server);
Server.prototype.closeAllConnections = HttpServer.prototype.closeAllConnections;
Server.prototype.closeIdleConnections = HttpServer.prototype.closeIdleConnections;
Server.prototype.setTimeout = HttpServer.prototype.setTimeout;
Server.prototype.close = function close() {
  httpServerPreClose(this);
  ReflectApply(tls.Server.prototype.close, this, arguments);
  return this;
};
Server.prototype[SymbolAsyncDispose] = _async(function () {
  var _this = this;
  return _awaitIgnored(FunctionPrototypeCall(promisify(_this.close), _this));
});

/**
 * Creates a new `https.Server` instance.
 * @param {{
 *   IncomingMessage?: IncomingMessage;
 *   ServerResponse?: ServerResponse;
 *   insecureHTTPParser?: boolean;
 *   maxHeaderSize?: number;
 *   }} [opts]
 * @param {Function} [requestListener]
 * @returns {Server}
 */
function createServer(opts, requestListener) {
  return new Server(opts, requestListener);
}

// When proxying a HTTPS request, the following needs to be done:
// https://datatracker.ietf.org/doc/html/rfc9110#CONNECT
// 1. Send a CONNECT request to the proxy server.
// 2. Wait for 200 connection established response to establish the tunnel.
// 3. Perform TLS handshake with the endpoint over the socket.
// 4. Tunnel the request using the established connection.
//
// This function computes the tunnel configuration for HTTPS requests.
// The handling of the tunnel connection is done in createConnection.
function getTunnelConfigForProxiedHttps(agent, reqOptions) {
  if (!agent[kProxyConfig]) {
    return null;
  }
  if ((reqOptions.protocol || agent.protocol) !== 'https:') {
    return null;
  }
  var shouldUseProxy = checkShouldUseProxy(agent[kProxyConfig], reqOptions);
  debug(`getTunnelConfigForProxiedHttps should use proxy for ${reqOptions.host}:${reqOptions.port}:`, shouldUseProxy);
  if (!shouldUseProxy) {
    return null;
  }
  var {
    auth,
    href
  } = agent[kProxyConfig];
  // The request is a HTTPS request, assemble the payload for establishing the tunnel.
  var ipType = isIP(reqOptions.host);
  // The request target must put IPv6 address in square brackets.
  // Here reqOptions is already processed by urlToHttpOptions so we'll add them back if necessary.
  // See https://www.rfc-editor.org/rfc/rfc3986#section-3.2.2
  var requestHost = ipType === 6 ? `[${reqOptions.host}]` : reqOptions.host;
  var requestPort = reqOptions.port || agent.defaultPort;
  var endpoint = `${requestHost}:${requestPort}`;
  // The ClientRequest constructor should already have validated the host and the port.
  // When the request options come from a string invalid characters would be stripped away,
  // when it's an object ERR_INVALID_CHAR would be thrown. Here we just assert in case
  // agent.createConnection() is called with invalid options.
  assert(!endpoint.includes('\r'));
  assert(!endpoint.includes('\n'));
  var payload = `CONNECT ${endpoint} HTTP/1.1\r\n`;
  // The parseProxyConfigFromEnv() method should have already validated the authorization header
  // value.
  if (auth) {
    payload += `proxy-authorization: ${auth}\r\n`;
  }
  if (agent.keepAlive || agent.maxSockets !== Infinity) {
    payload += 'proxy-connection: keep-alive\r\n';
  }
  payload += `host: ${endpoint}`;
  payload += '\r\n\r\n';
  var result = {
    __proto__: null,
    proxyTunnelPayload: payload,
    requestOptions: _objectSpread({
      // Options used for the request sent after the tunnel is established.
      __proto__: null,
      servername: reqOptions.servername || ipType ? undefined : reqOptions.host
    }, reqOptions)
  };
  debug(`updated request for HTTPS proxy ${href} with`, result);
  return result;
}
;
function establishTunnel(agent, socket, options, tunnelConfig, afterSocket) {
  var {
    proxyTunnelPayload
  } = tunnelConfig;
  // By default, the socket is in paused mode. Read to look for the 200
  // connection established response.
  function read() {
    var chunk;
    while ((chunk = socket.read()) !== null) {
      if (onProxyData(chunk) !== -1) {
        break;
      }
    }
    socket.on('readable', read);
  }
  function cleanup() {
    socket.removeListener('end', onProxyEnd);
    socket.removeListener('error', onProxyError);
    socket.removeListener('readable', read);
    socket.setTimeout(0); // Clear the timeout for the tunnel establishment.
  }
  function onProxyError(err) {
    debug('onProxyError', err);
    cleanup();
    afterSocket(err, socket);
  }

  // Read the headers from the chunks and check for the status code. If it fails we
  // clean up the socket and return an error. Otherwise we establish the tunnel.
  var buffer = '';
  function onProxyData(chunk) {
    var str = chunk.toString();
    debug('onProxyData', str);
    buffer += str;
    var headerEndIndex = buffer.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) return headerEndIndex;
    var statusLine = buffer.substring(0, buffer.indexOf('\r\n'));
    var statusCode = statusLine.split(' ')[1];
    if (statusCode !== '200') {
      debug(`onProxyData receives ${statusCode}, cleaning up`);
      cleanup();
      var targetHost = proxyTunnelPayload.split('\r')[0].split(' ')[1];
      var message = `Failed to establish tunnel to ${targetHost} via ${agent[kProxyConfig].href}: ${statusLine}`;
      var err = new ERR_PROXY_TUNNEL(message);
      err.statusCode = NumberParseInt(statusCode);
      afterSocket(err, socket);
    } else {
      // https://datatracker.ietf.org/doc/html/rfc9110#CONNECT
      // RFC 9110 says that it can be 2xx but in the real world, proxy clients generally only
      // accepts 200.
      // Proxy servers are not supposed to send anything after the headers - the payload must be
      // be empty. So after this point we will proceed with the tunnel e.g. starting TLS handshake.
      debug('onProxyData receives 200, establishing tunnel');
      cleanup();

      // Reuse the tunneled socket to perform the TLS handshake with the endpoint,
      // then send the request.
      var {
        requestOptions
      } = tunnelConfig;
      tunnelConfig.requestOptions = null;
      requestOptions.socket = socket;
      var tunneldSocket;
      var onTLSHandshakeError = err => {
        debug('Propagate error event from tunneled socket to tunnel socket');
        afterSocket(err, tunneldSocket);
      };
      tunneldSocket = tls.connect(requestOptions, () => {
        debug('TLS handshake over tunnel succeeded');
        tunneldSocket.removeListener('error', onTLSHandshakeError);
        afterSocket(null, tunneldSocket);
      });
      tunneldSocket.on('free', () => {
        debug('Propagate free event from tunneled socket to tunnel socket');
        socket.emit('free');
      });
      tunneldSocket.on('error', onTLSHandshakeError);
    }
    return headerEndIndex;
  }
  function onProxyEnd() {
    cleanup();
    var err = new ERR_PROXY_TUNNEL('Connection to establish proxy tunnel ended unexpectedly');
    afterSocket(err, socket);
  }
  var proxyTunnelTimeout = tunnelConfig.requestOptions.timeout;
  debug('proxyTunnelTimeout', proxyTunnelTimeout, options.timeout);
  // It may be worth a separate timeout error/event.
  // But it also makes sense to treat the tunnel establishment timeout as
  // a normal timeout for the request.
  function onProxyTimeout() {
    debug('onProxyTimeout', proxyTunnelTimeout);
    cleanup();
    var err = new ERR_PROXY_TUNNEL(`Connection to establish proxy tunnel timed out after ${proxyTunnelTimeout}ms`);
    err.proxyTunnelTimeout = proxyTunnelTimeout;
    afterSocket(err, socket);
  }
  if (proxyTunnelTimeout && proxyTunnelTimeout > 0) {
    debug('proxy tunnel setTimeout', proxyTunnelTimeout);
    socket.setTimeout(proxyTunnelTimeout, onProxyTimeout);
  }
  socket.on('error', onProxyError);
  socket.on('end', onProxyEnd);
  socket.write(proxyTunnelPayload);
  read();
}

// HTTPS agents.
// See ProxyConfig in internal/http.js for how the connection should be handled
// when the agent is configured to use a proxy server.
function createConnection() {
  var _ref;
  // XXX: This signature (port, host, options) is different from all the other
  // createConnection() methods.
  var options, cb;
  if ((arguments.length <= 0 ? undefined : arguments[0]) !== null && typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
    options = arguments.length <= 0 ? undefined : arguments[0];
  } else if ((arguments.length <= 1 ? undefined : arguments[1]) !== null && typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'object') {
    options = _objectSpread({}, arguments.length <= 1 ? undefined : arguments[1]);
  } else if ((arguments.length <= 2 ? undefined : arguments[2]) === null || typeof (arguments.length <= 2 ? undefined : arguments[2]) !== 'object') {
    options = {};
  } else {
    options = _objectSpread({}, arguments.length <= 2 ? undefined : arguments[2]);
  }
  if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'number') {
    options.port = arguments.length <= 0 ? undefined : arguments[0];
  }
  if (typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'string') {
    options.host = arguments.length <= 1 ? undefined : arguments[1];
  }
  if (typeof (_ref = arguments.length - 1, _ref < 0 || arguments.length <= _ref ? undefined : arguments[_ref]) === 'function') {
    var _ref2;
    cb = (_ref2 = arguments.length - 1, _ref2 < 0 || arguments.length <= _ref2 ? undefined : arguments[_ref2]);
  }
  debug('createConnection', options);
  if (options._agentKey) {
    var session = this._getSession(options._agentKey);
    if (session) {
      debug('reuse session for %j', options._agentKey);
      options = _objectSpread({
        session
      }, options);
    }
  }
  var socket;
  var tunnelConfig = getTunnelConfigForProxiedHttps(this, options);
  debug(`https createConnection should use proxy for ${options.host}:${options.port}:`, tunnelConfig);
  if (!tunnelConfig) {
    socket = tls.connect(options);
  } else {
    var connectOptions = _objectSpread({}, this[kProxyConfig].proxyConnectionOptions);
    debug('Create proxy socket', connectOptions);
    var onError = err => {
      cleanupAndPropagate(err, socket);
    };
    var proxyTunnelTimeout = tunnelConfig.requestOptions.timeout;
    var onTimeout = () => {
      var err = new ERR_PROXY_TUNNEL(`Connection to establish proxy tunnel timed out after ${proxyTunnelTimeout}ms`);
      err.proxyTunnelTimeout = proxyTunnelTimeout;
      cleanupAndPropagate(err, socket);
    };
    var cleanupAndPropagate = once((err, currentSocket) => {
      debug('cleanupAndPropagate', err);
      socket.removeListener('error', onError);
      socket.removeListener('timeout', onTimeout);
      // An error occurred during tunnel establishment, in that case just destroy the socket.
      // and propagate the error to the callback.

      // When the error comes from unexpected status code, the stream is still in good shape,
      // in that case let req.onSocket handle the destruction instead.
      if (err && err.code === 'ERR_PROXY_TUNNEL' && !err.statusCode) {
        socket.destroy();
      }
      // This error should go to:
      // -> oncreate in Agent.prototype.createSocket
      // -> closure in Agent.prototype.addRequest or Agent.prototype.removeSocket
      if (cb) {
        cb(err, currentSocket);
      }
    });
    var onProxyConnection = () => {
      socket.removeListener('error', onError);
      establishTunnel(this, socket, options, tunnelConfig, cleanupAndPropagate);
    };
    if (this[kProxyConfig].protocol === 'http:') {
      socket = net.connect(connectOptions, onProxyConnection);
    } else {
      socket = tls.connect(connectOptions, onProxyConnection);
    }
    socket.on('error', onError);
    if (proxyTunnelTimeout) {
      socket.setTimeout(proxyTunnelTimeout, onTimeout);
    }
    socket[kWaitForProxyTunnel] = true;
  }
  if (options._agentKey) {
    // Cache new session for reuse
    socket.on('session', session => {
      this._cacheSession(options._agentKey, session);
    });

    // Evict session on error
    socket.once('close', err => {
      if (err) this._evictSession(options._agentKey);
    });
  }
  return socket;
}

/**
 * Creates a new `HttpAgent` instance.
 * @param {{
 *   keepAlive?: boolean;
 *   keepAliveMsecs?: number;
 *   maxSockets?: number;
 *   maxTotalSockets?: number;
 *   maxFreeSockets?: number;
 *   scheduling?: string;
 *   timeout?: number;
 *   maxCachedSessions?: number;
 *   servername?: string;
 *   defaultPort?: number;
 *   protocol?: string;
 *   proxyEnv?: object;
 *   }} [options]
 * @class
 */
function Agent(options) {
  if (!(this instanceof Agent)) return new Agent(options);
  options = _objectSpread({
    __proto__: null
  }, options);
  options.defaultPort ??= 443;
  options.protocol ??= 'https:';
  FunctionPrototypeCall(HttpAgent, this, options);
  this.maxCachedSessions = this.options.maxCachedSessions;
  if (this.maxCachedSessions === undefined) this.maxCachedSessions = 100;
  this._sessionCache = {
    map: {},
    list: []
  };
}
ObjectSetPrototypeOf(Agent.prototype, HttpAgent.prototype);
ObjectSetPrototypeOf(Agent, HttpAgent);
Agent.prototype.createConnection = createConnection;

/**
 * Gets a unique name for a set of options.
 * @param {{
 *   host: string;
 *   port: number;
 *   localAddress: string;
 *   family: number;
 *   }} [options]
 * @returns {string}
 */
Agent.prototype.getName = function getName() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  var name = FunctionPrototypeCall(HttpAgent.prototype.getName, this, options);
  name += ':';
  if (options.ca) name += options.ca;
  name += ':';
  if (options.cert) name += options.cert;
  name += ':';
  if (options.clientCertEngine) name += options.clientCertEngine;
  name += ':';
  if (options.ciphers) name += options.ciphers;
  name += ':';
  if (options.key) name += options.key;
  name += ':';
  if (options.pfx) name += options.pfx;
  name += ':';
  if (options.rejectUnauthorized !== undefined) name += options.rejectUnauthorized;
  name += ':';
  if (options.servername && options.servername !== options.host) name += options.servername;
  name += ':';
  if (options.minVersion) name += options.minVersion;
  name += ':';
  if (options.maxVersion) name += options.maxVersion;
  name += ':';
  if (options.secureProtocol) name += options.secureProtocol;
  name += ':';
  if (options.crl) name += options.crl;
  name += ':';
  if (options.honorCipherOrder !== undefined) name += options.honorCipherOrder;
  name += ':';
  if (options.ecdhCurve) name += options.ecdhCurve;
  name += ':';
  if (options.dhparam) name += options.dhparam;
  name += ':';
  if (options.secureOptions !== undefined) name += options.secureOptions;
  name += ':';
  if (options.sessionIdContext) name += options.sessionIdContext;
  name += ':';
  if (options.sigalgs) name += JSONStringify(options.sigalgs);
  name += ':';
  if (options.privateKeyIdentifier) name += options.privateKeyIdentifier;
  name += ':';
  if (options.privateKeyEngine) name += options.privateKeyEngine;
  return name;
};
Agent.prototype._getSession = function _getSession(key) {
  return this._sessionCache.map[key];
};
Agent.prototype._cacheSession = function _cacheSession(key, session) {
  // Cache is disabled
  if (this.maxCachedSessions === 0) return;

  // Fast case - update existing entry
  if (this._sessionCache.map[key]) {
    this._sessionCache.map[key] = session;
    return;
  }

  // Put new entry
  if (this._sessionCache.list.length >= this.maxCachedSessions) {
    var oldKey = ArrayPrototypeShift(this._sessionCache.list);
    debug('evicting %j', oldKey);
    delete this._sessionCache.map[oldKey];
  }
  ArrayPrototypePush(this._sessionCache.list, key);
  this._sessionCache.map[key] = session;
};
Agent.prototype._evictSession = function _evictSession(key) {
  var index = ArrayPrototypeIndexOf(this._sessionCache.list, key);
  if (index === -1) return;
  ArrayPrototypeSplice(this._sessionCache.list, index, 1);
  delete this._sessionCache.map[key];
};
var globalAgent = getGlobalAgent(getOptionValue('--use-env-proxy') ? process.env : undefined, Agent);

/**
 * Makes a request to a secure web server.
 * @param {...any} args
 * @returns {ClientRequest}
 */
function request() {
  var options = {};
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  if (typeof args[0] === 'string') {
    var urlStr = ArrayPrototypeShift(args);
    options = urlToHttpOptions(new URL(urlStr));
  } else if (isURL(args[0])) {
    options = urlToHttpOptions(ArrayPrototypeShift(args));
  }
  if (args[0] && typeof args[0] !== 'function') {
    ObjectAssign(options, ArrayPrototypeShift(args));
  }
  options._defaultAgent = module.exports.globalAgent;
  ArrayPrototypeUnshift(args, options);
  return ReflectConstruct(ClientRequest, args);
}

/**
 * Makes a GET request to a secure web server.
 * @param {string | URL} input
 * @param {{
 *   agent?: Agent | boolean;
 *   auth?: string;
 *   createConnection?: Function;
 *   defaultPort?: number;
 *   family?: number;
 *   headers?: object;
 *   hints?: number;
 *   host?: string;
 *   hostname?: string;
 *   insecureHTTPParser?: boolean;
 *   joinDuplicateHeaders?: boolean;
 *   localAddress?: string;
 *   localPort?: number;
 *   lookup?: Function;
 *   maxHeaderSize?: number;
 *   method?: string;
 *   path?: string;
 *   port?: number;
 *   protocol?: string;
 *   setHost?: boolean;
 *   socketPath?: string;
 *   timeout?: number;
 *   signal?: AbortSignal;
 *   uniqueHeaders?: Array;
 *   } | string | URL} [options]
 * @param {Function} [cb]
 * @returns {ClientRequest}
 */
function get(input, options, cb) {
  var req = request(input, options, cb);
  req.end();
  return req;
}
module.exports = {
  Agent,
  globalAgent,
  Server,
  createServer,
  get,
  request
};

