'use strict';

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
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _catch2(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
function _empty() {}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
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
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
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
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypeForEach,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePop,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  FunctionPrototypeBind,
  Number: _Number,
  PromisePrototypeThen,
  PromiseResolve,
  Proxy,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolSplit,
  StringPrototypeEndsWith,
  StringPrototypeSplit
} = primordials;
var {
  EventEmitter
} = require('events');
var util = require('util');
var {
  setTimeout: pSetTimeout
} = require('timers/promises');
var InspectClient = require('internal/debugger/inspect_client');
var {
  launchChildProcess,
  writeInspectUsageAndExit
} = require('internal/debugger/inspect_helpers');
var {
  parseProbeTokens,
  runProbeMode
} = require('internal/debugger/inspect_probe');
var createRepl = require('internal/debugger/inspect_repl');
var debuglog = util.debuglog('inspect');
var {
  exitCodes: {
    kGenericUserError,
    kInvalidCommandLineArgument,
    kNoFailure
  }
} = internalBinding('errors');
function createAgentProxy(domain, client) {
  var agent = new EventEmitter();
  agent.then = (then, _catch) => {
    // TODO: potentially fetch the protocol and pretty-print it here.
    var descriptor = {
      [util.inspect.custom](depth, _ref) {
        var {
          stylize
        } = _ref;
        return stylize(`[Agent ${domain}]`, 'special');
      }
    };
    return PromisePrototypeThen(PromiseResolve(descriptor), then, _catch);
  };
  return new Proxy(agent, {
    __proto__: null,
    get(target, name) {
      if (name in target) return target[name];
      return function callVirtualMethod(params) {
        return client.callMethod(`${domain}.${name}`, params);
      };
    }
  });
}
var _stdioBuffers = /*#__PURE__*/new WeakMap();
var NodeInspector = /*#__PURE__*/function () {
  function NodeInspector(options, stdin, stdout) {
    var _this = this;
    _classCallCheck(this, NodeInspector);
    _classPrivateFieldInitSpec(this, _stdioBuffers, {
      stdout: '',
      stderr: ''
    });
    this.options = options;
    this.stdin = stdin;
    this.stdout = stdout;
    this.paused = true;
    this.child = null;
    if (options.script) {
      this._runScript = FunctionPrototypeBind(launchChildProcess, null, [options.script].concat(_toConsumableArray(options.scriptArgs)), options.host, options.port, FunctionPrototypeBind(this.childPrint, this));
    } else {
      this._runScript = () => PromiseResolve([null, options.port, options.host]);
    }
    this.client = new InspectClient();
    this.domainNames = ['Debugger', 'HeapProfiler', 'Profiler', 'Runtime'];
    ArrayPrototypeForEach(this.domainNames, domain => {
      this[domain] = createAgentProxy(domain, this.client);
    });
    this.handleDebugEvent = (fullName, params) => {
      var {
        0: domain,
        1: name
      } = StringPrototypeSplit(fullName, '.', 2);
      if (domain in this) {
        this[domain].emit(name, params);
      }
    };
    this.client.on('debugEvent', this.handleDebugEvent);
    var startRepl = createRepl(this);

    // Handle all possible exits
    process.on('exit', () => this.killChild());
    var exitCodeZero = () => process.exit(kNoFailure);
    process.once('SIGTERM', exitCodeZero);
    process.once('SIGHUP', exitCodeZero);
    _async(function () {
      return _continueIgnored(_catch2(function () {
        return _await(_this.run(), function () {
          return _call(startRepl, function (repl) {
            _this.repl = repl;
            _this.repl.on('exit', exitCodeZero);
            _this.paused = false;
          });
        });
      }, function (error) {
        process.nextTick(() => {
          throw error;
        });
      }));
    })();
  }
  return _createClass(NodeInspector, [{
    key: "suspendReplWhile",
    value: function suspendReplWhile(fn) {
      var _this2 = this;
      if (this.repl) {
        this.repl.pause();
      }
      this.stdin.pause();
      this.paused = true;
      return _async(function () {
        return _continueIgnored(_catch2(function () {
          return _call(fn, function () {
            _this2.paused = false;
            if (_this2.repl) {
              _this2.repl.resume();
              _this2.repl.displayPrompt();
            }
            _this2.stdin.resume();
          });
        }, function (error) {
          process.nextTick(() => {
            throw error;
          });
        }));
      })();
    }
  }, {
    key: "killChild",
    value: function killChild() {
      this.client.reset();
      if (this.child) {
        this.child.kill();
        this.child = null;
      }
    }
  }, {
    key: "run",
    value: function run() {
      try {
        var _this3 = this;
        _this3.killChild();
        return _await(_this3._runScript(), function (_ref2) {
          var _exit = false;
          var {
            0: child,
            1: port,
            2: host
          } = _ref2;
          _this3.child = child;
          _this3.print(`connecting to ${host}:${port} ..`, false);
          var attempt = 0;
          return _continue(_for(function () {
            return !_exit && attempt < 5;
          }, function () {
            return attempt++;
          }, function () {
            debuglog('connection attempt #%d', attempt);
            _this3.stdout.write('.');
            return _catch2(function () {
              return _await(_this3.client.connect(port, host), function () {
                debuglog('connection established');
                _this3.stdout.write(' ok\n');
                _exit = true;
              });
            }, function (error) {
              debuglog('connect failed', error);
              return _awaitIgnored(pSetTimeout(1000));
            });
          }), function (_result2) {
            if (_exit) return _result2;
            _this3.stdout.write(' failed to connect, please retry\n');
            process.exit(kGenericUserError);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "clearLine",
    value: function clearLine() {
      if (this.stdout.isTTY) {
        this.stdout.cursorTo(0);
        this.stdout.clearLine(1);
      } else {
        this.stdout.write('\b');
      }
    }
  }, {
    key: "print",
    value: function print(text) {
      var appendNewline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.clearLine();
      this.stdout.write(appendNewline ? `${text}\n` : text);
    }
  }, {
    key: "childPrint",
    value: function childPrint(text, which) {
      var lines = RegExpPrototypeSymbolSplit(/\r\n|\r|\n/g, _classPrivateFieldGet(_stdioBuffers, this)[which] + text);
      _classPrivateFieldGet(_stdioBuffers, this)[which] = '';
      if (lines[lines.length - 1] !== '') {
        _classPrivateFieldGet(_stdioBuffers, this)[which] = ArrayPrototypePop(lines);
      }
      var textToPrint = ArrayPrototypeJoin(ArrayPrototypeMap(lines, chunk => `< ${chunk}`), '\n');
      if (lines.length) {
        this.print(textToPrint, true);
        if (!this.paused) {
          this.repl.displayPrompt(true);
        }
      }
      if (StringPrototypeEndsWith(textToPrint, 'Waiting for the debugger to disconnect...\n')) {
        this.killChild();
      }
    }
  }]);
}();
function parseInteractiveArgs(args) {
  var target = ArrayPrototypeShift(args);
  var host = '127.0.0.1';
  var port = 9229;
  var isRemote = false;
  var script = target;
  var scriptArgs = args;
  var hostMatch = RegExpPrototypeExec(/^([^:]+):(\d+)$/, target);
  var portMatch = RegExpPrototypeExec(/^--port=(\d+)$/, target);
  if (hostMatch) {
    // Connecting to remote debugger
    host = hostMatch[1];
    port = _Number(hostMatch[2]);
    isRemote = true;
    script = null;
  } else if (portMatch) {
    // Start on custom port
    port = _Number(portMatch[1]);
    script = args[0];
    scriptArgs = ArrayPrototypeSlice(args, 1);
  } else if (args.length === 1 && RegExpPrototypeExec(/^\d+$/, args[0]) !== null && target === '-p') {
    // Start debugger against a given pid
    var pid = _Number(args[0]);
    try {
      process._debugProcess(pid);
    } catch (e) {
      if (e.code === 'ESRCH') {
        process.stderr.write(`Target process: ${pid} doesn't exist.\n`);
        process.exit(kGenericUserError);
      }
      throw e;
    }
    script = null;
    isRemote = true;
  }
  return {
    host,
    port,
    isRemote,
    script,
    scriptArgs
  };
}
var kInspectArgOptions = {
  __proto__: null,
  expr: {
    type: 'string'
  },
  help: {
    type: 'boolean',
    short: 'h'
  },
  json: {
    type: 'boolean'
  },
  // Port and timeout use type 'string' because parseArgs has no
  // numeric type; the values are parsed to integers by parseProbeTokens().
  port: {
    type: 'string'
  },
  preview: {
    type: 'boolean'
  },
  probe: {
    type: 'string'
  },
  timeout: {
    type: 'string'
  }
};

// Parses args once and decides whether the user wants the inspect help, probe
// mode, or interactive mode. The mode is determined by the first option,
// option-terminator, or positional token in the input.
//
// Returns one of:
//   { mode: 'help' }
//   { mode: 'probe', tokens, args }
//   { mode: 'interactive' }
function parseInspectMode(args) {
  var {
    tokens
  } = util.parseArgs({
    args,
    allowPositionals: true,
    options: kInspectArgOptions,
    strict: false,
    tokens: true
  });
  for (var token of tokens) {
    if (token.kind === 'option') {
      if (token.name === 'help') return {
        mode: 'help'
      };
      if (token.name === 'probe') {
        // `--probe --help` / `--probe -h` (no value) consumes the help flag
        // as the probe's "value"; surface help instead of a probe error.
        if (!token.inlineValue && (token.value === '--help' || token.value === '-h')) {
          return {
            mode: 'help'
          };
        }
        return {
          mode: 'probe',
          tokens,
          args
        };
      }
    }
    if (token.kind === 'option-terminator' || token.kind === 'positional') {
      break;
    }
  }
  return {
    mode: 'interactive'
  };
}
function startInspect() {
  var argv = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ArrayPrototypeSlice(process.argv, 2);
  var stdin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.stdin;
  var stdout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.stdout;
  var invokedAs = `${process.argv0} ${process.argv[1]}`;
  if (argv.length < 1) {
    writeInspectUsageAndExit(invokedAs, undefined, kInvalidCommandLineArgument);
  }
  var parsed = parseInspectMode(argv);
  if (parsed.mode === 'help') {
    writeInspectUsageAndExit(invokedAs);
  }
  if (parsed.mode === 'probe') {
    var probeOptions;
    try {
      probeOptions = parseProbeTokens(parsed.tokens, parsed.args);
    } catch (error) {
      writeInspectUsageAndExit(invokedAs, error.message, kInvalidCommandLineArgument);
    }
    runProbeMode(stdout, probeOptions);
    return;
  }
  var options = parseInteractiveArgs(argv);
  var inspector = new NodeInspector(options, stdin, stdout);
  stdin.resume();
  function handleUnexpectedError(e) {
    if (e.code !== 'ERR_DEBUGGER_STARTUP_ERROR') {
      process.stderr.write('There was an internal error in Node.js. ' + 'Please report this bug.\n' + `${e.message}\n${e.stack}\n`);
    } else {
      process.stderr.write(e.message);
      process.stderr.write('\n');
    }
    if (inspector.child) inspector.child.kill();
    process.exit(kGenericUserError);
  }
  process.on('uncaughtException', handleUnexpectedError);
}
exports.start = startInspect;

