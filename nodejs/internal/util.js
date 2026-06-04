'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayFrom,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSort,
  Error,
  ErrorCaptureStackTrace,
  FunctionPrototypeCall,
  FunctionPrototypeSymbolHasInstance,
  NumberParseInt,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectFreeze,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetOwnPropertyDescriptors,
  ObjectGetPrototypeOf,
  ObjectKeys,
  ObjectSetPrototypeOf,
  ObjectValues,
  Promise,
  ReflectApply,
  ReflectConstruct,
  RegExpPrototypeExec,
  RegExpPrototypeGetDotAll,
  RegExpPrototypeGetGlobal,
  RegExpPrototypeGetHasIndices,
  RegExpPrototypeGetIgnoreCase,
  RegExpPrototypeGetMultiline,
  RegExpPrototypeGetSource,
  RegExpPrototypeGetSticky,
  RegExpPrototypeGetUnicode,
  SafeMap,
  SafeSet,
  SafeWeakMap,
  SafeWeakRef,
  StringPrototypeIncludes,
  StringPrototypeReplace,
  StringPrototypeSlice,
  StringPrototypeToLowerCase,
  StringPrototypeToUpperCase,
  Symbol: _Symbol,
  SymbolFor,
  SymbolPrototypeGetDescription,
  SymbolReplace,
  SymbolSplit,
  globalThis
} = primordials;
var {
  codes: {
    ERR_NO_CRYPTO,
    ERR_NO_TYPESCRIPT,
    ERR_UNKNOWN_SIGNAL,
    ERR_WEBASSEMBLY_NOT_SUPPORTED
  },
  isErrorStackTraceLimitWritable,
  overrideStackTrace,
  uvErrmapGet
} = require('internal/errors');
var {
  signals
} = internalBinding('constants').os;
var {
  constructSharedArrayBuffer,
  guessHandleType: _guessHandleType,
  defineLazyProperties,
  privateSymbols: {
    arrow_message_private_symbol,
    decorated_private_symbol
  },
  sleep: _sleep
} = internalBinding('util');
var {
  isNativeError,
  isPromise
} = internalBinding('types');
var {
  getOptionValue
} = require('internal/options');
var assert = require('internal/assert');
var {
  encodings
} = internalBinding('string_decoder');
var noCrypto = !process.versions.openssl;
var noTypeScript = !process.versions.amaro;
var isWindows = process.platform === 'win32';
var isMacOS = process.platform === 'darwin';
var experimentalWarnings = new SafeSet();
var colorRegExp = /\u001b\[\d\d?m/g; // eslint-disable-line no-control-regex

var uvBinding;
function lazyUv() {
  uvBinding ??= internalBinding('uv');
  return uvBinding;
}
function removeColors(str) {
  return StringPrototypeReplace(str, colorRegExp, '');
}
function isError(e) {
  // An error could be an instance of Error while not being a native error
  // or could be from a different realm and not be instance of Error but still
  // be a native error.
  return isNativeError(e) || FunctionPrototypeSymbolHasInstance(Error, e);
}

// Keep a list of deprecation codes that have been warned on so we only warn on
// each one once.
var codesWarned = new SafeSet();
var validateString;
var validateOneOf;
function getDeprecationWarningEmitter(code, msg, deprecated, useEmitSync) {
  var shouldEmitWarning = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : () => true;
  var warned = false;
  return function (arg) {
    if (!warned && shouldEmitWarning(arg)) {
      warned = true;
      if (code === 'ExperimentalWarning') {
        process.emitWarning(msg, code, deprecated);
      } else if (code !== undefined) {
        if (!codesWarned.has(code)) {
          var emitWarning = useEmitSync ? require('internal/process/warning').emitWarningSync : process.emitWarning;
          emitWarning(msg, 'DeprecationWarning', code, deprecated);
          codesWarned.add(code);
        }
      } else {
        process.emitWarning(msg, 'DeprecationWarning', deprecated);
      }
    }
  };
}
function isPendingDeprecation() {
  return getOptionValue('--pending-deprecation') && !getOptionValue('--no-deprecation');
}
function deprecateProperty(key, msg, code, isPendingDeprecation) {
  var emitDeprecationWarning = getDeprecationWarningEmitter(code, msg, undefined, false, isPendingDeprecation);
  return options => {
    if (key in options) {
      emitDeprecationWarning();
    }
  };
}

// Internal deprecator for pending --pending-deprecation. This can be invoked
// at snapshot building time as the warning permission is only queried at
// run time.
function pendingDeprecate(fn, msg, code) {
  var emitDeprecationWarning = getDeprecationWarningEmitter(code, msg, deprecated, false, isPendingDeprecation);
  function deprecated() {
    emitDeprecationWarning();
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return ReflectApply(fn, this, args);
  }
  ObjectDefineProperty(deprecated, 'length', _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(fn, 'length')));
  return deprecated;
}

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
function deprecate(fn, msg, code, useEmitSync) {
  var modifyPrototype = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  // Lazy-load to avoid a circular dependency.
  if (validateString === undefined) ({
    validateString
  } = require('internal/validators'));
  if (code !== undefined) validateString(code, 'code');
  var emitDeprecationWarning = getDeprecationWarningEmitter(code, msg, deprecated, useEmitSync);
  function deprecated() {
    if (!process.noDeprecation) {
      emitDeprecationWarning();
    }
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    if (new.target) {
      return ReflectConstruct(fn, args, new.target);
    }
    return ReflectApply(fn, this, args);
  }
  if (modifyPrototype) {
    // The wrapper will keep the same prototype as fn to maintain prototype chain
    // Modifying the prototype does alter the object chains, and as observed in
    // most cases, it slows the code.
    ObjectSetPrototypeOf(deprecated, fn);
    if (fn.prototype) {
      // Setting this (rather than using Object.setPrototype, as above) ensures
      // that calling the unwrapped constructor gives an instanceof the wrapped
      // constructor.
      deprecated.prototype = fn.prototype;
    }
    ObjectDefineProperty(deprecated, 'length', _objectSpread({
      __proto__: null
    }, ObjectGetOwnPropertyDescriptor(fn, 'length')));
  }
  return deprecated;
}
function deprecateInstantiation(target, code) {
  assert(typeof code === 'string');
  getDeprecationWarningEmitter(code, `Instantiating ${target.name} without the 'new' keyword has been deprecated.`, target)();
  for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    args[_key3 - 2] = arguments[_key3];
  }
  return ReflectConstruct(target, args);
}
function decorateErrorStack(err) {
  if (!(isError(err) && err.stack) || err[decorated_private_symbol]) return;
  var arrow = err[arrow_message_private_symbol];
  if (arrow) {
    err.stack = arrow + err.stack;
    err[decorated_private_symbol] = true;
  }
}
function assertCrypto() {
  if (noCrypto) throw new ERR_NO_CRYPTO();
}
function assertTypeScript() {
  if (noTypeScript) throw new ERR_NO_TYPESCRIPT();
  if (globalThis.WebAssembly === undefined) throw new ERR_WEBASSEMBLY_NOT_SUPPORTED('TypeScript');
}

