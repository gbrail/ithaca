'use strict';

// New Streams API - from() and fromSync()
//
// Creates normalized byte stream iterables from various input types.
// Handles recursive flattening of nested iterables and protocol conversions.
function _empty() {}
/**
 * Normalize an async streamable source, yielding batches of Uint8Array.
 * @param {AsyncIterable|Iterable} source
 * @yields {Uint8Array[]}
 */
var normalizeAsyncSource = function (source) {
  return new _AsyncGenerator(function (_generator6) {
    var _exit9 = false;
    // Prefer async iteration if available
    return _invoke(function () {
      if (isAsyncIterable(source)) {
        return _continue(_forAwaitOf(source, function (value) {
          // Fast path 1: value is already a Uint8Array[] batch
          return _invoke(function () {
            if (isUint8ArrayBatch(value)) {
              return _invokeIgnored(function () {
                if (value.length > 0) {
                  return _generator6._yield(value).then(_empty);
                }
              });
            }
          }, function () {
            // Fast path 2: value is a single Uint8Array (very common)
            return _invoke(function () {
              if (isUint8Array(value)) {
                return _generator6._yield([value]).then(_empty);
              }
            }, function () {
              // Slow path: normalize the value
              var batch = [];
              return _continue(_forAwaitOf(normalizeAsyncValue(value), function (chunk) {
                ArrayPrototypePush(batch, chunk);
              }), function () {
                return _invokeIgnored(function () {
                  if (batch.length > 0) {
                    return _generator6._yield(batch).then(_empty);
                  }
                });
              });
            });
          });
        }), function () {
          _exit9 = true;
        });
      }
    }, function (_result0) {
      var _exit0 = false;
      if (_exit9) return _result0;
      // Fall back to sync iteration - batch sync values together with a bound.
      return _invoke(function () {
        if (isSyncIterable(source)) {
          var batch = [];
          return _continue(_forOf(source, function (value) {
            // Fast path 1: value is already a Uint8Array[] batch
            return _invoke(function () {
              if (isUint8ArrayBatch(value)) {
                // Flush any accumulated batch first
                return _invoke(function () {
                  if (batch.length > 0) {
                    return _generator6._yield(batch).then(function () {
                      batch = [];
                    });
                  }
                }, function () {
                  return _generator6._yield(yieldBoundedBatch(value)).then(_empty);
                });
              }
            }, function () {
              // Fast path 2: value is a single Uint8Array (very common)
              return _invoke(function () {
                if (isUint8Array(value)) {
                  ArrayPrototypePush(batch, value);
                  return _invokeIgnored(function () {
                    if (batch.length === FROM_BATCH_SIZE) {
                      return _generator6._yield(batch).then(function () {
                        batch = [];
                      });
                    }
                  });
                }
              }, function () {
                // Slow path: normalize the value - must flush and yield individually
                return _invoke(function () {
                  if (batch.length > 0) {
                    return _generator6._yield(batch).then(function () {
                      batch = [];
                    });
                  }
                }, function () {
                  var asyncBatch = [];
                  return _continue(_forAwaitOf(normalizeAsyncValue(value), function (chunk) {
                    ArrayPrototypePush(asyncBatch, chunk);
                    return _invokeIgnored(function () {
                      if (asyncBatch.length === FROM_BATCH_SIZE) {
                        return _generator6._yield(asyncBatch).then(function () {
                          asyncBatch = [];
                        });
                      }
                    });
                  }), function () {
                    return _invokeIgnored(function () {
                      if (asyncBatch.length > 0) {
                        return _generator6._yield(asyncBatch).then(_empty);
                      }
                    });
                  });
                });
              });
            });
          }), function () {
            // Yield any remaining batched values
            return _invoke(function () {
              if (batch.length > 0) {
                return _generator6._yield(batch).then(_empty);
              }
            }, function () {
              _exit0 = true;
            });
          });
        }
      }, function (_result1) {
        if (_exit0) return _result1;
        throw new ERR_INVALID_ARG_TYPE('source', ['Iterable', 'AsyncIterable'], source);
      });
    });
  });
}; // =============================================================================
// Public API: from() and fromSync()
// =============================================================================
/**
 * Create a SyncByteStreamReadable from a ByteInput or SyncStreamable.
 * @param {string|ArrayBuffer|ArrayBufferView|Iterable} input
 * @returns {Iterable<Uint8Array[]>}
 */
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
// =============================================================================
// Async Normalization (for from and async contexts)
// =============================================================================
/**
 * Normalize an async streamable yield value to Uint8Array chunks.
 * Recursively flattens arrays, iterables, async iterables, promises,
 * and protocol conversions.
 * @yields {Uint8Array}
 */
