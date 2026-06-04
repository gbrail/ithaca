// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var {
  Array,
  ArrayIsArray,
  // eslint-disable-next-line no-restricted-syntax
  ArrayPrototypePush,
  JSONParse,
  ObjectDefineProperty,
  ObjectFreeze,
  StringFromCharCode
} = primordials;
var {
  ERR_TLS_CERT_ALTNAME_FORMAT,
  ERR_TLS_CERT_ALTNAME_INVALID,
  ERR_OUT_OF_RANGE,
  ERR_INVALID_ARG_VALUE,
  ERR_INVALID_ARG_TYPE
} = require('internal/errors').codes;
var {
  getBundledRootCertificates,
  getExtraCACertificates,
  getSystemCACertificates,
  resetRootCertStore,
  getUserRootCertificates,
  getSSLCiphers,
  startLoadingCertificatesOffThread
} = internalBinding('crypto');

// Start loading root certificates in a separate thread as early as possible
// once the tls module is loaded, so that by the time an actual TLS connection is
// made, the loading is done.
startLoadingCertificatesOffThread();
var internalUtil = require('internal/util');
internalUtil.assertCrypto();
var {
  isArrayBufferView,
  isUint8Array
} = require('internal/util/types');
var net = require('net');
var {
  getOptionValue
} = require('internal/options');
var {
  Buffer
} = require('buffer');
var {
  canonicalizeIP
} = internalBinding('cares_wrap');
var tlsCommon = require('internal/tls/common');
var tlsWrap = require('internal/tls/wrap');
var {
  validateString
} = require('internal/validators');
var {
  namespace: {
    addDeserializeCallback,
    addSerializeCallback,
    isBuildingSnapshot
  }
} = require('internal/v8/startup_snapshot');

// Allow {CLIENT_RENEG_LIMIT} client-initiated session renegotiations
// every {CLIENT_RENEG_WINDOW} seconds. An error event is emitted if more
// renegotiations are seen. The settings are applied to all remote client
// connections.
exports.CLIENT_RENEG_LIMIT = 3;
exports.CLIENT_RENEG_WINDOW = 600;
exports.DEFAULT_CIPHERS = getOptionValue('--tls-cipher-list');
exports.DEFAULT_ECDH_CURVE = 'auto';
if (getOptionValue('--tls-min-v1.0')) exports.DEFAULT_MIN_VERSION = 'TLSv1';else if (getOptionValue('--tls-min-v1.1')) exports.DEFAULT_MIN_VERSION = 'TLSv1.1';else if (getOptionValue('--tls-min-v1.2')) exports.DEFAULT_MIN_VERSION = 'TLSv1.2';else if (getOptionValue('--tls-min-v1.3')) exports.DEFAULT_MIN_VERSION = 'TLSv1.3';else exports.DEFAULT_MIN_VERSION = 'TLSv1.2';
if (getOptionValue('--tls-max-v1.3')) exports.DEFAULT_MAX_VERSION = 'TLSv1.3';else if (getOptionValue('--tls-max-v1.2')) exports.DEFAULT_MAX_VERSION = 'TLSv1.2';else exports.DEFAULT_MAX_VERSION = 'TLSv1.3'; // Will depend on node version.

exports.getCiphers = internalUtil.cachedResult(() => internalUtil.filterDuplicateStrings(getSSLCiphers(), true));
var bundledRootCertificates;
function cacheBundledRootCertificates() {
  bundledRootCertificates ||= ObjectFreeze(getBundledRootCertificates());
  return bundledRootCertificates;
}
ObjectDefineProperty(exports, 'rootCertificates', {
  __proto__: null,
  configurable: false,
  enumerable: true,
  get: cacheBundledRootCertificates
});
var extraCACertificates;
function cacheExtraCACertificates() {
  extraCACertificates ||= ObjectFreeze(getExtraCACertificates());
  return extraCACertificates;
}
var systemCACertificates;
function cacheSystemCACertificates() {
  systemCACertificates ||= ObjectFreeze(getSystemCACertificates());
  return systemCACertificates;
}
var defaultCACertificates;
var hasResetDefaultCACertificates = false;
function cacheDefaultCACertificates() {
  if (defaultCACertificates) {
    return defaultCACertificates;
  }
  if (hasResetDefaultCACertificates) {
    defaultCACertificates = getUserRootCertificates();
    ObjectFreeze(defaultCACertificates);
    return defaultCACertificates;
  }
  defaultCACertificates = [];
  if (!getOptionValue('--use-openssl-ca')) {
    var bundled = cacheBundledRootCertificates();
    for (var i = 0; i < bundled.length; ++i) {
      ArrayPrototypePush(defaultCACertificates, bundled[i]);
    }
    if (getOptionValue('--use-system-ca')) {
      var system = cacheSystemCACertificates();
      for (var _i = 0; _i < system.length; ++_i) {
        ArrayPrototypePush(defaultCACertificates, system[_i]);
      }
    }
  }
  if (process.env.NODE_EXTRA_CA_CERTS) {
    var extra = cacheExtraCACertificates();
    for (var _i2 = 0; _i2 < extra.length; ++_i2) {
      ArrayPrototypePush(defaultCACertificates, extra[_i2]);
    }
  }
  ObjectFreeze(defaultCACertificates);
  return defaultCACertificates;
}

