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
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
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
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
function _callIgnored(body, direct) {
  return _call(body, _empty, direct);
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
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
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayFrom,
  ArrayPrototypeEvery,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  ArrayPrototypeUnshiftApply,
  BigInt,
  Error,
  FunctionPrototype,
  MathFloor,
  MathMax,
  MathRound,
  Number: _Number,
  NumberPrototypeToFixed,
  ObjectFreeze,
  ObjectKeys,
  ObjectSeal,
  Promise,
  PromisePrototypeThen,
  PromiseResolve,
  PromiseWithResolvers,
  ReflectApply,
  RegExpPrototypeExec,
  SafeMap,
  SafePromiseAll,
  SafePromiseAllReturnVoid,
  SafePromiseRace,
  SafeSet,
  SetPrototypeUnion,
  StringPrototypeStartsWith,
  StringPrototypeTrim,
  Symbol: _Symbol,
  SymbolDispose
} = primordials;
var {
  getCallerLocation
} = internalBinding('util');
var {
  exitCodes: {
    kGenericUserError
  }
} = internalBinding('errors');
var {
  addAbortListener
} = require('internal/events/abort_listener');
var {
  queueMicrotask
} = require('internal/process/task_queues');
var {
  AsyncResource
} = require('async_hooks');
var {
  AbortController
} = require('internal/abort_controller');
var {
  AbortError,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_TEST_FAILURE
  }
} = require('internal/errors');
var {
  MockTracker
} = require('internal/test_runner/mock/mock');
var {
  evaluateTagFilters,
  kEmptyTagArray,
  validateAndCanonicalizeTagValues
} = require('internal/test_runner/tag_filter');
var {
  TestsStream
} = require('internal/test_runner/tests_stream');
var {
  createDeferredCallback,
  createSeededGenerator,
  countCompletedTest,
  isTestFailureError,
  reporterScope,
  testChannel
} = require('internal/test_runner/utils');
var {
  kEmptyObject,
  once: runOnce,
  setOwnProperty
} = require('internal/util');
var assert = require('assert');
var {
  isPromise,
  isRegExp
} = require('internal/util/types');
var {
  validateAbortSignal,
  validateFunction,
  validateNumber,
  validateObject,
  validateOneOf,
  validateUint32
} = require('internal/validators');
var {
  clearTimeout,
  setTimeout
} = require('timers');
var {
  TIMEOUT_MAX
} = require('internal/timers');
var {
  fileURLToPath
} = require('internal/url');
var {
  relative
} = require('path');
var {
  availableParallelism
} = require('os');
var {
  innerOk
} = require('internal/assert/utils');
var {
  bigint: hrtime
} = process.hrtime;
var kCallbackAndPromisePresent = 'callbackAndPromisePresent';
var kCancelledByParent = 'cancelledByParent';
var kAborted = 'testAborted';
var kParentAlreadyFinished = 'parentAlreadyFinished';
var kSubtestsFailed = 'subtestsFailed';
var kTestCodeFailure = 'testCodeFailure';
var kTestTimeoutFailure = 'testTimeoutFailure';
var kExpectedFailure = 'expectedFailure';
var kHookFailure = 'hookFailed';
var kDefaultTimeout = null;
var noop = FunctionPrototype;
var kShouldAbort = _Symbol('kShouldAbort');
var kHookNames = ObjectSeal(['before', 'after', 'beforeEach', 'afterEach']);
var kUnwrapErrors = new SafeSet().add(kTestCodeFailure).add(kHookFailure).add('uncaughtException').add('unhandledRejection');
var kResistStopPropagation;
var assertObj;
var findSourceMap;
var noopTestStream;
var kRunOnceOptions = {
  __proto__: null,
  preserveReturnValue: true
};
function lazyFindSourceMap(file) {
  if (findSourceMap === undefined) {
    ({
      findSourceMap
    } = require('internal/source_map/source_map_cache'));
  }
  return findSourceMap(file);
}
function lazyAssertObject(harness) {
  if (assertObj === undefined) {
    var {
      getAssertionMap
    } = require('internal/test_runner/assert');
    var {
      SnapshotManager
    } = require('internal/test_runner/snapshot');
    assertObj = getAssertionMap();
    harness.snapshotManager = new SnapshotManager(harness.config.updateSnapshots);
    if (!assertObj.has('snapshot')) {
      assertObj.set('snapshot', harness.snapshotManager.createAssert());
    }
    if (!assertObj.has('fileSnapshot')) {
      assertObj.set('fileSnapshot', harness.snapshotManager.createFileAssert());
    }
  }
  return assertObj;
}
function stopTest(timeout, signal) {
  var deferred = PromiseWithResolvers();
  var abortListener = addAbortListener(signal, deferred.resolve);
  var timer;
  var disposeFunction;
  if (timeout === kDefaultTimeout) {
    disposeFunction = abortListener[SymbolDispose];
  } else {
    timer = setTimeout(deferred.resolve, timeout);
    timer.unref();
    setOwnProperty(deferred, 'promise', PromisePrototypeThen(deferred.promise, () => {
      throw new ERR_TEST_FAILURE(`test timed out after ${timeout}ms`, kTestTimeoutFailure);
    }));
    disposeFunction = () => {
      abortListener[SymbolDispose]();
      clearTimeout(timer);
    };
  }
  setOwnProperty(deferred.promise, SymbolDispose, disposeFunction);
  return deferred.promise;
}
function testMatchesPattern(test, patterns) {
  var matchesByNameOrParent = ArrayPrototypeSome(patterns, re => RegExpPrototypeExec(re, test.name) !== null) || test.parent && testMatchesPattern(test.parent, patterns);
  if (matchesByNameOrParent) return true;
  var testNameWithAncestors = StringPrototypeTrim(test.getTestNameWithAncestors());
  return ArrayPrototypeSome(patterns, re => RegExpPrototypeExec(re, testNameWithAncestors) !== null);
}
var _waitIndefinitely = /*#__PURE__*/new WeakMap();
var _planPromise = /*#__PURE__*/new WeakMap();
var _timeoutId = /*#__PURE__*/new WeakMap();
var _TestPlan_brand = /*#__PURE__*/new WeakSet();
var TestPlan = /*#__PURE__*/function () {
  function TestPlan(count) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, TestPlan);
    _classPrivateMethodInitSpec(this, _TestPlan_brand);
    _classPrivateFieldInitSpec(this, _waitIndefinitely, false);
    _classPrivateFieldInitSpec(this, _planPromise, null);
    _classPrivateFieldInitSpec(this, _timeoutId, null);
    validateUint32(count, 'count');
    validateObject(options, 'options');
    this.expected = count;
    this.actual = 0;
    var {
      wait
    } = options;
    if (typeof wait === 'boolean') {
      this.wait = wait;
      _classPrivateFieldSet(_waitIndefinitely, this, wait);
    } else if (typeof wait === 'number') {
      validateNumber(wait, 'options.wait', 0, TIMEOUT_MAX);
      this.wait = wait;
    } else if (wait !== undefined) {
      throw new ERR_INVALID_ARG_TYPE('options.wait', ['boolean', 'number'], wait);
    }
  }
  return _createClass(TestPlan, [{
    key: "check",
    value: function check() {
      if (_assertClassBrand(_TestPlan_brand, this, _planMet).call(this)) {
        if (_classPrivateFieldGet(_timeoutId, this)) {
          clearTimeout(_classPrivateFieldGet(_timeoutId, this));
          _classPrivateFieldSet(_timeoutId, this, null);
        }
        if (_classPrivateFieldGet(_planPromise, this)) {
          var {
            resolve
          } = _classPrivateFieldGet(_planPromise, this);
          resolve();
          _classPrivateFieldSet(_planPromise, this, null);
        }
        return;
      }
      if (!_assertClassBrand(_TestPlan_brand, this, _shouldWait).call(this)) {
        throw new ERR_TEST_FAILURE(`plan expected ${this.expected} assertions but received ${this.actual}`, kTestCodeFailure);
      }
      if (!_classPrivateFieldGet(_planPromise, this)) {
        var {
          promise,
          resolve: _resolve,
          reject
        } = PromiseWithResolvers();
        _classPrivateFieldSet(_planPromise, this, {
          __proto__: null,
          promise,
          resolve: _resolve,
          reject
        });
        if (!_classPrivateFieldGet(_waitIndefinitely, this)) {
          _classPrivateFieldSet(_timeoutId, this, _assertClassBrand(_TestPlan_brand, this, _createTimeout).call(this, reject));
        }
      }
      return _classPrivateFieldGet(_planPromise, this).promise;
    }
  }, {
    key: "count",
    value: function count() {
      this.actual++;
      if (_classPrivateFieldGet(_planPromise, this)) {
        this.check();
      }
    }
  }]);
}();
function _planMet() {
  return this.actual === this.expected;
}
function _createTimeout(reject) {
  return setTimeout(() => {
    var err = new ERR_TEST_FAILURE(`plan timed out after ${this.wait}ms with ${this.actual} assertions when expecting ${this.expected}`, kTestTimeoutFailure);
    reject(err);
  }, this.wait);
}
function _shouldWait() {
  return this.wait !== undefined && this.wait !== false;
}
var _assert = /*#__PURE__*/new WeakMap();
var _test = /*#__PURE__*/new WeakMap();
var TestContext = /*#__PURE__*/function () {
  function TestContext(test) {
    _classCallCheck(this, TestContext);
    _classPrivateFieldInitSpec(this, _assert, void 0);
    _classPrivateFieldInitSpec(this, _test, void 0);
    _classPrivateFieldSet(_test, this, test);
  }
  return _createClass(TestContext, [{
    key: "signal",
    get: function () {
      return _classPrivateFieldGet(_test, this).signal;
    }
  }, {
    key: "name",
    get: function () {
      return _classPrivateFieldGet(_test, this).name;
    }
  }, {
    key: "filePath",
    get: function () {
      return _classPrivateFieldGet(_test, this).entryFile;
    }
  }, {
    key: "fullName",
    get: function () {
      return getFullName(_classPrivateFieldGet(_test, this));
    }
  }, {
    key: "error",
    get: function () {
      return _classPrivateFieldGet(_test, this).error;
    }
  }, {
    key: "passed",
    get: function () {
      return _classPrivateFieldGet(_test, this).passed;
    }
  }, {
    key: "attempt",
    get: function () {
      return _classPrivateFieldGet(_test, this).attempt ?? 0;
    }
  }, {
    key: "tags",
    get: function () {
      return _classPrivateFieldGet(_test, this).tags;
    }
  }, {
    key: "workerId",
    get: function () {
      var envWorkerId = process.env.NODE_TEST_WORKER_ID;
      return _Number(envWorkerId) || undefined;
    }
  }, {
    key: "diagnostic",
    value: function diagnostic(message) {
      _classPrivateFieldGet(_test, this).diagnostic(message);
    }
  }, {
    key: "plan",
    value: function plan(count) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      if (_classPrivateFieldGet(_test, this).plan !== null) {
        throw new ERR_TEST_FAILURE('cannot set plan more than once', kTestCodeFailure);
      }
      _classPrivateFieldGet(_test, this).plan = new TestPlan(count, options);
    }
  }, {
    key: "assert",
    get: function () {
      var _this = this;
      if (_classPrivateFieldGet(_assert, this) === undefined) {
        var {
          plan
        } = _classPrivateFieldGet(_test, this);
        var map = lazyAssertObject(_classPrivateFieldGet(_test, this).root.harness);
        var _assert2 = {
          __proto__: null
        };
        _classPrivateFieldSet(_assert, this, _assert2);
        map.forEach((method, name) => {
          _assert2[name] = function () {
            if (plan !== null) {
              plan.count();
            }
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            return ReflectApply(method, _this, args);
          };
        });
        if (!map.has('ok')) {
          // This is a hack. It allows the innerOk function to collect the
          // stacktrace from the correct starting point.
          function ok() {
            if (plan !== null) {
              plan.count();
            }
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }
            innerOk.apply(void 0, [ok].concat(args));
          }
          _assert2.ok = ok;
        }
      }
      return _classPrivateFieldGet(_assert, this);
    }
  }, {
    key: "mock",
    get: function () {
      _classPrivateFieldGet(_test, this).mock ??= new MockTracker();
      return _classPrivateFieldGet(_test, this).mock;
    }
  }, {
    key: "runOnly",
    value: function runOnly(value) {
      _classPrivateFieldGet(_test, this).runOnlySubtests = !!value;
    }
  }, {
    key: "skip",
    value: function skip(message) {
      _classPrivateFieldGet(_test, this).skip(message);
    }
  }, {
    key: "todo",
    value: function todo(message) {
      _classPrivateFieldGet(_test, this).todo(message);
    }
  }, {
    key: "test",
    value: function test(name, options, fn) {
      var overrides = {
        __proto__: null,
        loc: getCallerLocation()
      };
      var {
        plan
      } = _classPrivateFieldGet(_test, this);
      if (plan !== null) {
        plan.count();
      }
      var subtest = _classPrivateFieldGet(_test, this).createSubtest(
      // eslint-disable-next-line no-use-before-define
      Test, name, options, fn, overrides);
      return subtest.start();
    }
  }, {
    key: "before",
    value: function before(fn, options) {
      _classPrivateFieldGet(_test, this).createHook('before', fn, _objectSpread(_objectSpread({
        __proto__: null
      }, options), {}, {
        parent: _classPrivateFieldGet(_test, this),
        hookType: 'before',
        loc: getCallerLocation()
      }));
    }
  }, {
    key: "after",
    value: function after(fn, options) {
      _classPrivateFieldGet(_test, this).createHook('after', fn, _objectSpread(_objectSpread({
        __proto__: null
      }, options), {}, {
        parent: _classPrivateFieldGet(_test, this),
        hookType: 'after',
        loc: getCallerLocation()
      }));
    }
  }, {
    key: "beforeEach",
    value: function beforeEach(fn, options) {
      _classPrivateFieldGet(_test, this).createHook('beforeEach', fn, _objectSpread(_objectSpread({
        __proto__: null
      }, options), {}, {
        parent: _classPrivateFieldGet(_test, this),
        hookType: 'beforeEach',
        loc: getCallerLocation()
      }));
    }
  }, {
    key: "afterEach",
    value: function afterEach(fn, options) {
      _classPrivateFieldGet(_test, this).createHook('afterEach', fn, _objectSpread(_objectSpread({
        __proto__: null
      }, options), {}, {
        parent: _classPrivateFieldGet(_test, this),
        hookType: 'afterEach',
        loc: getCallerLocation()
      }));
    }
  }, {
    key: "waitFor",
    value: function waitFor(condition) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      validateFunction(condition, 'condition');
      validateObject(options, 'options');
      var {
        interval = 50,
        timeout = 1000
      } = options;
      validateNumber(interval, 'options.interval', 0, TIMEOUT_MAX);
      validateNumber(timeout, 'options.timeout', 0, TIMEOUT_MAX);
      var {
        promise,
        resolve,
        reject
      } = PromiseWithResolvers();
      var noError = _Symbol();
      var cause = noError;
      var pollerId;
      var timeoutId;
      var done = (err, result) => {
        clearTimeout(pollerId);
        clearTimeout(timeoutId);
        if (err === noError) {
          resolve(result);
        } else {
          reject(err);
        }
      };
      timeoutId = setTimeout(() => {
        // eslint-disable-next-line no-restricted-syntax
        var err = new Error('waitFor() timed out');
        if (cause !== noError) {
          err.cause = cause;
        }
        done(err);
      }, timeout);
      var poller = _async(function () {
        return _continueIgnored(_catch(function () {
          return _call(condition, function (result) {
            done(noError, result);
          });
        }, function (err) {
          cause = err;
          pollerId = setTimeout(poller, interval);
        }));
      });
      poller();
      return promise;
    }
  }]);
}();
var _suite = /*#__PURE__*/new WeakMap();
var SuiteContext = /*#__PURE__*/function () {
  function SuiteContext(suite) {
    _classCallCheck(this, SuiteContext);
    _classPrivateFieldInitSpec(this, _suite, void 0);
    _classPrivateFieldSet(_suite, this, suite);
  }
  return _createClass(SuiteContext, [{
    key: "signal",
    get: function () {
      return _classPrivateFieldGet(_suite, this).signal;
    }
  }, {
    key: "name",
    get: function () {
      return _classPrivateFieldGet(_suite, this).name;
    }
  }, {
    key: "filePath",
    get: function () {
      return _classPrivateFieldGet(_suite, this).entryFile;
    }
  }, {
    key: "fullName",
    get: function () {
      return getFullName(_classPrivateFieldGet(_suite, this));
    }
  }, {
    key: "passed",
    get: function () {
      return _classPrivateFieldGet(_suite, this).passed;
    }
  }, {
    key: "attempt",
    get: function () {
      return _classPrivateFieldGet(_suite, this).attempt ?? 0;
    }
  }, {
    key: "diagnostic",
    value: function diagnostic(message) {
      _classPrivateFieldGet(_suite, this).diagnostic(message);
    }
  }]);
}();
function parseExpectFailure(expectFailure) {
  if (expectFailure === undefined || expectFailure === false) {
    return false;
  }
  if (typeof expectFailure === 'string') {
    return {
      __proto__: null,
      label: expectFailure,
      match: undefined
    };
  }
  if (typeof expectFailure === 'function' || isRegExp(expectFailure)) {
    return {
      __proto__: null,
      label: undefined,
      match: expectFailure
    };
  }
  if (typeof expectFailure !== 'object') {
    return {
      __proto__: null,
      label: undefined,
      match: undefined
    };
  }
  var keys = ObjectKeys(expectFailure);
  if (keys.length === 0) {
    throw new ERR_INVALID_ARG_VALUE('options.expectFailure', expectFailure, 'must not be an empty object');
  }
  if (ArrayPrototypeEvery(keys, k => k === 'match' || k === 'label')) {
    return {
      __proto__: null,
      label: expectFailure.label,
      match: expectFailure.match
    };
  }
  return {
    __proto__: null,
    label: undefined,
    match: expectFailure
  };
}
var _reportedSubtest = /*#__PURE__*/new WeakMap();
var _tagsArray = /*#__PURE__*/new WeakMap();
var _abortHandler = /*#__PURE__*/new WeakMap();
var _Test_brand = /*#__PURE__*/new WeakSet();
var _ctx = /*#__PURE__*/new WeakMap();
var Test = /*#__PURE__*/function (_AsyncResource) {
  function Test(options) {
    var _this2;
    _classCallCheck(this, Test);
    _this2 = _callSuper(this, Test, ['Test']);
    _classPrivateMethodInitSpec(_this2, _Test_brand);
    _defineProperty(_this2, "reportedType", 'test');
    _defineProperty(_this2, "abortController", void 0);
    _defineProperty(_this2, "outerSignal", void 0);
    _classPrivateFieldInitSpec(_this2, _reportedSubtest, void 0);
    _classPrivateFieldInitSpec(_this2, _tagsArray, null);
    _classPrivateFieldInitSpec(_this2, _abortHandler, () => {
      var error = _this2.outerSignal?.reason || new AbortError('The test was aborted');
      error.failureType = kAborted;
      _assertClassBrand(_Test_brand, _this2, _cancel).call(_this2, error);
    });
    _classPrivateFieldInitSpec(_this2, _ctx, void 0);
    var {
      fn,
      name,
      parent
    } = options;
    var {
      concurrency,
      entryFile,
      expectFailure,
      loc,
      only,
      timeout,
      todo,
      skip,
      signal,
      plan
    } = options;
    var rawTags = options.tags;
    if (typeof fn !== 'function') {
      fn = noop;
    }
    if (typeof name !== 'string' || name === '') {
      name = fn.name || '<anonymous>';
    }
    if (!(parent instanceof Test)) {
      parent = null;
    }
    _this2.name = name;
    _this2.parent = parent;
    _this2.testNumber = 0;
    _this2.outputSubtestCount = 0;
    _this2.diagnostics = [];
    _this2.filtered = false;
    _this2.filteredByName = false;
    _this2.filteredByTag = false;
    _this2.hasOnlyTests = false;

    // Hooks pass no tags option, so rawTags is undefined for them.
    var ownTags = rawTags !== undefined ? validateAndCanonicalizeTagValues(rawTags, 'options.tags') : kEmptyTagArray;
    var ownTagSet = new SafeSet(ownTags);
    _this2.tagSet = parent !== null && parent.tagSet.size > 0 ? SetPrototypeUnion(parent.tagSet, ownTagSet) : ownTagSet;
    if (parent === null) {
      _this2.root = _this2;
      _this2.harness = options.harness;
      _this2.config = _this2.harness.config;
      _this2.concurrency = 1;
      _this2.nesting = 0;
      _this2.only = _this2.config.only;
      _this2.reporter = new TestsStream();
      _this2.runOnlySubtests = _this2.only;
      _this2.childNumber = 0;
      _this2.timeout = kDefaultTimeout;
      _this2.entryFile = entryFile;
      _this2.testDisambiguator = new SafeMap();
      _this2.nextTestId = 1;
      _this2.testId = 0;
    } else {
      var nesting = parent.parent === null ? parent.nesting : parent.nesting + 1;
      var {
        config,
        isFilteringByName,
        isFilteringByOnly,
        isFilteringByTags
      } = parent.root.harness;
      _this2.root = parent.root;
      _this2.harness = null;
      _this2.config = config;
      _this2.concurrency = parent.concurrency;
      _this2.nesting = nesting;
      _this2.only = only;
      _this2.reporter = parent.reporter;
      _this2.runOnlySubtests = false;
      _this2.childNumber = parent.subtests.length + 1;
      _this2.timeout = parent.timeout;
      _this2.entryFile = parent.entryFile;
      _this2.testId = _this2.root.nextTestId++;
      if (isFilteringByName) {
        _this2.filteredByName = _this2.willBeFilteredByName();
        if (!_this2.filteredByName) {
          for (var t = _this2.parent; t !== null && t.filteredByName; t = t.parent) {
            t.filteredByName = false;
          }
        }
      }
      if (isFilteringByTags) {
        _this2.filteredByTag = !evaluateTagFilters(config.testTagFilters, _this2.tagSet);
        if (!_this2.filteredByTag) {
          for (var _t = _this2.parent; _t !== null && _t.filteredByTag; _t = _t.parent) {
            _t.filteredByTag = false;
          }
        }
      }
      if (isFilteringByOnly) {
        if (_this2.only) {
          // If filtering impacts the tests within a suite, then the suite only
          // runs those tests. If filtering does not impact the tests within a
          // suite, then all tests are run.
          _this2.parent.runOnlySubtests = true;
          if (_this2.parent === _this2.root || _this2.parent.startTime === null) {
            for (var _t2 = _this2.parent; _t2 !== null && !_t2.hasOnlyTests; _t2 = _t2.parent) {
              _t2.hasOnlyTests = true;
            }
          }
        } else if (_this2.only === false) {
          fn = noop;
        }
      } else if (only || _this2.parent.runOnlySubtests) {
        var warning = "'only' and 'runOnly' require the --test-only command-line option.";
        _this2.diagnostic(warning);
      }
    }
    switch (typeof concurrency) {
      case 'number':
        validateUint32(concurrency, 'options.concurrency', true);
        _this2.concurrency = concurrency;
        break;
      case 'boolean':
        if (concurrency) {
          _this2.concurrency = parent === null ? MathMax(availableParallelism() - 1, 1) : Infinity;
        } else {
          _this2.concurrency = 1;
        }
        break;
      default:
        if (concurrency != null) throw new ERR_INVALID_ARG_TYPE('options.concurrency', ['boolean', 'number'], concurrency);
    }
    if (timeout != null && timeout !== Infinity) {
      validateNumber(timeout, 'options.timeout', 0, TIMEOUT_MAX);
      _this2.timeout = timeout;
    } else if (timeout == null) {
      var cliTimeout = _this2.config.timeout;
      if (cliTimeout != null && cliTimeout !== Infinity) {
        validateNumber(cliTimeout, 'this.config.timeout', 0, TIMEOUT_MAX);
        _this2.timeout = cliTimeout;
      }
    }
    if (skip) {
      fn = noop;
    }
    _this2.abortController = new AbortController();
    _this2.outerSignal = signal;
    _this2.signal = _this2.abortController.signal;
    validateAbortSignal(signal, 'options.signal');
    if (signal) {
      kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
    }
    _this2.outerSignal?.addEventListener('abort', _classPrivateFieldGet(_abortHandler, _this2), {
      __proto__: null,
      [kResistStopPropagation]: true
    });
    _this2.fn = fn;
    _this2.mock = null;
    _this2.plan = null;
    _this2.expectedAssertions = plan;
    _this2.cancelled = false;
    _this2.expectFailure = parseExpectFailure(expectFailure) || _this2.parent?.expectFailure;
    _this2.skipped = skip !== undefined && skip !== false;
    _this2.isTodo = todo !== undefined && todo !== false || _this2.parent?.isTodo;
    _this2.startTime = null;
    _this2.endTime = null;
    _this2.passed = false;
    _this2.error = null;
    _this2.attempt = undefined;
    _this2.passedAttempt = undefined;
    _this2.message = typeof skip === 'string' ? skip : typeof todo === 'string' ? todo : null;
    _this2.activeSubtests = 0;
    _this2.subtestQueueRandom = _this2.config.randomize ? createSeededGenerator(_this2.config.randomSeed) : null;
    _this2.pendingSubtests = [];
    _this2.pendingSubtestsScheduled = false;
    _this2.readySubtests = new SafeMap();
    _this2.unfinishedSubtests = new SafeSet();
    _this2.subtestsPromise = null;
    _this2.subtests = [];
    _this2.nextReportOrder = 1;
    _this2.reportOrder = 0;
    _this2.waitingOn = 0;
    _this2.finished = false;
    _this2.hooks = {
      __proto__: null,
      before: [],
      after: [],
      beforeEach: [],
      afterEach: [],
      ownAfterEachCount: 0
    };
    if (loc === undefined) {
      _this2.loc = undefined;
    } else {
      _this2.loc = {
        __proto__: null,
        line: loc[0],
        column: loc[1],
        file: loc[2]
      };
      if (_this2.config.sourceMaps === true) {
        var map = lazyFindSourceMap(_this2.loc.file);
        var entry = map?.findEntry(_this2.loc.line - 1, _this2.loc.column - 1);
        if (entry?.originalSource !== undefined) {
          _this2.loc.line = entry.originalLine + 1;
          _this2.loc.column = entry.originalColumn + 1;
          _this2.loc.file = entry.originalSource;
        }
      }
      if (StringPrototypeStartsWith(_this2.loc.file, 'file://')) {
        _this2.loc.file = fileURLToPath(_this2.loc.file);
      }
    }
    if (_this2.loc != null && _this2.root.harness.previousRuns != null) {
      var baseIdentifier = `${relative(_this2.config.cwd, _this2.loc.file)}:${_this2.loc.line}:${_this2.loc.column}`;
      var testIdentifier = baseIdentifier;
      var disambiguator = _this2.root.testDisambiguator.get(baseIdentifier);
      if (disambiguator !== undefined) {
        testIdentifier += `:(${disambiguator})`;
        _this2.root.testDisambiguator.set(baseIdentifier, disambiguator + 1);
      } else {
        _this2.root.testDisambiguator.set(baseIdentifier, 1);
      }
      _this2.attempt = _this2.root.harness.previousRuns.length;
      var previousAttempt = _this2.root.harness.previousRuns[_this2.attempt - 1]?.[testIdentifier];
      if (previousAttempt != null) {
        _this2.passedAttempt = previousAttempt.passed_on_attempt;
        if (previousAttempt.duration_ms !== undefined) {
          _this2.replayedDurationNs = BigInt(MathRound(previousAttempt.duration_ms * 1_000_000));
        }
        _this2.fn = () => {
          // Restore the original duration on the synthetic replay. Suites are
          // skipped here because Suite.run() unconditionally reassigns
          // startTime later; only non-suite tests benefit from setting it.
          if (_this2.reportedType !== 'suite') {
            _this2.startTime = hrtime();
            _this2.endTime = _this2.startTime + (_this2.replayedDurationNs ?? 0n);
          }
          for (var i = 0; i < (previousAttempt.children?.length ?? 0); i++) {
            var child = previousAttempt.children[i];
            var _t3 = _this2.createSubtest(Test, child.name, {
              __proto__: null
            }, noop, {
              __proto__: null,
              loc: [child.line, child.column, child.file]
            }, noop);
            _t3.startTime = hrtime();
            _t3.endTime = _t3.startTime + (_t3.replayedDurationNs ?? 0n);
            // For suites, Suite.run() starts the subtests via SafePromiseAll.
            // Starting them here as well would run them twice, re-invoking the
            // synthetic children-creator against a now-incremented disambiguator
            // and producing spurious failures.
            if (_this2.reportedType !== 'suite') {
              _t3.start();
            }
          }
        };
      }
    }
    return _this2;
  }
  _inherits(Test, _AsyncResource);
  return _createClass(Test, [{
    key: "tags",
    get: function () {
      if (_classPrivateFieldGet(_tagsArray, this) !== null) {
        return _classPrivateFieldGet(_tagsArray, this);
      }
      _classPrivateFieldSet(_tagsArray, this, this.tagSet.size === 0 ? kEmptyTagArray : ObjectFreeze(ArrayFrom(this.tagSet)));
      return _classPrivateFieldGet(_tagsArray, this);
    }
  }, {
    key: "applyFilters",
    value: function applyFilters() {
      if (this.error) {
        // Never filter out errors.
        return;
      }
      if (this.filteredByName) {
        this.filtered = true;
        return;
      }
      if (this.root.harness.isFilteringByOnly && !this.only && !this.hasOnlyTests) {
        if (this.parent.runOnlySubtests || this.parent.hasOnlyTests || this.only === false) {
          this.filtered = true;
          return;
        }
      }
      if (this.filteredByTag) {
        this.filtered = true;
      }
    }
  }, {
    key: "willBeFilteredByName",
    value: function willBeFilteredByName() {
      var {
        testNamePatterns,
        testSkipPatterns
      } = this.config;
      if (testNamePatterns && !testMatchesPattern(this, testNamePatterns)) {
        return true;
      }
      if (testSkipPatterns && testMatchesPattern(this, testSkipPatterns)) {
        return true;
      }
      return false;
    }

    /**
     * Returns a name of the test prefixed by name of all its ancestors in ascending order, separated by a space
     * Ex."grandparent parent test"
     *
     * It's needed to match a single test with non-unique name by pattern
     * @returns {string}
     */
  }, {
    key: "getTestNameWithAncestors",
    value: function getTestNameWithAncestors() {
      if (!this.parent) return '';
      return `${this.parent.getTestNameWithAncestors()} ${this.name}`;
    }

    /**
     * @returns {boolean}
     */
  }, {
    key: "hasConcurrency",
    value: function hasConcurrency() {
      return this.concurrency > this.activeSubtests;
    }

    /**
     * @param {any} deferred
     * @returns {void}
     */
  }, {
    key: "addPendingSubtest",
    value: function addPendingSubtest(deferred) {
      ArrayPrototypePush(this.pendingSubtests, deferred);
    }
  }, {
    key: "schedulePendingSubtests",
    value: function schedulePendingSubtests() {
      if (this.pendingSubtestsScheduled) {
        return;
      }
      this.pendingSubtestsScheduled = true;
      queueMicrotask(() => {
        this.pendingSubtestsScheduled = false;
        this.processPendingSubtests();
      });
    }

    /**
     * Ensure each subtest has a contiguous, per-parent reporting order.
     * This is assigned at dequeue time for randomized runs, but tests that are
     * cancelled before dequeue still need an order to be reported.
     * @param {Test} subtest
     * @returns {void}
     */
  }, {
    key: "assignReportOrder",
    value: function assignReportOrder(subtest) {
      if (subtest.reportOrder === 0) {
        subtest.reportOrder = this.nextReportOrder++;
      }
    }
  }, {
    key: "dequeuePendingSubtest",
    value: function dequeuePendingSubtest() {
      if (!this.subtestQueueRandom || this.pendingSubtests.length < 2) {
        return ArrayPrototypeShift(this.pendingSubtests);
      }

      // Pick a uniformly random pending sibling when randomization is enabled.
      var index = MathFloor(this.subtestQueueRandom() * this.pendingSubtests.length);
      return ArrayPrototypeSplice(this.pendingSubtests, index, 1)[0];
    }

    /**
     * @returns {Promise<void>}
     */
  }, {
    key: "processPendingSubtests",
    value: function processPendingSubtests() {
      try {
        var _this3 = this;
        return _await(_continueIgnored(_for(function () {
          return _this3.pendingSubtests.length > 0 && !!_this3.hasConcurrency();
        }, void 0, function () {
          var deferred = _this3.dequeuePendingSubtest();
          var test = deferred.test;
          _this3.assignReportOrder(test);
          test.reporter.dequeue(test.nesting, test.loc, test.name, _this3.reportedType, test.testId, _this3.testId, test.tags);
          return _await(test.run(), function () {
            deferred.resolve();
          });
        })));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * @param {any} subtest
     * @returns {void}
     */
  }, {
    key: "addReadySubtest",
    value: function addReadySubtest(subtest) {
      this.assignReportOrder(subtest);
      this.readySubtests.set(subtest.reportOrder, subtest);
      if (this.unfinishedSubtests.delete(subtest) && this.unfinishedSubtests.size === 0) {
        this.subtestsPromise.resolve();
      }
    }

    /**
     * @param {boolean} canSend
     * @returns {void}
     */
  }, {
    key: "processReadySubtestRange",
    value: function processReadySubtestRange(canSend) {
      var start = this.waitingOn;
      var end = start + this.readySubtests.size;
      for (var i = start; i < end; i++) {
        var subtest = this.readySubtests.get(i);

        // Check if the specified subtest is in the map. If it is not, return
        // early to avoid trying to process any more tests since they would be
        // out of order.
        if (subtest === undefined) {
          return;
        }

        // Call isClearToSend() in the loop so that it is:
        // - Only called if there are results to report in the correct order.
        // - Guaranteed to only be called a maximum of once per call to
        //   processReadySubtestRange().
        canSend ||= this.isClearToSend();
        if (!canSend) {
          return;
        }

        // Report the subtest's results and remove it from the ready map.
        subtest.finalize();
        this.readySubtests.delete(i);
      }
    }
  }, {
    key: "createSubtest",
    value: function createSubtest(Factory, name, options, fn, overrides) {
      if (typeof name === 'function') {
        fn = name;
      } else if (name !== null && typeof name === 'object') {
        fn = options;
        options = name;
      } else if (typeof options === 'function') {
        fn = options;
      }
      if (options === null || typeof options !== 'object') {
        options = kEmptyObject;
      }
      var parent = this;

      // If this test has already ended, attach this test to the root test so
      // that the error can be properly reported.
      var preventAddingSubtests = this.finished || this.buildPhaseFinished;
      if (preventAddingSubtests) {
        while (parent.parent !== null) {
          parent = parent.parent;
        }
      }
      var test = new Factory(_objectSpread(_objectSpread({
        __proto__: null,
        fn,
        name,
        parent
      }, options), overrides));
      if (parent.waitingOn === 0) {
        parent.waitingOn = test.childNumber;
        parent.subtestsPromise = PromiseWithResolvers();
      }
      if (preventAddingSubtests) {
        test.fail(new ERR_TEST_FAILURE('test could not be started because its parent finished', kParentAlreadyFinished));
      }
      ArrayPrototypePush(parent.subtests, test);
      return test;
    }
  }, {
    key: "computeInheritedHooks",
    value: function computeInheritedHooks() {
      if (this.parent.hooks.beforeEach.length > 0) {
        ArrayPrototypeUnshiftApply(this.hooks.beforeEach, ArrayPrototypeSlice(this.parent.hooks.beforeEach));
      }
      if (this.parent.hooks.afterEach.length > 0) {
        ArrayPrototypePushApply(this.hooks.afterEach, ArrayPrototypeSlice(this.parent.hooks.afterEach));
      }
    }
  }, {
    key: "createHook",
    value: function createHook(name, fn, options) {
      validateOneOf(name, 'hook name', kHookNames);
      // eslint-disable-next-line no-use-before-define
      var hook = new TestHook(fn, options);
      if (name === 'before' || name === 'after') {
        hook.run = runOnce(hook.run, kRunOnceOptions);
      }
      if (name === 'before' && this.startTime !== null) {
        // Test has already started, run the hook immediately
        PromisePrototypeThen(hook.run(this.getRunArgs()), () => {
          if (hook.error != null) {
            this.fail(hook.error);
          }
        });
      }
      if (name === 'afterEach') {
        // afterEach hooks for the current test should run in the order that they
        // are created. However, the current test's afterEach hooks should run
        // prior to any ancestor afterEach hooks.
        ArrayPrototypeSplice(this.hooks[name], this.hooks.ownAfterEachCount, 0, hook);
        this.hooks.ownAfterEachCount++;
      } else {
        ArrayPrototypePush(this.hooks[name], hook);
      }
    }
  }, {
    key: "fail",
    value: function fail(err) {
      if (this.error !== null) {
        return;
      }
      if (this.expectFailure) {
        if (typeof this.expectFailure === 'object' && this.expectFailure.match !== undefined) {
          var {
            match: validation
          } = this.expectFailure;
          try {
            var errorToCheck = err?.code === 'ERR_TEST_FAILURE' && err?.failureType === kTestCodeFailure && err.cause ? err.cause : err;
            // eslint-disable-next-line no-restricted-syntax
            assert.throws(() => {
              throw errorToCheck;
            }, validation);
          } catch (e) {
            this.passed = false;
            this.error = new ERR_TEST_FAILURE('The test failed, but the error did not match the expected validation', kTestCodeFailure);
            this.error.cause = e;
            return;
          }
        }
        this.passed = true;
      } else {
        this.passed = false;
      }
      this.error = err;
    }
  }, {
    key: "pass",
    value: function pass() {
      if (this.error == null && this.expectFailure && !this.skipped) {
        this.passed = false;
        this.error = new ERR_TEST_FAILURE('test was expected to fail but passed', kExpectedFailure);
        return;
      }
      if (this.error !== null) {
        return;
      }
      if (this.skipped || this.isTodo) {
        this.passed = true;
        return;
      }
      if (this.expectFailure) {
        this.passed = false;
        this.error = new ERR_TEST_FAILURE('Test passed but was expected to fail', kTestCodeFailure);
        return;
      }
      this.passed = true;
    }
  }, {
    key: "skip",
    value: function skip(message) {
      this.skipped = true;
      this.message = message;
    }
  }, {
    key: "todo",
    value: function todo(message) {
      this.isTodo = true;
      this.message = message;
    }
  }, {
    key: "diagnostic",
    value: function diagnostic(message) {
      ArrayPrototypePush(this.diagnostics, message);
    }
  }, {
    key: "start",
    value: function start() {
      this.applyFilters();
      if (this.filtered) {
        noopTestStream ??= new TestsStream();
        this.reporter = noopTestStream;
        this.run = this.filteredRun;
      } else {
        this.testNumber = ++this.parent.outputSubtestCount;
      }

      // If there is enough available concurrency to run the test now, then do
      // it. Otherwise, return a Promise to the caller and mark the test as
      // pending for later execution.
      this.parent.unfinishedSubtests.add(this);
      this.reporter.enqueue(this.nesting, this.loc, this.name, this.reportedType, this.testId, this.parent?.testId, this.tags);
      if (this.root.harness.buildPromise || !this.parent.hasConcurrency()) {
        var deferred = PromiseWithResolvers();
        setOwnProperty(deferred, 'test', this);
        this.parent.addPendingSubtest(deferred);
        return deferred.promise;
      }

      // When this parent dequeues subtests through subtestQueueRandom, defer the
      // first start to the next microtask so siblings created in the same
      // synchronous turn are all eligible for the first randomized pick, rather
      // than letting declaration order claim the initial concurrency slot(s).
      if (this.parent.subtestQueueRandom) {
        var _deferred = PromiseWithResolvers();
        setOwnProperty(_deferred, 'test', this);
        this.parent.addPendingSubtest(_deferred);
        this.parent.schedulePendingSubtests();
        return _deferred.promise;
      }
      this.parent.assignReportOrder(this);
      this.reporter.dequeue(this.nesting, this.loc, this.name, this.reportedType, this.testId, this.parent?.testId, this.tags);
      return this.run();
    }
  }, {
    key: kShouldAbort,
    value: function () {
      if (this.signal.aborted || this.outerSignal?.aborted) {
        _classPrivateFieldGet(_abortHandler, this).call(this);
        return true;
      }
    }
  }, {
    key: "getCtx",
    value: function getCtx() {
      _classPrivateFieldGet(_ctx, this) ?? _classPrivateFieldSet(_ctx, this, new TestContext(this));
      return _classPrivateFieldGet(_ctx, this);
    }
  }, {
    key: "getRunArgs",
    value: function getRunArgs() {
      var ctx = this.getCtx();
      return {
        __proto__: null,
        ctx,
        args: [ctx]
      };
    }
  }, {
    key: "runHook",
    value: function runHook(hook, args) {
      try {
        var _exit = false;
        var _this4 = this;
        validateOneOf(hook, 'hook name', kHookNames);
        return _await(_catch(function () {
          var hooks = _this4.hooks[hook];
          return _forTo(hooks, function (i) {
            var hook = hooks[i];
            return _await(hook.run(args), function () {
              if (hook.error) {
                throw hook.error;
              }
            });
          }, function () {
            return _exit;
          });
        }, function (err) {
          var error = new ERR_TEST_FAILURE(`failed running ${hook} hook`, kHookFailure);
          error.cause = isTestFailureError(err) ? err.cause : err;
          throw error;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "filteredRun",
    value: function filteredRun() {
      try {
        var _this5 = this;
        _this5.pass();
        _this5.subtests = [];
        _this5.report = noop;
        queueMicrotask(() => _this5.postRun());
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "run",
    value: function run() {
      try {
        var _this6 = this;
        if (_this6.parent !== null) {
          _this6.parent.activeSubtests++;
          _this6.computeInheritedHooks();
        }
        _this6.startTime ??= hrtime();

        // Channel context object shared across all lifecycle events for this test run.
        // Only tests emit events; hooks do not. This way, the test's span encompasses
        // its before/beforeEach hooks, the test body, and its afterEach/after hooks.
        var channelContext = _this6.hookType === undefined ? {
          __proto__: null,
          name: _this6.name,
          nesting: _this6.nesting,
          file: _this6.entryFile,
          type: _this6.reportedType
        } : null;
        if (_this6[kShouldAbort]()) {
          _this6.postRun();
          return _await();
        }
        var hookArgs = _this6.getRunArgs();
        var {
          args,
          ctx
        } = hookArgs;
        if (_this6.plan === null && _this6.expectedAssertions) {
          ctx.plan(_this6.expectedAssertions);
        }
        var wasSkippedBeforeRun = _this6.skipped;
        var after = _async(function () {
          return _invokeIgnored(function () {
            if (_this6.hooks.after.length > 0) {
              return _awaitIgnored(_this6.runHook('after', hookArgs));
            }
          });
        });
        var afterEach = runOnce(_async(function () {
          return _invokeIgnored(function () {
            if (_this6.parent?.hooks.afterEach.length > 0 && !wasSkippedBeforeRun) {
              return _awaitIgnored(_this6.parent.runHook('afterEach', hookArgs));
            }
          });
        }), kRunOnceOptions);
        var stopPromise;
        var publishEnd = () => testChannel.end.publish(channelContext);
        var publishError = err => testChannel.error.publish(_objectSpread(_objectSpread({
          __proto__: null
        }, channelContext), {}, {
          error: err
        }));
        return _await(_continue(_finallyRethrows(function () {
          return _catch(function () {
            return _invoke(function () {
              if (_this6.parent?.hooks.before.length > 0) {
                // This hook usually runs immediately, we need to wait for it to finish
                return _awaitIgnored(_this6.parent.runHook('before', _this6.parent.getRunArgs()));
              }
            }, function () {
              return _invoke(function () {
                if (_this6.parent?.hooks.beforeEach.length > 0 && !_this6.skipped) {
                  return _awaitIgnored(_this6.parent.runHook('beforeEach', hookArgs));
                }
              }, function () {
                stopPromise = stopTest(_this6.timeout, _this6.signal);
                var runArgs = ArrayPrototypeSlice(args);

                // Wrap the test function with runStores if the channel has subscribers.
                // The wrapped function is what gets passed to runInAsyncScope, ensuring that
                // the test runs within both the runStores context (for AsyncLocalStorage/bindStore)
                // AND the AsyncResource scope. It's critical that runStores wraps the function,
                // not the runInAsyncScope call itself, to maintain AsyncLocalStorage bindings.
                // Wait for the race to finish
                var testFn = _this6.fn;
                if (channelContext !== null && testChannel.start.hasSubscribers) {
                  testFn = function () {
                    for (var _len3 = arguments.length, fnArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                      fnArgs[_key3] = arguments[_key3];
                    }
                    return testChannel.start.runStores(channelContext, () => {
                      publishEnd = AsyncResource.bind(publishEnd);
                      publishError = AsyncResource.bind(publishError);
                      return ReflectApply(_this6.fn, _this6, fnArgs);
                    });
                  };
                }
                ArrayPrototypeUnshift(runArgs, testFn, ctx);
                var promises = [];
                if (_this6.fn.length === runArgs.length - 1) {
                  // This test is using legacy Node.js error-first callbacks.
                  var {
                    promise,
                    cb
                  } = createDeferredCallback();
                  ArrayPrototypePush(runArgs, cb);
                  var ret = ReflectApply(_this6.runInAsyncScope, _this6, runArgs);
                  if (isPromise(ret)) {
                    _this6.fail(new ERR_TEST_FAILURE('passed a callback but also returned a Promise', kCallbackAndPromisePresent));
                    ArrayPrototypePush(promises, ret);
                  } else {
                    ArrayPrototypePush(promises, PromiseResolve(promise));
                  }
                } else {
                  // This test is synchronous or using Promises.
                  var _promise = ReflectApply(_this6.runInAsyncScope, _this6, runArgs);
                  ArrayPrototypePush(promises, PromiseResolve(_promise));
                }
                ArrayPrototypePush(promises, stopPromise);
                return _await(SafePromiseRace(promises), function () {
                  _this6[kShouldAbort]();
                  return _invoke(function () {
                    if (_this6.subtestsPromise !== null) {
                      return _awaitIgnored(SafePromiseRace([_this6.subtestsPromise.promise, stopPromise]));
                    }
                  }, function () {
                    return _invoke(function () {
                      if (_this6.plan !== null) {
                        var planPromise = _this6.plan?.check();
                        // If the plan returns a promise, it means that it is waiting for more assertions to be made before
                        // continuing.
                        return _invokeIgnored(function () {
                          if (planPromise) {
                            return _awaitIgnored(SafePromiseRace([planPromise, stopPromise]));
                          }
                        });
                      }
                    }, function () {
                      _this6.pass();
                      return _call(afterEach, function () {
                        return _callIgnored(after);
                      });
                    });
                  });
                });
              });
            });
          }, function (err) {
            if (channelContext !== null && testChannel.error.hasSubscribers) {
              publishError(err);
            }
            if (isTestFailureError(err)) {
              if (err.failureType === kTestTimeoutFailure) {
                _assertClassBrand(_Test_brand, _this6, _cancel).call(_this6, err);
              } else {
                _this6.fail(err);
              }
            } else {
              _this6.fail(new ERR_TEST_FAILURE(err, kTestCodeFailure));
            }
            return _continue(_catch(function () {
              return _callIgnored(afterEach);
            }, _empty), function () {
              return _continueIgnored(_catch(function () {
                return _callIgnored(after);
              }, _empty));
            });
          });
        }, function (_wasThrown, _result3) {
          stopPromise?.[SymbolDispose]();

          // Do not abort hooks and the root test as hooks instance are shared between tests suite so aborting them will
          // cause them to not run for further tests.
          if (_this6.parent !== null) {
            _this6.abortController.abort();
          }

          // Publish diagnostics_channel end event if the channel has subscribers (in both success and error cases)
          if (channelContext !== null && testChannel.end.hasSubscribers) {
            publishEnd();
          }
          return _rethrow(_wasThrown, _result3);
        }), function () {
          return _invokeIgnored(function () {
            if (_this6.parent !== null || typeof _this6.hookType === 'string') {
              // Clean up the test. Then, try to report the results and execute any
              // tests that were pending due to available concurrency.
              //
              // The root test is skipped here because it is a special case. Its
              // postRun() method is called when the process is getting ready to exit.
              // This helps catch any asynchronous activity that occurs after the tests
              // have finished executing.
              _this6.postRun();
            } else return _invokeIgnored(function () {
              if (_this6.config.forceExit) {
                // This is the root test, and all known tests and hooks have finished
                // executing. If the user wants to force exit the process regardless of
                // any remaining ref'ed handles, then do that now. It is theoretically
                // possible that a ref'ed handle could asynchronously create more tests,
                // but the user opted into this behavior.
                var promises = [];
                var _loop = function () {
                  var {
                    destination
                  } = reporterScope.reporters[_i];
                  ArrayPrototypePush(promises, new Promise(resolve => {
                    destination.on('unpipe', () => {
                      if (!destination.closed && typeof destination.close === 'function') {
                        destination.close(resolve);
                      } else {
                        resolve();
                      }
                    });
                  }));
                };
                for (var _i = 0; _i < reporterScope.reporters.length; _i++) {
                  _loop();
                }
                _this6.harness.teardown();
                return _await(SafePromiseAllReturnVoid(promises), function () {
                  process.exit();
                });
              }
            });
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "postRun",
    value: function postRun(pendingSubtestsError) {
      // If the test was cancelled before it started, then the start and end
      // times need to be corrected.
      this.endTime ??= hrtime();
      this.startTime ??= this.endTime;

      // The test has run, so recursively cancel any outstanding subtests and
      // mark this test as failed if any subtests failed.
      this.pendingSubtests = [];
      var failed = 0;
      for (var _i2 = 0; _i2 < this.subtests.length; _i2++) {
        var subtest = this.subtests[_i2];
        if (!subtest.finished) {
          _assertClassBrand(_Test_brand, subtest, _cancel).call(subtest, pendingSubtestsError);
          subtest.postRun(pendingSubtestsError);
        }
        if (!subtest.passed && !subtest.isTodo) {
          failed++;
        }
      }
      if ((this.passed || this.parent === null) && failed > 0) {
        var subtestString = `subtest${failed > 1 ? 's' : ''}`;
        var msg = `${failed} ${subtestString} failed`;
        this.fail(new ERR_TEST_FAILURE(msg, kSubtestsFailed));
      }
      this.outerSignal?.removeEventListener('abort', _classPrivateFieldGet(_abortHandler, this));
      this.mock?.reset();
      if (this.parent !== null) {
        if (!this.filtered) {
          var report = this.getReportDetails();
          report.details.passed = this.passed;
          this.testNumber ||= ++this.parent.outputSubtestCount;
          this.reporter.complete(this.nesting, this.loc, this.testNumber, this.name, report.details, report.directive, this.testId, this.parent?.testId, this.tags);
          this.parent.activeSubtests--;
        }
        this.parent.addReadySubtest(this);
        this.parent.processReadySubtestRange(false);
        this.parent.processPendingSubtests();
      } else if (!this.reported) {
        var {
          diagnostics,
          harness,
          loc,
          nesting,
          reporter
        } = this;
        this.reported = true;
        reporter.plan(nesting, loc, harness.counters.topLevel);

        // Call this harness.coverage() before collecting diagnostics, since failure to collect coverage is a diagnostic.
        var coverage = harness.coverage();
        harness.snapshotManager?.writeSnapshotFiles();
        for (var _i3 = 0; _i3 < diagnostics.length; _i3++) {
          reporter.diagnostic(nesting, loc, diagnostics[_i3]);
        }
        var duration = this.duration();
        reporter.diagnostic(nesting, loc, `tests ${harness.counters.tests}`);
        reporter.diagnostic(nesting, loc, `suites ${harness.counters.suites}`);
        reporter.diagnostic(nesting, loc, `pass ${harness.counters.passed}`);
        reporter.diagnostic(nesting, loc, `fail ${harness.counters.failed}`);
        reporter.diagnostic(nesting, loc, `cancelled ${harness.counters.cancelled}`);
        reporter.diagnostic(nesting, loc, `skipped ${harness.counters.skipped}`);
        reporter.diagnostic(nesting, loc, `todo ${harness.counters.todo}`);
        reporter.diagnostic(nesting, loc, `duration_ms ${duration}`);
        if (coverage) {
          var coverages = [{
            __proto__: null,
            actual: coverage.totals.coveredLinePercent,
            threshold: this.config.lineCoverage,
            name: 'line'
          }, {
            __proto__: null,
            actual: coverage.totals.coveredBranchPercent,
            threshold: this.config.branchCoverage,
            name: 'branch'
          }, {
            __proto__: null,
            actual: coverage.totals.coveredFunctionPercent,
            threshold: this.config.functionCoverage,
            name: 'function'
          }];
          for (var _i4 = 0; _i4 < coverages.length; _i4++) {
            var {
              threshold,
              actual,
              name
            } = coverages[_i4];
            if (actual < threshold) {
              harness.success = false;
              process.exitCode = kGenericUserError;
              reporter.diagnostic(nesting, loc, `Error: ${NumberPrototypeToFixed(actual, 2)}% ${name} coverage does not meet threshold of ${threshold}%.`, 'error');
            }
          }
          reporter.coverage(nesting, loc, coverage);
        }
        reporter.summary(nesting, loc?.file, harness.success, harness.counters, duration);
        if (harness.watching) {
          this.reported = false;
          harness.resetCounters();
          assertObj = undefined;
        } else {
          reporter.end();
        }
      }
    }
  }, {
    key: "isClearToSend",
    value: function isClearToSend() {
      return this.parent === null || this.parent.waitingOn === this.reportOrder && this.parent.isClearToSend();
    }
  }, {
    key: "finalize",
    value: function finalize() {
      // By the time this function is called, the following can be relied on:
      // - The current test has completed or been cancelled.
      // - All of this test's subtests have completed or been cancelled.
      // - It is the current test's turn to report its results.

      // Report any subtests that have not been reported yet. Since all of the
      // subtests have finished, it's safe to pass true to
      // processReadySubtestRange(), which will finalize all remaining subtests.
      this.processReadySubtestRange(true);

      // Output this test's results and update the parent's waiting counter.
      this.report();
      this.parent.waitingOn++;
      this.finished = true;
      if (this.parent === this.root && this.root.waitingOn > this.root.subtests.length) {
        // At this point all of the tests have finished running. However, there
        // might be ref'ed handles keeping the event loop alive. This gives the
        // global after() hook a chance to clean them up. The user may also
        // want to force the test runner to exit despite ref'ed handles.
        this.root.run();
      }
    }
  }, {
    key: "duration",
    value: function duration() {
      // Duration is recorded in BigInt nanoseconds. Convert to milliseconds.
      return _Number(this.endTime - this.startTime) / 1_000_000;
    }
  }, {
    key: "getReportDetails",
    value: function getReportDetails() {
      var directive;
      var details = {
        __proto__: null,
        duration_ms: this.duration()
      };
      if (this.skipped) {
        directive = this.reporter.getSkip(this.message);
      } else if (this.isTodo) {
        directive = this.reporter.getTodo(this.message);
      } else if (this.expectFailure) {
        var message = typeof this.expectFailure === 'object' ? this.expectFailure.label : this.expectFailure;
        directive = this.reporter.getXFail(message);
      }
      if (this.reportedType) {
        details.type = this.reportedType;
      }
      if (!this.passed) {
        details.error = this.error;
      }
      if (this.attempt !== undefined) {
        details.attempt = this.attempt;
      }
      if (this.passedAttempt !== undefined) {
        details.passed_on_attempt = this.passedAttempt;
      }
      return {
        __proto__: null,
        details,
        directive
      };
    }
  }, {
    key: "report",
    value: function report() {
      countCompletedTest(this);
      if (this.outputSubtestCount > 0) {
        this.reporter.plan(this.subtests[0].nesting, this.loc, this.outputSubtestCount);
      } else {
        this.reportStarted();
      }
      var report = this.getReportDetails();
      if (this.passed) {
        this.reporter.ok(this.nesting, this.loc, this.testNumber, this.name, report.details, report.directive, this.testId, this.parent?.testId, this.tags);
      } else {
        this.reporter.fail(this.nesting, this.loc, this.testNumber, this.name, report.details, report.directive, this.testId, this.parent?.testId, this.tags);
      }
      for (var _i5 = 0; _i5 < this.diagnostics.length; _i5++) {
        this.reporter.diagnostic(this.nesting, this.loc, this.diagnostics[_i5]);
      }
    }
  }, {
    key: "reportStarted",
    value: function reportStarted() {
      if (_classPrivateFieldGet(_reportedSubtest, this) || this.parent === null) {
        return;
      }
      _classPrivateFieldSet(_reportedSubtest, this, true);
      this.parent.reportStarted();
      this.reporter.start(this.nesting, this.loc, this.name, this.testId, this.parent?.testId, this.tags);
    }
  }, {
    key: "clearExecutionTime",
    value: function clearExecutionTime() {
      this.startTime = hrtime();
      this.endTime = null;
    }
  }]);
}(AsyncResource);
function _cancel(error) {
  if (this.endTime !== null || this.error !== null) {
    return;
  }
  this.fail(error || new ERR_TEST_FAILURE('test did not finish before its parent and was cancelled', kCancelledByParent));
  this.cancelled = true;
  this.abortController.abort();
}
var _args = /*#__PURE__*/new WeakMap();
var TestHook = /*#__PURE__*/function (_Test2) {
  function TestHook(fn, options) {
    var _this7;
    _classCallCheck(this, TestHook);
    var {
      hookType,
      loc,
      parent,
      timeout,
      signal
    } = options;
    _this7 = _callSuper(this, TestHook, [{
      __proto__: null,
      fn,
      loc,
      timeout,
      signal,
      harness: parent.root.harness
    }]);
    _defineProperty(_this7, "reportedType", 'hook');
    _classPrivateFieldInitSpec(_this7, _args, void 0);
    _this7.parentTest = parent;
    _this7.hookType = hookType;
    return _this7;
  }
  _inherits(TestHook, _Test2);
  return _createClass(TestHook, [{
    key: "run",
    value: function run(args) {
      if (this.error && !this.outerSignal?.aborted) {
        this.passed = false;
        this.error = null;
        this.abortController.abort();
        this.abortController = new AbortController();
        this.signal = this.abortController.signal;
      }
      _classPrivateFieldSet(_args, this, args);
      return _superPropGet(TestHook, "run", this, 3)([]);
    }
  }, {
    key: "getCtx",
    value: function getCtx() {
      return this.parentTest.getCtx();
    }
  }, {
    key: "getRunArgs",
    value: function getRunArgs() {
      return _classPrivateFieldGet(_args, this);
    }
  }, {
    key: "willBeFilteredByName",
    value: function willBeFilteredByName() {
      return false;
    }
  }, {
    key: "postRun",
    value: function postRun() {
      var {
        error,
        loc,
        parentTest: parent
      } = this;

      // Report failures in the root test's after() hook.
      if (error && parent === parent.root && this.hookType === 'after') {
        if (isTestFailureError(error)) {
          error.failureType = kHookFailure;
        }
        this.endTime ??= hrtime();
        parent.reporter.fail(0, loc, parent.subtests.length + 1, loc.file, {
          __proto__: null,
          duration_ms: this.duration(),
          error
        }, undefined, undefined, undefined, parent.tags);
      }
    }
  }]);
}(Test);
var _publishEnd = /*#__PURE__*/new WeakMap();
var _Suite_brand = /*#__PURE__*/new WeakSet();
var _ctx2 = /*#__PURE__*/new WeakMap();
var Suite = /*#__PURE__*/function (_Test3) {
  function Suite(options) {
    var _this8;
    _classCallCheck(this, Suite);
    _this8 = _callSuper(this, Suite, [options]);
    _classPrivateMethodInitSpec(_this8, _Suite_brand);
    _defineProperty(_this8, "reportedType", 'suite');
    _classPrivateFieldInitSpec(_this8, _publishEnd, null);
    _classPrivateFieldInitSpec(_this8, _ctx2, void 0);
    if (options.timeout == null) {
      _this8.timeout = null;
    }
    if (_this8.config.testNamePatterns !== null && _this8.config.testSkipPatterns !== null && !options.skip) {
      _this8.fn = options.fn || _this8.fn;
      _this8.skipped = false;
    }
    _this8.buildSuite = _this8.createBuild();
    _this8.fn = noop;
    return _this8;
  }
  _inherits(Suite, _Test3);
  return _createClass(Suite, [{
    key: "createBuild",
    value: function createBuild() {
      try {
        var _this9 = this;
        var channelContext = {
          __proto__: null,
          name: _this9.name,
          nesting: _this9.nesting,
          file: _this9.entryFile,
          type: _this9.reportedType
        };
        var publishEnd = () => testChannel.end.publish(channelContext);
        var publishError = err => testChannel.error.publish(_objectSpread(_objectSpread({
          __proto__: null
        }, channelContext), {}, {
          error: err
        }));
        return _await(_continue(_catch(function () {
          var {
            ctx,
            args
          } = _this9.getRunArgs();

          // Wrap the suite function with runStores if the channel has subscribers.
          // The wrapped function is what gets passed to runInAsyncScope, ensuring that
          // the suite runs within both the runStores context (for AsyncLocalStorage/bindStore)
          // AND the AsyncResource scope. It's critical that runStores wraps the function,
          // not the runInAsyncScope call itself, to maintain AsyncLocalStorage bindings.
          var suiteFn = _this9.fn;
          if (testChannel.start.hasSubscribers) {
            var baseFn = _this9.fn;
            suiteFn = function () {
              for (var _len4 = arguments.length, fnArgs = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                fnArgs[_key4] = arguments[_key4];
              }
              return testChannel.start.runStores(channelContext, () => {
                publishEnd = AsyncResource.bind(publishEnd);
                publishError = AsyncResource.bind(publishError);
                return ReflectApply(baseFn, _this9, fnArgs);
              });
            };
          }
          var runArgs = [suiteFn, ctx];
          ArrayPrototypePushApply(runArgs, args);
          return _awaitIgnored(ReflectApply(_this9.runInAsyncScope, _this9, runArgs));
        }, function (err) {
          if (testChannel.error.hasSubscribers) {
            publishError(err);
          }
          _this9.fail(new ERR_TEST_FAILURE(err, kTestCodeFailure));
        }), function () {
          _classPrivateFieldSet(_publishEnd, _this9, publishEnd);
          _this9.buildPhaseFinished = true;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "getCtx",
    value: function getCtx() {
      _classPrivateFieldGet(_ctx2, this) ?? _classPrivateFieldSet(_ctx2, this, new TestContext(this));
      return _classPrivateFieldGet(_ctx2, this);
    }
  }, {
    key: "getRunArgs",
    value: function getRunArgs() {
      var ctx = new SuiteContext(this);
      return {
        __proto__: null,
        ctx,
        args: [ctx]
      };
    }
  }, {
    key: "run",
    value: function run() {
      try {
        var _exit2 = false;
        var _this0 = this;
        _this0.computeInheritedHooks();
        var hookArgs = _this0.getRunArgs();
        var stopPromise;
        var after = runOnce(() => _this0.runHook('after', hookArgs), kRunOnceOptions);
        return _await(_continue(_finallyRethrows(function () {
          return _catch(function () {
            _this0.parent.activeSubtests++;
            return _await(_this0.buildSuite, function () {
              _this0.startTime = hrtime();
              if (_this0[kShouldAbort]()) {
                _this0.subtests = [];
                _this0.postRun();
                _exit2 = true;
                return;
              }
              return _invoke(function () {
                if (_this0.parent.hooks.before.length > 0) {
                  return _awaitIgnored(_this0.parent.runHook('before', _this0.parent.getRunArgs()));
                }
              }, function () {
                return _await(_this0.runHook('before', hookArgs), function () {
                  stopPromise = stopTest(_this0.timeout, _this0.signal);
                  var subtests = _this0.skipped || _this0.error ? [] : _this0.subtests;
                  var promise = SafePromiseAll(subtests, subtests => subtests.start());
                  return _await(SafePromiseRace([promise, stopPromise]), function () {
                    return _call(after, function () {
                      _this0.pass();
                    });
                  });
                });
              });
            });
          }, function (err) {
            return _continue(_catch(function () {
              return _callIgnored(after);
            }, _empty), function () {
              if (isTestFailureError(err)) {
                _this0.fail(err);
              } else {
                _this0.fail(new ERR_TEST_FAILURE(err, kTestCodeFailure));
              }
            });
          });
        }, function (_wasThrown2, _result4) {
          stopPromise?.[SymbolDispose]();
          _assertClassBrand(_Suite_brand, _this0, _publishSuiteEnd).call(_this0);
          return _rethrow(_wasThrown2, _result4);
        }), function (_result4) {
          if (_exit2) return _result4;
          _this0.postRun();
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);
}(Test);
function _publishSuiteEnd() {
  var publishEnd = _classPrivateFieldGet(_publishEnd, this);
  _classPrivateFieldSet(_publishEnd, this, null);
  if (publishEnd !== null && testChannel.end.hasSubscribers) {
    publishEnd();
  }
}
function getFullName(test) {
  if (test === test.root) return test.name;
  var fullName = test.name;
  for (var t = test.parent; t !== t.root; t = t.parent) {
    fullName = `${t.name} > ${fullName}`;
  }
  return fullName;
}
module.exports = {
  kCancelledByParent,
  kSubtestsFailed,
  kTestCodeFailure,
  kTestTimeoutFailure,
  kAborted,
  kUnwrapErrors,
  Suite,
  Test
};