/**
 * Move the "slow cases" to a separate function to make sure this function gets
 * inlined properly. That prioritizes the common case.
 * @param {unknown} enc
 * @returns {string | undefined} Returns undefined if there is no match.
 */
function normalizeEncoding(enc) {
  if (enc == null || enc === 'utf8' || enc === 'utf-8') return 'utf8';
  return slowCases(enc);
}
function slowCases(enc) {
  switch (enc.length) {
    case 4:
      if (enc === 'UTF8') return 'utf8';
      if (enc === 'ucs2' || enc === 'UCS2') return 'utf16le';
      enc = StringPrototypeToLowerCase(enc);
      if (enc === 'utf8') return 'utf8';
      if (enc === 'ucs2') return 'utf16le';
      break;
    case 3:
      if (enc === 'hex' || enc === 'HEX' || StringPrototypeToLowerCase(enc) === 'hex') return 'hex';
      break;
    case 5:
      if (enc === 'ascii') return 'ascii';
      if (enc === 'ucs-2') return 'utf16le';
      if (enc === 'UTF-8') return 'utf8';
      if (enc === 'ASCII') return 'ascii';
      if (enc === 'UCS-2') return 'utf16le';
      enc = StringPrototypeToLowerCase(enc);
      if (enc === 'utf-8') return 'utf8';
      if (enc === 'ascii') return 'ascii';
      if (enc === 'ucs-2') return 'utf16le';
      break;
    case 6:
      if (enc === 'base64') return 'base64';
      if (enc === 'latin1' || enc === 'binary') return 'latin1';
      if (enc === 'BASE64') return 'base64';
      if (enc === 'LATIN1' || enc === 'BINARY') return 'latin1';
      enc = StringPrototypeToLowerCase(enc);
      if (enc === 'base64') return 'base64';
      if (enc === 'latin1' || enc === 'binary') return 'latin1';
      break;
    case 7:
      if (enc === 'utf16le' || enc === 'UTF16LE' || StringPrototypeToLowerCase(enc) === 'utf16le') return 'utf16le';
      break;
    case 8:
      if (enc === 'utf-16le' || enc === 'UTF-16LE' || StringPrototypeToLowerCase(enc) === 'utf-16le') return 'utf16le';
      break;
    case 9:
      if (enc === 'base64url' || enc === 'BASE64URL' || StringPrototypeToLowerCase(enc) === 'base64url') return 'base64url';
      break;
    default:
      if (enc === '') return 'utf8';
  }
}

