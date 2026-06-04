'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypeFindIndex,
  ArrayPrototypePush,
  ArrayPrototypeSplice,
  ObjectAssign,
  ObjectFreeze,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
  Symbol: _Symbol
} = primordials;
var {
  isAnyArrayBuffer,
  isArrayBufferView
} = require('internal/util/types');
var {
  BuiltinModule
} = require('internal/bootstrap/realm');
var {
  ERR_INVALID_RETURN_PROPERTY_VALUE
} = require('internal/errors').codes;
var {
  validateFunction
} = require('internal/validators');
var {
  isAbsolute
} = require('path');
var {
  pathToFileURL,
  fileURLToPath
} = require('internal/url');
var debug = require('internal/util/debuglog').debuglog('module_hooks', fn => {
  debug = fn;
});

/**
 * @typedef {import('internal/modules/cjs/loader.js').Module} Module
 * @typedef {((
 *   specifier: string,
 *   context: Partial<ModuleResolveContext>,
 * ) => ModuleResolveResult)
 * } NextResolve
 * @typedef {((
 *   specifier: string,
 *   context: ModuleResolveContext,
 *   nextResolve: NextResolve,
 * ) => ModuleResolveResult)
 * } ResolveHook
 * @typedef {((
 *   url: string,
 *   context: Partial<ModuleLoadContext>,
 * ) => ModuleLoadResult)
 * } NextLoad
 * @typedef {((
 *   url: string,
 *   context: ModuleLoadContext,
 *   nextLoad: NextLoad,
 * ) => ModuleLoadResult)
 * } LoadHook
 */

// Use arrays for better insertion and iteration performance, we don't care
// about deletion performance as much.

/** @type {ResolveHook[]} */
var resolveHooks = [];
/** @type {LoadHook[]} */
var loadHooks = [];
var hookId = _Symbol('kModuleHooksIdKey');
var nextHookId = 0;
var ModuleHooks = /*#__PURE__*/function () {
  /**
   * @param {ResolveHook|undefined} resolve User-provided hook.
   * @param {LoadHook|undefined} load User-provided hook.
   */
  function ModuleHooks(resolve, load) {
    _classCallCheck(this, ModuleHooks);
    this[hookId] = _Symbol(`module-hook-${nextHookId++}`);
    // Always initialize all hooks, if it's unspecified it'll be an owned undefined.
    this.resolve = resolve;
    this.load = load;
    if (resolve) {
      ArrayPrototypePush(resolveHooks, this);
    }
    if (load) {
      ArrayPrototypePush(loadHooks, this);
    }
    ObjectFreeze(this);
  }
  // TODO(joyeecheung): we may want methods that allow disabling/enabling temporarily
  // which just sets the item in the array to undefined temporarily.
  // TODO(joyeecheung): this can be the [Symbol.dispose] implementation to pair with
  // `using` when the explicit resource management proposal is shipped by V8.
  /**
   * Deregister the hook instance.
   */
  return _createClass(ModuleHooks, [{
    key: "deregister",
    value: function deregister() {
      var id = this[hookId];
      var index = ArrayPrototypeFindIndex(resolveHooks, hook => hook[hookId] === id);
      if (index !== -1) {
        ArrayPrototypeSplice(resolveHooks, index, 1);
      }
      index = ArrayPrototypeFindIndex(loadHooks, hook => hook[hookId] === id);
      if (index !== -1) {
        ArrayPrototypeSplice(loadHooks, index, 1);
      }
    }
  }]);
}();
;

/**
 * TODO(joyeecheung): taken an optional description?
 * @param {{ resolve?: ResolveHook, load?: LoadHook }} hooks User-provided hooks
 * @returns {ModuleHooks}
 */
function registerHooks(hooks) {
  var {
    resolve,
    load
  } = hooks;
  if (resolve) {
    validateFunction(resolve, 'hooks.resolve');
  }
  if (load) {
    validateFunction(load, 'hooks.load');
  }
  return new ModuleHooks(resolve, load);
}

/**
 * @param {string} filename
 * @returns {string}
 */
function convertCJSFilenameToURL(filename) {
  if (!filename) {
    return filename;
  }
  var normalizedId = filename;
  if (StringPrototypeStartsWith(filename, 'node:')) {
    normalizedId = StringPrototypeSlice(filename, 5);
  }
  if (BuiltinModule.canBeRequiredByUsers(normalizedId)) {
    return `node:${normalizedId}`;
  }
  // Handle the case where filename is neither a path, nor a built-in id,
  // which is possible via monkey-patching.
  if (isAbsolute(filename)) {
    return pathToFileURL(filename).href;
  }
  return filename;
}

/**
 * @param {string} url
 * @returns {string}
 */
