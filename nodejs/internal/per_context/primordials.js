'use strict';

/* eslint-disable node-core/prefer-primordials */

// This file subclasses and stores the JS builtins that come from the VM
// so that Node.js's builtin modules do not need to later look these up from
// the global proxy, which can be mutated by users.

// Use of primordials have sometimes a dramatic impact on performance, please
// benchmark all changes made in performance-sensitive areas of the codebase.
// See: https://github.com/nodejs/node/pull/38248
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
  }(),
  _earlyReturn = /*#__PURE__*/{},
  _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator",
  _AsyncGenerator = /*#__PURE__*/function () {
    function _AsyncGenerator(entry) {
      this._entry = entry;
      this._pact = null;
      this._resolve = null;
      this._return = null;
      this._promise = null;
    }
    function _wrapReturnedValue(value) {
      return {
        value: value,
        done: true
      };
    }
    function _wrapYieldedValue(value) {
      return {
        value: value,
        done: false
      };
    }
    _AsyncGenerator.prototype._yield = function (value) {
      // Yield the value to the pending next call
      this._resolve(value && value.then ? value.then(_wrapYieldedValue) : _wrapYieldedValue(value));
      // Return a pact for an upcoming next/return/throw call
      return this._pact = new _Pact();
    };
    _AsyncGenerator.prototype.next = function (value) {
      // Advance the generator, starting it if it has yet to be started
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          var _entry = _this._entry;
          if (_entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the next call!
            return resolve(_this._promise);
          }
          // Start the generator
          _this._entry = null;
          _this._resolve = resolve;
          function returnValue(value) {
            _this._resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
            _this._pact = null;
            _this._resolve = null;
          }
          var result = _entry(_this);
          if (result && result.then) {
            result.then(returnValue, function (error) {
              if (error === _earlyReturn) {
                returnValue(_this._return);
              } else {
                var pact = new _Pact();
                _this._resolve(pact);
                _this._pact = null;
                _this._resolve = null;
                _resolve(pact, 2, error);
              }
            });
          } else {
            returnValue(result);
          }
        } else {
          // Generator is started and a yield expression is pending, settle it
          _this._pact = null;
          _this._resolve = resolve;
          _settle(_pact, 1, value);
        }
      });
    };
    _AsyncGenerator.prototype.return = function (value) {
      // Early return from the generator if started, otherwise abandons the generator
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the return call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return the specified value
          _this._entry = null;
          return resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
        }
        // Settle the yield expression with a rejected "early return" value
        _this._return = value;
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, _earlyReturn);
      });
    };
    _AsyncGenerator.prototype.throw = function (error) {
      // Inject an exception into the pending yield expression
      var _this = this;
      return _this._promise = new Promise(function (resolve, reject) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the throw call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return a rejected Promise containing the error
          _this._entry = null;
          return reject(error);
        }
        // Settle the yield expression with the value as a rejection
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, error);
      });
    };
    _AsyncGenerator.prototype[_asyncIteratorSymbol] = function () {
      return this;
    };
    return _AsyncGenerator;
  }();
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _callSuper(t, o, e) {
  let x = _getPrototypeOf(o);
  return _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(x, e || [], _getPrototypeOf(t).constructor) : x.apply(t, e));
}
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  defineProperty: ReflectDefineProperty,
  getOwnPropertyDescriptor: ReflectGetOwnPropertyDescriptor,
  ownKeys: ReflectOwnKeys
} = Reflect;

// `uncurryThis` is equivalent to `func => Function.prototype.call.bind(func)`.
// It is using `bind.bind(call)` to avoid using `Function.prototype.bind`
// and `Function.prototype.call` after it may have been mutated by users.
var {
  apply,
  bind,
  call
} = Function.prototype;
var uncurryThis = bind.bind(call);
primordials.uncurryThis = uncurryThis;

// `applyBind` is equivalent to `func => Function.prototype.apply.bind(func)`.
// It is using `bind.bind(apply)` to avoid using `Function.prototype.bind`
// and `Function.prototype.apply` after it may have been mutated by users.
var applyBind = bind.bind(apply);
primordials.applyBind = applyBind;

