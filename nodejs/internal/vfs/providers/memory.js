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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayFrom,
  ArrayPrototypePush,
  DateNow,
  SafeMap,
  StringPrototypeReplaceAll,
  Symbol: _Symbol
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  isPromise
} = require('util/types');
var {
  posix: pathPosix
} = require('path');
var {
  VirtualProvider
} = require('internal/vfs/provider');
var {
  MemoryFileHandle
} = require('internal/vfs/file_handle');
var {
  VFSWatcher,
  VFSStatWatcher,
  VFSWatchAsyncIterable
} = require('internal/vfs/watcher');
var {
  codes: {
    ERR_INVALID_STATE
  }
} = require('internal/errors');
var {
  createENOENT,
  createENOTDIR,
  createENOTEMPTY,
  createEISDIR,
  createEEXIST,
  createEINVAL,
  createELOOP,
  createEROFS
} = require('internal/vfs/errors');
var {
  createFileStats,
  createDirectoryStats,
  createSymlinkStats
} = require('internal/vfs/stats');
var {
  Dirent
} = require('internal/fs/utils');
var {
  kEmptyObject
} = require('internal/util');
var {
  fs: {
    O_APPEND,
    O_CREAT,
    O_EXCL,
    O_RDWR,
    O_TRUNC,
    O_WRONLY,
    UV_DIRENT_FILE,
    UV_DIRENT_DIR,
    UV_DIRENT_LINK
  }
} = internalBinding('constants');

/**
 * Converts numeric flags to a string representation.
 * If already a string, returns as-is.
 * @param {string|number} flags The flags to normalize
 * @returns {string} Normalized string flags
 */
function normalizeFlags(flags) {
  if (typeof flags === 'string') return flags;
  if (typeof flags !== 'number') return 'r';
  var rdwr = (flags & O_RDWR) !== 0;
  var append = (flags & O_APPEND) !== 0;
  var excl = (flags & O_EXCL) !== 0;
  var write = (flags & O_WRONLY) !== 0 || (flags & O_CREAT) !== 0 || (flags & O_TRUNC) !== 0;
  if (append) {
    return 'a' + (excl ? 'x' : '') + (rdwr ? '+' : '');
  }
  if (write) {
    return 'w' + (excl ? 'x' : '') + (rdwr ? '+' : '');
  }
  if (rdwr) return 'r+';
  return 'r';
}

/**
 * Converts a time argument (Date, number, or string) to milliseconds.
 * Numbers are treated as seconds (matching Node.js utimes convention).
 * @param {Date|number|string} time The time value
 * @returns {number} Milliseconds since epoch
 */
function toMs(time) {
  if (typeof time === 'number') return time * 1000;
  if (typeof time === 'string') return DateNow(); // Fallback for string timestamps
  if (typeof time === 'object' && time !== null) return +time;
  return time;
}

// Private symbols
var kRoot = _Symbol('kRoot');
var kReadonly = _Symbol('kReadonly');
var kStatWatchers = _Symbol('kStatWatchers');

// Entry types
var TYPE_FILE = 0;
var TYPE_DIR = 1;
var TYPE_SYMLINK = 2;

// Maximum symlink resolution depth
var kMaxSymlinkDepth = 40;

/**
 * Internal entry representation for MemoryProvider.
 */
