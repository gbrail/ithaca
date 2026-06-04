'use strict';

var {
  SymbolDispose
} = primordials;
var {
  validateAbortSignal,
  validateFunction
} = require('internal/validators');
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = require('internal/errors');
var queueMicrotask;
var kResistStopPropagation;

/**
 * @param {AbortSignal} signal
 * @param {EventListener} listener
 * @returns {Disposable}
 */
function addAbortListener(signal, listener) {
  if (signal === undefined) {
    throw new ERR_INVALID_ARG_TYPE('signal', 'AbortSignal', signal);
  }
  validateAbortSignal(signal, 'signal');
  validateFunction(listener, 'listener');
  var removeEventListener;
  if (signal.aborted) {
    queueMicrotask ??= require('internal/process/task_queues').queueMicrotask;
    queueMicrotask(() => listener());
  } else {
    kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
    // TODO(atlowChemi) add { subscription: true } and return directly
    signal.addEventListener('abort', listener, {
      __proto__: null,
      once: true,
      [kResistStopPropagation]: true
    });
    removeEventListener = () => {
      signal.removeEventListener('abort', listener);
    };
  }
  return {
    __proto__: null,
    [SymbolDispose]() {
      removeEventListener?.();
    }
  };
}
module.exports = {
  __proto__: null,
  addAbortListener
};

