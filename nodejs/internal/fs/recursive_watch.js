'use strict';

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
  Promise,
  SafeMap,
  SafeSet,
  StringPrototypeStartsWith,
  SymbolAsyncIterator
} = primordials;
var {
  EventEmitter
} = require('events');
var assert = require('internal/assert');
var {
  AbortError,
  codes: {
    ERR_INVALID_ARG_VALUE
  }
} = require('internal/errors');
var {
  getValidatedPath
} = require('internal/fs/utils');
var {
  createIgnoreMatcher,
  kFSWatchStart,
  StatWatcher
} = require('internal/fs/watchers');
var {
  kEmptyObject
} = require('internal/util');
var {
  validateBoolean,
  validateAbortSignal,
  validateIgnoreOption
} = require('internal/validators');
var {
  basename: pathBasename,
  join: pathJoin,
  relative: pathRelative,
  resolve: pathResolve
} = require('path');
var internalSync;
function lazyLoadFsSync() {
  internalSync ??= require('fs');
  return internalSync;
}
var kResistStopPropagation;
var _options = /*#__PURE__*/new WeakMap();
var _closed = /*#__PURE__*/new WeakMap();
var _files = /*#__PURE__*/new WeakMap();
var _watchers = /*#__PURE__*/new WeakMap();
var _symbolicFiles = /*#__PURE__*/new WeakMap();
var _rootPath = /*#__PURE__*/new WeakMap();
var _watchingFile = /*#__PURE__*/new WeakMap();
var _ignoreMatcher = /*#__PURE__*/new WeakMap();
var _FSWatcher_brand = /*#__PURE__*/new WeakSet();
var FSWatcher = /*#__PURE__*/function (_EventEmitter) {
  function FSWatcher() {
    var _this;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
    _classCallCheck(this, FSWatcher);
    _this = _callSuper(this, FSWatcher);
    _classPrivateMethodInitSpec(_this, _FSWatcher_brand);
    _classPrivateFieldInitSpec(_this, _options, null);
    _classPrivateFieldInitSpec(_this, _closed, false);
    _classPrivateFieldInitSpec(_this, _files, new SafeMap());
    _classPrivateFieldInitSpec(_this, _watchers, new SafeMap());
    _classPrivateFieldInitSpec(_this, _symbolicFiles, new SafeSet());
    _classPrivateFieldInitSpec(_this, _rootPath, pathResolve());
    _classPrivateFieldInitSpec(_this, _watchingFile, false);
    _classPrivateFieldInitSpec(_this, _ignoreMatcher, null);
    assert(typeof options === 'object');
    var {
      persistent,
      recursive,
      signal,
      encoding,
      ignore
    } = options;
    var {
      throwIfNoEntry
    } = options;

    // TODO(anonrig): Add non-recursive support to non-native-watcher for IBMi & AIX support.
    if (recursive != null) {
      validateBoolean(recursive, 'options.recursive');
    }
    if (persistent != null) {
      validateBoolean(persistent, 'options.persistent');
    }
    if (signal != null) {
      validateAbortSignal(signal, 'options.signal');
    }
    if (throwIfNoEntry != null) {
      validateBoolean(throwIfNoEntry, 'options.throwIfNoEntry');
    } else {
      throwIfNoEntry = true;
    }
    if (encoding != null) {
      // This is required since on macOS and Windows it throws ERR_INVALID_ARG_VALUE
      if (typeof encoding !== 'string') {
        throw new ERR_INVALID_ARG_VALUE('options.encoding', encoding);
      }
    }
    validateIgnoreOption(ignore, 'options.ignore');
    _classPrivateFieldSet(_ignoreMatcher, _this, createIgnoreMatcher(ignore));
    _classPrivateFieldSet(_options, _this, {
      persistent,
      recursive,
      signal,
      encoding,
      throwIfNoEntry
    });
    return _this;
  }
  _inherits(FSWatcher, _EventEmitter);
  return _createClass(FSWatcher, [{
    key: "close",
    value: function close() {
      if (_classPrivateFieldGet(_closed, this)) {
        return;
      }
      _classPrivateFieldSet(_closed, this, true);
      for (var file of _classPrivateFieldGet(_files, this).keys()) {
        _classPrivateFieldGet(_watchers, this).get(file)?.close();
        _classPrivateFieldGet(_watchers, this).delete(file);
      }
      _classPrivateFieldGet(_files, this).clear();
      _classPrivateFieldGet(_symbolicFiles, this).clear();
      this.emit('close');
    }
  }, {
    key: kFSWatchStart,
    value: function (filename) {
      filename = pathResolve(getValidatedPath(filename));
      try {
        var file = lazyLoadFsSync().statSync(filename);
        _classPrivateFieldSet(_rootPath, this, filename);
        _classPrivateFieldSet(_closed, this, false);
        _classPrivateFieldSet(_watchingFile, this, file.isFile());
        _assertClassBrand(_FSWatcher_brand, this, _watchFile).call(this, filename);
        if (file.isDirectory()) {
          _assertClassBrand(_FSWatcher_brand, this, _watchFolder).call(this, filename);
        }
      } catch (error) {
        if (!_classPrivateFieldGet(_options, this).throwIfNoEntry && error.code === 'ENOENT') {
          error.filename = filename;
          throw error;
        }
      }
    }
  }, {
    key: "ref",
    value: function ref() {
      _classPrivateFieldGet(_files, this).forEach(file => {
        if (file instanceof StatWatcher) {
          file.ref();
        }
      });
    }
  }, {
    key: "unref",
    value: function unref() {
      _classPrivateFieldGet(_files, this).forEach(file => {
        if (file instanceof StatWatcher) {
          file.unref();
        }
      });
    }
  }, {
    key: SymbolAsyncIterator,
    value: function () {
      var {
        signal
      } = _classPrivateFieldGet(_options, this);
      var promiseExecutor = signal == null ? resolve => {
        this.once('change', (eventType, filename) => {
          resolve({
            __proto__: null,
            value: {
              eventType,
              filename
            }
          });
        });
      } : (resolve, reject) => {
        var onAbort = () => {
          this.close();
          reject(new AbortError(undefined, {
            cause: signal.reason
          }));
        };
        if (signal.aborted) return onAbort();
        kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
        signal.addEventListener('abort', onAbort, {
          __proto__: null,
          once: true,
          [kResistStopPropagation]: true
        });
        this.once('change', (eventType, filename) => {
          signal.removeEventListener('abort', onAbort);
          resolve({
            __proto__: null,
            value: {
              eventType,
              filename
            }
          });
        });
      };
      return {
        next: () => _classPrivateFieldGet(_closed, this) ? {
          __proto__: null,
          done: true
        } : new Promise(promiseExecutor),
        return: () => {
          this.close();
          return {
            __proto__: null,
            done: true
          };
        },
        [SymbolAsyncIterator]() {
          return this;
        }
      };
    }
  }]);
}(EventEmitter);
function _unwatchFiles(file) {
  _classPrivateFieldGet(_symbolicFiles, this).delete(file);
  for (var filename of _classPrivateFieldGet(_files, this).keys()) {
    if (StringPrototypeStartsWith(filename, file)) {
      _classPrivateFieldGet(_files, this).delete(filename);
      _classPrivateFieldGet(_watchers, this).get(filename)?.close();
      _classPrivateFieldGet(_watchers, this).delete(filename);
    }
  }
}
function _watchFolder(folder) {
  var {
    readdirSync
  } = lazyLoadFsSync();
  try {
    var files = readdirSync(folder, {
      withFileTypes: true
    });
    for (var file of files) {
      if (_classPrivateFieldGet(_closed, this)) {
        break;
      }
      var f = pathJoin(folder, file.name);
      var relativePath = pathRelative(_classPrivateFieldGet(_rootPath, this), f);

      // Skip watching ignored paths entirely to avoid kernel resource pressure
      if (_classPrivateFieldGet(_ignoreMatcher, this)?.call(this, relativePath)) {
        continue;
      }
      if (!_classPrivateFieldGet(_files, this).has(f)) {
        this.emit('change', 'rename', relativePath);
        if (file.isSymbolicLink()) {
          _classPrivateFieldGet(_symbolicFiles, this).add(f);
        }
        try {
          _assertClassBrand(_FSWatcher_brand, this, _watchFile).call(this, f);
          if (file.isDirectory() && !file.isSymbolicLink()) {
            _assertClassBrand(_FSWatcher_brand, this, _watchFolder).call(this, f);
          }
        } catch (err) {
          // Ignore ENOENT
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }
      }
    }
  } catch (error) {
    this.emit('error', error);
  }
}
function _watchFile(file) {
  if (_classPrivateFieldGet(_closed, this)) {
    return;
  }
  var {
    watch,
    statSync
  } = lazyLoadFsSync();
  if (_classPrivateFieldGet(_files, this).has(file)) {
    return;
  }
  {
    var existingStat = statSync(file);
    _classPrivateFieldGet(_files, this).set(file, existingStat);
  }
  var watcher = watch(file, {
    persistent: _classPrivateFieldGet(_options, this).persistent
  }, (eventType, filename) => {
    var existingStat = _classPrivateFieldGet(_files, this).get(file);
    var currentStats;
    try {
      currentStats = statSync(file);
      _classPrivateFieldGet(_files, this).set(file, currentStats);
    } catch {
      // This happens if the file was removed
    }
    if (currentStats === undefined || currentStats.birthtimeMs === 0 && existingStat.birthtimeMs !== 0) {
      // The file is now deleted
      _classPrivateFieldGet(_files, this).delete(file);
      _classPrivateFieldGet(_watchers, this).delete(file);
      watcher.close();
      this.emit('change', 'rename', pathRelative(_classPrivateFieldGet(_rootPath, this), file));
      _assertClassBrand(_FSWatcher_brand, this, _unwatchFiles).call(this, file);
    } else if (file === _classPrivateFieldGet(_rootPath, this) && _classPrivateFieldGet(_watchingFile, this)) {
      // This case will only be triggered when watching a file with fs.watch
      this.emit('change', 'change', pathBasename(file));
    } else if (_classPrivateFieldGet(_symbolicFiles, this).has(file)) {
      // Stats from watchFile does not return correct value for currentStats.isSymbolicLink()
      // Since it is only valid when using fs.lstat(). Therefore, check the existing symbolic files.
      this.emit('change', 'rename', pathRelative(_classPrivateFieldGet(_rootPath, this), file));
    } else if (currentStats.isDirectory()) {
      _assertClassBrand(_FSWatcher_brand, this, _watchFolder).call(this, file);
    } else {
      // Watching a directory will trigger a change event for child files)
      this.emit('change', 'change', pathRelative(_classPrivateFieldGet(_rootPath, this), file));
    }
  });
  _classPrivateFieldGet(_watchers, this).set(file, watcher);
}
module.exports = {
  FSWatcher,
  kFSWatchStart
};

