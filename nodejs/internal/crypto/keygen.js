'use strict';

function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  FunctionPrototypeCall,
  ObjectDefineProperty,
  SafeArrayIterator
} = primordials;
var {
  DhKeyPairGenJob,
  DsaKeyPairGenJob,
  EcKeyPairGenJob,
  NidKeyPairGenJob,
  RsaKeyPairGenJob,
  SecretKeyGenJob,
  kCryptoJobAsync,
  kCryptoJobSync,
  kKeyVariantRSA_PSS,
  kKeyVariantRSA_SSA_PKCS1_v1_5,
  EVP_PKEY_ED25519,
  EVP_PKEY_ED448,
  EVP_PKEY_ML_DSA_44,
  EVP_PKEY_ML_DSA_65,
  EVP_PKEY_ML_DSA_87,
  EVP_PKEY_ML_KEM_1024,
  EVP_PKEY_ML_KEM_512,
  EVP_PKEY_ML_KEM_768,
  EVP_PKEY_SLH_DSA_SHA2_128F,
  EVP_PKEY_SLH_DSA_SHA2_128S,
  EVP_PKEY_SLH_DSA_SHA2_192F,
  EVP_PKEY_SLH_DSA_SHA2_192S,
  EVP_PKEY_SLH_DSA_SHA2_256F,
  EVP_PKEY_SLH_DSA_SHA2_256S,
  EVP_PKEY_SLH_DSA_SHAKE_128F,
  EVP_PKEY_SLH_DSA_SHAKE_128S,
  EVP_PKEY_SLH_DSA_SHAKE_192F,
  EVP_PKEY_SLH_DSA_SHAKE_192S,
  EVP_PKEY_SLH_DSA_SHAKE_256F,
  EVP_PKEY_SLH_DSA_SHAKE_256S,
  EVP_PKEY_X25519,
  EVP_PKEY_X448,
  OPENSSL_EC_NAMED_CURVE,
  OPENSSL_EC_EXPLICIT_CURVE
} = internalBinding('crypto');
var {
  PublicKeyObject,
  PrivateKeyObject,
  SecretKeyObject,
  parsePublicKeyEncoding,
  parsePrivateKeyEncoding
} = require('internal/crypto/keys');
var {
  customPromisifyArgs,
  kEmptyObject
} = require('internal/util');
var {
  validateFunction,
  validateBuffer,
  validateString,
  validateInteger,
  validateObject,
  validateOneOf,
  validateInt32,
  validateUint32
} = require('internal/validators');
var {
  codes: {
    ERR_INCOMPATIBLE_OPTION_PAIR,
    ERR_INVALID_ARG_VALUE,
    ERR_MISSING_OPTION
  }
} = require('internal/errors');
var {
  isArrayBufferView
} = require('internal/util/types');
function isJwk(obj) {
  return obj != null && obj.kty !== undefined;
}
function wrapKey(key, ctor) {
  if (typeof key === 'string' || isArrayBufferView(key) || isJwk(key)) return key;
  return new ctor(key);
}
function generateKeyPair(type, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  validateFunction(callback, 'callback');
  var job = createJob(kCryptoJobAsync, type, options);
  job.ondone = (error, result) => {
    if (error) return FunctionPrototypeCall(callback, job, error);
    // If no encoding was chosen, return key objects instead.
    var {
      0: pubkey,
      1: privkey
    } = result;
    pubkey = wrapKey(pubkey, PublicKeyObject);
    privkey = wrapKey(privkey, PrivateKeyObject);
    FunctionPrototypeCall(callback, job, null, pubkey, privkey);
  };
  job.run();
}
ObjectDefineProperty(generateKeyPair, customPromisifyArgs, {
  __proto__: null,
  value: ['publicKey', 'privateKey'],
  enumerable: false
});
function generateKeyPairSync(type, options) {
  return handleError(createJob(kCryptoJobSync, type, options).run());
}
function handleError(ret) {
  if (ret == null) return; // async

  var {
    0: err,
    1: keys
  } = ret;
  if (err !== undefined) throw err;
  var {
    0: publicKey,
    1: privateKey
  } = keys;

  // If no encoding was chosen, return key objects instead.
  return {
    publicKey: wrapKey(publicKey, PublicKeyObject),
    privateKey: wrapKey(privateKey, PrivateKeyObject)
  };
}
function parseKeyEncoding(keyType) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var {
    publicKeyEncoding,
    privateKeyEncoding
  } = options;
  var publicFormat, publicType;
  if (publicKeyEncoding == null) {
    publicFormat = publicType = undefined;
  } else if (typeof publicKeyEncoding === 'object') {
    ({
      format: publicFormat,
      type: publicType
    } = parsePublicKeyEncoding(publicKeyEncoding, keyType, 'options.publicKeyEncoding'));
  } else {
    throw new ERR_INVALID_ARG_VALUE('options.publicKeyEncoding', publicKeyEncoding);
  }
  var privateFormat, privateType, cipher, passphrase;
  if (privateKeyEncoding == null) {
    privateFormat = privateType = undefined;
  } else if (typeof privateKeyEncoding === 'object') {
    ({
      format: privateFormat,
      type: privateType,
      cipher,
      passphrase
    } = parsePrivateKeyEncoding(privateKeyEncoding, keyType, 'options.privateKeyEncoding'));
  } else {
    throw new ERR_INVALID_ARG_VALUE('options.privateKeyEncoding', privateKeyEncoding);
  }
  return [publicFormat, publicType, privateFormat, privateType, cipher, passphrase];
}
var nidOnlyKeyPairs = {
  '__proto__': null,
  'ed25519': EVP_PKEY_ED25519,
  'ed448': EVP_PKEY_ED448,
  'x25519': EVP_PKEY_X25519,
  'x448': EVP_PKEY_X448,
  'ml-dsa-44': EVP_PKEY_ML_DSA_44,
  'ml-dsa-65': EVP_PKEY_ML_DSA_65,
  'ml-dsa-87': EVP_PKEY_ML_DSA_87,
  'ml-kem-512': EVP_PKEY_ML_KEM_512,
  'ml-kem-768': EVP_PKEY_ML_KEM_768,
  'ml-kem-1024': EVP_PKEY_ML_KEM_1024,
  'slh-dsa-sha2-128f': EVP_PKEY_SLH_DSA_SHA2_128F,
  'slh-dsa-sha2-128s': EVP_PKEY_SLH_DSA_SHA2_128S,
  'slh-dsa-sha2-192f': EVP_PKEY_SLH_DSA_SHA2_192F,
  'slh-dsa-sha2-192s': EVP_PKEY_SLH_DSA_SHA2_192S,
  'slh-dsa-sha2-256f': EVP_PKEY_SLH_DSA_SHA2_256F,
  'slh-dsa-sha2-256s': EVP_PKEY_SLH_DSA_SHA2_256S,
  'slh-dsa-shake-128f': EVP_PKEY_SLH_DSA_SHAKE_128F,
  'slh-dsa-shake-128s': EVP_PKEY_SLH_DSA_SHAKE_128S,
  'slh-dsa-shake-192f': EVP_PKEY_SLH_DSA_SHAKE_192F,
  'slh-dsa-shake-192s': EVP_PKEY_SLH_DSA_SHAKE_192S,
  'slh-dsa-shake-256f': EVP_PKEY_SLH_DSA_SHAKE_256F,
  'slh-dsa-shake-256s': EVP_PKEY_SLH_DSA_SHAKE_256S
};
function createJob(mode, type, options) {
  validateString(type, 'type');
  var encoding = new SafeArrayIterator(parseKeyEncoding(type, options));
  if (options !== undefined) validateObject(options, 'options');
  switch (type) {
    case 'rsa':
    case 'rsa-pss':
      {
        validateObject(options, 'options');
        var {
          modulusLength
        } = options;
        validateUint32(modulusLength, 'options.modulusLength');
        // Coerce -0 to +0.
        modulusLength += 0;
        var {
          publicExponent
        } = options;
        if (publicExponent == null) {
          publicExponent = 0x10001;
        } else {
          validateUint32(publicExponent, 'options.publicExponent');
          // Coerce -0 to +0.
          publicExponent += 0;
        }
        if (type === 'rsa') {
          return _construct(RsaKeyPairGenJob, [mode, kKeyVariantRSA_SSA_PKCS1_v1_5,
          // Used also for RSA-OAEP
          modulusLength, publicExponent].concat(_toConsumableArray(encoding)));
        }
        var {
          hashAlgorithm,
          mgf1HashAlgorithm
        } = options;
        var {
          saltLength
        } = options;
        if (saltLength !== undefined) {
          validateInt32(saltLength, 'options.saltLength', 0);
          // Coerce -0 to +0.
          saltLength += 0;
        }
        if (hashAlgorithm !== undefined) validateString(hashAlgorithm, 'options.hashAlgorithm');
        if (mgf1HashAlgorithm !== undefined) validateString(mgf1HashAlgorithm, 'options.mgf1HashAlgorithm');
        if (options.hash !== undefined) {
          // This API previously accepted a `hash` option that was deprecated
          // and removed. However, in order to make the change more visible, we
          // opted to throw an error if hash is specified rather than removing it
          // entirely.
          throw new ERR_INVALID_ARG_VALUE('options.hash', options.hash, 'is no longer supported');
        }
        if (options.mgf1Hash !== undefined) {
          // This API previously accepted a `mgf1Hash` option that was deprecated
          // and removed. However, in order to make the change more visible, we
          // opted to throw an error if mgf1Hash is specified rather than removing
          // it entirely.
          throw new ERR_INVALID_ARG_VALUE('options.mgf1Hash', options.mgf1Hash, 'is no longer supported');
        }
        return _construct(RsaKeyPairGenJob, [mode, kKeyVariantRSA_PSS, modulusLength, publicExponent, hashAlgorithm, mgf1HashAlgorithm, saltLength].concat(_toConsumableArray(encoding)));
      }
    case 'dsa':
      {
        validateObject(options, 'options');
        var {
          modulusLength: _modulusLength
        } = options;
        validateUint32(_modulusLength, 'options.modulusLength');
        // Coerce -0 to +0.
        _modulusLength += 0;
        var {
          divisorLength
        } = options;
        if (divisorLength == null) {
          divisorLength = -1;
        } else {
          validateInt32(divisorLength, 'options.divisorLength', 0);
          // Coerce -0 to +0.
          divisorLength += 0;
        }
        return _construct(DsaKeyPairGenJob, [mode, _modulusLength, divisorLength].concat(_toConsumableArray(encoding)));
      }
    case 'ec':
      {
        validateObject(options, 'options');
        var {
          namedCurve
        } = options;
        validateString(namedCurve, 'options.namedCurve');
        var {
          paramEncoding
        } = options;
        if (paramEncoding == null || paramEncoding === 'named') paramEncoding = OPENSSL_EC_NAMED_CURVE;else if (paramEncoding === 'explicit') paramEncoding = OPENSSL_EC_EXPLICIT_CURVE;else throw new ERR_INVALID_ARG_VALUE('options.paramEncoding', paramEncoding);
        return _construct(EcKeyPairGenJob, [mode, namedCurve, paramEncoding].concat(_toConsumableArray(encoding)));
      }
    case 'dh':
      {
        validateObject(options, 'options');
        var {
          group,
          prime
        } = options;
        var {
          primeLength,
          generator
        } = options;
        if (group != null) {
          if (prime != null) throw new ERR_INCOMPATIBLE_OPTION_PAIR('group', 'prime');
          if (primeLength != null) throw new ERR_INCOMPATIBLE_OPTION_PAIR('group', 'primeLength');
          if (generator != null) throw new ERR_INCOMPATIBLE_OPTION_PAIR('group', 'generator');
          validateString(group, 'options.group');
          return _construct(DhKeyPairGenJob, [mode, group].concat(_toConsumableArray(encoding)));
        }
        if (prime != null) {
          if (primeLength != null) throw new ERR_INCOMPATIBLE_OPTION_PAIR('prime', 'primeLength');
          validateBuffer(prime, 'options.prime');
        } else if (primeLength != null) {
          validateInt32(primeLength, 'options.primeLength', 0);
          // Coerce -0 to +0.
          primeLength += 0;
        } else {
          throw new ERR_MISSING_OPTION('At least one of the group, prime, or primeLength options');
        }
        if (generator != null) {
          validateInt32(generator, 'options.generator', 0);
          // Coerce -0 to +0.
          generator += 0;
        }
        return _construct(DhKeyPairGenJob, [mode, prime != null ? prime : primeLength, generator == null ? 2 : generator].concat(_toConsumableArray(encoding)));
      }
    default:
      {
        if (nidOnlyKeyPairs[type] === undefined) {
          throw new ERR_INVALID_ARG_VALUE('type', type, 'must be a supported key type');
        }
        return _construct(NidKeyPairGenJob, [mode, nidOnlyKeyPairs[type]].concat(_toConsumableArray(encoding)));
      }
  }
}