var MemoryEntry = /*#__PURE__*/function () {
  function MemoryEntry(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, MemoryEntry);
    this.type = type;
    this.mode = options.mode ?? (type === TYPE_DIR ? 0o755 : 0o644);
    this.content = null; // For files - static Buffer content
    this.contentProvider = null; // For files - dynamic content function
    this.target = null; // For symlinks
    this.children = null; // For directories
    this.populate = null; // For directories - lazy population callback
    this.populated = true; // For directories - has populate been called?
    this.nlink = 1;
    this.uid = 0;
    this.gid = 0;
    var now = DateNow();
    this.atime = now;
    this.mtime = now;
    this.ctime = now;
    this.birthtime = now;
  }

  /**
   * Gets the file content synchronously.
   * Throws if the content provider returns a Promise.
   * @returns {Buffer} The file content
   */
  return _createClass(MemoryEntry, [{
    key: "getContentSync",
    value: function getContentSync() {
      if (this.contentProvider !== null) {
        var result = this.contentProvider();
        if (isPromise(result)) {
          // It's a Promise - can't use sync API
          throw new ERR_INVALID_STATE('cannot use sync API with async content provider');
        }
        return typeof result === 'string' ? Buffer.from(result) : result;
      }
      return this.content;
    }

    /**
     * Gets the file content asynchronously.
     * @returns {Promise<Buffer>} The file content
     */
  }, {
    key: "getContentAsync",
    value: function getContentAsync() {
      try {
        var _exit = false;
        var _this = this;
        return _await(_invoke(function () {
          if (_this.contentProvider !== null) {
            return _await(_this.contentProvider(), function (result) {
              var _temp = typeof result === 'string' ? Buffer.from(result) : result;
              _exit = true;
              return _temp;
            });
          }
        }, function (_result) {
          return _exit ? _result : _this.content;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Returns true if this file has a dynamic content provider.
     * @returns {boolean}
     */
  }, {
    key: "isDynamic",
    value: function isDynamic() {
      return this.contentProvider !== null;
    }
  }, {
    key: "isFile",
    value: function isFile() {
      return this.type === TYPE_FILE;
    }
  }, {
    key: "isDirectory",
    value: function isDirectory() {
      return this.type === TYPE_DIR;
    }
  }, {
    key: "isSymbolicLink",
    value: function isSymbolicLink() {
      return this.type === TYPE_SYMLINK;
    }
  }]);
}();
/**
 * In-memory filesystem provider.
 * Supports full read/write operations.
 */
var _MemoryProvider_brand = /*#__PURE__*/new WeakSet();
var MemoryProvider = /*#__PURE__*/function (_VirtualProvider) {
  function MemoryProvider() {
    var _this2;
    _classCallCheck(this, MemoryProvider);
    _this2 = _callSuper(this, MemoryProvider);
    // Root directory
    /**
     * Normalizes a path to use forward slashes, removes trailing slash,
     * and resolves . and .. components.
     * @param {string} path The path to normalize
     * @returns {string} Normalized path
     */
    _classPrivateMethodInitSpec(_this2, _MemoryProvider_brand);
    _this2[kRoot] = new MemoryEntry(TYPE_DIR);
    _this2[kRoot].children = new SafeMap();
    _this2[kReadonly] = false;
    // Map of path -> VFSStatWatcher for watchFile
    _this2[kStatWatchers] = new SafeMap();
    return _this2;
  }
  _inherits(MemoryProvider, _VirtualProvider);
  return _createClass(MemoryProvider, [{
    key: "readonly",
    get: function () {
      return this[kReadonly];
    }
  }, {
    key: "supportsWatch",
    get: function () {
      return true;
    }

    /**
     * Sets the provider to read-only mode.
     * Once set to read-only, the provider cannot be changed back to writable.
     * This is useful for finalizing a VFS after initial population.
     */
  }, {
    key: "setReadOnly",
    value: function setReadOnly() {
      this[kReadonly] = true;
    }
  }, {
    key: "supportsSymlinks",
    get: function () {
      return true;
    }
  }, {
    key: "openSync",
    value: function openSync(path, flags, mode) {
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);

      // Normalize numeric flags to string
      flags = normalizeFlags(flags);

      // Handle create and exclusive modes
      var isCreate = flags === 'w' || flags === 'w+' || flags === 'a' || flags === 'a+' || flags === 'wx' || flags === 'wx+' || flags === 'ax' || flags === 'ax+';
      var isExclusive = flags === 'wx' || flags === 'wx+' || flags === 'ax' || flags === 'ax+';
      var isWritable = flags !== 'r';

      // Check readonly for any writable mode
      if (this.readonly && isWritable) {
        throw createEROFS('open', path);
      }
      var entry;
      try {
        entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, normalized, 'open');
        // Exclusive flag: file must not exist
        if (isExclusive) {
          throw createEEXIST('open', path);
        }
      } catch (err) {
        if (err.code !== 'ENOENT' || !isCreate) throw err;
        // Create the file
        var parent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalized, false, 'open');
        var name = pathPosix.basename(normalized);
        entry = new MemoryEntry(TYPE_FILE, {
          mode
        });
        entry.content = Buffer.alloc(0);
        parent.children.set(name, entry);
        var now = DateNow();
        parent.mtime = now;
        parent.ctime = now;
      }
      if (entry.isDirectory()) {
        throw createEISDIR('open', path);
      }
      if (entry.isSymbolicLink()) {
        // Should have been resolved already, but just in case
        throw createEINVAL('open', path);
      }
      var getStats = size => _assertClassBrand(_MemoryProvider_brand, this, _createStats).call(this, entry, size);
      return new MemoryFileHandle(normalized, flags, mode ?? entry.mode, entry.content, entry, getStats);
    }
  }, {
    key: "open",
    value: function open(path, flags, mode) {
      try {
        var _this3 = this;
        return _await(_this3.openSync(path, flags, mode));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "statSync",
    value: function statSync(path, options) {
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, path, 'stat', true);
      return _assertClassBrand(_MemoryProvider_brand, this, _createStats).call(this, entry, undefined, options?.bigint);
    }
  }, {
    key: "stat",
    value: function stat(path, options) {
      try {
        var _this4 = this;
        return _await(_this4.statSync(path, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "lstatSync",
    value: function lstatSync(path, options) {
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, path, 'lstat', false);
      return _assertClassBrand(_MemoryProvider_brand, this, _createStats).call(this, entry, undefined, options?.bigint);
    }
  }, {
    key: "lstat",
    value: function lstat(path, options) {
      try {
        var _this5 = this;
        return _await(_this5.lstatSync(path, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "readdirSync",
    value: function readdirSync(path, options) {
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, path, 'scandir', true);
      if (!entry.isDirectory()) {
        throw createENOTDIR('scandir', path);
      }

      // Ensure directory is populated (for lazy population)
      _assertClassBrand(_MemoryProvider_brand, this, _ensurePopulated).call(this, entry, path);
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      var withFileTypes = options?.withFileTypes === true;
      var recursive = options?.recursive === true;
      if (recursive) {
        return _assertClassBrand(_MemoryProvider_brand, this, _readdirRecursive).call(this, entry, normalized, withFileTypes);
      }
      if (withFileTypes) {
        var dirents = [];
        for (var {
          0: name,
          1: childEntry
        } of entry.children) {
          var type = void 0;
          if (childEntry.isSymbolicLink()) {
            type = UV_DIRENT_LINK;
          } else if (childEntry.isDirectory()) {
            type = UV_DIRENT_DIR;
          } else {
            type = UV_DIRENT_FILE;
          }
          ArrayPrototypePush(dirents, new Dirent(name, type, normalized));
        }
        return dirents;
      }
      return ArrayFrom(entry.children.keys());
    }

    /**
     * Recursively reads directory contents.
     * @param {MemoryEntry} dirEntry The directory entry
     * @param {string} dirPath The normalized directory path
     * @param {boolean} withFileTypes Whether to return Dirent objects
     * @returns {string[]|Dirent[]}
     */
  }, {
    key: "readdir",
    value: function readdir(path, options) {
      try {
        var _this6 = this;
        return _await(_this6.readdirSync(path, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "mkdirSync",
    value: function mkdirSync(path, options) {
      if (this.readonly) {
        throw createEROFS('mkdir', path);
      }
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      var recursive = options?.recursive === true;

      // Check if already exists
      var existing = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, normalized, true);
      if (existing.entry) {
        if (existing.entry.isDirectory() && recursive) {
          // Already exists, that's ok for recursive
          return undefined;
        }
        throw createEEXIST('mkdir', path);
      }
      if (recursive) {
        // Create all parent directories
        var segments = _assertClassBrand(_MemoryProvider_brand, this, _splitPath).call(this, normalized);
        var current = this[kRoot];
        var currentPath = '/';
        var firstCreated;
        for (var segment of segments) {
          currentPath = pathPosix.join(currentPath, segment);
          var _entry = current.children.get(segment);
          if (!_entry) {
            _entry = new MemoryEntry(TYPE_DIR, {
              mode: options?.mode
            });
            _entry.children = new SafeMap();
            current.children.set(segment, _entry);
            if (firstCreated === undefined) {
              firstCreated = currentPath;
            }
          } else if (!_entry.isDirectory()) {
            throw createENOTDIR('mkdir', path);
          }
          current = _entry;
        }
        return firstCreated;
      }
      var parent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalized, false, 'mkdir');
      var name = pathPosix.basename(normalized);
      var entry = new MemoryEntry(TYPE_DIR, {
        mode: options?.mode
      });
      entry.children = new SafeMap();
      parent.children.set(name, entry);
      var now = DateNow();
      parent.mtime = now;
      parent.ctime = now;
      return undefined;
    }
  }, {
    key: "mkdir",
    value: function mkdir(path, options) {
      try {
        var _this7 = this;
        return _await(_this7.mkdirSync(path, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "rmdirSync",
    value: function rmdirSync(path) {
      if (this.readonly) {
        throw createEROFS('rmdir', path);
      }
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, normalized, 'rmdir', false);
      if (!entry.isDirectory()) {
        throw createENOTDIR('rmdir', path);
      }
      if (entry.children.size > 0) {
        throw createENOTEMPTY('rmdir', path);
      }
      var parent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalized, false, 'rmdir');
      var name = pathPosix.basename(normalized);
      parent.children.delete(name);
      var now = DateNow();
      parent.mtime = now;
      parent.ctime = now;
    }
  }, {
    key: "rmdir",
    value: function rmdir(path) {
      try {
        var _this8 = this;
        _this8.rmdirSync(path);
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "unlinkSync",
    value: function unlinkSync(path) {
      if (this.readonly) {
        throw createEROFS('unlink', path);
      }
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, normalized, 'unlink', false);
      if (entry.isDirectory()) {
        throw createEISDIR('unlink', path);
      }
      var parent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalized, false, 'unlink');
      var name = pathPosix.basename(normalized);
      parent.children.delete(name);
      entry.nlink--;
      var now = DateNow();
      parent.mtime = now;
      parent.ctime = now;
    }
  }, {
    key: "unlink",
    value: function unlink(path) {
      try {
        var _this9 = this;
        _this9.unlinkSync(path);
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "renameSync",
    value: function renameSync(oldPath, newPath) {
      if (this.readonly) {
        throw createEROFS('rename', oldPath);
      }
      var normalizedOld = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, oldPath);
      var normalizedNew = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, newPath);

      // Get the entry (without following symlinks for the entry itself)
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, normalizedOld, 'rename', false);

      // Validate destination parent exists (do not auto-create)
      var newParent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalizedNew, false, 'rename');
      var newName = pathPosix.basename(normalizedNew);

      // Check if destination exists
      var existingDest = newParent.children.get(newName);
      if (existingDest) {
        // Cannot overwrite a directory with a non-directory
        if (existingDest.isDirectory() && !entry.isDirectory()) {
          throw createEISDIR('rename', newPath);
        }
        // Cannot overwrite a non-directory with a directory
        if (!existingDest.isDirectory() && entry.isDirectory()) {
          throw createENOTDIR('rename', newPath);
        }
      }

      // Remove from old location (after destination validation)
      var oldParent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalizedOld, false, 'rename');
      var oldName = pathPosix.basename(normalizedOld);
      oldParent.children.delete(oldName);

      // Add to new location
      newParent.children.set(newName, entry);
      var now = DateNow();
      oldParent.mtime = now;
      oldParent.ctime = now;
      if (newParent !== oldParent) {
        newParent.mtime = now;
        newParent.ctime = now;
      }
    }
  }, {
    key: "rename",
    value: function rename(oldPath, newPath) {
      try {
        var _this0 = this;
        _this0.renameSync(oldPath, newPath);
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "linkSync",
    value: function linkSync(existingPath, newPath) {
      if (this.readonly) {
        throw createEROFS('link', newPath);
      }
      var normalizedExisting = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, existingPath);
      var normalizedNew = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, newPath);
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, normalizedExisting, 'link', true);
      if (!entry.isFile()) {
        // Hard links to directories are not supported
        throw createEINVAL('link', existingPath);
      }

      // Check if new path already exists
      var existing = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, normalizedNew, false);
      if (existing.entry) {
        throw createEEXIST('link', newPath);
      }
      var parent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalizedNew, false, 'link');
      var name = pathPosix.basename(normalizedNew);
      // Hard link: same entry object referenced by both names
      parent.children.set(name, entry);
      entry.nlink++;
      var now = DateNow();
      parent.mtime = now;
      parent.ctime = now;
    }
  }, {
    key: "link",
    value: function link(existingPath, newPath) {
      try {
        var _this1 = this;
        _this1.linkSync(existingPath, newPath);
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "readlinkSync",
    value: function readlinkSync(path, options) {
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, normalized, 'readlink', false);
      if (!entry.isSymbolicLink()) {
        throw createEINVAL('readlink', path);
      }
      return entry.target;
    }
  }, {
    key: "readlink",
    value: function readlink(path, options) {
      try {
        var _this10 = this;
        return _await(_this10.readlinkSync(path, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "symlinkSync",
    value: function symlinkSync(target, path, type) {
      if (this.readonly) {
        throw createEROFS('symlink', path);
      }
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);

      // Check if already exists
      var existing = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, normalized, false);
      if (existing.entry) {
        throw createEEXIST('symlink', path);
      }
      var parent = _assertClassBrand(_MemoryProvider_brand, this, _ensureParent).call(this, normalized, false, 'symlink');
      var name = pathPosix.basename(normalized);
      var entry = new MemoryEntry(TYPE_SYMLINK);
      entry.target = target;
      parent.children.set(name, entry);
      var now = DateNow();
      parent.mtime = now;
      parent.ctime = now;
    }
  }, {
    key: "symlink",
    value: function symlink(target, path, type) {
      try {
        var _this11 = this;
        _this11.symlinkSync(target, path, type);
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "realpathSync",
    value: function realpathSync(path, options) {
      var result = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, path, true, 0);
      if (result.eloop) {
        throw createELOOP('realpath', path);
      }
      if (!result.entry) {
        throw createENOENT('realpath', path);
      }
      return result.resolvedPath;
    }
  }, {
    key: "realpath",
    value: function realpath(path, options) {
      try {
        var _this12 = this;
        return _await(_this12.realpathSync(path, options));
      } catch (e) {
        return Promise.reject(e);
      }
    } // === METADATA OPERATIONS ===
  }, {
    key: "chmodSync",
    value: function chmodSync(path, mode) {
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, path, 'chmod', true);
      // Preserve file type bits, update permission bits
      entry.mode = entry.mode & ~0o7777 | mode & 0o7777;
      entry.ctime = DateNow();
    }
  }, {
    key: "chownSync",
    value: function chownSync(path, uid, gid) {
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, path, 'chown', true);
      if (uid >= 0) entry.uid = uid;
      if (gid >= 0) entry.gid = gid;
      entry.ctime = DateNow();
    }
  }, {
    key: "utimesSync",
    value: function utimesSync(path, atime, mtime) {
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, path, 'utime', true);
      entry.atime = toMs(atime);
      entry.mtime = toMs(mtime);
      entry.ctime = DateNow();
    }
  }, {
    key: "lutimesSync",
    value: function lutimesSync(path, atime, mtime) {
      var entry = _assertClassBrand(_MemoryProvider_brand, this, _getEntry).call(this, path, 'utime', false);
      entry.atime = toMs(atime);
      entry.mtime = toMs(mtime);
      entry.ctime = DateNow();
    }

    // === WATCH OPERATIONS ===

    /**
     * Watches a file or directory for changes.
     * @param {string} path The path to watch
     * @param {object} [options] Watch options
     * @returns {VFSWatcher}
     */
  }, {
    key: "watch",
    value: function watch(path, options) {
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      return new VFSWatcher(this, normalized, options);
    }

    /**
     * Watches a file or directory for changes (async iterable version).
     * Used by fs.promises.watch().
     * @param {string} path The path to watch
     * @param {object} [options] Watch options
     * @returns {VFSWatchAsyncIterable}
     */
  }, {
    key: "watchAsync",
    value: function watchAsync(path, options) {
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      return new VFSWatchAsyncIterable(this, normalized, options);
    }

    /**
     * Watches a file for changes using stat polling.
     * @param {string} path The path to watch
     * @param {object} [options] Watch options
     * @param {Function} [listener] Change listener
     * @returns {VFSStatWatcher}
     */
  }, {
    key: "watchFile",
    value: function watchFile(path, options, listener) {
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);

      // Reuse existing watcher for the same path
      var watcher = this[kStatWatchers].get(normalized);
      if (!watcher) {
        watcher = new VFSStatWatcher(this, normalized, options);
        this[kStatWatchers].set(normalized, watcher);
      }
      if (listener) {
        watcher.addListener('change', listener);
      }
      return watcher;
    }

    /**
     * Stops watching a file for changes.
     * @param {string} path The path to stop watching
     * @param {Function} [listener] Optional listener to remove
     */
  }, {
    key: "unwatchFile",
    value: function unwatchFile(path, listener) {
      var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
      var watcher = this[kStatWatchers].get(normalized);
      if (!watcher) {
        return;
      }
      if (listener) {
        watcher.removeListener('change', listener);
      } else {
        // Remove all listeners
        watcher.removeAllListeners('change');
      }

      // If no more listeners, stop and remove the watcher
      if (watcher.hasNoListeners()) {
        watcher.stop();
        this[kStatWatchers].delete(normalized);
      }
    }
  }]);
}(VirtualProvider);
function _normalizePath(path) {
  // Convert backslashes to forward slashes
  var normalized = StringPrototypeReplaceAll(path, '\\', '/');
  // Ensure absolute path
  if (normalized[0] !== '/') {
    normalized = '/' + normalized;
  }
  // Use path.posix.normalize to resolve . and ..
  return pathPosix.normalize(normalized);
}
/**
 * Splits a path into segments.
 * @param {string} path Normalized path
 * @returns {string[]} Path segments
 */
function _splitPath(path) {
  if (path === '/') {
    return [];
  }
  return path.slice(1).split('/');
}
/**
 * Resolves a symlink target to an absolute path.
 * @param {string} symlinkPath The path of the symlink
 * @param {string} target The symlink target
 * @returns {string} Resolved absolute path
 */
function _resolveSymlinkTarget(symlinkPath, target) {
  if (target.startsWith('/')) {
    return _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, target);
  }
  // Relative target: resolve against symlink's parent directory
  var parentPath = pathPosix.dirname(symlinkPath);
  return _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, pathPosix.join(parentPath, target));
}
/**
 * Looks up an entry by path, optionally following symlinks.
 * @param {string} path The path to look up
 * @param {boolean} followSymlinks Whether to follow symlinks
 * @param {number} depth Current symlink resolution depth
 * @returns {{ entry: MemoryEntry|null, resolvedPath: string|null, eloop?: boolean }}
 */
function _lookupEntry(path) {
  var followSymlinks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var normalized = _assertClassBrand(_MemoryProvider_brand, this, _normalizePath).call(this, path);
  if (normalized === '/') {
    return {
      entry: this[kRoot],
      resolvedPath: '/'
    };
  }
  var segments = _assertClassBrand(_MemoryProvider_brand, this, _splitPath).call(this, normalized);
  var current = this[kRoot];
  var currentPath = '/';
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];

    // Always follow symlinks for intermediate path components
    if (current.isSymbolicLink()) {
      if (depth >= kMaxSymlinkDepth) {
        return {
          entry: null,
          resolvedPath: null,
          eloop: true
        };
      }
      var targetPath = _assertClassBrand(_MemoryProvider_brand, this, _resolveSymlinkTarget).call(this, currentPath, current.target);
      var result = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, targetPath, true, depth + 1);
      if (result.eloop) {
        return result;
      }
      if (!result.entry) {
        return {
          entry: null,
          resolvedPath: null
        };
      }
      current = result.entry;
      currentPath = result.resolvedPath;
    }
    if (!current.isDirectory()) {
      return {
        entry: null,
        resolvedPath: null
      };
    }

    // Ensure directory is populated before accessing children
    _assertClassBrand(_MemoryProvider_brand, this, _ensurePopulated).call(this, current, currentPath);
    var entry = current.children.get(segment);
    if (!entry) {
      return {
        entry: null,
        resolvedPath: null
      };
    }
    currentPath = pathPosix.join(currentPath, segment);
    current = entry;
  }

  // Follow symlink at the end if requested
  if (current.isSymbolicLink() && followSymlinks) {
    if (depth >= kMaxSymlinkDepth) {
      return {
        entry: null,
        resolvedPath: null,
        eloop: true
      };
    }
    var _targetPath = _assertClassBrand(_MemoryProvider_brand, this, _resolveSymlinkTarget).call(this, currentPath, current.target);
    return _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, _targetPath, true, depth + 1);
  }
  return {
    entry: current,
    resolvedPath: currentPath
  };
}
/**
 * Gets an entry by path, throwing if not found.
 * @param {string} path The path
 * @param {string} syscall The syscall name for error
 * @param {boolean} followSymlinks Whether to follow symlinks
 * @returns {MemoryEntry}
 */
