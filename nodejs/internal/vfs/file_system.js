'use strict';

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  MathRandom,
  ObjectFreeze,
  Symbol: _Symbol,
  SymbolDispose
} = primordials;
var {
  codes: {
    ERR_INVALID_STATE
  }
} = require('internal/errors');
var {
  validateBoolean
} = require('internal/validators');
var {
  MemoryProvider
} = require('internal/vfs/providers/memory');
var path = require('path');
var {
  posix: pathPosix,
  isAbsolute,
  resolve: resolvePath
} = path;
var {
  join: joinPath
} = pathPosix;
var {
  isUnderMountPoint,
  getRelativePath
} = require('internal/vfs/router');
var {
  openVirtualFd,
  getVirtualFd,
  closeVirtualFd
} = require('internal/vfs/fd');
var {
  createENOENT,
  createEBADF,
  createEISDIR
} = require('internal/vfs/errors');
var {
  VirtualReadStream,
  VirtualWriteStream
} = require('internal/vfs/streams');
var {
  VirtualDir
} = require('internal/vfs/dir');
var {
  emitExperimentalWarning,
  kEmptyObject
} = require('internal/util');
var debug = require('internal/util/debuglog').debuglog('vfs', fn => {
  debug = fn;
});

// Private symbols
var kProvider = _Symbol('kProvider');
var kMountPoint = _Symbol('kMountPoint');
var kMounted = _Symbol('kMounted');
var kPromises = _Symbol('kPromises');

// Lazy-loaded VFS setup
var registerVFS;
var deregisterVFS;
function loadVfsSetup() {
  if (!registerVFS) {
    var setup = require('internal/vfs/setup');
    registerVFS = setup.registerVFS;
    deregisterVFS = setup.deregisterVFS;
  }
}

/**
 * Virtual File System implementation using Provider architecture.
 * Wraps a Provider and exposes an fs-like API operating on
 * provider-relative paths.
 */
