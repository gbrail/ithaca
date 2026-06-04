'use strict';

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
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Asynchronously imports a module dynamically using a callback function. The native callback.
 * @param {symbol} referrerSymbol - Referrer symbol of the registered script, function, module, or contextified object.
 * @param {string} specifier - The module specifier string.
 * @param {number} phase - The module import phase.
 * @param {Record<string, string>} attributes - The import attributes object.
 * @param {string|null|undefined} referrerName - name of the referrer.
 * @returns {Promise<import('internal/modules/esm/loader.js').ModuleExports>} - The imported module object.
 * @throws {ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING} - If the callback function is missing.
 */
var importModuleDynamicallyCallback = _async(function (referrerSymbol, specifier, phase, attributes, referrerName) {
  // For user-provided vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER, emit the warning
  // and fall back to the default loader.
  if (referrerSymbol === vm_dynamic_import_main_context_default) {
    emitExperimentalWarning('vm.USE_MAIN_CONTEXT_DEFAULT_LOADER');
    return defaultImportModuleDynamicallyForScript(specifier, phase, attributes, referrerName);
  }
  // For script compiled internally that should use the default loader to handle dynamic
  // import, proxy the request to the default loader without the warning.
  if (referrerSymbol === vm_dynamic_import_default_internal) {
    return defaultImportModuleDynamicallyForScript(specifier, phase, attributes, referrerName);
  }
  // For SourceTextModules compiled internally, proxy the request to the default loader.
  if (referrerSymbol === source_text_module_default_hdo) {
    return defaultImportModuleDynamicallyForModule(specifier, phase, attributes, referrerName);
  }
  // For embedder entry point ESM, only allow built-in modules.
  if (referrerSymbol === embedder_module_hdo) {
    return importModuleDynamicallyForEmbedder(specifier, phase, attributes, referrerName);
  }
  if (moduleRegistries.has(referrerSymbol)) {
    var {
      importModuleDynamically,
      callbackReferrer
    } = moduleRegistries.get(referrerSymbol);
    if (importModuleDynamically !== undefined) {
      return importModuleDynamically(specifier, callbackReferrer, attributes, phase);
    }
  }
  if (referrerSymbol === vm_dynamic_import_missing_flag) {
    throw new ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG();
  }
  throw new ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING();
});
var {
  ArrayIsArray,
  ObjectFreeze,
  SafeSet,
  SafeWeakMap,
  Symbol: _Symbol
} = primordials;
var {
  privateSymbols: {
    host_defined_option_symbol
  }
} = internalBinding('util');
var {
  embedder_module_hdo,
  source_text_module_default_hdo,
  vm_dynamic_import_default_internal,
  vm_dynamic_import_main_context_default,
  vm_dynamic_import_missing_flag,
  vm_dynamic_import_no_callback
} = internalBinding('symbols');
var {
  ModuleWrap,
  setImportModuleDynamicallyCallback,
  setInitializeImportMetaObjectCallback
} = internalBinding('module_wrap');
var {
  maybeCacheSourceMap
} = require('internal/source_map/source_map_cache');
var {
  ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG,
  ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING,
  ERR_INVALID_ARG_VALUE
} = require('internal/errors').codes;
var {
  getOptionValue
} = require('internal/options');
var {
  emitExperimentalWarning,
  kEmptyObject
} = require('internal/util');
var assert = require('internal/assert');
var {
  normalizeReferrerURL,
  loadBuiltinModuleForEmbedder
} = require('internal/modules/helpers');
var defaultConditions;
/**
 * Returns the default conditions for ES module loading.
 * @returns {object}
 */
function getDefaultConditions() {
  assert(defaultConditions !== undefined);
  return defaultConditions;
}

/** @type {Set<string>} */
var defaultConditionsSet;
/**
 * Returns the default conditions for ES module loading, as a Set.
 * @returns {Set<any>}
 */
function getDefaultConditionsSet() {
  assert(defaultConditionsSet !== undefined);
  return defaultConditionsSet;
}

/**
 * Initializes the default conditions for ESM module loading.
 * This function is called during pre-execution, before any user code is run.
 * @returns {void}
 */
function initializeDefaultConditions() {
  var userConditions = getOptionValue('--conditions');
  var noAddons = getOptionValue('--no-addons');
  var addonConditions = noAddons ? [] : ['node-addons'];
  var moduleConditions = getOptionValue('--require-module') ? ['module-sync'] : [];
  defaultConditions = ObjectFreeze(['node', 'import'].concat(moduleConditions, addonConditions, _toConsumableArray(userConditions)));
  defaultConditionsSet = new SafeSet(defaultConditions);
}

/**
 * @param {string[]} [conditions]
 * @returns {Set<string>}
 */
function getConditionsSet(conditions) {
  if (conditions !== undefined && conditions !== getDefaultConditions()) {
    if (!ArrayIsArray(conditions)) {
      throw new ERR_INVALID_ARG_VALUE('conditions', conditions, 'expected an array');
    }
    return new SafeSet(conditions);
  }
  return getDefaultConditionsSet();
}

/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {{
 *   [Symbol.toStringTag]: () => 'Module'
 * }} ModuleNamespaceObject
 */

