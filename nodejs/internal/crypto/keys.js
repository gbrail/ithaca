'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _checkInRHS(e) { if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (null !== e ? typeof e : "null")); return e; }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypeSlice,
  ObjectDefineProperties,
  ObjectPrototypeHasOwnProperty,
  ObjectSetPrototypeOf,
  SafeSet,
  SymbolToStringTag,
  Uint8Array
} = primordials;
var {
  KeyObjectHandle,
  createNativeKeyObjectClass,
  // eslint-disable-next-line no-restricted-syntax -- intended here
  getKeyObjectSlots: nativeGetKeyObjectSlots,
  createCryptoKeyClass,
  // eslint-disable-next-line no-restricted-syntax -- intended here
  getCryptoKeySlots: nativeGetCryptoKeySlots,
  kKeyTypeSecret,
  kKeyTypePublic,
  kKeyTypePrivate,
  kKeyFormatPEM,
  kKeyFormatDER,
  kKeyFormatJWK,
  kKeyFormatRawPublic,
  kKeyFormatRawPrivate,
  kKeyFormatRawSeed,
  kKeyEncodingPKCS1,
  kKeyEncodingPKCS8,
  kKeyEncodingSPKI,
  kKeyEncodingSEC1
} = internalBinding('crypto');
var {
  crypto: {
    POINT_CONVERSION_COMPRESSED,
    POINT_CONVERSION_UNCOMPRESSED
  }
} = internalBinding('constants');
var {
  validateObject,
  validateOneOf,
  validateString
} = require('internal/validators');
var {
  codes: {
    ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS,
    ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE,
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_THIS
  }
} = require('internal/errors');
var {
  getArrayBufferOrView,
  bigIntArrayToUnsignedBigInt,
  normalizeAlgorithm,
  hasAnyNotIn,
  getUsagesMask,
  getUsagesFromMask,
  hasUsage
} = require('internal/crypto/util');
var {
  isAnyArrayBuffer,
  isArrayBufferView
} = require('internal/util/types');
var {
  customInspectSymbol: kInspect,
  getDeprecationWarningEmitter,
  kEnumerableProperty,
  kEmptyObject,
  lazyDOMException
} = require('internal/util');
var {
  inspect
} = require('internal/util/inspect');
var emitDEP0203 = getDeprecationWarningEmitter('DEP0203', 'Passing a CryptoKey to node:crypto functions is deprecated.');
var maybeEmitDEP0204 = getDeprecationWarningEmitter('DEP0204', 'Passing a non-extractable CryptoKey to KeyObject.from() is deprecated.', undefined, false, key => !getCryptoKeyExtractable(key));

// Key input contexts.
var kConsumePublic = 0;
var kConsumePrivate = 1;
var kCreatePublic = 2;
var kCreatePrivate = 3;
var encodingNames = [];
for (var m of [[kKeyEncodingPKCS1, 'pkcs1'], [kKeyEncodingPKCS8, 'pkcs8'], [kKeyEncodingSPKI, 'spki'], [kKeyEncodingSEC1, 'sec1']]) encodingNames[m[0]] = m[1];

// KeyObject state lives on the native NativeKeyObject base class. JS reads
// the native type enum and a KeyObjectHandle in one call and caches that
// slot tuple in a private field so no forgeable own Symbols are exposed on
// public KeyObject instances.
var getKeyObjectSlots; // Populated by the createNativeKeyObjectClass callback.

var kKeyObjectSlotType = 0;
var kKeyObjectSlotHandle = 1;
// The native slot tuple stops at kKeyObjectSlotHandle. The remaining entries
// are JS-side lazy cache slots derived from the KeyObjectHandle on first use.
var kKeyObjectSlotSymmetricKeySize = 2;
var kKeyObjectSlotAsymmetricKeyType = 3;
var kKeyObjectSlotAsymmetricKeyDetails = 4;
function normalizeKeyDetails() {
  var details = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  if (details.publicExponent !== undefined) {
    return _objectSpread(_objectSpread({
      __proto__: null
    }, details), {}, {
      publicExponent: bigIntArrayToUnsignedBigInt(new Uint8Array(details.publicExponent))
    });
  }
  return details;
}