var normalizeAsyncValue = function (value) {
  return new _AsyncGenerator(function (_generator5) {
    var _exit2 = false;
    // Handle promises first
    return _invoke(function () {
      if (isPromise(value)) {
        return _await(value, function (resolved) {
          return _generator5._yield(normalizeAsyncValue(resolved)).then(function () {
            _exit2 = true;
          });
        });
      }
    }, function (_result2) {
      var _exit3 = false;
      if (_exit2) return _result2;
      // Handle primitives
      return _invoke(function () {
        if (isPrimitiveChunk(value)) {
          return _generator5._yield(primitiveToUint8Array(value)).then(function () {
            _exit3 = true;
          });
        }
      }, function (_result3) {
        var _exit4 = false;
        if (_exit3) return _result3;
        // Handle ToAsyncStreamable protocol (check before ToStreamable)
        return _invoke(function () {
          if (hasProtocol(value, toAsyncStreamable)) {
            var result = FunctionPrototypeCall(value[toAsyncStreamable], value);
            return _invoke(function () {
              if (isPromise(result)) {
                var _temp = _generator5._yield;
                return _await(result, function (_result4) {
                  return _temp.call(_generator5, normalizeAsyncValue(_result4)).then(_empty);
                });
              } else {
                return _generator5._yield(normalizeAsyncValue(result)).then(_empty);
              }
            }, function () {
              _exit4 = true;
            });
          }
        }, function (_result5) {
          var _exit5 = false;
          if (_exit4) return _result5;
          // Handle ToStreamable protocol
          return _invoke(function () {
            if (hasProtocol(value, toStreamable)) {
              var result = FunctionPrototypeCall(value[toStreamable], value);
              return _generator5._yield(normalizeAsyncValue(result)).then(function () {
                _exit5 = true;
              });
            }
          }, function (_result6) {
            var _exit6 = false;
            if (_exit5) return _result6;
            // Handle arrays (which are also iterable, but check first for efficiency)
            return _invoke(function () {
              if (ArrayIsArray(value)) {
                return _continue(_forTo(value, function (i) {
                  return _generator5._yield(normalizeAsyncValue(value[i])).then(_empty);
                }), function () {
                  _exit6 = true;
                });
              }
            }, function (_result7) {
              var _exit7 = false;
              if (_exit6) return _result7;
              // Handle async iterables (check before sync iterables since some objects
              // have both)
              return _invoke(function () {
                if (isAsyncIterable(value)) {
                  return _continue(_forAwaitOf(value, function (item) {
                    return _generator5._yield(normalizeAsyncValue(item)).then(_empty);
                  }), function () {
                    _exit7 = true;
                  });
                }
              }, function (_result8) {
                var _exit8 = false;
                if (_exit7) return _result8;
                // Handle sync iterables
                return _invoke(function () {
                  if (isSyncIterable(value)) {
                    return _continue(_forOf(value, function (item) {
                      return _generator5._yield(normalizeAsyncValue(item)).then(_empty);
                    }), function () {
                      _exit8 = true;
                    });
                  }
                }, function (_result9) {
                  if (_exit8) return _result9;
                  // Reject: no valid conversion
                  throw new ERR_INVALID_ARG_TYPE('value', ['string', 'ArrayBuffer', 'ArrayBufferView', 'Iterable', 'AsyncIterable', 'toStreamable', 'toAsyncStreamable'], value);
                });
              });
            });
          });
        });
      });
    });
  });
};
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
var {
  ArrayBufferIsView,
  ArrayIsArray,
  ArrayPrototypeEvery,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  DataViewPrototypeGetBuffer,
  DataViewPrototypeGetByteLength,
  DataViewPrototypeGetByteOffset,
  FunctionPrototypeCall,
  SymbolAsyncIterator,
  SymbolIterator,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength,
  TypedArrayPrototypeGetByteOffset,
  Uint8Array
} = primordials;
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = require('internal/errors');
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var {
  isAnyArrayBuffer,
  isPromise,
  isTypedArray,
  isUint8Array
} = require('internal/util/types');
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var {
  kValidatedSource,
  toStreamable,
  toAsyncStreamable
} = require('internal/streams/iter/types');
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var {
  hasProtocol,
  toUint8Array
} = require('internal/streams/iter/utils');

