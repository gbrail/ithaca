'use strict';

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayFrom,
  ArrayIsArray,
  ArrayPrototypeFilter,
  ArrayPrototypeIncludes,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSort,
  Error,
  MathMax,
  MathMin,
  ObjectDefineProperties,
  ObjectFreeze,
  SafeArrayPrototypePushApply,
  SafeMap,
  SafeSet,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  constants: {
    NODE_PERFORMANCE_ENTRY_TYPE_GC,
    NODE_PERFORMANCE_ENTRY_TYPE_HTTP2,
    NODE_PERFORMANCE_ENTRY_TYPE_HTTP,
    NODE_PERFORMANCE_ENTRY_TYPE_NET,
    NODE_PERFORMANCE_ENTRY_TYPE_DNS,
    NODE_PERFORMANCE_ENTRY_TYPE_QUIC
  },
  installGarbageCollectionTracking,
  observerCounts,
  removeGarbageCollectionTracking,
  setupObservers
} = internalBinding('performance');
var {
  isPerformanceEntry,
  createPerformanceNodeEntry
} = require('internal/perf/performance_entry');
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
var {
  validateFunction,
  validateObject,
  validateThisInternalField
} = require('internal/validators');
var {
  customInspectSymbol: kInspect,
  lazyDOMException,
  kEmptyObject,
  kEnumerableProperty
} = require('internal/util');
var {
  setImmediate
} = require('timers');
var {
  inspect
} = require('util');
var {
  now
} = require('internal/perf/utils');
var kBuffer = _Symbol('kBuffer');
var kDispatch = _Symbol('kDispatch');
var kMaybeBuffer = _Symbol('kMaybeBuffer');
var kTypeSingle = 0;
var kTypeMultiple = 1;
var gcTrackingInstalled = false;
var kSupportedEntryTypes = ObjectFreeze(['dns', 'function', 'gc', 'http', 'http2', 'mark', 'measure', 'net', 'quic', 'resource']);

