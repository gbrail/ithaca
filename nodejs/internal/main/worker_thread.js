'use strict';

// In worker threads, execute the script sent through the
// message port.
var {
  ArrayPrototypeForEach,
  ArrayPrototypePushApply,
  ArrayPrototypeSplice,
  AtomicsLoad,
  ObjectDefineProperty,
  PromisePrototypeThen,
  RegExpPrototypeExec
} = primordials;
var {
  prepareWorkerThreadExecution,
  initializeModuleLoaders,
  markBootstrapComplete
} = require('internal/process/pre_execution');
var {
  threadId,
  getEnvMessagePort
} = internalBinding('worker');
var workerIo = require('internal/worker/io');
var {
  messageTypes: {
    // Messages that may be received by workers
    LOAD_SCRIPT,
    // Messages that may be posted from workers
    UP_AND_RUNNING,
    ERROR_MESSAGE,
    COULD_NOT_SERIALIZE_ERROR,
    // Messages that may be either received or posted
    STDIO_PAYLOAD,
    STDIO_WANTS_MORE_DATA
  },
  kStdioWantsMoreDataCallback
} = workerIo;
var {
  setupMainThreadPort
} = require('internal/worker/messaging');
var {
  onGlobalUncaughtException,
  evalScript,
  evalTypeScript,
  evalModuleEntryPoint,
  parseAndEvalCommonjsTypeScript,
  parseAndEvalModuleTypeScript
} = require('internal/process/execution');
var debug = require('internal/util/debuglog').debuglog('worker', fn => {
  debug = fn;
});
var assert = require('internal/assert');
var {
  getOptionValue
} = require('internal/options');
var {
  exitCodes: {
    kGenericUserError
  }
} = internalBinding('errors');
prepareWorkerThreadExecution();
debug(`[${threadId}] is setting up worker child environment`);

// Set up the message port and start listening
var port = getEnvMessagePort();

