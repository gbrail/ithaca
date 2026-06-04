// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

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
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ArrayPrototypeForEach,
  ObjectFreeze,
  PromiseReject,
  ReflectApply,
  Symbol: _Symbol
} = primordials;
var {
  ContextifyScript,
  makeContext,
  constants,
  measureMemory: _measureMemory
} = internalBinding('contextify');
var {
  ERR_CONTEXT_NOT_INITIALIZED,
  ERR_INVALID_ARG_TYPE
} = require('internal/errors').codes;
var {
  validateArray,
  validateBoolean,
  validateBuffer,
  validateInt32,
  validateOneOf,
  validateObject,
  validateString,
  validateStringArray,
  validateUint32,
  kValidateObjectAllowArray,
  kValidateObjectAllowNullable
} = require('internal/validators');
var {
  emitExperimentalWarning,
  kEmptyObject,
  kVmBreakFirstLineSymbol
} = require('internal/util');
var {
  getHostDefinedOptionId,
  internalCompileFunction,
  isContext: _isContext,
  registerImportModuleDynamically
} = require('internal/vm');
var {
  vm_dynamic_import_main_context_default,
  vm_context_no_contextify
} = internalBinding('symbols');
var kParsingContext = _Symbol('script parsing context');

/**
 * Check if object is a context object created by vm.createContext().
 * @throws {TypeError} If object is not an object in the first place, throws TypeError.
 * @param {object} object Object to check.
 * @returns {boolean}
 */
