'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  RegExpPrototypeExec
} = primordials;
var {
  kEmptyObject
} = require('internal/util');
var {
  defaultGetFormat
} = require('internal/modules/esm/get_format');
var {
  validateAttributes,
  emitImportAssertionWarning
} = require('internal/modules/esm/assert');
var fs = require('fs');
var {
  Buffer: {
    from: BufferFrom
  }
} = require('buffer');
var {
  URL
} = require('internal/url');
var {
  ERR_INVALID_URL,
  ERR_UNKNOWN_MODULE_FORMAT,
  ERR_UNSUPPORTED_ESM_URL_SCHEME
} = require('internal/errors').codes;
var {
  dataURLProcessor
} = require('internal/data_url');

/**
 * @param {URL} url URL to the module
 * @param {LoadContext} context used to decorate error messages
 * @returns {{ responseURL: string, source: string | BufferView }}
 */
function getSourceSync(url, context) {
  var {
    protocol,
    href
  } = url;
  var responseURL = href;
  var source;
  if (protocol === 'file:') {
    // If you are reading this code to figure out how to patch Node.js module loading
    // behavior - DO NOT depend on the patchability in new code: Node.js
    // internals may stop going through the JavaScript fs module entirely.
    // Prefer module.registerHooks() or other more formal fs hooks released in the future.
    source = fs.readFileSync(url);
  } else if (protocol === 'data:') {
    var result = dataURLProcessor(url);
    if (result === 'failure') {
      throw new ERR_INVALID_URL(responseURL);
    }
    source = BufferFrom(result.body);
  } else {
    var supportedSchemes = ['file', 'data'];
    throw new ERR_UNSUPPORTED_ESM_URL_SCHEME(url, supportedSchemes);
  }
  return {
    __proto__: null,
    responseURL,
    source
  };
}

/**
 * Node.js default load hook.
 * @param {string} url
 * @param {LoadContext} context
 * @returns {LoadReturn}
 */
function defaultLoad(url) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var responseURL = url;
  var {
    importAttributes,
    format,
    source
  } = context;
  if (importAttributes == null && !('importAttributes' in context) && 'importAssertions' in context) {
    emitImportAssertionWarning();
    importAttributes = context.importAssertions;
    // Alias `importAssertions` to `importAttributes`
    context = _objectSpread(_objectSpread({}, context), {}, {
      importAttributes
    });
  }
  var urlInstance = new URL(url);
  throwIfUnsupportedURLScheme(urlInstance);
  if (urlInstance.protocol === 'node:') {
    source = null;
    format ??= 'builtin';
  } else if (format === 'addon') {
    // Skip loading addon file content. It must be loaded with dlopen from file system.
    source = null;
  } else if (format !== 'commonjs') {
    if (source == null) {
      ({
        responseURL,
        source
      } = getSourceSync(urlInstance, context));
      context = {
        __proto__: context,
        source
      };
    }
    if (format == null) {
      // Now that we have the source for the module, run `defaultGetFormat` to detect its format.
      format = defaultGetFormat(urlInstance, context);
      if (format === 'commonjs') {
        // For backward compatibility reasons, we need to discard the source in
        // order for the CJS loader to re-fetch it.
        source = null;
      }
    }
  }
  validateAttributes(url, format, importAttributes);
  return {
    __proto__: null,
    format,
    responseURL,
    source
  };
}
/**
 * @typedef LoadContext
 * @property {string} [format] A hint (possibly returned from `resolve`)
 * @property {string | Buffer | ArrayBuffer} [source] source
 * @property {Record<string, string>} [importAttributes] import attributes
 */

/**
 * @typedef LoadReturn
 * @property {string} format format
 * @property {URL['href']} responseURL The module's fully resolved URL
 * @property {Buffer} source source
 */

/**
 * @param {URL['href']} url
 * @param {LoadContext} [context]
 * @returns {LoadReturn}
 */
function defaultLoadSync(url) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var responseURL = url;
  var {
    importAttributes
  } = context;
  var {
    format,
    source
  } = context;
  var urlInstance = new URL(url);
  throwIfUnsupportedURLScheme(urlInstance, false);
  if (urlInstance.protocol === 'node:') {
    source = null;
    format ??= 'builtin';
  } else if (format === 'addon') {
    // Skip loading addon file content. It must be loaded with dlopen from file system.
    source = null;
  } else {
    if (source == null) {
      ({
        responseURL,
        source
      } = getSourceSync(urlInstance, context));
      context = {
        __proto__: context,
        source
      };
    }

    // Now that we have the source for the module, run `defaultGetFormat` to detect its format.
    format ??= defaultGetFormat(urlInstance, context);
  }
  validateAttributes(url, format, importAttributes);
  return {
    __proto__: null,
    format,
    responseURL,
    source
  };
}

/**
 * throws an error if the protocol is not one of the protocols
 * that can be loaded in the default loader
 * @param {URL} parsed
 */
function throwIfUnsupportedURLScheme(parsed) {
  // Avoid accessing the `protocol` property due to the lazy getters.
  var protocol = parsed?.protocol;
  if (protocol && protocol !== 'file:' && protocol !== 'data:' && protocol !== 'node:' && protocol !== 'https:' && protocol !== 'http:') {
    var schemes = ['file', 'data', 'node'];
    throw new ERR_UNSUPPORTED_ESM_URL_SCHEME(parsed, schemes);
  }
}

/**
 * For a falsy `format` returned from `load`, throw an error.
 * This could happen from either a custom user loader _or_ from the default loader, because the default loader tries to
 * determine formats for data URLs.
 * @param {string} url The resolved URL of the module
 * @param {(null|undefined|false|0|'')} format Falsy format returned from `load`
 */
function throwUnknownModuleFormat(url, format) {
  var dataUrl = RegExpPrototypeExec(/^data:([^/]+\/[^;,]+)(?:[^,]*?)(;base64)?,/, url);
  throw new ERR_UNKNOWN_MODULE_FORMAT(dataUrl ? dataUrl[1] : format, url);
}
module.exports = {
  defaultLoad,
  defaultLoadSync,
  getSourceSync,
  throwUnknownModuleFormat
};

