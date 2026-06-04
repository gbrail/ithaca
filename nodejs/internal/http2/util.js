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
  ArrayIsArray,
  Error,
  MathMax,
  Number: _Number,
  NumberIsNaN,
  ObjectAssign,
  ObjectKeys,
  SafeSet,
  String: _String,
  StringFromCharCode,
  Symbol: _Symbol
} = primordials;
var {
  _checkIsHttpToken: checkIsHttpToken
} = require('_http_common');
var binding = internalBinding('http2');
var {
  codes: {
    ERR_HTTP2_CONNECT_AUTHORITY,
    ERR_HTTP2_CONNECT_PATH,
    ERR_HTTP2_CONNECT_SCHEME,
    ERR_HTTP2_HEADER_SINGLE_VALUE,
    ERR_HTTP2_INVALID_CONNECTION_HEADERS,
    ERR_HTTP2_INVALID_PSEUDOHEADER: {
      HideStackFramesError: ERR_HTTP2_INVALID_PSEUDOHEADER
    },
    ERR_HTTP2_INVALID_SETTING_VALUE,
    ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_HTTP_TOKEN
  },
  getMessage,
  hideStackFrames,
  kIsNodeError
} = require('internal/errors');
var kAuthority = _Symbol('authority');
var kSensitiveHeaders = _Symbol('sensitiveHeaders');
var kStrictSingleValueFields = _Symbol('strictSingleValueFields');
var kSocket = _Symbol('socket');
var kProtocol = _Symbol('protocol');
var kProxySocket = _Symbol('proxySocket');
var kRequest = _Symbol('request');
var {
  NGHTTP2_NV_FLAG_NONE,
  NGHTTP2_NV_FLAG_NO_INDEX,
  NGHTTP2_SESSION_CLIENT,
  NGHTTP2_SESSION_SERVER,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_AUTHORITY,
  HTTP2_HEADER_SCHEME,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_PROTOCOL,
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS,
  HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE,
  HTTP2_HEADER_ACCESS_CONTROL_REQUEST_METHOD,
  HTTP2_HEADER_AGE,
  HTTP2_HEADER_AUTHORIZATION,
  HTTP2_HEADER_CONTENT_ENCODING,
  HTTP2_HEADER_CONTENT_LANGUAGE,
  HTTP2_HEADER_CONTENT_LENGTH,
  HTTP2_HEADER_CONTENT_LOCATION,
  HTTP2_HEADER_CONTENT_MD5,
  HTTP2_HEADER_CONTENT_RANGE,
  HTTP2_HEADER_CONTENT_TYPE,
  HTTP2_HEADER_COOKIE,
  HTTP2_HEADER_DATE,
  HTTP2_HEADER_DNT,
  HTTP2_HEADER_ETAG,
  HTTP2_HEADER_EXPIRES,
  HTTP2_HEADER_FROM,
  HTTP2_HEADER_HOST,
  HTTP2_HEADER_IF_MATCH,
  HTTP2_HEADER_IF_NONE_MATCH,
  HTTP2_HEADER_IF_MODIFIED_SINCE,
  HTTP2_HEADER_IF_RANGE,
  HTTP2_HEADER_IF_UNMODIFIED_SINCE,
  HTTP2_HEADER_LAST_MODIFIED,
  HTTP2_HEADER_LOCATION,
  HTTP2_HEADER_MAX_FORWARDS,
  HTTP2_HEADER_PROXY_AUTHORIZATION,
  HTTP2_HEADER_RANGE,
  HTTP2_HEADER_REFERER,
  HTTP2_HEADER_RETRY_AFTER,
  HTTP2_HEADER_SET_COOKIE,
  HTTP2_HEADER_TK,
  HTTP2_HEADER_UPGRADE_INSECURE_REQUESTS,
  HTTP2_HEADER_USER_AGENT,
  HTTP2_HEADER_X_CONTENT_TYPE_OPTIONS,
  HTTP2_HEADER_CONNECTION,
  HTTP2_HEADER_UPGRADE,
  HTTP2_HEADER_HTTP2_SETTINGS,
  HTTP2_HEADER_TE,
  HTTP2_HEADER_TRANSFER_ENCODING,
  HTTP2_HEADER_KEEP_ALIVE,
  HTTP2_HEADER_PROXY_CONNECTION,
  HTTP2_METHOD_CONNECT,
  HTTP2_METHOD_DELETE,
  HTTP2_METHOD_GET,
  HTTP2_METHOD_HEAD
} = binding.constants;

// This set is defined strictly by the HTTP/2 specification. Only
// :-prefixed headers defined by that specification may be added to
// this set.
var kValidPseudoHeaders = new SafeSet([HTTP2_HEADER_STATUS, HTTP2_HEADER_METHOD, HTTP2_HEADER_AUTHORITY, HTTP2_HEADER_SCHEME, HTTP2_HEADER_PATH, HTTP2_HEADER_PROTOCOL]);