function _getEntry(path, syscall) {
  var followSymlinks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var result = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, path, followSymlinks);
  if (result.eloop) {
    throw createELOOP(syscall, path);
  }
  if (!result.entry) {
    throw createENOENT(syscall, path);
  }
  return result.entry;
}
/**
 * Ensures parent directories exist, optionally creating them.
 * @param {string} path The full path
 * @param {boolean} create Whether to create missing directories
 * @param {string} syscall The syscall name for errors
 * @returns {MemoryEntry} The parent directory entry
 */
function _ensureParent(path, create, syscall) {
  if (path === '/') {
    return this[kRoot];
  }
  var parentPath = pathPosix.dirname(path);
  var segments = _assertClassBrand(_MemoryProvider_brand, this, _splitPath).call(this, parentPath);
  var current = this[kRoot];
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    var currentPath = pathPosix.join.apply(pathPosix, ['/'].concat(_toConsumableArray(segments.slice(0, i))));

    // Follow symlinks in parent path
    if (current.isSymbolicLink()) {
      var targetPath = _assertClassBrand(_MemoryProvider_brand, this, _resolveSymlinkTarget).call(this, currentPath, current.target);
      var result = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, targetPath, true, 0);
      if (!result.entry) {
        throw createENOENT(syscall, path);
      }
      current = result.entry;
    }
    if (!current.isDirectory()) {
      throw createENOTDIR(syscall, path);
    }

    // Ensure directory is populated before accessing children
    _assertClassBrand(_MemoryProvider_brand, this, _ensurePopulated).call(this, current, currentPath);
    var entry = current.children.get(segment);
    if (!entry) {
      if (create) {
        entry = new MemoryEntry(TYPE_DIR);
        entry.children = new SafeMap();
        current.children.set(segment, entry);
      } else {
        throw createENOENT(syscall, path);
      }
    }
    current = entry;
  }

  // Follow symlinks on the final parent entry
  if (current.isSymbolicLink()) {
    var _targetPath2 = _assertClassBrand(_MemoryProvider_brand, this, _resolveSymlinkTarget).call(this, parentPath, current.target);
    var _result2 = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, _targetPath2, true, 0);
    if (!_result2.entry) {
      throw createENOENT(syscall, path);
    }
    current = _result2.entry;
  }
  if (!current.isDirectory()) {
    throw createENOTDIR(syscall, path);
  }

  // Ensure final directory is populated
  _assertClassBrand(_MemoryProvider_brand, this, _ensurePopulated).call(this, current, parentPath);
  return current;
}
/**
 * Creates stats for an entry.
 * @param {MemoryEntry} entry The entry
 * @param {number} [size] Override size for files
 * @returns {Stats}
 */
