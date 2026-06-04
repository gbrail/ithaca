'use strict';

function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
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
  ObjectAssign,
  Promise,
  PromiseResolve,
  SafeMap,
  SafeSet,
  SymbolAsyncIterator
} = primordials;
var {
  AbortError
} = require('internal/errors');
var {
  Buffer
} = require('buffer');
var {
  EventEmitter
} = require('events');
var {
  basename,
  join
} = require('path');
var {
  setInterval,
  clearInterval
} = require('timers');

/**
 * VFSWatcher - Polling-based file/directory watcher for VFS.
 * Emits 'change' events when the file content or stats change.
 * Compatible with fs.watch() return value interface.
 */
var _vfs = /*#__PURE__*/new WeakMap();
var _path = /*#__PURE__*/new WeakMap();
var _interval = /*#__PURE__*/new WeakMap();
var _timer = /*#__PURE__*/new WeakMap();
var _lastStats = /*#__PURE__*/new WeakMap();
var _closed = /*#__PURE__*/new WeakMap();
var _persistent = /*#__PURE__*/new WeakMap();
var _recursive = /*#__PURE__*/new WeakMap();
var _encoding = /*#__PURE__*/new WeakMap();
var _trackedFiles = /*#__PURE__*/new WeakMap();
var _signal = /*#__PURE__*/new WeakMap();
var _abortHandler = /*#__PURE__*/new WeakMap();
var _VFSWatcher_brand = /*#__PURE__*/new WeakSet();
var VFSWatcher = /*#__PURE__*/function (_EventEmitter) {
  /**
   * @param {VirtualProvider} provider The VFS provider
   * @param {string} path The path to watch (provider-relative)
   * @param {object} [options] Options
   * @param {number} [options.interval] Polling interval in ms (default: 100)
   * @param {boolean} [options.persistent] Keep process alive (default: true)
   * @param {boolean} [options.recursive] Watch subdirectories (default: false)
   * @param {AbortSignal} [options.signal] AbortSignal for cancellation
   */
  function VFSWatcher(provider, path) {
    var _this;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, VFSWatcher);
    _this = _callSuper(this, VFSWatcher);
    /**
     * Encodes a filename according to the watcher's encoding option.
     * @param {string} filename The filename to encode
     * @returns {string|Buffer} The encoded filename
     */
    _classPrivateMethodInitSpec(_this, _VFSWatcher_brand);
    _classPrivateFieldInitSpec(_this, _vfs, void 0);
    _classPrivateFieldInitSpec(_this, _path, void 0);
    _classPrivateFieldInitSpec(_this, _interval, void 0);
    _classPrivateFieldInitSpec(_this, _timer, null);
    _classPrivateFieldInitSpec(_this, _lastStats, void 0);
    _classPrivateFieldInitSpec(_this, _closed, false);
    _classPrivateFieldInitSpec(_this, _persistent, void 0);
    _classPrivateFieldInitSpec(_this, _recursive, void 0);
    _classPrivateFieldInitSpec(_this, _encoding, void 0);
    _classPrivateFieldInitSpec(_this, _trackedFiles, void 0);
    _classPrivateFieldInitSpec(_this, _signal, void 0);
    _classPrivateFieldInitSpec(_this, _abortHandler, null);
    _classPrivateFieldSet(_vfs, _this, provider);
    _classPrivateFieldSet(_path, _this, path);
    _classPrivateFieldSet(_interval, _this, options.interval ?? 100);
    _classPrivateFieldSet(_persistent, _this, options.persistent !== false);
    _classPrivateFieldSet(_recursive, _this, options.recursive === true);
    _classPrivateFieldSet(_encoding, _this, options.encoding);
    _classPrivateFieldSet(_trackedFiles, _this, new SafeMap()); // path -> { stats, relativePath }
    _classPrivateFieldSet(_signal, _this, options.signal);

    // Handle AbortSignal
    if (_classPrivateFieldGet(_signal, _this)) {
      if (_classPrivateFieldGet(_signal, _this).aborted) {
        _this.close();
        return _possibleConstructorReturn(_this);
      }
      _classPrivateFieldSet(_abortHandler, _this, () => _this.close());
      _classPrivateFieldGet(_signal, _this).addEventListener('abort', _classPrivateFieldGet(_abortHandler, _this), {
        once: true
      });
    }

    // Get initial stats
    _classPrivateFieldSet(_lastStats, _this, _assertClassBrand(_VFSWatcher_brand, _this, _getStats).call(_this));

    // If watching a directory, build file list
    if (_classPrivateFieldGet(_lastStats, _this)?.isDirectory()) {
      if (_classPrivateFieldGet(_recursive, _this)) {
        _assertClassBrand(_VFSWatcher_brand, _this, _buildFileList).call(_this, _classPrivateFieldGet(_path, _this), '');
      } else {
        _assertClassBrand(_VFSWatcher_brand, _this, _buildChildList).call(_this, _classPrivateFieldGet(_path, _this));
      }
    }

    // Start polling
    _assertClassBrand(_VFSWatcher_brand, _this, _startPolling).call(_this);
    return _this;
  }
  _inherits(VFSWatcher, _EventEmitter);
  return _createClass(VFSWatcher, [{
    key: "close",
    value:
    /**
     * Closes the watcher and stops polling.
     */
    function close() {
      if (_classPrivateFieldGet(_closed, this)) return;
      _classPrivateFieldSet(_closed, this, true);
      if (_classPrivateFieldGet(_timer, this)) {
        clearInterval(_classPrivateFieldGet(_timer, this));
        _classPrivateFieldSet(_timer, this, null);
      }

      // Clear tracked files
      _classPrivateFieldGet(_trackedFiles, this).clear();

      // Remove abort handler
      if (_classPrivateFieldGet(_signal, this) && _classPrivateFieldGet(_abortHandler, this)) {
        _classPrivateFieldGet(_signal, this).removeEventListener('abort', _classPrivateFieldGet(_abortHandler, this));
      }
      this.emit('close');
    }

    /**
     * Alias for close() - compatibility with FSWatcher.
     * @returns {this}
     */
  }, {
    key: "unref",
    value: function unref() {
      _classPrivateFieldGet(_timer, this)?.unref?.();
      return this;
    }

    /**
     * Makes the timer keep the process alive - compatibility with FSWatcher.
     * @returns {this}
     */
  }, {
    key: "ref",
    value: function ref() {
      _classPrivateFieldGet(_timer, this)?.ref?.();
      return this;
    }
  }]);
}(EventEmitter);
/**
 * VFSStatWatcher - Polling-based stat watcher for VFS.
 * Emits 'change' events with current and previous stats.
 * Compatible with fs.watchFile() return value interface.
 */
