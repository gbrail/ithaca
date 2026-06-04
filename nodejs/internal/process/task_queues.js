'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  Array: _Array,
  FunctionPrototypeBind,
  Symbol: _Symbol
} = primordials;
var {
  // For easy access to the nextTick state in the C++ land,
  // and to avoid unnecessary calls into JS land.
  tickInfo,
  // Used to run V8's micro task queue.
  runMicrotasks,
  setTickCallback,
  enqueueMicrotask
} = internalBinding('task_queue');
var {
  setHasRejectionToWarn,
  hasRejectionToWarn,
  listenForRejections,
  processPromiseRejections
} = require('internal/process/promises');
var {
  getDefaultTriggerAsyncId,
  enabledHooksExist,
  newAsyncId,
  initHooksExist,
  emitInit,
  emitBefore,
  emitAfter,
  emitDestroy,
  symbols: {
    async_id_symbol,
    trigger_async_id_symbol
  }
} = require('internal/async_hooks');
var FixedQueue = require('internal/fixed_queue');
var {
  validateFunction
} = require('internal/validators');
var {
  AsyncResource
} = require('async_hooks');
var AsyncContextFrame = require('internal/async_context_frame');
var async_context_frame = _Symbol('kAsyncContextFrame');

// *Must* match Environment::TickInfo::Fields in src/env.h.
var kHasTickScheduled = 0;
function hasTickScheduled() {
  return tickInfo[kHasTickScheduled] === 1;
}
function setHasTickScheduled(value) {
  tickInfo[kHasTickScheduled] = value ? 1 : 0;
}
var queue = new FixedQueue();

// Should be in sync with RunNextTicksNative in node_task_queue.cc
function runNextTicks() {
  if (!hasTickScheduled() && !hasRejectionToWarn()) runMicrotasks();
  if (!hasTickScheduled() && !hasRejectionToWarn()) return;
  processTicksAndRejections();
}
function processTicksAndRejections() {
  var tock;
  do {
    while ((tock = queue.shift()) !== null) {
      var priorContextFrame = AsyncContextFrame.exchange(tock[async_context_frame]);
      var asyncId = tock[async_id_symbol];
      emitBefore(asyncId, tock[trigger_async_id_symbol], tock);
      try {
        var callback = tock.callback;
        if (tock.args === undefined) {
          callback();
        } else {
          var args = tock.args;
          switch (args.length) {
            case 1:
              callback(args[0]);
              break;
            case 2:
              callback(args[0], args[1]);
              break;
            case 3:
              callback(args[0], args[1], args[2]);
              break;
            case 4:
              callback(args[0], args[1], args[2], args[3]);
              break;
            default:
              callback.apply(void 0, _toConsumableArray(args));
          }
        }
      } finally {
        emitDestroy(asyncId);
      }
      emitAfter(asyncId);
      AsyncContextFrame.set(priorContextFrame);
    }
    runMicrotasks();
  } while (!queue.isEmpty() || hasRejectionToWarn() && processPromiseRejections());
  setHasTickScheduled(false);
  setHasRejectionToWarn(false);
}

// `nextTick()` will not enqueue any callback when the process is about to
// exit since the callback would not have a chance to be executed.
function nextTick(callback) {
  validateFunction(callback, 'callback');
  if (process._exiting) return;
  var args;
  switch (arguments.length) {
    case 1:
      break;
    case 2:
      args = [arguments[1]];
      break;
    case 3:
      args = [arguments[1], arguments[2]];
      break;
    case 4:
      args = [arguments[1], arguments[2], arguments[3]];
      break;
    default:
      args = new _Array(arguments.length - 1);
      for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
  }
  if (queue.isEmpty()) setHasTickScheduled(true);
  var asyncId = newAsyncId();
  var triggerAsyncId = getDefaultTriggerAsyncId();
  var tickObject = {
    [async_id_symbol]: asyncId,
    [trigger_async_id_symbol]: triggerAsyncId,
    [async_context_frame]: AsyncContextFrame.current(),
    callback,
    args
  };
  if (initHooksExist()) emitInit(asyncId, 'TickObject', triggerAsyncId, tickObject);
  queue.push(tickObject);
}
function runMicrotask() {
  this.runInAsyncScope(() => {
    var callback = this.callback;
    try {
      callback();
    } finally {
      this.emitDestroy();
    }
  });
}
var defaultMicrotaskResourceOpts = {
  requireManualDestroy: true
};
function queueMicrotask(callback) {
  validateFunction(callback, 'callback');
  var contextFrame = AsyncContextFrame.current();
  if (contextFrame || enabledHooksExist()) {
    var asyncResource = new AsyncResource('Microtask', defaultMicrotaskResourceOpts);
    asyncResource.callback = callback;
    enqueueMicrotask(FunctionPrototypeBind(runMicrotask, asyncResource));
  } else {
    // Fast path: no AsyncLocalStorage in use
    enqueueMicrotask(callback);
  }
}
module.exports = {
  setupTaskQueue() {
    // Sets the per-isolate promise rejection callback
    listenForRejections();
    // Sets the callback to be run in every tick.
    setTickCallback(processTicksAndRejections);
    return {
      nextTick,
      runNextTicks
    };
  },
  queueMicrotask
};

