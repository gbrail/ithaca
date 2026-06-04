'use strict';

var _excluded = ["start", "end", "highWaterMark", "encoding", "fd"],
  _excluded2 = ["highWaterMark"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  MathMin
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  Readable,
  Writable
} = require('stream');
var {
  createEBADF
} = require('internal/vfs/errors');
var {
  getVirtualFd
} = require('internal/vfs/fd');
var {
  kEmptyObject
} = require('internal/util');
var {
  validateInteger
} = require('internal/validators');
var {
  codes: {
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');

/**
 * A readable stream for virtual files.
 */
var _vfs = /*#__PURE__*/new WeakMap();
var _path = /*#__PURE__*/new WeakMap();
var _fd = /*#__PURE__*/new WeakMap();
var _end = /*#__PURE__*/new WeakMap();
var _pos = /*#__PURE__*/new WeakMap();
var _content = /*#__PURE__*/new WeakMap();
var _autoClose = /*#__PURE__*/new WeakMap();
var _VirtualReadStream_brand = /*#__PURE__*/new WeakSet();
var VirtualReadStream = /*#__PURE__*/function (_Readable) {
  /**
   * @param {VirtualFileSystem} vfs The VFS instance
   * @param {string} filePath The path to the file
   * @param {object} [options] Stream options
   */
  function VirtualReadStream(vfs, filePath) {
    var _this;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
    _classCallCheck(this, VirtualReadStream);
    var {
        start,
        end,
        highWaterMark = 64 * 1024,
        encoding,
        fd
      } = options,
      streamOptions = _objectWithoutProperties(options, _excluded);

    // Validate start/end matching real ReadStream behavior
    if (start !== undefined) {
      validateInteger(start, 'start', 0);
    }
    if (end !== undefined && end !== Infinity) {
      validateInteger(end, 'end', 0);
    }
    if (start !== undefined && end !== undefined && end !== Infinity && start > end) {
      throw new ERR_OUT_OF_RANGE('start', `<= "end" (here: ${end})`, start);
    }
    _this = _callSuper(this, VirtualReadStream, [_objectSpread(_objectSpread({}, streamOptions), {}, {
      highWaterMark,
      encoding
    })]);
    /**
     * Opens the virtual file.
     * Events are emitted synchronously within this method, which runs
     * asynchronously via process.nextTick - matching real fs behavior.
     */
    _classPrivateMethodInitSpec(_this, _VirtualReadStream_brand);
    _classPrivateFieldInitSpec(_this, _vfs, void 0);
    _classPrivateFieldInitSpec(_this, _path, void 0);
    _classPrivateFieldInitSpec(_this, _fd, null);
    _classPrivateFieldInitSpec(_this, _end, void 0);
    _classPrivateFieldInitSpec(_this, _pos, void 0);
    _classPrivateFieldInitSpec(_this, _content, null);
    _classPrivateFieldInitSpec(_this, _autoClose, void 0);
    /**
     * Number of bytes read so far.
     * @type {number}
     */
    _defineProperty(_this, "bytesRead", 0);
    /**
     * True until the first read completes.
     * @type {boolean}
     */
    _defineProperty(_this, "pending", true);
    _classPrivateFieldSet(_vfs, _this, vfs);
    _classPrivateFieldSet(_path, _this, filePath);
    _classPrivateFieldSet(_end, _this, end === undefined ? Infinity : end);
    _classPrivateFieldSet(_pos, _this, start === undefined ? 0 : start);
    _classPrivateFieldSet(_autoClose, _this, options.autoClose !== false);
    if (fd !== null && fd !== undefined) {
      // Use the already-open file descriptor
      _classPrivateFieldSet(_fd, _this, fd);
      process.nextTick(() => {
        _this.emit('open', _classPrivateFieldGet(_fd, _this));
        _this.emit('ready');
      });
    } else {
      // Open the file on next tick so listeners can be attached.
      // Note: #openFile will not throw - if it fails, the stream is destroyed.
      process.nextTick(() => _assertClassBrand(_VirtualReadStream_brand, _this, _openFile).call(_this));
    }
    return _this;
  }

  /**
   * Gets the file path.
   * @returns {string}
   */
  _inherits(VirtualReadStream, _Readable);
  return _createClass(VirtualReadStream, [{
    key: "path",
    get: function () {
      return _classPrivateFieldGet(_path, this);
    }
  }, {
    key: "_read",
    value:
    /**
     * Implements the readable _read method.
     * @param {number} size Number of bytes to read
     */
    function _read(size) {
      if (this.destroyed || _classPrivateFieldGet(_fd, this) === null) {
        this.destroy(createEBADF('read'));
        return;
      }

      // Load content on first read (lazy loading)
      if (_classPrivateFieldGet(_content, this) === null) {
        try {
          var vfd = getVirtualFd(_classPrivateFieldGet(_fd, this));
          if (!vfd) {
            this.destroy(createEBADF('read'));
            return;
          }
          // Use the file handle's readFileSync to get content
          _classPrivateFieldSet(_content, this, vfd.entry.readFileSync());
          this.pending = false;
        } catch (err) {
          this.destroy(err);
          return;
        }
      }

      // Calculate how much to read
      // Note: end is inclusive, so we use end + 1 for the upper bound
      var endPos = _classPrivateFieldGet(_end, this) === Infinity ? _classPrivateFieldGet(_content, this).length : _classPrivateFieldGet(_end, this) + 1;
      var remaining = MathMin(endPos, _classPrivateFieldGet(_content, this).length) - _classPrivateFieldGet(_pos, this);
      if (remaining <= 0) {
        this.push(null);
        return;
      }
      var bytesToRead = MathMin(size, remaining);
      var chunk = _classPrivateFieldGet(_content, this).subarray(_classPrivateFieldGet(_pos, this), _classPrivateFieldGet(_pos, this) + bytesToRead);
      _classPrivateFieldSet(_pos, this, _classPrivateFieldGet(_pos, this) + bytesToRead);
      this.bytesRead += bytesToRead;
      this.push(chunk);

      // Check if we've reached the end
      if (_classPrivateFieldGet(_pos, this) >= endPos || _classPrivateFieldGet(_pos, this) >= _classPrivateFieldGet(_content, this).length) {
        this.push(null);
      }
    }

    /**
     * Closes the file descriptor.
     * Note: Does not emit 'close' - the base Readable class handles that.
     */
  }, {
    key: "_destroy",
    value:
    /**
     * Implements the readable _destroy method.
     * @param {Error|null} err The error
     * @param {Function} callback Callback
     */
    function _destroy(err, callback) {
      if (_classPrivateFieldGet(_autoClose, this)) {
        _assertClassBrand(_VirtualReadStream_brand, this, _close).call(this);
      }
      callback(err);
    }
  }]);
}(Readable);
/**
 * A writable stream for virtual files.
 */
function _openFile() {
  try {
    _classPrivateFieldSet(_fd, this, _classPrivateFieldGet(_vfs, this).openSync(_classPrivateFieldGet(_path, this)));
    this.emit('open', _classPrivateFieldGet(_fd, this));
    this.emit('ready');
  } catch (err) {
    this.destroy(err);
  }
}
function _close() {
  if (_classPrivateFieldGet(_fd, this) !== null) {
    try {
      _classPrivateFieldGet(_vfs, this).closeSync(_classPrivateFieldGet(_fd, this));
    } catch {
      // Ignore close errors
    }
    _classPrivateFieldSet(_fd, this, null);
  }
}
var _vfs2 = /*#__PURE__*/new WeakMap();
var _path2 = /*#__PURE__*/new WeakMap();
var _fd2 = /*#__PURE__*/new WeakMap();
var _autoClose2 = /*#__PURE__*/new WeakMap();
var _start = /*#__PURE__*/new WeakMap();
var _VirtualWriteStream_brand = /*#__PURE__*/new WeakSet();
var VirtualWriteStream = /*#__PURE__*/function (_Writable) {
  /**
   * @param {VirtualFileSystem} vfs The VFS instance
   * @param {string} filePath The path to the file
   * @param {object} [options] Stream options
   */
  function VirtualWriteStream(vfs, filePath) {
    var _this2;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
    _classCallCheck(this, VirtualWriteStream);
    var {
        highWaterMark = 64 * 1024
      } = options,
      streamOptions = _objectWithoutProperties(options, _excluded2);

    // Validate start matching real WriteStream behavior
    if (options.start !== undefined) {
      validateInteger(options.start, 'start', 0);
    }
    _this2 = _callSuper(this, VirtualWriteStream, [_objectSpread(_objectSpread({}, streamOptions), {}, {
      highWaterMark
    })]);
    /**
     * Sets the file handle position for the given fd.
     * @param {number} pos The position to set
     */
    _classPrivateMethodInitSpec(_this2, _VirtualWriteStream_brand);
    _classPrivateFieldInitSpec(_this2, _vfs2, void 0);
    _classPrivateFieldInitSpec(_this2, _path2, void 0);
    _classPrivateFieldInitSpec(_this2, _fd2, null);
    _classPrivateFieldInitSpec(_this2, _autoClose2, void 0);
    _classPrivateFieldInitSpec(_this2, _start, void 0);
    /**
     * Number of bytes written so far.
     * @type {number}
     */
    _defineProperty(_this2, "bytesWritten", 0);
    /**
     * True until the first write completes.
     * @type {boolean}
     */
    _defineProperty(_this2, "pending", true);
    _classPrivateFieldSet(_vfs2, _this2, vfs);
    _classPrivateFieldSet(_path2, _this2, filePath);
    _classPrivateFieldSet(_autoClose2, _this2, options.autoClose !== false);
    _classPrivateFieldSet(_start, _this2, options.start);
    var fd = options.fd;
    if (fd !== null && fd !== undefined) {
      // Use the already-open file descriptor
      _classPrivateFieldSet(_fd2, _this2, fd);
      if (_classPrivateFieldGet(_start, _this2) !== undefined) {
        _assertClassBrand(_VirtualWriteStream_brand, _this2, _setPosition).call(_this2, _classPrivateFieldGet(_start, _this2));
      }
      process.nextTick(() => {
        _this2.emit('open', _classPrivateFieldGet(_fd2, _this2));
        _this2.emit('ready');
      });
    } else {
      // Open file synchronously (VFS is in-memory) so writes can proceed
      // immediately. Emit events on next tick for listener attachment.
      var flags = options.flags || 'w';
      try {
        _classPrivateFieldSet(_fd2, _this2, _classPrivateFieldGet(_vfs2, _this2).openSync(_classPrivateFieldGet(_path2, _this2), flags));
        if (_classPrivateFieldGet(_start, _this2) !== undefined) {
          _assertClassBrand(_VirtualWriteStream_brand, _this2, _setPosition).call(_this2, _classPrivateFieldGet(_start, _this2));
        }
      } catch (err) {
        process.nextTick(() => _this2.destroy(err));
        return _possibleConstructorReturn(_this2);
      }
      process.nextTick(() => {
        _this2.emit('open', _classPrivateFieldGet(_fd2, _this2));
        _this2.emit('ready');
      });
    }
    return _this2;
  }
  _inherits(VirtualWriteStream, _Writable);
  return _createClass(VirtualWriteStream, [{
    key: "path",
    get:
    /**
     * Gets the file path.
     * @returns {string}
     */
    function () {
      return _classPrivateFieldGet(_path2, this);
    }

    /**
     * Implements the writable _write method.
     * @param {Buffer|string} chunk Data to write
     * @param {string} encoding Encoding
     * @param {Function} callback Callback
     */
  }, {
    key: "_write",
    value: function _write(chunk, encoding, callback) {
      if (this.destroyed || _classPrivateFieldGet(_fd2, this) === null) {
        callback(createEBADF('write'));
        return;
      }
      try {
        var buffer = typeof chunk === 'string' ? Buffer.from(chunk, encoding) : chunk;
        _classPrivateFieldGet(_vfs2, this).writeSync(_classPrivateFieldGet(_fd2, this), buffer, 0, buffer.length, null);
        this.bytesWritten += buffer.length;
        this.pending = false;
        callback();
      } catch (err) {
        callback(err);
      }
    }

    /**
     * Implements the writable _final method (flush before close).
     * @param {Function} callback Callback
     */
  }, {
    key: "_final",
    value: function _final(callback) {
      callback();
    }

    /**
     * Closes the file descriptor.
     */
  }, {
    key: "_destroy",
    value:
    /**
     * Implements the writable _destroy method.
     * @param {Error|null} err The error
     * @param {Function} callback Callback
     */
    function _destroy(err, callback) {
      if (_classPrivateFieldGet(_autoClose2, this)) {
        _assertClassBrand(_VirtualWriteStream_brand, this, _close2).call(this);
      }
      callback(err);
    }
  }]);
}(Writable);
function _setPosition(pos) {
  var vfd = getVirtualFd(_classPrivateFieldGet(_fd2, this));
  if (vfd) {
    vfd.entry.position = pos;
  }
}
function _close2() {
  if (_classPrivateFieldGet(_fd2, this) !== null) {
    try {
      _classPrivateFieldGet(_vfs2, this).closeSync(_classPrivateFieldGet(_fd2, this));
    } catch {
      // Ignore close errors
    }
    _classPrivateFieldSet(_fd2, this, null);
  }
}
module.exports = {
  VirtualReadStream,
  VirtualWriteStream
};

