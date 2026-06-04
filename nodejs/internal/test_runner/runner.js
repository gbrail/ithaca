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
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
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
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
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
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayIsArray,
  ArrayPrototypeEvery,
  ArrayPrototypeFilter,
  ArrayPrototypeFind,
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  ArrayPrototypeSort,
  MathMax,
  ObjectAssign,
  PromisePrototypeThen,
  PromiseWithResolvers,
  SafeMap,
  SafePromiseAll,
  SafePromiseAllReturnVoid,
  SafePromiseAllSettledReturnVoid,
  SafeSet,
  String: _String,
  StringFromCharCode,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
  Symbol: _Symbol,
  TypedArrayPrototypeGetLength,
  TypedArrayPrototypeSubarray
} = primordials;
var {
  spawn
} = require('child_process');
var {
  finished
} = require('internal/streams/end-of-stream');
var {
  availableParallelism
} = require('os');
var {
  resolve,
  sep,
  isAbsolute
} = require('path');
var {
  DefaultDeserializer,
  DefaultSerializer
} = require('v8');
var {
  getOptionValue,
  getOptionsAsFlagsFromBinding
} = require('internal/options');
var {
  Interface
} = require('internal/readline/interface');
var {
  deserializeError
} = require('internal/error_serdes');
var {
  Buffer
} = require('buffer');
var {
  FilesWatcher
} = require('internal/watch_mode/files_watcher');
var console = require('internal/console/global');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_TEST_FAILURE
  }
} = require('internal/errors');
var esmLoader = require('internal/modules/esm/loader');
var {
  validateArray,
  validateBoolean,
  validateFunction,
  validateObject,
  validateOneOf,
  validateInteger,
  validateUint32,
  validateString,
  validateStringArray
} = require('internal/validators');
var {
  getInspectPort,
  isUsingInspector,
  isInspectorMessage
} = require('internal/util/inspector');
var {
  isRegExp
} = require('internal/util/types');
var {
  pathToFileURL
} = require('internal/url');
var {
  emitExperimentalWarning,
  kEmptyObject
} = require('internal/util');
var {
  kEmitMessage
} = require('internal/test_runner/tests_stream');
var {
  createTestTree,
  startSubtestAfterBootstrap
} = require('internal/test_runner/harness');
var {
  kAborted,
  kCancelledByParent,
  kSubtestsFailed,
  kTestCodeFailure,
  kTestTimeoutFailure,
  Test
} = require('internal/test_runner/test');
var {
  FastBuffer
} = require('internal/buffer');
var {
  createRandomSeed,
  convertStringToRegExp,
  countCompletedTest,
  kDefaultPattern,
  parseCommandLine
} = require('internal/test_runner/utils');
var {
  validateAndCanonicalizeTagFilter
} = require('internal/test_runner/tag_filter');
var {
  Glob
} = require('internal/fs/glob');
var {
  once
} = require('events');
var {
  validatePath
} = require('internal/fs/utils');
var {
  loadPreloadModules
} = require('internal/process/pre_execution');
var {
  triggerUncaughtException,
  exitCodes: {
    kGenericUserError
  }
} = internalBinding('errors');
var debug = require('internal/util/debuglog').debuglog('test_runner', fn => {
  debug = fn;
});
var kIsolatedProcessName = _Symbol('kIsolatedProcessName');
var kFilterArgs = ['--test', '--experimental-test-coverage', '--test-randomize', '--watch', '--experimental-default-config-file'];
var kFilterArgValues = ['--experimental-test-tag-filter', '--test-reporter', '--test-reporter-destination', '--test-random-seed', '--experimental-config-file'];
var kDiagnosticsFilterArgs = ['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo', 'duration_ms'];
var kCanceledTests = new SafeSet().add(kCancelledByParent).add(kAborted).add(kTestTimeoutFailure);

// Execution-ordered events are forwarded immediately, bypassing the
// per-file declaration-order buffer.
var kExecutionOrderedEvents = new SafeSet().add('test:enqueue').add('test:dequeue').add('test:complete');
var kResistStopPropagation;

