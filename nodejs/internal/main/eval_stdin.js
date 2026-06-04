'use strict';

// Stdin is not a TTY, we will read it and execute it.
var {
  prepareMainThreadExecution,
  markBootstrapComplete
} = require('internal/process/pre_execution');
var {
  getOptionValue
} = require('internal/options');
var {
  evalModuleEntryPoint,
  evalTypeScript,
  parseAndEvalCommonjsTypeScript,
  parseAndEvalModuleTypeScript,
  evalScript,
  readStdin
} = require('internal/process/execution');
prepareMainThreadExecution();
markBootstrapComplete();
readStdin(code => {
  // This is necessary for fork() and CJS module compilation.
  // TODO(joyeecheung): pass this with something really internal.
  process._eval = code;
  var print = getOptionValue('--print');
  var shouldLoadESM = getOptionValue('--import').length > 0;
  var inputType = getOptionValue('--input-type');
  var tsEnabled = getOptionValue('--strip-types');
  if (inputType === 'module') {
    evalModuleEntryPoint(code, print);
  } else if (inputType === 'module-typescript' && tsEnabled) {
    parseAndEvalModuleTypeScript(code, print);
  } else {
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
    evalFunction('[stdin]', code, getOptionValue('--inspect-brk'), print, shouldLoadESM);
  }
});