/**
 * @callback ImportModuleDynamicallyCallback
 * @param {string} specifier
 * @param {ModuleWrap|ContextifyScript|Function|vm.Module} callbackReferrer
 * @param {Record<string, string>} attributes
 * @param {number} phase
 * @returns {Promise<ModuleNamespaceObject>}
 */

/**
 * @callback InitializeImportMetaCallback
 * @param {object} meta
 * @param {ModuleWrap|ContextifyScript|Function|vm.Module} callbackReferrer
 */

/**
 * @typedef {{
 *   callbackReferrer: ModuleWrap|ContextifyScript|Function|vm.Module
 *   initializeImportMeta? : InitializeImportMetaCallback,
 *   importModuleDynamically? : ImportModuleDynamicallyCallback
 * }} ModuleRegistry
 */

/**
 * @type {WeakMap<symbol, ModuleRegistry>}
 */
var moduleRegistries = new SafeWeakMap();

/**
 * @typedef {ContextifyScript|Function|ModuleWrap|ContextifiedObject} Referrer
 * A referrer can be a Script Record, a Cyclic Module Record, or a Realm Record
 * as defined in https://tc39.es/ecma262/#sec-HostLoadImportedModule.
 *
 * In Node.js, a referrer is represented by a wrapper object of these records.
 * A referrer object has a field |host_defined_option_symbol| initialized with
 * a symbol.
 */

/**
 * V8 would make sure that as long as import() can still be initiated from
 * the referrer, the symbol referenced by |host_defined_option_symbol| should
 * be alive, which in term would keep the settings object alive through the
 * WeakMap, and in turn that keeps the referrer object alive, which would be
 * passed into the callbacks.
 * The reference goes like this:
 * [v8::internal::Script] (via host defined options) ----1--> [idSymbol]
 * [callbackReferrer] (via host_defined_option_symbol) ------2------^  |
 *                                 ^----------3---- (via WeakMap)------
 * 1+3 makes sure that as long as import() can still be initiated, the
 * referrer wrap is still around and can be passed into the callbacks.
 * 2 is only there so that we can get the id symbol to configure the
 * weak map.
 * @param {Referrer} referrer The referrer to
 *   get the id symbol from. This is different from callbackReferrer which
 *   could be set by the caller.
 * @param {ModuleRegistry} registry
 */
function registerModule(referrer, registry) {
  var idSymbol = referrer[host_defined_option_symbol];
  if (idSymbol === vm_dynamic_import_no_callback || idSymbol === vm_dynamic_import_missing_flag || idSymbol === vm_dynamic_import_main_context_default || idSymbol === vm_dynamic_import_default_internal) {
    // The referrer is compiled without custom callbacks, so there is
    // no registry to hold on to. We'll throw
    // ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING when a callback is
    // needed.
    return;
  }
  // To prevent it from being GC'ed.
  registry.callbackReferrer ??= referrer;
  moduleRegistries.set(idSymbol, registry);
}

/**
 * Initializes the `import.meta` object for a given module. This is only called when the module
 * is compiled with custom callbacks. Ordinary user-land source text modules are
 * initialized by the native DefaultImportMetaObjectInitializer directly.
 * @param {symbol} symbol - Reference to the module.
 * @param {Record<string, string | Function>} meta - The import.meta object to initialize.
 * @param {ModuleWrap} wrap - The ModuleWrap of the SourceTextModule where `import.meta` is referenced.
 */
function initializeImportMetaObject(symbol, meta, wrap) {
  var data = moduleRegistries.get(symbol);
  assert(data, `import.meta registry not found for ${wrap.url}`);
  var {
    initializeImportMeta,
    callbackReferrer
  } = data;
  if (initializeImportMeta !== undefined) {
    meta = initializeImportMeta(meta, callbackReferrer);
  }
}

/**
 * Proxy the dynamic import handling to the default loader for source text modules.
 * @param {string} specifier - The module specifier string.
 * @param {number} phase - The module import phase.
 * @param {Record<string, string>} attributes - The import attributes object.
 * @param {string|null|undefined} referrerName - name of the referrer.
 * @returns {Promise<import('internal/modules/esm/loader.js').ModuleExports>} - The imported module object.
 */
function defaultImportModuleDynamicallyForModule(specifier, phase, attributes, referrerName) {
  var cascadedLoader = require('internal/modules/esm/loader').getOrInitializeCascadedLoader();
  return cascadedLoader.import(specifier, referrerName, attributes, phase);
}

/**
 * Proxy the dynamic import to the default loader for classic scripts.
 * @param {string} specifier - The module specifier string.
 * @param {number} phase - The module import phase.
 * @param {Record<string, string>} attributes - The import attributes object.
 * @param {string|null|undefined} referrerName - name of the referrer.
 * @returns {Promise<import('internal/modules/esm/loader.js').ModuleExports>} - The imported module object.
 */
function defaultImportModuleDynamicallyForScript(specifier, phase, attributes, referrerName) {
  var parentURL = normalizeReferrerURL(referrerName);
  var cascadedLoader = require('internal/modules/esm/loader').getOrInitializeCascadedLoader();
  return cascadedLoader.import(specifier, parentURL, attributes, phase);
}

