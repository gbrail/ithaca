'use strict';

// RingBuffer - O(1) FIFO queue with indexed access.
//
// Replaces plain JS arrays that are used as queues with shift()/push().
// Array.shift() is O(n) because it copies all remaining elements;
// RingBuffer.shift() is O(1) -- it just advances a head pointer.
//
// Also provides O(1) trimFront(count) to replace Array.splice(0, count).
//
// Capacity is always a power of 2, so modulo is replaced with bitwise AND.
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  Array
} = primordials;
var _backing = /*#__PURE__*/new WeakMap();
var _head = /*#__PURE__*/new WeakMap();
var _size = /*#__PURE__*/new WeakMap();
var _mask = /*#__PURE__*/new WeakMap();
var _RingBuffer_brand = /*#__PURE__*/new WeakSet();
var RingBuffer = /*#__PURE__*/function () {
  function RingBuffer() {
    var initialCapacity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
    _classCallCheck(this, RingBuffer);
    /**
     * Double the backing capacity, linearizing the circular layout.
     */
    _classPrivateMethodInitSpec(this, _RingBuffer_brand);
    _classPrivateFieldInitSpec(this, _backing, void 0);
    _classPrivateFieldInitSpec(this, _head, 0);
    _classPrivateFieldInitSpec(this, _size, 0);
    _classPrivateFieldInitSpec(this, _mask, void 0);
    _classPrivateFieldSet(_mask, this, initialCapacity - 1);
    _classPrivateFieldSet(_backing, this, new Array(initialCapacity));
  }
  return _createClass(RingBuffer, [{
    key: "length",
    get: function () {
      return _classPrivateFieldGet(_size, this);
    }

    /**
     * Append an item to the tail. O(1) amortized.
     */
  }, {
    key: "push",
    value: function push(item) {
      var _this$size, _this$size2;
      if (_classPrivateFieldGet(_size, this) > _classPrivateFieldGet(_mask, this)) {
        _assertClassBrand(_RingBuffer_brand, this, _grow).call(this);
      }
      _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this) + _classPrivateFieldGet(_size, this) & _classPrivateFieldGet(_mask, this)] = item;
      _classPrivateFieldSet(_size, this, (_this$size = _classPrivateFieldGet(_size, this), _this$size2 = _this$size++, _this$size)), _this$size2;
    }

    /**
     * Prepend an item to the head. O(1) amortized.
     */
  }, {
    key: "unshift",
    value: function unshift(item) {
      var _this$size3, _this$size4;
      if (_classPrivateFieldGet(_size, this) > _classPrivateFieldGet(_mask, this)) {
        _assertClassBrand(_RingBuffer_brand, this, _grow).call(this);
      }
      _classPrivateFieldSet(_head, this, _classPrivateFieldGet(_head, this) - 1 + _classPrivateFieldGet(_mask, this) + 1 & _classPrivateFieldGet(_mask, this));
      _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this)] = item;
      _classPrivateFieldSet(_size, this, (_this$size3 = _classPrivateFieldGet(_size, this), _this$size4 = _this$size3++, _this$size3)), _this$size4;
    }

    /**
     * Remove and return the item at the head. O(1).
     * @returns {any}
     */
  }, {
    key: "shift",
    value: function shift() {
      var _this$size5, _this$size6;
      if (_classPrivateFieldGet(_size, this) === 0) return undefined;
      var item = _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this)];
      _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this)] = undefined; // Help GC
      _classPrivateFieldSet(_head, this, _classPrivateFieldGet(_head, this) + 1 & _classPrivateFieldGet(_mask, this));
      _classPrivateFieldSet(_size, this, (_this$size5 = _classPrivateFieldGet(_size, this), _this$size6 = _this$size5--, _this$size5)), _this$size6;
      return item;
    }

    /**
     * Read item at a logical index (0 = head). O(1).
     * Returns undefined if index is out of bounds.
     * @returns {any}
     */
  }, {
    key: "get",
    value: function get(index) {
      if (index < 0 || index >= _classPrivateFieldGet(_size, this)) return undefined;
      return _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this) + index & _classPrivateFieldGet(_mask, this)];
    }

    /**
     * Remove `count` items from the head without returning them.
     * O(count) for GC cleanup.
     */
  }, {
    key: "trimFront",
    value: function trimFront(count) {
      if (count <= 0) return;
      if (count >= _classPrivateFieldGet(_size, this)) {
        this.clear();
        return;
      }
      for (var i = 0; i < count; i++) {
        _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this) + i & _classPrivateFieldGet(_mask, this)] = undefined;
      }
      _classPrivateFieldSet(_head, this, _classPrivateFieldGet(_head, this) + count & _classPrivateFieldGet(_mask, this));
      _classPrivateFieldSet(_size, this, _classPrivateFieldGet(_size, this) - count);
    }

    /**
     * Find the logical index of `item` (reference equality). O(n).
     * Returns -1 if not found.
     * @returns {number}
     */
  }, {
    key: "indexOf",
    value: function indexOf(item) {
      for (var i = 0; i < _classPrivateFieldGet(_size, this); i++) {
        if (_classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this) + i & _classPrivateFieldGet(_mask, this)] === item) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Remove the item at logical `index`, shifting later elements. O(n) worst case.
     * Used only on rare abort-signal cancellation path.
     */
  }, {
    key: "removeAt",
    value: function removeAt(index) {
      var _this$size7, _this$size8;
      if (index < 0 || index >= _classPrivateFieldGet(_size, this)) return;
      for (var i = index; i < _classPrivateFieldGet(_size, this) - 1; i++) {
        var from = _classPrivateFieldGet(_head, this) + i + 1 & _classPrivateFieldGet(_mask, this);
        var to = _classPrivateFieldGet(_head, this) + i & _classPrivateFieldGet(_mask, this);
        _classPrivateFieldGet(_backing, this)[to] = _classPrivateFieldGet(_backing, this)[from];
      }
      var last = _classPrivateFieldGet(_head, this) + _classPrivateFieldGet(_size, this) - 1 & _classPrivateFieldGet(_mask, this);
      _classPrivateFieldGet(_backing, this)[last] = undefined;
      _classPrivateFieldSet(_size, this, (_this$size7 = _classPrivateFieldGet(_size, this), _this$size8 = _this$size7--, _this$size7)), _this$size8;
    }

    /**
     * Remove all items. O(n) for GC cleanup.
     */
  }, {
    key: "clear",
    value: function clear() {
      for (var i = 0; i < _classPrivateFieldGet(_size, this); i++) {
        _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this) + i & _classPrivateFieldGet(_mask, this)] = undefined;
      }
      _classPrivateFieldSet(_head, this, 0);
      _classPrivateFieldSet(_size, this, 0);
    }
  }]);
}();
function _grow() {
  var newCapacity = (_classPrivateFieldGet(_mask, this) + 1) * 2;
  var newBacking = new Array(newCapacity);
  for (var i = 0; i < _classPrivateFieldGet(_size, this); i++) {
    newBacking[i] = _classPrivateFieldGet(_backing, this)[_classPrivateFieldGet(_head, this) + i & _classPrivateFieldGet(_mask, this)];
  }
  _classPrivateFieldSet(_backing, this, newBacking);
  _classPrivateFieldSet(_head, this, 0);
  _classPrivateFieldSet(_mask, this, newCapacity - 1);
}
module.exports = {
  RingBuffer
};

