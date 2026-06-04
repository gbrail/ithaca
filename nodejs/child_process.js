// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayIsArray,
  ArrayPrototypeFilter,
  ArrayPrototypeIncludes,
  ArrayPrototypeJoin,
  ArrayPrototypeLastIndexOf,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeSlice,
  ArrayPrototypeSort,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  ObjectAssign,
  ObjectDefineProperty,
  ObjectPrototypeHasOwnProperty,
  PromiseWithResolvers,
  RegExpPrototypeExec,
  SafeSet,
  StringPrototypeIncludes,
  StringPrototypeSlice,
  StringPrototypeToUpperCase,
  SymbolDispose
} = primordials;
var {
  assignFunctionName,
  convertToValidSignal,
  getSystemErrorName,
  kEmptyObject,
  promisify
} = require('internal/util');
var {
  isArrayBufferView
} = require('internal/util/types');
var debug = require('internal/util/debuglog').debuglog('child_process', fn => {
  debug = fn;
});
var {
  Buffer
} = require('buffer');
var {
  Pipe,
  constants: PipeConstants
} = internalBinding('pipe_wrap');
var {
  AbortError,
  codes: {
    ERR_CHILD_PROCESS_IPC_REQUIRED,
    ERR_CHILD_PROCESS_STDIO_MAXBUFFER,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE
  },
  genericNodeError
} = require('internal/errors');
var {
  clearTimeout,
  setTimeout
} = require('timers');
var {
  getValidatedPath
} = require('internal/fs/utils');
var {
  validateAbortSignal,
  validateArray,
  validateBoolean,
  validateFunction,
  validateInteger,
  validateInt32,
  validateNumber,
  validateObject,
  validateString
} = require('internal/validators');
var child_process = require('internal/child_process');
var {
  getValidStdio,
  setupChannel,
  ChildProcess,
  stdioStringToArray
} = child_process;
var MAX_BUFFER = 1024 * 1024;
var permission = require('internal/process/permission');
var isZOS = process.platform === 'os390';
var addAbortListener;

/**
 * Spawns a new Node.js process + fork.
 * @param {string|URL} modulePath
 * @param {string[]} [args]
 * @param {{
 *   cwd?: string | URL;
 *   detached?: boolean;
 *   env?: Record<string, string>;
 *   execPath?: string;
 *   execArgv?: string[];
 *   gid?: number;
 *   serialization?: string;
 *   signal?: AbortSignal;
 *   killSignal?: string | number;
 *   silent?: boolean;
 *   stdio?: Array | string;
 *   uid?: number;
 *   windowsVerbatimArguments?: boolean;
 *   timeout?: number;
 *   }} [options]
 * @returns {ChildProcess}
 */
function fork(modulePath) {
  var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var options = arguments.length > 2 ? arguments[2] : undefined;
  modulePath = getValidatedPath(modulePath, 'modulePath');

  // Get options and args arguments.
  var execArgv;
  if (args == null) {
    args = [];
  } else if (typeof args === 'object' && !ArrayIsArray(args)) {
    options = args;
    args = [];
  } else {
    validateArray(args, 'args');
  }
  if (options != null) {
    validateObject(options, 'options');
  }
  options = _objectSpread(_objectSpread({
    __proto__: null
  }, options), {}, {
    shell: false
  });
  options.execPath ||= process.execPath;
  validateArgumentNullCheck(options.execPath, 'options.execPath');

  // Prepare arguments for fork:
  execArgv = options.execArgv || process.execArgv;
  validateArgumentsNullCheck(execArgv, 'options.execArgv');
  if (execArgv === process.execArgv && process._eval != null) {
    var index = ArrayPrototypeLastIndexOf(execArgv, process._eval);
    if (index > 0) {
      // Remove the -e switch to avoid fork bombing ourselves.
      execArgv = ArrayPrototypeSlice(execArgv);
      ArrayPrototypeSplice(execArgv, index - 1, 2);
    }
  }
  args = [].concat(_toConsumableArray(execArgv), [modulePath], _toConsumableArray(args));
  if (typeof options.stdio === 'string') {
    options.stdio = stdioStringToArray(options.stdio, 'ipc');
  } else if (!ArrayIsArray(options.stdio)) {
    // Use a separate fd=3 for the IPC channel. Inherit stdin, stdout,
    // and stderr from the parent if silent isn't set.
    options.stdio = stdioStringToArray(options.silent ? 'pipe' : 'inherit', 'ipc');
  } else if (!ArrayPrototypeIncludes(options.stdio, 'ipc')) {
    throw new ERR_CHILD_PROCESS_IPC_REQUIRED('options.stdio');
  }
  return spawn(options.execPath, args, options);
}
function _forkChild(fd, serializationMode) {
  // set process.send()
  var p = new Pipe(PipeConstants.IPC);
  p.open(fd);
  p.unref();
  var control = setupChannel(process, p, serializationMode);
  process.on('newListener', function onNewListener(name) {
    if (name === 'message' || name === 'disconnect') control.refCounted();
  });
  process.on('removeListener', function onRemoveListener(name) {
    if (name === 'message' || name === 'disconnect') control.unrefCounted();
  });
}
function normalizeExecArgs(command, options, callback) {
  validateString(command, 'command');
  validateArgumentNullCheck(command, 'command');
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  // Make a shallow copy so we don't clobber the user's options object.
  options = _objectSpread({
    __proto__: null
  }, options);
  options.shell = typeof options.shell === 'string' ? options.shell : true;
  return {
    file: command,
    options: options,
    callback: callback
  };
}

