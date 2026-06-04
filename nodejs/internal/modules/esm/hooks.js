'use strict';

function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
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
function _do(body, test) {
  var awaitBody;
  do {
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.v;
      } else {
        awaitBody = true;
        break;
      }
    }
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
  } while (!shouldContinue.then);
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (awaitBody ? result.then(_resumeAfterBody) : shouldContinue.then(_resumeAfterTest)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    for (;;) {
      shouldContinue = test();
      if (_isSettledPact(shouldContinue)) {
        shouldContinue = shouldContinue.v;
      }
      if (!shouldContinue) {
        break;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (result && result.then) {
        if (_isSettledPact(result)) {
          result = result.v;
        } else {
          result.then(_resumeAfterBody).then(void 0, reject);
          return;
        }
      }
    }
    _settle(pact, 1, result);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      do {
        result = body();
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_resumeAfterBody).then(void 0, reject);
            return;
          }
        }
        shouldContinue = test();
        if (_isSettledPact(shouldContinue)) {
          shouldContinue = shouldContinue.v;
        }
        if (!shouldContinue) {
          _settle(pact, 1, result);
          return;
        }
      } while (!shouldContinue.then);
      shouldContinue.then(_resumeAfterTest).then(void 0, reject);
    } else {
      _settle(pact, 1, result);
    }
  }
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
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
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  AtomicsLoad,
  AtomicsWait,
  AtomicsWaitAsync,
  Int32Array,
  ObjectAssign,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  Promise,
  ReflectSet,
  SafeSet,
  StringPrototypeSlice,
  StringPrototypeToUpperCase
} = primordials;
var {
  ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED,
  ERR_INTERNAL_ASSERTION,
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE,
  ERR_INVALID_RETURN_PROPERTY_VALUE,
  ERR_INVALID_RETURN_VALUE,
  ERR_LOADER_CHAIN_INCOMPLETE,
  ERR_WORKER_UNSERIALIZABLE_ERROR
} = require('internal/errors').codes;
var {
  URLParse
} = require('internal/url');
var {
  canParse: URLCanParse
} = internalBinding('url');
var {
  receiveMessageOnPort
} = require('worker_threads');
var {
  isAnyArrayBuffer,
  isArrayBufferView
} = require('internal/util/types');
var {
  validateObject,
  validateString
} = require('internal/validators');
var {
  constructSharedArrayBuffer,
  kEmptyObject
} = require('internal/util');
var {
  defaultResolve,
  throwIfInvalidParentURL
} = require('internal/modules/esm/resolve');
var {
  getDefaultConditions
} = require('internal/modules/esm/utils');
var {
  deserializeError
} = require('internal/error_serdes');
var {
  SHARED_MEMORY_BYTE_LENGTH,
  WORKER_TO_MAIN_THREAD_NOTIFICATION
} = require('internal/modules/esm/shared_constants');
var debug = require('internal/util/debuglog').debuglog('async_loader_worker', fn => {
  debug = fn;
});
var importAssertionAlreadyWarned = false;
function emitImportAssertionWarning() {
  if (!importAssertionAlreadyWarned) {
    importAssertionAlreadyWarned = true;
    process.emitWarning('Use `importAttributes` instead of `importAssertions`', 'ExperimentalWarning');
  }
}
function defineImportAssertionAlias(context) {
  return ObjectDefineProperty(context, 'importAssertions', {
    __proto__: null,
    configurable: true,
    get() {
      emitImportAssertionWarning();
      return this.importAttributes;
    },
    set(value) {
      emitImportAssertionWarning();
      return ReflectSet(this, 'importAttributes', value);
    }
  });
}

/**
 * @typedef {object} ExportedHooks
 * @property {Function} resolve Resolve hook.
 * @property {Function} load Load hook.
 */

/**
 * @typedef {object} KeyedHook
 * @property {Function} fn The hook function.
 * @property {URL['href']} url The URL of the module.
 * @property {KeyedHook?} next The next hook in the chain.
 */

// [2] `validate...()`s throw the wrong error

/**
 * @typedef {{ format: ModuleFormat, source: ModuleSource }} LoadResult
 */

/**
 * @typedef {{ format: ModuleFormat, url: string, importAttributes: Record<string, string> }} ResolveResult
 */

