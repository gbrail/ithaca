'use strict';

// This files contains process bootstrappers that can be
// run when setting up each thread, including the main
// thread and the worker threads.
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ArrayPrototypeEvery,
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypeSplice,
  BigUint64Array,
  Float64Array,
  FunctionPrototypeCall,
  NumberMAX_SAFE_INTEGER,
  ObjectDefineProperty,
  ObjectEntries,
  ObjectFreeze,
  ReflectApply,
  RegExpPrototypeExec,
  SafeArrayIterator,
  Set,
  SetPrototypeEntries,
  SetPrototypeValues,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  StringPrototypeReplace,
  StringPrototypeSlice,
  Symbol: _Symbol,
  SymbolFor,
  SymbolIterator
} = primordials;
var {
  ErrnoException,
  codes: {
    ERR_FEATURE_UNAVAILABLE_ON_PLATFORM,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_OPERATION_FAILED,
    ERR_OUT_OF_RANGE,
    ERR_UNKNOWN_SIGNAL,
    ERR_WORKER_UNSUPPORTED_OPERATION
  }
} = require('internal/errors');
var {
  emitExperimentalWarning
} = require('internal/util');
var format = require('internal/util/inspect').format;
var {
  validateArray,
  validateNumber,
  validateObject,
  validateString
} = require('internal/validators');
var dc = require('diagnostics_channel');
var execveDiagnosticChannel = dc.channel('process.execve');
var constants = internalBinding('constants').os.signals;
var getValidatedPath; // We need to lazy load it because of the circular dependency.

var kInternal = _Symbol('internal properties');
var {
  exitCodes: {
    kNoFailure
  }
} = internalBinding('errors');
var binding = internalBinding('process_methods');

// The 3 entries filled in by the original process.hrtime contains
// the upper/lower 32 bits of the second part of the value,
// and the remaining nanoseconds of the value.
var hrValues = binding.hrtimeBuffer;
// Use a BigUint64Array because this is actually a bit
// faster than simply returning a BigInt from C++ in V8 7.1.
var hrBigintValues = new BigUint64Array(binding.hrtimeBuffer.buffer, 0, 1);
function hrtime(time) {
  binding.hrtime();
  if (time !== undefined) {
    validateArray(time, 'time');
    if (time.length !== 2) {
      throw new ERR_OUT_OF_RANGE('time', 2, time.length);
    }
    var sec = hrValues[0] * 0x100000000 + hrValues[1] - time[0];
    var nsec = hrValues[2] - time[1];
    var needsBorrow = nsec < 0;
    return [needsBorrow ? sec - 1 : sec, needsBorrow ? nsec + 1e9 : nsec];
  }
  return [hrValues[0] * 0x100000000 + hrValues[1], hrValues[2]];
}
function hrtimeBigInt() {
  binding.hrtimeBigInt();
  return hrBigintValues[0];
}
function nop() {}

