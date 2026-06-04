'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypeForEach,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  FunctionPrototypeBind,
  ObjectEntries,
  String: _String,
  Symbol: _Symbol
} = primordials;
var {
  ERR_INVALID_ARG_VALUE,
  ERR_WASI_ALREADY_STARTED
} = require('internal/errors').codes;
var {
  emitExperimentalWarning,
  kEmptyObject
} = require('internal/util');
var {
  validateArray,
  validateBoolean,
  validateFunction,
  validateInt32,
  validateObject,
  validateString,
  validateUndefined
} = require('internal/validators');
var kExitCode = _Symbol('kExitCode');
var kSetMemory = _Symbol('kSetMemory');
var kStarted = _Symbol('kStarted');
var kInstance = _Symbol('kInstance');
var kBindingName = _Symbol('kBindingName');
emitExperimentalWarning('WASI');
var WASI = /*#__PURE__*/function () {
  function WASI() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
    _classCallCheck(this, WASI);
    validateObject(options, 'options');
    var _WASI;
    validateString(options.version, 'options.version');
    switch (options.version) {
      case 'unstable':
        ({
          WASI: _WASI
        } = internalBinding('wasi'));
        this[kBindingName] = 'wasi_unstable';
        break;
      case 'preview1':
        ({
          WASI: _WASI
        } = internalBinding('wasi'));
        this[kBindingName] = 'wasi_snapshot_preview1';
        break;
      // When adding support for additional wasi versions add case here
      default:
        throw new ERR_INVALID_ARG_VALUE('options.version', options.version, 'unsupported WASI version');
    }
    if (options.args !== undefined) validateArray(options.args, 'options.args');
    var args = ArrayPrototypeMap(options.args || [], _String);
    var env = [];
    if (options.env !== undefined) {
      validateObject(options.env, 'options.env');
      ArrayPrototypeForEach(ObjectEntries(options.env), _ref => {
        var {
          0: key,
          1: value
        } = _ref;
        if (value !== undefined) ArrayPrototypePush(env, `${key}=${value}`);
      });
    }
    var preopens = [];
    if (options.preopens !== undefined) {
      validateObject(options.preopens, 'options.preopens');
      ArrayPrototypeForEach(ObjectEntries(options.preopens), _ref2 => {
        var {
          0: key,
          1: value
        } = _ref2;
        return ArrayPrototypePush(preopens, _String(key), _String(value));
      });
    }
    var {
      stdin = 0,
      stdout = 1,
      stderr = 2
    } = options;
    validateInt32(stdin, 'options.stdin', 0);
    validateInt32(stdout, 'options.stdout', 0);
    validateInt32(stderr, 'options.stderr', 0);
    var stdio = [stdin, stdout, stderr];
    var wrap = new _WASI(args, env, preopens, stdio);
    for (var prop in wrap) {
      wrap[prop] = FunctionPrototypeBind(wrap[prop], wrap);
    }
    var returnOnExit = true;
    if (options.returnOnExit !== undefined) {
      validateBoolean(options.returnOnExit, 'options.returnOnExit');
      returnOnExit = options.returnOnExit;
    }
    if (returnOnExit) wrap.proc_exit = FunctionPrototypeBind(wasiReturnOnProcExit, this);
    this[kSetMemory] = wrap._setMemory;
    delete wrap._setMemory;
    this.wasiImport = wrap;
    this[kStarted] = false;
    this[kExitCode] = 0;
    this[kInstance] = undefined;
  }
  return _createClass(WASI, [{
    key: "finalizeBindings",
    value: function finalizeBindings(instance) {
      var {
        memory = instance?.exports?.memory
      } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (this[kStarted]) {
        throw new ERR_WASI_ALREADY_STARTED();
      }
      validateObject(instance, 'instance');
      validateObject(instance.exports, 'instance.exports');
      this[kSetMemory](memory);
      this[kInstance] = instance;
      this[kStarted] = true;
    }

    // Must not export _initialize, must export _start
  }, {
    key: "start",
    value: function start(instance) {
      this.finalizeBindings(instance);
      var {
        _start,
        _initialize
      } = this[kInstance].exports;
      validateFunction(_start, 'instance.exports._start');
      validateUndefined(_initialize, 'instance.exports._initialize');
      try {
        _start();
      } catch (err) {
        if (err !== kExitCode) {
          throw err;
        }
      }
      return this[kExitCode];
    }

    // Must not export _start, may optionally export _initialize
  }, {
    key: "initialize",
    value: function initialize(instance) {
      this.finalizeBindings(instance);
      var {
        _start,
        _initialize
      } = this[kInstance].exports;
      validateUndefined(_start, 'instance.exports._start');
      if (_initialize !== undefined) {
        validateFunction(_initialize, 'instance.exports._initialize');
        _initialize();
      }
    }
  }, {
    key: "getImportObject",
    value: function getImportObject() {
      return {
        [this[kBindingName]]: this.wasiImport
      };
    }
  }]);
}();
module.exports = {
  WASI
};
function wasiReturnOnProcExit(rval) {
  // If __wasi_proc_exit() does not terminate the process, an assertion is
  // triggered in the wasm runtime. Node can sidestep the assertion and return
  // an exit code by recording the exit code, and throwing a JavaScript
  // exception that WebAssembly cannot catch.
  this[kExitCode] = rval;
  throw kExitCode;
}

