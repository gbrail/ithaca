'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Date,
  Number: _Number,
  NumberParseInt,
  Symbol: _Symbol,
  decodeURIComponent
} = primordials;
var {
  setUnrefTimeout
} = require('internal/timers');
var {
  getCategoryEnabledBuffer,
  trace
} = internalBinding('trace_events');
var {
  CHAR_LOWERCASE_B,
  CHAR_LOWERCASE_E
} = require('internal/constants');
var {
  URL
} = require('internal/url');
var {
  Buffer
} = require('buffer');
var {
  isIPv4
} = require('internal/net');
var {
  ERR_PROXY_INVALID_CONFIG
} = require('internal/errors').codes;
var utcCache;
function utcDate() {
  if (!utcCache) cache();
  return utcCache;
}
function cache() {
  var d = new Date();
  utcCache = d.toUTCString();
  setUnrefTimeout(resetCache, 1000 - d.getMilliseconds());
}
function resetCache() {
  utcCache = undefined;
}
var traceEventId = 0;
function getNextTraceEventId() {
  return ++traceEventId;
}
var httpEnabled = getCategoryEnabledBuffer('node.http');
function isTraceHTTPEnabled() {
  return httpEnabled[0] > 0;
}
var traceEventCategory = 'node,node.http';
function traceBegin() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  trace.apply(void 0, [CHAR_LOWERCASE_B, traceEventCategory].concat(args));
}
function traceEnd() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  trace.apply(void 0, [CHAR_LOWERCASE_E, traceEventCategory].concat(args));
}
function ipToInt(ip) {
  var octets = ip.split('.');
  var result = 0;
  for (var i = 0; i < octets.length; i++) {
    result = (result << 8) + NumberParseInt(octets[i]);
  }
  // Force unsigned 32-bit result
  return result >>> 0;
}

// There are two factors in play when proxying the request:
// 1. What the request protocol is, that is, whether users are sending it via
//    http.request or https.request, or whether they are sending
//    the request to a https:// URL or a http:// URL. HTTPS requests should be
//    proxied by the proxy specified using the HTTPS_PROXY environment variable.
//    HTTP requests should be proxied by the proxy specified using the HTTP_PROXY
//    environment variable.
// 2. What the proxy protocol is. This depends on the value of the environment variables,
//    for example.
//
// When proxying a HTTP request, the following needs to be done:
// https://datatracker.ietf.org/doc/html/rfc7230#section-5.3.2
// 1. Rewrite the request path to absolute-form.
// 2. Add proxy-connection and proxy-authorization headers appropriately.
//
// When proxying a HTTPS request, the following needs to be done:
// https://datatracker.ietf.org/doc/html/rfc9110#CONNECT
// 1. Send a CONNECT request to the proxy server.
// 2. Wait for 200 connection established response to establish the tunnel.
// 3. Perform TLS handshake with the endpoint through the tunnel.
// 4. Tunnel the request using the established connection.
//
// When the proxy protocol is HTTP, the modified HTTP request can just be sent over
// the TCP socket to the proxy server, and the HTTPS request tunnel can be established
// over the TCP socket to the proxy server.
// When the proxy protocol is HTTPS, the modified request needs to be sent after
// TLS handshake with the proxy server. Same goes to the HTTPS request tunnel establishment.

/**
 * Represents the proxy configuration for an agent. The built-in http and https agent
 * implementation have one of this when they are configured to use a proxy.
 * @property {string} href - Full URL of the proxy server.
 * @property {string} protocol - Proxy protocol used to talk to the proxy server.
 * @property {string|undefined} auth - proxy-authorization header value, if username or password is provided.
 * @property {Array<string>} bypassList - List of hosts to bypass the proxy.
 * @property {object} proxyConnectionOptions - Options for connecting to the proxy server.
 */