// Performance timeline entry Buffers
var markEntryBuffer = [];
var measureEntryBuffer = [];
var resourceTimingBuffer = [];
var resourceTimingSecondaryBuffer = [];
var kPerformanceEntryBufferWarnSize = 1e6;
// https://www.w3.org/TR/timing-entrytypes-registry/#registry
// Default buffer limit for resource timing entries.
var resourceTimingBufferSizeLimit = 250;
var dispatchBufferFull;
var resourceTimingBufferFullPending = false;
var kClearPerformanceEntryBuffers = ObjectFreeze({
  'mark': 'performance.clearMarks',
  'measure': 'performance.clearMeasures'
});
var kWarnedEntryTypes = new SafeMap();
var kObservers = new SafeSet();
var kPending = new SafeSet();
var isPending = false;
function queuePending() {
  if (isPending) return;
  isPending = true;
  setImmediate(() => {
    isPending = false;
    var pendings = ArrayFrom(kPending.values());
    kPending.clear();
    for (var pending of pendings) pending[kDispatch]();
  });
}
function getObserverType(type) {
  switch (type) {
    case 'gc':
      return NODE_PERFORMANCE_ENTRY_TYPE_GC;
    case 'http2':
      return NODE_PERFORMANCE_ENTRY_TYPE_HTTP2;
    case 'http':
      return NODE_PERFORMANCE_ENTRY_TYPE_HTTP;
    case 'net':
      return NODE_PERFORMANCE_ENTRY_TYPE_NET;
    case 'dns':
      return NODE_PERFORMANCE_ENTRY_TYPE_DNS;
    case 'quic':
      return NODE_PERFORMANCE_ENTRY_TYPE_QUIC;
  }
}
function maybeDecrementObserverCounts(entryTypes) {
  for (var type of entryTypes) {
    var observerType = getObserverType(type);
    if (observerType !== undefined) {
      observerCounts[observerType]--;
      if (observerType === NODE_PERFORMANCE_ENTRY_TYPE_GC && observerCounts[observerType] === 0) {
        removeGarbageCollectionTracking();
        gcTrackingInstalled = false;
      }
    }
  }
}
function maybeIncrementObserverCount(type) {
  var observerType = getObserverType(type);
  if (observerType !== undefined) {
    observerCounts[observerType]++;
    if (!gcTrackingInstalled && observerType === NODE_PERFORMANCE_ENTRY_TYPE_GC) {
      installGarbageCollectionTracking();
      gcTrackingInstalled = true;
    }
  }
}
var kSkipThrow = _Symbol('kSkipThrow');
var performanceObserverSorter = (first, second) => {
  return first.startTime - second.startTime;
};
var PerformanceObserverEntryList = /*#__PURE__*/function () {
  function PerformanceObserverEntryList() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var entries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    _classCallCheck(this, PerformanceObserverEntryList);
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    this[kBuffer] = ArrayPrototypeSort(entries, performanceObserverSorter);
  }
  return _createClass(PerformanceObserverEntryList, [{
    key: "getEntries",
    value: function getEntries() {
      validateThisInternalField(this, kBuffer, 'PerformanceObserverEntryList');
      return ArrayPrototypeSlice(this[kBuffer]);
    }
  }, {
    key: "getEntriesByType",
    value: function getEntriesByType(type) {
      validateThisInternalField(this, kBuffer, 'PerformanceObserverEntryList');
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('type');
      }
      type = `${type}`;
      return ArrayPrototypeFilter(this[kBuffer], entry => entry.entryType === type);
    }
  }, {
    key: "getEntriesByName",
    value: function getEntriesByName(name) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      validateThisInternalField(this, kBuffer, 'PerformanceObserverEntryList');
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('name');
      }
      name = `${name}`;
      if (type != null /** not nullish */) {
        return ArrayPrototypeFilter(this[kBuffer], entry => entry.name === name && entry.entryType === type);
      }
      return ArrayPrototypeFilter(this[kBuffer], entry => entry.name === name);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `PerformanceObserverEntryList ${inspect(this[kBuffer], opts)}`;
    }
  }]);
}();
ObjectDefineProperties(PerformanceObserverEntryList.prototype, {
  getEntries: kEnumerableProperty,
  getEntriesByType: kEnumerableProperty,
  getEntriesByName: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'PerformanceObserverEntryList'
  }
});
var _buffer = /*#__PURE__*/new WeakMap();
var _entryTypes = /*#__PURE__*/new WeakMap();
var _type = /*#__PURE__*/new WeakMap();
var _callback = /*#__PURE__*/new WeakMap();
var PerformanceObserver = /*#__PURE__*/function () {
  function PerformanceObserver(callback) {
    _classCallCheck(this, PerformanceObserver);
    _classPrivateFieldInitSpec(this, _buffer, []);
    _classPrivateFieldInitSpec(this, _entryTypes, new SafeSet());
    _classPrivateFieldInitSpec(this, _type, void 0);
    _classPrivateFieldInitSpec(this, _callback, void 0);
    validateFunction(callback, 'callback');
    _classPrivateFieldSet(_callback, this, callback);
  }
  return _createClass(PerformanceObserver, [{
    key: "observe",
    value: function observe() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
      validateObject(options, 'options');
      var {
        entryTypes,
        type,
        buffered
      } = _objectSpread({}, options);
      if (entryTypes === undefined && type === undefined) throw new ERR_MISSING_ARGS('options.entryTypes', 'options.type');
      if (entryTypes != null && type != null) throw new ERR_INVALID_ARG_VALUE('options.entryTypes', entryTypes, 'options.entryTypes can not set with ' + 'options.type together');
      switch (_classPrivateFieldGet(_type, this)) {
        case undefined:
          if (entryTypes !== undefined) _classPrivateFieldSet(_type, this, kTypeMultiple);
          if (type !== undefined) _classPrivateFieldSet(_type, this, kTypeSingle);
          break;
        case kTypeSingle:
          if (entryTypes !== undefined) throw lazyDOMException('PerformanceObserver can not change to multiple observations', 'InvalidModificationError');
          break;
        case kTypeMultiple:
          if (type !== undefined) throw lazyDOMException('PerformanceObserver can not change to single observation', 'InvalidModificationError');
          break;
      }
      if (_classPrivateFieldGet(_type, this) === kTypeMultiple) {
        if (!ArrayIsArray(entryTypes)) {
          throw new ERR_INVALID_ARG_TYPE('options.entryTypes', 'string[]', entryTypes);
        }
        maybeDecrementObserverCounts(_classPrivateFieldGet(_entryTypes, this));
        _classPrivateFieldGet(_entryTypes, this).clear();
        for (var n = 0; n < entryTypes.length; n++) {
          if (ArrayPrototypeIncludes(kSupportedEntryTypes, entryTypes[n])) {
            _classPrivateFieldGet(_entryTypes, this).add(entryTypes[n]);
            maybeIncrementObserverCount(entryTypes[n]);
          }
        }
      } else {
        if (!ArrayPrototypeIncludes(kSupportedEntryTypes, type)) return;
        _classPrivateFieldGet(_entryTypes, this).add(type);
        maybeIncrementObserverCount(type);
        if (buffered) {
          var entries = filterBufferMapByNameAndType(undefined, type);
          SafeArrayPrototypePushApply(_classPrivateFieldGet(_buffer, this), entries);
          kPending.add(this);
          if (kPending.size) queuePending();
        }
      }
      if (_classPrivateFieldGet(_entryTypes, this).size) kObservers.add(this);else this.disconnect();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      maybeDecrementObserverCounts(_classPrivateFieldGet(_entryTypes, this));
      kObservers.delete(this);
      kPending.delete(this);
      _classPrivateFieldSet(_buffer, this, []);
      _classPrivateFieldGet(_entryTypes, this).clear();
      _classPrivateFieldSet(_type, this, undefined);
    }
  }, {
    key: "takeRecords",
    value: function takeRecords() {
      var list = _classPrivateFieldGet(_buffer, this);
      _classPrivateFieldSet(_buffer, this, []);
      return list;
    }
  }, {
    key: kMaybeBuffer,
    value: function (entry) {
      if (!_classPrivateFieldGet(_entryTypes, this).has(entry.entryType)) return;
      ArrayPrototypePush(_classPrivateFieldGet(_buffer, this), entry);
      kPending.add(this);
      if (kPending.size) queuePending();
    }
  }, {
    key: kDispatch,
    value: function () {
      var entryList = new PerformanceObserverEntryList(kSkipThrow, this.takeRecords());
      _classPrivateFieldGet(_callback, this).call(this, entryList, this);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `PerformanceObserver ${inspect({
        connected: kObservers.has(this),
        pending: kPending.has(this),
        entryTypes: ArrayFrom(_classPrivateFieldGet(_entryTypes, this)),
        buffer: _classPrivateFieldGet(_buffer, this)
      }, opts)}`;
    }
  }], [{
    key: "supportedEntryTypes",
    get: function () {
      return kSupportedEntryTypes;
    }
  }]);
}();
ObjectDefineProperties(PerformanceObserver.prototype, {
  observe: kEnumerableProperty,
  disconnect: kEnumerableProperty,
  takeRecords: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'PerformanceObserver'
  }
});