// This set contains headers that are permitted to have only a single
// value. Multiple instances must not be specified.
var kSingleValueFields = new SafeSet([HTTP2_HEADER_STATUS, HTTP2_HEADER_METHOD, HTTP2_HEADER_AUTHORITY, HTTP2_HEADER_SCHEME, HTTP2_HEADER_PATH, HTTP2_HEADER_PROTOCOL, HTTP2_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS, HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE, HTTP2_HEADER_ACCESS_CONTROL_REQUEST_METHOD, HTTP2_HEADER_AGE, HTTP2_HEADER_AUTHORIZATION, HTTP2_HEADER_CONTENT_ENCODING, HTTP2_HEADER_CONTENT_LANGUAGE, HTTP2_HEADER_CONTENT_LENGTH, HTTP2_HEADER_CONTENT_LOCATION, HTTP2_HEADER_CONTENT_MD5, HTTP2_HEADER_CONTENT_RANGE, HTTP2_HEADER_CONTENT_TYPE, HTTP2_HEADER_DATE, HTTP2_HEADER_DNT, HTTP2_HEADER_ETAG, HTTP2_HEADER_EXPIRES, HTTP2_HEADER_FROM, HTTP2_HEADER_HOST, HTTP2_HEADER_IF_MATCH, HTTP2_HEADER_IF_MODIFIED_SINCE, HTTP2_HEADER_IF_NONE_MATCH, HTTP2_HEADER_IF_RANGE, HTTP2_HEADER_IF_UNMODIFIED_SINCE, HTTP2_HEADER_LAST_MODIFIED, HTTP2_HEADER_LOCATION, HTTP2_HEADER_MAX_FORWARDS, HTTP2_HEADER_PROXY_AUTHORIZATION, HTTP2_HEADER_RANGE, HTTP2_HEADER_REFERER, HTTP2_HEADER_RETRY_AFTER, HTTP2_HEADER_TK, HTTP2_HEADER_UPGRADE_INSECURE_REQUESTS, HTTP2_HEADER_USER_AGENT, HTTP2_HEADER_X_CONTENT_TYPE_OPTIONS]);

// The HTTP methods in this set are specifically defined as assigning no
// meaning to the request payload. By default, unless the user explicitly
// overrides the endStream option on the request method, the endStream
// option will be defaulted to true when these methods are used.
var kNoPayloadMethods = new SafeSet([HTTP2_METHOD_DELETE, HTTP2_METHOD_GET, HTTP2_METHOD_HEAD]);

// The following ArrayBuffer instances are used to share memory more efficiently
// with the native binding side for a number of methods. These are not intended
// to be used directly by users in any way. The ArrayBuffers are created on
// the native side with values that are filled in on demand, the js code then
// reads those values out. The set of IDX constants that follow identify the
// relevant data positions within these buffers.
var {
  settingsBuffer,
  optionsBuffer
} = binding;

// Note that Float64Array is used here because there is no Int64Array available
// and these deal with numbers that can be beyond the range of Uint32 and Int32.
// The values set on the native side will always be integers. This is not a
// unique example of this, this pattern can be found in use in other parts of
// Node.js core as a performance optimization.
var {
  sessionState,
  streamState
} = binding;
var IDX_SETTINGS_HEADER_TABLE_SIZE = 0;
var IDX_SETTINGS_ENABLE_PUSH = 1;
var IDX_SETTINGS_INITIAL_WINDOW_SIZE = 2;
var IDX_SETTINGS_MAX_FRAME_SIZE = 3;
var IDX_SETTINGS_MAX_CONCURRENT_STREAMS = 4;
var IDX_SETTINGS_MAX_HEADER_LIST_SIZE = 5;
var IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL = 6;
var IDX_SETTINGS_FLAGS = 7;

