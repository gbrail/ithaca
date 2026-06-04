'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  MathFloor,
  Number,
  NumberPrototypeToFixed,
  ObjectDefineProperty,
  RegExp,
  RegExpPrototypeExec,
  SafeArrayIterator,
  SafeMap,
  StringPrototypePadStart,
  StringPrototypeSplit,
  StringPrototypeToLowerCase,
  StringPrototypeToUpperCase
} = primordials;
var {
  CHAR_LOWERCASE_B: kTraceBegin,
  CHAR_LOWERCASE_E: kTraceEnd,
  CHAR_LOWERCASE_N: kTraceInstant
} = require('internal/constants');
var {
  inspect,
  format,
  formatWithOptions
} = require('internal/util/inspect');
var {
  getCategoryEnabledBuffer,
  trace
} = internalBinding('trace_events');

// `debugImpls` and `testEnabled` are deliberately not initialized so any call
// to `debuglog()` before `initializeDebugEnv()` is called will throw.
var debugImpls;
var testEnabled;

// `debugEnv` is initial value of process.env.NODE_DEBUG
function initializeDebugEnv(debugEnv) {
  debugImpls = {
    __proto__: null
  };
  if (debugEnv) {
    // This is run before any user code, it's OK not to use primordials.
    debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&').replaceAll('*', '.*').replaceAll(',', '$|^');
    var debugEnvRegex = new RegExp(`^${debugEnv}$`, 'i');
    testEnabled = str => RegExpPrototypeExec(debugEnvRegex, str) !== null;
  } else {
    testEnabled = () => false;
  }
}

// Emits warning when user sets
// NODE_DEBUG=http or NODE_DEBUG=http2.
function emitWarningIfNeeded(set) {
  if ('HTTP' === set || 'HTTP2' === set) {
    process.emitWarning('Setting the NODE_DEBUG environment variable ' + 'to \'' + StringPrototypeToLowerCase(set) + '\' can expose sensitive ' + 'data (such as passwords, tokens and authentication headers) ' + 'in the resulting log.');
  }
}
var noop = () => {};
var utilColors;
function lazyUtilColors() {
  utilColors ??= require('internal/util/colors');
  return utilColors;
}
function debuglogImpl(enabled, set) {
  if (debugImpls[set] === undefined) {
    if (enabled) {
      var pid = process.pid;
      emitWarningIfNeeded(set);
      debugImpls[set] = function debug() {
        var colors = lazyUtilColors().shouldColorize(process.stderr);
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        var msg = formatWithOptions.apply(void 0, [{
          colors
        }].concat(args));
        var coloredPID = inspect(pid, {
          colors
        });
        process.stderr.write(format('%s %s: %s\n', set, coloredPID, msg));
      };
    } else {
      debugImpls[set] = noop;
    }
  }
  return debugImpls[set];
}

