// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var {
  Promise,
  PromisePrototypeThen,
  ReflectApply,
  Symbol,
  SymbolDispose
} = primordials;
var {
  AbortError,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PREMATURE_CLOSE
  }
} = require('internal/errors');
var {
  kEmptyObject,
  once
} = require('internal/util');
var {
  validateAbortSignal,
  validateFunction,
  validateObject,
  validateBoolean
} = require('internal/validators');
var {
  isClosed,
  isReadable,
  isReadableNodeStream,
  isReadableStream,
  isReadableFinished,
  isReadableErrored,
  isWritable,
  isWritableNodeStream,
  isWritableStream,
  isWritableFinished,
  isWritableErrored,
  isNodeStream,
  willEmitClose: _willEmitClose,
  kIsClosedPromise
} = require('internal/streams/utils');
var {
  enabledHooksExist
} = require('internal/async_hooks');
var AsyncContextFrame = require('internal/async_context_frame');

// Lazy load
var AsyncResource;
var addAbortListener;
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
var nop = () => {};
function bindAsyncResource(fn, type) {
  AsyncResource ??= require('async_hooks').AsyncResource;
  var resource = new AsyncResource(type);
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return resource.runInAsyncScope.apply(resource, [fn, this].concat(args));
  };
}

/**
 * Returns the current stream error tracked by eos(), if any.
 * @param {import('stream').Stream} stream
 * @returns {Error | null}
 */
function getEosErrored(stream) {
  var errored = isWritableErrored(stream) || isReadableErrored(stream);
  return typeof errored !== 'boolean' && errored || null;
}

/**
 * Returns the error eos() would report from an immediate close, including
 * premature close detection for unfinished readable or writable sides.
 * @param {import('stream').Stream} stream
 * @param {boolean} readable
 * @param {boolean | null} readableFinished
 * @param {boolean} writable
 * @param {boolean | null} writableFinished
 * @returns {Error | null}
 */
function getEosOnCloseError(stream, readable, readableFinished, writable, writableFinished) {
  var errored = getEosErrored(stream);
  if (errored) {
    return errored;
  }
  if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
    if (!isReadableFinished(stream, false)) {
      return new ERR_STREAM_PREMATURE_CLOSE();
    }
  }
  if (writable && !writableFinished) {
    if (!isWritableFinished(stream, false)) {
      return new ERR_STREAM_PREMATURE_CLOSE();
    }
  }
  return null;
}

