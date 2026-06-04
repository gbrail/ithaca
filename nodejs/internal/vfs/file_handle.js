'use strict';

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
var _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;
    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        var value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _forTo(array, body, check) {
  var i = -1,
    pact,
    reject;
  function _cycle(result) {
    try {
      while (++i < array.length && (!check || !check())) {
        result = body(i);
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
            return;
          }
        }
      }
      if (pact) {
        _settle(pact, 1, result);
      } else {
        pact = result;
      }
    } catch (e) {
      _settle(pact || (pact = new _Pact()), 2, e);
    }
  }
  _cycle();
  return pact;
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  DateNow,
  MathMax,
  MathMin,
  Number: _Number,
  Symbol: _Symbol,
  SymbolAsyncDispose,
  SymbolDispose
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  codes: {
    ERR_INVALID_STATE,
    ERR_METHOD_NOT_IMPLEMENTED
  }
} = require('internal/errors');
var {
  createEBADF
} = require('internal/vfs/errors');

// Private symbols
var kPath = _Symbol('kPath');
var kFlags = _Symbol('kFlags');
var kMode = _Symbol('kMode');
var kPosition = _Symbol('kPosition');
var kClosed = _Symbol('kClosed');

/**
 * Base class for virtual file handles.
 * Provides the interface that file handles must implement.
 */
