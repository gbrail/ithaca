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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
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
function _empty() {}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
function _call(body, then, direct) {
  if (direct) {
    return then ? then(body()) : body();
  }
  try {
    var result = Promise.resolve(body());
    return then ? result.then(then) : result;
  } catch (e) {
    return Promise.reject(e);
  }
}
function _callIgnored(body, direct) {
  return _call(body, _empty, direct);
}
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
var _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;
    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        var value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _for(test, update, body) {
  var stage;
  for (;;) {
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
    if (shouldContinue.then) {
      stage = 0;
      break;
    }
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.s;
      } else {
        stage = 1;
        break;
      }
    }
    if (update) {
      var updateValue = update();
      if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
        stage = 2;
        break;
      }
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    do {
      if (update) {
        updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          updateValue.then(_resumeAfterUpdate).then(void 0, reject);
          return;
        }
      }
      shouldContinue = test();
      if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
        _settle(pact, 1, result);
        return;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (_isSettledPact(result)) {
        result = result.v;
      }
    } while (!result || !result.then);
    result.then(_resumeAfterBody).then(void 0, reject);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
      } else {
        _resumeAfterBody(result);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
  function _resumeAfterUpdate() {
    if (shouldContinue = test()) {
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
      } else {
        _resumeAfterTest(shouldContinue);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayBuffer,
  ArrayBufferPrototypeGetByteLength,
  ArrayBufferPrototypeGetDetached,
  ArrayBufferPrototypeSlice,
  ArrayBufferPrototypeTransfer,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  DataView,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  MathMin,
  NumberIsInteger,
  ObjectDefineProperties,
  ObjectSetPrototypeOf,
  Promise,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  PromiseWithResolvers,
  SafePromiseAll,
  Symbol: _Symbol,
  SymbolAsyncIterator,
  SymbolDispose,
  SymbolIterator,
  SymbolToStringTag,
  TypedArrayPrototypeGetLength,
  Uint8Array
} = primordials;
var {
  AbortError,
  codes: {
    ERR_ARG_NOT_ITERABLE,
    ERR_ILLEGAL_CONSTRUCTOR,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE,
    ERR_INVALID_THIS,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var {
  DOMException
} = internalBinding('messaging');
var {
  isArrayBufferView,
  isDataView,
  isSharedArrayBuffer
} = require('internal/util/types');
var {
  customInspectSymbol: kInspect,
  kEmptyObject,
  kEnumerableProperty,
  SideEffectFreeRegExpPrototypeSymbolReplace
} = require('internal/util');
var {
  validateAbortSignal,
  validateBuffer,
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
  markTransferMode,
  structuredClone
} = require('internal/worker/js_transferable');
var {
  queueMicrotask
} = require('internal/process/task_queues');
var {
  kIsDisturbed,
  kIsErrored,
  kIsReadable,
  kIsClosedPromise,
  kControllerErrorFunction
} = require('internal/streams/utils');
var {
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
  kState,
  kType,
  lazyTransfer,
  nonOpCancel,
  nonOpPull,
  nonOpStart,
  resetQueue,
  setPromiseHandled
} = require('internal/webstreams/util');
var {
  WritableStreamDefaultWriter,
  isWritableStream,
  isWritableStreamLocked,
  isWritableStreamDefaultController,
  isWritableStreamDefaultWriter,
  writableStreamAbort,
  writableStreamCloseQueuedOrInFlight,
  writableStreamDefaultWriterCloseWithErrorPropagation,
  writableStreamDefaultWriterRelease,
  writableStreamDefaultWriterWrite
} = require('internal/webstreams/writablestream');
var {
  Buffer
} = require('buffer');
var assert = require('internal/assert');
var kCancel = _Symbol('kCancel');
var kClose = _Symbol('kClose');
var kChunk = _Symbol('kChunk');
var kError = _Symbol('kError');
var kPull = _Symbol('kPull');
var kRelease = _Symbol('kRelease');
var kSkipThrow = _Symbol('kSkipThrow');
var releasedError;
var releasingError;
var addAbortListener;
var userModuleRegExp = /^ {4}at (?:[^/\\(]+ \()(?!node:(.+):\d+:\d+\)$).*/gm;
function lazyReadableReleasedError() {
  if (releasedError) {
    return releasedError;
  }
  releasedError = new ERR_INVALID_STATE.TypeError('Reader released');
  // Avoid V8 leak and remove userland stackstrace
  releasedError.stack = SideEffectFreeRegExpPrototypeSymbolReplace(userModuleRegExp, releasedError.stack, '');
  return releasedError;
}
function lazyReadableReleasingError() {
  if (releasingError) {
    return releasingError;
  }
  releasingError = new ERR_INVALID_STATE.TypeError('Releasing reader');
  // Avoid V8 leak and remove userland stackstrace
  releasingError.stack = SideEffectFreeRegExpPrototypeSymbolReplace(userModuleRegExp, releasingError.stack, '');
  return releasingError;
}

/**
 * @typedef {import('../abort_controller').AbortSignal} AbortSignal
 * @typedef {import('./queuingstrategies').QueuingStrategy} QueuingStrategy
 * @typedef {import('./queuingstrategies').QueuingStrategySize
 * } QueuingStrategySize
 * @typedef {import('./writablestream').WritableStream} WritableStream
 */

/**
 * @typedef {ReadableStreamDefaultController | ReadableByteStreamController
 * } ReadableStreamController
 */

/**
 * @typedef {ReadableStreamDefaultReader | ReadableStreamBYOBReader
 * } ReadableStreamReader
 */

/**
 * @callback UnderlyingSourceStartCallback
 * @param {ReadableStreamController} controller
 * @returns { any | Promise<void> }
 */

/**
 * @callback UnderlyingSourcePullCallback
 * @param {ReadableStreamController} controller
 * @returns { Promise<void> }
 */

/**
 * @callback UnderlyingSourceCancelCallback
 * @param {any} reason
 * @returns { Promise<void> }
 */

/**
 * @typedef {{
 *   readable: ReadableStream,
 *   writable: WritableStream,
 * }} ReadableWritablePair
 */

/**
 * @typedef {{
 *   preventClose? : boolean,
 *   preventAbort? : boolean,
 *   preventCancel? : boolean,
 *   signal? : AbortSignal,
 * }} StreamPipeOptions
 */

/**
 * @typedef {{
 *   start? : UnderlyingSourceStartCallback,
 *   pull? : UnderlyingSourcePullCallback,
 *   cancel? : UnderlyingSourceCancelCallback,
 *   type? : "bytes",
 *   autoAllocateChunkSize? : number
 * }} UnderlyingSource
 */
var ReadableStream = /*#__PURE__*/function () {
  /**
   * @param {UnderlyingSource} [source]
   * @param {QueuingStrategy} [strategy]
   */
  function ReadableStream() {
    var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
    var strategy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, ReadableStream);
    _defineProperty(this, kType, 'ReadableStream');
    markTransferMode(this, false, true);
    validateObject(source, 'source', kValidateObjectAllowObjects);
    validateObject(strategy, 'strategy', kValidateObjectAllowObjectsAndNull);
    this[kState] = createReadableStreamState();
    this[kIsClosedPromise] = PromiseWithResolvers();
    this[kControllerErrorFunction] = () => {};

    // The spec requires handling of the strategy first
    // here. Specifically, if getting the size and
    // highWaterMark from the strategy fail, that has
    // to trigger a throw before getting the details
    // from the source. So be sure to keep these in
    // this order.
    var size = strategy?.size;
    var highWaterMark = strategy?.highWaterMark;
    var type = source.type;
    if (`${type}` === 'bytes') {
      if (size !== undefined) throw new ERR_INVALID_ARG_VALUE.RangeError('strategy.size', size);
      setupReadableByteStreamControllerFromSource(this, source, extractHighWaterMark(highWaterMark, 0));
    } else {
      if (type !== undefined) throw new ERR_INVALID_ARG_VALUE('source.type', type);
      setupReadableStreamDefaultControllerFromSource(this, source, extractHighWaterMark(highWaterMark, 1), extractSizeAlgorithm(size));
    }
  }
  return _createClass(ReadableStream, [{
    key: kIsDisturbed,
    get: function () {
      return this[kState].disturbed;
    }
  }, {
    key: kIsErrored,
    get: function () {
      return this[kState].state === 'errored';
    }
  }, {
    key: kIsReadable,
    get: function () {
      return this[kState].state === 'readable';
    }

    /**
     * @readonly
     * @type {boolean}
     */
  }, {
    key: "locked",
    get: function () {
      if (!isReadableStream(this)) throw new ERR_INVALID_THIS('ReadableStream');
      return isReadableStreamLocked(this);
    }
  }, {
    key: "cancel",
    value:
    /**
     * @param {any} [reason]
     * @returns { Promise<void> }
     */
    function cancel() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isReadableStream(this)) return PromiseReject(new ERR_INVALID_THIS('ReadableStream'));
      if (isReadableStreamLocked(this)) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('ReadableStream is locked'));
      }
      return readableStreamCancel(this, reason);
    }

    /**
     * @param {{
     *   mode? : "byob"
     * }} [options]
     * @returns {ReadableStreamReader}
     */
  }, {
    key: "getReader",
    value: function getReader() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
      if (!isReadableStream(this)) throw new ERR_INVALID_THIS('ReadableStream');
      validateObject(options, 'options', kValidateObjectAllowObjectsAndNull);
      var mode = options?.mode;
      if (mode === undefined)
        // eslint-disable-next-line no-use-before-define
        return new ReadableStreamDefaultReader(this);
      if (`${mode}` !== 'byob') throw new ERR_INVALID_ARG_VALUE('options.mode', mode);
      // eslint-disable-next-line no-use-before-define
      return new ReadableStreamBYOBReader(this);
    }

    /**
     * @param {ReadableWritablePair} transform
     * @param {StreamPipeOptions} [options]
     * @returns {ReadableStream}
     */
  }, {
    key: "pipeThrough",
    value: function pipeThrough(transform) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      if (!isReadableStream(this)) throw new ERR_INVALID_THIS('ReadableStream');
      var readable = transform?.readable;
      if (!isReadableStream(readable)) {
        throw new ERR_INVALID_ARG_TYPE('transform.readable', 'ReadableStream', readable);
      }
      var writable = transform?.writable;
      if (!isWritableStream(writable)) {
        throw new ERR_INVALID_ARG_TYPE('transform.writable', 'WritableStream', writable);
      }

      // The web platform tests require that these be handled one at a
      // time and in a specific order. options can be null or undefined.
      validateObject(options, 'options', kValidateObjectAllowObjectsAndNull);
      var preventAbort = options?.preventAbort;
      var preventCancel = options?.preventCancel;
      var preventClose = options?.preventClose;
      var signal = options?.signal;
      if (signal !== undefined) {
        validateAbortSignal(signal, 'options.signal');
      }
      if (isReadableStreamLocked(this)) throw new ERR_INVALID_STATE.TypeError('The ReadableStream is locked');
      if (isWritableStreamLocked(writable)) throw new ERR_INVALID_STATE.TypeError('The WritableStream is locked');
      var promise = readableStreamPipeTo(this, writable, !!preventClose, !!preventAbort, !!preventCancel, signal);
      setPromiseHandled(promise);
      return readable;
    }

    /**
     * @param {WritableStream} destination
     * @param {StreamPipeOptions} [options]
     * @returns {Promise<void>}
     */
  }, {
    key: "pipeTo",
    value: function pipeTo(destination) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      try {
        if (!isReadableStream(this)) throw new ERR_INVALID_THIS('ReadableStream');
        if (!isWritableStream(destination)) {
          throw new ERR_INVALID_ARG_TYPE('transform.writable', 'WritableStream', destination);
        }
        validateObject(options, 'options', kValidateObjectAllowObjectsAndNull);
        var preventAbort = options?.preventAbort;
        var preventCancel = options?.preventCancel;
        var preventClose = options?.preventClose;
        var signal = options?.signal;
        if (signal !== undefined) {
          validateAbortSignal(signal, 'options.signal');
        }
        if (isReadableStreamLocked(this)) throw new ERR_INVALID_STATE.TypeError('The ReadableStream is locked');
        if (isWritableStreamLocked(destination)) throw new ERR_INVALID_STATE.TypeError('The WritableStream is locked');
        return readableStreamPipeTo(this, destination, !!preventClose, !!preventAbort, !!preventCancel, signal);
      } catch (error) {
        return PromiseReject(error);
      }
    }

    /**
     * @returns {ReadableStream[]}
     */
  }, {
    key: "tee",
    value: function tee() {
      if (!isReadableStream(this)) throw new ERR_INVALID_THIS('ReadableStream');
      return readableStreamTee(this, false);
    }

    /**
     * @param {{
     *   preventCancel? : boolean,
     * }} [options]
     * @returns {AsyncIterable}
     */
  }, {
    key: "values",
    value: function values() {
      var returnSteps = _async(function (value) {
        var _exit = false;
        if (state.done) return {
          done: true,
          value
        }; // eslint-disable-line node-core/avoid-prototype-pollution
        state.done = true;
        if (reader[kState].stream === undefined) {
          throw new ERR_INVALID_STATE.TypeError('The reader is not bound to a ReadableStream');
        }
        assert(!reader[kState].readRequests.length);
        return _invoke(function () {
          if (!preventCancel) {
            var result = readableStreamReaderGenericCancel(reader, value);
            readableStreamReaderGenericRelease(reader);
            return _await(result, function () {
              // eslint-disable-line node-core/avoid-prototype-pollution
              var _done$value = {
                done: true,
                value
              };
              _exit = true;
              return _done$value;
            });
          }
        }, function (_result) {
          if (_exit) return _result;
          readableStreamReaderGenericRelease(reader);
          return {
            done: true,
            value
          }; // eslint-disable-line node-core/avoid-prototype-pollution
        });
      }); // TODO(@jasnell): Explore whether an async generator
      // can be used here instead of a custom iterator object.
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
      if (!isReadableStream(this)) throw new ERR_INVALID_THIS('ReadableStream');
      validateObject(options, 'options', kValidateObjectAllowObjectsAndNull);
      var preventCancel = !!options?.preventCancel;

      // eslint-disable-next-line no-use-before-define
      var reader = new ReadableStreamDefaultReader(this);

      // No __proto__ here to avoid the performance hit.
      var state = {
        done: false,
        current: undefined
      };
      var started = false;

      // The nextSteps function is not an async function in order
      // to make it more efficient. Because nextSteps explicitly
      // creates a Promise and returns it in the common case,
      // making it an async function just causes two additional
      // unnecessary Promise allocations to occur, which just add
      // cost.
      function nextSteps() {
        if (state.done) return PromiseResolve({
          done: true,
          value: undefined
        });
        if (reader[kState].stream === undefined) {
          return PromiseReject(new ERR_INVALID_STATE.TypeError('The reader is not bound to a ReadableStream'));
        }
        var promise = PromiseWithResolvers();

        // eslint-disable-next-line no-use-before-define
        readableStreamDefaultReaderRead(reader, new ReadableStreamAsyncIteratorReadRequest(reader, state, promise));
        return promise.promise;
      }
      return ObjectSetPrototypeOf({
        // Changing either of these functions (next or return)
        // to async functions causes a failure in the streams
        // Web Platform Tests that check for use of a modified
        // Promise.prototype.then. Since the await keyword
        // uses Promise.prototype.then, it is open to prototype
        // pollution, which causes the test to fail. The other
        // await uses here do not trigger that failure because
        // the test that fails does not trigger those code paths.
        next() {
          // If this is the first read, delay by one microtask
          // to ensure that the controller has had an opportunity
          // to properly start and perform the initial pull.
          // TODO(@jasnell): The spec doesn't call this out so
          // need to investigate if it's a bug in our impl or
          // the spec.
          if (!started) {
            state.current = PromiseResolve();
            started = true;
          }
          state.current = state.current !== undefined ? PromisePrototypeThen(state.current, nextSteps, nextSteps) : nextSteps();
          return state.current;
        },
        return(error) {
          started = true;
          state.current = state.current !== undefined ? PromisePrototypeThen(state.current, () => returnSteps(error), () => returnSteps(error)) : returnSteps(error);
          return state.current;
        },
        [SymbolAsyncIterator]() {
          return this;
        }
      }, AsyncIterator);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        locked: this.locked,
        state: this[kState].state,
        supportsBYOB:
        // eslint-disable-next-line no-use-before-define
        this[kState].controller instanceof ReadableByteStreamController
      });
    }
  }, {
    key: kTransfer,
    value: function () {
      if (!isReadableStream(this)) throw new ERR_INVALID_THIS('ReadableStream');
      if (this.locked) {
        this[kState].transfer.port1?.close();
        this[kState].transfer.port1 = undefined;
        this[kState].transfer.port2 = undefined;
        throw new DOMException('Cannot transfer a locked ReadableStream', 'DataCloneError');
      }
      var {
        writable,
        promise
      } = lazyTransfer().newCrossRealmWritableSink(this, this[kState].transfer.port1);
      this[kState].transfer.writable = writable;
      this[kState].transfer.promise = promise;
      return {
        data: {
          port: this[kState].transfer.port2
        },
        deserializeInfo: 'internal/webstreams/readablestream:TransferredReadableStream'
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
      setupReadableStreamDefaultControllerFromSource(this,
      // The MessagePort is set to be referenced when reading.
      // After two MessagePorts are closed, there is a problem with
      // lingering promise not being properly resolved.
      // https://github.com/nodejs/node/issues/51486
      new transfer.CrossRealmTransformReadableSource(port, true), 0, () => 1);
    }
  }], [{
    key: "from",
    value: function from(iterable) {
      return readableStreamFromIterable(iterable);
    }
  }]);
}();
ObjectDefineProperties(ReadableStream.prototype, {
  [SymbolAsyncIterator]: {
    __proto__: null,
    configurable: true,
    enumerable: false,
    writable: true,
    value: ReadableStream.prototype.values
  },
  locked: kEnumerableProperty,
  cancel: kEnumerableProperty,
  getReader: kEnumerableProperty,
  pipeThrough: kEnumerableProperty,
  pipeTo: kEnumerableProperty,
  tee: kEnumerableProperty,
  values: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(ReadableStream.name)
});
ObjectDefineProperties(ReadableStream, {
  from: kEnumerableProperty
});
function InternalTransferredReadableStream() {
  ObjectSetPrototypeOf(this, ReadableStream.prototype);
  markTransferMode(this, false, true);
  this[kType] = 'ReadableStream';
  this[kState] = createReadableStreamState();
  this[kIsClosedPromise] = PromiseWithResolvers();
}
ObjectSetPrototypeOf(InternalTransferredReadableStream.prototype, ReadableStream.prototype);
ObjectSetPrototypeOf(InternalTransferredReadableStream, ReadableStream);
function TransferredReadableStream() {
  var stream = new InternalTransferredReadableStream();
  stream.constructor = ReadableStream;
  return stream;
}
TransferredReadableStream.prototype[kDeserialize] = () => {};
var ReadableStreamBYOBRequest = /*#__PURE__*/function () {
  function ReadableStreamBYOBRequest() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, ReadableStreamBYOBRequest);
    _defineProperty(this, kType, 'ReadableStreamBYOBRequest');
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
  }

  /**
   * @readonly
   * @type {Uint8Array}
   */
  return _createClass(ReadableStreamBYOBRequest, [{
    key: "view",
    get: function () {
      if (!isReadableStreamBYOBRequest(this)) throw new ERR_INVALID_THIS('ReadableStreamBYOBRequest');
      return this[kState].view;
    }

    /**
     * @param {number} bytesWritten
     */
  }, {
    key: "respond",
    value: function respond(bytesWritten) {
      if (!isReadableStreamBYOBRequest(this)) throw new ERR_INVALID_THIS('ReadableStreamBYOBRequest');
      var {
        view,
        controller
      } = this[kState];
      if (controller === undefined) {
        throw new ERR_INVALID_STATE.TypeError('This BYOB request has been invalidated');
      }
      var viewByteLength = ArrayBufferViewGetByteLength(view);
      var viewBuffer = ArrayBufferViewGetBuffer(view);
      var viewBufferByteLength = ArrayBufferPrototypeGetByteLength(viewBuffer);
      if (ArrayBufferPrototypeGetDetached(viewBuffer)) {
        throw new ERR_INVALID_STATE.TypeError('Viewed ArrayBuffer is detached');
      }
      assert(viewByteLength > 0);
      assert(viewBufferByteLength > 0);
      readableByteStreamControllerRespond(controller, bytesWritten);
    }

    /**
     * @param {ArrayBufferView} view
     */
  }, {
    key: "respondWithNewView",
    value: function respondWithNewView(view) {
      if (!isReadableStreamBYOBRequest(this)) throw new ERR_INVALID_THIS('ReadableStreamBYOBRequest');
      var {
        controller
      } = this[kState];
      if (controller === undefined) {
        throw new ERR_INVALID_STATE.TypeError('This BYOB request has been invalidated');
      }
      validateBuffer(view, 'view');
      if (ArrayBufferPrototypeGetDetached(view.buffer)) {
        throw new ERR_INVALID_STATE.TypeError('Viewed ArrayBuffer is detached');
      }
      readableByteStreamControllerRespondWithNewView(controller, view);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        view: this.view,
        controller: this[kState].controller
      });
    }
  }]);
}();
ObjectDefineProperties(ReadableStreamBYOBRequest.prototype, {
  view: kEnumerableProperty,
  respond: kEnumerableProperty,
  respondWithNewView: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(ReadableStreamBYOBRequest.name)
});
function createReadableStreamBYOBRequest(controller, view) {
  var stream = new ReadableStreamBYOBRequest(kSkipThrow);
  stream[kState] = {
    controller,
    view
  };
  return stream;
}
var ReadableStreamAsyncIteratorReadRequest = /*#__PURE__*/function () {
  function ReadableStreamAsyncIteratorReadRequest(reader, state, promise) {
    _classCallCheck(this, ReadableStreamAsyncIteratorReadRequest);
    this.reader = reader;
    this.state = state;
    this.promise = promise;
  }
  return _createClass(ReadableStreamAsyncIteratorReadRequest, [{
    key: kChunk,
    value: function (chunk) {
      this.state.current = undefined;
      this.promise.resolve({
        done: false,
        value: chunk
      });
    }
  }, {
    key: kClose,
    value: function () {
      this.state.current = undefined;
      this.state.done = true;
      readableStreamReaderGenericRelease(this.reader);
      this.promise.resolve({
        done: true,
        value: undefined
      });
    }
  }, {
    key: kError,
    value: function (error) {
      this.state.current = undefined;
      this.state.done = true;
      readableStreamReaderGenericRelease(this.reader);
      this.promise.reject(error);
    }
  }]);
}();
var DefaultReadRequest = /*#__PURE__*/function () {
  function DefaultReadRequest() {
    _classCallCheck(this, DefaultReadRequest);
    this[kState] = PromiseWithResolvers();
  }
  return _createClass(DefaultReadRequest, [{
    key: kChunk,
    value: function (value) {
      this[kState].resolve?.({
        done: false,
        value
      });
    }
  }, {
    key: kClose,
    value: function () {
      this[kState].resolve?.({
        done: true,
        value: undefined
      });
    }
  }, {
    key: kError,
    value: function (error) {
      this[kState].reject?.(error);
    }
  }, {
    key: "promise",
    get: function () {
      return this[kState].promise;
    }
  }]);
}();
var ReadIntoRequest = /*#__PURE__*/function () {
  function ReadIntoRequest() {
    _classCallCheck(this, ReadIntoRequest);
    this[kState] = PromiseWithResolvers();
  }
  return _createClass(ReadIntoRequest, [{
    key: kChunk,
    value: function (value) {
      this[kState].resolve?.({
        done: false,
        value
      });
    }
  }, {
    key: kClose,
    value: function (value) {
      this[kState].resolve?.({
        done: true,
        value
      });
    }
  }, {
    key: kError,
    value: function (error) {
      this[kState].reject?.(error);
    }
  }, {
    key: "promise",
    get: function () {
      return this[kState].promise;
    }
  }]);
}();
var ReadableStreamDefaultReader = /*#__PURE__*/function () {
  /**
   * @param {ReadableStream} stream
   */
  function ReadableStreamDefaultReader(stream) {
    _classCallCheck(this, ReadableStreamDefaultReader);
    _defineProperty(this, kType, 'ReadableStreamDefaultReader');
    if (!isReadableStream(stream)) throw new ERR_INVALID_ARG_TYPE('stream', 'ReadableStream', stream);
    this[kState] = {
      readRequests: [],
      stream: undefined,
      close: {
        promise: undefined,
        resolve: undefined,
        reject: undefined
      }
    };
    setupReadableStreamDefaultReader(this, stream);
  }

  /**
   * @returns {Promise<{
   *   value : any,
   *   done : boolean
   * }>}
   */
  return _createClass(ReadableStreamDefaultReader, [{
    key: "read",
    value: function read() {
      if (!isReadableStreamDefaultReader(this)) return PromiseReject(new ERR_INVALID_THIS('ReadableStreamDefaultReader'));
      if (this[kState].stream === undefined) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('The reader is not attached to a stream'));
      }
      var stream = this[kState].stream;
      var controller = stream[kState].controller;

      // Fast path: if data is already buffered in a default controller,
      // return a resolved promise immediately without creating a read request.
      // This is spec-compliant because read() returns a Promise, and
      // Promise.resolve() callbacks still run in the microtask queue.
      if (stream[kState].state === 'readable' && isReadableStreamDefaultController(controller) && controller[kState].queue.length > 0) {
        stream[kState].disturbed = true;
        var chunk = dequeueValue(controller);
        if (controller[kState].closeRequested && !controller[kState].queue.length) {
          readableStreamDefaultControllerClearAlgorithms(controller);
          readableStreamClose(stream);
        } else {
          readableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        return PromiseResolve({
          done: false,
          value: chunk
        });
      }

      // Slow path: create request and go through normal flow
      var readRequest = new DefaultReadRequest();
      readableStreamDefaultReaderRead(this, readRequest);
      return readRequest.promise;
    }
  }, {
    key: "releaseLock",
    value: function releaseLock() {
      if (!isReadableStreamDefaultReader(this)) throw new ERR_INVALID_THIS('ReadableStreamDefaultReader');
      if (this[kState].stream === undefined) return;
      readableStreamDefaultReaderRelease(this);
    }

    /**
     * @readonly
     * @type {Promise<void>}
     */
  }, {
    key: "closed",
    get: function () {
      if (!isReadableStreamDefaultReader(this)) return PromiseReject(new ERR_INVALID_THIS('ReadableStreamDefaultReader'));
      return this[kState].close.promise;
    }

    /**
     * @param {any} [reason]
     * @returns {Promise<void>}
     */
  }, {
    key: "cancel",
    value: function cancel() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isReadableStreamDefaultReader(this)) return PromiseReject(new ERR_INVALID_THIS('ReadableStreamDefaultReader'));
      if (this[kState].stream === undefined) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('The reader is not attached to a stream'));
      }
      return readableStreamReaderGenericCancel(this, reason);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        stream: this[kState].stream,
        readRequests: this[kState].readRequests.length,
        close: this[kState].close.promise
      });
    }
  }]);
}();
ObjectDefineProperties(ReadableStreamDefaultReader.prototype, {
  closed: kEnumerableProperty,
  read: kEnumerableProperty,
  releaseLock: kEnumerableProperty,
  cancel: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(ReadableStreamDefaultReader.name)
});
var ReadableStreamBYOBReader = /*#__PURE__*/function () {
  /**
   * @param {ReadableStream} stream
   */
  function ReadableStreamBYOBReader(stream) {
    _classCallCheck(this, ReadableStreamBYOBReader);
    _defineProperty(this, kType, 'ReadableStreamBYOBReader');
    if (!isReadableStream(stream)) throw new ERR_INVALID_ARG_TYPE('stream', 'ReadableStream', stream);
    this[kState] = {
      stream: undefined,
      readIntoRequests: [],
      close: {
        promise: undefined,
        resolve: undefined,
        reject: undefined
      }
    };
    setupReadableStreamBYOBReader(this, stream);
  }

  /**
   * @param {ArrayBufferView} view
   * @param {{
   *   min? : number
   * }} [options]
   * @returns {Promise<{
   *   value : ArrayBufferView,
   *   done : boolean,
   * }>}
   */
  return _createClass(ReadableStreamBYOBReader, [{
    key: "read",
    value: function read(view) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
      try {
        var _this = this;
        if (!isReadableStreamBYOBReader(_this)) throw new ERR_INVALID_THIS('ReadableStreamBYOBReader');
        if (!isArrayBufferView(view)) {
          throw new ERR_INVALID_ARG_TYPE('view', ['Buffer', 'TypedArray', 'DataView'], view);
        }
        validateObject(options, 'options', kValidateObjectAllowObjectsAndNull);
        var viewByteLength = ArrayBufferViewGetByteLength(view);
        var viewBuffer = ArrayBufferViewGetBuffer(view);
        if (isSharedArrayBuffer(viewBuffer)) {
          throw new ERR_INVALID_ARG_VALUE('view', view, 'must not be backed by a SharedArrayBuffer');
        }
        var viewBufferByteLength = ArrayBufferPrototypeGetByteLength(viewBuffer);
        if (viewByteLength === 0 || viewBufferByteLength === 0) {
          throw new ERR_INVALID_STATE.TypeError('View or Viewed ArrayBuffer is zero-length or detached');
        }

        // Supposed to assert here that the view's buffer is not
        // detached, but there's no API available to use to check that.

        var min = options?.min ?? 1;
        if (typeof min !== 'number') throw new ERR_INVALID_ARG_TYPE('options.min', 'number', min);
        if (!NumberIsInteger(min)) throw new ERR_INVALID_ARG_VALUE('options.min', min, 'must be an integer');
        if (min <= 0) throw new ERR_INVALID_ARG_VALUE('options.min', min, 'must be greater than 0');
        if (!isDataView(view)) {
          if (min > TypedArrayPrototypeGetLength(view)) {
            throw new ERR_OUT_OF_RANGE('options.min', '<= view.length', min);
          }
        } else if (min > viewByteLength) {
          throw new ERR_OUT_OF_RANGE('options.min', '<= view.byteLength', min);
        }
        if (_this[kState].stream === undefined) {
          throw new ERR_INVALID_STATE.TypeError('The reader is not attached to a stream');
        }
        var readIntoRequest = new ReadIntoRequest();
        readableStreamBYOBReaderRead(_this, view, min, readIntoRequest);
        return _await(readIntoRequest.promise);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "releaseLock",
    value: function releaseLock() {
      if (!isReadableStreamBYOBReader(this)) throw new ERR_INVALID_THIS('ReadableStreamBYOBReader');
      if (this[kState].stream === undefined) return;
      readableStreamBYOBReaderRelease(this);
    }

    /**
     * @readonly
     * @type {Promise<void>}
     */
  }, {
    key: "closed",
    get: function () {
      if (!isReadableStreamBYOBReader(this)) return PromiseReject(new ERR_INVALID_THIS('ReadableStreamBYOBReader'));
      return this[kState].close.promise;
    }

    /**
     * @param {any} [reason]
     * @returns {Promise<void>}
     */
  }, {
    key: "cancel",
    value: function cancel() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isReadableStreamBYOBReader(this)) return PromiseReject(new ERR_INVALID_THIS('ReadableStreamBYOBReader'));
      if (this[kState].stream === undefined) {
        return PromiseReject(new ERR_INVALID_STATE.TypeError('The reader is not attached to a stream'));
      }
      return readableStreamReaderGenericCancel(this, reason);
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {
        stream: this[kState].stream,
        readIntoRequests: this[kState].readIntoRequests.length,
        close: this[kState].close.promise
      });
    }
  }]);
}();
ObjectDefineProperties(ReadableStreamBYOBReader.prototype, {
  closed: kEnumerableProperty,
  read: kEnumerableProperty,
  releaseLock: kEnumerableProperty,
  cancel: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(ReadableStreamBYOBReader.name)
});
var ReadableStreamDefaultController = /*#__PURE__*/function () {
  function ReadableStreamDefaultController() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, ReadableStreamDefaultController);
    _defineProperty(this, kType, 'ReadableStreamDefaultController');
    _defineProperty(this, kState, {});
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
  }

  /**
   * @readonly
   * @type {number}
   */
  return _createClass(ReadableStreamDefaultController, [{
    key: "desiredSize",
    get: function () {
      return readableStreamDefaultControllerGetDesiredSize(this);
    }
  }, {
    key: "close",
    value: function close() {
      if (!readableStreamDefaultControllerCanCloseOrEnqueue(this)) throw new ERR_INVALID_STATE.TypeError('Controller is already closed');
      readableStreamDefaultControllerClose(this);
    }

    /**
     * @param {any} [chunk]
     */
  }, {
    key: "enqueue",
    value: function enqueue() {
      var chunk = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!readableStreamDefaultControllerCanCloseOrEnqueue(this)) throw new ERR_INVALID_STATE.TypeError('Controller is already closed');
      readableStreamDefaultControllerEnqueue(this, chunk);
    }

    /**
     * @param {any} [error]
     */
  }, {
    key: "error",
    value: function error() {
      var _error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      readableStreamDefaultControllerError(this, _error);
    }
  }, {
    key: kCancel,
    value: function (reason) {
      return readableStreamDefaultControllerCancelSteps(this, reason);
    }
  }, {
    key: kPull,
    value: function (readRequest) {
      readableStreamDefaultControllerPullSteps(this, readRequest);
    }
  }, {
    key: kRelease,
    value: function () {}
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {});
    }
  }]);
}();
ObjectDefineProperties(ReadableStreamDefaultController.prototype, {
  desiredSize: kEnumerableProperty,
  close: kEnumerableProperty,
  enqueue: kEnumerableProperty,
  error: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(ReadableStreamDefaultController.name)
});
var ReadableByteStreamController = /*#__PURE__*/function () {
  function ReadableByteStreamController() {
    var skipThrowSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, ReadableByteStreamController);
    _defineProperty(this, kType, 'ReadableByteStreamController');
    _defineProperty(this, kState, {});
    if (skipThrowSymbol !== kSkipThrow) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
  }

  /**
   * @readonly
   * @type {ReadableStreamBYOBRequest}
   */
  return _createClass(ReadableByteStreamController, [{
    key: "byobRequest",
    get: function () {
      if (!isReadableByteStreamController(this)) throw new ERR_INVALID_THIS('ReadableByteStreamController');
      if (this[kState].byobRequest === null && this[kState].pendingPullIntos.length) {
        var {
          buffer,
          byteOffset,
          bytesFilled,
          byteLength
        } = this[kState].pendingPullIntos[0];
        var view = new Uint8Array(buffer, byteOffset + bytesFilled, byteLength - bytesFilled);
        this[kState].byobRequest = createReadableStreamBYOBRequest(this, view);
      }
      return this[kState].byobRequest;
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "desiredSize",
    get: function () {
      if (!isReadableByteStreamController(this)) throw new ERR_INVALID_THIS('ReadableByteStreamController');
      return readableByteStreamControllerGetDesiredSize(this);
    }
  }, {
    key: "close",
    value: function close() {
      if (!isReadableByteStreamController(this)) throw new ERR_INVALID_THIS('ReadableByteStreamController');
      if (this[kState].closeRequested) throw new ERR_INVALID_STATE.TypeError('Controller is already closed');
      if (this[kState].stream[kState].state !== 'readable') throw new ERR_INVALID_STATE.TypeError('ReadableStream is already closed');
      readableByteStreamControllerClose(this);
    }

    /**
     * @param {ArrayBufferView} chunk
     */
  }, {
    key: "enqueue",
    value: function enqueue(chunk) {
      if (!isReadableByteStreamController(this)) throw new ERR_INVALID_THIS('ReadableByteStreamController');
      validateBuffer(chunk);
      var chunkByteLength = ArrayBufferViewGetByteLength(chunk);
      var chunkBuffer = ArrayBufferViewGetBuffer(chunk);
      if (isSharedArrayBuffer(chunkBuffer)) {
        throw new ERR_INVALID_ARG_VALUE('chunk', chunk, 'must not be backed by a SharedArrayBuffer');
      }
      var chunkBufferByteLength = ArrayBufferPrototypeGetByteLength(chunkBuffer);
      if (chunkByteLength === 0 || chunkBufferByteLength === 0) {
        throw new ERR_INVALID_STATE.TypeError('chunk ArrayBuffer is zero-length or detached');
      }
      if (this[kState].closeRequested) throw new ERR_INVALID_STATE.TypeError('Controller is already closed');
      if (this[kState].stream[kState].state !== 'readable') throw new ERR_INVALID_STATE.TypeError('ReadableStream is already closed');
      readableByteStreamControllerEnqueue(this, chunk);
    }

    /**
     * @param {any} [error]
     */
  }, {
    key: "error",
    value: function error() {
      var _error2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (!isReadableByteStreamController(this)) throw new ERR_INVALID_THIS('ReadableByteStreamController');
      readableByteStreamControllerError(this, _error2);
    }
  }, {
    key: kCancel,
    value: function (reason) {
      return readableByteStreamControllerCancelSteps(this, reason);
    }
  }, {
    key: kPull,
    value: function (readRequest) {
      readableByteStreamControllerPullSteps(this, readRequest);
    }
  }, {
    key: kRelease,
    value: function () {
      var {
        pendingPullIntos
      } = this[kState];
      if (pendingPullIntos.length > 0) {
        var firstPendingPullInto = pendingPullIntos[0];
        firstPendingPullInto.type = 'none';
        this[kState].pendingPullIntos = [firstPendingPullInto];
      }
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      return customInspect(depth, options, this[kType], {});
    }
  }]);
}();
ObjectDefineProperties(ReadableByteStreamController.prototype, {
  byobRequest: kEnumerableProperty,
  desiredSize: kEnumerableProperty,
  close: kEnumerableProperty,
  enqueue: kEnumerableProperty,
  error: kEnumerableProperty,
  [SymbolToStringTag]: getNonWritablePropertyDescriptor(ReadableByteStreamController.name)
});
function InternalReadableStream(start, pull, cancel, highWaterMark, size) {
  ObjectSetPrototypeOf(this, ReadableStream.prototype);
  markTransferMode(this, false, true);
  this[kType] = 'ReadableStream';
  this[kState] = createReadableStreamState();
  this[kIsClosedPromise] = PromiseWithResolvers();
  var controller = new ReadableStreamDefaultController(kSkipThrow);
  setupReadableStreamDefaultController(this, controller, start, pull, cancel, highWaterMark, size);
}
ObjectSetPrototypeOf(InternalReadableStream.prototype, ReadableStream.prototype);
ObjectSetPrototypeOf(InternalReadableStream, ReadableStream);
function createReadableStream(start, pull, cancel) {
  var highWaterMark = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  var size = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : () => 1;
  var stream = new InternalReadableStream(start, pull, cancel, highWaterMark, size);

  // For spec compliance the InternalReadableStream must be a ReadableStream
  stream.constructor = ReadableStream;
  return stream;
}
function InternalReadableByteStream(start, pull, cancel) {
  ObjectSetPrototypeOf(this, ReadableStream.prototype);
  markTransferMode(this, false, true);
  this[kType] = 'ReadableStream';
  this[kState] = createReadableStreamState();
  this[kIsClosedPromise] = PromiseWithResolvers();
  var controller = new ReadableByteStreamController(kSkipThrow);
  setupReadableByteStreamController(this, controller, start, pull, cancel, 0, undefined);
}
ObjectSetPrototypeOf(InternalReadableByteStream.prototype, ReadableStream.prototype);
ObjectSetPrototypeOf(InternalReadableByteStream, ReadableStream);
function createReadableByteStream(start, pull, cancel) {
  var stream = new InternalReadableByteStream(start, pull, cancel);

  // For spec compliance the InternalReadableByteStream must be a ReadableStream
  stream.constructor = ReadableStream;
  return stream;
}
var isReadableStream = isBrandCheck('ReadableStream');
var isReadableByteStreamController = isBrandCheck('ReadableByteStreamController');
var isReadableStreamDefaultController = isBrandCheck('ReadableStreamDefaultController');
var isReadableStreamBYOBRequest = isBrandCheck('ReadableStreamBYOBRequest');
var isReadableStreamDefaultReader = isBrandCheck('ReadableStreamDefaultReader');
var isReadableStreamBYOBReader = isBrandCheck('ReadableStreamBYOBReader');

