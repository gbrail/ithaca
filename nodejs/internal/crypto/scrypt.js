'use strict';

var {
  FunctionPrototypeCall
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  ScryptJob,
  kCryptoJobAsync,
  kCryptoJobSync
} = internalBinding('crypto');
var {
  validateFunction,
  validateInteger,
  validateInt32,
  validateUint32
} = require('internal/validators');
var {
  codes: {
    ERR_CRYPTO_SCRYPT_NOT_SUPPORTED,
    ERR_INCOMPATIBLE_OPTION_PAIR
  }
} = require('internal/errors');
var {
  getArrayBufferOrView
} = require('internal/crypto/util');
var defaults = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 << 20 // 32 MiB, matches SCRYPT_MAX_MEM.
};
function scrypt(password, salt, keylen, options) {
  var callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : defaults;
  if (callback === defaults) {
    callback = options;
    options = defaults;
  }
  options = check(password, salt, keylen, options);
  var {
    N,
    r,
    p,
    maxmem
  } = options;
  ({
    password,
    salt,
    keylen
  } = options);
  validateFunction(callback, 'callback');
  var job = new ScryptJob(kCryptoJobAsync, password, salt, N, r, p, maxmem, keylen);
  job.ondone = (error, result) => {
    if (error !== undefined) return FunctionPrototypeCall(callback, job, error);
    var buf = Buffer.from(result);
    return FunctionPrototypeCall(callback, job, null, buf);
  };
  job.run();
}
function scryptSync(password, salt, keylen) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaults;
  options = check(password, salt, keylen, options);
  var {
    N,
    r,
    p,
    maxmem
  } = options;
  ({
    password,
    salt,
    keylen
  } = options);
  var job = new ScryptJob(kCryptoJobSync, password, salt, N, r, p, maxmem, keylen);
  var {
    0: err,
    1: result
  } = job.run();
  if (err !== undefined) throw err;
  return Buffer.from(result);
}
function check(password, salt, keylen, options) {
  if (ScryptJob === undefined) throw new ERR_CRYPTO_SCRYPT_NOT_SUPPORTED();
  password = getArrayBufferOrView(password, 'password');
  salt = getArrayBufferOrView(salt, 'salt');
  validateInt32(keylen, 'keylen', 0);
  // Coerce -0 to +0.
  keylen += 0;
  var {
    N,
    r,
    p,
    maxmem
  } = defaults;
  if (options && options !== defaults) {
    var has_N = options.N !== undefined;
    if (has_N) {
      N = options.N;
      validateUint32(N, 'N');
    }
    if (options.cost !== undefined) {
      if (has_N) throw new ERR_INCOMPATIBLE_OPTION_PAIR('N', 'cost');
      N = options.cost;
      validateUint32(N, 'cost');
    }
    var has_r = options.r !== undefined;
    if (has_r) {
      r = options.r;
      validateUint32(r, 'r');
    }
    if (options.blockSize !== undefined) {
      if (has_r) throw new ERR_INCOMPATIBLE_OPTION_PAIR('r', 'blockSize');
      r = options.blockSize;
      validateUint32(r, 'blockSize');
    }
    var has_p = options.p !== undefined;
    if (has_p) {
      p = options.p;
      validateUint32(p, 'p');
    }
    if (options.parallelization !== undefined) {
      if (has_p) throw new ERR_INCOMPATIBLE_OPTION_PAIR('p', 'parallelization');
      p = options.parallelization;
      validateUint32(p, 'parallelization');
    }
    if (options.maxmem !== undefined) {
      maxmem = options.maxmem;
      validateInteger(maxmem, 'maxmem', 0);
    }
    if (N === 0) N = defaults.N;
    if (r === 0) r = defaults.r;
    if (p === 0) p = defaults.p;
    if (maxmem === 0) maxmem = defaults.maxmem;
  }
  return {
    password,
    salt,
    keylen,
    N,
    r,
    p,
    maxmem
  };
}
module.exports = {
  scrypt,
  scryptSync
};