function _encodeFilename(filename) {
  if (_classPrivateFieldGet(_encoding, this) === 'buffer') {
    return Buffer.from(filename);
  }
  return filename;
}
/**
 * Gets stats for the watched path.
 * @returns {Stats|null} The stats or null if file doesn't exist
 */
function _getStats() {
  try {
    return _classPrivateFieldGet(_vfs, this).statSync(_classPrivateFieldGet(_path, this));
  } catch {
    return null;
  }
}
/**
 * Starts the polling timer.
 */
function _startPolling() {
  if (_classPrivateFieldGet(_closed, this)) return;
  _classPrivateFieldSet(_timer, this, setInterval(() => _assertClassBrand(_VFSWatcher_brand, this, _poll).call(this), _classPrivateFieldGet(_interval, this)));

  // If not persistent, unref the timer to allow process to exit
  if (!_classPrivateFieldGet(_persistent, this) && _classPrivateFieldGet(_timer, this).unref) {
    _classPrivateFieldGet(_timer, this).unref();
  }
}
/**
 * Polls for changes.
 */
function _poll() {
  if (_classPrivateFieldGet(_closed, this)) return;

  // For directory watching, poll tracked children
  if (_classPrivateFieldGet(_lastStats, this)?.isDirectory()) {
    _assertClassBrand(_VFSWatcher_brand, this, _pollDirectory).call(this);
    return;
  }

  // For single file watching
  var newStats = _assertClassBrand(_VFSWatcher_brand, this, _getStats).call(this);
  if (_assertClassBrand(_VFSWatcher_brand, this, _statsChanged).call(this, _classPrivateFieldGet(_lastStats, this), newStats)) {
    var eventType = _assertClassBrand(_VFSWatcher_brand, this, _determineEventType).call(this, _classPrivateFieldGet(_lastStats, this), newStats);
    var filename = _assertClassBrand(_VFSWatcher_brand, this, _encodeFilename).call(this, basename(_classPrivateFieldGet(_path, this)));
    this.emit('change', eventType, filename);
  }
  _classPrivateFieldSet(_lastStats, this, newStats);
}
/**
 * Polls directory children for changes, detecting new and deleted files.
 */
