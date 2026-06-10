/* eslint node-core/documented-errors: "error" */
/* eslint node-core/alphabetize-errors: ["error", {checkErrorDeclarations: true}] */
/* eslint node-core/prefer-util-format-errors: "error" */

'use strict';

// The whole point behind this internal module is to allow Node.js to no
// longer be forced to treat every error message change as a semver-major
// change. The NodeError classes here all expose a `code` property whose
// value statically and permanently identifies the error. While the error
// message may change, the code should not.
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
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
  AggregateError,
  ArrayIsArray,
  ArrayPrototypeFilter,
  ArrayPrototypeIncludes,
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  Error,
  ErrorCaptureStackTrace,
  ErrorPrototypeToString,
  JSONStringify,
  MapPrototypeGet,
  MathAbs,
  MathMax,
  Number: _Number,
  NumberIsInteger,
  ObjectAssign,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor,
  ObjectIsExtensible,
  ObjectKeys,
  ObjectPrototypeHasOwnProperty,
  RangeError,
  ReflectApply,
  RegExpPrototypeExec,
  SafeArrayIterator,
  SafeMap,
  SafeWeakMap,
  String: _String,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  StringPrototypeToLowerCase,
  Symbol: _Symbol,
  SymbolFor,
  SyntaxError,
  TypeError: _TypeError,
  URIError
} = primordials;
var kIsNodeError = _Symbol('kIsNodeError');
var isWindows = process.platform === 'win32';
var messages = new SafeMap();
var codes = {};
var classRegExp = /^[A-Z][a-zA-Z0-9]*$/;

// Sorted by a rough estimate on most frequently used entries.
var kTypes = ['string', 'function', 'number', 'object',
// Accept 'Function' and 'Object' as alternative to the lower cased version.
'Function', 'Object', 'boolean', 'bigint', 'symbol'];
var MainContextError = Error;
var overrideStackTrace = new SafeWeakMap();
var internalPrepareStackTrace = defaultPrepareStackTrace;

/**
 * The default implementation of `Error.prepareStackTrace` with simple
 * concatenation of stack frames.
 * Read more about `Error.prepareStackTrace` at https://v8.dev/docs/stack-trace-api#customizing-stack-traces.
 * @returns {string}
 */
function defaultPrepareStackTrace(error, trace) {
  // Normal error formatting:
  //
  // Error: Message
  //     at function (file)
  //     at file
  var errorString;
  if (kIsNodeError in error) {
    errorString = `${error.name} [${error.code}]: ${error.message}`;
  } else {
    errorString = ErrorPrototypeToString(error);
  }
  if (trace.length === 0) {
    return errorString;
  }
  return `${errorString}\n    at ${ArrayPrototypeJoin(trace, '\n    at ')}`;
}
function setInternalPrepareStackTrace(callback) {
  internalPrepareStackTrace = callback;
}
function isPermissionModelError(err) {
  return typeof err !== 'number' && err.code && err.code === 'ERR_ACCESS_DENIED';
}

/**
 * Every realm has its own prepareStackTraceCallback. When `error.stack` is
 * accessed, if the error is created in a shadow realm, the shadow realm's
 * prepareStackTraceCallback is invoked. Otherwise, the principal realm's
 * prepareStackTraceCallback is invoked. Note that accessing `error.stack`
 * of error objects created in a VM Context will always invoke the
 * prepareStackTraceCallback of the principal realm.
 * @param {object} globalThis The global object of the realm that the error was
 *   created in. When the error object is created in a VM Context, this is the
 *   global object of that VM Context.
 * @param {object} error The error object.
 * @param {CallSite[]} trace An array of CallSite objects, read more at https://v8.dev/docs/stack-trace-api#customizing-stack-traces.
 * @returns {string}
 */
function prepareStackTraceCallback(globalThis, error, trace) {
  // API for node internals to override error stack formatting
  // without interfering with userland code.
  if (overrideStackTrace.has(error)) {
    var f = overrideStackTrace.get(error);
    overrideStackTrace.delete(error);
    return f(error, trace);
  }

  // Polyfill of V8's Error.prepareStackTrace API.
  // https://crbug.com/v8/7848
  // `globalThis` is the global that contains the constructor which
  // created `error`.
  if (typeof globalThis.Error?.prepareStackTrace === 'function') {
    return globalThis.Error.prepareStackTrace(error, trace);
  }
  // We still have legacy usage that depends on the main context's `Error`
  // being used, even when the error is from a different context.
  // TODO(devsnek): evaluate if this can be eventually deprecated/removed.
  if (typeof MainContextError.prepareStackTrace === 'function') {
    return MainContextError.prepareStackTrace(error, trace);
  }

  // If the Error.prepareStackTrace was not a function, fallback to the
  // internal implementation.
  return internalPrepareStackTrace(error, trace);
}

/**
 * The default Error.prepareStackTrace implementation.
 * @returns {string}
 */
function ErrorPrepareStackTrace(error, trace) {
  return internalPrepareStackTrace(error, trace);
}
var aggregateTwoErrors = (innerError, outerError) => {
  if (innerError && outerError && innerError !== outerError) {
    if (ArrayIsArray(outerError.errors)) {
      // If `outerError` is already an `AggregateError`.
      ArrayPrototypePush(outerError.errors, innerError);
      return outerError;
    }
    var err;
    if (isErrorStackTraceLimitWritable()) {
      var limit = Error.stackTraceLimit;
      Error.stackTraceLimit = 0;
      // eslint-disable-next-line no-restricted-syntax
      err = new AggregateError(new SafeArrayIterator([outerError, innerError]), outerError.message);
      Error.stackTraceLimit = limit;
      ErrorCaptureStackTrace(err, aggregateTwoErrors);
    } else {
      // eslint-disable-next-line no-restricted-syntax
      err = new AggregateError(new SafeArrayIterator([outerError, innerError]), outerError.message);
    }
    err.code = outerError.code;
    return err;
  }
  return innerError || outerError;
};
var NodeAggregateError = /*#__PURE__*/function (_AggregateError) {
  function NodeAggregateError(errors, message) {
    var _this;
    _classCallCheck(this, NodeAggregateError);
    _this = _callSuper(this, NodeAggregateError, [new SafeArrayIterator(errors), message]);
    _this.code = errors[0]?.code;
    return _this;
  }
  _inherits(NodeAggregateError, _AggregateError);
  return _createClass(NodeAggregateError, [{
    key: kIsNodeError,
    get: function () {
      return true;
    }
  }, {
    key: 'constructor',
    get: function () {
      return AggregateError;
    }
  }]);
}(AggregateError);
var assert = require('internal/assert');

// Lazily loaded
var util;
var internalUtil = null;
function lazyInternalUtil() {
  internalUtil ??= require('internal/util');
  return internalUtil;
}
var internalUtilInspect = null;
function lazyInternalUtilInspect() {
  internalUtilInspect ??= require('internal/util/inspect');
  return internalUtilInspect;
}
var utilColors;
function lazyUtilColors() {
  utilColors ??= require('internal/util/colors');
  return utilColors;
}
var buffer;
function lazyBuffer() {
  buffer ??= require('buffer').Buffer;
  return buffer;
}
function isErrorStackTraceLimitWritable() {
  // Do no touch Error.stackTraceLimit as V8 would attempt to install
  // it again during deserialization.
  if (require('internal/v8/startup_snapshot').namespace.isBuildingSnapshot()) {
    return false;
  }
  var desc = ObjectGetOwnPropertyDescriptor(Error, 'stackTraceLimit');
  if (desc === undefined) {
    return ObjectIsExtensible(Error);
  }
  return ObjectPrototypeHasOwnProperty(desc, 'writable') ? desc.writable : desc.set !== undefined;
}
function inspectWithNoCustomRetry(obj, options) {
  var utilInspect = lazyInternalUtilInspect();
  try {
    return utilInspect.inspect(obj, options);
  } catch {
    return utilInspect.inspect(obj, _objectSpread(_objectSpread({}, options), {}, {
      customInspect: false
    }));
  }
}

// A specialized Error that includes an additional info property with
// additional information about the error condition.
// It has the properties present in a UVException but with a custom error
// message followed by the uv error code and uv error message.
// It also has its own error code with the original uv error context put into
// `err.info`.
// The context passed into this error must have .code, .syscall and .message,
// and may have .path and .dest.
var SystemError = /*#__PURE__*/function (_Error, _SymbolFor) {
  function SystemError(key, context) {
    var _this2;
    _classCallCheck(this, SystemError);
    _this2 = _callSuper(this, SystemError);
    var prefix = getMessage(key, [], _this2);
    var message = `${prefix}: ${context.syscall} returned ` + `${context.code} (${context.message})`;
    if (context.path !== undefined) message += ` ${context.path}`;
    if (context.dest !== undefined) message += ` => ${context.dest}`;
    _this2.code = key;
    ObjectDefineProperties(_this2, {
      [kIsNodeError]: {
        __proto__: null,
        value: true,
        enumerable: false,
        writable: false,
        configurable: true
      },
      name: {
        __proto__: null,
        value: 'SystemError',
        enumerable: false,
        writable: true,
        configurable: true
      },
      message: {
        __proto__: null,
        value: message,
        enumerable: false,
        writable: true,
        configurable: true
      },
      info: {
        __proto__: null,
        value: context,
        enumerable: true,
        configurable: true,
        writable: false
      },
      errno: {
        __proto__: null,
        get() {
          return context.errno;
        },
        set: value => {
          context.errno = value;
        },
        enumerable: true,
        configurable: true
      },
      syscall: {
        __proto__: null,
        get() {
          return context.syscall;
        },
        set: value => {
          context.syscall = value;
        },
        enumerable: true,
        configurable: true
      }
    });
    if (context.path !== undefined) {
      // TODO(BridgeAR): Investigate why and when the `.toString()` was
      // introduced. The `path` and `dest` properties in the context seem to
      // always be of type string. We should probably just remove the
      // `.toString()` and `Buffer.from()` operations and set the value on the
      // context as the user did.
      ObjectDefineProperty(_this2, 'path', {
        __proto__: null,
        get() {
          return context.path != null ? context.path.toString() : context.path;
        },
        set: value => {
          context.path = value ? lazyBuffer().from(value.toString()) : undefined;
        },
        enumerable: true,
        configurable: true
      });
    }
    if (context.dest !== undefined) {
      ObjectDefineProperty(_this2, 'dest', {
        __proto__: null,
        get() {
          return context.dest != null ? context.dest.toString() : context.dest;
        },
        set: value => {
          context.dest = value ? lazyBuffer().from(value.toString()) : undefined;
        },
        enumerable: true,
        configurable: true
      });
    }
    return _this2;
  }
  _inherits(SystemError, _Error);
  return _createClass(SystemError, [{
    key: "toString",
    value: function toString() {
      return `${this.name} [${this.code}]: ${this.message}`;
    }
  }, {
    key: _SymbolFor,
    value: function (recurseTimes, ctx) {
      return lazyInternalUtilInspect().inspect(this, _objectSpread(_objectSpread({}, ctx), {}, {
        getters: true,
        customInspect: false
      }));
    }
  }]);
}(Error, SymbolFor('nodejs.util.inspect.custom'));
function makeSystemErrorWithCode(key) {
  return /*#__PURE__*/function (_SystemError) {
    function NodeError(ctx) {
      _classCallCheck(this, NodeError);
      return _callSuper(this, NodeError, [key, ctx]);
    }
    _inherits(NodeError, _SystemError);
    return _createClass(NodeError);
  }(SystemError);
}

