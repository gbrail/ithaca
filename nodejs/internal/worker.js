'use strict';

function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
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
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
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
  ArrayPrototypeForEach,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  AtomicsAdd,
  Float64Array,
  FunctionPrototypeBind,
  MathMax,
  NumberMAX_SAFE_INTEGER,
  ObjectEntries,
  Promise,
  PromiseResolve,
  PromiseWithResolvers,
  ReflectApply,
  RegExpPrototypeExec,
  SafeArrayIterator,
  SafeMap,
  String: _String,
  StringPrototypeTrim,
  Symbol: _Symbol,
  SymbolAsyncDispose,
  SymbolFor,
  TypedArrayPrototypeFill,
  Uint32Array
} = primordials;
var EventEmitter = require('events');
var assert = require('internal/assert');
var path = require('path');
var {
  internalEventLoopUtilization
} = require('internal/perf/event_loop_utilization');
var errorCodes = require('internal/errors').codes;
var {
  ERR_WORKER_NOT_RUNNING,
  ERR_WORKER_PATH,
  ERR_WORKER_UNSERIALIZABLE_ERROR,
  ERR_WORKER_INVALID_EXEC_ARGV,
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE,
  ERR_OPERATION_FAILED
} = errorCodes;
var workerIo = require('internal/worker/io');
var {
  drainMessagePort,
  receiveMessageOnPort,
  MessageChannel,
  messageTypes,
  kPort,
  kIncrementsPortRef,
  kWaitingStreams,
  kStdioWantsMoreDataCallback,
  setupPortReferencing,
  ReadableWorkerStdio,
  WritableWorkerStdio
} = workerIo;
var {
  createMainThreadPort,
  destroyMainThreadPort
} = require('internal/worker/messaging');
var {
  deserializeError
} = require('internal/error_serdes');
var {
  fileURLToPath,
  isURL,
  pathToFileURL
} = require('internal/url');
var {
  constructSharedArrayBuffer,
  kEmptyObject
} = require('internal/util');
var {
  validateArray,
  validateString,
  validateObject,
  validateNumber
} = require('internal/validators');
var {
  throwIfBuildingSnapshot
} = require('internal/v8/startup_snapshot');
var {
  ownsProcessState,
  isMainThread,
  isInternalThread,
  resourceLimits: resourceLimitsRaw,
  threadId,
  threadName,
  Worker: WorkerImpl,
  kMaxYoungGenerationSizeMb,
  kMaxOldGenerationSizeMb,
  kCodeRangeSizeMb,
  kStackSizeMb,
  kTotalResourceLimitCount
} = internalBinding('worker');
var kHandle = _Symbol('kHandle');
var kPublicPort = _Symbol('kPublicPort');
var kDispose = _Symbol('kDispose');
var kOnExit = _Symbol('kOnExit');
var kOnMessage = _Symbol('kOnMessage');
var kOnCouldNotSerializeErr = _Symbol('kOnCouldNotSerializeErr');
var kOnErrorMessage = _Symbol('kOnErrorMessage');
var kParentSideStdio = _Symbol('kParentSideStdio');
var kLoopStartTime = _Symbol('kLoopStartTime');
var kIsInternal = _Symbol('kIsInternal');
var kIsOnline = _Symbol('kIsOnline');
var SHARE_ENV = SymbolFor('nodejs.worker_threads.SHARE_ENV');
var debug = require('internal/util/debuglog').debuglog('worker', fn => {
  debug = fn;
});
var dc = require('diagnostics_channel');
var workerThreadsChannel = dc.channel('worker_threads');
var cwdCounter;
var normalizeHeapProfileOptions;
var normalizeCpuProfileOptions;
var environmentData = new SafeMap();
if (isMainThread) {
  cwdCounter = new Uint32Array(constructSharedArrayBuffer(4));
  var originalChdir = process.chdir;
  process.chdir = function (path) {
    originalChdir(path);
    AtomicsAdd(cwdCounter, 0, 1);
  };
}
function setEnvironmentData(key, value) {
  if (value === undefined) environmentData.delete(key);else environmentData.set(key, value);
}
function getEnvironmentData(key) {
  return environmentData.get(key);
}
function assignEnvironmentData(data) {
  if (data === undefined) return;
  data.forEach((value, key) => {
    environmentData.set(key, value);
  });
}
var _worker = /*#__PURE__*/new WeakMap();
var _id = /*#__PURE__*/new WeakMap();
var _promise = /*#__PURE__*/new WeakMap();
var CPUProfileHandle = /*#__PURE__*/function () {
  function CPUProfileHandle(worker, id) {
    _classCallCheck(this, CPUProfileHandle);
    _classPrivateFieldInitSpec(this, _worker, null);
    _classPrivateFieldInitSpec(this, _id, null);
    _classPrivateFieldInitSpec(this, _promise, null);
    _classPrivateFieldSet(_worker, this, worker);
    _classPrivateFieldSet(_id, this, id);
  }
  return _createClass(CPUProfileHandle, [{
    key: "stop",
    value: function stop() {
      if (_classPrivateFieldGet(_promise, this)) {
        return _classPrivateFieldGet(_promise, this);
      }
      var stopTaker = _classPrivateFieldGet(_worker, this)[kHandle]?.stopCpuProfile(_classPrivateFieldGet(_id, this));
      return _classPrivateFieldSet(_promise, this, new Promise((resolve, reject) => {
        if (!stopTaker) return reject(new ERR_WORKER_NOT_RUNNING());
        stopTaker.ondone = (err, profile) => {
          if (err) {
            return reject(err);
          }
          resolve(profile);
        };
      }));
    }
  }, {
    key: SymbolAsyncDispose,
    value: _async(function () {
      var _this = this;
      return _awaitIgnored(_this.stop());
    })
  }]);
}();
var _worker2 = /*#__PURE__*/new WeakMap();
var _promise2 = /*#__PURE__*/new WeakMap();
var HeapProfileHandle = /*#__PURE__*/function () {
  function HeapProfileHandle(worker) {
    _classCallCheck(this, HeapProfileHandle);
    _classPrivateFieldInitSpec(this, _worker2, null);
    _classPrivateFieldInitSpec(this, _promise2, null);
    _classPrivateFieldSet(_worker2, this, worker);
  }
  return _createClass(HeapProfileHandle, [{
    key: "stop",
    value: function stop() {
      if (_classPrivateFieldGet(_promise2, this)) {
        return _classPrivateFieldGet(_promise2, this);
      }
      var stopTaker = _classPrivateFieldGet(_worker2, this)[kHandle]?.stopHeapProfile();
      return _classPrivateFieldSet(_promise2, this, new Promise((resolve, reject) => {
        if (!stopTaker) return reject(new ERR_WORKER_NOT_RUNNING());
        stopTaker.ondone = (err, profile) => {
          if (err) {
            return reject(err);
          }
          resolve(profile);
        };
      }));
    }
  }, {
    key: SymbolAsyncDispose,
    value: _async(function () {
      var _this2 = this;
      return _awaitIgnored(_this2.stop());
    })
  }]);
}();
var Worker = /*#__PURE__*/function (_EventEmitter) {
  function Worker(filename) {
    var _this3;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, Worker);
    throwIfBuildingSnapshot('Creating workers');
    _this3 = _callSuper(this, Worker);
    var isInternal = arguments[2] === kIsInternal;
    debug(`[${threadId}] create new worker`, filename, options, `isInternal: ${isInternal}`);
    if (options.execArgv) validateArray(options.execArgv, 'options.execArgv');
    var argv;
    if (options.argv) {
      validateArray(options.argv, 'options.argv');
      argv = ArrayPrototypeMap(options.argv, _String);
    }
    var url, doEval;
    if (isInternal) {
      doEval = 'internal';
      url = `node:${filename}`;
    } else if (options.eval) {
      if (typeof filename !== 'string') {
        throw new ERR_INVALID_ARG_VALUE('options.eval', options.eval, 'must be false when \'filename\' is not a string');
      }
      url = null;
      doEval = 'classic';
    } else if (isURL(filename) && filename.protocol === 'data:') {
      url = null;
      doEval = 'data-url';
      filename = `${filename}`;
    } else {
      doEval = false;
      if (isURL(filename)) {
        url = filename;
        filename = fileURLToPath(filename);
      } else if (typeof filename !== 'string') {
        throw new ERR_INVALID_ARG_TYPE('filename', ['string', 'URL'], filename);
      } else if (path.isAbsolute(filename) || RegExpPrototypeExec(/^\.\.?[\\/]/, filename) !== null) {
        filename = path.resolve(filename);
        url = pathToFileURL(filename);
      } else {
        throw new ERR_WORKER_PATH(filename);
      }
    }
    var env;
    if (typeof options.env === 'object' && options.env !== null) {
      env = {
        __proto__: null
      };
      ArrayPrototypeForEach(ObjectEntries(options.env), _ref => {
        var {
          0: key,
          1: value
        } = _ref;
        env[key] = `${value}`;
      });
    } else if (options.env == null) {
      env = process.env;
    } else if (options.env !== SHARE_ENV) {
      throw new ERR_INVALID_ARG_TYPE('options.env', ['object', 'undefined', 'null', 'worker_threads.SHARE_ENV'], options.env);
    }
    var name = 'WorkerThread';
    if (options.name) {
      validateString(options.name, 'options.name');
      name = StringPrototypeTrim(options.name);
    }
    debug('instantiating Worker.', `url: ${url}`, `doEval: ${doEval}`);
    // Set up the C++ handle for the worker, as well as some internal wiring.
    _this3[kHandle] = new WorkerImpl(url, env === process.env ? null : env, options.execArgv, parseResourceLimits(options.resourceLimits), !!(options.trackUnmanagedFds ?? true), isInternal, name);
    if (_this3[kHandle].invalidExecArgv) {
      throw new ERR_WORKER_INVALID_EXEC_ARGV(_this3[kHandle].invalidExecArgv);
    }
    if (_this3[kHandle].invalidNodeOptions) {
      throw new ERR_WORKER_INVALID_EXEC_ARGV(_this3[kHandle].invalidNodeOptions, 'invalid NODE_OPTIONS env variable');
    }
    _this3[kHandle].onexit = (code, customErr, customErrReason) => {
      _this3[kOnExit](code, customErr, customErrReason);
    };
    _this3[kPort] = _this3[kHandle].messagePort;
    _this3[kPort].on('message', data => _this3[kOnMessage](data));
    _this3[kPort].start();
    _this3[kPort].unref();
    _this3[kPort][kWaitingStreams] = 0;
    debug(`[${threadId}] created Worker with ID ${_this3.threadId}`);
    var stdin = null;
    if (options.stdin) stdin = new WritableWorkerStdio(_this3[kPort], 'stdin');
    var stdout = new ReadableWorkerStdio(_this3[kPort], 'stdout');
    if (!options.stdout) {
      stdout[kIncrementsPortRef] = false;
      pipeWithoutWarning(stdout, process.stdout);
    }
    var stderr = new ReadableWorkerStdio(_this3[kPort], 'stderr');
    if (!options.stderr) {
      stderr[kIncrementsPortRef] = false;
      pipeWithoutWarning(stderr, process.stderr);
    }
    _this3[kParentSideStdio] = {
      stdin,
      stdout,
      stderr
    };
    var mainThreadPortToWorker = createMainThreadPort(_this3.threadId);
    var {
      port1: publicPortToParent,
      port2: publicPortToWorker
    } = new MessageChannel();
    var transferList = [mainThreadPortToWorker, publicPortToWorker];
    // If transferList is provided.
    if (options.transferList) ArrayPrototypePush.apply(void 0, [transferList].concat(_toConsumableArray(new SafeArrayIterator(options.transferList))));
    _this3[kPublicPort] = publicPortToParent;
    ArrayPrototypeForEach(['message', 'messageerror'], event => {
      _this3[kPublicPort].on(event, message => {
        // Extract watch messages first if needed and relay events from worker thread to watcher
        if (event === 'message' && process.env.WATCH_REPORT_DEPENDENCIES && process.send) {
          var {
            isMainThread: _isMainThread
          } = internalBinding('worker');
          if (_isMainThread) {
            if (ArrayIsArray(message?.['watch:require'])) {
              process.send({
                'watch:require': message['watch:require']
              });
            }
            if (ArrayIsArray(message?.['watch:import'])) {
              process.send({
                'watch:import': message['watch:import']
              });
            }
          }
        }
        _this3.emit(event, message);
      });
    });
    setupPortReferencing(_this3[kPublicPort], _this3, 'message');
    _this3[kPort].postMessage({
      argv,
      type: messageTypes.LOAD_SCRIPT,
      filename,
      doEval,
      isInternal,
      cwdCounter: cwdCounter || workerIo.sharedCwdCounter,
      workerData: options.workerData,
      environmentData,
      hasStdin: !!options.stdin,
      publicPort: publicPortToWorker,
      mainThreadPort: mainThreadPortToWorker
    }, transferList);
    // Use this to cache the Worker's loopStart value once available.
    _this3[kLoopStartTime] = -1;
    _this3[kIsOnline] = false;
    _this3.performance = {
      eventLoopUtilization: FunctionPrototypeBind(eventLoopUtilization, _this3)
    };
    // Actually start the new thread now that everything is in place.
    _this3[kHandle].startThread();
    process.nextTick(() => process.emit('worker', _this3));
    if (workerThreadsChannel.hasSubscribers) {
      workerThreadsChannel.publish({
        worker: _this3
      });
    }
    return _this3;
  }
  _inherits(Worker, _EventEmitter);
  return _createClass(Worker, [{
    key: kOnExit,
    value: function (code, customErr, customErrReason) {
      debug(`[${threadId}] hears end event for Worker ${this.threadId}`);
      drainMessagePort(this[kPublicPort]);
      drainMessagePort(this[kPort]);
      destroyMainThreadPort(this.threadId);
      this.removeAllListeners('message');
      this.removeAllListeners('messageerrors');
      this[kPublicPort].unref();
      this[kPort].unref();
      this[kDispose]();
      if (customErr) {
        debug(`[${threadId}] failing with custom error ${customErr} \
        and with reason ${customErrReason}`);
        this.emit('error', new errorCodes[customErr](customErrReason));
      }
      this.emit('exit', code);
      this.removeAllListeners();
    }
  }, {
    key: kOnCouldNotSerializeErr,
    value: function () {
      this.emit('error', new ERR_WORKER_UNSERIALIZABLE_ERROR());
    }
  }, {
    key: kOnErrorMessage,
    value: function (serialized) {
      // This is what is called for uncaught exceptions.
      var error = deserializeError(serialized);
      this.emit('error', error);
    }
  }, {
    key: kOnMessage,
    value: function (message) {
      switch (message.type) {
        case messageTypes.UP_AND_RUNNING:
          this[kIsOnline] = true;
          return this.emit('online');
        case messageTypes.COULD_NOT_SERIALIZE_ERROR:
          return this[kOnCouldNotSerializeErr]();
        case messageTypes.ERROR_MESSAGE:
          return this[kOnErrorMessage](message.error);
        case messageTypes.STDIO_PAYLOAD:
          {
            var {
              stream,
              chunks
            } = message;
            var readable = this[kParentSideStdio][stream];
            // This is a hot path, use a for(;;) loop
            for (var i = 0; i < chunks.length; i++) {
              var {
                chunk,
                encoding
              } = chunks[i];
              readable.push(chunk, encoding);
            }
            return;
          }
        case messageTypes.STDIO_WANTS_MORE_DATA:
          {
            var {
              stream: _stream
            } = message;
            return this[kParentSideStdio][_stream][kStdioWantsMoreDataCallback]();
          }
      }
      assert.fail(`Unknown worker message type ${message.type}`);
    }
  }, {
    key: kDispose,
    value: function () {
      this[kHandle].onexit = null;
      this[kHandle] = null;
      this[kPort] = null;
      this[kPublicPort] = null;
      var {
        stdout,
        stderr
      } = this[kParentSideStdio];
      if (!stdout.readableEnded) {
        debug(`[${threadId}] explicitly closes stdout for ${this.threadId}`);
        stdout.push(null);
      }
      if (!stderr.readableEnded) {
        debug(`[${threadId}] explicitly closes stderr for ${this.threadId}`);
        stderr.push(null);
      }
    }
  }, {
    key: "postMessage",
    value: function postMessage() {
      if (this[kPublicPort] === null) return;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      ReflectApply(this[kPublicPort].postMessage, this[kPublicPort], args);
    }
  }, {
    key: "terminate",
    value: function terminate() {
      debug(`[${threadId}] terminates Worker with ID ${this.threadId}`);
      this.ref();
      if (this[kHandle] === null) return PromiseResolve();
      this[kHandle].stopThread();

      // Do not use events.once() here, because the 'exit' event will always be
      // emitted regardless of any errors, and the point is to only resolve
      // once the thread has actually stopped.
      var {
        promise,
        resolve
      } = PromiseWithResolvers();
      this.once('exit', resolve);
      return promise;
    }
  }, {
    key: SymbolAsyncDispose,
    value: _async(function () {
      var _this4 = this;
      return _awaitIgnored(_this4.terminate());
    })
  }, {
    key: "ref",
    value: function ref() {
      if (this[kHandle] === null) return;
      this[kHandle].ref();
      this[kPublicPort].ref();
    }
  }, {
    key: "unref",
    value: function unref() {
      if (this[kHandle] === null) return;
      this[kHandle].unref();
      this[kPublicPort].unref();
    }
  }, {
    key: "threadId",
    get: function () {
      if (this[kHandle] === null) return -1;
      return this[kHandle].threadId;
    }
  }, {
    key: "threadName",
    get: function () {
      if (this[kHandle] === null) return null;
      return this[kHandle].threadName;
    }
  }, {
    key: "stdin",
    get: function () {
      return this[kParentSideStdio].stdin;
    }
  }, {
    key: "stdout",
    get: function () {
      return this[kParentSideStdio].stdout;
    }
  }, {
    key: "stderr",
    get: function () {
      return this[kParentSideStdio].stderr;
    }
  }, {
    key: "resourceLimits",
    get: function () {
      if (this[kHandle] === null) return {};
      return makeResourceLimits(this[kHandle].getResourceLimits());
    }
  }, {
    key: "getHeapSnapshot",
    value: function getHeapSnapshot(options) {
      var {
        HeapSnapshotStream,
        getHeapSnapshotOptions
      } = require('internal/heap_utils');
      var optionsArray = getHeapSnapshotOptions(options);
      var heapSnapshotTaker = this[kHandle]?.takeHeapSnapshot(optionsArray);
      return new Promise((resolve, reject) => {
        if (!heapSnapshotTaker) return reject(new ERR_WORKER_NOT_RUNNING());
        heapSnapshotTaker.ondone = handle => {
          resolve(new HeapSnapshotStream(handle));
        };
      });
    }
  }, {
    key: "getHeapStatistics",
    value: function getHeapStatistics() {
      var taker = this[kHandle]?.getHeapStatistics();
      return new Promise((resolve, reject) => {
        if (!taker) return reject(new ERR_WORKER_NOT_RUNNING());
        taker.ondone = handle => {
          resolve(handle);
        };
      });
    }
  }, {
    key: "cpuUsage",
    value: function cpuUsage(prev) {
      if (prev) {
        validateObject(prev, 'prev');
        validateNumber(prev.user, 'prev.user', 0, NumberMAX_SAFE_INTEGER);
        validateNumber(prev.system, 'prev.system', 0, NumberMAX_SAFE_INTEGER);
      }
      if (process.platform === 'sunos') {
        throw new ERR_OPERATION_FAILED('worker.cpuUsage() is not available on SunOS');
      }
      var taker = this[kHandle]?.cpuUsage();
      return new Promise((resolve, reject) => {
        if (!taker) return reject(new ERR_WORKER_NOT_RUNNING());
        taker.ondone = (err, current) => {
          if (err !== null) {
            return reject(err);
          }
          if (prev) {
            resolve({
              user: current.user - prev.user,
              system: current.system - prev.system
            });
          } else {
            resolve({
              user: current.user,
              system: current.system
            });
          }
        };
      });
    }
  }, {
    key: "startCpuProfile",
    value: function startCpuProfile(options) {
      normalizeCpuProfileOptions ??= require('internal/v8/cpu_profiler').normalizeCpuProfileOptions;
      var {
        samplingIntervalMicros,
        maxSamples
      } = normalizeCpuProfileOptions(options);
      var startTaker = this[kHandle]?.startCpuProfile(samplingIntervalMicros, maxSamples);
      return new Promise((resolve, reject) => {
        if (!startTaker) return reject(new ERR_WORKER_NOT_RUNNING());
        startTaker.ondone = (err, id) => {
          if (err) {
            return reject(err);
          }
          resolve(new CPUProfileHandle(this, id));
        };
      });
    }

    /**
     * @param {object} [options]
     * @param {number} [options.sampleInterval]
     * @param {number} [options.stackDepth]
     * @param {boolean} [options.forceGC]
     * @param {boolean} [options.includeObjectsCollectedByMajorGC]
     * @param {boolean} [options.includeObjectsCollectedByMinorGC]
     * @returns {Promise}
     */
  }, {
    key: "startHeapProfile",
    value: function startHeapProfile(options) {
      normalizeHeapProfileOptions ??= require('internal/v8/heap_profile').normalizeHeapProfileOptions;
      var {
        sampleInterval,
        stackDepth,
        flags
      } = normalizeHeapProfileOptions(options);
      var startTaker = this[kHandle]?.startHeapProfile(sampleInterval, stackDepth, flags);
      return new Promise((resolve, reject) => {
        if (!startTaker) return reject(new ERR_WORKER_NOT_RUNNING());
        startTaker.ondone = err => {
          if (err) {
            return reject(err);
          }
          resolve(new HeapProfileHandle(this));
        };
      });
    }
  }]);
}(EventEmitter);
/**
 * A worker which has an internal module for entry point (e.g. internal/module/esm/worker).
 * Internal workers bypass the permission model.
 */
