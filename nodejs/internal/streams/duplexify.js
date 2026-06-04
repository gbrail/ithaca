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
function _empty() {}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
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
var _earlyReturn = /*#__PURE__*/{},
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
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  FunctionPrototypeCall,
  PromiseWithResolvers
} = primordials;
var {
  isReadable,
  isWritable,
  isIterable,
  isNodeStream,
  isReadableNodeStream,
  isWritableNodeStream,
  isDuplexNodeStream,
  isReadableStream,
  isWritableStream
} = require('internal/streams/utils');
var {
  eos
} = require('internal/streams/end-of-stream');
var {
  AbortError,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_RETURN_VALUE
  }
} = require('internal/errors');
var {
  destroyer
} = require('internal/streams/destroy');
var Duplex = require('internal/streams/duplex');
var Readable = require('internal/streams/readable');
var Writable = require('internal/streams/writable');
var from = require('internal/streams/from');
var {
  isBlob
} = require('internal/blob');
var {
  AbortController
} = require('internal/abort_controller');

// This is needed for pre node 17.
var Duplexify = /*#__PURE__*/function (_Duplex) {
  function Duplexify(options) {
    var _this;
    _classCallCheck(this, Duplexify);
    _this = _callSuper(this, Duplexify, [options]);

    // https://github.com/nodejs/node/pull/34385

    if (options?.readable === false) {
      _this._readableState.readable = false;
      _this._readableState.ended = true;
      _this._readableState.endEmitted = true;
    }
    if (options?.writable === false) {
      _this._writableState.writable = false;
      _this._writableState.ending = true;
      _this._writableState.ended = true;
      _this._writableState.finished = true;
    }
    return _this;
  }
  _inherits(Duplexify, _Duplex);
  return _createClass(Duplexify);
}(Duplex);
module.exports = function duplexify(body, name) {
  if (isDuplexNodeStream(body)) {
    return body;
  }
  if (isReadableNodeStream(body)) {
    return _duplexify({
      __proto__: null,
      readable: body
    });
  }
  if (isWritableNodeStream(body)) {
    return _duplexify({
      __proto__: null,
      writable: body
    });
  }
  if (isNodeStream(body)) {
    return _duplexify({
      __proto__: null,
      writable: false,
      readable: false
    });
  }
  if (isReadableStream(body)) {
    return _duplexify({
      __proto__: null,
      readable: Readable.fromWeb(body)
    });
  }
  if (isWritableStream(body)) {
    return _duplexify({
      __proto__: null,
      writable: Writable.fromWeb(body)
    });
  }
  if (typeof body === 'function') {
    var {
      value,
      write,
      final,
      destroy
    } = fromAsyncGen(body);

    // Body might be a constructor function instead of an async generator function.
    if (isDuplexNodeStream(value)) {
      return value;
    }
    if (isIterable(value)) {
      return from(Duplexify, value, {
        // TODO (ronag): highWaterMark?
        objectMode: true,
        write,
        final,
        destroy
      });
    }
    var _then = value?.then;
    if (typeof _then === 'function') {
      var d;
      var promise = FunctionPrototypeCall(_then, value, val => {
        if (val != null) {
          throw new ERR_INVALID_RETURN_VALUE('nully', 'body', val);
        }
      }, err => {
        destroyer(d, err);
      });
      return d = new Duplexify({
        // TODO (ronag): highWaterMark?
        objectMode: true,
        readable: false,
        write,
        final(cb) {
          final(_async(function () {
            return _continueIgnored(_catch(function () {
              return _await(promise, function () {
                process.nextTick(cb, null);
              });
            }, function (err) {
              process.nextTick(cb, err);
            }));
          }));
        },
        destroy
      });
    }
    throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or AsyncFunction', name, value);
  }
  if (isBlob(body)) {
    return duplexify(body.arrayBuffer());
  }
  if (isIterable(body)) {
    return from(Duplexify, body, {
      // TODO (ronag): highWaterMark?
      objectMode: true,
      writable: false
    });
  }
  if (isReadableStream(body?.readable) && isWritableStream(body?.writable)) {
    return Duplexify.fromWeb(body);
  }
  if (typeof body?.writable === 'object' || typeof body?.readable === 'object') {
    var readable = body?.readable ? isReadableNodeStream(body?.readable) ? body?.readable : duplexify(body.readable) : undefined;
    var writable = body?.writable ? isWritableNodeStream(body?.writable) ? body?.writable : duplexify(body.writable) : undefined;
    return _duplexify({
      __proto__: null,
      readable,
      writable
    });
  }
  var then = body?.then;
  if (typeof then === 'function') {
    var _d;
    FunctionPrototypeCall(then, body, val => {
      if (val != null) {
        _d.push(val);
      }
      _d.push(null);
    }, err => {
      destroyer(_d, err);
    });
    return _d = new Duplexify({
      objectMode: true,
      writable: false,
      read() {}
    });
  }
  throw new ERR_INVALID_ARG_TYPE(name, ['Blob', 'ReadableStream', 'WritableStream', 'Stream', 'Iterable', 'AsyncIterable', 'Function', '{ readable, writable } pair', 'Promise'], body);
};
function fromAsyncGen(fn) {
  var {
    promise,
    resolve
  } = PromiseWithResolvers();
  var ac = new AbortController();
  var signal = ac.signal;
  var value = fn(function () {
    return new _AsyncGenerator(function (_generator) {
      var _exit = false;
      return _for(function () {
        return !_exit;
      }, void 0, function () {
        var _promise = promise;
        promise = null;
        return _await(_promise, function (_ref) {
          var {
            chunk,
            done,
            cb
          } = _ref;
          process.nextTick(cb);
          if (done) {
            _exit = true;
            return;
          }
          if (signal.aborted) throw new AbortError(undefined, {
            cause: signal.reason
          });
          ({
            promise,
            resolve
          } = PromiseWithResolvers());
          return _generator._yield(chunk).then(_empty);
        });
      });
    });
  }(), {
    signal
  });
  return {
    value,
    write(chunk, encoding, cb) {
      var _resolve = resolve;
      resolve = null;
      _resolve({
        __proto__: null,
        chunk,
        done: false,
        cb
      });
    },
    final(cb) {
      var _resolve = resolve;
      resolve = null;
      _resolve({
        __proto__: null,
        done: true,
        cb
      });
    },
    destroy(err, cb) {
      ac.abort(err);

      // If the source async iterator is waiting for the next write/final
      // signal, unblock it so the readable side can observe the abort and
      // finish destroying.
      if (resolve !== null) {
        var _resolve = resolve;
        resolve = null;
        _resolve({
          __proto__: null,
          done: true,
          cb() {}
        });
      }
      cb(err);
    }
  };
}
function _duplexify(pair) {
  var r = pair.readable && typeof pair.readable.read !== 'function' ? Readable.wrap(pair.readable) : pair.readable;
  var w = pair.writable;
  var readable = !!isReadable(r);
  var writable = !!isWritable(w);
  var ondrain;
  var onfinish;
  var onreadable;
  var onclose;
  var d;
  function onfinished(err) {
    var cb = onclose;
    onclose = null;
    if (cb) {
      cb(err);
    } else if (err) {
      d.destroy(err);
    }
  }

  // TODO(ronag): Avoid double buffering.
  // Implement Writable/Readable/Duplex traits.
  // See, https://github.com/nodejs/node/pull/33515.
  d = new Duplexify({
    // TODO (ronag): highWaterMark?
    readableObjectMode: !!r?.readableObjectMode,
    writableObjectMode: !!w?.writableObjectMode,
    readable,
    writable
  });
  if (writable) {
    eos(w, err => {
      writable = false;
      if (err) {
        destroyer(r, err);
      }
      onfinished(err);
    });
    d._write = function (chunk, encoding, callback) {
      if (w.write(chunk, encoding)) {
        callback();
      } else {
        ondrain = callback;
      }
    };
    d._final = function (callback) {
      w.end();
      onfinish = callback;
    };
    w.on('drain', function () {
      if (ondrain) {
        var cb = ondrain;
        ondrain = null;
        cb();
      }
    });
    w.on('finish', function () {
      if (onfinish) {
        var cb = onfinish;
        onfinish = null;
        cb();
      }
    });
  }
  if (readable) {
    eos(r, err => {
      readable = false;
      if (err) {
        destroyer(w, err);
      }
      onfinished(err);
    });
    r.on('readable', function () {
      if (onreadable) {
        var cb = onreadable;
        onreadable = null;
        cb();
      }
    });
    r.on('end', function () {
      d.push(null);
    });
    d._read = function () {
      while (true) {
        var buf = r.read();
        if (buf === null) {
          onreadable = d._read;
          return;
        }
        if (!d.push(buf)) {
          return;
        }
      }
    };
  }
  d._destroy = function (err, callback) {
    if (!err && onclose !== null) {
      err = new AbortError();
    }
    onreadable = null;
    ondrain = null;
    onfinish = null;
    if (onclose === null) {
      callback(err);
    } else {
      onclose = callback;
      destroyer(w, err);
      destroyer(r, err);
    }
  };
  return d;
}