function _pollDirectory() {
  // Rescan for new files
  if (_classPrivateFieldGet(_recursive, this)) {
    _assertClassBrand(_VFSWatcher_brand, this, _rescanRecursive).call(this, _classPrivateFieldGet(_path, this), '');
  } else {
    _assertClassBrand(_VFSWatcher_brand, this, _rescanChildren).call(this, _classPrivateFieldGet(_path, this));
  }

  // Check tracked files for changes/deletions
  for (var {
    0: filePath,
    1: info
  } of _classPrivateFieldGet(_trackedFiles, this)) {
    var newStats = _assertClassBrand(_VFSWatcher_brand, this, _getStatsFor).call(this, filePath);
    if (newStats === null && info.stats !== null) {
      // File was deleted
      this.emit('change', 'rename', _assertClassBrand(_VFSWatcher_brand, this, _encodeFilename).call(this, info.relativePath));
      _classPrivateFieldGet(_trackedFiles, this).delete(filePath);
    } else if (_assertClassBrand(_VFSWatcher_brand, this, _statsChanged).call(this, info.stats, newStats)) {
      var eventType = _assertClassBrand(_VFSWatcher_brand, this, _determineEventType).call(this, info.stats, newStats);
      this.emit('change', eventType, _assertClassBrand(_VFSWatcher_brand, this, _encodeFilename).call(this, info.relativePath));
      info.stats = newStats;
    }
  }
}
/**
 * Rescans direct children for new entries.
 * @param {string} dirPath The directory path
 */
function _rescanChildren(dirPath) {
  try {
    var entries = _classPrivateFieldGet(_vfs, this).readdirSync(dirPath);
    for (var name of entries) {
      var fullPath = join(dirPath, name);
      if (!_classPrivateFieldGet(_trackedFiles, this).has(fullPath)) {
        var stats = _assertClassBrand(_VFSWatcher_brand, this, _getStatsFor).call(this, fullPath);
        _classPrivateFieldGet(_trackedFiles, this).set(fullPath, {
          stats,
          relativePath: name
        });
        this.emit('change', 'rename', _assertClassBrand(_VFSWatcher_brand, this, _encodeFilename).call(this, name));
      }
    }
  } catch {
    // Directory might not exist or be readable
  }
}
/**
 * Recursively rescans for new entries.
 * @param {string} dirPath The directory path
 * @param {string} relativePath The relative path from watched root
 */
function _rescanRecursive(dirPath, relativePath) {
  try {
    var entries = _classPrivateFieldGet(_vfs, this).readdirSync(dirPath, {
      withFileTypes: true
    });
    for (var entry of entries) {
      var fullPath = join(dirPath, entry.name);
      var relPath = relativePath ? join(relativePath, entry.name) : entry.name;
      if (entry.isDirectory()) {
        _assertClassBrand(_VFSWatcher_brand, this, _rescanRecursive).call(this, fullPath, relPath);
      } else if (!_classPrivateFieldGet(_trackedFiles, this).has(fullPath)) {
        var stats = _assertClassBrand(_VFSWatcher_brand, this, _getStatsFor).call(this, fullPath);
        _classPrivateFieldGet(_trackedFiles, this).set(fullPath, {
          stats,
          relativePath: relPath
        });
        this.emit('change', 'rename', _assertClassBrand(_VFSWatcher_brand, this, _encodeFilename).call(this, relPath));
      }
    }
  } catch {
    // Directory might not exist or be readable
  }
}
/**
 * Gets stats for a specific path.
 * @param {string} filePath The file path
 * @returns {Stats|null}
 */
