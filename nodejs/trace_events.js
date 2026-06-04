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
  ArrayPrototypeJoin,
  SafeSet
} = primordials;
var {
  hasTracing
} = internalBinding('config');
var kMaxTracingCount = 10;
var {
  ERR_TRACE_EVENTS_CATEGORY_REQUIRED,
  ERR_TRACE_EVENTS_UNAVAILABLE
} = require('internal/errors').codes;
var {
  ownsProcessState
} = require('internal/worker');
if (!hasTracing || !ownsProcessState) throw new ERR_TRACE_EVENTS_UNAVAILABLE();
var {
  CategorySet,
  getEnabledCategories
} = internalBinding('trace_events');
var {
  customInspectSymbol
} = require('internal/util');
var {
  format
} = require('internal/util/inspect');
var {
  validateObject,
  validateStringArray
} = require('internal/validators');
var enabledTracingObjects = new SafeSet();
var _handle = /*#__PURE__*/new WeakMap();
var _categories = /*#__PURE__*/new WeakMap();
var _enabled = /*#__PURE__*/new WeakMap();
var Tracing = /*#__PURE__*/function () {
  function Tracing(categories) {
    _classCallCheck(this, Tracing);
    _classPrivateFieldInitSpec(this, _handle, void 0);
    _classPrivateFieldInitSpec(this, _categories, void 0);
    _classPrivateFieldInitSpec(this, _enabled, false);
    _classPrivateFieldSet(_handle, this, new CategorySet(categories));
    _classPrivateFieldSet(_categories, this, categories);
  }
  return _createClass(Tracing, [{
    key: "enable",
    value: function enable() {
      if (!_classPrivateFieldGet(_enabled, this)) {
        _classPrivateFieldSet(_enabled, this, true);
        _classPrivateFieldGet(_handle, this).enable();
        enabledTracingObjects.add(this);
        if (enabledTracingObjects.size > kMaxTracingCount) {
          process.emitWarning('Possible trace_events memory leak detected. There are more than ' + `${kMaxTracingCount} enabled Tracing objects.`);
        }
      }
    }
  }, {
    key: "disable",
    value: function disable() {
      if (_classPrivateFieldGet(_enabled, this)) {
        _classPrivateFieldSet(_enabled, this, false);
        _classPrivateFieldGet(_handle, this).disable();
        enabledTracingObjects.delete(this);
      }
    }
  }, {
    key: "enabled",
    get: function () {
      return _classPrivateFieldGet(_enabled, this);
    }
  }, {
    key: "categories",
    get: function () {
      return ArrayPrototypeJoin(_classPrivateFieldGet(_categories, this), ',');
    }
  }, {
    key: customInspectSymbol,
    value: function (depth, opts) {
      if (typeof depth === 'number' && depth < 0) return this;
      var obj = {
        enabled: this.enabled,
        categories: this.categories
      };
      return `Tracing ${format(obj)}`;
    }
  }]);
}();
function createTracing(options) {
  validateObject(options, 'options');
  validateStringArray(options.categories, 'options.categories');
  if (options.categories.length <= 0) throw new ERR_TRACE_EVENTS_CATEGORY_REQUIRED();
  return new Tracing(options.categories);
}
module.exports = {
  createTracing,
  getEnabledCategories
};