// Methods that accept a variable number of arguments, and thus it's useful to
// also create `${prefix}${key}Apply`, which uses `Function.prototype.apply`,
// instead of `Function.prototype.call`, and thus doesn't require iterator
// destructuring.
var varargsMethods = [
// 'ArrayPrototypeConcat' is omitted, because it performs the spread
// on its own for arrays and array-likes with a truthy
// @@isConcatSpreadable symbol property.
'ArrayOf', 'ArrayPrototypePush', 'ArrayPrototypeUnshift',
// 'FunctionPrototypeCall' is omitted, since there's 'ReflectApply'
// and 'FunctionPrototypeApply'.
'MathHypot', 'MathMax', 'MathMin', 'StringFromCharCode', 'StringFromCodePoint', 'StringPrototypeConcat', 'TypedArrayOf'];
function getNewKey(key) {
  return typeof key === 'symbol' ? `Symbol${key.description[7].toUpperCase()}${key.description.slice(8)}` : `${key[0].toUpperCase()}${key.slice(1)}`;
}
function copyAccessor(dest, prefix, key, _ref) {
  var {
    enumerable,
    get,
    set
  } = _ref;
  ReflectDefineProperty(dest, `${prefix}Get${key}`, {
    __proto__: null,
    value: uncurryThis(get),
    enumerable
  });
  if (set !== undefined) {
    ReflectDefineProperty(dest, `${prefix}Set${key}`, {
      __proto__: null,
      value: uncurryThis(set),
      enumerable
    });
  }
}
function copyPropsRenamed(src, dest, prefix) {
  for (var key of ReflectOwnKeys(src)) {
    var newKey = getNewKey(key);
    var desc = ReflectGetOwnPropertyDescriptor(src, key);
    if ('get' in desc) {
      copyAccessor(dest, prefix, newKey, desc);
    } else {
      var name = `${prefix}${newKey}`;
      ReflectDefineProperty(dest, name, _objectSpread({
        __proto__: null
      }, desc));
      if (varargsMethods.includes(name)) {
        ReflectDefineProperty(dest, `${name}Apply`, {
          __proto__: null,
          // `src` is bound as the `this` so that the static `this` points
          // to the object it was defined on,
          // e.g.: `ArrayOfApply` gets a `this` of `Array`:
          value: applyBind(desc.value, src)
        });
      }
    }
  }
}
function copyPropsRenamedBound(src, dest, prefix) {
  for (var key of ReflectOwnKeys(src)) {
    var newKey = getNewKey(key);
    var desc = ReflectGetOwnPropertyDescriptor(src, key);
    if ('get' in desc) {
      copyAccessor(dest, prefix, newKey, desc);
    } else {
      var {
        value
      } = desc;
      if (typeof value === 'function') {
        desc.value = value.bind(src);
      }
      var name = `${prefix}${newKey}`;
      ReflectDefineProperty(dest, name, _objectSpread({
        __proto__: null
      }, desc));
      if (varargsMethods.includes(name)) {
        ReflectDefineProperty(dest, `${name}Apply`, {
          __proto__: null,
          value: applyBind(value, src)
        });
      }
    }
  }
}
function copyPrototype(src, dest, prefix) {
  for (var key of ReflectOwnKeys(src)) {
    var newKey = getNewKey(key);
    var desc = ReflectGetOwnPropertyDescriptor(src, key);
    if ('get' in desc) {
      copyAccessor(dest, prefix, newKey, desc);
    } else {
      var {
        value
      } = desc;
      if (typeof value === 'function') {
        desc.value = uncurryThis(value);
      }
      var name = `${prefix}${newKey}`;
      ReflectDefineProperty(dest, name, _objectSpread({
        __proto__: null
      }, desc));
      if (varargsMethods.includes(name)) {
        ReflectDefineProperty(dest, `${name}Apply`, {
          __proto__: null,
          value: applyBind(value)
        });
      }
    }
  }
}

// Create copies of configurable value properties of the global object
['Proxy', 'globalThis'].forEach(name => {
  // eslint-disable-next-line no-restricted-globals
  primordials[name] = globalThis[name];
});

// Create copies of URI handling functions
[decodeURI, decodeURIComponent, encodeURI, encodeURIComponent].forEach(fn => {
  primordials[fn.name] = fn;
});