function _getStatsFor(filePath) {
  try {
    return _classPrivateFieldGet(_vfs, this).statSync(filePath);
  } catch {
    return null;
  }
}
/**
 * Builds the list of files to track for recursive watching.
 * @param {string} dirPath The directory path
 * @param {string} relativePath The relative path from the watched root
 */
function _buildFileList(dirPath, relativePath) {
  try {
    var entries = _classPrivateFieldGet(_vfs, this).readdirSync(dirPath, {
      withFileTypes: true
    });
    for (var entry of entries) {
      var fullPath = join(dirPath, entry.name);
      var relPath = relativePath ? join(relativePath, entry.name) : entry.name;
      if (entry.isDirectory()) {
        // Recurse into subdirectory
        _assertClassBrand(_VFSWatcher_brand, this, _buildFileList).call(this, fullPath, relPath);
      } else {
        // Track the file
        var stats = _assertClassBrand(_VFSWatcher_brand, this, _getStatsFor).call(this, fullPath);
        _classPrivateFieldGet(_trackedFiles, this).set(fullPath, {
          stats,
          relativePath: relPath
        });
      }
    }
  } catch {
    // Directory might not exist or be readable
  }
}
/**
 * Builds a list of direct children to track for non-recursive watching.
 * @param {string} dirPath The directory path
 */
function _buildChildList(dirPath) {
  try {
    var entries = _classPrivateFieldGet(_vfs, this).readdirSync(dirPath);
    for (var name of entries) {
      var fullPath = join(dirPath, name);
      var stats = _assertClassBrand(_VFSWatcher_brand, this, _getStatsFor).call(this, fullPath);
      _classPrivateFieldGet(_trackedFiles, this).set(fullPath, {
        stats,
        relativePath: name
      });
    }
  } catch {
    // Directory might not exist or be readable
  }
}
/**
 * Checks if stats have changed.
 * @param {Stats|null} oldStats Previous stats
 * @param {Stats|null} newStats Current stats
 * @returns {boolean} True if stats changed
 */
function _statsChanged(oldStats, newStats) {
  // File created or deleted
  if (oldStats === null !== (newStats === null)) {
    return true;
  }

  // Both null - no change
  if (oldStats === null && newStats === null) {
    return false;
  }

  // Compare mtime and size
  if (oldStats.mtimeMs !== newStats.mtimeMs) {
    return true;
  }
  if (oldStats.size !== newStats.size) {
    return true;
  }
  return false;
}
/**
 * Determines the event type based on stats change.
 * @param {Stats|null} oldStats Previous stats
 * @param {Stats|null} newStats Current stats
 * @returns {string} 'rename' or 'change'
 */