// Maximum number of chunks to yield per batch from from()/fromSync().
// Bounds peak memory when arrays flow through transforms, which must
// allocate output for the entire batch at once.

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
var FROM_BATCH_SIZE = 128;

// =============================================================================
// Type Guards and Detection
// =============================================================================

/**
 * Check if value is a primitive chunk (string, ArrayBuffer, or ArrayBufferView).
 * @returns {boolean}
 */

function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
} /**
   * Check if value is a sync iterable (has Symbol.iterator).
   * @returns {boolean}
   */

var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
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
function isPrimitiveChunk(value) {
  return typeof value === 'string' || isAnyArrayBuffer(value) || ArrayBufferIsView(value);
}
function isSyncIterable(value) {
  // We do not consider regular strings to be sync iterables in this context.
  // We don't care about boxed strings (String objects) since they are uncommon.
  return typeof value !== 'string' && typeof value?.[SymbolIterator] === 'function';
}

/**
 * Check if value is an async iterable (has Symbol.asyncIterator).
 * @returns {boolean}
 */
function isAsyncIterable(value) {
  return typeof value?.[SymbolAsyncIterator] === 'function';
}

// =============================================================================
// Primitive Conversion
// =============================================================================

/**
 * Convert a primitive chunk to Uint8Array.
 * - string: UTF-8 encoded
 * - ArrayBuffer: wrapped as Uint8Array view (no copy)
 * - ArrayBufferView: converted to Uint8Array view of same memory
 * @param {string|ArrayBuffer|ArrayBufferView} chunk
 * @returns {Uint8Array}
 */
function primitiveToUint8Array(chunk) {
  if (typeof chunk === 'string') {
    return toUint8Array(chunk);
  }
  if (isAnyArrayBuffer(chunk)) {
    return new Uint8Array(chunk);
  }
  if (isUint8Array(chunk)) {
    return chunk;
  }
  // Other ArrayBufferView types (Int8Array, DataView, etc.)
  return arrayBufferViewToUint8Array(chunk);
}
function arrayBufferViewToUint8Array(chunk) {
  if (isTypedArray(chunk)) {
    return new Uint8Array(TypedArrayPrototypeGetBuffer(chunk), TypedArrayPrototypeGetByteOffset(chunk), TypedArrayPrototypeGetByteLength(chunk));
  }
  return new Uint8Array(DataViewPrototypeGetBuffer(chunk), DataViewPrototypeGetByteOffset(chunk), DataViewPrototypeGetByteLength(chunk));
}

// =============================================================================
// Sync Normalization (for fromSync and sync contexts)
// =============================================================================

/**
 * Normalize a sync streamable yield value to Uint8Array chunks.
 * Recursively flattens arrays, iterables, and protocol conversions.
 * @yields {Uint8Array}
 */
function* normalizeSyncValue(value) {
  // Handle primitives
  if (isPrimitiveChunk(value)) {
    yield primitiveToUint8Array(value);
    return;
  }

  // Handle ToStreamable protocol
  if (hasProtocol(value, toStreamable)) {
    var result = FunctionPrototypeCall(value[toStreamable], value);
    yield* normalizeSyncValue(result);
    return;
  }

  // Handle arrays (which are also iterable, but check first for efficiency)
  if (ArrayIsArray(value)) {
    for (var i = 0; i < value.length; i++) {
      yield* normalizeSyncValue(value[i]);
    }
    return;
  }

  // Handle other sync iterables
  if (isSyncIterable(value)) {
    for (var item of value) {
      yield* normalizeSyncValue(item);
    }
    return;
  }

  // Reject: no valid conversion
  throw new ERR_INVALID_ARG_TYPE('value', ['string', 'ArrayBuffer', 'ArrayBufferView', 'Iterable', 'toStreamable'], value);
}

/**
 * Check if value is already a Uint8Array[] batch (fast path).
 * @returns {boolean}
 */