/**
 * https://www.w3.org/TR/performance-timeline/#dfn-queue-a-performanceentry
 *
 * Add the performance entry to the interested performance observer's queue.
 */
function enqueue(entry) {
  if (!isPerformanceEntry(entry)) throw new ERR_INVALID_ARG_TYPE('entry', 'PerformanceEntry', entry);
  for (var obs of kObservers) {
    obs[kMaybeBuffer](entry);
  }
}

/**
 * Add the user timing entry to the global buffer.
 */
function bufferUserTiming(entry) {
  var entryType = entry.entryType;
  var buffer;
  if (entryType === 'mark') {
    buffer = markEntryBuffer;
  } else if (entryType === 'measure') {
    buffer = measureEntryBuffer;
  } else {
    return;
  }
  ArrayPrototypePush(buffer, entry);
  var count = buffer.length;
  if (count > kPerformanceEntryBufferWarnSize && !kWarnedEntryTypes.has(entryType)) {
    kWarnedEntryTypes.set(entryType, true);
    // No error code for this since it is a Warning
    // eslint-disable-next-line no-restricted-syntax
    var w = new Error('Possible perf_hooks memory leak detected. ' + `${count} ${entryType} entries added to the global ` + 'performance entry buffer. Use ' + `${kClearPerformanceEntryBuffers[entryType]} to ` + 'clear the buffer.');
    w.name = 'MaxPerformanceEntryBufferExceededWarning';
    w.entryType = entryType;
    w.count = count;
    process.emitWarning(w);
  }
}

/**
 * Add the resource timing entry to the global buffer if the buffer size is not
 * exceeding the buffer limit, or dispatch a buffer full event on the global
 * performance object.
 *
 * See also https://www.w3.org/TR/resource-timing-2/#dfn-add-a-performanceresourcetiming-entry
 */