/**
 * @param {string} feature Feature name used in the warning message
 * @param {string} messagePrefix Prefix of the warning message
 * @param {string} code See documentation of process.emitWarning
 * @param {string} ctor See documentation of process.emitWarning
 */
function emitExperimentalWarning(feature, messagePrefix, code, ctor) {
  if (experimentalWarnings.has(feature)) return;
  experimentalWarnings.add(feature);
  var msg = `${feature} is an experimental feature and might change at any time`;
  if (messagePrefix) {
    msg = messagePrefix + msg;
  }
  process.emitWarning(msg, 'ExperimentalWarning', code, ctor);
}
function filterDuplicateStrings(items, low) {
  var map = new SafeMap();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var key = StringPrototypeToLowerCase(item);
    if (low) {
      map.set(key, key);
    } else {
      map.set(key, item);
    }
  }
  return ArrayPrototypeSort(ArrayFrom(map.values()));
}
function cachedResult(fn) {
  var result;
  return () => {
    if (result === undefined) result = fn();
    return ArrayPrototypeSlice(result);
  };
}
var signalsToNamesMapping;
function getSignalsToNamesMapping() {
  if (signalsToNamesMapping !== undefined) return signalsToNamesMapping;
  signalsToNamesMapping = {
    __proto__: null
  };
  for (var key in signals) {
    signalsToNamesMapping[signals[key]] = key;
  }
  return signalsToNamesMapping;
}
function convertToValidSignal(signal) {
  if (typeof signal === 'number' && getSignalsToNamesMapping()[signal]) return signal;
  if (typeof signal === 'string') {
    var signalName = signals[StringPrototypeToUpperCase(signal)];
    if (signalName) return signalName;
  }
  throw new ERR_UNKNOWN_SIGNAL(signal);
}
function convertProcessSignalToExitCode(signalCode) {
  // Lazy-load to avoid a circular dependency.
  if (validateOneOf === undefined) ({
    validateOneOf
  } = require('internal/validators'));
  validateOneOf(signalCode, 'signalCode', ObjectKeys(signals));

  // POSIX standard: exit code for signal termination is 128 + signal number.
  return 128 + signals[signalCode];
}
function getConstructorOf(obj) {
  while (obj) {
    var descriptor = ObjectGetOwnPropertyDescriptor(obj, 'constructor');
    if (descriptor !== undefined && typeof descriptor.value === 'function' && descriptor.value.name !== '') {
      return descriptor.value;
    }
    obj = ObjectGetPrototypeOf(obj);
  }
  return null;
}
var cachedURL;
var cachedCWD;

/**
 * Get the current working directory while accounting for the possibility that it has been deleted.
 * `process.cwd()` can fail if the parent directory is deleted while the process runs.
 * @returns {URL} The current working directory or the volume root if it cannot be determined.
 */
