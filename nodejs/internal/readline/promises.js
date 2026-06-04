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
  ArrayPrototypePush,
  Promise
} = primordials;
var {
  CSI
} = require('internal/readline/utils');
var {
  validateBoolean,
  validateInteger
} = require('internal/validators');
var {
  isWritable
} = require('internal/streams/utils');
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = require('internal/errors');
var {
  kClearToLineBeginning,
  kClearToLineEnd,
  kClearLine,
  kClearScreenDown
} = CSI;
var _autoCommit = /*#__PURE__*/new WeakMap();
var _stream = /*#__PURE__*/new WeakMap();
var _todo = /*#__PURE__*/new WeakMap();
var Readline = /*#__PURE__*/function () {
  function Readline(stream) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    _classCallCheck(this, Readline);
    _classPrivateFieldInitSpec(this, _autoCommit, false);
    _classPrivateFieldInitSpec(this, _stream, void 0);
    _classPrivateFieldInitSpec(this, _todo, []);
    if (!isWritable(stream)) throw new ERR_INVALID_ARG_TYPE('stream', 'Writable', stream);
    _classPrivateFieldSet(_stream, this, stream);
    if (options?.autoCommit != null) {
      validateBoolean(options.autoCommit, 'options.autoCommit');
      _classPrivateFieldSet(_autoCommit, this, options.autoCommit);
    }
  }

  /**
   * Moves the cursor to the x and y coordinate on the given stream.
   * @param {integer} x
   * @param {integer} [y]
   * @returns {Readline} this
   */
  return _createClass(Readline, [{
    key: "cursorTo",
    value: function cursorTo(x) {
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      validateInteger(x, 'x');
      if (y != null) validateInteger(y, 'y');
      var data = y == null ? CSI`${x + 1}G` : CSI`${y + 1};${x + 1}H`;
      if (_classPrivateFieldGet(_autoCommit, this)) process.nextTick(() => _classPrivateFieldGet(_stream, this).write(data));else ArrayPrototypePush(_classPrivateFieldGet(_todo, this), data);
      return this;
    }

    /**
     * Moves the cursor relative to its current location.
     * @param {integer} dx
     * @param {integer} dy
     * @returns {Readline} this
     */
  }, {
    key: "moveCursor",
    value: function moveCursor(dx, dy) {
      if (dx || dy) {
        validateInteger(dx, 'dx');
        validateInteger(dy, 'dy');
        var data = '';
        if (dx < 0) {
          data += CSI`${-dx}D`;
        } else if (dx > 0) {
          data += CSI`${dx}C`;
        }
        if (dy < 0) {
          data += CSI`${-dy}A`;
        } else if (dy > 0) {
          data += CSI`${dy}B`;
        }
        if (_classPrivateFieldGet(_autoCommit, this)) process.nextTick(() => _classPrivateFieldGet(_stream, this).write(data));else ArrayPrototypePush(_classPrivateFieldGet(_todo, this), data);
      }
      return this;
    }

    /**
     * Clears the current line the cursor is on.
     * @param {-1|0|1} dir Direction to clear:
     *   -1 for left of the cursor
     *   +1 for right of the cursor
     *   0 for the entire line
     * @returns {Readline} this
     */
  }, {
    key: "clearLine",
    value: function clearLine(dir) {
      validateInteger(dir, 'dir', -1, 1);
      var data = dir < 0 ? kClearToLineBeginning : dir > 0 ? kClearToLineEnd : kClearLine;
      if (_classPrivateFieldGet(_autoCommit, this)) process.nextTick(() => _classPrivateFieldGet(_stream, this).write(data));else ArrayPrototypePush(_classPrivateFieldGet(_todo, this), data);
      return this;
    }

    /**
     * Clears the screen from the current position of the cursor down.
     * @returns {Readline} this
     */
  }, {
    key: "clearScreenDown",
    value: function clearScreenDown() {
      if (_classPrivateFieldGet(_autoCommit, this)) {
        process.nextTick(() => _classPrivateFieldGet(_stream, this).write(kClearScreenDown));
      } else {
        ArrayPrototypePush(_classPrivateFieldGet(_todo, this), kClearScreenDown);
      }
      return this;
    }

    /**
     * Sends all the pending actions to the associated `stream` and clears the
     * internal list of pending actions.
     * @returns {Promise<void>} Resolves when all pending actions have been
     *   flushed to the associated `stream`.
     */
  }, {
    key: "commit",
    value: function commit() {
      return new Promise(resolve => {
        _classPrivateFieldGet(_stream, this).write(ArrayPrototypeJoin(_classPrivateFieldGet(_todo, this), ''), resolve);
        _classPrivateFieldSet(_todo, this, []);
      });
    }

    /**
     * Clears the internal list of pending actions without sending it to the
     * associated `stream`.
     * @returns {Readline} this
     */
  }, {
    key: "rollback",
    value: function rollback() {
      _classPrivateFieldSet(_todo, this, []);
      return this;
    }
  }]);
}();
module.exports = {
  Readline
};