// Creating the KeyObject class is a little complicated due to inheritance
// and the fact that KeyObjects should be transferable between threads,
// which requires the KeyObject base class to be implemented in C++.
// The creation requires a callback to make sure that the NativeKeyObject
// base class cannot exist without the other KeyObject implementations.
var {
  0: KeyObject,
  1: SecretKeyObject,
  2: PublicKeyObject,
  3: PrivateKeyObject
} = createNativeKeyObjectClass(NativeKeyObject => {
  var _slots = /*#__PURE__*/new WeakMap();
  // Publicly visible KeyObject class.
  var KeyObject = /*#__PURE__*/function (_NativeKeyObject) {
    function KeyObject(type, handle) {
      var _this;
      _classCallCheck(this, KeyObject);
      if (type !== 'secret' && type !== 'public' && type !== 'private') throw new ERR_INVALID_ARG_VALUE('type', type);
      if (typeof handle !== 'object' || !(handle instanceof KeyObjectHandle)) throw new ERR_INVALID_ARG_TYPE('handle', 'object', handle);
      _this = _callSuper(this, KeyObject, [handle]);
      _classPrivateFieldInitSpec(_this, _slots, void 0);
      return _this;
    }
    _inherits(KeyObject, _NativeKeyObject);
    return _createClass(KeyObject, [{
      key: "type",
      get: function () {
        return getKeyObjectType(this);
      }
    }, {
      key: "equals",
      value: function equals(otherKeyObject) {
        if (!isKeyObject(otherKeyObject)) {
          throw new ERR_INVALID_ARG_TYPE('otherKeyObject', 'KeyObject', otherKeyObject);
        }
        var slots = getKeyObjectSlots(this);
        var otherSlots = getKeyObjectSlots(otherKeyObject);
        return slots[kKeyObjectSlotType] === otherSlots[kKeyObjectSlotType] && slots[kKeyObjectSlotHandle].equals(otherSlots[kKeyObjectSlotHandle]);
      }
    }], [{
      key: "from",
      value: function from(key) {
        if (!isCryptoKey(key)) throw new ERR_INVALID_ARG_TYPE('key', 'CryptoKey', key);
        maybeEmitDEP0204(key);
        var handle = getCryptoKeyHandle(key);
        switch (getCryptoKeyType(key)) {
          /* eslint-disable no-use-before-define */
          case 'secret':
            return new SecretKeyObject(handle);
          case 'public':
            return new PublicKeyObject(handle);
          case 'private':
            return new PrivateKeyObject(handle);
          /* eslint-enable no-use-before-define */
        }
      }
    }]);
  }(NativeKeyObject);
  getKeyObjectSlots = key => {
    if (!key || typeof key !== 'object') throw new ERR_INVALID_THIS('KeyObject');
    if (_slots.has(_checkInRHS(key))) {
      var cached = _classPrivateFieldGet(_slots, key);
      if (cached !== undefined) return cached;
    }
    var slots = nativeGetKeyObjectSlots(key);
    _classPrivateFieldSet(_slots, key, slots);
    return slots;
  };
  ObjectDefineProperties(KeyObject.prototype, {
    [SymbolToStringTag]: {
      __proto__: null,
      configurable: true,
      value: 'KeyObject'
    }
  });
  var webidl;
  var SecretKeyObject = /*#__PURE__*/function (_KeyObject2) {
    function SecretKeyObject(handle) {
      _classCallCheck(this, SecretKeyObject);
      return _callSuper(this, SecretKeyObject, ['secret', handle]);
    }
    _inherits(SecretKeyObject, _KeyObject2);
    return _createClass(SecretKeyObject, [{
      key: "symmetricKeySize",
      get: function () {
        return getKeyObjectSymmetricKeySize(this);
      }
    }, {
      key: "export",
      value: function _export(options) {
        var handle = getKeyObjectHandle(this);
        if (options !== undefined) {
          validateObject(options, 'options');
          validateOneOf(options.format, 'options.format', [undefined, 'buffer', 'jwk']);
          if (options.format === 'jwk') {
            return handle.exportJwk({}, false);
          }
        }
        return handle.export();
      }
    }, {
      key: "toCryptoKey",
      value: function toCryptoKey(algorithm, extractable, keyUsages) {
        webidl ??= require('internal/crypto/webidl');
        algorithm = normalizeAlgorithm(webidl.converters.AlgorithmIdentifier(algorithm), 'importKey');
        extractable = webidl.converters.boolean(extractable);
        keyUsages = webidl.converters['sequence<KeyUsage>'](keyUsages);
        var result;
        switch (algorithm.name) {
          case 'HMAC':
          // Fall through
          case 'KMAC128':
          // Fall through
          case 'KMAC256':
            result = require('internal/crypto/mac').macImportKey('KeyObject', this, algorithm, extractable, keyUsages);
            break;
          case 'AES-CTR':
          // Fall through
          case 'AES-CBC':
          // Fall through
          case 'AES-GCM':
          // Fall through
          case 'AES-KW':
          // Fall through
          case 'AES-OCB':
            result = require('internal/crypto/aes').aesImportKey(algorithm, 'KeyObject', this, extractable, keyUsages);
            break;
          case 'ChaCha20-Poly1305':
            result = require('internal/crypto/chacha20_poly1305').c20pImportKey(algorithm, 'KeyObject', this, extractable, keyUsages);
            break;
          case 'HKDF':
          // Fall through
          case 'PBKDF2':
          // Fall through
          case 'Argon2d':
          // Fall through
          case 'Argon2i':
          // Fall through
          case 'Argon2id':
            result = importGenericSecretKey(algorithm, 'KeyObject', this, extractable, keyUsages);
            break;
          default:
            throw lazyDOMException('Unrecognized algorithm name', 'NotSupportedError');
        }
        if (getCryptoKeyUsagesMask(result) === 0) {
          throw lazyDOMException(`Usages cannot be empty when importing a ${getCryptoKeyType(result)} key.`, 'SyntaxError');
        }
        return result;
      }
    }]);
  }(KeyObject);
  var AsymmetricKeyObject = /*#__PURE__*/function (_KeyObject3) {
    function AsymmetricKeyObject() {
      _classCallCheck(this, AsymmetricKeyObject);
      return _callSuper(this, AsymmetricKeyObject, arguments);
    }
    _inherits(AsymmetricKeyObject, _KeyObject3);
    return _createClass(AsymmetricKeyObject, [{
      key: "asymmetricKeyType",
      get: function () {
        return getKeyObjectAsymmetricKeyType(this);
      }
    }, {
      key: "asymmetricKeyDetails",
      get: function () {
        return _objectSpread({}, getKeyObjectAsymmetricKeyDetails(this));
      }
    }, {
      key: "toCryptoKey",
      value: function toCryptoKey(algorithm, extractable, keyUsages) {
        webidl ??= require('internal/crypto/webidl');
        algorithm = normalizeAlgorithm(webidl.converters.AlgorithmIdentifier(algorithm), 'importKey');
        extractable = webidl.converters.boolean(extractable);
        keyUsages = webidl.converters['sequence<KeyUsage>'](keyUsages);
        var result;
        switch (algorithm.name) {
          case 'RSASSA-PKCS1-v1_5':
          // Fall through
          case 'RSA-PSS':
          // Fall through
          case 'RSA-OAEP':
            result = require('internal/crypto/rsa').rsaImportKey('KeyObject', this, algorithm, extractable, keyUsages);
            break;
          case 'ECDSA':
          // Fall through
          case 'ECDH':
            result = require('internal/crypto/ec').ecImportKey('KeyObject', this, algorithm, extractable, keyUsages);
            break;
          case 'Ed25519':
          // Fall through
          case 'Ed448':
          // Fall through
          case 'X25519':
          // Fall through
          case 'X448':
            result = require('internal/crypto/cfrg').cfrgImportKey('KeyObject', this, algorithm, extractable, keyUsages);
            break;
          case 'ML-DSA-44':
          // Fall through
          case 'ML-DSA-65':
          // Fall through
          case 'ML-DSA-87':
            result = require('internal/crypto/ml_dsa').mlDsaImportKey('KeyObject', this, algorithm, extractable, keyUsages);
            break;
          case 'ML-KEM-512':
          // Fall through
          case 'ML-KEM-768':
          // Fall through
          case 'ML-KEM-1024':
            result = require('internal/crypto/ml_kem').mlKemImportKey('KeyObject', this, algorithm, extractable, keyUsages);
            break;
          default:
            throw lazyDOMException('Unrecognized algorithm name', 'NotSupportedError');
        }
        var resultType = getCryptoKeyType(result);
        if (resultType === 'private' && getCryptoKeyUsagesMask(result) === 0) {
          throw lazyDOMException(`Usages cannot be empty when importing a ${resultType} key.`, 'SyntaxError');
        }
        return result;
      }
    }]);
  }(KeyObject);
  var PublicKeyObject = /*#__PURE__*/function (_AsymmetricKeyObject) {
    function PublicKeyObject(handle) {
      _classCallCheck(this, PublicKeyObject);
      return _callSuper(this, PublicKeyObject, ['public', handle]);
    }
    _inherits(PublicKeyObject, _AsymmetricKeyObject);
    return _createClass(PublicKeyObject, [{
      key: "export",
      value: function _export(options) {
        switch (options?.format) {
          case 'jwk':
            return getKeyObjectHandle(this).exportJwk({}, false);
          case 'raw-public':
            {
              var handle = getKeyObjectHandle(this);
              var asymmetricKeyType = getKeyObjectAsymmetricKeyType(this);
              if (asymmetricKeyType === 'ec') {
                var {
                  type = 'uncompressed'
                } = options;
                validateOneOf(type, 'options.type', ['compressed', 'uncompressed']);
                var form = type === 'compressed' ? POINT_CONVERSION_COMPRESSED : POINT_CONVERSION_UNCOMPRESSED;
                return handle.exportECPublicRaw(form);
              }
              return handle.rawPublicKey();
            }
          default:
            {
              var _asymmetricKeyType = getKeyObjectAsymmetricKeyType(this);
              var _handle = getKeyObjectHandle(this);
              var {
                format,
                type: _type
              } = parsePublicKeyEncoding(options, _asymmetricKeyType);
              return _handle.export(format, _type);
            }
        }
      }
    }]);
  }(AsymmetricKeyObject);
  var PrivateKeyObject = /*#__PURE__*/function (_AsymmetricKeyObject2) {
    function PrivateKeyObject(handle) {
      _classCallCheck(this, PrivateKeyObject);
      return _callSuper(this, PrivateKeyObject, ['private', handle]);
    }
    _inherits(PrivateKeyObject, _AsymmetricKeyObject2);
    return _createClass(PrivateKeyObject, [{
      key: "export",
      value: function _export(options) {
        if (options?.passphrase !== undefined && options.format !== 'pem' && options.format !== 'der') {
          throw new ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS(options.format, 'does not support encryption');
        }
        switch (options?.format) {
          case 'jwk':
            return getKeyObjectHandle(this).exportJwk({}, false);
          case 'raw-private':
            {
              var handle = getKeyObjectHandle(this);
              var asymmetricKeyType = getKeyObjectAsymmetricKeyType(this);
              if (asymmetricKeyType === 'ec') {
                return handle.exportECPrivateRaw();
              }
              return handle.rawPrivateKey();
            }
          case 'raw-seed':
            return getKeyObjectHandle(this).rawSeed();
          default:
            {
              var _asymmetricKeyType2 = getKeyObjectAsymmetricKeyType(this);
              var _handle2 = getKeyObjectHandle(this);
              var {
                format,
                type,
                cipher,
                passphrase
              } = parsePrivateKeyEncoding(options, _asymmetricKeyType2);
              return _handle2.export(format, type, cipher, passphrase);
            }
        }
      }
    }]);
  }(AsymmetricKeyObject);
  return [KeyObject, SecretKeyObject, PublicKeyObject, PrivateKeyObject];
});
function parseKeyFormat(formatStr, defaultFormat, optionName) {
  if (formatStr === undefined && defaultFormat !== undefined) return defaultFormat;else if (formatStr === 'pem') return kKeyFormatPEM;else if (formatStr === 'der') return kKeyFormatDER;else if (formatStr === 'jwk') return kKeyFormatJWK;else if (formatStr === 'raw-public') return kKeyFormatRawPublic;else if (formatStr === 'raw-private') return kKeyFormatRawPrivate;else if (formatStr === 'raw-seed') return kKeyFormatRawSeed;
  throw new ERR_INVALID_ARG_VALUE(optionName, formatStr);
}
function parseKeyType(typeStr, required, keyType, isPublic, optionName) {
  if (typeStr === undefined && !required) {
    return undefined;
  } else if (typeStr === 'pkcs1') {
    if (keyType !== undefined && keyType !== 'rsa') {
      throw new ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS(typeStr, 'can only be used for RSA keys');
    }
    return kKeyEncodingPKCS1;
  } else if (typeStr === 'spki' && isPublic !== false) {
    return kKeyEncodingSPKI;
  } else if (typeStr === 'pkcs8' && isPublic !== true) {
    return kKeyEncodingPKCS8;
  } else if (typeStr === 'sec1' && isPublic !== true) {
    if (keyType !== undefined && keyType !== 'ec') {
      throw new ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS(typeStr, 'can only be used for EC keys');
    }
    return kKeyEncodingSEC1;
  }
  throw new ERR_INVALID_ARG_VALUE(optionName, typeStr);
}
function option(name, prefix) {
  return prefix === undefined ? `options.${name}` : `${prefix}.${name}`;
}
function parseKeyFormatAndType(enc, keyType, isPublic, objName) {
  var {
    format: formatStr,
    type: typeStr
  } = enc;
  var isInput = keyType === undefined;
  var format = parseKeyFormat(formatStr, isInput ? kKeyFormatPEM : undefined, option('format', objName));
  if (format === kKeyFormatRawPublic) {
    if (isPublic === false) {
      throw new ERR_INVALID_ARG_VALUE(option('format', objName), 'raw-public');
    }
    var _type2;
    if (typeStr === undefined || typeStr === 'uncompressed') {
      _type2 = POINT_CONVERSION_UNCOMPRESSED;
    } else if (typeStr === 'compressed') {
      _type2 = POINT_CONVERSION_COMPRESSED;
    } else {
      throw new ERR_INVALID_ARG_VALUE(option('type', objName), typeStr);
    }
    return {
      format,
      type: _type2
    };
  }
  if (format === kKeyFormatRawPrivate || format === kKeyFormatRawSeed) {
    if (isPublic === true) {
      throw new ERR_INVALID_ARG_VALUE(option('format', objName), format === kKeyFormatRawPrivate ? 'raw-private' : 'raw-seed');
    }
    if (typeStr !== undefined) {
      throw new ERR_INVALID_ARG_VALUE(option('type', objName), typeStr);
    }
    return {
      format
    };
  }
  var isRequired = (!isInput || format === kKeyFormatDER) && format !== kKeyFormatJWK;
  var type = parseKeyType(typeStr, isRequired, keyType, isPublic, option('type', objName));
  return {
    format,
    type
  };
}
function isStringOrBuffer(val) {
  return typeof val === 'string' || isArrayBufferView(val) || isAnyArrayBuffer(val);
}
function parseKeyEncoding(enc, keyType, isPublic, objName) {
  validateObject(enc, 'options');
  var isInput = keyType === undefined;
  var {
    format,
    type
  } = parseKeyFormatAndType(enc, keyType, isPublic, objName);
  var cipher, passphrase, encoding;
  if (isPublic !== true) {
    ({
      cipher,
      passphrase,
      encoding
    } = enc);
    if (format === kKeyFormatRawPrivate || format === kKeyFormatRawSeed) {
      if (cipher != null || passphrase !== undefined) {
        throw new ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS('raw format', 'does not support encryption');
      }
      return {
        format,
        type
      };
    }
    if (!isInput) {
      if (cipher != null) {
        if (typeof cipher !== 'string') throw new ERR_INVALID_ARG_VALUE(option('cipher', objName), cipher);
        if (format === kKeyFormatDER && (type === kKeyEncodingPKCS1 || type === kKeyEncodingSEC1)) {
          throw new ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS(encodingNames[type], 'does not support encryption');
        }
      } else if (passphrase !== undefined) {
        throw new ERR_INVALID_ARG_VALUE(option('cipher', objName), cipher);
      }
    }
    if (isInput && passphrase !== undefined && !isStringOrBuffer(passphrase) || !isInput && cipher != null && !isStringOrBuffer(passphrase)) {
      throw new ERR_INVALID_ARG_VALUE(option('passphrase', objName), passphrase);
    }
  }
  if (passphrase !== undefined) passphrase = getArrayBufferOrView(passphrase, 'key.passphrase', encoding);
  return {
    format,
    type,
    cipher,
    passphrase
  };
}

