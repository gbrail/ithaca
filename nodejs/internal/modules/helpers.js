'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  ArrayPrototypeForEach,
  ObjectDefineProperty,
  ObjectFreeze,
  ObjectPrototypeHasOwnProperty,
  SafeMap,
  SafeSet,
  StringPrototypeCharCodeAt,
  StringPrototypeIncludes,
  StringPrototypeSlice,
  StringPrototypeStartsWith
} = primordials;
var {
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_RETURN_PROPERTY_VALUE,
  ERR_UNKNOWN_BUILTIN_MODULE
} = require('internal/errors').codes;
var {
  BuiltinModule
} = require('internal/bootstrap/realm');
var {
  validateString
} = require('internal/validators');
var fs = require('fs'); // Import all of `fs` so that it can be monkey-patched.
var internalFS = require('internal/fs/utils');
var path = require('path');
var {
  pathToFileURL,
  fileURLToPath,
  URL
} = require('internal/url');
var assert = require('internal/assert');
var {
  getOptionValue
} = require('internal/options');
var {
  setOwnProperty,
  getLazy
} = require('internal/util');
var {
  inspect
} = require('internal/util/inspect');
var {
  emitWarningSync
} = require('internal/process/warning');
var lazyTmpdir = getLazy(() => require('os').tmpdir());
var {
  join
} = path;
var {
  canParse: URLCanParse
} = internalBinding('url');
var {
  enableCompileCache: _enableCompileCache,
  getCompileCacheDir: _getCompileCacheDir,
  compileCacheStatus: _compileCacheStatus,
  flushCompileCache
} = internalBinding('modules');
var lazyCJSLoader = getLazy(() => require('internal/modules/cjs/loader'));
var debug = require('internal/util/debuglog').debuglog('module', fn => {
  debug = fn;
});

/** @typedef {import('internal/modules/cjs/loader.js').Module} Module */

/**
 * Cache for storing resolved real paths of modules.
 * In order to minimize unnecessary lstat() calls, this cache is a list of known-real paths.
 * Set to an empty Map to reset.
 * @type {Map<string, string>}
 */
var realpathCache = new SafeMap();
/**
 * Resolves the path of a given `require` specifier, following symlinks.
 * @param {string} requestPath The `require` specifier
 * @returns {string}
 */
function toRealPath(requestPath) {
  return fs.realpathSync(requestPath, {
    [internalFS.realpathCacheKey]: realpathCache
  });
}

/** @type {Set<string>} */
var cjsConditions;
/** @type {string[]} */
var cjsConditionsArray;

/**
 * Define the conditions that apply to the CommonJS loader.
 * @returns {void}
 */
function initializeCjsConditions() {
  var userConditions = getOptionValue('--conditions');
  var noAddons = getOptionValue('--no-addons');
  var addonConditions = noAddons ? [] : ['node-addons'];
  // TODO: Use this set when resolving pkg#exports conditions in loader.js.
  cjsConditionsArray = ['require', 'node'].concat(addonConditions, _toConsumableArray(userConditions));
  if (getOptionValue('--require-module')) {
    cjsConditionsArray.push('module-sync');
  }
  ObjectFreeze(cjsConditionsArray);
  cjsConditions = new SafeSet(cjsConditionsArray);
}

/**
 * Get the conditions that apply to the CommonJS loader.
 * @returns {Set<string>}
 */
function getCjsConditions() {
  if (cjsConditions === undefined) {
    initializeCjsConditions();
  }
  return cjsConditions;
}
function getCjsConditionsArray() {
  if (cjsConditionsArray === undefined) {
    initializeCjsConditions();
  }
  return cjsConditionsArray;
}

/**
 * Provide one of Node.js' public modules to user code.
 * @param {string} id - The identifier/specifier of the builtin module to load
 * @returns {object|undefined}
 */
function loadBuiltinModule(id) {
  if (!BuiltinModule.canBeRequiredByUsers(id)) {
    return;
  }
  /** @type {import('internal/bootstrap/realm.js').BuiltinModule} */
  var mod = BuiltinModule.map.get(id);
  debug('load built-in module %s', id);
  // compileForPublicLoader() throws if canBeRequiredByUsers is false:
  mod.compileForPublicLoader();
  return mod;
}
var isSEABuiltinWarningNeeded_;
function isSEABuiltinWarningNeeded() {
  if (isSEABuiltinWarningNeeded_ === undefined) {
    var {
      isExperimentalSeaWarningNeeded,
      isSea
    } = internalBinding('sea');
    isSEABuiltinWarningNeeded_ = isSea() && isExperimentalSeaWarningNeeded();
  }
  return isSEABuiltinWarningNeeded_;
}
var warnedAboutBuiltins = false;
/**
 * Helpers to load built-in modules for embedder modules.
 * @param {string} id
 * @returns {import('internal/bootstrap/realm.js').BuiltinModule}
 */
