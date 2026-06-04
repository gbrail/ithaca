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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypeReduce,
  FunctionPrototypeCall,
  JSONStringify,
  ObjectSetPrototypeOf,
  Promise,
  PromisePrototypeThen,
  RegExpPrototypeSymbolReplace,
  encodeURIComponent,
  hardenRegExp
} = primordials;
var {
  LoadCache,
  ResolveCache
} = require('internal/modules/esm/module_map');
var {
  ModuleJob,
  ModuleJobSync
} = require('internal/modules/esm/module_job');
// This is needed to avoid cycles in esm/resolve <-> cjs/loader
var {
  kIsExecuting,
  kRequiredModuleSymbol
} = require('internal/modules/cjs/loader');
var {
  imported_cjs_symbol
} = internalBinding('symbols');
var assert = require('internal/assert');
var {
  ERR_REQUIRE_ASYNC_MODULE,
  ERR_REQUIRE_CYCLE_MODULE,
  ERR_REQUIRE_ESM,
  ERR_REQUIRE_ESM_RACE_CONDITION,
  ERR_UNKNOWN_MODULE_FORMAT
} = require('internal/errors').codes;
var {
  getOptionValue
} = require('internal/options');
var {
  isURL,
  pathToFileURL
} = require('internal/url');
var {
  getDeprecationWarningEmitter,
  kEmptyObject
} = require('internal/util');
var {
  compileSourceTextModule,
  SourceTextModuleTypes: {
    kUser
  },
  getDefaultConditions,
  shouldSpawnLoaderHookWorker,
  requestTypes: {
    kImportInRequiredESM,
    kRequireInImportedCJS,
    kImportInImportedESM
  }
} = require('internal/modules/esm/utils');
/**
 * @typedef {import('./utils.js').ModuleRequestType} ModuleRequestType
 */
var {
  kImplicitTypeAttribute
} = require('internal/modules/esm/assert');
var {
  ModuleWrap,
  kEvaluated,
  kEvaluating,
  kEvaluationPhase,
  kInstantiated,
  kUninstantiated,
  kErrored,
  kSourcePhase,
  throwIfPromiseRejected,
  setImportMetaResolveInitializer
} = internalBinding('module_wrap');
var {
  urlToFilename
} = require('internal/modules/helpers');
var {
  resolveHooks: syncResolveHooks,
  resolveWithHooks: resolveWithSyncHooks,
  loadHooks: syncLoadHooks,
  loadWithHooks: loadWithSyncHooks,
  validateLoadSloppy
} = require('internal/modules/customization_hooks');
var {
  tracingChannel
} = require('diagnostics_channel');
var onImport = tracingChannel('module.import');
var debug = require('internal/util/debuglog').debuglog('esm', fn => {
  debug = fn;
});
var {
  isPromise
} = require('internal/util/types');

/**
 * @typedef {import('./hooks.js').AsyncLoaderHookWorker} AsyncLoaderHookWorker
 * @typedef {import('./module_job.js').ModuleJobBase} ModuleJobBase
 * @typedef {import('url').URL} URL
 */

var {
  translators
} = require('internal/modules/esm/translators');
var {
  defaultResolve
} = require('internal/modules/esm/resolve');
var {
  defaultLoadSync,
  throwUnknownModuleFormat
} = require('internal/modules/esm/load');

/**
 * @typedef {import('../cjs/loader.js').Module} CJSModule
 */

/**
 * @typedef {Record<string, any>} ModuleExports
 */

/**
 * @typedef {'builtin'|'commonjs'|'json'|'module'|'wasm'} ModuleFormat
 */

/**
 * @typedef {ArrayBuffer|TypedArray|string} ModuleSource
 */

/**
 * @typedef {{format: string, url: string, isResolvedBySyncHooks: boolean}} ResolveResult
 */

/**
 * @typedef {{
 *   url: string,
 *   format: ModuleFormat,
 *   source: ModuleSource,
 *   responseURL?: string,
 *   translatorKey: string,
 *   isResolvedBySyncHooks: boolean,
 *   isSourceLoadedSynchronously: boolean,
 * }} TranslateContext
 */

/**
 * @typedef {import('./hooks.js').AsyncLoaderHooks} AsyncLoaderHooks
 * @typedef {import('./hooks.js').AsyncLoaderHooksOnLoaderHookWorker} AsyncLoaderHooksOnLoaderHookWorker
 * @typedef {import('./hooks.js').AsyncLoaderHooksProxiedToLoaderHookWorker} AsyncLoaderHooksProxiedToLoaderHookWorker
 */

/**
 * This class covers the base machinery of module loading. There are two types of loader hooks:
 * 1. Asynchronous loader hooks, which are run in a separate loader hook worker thread.
 *    This is configured in #asyncLoaderHooks.
 * 2. Synchronous loader hooks, which are run in-thread. This is shared with the CJS loader and is
 *    stored in the cross-module syncResolveHooks and syncLoadHooks arrays.
 */