// This is a special error type that is only used for the E function.
var HideStackFramesError = /*#__PURE__*/function (_Error2) {
  function HideStackFramesError() {
    _classCallCheck(this, HideStackFramesError);
    return _callSuper(this, HideStackFramesError, arguments);
  }
  _inherits(HideStackFramesError, _Error2);
  return _createClass(HideStackFramesError);
}(Error);
function makeNodeErrorForHideStackFrame(Base, clazz) {
  var HideStackFramesError = /*#__PURE__*/function (_Base) {
    function HideStackFramesError() {
      var _this3;
      _classCallCheck(this, HideStackFramesError);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (isErrorStackTraceLimitWritable()) {
        var limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        _this3 = _callSuper(this, HideStackFramesError, [].concat(args));
        Error.stackTraceLimit = limit;
      } else {
        _this3 = _callSuper(this, HideStackFramesError, [].concat(args));
      }
      return _assertThisInitialized(_this3);
    }

    // This is a workaround for wpt tests that expect that the error
    // constructor has a `name` property of the base class.
    _inherits(HideStackFramesError, _Base);
    return _createClass(HideStackFramesError, [{
      key: 'constructor',
      get: function () {
        return clazz;
      }
    }]);
  }(Base);
  return HideStackFramesError;
}
function makeNodeErrorWithCode(Base, key) {
  var msg = messages.get(key);
  var expectedLength = typeof msg !== 'string' ? -1 : getExpectedArgumentLength(msg);
  switch (expectedLength) {
    case 0:
      {
        var NodeError = /*#__PURE__*/function (_Base2) {
          function NodeError() {
            var _this4;
            _classCallCheck(this, NodeError);
            assert(arguments.length === 0, `Code: ${key}; The provided arguments length (${arguments.length}) does not ` + `match the required ones (${expectedLength}).`);
            _this4 = _callSuper(this, NodeError, [msg]);
            _defineProperty(_this4, "code", key);
            return _this4;
          }

          // This is a workaround for wpt tests that expect that the error
          // constructor has a `name` property of the base class.
          _inherits(NodeError, _Base2);
          return _createClass(NodeError, [{
            key: 'constructor',
            get: function () {
              return Base;
            }
          }, {
            key: kIsNodeError,
            get: function () {
              return true;
            }
          }, {
            key: "toString",
            value: function toString() {
              return `${this.name} [${key}]: ${this.message}`;
            }
          }]);
        }(Base);
        return NodeError;
      }
    case -1:
      {
        var _NodeError2 = /*#__PURE__*/function (_Base3) {
          function _NodeError2() {
            var _this5;
            _classCallCheck(this, _NodeError2);
            _this5 = _callSuper(this, _NodeError2);
            _defineProperty(_this5, "code", key);
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }
            ObjectDefineProperty(_this5, 'message', {
              __proto__: null,
              value: getMessage(key, args, _this5),
              enumerable: false,
              writable: true,
              configurable: true
            });
            return _this5;
          }

          // This is a workaround for wpt tests that expect that the error
          // constructor has a `name` property of the base class.
          _inherits(_NodeError2, _Base3);
          return _createClass(_NodeError2, [{
            key: 'constructor',
            get: function () {
              return Base;
            }
          }, {
            key: kIsNodeError,
            get: function () {
              return true;
            }
          }, {
            key: "toString",
            value: function toString() {
              return `${this.name} [${key}]: ${this.message}`;
            }
          }]);
        }(Base);
        return _NodeError2;
      }
    default:
      {
        var _NodeError4 = /*#__PURE__*/function (_Base4) {
          function _NodeError4() {
            var _this6;
            _classCallCheck(this, _NodeError4);
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }
            assert(args.length === expectedLength, `Code: ${key}; The provided arguments length (${args.length}) does not ` + `match the required ones (${expectedLength}).`);
            ArrayPrototypeUnshift(args, msg);
            _this6 = _callSuper(this, _NodeError4, [ReflectApply(lazyInternalUtilInspect().format, null, args)]);
            _defineProperty(_this6, "code", key);
            return _this6;
          }

          // This is a workaround for wpt tests that expect that the error
          // constructor has a `name` property of the base class.
          _inherits(_NodeError4, _Base4);
          return _createClass(_NodeError4, [{
            key: 'constructor',
            get: function () {
              return Base;
            }
          }, {
            key: kIsNodeError,
            get: function () {
              return true;
            }
          }, {
            key: "toString",
            value: function toString() {
              return `${this.name} [${key}]: ${this.message}`;
            }
          }]);
        }(Base);
        return _NodeError4;
      }
  }
}

/**
 * This function removes unnecessary frames from Node.js core errors.
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} fn
 * @returns {T}
 */
function hideStackFrames(fn) {
  function wrappedFn() {
    try {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return ReflectApply(fn, this, args);
    } catch (error) {
      Error.stackTraceLimit && ErrorCaptureStackTrace(error, wrappedFn);
      throw error;
    }
  }
  wrappedFn.withoutStackTrace = fn;
  return wrappedFn;
}

// Utility function for registering the error codes. Only used here. Exported
// *only* to allow for testing.
function E(sym, val, def) {
  // Special case for SystemError that formats the error message differently
  // The SystemErrors only have SystemError as their base classes.
  messages.set(sym, val);
  var ErrClass = def === SystemError ? makeSystemErrorWithCode(sym) : makeNodeErrorWithCode(def, sym);
  for (var _len5 = arguments.length, otherClasses = new Array(_len5 > 3 ? _len5 - 3 : 0), _key5 = 3; _key5 < _len5; _key5++) {
    otherClasses[_key5 - 3] = arguments[_key5];
  }
  if (otherClasses.length !== 0) {
    if (otherClasses.includes(HideStackFramesError)) {
      if (otherClasses.length !== 1) {
        otherClasses.forEach(clazz => {
          if (clazz !== HideStackFramesError) {
            ErrClass[clazz.name] = makeNodeErrorWithCode(clazz, sym);
            ErrClass[clazz.name].HideStackFramesError = makeNodeErrorForHideStackFrame(ErrClass[clazz.name], clazz);
          }
        });
      }
    } else {
      otherClasses.forEach(clazz => {
        ErrClass[clazz.name] = makeNodeErrorWithCode(clazz, sym);
      });
    }
  }
  if (otherClasses.includes(HideStackFramesError)) {
    ErrClass.HideStackFramesError = makeNodeErrorForHideStackFrame(ErrClass, def);
  }
  codes[sym] = ErrClass;
}
function getExpectedArgumentLength(msg) {
  var expectedLength = 0;
  var regex = /%[dfijoOs]/g;
  while (RegExpPrototypeExec(regex, msg) !== null) expectedLength++;
  return expectedLength;
}
function getMessage(key, args, self) {
  var msg = messages.get(key);
  if (typeof msg === 'function') {
    assert(msg.length <= args.length,
    // Default options do not count.
    `Code: ${key}; The provided arguments length (${args.length}) does not ` + `match the required ones (${msg.length}).`);
    return ReflectApply(msg, self, args);
  }
  var expectedLength = getExpectedArgumentLength(msg);
  assert(expectedLength === args.length, `Code: ${key}; The provided arguments length (${args.length}) does not ` + `match the required ones (${expectedLength}).`);
  if (args.length === 0) return msg;
  ArrayPrototypeUnshift(args, msg);
  return ReflectApply(lazyInternalUtilInspect().format, null, args);
}
var uvBinding;
function lazyUv() {
  uvBinding ??= internalBinding('uv');
  return uvBinding;
}
var uvUnmappedError = ['UNKNOWN', 'unknown error'];
function uvErrmapGet(name) {
  uvBinding = lazyUv();
  uvBinding.errmap ??= uvBinding.getErrorMap();
  return MapPrototypeGet(uvBinding.errmap, name);
}

/**
 * This creates an error compatible with errors produced in the C++
 * function UVException using a context object with data assembled in C++.
 * The goal is to migrate them to ERR_* errors later when compatibility is
 * not a concern.
 */
