'use strict';

var {
  ObjectPrototypeHasOwnProperty,
  RegExpPrototypeExec,
  SafeSet,
  StringPrototypeCharCodeAt,
  StringPrototypeIncludes,
  StringPrototypeSlice
} = primordials;
var {
  getOptionValue
} = require('internal/options');
var {
  getValidatedPath
} = require('internal/fs/utils');
var fsBindings = internalBinding('fs');
var {
  internal: internalConstants
} = internalBinding('constants');
var extensionFormatMap = {
  '__proto__': null,
  '.cjs': 'commonjs',
  '.js': 'module',
  '.json': 'json',
  '.mjs': 'module',
  '.wasm': 'wasm'
};
function initializeExtensionFormatMap() {
  if (getOptionValue('--experimental-addon-modules')) {
    extensionFormatMap['.node'] = 'addon';
  }
  if (getOptionValue('--strip-types')) {
    extensionFormatMap['.ts'] = 'module-typescript';
    extensionFormatMap['.mts'] = 'module-typescript';
    extensionFormatMap['.cts'] = 'commonjs-typescript';
  }
}

/**
 * @param {string} mime
 * @returns {string | null}
 */
function mimeToFormat(mime) {
  if (RegExpPrototypeExec(/^\s*(text|application)\/javascript\s*(;\s*charset=utf-?8\s*)?$/i, mime) !== null) {
    return 'module';
  }
  if (mime === 'application/json') {
    return 'json';
  }
  if (mime === 'application/wasm') {
    return 'wasm';
  }
  return null;
}

/**
 * For extensionless files in a `module` package scope, we check the file contents to disambiguate between ES module
 * JavaScript and Wasm.
 * We do this by taking advantage of the fact that all Wasm files start with the header `0x00 0x61 0x73 0x6d` (`_asm`).
 * @param {URL} url
 * @returns {'wasm'|'module'}
 */
function getFormatOfExtensionlessFile(url) {
  var path = getValidatedPath(url);
  switch (fsBindings.getFormatOfExtensionlessFile(path)) {
    case internalConstants.EXTENSIONLESS_FORMAT_WASM:
      return 'wasm';
    default:
      return 'module';
  }
}
var {
  containsModuleSyntax
} = internalBinding('contextify');
var {
  getPackageScopeConfig,
  getPackageType
} = require('internal/modules/package_json_reader');
var {
  fileURLToPath
} = require('internal/url');
var {
  ERR_UNKNOWN_FILE_EXTENSION
} = require('internal/errors').codes;
var protocolHandlers = {
  '__proto__': null,
  'data:': getDataProtocolModuleFormat,
  'file:': getFileProtocolModuleFormat,
  'node:'() {
    return 'builtin';
  }
};

/**
 * Determine whether the given ambiguous source contains CommonJS or ES module syntax.
 * @param {string | Buffer | undefined} [source]
 * @param {URL} url
 * @returns {'module'|'commonjs'}
 */
function detectModuleFormat(source, url) {
  var detectModule = getOptionValue('--experimental-detect-module');
  if (!source) {
    return detectModule ? null : 'commonjs';
  }
  if (!detectModule) {
    return 'commonjs';
  }
  return containsModuleSyntax(`${source}`, fileURLToPath(url), url) ? 'module' : 'commonjs';
}

/**
 * @param {URL} parsed
 * @returns {string | null}
 */
function getDataProtocolModuleFormat(parsed) {
  var {
    1: mime
  } = RegExpPrototypeExec(/^([^/]+\/[^;,]+)(?:[^,]*?)(;base64)?,/, parsed.pathname) || [null, null, null];
  return mimeToFormat(mime);
}
var DOT_CODE = 46;
var SLASH_CODE = 47;

/**
 * Returns the file extension from a URL. Should give similar result to
 * `require('node:path').extname(require('node:url').fileURLToPath(url))`
 * when used with a `file:` URL.
 * @param {URL} url
 * @returns {string}
 */
function extname(url) {
  var {
    pathname
  } = url;
  for (var i = pathname.length - 1; i > 0; i--) {
    switch (StringPrototypeCharCodeAt(pathname, i)) {
      case SLASH_CODE:
        return '';
      case DOT_CODE:
        return StringPrototypeCharCodeAt(pathname, i - 1) === SLASH_CODE ? '' : StringPrototypeSlice(pathname, i);
    }
  }
  return '';
}

/**
 * Determine whether the given file URL is under a `node_modules` folder.
 * This function assumes that the input has already been verified to be a `file:` URL,
 * and is a file rather than a folder.
 * @param {URL} url
 * @returns {boolean}
 */