/**
 * Spawns a shell executing the given command.
 * @param {string} command
 * @param {{
 *   cmd?: string;
 *   env?: Record<string, string>;
 *   encoding?: string;
 *   shell?: string;
 *   signal?: AbortSignal;
 *   timeout?: number;
 *   maxBuffer?: number;
 *   killSignal?: string | number;
 *   uid?: number;
 *   gid?: number;
 *   windowsHide?: boolean;
 *   }} [options]
 * @param {(
 *   error?: Error,
 *   stdout?: string | Buffer,
 *   stderr?: string | Buffer
 *   ) => any} [callback]
 * @returns {ChildProcess}
 */
function exec(command, options, callback) {
  var opts = normalizeExecArgs(command, options, callback);
  return module.exports.execFile(opts.file, opts.options, opts.callback);
}
var customPromiseExecFunction = orig => {
  return assignFunctionName(orig.name, function () {
    var {
      promise,
      resolve,
      reject
    } = PromiseWithResolvers();
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    promise.child = orig.apply(void 0, args.concat([(err, stdout, stderr) => {
      if (err !== null) {
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({
          stdout,
          stderr
        });
      }
    }]));
    return promise;
  });
};
ObjectDefineProperty(exec, promisify.custom, {
  __proto__: null,
  enumerable: false,
  value: customPromiseExecFunction(exec)
});
function normalizeExecFileArgs(file, args, options, callback) {
  if (ArrayIsArray(args)) {
    args = ArrayPrototypeSlice(args);
  } else if (args != null && typeof args === 'object') {
    callback = options;
    options = args;
    args = null;
  } else if (typeof args === 'function') {
    callback = args;
    options = null;
    args = null;
  }
  args ??= [];
  if (typeof options === 'function') {
    callback = options;
  } else if (options != null) {
    validateObject(options, 'options');
  }
  options ??= kEmptyObject;
  if (callback != null) {
    validateFunction(callback, 'callback');
  }

  // Validate argv0, if present.
  if (options.argv0 != null) {
    validateString(options.argv0, 'options.argv0');
    validateArgumentNullCheck(options.argv0, 'options.argv0');
  }
  return {
    file,
    args,
    options,
    callback
  };
}

/**
 * Spawns the specified file as a shell.
 * @param {string} file
 * @param {string[]} [args]
 * @param {{
 *   cwd?: string | URL;
 *   env?: Record<string, string>;
 *   encoding?: string;
 *   timeout?: number;
 *   maxBuffer?: number;
 *   killSignal?: string | number;
 *   uid?: number;
 *   gid?: number;
 *   windowsHide?: boolean;
 *   windowsVerbatimArguments?: boolean;
 *   shell?: boolean | string;
 *   signal?: AbortSignal;
 *   }} [options]
 * @param {(
 *   error?: Error,
 *   stdout?: string | Buffer,
 *   stderr?: string | Buffer
 *   ) => any} [callback]
 * @returns {ChildProcess}
 */