// TODO(joyeecheung): support X509Certificate output?
function getCACertificates() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
  validateString(type, 'type');
  switch (type) {
    case 'default':
      return cacheDefaultCACertificates();
    case 'bundled':
      return cacheBundledRootCertificates();
    case 'system':
      return cacheSystemCACertificates();
    case 'extra':
      return cacheExtraCACertificates();
    default:
      throw new ERR_INVALID_ARG_VALUE('type', type);
  }
}
exports.getCACertificates = getCACertificates;
function setDefaultCACertificates(certs) {
  if (!ArrayIsArray(certs)) {
    throw new ERR_INVALID_ARG_TYPE('certs', 'Array', certs);
  }

  // Verify that all elements in the array are strings
  for (var i = 0; i < certs.length; i++) {
    if (typeof certs[i] !== 'string' && !isArrayBufferView(certs[i])) {
      throw new ERR_INVALID_ARG_TYPE(`certs[${i}]`, ['string', 'ArrayBufferView'], certs[i]);
    }
  }
  resetRootCertStore(certs);
  defaultCACertificates = undefined; // Reset the cached default certificates
  hasResetDefaultCACertificates = true;
}
exports.setDefaultCACertificates = setDefaultCACertificates;
if (isBuildingSnapshot()) {
  addSerializeCallback(() => {
    // Clear the cached certs so that they are reloaded at runtime.
    // Bundled certificates are immutable so they are spared.
    extraCACertificates = undefined;
    systemCACertificates = undefined;
    if (hasResetDefaultCACertificates) {
      defaultCACertificates = undefined;
    }
  });
  addDeserializeCallback(() => {
    // If the tls module is loaded during snapshotting, load the certificates from
    // various sources again at runtime so that by the time an actual TLS connection is
    // made, the loading is done. If the default CA certificates have been overridden, then
    // the serialized overriding certificates are likely to be used and pre-loading
    // from the sources would probably not yield any benefit, so skip it.
    if (!hasResetDefaultCACertificates) {
      startLoadingCertificatesOffThread();
    }
  });
}

// Convert protocols array into valid OpenSSL protocols list
// ("\x06spdy/2\x08http/1.1\x08http/1.0")
function convertProtocols(protocols) {
  var lens = new Array(protocols.length);
  var buff = Buffer.allocUnsafe(protocols.reduce((p, c, i) => {
    var len = Buffer.byteLength(c);
    if (len > 255) {
      throw new ERR_OUT_OF_RANGE('The byte length of the protocol at index ' + `${i} exceeds the maximum length.`, '<= 255', len, true);
    }
    lens[i] = len;
    return p + 1 + len;
  }, 0));
  var offset = 0;
  for (var i = 0, c = protocols.length; i < c; i++) {
    buff[offset++] = lens[i];
    buff.write(protocols[i], offset);
    offset += lens[i];
  }
  return buff;
}
exports.convertALPNProtocols = function convertALPNProtocols(protocols, out) {
  // If protocols is Array - translate it into buffer
  if (ArrayIsArray(protocols)) {
    out.ALPNProtocols = convertProtocols(protocols);
  } else if (isUint8Array(protocols)) {
    // Copy new buffer not to be modified by user.
    out.ALPNProtocols = Buffer.from(protocols);
  } else if (isArrayBufferView(protocols)) {
    out.ALPNProtocols = Buffer.from(protocols.buffer.slice(protocols.byteOffset, protocols.byteOffset + protocols.byteLength));
  }
};
function unfqdn(host) {
  return host.replace(/[.]$/, '');
}

