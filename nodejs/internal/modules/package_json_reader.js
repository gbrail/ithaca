'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayIsArray,
  JSONParse,
  ObjectDefineProperty,
  RegExpPrototypeExec,
  SafeMap,
  StringPrototypeIndexOf,
  StringPrototypeSlice
} = primordials;
var {
  fileURLToPath,
  isURL,
  pathToFileURL,
  URL
} = require('internal/url');
var {
  canParse: URLCanParse
} = internalBinding('url');
var {
  codes: {
    ERR_INVALID_MODULE_SPECIFIER,
    ERR_MISSING_ARGS,
    ERR_MODULE_NOT_FOUND
  }
} = require('internal/errors');
var {
  kEmptyObject
} = require('internal/util');
var modulesBinding = internalBinding('modules');
var path = require('path');
var {
  validateString
} = require('internal/validators');
var internalFsBinding = internalBinding('fs');

/**
 * @typedef {import('typings/internalBinding/modules').DeserializedPackageConfig} DeserializedPackageConfig
 * @typedef {import('typings/internalBinding/modules').PackageConfig} PackageConfig
 * @typedef {import('typings/internalBinding/modules').SerializedPackageConfig} SerializedPackageConfig
 */

/**
 * @param {URL['pathname']} path
 * @param {SerializedPackageConfig} contents
 * @returns {DeserializedPackageConfig}
 */
function deserializePackageJSON(path, contents) {
  if (contents === undefined) {
    return {
      data: {
        __proto__: null,
        type: 'none' // Ignore unknown types for forwards compatibility
      },
      exists: false,
      path
    };
  }
  var {
    0: name,
    1: main,
    2: type,
    3: plainImports,
    4: plainExports,
    5: optionalFilePath
  } = contents;
  var pjsonPath = optionalFilePath ?? path;
  var data = _objectSpread(_objectSpread(_objectSpread({
    __proto__: null
  }, name != null && {
    name
  }), main != null && {
    main
  }), type != null && {
    type
  });
  if (plainExports !== null) {
    ObjectDefineProperty(data, 'exports', {
      __proto__: null,
      configurable: true,
      enumerable: true,
      get() {
        var value = requiresJSONParse(plainExports) ? JSONParse(plainExports) : plainExports;
        ObjectDefineProperty(data, 'exports', {
          __proto__: null,
          enumerable: true,
          value
        });
        return value;
      }
    });
  }
  if (plainImports !== null) {
    ObjectDefineProperty(data, 'imports', {
      __proto__: null,
      configurable: true,
      enumerable: true,
      get() {
        var value = requiresJSONParse(plainImports) ? JSONParse(plainImports) : plainImports;
        ObjectDefineProperty(data, 'imports', {
          __proto__: null,
          enumerable: true,
          value
        });
        return value;
      }
    });
  }
  return {
    data,
    exists: true,
    path: pjsonPath
  };
}

// The imports and exports fields can be either undefined or a string.
// - If it's a string, it's either plain string or a stringified JSON string.
// - If it's a stringified JSON string, it starts with either '[' or '{'.
var requiresJSONParse = value => value !== undefined && (value[0] === '[' || value[0] === '{');

/**
 * Reads a package.json file and returns the parsed contents.
 * @param {string} jsonPath
 * @param {{
 *   base?: URL | string,
 *   specifier?: URL | string,
 *   isESM?: boolean,
 * }} options
 * @returns {PackageConfig}
 */
