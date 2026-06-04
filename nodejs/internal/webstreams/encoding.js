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
  String: _String,
  StringPrototypeCharCodeAt,
  Uint8Array
} = primordials;
var {
  TextDecoder,
  TextEncoder
} = require('internal/encoding');
var {
  TransformStream
} = require('internal/webstreams/transformstream');
var {
  customInspect
} = require('internal/webstreams/util');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_THIS
  }
} = require('internal/errors');
var {
  customInspectSymbol: kInspect,
  kEmptyObject,
  kEnumerableProperty
} = require('internal/util');

/**
 * @typedef {import('./readablestream').ReadableStream} ReadableStream
 * @typedef {import('./writablestream').WritableStream} WritableStream
 */
var _pendingHighSurrogate = /*#__PURE__*/new WeakMap();
var _handle = /*#__PURE__*/new WeakMap();
var _transform = /*#__PURE__*/new WeakMap();
var TextEncoderStream = /*#__PURE__*/function () {
  function TextEncoderStream() {
    _classCallCheck(this, TextEncoderStream);
    _classPrivateFieldInitSpec(this, _pendingHighSurrogate, null);
    _classPrivateFieldInitSpec(this, _handle, void 0);
    _classPrivateFieldInitSpec(this, _transform, void 0);
    _classPrivateFieldSet(_handle, this, new TextEncoder());
    _classPrivateFieldSet(_transform, this, new TransformStream({
      transform: (chunk, controller) => {
        // https://encoding.spec.whatwg.org/#encode-and-enqueue-a-chunk
        chunk = _String(chunk);
        var finalChunk = '';
        for (var i = 0; i < chunk.length; i++) {
          var item = chunk[i];
          var codeUnit = StringPrototypeCharCodeAt(item, 0);
          if (_classPrivateFieldGet(_pendingHighSurrogate, this) !== null) {
            var highSurrogate = _classPrivateFieldGet(_pendingHighSurrogate, this);
            _classPrivateFieldSet(_pendingHighSurrogate, this, null);
            if (0xDC00 <= codeUnit && codeUnit <= 0xDFFF) {
              finalChunk += highSurrogate + item;
              continue;
            }
            finalChunk += '\uFFFD';
          }
          if (0xD800 <= codeUnit && codeUnit <= 0xDBFF) {
            _classPrivateFieldSet(_pendingHighSurrogate, this, item);
            continue;
          }
          if (0xDC00 <= codeUnit && codeUnit <= 0xDFFF) {
            finalChunk += '\uFFFD';
            continue;
          }
          finalChunk += item;
        }
        if (finalChunk) {
          var value = _classPrivateFieldGet(_handle, this).encode(finalChunk);
          controller.enqueue(value);
        }
      },
      flush: controller => {
        // https://encoding.spec.whatwg.org/#encode-and-flush
        if (_classPrivateFieldGet(_pendingHighSurrogate, this) !== null) {
          controller.enqueue(new Uint8Array([0xEF, 0xBF, 0xBD]));
        }
      }
    }));
  }

  /**
   * @readonly
   * @type {string}
   */
  return _createClass(TextEncoderStream, [{
    key: "encoding",
    get: function () {
      return _classPrivateFieldGet(_handle, this).encoding;
    }

    /**
     * @readonly
     * @type {ReadableStream}
     */
  }, {
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
      if (this == null) throw new ERR_INVALID_THIS('TextEncoderStream');
      return customInspect(depth, options, 'TextEncoderStream', {
        encoding: _classPrivateFieldGet(_handle, this).encoding,
        readable: _classPrivateFieldGet(_transform, this).readable,
        writable: _classPrivateFieldGet(_transform, this).writable
      });
    }
  }]);
}();
var _handle2 = /*#__PURE__*/new WeakMap();
var _transform2 = /*#__PURE__*/new WeakMap();
var TextDecoderStream = /*#__PURE__*/function () {
  /**
   * @param {string} [encoding]
   * @param {{
   *   fatal? : boolean,
   *   ignoreBOM? : boolean,
   * }} [options]
   */
  function TextDecoderStream() {
    var encoding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'utf-8';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, TextDecoderStream);
    _classPrivateFieldInitSpec(this, _handle2, void 0);
    _classPrivateFieldInitSpec(this, _transform2, void 0);
    _classPrivateFieldSet(_handle2, this, new TextDecoder(encoding, options));
    _classPrivateFieldSet(_transform2, this, new TransformStream({
      transform: (chunk, controller) => {
        if (chunk === undefined) {
          throw new ERR_INVALID_ARG_TYPE('chunk', 'string', chunk);
        }
        var value = _classPrivateFieldGet(_handle2, this).decode(chunk, {
          stream: true
        });
        if (value) controller.enqueue(value);
      },
      flush: controller => {
        var value = _classPrivateFieldGet(_handle2, this).decode();
        if (value) controller.enqueue(value);
        controller.terminate();
      }
    }));
  }

  /**
   * @readonly
   * @type {string}
   */
  return _createClass(TextDecoderStream, [{
    key: "encoding",
    get: function () {
      return _classPrivateFieldGet(_handle2, this).encoding;
    }

    /**
     * @readonly
     * @type {boolean}
     */
  }, {
    key: "fatal",
    get: function () {
      return _classPrivateFieldGet(_handle2, this).fatal;
    }

    /**
     * @readonly
     * @type {boolean}
     */
  }, {
    key: "ignoreBOM",
    get: function () {
      return _classPrivateFieldGet(_handle2, this).ignoreBOM;
    }

    /**
     * @readonly
     * @type {ReadableStream}
     */
  }, {
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
      if (this == null) throw new ERR_INVALID_THIS('TextDecoderStream');
      return customInspect(depth, options, 'TextDecoderStream', {
        encoding: _classPrivateFieldGet(_handle2, this).encoding,
        fatal: _classPrivateFieldGet(_handle2, this).fatal,
        ignoreBOM: _classPrivateFieldGet(_handle2, this).ignoreBOM,
        readable: _classPrivateFieldGet(_transform2, this).readable,
        writable: _classPrivateFieldGet(_transform2, this).writable
      });
    }
  }]);
}();
ObjectDefineProperties(TextEncoderStream.prototype, {
  encoding: kEnumerableProperty,
  readable: kEnumerableProperty,
  writable: kEnumerableProperty
});
ObjectDefineProperties(TextDecoderStream.prototype, {
  encoding: kEnumerableProperty,
  fatal: kEnumerableProperty,
  ignoreBOM: kEnumerableProperty,
  readable: kEnumerableProperty,
  writable: kEnumerableProperty
});
module.exports = {
  TextEncoderStream,
  TextDecoderStream
};