function isUint8ArrayBatch(value) {
  if (!ArrayIsArray(value)) return false;
  var len = value.length;
  if (len === 0) return true;
  // Fast path: single-element batch (most common from transforms)
  if (len === 1) return isUint8Array(value[0]);
  // Check first and last before iterating all elements
  if (!isUint8Array(value[0]) || !isUint8Array(value[len - 1])) return false;
  if (len === 2) return true;
  for (var i = 1; i < len - 1; i++) {
    if (!isUint8Array(value[i])) return false;
  }
  return true;
}
function* yieldBoundedBatch(batch) {
  if (batch.length === 0) {
    return;
  }
  if (batch.length <= FROM_BATCH_SIZE) {
    yield batch;
    return;
  }
  for (var i = 0; i < batch.length; i += FROM_BATCH_SIZE) {
    yield ArrayPrototypeSlice(batch, i, i + FROM_BATCH_SIZE);
  }
}

/**
 * Normalize a sync streamable source, yielding batches of Uint8Array.
 * @param {Iterable} source
 * @yields {Uint8Array[]}
 */
function* normalizeSyncSource(source) {
  var batch = [];
  for (var value of source) {
    // Fast path 1: value is already a Uint8Array[] batch
    if (isUint8ArrayBatch(value)) {
      if (batch.length > 0) {
        yield batch;
        batch = [];
      }
      yield* yieldBoundedBatch(value);
      continue;
    }
    // Fast path 2: value is a single Uint8Array (very common)
    if (isUint8Array(value)) {
      ArrayPrototypePush(batch, value);
      if (batch.length === FROM_BATCH_SIZE) {
        yield batch;
        batch = [];
      }
      continue;
    }
    // Slow path: normalize the value
    if (batch.length > 0) {
      yield batch;
      batch = [];
    }
    var valueBatch = [];
    for (var chunk of normalizeSyncValue(value)) {
      ArrayPrototypePush(valueBatch, chunk);
      if (valueBatch.length === FROM_BATCH_SIZE) {
        yield valueBatch;
        valueBatch = [];
      }
    }
    if (valueBatch.length > 0) {
      yield valueBatch;
    }
  }
  if (batch.length > 0) {
    yield batch;
  }
}
function fromSync(input) {
  if (input == null) {
    throw new ERR_INVALID_ARG_TYPE('input', 'a non-null value', input);
  }

  // Check for primitives first (ByteInput)
  if (isPrimitiveChunk(input)) {
    var chunk = primitiveToUint8Array(input);
    return {
      __proto__: null,
      *[SymbolIterator]() {
        yield [chunk];
      }
    };
  }

  // Fast path: Uint8Array[] - yield in bounded sub-batches.
  // Yielding the entire array as one batch forces downstream transforms
  // to process all data at once, causing peak memory proportional to total
  // data volume. Sub-batching keeps peak memory bounded while preserving
  // the throughput benefit of batched processing.
  if (ArrayIsArray(input)) {
    if (input.length === 0) {
      return {
        __proto__: null,
        *[SymbolIterator]() {
          // Empty - yield nothing
        }
      };
    }
    // Check if it's an array of Uint8Array (common case)
    if (isUint8Array(input[0])) {
      var allUint8 = ArrayPrototypeEvery(input, isUint8Array);
      if (allUint8) {
        var batch = input;
        return {
          __proto__: null,
          *[SymbolIterator]() {
            if (batch.length <= FROM_BATCH_SIZE) {
              yield batch;
            } else {
              for (var i = 0; i < batch.length; i += FROM_BATCH_SIZE) {
                yield ArrayPrototypeSlice(batch, i, i + FROM_BATCH_SIZE);
              }
            }
          }
        };
      }
    }
  }

  // Check toStreamable protocol (takes precedence over iteration protocols).
  // toAsyncStreamable is ignored entirely in fromSync.
  if (typeof input[toStreamable] === 'function') {
    return fromSync(input[toStreamable]());
  }

  // Reject explicit async inputs
  if (isAsyncIterable(input)) {
    throw new ERR_INVALID_ARG_TYPE('input', 'a synchronous input (not AsyncIterable)', input);
  }
  if (typeof input === 'object' && input !== null && typeof input.then === 'function') {
    throw new ERR_INVALID_ARG_TYPE('input', 'a synchronous input (not Promise)', input);
  }

  // Must be a SyncStreamable
  if (!isSyncIterable(input)) {
    throw new ERR_INVALID_ARG_TYPE('input', ['string', 'ArrayBuffer', 'ArrayBufferView', 'Iterable', 'toStreamable'], input);
  }
  return {
    __proto__: null,
    *[SymbolIterator]() {
      yield* normalizeSyncSource(input);
    }
  };
}