// Parses the public key encoding based on an object. keyType must be undefined
// when this is used to parse an input encoding and must be a valid key type if
// used to parse an output encoding.
function parsePublicKeyEncoding(enc, keyType, objName) {
  return parseKeyEncoding(enc, keyType, keyType ? true : undefined, objName);
}

// Parses the private key encoding based on an object. keyType must be undefined
// when this is used to parse an input encoding and must be a valid key type if
// used to parse an output encoding.
function parsePrivateKeyEncoding(enc, keyType, objName) {
  return parseKeyEncoding(enc, keyType, false, objName);
}
function validateAsymmetricKeyType(type, ctx, key) {
  if (ctx === kCreatePrivate) {
    throw new ERR_INVALID_ARG_TYPE('key', ['string', 'ArrayBuffer', 'Buffer', 'TypedArray', 'DataView'], key);
  }
  if (type !== 'private') {
    if (ctx === kConsumePrivate || ctx === kCreatePublic) throw new ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE(type, 'private');
    if (type !== 'public') {
      throw new ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE(type, 'private or public');
    }
  }
}
function getKeyTypes(allowKeyObject) {
  var bufferOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var types = ['ArrayBuffer', 'Buffer', 'TypedArray', 'DataView', 'string',
  // Only if bufferOnly == false
  'KeyObject',
  // Only if allowKeyObject == true && bufferOnly == false
  'CryptoKey' // Only if allowKeyObject == true && bufferOnly == false
  ];
  if (bufferOnly) {
    return ArrayPrototypeSlice(types, 0, 4);
  } else if (!allowKeyObject) {
    return ArrayPrototypeSlice(types, 0, 5);
  }
  return types;
}
function prepareAsymmetricKey(key, ctx) {
  var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'key';
  if (isKeyObject(key)) {
    // Best case: A key object, as simple as that.
    var type = getKeyObjectType(key);
    validateAsymmetricKeyType(type, ctx, key);
    return {
      data: getKeyObjectHandle(key)
    };
  }
  if (isCryptoKey(key)) {
    emitDEP0203();
    validateAsymmetricKeyType(getCryptoKeyType(key), ctx, key);
    return {
      data: getCryptoKeyHandle(key)
    };
  }
  if (isStringOrBuffer(key)) {
    // Expect PEM by default, mostly for backward compatibility.
    return {
      format: kKeyFormatPEM,
      data: getArrayBufferOrView(key, name)
    };
  }
  if (typeof key === 'object') {
    var {
      key: data,
      encoding,
      format
    } = key;

    // The 'key' property can be a KeyObject as well to allow specifying
    // additional options such as padding along with the key.
    if (isKeyObject(data)) {
      var _type3 = getKeyObjectType(data);
      validateAsymmetricKeyType(_type3, ctx, data);
      return {
        data: getKeyObjectHandle(data)
      };
    }
    if (isCryptoKey(data)) {
      emitDEP0203();
      validateAsymmetricKeyType(getCryptoKeyType(data), ctx, data);
      return {
        data: getCryptoKeyHandle(data)
      };
    }
    if (format === 'jwk') {
      validateObject(data, `${name}.key`);
      return {
        data,
        format: kKeyFormatJWK
      };
    } else if (format === 'raw-public' || format === 'raw-private' || format === 'raw-seed') {
      if ((ctx === kConsumePrivate || ctx === kCreatePrivate) && format === 'raw-public') {
        throw new ERR_INVALID_ARG_VALUE(`${name}.format`, format);
      }
      if (!isArrayBufferView(data) && !isAnyArrayBuffer(data)) {
        throw new ERR_INVALID_ARG_TYPE(`${name}.key`, ['ArrayBuffer', 'Buffer', 'TypedArray', 'DataView'], data);
      }
      validateString(key.asymmetricKeyType, `${name}.asymmetricKeyType`);
      if (key.asymmetricKeyType === 'ec') {
        validateString(key.namedCurve, `${name}.namedCurve`);
      }
      var rawFormat = parseKeyFormat(format, undefined, `${name}.format`);
      return {
        data: getArrayBufferOrView(data, `${name}.key`),
        format: rawFormat,
        type: key.asymmetricKeyType,
        namedCurve: key.namedCurve ?? null
      };
    }

    // Either PEM or DER using PKCS#1 or SPKI.
    if (!isStringOrBuffer(data)) {
      throw new ERR_INVALID_ARG_TYPE(`${name}.key`, getKeyTypes(ctx !== kCreatePrivate), data);
    }
    var isPublic = ctx === kConsumePrivate || ctx === kCreatePrivate ? false : undefined;
    return _objectSpread({
      data: getArrayBufferOrView(data, `${name}.key`, encoding)
    }, parseKeyEncoding(key, undefined, isPublic, name));
  }
  throw new ERR_INVALID_ARG_TYPE(name, getKeyTypes(ctx !== kCreatePrivate), key);
}
function preparePrivateKey(key, name) {
  return prepareAsymmetricKey(key, kConsumePrivate, name);
}
function preparePublicOrPrivateKey(key, name) {
  return prepareAsymmetricKey(key, kConsumePublic, name);
}
function prepareSecretKey(key, encoding) {
  var bufferOnly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!bufferOnly) {
    if (isKeyObject(key)) {
      var type = getKeyObjectType(key);
      if (type !== 'secret') throw new ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE(type, 'secret');
      return getKeyObjectHandle(key);
    }
    if (isCryptoKey(key)) {
      emitDEP0203();
      var _type4 = getCryptoKeyType(key);
      if (_type4 !== 'secret') throw new ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE(_type4, 'secret');
      return getCryptoKeyHandle(key);
    }
  }
  if (typeof key !== 'string' && !isArrayBufferView(key) && !isAnyArrayBuffer(key)) {
    throw new ERR_INVALID_ARG_TYPE('key', getKeyTypes(!bufferOnly, bufferOnly), key);
  }
  return getArrayBufferOrView(key, 'key', encoding);
}
function createSecretKey(key, encoding) {
  key = prepareSecretKey(key, encoding, true);
  var handle = new KeyObjectHandle();
  handle.init(kKeyTypeSecret, key);
  return new SecretKeyObject(handle);
}
function createPublicKey(key) {
  var {
    format,
    type,
    data,
    passphrase,
    namedCurve
  } = prepareAsymmetricKey(key, kCreatePublic);
  var handle = new KeyObjectHandle();
  handle.init(kKeyTypePublic, data, format ?? null, type ?? null, passphrase ?? null, namedCurve ?? null);
  return new PublicKeyObject(handle);
}
function createPrivateKey(key) {
  var {
    format,
    type,
    data,
    passphrase,
    namedCurve
  } = prepareAsymmetricKey(key, kCreatePrivate);
  var handle = new KeyObjectHandle();
  handle.init(kKeyTypePrivate, data, format ?? null, type ?? null, passphrase ?? null, namedCurve ?? null);
  return new PrivateKeyObject(handle);
}
function keyObjectTypeToString(type) {
  switch (type) {
    case kKeyTypeSecret:
      return 'secret';
    case kKeyTypePublic:
      return 'public';
    case kKeyTypePrivate:
      return 'private';
    default:
      {
        var assert = require('internal/assert');
        assert.fail('Unreachable code');
      }
  }
}

