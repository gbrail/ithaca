'use strict';

var {
  FunctionPrototypeCall,
  NumberIsInteger,
  ObjectSetPrototypeOf
} = primordials;
var {
  CipherBase,
  privateDecrypt: _privateDecrypt,
  privateEncrypt: _privateEncrypt,
  publicDecrypt: _publicDecrypt,
  publicEncrypt: _publicEncrypt,
  getCipherInfo: _getCipherInfo
} = internalBinding('crypto');
var {
  crypto: {
    RSA_PKCS1_OAEP_PADDING,
    RSA_PKCS1_PADDING
  }
} = internalBinding('constants');
var {
  codes: {
    ERR_CRYPTO_INVALID_STATE,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_UNKNOWN_ENCODING
  }
} = require('internal/errors');
var {
  validateEncoding,
  validateUint32,
  validateObject,
  validateString
} = require('internal/validators');
var {
  preparePrivateKey,
  preparePublicOrPrivateKey,
  prepareSecretKey
} = require('internal/crypto/keys');
var {
  getArrayBufferOrView,
  getStringOption,
  kHandle
} = require('internal/crypto/util');
var {
  isArrayBufferView
} = require('internal/util/types');
var assert = require('internal/assert');
var LazyTransform = require('internal/streams/lazy_transform');
var {
  normalizeEncoding
} = require('internal/util');
var {
  StringDecoder
} = require('string_decoder');
function rsaFunctionFor(method, defaultPadding, keyType) {
  var keyName = keyType === 'private' ? 'privateKey' : undefined;
  return (key, buffer) => {
    var {
      format,
      type,
      data,
      passphrase,
      namedCurve
    } = keyType === 'private' ? preparePrivateKey(key, keyName) : preparePublicOrPrivateKey(key, keyName);
    var padding = key.padding || defaultPadding;
    var {
      oaepHash,
      encoding
    } = key;
    var {
      oaepLabel
    } = key;
    if (oaepHash !== undefined) validateString(oaepHash, 'key.oaepHash');
    if (oaepLabel !== undefined) oaepLabel = getArrayBufferOrView(oaepLabel, 'key.oaepLabel', encoding);
    buffer = getArrayBufferOrView(buffer, 'buffer', encoding);
    return method(data, format, type, passphrase, namedCurve, buffer, padding, oaepHash, oaepLabel);
  };
}
var publicEncrypt = rsaFunctionFor(_publicEncrypt, RSA_PKCS1_OAEP_PADDING, 'public');
var publicDecrypt = rsaFunctionFor(_publicDecrypt, RSA_PKCS1_PADDING, 'public');
var privateEncrypt = rsaFunctionFor(_privateEncrypt, RSA_PKCS1_PADDING, 'private');
var privateDecrypt = rsaFunctionFor(_privateDecrypt, RSA_PKCS1_OAEP_PADDING, 'private');
function getDecoder(decoder, encoding) {
  var normalizedEncoding = normalizeEncoding(encoding);
  decoder ||= new StringDecoder(encoding);
  if (decoder.encoding !== normalizedEncoding) {
    if (normalizedEncoding === undefined) {
      throw new ERR_UNKNOWN_ENCODING(encoding);
    }
    assert.fail('Cannot change encoding');
  }
  return decoder;
}
function getUIntOption(options, key) {
  var value;
  if (options && (value = options[key]) != null) {
    if (value >>> 0 !== value) throw new ERR_INVALID_ARG_VALUE(`options.${key}`, value);
    // Coerce -0 to +0.
    return value + 0;
  }
  return -1;
}
function createCipherBase(cipher, credential, options, isEncrypt, iv) {
  var authTagLength = getUIntOption(options, 'authTagLength');
  this[kHandle] = new CipherBase(isEncrypt, cipher, credential, iv, authTagLength);
  this._decoder = null;
  FunctionPrototypeCall(LazyTransform, this, options);
}
function createCipherWithIV(cipher, key, options, isEncrypt, iv) {
  validateString(cipher, 'cipher');
  var encoding = getStringOption(options, 'encoding');
  key = prepareSecretKey(key, encoding);
  iv = iv === null ? null : getArrayBufferOrView(iv, 'iv');
  FunctionPrototypeCall(createCipherBase, this, cipher, key, options, isEncrypt, iv);
}

// The Cipher class is part of the legacy Node.js crypto API. It exposes
// a stream-based encryption/decryption model. For backwards compatibility
// the Cipher class is defined using the legacy function syntax rather than
// ES6 classes.

