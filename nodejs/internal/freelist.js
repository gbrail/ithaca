'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ReflectApply
} = primordials;
var FreeList = /*#__PURE__*/function () {
  function FreeList(name, max, ctor) {
    _classCallCheck(this, FreeList);
    this.name = name;
    this.ctor = ctor;
    this.max = max;
    this.list = [];
  }
  return _createClass(FreeList, [{
    key: "alloc",
    value: function alloc() {
      return this.list.length > 0 ? this.list.pop() : ReflectApply(this.ctor, this, arguments);
    }
  }, {
    key: "free",
    value: function free(obj) {
      if (this.list.length < this.max) {
        this.list.push(obj);
        return true;
      }
      return false;
    }
  }]);
}();
module.exports = FreeList;

