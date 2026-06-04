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
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ArrayPrototypePush,
  JSONParse,
  JSONStringify,
  StringPrototypeSplit,
  Symbol: _Symbol,
  TypedArrayPrototypeSubarray
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  StringDecoder
} = require('string_decoder');
var v8 = require('v8');
var {
  isArrayBufferView
} = require('internal/util/types');
var assert = require('internal/assert');
var {
  streamBaseState,
  kLastWriteWasAsync
} = internalBinding('stream_wrap');
var kMessageBuffer = _Symbol('kMessageBuffer');
var kMessageBufferSize = _Symbol('kMessageBufferSize');
var kJSONBuffer = _Symbol('kJSONBuffer');
var kStringDecoder = _Symbol('kStringDecoder');

// Extend V8's serializer APIs to give more JSON-like behaviour in
// some cases; in particular, for native objects this serializes them the same
// way that JSON does rather than throwing an exception.
var kArrayBufferViewTag = 0;
var kNotArrayBufferViewTag = 1;
var ChildProcessSerializer = /*#__PURE__*/function (_v8$DefaultSerializer) {
  function ChildProcessSerializer() {
    _classCallCheck(this, ChildProcessSerializer);
    return _callSuper(this, ChildProcessSerializer, arguments);
  }
  _inherits(ChildProcessSerializer, _v8$DefaultSerializer);
  return _createClass(ChildProcessSerializer, [{
    key: "_writeHostObject",
    value: function _writeHostObject(object) {
      if (isArrayBufferView(object)) {
        this.writeUint32(kArrayBufferViewTag);
        return _superPropGet(ChildProcessSerializer, "_writeHostObject", this, 3)([object]);
      }
      this.writeUint32(kNotArrayBufferViewTag);
      this.writeValue(_objectSpread({}, object));
    }
  }]);
}(v8.DefaultSerializer);
var ChildProcessDeserializer = /*#__PURE__*/function (_v8$DefaultDeserializ) {
  function ChildProcessDeserializer() {
    _classCallCheck(this, ChildProcessDeserializer);
    return _callSuper(this, ChildProcessDeserializer, arguments);
  }
  _inherits(ChildProcessDeserializer, _v8$DefaultDeserializ);
  return _createClass(ChildProcessDeserializer, [{
    key: "_readHostObject",
    value: function _readHostObject() {
      var tag = this.readUint32();
      if (tag === kArrayBufferViewTag) return _superPropGet(ChildProcessDeserializer, "_readHostObject", this, 3)([]);
      assert(tag === kNotArrayBufferViewTag);
      return this.readValue();
    }
  }]);
}(v8.DefaultDeserializer); // Messages are parsed in either of the following formats:
// - Newline-delimited JSON, or
// - V8-serialized buffers, prefixed with their length as a big endian uint32
//   (aka 'advanced')
var advanced = {
  initMessageChannel(channel) {
    channel[kMessageBuffer] = [];
    channel[kMessageBufferSize] = 0;
    channel.buffering = false;
  },
  *parseChannelMessages(channel, readData) {
    if (readData.length === 0) return;
    if (channel[kMessageBufferSize] && channel[kMessageBuffer][0].length < 4) {
      // Message length split into two buffers, so let's concatenate it.
      channel[kMessageBuffer][0] = Buffer.concat([channel[kMessageBuffer][0], readData]);
    } else {
      ArrayPrototypePush(channel[kMessageBuffer], readData);
    }
    channel[kMessageBufferSize] += readData.length;

    // Index 0 should always be present because we just pushed data into it.
    var messageBufferHead = channel[kMessageBuffer][0];
    while (messageBufferHead.length >= 4) {
      // We call `readUInt32BE` manually here, because this is faster than first converting
      // it to a buffer and using `readUInt32BE` on that.
      var fullMessageSize = ((messageBufferHead[0] << 24 | messageBufferHead[1] << 16 | messageBufferHead[2] << 8 | messageBufferHead[3]) >>> 0) + 4;
      if (channel[kMessageBufferSize] < fullMessageSize) break;
      var concatenatedBuffer = channel[kMessageBuffer].length === 1 ? channel[kMessageBuffer][0] : Buffer.concat(channel[kMessageBuffer], channel[kMessageBufferSize]);
      var deserializer = new ChildProcessDeserializer(TypedArrayPrototypeSubarray(concatenatedBuffer, 4, fullMessageSize));
      messageBufferHead = TypedArrayPrototypeSubarray(concatenatedBuffer, fullMessageSize);
      channel[kMessageBufferSize] = messageBufferHead.length;
      channel[kMessageBuffer] = channel[kMessageBufferSize] !== 0 ? [messageBufferHead] : [];
      deserializer.readHeader();
      yield deserializer.readValue();
    }
    channel.buffering = channel[kMessageBufferSize] > 0;
  },
  writeChannelMessage(channel, req, message, handle) {
    var ser = new ChildProcessSerializer();
    // Add 4 bytes, to later populate with message length
    ser.writeRawBytes(Buffer.allocUnsafe(4));
    ser.writeHeader();
    ser.writeValue(message);
    var serializedMessage = ser.releaseBuffer();
    var serializedMessageLength = serializedMessage.length - 4;
    serializedMessage.set([serializedMessageLength >> 24 & 0xFF, serializedMessageLength >> 16 & 0xFF, serializedMessageLength >> 8 & 0xFF, serializedMessageLength & 0xFF], 0);
    var result = channel.writeBuffer(req, serializedMessage, handle);

    // Mirror what stream_base_commons.js does for Buffer retention.
    if (streamBaseState[kLastWriteWasAsync]) req.buffer = serializedMessage;
    return result;
  }
};
var json = {
  initMessageChannel(channel) {
    channel[kJSONBuffer] = '';
    channel[kStringDecoder] = undefined;
  },
  *parseChannelMessages(channel, readData) {
    if (readData.length === 0) return;
    if (channel[kStringDecoder] === undefined) channel[kStringDecoder] = new StringDecoder('utf8');
    var chunks = StringPrototypeSplit(channel[kStringDecoder].write(readData), '\n');
    var numCompleteChunks = chunks.length - 1;
    // Last line does not have trailing linebreak
    var incompleteChunk = chunks[numCompleteChunks];
    if (numCompleteChunks === 0) {
      channel[kJSONBuffer] += incompleteChunk;
    } else {
      chunks[0] = channel[kJSONBuffer] + chunks[0];
      for (var i = 0; i < numCompleteChunks; i++) yield JSONParse(chunks[i]);
      channel[kJSONBuffer] = incompleteChunk;
    }
    channel.buffering = channel[kJSONBuffer].length !== 0;
  },
  writeChannelMessage(channel, req, message, handle) {
    var string = JSONStringify(message) + '\n';
    return channel.writeUtf8String(req, string, handle);
  }
};
module.exports = {
  advanced,
  json
};