// Internal only: if eos() can settle immediately, invoke the callback before
// returning cleanup. Callers must tolerate cleanup yet to be assigned.
var kEosNodeSynchronousCallback = Symbol('kEosNodeSynchronousCallback');
function eos(stream, options, callback) {
  if (arguments.length === 2) {
    callback = options;
    options = kEmptyObject;
  } else if (options == null) {
    options = kEmptyObject;
  } else {
    validateObject(options, 'options');
  }
  validateFunction(callback, 'callback');
  validateAbortSignal(options.signal, 'options.signal');
  if (isReadableStream(stream) || isWritableStream(stream)) {
    return eosWeb(stream, options, callback);
  }
  if (!isNodeStream(stream)) {
    throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream);
  }
  var readable = options.readable ?? isReadableNodeStream(stream);
  var writable = options.writable ?? isWritableNodeStream(stream);

  // TODO (ronag): Improve soft detection to include core modules and
  // common ecosystem modules that do properly emit 'close' but fail
  // this generic check.
  var willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
  var writableFinished = isWritableFinished(stream, false);
  var readableFinished = isReadableFinished(stream, false);
  var wState = stream._writableState;
  var rState = stream._readableState;

  /**
   * @type {Error | null | undefined}
   * undefined: to be determined
   * null: no error
   * Error: an error occurred
   */
  var immediateResult;
  if (isClosed(stream)) {
    immediateResult = getEosOnCloseError(stream, readable, readableFinished, writable, writableFinished);
  } else if (wState?.errorEmitted || rState?.errorEmitted) {
    if (!willEmitClose) {
      immediateResult = getEosErrored(stream);
    }
  } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false) && (wState == null || wState.pendingcb === undefined || wState.pendingcb === 0)) {
    immediateResult = getEosErrored(stream);
  } else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false)) {
    immediateResult = getEosErrored(stream);
  } else if (rState && stream.req && stream.aborted) {
    immediateResult = getEosErrored(stream);
  }
  var cleanup = () => {
    callback = nop;
  };
  if (immediateResult !== undefined) {
    if (options.error !== false) {
      stream.on('error', nop);
      cleanup = () => {
        callback = nop;
        stream.removeListener('error', nop);
      };
    }
  } else if (options.signal?.aborted) {
    immediateResult = new AbortError(undefined, {
      cause: options.signal.reason
    });
  }
  if (immediateResult !== undefined && options[kEosNodeSynchronousCallback]) {
    ReflectApply(callback, stream, immediateResult === null ? [] : [immediateResult]);
    return cleanup;
  }
  if (AsyncContextFrame.current() || enabledHooksExist()) {
    // Avoid AsyncResource.bind() because it calls ObjectDefineProperties which
    // is a bottleneck here.
    callback = bindAsyncResource(callback, 'STREAM_END_OF_STREAM');
  }
  if (immediateResult !== undefined) {
    process.nextTick(() => ReflectApply(callback, stream, immediateResult === null ? [] : [immediateResult]));
    return cleanup;
  }
  callback = once(callback);
  var onlegacyfinish = () => {
    if (!stream.writable) {
      onfinish();
    }
  };
  var onfinish = () => {
    writableFinished = true;
    // Stream should not be destroyed here. If it is that
    // means that user space is doing something differently and
    // we cannot trust willEmitClose.
    if (stream.destroyed) {
      willEmitClose = false;
    }
    if (willEmitClose && (!stream.readable || readable)) {
      return;
    }
    if (!readable || readableFinished) {
      callback.call(stream);
    }
  };
  var onend = () => {
    readableFinished = true;
    // Stream should not be destroyed here. If it is that
    // means that user space is doing something differently and
    // we cannot trust willEmitClose.
    if (stream.destroyed) {
      willEmitClose = false;
    }
    if (willEmitClose && (!stream.writable || writable)) {
      return;
    }
    if (!writable || writableFinished) {
      callback.call(stream);
    }
  };
  var onerror = err => {
    callback.call(stream, err);
  };
  var onclose = () => {
    var error = getEosOnCloseError(stream, readable, readableFinished, writable, writableFinished);
    if (error === null) {
      callback.call(stream);
    } else {
      callback.call(stream, error);
    }
  };
  var onrequest = () => {
    stream.req.on('finish', onfinish);
  };
  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    if (!willEmitClose) {
      stream.on('abort', onclose);
    }
    if (stream.req) {
      onrequest();
    } else {
      stream.on('request', onrequest);
    }
  } else if (writable && !wState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  // Not all streams will emit 'close' after 'aborted'.
  if (!willEmitClose && typeof stream.aborted === 'boolean') {
    stream.on('aborted', onclose);
  }
  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (options.error !== false) {
    stream.on('error', onerror);
  }
  stream.on('close', onclose);
  cleanup = () => {
    callback = nop;
    stream.removeListener('aborted', onclose);
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
  if (options.signal) {
    var abort = () => {
      // Keep it because cleanup removes it.
      var endCallback = callback;
      cleanup();
      endCallback.call(stream, new AbortError(undefined, {
        cause: options.signal.reason
      }));
    };
    addAbortListener ??= require('internal/events/abort_listener').addAbortListener;
    var disposable = addAbortListener(options.signal, abort);
    var originalCallback = callback;
    callback = once(function () {
      disposable[SymbolDispose]();
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      ReflectApply(originalCallback, stream, args);
    });
  }
  return cleanup;
}
function eosWeb(stream, options, callback) {
  if (AsyncContextFrame.current() || enabledHooksExist()) {
    // Avoid AsyncResource.bind() because it calls ObjectDefineProperties which
    // is a bottleneck here.
    callback = once(bindAsyncResource(callback, 'STREAM_END_OF_STREAM'));
  } else {
    callback = once(callback);
  }
  var isAborted = false;
  var abort = nop;
  if (options.signal) {
    abort = () => {
      isAborted = true;
      callback.call(stream, new AbortError(undefined, {
        cause: options.signal.reason
      }));
    };
    if (options.signal.aborted) {
      process.nextTick(abort);
    } else {
      addAbortListener ??= require('internal/events/abort_listener').addAbortListener;
      var disposable = addAbortListener(options.signal, abort);
      var originalCallback = callback;
      callback = once(function () {
        disposable[SymbolDispose]();
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        ReflectApply(originalCallback, stream, args);
      });
    }
  }
  var resolverFn = function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    if (!isAborted) {
      process.nextTick(() => ReflectApply(callback, stream, args));
    }
  };
  PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
  return nop;
}
function finished(stream, opts) {
  var autoCleanup = false;
  if (opts === null) {
    opts = kEmptyObject;
  }
  if (opts?.cleanup) {
    validateBoolean(opts.cleanup, 'cleanup');
    autoCleanup = opts.cleanup;
  }
  return new Promise((resolve, reject) => {
    var cleanup = eos(stream, opts, err => {
      if (autoCleanup) {
        cleanup();
      }
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
module.exports = {
  eos,
  finished,
  kEosNodeSynchronousCallback
};