// String#toLowerCase() is locale-sensitive so we use
// a conservative version that only lowercases A-Z.
function toLowerCase(c) {
  return StringFromCharCode(32 + c.charCodeAt(0));
}
function splitHost(host) {
  return unfqdn(host).replace(/[A-Z]/g, toLowerCase).split('.');
}
function check(hostParts, pattern, wildcards) {
  // Empty strings, null, undefined, etc. never match.
  if (!pattern) return false;
  var patternParts = splitHost(pattern);
  if (hostParts.length !== patternParts.length) return false;

  // Pattern has empty components, e.g. "bad..example.com".
  if (patternParts.includes('')) return false;

  // RFC 6125 allows IDNA U-labels (Unicode) in names but we have no
  // good way to detect their encoding or normalize them so we simply
  // reject them.  Control characters and blanks are rejected as well
  // because nothing good can come from accepting them.
  var isBad = s => /[^\u0021-\u007F]/u.test(s);
  if (patternParts.some(isBad)) return false;

  // Check host parts from right to left first.
  for (var i = hostParts.length - 1; i > 0; i -= 1) {
    if (hostParts[i] !== patternParts[i]) return false;
  }
  var hostSubdomain = hostParts[0];
  var patternSubdomain = patternParts[0];
  var patternSubdomainParts = patternSubdomain.split('*', 3);

  // Short-circuit when the subdomain does not contain a wildcard.
  // RFC 6125 does not allow wildcard substitution for components
  // containing IDNA A-labels (Punycode) so match those verbatim.
  if (patternSubdomainParts.length === 1 || patternSubdomain.includes('xn--')) return hostSubdomain === patternSubdomain;
  if (!wildcards) return false;

  // More than one wildcard is always wrong.
  if (patternSubdomainParts.length > 2) return false;

  // *.tld wildcards are not allowed.
  if (patternParts.length <= 2) return false;
  var {
    0: prefix,
    1: suffix
  } = patternSubdomainParts;
  if (prefix.length + suffix.length > hostSubdomain.length) return false;
  if (!hostSubdomain.startsWith(prefix)) return false;
  if (!hostSubdomain.endsWith(suffix)) return false;
  return true;
}

// This pattern is used to determine the length of escaped sequences within
// the subject alt names string. It allows any valid JSON string literal.
// This MUST match the JSON specification (ECMA-404 / RFC8259) exactly.
var jsonStringPattern =
// eslint-disable-next-line no-control-regex
/^"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/;
function splitEscapedAltNames(altNames) {
  var result = [];
  var currentToken = '';
  var offset = 0;
  while (offset !== altNames.length) {
    var nextSep = altNames.indexOf(',', offset);
    var nextQuote = altNames.indexOf('"', offset);
    if (nextQuote !== -1 && (nextSep === -1 || nextQuote < nextSep)) {
      // There is a quote character and there is no separator before the quote.
      currentToken += altNames.substring(offset, nextQuote);
      var match = jsonStringPattern.exec(altNames.substring(nextQuote));
      if (!match) {
        throw new ERR_TLS_CERT_ALTNAME_FORMAT();
      }
      currentToken += JSONParse(match[0]);
      offset = nextQuote + match[0].length;
    } else if (nextSep !== -1) {
      // There is a separator and no quote before it.
      currentToken += altNames.substring(offset, nextSep);
      result.push(currentToken);
      currentToken = '';
      offset = nextSep + 2;
    } else {
      currentToken += altNames.substring(offset);
      offset = altNames.length;
    }
  }
  result.push(currentToken);
  return result;
}
exports.checkServerIdentity = function checkServerIdentity(hostname, cert) {
  var subject = cert.subject;
  var altNames = cert.subjectaltname;
  var dnsNames = [];
  var ips = [];
  hostname = '' + hostname;
  if (altNames) {
    var splitAltNames = altNames.includes('"') ? splitEscapedAltNames(altNames) : altNames.split(', ');
    splitAltNames.forEach(name => {
      if (name.startsWith('DNS:')) {
        dnsNames.push(name.slice(4));
      } else if (name.startsWith('IP Address:')) {
        ips.push(canonicalizeIP(name.slice(11)));
      }
    });
  }
  var valid = false;
  var reason = 'Unknown reason';
  hostname = unfqdn(hostname); // Remove trailing dot for error messages.

  if (net.isIP(hostname)) {
    valid = ips.includes(canonicalizeIP(hostname));
    if (!valid) reason = `IP: ${hostname} is not in the cert's list: ` + ips.join(', ');
  } else if (dnsNames.length > 0 || subject?.CN) {
    var hostParts = splitHost(hostname);
    var wildcard = pattern => check(hostParts, pattern, true);
    if (dnsNames.length > 0) {
      valid = dnsNames.some(wildcard);
      if (!valid) reason = `Host: ${hostname}. is not in the cert's altnames: ${altNames}`;
    } else {
      // Match against Common Name only if no supported identifiers exist.
      var cn = subject.CN;
      if (ArrayIsArray(cn)) valid = cn.some(wildcard);else if (cn) valid = wildcard(cn);
      if (!valid) reason = `Host: ${hostname}. is not cert's CN: ${cn}`;
    }
  } else {
    reason = 'Cert does not contain a DNS name';
  }
  if (!valid) {
    return new ERR_TLS_CERT_ALTNAME_INVALID(reason, hostname, cert);
  }
};
exports.createSecureContext = tlsCommon.createSecureContext;
exports.SecureContext = tlsCommon.SecureContext;
exports.TLSSocket = tlsWrap.TLSSocket;
exports.Server = tlsWrap.Server;
exports.createServer = tlsWrap.createServer;
exports.connect = tlsWrap.connect;