function underNodeModules(url) {
  if (url.protocol !== 'file:') {
    return false;
  } // We determine module types for other protocols based on MIME header

  return StringPrototypeIncludes(url.pathname, '/node_modules/');
}
var typelessPackageJsonFilesWarnedAbout;
function warnTypelessPackageJsonFile(pjsonPath, url) {
  typelessPackageJsonFilesWarnedAbout ??= new SafeSet();
  if (!underNodeModules(url) && !typelessPackageJsonFilesWarnedAbout.has(pjsonPath)) {
    var warning = `Module type of ${url} is not specified and it doesn't parse as CommonJS.\n` + 'Reparsing as ES module because module syntax was detected. This incurs a performance overhead.\n' + `To eliminate this warning, add "type": "module" to ${pjsonPath}.`;
    process.emitWarning(warning, {
      code: 'MODULE_TYPELESS_PACKAGE_JSON'
    });
    typelessPackageJsonFilesWarnedAbout.add(pjsonPath);
  }
}

/**
 * @param {URL} url
 * @param {{parentURL: string; source?: Buffer}} context
 * @param {boolean} ignoreErrors
 * @returns {string}
 */
function getFileProtocolModuleFormat(url) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    __proto__: null
  };
  var ignoreErrors = arguments.length > 2 ? arguments[2] : undefined;
  var {
    source
  } = context;
  var ext = extname(url);
  if (ext === '.js') {
    var {
      type: packageType,
      pjsonPath,
      exists: foundPackageJson
    } = getPackageScopeConfig(url);
    if (packageType !== 'none') {
      return packageType;
    }

    // The controlling `package.json` file has no `type` field.
    // `source` is undefined when this is called from `defaultResolve`;
    // but this gets called again from `defaultLoad`/`defaultLoadSync`.
    // For ambiguous files (.js, no type field) we return undefined from `resolve` and re-run the check in `load`.
    var _format = detectModuleFormat(source, url);
    if (_format === 'module' && foundPackageJson) {
      // This module has a .js extension, a package.json with no `type` field, and ESM syntax.
      // Warn about the missing `type` field so that the user can avoid the performance penalty of detection.
      warnTypelessPackageJsonFile(pjsonPath, url);
    }
    return _format;
  }
  if (ext === '.ts' && getOptionValue('--strip-types')) {
    var {
      type: _packageType,
      pjsonPath: _pjsonPath,
      exists: _foundPackageJson
    } = getPackageScopeConfig(url);
    if (_packageType !== 'none') {
      return `${_packageType}-typescript`;
    }
    // The controlling `package.json` file has no `type` field.
    // `source` is undefined when this is called from `defaultResolve`;
    // but this gets called again from `defaultLoad`/`defaultLoadSync`.
    // Since strip-types depends on detect-module, we always return null if source is undefined.
    if (!source) {
      return null;
    }
    var {
      stringify
    } = require('internal/modules/helpers');
    var {
      stripTypeScriptModuleTypes
    } = require('internal/modules/typescript');
    var stringifiedSource = stringify(source);
    var parsedSource = stripTypeScriptModuleTypes(stringifiedSource, fileURLToPath(url));
    var detectedFormat = detectModuleFormat(parsedSource, url);
    var _format2 = `${detectedFormat}-typescript`;
    if (_format2 === 'module-typescript' && _foundPackageJson) {
      // This module has a .js extension, a package.json with no `type` field, and ESM syntax.
      // Warn about the missing `type` field so that the user can avoid the performance penalty of detection.
      warnTypelessPackageJsonFile(_pjsonPath, url);
    }
    return _format2;
  }
  if (ext === '') {
    var _packageType2 = getPackageType(url);
    if (_packageType2 === 'module') {
      return getFormatOfExtensionlessFile(url);
    }
    if (_packageType2 !== 'none') {
      return _packageType2; // 'commonjs' or future package types
    }

    // The controlling `package.json` file has no `type` field.
    if (!source) {
      return null;
    }
    var _format3 = getFormatOfExtensionlessFile(url);
    if (_format3 === 'wasm') {
      return _format3;
    }
    return detectModuleFormat(source, url);
  }
  var format = extensionFormatMap[ext];
  if (format) {
    return format;
  }

  // Explicit undefined return indicates load hook should rerun format check
  if (ignoreErrors) {
    return undefined;
  }
  var filepath = fileURLToPath(url);
  throw new ERR_UNKNOWN_FILE_EXTENSION(ext, filepath);
}

/**
 * @param {URL} url
 * @param {{parentURL: string}} context
 * @returns {Promise<string> | string | undefined} only works when enabled
 */
function defaultGetFormatWithoutErrors(url, context) {
  var protocol = url.protocol;
  if (!ObjectPrototypeHasOwnProperty(protocolHandlers, protocol)) {
    return null;
  }
  return protocolHandlers[protocol](url, context, true);
}

/**
 * @param {URL} url
 * @param {{parentURL: string}} context
 * @returns {Promise<string> | string | undefined} only works when enabled
 */
function defaultGetFormat(url, context) {
  var protocol = url.protocol;
  if (!ObjectPrototypeHasOwnProperty(protocolHandlers, protocol)) {
    return null;
  }
  return protocolHandlers[protocol](url, context, false);
}
module.exports = {
  defaultGetFormat,
  defaultGetFormatWithoutErrors,
  extensionFormatMap,
  extname,
  initializeExtensionFormatMap
};

