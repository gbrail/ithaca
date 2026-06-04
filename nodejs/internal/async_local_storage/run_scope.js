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
  SymbolDispose
} = primordials;
var _storage = /*#__PURE__*/new WeakMap();
var _previousStore = /*#__PURE__*/new WeakMap();
var _disposed = /*#__PURE__*/new WeakMap();
var RunScope = /*#__PURE__*/function () {
  function RunScope(storage, store) {
    _classCallCheck(this, RunScope);
    _classPrivateFieldInitSpec(this, _storage, void 0);
    _classPrivateFieldInitSpec(this, _previousStore, void 0);
    _classPrivateFieldInitSpec(this, _disposed, false);
    _classPrivateFieldSet(_storage, this, storage);
    _classPrivateFieldSet(_previousStore, this, storage.getStore());
    storage.enterWith(store);
  }
  return _createClass(RunScope, [{
    key: "dispose",
    value: function dispose() {
      if (_classPrivateFieldGet(_disposed, this)) {
        return;
      }
      _classPrivateFieldSet(_disposed, this, true);
      _classPrivateFieldGet(_storage, this).enterWith(_classPrivateFieldGet(_previousStore, this));
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.dispose();
    }
  }]);
}();
module.exports = RunScope;