// If the main thread is spawned with env NODE_CHANNEL_FD, it's probably
// spawned by our child_process module. In the work threads, mark the
// related IPC properties as unavailable.
if (process.env.NODE_CHANNEL_FD) {
  var workerThreadSetup = require('internal/process/worker_thread_only');
  ObjectDefineProperty(process, 'channel', {
    __proto__: null,
    enumerable: false,
    get: workerThreadSetup.unavailable('process.channel')
  });
  ObjectDefineProperty(process, 'connected', {
    __proto__: null,
    enumerable: false,
    get: workerThreadSetup.unavailable('process.connected')
  });
  process.send = workerThreadSetup.unavailable('process.send()');
  process.disconnect = workerThreadSetup.unavailable('process.disconnect()');
}
port.on('message', message => {
  if (message.type === LOAD_SCRIPT) {
    port.unref();
    var {
      argv,
      cwdCounter,
      doEval,
      environmentData,
      filename,
      hasStdin,
      publicPort,
      workerData,
      mainThreadPort
    } = message;
    if (doEval !== 'internal') {
      if (argv !== undefined) {
        ArrayPrototypePushApply(process.argv, argv);
      }
      var publicWorker = require('worker_threads');
      publicWorker.parentPort = publicPort;
      publicWorker.workerData = workerData;
    }
    require('internal/worker').assignEnvironmentData(environmentData);
    setupMainThreadPort(mainThreadPort);

    // The counter is only passed to the workers created by the main thread,
    // not to workers created by other workers.
    var cachedCwd = '';
    var lastCounter = -1;
    var originalCwd = process.cwd;
    process.cwd = function () {
      var currentCounter = AtomicsLoad(cwdCounter, 0);
      if (currentCounter === lastCounter) return cachedCwd;
      lastCounter = currentCounter;
      cachedCwd = originalCwd();
      return cachedCwd;
    };
    workerIo.sharedCwdCounter = cwdCounter;
    var isLoaderHookWorker = filename === 'internal/modules/esm/worker' && doEval === 'internal';
    if (!isLoaderHookWorker) {
      // If we are in the loader hook worker, delay the module loader initializations until
      // initializeAsyncLoaderHooksOnLoaderHookWorker() which needs to run preloads
      // after the asynchronous loader hooks are registered.
      initializeModuleLoaders({
        shouldSpawnLoaderHookWorker: true,
        shouldPreloadModules: true
      });
    }
    if (!hasStdin) process.stdin.push(null);
    debug(`[${threadId}] starts worker script ${filename} ` + `(eval = ${doEval}) at cwd = ${process.cwd()}`);
    port.postMessage({
      type: UP_AND_RUNNING
    });
    switch (doEval) {
      case 'internal':
        {
          // Currently the only user of internal eval is the async loader hook thread.
          assert(isLoaderHookWorker, `Unexpected internal eval ${filename}`);
          var setupModuleWorker = require('internal/modules/esm/worker');
          setupModuleWorker(workerData, publicPort);
          break;
        }
      case 'classic':
        if (getOptionValue('--input-type') !== 'module') {
          var name = '[worker eval]';
          // This is necessary for CJS module compilation.
          // TODO: pass this with something really internal.
          ObjectDefineProperty(process, '_eval', {
            __proto__: null,
            configurable: true,
            enumerable: true,
            value: filename
          });
          ArrayPrototypeSplice(process.argv, 1, 0, name);
          var tsEnabled = getOptionValue('--strip-types');
          var inputType = getOptionValue('--input-type');
          if (inputType === 'module-typescript' && tsEnabled) {
            // This is a special case where we want to parse and eval the
            // TypeScript code as a module
            parseAndEvalModuleTypeScript(filename, false);
            break;
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
          evalFunction(name, filename);
          break;
        }

      // eslint-disable-next-line no-fallthrough
      case 'module':
        {
          PromisePrototypeThen(evalModuleEntryPoint(filename), undefined, e => {
            workerOnGlobalUncaughtException(e, true);
          });
          break;
        }
      case 'data-url':
        {
          var {
            runEntryPointWithESMLoader
          } = require('internal/modules/run_main');
          RegExpPrototypeExec(/^/, ''); // Necessary to reset RegExp statics before user code runs.
          var promise = runEntryPointWithESMLoader(cascadedLoader => {
            return cascadedLoader.import(filename, undefined, {
              __proto__: null
            }, undefined, true);
          });
          PromisePrototypeThen(promise, undefined, e => {
            workerOnGlobalUncaughtException(e, true);
          });
          break;
        }
      default:
        {
          // script filename
          // runMain here might be monkey-patched by users in --require.
          // XXX: the monkey-patchability here should probably be deprecated.
          ArrayPrototypeSplice(process.argv, 1, 0, filename);
          var CJSLoader = require('internal/modules/cjs/loader');
          CJSLoader.Module.runMain(filename);
          break;
        }
    }
  } else if (message.type === STDIO_PAYLOAD) {
    var {
      stream,
      chunks
    } = message;
    ArrayPrototypeForEach(chunks, _ref => {
      var {
        chunk,
        encoding
      } = _ref;
      process[stream].push(chunk, encoding);
    });
  } else {
    assert(message.type === STDIO_WANTS_MORE_DATA, `Unknown worker message type ${message.type}`);
    var {
      stream: _stream
    } = message;
    process[_stream][kStdioWantsMoreDataCallback]();
  }
});
function workerOnGlobalUncaughtException(error, fromPromise) {
  debug(`[${threadId}] gets uncaught exception`);
  var handled = false;
  var handlerThrew = false;
  try {
    handled = onGlobalUncaughtException(error, fromPromise);
  } catch (e) {
    error = e;
    handlerThrew = true;
  }
  debug(`[${threadId}] uncaught exception handled = ${handled}`);
  if (handled) {
    return true;
  }
  if (!process._exiting) {
    try {
      process._exiting = true;
      process.exitCode = kGenericUserError;
      if (!handlerThrew) {
        process.emit('exit', process.exitCode);
      }
    } catch {
      // Continue regardless of error.
    }
  }
  var serialized;
  try {
    var {
      serializeError
    } = require('internal/error_serdes');
    serialized = serializeError(error);
  } catch {
    // Continue regardless of error.
  }
  debug(`[${threadId}] uncaught exception serialized = ${!!serialized}`);
  if (serialized) port.postMessage({
    type: ERROR_MESSAGE,
    error: serialized
  });else port.postMessage({
    type: COULD_NOT_SERIALIZE_ERROR
  });
  var {
    clearAsyncIdStack
  } = require('internal/async_hooks');
  clearAsyncIdStack();
  process.exit();
}

// Patch the global uncaught exception handler so it gets picked up by
// node::errors::TriggerUncaughtException().
process._fatalException = workerOnGlobalUncaughtException;
markBootstrapComplete();

// Necessary to reset RegExp statics before user code runs.
RegExpPrototypeExec(/^/, '');
port.start();

