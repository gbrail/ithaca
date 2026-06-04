'use strict';

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
  ObjectDefineProperties,
  ObjectDefineProperty,
  SymbolToStringTag
} = primordials;
var {
  codes: {
    ERR_MISSING_OPTION
  }
} = require('internal/errors');
var {
  customInspectSymbol: kInspect,
  kEnumerableProperty
} = require('internal/util');
var {
  customInspect,
  getNonWritablePropertyDescriptor
} = require('internal/webstreams/util');
var {
  validateObject
} = require('internal/validators');

/**
 * @callback QueuingStrategySize
 * @param {any} chunk
 * @returns {number}
 */

/**
 * @typedef {{
 *   highWaterMark : number,
 *   size? : QueuingStrategySize,
 * }} QueuingStrategy
 */

var nameDescriptor = {
  __proto__: null,
  value: 'size'
};
var byteSizeFunction = ObjectDefineProperty(chunk => chunk.byteLength, 'name', nameDescriptor);
var countSizeFunction = ObjectDefineProperty(() => 1, 'name', nameDescriptor);

/**
 * @type {QueuingStrategy}
 */
var _state = /*#__PURE__*/new WeakMap();
var _byteSizeFunction = /*#__PURE__*/new WeakMap();
var ByteLengthQueuingStrategy = /*#__PURE__*/function () {
  /**
   * @param {{
   *   highWaterMark : number
   * }} init
   */
  function ByteLengthQueuingStrategy(init) {
    _classCallCheck(this, ByteLengthQueuingStrategy);
    _classPrivateFieldInitSpec(this, _state, void 0);
    _classPrivateFieldInitSpec(this, _byteSizeFunction, byteSizeFunction);
    validateObject(init, 'init');
    if (init.highWaterMark === undefined) throw new ERR_MISSING_OPTION('init.highWaterMark');

    // The highWaterMark value is not checked until the strategy
    // is actually used, per the spec.
    _classPrivateFieldSet(_state, this, {
      highWaterMark: +init.highWaterMark
    });
  }

  /**
   * @readonly
   * @type {number}
   */
  return _createClass(ByteLengthQueuingStrategy, [{
    key: "highWaterMark",
    get: function () {
      return _classPrivateFieldGet(_state, this).highWaterMark;
    }

    /**
     * @type {QueuingStrategySize}
     */
  }, {
    key: "size",
    get: function () {
      return _classPrivateFieldGet(_byteSizeFunction, this);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, 'ByteLengthQueuingStrategy', {
        highWaterMark: this.highWaterMark
      });
    }
  }]);
}();
ObjectDefineProperties(ByteLengthQueuingStrategy.prototype, {
  highWaterMark: kEnumerableProperty,
  size: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(ByteLengthQueuingStrategy.name)
});

/**
 * @type {QueuingStrategy}
 */
var _state2 = /*#__PURE__*/new WeakMap();
var _countSizeFunction = /*#__PURE__*/new WeakMap();
var CountQueuingStrategy = /*#__PURE__*/function () {
  /**
   * @param {{
   *   highWaterMark : number
   * }} init
   */
  function CountQueuingStrategy(init) {
    _classCallCheck(this, CountQueuingStrategy);
    _classPrivateFieldInitSpec(this, _state2, void 0);
    _classPrivateFieldInitSpec(this, _countSizeFunction, countSizeFunction);
    validateObject(init, 'init');
    if (init.highWaterMark === undefined) throw new ERR_MISSING_OPTION('init.highWaterMark');

    // The highWaterMark value is not checked until the strategy
    // is actually used, per the spec.
    _classPrivateFieldSet(_state2, this, {
      highWaterMark: +init.highWaterMark
    });
  }

  /**
   * @readonly
   * @type {number}
   */
  return _createClass(CountQueuingStrategy, [{
    key: "highWaterMark",
    get: function () {
      return _classPrivateFieldGet(_state2, this).highWaterMark;
    }

    /**
     * @type {QueuingStrategySize}
     */
  }, {
    key: "size",
    get: function () {
      return _classPrivateFieldGet(_countSizeFunction, this);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, 'CountQueuingStrategy', {
        highWaterMark: this.highWaterMark
      });
    }
  }]);
}();
ObjectDefineProperties(CountQueuingStrategy.prototype, {
  highWaterMark: kEnumerableProperty,
  size: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(CountQueuingStrategy.name)
});
module.exports = {
  ByteLengthQueuingStrategy,
  CountQueuingStrategy
};