// The execution of this function itself should not cause any side effects.
function wrapProcessMethods(binding) {
  var {
    cpuUsage: _cpuUsage,
    threadCpuUsage: _threadCpuUsage,
    memoryUsage: _memoryUsage,
    rss,
    resourceUsage: _resourceUsage,
    loadEnvFile: _loadEnvFile,
    execve: _execve
  } = binding;
  function _rawDebug() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    binding._rawDebug(ReflectApply(format, null, args));
  }

  // Create the argument array that will be passed to the native function.
  var cpuValues = new Float64Array(2);

  // Replace the native function with the JS version that calls the native
  // function.
  function cpuUsage(prevValue) {
    // If a previous value was passed in, ensure it has the correct shape.
    if (prevValue) {
      if (!previousValueIsValid(prevValue.user)) {
        validateObject(prevValue, 'prevValue');
        validateNumber(prevValue.user, 'prevValue.user');
        throw new ERR_INVALID_ARG_VALUE.RangeError('prevValue.user', prevValue.user);
      }
      if (!previousValueIsValid(prevValue.system)) {
        validateNumber(prevValue.system, 'prevValue.system');
        throw new ERR_INVALID_ARG_VALUE.RangeError('prevValue.system', prevValue.system);
      }
    }

    // Call the native function to get the current values.
    _cpuUsage(cpuValues);

    // If a previous value was passed in, return diff of current from previous.
    if (prevValue) {
      return {
        user: cpuValues[0] - prevValue.user,
        system: cpuValues[1] - prevValue.system
      };
    }

    // If no previous value passed in, return current value.
    return {
      user: cpuValues[0],
      system: cpuValues[1]
    };
  }
  var threadCpuValues = new Float64Array(2);

  // Replace the native function with the JS version that calls the native
  // function.
  function threadCpuUsage(prevValue) {
    // If a previous value was passed in, ensure it has the correct shape.
    if (prevValue) {
      if (!previousValueIsValid(prevValue.user)) {
        validateObject(prevValue, 'prevValue');
        validateNumber(prevValue.user, 'prevValue.user');
        throw new ERR_INVALID_ARG_VALUE.RangeError('prevValue.user', prevValue.user);
      }
      if (!previousValueIsValid(prevValue.system)) {
        validateNumber(prevValue.system, 'prevValue.system');
        throw new ERR_INVALID_ARG_VALUE.RangeError('prevValue.system', prevValue.system);
      }
    }
    if (process.platform === 'sunos') {
      throw new ERR_OPERATION_FAILED('threadCpuUsage is not available on SunOS');
    }

    // Call the native function to get the current values.
    _threadCpuUsage(threadCpuValues);

    // If a previous value was passed in, return diff of current from previous.
    if (prevValue) {
      return {
        user: threadCpuValues[0] - prevValue.user,
        system: threadCpuValues[1] - prevValue.system
      };
    }

    // If no previous value passed in, return current value.
    return {
      user: threadCpuValues[0],
      system: threadCpuValues[1]
    };
  }

  // Ensure that a previously passed in value is valid. Currently, the native
  // implementation always returns numbers <= Number.MAX_SAFE_INTEGER.
  function previousValueIsValid(num) {
    return typeof num === 'number' && num <= NumberMAX_SAFE_INTEGER && num >= 0;
  }
  var memValues = new Float64Array(5);
  function memoryUsage() {
    _memoryUsage(memValues);
    return {
      rss: memValues[0],
      heapTotal: memValues[1],
      heapUsed: memValues[2],
      external: memValues[3],
      arrayBuffers: memValues[4]
    };
  }
  memoryUsage.rss = rss;
  function exit(code) {
    if (arguments.length !== 0) {
      process.exitCode = code;
    }
    if (!process._exiting) {
      process._exiting = true;
      process.emit('exit', process.exitCode || kNoFailure);
    }
    // FIXME(joyeecheung): This is an undocumented API that gets monkey-patched
    // in the user land. Either document it, or deprecate it in favor of a
    // better public alternative.
    process.reallyExit(process.exitCode || kNoFailure);

    // If this is a worker, v8::Isolate::TerminateExecution() is called above.
    // That function spoofs the stack pointer to cause the stack guard
    // check to throw the termination exception. Because v8 performs
    // stack guard check upon every function call, we give it a chance.
    //
    // Without this, user code after `process.exit()` would take effect.
    // test/parallel/test-worker-voluntarily-exit-followed-by-addition.js
    // test/parallel/test-worker-voluntarily-exit-followed-by-throw.js
    nop();
  }
  function kill(pid, sig) {
    var err;

    // eslint-disable-next-line eqeqeq
    if (pid != (pid | 0)) {
      throw new ERR_INVALID_ARG_TYPE('pid', 'number', pid);
    }

    // Preserve null signal
    if (sig === (sig | 0)) {
      // XXX(joyeecheung): we have to use process._kill here because
      // it's monkey-patched by tests.
      err = process._kill(pid, sig);
    } else {
      sig ||= 'SIGTERM';
      if (constants[sig]) {
        err = process._kill(pid, constants[sig]);
      } else {
        throw new ERR_UNKNOWN_SIGNAL(sig);
      }
    }
    if (err) throw new ErrnoException(err, 'kill');
    return true;
  }
  function execve(execPath) {
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var env = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.env;
    emitExperimentalWarning('process.execve');
    var {
      isMainThread
    } = require('internal/worker');
    if (!isMainThread) {
      throw new ERR_WORKER_UNSUPPORTED_OPERATION('Calling process.execve');
    } else if (process.platform === 'win32' || process.platform === 'os400') {
      throw new ERR_FEATURE_UNAVAILABLE_ON_PLATFORM('process.execve');
    }
    validateString(execPath, 'execPath');
    validateArray(args, 'args');
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (typeof arg !== 'string' || StringPrototypeIncludes(arg, '\u0000')) {
        throw new ERR_INVALID_ARG_VALUE(`args[${i}]`, arg, 'must be a string without null bytes');
      }
    }
    var envArray = [];
    validateObject(env, 'env');
    for (var {
      0: key,
      1: value
    } of ObjectEntries(env)) {
      if (typeof key !== 'string' || typeof value !== 'string' || StringPrototypeIncludes(key, '\u0000') || StringPrototypeIncludes(value, '\u0000')) {
        throw new ERR_INVALID_ARG_VALUE('env', env, 'must be an object with string keys and values without null bytes');
      } else {
        ArrayPrototypePush(envArray, `${key}=${value}`);
      }
    }
    if (execveDiagnosticChannel.hasSubscribers) {
      execveDiagnosticChannel.publish({
        execPath,
        args,
        env: envArray
      });
    }

    // Perform the system call
    _execve(execPath, args, envArray);
  }
  var resourceValues = new Float64Array(16);
  function resourceUsage() {
    _resourceUsage(resourceValues);
    return {
      userCPUTime: resourceValues[0],
      systemCPUTime: resourceValues[1],
      maxRSS: resourceValues[2],
      sharedMemorySize: resourceValues[3],
      unsharedDataSize: resourceValues[4],
      unsharedStackSize: resourceValues[5],
      minorPageFault: resourceValues[6],
      majorPageFault: resourceValues[7],
      swappedOut: resourceValues[8],
      fsRead: resourceValues[9],
      fsWrite: resourceValues[10],
      ipcSent: resourceValues[11],
      ipcReceived: resourceValues[12],
      signalsCount: resourceValues[13],
      voluntaryContextSwitches: resourceValues[14],
      involuntaryContextSwitches: resourceValues[15]
    };
  }

  /**
   * Loads the `.env` file to process.env.
   * @param {string | URL | Buffer | undefined} path
   */
  function loadEnvFile() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    // Provide optional value so that `loadEnvFile.length` returns 0
    if (path != null) {
      getValidatedPath ??= require('internal/fs/utils').getValidatedPath;
      path = getValidatedPath(path);
      _loadEnvFile(path);
    } else {
      _loadEnvFile();
    }
  }
  return {
    _rawDebug,
    cpuUsage,
    threadCpuUsage,
    resourceUsage,
    memoryUsage,
    kill,
    exit,
    execve,
    loadEnvFile
  };
}
var replaceUnderscoresRegex = /_/g;
var leadingDashesRegex = /^--?/;
var trailingValuesRegex = /=.*$/;