function execFile(file, args, options, callback) {
  ({
    file,
    args,
    options,
    callback
  } = normalizeExecFileArgs(file, args, options, callback));
  options = _objectSpread({
    __proto__: null,
    encoding: 'utf8',
    timeout: 0,
    maxBuffer: MAX_BUFFER,
    killSignal: 'SIGTERM',
    cwd: null,
    env: null,
    shell: false
  }, options);

  // Validate the timeout, if present.
  validateTimeout(options.timeout);

  // Validate maxBuffer, if present.
  validateMaxBuffer(options.maxBuffer);
  options.killSignal = sanitizeKillSignal(options.killSignal);
  var child = spawn(file, args, {
    cwd: options.cwd,
    env: options.env,
    gid: options.gid,
    shell: options.shell,
    signal: options.signal,
    uid: options.uid,
    windowsHide: !!options.windowsHide,
    windowsVerbatimArguments: !!options.windowsVerbatimArguments
  });
  var encoding;
  var _stdout = [];
  var _stderr = [];
  if (options.encoding !== 'buffer' && Buffer.isEncoding(options.encoding)) {
    encoding = options.encoding;
  } else {
    encoding = null;
  }
  var stdoutLen = 0;
  var stderrLen = 0;
  var killed = false;
  var exited = false;
  var timeoutId;
  var ex = null;
  var cmd = file;
  function exithandler(code, signal) {
    if (exited) return;
    exited = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (!callback) return;

    // merge chunks
    var stdout;
    var stderr;
    if (encoding || child.stdout?.readableEncoding) {
      stdout = ArrayPrototypeJoin(_stdout, '');
    } else {
      stdout = Buffer.concat(_stdout);
    }
    if (encoding || child.stderr?.readableEncoding) {
      stderr = ArrayPrototypeJoin(_stderr, '');
    } else {
      stderr = Buffer.concat(_stderr);
    }
    if (!ex && code === 0 && signal === null) {
      callback(null, stdout, stderr);
      return;
    }
    if (args?.length) cmd += ` ${ArrayPrototypeJoin(args, ' ')}`;
    ex ||= genericNodeError(`Command failed: ${cmd}\n${stderr}`, {
      code: code < 0 ? getSystemErrorName(code) : code,
      killed: child.killed || killed,
      signal: signal
    });
    ex.cmd = cmd;
    callback(ex, stdout, stderr);
  }
  function errorhandler(e) {
    ex = e;
    if (child.stdout) child.stdout.destroy();
    if (child.stderr) child.stderr.destroy();
    exithandler();
  }
  function kill() {
    if (child.stdout) child.stdout.destroy();
    if (child.stderr) child.stderr.destroy();
    killed = true;
    try {
      child.kill(options.killSignal);
    } catch (e) {
      ex = e;
      exithandler();
    }
  }
  if (options.timeout > 0) {
    timeoutId = setTimeout(function delayedKill() {
      kill();
      timeoutId = null;
    }, options.timeout);
  }
  if (child.stdout) {
    if (encoding) child.stdout.setEncoding(encoding);
    child.stdout.on('data', function onChildStdout(chunk) {
      // Do not need to count the length
      if (options.maxBuffer === Infinity) {
        ArrayPrototypePush(_stdout, chunk);
        return;
      }
      var encoding = child.stdout.readableEncoding;
      var length = encoding ? Buffer.byteLength(chunk, encoding) : chunk.length;
      var slice = encoding ? StringPrototypeSlice : function (buf) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        return buf.slice.apply(buf, args);
      };
      stdoutLen += length;
      if (stdoutLen > options.maxBuffer) {
        var truncatedLen = options.maxBuffer - (stdoutLen - length);
        ArrayPrototypePush(_stdout, slice(chunk, 0, truncatedLen));
        ex = new ERR_CHILD_PROCESS_STDIO_MAXBUFFER('stdout');
        kill();
      } else {
        ArrayPrototypePush(_stdout, chunk);
      }
    });
  }
  if (child.stderr) {
    if (encoding) child.stderr.setEncoding(encoding);
    child.stderr.on('data', function onChildStderr(chunk) {
      // Do not need to count the length
      if (options.maxBuffer === Infinity) {
        ArrayPrototypePush(_stderr, chunk);
        return;
      }
      var encoding = child.stderr.readableEncoding;
      var length = encoding ? Buffer.byteLength(chunk, encoding) : chunk.length;
      stderrLen += length;
      if (stderrLen > options.maxBuffer) {
        var truncatedLen = options.maxBuffer - (stderrLen - length);
        ArrayPrototypePush(_stderr, chunk.slice(0, truncatedLen));
        ex = new ERR_CHILD_PROCESS_STDIO_MAXBUFFER('stderr');
        kill();
      } else {
        ArrayPrototypePush(_stderr, chunk);
      }
    });
  }
  child.addListener('close', exithandler);
  child.addListener('error', errorhandler);
  return child;
}
ObjectDefineProperty(execFile, promisify.custom, {
  __proto__: null,
  enumerable: false,
  value: customPromiseExecFunction(execFile)
});
function copyProcessEnvToEnv(env, name, optionEnv) {
  if (process.env[name] && (!optionEnv || !ObjectPrototypeHasOwnProperty(optionEnv, name))) {
    env[name] = process.env[name];
  }
}
var permissionModelFlagsToCopy;
function getPermissionModelFlagsToCopy() {
  if (permissionModelFlagsToCopy === undefined) {
    permissionModelFlagsToCopy = [].concat(_toConsumableArray(permission.availableFlags()), ['--permission']);
  }
  return permissionModelFlagsToCopy;
}
function copyPermissionModelFlagsToEnv(env, key, args) {
  // Do not override if permission was already passed to file
  if (args.includes('--permission') || args.includes('--permission-audit') || env[key] && env[key].indexOf('--permission') !== -1) {
    return;
  }
  var flagsToCopy = getPermissionModelFlagsToCopy();
  for (var arg of process.execArgv) {
    for (var flag of flagsToCopy) {
      if (arg.startsWith(flag)) {
        env[key] = `${env[key] ? env[key] + ' ' + arg : arg}`;
      }
    }
  }
}
var emittedDEP0190Already = false;
function normalizeSpawnArguments(file, args, options) {
  validateString(file, 'file');
  validateArgumentNullCheck(file, 'file');
  if (file.length === 0) throw new ERR_INVALID_ARG_VALUE('file', file, 'cannot be empty');
  if (ArrayIsArray(args)) {
    args = ArrayPrototypeSlice(args);
  } else if (args == null) {
    args = [];
  } else if (typeof args !== 'object') {
    throw new ERR_INVALID_ARG_TYPE('args', 'object', args);
  } else {
    options = args;
    args = [];
  }
  validateArgumentsNullCheck(args, 'args');
  if (options === undefined) options = kEmptyObject;else validateObject(options, 'options');
  options = _objectSpread({
    __proto__: null
  }, options);
  var cwd = options.cwd;

  // Validate the cwd, if present.
  if (cwd != null) {
    cwd = getValidatedPath(cwd, 'options.cwd');
  }

  // Validate detached, if present.
  if (options.detached != null) {
    validateBoolean(options.detached, 'options.detached');
  }

  // Validate the uid, if present.
  if (options.uid != null) {
    validateInt32(options.uid, 'options.uid');
  }

  // Validate the gid, if present.
  if (options.gid != null) {
    validateInt32(options.gid, 'options.gid');
  }

  // Validate the shell, if present.
  if (options.shell != null && typeof options.shell !== 'boolean' && typeof options.shell !== 'string') {
    throw new ERR_INVALID_ARG_TYPE('options.shell', ['boolean', 'string'], options.shell);
  }

  // Validate argv0, if present.
  if (options.argv0 != null) {
    validateString(options.argv0, 'options.argv0');
    validateArgumentNullCheck(options.argv0, 'options.argv0');
  }

  // Validate windowsHide, if present.
  if (options.windowsHide != null) {
    validateBoolean(options.windowsHide, 'options.windowsHide');
  }

  // Validate windowsVerbatimArguments, if present.
  var {
    windowsVerbatimArguments
  } = options;
  if (windowsVerbatimArguments != null) {
    validateBoolean(windowsVerbatimArguments, 'options.windowsVerbatimArguments');
  }
  if (options.shell) {
    validateArgumentNullCheck(options.shell, 'options.shell');
    if (args.length > 0 && !emittedDEP0190Already) {
      process.emitWarning('Passing args to a child process with shell option true can lead to security ' + 'vulnerabilities, as the arguments are not escaped, only concatenated.', 'DeprecationWarning', 'DEP0190');
      emittedDEP0190Already = true;
    }
    var command = args.length > 0 ? `${file} ${ArrayPrototypeJoin(args, ' ')}` : file;
    // Set the shell, switches, and commands.
    if (process.platform === 'win32') {
      if (typeof options.shell === 'string') file = options.shell;else file = process.env.comspec || 'cmd.exe';
      // '/d /s /c' is used only for cmd.exe.
      if (RegExpPrototypeExec(/^(?:.*\\)?cmd(?:\.exe)?$/i, file) !== null) {
        args = ['/d', '/s', '/c', `"${command}"`];
        windowsVerbatimArguments = true;
      } else {
        args = ['-c', command];
      }
    } else {
      if (typeof options.shell === 'string') file = options.shell;else if (process.platform === 'android') file = '/system/bin/sh';else file = '/bin/sh';
      args = ['-c', command];
    }
  }
  if (typeof options.argv0 === 'string') {
    ArrayPrototypeUnshift(args, options.argv0);
  } else {
    ArrayPrototypeUnshift(args, file);
  }

  // Shallow copy to guarantee changes won't impact process.env
  var env = options.env || _objectSpread({}, process.env);
  var envPairs = [];

  // process.env.NODE_V8_COVERAGE always propagates, making it possible to
  // collect coverage for programs that spawn with white-listed environment.
  copyProcessEnvToEnv(env, 'NODE_V8_COVERAGE', options.env);
  if (isZOS) {
    // The following environment variables must always propagate if set.
    copyProcessEnvToEnv(env, '_BPXK_AUTOCVT', options.env);
    copyProcessEnvToEnv(env, '_CEE_RUNOPTS', options.env);
    copyProcessEnvToEnv(env, '_TAG_REDIR_ERR', options.env);
    copyProcessEnvToEnv(env, '_TAG_REDIR_IN', options.env);
    copyProcessEnvToEnv(env, '_TAG_REDIR_OUT', options.env);
    copyProcessEnvToEnv(env, 'STEPLIB', options.env);
    copyProcessEnvToEnv(env, 'LIBPATH', options.env);
    copyProcessEnvToEnv(env, '_EDC_SIG_DFLT', options.env);
    copyProcessEnvToEnv(env, '_EDC_SUSV3', options.env);
  }
  if (permission.isEnabled()) {
    copyPermissionModelFlagsToEnv(env, 'NODE_OPTIONS', args);
  }
  var envKeys = [];
  // Prototype values are intentionally included.
  for (var key in env) {
    ArrayPrototypePush(envKeys, key);
  }
  if (process.platform === 'win32') {
    // On Windows env keys are case insensitive. Filter out duplicates,
    // keeping only the first one (in lexicographic order)
    var sawKey = new SafeSet();
    envKeys = ArrayPrototypeFilter(ArrayPrototypeSort(envKeys), key => {
      var uppercaseKey = StringPrototypeToUpperCase(key);
      if (sawKey.has(uppercaseKey)) {
        return false;
      }
      sawKey.add(uppercaseKey);
      return true;
    });
  }
  for (var _key3 of envKeys) {
    var value = env[_key3];
    if (value !== undefined) {
      validateArgumentNullCheck(_key3, `options.env['${_key3}']`);
      validateArgumentNullCheck(value, `options.env['${_key3}']`);
      ArrayPrototypePush(envPairs, `${_key3}=${value}`);
    }
  }
  return _objectSpread(_objectSpread({
    // Make a shallow copy so we don't clobber the user's options object.
    __proto__: null
  }, options), {}, {
    args,
    cwd,
    detached: !!options.detached,
    envPairs,
    file,
    windowsHide: !!options.windowsHide,
    windowsVerbatimArguments: !!windowsVerbatimArguments
  });
}
function abortChildProcess(child, killSignal, reason) {
  if (!child) return;
  try {
    if (child.kill(killSignal)) {
      child.emit('error', new AbortError(undefined, {
        cause: reason
      }));
    }
  } catch (err) {
    child.emit('error', err);
  }
}