var ProxyConfig = /*#__PURE__*/function () {
  function ProxyConfig(proxyUrl, keepAlive, noProxyList) {
    _classCallCheck(this, ProxyConfig);
    var parsedURL;
    try {
      parsedURL = new URL(proxyUrl);
    } catch {
      throw new ERR_PROXY_INVALID_CONFIG(`Invalid proxy URL: ${proxyUrl}`);
    }
    var {
      hostname,
      port,
      protocol,
      username,
      password
    } = parsedURL;
    this.href = proxyUrl;
    this.protocol = protocol;
    if (username || password) {
      // If username or password is provided, prepare the proxy-authorization header.
      var auth = `${decodeURIComponent(username)}:${decodeURIComponent(password)}`;
      this.auth = `Basic ${Buffer.from(auth).toString('base64')}`;
    }
    if (noProxyList) {
      this.bypassList = noProxyList.split(',').map(entry => entry.trim().toLowerCase());
    } else {
      this.bypassList = []; // No bypass list provided.
    }
    this.proxyConnectionOptions = {
      // The host name comes from parsed URL so if it starts with '[' it must be an IPv6 address
      // ending with ']'. Remove the brackets for net.connect().
      host: hostname[0] === '[' ? hostname.slice(1, -1) : hostname,
      // The port comes from parsed URL so it is either '' or a valid number string.
      port: port ? _Number(port) : protocol === 'https:' ? 443 : 80
    };
  }

  // See: https://about.gitlab.com/blog/we-need-to-talk-no-proxy
  // TODO(joyeecheung): share code with undici.
  return _createClass(ProxyConfig, [{
    key: "shouldUseProxy",
    value: function shouldUseProxy(hostname, port) {
      var bypassList = this.bypassList;
      if (this.bypassList.length === 0) {
        return true; // No bypass list, always use the proxy.
      }
      var host = hostname.toLowerCase();
      var hostWithPort = port ? `${host}:${port}` : host;
      for (var i = 0; i < bypassList.length; i++) {
        var entry = bypassList[i];
        if (entry === '*') return false; // * bypasses all hosts.
        if (entry === host || entry === hostWithPort) return false; // Matching host and host:port

        // Follow curl's behavior: strip leading dot before matching suffixes.
        if (entry[0] === '.') {
          var suffix = entry.substring(1);
          if (host === suffix || host.endsWith(suffix) && host[host.length - suffix.length - 1] === '.') return false;
        }

        // Handle wildcards like *.example.com
        if (entry.startsWith('*.') && host.endsWith(entry.substring(1))) return false;

        // Handle IP ranges (simple format like 192.168.1.0-192.168.1.255)
        // TODO(joyeecheung): support IPv6.
        if (entry.includes('-') && isIPv4(host)) {
          var {
            0: startIP,
            1: endIP
          } = entry.split('-');
          startIP = startIP.trim();
          endIP = endIP.trim();
          if (startIP && endIP && isIPv4(startIP) && isIPv4(endIP)) {
            var hostInt = ipToInt(host);
            var startInt = ipToInt(startIP);
            var endInt = ipToInt(endIP);
            if (hostInt >= startInt && hostInt <= endInt) return false;
          }
        }

        // It might be useful to support CIDR notation, but it's not so widely supported
        // in other tools as a de-facto standard to follow, so we don't implement it for now.
      }
      return true; // If no matches found, use the proxy.
    }
  }]);
}();
function parseProxyUrl(env, protocol) {
  // Get the proxy url - following the most popular convention, lower case takes precedence.
  // See https://about.gitlab.com/blog/we-need-to-talk-no-proxy/#http_proxy-and-https_proxy
  var proxyUrl = protocol === 'https:' ? env.https_proxy || env.HTTPS_PROXY : env.http_proxy || env.HTTP_PROXY;
  // No proxy settings from the environment, ignore.
  if (!proxyUrl) {
    return null;
  }
  if (proxyUrl.includes('\r') || proxyUrl.includes('\n')) {
    throw new ERR_PROXY_INVALID_CONFIG(`Invalid proxy URL: ${proxyUrl}`);
  }
  return proxyUrl;
}
function parseProxyConfigFromEnv(env, protocol, keepAlive) {
  // We only support proxying for HTTP and HTTPS requests.
  if (protocol !== 'http:' && protocol !== 'https:') {
    return null;
  }
  var proxyUrl = parseProxyUrl(env, protocol);
  if (proxyUrl === null) {
    return null;
  }

  // Only http:// and https:// proxies are supported.
  // Ignore instead of throw, in case other protocols are supposed to be
  // handled by the user land.
  if (!proxyUrl.startsWith('http://') && !proxyUrl.startsWith('https://')) {
    return null;
  }
  var noProxyList = env.no_proxy || env.NO_PROXY;
  return new ProxyConfig(proxyUrl, keepAlive, noProxyList);
}

/**
 * @param {ProxyConfig} proxyConfig
 * @param {object} reqOptions
 * @returns {boolean}
 */
function checkShouldUseProxy(proxyConfig, reqOptions) {
  if (!proxyConfig) {
    return false;
  }
  if (reqOptions.socketPath) {
    // If socketPath is set, the endpoint is a Unix domain socket, which can't
    // be proxied.
    return false;
  }
  return proxyConfig.shouldUseProxy(reqOptions.host || 'localhost', reqOptions.port);
}
function filterEnvForProxies(env) {
  return {
    __proto__: null,
    http_proxy: env.http_proxy,
    HTTP_PROXY: env.HTTP_PROXY,
    https_proxy: env.https_proxy,
    HTTPS_PROXY: env.HTTPS_PROXY,
    no_proxy: env.no_proxy,
    NO_PROXY: env.NO_PROXY
  };
}
function getGlobalAgent(proxyEnv, Agent) {
  return new Agent({
    keepAlive: true,
    scheduling: 'lifo',
    timeout: 5000,
    proxyEnv
  });
}
module.exports = {
  kOutHeaders: _Symbol('kOutHeaders'),
  kNeedDrain: _Symbol('kNeedDrain'),
  kProxyConfig: _Symbol('kProxyConfig'),
  kWaitForProxyTunnel: _Symbol('kWaitForProxyTunnel'),
  checkShouldUseProxy,
  parseProxyConfigFromEnv,
  utcDate,
  traceBegin,
  traceEnd,
  getNextTraceEventId,
  isTraceHTTPEnabled,
  filterEnvForProxies,
  getGlobalAgent,
  parseProxyUrl
};

