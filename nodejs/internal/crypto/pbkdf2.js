'use strict';

var {
  ArrayBuffer,
  FunctionPrototypeCall,
  PromiseResolve
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  PBKDF2Job,
  kCryptoJobAsync,
  kCryptoJobSync,
  kCryptoJobWebCrypto
} = internalBinding('crypto');
var {
  validateFunction,
  validateInt32,
  validateString
} = require('internal/validators');
var {
  getArrayBufferOrView,
  normalizeHashName,
  jobPromise
} = require('internal/crypto/util');
var {
  lazyDOMException
} = require('internal/util');
var {
  getCryptoKeyHandle
} = require('internal/crypto/keys');
function pbkdf2(password, salt, iterations, keylen, digest, callback) {
  if (typeof digest === 'function') {
    callback = digest;
    digest = undefined;
  }
  ({
    password,
    salt,
    iterations,
    keylen,
    digest
  } = check(password, salt, iterations, keylen, digest));
  validateFunction(callback, 'callback');
  var job = new PBKDF2Job(kCryptoJobAsync, password, salt, iterations, keylen, digest);
  job.ondone = (err, result) => {
    if (err !== undefined) return FunctionPrototypeCall(callback, job, err);
    var buf = Buffer.from(result);
    return FunctionPrototypeCall(callback, job, null, buf);
  };
  job.run();
}
function pbkdf2Sync(password, salt, iterations, keylen, digest) {
  ({
    password,
    salt,
    iterations,
    keylen,
    digest
  } = check(password, salt, iterations, keylen, digest));
  var job = new PBKDF2Job(kCryptoJobSync, password, salt, iterations, keylen, digest);
  var {
    0: err,
    1: result
  } = job.run();
  if (err !== undefined) throw err;
  return Buffer.from(result);
}
function check(password, salt, iterations, keylen, digest) {
  validateString(digest, 'digest');
  password = getArrayBufferOrView(password, 'password');
  salt = getArrayBufferOrView(salt, 'salt');
  // OpenSSL uses a signed int to represent these values, so we are restricted
  // to the 31-bit range here (which is plenty).
  validateInt32(iterations, 'iterations', 1);
  validateInt32(keylen, 'keylen', 0);
  // Coerce -0 to +0.
  keylen += 0;
  return {
    password,
    salt,
    iterations,
    keylen,
    digest
  };
}
function validatePbkdf2DeriveBitsLength(length) {
  if (length === null) throw lazyDOMException('length cannot be null', 'OperationError');
  if (length % 8) {
    throw lazyDOMException('length must be a multiple of 8', 'OperationError');
  }
}
function pbkdf2DeriveBits(algorithm, baseKey, length) {
  validatePbkdf2DeriveBitsLength(length);
  var {
    iterations,
    hash,
    salt
  } = algorithm;
  if (length === 0) return PromiseResolve(new ArrayBuffer(0));
  return jobPromise(() => new PBKDF2Job(kCryptoJobWebCrypto, getCryptoKeyHandle(baseKey), salt, iterations, length / 8, normalizeHashName(hash.name)));
}
module.exports = {
  pbkdf2,
  pbkdf2Sync,
  pbkdf2DeriveBits,
  validatePbkdf2DeriveBitsLength
};

