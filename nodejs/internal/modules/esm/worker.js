'use strict';

function _empty() {}
/**
 * Initializes the loader hooks worker thread with customized asynchronous module loading hooks.
 * @param {SharedArrayBuffer} lock - The lock used to synchronize communication between the worker and the main thread.
 * @param {MessagePort} syncCommPort - The message port used for synchronous communication between the worker and the
 *   main thread.
 * @param {(err: Error, origin?: string) => void} errorHandler - The function to use for uncaught exceptions.
 * @returns {Promise<void>} A promise that resolves when the worker thread has been initialized.
 */
var customizedModuleWorker = _async(function (lock, syncCommPort, errorHandler) {
  var asyncLoaderHooks;
  var initializationError;
  var hasInitializationError = false;
  {
    // If a custom hook is calling `process.exit`, we should wake up the main thread
    // so it can detect the exit event.
    var {
      exit
    } = process;
    process.exit = function (code) {
      syncCommPort.postMessage(wrapMessage('exit', code ?? process.exitCode));
      AtomicsAdd(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION, 1);
      AtomicsNotify(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION);
      return ReflectApply(exit, this, arguments);
    };
  }
  return _continue(_catch(function () {
    return _call(initializeAsyncLoaderHooksOnLoaderHookWorker, function (_initializeAsyncLoade) {
      asyncLoaderHooks = _initializeAsyncLoade;
    });
  }, function (exception) {
    // If there was an error while parsing and executing a user loader, for example if because a
    // loader contained a syntax error, then we need to send the error to the main thread so it can
    // be thrown and printed.
    hasInitializationError = true;
    initializationError = exception;
  }), function () {
    /**
     * Handles incoming messages from the main thread or other workers.
     * @param {object} options - The options object.
     * @param {string} options.method - The name of the hook.
     * @param {Array} options.args - The arguments to pass to the method.
     * @param {MessagePort} options.port - The message port to use for communication.
     */
    var handleMessage = _async(function (_ref) {
      var {
        method,
        args,
        port
      } = _ref;
      // Each potential exception needs to be caught individually so that the correct error is sent to
      // the main thread.
      var hasError = false;
      var shouldRemoveGlobalErrorHandler = false;
      assert(typeof asyncLoaderHooks[method] === 'function', `${method} is not implemented in the loader worker`);
      if (port == null && !hasUncaughtExceptionCaptureCallback()) {
        // When receiving sync messages, we want to unlock the main thread when there's an exception.
        process.on('uncaughtException', errorHandler);
        shouldRemoveGlobalErrorHandler = true;
      }

      // We are about to yield the execution with `await ReflectApply` below. In case the code
      // following the `await` never runs, we remove the message handler so the `beforeExit` event
      // can be triggered.
      syncCommPort.off('message', handleMessage);

      // We keep checking for new messages to not miss any.
      clearImmediate(immediate);
      immediate = setImmediate(checkForMessages).unref();
      unsettledResponsePorts.add(port ?? syncCommPort);
      var response;
      return _continue(_catch(function () {
        return _await(ReflectApply(asyncLoaderHooks[method], asyncLoaderHooks, args), function (_ReflectApply) {
          response = _ReflectApply;
        });
      }, function (exception) {
        hasError = true;
        response = exception;
      }), function () {
        unsettledResponsePorts.delete(port ?? syncCommPort);

        // Send the method response (or exception) to the main thread.
        // We keep checking for new messages to not miss any.
        // To prevent the main thread from terminating before this function completes after unlocking,
        // the following process is executed at the end of the function.
        try {
          (port ?? syncCommPort).postMessage(wrapMessage(hasError ? 'error' : 'success', response), transferArrayBuffer(hasError, response?.source));
        } catch (exception) {
          // Or send the exception thrown when trying to send the response.
          (port ?? syncCommPort).postMessage(wrapMessage('error', exception));
        }
        if (shouldRemoveGlobalErrorHandler) {
          process.off('uncaughtException', errorHandler);
        }
        syncCommPort.off('message', handleMessage);
        clearImmediate(immediate);
        immediate = setImmediate(checkForMessages).unref();
        AtomicsAdd(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION, 1);
        AtomicsNotify(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION);
      });
    });
    syncCommPort.on('message', handleMessage);
    if (hasInitializationError) {
      syncCommPort.postMessage(wrapMessage('error', initializationError));
    } else {
      syncCommPort.postMessage(wrapMessage('success'));
    }

    // We're ready, so unlock the main thread.
    /**
     * Checks for messages on the syncCommPort and handles them asynchronously.
     */
    AtomicsAdd(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION, 1);
    AtomicsNotify(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION);
    function checkForMessages() {
      immediate = setImmediate(checkForMessages).unref();
      // We need to let the event loop tick a few times to give the main thread a chance to send
      // follow-up messages.
      var response = receiveMessageOnPort(syncCommPort);
      if (response !== undefined) {
        PromisePrototypeThen(handleMessage(response.message), undefined, errorHandler);
      }
    }
    var immediate;
    var unsettledResponsePorts = new SafeSet();
    process.on('beforeExit', () => {
      for (var port of unsettledResponsePorts) {
        port.postMessage(wrapMessage('never-settle'));
      }
      unsettledResponsePorts.clear();
      AtomicsAdd(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION, 1);
      AtomicsNotify(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION);

      // Attach back the event handler.
      syncCommPort.on('message', handleMessage);
      // Also check synchronously for a message, in case it's already there.
      clearImmediate(immediate);
      checkForMessages();
      // We don't need the sync check after this tick, as we already have added the event handler.
      clearImmediate(immediate);
      // Add some work for next tick so the worker cannot exit.
      setImmediate(() => {});
    });
  });
});
/**
 * Initializes a worker thread for a module with customized hooks.
 * ! Run everything possible within this function so errors get reported.
 * @param {{lock: SharedArrayBuffer}} workerData - The lock used to synchronize with the main thread.
 * @param {MessagePort} syncCommPort - The communication port used to communicate with the main thread.
 * @returns {object}
 */
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
/**
 * Register asynchronous module loader customization hooks. This should only be run in the loader
 * hooks worker. In a non-loader-hooks thread, if any asynchronous loader hook is registered, the
 * ModuleLoader#asyncLoaderHooks are initialized to be AsyncLoaderHooksProxiedToLoaderHookWorker
 * which posts the messages to the async loader hook worker thread.
 * When no asynchronous loader hook is registered, the loader hook worker is not spawned and module
 * loading is entiredly done in-thread.
 * @returns {Promise<AsyncLoaderHooksOnLoaderHookWorker>}
 */