// Create copies of legacy functions
[escape, eval, unescape].forEach(fn => {
  primordials[fn.name] = fn;
});

// Create copies of the namespace objects
['Atomics', 'JSON', 'Math', 'Proxy', 'Reflect'].forEach(name => {
  // eslint-disable-next-line no-restricted-globals
  copyPropsRenamed(globalThis[name], primordials, name);
});

// Create copies of intrinsic objects
['AggregateError', 'Array', 'ArrayBuffer', 'BigInt', 'BigInt64Array', 'BigUint64Array', 'Boolean', 'DataView', 'Date', 'Error', 'EvalError', 'FinalizationRegistry', 'Float32Array', 'Float64Array', 'Function', 'Int16Array', 'Int32Array', 'Int8Array', 'Map', 'Number', 'Object', 'RangeError', 'ReferenceError', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'URIError', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'WeakMap', 'WeakRef', 'WeakSet'].forEach(name => {
  // eslint-disable-next-line no-restricted-globals
  var original = globalThis[name];
  primordials[name] = original;
  copyPropsRenamed(original, primordials, name);
  copyPrototype(original.prototype, primordials, `${name}Prototype`);
});

// Create copies of intrinsic objects that require a valid `this` to call
// static methods.
// Refs: https://www.ecma-international.org/ecma-262/#sec-promise.all
['Promise'].forEach(name => {
  // eslint-disable-next-line no-restricted-globals
  var original = globalThis[name];
  primordials[name] = original;
  copyPropsRenamedBound(original, primordials, name);
  copyPrototype(original.prototype, primordials, `${name}Prototype`);
});

// Create copies of abstract intrinsic objects that are not directly exposed
// on the global object.
// Refs: https://tc39.es/ecma262/#sec-%typedarray%-intrinsic-object
[{
  name: 'TypedArray',
  original: Reflect.getPrototypeOf(Uint8Array)
}, {
  name: 'ArrayIterator',
  original: {
    prototype: Reflect.getPrototypeOf(Array.prototype[Symbol.iterator]())
  }
}, {
  name: 'StringIterator',
  original: {
    prototype: Reflect.getPrototypeOf(String.prototype[Symbol.iterator]())
  }
}].forEach(_ref2 => {
  var {
    name,
    original
  } = _ref2;
  primordials[name] = original;
  // The static %TypedArray% methods require a valid `this`, but can't be bound,
  // as they need a subclass constructor as the receiver:
  copyPrototype(original, primordials, name);
  copyPrototype(original.prototype, primordials, `${name}Prototype`);
});
primordials.IteratorPrototype = Reflect.getPrototypeOf(primordials.ArrayIteratorPrototype);

/* eslint-enable node-core/prefer-primordials */

var {
  Array: ArrayConstructor,
  ArrayPrototypeForEach,
  ArrayPrototypeMap,
  ArrayPrototypePushApply,
  ArrayPrototypeSlice,
  FinalizationRegistry,
  FunctionPrototypeCall,
  Map,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectFreeze,
  ObjectSetPrototypeOf,
  Promise,
  PromisePrototypeThen,
  PromiseResolve,
  ReflectApply,
  ReflectConstruct,
  ReflectGet,
  ReflectSet,
  RegExp,
  RegExpPrototype,
  RegExpPrototypeExec,
  RegExpPrototypeGetDotAll,
  RegExpPrototypeGetFlags,
  RegExpPrototypeGetGlobal,
  RegExpPrototypeGetHasIndices,
  RegExpPrototypeGetIgnoreCase,
  RegExpPrototypeGetMultiline,
  RegExpPrototypeGetSource,
  RegExpPrototypeGetSticky,
  RegExpPrototypeGetUnicode,
  Set,
  SymbolIterator,
  SymbolMatch,
  SymbolMatchAll,
  SymbolReplace,
  SymbolSearch,
  SymbolSpecies,
  SymbolSplit,
  WeakMap,
  WeakRef,
  WeakSet
} = primordials;