var _defaultConditions = /*#__PURE__*/new WeakMap();
var _resolveCache = /*#__PURE__*/new WeakMap();
var _asyncLoaderHooks = /*#__PURE__*/new WeakMap();
var _ModuleLoader_brand = /*#__PURE__*/new WeakSet();
var ModuleLoader = /*#__PURE__*/function () {
  function ModuleLoader(_asyncLoaderHooks2) {
    _classCallCheck(this, ModuleLoader);
    /**
     * Change the currently activate async loader hooks for this module
     * loader to be the provided `AsyncLoaderHooks`.
     *
     * If present, this class customizes its core functionality to the
     * `AsyncLoaderHooks` object, including registration, loading, and resolving.
     * There are some responsibilities that this class _always_ takes
     * care of, like validating outputs, so that the AsyncLoaderHooks object
     * does not have to do so.
     *
     * Calling this function alters how modules are loaded and should be
     * invoked with care.
     * @param {AsyncLoaderHooks} asyncLoaderHooks
     */
    _classPrivateMethodInitSpec(this, _ModuleLoader_brand);
    /**
     * The conditions for resolving packages if `--conditions` is not used.
     */
    _classPrivateFieldInitSpec(this, _defaultConditions, getDefaultConditions());
    /**
     * Registry of resolved specifiers
     */
    _classPrivateFieldInitSpec(this, _resolveCache, new ResolveCache());
    /**
     * Registry of loaded modules, akin to `require.cache`
     */
    _defineProperty(this, "loadCache", new LoadCache());
    /**
     * @see {AsyncLoaderHooks.isForAsyncLoaderHookWorker}
     * Shortcut to this.#asyncLoaderHooks.isForAsyncLoaderHookWorker.
     */
    _defineProperty(this, "isForAsyncLoaderHookWorker", false);
    /**
     * Asynchronous loader hooks to pass requests to.
     *
     * Note that this value _MUST_ be set with `#setAsyncLoaderHooks`
     * because it needs to copy `#asyncLoaderHooks.isForAsyncLoaderHookWorker`
     * to this property.
     * TODO(joyeecheung): this was a legacy of the previous setup of import.meta.resolve
     * configuration; put this information in the environment directly instead.
     *
     * When the ModuleLoader is created on a loader hook thread, this is
     * {@link AsyncLoaderHooksOnLoaderHookWorker}, and its methods directly call out
     * to loader methods. Otherwise, this is {@link AsyncLoaderHooksProxiedToLoaderHookWorker},
     * and its methods post messages to the loader thread and possibly block on it.
     * @see {ModuleLoader.#setAsyncLoaderHooks}
     * @type {AsyncLoaderHooks}
     */
    _classPrivateFieldInitSpec(this, _asyncLoaderHooks, void 0);
    _assertClassBrand(_ModuleLoader_brand, this, _setAsyncLoaderHooks).call(this, _asyncLoaderHooks2);
  }
  return _createClass(ModuleLoader, [{
    key: "createModuleWrap",
    value:
    /**
     *
     * @param {string} source Source code of the module.
     * @param {string} url URL of the module.
     * @param {{ isMain?: boolean }|undefined} context - context object containing module metadata.
     * @returns {object} The module wrap object.
     */
    function createModuleWrap(source, url) {
      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
      return compileSourceTextModule(url, source, kUser, context);
    }

    /**
     *
     * @param {string} url URL of the module.
     * @param {object} wrap Module wrap object.
     * @param {boolean} isEntryPoint Whether the module is the entry point.
     * @returns {Promise<object>} The module object.
     */
  }, {
    key: "executeModuleJob",
    value: function executeModuleJob(url, wrap) {
      var isEntryPoint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      try {
        var _this = this;
        return _await(onImport.tracePromise(_async(function () {
          var job = new ModuleJob(_this, url, undefined, wrap, kEvaluationPhase, false, false, kImportInImportedESM);
          _this.loadCache.set(url, undefined, job);
          return _await(job.run(isEntryPoint), function (_ref) {
            var {
              module
            } = _ref;
            return module;
          });
        }), {
          __proto__: null,
          parentURL: '<eval>',
          url
        }), function (module) {
          return {
            __proto__: null,
            namespace: module.getNamespace(),
            module
          };
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     *
     * @param {string} source Source code of the module.
     * @param {string} url URL of the module.
     * @param {boolean} isEntryPoint Whether the module is the entry point.
     * @returns {Promise<object>} The module object.
     */
  }, {
    key: "eval",
    value: function _eval(source, url) {
      var isEntryPoint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var context = isEntryPoint ? {
        isMain: true
      } : undefined;
      var wrap = this.createModuleWrap(source, url, context);
      return this.executeModuleJob(url, wrap, isEntryPoint);
    }

    /**
     * This constructs (creates, instantiates and evaluates) a module graph that
     * is require()'d.
     * @param {CJSModule} mod CJS module wrapper of the ESM.
     * @param {string} filename Resolved filename of the module being require()'d
     * @param {string} source Source code. TODO(joyeecheung): pass the raw buffer.
     * @param {string} isMain Whether this module is a main module.
     * @param {CJSModule|undefined} parent Parent module, if any.
     * @returns {{wrap: ModuleWrap, namespace: import('internal/modules/esm/utils').ModuleNamespaceObject}}
     */
  }, {
    key: "importSyncForRequire",
    value: function importSyncForRequire(mod, filename, source, isMain, parent) {
      var url = pathToFileURL(filename).href;
      if (!getOptionValue('--require-module')) {
        throw new ERR_REQUIRE_ESM(url, true);
      }
      var job = this.loadCache.get(url, kImplicitTypeAttribute);
      // This module job is already created:
      // 1. If it was loaded by `require()` before, at this point the instantiation
      //    is already completed and we can check whether it is in a cycle
      //    (in that case the module status is kEvaluating), and whether the
      //    required graph is synchronous.
      // 2. If it was loaded by `import` before, only allow it if it's already evaluated
      //    to forbid cycles.
      //    TODO(joyeecheung): ensure that imported synchronous graphs are evaluated
      //    synchronously so that any previously imported synchronous graph is already
      //    evaluated at this point.
      // TODO(joyeecheung): add something similar to CJS loader's requireStack to help
      // debugging the problematic links in the graph for import.
      debug('importSyncForRequire', parent?.filename, '->', filename, job);
      if (job !== undefined) {
        mod[kRequiredModuleSymbol] = job.module;
        var parentFilename = urlToFilename(parent?.filename);
        // This race should only be possible on the loader hook thread. See https://github.com/nodejs/node/issues/59666
        if (!job.module) {
          throw new ERR_REQUIRE_ESM_RACE_CONDITION(filename, parentFilename, this.isForAsyncLoaderHookWorker);
        }
        var status = job.module.getStatus();
        debug('Module status', job, status);
        // hasAsyncGraph is available after module been instantiated.
        if (status >= kInstantiated && job.module.hasAsyncGraph) {
          throw new ERR_REQUIRE_ASYNC_MODULE(filename, parentFilename);
        }
        if (status === kEvaluated) {
          return {
            wrap: job.module,
            namespace: job.module.getNamespace()
          };
        } else if (status === kInstantiated) {
          // When it's an async job cached by another import request,
          // which has finished linking but has not started its
          // evaluation because the async run() task would be later
          // in line. Then start the evaluation now with runSync(), which
          // is guaranteed to finish by the time the other run() get to it,
          // and the other task would just get the cached evaluation results,
          // similar to what would happen when both are async.
          mod[kRequiredModuleSymbol] = job.module;
          var {
            namespace
          } = job.runSync(parent);
          return {
            wrap: job.module,
            namespace: namespace || job.module.getNamespace()
          };
        } else if (status === kErrored) {
          // If the module was previously imported and errored, throw the error.
          throw job.module.getError();
        }
        // When the cached async job have already encountered a linking
        // error that gets wrapped into a rejection, but is still later
        // in line to throw on it, just unwrap and throw the linking error
        // from require().
        if (job.instantiated) {
          throwIfPromiseRejected(job.instantiated);
        }
        if (status !== kEvaluating) {
          assert(status === kUninstantiated, `Unexpected module status ${status}`);
          throw new ERR_REQUIRE_ESM_RACE_CONDITION(filename, parentFilename, false);
        }
        var message = `Cannot require() ES Module ${filename} in a cycle.`;
        if (parentFilename) {
          message += ` (from ${parentFilename})`;
        }
        message += ' A cycle involving require(esm) is not allowed to maintain ';
        message += 'invariants mandated by the ECMAScript specification. ';
        message += 'Try making at least part of the dependency in the graph lazily loaded.';
        throw new ERR_REQUIRE_CYCLE_MODULE(message);
      }
      // TODO(joyeecheung): refactor this so that we pre-parse in C++ and hit the
      // cache here, or use a carrier object to carry the compiled module script
      // into the constructor to ensure cache hit.
      var wrap = compileSourceTextModule(url, source, kUser);
      var inspectBrk = isMain && getOptionValue('--inspect-brk');
      job = new ModuleJobSync(this, url, kEmptyObject, wrap, kEvaluationPhase, isMain, inspectBrk, kImportInRequiredESM);
      this.loadCache.set(url, kImplicitTypeAttribute, job);
      mod[kRequiredModuleSymbol] = job.module;
      return {
        wrap: job.module,
        namespace: job.runSync(parent).namespace
      };
    }

    /**
     * Check invariants on a cached module job when require()'d from ESM.
     * @param {string} specifier The first parameter of require().
     * @param {string} url URL of the module being required.
     * @param {string|undefined} parentURL URL of the module calling require().
     * @param {ModuleJobBase} job The cached module job.
     */
  }, {
    key: "loadAndTranslateForImportInRequiredESM",
    value:
    /**
     * Load a module and translate it into a ModuleWrap for require(esm).
     * This is run synchronously, and the translator always return a ModuleWrap synchronously.
     * @param {ResolveResult} resolveResult Result from the resolve step.
     * @param {object} loadContext See {@link load}
     * @param {string|undefined} parentURL URL of the parent module. Undefined if it's the entry point.
     * @param {ModuleRequest} request Module request.
     * @returns {ModuleWrap}
     */
    function loadAndTranslateForImportInRequiredESM(resolveResult, loadContext, parentURL, request) {
      var {
        url
      } = resolveResult;
      var loadResult = _assertClassBrand(_ModuleLoader_brand, this, _loadSync).call(this, url, loadContext);
      // Use the synchronous commonjs translator which can deal with cycles.
      var formatFromLoad = loadResult.format;
      var translatorKey = formatFromLoad === 'commonjs' || formatFromLoad === 'commonjs-typescript' ? 'commonjs-sync' : formatFromLoad;
      var translateContext = _objectSpread(_objectSpread(_objectSpread({}, resolveResult), loadResult), {}, {
        translatorKey,
        __proto__: null
      });
      var wrap = _assertClassBrand(_ModuleLoader_brand, this, _translate).call(this, url, translateContext, parentURL);
      assert(wrap instanceof ModuleWrap, `Translator used for require(${url}) should not be async`);
      var cjsModule = wrap[imported_cjs_symbol];
      if (cjsModule) {
        // Check if the ESM initiating import CJS is being required by the same CJS module.
        if (cjsModule?.[kIsExecuting]) {
          var parentFilename = urlToFilename(parentURL);
          var message = `Cannot import CommonJS Module ${request.specifier} in a cycle.`;
          if (parentFilename) {
            message += ` (from ${parentFilename})`;
          }
          throw new ERR_REQUIRE_CYCLE_MODULE(message);
        }
      }
      return wrap;
    }

    /**
     * Translate a loaded module source into a ModuleWrap. This is run synchronously,
     * but the translator may return the ModuleWrap in a Promise.
     * @param {string} url URL of the module to be translated.
     * @param {TranslateContext} translateContext Context for the translator
     * @param {string|undefined} parentURL URL of the module initiating the module loading for the first time.
     *   Undefined if it's the entry point.
     * @returns {ModuleWrap}
     */
  }, {
    key: "loadAndTranslateForRequireInImportedCJS",
    value:
    /**
     * Load a module and translate it into a ModuleWrap for require() in imported CJS.
     * This is run synchronously, and the translator always return a ModuleWrap synchronously.
     * @param {ResolveResult} resolveResult Result from the resolve step.
     * @param {object} loadContext See {@link load}
     * @param {string|undefined} parentURL URL of the parent module. Undefined if it's the entry point.
     * @returns {ModuleWrap}
     */
    function loadAndTranslateForRequireInImportedCJS(resolveResult, loadContext, parentURL) {
      var {
        url
      } = resolveResult;
      var loadResult = _assertClassBrand(_ModuleLoader_brand, this, _loadSync).call(this, url, loadContext);
      var formatFromLoad = loadResult.format;
      if (formatFromLoad === 'wasm') {
        // require(wasm) is not supported.
        throw new ERR_UNKNOWN_MODULE_FORMAT(formatFromLoad, url);
      }
      if (formatFromLoad === 'module' || formatFromLoad === 'module-typescript') {
        if (!getOptionValue('--require-module')) {
          throw new ERR_REQUIRE_ESM(url, true);
        }
      }
      var translatorKey = formatFromLoad;
      if (formatFromLoad === 'commonjs') {
        translatorKey = 'require-commonjs';
      }
      if (formatFromLoad === 'commonjs-typescript') {
        translatorKey = 'require-commonjs-typescript';
      }
      var translateContext = _objectSpread(_objectSpread(_objectSpread({}, resolveResult), loadResult), {}, {
        translatorKey,
        __proto__: null
      });
      var wrap = _assertClassBrand(_ModuleLoader_brand, this, _translate).call(this, url, translateContext, parentURL);
      assert(wrap instanceof ModuleWrap, `Translator used for require(${url}) should not be async`);
      return wrap;
    }

    /**
     * Load a module and translate it into a ModuleWrap for ordinary imported ESM.
     * This may be run asynchronously if there are asynchronous module loader hooks registered.
     * @param {ResolveResult} resolveResult Result from the resolve step.
     * @param {object} loadContext See {@link load}
     * @param {string|undefined} parentURL URL of the parent module. Undefined if it's the entry point.
     * @returns {Promise<ModuleWrap>|ModuleWrap}
     */
  }, {
    key: "loadAndTranslate",
    value: function loadAndTranslate(resolveResult, loadContext, parentURL) {
      var {
        url
      } = resolveResult;
      var maybePromise = this.load(url, loadContext);
      var afterLoad = loadResult => {
        var translateContext = _objectSpread(_objectSpread(_objectSpread({}, resolveResult), loadResult), {}, {
          translatorKey: loadResult.format,
          __proto__: null
        });
        return _assertClassBrand(_ModuleLoader_brand, this, _translate).call(this, url, translateContext, parentURL);
      };
      if (isPromise(maybePromise)) {
        return PromisePrototypeThen(maybePromise, afterLoad);
      }
      return afterLoad(maybePromise);
    }

    /**
     * Given a resolved module request, obtain a ModuleJobBase from it - if it's already cached,
     * return the cached ModuleJobBase. Otherwise, load its source and translate it into a ModuleWrap first.
     * This runs synchronously. On any thread that is not an async loader hook worker thread,
     * the module should be linked by the time this returns. Otherwise it may still have
     * pending module requests.
     * @param {string} parentURL See {@link getOrCreateModuleJob}
     * @param {ResolveResult} resolveResult
     * @param {ModuleRequest} request Module request.
     * @param {ModuleRequestType} requestType Type of the module request.
     * @returns {ModuleJobBase} The (possibly pending) module job
     */
  }, {
    key: "getOrCreateModuleJob",
    value:
    /**
     * Get a (possibly not yet fully linked) module job from the cache, or create one and return its Promise.
     * @param {string} [parentURL] The URL of the module where the module request is initiated.
     *   It's undefined if it's from the root module.
     * @param {ModuleRequest} request Module request.
     * @param {ModuleRequestType} requestType Type of the module request.
     * @returns {Promise<ModuleJobBase>|ModuleJobBase}
     */
    function getOrCreateModuleJob(parentURL, request, requestType) {
      var maybePromise;
      if (requestType === kRequireInImportedCJS || requestType === kImportInRequiredESM) {
        // In these two cases, resolution must be synchronous.
        maybePromise = this.resolveSync(parentURL, request);
        assert(!isPromise(maybePromise));
      } else {
        maybePromise = _assertClassBrand(_ModuleLoader_brand, this, _resolve).call(this, parentURL, request);
      }
      var afterResolve = resolveResult => {
        return _assertClassBrand(_ModuleLoader_brand, this, _getOrCreateModuleJobAfterResolve).call(this, parentURL, resolveResult, request, requestType);
      };
      if (isPromise(maybePromise)) {
        return PromisePrototypeThen(maybePromise, afterResolve);
      }
      return afterResolve(maybePromise);
    }

    /**
     * This method is usually called indirectly as part of the loading processes.
     * Use directly with caution.
     * @param {string} specifier The first parameter of an `import()` expression.
     * @param {string} parentURL Path of the parent importing the module.
     * @param {Record<string, string>} importAttributes Validations for the
     *   module import.
     * @param {number} [phase] The phase of the import.
     * @param {boolean} [isEntryPoint] Whether this is the realm-level entry point.
     * @returns {Promise<ModuleExports>}
     */
  }, {
    key: "import",
    value: function _import(specifier, parentURL, importAttributes) {
      var phase = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : kEvaluationPhase;
      var isEntryPoint = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      try {
        var _this2 = this;
        return _await(onImport.tracePromise(_async(function () {
          var _exit = false;
          var request = {
            specifier,
            phase,
            attributes: importAttributes,
            __proto__: null
          };
          var moduleJob;
          return _continue(_catch(function () {
            return _await(_this2.getOrCreateModuleJob(parentURL, request), function (_this2$getOrCreateMod) {
              moduleJob = _this2$getOrCreateMod;
            });
          }, function (e) {
            if (e?.code === 'ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED') {
              var _Promise = new Promise(() => {});
              _exit = true;
              return _Promise;
            }
            throw e;
          }), function (_result) {
            var _exit2 = false;
            if (_exit) return _result;
            return _invoke(function () {
              if (phase === kSourcePhase) {
                return _await(moduleJob.modulePromise, function (module) {
                  var _module$getModuleSour = module.getModuleSourceObject();
                  _exit2 = true;
                  return _module$getModuleSour;
                });
              }
            }, function (_result2) {
              return _exit2 ? _result2 : _await(moduleJob.run(isEntryPoint), function (_ref2) {
                var {
                  module
                } = _ref2;
                return module.getNamespace();
              });
            });
          });
        }), {
          __proto__: null,
          parentURL,
          url: specifier
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * @see {@link AsyncLoaderHooks.register}
     * @returns {any}
     */
  }, {
    key: "register",
    value: function register(specifier, parentURL, data, transferList, isInternal) {
      if (!_classPrivateFieldGet(_asyncLoaderHooks, this)) {
        // On the loader hook worker thread, the #asyncLoaderHooks must already have been initialized
        // to be an instance of AsyncLoaderHooksOnLoaderHookWorker, so this branch can only ever
        // be hit on a non-loader-hook thread that will talk to the loader hook worker thread.
        var {
          AsyncLoaderHooksProxiedToLoaderHookWorker
        } = require('internal/modules/esm/hooks');
        _assertClassBrand(_ModuleLoader_brand, this, _setAsyncLoaderHooks).call(this, new AsyncLoaderHooksProxiedToLoaderHookWorker());
      }
      return _classPrivateFieldGet(_asyncLoaderHooks, this).register(`${specifier}`, `${parentURL}`, data, transferList, isInternal);
    }

    /**
     * Resolve a module request to a URL identifying the location of the module. Handles customization hooks,
     * if any.
     * @param {string} [parentURL] The URL of the module where the module request is initiated.
     *   It's undefined if it's from the root module.
     * @param {ModuleRequest} request Module request.
     * @returns {Promise<ResolveResult>|ResolveResult}
     */
  }, {
    key: "resolveSync",
    value:
    /**
     * Similar to {@link resolve}, but the results are always synchronously returned. If there are any
     * asynchronous resolve hooks from module.register(), it will block until the results are returned
     * from the loader thread for this to be synchronous.
     * This is here to support `import.meta.resolve()`, `require()` in imported CJS, and
     * `module.registerHooks()` hooks.
     * @param {string} [parentURL] See {@link resolve}.
     * @param {ModuleRequest} request See {@link resolve}.
     * @param {boolean} [shouldSkipSyncHooks] Whether to skip the synchronous hooks registered by module.registerHooks().
     *   This is used to maintain compatibility for the re-invented require.resolve (in imported CJS customized
     *   by module.register()`) which invokes the CJS resolution separately from the hook chain.
     * @returns {ResolveResult}
     */
    function resolveSync(parentURL, request) {
      var shouldSkipSyncHooks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var specifier = `${request.specifier}`;
      var importAttributes = request.attributes ?? kEmptyObject;
      // Use an output parameter to track the state and avoid polluting the user-visible resolve results.
      var out = {
        isResolvedByDefaultResolve: false,
        __proto__: null
      };
      var result;
      var isResolvedBySyncHooks = false;
      if (!shouldSkipSyncHooks && syncResolveHooks.length) {
        // Has module.registerHooks() hooks, chain the asynchronous hooks in the default step.
        result = resolveWithSyncHooks(specifier, parentURL, importAttributes, _classPrivateFieldGet(_defaultConditions, this), _assertClassBrand(_ModuleLoader_brand, this, _resolveAndMaybeBlockOnLoaderThread).bind(this, out));
        // If the default step ran, sync hooks did not short-circuit the resolution.
        isResolvedBySyncHooks = !out.isResolvedByDefaultResolve;
      } else {
        var context = _objectSpread(_objectSpread({}, request), {}, {
          conditions: _classPrivateFieldGet(_defaultConditions, this),
          parentURL,
          importAttributes,
          __proto__: null
        });
        result = _assertClassBrand(_ModuleLoader_brand, this, _resolveAndMaybeBlockOnLoaderThread).call(this, out, specifier, context);
      }
      result.isResolvedBySyncHooks = isResolvedBySyncHooks;
      return result;
    }

    /**
     * Provide source that is understood by one of Node's translators. Handles customization hooks,
     * if any.
     * @typedef {{
     *   format: ModuleFormat,
     *   source: ModuleSource,
     *   responseURL?: string,
     *   isSourceLoadedSynchronously: boolean,
     * }} LoadResult
     * @param {string} url The URL of the module to be loaded.
     * @param {object} context Metadata about the module
     * @returns {Promise<LoadResult> | LoadResult}}
     */
  }, {
    key: "load",
    value: function load(url, context) {
      if (this.isForAsyncLoaderHookWorker) {
        // TODO(joyeecheung): invoke the synchronous hooks in the default step on loader thread.
        return _classPrivateFieldGet(_asyncLoaderHooks, this).load(url, context);
      }
      return _assertClassBrand(_ModuleLoader_brand, this, _loadSync).call(this, url, context);
    }

    /**
     * This is the default load step for module.registerHooks(), which incorporates asynchronous hooks
     * from module.register() which are run in a blocking fashion for it to be synchronous.
     * @param {{isSourceLoadedSynchronously: boolean}} out
     *   Output object to track whether the source was loaded synchronously without polluting
     *   the user-visible load result.
     * @param {string} url See {@link load}
     * @param {object} context See {@link load}
     * @returns {{ format: ModuleFormat, source: ModuleSource }}
     */
  }, {
    key: "validateLoadResult",
    value: function validateLoadResult(url, format) {
      if (format == null) {
        throwUnknownModuleFormat(url, format);
      }
    }

    /**
     * Block until the async loader hooks have been initialized.
     *
     * No-op when no hooks have been supplied.
     */
  }, {
    key: "waitForAsyncLoaderHookInitialization",
    value: function waitForAsyncLoaderHookInitialization() {
      _classPrivateFieldGet(_asyncLoaderHooks, this)?.waitForLoaderHookInitialization();
    }
  }]);
}();
function _setAsyncLoaderHooks(asyncLoaderHooks) {
  _classPrivateFieldSet(_asyncLoaderHooks, this, asyncLoaderHooks);
  if (asyncLoaderHooks) {
    this.isForAsyncLoaderHookWorker = asyncLoaderHooks.isForAsyncLoaderHookWorker;
  } else {
    this.isForAsyncLoaderHookWorker = false;
  }
}
function _checkCachedJobForRequireESM(specifier, url, parentURL, job) {
  // This race should only be possible on the loader hook thread. See https://github.com/nodejs/node/issues/59666
  if (!job.module) {
    throw new ERR_REQUIRE_ESM_RACE_CONDITION(url, parentURL, this.isForAsyncLoaderHookWorker);
  }
  // This module is being evaluated, which means it's imported in a previous link
  // in a cycle.
  if (job.module.getStatus() === kEvaluating) {
    var parentFilename = urlToFilename(parentURL);
    var message = `Cannot import Module ${specifier} in a cycle.`;
    if (parentFilename) {
      message += ` (from ${parentFilename})`;
    }
    throw new ERR_REQUIRE_CYCLE_MODULE(message);
  }

  // Otherwise the module could be imported before but the evaluation may be already
  // completed (e.g. the require call is lazy) so it's okay. We will return the
  // job and check asynchronicity of the entire graph later, after the
  // graph is instantiated.
}
function _translate(url, translateContext, parentURL) {
  var {
    translatorKey,
    format
  } = translateContext;
  this.validateLoadResult(url, format);
  var translator = translators.get(translatorKey);
  if (!translator) {
    throw new ERR_UNKNOWN_MODULE_FORMAT(translatorKey, url);
  }
  var result = FunctionPrototypeCall(translator, this, url, translateContext, parentURL);
  assert(result instanceof ModuleWrap, `The ${format} module returned is not a ModuleWrap`);
  if (format === 'commonjs' || format === 'commonjs-sync' || format === 'require-commonjs') {
    result.isCommonJS = true;
  }
  return result;
}
function _getOrCreateModuleJobAfterResolve(parentURL, resolveResult, request, requestType) {
  var {
    url,
    format
  } = resolveResult;
  if (process.env.WATCH_REPORT_DEPENDENCIES && process.send) {
    var type = requestType === kRequireInImportedCJS ? 'require' : 'import';
    process.send({
      [`watch:${type}`]: [url]
    });
  }
  // Relay Events from worker to main thread
  if (process.env.WATCH_REPORT_DEPENDENCIES && !process.send) {
    var {
      isMainThread
    } = internalBinding('worker');
    if (!isMainThread) {
      var {
        parentPort
      } = require('worker_threads');
      if (parentPort) {
        parentPort.postMessage({
          'watch:import': [url]
        });
      }
    }
  }

  // TODO(joyeecheung): update the module requests to use importAttributes as property names.
  var importAttributes = resolveResult.importAttributes ?? request.attributes;
  var job = this.loadCache.get(url, importAttributes.type);
  if (job !== undefined) {
    if (requestType === kImportInRequiredESM) {
      _assertClassBrand(_ModuleLoader_brand, this, _checkCachedJobForRequireESM).call(this, request.specifier, url, parentURL, job);
    }
    job.ensurePhase(request.phase, requestType);
    return job;
  }
  var context = {
    format,
    importAttributes,
    __proto__: null
  };
  var moduleOrModulePromise;
  if (requestType === kRequireInImportedCJS) {
    moduleOrModulePromise = this.loadAndTranslateForRequireInImportedCJS(resolveResult, context, parentURL);
  } else if (requestType === kImportInRequiredESM) {
    moduleOrModulePromise = this.loadAndTranslateForImportInRequiredESM(resolveResult, context, parentURL, request);
  } else {
    moduleOrModulePromise = this.loadAndTranslate(resolveResult, context, parentURL);
  }
  if (requestType === kImportInRequiredESM || requestType === kRequireInImportedCJS || !this.isForAsyncLoaderHookWorker) {
    assert(moduleOrModulePromise instanceof ModuleWrap, `Expected ModuleWrap for loading ${url}`);
  }

  // TODO(joyeecheung): use ModuleJobSync for kRequireInImportedCJS too.
  var ModuleJobCtor = requestType === kImportInRequiredESM ? ModuleJobSync : ModuleJob;
  var isMain = parentURL === undefined;
  var inspectBrk = isMain && getOptionValue('--inspect-brk');
  job = new ModuleJobCtor(this, url, importAttributes, moduleOrModulePromise, request.phase, isMain, inspectBrk, requestType);
  this.loadCache.set(url, importAttributes.type, job);
  return job;
}
function _resolve(parentURL, request) {
  if (this.isForAsyncLoaderHookWorker) {
    var specifier = `${request.specifier}`;
    var importAttributes = request.attributes ?? kEmptyObject;
    // TODO(joyeecheung): invoke the synchronous hooks in the default step on loader thread.
    return _classPrivateFieldGet(_asyncLoaderHooks, this).resolve(specifier, parentURL, importAttributes);
  }
  return this.resolveSync(parentURL, request);
}
/**
 * Either return a cached resolution, or perform the default resolution which is synchronous, and
 * cache the result.
 * @param {string} specifier See {@link resolve}.
 * @param {{ parentURL?: string, importAttributes: ImportAttributes, conditions?: string[]}} context
 * @returns {{ format: string, url: string }}
 */
function _cachedDefaultResolve(specifier, context) {
  var {
    parentURL,
    importAttributes
  } = context;
  var requestKey = _classPrivateFieldGet(_resolveCache, this).serializeKey(specifier, importAttributes);
  var cachedResult = _classPrivateFieldGet(_resolveCache, this).get(requestKey, parentURL);
  if (cachedResult != null) {
    return cachedResult;
  }
  var result = defaultResolve(specifier, context);
  _classPrivateFieldGet(_resolveCache, this).set(requestKey, parentURL, result);
  return result;
}
/**
 * This is the default resolve step for module.registerHooks(), which incorporates asynchronous hooks
 * from module.register() which are run in a blocking fashion for it to be synchronous.
 * @param {{isResolvedByDefaultResolve: boolean}} out Output object to track whether the default resolve was used
 *   without polluting the user-visible resolve result.
 * @param {string|URL} specifier See {@link resolveSync}.
 * @param {{ parentURL?: string, importAttributes: ImportAttributes, conditions?: string[]}} context
 *   See {@link resolveSync}.
 * @returns {{ format: string, url: string }}
 */
function _resolveAndMaybeBlockOnLoaderThread(out, specifier, context) {
  if (_classPrivateFieldGet(_asyncLoaderHooks, this)?.resolveSync) {
    return _classPrivateFieldGet(_asyncLoaderHooks, this).resolveSync(specifier, context.parentURL, context.importAttributes);
  }
  out.isResolvedByDefaultResolve = true;
  return _assertClassBrand(_ModuleLoader_brand, this, _cachedDefaultResolve).call(this, specifier, context);
}
function _loadAndMaybeBlockOnLoaderThread(out, url, context) {
  if (_classPrivateFieldGet(_asyncLoaderHooks, this)?.loadSync) {
    out.isSourceLoadedSynchronously = false;
    return _classPrivateFieldGet(_asyncLoaderHooks, this).loadSync(url, context);
  }
  out.isSourceLoadedSynchronously = true;
  return defaultLoadSync(url, context);
}
/**
 * Similar to {@link load} but this is always run synchronously. If there are asynchronous hooks
 * from module.register(), this blocks on the loader thread for it to return synchronously.
 *
 * This is here to support `require()` in imported CJS and `module.registerHooks()` hooks.
 * @param {string} url See {@link load}
 * @param {object} [context] See {@link load}
 * @returns {LoadResult}
 */
function _loadSync(url, context) {
  // Use an output parameter to track the state and avoid polluting the user-visible resolve results.
  var out = {
    isSourceLoadedSynchronously: true,
    __proto__: null
  };
  var result;
  if (syncLoadHooks.length) {
    // Has module.registerHooks() hooks, chain the asynchronous hooks in the default step.
    // TODO(joyeecheung): construct the ModuleLoadContext in the loaders directly instead
    // of converting them from plain objects in the hooks.
    result = loadWithSyncHooks(url, context.format, context.importAttributes, _classPrivateFieldGet(_defaultConditions, this), _assertClassBrand(_ModuleLoader_brand, this, _loadAndMaybeBlockOnLoaderThread).bind(this, out), validateLoadSloppy);
  } else {
    result = _assertClassBrand(_ModuleLoader_brand, this, _loadAndMaybeBlockOnLoaderThread).call(this, out, url, context);
  }
  result.isSourceLoadedSynchronously = out.isSourceLoadedSynchronously;
  return result;
}
ObjectSetPrototypeOf(ModuleLoader.prototype, null);
var emittedLoaderFlagWarning = false;
/**
 * A loader instance is used as the main entry point for loading ES modules. Currently, this is a singleton; there is
 * only one used for loading the main module and everything in its dependency graph, though separate instances of this
 * class might be instantiated as part of bootstrap for other purposes.
 * @param {AsyncLoaderHooksOnLoaderHookWorker|undefined} [asyncLoaderHooks]
 *   Only provided when run on the loader hook thread.
 * @returns {ModuleLoader}
 */
function createModuleLoader(asyncLoaderHooks) {
  // Don't spawn a new loader hook worker if we are already in a loader hook worker to avoid infinite recursion.
  if (shouldSpawnLoaderHookWorker()) {
    assert(asyncLoaderHooks === undefined, 'asyncLoaderHooks should only be provided on the loader hook thread itself');
    var userLoaderPaths = getOptionValue('--experimental-loader');
    if (userLoaderPaths.length > 0) {
      if (!emittedLoaderFlagWarning) {
        var readableURIEncode = string => ArrayPrototypeReduce([[/'/g, '%27'],
        // We need to URL-encode the single quote as it's the delimiter for the --import flag.
        [/%22/g, '"'],
        // We can decode the double quotes to improve readability.
        [/%2F/ig, '/'] // We can decode the slashes to improve readability.
        ], (str, _ref3) => {
          var {
            0: regex,
            1: replacement
          } = _ref3;
          return RegExpPrototypeSymbolReplace(hardenRegExp(regex), str, replacement);
        }, encodeURIComponent(string));
        process.emitWarning('`--experimental-loader` may be removed in the future; instead use `register()`:\n' + `--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; ${ArrayPrototypeJoin(ArrayPrototypeMap(userLoaderPaths, loader => `register(${readableURIEncode(JSONStringify(loader))}, pathToFileURL("./"))`), '; ')};'`, 'ExperimentalWarning');
        emittedLoaderFlagWarning = true;
      }
      var {
        AsyncLoaderHooksProxiedToLoaderHookWorker
      } = require('internal/modules/esm/hooks');
      asyncLoaderHooks = new AsyncLoaderHooksProxiedToLoaderHookWorker();
    }
  }
  return new ModuleLoader(asyncLoaderHooks);
}
var allowImportMetaResolveParentURL;
/**
 * This is only called from the native ImportMetaObjectInitialize function to set up import.meta.resolve
 * when import.meta.resolve is accessed for the first time in a module.
 * @param {ModuleLoader} loader The cascaded loader to use. Bound when this function gets passed to native land.
 * @param {string} moduleURL URL of the module accessing import.meta
 * @returns {function(string, URL['href']=): string} The import.meta.resolve function
 */
function createImportMetaResolve(loader, moduleURL) {
  /**
   * @param {string} specifier The module specifier to resolve.
   * @param {URL['href']} [parentURL] Optional parent URL to resolve against. Ignored unless
   *   `--experimental-import-meta-resolve` is enabled.
   * @returns {string}
   */
  return function resolve(specifier, parentURL) {
    // The second argument is ignored unless --experimental-import-meta-resolve is enabled.
    // Even then, if it's not provided, parentURL defaults to the url of the module accessing
    // import.meta.resolve.
    allowImportMetaResolveParentURL ??= getOptionValue('--experimental-import-meta-resolve');
    parentURL = allowImportMetaResolveParentURL ? parentURL ?? moduleURL : moduleURL;
    var url;
    try {
      ({
        url
      } = loader.resolveSync(parentURL, {
        specifier,
        __proto__: null
      }));
      return url;
    } catch (error) {
      switch (error?.code) {
        case 'ERR_UNSUPPORTED_DIR_IMPORT':
        case 'ERR_MODULE_NOT_FOUND':
          ({
            url
          } = error);
          if (url) {
            return url;
          }
      }
      throw error;
    }
  };
}
var cascadedLoader;
/**
 * This is a singleton ESM loader that integrates the loader hooks, if any.
 * It it used by other internal built-ins when they need to load user-land ESM code
 * while also respecting hooks.
 * When built-ins need access to this loader, they should do
 * require('internal/module/esm/loader').getOrInitializeCascadedLoader()
 * lazily only right before the loader is actually needed, and don't do it
 * in the top-level, to avoid circular dependencies.
 * @param {AsyncLoaderHooksOnLoaderHookWorker|undefined} [asyncLoaderHooks]
 *   Only provided when run on the loader hook thread.
 * @returns {ModuleLoader}
 */
function getOrInitializeCascadedLoader(asyncLoaderHooks) {
  if (!cascadedLoader) {
    cascadedLoader = createModuleLoader(asyncLoaderHooks);
    // import.meta.resolve is not allowed in the async loader hook worker thread.
    // So only set up the import.meta.resolve initializer when we are initializing
    // the non-loader-hook-thread cascaded loader. When the native land doesn't see it,
    // it knows the loader is running on the loader hook thread.
    if (!asyncLoaderHooks?.isForAsyncLoaderHookWorker) {
      setImportMetaResolveInitializer(createImportMetaResolve.bind(null, cascadedLoader));
    }
  }
  return cascadedLoader;
}
function isCascadedLoaderInitialized() {
  return cascadedLoader !== undefined;
}

/**
 * Register a single loader programmatically.
 * @param {string|URL} specifier
 * @param {string|URL} [parentURL] Base to use when resolving `specifier`; optional if
 *   `specifier` is absolute. Same as `options.parentUrl`, just inline
 * @param {object} [options] Additional options to apply, described below.
 * @param {string|URL} [options.parentURL] Base to use when resolving `specifier`
 * @param {any} [options.data] Arbitrary data passed to the loader's `initialize` hook
 * @param {any[]} [options.transferList] Objects in `data` that are changing ownership
 * @returns {void} We want to reserve the return value for potential future extension of the API.
 * @example
 * ```js
 * register('./myLoader.js');
 * register('ts-node/esm', { parentURL: import.meta.url });
 * register('./myLoader.js', { parentURL: import.meta.url });
 * register('ts-node/esm', import.meta.url);
 * register('./myLoader.js', import.meta.url);
 * register(new URL('./myLoader.js', import.meta.url));
 * register('./myLoader.js', {
 *   parentURL: import.meta.url,
 *   data: { banana: 'tasty' },
 * });
 * register('./myLoader.js', {
 *   parentURL: import.meta.url,
 *   data: someArrayBuffer,
 *   transferList: [someArrayBuffer],
 * });
 * ```
 */
var emitRegisterDeprecation = getDeprecationWarningEmitter('DEP0205', '`module.register()` is deprecated. Use `module.registerHooks()` instead.', undefined, false);
function register(specifier) {
  var parentURL = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  var options = arguments.length > 2 ? arguments[2] : undefined;
  emitRegisterDeprecation();
  if (parentURL != null && typeof parentURL === 'object' && !isURL(parentURL)) {
    options = parentURL;
    parentURL = options.parentURL;
  }
  getOrInitializeCascadedLoader().register(specifier, parentURL ?? 'data:', options?.data, options?.transferList);
}
module.exports = {
  createModuleLoader,
  getOrInitializeCascadedLoader,
  isCascadedLoaderInitialized,
  register
};