function getCWDURL() {
  var {
    sep
  } = require('path');
  var {
    pathToFileURL
  } = require('internal/url');
  var cwd;
  try {
    // The implementation of `process.cwd()` already uses proper cache when it can.
    // It's a relatively cheap call performance-wise for the most common use case.
    cwd = process.cwd();
  } catch {
    cachedURL ??= pathToFileURL(sep);
  }
  if (cwd != null && cwd !== cachedCWD) {
    cachedURL = pathToFileURL(cwd + sep);
    cachedCWD = cwd;
  }
  return cachedURL;
}
function getSystemErrorMessage(err) {
  return lazyUv().getErrorMessage(err);
}
function getSystemErrorName(err) {
  var entry = uvErrmapGet(err);
  return entry ? entry[0] : `Unknown system error ${err}`;
}
function getSystemErrorMap() {
  return lazyUv().getErrorMap();
}
var kCustomPromisifiedSymbol = SymbolFor('nodejs.util.promisify.custom');
var kCustomPromisifyArgsSymbol = _Symbol('customPromisifyArgs');
var validateFunction;
function promisify(original) {
  // Lazy-load to avoid a circular dependency.
  if (validateFunction === undefined) ({
    validateFunction
  } = require('internal/validators'));
  validateFunction(original, 'original');
  if (original[kCustomPromisifiedSymbol]) {
    var _fn = original[kCustomPromisifiedSymbol];
    validateFunction(_fn, 'util.promisify.custom');
    return ObjectDefineProperty(_fn, kCustomPromisifiedSymbol, {
      __proto__: null,
      value: _fn,
      enumerable: false,
      writable: false,
      configurable: true
    });
  }

  // Names to create an object from in case the callback receives multiple
  // arguments, e.g. ['bytesRead', 'buffer'] for fs.read.
  var argumentNames = original[kCustomPromisifyArgsSymbol];
  function fn() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return new Promise((resolve, reject) => {
      ArrayPrototypePush(args, function (err) {
        if (err) {
          return reject(err);
        }
        if (argumentNames !== undefined && (arguments.length <= 1 ? 0 : arguments.length - 1) > 1) {
          var obj = {};
          for (var i = 0; i < argumentNames.length; i++) obj[argumentNames[i]] = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
          resolve(obj);
        } else {
          resolve(arguments.length <= 1 ? undefined : arguments[1]);
        }
      });
      if (isPromise(ReflectApply(original, this, args))) {
        process.emitWarning('Calling promisify on a function that returns a Promise is likely a mistake.', 'DeprecationWarning', 'DEP0174');
      }
    });
  }
  ObjectSetPrototypeOf(fn, ObjectGetPrototypeOf(original));
  ObjectDefineProperty(fn, kCustomPromisifiedSymbol, {
    __proto__: null,
    value: fn,
    enumerable: false,
    writable: false,
    configurable: true
  });
  var descriptors = ObjectGetOwnPropertyDescriptors(original);
  var propertiesValues = ObjectValues(descriptors);
  for (var i = 0; i < propertiesValues.length; i++) {
    // We want to use null-prototype objects to not rely on globally mutable
    // %Object.prototype%.
    ObjectSetPrototypeOf(propertiesValues[i], null);
  }
  return ObjectDefineProperties(fn, descriptors);
}
promisify.custom = kCustomPromisifiedSymbol;

// The built-in Array#join is slower in v8 6.0
function join(output, separator) {
  var str = '';
  if (output.length !== 0) {
    var lastIndex = output.length - 1;
    for (var i = 0; i < lastIndex; i++) {
      // It is faster not to use a template string here
      str += output[i];
      str += separator;
    }
    str += output[lastIndex];
  }
  return str;
}

// As of V8 6.6, depending on the size of the array, this is anywhere
// between 1.5-10x faster than the two-arg version of Array#splice()
function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];
  list.pop();
}
var kNodeModulesRE = /^(?:.*)[\\/]node_modules[\\/]/;
function isUnderNodeModules(filename) {
  return filename && RegExpPrototypeExec(kNodeModulesRE, filename) !== null;
}
var getStructuredStackImpl;
function lazyGetStructuredStack() {
  if (getStructuredStackImpl === undefined) {
    // Lazy-load to avoid a circular dependency.
    var {
      runInNewContext
    } = require('vm');
    // Use `runInNewContext()` to get something tamper-proof and
    // side-effect-free. Since this is currently only used for a deprecated API
    // and module mocking, the perf implications should be okay.
    getStructuredStackImpl = runInNewContext(`(function() {
      try { Error.stackTraceLimit = Infinity; } catch {}
      return function structuredStack() {
        const e = new Error();
        overrideStackTrace.set(e, (err, trace) => trace);
        return e.stack;
      };
    })()`, {
      overrideStackTrace
    }, {
      filename: 'structured-stack'
    });
  }
  return getStructuredStackImpl;
}
function getStructuredStack() {
  var getStructuredStackImpl = lazyGetStructuredStack();
  return getStructuredStackImpl();
}
function once(callback) {
  var {
    preserveReturnValue = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var called = false;
  var returnValue;
  return function () {
    if (called) return returnValue;
    called = true;
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }
    var result = ReflectApply(callback, this, args);
    returnValue = preserveReturnValue ? result : undefined;
    return result;
  };
}
var validateUint32;
function sleep(msec) {
  // Lazy-load to avoid a circular dependency.
  if (validateUint32 === undefined) ({
    validateUint32
  } = require('internal/validators'));
  validateUint32(msec, 'msec');
  _sleep(msec);
}