// Maximum number of allowed additional settings
var MAX_ADDITIONAL_SETTINGS = 10;
var IDX_SESSION_STATE_EFFECTIVE_LOCAL_WINDOW_SIZE = 0;
var IDX_SESSION_STATE_EFFECTIVE_RECV_DATA_LENGTH = 1;
var IDX_SESSION_STATE_NEXT_STREAM_ID = 2;
var IDX_SESSION_STATE_LOCAL_WINDOW_SIZE = 3;
var IDX_SESSION_STATE_LAST_PROC_STREAM_ID = 4;
var IDX_SESSION_STATE_REMOTE_WINDOW_SIZE = 5;
var IDX_SESSION_STATE_OUTBOUND_QUEUE_SIZE = 6;
var IDX_SESSION_STATE_HD_DEFLATE_DYNAMIC_TABLE_SIZE = 7;
var IDX_SESSION_STATE_HD_INFLATE_DYNAMIC_TABLE_SIZE = 8;
var IDX_STREAM_STATE = 0;
var IDX_STREAM_STATE_WEIGHT = 1;
var IDX_STREAM_STATE_SUM_DEPENDENCY_WEIGHT = 2;
var IDX_STREAM_STATE_LOCAL_CLOSE = 3;
var IDX_STREAM_STATE_REMOTE_CLOSE = 4;
var IDX_STREAM_STATE_LOCAL_WINDOW_SIZE = 5;
var IDX_OPTIONS_MAX_DEFLATE_DYNAMIC_TABLE_SIZE = 0;
var IDX_OPTIONS_MAX_RESERVED_REMOTE_STREAMS = 1;
var IDX_OPTIONS_MAX_SEND_HEADER_BLOCK_LENGTH = 2;
var IDX_OPTIONS_PEER_MAX_CONCURRENT_STREAMS = 3;
var IDX_OPTIONS_PADDING_STRATEGY = 4;
var IDX_OPTIONS_MAX_HEADER_LIST_PAIRS = 5;
var IDX_OPTIONS_MAX_OUTSTANDING_PINGS = 6;
var IDX_OPTIONS_MAX_OUTSTANDING_SETTINGS = 7;
var IDX_OPTIONS_MAX_SESSION_MEMORY = 8;
var IDX_OPTIONS_MAX_SETTINGS = 9;
var IDX_OPTIONS_STREAM_RESET_RATE = 10;
var IDX_OPTIONS_STREAM_RESET_BURST = 11;
var IDX_OPTIONS_STRICT_HTTP_FIELD_WHITESPACE_VALIDATION = 12;
var IDX_OPTIONS_FLAGS = 13;
function updateOptionsBuffer(options) {
  var flags = 0;
  if (typeof options.maxDeflateDynamicTableSize === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_DEFLATE_DYNAMIC_TABLE_SIZE;
    optionsBuffer[IDX_OPTIONS_MAX_DEFLATE_DYNAMIC_TABLE_SIZE] = options.maxDeflateDynamicTableSize;
  }
  if (typeof options.maxReservedRemoteStreams === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_RESERVED_REMOTE_STREAMS;
    optionsBuffer[IDX_OPTIONS_MAX_RESERVED_REMOTE_STREAMS] = options.maxReservedRemoteStreams;
  }
  if (typeof options.maxSendHeaderBlockLength === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_SEND_HEADER_BLOCK_LENGTH;
    optionsBuffer[IDX_OPTIONS_MAX_SEND_HEADER_BLOCK_LENGTH] = options.maxSendHeaderBlockLength;
  }
  if (typeof options.peerMaxConcurrentStreams === 'number') {
    flags |= 1 << IDX_OPTIONS_PEER_MAX_CONCURRENT_STREAMS;
    optionsBuffer[IDX_OPTIONS_PEER_MAX_CONCURRENT_STREAMS] = options.peerMaxConcurrentStreams;
  }
  if (typeof options.paddingStrategy === 'number') {
    flags |= 1 << IDX_OPTIONS_PADDING_STRATEGY;
    optionsBuffer[IDX_OPTIONS_PADDING_STRATEGY] = options.paddingStrategy;
  }
  if (typeof options.maxHeaderListPairs === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_HEADER_LIST_PAIRS;
    optionsBuffer[IDX_OPTIONS_MAX_HEADER_LIST_PAIRS] = options.maxHeaderListPairs;
  }
  if (typeof options.maxOutstandingPings === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_OUTSTANDING_PINGS;
    optionsBuffer[IDX_OPTIONS_MAX_OUTSTANDING_PINGS] = options.maxOutstandingPings;
  }
  if (typeof options.maxOutstandingSettings === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_OUTSTANDING_SETTINGS;
    optionsBuffer[IDX_OPTIONS_MAX_OUTSTANDING_SETTINGS] = MathMax(1, options.maxOutstandingSettings);
  }
  if (typeof options.maxSessionMemory === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_SESSION_MEMORY;
    optionsBuffer[IDX_OPTIONS_MAX_SESSION_MEMORY] = MathMax(1, options.maxSessionMemory);
  }
  if (typeof options.maxSettings === 'number') {
    flags |= 1 << IDX_OPTIONS_MAX_SETTINGS;
    optionsBuffer[IDX_OPTIONS_MAX_SETTINGS] = MathMax(1, options.maxSettings);
  }
  if (typeof options.streamResetRate === 'number') {
    flags |= 1 << IDX_OPTIONS_STREAM_RESET_RATE;
    optionsBuffer[IDX_OPTIONS_STREAM_RESET_RATE] = MathMax(1, options.streamResetRate);
  }
  if (typeof options.streamResetBurst === 'number') {
    flags |= 1 << IDX_OPTIONS_STREAM_RESET_BURST;
    optionsBuffer[IDX_OPTIONS_STREAM_RESET_BURST] = MathMax(1, options.streamResetBurst);
  }
  if (typeof options.strictFieldWhitespaceValidation === 'boolean') {
    flags |= 1 << IDX_OPTIONS_STRICT_HTTP_FIELD_WHITESPACE_VALIDATION;
    optionsBuffer[IDX_OPTIONS_STRICT_HTTP_FIELD_WHITESPACE_VALIDATION] = options.strictFieldWhitespaceValidation === true ? 0 : 1;
  }
  optionsBuffer[IDX_OPTIONS_FLAGS] = flags;
}
function addCustomSettingsToObj() {
  var toRet = {};
  var num = settingsBuffer[IDX_SETTINGS_FLAGS + 1];
  for (var i = 0; i < num; i++) {
    toRet[settingsBuffer[IDX_SETTINGS_FLAGS + 1 + 2 * i + 1].toString()] = _Number(settingsBuffer[IDX_SETTINGS_FLAGS + 1 + 2 * i + 2]);
  }
  return toRet;
}
function getDefaultSettings() {
  settingsBuffer[IDX_SETTINGS_FLAGS] = 0;
  settingsBuffer[IDX_SETTINGS_FLAGS + 1] = 0; // Length of custom settings
  binding.refreshDefaultSettings();
  var holder = {
    __proto__: null
  };
  var flags = settingsBuffer[IDX_SETTINGS_FLAGS];
  if ((flags & 1 << IDX_SETTINGS_HEADER_TABLE_SIZE) === 1 << IDX_SETTINGS_HEADER_TABLE_SIZE) {
    holder.headerTableSize = settingsBuffer[IDX_SETTINGS_HEADER_TABLE_SIZE];
  }
  if ((flags & 1 << IDX_SETTINGS_ENABLE_PUSH) === 1 << IDX_SETTINGS_ENABLE_PUSH) {
    holder.enablePush = settingsBuffer[IDX_SETTINGS_ENABLE_PUSH] === 1;
  }
  if ((flags & 1 << IDX_SETTINGS_INITIAL_WINDOW_SIZE) === 1 << IDX_SETTINGS_INITIAL_WINDOW_SIZE) {
    holder.initialWindowSize = settingsBuffer[IDX_SETTINGS_INITIAL_WINDOW_SIZE];
  }
  if ((flags & 1 << IDX_SETTINGS_MAX_FRAME_SIZE) === 1 << IDX_SETTINGS_MAX_FRAME_SIZE) {
    holder.maxFrameSize = settingsBuffer[IDX_SETTINGS_MAX_FRAME_SIZE];
  }
  if ((flags & 1 << IDX_SETTINGS_MAX_CONCURRENT_STREAMS) === 1 << IDX_SETTINGS_MAX_CONCURRENT_STREAMS) {
    holder.maxConcurrentStreams = settingsBuffer[IDX_SETTINGS_MAX_CONCURRENT_STREAMS];
  }
  if ((flags & 1 << IDX_SETTINGS_MAX_HEADER_LIST_SIZE) === 1 << IDX_SETTINGS_MAX_HEADER_LIST_SIZE) {
    holder.maxHeaderListSize = holder.maxHeaderSize = settingsBuffer[IDX_SETTINGS_MAX_HEADER_LIST_SIZE];
  }
  if ((flags & 1 << IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL) === 1 << IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL) {
    holder.enableConnectProtocol = settingsBuffer[IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL] === 1;
  }
  if (settingsBuffer[IDX_SETTINGS_FLAGS + 1]) holder.customSettings = addCustomSettingsToObj();
  return holder;
}