var initializeAsyncLoaderHooksOnLoaderHookWorker = _async(function () {
  var customLoaderURLs = getOptionValue('--experimental-loader');

  // The worker thread spawned for handling asynchronous loader hooks should not
  // further spawn other hook threads or there will be an infinite recursion.
  var shouldSpawnLoaderHookWorker = false;
  // The worker thread for async loader hooks will preload user modules itself in
  // initializeAsyncLoaderHooksOnLoaderHookWorker().
  var shouldPreloadModules = false;
  initializeModuleLoaders({
    shouldSpawnLoaderHookWorker,
    shouldPreloadModules
  });
  assert(!isCascadedLoaderInitialized(), 'ModuleLoader should be initialized in initializeAsyncLoaderHooksOnLoaderHookWorker()');
  var asyncLoaderHooks = new AsyncLoaderHooksOnLoaderHookWorker();
  getOrInitializeCascadedLoader(asyncLoaderHooks);

  // We need the async loader hooks to be set _before_ we start invoking
  // `--require`, otherwise loops can happen because a `--require` script
  // might call `register(...)` before we've installed ourselves. These
  // global values are magically set in `initializeModuleLoaders` just for us and
  // we call them in the correct order.
  // N.B.  This block appears here specifically in order to ensure that
  // `--require` calls occur before `--loader` ones do.
  loadPreloadModules();
  initializeFrozenIntrinsics();
  var parentURL = getCWDURL().href;
  return _continue(_forTo(customLoaderURLs, function (i) {
    return _awaitIgnored(asyncLoaderHooks.register(customLoaderURLs[i], parentURL));
  }), function () {
    return asyncLoaderHooks;
  });
});
/**
 * Transfers an ArrayBuffer, TypedArray, or DataView to a worker thread.
 * @param {boolean} hasError - Whether an error occurred during transfer.
 * @param {ArrayBuffer[] | TypedArray | DataView} source - The data to transfer.
 * @returns {ArrayBuffer[]|undefined}
 */
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
  AtomicsAdd,
  AtomicsNotify,
  DataViewPrototypeGetBuffer,
  Int32Array,
  PromisePrototypeThen,
  ReflectApply,
  SafeSet,
  TypedArrayPrototypeGetBuffer
} = primordials;
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
var assert = require('internal/assert');
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
var {
  clearImmediate,
  setImmediate
} = require('timers');
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
function _call(body, then, direct) {
  if (direct) {
    return then ? then(body()) : body();
  }
  try {
    var result = Promise.resolve(body());
    return then ? result.then(then) : result;
  } catch (e) {
    return Promise.reject(e);
  }
}
var {
  isArrayBuffer,
  isDataView,
  isTypedArray
} = require('util/types');
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
  getOptionValue
} = require('internal/options');
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var {
  loadPreloadModules,
  initializeModuleLoaders,
  initializeFrozenIntrinsics
} = require('internal/process/pre_execution');
var {
  receiveMessageOnPort
} = require('internal/worker/io');
var {
  WORKER_TO_MAIN_THREAD_NOTIFICATION
} = require('internal/modules/esm/shared_constants');
var {
  isMarkedAsUntransferable
} = require('internal/buffer');
var {
  getCWDURL
} = require('internal/util');
var {
  isCascadedLoaderInitialized,
  getOrInitializeCascadedLoader
} = require('internal/modules/esm/loader');
var {
  AsyncLoaderHooksOnLoaderHookWorker
} = require('internal/modules/esm/hooks');
function transferArrayBuffer(hasError, source) {
  if (hasError || source == null) {
    return;
  }
  var arrayBuffer;
  if (isArrayBuffer(source)) {
    arrayBuffer = source;
  } else if (isTypedArray(source)) {
    arrayBuffer = TypedArrayPrototypeGetBuffer(source);
  } else if (isDataView(source)) {
    arrayBuffer = DataViewPrototypeGetBuffer(source);
  }
  if (arrayBuffer && !isMarkedAsUntransferable(arrayBuffer)) {
    return [arrayBuffer];
  }
}

