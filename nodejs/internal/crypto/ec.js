'use strict';

var {
  SafeSet,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength
} = primordials;
var {
  EcKeyPairGenJob,
  KeyObjectHandle,
  SignJob,
  kCryptoJobWebCrypto,
  kKeyFormatDER,
  kKeyFormatRawPublic,
  kKeyTypePublic,
  kSignJobModeSign,
  kSignJobModeVerify,
  kSigEncP1363,
  kWebCryptoKeyFormatPKCS8,
  kWebCryptoKeyFormatRaw,
  kWebCryptoKeyFormatSPKI
} = internalBinding('crypto');
var {
  crypto: {
    POINT_CONVERSION_UNCOMPRESSED
  }
} = internalBinding('constants');
var {
  getUsagesMask,
  getUsagesUnion,
  hasAnyNotIn,
  jobPromise,
  normalizeHashName,
  kNamedCurveAliases
} = require('internal/crypto/util');
var {
  lazyDOMException
} = require('internal/util');
var {
  InternalCryptoKey,
  getCryptoKeyAlgorithm,
  getCryptoKeyHandle,
  getCryptoKeyType,
  getKeyObjectHandle,
  getKeyObjectType
} = require('internal/crypto/keys');
var {
  importDerKey,
  importJwkKey,
  importRawKey,
  validateJwk
} = require('internal/crypto/webcrypto_util');
function verifyAcceptableEcKeyUse(name, isPublic, usages) {
  var checkSet;
  switch (name) {
    case 'ECDH':
      checkSet = isPublic ? [] : ['deriveKey', 'deriveBits'];
      break;
    case 'ECDSA':
      checkSet = isPublic ? ['verify'] : ['sign'];
      break;
    default:
      throw lazyDOMException('The algorithm is not supported', 'NotSupportedError');
  }
  if (hasAnyNotIn(usages, checkSet)) {
    throw lazyDOMException(`Unsupported key usage for a ${name} key`, 'SyntaxError');
  }
}
function ecGenerateKey(algorithm, extractable, usages) {
  var {
    name,
    namedCurve
  } = algorithm;
  var usageSet = new SafeSet(usages);
  switch (name) {
    case 'ECDSA':
      if (hasAnyNotIn(usageSet, ['sign', 'verify'])) {
        throw lazyDOMException('Unsupported key usage for an ECDSA key', 'SyntaxError');
      }
      break;
    case 'ECDH':
      if (hasAnyNotIn(usageSet, ['deriveKey', 'deriveBits'])) {
        throw lazyDOMException('Unsupported key usage for an ECDH key', 'SyntaxError');
      }
    // Fall through
  }
  var publicUsages;
  var privateUsages;
  switch (name) {
    case 'ECDSA':
      publicUsages = getUsagesUnion(usageSet, 'verify');
      privateUsages = getUsagesUnion(usageSet, 'sign');
      break;
    case 'ECDH':
      publicUsages = new SafeSet();
      privateUsages = getUsagesUnion(usageSet, 'deriveKey', 'deriveBits');
      break;
  }
  var keyAlgorithm = {
    name,
    namedCurve
  };
  if (privateUsages.size === 0) {
    throw lazyDOMException('Usages cannot be empty when creating a key.', 'SyntaxError');
  }
  return jobPromise(() => new EcKeyPairGenJob(kCryptoJobWebCrypto, namedCurve, undefined, keyAlgorithm, getUsagesMask(publicUsages), getUsagesMask(privateUsages), extractable));
}
function ecExportKey(key, format) {
  try {
    var handle = getCryptoKeyHandle(key);
    switch (format) {
      case kWebCryptoKeyFormatRaw:
        {
          return TypedArrayPrototypeGetBuffer(handle.exportECPublicRaw(POINT_CONVERSION_UNCOMPRESSED));
        }
      case kWebCryptoKeyFormatSPKI:
        {
          var spki = handle.export(kKeyFormatDER, kWebCryptoKeyFormatSPKI);
          // WebCrypto requires uncompressed point format for SPKI exports.
          // This is a very rare edge case dependent on the imported key
          // using compressed point format.
          // Expected SPKI DER byte lengths with uncompressed points:
          // P-256: 91 = 26 bytes of SPKI ASN.1 + 65-byte uncompressed point.
          // P-384: 120 = 23 bytes of SPKI ASN.1 + 97-byte uncompressed point.
          // P-521: 158 = 25 bytes of SPKI ASN.1 + 133-byte uncompressed point.
          // Difference in initial SPKI ASN.1 is caused by OIDs and length encoding.
          var {
            namedCurve
          } = getCryptoKeyAlgorithm(key);
          if (TypedArrayPrototypeGetByteLength(spki) !== {
            '__proto__': null,
            'P-256': 91,
            'P-384': 120,
            'P-521': 158
          }[namedCurve]) {
            var raw = handle.exportECPublicRaw(POINT_CONVERSION_UNCOMPRESSED);
            var tmp = new KeyObjectHandle();
            tmp.init(kKeyTypePublic, raw, kKeyFormatRawPublic, 'ec', null, namedCurve);
            spki = tmp.export(kKeyFormatDER, kWebCryptoKeyFormatSPKI);
          }
          return TypedArrayPrototypeGetBuffer(spki);
        }
      case kWebCryptoKeyFormatPKCS8:
        {
          return TypedArrayPrototypeGetBuffer(handle.export(kKeyFormatDER, kWebCryptoKeyFormatPKCS8, null, null));
        }
      default:
        return undefined;
    }
  } catch (err) {
    throw lazyDOMException('The operation failed for an operation-specific reason', {
      name: 'OperationError',
      cause: err
    });
  }
}
function ecImportKey(format, keyData, algorithm, extractable, usages) {
  var {
    name,
    namedCurve
  } = algorithm;
  var handle;
  var usagesSet = new SafeSet(usages);
  switch (format) {
    case 'KeyObject':
      {
        verifyAcceptableEcKeyUse(name, getKeyObjectType(keyData) === 'public', usagesSet);
        handle = getKeyObjectHandle(keyData);
        break;
      }
    case 'spki':
      {
        verifyAcceptableEcKeyUse(name, true, usagesSet);
        handle = importDerKey(keyData, true);
        break;
      }
    case 'pkcs8':
      {
        verifyAcceptableEcKeyUse(name, false, usagesSet);
        handle = importDerKey(keyData, false);
        break;
      }
    case 'jwk':
      {
        var expectedUse = name === 'ECDH' ? 'enc' : 'sig';
        validateJwk(keyData, 'EC', extractable, usagesSet, expectedUse);
        if (keyData.crv !== namedCurve) throw lazyDOMException('JWK "crv" does not match the requested algorithm', 'DataError');
        if (algorithm.name === 'ECDSA' && keyData.alg !== undefined) {
          var algNamedCurve;
          switch (keyData.alg) {
            case 'ES256':
              algNamedCurve = 'P-256';
              break;
            case 'ES384':
              algNamedCurve = 'P-384';
              break;
            case 'ES512':
              algNamedCurve = 'P-521';
              break;
          }
          if (algNamedCurve !== namedCurve) throw lazyDOMException('JWK "alg" does not match the requested algorithm', 'DataError');
        }
        var isPublic = keyData.d === undefined;
        verifyAcceptableEcKeyUse(name, isPublic, usagesSet);
        handle = importJwkKey(isPublic, keyData);
        break;
      }
    case 'raw':
      {
        verifyAcceptableEcKeyUse(name, true, usagesSet);
        handle = importRawKey(true, keyData, kKeyFormatRawPublic, 'ec', namedCurve);
        break;
      }
    default:
      return undefined;
  }
  switch (algorithm.name) {
    case 'ECDSA':
    // Fall through
    case 'ECDH':
      if (handle.getAsymmetricKeyType() !== 'ec') throw lazyDOMException('Invalid key type', 'DataError');
      break;
  }
  if (!handle.checkEcKeyData()) {
    throw lazyDOMException('Invalid keyData', 'DataError');
  }
  if (kNamedCurveAliases[namedCurve] !== handle.keyDetail({}).namedCurve) throw lazyDOMException('Named curve mismatch', 'DataError');
  return new InternalCryptoKey(handle, {
    name,
    namedCurve
  }, getUsagesMask(usagesSet), extractable);
}
function ecdsaSignVerify(key, data, _ref, signature) {
  var {
    name,
    hash
  } = _ref;
  var mode = signature === undefined ? kSignJobModeSign : kSignJobModeVerify;
  var type = mode === kSignJobModeSign ? 'private' : 'public';
  if (getCryptoKeyType(key) !== type) throw lazyDOMException(`Key must be a ${type} key`, 'InvalidAccessError');
  return jobPromise(() => new SignJob(kCryptoJobWebCrypto, mode, getCryptoKeyHandle(key), undefined, undefined, undefined, undefined, data, normalizeHashName(hash.name), undefined,
  // Salt length, not used with ECDSA
  undefined,
  // PSS Padding, not used with ECDSA
  kSigEncP1363, undefined, signature));
}
module.exports = {
  ecExportKey,
  ecImportKey,
  ecGenerateKey,
  ecdsaSignVerify
};

