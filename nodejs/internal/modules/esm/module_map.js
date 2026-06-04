'use strict';

var _ResolveCache;
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypeSort,
  JSONStringify,
  ObjectKeys,
  SafeMap
} = primordials;
var {
  kImplicitTypeAttribute
} = require('internal/modules/esm/assert');
var debug = require('internal/util/debuglog').debuglog('esm', fn => {
  debug = fn;
});
var {
  ERR_INVALID_ARG_TYPE
} = require('internal/errors').codes;
var {
  validateString
} = require('internal/validators');

/**
 * Cache the results of the `resolve` step of the module resolution and loading process.
 * Future resolutions of the same input (specifier, parent URL and import attributes)
 * must return the same result if the first attempt was successful, per
 * https://tc39.es/ecma262/#sec-HostLoadImportedModule.
 * This cache is *not* used when custom loaders are registered.
 */
var _ResolveCache_brand = /*#__PURE__*/new WeakSet();
var ResolveCache = /*#__PURE__*/function (_SafeMap) {
  function ResolveCache() {
    var _this;
    _classCallCheck(this, ResolveCache);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, ResolveCache, [].concat(args));
    _classPrivateMethodInitSpec(_this, _ResolveCache_brand);
    return _this;
  }
  _inherits(ResolveCache, _SafeMap);
  return _createClass(ResolveCache, [{
    key: "serializeKey",
    value:
    /**
     * Generates the internal serialized cache key and returns it along the actual cache object.
     *
     * It is exposed to allow more efficient read and overwrite a cache entry.
     * @param {string} specifier
     * @param {Record<string,string>} importAttributes
     * @returns {string}
     */
    function serializeKey(specifier, importAttributes) {
      // To serialize the ModuleRequest (specifier + list of import attributes),
      // we need to sort the attributes by key, then stringifying,
      // so that different import statements with the same attributes are always treated
      // as identical.
      var keys = ObjectKeys(importAttributes);
      if (keys.length === 0) {
        return specifier + '::';
      }
      return specifier + '::' + ArrayPrototypeJoin(ArrayPrototypeMap(ArrayPrototypeSort(keys), key => JSONStringify(key) + JSONStringify(importAttributes[key])), ',');
    }
  }, {
    key: "get",
    value:
    /**
     * @param {string} serializedKey
     * @param {string} parentURL
     * @returns {import('./loader').ModuleExports | Promise<import('./loader').ModuleExports>}
     */
    function get(serializedKey, parentURL) {
      return _assertClassBrand(_ResolveCache_brand, this, _getModuleCachedImports).call(this, parentURL)[serializedKey];
    }

    /**
     * @param {string} serializedKey
     * @param {string} parentURL
     * @param {{ format: string, url: URL['href'] }} result
     * @returns {ResolveCache}
     */
  }, {
    key: "set",
    value: function set(serializedKey, parentURL, result) {
      _assertClassBrand(_ResolveCache_brand, this, _getModuleCachedImports).call(this, parentURL)[serializedKey] = result;
      return this;
    }

    /**
     * @param {string} serializedKey
     * @param {URL|string} parentURL
     * @returns {boolean}
     */
  }, {
    key: "has",
    value: function has(serializedKey, parentURL) {
      return serializedKey in _assertClassBrand(_ResolveCache_brand, this, _getModuleCachedImports).call(this, parentURL);
    }
  }]);
}(SafeMap);
/**
 * Cache the results of the `load` step of the module resolution and loading process.
 */
_ResolveCache = ResolveCache;
function _getModuleCachedImports(parentURL) {
  var internalCache = _superPropGet(_ResolveCache.prototype, "get", this, 2)([parentURL]);
  if (internalCache == null) {
    _superPropGet(_ResolveCache.prototype, "set", this, 2)([parentURL, internalCache = {
      __proto__: null
    }]);
  }
  return internalCache;
}
var LoadCache = /*#__PURE__*/function (_SafeMap2) {
  function LoadCache() {
    _classCallCheck(this, LoadCache);
    return _callSuper(this, LoadCache, arguments);
  }
  _inherits(LoadCache, _SafeMap2);
  return _createClass(LoadCache, [{
    key: "get",
    value: function get(url) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kImplicitTypeAttribute;
      validateString(url, 'url');
      validateString(type, 'type');
      return _superPropGet(LoadCache, "get", this, 3)([url])?.[type];
    }
  }, {
    key: "set",
    value: function set(url) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kImplicitTypeAttribute;
      var job = arguments.length > 2 ? arguments[2] : undefined;
      validateString(url, 'url');
      validateString(type, 'type');
      var {
        ModuleJobBase
      } = require('internal/modules/esm/module_job');
      if (job instanceof ModuleJobBase !== true && typeof job !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('job', 'ModuleJob', job);
      }
      debug(`Storing ${url} (${type === kImplicitTypeAttribute ? 'implicit type' : type}) in ModuleLoadMap`);
      var cachedJobsForUrl = _superPropGet(LoadCache, "get", this, 3)([url]) ?? {
        __proto__: null
      };
      cachedJobsForUrl[type] = job;
      return _superPropGet(LoadCache, "set", this, 3)([url, cachedJobsForUrl]);
    }
  }, {
    key: "has",
    value: function has(url) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kImplicitTypeAttribute;
      validateString(url, 'url');
      validateString(type, 'type');
      return _superPropGet(LoadCache, "get", this, 3)([url])?.[type] !== undefined;
    }
  }, {
    key: "delete",
    value: function _delete(url) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kImplicitTypeAttribute;
      var cached = _superPropGet(LoadCache, "get", this, 3)([url]);
      if (cached) {
        cached[type] = undefined;
      }
    }
  }]);
}(SafeMap);
module.exports = {
  LoadCache,
  ResolveCache
};

