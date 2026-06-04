'use strict';

var {
  ArrayPrototypeSlice
} = primordials;
var {
  markBootstrapComplete,
  prepareTestRunnerMainExecution
} = require('internal/process/pre_execution');
var {
  isUsingInspector
} = require('internal/util/inspector');
var {
  run
} = require('internal/test_runner/runner');
var {
  parseCommandLine
} = require('internal/test_runner/utils');
var {
  exitCodes: {
    kGenericUserError
  }
} = internalBinding('errors');
var debug = require('internal/util/debuglog').debuglog('test_runner', fn => {
  debug = fn;
});
var options = parseCommandLine();
var isTestIsolationDisabled = options.isolation === 'none';
// We set initializeModules to false as we want to load user modules in the test runner run function
// if we are running with --test-isolation=none
prepareTestRunnerMainExecution(!isTestIsolationDisabled);
markBootstrapComplete();
if (isUsingInspector() && options.isolation === 'process') {
  process.emitWarning('Using the inspector with --test forces running at a concurrency of 1. ' + 'Use the inspectPort option to run with concurrency');
  options.concurrency = 1;
  options.inspectPort = process.debugPort;
}
options.globPatterns = ArrayPrototypeSlice(process.argv, 1);
debug('test runner configuration:', options);
run(options).on('test:summary', data => {
  if (!data.success) {
    process.exitCode = kGenericUserError;
  }
});

