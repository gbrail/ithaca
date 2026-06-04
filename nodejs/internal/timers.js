'use strict';

// HOW and WHY the timers implementation works the way it does.
//
// Timers are crucial to Node.js. Internally, any TCP I/O connection creates a
// timer so that we can time out of connections. Additionally, many user
// libraries and applications also use timers. As such there may be a
// significantly large amount of timeouts scheduled at any given time.
// Therefore, it is very important that the timers implementation is performant
// and efficient.
//
// Note: It is suggested you first read through the lib/internal/linkedlist.js
// linked list implementation, since timers depend on it extensively. It can be
// somewhat counter-intuitive at first, as it is not actually a class. Instead,
// it is a set of helpers that operate on an existing object.
//
// In order to be as performant as possible, the architecture and data
// structures are designed so that they are optimized to handle the following
// use cases as efficiently as possible:

// - Adding a new timer. (insert)
// - Removing an existing timer. (remove)
// - Handling a timer timing out. (timeout)
//
// Whenever possible, the implementation tries to make the complexity of these
// operations as close to constant-time as possible.
// (So that performance is not impacted by the number of scheduled timers.)
//
// Object maps are kept which contain linked lists keyed by their duration in
// milliseconds.
//
/* eslint-disable node-core/non-ascii-character */
//
// ╔════ > Object Map
// ║
// ╠══
// ║ lists: { '40': { }, '320': { etc } } (keys of millisecond duration)
// ╚══          ┌────┘
//              │
// ╔══          │
// ║ TimersList { _idleNext: { }, _idlePrev: (self) }
// ║         ┌────────────────┘
// ║    ╔══  │                              ^
// ║    ║    { _idleNext: { },  _idlePrev: { }, _onTimeout: (callback) }
// ║    ║      ┌───────────┘
// ║    ║      │                                  ^
// ║    ║      { _idleNext: { etc },  _idlePrev: { }, _onTimeout: (callback) }
// ╠══  ╠══
// ║    ║
// ║    ╚════ >  Actual JavaScript timeouts
// ║
// ╚════ > Linked List
//
/* eslint-enable node-core/non-ascii-character */
//
// With this, virtually constant-time insertion (append), removal, and timeout
// is possible in the JavaScript layer. Any one list of timers is able to be
// sorted by just appending to it because all timers within share the same
// duration. Therefore, any timer added later will always have been scheduled to
// timeout later, thus only needing to be appended.
// Removal from an object-property linked list is also virtually constant-time
// as can be seen in the lib/internal/linkedlist.js implementation.
// Timeouts only need to process any timers currently due to expire, which will
// always be at the beginning of the list for reasons stated above. Any timers
// after the first one encountered that does not yet need to timeout will also
// always be due to timeout at a later time.
//
// Less-than constant time operations are thus contained in two places:
// The PriorityQueue — an efficient binary heap implementation that does all
// operations in worst-case O(log n) time — which manages the order of expiring
// Timeout lists and the object map lookup of a specific list by the duration of
// timers within (or creation of a new list). However, these operations combined
// have shown to be trivial in comparison to other timers architectures.
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  MathMax,
  MathTrunc,
  NumberIsFinite,
  NumberIsNaN,
  NumberMIN_SAFE_INTEGER,
  ReflectApply,
  Symbol: _Symbol
} = primordials;
var binding = internalBinding('timers');
var {
  immediateInfo,
  timeoutInfo
} = binding;
var {
  getDefaultTriggerAsyncId,
  newAsyncId,
  initHooksExist,
  // The needed emit*() functions.
  emitInit,
  emitBefore,
  emitAfter,
  emitDestroy
} = require('internal/async_hooks');

// Symbols for storing async id state.
var async_id_symbol = _Symbol('asyncId');
var trigger_async_id_symbol = _Symbol('triggerId');
var kHasPrimitive = _Symbol('kHasPrimitive');
var {
  ERR_OUT_OF_RANGE
} = require('internal/errors').codes;
var {
  validateFunction,
  validateNumber
} = require('internal/validators');
var L = require('internal/linkedlist');
var PriorityQueue = require('internal/priority_queue');
var {
  inspect
} = require('internal/util/inspect');
var debug = require('internal/util/debuglog').debuglog('timer', fn => {
  debug = fn;
});
var AsyncContextFrame = require('internal/async_context_frame');
var async_context_frame = _Symbol('kAsyncContextFrame');

