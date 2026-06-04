'use strict';

function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
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
  ArrayPrototypeFilter,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  Error,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  ObjectAssign,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetPrototypeOf,
  ObjectKeys,
  Proxy,
  ReflectApply,
  ReflectConstruct,
  ReflectGet,
  SafeMap,
  StringPrototypeSlice,
  StringPrototypeStartsWith
} = primordials;
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE
  }
} = require('internal/errors');
var esmLoader = require('internal/modules/esm/loader');
var {
  getOptionValue
} = require('internal/options');
var {
  fileURLToPath,
  isURL,
  pathToFileURL,
  URLParse
} = require('internal/url');
var {
  deprecateProperty,
  emitExperimentalWarning,
  getStructuredStack,
  kEmptyObject
} = require('internal/util');
var debug = require('internal/util/debuglog').debuglog('test_runner', fn => {
  debug = fn;
});
var {
  validateBoolean,
  validateFunction,
  validateInteger,
  validateObject,
  validateOneOf
} = require('internal/validators');
var {
  MockTimers
} = require('internal/test_runner/mock/mock_timers');
var {
  Module
} = require('internal/modules/cjs/loader');
var {
  _load,
  _nodeModulePaths,
  _resolveFilename,
  isBuiltin
} = Module;
function kDefaultFunction() {}
var enableModuleMocking = getOptionValue('--experimental-test-module-mocks');
var kSupportedFormats = ['builtin', 'commonjs-typescript', 'commonjs', 'json', 'module-typescript', 'module'];
var sharedModuleState;
var deprecateNamedExports = deprecateProperty('namedExports', 'mock.module(): options.namedExports is deprecated. Use options.exports instead.');
var deprecateDefaultExport = deprecateProperty('defaultExport', 'mock.module(): options.defaultExport is deprecated. Use options.exports.default instead.');
var {
  hooks: mockHooks,
  mocks,
  constants: {
    kBadExportsMessage,
    kMockSearchParam
  }
} = require('internal/test_runner/mock/loader');
var _calls = /*#__PURE__*/new WeakMap();
var _mocks = /*#__PURE__*/new WeakMap();
var _implementation = /*#__PURE__*/new WeakMap();
var _restore = /*#__PURE__*/new WeakMap();
var _times = /*#__PURE__*/new WeakMap();
var MockFunctionContext = /*#__PURE__*/function () {
  function MockFunctionContext(implementation, restore, times) {
    _classCallCheck(this, MockFunctionContext);
    _classPrivateFieldInitSpec(this, _calls, void 0);
    _classPrivateFieldInitSpec(this, _mocks, void 0);
    _classPrivateFieldInitSpec(this, _implementation, void 0);
    _classPrivateFieldInitSpec(this, _restore, void 0);
    _classPrivateFieldInitSpec(this, _times, void 0);
    _classPrivateFieldSet(_calls, this, []);
    _classPrivateFieldSet(_mocks, this, new SafeMap());
    _classPrivateFieldSet(_implementation, this, implementation);
    _classPrivateFieldSet(_restore, this, restore);
    _classPrivateFieldSet(_times, this, times);
  }

  /**
   * Gets an array of recorded calls made to the mock function.
   * @returns {Array} An array of recorded calls.
   */
  return _createClass(MockFunctionContext, [{
    key: "calls",
    get: function () {
      return ArrayPrototypeSlice(_classPrivateFieldGet(_calls, this), 0);
    }

    /**
     * Retrieves the number of times the mock function has been called.
     * @returns {number} The call count.
     */
  }, {
    key: "callCount",
    value: function callCount() {
      return _classPrivateFieldGet(_calls, this).length;
    }

    /**
     * Sets a new implementation for the mock function.
     * @param {Function} implementation - The new implementation for the mock function.
     */
  }, {
    key: "mockImplementation",
    value: function mockImplementation(implementation) {
      validateFunction(implementation, 'implementation');
      _classPrivateFieldSet(_implementation, this, implementation);
    }

    /**
     * Replaces the implementation of the function only once.
     * @param {Function} implementation - The substitute function.
     * @param {number} [onCall] - The call index to be replaced.
     */
  }, {
    key: "mockImplementationOnce",
    value: function mockImplementationOnce(implementation, onCall) {
      validateFunction(implementation, 'implementation');
      var nextCall = _classPrivateFieldGet(_calls, this).length;
      var call = onCall ?? nextCall;
      validateInteger(call, 'onCall', nextCall);
      _classPrivateFieldGet(_mocks, this).set(call, implementation);
    }

    /**
     * Restores the original function that was mocked.
     */
  }, {
    key: "restore",
    value: function restore() {
      var {
        descriptor,
        object,
        original,
        methodName
      } = _classPrivateFieldGet(_restore, this);
      if (typeof methodName === 'string') {
        // This is an object method spy.
        ObjectDefineProperty(object, methodName, descriptor);
      } else {
        // This is a bare function spy. There isn't much to do here but make
        // the mock call the original function.
        _classPrivateFieldSet(_implementation, this, original);
      }
    }

    /**
     * Resets the recorded calls to the mock function
     */
  }, {
    key: "resetCalls",
    value: function resetCalls() {
      _classPrivateFieldSet(_calls, this, []);
    }

    /**
     * Tracks a call made to the mock function.
     * @param {object} call - The call details.
     */
  }, {
    key: "trackCall",
    value: function trackCall(call) {
      ArrayPrototypePush(_classPrivateFieldGet(_calls, this), call);
    }

    /**
     * Gets the next implementation to use for the mock function.
     * @returns {Function} The next implementation.
     */
  }, {
    key: "nextImpl",
    value: function nextImpl() {
      var nextCall = _classPrivateFieldGet(_calls, this).length;
      var mock = _classPrivateFieldGet(_mocks, this).get(nextCall);
      var impl = mock ?? _classPrivateFieldGet(_implementation, this);
      if (nextCall + 1 === _classPrivateFieldGet(_times, this)) {
        this.restore();
      }
      _classPrivateFieldGet(_mocks, this).delete(nextCall);
      return impl;
    }
  }]);
}();
var {
  nextImpl,
  restore: restoreFn,
  trackCall
} = MockFunctionContext.prototype;
delete MockFunctionContext.prototype.trackCall;
delete MockFunctionContext.prototype.nextImpl;
var _restore2 = /*#__PURE__*/new WeakMap();
var _sharedState = /*#__PURE__*/new WeakMap();
var MockModuleContext = /*#__PURE__*/function () {
  function MockModuleContext(_ref) {
    var {
      baseURL,
      cache,
      caller,
      format,
      fullPath,
      moduleExports,
      sharedState,
      specifier
    } = _ref;
    _classCallCheck(this, MockModuleContext);
    _classPrivateFieldInitSpec(this, _restore2, void 0);
    _classPrivateFieldInitSpec(this, _sharedState, void 0);
    var config = {
      __proto__: null,
      cache,
      moduleExports,
      caller
    };
    sharedState.mockMap.set(baseURL, config);
    sharedState.mockMap.set(fullPath, config);
    _classPrivateFieldSet(_sharedState, this, sharedState);
    _classPrivateFieldSet(_restore2, this, {
      __proto__: null,
      baseURL,
      cached: fullPath in Module._cache,
      format,
      fullPath,
      value: Module._cache[fullPath]
    });
    var mock = mocks.get(baseURL);
    if (mock?.active) {
      debug('already mocking "%s"', baseURL);
      throw new ERR_INVALID_STATE(`Cannot mock '${specifier}'. The module is already mocked.`);
    } else {
      var localVersion = mock?.localVersion ?? 0;
      debug('new mock version %d for "%s"', localVersion, baseURL);
      mocks.set(baseURL, {
        __proto__: null,
        url: baseURL,
        cache,
        exportNames: ArrayPrototypeFilter(ObjectKeys(moduleExports), k => k !== 'default'),
        hasDefaultExport: 'default' in moduleExports,
        format,
        localVersion,
        active: true
      });
    }
    delete Module._cache[fullPath];
    sharedState.mockExports.set(baseURL, {
      __proto__: null,
      moduleExports
    });
  }
  return _createClass(MockModuleContext, [{
    key: "restore",
    value: function restore() {
      if (_classPrivateFieldGet(_restore2, this) === undefined) {
        return;
      }

      // Delete the mock CJS cache entry. If the module was previously in the
      // cache then restore the old value.
      delete Module._cache[_classPrivateFieldGet(_restore2, this).fullPath];
      if (_classPrivateFieldGet(_restore2, this).cached) {
        Module._cache[_classPrivateFieldGet(_restore2, this).fullPath] = _classPrivateFieldGet(_restore2, this).value;
      }
      var mock = mocks.get(_classPrivateFieldGet(_restore2, this).baseURL);
      if (mock !== undefined) {
        mock.active = false;
        mock.localVersion++;
      }
      _classPrivateFieldGet(_sharedState, this).mockMap.delete(_classPrivateFieldGet(_restore2, this).baseURL);
      _classPrivateFieldGet(_sharedState, this).mockMap.delete(_classPrivateFieldGet(_restore2, this).fullPath);
      _classPrivateFieldSet(_restore2, this, undefined);
    }
  }]);
}();
var {
  restore: restoreModule
} = MockModuleContext.prototype;
var _object = /*#__PURE__*/new WeakMap();
var _propertyName = /*#__PURE__*/new WeakMap();
var _value = /*#__PURE__*/new WeakMap();
var _originalValue = /*#__PURE__*/new WeakMap();
var _descriptor = /*#__PURE__*/new WeakMap();
var _accesses = /*#__PURE__*/new WeakMap();
var _onceValues = /*#__PURE__*/new WeakMap();
var _MockPropertyContext_brand = /*#__PURE__*/new WeakSet();
var MockPropertyContext = /*#__PURE__*/function () {
  function MockPropertyContext(object, propertyName, _value2) {
    _classCallCheck(this, MockPropertyContext);
    _classPrivateMethodInitSpec(this, _MockPropertyContext_brand);
    _classPrivateFieldInitSpec(this, _object, void 0);
    _classPrivateFieldInitSpec(this, _propertyName, void 0);
    _classPrivateFieldInitSpec(this, _value, void 0);
    _classPrivateFieldInitSpec(this, _originalValue, void 0);
    _classPrivateFieldInitSpec(this, _descriptor, void 0);
    _classPrivateFieldInitSpec(this, _accesses, void 0);
    _classPrivateFieldInitSpec(this, _onceValues, void 0);
    _classPrivateFieldSet(_onceValues, this, new SafeMap());
    _classPrivateFieldSet(_accesses, this, []);
    _classPrivateFieldSet(_object, this, object);
    _classPrivateFieldSet(_propertyName, this, propertyName);
    _classPrivateFieldSet(_originalValue, this, object[propertyName]);
    _classPrivateFieldSet(_value, this, arguments.length > 2 ? _value2 : _classPrivateFieldGet(_originalValue, this));
    _classPrivateFieldSet(_descriptor, this, ObjectGetOwnPropertyDescriptor(object, propertyName));
    if (!_classPrivateFieldGet(_descriptor, this)) {
      throw new ERR_INVALID_ARG_VALUE('propertyName', propertyName, 'is not a property of the object');
    }
    var {
      configurable,
      enumerable
    } = _classPrivateFieldGet(_descriptor, this);
    ObjectDefineProperty(object, propertyName, {
      __proto__: null,
      configurable,
      enumerable,
      get: () => {
        var nextValue = _assertClassBrand(_MockPropertyContext_brand, this, _getAccessValue).call(this, _classPrivateFieldGet(_value, this));
        var access = {
          __proto__: null,
          type: 'get',
          value: nextValue,
          // eslint-disable-next-line no-restricted-syntax
          stack: new Error()
        };
        ArrayPrototypePush(_classPrivateFieldGet(_accesses, this), access);
        return nextValue;
      },
      set: this.mockImplementation.bind(this)
    });
  }

  /**
   * Gets an array of recorded accesses (get/set) to the property.
   * @returns {Array} An array of access records.
   */
  return _createClass(MockPropertyContext, [{
    key: "accesses",
    get: function () {
      return ArrayPrototypeSlice(_classPrivateFieldGet(_accesses, this), 0);
    }

    /**
     * Retrieves the number of times the property was accessed (get or set).
     * @returns {number} The total number of accesses.
     */
  }, {
    key: "accessCount",
    value: function accessCount() {
      return _classPrivateFieldGet(_accesses, this).length;
    }

    /**
     * Sets a new value for the property.
     * @param {any} value - The new value to be set.
     * @throws {Error} If the property is not writable.
     */
  }, {
    key: "mockImplementation",
    value: function mockImplementation(value) {
      if (!_classPrivateFieldGet(_descriptor, this).writable) {
        throw new ERR_INVALID_ARG_VALUE('propertyName', _classPrivateFieldGet(_propertyName, this), 'cannot be set');
      }
      var nextValue = _assertClassBrand(_MockPropertyContext_brand, this, _getAccessValue).call(this, value);
      var access = {
        __proto__: null,
        type: 'set',
        value: nextValue,
        // eslint-disable-next-line no-restricted-syntax
        stack: new Error()
      };
      ArrayPrototypePush(_classPrivateFieldGet(_accesses, this), access);
      _classPrivateFieldSet(_value, this, nextValue);
    }
  }, {
    key: "mockImplementationOnce",
    value:
    /**
     * Sets a value to be used only for the next access (get or set), or a specific access index.
     * @param {any} value - The value to be used once.
     * @param {number} [onAccess] - The access index to be replaced.
     */
    function mockImplementationOnce(value, onAccess) {
      var nextAccess = _classPrivateFieldGet(_accesses, this).length;
      var accessIndex = onAccess ?? nextAccess;
      validateInteger(accessIndex, 'onAccess', nextAccess);
      _classPrivateFieldGet(_onceValues, this).set(accessIndex, value);
    }

    /**
     * Resets the recorded accesses to the property.
     */
  }, {
    key: "resetAccesses",
    value: function resetAccesses() {
      _classPrivateFieldSet(_accesses, this, []);
    }

    /**
     * Restores the original value of the property that was mocked.
     */
  }, {
    key: "restore",
    value: function restore() {
      ObjectDefineProperty(_classPrivateFieldGet(_object, this), _classPrivateFieldGet(_propertyName, this), _objectSpread(_objectSpread({
        __proto__: null
      }, _classPrivateFieldGet(_descriptor, this)), {}, {
        value: _classPrivateFieldGet(_originalValue, this)
      }));
    }
  }]);
}();
function _getAccessValue(value) {
  var accessIndex = _classPrivateFieldGet(_accesses, this).length;
  var accessValue;
  if (_classPrivateFieldGet(_onceValues, this).has(accessIndex)) {
    accessValue = _classPrivateFieldGet(_onceValues, this).get(accessIndex);
    _classPrivateFieldGet(_onceValues, this).delete(accessIndex);
  } else {
    accessValue = value;
  }
  return accessValue;
}
var {
  restore: restoreProperty
} = MockPropertyContext.prototype;
var _mocks2 = /*#__PURE__*/new WeakMap();
var _timers = /*#__PURE__*/new WeakMap();
var _MockTracker_brand = /*#__PURE__*/new WeakSet();
var MockTracker = /*#__PURE__*/function () {
  function MockTracker() {
    _classCallCheck(this, MockTracker);
    _classPrivateMethodInitSpec(this, _MockTracker_brand);
    _classPrivateFieldInitSpec(this, _mocks2, []);
    _classPrivateFieldInitSpec(this, _timers, void 0);
  }
  return _createClass(MockTracker, [{
    key: "timers",
    get:
    /**
     * Returns the mock timers of this MockTracker instance.
     * @returns {MockTimers} The mock timers instance.
     */
    function () {
      _classPrivateFieldGet(_timers, this) ?? _classPrivateFieldSet(_timers, this, new MockTimers());
      return _classPrivateFieldGet(_timers, this);
    }

    /**
     * Creates a mock function tracker.
     * @param {Function} [original] - The original function to be tracked.
     * @param {Function} [implementation] - An optional replacement function for the original one.
     * @param {object} [options] - Additional tracking options.
     * @param {number} [options.times] - The maximum number of times the mock function can be called.
     * @returns {ProxyConstructor} The mock function tracker.
     */
  }, {
    key: "fn",
    value: function fn() {
      var original = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var implementation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : original;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
      if (original !== null && typeof original === 'object') {
        options = original;
        original = function () {};
        implementation = original;
      } else if (implementation !== null && typeof implementation === 'object') {
        options = implementation;
        implementation = original;
      }
      validateFunction(original, 'original');
      validateFunction(implementation, 'implementation');
      validateObject(options, 'options');
      var {
        times = Infinity
      } = options;
      validateTimes(times, 'options.times');
      var ctx = new MockFunctionContext(implementation, {
        __proto__: null,
        original
      }, times);
      return _assertClassBrand(_MockTracker_brand, this, _setupMock).call(this, ctx, original);
    }

    /**
     * Creates a method tracker for a specified object or function.
     * @param {(object | Function)} objectOrFunction - The object or function containing the method to be tracked.
     * @param {string} methodName - The name of the method to be tracked.
     * @param {Function} [implementation] - An optional replacement function for the original method.
     * @param {object} [options] - Additional tracking options.
     * @param {boolean} [options.getter] - Indicates whether this is a getter method.
     * @param {boolean} [options.setter] - Indicates whether this is a setter method.
     * @param {number} [options.times] - The maximum number of times the mock method can be called.
     * @returns {ProxyConstructor} The mock method tracker.
     */
  }, {
    key: "method",
    value: function method(objectOrFunction, methodName) {
      var implementation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kDefaultFunction;
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : kEmptyObject;
      validateStringOrSymbol(methodName, 'methodName');
      if (typeof objectOrFunction !== 'function') {
        validateObject(objectOrFunction, 'object');
      }
      if (implementation !== null && typeof implementation === 'object') {
        options = implementation;
        implementation = kDefaultFunction;
      }
      validateFunction(implementation, 'implementation');
      validateObject(options, 'options');
      var {
        getter = false,
        setter = false,
        times = Infinity
      } = options;
      validateBoolean(getter, 'options.getter');
      validateBoolean(setter, 'options.setter');
      validateTimes(times, 'options.times');
      if (setter && getter) {
        throw new ERR_INVALID_ARG_VALUE('options.setter', setter, "cannot be used with 'options.getter'");
      }
      var descriptor = findMethodOnPrototypeChain(objectOrFunction, methodName);
      var original;
      if (getter) {
        original = descriptor?.get;
      } else if (setter) {
        original = descriptor?.set;
      } else {
        original = descriptor?.value;
      }
      if (typeof original !== 'function') {
        throw new ERR_INVALID_ARG_VALUE('methodName', original, 'must be a method');
      }
      var restore = {
        __proto__: null,
        descriptor,
        object: objectOrFunction,
        methodName
      };
      var impl = implementation === kDefaultFunction ? original : implementation;
      var ctx = new MockFunctionContext(impl, restore, times);
      var mock = _assertClassBrand(_MockTracker_brand, this, _setupMock).call(this, ctx, original);
      var mockDescriptor = {
        __proto__: null,
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable
      };
      if (getter) {
        mockDescriptor.get = mock;
        mockDescriptor.set = descriptor.set;
      } else if (setter) {
        mockDescriptor.get = descriptor.get;
        mockDescriptor.set = mock;
      } else {
        mockDescriptor.writable = descriptor.writable;
        mockDescriptor.value = mock;
      }
      ObjectDefineProperty(objectOrFunction, methodName, mockDescriptor);
      return mock;
    }

    /**
     * Mocks a getter method of an object.
     * This is a syntax sugar for the MockTracker.method with options.getter set to true
     * @param {object} object - The target object.
     * @param {string} methodName - The name of the getter method to be mocked.
     * @param {Function} [implementation] - An optional replacement function for the targeted method.
     * @param {object} [options] - Additional tracking options.
     * @param {boolean} [options.getter] - Indicates whether this is a getter method.
     * @param {boolean} [options.setter] - Indicates whether this is a setter method.
     * @param {number} [options.times] - The maximum number of times the mock method can be called.
     * @returns {ProxyConstructor} The mock method tracker.
     */
  }, {
    key: "getter",
    value: function getter(object, methodName) {
      var implementation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kDefaultFunction;
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : kEmptyObject;
      if (implementation !== null && typeof implementation === 'object') {
        options = implementation;
        implementation = kDefaultFunction;
      } else {
        validateObject(options, 'options');
      }
      var {
        getter = true
      } = options;
      if (getter === false) {
        throw new ERR_INVALID_ARG_VALUE('options.getter', getter, 'cannot be false');
      }
      return this.method(object, methodName, implementation, _objectSpread(_objectSpread({
        __proto__: null
      }, options), {}, {
        getter
      }));
    }

    /**
     * Mocks a setter method of an object.
     * This function is a syntax sugar for MockTracker.method with options.setter set to true.
     * @param {object} object - The target object.
     * @param {string} methodName - The setter method to be mocked.
     * @param {Function} [implementation] - An optional replacement function for the targeted method.
     * @param {object} [options] - Additional tracking options.
     * @param {boolean} [options.getter] - Indicates whether this is a getter method.
     * @param {boolean} [options.setter] - Indicates whether this is a setter method.
     * @param {number} [options.times] - The maximum number of times the mock method can be called.
     * @returns {ProxyConstructor} The mock method tracker.
     */
  }, {
    key: "setter",
    value: function setter(object, methodName) {
      var implementation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kDefaultFunction;
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : kEmptyObject;
      if (implementation !== null && typeof implementation === 'object') {
        options = implementation;
        implementation = kDefaultFunction;
      } else {
        validateObject(options, 'options');
      }
      var {
        setter = true
      } = options;
      if (setter === false) {
        throw new ERR_INVALID_ARG_VALUE('options.setter', setter, 'cannot be false');
      }
      return this.method(object, methodName, implementation, _objectSpread(_objectSpread({
        __proto__: null
      }, options), {}, {
        setter
      }));
    }
  }, {
    key: "module",
    value: function module(specifier) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      emitExperimentalWarning('Module mocking');
      if (typeof specifier !== 'string') {
        if (!isURL(specifier)) throw new ERR_INVALID_ARG_TYPE('specifier', ['string', 'URL'], specifier);
        specifier = `${specifier}`;
      }
      validateObject(options, 'options');
      debug('module mock entry, specifier = "%s", options = %o', specifier, options);
      var {
        cache,
        moduleExports
      } = normalizeModuleMockOptions(options);
      var sharedState = setupSharedModuleState();
      var mockSpecifier = StringPrototypeStartsWith(specifier, 'node:') ? StringPrototypeSlice(specifier, 5) : specifier;

      // Get the file that called this function. We need four stack frames:
      // vm context -> getStructuredStack() -> this function -> actual caller.
      var filename = getStructuredStack()[3]?.getFileName();
      // If the caller is already a file URL, use it as is. Otherwise, convert it.
      var hasFileProtocol = StringPrototypeStartsWith(filename, 'file://');
      var caller = hasFileProtocol ? filename : pathToFileURL(filename).href;
      var request = {
        __proto__: null,
        specifier: mockSpecifier,
        attributes: kEmptyObject
      };
      var {
        format,
        url
      } = sharedState.moduleLoader.resolveSync(caller, request);
      debug('module mock, url = "%s", format = "%s", caller = "%s"', url, format, caller);
      if (format) {
        // Format is not yet known for ambiguous files when detection is enabled.
        validateOneOf(format, 'format', kSupportedFormats);
      }
      var baseURL = URLParse(url);
      if (!baseURL) {
        throw new ERR_INVALID_ARG_VALUE('specifier', specifier, 'cannot compute URL');
      }
      if (baseURL.searchParams.has(kMockSearchParam)) {
        throw new ERR_INVALID_STATE(`Cannot mock '${specifier}'. The module is already mocked.`);
      }
      var fullPath = StringPrototypeStartsWith(url, 'file://') ? fileURLToPath(url) : null;
      var ctx = new MockModuleContext({
        __proto__: null,
        baseURL: baseURL.href,
        cache,
        caller,
        format,
        fullPath,
        moduleExports,
        sharedState,
        specifier: mockSpecifier
      });
      ArrayPrototypePush(_classPrivateFieldGet(_mocks2, this), {
        __proto__: null,
        ctx,
        restore: restoreModule
      });
      return ctx;
    }

    /**
     * Creates a property tracker for a specified object.
     * @param {(object)} object - The object whose value is being tracked.
     * @param {string} propertyName - The identifier of the property on object to be tracked.
     * @param {any} value - An optional replacement value used as the mock value for object[valueName].
     * @returns {ProxyConstructor} The mock property tracker.
     */
  }, {
    key: "property",
    value: function property(object, propertyName, value) {
      validateObject(object, 'object');
      validateStringOrSymbol(propertyName, 'propertyName');
      var ctx = arguments.length > 2 ? new MockPropertyContext(object, propertyName, value) : new MockPropertyContext(object, propertyName);
      ArrayPrototypePush(_classPrivateFieldGet(_mocks2, this), {
        __proto__: null,
        ctx,
        restore: restoreProperty
      });
      return new Proxy(object, {
        __proto__: null,
        get(target, property, receiver) {
          if (property === 'mock') {
            return ctx;
          }
          return ReflectGet(target, property, receiver);
        }
      });
    }

    /**
     * Resets the mock tracker, restoring all mocks and clearing timers.
     */
  }, {
    key: "reset",
    value: function reset() {
      this.restoreAll();
      _classPrivateFieldGet(_timers, this)?.reset();
      _classPrivateFieldSet(_mocks2, this, []);
    }

    /**
     * Restore all mocks created by this MockTracker instance.
     */
  }, {
    key: "restoreAll",
    value: function restoreAll() {
      for (var i = 0; i < _classPrivateFieldGet(_mocks2, this).length; i++) {
        var {
          ctx,
          restore
        } = _classPrivateFieldGet(_mocks2, this)[i];
        FunctionPrototypeCall(restore, ctx);
      }
    }
  }]);
}();
function _setupMock(ctx, fnToMatch) {
  var mock = new Proxy(fnToMatch, {
    __proto__: null,
    apply(_fn, thisArg, argList) {
      var fn = FunctionPrototypeCall(nextImpl, ctx);
      var result;
      var error;
      try {
        result = ReflectApply(fn, thisArg, argList);
      } catch (err) {
        error = err;
        throw err;
      } finally {
        FunctionPrototypeCall(trackCall, ctx, {
          __proto__: null,
          arguments: argList,
          error,
          result,
          // eslint-disable-next-line no-restricted-syntax
          stack: new Error(),
          target: undefined,
          this: thisArg
        });
      }
      return result;
    },
    construct(target, argList, newTarget) {
      var realTarget = FunctionPrototypeCall(nextImpl, ctx);
      var result;
      var error;
      try {
        result = ReflectConstruct(realTarget, argList, newTarget);
      } catch (err) {
        error = err;
        throw err;
      } finally {
        FunctionPrototypeCall(trackCall, ctx, {
          __proto__: null,
          arguments: argList,
          error,
          result,
          // eslint-disable-next-line no-restricted-syntax
          stack: new Error(),
          target,
          this: result
        });
      }
      return result;
    },
    get(target, property, receiver) {
      if (property === 'mock') {
        return ctx;
      }
      return ReflectGet(target, property, receiver);
    }
  });
  ArrayPrototypePush(_classPrivateFieldGet(_mocks2, this), {
    __proto__: null,
    ctx,
    restore: restoreFn
  });
  return mock;
}
function normalizeModuleMockOptions(options) {
  var {
    cache = false
  } = options;
  validateBoolean(cache, 'options.cache');
  var hasExports = 'exports' in options;
  var hasNamedExports = 'namedExports' in options;
  var hasDefaultExport = 'defaultExport' in options;
  deprecateNamedExports(options);
  deprecateDefaultExport(options);
  var moduleExports = {
    __proto__: null
  };
  if (hasExports) {
    validateObject(options.exports, 'options.exports');
  }
  if (hasNamedExports) {
    validateObject(options.namedExports, 'options.namedExports');
  }
  if (hasExports && (hasNamedExports || hasDefaultExport)) {
    var reason = "cannot be used with 'options.namedExports'";
    if (hasDefaultExport) {
      reason = hasNamedExports ? "cannot be used with 'options.namedExports' or 'options.defaultExport'" : "cannot be used with 'options.defaultExport'";
    }
    throw new ERR_INVALID_ARG_VALUE('options.exports', options.exports, reason);
  }
  if (hasExports) {
    copyOwnProperties(options.exports, moduleExports);
  }
  if (hasNamedExports) {
    copyOwnProperties(options.namedExports, moduleExports);
  }
  if (hasDefaultExport) {
    ObjectDefineProperty(moduleExports, 'default', ObjectAssign({
      __proto__: null
    }, ObjectGetOwnPropertyDescriptor(options, 'defaultExport')));
  }
  return {
    __proto__: null,
    cache,
    moduleExports
  };
}
function copyOwnProperties(from, to) {
  var keys = ObjectKeys(from);
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    var descriptor = ObjectGetOwnPropertyDescriptor(from, key);
    ObjectDefineProperty(to, key, descriptor);
  }
}
function setupSharedModuleState() {
  if (sharedModuleState === undefined) {
    var {
      mock
    } = require('test');
    var mockExports = new SafeMap();
    var {
      registerHooks
    } = require('internal/modules/customization_hooks');
    var moduleLoader = esmLoader.getOrInitializeCascadedLoader();
    registerHooks(mockHooks);
    sharedModuleState = {
      __proto__: null,
      mockExports,
      mockMap: new SafeMap(),
      moduleLoader
    };
    mock._mockExports = mockExports;
    Module._load = FunctionPrototypeBind(cjsMockModuleLoad, sharedModuleState);
  }
  return sharedModuleState;
}
function cjsMockModuleLoad(request, parent, isMain) {
  // Imported mocked URLs may re-enter Module._load with the mock query attached.
  // Strip it to pass into methods that expect a normal request.
  // TODO(joyeecheung): it might be better to strip the search params from the filename in
  // the translator but that might have a bigger blast radius as other mocker might have also
  // come to rely on this to create multiple cache identities for the same module.
  try {
    var parsedRequest = URLParse(request);
    if (parsedRequest?.searchParams.has(kMockSearchParam)) {
      parsedRequest.searchParams.delete(kMockSearchParam);
      request = parsedRequest.href;
    }
  } catch {
    // Not a valid URL, treat as a normal request.
  }
  var resolved;
  if (isBuiltin(request)) {
    resolved = ensureNodeScheme(request);
  } else {
    resolved = _resolveFilename(request, parent, isMain);
  }
  var config = this.mockMap.get(resolved);
  if (config === undefined) {
    return _load(request, parent, isMain);
  }
  var {
    cache,
    caller,
    moduleExports
  } = config;
  if (cache && Module._cache[resolved]) {
    // The CJS cache entry is deleted when the mock is configured. If it has
    // been repopulated, return the exports from that entry.
    return Module._cache[resolved].exports;
  }
  var hasDefaultExport = 'default' in moduleExports;
  // eslint-disable-next-line node-core/set-proto-to-null-in-object
  var modExports = hasDefaultExport ? moduleExports.default : {};
  var exportNames = ArrayPrototypeFilter(ObjectKeys(moduleExports), k => k !== 'default');
  if ((typeof modExports !== 'object' || modExports === null) && exportNames.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(kBadExportsMessage);
  }
  for (var i = 0; i < exportNames.length; ++i) {
    var name = exportNames[i];
    var descriptor = ObjectGetOwnPropertyDescriptor(moduleExports, name);
    ObjectDefineProperty(modExports, name, descriptor);
  }
  if (cache) {
    var entry = new Module(resolved, caller);
    entry.exports = modExports;
    entry.filename = resolved;
    entry.loaded = true;
    entry.paths = _nodeModulePaths(entry.path);
    Module._cache[resolved] = entry;
  }
  return modExports;
}
function validateStringOrSymbol(value, name) {
  if (typeof value !== 'string' && typeof value !== 'symbol') {
    throw new ERR_INVALID_ARG_TYPE(name, ['string', 'symbol'], value);
  }
}
function validateTimes(value, name) {
  if (value === Infinity) {
    return;
  }
  validateInteger(value, name, 1);
}
function findMethodOnPrototypeChain(instance, methodName) {
  var host = instance;
  var descriptor;
  while (host !== null) {
    descriptor = ObjectGetOwnPropertyDescriptor(host, methodName);
    if (descriptor) {
      break;
    }
    host = ObjectGetPrototypeOf(host);
  }
  return descriptor;
}
function ensureNodeScheme(specifier) {
  if (!StringPrototypeStartsWith(specifier, 'node:')) {
    return `node:${specifier}`;
  }
  return specifier;
}
if (!enableModuleMocking) {
  delete MockTracker.prototype.module;
}
module.exports = {
  ensureNodeScheme,
  MockTracker
};