/**
 * Creates a class that can be safely iterated over.
 *
 * Because these functions are used by `makeSafe`, which is exposed on the
 * `primordials` object, it's important to use const references to the
 * primordials that they use.
 * @template {Iterable} T
 * @template {*} TReturn
 * @template {*} TNext
 * @param {(self: T) => IterableIterator<T>} factory
 * @param {(...args: [] | [TNext]) => IteratorResult<T, TReturn>} next
 * @returns {Iterator<T, TReturn, TNext>}
 */
var createSafeIterator = (factory, _next) => {
  var SafeIterator = /*#__PURE__*/function () {
    function SafeIterator(iterable) {
      _classCallCheck(this, SafeIterator);
      this._iterator = factory(iterable);
    }
    return _createClass(SafeIterator, [{
      key: "next",
      value: function next() {
        return _next(this._iterator);
      }
    }, {
      key: SymbolIterator,
      value: function () {
        return this;
      }
    }]);
  }();
  ObjectSetPrototypeOf(SafeIterator.prototype, null);
  ObjectFreeze(SafeIterator.prototype);
  ObjectFreeze(SafeIterator);
  return SafeIterator;
};
primordials.SafeArrayIterator = createSafeIterator(primordials.ArrayPrototypeSymbolIterator, primordials.ArrayIteratorPrototypeNext);
primordials.SafeStringIterator = createSafeIterator(primordials.StringPrototypeSymbolIterator, primordials.StringIteratorPrototypeNext);
var copyProps = (src, dest) => {
  ArrayPrototypeForEach(ReflectOwnKeys(src), key => {
    if (!ReflectGetOwnPropertyDescriptor(dest, key)) {
      ReflectDefineProperty(dest, key, _objectSpread({
        __proto__: null
      }, ReflectGetOwnPropertyDescriptor(src, key)));
    }
  });
};

/**
 * @type {typeof primordials.makeSafe}
 */
var makeSafe = (unsafe, safe) => {
  if (SymbolIterator in unsafe.prototype) {
    var dummy = new unsafe();
    var next; // We can reuse the same `next` method.

    ArrayPrototypeForEach(ReflectOwnKeys(unsafe.prototype), key => {
      if (!ReflectGetOwnPropertyDescriptor(safe.prototype, key)) {
        var desc = ReflectGetOwnPropertyDescriptor(unsafe.prototype, key);
        if (typeof desc.value === 'function' && desc.value.length === 0 && SymbolIterator in (FunctionPrototypeCall(desc.value, dummy) ?? {})) {
          var createIterator = uncurryThis(desc.value);
          next ??= uncurryThis(createIterator(dummy).next);
          var SafeIterator = createSafeIterator(createIterator, next);
          desc.value = function () {
            return new SafeIterator(this);
          };
        }
        ReflectDefineProperty(safe.prototype, key, _objectSpread({
          __proto__: null
        }, desc));
      }
    });
  } else {
    copyProps(unsafe.prototype, safe.prototype);
  }
  copyProps(unsafe, safe);
  ObjectSetPrototypeOf(safe.prototype, null);
  ObjectFreeze(safe.prototype);
  ObjectFreeze(safe);
  return safe;
};
primordials.makeSafe = makeSafe;

// Subclass the constructors because we need to use their prototype
// methods later.