// This builds the initial process.allowedNodeEnvironmentFlags
// from data in the config binding.
function buildAllowedFlags() {
  var {
    envSettings: {
      kAllowedInEnvvar
    },
    types: {
      kBoolean
    }
  } = internalBinding('options');
  var {
    getCLIOptionsInfo
  } = require('internal/options');
  var {
    options,
    aliases
  } = getCLIOptionsInfo();
  var allowedNodeEnvironmentFlags = [];
  for (var {
    0: name,
    1: info
  } of options) {
    if (info.envVarSettings === kAllowedInEnvvar) {
      ArrayPrototypePush(allowedNodeEnvironmentFlags, name);
      if (info.type === kBoolean) {
        var negatedName = `--no-${name.slice(2)}`;
        ArrayPrototypePush(allowedNodeEnvironmentFlags, negatedName);
      }
    }
  }
  function isAccepted(to) {
    if (!to.length || to[0] !== '-' || to === '--') return true;
    var recursiveExpansion = aliases.get(to);
    if (recursiveExpansion) {
      if (recursiveExpansion[0] === to) ArrayPrototypeSplice(recursiveExpansion, 0, 1);
      return ArrayPrototypeEvery(recursiveExpansion, isAccepted);
    }
    return options.get(to).envVarSettings === kAllowedInEnvvar;
  }
  for (var {
    0: from,
    1: expansion
  } of aliases) {
    if (ArrayPrototypeEvery(expansion, isAccepted)) {
      var canonical = from;
      if (StringPrototypeEndsWith(canonical, '=')) canonical = StringPrototypeSlice(canonical, 0, canonical.length - 1);
      if (StringPrototypeEndsWith(canonical, ' <arg>')) canonical = StringPrototypeSlice(canonical, 0, canonical.length - 4);
      ArrayPrototypePush(allowedNodeEnvironmentFlags, canonical);
    }
  }
  var trimLeadingDashes = flag => StringPrototypeReplace(flag, leadingDashesRegex, '');

  // Save these for comparison against flags provided to
  // process.allowedNodeEnvironmentFlags.has() which lack leading dashes.
  var nodeFlags = ArrayPrototypeMap(allowedNodeEnvironmentFlags, trimLeadingDashes);
  var NodeEnvironmentFlagsSet = /*#__PURE__*/function (_Set) {
    function NodeEnvironmentFlagsSet(array) {
      var _this;
      _classCallCheck(this, NodeEnvironmentFlagsSet);
      _this = _callSuper(this, NodeEnvironmentFlagsSet);
      _this[kInternal] = {
        array
      };
      return _this;
    }
    _inherits(NodeEnvironmentFlagsSet, _Set);
    return _createClass(NodeEnvironmentFlagsSet, [{
      key: "add",
      value: function add() {
        // No-op, `Set` API compatible
        return this;
      }
    }, {
      key: "delete",
      value: function _delete() {
        // No-op, `Set` API compatible
        return false;
      }
    }, {
      key: "clear",
      value: function clear() {
        // No-op, `Set` API compatible
      }
    }, {
      key: "has",
      value: function has(key) {
        // This will return `true` based on various possible
        // permutations of a flag, including present/missing leading
        // dash(es) and/or underscores-for-dashes.
        // Strips any values after `=`, inclusive.
        // TODO(addaleax): It might be more flexible to run the option parser
        // on a dummy option set and see whether it rejects the argument or
        // not.
        if (typeof key === 'string') {
          key = StringPrototypeReplace(key, replaceUnderscoresRegex, '-');
          if (RegExpPrototypeExec(leadingDashesRegex, key) !== null) {
            key = StringPrototypeReplace(key, trailingValuesRegex, '');
            return ArrayPrototypeIncludes(this[kInternal].array, key);
          }
          return ArrayPrototypeIncludes(nodeFlags, key);
        }
        return false;
      }
    }, {
      key: "entries",
      value: function entries() {
        this[kInternal].set ??= new Set(new SafeArrayIterator(this[kInternal].array));
        return SetPrototypeEntries(this[kInternal].set);
      }
    }, {
      key: "forEach",
      value: function forEach(callback) {
        var thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        ArrayPrototypeForEach(this[kInternal].array, v => FunctionPrototypeCall(callback, thisArg, v, v, this));
      }
    }, {
      key: "size",
      get: function () {
        return this[kInternal].array.length;
      }
    }, {
      key: "values",
      value: function values() {
        this[kInternal].set ??= new Set(new SafeArrayIterator(this[kInternal].array));
        return SetPrototypeValues(this[kInternal].set);
      }
    }]);
  }(Set);
  var flagSetValues = NodeEnvironmentFlagsSet.prototype.values;
  ObjectDefineProperty(NodeEnvironmentFlagsSet.prototype, SymbolIterator, {
    __proto__: null,
    value: flagSetValues
  });
  ObjectDefineProperty(NodeEnvironmentFlagsSet.prototype, 'keys', {
    __proto__: null,
    value: flagSetValues
  });
  ObjectFreeze(NodeEnvironmentFlagsSet.prototype.constructor);
  ObjectFreeze(NodeEnvironmentFlagsSet.prototype);
  return ObjectFreeze(new NodeEnvironmentFlagsSet(allowedNodeEnvironmentFlags));
}