// Remote is a boolean. true to fetch remote settings, false to fetch local.
// this is only called internally
function getSettings(session, remote) {
  if (remote) session.remoteSettings();else session.localSettings();
  var toRet = {
    headerTableSize: settingsBuffer[IDX_SETTINGS_HEADER_TABLE_SIZE],
    enablePush: !!settingsBuffer[IDX_SETTINGS_ENABLE_PUSH],
    initialWindowSize: settingsBuffer[IDX_SETTINGS_INITIAL_WINDOW_SIZE],
    maxFrameSize: settingsBuffer[IDX_SETTINGS_MAX_FRAME_SIZE],
    maxConcurrentStreams: settingsBuffer[IDX_SETTINGS_MAX_CONCURRENT_STREAMS],
    maxHeaderListSize: settingsBuffer[IDX_SETTINGS_MAX_HEADER_LIST_SIZE],
    maxHeaderSize: settingsBuffer[IDX_SETTINGS_MAX_HEADER_LIST_SIZE],
    enableConnectProtocol: !!settingsBuffer[IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL]
  };
  if (settingsBuffer[IDX_SETTINGS_FLAGS + 1]) toRet.customSettings = addCustomSettingsToObj();
  return toRet;
}
function updateSettingsBuffer(settings) {
  var flags = 0;
  var numCustomSettings = 0;
  if (typeof settings.customSettings === 'object') {
    var customSettings = settings.customSettings;
    for (var setting in customSettings) {
      var val = customSettings[setting];
      if (typeof val === 'number') {
        var set = false;
        var nsetting = _Number(setting);
        if (NumberIsNaN(nsetting) || typeof nsetting !== 'number' || 0 >= nsetting || nsetting > 0xffff) throw new ERR_HTTP2_INVALID_SETTING_VALUE.RangeError('Range Error', nsetting, 0, 0xffff);
        if (NumberIsNaN(val) || typeof val !== 'number' || 0 >= val || val > 0xffffffff) throw new ERR_HTTP2_INVALID_SETTING_VALUE.RangeError('Range Error', val, 0, 0xffffffff);
        if (nsetting < IDX_SETTINGS_FLAGS) {
          set = true;
          switch (nsetting) {
            case IDX_SETTINGS_HEADER_TABLE_SIZE:
              flags |= 1 << IDX_SETTINGS_HEADER_TABLE_SIZE;
              settingsBuffer[IDX_SETTINGS_HEADER_TABLE_SIZE] = val;
              break;
            case IDX_SETTINGS_ENABLE_PUSH:
              flags |= 1 << IDX_SETTINGS_ENABLE_PUSH;
              settingsBuffer[IDX_SETTINGS_ENABLE_PUSH] = val;
              break;
            case IDX_SETTINGS_INITIAL_WINDOW_SIZE:
              flags |= 1 << IDX_SETTINGS_INITIAL_WINDOW_SIZE;
              settingsBuffer[IDX_SETTINGS_INITIAL_WINDOW_SIZE] = val;
              break;
            case IDX_SETTINGS_MAX_FRAME_SIZE:
              flags |= 1 << IDX_SETTINGS_MAX_FRAME_SIZE;
              settingsBuffer[IDX_SETTINGS_MAX_FRAME_SIZE] = val;
              break;
            case IDX_SETTINGS_MAX_CONCURRENT_STREAMS:
              flags |= 1 << IDX_SETTINGS_MAX_CONCURRENT_STREAMS;
              settingsBuffer[IDX_SETTINGS_MAX_CONCURRENT_STREAMS] = val;
              break;
            case IDX_SETTINGS_MAX_HEADER_LIST_SIZE:
              flags |= 1 << IDX_SETTINGS_MAX_HEADER_LIST_SIZE;
              settingsBuffer[IDX_SETTINGS_MAX_HEADER_LIST_SIZE] = val;
              break;
            case IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL:
              flags |= 1 << IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL;
              settingsBuffer[IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL] = val;
              break;
            default:
              set = false;
              break;
          }
        }
        if (!set) {
          // not supported
          var i = 0;
          while (i < numCustomSettings) {
            if (settingsBuffer[IDX_SETTINGS_FLAGS + 1 + 2 * i + 1] === nsetting) {
              settingsBuffer[IDX_SETTINGS_FLAGS + 1 + 2 * i + 2] = val;
              break;
            }
            i++;
          }
          if (i === numCustomSettings) {
            if (numCustomSettings === MAX_ADDITIONAL_SETTINGS) throw new ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS();
            settingsBuffer[IDX_SETTINGS_FLAGS + 1 + 2 * numCustomSettings + 1] = nsetting;
            settingsBuffer[IDX_SETTINGS_FLAGS + 1 + 2 * numCustomSettings + 2] = val;
            numCustomSettings++;
          }
        }
      }
    }
  }
  settingsBuffer[IDX_SETTINGS_FLAGS + 1] = numCustomSettings;
  if (typeof settings.headerTableSize === 'number') {
    flags |= 1 << IDX_SETTINGS_HEADER_TABLE_SIZE;
    settingsBuffer[IDX_SETTINGS_HEADER_TABLE_SIZE] = settings.headerTableSize;
  }
  if (typeof settings.maxConcurrentStreams === 'number') {
    flags |= 1 << IDX_SETTINGS_MAX_CONCURRENT_STREAMS;
    settingsBuffer[IDX_SETTINGS_MAX_CONCURRENT_STREAMS] = settings.maxConcurrentStreams;
  }
  if (typeof settings.initialWindowSize === 'number') {
    flags |= 1 << IDX_SETTINGS_INITIAL_WINDOW_SIZE;
    settingsBuffer[IDX_SETTINGS_INITIAL_WINDOW_SIZE] = settings.initialWindowSize;
  }
  if (typeof settings.maxFrameSize === 'number') {
    flags |= 1 << IDX_SETTINGS_MAX_FRAME_SIZE;
    settingsBuffer[IDX_SETTINGS_MAX_FRAME_SIZE] = settings.maxFrameSize;
  }
  if (typeof settings.maxHeaderListSize === 'number' || typeof settings.maxHeaderSize === 'number') {
    flags |= 1 << IDX_SETTINGS_MAX_HEADER_LIST_SIZE;
    if (settings.maxHeaderSize !== undefined && settings.maxHeaderSize !== settings.maxHeaderListSize) {
      process.emitWarning('settings.maxHeaderSize overwrite settings.maxHeaderListSize');
      settingsBuffer[IDX_SETTINGS_MAX_HEADER_LIST_SIZE] = settings.maxHeaderSize;
    } else {
      settingsBuffer[IDX_SETTINGS_MAX_HEADER_LIST_SIZE] = settings.maxHeaderListSize;
    }
  }
  if (typeof settings.enablePush === 'boolean') {
    flags |= 1 << IDX_SETTINGS_ENABLE_PUSH;
    settingsBuffer[IDX_SETTINGS_ENABLE_PUSH] = _Number(settings.enablePush);
  }
  if (typeof settings.enableConnectProtocol === 'boolean') {
    flags |= 1 << IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL;
    settingsBuffer[IDX_SETTINGS_ENABLE_CONNECT_PROTOCOL] = _Number(settings.enableConnectProtocol);
  }
  settingsBuffer[IDX_SETTINGS_FLAGS] = flags;
}
function remoteCustomSettingsToBuffer(remoteCustomSettings) {
  if (remoteCustomSettings.length > MAX_ADDITIONAL_SETTINGS) throw new ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS();
  var numCustomSettings = 0;
  for (var i = 0; i < remoteCustomSettings.length; i++) {
    var nsetting = remoteCustomSettings[i];
    if (typeof nsetting === 'number' && nsetting <= 0xffff && nsetting >= 0) {
      settingsBuffer[IDX_SETTINGS_FLAGS + 1 + 2 * numCustomSettings + 1] = nsetting;
      numCustomSettings++;
    } else throw new ERR_HTTP2_INVALID_SETTING_VALUE.RangeError('Range Error', nsetting, 0, 0xffff);
  }
  settingsBuffer[IDX_SETTINGS_FLAGS + 1] = numCustomSettings;
}
function getSessionState(session) {
  session.refreshState();
  return {
    effectiveLocalWindowSize: sessionState[IDX_SESSION_STATE_EFFECTIVE_LOCAL_WINDOW_SIZE],
    effectiveRecvDataLength: sessionState[IDX_SESSION_STATE_EFFECTIVE_RECV_DATA_LENGTH],
    nextStreamID: sessionState[IDX_SESSION_STATE_NEXT_STREAM_ID],
    localWindowSize: sessionState[IDX_SESSION_STATE_LOCAL_WINDOW_SIZE],
    lastProcStreamID: sessionState[IDX_SESSION_STATE_LAST_PROC_STREAM_ID],
    remoteWindowSize: sessionState[IDX_SESSION_STATE_REMOTE_WINDOW_SIZE],
    outboundQueueSize: sessionState[IDX_SESSION_STATE_OUTBOUND_QUEUE_SIZE],
    deflateDynamicTableSize: sessionState[IDX_SESSION_STATE_HD_DEFLATE_DYNAMIC_TABLE_SIZE],
    inflateDynamicTableSize: sessionState[IDX_SESSION_STATE_HD_INFLATE_DYNAMIC_TABLE_SIZE]
  };
}
function getStreamState(stream) {
  stream.refreshState();
  return {
    state: streamState[IDX_STREAM_STATE],
    weight: streamState[IDX_STREAM_STATE_WEIGHT],
    sumDependencyWeight: streamState[IDX_STREAM_STATE_SUM_DEPENDENCY_WEIGHT],
    localClose: streamState[IDX_STREAM_STATE_LOCAL_CLOSE],
    remoteClose: streamState[IDX_STREAM_STATE_REMOTE_CLOSE],
    localWindowSize: streamState[IDX_STREAM_STATE_LOCAL_WINDOW_SIZE]
  };
}
function isIllegalConnectionSpecificHeader(name, value) {
  switch (name) {
    case HTTP2_HEADER_CONNECTION:
    case HTTP2_HEADER_UPGRADE:
    case HTTP2_HEADER_HTTP2_SETTINGS:
    case HTTP2_HEADER_KEEP_ALIVE:
    case HTTP2_HEADER_PROXY_CONNECTION:
    case HTTP2_HEADER_TRANSFER_ENCODING:
      return true;
    case HTTP2_HEADER_TE:
      return value !== 'trailers';
    default:
      return false;
  }
}
var assertValidPseudoHeader = hideStackFrames(key => {
  if (!kValidPseudoHeaders.has(key)) {
    throw new ERR_HTTP2_INVALID_PSEUDOHEADER(key);
  }
});
var assertValidPseudoHeaderResponse = hideStackFrames(key => {
  if (key !== ':status') {
    throw new ERR_HTTP2_INVALID_PSEUDOHEADER(key);
  }
});
var assertValidPseudoHeaderTrailer = hideStackFrames(key => {
  throw new ERR_HTTP2_INVALID_PSEUDOHEADER(key);
});

