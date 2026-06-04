'use strict';

var {
  FunctionPrototypeCall
} = primordials;
var {
  codes: {
    ERR_CRYPTO_KEM_NOT_SUPPORTED
  }
} = require('internal/errors');
var {
  validateFunction
} = require('internal/validators');
var {
  kCryptoJobAsync,
  kCryptoJobSync,
  KEMDecapsulateJob,
  KEMEncapsulateJob
} = internalBinding('crypto');
var {
  preparePrivateKey,
  preparePublicOrPrivateKey
} = require('internal/crypto/keys');
var {
  getArrayBufferOrView
} = require('internal/crypto/util');
function encapsulate(key, callback) {
  if (!KEMEncapsulateJob) throw new ERR_CRYPTO_KEM_NOT_SUPPORTED();
  if (callback !== undefined) validateFunction(callback, 'callback');
  var {
    data: keyData,
    format: keyFormat,
    type: keyType,
    passphrase: keyPassphrase,
    namedCurve: keyNamedCurve
  } = preparePublicOrPrivateKey(key);
  var job = new KEMEncapsulateJob(callback ? kCryptoJobAsync : kCryptoJobSync, keyData, keyFormat, keyType, keyPassphrase, keyNamedCurve);
  if (!callback) {
    var {
      0: err,
      1: result
    } = job.run();
    if (err !== undefined) throw err;
    var {
      0: sharedKey,
      1: ciphertext
    } = result;
    return {
      sharedKey,
      ciphertext
    };
  }
  job.ondone = (error, result) => {
    if (error) return FunctionPrototypeCall(callback, job, error);
    var {
      0: sharedKey,
      1: ciphertext
    } = result;
    FunctionPrototypeCall(callback, job, null, {
      sharedKey,
      ciphertext
    });
  };
  job.run();
}
function decapsulate(key, ciphertext, callback) {
  if (!KEMDecapsulateJob) throw new ERR_CRYPTO_KEM_NOT_SUPPORTED();
  if (callback !== undefined) validateFunction(callback, 'callback');
  var {
    data: keyData,
    format: keyFormat,
    type: keyType,
    passphrase: keyPassphrase,
    namedCurve: keyNamedCurve
  } = preparePrivateKey(key);
  ciphertext = getArrayBufferOrView(ciphertext, 'ciphertext');
  var job = new KEMDecapsulateJob(callback ? kCryptoJobAsync : kCryptoJobSync, keyData, keyFormat, keyType, keyPassphrase, keyNamedCurve, ciphertext);
  if (!callback) {
    var {
      0: err,
      1: result
    } = job.run();
    if (err !== undefined) throw err;
    return result;
  }
  job.ondone = (error, result) => {
    if (error) return FunctionPrototypeCall(callback, job, error);
    FunctionPrototypeCall(callback, job, null, result);
  };
  job.run();
}
module.exports = {
  encapsulate,
  decapsulate
};

