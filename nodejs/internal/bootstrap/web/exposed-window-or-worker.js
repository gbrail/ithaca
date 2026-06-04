'use strict';

/**
 * This file exposes web interfaces that is defined with the WebIDL
 * Exposed=Window + Exposed=(Window,Worker) extended attribute or exposed in
 * WindowOrWorkerGlobalScope mixin.
 * See more details at https://webidl.spec.whatwg.org/#Exposed and
 * https://html.spec.whatwg.org/multipage/webappapis.html#windoworworkerglobalscope.
 */
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor,
  globalThis
} = primordials;
var {
  defineOperation,
  defineLazyProperties,
  defineReplaceableLazyAttribute,
  exposeLazyInterfaces,
  exposeInterface
} = require('internal/util');
var {
  ERR_INVALID_THIS,
  ERR_NO_CRYPTO
} = require('internal/errors').codes;

// https://html.spec.whatwg.org/multipage/webappapis.html#windoworworkerglobalscope
var timers = require('timers');
defineOperation(globalThis, 'clearInterval', timers.clearInterval);
defineOperation(globalThis, 'clearTimeout', timers.clearTimeout);
defineOperation(globalThis, 'setInterval', timers.setInterval);
defineOperation(globalThis, 'setTimeout', timers.setTimeout);
var {
  queueMicrotask
} = require('internal/process/task_queues');
defineOperation(globalThis, 'queueMicrotask', queueMicrotask);
defineLazyProperties(globalThis, 'internal/worker/js_transferable', ['structuredClone']);
defineLazyProperties(globalThis, 'buffer', ['atob', 'btoa']);

// https://html.spec.whatwg.org/multipage/web-messaging.html#broadcasting-to-other-browsing-contexts
exposeLazyInterfaces(globalThis, 'internal/worker/io', ['BroadcastChannel']);
exposeLazyInterfaces(globalThis, 'internal/worker/io', ['MessageChannel', 'MessagePort']);
// https://www.w3.org/TR/FileAPI/#dfn-Blob
exposeLazyInterfaces(globalThis, 'internal/blob', ['Blob']);
// https://www.w3.org/TR/FileAPI/#dfn-file
exposeLazyInterfaces(globalThis, 'internal/file', ['File']);
// https://www.w3.org/TR/hr-time-2/#the-performance-attribute
exposeLazyInterfaces(globalThis, 'perf_hooks', ['Performance', 'PerformanceEntry', 'PerformanceMark', 'PerformanceMeasure', 'PerformanceObserver', 'PerformanceObserverEntryList', 'PerformanceResourceTiming']);
defineReplaceableLazyAttribute(globalThis, 'perf_hooks', ['performance']);

// https://w3c.github.io/FileAPI/#creating-revoking
var {
  installObjectURLMethods,
  URLPattern
} = require('internal/url');
installObjectURLMethods();
exposeInterface(globalThis, 'URLPattern', URLPattern);
var fetchImpl;
// https://fetch.spec.whatwg.org/#fetch-method
ObjectDefineProperty(globalThis, 'fetch', {
  __proto__: null,
  configurable: true,
  enumerable: true,
  writable: true,
  value: function fetch(input) {
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    // eslint-disable-line func-name-matching
    if (!fetchImpl) {
      // Implement lazy loading of undici module for fetch function
      var undiciModule = require('internal/deps/undici/undici');
      fetchImpl = undiciModule.fetch;
    }
    return fetchImpl(input, init);
  }
});

// https://xhr.spec.whatwg.org/#interface-formdata
// https://fetch.spec.whatwg.org/#headers-class
// https://fetch.spec.whatwg.org/#request-class
// https://fetch.spec.whatwg.org/#response-class
exposeLazyInterfaces(globalThis, 'internal/deps/undici/undici', ['FormData', 'Headers', 'Request', 'Response', 'MessageEvent', 'CloseEvent', 'ErrorEvent']);

// https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events.org/
// https://websockets.spec.whatwg.org/
exposeLazyInterfaces(globalThis, 'internal/deps/undici/undici', ['EventSource', 'WebSocket']);

// The WebAssembly Web API which relies on Response.
// https:// webassembly.github.io/spec/web-api/#streaming-modules
internalBinding('wasm_web_api').setImplementation((streamState, source) => {
  require('internal/wasm_web_api').wasmStreamingCallback(streamState, source);
});

// WebCryptoAPI
if (internalBinding('config').hasOpenSSL) {
  defineReplaceableLazyAttribute(globalThis, 'internal/crypto/webcrypto', ['crypto'], false, function cryptoThisCheck() {
    if (this !== globalThis && this != null) throw new ERR_INVALID_THIS('nullish or must be the global object');
  });
  exposeLazyInterfaces(globalThis, 'internal/crypto/webcrypto', ['Crypto', 'CryptoKey', 'SubtleCrypto']);
} else {
  ObjectDefineProperty(globalThis, 'crypto', _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor({
    get crypto() {
      throw new ERR_NO_CRYPTO();
    }
  }, 'crypto')));
}

