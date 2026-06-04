'use strict';

var _FixedQueue, _pool;
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Array,
  ArrayPrototypeFill
} = primordials;

// Currently optimal queue size, tested on V8 6.0 - 6.6. Must be power of two.
var kSize = 2048;
var kMask = kSize - 1;

// The FixedQueue is implemented as a singly-linked list of fixed-size
// circular buffers. It looks something like this:
//
//  head                                                       tail
//    |                                                          |
//    v                                                          v
// +-----------+ <-----\       +-----------+ <------\         +-----------+
// |  [null]   |        \----- |   next    |         \------- |   next    |
// +-----------+               +-----------+                  +-----------+
// |   item    | <-- bottom    |   item    | <-- bottom       | undefined |
// |   item    |               |   item    |                  | undefined |
// |   item    |               |   item    |                  | undefined |
// |   item    |               |   item    |                  | undefined |
// |   item    |               |   item    |       bottom --> |   item    |
// |   item    |               |   item    |                  |   item    |
// |    ...    |               |    ...    |                  |    ...    |
// |   item    |               |   item    |                  |   item    |
// |   item    |               |   item    |                  |   item    |
// | undefined | <-- top       |   item    |                  |   item    |
// | undefined |               |   item    |                  |   item    |
// | undefined |               | undefined | <-- top  top --> | undefined |
// +-----------+               +-----------+                  +-----------+
//
// Or, if there is only one circular buffer, it looks something
// like either of these:
//
//  head   tail                                 head   tail
//    |     |                                     |     |
//    v     v                                     v     v
// +-----------+                               +-----------+
// |  [null]   |                               |  [null]   |
// +-----------+                               +-----------+
// | undefined |                               |   item    |
// | undefined |                               |   item    |
// |   item    | <-- bottom            top --> | undefined |
// |   item    |                               | undefined |
// | undefined | <-- top            bottom --> |   item    |
// | undefined |                               |   item    |
// +-----------+                               +-----------+
//
// Adding a value means moving `top` forward by one, removing means
// moving `bottom` forward by one. After reaching the end, the queue
// wraps around.
//
// When `top === bottom` the current queue is empty and when
// `top + 1 === bottom` it's full. This wastes a single space of storage
// but allows much quicker checks.
var FixedCircularBuffer = /*#__PURE__*/function () {
  function FixedCircularBuffer() {
    _classCallCheck(this, FixedCircularBuffer);
    this.bottom = 0;
    this.top = 0;
    this.list = ArrayPrototypeFill(new Array(kSize), undefined);
    this.next = null;
  }
  return _createClass(FixedCircularBuffer, [{
    key: "isEmpty",
    value: function isEmpty() {
      return this.top === this.bottom;
    }
  }, {
    key: "isFull",
    value: function isFull() {
      return (this.top + 1 & kMask) === this.bottom;
    }
  }, {
    key: "push",
    value: function push(data) {
      this.list[this.top] = data;
      this.top = this.top + 1 & kMask;
    }
  }, {
    key: "shift",
    value: function shift() {
      var nextItem = this.list[this.bottom];
      if (nextItem === undefined) return null;
      this.list[this.bottom] = undefined;
      this.bottom = this.bottom + 1 & kMask;
      return nextItem;
    }
  }]);
}();
module.exports = (_FixedQueue = /*#__PURE__*/function () {
  function FixedQueue() {
    _classCallCheck(this, FixedQueue);
    this.head = this.tail = _assertClassBrand(_FixedQueue, FixedQueue, _pool)._.pop() ?? new FixedCircularBuffer();
  }
  return _createClass(FixedQueue, [{
    key: "isEmpty",
    value: function isEmpty() {
      return this.head.isEmpty();
    }
  }, {
    key: "push",
    value: function push(data) {
      if (this.head.isFull()) {
        // Head is full: Creates a new queue, sets the old queue's `.next` to it,
        // and sets it as the new main queue.
        this.head = this.head.next = _assertClassBrand(_FixedQueue, FixedQueue, _pool)._.pop() ?? new FixedCircularBuffer();
      }
      this.head.push(data);
    }
  }, {
    key: "shift",
    value: function shift() {
      var tail = this.tail;
      var next = tail.shift();
      if (tail.isEmpty() && tail.next !== null) {
        // If there is another queue, it forms the new tail.
        this.tail = tail.next;
        tail.next = null;
        tail.bottom = 0;
        tail.top = 0;
        if (_assertClassBrand(_FixedQueue, FixedQueue, _pool)._.length < 64) {
          _assertClassBrand(_FixedQueue, FixedQueue, _pool)._.push(tail); // Recycle old tail
        }
      }
      return next;
    }
  }]);
}(), _pool = {
  _: []
}, _FixedQueue);