var _VirtualFileSystem_brand = /*#__PURE__*/new WeakSet();
var VirtualFileSystem = /*#__PURE__*/function () {
  /**
   * @param {VirtualProvider|object} [providerOrOptions] The provider to use, or options
   * @param {object} [options] Configuration options
   * @param {boolean} [options.emitExperimentalWarning] Emit the experimental warning (default: true)
   */
  function VirtualFileSystem(providerOrOptions) {
    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, VirtualFileSystem);
    // ==================== Path Resolution ====================
    /**
     * Converts an absolute mounted path to a provider-relative POSIX path.
     * If not mounted, treats the path as already provider-relative.
     * @param {string} inputPath The path to convert
     * @returns {string}
     */
    _classPrivateMethodInitSpec(this, _VirtualFileSystem_brand);
    // Handle case where first arg is options object (no provider)
    var _provider = null;
    if (providerOrOptions !== undefined && providerOrOptions !== null) {
      if (typeof providerOrOptions.openSync === 'function') {
        // It's a provider
        _provider = providerOrOptions;
      } else if (typeof providerOrOptions === 'object') {
        // It's options (no provider specified)
        _options = providerOrOptions;
        _provider = null;
      }
    }
    if (_options.emitExperimentalWarning !== undefined) {
      validateBoolean(_options.emitExperimentalWarning, 'options.emitExperimentalWarning');
    }
    if (_options.emitExperimentalWarning !== false) {
      emitExperimentalWarning('VirtualFileSystem');
    }
    this[kProvider] = _provider ?? new MemoryProvider();
    this[kMountPoint] = null;
    this[kMounted] = false;
    this[kPromises] = null; // Lazy-initialized
  }

  /**
   * Gets the underlying provider.
   * @returns {VirtualProvider}
   */
  return _createClass(VirtualFileSystem, [{
    key: "provider",
    get: function () {
      return this[kProvider];
    }

    /**
     * Gets the mount point path, or null if not mounted.
     * @returns {string|null}
     */
  }, {
    key: "mountPoint",
    get: function () {
      return this[kMountPoint];
    }

    /**
     * Returns true if VFS is mounted.
     * @returns {boolean}
     */
  }, {
    key: "mounted",
    get: function () {
      return this[kMounted];
    }

    /**
     * Returns true if the provider is read-only.
     * @returns {boolean}
     */
  }, {
    key: "readonly",
    get: function () {
      return this[kProvider].readonly;
    }

    // ==================== Mount ====================

    /**
     * Mounts the VFS at a specific path prefix.
     * @param {string} prefix The mount point path
     * @returns {VirtualFileSystem} The VFS instance for chaining
     */
  }, {
    key: "mount",
    value: function mount(prefix) {
      if (this[kMounted]) {
        throw new ERR_INVALID_STATE('VFS is already mounted');
      }
      this[kMountPoint] = resolvePath(prefix);
      this[kMounted] = true;
      debug('mount %s', this[kMountPoint]);
      loadVfsSetup();
      registerVFS(this);
      return this;
    }

    /**
     * Unmounts the VFS.
     */
  }, {
    key: "unmount",
    value: function unmount() {
      debug('unmount %s', this[kMountPoint]);
      loadVfsSetup();
      deregisterVFS(this);
      this[kMountPoint] = null;
      this[kMounted] = false;
    }

    /**
     * Disposes of the VFS by unmounting it.
     * Supports the Explicit Resource Management proposal (using declaration).
     */
  }, {
    key: SymbolDispose,
    value: function () {
      if (this[kMounted]) {
        this.unmount();
      }
    }

    /**
     * Checks if a path should be handled by this VFS.
     * @param {string} inputPath The path to check (must be absolute & normalized)
     * @returns {boolean}
     */
  }, {
    key: "shouldHandle",
    value: function shouldHandle(inputPath) {
      if (!this[kMounted] || !this[kMountPoint]) {
        return false;
      }
      var normalized = isAbsolute(inputPath) ? inputPath : resolvePath(inputPath);
      return isUnderMountPoint(normalized, this[kMountPoint]);
    }
  }, {
    key: "existsSync",
    value:
    // ==================== FS Operations (Sync) ====================

    /**
     * Checks if a path exists synchronously.
     * @param {string} filePath The path to check
     * @returns {boolean}
     */
    function existsSync(filePath) {
      try {
        var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
        return this[kProvider].existsSync(providerPath);
      } catch {
        return false;
      }
    }

    /**
     * Gets stats for a path synchronously.
     * @param {string} filePath The path to stat
     * @param {object} [options] Options
     * @returns {Stats}
     */
  }, {
    key: "statSync",
    value: function statSync(filePath, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      return this[kProvider].statSync(providerPath, options);
    }

    /**
     * Gets stats for a path synchronously without following symlinks.
     * @param {string} filePath The path to stat
     * @param {object} [options] Options
     * @returns {Stats}
     */
  }, {
    key: "lstatSync",
    value: function lstatSync(filePath, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      return this[kProvider].lstatSync(providerPath, options);
    }

    /**
     * Reads a file synchronously.
     * @param {string} filePath The path to read
     * @param {object|string} [options] Options or encoding
     * @returns {Buffer|string}
     */
  }, {
    key: "readFileSync",
    value: function readFileSync(filePath, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      return this[kProvider].readFileSync(providerPath, options);
    }

    /**
     * Writes a file synchronously.
     * @param {string} filePath The path to write
     * @param {Buffer|string} data The data to write
     * @param {object} [options] Options
     */
  }, {
    key: "writeFileSync",
    value: function writeFileSync(filePath, data, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].writeFileSync(providerPath, data, options);
    }

    /**
     * Appends to a file synchronously.
     * @param {string} filePath The path to append to
     * @param {Buffer|string} data The data to append
     * @param {object} [options] Options
     */
  }, {
    key: "appendFileSync",
    value: function appendFileSync(filePath, data, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].appendFileSync(providerPath, data, options);
    }

    /**
     * Reads directory contents synchronously.
     * @param {string} dirPath The directory path
     * @param {object} [options] Options
     * @returns {string[]|Dirent[]}
     */
  }, {
    key: "readdirSync",
    value: function readdirSync(dirPath, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, dirPath);
      var result = this[kProvider].readdirSync(providerPath, options);

      // Fix Dirent parentPath from provider-relative to actual VFS path
      if (options?.withFileTypes === true) {
        var recursive = options?.recursive === true;
        for (var i = 0; i < result.length; i++) {
          var dirent = result[i];
          if (recursive) {
            // In recursive mode, name may contain slashes (e.g. 'a/b.txt').
            // Fix to basename only and set correct parentPath.
            var slashIdx = dirent.name.lastIndexOf('/');
            if (slashIdx !== -1) {
              var subdir = dirent.name.slice(0, slashIdx);
              dirent.parentPath = joinPath(dirPath, subdir);
              dirent.name = dirent.name.slice(slashIdx + 1);
            } else {
              dirent.parentPath = dirPath;
            }
          } else {
            dirent.parentPath = dirPath;
          }
        }
      }
      return result;
    }

    /**
     * Creates a directory synchronously.
     * @param {string} dirPath The directory path
     * @param {object} [options] Options
     * @returns {string|undefined}
     */
  }, {
    key: "mkdirSync",
    value: function mkdirSync(dirPath, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, dirPath);
      return this[kProvider].mkdirSync(providerPath, options);
    }

    /**
     * Removes a directory synchronously.
     * @param {string} dirPath The directory path
     */
  }, {
    key: "rmdirSync",
    value: function rmdirSync(dirPath) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, dirPath);
      this[kProvider].rmdirSync(providerPath);
    }

    /**
     * Removes a file synchronously.
     * @param {string} filePath The file path
     */
  }, {
    key: "unlinkSync",
    value: function unlinkSync(filePath) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].unlinkSync(providerPath);
    }

    /**
     * Renames a file or directory synchronously.
     * @param {string} oldPath The old path
     * @param {string} newPath The new path
     */
  }, {
    key: "renameSync",
    value: function renameSync(oldPath, newPath) {
      var oldProviderPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, oldPath);
      var newProviderPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, newPath);
      this[kProvider].renameSync(oldProviderPath, newProviderPath);
    }

    /**
     * Copies a file synchronously.
     * @param {string} src Source path
     * @param {string} dest Destination path
     * @param {number} [mode] Copy mode flags
     */
  }, {
    key: "copyFileSync",
    value: function copyFileSync(src, dest, mode) {
      var srcProviderPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, src);
      var destProviderPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, dest);
      this[kProvider].copyFileSync(srcProviderPath, destProviderPath, mode);
    }

    /**
     * Gets the real path by resolving all symlinks.
     * @param {string} filePath The path
     * @param {object} [options] Options
     * @returns {string}
     */
  }, {
    key: "realpathSync",
    value: function realpathSync(filePath, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      var realProviderPath = this[kProvider].realpathSync(providerPath, options);
      return _assertClassBrand(_VirtualFileSystem_brand, this, _toMountedPath).call(this, realProviderPath);
    }

    /**
     * Reads the target of a symbolic link.
     * @param {string} linkPath The symlink path
     * @param {object} [options] Options
     * @returns {string}
     */
  }, {
    key: "readlinkSync",
    value: function readlinkSync(linkPath, options) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, linkPath);
      return this[kProvider].readlinkSync(providerPath, options);
    }

    /**
     * Creates a symbolic link.
     * @param {string} target The symlink target
     * @param {string} path The symlink path
     * @param {string} [type] The symlink type
     */
  }, {
    key: "symlinkSync",
    value: function symlinkSync(target, path, type) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, path);
      this[kProvider].symlinkSync(target, providerPath, type);
    }

    /**
     * Checks file accessibility synchronously.
     * @param {string} filePath The path to check
     * @param {number} [mode] Access mode
     */
  }, {
    key: "accessSync",
    value: function accessSync(filePath, mode) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].accessSync(providerPath, mode);
    }

    /**
     * Removes a file or directory synchronously.
     * @param {string} filePath The path to remove
     * @param {object} [options] Options
     * @param {boolean} [options.recursive] If true, remove directories recursively
     * @param {boolean} [options.force] If true, ignore ENOENT errors
     */
  }, {
    key: "rmSync",
    value: function rmSync(filePath, options) {
      var recursive = options?.recursive === true;
      var force = options?.force === true;
      var stats;
      try {
        stats = this.lstatSync(filePath);
      } catch (err) {
        if (force && err?.code === 'ENOENT') return;
        throw err;
      }

      // Symlinks should be unlinked directly, never recursed into
      if (stats.isSymbolicLink()) {
        this.unlinkSync(filePath);
        return;
      }
      if (stats.isDirectory()) {
        if (!recursive) {
          throw createEISDIR('rm', filePath);
        }
        var entries = this.readdirSync(filePath);
        for (var i = 0; i < entries.length; i++) {
          this.rmSync(joinPath(filePath, entries[i]), options);
        }
        this.rmdirSync(filePath);
      } else {
        this.unlinkSync(filePath);
      }
    }

    // ==================== Additional Sync Operations ====================

    /**
     * Truncates a file synchronously.
     * @param {string} filePath The file path
     * @param {number} [len] The new length
     */
  }, {
    key: "truncateSync",
    value: function truncateSync(filePath) {
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (len < 0) len = 0;
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      var handle = this[kProvider].openSync(providerPath, 'r+');
      try {
        handle.truncateSync(len);
      } finally {
        handle.closeSync();
      }
    }

    /**
     * Truncates a file descriptor synchronously.
     * @param {number} fd The file descriptor
     * @param {number} [len] The new length
     */
  }, {
    key: "ftruncateSync",
    value: function ftruncateSync(fd) {
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        throw createEBADF('ftruncate');
      }
      vfd.entry.truncateSync(len);
    }

    /**
     * Creates a hard link synchronously.
     * @param {string} existingPath The existing file path
     * @param {string} newPath The new link path
     */
  }, {
    key: "linkSync",
    value: function linkSync(existingPath, newPath) {
      var existingProviderPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, existingPath);
      var newProviderPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, newPath);
      this[kProvider].linkSync(existingProviderPath, newProviderPath);
    }
  }, {
    key: "chmodSync",
    value: function chmodSync(filePath, mode) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].chmodSync(providerPath, mode);
    }
  }, {
    key: "chownSync",
    value: function chownSync(filePath, uid, gid) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].chownSync(providerPath, uid, gid);
    }
  }, {
    key: "utimesSync",
    value: function utimesSync(filePath, atime, mtime) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].utimesSync(providerPath, atime, mtime);
    }
  }, {
    key: "lutimesSync",
    value: function lutimesSync(filePath, atime, mtime) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].lutimesSync(providerPath, atime, mtime);
    }

    /**
     * Creates a unique temporary directory synchronously.
     * @param {string} prefix The prefix for the temp directory
     * @returns {string} The full path of the created directory
     */
  }, {
    key: "mkdtempSync",
    value: function mkdtempSync(prefix) {
      var providerPrefix = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, prefix);
      // Generate random 6-character suffix like Node does
      var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var suffix = '';
      for (var i = 0; i < 6; i++) {
        suffix += chars[MathRandom() * chars.length | 0];
      }
      var dirPath = providerPrefix + suffix;
      this[kProvider].mkdirSync(dirPath);
      return _assertClassBrand(_VirtualFileSystem_brand, this, _toMountedPath).call(this, dirPath);
    }

    /**
     * Opens a directory synchronously.
     * @param {string} dirPath The directory path
     * @param {object} [options] Options
     * @returns {VirtualDir} A directory handle
     */
  }, {
    key: "opendirSync",
    value: function opendirSync(dirPath, options) {
      var entries = this.readdirSync(dirPath, {
        withFileTypes: true,
        recursive: options?.recursive
      });
      return new VirtualDir(dirPath, entries);
    }

    /**
     * Opens a file as a Blob.
     * @param {string} filePath The file path
     * @param {object} [options] Options
     * @returns {Blob} The file content as a Blob
     */
  }, {
    key: "openAsBlob",
    value: function openAsBlob(filePath, options) {
      var {
        Blob
      } = require('buffer');
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      var content = this[kProvider].readFileSync(providerPath);
      var type = options?.type || '';
      return new Blob([content], {
        type
      });
    }

    // ==================== File Descriptor Operations ====================

    /**
     * Opens a file synchronously and returns a file descriptor.
     * @param {string} filePath The path to open
     * @param {string} [flags] Open flags
     * @param {number} [mode] File mode
     * @returns {number} The file descriptor
     */
  }, {
    key: "openSync",
    value: function openSync(filePath) {
      var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'r';
      var mode = arguments.length > 2 ? arguments[2] : undefined;
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      var handle = this[kProvider].openSync(providerPath, flags, mode);
      return openVirtualFd(handle);
    }

    /**
     * Closes a file descriptor synchronously.
     * @param {number} fd The file descriptor
     */
  }, {
    key: "closeSync",
    value: function closeSync(fd) {
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        throw createEBADF('close');
      }
      vfd.entry.closeSync();
      closeVirtualFd(fd);
    }

    /**
     * Reads from a file descriptor synchronously.
     * @param {number} fd The file descriptor
     * @param {Buffer} buffer The buffer to read into
     * @param {number} offset The offset in the buffer
     * @param {number} length The number of bytes to read
     * @param {number|null} position The position in the file
     * @returns {number} The number of bytes read
     */
  }, {
    key: "readSync",
    value: function readSync(fd, buffer, offset, length, position) {
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        throw createEBADF('read');
      }
      return vfd.entry.readSync(buffer, offset, length, position);
    }

    /**
     * Writes to a file descriptor synchronously.
     * @param {number} fd The file descriptor
     * @param {Buffer} buffer The buffer to write from
     * @param {number} offset The offset in the buffer
     * @param {number} length The number of bytes to write
     * @param {number|null} position The position in the file
     * @returns {number} The number of bytes written
     */
  }, {
    key: "writeSync",
    value: function writeSync(fd, buffer, offset, length, position) {
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        throw createEBADF('write');
      }
      return vfd.entry.writeSync(buffer, offset, length, position);
    }

    /**
     * Gets file stats from a file descriptor synchronously.
     * @param {number} fd The file descriptor
     * @param {object} [options] Options
     * @returns {Stats}
     */
  }, {
    key: "fstatSync",
    value: function fstatSync(fd, options) {
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        throw createEBADF('fstat');
      }
      return vfd.entry.statSync(options);
    }

    // ==================== FS Operations (Async with Callbacks) ====================

    /**
     * Reads a file asynchronously.
     * @param {string} filePath The path to read
     * @param {object|string|Function} [options] Options, encoding, or callback
     * @param {Function} [callback] Callback (err, data)
     */
  }, {
    key: "readFile",
    value: function readFile(filePath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      this[kProvider].readFile(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath), options).then(data => callback(null, data), err => callback(err));
    }

    /**
     * Writes a file asynchronously.
     * @param {string} filePath The path to write
     * @param {Buffer|string} data The data to write
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err)
     */
  }, {
    key: "writeFile",
    value: function writeFile(filePath, data, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      this[kProvider].writeFile(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath), data, options).then(() => callback(null), err => callback(err));
    }

    /**
     * Gets stats for a path asynchronously.
     * @param {string} filePath The path to stat
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, stats)
     */
  }, {
    key: "stat",
    value: function stat(filePath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      this[kProvider].stat(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath), options).then(stats => callback(null, stats), err => callback(err));
    }

    /**
     * Gets stats without following symlinks asynchronously.
     * @param {string} filePath The path to stat
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, stats)
     */
  }, {
    key: "lstat",
    value: function lstat(filePath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      this[kProvider].lstat(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath), options).then(stats => callback(null, stats), err => callback(err));
    }

    /**
     * Reads directory contents asynchronously.
     * @param {string} dirPath The directory path
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, entries)
     */
  }, {
    key: "readdir",
    value: function readdir(dirPath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      this[kProvider].readdir(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, dirPath), options).then(entries => callback(null, entries), err => callback(err));
    }

    /**
     * Gets the real path asynchronously.
     * @param {string} filePath The path
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, resolvedPath)
     */
  }, {
    key: "realpath",
    value: function realpath(filePath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      this[kProvider].realpath(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath), options).then(realPath => callback(null, _assertClassBrand(_VirtualFileSystem_brand, this, _toMountedPath).call(this, realPath)), err => callback(err));
    }

    /**
     * Reads symlink target asynchronously.
     * @param {string} linkPath The symlink path
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, target)
     */
  }, {
    key: "readlink",
    value: function readlink(linkPath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      this[kProvider].readlink(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, linkPath), options).then(target => callback(null, target), err => callback(err));
    }

    /**
     * Checks file accessibility asynchronously.
     * @param {string} filePath The path to check
     * @param {number|Function} [mode] Access mode or callback
     * @param {Function} [callback] Callback (err)
     */
  }, {
    key: "access",
    value: function access(filePath, mode, callback) {
      if (typeof mode === 'function') {
        callback = mode;
        mode = undefined;
      }
      this[kProvider].access(_assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath), mode).then(() => callback(null), err => callback(err));
    }

    /**
     * Opens a file asynchronously.
     * @param {string} filePath The path to open
     * @param {string|Function} [flags] Open flags or callback
     * @param {number|Function} [mode] File mode or callback
     * @param {Function} [callback] Callback (err, fd)
     */
  }, {
    key: "open",
    value: function open(filePath, flags, mode, callback) {
      if (typeof flags === 'function') {
        callback = flags;
        flags = 'r';
        mode = undefined;
      } else if (typeof mode === 'function') {
        callback = mode;
        mode = undefined;
      }
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].open(providerPath, flags, mode).then(handle => {
        var fd = openVirtualFd(handle);
        callback(null, fd);
      }, err => callback(err));
    }

    /**
     * Closes a file descriptor asynchronously.
     * @param {number} fd The file descriptor
     * @param {Function} callback Callback (err)
     */
  }, {
    key: "close",
    value: function close(fd, callback) {
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        process.nextTick(callback, createEBADF('close'));
        return;
      }
      vfd.entry.close().then(() => {
        closeVirtualFd(fd);
        callback(null);
      }, err => callback(err));
    }

    /**
     * Reads from a file descriptor asynchronously.
     * @param {number} fd The file descriptor
     * @param {Buffer} buffer The buffer to read into
     * @param {number} offset The offset in the buffer
     * @param {number} length The number of bytes to read
     * @param {number|null} position The position in the file
     * @param {Function} callback Callback (err, bytesRead, buffer)
     */
  }, {
    key: "read",
    value: function read(fd, buffer, offset, length, position, callback) {
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        process.nextTick(callback, createEBADF('read'));
        return;
      }
      vfd.entry.read(buffer, offset, length, position).then(_ref => {
        var {
          bytesRead
        } = _ref;
        return callback(null, bytesRead, buffer);
      }, err => callback(err));
    }

    /**
     * Writes to a file descriptor asynchronously.
     * @param {number} fd The file descriptor
     * @param {Buffer} buffer The buffer to write from
     * @param {number} offset The offset in the buffer
     * @param {number} length The number of bytes to write
     * @param {number|null} position The position in the file
     * @param {Function} callback Callback (err, bytesWritten, buffer)
     */
  }, {
    key: "write",
    value: function write(fd, buffer, offset, length, position, callback) {
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        process.nextTick(callback, createEBADF('write'));
        return;
      }
      vfd.entry.write(buffer, offset, length, position).then(_ref2 => {
        var {
          bytesWritten
        } = _ref2;
        return callback(null, bytesWritten, buffer);
      }, err => callback(err));
    }

    /**
     * Removes a file or directory asynchronously.
     * @param {string} filePath The path to remove
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err)
     */
  }, {
    key: "rm",
    value: function rm(filePath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      try {
        this.rmSync(filePath, options);
        process.nextTick(callback, null);
      } catch (err) {
        process.nextTick(callback, err);
      }
    }

    /**
     * Gets file stats from a file descriptor asynchronously.
     * @param {number} fd The file descriptor
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, stats)
     */
  }, {
    key: "fstat",
    value: function fstat(fd, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      var vfd = getVirtualFd(fd);
      if (!vfd) {
        process.nextTick(callback, createEBADF('fstat'));
        return;
      }
      vfd.entry.stat(options).then(stats => callback(null, stats), err => callback(err));
    }

    /**
     * Truncates a file asynchronously.
     * @param {string} filePath The file path
     * @param {number|Function} [len] The new length or callback
     * @param {Function} [callback] Callback (err)
     */
  }, {
    key: "truncate",
    value: function truncate(filePath, len, callback) {
      if (typeof len === 'function') {
        callback = len;
        len = 0;
      }
      try {
        this.truncateSync(filePath, len);
        process.nextTick(callback, null);
      } catch (err) {
        process.nextTick(callback, err);
      }
    }

    /**
     * Truncates a file descriptor asynchronously.
     * @param {number} fd The file descriptor
     * @param {number|Function} [len] The new length or callback
     * @param {Function} [callback] Callback (err)
     */
  }, {
    key: "ftruncate",
    value: function ftruncate(fd, len, callback) {
      if (typeof len === 'function') {
        callback = len;
        len = 0;
      }
      try {
        this.ftruncateSync(fd, len);
        process.nextTick(callback, null);
      } catch (err) {
        process.nextTick(callback, err);
      }
    }

    /**
     * Creates a hard link asynchronously.
     * @param {string} existingPath The existing file path
     * @param {string} newPath The new link path
     * @param {Function} callback Callback (err)
     */
  }, {
    key: "link",
    value: function link(existingPath, newPath, callback) {
      try {
        this.linkSync(existingPath, newPath);
        process.nextTick(callback, null);
      } catch (err) {
        process.nextTick(callback, err);
      }
    }

    /**
     * Creates a unique temporary directory asynchronously.
     * @param {string} prefix The prefix for the temp directory
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, dirPath)
     */
  }, {
    key: "mkdtemp",
    value: function mkdtemp(prefix, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      try {
        var dirPath = this.mkdtempSync(prefix);
        process.nextTick(callback, null, dirPath);
      } catch (err) {
        process.nextTick(callback, err);
      }
    }

    /**
     * Opens a directory asynchronously.
     * @param {string} dirPath The directory path
     * @param {object|Function} [options] Options or callback
     * @param {Function} [callback] Callback (err, dir)
     */
  }, {
    key: "opendir",
    value: function opendir(dirPath, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      try {
        var dir = this.opendirSync(dirPath, options);
        process.nextTick(callback, null, dir);
      } catch (err) {
        process.nextTick(callback, err);
      }
    }

    // ==================== Stream Operations ====================

    /**
     * Creates a readable stream for a virtual file.
     * @param {string} filePath The path to the file
     * @param {object} [options] Stream options
     * @returns {ReadStream}
     */
  }, {
    key: "createReadStream",
    value: function createReadStream(filePath, options) {
      return new VirtualReadStream(this, filePath, options);
    }

    /**
     * Creates a writable stream for a virtual file.
     * @param {string} filePath The path to the file
     * @param {object} [options] Stream options
     * @returns {WriteStream}
     */
  }, {
    key: "createWriteStream",
    value: function createWriteStream(filePath, options) {
      return new VirtualWriteStream(this, filePath, options);
    }

    // ==================== Watch Operations ====================

    /**
     * Watches a file or directory for changes.
     * @param {string} filePath The path to watch
     * @param {object|Function} [options] Watch options or listener
     * @param {Function} [listener] Change listener
     * @returns {EventEmitter} A watcher that emits 'change' events
     */
  }, {
    key: "watch",
    value: function watch(filePath, options, listener) {
      if (typeof options === 'function') {
        listener = options;
        options = {};
      }
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      var watcher = this[kProvider].watch(providerPath, options);
      if (listener) {
        watcher.on('change', listener);
      }
      return watcher;
    }

    /**
     * Watches a file for changes using stat polling.
     * @param {string} filePath The path to watch
     * @param {object|Function} [options] Watch options or listener
     * @param {Function} [listener] Change listener
     * @returns {EventEmitter} A stat watcher that emits 'change' events
     */
  }, {
    key: "watchFile",
    value: function watchFile(filePath, options, listener) {
      if (typeof options === 'function') {
        listener = options;
        options = {};
      }
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      return this[kProvider].watchFile(providerPath, options, listener);
    }

    /**
     * Stops watching a file for changes.
     * @param {string} filePath The path to stop watching
     * @param {Function} [listener] Optional listener to remove
     */
  }, {
    key: "unwatchFile",
    value: function unwatchFile(filePath, listener) {
      var providerPath = _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, filePath);
      this[kProvider].unwatchFile(providerPath, listener);
    }

    // ==================== Promise API ====================

    /**
     * Gets the promises API for this VFS instance.
     * @returns {object} Promise-based fs methods
     */
  }, {
    key: "promises",
    get: function () {
      if (this[kPromises] === null) {
        this[kPromises] = _assertClassBrand(_VirtualFileSystem_brand, this, _createPromisesAPI).call(this);
      }
      return this[kPromises];
    }

    /**
     * Creates the promises API object for this VFS instance.
     * @returns {object} Promise-based fs methods
     */
  }]);
}();
function _toProviderPath(inputPath) {
  if (this[kMounted] && this[kMountPoint]) {
    var resolved = isAbsolute(inputPath) ? inputPath : resolvePath(inputPath);
    if (!isUnderMountPoint(resolved, this[kMountPoint])) {
      throw createENOENT('open', inputPath);
    }
    return getRelativePath(resolved, this[kMountPoint]);
  }
  return pathPosix.normalize(inputPath);
}
/**
 * Converts a provider-relative path back to a mounted path.
 * If not mounted, returns the path as-is.
 * @param {string} providerPath The provider-relative path
 * @returns {string} The mounted path
 */