/**
 * Interface for classes that implement asynchronous loader hooks that can be attached to the ModuleLoader
 * via `ModuleLoader.#setAsyncLoaderHooks()`.
 * @typedef {object} AsyncLoaderHooks
 * @property {boolean} isForAsyncLoaderHookWorker Whether the instance is running on the loader hook worker thread.
 * @property {(url: string, context: object, defaultLoad: Function) => Promise<LoadResult>} load
 *   Calling the asynchronous `load` hook asynchronously.
 * @property {(url: string, context: object, defaultLoad: Function) => LoadResult} [loadSync]
 *   Calling the asynchronous `load` hook synchronously.
 * @property {(originalSpecifier: string, parentURL: string,
 *             importAttributes: Record<string, string>) => Promise<ResolveResult>} resolve
 *   Calling the asynchronous `resolve` hook asynchronously.
 * @property {(originalSpecifier: string, parentURL: string,
 *            importAttributes: Record<string, string>) => ResolveResult} [resolveSync]
 *   Calling the asynchronous `resolve` hook synchronously.
 * @property {(specifier: string, parentURL: string) => any} register Register asynchronous loader hooks
 * @property {() => void} waitForLoaderHookInitialization Force loading of hooks.
 */

/**
 * @implements {AsyncLoaderHooks}
 * Instances of this class run directly on the loader hook worker thread and customize the module
 * loading of the hooks worker itself.
 */