function loadBuiltinModuleForEmbedder(id) {
  var normalized = BuiltinModule.normalizeRequirableId(id);
  if (normalized) {
    var mod = loadBuiltinModule(normalized);
    if (mod) {
      return mod;
    }
  }
  if (isSEABuiltinWarningNeeded() && !warnedAboutBuiltins) {
    emitWarningSync('Currently the require() provided to the main script embedded into ' + 'single-executable applications only supports loading built-in modules.\n' + 'To load a module from disk after the single executable application is ' + 'launched, use require("module").createRequire().\n' + 'Support for bundled module loading or virtual file systems are under ' + 'discussions in https://github.com/nodejs/single-executable');
    warnedAboutBuiltins = true;
  }
  throw new ERR_UNKNOWN_BUILTIN_MODULE(id);
}

/** @type {Module} */
var $Module = null;
/**
 * Import the Module class on first use.
 * @returns {object}
 */
function lazyModule() {
  return $Module ??= require('internal/modules/cjs/loader').Module;
}

/**
 * Create the module-scoped `require` function to pass into CommonJS modules.
 * @param {Module} mod - The module to create the `require` function for.
 * @returns {function(string): unknown}
 */
function makeRequireFunction(mod) {
  // lazy due to cycle
  var Module = lazyModule();
  if (mod instanceof Module !== true) {
    throw new ERR_INVALID_ARG_TYPE('mod', 'Module', mod);
  }
  function require(path) {
    return mod.require(path);
  }

  /**
   * The `resolve` method that gets attached to module-scope `require`.
   * @param {string} request
   * @param {Parameters<Module['_resolveFilename']>[3]} options
   * @returns {string}
   */
  function resolve(request, options) {
    validateString(request, 'request');
    var {
      resolveForCJSWithHooks
    } = lazyCJSLoader();
    // require.resolve() has different behaviors from the internal resolution used by
    // Module._load:
    // 1. When the request resolves to a non-existent built-in, it throws MODULE_NOT_FOUND
    //   instead of UNKNOWN_BUILTIN_MODULE. This is handled by resolveForCJSWithHooks.
    // 2. If the request is a prefixed built-in, the returned value is also prefixed. This
    //   is handled below.
    var {
      filename,
      url
    } = resolveForCJSWithHooks(request, mod, /* isMain */false, {
      __proto__: null,
      shouldSkipModuleHooks: false,
      requireResolveOptions: options ?? {}
    });
    if (url === request && StringPrototypeStartsWith(request, 'node:')) {
      return url;
    }
    return filename;
  }
  require.resolve = resolve;

  /**
   * The `paths` method that gets attached to module-scope `require`.
   * @param {string} request
   * @returns {object}
   */
  function paths(request) {
    validateString(request, 'request');
    return Module._resolveLookupPaths(request, mod);
  }
  resolve.paths = paths;
  setOwnProperty(require, 'main', process.mainModule);

  // Enable support to add extra extension types.
  require.extensions = Module._extensions;
  require.cache = Module._cache;
  return require;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 * @param {string} content
 * @returns {string}
 */
function stripBOM(content) {
  if (StringPrototypeCharCodeAt(content) === 0xFEFF) {
    content = StringPrototypeSlice(content, 1);
  }
  return content;
}

/**
 * Add built-in modules to a global or REPL scope object.
 * @param {Record<string, unknown>} object - The object such as `globalThis` to add the built-in modules to.
 * @param {string} dummyModuleName - The label representing the set of built-in modules to add.
 */
function addBuiltinLibsToObject(object, dummyModuleName) {
  // Make built-in modules available directly (loaded lazily).
  var Module = require('internal/modules/cjs/loader').Module;
  var {
    builtinModules
  } = Module;

  // To require built-in modules in user-land and ignore modules whose
  // `canBeRequiredByUsers` is false. So we create a dummy module object and not
  // use `require()` directly.
  var dummyModule = new Module(dummyModuleName);
  ArrayPrototypeForEach(builtinModules, name => {
    // Neither add underscored modules, nor ones that contain slashes (e.g.,
    // 'fs/promises') or ones that are already defined.
    if (name[0] === '_' || StringPrototypeIncludes(name, '/') || ObjectPrototypeHasOwnProperty(object, name)) {
      return;
    }
    // Goals of this mechanism are:
    // - Lazy loading of built-in modules
    // - Having all built-in modules available as non-enumerable properties
    // - Allowing the user to re-assign these variables as if there were no
    //   pre-existing globals with the same name.

    var setReal = val => {
      // Deleting the property before re-assigning it disables the
      // getter/setter mechanism.
      delete object[name];
      object[name] = val;
    };
    ObjectDefineProperty(object, name, {
      __proto__: null,
      get: () => {
        var lib = dummyModule.require(name);
        try {
          // Override the current getter/setter and set up a new
          // non-enumerable property.
          ObjectDefineProperty(object, name, {
            __proto__: null,
            get: () => lib,
            set: setReal,
            configurable: true,
            enumerable: false
          });
        } catch {
          // If the property is no longer configurable, ignore the error.
        }
        return lib;
      },
      set: setReal,
      configurable: true,
      enumerable: false
    });
  });
}

/**
 * Normalize the referrer name as a URL.
 * If it's a string containing an absolute path or a URL it's normalized as
 * a URL string.
 * Otherwise it's returned as undefined.
 * @param {string | null | undefined} referrerName
 * @returns {string | undefined}
 */
function normalizeReferrerURL(referrerName) {
  if (referrerName === null || referrerName === undefined) {
    return undefined;
  }
  if (typeof referrerName === 'string') {
    if (path.isAbsolute(referrerName)) {
      return pathToFileURL(referrerName).href;
    }
    if (StringPrototypeStartsWith(referrerName, 'file://') || URLCanParse(referrerName)) {
      return referrerName;
    }
    return undefined;
  }
  assert.fail('Unreachable code reached by ' + inspect(referrerName));
}

/**
 * Coerce a URL string to a filename. This is used by the ESM loader
 * to map ESM URLs to entries in the CJS module cache on a best-effort basis.
 * TODO(joyeecheung): this can be rather expensive, cache the result on the
 * ModuleWrap wherever we can.
 * @param {string|undefined} url URL to convert to filename
 * @returns {string|undefined}
 */
function urlToFilename(url) {
  if (url && StringPrototypeStartsWith(url, 'file://')) {
    var urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      // Not a proper URL, return as-is as the cache key.
      return url;
    }
    try {
      return fileURLToPath(urlObj);
    } catch {
      // This is generally only possible when the URL is provided by a custom loader.
      // Just use the path and ignore whether it's absolute or not as there's no such
      // requirement for CJS cache.
      return urlObj.pathname;
    }
  }
  // Not a file URL, return as-is.
  return url;
}

