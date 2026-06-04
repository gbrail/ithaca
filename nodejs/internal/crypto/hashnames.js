'use strict';

var {
  ObjectKeys
} = primordials;
var kHashContextNode = 1;
var kHashContextWebCrypto = 2;
var kHashContextJwkRsa = 3;
var kHashContextJwkRsaPss = 4;
var kHashContextJwkRsaOaep = 5;
var kHashContextJwkHmac = 6;

// WebCrypto and JWK use a bunch of different names for the
// standard set of SHA-* digest algorithms... which is ... fun.
// Here we provide a utility for mapping between them in order
// make it easier in the code.

var kHashNames = {
  'sha1': {
    [kHashContextNode]: 'sha1',
    [kHashContextWebCrypto]: 'SHA-1',
    [kHashContextJwkRsa]: 'RS1',
    [kHashContextJwkRsaPss]: 'PS1',
    [kHashContextJwkRsaOaep]: 'RSA-OAEP',
    [kHashContextJwkHmac]: 'HS1'
  },
  'sha256': {
    [kHashContextNode]: 'sha256',
    [kHashContextWebCrypto]: 'SHA-256',
    [kHashContextJwkRsa]: 'RS256',
    [kHashContextJwkRsaPss]: 'PS256',
    [kHashContextJwkRsaOaep]: 'RSA-OAEP-256',
    [kHashContextJwkHmac]: 'HS256'
  },
  'sha384': {
    [kHashContextNode]: 'sha384',
    [kHashContextWebCrypto]: 'SHA-384',
    [kHashContextJwkRsa]: 'RS384',
    [kHashContextJwkRsaPss]: 'PS384',
    [kHashContextJwkRsaOaep]: 'RSA-OAEP-384',
    [kHashContextJwkHmac]: 'HS384'
  },
  'sha512': {
    [kHashContextNode]: 'sha512',
    [kHashContextWebCrypto]: 'SHA-512',
    [kHashContextJwkRsa]: 'RS512',
    [kHashContextJwkRsaPss]: 'PS512',
    [kHashContextJwkRsaOaep]: 'RSA-OAEP-512',
    [kHashContextJwkHmac]: 'HS512'
  },
  'shake128': {
    [kHashContextNode]: 'shake128',
    [kHashContextWebCrypto]: 'cSHAKE128'
  },
  'shake256': {
    [kHashContextNode]: 'shake256',
    [kHashContextWebCrypto]: 'cSHAKE256'
  },
  'sha3-256': {
    [kHashContextNode]: 'sha3-256',
    [kHashContextWebCrypto]: 'SHA3-256'
  },
  'sha3-384': {
    [kHashContextNode]: 'sha3-384',
    [kHashContextWebCrypto]: 'SHA3-384'
  },
  'sha3-512': {
    [kHashContextNode]: 'sha3-512',
    [kHashContextWebCrypto]: 'SHA3-512'
  }
};
{
  // Index the aliases
  var keys = ObjectKeys(kHashNames);
  for (var n = 0; n < keys.length; n++) {
    var contexts = ObjectKeys(kHashNames[keys[n]]);
    for (var i = 0; i < contexts.length; i++) {
      var alias = kHashNames[keys[n]][contexts[i]];
      if (kHashNames[alias] === undefined) kHashNames[alias] = kHashNames[keys[n]];
    }
  }
}
function normalizeHashName(name) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kHashContextNode;
  return kHashNames[name]?.[context];
}
normalizeHashName.kContextNode = kHashContextNode;
normalizeHashName.kContextWebCrypto = kHashContextWebCrypto;
normalizeHashName.kContextJwkRsa = kHashContextJwkRsa;
normalizeHashName.kContextJwkRsaPss = kHashContextJwkRsaPss;
normalizeHashName.kContextJwkRsaOaep = kHashContextJwkRsaOaep;
normalizeHashName.kContextJwkHmac = kHashContextJwkHmac;
module.exports = normalizeHashName;

