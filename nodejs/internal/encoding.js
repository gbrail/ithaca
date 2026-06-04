'use strict';

// An implementation of the WHATWG Encoding Standard
// https://encoding.spec.whatwg.org
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  Boolean,
  ObjectDefineProperties,
  ObjectGetOwnPropertyDescriptors,
  ObjectSetPrototypeOf,
  ObjectValues,
  SafeMap,
  StringPrototypeSlice,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  FastBuffer
} = require('internal/buffer');
var {
  ERR_ENCODING_NOT_SUPPORTED,
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_THIS,
  ERR_NO_ICU
} = require('internal/errors').codes;
var kSingleByte = _Symbol('single-byte');
var kHandle = _Symbol('handle');
var kFlags = _Symbol('flags');
var kEncoding = _Symbol('encoding');
var kDecoder = _Symbol('decoder');
var kChunk = _Symbol('chunk');
var kFatal = _Symbol('kFatal');
var kUTF8FastPath = _Symbol('kUTF8FastPath');
var kIgnoreBOM = _Symbol('kIgnoreBOM');
var {
  isSinglebyteEncoding,
  createSinglebyteDecoder
} = require('internal/encoding/single-byte');
var {
  unfinishedBytesUtf8,
  mergePrefixUtf8
} = require('internal/encoding/util');
var {
  getConstructorOf,
  customInspectSymbol: inspect,
  kEmptyObject,
  kEnumerableProperty
} = require('internal/util');
var {
  isAnyArrayBuffer,
  isArrayBufferView,
  isUint8Array
} = require('internal/util/types');
var {
  validateString,
  validateObject,
  kValidateObjectAllowObjectsAndNull
} = require('internal/validators');
var {
  hasIntl
} = internalBinding('config');
var binding = internalBinding('encoding_binding');
var {
  encodeInto,
  encodeIntoResults,
  encodeUtf8String,
  decodeUTF8
} = binding;
function validateDecoder(obj) {
  if (obj == null || obj[kDecoder] !== true) throw new ERR_INVALID_THIS('TextDecoder');
}
var CONVERTER_FLAGS_FLUSH = 0x1;
var CONVERTER_FLAGS_FATAL = 0x2;
var CONVERTER_FLAGS_IGNORE_BOM = 0x4;
var empty = new FastBuffer();
var encodings = new SafeMap([['unicode-1-1-utf-8', 'utf-8'], ['unicode11utf8', 'utf-8'], ['unicode20utf8', 'utf-8'], ['utf8', 'utf-8'], ['utf-8', 'utf-8'], ['x-unicode20utf8', 'utf-8'], ['866', 'ibm866'], ['cp866', 'ibm866'], ['csibm866', 'ibm866'], ['ibm866', 'ibm866'], ['csisolatin2', 'iso-8859-2'], ['iso-8859-2', 'iso-8859-2'], ['iso-ir-101', 'iso-8859-2'], ['iso8859-2', 'iso-8859-2'], ['iso88592', 'iso-8859-2'], ['iso_8859-2', 'iso-8859-2'], ['iso_8859-2:1987', 'iso-8859-2'], ['l2', 'iso-8859-2'], ['latin2', 'iso-8859-2'], ['csisolatin3', 'iso-8859-3'], ['iso-8859-3', 'iso-8859-3'], ['iso-ir-109', 'iso-8859-3'], ['iso8859-3', 'iso-8859-3'], ['iso88593', 'iso-8859-3'], ['iso_8859-3', 'iso-8859-3'], ['iso_8859-3:1988', 'iso-8859-3'], ['l3', 'iso-8859-3'], ['latin3', 'iso-8859-3'], ['csisolatin4', 'iso-8859-4'], ['iso-8859-4', 'iso-8859-4'], ['iso-ir-110', 'iso-8859-4'], ['iso8859-4', 'iso-8859-4'], ['iso88594', 'iso-8859-4'], ['iso_8859-4', 'iso-8859-4'], ['iso_8859-4:1988', 'iso-8859-4'], ['l4', 'iso-8859-4'], ['latin4', 'iso-8859-4'], ['csisolatincyrillic', 'iso-8859-5'], ['cyrillic', 'iso-8859-5'], ['iso-8859-5', 'iso-8859-5'], ['iso-ir-144', 'iso-8859-5'], ['iso8859-5', 'iso-8859-5'], ['iso88595', 'iso-8859-5'], ['iso_8859-5', 'iso-8859-5'], ['iso_8859-5:1988', 'iso-8859-5'], ['arabic', 'iso-8859-6'], ['asmo-708', 'iso-8859-6'], ['csiso88596e', 'iso-8859-6'], ['csiso88596i', 'iso-8859-6'], ['csisolatinarabic', 'iso-8859-6'], ['ecma-114', 'iso-8859-6'], ['iso-8859-6', 'iso-8859-6'], ['iso-8859-6-e', 'iso-8859-6'], ['iso-8859-6-i', 'iso-8859-6'], ['iso-ir-127', 'iso-8859-6'], ['iso8859-6', 'iso-8859-6'], ['iso88596', 'iso-8859-6'], ['iso_8859-6', 'iso-8859-6'], ['iso_8859-6:1987', 'iso-8859-6'], ['csisolatingreek', 'iso-8859-7'], ['ecma-118', 'iso-8859-7'], ['elot_928', 'iso-8859-7'], ['greek', 'iso-8859-7'], ['greek8', 'iso-8859-7'], ['iso-8859-7', 'iso-8859-7'], ['iso-ir-126', 'iso-8859-7'], ['iso8859-7', 'iso-8859-7'], ['iso88597', 'iso-8859-7'], ['iso_8859-7', 'iso-8859-7'], ['iso_8859-7:1987', 'iso-8859-7'], ['sun_eu_greek', 'iso-8859-7'], ['csiso88598e', 'iso-8859-8'], ['csisolatinhebrew', 'iso-8859-8'], ['hebrew', 'iso-8859-8'], ['iso-8859-8', 'iso-8859-8'], ['iso-8859-8-e', 'iso-8859-8'], ['iso-ir-138', 'iso-8859-8'], ['iso8859-8', 'iso-8859-8'], ['iso88598', 'iso-8859-8'], ['iso_8859-8', 'iso-8859-8'], ['iso_8859-8:1988', 'iso-8859-8'], ['visual', 'iso-8859-8'], ['csiso88598i', 'iso-8859-8-i'], ['iso-8859-8-i', 'iso-8859-8-i'], ['logical', 'iso-8859-8-i'], ['csisolatin6', 'iso-8859-10'], ['iso-8859-10', 'iso-8859-10'], ['iso-ir-157', 'iso-8859-10'], ['iso8859-10', 'iso-8859-10'], ['iso885910', 'iso-8859-10'], ['l6', 'iso-8859-10'], ['latin6', 'iso-8859-10'], ['iso-8859-13', 'iso-8859-13'], ['iso8859-13', 'iso-8859-13'], ['iso885913', 'iso-8859-13'], ['iso-8859-14', 'iso-8859-14'], ['iso8859-14', 'iso-8859-14'], ['iso885914', 'iso-8859-14'], ['csisolatin9', 'iso-8859-15'], ['iso-8859-15', 'iso-8859-15'], ['iso8859-15', 'iso-8859-15'], ['iso885915', 'iso-8859-15'], ['iso_8859-15', 'iso-8859-15'], ['l9', 'iso-8859-15'], ['iso-8859-16', 'iso-8859-16'], ['cskoi8r', 'koi8-r'], ['koi', 'koi8-r'], ['koi8', 'koi8-r'], ['koi8-r', 'koi8-r'], ['koi8_r', 'koi8-r'], ['koi8-ru', 'koi8-u'], ['koi8-u', 'koi8-u'], ['csmacintosh', 'macintosh'], ['mac', 'macintosh'], ['macintosh', 'macintosh'], ['x-mac-roman', 'macintosh'], ['dos-874', 'windows-874'], ['iso-8859-11', 'windows-874'], ['iso8859-11', 'windows-874'], ['iso885911', 'windows-874'], ['tis-620', 'windows-874'], ['windows-874', 'windows-874'], ['cp1250', 'windows-1250'], ['windows-1250', 'windows-1250'], ['x-cp1250', 'windows-1250'], ['cp1251', 'windows-1251'], ['windows-1251', 'windows-1251'], ['x-cp1251', 'windows-1251'], ['ansi_x3.4-1968', 'windows-1252'], ['ascii', 'windows-1252'], ['cp1252', 'windows-1252'], ['cp819', 'windows-1252'], ['csisolatin1', 'windows-1252'], ['ibm819', 'windows-1252'], ['iso-8859-1', 'windows-1252'], ['iso-ir-100', 'windows-1252'], ['iso8859-1', 'windows-1252'], ['iso88591', 'windows-1252'], ['iso_8859-1', 'windows-1252'], ['iso_8859-1:1987', 'windows-1252'], ['l1', 'windows-1252'], ['latin1', 'windows-1252'], ['us-ascii', 'windows-1252'], ['windows-1252', 'windows-1252'], ['x-cp1252', 'windows-1252'], ['cp1253', 'windows-1253'], ['windows-1253', 'windows-1253'], ['x-cp1253', 'windows-1253'], ['cp1254', 'windows-1254'], ['csisolatin5', 'windows-1254'], ['iso-8859-9', 'windows-1254'], ['iso-ir-148', 'windows-1254'], ['iso8859-9', 'windows-1254'], ['iso88599', 'windows-1254'], ['iso_8859-9', 'windows-1254'], ['iso_8859-9:1989', 'windows-1254'], ['l5', 'windows-1254'], ['latin5', 'windows-1254'], ['windows-1254', 'windows-1254'], ['x-cp1254', 'windows-1254'], ['cp1255', 'windows-1255'], ['windows-1255', 'windows-1255'], ['x-cp1255', 'windows-1255'], ['cp1256', 'windows-1256'], ['windows-1256', 'windows-1256'], ['x-cp1256', 'windows-1256'], ['cp1257', 'windows-1257'], ['windows-1257', 'windows-1257'], ['x-cp1257', 'windows-1257'], ['cp1258', 'windows-1258'], ['windows-1258', 'windows-1258'], ['x-cp1258', 'windows-1258'], ['x-mac-cyrillic', 'x-mac-cyrillic'], ['x-mac-ukrainian', 'x-mac-cyrillic'], ['chinese', 'gbk'], ['csgb2312', 'gbk'], ['csiso58gb231280', 'gbk'], ['gb2312', 'gbk'], ['gb_2312', 'gbk'], ['gb_2312-80', 'gbk'], ['gbk', 'gbk'], ['iso-ir-58', 'gbk'], ['x-gbk', 'gbk'], ['gb18030', 'gb18030'], ['big5', 'big5'], ['big5-hkscs', 'big5'], ['cn-big5', 'big5'], ['csbig5', 'big5'], ['x-x-big5', 'big5'], ['cseucpkdfmtjapanese', 'euc-jp'], ['euc-jp', 'euc-jp'], ['x-euc-jp', 'euc-jp'], ['csiso2022jp', 'iso-2022-jp'], ['iso-2022-jp', 'iso-2022-jp'], ['csshiftjis', 'shift_jis'], ['ms932', 'shift_jis'], ['ms_kanji', 'shift_jis'], ['shift-jis', 'shift_jis'], ['shift_jis', 'shift_jis'], ['sjis', 'shift_jis'], ['windows-31j', 'shift_jis'], ['x-sjis', 'shift_jis'], ['cseuckr', 'euc-kr'], ['csksc56011987', 'euc-kr'], ['euc-kr', 'euc-kr'], ['iso-ir-149', 'euc-kr'], ['korean', 'euc-kr'], ['ks_c_5601-1987', 'euc-kr'], ['ks_c_5601-1989', 'euc-kr'], ['ksc5601', 'euc-kr'], ['ksc_5601', 'euc-kr'], ['windows-949', 'euc-kr'], ['csiso2022kr', 'replacement'], ['hz-gb-2312', 'replacement'], ['iso-2022-cn', 'replacement'], ['iso-2022-cn-ext', 'replacement'], ['iso-2022-kr', 'replacement'], ['replacement', 'replacement'], ['unicodefffe', 'utf-16be'], ['utf-16be', 'utf-16be'], ['csunicode', 'utf-16le'], ['iso-10646-ucs-2', 'utf-16le'], ['ucs-2', 'utf-16le'], ['unicode', 'utf-16le'], ['unicodefeff', 'utf-16le'], ['utf-16le', 'utf-16le'], ['utf-16', 'utf-16le'], ['x-user-defined', 'x-user-defined']]);