// Whether we have started executing any user-provided CJS code.
// This is set right before we call the wrapped CJS code (not after,
// in case we are half-way in the execution when internals check this).
// Used for internal assertions.
var _hasStartedUserCJSExecution = false;
// Similar to _hasStartedUserCJSExecution but for ESM. This is set
// right before ESM evaluation in the default ESM loader. We do not
// update this during vm SourceTextModule execution because at that point
// some user code must already have been run to execute code via vm
// there is little value checking whether any user JS code is run anyway.
var _hasStartedUserESMExecution = false;

/**
 * Load a public built-in module. ID may or may not be prefixed by `node:` and
 * will be normalized.
 * @param {string} id ID of the built-in to be loaded.
 * @returns {object|undefined} exports of the built-in. Undefined if the built-in
 *   does not exist.
 */
function getBuiltinModule(id) {
  validateString(id, 'id');
  var normalizedId = BuiltinModule.normalizeRequirableId(id);
  return normalizedId ? require(normalizedId) : undefined;
}

/** @type {import('internal/util/types')} */
var _TYPES = null;
/**
 * Lazily loads and returns the internal/util/types module.
 * @returns {object}
 */
function lazyTypes() {
  if (_TYPES !== null) {
    return _TYPES;
  }
  return _TYPES = require('internal/util/types');
}