/**
 * Takes a request headers array, validates it and sets defaults, and returns
 * the resulting headers in NgHeaders string list format.
 * @returns {object}
 */
function prepareRequestHeadersArray(headers, session) {
  var method;
  var scheme;
  var authority;
  var path;
  var protocol;

  // Extract the key pseudo header values from the headers array.
  for (var i = 0; i < headers.length; i += 2) {
    if (headers[i][0] !== ':') {
      continue;
    }
    var header = headers[i].toLowerCase();
    var value = headers[i + 1];
    if (header === HTTP2_HEADER_METHOD) {
      method = value;
    } else if (header === HTTP2_HEADER_SCHEME) {
      scheme = value;
    } else if (header === HTTP2_HEADER_AUTHORITY) {
      authority = value;
    } else if (header === HTTP2_HEADER_PATH) {
      path = value;
    } else if (header === HTTP2_HEADER_PROTOCOL) {
      protocol = value;
    }
  }

  // We then build an array of any missing pseudo headers, to prepend
  // default values to the given header array:
  var additionalPseudoHeaders = [];
  if (method === undefined) {
    method = HTTP2_METHOD_GET;
    additionalPseudoHeaders.push(HTTP2_HEADER_METHOD, method);
  }
  var connect = method === HTTP2_METHOD_CONNECT;
  if (!connect || protocol !== undefined) {
    if (authority === undefined && headers[HTTP2_HEADER_HOST] === undefined) {
      authority = session[kAuthority];
      additionalPseudoHeaders.push(HTTP2_HEADER_AUTHORITY, authority);
    }
    if (scheme === undefined) {
      scheme = session[kProtocol].slice(0, -1);
      additionalPseudoHeaders.push(HTTP2_HEADER_SCHEME, scheme);
    }
    if (path === undefined) {
      additionalPseudoHeaders.push(HTTP2_HEADER_PATH, '/');
    }
  } else {
    if (authority === undefined) throw new ERR_HTTP2_CONNECT_AUTHORITY();
    if (scheme !== undefined) throw new ERR_HTTP2_CONNECT_SCHEME();
    if (path !== undefined) throw new ERR_HTTP2_CONNECT_PATH();
  }
  var rawHeaders = additionalPseudoHeaders.length ? additionalPseudoHeaders.concat(headers) : headers;
  if (headers[kSensitiveHeaders] !== undefined) {
    rawHeaders[kSensitiveHeaders] = headers[kSensitiveHeaders];
  }
  var headersList = buildNgHeaderString(rawHeaders, assertValidPseudoHeader, session[kStrictSingleValueFields]);
  return {
    rawHeaders,
    headersList,
    scheme,
    authority: authority ?? headers[HTTP2_HEADER_HOST],
    method
  };
}