// *Must* match Environment::ImmediateInfo::Fields in src/env.h.
var kCount = 0;
var kRefCount = 1;
var kHasOutstanding = 2;

// Timeout values > TIMEOUT_MAX are set to 1.
var TIMEOUT_MAX = 2 ** 31 - 1;
var timerListId = NumberMIN_SAFE_INTEGER;
var kRefed = _Symbol('refed');
var nextExpiry = Infinity;
// timeoutInfo is an Int32Array that contains the reference count of Timeout
// objects at index 0. This is a TypedArray so that GetActiveResourcesInfo() in
// `src/node_process_methods.cc` is able to access this value without crossing
// the JS-C++ boundary, which is slow at the time of writing.
timeoutInfo[0] = 0;

// This is a priority queue with a custom sorting function that first compares
// the expiry times of two lists and if they're the same then compares their
// individual IDs to determine which list was created first.
var timerListQueue = new PriorityQueue(compareTimersLists, setPosition);

// Object map containing linked lists of timers, keyed and sorted by their
// duration in milliseconds.
//
// - key = time in milliseconds
// - value = linked list
var timerListMap = {
  __proto__: null
};

// This stores all the known timer async ids to allow users to clearTimeout and
// clearInterval using those ids, to match the spec and the rest of the web
// platform.
var knownTimersById = {
  __proto__: null
};
function initAsyncResource(resource, type) {
  var asyncId = resource[async_id_symbol] = newAsyncId();
  var triggerAsyncId = resource[trigger_async_id_symbol] = getDefaultTriggerAsyncId();
  resource[async_context_frame] = AsyncContextFrame.current();
  if (initHooksExist()) emitInit(asyncId, type, triggerAsyncId, resource);
}
var warnedNegativeNumber = false;
var warnedNotNumber = false;
var Timeout = /*#__PURE__*/function (_inspect$custom) {
  // Timer constructor function.
  // The entire prototype is defined in lib/timers.js
  function Timeout(callback, after, args, isRepeat, isRefed) {
    _classCallCheck(this, Timeout);
    if (after === undefined) {
      after = 1;
    } else {
      after *= 1; // Coalesce to number or NaN
    }
    if (!(after >= 1 && after <= TIMEOUT_MAX)) {
      if (after > TIMEOUT_MAX) {
        process.emitWarning(`${after} does not fit into` + ' a 32-bit signed integer.' + '\nTimeout duration was set to 1.', 'TimeoutOverflowWarning');
      } else if (after < 0 && !warnedNegativeNumber) {
        warnedNegativeNumber = true;
        process.emitWarning(`${after} is a negative number.` + '\nTimeout duration was set to 1.', 'TimeoutNegativeWarning');
      } else if (NumberIsNaN(after) && !warnedNotNumber) {
        warnedNotNumber = true;
        process.emitWarning(`${after} is not a number.` + '\nTimeout duration was set to 1.', 'TimeoutNaNWarning');
      }
      after = 1; // Schedule on next tick, follows browser behavior
    }
    this._idleTimeout = after;
    this._idlePrev = this;
    this._idleNext = this;
    this._idleStart = null;
    this._onTimeout = callback;
    this._timerArgs = args;
    this._repeat = isRepeat ? after : null;
    this._destroyed = false;
    if (isRefed) incRefCount();
    this[kRefed] = isRefed;
    this[kHasPrimitive] = false;
    initAsyncResource(this, 'Timeout');
  }

  // Make sure the linked list only shows the minimal necessary information.
  return _createClass(Timeout, [{
    key: _inspect$custom,
    value: function (_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }, {
    key: "refresh",
    value: function refresh() {
      if (this[kRefed]) active(this);else unrefActive(this);
      return this;
    }
  }, {
    key: "unref",
    value: function unref() {
      if (this[kRefed]) {
        this[kRefed] = false;
        if (!this._destroyed) decRefCount();
      }
      return this;
    }
  }, {
    key: "ref",
    value: function ref() {
      if (!this[kRefed]) {
        this[kRefed] = true;
        if (!this._destroyed) incRefCount();
      }
      return this;
    }
  }, {
    key: "hasRef",
    value: function hasRef() {
      return this[kRefed];
    }
  }]);
}(inspect.custom);
var TimersList = /*#__PURE__*/function (_inspect$custom2) {
  function TimersList(expiry, msecs) {
    _classCallCheck(this, TimersList);
    this._idleNext = this; // Create the list with the linkedlist properties to
    this._idlePrev = this; // Prevent any unnecessary hidden class changes.
    this.expiry = expiry;
    this.id = timerListId++;
    this.msecs = msecs;
    this.priorityQueuePosition = null;
  }

  // Make sure the linked list only shows the minimal necessary information.
  return _createClass(TimersList, [{
    key: _inspect$custom2,
    value: function (_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);
}(inspect.custom); // A linked list for storing `setImmediate()` requests
var ImmediateList = /*#__PURE__*/function () {
  function ImmediateList() {
    _classCallCheck(this, ImmediateList);
    this.head = null;
    this.tail = null;
  }

  // Appends an item to the end of the linked list, adjusting the current tail's
  // next pointer and the item's previous pointer where applicable
  return _createClass(ImmediateList, [{
    key: "append",
    value: function append(item) {
      if (this.tail !== null) {
        this.tail._idleNext = item;
        item._idlePrev = this.tail;
      } else {
        this.head = item;
      }
      this.tail = item;
    }

    // Removes an item from the linked list, adjusting the pointers of adjacent
    // items and the linked list's head or tail pointers as necessary
  }, {
    key: "remove",
    value: function remove(item) {
      if (item._idleNext) {
        item._idleNext._idlePrev = item._idlePrev;
      }
      if (item._idlePrev) {
        item._idlePrev._idleNext = item._idleNext;
      }
      if (item === this.head) this.head = item._idleNext;
      if (item === this.tail) this.tail = item._idlePrev;
      item._idleNext = null;
      item._idlePrev = null;
    }
  }]);
}(); // Create a single linked list instance only once at startup
var immediateQueue = new ImmediateList();
function incRefCount() {
  if (timeoutInfo[0]++ === 0) {
    // We need to use the binding as the receiver for fast API calls.
    binding.toggleTimerRef(true);
  }
}
function decRefCount() {
  if (--timeoutInfo[0] === 0) {
    // We need to use the binding as the receiver for fast API calls.
    binding.toggleTimerRef(false);
  }
}

// Schedule or re-schedule a timer.
// The item must have been enroll()'d first.
function active(item) {
  insertGuarded(item, true);
}

// Internal APIs that need timeouts should use `unrefActive()` instead of
// `active()` so that they do not unnecessarily keep the process open.
function unrefActive(item) {
  insertGuarded(item, false);
}

// The underlying logic for scheduling or re-scheduling a timer.
//
// Appends a timer onto the end of an existing timers list, or creates a new
// list if one does not already exist for the specified timeout duration.
function insertGuarded(item, refed) {
  var msecs = item._idleTimeout;
  if (msecs < 0 || msecs === undefined) return;
  insert(item, msecs);
  var isDestroyed = item._destroyed;
  if (isDestroyed || !item[async_id_symbol]) {
    item._destroyed = false;
    initAsyncResource(item, 'Timeout');
  }
  if (isDestroyed) {
    if (refed) incRefCount();
  } else if (refed === !item[kRefed]) {
    if (refed) incRefCount();else decRefCount();
  }
  item[kRefed] = refed;
}

// We need to use the binding as the receiver for fast API calls.
function insert(item, msecs) {
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : binding.getLibuvNow();
  // Truncate so that accuracy of sub-millisecond timers is not assumed.
  msecs = MathTrunc(msecs);
  item._idleStart = start;

  // Use an existing list if there is one, otherwise we need to make a new one.
  var list = timerListMap[msecs];
  if (list === undefined) {
    debug('no %d list was found in insert, creating a new one', msecs);
    var expiry = start + msecs;
    timerListMap[msecs] = list = new TimersList(expiry, msecs);
    timerListQueue.insert(list);
    if (nextExpiry > expiry) {
      // We need to use the binding as the receiver for fast API calls.
      binding.scheduleTimer(msecs);
      nextExpiry = expiry;
    }
  }
  L.append(list, item);
}
function setUnrefTimeout(callback, after) {
  // Type checking identical to setTimeout()
  validateFunction(callback, 'callback');
  var timer = new Timeout(callback, after, undefined, false, false);
  insert(timer, timer._idleTimeout);
  return timer;
}

// Type checking used by timers.enroll() and Socket#setTimeout()
function getTimerDuration(msecs, name) {
  validateNumber(msecs, name);
  if (msecs < 0 || !NumberIsFinite(msecs)) {
    throw new ERR_OUT_OF_RANGE(name, 'a non-negative finite number', msecs);
  }

  // Ensure that msecs fits into signed int32
  if (msecs > TIMEOUT_MAX) {
    process.emitWarning(`${msecs} does not fit into a 32-bit signed integer.` + `\nTimer duration was truncated to ${TIMEOUT_MAX}.`, 'TimeoutOverflowWarning');
    return TIMEOUT_MAX;
  }
  return msecs;
}
function compareTimersLists(a, b) {
  var expiryDiff = a.expiry - b.expiry;
  if (expiryDiff === 0) {
    return a.id - b.id;
  }
  return expiryDiff;
}
function setPosition(node, pos) {
  node.priorityQueuePosition = pos;
}
function getTimerCallbacks(runNextTicks) {
  // If an uncaught exception was thrown during execution of immediateQueue,
  // this queue will store all remaining Immediates that need to run upon
  // resolution of all error handling (if process is still alive).
  var outstandingQueue = new ImmediateList();
  function processImmediate() {
    var queue = outstandingQueue.head !== null ? outstandingQueue : immediateQueue;
    var immediate = queue.head;

    // Clear the linked list early in case new `setImmediate()`
    // calls occur while immediate callbacks are executed
    if (queue !== outstandingQueue) {
      queue.head = queue.tail = null;
      immediateInfo[kHasOutstanding] = 1;
    }
    var prevImmediate;
    var ranAtLeastOneImmediate = false;
    while (immediate !== null) {
      if (ranAtLeastOneImmediate) runNextTicks();else ranAtLeastOneImmediate = true;

      // It's possible for this current Immediate to be cleared while executing
      // the next tick queue above, which means we need to use the previous
      // Immediate's _idleNext which is guaranteed to not have been cleared.
      if (immediate._destroyed) {
        outstandingQueue.head = immediate = prevImmediate._idleNext;
        continue;
      }

      // TODO(RaisinTen): Destroy and unref the Immediate after _onImmediate()
      // gets executed, just like how Timeouts work.
      immediate._destroyed = true;
      immediateInfo[kCount]--;
      if (immediate[kRefed]) immediateInfo[kRefCount]--;
      immediate[kRefed] = null;
      prevImmediate = immediate;
      var priorContextFrame = AsyncContextFrame.exchange(immediate[async_context_frame]);
      var asyncId = immediate[async_id_symbol];
      emitBefore(asyncId, immediate[trigger_async_id_symbol], immediate);
      try {
        var _immediate;
        var argv = immediate._argv;
        if (!argv) immediate._onImmediate();else (_immediate = immediate)._onImmediate.apply(_immediate, _toConsumableArray(argv));
      } finally {
        immediate._onImmediate = null;
        emitDestroy(asyncId);
        outstandingQueue.head = immediate = immediate._idleNext;
      }
      emitAfter(asyncId);
      AsyncContextFrame.set(priorContextFrame);
    }
    if (queue === outstandingQueue) outstandingQueue.head = null;
    immediateInfo[kHasOutstanding] = 0;
  }
  function processTimers(now) {
    debug('process timer lists %d', now);
    nextExpiry = Infinity;
    var list;
    var ranAtLeastOneList = false;
    while ((list = timerListQueue.peek()) != null) {
      if (list.expiry > now) {
        nextExpiry = list.expiry;
        return timeoutInfo[0] > 0 ? nextExpiry : -nextExpiry;
      }
      if (ranAtLeastOneList) runNextTicks();else ranAtLeastOneList = true;
      listOnTimeout(list, now);
    }
    return 0;
  }
  function listOnTimeout(list, now) {
    var msecs = list.msecs;
    debug('timeout callback %d', msecs);
    var ranAtLeastOneTimer = false;
    var timer;
    while ((timer = L.peek(list)) != null) {
      var diff = now - timer._idleStart;

      // Check if this loop iteration is too early for the next timer.
      // This happens if there are more timers scheduled for later in the list.
      if (diff < msecs) {
        list.expiry = MathMax(timer._idleStart + msecs, now + 1);
        list.id = timerListId++;
        timerListQueue.percolateDown(1);
        debug('%d list wait because diff is %d', msecs, diff);
        return;
      }
      if (ranAtLeastOneTimer) runNextTicks();else ranAtLeastOneTimer = true;

      // The actual logic for when a timeout happens.
      L.remove(timer);
      var asyncId = timer[async_id_symbol];
      if (!timer._onTimeout) {
        if (!timer._destroyed) {
          timer._destroyed = true;
          if (timer[kHasPrimitive]) delete knownTimersById[asyncId];
          if (timer[kRefed]) timeoutInfo[0]--;
          emitDestroy(asyncId);
        }
        continue;
      }
      var priorContextFrame = AsyncContextFrame.exchange(timer[async_context_frame]);
      emitBefore(asyncId, timer[trigger_async_id_symbol], timer);
      var start = void 0;
      if (timer._repeat) {
        // We need to use the binding as the receiver for fast API calls.
        start = binding.getLibuvNow();
      }
      try {
        var args = timer._timerArgs;
        if (args === undefined) timer._onTimeout();else ReflectApply(timer._onTimeout, timer, args);
      } finally {
        if (timer._repeat && timer._idleTimeout !== -1) {
          timer._idleTimeout = timer._repeat;
          insert(timer, timer._idleTimeout, start);
        } else if (!timer._idleNext && !timer._idlePrev && !timer._destroyed) {
          timer._destroyed = true;
          if (timer[kHasPrimitive]) delete knownTimersById[asyncId];
          if (timer[kRefed]) timeoutInfo[0]--;
          emitDestroy(asyncId);
        }
      }
      emitAfter(asyncId);
      AsyncContextFrame.set(priorContextFrame);
    }

    // If `L.peek(list)` returned nothing, the list was either empty or we have
    // called all of the timer timeouts.
    // As such, we can remove the list from the object map and
    // the PriorityQueue.
    debug('%d list empty', msecs);

    // The current list may have been removed and recreated since the reference
    // to `list` was created. Make sure they're the same instance of the list
    // before destroying.
    if (list === timerListMap[msecs]) {
      delete timerListMap[msecs];
      timerListQueue.shift();
    }
  }
  return {
    processImmediate,
    processTimers
  };
}
var Immediate = /*#__PURE__*/function () {
  function Immediate(callback, args) {
    _classCallCheck(this, Immediate);
    this._idleNext = null;
    this._idlePrev = null;
    this._onImmediate = callback;
    this._argv = args;
    this._destroyed = false;
    this[kRefed] = false;
    initAsyncResource(this, 'Immediate');
    this.ref();
    immediateInfo[kCount]++;
    immediateQueue.append(this);
  }
  return _createClass(Immediate, [{
    key: "ref",
    value: function ref() {
      if (this[kRefed] === false) {
        this[kRefed] = true;
        if (immediateInfo[kRefCount]++ === 0) {
          // We need to use the binding as the receiver for fast API calls.
          binding.toggleImmediateRef(true);
        }
      }
      return this;
    }
  }, {
    key: "unref",
    value: function unref() {
      if (this[kRefed] === true) {
        this[kRefed] = false;
        if (--immediateInfo[kRefCount] === 0) {
          // We need to use the binding as the receiver for fast API calls.
          binding.toggleImmediateRef(false);
        }
      }
      return this;
    }
  }, {
    key: "hasRef",
    value: function hasRef() {
      return !!this[kRefed];
    }
  }]);
}();
module.exports = {
  TIMEOUT_MAX,
  kTimeout: _Symbol('timeout'),
  // For hiding Timeouts on other internals.
  async_id_symbol,
  trigger_async_id_symbol,
  Timeout,
  Immediate,
  kRefed,
  kHasPrimitive,
  initAsyncResource,
  setUnrefTimeout,
  getTimerDuration,
  immediateQueue,
  getTimerCallbacks,
  immediateInfoFields: {
    kCount,
    kRefCount,
    kHasOutstanding
  },
  active,
  unrefActive,
  insert,
  timerListMap,
  timerListQueue,
  decRefCount,
  incRefCount,
  knownTimersById
};

