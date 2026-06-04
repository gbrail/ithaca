'use strict';

var {
  ArrayIsArray,
  Error,
  ErrorCaptureStackTrace,
  ErrorPrototypeToString,
  SafeSet,
  String
} = primordials;
var {
  getOptionValue
} = require('internal/options');
var assert = require('internal/assert');
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  },
  isErrorStackTraceLimitWritable
} = require('internal/errors');
var {
  validateString
} = require('internal/validators');

// Lazily loaded
var fs;
var fd;
var warningFile;
var traceWarningHelperShown = false;
function resetForSerialization() {
  if (fd !== undefined) {
    process.removeListener('exit', closeFdOnExit);
  }
  fd = undefined;
  warningFile = undefined;
  traceWarningHelperShown = false;
}
function lazyOption() {
  // This will load `warningFile` only once. If the flag is not set,
  // `warningFile` will be set to an empty string.
  if (warningFile === undefined) {
    var diagnosticDir = getOptionValue('--diagnostic-dir');
    var redirectWarnings = getOptionValue('--redirect-warnings');
    warningFile = diagnosticDir || redirectWarnings || '';
  }
  return warningFile;
}

// If we can't write to stderr, we'd like to make this a noop,
// so use console.error.
var error;
function writeOut(message) {
  error ??= require('internal/console/global').error;
  error(message);
}
function closeFdOnExit() {
  try {
    fs.closeSync(fd);
  } catch {
    // Continue regardless of error.
  }
}
function writeToFile(message) {
  if (fd === undefined) {
    fs = require('fs');
    try {
      fd = fs.openSync(warningFile, 'a');
    } catch {
      return writeOut(message);
    }
    process.on('exit', closeFdOnExit);
  }
  fs.appendFile(fd, `${message}\n`, err => {
    if (err) {
      writeOut(message);
    }
  });
}
function doEmitWarning(warning) {
  process.emit('warning', warning);
}
var disableWarningSet;
function onWarning(warning) {
  if (!disableWarningSet) {
    disableWarningSet = new SafeSet();
    var disableWarningValues = getOptionValue('--disable-warning');
    for (var i = 0; i < disableWarningValues.length; i++) {
      disableWarningSet.add(disableWarningValues[i]);
    }
  }
  if (warning?.code && disableWarningSet.has(warning.code) || warning?.name && disableWarningSet.has(warning.name)) return;
  if (!(warning instanceof Error)) return;
  var isDeprecation = warning.name === 'DeprecationWarning';
  if (isDeprecation && process.noDeprecation) return;
  var trace = process.traceProcessWarnings || isDeprecation && process.traceDeprecation;
  var msg = `(${process.release.name}:${process.pid}) `;
  if (warning.code) msg += `[${warning.code}] `;
  if (trace && warning.stack) {
    msg += `${warning.stack}`;
  } else {
    msg += typeof warning.toString === 'function' ? `${warning.toString()}` : ErrorPrototypeToString(warning);
  }
  if (typeof warning.detail === 'string') {
    msg += `\n${warning.detail}`;
  }
  if (!trace && !traceWarningHelperShown) {
    var flag = isDeprecation ? '--trace-deprecation' : '--trace-warnings';
    var argv0 = require('path').basename(process.argv0 || 'node', '.exe');
    msg += `\n(Use \`${argv0} ${flag} ...\` to show where the warning ` + 'was created)';
    traceWarningHelperShown = true;
  }
  var warningFile = lazyOption();
  if (warningFile) {
    return writeToFile(msg);
  }
  writeOut(msg);
}

// process.emitWarning(error)
// process.emitWarning(str[, type[, code]][, ctor])
// process.emitWarning(str[, options])
function emitWarning(warning, type, code, ctor) {
  // Fast path to avoid memory allocation,
  // this doesn't eliminate the other if a few lines below
  if (process.noDeprecation && type === 'DeprecationWarning') {
    return;
  }
  var detail;
  if (type !== null && typeof type === 'object' && !ArrayIsArray(type)) {
    ctor = type.ctor;
    code = type.code;
    if (typeof type.detail === 'string') detail = type.detail;
    type = type.type || 'Warning';
  } else if (typeof type === 'function') {
    ctor = type;
    code = undefined;
    type = 'Warning';
  }
  if (type !== undefined) validateString(type, 'type');
  if (typeof code === 'function') {
    ctor = code;
    code = undefined;
  } else if (code !== undefined) {
    validateString(code, 'code');
  }
  if (typeof warning === 'string') {
    warning = createWarningObject(warning, type, code, ctor, detail);
  } else if (!(warning instanceof Error)) {
    throw new ERR_INVALID_ARG_TYPE('warning', ['Error', 'string'], warning);
  }
  if (warning.name === 'DeprecationWarning') {
    if (process.noDeprecation) return;
    if (process.throwDeprecation) {
      // Delay throwing the error to guarantee that all former warnings were
      // properly logged.
      return process.nextTick(() => {
        throw warning;
      });
    }
  }
  process.nextTick(doEmitWarning, warning);
}
function emitWarningSync(warning, type, code, ctor) {
  process.emit('warning', createWarningObject(warning, type, code, ctor));
}
function createWarningObject(warning, type, code, ctor, detail) {
  assert(typeof warning === 'string');
  // Improve error creation performance by skipping the error frames.
  // They are added in the `captureStackTrace()` function below.
  var tmpStackLimit = Error.stackTraceLimit;
  if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = 0;
  // eslint-disable-next-line no-restricted-syntax
  warning = new Error(warning);
  if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = tmpStackLimit;
  warning.name = String(type || 'Warning');
  if (code !== undefined) warning.code = code;
  if (detail !== undefined) warning.detail = detail;
  ErrorCaptureStackTrace(warning, ctor || process.emitWarning);
  return warning;
}
module.exports = {
  emitWarning,
  emitWarningSync,
  onWarning,
  resetForSerialization
};