/*
 TODO Rhino this is all too much for our little old engine now.

primordials.SafeMap = makeSafe(Map, function (_Map) {
  function SafeMap() {
    _classCallCheck(this, SafeMap);
    return _callSuper(this, SafeMap, arguments);
  }
  _inherits(SafeMap, _Map);
  return _createClass(SafeMap);
}(Map));
primordials.SafeWeakMap = makeSafe(WeakMap, function (_WeakMap) {
  function SafeWeakMap() {
    _classCallCheck(this, SafeWeakMap);
    return _callSuper(this, SafeWeakMap, arguments);
  }
  _inherits(SafeWeakMap, _WeakMap);
  return _createClass(SafeWeakMap);
}(WeakMap));
primordials.SafeSet = makeSafe(Set, function (_Set) {
  function SafeSet() {
    _classCallCheck(this, SafeSet);
    return _callSuper(this, SafeSet, arguments);
  }
  _inherits(SafeSet, _Set);
  return _createClass(SafeSet);
}(Set));
primordials.SafeWeakSet = makeSafe(WeakSet, function (_WeakSet) {
  function SafeWeakSet() {
    _classCallCheck(this, SafeWeakSet);
    return _callSuper(this, SafeWeakSet, arguments);
  }
  _inherits(SafeWeakSet, _WeakSet);
  return _createClass(SafeWeakSet);
}(WeakSet));
primordials.SafeFinalizationRegistry = makeSafe(FinalizationRegistry, function (_FinalizationRegistry) {
  function SafeFinalizationRegistry() {
    _classCallCheck(this, SafeFinalizationRegistry);
    return _callSuper(this, SafeFinalizationRegistry, arguments);
  }
  _inherits(SafeFinalizationRegistry, _FinalizationRegistry);
  return _createClass(SafeFinalizationRegistry);
}(FinalizationRegistry));
primordials.SafeWeakRef = makeSafe(WeakRef, function (_WeakRef) {
  function SafeWeakRef() {
    _classCallCheck(this, SafeWeakRef);
    return _callSuper(this, SafeWeakRef, arguments);
  }
  _inherits(SafeWeakRef, _WeakRef);
  return _createClass(SafeWeakRef);
}(WeakRef));
var SafePromise = makeSafe(Promise, function (_Promise) {
  function SafePromise() {
    _classCallCheck(this, SafePromise);
    return _callSuper(this, SafePromise, arguments);
  }
  _inherits(SafePromise, _Promise);
  return _createClass(SafePromise);
}(Promise));
*/

primordials.SafeSet = Set;
primordials.SafeMap = Map;
primordials.SafeWeakMap = WeakMap;
primordials.SafeWeakSet = WeakSet;
primordials.SafePromise = Promise;
primordials.SafeFinalizationRegistry = FinalizationRegistry;
primordials.SafeWeakRef = WeakRef;

/**
 * Attaches a callback that is invoked when the Promise is settled (fulfilled or
 * rejected). The resolved value cannot be modified from the callback.
 * Prefer using async functions when possible.
 * @param {Promise<any>} thisPromise
 * @param {(() => void) | undefined | null} onFinally The callback to execute
 *   when the Promise is settled (fulfilled or rejected).
 * @returns {Promise} A Promise for the completion of the callback.
 */
primordials.SafePromisePrototypeFinally = (thisPromise, onFinally) =>
// Wrapping on a new Promise is necessary to not expose the SafePromise
// prototype to user-land.
new Promise((a, b) => new SafePromise((a, b) => PromisePrototypeThen(thisPromise, a, b)).finally(onFinally).then(a, b));
/* RHINO TODO
primordials.AsyncIteratorPrototype = primordials.ReflectGetPrototypeOf(primordials.ReflectGetPrototypeOf(function () {
  return new _AsyncGenerator(function (_generator) {});
}).prototype);
var arrayToSafePromiseIterable = (promises, mapFn) => new primordials.SafeArrayIterator(ArrayPrototypeMap(promises, (promise, i) => new SafePromise((a, b) => PromisePrototypeThen(mapFn == null ? promise : mapFn(promise, i), a, b))));
*/

/**
 * @template T,U
 * @param {Array<T | PromiseLike<T>>} promises
 * @param {(v: T|PromiseLike<T>, k: number) => U|PromiseLike<U>} [mapFn]
 * @returns {Promise<Awaited<U>[]>}
 */
primordials.SafePromiseAll = (promises, mapFn) =>
// Wrapping on a new Promise is necessary to not expose the SafePromise
// prototype to user-land.
new Promise((a, b) => SafePromise.all(arrayToSafePromiseIterable(promises, mapFn)).then(a, b));

/**
 * Should only be used for internal functions, this would produce similar
 * results as `Promise.all` but without prototype pollution, and the return
 * value is not a genuine Array but an array-like object.
 * @template T,U
 * @param {ArrayLike<T | PromiseLike<T>>} promises
 * @param {(v: T|PromiseLike<T>, k: number) => U|PromiseLike<U>} [mapFn]
 * @returns {Promise<ArrayLike<Awaited<U>>>}
 */