/**
 * Spawns a new process using the given `file`.
 * @param {string} file
 * @param {string[]} [args]
 * @param {{
 *   cwd?: string | URL;
 *   env?: Record<string, string>;
 *   argv0?: string;
 *   stdio?: Array | string;
 *   detached?: boolean;
 *   uid?: number;
 *   gid?: number;
 *   serialization?: string;
 *   shell?: boolean | string;
 *   windowsVerbatimArguments?: boolean;
 *   windowsHide?: boolean;
 *   signal?: AbortSignal;
 *   timeout?: number;
 *   killSignal?: string | number;
 *   }} [options]
 * @returns {ChildProcess}
 */
function spawn(file, args, options) {
  options = normalizeSpawnArguments(file, args, options);
  validateTimeout(options.timeout);
  validateAbortSignal(options.signal, 'options.signal');
  var killSignal = sanitizeKillSignal(options.killSignal);
  var child = new ChildProcess();
  debug('spawn', options);
  child.spawn(options);
  if (options.timeout > 0) {
    var timeoutId = setTimeout(() => {
      if (timeoutId) {
        try {
          child.kill(killSignal);
        } catch (err) {
          child.emit('error', err);
        }
        timeoutId = null;
      }
    }, options.timeout);
    child.once('exit', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });
  }
  if (options.signal) {
    var signal = options.signal;
    if (signal.aborted) {
      process.nextTick(onAbortListener);
    } else {
      addAbortListener ??= require('internal/events/abort_listener').addAbortListener;
      var disposable = addAbortListener(signal, onAbortListener);
      child.once('exit', disposable[SymbolDispose]);
    }
    function onAbortListener() {
      abortChildProcess(child, killSignal, options.signal.reason);
    }
  }
  return child;
}

