'use strict';

// This file is derived from the original SonicBoom module
// MIT License
// Copyright (c) 2017 Matteo Collina
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypePush,
  MathMax,
  SymbolDispose
} = primordials;
var {
  sleep
} = require('internal/util');
var {
  Buffer
} = require('buffer');
var fs = require('fs');
var EventEmitter = require('events');
var path = require('path');
var {
  clearInterval,
  setInterval,
  setTimeout
} = require('timers');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE,
    ERR_OPERATION_FAILED
  }
} = require('internal/errors');
var {
  validateBoolean,
  validateFunction,
  validateObject,
  validateOneOf,
  validateString,
  validateUint32
} = require('internal/validators');
var BUSY_WRITE_TIMEOUT = 100;
var kEmptyBuffer = Buffer.allocUnsafe(0);

// 16 KB. Don't write more than docker buffer size.
// https://github.com/moby/moby/blob/513ec73831269947d38a644c278ce3cac36783b2/daemon/logger/copier.go#L13
var kMaxWrite = 16 * 1024;
var kContentModeBuffer = 'buffer';
var kContentModeUtf8 = 'utf8';
var kNullPrototype = {
  __proto__: null
};

// Utf8Stream is a port of the original SonicBoom module
// (https://github.com/pinojs/sonic-boom) that provides a fast and efficient
// way to write UTF-8 encoded data to a file or stream.
var _len = /*#__PURE__*/new WeakMap();
var _fd = /*#__PURE__*/new WeakMap();
var _bufs = /*#__PURE__*/new WeakMap();
var _lens = /*#__PURE__*/new WeakMap();
var _writing = /*#__PURE__*/new WeakMap();
var _ending = /*#__PURE__*/new WeakMap();
var _reopening = /*#__PURE__*/new WeakMap();
var _asyncDrainScheduled = /*#__PURE__*/new WeakMap();
var _flushPending = /*#__PURE__*/new WeakMap();
var _hwm = /*#__PURE__*/new WeakMap();
var _file = /*#__PURE__*/new WeakMap();
var _destroyed = /*#__PURE__*/new WeakMap();
var _minLength = /*#__PURE__*/new WeakMap();
var _maxLength = /*#__PURE__*/new WeakMap();
var _maxWrite = /*#__PURE__*/new WeakMap();
var _opening = /*#__PURE__*/new WeakMap();
var _periodicFlush = /*#__PURE__*/new WeakMap();
var _periodicFlushTimer = /*#__PURE__*/new WeakMap();
var _sync = /*#__PURE__*/new WeakMap();
var _fsync = /*#__PURE__*/new WeakMap();
var _append = /*#__PURE__*/new WeakMap();
var _mode = /*#__PURE__*/new WeakMap();
var _retryEAGAIN = /*#__PURE__*/new WeakMap();
var _mkdir = /*#__PURE__*/new WeakMap();
var _writingBuf = /*#__PURE__*/new WeakMap();
var _write = /*#__PURE__*/new WeakMap();
var _flush = /*#__PURE__*/new WeakMap();
var _flushSync = /*#__PURE__*/new WeakMap();
var _actualWrite = /*#__PURE__*/new WeakMap();
var _fsWriteSync = /*#__PURE__*/new WeakMap();
var _fsWrite = /*#__PURE__*/new WeakMap();
var _fs = /*#__PURE__*/new WeakMap();
var _Utf8Stream_brand = /*#__PURE__*/new WeakSet();
var Utf8Stream = /*#__PURE__*/function (_EventEmitter) {
  /**
   * @typedef {object} Utf8StreamOptions
   * @property {string} [dest] - path to the file to write to
   * @property {number} [fd] - file descriptor to write to
   * @property {number} [minLength] - minimum length of the internal buffer before a write is triggered
   * @property {number} [maxLength] - maximum length of the internal buffer before writes are dropped
   * @property {number} [maxWrite] - maximum size of a single write operation (default 16384)
   * @property {number} [periodicFlush] - interval in ms to flush the stream periodically (default 0, disabled)
   * @property {boolean} [sync] - if true, writes are performed synchronously (default false)
   * @property {boolean} [fsync] - if true, fsync is called after every write (default false)
   * @property {boolean} [append] - if true, data is appended to the file (default true, ignored
   *   if fd is provided)
   * @property {string} [contentMode] - 'utf8' or 'buffer'
   * @property {string} [mode] - file mode (permission and sticky bits), default is 0o666
   * @property {boolean} [mkdir] - if true, the directory path will be created if it does not exist (default false)
   * @property {Function} [retryEAGAIN] - function that receives (err, writingBufLength,
   *   remainingBufLength) and returns true if EAGAIN/EBUSY should be retried
   * @property {object} [fs] - custom fs implementation, must provide write, writeSync, fsync,
   *   fsyncSync, close, open, mkdir, mkdirSync methods. Mostly useful for testing.
   * @param {Utf8StreamOptions} [options]
   */
  function Utf8Stream() {
    var _this;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototype;
    _classCallCheck(this, Utf8Stream);
    validateObject(options, 'options');
    var {
      fd: _fd2
    } = options;
    var {
      dest,
      minLength,
      maxLength,
      maxWrite,
      periodicFlush,
      sync,
      append = true,
      mkdir,
      retryEAGAIN,
      fsync,
      contentMode = kContentModeUtf8,
      mode: _mode2,
      // Provides for a custom fs implementation. Mostly useful for testing.
      fs: overrideFs = {}
    } = options;
    _this = _callSuper(this, Utf8Stream);
    _classPrivateMethodInitSpec(_this, _Utf8Stream_brand);
    _classPrivateFieldInitSpec(_this, _len, 0);
    _classPrivateFieldInitSpec(_this, _fd, -1);
    _classPrivateFieldInitSpec(_this, _bufs, []);
    _classPrivateFieldInitSpec(_this, _lens, []);
    _classPrivateFieldInitSpec(_this, _writing, false);
    _classPrivateFieldInitSpec(_this, _ending, false);
    _classPrivateFieldInitSpec(_this, _reopening, false);
    _classPrivateFieldInitSpec(_this, _asyncDrainScheduled, false);
    _classPrivateFieldInitSpec(_this, _flushPending, false);
    _classPrivateFieldInitSpec(_this, _hwm, 16387);
    // 16 KB
    _classPrivateFieldInitSpec(_this, _file, null);
    _classPrivateFieldInitSpec(_this, _destroyed, false);
    _classPrivateFieldInitSpec(_this, _minLength, 0);
    _classPrivateFieldInitSpec(_this, _maxLength, 0);
    _classPrivateFieldInitSpec(_this, _maxWrite, kMaxWrite);
    _classPrivateFieldInitSpec(_this, _opening, false);
    _classPrivateFieldInitSpec(_this, _periodicFlush, 0);
    _classPrivateFieldInitSpec(_this, _periodicFlushTimer, undefined);
    _classPrivateFieldInitSpec(_this, _sync, false);
    _classPrivateFieldInitSpec(_this, _fsync, false);
    _classPrivateFieldInitSpec(_this, _append, true);
    _classPrivateFieldInitSpec(_this, _mode, 0o666);
    _classPrivateFieldInitSpec(_this, _retryEAGAIN, () => true);
    _classPrivateFieldInitSpec(_this, _mkdir, false);
    _classPrivateFieldInitSpec(_this, _writingBuf, '');
    _classPrivateFieldInitSpec(_this, _write, void 0);
    _classPrivateFieldInitSpec(_this, _flush, void 0);
    _classPrivateFieldInitSpec(_this, _flushSync, void 0);
    _classPrivateFieldInitSpec(_this, _actualWrite, void 0);
    _classPrivateFieldInitSpec(_this, _fsWriteSync, void 0);
    _classPrivateFieldInitSpec(_this, _fsWrite, void 0);
    _classPrivateFieldInitSpec(_this, _fs, void 0);
    _fd2 ??= dest;
    validateObject(overrideFs, 'options.fs');
    _classPrivateFieldSet(_fs, _this, _objectSpread(_objectSpread({}, fs), overrideFs));
    validateFunction(_classPrivateFieldGet(_fs, _this).write, 'options.fs.write');
    validateFunction(_classPrivateFieldGet(_fs, _this).writeSync, 'options.fs.writeSync');
    validateFunction(_classPrivateFieldGet(_fs, _this).fsync, 'options.fs.fsync');
    validateFunction(_classPrivateFieldGet(_fs, _this).fsyncSync, 'options.fs.fsyncSync');
    validateFunction(_classPrivateFieldGet(_fs, _this).close, 'options.fs.close');
    validateFunction(_classPrivateFieldGet(_fs, _this).open, 'options.fs.open');
    validateFunction(_classPrivateFieldGet(_fs, _this).mkdir, 'options.fs.mkdir');
    validateFunction(_classPrivateFieldGet(_fs, _this).mkdirSync, 'options.fs.mkdirSync');
    _classPrivateFieldSet(_hwm, _this, MathMax(minLength || 0, _classPrivateFieldGet(_hwm, _this)));
    _classPrivateFieldSet(_minLength, _this, minLength || 0);
    _classPrivateFieldSet(_maxLength, _this, maxLength || 0);
    _classPrivateFieldSet(_maxWrite, _this, maxWrite || kMaxWrite);
    _classPrivateFieldSet(_periodicFlush, _this, periodicFlush || 0);
    _classPrivateFieldSet(_sync, _this, sync || false);
    _classPrivateFieldSet(_fsync, _this, fsync || false);
    _classPrivateFieldSet(_append, _this, append || false);
    _classPrivateFieldSet(_mode, _this, _mode2);
    _classPrivateFieldSet(_retryEAGAIN, _this, retryEAGAIN || (() => true));
    _classPrivateFieldSet(_mkdir, _this, mkdir || false);
    validateUint32(_classPrivateFieldGet(_hwm, _this), 'options.hwm');
    validateUint32(_classPrivateFieldGet(_minLength, _this), 'options.minLength');
    validateUint32(_classPrivateFieldGet(_maxLength, _this), 'options.maxLength');
    validateUint32(_classPrivateFieldGet(_maxWrite, _this), 'options.maxWrite');
    validateUint32(_classPrivateFieldGet(_periodicFlush, _this), 'options.periodicFlush');
    validateBoolean(_classPrivateFieldGet(_sync, _this), 'options.sync');
    validateBoolean(_classPrivateFieldGet(_fsync, _this), 'options.fsync');
    validateBoolean(_classPrivateFieldGet(_append, _this), 'options.append');
    validateBoolean(_classPrivateFieldGet(_mkdir, _this), 'options.mkdir');
    validateFunction(_classPrivateFieldGet(_retryEAGAIN, _this), 'options.retryEAGAIN');
    validateOneOf(contentMode, 'options.contentMode', [kContentModeBuffer, kContentModeUtf8]);
    if (contentMode === kContentModeBuffer) {
      _classPrivateFieldSet(_writingBuf, _this, kEmptyBuffer);
      _classPrivateFieldSet(_write, _this, function () {
        var _assertClassBrand2;
        for (var _len2 = arguments.length, args = new Array(_len2), _key = 0; _key < _len2; _key++) {
          args[_key] = arguments[_key];
        }
        return (_assertClassBrand2 = _assertClassBrand(_Utf8Stream_brand, _this, _writeBuffer)).call.apply(_assertClassBrand2, [_this].concat(args));
      });
      _classPrivateFieldSet(_flush, _this, function () {
        var _assertClassBrand3;
        for (var _len3 = arguments.length, args = new Array(_len3), _key2 = 0; _key2 < _len3; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return (_assertClassBrand3 = _assertClassBrand(_Utf8Stream_brand, _this, _flushBuffer)).call.apply(_assertClassBrand3, [_this].concat(args));
      });
      _classPrivateFieldSet(_flushSync, _this, function () {
        var _assertClassBrand4;
        for (var _len4 = arguments.length, args = new Array(_len4), _key3 = 0; _key3 < _len4; _key3++) {
          args[_key3] = arguments[_key3];
        }
        return (_assertClassBrand4 = _assertClassBrand(_Utf8Stream_brand, _this, _flushBufferSync)).call.apply(_assertClassBrand4, [_this].concat(args));
      });
      _classPrivateFieldSet(_actualWrite, _this, function () {
        var _assertClassBrand5;
        for (var _len5 = arguments.length, args = new Array(_len5), _key4 = 0; _key4 < _len5; _key4++) {
          args[_key4] = arguments[_key4];
        }
        return (_assertClassBrand5 = _assertClassBrand(_Utf8Stream_brand, _this, _actualWriteBuffer)).call.apply(_assertClassBrand5, [_this].concat(args));
      });
      _classPrivateFieldSet(_fsWriteSync, _this, () => _classPrivateFieldGet(_fs, _this).writeSync(_classPrivateFieldGet(_fd, _this), _classPrivateFieldGet(_writingBuf, _this)));
      _classPrivateFieldSet(_fsWrite, _this, () => _classPrivateFieldGet(_fs, _this).write(_classPrivateFieldGet(_fd, _this), _classPrivateFieldGet(_writingBuf, _this), function () {
        var _assertClassBrand6;
        for (var _len6 = arguments.length, args = new Array(_len6), _key5 = 0; _key5 < _len6; _key5++) {
          args[_key5] = arguments[_key5];
        }
        return (_assertClassBrand6 = _assertClassBrand(_Utf8Stream_brand, _this, _release)).call.apply(_assertClassBrand6, [_this].concat(args));
      }));
    } else {
      _classPrivateFieldSet(_writingBuf, _this, '');
      _classPrivateFieldSet(_write, _this, function () {
        var _assertClassBrand7;
        for (var _len7 = arguments.length, args = new Array(_len7), _key6 = 0; _key6 < _len7; _key6++) {
          args[_key6] = arguments[_key6];
        }
        return (_assertClassBrand7 = _assertClassBrand(_Utf8Stream_brand, _this, _writeUtf)).call.apply(_assertClassBrand7, [_this].concat(args));
      });
      _classPrivateFieldSet(_flush, _this, function () {
        var _assertClassBrand8;
        for (var _len8 = arguments.length, args = new Array(_len8), _key7 = 0; _key7 < _len8; _key7++) {
          args[_key7] = arguments[_key7];
        }
        return (_assertClassBrand8 = _assertClassBrand(_Utf8Stream_brand, _this, _flushUtf)).call.apply(_assertClassBrand8, [_this].concat(args));
      });
      _classPrivateFieldSet(_flushSync, _this, function () {
        var _assertClassBrand9;
        for (var _len9 = arguments.length, args = new Array(_len9), _key8 = 0; _key8 < _len9; _key8++) {
          args[_key8] = arguments[_key8];
        }
        return (_assertClassBrand9 = _assertClassBrand(_Utf8Stream_brand, _this, _flushSyncUtf)).call.apply(_assertClassBrand9, [_this].concat(args));
      });
      _classPrivateFieldSet(_actualWrite, _this, function () {
        var _assertClassBrand0;
        for (var _len0 = arguments.length, args = new Array(_len0), _key9 = 0; _key9 < _len0; _key9++) {
          args[_key9] = arguments[_key9];
        }
        return (_assertClassBrand0 = _assertClassBrand(_Utf8Stream_brand, _this, _actualWriteUtf)).call.apply(_assertClassBrand0, [_this].concat(args));
      });
      _classPrivateFieldSet(_fsWriteSync, _this, () => _classPrivateFieldGet(_fs, _this).writeSync(_classPrivateFieldGet(_fd, _this), _classPrivateFieldGet(_writingBuf, _this), 'utf8'));
      _classPrivateFieldSet(_fsWrite, _this, () => _classPrivateFieldGet(_fs, _this).write(_classPrivateFieldGet(_fd, _this), _classPrivateFieldGet(_writingBuf, _this), 'utf8', function () {
        var _assertClassBrand1;
        for (var _len1 = arguments.length, args = new Array(_len1), _key0 = 0; _key0 < _len1; _key0++) {
          args[_key0] = arguments[_key0];
        }
        return (_assertClassBrand1 = _assertClassBrand(_Utf8Stream_brand, _this, _release)).call.apply(_assertClassBrand1, [_this].concat(args));
      }));
    }

    // TODO(@jasnell): Support passing in an AbortSignal to cancel the stream.

    // TODO(@jasnell): Support FileHandle here as well?

    // TODO(@jasnell): The `dest` option is a path string. We may consider
    // also supporting URL and Buffer types here as well like the rest of
    // the fs module APIs do.

    if (typeof _fd2 === 'number') {
      _classPrivateFieldSet(_fd, _this, _fd2);
      process.nextTick(() => _this.emit('ready'));
    } else if (typeof _fd2 === 'string') {
      _assertClassBrand(_Utf8Stream_brand, _this, _openFile).call(_this, _fd2);
    } else {
      throw new ERR_INVALID_ARG_TYPE('fd', ['number', 'string'], _fd2);
    }
    if (_classPrivateFieldGet(_minLength, _this) >= _classPrivateFieldGet(_maxWrite, _this)) {
      throw new ERR_INVALID_ARG_VALUE.RangeError('minLength', _classPrivateFieldGet(_minLength, _this), `should be smaller than maxWrite (${_classPrivateFieldGet(_maxWrite, _this)})`);
    }
    _this.on('newListener', name => {
      if (name === 'drain') {
        _classPrivateFieldSet(_asyncDrainScheduled, _this, false);
      }
    });
    if (_classPrivateFieldGet(_periodicFlush, _this) !== 0) {
      _classPrivateFieldSet(_periodicFlushTimer, _this, setInterval(() => _this.flush(null), _classPrivateFieldGet(_periodicFlush, _this)));
      _classPrivateFieldGet(_periodicFlushTimer, _this).unref();
    }
    return _this;
  }

  /**
   * @param {string|Buffer} data
   * @returns {boolean}
   */
  _inherits(Utf8Stream, _EventEmitter);
  return _createClass(Utf8Stream, [{
    key: "write",
    value: function write(data) {
      return _classPrivateFieldGet(_write, this).call(this, data);
    }

    /**
     * @callback FlushCallback
     * @param {Error} [err] - Error if any
     * @returns {void}
     */

    /**
     * @param {FlushCallback} [cb]
     */
  }, {
    key: "flush",
    value: function flush() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (_err) {};
      _classPrivateFieldGet(_flush, this).call(this, cb);
    }
  }, {
    key: "flushSync",
    value: function flushSync() {
      return _classPrivateFieldGet(_flushSync, this).call(this);
    }

    /**
     * @param {string} [file]
     */
  }, {
    key: "reopen",
    value: function reopen(file) {
      if (_classPrivateFieldGet(_destroyed, this)) {
        throw new ERR_INVALID_STATE('Utf8Stream is destroyed');
      }
      if (_classPrivateFieldGet(_opening, this)) {
        this.once('ready', () => this.reopen(file));
        return;
      }
      if (_classPrivateFieldGet(_ending, this)) {
        return;
      }
      if (!_classPrivateFieldGet(_file, this)) {
        throw new ERR_OPERATION_FAILED('Unable to reopen a file descriptor, you must pass a file to SonicBoom');
      }
      if (file) {
        _classPrivateFieldSet(_file, this, file);
      }
      _classPrivateFieldSet(_reopening, this, true);
      if (_classPrivateFieldGet(_writing, this)) {
        return;
      }
      var fd = _classPrivateFieldGet(_fd, this);
      this.once('ready', () => {
        if (fd !== _classPrivateFieldGet(_fd, this)) {
          _classPrivateFieldGet(_fs, this).close(fd, err => {
            if (err) {
              return this.emit('error', err);
            }
          });
        }
      });
      _assertClassBrand(_Utf8Stream_brand, this, _openFile).call(this, _classPrivateFieldGet(_file, this));
    }
  }, {
    key: "end",
    value: function end() {
      if (_classPrivateFieldGet(_destroyed, this)) {
        throw new ERR_INVALID_STATE('Utf8Stream is destroyed');
      }
      if (_classPrivateFieldGet(_opening, this)) {
        this.once('ready', () => {
          this.end();
        });
        return;
      }
      if (_classPrivateFieldGet(_ending, this)) {
        return;
      }
      _classPrivateFieldSet(_ending, this, true);
      if (_classPrivateFieldGet(_writing, this)) {
        return;
      }
      if (_classPrivateFieldGet(_len, this) > 0 && _classPrivateFieldGet(_fd, this) >= 0) {
        _classPrivateFieldGet(_actualWrite, this).call(this);
      } else {
        _assertClassBrand(_Utf8Stream_brand, this, _actualClose).call(this);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (_classPrivateFieldGet(_destroyed, this)) {
        return;
      }
      _assertClassBrand(_Utf8Stream_brand, this, _actualClose).call(this);
    }

    /** @type {number} */
  }, {
    key: "mode",
    get: function () {
      return _classPrivateFieldGet(_mode, this);
    }

    /** @type {string|undefined} */
  }, {
    key: "file",
    get: function () {
      return _classPrivateFieldGet(_file, this);
    }

    /** @type {number} */
  }, {
    key: "fd",
    get: function () {
      return _classPrivateFieldGet(_fd, this);
    }

    /** @type {number} */
  }, {
    key: "minLength",
    get: function () {
      return _classPrivateFieldGet(_minLength, this);
    }

    /** @type {number} */
  }, {
    key: "maxLength",
    get: function () {
      return _classPrivateFieldGet(_maxLength, this);
    }

    /** @type {boolean} */
  }, {
    key: "writing",
    get: function () {
      return _classPrivateFieldGet(_writing, this);
    }

    /** @type {boolean} */
  }, {
    key: "sync",
    get: function () {
      return _classPrivateFieldGet(_sync, this);
    }

    /** @type {boolean} */
  }, {
    key: "fsync",
    get: function () {
      return _classPrivateFieldGet(_fsync, this);
    }

    /** @type {boolean} */
  }, {
    key: "append",
    get: function () {
      return _classPrivateFieldGet(_append, this);
    }

    /** @type {number} */
  }, {
    key: "periodicFlush",
    get: function () {
      return _classPrivateFieldGet(_periodicFlush, this);
    }

    /** @type {'buffer'|'utf8'} */
  }, {
    key: "contentMode",
    get: function () {
      return _classPrivateFieldGet(_writingBuf, this) instanceof Buffer ? kContentModeBuffer : kContentModeUtf8;
    }

    /** @type {boolean} */
  }, {
    key: "mkdir",
    get: function () {
      return _classPrivateFieldGet(_mkdir, this);
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.destroy();
    }
  }]);
}(EventEmitter);
/**
 * Release the writingBuf after fs.write n bytes data
 * @param {string | Buffer} writingBuf - currently writing buffer, usually be instance._writingBuf.
 * @param {number} len - currently buffer length, usually be instance._len.
 * @param {number} n - number of bytes fs already written
 * @returns {{writingBuf: string | Buffer, len: number}} released writingBuf and length
 */
function _release(err, n) {
  if (err) {
    if ((err.code === 'EAGAIN' || err.code === 'EBUSY') && _classPrivateFieldGet(_retryEAGAIN, this).call(this, err, _classPrivateFieldGet(_writingBuf, this).length, _classPrivateFieldGet(_len, this) - _classPrivateFieldGet(_writingBuf, this).length)) {
      if (_classPrivateFieldGet(_sync, this)) {
        // This error code should not happen in sync mode, because it is
        // not using the underlining operating system asynchronous functions.
        // However it happens, and so we handle it.
        // Ref: https://github.com/pinojs/pino/issues/783
        try {
          sleep(BUSY_WRITE_TIMEOUT);
          _assertClassBrand(_Utf8Stream_brand, this, _release).call(this, undefined, 0);
        } catch (err) {
          _assertClassBrand(_Utf8Stream_brand, this, _release).call(this, err);
        }
      } else {
        // Let's give the destination some time to process the chunk.
        setTimeout(() => _classPrivateFieldGet(_fsWrite, this).call(this), BUSY_WRITE_TIMEOUT);
      }
    } else {
      _classPrivateFieldSet(_writing, this, false);
      this.emit('error', err);
    }
    return;
  }
  this.emit('write', n);
  var releasedBufObj = releaseWritingBuf(_classPrivateFieldGet(_writingBuf, this), _classPrivateFieldGet(_len, this), n);
  _classPrivateFieldSet(_len, this, releasedBufObj.len);
  _classPrivateFieldSet(_writingBuf, this, releasedBufObj.writingBuf);
  if (_classPrivateFieldGet(_writingBuf, this).length) {
    if (!_classPrivateFieldGet(_sync, this)) {
      _classPrivateFieldGet(_fsWrite, this).call(this);
      return;
    }
    try {
      do {
        var _n = _classPrivateFieldGet(_fsWriteSync, this).call(this);
        var _releasedBufObj = releaseWritingBuf(_classPrivateFieldGet(_writingBuf, this), _classPrivateFieldGet(_len, this), _n);
        _classPrivateFieldSet(_len, this, _releasedBufObj.len);
        _classPrivateFieldSet(_writingBuf, this, _releasedBufObj.writingBuf);
      } while (_classPrivateFieldGet(_writingBuf, this).length);
    } catch (err) {
      _assertClassBrand(_Utf8Stream_brand, this, _release).call(this, err);
      return;
    }
  }
  if (_classPrivateFieldGet(_fsync, this)) {
    _classPrivateFieldGet(_fs, this).fsyncSync(_classPrivateFieldGet(_fd, this));
  }
  var len = _classPrivateFieldGet(_len, this);
  if (_classPrivateFieldGet(_reopening, this)) {
    _classPrivateFieldSet(_writing, this, false);
    _classPrivateFieldSet(_reopening, this, false);
    this.reopen();
  } else if (len > _classPrivateFieldGet(_minLength, this)) {
    _classPrivateFieldGet(_actualWrite, this).call(this);
  } else if (_classPrivateFieldGet(_ending, this)) {
    if (len > 0) {
      _classPrivateFieldGet(_actualWrite, this).call(this);
    } else {
      _classPrivateFieldSet(_writing, this, false);
      _assertClassBrand(_Utf8Stream_brand, this, _actualClose).call(this);
    }
  } else {
    _classPrivateFieldSet(_writing, this, false);
    if (_classPrivateFieldGet(_sync, this)) {
      if (!_classPrivateFieldGet(_asyncDrainScheduled, this)) {
        _classPrivateFieldSet(_asyncDrainScheduled, this, true);
        process.nextTick(() => _assertClassBrand(_Utf8Stream_brand, this, _emitDrain).call(this));
      }
    } else {
      this.emit('drain');
    }
  }
}
function _openFile(file) {
  _classPrivateFieldSet(_opening, this, true);
  _classPrivateFieldSet(_writing, this, true);
  _classPrivateFieldSet(_asyncDrainScheduled, this, false);

  // NOTE: 'error' and 'ready' events emitted below only relevant when sonic.sync===false
  // for sync mode, there is no way to add a listener that will receive these

  var fileOpened = (err, fd) => {
    if (err) {
      _classPrivateFieldSet(_reopening, this, false);
      _classPrivateFieldSet(_writing, this, false);
      _classPrivateFieldSet(_opening, this, false);
      if (_classPrivateFieldGet(_sync, this)) {
        process.nextTick(() => {
          if (this.listenerCount('error') > 0) {
            this.emit('error', err);
          }
        });
      } else {
        this.emit('error', err);
      }
      return;
    }
    var reopening = _classPrivateFieldGet(_reopening, this);
    _classPrivateFieldSet(_fd, this, fd);
    _classPrivateFieldSet(_file, this, file);
    _classPrivateFieldSet(_reopening, this, false);
    _classPrivateFieldSet(_opening, this, false);
    _classPrivateFieldSet(_writing, this, false);
    if (_classPrivateFieldGet(_sync, this)) {
      process.nextTick(() => this.emit('ready'));
    } else {
      this.emit('ready');
    }
    if (_classPrivateFieldGet(_destroyed, this)) {
      return;
    }

    // start
    if (!_classPrivateFieldGet(_writing, this) && _classPrivateFieldGet(_len, this) > _classPrivateFieldGet(_minLength, this) || _classPrivateFieldGet(_flushPending, this)) {
      _classPrivateFieldGet(_actualWrite, this).call(this);
    } else if (reopening) {
      process.nextTick(() => this.emit('drain'));
    }
  };
  var flags = _classPrivateFieldGet(_append, this) ? 'a' : 'w';
  var mode = _classPrivateFieldGet(_mode, this);
  if (_classPrivateFieldGet(_sync, this)) {
    try {
      if (_classPrivateFieldGet(_mkdir, this)) _classPrivateFieldGet(_fs, this).mkdirSync(path.dirname(file), {
        recursive: true
      });
      var fd = _classPrivateFieldGet(_fs, this).openSync(file, flags, mode);
      fileOpened(null, fd);
    } catch (err) {
      fileOpened(err);
      throw err;
    }
  } else if (_classPrivateFieldGet(_mkdir, this)) {
    _classPrivateFieldGet(_fs, this).mkdir(path.dirname(file), {
      recursive: true
    }, err => {
      if (err) return fileOpened(err);
      _classPrivateFieldGet(_fs, this).open(file, flags, mode, fileOpened);
    });
  } else {
    _classPrivateFieldGet(_fs, this).open(file, flags, mode, fileOpened);
  }
}
function _emitDrain() {
  var hasListeners = this.listenerCount('drain') > 0;
  if (!hasListeners) return;
  _classPrivateFieldSet(_asyncDrainScheduled, this, false);
  this.emit('drain');
}
function _actualClose() {
  if (_classPrivateFieldGet(_fd, this) === -1) {
    this.once('ready', () => _assertClassBrand(_Utf8Stream_brand, this, _actualClose).call(this));
    return;
  }
  if (_classPrivateFieldGet(_periodicFlushTimer, this) !== undefined) {
    clearInterval(_classPrivateFieldGet(_periodicFlushTimer, this));
  }
  _classPrivateFieldSet(_destroyed, this, true);
  _classPrivateFieldSet(_bufs, this, []);
  _classPrivateFieldSet(_lens, this, []);
  var done = err => {
    if (err) {
      this.emit('error', err);
      return;
    }
    if (_classPrivateFieldGet(_ending, this) && !_classPrivateFieldGet(_writing, this)) {
      this.emit('finish');
    }
    this.emit('close');
  };
  var closeWrapped = () => {
    // We skip errors in fsync
    if (_classPrivateFieldGet(_fd, this) !== 1 && _classPrivateFieldGet(_fd, this) !== 2) {
      _classPrivateFieldGet(_fs, this).close(_classPrivateFieldGet(_fd, this), done);
    } else {
      done();
    }
  };
  try {
    _classPrivateFieldGet(_fs, this).fsync(_classPrivateFieldGet(_fd, this), closeWrapped);
  } catch {
    // Intentionally empty.
  }
}
function _actualWriteBuffer() {
  var _this2 = this;
  _classPrivateFieldSet(_writing, this, true);
  _classPrivateFieldSet(_writingBuf, this, _classPrivateFieldGet(_writingBuf, this).length ? _classPrivateFieldGet(_writingBuf, this) : mergeBuf(_classPrivateFieldGet(_bufs, this).shift(), _classPrivateFieldGet(_lens, this).shift()));
  if (_classPrivateFieldGet(_sync, this)) {
    try {
      var written = _classPrivateFieldGet(_fs, this).writeSync(_classPrivateFieldGet(_fd, this), _classPrivateFieldGet(_writingBuf, this));
      _assertClassBrand(_Utf8Stream_brand, this, _release).call(this, null, written);
    } catch (err) {
      _assertClassBrand(_Utf8Stream_brand, this, _release).call(this, err);
    }
  } else {
    // fs.write will need to copy string to buffer anyway so
    // we do it here to avoid the overhead of calculating the buffer size
    // in releaseWritingBuf.
    _classPrivateFieldSet(_writingBuf, this, Buffer.from(_classPrivateFieldGet(_writingBuf, this)));
    _classPrivateFieldGet(_fs, this).write(_classPrivateFieldGet(_fd, this), _classPrivateFieldGet(_writingBuf, this), function () {
      var _assertClassBrand10;
      for (var _len10 = arguments.length, args = new Array(_len10), _key1 = 0; _key1 < _len10; _key1++) {
        args[_key1] = arguments[_key1];
      }
      return (_assertClassBrand10 = _assertClassBrand(_Utf8Stream_brand, _this2, _release)).call.apply(_assertClassBrand10, [_this2].concat(args));
    });
  }
}
function _actualWriteUtf() {
  var _this3 = this;
  _classPrivateFieldSet(_writing, this, true);
  _classPrivateFieldGet(_writingBuf, this) || _classPrivateFieldSet(_writingBuf, this, _classPrivateFieldGet(_bufs, this).shift() || '');
  if (_classPrivateFieldGet(_sync, this)) {
    try {
      var written = _classPrivateFieldGet(_fs, this).writeSync(_classPrivateFieldGet(_fd, this), _classPrivateFieldGet(_writingBuf, this), 'utf8');
      _assertClassBrand(_Utf8Stream_brand, this, _release).call(this, null, written);
    } catch (err) {
      _assertClassBrand(_Utf8Stream_brand, this, _release).call(this, err);
    }
  } else {
    _classPrivateFieldGet(_fs, this).write(_classPrivateFieldGet(_fd, this), _classPrivateFieldGet(_writingBuf, this), 'utf8', function () {
      var _assertClassBrand11;
      for (var _len11 = arguments.length, args = new Array(_len11), _key10 = 0; _key10 < _len11; _key10++) {
        args[_key10] = arguments[_key10];
      }
      return (_assertClassBrand11 = _assertClassBrand(_Utf8Stream_brand, _this3, _release)).call.apply(_assertClassBrand11, [_this3].concat(args));
    });
  }
}
function _flushBufferSync() {
  if (_classPrivateFieldGet(_destroyed, this)) {
    throw new ERR_INVALID_STATE('Utf8Stream is destroyed');
  }
  if (_classPrivateFieldGet(_fd, this) < 0) {
    throw new ERR_INVALID_STATE('Invalid file descriptor');
  }
  if (!_classPrivateFieldGet(_writing, this) && _classPrivateFieldGet(_writingBuf, this).length > 0) {
    _classPrivateFieldGet(_bufs, this).unshift([_classPrivateFieldGet(_writingBuf, this)]);
    _classPrivateFieldSet(_writingBuf, this, kEmptyBuffer);
  }
  var buf = kEmptyBuffer;
  while (_classPrivateFieldGet(_bufs, this).length || buf.length) {
    if (buf.length <= 0) {
      buf = mergeBuf(_classPrivateFieldGet(_bufs, this)[0], _classPrivateFieldGet(_lens, this)[0]);
    }
    try {
      var n = _classPrivateFieldGet(_fs, this).writeSync(_classPrivateFieldGet(_fd, this), buf);
      buf = buf.subarray(n);
      _classPrivateFieldSet(_len, this, MathMax(_classPrivateFieldGet(_len, this) - n, 0));
      if (buf.length <= 0) {
        _classPrivateFieldGet(_bufs, this).shift();
        _classPrivateFieldGet(_lens, this).shift();
      }
    } catch (err) {
      var shouldRetry = err.code === 'EAGAIN' || err.code === 'EBUSY';
      if (shouldRetry && !_classPrivateFieldGet(_retryEAGAIN, this).call(this, err, buf.length, _classPrivateFieldGet(_len, this) - buf.length)) {
        throw err;
      }
      sleep(BUSY_WRITE_TIMEOUT);
    }
  }
}
function _flushSyncUtf() {
  if (_classPrivateFieldGet(_destroyed, this)) {
    throw new ERR_INVALID_STATE('Utf8Stream is destroyed');
  }
  if (_classPrivateFieldGet(_fd, this) < 0) {
    throw new ERR_INVALID_STATE('Invalid file descriptor');
  }
  if (!_classPrivateFieldGet(_writing, this) && _classPrivateFieldGet(_writingBuf, this).length > 0) {
    _classPrivateFieldGet(_bufs, this).unshift(_classPrivateFieldGet(_writingBuf, this));
    _classPrivateFieldSet(_writingBuf, this, '');
  }
  var buf = '';
  while (_classPrivateFieldGet(_bufs, this).length || buf) {
    if (buf.length <= 0) {
      buf = _classPrivateFieldGet(_bufs, this)[0];
    }
    try {
      var n = _classPrivateFieldGet(_fs, this).writeSync(_classPrivateFieldGet(_fd, this), buf, 'utf8');
      var releasedBufObj = releaseWritingBuf(buf, _classPrivateFieldGet(_len, this), n);
      buf = releasedBufObj.writingBuf;
      _classPrivateFieldSet(_len, this, releasedBufObj.len);
      if (buf.length <= 0) {
        _classPrivateFieldGet(_bufs, this).shift();
      }
    } catch (err) {
      var shouldRetry = err.code === 'EAGAIN' || err.code === 'EBUSY';
      if (shouldRetry && !_classPrivateFieldGet(_retryEAGAIN, this).call(this, err, buf.length, _classPrivateFieldGet(_len, this) - buf.length)) {
        throw err;
      }
      sleep(BUSY_WRITE_TIMEOUT);
    }
  }
  try {
    _classPrivateFieldGet(_fs, this).fsyncSync(_classPrivateFieldGet(_fd, this));
  } catch {
    // Skip the error. The fd might not support fsync.
  }
}
function _callFlushCallbackOnDrain(cb) {
  _classPrivateFieldSet(_flushPending, this, true);
  var onDrain = () => {
    // Only if _fsync is false to avoid double fsync
    if (!_classPrivateFieldGet(_fsync, this) && !_classPrivateFieldGet(_destroyed, this)) {
      try {
        _classPrivateFieldGet(_fs, this).fsync(_classPrivateFieldGet(_fd, this), err => {
          _classPrivateFieldSet(_flushPending, this, false);
          // If the fd is closed, we ignore the error.
          if (err?.code === 'EBADF') {
            cb();
            return;
          }
          cb(err);
        });
      } catch (err) {
        _classPrivateFieldSet(_flushPending, this, false);
        cb(err);
      }
    } else {
      _classPrivateFieldSet(_flushPending, this, false);
      cb();
    }
    this.off('error', onError);
  };
  var onError = err => {
    _classPrivateFieldSet(_flushPending, this, false);
    cb(err);
    this.off('drain', onDrain);
  };
  this.once('drain', onDrain);
  this.once('error', onError);
}
function _flushBuffer(cb) {
  validateFunction(cb, 'cb');
  if (_classPrivateFieldGet(_destroyed, this)) {
    var error = new ERR_INVALID_STATE('Utf8Stream is destroyed');
    if (cb) {
      cb(error);
      return;
    }
    throw error;
  }
  if (_classPrivateFieldGet(_minLength, this) <= 0) {
    cb?.();
    return;
  }
  if (cb) {
    _assertClassBrand(_Utf8Stream_brand, this, _callFlushCallbackOnDrain).call(this, cb);
  }
  if (_classPrivateFieldGet(_writing, this)) {
    return;
  }
  if (_classPrivateFieldGet(_bufs, this).length === 0) {
    ArrayPrototypePush(_classPrivateFieldGet(_bufs, this), []);
    ArrayPrototypePush(_classPrivateFieldGet(_lens, this), 0);
  }
  _classPrivateFieldGet(_actualWrite, this).call(this);
}
function _flushUtf(cb) {
  validateFunction(cb, 'cb');
  if (_classPrivateFieldGet(_destroyed, this)) {
    var error = new ERR_INVALID_STATE('Utf8Stream is destroyed');
    if (cb) {
      cb(error);
      return;
    }
    throw error;
  }
  if (_classPrivateFieldGet(_minLength, this) <= 0) {
    cb?.();
    return;
  }
  if (cb) {
    _assertClassBrand(_Utf8Stream_brand, this, _callFlushCallbackOnDrain).call(this, cb);
  }
  if (_classPrivateFieldGet(_writing, this)) {
    return;
  }
  if (_classPrivateFieldGet(_bufs, this).length === 0) {
    ArrayPrototypePush(_classPrivateFieldGet(_bufs, this), '');
  }
  _classPrivateFieldGet(_actualWrite, this).call(this);
}
function _writeBuffer(data) {
  if (_classPrivateFieldGet(_destroyed, this)) {
    throw new ERR_INVALID_STATE('Utf8Stream is destroyed');
  }

  // TODO(@jasnell): Support any ArrayBufferView type here, not just Buffer.
  if (!Buffer.isBuffer(data)) {
    throw new ERR_INVALID_ARG_TYPE('data', 'Buffer', data);
  }
  var len = _classPrivateFieldGet(_len, this) + data.length;
  var bufs = _classPrivateFieldGet(_bufs, this);
  var lens = _classPrivateFieldGet(_lens, this);
  if (_classPrivateFieldGet(_maxLength, this) && len > _classPrivateFieldGet(_maxLength, this)) {
    this.emit('drop', data);
    return _classPrivateFieldGet(_len, this) < _classPrivateFieldGet(_hwm, this);
  }
  if (bufs.length === 0 || lens[lens.length - 1] + data.length > _classPrivateFieldGet(_maxWrite, this)) {
    ArrayPrototypePush(bufs, []);
    ArrayPrototypePush(lens, data.length);
  } else {
    ArrayPrototypePush(bufs[bufs.length - 1], data);
    lens[lens.length - 1] += data.length;
  }
  _classPrivateFieldSet(_len, this, len);
  if (!_classPrivateFieldGet(_writing, this) && _classPrivateFieldGet(_len, this) >= _classPrivateFieldGet(_minLength, this)) {
    _classPrivateFieldGet(_actualWrite, this).call(this);
  }
  return _classPrivateFieldGet(_len, this) < _classPrivateFieldGet(_hwm, this);
}
function _writeUtf(data) {
  if (_classPrivateFieldGet(_destroyed, this)) {
    throw new ERR_INVALID_STATE('Utf8Stream is destroyed');
  }
  validateString(data, 'data');
  var len = _classPrivateFieldGet(_len, this) + data.length;
  var bufs = _classPrivateFieldGet(_bufs, this);
  if (_classPrivateFieldGet(_maxLength, this) && len > _classPrivateFieldGet(_maxLength, this)) {
    this.emit('drop', data);
    return _classPrivateFieldGet(_len, this) < _classPrivateFieldGet(_hwm, this);
  }
  if (bufs.length === 0 || bufs[bufs.length - 1].length + data.length > _classPrivateFieldGet(_maxWrite, this)) {
    ArrayPrototypePush(bufs, '' + data);
  } else {
    bufs[bufs.length - 1] += data;
  }
  _classPrivateFieldSet(_len, this, len);
  if (!_classPrivateFieldGet(_writing, this) && _classPrivateFieldGet(_len, this) >= _classPrivateFieldGet(_minLength, this)) {
    _classPrivateFieldGet(_actualWrite, this).call(this);
  }
  return _classPrivateFieldGet(_len, this) < _classPrivateFieldGet(_hwm, this);
}
function releaseWritingBuf(writingBuf, len, n) {
  if (typeof writingBuf === 'string') {
    var byteLength = Buffer.byteLength(writingBuf);
    if (byteLength !== n) {
      // Since fs.write returns the number of bytes written, we need to find
      // how many complete characters fit within those n bytes.
      // If a partial write splits a multi-byte UTF-8 character, we must back up
      // to the start of that character to avoid data corruption.
      var buf = Buffer.from(writingBuf);
      // Back up from position n to find a valid UTF-8 character boundary.
      // UTF-8 continuation bytes have the pattern 10xxxxxx (0x80-0xBF).
      // We need to find the start of the character that was split.
      while (n > 0 && (buf[n] & 0xC0) === 0x80) {
        n--;
      }
      // Decode the properly-aligned bytes to get the character count.
      n = buf.subarray(0, n).toString().length;
    }
  }
  len = MathMax(len - n, 0);
  writingBuf = writingBuf.slice(n);
  return {
    writingBuf,
    len
  };
}
function mergeBuf(bufs, len) {
  if (bufs.length === 0) {
    return kEmptyBuffer;
  }
  if (bufs.length === 1) {
    return bufs[0];
  }
  return Buffer.concat(bufs, len);
}
module.exports = Utf8Stream;

