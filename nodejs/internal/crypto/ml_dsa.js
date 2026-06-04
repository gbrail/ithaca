'use strict';

var {
  SafeSet,
  StringPrototypeToLowerCase,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength
} = primordials;
var {
  SignJob,
  kCryptoJobWebCrypto,
  kKeyFormatDER,
  kKeyFormatRawPublic,
  kKeyFormatRawSeed,
  kSignJobModeSign,
  kSignJobModeVerify,
  kWebCryptoKeyFormatRaw,
  kWebCryptoKeyFormatPKCS8,
  kWebCryptoKeyFormatSPKI,
  NidKeyPairGenJob,
  EVP_PKEY_ML_DSA_44,
  EVP_PKEY_ML_DSA_65,
  EVP_PKEY_ML_DSA_87
} = internalBinding('crypto');
var {
  getUsagesMask,
  getUsagesUnion,
  hasAnyNotIn,
  jobPromise
} = require('internal/crypto/util');
var {
  lazyDOMException
} = require('internal/util');
var {
  getCryptoKeyHandle,
  getCryptoKeyType,
  getKeyObjectHandle,
  getKeyObjectType,
  InternalCryptoKey
} = require('internal/crypto/keys');
var {
  importDerKey,
  importJwkKey,
  importRawKey,
  validateJwk
} = require('internal/crypto/webcrypto_util');
function verifyAcceptableMlDsaKeyUse(name, isPublic, usages) {
  var checkSet = isPublic ? ['verify'] : ['sign'];
  if (hasAnyNotIn(usages, checkSet)) {
    throw lazyDOMException(`Unsupported key usage for a ${name} key`, 'SyntaxError');
  }
}
function mlDsaGenerateKey(algorithm, extractable, usages) {
  var {
    name
  } = algorithm;
  var usageSet = new SafeSet(usages);
  if (hasAnyNotIn(usageSet, ['sign', 'verify'])) {
    throw lazyDOMException(`Unsupported key usage for an ${name} key`, 'SyntaxError');
  }
  var nid = {
    '__proto__': null,
    'ML-DSA-44': EVP_PKEY_ML_DSA_44,
    'ML-DSA-65': EVP_PKEY_ML_DSA_65,
    'ML-DSA-87': EVP_PKEY_ML_DSA_87
  }[name];
  var publicUsages = getUsagesUnion(usageSet, 'verify');
  var privateUsages = getUsagesUnion(usageSet, 'sign');
  var keyAlgorithm = {
    name
  };
  if (privateUsages.size === 0) {
    throw lazyDOMException('Usages cannot be empty when creating a key.', 'SyntaxError');
  }
  return jobPromise(() => new NidKeyPairGenJob(kCryptoJobWebCrypto, nid, keyAlgorithm, getUsagesMask(publicUsages), getUsagesMask(privateUsages), extractable));
}
function mlDsaExportKey(key, format) {
  try {
    var handle = getCryptoKeyHandle(key);
    switch (format) {
      case kWebCryptoKeyFormatRaw:
        {
          return TypedArrayPrototypeGetBuffer(getCryptoKeyType(key) === 'private' ? handle.rawSeed() : handle.rawPublicKey());
        }
      case kWebCryptoKeyFormatSPKI:
        {
          return TypedArrayPrototypeGetBuffer(handle.export(kKeyFormatDER, kWebCryptoKeyFormatSPKI));
        }
      case kWebCryptoKeyFormatPKCS8:
        {
          var pkcs8 = handle.export(kKeyFormatDER, kWebCryptoKeyFormatPKCS8, null, null);
          // Edge case only possible when user creates a seedless KeyObject
          // first and converts it with KeyObject.prototype.toCryptoKey.
          // 54 = 22 bytes of PKCS#8 ASN.1 + 32-byte seed.
          if (TypedArrayPrototypeGetByteLength(pkcs8) !== 54) {
            throw lazyDOMException('The operation failed for an operation-specific reason', {
              name: 'OperationError'
            });
          }
          return TypedArrayPrototypeGetBuffer(pkcs8);
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
function mlDsaImportKey(format, keyData, algorithm, extractable, usages) {
  var {
    name
  } = algorithm;
  var handle;
  var usagesSet = new SafeSet(usages);
  switch (format) {
    case 'KeyObject':
      {
        verifyAcceptableMlDsaKeyUse(name, getKeyObjectType(keyData) === 'public', usagesSet);
        handle = getKeyObjectHandle(keyData);
        break;
      }
    case 'spki':
      {
        verifyAcceptableMlDsaKeyUse(name, true, usagesSet);
        handle = importDerKey(keyData, true);
        break;
      }
    case 'pkcs8':
      {
        verifyAcceptableMlDsaKeyUse(name, false, usagesSet);
        var privOnlyLengths = {
          '__proto__': null,
          'ML-DSA-44': 2588,
          'ML-DSA-65': 4060,
          'ML-DSA-87': 4924
        };
        if (keyData.byteLength === privOnlyLengths[name]) {
          throw lazyDOMException('Importing an ML-DSA PKCS#8 key without a seed is not supported', 'NotSupportedError');
        }
        handle = importDerKey(keyData, false);
        break;
      }
    case 'jwk':
      {
        validateJwk(keyData, 'AKP', extractable, usagesSet, 'sig');
        if (keyData.alg !== name) throw lazyDOMException('JWK "alg" Parameter and algorithm name mismatch', 'DataError');
        var isPublic = keyData.priv === undefined;
        verifyAcceptableMlDsaKeyUse(name, isPublic, usagesSet);
        handle = importJwkKey(isPublic, keyData);
        break;
      }
    case 'raw-public':
    case 'raw-seed':
      {
        var _isPublic = format === 'raw-public';
        verifyAcceptableMlDsaKeyUse(name, _isPublic, usagesSet);
        handle = importRawKey(_isPublic, keyData, _isPublic ? kKeyFormatRawPublic : kKeyFormatRawSeed, name);
        break;
      }
    default:
      return undefined;
  }
  if (handle.getAsymmetricKeyType() !== StringPrototypeToLowerCase(name)) {
    throw lazyDOMException('Invalid key type', 'DataError');
  }
  return new InternalCryptoKey(handle, {
    name
  }, getUsagesMask(usagesSet), extractable);
}
function mlDsaSignVerify(key, data, algorithm, signature) {
  var mode = signature === undefined ? kSignJobModeSign : kSignJobModeVerify;
  var type = mode === kSignJobModeSign ? 'private' : 'public';
  if (getCryptoKeyType(key) !== type) throw lazyDOMException(`Key must be a ${type} key`, 'InvalidAccessError');
  return jobPromise(() => new SignJob(kCryptoJobWebCrypto, mode, getCryptoKeyHandle(key), undefined, undefined, undefined, undefined, data, undefined, undefined, undefined, undefined, algorithm.context, signature));
}
module.exports = {
  mlDsaExportKey,
  mlDsaImportKey,
  mlDsaGenerateKey,
  mlDsaSignVerify
};