/**
 * Loads the built-in and wraps it in a ModuleWrap for embedder ESM.
 * @param {string} specifier
 * @returns {ModuleWrap}
 */
function getBuiltinModuleWrapForEmbedder(specifier) {
  return loadBuiltinModuleForEmbedder(specifier).getESMFacade();
}

/**
 * Get the built-in module dynamically for embedder ESM.
 * @param {string} specifier - The module specifier string.
 * @param {number} phase - The module import phase. Ignored for now.
 * @param {Record<string, string>} attributes - The import attributes object. Ignored for now.
 * @param {string|null|undefined} referrerName - name of the referrer.
 * @returns {import('internal/modules/esm/loader.js').ModuleExports} - The imported module object.
 */
function importModuleDynamicallyForEmbedder(specifier, phase, attributes, referrerName) {
  // Ignore phase and attributes for embedder ESM for now, because this only supports loading builtins.
  return getBuiltinModuleWrapForEmbedder(specifier).getNamespace();
}
var _shouldSpawnLoaderHookWorker = true;
/**
 * Initializes handling of ES modules.
 * @param {boolean} [shouldSpawnLoaderHookWorker] Whether the custom loader worker
 *   should be spawned later.
 */
function initializeESM() {
  var shouldSpawnLoaderHookWorker = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  _shouldSpawnLoaderHookWorker = shouldSpawnLoaderHookWorker;
  initializeDefaultConditions();
  // Setup per-realm callbacks that locate data or callbacks that we keep
  // track of for different ESM modules.
  setInitializeImportMetaObjectCallback(initializeImportMetaObject);
  setImportModuleDynamicallyCallback(importModuleDynamicallyCallback);
}

/**
 * Determine whether the custom loader worker should be spawned when initializing
 * the singleton ESM loader.
 * @returns {boolean}
 */
function shouldSpawnLoaderHookWorker() {
  return _shouldSpawnLoaderHookWorker;
}
var SourceTextModuleTypes = {
  kInternal: 'internal',
  // TODO(joyeecheung): support internal ESM.
  kEmbedder: 'embedder',
  // Embedder ESM, also used by SEA
  kUser: 'user',
  // User-land ESM
  kFacade: 'facade' // Currently only used by the facade that proxies WASM module import/exports.
};

/**
 * Compile a SourceTextModule for the built-in ESM loader. Register it for default
 * source map and import.meta and dynamic import() handling if cascadedLoader is provided.
 * @param {string} url URL of the module.
 * @param {string} source Source code of the module.
 * @param {string} type Type of the source text module, one of SourceTextModuleTypes.
 * @param {{ isMain?: boolean }|undefined} context - context object containing module metadata.
 * @returns {ModuleWrap}
 */
function compileSourceTextModule(url, source, type) {
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : kEmptyObject;
  var hostDefinedOptions;
  switch (type) {
    case SourceTextModuleTypes.kFacade:
    case SourceTextModuleTypes.kInternal:
      hostDefinedOptions = undefined;
      break;
    case SourceTextModuleTypes.kEmbedder:
      hostDefinedOptions = embedder_module_hdo;
      break;
    case SourceTextModuleTypes.kUser:
      hostDefinedOptions = source_text_module_default_hdo;
      break;
    default:
      assert.fail(`Unknown SourceTextModule type: ${type}`);
  }
  var wrap = new ModuleWrap(url, undefined, source, 0, 0, hostDefinedOptions);
  if (type === SourceTextModuleTypes.kFacade) {
    return wrap;
  }
  var {
    isMain
  } = context;
  if (isMain) {
    wrap.isMain = true;
  }

  // Cache the source map for the module if present.
  if (wrap.sourceMapURL) {
    maybeCacheSourceMap(url, source, wrap, false, wrap.sourceURL, wrap.sourceMapURL);
  }
  if (type === SourceTextModuleTypes.kEmbedder) {
    // For embedder ESM, we also handle the linking and evaluation.
    var requests = wrap.getModuleRequests();
    var modules = requests.map(_ref => {
      var {
        specifier
      } = _ref;
      return getBuiltinModuleWrapForEmbedder(specifier);
    });
    wrap.link(modules);
    wrap.instantiate();
    wrap.evaluate(-1, false);
  }
  return wrap;
}
var kImportInImportedESM = _Symbol('kImportInImportedESM');
var kImportInRequiredESM = _Symbol('kImportInRequiredESM');
var kRequireInImportedCJS = _Symbol('kRequireInImportedCJS');

/**
 * @typedef {kImportInImportedESM | kImportInRequiredESM | kRequireInImportedCJS} ModuleRequestType
 */
var requestTypes = {
  kImportInImportedESM,
  kImportInRequiredESM,
  kRequireInImportedCJS
};
module.exports = {
  embedder_module_hdo,
  registerModule,
  initializeESM,
  getDefaultConditions,
  getConditionsSet,
  shouldSpawnLoaderHookWorker,
  compileSourceTextModule,
  SourceTextModuleTypes,
  requestTypes
};

