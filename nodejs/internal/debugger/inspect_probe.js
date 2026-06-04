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
var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
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
function _forTo(array, body, check) {
  var i = -1,
    pact,
    reject;
  function _cycle(result) {
    try {
      while (++i < array.length && (!check || !check())) {
        result = body(i);
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
            return;
          }
        }
      }
      if (pact) {
        _settle(pact, 1, result);
      } else {
        pact = result;
      }
    } catch (e) {
      _settle(pact || (pact = new _Pact()), 2, e);
    }
  }
  _cycle();
  return pact;
}
function _forOf(target, body, check) {
  if (typeof target[_iteratorSymbol] === "function") {
    var iterator = target[_iteratorSymbol](),
      step,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (!(step = iterator.next()).done && (!check || !check())) {
          result = body(step.value);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    if (iterator.return) {
      var _fixup = function (value) {
        try {
          if (!step.done) {
            iterator.return();
          }
        } catch (e) {}
        return value;
      };
      if (pact && pact.then) {
        return pact.then(_fixup, function (e) {
          throw _fixup(e);
        });
      }
      _fixup();
    }
    return pact;
  }
  // No support for Symbol.iterator
  if (!("length" in target)) {
    throw new TypeError("Object is not iterable");
  }
  // Handle live collections properly
  var values = [];
  for (var i = 0; i < target.length; i++) {
    values.push(target[i]);
  }
  return _forTo(values, function (i) {
    return body(values[i]);
  }, check);
}
function _empty() {}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _catch(body, recover) {
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
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var runProbeMode = _async(function (stdout, probeOptions) {
  return _continueIgnored(_catch(function () {
    var session = new ProbeInspectorSession(probeOptions);
    return _await(session.run(), function (_ref7) {
      var {
        code,
        report
      } = _ref7;
      stdout.write(probeOptions.json ? `${JSONStringify(probeOptions.preview ? report : stripProbePreviews(report))}\n` : buildProbeTextReport(report));
      process.exit(code);
    });
  }, function (error) {
    if (error.childStderr) {
      process.stderr.write(error.childStderr);
    }
    process.stderr.write(ensureTrailingNewline(error.message));
    process.exit(kGenericUserError);
  }));
});
var {
  ArrayFrom,
  ArrayIsArray,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  FunctionPrototypeBind,
  JSONStringify,
  NumberIsNaN,
  NumberParseInt,
  ObjectEntries,
  PromiseWithResolvers,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolSplit,
  SafeMap,
  SafeSet,
  StringPrototypeIncludes,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
  Symbol: _Symbol
} = primordials;
var {
  clearTimeout,
  setTimeout
} = require('timers');
var {
  SideEffectFreeRegExpPrototypeSymbolReplace
} = require('internal/util');
var debug = require('internal/util/debuglog').debuglog('inspect_probe');
var InspectClient = require('internal/debugger/inspect_client');
var {
  ensureTrailingNewline,
  launchChildProcess
} = require('internal/debugger/inspect_helpers');
var {
  ERR_DEBUGGER_STARTUP_ERROR
} = require('internal/errors').codes;
var {
  exitCodes: {
    kGenericUserError,
    kNoFailure
  }
} = internalBinding('errors');
var kProbeDefaultTimeout = 30000;
var kProbeVersion = 2;
var kProbeDisconnectSentinel = 'Waiting for the debugger to disconnect...';
var kProbeAttachedSentinel = 'Debugger attached.';
var kProbeListeningPrefix = 'Debugger listening on ws://';
var kProbeEndingPrefix = 'Debugger ending on ws://';
var kProbeHelpLine = 'For help, see: https://nodejs.org/learn/getting-started/debugging';
// Thrown by `callCdp` after `recordInspectorFailure` has handled the failure,
// so callers can short-circuit without recording duplicate events.
var kInspectorFailedSentinel = _Symbol('probe.inspectorFailed');
var kStartupTeardownAdvice = 'The target startup may have torn down the inspector. If startup does ' + 'not touch the inspector, this is likely a Node.js bug. Please file an issue.';
var kReviewProbeExprAdvice = 'If the failure repeats, review the probe expression.';
var kDigitsRegex = /^\d+$/;
var kInspectPortRegex = /^--inspect-port=(\d+)$/;

/**
 * The probe request specified by --probe, serialized into the public report.
 * @typedef {object} ProbeTarget
 * @property {string} suffix The raw suffix supplied by the user.
 * @property {number} line 1-based line number.
 * @property {number} [column] 1-based column number.
 */

/**
 * Location where the probe was evaluated, serialized into the public report.
 * @typedef {object} Location
 * @property {string} [url] V8-reported script URL, if known.
 * @property {number} line 1-based line number.
 * @property {number} column 1-based column number.
 */

/**
 * Per-breakpoint state keyed by V8 `breakpointId` from `Debugger.setBreakpointByUrl`.
 * @typedef {object} BreakpointDefinition
 * @property {number[]} probeIndices Indices into probes that bound to this breakpoint.
 */

/**
 * Per-probe state corresponds to each --probe --expr pair.
 * @typedef {object} Probe
 * @property {string} expr Expression to evaluate on hit.
 * @property {ProbeTarget} target User's original --probe request shape.
 * @property {number} hits Count of hits observed.
 */

function parseUnsignedInteger(value, name) {
  var allowZero = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (typeof value !== 'string' || RegExpPrototypeExec(kDigitsRegex, value) === null) {
    throw new ERR_DEBUGGER_STARTUP_ERROR(`Invalid ${name}: ${value}`);
  }
  var parsed = NumberParseInt(value, 10);
  if (NumberIsNaN(parsed) || !allowZero && parsed < 1) {
    throw new ERR_DEBUGGER_STARTUP_ERROR(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

/**
 * @param {string} text Raw `--probe` argument.
 * @returns {ProbeTarget}
 */
function parseProbeTarget(text) {
  // Accepts file:line or file:line:column formats.
  // Non-greedy (.+?) allows Windows drive-letter paths like C:\foo.js:10.
  var match = RegExpPrototypeExec(/^(.+?):(\d+)(?::(\d+))?$/, text);
  if (match === null) {
    throw new ERR_DEBUGGER_STARTUP_ERROR(`Invalid probe location: ${text}`);
  }
  var suffix = match[1];
  var line = parseUnsignedInteger(match[2], 'probe location');
  // Column is left as undefined if the user does not supply one.
  var column = match[3] !== undefined ? parseUnsignedInteger(match[3], 'probe location') : undefined;
  return {
    suffix,
    line,
    column
  };
}
function formatTargetText(target) {
  var {
    suffix,
    line,
    column
  } = target;
  return column === undefined ? `${suffix}:${line}` : `${suffix}:${line}:${column}`;
}
function formatPendingProbeLocations(probes, pending) {
  var seen = new SafeSet();
  for (var probeIndex of pending) {
    seen.add(formatTargetText(probes[probeIndex].target));
  }
  return ArrayPrototypeJoin(ArrayFrom(seen), ', ');
}

// Trim inspector-side noise lines from stderr for reporting child errors.
function trimProbeChildStderr(stderr) {
  var lines = RegExpPrototypeSymbolSplit(/\r\n|\r|\n/g, stderr);
  var kept = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line === '' && i === lines.length - 1) {
      continue;
    }
    if (line === kProbeDisconnectSentinel) {
      continue;
    }
    if (line === kProbeAttachedSentinel) {
      continue;
    }
    if (line === kProbeHelpLine) {
      continue;
    }
    if (StringPrototypeStartsWith(line, kProbeListeningPrefix)) {
      continue;
    }
    if (StringPrototypeStartsWith(line, kProbeEndingPrefix)) {
      continue;
    }
    ArrayPrototypePush(kept, line);
  }
  return ArrayPrototypeJoin(kept, '\n');
}
function formatPreviewPropertyValue(property) {
  if (property.type === 'string') {
    return JSONStringify(property.value ?? '');
  }
  return property.value ?? property.type;
}
function trimRemoteObject(result) {
  if (result === undefined || result === null || typeof result !== 'object') {
    return result;
  }
  if (ArrayIsArray(result)) {
    return ArrayPrototypeMap(result, trimRemoteObject);
  }
  var trimmed = {
    __proto__: null
  };
  for (var {
    0: key,
    1: value
  } of ObjectEntries(result)) {
    if (key === 'objectId' || key === 'className') {
      continue;
    }
    trimmed[key] = trimRemoteObject(value);
  }
  return trimmed;
}
function stripProbePreviews(value) {
  if (value === undefined || value === null || typeof value !== 'object') {
    return value;
  }
  if (ArrayIsArray(value)) {
    return ArrayPrototypeMap(value, stripProbePreviews);
  }
  var stripped = {
    __proto__: null
  };
  for (var {
    0: key,
    1: entry
  } of ObjectEntries(value)) {
    if (key === 'preview') {
      continue;
    }
    stripped[key] = stripProbePreviews(entry);
  }
  return stripped;
}

// Format CDP RemoteObject values into more readable formats.
function formatRemoteObject(result) {
  if (result === undefined) {
    return 'undefined';
  }
  switch (result.type) {
    case 'undefined':
      return 'undefined';
    case 'string':
      return JSONStringify(result.value);
    case 'number':
      if (result.unserializableValue !== undefined) {
        return result.unserializableValue;
      }
      return `${result.value}`;
    case 'boolean':
      return `${result.value}`;
    case 'symbol':
      return result.description || 'Symbol()';
    case 'bigint':
      return result.unserializableValue ?? result.description ?? '0n';
    case 'function':
      return result.description || 'function()';
    case 'object':
      if (result.subtype === 'null') {
        return 'null';
      }
      if (result.subtype === 'error') {
        return result.description || 'Error';
      }
      if (result.preview !== undefined) {
        var properties = ArrayPrototypeJoin(ArrayPrototypeMap(result.preview.properties, result.preview.subtype === 'array' ? property => formatPreviewPropertyValue(property) : property => `${property.name}: ${formatPreviewPropertyValue(property)}`), ', ');
        var suffix = result.preview.overflow ? ', ...' : '';
        if (result.preview.subtype === 'array') {
          return `[${properties}${suffix}]`;
        }
        return `{${properties}${suffix}}`;
      }
      return result.description || result.className || 'Object';
    default:
      return `${result.value ?? result.description ?? ''}`;
  }
}
function formatHitLocation(location) {
  return `${location.url}:${location.line}:${location.column}`;
}

// Built human-readable text output for probe reports.
function buildProbeTextReport(report) {
  var lines = [];
  for (var result of report.results) {
    if (result.event === 'hit') {
      var probe = report.probes[result.probe];
      // If Debugger.scriptParsed was missed and the URL is unknown, fall back to the user's
      // probe target text for readability. This is unlikely unless there's a bug in V8.
      var locText = result.location.url !== undefined ? formatHitLocation(result.location) : formatTargetText(probe.target);
      ArrayPrototypePush(lines, `Hit ${result.hit} at ${locText}`);
      if (result.error !== undefined) {
        ArrayPrototypePush(lines, `  [error] ${probe.expr} = ${result.error.message}`);
      } else {
        ArrayPrototypePush(lines, `  ${probe.expr} = ` + `${formatRemoteObject(result.result)}`);
      }
      continue;
    }
    if (result.event === 'completed') {
      ArrayPrototypePush(lines, 'Completed');
      continue;
    }
    if (result.event === 'miss') {
      ArrayPrototypePush(lines, `Missed probes: ` + `${formatPendingProbeLocations(report.probes, result.pending)}`);
      continue;
    }
    if (result.event === 'timeout') {
      ArrayPrototypePush(lines, result.error.message);
      continue;
    }
    if (result.event === 'error') {
      ArrayPrototypePush(lines, result.error.message);
      if (result.error.stderr !== undefined) {
        ArrayPrototypePush(lines, '  [stderr]');
        var stderrLines = RegExpPrototypeSymbolSplit(/\r\n|\r|\n/g, result.error.stderr);
        for (var i = 0; i < stderrLines.length; i++) {
          if (stderrLines[i] === '' && i === stderrLines.length - 1) {
            continue;
          }
          ArrayPrototypePush(lines, `  ${stderrLines[i]}`);
        }
      }
    }
  }
  return ensureTrailingNewline(ArrayPrototypeJoin(lines, '\n'));
}
function parseProbeTokens(tokens, args) {
  var port = 0;
  var preview = false;
  var timeout = kProbeDefaultTimeout;
  var json = false;
  var sawSeparator = false;
  var childStartIndex = args.length;
  var pendingTarget;
  var expectedExprIndex = -1;
  var probes = [];
  for (var token of tokens) {
    if (token.kind === 'option-terminator') {
      sawSeparator = true;
      childStartIndex = token.index + 1;
      break;
    }
    if (pendingTarget !== undefined) {
      if (token.kind === 'option' && token.name === 'expr' && token.index === expectedExprIndex && token.value !== undefined) {
        ArrayPrototypePush(probes, {
          expr: token.value,
          target: pendingTarget
        });
        pendingTarget = undefined;
        continue;
      }
      throw new ERR_DEBUGGER_STARTUP_ERROR('Each --probe must be followed immediately by --expr <expr>');
    }
    if (token.kind === 'positional') {
      childStartIndex = token.index;
      break;
    }
    switch (token.name) {
      case 'json':
        json = true;
        break;
      case 'timeout':
        if (token.value === undefined) {
          throw new ERR_DEBUGGER_STARTUP_ERROR(`Missing value for ${token.rawName}`);
        }
        timeout = parseUnsignedInteger(token.value, 'timeout', true);
        break;
      case 'port':
        if (token.value === undefined) {
          throw new ERR_DEBUGGER_STARTUP_ERROR(`Missing value for ${token.rawName}`);
        }
        port = parseUnsignedInteger(token.value, 'inspector port', true);
        break;
      case 'preview':
        preview = true;
        break;
      case 'probe':
        pendingTarget = parseProbeTarget(token.value);
        expectedExprIndex = token.index + (token.inlineValue ? 1 : 2);
        break;
      case 'expr':
        throw new ERR_DEBUGGER_STARTUP_ERROR('Unexpected --expr before --probe');
      default:
        if (probes.length > 0) {
          throw new ERR_DEBUGGER_STARTUP_ERROR('Use -- before child Node.js flags in probe mode');
        }
        throw new ERR_DEBUGGER_STARTUP_ERROR(`Unknown probe option: ${token.rawName}`);
    }
  }
  if (pendingTarget !== undefined) {
    throw new ERR_DEBUGGER_STARTUP_ERROR('Each --probe must be followed immediately by --expr <expr>');
  }
  if (probes.length === 0) {
    throw new ERR_DEBUGGER_STARTUP_ERROR('Probe mode requires at least one --probe <loc> --expr <expr> group');
  }
  var childArgv = ArrayPrototypeSlice(args, childStartIndex);
  if (childArgv.length === 0) {
    throw new ERR_DEBUGGER_STARTUP_ERROR('Probe mode requires a child script');
  }
  if (!sawSeparator && StringPrototypeStartsWith(childArgv[0], '-')) {
    throw new ERR_DEBUGGER_STARTUP_ERROR('Use -- before child Node.js flags in probe mode');
  }
  var skipPortPreflight = port === 0;
  for (var arg of childArgv) {
    var inspectPortMatch = RegExpPrototypeExec(kInspectPortRegex, arg);
    if (inspectPortMatch === null) {
      continue;
    }
    if (inspectPortMatch[1] === '0') {
      skipPortPreflight = true;
      continue;
    }
    throw new ERR_DEBUGGER_STARTUP_ERROR('Only child --inspect-port=0 is supported in probe mode');
  }
  return {
    host: '127.0.0.1',
    port,
    preview,
    timeout,
    json,
    probes,
    childArgv,
    skipPortPreflight
  };
}
var ProbeInspectorSession = /*#__PURE__*/function () {
  function ProbeInspectorSession(options) {
    _classCallCheck(this, ProbeInspectorSession);
    this.options = options;
    this.client = new InspectClient();
    this.child = null;
    this.cleanupStarted = false;
    this.childStderr = '';
    this.disconnectRequested = false;
    this.finished = false;
    // True once the inspector WebSocket connects. Event handlers ignore
    // pre-connect exits/closes so launch/connect failures report through run().
    this.connected = false;
    // True once breakpoints are bound and the target is released from --inspect-brk
    // via `Runtime.runIfWaitingForDebugger`.
    // Distinguishes "exited before user code ran" from "exited during the live session".
    this.started = false;
    // A sliding buffer of at most kProbeDisconnectSentinel.length to detect disconnect.
    this.disconnectSentinelBuffer = '';
    /** @type {Map<string, BreakpointDefinition>} keyed by V8 breakpointId. */
    this.breakpointDefinitions = new SafeMap();
    /** @type {Map<string, string>} scriptId -> URL. */
    this.scriptIdToUrl = new SafeMap();
    this.results = [];
    this.timeout = null;
    // The currently-awaited CDP request, or null when no request is in flight.
    /** @type {{ method: string, probe: { index: number, location: Location } | null } | null} */
    this.inFlight = null;
    // Most recently completed probe, used for `error.probe` when a non-evaluate CDP call rejects.
    this.lastProbeIndex = null;
    var {
      promise,
      resolve
    } = PromiseWithResolvers();
    this.completionPromise = promise;
    this.resolveCompletion = resolve;
    /** @type {Probe[]} */
    this.probes = ArrayPrototypeMap(options.probes, _ref => {
      var {
        expr,
        target
      } = _ref;
      return {
        expr,
        target,
        hits: 0
      };
    });
    this.onChildOutput = FunctionPrototypeBind(this.onChildOutput, this);
    this.onChildExit = FunctionPrototypeBind(this.onChildExit, this);
    this.onClientClose = FunctionPrototypeBind(this.onClientClose, this);
    this.onPaused = FunctionPrototypeBind(this.onPaused, this);
    this.onScriptParsed = FunctionPrototypeBind(this.onScriptParsed, this);
  }

  // Marking the probing process to exit with 0, recorded hits are trustworthy.
  return _createClass(ProbeInspectorSession, [{
    key: "finishWithTrustedResult",
    value: function finishWithTrustedResult(terminal) {
      this.finish(kNoFailure, terminal);
    }

    // Marking the probing process to exit with 1, recorded hits are best-effort.
  }, {
    key: "finishWithUnreliableResult",
    value: function finishWithUnreliableResult(terminal) {
      this.finish(kGenericUserError, terminal);
    }
  }, {
    key: "finish",
    value: function finish(exitCode, terminal) {
      if (this.finished) {
        return;
      }
      debug('finish: exitCode=%d, terminal=%s', exitCode, terminal?.event);
      this.finished = true;
      if (this.timeout !== null) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.resolveCompletion({
        exitCode,
        terminal
      });
    }
  }, {
    key: "getProbeTargetExitEvent",
    value: function getProbeTargetExitEvent(exitCode, signal) {
      var pending = this.getPendingProbeIndices();
      var how = signal !== null ? `with signal ${signal}` : `with code ${exitCode}`;
      var status = pending.length === 0 ? 'target completion' : `probes: ${formatPendingProbeLocations(this.probes, pending)}`;
      var error = {
        __proto__: null,
        code: 'probe_target_exit',
        message: `Target exited ${how} before ${status}`
      };
      if (exitCode !== null) {
        error.exitCode = exitCode;
      }
      if (signal !== null) {
        error.signal = signal;
      }
      error.stderr = trimProbeChildStderr(this.childStderr);
      return {
        event: 'error',
        pending,
        error
      };
    }
  }, {
    key: "onChildOutput",
    value: function onChildOutput(text, which) {
      if (which !== 'stderr') {
        return;
      }
      this.childStderr += text;
      var combined = this.disconnectSentinelBuffer + text;
      // Detect the disconnect sentinel.
      if (this.connected && StringPrototypeIncludes(combined, kProbeDisconnectSentinel)) {
        this.disconnectRequested = true;
        this.client.reset();
      }
      if (combined.length > kProbeDisconnectSentinel.length) {
        // Slide the buffer.
        this.disconnectSentinelBuffer = StringPrototypeSlice(combined, combined.length - kProbeDisconnectSentinel.length);
      } else {
        this.disconnectSentinelBuffer = combined;
      }
    }
  }, {
    key: "onChildExit",
    value: function onChildExit(code, signal) {
      debug('child exit: code=%s signal=%s connected=%s started=%s finished=%s inFlight=%j', code, signal, this.connected, this.started, this.finished, this.inFlight);
      // Pre-connect exits are deliberately silent: the target never reached
      // a state where probes could be set, so any report would be empty.
      if (!this.connected) {
        return;
      }
      if (this.finished) {
        return;
      }
      if (this.inFlight !== null && this.inFlight.probe !== null) {
        this.recordInspectorFailure({
          reason: 'Target process exited during probe evaluation',
          advice: kReviewProbeExprAdvice
        });
        return;
      }
      if (this.started && code === 0 && signal === null) {
        var pending = this.getPendingProbeIndices();
        this.finishWithTrustedResult(pending.length === 0 ? {
          event: 'completed'
        } : {
          event: 'miss',
          pending
        });
        return;
      }
      this.finishWithTrustedResult(this.getProbeTargetExitEvent(code, signal));
    }
  }, {
    key: "onClientClose",
    value: function onClientClose() {
      debug('client close: disconnectRequested=%s finished=%s inFlight=%j', this.disconnectRequested, this.finished, this.inFlight);
      if (!this.connected) {
        return;
      }
      if (this.disconnectRequested) {
        return;
      }
      if (this.finished) {
        return;
      }
      if (this.child.exitCode !== null || this.child.signalCode !== null) {
        this.onChildExit(this.child.exitCode, this.child.signalCode);
        return;
      }
      if (!this.started) {
        this.recordInspectorFailure({
          reason: 'Inspector connection lost before probes started',
          advice: kStartupTeardownAdvice
        });
        return;
      }
      if (this.inFlight !== null) {
        if (this.inFlight.probe !== null || this.lastProbeIndex !== null) {
          this.recordInspectorFailure({
            reason: 'Inspector connection lost during probe activity',
            advice: 'A probe expression may have caused the disconnection. ' + 'If the failure repeats, review the probe expressions.'
          });
        } else {
          this.recordInspectorFailure({
            reason: 'Inspector connection lost during inspector activity',
            advice: 'This is likely a Node.js bug. Please file an issue.'
          });
        }
        return;
      }
      this.recordInspectorFailure({
        reason: 'Inspector connection lost',
        advice: 'The target was likely terminated externally. If the failure ' + 'persists, check the target\'s process environment.'
      });
    }
  }, {
    key: "onPaused",
    value: function onPaused(params) {
      this.handlePaused(params).catch(error => {
        if (error === kInspectorFailedSentinel) {
          return;
        }
        this.recordInspectorFailure({
          reason: 'Probe mode encountered an unexpected internal failure',
          advice: 'This is likely a Node.js bug. Please file an issue.',
          internalError: error
        });
      });
    }
  }, {
    key: "handlePaused",
    value: function handlePaused(params) {
      try {
        var _exit = false;
        var _this = this;
        if (_this.finished) {
          return _await();
        }
        var hitBreakpoints = params.hitBreakpoints;
        return _await(_invoke(function () {
          if (hitBreakpoints === undefined || hitBreakpoints.length === 0) {
            return _await(_this.resume(), function () {
              _exit = true;
            });
          }
        }, function (_result) {
          var _exit2 = false;
          if (_exit) return _result;
          var topFrame = params.callFrames?.[0];
          var callFrameId = topFrame?.callFrameId;
          return _invoke(function () {
            if (callFrameId === undefined) {
              return _await(_this.resume(), function () {
                _exit2 = true;
              });
            }
          }, function (_result2) {
            if (_exit2) return _result2;
            var {
              scriptId,
              lineNumber,
              columnNumber
            } = topFrame.location;
            // `Debugger.scriptParsed` should always precede a pause for the same script.
            // It should only be undefined if there's a bug (even in that case, just omit it).
            var location = {
              url: _this.scriptIdToUrl.get(scriptId),
              // CDP locations are 0-based, locations in public report are 1-based.
              line: lineNumber + 1,
              column: columnNumber + 1
            };
            return _continue(_forOf(hitBreakpoints, function (breakpointId) {
              var _interrupt = false;
              // The breakpoint ID is stable even for scripts parsed after the initial resolution
              // so we can count on it here.
              var definition = _this.breakpointDefinitions.get(breakpointId);
              if (definition === undefined) {
                return;
              }

              // Evaluate the expressions in the order they appear on the command line.
              return _continueIgnored(_forOf(definition.probeIndices, function (probeIndex) {
                return _await(_this.evaluateProbe(callFrameId, probeIndex, location), function () {
                  if (_this.finished) {
                    _interrupt = true;
                  }
                });
              }, function () {
                return _interrupt;
              }));
            }), function () {
              return _awaitIgnored(_this.resume());
            });
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "evaluateProbe",
    value: function evaluateProbe(callFrameId, probeIndex, location) {
      try {
        var _this2 = this;
        if (_this2.finished) {
          return _await();
        }
        var probe = _this2.probes[probeIndex];
        return _await(_this2.callCdp('Debugger.evaluateOnCallFrame', {
          callFrameId,
          expression: probe.expr,
          generatePreview: true
        }, {
          __proto__: null,
          index: probeIndex,
          location
        }), function (evaluation) {
          _this2.lastProbeIndex = probeIndex;
          probe.hits++;
          var result = {
            probe: probeIndex,
            event: 'hit',
            hit: probe.hits,
            location
          };
          if (evaluation.exceptionDetails !== undefined) {
            result.error = {
              __proto__: null,
              message: evaluation.result?.description ?? 'Probe expression failed',
              details: {
                __proto__: null,
                exception: trimRemoteObject(evaluation.exceptionDetails)
              }
            };
          } else {
            result.result = trimRemoteObject(evaluation.result);
          }
          ArrayPrototypePush(_this2.results, result);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "resume",
    value: function resume() {
      try {
        var _this3 = this;
        if (_this3.finished) {
          return _await();
        }
        return _await(_awaitIgnored(_this3.callCdp('Debugger.resume')));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "callCdp",
    value: function callCdp(method, params) {
      var probe = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      try {
        var _this4 = this;
        if (_this4.finished) {
          throw kInspectorFailedSentinel;
        }
        _this4.inFlight = {
          __proto__: null,
          method,
          probe
        };
        debug('CDP -> %s%s', method, probe !== null ? `, probe=${probe.index}` : '');
        return _await(_finallyRethrows(function () {
          return _catch(function () {
            return _await(_this4.client.callMethod(method, params), function (result) {
              // A timeout or process exit can finish the report while the CDP request
              // is still outstanding. Ignore the late reply in that case.
              if (_this4.finished) {
                debug('CDP <- %s discarded (already finished)', method);
                throw kInspectorFailedSentinel;
              }
              debug('CDP <- %s (success)', method);
              return result;
            });
          }, function (err) {
            if (err !== kInspectorFailedSentinel) {
              // Already handled.
              debug('CDP <- %s error: %s', method, err?.code);
            }
            if (_this4.disconnectRequested) {
              // Only the in-flight evaluation gets attribution. Other rejections
              // under disconnect are downstream noise.
              if (probe !== null) {
                _this4.recordInspectorFailure({
                  reason: 'Target process exited during probe evaluation',
                  advice: kReviewProbeExprAdvice
                });
              }
              throw kInspectorFailedSentinel;
            }
            // Another event handler already recorded the terminal event.
            if (_this4.finished) {
              throw kInspectorFailedSentinel;
            }
            if (!_this4.started) {
              _this4.recordInspectorFailure({
                reason: 'Probe mode failed before user code ran',
                advice: kStartupTeardownAdvice,
                cdpError: err
              });
            } else if (method === 'Debugger.evaluateOnCallFrame') {
              _this4.recordInspectorFailure({
                reason: 'The inspector could not evaluate a probe expression',
                advice: `The rejection details are recorded on the probe hit. ${kReviewProbeExprAdvice}`,
                cdpError: err
              });
            } else if (_this4.lastProbeIndex !== null) {
              _this4.recordInspectorFailure({
                reason: 'Probe session failed after a probe evaluation',
                advice: 'If the failure repeats, review the most-recently-evaluated probe expression.',
                cdpError: err
              });
            } else {
              _this4.recordInspectorFailure({
                reason: 'Probe session failed during inspector activity',
                advice: 'This is likely a Node.js bug. Please file an issue.',
                cdpError: err
              });
            }
            throw kInspectorFailedSentinel;
          });
        }, function (_wasThrown, _result3) {
          _this4.inFlight = null;
          return _rethrow(_wasThrown, _result3);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    } // Records the first inspector-side terminal for the session, later callers are ignored.
  }, {
    key: "recordInspectorFailure",
    value: function recordInspectorFailure(_ref2) {
      var {
        reason,
        advice,
        cdpError,
        internalError
      } = _ref2;
      if (this.finished) {
        return;
      }
      debug('recordInspectorFailure "%s": inFlight=%j, lastProbeIndex=%s, cdpError=%j', reason, this.inFlight, this.lastProbeIndex, cdpError);
      var child = this.child;
      var exitedAbnormally = child !== null && (child.signalCode !== null || child.exitCode !== null && child.exitCode !== 0);
      var inFlightProbe = this.inFlight === null ? null : this.inFlight.probe;
      // This normally emits `probe_failure`, but yields to `probe_target_exit` when the child
      // has already exited abnormally and there is no in-flight probe to attribute to.
      if (exitedAbnormally && inFlightProbe === null) {
        this.finishWithTrustedResult(this.getProbeTargetExitEvent(child.exitCode, child.signalCode));
        return;
      }
      var failedCdpMethod = this.inFlight === null ? null : this.inFlight.method;
      var protocolError = null;
      // // `ERR_DEBUGGER_ERROR` is a Node-internal code, not a CDP-level protocol code
      if (cdpError !== undefined && cdpError.code !== 'ERR_DEBUGGER_ERROR') {
        protocolError = {
          __proto__: null,
          message: cdpError.message,
          code: cdpError.code
        };
      }
      var protocolErrorGoesOnHit = protocolError !== null && failedCdpMethod === 'Debugger.evaluateOnCallFrame';
      var attribution = null;
      if (inFlightProbe !== null) {
        var {
          index,
          location
        } = inFlightProbe;
        var _error = {
          __proto__: null
        };
        if (protocolErrorGoesOnHit) {
          _error.message = 'Probe evaluation failed at the protocol layer';
          _error.details = {
            __proto__: null,
            protocolError
          };
        } else {
          _error.message = 'Probe evaluation did not complete';
        }
        this.probes[index].hits++;
        ArrayPrototypePush(this.results, {
          probe: index,
          event: 'hit',
          hit: this.probes[index].hits,
          location,
          error: _error
        });
        attribution = index;
      } else if (failedCdpMethod !== null && this.lastProbeIndex !== null) {
        attribution = this.lastProbeIndex;
      }
      // When there is no in-flight CDP call (e.g. `onClientClose` after all probes hit), ignore
      // `lastProbeIndex` since it can't be attributed to a specific probe.

      var pending = this.getPendingProbeIndices();
      var suffix = pending.length === 0 ? '' : ` before probes: ${formatPendingProbeLocations(this.probes, pending)}`;
      var error = {
        __proto__: null,
        code: 'probe_failure',
        message: `${reason}${suffix}. ${advice}`
      };
      if (attribution !== null) {
        error.probe = attribution;
      }
      error.stderr = trimProbeChildStderr(this.childStderr);
      var details;
      if (failedCdpMethod !== null) {
        details = {
          __proto__: null,
          lastCdpMethod: failedCdpMethod
        };
        if (protocolError !== null && !protocolErrorGoesOnHit) {
          details.protocolError = protocolError;
        }
      }
      if (internalError !== undefined) {
        details ??= {
          __proto__: null
        };
        details.internalError = {
          __proto__: null,
          message: internalError?.message,
          stack: internalError?.stack
        };
      }
      if (details !== undefined) {
        error.details = details;
      }
      this.finishWithUnreliableResult({
        event: 'error',
        pending,
        error
      });
    }
  }, {
    key: "startTimeout",
    value: function startTimeout() {
      this.timeout = setTimeout(() => {
        debug('timeout fired: finished=%s, inFlight=%j, lastProbeIndex=%s', this.finished, this.inFlight, this.lastProbeIndex);
        if (this.finished) {
          return;
        }
        if (this.inFlight !== null) {
          var hasProbeAttribution = this.inFlight.probe !== null || this.lastProbeIndex !== null;
          this.recordInspectorFailure({
            reason: 'Probe session timed out',
            advice: hasProbeAttribution ? 'The probe expression may be slow, hanging, or interfering with the inspector connection. ' + 'Try increasing `--timeout`; if the failure persists, review the probe expressions.' : 'Try increasing `--timeout`; if the failure persists, please file an issue.'
          });
          return;
        }
        var pending = this.getPendingProbeIndices();
        var message = `Timed out after ${this.options.timeout}ms waiting for ` + (pending.length === 0 ? 'target completion' : `probes: ${formatPendingProbeLocations(this.probes, pending)}`);
        this.finishWithUnreliableResult({
          event: 'timeout',
          pending,
          error: {
            code: 'probe_timeout',
            message
          }
        });
      }, this.options.timeout);
      this.timeout.unref();
    }
  }, {
    key: "attachListeners",
    value: function attachListeners() {
      this.child.on('exit', this.onChildExit);
      this.client.on('close', this.onClientClose);
      this.client.on('Debugger.paused', this.onPaused);
      this.client.on('Debugger.scriptParsed', this.onScriptParsed);
    }
  }, {
    key: "onScriptParsed",
    value: function onScriptParsed(params) {
      // This map grows by the number of scripts parsed, which is limited, and is just a
      // small string -> string map. The lifetime is bounded by probe timeout etc. so cleanup is overkill.
      this.scriptIdToUrl.set(params.scriptId, params.url);
    }
  }, {
    key: "bindBreakpoints",
    value: function bindBreakpoints() {
      try {
        var _this5 = this;
        var uniqueTargets = new SafeMap();
        for (var probeIndex = 0; probeIndex < _this5.probes.length; probeIndex++) {
          var {
            target
          } = _this5.probes[probeIndex];
          var key = `${target.suffix}\n${target.line}\n${target.column ?? ''}`;
          var entry = uniqueTargets.get(key);
          if (entry === undefined) {
            entry = {
              target,
              probeIndices: []
            };
            uniqueTargets.set(key, entry);
          }
          ArrayPrototypePush(entry.probeIndices, probeIndex);
        }
        return _await(_continueIgnored(_forOf(uniqueTargets.values(), function (_ref3) {
          var {
            target,
            probeIndices
          } = _ref3;
          // On Windows, normalize backslashes to forward slashes so the regex matches
          // V8 script URLs which always use forward slashes.
          var normalizedFile = process.platform === 'win32' ? SideEffectFreeRegExpPrototypeSymbolReplace(/\\/g, target.suffix, '/') : target.suffix;
          var escapedPath = SideEffectFreeRegExpPrototypeSymbolReplace(/([/\\.?*()^${}|[\]])/g, normalizedFile, '\\$1');
          var params = {
            urlRegex: `^(.*[\\/\\\\])?${escapedPath}$`,
            // CDP locations are 0-based, the probe target from CLI is 1-based.
            lineNumber: target.line - 1
          };
          if (target.column !== undefined) {
            // Only pass columnNumber to CDP when the user specifies one, otherwise let
            // the inspector bind to the first executable column.
            params.columnNumber = target.column - 1;
          }
          return _await(_this5.callCdp('Debugger.setBreakpointByUrl', params), function (result) {
            _this5.breakpointDefinitions.set(result.breakpointId, {
              probeIndices
            });
          });
        })));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "getPendingProbeIndices",
    value: function getPendingProbeIndices() {
      var pending = [];
      for (var probeIndex = 0; probeIndex < this.probes.length; probeIndex++) {
        if (this.probes[probeIndex].hits === 0) {
          ArrayPrototypePush(pending, probeIndex);
        }
      }
      return pending;
    }
  }, {
    key: "buildReport",
    value: function buildReport(_ref4) {
      var {
        exitCode,
        terminal
      } = _ref4;
      var results = ArrayPrototypeSlice(this.results);
      ArrayPrototypePush(results, terminal);
      return {
        code: exitCode,
        report: {
          v: kProbeVersion,
          probes: ArrayPrototypeMap(this.probes, _ref5 => {
            var {
              expr,
              target
            } = _ref5;
            return {
              expr,
              target
            };
          }),
          results
        }
      };
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      try {
        var _this6 = this;
        if (_this6.cleanupStarted) {
          return _await();
        }
        _this6.cleanupStarted = true;
        if (_this6.timeout !== null) {
          clearTimeout(_this6.timeout);
          _this6.timeout = null;
        }
        _this6.client.reset();
        if (_this6.child === null) {
          return _await();
        }
        if (_this6.child.exitCode === null && _this6.child.signalCode === null) {
          _this6.child.kill();
        }
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "run",
    value: function run() {
      try {
        var _this7 = this;
        return _await(_finallyRethrows(function () {
          var {
            childArgv,
            host,
            port,
            skipPortPreflight
          } = _this7.options;
          return _await(launchChildProcess(childArgv, host, port, _this7.onChildOutput, {
            skipPortPreflight
          }), function (_ref6) {
            var {
              0: child,
              1: actualPort,
              2: actualHost
            } = _ref6;
            _this7.child = child;
            // On Debugger.enable, V8 emits Debugger.scriptParsed for all existing scripts.
            // Attach the listener early to make sure we don't miss any events.
            _this7.attachListeners();
            return _await(_this7.client.connect(actualPort, actualHost), function () {
              var _exit3 = false;
              _this7.connected = true;
              return _continue(_catch(function () {
                return _await(_this7.callCdp('Runtime.enable'), function () {
                  return _await(_this7.callCdp('Debugger.enable'), function () {
                    return _await(_this7.bindBreakpoints(), function () {
                      _this7.started = true;
                      _this7.startTimeout();
                      return _awaitIgnored(_this7.callCdp('Runtime.runIfWaitingForDebugger'));
                    });
                  });
                });
              }, function (err) {
                if (err !== kInspectorFailedSentinel) {
                  throw err;
                }
              }), function (_result5) {
                return _exit3 ? _result5 : _await(_this7.completionPromise, function (state) {
                  return _this7.buildReport(state);
                });
              });
            });
          });
        }, function (_wasThrown2, _result4) {
          return _await(_this7.cleanup(), function () {
            return _rethrow(_wasThrown2, _result4);
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);
}();
module.exports = {
  parseProbeTokens,
  runProbeMode
};

