'use strict';

var {
  KeyObjectHandle,
  kKeyFormatDER,
  kKeyFormatJWK,
  kKeyEncodingPKCS8,
  kKeyEncodingSPKI,
  kKeyTypePublic,
  kKeyTypePrivate,
  kKeyTypeSecret
} = internalBinding('crypto');
var {
  validateKeyOps
} = require('internal/crypto/util');
var {
  lazyDOMException
} = require('internal/util');
function importDerKey(keyData, isPublic) {
  var handle = new KeyObjectHandle();
  var keyType = isPublic ? kKeyTypePublic : kKeyTypePrivate;
  var encoding = isPublic ? kKeyEncodingSPKI : kKeyEncodingPKCS8;
  try {
    handle.init(keyType, keyData, kKeyFormatDER, encoding, null, null);
  } catch (err) {
    throw lazyDOMException('Invalid keyData', {
      name: 'DataError',
      cause: err
    });
  }
  return handle;
}
function validateJwk(keyData, kty, extractable, usagesSet, expectedUse) {
  if (typeof keyData.kty !== 'string') throw lazyDOMException('Invalid keyData', 'DataError');
  if (keyData.kty !== kty) throw lazyDOMException('Invalid JWK "kty" Parameter', 'DataError');
  switch (kty) {
    case 'RSA':
      if (typeof keyData.n !== 'string' || typeof keyData.e !== 'string' || keyData.d !== undefined && typeof keyData.d !== 'string') throw lazyDOMException('Invalid keyData', 'DataError');
      if (typeof keyData.d === 'string' && (typeof keyData.p !== 'string' || typeof keyData.q !== 'string' || typeof keyData.dp !== 'string' || typeof keyData.dq !== 'string' || typeof keyData.qi !== 'string')) throw lazyDOMException('Invalid keyData', 'DataError');
      break;
    case 'EC':
      if (typeof keyData.crv !== 'string' || typeof keyData.x !== 'string' || typeof keyData.y !== 'string' || keyData.d !== undefined && typeof keyData.d !== 'string') throw lazyDOMException('Invalid keyData', 'DataError');
      break;
    case 'OKP':
      if (typeof keyData.crv !== 'string' || typeof keyData.x !== 'string' || keyData.d !== undefined && typeof keyData.d !== 'string') throw lazyDOMException('Invalid keyData', 'DataError');
      break;
    case 'oct':
      if (typeof keyData.k !== 'string') throw lazyDOMException('Invalid keyData', 'DataError');
      break;
    case 'AKP':
      if (typeof keyData.alg !== 'string' || typeof keyData.pub !== 'string' || keyData.priv !== undefined && typeof keyData.priv !== 'string') throw lazyDOMException('Invalid keyData', 'DataError');
      break;
    default:
      {
        // It is not possible to get here because all possible cases are handled above.
        var assert = require('internal/assert');
        assert.fail('Unreachable code');
      }
  }
  if (usagesSet.size > 0 && keyData.use !== undefined) {
    if (keyData.use !== expectedUse) throw lazyDOMException('Invalid JWK "use" Parameter', 'DataError');
  }
  validateKeyOps(keyData.key_ops, usagesSet);
  if (keyData.ext !== undefined && keyData.ext === false && extractable === true) {
    throw lazyDOMException('JWK "ext" Parameter and extractable mismatch', 'DataError');
  }
}
function importJwkKey(isPublic, keyData) {
  var handle = new KeyObjectHandle();
  var keyType = isPublic ? kKeyTypePublic : kKeyTypePrivate;
  try {
    handle.init(keyType, keyData, kKeyFormatJWK, null, null, null);
  } catch (err) {
    throw lazyDOMException('Invalid keyData', {
      name: 'DataError',
      cause: err
    });
  }
  return handle;
}
function importRawKey(isPublic, keyData, format, name, namedCurve) {
  var handle = new KeyObjectHandle();
  var keyType = isPublic ? kKeyTypePublic : kKeyTypePrivate;
  try {
    handle.init(keyType, keyData, format, name ?? null, null, namedCurve ?? null);
  } catch (err) {
    throw lazyDOMException('Invalid keyData', {
      name: 'DataError',
      cause: err
    });
  }
  return handle;
}
function importSecretKey(keyData) {
  var handle = new KeyObjectHandle();
  handle.init(kKeyTypeSecret, keyData);
  return handle;
}
function importJwkSecretKey(keyData) {
  var handle = new KeyObjectHandle();
  try {
    handle.init(kKeyTypeSecret, keyData, kKeyFormatJWK, null, null);
  } catch (err) {
    throw lazyDOMException('Invalid keyData', {
      name: 'DataError',
      cause: err
    });
  }
  return handle;
}
module.exports = {
  importDerKey,
  importJwkKey,
  importJwkSecretKey,
  importRawKey,
  importSecretKey,
  validateJwk
};