// The helpers below return a KeyObject's native-backed slot values,
// populating the per-instance cache on first access via a single native
// call. The public getters delegate to these helpers, and internal
// consumers use them directly to avoid user-replaceable public accessors.
// Derived metadata such as key size and asymmetric key details is expanded
// lazily from the cached KeyObjectHandle. The public asymmetric key details
// getter returns a clone so the cached details object stays internal.

/**
 * Returns the KeyObject's native type slot as a string.
 * @param {KeyObject} key
 * @returns {'secret' | 'public' | 'private'}
 */
function getKeyObjectType(key) {
  return keyObjectTypeToString(getKeyObjectSlots(key)[kKeyObjectSlotType]);
}

/**
 * Returns the KeyObjectHandle wrapping the KeyObject's underlying key
 * material.
 * @param {KeyObject} key
 * @returns {KeyObjectHandle}
 */
function getKeyObjectHandle(key) {
  return getKeyObjectSlots(key)[kKeyObjectSlotHandle];
}

/**
 * Returns the KeyObject's symmetric key size, bypassing the public
 * `symmetricKeySize` getter. The value is derived lazily from the cached
 * KeyObjectHandle.
 * @param {SecretKeyObject} key
 * @returns {number}
 */
function getKeyObjectSymmetricKeySize(key) {
  var slots = getKeyObjectSlots(key);
  if (slots[kKeyObjectSlotType] !== kKeyTypeSecret) throw new ERR_INVALID_THIS('SecretKeyObject');
  var cached = slots[kKeyObjectSlotSymmetricKeySize];
  if (cached === undefined) {
    cached = slots[kKeyObjectSlotHandle].getSymmetricKeySize();
    slots[kKeyObjectSlotSymmetricKeySize] = cached;
  }
  return cached;
}