function _toMountedPath(providerPath) {
  if (this[kMounted] && this[kMountPoint]) {
    return path.join(this[kMountPoint], providerPath);
  }
  return providerPath;
}
function _createPromisesAPI() {
  var provider = this[kProvider];

  // Use arrow function to capture `this` for private method access
  var toProviderPath = p => _assertClassBrand(_VirtualFileSystem_brand, this, _toProviderPath).call(this, p);
  var toMountedPath = p => _assertClassBrand(_VirtualFileSystem_brand, this, _toMountedPath).call(this, p);
  return ObjectFreeze({
    readFile: _async(function (filePath, options) {
      var providerPath = toProviderPath(filePath);
      return provider.readFile(providerPath, options);
    }),
    writeFile: _async(function (filePath, data, options) {
      var providerPath = toProviderPath(filePath);
      return provider.writeFile(providerPath, data, options);
    }),
    appendFile: _async(function (filePath, data, options) {
      var providerPath = toProviderPath(filePath);
      return provider.appendFile(providerPath, data, options);
    }),
    stat: _async(function (filePath, options) {
      var providerPath = toProviderPath(filePath);
      return provider.stat(providerPath, options);
    }),
    lstat: _async(function (filePath, options) {
      var providerPath = toProviderPath(filePath);
      return provider.lstat(providerPath, options);
    }),
    readdir: _async(function (dirPath, options) {
      var providerPath = toProviderPath(dirPath);
      return provider.readdir(providerPath, options);
    }),
    mkdir: _async(function (dirPath, options) {
      var providerPath = toProviderPath(dirPath);
      return provider.mkdir(providerPath, options);
    }),
    rmdir: _async(function (dirPath) {
      var providerPath = toProviderPath(dirPath);
      return provider.rmdir(providerPath);
    }),
    unlink: _async(function (filePath) {
      var providerPath = toProviderPath(filePath);
      return provider.unlink(providerPath);
    }),
    rename: _async(function (oldPath, newPath) {
      var oldProviderPath = toProviderPath(oldPath);
      var newProviderPath = toProviderPath(newPath);
      return provider.rename(oldProviderPath, newProviderPath);
    }),
    copyFile: _async(function (src, dest, mode) {
      var srcProviderPath = toProviderPath(src);
      var destProviderPath = toProviderPath(dest);
      return provider.copyFile(srcProviderPath, destProviderPath, mode);
    }),
    realpath: _async(function (filePath, options) {
      var providerPath = toProviderPath(filePath);
      return _await(provider.realpath(providerPath, options), toMountedPath);
    }),
    readlink: _async(function (linkPath, options) {
      var providerPath = toProviderPath(linkPath);
      return provider.readlink(providerPath, options);
    }),
    symlink: _async(function (target, path, type) {
      var providerPath = toProviderPath(path);
      return provider.symlink(target, providerPath, type);
    }),
    access: _async(function (filePath, mode) {
      var providerPath = toProviderPath(filePath);
      return provider.access(providerPath, mode);
    }),
    rm: _async(function (filePath, options) {
      var _exit = false;
      var _this = this;
      var recursive = options?.recursive === true;
      var force = options?.force === true;
      var stats;
      return _continue(_catch(function () {
        return _await(provider.lstat(toProviderPath(filePath)), function (_provider$lstat) {
          stats = _provider$lstat;
        });
      }, function (err) {
        if (force && err?.code === 'ENOENT') {
          _exit = true;
          return;
        }
        throw err;
      }), function (_result) {
        var _exit2 = false;
        if (_exit) return _result;
        // Symlinks should be unlinked directly, never recursed into
        return _invoke(function () {
          if (stats.isSymbolicLink()) {
            return _await(provider.unlink(toProviderPath(filePath)), function () {
              _exit2 = true;
            });
          }
        }, function (_result2) {
          return _exit2 ? _result2 : function () {
            if (stats.isDirectory()) {
              if (!recursive) {
                throw createEISDIR('rm', filePath);
              }
              return _await(provider.readdir(toProviderPath(filePath)), function (entries) {
                return _continue(_forTo(entries, function (i) {
                  return _awaitIgnored(_this.rm(joinPath(filePath, entries[i]), options));
                }), function () {
                  return _awaitIgnored(provider.rmdir(toProviderPath(filePath)));
                });
              });
            } else {
              return _awaitIgnored(provider.unlink(toProviderPath(filePath)));
            }
          }();
        });
      });
    }),
    truncate: _async(function (filePath) {
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var providerPath = toProviderPath(filePath);
      return _await(provider.open(providerPath, 'r+'), function (handle) {
        return _continueIgnored(_finallyRethrows(function () {
          return _awaitIgnored(handle.truncate(len));
        }, function (_wasThrown, _result4) {
          return _await(handle.close(), function () {
            return _rethrow(_wasThrown, _result4);
          });
        }));
      });
    }),
    link: _async(function (existingPath, newPath) {
      var existingProviderPath = toProviderPath(existingPath);
      var newProviderPath = toProviderPath(newPath);
      return provider.link(existingProviderPath, newProviderPath);
    }),
    mkdtemp: _async(function (prefix) {
      var providerPrefix = toProviderPath(prefix);
      var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var suffix = '';
      for (var _i = 0; _i < 6; _i++) {
        suffix += chars[MathRandom() * chars.length | 0];
      }
      var dirPath = providerPrefix + suffix;
      return _await(provider.mkdir(dirPath), function () {
        return toMountedPath(dirPath);
      });
    }),
    chmod: _async(function (filePath, mode) {
      var providerPath = toProviderPath(filePath);
      provider.chmodSync(providerPath, mode);
      return _await();
    }),
    chown: _async(function (filePath, uid, gid) {
      var providerPath = toProviderPath(filePath);
      provider.chownSync(providerPath, uid, gid);
      return _await();
    }),
    lchown: _async(function (filePath, uid, gid) {
      var providerPath = toProviderPath(filePath);
      provider.chownSync(providerPath, uid, gid);
      return _await();
    }),
    utimes: _async(function (filePath, atime, mtime) {
      var providerPath = toProviderPath(filePath);
      provider.utimesSync(providerPath, atime, mtime);
      return _await();
    }),
    lutimes: _async(function (filePath, atime, mtime) {
      var providerPath = toProviderPath(filePath);
      provider.lutimesSync(providerPath, atime, mtime);
      return _await();
    }),
    open: _async(function (filePath, flags, mode) {
      var providerPath = toProviderPath(filePath);
      var handle = provider.openSync(providerPath, flags, mode);
      return openVirtualFd(handle);
    }),
    lchmod: _async(function (filePath, mode) {
      var providerPath = toProviderPath(filePath);
      provider.chmodSync(providerPath, mode);
      return _await();
    }),
    watch(filePath, options) {
      var providerPath = toProviderPath(filePath);
      return provider.watchAsync(providerPath, options);
    }
  });
}
module.exports = {
  VirtualFileSystem
};