/**
 * Spawns a new process synchronously using the given `file`.
 * @param {string} file
 * @param {string[]} [args]
 * @param {{
 *   cwd?: string | URL;
 *   input?: string | Buffer | TypedArray | DataView;
 *   argv0?: string;
 *   stdio?: string | Array;
 *   env?: Record<string, string>;
 *   uid?: number;
 *   gid?: number;
 *   timeout?: number;
 *   killSignal?: string | number;
 *   maxBuffer?: number;
 *   encoding?: string;
 *   shell?: boolean | string;
 *   windowsVerbatimArguments?: boolean;
 *   windowsHide?: boolean;
 *   }} [options]
 * @returns {{
 *   pid: number;
 *   output: Array;
 *   stdout: Buffer | string;
 *   stderr: Buffer | string;
 *   status: number | null;
 *   signal: string | null;
 *   error: Error;
 *   }}
 */
function spawnSync(file, args, options) {
  options = _objectSpread({
    __proto__: null,
    maxBuffer: MAX_BUFFER
  }, normalizeSpawnArguments(file, args, options));
  debug('spawnSync', options);

  // Validate the timeout, if present.
  validateTimeout(options.timeout);

  // Validate maxBuffer, if present.
  validateMaxBuffer(options.maxBuffer);

  // Validate and translate the kill signal, if present.
  options.killSignal = sanitizeKillSignal(options.killSignal);
  options.stdio = getValidStdio(options.stdio || 'pipe', true).stdio;
  if (options.input) {
    var stdin = options.stdio[0] = _objectSpread({}, options.stdio[0]);
    stdin.input = options.input;
  }

  // We may want to pass data in on any given fd, ensure it is a valid buffer
  for (var i = 0; i < options.stdio.length; i++) {
    var input = options.stdio[i]?.input;
    if (input != null) {
      var pipe = options.stdio[i] = _objectSpread({}, options.stdio[i]);
      if (isArrayBufferView(input)) {
        pipe.input = input;
      } else if (typeof input === 'string') {
        pipe.input = Buffer.from(input, options.encoding);
      } else {
        throw new ERR_INVALID_ARG_TYPE(`options.stdio[${i}]`, ['Buffer', 'TypedArray', 'DataView', 'string'], input);
      }
    }
  }
  return child_process.spawnSync(options);
}
function checkExecSyncError(ret, args, cmd) {
  var err;
  if (ret.error) {
    err = ret.error;
    ObjectAssign(err, ret);
  } else if (ret.status !== 0) {
    var msg = 'Command failed: ';
    msg += cmd || ArrayPrototypeJoin(args, ' ');
    if (ret.stderr && ret.stderr.length > 0) msg += `\n${ret.stderr.toString()}`;
    err = genericNodeError(msg, ret);
  }
  return err;
}

