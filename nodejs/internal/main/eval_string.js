'use strict';

// User passed `-e` or `--eval` arguments to Node without `-i` or
// `--interactive`.
var {
  ObjectDefineProperty,
  RegExpPrototypeExec,
  globalThis
} = primordials;
var {
  prepareMainThreadExecution,
  markBootstrapComplete
} = require('internal/process/pre_execution');
var {
  evalModuleEntryPoint,
  evalTypeScript,
  parseAndEvalCommonjsTypeScript,
  parseAndEvalModuleTypeScript,
  evalScript
} = require('internal/process/execution');
var {
  addBuiltinLibsToObject
} = require('internal/modules/helpers');
var {
  getOptionValue
} = require('internal/options');
prepareMainThreadExecution();
addBuiltinLibsToObject(globalThis, '<eval>');
markBootstrapComplete();
var code = getOptionValue('--eval');
var print = getOptionValue('--print');
var shouldLoadESM = getOptionValue('--import').length > 0 || getOptionValue('--experimental-loader').length > 0;
var inputType = getOptionValue('--input-type');
var tsEnabled = getOptionValue('--strip-types');
if (inputType === 'module') {
  evalModuleEntryPoint(code, print);
} else if (inputType === 'module-typescript' && tsEnabled) {
  parseAndEvalModuleTypeScript(code, print);
} else {
  // For backward compatibility, we want the identifier crypto to be the
  // `node:crypto` module rather than WebCrypto.
  var isUsingCryptoIdentifier = RegExpPrototypeExec(/\bcrypto\b/, code) !== null;
  var shouldDefineCrypto = isUsingCryptoIdentifier && internalBinding('config').hasOpenSSL;
  if (isUsingCryptoIdentifier && !shouldDefineCrypto) {
    // This is taken from `addBuiltinLibsToObject`.
    var object = globalThis;
    var name = 'crypto';
    var setReal = val => {
      // Deleting the property before re-assigning it disables the
      // getter/setter mechanism.
      delete object[name];
      object[name] = val;
    };
    ObjectDefineProperty(object, name, {
      __proto__: null,
      set: setReal
    });
  }
  var evalFunction;
  if (inputType === 'commonjs') {
    evalFunction = evalScript;
  } else if (inputType === 'commonjs-typescript' && tsEnabled) {
    evalFunction = parseAndEvalCommonjsTypeScript;
  } else if (tsEnabled) {
    evalFunction = evalTypeScript;
  } else {
    // Default to commonjs.
    evalFunction = evalScript;
  }
  evalFunction('[eval]', shouldDefineCrypto ? print ? `let crypto=require("node:crypto");{${code}}` : `(crypto=>{{${code}}})(require('node:crypto'))` : code, getOptionValue('--inspect-brk'), print, shouldLoadESM);
}

