'use strict';

var {
  ArrayPrototypePush,
  ObjectFreeze
} = primordials;
var permission = internalBinding('permission');
var {
  validateString,
  validateBuffer
} = require('internal/validators');
var {
  Buffer
} = require('buffer');
var {
  isBuffer
} = Buffer;
var _permission;
var _audit;
var _ffi;
module.exports = ObjectFreeze({
  __proto__: null,
  isEnabled() {
    if (_permission === undefined) {
      var {
        getOptionValue
      } = require('internal/options');
      _permission = getOptionValue('--permission') || getOptionValue('--permission-audit');
    }
    return _permission;
  },
  isAuditMode() {
    if (_audit === undefined) {
      var {
        getOptionValue
      } = require('internal/options');
      _audit = getOptionValue('--permission-audit');
    }
    return _audit;
  },
  has(scope, reference) {
    validateString(scope, 'scope');
    if (reference != null) {
      // TODO: add support for WHATWG URLs and Uint8Arrays.
      if (isBuffer(reference)) {
        validateBuffer(reference, 'reference');
      } else {
        validateString(reference, 'reference');
      }
    }
    return permission.has(scope, reference);
  },
  drop(scope, reference) {
    validateString(scope, 'scope');
    if (reference != null) {
      if (isBuffer(reference)) {
        validateBuffer(reference, 'reference');
      } else {
        validateString(reference, 'reference');
      }
    }
    permission.drop(scope, reference);
  },
  availableFlags() {
    if (_ffi === undefined) {
      var {
        getOptionValue
      } = require('internal/options');
      _ffi = getOptionValue('--experimental-ffi');
    }
    var flags = ['--allow-fs-read', '--allow-fs-write', '--allow-addons', '--allow-child-process', '--allow-net', '--allow-inspector', '--allow-wasi', '--allow-worker'];
    if (_ffi) {
      ArrayPrototypePush(flags, '--allow-ffi');
    }
    return flags;
  }
});