primordials.SafePromiseAllReturnArrayLike = (promises, mapFn) => new Promise((resolve, reject) => {
  var {
    length
  } = promises;
  var returnVal = ArrayConstructor(length);
  ObjectSetPrototypeOf(returnVal, null);
  if (length === 0) resolve(returnVal);
  var pendingPromises = length;
  var _loop = function (i) {
    var promise = mapFn != null ? mapFn(promises[i], i) : promises[i];
    PromisePrototypeThen(PromiseResolve(promise), result => {
      returnVal[i] = result;
      if (--pendingPromises === 0) resolve(returnVal);
    }, reject);
  };
  for (var i = 0; i < length; i++) {
    _loop(i);
  }
});

/**
 * Should only be used when we only care about waiting for all the promises to
 * resolve, not what value they resolve to.
 * @template T,U
 * @param {ArrayLike<T | PromiseLike<T>>} promises
 * @param {(v: T|PromiseLike<T>, k: number) => U|PromiseLike<U>} [mapFn]
 * @returns {Promise<void>}
 */
primordials.SafePromiseAllReturnVoid = (promises, mapFn) => new Promise((resolve, reject) => {
  var pendingPromises = promises.length;
  if (pendingPromises === 0) resolve();
  var onFulfilled = () => {
    if (--pendingPromises === 0) {
      resolve();
    }
  };
  for (var i = 0; i < promises.length; i++) {
    var promise = mapFn != null ? mapFn(promises[i], i) : promises[i];
    PromisePrototypeThen(PromiseResolve(promise), onFulfilled, reject);
  }
});

/**
 * @template T,U
 * @param {Array<T|PromiseLike<T>>} promises
 * @param {(v: T|PromiseLike<T>, k: number) => U|PromiseLike<U>} [mapFn]
 * @returns {Promise<PromiseSettledResult<any>[]>}
 */
primordials.SafePromiseAllSettled = (promises, mapFn) =>
// Wrapping on a new Promise is necessary to not expose the SafePromise
// prototype to user-land.
new Promise((a, b) => SafePromise.allSettled(arrayToSafePromiseIterable(promises, mapFn)).then(a, b));

/**
 * Should only be used when we only care about waiting for all the promises to
 * settle, not what value they resolve or reject to.
 * @template T,U
 * @param {ArrayLike<T|PromiseLike<T>>} promises
 * @param {(v: T|PromiseLike<T>, k: number) => U|PromiseLike<U>} [mapFn]
 * @returns {Promise<void>}
 */
primordials.SafePromiseAllSettledReturnVoid = (promises, mapFn) => new Promise(resolve => {
  var pendingPromises = promises.length;
  if (pendingPromises === 0) resolve();
  var onSettle = () => {
    if (--pendingPromises === 0) resolve();
  };
  for (var i = 0; i < promises.length; i++) {
    var promise = mapFn != null ? mapFn(promises[i], i) : promises[i];
    PromisePrototypeThen(PromiseResolve(promise), onSettle, onSettle);
  }
});

/**
 * @template T,U
 * @param {Array<T|PromiseLike<T>>} promises
 * @param {(v: T|PromiseLike<T>, k: number) => U|PromiseLike<U>} [mapFn]
 * @returns {Promise<Awaited<U>>}
 */
primordials.SafePromiseAny = (promises, mapFn) =>
// Wrapping on a new Promise is necessary to not expose the SafePromise
// prototype to user-land.
new Promise((a, b) => SafePromise.any(arrayToSafePromiseIterable(promises, mapFn)).then(a, b));

/**
 * @template T,U
 * @param {Array<T|PromiseLike<T>>} promises
 * @param {(v: T|PromiseLike<T>, k: number) => U|PromiseLike<U>} [mapFn]
 * @returns {Promise<Awaited<U>>}
 */
