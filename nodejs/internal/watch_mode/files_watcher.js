'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
  ArrayIsArray,
  ArrayPrototypeForEach,
  Boolean: _Boolean,
  SafeMap,
  SafeSet,
  SafeWeakMap,
  StringPrototypeEndsWith,
  StringPrototypeStartsWith
} = primordials;
var {
  validateNumber,
  validateOneOf
} = require('internal/validators');
var {
  kEmptyObject
} = require('internal/util');
var {
  TIMEOUT_MAX
} = require('internal/timers');
var EventEmitter = require('events');
var {
  addAbortListener
} = require('internal/events/abort_listener');
var {
  watch
} = require('fs');
var {
  fileURLToPath
} = require('internal/url');
var {
  resolve,
  dirname,
  sep
} = require('path');
var {
  setTimeout,
  clearTimeout
} = require('timers');
var supportsRecursiveWatching = process.platform === 'win32' || process.platform === 'darwin';
var isParentPath = (parentCandidate, childCandidate) => {
  var parent = resolve(parentCandidate);
  var child = resolve(childCandidate);
  var normalizedParent = StringPrototypeEndsWith(parent, sep) ? parent : parent + sep;
  return StringPrototypeStartsWith(child, normalizedParent);
};
var _watchers = /*#__PURE__*/new WeakMap();
var _filteredFiles = /*#__PURE__*/new WeakMap();
var _dependencyOwners = /*#__PURE__*/new WeakMap();
var _ownerDependencies = /*#__PURE__*/new WeakMap();
var _debounceOwners = /*#__PURE__*/new WeakMap();
var _debounceTimer = /*#__PURE__*/new WeakMap();
var _debounce = /*#__PURE__*/new WeakMap();
var _mode = /*#__PURE__*/new WeakMap();
var _signal = /*#__PURE__*/new WeakMap();
var _passthroughIPC = /*#__PURE__*/new WeakMap();
var _ipcHandlers = /*#__PURE__*/new WeakMap();
var _FilesWatcher_brand = /*#__PURE__*/new WeakSet();
var FilesWatcher = /*#__PURE__*/function (_EventEmitter) {
  function FilesWatcher() {
    var _this;
    var {
      debounce = 200,
      mode = 'filter',
      signal
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
    _classCallCheck(this, FilesWatcher);
    _this = _callSuper(this, FilesWatcher, [{
      __proto__: null,
      captureRejections: true
    }]);
    _classPrivateMethodInitSpec(_this, _FilesWatcher_brand);
    _classPrivateFieldInitSpec(_this, _watchers, new SafeMap());
    _classPrivateFieldInitSpec(_this, _filteredFiles, new SafeSet());
    _classPrivateFieldInitSpec(_this, _dependencyOwners, new SafeMap());
    _classPrivateFieldInitSpec(_this, _ownerDependencies, new SafeMap());
    _classPrivateFieldInitSpec(_this, _debounceOwners, new SafeSet());
    _classPrivateFieldInitSpec(_this, _debounceTimer, void 0);
    _classPrivateFieldInitSpec(_this, _debounce, void 0);
    _classPrivateFieldInitSpec(_this, _mode, void 0);
    _classPrivateFieldInitSpec(_this, _signal, void 0);
    _classPrivateFieldInitSpec(_this, _passthroughIPC, false);
    _classPrivateFieldInitSpec(_this, _ipcHandlers, new SafeWeakMap());
    validateNumber(debounce, 'options.debounce', 0, TIMEOUT_MAX);
    validateOneOf(mode, 'options.mode', ['filter', 'all']);
    _classPrivateFieldSet(_debounce, _this, debounce);
    _classPrivateFieldSet(_mode, _this, mode);
    _classPrivateFieldSet(_signal, _this, signal);
    _classPrivateFieldSet(_passthroughIPC, _this, _Boolean(process.send));
    if (signal) {
      addAbortListener(signal, () => _this.clear());
    }
    return _this;
  }
  _inherits(FilesWatcher, _EventEmitter);
  return _createClass(FilesWatcher, [{
    key: "watchedPaths",
    get: function () {
      return _toConsumableArray(_classPrivateFieldGet(_watchers, this).keys());
    }
  }, {
    key: "watchPath",
    value: function watchPath(path) {
      var recursive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
      if (_assertClassBrand(_FilesWatcher_brand, this, _isPathWatched).call(this, path)) {
        return;
      }
      var {
        allowMissing = false
      } = options;
      var watcher = watch(path, {
        recursive,
        signal: _classPrivateFieldGet(_signal, this),
        throwIfNoEntry: !allowMissing
      });
      watcher.on('change', (eventType, fileName) => {
        // `fileName` can be `null` if it cannot be determined. See
        // https://github.com/nodejs/node/pull/49891#issuecomment-1744673430.
        _assertClassBrand(_FilesWatcher_brand, this, _onChange).call(this, recursive ? resolve(path, fileName ?? '') : path, eventType);
      });
      _classPrivateFieldGet(_watchers, this).set(path, {
        handle: watcher,
        recursive
      });
      if (recursive) {
        _assertClassBrand(_FilesWatcher_brand, this, _removeWatchedChildren).call(this, path);
      }
    }
  }, {
    key: "filterFile",
    value: function filterFile(file, owner) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
      if (!file) return;
      if (supportsRecursiveWatching) {
        this.watchPath(dirname(file), true, options);
      } else {
        // Having multiple FSWatcher's seems to be slower
        // than a single recursive FSWatcher
        this.watchPath(file, false, options);
      }
      _classPrivateFieldGet(_filteredFiles, this).add(file);
      if (owner) {
        var owners = _classPrivateFieldGet(_dependencyOwners, this).get(file) ?? new SafeSet();
        var dependencies = _classPrivateFieldGet(_ownerDependencies, this).get(file) ?? new SafeSet();
        owners.add(owner);
        dependencies.add(file);
        _classPrivateFieldGet(_dependencyOwners, this).set(file, owners);
        _classPrivateFieldGet(_ownerDependencies, this).set(owner, dependencies);
      }
    }
  }, {
    key: "destroyIPC",
    value: function destroyIPC(child) {
      var handlers = _classPrivateFieldGet(_ipcHandlers, this).get(child);
      if (_classPrivateFieldGet(_passthroughIPC, this) && handlers !== undefined) {
        process.off('message', handlers.parentToChild);
        child.off('message', handlers.childToParent);
      }
    }
  }, {
    key: "watchChildProcessModules",
    value: function watchChildProcessModules(child) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (_classPrivateFieldGet(_passthroughIPC, this)) {
        _assertClassBrand(_FilesWatcher_brand, this, _setupIPC).call(this, child);
      }
      child.on('message', message => {
        try {
          if (ArrayIsArray(message['watch:require'])) {
            ArrayPrototypeForEach(message['watch:require'], file => this.filterFile(file, key));
          }
          if (ArrayIsArray(message['watch:import'])) {
            ArrayPrototypeForEach(message['watch:import'], file => this.filterFile(fileURLToPath(file), key));
          }
        } catch {
          // Failed watching file. ignore
        }
      });
    }
  }, {
    key: "unfilterFilesOwnedBy",
    value: function unfilterFilesOwnedBy(owners) {
      owners.forEach(owner => {
        _classPrivateFieldGet(_ownerDependencies, this).get(owner)?.forEach(dependency => {
          _classPrivateFieldGet(_filteredFiles, this).delete(dependency);
          _classPrivateFieldGet(_dependencyOwners, this).get(dependency)?.delete(owner);
          if (_classPrivateFieldGet(_dependencyOwners, this).get(dependency)?.size === 0) {
            _classPrivateFieldGet(_dependencyOwners, this).delete(dependency);
          }
        });
        _classPrivateFieldGet(_filteredFiles, this).delete(owner);
        _classPrivateFieldGet(_dependencyOwners, this).delete(owner);
        _classPrivateFieldGet(_ownerDependencies, this).delete(owner);
      });
    }
  }, {
    key: "clearFileFilters",
    value: function clearFileFilters() {
      _classPrivateFieldGet(_filteredFiles, this).clear();
    }
  }, {
    key: "clear",
    value: function clear() {
      _classPrivateFieldGet(_watchers, this).forEach(_assertClassBrand(_FilesWatcher_brand, this, _unwatch));
      _classPrivateFieldGet(_watchers, this).clear();
      _classPrivateFieldGet(_filteredFiles, this).clear();
      _classPrivateFieldGet(_dependencyOwners, this).clear();
      _classPrivateFieldGet(_ownerDependencies, this).clear();
    }
  }]);
}(EventEmitter);
function _isPathWatched(path) {
  if (_classPrivateFieldGet(_watchers, this).has(path)) {
    return true;
  }
  for (var {
    0: watchedPath,
    1: watcher
  } of _classPrivateFieldGet(_watchers, this).entries()) {
    if (watcher.recursive && isParentPath(watchedPath, path)) {
      return true;
    }
  }
  return false;
}
function _removeWatchedChildren(path) {
  for (var {
    0: watchedPath,
    1: watcher
  } of _classPrivateFieldGet(_watchers, this).entries()) {
    if (path !== watchedPath && isParentPath(path, watchedPath)) {
      _assertClassBrand(_FilesWatcher_brand, this, _unwatch).call(this, watcher);
      _classPrivateFieldGet(_watchers, this).delete(watchedPath);
    }
  }
}
function _unwatch(watcher) {
  watcher.handle.removeAllListeners();
  watcher.handle.close();
}
function _onChange(trigger, eventType) {
  if (_classPrivateFieldGet(_mode, this) === 'filter' && !_classPrivateFieldGet(_filteredFiles, this).has(trigger)) {
    return;
  }
  var owners = _classPrivateFieldGet(_dependencyOwners, this).get(trigger);
  if (owners) {
    for (var owner of owners) {
      _classPrivateFieldGet(_debounceOwners, this).add(owner);
    }
  }
  clearTimeout(_classPrivateFieldGet(_debounceTimer, this));
  _classPrivateFieldSet(_debounceTimer, this, setTimeout(() => {
    _classPrivateFieldSet(_debounceTimer, this, null);
    this.emit('changed', {
      owners: _classPrivateFieldGet(_debounceOwners, this),
      eventType
    });
    _classPrivateFieldGet(_debounceOwners, this).clear();
  }, _classPrivateFieldGet(_debounce, this)).unref());
}
function _setupIPC(child) {
  var handlers = {
    __proto__: null,
    parentToChild: message => child.send(message),
    childToParent: message => process.send(message)
  };
  _classPrivateFieldGet(_ipcHandlers, this).set(child, handlers);
  process.on('message', handlers.parentToChild);
  child.on('message', handlers.childToParent);
}
module.exports = {
  FilesWatcher
};