/**
 * Returns the KeyObject's asymmetric key type, bypassing the public
 * `asymmetricKeyType` getter. The value is derived lazily from the cached
 * KeyObjectHandle.
 * @param {PublicKeyObject|PrivateKeyObject} key
 * @returns {string}
 */
function getKeyObjectAsymmetricKeyType(key) {
  var slots = getKeyObjectSlots(key);
  if (slots[kKeyObjectSlotType] === kKeyTypeSecret) throw new ERR_INVALID_THIS('AsymmetricKeyObject');
  var cached = slots[kKeyObjectSlotAsymmetricKeyType];
  if (cached === undefined) {
    cached = slots[kKeyObjectSlotHandle].getAsymmetricKeyType();
    slots[kKeyObjectSlotAsymmetricKeyType] = cached;
  }
  return cached;
}

/**
 * Returns the KeyObject's cached asymmetric key details, bypassing the
 * public `asymmetricKeyDetails` getter (which returns a cloned copy).
 * The value is derived lazily from the cached KeyObjectHandle.
 * @param {PublicKeyObject|PrivateKeyObject} key
 * @returns {object}
 */
function getKeyObjectAsymmetricKeyDetails(key) {
  var slots = getKeyObjectSlots(key);
  if (slots[kKeyObjectSlotType] === kKeyTypeSecret) throw new ERR_INVALID_THIS('AsymmetricKeyObject');
  var cached = slots[kKeyObjectSlotAsymmetricKeyDetails];
  if (cached === undefined) {
    var asymmetricKeyType = slots[kKeyObjectSlotAsymmetricKeyType];
    if (asymmetricKeyType === undefined) {
      asymmetricKeyType = slots[kKeyObjectSlotHandle].getAsymmetricKeyType();
      slots[kKeyObjectSlotAsymmetricKeyType] = asymmetricKeyType;
    }
    switch (asymmetricKeyType) {
      case 'rsa':
      case 'rsa-pss':
      case 'dsa':
      case 'ec':
        cached = normalizeKeyDetails(slots[kKeyObjectSlotHandle].keyDetail({
          __proto__: null
        }));
        break;
      default:
        cached = kEmptyObject;
        break;
    }
    slots[kKeyObjectSlotAsymmetricKeyDetails] = cached;
  }
  return cached;
}
function isKeyObject(obj) {
  if (obj == null || typeof obj !== 'object') return false;
  try {
    getKeyObjectSlots(obj);
    return true;
  } catch {
    return false;
  }
}