function convertURLToCJSFilename(url) {
  if (!url) {
    return url;
  }
  var builtinId = BuiltinModule.normalizeRequirableId(url);
  if (builtinId) {
    return builtinId;
  }
  if (StringPrototypeStartsWith(url, 'file://')) {
    return fileURLToPath(url);
  }
  return url;
}

/**
 * Convert a list of hooks into a function that can be used to do an operation through
 * a chain of hooks. If any of the hook returns without calling the next hook, it
 * must return shortCircuit: true to stop the chain from continuing to avoid
 * forgetting to invoke the next hook by mistake.
 * @param {ModuleHooks[]} hooks A list of hooks whose last argument is `nextHook`.
 * @param {'load'|'resolve'} name Name of the hook in ModuleHooks.
 * @param {Function} defaultStep The default step in the chain.
 * @param {Function} validate A function that validates and sanitize the result returned by the chain.
 * @param {object} mergedContext
 * @returns {any}
 */
function buildHooks(hooks, name, defaultStep, validate, mergedContext) {
  var lastRunIndex = hooks.length;
  /**
   * Helper function to wrap around invocation of user hook or the default step
   * in order to fill in missing arguments or check returned results.
   * Due to the merging of the context, this must be a closure.
   * @param {number} index Index in the chain. Default step is 0, last added hook is 1,
   *   and so on.
   * @param {Function} userHookOrDefault Either the user hook or the default step to invoke.
   * @param {Function|undefined} next The next wrapped step. If this is the default step, it's undefined.
   * @returns {Function} Wrapped hook or default step.
   */
  function wrapHook(index, userHookOrDefault, next) {
    return function nextStep(arg0, context) {
      lastRunIndex = index;
      if (context && context !== mergedContext) {
        ObjectAssign(mergedContext, context);
      }
      var hookResult = userHookOrDefault(arg0, mergedContext, next);
      if (lastRunIndex > 0 && lastRunIndex === index && !hookResult.shortCircuit) {
        throw new ERR_INVALID_RETURN_PROPERTY_VALUE('true', name, 'shortCircuit', hookResult.shortCircuit);
      }
      return validate(arg0, mergedContext, hookResult);
    };
  }
  var chain = [wrapHook(0, defaultStep)];
  for (var i = 0; i < hooks.length; ++i) {
    var wrappedHook = wrapHook(i + 1, hooks[i][name], chain[i]);
    ArrayPrototypePush(chain, wrappedHook);
  }
  return chain[chain.length - 1];
}

/**
 * @typedef {object} ModuleResolveResult
 * @property {string} url Resolved URL of the module.
 * @property {string|undefined} format Format of the module.
 * @property {ImportAttributes|undefined} importAttributes Import attributes for the request.
 * @property {boolean|undefined} shortCircuit Whether the next hook has been skipped.
 */

/**
 * Validate the result returned by a chain of resolve hook.
 * @param {string} specifier Specifier passed into the hooks.
 * @param {ModuleResolveContext} context Context passed into the hooks.
 * @param {ModuleResolveResult} result Result produced by resolve hooks.
 * @returns {ModuleResolveResult}
 */
function validateResolve(specifier, context, result) {
  var {
    url,
    format,
    importAttributes
  } = result;
  if (typeof url !== 'string') {
    throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a URL string', 'resolve', 'url', url);
  }
  if (format && typeof format !== 'string') {
    throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a string', 'resolve', 'format', format);
  }
  if (importAttributes && typeof importAttributes !== 'object') {
    throw new ERR_INVALID_RETURN_PROPERTY_VALUE('an object', 'resolve', 'importAttributes', importAttributes);
  }
  return {
    __proto__: null,
    url,
    format,
    importAttributes
  };
}

/**
 * @typedef {object} ModuleLoadResult
 * @property {string|undefined} format Format of the loaded module.
 * @property {string|ArrayBuffer|TypedArray} source Source code of the module.
 * @property {boolean|undefined} shortCircuit Whether the next hook has been skipped.
 */

/**
 * Validate the result returned by a chain of load hook.
 * @param {string} url URL passed into the hooks.
 * @param {ModuleLoadContext} context Context passed into the hooks.
 * @param {ModuleLoadResult} result Result produced by load hooks.
 * @returns {ModuleLoadResult}
 */