/**
 * Asserts that the given body is a buffer source (either a string, array buffer, or typed array).
 * Throws an error if the body is not a buffer source.
 * @param {string | ArrayBufferView | ArrayBuffer} body - The body to check.
 * @param {boolean} allowString - Whether or not to allow a string as a valid buffer source.
 * @param {string} hookName - The name of the hook being called.
 * @throws {ERR_INVALID_RETURN_PROPERTY_VALUE} If the body is not a buffer source.
 * @returns {void}
 */
function assertBufferSource(body, allowString, hookName) {
  if (allowString && typeof body === 'string') {
    return;
  }
  var {
    isArrayBufferView,
    isAnyArrayBuffer
  } = lazyTypes();
  if (isArrayBufferView(body) || isAnyArrayBuffer(body)) {
    return;
  }
  throw new ERR_INVALID_RETURN_PROPERTY_VALUE(`${allowString ? 'string, ' : ''}array buffer, or typed array`, hookName, 'source', body);
}
var DECODER = null;

/**
 * Converts a buffer or buffer-like object to a string.
 * @param {string | ArrayBuffer | ArrayBufferView} body - The buffer or buffer-like object to convert to a string.
 * @returns {string} The resulting string.
 */
function stringify(body) {
  if (typeof body === 'string') {
    return body;
  }
  assertBufferSource(body, false, 'load');
  var {
    TextDecoder
  } = require('internal/encoding');
  DECODER = DECODER === null ? new TextDecoder() : DECODER;
  return DECODER.decode(body);
}

/**
 * Enable on-disk compiled cache for all user modules being compiled in the current Node.js instance
 * after this method is called.
 * This method accepts either:
 * - A string: path to the cache directory.
 * - An options object `{directory?: string, portable?: boolean}`:
 *   - `directory`: A string path to the cache directory.
 *   - `portable`: If `portable` is true, the cache directory will be considered relative.
 *     Defaults to `NODE_COMPILE_CACHE_PORTABLE === '1'`.
 * If cache directory is undefined, it defaults to the `NODE_COMPILE_CACHE` environment variable.
 * If `NODE_COMPILE_CACHE` isn't set, it defaults to `path.join(os.tmpdir(), 'node-compile-cache')`.
 * @param {string | { directory?: string, portable?: boolean } | undefined} options
 * @returns {{status: number, message?: string, directory?: string}}
 */
function enableCompileCache(options) {
  var portable;
  var directory;
  if (typeof options === 'object' && options !== null) {
    ({
      directory,
      portable
    } = options);
  } else {
    directory = options;
  }
  if (directory === undefined) {
    directory = process.env.NODE_COMPILE_CACHE || join(lazyTmpdir(), 'node-compile-cache');
  }
  if (portable === undefined) {
    portable = process.env.NODE_COMPILE_CACHE_PORTABLE === '1';
  }
  var nativeResult = _enableCompileCache(directory, portable);
  var result = {
    status: nativeResult[0]
  };
  if (nativeResult[1]) {
    result.message = nativeResult[1];
  }
  if (nativeResult[2]) {
    result.directory = nativeResult[2];
  }
  return result;
}
var compileCacheStatus = {
  __proto__: null
};
for (var i = 0; i < _compileCacheStatus.length; ++i) {
  compileCacheStatus[_compileCacheStatus[i]] = i;
}
ObjectFreeze(compileCacheStatus);
var constants = {
  __proto__: null,
  compileCacheStatus
};
ObjectFreeze(constants);

/**
 * Get the compile cache directory if on-disk compile cache is enabled.
 * @returns {string|undefined} Path to the module compile cache directory if it is enabled,
 *   or undefined otherwise.
 */
function getCompileCacheDir() {
  return _getCompileCacheDir() || undefined;
}
module.exports = {
  addBuiltinLibsToObject,
  assertBufferSource,
  constants,
  enableCompileCache,
  flushCompileCache,
  getBuiltinModule,
  getCjsConditions,
  getCjsConditionsArray,
  getCompileCacheDir,
  initializeCjsConditions,
  loadBuiltinModuleForEmbedder,
  loadBuiltinModule,
  makeRequireFunction,
  normalizeReferrerURL,
  stringify,
  stripBOM,
  toRealPath,
  hasStartedUserCJSExecution() {
    return _hasStartedUserCJSExecution;
  },
  setHasStartedUserCJSExecution() {
    _hasStartedUserCJSExecution = true;
  },
  hasStartedUserESMExecution() {
    return _hasStartedUserESMExecution;
  },
  setHasStartedUserESMExecution() {
    _hasStartedUserESMExecution = true;
  },
  urlToFilename
};