// ---- ReadableStream Implementation

function createReadableStreamState() {
  return {
    __proto__: null,
    disturbed: false,
    reader: undefined,
    state: 'readable',
    storedError: undefined,
    transfer: {
      __proto__: null,
      writable: undefined,
      port1: undefined,
      port2: undefined,
      promise: undefined
    }
  };
}
function readableStreamFromIterable(iterable) {
  var cancelAlgorithm = _async(function (reason) {
    var returnMethod = iterator.return;
    if (returnMethod === undefined) {
      return;
    }
    return _await(FunctionPrototypeCall(returnMethod, iterator, reason), function (iterResult) {
      if (typeof iterResult !== 'object' || iterResult === null) {
        throw new ERR_INVALID_STATE.TypeError('The promise returned by the iterator.return() method must fulfill with an object');
      }
    });
  });
  var pullAlgorithm = _async(function () {
    return _await(iterator.next(), function (iterResult) {
      if (typeof iterResult !== 'object' || iterResult === null) {
        throw new ERR_INVALID_STATE.TypeError('The promise returned by the iterator.next() method must fulfill with an object');
      }
      return _invokeIgnored(function () {
        if (iterResult.done) {
          readableStreamDefaultControllerClose(stream[kState].controller);
        } else {
          var _stream$kState$contro = stream[kState].controller;
          return _await(iterResult.value, function (_iterResult$value) {
            readableStreamDefaultControllerEnqueue(_stream$kState$contro, _iterResult$value);
          });
        }
      });
    });
  });
  var stream;
  var iteratorGetter = iterable[SymbolAsyncIterator] ?? iterable[SymbolIterator];
  if (iteratorGetter == null || typeof iteratorGetter !== 'function') {
    throw new ERR_ARG_NOT_ITERABLE(iterable);
  }
  var iterator = FunctionPrototypeCall(iteratorGetter, iterable);
  if (iterator === null || typeof iterator !== 'object' && typeof iterator !== 'function') {
    throw new ERR_INVALID_STATE.TypeError('The iterator method must return an object');
  }
  var startAlgorithm = nonOpStart;
  stream = createReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, 0);
  return stream;
}
function readableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
  var run = _async(function () {
    // Run until step resolves as true
    return _continueIgnored(_for(function () {
      return _call(step, function (_step) {
        return !_step;
      });
    }, void 0, function () {
      ;
    }));
  });
  var step = _async(function () {
    var _exit2 = false;
    return shuttingDown ? true : _invoke(function () {
      if (dest[kState].backpressure) {
        return _await(writer[kState].ready.promise, function () {
          if (shuttingDown) {
            _exit2 = true;
            return true;
          }
        });
      }
    }, function (_result2) {
      if (_exit2) return _result2;
      var controller = source[kState].controller;

      // Fast path: batch reads when data is buffered in a default controller.
      // This avoids creating PipeToReadableStreamReadRequest objects and
      // reduces promise allocation overhead.
      // Slow path: use read request for async reads
      // eslint-disable-next-line no-use-before-define
      if (source[kState].state === 'readable' && isReadableStreamDefaultController(controller) && controller[kState].queue.length > 0) {
        while (controller[kState].queue.length > 0) {
          if (shuttingDown) return true;
          var chunk = dequeueValue(controller);
          if (controller[kState].closeRequested && !controller[kState].queue.length) {
            readableStreamDefaultControllerClearAlgorithms(controller);
            readableStreamClose(source);
          }

          // Write the chunk - we're already in a separate microtask from enqueue
          // because we awaited writer[kState].ready.promise above
          state.currentWrite = writableStreamDefaultWriterWrite(writer, chunk);
          setPromiseHandled(state.currentWrite);

          // Check backpressure after each write
          if (dest[kState].backpressure) {
            // Backpressure - stop batch and wait for ready
            break;
          } else if (dest[kState].state !== 'writable' || writableStreamCloseQueuedOrInFlight(dest)) {
            // Closing or erroring - stop batch and wait for shutdown
            break;
          }
        }

        // Trigger pull if needed after batch
        readableStreamDefaultControllerCallPullIfNeeded(controller);

        // Check if stream closed during batch
        if (source[kState].state === 'closed') {
          return true;
        }

        // Yield to microtask queue between batches to allow events/signals to fire
        return false;
      }
      var promise = PromiseWithResolvers();
      readableStreamDefaultReaderRead(reader, new PipeToReadableStreamReadRequest(writer, state, promise));
      return promise.promise;
    });
  });
  var waitForCurrentWrite = _async(function () {
    var write = state.currentWrite;
    return _await(write, function () {
      return _invokeIgnored(function () {
        if (write !== state.currentWrite) return _callIgnored(waitForCurrentWrite);
      });
    });
  });
  var reader;
  var writer;
  var disposable;
  // Both of these can throw synchronously. We want to capture
  // the error and return a rejected promise instead.
  try {
    reader = new ReadableStreamDefaultReader(source);
    writer = new WritableStreamDefaultWriter(dest);
  } catch (error) {
    return PromiseReject(error);
  }
  source[kState].disturbed = true;
  var shuttingDown = false;
  if (signal !== undefined) {
    try {
      validateAbortSignal(signal, 'options.signal');
    } catch (error) {
      return PromiseReject(error);
    }
  }
  var promise = PromiseWithResolvers();
  var state = {
    currentWrite: PromiseResolve()
  };

  // The error here can be undefined. The rejected arg
  // tells us that the promise must be rejected even
  // when error is undefine.
  function finalize(rejected, error) {
    writableStreamDefaultWriterRelease(writer);
    readableStreamReaderGenericRelease(reader);
    if (signal !== undefined) disposable?.[SymbolDispose]();
    if (rejected) promise.reject(error);else promise.resolve();
  }
  function shutdownWithAnAction(action, rejected, originalError) {
    if (shuttingDown) return;
    shuttingDown = true;
    if (dest[kState].state === 'writable' && !writableStreamCloseQueuedOrInFlight(dest)) {
      PromisePrototypeThen(waitForCurrentWrite(), complete, error => finalize(true, error));
      return;
    }
    complete();
    function complete() {
      PromisePrototypeThen(action(), () => finalize(rejected, originalError), error => finalize(true, error));
    }
  }
  function shutdown(rejected, error) {
    if (shuttingDown) return;
    shuttingDown = true;
    if (dest[kState].state === 'writable' && !writableStreamCloseQueuedOrInFlight(dest)) {
      PromisePrototypeThen(waitForCurrentWrite(), () => finalize(rejected, error), error => finalize(true, error));
      return;
    }
    finalize(rejected, error);
  }
  function abortAlgorithm() {
    var error;
    if (signal.reason instanceof AbortError) {
      // Cannot use the AbortError class here. It must be a DOMException.
      error = new DOMException(signal.reason.message, 'AbortError');
    } else {
      error = signal.reason;
    }
    var actions = [];
    if (!preventAbort) {
      ArrayPrototypePush(actions, () => {
        if (dest[kState].state === 'writable') return writableStreamAbort(dest, error);
        return PromiseResolve();
      });
    }
    if (!preventCancel) {
      ArrayPrototypePush(actions, () => {
        if (source[kState].state === 'readable') return readableStreamCancel(source, error);
        return PromiseResolve();
      });
    }
    shutdownWithAnAction(() => SafePromiseAll(actions, action => action()), true, error);
  }
  function watchErrored(stream, promise, action) {
    if (stream[kState].state === 'errored') action(stream[kState].storedError);else PromisePrototypeThen(promise, undefined, action);
  }
  function watchClosed(stream, promise, action) {
    if (stream[kState].state === 'closed') action();else PromisePrototypeThen(promise, action, () => {});
  }
  if (signal !== undefined) {
    if (signal.aborted) {
      abortAlgorithm();
      return promise.promise;
    }
    addAbortListener ??= require('internal/events/abort_listener').addAbortListener;
    disposable = addAbortListener(signal, abortAlgorithm);
  }
  setPromiseHandled(run());
  watchErrored(source, reader[kState].close.promise, error => {
    if (!preventAbort) {
      return shutdownWithAnAction(() => writableStreamAbort(dest, error), true, error);
    }
    shutdown(true, error);
  });
  watchErrored(dest, writer[kState].close.promise, error => {
    if (!preventCancel) {
      return shutdownWithAnAction(() => readableStreamCancel(source, error), true, error);
    }
    shutdown(true, error);
  });
  watchClosed(source, reader[kState].close.promise, () => {
    if (!preventClose) {
      return shutdownWithAnAction(() => writableStreamDefaultWriterCloseWithErrorPropagation(writer));
    }
    shutdown();
  });
  if (writableStreamCloseQueuedOrInFlight(dest) || dest[kState].state === 'closed') {
    var error = new ERR_INVALID_STATE.TypeError('Destination WritableStream is closed');
    if (!preventCancel) {
      shutdownWithAnAction(() => readableStreamCancel(source, error), true, error);
    } else {
      shutdown(true, error);
    }
  }
  return promise.promise;
}
var PipeToReadableStreamReadRequest = /*#__PURE__*/function () {
  function PipeToReadableStreamReadRequest(writer, state, promise) {
    _classCallCheck(this, PipeToReadableStreamReadRequest);
    this.writer = writer;
    this.state = state;
    this.promise = promise;
  }
  return _createClass(PipeToReadableStreamReadRequest, [{
    key: kChunk,
    value: function (chunk) {
      // Per spec, pipeTo must queue a microtask for the write to avoid
      // synchronous write during enqueue(). See WHATWG Streams spec
      // "ReadableStreamPipeTo" step 15's "chunk steps".
      queueMicrotask(() => {
        this.state.currentWrite = writableStreamDefaultWriterWrite(this.writer, chunk);
        setPromiseHandled(this.state.currentWrite);
        this.promise.resolve(false);
      });
    }
  }, {
    key: kClose,
    value: function () {
      this.promise.resolve(true);
    }
  }, {
    key: kError,
    value: function (error) {
      this.promise.reject(error);
    }
  }]);
}();
function readableStreamTee(stream, cloneForBranch2) {
  if (isReadableByteStreamController(stream[kState].controller)) {
    return readableByteStreamTee(stream);
  }
  return readableStreamDefaultTee(stream, cloneForBranch2);
}
function readableStreamDefaultTee(stream, cloneForBranch2) {
  var pullAlgorithm = _async(function () {
    if (reading) return;
    reading = true;
    var readRequest = {
      [kChunk](value) {
        queueMicrotask(() => {
          reading = false;
          var value1 = value;
          var value2 = value;
          if (!canceled2 && cloneForBranch2) {
            value2 = structuredClone(value2);
          }
          if (!canceled1) {
            readableStreamDefaultControllerEnqueue(branch1[kState].controller, value1);
          }
          if (!canceled2) {
            readableStreamDefaultControllerEnqueue(branch2[kState].controller, value2);
          }
        });
      },
      [kClose]() {
        // The `process.nextTick()` is not part of the spec.
        // This approach was needed to avoid a race condition working with esm
        // Further information, see: https://github.com/nodejs/node/issues/39758
        process.nextTick(() => {
          reading = false;
          if (!canceled1) readableStreamDefaultControllerClose(branch1[kState].controller);
          if (!canceled2) readableStreamDefaultControllerClose(branch2[kState].controller);
          if (!canceled1 || !canceled2) cancelPromise.resolve();
        });
      },
      [kError]() {
        reading = false;
      }
    };
    readableStreamDefaultReaderRead(reader, readRequest);
    return _await();
  });
  var reader = new ReadableStreamDefaultReader(stream);
  var reading = false;
  var canceled1 = false;
  var canceled2 = false;
  var reason1;
  var reason2;
  var branch1;
  var branch2;
  var cancelPromise = PromiseWithResolvers();
  function cancel1Algorithm(reason) {
    canceled1 = true;
    reason1 = reason;
    if (canceled2) {
      var compositeReason = [reason1, reason2];
      cancelPromise.resolve(readableStreamCancel(stream, compositeReason));
    }
    return cancelPromise.promise;
  }
  function cancel2Algorithm(reason) {
    canceled2 = true;
    reason2 = reason;
    if (canceled1) {
      var compositeReason = [reason1, reason2];
      cancelPromise.resolve(readableStreamCancel(stream, compositeReason));
    }
    return cancelPromise.promise;
  }
  branch1 = createReadableStream(nonOpStart, pullAlgorithm, cancel1Algorithm);
  branch2 = createReadableStream(nonOpStart, pullAlgorithm, cancel2Algorithm);
  PromisePrototypeThen(reader[kState].close.promise, undefined, error => {
    readableStreamDefaultControllerError(branch1[kState].controller, error);
    readableStreamDefaultControllerError(branch2[kState].controller, error);
    if (!canceled1 || !canceled2) cancelPromise.resolve();
  });
  return [branch1, branch2];
}
function readableByteStreamTee(stream) {
  assert(isReadableStream(stream));
  assert(isReadableByteStreamController(stream[kState].controller));
  var reader = new ReadableStreamDefaultReader(stream);
  var reading = false;
  var readAgainForBranch1 = false;
  var readAgainForBranch2 = false;
  var canceled1 = false;
  var canceled2 = false;
  var reason1;
  var reason2;
  var branch1;
  var branch2;
  var cancelDeferred = PromiseWithResolvers();
  function forwardReaderError(thisReader) {
    PromisePrototypeThen(thisReader[kState].close.promise, undefined, error => {
      if (thisReader !== reader) {
        return;
      }
      readableStreamDefaultControllerError(branch1[kState].controller, error);
      readableStreamDefaultControllerError(branch2[kState].controller, error);
      if (!canceled1 || !canceled2) {
        cancelDeferred.resolve();
      }
    });
  }
  function pullWithDefaultReader() {
    if (isReadableStreamBYOBReader(reader)) {
      readableStreamBYOBReaderRelease(reader);
      reader = new ReadableStreamDefaultReader(stream);
      forwardReaderError(reader);
    }
    var readRequest = {
      [kChunk](chunk) {
        queueMicrotask(() => {
          readAgainForBranch1 = false;
          readAgainForBranch2 = false;
          var chunk1 = chunk;
          var chunk2 = chunk;
          if (!canceled1 && !canceled2) {
            try {
              chunk2 = cloneAsUint8Array(chunk);
            } catch (error) {
              readableByteStreamControllerError(branch1[kState].controller, error);
              readableByteStreamControllerError(branch2[kState].controller, error);
              cancelDeferred.resolve(readableStreamCancel(stream, error));
              return;
            }
          }
          if (!canceled1) {
            readableByteStreamControllerEnqueue(branch1[kState].controller, chunk1);
          }
          if (!canceled2) {
            readableByteStreamControllerEnqueue(branch2[kState].controller, chunk2);
          }
          reading = false;
          if (readAgainForBranch1) {
            pull1Algorithm();
          } else if (readAgainForBranch2) {
            pull2Algorithm();
          }
        });
      },
      [kClose]() {
        reading = false;
        if (!canceled1) {
          readableByteStreamControllerClose(branch1[kState].controller);
        }
        if (!canceled2) {
          readableByteStreamControllerClose(branch2[kState].controller);
        }
        if (branch1[kState].controller[kState].pendingPullIntos.length > 0) {
          readableByteStreamControllerRespond(branch1[kState].controller, 0);
        }
        if (branch2[kState].controller[kState].pendingPullIntos.length > 0) {
          readableByteStreamControllerRespond(branch2[kState].controller, 0);
        }
        if (!canceled1 || !canceled2) {
          cancelDeferred.resolve();
        }
      },
      [kError]() {
        reading = false;
      }
    };
    readableStreamDefaultReaderRead(reader, readRequest);
  }
  function pullWithBYOBReader(view, forBranch2) {
    if (isReadableStreamDefaultReader(reader)) {
      readableStreamDefaultReaderRelease(reader);
      reader = new ReadableStreamBYOBReader(stream);
      forwardReaderError(reader);
    }
    var byobBranch = forBranch2 === true ? branch2 : branch1;
    var otherBranch = forBranch2 === false ? branch2 : branch1;
    var readIntoRequest = {
      [kChunk](chunk) {
        queueMicrotask(() => {
          readAgainForBranch1 = false;
          readAgainForBranch2 = false;
          var byobCanceled = forBranch2 === true ? canceled2 : canceled1;
          var otherCanceled = forBranch2 === false ? canceled2 : canceled1;
          if (!otherCanceled) {
            var clonedChunk;
            try {
              clonedChunk = cloneAsUint8Array(chunk);
            } catch (error) {
              readableByteStreamControllerError(byobBranch[kState].controller, error);
              readableByteStreamControllerError(otherBranch[kState].controller, error);
              cancelDeferred.resolve(readableStreamCancel(stream, error));
              return;
            }
            if (!byobCanceled) {
              readableByteStreamControllerRespondWithNewView(byobBranch[kState].controller, chunk);
            }
            readableByteStreamControllerEnqueue(otherBranch[kState].controller, clonedChunk);
          } else if (!byobCanceled) {
            readableByteStreamControllerRespondWithNewView(byobBranch[kState].controller, chunk);
          }
          reading = false;
          if (readAgainForBranch1) {
            pull1Algorithm();
          } else if (readAgainForBranch2) {
            pull2Algorithm();
          }
        });
      },
      [kClose](chunk) {
        reading = false;
        var byobCanceled = forBranch2 === true ? canceled2 : canceled1;
        var otherCanceled = forBranch2 === false ? canceled2 : canceled1;
        if (!byobCanceled) {
          readableByteStreamControllerClose(byobBranch[kState].controller);
        }
        if (!otherCanceled) {
          readableByteStreamControllerClose(otherBranch[kState].controller);
        }
        if (chunk !== undefined) {
          if (!byobCanceled) {
            readableByteStreamControllerRespondWithNewView(byobBranch[kState].controller, chunk);
          }
          if (!otherCanceled && otherBranch[kState].controller[kState].pendingPullIntos.length > 0) {
            readableByteStreamControllerRespond(otherBranch[kState].controller, 0);
          }
        }
        if (!byobCanceled || !otherCanceled) {
          cancelDeferred.resolve();
        }
      },
      [kError]() {
        reading = false;
      }
    };
    readableStreamBYOBReaderRead(reader, view, 1, readIntoRequest);
  }
  function pull1Algorithm() {
    if (reading) {
      readAgainForBranch1 = true;
      return PromiseResolve();
    }
    reading = true;
    var byobRequest = branch1[kState].controller.byobRequest;
    if (byobRequest === null) {
      pullWithDefaultReader();
    } else {
      pullWithBYOBReader(byobRequest[kState].view, false);
    }
    return PromiseResolve();
  }
  function pull2Algorithm() {
    if (reading) {
      readAgainForBranch2 = true;
      return PromiseResolve();
    }
    reading = true;
    var byobRequest = branch2[kState].controller.byobRequest;
    if (byobRequest === null) {
      pullWithDefaultReader();
    } else {
      pullWithBYOBReader(byobRequest[kState].view, true);
    }
    return PromiseResolve();
  }
  function cancel1Algorithm(reason) {
    canceled1 = true;
    reason1 = reason;
    if (canceled2) {
      cancelDeferred.resolve(readableStreamCancel(stream, [reason1, reason2]));
    }
    return cancelDeferred.promise;
  }
  function cancel2Algorithm(reason) {
    canceled2 = true;
    reason2 = reason;
    if (canceled1) {
      cancelDeferred.resolve(readableStreamCancel(stream, [reason1, reason2]));
    }
    return cancelDeferred.promise;
  }
  branch1 = createReadableByteStream(nonOpStart, pull1Algorithm, cancel1Algorithm);
  branch2 = createReadableByteStream(nonOpStart, pull2Algorithm, cancel2Algorithm);
  forwardReaderError(reader);
  return [branch1, branch2];
}
function readableByteStreamControllerConvertPullIntoDescriptor(desc) {
  var {
    buffer,
    bytesFilled,
    byteLength,
    byteOffset,
    ctor,
    elementSize
  } = desc;
  if (bytesFilled > byteLength) throw new ERR_INVALID_STATE.RangeError('The buffer size is invalid');
  assert(!(bytesFilled % elementSize));
  var transferredBuffer = ArrayBufferPrototypeTransfer(buffer);
  if (ctor === Buffer) {
    return Buffer.from(transferredBuffer, byteOffset, bytesFilled / elementSize);
  }
  return new ctor(transferredBuffer, byteOffset, bytesFilled / elementSize);
}
function isReadableStreamLocked(stream) {
  return stream[kState].reader !== undefined;
}
function readableStreamCancel(stream, reason) {
  stream[kState].disturbed = true;
  switch (stream[kState].state) {
    case 'closed':
      return PromiseResolve();
    case 'errored':
      return PromiseReject(stream[kState].storedError);
  }
  readableStreamClose(stream);
  var {
    reader
  } = stream[kState];
  if (reader !== undefined && readableStreamHasBYOBReader(stream)) {
    for (var n = 0; n < reader[kState].readIntoRequests.length; n++) reader[kState].readIntoRequests[n][kClose]();
    reader[kState].readIntoRequests = [];
  }
  return PromisePrototypeThen(stream[kState].controller[kCancel](reason), () => {});
}
function readableStreamClose(stream) {
  assert(stream[kState].state === 'readable');
  stream[kState].state = 'closed';
  stream[kIsClosedPromise].resolve();
  var {
    reader
  } = stream[kState];
  if (reader === undefined) return;
  reader[kState].close.resolve();
  if (readableStreamHasDefaultReader(stream)) {
    for (var n = 0; n < reader[kState].readRequests.length; n++) reader[kState].readRequests[n][kClose]();
    reader[kState].readRequests = [];
  }
}
function readableStreamError(stream, error) {
  assert(stream[kState].state === 'readable');
  stream[kState].state = 'errored';
  stream[kState].storedError = error;
  setPromiseHandled(stream[kIsClosedPromise].promise);
  stream[kIsClosedPromise].reject(error);
  var {
    reader
  } = stream[kState];
  if (reader === undefined) return;
  setPromiseHandled(reader[kState].close.promise);
  reader[kState].close.reject(error);
  if (readableStreamHasDefaultReader(stream)) {
    for (var n = 0; n < reader[kState].readRequests.length; n++) reader[kState].readRequests[n][kError](error);
    reader[kState].readRequests = [];
  } else {
    assert(readableStreamHasBYOBReader(stream));
    for (var _n = 0; _n < reader[kState].readIntoRequests.length; _n++) reader[kState].readIntoRequests[_n][kError](error);
    reader[kState].readIntoRequests = [];
  }
}
function readableStreamHasDefaultReader(stream) {
  var {
    reader
  } = stream[kState];
  if (reader === undefined) return false;
  return reader[kState] !== undefined && reader[kType] === 'ReadableStreamDefaultReader';
}
function readableStreamGetNumReadRequests(stream) {
  assert(readableStreamHasDefaultReader(stream));
  return stream[kState].reader[kState].readRequests.length;
}
function readableStreamHasBYOBReader(stream) {
  var {
    reader
  } = stream[kState];
  if (reader === undefined) return false;
  return reader[kState] !== undefined && reader[kType] === 'ReadableStreamBYOBReader';
}
function readableStreamGetNumReadIntoRequests(stream) {
  assert(readableStreamHasBYOBReader(stream));
  return stream[kState].reader[kState].readIntoRequests.length;
}
function readableStreamFulfillReadRequest(stream, chunk, done) {
  assert(readableStreamHasDefaultReader(stream));
  var {
    reader
  } = stream[kState];
  assert(reader[kState].readRequests.length);
  var readRequest = ArrayPrototypeShift(reader[kState].readRequests);

  // TODO(@jasnell): It's not clear under what exact conditions done
  // will be true here. The spec requires this check but none of the
  // WPT's or other tests trigger it. Will need to investigate how to
  // get coverage for this.
  if (done) readRequest[kClose]();else readRequest[kChunk](chunk);
}
function readableStreamFulfillReadIntoRequest(stream, chunk, done) {
  assert(readableStreamHasBYOBReader(stream));
  var {
    reader
  } = stream[kState];
  assert(reader[kState].readIntoRequests.length);
  var readIntoRequest = ArrayPrototypeShift(reader[kState].readIntoRequests);
  if (done) readIntoRequest[kClose](chunk);else readIntoRequest[kChunk](chunk);
}
function readableStreamAddReadRequest(stream, readRequest) {
  assert(readableStreamHasDefaultReader(stream));
  assert(stream[kState].state === 'readable');
  ArrayPrototypePush(stream[kState].reader[kState].readRequests, readRequest);
}
function readableStreamAddReadIntoRequest(stream, readIntoRequest) {
  assert(readableStreamHasBYOBReader(stream));
  assert(stream[kState].state !== 'errored');
  ArrayPrototypePush(stream[kState].reader[kState].readIntoRequests, readIntoRequest);
}
function readableStreamReaderGenericCancel(reader, reason) {
  var {
    stream
  } = reader[kState];
  assert(stream !== undefined);
  return readableStreamCancel(stream, reason);
}
function readableStreamReaderGenericInitialize(reader, stream) {
  reader[kState].stream = stream;
  stream[kState].reader = reader;
  switch (stream[kState].state) {
    case 'readable':
      reader[kState].close = PromiseWithResolvers();
      break;
    case 'closed':
      reader[kState].close = {
        promise: PromiseResolve(),
        resolve: undefined,
        reject: undefined
      };
      break;
    case 'errored':
      reader[kState].close = {
        promise: PromiseReject(stream[kState].storedError),
        resolve: undefined,
        reject: undefined
      };
      setPromiseHandled(reader[kState].close.promise);
      break;
  }
}
function readableStreamDefaultReaderRelease(reader) {
  readableStreamReaderGenericRelease(reader);
  readableStreamDefaultReaderErrorReadRequests(reader, lazyReadableReleasingError());
}
function readableStreamDefaultReaderErrorReadRequests(reader, e) {
  for (var n = 0; n < reader[kState].readRequests.length; ++n) {
    reader[kState].readRequests[n][kError](e);
  }
  reader[kState].readRequests = [];
}
function readableStreamBYOBReaderRelease(reader) {
  readableStreamReaderGenericRelease(reader);
  readableStreamBYOBReaderErrorReadIntoRequests(reader, lazyReadableReleasingError());
}
function readableStreamBYOBReaderErrorReadIntoRequests(reader, e) {
  for (var n = 0; n < reader[kState].readIntoRequests.length; ++n) {
    reader[kState].readIntoRequests[n][kError](e);
  }
  reader[kState].readIntoRequests = [];
}
function readableStreamReaderGenericRelease(reader) {
  var {
    stream
  } = reader[kState];
  assert(stream !== undefined);
  assert(stream[kState].reader === reader);
  var releasedStateError = lazyReadableReleasedError();
  if (stream[kState].state === 'readable') {
    reader[kState].close.reject?.(releasedStateError);
  } else {
    reader[kState].close = {
      promise: PromiseReject(releasedStateError),
      resolve: undefined,
      reject: undefined
    };
  }
  setPromiseHandled(reader[kState].close.promise);
  stream[kState].controller[kRelease]();
  stream[kState].reader = undefined;
  reader[kState].stream = undefined;
}
function readableStreamBYOBReaderRead(reader, view, min, readIntoRequest) {
  var {
    stream
  } = reader[kState];
  assert(stream !== undefined);
  stream[kState].disturbed = true;
  if (stream[kState].state === 'errored') {
    readIntoRequest[kError](stream[kState].storedError);
    return;
  }
  readableByteStreamControllerPullInto(stream[kState].controller, view, min, readIntoRequest);
}
function readableStreamDefaultReaderRead(reader, readRequest) {
  var {
    stream
  } = reader[kState];
  assert(stream !== undefined);
  stream[kState].disturbed = true;
  switch (stream[kState].state) {
    case 'closed':
      readRequest[kClose]();
      break;
    case 'errored':
      readRequest[kError](stream[kState].storedError);
      break;
    case 'readable':
      stream[kState].controller[kPull](readRequest);
  }
}
function setupReadableStreamBYOBReader(reader, stream) {
  if (isReadableStreamLocked(stream)) throw new ERR_INVALID_STATE.TypeError('ReadableStream is locked');
  var {
    controller
  } = stream[kState];
  if (!isReadableByteStreamController(controller)) throw new ERR_INVALID_ARG_VALUE('stream', stream, 'must be a byte stream');
  readableStreamReaderGenericInitialize(reader, stream);
  reader[kState].readIntoRequests = [];
}
function setupReadableStreamDefaultReader(reader, stream) {
  if (isReadableStreamLocked(stream)) throw new ERR_INVALID_STATE.TypeError('ReadableStream is locked');
  readableStreamReaderGenericInitialize(reader, stream);
  reader[kState].readRequests = [];
}
function readableStreamDefaultControllerClose(controller) {
  if (!readableStreamDefaultControllerCanCloseOrEnqueue(controller)) return;
  controller[kState].closeRequested = true;
  if (!controller[kState].queue.length) {
    readableStreamDefaultControllerClearAlgorithms(controller);
    readableStreamClose(controller[kState].stream);
  }
}
function readableStreamDefaultControllerEnqueue(controller, chunk) {
  if (!readableStreamDefaultControllerCanCloseOrEnqueue(controller)) return;
  var {
    stream
  } = controller[kState];
  if (isReadableStreamLocked(stream) && readableStreamGetNumReadRequests(stream)) {
    readableStreamFulfillReadRequest(stream, chunk, false);
  } else {
    try {
      var chunkSize = FunctionPrototypeCall(controller[kState].sizeAlgorithm, undefined, chunk);
      enqueueValueWithSize(controller, chunk, chunkSize);
    } catch (error) {
      readableStreamDefaultControllerError(controller, error);
      throw error;
    }
  }
  readableStreamDefaultControllerCallPullIfNeeded(controller);
}
function readableStreamDefaultControllerHasBackpressure(controller) {
  return !readableStreamDefaultControllerShouldCallPull(controller);
}
function readableStreamDefaultControllerCanCloseOrEnqueue(controller) {
  var {
    stream
  } = controller[kState];
  return !controller[kState].closeRequested && stream[kState].state === 'readable';
}
function readableStreamDefaultControllerGetDesiredSize(controller) {
  var {
    stream,
    highWaterMark,
    queueTotalSize
  } = controller[kState];
  switch (stream[kState].state) {
    case 'errored':
      return null;
    case 'closed':
      return 0;
    default:
      return highWaterMark - queueTotalSize;
  }
}
function readableStreamDefaultControllerShouldCallPull(controller) {
  var {
    stream
  } = controller[kState];
  if (!readableStreamDefaultControllerCanCloseOrEnqueue(controller) || !controller[kState].started) return false;
  if (isReadableStreamLocked(stream) && readableStreamGetNumReadRequests(stream)) {
    return true;
  }
  var desiredSize = readableStreamDefaultControllerGetDesiredSize(controller);
  assert(desiredSize !== null);
  return desiredSize > 0;
}
function readableStreamDefaultControllerCallPullIfNeeded(controller) {
  if (!readableStreamDefaultControllerShouldCallPull(controller)) return;
  if (controller[kState].pulling) {
    controller[kState].pullAgain = true;
    return;
  }
  assert(!controller[kState].pullAgain);
  controller[kState].pulling = true;
  PromisePrototypeThen(controller[kState].pullAlgorithm(controller), () => {
    controller[kState].pulling = false;
    if (controller[kState].pullAgain) {
      controller[kState].pullAgain = false;
      readableStreamDefaultControllerCallPullIfNeeded(controller);
    }
  }, error => readableStreamDefaultControllerError(controller, error));
}
function readableStreamDefaultControllerClearAlgorithms(controller) {
  controller[kState].pullAlgorithm = undefined;
  controller[kState].cancelAlgorithm = undefined;
  controller[kState].sizeAlgorithm = undefined;
}
function readableStreamDefaultControllerError(controller, error) {
  var {
    stream
  } = controller[kState];
  if (stream[kState].state === 'readable') {
    resetQueue(controller);
    readableStreamDefaultControllerClearAlgorithms(controller);
    readableStreamError(stream, error);
  }
}
function readableStreamDefaultControllerCancelSteps(controller, reason) {
  resetQueue(controller);
  var result = controller[kState].cancelAlgorithm(reason);
  readableStreamDefaultControllerClearAlgorithms(controller);
  return result;
}
function readableStreamDefaultControllerPullSteps(controller, readRequest) {
  var {
    stream,
    queue
  } = controller[kState];
  if (queue.length) {
    var chunk = dequeueValue(controller);
    if (controller[kState].closeRequested && !queue.length) {
      readableStreamDefaultControllerClearAlgorithms(controller);
      readableStreamClose(stream);
    } else {
      readableStreamDefaultControllerCallPullIfNeeded(controller);
    }
    readRequest[kChunk](chunk);
    return;
  }
  readableStreamAddReadRequest(stream, readRequest);
  readableStreamDefaultControllerCallPullIfNeeded(controller);
}
function setupReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
  assert(stream[kState].controller === undefined);
  controller[kState] = {
    cancelAlgorithm,
    closeRequested: false,
    highWaterMark,
    pullAgain: false,
    pullAlgorithm,
    pulling: false,
    queue: [],
    queueTotalSize: 0,
    started: false,
    sizeAlgorithm,
    stream
  };
  stream[kState].controller = controller;
  stream[kControllerErrorFunction] = FunctionPrototypeBind(controller.error, controller);
  var startResult = startAlgorithm();
  PromisePrototypeThen(new Promise(r => r(startResult)), () => {
    controller[kState].started = true;
    assert(!controller[kState].pulling);
    assert(!controller[kState].pullAgain);
    readableStreamDefaultControllerCallPullIfNeeded(controller);
  }, error => readableStreamDefaultControllerError(controller, error));
}
function setupReadableStreamDefaultControllerFromSource(stream, source, highWaterMark, sizeAlgorithm) {
  var controller = new ReadableStreamDefaultController(kSkipThrow);
  var start = source?.start;
  var pull = source?.pull;
  var cancel = source?.cancel;
  var startAlgorithm = start ? FunctionPrototypeBind(start, source, controller) : nonOpStart;
  var pullAlgorithm = pull ? createPromiseCallback('source.pull', pull, source) : nonOpPull;
  var cancelAlgorithm = cancel ? createPromiseCallback('source.cancel', cancel, source) : nonOpCancel;
  setupReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
}
function readableByteStreamControllerClose(controller) {
  var {
    closeRequested,
    pendingPullIntos,
    queueTotalSize,
    stream
  } = controller[kState];
  if (closeRequested || stream[kState].state !== 'readable') return;
  if (queueTotalSize) {
    controller[kState].closeRequested = true;
    return;
  }
  if (pendingPullIntos.length) {
    var firstPendingPullInto = pendingPullIntos[0];
    if (firstPendingPullInto.bytesFilled % firstPendingPullInto.elementSize !== 0) {
      var error = new ERR_INVALID_STATE.TypeError('Partial read');
      readableByteStreamControllerError(controller, error);
      throw error;
    }
  }
  readableByteStreamControllerClearAlgorithms(controller);
  readableStreamClose(stream);
}
function readableByteStreamControllerCommitPullIntoDescriptor(stream, desc) {
  assert(stream[kState].state !== 'errored');
  assert(desc.type !== 'none');
  var done = false;
  if (stream[kState].state === 'closed') {
    assert(desc.bytesFilled % desc.elementSize === 0);
    done = true;
  }
  var filledView = readableByteStreamControllerConvertPullIntoDescriptor(desc);
  if (desc.type === 'default') {
    readableStreamFulfillReadRequest(stream, filledView, done);
  } else {
    assert(desc.type === 'byob');
    readableStreamFulfillReadIntoRequest(stream, filledView, done);
  }
}
function readableByteStreamControllerCommitPullIntoDescriptors(stream, descriptors) {
  for (var i = 0; i < descriptors.length; ++i) {
    readableByteStreamControllerCommitPullIntoDescriptor(stream, descriptors[i]);
  }
}
function readableByteStreamControllerInvalidateBYOBRequest(controller) {
  if (controller[kState].byobRequest === null) return;
  controller[kState].byobRequest[kState].controller = undefined;
  controller[kState].byobRequest[kState].view = null;
  controller[kState].byobRequest = null;
}
function readableByteStreamControllerClearAlgorithms(controller) {
  controller[kState].pullAlgorithm = undefined;
  controller[kState].cancelAlgorithm = undefined;
}
function readableByteStreamControllerClearPendingPullIntos(controller) {
  readableByteStreamControllerInvalidateBYOBRequest(controller);
  controller[kState].pendingPullIntos = [];
}
function readableByteStreamControllerGetDesiredSize(controller) {
  var {
    stream,
    highWaterMark,
    queueTotalSize
  } = controller[kState];
  switch (stream[kState].state) {
    case 'errored':
      return null;
    case 'closed':
      return 0;
    default:
      return highWaterMark - queueTotalSize;
  }
}
function readableByteStreamControllerShouldCallPull(controller) {
  var {
    stream
  } = controller[kState];
  if (stream[kState].state !== 'readable' || controller[kState].closeRequested || !controller[kState].started) {
    return false;
  }
  if (readableStreamHasDefaultReader(stream) && readableStreamGetNumReadRequests(stream) > 0) {
    return true;
  }
  if (readableStreamHasBYOBReader(stream) && readableStreamGetNumReadIntoRequests(stream) > 0) {
    return true;
  }
  var desiredSize = readableByteStreamControllerGetDesiredSize(controller);
  assert(desiredSize !== null);
  return desiredSize > 0;
}
function readableByteStreamControllerHandleQueueDrain(controller) {
  var {
    closeRequested,
    queueTotalSize,
    stream
  } = controller[kState];
  assert(stream[kState].state === 'readable');
  if (!queueTotalSize && closeRequested) {
    readableByteStreamControllerClearAlgorithms(controller);
    readableStreamClose(stream);
    return;
  }
  readableByteStreamControllerCallPullIfNeeded(controller);
}
function readableByteStreamControllerPullInto(controller, view, min, readIntoRequest) {
  var {
    closeRequested,
    stream,
    pendingPullIntos
  } = controller[kState];
  var elementSize = 1;
  var ctor = DataView;
  if (isArrayBufferView(view) && !isDataView(view)) {
    elementSize = view.constructor.BYTES_PER_ELEMENT;
    ctor = view.constructor;
  }
  var minimumFill = min * elementSize;
  assert(minimumFill >= elementSize && minimumFill <= view.byteLength);
  assert(minimumFill % elementSize === 0);
  var buffer = ArrayBufferViewGetBuffer(view);
  var byteOffset = ArrayBufferViewGetByteOffset(view);
  var byteLength = ArrayBufferViewGetByteLength(view);
  var bufferByteLength = ArrayBufferPrototypeGetByteLength(buffer);
  var transferredBuffer;
  try {
    transferredBuffer = ArrayBufferPrototypeTransfer(buffer);
  } catch (error) {
    readIntoRequest[kError](error);
    return;
  }
  var desc = {
    buffer: transferredBuffer,
    bufferByteLength,
    byteOffset,
    byteLength,
    bytesFilled: 0,
    minimumFill,
    elementSize,
    ctor,
    type: 'byob'
  };
  if (pendingPullIntos.length) {
    ArrayPrototypePush(pendingPullIntos, desc);
    readableStreamAddReadIntoRequest(stream, readIntoRequest);
    return;
  }
  if (stream[kState].state === 'closed') {
    var emptyView = new ctor(desc.buffer, byteOffset, 0);
    readIntoRequest[kClose](emptyView);
    return;
  }
  if (controller[kState].queueTotalSize) {
    if (readableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, desc)) {
      var filledView = readableByteStreamControllerConvertPullIntoDescriptor(desc);
      readableByteStreamControllerHandleQueueDrain(controller);
      readIntoRequest[kChunk](filledView);
      return;
    }
    if (closeRequested) {
      var error = new ERR_INVALID_STATE.TypeError('ReadableStream closed');
      readableByteStreamControllerError(controller, error);
      readIntoRequest[kError](error);
      return;
    }
  }
  ArrayPrototypePush(pendingPullIntos, desc);
  readableStreamAddReadIntoRequest(stream, readIntoRequest);
  readableByteStreamControllerCallPullIfNeeded(controller);
}
function readableByteStreamControllerRespondInternal(controller, bytesWritten) {
  var {
    stream,
    pendingPullIntos
  } = controller[kState];
  var desc = pendingPullIntos[0];
  readableByteStreamControllerInvalidateBYOBRequest(controller);
  if (stream[kState].state === 'closed') {
    if (bytesWritten) throw new ERR_INVALID_STATE.TypeError('Controller is closed but view is not zero-length');
    readableByteStreamControllerRespondInClosedState(controller, desc);
  } else {
    assert(stream[kState].state === 'readable');
    if (!bytesWritten) throw new ERR_INVALID_STATE.TypeError('View cannot be zero-length');
    readableByteStreamControllerRespondInReadableState(controller, bytesWritten, desc);
  }
  readableByteStreamControllerCallPullIfNeeded(controller);
}
function readableByteStreamControllerRespond(controller, bytesWritten) {
  var {
    pendingPullIntos,
    stream
  } = controller[kState];
  assert(pendingPullIntos.length);
  var desc = pendingPullIntos[0];
  if (stream[kState].state === 'closed') {
    if (bytesWritten !== 0) throw new ERR_INVALID_ARG_VALUE('bytesWritten', bytesWritten);
  } else {
    assert(stream[kState].state === 'readable');
    if (!bytesWritten) throw new ERR_INVALID_ARG_VALUE('bytesWritten', bytesWritten);
    if (desc.bytesFilled + bytesWritten > desc.byteLength) throw new ERR_INVALID_ARG_VALUE.RangeError('bytesWritten', bytesWritten);
  }
  desc.buffer = ArrayBufferPrototypeTransfer(desc.buffer);
  readableByteStreamControllerRespondInternal(controller, bytesWritten);
}
function readableByteStreamControllerRespondInClosedState(controller, desc) {
  assert(desc.bytesFilled % desc.elementSize === 0);
  if (desc.type === 'none') {
    readableByteStreamControllerShiftPendingPullInto(controller);
  }
  var {
    stream
  } = controller[kState];
  if (readableStreamHasBYOBReader(stream)) {
    var filledPullIntos = [];
    for (var i = 0; i < readableStreamGetNumReadIntoRequests(stream); ++i) {
      ArrayPrototypePush(filledPullIntos, readableByteStreamControllerShiftPendingPullInto(controller));
    }
    readableByteStreamControllerCommitPullIntoDescriptors(stream, filledPullIntos);
  }
}
function readableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, desc) {
  var {
    pendingPullIntos,
    byobRequest
  } = controller[kState];
  assert(!pendingPullIntos.length || pendingPullIntos[0] === desc);
  assert(byobRequest === null);
  desc.bytesFilled += size;
}
function readableByteStreamControllerEnqueue(controller, chunk) {
  var {
    closeRequested,
    pendingPullIntos,
    queue,
    stream
  } = controller[kState];
  var buffer = ArrayBufferViewGetBuffer(chunk);
  var byteOffset = ArrayBufferViewGetByteOffset(chunk);
  var byteLength = ArrayBufferViewGetByteLength(chunk);
  if (closeRequested || stream[kState].state !== 'readable') return;
  var transferredBuffer = ArrayBufferPrototypeTransfer(buffer);
  if (pendingPullIntos.length) {
    var firstPendingPullInto = pendingPullIntos[0];
    if (ArrayBufferPrototypeGetDetached(firstPendingPullInto.buffer)) {
      throw new ERR_INVALID_STATE.TypeError('Destination ArrayBuffer is detached');
    }
    readableByteStreamControllerInvalidateBYOBRequest(controller);
    firstPendingPullInto.buffer = ArrayBufferPrototypeTransfer(firstPendingPullInto.buffer);
    if (firstPendingPullInto.type === 'none') {
      readableByteStreamControllerEnqueueDetachedPullIntoToQueue(controller, firstPendingPullInto);
    }
  }
  if (readableStreamHasDefaultReader(stream)) {
    readableByteStreamControllerProcessReadRequestsUsingQueue(controller);
    if (!readableStreamGetNumReadRequests(stream)) {
      readableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
    } else {
      assert(!queue.length);
      if (pendingPullIntos.length) {
        assert(pendingPullIntos[0].type === 'default');
        readableByteStreamControllerShiftPendingPullInto(controller);
      }
      var transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
      readableStreamFulfillReadRequest(stream, transferredView, false);
    }
  } else if (readableStreamHasBYOBReader(stream)) {
    readableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
    var filledPullIntos = readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    readableByteStreamControllerCommitPullIntoDescriptors(stream, filledPullIntos);
  } else {
    assert(!isReadableStreamLocked(stream));
    readableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
  }
  readableByteStreamControllerCallPullIfNeeded(controller);
}
function readableByteStreamControllerEnqueueClonedChunkToQueue(controller, buffer, byteOffset, byteLength) {
  var cloneResult;
  try {
    cloneResult = ArrayBufferPrototypeSlice(buffer, byteOffset, byteOffset + byteLength);
  } catch (error) {
    readableByteStreamControllerError(controller, error);
    throw error;
  }
  readableByteStreamControllerEnqueueChunkToQueue(controller, cloneResult, 0, byteLength);
}
function readableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
  ArrayPrototypePush(controller[kState].queue, {
    buffer,
    byteOffset,
    byteLength
  });
  controller[kState].queueTotalSize += byteLength;
}
function readableByteStreamControllerEnqueueDetachedPullIntoToQueue(controller, desc) {
  var {
    buffer,
    byteOffset,
    bytesFilled,
    type
  } = desc;
  assert(type === 'none');
  if (bytesFilled > 0) {
    readableByteStreamControllerEnqueueClonedChunkToQueue(controller, buffer, byteOffset, bytesFilled);
  }
  readableByteStreamControllerShiftPendingPullInto(controller);
}
function readableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, desc) {
  var {
    buffer,
    byteLength,
    byteOffset,
    bytesFilled,
    minimumFill,
    elementSize
  } = desc;
  var maxBytesToCopy = MathMin(controller[kState].queueTotalSize, byteLength - bytesFilled);
  var maxBytesFilled = bytesFilled + maxBytesToCopy;
  var maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
  var totalBytesToCopyRemaining = maxBytesToCopy;
  var ready = false;
  assert(!ArrayBufferPrototypeGetDetached(buffer));
  assert(bytesFilled < minimumFill);
  if (maxAlignedBytes >= minimumFill) {
    totalBytesToCopyRemaining = maxAlignedBytes - bytesFilled;
    ready = true;
  }
  var {
    queue
  } = controller[kState];
  while (totalBytesToCopyRemaining) {
    var headOfQueue = queue[0];
    var bytesToCopy = MathMin(totalBytesToCopyRemaining, headOfQueue.byteLength);
    var destStart = byteOffset + desc.bytesFilled;
    assert(canCopyArrayBuffer(buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy));
    copyArrayBuffer(buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
    if (headOfQueue.byteLength === bytesToCopy) {
      ArrayPrototypeShift(queue);
    } else {
      headOfQueue.byteOffset += bytesToCopy;
      headOfQueue.byteLength -= bytesToCopy;
    }
    controller[kState].queueTotalSize -= bytesToCopy;
    readableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, desc);
    totalBytesToCopyRemaining -= bytesToCopy;
  }
  if (!ready) {
    assert(!controller[kState].queueTotalSize);
    assert(desc.bytesFilled > 0);
    assert(desc.bytesFilled < minimumFill);
  }
  return ready;
}
function readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
  var {
    closeRequested,
    pendingPullIntos
  } = controller[kState];
  assert(!closeRequested);
  var filledPullIntos = [];
  while (pendingPullIntos.length) {
    if (!controller[kState].queueTotalSize) break;
    var desc = pendingPullIntos[0];
    if (readableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, desc)) {
      readableByteStreamControllerShiftPendingPullInto(controller);
      ArrayPrototypePush(filledPullIntos, desc);
    }
  }
  return filledPullIntos;
}
function readableByteStreamControllerRespondInReadableState(controller, bytesWritten, desc) {
  var {
    stream
  } = controller[kState];
  var {
    buffer,
    bytesFilled,
    byteLength,
    type
  } = desc;
  if (bytesFilled + bytesWritten > byteLength) throw new ERR_INVALID_STATE.RangeError('The buffer size is invalid');
  readableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, desc);
  if (type === 'none') {
    readableByteStreamControllerEnqueueDetachedPullIntoToQueue(controller, desc);
    var _filledPullIntos = readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    readableByteStreamControllerCommitPullIntoDescriptors(stream, _filledPullIntos);
    return;
  }
  if (desc.bytesFilled < desc.minimumFill) return;
  readableByteStreamControllerShiftPendingPullInto(controller);
  var remainderSize = desc.bytesFilled % desc.elementSize;
  if (remainderSize) {
    var end = desc.byteOffset + desc.bytesFilled;
    var start = end - remainderSize;
    var remainder = ArrayBufferPrototypeSlice(buffer, start, end);
    readableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, ArrayBufferPrototypeGetByteLength(remainder));
  }
  desc.bytesFilled -= remainderSize;
  var filledPullIntos = readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
  readableByteStreamControllerCommitPullIntoDescriptor(stream, desc);
  readableByteStreamControllerCommitPullIntoDescriptors(stream, filledPullIntos);
}
function readableByteStreamControllerRespondWithNewView(controller, view) {
  var {
    stream,
    pendingPullIntos
  } = controller[kState];
  assert(pendingPullIntos.length);
  var desc = pendingPullIntos[0];
  assert(stream[kState].state !== 'errored');
  var viewByteLength = ArrayBufferViewGetByteLength(view);
  var viewByteOffset = ArrayBufferViewGetByteOffset(view);
  var viewBuffer = ArrayBufferViewGetBuffer(view);
  var viewBufferByteLength = ArrayBufferPrototypeGetByteLength(viewBuffer);
  if (stream[kState].state === 'closed') {
    if (viewByteLength !== 0) throw new ERR_INVALID_STATE.TypeError('View is not zero-length');
  } else {
    assert(stream[kState].state === 'readable');
    if (viewByteLength === 0) throw new ERR_INVALID_STATE.TypeError('View is zero-length');
  }
  var {
    byteOffset,
    byteLength,
    bytesFilled,
    bufferByteLength
  } = desc;
  if (byteOffset + bytesFilled !== viewByteOffset) throw new ERR_INVALID_ARG_VALUE.RangeError('view', view);
  if (bytesFilled + viewByteLength > byteLength) throw new ERR_INVALID_ARG_VALUE.RangeError('view', view);
  if (bufferByteLength !== viewBufferByteLength) throw new ERR_INVALID_ARG_VALUE.RangeError('view', view);
  desc.buffer = ArrayBufferPrototypeTransfer(viewBuffer);
  readableByteStreamControllerRespondInternal(controller, viewByteLength);
}
function readableByteStreamControllerShiftPendingPullInto(controller) {
  assert(controller[kState].byobRequest === null);
  return ArrayPrototypeShift(controller[kState].pendingPullIntos);
}
function readableByteStreamControllerCallPullIfNeeded(controller) {
  if (!readableByteStreamControllerShouldCallPull(controller)) return;
  if (controller[kState].pulling) {
    controller[kState].pullAgain = true;
    return;
  }
  assert(!controller[kState].pullAgain);
  controller[kState].pulling = true;
  PromisePrototypeThen(controller[kState].pullAlgorithm(controller), () => {
    controller[kState].pulling = false;
    if (controller[kState].pullAgain) {
      controller[kState].pullAgain = false;
      readableByteStreamControllerCallPullIfNeeded(controller);
    }
  }, error => readableByteStreamControllerError(controller, error));
}
function readableByteStreamControllerError(controller, error) {
  var {
    stream
  } = controller[kState];
  if (stream[kState].state !== 'readable') return;
  readableByteStreamControllerClearPendingPullIntos(controller);
  resetQueue(controller);
  readableByteStreamControllerClearAlgorithms(controller);
  readableStreamError(stream, error);
}
function readableByteStreamControllerCancelSteps(controller, reason) {
  readableByteStreamControllerClearPendingPullIntos(controller);
  resetQueue(controller);
  var result = controller[kState].cancelAlgorithm(reason);
  readableByteStreamControllerClearAlgorithms(controller);
  return result;
}
function readableByteStreamControllerFillReadRequestFromQueue(controller, readRequest) {
  var {
    queue,
    queueTotalSize
  } = controller[kState];
  assert(queueTotalSize > 0);
  var {
    buffer,
    byteOffset,
    byteLength
  } = ArrayPrototypeShift(queue);
  controller[kState].queueTotalSize -= byteLength;
  readableByteStreamControllerHandleQueueDrain(controller);
  var view = new Uint8Array(buffer, byteOffset, byteLength);
  readRequest[kChunk](view);
}
function readableByteStreamControllerProcessReadRequestsUsingQueue(controller) {
  var {
    stream,
    queueTotalSize
  } = controller[kState];
  var {
    reader
  } = stream[kState];
  assert(isReadableStreamDefaultReader(reader));
  while (reader[kState].readRequests.length > 0) {
    if (queueTotalSize === 0) {
      return;
    }
    readableByteStreamControllerFillReadRequestFromQueue(controller, ArrayPrototypeShift(reader[kState].readRequests));
  }
}
function readableByteStreamControllerPullSteps(controller, readRequest) {
  var {
    pendingPullIntos,
    queueTotalSize,
    stream
  } = controller[kState];
  assert(readableStreamHasDefaultReader(stream));
  if (queueTotalSize) {
    assert(!readableStreamGetNumReadRequests(stream));
    readableByteStreamControllerFillReadRequestFromQueue(controller, readRequest);
    return;
  }
  var {
    autoAllocateChunkSize
  } = controller[kState];
  if (autoAllocateChunkSize !== undefined) {
    try {
      var buffer = new ArrayBuffer(autoAllocateChunkSize);
      ArrayPrototypePush(pendingPullIntos, {
        buffer,
        bufferByteLength: autoAllocateChunkSize,
        byteOffset: 0,
        byteLength: autoAllocateChunkSize,
        bytesFilled: 0,
        minimumFill: 1,
        elementSize: 1,
        ctor: Uint8Array,
        type: 'default'
      });
    } catch (error) {
      readRequest[kError](error);
      return;
    }
  }
  readableStreamAddReadRequest(stream, readRequest);
  readableByteStreamControllerCallPullIfNeeded(controller);
}
function setupReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
  assert(stream[kState].controller === undefined);
  if (autoAllocateChunkSize !== undefined) {
    assert(NumberIsInteger(autoAllocateChunkSize));
    assert(autoAllocateChunkSize > 0);
  }
  controller[kState] = {
    byobRequest: null,
    closeRequested: false,
    pullAgain: false,
    pulling: false,
    started: false,
    stream,
    queue: [],
    queueTotalSize: 0,
    highWaterMark,
    pullAlgorithm,
    cancelAlgorithm,
    autoAllocateChunkSize,
    pendingPullIntos: []
  };
  stream[kState].controller = controller;
  var startResult = startAlgorithm();
  PromisePrototypeThen(new Promise(r => r(startResult)), () => {
    controller[kState].started = true;
    assert(!controller[kState].pulling);
    assert(!controller[kState].pullAgain);
    readableByteStreamControllerCallPullIfNeeded(controller);
  }, error => readableByteStreamControllerError(controller, error));
}
function setupReadableByteStreamControllerFromSource(stream, source, highWaterMark) {
  var controller = new ReadableByteStreamController(kSkipThrow);
  var start = source?.start;
  var pull = source?.pull;
  var cancel = source?.cancel;
  var autoAllocateChunkSize = source?.autoAllocateChunkSize;
  var startAlgorithm = start ? FunctionPrototypeBind(start, source, controller) : nonOpStart;
  var pullAlgorithm = pull ? createPromiseCallback('source.pull', pull, source, controller) : nonOpPull;
  var cancelAlgorithm = cancel ? createPromiseCallback('source.cancel', cancel, source) : nonOpCancel;
  if (autoAllocateChunkSize === 0) {
    throw new ERR_INVALID_ARG_VALUE('source.autoAllocateChunkSize', autoAllocateChunkSize);
  }
  setupReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
}
module.exports = {
  ReadableStream,
  ReadableStreamDefaultReader,
  ReadableStreamBYOBReader,
  ReadableStreamBYOBRequest,
  ReadableByteStreamController,
  ReadableStreamDefaultController,
  TransferredReadableStream,
  // Exported Brand Checks
  isReadableStream,
  isReadableByteStreamController,
  isReadableStreamBYOBRequest,
  isReadableStreamDefaultReader,
  isReadableStreamBYOBReader,
  isWritableStreamDefaultWriter,
  isWritableStreamDefaultController,
  readableStreamPipeTo,
  readableStreamTee,
  readableByteStreamControllerConvertPullIntoDescriptor,
  isReadableStreamLocked,
  readableStreamCancel,
  readableStreamClose,
  readableStreamError,
  readableStreamHasDefaultReader,
  readableStreamGetNumReadRequests,
  readableStreamHasBYOBReader,
  readableStreamGetNumReadIntoRequests,
  readableStreamFulfillReadRequest,
  readableStreamFulfillReadIntoRequest,
  readableStreamAddReadRequest,
  readableStreamAddReadIntoRequest,
  readableStreamReaderGenericCancel,
  readableStreamReaderGenericInitialize,
  readableStreamReaderGenericRelease,
  readableStreamBYOBReaderRead,
  readableStreamDefaultReaderRead,
  setupReadableStreamBYOBReader,
  setupReadableStreamDefaultReader,
  readableStreamDefaultControllerClose,
  readableStreamDefaultControllerEnqueue,
  readableStreamDefaultControllerHasBackpressure,
  readableStreamDefaultControllerCanCloseOrEnqueue,
  readableStreamDefaultControllerGetDesiredSize,
  readableStreamDefaultControllerShouldCallPull,
  readableStreamDefaultControllerCallPullIfNeeded,
  readableStreamDefaultControllerClearAlgorithms,
  readableStreamDefaultControllerError,
  readableStreamDefaultControllerCancelSteps,
  readableStreamDefaultControllerPullSteps,
  setupReadableStreamDefaultController,
  setupReadableStreamDefaultControllerFromSource,
  readableByteStreamControllerClose,
  readableByteStreamControllerCommitPullIntoDescriptor,
  readableByteStreamControllerInvalidateBYOBRequest,
  readableByteStreamControllerClearAlgorithms,
  readableByteStreamControllerClearPendingPullIntos,
  readableByteStreamControllerGetDesiredSize,
  readableByteStreamControllerShouldCallPull,
  readableByteStreamControllerHandleQueueDrain,
  readableByteStreamControllerPullInto,
  readableByteStreamControllerRespondInternal,
  readableByteStreamControllerRespond,
  readableByteStreamControllerRespondInClosedState,
  readableByteStreamControllerFillHeadPullIntoDescriptor,
  readableByteStreamControllerEnqueue,
  readableByteStreamControllerEnqueueChunkToQueue,
  readableByteStreamControllerFillPullIntoDescriptorFromQueue,
  readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue,
  readableByteStreamControllerRespondInReadableState,
  readableByteStreamControllerRespondWithNewView,
  readableByteStreamControllerShiftPendingPullInto,
  readableByteStreamControllerCallPullIfNeeded,
  readableByteStreamControllerError,
  readableByteStreamControllerCancelSteps,
  readableByteStreamControllerPullSteps,
  setupReadableByteStreamController,
  setupReadableByteStreamControllerFromSource,
  createReadableStream,
  createReadableByteStream
};

