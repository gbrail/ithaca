'use strict';

var {
  SecureContext,
  createSecureContext,
  translatePeerCertificate
} = require('internal/tls/common');
module.exports = {
  SecureContext,
  createSecureContext,
  translatePeerCertificate
};
process.emitWarning('The _tls_common module is deprecated. Use `node:tls` instead.', 'DeprecationWarning', 'DEP0192');