// debuglogImpl depends on process.pid and process.env.NODE_DEBUG,
// so it needs to be called lazily in top scopes of internal modules
// that may be loaded before these run time states are allowed to
// be accessed.
function debuglog(set, cb) {
  function init() {
    set = StringPrototypeToUpperCase(set);
    enabled = testEnabled(set);
  }
  var debug = function () {
    init();
    // Only invokes debuglogImpl() when the debug function is
    // called for the first time.
    debug = debuglogImpl(enabled, set);
    if (typeof cb === 'function') {
      ObjectDefineProperty(debug, 'enabled', {
        __proto__: null,
        get() {
          return enabled;
        },
        configurable: true,
        enumerable: true
      });
      cb(debug);
    }
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    switch (args.length) {
      case 1:
        return debug(args[0]);
      case 2:
        return debug(args[0], args[1]);
      default:
        return debug.apply(void 0, _toConsumableArray(new SafeArrayIterator(args)));
    }
  };
  var enabled;
  var test = () => {
    init();
    test = () => enabled;
    return enabled;
  };
  var logger = function () {
    // Improve performance when debug is disabled, avoid calling `new SafeArrayIterator(args)`
    if (enabled === false) return;
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    switch (args.length) {
      case 1:
        return debug(args[0]);
      case 2:
        return debug(args[0], args[1]);
      default:
        return debug.apply(void 0, _toConsumableArray(new SafeArrayIterator(args)));
    }
  };
  ObjectDefineProperty(logger, 'enabled', {
    __proto__: null,
    get() {
      return test();
    },
    configurable: true,
    enumerable: true
  });
  return logger;
}
function pad(value) {
  return StringPrototypePadStart(`${value}`, 2, '0');
}
var kNone = 1 << 0;
var kSkipLog = 1 << 1;
var kSkipTrace = 1 << 2;
var kShouldSkipAll = kSkipLog | kSkipTrace;
var kSecond = 1000;
var kMinute = 60 * kSecond;
var kHour = 60 * kMinute;
function formatTime(ms) {
  var hours = 0;
  var minutes = 0;
  var seconds = 0;
  if (ms >= kSecond) {
    if (ms >= kMinute) {
      if (ms >= kHour) {
        hours = MathFloor(ms / kHour);
        ms = ms % kHour;
      }
      minutes = MathFloor(ms / kMinute);
      ms = ms % kMinute;
    }
    seconds = ms / kSecond;
  }
  if (hours !== 0 || minutes !== 0) {
    ({
      0: seconds,
      1: ms
    } = StringPrototypeSplit(NumberPrototypeToFixed(seconds, 3), '.', 2));
    var res = hours !== 0 ? `${hours}:${pad(minutes)}` : minutes;
    return `${res}:${pad(seconds)}.${ms} (${hours !== 0 ? 'h:m' : ''}m:ss.mmm)`;
  }
  if (seconds !== 0) {
    return `${NumberPrototypeToFixed(seconds, 3)}s`;
  }
  return `${Number(NumberPrototypeToFixed(ms, 3))}ms`;
}
function safeTraceLabel(label) {
  return label.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

/**
 * @typedef {(label: string, timeFormatted: string, args?: any[]) => void} LogImpl
 */

/**
 * Returns true if label was found
 * @param {string} timesStore
 * @param {string} implementation
 * @param {LogImpl} logImp
 * @param {string} label
 * @param {any} args
 * @returns {void}
 */
function timeLogImpl(timesStore, implementation, logImp, label, args) {
  var time = timesStore.get(label);
  if (time === undefined) {
    process.emitWarning(`No such label '${label}' for ${implementation}`);
    return;
  }
  var duration = process.hrtime(time);
  var ms = duration[0] * 1000 + duration[1] / 1e6;
  var formatted = formatTime(ms);
  if (args === undefined) {
    logImp(label, formatted);
  } else {
    logImp(label, formatted, args);
  }
}

/**
 * @param {SafeMap} timesStore
 * @param {string} traceCategory
 * @param {string} implementation
 * @param {number} timerFlags
 * @param {string} logLabel
 * @param {string} traceLabel
 * @returns {void}
 */
function time(timesStore, traceCategory, implementation, timerFlags) {
  var logLabel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'default';
  var traceLabel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;
  // Coerces everything other than Symbol to a string
  logLabel = `${logLabel}`;
  if (traceLabel !== undefined) {
    traceLabel = `${traceLabel}`;
  } else {
    traceLabel = logLabel;
  }
  if (timesStore.has(logLabel)) {
    process.emitWarning(`Label '${logLabel}' already exists for ${implementation}`);
    return;
  }
  if ((timerFlags & kSkipTrace) === 0) {
    traceLabel = safeTraceLabel(traceLabel);
    trace(kTraceBegin, traceCategory, traceLabel, 0);
  }
  timesStore.set(logLabel, process.hrtime());
}

/**
 * @param {SafeMap} timesStore
 * @param {string} traceCategory
 * @param {string} implementation
 * @param {number} timerFlags
 * @param {LogImpl} logImpl
 * @param {string} logLabel
 * @param {string} traceLabel
 * @returns {void}
 */
function timeEnd(timesStore, traceCategory, implementation, timerFlags, logImpl) {
  var logLabel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'default';
  var traceLabel = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : undefined;
  // Coerces everything other than Symbol to a string
  logLabel = `${logLabel}`;
  if (traceLabel !== undefined) {
    traceLabel = `${traceLabel}`;
  } else {
    traceLabel = logLabel;
  }
  if ((timerFlags & kSkipLog) === 0) {
    timeLogImpl(timesStore, implementation, logImpl, logLabel);
  }
  if ((timerFlags & kSkipTrace) === 0) {
    traceLabel = safeTraceLabel(traceLabel);
    trace(kTraceEnd, traceCategory, traceLabel, 0);
  }
  timesStore.delete(logLabel);
}

/**
 * @param {SafeMap} timesStore
 * @param {string} traceCategory
 * @param {string} implementation
 * @param {number} timerFlags
 * @param {LogImpl} logImpl
 * @param {string} logLabel
 * @param {string} traceLabel
 * @param {any[]} args
 * @returns {void}
 */
function timeLog(timesStore, traceCategory, implementation, timerFlags, logImpl) {
  var logLabel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'default';
  var traceLabel = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : undefined;
  var args = arguments.length > 7 ? arguments[7] : undefined;
  // Coerces everything other than Symbol to a string
  logLabel = `${logLabel}`;
  if (traceLabel !== undefined) {
    traceLabel = `${traceLabel}`;
  } else {
    traceLabel = logLabel;
  }
  if ((timerFlags & kSkipLog) === 0) {
    timeLogImpl(timesStore, implementation, logImpl, logLabel, args);
  }
  if ((timerFlags & kSkipTrace) === 0) {
    traceLabel = safeTraceLabel(traceLabel);
    trace(kTraceInstant, traceCategory, traceLabel, 0);
  }
}

/**
 * @type {Record<string, SafeMap>}
 */
var tracesStores;

/**
 * @typedef {(logLabel: string, traceLabel?: string) => void} TimerStart
 */

/**
 * @typedef {(logLabel: string, traceLabel?: string) => void} TimerEnd
 */

/**
 * @typedef {(logLabel: string, traceLabel?: string, args?: any[]) => void} TimerLog
 */

/**
 * Debuglog with time fns and support for trace
 * @param {string} set
 * @param {(startTimer: TimerStart, endTimer: TimerEnd, logTimer: TimerLog) => void} cb
 * @returns {{startTimer: TimerStart, endTimer: TimerEnd, logTimer: TimerLog}}
 */
function debugWithTimer(set, cb) {
  set = StringPrototypeToUpperCase(set);
  if (tracesStores === undefined) {
    tracesStores = {
      __proto__: null
    };
  }

  /**
   * @type {LogImpl}
   */
  function logImpl(label, timeFormatted, args) {
    var pid = process.pid;
    var colors = {
      colors: lazyUtilColors().shouldColorize(process.stderr)
    };
    var coloredPID = inspect(pid, colors);
    if (args === undefined) process.stderr.write(format('%s %s %s: %s\n', set, coloredPID, label, timeFormatted));else process.stderr.write(format.apply(void 0, ['%s %s %s: %s\n', set, coloredPID, label, timeFormatted].concat(_toConsumableArray(new SafeArrayIterator(args)))));
  }
  var traceCategory = `node,node.${StringPrototypeToLowerCase(set)}`;
  var traceCategoryBuffer;
  var debugLogCategoryEnabled = false;
  var timerFlags = kNone;
  function ensureTimerFlagsAreUpdated() {
    timerFlags &= ~kSkipTrace;
    if (traceCategoryBuffer[0] === 0) {
      timerFlags |= kSkipTrace;
    }
  }

  /**
   * @type {TimerStart}
   */
  function internalStartTimer(logLabel, traceLabel) {
    ensureTimerFlagsAreUpdated();
    if ((timerFlags & kShouldSkipAll) === kShouldSkipAll) {
      return;
    }
    time(tracesStores[set], traceCategory, 'debuglog.time', timerFlags, logLabel, traceLabel);
  }

  /**
   * @type {TimerEnd}
   */
  function internalEndTimer(logLabel, traceLabel) {
    ensureTimerFlagsAreUpdated();
    if ((timerFlags & kShouldSkipAll) === kShouldSkipAll) {
      return;
    }
    timeEnd(tracesStores[set], traceCategory, 'debuglog.timeEnd', timerFlags, logImpl, logLabel, traceLabel);
  }

  /**
   * @type {TimerLog}
   */
  function internalLogTimer(logLabel, traceLabel, args) {
    ensureTimerFlagsAreUpdated();
    if ((timerFlags & kShouldSkipAll) === kShouldSkipAll) {
      return;
    }
    timeLog(tracesStores[set], traceCategory, 'debuglog.timeLog', timerFlags, logImpl, logLabel, traceLabel, args);
  }
  function init() {
    if (tracesStores[set] === undefined) {
      tracesStores[set] = new SafeMap();
    }
    emitWarningIfNeeded(set);
    debugLogCategoryEnabled = testEnabled(set);
    traceCategoryBuffer = getCategoryEnabledBuffer(traceCategory);
    timerFlags = kNone;
    if (!debugLogCategoryEnabled) {
      timerFlags |= kSkipLog;
    }
    if (traceCategoryBuffer[0] === 0) {
      timerFlags |= kSkipTrace;
    }
    cb(internalStartTimer, internalEndTimer, internalLogTimer);
  }

  /**
   * @type {TimerStart}
   */
  var startTimer = (logLabel, traceLabel) => {
    init();
    if ((timerFlags & kShouldSkipAll) !== kShouldSkipAll) internalStartTimer(logLabel, traceLabel);
  };

  /**
   * @type {TimerEnd}
   */
  var endTimer = (logLabel, traceLabel) => {
    init();
    if ((timerFlags & kShouldSkipAll) !== kShouldSkipAll) internalEndTimer(logLabel, traceLabel);
  };

  /**
   * @type {TimerLog}
   */
  var logTimer = (logLabel, traceLabel, args) => {
    init();
    if ((timerFlags & kShouldSkipAll) !== kShouldSkipAll) internalLogTimer(logLabel, traceLabel, args);
  };
  return {
    startTimer,
    endTimer,
    logTimer
  };
}
module.exports = {
  kNone,
  kSkipLog,
  kSkipTrace,
  formatTime,
  time,
  timeEnd,
  timeLog,
  debuglog,
  debugWithTimer,
  initializeDebugEnv
};

