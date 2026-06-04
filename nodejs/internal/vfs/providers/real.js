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
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
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
  Promise,
  StringPrototypeStartsWith
} = primordials;
var fs = require('fs');
var path = require('path');
var {
  VirtualProvider
} = require('internal/vfs/provider');
var {
  VirtualFileHandle
} = require('internal/vfs/file_handle');
var {
  getValidatedPath
} = require('internal/fs/utils');
var {
  setOwnProperty
} = require('internal/util');
var {
  createEACCES,
  createEBADF,
  createENOENT
} = require('internal/vfs/errors');

/**
 * A file handle that wraps a real file descriptor.
 */
// TODO(mcollina): reuse FileHandle from internal/fs/promises for the async
// methods instead of manually wrapping fs.read/write/fstat/ftruncate/close in
// Promises. Blocked on a way to wrap an existing numeric fd in a FileHandle so
// sync-opened handles can still share one underlying handle for async ops.
var _fd = /*#__PURE__*/new WeakMap();
var _realPath = /*#__PURE__*/new WeakMap();
var _RealFileHandle_brand = /*#__PURE__*/new WeakSet();
var RealFileHandle = /*#__PURE__*/function (_VirtualFileHandle) {
  /**
   * @param {string} path The VFS path
   * @param {string} flags The open flags
   * @param {number} mode The file mode
   * @param {number} fd The real file descriptor
   * @param {string} realPath The real filesystem path
   */
  function RealFileHandle(path, flags, mode, fd, realPath) {
    var _this;
    _classCallCheck(this, RealFileHandle);
    _this = _callSuper(this, RealFileHandle, [path, flags, mode]);
    _classPrivateMethodInitSpec(_this, _RealFileHandle_brand);
    _classPrivateFieldInitSpec(_this, _fd, void 0);
    _classPrivateFieldInitSpec(_this, _realPath, void 0);
    _classPrivateFieldSet(_fd, _this, fd);
    _classPrivateFieldSet(_realPath, _this, realPath);
    return _this;
  }
  _inherits(RealFileHandle, _VirtualFileHandle);
  return _createClass(RealFileHandle, [{
    key: "readSync",
    value: function readSync(buffer, offset, length, position) {
      _assertClassBrand(_RealFileHandle_brand, this, _checkClosed).call(this, 'read');
      return fs.readSync(_classPrivateFieldGet(_fd, this), buffer, offset, length, position);
    }
  }, {
    key: "read",
    value: function read(buffer, offset, length, position) {
      try {
        var _this2 = this;
        _assertClassBrand(_RealFileHandle_brand, _this2, _checkClosed).call(_this2, 'read');
        return _await(new Promise((resolve, reject) => {
          fs.read(_classPrivateFieldGet(_fd, _this2), buffer, offset, length, position, (err, bytesRead) => {
            if (err) reject(err);else resolve({
              __proto__: null,
              bytesRead,
              buffer
            });
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "writeSync",
    value: function writeSync(buffer, offset, length, position) {
      _assertClassBrand(_RealFileHandle_brand, this, _checkClosed).call(this, 'write');
      return fs.writeSync(_classPrivateFieldGet(_fd, this), buffer, offset, length, position);
    }
  }, {
    key: "write",
    value: function write(buffer, offset, length, position) {
      try {
        var _this3 = this;
        _assertClassBrand(_RealFileHandle_brand, _this3, _checkClosed).call(_this3, 'write');
        return _await(new Promise((resolve, reject) => {
          fs.write(_classPrivateFieldGet(_fd, _this3), buffer, offset, length, position, (err, bytesWritten) => {
            if (err) reject(err);else resolve({
              __proto__: null,
              bytesWritten,
              buffer
            });
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "readFileSync",
    value: function readFileSync(options) {
      _assertClassBrand(_RealFileHandle_brand, this, _checkClosed).call(this, 'read');
      return fs.readFileSync(_classPrivateFieldGet(_realPath, this), options);
    }
  }, {
    key: "readFile",
    value: function readFile(options) {
      try {
        var _this4 = this;
        _assertClassBrand(_RealFileHandle_brand, _this4, _checkClosed).call(_this4, 'read');
        return _await(fs.promises.readFile(_classPrivateFieldGet(_realPath, _this4), options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "writeFileSync",
    value: function writeFileSync(data, options) {
      _assertClassBrand(_RealFileHandle_brand, this, _checkClosed).call(this, 'write');
      fs.writeFileSync(_classPrivateFieldGet(_realPath, this), data, options);
    }
  }, {
    key: "writeFile",
    value: function writeFile(data, options) {
      try {
        var _this5 = this;
        _assertClassBrand(_RealFileHandle_brand, _this5, _checkClosed).call(_this5, 'write');
        return _await(fs.promises.writeFile(_classPrivateFieldGet(_realPath, _this5), data, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "statSync",
    value: function statSync(options) {
      _assertClassBrand(_RealFileHandle_brand, this, _checkClosed).call(this, 'fstat');
      return fs.fstatSync(_classPrivateFieldGet(_fd, this), options);
    }
  }, {
    key: "stat",
    value: function stat(options) {
      try {
        var _this6 = this;
        _assertClassBrand(_RealFileHandle_brand, _this6, _checkClosed).call(_this6, 'fstat');
        return _await(new Promise((resolve, reject) => {
          fs.fstat(_classPrivateFieldGet(_fd, _this6), options, (err, stats) => {
            if (err) reject(err);else resolve(stats);
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "truncateSync",
    value: function truncateSync() {
      var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      _assertClassBrand(_RealFileHandle_brand, this, _checkClosed).call(this, 'ftruncate');
      fs.ftruncateSync(_classPrivateFieldGet(_fd, this), len);
    }
  }, {
    key: "truncate",
    value: function truncate() {
      var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      try {
        var _this7 = this;
        _assertClassBrand(_RealFileHandle_brand, _this7, _checkClosed).call(_this7, 'ftruncate');
        return _await(new Promise((resolve, reject) => {
          fs.ftruncate(_classPrivateFieldGet(_fd, _this7), len, err => {
            if (err) reject(err);else resolve();
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "closeSync",
    value: function closeSync() {
      if (!this.closed) {
        fs.closeSync(_classPrivateFieldGet(_fd, this));
        _superPropGet(RealFileHandle, "closeSync", this, 3)([]);
      }
    }
  }, {
    key: "close",
    value: function close() {
      try {
        var _this8 = this;
        if (!_this8.closed) {
          return _await(new Promise((resolve, reject) => {
            fs.close(_classPrivateFieldGet(_fd, _this8), err => {
              if (err) reject(err);else {
                _superPropGet(RealFileHandle, "closeSync", _this8, 3)([]);
                resolve();
              }
            });
          }));
        }
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);
}(VirtualFileHandle);
/**
 * A provider that wraps a real filesystem directory.
 * Allows mounting a real directory at a different VFS path.
 */
function _checkClosed(syscall) {
  if (this.closed) {
    throw createEBADF(syscall);
  }
}
var _rootPath = /*#__PURE__*/new WeakMap();
var _RealFSProvider_brand = /*#__PURE__*/new WeakSet();
var RealFSProvider = /*#__PURE__*/function (_VirtualProvider) {
  /**
   * @param {string} rootPath The real filesystem path to use as root
   */
  function RealFSProvider(rootPath) {
    var _this9;
    _classCallCheck(this, RealFSProvider);
    _this9 = _callSuper(this, RealFSProvider);
    // Resolve to absolute path and normalize
    /**
     * Resolves a VFS path to a real filesystem path.
     * Ensures the path doesn't escape the root directory.
     * @param {string} vfsPath The VFS path (relative to provider root)
     * @returns {string} The real filesystem path
     * @private
     */
    _classPrivateMethodInitSpec(_this9, _RealFSProvider_brand);
    _classPrivateFieldInitSpec(_this9, _rootPath, void 0);
    _classPrivateFieldSet(_rootPath, _this9, path.resolve(getValidatedPath(rootPath, 'rootPath')));
    setOwnProperty(_this9, 'readonly', false);
    setOwnProperty(_this9, 'supportsSymlinks', true);
    return _this9;
  }

  /**
   * Gets the root path of this provider.
   * @returns {string}
   */
  _inherits(RealFSProvider, _VirtualProvider);
  return _createClass(RealFSProvider, [{
    key: "rootPath",
    get: function () {
      return _classPrivateFieldGet(_rootPath, this);
    }
  }, {
    key: "openSync",
    value: function openSync(vfsPath, flags, mode) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      var fd = fs.openSync(realPath, flags, mode);
      return new RealFileHandle(vfsPath, flags, mode ?? 0o644, fd, realPath);
    }
  }, {
    key: "open",
    value: function open(vfsPath, flags, mode) {
      try {
        var _this0 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this0, _resolvePath).call(_this0, vfsPath);
        return _await(new Promise((resolve, reject) => {
          fs.open(realPath, flags, mode, (err, fd) => {
            if (err) reject(err);else resolve(new RealFileHandle(vfsPath, flags, mode ?? 0o644, fd, realPath));
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "statSync",
    value: function statSync(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      return fs.statSync(realPath, options);
    }
  }, {
    key: "stat",
    value: function stat(vfsPath, options) {
      try {
        var _this1 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this1, _resolvePath).call(_this1, vfsPath);
        return _await(fs.promises.stat(realPath, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "lstatSync",
    value: function lstatSync(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath, false);
      return fs.lstatSync(realPath, options);
    }
  }, {
    key: "lstat",
    value: function lstat(vfsPath, options) {
      try {
        var _this10 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this10, _resolvePath).call(_this10, vfsPath, false);
        return _await(fs.promises.lstat(realPath, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "readdirSync",
    value: function readdirSync(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      return fs.readdirSync(realPath, options);
    }
  }, {
    key: "readdir",
    value: function readdir(vfsPath, options) {
      try {
        var _this11 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this11, _resolvePath).call(_this11, vfsPath);
        return _await(fs.promises.readdir(realPath, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "mkdirSync",
    value: function mkdirSync(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      return fs.mkdirSync(realPath, options);
    }
  }, {
    key: "mkdir",
    value: function mkdir(vfsPath, options) {
      try {
        var _this12 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this12, _resolvePath).call(_this12, vfsPath);
        return _await(fs.promises.mkdir(realPath, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "rmdirSync",
    value: function rmdirSync(vfsPath) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      fs.rmdirSync(realPath);
    }
  }, {
    key: "rmdir",
    value: function rmdir(vfsPath) {
      try {
        var _this13 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this13, _resolvePath).call(_this13, vfsPath);
        return _await(fs.promises.rmdir(realPath));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "unlinkSync",
    value: function unlinkSync(vfsPath) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      fs.unlinkSync(realPath);
    }
  }, {
    key: "unlink",
    value: function unlink(vfsPath) {
      try {
        var _this14 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this14, _resolvePath).call(_this14, vfsPath);
        return _await(fs.promises.unlink(realPath));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "renameSync",
    value: function renameSync(oldVfsPath, newVfsPath) {
      var oldRealPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, oldVfsPath);
      var newRealPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, newVfsPath);
      fs.renameSync(oldRealPath, newRealPath);
    }
  }, {
    key: "rename",
    value: function rename(oldVfsPath, newVfsPath) {
      try {
        var _this15 = this;
        var oldRealPath = _assertClassBrand(_RealFSProvider_brand, _this15, _resolvePath).call(_this15, oldVfsPath);
        var newRealPath = _assertClassBrand(_RealFSProvider_brand, _this15, _resolvePath).call(_this15, newVfsPath);
        return _await(fs.promises.rename(oldRealPath, newRealPath));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "readlinkSync",
    value: function readlinkSync(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath, false);
      var target = fs.readlinkSync(realPath, options);
      // Translate absolute targets within rootPath to VFS-relative
      if (path.isAbsolute(target)) {
        var rootWithSep = _classPrivateFieldGet(_rootPath, this) + path.sep;
        if (target === _classPrivateFieldGet(_rootPath, this)) {
          return '/';
        }
        if (StringPrototypeStartsWith(target, rootWithSep)) {
          return '/' + target.slice(rootWithSep.length).replace(/\\/g, '/');
        }
      }
      return target;
    }
  }, {
    key: "readlink",
    value: function readlink(vfsPath, options) {
      try {
        var _this16 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this16, _resolvePath).call(_this16, vfsPath, false);
        return _await(fs.promises.readlink(realPath, options), function (target) {
          // Translate absolute targets within rootPath to VFS-relative
          if (path.isAbsolute(target)) {
            var rootWithSep = _classPrivateFieldGet(_rootPath, _this16) + path.sep;
            if (target === _classPrivateFieldGet(_rootPath, _this16)) {
              return '/';
            }
            if (StringPrototypeStartsWith(target, rootWithSep)) {
              return '/' + target.slice(rootWithSep.length).replace(/\\/g, '/');
            }
          }
          return target;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "symlinkSync",
    value: function symlinkSync(target, vfsPath, type) {
      // Validate target resolves within rootPath
      if (path.isAbsolute(target)) {
        throw createEACCES('symlink', vfsPath);
      }
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      var resolvedTarget = path.resolve(path.dirname(realPath), target);
      var rootWithSep = _classPrivateFieldGet(_rootPath, this).endsWith(path.sep) ? _classPrivateFieldGet(_rootPath, this) : _classPrivateFieldGet(_rootPath, this) + path.sep;
      if (resolvedTarget !== _classPrivateFieldGet(_rootPath, this) && !StringPrototypeStartsWith(resolvedTarget, rootWithSep)) {
        throw createEACCES('symlink', vfsPath);
      }
      fs.symlinkSync(target, realPath, type);
    }
  }, {
    key: "symlink",
    value: function symlink(target, vfsPath, type) {
      try {
        var _this17 = this;
        // Validate target resolves within rootPath
        if (path.isAbsolute(target)) {
          throw createEACCES('symlink', vfsPath);
        }
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this17, _resolvePath).call(_this17, vfsPath);
        var resolvedTarget = path.resolve(path.dirname(realPath), target);
        var rootWithSep = _classPrivateFieldGet(_rootPath, _this17).endsWith(path.sep) ? _classPrivateFieldGet(_rootPath, _this17) : _classPrivateFieldGet(_rootPath, _this17) + path.sep;
        if (resolvedTarget !== _classPrivateFieldGet(_rootPath, _this17) && !StringPrototypeStartsWith(resolvedTarget, rootWithSep)) {
          throw createEACCES('symlink', vfsPath);
        }
        return _await(fs.promises.symlink(target, realPath, type));
      } catch (e) {
        return Promise.reject(e);
      }
    } // path.relative handles case-insensitivity on Windows, which matters here
    // because fs.realpathSync (a JS impl) preserves case but fs.promises.realpath
    // (native) canonicalizes the drive letter and other components.
  }, {
    key: "realpathSync",
    value: function realpathSync(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      var resolved = fs.realpathSync(realPath, options);
      return _assertClassBrand(_RealFSProvider_brand, this, _resolvedToVfsPath).call(this, resolved, vfsPath, 'realpath');
    }
  }, {
    key: "realpath",
    value: function realpath(vfsPath, options) {
      try {
        var _this18 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this18, _resolvePath).call(_this18, vfsPath);
        return _await(fs.promises.realpath(realPath, options), function (resolved) {
          return _assertClassBrand(_RealFSProvider_brand, _this18, _resolvedToVfsPath).call(_this18, resolved, vfsPath, 'realpath');
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "accessSync",
    value: function accessSync(vfsPath, mode) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      fs.accessSync(realPath, mode);
    }
  }, {
    key: "access",
    value: function access(vfsPath, mode) {
      try {
        var _this19 = this;
        var realPath = _assertClassBrand(_RealFSProvider_brand, _this19, _resolvePath).call(_this19, vfsPath);
        return _await(fs.promises.access(realPath, mode));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "copyFileSync",
    value: function copyFileSync(srcVfsPath, destVfsPath, mode) {
      var srcRealPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, srcVfsPath);
      var destRealPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, destVfsPath);
      fs.copyFileSync(srcRealPath, destRealPath, mode);
    }
  }, {
    key: "copyFile",
    value: function copyFile(srcVfsPath, destVfsPath, mode) {
      try {
        var _this20 = this;
        var srcRealPath = _assertClassBrand(_RealFSProvider_brand, _this20, _resolvePath).call(_this20, srcVfsPath);
        var destRealPath = _assertClassBrand(_RealFSProvider_brand, _this20, _resolvePath).call(_this20, destVfsPath);
        return _await(fs.promises.copyFile(srcRealPath, destRealPath, mode));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "supportsWatch",
    get: function () {
      return true;
    }
  }, {
    key: "watch",
    value: function watch(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      return fs.watch(realPath, options);
    }
  }, {
    key: "watchAsync",
    value: function watchAsync(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      return fs.promises.watch(realPath, options);
    }
  }, {
    key: "watchFile",
    value: function watchFile(vfsPath, options) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      return fs.watchFile(realPath, options, () => {});
    }
  }, {
    key: "unwatchFile",
    value: function unwatchFile(vfsPath, listener) {
      var realPath = _assertClassBrand(_RealFSProvider_brand, this, _resolvePath).call(this, vfsPath);
      fs.unwatchFile(realPath, listener);
    }
  }]);
}(VirtualProvider);
function _resolvePath(vfsPath) {
  var followSymlinks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  // Normalize the VFS path (remove leading slash, handle . and ..)
  var normalized = vfsPath;
  if (normalized.startsWith('/')) {
    normalized = normalized.slice(1);
  }

  // Join with root and resolve
  var realPath = path.resolve(_classPrivateFieldGet(_rootPath, this), normalized);

  // Security check: ensure the resolved path is within rootPath
  var rootWithSep = _classPrivateFieldGet(_rootPath, this).endsWith(path.sep) ? _classPrivateFieldGet(_rootPath, this) : _classPrivateFieldGet(_rootPath, this) + path.sep;
  if (realPath !== _classPrivateFieldGet(_rootPath, this) && !StringPrototypeStartsWith(realPath, rootWithSep)) {
    throw createENOENT('open', vfsPath);
  }

  // Resolve symlinks to prevent escape via symbolic links
  if (followSymlinks) {
    try {
      var resolved = fs.realpathSync(realPath);
      if (resolved !== _classPrivateFieldGet(_rootPath, this) && !StringPrototypeStartsWith(resolved, rootWithSep)) {
        throw createENOENT('open', vfsPath);
      }
      return resolved;
    } catch (err) {
      if (err?.code !== 'ENOENT') throw err;
      // Path doesn't exist yet - verify deepest existing ancestor
      _assertClassBrand(_RealFSProvider_brand, this, _verifyAncestorInRoot).call(this, realPath, rootWithSep, vfsPath);
      return realPath;
    }
  }

  // For lstat/readlink (no final symlink follow), check parent only
  _assertClassBrand(_RealFSProvider_brand, this, _verifyAncestorInRoot).call(this, realPath, rootWithSep, vfsPath);
  return realPath;
}
/**
 * Verifies that the deepest existing ancestor of a path is within rootPath.
 * @param {string} realPath The real filesystem path
 * @param {string} rootWithSep The rootPath with trailing separator
 * @param {string} vfsPath The original VFS path (for error messages)
 */
function _verifyAncestorInRoot(realPath, rootWithSep, vfsPath) {
  var current = path.dirname(realPath);
  while (current.length >= _classPrivateFieldGet(_rootPath, this).length) {
    try {
      var resolved = fs.realpathSync(current);
      if (resolved !== _classPrivateFieldGet(_rootPath, this) && !StringPrototypeStartsWith(resolved, rootWithSep)) {
        throw createENOENT('open', vfsPath);
      }
      return;
    } catch (err) {
      if (err?.code !== 'ENOENT') throw err;
      current = path.dirname(current);
    }
  }
}
function _resolvedToVfsPath(resolved, vfsPath, syscall) {
  var rel = path.relative(_classPrivateFieldGet(_rootPath, this), resolved);
  if (rel === '') return '/';
  if (rel === '..' || StringPrototypeStartsWith(rel, '..' + path.sep) || path.isAbsolute(rel)) {
    throw createEACCES(syscall, vfsPath);
  }
  return '/' + rel.replace(/\\/g, '/');
}
module.exports = {
  RealFSProvider,
  RealFileHandle
};

