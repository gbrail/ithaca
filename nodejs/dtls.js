'use strict';

var {
  emitExperimentalWarning
} = require('internal/util');
emitExperimentalWarning('dtls');
var {
  connect,
  listen,
  DTLSEndpoint,
  DTLSSession
} = require('internal/dtls/dtls');
module.exports = {
  connect,
  listen,
  DTLSEndpoint,
  DTLSSession
};