primordials.SafePromiseRace = (promises, mapFn) =>
// Wrapping on a new Promise is necessary to not expose the SafePromise
// prototype to user-land.
new Promise((a, b) => SafePromise.race(arrayToSafePromiseIterable(promises, mapFn)).then(a, b));
var {
  exec: OriginalRegExpPrototypeExec,
  [SymbolMatch]: OriginalRegExpPrototypeSymbolMatch,
  [SymbolMatchAll]: OriginalRegExpPrototypeSymbolMatchAll,
  [SymbolReplace]: OriginalRegExpPrototypeSymbolReplace,
  [SymbolSearch]: OriginalRegExpPrototypeSymbolSearch,
  [SymbolSplit]: OriginalRegExpPrototypeSymbolSplit
} = RegExpPrototype;
var _regex = /*#__PURE__*/new WeakMap();
var RegExpLikeForStringSplitting = /*#__PURE__*/function () {
  function RegExpLikeForStringSplitting() {
    _classCallCheck(this, RegExpLikeForStringSplitting);
    _classPrivateFieldInitSpec(this, _regex, void 0);
    _classPrivateFieldSet(_regex, this, ReflectConstruct(RegExp, arguments));
  }
  return _createClass(RegExpLikeForStringSplitting, [{
    key: "lastIndex",
    get: function () {
      return ReflectGet(_classPrivateFieldGet(_regex, this), 'lastIndex');
    },
    set: function (value) {
      ReflectSet(_classPrivateFieldGet(_regex, this), 'lastIndex', value);
    }
  }, {
    key: "exec",
    value: function exec() {
      return ReflectApply(OriginalRegExpPrototypeExec, _classPrivateFieldGet(_regex, this), arguments);
    }
  }]);
}();
ObjectSetPrototypeOf(RegExpLikeForStringSplitting.prototype, null);

/**
 * @param {RegExp} pattern
 * @returns {RegExp}
 */
primordials.hardenRegExp = function hardenRegExp(pattern) {
  ObjectDefineProperties(pattern, {
    [SymbolMatch]: {
      __proto__: null,
      configurable: true,
      value: OriginalRegExpPrototypeSymbolMatch
    },
    [SymbolMatchAll]: {
      __proto__: null,
      configurable: true,
      value: OriginalRegExpPrototypeSymbolMatchAll
    },
    [SymbolReplace]: {
      __proto__: null,
      configurable: true,
      value: OriginalRegExpPrototypeSymbolReplace
    },
    [SymbolSearch]: {
      __proto__: null,
      configurable: true,
      value: OriginalRegExpPrototypeSymbolSearch
    },
    [SymbolSplit]: {
      __proto__: null,
      configurable: true,
      value: OriginalRegExpPrototypeSymbolSplit
    },
    constructor: {
      __proto__: null,
      configurable: true,
      value: {
        [SymbolSpecies]: RegExpLikeForStringSplitting
      }
    },
    dotAll: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetDotAll(pattern)
    },
    exec: {
      __proto__: null,
      configurable: true,
      value: OriginalRegExpPrototypeExec
    },
    global: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetGlobal(pattern)
    },
    hasIndices: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetHasIndices(pattern)
    },
    ignoreCase: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetIgnoreCase(pattern)
    },
    multiline: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetMultiline(pattern)
    },
    source: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetSource(pattern)
    },
    sticky: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetSticky(pattern)
    },
    unicode: {
      __proto__: null,
      configurable: true,
      value: RegExpPrototypeGetUnicode(pattern)
    }
  });
  ObjectDefineProperty(pattern, 'flags', {
    __proto__: null,
    configurable: true,
    value: RegExpPrototypeGetFlags(pattern)
  });
  return pattern;
};

/**
 * @param {string} str
 * @param {RegExp} regexp
 * @returns {number}
 */
primordials.SafeStringPrototypeSearch = (str, regexp) => {
  regexp.lastIndex = 0;
  var match = RegExpPrototypeExec(regexp, str);
  return match ? match.index : -1;
};

/**
 * Variadic functions with lots of arguments will cause stack overflow errors.
 * Use this function when `items` can be arbitrarily large, this function splits
 * it into chunks of size 2**16 making stack overflow less likely.
 * @param {Array<unknown>} arr
 * @param {Parameters<typeof Array.prototype.push>} items
 * @returns {ReturnType<typeof Array.prototype.push>}
 */
primordials.SafeArrayPrototypePushApply = (arr, items) => {
  var end = 0x10000;
  if (end < items.length) {
    var start = 0;
    do {
      ArrayPrototypePushApply(arr, ArrayPrototypeSlice(items, start, start = end));
      end += 0x10000;
    } while (end < items.length);
    items = ArrayPrototypeSlice(items, start);
  }
  return ArrayPrototypePushApply(arr, items);
};
ObjectSetPrototypeOf(primordials, null);
ObjectFreeze(primordials);