var UVException = /*#__PURE__*/function (_Error3) {
  /**
   * @param {object} ctx
   */
  function UVException(ctx) {
    var _this7;
    _classCallCheck(this, UVException);
    var {
      0: code,
      1: uvmsg
    } = uvErrmapGet(ctx.errno) || uvUnmappedError;
    var message = `${code}: ${ctx.message || uvmsg}, ${ctx.syscall}`;
    var path;
    var dest;
    if (ctx.path) {
      path = ctx.path.toString();
      message += ` '${path}'`;
    }
    if (ctx.dest) {
      dest = ctx.dest.toString();
      message += ` -> '${dest}'`;
    }
    _this7 = _callSuper(this, UVException, [message]);
    for (var prop of ObjectKeys(ctx)) {
      if (prop === 'message' || prop === 'path' || prop === 'dest') {
        continue;
      }
      _this7[prop] = ctx[prop];
    }
    _this7.code = code;
    if (path) {
      _this7.path = path;
    }
    if (dest) {
      _this7.dest = dest;
    }
    return _this7;
  }
  _inherits(UVException, _Error3);
  return _createClass(UVException, [{
    key: 'constructor',
    get: function () {
      return Error;
    }
  }]);
}(Error);
/**
 * This creates an error compatible with errors produced in the C++
 * This function should replace the deprecated
 * `exceptionWithHostPort()` function.
 */
var UVExceptionWithHostPort = /*#__PURE__*/function (_Error4) {
  /**
   * @param {number} err - A libuv error number
   * @param {string} syscall
   * @param {string} address
   * @param {number} [port]
   */
  function UVExceptionWithHostPort(err, syscall, address, port) {
    var _this8;
    _classCallCheck(this, UVExceptionWithHostPort);
    var {
      0: code,
      1: uvmsg
    } = uvErrmapGet(err) || uvUnmappedError;
    var message = `${syscall} ${code}: ${uvmsg}`;
    var details = '';
    if (port && port > 0) {
      details = ` ${address}:${port}`;
    } else if (address) {
      details = ` ${address}`;
    }
    _this8 = _callSuper(this, UVExceptionWithHostPort, [`${message}${details}`]);
    _this8.code = code;
    _this8.errno = err;
    _this8.syscall = syscall;
    _this8.address = address;
    if (port) {
      _this8.port = port;
    }
    return _this8;
  }
  _inherits(UVExceptionWithHostPort, _Error4);
  return _createClass(UVExceptionWithHostPort, [{
    key: 'constructor',
    get: function () {
      return Error;
    }
  }]);
}(Error);
/**
 * This used to be util._errnoException().
 */
var ErrnoException = /*#__PURE__*/function (_Error5) {
  /**
   * @param {number} err - A libuv error number
   * @param {string} syscall
   * @param {string} [original] err
   */
  function ErrnoException(err, syscall, original) {
    var _this9;
    _classCallCheck(this, ErrnoException);
    // TODO(joyeecheung): We have to use the type-checked
    // getSystemErrorName(err) to guard against invalid arguments from users.
    // This can be replaced with [ code ] = errmap.get(err) when this method
    // is no longer exposed to user land.
    util ??= require('util');
    var code = util.getSystemErrorName(err);
    var message = original ? `${syscall} ${code} ${original}` : `${syscall} ${code}`;
    _this9 = _callSuper(this, ErrnoException, [message]);
    _this9.errno = err;
    _this9.code = code;
    _this9.syscall = syscall;
    return _this9;
  }
  _inherits(ErrnoException, _Error5);
  return _createClass(ErrnoException, [{
    key: 'constructor',
    get: function () {
      return Error;
    }
  }]);
}(Error);
/**
 * Deprecated, new Error is `UVExceptionWithHostPort()`
 * New function added the error description directly
 * from C++. this method for backwards compatibility
 * @param {number} err - A libuv error number
 * @param {string} syscall
 * @param {string} address
 * @param {number} [port]
 * @param {string} [additional]
 * @returns {Error}
 */
var ExceptionWithHostPort = /*#__PURE__*/function (_Error6) {
  function ExceptionWithHostPort(err, syscall, address, port, additional) {
    var _this0;
    _classCallCheck(this, ExceptionWithHostPort);
    // TODO(joyeecheung): We have to use the type-checked
    // getSystemErrorName(err) to guard against invalid arguments from users.
    // This can be replaced with [ code ] = errmap.get(err) when this method
    // is no longer exposed to user land.
    util ??= require('util');
    var code;
    var details = '';
    // True when permission model is enabled
    if (isPermissionModelError(err)) {
      code = err.code;
      details = ` ${err.message}`;
    } else {
      code = util.getSystemErrorName(err);
      if (port && port > 0) {
        details = ` ${address}:${port}`;
      } else if (address) {
        details = ` ${address}`;
      }
      if (additional) {
        details += ` - Local (${additional})`;
      }
    }
    _this0 = _callSuper(this, ExceptionWithHostPort, [`${syscall} ${code}${details}`]);
    _this0.errno = err;
    _this0.code = code;
    _this0.syscall = syscall;
    _this0.address = address;
    if (port) {
      _this0.port = port;
    }
    return _this0;
  }
  _inherits(ExceptionWithHostPort, _Error6);
  return _createClass(ExceptionWithHostPort, [{
    key: 'constructor',
    get: function () {
      return Error;
    }
  }]);
}(Error);
var DNSException = /*#__PURE__*/function (_Error7) {
  /**
   * @param {number|string} code - A libuv error number or a c-ares error code
   * @param {string} syscall
   * @param {string} [hostname]
   */
  function DNSException(code, syscall, hostname) {
    var _this1;
    _classCallCheck(this, DNSException);
    var errno;
    // If `code` is of type number, it is a libuv error number, else it is a
    // c-ares/permission model error code.
    // TODO(joyeecheung): translate c-ares error codes into numeric ones and
    // make them available in a property that's not error.errno (since they
    // can be in conflict with libuv error codes). Also make sure
    // util.getSystemErrorName() can understand them when an being informed that
    // the number is a c-ares error code.
    if (typeof code === 'number') {
      errno = code;
      // ENOTFOUND is not a proper POSIX error, but this error has been in place
      // long enough that it's not practical to remove it.
      if (code === lazyUv().UV_EAI_NODATA || code === lazyUv().UV_EAI_NONAME) {
        code = 'ENOTFOUND'; // Fabricated error name.
      } else {
        code = lazyInternalUtil().getSystemErrorName(code);
      }
    } else if (isPermissionModelError(code)) {
      // Expects a ERR_ACCESS_DENIED object
      code = code.code;
    }
    _this1 = _callSuper(this, DNSException, [`${syscall} ${code}${hostname ? ` ${hostname}` : ''}`]);
    _this1.errno = errno;
    _this1.code = code;
    _this1.syscall = syscall;
    if (hostname) {
      _this1.hostname = hostname;
    }
    return _this1;
  }
  _inherits(DNSException, _Error7);
  return _createClass(DNSException, [{
    key: 'constructor',
    get: function () {
      return Error;
    }
  }]);
}(Error);
var ConnResetException = /*#__PURE__*/function (_Error8) {
  function ConnResetException(msg) {
    var _this10;
    _classCallCheck(this, ConnResetException);
    _this10 = _callSuper(this, ConnResetException, [msg]);
    _this10.code = 'ECONNRESET';
    return _this10;
  }
  _inherits(ConnResetException, _Error8);
  return _createClass(ConnResetException, [{
    key: 'constructor',
    get: function () {
      return Error;
    }
  }]);
}(Error);
var maxStack_ErrorName;
var maxStack_ErrorMessage;

/**
 * Returns true if `err.name` and `err.message` are equal to engine-specific
 * values indicating max call stack size has been exceeded.
 * "Maximum call stack size exceeded" in V8.
 * @param {Error} err
 * @returns {boolean}
 */
function isStackOverflowError(err) {
  if (maxStack_ErrorMessage === undefined) {
    try {
      function overflowStack() {
        overflowStack();
      }
      overflowStack();
    } catch (err) {
      maxStack_ErrorMessage = err.message;
      maxStack_ErrorName = err.name;
    }
  }
  return err && err.name === maxStack_ErrorName && err.message === maxStack_ErrorMessage;
}

// Only use this for integers! Decimal numbers do not work with this function.
function addNumericalSeparator(val) {
  var res = '';
  var i = val.length;
  var start = val[0] === '-' ? 1 : 0;
  for (; i >= start + 4; i -= 3) {
    res = `_${StringPrototypeSlice(val, i - 3, i)}${res}`;
  }
  return `${StringPrototypeSlice(val, 0, i)}${res}`;
}

// Used to enhance the stack that will be picked up by the inspector
var kEnhanceStackBeforeInspector = _Symbol('kEnhanceStackBeforeInspector');

// These are supposed to be called only on fatal exceptions before
// the process exits.
var fatalExceptionStackEnhancers = {
  beforeInspector(error) {
    if (typeof error[kEnhanceStackBeforeInspector] !== 'function') {
      return error.stack;
    }
    try {
      // Set the error.stack here so it gets picked up by the
      // inspector.
      error.stack = error[kEnhanceStackBeforeInspector]();
    } catch {
      // We are just enhancing the error. If it fails, ignore it.
    }
    return error.stack;
  },
  afterInspector(error) {
    var originalStack = error.stack;
    var useColors = true;
    // Some consoles do not convert ANSI escape sequences to colors,
    // rather display them directly to the stdout. On those consoles,
    // libuv emulates colors by intercepting stdout stream and calling
    // corresponding Windows API functions for setting console colors.
    // However, fatal error are handled differently and we cannot easily
    // highlight them. On Windows, detecting whether a console supports
    // ANSI escape sequences is not reliable.
    if (isWindows) {
      var info = internalBinding('os').getOSInformation();
      var ver = ArrayPrototypeMap(StringPrototypeSplit(info[2], '.', 3), _Number);
      if (ver[0] !== 10 || ver[2] < 14393) {
        useColors = false;
      }
    }
    var {
      inspect,
      inspectDefaultOptions: {
        colors: defaultColors
      }
    } = lazyInternalUtilInspect();
    var colors = useColors && (lazyUtilColors().shouldColorize(process.stderr) || defaultColors);
    try {
      return inspect(error, {
        colors,
        customInspect: false,
        depth: MathMax(inspect.defaultOptions.depth, 5)
      });
    } catch {
      return originalStack;
    }
  }
};
var {
  privateSymbols: {
    arrow_message_private_symbol
  }
} = internalBinding('util');
// Ensures the printed error line is from user code.
function setArrowMessage(err, arrowMessage) {
  err[arrow_message_private_symbol] = arrowMessage;
}