function read(jsonPath) {
  var {
    base,
    specifier,
    isESM
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  // This function will be called by both CJS and ESM, so we need to make sure
  // non-null attributes are converted to strings.
  var parsed = modulesBinding.readPackageJSON(jsonPath, isESM, base == null ? undefined : `${base}`, specifier == null ? undefined : `${specifier}`);
  var result = deserializePackageJSON(jsonPath, parsed);
  return _objectSpread(_objectSpread({
    __proto__: null
  }, result.data), {}, {
    exists: result.exists,
    pjsonPath: result.path
  });
}

/**
 * A cache mapping a module's path to its parent `package.json` file's path.
 * This is used in concert with `deserializedPackageJSONCache` to improve
 * the performance of `getNearestParentPackageJSON` when called repeatedly
 * on the same module paths.
 */
var moduleToParentPackageJSONCache = new SafeMap();

/**
 * A cache mapping the path of a `package.json` file to its
 * {@link DeserializedPackageConfig deserialized representation},
 * as produced by {@link deserializedPackageJSONCache}. The purpose of this
 * cache is to ensure that we always return the same
 * {@link DeserializedPackageConfig} instance for a given `package.json`,
 * which is necessary to ensure that we don't re-parse `imports` and
 * `exports` redundantly.
 */
var deserializedPackageJSONCache = new SafeMap();

/**
 * Get the nearest parent package.json file from a given path.
 * Return the package.json data and the path to the package.json file, or undefined.
 * @param {string} checkPath The path to start searching from.
 * @returns {undefined | DeserializedPackageConfig}
 */
function getNearestParentPackageJSON(checkPath) {
  var parentPackageJSONPath = moduleToParentPackageJSONCache.get(checkPath);
  if (parentPackageJSONPath !== undefined) {
    return deserializedPackageJSONCache.get(parentPackageJSONPath);
  }
  var result = modulesBinding.getNearestParentPackageJSON(checkPath);
  var packageConfig = deserializePackageJSON(checkPath, result);
  moduleToParentPackageJSONCache.set(checkPath, packageConfig.path);
  var maybeCachedPackageConfig = deserializedPackageJSONCache.get(packageConfig.path);
  if (maybeCachedPackageConfig !== undefined) {
    return maybeCachedPackageConfig;
  }
  deserializedPackageJSONCache.set(packageConfig.path, packageConfig);
  return packageConfig;
}

/**
 * Returns the package configuration for the given resolved URL.
 * @param {URL | string} resolved - The resolved URL.
 * @returns {import('typings/internalBinding/modules').PackageConfig} - The package configuration.
 */
function getPackageScopeConfig(resolved) {
  var result = modulesBinding.getPackageScopeConfig(`${resolved}`);
  if (ArrayIsArray(result)) {
    var {
      data,
      exists,
      path: _path
    } = deserializePackageJSON(`${resolved}`, result);
    return _objectSpread(_objectSpread({
      __proto__: null
    }, data), {}, {
      exists,
      pjsonPath: _path
    });
  }

  // This means that the response is a string
  // and it is the path to the package.json file
  return {
    __proto__: null,
    pjsonPath: result,
    exists: false,
    type: 'none'
  };
}

/**
 * Returns the package type for a given URL.
 * @param {URL} url - The URL to get the package type for.
 * @returns {string}
 */
function getPackageType(url) {
  var type = modulesBinding.getPackageType(`${url}`);
  return type ?? 'none';
}
var invalidPackageNameRegEx = /^\.|%|\\/;
/**
 * Parse a package name from a specifier.
 * @param {string} specifier - The import specifier.
 * @param {string | URL | undefined} base - The parent URL.
 * @returns {object}
 */
function parsePackageName(specifier, base) {
  var separatorIndex = StringPrototypeIndexOf(specifier, '/');
  var validPackageName = true;
  var isScoped = false;
  if (specifier[0] === '@') {
    isScoped = true;
    if (separatorIndex === -1 || specifier.length === 0) {
      validPackageName = false;
    } else {
      separatorIndex = StringPrototypeIndexOf(specifier, '/', separatorIndex + 1);
    }
  }
  var packageName = separatorIndex === -1 ? specifier : StringPrototypeSlice(specifier, 0, separatorIndex);

  // Package name cannot have leading . and cannot have percent-encoding or
  // \\ separators.
  if (RegExpPrototypeExec(invalidPackageNameRegEx, packageName) !== null) {
    validPackageName = false;
  }
  if (!validPackageName) {
    throw new ERR_INVALID_MODULE_SPECIFIER(specifier, 'is not a valid package name', fileURLToPath(base));
  }
  var packageSubpath = '.' + (separatorIndex === -1 ? '' : StringPrototypeSlice(specifier, separatorIndex));
  return {
    packageName,
    packageSubpath,
    isScoped
  };
}
function getPackageJSONURL(specifier, base) {
  var {
    packageName,
    packageSubpath,
    isScoped
  } = parsePackageName(specifier, base);

  // ResolveSelf
  var packageConfig = getPackageScopeConfig(base);
  if (packageConfig.exists) {
    if (packageConfig.exports != null && packageConfig.name === packageName) {
      var _packageJSONPath = packageConfig.pjsonPath;
      return {
        packageJSONUrl: pathToFileURL(_packageJSONPath),
        packageJSONPath: _packageJSONPath,
        packageSubpath
      };
    }
  }
  var packageJSONUrl = new URL(`./node_modules/${packageName}/package.json`, base);
  var packageJSONPath = fileURLToPath(packageJSONUrl);
  var lastPath;
  do {
    var stat = internalFsBinding.internalModuleStat(StringPrototypeSlice(packageJSONPath, 0, packageJSONPath.length - 13));
    // Check for !stat.isDirectory()
    if (stat !== 1) {
      lastPath = packageJSONPath;
      packageJSONUrl = new URL(`${isScoped ? '../' : ''}../../../node_modules/${packageName}/package.json`, packageJSONUrl);
      packageJSONPath = fileURLToPath(packageJSONUrl);
      continue;
    }

    // Package match.
    return {
      packageJSONUrl,
      packageJSONPath,
      packageSubpath
    };
  } while (packageJSONPath.length !== lastPath.length);
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
}

/** @type {import('./esm/resolve.js').defaultResolve} */
var defaultResolve;
/**
 * @param {string | URL} specifier The location for which to get the "root" package.json
 * @param {string | URL} [base] The location of the current module (ex file://tmp/foo.js).
 * @returns {string}
 */
function findPackageJSON(specifier) {
  var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'data:';
  if (arguments.length === 0) {
    throw new ERR_MISSING_ARGS('specifier');
  }
  try {
    specifier = `${specifier}`;
  } catch {
    validateString(specifier, 'specifier');
  }
  var parentURL = base;
  if (!isURL(base)) {
    validateString(base, 'base');
    parentURL = path.isAbsolute(base) ? pathToFileURL(base) : new URL(base);
  }
  if (specifier && specifier[0] !== '.' && specifier[0] !== '/' && !URLCanParse(specifier)) {
    // If `specifier` is a bare specifier.
    var {
      packageJSONPath
    } = getPackageJSONURL(specifier, parentURL);
    return packageJSONPath;
  }
  var resolvedTarget;
  defaultResolve ??= require('internal/modules/esm/resolve').defaultResolve;
  try {
    // TODO(@JakobJingleheimer): Detect whether findPackageJSON is being used within a loader
    // (possibly piggyback on `isForAsyncLoaderHookWorker` from the loader?) and if so:
    // - When inside, use the default resolve
    //   - (I think it's impossible to use the chain because of re-entry & a deadlock from atomics).
    // - When outside, use cascadedLoader.resolveSync (not implemented yet, but the pieces exist).
    resolvedTarget = defaultResolve(specifier, {
      parentURL: `${parentURL}`
    }).url;
  } catch (err) {
    if (err.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
      resolvedTarget = err.url;
    } else {
      throw err;
    }
  }
  var pkg = getNearestParentPackageJSON(fileURLToPath(resolvedTarget));
  return pkg?.path;
}
module.exports = {
  read,
  getNearestParentPackageJSON,
  getPackageScopeConfig,
  getPackageType,
  getPackageJSONURL,
  findPackageJSON
};