// https://heycam.github.io/webidl/#define-the-operations
function defineOperation(target, name, method) {
  ObjectDefineProperty(target, name, {
    __proto__: null,
    writable: true,
    enumerable: true,
    configurable: true,
    value: method
  });
}

// https://heycam.github.io/webidl/#es-interfaces
function exposeInterface(target, name, interfaceObject) {
  ObjectDefineProperty(target, name, {
    __proto__: null,
    writable: true,
    enumerable: false,
    configurable: true,
    value: interfaceObject
  });
}

// https://heycam.github.io/webidl/#es-namespaces
function exposeNamespace(target, name, namespaceObject) {
  ObjectDefineProperty(target, name, {
    __proto__: null,
    writable: true,
    enumerable: false,
    configurable: true,
    value: namespaceObject
  });
}
function defineReplaceableLazyAttribute(target, id, keys) {
  var writable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  var check = arguments.length > 4 ? arguments[4] : undefined;
  var mod;
  var _loop = function () {
    var key = keys[i];
    var value;
    var setterCalled = false;
    function get() {
      if (check !== undefined) {
        FunctionPrototypeCall(check, this);
      }
      if (setterCalled) {
        return value;
      }
      mod ??= require(id);
      value ??= mod[key];
      return value;
    }
    ObjectDefineProperty(get, 'name', {
      __proto__: null,
      value: `get ${key}`
    });
    function set(val) {
      setterCalled = true;
      value = val;
    }
    ObjectDefineProperty(set, 'name', {
      __proto__: null,
      value: `set ${key}`
    });
    ObjectDefineProperty(target, key, {
      __proto__: null,
      enumerable: true,
      configurable: true,
      get,
      set: writable ? set : undefined
    });
  };
  for (var i = 0; i < keys.length; i++) {
    _loop();
  }
}
function exposeLazyInterfaces(target, id, keys) {
  defineLazyProperties(target, id, keys, false);
}
var _DOMException;
var lazyDOMExceptionClass = () => {
  _DOMException ??= internalBinding('messaging').DOMException;
  return _DOMException;
};
var lazyDOMException = (message, name) => {
  _DOMException ??= internalBinding('messaging').DOMException;
  if (isErrorStackTraceLimitWritable()) {
    var limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    var ex = new _DOMException(message, name);
    Error.stackTraceLimit = limit;
    ErrorCaptureStackTrace(ex, lazyDOMException);
    return ex;
  }
  return new _DOMException(message, name);
};
var kEnumerableProperty = ObjectFreeze({
  __proto__: null,
  enumerable: true
});
var kEmptyObject = ObjectFreeze({
  __proto__: null
});

/**
 * Mimics `obj[key] = value` but ignoring potential prototype inheritance.
 * @param {any} obj
 * @param {string} key
 * @param {any} value
 * @returns {any}
 */
