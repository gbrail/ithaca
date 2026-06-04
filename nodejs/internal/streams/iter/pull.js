'use strict';

// New Streams API - Pull Pipeline
//
// pull(), pullSync(), pipeTo(), pipeToSync()
// Pull-through pipelines with transforms. Data flows on-demand from source
// through transforms to consumer.
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
/**
 * Write an async source through transforms to a writer.
 * @param {AsyncIterable<Uint8Array[]>|Iterable<Uint8Array[]>} source
 * @param {...(Function|object)} args - Transforms, writer, and optional options
 * @returns {Promise<number>} Total bytes written
 */
var pipeTo = _async(function (source) {
  var _exit14 = false;
  // Async fallback for writeBatch when sync write fails partway through.
  // Continues writing from batch[startIndex] using async write().
  // Write a batch using try-fallback: sync first, async if needed.
  // Returns undefined on sync success, or a Promise when async fallback
  // is required. Callers must check: const p = writeBatch(b); if (p) await p;
  var writeBatchAsyncFallback = _async(function (batch, startIndex) {
    var i = startIndex;
    return _continueIgnored(_for(function () {
      return i < batch.length;
    }, function () {
      return i++;
    }, function () {
      var chunk = batch[i];
      return _invoke(function () {
        if (hasWriteSync && writer.writeSync(chunk)) {} else return _invokeIgnored(function () {
          if (syncFalseWasAccepted()) {
            totalBytes += TypedArrayPrototypeGetByteLength(chunk);
            return _callIgnored(waitForSyncBackpressure);
          } else {
            var result = writer.write(chunk, signal ? {
              __proto__: null,
              signal
            } : undefined);
            return _invokeIgnored(function () {
              if (result !== undefined) {
                return _awaitIgnored(result);
              }
            });
          }
        });
      }, function () {
        totalBytes += TypedArrayPrototypeGetByteLength(chunk);
      });
    }));
  });
  var writeBatchAfterAcceptedBackpressure = function (batch, startIndex) {
    return _call(waitForSyncBackpressure, function () {
      return _awaitIgnored(writeBatchAsyncFallback(batch, startIndex));
    });
  };
  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }
  var {
    transforms,
    writer,
    options
  } = parsePipeToArgs(args, 'write');
  if (options?.signal !== undefined) {
    validateAbortSignal(options.signal, 'options.signal');
  }

  // Handle transform-writer
  if (isTransformObject(writer)) {
    ArrayPrototypePush(transforms, writer);
  }
  var signal = options?.signal;

  // Check for abort
  signal?.throwIfAborted();
  var hasWriteSync = typeof writer.writeSync === 'function';
  var useSyncIterableFastPath = hasWriteSync && canUseSyncIterablePipeToFastPath(source, transforms, signal);
  var normalized = useSyncIterableFastPath ? undefined : from(source);
  var totalBytes = 0;
  var hasWritev = typeof writer.writev === 'function';
  var hasWritevSync = typeof writer.writevSync === 'function';
  var hasEndSync = typeof writer.endSync === 'function';
  function syncFalseWasAccepted() {
    return syncFalseCanBeAccepted && writer.desiredSize === 0;
  }
  function waitForSyncBackpressure() {
    var ondrain = writer[drainableProtocol];
    return ondrain?.call(writer);
  }
  function writeBatch(batch) {
    if (hasWritev && batch.length > 1) {
      if (!hasWritevSync || !writer.writevSync(batch)) {
        if (hasWritevSync && syncFalseWasAccepted()) {
          for (var _i5 = 0; _i5 < batch.length; _i5++) {
            totalBytes += TypedArrayPrototypeGetByteLength(batch[_i5]);
          }
          return waitForSyncBackpressure();
        }
        var opts = signal ? {
          __proto__: null,
          signal
        } : undefined;
        return PromisePrototypeThen(writer.writev(batch, opts), () => {
          for (var _i6 = 0; _i6 < batch.length; _i6++) {
            totalBytes += TypedArrayPrototypeGetByteLength(batch[_i6]);
          }
        });
      }
      for (var _i7 = 0; _i7 < batch.length; _i7++) {
        totalBytes += TypedArrayPrototypeGetByteLength(batch[_i7]);
      }
      return;
    }
    for (var _i8 = 0; _i8 < batch.length; _i8++) {
      var chunk = batch[_i8];
      if (!hasWriteSync || !writer.writeSync(chunk)) {
        if (hasWriteSync && syncFalseWasAccepted()) {
          totalBytes += TypedArrayPrototypeGetByteLength(chunk);
          return writeBatchAfterAcceptedBackpressure(batch, _i8 + 1);
        }
        // Sync path failed at index i - fall back to async for the rest.
        // Count bytes for chunks already written synchronously (0..i-1).
        return writeBatchAsyncFallback(batch, _i8);
      }
      totalBytes += TypedArrayPrototypeGetByteLength(chunk);
    }
  }
  var syncFalseCanBeAccepted = writer[kSyncWriteAcceptedOnFalse] === true;
  return _continue(_catch(function () {
    return _invoke(function () {
      if (useSyncIterableFastPath) {
        // Avoid from()'s async sync-iterable batching path. This keeps writes
        // incremental for synchronous sources while preserving async
        // normalization for non-primitive yielded values.
        return _continueIgnored(_forOf(source, function (value) {
          return _invoke(function () {
            if (isUint8ArrayBatch(value)) {
              return _invokeIgnored(function () {
                if (value.length > 0) {
                  var p = writeBatch(value);
                  return _invokeIgnored(function () {
                    if (p) return _awaitIgnored(p);
                  });
                }
              });
            }
          }, function () {
            return _invoke(function () {
              if (isUint8Array(value)) {
                var p = writeBatch([value]);
                return _invokeIgnored(function () {
                  if (p) return _awaitIgnored(p);
                });
              }
            }, function () {
              return _await(ArrayFromAsync(normalizeAsyncValue(value)), function (batch) {
                return _invokeIgnored(function () {
                  if (batch.length > 0) {
                    var p = writeBatch(batch);
                    return _invokeIgnored(function () {
                      if (p) return _awaitIgnored(p);
                    });
                  }
                });
              });
            });
          });
        }));
      } else return _invokeIgnored(function () {
        if (transforms.length === 0) {
          // Fast path: no transforms - iterate normalized source directly
          return _invokeIgnored(function () {
            if (signal) {
              return _continueIgnored(_forAwaitOf(normalized, function (batch) {
                signal.throwIfAborted();
                var p = writeBatch(batch);
                return _invokeIgnored(function () {
                  if (p) return _awaitIgnored(p);
                });
              }));
            } else {
              return _continueIgnored(_forAwaitOf(normalized, function (batch) {
                var p = writeBatch(batch);
                return _invokeIgnored(function () {
                  if (p) return _awaitIgnored(p);
                });
              }));
            }
          });
        } else {
          var pipeline = createAsyncPipeline(normalized, transforms, signal);
          return _invokeIgnored(function () {
            if (signal) {
              return _continueIgnored(_forAwaitOf(pipeline, function (batch) {
                signal.throwIfAborted();
                var p = writeBatch(batch);
                return _invokeIgnored(function () {
                  if (p) return _awaitIgnored(p);
                });
              }));
            } else {
              return _continueIgnored(_forAwaitOf(pipeline, function (batch) {
                var p = writeBatch(batch);
                return _invokeIgnored(function () {
                  if (p) return _awaitIgnored(p);
                });
              }));
            }
          });
        }
      });
    }, function () {
      return _invokeIgnored(function () {
        if (!options?.preventClose) {
          return _invokeIgnored(function () {
            if (!hasEndSync || writer.endSync() < 0) {
              return _awaitIgnored(writer.end?.(signal ? {
                __proto__: null,
                signal
              } : undefined));
            }
          });
        }
      });
    });
  }, function (error) {
    if (!options?.preventFail) {
      writer.fail?.(wrapError(error));
    }
    throw error;
  }), function (_result15) {
    return _exit14 ? _result15 : totalBytes;
  });
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
function _empty() {}
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
/**
 * Create an async pipeline from source through transforms.
 * @yields {Uint8Array[]}
 */
var createAsyncPipeline = function (source, transforms, signal) {
  return new _AsyncGenerator(function (_generator9) {
    var _exit13 = false;
    // Check for abort
    signal?.throwIfAborted();
    var normalized = source;

    // Fast path: no transforms, just yield normalized source directly
    return _invoke(function () {
      if (transforms.length === 0) {
        return _continue(_forAwaitOf(normalized, function (batch) {
          signal?.throwIfAborted();
          return _generator9._yield(batch).then(_empty);
        }), function () {
          _exit13 = true;
        });
      }
    }, function (_result13) {
      if (_exit13) return _result13;
      // Create internal controller for transform cancellation.
      // Note: if signal was already aborted, we threw above - no need to check here.
      var controller = new AbortController();
      var abortHandler;
      if (signal) {
        abortHandler = () => {
          controller.abort(signal.reason ?? lazyDOMException('Aborted', 'AbortError'));
        };
        signal.addEventListener('abort', abortHandler, {
          __proto__: null,
          once: true
        });
      }

      // Apply transforms - fuse consecutive stateless transforms into a single
      // generator layer to avoid unnecessary async generator ticks.
      //
      // INVARIANT: Each transform invocation MUST receive its own fresh options
      // object ({ __proto__: null, signal }). Transforms may mutate the options
      // object, so sharing a single object across invocations would allow one
      // transform to corrupt the options seen by another. The signal is shared
      // across calls (mutations to it are acceptable), but the containing options
      // object must be unique per call. This is enforced inside
      // applyFusedStatelessAsyncTransforms and applyStatefulAsyncTransform, which
      // accept the signal directly and create the options object per invocation.
      // DO NOT pass a pre-built options object.
      var current = normalized;
      var transformSignal = controller.signal;
      var statelessRun = [];
      for (var _i4 = 0; _i4 < transforms.length; _i4++) {
        var transform = transforms[_i4];
        if (isTransformObject(transform)) {
          // Flush any accumulated stateless run before the stateful transform
          if (statelessRun.length > 0) {
            current = applyFusedStatelessAsyncTransforms(current, statelessRun, transformSignal);
            statelessRun = [];
          }
          var opts = {
            __proto__: null,
            signal: transformSignal
          };
          if (transform[kValidatedTransform]) {
            current = applyValidatedStatefulAsyncTransform(current, transform.transform, opts);
          } else {
            current = applyStatefulAsyncTransform(current, transform.transform, opts);
          }
        } else {
          ArrayPrototypePush(statelessRun, transform);
        }
      }
      // Flush remaining stateless run
      if (statelessRun.length > 0) {
        current = applyFusedStatelessAsyncTransforms(current, statelessRun, transformSignal);
      }
      var completed = false;
      return _finallyRethrows(function () {
        return _catchInGenerator(function () {
          return _continue(_forAwaitOf(current, function (batch) {
            controller.signal.throwIfAborted();
            return _generator9._yield(batch).then(_empty);
          }), function () {
            completed = true;
          });
        }, function (error) {
          if (!controller.signal.aborted) {
            controller.abort(wrapError(error));
          }
          throw error;
        });
      }, function (_wasThrown, _result14) {
        if (!completed && !controller.signal.aborted) {
          // Consumer stopped early or generator return() was called.
          // If a transform listener throws here, let it propagate.
          controller.abort(lazyDOMException('Aborted', 'AbortError'));
        }
        // Clean up user signal listener to prevent holding controller alive
        if (signal && abortHandler) {
          signal.removeEventListener('abort', abortHandler);
        }
        return _rethrow(_wasThrown, _result14);
      });
    });
  });
}; // =============================================================================
// Public API: pull() and pullSync()
// =============================================================================
/**
 * Create a sync pull-through pipeline with transforms.
 * @param {Iterable} source - The sync streamable source
 * @param {...Function} transforms - Variadic transforms
 * @returns {Iterable<Uint8Array[]>}
 */
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
/**
 * Fast path for validated stateful transforms (e.g. compression).
 * Skips withFlushAsync (transform handles done internally) and
 * skips isUint8ArrayBatch validation (transform guarantees valid output).
 * @yields {Uint8Array[]}
 */
var applyValidatedStatefulAsyncTransform = function (source, transform, options) {
  return new _AsyncGenerator(function (_generator8) {
    var output = transform(source, options);
    return _continue(_forAwaitOf(output, function (batch) {
      return _invokeIgnored(function () {
        if (batch.length > 0) {
          return _generator8._yield(batch).then(_empty);
        }
      });
    }), function () {
      // Check abort after the transform completes - without the
      // withFlushAsync wrapper there is no extra yield to give
      // the outer pipeline a chance to see the abort.
      options.signal?.throwIfAborted();
    });
  });
};
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
var applyStatefulAsyncTransform = function (source, transform, options) {
  return new _AsyncGenerator(function (_generator7) {
    var output = transform(withFlushAsync(source), options);
    return _continueIgnored(_forAwaitOf(output, function (item) {
      // Fast path: item is already a Uint8Array[] batch (e.g. compression transforms)
      return _invoke(function () {
        if (isUint8ArrayBatch(item)) {
          return _invokeIgnored(function () {
            if (item.length > 0) {
              return _generator7._yield(item).then(_empty);
            }
          });
        }
      }, function () {
        // Fast path: single Uint8Array
        return _invoke(function () {
          if (isUint8Array(item)) {
            return _generator7._yield([item]).then(_empty);
          }
        }, function () {
          // Slow path: flatten arbitrary transform yield
          var batch = [];
          return _continue(_forAwaitOf(flattenTransformYieldAsync(item), function (chunk) {
            ArrayPrototypePush(batch, chunk);
          }), function () {
            return _invokeIgnored(function () {
              if (batch.length > 0) {
                return _generator7._yield(batch).then(_empty);
              }
            });
          });
        });
      });
    }));
  });
};
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
/**
 * Append a null flush signal after the source is exhausted.
 * @yields {Uint8Array[]}
 */
/**
 * Append a null flush signal after the source is exhausted.
 * @yields {Uint8Array[]}
 */
var withFlushAsync = function (source) {
  return new _AsyncGenerator(function (_generator6) {
    return _generator6._yield(source).then(function () {
      return _generator6._yield(null).then(_empty);
    });
  });
};
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
// =============================================================================
// Async Pipeline Implementation
// =============================================================================
/**
 * Apply a single stateless async transform to a source.
 * @yields {Uint8Array[]}
 */
/**
 * Apply a fused run of stateless async transforms to a source.
 * All transforms in the run are applied in a tight synchronous loop per batch,
 * avoiding the overhead of N async generator ticks for N transforms.
 *
 * INVARIANT: This function accepts a signal, NOT a pre-built options object.
 * A fresh { __proto__: null, signal } options object is created for each
 * transform invocation to prevent cross-transform mutation.
 * @param {AsyncIterable<Uint8Array[]>} source
 * @param {Array<Function>} run - Array of stateless transform functions
 * @param {AbortSignal} signal - The pipeline's abort signal
 * @yields {Uint8Array[]}
 */
var applyFusedStatelessAsyncTransforms = function (source, run, signal) {
  return new _AsyncGenerator(function (_generator5) {
    return _continue(_forAwaitOf(source, function (chunks) {
      var _interrupt = false;
      var current = chunks;
      return _continue(_forTo(run, function (i) {
        var result = run[i](current, {
          __proto__: null,
          signal
        });
        if (result === null) {
          current = null;
          _interrupt = true;
          return;
        }
        return _invokeIgnored(function () {
          if (isPromise(result)) {
            return _await(result, function (resolved) {
              if (resolved === null) {
                current = null;
                _interrupt = true;
                return;
              }
              current = resolved;
            });
          } else {
            current = result;
          }
        });
      }, function () {
        return _interrupt || _interrupt;
      }), function () {
        if (current === null) return;
        // Normalize the final output
        return _invokeIgnored(function () {
          if (isUint8ArrayBatch(current)) {
            return _invokeIgnored(function () {
              if (current.length > 0) return _generator5._yield(current).then(_empty);
            });
          } else return _invokeIgnored(function () {
            if (isUint8Array(current)) {
              return _generator5._yield([current]).then(_empty);
            } else return _invokeIgnored(function () {
              if (typeof current === 'string') {
                return _generator5._yield([toUint8Array(current)]).then(_empty);
              } else return _invokeIgnored(function () {
                if (isAnyArrayBuffer(current)) {
                  return _generator5._yield([new Uint8Array(current)]).then(_empty);
                } else return _invokeIgnored(function () {
                  if (ArrayBufferIsView(current)) {
                    return _generator5._yield([arrayBufferViewToUint8Array(current)]).then(_empty);
                  } else {
                    return _generator5._yield(processTransformResultAsync(current)).then(_empty);
                  }
                });
              });
            });
          });
        });
      });
    }), function () {
      // Flush each transform after all upstream data, including data emitted by
      // earlier flushes, has been processed by that transform.
      var pending = [];
      return _continue(_forTo(run, function (i) {
        var next = [];
        return _continue(_forTo(pending, function (j) {
          return _awaitIgnored(appendTransformResultAsync(next, run[i](pending[j], {
            __proto__: null,
            signal
          })));
        }), function () {
          return _await(appendTransformResultAsync(next, run[i](null, {
            __proto__: null,
            signal
          })), function () {
            pending = next;
          });
        });
      }), function () {
        return _continueIgnored(_forTo(pending, function (i) {
          return _generator5._yield(pending[i]).then(_empty);
        }));
      });
    });
  });
};
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
/**
 * Append normalized transform result batches to an array (async).
 * @param {Array<Uint8Array[]>} target
 * @param {*} result
 * @returns {Promise<void>}
 */
var appendTransformResultAsync = _async(function (target, result) {
  return _continueIgnored(_forAwaitOf(processTransformResultAsync(result), function (batch) {
    ArrayPrototypePush(target, batch);
  }));
}); // =============================================================================
// Sync Pipeline Implementation
// =============================================================================
/**
 * Apply a single stateless sync transform to a source.
 * @yields {Uint8Array[]}
 */
/**
 * Apply a fused run of stateless sync transforms.
 * @param {Iterable<Uint8Array[]>} source
 * @param {Array<Function>} run - Array of stateless transform functions
 * @yields {Uint8Array[]}
 */
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
/**
 * Process transform result (async).
 * @yields {Uint8Array[]}
 */
var processTransformResultAsync = function (result) {
  return new _AsyncGenerator(function (_generator4) {
    var _exit7 = false;
    // Handle Promise
    return _invoke(function () {
      if (isPromise(result)) {
        return _await(result, function (resolved) {
          return _generator4._yield(processTransformResultAsync(resolved)).then(function () {
            _exit7 = true;
          });
        });
      }
    }, function (_result7) {
      var _exit8 = false;
      if (_exit7) return _result7;
      if (result === null) {
        return;
      }
      // Single Uint8Array -> wrap as batch
      // String -> UTF-8 encode and wrap as batch
      // ArrayBuffer / ArrayBufferView -> convert and wrap
      // Uint8Array[] batch
      // Check for async iterable/generator first
      // Sync Iterable or Generator
      return _invoke(function () {
        if (isUint8Array(result)) {
          return _generator4._yield([result]).then(function () {
            _exit8 = true;
          });
        }
      }, function (_result8) {
        var _exit9 = false;
        if (_exit8) return _result8;
        return _invoke(function () {
          if (typeof result === 'string') {
            return _generator4._yield([toUint8Array(result)]).then(function () {
              _exit9 = true;
            });
          }
        }, function (_result9) {
          var _exit0 = false;
          if (_exit9) return _result9;
          return _invoke(function () {
            if (isAnyArrayBuffer(result)) {
              return _generator4._yield([new Uint8Array(result)]).then(function () {
                _exit0 = true;
              });
            }
          }, function (_result0) {
            var _exit1 = false;
            if (_exit0) return _result0;
            return _invoke(function () {
              if (ArrayBufferIsView(result)) {
                return _generator4._yield([arrayBufferViewToUint8Array(result)]).then(function () {
                  _exit1 = true;
                });
              }
            }, function (_result1) {
              var _exit10 = false;
              if (_exit1) return _result1;
              return _invoke(function () {
                if (isUint8ArrayBatch(result)) {
                  return _invoke(function () {
                    if (result.length > 0) {
                      return _generator4._yield(result).then(_empty);
                    }
                  }, function () {
                    _exit10 = true;
                  });
                }
              }, function (_result10) {
                var _exit11 = false;
                if (_exit10) return _result10;
                return _invoke(function () {
                  if (isAsyncIterable(result)) {
                    var batch = [];
                    return _continue(_forAwaitOf(result, function (item) {
                      if (isUint8Array(item)) {
                        ArrayPrototypePush(batch, item);
                        return;
                      }
                      return _continueIgnored(_forAwaitOf(flattenTransformYieldAsync(item), function (chunk) {
                        ArrayPrototypePush(batch, chunk);
                      }));
                    }), function () {
                      return _invoke(function () {
                        if (batch.length > 0) {
                          return _generator4._yield(batch).then(_empty);
                        }
                      }, function () {
                        _exit11 = true;
                      });
                    });
                  }
                }, function (_result11) {
                  var _exit12 = false;
                  if (_exit11) return _result11;
                  return _invoke(function () {
                    if (isSyncIterable(result)) {
                      var batch = [];
                      for (var item of result) {
                        if (isUint8Array(item)) {
                          ArrayPrototypePush(batch, item);
                          continue;
                        }
                        // Note: This iteration is synchronous, since async iterables
                        // may not be nested within sync iterables.
                        for (var chunk of flattenTransformYieldSync(item)) {
                          ArrayPrototypePush(batch, chunk);
                        }
                      }
                      return _invoke(function () {
                        if (batch.length > 0) {
                          return _generator4._yield(batch).then(_empty);
                        }
                      }, function () {
                        _exit12 = true;
                      });
                    }
                  }, function (_result12) {
                    if (_exit12) return _result12;
                    throw new ERR_INVALID_ARG_TYPE('result', ['null', 'Uint8Array', 'string', 'ArrayBuffer', 'ArrayBufferView', 'Array', 'Iterable', 'AsyncIterable', 'Promise'], result);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};
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
/**
 * Flatten transform yield to Uint8Array chunks (async).
 * @yields {Uint8Array}
 */
var flattenTransformYieldAsync = function (value) {
  return new _AsyncGenerator(function (_generator3) {
    var _exit = false;
    return _invoke(function () {
      if (isUint8Array(value)) {
        return _generator3._yield(value).then(function () {
          _exit = true;
        });
      }
    }, function (_result) {
      var _exit2 = false;
      if (_exit) return _result;
      return _invoke(function () {
        if (typeof value === 'string') {
          return _generator3._yield(toUint8Array(value)).then(function () {
            _exit2 = true;
          });
        }
      }, function (_result2) {
        var _exit3 = false;
        if (_exit2) return _result2;
        return _invoke(function () {
          if (isAnyArrayBuffer(value)) {
            return _generator3._yield(new Uint8Array(value)).then(function () {
              _exit3 = true;
            });
          }
        }, function (_result3) {
          var _exit4 = false;
          if (_exit3) return _result3;
          return _invoke(function () {
            if (ArrayBufferIsView(value)) {
              return _generator3._yield(arrayBufferViewToUint8Array(value)).then(function () {
                _exit4 = true;
              });
            }
          }, function (_result4) {
            var _exit5 = false;
            if (_exit4) return _result4;
            // Check for async iterable first
            // Must be sync Iterable<TransformYield>, no nested async iterables
            return _invoke(function () {
              if (isAsyncIterable(value)) {
                return _continue(_forAwaitOf(value, function (item) {
                  return _generator3._yield(flattenTransformYieldAsync(item)).then(_empty);
                }), function () {
                  _exit5 = true;
                });
              }
            }, function (_result5) {
              var _exit6 = false;
              if (_exit5) return _result5;
              return _invoke(function () {
                if (isSyncIterable(value)) {
                  return _continue(_forOf(value, function (item) {
                    return _generator3._yield(flattenTransformYieldSync(item)).then(_empty);
                  }), function () {
                    _exit6 = true;
                  });
                }
              }, function (_result6) {
                if (_exit6) return _result6;
                throw new ERR_INVALID_ARG_TYPE('value', ['Uint8Array', 'string', 'ArrayBuffer', 'ArrayBufferView', 'Iterable', 'AsyncIterable'], value);
              });
            });
          });
        });
      });
    });
  });
};
/**
 * Process transform result (sync).
 * @yields {Uint8Array[]}
 */
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var {
  ArrayBufferIsView,
  ArrayFromAsync,
  ArrayIsArray,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  PromisePrototypeThen,
  SymbolAsyncIterator,
  SymbolIterator,
  TypedArrayPrototypeGetByteLength,
  Uint8Array
} = primordials;
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE
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
  lazyDOMException
} = require('internal/util');
function _catchInGenerator(body, recover) {
  return _catch(body, function (e) {
    if (e === _earlyReturn) {
      throw e;
    }
    return recover(e);
  });
}
var {
  validateAbortSignal
} = require('internal/validators');
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
var {
  isAnyArrayBuffer,
  isPromise,
  isUint8Array
} = require('internal/util/types');
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
var {
  arrayBufferViewToUint8Array,
  from,
  fromSync,
  isSyncIterable,
  isAsyncIterable,
  isPrimitiveChunk,
  isUint8ArrayBatch,
  normalizeAsyncValue
} = require('internal/streams/iter/from');
function _callIgnored(body, direct) {
  return _call(body, _empty, direct);
}
var {
  isPullOptions,
  isTransform,
  isTransformObject,
  parsePullArgs,
  toUint8Array,
  wrapError
} = require('internal/streams/iter/utils');
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
var {
  drainableProtocol,
  kSyncWriteAcceptedOnFalse,
  kValidatedSource,
  kValidatedTransform,
  toAsyncStreamable,
  toStreamable
} = require('internal/streams/iter/types');

// =============================================================================
// Type Guards and Helpers
// =============================================================================

/**
 * Check if a value is a Writer (has write method).
 * @returns {boolean}
 */
function hasMethod(value, name) {
  return typeof value?.[name] === 'function';
}

/**
 * Parse pipeTo/pipeToSync arguments: [...transforms, writer, options?]
 * @param {Array} args
 * @param {string} requiredMethod - 'write' for pipeTo, 'writeSync' for pipeToSync
 * @returns {{ transforms: Array, writer: object, options: object }}
 */
function parsePipeToArgs(args, requiredMethod) {
  if (args.length === 0) {
    throw new ERR_INVALID_ARG_VALUE('args', args, 'pipeTo requires a writer argument');
  }
  var options;
  var writerIndex = args.length - 1;

  // Check if last arg is options
  var last = args[args.length - 1];
  if (isPullOptions(last) && !hasMethod(last, requiredMethod)) {
    options = last;
    writerIndex = args.length - 2;
  }
  if (writerIndex < 0) {
    throw new ERR_INVALID_ARG_VALUE('args', args, 'pipeTo requires a writer argument');
  }
  var writer = args[writerIndex];
  if (!hasMethod(writer, requiredMethod)) {
    throw new ERR_INVALID_ARG_TYPE('writer', `object with a ${requiredMethod} method`, writer);
  }
  var transforms = ArrayPrototypeSlice(args, 0, writerIndex);
  for (var i = 0; i < transforms.length; i++) {
    if (!isTransform(transforms[i])) {
      throw new ERR_INVALID_ARG_TYPE(`transforms[${i}]`, ['Function', 'Object with transform()'], transforms[i]);
    }
  }
  return {
    __proto__: null,
    transforms,
    writer,
    options
  };
}
function canUseSyncIterablePipeToFastPath(source, transforms, signal) {
  if (signal !== undefined || transforms.length !== 0 || isPrimitiveChunk(source) || ArrayIsArray(source) || source?.[kValidatedSource] || !isSyncIterable(source) || isAsyncIterable(source)) {
    return false;
  }

  // Preserve from()'s top-level protocol precedence for custom iterables.
  return typeof source[toAsyncStreamable] !== 'function' && typeof source[toStreamable] !== 'function';
}

// =============================================================================
// Transform Output Flattening
// =============================================================================

/**
 * Flatten transform yield to Uint8Array chunks (sync).
 * @yields {Uint8Array}
 */
function* flattenTransformYieldSync(value) {
  if (isUint8Array(value)) {
    yield value;
    return;
  }
  if (typeof value === 'string') {
    yield toUint8Array(value);
    return;
  }
  if (isAnyArrayBuffer(value)) {
    yield new Uint8Array(value);
    return;
  }
  if (ArrayBufferIsView(value)) {
    yield arrayBufferViewToUint8Array(value);
    return;
  }
  // Must be Iterable<TransformYield>
  if (isSyncIterable(value)) {
    for (var item of value) {
      yield* flattenTransformYieldSync(item);
    }
    return;
  }
  throw new ERR_INVALID_ARG_TYPE('value', ['Uint8Array', 'string', 'ArrayBuffer', 'ArrayBufferView', 'Iterable'], value);
}
function* processTransformResultSync(result) {
  if (result === null) {
    return;
  }
  // Single Uint8Array -> wrap as batch
  if (isUint8Array(result)) {
    yield [result];
    return;
  }
  // String -> UTF-8 encode and wrap as batch
  if (typeof result === 'string') {
    yield [toUint8Array(result)];
    return;
  }
  // ArrayBuffer / ArrayBufferView -> convert and wrap
  if (isAnyArrayBuffer(result)) {
    yield [new Uint8Array(result)];
    return;
  }
  if (ArrayBufferIsView(result)) {
    yield [arrayBufferViewToUint8Array(result)];
    return;
  }
  // Uint8Array[] batch
  if (isUint8ArrayBatch(result)) {
    if (result.length > 0) {
      yield result;
    }
    return;
  }
  // Iterable or Generator
  if (isSyncIterable(result)) {
    var batch = [];
    for (var item of result) {
      for (var chunk of flattenTransformYieldSync(item)) {
        ArrayPrototypePush(batch, chunk);
      }
    }
    if (batch.length > 0) {
      yield batch;
    }
    return;
  }
  throw new ERR_INVALID_ARG_TYPE('result', ['null', 'Uint8Array', 'string', 'ArrayBuffer', 'ArrayBufferView', 'Array', 'Iterable'], result);
}

/**
 * Append normalized transform result batches to an array (sync).
 * @param {Array<Uint8Array[]>} target
 * @param {*} result
 */
function appendTransformResultSync(target, result) {
  for (var batch of processTransformResultSync(result)) {
    ArrayPrototypePush(target, batch);
  }
}
function* applyFusedStatelessSyncTransforms(source, run) {
  for (var chunks of source) {
    var current = chunks;
    for (var i = 0; i < run.length; i++) {
      var result = run[i](current);
      if (result === null) {
        current = null;
        break;
      }
      current = result;
    }
    if (current === null) continue;
    // Inline normalization with Uint8Array[] batch as the fast path,
    // matching the async pipeline's check order.
    if (isUint8ArrayBatch(current)) {
      if (current.length > 0) yield current;
    } else if (isUint8Array(current)) {
      yield [current];
    } else if (typeof current === 'string') {
      yield [toUint8Array(current)];
    } else if (isAnyArrayBuffer(current)) {
      yield [new Uint8Array(current)];
    } else if (ArrayBufferIsView(current)) {
      yield [arrayBufferViewToUint8Array(current)];
    } else {
      yield* processTransformResultSync(current);
    }
  }
  // Flush each transform after all upstream data, including data emitted by
  // earlier flushes, has been processed by that transform.
  var pending = [];
  for (var _i = 0; _i < run.length; _i++) {
    var next = [];
    for (var j = 0; j < pending.length; j++) {
      appendTransformResultSync(next, run[_i](pending[j]));
    }
    appendTransformResultSync(next, run[_i](null));
    pending = next;
  }
  for (var _i2 = 0; _i2 < pending.length; _i2++) {
    yield pending[_i2];
  }
}

/**
 * Apply a single stateful sync transform to a source.
 * @yields {Uint8Array[]}
 */
function* withFlushSync(source) {
  yield* source;
  yield null;
}
function* applyStatefulSyncTransform(source, transform) {
  var output = transform(withFlushSync(source));
  for (var item of output) {
    var batch = [];
    for (var chunk of flattenTransformYieldSync(item)) {
      ArrayPrototypePush(batch, chunk);
    }
    if (batch.length > 0) {
      yield batch;
    }
  }
}

/**
 * Create a sync pipeline from source through transforms.
 * @yields {Uint8Array[]}
 */
function* createSyncPipeline(source, transforms) {
  var current = source;

  // Apply transforms - fuse consecutive stateless transforms into a single
  // generator layer to avoid unnecessary generator ticks.
  var statelessRun = [];
  for (var i = 0; i < transforms.length; i++) {
    var transform = transforms[i];
    if (isTransformObject(transform)) {
      if (statelessRun.length > 0) {
        current = applyFusedStatelessSyncTransforms(current, statelessRun);
        statelessRun = [];
      }
      current = applyStatefulSyncTransform(current, transform.transform);
    } else {
      ArrayPrototypePush(statelessRun, transform);
    }
  }
  if (statelessRun.length > 0) {
    current = applyFusedStatelessSyncTransforms(current, statelessRun);
  }
  yield* current;
}
function pullSync(source) {
  for (var _len = arguments.length, transforms = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    transforms[_key - 1] = arguments[_key];
  }
  for (var i = 0; i < transforms.length; i++) {
    if (!isTransform(transforms[i])) {
      throw new ERR_INVALID_ARG_TYPE(`transforms[${i}]`, ['Function', 'Object with transform()'], transforms[i]);
    }
  }
  return {
    __proto__: null,
    *[SymbolIterator]() {
      yield* createSyncPipeline(fromSync(source), transforms);
    }
  };
}

/**
 * Create an async pull-through pipeline with transforms.
 * @param {Iterable|AsyncIterable} source - The streamable source
 * @param {...(Function|object)} args - Transforms, with optional PullOptions
 *   as last argument
 * @returns {AsyncIterable<Uint8Array[]>}
 */
function pull(source) {
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  var {
    transforms,
    options
  } = parsePullArgs(args);
  var signal = options?.signal;
  if (signal !== undefined) {
    validateAbortSignal(signal, 'options.signal');
    // Eagerly check abort at call time per spec
    if (signal.aborted) {
      return {
        __proto__: null,
        // eslint-disable-next-line require-yield
        [SymbolAsyncIterator]: function () {
          return new _AsyncGenerator(function (_generator) {
            throw signal.reason;
          });
        }
      };
    }
  }
  return {
    __proto__: null,
    [SymbolAsyncIterator]: function () {
      return new _AsyncGenerator(function (_generator2) {
        return _generator2._yield(createAsyncPipeline(from(source), transforms, signal)).then(_empty);
      });
    }
  };
}

// =============================================================================
// Public API: pipeTo() and pipeToSync()
// =============================================================================

/**
 * Write a sync source through transforms to a sync writer.
 * @param {Iterable<Uint8Array[]>} source
 * @param {...(Function|object)} args - Transforms, writer, and optional options
 * @returns {number} Total bytes written
 */
function pipeToSync(source) {
  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }
  var {
    transforms,
    writer,
    options
  } = parsePipeToArgs(args, 'writeSync');

  // Handle transform-writer
  if (isTransformObject(writer)) {
    ArrayPrototypePush(transforms, writer);
  }

  // Normalize source and create pipeline
  var normalized = fromSync(source);
  var pipeline = transforms.length > 0 ? createSyncPipeline(normalized, transforms) : normalized;
  var totalBytes = 0;
  var hasWritevSync = typeof writer.writevSync === 'function';
  var hasEndSync = typeof writer.endSync === 'function';
  try {
    for (var batch of pipeline) {
      if (hasWritevSync && batch.length > 1) {
        writer.writevSync(batch);
        for (var i = 0; i < batch.length; i++) {
          totalBytes += TypedArrayPrototypeGetByteLength(batch[i]);
        }
      } else {
        for (var _i3 = 0; _i3 < batch.length; _i3++) {
          var chunk = batch[_i3];
          writer.writeSync(chunk);
          totalBytes += TypedArrayPrototypeGetByteLength(chunk);
        }
      }
    }
    if (!options?.preventClose) {
      if (!hasEndSync || writer.endSync() < 0) {
        writer.end?.();
      }
    }
  } catch (error) {
    if (!options?.preventFail) {
      writer.fail?.(wrapError(error));
    }
    throw error;
  }
  return totalBytes;
}
module.exports = {
  pipeTo,
  pipeToSync,
  pull,
  pullSync
};