var _chains = /*#__PURE__*/new WeakMap();
var _validatedUrls = /*#__PURE__*/new WeakMap();
var AsyncLoaderHooksOnLoaderHookWorker = /*#__PURE__*/function () {
  function AsyncLoaderHooksOnLoaderHookWorker() {
    _classCallCheck(this, AsyncLoaderHooksOnLoaderHookWorker);
    _classPrivateFieldInitSpec(this, _chains, {
      /**
       * Phase 1 of 2 in ESM loading.
       * The output of the `resolve` chain of hooks is passed into the `load` chain of hooks.
       * @private
       * @property {KeyedHook[]} resolve Last-in-first-out collection of resolve hooks.
       */
      resolve: [{
        fn: defaultResolve,
        url: 'node:internal/modules/esm/resolve'
      }],
      /**
       * Phase 2 of 2 in ESM loading.
       * @private
       * @property {KeyedHook[]} load Last-in-first-out collection of loader hooks.
       */
      load: [{
        fn: require('internal/modules/esm/load').defaultLoad,
        url: 'node:internal/modules/esm/load'
      }]
    });
    // Cache URLs we've already validated to avoid repeated validation
    _classPrivateFieldInitSpec(this, _validatedUrls, new SafeSet());
    _defineProperty(this, "isForAsyncLoaderHookWorker", true);
  }
  return _createClass(AsyncLoaderHooksOnLoaderHookWorker, [{
    key: "register",
    value:
    /**
     * Import and register custom/user-defined module loader hook(s).
     * @param {string} urlOrSpecifier
     * @param {string} parentURL
     * @param {any} [data] Arbitrary data to be passed from the custom
     *   loader (user-land) to the worker.
     */
    function register(urlOrSpecifier, parentURL, data, isInternal) {
      try {
        var _this = this;
        var cascadedLoader = require('internal/modules/esm/loader').getOrInitializeCascadedLoader();
        return _await(_await(isInternal ? require(urlOrSpecifier) : cascadedLoader.import(urlOrSpecifier, parentURL, kEmptyObject), function (keyedExports) {
          return _awaitIgnored(_this.addCustomLoader(urlOrSpecifier, keyedExports, data));
        }, isInternal));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Collect custom/user-defined module loader hook(s).
     * @param {string} url Custom loader specifier
     * @param {Record<string, unknown>} exports
     * @param {any} [data] Arbitrary data to be passed from the custom loader (user-land)
     *   to the worker.
     * @returns {any | Promise<any>} User data, ignored unless it's a promise, in which case it will be awaited.
     */
  }, {
    key: "addCustomLoader",
    value: function addCustomLoader(url, exports, data) {
      var {
        initialize,
        resolve,
        load
      } = pluckHooks(exports);
      if (resolve) {
        var next = _classPrivateFieldGet(_chains, this).resolve[_classPrivateFieldGet(_chains, this).resolve.length - 1];
        ArrayPrototypePush(_classPrivateFieldGet(_chains, this).resolve, {
          __proto__: null,
          fn: resolve,
          url,
          next
        });
      }
      if (load) {
        var _next = _classPrivateFieldGet(_chains, this).load[_classPrivateFieldGet(_chains, this).load.length - 1];
        ArrayPrototypePush(_classPrivateFieldGet(_chains, this).load, {
          __proto__: null,
          fn: load,
          url,
          next: _next
        });
      }
      return initialize?.(data);
    }

    /**
     * Resolve the location of the module.
     *
     * Internally, this behaves like a backwards iterator, wherein the stack of
     * hooks starts at the top and each call to `nextResolve()` moves down 1 step
     * until it reaches the bottom or short-circuits.
     * @param {string} originalSpecifier The specified URL path of the module to
     *   be resolved.
     * @param {string} [parentURL] The URL path of the module's parent.
     * @param {ImportAttributes} [importAttributes] Attributes from the import
     *   statement or expression.
     * @returns {Promise<{ format: string, url: URL['href'] }>}
     */
  }, {
    key: "resolve",
    value: function resolve(originalSpecifier, parentURL) {
      var importAttributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        __proto__: null
      };
      try {
        var _this2 = this;
        throwIfInvalidParentURL(parentURL);
        var chain = _classPrivateFieldGet(_chains, _this2).resolve;
        var context = {
          conditions: getDefaultConditions(),
          importAttributes,
          parentURL
        };
        var meta = {
          chainFinished: null,
          context,
          hookErrIdentifier: '',
          hookName: 'resolve',
          shortCircuited: false
        };
        var validateArgs = (hookErrIdentifier, suppliedSpecifier, ctx) => {
          validateString(suppliedSpecifier, `${hookErrIdentifier} specifier`); // non-strings can be coerced to a URL string

          if (ctx) {
            validateObject(ctx, `${hookErrIdentifier} context`);
          }
        };
        var validateOutput = (hookErrIdentifier, output) => {
          if (typeof output !== 'object' || output === null) {
            // [2]
            throw new ERR_INVALID_RETURN_VALUE('an object', hookErrIdentifier, output);
          }
        };
        var nextResolve = nextHookFactory(chain[chain.length - 1], meta, {
          validateArgs,
          validateOutput
        });
        return _await(nextResolve(originalSpecifier, defineImportAssertionAlias(context)), function (resolution) {
          var {
            hookErrIdentifier
          } = meta; // Retrieve the value after all settled

          validateOutput(hookErrIdentifier, resolution);
          if (resolution?.shortCircuit === true) {
            meta.shortCircuited = true;
          }
          if (!meta.chainFinished && !meta.shortCircuited) {
            throw new ERR_LOADER_CHAIN_INCOMPLETE(hookErrIdentifier);
          }
          var resolvedImportAttributes;
          var {
            format,
            url
          } = resolution;
          if (typeof url !== 'string') {
            // non-strings can be coerced to a URL string
            // validateString() throws a less-specific error
            throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a URL string', hookErrIdentifier, 'url', url);
          }

          // Avoid expensive URL instantiation for known-good URLs
          if (!_classPrivateFieldGet(_validatedUrls, _this2).has(url)) {
            // No need to convert to string, since the type is already validated
            if (!URLCanParse(url)) {
              throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a URL string', hookErrIdentifier, 'url', url);
            }
            _classPrivateFieldGet(_validatedUrls, _this2).add(url);
          }
          if (!('importAttributes' in resolution) && 'importAssertions' in resolution) {
            emitImportAssertionWarning();
            resolvedImportAttributes = resolution.importAssertions;
          } else {
            resolvedImportAttributes = resolution.importAttributes;
          }
          if (resolvedImportAttributes != null && typeof resolvedImportAttributes !== 'object') {
            throw new ERR_INVALID_RETURN_PROPERTY_VALUE('an object', hookErrIdentifier, 'importAttributes', resolvedImportAttributes);
          }
          if (format != null && typeof format !== 'string' // [2]
          ) {
            throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a string', hookErrIdentifier, 'format', format);
          }
          return {
            __proto__: null,
            format,
            importAttributes: resolvedImportAttributes,
            url
          };
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Provide source that is understood by one of Node's translators.
     *
     * Internally, this behaves like a backwards iterator, wherein the stack of
     * hooks starts at the top and each call to `nextLoad()` moves down 1 step
     * until it reaches the bottom or short-circuits.
     * @param {URL['href']} url The URL/path of the module to be loaded
     * @param {object} context Metadata about the module
     * @returns {Promise<{ format: ModuleFormat, source: ModuleSource }>}
     */
  }, {
    key: "load",
    value: function load(url) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      try {
        var _this3 = this;
        var chain = _classPrivateFieldGet(_chains, _this3).load;
        var meta = {
          chainFinished: null,
          context,
          hookErrIdentifier: '',
          hookName: 'load',
          shortCircuited: false
        };
        var validateArgs = (hookErrIdentifier, nextUrl, ctx) => {
          if (typeof nextUrl !== 'string') {
            // Non-strings can be coerced to a URL string
            // validateString() throws a less-specific error
            throw new ERR_INVALID_ARG_TYPE(`${hookErrIdentifier} url`, 'a URL string', nextUrl);
          }

          // Avoid expensive URL instantiation for known-good URLs
          if (!_classPrivateFieldGet(_validatedUrls, _this3).has(nextUrl)) {
            // No need to convert to string, since the type is already validated
            if (!URLCanParse(nextUrl)) {
              throw new ERR_INVALID_ARG_VALUE(`${hookErrIdentifier} url`, nextUrl, 'should be a URL string');
            }
            _classPrivateFieldGet(_validatedUrls, _this3).add(nextUrl);
          }
          if (ctx) {
            validateObject(ctx, `${hookErrIdentifier} context`);
          }
        };
        var validateOutput = (hookErrIdentifier, output) => {
          if (typeof output !== 'object' || output === null) {
            // [2]
            throw new ERR_INVALID_RETURN_VALUE('an object', hookErrIdentifier, output);
          }
        };
        var nextLoad = nextHookFactory(chain[chain.length - 1], meta, {
          validateArgs,
          validateOutput
        });
        return _await(nextLoad(url, defineImportAssertionAlias(context)), function (loaded) {
          var {
            hookErrIdentifier
          } = meta; // Retrieve the value after all settled

          validateOutput(hookErrIdentifier, loaded);
          if (loaded?.shortCircuit === true) {
            meta.shortCircuited = true;
          }
          if (!meta.chainFinished && !meta.shortCircuited) {
            throw new ERR_LOADER_CHAIN_INCOMPLETE(hookErrIdentifier);
          }
          var {
            format,
            source
          } = loaded;
          var responseURL = loaded.responseURL;
          if (responseURL === undefined) {
            responseURL = url;
          }
          var responseURLObj;
          if (typeof responseURL === 'string') {
            responseURLObj = URLParse(responseURL);
          }
          if (responseURLObj?.href !== responseURL) {
            throw new ERR_INVALID_RETURN_PROPERTY_VALUE('undefined or a fully resolved URL string', hookErrIdentifier, 'responseURL', responseURL);
          }
          if (format == null) {
            require('internal/modules/esm/load').throwUnknownModuleFormat(url, format);
          }
          if (typeof format !== 'string') {
            // [2]
            throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a string', hookErrIdentifier, 'format', format);
          }
          if (source != null && typeof source !== 'string' && !isAnyArrayBuffer(source) && !isArrayBufferView(source)) {
            throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a string, an ArrayBuffer, or a TypedArray', hookErrIdentifier, 'source', source);
          }
          return {
            __proto__: null,
            format,
            responseURL,
            source
          };
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "waitForLoaderHookInitialization",
    value: function waitForLoaderHookInitialization() {
      // No-op
    }
  }]);
}();
ObjectSetPrototypeOf(AsyncLoaderHooksOnLoaderHookWorker.prototype, null);

/**
 * There is only one loader hook thread for each non-loader-hook worker thread
 * (i.e. the non-loader-hook thread and any worker threads that are not loader hook workers themselves),
 * so there is only 1 MessageChannel.
 */
var MessageChannel;

/**
 * Abstraction over a worker thread that runs the asynchronous module loader hooks.
 * Instances of this class run on the non-loader-hook thread and communicate with the loader hooks worker thread.
 */
var _lock = /*#__PURE__*/new WeakMap();
var _worker = /*#__PURE__*/new WeakMap();
var _workerNotificationLastId = /*#__PURE__*/new WeakMap();
var _numberOfPendingAsyncResponses = /*#__PURE__*/new WeakMap();
var _isReady = /*#__PURE__*/new WeakMap();
var _AsyncLoaderHookWorker_brand = /*#__PURE__*/new WeakSet();
var AsyncLoaderHookWorker = /*#__PURE__*/function () {
  function AsyncLoaderHookWorker() {
    _classCallCheck(this, AsyncLoaderHookWorker);
    _classPrivateMethodInitSpec(this, _AsyncLoaderHookWorker_brand);
    /**
     * Shared memory. Always use Atomics method to read or write to it.
     * @type {Int32Array}
     */
    _classPrivateFieldInitSpec(this, _lock, void 0);
    /**
     * The InternalWorker instance, which lets us communicate with the loader thread.
     */
    _classPrivateFieldInitSpec(this, _worker, void 0);
    /**
     * The last notification ID received from the worker. This is used to detect
     * if the worker has already sent a notification before putting the main
     * thread to sleep, to avoid a race condition.
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _workerNotificationLastId, 0);
    /**
     * Track how many async responses the main thread should expect.
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _numberOfPendingAsyncResponses, 0);
    _classPrivateFieldInitSpec(this, _isReady, false);
    var {
      InternalWorker
    } = require('internal/worker');
    MessageChannel ??= require('internal/worker/io').MessageChannel;
    var lock = constructSharedArrayBuffer(SHARED_MEMORY_BYTE_LENGTH);
    _classPrivateFieldSet(_lock, this, new Int32Array(lock));
    _classPrivateFieldSet(_worker, this, new InternalWorker('internal/modules/esm/worker', {
      stderr: false,
      stdin: false,
      stdout: false,
      trackUnmanagedFds: false,
      workerData: {
        lock
      }
    }));
    _classPrivateFieldGet(_worker, this).unref(); // ! Allows the process to eventually exit.
    _classPrivateFieldGet(_worker, this).on('exit', process.exit);
  }
  return _createClass(AsyncLoaderHookWorker, [{
    key: "waitForWorker",
    value: function waitForWorker() {
      if (!_classPrivateFieldGet(_isReady, this)) {
        var {
          kIsOnline
        } = require('internal/worker');
        if (!_classPrivateFieldGet(_worker, this)[kIsOnline]) {
          debug('wait for signal from worker');
          AtomicsWait(_classPrivateFieldGet(_lock, this), WORKER_TO_MAIN_THREAD_NOTIFICATION, 0);
          var response = _classPrivateFieldGet(_worker, this).receiveMessageSync();
          if (response == null) {
            return;
          }
          if (response.message.status === 'exit') {
            process.exit(response.message.body);
          }

          // ! This line catches initialization errors in the worker thread.
          _assertClassBrand(_AsyncLoaderHookWorker_brand, this, _unwrapMessage).call(this, response);
        }
        _classPrivateFieldSet(_isReady, this, true);
      }
    }

    /**
     * Invoke a remote method asynchronously.
     * @param {string} method Method to invoke
     * @param {any[]} [transferList] Objects in `args` to be transferred
     * @param {any[]} args Arguments to pass to `method`
     * @returns {Promise<any>}
     */
  }, {
    key: "makeAsyncRequest",
    value: function makeAsyncRequest(method, transferList) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }
      try {
        var _this4 = this;
        var _this$numberOfPending, _this$numberOfPending2, _this$numberOfPending3;
        _this4.waitForWorker();
        MessageChannel ??= require('internal/worker/io').MessageChannel;
        var asyncCommChannel = new MessageChannel();

        // Pass work to the worker.
        debug('post async message to worker', {
          method,
          args,
          transferList
        });
        var finalTransferList = [asyncCommChannel.port2];
        if (transferList) {
          ArrayPrototypePushApply(finalTransferList, transferList);
        }
        _classPrivateFieldGet(_worker, _this4).postMessage({
          __proto__: null,
          method,
          args,
          port: asyncCommChannel.port2
        }, finalTransferList);
        if ((_classPrivateFieldSet(_numberOfPendingAsyncResponses, _this4, (_this$numberOfPending = _classPrivateFieldGet(_numberOfPendingAsyncResponses, _this4), _this$numberOfPending2 = _this$numberOfPending++, _this$numberOfPending)), _this$numberOfPending2) === 0) {
          // On the next lines, the main thread will await a response from the worker thread that might
          // come AFTER the last task in the event loop has run its course and there would be nothing
          // left keeping the thread alive (and once the main thread dies, the whole process stops).
          // However we want to keep the process alive until the worker thread responds (or until the
          // event loop of the worker thread is also empty), so we ref the worker until we get all the
          // responses back.
          _classPrivateFieldGet(_worker, _this4).ref();
        }
        var response;
        return _await(_continue(_do(function () {
          debug('wait for async response from worker', {
            method,
            args
          });
          return _await(AtomicsWaitAsync(_classPrivateFieldGet(_lock, _this4), WORKER_TO_MAIN_THREAD_NOTIFICATION, _classPrivateFieldGet(_workerNotificationLastId, _this4)).value, function () {
            _classPrivateFieldSet(_workerNotificationLastId, _this4, AtomicsLoad(_classPrivateFieldGet(_lock, _this4), WORKER_TO_MAIN_THREAD_NOTIFICATION));
            response = receiveMessageOnPort(asyncCommChannel.port1);
          });
        }, function () {
          return response == null;
        }), function () {
          debug('got async response from worker', {
            method,
            args
          }, _classPrivateFieldGet(_lock, _this4));
          if (_classPrivateFieldSet(_numberOfPendingAsyncResponses, _this4, (_this$numberOfPending3 = _classPrivateFieldGet(_numberOfPendingAsyncResponses, _this4), --_this$numberOfPending3)) === 0) {
            // We got all the responses from the worker, its job is done (until next time).
            _classPrivateFieldGet(_worker, _this4).unref();
          }
          var body = _assertClassBrand(_AsyncLoaderHookWorker_brand, _this4, _unwrapMessage).call(_this4, response);
          asyncCommChannel.port1.close();
          return body;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Invoke a remote method synchronously.
     * @param {string} method Method to invoke
     * @param {any[]} [transferList] Objects in `args` to be transferred
     * @param {any[]} args Arguments to pass to `method`
     * @returns {any}
     */
  }, {
    key: "makeSyncRequest",
    value: function makeSyncRequest(method, transferList) {
      this.waitForWorker();

      // Pass work to the worker.
      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }
      debug('post sync message to worker', {
        method,
        args,
        transferList
      });
      _classPrivateFieldGet(_worker, this).postMessage({
        __proto__: null,
        method,
        args
      }, transferList);
      var response;
      do {
        debug('wait for sync response from worker', {
          method,
          args
        });
        // Sleep until worker responds.
        AtomicsWait(_classPrivateFieldGet(_lock, this), WORKER_TO_MAIN_THREAD_NOTIFICATION, _classPrivateFieldGet(_workerNotificationLastId, this));
        _classPrivateFieldSet(_workerNotificationLastId, this, AtomicsLoad(_classPrivateFieldGet(_lock, this), WORKER_TO_MAIN_THREAD_NOTIFICATION));
        response = _classPrivateFieldGet(_worker, this).receiveMessageSync();
        debug('got sync message from worker', {
          method,
          args,
          response
        });
      } while (response == null);
      if (response.message.status === 'never-settle') {
        var error = new ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED();
        error.details = {
          method,
          args
        };
        throw error;
      } else if (response.message.status === 'exit') {
        process.exit(response.message.body);
      }
      return _assertClassBrand(_AsyncLoaderHookWorker_brand, this, _unwrapMessage).call(this, response);
    }
  }]);
}();
function _unwrapMessage(response) {
  if (response.message.status === 'never-settle') {
    return new Promise(() => {});
  }
  var {
    status,
    body
  } = response.message;
  if (status === 'error') {
    if (body == null || typeof body !== 'object') {
      throw body;
    }
    if (body.serializationFailed || body.serialized == null) {
      throw new ERR_WORKER_UNSERIALIZABLE_ERROR();
    }

    // eslint-disable-next-line no-restricted-syntax
    throw deserializeError(body.serialized);
  } else {
    return body;
  }
}
ObjectSetPrototypeOf(AsyncLoaderHookWorker.prototype, null);

// TODO(JakobJingleheimer): Remove this when loaders go "stable".
var globalPreloadWarningWasEmitted = false;

/**
 * A utility function to pluck the hooks from a user-defined loader.
 * @param {import('./loader.js').ModuleExports} exports
 * @returns {ExportedHooks}
 */
function pluckHooks(_ref) {
  var {
    globalPreload,
    initialize,
    resolve,
    load
  } = _ref;
  var acceptedHooks = {
    __proto__: null
  };
  if (resolve) {
    acceptedHooks.resolve = resolve;
  }
  if (load) {
    acceptedHooks.load = load;
  }
  if (initialize) {
    acceptedHooks.initialize = initialize;
  } else if (globalPreload && !globalPreloadWarningWasEmitted) {
    process.emitWarning('`globalPreload` has been removed; use `initialize` instead.', 'UnsupportedWarning');
    globalPreloadWarningWasEmitted = true;
  }
  return acceptedHooks;
}

/**
 * A utility function to iterate through a hook chain, track advancement in the
 * chain, and generate and supply the `next<HookName>` argument to the custom
 * hook.
 * @param {KeyedHook} current The (currently) first hook in the chain (this shifts
 *   on every call).
 * @param {object} meta Properties that change as the current hook advances
 *   along the chain.
 * @param {boolean} meta.chainFinished Whether the end of the chain has been
 *   reached AND invoked.
 * @param {string} meta.hookErrIdentifier A user-facing identifier to help
 *   pinpoint where an error occurred. Ex "file:///foo.mjs 'resolve'".
 * @param {string} meta.hookName The kind of hook the chain is (ex 'resolve')
 * @param {boolean} meta.shortCircuited Whether a hook signaled a short-circuit.
 * @param {function(string, unknown): void} validate A wrapper function
 *   containing all validation of a custom loader hook's intermediary output. Any
 *   validation within MUST throw.
 * @returns {Function} The next hook in the chain.
 */
function nextHookFactory(current, meta, _ref2) {
  var {
    validateArgs,
    validateOutput
  } = _ref2;
  // First, prepare the current
  var {
    hookName
  } = meta;
  var {
    fn: hook,
    url: hookFilePath,
    next
  } = current;

  // ex 'nextResolve'
  var nextHookName = `next${StringPrototypeToUpperCase(hookName[0]) + StringPrototypeSlice(hookName, 1)}`;
  var nextNextHook;
  if (next) {
    nextNextHook = nextHookFactory(next, meta, {
      validateArgs,
      validateOutput
    });
  } else {
    // eslint-disable-next-line func-name-matching
    nextNextHook = function chainAdvancedTooFar() {
      throw new ERR_INTERNAL_ASSERTION(`ESM custom loader '${hookName}' advanced beyond the end of the chain.`);
    };
  }
  return ObjectDefineProperty(_async(function () {
    var arg0 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var context = arguments.length > 1 ? arguments[1] : undefined;
    // Update only when hook is invoked to avoid fingering the wrong filePath
    meta.hookErrIdentifier = `${hookFilePath} '${hookName}'`;
    validateArgs(`${meta.hookErrIdentifier} hook's ${nextHookName}()`, arg0, context);
    var outputErrIdentifier = `${hookFilePath} '${hookName}' hook's ${nextHookName}()`;

    // Set when next<HookName> is actually called, not just generated.
    if (!next) {
      meta.chainFinished = true;
    }
    if (context) {
      // `context` has already been validated, so no fancy check needed.
      ObjectAssign(meta.context, context);
    }
    return _await(hook(arg0, meta.context, nextNextHook), function (output) {
      validateOutput(outputErrIdentifier, output);
      if (output?.shortCircuit === true) {
        meta.shortCircuited = true;
      }
      return output;
    });
  }), 'name', {
    __proto__: null,
    value: nextHookName
  });
}

/**
 * @type {AsyncLoaderHookWorker}
 * Worker instance used to run async loader hooks in a separate thread. This is a singleton for each
 * non-loader-hook worker thread (i.e. the main thread and any worker threads that are not
 * loader hook workers themselves).
 */
var asyncLoaderHookWorker;
/**
 * Get the AsyncLoaderHookWorker instance. If it is not defined, then create a new one.
 * @returns {AsyncLoaderHookWorker}
 */
function getAsyncLoaderHookWorker() {
  asyncLoaderHookWorker ??= new AsyncLoaderHookWorker();
  return asyncLoaderHookWorker;
}

/**
 * @implements {AsyncLoaderHooks}
 * Instances of this class are created in the non-loader-hook thread and communicate with the worker thread
 * spawned to run the async loader hooks.
 */
var AsyncLoaderHooksProxiedToLoaderHookWorker = /*#__PURE__*/function () {
  /**
   * Instantiate a module loader that uses user-provided custom loader hooks.
   */
  function AsyncLoaderHooksProxiedToLoaderHookWorker() {
    _classCallCheck(this, AsyncLoaderHooksProxiedToLoaderHookWorker);
    _defineProperty(this, "isForAsyncLoaderHookWorker", false);
    getAsyncLoaderHookWorker();
  }

  /**
   * Register some loader specifier.
   * @param {string} originalSpecifier The specified URL path of the loader to
   *   be registered.
   * @param {string} parentURL The parent URL from where the loader will be
   *   registered if using it package name as specifier
   * @param {any} [data] Arbitrary data to be passed from the custom loader
   *   (user-land) to the worker.
   * @param {any[]} [transferList] Objects in `data` that are changing ownership
   * @param {boolean} [isInternal] For internal loaders that should not be publicly exposed.
   * @returns {{ format: string, url: URL['href'] }}
   */
  return _createClass(AsyncLoaderHooksProxiedToLoaderHookWorker, [{
    key: "register",
    value: function register(originalSpecifier, parentURL, data, transferList, isInternal) {
      return asyncLoaderHookWorker.makeSyncRequest('register', transferList, originalSpecifier, parentURL, data, isInternal);
    }

    /**
     * Resolve the location of the module.
     * @param {string} originalSpecifier The specified URL path of the module to
     *   be resolved.
     * @param {string} [parentURL] The URL path of the module's parent.
     * @param {ImportAttributes} importAttributes Attributes from the import
     *   statement or expression.
     * @returns {{ format: string, url: URL['href'] }}
     */
  }, {
    key: "resolve",
    value: function resolve(originalSpecifier, parentURL, importAttributes) {
      return asyncLoaderHookWorker.makeAsyncRequest('resolve', undefined, originalSpecifier, parentURL, importAttributes);
    }
  }, {
    key: "resolveSync",
    value: function resolveSync(originalSpecifier, parentURL, importAttributes) {
      // This happens only as a result of `import.meta.resolve` calls, which must be sync per spec.
      return asyncLoaderHookWorker.makeSyncRequest('resolve', undefined, originalSpecifier, parentURL, importAttributes);
    }

    /**
     * Provide source that is understood by one of Node's translators.
     * @param {URL['href']} url The URL/path of the module to be loaded
     * @param {object} [context] Metadata about the module
     * @returns {Promise<{ format: ModuleFormat, source: ModuleSource }>}
     */
  }, {
    key: "load",
    value: function load(url, context) {
      return asyncLoaderHookWorker.makeAsyncRequest('load', undefined, url, context);
    }
  }, {
    key: "loadSync",
    value: function loadSync(url, context) {
      return asyncLoaderHookWorker.makeSyncRequest('load', undefined, url, context);
    }
  }, {
    key: "waitForLoaderHookInitialization",
    value: function waitForLoaderHookInitialization() {
      asyncLoaderHookWorker.waitForWorker();
    }
  }]);
}();
exports.AsyncLoaderHooksProxiedToLoaderHookWorker = AsyncLoaderHooksProxiedToLoaderHookWorker;
exports.AsyncLoaderHooksOnLoaderHookWorker = AsyncLoaderHooksOnLoaderHookWorker;
exports.AsyncLoaderHookWorker = AsyncLoaderHookWorker;