function setOwnProperty(obj, key, value) {
  ObjectDefineProperty(obj, key, {
    __proto__: null,
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
  return value;
}
var internalGlobal;
function getInternalGlobal() {
  if (internalGlobal == null) {
    // Lazy-load to avoid a circular dependency.
    var {
      runInNewContext
    } = require('vm');
    internalGlobal = runInNewContext('this', undefined, {
      contextName: 'internal'
    });
  }
  return internalGlobal;
}
function SideEffectFreeRegExpPrototypeExec(regex, string) {
  var {
    RegExp: RegExpFromAnotherRealm
  } = getInternalGlobal();
  return FunctionPrototypeCall(RegExpFromAnotherRealm.prototype.exec, regex, string);
}
var crossRealmRegexes = new SafeWeakMap();
function getCrossRealmRegex(regex) {
  var cached = crossRealmRegexes.get(regex);
  if (cached) return cached;
  var flagString = '';
  if (RegExpPrototypeGetHasIndices(regex)) flagString += 'd';
  if (RegExpPrototypeGetGlobal(regex)) flagString += 'g';
  if (RegExpPrototypeGetIgnoreCase(regex)) flagString += 'i';
  if (RegExpPrototypeGetMultiline(regex)) flagString += 'm';
  if (RegExpPrototypeGetDotAll(regex)) flagString += 's';
  if (RegExpPrototypeGetUnicode(regex)) flagString += 'u';
  if (RegExpPrototypeGetSticky(regex)) flagString += 'y';
  var {
    RegExp: RegExpFromAnotherRealm
  } = getInternalGlobal();
  var crossRealmRegex = new RegExpFromAnotherRealm(RegExpPrototypeGetSource(regex), flagString);
  crossRealmRegexes.set(regex, crossRealmRegex);
  return crossRealmRegex;
}
function SideEffectFreeRegExpPrototypeSymbolReplace(regex, string, replacement) {
  return getCrossRealmRegex(regex)[SymbolReplace](string, replacement);
}
function SideEffectFreeRegExpPrototypeSymbolSplit(regex, string) {
  var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  return getCrossRealmRegex(regex)[SymbolSplit](string, limit);
}

/**
 * Helper function to lazy-load an initialize-once value.
 * @template T Return value of initializer
 * @param {()=>T} initializer Initializer of the lazily loaded value.
 * @returns {()=>T}
 */
function getLazy(initializer) {
  var value;
  var initialized = false;
  return function () {
    if (initialized === false) {
      value = initializer();
      initialized = true;
    }
    return value;
  };
}

// Setup user-facing NODE_V8_COVERAGE environment variable that writes
// ScriptCoverage objects to a specified directory.
function setupCoverageHooks(dir) {
  var cwd = require('internal/process/execution').tryGetCwd();
  var {
    resolve
  } = require('path');
  var coverageDirectory = resolve(cwd, dir);
  var {
    sourceMapCacheToObject
  } = require('internal/source_map/source_map_cache');
  if (process.features.inspector) {
    internalBinding('profiler').setCoverageDirectory(coverageDirectory);
    internalBinding('profiler').setSourceMapCacheGetter(sourceMapCacheToObject);
  } else {
    process.emitWarning('The inspector is disabled, ' + 'coverage could not be collected', 'Warning');
    return '';
  }
  return coverageDirectory;
}

// Returns the number of ones in the binary representation of the decimal
// number.
function countBinaryOnes(n) {
  // Count the number of bits set in parallel, which is faster than looping
  n = n - (n >>> 1 & 0x55555555);
  n = (n & 0x33333333) + (n >>> 2 & 0x33333333);
  return (n + (n >>> 4) & 0xF0F0F0F) * 0x1010101 >>> 24;
}
function getCIDR(address, netmask, family) {
  var ones = 0;
  var split = '.';
  var range = 10;
  var groupLength = 8;
  var hasZeros = false;
  var lastPos = 0;
  if (family === 'IPv6') {
    split = ':';
    range = 16;
    groupLength = 16;
  }
  for (var i = 0; i < netmask.length; i++) {
    if (netmask[i] !== split) {
      if (i + 1 < netmask.length) {
        continue;
      }
      i++;
    }
    var part = StringPrototypeSlice(netmask, lastPos, i);
    lastPos = i + 1;
    if (part !== '') {
      if (hasZeros) {
        if (part !== '0') {
          return null;
        }
      } else {
        var binary = NumberParseInt(part, range);
        var binaryOnes = countBinaryOnes(binary);
        ones += binaryOnes;
        if (binaryOnes !== groupLength) {
          if (StringPrototypeIncludes(binary.toString(2), '01')) {
            return null;
          }
          hasZeros = true;
        }
      }
    }
  }
  return `${address}/${ones}`;
}
var handleTypes = ['TCP', 'TTY', 'UDP', 'FILE', 'PIPE', 'UNKNOWN'];
function guessHandleType(fd) {
  var type = _guessHandleType(fd);
  return handleTypes[type];
}
var _weak = /*#__PURE__*/new WeakMap();
var _strong = /*#__PURE__*/new WeakMap();
var _refCount = /*#__PURE__*/new WeakMap();
var WeakReference = /*#__PURE__*/function () {
  function WeakReference(object) {
    _classCallCheck(this, WeakReference);
    _classPrivateFieldInitSpec(this, _weak, null);
    // eslint-disable-next-line no-unused-private-class-members
    _classPrivateFieldInitSpec(this, _strong, null);
    _classPrivateFieldInitSpec(this, _refCount, 0);
    _classPrivateFieldSet(_weak, this, new SafeWeakRef(object));
  }
  return _createClass(WeakReference, [{
    key: "incRef",
    value: function incRef() {
      var _this$refCount, _this$refCount2;
      _classPrivateFieldSet(_refCount, this, (_this$refCount = _classPrivateFieldGet(_refCount, this), _this$refCount2 = _this$refCount++, _this$refCount)), _this$refCount2;
      if (_classPrivateFieldGet(_refCount, this) === 1) {
        var derefed = _classPrivateFieldGet(_weak, this).deref();
        if (derefed !== undefined) {
          _classPrivateFieldSet(_strong, this, derefed);
        }
      }
      return _classPrivateFieldGet(_refCount, this);
    }
  }, {
    key: "decRef",
    value: function decRef() {
      var _this$refCount3, _this$refCount4;
      _classPrivateFieldSet(_refCount, this, (_this$refCount3 = _classPrivateFieldGet(_refCount, this), _this$refCount4 = _this$refCount3--, _this$refCount3)), _this$refCount4;
      if (_classPrivateFieldGet(_refCount, this) === 0) {
        _classPrivateFieldSet(_strong, this, null);
      }
      return _classPrivateFieldGet(_refCount, this);
    }
  }, {
    key: "get",
    value: function get() {
      return _classPrivateFieldGet(_weak, this).deref();
    }
  }]);
}();
var encodingsMap = {
  __proto__: null
};
for (var i = 0; i < encodings.length; ++i) encodingsMap[encodings[i]] = i;

/**
 * Reassigns the .name property of a function.
 * Should be used when function can't be initially defined with desired name
 * or when desired name should include `#`, `[`, `]`, etc.
 * @param {string | symbol} name
 * @param {Function} fn
 * @param {object} [descriptor]
 * @returns {Function} the same function, renamed
 */
function assignFunctionName(name, fn) {
  var descriptor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
  if (typeof name !== 'string') {
    var symbolDescription = SymbolPrototypeGetDescription(name);
    assert(symbolDescription !== undefined, 'Attempted to name function after descriptionless Symbol');
    name = `[${symbolDescription}]`;
  }
  return ObjectDefineProperty(fn, 'name', _objectSpread(_objectSpread(_objectSpread({
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true
  }, ObjectGetOwnPropertyDescriptor(fn, 'name')), descriptor), {}, {
    value: name
  }));
}
module.exports = {
  getLazy,
  assertCrypto,
  assertTypeScript,
  assignFunctionName,
  cachedResult,
  constructSharedArrayBuffer,
  convertProcessSignalToExitCode,
  convertToValidSignal,
  decorateErrorStack,
  defineOperation,
  defineLazyProperties,
  defineReplaceableLazyAttribute,
  deprecate,
  deprecateInstantiation,
  deprecateProperty,
  emitExperimentalWarning,
  encodingsMap,
  exposeInterface,
  exposeLazyInterfaces,
  exposeNamespace,
  filterDuplicateStrings,
  getConstructorOf,
  getCIDR,
  getCWDURL,
  getStructuredStack,
  getSystemErrorMap,
  getSystemErrorName,
  getSystemErrorMessage,
  guessHandleType,
  isError,
  isUnderNodeModules,
  isMacOS,
  isWindows,
  join,
  lazyDOMException,
  lazyDOMExceptionClass,
  normalizeEncoding,
  once,
  promisify,
  SideEffectFreeRegExpPrototypeExec,
  SideEffectFreeRegExpPrototypeSymbolReplace,
  SideEffectFreeRegExpPrototypeSymbolSplit,
  sleep,
  spliceOne,
  setupCoverageHooks,
  removeColors,
  // Symbol used to customize promisify conversion
  customPromisifyArgs: kCustomPromisifyArgsSymbol,
  // Symbol used to provide a custom inspect function for an object as an
  // alternative to using 'inspect'
  customInspectSymbol: SymbolFor('nodejs.util.inspect.custom'),
  // Used by the buffer module to capture an internal reference to the
  // default isEncoding implementation, just in case userland overrides it.
  kIsEncodingSymbol: _Symbol('kIsEncodingSymbol'),
  kVmBreakFirstLineSymbol: _Symbol('kVmBreakFirstLineSymbol'),
  kEmptyObject,
  kEnumerableProperty,
  setOwnProperty,
  pendingDeprecate,
  WeakReference,
  isPendingDeprecation,
  getDeprecationWarningEmitter
};

