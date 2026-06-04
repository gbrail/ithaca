'use strict';

function _empty() {}
/**
 * @param {function(ModuleLoader):ModuleWrap|undefined} callback
 */
var asyncRunEntryPointWithESMLoader = _async(function (callback) {
  var cascadedLoader = require('internal/modules/esm/loader').getOrInitializeCascadedLoader();
  return _catch(function () {
    var userImports = getOptionValue('--import');
    return _invoke(function () {
      if (userImports.length > 0) {
        var parentURL = getCWDURL().href;
        return _continueIgnored(_forTo(userImports, function (i) {
          return _awaitIgnored(cascadedLoader.import(userImports[i], parentURL, kEmptyObject));
        }));
      } else {
        cascadedLoader.waitForAsyncLoaderHookInitialization();
      }
    }, function () {
      return _awaitIgnored(callback(cascadedLoader));
    });
  }, function (err) {
    if (hasUncaughtExceptionCaptureCallback()) {
      process._fatalException(err);
      return;
    }
    triggerUncaughtException(err, true /* fromPromise */);
  });
});
/**
 * This initializes the ESM loader and runs --import (if any) before executing the
 * callback to run the entry point.
 * If the callback intends to evaluate a ESM module as entry point, it should return
 * the corresponding ModuleWrap so that stalled TLA can be checked a process exit.
 * @param {function(ModuleLoader):ModuleWrap|undefined} callback
 * @returns {Promise}
 */
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
var {
  StringPrototypeEndsWith,
  globalThis
} = primordials;
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
var {
  getNearestParentPackageJSONType
} = internalBinding('modules');
var _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;
    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        var value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _forTo(array, body, check) {
  var i = -1,
    pact,
    reject;
  function _cycle(result) {
    try {
      while (++i < array.length && (!check || !check())) {
        result = body(i);
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
            return;
          }
        }
      }
      if (pact) {
        _settle(pact, 1, result);
      } else {
        pact = result;
      }
    } catch (e) {
      _settle(pact || (pact = new _Pact()), 2, e);
    }
  }
  _cycle();
  return pact;
}
var {
  getOptionValue
} = require('internal/options');
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
var path = require('path');
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var {
  pathToFileURL,
  URL
} = require('internal/url');
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
var {
  kEmptyObject,
  getCWDURL
} = require('internal/util');
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
var {
  hasUncaughtExceptionCaptureCallback
} = require('internal/process/execution');
var {
  triggerUncaughtException
} = internalBinding('errors');
var {
  privateSymbols: {
    entry_point_promise_private_symbol
  }
} = internalBinding('util');
/**
 * Get the absolute path to the main entry point.
 * @param {string} main - Entry point path
 * @returns {string|undefined}
 */
function resolveMainPath(main) {
  /** @type {string} */
  var mainPath;
  // Extension searching for the main entry point is supported for backward compatibility.
  // Module._findPath is monkey-patchable here.
  var {
    Module
  } = require('internal/modules/cjs/loader');
  mainPath = Module._findPath(path.resolve(main), null, true);
  if (!mainPath) {
    return;
  }
  var preserveSymlinksMain = getOptionValue('--preserve-symlinks-main');
  if (!preserveSymlinksMain) {
    var {
      toRealPath
    } = require('internal/modules/helpers');
    mainPath = toRealPath(mainPath);
  }
  return mainPath;
}

/**
 * Determine whether the main entry point should be loaded through the ESM Loader.
 * @param {string} mainPath - Absolute path to the main entry point
 * @returns {boolean}
 */
function shouldUseESMLoader(mainPath) {
  /**
   * @type {string[]} userLoaders A list of custom loaders registered by the user
   * (or an empty list when none have been registered).
   */
  var userLoaders = getOptionValue('--experimental-loader');
  /**
   * @type {string[]} userImports A list of preloaded modules registered by the user
   * (or an empty list when none have been registered).
   */
  var userImports = getOptionValue('--import');
  if (userLoaders.length > 0 || userImports.length > 0) {
    return true;
  }

  // Determine the module format of the entry point.
  if (mainPath && StringPrototypeEndsWith(mainPath, '.mjs')) {
    return true;
  }
  if (mainPath && StringPrototypeEndsWith(mainPath, '.wasm')) {
    return true;
  }
  if (!mainPath || StringPrototypeEndsWith(mainPath, '.cjs')) {
    return false;
  }
  if (getOptionValue('--strip-types')) {
    if (!mainPath || StringPrototypeEndsWith(mainPath, '.cts')) {
      return false;
    }
    // This will likely change in the future to start with commonjs loader by default
    if (mainPath && StringPrototypeEndsWith(mainPath, '.mts')) {
      return true;
    }
  }
  var type = getNearestParentPackageJSONType(mainPath);

  // No package.json or no `type` field.
  if (type === undefined || type === 'none') {
    return false;
  }
  return type === 'module';
}
function runEntryPointWithESMLoader(callback) {
  var promise = asyncRunEntryPointWithESMLoader(callback);
  // Register the promise - if by the time the event loop finishes running, this is
  // still unsettled, we'll search the graph from the entry point module and print
  // the location of any unsettled top-level await found.
  globalThis[entry_point_promise_private_symbol] = promise;
  return promise;
}

/**
 * Parse the CLI main entry point string and run it.
 * For backwards compatibility, we have to run a bunch of monkey-patchable code that belongs to the CJS loader (exposed
 * by `require('module')`) even when the entry point is ESM.
 * Because of backwards compatibility, this function is exposed publicly via `import { runMain } from 'node:module'`.
 * Because of module detection, this function will attempt to run ambiguous (no explicit extension, no
 * `package.json` type field) entry points as CommonJS first; under certain conditions, it will retry running as ESM.
 * @param {string} main - First positional CLI argument, such as `'entry.js'` from `node entry.js`
 */
function executeUserEntryPoint() {
  var main = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.argv[1];
  var useESMLoader;
  var resolvedMain;
  if (getOptionValue('--entry-url')) {
    useESMLoader = true;
  } else {
    resolvedMain = resolveMainPath(main);
    useESMLoader = shouldUseESMLoader(resolvedMain);
  }
  // Unless we know we should use the ESM loader to handle the entry point per the checks in `shouldUseESMLoader`, first
  // try to run the entry point via the CommonJS loader; and if that fails under certain conditions, retry as ESM.
  if (!useESMLoader) {
    var cjsLoader = require('internal/modules/cjs/loader');
    var {
      wrapModuleLoad
    } = cjsLoader;
    wrapModuleLoad(main, null, true);
  } else {
    var mainPath = resolvedMain || main;
    var mainURL = getOptionValue('--entry-url') ? new URL(mainPath, getCWDURL()) : pathToFileURL(mainPath);
    runEntryPointWithESMLoader(cascadedLoader => {
      // Note that if the graph contains unsettled TLA, this may never resolve
      // even after the event loop stops running.
      return cascadedLoader.import(mainURL, undefined, {
        __proto__: null
      }, undefined, true);
    });
  }
}
module.exports = {
  executeUserEntryPoint,
  runEntryPointWithESMLoader
};