function isContext(object) {
  validateObject(object, 'object', kValidateObjectAllowArray);
  return _isContext(object);
}
var Script = /*#__PURE__*/function (_ContextifyScript) {
  function Script(code) {
    var _this;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, Script);
    code = `${code}`;
    if (typeof options === 'string') {
      options = {
        filename: options
      };
    } else {
      validateObject(options, 'options');
    }
    var {
      filename = 'evalmachine.<anonymous>',
      lineOffset = 0,
      columnOffset = 0,
      cachedData,
      produceCachedData = false,
      importModuleDynamically,
      [kParsingContext]: parsingContext
    } = options;
    validateString(filename, 'options.filename');
    validateInt32(lineOffset, 'options.lineOffset');
    validateInt32(columnOffset, 'options.columnOffset');
    if (cachedData !== undefined) {
      validateBuffer(cachedData, 'options.cachedData');
    }
    validateBoolean(produceCachedData, 'options.produceCachedData');
    var hostDefinedOptionId = getHostDefinedOptionId(importModuleDynamically, filename);
    // Calling `ReThrow()` on a native TryCatch does not generate a new
    // abort-on-uncaught-exception check. A dummy try/catch in JS land
    // protects against that.
    try {
      // eslint-disable-line no-useless-catch
      _this = _callSuper(this, Script, [code, filename, lineOffset, columnOffset, cachedData, produceCachedData, parsingContext, hostDefinedOptionId]);
    } catch (e) {
      throw e; /* node-do-not-add-exception-line */
    }
    registerImportModuleDynamically(_assertThisInitialized(_this), importModuleDynamically);
    return _assertThisInitialized(_this);
  }
  _inherits(Script, _ContextifyScript);
  return _createClass(Script, [{
    key: "runInThisContext",
    value: function runInThisContext(options) {
      var {
        breakOnSigint,
        args
      } = getRunInContextArgs(null, options);
      if (breakOnSigint && process.listenerCount('SIGINT') > 0) {
        return sigintHandlersWrap(_superPropGet(Script, "runInContext", this, 1), this, args);
      }
      return ReflectApply(_superPropGet(Script, "runInContext", this, 1), this, args);
    }
  }, {
    key: "runInContext",
    value: function runInContext(contextifiedObject, options) {
      validateContext(contextifiedObject);
      var {
        breakOnSigint,
        args
      } = getRunInContextArgs(contextifiedObject, options);
      if (breakOnSigint && process.listenerCount('SIGINT') > 0) {
        return sigintHandlersWrap(_superPropGet(Script, "runInContext", this, 1), this, args);
      }
      return ReflectApply(_superPropGet(Script, "runInContext", this, 1), this, args);
    }
  }, {
    key: "runInNewContext",
    value: function runInNewContext(contextObject, options) {
      var context = createContext(contextObject, getContextOptions(options));
      return this.runInContext(context, options);
    }
  }]);
}(ContextifyScript);
function validateContext(contextifiedObject) {
  if (!isContext(contextifiedObject)) {
    throw new ERR_INVALID_ARG_TYPE('contextifiedObject', 'vm.Context', contextifiedObject);
  }
}
function getRunInContextArgs(contextifiedObject) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  validateObject(options, 'options');
  var timeout = options.timeout;
  if (timeout === undefined) {
    timeout = -1;
  } else {
    validateUint32(timeout, 'options.timeout', true);
  }
  var {
    displayErrors = true,
    breakOnSigint = false,
    [kVmBreakFirstLineSymbol]: breakFirstLine = false
  } = options;
  validateBoolean(displayErrors, 'options.displayErrors');
  validateBoolean(breakOnSigint, 'options.breakOnSigint');
  return {
    breakOnSigint,
    args: [contextifiedObject, timeout, displayErrors, breakOnSigint, breakFirstLine]
  };
}
function getContextOptions(options) {
  if (!options) return {};
  var contextOptions = {
    name: options.contextName,
    origin: options.contextOrigin,
    codeGeneration: undefined,
    microtaskMode: options.microtaskMode
  };
  if (contextOptions.name !== undefined) validateString(contextOptions.name, 'options.contextName');
  if (contextOptions.origin !== undefined) validateString(contextOptions.origin, 'options.contextOrigin');
  if (options.contextCodeGeneration !== undefined) {
    validateObject(options.contextCodeGeneration, 'options.contextCodeGeneration');
    var {
      strings,
      wasm
    } = options.contextCodeGeneration;
    if (strings !== undefined) validateBoolean(strings, 'options.contextCodeGeneration.strings');
    if (wasm !== undefined) validateBoolean(wasm, 'options.contextCodeGeneration.wasm');
    contextOptions.codeGeneration = {
      strings,
      wasm
    };
  }
  if (options.microtaskMode !== undefined) validateString(options.microtaskMode, 'options.microtaskMode');
  return contextOptions;
}
var defaultContextNameIndex = 1;
function createContext() {
  var contextObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  if (contextObject !== vm_context_no_contextify && isContext(contextObject)) {
    return contextObject;
  }
  validateObject(options, 'options');
  var {
    name = `VM Context ${defaultContextNameIndex++}`,
    origin,
    codeGeneration,
    microtaskMode,
    importModuleDynamically
  } = options;
  validateString(name, 'options.name');
  if (origin !== undefined) validateString(origin, 'options.origin');
  if (codeGeneration !== undefined) validateObject(codeGeneration, 'options.codeGeneration');
  var strings = true;
  var wasm = true;
  if (codeGeneration !== undefined) {
    ({
      strings = true,
      wasm = true
    } = codeGeneration);
    validateBoolean(strings, 'options.codeGeneration.strings');
    validateBoolean(wasm, 'options.codeGeneration.wasm');
  }
  validateOneOf(microtaskMode, 'options.microtaskMode', ['afterEvaluate', undefined]);
  var microtaskQueue = microtaskMode === 'afterEvaluate';
  var hostDefinedOptionId = getHostDefinedOptionId(importModuleDynamically, name);
  var result = makeContext(contextObject, name, origin, strings, wasm, microtaskQueue, hostDefinedOptionId);
  // Register the context scope callback after the context was initialized.
  registerImportModuleDynamically(result, importModuleDynamically);
  return result;
}
function createScript(code, options) {
  return new Script(code, options);
}