function _determineEventType(oldStats, newStats) {
  // File was created or deleted
  if (oldStats === null !== (newStats === null)) {
    return 'rename';
  }
  // Content changed
  return 'change';
}
var _vfs2 = /*#__PURE__*/new WeakMap();
var _path2 = /*#__PURE__*/new WeakMap();
var _interval2 = /*#__PURE__*/new WeakMap();
var _persistent2 = /*#__PURE__*/new WeakMap();
var _bigint = /*#__PURE__*/new WeakMap();
var _closed2 = /*#__PURE__*/new WeakMap();
var _timer2 = /*#__PURE__*/new WeakMap();
var _lastStats2 = /*#__PURE__*/new WeakMap();
var _listeners = /*#__PURE__*/new WeakMap();
var _VFSStatWatcher_brand = /*#__PURE__*/new WeakSet();
var VFSStatWatcher = /*#__PURE__*/function (_EventEmitter2) {
  /**
   * @param {VirtualProvider} provider The VFS provider
   * @param {string} path The path to watch (provider-relative)
   * @param {object} [options] Options
   * @param {number} [options.interval] Polling interval in ms (default: 5007)
   * @param {boolean} [options.persistent] Keep process alive (default: true)
   */
  function VFSStatWatcher(provider, path) {
    var _this2;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, VFSStatWatcher);
    _this2 = _callSuper(this, VFSStatWatcher);
    /**
     * Gets stats for the watched path.
     * @returns {Stats} The stats (with zeroed values if file doesn't exist)
     */
    _classPrivateMethodInitSpec(_this2, _VFSStatWatcher_brand);
    _classPrivateFieldInitSpec(_this2, _vfs2, void 0);
    _classPrivateFieldInitSpec(_this2, _path2, void 0);
    _classPrivateFieldInitSpec(_this2, _interval2, void 0);
    _classPrivateFieldInitSpec(_this2, _persistent2, void 0);
    _classPrivateFieldInitSpec(_this2, _bigint, void 0);
    _classPrivateFieldInitSpec(_this2, _closed2, false);
    _classPrivateFieldInitSpec(_this2, _timer2, null);
    _classPrivateFieldInitSpec(_this2, _lastStats2, void 0);
    _classPrivateFieldInitSpec(_this2, _listeners, void 0);
    _classPrivateFieldSet(_vfs2, _this2, provider);
    _classPrivateFieldSet(_path2, _this2, path);
    _classPrivateFieldSet(_interval2, _this2, options.interval ?? 5007);
    _classPrivateFieldSet(_persistent2, _this2, options.persistent !== false);
    _classPrivateFieldSet(_bigint, _this2, options.bigint === true);
    _classPrivateFieldSet(_listeners, _this2, new SafeSet());

    // Get initial stats
    _classPrivateFieldSet(_lastStats2, _this2, _assertClassBrand(_VFSStatWatcher_brand, _this2, _getStats2).call(_this2));

    // Start polling
    _assertClassBrand(_VFSStatWatcher_brand, _this2, _startPolling2).call(_this2);
    return _this2;
  }
  _inherits(VFSStatWatcher, _EventEmitter2);
  return _createClass(VFSStatWatcher, [{
    key: "addListener",
    value:
    /**
     * Adds a listener for the given event.
     * Tracks 'change' listeners for internal bookkeeping.
     * @param {string} event The event name
     * @param {Function} listener The listener function
     * @returns {this}
     */
    function addListener(event, listener) {
      if (event === 'change') {
        _classPrivateFieldGet(_listeners, this).add(listener);
      }
      _superPropGet(VFSStatWatcher, "addListener", this, 3)([event, listener]);
      return this;
    }

    /**
     * Removes a listener for the given event.
     * @param {string} event The event name
     * @param {Function} listener The listener function
     * @returns {this}
     */
  }, {
    key: "removeListener",
    value: function removeListener(event, listener) {
      if (event === 'change') {
        _classPrivateFieldGet(_listeners, this).delete(listener);
      }
      _superPropGet(VFSStatWatcher, "removeListener", this, 3)([event, listener]);
      return this;
    }

    /**
     * Removes all listeners for an event.
     * Overrides EventEmitter to also clear internal #listeners tracking.
     * @param {string} eventName The event name
     * @returns {this}
     */
  }, {
    key: "removeAllListeners",
    value: function removeAllListeners(eventName) {
      if (eventName === 'change') {
        _classPrivateFieldGet(_listeners, this).clear();
      }
      _superPropGet(VFSStatWatcher, "removeAllListeners", this, 3)([eventName]);
      return this;
    }

    /**
     * Returns true if there are no listeners.
     * @returns {boolean}
     */
  }, {
    key: "hasNoListeners",
    value: function hasNoListeners() {
      return _classPrivateFieldGet(_listeners, this).size === 0;
    }

    /**
     * Stops the watcher.
     */
  }, {
    key: "stop",
    value: function stop() {
      if (_classPrivateFieldGet(_closed2, this)) return;
      _classPrivateFieldSet(_closed2, this, true);
      if (_classPrivateFieldGet(_timer2, this)) {
        clearInterval(_classPrivateFieldGet(_timer2, this));
        _classPrivateFieldSet(_timer2, this, null);
      }
      this.emit('stop');
    }

    /**
     * Makes the timer not keep the process alive.
     * @returns {this}
     */
  }, {
    key: "unref",
    value: function unref() {
      _classPrivateFieldGet(_timer2, this)?.unref?.();
      return this;
    }

    /**
     * Makes the timer keep the process alive.
     * @returns {this}
     */
  }, {
    key: "ref",
    value: function ref() {
      _classPrivateFieldGet(_timer2, this)?.ref?.();
      return this;
    }
  }]);
}(EventEmitter);
/**
 * VFSWatchAsyncIterable - Async iterable wrapper for VFSWatcher.
 * Compatible with fs.promises.watch() return value interface.
 */
