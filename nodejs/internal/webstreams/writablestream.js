'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypePush,
  ArrayPrototypeShift,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  ObjectDefineProperties,
  ObjectSetPrototypeOf,
  Promise,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  PromiseWithResolvers,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_TYPE,
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
  kEnumerableProperty,
  SideEffectFreeRegExpPrototypeSymbolReplace
} = require('internal/util');
var {
  validateObject,
  kValidateObjectAllowObjects,
  kValidateObjectAllowObjectsAndNull
} = require('internal/validators');
var {
  MessageChannel
} = require('internal/worker/io');
var {
  kDeserialize,
  kTransfer,
  kTransferList,
  markTransferMode
} = require('internal/worker/js_transferable');
var {
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
  nonOpStart,
  nonOpWrite,
  peekQueueValue,
  resetQueue,
  setPromiseHandled
} = require('internal/webstreams/util');
var {
  kIsClosedPromise,
  kIsErrored,
  kIsWritable,
  kControllerErrorFunction
} = require('internal/streams/utils');
var {
  AbortController
} = require('internal/abort_controller');
var assert = require('internal/assert');
var kAbort = _Symbol('kAbort');
var kCloseSentinel = _Symbol('kCloseSentinel');
var kError = _Symbol('kError');
var kSkipThrow = _Symbol('kSkipThrow');
var releasedError;
function lazyWritableReleasedError() {
  if (releasedError) {
    return releasedError;
  }
  var userModuleRegExp = /^ {4}at (?:[^/\\(]+ \()(?!node:(.+):\d+:\d+\)$).*/gm;
  releasedError = new ERR_INVALID_STATE.TypeError('Writer has been released');
  // Avoid V8 leak and remove userland stackstrace
  releasedError.stack = SideEffectFreeRegExpPrototypeSymbolReplace(userModuleRegExp, releasedError.stack, '');
  return releasedError;
}

/**
 * @typedef {import('../abort_controller').AbortSignal} AbortSignal
 * @typedef {import('./queuingstrategies').QueuingStrategy
 * } QueuingStrategy
 * @typedef {import('./queuingstrategies').QueuingStrategySize
 * } QueuingStrategySize
 */

/**
 * @callback UnderlyingSinkStartCallback
 * @param {WritableStreamDefaultController} controller
 */

/**
 * @callback UnderlyingSinkWriteCallback
 * @param {any} chunk
 * @param {WritableStreamDefaultController} controller
 * @returns {Promise<void>}
 */

/**
 * @callback UnderlyingSinkCloseCallback
 * @returns {Promise<void>}
 */

/**
 * @callback UnderlyingSinkAbortCallback
 * @param {any} reason
 * @returns {Promise<void>}
 */

/**
 * @typedef {{
 *   start? : UnderlyingSinkStartCallback,
 *   write? : UnderlyingSinkWriteCallback,
 *   close? : UnderlyingSinkCloseCallback,
 *   abort? : UnderlyingSinkAbortCallback,
 *   type? : any,
 * }} UnderlyingSink
 */
var WritableStream = /*#__PURE__*/function () {
  /**
   * @param {UnderlyingSink} [sink]
   * @param {QueuingStrategy} [strategy]
   */
  function WritableStream() {
    var sink = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
    var strategy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, WritableStream);
    _defineProperty(this, kType, 'WritableStream');
    markTransferMode(this, false, true);
    validateObject(sink, 'sink', kValidateObjectAllowObjects);
    validateObject(strategy, 'strategy', kValidateObjectAllowObjectsAndNull);
    var type = sink?.type;
    if (type !== undefined) throw new ERR_INVALID_ARG_VALUE.RangeError('type', type);
    this[kState] = createWritableStreamState();
    this[kIsClosedPromise] = PromiseWithResolvers();
    this[kControllerErrorFunction] = () => {};
    var size = extractSizeAlgorithm(strategy?.size);
    var highWaterMark = extractHighWaterMark(strategy?.highWaterMark, 1);
    setupWritableStreamDefaultControllerFromSink(this, sink, highWaterMark, size);
  }
  return _createClass(WritableStream, [{
    key: kIsErrored,
    get: function () {
      return this[kState].state === 'errored';
    }
  }, {
    key: kIsWritable,
    get: function () {
      return this[kState].state === 'writable';
    }

    /**
     * @readonly
     * @type {boolean}
     */
  }, {
    key: "locked",
    get: function () {
      if (!isWritableStream(this)) throw new ERR_INVALID_THIS('WritableStream');
      return isWritableStreamLocked(this);
    }

    /**
     * @param {any} [reason]
     * @returns {Promise<void>}
     */
  }, {
    key: "abort",
    value: function abort() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isWritableStream(this)) return PromiseReject(new ERR_INVALID_THIS('WritableStream'));
      if (isWritableStreamLocked(this)) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('WritableStream is locked'));
      }
      return writableStreamAbort(this, reason);
    }

    /**
     * @returns {Promise<void>}
     */
  }, {
    key: "close",
    value: function close() {
      if (!isWritableStream(this)) return PromiseReject(new ERR_INVALID_THIS('WritableStream'));
      if (isWritableStreamLocked(this)) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('WritableStream is locked'));
      }
      if (writableStreamCloseQueuedOrInFlight(this)) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('Failure closing WritableStream'));
      }
      return writableStreamClose(this);
    }

    /**
     * @returns {WritableStreamDefaultWriter}
     */
  }, {
    key: "getWriter",
    value: function getWriter() {
      if (!isWritableStream(this)) throw new ERR_INVALID_THIS('WritableStream');
      // eslint-disable-next-line no-use-before-define
      return new WritableStreamDefaultWriter(this);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        locked: this.locked,
        state: this[kState].state
      });
    }
  }, {
    key: kTransfer,
    value: function () {
      if (!isWritableStream(this)) throw new ERR_INVALID_THIS('WritableStream');
      if (this.locked) {
        this[kState].transfer.port1?.close();
        this[kState].transfer.port1 = undefined;
        this[kState].transfer.port2 = undefined;
        throw new DOMException('Cannot transfer a locked WritableStream', 'DataCloneError');
      }
      var {
        readable,
        promise
      } = lazyTransfer().newCrossRealmReadableStream(this, this[kState].transfer.port1);
      this[kState].transfer.readable = readable;
      this[kState].transfer.promise = promise;
      return {
        data: {
          port: this[kState].transfer.port2
        },
        deserializeInfo: 'internal/webstreams/writablestream:TransferredWritableStream'
      };
    }
  }, {
    key: kTransferList,
    value: function () {
      var {
        port1,
        port2
      } = new MessageChannel();
      this[kState].transfer.port1 = port1;
      this[kState].transfer.port2 = port2;
      return [port2];
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        port
      } = _ref;
      var transfer = lazyTransfer();
      setupWritableStreamDefaultControllerFromSink(this,
      // The MessagePort is set to be referenced when reading.
      // After two MessagePorts are closed, there is a problem with
      // lingering promise not being properly resolved.
      // https://github.com/nodejs/node/issues/51486
      new transfer.CrossRealmTransformWritableSink(port, true), 1, () => 1);
    }
  }]);
}();
ObjectDefineProperties(WritableStream.prototype, {
  locked: kEnumerableProperty,
  abort: kEnumerableProperty,
  close: kEnumerableProperty,
  getWriter: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(WritableStream.name)
});
function InternalTransferredWritableStream() {
  ObjectSetPrototypeOf(this, WritableStream.prototype);
  markTransferMode(this, false, true);
  this[kType] = 'WritableStream';
  this[kState] = createWritableStreamState();
  this[kIsClosedPromise] = PromiseWithResolvers();
}
ObjectSetPrototypeOf(InternalTransferredWritableStream.prototype, WritableStream.prototype);
ObjectSetPrototypeOf(InternalTransferredWritableStream, WritableStream);
function TransferredWritableStream() {
  var stream = new InternalTransferredWritableStream();
  stream.constructor = WritableStream;
  return stream;
}
TransferredWritableStream.prototype[kDeserialize] = () => {};
var WritableStreamDefaultWriter = /*#__PURE__*/function () {
  /**
   * @param {WritableStream} stream
   */
  function WritableStreamDefaultWriter(stream) {
    _classCallCheck(this, WritableStreamDefaultWriter);
    _defineProperty(this, kType, 'WritableStreamDefaultWriter');
    if (!isWritableStream(stream)) throw new ERR_INVALID_ARG_TYPE('stream', 'WritableStream', stream);
    this[kState] = {
      stream: undefined,
      close: {
        promise: undefined,
        resolve: undefined,
        reject: undefined
      },
      ready: {
        promise: undefined,
        resolve: undefined,
        reject: undefined
      }
    };
    setupWritableStreamDefaultWriter(this, stream);
  }

  /**
   * @readonly
   * @type {Promise<void>}
   */
  return _createClass(WritableStreamDefaultWriter, [{
    key: "closed",
    get: function () {
      if (!isWritableStreamDefaultWriter(this)) return PromiseReject(new ERR_INVALID_THIS('WritableStreamDefaultWriter'));
      return this[kState].close.promise;
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "desiredSize",
    get: function () {
      if (!isWritableStreamDefaultWriter(this)) throw new ERR_INVALID_THIS('WritableStreamDefaultWriter');
      if (this[kState].stream === undefined) {
        throw new ERR_INVALID_STATE.TypeError('Writer is not bound to a WritableStream');
      }
      return writableStreamDefaultWriterGetDesiredSize(this);
    }

    /**
     * @readonly
     * @type {Promise<void>}
     */
  }, {
    key: "ready",
    get: function () {
      if (!isWritableStreamDefaultWriter(this)) return PromiseReject(new ERR_INVALID_THIS('WritableStreamDefaultWriter'));
      return this[kState].ready.promise;
    }

    /**
     * @param {any} [reason]
     * @returns {Promise<void>}
     */
  }, {
    key: "abort",
    value: function abort() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isWritableStreamDefaultWriter(this)) return PromiseReject(new ERR_INVALID_THIS('WritableStreamDefaultWriter'));
      if (this[kState].stream === undefined) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('Writer is not bound to a WritableStream'));
      }
      return writableStreamDefaultWriterAbort(this, reason);
    }

    /**
     * @returns {Promise<void>}
     */
  }, {
    key: "close",
    value: function close() {
      if (!isWritableStreamDefaultWriter(this)) return PromiseReject(new ERR_INVALID_THIS('WritableStreamDefaultWriter'));
      var {
        stream
      } = this[kState];
      if (stream === undefined) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('Writer is not bound to a WritableStream'));
      }
      if (writableStreamCloseQueuedOrInFlight(stream)) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('Failure to close WritableStream'));
      }
      return writableStreamDefaultWriterClose(this);
    }
  }, {
    key: "releaseLock",
    value: function releaseLock() {
      if (!isWritableStreamDefaultWriter(this)) throw new ERR_INVALID_THIS('WritableStreamDefaultWriter');
      var {
        stream
      } = this[kState];
      if (stream === undefined) return;
      assert(stream[kState].writer !== undefined);
      writableStreamDefaultWriterRelease(this);
    }

    /**
     * @param {any} [chunk]
     * @returns {Promise<void>}
     */
  }, {
    key: "write",
    value: function write() {
      var chunk = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isWritableStreamDefaultWriter(this)) return PromiseReject(new ERR_INVALID_THIS('WritableStreamDefaultWriter'));
      if (this[kState].stream === undefined) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('Writer is not bound to a WritableStream'));
      }
      return writableStreamDefaultWriterWrite(this, chunk);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        stream: this[kState].stream,
        close: this[kState].close.promise,
        ready: this[kState].ready.promise,
        desiredSize: this.desiredSize
      });
    }
  }]);
}();
ObjectDefineProperties(WritableStreamDefaultWriter.prototype, {
  closed: kEnumerableProperty,
  ready: kEnumerableProperty,
  desiredSize: kEnumerableProperty,
  abort: kEnumerableProperty,
  close: kEnumerableProperty,
  releaseLock: kEnumerableProperty,
  write: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(WritableStreamDefaultWriter.name)
});
var WritableStreamDefaultController = /*#__PURE__*/function () {
  function WritableStreamDefaultController() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, WritableStreamDefaultController);
    _defineProperty(this, kType, 'WritableStreamDefaultController');
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
  }
  return _createClass(WritableStreamDefaultController, [{
    key: kAbort,
    value: function (reason) {
      var result = this[kState].abortAlgorithm(reason);
      writableStreamDefaultControllerClearAlgorithms(this);
      return result;
    }
  }, {
    key: kError,
    value: function () {
      resetQueue(this);
    }

    /**
     * @type {AbortSignal}
     */
  }, {
    key: "signal",
    get: function () {
      if (!isWritableStreamDefaultController(this)) throw new ERR_INVALID_THIS('WritableStreamDefaultController');
      return this[kState].abortController.signal;
    }

    /**
     * @param {any} [error]
     */
  }, {
    key: "error",
    value: function error() {
      var _error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isWritableStreamDefaultController(this)) throw new ERR_INVALID_THIS('WritableStreamDefaultController');
      if (this[kState].stream[kState].state !== 'writable') return;
      writableStreamDefaultControllerError(this, _error);
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
ObjectDefineProperties(WritableStreamDefaultController.prototype, {
  signal: kEnumerableProperty,
  error: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(WritableStreamDefaultController.name)
});
function InternalWritableStream(start, write, close, abort, highWaterMark, size) {
  ObjectSetPrototypeOf(this, WritableStream.prototype);
  markTransferMode(this, false, true);
  this[kType] = 'WritableStream';
  this[kState] = createWritableStreamState();
  this[kIsClosedPromise] = PromiseWithResolvers();
  var controller = new WritableStreamDefaultController(kSkipThrow);
  setupWritableStreamDefaultController(this, controller, start, write, close, abort, highWaterMark, size);
}
ObjectSetPrototypeOf(InternalWritableStream.prototype, WritableStream.prototype);
ObjectSetPrototypeOf(InternalWritableStream, WritableStream);
function createWritableStream(start, write, close, abort) {
  var highWaterMark = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var size = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : () => 1;
  var stream = new InternalWritableStream(start, write, close, abort, highWaterMark, size);

  // For spec compliance the InternalWritableStream must be a WritableStream
  stream.constructor = WritableStream;
  return stream;
}
var isWritableStream = isBrandCheck('WritableStream');
var isWritableStreamDefaultWriter = isBrandCheck('WritableStreamDefaultWriter');
var isWritableStreamDefaultController = isBrandCheck('WritableStreamDefaultController');
function createWritableStreamState() {
  return {
    __proto__: null,
    close: PromiseWithResolvers(),
    closeRequest: {
      __proto__: null,
      promise: undefined,
      resolve: undefined,
      reject: undefined
    },
    inFlightWriteRequest: {
      __proto__: null,
      promise: undefined,
      resolve: undefined,
      reject: undefined
    },
    inFlightCloseRequest: {
      __proto__: null,
      promise: undefined,
      resolve: undefined,
      reject: undefined
    },
    pendingAbortRequest: {
      __proto__: null,
      abort: {
        __proto__: null,
        promise: undefined,
        resolve: undefined,
        reject: undefined
      },
      reason: undefined,
      wasAlreadyErroring: false
    },
    backpressure: false,
    controller: undefined,
    state: 'writable',
    storedError: undefined,
    writeRequests: [],
    writer: undefined,
    transfer: {
      __proto__: null,
      readable: undefined,
      port1: undefined,
      port2: undefined,
      promise: undefined
    }
  };
}
function isWritableStreamLocked(stream) {
  return stream[kState].writer !== undefined;
}
function setupWritableStreamDefaultWriter(writer, stream) {
  if (isWritableStreamLocked(stream)) throw new ERR_INVALID_STATE.TypeError('WritableStream is locked');
  writer[kState].stream = stream;
  stream[kState].writer = writer;
  switch (stream[kState].state) {
    case 'writable':
      if (!writableStreamCloseQueuedOrInFlight(stream) && stream[kState].backpressure) {
        writer[kState].ready = PromiseWithResolvers();
      } else {
        writer[kState].ready = {
          promise: PromiseResolve(),
          resolve: undefined,
          reject: undefined
        };
      }
      setClosedPromiseToNewPromise();
      break;
    case 'erroring':
      writer[kState].ready = {
        promise: PromiseReject(stream[kState].storedError),
        resolve: undefined,
        reject: undefined
      };
      setPromiseHandled(writer[kState].ready.promise);
      setClosedPromiseToNewPromise();
      break;
    case 'closed':
      writer[kState].ready = {
        promise: PromiseResolve(),
        resolve: undefined,
        reject: undefined
      };
      writer[kState].close = {
        promise: PromiseResolve(),
        resolve: undefined,
        reject: undefined
      };
      break;
    default:
      writer[kState].ready = {
        promise: PromiseReject(stream[kState].storedError),
        resolve: undefined,
        reject: undefined
      };
      writer[kState].close = {
        promise: PromiseReject(stream[kState].storedError),
        resolve: undefined,
        reject: undefined
      };
      setPromiseHandled(writer[kState].ready.promise);
      setPromiseHandled(writer[kState].close.promise);
  }
  function setClosedPromiseToNewPromise() {
    writer[kState].close = PromiseWithResolvers();
  }
}
function writableStreamAbort(stream, reason) {
  var {
    state,
    controller
  } = stream[kState];
  if (state === 'closed' || state === 'errored') return PromiseResolve();
  controller[kState].abortController.abort(reason);
  if (stream[kState].pendingAbortRequest.abort.promise !== undefined) return stream[kState].pendingAbortRequest.abort.promise;
  assert(state === 'writable' || state === 'erroring');
  var wasAlreadyErroring = false;
  if (state === 'erroring') {
    wasAlreadyErroring = true;
    reason = undefined;
  }
  var abort = PromiseWithResolvers();
  stream[kState].pendingAbortRequest = {
    abort,
    reason,
    wasAlreadyErroring
  };
  if (!wasAlreadyErroring) writableStreamStartErroring(stream, reason);
  return abort.promise;
}
function writableStreamClose(stream) {
  var {
    state,
    writer,
    backpressure,
    controller
  } = stream[kState];
  if (state === 'closed' || state === 'errored') {
    return PromiseReject(new ERR_INVALID_STATE.TypeError('WritableStream is closed'));
  }
  assert(state === 'writable' || state === 'erroring');
  assert(!writableStreamCloseQueuedOrInFlight(stream));
  stream[kState].closeRequest = PromiseWithResolvers();
  var {
    promise
  } = stream[kState].closeRequest;
  if (writer !== undefined && backpressure && state === 'writable') writer[kState].ready.resolve?.();
  writableStreamDefaultControllerClose(controller);
  return promise;
}
function writableStreamUpdateBackpressure(stream, backpressure) {
  assert(stream[kState].state === 'writable');
  assert(!writableStreamCloseQueuedOrInFlight(stream));
  var {
    writer
  } = stream[kState];
  if (writer !== undefined && stream[kState].backpressure !== backpressure) {
    if (backpressure) {
      writer[kState].ready = PromiseWithResolvers();
    } else {
      writer[kState].ready.resolve?.();
    }
  }
  stream[kState].backpressure = backpressure;
}
function writableStreamStartErroring(stream, reason) {
  assert(stream[kState].storedError === undefined);
  assert(stream[kState].state === 'writable');
  var {
    controller,
    writer
  } = stream[kState];
  assert(controller !== undefined);
  stream[kState].state = 'erroring';
  stream[kState].storedError = reason;
  if (writer !== undefined) {
    writableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
  }
  if (!writableStreamHasOperationMarkedInFlight(stream) && controller[kState].started) {
    writableStreamFinishErroring(stream);
  }
}
function writableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
  assert(stream[kState].state === 'errored');
  if (stream[kState].closeRequest.promise !== undefined) {
    assert(stream[kState].inFlightCloseRequest.promise === undefined);
    stream[kState].closeRequest.reject?.(stream[kState].storedError);
    stream[kState].closeRequest = {
      promise: undefined,
      reject: undefined,
      resolve: undefined
    };
  }
  setPromiseHandled(stream[kIsClosedPromise].promise);
  stream[kIsClosedPromise].reject(stream[kState]?.storedError);
  var {
    writer
  } = stream[kState];
  if (writer !== undefined) {
    setPromiseHandled(writer[kState].close.promise);
    writer[kState].close.reject?.(stream[kState].storedError);
  }
}
function writableStreamMarkFirstWriteRequestInFlight(stream) {
  assert(stream[kState].inFlightWriteRequest.promise === undefined);
  assert(stream[kState].writeRequests.length);
  var writeRequest = ArrayPrototypeShift(stream[kState].writeRequests);
  stream[kState].inFlightWriteRequest = writeRequest;
}
function writableStreamMarkCloseRequestInFlight(stream) {
  assert(stream[kState].inFlightWriteRequest.promise === undefined);
  assert(stream[kState].closeRequest.promise !== undefined);
  stream[kState].inFlightCloseRequest = stream[kState].closeRequest;
  stream[kState].closeRequest = {
    promise: undefined,
    resolve: undefined,
    reject: undefined
  };
}
function writableStreamHasOperationMarkedInFlight(stream) {
  var {
    inFlightWriteRequest,
    inFlightCloseRequest
  } = stream[kState];
  if (inFlightWriteRequest.promise === undefined && inFlightCloseRequest.promise === undefined) {
    return false;
  }
  return true;
}
function writableStreamFinishInFlightWriteWithError(stream, error) {
  assert(stream[kState].inFlightWriteRequest.promise !== undefined);
  stream[kState].inFlightWriteRequest.reject?.(error);
  stream[kState].inFlightWriteRequest = {
    promise: undefined,
    resolve: undefined,
    reject: undefined
  };
  assert(stream[kState].state === 'writable' || stream[kState].state === 'erroring');
  writableStreamDealWithRejection(stream, error);
}
function writableStreamFinishInFlightWrite(stream) {
  assert(stream[kState].inFlightWriteRequest.promise !== undefined);
  stream[kState].inFlightWriteRequest.resolve?.();
  stream[kState].inFlightWriteRequest = {
    promise: undefined,
    resolve: undefined,
    reject: undefined
  };
}
function writableStreamFinishInFlightCloseWithError(stream, error) {
  assert(stream[kState].inFlightCloseRequest.promise !== undefined);
  stream[kState].inFlightCloseRequest.reject?.(error);
  stream[kState].inFlightCloseRequest = {
    promise: undefined,
    resolve: undefined,
    reject: undefined
  };
  assert(stream[kState].state === 'writable' || stream[kState].state === 'erroring');
  if (stream[kState].pendingAbortRequest.abort.promise !== undefined) {
    stream[kState].pendingAbortRequest.abort.reject?.(error);
    stream[kState].pendingAbortRequest = {
      abort: {
        promise: undefined,
        resolve: undefined,
        reject: undefined
      },
      reason: undefined,
      wasAlreadyErroring: false
    };
  }
  writableStreamDealWithRejection(stream, error);
}
function writableStreamFinishInFlightClose(stream) {
  assert(stream[kState].inFlightCloseRequest.promise !== undefined);
  stream[kState].inFlightCloseRequest.resolve?.();
  stream[kState].inFlightCloseRequest = {
    promise: undefined,
    resolve: undefined,
    reject: undefined
  };
  if (stream[kState].state === 'erroring') {
    stream[kState].storedError = undefined;
    if (stream[kState].pendingAbortRequest.abort.promise !== undefined) {
      stream[kState].pendingAbortRequest.abort.resolve?.();
      stream[kState].pendingAbortRequest = {
        abort: {
          promise: undefined,
          resolve: undefined,
          reject: undefined
        },
        reason: undefined,
        wasAlreadyErroring: false
      };
    }
  }
  stream[kState].state = 'closed';
  if (stream[kState].writer !== undefined) stream[kState].writer[kState].close.resolve?.();
  stream[kIsClosedPromise].resolve?.();
  assert(stream[kState].pendingAbortRequest.abort.promise === undefined);
  assert(stream[kState].storedError === undefined);
}
function writableStreamFinishErroring(stream) {
  assert(stream[kState].state === 'erroring');
  assert(!writableStreamHasOperationMarkedInFlight(stream));
  stream[kState].state = 'errored';
  stream[kState].controller[kError]();
  var storedError = stream[kState].storedError;
  for (var n = 0; n < stream[kState].writeRequests.length; n++) stream[kState].writeRequests[n].reject?.(storedError);
  stream[kState].writeRequests = [];
  if (stream[kState].pendingAbortRequest.abort.promise === undefined) {
    writableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
    return;
  }
  var abortRequest = stream[kState].pendingAbortRequest;
  stream[kState].pendingAbortRequest = {
    abort: {
      promise: undefined,
      resolve: undefined,
      reject: undefined
    },
    reason: undefined,
    wasAlreadyErroring: false
  };
  if (abortRequest.wasAlreadyErroring) {
    abortRequest.abort.reject?.(storedError);
    writableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
    return;
  }
  PromisePrototypeThen(stream[kState].controller[kAbort](abortRequest.reason), () => {
    abortRequest.abort.resolve?.();
    writableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
  }, error => {
    abortRequest.abort.reject?.(error);
    writableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
  });
}
function writableStreamDealWithRejection(stream, error) {
  var {
    state
  } = stream[kState];
  if (state === 'writable') {
    writableStreamStartErroring(stream, error);
    return;
  }
  assert(state === 'erroring');
  writableStreamFinishErroring(stream);
}
function writableStreamCloseQueuedOrInFlight(stream) {
  if (stream[kState].closeRequest.promise === undefined && stream[kState].inFlightCloseRequest.promise === undefined) {
    return false;
  }
  return true;
}
function writableStreamAddWriteRequest(stream) {
  assert(isWritableStreamLocked(stream));
  assert(stream[kState].state === 'writable');
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  ArrayPrototypePush(stream[kState].writeRequests, {
    promise,
    resolve,
    reject
  });
  return promise;
}
function writableStreamDefaultWriterWrite(writer, chunk) {
  var {
    stream
  } = writer[kState];
  assert(stream !== undefined);
  var {
    controller
  } = stream[kState];
  var chunkSize = writableStreamDefaultControllerGetChunkSize(controller, chunk);
  if (stream !== writer[kState].stream) {
    return PromiseReject(new ERR_INVALID_STATE.TypeError('Mismatched WritableStreams'));
  }
  var {
    state
  } = stream[kState];
  if (state === 'errored') return PromiseReject(stream[kState].storedError);
  if (writableStreamCloseQueuedOrInFlight(stream) || state === 'closed') {
    return PromiseReject(new ERR_INVALID_STATE.TypeError('WritableStream is closed'));
  }
  if (state === 'erroring') return PromiseReject(stream[kState].storedError);
  assert(state === 'writable');
  var promise = writableStreamAddWriteRequest(stream);
  writableStreamDefaultControllerWrite(controller, chunk, chunkSize);
  return promise;
}
function writableStreamDefaultWriterRelease(writer) {
  var {
    stream
  } = writer[kState];
  assert(stream !== undefined);
  assert(stream[kState].writer === writer);
  var releasedStateError = lazyWritableReleasedError();
  writableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedStateError);
  writableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedStateError);
  stream[kState].writer = undefined;
  writer[kState].stream = undefined;
}
function writableStreamDefaultWriterGetDesiredSize(writer) {
  var {
    stream
  } = writer[kState];
  switch (stream[kState].state) {
    case 'errored':
    // Fall through
    case 'erroring':
      return null;
    case 'closed':
      return 0;
  }
  return writableStreamDefaultControllerGetDesiredSize(stream[kState].controller);
}
function writableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error) {
  if (isPromisePending(writer[kState].ready.promise)) {
    writer[kState].ready.reject?.(error);
  } else {
    writer[kState].ready = {
      promise: PromiseReject(error),
      resolve: undefined,
      reject: undefined
    };
  }
  setPromiseHandled(writer[kState].ready.promise);
}
function writableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error) {
  if (isPromisePending(writer[kState].close.promise)) {
    writer[kState].close.reject?.(error);
  } else {
    writer[kState].close = {
      promise: PromiseReject(error),
      resolve: undefined,
      reject: undefined
    };
  }
  setPromiseHandled(writer[kState].close.promise);
}
function writableStreamDefaultWriterCloseWithErrorPropagation(writer) {
  var {
    stream
  } = writer[kState];
  assert(stream !== undefined);
  var {
    state
  } = stream[kState];
  if (writableStreamCloseQueuedOrInFlight(stream) || state === 'closed') return PromiseResolve();
  if (state === 'errored') return PromiseReject(stream[kState].storedError);
  assert(state === 'writable' || state === 'erroring');
  return writableStreamDefaultWriterClose(writer);
}
function writableStreamDefaultWriterClose(writer) {
  var {
    stream
  } = writer[kState];
  assert(stream !== undefined);
  return writableStreamClose(stream);
}
function writableStreamDefaultWriterAbort(writer, reason) {
  var {
    stream
  } = writer[kState];
  assert(stream !== undefined);
  return writableStreamAbort(stream, reason);
}
function writableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
  try {
    enqueueValueWithSize(controller, chunk, chunkSize);
  } catch (error) {
    writableStreamDefaultControllerErrorIfNeeded(controller, error);
    return;
  }
  var {
    stream
  } = controller[kState];
  if (!writableStreamCloseQueuedOrInFlight(stream) && stream[kState].state === 'writable') {
    writableStreamUpdateBackpressure(stream, writableStreamDefaultControllerGetBackpressure(controller));
  }
  writableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
}
function writableStreamDefaultControllerProcessWrite(controller, chunk) {
  var {
    stream,
    writeAlgorithm
  } = controller[kState];
  writableStreamMarkFirstWriteRequestInFlight(stream);
  PromisePrototypeThen(writeAlgorithm(chunk, controller), () => {
    writableStreamFinishInFlightWrite(stream);
    var {
      state
    } = stream[kState];
    assert(state === 'writable' || state === 'erroring');
    dequeueValue(controller);
    if (!writableStreamCloseQueuedOrInFlight(stream) && state === 'writable') {
      writableStreamUpdateBackpressure(stream, writableStreamDefaultControllerGetBackpressure(controller));
    }
    writableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
  }, error => {
    if (stream[kState].state === 'writable') writableStreamDefaultControllerClearAlgorithms(controller);
    writableStreamFinishInFlightWriteWithError(stream, error);
  });
}
function writableStreamDefaultControllerProcessClose(controller) {
  var {
    closeAlgorithm,
    queue,
    stream
  } = controller[kState];
  writableStreamMarkCloseRequestInFlight(stream);
  dequeueValue(controller);
  assert(!queue.length);
  var sinkClosePromise = closeAlgorithm();
  writableStreamDefaultControllerClearAlgorithms(controller);
  PromisePrototypeThen(sinkClosePromise, () => writableStreamFinishInFlightClose(stream), error => writableStreamFinishInFlightCloseWithError(stream, error));
}
function writableStreamDefaultControllerGetDesiredSize(controller) {
  var {
    highWaterMark,
    queueTotalSize
  } = controller[kState];
  return highWaterMark - queueTotalSize;
}
function writableStreamDefaultControllerGetChunkSize(controller, chunk) {
  var {
    stream,
    sizeAlgorithm
  } = controller[kState];
  if (sizeAlgorithm === undefined) {
    assert(stream[kState].state === 'closed' || stream[kState].state === 'errored' || stream[kState].state === 'erroring');
    return 1;
  }
  try {
    return FunctionPrototypeCall(sizeAlgorithm, undefined, chunk);
  } catch (error) {
    writableStreamDefaultControllerErrorIfNeeded(controller, error);
    return 1;
  }
}
function writableStreamDefaultControllerErrorIfNeeded(controller, error) {
  var {
    stream
  } = controller[kState];
  if (stream[kState].state === 'writable') writableStreamDefaultControllerError(controller, error);
}
function writableStreamDefaultControllerError(controller, error) {
  var {
    stream
  } = controller[kState];
  assert(stream[kState].state === 'writable');
  writableStreamDefaultControllerClearAlgorithms(controller);
  writableStreamStartErroring(stream, error);
}
function writableStreamDefaultControllerClose(controller) {
  enqueueValueWithSize(controller, kCloseSentinel, 0);
  writableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
}
function writableStreamDefaultControllerClearAlgorithms(controller) {
  controller[kState].writeAlgorithm = undefined;
  controller[kState].closeAlgorithm = undefined;
  controller[kState].abortAlgorithm = undefined;
  controller[kState].sizeAlgorithm = undefined;
}
function writableStreamDefaultControllerGetBackpressure(controller) {
  return writableStreamDefaultControllerGetDesiredSize(controller) <= 0;
}
function writableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
  var {
    queue,
    started,
    stream
  } = controller[kState];
  if (!started || stream[kState].inFlightWriteRequest.promise !== undefined) return;
  if (stream[kState].state === 'erroring') {
    writableStreamFinishErroring(stream);
    return;
  }
  if (!queue.length) return;
  var value = peekQueueValue(controller);
  if (value === kCloseSentinel) writableStreamDefaultControllerProcessClose(controller);else writableStreamDefaultControllerProcessWrite(controller, value);
}
function setupWritableStreamDefaultControllerFromSink(stream, sink, highWaterMark, sizeAlgorithm) {
  var controller = new WritableStreamDefaultController(kSkipThrow);
  var start = sink?.start;
  var write = sink?.write;
  var close = sink?.close;
  var abort = sink?.abort;
  var startAlgorithm = start ? FunctionPrototypeBind(start, sink, controller) : nonOpStart;
  var writeAlgorithm = write ? createPromiseCallback('sink.write', write, sink) : nonOpWrite;
  var closeAlgorithm = close ? createPromiseCallback('sink.close', close, sink) : nonOpCancel;
  var abortAlgorithm = abort ? createPromiseCallback('sink.abort', abort, sink) : nonOpCancel;
  setupWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
}
function setupWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
  assert(isWritableStream(stream));
  assert(stream[kState].controller === undefined);
  controller[kState] = {
    abortAlgorithm,
    closeAlgorithm,
    highWaterMark,
    queue: [],
    queueTotalSize: 0,
    abortController: new AbortController(),
    sizeAlgorithm,
    started: false,
    stream,
    writeAlgorithm
  };
  stream[kState].controller = controller;
  stream[kControllerErrorFunction] = FunctionPrototypeBind(controller.error, controller);
  writableStreamUpdateBackpressure(stream, writableStreamDefaultControllerGetBackpressure(controller));
  var startResult = startAlgorithm();
  PromisePrototypeThen(new Promise(r => r(startResult)), () => {
    assert(stream[kState].state === 'writable' || stream[kState].state === 'erroring');
    controller[kState].started = true;
    writableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
  }, error => {
    assert(stream[kState].state === 'writable' || stream[kState].state === 'erroring');
    controller[kState].started = true;
    writableStreamDealWithRejection(stream, error);
  });
}
module.exports = {
  WritableStream,
  WritableStreamDefaultWriter,
  WritableStreamDefaultController,
  TransferredWritableStream,
  // Exported Brand Checks
  isWritableStream,
  isWritableStreamDefaultController,
  isWritableStreamDefaultWriter,
  isWritableStreamLocked,
  setupWritableStreamDefaultWriter,
  writableStreamAbort,
  writableStreamClose,
  writableStreamUpdateBackpressure,
  writableStreamStartErroring,
  writableStreamRejectCloseAndClosedPromiseIfNeeded,
  writableStreamMarkFirstWriteRequestInFlight,
  writableStreamMarkCloseRequestInFlight,
  writableStreamHasOperationMarkedInFlight,
  writableStreamFinishInFlightWriteWithError,
  writableStreamFinishInFlightWrite,
  writableStreamFinishInFlightCloseWithError,
  writableStreamFinishInFlightClose,
  writableStreamFinishErroring,
  writableStreamDealWithRejection,
  writableStreamCloseQueuedOrInFlight,
  writableStreamAddWriteRequest,
  writableStreamDefaultWriterWrite,
  writableStreamDefaultWriterRelease,
  writableStreamDefaultWriterGetDesiredSize,
  writableStreamDefaultWriterEnsureReadyPromiseRejected,
  writableStreamDefaultWriterEnsureClosedPromiseRejected,
  writableStreamDefaultWriterCloseWithErrorPropagation,
  writableStreamDefaultWriterClose,
  writableStreamDefaultWriterAbort,
  writableStreamDefaultControllerWrite,
  writableStreamDefaultControllerProcessWrite,
  writableStreamDefaultControllerProcessClose,
  writableStreamDefaultControllerGetDesiredSize,
  writableStreamDefaultControllerGetChunkSize,
  writableStreamDefaultControllerErrorIfNeeded,
  writableStreamDefaultControllerError,
  writableStreamDefaultControllerClose,
  writableStreamDefaultControllerClearAlgorithms,
  writableStreamDefaultControllerGetBackpressure,
  writableStreamDefaultControllerAdvanceQueueIfNeeded,
  setupWritableStreamDefaultControllerFromSink,
  setupWritableStreamDefaultController,
  createWritableStream
};