// Remove all SIGINT listeners and re-attach them after the wrapped function
// has executed, so that caught SIGINT are handled by the listeners again.
function sigintHandlersWrap(fn, thisArg, argsArray) {
  var sigintListeners = process.rawListeners('SIGINT');
  process.removeAllListeners('SIGINT');
  try {
    return ReflectApply(fn, thisArg, argsArray);
  } finally {
    // Add using the public methods so that the `newListener` handler of
    // process can re-attach the listeners.
    ArrayPrototypeForEach(sigintListeners, listener => {
      process.addListener('SIGINT', listener);
    });
  }
}
function runInContext(code, contextifiedObject, options) {
  validateContext(contextifiedObject);
  if (typeof options === 'string') {
    options = {
      filename: options,
      [kParsingContext]: contextifiedObject
    };
  } else {
    options = _objectSpread(_objectSpread({}, options), {}, {
      [kParsingContext]: contextifiedObject
    });
  }
  return createScript(code, options).runInContext(contextifiedObject, options);
}
function runInNewContext(code, contextObject, options) {
  if (typeof options === 'string') {
    options = {
      filename: options
    };
  }
  contextObject = createContext(contextObject, getContextOptions(options));
  options = _objectSpread(_objectSpread({}, options), {}, {
    [kParsingContext]: contextObject
  });
  return createScript(code, options).runInNewContext(contextObject, options);
}
function runInThisContext(code, options) {
  if (typeof options === 'string') {
    options = {
      filename: options
    };
  }
  return createScript(code, options).runInThisContext(options);
}
function compileFunction(code, params) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
  validateString(code, 'code');
  validateObject(options, 'options');
  if (params !== undefined) {
    validateStringArray(params, 'params');
  }
  var {
    filename = '',
    columnOffset = 0,
    lineOffset = 0,
    cachedData = undefined,
    produceCachedData = false,
    parsingContext = undefined,
    contextExtensions = [],
    importModuleDynamically
  } = options;
  validateString(filename, 'options.filename');
  validateInt32(columnOffset, 'options.columnOffset');
  validateInt32(lineOffset, 'options.lineOffset');
  if (cachedData !== undefined) validateBuffer(cachedData, 'options.cachedData');
  validateBoolean(produceCachedData, 'options.produceCachedData');
  if (parsingContext !== undefined) {
    if (typeof parsingContext !== 'object' || parsingContext === null || !isContext(parsingContext)) {
      throw new ERR_INVALID_ARG_TYPE('options.parsingContext', 'Context', parsingContext);
    }
  }
  validateArray(contextExtensions, 'options.contextExtensions');
  ArrayPrototypeForEach(contextExtensions, (extension, i) => {
    var name = `options.contextExtensions[${i}]`;
    validateObject(extension, name, kValidateObjectAllowNullable);
  });
  var hostDefinedOptionId = getHostDefinedOptionId(importModuleDynamically, filename);
  return internalCompileFunction(code, filename, lineOffset, columnOffset, cachedData, produceCachedData, parsingContext, contextExtensions, params, hostDefinedOptionId, importModuleDynamically).function;
}
var measureMemoryModes = {
  summary: constants.measureMemory.mode.SUMMARY,
  detailed: constants.measureMemory.mode.DETAILED
};
var measureMemoryExecutions = {
  default: constants.measureMemory.execution.DEFAULT,
  eager: constants.measureMemory.execution.EAGER
};
function measureMemory() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  emitExperimentalWarning('vm.measureMemory');
  validateObject(options, 'options');
  var {
    mode = 'summary',
    execution = 'default'
  } = options;
  validateOneOf(mode, 'options.mode', ['summary', 'detailed']);
  validateOneOf(execution, 'options.execution', ['default', 'eager']);
  var result = _measureMemory(measureMemoryModes[mode], measureMemoryExecutions[execution]);
  if (result === undefined) {
    return PromiseReject(new ERR_CONTEXT_NOT_INITIALIZED());
  }
  return result;
}
var vmConstants = {
  __proto__: null,
  USE_MAIN_CONTEXT_DEFAULT_LOADER: vm_dynamic_import_main_context_default,
  DONT_CONTEXTIFY: vm_context_no_contextify
};
ObjectFreeze(vmConstants);
module.exports = {
  Script,
  createContext,
  createScript,
  runInContext,
  runInNewContext,
  runInThisContext,
  isContext,
  compileFunction,
  measureMemory,
  constants: vmConstants
};

// The vm module is patched to include vm.Module, vm.SourceTextModule
// and vm.SyntheticModule in the pre-execution phase when
// --experimental-vm-modules is on.