// CryptoKey is a plain JS class whose prototype's [[Prototype]] is
// Object.prototype, as Web Crypto requires. Instance storage (type enum,
// extractable, algorithm, usages mask, and the KeyObject handle) lives
// on a C++ class, NativeCryptoKey, created by createCryptoKeyClass.
// InternalCryptoKey is the only constructor we expose to internal
// code; it extends NativeCryptoKey to get that storage and then has
// its prototype spliced so the chain visible to user code is:
//   instance -> InternalCryptoKey.prototype
//            -> CryptoKey.prototype
//            -> Object.prototype
//
// All five internal slots are read from C++ in a single call via
// `getCryptoKeySlots`. The resulting array is cached in a private
// class field on `InternalCryptoKey` so that it is invisible to
// reflection (`Object.getOwnPropertySymbols` etc.) and leaves each
// CryptoKey's hidden class pristine. The `getCryptoKey{Type,
// Extractable,Algorithm,Usages,Handle}` helpers index into that
// array and convert native enums/masks back to Web Crypto strings.
// The internal algorithm object is stored as a null-prototype clone
// so it cannot observe polluted Object.prototype properties.
// The public `algorithm` getter caches a cloned dictionary and the
// public `usages` getter caches a synthesized array (as Web Crypto
// requires repeat reads to return the same object so a consumer's
// mutation is visible next time).
var getSlots; // Populated by the createCryptoKeyClass callback below.

