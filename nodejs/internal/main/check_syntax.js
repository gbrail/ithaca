'use strict';

// If user passed `-c` or `--check` arguments to Node, check its syntax
// instead of actually running the file.
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var checkSyntax = _async(function (source, filename) {
  var format;
  return _invoke(function () {
    if (filename === '[stdin]' || filename === '[eval]') {
      format = getOptionValue('--input-type') === 'module' ? 'module' : 'commonjs';
    } else {
      var {
        defaultResolve
      } = require('internal/modules/esm/resolve');
      var {
        defaultGetFormat
      } = require('internal/modules/esm/get_format');
      return _await(defaultResolve(pathToFileURL(filename).toString()), function (_ref) {
        var {
          url
        } = _ref;
        return _await(defaultGetFormat(new URL(url)), function (_defaultGetFormat) {
          format = _defaultGetFormat;
        });
      });
    }
  }, function () {
    if (format === 'module') {
      var {
        ModuleWrap
      } = internalBinding('module_wrap');
      new ModuleWrap(filename, undefined, source, 0, 0);
      return;
    }
    wrapSafe(filename, source, undefined, format);
  });
});
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var {
  getOptionValue
} = require('internal/options');
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
  URL,
  pathToFileURL
} = require('internal/url');
var {
  prepareMainThreadExecution,
  markBootstrapComplete
} = require('internal/process/pre_execution');
var {
  readStdin
} = require('internal/process/execution');
var {
  Module: {
    _resolveFilename: resolveCJSModuleName
  },
  wrapSafe
} = require('internal/modules/cjs/loader');

// TODO(joyeecheung): not every one of these are necessary
prepareMainThreadExecution(true);
if (process.argv[1] && process.argv[1] !== '-') {
  // Expand process.argv[1] into a full path.
  var path = require('path');
  process.argv[1] = path.resolve(process.argv[1]);

  // Read the source.
  var filename = resolveCJSModuleName(process.argv[1]);
  var fs = require('fs');
  var source = fs.readFileSync(filename, 'utf-8');
  markBootstrapComplete();
  loadESMIfNeeded(() => checkSyntax(source, filename));
} else {
  markBootstrapComplete();
  loadESMIfNeeded(() => readStdin(code => {
    checkSyntax(code, '[stdin]');
  }));
}
function loadESMIfNeeded(cb) {
  var hasModulePreImport = getOptionValue('--import').length > 0;
  if (hasModulePreImport) {
    require('internal/modules/run_main').runEntryPointWithESMLoader(cb);
    return;
  }
  cb();
}

