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
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
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
  ERR_METHOD_NOT_IMPLEMENTED
} = require('internal/errors').codes;
var {
  createEROFS,
  createEEXIST,
  createEACCES
} = require('internal/vfs/errors');
var {
  fs: {
    R_OK,
    W_OK,
    X_OK,
    COPYFILE_EXCL
  }
} = internalBinding('constants');

/**
 * Base class for VFS providers.
 * Providers implement the essential primitives that the VFS delegates to.
 *
 * Implementations must override the essential primitives (open, stat, readdir, etc.)
 * Default implementations for derived methods (readFile, writeFile, etc.) are provided.
 */
var _VirtualProvider_brand = /*#__PURE__*/new WeakSet();
var VirtualProvider = /*#__PURE__*/function () {
  function VirtualProvider() {
    _classCallCheck(this, VirtualProvider);
    /**
     * Checks access mode bits against file stats.
     * @param {string} path The path (for error messages)
     * @param {Stats} stats The file stats
     * @param {number} mode The requested access mode
     */
    _classPrivateMethodInitSpec(this, _VirtualProvider_brand);
  }
  return _createClass(VirtualProvider, [{
    key: "readonly",
    get:
    // === CAPABILITY FLAGS ===

    /**
     * Returns true if this provider is read-only.
     * @returns {boolean}
     */
    function () {
      return false;
    }

    /**
     * Returns true if this provider supports symbolic links.
     * @returns {boolean}
     */
  }, {
    key: "supportsSymlinks",
    get: function () {
      return false;
    }

    /**
     * Returns true if this provider supports file watching.
     * @returns {boolean}
     */
  }, {
    key: "supportsWatch",
    get: function () {
      return false;
    }

    // === ESSENTIAL PRIMITIVES (must be implemented by subclasses) ===

    /**
     * Opens a file and returns a file handle.
     * @param {string} path The file path (relative to provider root)
     * @param {string} flags The open flags ('r', 'r+', 'w', 'w+', 'a', 'a+')
     * @param {number} [mode] The file mode (for creating files)
     * @returns {Promise<VirtualFileHandle>}
     */
  }, {
    key: "open",
    value: function open(path, flags, mode) {
      try {
        throw new ERR_METHOD_NOT_IMPLEMENTED('open');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Opens a file synchronously and returns a file handle.
     * @param {string} path The file path (relative to provider root)
     * @param {string} flags The open flags ('r', 'r+', 'w', 'w+', 'a', 'a+')
     * @param {number} [mode] The file mode (for creating files)
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "openSync",
    value: function openSync(path, flags, mode) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('openSync');
    }

    /**
     * Gets stats for a path.
     * @param {string} path The path to stat
     * @param {object} [options] Options
     * @returns {Promise<Stats>}
     */
  }, {
    key: "stat",
    value: function stat(path, options) {
      try {
        throw new ERR_METHOD_NOT_IMPLEMENTED('stat');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Gets stats for a path synchronously.
     * @param {string} path The path to stat
     * @param {object} [options] Options
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "statSync",
    value: function statSync(path, options) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('statSync');
    }

    /**
     * Gets stats for a path without following symlinks.
     * @param {string} path The path to stat
     * @param {object} [options] Options
     * @returns {Promise<Stats>}
     */
  }, {
    key: "lstat",
    value: function lstat(path, options) {
      try {
        var _this = this;
        // Default: same as stat (for providers that don't support symlinks)
        return _await(_this.stat(path, options));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Gets stats for a path synchronously without following symlinks.
     * @param {string} path The path to stat
     * @param {object} [options] Options
     * @returns {Stats}
     */
  }, {
    key: "lstatSync",
    value: function lstatSync(path, options) {
      // Default: same as statSync (for providers that don't support symlinks)
      return this.statSync(path, options);
    }

    /**
     * Reads directory contents.
     * @param {string} path The directory path
     * @param {object} [options] Options
     * @returns {Promise<string[]|Dirent[]>}
     */
  }, {
    key: "readdir",
    value: function readdir(path, options) {
      try {
        throw new ERR_METHOD_NOT_IMPLEMENTED('readdir');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Reads directory contents synchronously.
     * @param {string} path The directory path
     * @param {object} [options] Options
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "readdirSync",
    value: function readdirSync(path, options) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('readdirSync');
    }

    /**
     * Creates a directory.
     * @param {string} path The directory path
     * @param {object} [options] Options
     * @returns {Promise<void>}
     */
  }, {
    key: "mkdir",
    value: function mkdir(path, options) {
      try {
        var _this2 = this;
        if (_this2.readonly) {
          throw createEROFS('mkdir', path);
        }
        throw new ERR_METHOD_NOT_IMPLEMENTED('mkdir');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Creates a directory synchronously.
     * @param {string} path The directory path
     * @param {object} [options] Options
     */
  }, {
    key: "mkdirSync",
    value: function mkdirSync(path, options) {
      if (this.readonly) {
        throw createEROFS('mkdir', path);
      }
      throw new ERR_METHOD_NOT_IMPLEMENTED('mkdirSync');
    }

    /**
     * Removes a directory.
     * @param {string} path The directory path
     * @returns {Promise<void>}
     */
  }, {
    key: "rmdir",
    value: function rmdir(path) {
      try {
        var _this3 = this;
        if (_this3.readonly) {
          throw createEROFS('rmdir', path);
        }
        throw new ERR_METHOD_NOT_IMPLEMENTED('rmdir');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Removes a directory synchronously.
     * @param {string} path The directory path
     */
  }, {
    key: "rmdirSync",
    value: function rmdirSync(path) {
      if (this.readonly) {
        throw createEROFS('rmdir', path);
      }
      throw new ERR_METHOD_NOT_IMPLEMENTED('rmdirSync');
    }

    /**
     * Removes a file.
     * @param {string} path The file path
     * @returns {Promise<void>}
     */
  }, {
    key: "unlink",
    value: function unlink(path) {
      try {
        var _this4 = this;
        if (_this4.readonly) {
          throw createEROFS('unlink', path);
        }
        throw new ERR_METHOD_NOT_IMPLEMENTED('unlink');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Removes a file synchronously.
     * @param {string} path The file path
     */
  }, {
    key: "unlinkSync",
    value: function unlinkSync(path) {
      if (this.readonly) {
        throw createEROFS('unlink', path);
      }
      throw new ERR_METHOD_NOT_IMPLEMENTED('unlinkSync');
    }

    /**
     * Renames a file or directory.
     * @param {string} oldPath The old path
     * @param {string} newPath The new path
     * @returns {Promise<void>}
     */
  }, {
    key: "rename",
    value: function rename(oldPath, newPath) {
      try {
        var _this5 = this;
        if (_this5.readonly) {
          throw createEROFS('rename', oldPath);
        }
        throw new ERR_METHOD_NOT_IMPLEMENTED('rename');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Renames a file or directory synchronously.
     * @param {string} oldPath The old path
     * @param {string} newPath The new path
     */
  }, {
    key: "renameSync",
    value: function renameSync(oldPath, newPath) {
      if (this.readonly) {
        throw createEROFS('rename', oldPath);
      }
      throw new ERR_METHOD_NOT_IMPLEMENTED('renameSync');
    }

    // === DEFAULT IMPLEMENTATIONS (built on primitives) ===

    /**
     * Reads a file.
     * @param {string} path The file path
     * @param {object|string} [options] Options or encoding
     * @returns {Promise<Buffer|string>}
     */
  }, {
    key: "readFile",
    value: function readFile(path, options) {
      try {
        var _this6 = this;
        var flag = typeof options === 'object' && options !== null ? options.flag ?? 'r' : 'r';
        return _await(_this6.open(path, flag), function (handle) {
          return _finallyRethrows(function () {
            return _await(handle.readFile(options));
          }, function (_wasThrown, _result) {
            return _await(handle.close(), function () {
              return _rethrow(_wasThrown, _result);
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Reads a file synchronously.
     * @param {string} path The file path
     * @param {object|string} [options] Options or encoding
     * @returns {Buffer|string}
     */
  }, {
    key: "readFileSync",
    value: function readFileSync(path, options) {
      var flag = typeof options === 'object' && options !== null ? options.flag ?? 'r' : 'r';
      var handle = this.openSync(path, flag);
      try {
        return handle.readFileSync(options);
      } finally {
        handle.closeSync();
      }
    }

    /**
     * Writes a file.
     * @param {string} path The file path
     * @param {Buffer|string} data The data to write
     * @param {object} [options] Options
     * @returns {Promise<void>}
     */
  }, {
    key: "writeFile",
    value: function writeFile(path, data, options) {
      try {
        var _this7 = this;
        if (_this7.readonly) {
          throw createEROFS('open', path);
        }
        var flag = options?.flag ?? 'w';
        return _await(_this7.open(path, flag, options?.mode), function (handle) {
          return _continueIgnored(_finallyRethrows(function () {
            return _awaitIgnored(handle.writeFile(data, options));
          }, function (_wasThrown2, _result2) {
            return _await(handle.close(), function () {
              return _rethrow(_wasThrown2, _result2);
            });
          }));
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Writes a file synchronously.
     * @param {string} path The file path
     * @param {Buffer|string} data The data to write
     * @param {object} [options] Options
     */
  }, {
    key: "writeFileSync",
    value: function writeFileSync(path, data, options) {
      if (this.readonly) {
        throw createEROFS('open', path);
      }
      var flag = options?.flag ?? 'w';
      var handle = this.openSync(path, flag, options?.mode);
      try {
        handle.writeFileSync(data, options);
      } finally {
        handle.closeSync();
      }
    }

    /**
     * Appends to a file.
     * @param {string} path The file path
     * @param {Buffer|string} data The data to append
     * @param {object} [options] Options
     * @returns {Promise<void>}
     */
  }, {
    key: "appendFile",
    value: function appendFile(path, data, options) {
      try {
        var _this8 = this;
        if (_this8.readonly) {
          throw createEROFS('open', path);
        }
        var flag = options?.flag ?? 'a';
        return _await(_this8.open(path, flag, options?.mode), function (handle) {
          return _continueIgnored(_finallyRethrows(function () {
            return _awaitIgnored(handle.writeFile(data, options));
          }, function (_wasThrown3, _result3) {
            return _await(handle.close(), function () {
              return _rethrow(_wasThrown3, _result3);
            });
          }));
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Appends to a file synchronously.
     * @param {string} path The file path
     * @param {Buffer|string} data The data to append
     * @param {object} [options] Options
     */
  }, {
    key: "appendFileSync",
    value: function appendFileSync(path, data, options) {
      if (this.readonly) {
        throw createEROFS('open', path);
      }
      var flag = options?.flag ?? 'a';
      var handle = this.openSync(path, flag, options?.mode);
      try {
        handle.writeFileSync(data, options);
      } finally {
        handle.closeSync();
      }
    }

    /**
     * Checks if a path exists.
     * @param {string} path The path to check
     * @returns {Promise<boolean>}
     */
  }, {
    key: "exists",
    value: function exists(path) {
      var _this9 = this;
      return _await(_catch(function () {
        return _await(_this9.stat(path), function () {
          return true;
        });
      }, function () {
        return false;
      }));
    }
    /**
     * Checks if a path exists synchronously.
     * @param {string} path The path to check
     * @returns {boolean}
     */
  }, {
    key: "existsSync",
    value: function existsSync(path) {
      try {
        this.statSync(path);
        return true;
      } catch {
        return false;
      }
    }

    /**
     * Copies a file.
     * @param {string} src Source path
     * @param {string} dest Destination path
     * @param {number} [mode] Copy mode flags
     * @returns {Promise<void>}
     */
  }, {
    key: "copyFile",
    value: function copyFile(src, dest, mode) {
      try {
        var _exit = false;
        var _this0 = this;
        if (_this0.readonly) {
          throw createEROFS('copyfile', dest);
        }
        return _await(_invoke(function () {
          if ((mode & COPYFILE_EXCL) !== 0) {
            return _await(_this0.exists(dest), function (_this0$exists) {
              if (_this0$exists) {
                throw createEEXIST('copyfile', dest);
              }
            });
          }
        }, function (_result4) {
          return _exit ? _result4 : _await(_this0.readFile(src), function (content) {
            return _awaitIgnored(_this0.writeFile(dest, content));
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
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
      if (this.readonly) {
        throw createEROFS('copyfile', dest);
      }
      if ((mode & COPYFILE_EXCL) !== 0) {
        if (this.existsSync(dest)) {
          throw createEEXIST('copyfile', dest);
        }
      }
      var content = this.readFileSync(src);
      this.writeFileSync(dest, content);
    }

    /**
     * Gets the real path by resolving symlinks.
     * @param {string} path The path
     * @param {object} [options] Options
     * @returns {Promise<string>}
     */
  }, {
    key: "realpath",
    value: function realpath(path, options) {
      try {
        var _this1 = this;
        // Default: return the path as-is (for providers without symlinks)
        // First verify the path exists
        return _await(_this1.stat(path), function () {
          return path;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Gets the real path synchronously.
     * @param {string} path The path
     * @param {object} [options] Options
     * @returns {string}
     */
  }, {
    key: "realpathSync",
    value: function realpathSync(path, options) {
      // Default: return the path as-is (for providers without symlinks)
      // First verify the path exists
      this.statSync(path);
      return path;
    }

    /**
     * Checks file accessibility.
     * @param {string} path The path to check
     * @param {number} [mode] Access mode
     * @returns {Promise<void>}
     */
  }, {
    key: "access",
    value: function access(path, mode) {
      try {
        var _this10 = this;
        return _await(_this10.stat(path), function (stats) {
          _assertClassBrand(_VirtualProvider_brand, _this10, _checkAccessMode).call(_this10, path, stats, mode);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Checks file accessibility synchronously.
     * @param {string} path The path to check
     * @param {number} [mode] Access mode
     */
  }, {
    key: "accessSync",
    value: function accessSync(path, mode) {
      var stats = this.statSync(path);
      _assertClassBrand(_VirtualProvider_brand, this, _checkAccessMode).call(this, path, stats, mode);
    }
  }, {
    key: "link",
    value: // === HARD LINK OPERATIONS (optional) ===
    /**
     * Creates a hard link.
     * @param {string} existingPath The existing file path
     * @param {string} newPath The new link path
     * @returns {Promise<void>}
     */
    function link(existingPath, newPath) {
      try {
        var _this11 = this;
        if (_this11.readonly) {
          throw createEROFS('link', newPath);
        }
        throw new ERR_METHOD_NOT_IMPLEMENTED('link');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Creates a hard link synchronously.
     * @param {string} existingPath The existing file path
     * @param {string} newPath The new link path
     */
  }, {
    key: "linkSync",
    value: function linkSync(existingPath, newPath) {
      if (this.readonly) {
        throw createEROFS('link', newPath);
      }
      throw new ERR_METHOD_NOT_IMPLEMENTED('linkSync');
    }

    // === SYMLINK OPERATIONS (optional, throw ENOENT by default) ===

    /**
     * Reads the target of a symbolic link.
     * @param {string} path The symlink path
     * @param {object} [options] Options
     * @returns {Promise<string>}
     */
  }, {
    key: "readlink",
    value: function readlink(path, options) {
      try {
        throw new ERR_METHOD_NOT_IMPLEMENTED('readlink');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Reads the target of a symbolic link synchronously.
     * @param {string} path The symlink path
     * @param {object} [options] Options
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not implemented by subclass
     */
  }, {
    key: "readlinkSync",
    value: function readlinkSync(path, options) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('readlinkSync');
    }

    /**
     * Creates a symbolic link.
     * @param {string} target The symlink target
     * @param {string} path The symlink path
     * @param {string} [type] The symlink type (file, dir, junction)
     * @returns {Promise<void>}
     */
  }, {
    key: "symlink",
    value: function symlink(target, path, type) {
      try {
        var _this12 = this;
        if (_this12.readonly) {
          throw createEROFS('symlink', path);
        }
        throw new ERR_METHOD_NOT_IMPLEMENTED('symlink');
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Creates a symbolic link synchronously.
     * @param {string} target The symlink target
     * @param {string} path The symlink path
     * @param {string} [type] The symlink type (file, dir, junction)
     */
  }, {
    key: "symlinkSync",
    value: function symlinkSync(target, path, type) {
      if (this.readonly) {
        throw createEROFS('symlink', path);
      }
      throw new ERR_METHOD_NOT_IMPLEMENTED('symlinkSync');
    }

    // === WATCH OPERATIONS (optional, polling-based) ===

    /**
     * Watches a file or directory for changes.
     * Returns an EventEmitter-like object that emits 'change' and 'close' events.
     * @param {string} path The path to watch
     * @param {object} [options] Watch options
     * @param {number} [options.interval] Polling interval in ms (default: 100)
     * @param {boolean} [options.recursive] Watch subdirectories (default: false)
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not overridden by subclass
     */
  }, {
    key: "watch",
    value: function watch(path, options) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('watch');
    }

    /**
     * Watches a file or directory for changes (async iterable version).
     * Used by fs.promises.watch().
     * @param {string} path The path to watch
     * @param {object} [options] Watch options
     * @param {number} [options.interval] Polling interval in ms (default: 100)
     * @param {boolean} [options.recursive] Watch subdirectories (default: false)
     * @param {AbortSignal} [options.signal] AbortSignal for cancellation
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not overridden by subclass
     */
  }, {
    key: "watchAsync",
    value: function watchAsync(path, options) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('watchAsync');
    }

    /**
     * Watches a file for changes using stat polling.
     * Returns a StatWatcher-like object that emits 'change' events with stats.
     * @param {string} path The path to watch
     * @param {object} [options] Watch options
     * @param {number} [options.interval] Polling interval in ms (default: 5007)
     * @param {boolean} [options.persistent] Whether the watcher should prevent exit
     * @throws {ERR_METHOD_NOT_IMPLEMENTED} When not overridden by subclass
     */
  }, {
    key: "watchFile",
    value: function watchFile(path, options) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('watchFile');
    }

    /**
     * Stops watching a file for changes.
     * @param {string} path The path to stop watching
     * @param {Function} [listener] Optional listener to remove
     */
  }, {
    key: "unwatchFile",
    value: function unwatchFile(path, listener) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('unwatchFile');
    }
  }]);
}();
function _checkAccessMode(path, stats, mode) {
  if (mode == null || mode === 0) return; // F_OK = 0, existence-only check

  var fileMode = stats.mode & 0o777; // Permission bits
  // Check owner permissions (simplified: treat VFS user as owner)
  if ((mode & R_OK) !== 0 && (fileMode & 0o400) === 0) {
    throw createEACCES('access', path);
  }
  if ((mode & W_OK) !== 0 && (fileMode & 0o200) === 0) {
    throw createEACCES('access', path);
  }
  if ((mode & X_OK) !== 0 && (fileMode & 0o100) === 0) {
    throw createEACCES('access', path);
  }
}
module.exports = {
  VirtualProvider
};

