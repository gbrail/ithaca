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
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var transformStreamDefaultSinkAbortAlgorithm = _async(function (stream, reason) {
  var {
    controller,
    readable
  } = stream[kState];
  if (controller[kState].finishPromise !== undefined) {
    return controller[kState].finishPromise;
  }
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  controller[kState].finishPromise = promise;
  var cancelPromise = controller[kState].cancelAlgorithm(reason);
  transformStreamDefaultControllerClearAlgorithms(controller);
  PromisePrototypeThen(cancelPromise, () => {
    if (readable[kState].state === 'errored') reject(readable[kState].storedError);else {
      readableStreamDefaultControllerError(readable[kState].controller, reason);
      resolve();
    }
  }, error => {
    readableStreamDefaultControllerError(readable[kState].controller, error);
    reject(error);
  });
  return controller[kState].finishPromise;
});
var transformStreamDefaultControllerPerformTransform = _async(function (controller, chunk) {
  return _catch(function () {
    var transformAlgorithm = controller[kState].transformAlgorithm;
    if (transformAlgorithm === undefined) {
      // Algorithms were cleared by a concurrent cancel/abort/close.
      return;
    }
    return _await(transformAlgorithm(chunk, controller));
  }, function (error) {
    transformStreamError(controller[kState].stream, error);
    throw error;
  });
});
var defaultTransformAlgorithm = _async(function (chunk, controller) {
  transformStreamDefaultControllerEnqueue(controller, chunk);
  return _await();
});
var {
  FunctionPrototypeCall,
  ObjectDefineProperties,
  ObjectSetPrototypeOf,
  PromisePrototypeThen,
  PromiseWithResolvers,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE,
    ERR_INVALID_THIS
  }
} = require('internal/errors');
var {
  DOMException
} = internalBinding('messaging');
var {
  customInspectSymbol: kInspect,
  kEmptyObject,
  kEnumerableProperty
} = require('internal/util');
var {
  validateObject,
  kValidateObjectAllowObjects,
  kValidateObjectAllowObjectsAndNull
} = require('internal/validators');
var {
  kDeserialize,
  kTransfer,
  kTransferList,
  markTransferMode
} = require('internal/worker/js_transferable');
var {
  createPromiseCallback,
  customInspect,
  extractHighWaterMark,
  extractSizeAlgorithm,
  getNonWritablePropertyDescriptor,
  isBrandCheck,
  kState,
  kType,
  nonOpCancel,
  nonOpFlush
} = require('internal/webstreams/util');
var {
  createReadableStream,
  readableStreamDefaultControllerCanCloseOrEnqueue,
  readableStreamDefaultControllerClose,
  readableStreamDefaultControllerEnqueue,
  readableStreamDefaultControllerError,
  readableStreamDefaultControllerGetDesiredSize,
  readableStreamDefaultControllerHasBackpressure
} = require('internal/webstreams/readablestream');
var {
  createWritableStream,
  writableStreamDefaultControllerErrorIfNeeded
} = require('internal/webstreams/writablestream');
var assert = require('internal/assert');
var kSkipThrow = _Symbol('kSkipThrow');

/**
 * @typedef {import('./queuingstrategies').QueuingStrategy
 * } QueuingStrategy
 * @typedef {import('./queuingstrategies').QueuingStrategySize
 * } QueuingStrategySize
 */

/**
 * @callback TransformerStartCallback
 * @param {TransformStreamDefaultController} controller
 */

/**
 * @callback TransformerFlushCallback
 * @param {TransformStreamDefaultController} controller
 * @returns {Promise<void>}
 */

/**
 * @callback TransformerTransformCallback
 * @param {any} chunk
 * @param {TransformStreamDefaultController} controller
 * @returns {Promise<void>}
 */

/**
 * @typedef {{
 *  start? : TransformerStartCallback,
 *  transform? : TransformerTransformCallback,
 *  flush? : TransformerFlushCallback,
 *  readableType? : any,
 *  writableType? : any,
 * }} Transformer
 */
