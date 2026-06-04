'use strict';

var {
  JSONStringify,
  SafeMap
} = primordials;
var kMockSearchParam = 'node-test-mock';
var kBadExportsMessage = 'Cannot create mock because named exports ' + 'cannot be applied to the provided default export.';
var {
  URL,
  URLParse
} = require('internal/url');
var debug = require('internal/util/debuglog').debuglog('test_runner', fn => {
  debug = fn;
});
var mocks = new SafeMap();
function resolve(specifier, context, nextResolve) {
  debug('resolve hook entry, specifier = "%s", context = %o', specifier, context);
  var nextResolveResult = nextResolve(specifier, context);
  var mockSpecifier = nextResolveResult.url;
  var mock = mocks.get(mockSpecifier);
  debug('resolve hook, specifier = "%s", mock = %o', specifier, mock);
  if (mock?.active !== true) {
    return nextResolveResult;
  }
  var url = new URL(mockSpecifier);
  url.searchParams.set(kMockSearchParam, mock.localVersion);
  if (!mock.cache) {
    // With ESM, we can't remove modules from the cache. Bump the module's
    // version instead so that the next import will be uncached.
    mock.localVersion++;
  }
  var {
    href
  } = url;
  debug('resolve hook finished, url = "%s"', href);
  return {
    __proto__: null,
    url: href,
    format: nextResolveResult.format
  };
}
function load(url, context, nextLoad) {
  debug('load hook entry, url = "%s", context = %o', url, context);
  var parsedURL = URLParse(url);
  if (parsedURL) {
    parsedURL.searchParams.delete(kMockSearchParam);
  }
  var baseURL = parsedURL ? parsedURL.href : url;
  var mock = mocks.get(baseURL);
  var original = nextLoad(url, context);
  debug('load hook, mock = %o', mock);
  if (mock?.active !== true) {
    return original;
  }

  // Treat builtins as commonjs because customization hooks do not allow a
  // core module to be replaced.
  // Also collapse 'commonjs-sync' and 'require-commonjs' to 'commonjs'.
  var format = original.format;
  switch (original.format) {
    case 'builtin': // Deliberate fallthrough
    case 'commonjs-sync': // Deliberate fallthrough
    case 'require-commonjs':
      format = 'commonjs';
      break;
    case 'json':
      format = 'module';
      break;
  }
  var result = {
    __proto__: null,
    format,
    shortCircuit: true,
    source: createSourceFromMock(mock, format)
  };
  debug('load hook finished, result = %o', result);
  return result;
}
function createSourceFromMock(mock, format) {
  // Create mock implementation from provided exports.
  var {
    exportNames,
    hasDefaultExport,
    url
  } = mock;
  var useESM = format === 'module' || format === 'module-typescript';
  var source = `${testImportSource(useESM)}
if (!$__test.mock._mockExports.has(${JSONStringify(url)})) {
  throw new Error(${JSONStringify(`mock exports not found for "${url}"`)});
}

const $__exports = $__test.mock._mockExports.get(${JSONStringify(url)});
${defaultExportSource(useESM, hasDefaultExport)}
${namedExportsSource(useESM, exportNames)}
`;
  return source;
}
function testImportSource(useESM) {
  if (useESM) {
    return "import $__test from 'node:test';";
  }
  return "const $__test = require('node:test');";
}
function defaultExportSource(useESM, hasDefaultExport) {
  if (!hasDefaultExport) {
    return '';
  } else if (useESM) {
    return 'export default $__exports.moduleExports.default;';
  }
  return 'module.exports = $__exports.moduleExports.default;';
}
function namedExportsSource(useESM, exportNames) {
  var source = '';
  if (!useESM && exportNames.length > 0) {
    source += `
if (module.exports === null || typeof module.exports !== 'object') {
  throw new Error('${JSONStringify(kBadExportsMessage)}');
}
`;
  }
  for (var i = 0; i < exportNames.length; ++i) {
    var name = exportNames[i];
    if (useESM) {
      source += `export let ${name} = $__exports.moduleExports[${JSONStringify(name)}];\n`;
    } else {
      source += `module.exports[${JSONStringify(name)}] = $__exports.moduleExports[${JSONStringify(name)}];\n`;
    }
  }
  return source;
}
module.exports = {
  hooks: {
    __proto__: null,
    load,
    resolve
  },
  mocks,
  constants: {
    __proto__: null,
    kBadExportsMessage,
    kMockSearchParam
  }
};

