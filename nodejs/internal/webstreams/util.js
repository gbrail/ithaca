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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var nonOpWrite = function () {
  return _await();
};
var nonOpCancel = function () {
  return _await();
};
var nonOpPull = function () {
  return _await();
};
var nonOpFlush = function () {
  return _await();
};
var {
  ArrayBufferPrototypeGetByteLength,
  ArrayBufferPrototypeGetDetached,
  ArrayBufferPrototypeSlice,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  AsyncIteratorPrototype,
  MathMax,
  NumberIsNaN,
  PromisePrototypeThen,
  ReflectApply,
  ReflectGet,
  Symbol: _Symbol,
  Uint8Array
} = primordials;
var {
  codes: {
    ERR_INVALID_ARG_VALUE
  }
} = require('internal/errors');
var {
  copyArrayBuffer
} = internalBinding('buffer');
var {
  inspect
} = require('util');
var {
  constants: {
    kPending
  },
  getPromiseDetails
} = internalBinding('util');
var assert = require('internal/assert');
var {
  validateFunction
} = require('internal/validators');
var kState = _Symbol('kState');
var kType = _Symbol('kType');
var AsyncIterator = {
  __proto__: AsyncIteratorPrototype,
  next: undefined,
  return: undefined
};
var getNonWritablePropertyDescriptor = value => {
  return {
    __proto__: null,
    configurable: true,
    value
  };
};
function extractHighWaterMark(value, defaultHWM) {
  if (value === undefined) return defaultHWM;
  var coercedValue = +value;
  if (NumberIsNaN(coercedValue) || coercedValue < 0) throw new ERR_INVALID_ARG_VALUE.RangeError('strategy.highWaterMark', value);
  return coercedValue;
}
function extractSizeAlgorithm(size) {
  if (size === undefined) return () => 1;
  validateFunction(size, 'strategy.size');
  return size;
}
function customInspect(depth, options, name, data) {
  if (depth < 0) return this;
  var opts = _objectSpread(_objectSpread({}, options), {}, {
    depth: options.depth == null ? null : options.depth - 1
  });
  return `${name} ${inspect(data, opts)}`;
}

// These are defensive to work around the possibility that
// the buffer, byteLength, and byteOffset properties on
// ArrayBuffer and ArrayBufferView's may have been tampered with.

function ArrayBufferViewGetBuffer(view) {
  return ReflectGet(view.constructor.prototype, 'buffer', view);
}
function ArrayBufferViewGetByteLength(view) {
  return ReflectGet(view.constructor.prototype, 'byteLength', view);
}
function ArrayBufferViewGetByteOffset(view) {
  return ReflectGet(view.constructor.prototype, 'byteOffset', view);
}
function cloneAsUint8Array(view) {
  var buffer = ArrayBufferViewGetBuffer(view);
  var byteOffset = ArrayBufferViewGetByteOffset(view);
  var byteLength = ArrayBufferViewGetByteLength(view);
  return new Uint8Array(ArrayBufferPrototypeSlice(buffer, byteOffset, byteOffset + byteLength));
}
function canCopyArrayBuffer(toBuffer, toIndex, fromBuffer, fromIndex, count) {
  return toBuffer !== fromBuffer && !ArrayBufferPrototypeGetDetached(toBuffer) && !ArrayBufferPrototypeGetDetached(fromBuffer) && toIndex + count <= ArrayBufferPrototypeGetByteLength(toBuffer) && fromIndex + count <= ArrayBufferPrototypeGetByteLength(fromBuffer);
}
function isBrandCheck(brand) {
  return value => {
    return value != null && value[kState] !== undefined && value[kType] === brand;
  };
}
function dequeueValue(controller) {
  assert(controller[kState].queue !== undefined);
  assert(controller[kState].queueTotalSize !== undefined);
  assert(controller[kState].queue.length);
  var {
    value,
    size
  } = ArrayPrototypeShift(controller[kState].queue);
  controller[kState].queueTotalSize = MathMax(0, controller[kState].queueTotalSize - size);
  return value;
}
function resetQueue(controller) {
  assert(controller[kState].queue !== undefined);
  assert(controller[kState].queueTotalSize !== undefined);
  controller[kState].queue = [];
  controller[kState].queueTotalSize = 0;
}
function peekQueueValue(controller) {
  assert(controller[kState].queue !== undefined);
  assert(controller[kState].queueTotalSize !== undefined);
  assert(controller[kState].queue.length);
  return controller[kState].queue[0].value;
}
function enqueueValueWithSize(controller, value, size) {
  assert(controller[kState].queue !== undefined);
  assert(controller[kState].queueTotalSize !== undefined);
  var coercedSize = +size;
  if (NumberIsNaN(coercedSize) || coercedSize < 0 || coercedSize === Infinity) {
    throw new ERR_INVALID_ARG_VALUE.RangeError('size', size);
  }
  size = coercedSize;
  ArrayPrototypePush(controller[kState].queue, {
    value,
    size
  });
  controller[kState].queueTotalSize += size;
}
function createPromiseCallback(name, fn, thisArg) {
  validateFunction(fn, name);
  return _async(function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return ReflectApply(fn, thisArg, args);
  });
}
function isPromisePending(promise) {
  if (promise === undefined) return false;
  var details = getPromiseDetails(promise);
  return details?.[0] === kPending;
}
function setPromiseHandled(promise) {
  // Alternatively, we could use the native API
  // MarkAsHandled, but this avoids the extra boundary cross
  // and is hopefully faster at the cost of an extra Promise
  // allocation.
  PromisePrototypeThen(promise, undefined, () => {});
}
function nonOpStart() {}
var transfer;
function lazyTransfer() {
  if (transfer === undefined) transfer = require('internal/webstreams/transfer');
  return transfer;
}
module.exports = {
  ArrayBufferViewGetBuffer,
  ArrayBufferViewGetByteLength,
  ArrayBufferViewGetByteOffset,
  AsyncIterator,
  canCopyArrayBuffer,
  cloneAsUint8Array,
  copyArrayBuffer,
  createPromiseCallback,
  customInspect,
  dequeueValue,
  enqueueValueWithSize,
  extractHighWaterMark,
  extractSizeAlgorithm,
  getNonWritablePropertyDescriptor,
  isBrandCheck,
  isPromisePending,
  kState,
  kType,
  lazyTransfer,
  nonOpCancel,
  nonOpFlush,
  nonOpPull,
  nonOpStart,
  nonOpWrite,
  peekQueueValue,
  resetQueue,
  setPromiseHandled
};