function _getStats2() {
  try {
    return _classPrivateFieldGet(_vfs2, this).statSync(_classPrivateFieldGet(_path2, this), {
      bigint: _classPrivateFieldGet(_bigint, this)
    });
  } catch {
    // Return a zeroed stats object for non-existent files
    // This matches Node.js behavior
    return _assertClassBrand(_VFSStatWatcher_brand, this, _createZeroStats).call(this);
  }
}
/**
 * Creates a zeroed stats object for non-existent files.
 * @returns {object} Zeroed stats
 */
function _createZeroStats() {
  var {
    createZeroStats
  } = require('internal/vfs/stats');
  return createZeroStats({
    bigint: _classPrivateFieldGet(_bigint, this)
  });
}
/**
 * Starts the polling timer.
 */
function _startPolling2() {
  if (_classPrivateFieldGet(_closed2, this)) return;
  _classPrivateFieldSet(_timer2, this, setInterval(() => _assertClassBrand(_VFSStatWatcher_brand, this, _poll2).call(this), _classPrivateFieldGet(_interval2, this)));

  // If not persistent, unref the timer to allow process to exit
  if (!_classPrivateFieldGet(_persistent2, this) && _classPrivateFieldGet(_timer2, this).unref) {
    _classPrivateFieldGet(_timer2, this).unref();
  }
}
/**
 * Polls for changes.
 */
function _poll2() {
  if (_classPrivateFieldGet(_closed2, this)) return;
  var newStats = _assertClassBrand(_VFSStatWatcher_brand, this, _getStats2).call(this);
  if (_assertClassBrand(_VFSStatWatcher_brand, this, _statsChanged2).call(this, _classPrivateFieldGet(_lastStats2, this), newStats)) {
    var prevStats = _classPrivateFieldGet(_lastStats2, this);
    _classPrivateFieldSet(_lastStats2, this, newStats);
    this.emit('change', newStats, prevStats);
  }
}
/**
 * Checks if stats have changed.
 * @param {Stats} oldStats Previous stats
 * @param {Stats} newStats Current stats
 * @returns {boolean} True if stats changed
 */