// Symmetric Key Generation

function generateKeyJob(mode, keyType, options) {
  validateString(keyType, 'type');
  validateObject(options, 'options');
  var {
    length
  } = options;
  switch (keyType) {
    case 'hmac':
      validateInteger(length, 'options.length', 8, 2 ** 31 - 1);
      break;
    case 'aes':
      validateOneOf(length, 'options.length', [128, 192, 256]);
      break;
    default:
      throw new ERR_INVALID_ARG_VALUE('type', keyType, 'must be a supported key type');
  }
  return new SecretKeyGenJob(mode, length);
}
function handleGenerateKeyError(ret) {
  if (ret === undefined) return; // async

  var {
    0: err,
    1: key
  } = ret;
  if (err !== undefined) throw err;
  return wrapKey(key, SecretKeyObject);
}
function generateKey(type, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  validateFunction(callback, 'callback');
  var job = generateKeyJob(kCryptoJobAsync, type, options);
  job.ondone = (error, key) => {
    if (error) return FunctionPrototypeCall(callback, job, error);
    FunctionPrototypeCall(callback, job, null, wrapKey(key, SecretKeyObject));
  };
  handleGenerateKeyError(job.run());
}
function generateKeySync(type, options) {
  return handleGenerateKeyError(generateKeyJob(kCryptoJobSync, type, options).run());
}
module.exports = {
  generateKeyPair,
  generateKeyPairSync,
  generateKey,
  generateKeySync
};