var TransformStream = /*#__PURE__*/function () {
  /**
   * @param {Transformer} [transformer]
   * @param {QueuingStrategy} [writableStrategy]
   * @param {QueuingStrategy} [readableStrategy]
   */
  function TransformStream() {
    var transformer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
    var writableStrategy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    var readableStrategy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
    _classCallCheck(this, TransformStream);
    _defineProperty(this, kType, 'TransformStream');
    markTransferMode(this, false, true);
    validateObject(transformer, 'transformer', kValidateObjectAllowObjects);
    validateObject(writableStrategy, 'writableStrategy', kValidateObjectAllowObjectsAndNull);
    validateObject(readableStrategy, 'readableStrategy', kValidateObjectAllowObjectsAndNull);
    var readableType = transformer?.readableType;
    var writableType = transformer?.writableType;
    var start = transformer?.start;
    if (readableType !== undefined) {
      throw new ERR_INVALID_ARG_VALUE.RangeError('transformer.readableType', readableType);
    }
    if (writableType !== undefined) {
      throw new ERR_INVALID_ARG_VALUE.RangeError('transformer.writableType', writableType);
    }
    var readableHighWaterMark = readableStrategy?.highWaterMark;
    var readableSize = readableStrategy?.size;
    var writableHighWaterMark = writableStrategy?.highWaterMark;
    var writableSize = writableStrategy?.size;
    var actualReadableHighWaterMark = extractHighWaterMark(readableHighWaterMark, 0);
    var actualReadableSize = extractSizeAlgorithm(readableSize);
    var actualWritableHighWaterMark = extractHighWaterMark(writableHighWaterMark, 1);
    var actualWritableSize = extractSizeAlgorithm(writableSize);
    var startPromise = PromiseWithResolvers();
    initializeTransformStream(this, startPromise, actualWritableHighWaterMark, actualWritableSize, actualReadableHighWaterMark, actualReadableSize);
    setupTransformStreamDefaultControllerFromTransformer(this, transformer);
    if (start !== undefined) {
      startPromise.resolve(FunctionPrototypeCall(start, transformer, this[kState].controller));
    } else {
      startPromise.resolve();
    }
  }

  /**
   * @readonly
   * @type {ReadableStream}
   */
  return _createClass(TransformStream, [{
    key: "readable",
    get: function () {
      if (!isTransformStream(this)) throw new ERR_INVALID_THIS('TransformStream');
      return this[kState].readable;
    }

    /**
     * @readonly
     * @type {WritableStream}
     */
  }, {
    key: "writable",
    get: function () {
      if (!isTransformStream(this)) throw new ERR_INVALID_THIS('TransformStream');
      return this[kState].writable;
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        readable: this.readable,
        writable: this.writable,
        backpressure: this[kState].backpressure
      });
    }
  }, {
    key: kTransfer,
    value: function () {
      if (!isTransformStream(this)) throw new ERR_INVALID_THIS('TransformStream');
      var {
        readable,
        writable
      } = this[kState];
      if (readable.locked) {
        throw new DOMException('Cannot transfer a locked ReadableStream', 'DataCloneError');
      }
      if (writable.locked) {
        throw new DOMException('Cannot transfer a locked WritableStream', 'DataCloneError');
      }
      return {
        data: {
          readable,
          writable
        },
        deserializeInfo: 'internal/webstreams/transformstream:TransferredTransformStream'
      };
    }
  }, {
    key: kTransferList,
    value: function () {
      return [this[kState].readable, this[kState].writable];
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        readable,
        writable
      } = _ref;
      this[kState].readable = readable;
      this[kState].writable = writable;
    }
  }]);
}();
ObjectDefineProperties(TransformStream.prototype, {
  readable: kEnumerableProperty,
  writable: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(TransformStream.name)
});
function InternalTransferredTransformStream() {
  ObjectSetPrototypeOf(this, TransformStream.prototype);
  markTransferMode(this, false, true);
  this[kType] = 'TransformStream';
  this[kState] = {
    __proto__: null,
    readable: undefined,
    writable: undefined,
    backpressure: undefined,
    backpressureChange: {
      __proto__: null,
      promise: undefined,
      resolve: undefined,
      reject: undefined
    },
    controller: undefined
  };
}
ObjectSetPrototypeOf(InternalTransferredTransformStream.prototype, TransformStream.prototype);
ObjectSetPrototypeOf(InternalTransferredTransformStream, TransformStream);
function TransferredTransformStream() {
  var stream = new InternalTransferredTransformStream();
  stream.constructor = TransformStream;
  return stream;
}
TransferredTransformStream.prototype[kDeserialize] = () => {};
var TransformStreamDefaultController = /*#__PURE__*/function () {
  function TransformStreamDefaultController() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, TransformStreamDefaultController);
    _defineProperty(this, kType, 'TransformStreamDefaultController');
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
  }

  /**
   * @readonly
   * @type {number}
   */
  return _createClass(TransformStreamDefaultController, [{
    key: "desiredSize",
    get: function () {
      if (!isTransformStreamDefaultController(this)) throw new ERR_INVALID_THIS('TransformStreamDefaultController');
      var {
        stream
      } = this[kState];
      var {
        readable
      } = stream[kState];
      var {
        controller: readableController
      } = readable[kState];
      return readableStreamDefaultControllerGetDesiredSize(readableController);
    }

    /**
     * @param {any} [chunk]
     */
  }, {
    key: "enqueue",
    value: function enqueue() {
      var chunk = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isTransformStreamDefaultController(this)) throw new ERR_INVALID_THIS('TransformStreamDefaultController');
      transformStreamDefaultControllerEnqueue(this, chunk);
    }

    /**
     * @param {any} [reason]
     */
  }, {
    key: "error",
    value: function error() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isTransformStreamDefaultController(this)) throw new ERR_INVALID_THIS('TransformStreamDefaultController');
      transformStreamDefaultControllerError(this, reason);
    }
  }, {
    key: "terminate",
    value: function terminate() {
      if (!isTransformStreamDefaultController(this)) throw new ERR_INVALID_THIS('TransformStreamDefaultController');
      transformStreamDefaultControllerTerminate(this);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        stream: this[kState].stream
      });
    }
  }]);
}();
ObjectDefineProperties(TransformStreamDefaultController.prototype, {
  desiredSize: kEnumerableProperty,
  enqueue: kEnumerableProperty,
  error: kEnumerableProperty,
  terminate: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(TransformStreamDefaultController.name)
});
var isTransformStream = isBrandCheck('TransformStream');
var isTransformStreamDefaultController = isBrandCheck('TransformStreamDefaultController');
function initializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
  var startAlgorithm = () => startPromise.promise;
  var writable = createWritableStream(startAlgorithm, chunk => transformStreamDefaultSinkWriteAlgorithm(stream, chunk), () => transformStreamDefaultSinkCloseAlgorithm(stream), reason => transformStreamDefaultSinkAbortAlgorithm(stream, reason), writableHighWaterMark, writableSizeAlgorithm);
  var readable = createReadableStream(startAlgorithm, () => transformStreamDefaultSourcePullAlgorithm(stream), reason => transformStreamDefaultSourceCancelAlgorithm(stream, reason), readableHighWaterMark, readableSizeAlgorithm);
  stream[kState] = {
    __proto__: null,
    readable,
    writable,
    controller: undefined,
    backpressure: undefined,
    backpressureChange: {
      __proto__: null,
      promise: undefined,
      resolve: undefined,
      reject: undefined
    }
  };
  transformStreamSetBackpressure(stream, true);
}
function transformStreamError(stream, error) {
  var {
    readable
  } = stream[kState];
  var {
    controller
  } = readable[kState];
  readableStreamDefaultControllerError(controller, error);
  transformStreamErrorWritableAndUnblockWrite(stream, error);
}
function transformStreamErrorWritableAndUnblockWrite(stream, error) {
  var {
    controller,
    writable
  } = stream[kState];
  transformStreamDefaultControllerClearAlgorithms(controller);
  writableStreamDefaultControllerErrorIfNeeded(writable[kState].controller, error);
  transformStreamUnblockWrite(stream);
}
function transformStreamUnblockWrite(stream) {
  if (stream[kState].backpressure) transformStreamSetBackpressure(stream, false);
}
function transformStreamSetBackpressure(stream, backpressure) {
  assert(stream[kState].backpressure !== backpressure);
  if (stream[kState].backpressureChange.promise !== undefined) stream[kState].backpressureChange.resolve?.();
  stream[kState].backpressureChange = PromiseWithResolvers();
  stream[kState].backpressure = backpressure;
}
function setupTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm, cancelAlgorithm) {
  assert(isTransformStream(stream));
  assert(stream[kState].controller === undefined);
  controller[kState] = {
    __proto__: null,
    stream,
    transformAlgorithm,
    flushAlgorithm,
    cancelAlgorithm
  };
  stream[kState].controller = controller;
}
function setupTransformStreamDefaultControllerFromTransformer(stream, transformer) {
  var controller = new TransformStreamDefaultController(kSkipThrow);
  var transform = transformer?.transform;
  var flush = transformer?.flush;
  var cancel = transformer?.cancel;
  var transformAlgorithm = transform ? createPromiseCallback('transformer.transform', transform, transformer) : defaultTransformAlgorithm;
  var flushAlgorithm = flush ? createPromiseCallback('transformer.flush', flush, transformer) : nonOpFlush;
  var cancelAlgorithm = cancel ? createPromiseCallback('transformer.cancel', cancel, transformer) : nonOpCancel;
  setupTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm, cancelAlgorithm);
}
function transformStreamDefaultControllerClearAlgorithms(controller) {
  controller[kState].transformAlgorithm = undefined;
  controller[kState].flushAlgorithm = undefined;
  controller[kState].cancelAlgorithm = undefined;
}
function transformStreamDefaultControllerEnqueue(controller, chunk) {
  var {
    stream
  } = controller[kState];
  var {
    readable
  } = stream[kState];
  var {
    controller: readableController
  } = readable[kState];
  if (!readableStreamDefaultControllerCanCloseOrEnqueue(readableController)) throw new ERR_INVALID_STATE.TypeError('Unable to enqueue');
  try {
    readableStreamDefaultControllerEnqueue(readableController, chunk);
  } catch (error) {
    transformStreamErrorWritableAndUnblockWrite(stream, error);
    throw readable[kState].storedError;
  }
  var backpressure = readableStreamDefaultControllerHasBackpressure(readableController);
  if (backpressure !== stream[kState].backpressure) {
    assert(backpressure);
    transformStreamSetBackpressure(stream, true);
  }
}
function transformStreamDefaultControllerError(controller, error) {
  transformStreamError(controller[kState].stream, error);
}
function transformStreamDefaultControllerTerminate(controller) {
  var {
    stream
  } = controller[kState];
  var {
    readable
  } = stream[kState];
  assert(readable !== undefined);
  var {
    controller: readableController
  } = readable[kState];
  readableStreamDefaultControllerClose(readableController);
  transformStreamErrorWritableAndUnblockWrite(stream, new ERR_INVALID_STATE.TypeError('TransformStream has been terminated'));
}
function transformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
  var {
    writable,
    controller
  } = stream[kState];
  assert(writable[kState].state === 'writable');
  if (stream[kState].backpressure) {
    var backpressureChange = stream[kState].backpressureChange.promise;
    return PromisePrototypeThen(backpressureChange, () => {
      var {
        writable
      } = stream[kState];
      if (writable[kState].state === 'erroring') throw writable[kState].storedError;
      assert(writable[kState].state === 'writable');
      return transformStreamDefaultControllerPerformTransform(controller, chunk);
    });
  }
  return transformStreamDefaultControllerPerformTransform(controller, chunk);
}
function transformStreamDefaultSinkCloseAlgorithm(stream) {
  var {
    readable,
    controller
  } = stream[kState];
  if (controller[kState].finishPromise !== undefined) {
    return controller[kState].finishPromise;
  }
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  controller[kState].finishPromise = promise;
  var flushPromise = controller[kState].flushAlgorithm(controller);
  transformStreamDefaultControllerClearAlgorithms(controller);
  PromisePrototypeThen(flushPromise, () => {
    if (readable[kState].state === 'errored') reject(readable[kState].storedError);else {
      readableStreamDefaultControllerClose(readable[kState].controller);
      resolve();
    }
  }, error => {
    readableStreamDefaultControllerError(readable[kState].controller, error);
    reject(error);
  });
  return controller[kState].finishPromise;
}
function transformStreamDefaultSourcePullAlgorithm(stream) {
  assert(stream[kState].backpressure);
  assert(stream[kState].backpressureChange.promise !== undefined);
  transformStreamSetBackpressure(stream, false);
  return stream[kState].backpressureChange.promise;
}
function transformStreamDefaultSourceCancelAlgorithm(stream, reason) {
  var {
    controller,
    writable
  } = stream[kState];
  if (controller[kState].finishPromise !== undefined) {
    return controller[kState].finishPromise;
  }
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  controller[kState].finishPromise = promise;
  var cancelPromise = controller[kState].cancelAlgorithm(reason);
  transformStreamDefaultControllerClearAlgorithms(controller);
  PromisePrototypeThen(cancelPromise, () => {
    if (writable[kState].state === 'errored') reject(writable[kState].storedError);else {
      writableStreamDefaultControllerErrorIfNeeded(writable[kState].controller, reason);
      transformStreamUnblockWrite(stream);
      resolve();
    }
  }, error => {
    writableStreamDefaultControllerErrorIfNeeded(writable[kState].controller, error);
    transformStreamUnblockWrite(stream);
    reject(error);
  });
  return controller[kState].finishPromise;
}
module.exports = {
  TransformStream,
  TransformStreamDefaultController,
  TransferredTransformStream,
  // Exported Brand Checks
  isTransformStream,
  isTransformStreamDefaultController
};

