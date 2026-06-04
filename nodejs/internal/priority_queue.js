'use strict';

// The PriorityQueue is a basic implementation of a binary heap that accepts
// a custom sorting function via its constructor. This function is passed
// the two nodes to compare, similar to the native Array#sort. Crucially
// this enables priority queues that are based on a comparison of more than
// just a single criteria.
var _compare, _heap, _setPosition, _size;
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
module.exports = (_compare = /*#__PURE__*/new WeakMap(), _heap = /*#__PURE__*/new WeakMap(), _setPosition = /*#__PURE__*/new WeakMap(), _size = /*#__PURE__*/new WeakMap(), /*#__PURE__*/function () {
  function PriorityQueue(comparator, setPosition) {
    _classCallCheck(this, PriorityQueue);
    _classPrivateFieldInitSpec(this, _compare, (a, b) => a - b);
    _classPrivateFieldInitSpec(this, _heap, [undefined, undefined]);
    _classPrivateFieldInitSpec(this, _setPosition, void 0);
    _classPrivateFieldInitSpec(this, _size, 0);
    if (comparator !== undefined) _classPrivateFieldSet(_compare, this, comparator);
    if (setPosition !== undefined) _classPrivateFieldSet(_setPosition, this, setPosition);
  }
  return _createClass(PriorityQueue, [{
    key: "insert",
    value: function insert(value) {
      var _this$size;
      var heap = _classPrivateFieldGet(_heap, this);
      var pos = _classPrivateFieldSet(_size, this, (_this$size = _classPrivateFieldGet(_size, this), ++_this$size));
      heap[pos] = value;
      this.percolateUp(pos);
    }
  }, {
    key: "peek",
    value: function peek() {
      return _classPrivateFieldGet(_heap, this)[1];
    }
  }, {
    key: "peekBottom",
    value: function peekBottom() {
      return _classPrivateFieldGet(_heap, this)[_classPrivateFieldGet(_size, this)];
    }
  }, {
    key: "percolateDown",
    value: function percolateDown(pos) {
      var compare = _classPrivateFieldGet(_compare, this);
      var setPosition = _classPrivateFieldGet(_setPosition, this);
      var hasSetPosition = setPosition !== undefined;
      var heap = _classPrivateFieldGet(_heap, this);
      var size = _classPrivateFieldGet(_size, this);
      var hsize = size >> 1;
      var item = heap[pos];
      while (pos <= hsize) {
        var child = pos << 1;
        var nextChild = child + 1;
        var childItem = heap[child];
        if (nextChild <= size && compare(heap[nextChild], childItem) < 0) {
          child = nextChild;
          childItem = heap[nextChild];
        }
        if (compare(item, childItem) <= 0) break;
        if (hasSetPosition) setPosition(childItem, pos);
        heap[pos] = childItem;
        pos = child;
      }
      heap[pos] = item;
      if (hasSetPosition) setPosition(item, pos);
    }
  }, {
    key: "percolateUp",
    value: function percolateUp(pos) {
      var heap = _classPrivateFieldGet(_heap, this);
      var compare = _classPrivateFieldGet(_compare, this);
      var setPosition = _classPrivateFieldGet(_setPosition, this);
      var hasSetPosition = setPosition !== undefined;
      var item = heap[pos];
      while (pos > 1) {
        var parent = pos >> 1;
        var parentItem = heap[parent];
        if (compare(parentItem, item) <= 0) break;
        heap[pos] = parentItem;
        if (hasSetPosition) setPosition(parentItem, pos);
        pos = parent;
      }
      heap[pos] = item;
      if (hasSetPosition) setPosition(item, pos);
    }
  }, {
    key: "removeAt",
    value: function removeAt(pos) {
      var _this$size2;
      var heap = _classPrivateFieldGet(_heap, this);
      var size = _classPrivateFieldGet(_size, this);
      heap[pos] = heap[size];
      heap[size] = undefined;
      size = _classPrivateFieldSet(_size, this, (_this$size2 = _classPrivateFieldGet(_size, this), --_this$size2));
      if (size > 0 && pos <= size) {
        if (pos > 1 && _classPrivateFieldGet(_compare, this).call(this, heap[pos >> 1], heap[pos]) > 0) this.percolateUp(pos);else this.percolateDown(pos);
      }
    }
  }, {
    key: "shift",
    value: function shift() {
      var heap = _classPrivateFieldGet(_heap, this);
      var value = heap[1];
      if (value === undefined) return;
      this.removeAt(1);
      return value;
    }
  }]);
}());

