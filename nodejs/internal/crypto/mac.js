'use strict';

var {
  SafeSet,
  StringPrototypeSubstring
} = primordials;
var {
  HmacJob,
  KmacJob,
  kCryptoJobWebCrypto,
  kSignJobModeSign,
  kSignJobModeVerify,
  SecretKeyGenJob
} = internalBinding('crypto');
var {
  getBlockSize,
  getUsagesMask,
  hasAnyNotIn,
  jobPromise,
  normalizeHashName
} = require('internal/crypto/util');
var {
  lazyDOMException
} = require('internal/util');
var {
  InternalCryptoKey,
  getCryptoKeyAlgorithm,
  getCryptoKeyHandle,
  getKeyObjectHandle,
  getKeyObjectSymmetricKeySize
} = require('internal/crypto/keys');
var {
  importJwkSecretKey,
  importSecretKey,
  validateJwk
} = require('internal/crypto/webcrypto_util');
function hmacGenerateKey(algorithm, extractable, usages) {
  var {
    hash,
    name,
    length = getBlockSize(hash.name)
  } = algorithm;
  var usageSet = new SafeSet(usages);
  if (hasAnyNotIn(usageSet, ['sign', 'verify'])) {
    throw lazyDOMException('Unsupported key usage for an HMAC key', 'SyntaxError');
  }
  if (usageSet.size === 0) {
    throw lazyDOMException('Usages cannot be empty when creating a key.', 'SyntaxError');
  }
  return jobPromise(() => new SecretKeyGenJob(kCryptoJobWebCrypto, length, {
    name,
    length,
    hash
  }, getUsagesMask(usageSet), extractable));
}
function kmacGenerateKey(algorithm, extractable, usages) {
  var {
    name,
    length = {
      __proto__: null,
      KMAC128: 128,
      KMAC256: 256
    }[name]
  } = algorithm;
  var usageSet = new SafeSet(usages);
  if (hasAnyNotIn(usageSet, ['sign', 'verify'])) {
    throw lazyDOMException(`Unsupported key usage for ${name} key`, 'SyntaxError');
  }
  if (usageSet.size === 0) {
    throw lazyDOMException('Usages cannot be empty when creating a key.', 'SyntaxError');
  }
  return jobPromise(() => new SecretKeyGenJob(kCryptoJobWebCrypto, length, {
    name,
    length
  }, getUsagesMask(usageSet), extractable));
}
function macImportKey(format, keyData, algorithm, extractable, usages) {
  var isHmac = algorithm.name === 'HMAC';
  var usagesSet = new SafeSet(usages);
  if (hasAnyNotIn(usagesSet, ['sign', 'verify'])) {
    throw lazyDOMException(`Unsupported key usage for ${algorithm.name} key`, 'SyntaxError');
  }
  var handle;
  var length;
  switch (format) {
    case 'KeyObject':
      {
        length = getKeyObjectSymmetricKeySize(keyData) * 8;
        handle = getKeyObjectHandle(keyData);
        break;
      }
    case 'raw-secret':
    case 'raw':
      {
        if (format === 'raw' && !isHmac) {
          return undefined;
        }
        length = keyData.byteLength * 8;
        handle = importSecretKey(keyData);
        break;
      }
    case 'jwk':
      {
        validateJwk(keyData, 'oct', extractable, usagesSet, 'sig');
        if (keyData.alg !== undefined) {
          var expected = isHmac ? normalizeHashName(algorithm.hash.name, normalizeHashName.kContextJwkHmac) : `K${StringPrototypeSubstring(algorithm.name, 4)}`;
          if (expected && keyData.alg !== expected) throw lazyDOMException('JWK "alg" does not match the requested algorithm', 'DataError');
        }
        handle = importJwkSecretKey(keyData);
        length = handle.getSymmetricKeySize() * 8;
        break;
      }
    default:
      return undefined;
  }
  if (length === 0) throw lazyDOMException('Zero-length key is not supported', 'DataError');
  if (algorithm.length !== undefined && algorithm.length !== length) {
    throw lazyDOMException('Invalid key length', 'DataError');
  }
  var algorithmObject = {
    name: algorithm.name,
    length
  };
  if (isHmac) {
    algorithmObject.hash = algorithm.hash;
  }
  return new InternalCryptoKey(handle, algorithmObject, getUsagesMask(usagesSet), extractable);
}
function hmacSignVerify(key, data, algorithm, signature) {
  var mode = signature === undefined ? kSignJobModeSign : kSignJobModeVerify;
  return jobPromise(() => new HmacJob(kCryptoJobWebCrypto, mode, normalizeHashName(getCryptoKeyAlgorithm(key).hash.name), getCryptoKeyHandle(key), data, signature));
}
function kmacSignVerify(key, data, algorithm, signature) {
  var mode = signature === undefined ? kSignJobModeSign : kSignJobModeVerify;
  return jobPromise(() => new KmacJob(kCryptoJobWebCrypto, mode, getCryptoKeyHandle(key), algorithm.name, algorithm.customization, algorithm.outputLength / 8, data, signature));
}
module.exports = {
  macImportKey,
  hmacGenerateKey,
  hmacSignVerify,
  kmacGenerateKey,
  kmacSignVerify
};