/**
 * Create a ByteStreamReadable from a ByteInput or Streamable.
 * @param {string|ArrayBuffer|ArrayBufferView|Iterable|AsyncIterable} input
 * @returns {AsyncIterable<Uint8Array[]>}
 */
function from(input) {
  if (input == null) {
    throw new ERR_INVALID_ARG_TYPE('input', 'a non-null value', input);
  }

  // Fast path: validated source already yields valid Uint8Array[] batches
  if (input[kValidatedSource]) {
    return input;
  }

  // Check for primitives first (ByteInput)
  if (isPrimitiveChunk(input)) {
    var chunk = primitiveToUint8Array(input);
    return {
      __proto__: null,
      [SymbolAsyncIterator]: function () {
        return new _AsyncGenerator(function (_generator) {
          return _generator._yield([chunk]).then(_empty);
        });
      }
    };
  }

  // Fast path: Uint8Array[] - yield in bounded sub-batches.
  // Yielding the entire array as one batch forces downstream transforms
  // to process all data at once, causing peak memory proportional to total
  // data volume. Sub-batching keeps peak memory bounded while preserving
  // the throughput benefit of batched processing.
  if (ArrayIsArray(input)) {
    if (input.length === 0) {
      return {
        __proto__: null,
        [SymbolAsyncIterator]: function () {
          return new _AsyncGenerator(function (_generator2) {
            // Empty - yield nothing
          });
        }
      };
    }
    if (isUint8Array(input[0])) {
      var allUint8 = ArrayPrototypeEvery(input, isUint8Array);
      if (allUint8) {
        var batch = input;
        return {
          __proto__: null,
          [SymbolAsyncIterator]: function () {
            return new _AsyncGenerator(function (_generator3) {
              return _invokeIgnored(function () {
                if (batch.length <= FROM_BATCH_SIZE) {
                  return _generator3._yield(batch).then(_empty);
                } else {
                  var _i = 0;
                  return _continueIgnored(_for(function () {
                    return _i < batch.length;
                  }, function () {
                    return !!(_i += FROM_BATCH_SIZE);
                  }, function () {
                    return _generator3._yield(ArrayPrototypeSlice(batch, _i, _i + FROM_BATCH_SIZE)).then(_empty);
                  }));
                }
              });
            });
          }
        };
      }
    }
  }

  // Check toAsyncStreamable protocol (takes precedence over toStreamable and
  // iteration protocols)
  if (typeof input[toAsyncStreamable] === 'function') {
    var result = input[toAsyncStreamable]();
    // Synchronous validated source (e.g. Readable batched iterator)
    if (result?.[kValidatedSource]) {
      return result;
    }
    return {
      __proto__: null,
      [SymbolAsyncIterator]: function () {
        return new _AsyncGenerator(function (_generator4) {
          // The result may be a Promise. Check validated on both the Promise
          // itself (if tagged) and the resolved value.
          return _await(result, function (resolved) {
            var _exit = false;
            return _invoke(function () {
              if (resolved?.[kValidatedSource]) {
                return _generator4._yield(resolved[SymbolAsyncIterator]()).then(function () {
                  _exit = true;
                });
              }
            }, function (_result) {
              return _exit ? _result : _generator4._yield(from(resolved)[SymbolAsyncIterator]()).then(_empty);
            });
          });
        });
      }
    };
  }

  // Check toStreamable protocol (takes precedence over iteration protocols)
  if (typeof input[toStreamable] === 'function') {
    return from(input[toStreamable]());
  }

  // Must be a Streamable (sync or async iterable)
  if (!isSyncIterable(input) && !isAsyncIterable(input)) {
    throw new ERR_INVALID_ARG_TYPE('input', ['string', 'ArrayBuffer', 'ArrayBufferView', 'Iterable', 'AsyncIterable', 'toStreamable', 'toAsyncStreamable'], input);
  }
  return normalizeAsyncSource(input);
}

// =============================================================================
// Exports
// =============================================================================

module.exports = {
  arrayBufferViewToUint8Array,
  from,
  fromSync,
  isAsyncIterable,
  isPrimitiveChunk,
  isSyncIterable,
  isUint8ArrayBatch,
  normalizeAsyncSource,
  normalizeAsyncValue,
  normalizeSyncSource,
  normalizeSyncValue,
  primitiveToUint8Array
};