function validateLoadStrict(url, context, result) {
  validateSourceStrict(url, context, result);
  validateFormat(url, context, result);
  return result;
}
function validateLoadSloppy(url, context, result) {
  validateSourcePermissive(url, context, result);
  validateFormat(url, context, result);
  return result;
}
function validateSourceStrict(url, context, result) {
  var {
    source,
    format
  } = result;
  // To align with module.register(), the load hooks are still invoked for
  // the builtins even though the default load step only provides null as source,
  // and any source content for builtins provided by the user hooks are ignored.
  if (!StringPrototypeStartsWith(url, 'node:') && typeof result.source !== 'string' && !isAnyArrayBuffer(source) && !isArrayBufferView(source) && format !== 'addon') {
    throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a string, an ArrayBuffer, or a TypedArray', 'load', 'source', source);
  }
}
function validateSourcePermissive(url, context, result) {
  var {
    source,
    format
  } = result;
  if (format === 'commonjs' && source == null) {
    // Accommodate the quirk in defaultLoad used by asynchronous loader hooks
    // which sets source to null for commonjs.
    // See: https://github.com/nodejs/node/issues/57327#issuecomment-2701382020
    return;
  }
  validateSourceStrict(url, context, result);
}
function validateFormat(url, context, result) {
  var {
    format
  } = result;
  if (typeof format !== 'string' && format !== undefined) {
    throw new ERR_INVALID_RETURN_PROPERTY_VALUE('a string', 'load', 'format', format);
  }
}
var ModuleResolveContext = /*#__PURE__*/_createClass(
/**
 * Context for the resolve hook.
 * @param {string|undefined} parentURL Parent URL.
 * @param {ImportAttributes|undefined} importAttributes Import attributes.
 * @param {string[]} conditions Conditions.
 */
function ModuleResolveContext(parentURL, importAttributes, conditions) {
  _classCallCheck(this, ModuleResolveContext);
  this.parentURL = parentURL;
  this.importAttributes = importAttributes;
  this.conditions = conditions;
  // TODO(joyeecheung): a field to differentiate between require and import?
});
;
var ModuleLoadContext = /*#__PURE__*/_createClass(
/**
 * Context for the load hook.
 * @param {string|undefined} format URL.
 * @param {ImportAttributes|undefined} importAttributes Import attributes.
 * @param {string[]} conditions Conditions.
 */
function ModuleLoadContext(format, importAttributes, conditions) {
  _classCallCheck(this, ModuleLoadContext);
  this.format = format;
  this.importAttributes = importAttributes;
  this.conditions = conditions;
});
;
var decoder;
/**
 * Load module source for a url, through a hooks chain if it exists.
 * @param {string} url
 * @param {string|undefined} originalFormat
 * @param {ImportAttributes|undefined} importAttributes
 * @param {string[]} conditions
 * @param {(url: string, context: ModuleLoadContext) => ModuleLoadResult} defaultLoad
 * @param {(url: string, context: ModuleLoadContext, result: ModuleLoadResult) => ModuleLoadResult} validateLoad
 * @returns {ModuleLoadResult}
 */
function loadWithHooks(url, originalFormat, importAttributes, conditions, defaultLoad, validateLoad) {
  debug('loadWithHooks', url, originalFormat);
  var context = new ModuleLoadContext(originalFormat, importAttributes, conditions);
  if (loadHooks.length === 0) {
    return defaultLoad(url, context);
  }
  var runner = buildHooks(loadHooks, 'load', defaultLoad, validateLoad, context);
  var result = runner(url, context);
  var {
    source,
    format
  } = result;
  if (!isAnyArrayBuffer(source) && !isArrayBufferView(source)) {
    return result;
  }
  switch (format) {
    // Text formats:
    case undefined:
    case 'module':
    case 'commonjs':
    case 'json':
    case 'module-typescript':
    case 'commonjs-typescript':
    case 'typescript':
      {
        decoder ??= new (require('internal/encoding').TextDecoder)();
        result.source = decoder.decode(source);
        break;
      }
    default:
      break;
  }
  return result;
}

/**
 * Resolve module request to a url, through a hooks chain if it exists.
 * @param {string} specifier
 * @param {string|undefined} parentURL
 * @param {ImportAttributes|undefined} importAttributes
 * @param {string[]} conditions
 * @param {(specifier: string, context: ModuleResolveContext) => ModuleResolveResult} defaultResolve
 * @returns {ModuleResolveResult}
 */
function resolveWithHooks(specifier, parentURL, importAttributes, conditions, defaultResolve) {
  debug('resolveWithHooks', specifier, parentURL, importAttributes);
  var context = new ModuleResolveContext(parentURL, importAttributes, conditions);
  if (resolveHooks.length === 0) {
    return defaultResolve(specifier, context);
  }
  var runner = buildHooks(resolveHooks, 'resolve', defaultResolve, validateResolve, context);
  return runner(specifier, context);
}
module.exports = {
  convertCJSFilenameToURL,
  convertURLToCJSFilename,
  loadHooks,
  loadWithHooks,
  registerHooks,
  resolveHooks,
  resolveWithHooks,
  validateLoadStrict,
  validateLoadSloppy
};