/**
 * Takes a request headers object, validates it and sets defaults, and returns
 * the resulting headers in object format and NgHeaders string list format.
 * @returns {object}
 */
function prepareRequestHeadersObject(headers, session) {
  var headersObject = ObjectAssign({
    __proto__: null
  }, headers);
  if (headersObject[HTTP2_HEADER_METHOD] === undefined) {
    headersObject[HTTP2_HEADER_METHOD] = HTTP2_METHOD_GET;
  }
  var connect = headersObject[HTTP2_HEADER_METHOD] === HTTP2_METHOD_CONNECT;
  if (!connect || headersObject[HTTP2_HEADER_PROTOCOL] !== undefined) {
    if (getAuthority(headersObject) === undefined) headersObject[HTTP2_HEADER_AUTHORITY] = session[kAuthority];
    if (headersObject[HTTP2_HEADER_SCHEME] === undefined) headersObject[HTTP2_HEADER_SCHEME] = session[kProtocol].slice(0, -1);
    if (headersObject[HTTP2_HEADER_PATH] === undefined) headersObject[HTTP2_HEADER_PATH] = '/';
  } else {
    if (headersObject[HTTP2_HEADER_AUTHORITY] === undefined) throw new ERR_HTTP2_CONNECT_AUTHORITY();
    if (headersObject[HTTP2_HEADER_SCHEME] !== undefined) throw new ERR_HTTP2_CONNECT_SCHEME();
    if (headersObject[HTTP2_HEADER_PATH] !== undefined) throw new ERR_HTTP2_CONNECT_PATH();
  }
  var headersList = buildNgHeaderString(headersObject, assertValidPseudoHeader, session[kStrictSingleValueFields]);
  return {
    headersObject,
    headersList,
    scheme: headersObject[HTTP2_HEADER_SCHEME],
    authority: getAuthority(headersObject),
    method: headersObject[HTTP2_HEADER_METHOD]
  };
}
var emptyArray = [];
var kNeverIndexFlag = StringFromCharCode(NGHTTP2_NV_FLAG_NO_INDEX);
var kNoHeaderFlags = StringFromCharCode(NGHTTP2_NV_FLAG_NONE);