function _transform(chunk, encoding, callback) {
  this.push(this[kHandle].update(chunk, encoding));
  callback();
}
;
function _flush(callback) {
  try {
    this.push(this[kHandle].final());
  } catch (e) {
    callback(e);
    return;
  }
  callback();
}
;
function update(data, inputEncoding, outputEncoding) {
  if (typeof data === 'string') {
    validateEncoding(data, inputEncoding);
  } else if (!isArrayBufferView(data)) {
    throw new ERR_INVALID_ARG_TYPE('data', ['string', 'Buffer', 'TypedArray', 'DataView'], data);
  }
  var ret = this[kHandle].update(data, inputEncoding);
  if (outputEncoding && outputEncoding !== 'buffer') {
    this._decoder = getDecoder(this._decoder, outputEncoding);
    return this._decoder.write(ret);
  }
  return ret;
}
;
function final(outputEncoding) {
  var ret = this[kHandle].final();
  if (outputEncoding && outputEncoding !== 'buffer') {
    this._decoder = getDecoder(this._decoder, outputEncoding);
    return this._decoder.end(ret);
  }
  return ret;
}
;
function setAutoPadding(ap) {
  if (!this[kHandle].setAutoPadding(!!ap)) throw new ERR_CRYPTO_INVALID_STATE('setAutoPadding');
  return this;
}
;
function getAuthTag() {
  var ret = this[kHandle].getAuthTag();
  if (ret === undefined) throw new ERR_CRYPTO_INVALID_STATE('getAuthTag');
  return ret;
}
;
function setAuthTag(tagbuf, encoding) {
  tagbuf = getArrayBufferOrView(tagbuf, 'buffer', encoding);
  if (!this[kHandle].setAuthTag(tagbuf)) throw new ERR_CRYPTO_INVALID_STATE('setAuthTag');
  return this;
}
function setAAD(aadbuf, options) {
  var encoding = getStringOption(options, 'encoding');
  var plaintextLength = getUIntOption(options, 'plaintextLength');
  aadbuf = getArrayBufferOrView(aadbuf, 'aadbuf', encoding);
  if (!this[kHandle].setAAD(aadbuf, plaintextLength)) throw new ERR_CRYPTO_INVALID_STATE('setAAD');
  return this;
}
;

// The Cipheriv class is part of the legacy Node.js crypto API. It exposes
// a stream-based encryption/decryption model. For backwards compatibility
// the Cipheriv class is defined using the legacy function syntax rather than
// ES6 classes.

function Cipheriv(cipher, key, iv, options) {
  if (!(this instanceof Cipheriv)) return new Cipheriv(cipher, key, iv, options);
  FunctionPrototypeCall(createCipherWithIV, this, cipher, key, options, true, iv);
}
function addCipherPrototypeFunctions(constructor) {
  constructor.prototype._transform = _transform;
  constructor.prototype._flush = _flush;
  constructor.prototype.update = update;
  constructor.prototype.final = final;
  constructor.prototype.setAutoPadding = setAutoPadding;
  if (constructor === Cipheriv) {
    constructor.prototype.getAuthTag = getAuthTag;
  } else {
    constructor.prototype.setAuthTag = setAuthTag;
  }
  constructor.prototype.setAAD = setAAD;
}
ObjectSetPrototypeOf(Cipheriv.prototype, LazyTransform.prototype);
ObjectSetPrototypeOf(Cipheriv, LazyTransform);
addCipherPrototypeFunctions(Cipheriv);

// The Decipheriv class is part of the legacy Node.js crypto API. It exposes
// a stream-based encryption/decryption model. For backwards compatibility
// the Decipheriv class is defined using the legacy function syntax rather than
// ES6 classes.
function Decipheriv(cipher, key, iv, options) {
  if (!(this instanceof Decipheriv)) return new Decipheriv(cipher, key, iv, options);
  FunctionPrototypeCall(createCipherWithIV, this, cipher, key, options, false, iv);
}
ObjectSetPrototypeOf(Decipheriv.prototype, LazyTransform.prototype);
ObjectSetPrototypeOf(Decipheriv, LazyTransform);
addCipherPrototypeFunctions(Decipheriv);
var kMinNid = 1;
var kMaxNid = 2_147_483_647;
function getCipherInfo(nameOrNid) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  validateObject(options, 'options');
  var {
    keyLength,
    ivLength
  } = options;
  if (keyLength !== undefined) {
    validateUint32(keyLength, 'options.keyLength');
    // Coerce -0 to +0.
    keyLength += 0;
  }
  if (ivLength !== undefined) {
    validateUint32(ivLength, 'options.ivLength');
    // Coerce -0 to +0.
    ivLength += 0;
  }
  var type = typeof nameOrNid;
  if (type === 'string') {
    if (nameOrNid.length === 0) return undefined;
    return _getCipherInfo(nameOrNid, keyLength, ivLength);
  } else if (type === 'number') {
    if (!NumberIsInteger(nameOrNid) || nameOrNid < kMinNid || nameOrNid > kMaxNid) {
      return undefined;
    }
    return _getCipherInfo(nameOrNid, keyLength, ivLength);
  }
  throw new ERR_INVALID_ARG_TYPE('nameOrNid', ['string', 'number'], nameOrNid);
}
module.exports = {
  Cipheriv,
  Decipheriv,
  privateDecrypt,
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
  getCipherInfo
};

