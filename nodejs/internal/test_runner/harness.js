'use strict';

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var startSubtestAfterBootstrap = _async(function (subtest) {
  return _invoke(function () {
    if (subtest.root.harness.buildPromise) {
      return _invoke(function () {
        if (subtest.root.harness.bootstrapPromise) {
          return _await(subtest.root.harness.bootstrapPromise, function () {
            subtest.root.harness.bootstrapPromise = null;
          });
        }
      }, function () {
        if (subtest.buildSuite) {
          ArrayPrototypePush(subtest.root.harness.buildSuites, subtest.buildSuite);
        }
        if (!subtest.root.harness.isWaitingForBuildPhase) {
          subtest.root.harness.isWaitingForBuildPhase = true;
          queueMicrotask(() => {
            subtest.root.harness.waitForBuildPhase();
          });
        }
        return _await(subtest.root.harness.buildPromise, function () {
          subtest.root.harness.buildPromise = null;
        });
      });
    }
  }, function () {
    return _awaitIgnored(subtest.start());
  });
});
var {
  ArrayPrototypeForEach,
  ArrayPrototypePush,
  FunctionPrototypeBind,
  Promise,
  PromiseResolve,
  PromiseWithResolvers,
  SafeMap,
  SafePromiseAllReturnVoid
} = primordials;
var {
  getCallerLocation
} = internalBinding('util');
var {
  createHook,
  executionAsyncId
} = require('async_hooks');
var {
  relative
} = require('path');
var {
  codes: {
    ERR_TEST_FAILURE
  }
} = require('internal/errors');
var {
  exitCodes: {
    kGenericUserError
  }
} = internalBinding('errors');
var {
  kCancelledByParent,
  Test,
  Suite
} = require('internal/test_runner/test');
var {
  parseCommandLine,
  reporterScope,
  shouldColorizeTestFiles,
  setupGlobalSetupTeardownFunctions,
  parsePreviousRuns
} = require('internal/test_runner/utils');
var {
  PassThrough,
  compose
} = require('stream');
var {
  reportReruns
} = require('internal/test_runner/reporter/rerun');
var {
  queueMicrotask
} = require('internal/process/task_queues');
var {
  TIMEOUT_MAX
} = require('internal/timers');
var {
  clearInterval,
  setImmediate,
  setInterval
} = require('timers');
var {
  bigint: hrtime
} = process.hrtime;
var testResources = new SafeMap();
var globalRoot;
var globalSetupExecuted = false;
testResources.set(reporterScope.asyncId(), reporterScope);
function createTestTree(rootTestOptions, globalOptions) {
  var buildPhaseDeferred = PromiseWithResolvers();
  var isFilteringByName = globalOptions.testNamePatterns || globalOptions.testSkipPatterns;
  var isFilteringByOnly = globalOptions.isolation === 'process' || process.env.NODE_TEST_CONTEXT ? globalOptions.only : true;
  var isFilteringByTags = globalOptions.testTagFilters != null;
  var harness = {
    __proto__: null,
    buildPromise: buildPhaseDeferred.promise,
    buildSuites: [],
    isWaitingForBuildPhase: false,
    watching: false,
    config: globalOptions,
    coverage: null,
    resetCounters() {
      harness.counters = {
        __proto__: null,
        tests: 0,
        failed: 0,
        passed: 0,
        cancelled: 0,
        skipped: 0,
        todo: 0,
        topLevel: 0,
        suites: 0
      };
    },
    success: true,
    counters: null,
    shouldColorizeTestFiles: shouldColorizeTestFiles(globalOptions.destinations),
    teardown: null,
    snapshotManager: null,
    previousRuns: null,
    isFilteringByName,
    isFilteringByOnly,
    isFilteringByTags,
    runBootstrap: _async(function () {
      if (globalSetupExecuted) {
        return PromiseResolve();
      }
      globalSetupExecuted = true;
      return _await(setupGlobalSetupTeardownFunctions(globalOptions.globalSetupPath, globalOptions.cwd), function (globalSetupFunctions) {
        harness.globalTeardownFunction = globalSetupFunctions.globalTeardownFunction;
        return typeof globalSetupFunctions.globalSetupFunction === 'function' ? globalSetupFunctions.globalSetupFunction() : PromiseResolve();
      });
    }),
    waitForBuildPhase: _async(function () {
      return _invoke(function () {
        if (harness.buildSuites.length > 0) {
          return _awaitIgnored(SafePromiseAllReturnVoid(harness.buildSuites));
        }
      }, function () {
        buildPhaseDeferred.resolve();
      });
    })
  };
  harness.resetCounters();
  harness.bootstrapPromise = harness.runBootstrap();
  globalRoot = new Test(_objectSpread(_objectSpread({
    __proto__: null
  }, rootTestOptions), {}, {
    harness,
    name: '<root>'
  }));
  setupProcessState(globalRoot, globalOptions, harness);
  globalRoot.startTime = hrtime();
  return globalRoot;
}
function createProcessEventHandler(eventName, rootTest) {
  return err => {
    if (rootTest.harness.bootstrapPromise) {
      // Something went wrong during the asynchronous portion of bootstrapping
      // the test runner. Since the test runner is not setup properly, we can't
      // do anything but throw the error.
      throw err;
    }
    var test = testResources.get(executionAsyncId());

    // Check if this error is coming from a reporter. If it is, throw it.
    if (test === reporterScope) {
      throw err;
    }

    // Check if this error is coming from a test or test hook. If it is, fail the test.
    if (!test || test.finished || test.hookType) {
      // If the test is already finished or the resource that created the error
      // is not mapped to a Test, report this as a top level diagnostic.
      var msg;
      if (test) {
        var name = test.hookType ? `Test hook "${test.hookType}"` : `Test "${test.name}"`;
        var locInfo = '';
        if (test.loc) {
          var relPath = relative(rootTest.config.cwd, test.loc.file);
          locInfo = ` at ${relPath}:${test.loc.line}:${test.loc.column}`;
        }
        msg = `Error: ${name}${locInfo} generated asynchronous ` + 'activity after the test ended. This activity created the error ' + `"${err}" and would have caused the test to fail, but instead ` + `triggered an ${eventName} event.`;
      } else {
        msg = 'Error: A resource generated asynchronous activity after ' + `the test ended. This activity created the error "${err}" which ` + `triggered an ${eventName} event, caught by the test runner.`;
      }
      rootTest.diagnostic(msg);
      rootTest.harness.success = false;
      process.exitCode = kGenericUserError;
      return;
    }
    test.fail(new ERR_TEST_FAILURE(err, eventName));
    test.abortController.abort();
  };
}
function configureCoverage(rootTest, globalOptions) {
  if (!globalOptions.coverage) {
    return null;
  }
  var {
    setupCoverage
  } = require('internal/test_runner/coverage');
  try {
    return setupCoverage(globalOptions);
  } catch (err) {
    var msg = `Warning: Code coverage could not be enabled. ${err}`;
    rootTest.diagnostic(msg);
    rootTest.harness.success = false;
    process.exitCode = kGenericUserError;
  }
}
function collectCoverage(rootTest, coverage) {
  if (!coverage) {
    return null;
  }
  var summary = null;
  try {
    summary = coverage.summary();
  } catch (err) {
    rootTest.diagnostic(`Warning: Could not report code coverage. ${err}`);
    rootTest.harness.success = false;
    process.exitCode = kGenericUserError;
  }
  try {
    coverage.cleanup();
  } catch (err) {
    rootTest.diagnostic(`Warning: Could not clean up code coverage. ${err}`);
    rootTest.harness.success = false;
    process.exitCode = kGenericUserError;
  }
  return summary;
}
function setupFailureStateFile(rootTest, globalOptions) {
  if (!globalOptions.rerunFailuresFilePath) {
    return;
  }
  rootTest.harness.previousRuns = parsePreviousRuns(globalOptions.rerunFailuresFilePath);
  if (rootTest.harness.previousRuns === null) {
    rootTest.diagnostic(`Warning: The rerun failures file at ` + `${globalOptions.rerunFailuresFilePath} is not a valid rerun file. ` + 'The test runner will not be able to rerun failed tests.');
    rootTest.harness.success = false;
    process.exitCode = kGenericUserError;
    return;
  }
  if (!process.env.NODE_TEST_CONTEXT) {
    var reporter = reportReruns(rootTest.harness.previousRuns, globalOptions);
    compose(rootTest.reporter, reporter).pipe(new PassThrough());
  }
}
function setupProcessState(root, globalOptions) {
  var hook = createHook({
    __proto__: null,
    init(asyncId, type, triggerAsyncId, resource) {
      if (resource instanceof Test) {
        testResources.set(asyncId, resource);
        return;
      }
      var parent = testResources.get(triggerAsyncId);
      if (parent !== undefined) {
        testResources.set(asyncId, parent);
      }
    },
    destroy(asyncId) {
      testResources.delete(asyncId);
    }
  });
  hook.enable();
  var exceptionHandler = createProcessEventHandler('uncaughtException', root);
  var rejectionHandler = createProcessEventHandler('unhandledRejection', root);
  var coverage = configureCoverage(root, globalOptions);
  setupFailureStateFile(root, globalOptions);
  var exitHandler = _async(function (kill) {
    return _invoke(function () {
      if (root.subtests.length === 0 && (root.hooks.before.length > 0 || root.hooks.after.length > 0)) {
        // Run global before/after hooks in case there are no tests
        return _awaitIgnored(root.run());
      }
    }, function () {
      return _invoke(function () {
        if (kill !== true && root.subtestsPromise !== null) {
          // Wait for all subtests to finish, but keep the process alive in case
          // there are no ref'ed handles left.
          var keepAlive = setInterval(() => {}, TIMEOUT_MAX);
          return _await(root.subtestsPromise.promise, function () {
            clearInterval(keepAlive);
          });
        }
      }, function () {
        root.postRun(new ERR_TEST_FAILURE('Promise resolution is still pending but the event loop has already resolved', kCancelledByParent));
        return _invoke(function () {
          if (root.harness.globalTeardownFunction) {
            return _await(root.harness.globalTeardownFunction(), function () {
              root.harness.globalTeardownFunction = null;
            });
          }
        }, function () {
          hook.disable();
          process.removeListener('uncaughtException', exceptionHandler);
          process.removeListener('unhandledRejection', rejectionHandler);
          process.removeListener('beforeExit', exitHandler);
          if (globalOptions.isTestRunner) {
            process.removeListener('SIGINT', terminationHandler);
            process.removeListener('SIGTERM', terminationHandler);
          }
        });
      });
    });
  });
  var findRunningTests = function (test) {
    var running = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    if (test.startTime !== null && !test.finished) {
      for (var i = 0; i < test.subtests.length; i++) {
        findRunningTests(test.subtests[i], running);
      }
      // Only add leaf tests (innermost running tests)
      if (test.activeSubtests === 0 && test.name !== '<root>') {
        ArrayPrototypePush(running, {
          __proto__: null,
          name: test.name,
          nesting: test.nesting,
          file: test.loc?.file,
          line: test.loc?.line,
          column: test.loc?.column
        });
      }
    }
    return running;
  };
  var terminationHandler = _async(function () {
    var runningTests = findRunningTests(root);
    return _invoke(function () {
      if (runningTests.length > 0) {
        root.reporter.interrupted(runningTests);
        // Allow the reporter stream to process the interrupted event
        return _awaitIgnored(new Promise(resolve => setImmediate(resolve)));
      }
    }, function () {
      return _await(exitHandler(true), function () {
        process.exit();
      });
    });
  });
  process.on('uncaughtException', exceptionHandler);
  process.on('unhandledRejection', rejectionHandler);
  process.on('beforeExit', exitHandler);
  // TODO(MoLow): Make it configurable to hook when isTestRunner === false.
  if (globalOptions.isTestRunner) {
    process.on('SIGINT', terminationHandler);
    process.on('SIGTERM', terminationHandler);
  }
  root.harness.coverage = FunctionPrototypeBind(collectCoverage, null, root, coverage);
  root.harness.teardown = exitHandler;
}
function lazyBootstrapRoot() {
  if (!globalRoot) {
    // This is where the test runner is bootstrapped when node:test is used
    // without the --test flag or the run() API.
    var entryFile = process.argv?.[1];
    var rootTestOptions = {
      __proto__: null,
      entryFile,
      loc: entryFile ? [1, 1, entryFile] : undefined
    };
    var globalOptions = parseCommandLine();
    globalOptions.cwd = process.cwd();
    createTestTree(rootTestOptions, globalOptions);
    globalRoot.reporter.on('test:summary', data => {
      if (!data.success) {
        process.exitCode = kGenericUserError;
      }
    });
    globalRoot.harness.bootstrapPromise = SafePromiseAllReturnVoid([globalRoot.harness.bootstrapPromise, globalOptions.setup(globalRoot.reporter)]);
  }
  return globalRoot;
}
function runInParentContext(Factory) {
  function run(name, options, fn, overrides) {
    var parent = testResources.get(executionAsyncId()) || lazyBootstrapRoot();
    var subtest = parent.createSubtest(Factory, name, options, fn, overrides);
    if (parent instanceof Suite) {
      return PromiseResolve();
    }
    return startSubtestAfterBootstrap(subtest);
  }
  var test = (name, options, fn) => {
    var overrides = {
      __proto__: null,
      loc: getCallerLocation()
    };
    return run(name, options, fn, overrides);
  };
  ArrayPrototypeForEach(['expectFailure', 'skip', 'todo', 'only'], keyword => {
    test[keyword] = (name, options, fn) => {
      var overrides = {
        __proto__: null,
        [keyword]: true,
        loc: getCallerLocation()
      };
      return run(name, options, fn, overrides);
    };
  });
  return test;
}
function hook(hook) {
  return (fn, options) => {
    var parent = testResources.get(executionAsyncId()) || lazyBootstrapRoot();
    parent.createHook(hook, fn, _objectSpread(_objectSpread({
      __proto__: null
    }, options), {}, {
      parent,
      hookType: hook,
      loc: getCallerLocation()
    }));
  };
}
function getTestContext() {
  var test = testResources.get(executionAsyncId());
  // Exclude the reporter sentinel
  if (test === undefined || test === reporterScope) {
    return undefined;
  }
  return test.getCtx();
}
module.exports = {
  createTestTree,
  getTestContext,
  test: runInParentContext(Test),
  suite: runInParentContext(Suite),
  before: hook('before'),
  after: hook('after'),
  beforeEach: hook('beforeEach'),
  afterEach: hook('afterEach'),
  startSubtestAfterBootstrap
};

