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
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
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
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Array,
  ArrayIsArray,
  ArrayPrototypeForEach,
  ArrayPrototypeIndexOf,
  ArrayPrototypeMap,
  ArrayPrototypeSome,
  FunctionPrototypeCall,
  ObjectDefineProperty,
  ObjectFreeze,
  ObjectGetPrototypeOf,
  ObjectPrototypeHasOwnProperty,
  ObjectSetPrototypeOf,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  SafePromiseAllReturnArrayLike,
  Symbol: _Symbol,
  SymbolToStringTag,
  TypeError: _TypeError
} = primordials;
var assert = require('internal/assert');
var {
  isModuleNamespaceObject
} = require('internal/util/types');
var {
  customInspectSymbol,
  emitExperimentalWarning,
  getConstructorOf,
  kEmptyObject
} = require('internal/util');
var {
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE,
  ERR_VM_MODULE_ALREADY_LINKED,
  ERR_VM_MODULE_DIFFERENT_CONTEXT,
  ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA,
  ERR_VM_MODULE_LINK_FAILURE,
  ERR_MODULE_LINK_MISMATCH,
  ERR_VM_MODULE_NOT_MODULE,
  ERR_VM_MODULE_STATUS
} = require('internal/errors').codes;
var {
  validateBoolean,
  validateBuffer,
  validateFunction,
  validateInt32,
  validateObject,
  validateUint32,
  validateString,
  validateThisInternalField,
  validateArray
} = require('internal/validators');
var binding = internalBinding('module_wrap');
var {
  ModuleWrap,
  kUninstantiated,
  kInstantiating,
  kInstantiated,
  kEvaluating,
  kEvaluated,
  kErrored,
  kSourcePhase,
  kEvaluationPhase
} = binding;
var STATUS_MAP = {
  __proto__: null,
  [kUninstantiated]: 'unlinked',
  [kInstantiating]: 'linking',
  [kInstantiated]: 'linked',
  [kEvaluating]: 'evaluating',
  [kEvaluated]: 'evaluated',
  [kErrored]: 'errored'
};
var PHASE_MAP = {
  __proto__: null,
  [kSourcePhase]: 'source',
  [kEvaluationPhase]: 'evaluation'
};
var globalModuleId = 0;
var defaultModuleName = 'vm:module';
var kWrap = _Symbol('kWrap');
var kContext = _Symbol('kContext');
var kPerContextModuleId = _Symbol('kPerContextModuleId');
var kLink = _Symbol('kLink');
var {
  isContext
} = require('internal/vm');
function isModule(object) {
  if (typeof object !== 'object' || object === null || !ObjectPrototypeHasOwnProperty(object, kWrap)) {
    return false;
  }
  return true;
}
function phaseEnumToPhaseName(phase) {
  var phaseName = PHASE_MAP[phase];
  assert(phaseName !== undefined, `Invalid phase value: ${phase}`);
  return phaseName;
}
var Module = /*#__PURE__*/function () {
  function Module(options) {
    _classCallCheck(this, Module);
    emitExperimentalWarning('VM Modules');
    if ((this instanceof Module ? this.constructor : void 0) === Module) {
      // eslint-disable-next-line no-restricted-syntax
      throw new _TypeError('Module is not a constructor');
    }
    var {
      context,
      sourceText,
      syntheticExportNames,
      syntheticEvaluationSteps
    } = options;
    if (context !== undefined) {
      validateObject(context, 'context');
      if (!isContext(context)) {
        throw new ERR_INVALID_ARG_TYPE('options.context', 'vm.Context', context);
      }
    }
    var {
      identifier
    } = options;
    if (identifier !== undefined) {
      validateString(identifier, 'options.identifier');
    } else if (context === undefined) {
      identifier = `${defaultModuleName}(${globalModuleId++})`;
    } else if (context[kPerContextModuleId] !== undefined) {
      var curId = context[kPerContextModuleId];
      identifier = `${defaultModuleName}(${curId})`;
      context[kPerContextModuleId] += 1;
    } else {
      identifier = `${defaultModuleName}(0)`;
      ObjectDefineProperty(context, kPerContextModuleId, {
        __proto__: null,
        value: 1,
        writable: true,
        enumerable: false,
        configurable: true
      });
    }
    if (sourceText !== undefined) {
      this[kWrap] = new ModuleWrap(identifier, context, sourceText, options.lineOffset, options.columnOffset, options.cachedData);
    } else {
      assert(syntheticEvaluationSteps);
      this[kWrap] = new ModuleWrap(identifier, context, syntheticExportNames, syntheticEvaluationSteps);
    }
    this[kContext] = context;
  }
  return _createClass(Module, [{
    key: "identifier",
    get: function () {
      validateThisInternalField(this, kWrap, 'Module');
      return this[kWrap].url;
    }
  }, {
    key: "context",
    get: function () {
      validateThisInternalField(this, kWrap, 'Module');
      return this[kContext];
    }
  }, {
    key: "namespace",
    get: function () {
      validateThisInternalField(this, kWrap, 'Module');
      if (this[kWrap].getStatus() < kInstantiated) {
        throw new ERR_VM_MODULE_STATUS('must not be unlinked or linking');
      }
      return this[kWrap].getNamespace();
    }
  }, {
    key: "status",
    get: function () {
      validateThisInternalField(this, kWrap, 'Module');
      return STATUS_MAP[this[kWrap].getStatus()];
    }
  }, {
    key: "error",
    get: function () {
      validateThisInternalField(this, kWrap, 'Module');
      if (this[kWrap].getStatus() !== kErrored) {
        throw new ERR_VM_MODULE_STATUS('must be errored');
      }
      return this[kWrap].getError();
    }
  }, {
    key: "link",
    value: function link(linker) {
      try {
        var _this = this;
        validateThisInternalField(_this, kWrap, 'Module');
        validateFunction(linker, 'linker');
        if (_this.status === 'linked') {
          throw new ERR_VM_MODULE_ALREADY_LINKED();
        }
        if (_this.status !== 'unlinked') {
          throw new ERR_VM_MODULE_STATUS('must be unlinked');
        }
        return _await(_this[kLink](linker), function () {
          _this[kWrap].instantiate();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "evaluate",
    value: function evaluate() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
      try {
        validateThisInternalField(this, kWrap, 'Module');
        validateObject(options, 'options');
        var timeout = options.timeout;
        if (timeout === undefined) {
          timeout = -1;
        } else {
          validateUint32(timeout, 'options.timeout', true);
        }
        var {
          breakOnSigint = false
        } = options;
        validateBoolean(breakOnSigint, 'options.breakOnSigint');
        var status = this[kWrap].getStatus();
        if (status !== kInstantiated && status !== kEvaluated && status !== kErrored) {
          throw new ERR_VM_MODULE_STATUS('must be one of linked, evaluated, or errored');
        }
        return this[kWrap].evaluate(timeout, breakOnSigint);
      } catch (e) {
        return PromiseReject(e);
      }
    }
  }, {
    key: customInspectSymbol,
    value: function (depth, options) {
      validateThisInternalField(this, kWrap, 'Module');
      if (typeof depth === 'number' && depth < 0) return this;
      var constructor = getConstructorOf(this) || Module;
      var o = {
        __proto__: {
          constructor
        }
      };
      o.status = this.status;
      o.identifier = this.identifier;
      o.context = this.context;
      ObjectSetPrototypeOf(o, ObjectGetPrototypeOf(this));
      ObjectDefineProperty(o, SymbolToStringTag, {
        __proto__: null,
        value: constructor.name,
        configurable: true
      });

      // Lazy to avoid circular dependency
      var {
        inspect
      } = require('internal/util/inspect');
      return inspect(o, _objectSpread(_objectSpread({}, options), {}, {
        customInspect: false
      }));
    }
  }]);
}();
var kNoError = _Symbol('kNoError');
var _error = /*#__PURE__*/new WeakMap();
var _statusOverride = /*#__PURE__*/new WeakMap();
var _moduleRequests = /*#__PURE__*/new WeakMap();
var _dependencySpecifiers = /*#__PURE__*/new WeakMap();
var SourceTextModule = /*#__PURE__*/function (_Module) {
  function SourceTextModule(sourceText) {
    var _this2;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, SourceTextModule);
    validateString(sourceText, 'sourceText');
    validateObject(options, 'options');
    var {
      lineOffset = 0,
      columnOffset = 0,
      initializeImportMeta,
      importModuleDynamically,
      context,
      identifier,
      cachedData
    } = options;
    validateInt32(lineOffset, 'options.lineOffset');
    validateInt32(columnOffset, 'options.columnOffset');
    if (initializeImportMeta !== undefined) {
      validateFunction(initializeImportMeta, 'options.initializeImportMeta');
    }
    if (importModuleDynamically !== undefined) {
      validateFunction(importModuleDynamically, 'options.importModuleDynamically');
    }
    if (cachedData !== undefined) {
      validateBuffer(cachedData, 'options.cachedData');
    }
    _this2 = _callSuper(this, SourceTextModule, [{
      sourceText,
      context,
      identifier,
      lineOffset,
      columnOffset,
      cachedData,
      initializeImportMeta,
      importModuleDynamically
    }]);
    _classPrivateFieldInitSpec(_this2, _error, kNoError);
    _classPrivateFieldInitSpec(_this2, _statusOverride, void 0);
    _classPrivateFieldInitSpec(_this2, _moduleRequests, void 0);
    _classPrivateFieldInitSpec(_this2, _dependencySpecifiers, void 0);
    var registry = {
      __proto__: null,
      initializeImportMeta: options.initializeImportMeta,
      importModuleDynamically: options.importModuleDynamically ? importModuleDynamicallyWrap(options.importModuleDynamically) : undefined
    };
    // This will take precedence over the referrer as the object being
    // passed into the callbacks.
    registry.callbackReferrer = _this2;
    var {
      registerModule
    } = require('internal/modules/esm/utils');
    registerModule(_this2[kWrap], registry);
    _classPrivateFieldSet(_moduleRequests, _this2, ObjectFreeze(ArrayPrototypeMap(_this2[kWrap].getModuleRequests(), request => {
      return ObjectFreeze({
        __proto__: null,
        specifier: request.specifier,
        attributes: request.attributes,
        phase: phaseEnumToPhaseName(request.phase)
      });
    })));
    return _this2;
  }
  _inherits(SourceTextModule, _Module);
  return _createClass(SourceTextModule, [{
    key: kLink,
    value: _async(function (linker) {
      var _this3 = this;
      _classPrivateFieldSet(_statusOverride, _this3, 'linking');

      // Iterates the module requests and links with the linker.
      // Modules should be aligned with the moduleRequests array in order.
      var modulePromises = Array(_classPrivateFieldGet(_moduleRequests, _this3).length);
      // Iterates with index to avoid calling into userspace with `Symbol.iterator`.
      var _loop = function () {
        var {
          specifier,
          attributes
        } = _classPrivateFieldGet(_moduleRequests, _this3)[idx];
        var linkerResult = linker(specifier, _this3, {
          attributes,
          assert: attributes
        });
        var modulePromise = PromisePrototypeThen(PromiseResolve(linkerResult), _async(function (module) {
          if (!isModule(module)) {
            throw new ERR_VM_MODULE_NOT_MODULE();
          }
          if (module.context !== _this3.context) {
            throw new ERR_VM_MODULE_DIFFERENT_CONTEXT();
          }
          if (module.status === 'errored') {
            throw new ERR_VM_MODULE_LINK_FAILURE(`request for '${specifier}' resolved to an errored module`, module.error);
          }
          return _invoke(function () {
            if (module.status === 'unlinked') {
              return _awaitIgnored(module[kLink](linker));
            }
          }, function () {
            return module[kWrap];
          });
        }));
        modulePromises[idx] = modulePromise;
      };
      for (var idx = 0; idx < _classPrivateFieldGet(_moduleRequests, _this3).length; idx++) {
        _loop();
      }
      return _finallyRethrows(function () {
        return _catch(function () {
          return _await(SafePromiseAllReturnArrayLike(modulePromises), function (modules) {
            _this3[kWrap].link(modules);
          });
        }, function (e) {
          _classPrivateFieldSet(_error, _this3, e);
          throw e;
        });
      }, function (_wasThrown, _result) {
        _classPrivateFieldSet(_statusOverride, _this3, undefined);
        return _rethrow(_wasThrown, _result);
      });
    })
  }, {
    key: "linkRequests",
    value: function linkRequests(modules) {
      validateThisInternalField(this, kWrap, 'SourceTextModule');
      if (this.status !== 'unlinked') {
        throw new ERR_VM_MODULE_STATUS('must be unlinked');
      }
      validateArray(modules, 'modules');
      if (modules.length !== _classPrivateFieldGet(_moduleRequests, this).length) {
        throw new ERR_MODULE_LINK_MISMATCH(`Expected ${_classPrivateFieldGet(_moduleRequests, this).length} modules, got ${modules.length}`);
      }
      var moduleWraps = ArrayPrototypeMap(modules, module => {
        if (!isModule(module)) {
          throw new ERR_VM_MODULE_NOT_MODULE();
        }
        if (module.context !== this.context) {
          throw new ERR_VM_MODULE_DIFFERENT_CONTEXT();
        }
        return module[kWrap];
      });
      this[kWrap].link(moduleWraps);
    }
  }, {
    key: "instantiate",
    value: function instantiate() {
      validateThisInternalField(this, kWrap, 'SourceTextModule');
      if (this.status !== 'unlinked') {
        throw new ERR_VM_MODULE_STATUS('must be unlinked');
      }
      this[kWrap].instantiate();
    }
  }, {
    key: "dependencySpecifiers",
    get: function () {
      _classPrivateFieldGet(_dependencySpecifiers, this) ?? _classPrivateFieldSet(_dependencySpecifiers, this, ObjectFreeze(ArrayPrototypeMap(_classPrivateFieldGet(_moduleRequests, this), request => request.specifier)));
      return _classPrivateFieldGet(_dependencySpecifiers, this);
    }
  }, {
    key: "moduleRequests",
    get: function () {
      return _classPrivateFieldGet(_moduleRequests, this);
    }
  }, {
    key: "status",
    get: function () {
      if (_classPrivateFieldGet(_error, this) !== kNoError) {
        return 'errored';
      }
      if (_classPrivateFieldGet(_statusOverride, this)) {
        return _classPrivateFieldGet(_statusOverride, this);
      }
      return _superPropGet(SourceTextModule, "status", this, 1);
    }
  }, {
    key: "error",
    get: function () {
      if (_classPrivateFieldGet(_error, this) !== kNoError) {
        return _classPrivateFieldGet(_error, this);
      }
      return _superPropGet(SourceTextModule, "error", this, 1);
    }
  }, {
    key: "hasAsyncGraph",
    value: function hasAsyncGraph() {
      validateThisInternalField(this, kWrap, 'SourceTextModule');
      if (this[kWrap].getStatus() < kInstantiated) {
        throw new ERR_VM_MODULE_STATUS('must be instantiated');
      }
      return this[kWrap].hasAsyncGraph;
    }
  }, {
    key: "hasTopLevelAwait",
    value: function hasTopLevelAwait() {
      validateThisInternalField(this, kWrap, 'SourceTextModule');
      return this[kWrap].hasTopLevelAwait;
    }
  }, {
    key: "createCachedData",
    value: function createCachedData() {
      var {
        status
      } = this;
      if (status === 'evaluating' || status === 'evaluated' || status === 'errored') {
        throw new ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA();
      }
      return this[kWrap].createCachedData();
    }
  }]);
}(Module);
var SyntheticModule = /*#__PURE__*/function (_Module2) {
  function SyntheticModule(exportNames, evaluateCallback) {
    var _this4;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
    _classCallCheck(this, SyntheticModule);
    if (!ArrayIsArray(exportNames) || ArrayPrototypeSome(exportNames, e => typeof e !== 'string')) {
      throw new ERR_INVALID_ARG_TYPE('exportNames', 'Array of unique strings', exportNames);
    } else {
      ArrayPrototypeForEach(exportNames, (name, i) => {
        if (ArrayPrototypeIndexOf(exportNames, name, i + 1) !== -1) {
          throw new ERR_INVALID_ARG_VALUE(`exportNames.${name}`, name, 'is duplicated');
        }
      });
    }
    validateFunction(evaluateCallback, 'evaluateCallback');
    validateObject(options, 'options');
    var {
      context,
      identifier
    } = options;
    _this4 = _callSuper(this, SyntheticModule, [{
      syntheticExportNames: exportNames,
      syntheticEvaluationSteps: evaluateCallback,
      context,
      identifier
    }]);
    // A synthetic module does not have dependencies.
    _this4[kWrap].instantiate();
    return _this4;
  }
  _inherits(SyntheticModule, _Module2);
  return _createClass(SyntheticModule, [{
    key: "link",
    value: function link() {
      validateThisInternalField(this, kWrap, 'SyntheticModule');
      // No-op for synthetic modules
      // Do not invoke super.link() as it will throw an error.
    }
  }, {
    key: "setExport",
    value: function setExport(name, value) {
      validateThisInternalField(this, kWrap, 'SyntheticModule');
      validateString(name, 'name');
      if (this[kWrap].getStatus() < kInstantiated) {
        throw new ERR_VM_MODULE_STATUS('must be linked');
      }
      this[kWrap].setExport(name, value);
    }
  }]);
}(Module);
/**
 * @callback ImportModuleDynamicallyCallback
 * @param {string} specifier
 * @param {ModuleWrap|ContextifyScript|Function|vm.Module} callbackReferrer
 * @param {Record<string, string>} attributes
 * @param {number} phase
 * @returns { Promise<void> }
 */
/**
 * @param {import('internal/vm').VmImportModuleDynamicallyCallback} importModuleDynamically
 * @returns {ImportModuleDynamicallyCallback}
 */
function importModuleDynamicallyWrap(importModuleDynamically) {
  var _this5 = this;
  var importModuleDynamicallyWrapper = _async(function (specifier, referrer, attributes, phase) {
    var phaseName = phaseEnumToPhaseName(phase);
    return _await(FunctionPrototypeCall(importModuleDynamically, _this5, specifier, referrer, attributes, phaseName), function (m) {
      if (isModuleNamespaceObject(m)) {
        if (phase === kSourcePhase) throw new ERR_VM_MODULE_NOT_MODULE();
        return m;
      }
      if (!isModule(m)) {
        throw new ERR_VM_MODULE_NOT_MODULE();
      }
      if (m.status === 'errored') {
        throw m.error;
      }
      return phase === kSourcePhase ? m[kWrap].getModuleSourceObject() : m.namespace;
    });
  });
  return importModuleDynamicallyWrapper;
}
module.exports = {
  Module,
  SourceTextModule,
  SyntheticModule,
  importModuleDynamicallyWrap
};