function _createStats(entry, size, bigint) {
  var options = {
    mode: entry.mode,
    nlink: entry.nlink,
    uid: entry.uid,
    gid: entry.gid,
    atimeMs: entry.atime,
    mtimeMs: entry.mtime,
    ctimeMs: entry.ctime,
    birthtimeMs: entry.birthtime,
    bigint
  };
  if (entry.isFile()) {
    var fileSize = size;
    if (fileSize === undefined) {
      fileSize = entry.isDynamic() ? entry.getContentSync().length : entry.content.length;
    }
    return createFileStats(fileSize, options);
  } else if (entry.isDirectory()) {
    return createDirectoryStats(options);
  } else if (entry.isSymbolicLink()) {
    return createSymlinkStats(entry.target.length, options);
  }
  throw new ERR_INVALID_STATE('Unknown entry type');
}
/**
 * Ensures a directory is populated by calling its populate callback if needed.
 * @param {MemoryEntry} entry The directory entry
 * @param {string} path The directory path (for error messages and scoped VFS)
 */
function _ensurePopulated(entry, path) {
  if (entry.isDirectory() && !entry.populated && entry.populate) {
    // Create a scoped VFS for the populate callback
    var scopedVfs = {
      addFile: (name, content, opts) => {
        var fileEntry = new MemoryEntry(TYPE_FILE, opts);
        if (typeof content === 'function') {
          fileEntry.content = Buffer.alloc(0);
          fileEntry.contentProvider = content;
        } else {
          fileEntry.content = typeof content === 'string' ? Buffer.from(content) : content;
        }
        entry.children.set(name, fileEntry);
      },
      addDirectory: (name, populate, opts) => {
        var dirEntry = new MemoryEntry(TYPE_DIR, opts);
        dirEntry.children = new SafeMap();
        if (typeof populate === 'function') {
          dirEntry.populate = populate;
          dirEntry.populated = false;
        }
        entry.children.set(name, dirEntry);
      },
      addSymlink: (name, target, opts) => {
        var symlinkEntry = new MemoryEntry(TYPE_SYMLINK, opts);
        symlinkEntry.target = target;
        entry.children.set(name, symlinkEntry);
      }
    };
    entry.populate(scopedVfs);
    entry.populated = true;
  }
}
function _readdirRecursive(dirEntry, dirPath, withFileTypes) {
  var results = [];
  var walk = (entry, currentPath, relativePath) => {
    _assertClassBrand(_MemoryProvider_brand, this, _ensurePopulated).call(this, entry, currentPath);
    for (var {
      0: name,
      1: childEntry
    } of entry.children) {
      var childRelative = relativePath ? relativePath + '/' + name : name;
      if (withFileTypes) {
        var type = void 0;
        if (childEntry.isSymbolicLink()) {
          type = UV_DIRENT_LINK;
        } else if (childEntry.isDirectory()) {
          type = UV_DIRENT_DIR;
        } else {
          type = UV_DIRENT_FILE;
        }
        ArrayPrototypePush(results, new Dirent(childRelative, type, dirPath));
      } else {
        ArrayPrototypePush(results, childRelative);
      }

      // Follow symlinks to directories for recursive traversal
      var resolvedChild = childEntry;
      if (childEntry.isSymbolicLink()) {
        var targetPath = _assertClassBrand(_MemoryProvider_brand, this, _resolveSymlinkTarget).call(this, pathPosix.join(currentPath, name), childEntry.target);
        var result = _assertClassBrand(_MemoryProvider_brand, this, _lookupEntry).call(this, targetPath, true, 0);
        if (result.entry) {
          resolvedChild = result.entry;
        }
      }
      if (resolvedChild.isDirectory()) {
        var childPath = pathPosix.join(currentPath, name);
        walk(resolvedChild, childPath, childRelative);
      }
    }
  };
  walk(dirEntry, dirPath, '');
  return results;
}
module.exports = {
  MemoryProvider
};