/**
 * Wraps a message with a status and body, and serializes the body if necessary.
 * @param {string} status - The status of the message.
 * @param {any} body - The body of the message.
 * @returns {{status: string, body: any}}
 */
function wrapMessage(status, body) {
  if (status === 'success' || body === null || typeof body !== 'object' && typeof body !== 'function' && typeof body !== 'symbol') {
    return {
      status,
      body
    };
  }
  var serialized;
  var serializationFailed;
  try {
    var {
      serializeError
    } = require('internal/error_serdes');
    serialized = serializeError(body);
  } catch {
    serializationFailed = true;
  }
  return {
    status,
    body: {
      serialized,
      serializationFailed
    }
  };
}
module.exports = function setupModuleWorker(workerData, syncCommPort) {
  var lock = new Int32Array(workerData.lock);

  /**
   * Handles errors that occur in the worker thread.
   * @param {Error} err - The error that occurred.
   * @param {string} [origin] - The origin of the error.
   */
  function errorHandler(err) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'unhandledRejection';
    AtomicsAdd(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION, 1);
    AtomicsNotify(lock, WORKER_TO_MAIN_THREAD_NOTIFICATION);
    process.off('uncaughtException', errorHandler);
    if (hasUncaughtExceptionCaptureCallback()) {
      process._fatalException(err);
      return;
    }
    internalBinding('errors').triggerUncaughtException(err, origin === 'unhandledRejection');
  }
  return PromisePrototypeThen(customizedModuleWorker(lock, syncCommPort, errorHandler), undefined, errorHandler);
};

