'use strict';

var {
  FunctionPrototypeBind,
  Symbol
} = primordials;
var {
  codes: {
    ERR_SOCKET_BAD_TYPE
  }
} = require('internal/errors');
var {
  UDP
} = internalBinding('udp_wrap');
var {
  guessHandleType
} = require('internal/util');
var {
  isInt32,
  validateFunction
} = require('internal/validators');
var {
  UV_EINVAL
} = internalBinding('uv');
var kStateSymbol = Symbol('state symbol');
var dns; // Lazy load for startup performance.

function lookup4(lookup, address, callback) {
  return lookup(address || '127.0.0.1', 4, callback);
}
function lookup6(lookup, address, callback) {
  return lookup(address || '::1', 6, callback);
}
function newHandle(type, lookup) {
  if (lookup === undefined) {
    if (dns === undefined) {
      dns = require('dns');
    }
    lookup = dns.lookup;
  } else {
    validateFunction(lookup, 'lookup');
  }
  if (type === 'udp4') {
    var handle = new UDP();
    handle.lookup = FunctionPrototypeBind(lookup4, handle, lookup);
    return handle;
  }
  if (type === 'udp6') {
    var _handle = new UDP();
    _handle.lookup = FunctionPrototypeBind(lookup6, _handle, lookup);
    _handle.bind = _handle.bind6;
    _handle.connect = _handle.connect6;
    _handle.send = _handle.send6;
    return _handle;
  }
  throw new ERR_SOCKET_BAD_TYPE();
}
function _createSocketHandle(address, port, addressType, fd, flags) {
  var handle = newHandle(addressType);
  var err;
  if (isInt32(fd) && fd > 0) {
    var type = guessHandleType(fd);
    if (type !== 'UDP') {
      err = UV_EINVAL;
    } else {
      err = handle.open(fd);
    }
  } else if (port || address) {
    err = handle.bind(address, port || 0, flags);
  }
  if (err) {
    handle.close();
    return err;
  }
  return handle;
}
module.exports = {
  kStateSymbol,
  _createSocketHandle,
  newHandle
};