// Unfortunately, String.prototype.trim also removes non-ascii whitespace,
// so we have to do this manually
function trimAsciiWhitespace(label) {
  var s = 0;
  var e = label.length;
  while (s < e && (label[s] === '\u0009' || label[s] === '\u000a' || label[s] === '\u000c' || label[s] === '\u000d' || label[s] === '\u0020')) {
    s++;
  }
  while (e > s && (label[e - 1] === '\u0009' || label[e - 1] === '\u000a' || label[e - 1] === '\u000c' || label[e - 1] === '\u000d' || label[e - 1] === '\u0020')) {
    e--;
  }
  return StringPrototypeSlice(label, s, e);
}
function getEncodingFromLabel(label) {
  var enc = encodings.get(label);
  if (enc !== undefined) return enc;
  return encodings.get(trimAsciiWhitespace(label.toLowerCase()));
}
var lazyInspect;
var _encoding = /*#__PURE__*/new WeakMap();
var _TextEncoder_brand = /*#__PURE__*/new WeakSet();
var TextEncoder = /*#__PURE__*/function () {
  function TextEncoder() {
    _classCallCheck(this, TextEncoder);
    _classPrivateMethodInitSpec(this, _TextEncoder_brand);
    _classPrivateFieldInitSpec(this, _encoding, 'utf-8');
  }
  return _createClass(TextEncoder, [{
    key: "encoding",
    get: function () {
      return _classPrivateFieldGet(_encoding, this);
    }
  }, {
    key: "encode",
    value: function encode() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return _assertClassBrand(_TextEncoder_brand, this, _encode).call(this, input);
    }
  }, {
    key: "encodeInto",
    value: function encodeInto(src, dest) {
      validateString(src, 'src');
      if (!dest || !isUint8Array(dest)) throw new ERR_INVALID_ARG_TYPE('dest', 'Uint8Array', dest);
      return _assertClassBrand(_TextEncoder_brand, this, _encodeInto).call(this, src, dest);
    }
  }, {
    key: inspect,
    value: function (depth, opts) {
      if (typeof depth === 'number' && depth < 0) return this;
      var ctor = getConstructorOf(this);
      var obj = {
        __proto__: {
          constructor: ctor === null ? TextEncoder : ctor
        }
      };
      obj.encoding = _classPrivateFieldGet(_encoding, this);
      // Lazy to avoid circular dependency
      lazyInspect ??= require('internal/util/inspect').inspect;
      return lazyInspect(obj, opts);
    }
  }]);
}();
function _encode(input) {
  return encodeUtf8String(`${input}`);
}
function _encodeInto(input, dest) {
  encodeInto(input, dest);
  // We need to read from the binding here since the buffer gets refreshed
  // from the snapshot.
  var {
    0: read,
    1: written
  } = encodeIntoResults;
  return {
    read,
    written
  };
}
ObjectDefineProperties(TextEncoder.prototype, {
  'encode': kEnumerableProperty,
  'encodeInto': kEnumerableProperty,
  'encoding': kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'TextEncoder'
  }
});
function parseInput(input) {
  if (isAnyArrayBuffer(input)) {
    try {
      return new FastBuffer(input);
    } catch {
      return empty;
    }
  } else if (isArrayBufferView(input)) {
    try {
      return new FastBuffer(input.buffer, input.byteOffset, input.byteLength);
    } catch {
      return empty;
    }
  } else {
    throw new ERR_INVALID_ARG_TYPE('input', ['ArrayBuffer', 'ArrayBufferView'], input);
  }
}
var icuDecode, icuGetConverter;
if (hasIntl) {
  ;
  ({
    decode: icuDecode,
    getConverter: icuGetConverter
  } = internalBinding('icu'));
}
var kBOMSeen = _Symbol('BOM seen');
var StringDecoder;
function lazyStringDecoder() {
  if (StringDecoder === undefined) ({
    StringDecoder
  } = require('string_decoder'));
  return StringDecoder;
}
var _TextDecoder_brand = /*#__PURE__*/new WeakSet();
var TextDecoder = /*#__PURE__*/function () {
  function TextDecoder() {
    var encoding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'utf-8';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, TextDecoder);
    _classPrivateMethodInitSpec(this, _TextDecoder_brand);
    encoding = `${encoding}`;
    validateObject(options, 'options', kValidateObjectAllowObjectsAndNull);
    var enc = getEncodingFromLabel(encoding);
    if (enc === undefined) throw new ERR_ENCODING_NOT_SUPPORTED(encoding);
    var flags = 0;
    if (options !== null) {
      flags |= options.fatal ? CONVERTER_FLAGS_FATAL : 0;
      flags |= options.ignoreBOM ? CONVERTER_FLAGS_IGNORE_BOM : 0;
    }
    this[kDecoder] = true;
    this[kFlags] = flags;
    this[kEncoding] = enc;
    this[kIgnoreBOM] = Boolean(options?.ignoreBOM);
    this[kFatal] = Boolean(options?.fatal);
    this[kUTF8FastPath] = false;
    this[kHandle] = undefined;
    this[kSingleByte] = undefined; // Does not care about streaming or BOM
    this[kChunk] = null; // A copy of previous streaming tail or null

    if (enc === 'utf-8') {
      this[kUTF8FastPath] = true;
      this[kBOMSeen] = false;
    } else if (isSinglebyteEncoding(enc)) {
      this[kSingleByte] = createSinglebyteDecoder(enc, this[kFatal]);
    } else {
      _assertClassBrand(_TextDecoder_brand, this, _prepareConverter).call(this); // Need to throw early if we don't support the encoding
    }
  }
  return _createClass(TextDecoder, [{
    key: "decode",
    value: function decode() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : empty;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      validateDecoder(this);
      validateObject(options, 'options', kValidateObjectAllowObjectsAndNull);
      if (this[kSingleByte]) return this[kSingleByte](parseInput(input));
      var stream = options?.stream;
      if (this[kUTF8FastPath]) {
        var chunk = this[kChunk];
        var ignoreBom = this[kIgnoreBOM] || this[kBOMSeen];
        if (!stream) {
          this[kBOMSeen] = false;
          if (!chunk) return decodeUTF8(input, ignoreBom, this[kFatal]);
        }
        var u = parseInput(input);
        if (u.length === 0 && stream) return ''; // no state change
        var prefix;
        if (chunk) {
          var merged = mergePrefixUtf8(u, this[kChunk]);
          if (u.length < 3) {
            u = merged; // Might be unfinished, but fully consumed old u
          } else {
            prefix = merged; // Stops at complete chunk
            var add = prefix.length - this[kChunk].length;
            if (add > 0) u = u.subarray(add);
          }
          this[kChunk] = null;
        }
        if (stream) {
          var trail = unfinishedBytesUtf8(u, u.length);
          if (trail > 0) {
            this[kChunk] = new FastBuffer(u.subarray(-trail)); // copy
            if (!prefix && trail === u.length) return ''; // No further state change
            u = u.subarray(0, -trail);
          }
        }
        try {
          var res = (prefix ? decodeUTF8(prefix, ignoreBom, this[kFatal]) : '') + decodeUTF8(u, ignoreBom || prefix, this[kFatal]);

          // "BOM seen" is set on the current decode call only if it did not error,
          // in "serialize I/O queue" after decoding
          // We don't get here if we had no complete data to process,
          // and we don't want BOM processing after that if streaming
          if (stream) this[kBOMSeen] = true;
          return res;
        } catch (e) {
          this[kChunk] = null; // Reset unfinished chunk on errors
          // The correct way per spec seems to be not destroying the decoder state (aka BOM here) in stream mode
          throw e;
        }
      }
      if (hasIntl) {
        var flags = stream ? 0 : CONVERTER_FLAGS_FLUSH;
        return icuDecode(this[kHandle], input, flags, this[kEncoding]);
      }
      input = parseInput(input);
      var result = stream ? this[kHandle].write(input) : this[kHandle].end(input);
      if (result.length > 0 && !this[kBOMSeen] && !this[kIgnoreBOM]) {
        // If the very first result in the stream is a BOM, and we are not
        // explicitly told to ignore it, then we discard it.
        if (result[0] === '\ufeff') {
          result = StringPrototypeSlice(result, 1);
        }
        this[kBOMSeen] = true;
      }
      if (!stream) this[kBOMSeen] = false;
      return result;
    }
  }]);
}(); // Mix in some shared properties.
function _prepareConverter() {
  if (hasIntl) {
    var icuEncoding = this[kEncoding];
    if (icuEncoding === 'gbk') icuEncoding = 'gb18030'; // 10.1.1. GBK's decoder is gb18030's decoder
    var handle = icuGetConverter(icuEncoding, this[kFlags]);
    if (handle === undefined) throw new ERR_ENCODING_NOT_SUPPORTED(this[kEncoding]);
    this[kHandle] = handle;
  } else if (this[kEncoding] === 'utf-16le') {
    if (this[kFatal]) throw new ERR_NO_ICU('"fatal" option');
    this[kHandle] = new (lazyStringDecoder())(this[kEncoding]);
    this[kBOMSeen] = false;
  } else {
    throw new ERR_ENCODING_NOT_SUPPORTED(this[kEncoding]);
  }
}
var sharedProperties = ObjectGetOwnPropertyDescriptors({
  get encoding() {
    validateDecoder(this);
    return this[kEncoding];
  },
  get fatal() {
    validateDecoder(this);
    return (this[kFlags] & CONVERTER_FLAGS_FATAL) === CONVERTER_FLAGS_FATAL;
  },
  get ignoreBOM() {
    validateDecoder(this);
    return (this[kFlags] & CONVERTER_FLAGS_IGNORE_BOM) === CONVERTER_FLAGS_IGNORE_BOM;
  },
  [inspect](depth, opts) {
    validateDecoder(this);
    if (typeof depth === 'number' && depth < 0) return this;
    var constructor = getConstructorOf(this) || TextDecoder;
    var obj = {
      __proto__: {
        constructor
      }
    };
    obj.encoding = this.encoding;
    obj.fatal = this.fatal;
    obj.ignoreBOM = this.ignoreBOM;
    if (opts.showHidden) {
      obj[kFlags] = this[kFlags];
      obj[kHandle] = this[kHandle];
    }
    // Lazy to avoid circular dependency
    var {
      inspect
    } = require('internal/util/inspect');
    return `${constructor.name} ${inspect(obj)}`;
  }
});
var propertiesValues = ObjectValues(sharedProperties);
for (var i = 0; i < propertiesValues.length; i++) {
  // We want to use null-prototype objects to not rely on globally mutable
  // %Object.prototype%.
  ObjectSetPrototypeOf(propertiesValues[i], null);
}
sharedProperties[inspect].enumerable = false;
ObjectDefineProperties(TextDecoder.prototype, _objectSpread(_objectSpread({
  decode: kEnumerableProperty
}, sharedProperties), {}, {
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'TextDecoder'
  }
}));
module.exports = {
  getEncodingFromLabel,
  TextDecoder,
  TextEncoder
};