// Hide stack lines before the first user code line.
function hideInternalStackFrames(error) {
  overrideStackTrace.set(error, (error, stackFrames) => {
    var frames = stackFrames;
    if (typeof stackFrames === 'object') {
      frames = ArrayPrototypeFilter(stackFrames, frm => !StringPrototypeStartsWith(frm.getFileName() || '', 'node:internal'));
    }
    ArrayPrototypeUnshift(frames, error);
    return ArrayPrototypeJoin(frames, '\n    at ');
  });
}

// Node uses an AbortError that isn't exactly the same as the DOMException
// to make usage of the error in userland and readable-stream easier.
// It is a regular error with `.code` and `.name`.
var AbortError = /*#__PURE__*/function (_Error9) {
  function AbortError() {
    var _this11;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'The operation was aborted';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    _classCallCheck(this, AbortError);
    if (options !== undefined && typeof options !== 'object') {
      throw new codes.ERR_INVALID_ARG_TYPE('options', 'Object', options);
    }
    _this11 = _callSuper(this, AbortError, [message, options]);
    _this11.code = 'ABORT_ERR';
    _this11.name = 'AbortError';
    return _this11;
  }
  _inherits(AbortError, _Error9);
  return _createClass(AbortError);
}(Error);
/**
 * This creates a generic Node.js error.
 * @param {string} message The error message.
 * @param {object} errorProperties Object with additional properties to be added to the error.
 * @returns {Error}
 */
var genericNodeError = hideStackFrames(function genericNodeError(message, errorProperties) {
  // eslint-disable-next-line no-restricted-syntax
  var err = new Error(message);
  ObjectAssign(err, errorProperties);
  return err;
});

/**
 * Determine the specific type of a value for type-mismatch errors.
 * @param {*} value
 * @returns {string}
 */
function determineSpecificType(value) {
  if (value === null) {
    return 'null';
  } else if (value === undefined) {
    return 'undefined';
  }
  var type = typeof value;
  switch (type) {
    case 'bigint':
      return `type bigint (${value}n)`;
    case 'number':
      if (value === 0) {
        return 1 / value === -Infinity ? 'type number (-0)' : 'type number (0)';
      } else if (value !== value) {
        // eslint-disable-line no-self-compare
        return 'type number (NaN)';
      } else if (value === Infinity) {
        return 'type number (Infinity)';
      } else if (value === -Infinity) {
        return 'type number (-Infinity)';
      }
      return `type number (${value})`;
    case 'boolean':
      return value ? 'type boolean (true)' : 'type boolean (false)';
    case 'symbol':
      return `type symbol (${_String(value)})`;
    case 'function':
      return `function ${value.name}`;
    case 'object':
      if (value.constructor && 'name' in value.constructor) {
        return `an instance of ${value.constructor.name}`;
      }
      return `${lazyInternalUtilInspect().inspect(value, {
        depth: -1
      })}`;
    case 'string':
      value.length > 28 && (value = `${StringPrototypeSlice(value, 0, 25)}...`);
      if (StringPrototypeIndexOf(value, "'") === -1) {
        return `type string ('${value}')`;
      }
      return `type string (${JSONStringify(value)})`;
    default:
      value = lazyInternalUtilInspect().inspect(value, {
        colors: false
      });
      if (value.length > 28) {
        value = `${StringPrototypeSlice(value, 0, 25)}...`;
      }
      return `type ${type} (${value})`;
  }
}

/**
 * Create a list string in the form like 'A and B' or 'A, B, ..., and Z'.
 * We cannot use Intl.ListFormat because it's not available in
 * --without-intl builds.
 * @param {string[]} array An array of strings.
 * @param {string} [type] The list type to be inserted before the last element.
 * @returns {string}
 */
function formatList(array) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'and';
  switch (array.length) {
    case 0:
      return '';
    case 1:
      return `${array[0]}`;
    case 2:
      return `${array[0]} ${type} ${array[1]}`;
    case 3:
      return `${array[0]}, ${array[1]}, ${type} ${array[2]}`;
    default:
      return `${ArrayPrototypeJoin(ArrayPrototypeSlice(array, 0, -1), ', ')}, ${type} ${array[array.length - 1]}`;
  }
}

module.exports = {
  AbortError,
  aggregateTwoErrors,
  NodeAggregateError,
  codes,
  ConnResetException,
  DNSException,
  // This is exported only to facilitate testing.
  determineSpecificType,
  E,
  ErrnoException,
  ExceptionWithHostPort,
  fatalExceptionStackEnhancers,
  formatList,
  genericNodeError,
  getMessage,
  hideInternalStackFrames,
  hideStackFrames,
  inspectWithNoCustomRetry,
  isErrorStackTraceLimitWritable,
  isStackOverflowError,
  kEnhanceStackBeforeInspector,
  kIsNodeError,
  defaultPrepareStackTrace,
  setInternalPrepareStackTrace,
  overrideStackTrace,
  prepareStackTraceCallback,
  ErrorPrepareStackTrace,
  setArrowMessage,
  SystemError,
  uvErrmapGet,
  UVException,
  UVExceptionWithHostPort
};

// To declare an error message, use the E(sym, val, def) function above. The sym
// must be an upper case string. The val can be either a function or a string.
// The def must be an error class.
// The return value of the function must be a string.
// Examples:
// E('EXAMPLE_KEY1', 'This is the error value', Error);
// E('EXAMPLE_KEY2', (a, b) => return `${a} ${b}`, RangeError);
//
// Once an error code has been assigned, the code itself MUST NOT change and
// any given error code must never be reused to identify a different error.
//
// Any error code added here should also be added to the documentation
//
// Note: Please try to keep these in alphabetical order
//
// Note: Node.js specific errors must begin with the prefix ERR_

