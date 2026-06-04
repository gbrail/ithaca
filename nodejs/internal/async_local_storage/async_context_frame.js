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
  ObjectIs,
  ReflectApply
} = primordials;
var {
  validateObject
} = require('internal/validators');
var AsyncContextFrame = require('internal/async_context_frame');
var {
  AsyncResource
} = require('async_hooks');
var RunScope = require('internal/async_local_storage/run_scope');
var _defaultValue = /*#__PURE__*/new WeakMap();
var _name = /*#__PURE__*/new WeakMap();
var AsyncLocalStorage = /*#__PURE__*/function () {
  /**
   * @typedef {object} AsyncLocalStorageOptions
   * @property {any} [defaultValue] - The default value to use when no value is set.
   * @property {string} [name] - The name of the storage.
   */
  /**
   * @param {AsyncLocalStorageOptions} [options]
   */
  function AsyncLocalStorage() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, AsyncLocalStorage);
    _classPrivateFieldInitSpec(this, _defaultValue, undefined);
    _classPrivateFieldInitSpec(this, _name, undefined);
    validateObject(options, 'options');
    _classPrivateFieldSet(_defaultValue, this, options.defaultValue);
    if (options.name !== undefined) {
      _classPrivateFieldSet(_name, this, `${options.name}`);
    }
  }

  /** @type {string} */
  return _createClass(AsyncLocalStorage, [{
    key: "name",
    get: function () {
      return _classPrivateFieldGet(_name, this) || '';
    }
  }, {
    key: "disable",
    value: function disable() {
      AsyncContextFrame.disable(this);
    }
  }, {
    key: "enterWith",
    value: function enterWith(data) {
      var frame = new AsyncContextFrame(this, data);
      AsyncContextFrame.set(frame);
    }
  }, {
    key: "run",
    value: function run(data, fn) {
      var prior = this.getStore();
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }
      if (ObjectIs(prior, data)) {
        return ReflectApply(fn, null, args);
      }
      this.enterWith(data);
      try {
        return ReflectApply(fn, null, args);
      } finally {
        this.enterWith(prior);
      }
    }
  }, {
    key: "exit",
    value: function exit(fn) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      return this.run.apply(this, [undefined, fn].concat(args));
    }
  }, {
    key: "getStore",
    value: function getStore() {
      var frame = AsyncContextFrame.current();
      if (!frame?.has(this)) {
        return _classPrivateFieldGet(_defaultValue, this);
      }
      return frame?.get(this);
    }
  }, {
    key: "withScope",
    value: function withScope(store) {
      return new RunScope(this, store);
    }
  }], [{
    key: "bind",
    value: function bind(fn) {
      return AsyncResource.bind(fn);
    }
  }, {
    key: "snapshot",
    value: function snapshot() {
      return AsyncLocalStorage.bind(function (cb) {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }
        return cb.apply(void 0, args);
      });
    }
  }]);
}();
module.exports = AsyncLocalStorage;