/**
 * Spawns a file as a shell synchronously.
 * @param {string} file
 * @param {string[]} [args]
 * @param {{
 *   cwd?: string | URL;
 *   input?: string | Buffer | TypedArray | DataView;
 *   stdio?: string | Array;
 *   env?: Record<string, string>;
 *   uid?: number;
 *   gid?: number;
 *   timeout?: number;
 *   killSignal?: string | number;
 *   maxBuffer?: number;
 *   encoding?: string;
 *   windowsHide?: boolean;
 *   shell?: boolean | string;
 *   }} [options]
 * @returns {Buffer | string}
 */
function execFileSync(file, args, options) {
  ({
    file,
    args,
    options
  } = normalizeExecFileArgs(file, args, options));
  var inheritStderr = !options.stdio;
  var ret = spawnSync(file, args, options);
  if (inheritStderr && ret.stderr) process.stderr.write(ret.stderr);
  var errArgs = [options.argv0 || file];
  ArrayPrototypePushApply(errArgs, args);
  var err = checkExecSyncError(ret, errArgs);
  if (err) throw err;
  return ret.stdout;
}

/**
 * Spawns a shell executing the given `command` synchronously.
 * @param {string} command
 * @param {{
 *   cwd?: string | URL;
 *   input?: string | Buffer | TypedArray | DataView;
 *   stdio?: string | Array;
 *   env?: Record<string, string>;
 *   shell?: string;
 *   uid?: number;
 *   gid?: number;
 *   timeout?: number;
 *   killSignal?: string | number;
 *   maxBuffer?: number;
 *   encoding?: string;
 *   windowsHide?: boolean;
 *   }} [options]
 * @returns {Buffer | string}
 */