var InternalWorker = /*#__PURE__*/function (_Worker) {
  function InternalWorker(filename, options) {
    _classCallCheck(this, InternalWorker);
    return _callSuper(this, InternalWorker, [filename, options, kIsInternal]);
  }
  _inherits(InternalWorker, _Worker);
  return _createClass(InternalWorker, [{
    key: "receiveMessageSync",
    value: function receiveMessageSync() {
      return receiveMessageOnPort(this[kPublicPort]);
    }
  }]);
}(Worker);
function pipeWithoutWarning(source, dest) {
  var sourceMaxListeners = source._maxListeners;
  var destMaxListeners = dest._maxListeners;
  source.setMaxListeners(Infinity);
  dest.setMaxListeners(Infinity);
  source.pipe(dest);
  source._maxListeners = sourceMaxListeners;
  dest._maxListeners = destMaxListeners;
}
var resourceLimitsArray = new Float64Array(kTotalResourceLimitCount);
function parseResourceLimits(obj) {
  var ret = resourceLimitsArray;
  TypedArrayPrototypeFill(ret, -1);
  if (typeof obj !== 'object' || obj === null) return ret;
  if (typeof obj.maxOldGenerationSizeMb === 'number') ret[kMaxOldGenerationSizeMb] = MathMax(obj.maxOldGenerationSizeMb, 2);
  if (typeof obj.maxYoungGenerationSizeMb === 'number') ret[kMaxYoungGenerationSizeMb] = obj.maxYoungGenerationSizeMb;
  if (typeof obj.codeRangeSizeMb === 'number') ret[kCodeRangeSizeMb] = obj.codeRangeSizeMb;
  if (typeof obj.stackSizeMb === 'number') ret[kStackSizeMb] = obj.stackSizeMb;
  return ret;
}
function makeResourceLimits(float64arr) {
  return {
    maxYoungGenerationSizeMb: float64arr[kMaxYoungGenerationSizeMb],
    maxOldGenerationSizeMb: float64arr[kMaxOldGenerationSizeMb],
    codeRangeSizeMb: float64arr[kCodeRangeSizeMb],
    stackSizeMb: float64arr[kStackSizeMb]
  };
}
function eventLoopUtilization(util1, util2) {
  // TODO(trevnorris): Works to solve the thread-safe read/write issue of
  // loopTime, but has the drawback that it can't be set until the event loop
  // has had a chance to turn. So it will be impossible to read the ELU of
  // a worker thread immediately after it's been created.
  if (!this[kIsOnline] || !this[kHandle]) {
    return {
      idle: 0,
      active: 0,
      utilization: 0
    };
  }

  // Cache loopStart, since it's only written to once.
  if (this[kLoopStartTime] === -1) {
    this[kLoopStartTime] = this[kHandle].loopStartTime();
    if (this[kLoopStartTime] === -1) return {
      idle: 0,
      active: 0,
      utilization: 0
    };
  }
  return internalEventLoopUtilization(this[kLoopStartTime], this[kHandle].loopIdleTime(), util1, util2);
}
module.exports = {
  ownsProcessState,
  kIsOnline,
  isMainThread,
  isInternalThread,
  SHARE_ENV,
  resourceLimits: !isMainThread ? makeResourceLimits(resourceLimitsRaw) : {},
  setEnvironmentData,
  getEnvironmentData,
  assignEnvironmentData,
  threadId,
  threadName,
  InternalWorker,
  Worker
};

