// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

function _empty() {}
var pumpToWeb = _async(function (readable, writable, finish, _ref3) {
  var {
    end
  } = _ref3;
  if (isTransformStream(writable)) {
    writable = writable.writable;
  }
  // https://streams.spec.whatwg.org/#example-manual-write-with-backpressure
  var writer = writable.getWriter();
  return _continueIgnored(_catch(function () {
    return _continue(_forAwaitOf(readable, function (chunk) {
      return _await(writer.ready, function () {
        writer.write(chunk).catch(() => {});
      });
    }), function () {
      return _await(writer.ready, function () {
        return _invoke(function () {
          if (end) {
            return _awaitIgnored(writer.close());
          }
        }, function () {
          finish();
        });
      });
    });
  }, function (err) {
    return _continueIgnored(_catch(function () {
      return _await(writer.abort(err), function () {
        finish(err);
      });
    }, function (err) {
      finish(err);
    }));
  }));
});
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
var pumpToNode = _async(function (iterable, writable, finish, _ref2) {
  var {
    end
  } = _ref2;
  var error;
  var onresolve = null;
  var resume = err => {
    if (err) {
      error = err;
    }
    if (onresolve) {
      var callback = onresolve;
      onresolve = null;
      callback();
    }
  };
  var wait = () => new Promise((resolve, reject) => {
    if (error) {
      reject(error);
    } else {
      onresolve = () => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
    }
  });
  writable.on('drain', resume);
  var cleanup = eos(writable, {
    readable: false
  }, resume);
  return _continueIgnored(_finallyRethrows(function () {
    return _catch(function () {
      return _invoke(function () {
        if (writable.writableNeedDrain) {
          return _callIgnored(wait);
        }
      }, function () {
        return _continue(_forAwaitOf(iterable, function (chunk) {
          return _invokeIgnored(function () {
            if (!writable.write(chunk)) {
              return _callIgnored(wait);
            }
          });
        }), function () {
          return _invoke(function () {
            if (end) {
              writable.end();
              return _callIgnored(wait);
            }
          }, function () {
            finish();
          });
        });
      });
    }, function (err) {
      finish(error !== err ? aggregateTwoErrors(error, err) : err);
    });
  }, function (_wasThrown, _result) {
    cleanup();
    writable.off('drain', resume);
    return _rethrow(_wasThrown, _result);
  }));
});
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
  }(),
  _earlyReturn = /*#__PURE__*/{},
  _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator",
  _AsyncGenerator = /*#__PURE__*/function () {
    function _AsyncGenerator(entry) {
      this._entry = entry;
      this._pact = null;
      this._resolve = null;
      this._return = null;
      this._promise = null;
    }
    function _wrapReturnedValue(value) {
      return {
        value: value,
        done: true
      };
    }
    function _wrapYieldedValue(value) {
      return {
        value: value,
        done: false
      };
    }
    _AsyncGenerator.prototype._yield = function (value) {
      // Yield the value to the pending next call
      this._resolve(value && value.then ? value.then(_wrapYieldedValue) : _wrapYieldedValue(value));
      // Return a pact for an upcoming next/return/throw call
      return this._pact = new _Pact();
    };
    _AsyncGenerator.prototype.next = function (value) {
      // Advance the generator, starting it if it has yet to be started
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          var _entry = _this._entry;
          if (_entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the next call!
            return resolve(_this._promise);
          }
          // Start the generator
          _this._entry = null;
          _this._resolve = resolve;
          function returnValue(value) {
            _this._resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
            _this._pact = null;
            _this._resolve = null;
          }
          var result = _entry(_this);
          if (result && result.then) {
            result.then(returnValue, function (error) {
              if (error === _earlyReturn) {
                returnValue(_this._return);
              } else {
                var pact = new _Pact();
                _this._resolve(pact);
                _this._pact = null;
                _this._resolve = null;
                _resolve(pact, 2, error);
              }
            });
          } else {
            returnValue(result);
          }
        } else {
          // Generator is started and a yield expression is pending, settle it
          _this._pact = null;
          _this._resolve = resolve;
          _settle(_pact, 1, value);
        }
      });
    };
    _AsyncGenerator.prototype.return = function (value) {
      // Early return from the generator if started, otherwise abandons the generator
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the return call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return the specified value
          _this._entry = null;
          return resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
        }
        // Settle the yield expression with a rejected "early return" value
        _this._return = value;
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, _earlyReturn);
      });
    };
    _AsyncGenerator.prototype.throw = function (error) {
      // Inject an exception into the pending yield expression
      var _this = this;
      return _this._promise = new Promise(function (resolve, reject) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the throw call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return a rejected Promise containing the error
          _this._entry = null;
          return reject(error);
        }
        // Settle the yield expression with the value as a rejection
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, error);
      });
    };
    _AsyncGenerator.prototype[_asyncIteratorSymbol] = function () {
      return this;
    };
    return _AsyncGenerator;
  }();
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
var fromReadable = function (val) {
  return new _AsyncGenerator(function (_generator) {
    Readable ??= require('internal/streams/readable');
    return _generator._yield(Readable.prototype[SymbolAsyncIterator].call(val)).then(_empty);
  });
};
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var {
  ArrayIsArray,
  Promise,
  SymbolAsyncIterator,
  SymbolDispose
} = primordials;
var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _forTo(array, body, check) {
  var i = -1,
    pact,
    reject;
  function _cycle(result) {
    try {
      while (++i < array.length && (!check || !check())) {
        result = body(i);
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
            return;
          }
        }
      }
      if (pact) {
        _settle(pact, 1, result);
      } else {
        pact = result;
      }
    } catch (e) {
      _settle(pact || (pact = new _Pact()), 2, e);
    }
  }
  _cycle();
  return pact;
}
var {
  eos
} = require('internal/streams/end-of-stream');
function _forOf(target, body, check) {
  if (typeof target[_iteratorSymbol] === "function") {
    var iterator = target[_iteratorSymbol](),
      step,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (!(step = iterator.next()).done && (!check || !check())) {
          result = body(step.value);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    if (iterator.return) {
      var _fixup = function (value) {
        try {
          if (!step.done) {
            iterator.return();
          }
        } catch (e) {}
        return value;
      };
      if (pact && pact.then) {
        return pact.then(_fixup, function (e) {
          throw _fixup(e);
        });
      }
      _fixup();
    }
    return pact;
  }
  // No support for Symbol.iterator
  if (!("length" in target)) {
    throw new TypeError("Object is not iterable");
  }
  // Handle live collections properly
  var values = [];
  for (var i = 0; i < target.length; i++) {
    values.push(target[i]);
  }
  return _forTo(values, function (i) {
    return body(values[i]);
  }, check);
}
var {
  once
} = require('internal/util');
function _forAwaitOf(target, body, check) {
  if (typeof target[_asyncIteratorSymbol] === "function") {
    var pact = new _Pact();
    var iterator = target[_asyncIteratorSymbol]();
    iterator.next().then(_resumeAfterNext).then(void 0, _reject);
    return pact;
    function _resumeAfterBody(result) {
      if (check && check()) {
        return _settle(pact, 1, iterator.return ? iterator.return().then(function () {
          return result;
        }) : result);
      }
      iterator.next().then(_resumeAfterNext).then(void 0, _reject);
    }
    function _resumeAfterNext(step) {
      if (step.done) {
        _settle(pact, 1);
      } else {
        Promise.resolve(body(step.value)).then(_resumeAfterBody).then(void 0, _reject);
      }
    }
    function _reject(error) {
      _settle(pact, 2, iterator.return ? iterator.return().then(function () {
        return error;
      }) : error);
    }
  }
  return Promise.resolve(_forOf(target, function (value) {
    return Promise.resolve(value).then(body);
  }, check));
}
var destroyImpl = require('internal/streams/destroy');
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var Duplex = require('internal/streams/duplex');
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
var {
  AbortError,
  aggregateTwoErrors,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_RETURN_VALUE,
    ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED,
    ERR_STREAM_PREMATURE_CLOSE,
    ERR_STREAM_UNABLE_TO_PIPE
  }
} = require('internal/errors');
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
var {
  validateFunction,
  validateAbortSignal
} = require('internal/validators');
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
var {
  isIterable,
  isReadable,
  isReadableNodeStream,
  isNodeStream,
  isTransformStream,
  isWebStream,
  isReadableStream,
  isReadableFinished
} = require('internal/streams/utils');
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
}
var {
  AbortController
} = require('internal/abort_controller');
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
var PassThrough;
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
var Readable;
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var addAbortListener;
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function destroyer(stream, reading, writing) {
  var finished = false;
  stream.on('close', () => {
    finished = true;
  });
  var cleanup = eos(stream, {
    readable: reading,
    writable: writing
  }, err => {
    finished = !err;
  });
  return {
    destroy: err => {
      if (finished) return;
      finished = true;
      destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED('pipe'));
    },
    cleanup
  };
}
function popCallback(streams) {
  // Streams should never be an empty array. It should always contain at least
  // a single stream. Therefore optimize for the average case instead of
  // checking for length === 0 as well.
  validateFunction(streams[streams.length - 1], 'streams[stream.length - 1]');
  return streams.pop();
}
function makeAsyncIterable(val) {
  if (isIterable(val)) {
    return val;
  } else if (isReadableNodeStream(val)) {
    // Legacy streams are not Iterable.
    return fromReadable(val);
  }
  throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], val);
}
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  return pipelineImpl(streams, once(popCallback(streams)));
}
function pipelineImpl(streams, callback, opts) {
  if (streams.length === 1 && ArrayIsArray(streams[0])) {
    streams = streams[0];
  }
  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }
  var ac = new AbortController();
  var signal = ac.signal;
  var outerSignal = opts?.signal;

  // Need to cleanup event listeners if last stream is readable
  // https://github.com/nodejs/node/issues/35452
  var lastStreamCleanup = [];
  validateAbortSignal(outerSignal, 'options.signal');
  function abort() {
    finishImpl(new AbortError(undefined, {
      cause: outerSignal?.reason
    }));
  }
  addAbortListener ??= require('internal/events/abort_listener').addAbortListener;
  var disposable;
  if (outerSignal) {
    disposable = addAbortListener(outerSignal, abort);
  }
  var error;
  var value;
  var destroys = [];
  var finishCount = 0;
  function finish(err) {
    finishImpl(err, --finishCount === 0);
  }
  function finishOnlyHandleError(err) {
    finishImpl(err, false);
  }
  function finishImpl(err, final) {
    if (err && (!error || error.code === 'ERR_STREAM_PREMATURE_CLOSE' || error.name === 'AbortError')) {
      error = err;
    }
    if (!error && !final) {
      return;
    }
    while (destroys.length) {
      destroys.shift()(error);
    }
    disposable?.[SymbolDispose]();
    ac.abort();
    if (final) {
      if (!error) {
        lastStreamCleanup.forEach(fn => fn());
      }
      process.nextTick(callback, error, value);
    }
  }
  var ret;
  var _loop = function () {
    var stream = streams[i];
    var reading = i < streams.length - 1;
    var writing = i > 0;
    var next = i + 1 < streams.length ? streams[i + 1] : null;
    var end = reading || opts?.end !== false;
    var isLastStream = i === streams.length - 1;
    if (isNodeStream(stream)) {
      if (next !== null && (next?.closed || next?.destroyed)) {
        throw new ERR_STREAM_UNABLE_TO_PIPE();
      }
      if (end) {
        var {
          destroy,
          cleanup
        } = destroyer(stream, reading, writing);
        destroys.push(destroy);
        if (isReadable(stream) && isLastStream) {
          lastStreamCleanup.push(cleanup);
        }
      }

      // Catch stream errors that occur after pipe/pump has completed.
      function onError(err) {
        if (err && err.name !== 'AbortError' && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
          finishOnlyHandleError(err);
        }
      }
      stream.on('error', onError);
      if (isReadable(stream) && isLastStream) {
        lastStreamCleanup.push(() => {
          stream.removeListener('error', onError);
        });
      }
    }
    if (i === 0) {
      if (typeof stream === 'function') {
        ret = stream({
          signal
        });
        if (!isIterable(ret)) {
          throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or Stream', 'source', ret);
        }
      } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
        ret = stream;
      } else {
        ret = Duplex.from(stream);
      }
    } else if (typeof stream === 'function') {
      if (isTransformStream(ret)) {
        ret = makeAsyncIterable(ret?.readable);
      } else {
        ret = makeAsyncIterable(ret);
      }
      ret = stream(ret, {
        signal
      });
      if (reading) {
        if (!isIterable(ret, true)) {
          throw new ERR_INVALID_RETURN_VALUE('AsyncIterable', `transform[${i - 1}]`, ret);
        }
      } else {
        PassThrough ??= require('internal/streams/passthrough');

        // If the last argument to pipeline is not a stream
        // we must create a proxy stream so that pipeline(...)
        // always returns a stream which can be further
        // composed through `.pipe(stream)`.

        var pt = new PassThrough({
          objectMode: true
        });

        // Handle Promises/A+ spec, `then` could be a getter that throws on
        // second use.
        var then = ret?.then;
        if (typeof then === 'function') {
          finishCount++;
          then.call(ret, val => {
            value = val;
            if (val != null) {
              pt.write(val);
            }
            if (end) {
              pt.end();
            }
            process.nextTick(finish);
          }, err => {
            pt.destroy(err);
            process.nextTick(finish, err);
          });
        } else if (isIterable(ret, true)) {
          finishCount++;
          pumpToNode(ret, pt, finish, {
            end
          });
        } else if (isReadableStream(ret) || isTransformStream(ret)) {
          var toRead = ret.readable || ret;
          finishCount++;
          pumpToNode(toRead, pt, finish, {
            end
          });
        } else {
          throw new ERR_INVALID_RETURN_VALUE('AsyncIterable or Promise', 'destination', ret);
        }
        ret = pt;
        var {
          destroy: _destroy,
          cleanup: _cleanup
        } = destroyer(ret, false, true);
        destroys.push(_destroy);
        if (isLastStream) {
          lastStreamCleanup.push(_cleanup);
        }
      }
    } else if (isNodeStream(stream)) {
      if (isReadableNodeStream(ret)) {
        finishCount += 2;
        var _cleanup2 = pipe(ret, stream, finish, finishOnlyHandleError, {
          end
        });
        if (isReadable(stream) && isLastStream) {
          lastStreamCleanup.push(_cleanup2);
        }
      } else if (isTransformStream(ret) || isReadableStream(ret)) {
        var _toRead = ret.readable || ret;
        finishCount++;
        pumpToNode(_toRead, stream, finish, {
          end
        });
      } else if (isIterable(ret)) {
        finishCount++;
        pumpToNode(ret, stream, finish, {
          end
        });
      } else {
        throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], ret);
      }
      ret = stream;
    } else if (isWebStream(stream)) {
      if (isReadableNodeStream(ret)) {
        finishCount++;
        pumpToWeb(makeAsyncIterable(ret), stream, finish, {
          end
        });
      } else if (isReadableStream(ret) || isIterable(ret)) {
        finishCount++;
        pumpToWeb(ret, stream, finish, {
          end
        });
      } else if (isTransformStream(ret)) {
        finishCount++;
        pumpToWeb(ret.readable, stream, finish, {
          end
        });
      } else {
        throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], ret);
      }
      ret = stream;
    } else {
      ret = Duplex.from(stream);
    }
  };
  for (var i = 0; i < streams.length; i++) {
    _loop();
  }
  if (signal?.aborted || outerSignal?.aborted) {
    process.nextTick(abort);
  }
  return ret;
}
function pipe(src, dst, finish, finishOnlyHandleError, _ref) {
  var {
    end
  } = _ref;
  var ended = false;
  dst.on('close', () => {
    if (!ended) {
      // Finish if the destination closes before the source has completed.
      finishOnlyHandleError(new ERR_STREAM_PREMATURE_CLOSE());
    }
  });
  src.pipe(dst, {
    end: false
  }); // If end is true we already will have a listener to end dst.

  if (end) {
    // Compat. Before node v10.12.0 stdio used to throw an error so
    // pipe() did/does not end() stdio destinations.
    // Now they allow it but "secretly" don't close the underlying fd.

    function endFn() {
      ended = true;
      dst.end();
    }
    if (isReadableFinished(src)) {
      // End the destination if the source has already ended.
      process.nextTick(endFn);
    } else {
      src.once('end', endFn);
    }
  } else {
    finish();
  }
  eos(src, {
    readable: true,
    writable: false
  }, err => {
    var rState = src._readableState;
    if (err && err.code === 'ERR_STREAM_PREMATURE_CLOSE' && rState?.ended && !rState.errored && !rState.errorEmitted) {
      // Some readable streams will emit 'close' before 'end'. However, since
      // this is on the readable side 'end' should still be emitted if the
      // stream has been ended and no error emitted. This should be allowed in
      // favor of backwards compatibility. Since the stream is piped to a
      // destination this should not result in any observable difference.
      // We don't need to check if this is a writable premature close since
      // eos will only fail with premature close on the reading side for
      // duplex streams.
      src.once('end', finish).once('error', finish);
    } else {
      finish(err);
    }
  });
  return eos(dst, {
    readable: false,
    writable: true
  }, finish);
}
module.exports = {
  pipelineImpl,
  pipeline
};