E('ERR_ACCESS_DENIED', function (msg) {
  var permission = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var resource = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  this.permission = permission;
  this.resource = resource;
  return msg;
}, Error);
E('ERR_AMBIGUOUS_ARGUMENT', 'The "%s" argument is ambiguous. %s', _TypeError);
E('ERR_ARG_NOT_ITERABLE', '%s must be iterable', _TypeError);
E('ERR_ASSERTION', '%s', Error);
E('ERR_ASYNC_CALLBACK', '%s must be a function', _TypeError);
E('ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED', 'Async loader request never settled', Error);
E('ERR_ASYNC_TYPE', 'Invalid name for async "type": %s', _TypeError);
E('ERR_BROTLI_INVALID_PARAM', '%s is not a valid Brotli parameter', RangeError);
E('ERR_BUFFER_OUT_OF_BOUNDS',
// Using a default argument here is important so the argument is not counted
// towards `Function#length`.
function () {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
  if (name) {
    return `"${name}" is outside of buffer bounds`;
  }
  return 'Attempt to access memory outside buffer bounds';
}, RangeError);
E('ERR_BUFFER_TOO_LARGE', 'Cannot create a Buffer larger than %s bytes', RangeError);
E('ERR_CANNOT_WATCH_SIGINT', 'Cannot watch for SIGINT signals', Error);
E('ERR_CHILD_CLOSED_BEFORE_REPLY', 'Child closed before reply received', Error);
E('ERR_CHILD_PROCESS_IPC_REQUIRED', "Forked processes must have an IPC channel, missing value 'ipc' in %s", Error);
E('ERR_CHILD_PROCESS_STDIO_MAXBUFFER', '%s maxBuffer length exceeded', RangeError);
E('ERR_CONSOLE_WRITABLE_STREAM', 'Console expects a writable stream instance for %s', _TypeError);
E('ERR_CONSTRUCT_CALL_REQUIRED', 'Class constructor %s cannot be invoked without `new`', _TypeError);
E('ERR_CONTEXT_NOT_INITIALIZED', 'context used is not initialized', Error);
E('ERR_CRYPTO_ARGON2_NOT_SUPPORTED', 'Argon2 algorithm not supported', Error);
E('ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED', 'Custom engines not supported by this OpenSSL', Error);
E('ERR_CRYPTO_ECDH_INVALID_FORMAT', 'Invalid ECDH format: %s', _TypeError);
E('ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY', 'Public key is not valid for specified curve', Error);
E('ERR_CRYPTO_ENGINE_UNKNOWN', 'Engine "%s" was not found', Error);
E('ERR_CRYPTO_FIPS_FORCED', 'Cannot set FIPS mode, it was forced with --force-fips at startup.', Error);
E('ERR_CRYPTO_FIPS_UNAVAILABLE', 'Cannot set FIPS mode in a non-FIPS build.', Error);
E('ERR_CRYPTO_HASH_FINALIZED', 'Digest already called', Error);
E('ERR_CRYPTO_HASH_UPDATE_FAILED', 'Hash update failed', Error);
E('ERR_CRYPTO_INCOMPATIBLE_KEY', 'Incompatible %s: %s', Error);
E('ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS', 'The selected key encoding %s %s.', Error);
E('ERR_CRYPTO_INVALID_DIGEST', 'Invalid digest: %s', _TypeError);
E('ERR_CRYPTO_INVALID_JWK', 'Invalid JWK data', _TypeError);
E('ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE', 'Invalid key object type %s, expected %s.', _TypeError);
E('ERR_CRYPTO_INVALID_STATE', 'Invalid state for operation %s', Error);
E('ERR_CRYPTO_KEM_NOT_SUPPORTED', 'KEM is not supported', Error);
E('ERR_CRYPTO_PBKDF2_ERROR', 'PBKDF2 error', Error);
E('ERR_CRYPTO_SCRYPT_NOT_SUPPORTED', 'Scrypt algorithm not supported', Error);
// Switch to TypeError. The current implementation does not seem right.
E('ERR_CRYPTO_SIGN_KEY_REQUIRED', 'No key provided to sign', Error);
E('ERR_DEBUGGER_ERROR', '%s', Error);
E('ERR_DEBUGGER_STARTUP_ERROR', function (message) {
  var details = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (details !== undefined) {
    ObjectAssign(this, details);
  }
  return message;
}, Error);
E('ERR_DIR_CLOSED', 'Directory handle was closed', Error);
E('ERR_DIR_CONCURRENT_OPERATION', 'Cannot do synchronous work on directory handle with concurrent ' + 'asynchronous operations', Error);
E('ERR_DNS_SET_SERVERS_FAILED', 'c-ares failed to set servers: "%s" [%s]', Error);
E('ERR_DOMAIN_CALLBACK_NOT_AVAILABLE', 'A callback was registered through ' + 'process.setUncaughtExceptionCaptureCallback(), which is mutually ' + 'exclusive with using the `domain` module', Error);
E('ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE', 'The `domain` module is in use, which is mutually exclusive with calling ' + 'process.setUncaughtExceptionCaptureCallback()', Error);
E('ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION', 'Deserialize main function is already configured.', Error);
E('ERR_ENCODING_INVALID_ENCODED_DATA', function (encoding, ret) {
  this.errno = ret;
  return `The encoded data was not valid for encoding ${encoding}`;
}, _TypeError);
E('ERR_ENCODING_NOT_SUPPORTED', 'The "%s" encoding is not supported', RangeError);
E('ERR_EVAL_ESM_CANNOT_PRINT', '--print cannot be used with ESM input', Error);
E('ERR_EVENT_RECURSION', 'The event "%s" is already being dispatched', Error);
E('ERR_FALSY_VALUE_REJECTION', function (reason) {
  this.reason = reason;
  return 'Promise was rejected with falsy value';
}, Error, HideStackFramesError);
E('ERR_FEATURE_UNAVAILABLE_ON_PLATFORM', 'The feature %s is unavailable on the current platform' + ', which is being used to run Node.js', _TypeError);
E('ERR_FS_CP_DIR_TO_NON_DIR', 'Cannot overwrite non-directory with directory', SystemError);
E('ERR_FS_CP_EEXIST', 'Target already exists', SystemError);
E('ERR_FS_CP_EINVAL', 'Invalid src or dest', SystemError);
E('ERR_FS_CP_FIFO_PIPE', 'Cannot copy a FIFO pipe', SystemError);
E('ERR_FS_CP_NON_DIR_TO_DIR', 'Cannot overwrite directory with non-directory', SystemError);
E('ERR_FS_CP_SOCKET', 'Cannot copy a socket file', SystemError);
E('ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY', 'Cannot overwrite symlink in subdirectory of self', SystemError);
E('ERR_FS_CP_UNKNOWN', 'Cannot copy an unknown file type', SystemError);
E('ERR_FS_EISDIR', 'Path is a directory', SystemError, HideStackFramesError);
E('ERR_FS_FILE_TOO_LARGE', 'File size (%s) is greater than 2 GiB', RangeError);
E('ERR_FS_WATCH_QUEUE_OVERFLOW', 'fs.watch() queued more than %d events', Error);
E('ERR_HTTP2_ALTSVC_INVALID_ORIGIN', 'HTTP/2 ALTSVC frames require a valid origin', _TypeError);
E('ERR_HTTP2_ALTSVC_LENGTH', 'HTTP/2 ALTSVC frames are limited to 16382 bytes', _TypeError);
E('ERR_HTTP2_CONNECT_AUTHORITY', ':authority header is required for CONNECT requests', Error);
E('ERR_HTTP2_CONNECT_PATH', 'The :path header is forbidden for CONNECT requests', Error);
E('ERR_HTTP2_CONNECT_SCHEME', 'The :scheme header is forbidden for CONNECT requests', Error);
E('ERR_HTTP2_GOAWAY_SESSION', 'New streams cannot be created after receiving a GOAWAY', Error);
E('ERR_HTTP2_HEADERS_AFTER_RESPOND', 'Cannot specify additional headers after response initiated', Error);
E('ERR_HTTP2_HEADERS_SENT', 'Response has already been initiated.', Error);
E('ERR_HTTP2_HEADER_SINGLE_VALUE', 'Header field "%s" must only have a single value', _TypeError);
E('ERR_HTTP2_INFO_STATUS_NOT_ALLOWED', 'Informational status codes cannot be used', RangeError);
E('ERR_HTTP2_INVALID_CONNECTION_HEADERS', 'HTTP/1 Connection specific headers are forbidden: "%s"', _TypeError);
E('ERR_HTTP2_INVALID_HEADER_VALUE', 'Invalid value "%s" for header "%s"', _TypeError, HideStackFramesError);
E('ERR_HTTP2_INVALID_INFO_STATUS', 'Invalid informational status code: %s', RangeError);
E('ERR_HTTP2_INVALID_ORIGIN', 'HTTP/2 ORIGIN frames require a valid origin', _TypeError);
E('ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH', 'Packed settings length must be a multiple of six', RangeError);
E('ERR_HTTP2_INVALID_PSEUDOHEADER', '"%s" is an invalid pseudoheader or is used incorrectly', _TypeError, HideStackFramesError);
E('ERR_HTTP2_INVALID_SESSION', 'The session has been destroyed', Error);
E('ERR_HTTP2_INVALID_SETTING_VALUE',
// Using default arguments here is important so the arguments are not counted
// towards `Function#length`.
function (name, actual) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
  this.actual = actual;
  if (min !== undefined) {
    this.min = min;
    this.max = max;
  }
  return `Invalid value for setting "${name}": ${actual}`;
}, _TypeError, RangeError, HideStackFramesError);
E('ERR_HTTP2_INVALID_STREAM', 'The stream has been destroyed', Error);
E('ERR_HTTP2_MAX_PENDING_SETTINGS_ACK', 'Maximum number of pending settings acknowledgements', Error);
E('ERR_HTTP2_NESTED_PUSH', 'A push stream cannot initiate another push stream.', Error);
E('ERR_HTTP2_NO_MEM', 'Out of memory', Error);
E('ERR_HTTP2_NO_SOCKET_MANIPULATION', 'HTTP/2 sockets should not be directly manipulated (e.g. read and written)', Error);
E('ERR_HTTP2_ORIGIN_LENGTH', 'HTTP/2 ORIGIN frames are limited to 16382 bytes', _TypeError);
E('ERR_HTTP2_OUT_OF_STREAMS', 'No stream ID is available because maximum stream ID has been reached', Error);
E('ERR_HTTP2_PAYLOAD_FORBIDDEN', 'Responses with %s status must not have a payload', Error);
E('ERR_HTTP2_PING_CANCEL', 'HTTP2 ping cancelled', Error);
E('ERR_HTTP2_PING_LENGTH', 'HTTP2 ping payload must be 8 bytes', RangeError);
E('ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED', 'Cannot set HTTP/2 pseudo-headers', _TypeError, HideStackFramesError);
E('ERR_HTTP2_PUSH_DISABLED', 'HTTP/2 client has disabled push streams', Error);
E('ERR_HTTP2_SEND_FILE', 'Directories cannot be sent', Error);
E('ERR_HTTP2_SEND_FILE_NOSEEK', 'Offset or length can only be specified for regular files', Error);
E('ERR_HTTP2_SESSION_ERROR', 'Session closed with error code %s', Error);
E('ERR_HTTP2_SETTINGS_CANCEL', 'HTTP2 session settings canceled', Error);
E('ERR_HTTP2_SOCKET_BOUND', 'The socket is already bound to an Http2Session', Error);
E('ERR_HTTP2_SOCKET_UNBOUND', 'The socket has been disconnected from the Http2Session', Error);
E('ERR_HTTP2_STATUS_101', 'HTTP status code 101 (Switching Protocols) is forbidden in HTTP/2', Error);
E('ERR_HTTP2_STATUS_INVALID', 'Invalid status code: %s', RangeError);
E('ERR_HTTP2_STREAM_CANCEL', function (error) {
  var msg = 'The pending stream has been canceled';
  if (error) {
    this.cause = error;
    if (typeof error.message === 'string') msg += ` (caused by: ${error.message})`;
  }
  return msg;
}, Error);
E('ERR_HTTP2_STREAM_ERROR', 'Stream closed with error code %s', Error);
E('ERR_HTTP2_STREAM_SELF_DEPENDENCY', 'A stream cannot depend on itself', Error);
E('ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS', 'Number of custom settings exceeds MAX_ADDITIONAL_SETTINGS', Error);
E('ERR_HTTP2_TOO_MANY_INVALID_FRAMES', 'Too many invalid HTTP/2 frames', Error);
E('ERR_HTTP2_TRAILERS_ALREADY_SENT', 'Trailing headers have already been sent', Error);
E('ERR_HTTP2_TRAILERS_NOT_READY', 'Trailing headers cannot be sent until after the wantTrailers event is ' + 'emitted', Error);
E('ERR_HTTP2_UNSUPPORTED_PROTOCOL', 'protocol "%s" is unsupported.', Error);
E('ERR_HTTP_BODY_NOT_ALLOWED', 'Adding content for this request method or response status is not allowed.', Error);
E('ERR_HTTP_CONTENT_LENGTH_MISMATCH', 'Response body\'s content-length of %s byte(s) does not match the content-length of %s byte(s) set in header', Error);
E('ERR_HTTP_HEADERS_SENT', 'Cannot %s headers after they are sent to the client', Error);
E('ERR_HTTP_INVALID_HEADER_VALUE', 'Invalid value "%s" for header "%s"', _TypeError, HideStackFramesError);
E('ERR_HTTP_INVALID_STATUS_CODE', 'Invalid status code: %s', RangeError);
E('ERR_HTTP_REQUEST_TIMEOUT', 'Request timeout', Error);
E('ERR_HTTP_SOCKET_ASSIGNED', 'ServerResponse has an already assigned socket', Error);
E('ERR_HTTP_SOCKET_ENCODING', 'Changing the socket encoding is not allowed per RFC7230 Section 3.', Error);
E('ERR_HTTP_TRAILER_INVALID', 'Trailers are invalid with this transfer encoding', Error);
E('ERR_ILLEGAL_CONSTRUCTOR', 'Illegal constructor', _TypeError);
E('ERR_IMPORT_ATTRIBUTE_MISSING', 'Module "%s" needs an import attribute of "%s: %s"', _TypeError);
E('ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE', 'Module "%s" is not of type "%s"', _TypeError);
E('ERR_IMPORT_ATTRIBUTE_UNSUPPORTED', function error(attribute, value) {
  var url = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  if (url === undefined) {
    return `Import attribute "${attribute}" with value "${value}" is not supported`;
  }
  return `Import attribute "${attribute}" with value "${value}" is not supported in ${url}`;
}, _TypeError);
E('ERR_INCOMPATIBLE_OPTION_PAIR', 'Option "%s" cannot be used in combination with option "%s"', _TypeError, HideStackFramesError);
E('ERR_INPUT_TYPE_NOT_ALLOWED', '--input-type can only be used with string ' + 'input via --eval, --print, or STDIN', Error);
E('ERR_INSPECTOR_ALREADY_ACTIVATED', 'Inspector is already activated. Close it with inspector.close() ' + 'before activating it again.', Error);
E('ERR_INSPECTOR_ALREADY_CONNECTED', '%s is already connected', Error);
E('ERR_INSPECTOR_CLOSED', 'Session was closed', Error);
E('ERR_INSPECTOR_COMMAND', 'Inspector error %d: %s', Error);
E('ERR_INSPECTOR_NOT_ACTIVE', 'Inspector is not active', Error);
E('ERR_INSPECTOR_NOT_AVAILABLE', 'Inspector is not available', Error);
E('ERR_INSPECTOR_NOT_CONNECTED', 'Session is not connected', Error);
E('ERR_INSPECTOR_NOT_WORKER', 'Current thread is not a worker', Error);
E('ERR_INTERNAL_ASSERTION', message => {
  var suffix = 'This is caused by either a bug in Node.js ' + 'or incorrect usage of Node.js internals.\n' + 'Please open an issue with this stack trace at ' + 'https://github.com/nodejs/node/issues\n';
  return message === undefined ? suffix : `${message}\n${suffix}`;
}, Error);
E('ERR_INVALID_ADDRESS_FAMILY', function (addressType, host, port) {
  this.host = host;
  this.port = port;
  return `Invalid address family: ${addressType} ${host}:${port}`;
}, RangeError);
E('ERR_INVALID_ARG_TYPE', (name, expected, actual) => {
  assert(typeof name === 'string', "'name' must be a string");
  if (!ArrayIsArray(expected)) {
    expected = [expected];
  }
  var msg = 'The ';
  if (StringPrototypeEndsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg += `${name} `;
  } else {
    var type = StringPrototypeIncludes(name, '.') ? 'property' : 'argument';
    msg += `"${name}" ${type} `;
  }
  msg += 'must be ';
  var types = [];
  var instances = [];
  var other = [];
  for (var value of expected) {
    assert(typeof value === 'string', 'All expected entries have to be of type string');
    if (ArrayPrototypeIncludes(kTypes, value)) {
      ArrayPrototypePush(types, StringPrototypeToLowerCase(value));
    } else if (RegExpPrototypeExec(classRegExp, value) !== null) {
      ArrayPrototypePush(instances, value);
    } else {
      assert(value !== 'object', 'The value "object" should be written as "Object"');
      ArrayPrototypePush(other, value);
    }
  }

  // Special handle `object` in case other instances are allowed to outline
  // the differences between each other.
  if (instances.length > 0) {
    var pos = ArrayPrototypeIndexOf(types, 'object');
    if (pos !== -1) {
      ArrayPrototypeSplice(types, pos, 1);
      ArrayPrototypePush(instances, 'Object');
    }
  }
  if (types.length > 0) {
    msg += `${types.length > 1 ? 'one of type' : 'of type'} ${formatList(types, 'or')}`;
    if (instances.length > 0 || other.length > 0) msg += ' or ';
  }
  if (instances.length > 0) {
    msg += `an instance of ${formatList(instances, 'or')}`;
    if (other.length > 0) msg += ' or ';
  }
  if (other.length > 0) {
    if (other.length > 1) {
      msg += `one of ${formatList(other, 'or')}`;
    } else {
      if (StringPrototypeToLowerCase(other[0]) !== other[0]) msg += 'an ';
      msg += `${other[0]}`;
    }
  }
  msg += `. Received ${determineSpecificType(actual)}`;
  return msg;
}, _TypeError, HideStackFramesError);
E('ERR_INVALID_ARG_VALUE', function (name, value) {
  var reason = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'is invalid';
  var inspected = lazyInternalUtilInspect().inspect(value);
  if (inspected.length > 128) {
    inspected = `${StringPrototypeSlice(inspected, 0, 128)}...`;
  }
  var type = StringPrototypeIncludes(name, '.') ? 'property' : 'argument';
  return `The ${type} '${name}' ${reason}. Received ${inspected}`;
}, _TypeError, RangeError, HideStackFramesError);
E('ERR_INVALID_ASYNC_ID', 'Invalid %s value: %s', RangeError);
E('ERR_INVALID_BUFFER_SIZE', 'Buffer size must be a multiple of %s', RangeError);
E('ERR_INVALID_CHAR',
// Using a default argument here is important so the argument is not counted
// towards `Function#length`.
function (name) {
  var field = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  var msg = `Invalid character in ${name}`;
  if (field !== undefined) {
    msg += ` ["${field}"]`;
  }
  return msg;
}, _TypeError, HideStackFramesError);
E('ERR_INVALID_CURSOR_POS', 'Cannot set cursor row without setting its column', _TypeError);
E('ERR_INVALID_FD', '"fd" must be a positive integer: %s', RangeError);
E('ERR_INVALID_FD_TYPE', 'Unsupported fd type: %s', _TypeError);
E('ERR_INVALID_FILE_URL_HOST', 'File URL host must be "localhost" or empty on %s', _TypeError);
E('ERR_INVALID_FILE_URL_PATH', function (reason, input) {
  this.input = input;
  return `File URL path ${reason}`;
}, _TypeError);
E('ERR_INVALID_HANDLE_TYPE', 'This handle type cannot be sent', _TypeError);
E('ERR_INVALID_HTTP_TOKEN', '%s must be a valid HTTP token ["%s"]', _TypeError, HideStackFramesError);
E('ERR_INVALID_IP_ADDRESS', 'Invalid IP address: %s', _TypeError);
E('ERR_INVALID_MIME_SYNTAX', (production, str, invalidIndex) => {
  var msg = invalidIndex !== -1 ? ` at ${invalidIndex}` : '';
  return `The MIME syntax for a ${production} in "${str}" is invalid` + msg;
}, _TypeError);
E('ERR_INVALID_MODULE_SPECIFIER', function (request, reason) {
  var base = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  return `Invalid module "${request}" ${reason}${base ? ` imported from ${base}` : ''}`;
}, _TypeError);
E('ERR_INVALID_PACKAGE_CONFIG', (path, base, message) => {
  return `Invalid package config ${path}${base ? ` while importing ${base}` : ''}${message ? `. ${message}` : ''}`;
}, Error);
E('ERR_INVALID_PACKAGE_TARGET', function (pkgPath, key, target) {
  var isImport = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var base = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
  var relError = typeof target === 'string' && !isImport && target.length && !StringPrototypeStartsWith(target, './');
  if (key === '.') {
    assert(isImport === false);
    return `Invalid "exports" main target ${JSONStringify(target)} defined ` + `in the package config ${pkgPath}package.json${base ? ` imported from ${base}` : ''}${relError ? '; targets must start with "./"' : ''}`;
  }
  return `Invalid "${isImport ? 'imports' : 'exports'}" target ${JSONStringify(target)} defined for '${key}' in the package config ${pkgPath}package.json${base ? ` imported from ${base}` : ''}${relError ? '; targets must start with "./"' : ''}`;
}, Error);
E('ERR_INVALID_PROTOCOL', 'Protocol "%s" not supported. Expected "%s"', _TypeError);
E('ERR_INVALID_REPL_EVAL_CONFIG', 'Cannot specify both "breakEvalOnSigint" and "eval" for REPL', _TypeError);
E('ERR_INVALID_REPL_INPUT', '%s', _TypeError);
E('ERR_INVALID_RETURN_PROPERTY', (input, name, prop, value) => {
  return `Expected a valid ${input} to be returned for the "${prop}" from the` + ` "${name}" hook but got ${determineSpecificType(value)}.`;
}, _TypeError);
E('ERR_INVALID_RETURN_PROPERTY_VALUE', (input, name, prop, value) => {
  return `Expected ${input} to be returned for the "${prop}" from the` + ` "${name}" hook but got ${determineSpecificType(value)}.`;
}, _TypeError);
E('ERR_INVALID_RETURN_VALUE', (input, name, value) => {
  var type = determineSpecificType(value);
  return `Expected ${input} to be returned from the "${name}"` + ` function but got ${type}.`;
}, _TypeError, RangeError);
E('ERR_INVALID_STATE', 'Invalid state: %s', Error, _TypeError, RangeError);
E('ERR_INVALID_SYNC_FORK_INPUT', 'Asynchronous forks do not support ' + 'Buffer, TypedArray, DataView or string input: %s', _TypeError);
E('ERR_INVALID_THIS', 'Value of "this" must be of type %s', _TypeError, HideStackFramesError);
E('ERR_INVALID_TUPLE', '%s must be an iterable %s tuple', _TypeError);
E('ERR_INVALID_TYPESCRIPT_SYNTAX', '%s', SyntaxError);
E('ERR_INVALID_URI', 'URI malformed', URIError);
E('ERR_INVALID_URL', function (input) {
  var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  this.input = input;
  if (base != null) {
    this.base = base;
  }

  // Don't include URL in message.
  // (See https://github.com/nodejs/node/pull/38614)
  return 'Invalid URL';
}, _TypeError);
E('ERR_INVALID_URL_SCHEME', expected => {
  if (typeof expected === 'string') expected = [expected];
  assert(expected.length <= 2);
  var res = expected.length === 2 ? `one of scheme ${expected[0]} or ${expected[1]}` : `of scheme ${expected[0]}`;
  return `The URL must be ${res}`;
}, _TypeError);
E('ERR_IPC_CHANNEL_CLOSED', 'Channel closed', Error);
E('ERR_IPC_DISCONNECTED', 'IPC channel is already disconnected', Error);
E('ERR_IPC_ONE_PIPE', 'Child process can have only one IPC pipe', Error);
E('ERR_IPC_SYNC_FORK', 'IPC cannot be used with synchronous forks', Error);
E('ERR_IP_BLOCKED', function (ip) {
  return `IP(${ip}) is blocked by net.BlockList`;
}, Error);
E('ERR_LOADER_CHAIN_INCOMPLETE', '"%s" did not call the next hook in its chain and did not' + ' explicitly signal a short circuit. If this is intentional, include' + ' `shortCircuit: true` in the hook\'s return.', Error);
E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
E('ERR_MISSING_ARGS', function () {
  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }
  assert(args.length > 0, 'At least one arg needs to be specified');
  var msg = 'The ';
  var len = args.length;
  var wrap = a => `"${a}"`;
  args = ArrayPrototypeMap(args, a => ArrayIsArray(a) ? ArrayPrototypeJoin(ArrayPrototypeMap(a, wrap), ' or ') : wrap(a));
  msg += `${formatList(args)} argument${len > 1 ? 's' : ''}`;
  return `${msg} must be specified`;
}, _TypeError);
E('ERR_MISSING_OPTION', '%s is required', _TypeError);
E('ERR_MODULE_LINK_MISMATCH', '%s', _TypeError);
E('ERR_MODULE_NOT_FOUND', function (path, base, exactUrl) {
  if (exactUrl) {
    lazyInternalUtil().setOwnProperty(this, 'url', `${exactUrl}`);
  }
  return `Cannot find ${exactUrl ? 'module' : 'package'} '${path}' imported from ${base}`;
}, Error);
E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
E('ERR_NAPI_CONS_FUNCTION', 'Constructor must be a function', _TypeError);
E('ERR_NAPI_INVALID_DATAVIEW_ARGS', 'byte_offset + byte_length should be less than or equal to the size in ' + 'bytes of the array passed in', RangeError);
E('ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT', 'start offset of %s should be a multiple of %s', RangeError);
E('ERR_NAPI_INVALID_TYPEDARRAY_LENGTH', 'Invalid typed array length', RangeError);
E('ERR_NOT_BUILDING_SNAPSHOT', 'Operation cannot be invoked when not building startup snapshot', Error);
E('ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION', 'Operation cannot be invoked when not in a single-executable application', Error);
E('ERR_NOT_SUPPORTED_IN_SNAPSHOT', '%s is not supported in startup snapshot', Error);
E('ERR_NO_CRYPTO', 'Node.js is not compiled with OpenSSL crypto support', Error);
E('ERR_NO_ICU', '%s is not supported on Node.js compiled without ICU', _TypeError);
E('ERR_NO_TEMPORAL', 'Temporal is not supported in this environment', Error);
E('ERR_NO_TYPESCRIPT', 'Node.js is not compiled with TypeScript support', Error);
E('ERR_OPERATION_FAILED', 'Operation failed: %s', Error, _TypeError);
E('ERR_OUT_OF_RANGE', function (str, range, input) {
  var replaceDefaultBoolean = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  assert(range, 'Missing "range" argument');
  var msg = replaceDefaultBoolean ? str : `The value of "${str}" is out of range.`;
  var received;
  if (NumberIsInteger(input) && MathAbs(input) > 2 ** 32) {
    received = addNumericalSeparator(_String(input));
  } else if (typeof input === 'bigint') {
    received = _String(input);
    if (input > 2n ** 32n || input < -(2n ** 32n)) {
      received = addNumericalSeparator(received);
    }
    received += 'n';
  } else {
    received = lazyInternalUtilInspect().inspect(input);
  }
  msg += ` It must be ${range}. Received ${received}`;
  return msg;
}, RangeError, HideStackFramesError);
E('ERR_PACKAGE_IMPORT_NOT_DEFINED', (specifier, packagePath, base) => {
  return `Package import specifier "${specifier}" is not defined${packagePath ? ` in package ${packagePath}package.json` : ''} imported from ${base}`;
}, _TypeError);
E('ERR_PACKAGE_PATH_NOT_EXPORTED', function (pkgPath, subpath) {
  var base = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  if (subpath === '.') return `No "exports" main defined in ${pkgPath}package.json${base ? ` imported from ${base}` : ''}`;
  return `Package subpath '${subpath}' is not defined by "exports" in ${pkgPath}package.json${base ? ` imported from ${base}` : ''}`;
}, Error);
E('ERR_PARSE_ARGS_INVALID_OPTION_VALUE', '%s', _TypeError);
E('ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL', "Unexpected argument '%s'. This " + 'command does not take positional arguments', _TypeError);
E('ERR_PARSE_ARGS_UNKNOWN_OPTION', (option, allowPositionals) => {
  var suggestDashDash = allowPositionals ? '. To specify a positional ' + "argument starting with a '-', place it at the end of the command after " + `'--', as in '-- ${JSONStringify(option)}` : '';
  return `Unknown option '${option}'${suggestDashDash}`;
}, _TypeError);
E('ERR_PERFORMANCE_INVALID_TIMESTAMP', '%d is not a valid timestamp', _TypeError);
E('ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS', '%s', _TypeError);
E('ERR_PROXY_INVALID_CONFIG', '%s', Error);
E('ERR_PROXY_TUNNEL', '%s', Error);
E('ERR_QUIC_CONNECTION_FAILED', 'QUIC connection failed', Error);
E('ERR_QUIC_ENDPOINT_CLOSED', 'QUIC endpoint closed: %s (%d)', Error);
E('ERR_QUIC_OPEN_STREAM_FAILED', 'Failed to open QUIC stream', Error);
E('ERR_QUIC_STREAM_ABORTED', '%s', Error);
E('ERR_QUIC_STREAM_RESET', 'The QUIC stream was reset by the peer with error code %d', Error);
E('ERR_QUIC_VERSION_NEGOTIATION_ERROR', 'The QUIC session requires version negotiation', Error);
E('ERR_REQUIRE_ASYNC_MODULE', function (filename, parentFilename) {
  var message = 'require() cannot be used on an ESM ' + 'graph with top-level await. Use import() instead. To see where the' + ' top-level await comes from, use --experimental-print-required-tla.';
  if (parentFilename) {
    message += `\n  From ${parentFilename} `;
  }
  if (filename) {
    message += `\n  Requiring ${filename} `;
  }
  return message;
}, Error);
E('ERR_REQUIRE_CYCLE_MODULE', '%s', Error);
E('ERR_REQUIRE_ESM', function (filename, hasEsmSyntax) {
  var parentPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var packageJsonPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  hideInternalStackFrames(this);
  var msg = `require() of ES Module ${filename}${parentPath ? ` from ${parentPath}` : ''} not supported.`;
  if (!packageJsonPath) {
    if (StringPrototypeEndsWith(filename, '.mjs')) msg += `\nInstead change the require of ${filename} to a dynamic ` + 'import() which is available in all CommonJS modules.';
    return msg;
  }
  var path = require('path');
  var basename = parentPath && path.basename(filename) === path.basename(parentPath) ? filename : path.basename(filename);
  if (hasEsmSyntax) {
    msg += `\nInstead change the require of ${basename} in ${parentPath} to` + ' a dynamic import() which is available in all CommonJS modules.';
    return msg;
  }
  msg += `\n${basename} is treated as an ES module file as it is a .js ` + 'file whose nearest parent package.json contains "type": "module" ' + 'which declares all .js files in that package scope as ES modules.' + `\nInstead either rename ${basename} to end in .cjs, change the requiring ` + 'code to use dynamic import() which is available in all CommonJS ' + 'modules, or change "type": "module" to "type": "commonjs" in ' + `${packageJsonPath} to treat all .js files as CommonJS (using .mjs for ` + 'all ES modules instead).\n';
  return msg;
}, Error);
E('ERR_REQUIRE_ESM_RACE_CONDITION', (filename, parentFilename, isForAsyncLoaderHookWorker) => {
  var raceMessage = `Cannot require() ES Module ${filename} because it is not yet fully loaded.\n`;
  raceMessage += 'This may be caused by a race condition if the module is simultaneously dynamically ';
  raceMessage += 'import()-ed via Promise.all().\n';
  raceMessage += 'Try await-ing the import() sequentially in a loop instead.\n';
  raceMessage += ` (From ${parentFilename ? `${parentFilename} in ` : ' '}`;
  raceMessage += `${isForAsyncLoaderHookWorker ? 'loader hook worker thread' : 'non-loader-hook thread'})`;
  return raceMessage;
}, Error);
E('ERR_SCRIPT_EXECUTION_INTERRUPTED', 'Script execution was interrupted by `SIGINT`', Error);
E('ERR_SERVER_ALREADY_LISTEN', 'Listen method has been called more than once without closing.', Error);
E('ERR_SERVER_NOT_RUNNING', 'Server is not running.', Error);
E('ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND', 'Cannot find asset %s for the single executable application', Error);
E('ERR_SOCKET_ALREADY_BOUND', 'Socket is already bound', Error);
E('ERR_SOCKET_BAD_BUFFER_SIZE', 'Buffer size must be a positive integer', _TypeError);
E('ERR_SOCKET_BAD_PORT', function (name, port) {
  var allowZero = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  assert(typeof allowZero === 'boolean', "The 'allowZero' argument must be of type boolean.");
  var operator = allowZero ? '>=' : '>';
  return `${name} should be ${operator} 0 and < 65536. Received ${determineSpecificType(port)}.`;
}, RangeError, HideStackFramesError);
E('ERR_SOCKET_BAD_TYPE', 'Bad socket type specified. Valid types are: udp4, udp6', _TypeError);
E('ERR_SOCKET_BUFFER_SIZE', 'Could not get or set buffer size', SystemError);
E('ERR_SOCKET_CLOSED', 'Socket is closed', Error);
E('ERR_SOCKET_CLOSED_BEFORE_CONNECTION', 'Socket closed before the connection was established', Error);
E('ERR_SOCKET_CONNECTION_TIMEOUT', 'Socket connection timeout', Error);
E('ERR_SOCKET_DGRAM_IS_CONNECTED', 'Already connected', Error);
E('ERR_SOCKET_DGRAM_NOT_CONNECTED', 'Not connected', Error);
E('ERR_SOCKET_DGRAM_NOT_RUNNING', 'Not running', Error);
E('ERR_SOURCE_MAP_CORRUPT', `The source map for '%s' does not exist or is corrupt.`, Error);
E('ERR_SOURCE_MAP_MISSING_SOURCE', `Cannot find '%s' imported from the source map for '%s'`, Error);
E('ERR_SRI_PARSE', 'Subresource Integrity string %j had an unexpected %j at position %d', SyntaxError);
E('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
E('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
E('ERR_STREAM_ITER_MISSING_FLAG', 'The stream/iter API requires the --experimental-stream-iter flag', _TypeError);
E('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', _TypeError);
E('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
E('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
E('ERR_STREAM_UNABLE_TO_PIPE', 'Cannot pipe to a closed or destroyed stream', Error);
E('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
E('ERR_STREAM_WRAP', 'Stream has StringDecoder set or is in objectMode', Error);
E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
E('ERR_SYNTHETIC', 'JavaScript Callstack', Error);
E('ERR_SYSTEM_ERROR', 'A system error occurred', SystemError, HideStackFramesError);
E('ERR_TEST_FAILURE', function (error, failureType) {
  hideInternalStackFrames(this);
  assert(typeof failureType === 'string' || typeof failureType === 'symbol', "The 'failureType' argument must be of type string or symbol.");
  var msg = error?.message ?? error;
  if (typeof msg !== 'string') {
    msg = inspectWithNoCustomRetry(msg);
  }
  this.failureType = failureType;
  this.cause = error;
  return msg;
}, Error);
E('ERR_TLS_ALPN_CALLBACK_INVALID_RESULT', (value, protocols) => {
  return `ALPN callback returned a value (${value}) that did not match any of the client's offered protocols (${protocols.join(', ')})`;
}, _TypeError);
E('ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS', 'The ALPNCallback and ALPNProtocols TLS options are mutually exclusive', _TypeError);
E('ERR_TLS_CERT_ALTNAME_FORMAT', 'Invalid subject alternative name string', SyntaxError);
E('ERR_TLS_CERT_ALTNAME_INVALID', function (reason, host, cert) {
  this.reason = reason;
  this.host = host;
  this.cert = cert;
  return `Hostname/IP does not match certificate's altnames: ${reason}`;
}, Error);
E('ERR_TLS_DH_PARAM_SIZE', 'DH parameter size %s is less than 2048', Error);
E('ERR_TLS_HANDSHAKE_TIMEOUT', 'TLS handshake timeout', Error);
E('ERR_TLS_INVALID_CONTEXT', '%s must be a SecureContext', _TypeError);
E('ERR_TLS_INVALID_PROTOCOL_VERSION', '%j is not a valid %s TLS protocol version', _TypeError);
E('ERR_TLS_INVALID_STATE', 'TLS socket connection must be securely established', Error);
E('ERR_TLS_PROTOCOL_VERSION_CONFLICT', 'TLS protocol version %j conflicts with secureProtocol %j', _TypeError);
E('ERR_TLS_RENEGOTIATION_DISABLED', 'TLS session renegotiation disabled for this socket', Error);
E('ERR_TLS_RENEGOTIATION_UNSUPPORTED', 'TLS session renegotiation is unsupported by this TLS implementation', Error);

// This should probably be a `TypeError`.
E('ERR_TLS_REQUIRED_SERVER_NAME', '"servername" is required parameter for Server.addContext', Error);
E('ERR_TLS_SESSION_ATTACK', 'TLS session renegotiation attack detected', Error);
E('ERR_TLS_SNI_FROM_SERVER', 'Cannot issue SNI from a TLS server-side socket', Error);
E('ERR_TRACE_EVENTS_CATEGORY_REQUIRED', 'At least one category is required', _TypeError);
E('ERR_TRACE_EVENTS_UNAVAILABLE', 'Trace events are unavailable', Error);
E('ERR_TRAILING_JUNK_AFTER_STREAM_END', 'Trailing junk found after the end of the compressed stream', _TypeError);

// This should probably be a `RangeError`.
E('ERR_TTY_INIT_FAILED', 'TTY initialization failed', SystemError);
E('ERR_UNAVAILABLE_DURING_EXIT', 'Cannot call function in process exit ' + 'handler', Error);
E('ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET', '`process.setupUncaughtExceptionCapture()` was called while a capture ' + 'callback was already active', Error);
E('ERR_UNESCAPED_CHARACTERS', '%s contains unescaped characters', _TypeError);
E('ERR_UNHANDLED_ERROR',
// Using a default argument here is important so the argument is not counted
// towards `Function#length`.
function () {
  var err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
  var msg = 'Unhandled error.';
  if (err === undefined) return msg;
  return `${msg} (${err})`;
}, Error);
E('ERR_UNKNOWN_BUILTIN_MODULE', 'No such built-in module: %s', Error);
E('ERR_UNKNOWN_CREDENTIAL', '%s identifier does not exist: %s', Error);
E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', _TypeError);
E('ERR_UNKNOWN_FILE_EXTENSION', 'Unknown file extension "%s" for %s', _TypeError);
E('ERR_UNKNOWN_MODULE_FORMAT', 'Unknown module format: %s for URL %s', RangeError);
E('ERR_UNKNOWN_SIGNAL', 'Unknown signal: %s', _TypeError, HideStackFramesError);
E('ERR_UNSUPPORTED_DIR_IMPORT', function (path, base, exactUrl) {
  lazyInternalUtil().setOwnProperty(this, 'url', exactUrl);
  return `Directory import '${path}' is not supported ` + `resolving ES modules imported from ${base}`;
}, Error);
E('ERR_UNSUPPORTED_ESM_URL_SCHEME', (url, supported) => {
  var msg = `Only URLs with a scheme in: ${formatList(supported)} are supported by the default ESM loader`;
  if (isWindows && url.protocol.length === 2) {
    msg += '. On Windows, absolute paths must be valid file:// URLs';
  }
  msg += `. Received protocol '${url.protocol}'`;
  return msg;
}, Error);
E('ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING', 'Stripping types is currently unsupported for files under node_modules, for "%s"', Error);
E('ERR_UNSUPPORTED_RESOLVE_REQUEST', 'Failed to resolve module specifier "%s" from "%s": Invalid relative URL or base scheme is not hierarchical.', _TypeError);
E('ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX', '%s', SyntaxError);
E('ERR_USE_AFTER_CLOSE', '%s was closed', Error);

// This should probably be a `TypeError`.
E('ERR_VALID_PERFORMANCE_ENTRY_TYPE', 'At least one valid performance entry type is required', Error);
E('ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING', 'A dynamic import callback was not specified.', _TypeError);
E('ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG', 'A dynamic import callback was invoked without --experimental-vm-modules', _TypeError);
E('ERR_VM_MODULE_ALREADY_LINKED', 'Module has already been linked', Error);
E('ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA', 'Cached data cannot be created for a module which has been evaluated', Error);
E('ERR_VM_MODULE_DIFFERENT_CONTEXT', 'Linked modules must use the same context', Error);
E('ERR_VM_MODULE_LINK_FAILURE', function (message, cause) {
  this.cause = cause;
  return message;
}, Error);
E('ERR_VM_MODULE_NOT_MODULE', 'Provided module is not an instance of Module', Error);
E('ERR_VM_MODULE_STATUS', 'Module status %s', Error);
E('ERR_WASI_ALREADY_STARTED', 'WASI instance has already started', Error);
E('ERR_WEBASSEMBLY_NOT_SUPPORTED', 'WebAssembly is not supported in this environment, but is required for %s', Error);
E('ERR_WEBASSEMBLY_RESPONSE', 'WebAssembly response %s', _TypeError);
E('ERR_WORKER_INIT_FAILED', 'Worker initialization failure: %s', Error);
E('ERR_WORKER_INVALID_EXEC_ARGV', function (errors) {
  var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'invalid execArgv flags';
  return `Initiated Worker with ${msg}: ${ArrayPrototypeJoin(errors, ', ')}`;
}, Error);
E('ERR_WORKER_MESSAGING_ERRORED', 'The destination thread threw an error while processing the message', Error);
E('ERR_WORKER_MESSAGING_FAILED', 'Cannot find the destination thread or listener', Error);
E('ERR_WORKER_MESSAGING_SAME_THREAD', 'Cannot sent a message to the same thread', Error);
E('ERR_WORKER_MESSAGING_TIMEOUT', 'Sending a message to another thread timed out', Error);
E('ERR_WORKER_NOT_RUNNING', 'Worker instance not running', Error);
E('ERR_WORKER_OUT_OF_MEMORY', 'Worker terminated due to reaching memory limit: %s', Error);
E('ERR_WORKER_PATH', filename => 'The worker script or module filename must be an absolute path or a ' + 'relative path starting with \'./\' or \'../\'.' + (StringPrototypeStartsWith(filename, 'file://') ? ' Wrap file:// URLs with `new URL`.' : '') + (StringPrototypeStartsWith(filename, 'data:text/javascript') ? ' Wrap data: URLs with `new URL`.' : '') + ` Received "${filename}"`, _TypeError);
E('ERR_WORKER_UNSERIALIZABLE_ERROR', 'Serializing an uncaught exception failed', Error);
E('ERR_WORKER_UNSUPPORTED_OPERATION', '%s is not supported in workers', _TypeError);
E('ERR_ZSTD_INVALID_PARAM', '%s is not a valid zstd parameter', RangeError);