function _statsChanged2(oldStats, newStats) {
  // Compare mtime and ctime
  if (oldStats.mtimeMs !== newStats.mtimeMs) {
    return true;
  }
  if (oldStats.ctimeMs !== newStats.ctimeMs) {
    return true;
  }
  if (oldStats.size !== newStats.size) {
    return true;
  }
  return false;
}
var kMaxPendingEvents = 1024;
var _watcher = /*#__PURE__*/new WeakMap();
var _closed3 = /*#__PURE__*/new WeakMap();
var _pendingEvents = /*#__PURE__*/new WeakMap();
var _pendingResolvers = /*#__PURE__*/new WeakMap();
var VFSWatchAsyncIterable = /*#__PURE__*/function () {
  /**
   * @param {VirtualProvider} provider The VFS provider
   * @param {string} path The path to watch (provider-relative)
   * @param {object} [options] Options
   */
  function VFSWatchAsyncIterable(provider, path) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, VFSWatchAsyncIterable);
    _classPrivateFieldInitSpec(this, _watcher, void 0);
    _classPrivateFieldInitSpec(this, _closed3, false);
    _classPrivateFieldInitSpec(this, _pendingEvents, []);
    _classPrivateFieldInitSpec(this, _pendingResolvers, []);
    // Strip signal from options passed to VFSWatcher - we handle abort
    // at the iterable level to reject pending next() with AbortError
    // instead of resolving with done:true via the 'close' event.
    var signal = options.signal;
    var watcherOptions = ObjectAssign({
      __proto__: null
    }, options);
    delete watcherOptions.signal;
    _classPrivateFieldSet(_watcher, this, new VFSWatcher(provider, path, watcherOptions));
    _classPrivateFieldGet(_watcher, this).on('change', (eventType, filename) => {
      var event = {
        eventType,
        filename
      };
      if (_classPrivateFieldGet(_pendingResolvers, this).length > 0) {
        var {
          resolve
        } = _classPrivateFieldGet(_pendingResolvers, this).shift();
        resolve({
          done: false,
          value: event
        });
      } else if (_classPrivateFieldGet(_pendingEvents, this).length < kMaxPendingEvents) {
        ArrayPrototypePush(_classPrivateFieldGet(_pendingEvents, this), event);
      }
      // Drop events when queue is full to prevent unbounded memory growth
    });
    _classPrivateFieldGet(_watcher, this).on('close', () => {
      _classPrivateFieldSet(_closed3, this, true);
      // Resolve any pending iterators
      while (_classPrivateFieldGet(_pendingResolvers, this).length > 0) {
        var {
          resolve
        } = _classPrivateFieldGet(_pendingResolvers, this).shift();
        resolve({
          done: true,
          value: undefined
        });
      }
    });

    // Handle abort signal - reject pending next() with AbortError
    if (signal) {
      var onAbort = () => {
        _classPrivateFieldSet(_closed3, this, true);
        var err = new AbortError(undefined, {
          cause: signal.reason
        });
        while (_classPrivateFieldGet(_pendingResolvers, this).length > 0) {
          var {
            reject
          } = _classPrivateFieldGet(_pendingResolvers, this).shift();
          reject(err);
        }
        _classPrivateFieldGet(_watcher, this).close();
      };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort, {
          once: true
        });
      }
    }
  }

  /**
   * Returns the async iterator.
   * @returns {AsyncIterator}
   */
  return _createClass(VFSWatchAsyncIterable, [{
    key: SymbolAsyncIterator,
    value: function () {
      return this;
    }

    /**
     * Gets the next event.
     * @returns {Promise<IteratorResult>}
     */
  }, {
    key: "next",
    value: function next() {
      if (_classPrivateFieldGet(_closed3, this)) {
        return PromiseResolve({
          done: true,
          value: undefined
        });
      }
      if (_classPrivateFieldGet(_pendingEvents, this).length > 0) {
        var event = _classPrivateFieldGet(_pendingEvents, this).shift();
        return PromiseResolve({
          done: false,
          value: event
        });
      }
      return new Promise((resolve, reject) => {
        ArrayPrototypePush(_classPrivateFieldGet(_pendingResolvers, this), {
          resolve,
          reject
        });
      });
    }

    /**
     * Closes the iterator and underlying watcher.
     * @returns {Promise<IteratorResult>}
     */
  }, {
    key: "return",
    value: function _return() {
      _classPrivateFieldGet(_watcher, this).close();
      return PromiseResolve({
        done: true,
        value: undefined
      });
    }

    /**
     * Handles iterator throw.
     * @param {Error} error The error to throw
     * @returns {Promise<IteratorResult>}
     */
  }, {
    key: "throw",
    value: function _throw(error) {
      _classPrivateFieldGet(_watcher, this).close();
      return PromiseResolve({
        done: true,
        value: undefined
      });
    }
  }]);
}();
module.exports = {
  VFSWatcher,
  VFSStatWatcher,
  VFSWatchAsyncIterable
};