function execSync(command, options) {
  var opts = normalizeExecArgs(command, options, null);
  var inheritStderr = !opts.options.stdio;
  var ret = spawnSync(opts.file, opts.options);
  if (inheritStderr && ret.stderr) process.stderr.write(ret.stderr);
  var err = checkExecSyncError(ret, undefined, command);
  if (err) throw err;
  return ret.stdout;
}
function validateArgumentNullCheck(arg, propName) {
  if (typeof arg === 'string' && StringPrototypeIncludes(arg, '\u0000')) {
    throw new ERR_INVALID_ARG_VALUE(propName, arg, 'must be a string without null bytes');
  }
}
function validateArgumentsNullCheck(args, propName) {
  for (var i = 0; i < args.length; ++i) {
    validateArgumentNullCheck(args[i], `${propName}[${i}]`);
  }
}
function validateTimeout(timeout) {
  if (timeout != null) {
    validateInteger(timeout, 'timeout', 0);
  }
}
function validateMaxBuffer(maxBuffer) {
  if (maxBuffer != null) {
    validateNumber(maxBuffer, 'options.maxBuffer', 0);
  }
}
function sanitizeKillSignal(killSignal) {
  if (typeof killSignal === 'string' || typeof killSignal === 'number') {
    return convertToValidSignal(killSignal);
  } else if (killSignal != null) {
    throw new ERR_INVALID_ARG_TYPE('options.killSignal', ['string', 'number'], killSignal);
  }
}
module.exports = {
  _forkChild,
  ChildProcess,
  exec,
  execFile,
  execFileSync,
  execSync,
  fork,
  spawn,
  spawnSync
};