// Worker ID pool management for concurrent test execution
var _nextId = /*#__PURE__*/new WeakMap();
var _maxConcurrency = /*#__PURE__*/new WeakMap();
var WorkerIdPool = /*#__PURE__*/function () {
  function WorkerIdPool(maxConcurrency) {
    _classCallCheck(this, WorkerIdPool);
    _classPrivateFieldInitSpec(this, _nextId, 0);
    _classPrivateFieldInitSpec(this, _maxConcurrency, void 0);
    _classPrivateFieldSet(_maxConcurrency, this, maxConcurrency);
  }
  return _createClass(WorkerIdPool, [{
    key: "acquire",
    value: function acquire() {
      var _this$nextId, _this$nextId2;
      var id = (_classPrivateFieldSet(_nextId, this, (_this$nextId = _classPrivateFieldGet(_nextId, this), _this$nextId2 = _this$nextId++, _this$nextId)), _this$nextId2) % _classPrivateFieldGet(_maxConcurrency, this) + 1;
      return id;
    }
  }]);
}();
function createTestFileList(patterns, cwd) {
  var hasUserSuppliedPattern = patterns != null;
  if (!patterns || patterns.length === 0) {
    patterns = [kDefaultPattern];
  }
  var glob = new Glob(patterns, {
    __proto__: null,
    cwd,
    exclude: name => name === 'node_modules'
  });
  var results = glob.globSync();
  if (hasUserSuppliedPattern && results.length === 0 && ArrayPrototypeEvery(glob.matchers, m => !m.hasMagic())) {
    console.error(`Could not find '${ArrayPrototypeJoin(patterns, ', ')}'`);
    process.exit(kGenericUserError);
  }
  return ArrayPrototypeSort(results);
}
function filterExecArgv(arg, i, arr) {
  return !ArrayPrototypeIncludes(kFilterArgs, arg) && !ArrayPrototypeSome(kFilterArgValues, p => {
    return arg === p || StringPrototypeStartsWith(arg, `${p}=`) || p !== '--experimental-config-file' && i > 0 && arr[i - 1] === p;
  });
}
function getRunArgs(path, _ref) {
  var {
    forceExit,
    inspectPort,
    testNamePatterns,
    testSkipPatterns,
    testTagFilterExpressions,
    only,
    argv: suppliedArgs,
    execArgv,
    rerunFailuresFilePath,
    randomize,
    randomSeed,
    root: {
      timeout
    },
    cwd
  } = _ref;
  var processNodeOptions = getOptionsAsFlagsFromBinding();
  var runArgs = ArrayPrototypeFilter(processNodeOptions, filterExecArgv);

  /**
   * Node supports V8 options passed via cli.
   * These options are being consumed by V8 and are not stored in nodeOptions.
   *
   * We need to propagate these options to the child processes manually.
   *
   * An example of such option are --allow-natives-syntax and --expose-gc
   */
  var nodeOptionsSet = new SafeSet(processNodeOptions);
  var unknownProcessExecArgv = ArrayPrototypeFilter(process.execArgv, arg => !nodeOptionsSet.has(arg));
  ArrayPrototypePushApply(runArgs, unknownProcessExecArgv);
  if (forceExit === true) {
    ArrayPrototypePush(runArgs, '--test-force-exit');
  }
  if (isUsingInspector()) {
    ArrayPrototypePush(runArgs, `--inspect-port=${getInspectPort(inspectPort)}`);
  }
  if (testNamePatterns != null) {
    ArrayPrototypeForEach(testNamePatterns, pattern => ArrayPrototypePush(runArgs, `--test-name-pattern=${pattern}`));
  }
  if (testSkipPatterns != null) {
    ArrayPrototypeForEach(testSkipPatterns, pattern => ArrayPrototypePush(runArgs, `--test-skip-pattern=${pattern}`));
  }
  if (testTagFilterExpressions != null) {
    ArrayPrototypeForEach(testTagFilterExpressions, value => ArrayPrototypePush(runArgs, `--experimental-test-tag-filter=${value}`));
  }
  if (only === true) {
    ArrayPrototypePush(runArgs, '--test-only');
  }
  if (timeout != null) {
    ArrayPrototypePush(runArgs, `--test-timeout=${timeout}`);
  }
  if (rerunFailuresFilePath) {
    ArrayPrototypePush(runArgs, `--test-rerun-failures=${rerunFailuresFilePath}`);
  }
  if (randomize) {
    ArrayPrototypePush(runArgs, '--test-randomize');
  }
  if (randomSeed != null) {
    ArrayPrototypePush(runArgs, `--test-random-seed=${randomSeed}`);
  }
  ArrayPrototypePushApply(runArgs, execArgv);
  if (path === kIsolatedProcessName) {
    ArrayPrototypePush(runArgs, '--test');
    ArrayPrototypePushApply(runArgs, ArrayPrototypeSlice(process.argv, 1));
  } else {
    ArrayPrototypePush(runArgs, path);
  }
  ArrayPrototypePushApply(runArgs, suppliedArgs);
  return runArgs;
}
var serializer = new DefaultSerializer();
serializer.writeHeader();
var v8Header = serializer.releaseBuffer();
var kV8HeaderLength = TypedArrayPrototypeGetLength(v8Header);
var kSerializedSizeHeader = 4 + kV8HeaderLength;
var _reportBuffer = /*#__PURE__*/new WeakMap();
var _rawBuffer = /*#__PURE__*/new WeakMap();
var _rawBufferSize = /*#__PURE__*/new WeakMap();
var _reportedChildren = /*#__PURE__*/new WeakMap();
var _pendingPartialV8Header = /*#__PURE__*/new WeakMap();
var _FileTest_brand = /*#__PURE__*/new WeakSet();
var FileTest = /*#__PURE__*/function (_Test) {
  function FileTest(options) {
    var _this;
    _classCallCheck(this, FileTest);
    _this = _callSuper(this, FileTest, [options]);
    _classPrivateMethodInitSpec(_this, _FileTest_brand);
    // This class maintains two buffers:
    _classPrivateFieldInitSpec(_this, _reportBuffer, []);
    // Parsed items waiting for this.isClearToSend()
    _classPrivateFieldInitSpec(_this, _rawBuffer, []);
    // Raw data waiting to be parsed
    _classPrivateFieldInitSpec(_this, _rawBufferSize, 0);
    _classPrivateFieldInitSpec(_this, _reportedChildren, 0);
    _classPrivateFieldInitSpec(_this, _pendingPartialV8Header, false);
    _defineProperty(_this, "failedSubtests", false);
    _this.loc ??= {
      __proto__: null,
      line: 1,
      column: 1,
      file: resolve(_this.name)
    };
    _this.timeout = null;
    return _this;
  }
  _inherits(FileTest, _Test);
  return _createClass(FileTest, [{
    key: "addToReport",
    value: function addToReport(item) {
      if (kExecutionOrderedEvents.has(item.type)) {
        _assertClassBrand(_FileTest_brand, this, _handleReportItem).call(this, item);
        return;
      }
      _assertClassBrand(_FileTest_brand, this, _accumulateReportItem).call(this, item);
      if (!this.isClearToSend()) {
        ArrayPrototypePush(_classPrivateFieldGet(_reportBuffer, this), item);
        return;
      }
      _assertClassBrand(_FileTest_brand, this, _drainReportBuffer).call(this);
      _assertClassBrand(_FileTest_brand, this, _handleReportItem).call(this, item);
    }
  }, {
    key: "reportStarted",
    value: function reportStarted() {}
  }, {
    key: "drain",
    value: function drain() {
      _assertClassBrand(_FileTest_brand, this, _drainRawBuffer).call(this);
      _assertClassBrand(_FileTest_brand, this, _drainReportBuffer).call(this);
    }
  }, {
    key: "report",
    value: function report() {
      this.drain();
      var skipReporting = _assertClassBrand(_FileTest_brand, this, _skipReporting).call(this);
      if (!skipReporting) {
        _superPropGet(FileTest, "reportStarted", this, 3)([]);
        _superPropGet(FileTest, "report", this, 3)([]);
      }
    }
  }, {
    key: "parseMessage",
    value: function parseMessage(readData) {
      var dataLength = TypedArrayPrototypeGetLength(readData);
      if (_classPrivateFieldGet(_pendingPartialV8Header, this)) {
        readData = Buffer.concat([TypedArrayPrototypeSubarray(v8Header, 0, 1), readData]);
        dataLength = TypedArrayPrototypeGetLength(readData);
        _classPrivateFieldSet(_pendingPartialV8Header, this, false);
      }
      if (dataLength === 0) return;
      var partialV8Header = readData[dataLength - 1] === v8Header[0];
      if (partialV8Header) {
        // This will break if v8Header length (2 bytes) is changed.
        // However it is covered by tests.
        readData = TypedArrayPrototypeSubarray(readData, 0, dataLength - 1);
        dataLength--;
      }
      if (dataLength > 0) {
        if (_classPrivateFieldGet(_rawBuffer, this)[0] && TypedArrayPrototypeGetLength(_classPrivateFieldGet(_rawBuffer, this)[0]) < kSerializedSizeHeader) {
          _classPrivateFieldGet(_rawBuffer, this)[0] = Buffer.concat([_classPrivateFieldGet(_rawBuffer, this)[0], readData]);
        } else {
          ArrayPrototypePush(_classPrivateFieldGet(_rawBuffer, this), readData);
        }
        _classPrivateFieldSet(_rawBufferSize, this, _classPrivateFieldGet(_rawBufferSize, this) + dataLength);
        _assertClassBrand(_FileTest_brand, this, _processRawBuffer).call(this);
      }
      if (partialV8Header) {
        _classPrivateFieldSet(_pendingPartialV8Header, this, true);
      }
    }
  }]);
}(Test);
function _skipReporting() {
  return _classPrivateFieldGet(_reportedChildren, this) > 0 && (!this.error || this.error.failureType === kSubtestsFailed);
}
function _checkNestedComment(comment) {
  var firstSpaceIndex = StringPrototypeIndexOf(comment, ' ');
  if (firstSpaceIndex === -1) return false;
  var secondSpaceIndex = StringPrototypeIndexOf(comment, ' ', firstSpaceIndex + 1);
  return secondSpaceIndex === -1 && ArrayPrototypeIncludes(kDiagnosticsFilterArgs, StringPrototypeSlice(comment, 0, firstSpaceIndex));
}
function _handleReportItem(item) {
  var isTopLevel = item.data.nesting === 0;
  if (isTopLevel) {
    if (item.type === 'test:plan' && _assertClassBrand(_FileTest_brand, this, _skipReporting).call(this)) {
      return;
    }
    if (item.type === 'test:diagnostic' && _assertClassBrand(_FileTest_brand, this, _checkNestedComment).call(this, item.data.message)) {
      return;
    }
  }
  if (item.data.details?.error) {
    item.data.details.error = deserializeError(item.data.details.error);
  }
  if (item.type === 'test:pass' || item.type === 'test:fail') {
    item.data.testNumber = isTopLevel ? this.root.harness.counters.topLevel + 1 : item.data.testNumber;
    countCompletedTest({
      __proto__: null,
      name: item.data.name,
      finished: true,
      skipped: item.data.skip !== undefined,
      isTodo: item.data.todo !== undefined,
      passed: item.type === 'test:pass',
      cancelled: kCanceledTests.has(item.data.details?.error?.failureType),
      nesting: item.data.nesting,
      reportedType: item.data.details?.type
    }, this.root.harness);
  }
  this.reporter[kEmitMessage](item.type, item.data);
}
function _accumulateReportItem(item) {
  var _this$reportedChildre, _this$reportedChildre2;
  if (item.type !== 'test:pass' && item.type !== 'test:fail') {
    return;
  }
  _classPrivateFieldSet(_reportedChildren, this, (_this$reportedChildre = _classPrivateFieldGet(_reportedChildren, this), _this$reportedChildre2 = _this$reportedChildre++, _this$reportedChildre)), _this$reportedChildre2;
  if (item.data.nesting === 0 && item.type === 'test:fail') {
    this.failedSubtests = true;
  }
}
function _drainReportBuffer() {
  if (_classPrivateFieldGet(_reportBuffer, this).length > 0) {
    ArrayPrototypeForEach(_classPrivateFieldGet(_reportBuffer, this), ast => _assertClassBrand(_FileTest_brand, this, _handleReportItem).call(this, ast));
    _classPrivateFieldSet(_reportBuffer, this, []);
  }
}
function _drainRawBuffer() {
  if (_classPrivateFieldGet(_pendingPartialV8Header, this)) {
    var _this$rawBufferSize, _this$rawBufferSize2;
    ArrayPrototypePush(_classPrivateFieldGet(_rawBuffer, this), TypedArrayPrototypeSubarray(v8Header, 0, 1));
    _classPrivateFieldSet(_rawBufferSize, this, (_this$rawBufferSize = _classPrivateFieldGet(_rawBufferSize, this), _this$rawBufferSize2 = _this$rawBufferSize++, _this$rawBufferSize)), _this$rawBufferSize2;
    _classPrivateFieldSet(_pendingPartialV8Header, this, false);
  }
  while (_classPrivateFieldGet(_rawBuffer, this).length > 0) {
    var prevBufferLength = _classPrivateFieldGet(_rawBuffer, this).length;
    var prevBufferSize = _classPrivateFieldGet(_rawBufferSize, this);
    _assertClassBrand(_FileTest_brand, this, _processRawBuffer).call(this);
    if (_classPrivateFieldGet(_rawBuffer, this).length === prevBufferLength && _classPrivateFieldGet(_rawBufferSize, this) === prevBufferSize) {
      var _this$rawBufferSize3, _this$rawBufferSize4;
      var bufferHead = _classPrivateFieldGet(_rawBuffer, this)[0];
      this.addToReport({
        __proto__: null,
        type: 'test:stdout',
        data: {
          __proto__: null,
          file: this.name,
          message: StringFromCharCode(bufferHead[0])
        }
      });
      if (TypedArrayPrototypeGetLength(bufferHead) === 1) {
        ArrayPrototypeShift(_classPrivateFieldGet(_rawBuffer, this));
      } else {
        _classPrivateFieldGet(_rawBuffer, this)[0] = TypedArrayPrototypeSubarray(bufferHead, 1);
      }
      _classPrivateFieldSet(_rawBufferSize, this, (_this$rawBufferSize3 = _classPrivateFieldGet(_rawBufferSize, this), _this$rawBufferSize4 = _this$rawBufferSize3--, _this$rawBufferSize3)), _this$rawBufferSize4;
    }
  }
}
function _processRawBuffer() {
  // This method is called when it is known that there is at least one message
  var bufferHead = _classPrivateFieldGet(_rawBuffer, this)[0];
  var headerIndex = bufferHead.indexOf(v8Header);
  var nonSerialized = new FastBuffer();
  while (bufferHead && headerIndex !== 0) {
    var nonSerializedData = headerIndex === -1 ? bufferHead : bufferHead.slice(0, headerIndex);
    nonSerialized = Buffer.concat([nonSerialized, nonSerializedData]);
    _classPrivateFieldSet(_rawBufferSize, this, _classPrivateFieldGet(_rawBufferSize, this) - TypedArrayPrototypeGetLength(nonSerializedData));
    if (headerIndex === -1) {
      ArrayPrototypeShift(_classPrivateFieldGet(_rawBuffer, this));
    } else {
      _classPrivateFieldGet(_rawBuffer, this)[0] = TypedArrayPrototypeSubarray(bufferHead, headerIndex);
    }
    bufferHead = _classPrivateFieldGet(_rawBuffer, this)[0];
    headerIndex = bufferHead?.indexOf(v8Header);
  }
  if (TypedArrayPrototypeGetLength(nonSerialized) > 0) {
    this.addToReport({
      __proto__: null,
      type: 'test:stdout',
      data: {
        __proto__: null,
        file: this.name,
        message: nonSerialized.toString('utf-8')
      }
    });
  }
  while (bufferHead?.length >= kSerializedSizeHeader) {
    // We call `readUInt32BE` manually here, because this is faster than first converting
    // it to a buffer and using `readUInt32BE` on that.
    var fullMessageSize = (bufferHead[kV8HeaderLength] << 24 | bufferHead[kV8HeaderLength + 1] << 16 | bufferHead[kV8HeaderLength + 2] << 8 | bufferHead[kV8HeaderLength + 3]) + kSerializedSizeHeader;
    if (_classPrivateFieldGet(_rawBufferSize, this) < fullMessageSize) break;
    var concatenatedBuffer = _classPrivateFieldGet(_rawBuffer, this).length === 1 ? _classPrivateFieldGet(_rawBuffer, this)[0] : Buffer.concat(_classPrivateFieldGet(_rawBuffer, this), _classPrivateFieldGet(_rawBufferSize, this));
    var deserializer = new DefaultDeserializer(TypedArrayPrototypeSubarray(concatenatedBuffer, kSerializedSizeHeader, fullMessageSize));
    bufferHead = TypedArrayPrototypeSubarray(concatenatedBuffer, fullMessageSize);
    _classPrivateFieldSet(_rawBufferSize, this, TypedArrayPrototypeGetLength(bufferHead));
    _classPrivateFieldSet(_rawBuffer, this, _classPrivateFieldGet(_rawBufferSize, this) !== 0 ? [bufferHead] : []);
    deserializer.readHeader();
    var item = deserializer.readValue();
    this.addToReport(item);
  }
}
function runTestFile(path, filesWatcher, opts) {
  var watchMode = filesWatcher != null;
  var testPath = path === kIsolatedProcessName ? '' : path;
  var testOpts = {
    __proto__: null,
    signal: opts.signal
  };
  var subtest = opts.root.createSubtest(FileTest, testPath, testOpts, _async(function (t) {
    var args = getRunArgs(path, opts);
    var stdio = ['pipe', 'pipe', 'pipe'];
    var env = _objectSpread({
      __proto__: null,
      NODE_TEST_CONTEXT: 'child-v8'
    }, opts.env || process.env);

    // Acquire a worker ID from the pool for process isolation mode
    var workerId;
    if (opts.workerIdPool) {
      workerId = opts.workerIdPool.acquire();
      env.NODE_TEST_WORKER_ID = _String(workerId);
      debug('Assigned worker ID %d to test file: %s', workerId, path);
    }
    if (watchMode) {
      stdio.push('ipc');
      env.WATCH_REPORT_DEPENDENCIES = '1';
    }
    if (opts.root.harness.shouldColorizeTestFiles) {
      env.FORCE_COLOR = '1';
    }
    var child = spawn(process.execPath, args, {
      __proto__: null,
      signal: t.signal,
      encoding: 'utf8',
      env,
      stdio,
      cwd: opts.cwd
    });
    if (watchMode) {
      filesWatcher.runningProcesses.set(path, child);
      filesWatcher.watcher.watchChildProcessModules(child, path);
    }
    var err;
    child.on('error', error => {
      err = error;
    });
    child.stdout.on('data', data => {
      subtest.parseMessage(data);
    });
    var rl = new Interface({
      __proto__: null,
      input: child.stderr
    });
    rl.on('line', line => {
      if (isInspectorMessage(line)) {
        process.stderr.write(line + '\n');
        return;
      }

      // stderr cannot be treated as TAP, per the spec. However, we want to
      // surface stderr lines to improve the DX. Inject each line into the
      // test output as an unknown token as if it came from the TAP parser.
      subtest.addToReport({
        __proto__: null,
        type: 'test:stderr',
        data: {
          __proto__: null,
          file: path,
          message: line + '\n'
        }
      });
    });
    return _await(SafePromiseAll([once(child, 'exit', {
      __proto__: null,
      signal: t.signal
    }), finished(child.stdout, {
      __proto__: null,
      signal: t.signal
    })]), function (_ref2) {
      var {
        0: {
          0: code,
          1: signal
        }
      } = _ref2;
      // Close readline interface to prevent memory leak
      rl.close();
      if (watchMode) {
        filesWatcher.runningProcesses.delete(path);
        filesWatcher.runningSubtests.delete(path);
        _async(function () {
          return _continueIgnored(_finallyRethrows(function () {
            return _awaitIgnored(subTestEnded);
          }, function (_wasThrown, _result) {
            if (filesWatcher.runningSubtests.size === 0) {
              opts.root.reporter[kEmitMessage]('test:watch:drained');
              opts.root.postRun();
            }
            return _rethrow(_wasThrown, _result);
          }));
        })();
      }
      if (code !== 0 || signal !== null) {
        if (!err) {
          var failureType = subtest.failedSubtests ? kSubtestsFailed : kTestCodeFailure;
          err = ObjectAssign(new ERR_TEST_FAILURE('test failed', failureType), {
            __proto__: null,
            exitCode: code,
            signal: signal,
            // The stack will not be useful since the failures came from tests
            // in a child process.
            stack: undefined
          });
        }
        throw err;
      }
    });
  }));
  var subTestEnded = subtest.start();
  return subTestEnded;
}
function watchFiles(testFiles, opts) {
  var restartTestFile = _async(function (file) {
    var runningProcess = runningProcesses.get(file);
    return _invoke(function () {
      if (runningProcess) {
        runningProcess.kill();
        return _awaitIgnored(once(runningProcess, 'exit'));
      }
    }, function () {
      if (!runningSubtests.size) {
        // Reset the topLevel counter
        opts.root.harness.counters.topLevel = 0;
      }
      return _await(runningSubtests.get(file), function () {
        runningSubtests.set(file, runTestFile(file, filesWatcher, opts));
      });
    });
  }); // Watch for changes in current filtered files
  var runningProcesses = new SafeMap();
  var runningSubtests = new SafeMap();
  var watcherMode = opts.hasFiles ? 'filter' : 'all';
  var watcher = new FilesWatcher({
    __proto__: null,
    debounce: 200,
    mode: watcherMode,
    signal: opts.signal
  });
  if (!opts.hasFiles) {
    watcher.watchPath(opts.cwd);
  }
  var filesWatcher = {
    __proto__: null,
    watcher,
    runningProcesses,
    runningSubtests
  };
  opts.root.harness.watching = true;
  var onChanged = _ref3 => {
    var {
      owners,
      eventType
    } = _ref3;
    if (!opts.hasFiles && (eventType === 'rename' || eventType === 'change')) {
      var updatedTestFiles = createTestFileList(opts.globPatterns, opts.cwd);
      var newFileName = ArrayPrototypeFind(updatedTestFiles, x => !ArrayPrototypeIncludes(testFiles, x));
      var previousFileName = ArrayPrototypeFind(testFiles, x => !ArrayPrototypeIncludes(updatedTestFiles, x));
      testFiles = updatedTestFiles;

      // When file renamed (created / deleted) we need to update the watcher
      if (newFileName) {
        owners = new SafeSet().add(newFileName);
        var resolveFileName = isAbsolute(newFileName) ? newFileName : resolve(opts.cwd, newFileName);
        watcher.filterFile(resolveFileName, owners);
      }
      if (!newFileName && previousFileName) {
        return; // Avoid rerunning files when file deleted
      }
    }
    // Reset the root start time to recalculate the duration
    // of the run
    opts.root.clearExecutionTime();
    opts.root.reporter[kEmitMessage]('test:watch:restarted');

    // Restart test files
    if (opts.isolation === 'none') {
      PromisePrototypeThen(restartTestFile(kIsolatedProcessName), undefined, error => {
        triggerUncaughtException(error, true /* fromPromise */);
      });
    } else {
      watcher.unfilterFilesOwnedBy(owners);
      PromisePrototypeThen(SafePromiseAllReturnVoid(testFiles, _async(function (file) {
        if (!owners.has(file)) {
          return;
        }
        return _awaitIgnored(restartTestFile(file));
      }), undefined, error => {
        triggerUncaughtException(error, true /* fromPromise */);
      }));
    }
  };
  watcher.on('changed', onChanged);

  // Cleanup function to remove event listener and prevent memory leak
  var cleanup = () => {
    watcher.removeListener('changed', onChanged);
    opts.root.harness.watching = false;
    opts.root.postRun();
  };
  if (opts.signal) {
    kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
    opts.signal.addEventListener('abort', cleanup, {
      __proto__: null,
      once: true,
      [kResistStopPropagation]: true
    });
  }

  // Expose cleanup method for proper resource management
  filesWatcher.cleanup = cleanup;
  return filesWatcher;
}
function run() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  validateObject(options, 'options');
  var {
    testNamePatterns,
    testSkipPatterns,
    testTagFilters,
    shard,
    coverageExcludeGlobs,
    coverageIncludeGlobs
  } = options;
  var {
    concurrency,
    timeout,
    signal,
    files,
    forceExit,
    inspectPort,
    isolation = 'process',
    watch,
    setup,
    globalSetupPath,
    only,
    globPatterns,
    coverage = false,
    lineCoverage = 0,
    branchCoverage = 0,
    functionCoverage = 0,
    randomize: suppliedRandomize,
    randomSeed: suppliedRandomSeed,
    execArgv = [],
    argv = [],
    cwd = process.cwd(),
    rerunFailuresFilePath,
    env
  } = options;
  if (files != null) {
    validateArray(files, 'options.files');
  }
  if (watch != null) {
    validateBoolean(watch, 'options.watch');
  }
  if (forceExit != null) {
    validateBoolean(forceExit, 'options.forceExit');
    if (forceExit && watch) {
      throw new ERR_INVALID_ARG_VALUE('options.forceExit', watch, 'is not supported with watch mode');
    }
  }
  if (only != null) {
    validateBoolean(only, 'options.only');
  }
  if (globPatterns != null) {
    validateArray(globPatterns, 'options.globPatterns');
  }
  if (suppliedRandomize != null) {
    validateBoolean(suppliedRandomize, 'options.randomize');
  }
  if (suppliedRandomSeed != null) {
    validateUint32(suppliedRandomSeed, 'options.randomSeed');
  }
  var randomize = suppliedRandomize;
  var randomSeed = suppliedRandomSeed;
  if (randomSeed != null) {
    randomize = true;
  }
  if (watch) {
    if (randomSeed != null) {
      throw new ERR_INVALID_ARG_VALUE('options.randomSeed', randomSeed, 'is not supported with watch mode');
    }
    if (randomize) {
      throw new ERR_INVALID_ARG_VALUE('options.randomize', randomize, 'is not supported with watch mode');
    }
  }
  if (rerunFailuresFilePath) {
    validatePath(rerunFailuresFilePath, 'options.rerunFailuresFilePath');
    // TODO(pmarchini): Support rerun-failures with randomization by
    // persisting the randomization seed in the rerun state file.
    if (randomSeed != null) {
      throw new ERR_INVALID_ARG_VALUE('options.randomSeed', randomSeed, 'is not supported with rerun failures mode');
    }
    if (randomize) {
      throw new ERR_INVALID_ARG_VALUE('options.randomize', randomize, 'is not supported with rerun failures mode');
    }
  }
  if (randomize) {
    randomSeed ??= createRandomSeed();
  }
  validateString(cwd, 'options.cwd');
  if (globPatterns?.length > 0 && files?.length > 0) {
    throw new ERR_INVALID_ARG_VALUE('options.globPatterns', globPatterns, 'is not supported when specifying \'options.files\'');
  }
  if (shard != null) {
    validateObject(shard, 'options.shard');
    // Avoid re-evaluating the shard object in case it's a getter
    shard = {
      __proto__: null,
      index: shard.index,
      total: shard.total
    };
    validateInteger(shard.total, 'options.shard.total', 1);
    validateInteger(shard.index, 'options.shard.index', 1, shard.total);
    if (watch) {
      throw new ERR_INVALID_ARG_VALUE('options.shard', watch, 'shards not supported with watch mode');
    }
  }
  if (setup != null) {
    validateFunction(setup, 'options.setup');
  }
  if (testNamePatterns != null) {
    if (!ArrayIsArray(testNamePatterns)) {
      testNamePatterns = [testNamePatterns];
    }
    testNamePatterns = ArrayPrototypeMap(testNamePatterns, (value, i) => {
      if (isRegExp(value)) {
        return value;
      }
      var name = `options.testNamePatterns[${i}]`;
      if (typeof value === 'string') {
        return convertStringToRegExp(value, name);
      }
      throw new ERR_INVALID_ARG_TYPE(name, ['string', 'RegExp'], value);
    });
  }
  if (testSkipPatterns != null) {
    if (!ArrayIsArray(testSkipPatterns)) {
      testSkipPatterns = [testSkipPatterns];
    }
    testSkipPatterns = ArrayPrototypeMap(testSkipPatterns, (value, i) => {
      if (isRegExp(value)) {
        return value;
      }
      var name = `options.testSkipPatterns[${i}]`;
      if (typeof value === 'string') {
        return convertStringToRegExp(value, name);
      }
      throw new ERR_INVALID_ARG_TYPE(name, ['string', 'RegExp'], value);
    });
  }
  var testTagFilterExpressions = null;
  if (testTagFilters != null) {
    if (!ArrayIsArray(testTagFilters)) {
      testTagFilters = [testTagFilters];
    }
    if (testTagFilters.length === 0) {
      testTagFilters = null;
    } else {
      emitExperimentalWarning('Test tags');
      testTagFilters = ArrayPrototypeMap(testTagFilters, (value, i) => validateAndCanonicalizeTagFilter(value, `options.testTagFilters[${i}]`));
      testTagFilterExpressions = testTagFilters;
    }
  }
  testTagFilterExpressions ??= options.testTagFilterExpressions;
  validateOneOf(isolation, 'options.isolation', ['process', 'none']);
  validateBoolean(coverage, 'options.coverage');
  if (coverageExcludeGlobs != null) {
    if (!ArrayIsArray(coverageExcludeGlobs)) {
      coverageExcludeGlobs = [coverageExcludeGlobs];
    }
    validateStringArray(coverageExcludeGlobs, 'options.coverageExcludeGlobs');
  } else if (coverage) {
    coverageExcludeGlobs = [kDefaultPattern];
  }
  if (coverageIncludeGlobs != null) {
    if (!ArrayIsArray(coverageIncludeGlobs)) {
      coverageIncludeGlobs = [coverageIncludeGlobs];
    }
    validateStringArray(coverageIncludeGlobs, 'options.coverageIncludeGlobs');
  }
  validateInteger(lineCoverage, 'options.lineCoverage', 0, 100);
  validateInteger(branchCoverage, 'options.branchCoverage', 0, 100);
  validateInteger(functionCoverage, 'options.functionCoverage', 0, 100);
  validateStringArray(argv, 'options.argv');
  validateStringArray(execArgv, 'options.execArgv');
  if (globalSetupPath != null) {
    validatePath(globalSetupPath, 'options.globalSetupPath');
  }
  if (env != null) {
    validateObject(env);
    if (isolation === 'none') {
      throw new ERR_INVALID_ARG_VALUE('options.env', env, 'is not supported with isolation=\'none\'');
    }
  }
  var rootTestOptions = {
    __proto__: null,
    concurrency,
    timeout,
    signal
  };
  var globalOptions = _objectSpread(_objectSpread({
    __proto__: null
  }, parseCommandLine()), {}, {
    setup,
    // This line can be removed when parseCommandLine() is removed here.
    coverage,
    coverageExcludeGlobs,
    coverageIncludeGlobs,
    rerunFailuresFilePath,
    lineCoverage: lineCoverage,
    branchCoverage: branchCoverage,
    functionCoverage: functionCoverage,
    cwd,
    globalSetupPath,
    randomize,
    randomSeed,
    testTagFilters
  });
  var root = createTestTree(rootTestOptions, globalOptions);
  var testFiles = files ?? createTestFileList(globPatterns, cwd);
  var {
    isTestRunner
  } = globalOptions;
  if (randomize) {
    root.diagnostic(`Randomized test order seed: ${randomSeed}`);
  }
  if (shard) {
    testFiles = ArrayPrototypeFilter(testFiles, (_, index) => index % shard.total === shard.index - 1);
  }
  var teardown;
  var postRun;
  var filesWatcher;
  var runFiles;

  // Create worker ID pool for concurrent test execution.
  // Use concurrency from globalOptions which has been processed by parseCommandLine().
  var effectiveConcurrency = globalOptions.concurrency ?? concurrency;
  var maxConcurrency = 1;
  if (effectiveConcurrency === true) {
    maxConcurrency = MathMax(availableParallelism() - 1, 1);
  } else if (typeof effectiveConcurrency === 'number') {
    maxConcurrency = effectiveConcurrency;
  }
  var workerIdPool = new WorkerIdPool(maxConcurrency);
  debug('Created worker ID pool with max concurrency: %d, ' + 'effectiveConcurrency: %s, testFiles: %d', maxConcurrency, effectiveConcurrency, testFiles.length);
  var opts = {
    __proto__: null,
    root,
    signal,
    inspectPort,
    testNamePatterns,
    testSkipPatterns,
    testTagFilters,
    testTagFilterExpressions,
    hasFiles: files != null,
    globPatterns,
    only,
    forceExit,
    cwd,
    isolation,
    argv,
    execArgv,
    rerunFailuresFilePath,
    env,
    workerIdPool: isolation === 'process' ? workerIdPool : null,
    randomize,
    randomSeed
  };
  if (isolation === 'process') {
    if (process.env.NODE_TEST_CONTEXT !== undefined) {
      process.emitWarning('node:test run() is being called recursively within a test file. skipping running files.');
      root.postRun();
      return root.reporter;
    }
    if (watch) {
      filesWatcher = watchFiles(testFiles, opts);
    } else {
      postRun = () => root.postRun();
      teardown = () => root.harness.teardown();
    }
    runFiles = () => {
      root.harness.bootstrapPromise = null;
      root.harness.buildPromise = null;
      return SafePromiseAllSettledReturnVoid(testFiles, path => {
        var subtest = runTestFile(path, filesWatcher, opts);
        filesWatcher?.runningSubtests.set(path, subtest);
        return subtest;
      });
    };
  } else if (isolation === 'none') {
    // For isolation=none, set worker ID to 1 in the current process
    process.env.NODE_TEST_WORKER_ID = '1';
    debug('Set NODE_TEST_WORKER_ID=1 for isolation=none');
    if (watch) {
      var absoluteTestFiles = ArrayPrototypeMap(testFiles, file => isAbsolute(file) ? file : resolve(cwd, file));
      filesWatcher = watchFiles(absoluteTestFiles, opts);
      runFiles = _async(function () {
        root.harness.bootstrapPromise = null;
        root.harness.buildPromise = null;
        var subtest = runTestFile(kIsolatedProcessName, filesWatcher, opts);
        filesWatcher?.runningSubtests.set(kIsolatedProcessName, subtest);
        return subtest;
      });
    } else {
      runFiles = _async(function () {
        var {
          promise,
          resolve: finishBootstrap
        } = PromiseWithResolvers();
        return _await(root.runInAsyncScope(_async(function () {
          var parentURL = pathToFileURL(cwd + sep).href;
          var cascadedLoader = esmLoader.getOrInitializeCascadedLoader();
          var topLevelTestCount = 0;
          root.harness.bootstrapPromise = root.harness.bootstrapPromise ? SafePromiseAllReturnVoid([root.harness.bootstrapPromise, promise]) : promise;

          // We need to setup the user modules in the test runner if we are running with
          // --test-isolation=none and --test in order to avoid loading the user modules
          // BEFORE the creation of the root test (that would cause them to get lost).
          if (isTestRunner) {
            // If we are not coming from the test runner entry point, the user-required and imported
            // modules have already been loaded.
            // Since it's possible to delete modules from require.cache, a CommonJS module
            // could otherwise be executed twice.
            loadPreloadModules();
          }
          var userImports = getOptionValue('--import');
          return _continue(_forTo(userImports, function (i) {
            return _awaitIgnored(cascadedLoader.import(userImports[i], parentURL, kEmptyObject));
          }), function () {
            return _continueIgnored(_forTo(testFiles, function (i) {
              var testFile = testFiles[i];
              var fileURL = pathToFileURL(resolve(cwd, testFile));
              var parent = i === 0 ? undefined : parentURL;
              var threw = false;
              var importError;
              root.entryFile = resolve(testFile);
              debug('loading test file:', fileURL.href);
              return _continue(_catch(function () {
                return _awaitIgnored(cascadedLoader.import(fileURL, parent, {
                  __proto__: null
                }));
              }, function (err) {
                threw = true;
                importError = err;
              }), function () {
                debug('loaded "%s": top level test count before = %d and after = %d', testFile, topLevelTestCount, root.subtests.length);
                if (topLevelTestCount === root.subtests.length) {
                  // This file had no tests in it. Add the placeholder test.
                  var subtest = root.createSubtest(Test, testFile, kEmptyObject, undefined, {
                    __proto__: null,
                    loc: [1, 1, resolve(testFile)]
                  });
                  if (threw) {
                    subtest.fail(importError);
                  }
                  startSubtestAfterBootstrap(subtest);
                }
                topLevelTestCount = root.subtests.length;
              });
            }));
          });
        })), function () {
          debug('beginning test execution');
          root.entryFile = null;
          finishBootstrap();
          return root.processPendingSubtests();
        });
      });
    }
  }
  var runChain = _async(function () {
    return _invoke(function () {
      if (root.harness?.bootstrapPromise) {
        return _awaitIgnored(root.harness.bootstrapPromise);
      }
    }, function () {
      return _invoke(function () {
        if (typeof setup === 'function') {
          return _awaitIgnored(setup(root.reporter));
        }
      }, function () {
        return _call(runFiles, function () {
          postRun?.();
          teardown?.();
        });
      });
    });
  });
  runChain();
  return root.reporter;
}
module.exports = {
  FileTest,
  // Exported for tests only
  run
};