/**
 * Builds an NgHeader string + header count value, validating the header key
 * format, rejecting illegal header configurations, and marking sensitive headers
 * that should not be indexed en route. This takes either a flat map of
 * raw headers ([k1, v1, k2, v2]) or a header object ({ k1: v1, k2: [v2, v3] }).
 *
 * Takes a validation function to check the pseudo-headers allowed for this
 * message, and a boolean indicating whether to enforce strict single-value
 * header validation.
 * @returns {[string, number]}
 */
function buildNgHeaderString(arrayOrMap, validatePseudoHeaderValue, strictSingleValueFields) {
  var headers = '';
  var pseudoHeaders = '';
  var count = 0;
  var singles = new SafeSet();
  var sensitiveHeaders = arrayOrMap[kSensitiveHeaders] || emptyArray;
  var neverIndex = sensitiveHeaders.map(v => v.toLowerCase());
  function processHeader(key, value) {
    key = key.toLowerCase();
    var isStrictSingleValueField = strictSingleValueFields && kSingleValueFields.has(key);
    var isArray = ArrayIsArray(value);
    if (isArray) {
      switch (value.length) {
        case 0:
          return;
        case 1:
          value = _String(value[0]);
          isArray = false;
          break;
        default:
          if (isStrictSingleValueField) throw new ERR_HTTP2_HEADER_SINGLE_VALUE(key);
      }
    } else {
      value = _String(value);
    }
    if (isStrictSingleValueField) {
      if (singles.has(key)) throw new ERR_HTTP2_HEADER_SINGLE_VALUE(key);
      singles.add(key);
    }
    var flags = neverIndex.includes(key) ? kNeverIndexFlag : kNoHeaderFlags;
    if (key[0] === ':') {
      var err = validatePseudoHeaderValue(key);
      if (err !== undefined) throw err;
      pseudoHeaders += `${key}\0${value}\0${flags}`;
      count++;
      return;
    }
    if (!checkIsHttpToken(key)) {
      throw new ERR_INVALID_HTTP_TOKEN('Header name', key);
    }
    if (isIllegalConnectionSpecificHeader(key, value)) {
      throw new ERR_HTTP2_INVALID_CONNECTION_HEADERS(key);
    }
    if (isArray) {
      for (var j = 0; j < value.length; ++j) {
        var val = _String(value[j]);
        headers += `${key}\0${val}\0${flags}`;
      }
      count += value.length;
      return;
    }
    headers += `${key}\0${value}\0${flags}`;
    count++;
  }
  if (ArrayIsArray(arrayOrMap)) {
    for (var i = 0; i < arrayOrMap.length; i += 2) {
      var key = arrayOrMap[i];
      var value = arrayOrMap[i + 1];
      if (value === undefined || key === '') continue;
      processHeader(key, value);
    }
  } else {
    var keys = ObjectKeys(arrayOrMap);
    for (var _i = 0; _i < keys.length; ++_i) {
      var _key = keys[_i];
      var _value = arrayOrMap[_key];
      if (_value === undefined || _key === '') continue;
      processHeader(_key, _value);
    }
  }
  return [pseudoHeaders + headers, count];
}
var NghttpError = /*#__PURE__*/function (_Error) {
  function NghttpError(integerCode, customErrorCode) {
    var _this;
    _classCallCheck(this, NghttpError);
    _this = _callSuper(this, NghttpError, [customErrorCode ? getMessage(customErrorCode, [], null) : binding.nghttp2ErrorString(integerCode)]);
    _this.code = customErrorCode || 'ERR_HTTP2_ERROR';
    _this.errno = integerCode;
    return _this;
  }
  _inherits(NghttpError, _Error);
  return _createClass(NghttpError, [{
    key: kIsNodeError,
    get: function () {
      return true;
    }
  }, {
    key: "toString",
    value: function toString() {
      return `${this.name} [${this.code}]: ${this.message}`;
    }
  }]);
}(Error);
var assertIsObject = hideStackFrames((value, name, types) => {
  if (value !== undefined && (value === null || typeof value !== 'object' || ArrayIsArray(value))) {
    throw new ERR_INVALID_ARG_TYPE.HideStackFramesError(name, types || 'Object', value);
  }
});
var assertIsArray = hideStackFrames((value, name, types) => {
  if (value !== undefined && (value === null || !ArrayIsArray(value))) {
    throw new ERR_INVALID_ARG_TYPE.HideStackFramesError(name, types || 'Array', value);
  }
});
var assertWithinRange = hideStackFrames(function (name, value) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Infinity;
  if (value !== undefined && (typeof value !== 'number' || value < min || value > max)) {
    throw new ERR_HTTP2_INVALID_SETTING_VALUE.RangeError.HideStackFramesError(name, value, min, max);
  }
});
function toHeaderObject(headers, sensitiveHeaders) {
  var obj = {
    __proto__: null
  };
  for (var n = 0; n < headers.length; n += 2) {
    var name = headers[n];
    var value = headers[n + 1];
    if (name === HTTP2_HEADER_STATUS) value |= 0;
    var existing = obj[name];
    if (existing === undefined) {
      obj[name] = name === HTTP2_HEADER_SET_COOKIE ? [value] : value;
    } else if (!kSingleValueFields.has(name)) {
      switch (name) {
        case HTTP2_HEADER_COOKIE:
          // https://tools.ietf.org/html/rfc7540#section-8.1.2.5
          // "...If there are multiple Cookie header fields after decompression,
          //  these MUST be concatenated into a single octet string using the
          //  two-octet delimiter of 0x3B, 0x20 (the ASCII string "; ") before
          //  being passed into a non-HTTP/2 context."
          obj[name] = `${existing}; ${value}`;
          break;
        case HTTP2_HEADER_SET_COOKIE:
          // https://tools.ietf.org/html/rfc7230#section-3.2.2
          // "Note: In practice, the "Set-Cookie" header field ([RFC6265]) often
          // appears multiple times in a response message and does not use the
          // list syntax, violating the above requirements on multiple header
          // fields with the same name.  Since it cannot be combined into a
          // single field-value, recipients ought to handle "Set-Cookie" as a
          // special case while processing header fields."
          existing.push(value);
          break;
        default:
          // https://tools.ietf.org/html/rfc7230#section-3.2.2
          // "A recipient MAY combine multiple header fields with the same field
          // name into one "field-name: field-value" pair, without changing the
          // semantics of the message, by appending each subsequent field value
          // to the combined field value in order, separated by a comma."
          obj[name] = `${existing}, ${value}`;
          break;
      }
    }
  }
  obj[kSensitiveHeaders] = sensitiveHeaders;
  return obj;
}
function isPayloadMeaningless(method) {
  return kNoPayloadMethods.has(method);
}
function sessionName(type) {
  switch (type) {
    case NGHTTP2_SESSION_CLIENT:
      return 'client';
    case NGHTTP2_SESSION_SERVER:
      return 'server';
    default:
      return '<invalid>';
  }
}
function getAuthority(headers) {
  // For non-CONNECT requests, HTTP/2 allows either :authority
  // or Host to be used equivalently. The first is preferred
  // when making HTTP/2 requests, and the latter is preferred
  // when converting from an HTTP/1 message.
  if (headers[HTTP2_HEADER_AUTHORITY] !== undefined) return headers[HTTP2_HEADER_AUTHORITY];
  if (headers[HTTP2_HEADER_HOST] !== undefined) return headers[HTTP2_HEADER_HOST];
}
module.exports = {
  assertIsObject,
  assertIsArray,
  assertValidPseudoHeader,
  assertValidPseudoHeaderResponse,
  assertValidPseudoHeaderTrailer,
  assertWithinRange,
  buildNgHeaderString,
  getAuthority,
  getDefaultSettings,
  getSessionState,
  getSettings,
  getStreamState,
  isPayloadMeaningless,
  kAuthority,
  kSensitiveHeaders,
  kStrictSingleValueFields,
  kSocket,
  kProtocol,
  kProxySocket,
  kRequest,
  MAX_ADDITIONAL_SETTINGS,
  NghttpError,
  prepareRequestHeadersArray,
  prepareRequestHeadersObject,
  remoteCustomSettingsToBuffer,
  sessionName,
  toHeaderObject,
  updateOptionsBuffer,
  updateSettingsBuffer
};

