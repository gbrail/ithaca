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
var launchChildProcess = _async(function (childArgs, inspectHost, inspectPort, childOutput) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
    __proto__: null
  };
  return _invoke(function () {
    if (!options.skipPortPreflight) {
      return _awaitIgnored(portIsFree(inspectHost, inspectPort));
    }
  }, function () {
    var args = [`--inspect-brk=${inspectPort}`];
    ArrayPrototypePushApply(args, childArgs);
    var child = spawn(process.execPath, args);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => childOutput(chunk, 'stdout'));
    child.stderr.on('data', chunk => childOutput(chunk, 'stderr'));
    var stderrOutput = '';
    return new Promise((resolve, reject) => {
      function rejectLaunch(message) {
        reject(new ERR_DEBUGGER_STARTUP_ERROR(message, {
          childStderr: stderrOutput
        }));
      }
      function onExit(code, signal) {
        var suffix = signal !== null ? ` (${signal})` : ` (code ${code})`;
        rejectLaunch(`Target exited before the inspector was ready${suffix}`);
      }
      function onError(error) {
        rejectLaunch(error.message);
      }
      function onStderr(text) {
        stderrOutput += text;
        var debug = RegExpPrototypeExec(debugRegex, stderrOutput);
        if (debug) {
          child.stderr.removeListener('data', onStderr);
          child.removeListener('exit', onExit);
          child.removeListener('error', onError);
          resolve([child, Number(debug[2]), debug[1]]);
        }
      }
      child.once('exit', onExit);
      child.once('error', onError);
      child.stderr.on('data', onStderr);
    });
  });
});
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
var portIsFree = _async(function (host, port) {
  var _exit = false;
  var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
  if (port === 0) return; // Binding to a random port.

  var retryDelay = 150;
  var ac = new AbortController();
  var {
    signal
  } = ac;
  pSetTimeout(timeout).then(() => ac.abort());
  var asyncIterator = pSetInterval(retryDelay);
  return _for(function () {
    return !_exit;
  }, void 0, function () {
    return _await(asyncIterator.next(), function () {
      if (signal.aborted) {
        throw new ERR_DEBUGGER_STARTUP_ERROR(`Timeout (${timeout}) waiting for ${host}:${port} to be free`);
      }
      return _await(new Promise(resolve => {
        var socket = net.connect(port, host);
        socket.on('error', resolve);
        socket.on('connect', () => {
          socket.end();
          resolve();
        });
      }), function (error) {
        if (error?.code === 'ECONNREFUSED') {
          _exit = true;
        }
      });
    });
  });
});
var _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;
    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        var value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _for(test, update, body) {
  var stage;
  for (;;) {
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
    if (shouldContinue.then) {
      stage = 0;
      break;
    }
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.s;
      } else {
        stage = 1;
        break;
      }
    }
    if (update) {
      var updateValue = update();
      if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
        stage = 2;
        break;
      }
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    do {
      if (update) {
        updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          updateValue.then(_resumeAfterUpdate).then(void 0, reject);
          return;
        }
      }
      shouldContinue = test();
      if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
        _settle(pact, 1, result);
        return;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (_isSettledPact(result)) {
        result = result.v;
      }
    } while (!result || !result.then);
    result.then(_resumeAfterBody).then(void 0, reject);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
      } else {
        _resumeAfterBody(result);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
  function _resumeAfterUpdate() {
    if (shouldContinue = test()) {
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
      } else {
        _resumeAfterTest(shouldContinue);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
}
var {
  ArrayPrototypePushApply,
  Number,
  Promise,
  RegExpPrototypeExec,
  StringPrototypeEndsWith
} = primordials;
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
  spawn
} = require('child_process');
function _empty() {}
var net = require('net');
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
var {
  setInterval: pSetInterval,
  setTimeout: pSetTimeout
} = require('timers/promises');
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var {
  AbortController
} = require('internal/abort_controller');
var {
  ERR_DEBUGGER_STARTUP_ERROR
} = require('internal/errors').codes;
var {
  exitCodes: {
    kInvalidCommandLineArgument
  }
} = internalBinding('errors');
var debugRegex = /Debugger listening on ws:\/\/\[?(.+?)\]?:(\d+)\//;
function ensureTrailingNewline(text) {
  return StringPrototypeEndsWith(text, '\n') ? text : `${text}\n`;
}
function writeInspectUsageAndExit(invokedAs, message, exitCode) {
  var code = exitCode ?? (message ? kInvalidCommandLineArgument : 0);
  var out = code === 0 ? process.stdout : process.stderr;
  if (message) {
    out.write(`${message}\n`);
  }
  out.write(`Usage: ${invokedAs} [--port=<port>] [<node-option> ...]
                      [<script> [<script-args>] | <host>:<port> | -p <pid>]
       ${invokedAs} --probe <file>:<line>[:<col>] --expr <expr>
                      [--probe <file>:<line>[:<col>] --expr <expr> ...]
                      [--json] [--preview] [--timeout=<ms>] [--port=<port>]
                      [--] [<node-option> ...] <script> [<script-args> ...]

Interactive mode: Starts a live debugging session.

Example:
  $ node inspect script.js

Options:
  --port=<port>         Inspector port for the debuggee (default: 9229)
  <script>              The script to launch and debug.
  <host>:<port>         Remote debugger to connect to.
  -p <pid>              Attach to a running Node.js process by PID

Semantics:
* If neither a script nor a host:port nor -p is provided, node inspect starts
  the REPL.

Non-interactive probe mode: Evaluates expressions whenever execution reaches
specified source locations and prints all the evaluation results to stdout.

Example:
  $ node inspect --probe app.js:10 --expr "user"
                 --probe src/utils.js:5:15 --expr "config.options"
                 --json --preview -- --no-warnings app.js --arg-for-app=foo

Options:
  --probe <file>:<line>[:<col>]
                    Source location of the probe. <file> is matched as a
                    path suffix of every loaded script URL, anchored on
                    a path separator. <line> and the optional <col> are
                    1-based. If <col> is omitted, the probe binds to
                    the first executable column on the line. This option
                    must be immediately followed by a pairing --expr.
  --expr <expr>     Expression to evaluate in the lexical scope of the
                    preceding --probe each time execution reaches it.
                    Avoid probing let/const-bound variables at their
                    declaration site or a ReferenceError may be thrown.
  --json            Output JSON if specified, otherwise human-readable text.
  --preview         Include V8 object previews in JSON output.
  --timeout <ms>    Global session timeout (default: 30000).
  --port <port>     Inspector port for the debuggee (default: 0 = random).

Semantics:
* Multiple --probe/--expr pairs are allowed. Same-location --probes share
  a pause and scope, their --exprs are evaluated in command-line order.
* --probe utils.js:<line>[:<col>] matches every loaded utils.js. Pass a
  fuller path e.g. src/utils.js to narrow the match.
* Use -- before any Node.js flags intended for the child process.
* Target errors are surfaced in the report as a terminal 'error' event.
  The probing process exits 0 unless it encounters an error itself.

See https://nodejs.org/api/debugger.html for details, including the
probe output schema.
`);
  process.exit(code);
}
module.exports = {
  ensureTrailingNewline,
  launchChildProcess,
  writeInspectUsageAndExit
};

