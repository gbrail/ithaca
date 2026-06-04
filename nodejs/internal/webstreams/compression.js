'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ObjectDefineProperties,
  SymbolToStringTag
} = primordials;
var {
  newReadableWritablePairFromDuplex,
  kValidateChunk,
  kDestroyOnSyncError
} = require('internal/webstreams/adapters');
var {
  customInspect
} = require('internal/webstreams/util');
var {
  isArrayBufferView,
  isSharedArrayBuffer
} = require('internal/util/types');
var {
  customInspectSymbol: kInspect,
  kEnumerableProperty
} = require('internal/util');
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = require('internal/errors');
var {
  createEnumConverter
} = require('internal/webidl');
var zlib;
function lazyZlib() {
  zlib ??= require('zlib');
  return zlib;
}

// Per the Compression Streams spec, chunks must be BufferSource
// (ArrayBuffer or ArrayBufferView not backed by SharedArrayBuffer).
function validateBufferSourceChunk(chunk) {
  if (isSharedArrayBuffer(isArrayBufferView(chunk) ? chunk.buffer : chunk)) {
    throw new ERR_INVALID_ARG_TYPE('chunk', ['ArrayBuffer', 'Buffer', 'TypedArray', 'DataView'], chunk);
  }
}
var formatConverter = createEnumConverter('CompressionFormat', ['deflate', 'deflate-raw', 'gzip', 'brotli']);

/**
 * @typedef {import('./readablestream').ReadableStream} ReadableStream
 * @typedef {import('./writablestream').WritableStream} WritableStream
 */
var _handle = /*#__PURE__*/new WeakMap();
var _transform = /*#__PURE__*/new WeakMap();
var CompressionStream = /*#__PURE__*/function () {
  /**
   * @param {'deflate'|'deflate-raw'|'gzip'|'brotli'} format
   */
  function CompressionStream(format) {
    _classCallCheck(this, CompressionStream);
    _classPrivateFieldInitSpec(this, _handle, void 0);
    _classPrivateFieldInitSpec(this, _transform, void 0);
    format = formatConverter(format, {
      prefix: "Failed to construct 'CompressionStream'",
      context: '1st argument'
    });
    switch (format) {
      case 'deflate':
        _classPrivateFieldSet(_handle, this, lazyZlib().createDeflate());
        break;
      case 'deflate-raw':
        _classPrivateFieldSet(_handle, this, lazyZlib().createDeflateRaw());
        break;
      case 'gzip':
        _classPrivateFieldSet(_handle, this, lazyZlib().createGzip());
        break;
      case 'brotli':
        _classPrivateFieldSet(_handle, this, lazyZlib().createBrotliCompress());
        break;
    }
    _classPrivateFieldSet(_transform, this, newReadableWritablePairFromDuplex(_classPrivateFieldGet(_handle, this), {
      [kValidateChunk]: validateBufferSourceChunk,
      [kDestroyOnSyncError]: true
    }));
  }

  /**
   * @readonly
   * @type {ReadableStream}
   */
  return _createClass(CompressionStream, [{
    key: "readable",
    get: function () {
      return _classPrivateFieldGet(_transform, this).readable;
    }

    /**
     * @readonly
     * @type {WritableStream}
     */
  }, {
    key: "writable",
    get: function () {
      return _classPrivateFieldGet(_transform, this).writable;
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, 'CompressionStream', {
        readable: _classPrivateFieldGet(_transform, this).readable,
        writable: _classPrivateFieldGet(_transform, this).writable
      });
    }
  }]);
}();
var _handle2 = /*#__PURE__*/new WeakMap();
var _transform2 = /*#__PURE__*/new WeakMap();
var DecompressionStream = /*#__PURE__*/function () {
  /**
   * @param {'deflate'|'deflate-raw'|'gzip'|'brotli'} format
   */
  function DecompressionStream(format) {
    _classCallCheck(this, DecompressionStream);
    _classPrivateFieldInitSpec(this, _handle2, void 0);
    _classPrivateFieldInitSpec(this, _transform2, void 0);
    format = formatConverter(format, {
      prefix: "Failed to construct 'DecompressionStream'",
      context: '1st argument'
    });
    switch (format) {
      case 'deflate':
        _classPrivateFieldSet(_handle2, this, lazyZlib().createInflate({
          rejectGarbageAfterEnd: true
        }));
        break;
      case 'deflate-raw':
        _classPrivateFieldSet(_handle2, this, lazyZlib().createInflateRaw({
          rejectGarbageAfterEnd: true
        }));
        break;
      case 'gzip':
        _classPrivateFieldSet(_handle2, this, lazyZlib().createGunzip({
          rejectGarbageAfterEnd: true
        }));
        break;
      case 'brotli':
        _classPrivateFieldSet(_handle2, this, lazyZlib().createBrotliDecompress({
          rejectGarbageAfterEnd: true
        }));
        break;
    }
    _classPrivateFieldSet(_transform2, this, newReadableWritablePairFromDuplex(_classPrivateFieldGet(_handle2, this), {
      [kValidateChunk]: validateBufferSourceChunk,
      [kDestroyOnSyncError]: true
    }));
  }

  /**
   * @readonly
   * @type {ReadableStream}
   */
  return _createClass(DecompressionStream, [{
    key: "readable",
    get: function () {
      return _classPrivateFieldGet(_transform2, this).readable;
    }

    /**
     * @readonly
     * @type {WritableStream}
     */
  }, {
    key: "writable",
    get: function () {
      return _classPrivateFieldGet(_transform2, this).writable;
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, 'DecompressionStream', {
        readable: _classPrivateFieldGet(_transform2, this).readable,
        writable: _classPrivateFieldGet(_transform2, this).writable
      });
    }
  }]);
}();
ObjectDefineProperties(CompressionStream.prototype, {
  readable: kEnumerableProperty,
  writable: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'CompressionStream'
  }
});
ObjectDefineProperties(DecompressionStream.prototype, {
  readable: kEnumerableProperty,
  writable: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'DecompressionStream'
  }
});
module.exports = {
  CompressionStream,
  DecompressionStream
};

