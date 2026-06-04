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
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
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
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
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
        var _value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(_value) : _value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(_value));
        } else {
          _settle(result, 2, _value);
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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  PromisePrototypeThen,
  SymbolAsyncIterator,
  SymbolIterator
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  aggregateTwoErrors,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_STREAM_NULL_VALUES
  }
} = require('internal/errors');
function from(Readable, iterable, opts) {
  var nextAsync = _async(function () {
    var _exit3 = false,
      _interrupt2 = false;
    return _for(function () {
      return !(_interrupt2 || _exit3);
    }, void 0, function () {
      return _continue(_catch(function () {
        return _await(iterator.next(), function (_ref3) {
          var {
            value,
            done
          } = _ref3;
          if (done) {
            readable.push(null);
            _exit3 = true;
            return;
          }
          if (value === null) {
            reading = false;
            throw new ERR_STREAM_NULL_VALUES();
          }
          if (readable.push(value)) {
            return;
          }
          reading = false;
        });
      }, function (err) {
        readable.destroy(err);
      }), function (_result5) {
        if (_exit3) return _result5;
        _interrupt2 = true;
      });
    });
  });
  var nextSyncWithAsyncValues = _async(function () {
    var _exit2 = false,
      _interrupt = false;
    return _for(function () {
      return !(_interrupt || _exit2);
    }, void 0, function () {
      return _continue(_catch(function () {
        var {
          value,
          done
        } = iterator.next();
        if (done) {
          readable.push(null);
          _exit2 = true;
          return;
        }
        var _temp = value && typeof value.then === 'function';
        return _await(value, function (res) {
          if (res === null) {
            reading = false;
            throw new ERR_STREAM_NULL_VALUES();
          }
          if (readable.push(res)) {
            return;
          }
          reading = false;
        }, !_temp);
      }, function (err) {
        readable.destroy(err);
      }), function (_result3) {
        if (_exit2) return _result3;
        _interrupt = true;
      });
    });
  });
  var changeToAsyncValues = _async(function (value) {
    isAsyncValues = true;
    return _catch(function () {
      return _await(value, function (res) {
        if (res === null) {
          reading = false;
          throw new ERR_STREAM_NULL_VALUES();
        }
        if (readable.push(res)) {
          nextSyncWithAsyncValues();
          return;
        }
        reading = false;
      });
    }, function (err) {
      readable.destroy(err);
    });
  });
  var close = _async(function (error) {
    var _exit = false;
    var hadError = error !== undefined && error !== null;
    var hasThrow = typeof iterator.throw === 'function';
    return _invoke(function () {
      if (hadError && hasThrow) {
        return _await(iterator.throw(error), function (_ref) {
          var {
            value,
            done
          } = _ref;
          return _await(value, function () {
            if (done) {
              _exit = true;
            }
          });
        });
      }
    }, function (_result) {
      return _exit ? _result : _invokeIgnored(function () {
        if (typeof iterator.return === 'function') {
          return _await(iterator.return(), function (_ref2) {
            var {
              value
            } = _ref2;
            return _awaitIgnored(value);
          });
        }
      });
    });
  }); // There are a lot of duplication here, it's done on purpose for performance
  // reasons - avoid await when not needed.
  var iterator;
  if (typeof iterable === 'string' || iterable instanceof Buffer) {
    return new Readable(_objectSpread(_objectSpread({
      objectMode: true
    }, opts), {}, {
      read() {
        this.push(iterable);
        this.push(null);
      }
    }));
  }
  var isAsync;
  if (iterable?.[SymbolAsyncIterator]) {
    isAsync = true;
    iterator = iterable[SymbolAsyncIterator]();
  } else if (iterable?.[SymbolIterator]) {
    isAsync = false;
    iterator = iterable[SymbolIterator]();
  } else {
    throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
  }
  var readable = new Readable(_objectSpread({
    objectMode: true,
    highWaterMark: 1
  }, opts));
  var originalDestroy = readable._destroy;

  // Flag to protect against _read
  // being called before last iteration completion.
  var reading = false;
  var isAsyncValues = false;
  readable._read = function () {
    if (!reading) {
      reading = true;
      if (isAsync) {
        nextAsync();
      } else if (isAsyncValues) {
        nextSyncWithAsyncValues();
      } else {
        nextSyncWithSyncValues();
      }
    }
  };
  readable._destroy = function (error, cb) {
    originalDestroy.call(this, error, destroyError => {
      var combinedError = destroyError || error;
      PromisePrototypeThen(close(combinedError),
      // nextTick is here in case cb throws
      () => process.nextTick(cb, combinedError), closeError => process.nextTick(cb, aggregateTwoErrors(combinedError, closeError)));
    });
  };
  function nextSyncWithSyncValues() {
    for (;;) {
      try {
        var {
          value,
          done
        } = iterator.next();
        if (done) {
          readable.push(null);
          return;
        }
        if (value && typeof value.then === 'function') {
          return changeToAsyncValues(value);
        }
        if (value === null) {
          reading = false;
          throw new ERR_STREAM_NULL_VALUES();
        }
        if (readable.push(value)) {
          continue;
        }
        reading = false;
      } catch (err) {
        readable.destroy(err);
      }
      break;
    }
  }
  return readable;
}
module.exports = from;