var _VirtualFileHandle_brand = /*#__PURE__*/new WeakSet();
var VirtualFileHandle = /*#__PURE__*/function () {
  /**
   * @param {string} path The file path
   * @param {string} flags The open flags
   * @param {number} [mode] The file mode
   */
  function VirtualFileHandle(path, flags, mode) {
    _classCallCheck(this, VirtualFileHandle);
    /**
     * Throws if the handle is closed.
     * @param {string} syscall The syscall name for the error
     */
    _classPrivateMethodInitSpec(this, _VirtualFileHandle_brand);
    this[kPath] = path;
    this[kFlags] = flags;
    this[kMode] = mode ?? 0o644;
    this[kPosition] = 0;
    this[kClosed] = false;
  }

  /**
   * Gets the file path.
   * @returns {string}
   */
  return _createClass(VirtualFileHandle, [{
    key: "path",
    get: function () {
      return this[kPath];
    }

    /**
     * Gets the open flags.
     * @returns {string}
     */
  }, {
    key: "flags",
    get: function () {
      return this[kFlags];
    }

    /**
     * Gets the file mode.
     * @returns {number}
     */
  }, {
    key: "mode",
    get: function () {
      return this[kMode];
    }

    /**
     * Gets the current position.
     * @returns {number}
     */
  }, {
    key: "position",
    get: function () {
      return this[kPosition];
    }

    /**
     * Sets the current position.
     * @param {number} pos The new position
     */,
    set: function (pos) {
      this[kPosition] = pos;
    }

    /**
     * Returns true if the handle is closed.
     * @returns {boolean}
     */
  }, {
    key: "closed",
    get: function () {
      return this[kClosed];
    }
  }, {
    key: "read",
    value:
    /**
     * Reads data from the file.
     * @param {Buffer} buffer The buffer to read into
     * @param {number} offset The offset in the buffer to start writing
     * @param {number} length The number of bytes to read
     * @param {number|null} position The position to read from (null uses current position)
     * @returns {Promise<{ bytesRead: number, buffer: Buffer }>}
     */
    function read(buffer, offset, length, position) {
      try {
        var _this = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this, _checkClosed).call(_this, 'read');
        throw new ERR_METHOD_NOT_IMPLEMENTED('read');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Reads data from the file synchronously.
     * @param {Buffer} buffer The buffer to read into
     * @param {number} offset The offset in the buffer to start writing
     * @param {number} length The number of bytes to read
     * @param {number|null} position The position to read from (null uses current position)
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "readSync",
    value: function readSync(buffer, offset, length, position) {
      _assertClassBrand(_VirtualFileHandle_brand, this, _checkClosed).call(this, 'read');
      throw new ERR_METHOD_NOT_IMPLEMENTED('readSync');
    }

    /**
     * Writes data to the file.
     * @param {Buffer} buffer The buffer to write from
     * @param {number} offset The offset in the buffer to start reading
     * @param {number} length The number of bytes to write
     * @param {number|null} position The position to write to (null uses current position)
     * @returns {Promise<{ bytesWritten: number, buffer: Buffer }>}
     */
  }, {
    key: "write",
    value: function write(buffer, offset, length, position) {
      try {
        var _this2 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this2, _checkClosed).call(_this2, 'write');
        throw new ERR_METHOD_NOT_IMPLEMENTED('write');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Writes data to the file synchronously.
     * @param {Buffer} buffer The buffer to write from
     * @param {number} offset The offset in the buffer to start reading
     * @param {number} length The number of bytes to write
     * @param {number|null} position The position to write to (null uses current position)
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "writeSync",
    value: function writeSync(buffer, offset, length, position) {
      _assertClassBrand(_VirtualFileHandle_brand, this, _checkClosed).call(this, 'write');
      throw new ERR_METHOD_NOT_IMPLEMENTED('writeSync');
    }

    /**
     * Reads the entire file.
     * @param {object|string} [options] Options or encoding
     * @returns {Promise<Buffer|string>}
     */
  }, {
    key: "readFile",
    value: function readFile(options) {
      try {
        var _this3 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this3, _checkClosed).call(_this3, 'read');
        throw new ERR_METHOD_NOT_IMPLEMENTED('readFile');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Reads the entire file synchronously.
     * @param {object|string} [options] Options or encoding
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "readFileSync",
    value: function readFileSync(options) {
      _assertClassBrand(_VirtualFileHandle_brand, this, _checkClosed).call(this, 'read');
      throw new ERR_METHOD_NOT_IMPLEMENTED('readFileSync');
    }

    /**
     * Writes data to the file (replacing content).
     * @param {Buffer|string} data The data to write
     * @param {object} [options] Options
     * @returns {Promise<void>}
     */
  }, {
    key: "writeFile",
    value: function writeFile(data, options) {
      try {
        var _this4 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this4, _checkClosed).call(_this4, 'write');
        throw new ERR_METHOD_NOT_IMPLEMENTED('writeFile');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Writes data to the file synchronously (replacing content).
     * @param {Buffer|string} data The data to write
     * @param {object} [options] Options
     */
  }, {
    key: "writeFileSync",
    value: function writeFileSync(data, options) {
      _assertClassBrand(_VirtualFileHandle_brand, this, _checkClosed).call(this, 'write');
      throw new ERR_METHOD_NOT_IMPLEMENTED('writeFileSync');
    }

    /**
     * Gets file stats.
     * @param {object} [options] Options
     * @returns {Promise<Stats>}
     */
  }, {
    key: "stat",
    value: function stat(options) {
      try {
        var _this5 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this5, _checkClosed).call(_this5, 'fstat');
        throw new ERR_METHOD_NOT_IMPLEMENTED('stat');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Gets file stats synchronously.
     * @param {object} [options] Options
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "statSync",
    value: function statSync(options) {
      _assertClassBrand(_VirtualFileHandle_brand, this, _checkClosed).call(this, 'fstat');
      throw new ERR_METHOD_NOT_IMPLEMENTED('statSync');
    }

    /**
     * Truncates the file.
     * @param {number} [len] The new length
     * @returns {Promise<void>}
     */
  }, {
    key: "truncate",
    value: function truncate(len) {
      try {
        var _this6 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this6, _checkClosed).call(_this6, 'ftruncate');
        throw new ERR_METHOD_NOT_IMPLEMENTED('truncate');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Truncates the file synchronously.
     * @param {number} [len] The new length
     */
  }, {
    key: "truncateSync",
    value: function truncateSync(len) {
      _assertClassBrand(_VirtualFileHandle_brand, this, _checkClosed).call(this, 'ftruncate');
      throw new ERR_METHOD_NOT_IMPLEMENTED('truncateSync');
    }

    /**
     * No-op chmod - VFS files don't have real permissions.
     * @returns {Promise<void>}
     */
  }, {
    key: "chmod",
    value: function chmod() {
      return _await();
    }
    /**
     * No-op chown - VFS files don't have real ownership.
     * @returns {Promise<void>}
     */
  }, {
    key: "chown",
    value: function chown() {
      return _await();
    }
    /**
     * No-op utimes - timestamps are handled by the provider.
     * @returns {Promise<void>}
     */
  }, {
    key: "utimes",
    value: function utimes() {
      return _await();
    }
    /**
     * No-op datasync - VFS is in-memory.
     * @returns {Promise<void>}
     */
  }, {
    key: "datasync",
    value: function datasync() {
      return _await();
    }
    /**
     * No-op sync - VFS is in-memory.
     * @returns {Promise<void>}
     */
  }, {
    key: "sync",
    value: function sync() {
      return _await();
    }
    /**
     * Reads data from the file into multiple buffers.
     * @param {Buffer[]} buffers The buffers to read into
     * @param {number|null} [position] The position to read from
     * @returns {Promise<{ bytesRead: number, buffers: Buffer[] }>}
     */
  }, {
    key: "readv",
    value: function readv(buffers, position) {
      try {
        var _interrupt = false;
        var _this7 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this7, _checkClosed).call(_this7, 'readv');
        var totalRead = 0;
        return _await(_continue(_forTo(buffers, function (i) {
          var buf = buffers[i];
          var pos = position != null ? position + totalRead : null;
          return _await(_this7.read(buf, 0, buf.byteLength, pos), function (_ref) {
            var {
              bytesRead
            } = _ref;
            totalRead += bytesRead;
            if (bytesRead < buf.byteLength) {
              _interrupt = true;
            }
          });
        }, function () {
          return _interrupt;
        }), function () {
          return {
            __proto__: null,
            bytesRead: totalRead,
            buffers
          };
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Writes data from multiple buffers to the file.
     * @param {Buffer[]} buffers The buffers to write from
     * @param {number|null} [position] The position to write to
     * @returns {Promise<{ bytesWritten: number, buffers: Buffer[] }>}
     */
  }, {
    key: "writev",
    value: function writev(buffers, position) {
      try {
        var _interrupt2 = false;
        var _this8 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this8, _checkClosed).call(_this8, 'writev');
        var totalWritten = 0;
        return _await(_continue(_forTo(buffers, function (i) {
          var buf = buffers[i];
          var pos = position != null ? position + totalWritten : null;
          return _await(_this8.write(buf, 0, buf.byteLength, pos), function (_ref2) {
            var {
              bytesWritten
            } = _ref2;
            totalWritten += bytesWritten;
            if (bytesWritten < buf.byteLength) {
              _interrupt2 = true;
            }
          });
        }, function () {
          return _interrupt2;
        }), function () {
          return {
            __proto__: null,
            bytesWritten: totalWritten,
            buffers
          };
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Appends data to the file.
     * @param {Buffer|string} data The data to append
     * @param {object} [options] Options
     * @returns {Promise<void>}
     */
  }, {
    key: "appendFile",
    value: function appendFile(data, options) {
      try {
        var _this9 = this;
        _assertClassBrand(_VirtualFileHandle_brand, _this9, _checkClosed).call(_this9, 'appendFile');
        var buffer = typeof data === 'string' ? Buffer.from(data, options?.encoding) : data;
        return _await(_awaitIgnored(_this9.write(buffer, 0, buffer.length, null)));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "readableWebStream",
    value: function readableWebStream() {
      throw new ERR_METHOD_NOT_IMPLEMENTED('readableWebStream');
    }
  }, {
    key: "readLines",
    value: function readLines() {
      throw new ERR_METHOD_NOT_IMPLEMENTED('readLines');
    }
  }, {
    key: "createReadStream",
    value: function createReadStream() {
      throw new ERR_METHOD_NOT_IMPLEMENTED('createReadStream');
    }
  }, {
    key: "createWriteStream",
    value: function createWriteStream() {
      throw new ERR_METHOD_NOT_IMPLEMENTED('createWriteStream');
    }

    /**
     * Closes the file handle.
     * @returns {Promise<void>}
     */
  }, {
    key: "close",
    value: function close() {
      try {
        var _this0 = this;
        _this0[kClosed] = true;
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Closes the file handle synchronously.
     */
  }, {
    key: "closeSync",
    value: function closeSync() {
      this[kClosed] = true;
    }
  }]);
}();
function _checkClosed(syscall) {
  if (this[kClosed]) {
    throw createEBADF(syscall);
  }
}
VirtualFileHandle.prototype[SymbolAsyncDispose] = VirtualFileHandle.prototype.close;
VirtualFileHandle.prototype[SymbolDispose] = VirtualFileHandle.prototype.closeSync;

/**
 * A file handle for in-memory file content.
 * Used by MemoryProvider and similar providers.
 */
var _content = /*#__PURE__*/new WeakMap();
var _size = /*#__PURE__*/new WeakMap();
var _entry = /*#__PURE__*/new WeakMap();
var _getStats = /*#__PURE__*/new WeakMap();
var _MemoryFileHandle_brand = /*#__PURE__*/new WeakSet();
var MemoryFileHandle = /*#__PURE__*/function (_VirtualFileHandle2) {
  /**
   * @param {string} path The file path
   * @param {string} flags The open flags
   * @param {number} [mode] The file mode
   * @param {Buffer} content The initial file content
   * @param {object} entry The entry object (for updating content)
   * @param {Function} getStats Function to get updated stats
   */
  function MemoryFileHandle(path, flags, mode, content, entry, getStats) {
    var _this1;
    _classCallCheck(this, MemoryFileHandle);
    _this1 = _callSuper(this, MemoryFileHandle, [path, flags, mode]);
    _classPrivateMethodInitSpec(_this1, _MemoryFileHandle_brand);
    _classPrivateFieldInitSpec(_this1, _content, void 0);
    _classPrivateFieldInitSpec(_this1, _size, void 0);
    _classPrivateFieldInitSpec(_this1, _entry, void 0);
    _classPrivateFieldInitSpec(_this1, _getStats, void 0);
    _classPrivateFieldSet(_content, _this1, content);
    _classPrivateFieldSet(_size, _this1, content.length);
    _classPrivateFieldSet(_entry, _this1, entry);
    _classPrivateFieldSet(_getStats, _this1, getStats);

    // Handle different open modes
    if (flags === 'w' || flags === 'w+' || flags === 'wx' || flags === 'wx+') {
      // Write mode: truncate
      _classPrivateFieldSet(_content, _this1, Buffer.alloc(0));
      _classPrivateFieldSet(_size, _this1, 0);
      if (entry) {
        entry.content = _classPrivateFieldGet(_content, _this1);
      }
    } else if (flags === 'a' || flags === 'a+' || flags === 'ax' || flags === 'ax+') {
      // Append mode: position at end
      _this1.position = _classPrivateFieldGet(_size, _this1);
    }
    return _this1;
  }

  /**
   * Throws EBADF if the handle was not opened for writing.
   */
  _inherits(MemoryFileHandle, _VirtualFileHandle2);
  return _createClass(MemoryFileHandle, [{
    key: "content",
    get:
    /**
     * Gets the current content synchronously.
     * For dynamic content providers, this gets fresh content from the entry.
     * @returns {Buffer}
     */
    function () {
      // If entry has a dynamic content provider, get fresh content sync
      if (_classPrivateFieldGet(_entry, this)?.isDynamic && _classPrivateFieldGet(_entry, this).isDynamic()) {
        return _classPrivateFieldGet(_entry, this).getContentSync();
      }
      return _classPrivateFieldGet(_content, this).subarray(0, _classPrivateFieldGet(_size, this));
    }

    /**
     * Gets the current content asynchronously.
     * For dynamic content providers, this gets fresh content from the entry.
     * @returns {Promise<Buffer>}
     */
  }, {
    key: "getContentAsync",
    value: function getContentAsync() {
      try {
        var _this10 = this;
        // If entry has a dynamic content provider, get fresh content async
        if (_classPrivateFieldGet(_entry, _this10)?.getContentAsync) {
          return _await(_classPrivateFieldGet(_entry, _this10).getContentAsync());
        }
        return _await(_classPrivateFieldGet(_content, _this10));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Reads data from the file synchronously.
     * @param {Buffer} buffer The buffer to read into
     * @param {number} offset The offset in the buffer to start writing
     * @param {number} length The number of bytes to read
     * @param {number|null} position The position to read from (null uses current position)
     * @returns {number} The number of bytes read
     */
  }, {
    key: "readSync",
    value: function readSync(buffer, offset, length, position) {
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkClosed2).call(this, 'read');
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkReadable).call(this);

      // Get content (resolves dynamic content providers)
      var content = this.content;
      var readPos = position !== null && position !== undefined ? _Number(position) : this.position;
      var available = content.length - readPos;
      if (available <= 0) {
        return 0;
      }
      var bytesToRead = MathMin(length, available);
      content.copy(buffer, offset, readPos, readPos + bytesToRead);

      // Update position if not using explicit position
      if (position === null || position === undefined) {
        this.position = readPos + bytesToRead;
      }
      return bytesToRead;
    }

    /**
     * Reads data from the file.
     * @param {Buffer} buffer The buffer to read into
     * @param {number} offset The offset in the buffer to start writing
     * @param {number} length The number of bytes to read
     * @param {number|null} position The position to read from (null uses current position)
     * @returns {Promise<{ bytesRead: number, buffer: Buffer }>}
     */
  }, {
    key: "read",
    value: function read(buffer, offset, length, position) {
      try {
        var _this11 = this;
        var bytesRead = _this11.readSync(buffer, offset, length, position);
        return _await({
          __proto__: null,
          bytesRead,
          buffer
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Writes data to the file synchronously.
     * @param {Buffer} buffer The buffer to write from
     * @param {number} offset The offset in the buffer to start reading
     * @param {number} length The number of bytes to write
     * @param {number|null} position The position to write to (null uses current position)
     * @returns {number} The number of bytes written
     */
  }, {
    key: "writeSync",
    value: function writeSync(buffer, offset, length, position) {
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkClosed2).call(this, 'write');
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkWritable).call(this);

      // In append mode, always write at the end
      var writePos = _assertClassBrand(_MemoryFileHandle_brand, this, _isAppend).call(this) ? _classPrivateFieldGet(_size, this) : position !== null && position !== undefined ? _Number(position) : this.position;
      var data = buffer.subarray(offset, offset + length);

      // Expand buffer if needed (geometric doubling for amortized O(1) appends)
      var neededSize = writePos + length;
      if (neededSize > _classPrivateFieldGet(_content, this).length) {
        var newCapacity = MathMax(neededSize, _classPrivateFieldGet(_content, this).length * 2);
        var newContent = Buffer.alloc(newCapacity);
        _classPrivateFieldGet(_content, this).copy(newContent, 0, 0, _classPrivateFieldGet(_size, this));
        _classPrivateFieldSet(_content, this, newContent);
      }

      // Write the data
      data.copy(_classPrivateFieldGet(_content, this), writePos);

      // Update actual content size
      if (neededSize > _classPrivateFieldGet(_size, this)) {
        _classPrivateFieldSet(_size, this, neededSize);
      }

      // Update the entry's content, mtime, and ctime
      if (_classPrivateFieldGet(_entry, this)) {
        var now = DateNow();
        _classPrivateFieldGet(_entry, this).content = _classPrivateFieldGet(_content, this).subarray(0, _classPrivateFieldGet(_size, this));
        _classPrivateFieldGet(_entry, this).mtime = now;
        _classPrivateFieldGet(_entry, this).ctime = now;
      }

      // Update position if not using explicit position
      if (position === null || position === undefined) {
        this.position = writePos + length;
      }
      return length;
    }

    /**
     * Writes data to the file.
     * @param {Buffer} buffer The buffer to write from
     * @param {number} offset The offset in the buffer to start reading
     * @param {number} length The number of bytes to write
     * @param {number|null} position The position to write to (null uses current position)
     * @returns {Promise<{ bytesWritten: number, buffer: Buffer }>}
     */
  }, {
    key: "write",
    value: function write(buffer, offset, length, position) {
      try {
        var _this12 = this;
        var bytesWritten = _this12.writeSync(buffer, offset, length, position);
        return _await({
          __proto__: null,
          bytesWritten,
          buffer
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Reads the entire file synchronously.
     * @param {object|string} [options] Options or encoding
     * @returns {Buffer|string}
     */
  }, {
    key: "readFileSync",
    value: function readFileSync(options) {
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkClosed2).call(this, 'read');
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkReadable).call(this);

      // Get content (resolves dynamic content providers)
      var content = this.content;
      var encoding = typeof options === 'string' ? options : options?.encoding;
      if (encoding) {
        return content.toString(encoding);
      }
      return Buffer.from(content);
    }

    /**
     * Reads the entire file.
     * @param {object|string} [options] Options or encoding
     * @returns {Promise<Buffer|string>}
     */
  }, {
    key: "readFile",
    value: function readFile(options) {
      try {
        var _this13 = this;
        _assertClassBrand(_MemoryFileHandle_brand, _this13, _checkClosed2).call(_this13, 'read');
        _assertClassBrand(_MemoryFileHandle_brand, _this13, _checkReadable).call(_this13);

        // Get content asynchronously (supports async content providers)
        return _await(_this13.getContentAsync(), function (content) {
          var encoding = typeof options === 'string' ? options : options?.encoding;
          return encoding ? content.toString(encoding) : Buffer.from(content);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Writes data to the file synchronously.
     * Replaces content in 'w' mode, appends in 'a' mode.
     * @param {Buffer|string} data The data to write
     * @param {object} [options] Options
     */
  }, {
    key: "writeFileSync",
    value: function writeFileSync(data, options) {
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkClosed2).call(this, 'write');
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkWritable).call(this);
      var buffer = typeof data === 'string' ? Buffer.from(data, options?.encoding) : data;

      // In append mode, append to existing content
      if (_assertClassBrand(_MemoryFileHandle_brand, this, _isAppend).call(this)) {
        var neededSize = _classPrivateFieldGet(_size, this) + buffer.length;
        if (neededSize > _classPrivateFieldGet(_content, this).length) {
          var newCapacity = MathMax(neededSize, _classPrivateFieldGet(_content, this).length * 2);
          var newContent = Buffer.alloc(newCapacity);
          _classPrivateFieldGet(_content, this).copy(newContent, 0, 0, _classPrivateFieldGet(_size, this));
          _classPrivateFieldSet(_content, this, newContent);
        }
        buffer.copy(_classPrivateFieldGet(_content, this), _classPrivateFieldGet(_size, this));
        _classPrivateFieldSet(_size, this, neededSize);
      } else {
        _classPrivateFieldSet(_content, this, Buffer.from(buffer));
        _classPrivateFieldSet(_size, this, buffer.length);
      }

      // Update the entry's content, mtime, and ctime
      if (_classPrivateFieldGet(_entry, this)) {
        var now = DateNow();
        _classPrivateFieldGet(_entry, this).content = _classPrivateFieldGet(_content, this).subarray(0, _classPrivateFieldGet(_size, this));
        _classPrivateFieldGet(_entry, this).mtime = now;
        _classPrivateFieldGet(_entry, this).ctime = now;
      }
      this.position = _classPrivateFieldGet(_size, this);
    }

    /**
     * Writes data to the file (replacing content).
     * @param {Buffer|string} data The data to write
     * @param {object} [options] Options
     * @returns {Promise<void>}
     */
  }, {
    key: "writeFile",
    value: function writeFile(data, options) {
      try {
        var _this14 = this;
        _this14.writeFileSync(data, options);
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Gets file stats synchronously.
     * @param {object} [options] Options
     * @returns {Stats}
     */
  }, {
    key: "statSync",
    value: function statSync(options) {
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkClosed2).call(this, 'fstat');
      if (_classPrivateFieldGet(_getStats, this)) {
        return _classPrivateFieldGet(_getStats, this).call(this, _classPrivateFieldGet(_size, this));
      }
      throw new ERR_INVALID_STATE('stats not available');
    }

    /**
     * Gets file stats.
     * @param {object} [options] Options
     * @returns {Promise<Stats>}
     */
  }, {
    key: "stat",
    value: function stat(options) {
      try {
        var _this15 = this;
        return _await(_this15.statSync(options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Truncates the file synchronously.
     * @param {number} [len] The new length
     */
  }, {
    key: "truncateSync",
    value: function truncateSync() {
      var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkClosed2).call(this, 'ftruncate');
      _assertClassBrand(_MemoryFileHandle_brand, this, _checkWritable).call(this);
      if (len < _classPrivateFieldGet(_size, this)) {
        // Zero out truncated region to avoid stale data
        _classPrivateFieldGet(_content, this).fill(0, len, _classPrivateFieldGet(_size, this));
        _classPrivateFieldSet(_size, this, len);
      } else if (len > _classPrivateFieldGet(_size, this)) {
        if (len > _classPrivateFieldGet(_content, this).length) {
          var newContent = Buffer.alloc(len);
          _classPrivateFieldGet(_content, this).copy(newContent, 0, 0, _classPrivateFieldGet(_size, this));
          _classPrivateFieldSet(_content, this, newContent);
        } else {
          // Buffer has enough capacity, just zero-fill the extension
          _classPrivateFieldGet(_content, this).fill(0, _classPrivateFieldGet(_size, this), len);
        }
        _classPrivateFieldSet(_size, this, len);
      }

      // Update the entry's content, mtime, and ctime
      if (_classPrivateFieldGet(_entry, this)) {
        var now = DateNow();
        _classPrivateFieldGet(_entry, this).content = _classPrivateFieldGet(_content, this).subarray(0, _classPrivateFieldGet(_size, this));
        _classPrivateFieldGet(_entry, this).mtime = now;
        _classPrivateFieldGet(_entry, this).ctime = now;
      }
    }

    /**
     * Truncates the file.
     * @param {number} [len] The new length
     * @returns {Promise<void>}
     */
  }, {
    key: "truncate",
    value: function truncate(len) {
      try {
        var _this16 = this;
        _this16.truncateSync(len);
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);
}(VirtualFileHandle);
function _checkClosed2(syscall) {
  if (this.closed) {
    throw createEBADF(syscall);
  }
}
function _checkWritable() {
  if (this.flags === 'r') {
    throw createEBADF('write');
  }
}
/**
 * Throws EBADF if the handle was not opened for reading.
 */
function _checkReadable() {
  var f = this.flags;
  if (f === 'w' || f === 'a' || f === 'wx' || f === 'ax') {
    throw createEBADF('read');
  }
}
/**
 * Returns true if this handle was opened in append mode.
 * @returns {boolean}
 */
function _isAppend() {
  var f = this.flags;
  return f === 'a' || f === 'a+' || f === 'ax' || f === 'ax+';
}
module.exports = {
  VirtualFileHandle,
  MemoryFileHandle
};

