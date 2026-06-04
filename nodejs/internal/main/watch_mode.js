'use strict';

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
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
function _call(body, then, direct) {
  if (direct) {
    return then ? then(body()) : body();
  }
  try {
    var result = Promise.resolve(body());
    return then ? result.then(then) : result;
  } catch (e) {
    return Promise.reject(e);
  }
}
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
}
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var init = _async(function () {
  var child = start();
  var restartChild = function () {
    return _await(restart(child), function (_restart) {
      child = _restart;
    });
  };
  watcher.on('changed', restartChild).on('error', error => {
    watcher.off('changed', restartChild);
    triggerUncaughtException(error, true /* fromPromise */);
  });
  return _await();
});
var restart = _async(function (child) {
  if (restarting) return;
  restarting = true;
  return _finallyRethrows(function () {
    if (!kPreserveOutput) process.stdout.write(clear);
    process.stdout.write(`${green}Restarting ${kCommandStr}${white}\n`);
    return _await(stop(child), function () {
      return start();
    });
  }, function (_wasThrown, _result) {
    restarting = false;
    return _rethrow(_wasThrown, _result);
  });
});
var stop = _async(function (child) {
  // Without this line, the child process is still able to receive IPC, but is unable to send additional messages
  watcher.destroyIPC(child);
  watcher.clearFileFilters();
  var clearGraceReport = reportGracefulTermination();
  return _call(killAndWait, function () {
    clearGraceReport();
  });
});
var killAndWait = _async(function () {
  var signal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kKillSignal;
  var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  child?.removeAllListeners();
  if (!child) {
    return;
  }
  if ((child.killed || exited) && !force) {
    return;
  }
  var onExit = once(child, 'exit');
  child.kill(signal);
  return _await(onExit, function (_ref) {
    var {
      0: exitCode
    } = _ref;
    return exitCode;
  });
});
var {
  ArrayPrototypeForEach,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeSlice,
  StringPrototypeStartsWith
} = primordials;
var {
  prepareMainThreadExecution,
  markBootstrapComplete
} = require('internal/process/pre_execution');
var {
  triggerUncaughtException,
  exitCodes: {
    kNoFailure
  }
} = internalBinding('errors');
var {
  getOptionValue
} = require('internal/options');
var {
  FilesWatcher
} = require('internal/watch_mode/files_watcher');
var {
  green,
  blue,
  red,
  white,
  clear
} = require('internal/util/colors');
var {
  convertToValidSignal
} = require('internal/util');
var {
  spawn
} = require('child_process');
var {
  inspect
} = require('util');
var {
  setTimeout,
  clearTimeout
} = require('timers');
var {
  resolve
} = require('path');
var {
  once
} = require('events');
prepareMainThreadExecution(false, false);
markBootstrapComplete();
var kKillSignal = convertToValidSignal(getOptionValue('--watch-kill-signal'));
var kShouldFilterModules = getOptionValue('--watch-path').length === 0;
var kEnvFiles = getOptionValue('--env-file');
var kOptionalEnvFiles = getOptionValue('--env-file-if-exists');
var kWatchedPaths = ArrayPrototypeMap(getOptionValue('--watch-path'), path => resolve(path));
var kPreserveOutput = getOptionValue('--watch-preserve-output');
var kCommand = ArrayPrototypeSlice(process.argv, 1);
var kCommandStr = inspect(ArrayPrototypeJoin(kCommand, ' '));
var argsWithoutWatchOptions = [];
for (var i = 0; i < process.execArgv.length; i++) {
  var arg = process.execArgv[i];
  if (StringPrototypeStartsWith(arg, '--watch=')) {
    continue;
  }
  if (arg === '--watch') {
    var nextArg = process.execArgv[i + 1];
    if (nextArg && nextArg[0] !== '-') {
      // If `--watch` doesn't include `=` and the next
      // argument is not a flag then it is interpreted as
      // the watch argument, so we need to skip that as well
      i++;
    }
    continue;
  }
  if (StringPrototypeStartsWith(arg, '--watch-path')) {
    var lengthOfWatchPathStr = 12;
    if (arg[lengthOfWatchPathStr] !== '=') {
      // if --watch-path doesn't include `=` it means
      // that the next arg is the target path, so we
      // need to skip that as well
      i++;
    }
    continue;
  }
  if (arg === '--experimental-config-file' || StringPrototypeStartsWith(arg, '--experimental-config-file=')) {
    continue;
  }
  if (arg === '--experimental-default-config-file') {
    continue;
  }
  ArrayPrototypePush(argsWithoutWatchOptions, arg);
}
ArrayPrototypePushApply(argsWithoutWatchOptions, kCommand);
var watcher = new FilesWatcher({
  debounce: 200,
  mode: kShouldFilterModules ? 'filter' : 'all'
});
ArrayPrototypeForEach(kWatchedPaths, p => watcher.watchPath(p));
var graceTimer;
var child;
var exited;
function start() {
  exited = false;
  var stdio = kShouldFilterModules ? ['inherit', 'inherit', 'inherit', 'ipc'] : 'inherit';
  child = spawn(process.execPath, argsWithoutWatchOptions, {
    stdio,
    env: _objectSpread(_objectSpread({}, process.env), {}, {
      WATCH_REPORT_DEPENDENCIES: '1'
    })
  });
  watcher.watchChildProcessModules(child);
  if (kEnvFiles.length > 0) {
    ArrayPrototypeForEach(kEnvFiles, file => watcher.filterFile(resolve(file)));
  }
  if (kOptionalEnvFiles.length > 0) {
    ArrayPrototypeForEach(kOptionalEnvFiles, file => watcher.filterFile(resolve(file), undefined, {
      allowMissing: true
    }));
  }
  child.once('exit', code => {
    exited = true;
    var waitingForChanges = 'Waiting for file changes before restarting...';
    if (code === 0) {
      process.stdout.write(`${blue}Completed running ${kCommandStr}. ${waitingForChanges}${white}\n`);
    } else {
      process.stdout.write(`${red}Failed running ${kCommandStr}. ${waitingForChanges}${white}\n`);
    }
  });
  return child;
}
function reportGracefulTermination() {
  // Log if process takes more than 500ms to stop.
  var reported = false;
  clearTimeout(graceTimer);
  graceTimer = setTimeout(() => {
    reported = true;
    process.stdout.write(`${blue}Waiting for graceful termination...${white}\n`);
  }, 500).unref();
  return () => {
    clearTimeout(graceTimer);
    if (reported) {
      if (!kPreserveOutput) {
        process.stdout.write(clear);
      }
      process.stdout.write(`${green}Gracefully restarted ${kCommandStr}${white}\n`);
    }
  };
}
var restarting = false;
init();

// Exiting gracefully to avoid stdout/stderr getting written after
// parent process is killed.
// this is fairly safe since user code cannot run in this process
function signalHandler(signal) {
  return _async(function () {
    watcher.clear();
    return _await(killAndWait(signal, true), function (exitCode) {
      process.exit(exitCode ?? kNoFailure);
    });
  });
}
process.on('SIGTERM', signalHandler('SIGTERM'));
process.on('SIGINT', signalHandler('SIGINT'));

