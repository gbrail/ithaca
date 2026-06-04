'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypeForEach,
  ObjectFreeze,
  SafeFinalizationRegistry,
  SafeMap,
  SafeWeakRef,
  SymbolIterator
} = primordials;
var {
  privateSymbols: {
    source_map_data_private_symbol
  }
} = internalBinding('util');
var debug = require('internal/util/debuglog').debuglog('source_map', fn => {
  debug = fn;
});

/**
 * Specialized map of WeakRefs to module instances that caches source map
 * entries by `filename` and `sourceURL`. Cached entries can be iterated with
 * `for..of` syntax.
 *
 * The cache map maintains the cache entries by:
 * - `weakModuleMap`(Map): a strong sourceURL -> WeakRef(Module),
 * - WeakRef(Module[source_map_data_private_symbol]): source map data.
 *
 * Obsolete `weakModuleMap` entries are removed by the `finalizationRegistry`
 * callback. This pattern decouples the strong url reference to the source map
 * data and allow the cache to be reclaimed eagerly, without depending on an
 * indeterministic callback of a finalization registry.
 */
var _weakModuleMap = /*#__PURE__*/new WeakMap();
var _cleanup = /*#__PURE__*/new WeakMap();
var _finalizationRegistry = /*#__PURE__*/new WeakMap();
var SourceMapCacheMap = /*#__PURE__*/function () {
  function SourceMapCacheMap() {
    _classCallCheck(this, SourceMapCacheMap);
    /**
     * @type {Map<string, WeakRef<*>>}
     * The cached module instance can be removed from the global module registry
     * with approaches like mutating `require.cache`.
     * The `weakModuleMap` exposes entries by `filename` and `sourceURL`.
     * In the case of mutated module registry, obsolete entries are removed from
     * the cache by the `finalizationRegistry`.
     */
    _classPrivateFieldInitSpec(this, _weakModuleMap, new SafeMap());
    _classPrivateFieldInitSpec(this, _cleanup, _ref => {
      var {
        keys
      } = _ref;
      // Delete the entry if the weak target has been reclaimed.
      // If the weak target is not reclaimed, the entry was overridden by a new
      // weak target.
      ArrayPrototypeForEach(keys, key => {
        var ref = _classPrivateFieldGet(_weakModuleMap, this).get(key);
        if (ref && ref.deref() === undefined) {
          debug(`Cleanup obsolete source map cache entry with key: ${key}`);
          _classPrivateFieldGet(_weakModuleMap, this).delete(key);
        }
      });
    });
    _classPrivateFieldInitSpec(this, _finalizationRegistry, new SafeFinalizationRegistry(_classPrivateFieldGet(_cleanup, this)));
  }
  return _createClass(SourceMapCacheMap, [{
    key: "set",
    value:
    /**
     * Sets the value for the given key, associated with the given module
     * instance.
     * @param {string[]} keys array of urls to index the value entry.
     * @param {*} sourceMapData the value entry.
     * @param {object} moduleInstance an object that can be weakly referenced and
     *   invalidate the [key, value] entry after this object is reclaimed.
     */
    function set(keys, sourceMapData, moduleInstance) {
      var weakRef = new SafeWeakRef(moduleInstance);
      ArrayPrototypeForEach(keys, key => _classPrivateFieldGet(_weakModuleMap, this).set(key, weakRef));
      moduleInstance[source_map_data_private_symbol] = sourceMapData;
      _classPrivateFieldGet(_finalizationRegistry, this).register(moduleInstance, {
        keys
      });
    }

    /**
     * Get an entry by the given key.
     * @param {string} key a file url or source url
     * @returns {object|undefined}
     */
  }, {
    key: "get",
    value: function get(key) {
      var weakRef = _classPrivateFieldGet(_weakModuleMap, this).get(key);
      var moduleInstance = weakRef?.deref();
      if (moduleInstance === undefined) {
        return;
      }
      return moduleInstance[source_map_data_private_symbol];
    }

    /**
     * Estimate the size of the cache. The actual size may be smaller because
     * some entries may be reclaimed with the module instance.
     * @returns {number}
     */
  }, {
    key: "size",
    get: function () {
      return _classPrivateFieldGet(_weakModuleMap, this).size;
    }
  }, {
    key: SymbolIterator,
    value: function () {
      var iterator = _classPrivateFieldGet(_weakModuleMap, this).entries();
      var next = () => {
        var result = iterator.next();
        if (result.done) return result;
        var {
          0: key,
          1: weakRef
        } = result.value;
        var moduleInstance = weakRef.deref();
        if (moduleInstance == null) return next();
        var value = moduleInstance[source_map_data_private_symbol];
        return {
          done: false,
          value: [key, value]
        };
      };
      return {
        [SymbolIterator]() {
          return this;
        },
        next
      };
    }
  }]);
}();
ObjectFreeze(SourceMapCacheMap.prototype);
module.exports = {
  SourceMapCacheMap
};