function bufferResourceTiming(entry) {
  if (resourceTimingBuffer.length < resourceTimingBufferSizeLimit && !resourceTimingBufferFullPending) {
    ArrayPrototypePush(resourceTimingBuffer, entry);
    return;
  }
  if (!resourceTimingBufferFullPending) {
    resourceTimingBufferFullPending = true;
    setImmediate(() => {
      while (resourceTimingSecondaryBuffer.length > 0) {
        var excessNumberBefore = resourceTimingSecondaryBuffer.length;
        dispatchBufferFull('resourcetimingbufferfull');

        // Calculate the number of items to be pushed to the global buffer.
        var numbersToPreserve = MathMax(MathMin(resourceTimingBufferSizeLimit - resourceTimingBuffer.length, resourceTimingSecondaryBuffer.length), 0);
        var excessNumberAfter = resourceTimingSecondaryBuffer.length - numbersToPreserve;
        for (var idx = 0; idx < numbersToPreserve; idx++) {
          ArrayPrototypePush(resourceTimingBuffer, resourceTimingSecondaryBuffer[idx]);
        }
        if (excessNumberBefore <= excessNumberAfter) {
          resourceTimingSecondaryBuffer = [];
        }
      }
      resourceTimingBufferFullPending = false;
    });
  }
  ArrayPrototypePush(resourceTimingSecondaryBuffer, entry);
}

// https://w3c.github.io/resource-timing/#dom-performance-setresourcetimingbuffersize
function setResourceTimingBufferSize(maxSize) {
  // If the maxSize parameter is less than resource timing buffer current
  // size, no PerformanceResourceTiming objects are to be removed from the
  // performance entry buffer.
  resourceTimingBufferSizeLimit = maxSize;
}
function setDispatchBufferFull(fn) {
  dispatchBufferFull = fn;
}
function clearEntriesFromBuffer(type, name) {
  if (type !== 'mark' && type !== 'measure' && type !== 'resource') {
    return;
  }
  if (type === 'mark') {
    markEntryBuffer = name === undefined ? [] : ArrayPrototypeFilter(markEntryBuffer, entry => entry.name !== name);
  } else if (type === 'measure') {
    measureEntryBuffer = name === undefined ? [] : ArrayPrototypeFilter(measureEntryBuffer, entry => entry.name !== name);
  } else {
    resourceTimingBuffer = name === undefined ? [] : ArrayPrototypeFilter(resourceTimingBuffer, entry => entry.name !== name);
  }
}
function filterBufferMapByNameAndType(name, type) {
  var bufferList;
  if (type === 'mark') {
    bufferList = markEntryBuffer;
  } else if (type === 'measure') {
    bufferList = measureEntryBuffer;
  } else if (type === 'resource') {
    bufferList = resourceTimingBuffer;
  } else if (type !== undefined) {
    // Unrecognized type;
    return [];
  } else {
    bufferList = [];
    SafeArrayPrototypePushApply(bufferList, markEntryBuffer);
    SafeArrayPrototypePushApply(bufferList, measureEntryBuffer);
    SafeArrayPrototypePushApply(bufferList, resourceTimingBuffer);
  }
  if (name !== undefined) {
    bufferList = ArrayPrototypeFilter(bufferList, buffer => buffer.name === name);
  } else if (type !== undefined) {
    bufferList = ArrayPrototypeSlice(bufferList);
  }
  return ArrayPrototypeSort(bufferList, performanceObserverSorter);
}
function observerCallback(name, type, startTime, duration, details) {
  var entry = createPerformanceNodeEntry(name, type, startTime, duration, details);
  enqueue(entry);
}
setupObservers(observerCallback);
function hasObserver(type) {
  var observerType = getObserverType(type);
  return observerCounts[observerType] > 0;
}
function startPerf(target, key) {
  var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  target[key] = _objectSpread(_objectSpread({}, context), {}, {
    startTime: now()
  });
}
function stopPerf(target, key) {
  var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var ctx = target[key];
  if (!ctx) {
    return;
  }
  var startTime = ctx.startTime;
  var entry = createPerformanceNodeEntry(ctx.name, ctx.type, startTime, now() - startTime, _objectSpread(_objectSpread({}, ctx.detail), context.detail));
  enqueue(entry);
}
module.exports = {
  PerformanceObserver,
  PerformanceObserverEntryList,
  enqueue,
  hasObserver,
  clearEntriesFromBuffer,
  filterBufferMapByNameAndType,
  startPerf,
  stopPerf,
  bufferUserTiming,
  bufferResourceTiming,
  setResourceTimingBufferSize,
  setDispatchBufferFull
};