var kSlotType = 0;
var kSlotExtractable = 1;
var kSlotAlgorithm = 2;
var kSlotUsagesMask = 3;
var kSlotHandle = 4;
var kSlotClonedAlgorithm = 5;
var kSlotClonedUsages = 6;
var kSlotUsages = 7;
function cloneAlgorithm(raw) {
  var cloned = _objectSpread({}, raw);
  if (ObjectPrototypeHasOwnProperty(cloned, 'hash') && cloned.hash !== undefined) {
    cloned.hash = _objectSpread({}, cloned.hash);
  }
  if (ObjectPrototypeHasOwnProperty(cloned, 'publicExponent') && cloned.publicExponent !== undefined) {
    cloned.publicExponent = new Uint8Array(cloned.publicExponent);
  }
  return cloned;
}
function cloneInternalAlgorithm(raw) {
  var cloned = _objectSpread({
    __proto__: null
  }, raw);
  if (ObjectPrototypeHasOwnProperty(cloned, 'hash') && cloned.hash !== undefined) {
    cloned.hash = _objectSpread({
      __proto__: null
    }, cloned.hash);
  }
  if (ObjectPrototypeHasOwnProperty(cloned, 'publicExponent') && cloned.publicExponent !== undefined) {
    cloned.publicExponent = new Uint8Array(cloned.publicExponent);
  }
  return cloned;
}
var {
  0: CryptoKey,
  1: InternalCryptoKey
} = createCryptoKeyClass(NativeCryptoKey => {
  var CryptoKey = /*#__PURE__*/function () {
    function CryptoKey() {
      _classCallCheck(this, CryptoKey);
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    return _createClass(CryptoKey, [{
      key: kInspect,
      value: function (depth, options) {
        if (depth < 0) return this;
        var opts = _objectSpread(_objectSpread({}, options), {}, {
          depth: options.depth == null ? null : options.depth - 1
        });
        return `CryptoKey ${inspect({
          type: getCryptoKeyType(this),
          extractable: getCryptoKeyExtractable(this),
          algorithm: cloneAlgorithm(getCryptoKeyAlgorithm(this)),
          usages: ArrayPrototypeSlice(getCryptoKeyUsages(this), 0)
        }, opts)}`;
      }
    }, {
      key: "type",
      get: function () {
        return getCryptoKeyType(this);
      }
    }, {
      key: "extractable",
      get: function () {
        return getCryptoKeyExtractable(this);
      }
    }, {
      key: "algorithm",
      get: function () {
        var slots = getSlots(this);
        var cached = slots[kSlotClonedAlgorithm];
        if (cached === undefined) {
          cached = cloneAlgorithm(slots[kSlotAlgorithm]);
          slots[kSlotClonedAlgorithm] = cached;
        }
        return cached;
      }
    }, {
      key: "usages",
      get: function () {
        var slots = getSlots(this);
        var cached = slots[kSlotClonedUsages];
        if (cached === undefined) {
          cached = ArrayPrototypeSlice(getCryptoKeyUsagesFromSlots(slots), 0);
          slots[kSlotClonedUsages] = cached;
        }
        return cached;
      }
    }]);
  }();
  var _slots2 = /*#__PURE__*/new WeakMap();
  var InternalCryptoKey = /*#__PURE__*/function (_NativeCryptoKey) {
    function InternalCryptoKey(handle, algorithm, usagesMask, extractable) {
      var _this2;
      _classCallCheck(this, InternalCryptoKey);
      if (algorithm !== undefined) algorithm = cloneInternalAlgorithm(algorithm);
      _this2 = _callSuper(this, InternalCryptoKey, [handle, algorithm, usagesMask, extractable]);
      _classPrivateFieldInitSpec(_this2, _slots2, void 0);
      return _this2;
    }
    _inherits(InternalCryptoKey, _NativeCryptoKey);
    return _createClass(InternalCryptoKey);
  }(NativeCryptoKey); // Hide NativeCryptoKey from user code.
  getSlots = key => {
    if (!key || typeof key !== 'object') throw new ERR_INVALID_THIS('CryptoKey');
    if (_slots2.has(_checkInRHS(key))) {
      var cached = _classPrivateFieldGet(_slots2, key);
      if (cached !== undefined) return cached;
    }
    var slots = nativeGetCryptoKeySlots(key);
    slots[kSlotAlgorithm] = cloneInternalAlgorithm(slots[kSlotAlgorithm]);
    _classPrivateFieldSet(_slots2, key, slots);
    return slots;
  };
  InternalCryptoKey.prototype.constructor = CryptoKey;
  ObjectSetPrototypeOf(InternalCryptoKey.prototype, CryptoKey.prototype);
  ObjectDefineProperties(CryptoKey.prototype, {
    type: kEnumerableProperty,
    extractable: kEnumerableProperty,
    algorithm: kEnumerableProperty,
    usages: kEnumerableProperty,
    [SymbolToStringTag]: {
      __proto__: null,
      configurable: true,
      value: 'CryptoKey'
    }
  });
  return [CryptoKey, InternalCryptoKey];
});

// The helpers below return a CryptoKey's internal slot value,
// populating the per-instance cache on first access via a single
// native call. The public `type` getter converts the native enum to
// the Web Crypto string. The `usages` helper converts the native usage
// mask to Web Crypto strings. The public `algorithm` / `usages` getters
// on `CryptoKey.prototype` cache their returned objects.

/**
 * Returns the value of a CryptoKey's `[[type]]` internal slot.
 * @param {CryptoKey} key
 * @returns {'secret' | 'public' | 'private'}
 */
function getCryptoKeyType(key) {
  switch (getSlots(key)[kSlotType]) {
    case kKeyTypeSecret:
      return 'secret';
    case kKeyTypePublic:
      return 'public';
    case kKeyTypePrivate:
      return 'private';
    default:
      {
        var assert = require('internal/assert');
        assert.fail('Unreachable code');
      }
  }
}

/**
 * Returns the value of a CryptoKey's `[[extractable]]` internal slot.
 * @param {CryptoKey} key
 * @returns {boolean}
 */
function getCryptoKeyExtractable(key) {
  return getSlots(key)[kSlotExtractable];
}

/**
 * Returns the CryptoKey's `[[algorithm]]` internal slot, bypassing the
 * public `algorithm` getter (which returns a cloned copy).
 * @param {CryptoKey} key
 * @returns {object}
 */
function getCryptoKeyAlgorithm(key) {
  return getSlots(key)[kSlotAlgorithm];
}

/**
 * Returns the CryptoKey's native `[[usages]]` mask.
 * @param {CryptoKey} key
 * @returns {number}
 */
function getCryptoKeyUsagesMask(key) {
  return getSlots(key)[kSlotUsagesMask];
}

/**
 * Returns whether a CryptoKey's `[[usages]]` contains `usage`.
 * @param {CryptoKey} key
 * @param {string} usage
 * @returns {boolean}
 */
function hasCryptoKeyUsage(key, usage) {
  return hasUsage(getCryptoKeyUsagesMask(key), usage);
}

/**
 * Returns the CryptoKey's cached canonical usages array for internal
 * consumers, expanding it from the native usage mask on first access.
 * @param {Array} slots
 * @returns {string[]}
 */
function getCryptoKeyUsagesFromSlots(slots) {
  var usages = slots[kSlotUsages];
  if (usages === undefined) {
    usages = getUsagesFromMask(slots[kSlotUsagesMask]);
    slots[kSlotUsages] = usages;
  }
  return usages;
}

/**
 * Returns the CryptoKey's `[[usages]]` internal slot, bypassing the
 * public `usages` getter (which returns a cloned array). The internal
 * array is expanded lazily from the native usage mask.
 * @param {CryptoKey} key
 * @returns {string[]}
 */
function getCryptoKeyUsages(key) {
  return getCryptoKeyUsagesFromSlots(getSlots(key));
}

/**
 * Returns the KeyObjectHandle wrapping the CryptoKey's underlying
 * key material.
 * @param {CryptoKey} key
 * @returns {KeyObjectHandle}
 */
function getCryptoKeyHandle(key) {
  return getSlots(key)[kSlotHandle];
}
function isCryptoKey(obj) {
  if (obj == null || typeof obj !== 'object') return false;
  try {
    getSlots(obj);
    return true;
  } catch {
    return false;
  }
}
function importGenericSecretKey(algorithm, format, keyData, extractable, keyUsages) {
  var usagesSet = new SafeSet(keyUsages);
  var {
    name
  } = algorithm;
  if (extractable) throw lazyDOMException(`${name} keys are not extractable`, 'SyntaxError');
  if (hasAnyNotIn(usagesSet, ['deriveKey', 'deriveBits'])) {
    throw lazyDOMException(`Unsupported key usage for a ${name} key`, 'SyntaxError');
  }
  var handle;
  switch (format) {
    case 'KeyObject':
      {
        handle = getKeyObjectHandle(keyData);
        break;
      }
    case 'raw-secret':
    case 'raw':
      {
        handle = new KeyObjectHandle();
        handle.init(kKeyTypeSecret, keyData);
        break;
      }
    default:
      return undefined;
  }
  return new InternalCryptoKey(handle, {
    name
  }, getUsagesMask(usagesSet), false);
}
module.exports = {
  // Public API.
  createSecretKey,
  createPublicKey,
  createPrivateKey,
  KeyObject,
  CryptoKey,
  InternalCryptoKey,
  // These are designed for internal use only and should not be exposed.
  parsePublicKeyEncoding,
  parsePrivateKeyEncoding,
  parseKeyEncoding,
  preparePrivateKey,
  preparePublicOrPrivateKey,
  prepareSecretKey,
  SecretKeyObject,
  PublicKeyObject,
  PrivateKeyObject,
  isKeyObject,
  getKeyObjectType,
  getKeyObjectHandle,
  getKeyObjectSymmetricKeySize,
  getKeyObjectAsymmetricKeyType,
  getKeyObjectAsymmetricKeyDetails,
  isCryptoKey,
  getCryptoKeyType,
  getCryptoKeyExtractable,
  getCryptoKeyAlgorithm,
  getCryptoKeyUsages,
  getCryptoKeyUsagesMask,
  hasCryptoKeyUsage,
  getCryptoKeyHandle,
  importGenericSecretKey
};

