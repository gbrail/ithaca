'use strict';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _checkInRHS(e) { if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (null !== e ? typeof e : "null")); return e; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Error,
  ErrorPrototype,
  NumberIsFinite,
  NumberIsNaN,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  RangeError,
  SafeMap,
  SafeSet,
  SafeWeakMap,
  SymbolToStringTag,
  TypeError: _TypeError
} = primordials;
var {
  transfer_mode_private_symbol
} = privateSymbols;
var {
  messaging_clone_symbol,
  messaging_deserialize_symbol
} = perIsolateSymbols;

/**
 * Maps to BaseObject::TransferMode::kCloneable
 */
var kCloneable = 2;
function throwInvalidThisError(Base, type) {
  var err = new Base();
  var key = 'ERR_INVALID_THIS';
  ObjectDefineProperties(err, {
    message: {
      __proto__: null,
      value: `Value of "this" must be of ${type}`,
      enumerable: false,
      writable: true,
      configurable: true
    },
    toString: {
      __proto__: null,
      value() {
        return `${this.name} [${key}]: ${this.message}`;
      },
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  err.code = key;
  throw err;
}
var internalsMap = new SafeWeakMap();
var nameToCodeMap = new SafeMap();

// These were removed from the error names table.
// See https://github.com/heycam/webidl/pull/946.
var disusedNamesSet = new SafeSet().add('DOMStringSizeError').add('NoDataAllowedError').add('ValidationError');

// The DOMException WebIDL interface defines that:
// - ObjectGetPrototypeOf(DOMException) === Function.
// - ObjectGetPrototypeOf(DOMException.prototype) === Error.prototype.
// Thus, we can not simply use the pattern of `class DOMException extends Error` and call
// `super()` to construct an object. The `super` in `super()` call in the constructor will
// be resolved to `Function`, instead of `Error`. Use the trick of return overriding to
// create an object with the `[[ErrorData]]` internal slot.
// Ref: https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-getsuperconstructor
var DOMException = /*#__PURE__*/function () {
  function DOMException() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Error';
    _classCallCheck(this, DOMException);
    // Invokes the Error constructor to create an object with the [[ErrorData]]
    // internal slot.
    // eslint-disable-next-line no-restricted-syntax
    var self = new Error();
    // Use `new.target.prototype` to support DOMException subclasses.
    ObjectSetPrototypeOf(self, new.target.prototype);
    self[transfer_mode_private_symbol] = kCloneable;
    if (options && typeof options === 'object') {
      var {
        name
      } = options;
      internalsMap.set(self, {
        message: `${message}`,
        name: `${name}`
      });
      if ('cause' in options) {
        ObjectDefineProperty(self, 'cause', {
          __proto__: null,
          value: options.cause,
          configurable: true,
          writable: true,
          enumerable: false
        });
      }
    } else {
      internalsMap.set(self, {
        message: `${message}`,
        name: `${options}`
      });
    }
    // Return the error object as the return overriding of the constructor.
    // eslint-disable-next-line no-constructor-return
    return self;
  }
  return _createClass(DOMException, [{
    key: messaging_clone_symbol,
    value: function () {
      // See serialization steps in https://webidl.spec.whatwg.org/#dom-domexception-domexception
      var internals = internalsMap.get(this);
      return {
        data: {
          message: internals.message,
          name: internals.name,
          stack: this.stack
        },
        deserializeInfo: 'internal/worker/clone_dom_exception:DOMException'
      };
    }
  }, {
    key: messaging_deserialize_symbol,
    value: function (data) {
      // See deserialization steps in https://webidl.spec.whatwg.org/#dom-domexception-domexception
      internalsMap.set(this, {
        message: data.message,
        name: data.name
      });
      this.stack = data.stack;
    }
  }, {
    key: "name",
    get: function () {
      var internals = internalsMap.get(this);
      if (internals === undefined) {
        throwInvalidThisError(_TypeError, 'DOMException');
      }
      return internals.name;
    }
  }, {
    key: "message",
    get: function () {
      var internals = internalsMap.get(this);
      if (internals === undefined) {
        throwInvalidThisError(_TypeError, 'DOMException');
      }
      return internals.message;
    }
  }, {
    key: "code",
    get: function () {
      var internals = internalsMap.get(this);
      if (internals === undefined) {
        throwInvalidThisError(_TypeError, 'DOMException');
      }
      if (disusedNamesSet.has(internals.name)) {
        return 0;
      }
      var code = nameToCodeMap.get(internals.name);
      return code === undefined ? 0 : code;
    }
  }]);
}();
var DOMExceptionPrototype = DOMException.prototype;
ObjectSetPrototypeOf(DOMExceptionPrototype, ErrorPrototype);
ObjectDefineProperties(DOMExceptionPrototype, {
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'DOMException'
  },
  name: {
    __proto__: null,
    enumerable: true,
    configurable: true
  },
  message: {
    __proto__: null,
    enumerable: true,
    configurable: true
  },
  code: {
    __proto__: null,
    enumerable: true,
    configurable: true
  }
});
for (var {
  0: name,
  1: codeName,
  2: value
} of [['IndexSizeError', 'INDEX_SIZE_ERR', 1], ['DOMStringSizeError', 'DOMSTRING_SIZE_ERR', 2], ['HierarchyRequestError', 'HIERARCHY_REQUEST_ERR', 3], ['WrongDocumentError', 'WRONG_DOCUMENT_ERR', 4], ['InvalidCharacterError', 'INVALID_CHARACTER_ERR', 5], ['NoDataAllowedError', 'NO_DATA_ALLOWED_ERR', 6], ['NoModificationAllowedError', 'NO_MODIFICATION_ALLOWED_ERR', 7], ['NotFoundError', 'NOT_FOUND_ERR', 8], ['NotSupportedError', 'NOT_SUPPORTED_ERR', 9], ['InUseAttributeError', 'INUSE_ATTRIBUTE_ERR', 10], ['InvalidStateError', 'INVALID_STATE_ERR', 11], ['SyntaxError', 'SYNTAX_ERR', 12], ['InvalidModificationError', 'INVALID_MODIFICATION_ERR', 13], ['NamespaceError', 'NAMESPACE_ERR', 14], ['InvalidAccessError', 'INVALID_ACCESS_ERR', 15], ['ValidationError', 'VALIDATION_ERR', 16], ['TypeMismatchError', 'TYPE_MISMATCH_ERR', 17], ['SecurityError', 'SECURITY_ERR', 18], ['NetworkError', 'NETWORK_ERR', 19], ['AbortError', 'ABORT_ERR', 20], ['URLMismatchError', 'URL_MISMATCH_ERR', 21], ['QuotaExceededError', 'QUOTA_EXCEEDED_ERR', 22], ['TimeoutError', 'TIMEOUT_ERR', 23], ['InvalidNodeTypeError', 'INVALID_NODE_TYPE_ERR', 24], ['DataCloneError', 'DATA_CLONE_ERR', 25]
// There are some more error names, but since they don't have codes assigned,
// we don't need to care about them.
]) {
  var desc = {
    enumerable: true,
    value
  };
  ObjectDefineProperty(DOMException, codeName, desc);
  ObjectDefineProperty(DOMExceptionPrototype, codeName, desc);
  nameToCodeMap.set(name, value);
}
exports.DOMException = DOMException;

// https://webidl.spec.whatwg.org/#quotaexceedederror
var _quota = /*#__PURE__*/new WeakMap();
var _requested = /*#__PURE__*/new WeakMap();
var QuotaExceededError = /*#__PURE__*/function (_DOMException) {
  function QuotaExceededError() {
    var _this;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      __proto__: null
    };
    _classCallCheck(this, QuotaExceededError);
    _this = _callSuper(this, QuotaExceededError, [message, 'QuotaExceededError']);
    _classPrivateFieldInitSpec(_this, _quota, void 0);
    _classPrivateFieldInitSpec(_this, _requested, void 0);
    _this[transfer_mode_private_symbol] = kCloneable;
    var quota = null;
    var requested = null;
    if (options !== null && options !== undefined) {
      if ('quota' in options) {
        quota = +options.quota;
        if (!NumberIsFinite(quota)) {
          // eslint-disable-next-line no-restricted-syntax
          throw new _TypeError(`Cannot convert options.quota to a double: the value is ${NumberIsNaN(quota) ? 'NaN' : 'Infinity'}`);
        }
        if (quota < 0) {
          // eslint-disable-next-line no-restricted-syntax
          throw new RangeError('options.quota must not be negative');
        }
      }
      if ('requested' in options) {
        requested = +options.requested;
        if (!NumberIsFinite(requested)) {
          // eslint-disable-next-line no-restricted-syntax
          throw new _TypeError(`Cannot convert options.requested to a double: the value is ${NumberIsNaN(requested) ? 'NaN' : 'Infinity'}`);
        }
        if (requested < 0) {
          // eslint-disable-next-line no-restricted-syntax
          throw new RangeError('options.requested must not be negative');
        }
      }
    }
    if (quota !== null && requested !== null && requested < quota) {
      // eslint-disable-next-line no-restricted-syntax
      throw new RangeError('options.requested must not be less than options.quota');
    }
    _classPrivateFieldSet(_quota, _this, quota);
    _classPrivateFieldSet(_requested, _this, requested);
    return _this;
  }
  _inherits(QuotaExceededError, _DOMException);
  return _createClass(QuotaExceededError, [{
    key: messaging_clone_symbol,
    value: function () {
      var domExceptionClone = DOMExceptionPrototype[messaging_clone_symbol].call(this);
      domExceptionClone.data.quota = _classPrivateFieldGet(_quota, this);
      domExceptionClone.data.requested = _classPrivateFieldGet(_requested, this);
      domExceptionClone.deserializeInfo = 'internal/worker/clone_dom_exception:QuotaExceededError';
      return domExceptionClone;
    }
  }, {
    key: messaging_deserialize_symbol,
    value: function (data) {
      DOMExceptionPrototype[messaging_deserialize_symbol].call(this, data);
      _classPrivateFieldSet(_quota, this, data.quota);
      _classPrivateFieldSet(_requested, this, data.requested);
    }
  }, {
    key: "quota",
    get: function () {
      if (!_quota.has(_checkInRHS(this))) {
        throwInvalidThisError(_TypeError, 'QuotaExceededError');
      }
      return _classPrivateFieldGet(_quota, this);
    }
  }, {
    key: "requested",
    get: function () {
      if (!_requested.has(_checkInRHS(this))) {
        throwInvalidThisError(_TypeError, 'QuotaExceededError');
      }
      return _classPrivateFieldGet(_requested, this);
    }
  }]);
}(DOMException);
ObjectDefineProperties(QuotaExceededError.prototype, {
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'QuotaExceededError'
  },
  quota: {
    __proto__: null,
    enumerable: true,
    configurable: true
  },
  requested: {
    __proto__: null,
    enumerable: true,
    configurable: true
  }
});
exports.QuotaExceededError = QuotaExceededError;