// Lazy load internal/trace_events_async_hooks only if the async_hooks
// trace event category is enabled.
var traceEventsAsyncHook;
// Dynamically enable/disable the traceEventsAsyncHook
function toggleTraceCategoryState(asyncHooksEnabled) {
  if (asyncHooksEnabled) {
    traceEventsAsyncHook ||= require('internal/trace_events_async_hooks').createHook();
    traceEventsAsyncHook.enable();
  } else if (traceEventsAsyncHook) {
    traceEventsAsyncHook.disable();
  }
}
var {
  arch,
  platform,
  version
} = process;
var refSymbol;
function ref(maybeRefable) {
  if (maybeRefable == null) return;
  var fn = maybeRefable[refSymbol ??= SymbolFor('nodejs.ref')] || maybeRefable.ref;
  if (typeof fn === 'function') FunctionPrototypeCall(fn, maybeRefable);
}
var unrefSymbol;
function unref(maybeRefable) {
  if (maybeRefable == null) return;
  var fn = maybeRefable[unrefSymbol ??= SymbolFor('nodejs.unref')] || maybeRefable.unref;
  if (typeof fn === 'function') FunctionPrototypeCall(fn, maybeRefable);
}
module.exports = {
  toggleTraceCategoryState,
  buildAllowedFlags,
  wrapProcessMethods,
  hrtime,
  hrtimeBigInt,
  arch,
  platform,
  version,
  ref,
  unref
};

