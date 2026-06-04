'use strict';

function _empty() {}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
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
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
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
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _checkInRHS(e) { if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (null !== e ? typeof e : "null")); return e; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayPrototypePush,
  ArrayPrototypeShift,
  FunctionPrototypeBind,
  ObjectDefineProperties,
  PromiseReject,
  SymbolAsyncDispose,
  SymbolAsyncIterator,
  SymbolDispose
} = primordials;
var pathModule = require('path');
var binding = internalBinding('fs');
var dirBinding = internalBinding('fs_dir');
var {
  codes: {
    ERR_DIR_CLOSED,
    ERR_DIR_CONCURRENT_OPERATION,
    ERR_INVALID_THIS,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
var {
  FSReqCallback
} = binding;
var {
  promisify
} = require('internal/util');
var {
  getDirent,
  getOptions,
  getValidatedPath,
  vfsState
} = require('internal/fs/utils');
var {
  validateFunction,
  validateUint32
} = require('internal/validators');
var _handle = /*#__PURE__*/new WeakMap();
var _path = /*#__PURE__*/new WeakMap();
var _bufferedEntries = /*#__PURE__*/new WeakMap();
var _closed = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _readPromisified = /*#__PURE__*/new WeakMap();
var _closePromisified = /*#__PURE__*/new WeakMap();
var _operationQueue = /*#__PURE__*/new WeakMap();
var _handlerQueue = /*#__PURE__*/new WeakMap();
var _Dir_brand = /*#__PURE__*/new WeakSet();
var Dir = /*#__PURE__*/function () {
  function Dir(_handle2, _path2, options) {
    _classCallCheck(this, Dir);
    _classPrivateMethodInitSpec(this, _Dir_brand);
    _classPrivateFieldInitSpec(this, _handle, void 0);
    _classPrivateFieldInitSpec(this, _path, void 0);
    _classPrivateFieldInitSpec(this, _bufferedEntries, []);
    _classPrivateFieldInitSpec(this, _closed, false);
    _classPrivateFieldInitSpec(this, _options, void 0);
    _classPrivateFieldInitSpec(this, _readPromisified, void 0);
    _classPrivateFieldInitSpec(this, _closePromisified, void 0);
    _classPrivateFieldInitSpec(this, _operationQueue, null);
    _classPrivateFieldInitSpec(this, _handlerQueue, []);
    if (_handle2 == null) throw new ERR_MISSING_ARGS('handle');
    _classPrivateFieldSet(_handle, this, _handle2);
    _classPrivateFieldSet(_path, this, _path2);
    _classPrivateFieldSet(_options, this, _objectSpread({
      bufferSize: 32
    }, getOptions(options, {
      encoding: 'utf8'
    })));
    try {
      validateUint32(_classPrivateFieldGet(_options, this).bufferSize, 'options.bufferSize', true);
    } catch (validationError) {
      // Userland won't be able to close handle if we throw, so we close it first
      _classPrivateFieldGet(_handle, this).close();
      throw validationError;
    }
    _classPrivateFieldSet(_readPromisified, this, FunctionPrototypeBind(promisify(_assertClassBrand(_Dir_brand, this, _readImpl)), this, false));
    _classPrivateFieldSet(_closePromisified, this, FunctionPrototypeBind(promisify(this.close), this));
  }
  return _createClass(Dir, [{
    key: "path",
    get: function () {
      if (!_path.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('Dir');
      return _classPrivateFieldGet(_path, this);
    }
  }, {
    key: "read",
    value: function read(callback) {
      return arguments.length === 0 ? _classPrivateFieldGet(_readPromisified, this).call(this) : _assertClassBrand(_Dir_brand, this, _readImpl).call(this, true, callback);
    }
  }, {
    key: "readSync",
    value: function readSync() {
      if (_classPrivateFieldGet(_closed, this) === true) {
        throw new ERR_DIR_CLOSED();
      }
      if (_classPrivateFieldGet(_operationQueue, this) !== null) {
        throw new ERR_DIR_CONCURRENT_OPERATION();
      }
      if (_assertClassBrand(_Dir_brand, this, _processHandlerQueue).call(this)) {
        var _dirent = ArrayPrototypeShift(_classPrivateFieldGet(_bufferedEntries, this));
        if (_classPrivateFieldGet(_options, this).recursive && _dirent.isDirectory()) {
          _assertClassBrand(_Dir_brand, this, _readSyncRecursive).call(this, _dirent);
        }
        return _dirent;
      }
      var result = _classPrivateFieldGet(_handle, this).read(_classPrivateFieldGet(_options, this).encoding, _classPrivateFieldGet(_options, this).bufferSize);
      if (result === null) {
        return result;
      }
      _assertClassBrand(_Dir_brand, this, _processReadResult).call(this, _classPrivateFieldGet(_path, this), result);
      var dirent = ArrayPrototypeShift(_classPrivateFieldGet(_bufferedEntries, this));
      if (_classPrivateFieldGet(_options, this).recursive && dirent.isDirectory()) {
        _assertClassBrand(_Dir_brand, this, _readSyncRecursive).call(this, dirent);
      }
      return dirent;
    }
  }, {
    key: "close",
    value: function close(callback) {
      if (callback === undefined) {
        if (_classPrivateFieldGet(_closed, this) === true) {
          return PromiseReject(new ERR_DIR_CLOSED());
        }
        return _classPrivateFieldGet(_closePromisified, this).call(this);
      }
      validateFunction(callback, 'callback');
      if (_classPrivateFieldGet(_closed, this) === true) {
        process.nextTick(callback, new ERR_DIR_CLOSED());
        return;
      }
      if (_classPrivateFieldGet(_operationQueue, this) !== null) {
        ArrayPrototypePush(_classPrivateFieldGet(_operationQueue, this), () => {
          this.close(callback);
        });
        return;
      }
      while (_classPrivateFieldGet(_handlerQueue, this).length > 0) {
        var handler = ArrayPrototypeShift(_classPrivateFieldGet(_handlerQueue, this));
        handler.handle.close();
      }
      _classPrivateFieldSet(_closed, this, true);
      var req = new FSReqCallback();
      req.oncomplete = callback;
      _classPrivateFieldGet(_handle, this).close(req);
    }
  }, {
    key: "closeSync",
    value: function closeSync() {
      if (_classPrivateFieldGet(_closed, this) === true) {
        throw new ERR_DIR_CLOSED();
      }
      if (_classPrivateFieldGet(_operationQueue, this) !== null) {
        throw new ERR_DIR_CONCURRENT_OPERATION();
      }
      while (_classPrivateFieldGet(_handlerQueue, this).length > 0) {
        var handler = ArrayPrototypeShift(_classPrivateFieldGet(_handlerQueue, this));
        handler.handle.close();
      }
      _classPrivateFieldSet(_closed, this, true);
      _classPrivateFieldGet(_handle, this).close();
    }
  }, {
    key: "entries",
    value: function entries() {
      return new _AsyncGenerator(function (_generator) {
        var _this = this;
        return _continueIgnored(_finallyRethrows(function () {
          var _interrupt = false;
          return _continueIgnored(_for(function () {
            return !_interrupt;
          }, void 0, function () {
            return _await(_classPrivateFieldGet(_readPromisified, _this).call(_this), function (result) {
              if (result === null) {
                _interrupt = true;
                return;
              }
              return _generator._yield(result).then(_empty);
            });
          }));
        }, function (_wasThrown, _result) {
          return _await(_classPrivateFieldGet(_closePromisified, _this).call(_this), function () {
            return _rethrow(_wasThrown, _result);
          });
        }));
      });
    }
  }, {
    key: SymbolDispose,
    value: function () {
      if (_classPrivateFieldGet(_closed, this)) return;
      this.closeSync();
    }
  }, {
    key: SymbolAsyncDispose,
    value: _async(function () {
      var _this2 = this;
      if (_classPrivateFieldGet(_closed, _this2)) return;
      return _awaitIgnored(_classPrivateFieldGet(_closePromisified, _this2).call(_this2));
    })
  }]);
}();
function _processHandlerQueue() {
  while (_classPrivateFieldGet(_handlerQueue, this).length > 0) {
    var handler = ArrayPrototypeShift(_classPrivateFieldGet(_handlerQueue, this));
    var {
      handle,
      path
    } = handler;
    var _result4 = handle.read(_classPrivateFieldGet(_options, this).encoding, _classPrivateFieldGet(_options, this).bufferSize);
    if (_result4 !== null) {
      _assertClassBrand(_Dir_brand, this, _processReadResult).call(this, path, _result4);
      if (_result4.length > 0) {
        ArrayPrototypePush(_classPrivateFieldGet(_handlerQueue, this), handler);
      }
    } else {
      handle.close();
    }
    if (_classPrivateFieldGet(_bufferedEntries, this).length > 0) {
      break;
    }
  }
  return _classPrivateFieldGet(_bufferedEntries, this).length > 0;
}
function _readImpl(maybeSync, callback) {
  if (_classPrivateFieldGet(_closed, this) === true) {
    throw new ERR_DIR_CLOSED();
  }
  if (callback === undefined) {
    return _classPrivateFieldGet(_readPromisified, this).call(this);
  }
  validateFunction(callback, 'callback');
  if (_classPrivateFieldGet(_operationQueue, this) !== null) {
    ArrayPrototypePush(_classPrivateFieldGet(_operationQueue, this), () => {
      _assertClassBrand(_Dir_brand, this, _readImpl).call(this, maybeSync, callback);
    });
    return;
  }
  if (_assertClassBrand(_Dir_brand, this, _processHandlerQueue).call(this)) {
    try {
      var dirent = ArrayPrototypeShift(_classPrivateFieldGet(_bufferedEntries, this));
      if (_classPrivateFieldGet(_options, this).recursive && dirent.isDirectory()) {
        _assertClassBrand(_Dir_brand, this, _readSyncRecursive).call(this, dirent);
      }
      if (maybeSync) process.nextTick(callback, null, dirent);else callback(null, dirent);
      return;
    } catch (error) {
      return callback(error);
    }
  }
  var req = new FSReqCallback();
  req.oncomplete = (err, result) => {
    process.nextTick(() => {
      var queue = _classPrivateFieldGet(_operationQueue, this);
      _classPrivateFieldSet(_operationQueue, this, null);
      for (var op of queue) op();
    });
    if (err || result === null) {
      return callback(err, result);
    }
    try {
      _assertClassBrand(_Dir_brand, this, _processReadResult).call(this, _classPrivateFieldGet(_path, this), result);
      var _dirent2 = ArrayPrototypeShift(_classPrivateFieldGet(_bufferedEntries, this));
      if (_classPrivateFieldGet(_options, this).recursive && _dirent2.isDirectory()) {
        _assertClassBrand(_Dir_brand, this, _readSyncRecursive).call(this, _dirent2);
      }
      callback(null, _dirent2);
    } catch (error) {
      callback(error);
    }
  };
  _classPrivateFieldSet(_operationQueue, this, []);
  _classPrivateFieldGet(_handle, this).read(_classPrivateFieldGet(_options, this).encoding, _classPrivateFieldGet(_options, this).bufferSize, req);
}
function _processReadResult(path, result) {
  for (var i = 0; i < result.length; i += 2) {
    ArrayPrototypePush(_classPrivateFieldGet(_bufferedEntries, this), getDirent(path, result[i], result[i + 1]));
  }
}
function _readSyncRecursive(dirent) {
  var path = pathModule.join(dirent.parentPath, dirent.name);
  var handle = dirBinding.opendir(path, _classPrivateFieldGet(_options, this).encoding);
  if (handle === undefined) {
    return;
  }
  ArrayPrototypePush(_classPrivateFieldGet(_handlerQueue, this), {
    handle,
    path
  });
}
ObjectDefineProperties(Dir.prototype, {
  [SymbolAsyncIterator]: {
    __proto__: null,
    enumerable: false,
    writable: true,
    configurable: true,
    value: Dir.prototype.entries
  }
});
function opendir(path, options, callback) {
  callback = typeof options === 'function' ? options : callback;
  validateFunction(callback, 'callback');
  var h = vfsState.handlers;
  if (h !== null) {
    try {
      var _result2 = h.opendirSync(path, options);
      if (_result2 !== undefined) {
        process.nextTick(callback, null, _result2);
        return;
      }
    } catch (err) {
      process.nextTick(callback, err);
      return;
    }
  }
  path = getValidatedPath(path);
  options = getOptions(options, {
    encoding: 'utf8'
  });
  function opendirCallback(error, handle) {
    if (error) {
      callback(error);
    } else {
      callback(null, new Dir(handle, path, options));
    }
  }
  var req = new FSReqCallback();
  req.oncomplete = opendirCallback;
  dirBinding.opendir(path, options.encoding, req);
}
function opendirSync(path, options) {
  var h = vfsState.handlers;
  if (h !== null) {
    var _result3 = h.opendirSync(path, options);
    if (_result3 !== undefined) return _result3;
  }
  path = getValidatedPath(path);
  options = getOptions(options, {
    encoding: 'utf8'
  });
  var handle = dirBinding.opendirSync(path);
  return new Dir(handle, path, options);
}
module.exports = {
  Dir,
  opendir,
  opendirSync
};

