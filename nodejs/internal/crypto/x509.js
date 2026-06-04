'use strict';

function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ObjectSetPrototypeOf,
  SafeMap,
  Symbol: _Symbol
} = primordials;
var {
  parseX509,
  X509_CHECK_FLAG_ALWAYS_CHECK_SUBJECT,
  X509_CHECK_FLAG_NEVER_CHECK_SUBJECT,
  X509_CHECK_FLAG_NO_WILDCARDS,
  X509_CHECK_FLAG_NO_PARTIAL_WILDCARDS,
  X509_CHECK_FLAG_MULTI_LABEL_WILDCARDS,
  X509_CHECK_FLAG_SINGLE_LABEL_SUBDOMAINS
} = internalBinding('crypto');
var {
  PublicKeyObject,
  getKeyObjectHandle,
  getKeyObjectType,
  isKeyObject
} = require('internal/crypto/keys');
var {
  customInspectSymbol: kInspect,
  kEmptyObject
} = require('internal/util');
var {
  validateBoolean,
  validateObject,
  validateString
} = require('internal/validators');
var {
  inspect
} = require('internal/util/inspect');
var {
  Buffer
} = require('buffer');
var {
  isArrayBufferView
} = require('internal/util/types');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE
  }
} = require('internal/errors');
var {
  markTransferMode,
  kClone,
  kDeserialize
} = require('internal/worker/js_transferable');
var {
  kHandle
} = require('internal/crypto/util');
var lazyTranslatePeerCertificate;
var kInternalState = _Symbol('kInternalState');
function isX509Certificate(value) {
  return value[kInternalState] !== undefined;
}
function getFlags() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  validateObject(options, 'options');
  var {
    subject = 'default',
    // Can be 'default', 'always', or 'never'
    wildcards = true,
    partialWildcards = true,
    multiLabelWildcards = false,
    singleLabelSubdomains = false
  } = _objectSpread({}, options);
  var flags = 0;
  validateString(subject, 'options.subject');
  validateBoolean(wildcards, 'options.wildcards');
  validateBoolean(partialWildcards, 'options.partialWildcards');
  validateBoolean(multiLabelWildcards, 'options.multiLabelWildcards');
  validateBoolean(singleLabelSubdomains, 'options.singleLabelSubdomains');
  switch (subject) {
    case 'default':
      /* Matches OpenSSL's default, no flags. */break;
    case 'always':
      flags |= X509_CHECK_FLAG_ALWAYS_CHECK_SUBJECT;
      break;
    case 'never':
      flags |= X509_CHECK_FLAG_NEVER_CHECK_SUBJECT;
      break;
    default:
      throw new ERR_INVALID_ARG_VALUE('options.subject', subject);
  }
  if (!wildcards) flags |= X509_CHECK_FLAG_NO_WILDCARDS;
  if (!partialWildcards) flags |= X509_CHECK_FLAG_NO_PARTIAL_WILDCARDS;
  if (multiLabelWildcards) flags |= X509_CHECK_FLAG_MULTI_LABEL_WILDCARDS;
  if (singleLabelSubdomains) flags |= X509_CHECK_FLAG_SINGLE_LABEL_SUBDOMAINS;
  return flags;
}
var InternalX509Certificate = /*#__PURE__*/_createClass(function InternalX509Certificate(handle) {
  _classCallCheck(this, InternalX509Certificate);
  _defineProperty(this, kInternalState, new SafeMap());
  markTransferMode(this, true, false);
  this[kHandle] = handle;
});
var X509Certificate = /*#__PURE__*/function () {
  function X509Certificate(buffer) {
    _classCallCheck(this, X509Certificate);
    _defineProperty(this, kInternalState, new SafeMap());
    if (typeof buffer === 'string') buffer = Buffer.from(buffer);
    if (!isArrayBufferView(buffer)) {
      throw new ERR_INVALID_ARG_TYPE('buffer', ['string', 'Buffer', 'TypedArray', 'DataView'], buffer);
    }
    markTransferMode(this, true, false);
    this[kHandle] = parseX509(buffer);
  }
  return _createClass(X509Certificate, [{
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `X509Certificate ${inspect({
        subject: this.subject,
        subjectAltName: this.subjectAltName,
        issuer: this.issuer,
        infoAccess: this.infoAccess,
        validFrom: this.validFrom,
        validTo: this.validTo,
        validFromDate: this.validFromDate,
        validToDate: this.validToDate,
        fingerprint: this.fingerprint,
        fingerprint256: this.fingerprint256,
        fingerprint512: this.fingerprint512,
        keyUsage: this.keyUsage,
        serialNumber: this.serialNumber,
        signatureAlgorithm: this.signatureAlgorithm,
        signatureAlgorithmOid: this.signatureAlgorithmOid
      }, opts)}`;
    }
  }, {
    key: kClone,
    value: function () {
      var handle = this[kHandle];
      return {
        data: {
          handle
        },
        deserializeInfo: 'internal/crypto/x509:InternalX509Certificate'
      };
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        handle
      } = _ref;
      this[kHandle] = handle;
    }
  }, {
    key: "subject",
    get: function () {
      var value = this[kInternalState].get('subject');
      if (value === undefined) {
        value = this[kHandle].subject();
        this[kInternalState].set('subject', value);
      }
      return value;
    }
  }, {
    key: "subjectAltName",
    get: function () {
      var value = this[kInternalState].get('subjectAltName');
      if (value === undefined) {
        value = this[kHandle].subjectAltName();
        this[kInternalState].set('subjectAltName', value);
      }
      return value;
    }
  }, {
    key: "issuer",
    get: function () {
      var value = this[kInternalState].get('issuer');
      if (value === undefined) {
        value = this[kHandle].issuer();
        this[kInternalState].set('issuer', value);
      }
      return value;
    }
  }, {
    key: "issuerCertificate",
    get: function () {
      var value = this[kInternalState].get('issuerCertificate');
      if (value === undefined) {
        var cert = this[kHandle].getIssuerCert();
        if (cert) value = new InternalX509Certificate(this[kHandle].getIssuerCert());
        this[kInternalState].set('issuerCertificate', value);
      }
      return value;
    }
  }, {
    key: "infoAccess",
    get: function () {
      var value = this[kInternalState].get('infoAccess');
      if (value === undefined) {
        value = this[kHandle].infoAccess();
        this[kInternalState].set('infoAccess', value);
      }
      return value;
    }
  }, {
    key: "validFrom",
    get: function () {
      var value = this[kInternalState].get('validFrom');
      if (value === undefined) {
        value = this[kHandle].validFrom();
        this[kInternalState].set('validFrom', value);
      }
      return value;
    }
  }, {
    key: "validTo",
    get: function () {
      var value = this[kInternalState].get('validTo');
      if (value === undefined) {
        value = this[kHandle].validTo();
        this[kInternalState].set('validTo', value);
      }
      return value;
    }
  }, {
    key: "validFromDate",
    get: function () {
      var value = this[kInternalState].get('validFromDate');
      if (value === undefined) {
        value = this[kHandle].validFromDate();
        this[kInternalState].set('validFromDate', value);
      }
      return value;
    }
  }, {
    key: "validToDate",
    get: function () {
      var value = this[kInternalState].get('validToDate');
      if (value === undefined) {
        value = this[kHandle].validToDate();
        this[kInternalState].set('validToDate', value);
      }
      return value;
    }
  }, {
    key: "fingerprint",
    get: function () {
      var value = this[kInternalState].get('fingerprint');
      if (value === undefined) {
        value = this[kHandle].fingerprint();
        this[kInternalState].set('fingerprint', value);
      }
      return value;
    }
  }, {
    key: "fingerprint256",
    get: function () {
      var value = this[kInternalState].get('fingerprint256');
      if (value === undefined) {
        value = this[kHandle].fingerprint256();
        this[kInternalState].set('fingerprint256', value);
      }
      return value;
    }
  }, {
    key: "fingerprint512",
    get: function () {
      var value = this[kInternalState].get('fingerprint512');
      if (value === undefined) {
        value = this[kHandle].fingerprint512();
        this[kInternalState].set('fingerprint512', value);
      }
      return value;
    }
  }, {
    key: "keyUsage",
    get: function () {
      var value = this[kInternalState].get('keyUsage');
      if (value === undefined) {
        value = this[kHandle].keyUsage();
        this[kInternalState].set('keyUsage', value);
      }
      return value;
    }
  }, {
    key: "serialNumber",
    get: function () {
      var value = this[kInternalState].get('serialNumber');
      if (value === undefined) {
        value = this[kHandle].serialNumber();
        this[kInternalState].set('serialNumber', value);
      }
      return value;
    }
  }, {
    key: "signatureAlgorithm",
    get: function () {
      var value = this[kInternalState].get('signatureAlgorithm');
      if (value === undefined) {
        value = this[kHandle].signatureAlgorithm();
        this[kInternalState].set('signatureAlgorithm', value);
      }
      return value;
    }
  }, {
    key: "signatureAlgorithmOid",
    get: function () {
      var value = this[kInternalState].get('signatureAlgorithmOid');
      if (value === undefined) {
        value = this[kHandle].signatureAlgorithmOid();
        this[kInternalState].set('signatureAlgorithmOid', value);
      }
      return value;
    }
  }, {
    key: "raw",
    get: function () {
      var value = this[kInternalState].get('raw');
      if (value === undefined) {
        value = this[kHandle].raw();
        this[kInternalState].set('raw', value);
      }
      return value;
    }
  }, {
    key: "publicKey",
    get: function () {
      var value = this[kInternalState].get('publicKey');
      if (value === undefined) {
        value = new PublicKeyObject(this[kHandle].publicKey());
        this[kInternalState].set('publicKey', value);
      }
      return value;
    }
  }, {
    key: "toString",
    value: function toString() {
      var value = this[kInternalState].get('pem');
      if (value === undefined) {
        value = this[kHandle].pem();
        this[kInternalState].set('pem', value);
      }
      return value;
    }

    // There's no standardized JSON encoding for X509 certs so we
    // fallback to providing the PEM encoding as a string.
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.toString();
    }
  }, {
    key: "ca",
    get: function () {
      var value = this[kInternalState].get('ca');
      if (value === undefined) {
        value = this[kHandle].checkCA();
        this[kInternalState].set('ca', value);
      }
      return value;
    }
  }, {
    key: "checkHost",
    value: function checkHost(name, options) {
      validateString(name, 'name');
      return this[kHandle].checkHost(name, getFlags(options));
    }
  }, {
    key: "checkEmail",
    value: function checkEmail(email, options) {
      validateString(email, 'email');
      return this[kHandle].checkEmail(email, getFlags(options));
    }
  }, {
    key: "checkIP",
    value: function checkIP(ip, options) {
      validateString(ip, 'ip');
      // The options argument is currently undocumented since none of the options
      // have any effect on the behavior of this function. However, we still parse
      // the options argument in case OpenSSL adds flags in the future that do
      // affect the behavior of X509_check_ip. This ensures that no invalid values
      // are passed as the second argument in the meantime.
      return this[kHandle].checkIP(ip, getFlags(options));
    }
  }, {
    key: "checkIssued",
    value: function checkIssued(otherCert) {
      if (!isX509Certificate(otherCert)) throw new ERR_INVALID_ARG_TYPE('otherCert', 'X509Certificate', otherCert);
      return this[kHandle].checkIssued(otherCert[kHandle]);
    }
  }, {
    key: "checkPrivateKey",
    value: function checkPrivateKey(pkey) {
      if (!isKeyObject(pkey)) throw new ERR_INVALID_ARG_TYPE('pkey', 'KeyObject', pkey);
      if (getKeyObjectType(pkey) !== 'private') throw new ERR_INVALID_ARG_VALUE('pkey', pkey);
      return this[kHandle].checkPrivateKey(getKeyObjectHandle(pkey));
    }
  }, {
    key: "verify",
    value: function verify(pkey) {
      if (!isKeyObject(pkey)) throw new ERR_INVALID_ARG_TYPE('pkey', 'KeyObject', pkey);
      if (getKeyObjectType(pkey) !== 'public') throw new ERR_INVALID_ARG_VALUE('pkey', pkey);
      return this[kHandle].verify(getKeyObjectHandle(pkey));
    }
  }, {
    key: "toLegacyObject",
    value: function toLegacyObject() {
      // TODO(tniessen): do not depend on translatePeerCertificate here, return
      // the correct legacy representation from the binding
      lazyTranslatePeerCertificate ??= require('internal/tls/common').translatePeerCertificate;
      return lazyTranslatePeerCertificate(this[kHandle].toLegacy());
    }
  }]);
}();
InternalX509Certificate.prototype.constructor = X509Certificate;
ObjectSetPrototypeOf(InternalX509Certificate.prototype, X509Certificate.prototype);
module.exports = {
  X509Certificate,
  InternalX509Certificate,
  isX509Certificate
};

