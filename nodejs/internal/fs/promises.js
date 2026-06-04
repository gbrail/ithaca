'use strict';

function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
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
var _earlyReturn = /*#__PURE__*/{};
function _catchInGenerator(body, recover) {
  return _catch(body, function (e) {
    if (e === _earlyReturn) {
      throw e;
    }
    return recover(e);
  });
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
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator",
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
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
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
function _do(body, test) {
  var awaitBody;
  do {
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.v;
      } else {
        awaitBody = true;
        break;
      }
    }
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
  } while (!shouldContinue.then);
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (awaitBody ? result.then(_resumeAfterBody) : shouldContinue.then(_resumeAfterTest)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    for (;;) {
      shouldContinue = test();
      if (_isSettledPact(shouldContinue)) {
        shouldContinue = shouldContinue.v;
      }
      if (!shouldContinue) {
        break;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (result && result.then) {
        if (_isSettledPact(result)) {
          result = result.v;
        } else {
          result.then(_resumeAfterBody).then(void 0, reject);
          return;
        }
      }
    }
    _settle(pact, 1, result);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      do {
        result = body();
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_resumeAfterBody).then(void 0, reject);
            return;
          }
        }
        shouldContinue = test();
        if (_isSettledPact(shouldContinue)) {
          shouldContinue = shouldContinue.v;
        }
        if (!shouldContinue) {
          _settle(pact, 1, result);
          return;
        }
      } while (!shouldContinue.then);
      shouldContinue.then(_resumeAfterTest).then(void 0, reject);
    } else {
      _settle(pact, 1, result);
    }
  }
}
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _checkInRHS(e) { if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (null !== e ? typeof e : "null")); return e; }
var glob = function (pattern, options) {
  return new _AsyncGenerator(function (_generator3) {
    var Glob = lazyGlob();
    return _generator3._yield(new Glob(pattern, options).glob()).then(_empty);
  });
};
var _watch = function (filename) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  return new _AsyncGenerator(function (_generator2) {
    var _exit31 = false;
    var h = vfsState.handlers;
    return _invoke(function () {
      if (h !== null) {
        var result = h.promisesWatch(filename, options);
        return function () {
          if (result !== undefined) {
            return _generator2._yield(result).then(function () {
              _exit31 = true;
            });
          }
        }();
      }
    }, function (_result62) {
      var _exit32 = false;
      if (_exit31) return _result62;
      validateObject(options, 'options');
      return _invoke(function () {
        if (options.recursive != null) {
          validateBoolean(options.recursive, 'options.recursive');

          // TODO(anonrig): Remove non-native watcher when/if libuv supports recursive.
          // As of November 2022, libuv does not support recursive file watch on all platforms,
          // e.g. Linux due to the limitations of inotify.
          return function () {
            if (options.recursive && !isMacOS && !isWindows) {
              var watcher = new nonNativeWatcher.FSWatcher(options);
              watcher[kFSWatchStart](filename);
              return _generator2._yield(watcher).then(function () {
                _exit32 = true;
              });
            }
          }();
        }
      }, function (_result64) {
        return _exit32 ? _result64 : _generator2._yield(watch(filename, options)).then(_empty);
      });
    });
  });
};
var _readFile = _async(function (path, options) {
  var h = vfsState.handlers;
  if (h !== null) {
    checkAborted(options?.signal);
    var result = h.readFile(path, options);
    if (result !== undefined) return result;
  }
  options = getOptions(options, {
    flag: 'r'
  });
  var flag = options.flag || 'r';
  if (path instanceof FileHandle) return readFileHandle(path, options);
  checkAborted(options.signal);
  return _await(open(path, flag, 0o666), function (fd) {
    return handleFdClose(readFileHandle(fd, options), fd.close);
  });
});
var appendFile = _async(function (path, data, options) {
  var _exit30 = false;
  options = getOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'a'
  });
  parseFileMode(options.mode, 'mode', 0o666);
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      checkAborted(options.signal);
      var promise = h.appendFile(path, data, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit30 = true;
          });
        }
      }();
    }
  }, function (_result60) {
    if (_exit30) return _result60;
    options = copyObject(options);
    options.flag ||= 'a';
    return _writeFile(path, data, options);
  });
});
var _writeFile = _async(function (path, data, options) {
  var _exit29 = false;
  options = getOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'w',
    flush: false
  });
  var flush = options.flush ?? false;
  validateBoolean(flush, 'options.flush');
  parseFileMode(options.mode, 'mode', 0o666);
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      checkAborted(options.signal);
      var promise = h.writeFile(path, data, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit29 = true;
          });
        }
      }();
    }
  }, function (_result58) {
    if (_exit29) return _result58;
    var flag = options.flag || 'w';
    if (!isArrayBufferView(data) && !isCustomIterable(data)) {
      validateStringAfterArrayBufferView(data, 'data');
      data = Buffer.from(data, options.encoding || 'utf8');
    }
    validateAbortSignal(options.signal);
    if (path instanceof FileHandle) return writeFileHandle(path, data, options.signal, options.encoding);
    checkAborted(options.signal);
    return _await(open(path, flag, options.mode), function (fd) {
      var writeOp = writeFileHandle(fd, data, options.signal, options.encoding);
      if (flush) {
        writeOp = handleFdSync(writeOp, fd);
      }
      return handleFdClose(writeOp, fd.close);
    });
  });
});
var mkdtempDisposable = _async(function (prefix, options) {
  options = getOptions(options);
  prefix = getValidatedPath(prefix, 'prefix');
  warnOnNonPortableTemplate(prefix);
  var cwd = process.cwd();
  return _await(PromisePrototypeThen(binding.mkdtemp(prefix, options.encoding, kUsePromises), undefined, handleErrorFromBinding), function (path) {
    // Stash the full path in case of process.chdir()
    var fullPath = pathModule.resolve(cwd, path);
    var remove = _async(function () {
      var rmrf = lazyRimRaf();
      return _awaitIgnored(rmrf(fullPath, {
        maxRetries: 0,
        recursive: true,
        retryDelay: 0
      }));
    });
    return {
      __proto__: null,
      path,
      remove,
      [SymbolAsyncDispose]: _async(function () {
        return _callIgnored(remove);
      })
    };
  });
});
var mkdtemp = _async(function (prefix, options) {
  var _exit28 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.mkdtemp(prefix, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function (_await$promise6) {
            _exit28 = true;
            return _await$promise6;
          });
        }
      }();
    }
  }, function (_result56) {
    if (_exit28) return _result56;
    options = getOptions(options);
    prefix = getValidatedPath(prefix, 'prefix');
    warnOnNonPortableTemplate(prefix);
    return _await(PromisePrototypeThen(binding.mkdtemp(prefix, options.encoding, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var realpath = _async(function (path, options) {
  var _exit27 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.realpath(path, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function (_await$promise5) {
            _exit27 = true;
            return _await$promise5;
          });
        }
      }();
    }
  }, function (_result54) {
    if (_exit27) return _result54;
    options = getOptions(options);
    return _await(PromisePrototypeThen(binding.realpath(getValidatedPath(path), options.encoding, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var lutimes = _async(function (path, atime, mtime) {
  var _exit26 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.lutimes(path, atime, mtime);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit26 = true;
          });
        }
      }();
    }
  }, function (_result52) {
    return _exit26 ? _result52 : _await(PromisePrototypeThen(binding.lutimes(getValidatedPath(path), toUnixTimestamp(atime), toUnixTimestamp(mtime), kUsePromises), undefined, handleErrorFromBinding));
  });
});
var futimes = _async(function (handle, atime, mtime) {
  atime = toUnixTimestamp(atime, 'atime');
  mtime = toUnixTimestamp(mtime, 'mtime');
  return PromisePrototypeThen(binding.futimes(handle.fd, atime, mtime, kUsePromises), undefined, handleErrorFromBinding);
});
var utimes = _async(function (path, atime, mtime) {
  var _exit25 = false;
  path = getValidatedPath(path);
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.utimes(path, atime, mtime);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit25 = true;
          });
        }
      }();
    }
  }, function (_result50) {
    return _exit25 ? _result50 : _await(PromisePrototypeThen(binding.utimes(path, toUnixTimestamp(atime), toUnixTimestamp(mtime), kUsePromises), undefined, handleErrorFromBinding));
  });
});
var chown = _async(function (path, uid, gid) {
  var _exit24 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.chown(path, uid, gid);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit24 = true;
          });
        }
      }();
    }
  }, function (_result48) {
    if (_exit24) return _result48;
    path = getValidatedPath(path);
    validateInteger(uid, 'uid', -1, kMaxUserId);
    validateInteger(gid, 'gid', -1, kMaxUserId);
    return _await(PromisePrototypeThen(binding.chown(path, uid, gid, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var fchown = _async(function (handle, uid, gid) {
  validateInteger(uid, 'uid', -1, kMaxUserId);
  validateInteger(gid, 'gid', -1, kMaxUserId);
  if (permission.isEnabled()) {
    throw new ERR_ACCESS_DENIED('fchown API is disabled when Permission Model is enabled.');
  }
  return PromisePrototypeThen(binding.fchown(handle.fd, uid, gid, kUsePromises), undefined, handleErrorFromBinding);
});
var lchown = _async(function (path, uid, gid) {
  var _exit23 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.lchown(path, uid, gid);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit23 = true;
          });
        }
      }();
    }
  }, function (_result46) {
    if (_exit23) return _result46;
    path = getValidatedPath(path);
    validateInteger(uid, 'uid', -1, kMaxUserId);
    validateInteger(gid, 'gid', -1, kMaxUserId);
    return _await(PromisePrototypeThen(binding.lchown(path, uid, gid, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var lchmod = _async(function (path, mode) {
  var _exit22 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.lchmod(path, mode);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit22 = true;
          });
        }
      }();
    }
  }, function (_result44) {
    if (_exit22) return _result44;
    if (O_SYMLINK === undefined) throw new ERR_METHOD_NOT_IMPLEMENTED('lchmod()');
    return _await(open(path, O_WRONLY | O_SYMLINK), function (fd) {
      return handleFdClose(fchmod(fd, mode), fd.close);
    });
  });
});
var chmod = _async(function (path, mode) {
  var _exit21 = false;
  path = getValidatedPath(path);
  mode = parseFileMode(mode, 'mode');
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.chmod(path, mode);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit21 = true;
          });
        }
      }();
    }
  }, function (_result42) {
    return _exit21 ? _result42 : _await(PromisePrototypeThen(binding.chmod(path, mode, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var fchmod = _async(function (handle, mode) {
  if (permission.isEnabled()) {
    throw new ERR_ACCESS_DENIED('fchmod API is disabled when Permission Model is enabled.');
  }
  mode = parseFileMode(mode, 'mode');
  return PromisePrototypeThen(binding.fchmod(handle.fd, mode, kUsePromises), undefined, handleErrorFromBinding);
});
var unlink = _async(function (path) {
  var _exit20 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.unlink(path);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit20 = true;
          });
        }
      }();
    }
  }, function (_result40) {
    return _exit20 ? _result40 : _await(PromisePrototypeThen(binding.unlink(getValidatedPath(path), kUsePromises), undefined, handleErrorFromBinding));
  });
});
var link = _async(function (existingPath, newPath) {
  var _exit19 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.link(existingPath, newPath);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit19 = true;
          });
        }
      }();
    }
  }, function (_result38) {
    if (_exit19) return _result38;
    existingPath = getValidatedPath(existingPath, 'existingPath');
    newPath = getValidatedPath(newPath, 'newPath');
    return _await(PromisePrototypeThen(binding.link(existingPath, newPath, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var statfs = _async(function (path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    bigint: false
  };
  var h = vfsState.handlers;
  if (h !== null) {
    var result = h.statfs(path, options);
    if (result !== undefined) return result;
  }
  return _await(PromisePrototypeThen(binding.statfs(getValidatedPath(path), options.bigint, kUsePromises), undefined, handleErrorFromBinding), getStatFsFromBinding);
});
var stat = _async(function (path) {
  var _exit18 = false;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    bigint: false,
    throwIfNoEntry: true
  };
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.stat(path, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function (_await$promise4) {
            _exit18 = true;
            return _await$promise4;
          });
        }
      }();
    }
  }, function (_result36) {
    return _exit18 ? _result36 : _await(PromisePrototypeThen(binding.stat(getValidatedPath(path), options.bigint, kUsePromises, options.throwIfNoEntry), undefined, handleErrorFromBinding), function (result) {
      return !options.throwIfNoEntry && result === undefined ? undefined : getStatsFromBinding(result);
    });
  }); // Binding will resolve undefined if UV_ENOENT or UV_ENOTDIR and throwIfNoEntry is false
});
var lstat = _async(function (path) {
  var _exit17 = false;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    bigint: false
  };
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.lstat(path, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function (_await$promise3) {
            _exit17 = true;
            return _await$promise3;
          });
        }
      }();
    }
  }, function (_result34) {
    if (_exit17) return _result34;
    path = getValidatedPath(path);
    if (permission.isEnabled() && !permission.has('fs.read', path)) {
      var resource = pathModule.toNamespacedPath(BufferIsBuffer(path) ? BufferToString(path) : path);
      throw new ERR_ACCESS_DENIED('Access to this API has been restricted', 'FileSystemRead', resource);
    }
    return _await(PromisePrototypeThen(binding.lstat(path, options.bigint, kUsePromises), undefined, handleErrorFromBinding), getStatsFromBinding);
  });
});
var fstat = _async(function (handle) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    bigint: false
  };
  return _await(PromisePrototypeThen(binding.fstat(handle.fd, options.bigint, kUsePromises), undefined, handleErrorFromBinding), getStatsFromBinding);
});
var symlink = _async(function (target, path, type) {
  var _exit16 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.symlink(target, path, type);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit16 = true;
          });
        }
      }();
    }
  }, function (_result32) {
    if (_exit16) return _result32;
    validateOneOf(type, 'type', ['dir', 'file', 'junction', null, undefined]);
    return _invoke(function () {
      if (isWindows && type == null) {
        return _continueIgnored(_catch(function () {
          var absoluteTarget = pathModule.resolve(`${path}`, '..', `${target}`);
          return _await(stat(absoluteTarget), function (_stat) {
            type = _stat.isDirectory() ? 'dir' : 'file';
          });
        }, function () {
          // Default to 'file' if path is invalid or file does not exist
          type = 'file';
        }));
      }
    }, function () {
      // Due to the nature of Node.js runtime, symlinks has different edge cases that can bypass
      // the permission model security guarantees. Thus, this API is disabled unless fs.read
      // and fs.write permission has been given.
      if (permission.isEnabled() && !permission.has('fs')) {
        throw new ERR_ACCESS_DENIED('fs.symlink API requires full fs.read and fs.write permissions.');
      }
      target = getValidatedPath(target, 'target');
      path = getValidatedPath(path);
      return _await(PromisePrototypeThen(binding.symlink(preprocessSymlinkDestination(target, type, path), path, stringToSymlinkType(type), kUsePromises), undefined, handleErrorFromBinding));
    });
  });
});
var readlink = _async(function (path, options) {
  var _exit15 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.readlink(path, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function (_await$promise2) {
            _exit15 = true;
            return _await$promise2;
          });
        }
      }();
    }
  }, function (_result30) {
    if (_exit15) return _result30;
    options = getOptions(options);
    path = getValidatedPath(path, 'oldPath');
    return _await(PromisePrototypeThen(binding.readlink(path, options.encoding, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var readdir = _async(function (path, options) {
  var _exit14 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.readdir(path, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function (_await$promise) {
            _exit14 = true;
            return _await$promise;
          });
        }
      }();
    }
  }, function (_result28) {
    if (_exit14) return _result28;
    options = getOptions(options);

    // Make shallow copy to prevent mutating options from affecting results
    options = copyObject(options);
    path = getValidatedPath(path);
    return options.recursive ? readdirRecursive(path, options) : _await(PromisePrototypeThen(binding.readdir(path, options.encoding, !!options.withFileTypes, kUsePromises), undefined, handleErrorFromBinding), function (result) {
      return options.withFileTypes ? getDirectoryEntriesPromise(path, result) : result;
    });
  });
});
var readdirRecursive = _async(function (originalPath, options) {
  var result = [];
  return _await(PromisePrototypeThen(binding.readdir(originalPath, options.encoding, !!options.withFileTypes, kUsePromises), undefined, handleErrorFromBinding), function (_PromisePrototypeThen0) {
    var queue = [[originalPath, _PromisePrototypeThen0]];
    return _invoke(function () {
      if (options.withFileTypes) {
        return _continueIgnored(_for(function () {
          return queue.length > 0;
        }, void 0, function () {
          // If we want to implement BFS make this a `shift` call instead of `pop`
          var {
            0: path,
            1: readdir
          } = ArrayPrototypePop(queue);
          return _continueIgnored(_forOf(getDirents(path, readdir), function (dirent) {
            ArrayPrototypePush(result, dirent);
            return _invokeIgnored(function () {
              if (dirent.isDirectory()) {
                var direntPath = pathModule.join(path, dirent.name);
                return _await(PromisePrototypeThen(binding.readdir(direntPath, options.encoding, true, kUsePromises), undefined, handleErrorFromBinding), function (_PromisePrototypeThen1) {
                  ArrayPrototypePush(queue, [direntPath, _PromisePrototypeThen1]);
                });
              }
            });
          }));
        }));
      } else {
        return _continueIgnored(_for(function () {
          return queue.length > 0;
        }, void 0, function () {
          var {
            0: path,
            1: readdir
          } = ArrayPrototypePop(queue);
          return _continueIgnored(_forOf(readdir, function (ent) {
            var direntPath = pathModule.join(path, ent);
            var stat = binding.internalModuleStat(direntPath);
            ArrayPrototypePush(result, pathModule.relative(originalPath, direntPath));
            return _invokeIgnored(function () {
              if (stat === 1) {
                return _await(PromisePrototypeThen(binding.readdir(direntPath, options.encoding, false, kUsePromises), undefined, handleErrorFromBinding), function (_PromisePrototypeThen10) {
                  ArrayPrototypePush(queue, [direntPath, _PromisePrototypeThen10]);
                });
              }
            });
          }));
        }));
      }
    }, function () {
      return result;
    });
  });
});
var mkdir = _async(function (path, options) {
  var _exit13 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.mkdir(path, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function (_promise) {
            var _await$promise$result = _promise.result;
            _exit13 = true;
            return _await$promise$result;
          });
        }
      }();
    }
  }, function (_result26) {
    if (_exit13) return _result26;
    if (typeof options === 'number' || typeof options === 'string') {
      options = {
        mode: options
      };
    }
    var {
      recursive = false,
      mode = 0o777
    } = options || kEmptyObject;
    path = getValidatedPath(path);
    validateBoolean(recursive, 'options.recursive');
    return _await(PromisePrototypeThen(binding.mkdir(path, parseFileMode(mode, 'mode', 0o777), recursive, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var fsync = _async(function (handle) {
  return PromisePrototypeThen(binding.fsync(handle.fd, kUsePromises), undefined, handleErrorFromBinding);
});
var fdatasync = _async(function (handle) {
  return PromisePrototypeThen(binding.fdatasync(handle.fd, kUsePromises), undefined, handleErrorFromBinding);
});
var rmdir = _async(function (path, options) {
  var _exit12 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.rmdir(path);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit12 = true;
          });
        }
      }();
    }
  }, function (_result24) {
    if (_exit12) return _result24;
    path = getValidatedPath(path);
    if (options?.recursive !== undefined) {
      throw new ERR_INVALID_ARG_VALUE('options.recursive', options.recursive, 'is no longer supported');
    }
    options = validateRmdirOptions(options);
    return _await(PromisePrototypeThen(binding.rmdir(path, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var rm = _async(function (path, options) {
  var _exit11 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.rm(path, options);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit11 = true;
          });
        }
      }();
    }
  }, function (_result22) {
    if (_exit11) return _result22;
    path = getValidatedPath(path);
    return _await(validateRmOptionsPromise(path, options, false), function (_validateRmOptionsPro) {
      options = _validateRmOptionsPro;
      return lazyRimRaf()(path, options);
    });
  });
});
var ftruncate = _async(function (handle) {
  var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  validateInteger(len, 'len');
  len = MathMax(0, len);
  return PromisePrototypeThen(binding.ftruncate(handle.fd, len, kUsePromises), undefined, handleErrorFromBinding);
});
var truncate = _async(function (path) {
  var _exit10 = false;
  var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.truncate(path, len);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit10 = true;
          });
        }
      }();
    }
  }, function (_result20) {
    return _exit10 ? _result20 : _await(open(path, 'r+'), function (fd) {
      return handleFdClose(ftruncate(fd, len), fd.close);
    });
  });
});
var rename = _async(function (oldPath, newPath) {
  var _exit1 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.rename(oldPath, newPath);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit1 = true;
          });
        }
      }();
    }
  }, function (_result18) {
    if (_exit1) return _result18;
    oldPath = getValidatedPath(oldPath, 'oldPath');
    newPath = getValidatedPath(newPath, 'newPath');
    return _await(PromisePrototypeThen(binding.rename(oldPath, newPath, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var _writev = _async(function (handle, buffers, position) {
  validateBufferArray(buffers);
  if (typeof position !== 'number') position = null;
  return buffers.length === 0 ? {
    __proto__: null,
    bytesWritten: 0,
    buffers
  } : _await(PromisePrototypeThen(binding.writeBuffers(handle.fd, buffers, position, kUsePromises), undefined, handleErrorFromBinding), function (bytesWritten) {
    return {
      __proto__: null,
      bytesWritten,
      buffers
    };
  });
});
var _write = _async(function (handle, buffer, offsetOrOptions, length, position) {
  var _exit0 = false;
  if (buffer?.byteLength === 0) return {
    __proto__: null,
    bytesWritten: 0,
    buffer
  };
  var offset = offsetOrOptions;
  return _invoke(function () {
    if (isArrayBufferView(buffer)) {
      if (typeof offset === 'object') {
        ({
          offset = 0,
          length = buffer.byteLength - offset,
          position = null
        } = offsetOrOptions ?? kEmptyObject);
      }
      if (offset == null) {
        offset = 0;
      } else {
        validateInteger(offset, 'offset', 0);
      }
      if (typeof length !== 'number') length = buffer.byteLength - offset;
      if (typeof position !== 'number') position = null;
      validateOffsetLengthWrite(offset, length, buffer.byteLength);
      return _await(PromisePrototypeThen(binding.writeBuffer(handle.fd, buffer, offset, length, position, kUsePromises), undefined, handleErrorFromBinding), function (bytesWritten) {
        var _proto__$bytesWritte = {
          __proto__: null,
          bytesWritten,
          buffer
        };
        _exit0 = true;
        return _proto__$bytesWritte;
      });
    }
  }, function (_result16) {
    if (_exit0) return _result16;
    validateStringAfterArrayBufferView(buffer, 'buffer');
    validateEncoding(buffer, length);
    return _await(PromisePrototypeThen(binding.writeString(handle.fd, buffer, offset, length, kUsePromises), undefined, handleErrorFromBinding), function (bytesWritten) {
      return {
        __proto__: null,
        bytesWritten,
        buffer
      };
    });
  });
});
var _readv = _async(function (handle, buffers, position) {
  validateBufferArray(buffers);
  if (typeof position !== 'number') position = null;
  return _await(PromisePrototypeThen(binding.readBuffers(handle.fd, buffers, position, kUsePromises), undefined, handleErrorFromBinding), function (bytesRead) {
    return {
      __proto__: null,
      bytesRead,
      buffers
    };
  });
});
var _read = _async(function (handle, bufferOrParams, offset, length, position) {
  var buffer = bufferOrParams;
  if (!isArrayBufferView(buffer)) {
    // This is fh.read(params)
    if (bufferOrParams !== undefined) {
      validateObject(bufferOrParams, 'options', kValidateObjectAllowNullable);
    }
    ({
      buffer = Buffer.alloc(16384),
      offset = 0,
      length = buffer.byteLength - offset,
      position = null
    } = bufferOrParams ?? kEmptyObject);
    validateBuffer(buffer);
  }
  if (offset !== null && typeof offset === 'object') {
    // This is fh.read(buffer, options)
    ({
      offset = 0,
      length = buffer.byteLength - offset,
      position = null
    } = offset);
  }
  if (offset == null) {
    offset = 0;
  } else {
    validateInteger(offset, 'offset', 0);
  }
  length ??= buffer.byteLength - offset;
  if (position == null) {
    position = -1;
  } else {
    validatePosition(position, 'position', length);
  }
  if (length === 0) return {
    __proto__: null,
    bytesRead: length,
    buffer
  };
  if (buffer.byteLength === 0) {
    throw new ERR_INVALID_ARG_VALUE('buffer', buffer, 'is empty and cannot be written');
  }
  validateOffsetLengthRead(offset, length, buffer.byteLength);
  return _await(PromisePrototypeThen(binding.read(handle.fd, buffer, offset, length, position, kUsePromises), undefined, handleErrorFromBinding), function (bytesRead) {
    return {
      __proto__: null,
      bytesRead,
      buffer
    };
  });
});
// Note that unlike fs.open() which uses numeric file descriptors,
// fsPromises.open() uses the fs.FileHandle class.
var open = _async(function (path, flags, mode) {
  var h = vfsState.handlers;
  if (h !== null) {
    var result = h.promisesOpen(path, flags, mode);
    if (result !== undefined) return result;
  }
  path = getValidatedPath(path);
  var flagsNumber = stringToFlags(flags);
  mode = parseFileMode(mode, 'mode', 0o666);
  return _await(PromisePrototypeThen(binding.openFileHandle(path, flagsNumber, mode, kUsePromises), undefined, handleErrorFromBinding), function (_PromisePrototypeThen3) {
    return new FileHandle(_PromisePrototypeThen3);
  });
});
var copyFile = _async(function (src, dest, mode) {
  var _exit9 = false;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.copyFile(src, dest, mode);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit9 = true;
          });
        }
      }();
    }
  }, function (_result15) {
    return _exit9 ? _result15 : _await(PromisePrototypeThen(binding.copyFile(getValidatedPath(src, 'src'), getValidatedPath(dest, 'dest'), mode, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var cp = _async(function (src, dest, options) {
  options = validateCpOptions(options);
  src = getValidatedPath(src, 'src');
  dest = getValidatedPath(dest, 'dest');
  return lazyLoadCpPromises()(src, dest, options);
});
// All of the functions are defined as async in order to ensure that errors
// thrown cause promise rejections rather than being thrown synchronously.
var access = _async(function (path) {
  var _exit8 = false;
  var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : F_OK;
  var h = vfsState.handlers;
  return _invoke(function () {
    if (h !== null) {
      var promise = h.access(path, mode);
      return function () {
        if (promise !== undefined) {
          return _await(promise, function () {
            _exit8 = true;
          });
        }
      }();
    }
  }, function (_result13) {
    return _exit8 ? _result13 : _await(PromisePrototypeThen(binding.access(getValidatedPath(path), mode, kUsePromises), undefined, handleErrorFromBinding));
  });
});
var readFileHandle = _async(function (filehandle, options) {
  var signal = options?.signal;
  var encoding = options?.encoding;
  var decoder = encoding && new StringDecoder(encoding);
  checkAborted(signal);
  return _await(PromisePrototypeThen(binding.fstat(filehandle.fd, false, kUsePromises), undefined, handleErrorFromBinding), function (statFields) {
    var _exit7 = false;
    checkAborted(signal);
    var size = 0;
    var length = 0;
    if ((statFields[1 /* mode */] & S_IFMT) === S_IFREG) {
      size = statFields[8 /* size */];
      length = encoding ? MathMin(size, kReadFileBufferLength) : size;
    }
    if (length === 0) {
      length = kReadFileUnknownBufferLength;
    }
    if (size > kIoMaxLength) throw new ERR_FS_FILE_TOO_LARGE(size);
    var totalRead = 0;
    var noSize = size === 0;
    var buffer = Buffer.allocUnsafeSlow(length);
    var result = '';
    var offset = 0;
    var buffers;
    var chunkedRead = length > kReadFileBufferLength;
    return _for(function () {
      return !_exit7;
    }, void 0, function () {
      checkAborted(signal);
      if (chunkedRead) {
        length = MathMin(size - totalRead, kReadFileBufferLength);
      }
      return _await(PromisePrototypeThen(binding.read(filehandle.fd, buffer, offset, length, -1, kUsePromises), undefined, handleErrorFromBinding), function (bytesRead) {
        totalRead += bytesRead;
        if (bytesRead === 0 || totalRead === size || bytesRead !== buffer.length && !chunkedRead && !noSize) {
          var singleRead = bytesRead === totalRead;
          var bytesToCheck = chunkedRead ? totalRead : bytesRead;
          if (bytesToCheck !== buffer.length) {
            buffer = buffer.subarray(0, bytesToCheck);
          }
          if (!encoding) {
            if (noSize && !singleRead) {
              ArrayPrototypePush(buffers, buffer);
              var _Buffer$concat = Buffer.concat(buffers, totalRead);
              _exit7 = true;
              return _Buffer$concat;
            }
            _exit7 = true;
            return buffer;
          }
          if (singleRead) {
            var _buffer$toString = buffer.toString(encoding);
            _exit7 = true;
            return _buffer$toString;
          }
          result += decoder.end(buffer);
          _exit7 = true;
          return result;
        }
        var readBuffer = bytesRead !== buffer.length ? buffer.subarray(0, bytesRead) : buffer;
        if (encoding) {
          result += decoder.write(readBuffer);
        } else if (size !== 0) {
          offset = totalRead;
        } else {
          buffers ??= [];
          // Unknown file size requires chunks.
          ArrayPrototypePush(buffers, readBuffer);
          buffer = Buffer.allocUnsafeSlow(kReadFileUnknownBufferLength);
        }
      });
    });
  });
});
var writeFileHandle = _async(function (filehandle, data, signal, encoding) {
  var _exit6 = false;
  checkAborted(signal);
  return _invoke(function () {
    if (isCustomIterable(data)) {
      return _continue(_forAwaitOf(data, function (buf) {
        checkAborted(signal);
        var toWrite = isArrayBufferView(buf) ? buf : Buffer.from(buf, encoding || 'utf8');
        var remaining = toWrite.byteLength;
        return _continueIgnored(_for(function () {
          return remaining > 0;
        }, void 0, function () {
          var writeSize = MathMin(kWriteFileMaxChunkSize, remaining);
          return _await(_write(filehandle, toWrite, toWrite.byteLength - remaining, writeSize), function (_ref3) {
            var {
              bytesWritten
            } = _ref3;
            remaining -= bytesWritten;
            checkAborted(signal);
          });
        }));
      }), function () {
        _exit6 = true;
      });
    }
  }, function (_result10) {
    if (_exit6) return _result10;
    data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    var remaining = data.byteLength;
    if (remaining === 0) return;
    return _continueIgnored(_do(function () {
      checkAborted(signal);
      return _await(_write(filehandle, data, 0, MathMin(kWriteFileMaxChunkSize, data.byteLength)), function (_ref4) {
        var {
          bytesWritten
        } = _ref4;
        remaining -= bytesWritten;
        data = new Uint8Array(data.buffer, data.byteOffset + bytesWritten, data.byteLength - bytesWritten);
      });
    }, function () {
      return remaining > 0;
    }));
  });
});
var fsCall = _async(function (fn, handle) {
  for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    args[_key3 - 2] = arguments[_key3];
  }
  assert(handle[kRefs] !== undefined, 'handle must be an instance of FileHandle');
  if (handle.fd === -1) {
    // eslint-disable-next-line no-restricted-syntax
    var err = new Error(handle[kCloseReason] ?? 'file closed');
    err.code = 'EBADF';
    err.syscall = fn.name;
    throw err;
  }
  return _finallyRethrows(function () {
    handle[kRef]();
    return _await(fn.apply(void 0, [handle].concat(_toConsumableArray(new SafeArrayIterator(args)))));
  }, function (_wasThrown4, _result1) {
    handle[kUnref]();
    return _rethrow(_wasThrown4, _result1);
  });
});
var handleFdSync = _async(function (fileOpPromise, handle) {
  return PromisePrototypeThen(fileOpPromise, result => PromisePrototypeThen(handle.sync(), () => result, syncError => PromiseReject(syncError)), opError => PromiseReject(opError));
});
var handleFdClose = _async(function (fileOpPromise, closeFunc) {
  return PromisePrototypeThen(fileOpPromise, result => PromisePrototypeThen(closeFunc(), () => result), opError => PromisePrototypeThen(closeFunc(), () => PromiseReject(opError), closeError => PromiseReject(aggregateTwoErrors(closeError, opError))));
});
var {
  ArrayPrototypePop,
  ArrayPrototypePush,
  Error,
  ErrorCaptureStackTrace,
  FunctionPrototypeBind,
  MathMax,
  MathMin,
  Promise,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  SafeArrayIterator,
  SafePromisePrototypeFinally,
  Symbol: _Symbol,
  SymbolAsyncDispose,
  SymbolAsyncIterator,
  SymbolDispose,
  SymbolIterator,
  Uint8Array,
  uncurryThis
} = primordials;
var {
  fs: constants
} = internalBinding('constants');
var {
  F_OK,
  O_SYMLINK,
  O_WRONLY,
  S_IFMT,
  S_IFREG
} = constants;
var binding = internalBinding('fs');
var {
  Buffer
} = require('buffer');
var {
  isBuffer: BufferIsBuffer
} = Buffer;
var BufferToString = uncurryThis(Buffer.prototype.toString);
var {
  AbortError,
  aggregateTwoErrors,
  codes: {
    ERR_ACCESS_DENIED,
    ERR_FS_FILE_TOO_LARGE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE,
    ERR_METHOD_NOT_IMPLEMENTED,
    ERR_OPERATION_FAILED,
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var {
  isArrayBufferView
} = require('internal/util/types');
var {
  constants: {
    kIoMaxLength,
    kMaxUserId,
    kReadFileBufferLength,
    kReadFileUnknownBufferLength,
    kWriteFileMaxChunkSize
  },
  copyObject,
  getDirents,
  getOptions,
  getStatFsFromBinding,
  getStatsFromBinding,
  getValidatedPath,
  preprocessSymlinkDestination,
  stringToFlags,
  stringToSymlinkType,
  toUnixTimestamp,
  handleErrorFromBinding: handleSyncErrorFromBinding,
  validateBufferArray,
  validateCpOptions,
  validateOffsetLengthRead,
  validateOffsetLengthWrite,
  validatePosition,
  validateRmOptions,
  validateRmdirOptions,
  validateStringAfterArrayBufferView,
  vfsState,
  warnOnNonPortableTemplate
} = require('internal/fs/utils');
var {
  opendir
} = require('internal/fs/dir');
var {
  parseFileMode,
  validateAbortSignal,
  validateBoolean,
  validateBuffer,
  validateEncoding,
  validateInteger,
  validateObject,
  validateOneOf,
  kValidateObjectAllowNullable
} = require('internal/validators');
var pathModule = require('path');
var {
  getLazy,
  kEmptyObject,
  lazyDOMException,
  promisify,
  isWindows,
  isMacOS
} = require('internal/util');
var {
  getOptionValue
} = require('internal/options');
var EventEmitter = require('events');
var {
  StringDecoder
} = require('string_decoder');
var {
  kFSWatchStart,
  watch
} = require('internal/fs/watchers');
var nonNativeWatcher = require('internal/fs/recursive_watch');
var {
  isIterable
} = require('internal/streams/utils');
var assert = require('internal/assert');
var permission = require('internal/process/permission');
var kHandle = _Symbol('kHandle');
var kFd = _Symbol('kFd');
var kRefs = _Symbol('kRefs');
var kClosePromise = _Symbol('kClosePromise');
var kCloseReason = _Symbol('kCloseReason');
var kCloseResolve = _Symbol('kCloseResolve');
var kCloseReject = _Symbol('kCloseReject');
var kRef = _Symbol('kRef');
var kUnref = _Symbol('kUnref');
var kLocked = _Symbol('kLocked');
var kCloseSync = _Symbol('kCloseSync');
var {
  kUsePromises
} = binding;
var {
  Interface
} = require('internal/readline/interface');
var {
  kDeserialize,
  kTransfer,
  kTransferList,
  markTransferMode
} = require('internal/worker/js_transferable');
var getDirectoryEntriesPromise = promisify(getDirents);
var validateRmOptionsPromise = promisify(validateRmOptions);
var cpPromises;
function lazyLoadCpPromises() {
  return cpPromises ??= require('internal/fs/cp/cp').cpFn;
}

// Lazy loaded to avoid circular dependency.
var fsStreams;
function lazyFsStreams() {
  return fsStreams ??= require('internal/fs/streams');
}
var lazyRimRaf = getLazy(() => require('internal/fs/rimraf').rimrafPromises);
var lazyReadableStream = getLazy(() => require('internal/webstreams/readablestream').ReadableStream);

// Lazy loaded to avoid circular dependency with new streams.
var newStreamsPull;
var newStreamsPullSync;
var newStreamsParsePullArgs;
var newStreamsToUint8Array;
var newStreamsConvertChunks;
function lazyNewStreams() {
  if (newStreamsPull === undefined) {
    var pullModule = require('internal/streams/iter/pull');
    newStreamsPull = pullModule.pull;
    newStreamsPullSync = pullModule.pullSync;
    var utils = require('internal/streams/iter/utils');
    newStreamsParsePullArgs = utils.parsePullArgs;
    newStreamsToUint8Array = utils.toUint8Array;
    newStreamsConvertChunks = utils.convertChunks;
  }
}

// By the time the C++ land creates an error for a promise rejection (likely from a
// libuv callback), there is already no JS frames on the stack. So we need to
// wait until V8 resumes execution back to JS land before we have enough information
// to re-capture the stack trace.
function handleErrorFromBinding(error) {
  ErrorCaptureStackTrace(error, handleErrorFromBinding);
  return PromiseReject(error);
}
var _brandCheck = /*#__PURE__*/new WeakMap();
var FileHandle = /*#__PURE__*/function (_EventEmitter) {
  /**
   * @param {InternalFSBinding.FileHandle | undefined} filehandle
   */
  function FileHandle(filehandle) {
    var _this;
    _classCallCheck(this, FileHandle);
    _this = _callSuper(this, FileHandle);
    _classPrivateFieldInitSpec(_this, _brandCheck, undefined);
    _defineProperty(_this, "close", () => {
      if (_this[kFd] === -1) {
        return PromiseResolve();
      }
      if (_this[kClosePromise]) {
        return _this[kClosePromise];
      }
      _this[kRefs]--;
      if (_this[kRefs] === 0) {
        _this[kFd] = -1;
        _this[kClosePromise] = SafePromisePrototypeFinally(_this[kHandle].close(), () => {
          _this[kClosePromise] = undefined;
        });
      } else {
        _this[kClosePromise] = SafePromisePrototypeFinally(new Promise((resolve, reject) => {
          _this[kCloseResolve] = resolve;
          _this[kCloseReject] = reject;
        }), () => {
          _this[kClosePromise] = undefined;
          _this[kCloseReject] = undefined;
          _this[kCloseResolve] = undefined;
        });
      }
      _this.emit('close');
      return _this[kClosePromise];
    });
    markTransferMode(_this, false, true);
    _this[kHandle] = filehandle;
    _this[kFd] = filehandle ? filehandle.fd : -1;
    _this[kRefs] = 1;
    _this[kClosePromise] = null;
    return _this;
  }
  _inherits(FileHandle, _EventEmitter);
  return _createClass(FileHandle, [{
    key: "getAsyncId",
    value: function getAsyncId() {
      return this[kHandle].getAsyncId();
    }
  }, {
    key: "fd",
    get: function () {
      return this[kFd];
    }
  }, {
    key: "appendFile",
    value: function appendFile(data, options) {
      return fsCall(_writeFile, this, data, options);
    }
  }, {
    key: "chmod",
    value: function chmod(mode) {
      return fsCall(fchmod, this, mode);
    }
  }, {
    key: "chown",
    value: function chown(uid, gid) {
      return fsCall(fchown, this, uid, gid);
    }
  }, {
    key: "datasync",
    value: function datasync() {
      return fsCall(fdatasync, this);
    }
  }, {
    key: "sync",
    value: function sync() {
      return fsCall(fsync, this);
    }
  }, {
    key: "read",
    value: function read(buffer, offset, length, position) {
      return fsCall(_read, this, buffer, offset, length, position);
    }
  }, {
    key: "readv",
    value: function readv(buffers, position) {
      return fsCall(_readv, this, buffers, position);
    }
  }, {
    key: "readFile",
    value: function readFile(options) {
      return fsCall(_readFile, this, options);
    }
  }, {
    key: "readLines",
    value: function readLines() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      return new Interface({
        input: this.createReadStream(options),
        crlfDelay: Infinity
      });
    }
  }, {
    key: "stat",
    value: function stat(options) {
      return fsCall(fstat, this, options);
    }
  }, {
    key: "truncate",
    value: function truncate() {
      var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return fsCall(ftruncate, this, len);
    }
  }, {
    key: "utimes",
    value: function utimes(atime, mtime) {
      return fsCall(futimes, this, atime, mtime);
    }
  }, {
    key: "write",
    value: function write(buffer, offset, length, position) {
      return fsCall(_write, this, buffer, offset, length, position);
    }
  }, {
    key: "writev",
    value: function writev(buffers, position) {
      return fsCall(_writev, this, buffers, position);
    }
  }, {
    key: "writeFile",
    value: function writeFile(data, options) {
      return fsCall(_writeFile, this, data, options);
    }
  }, {
    key: kCloseSync,
    value: function () {
      if (this[kFd] === -1) return;
      if (this[kClosePromise]) {
        throw new ERR_INVALID_STATE('The FileHandle is closing');
      }
      this[kFd] = -1;
      this[kHandle].closeSync();
      this.emit('close');
    }
  }, {
    key: SymbolAsyncDispose,
    value: _async(function () {
      var _this2 = this;
      return _awaitIgnored(_this2.close());
    })
    /**
     * @typedef {import('../webstreams/readablestream').ReadableStream
     * } ReadableStream
     * @param {{ type?: 'bytes', autoClose?: boolean }} [options]
     * @returns {ReadableStream}
     */
  }, {
    key: "readableWebStream",
    value: function readableWebStream() {
      var _this3 = this;
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
      if (this[kFd] === -1) throw new ERR_INVALID_STATE('The FileHandle is closed');
      if (this[kClosePromise]) throw new ERR_INVALID_STATE('The FileHandle is closing');
      if (this[kLocked]) throw new ERR_INVALID_STATE('The FileHandle is locked');
      this[kLocked] = true;
      validateObject(options, 'options');
      var {
        type = 'bytes',
        autoClose = false
      } = options;
      validateBoolean(autoClose, 'options.autoClose');
      if (type !== 'bytes') {
        process.emitWarning('A non-"bytes" options.type has no effect. A byte-oriented steam is ' + 'always created.', 'ExperimentalWarning');
      }
      var readFn = FunctionPrototypeBind(this.read, this);
      var ondone = _async(function () {
        _this3[kUnref]();
        return _invokeIgnored(function () {
          if (autoClose) return _awaitIgnored(_this3.close());
        });
      });
      var ReadableStream = lazyReadableStream();
      var readable = new ReadableStream({
        type: 'bytes',
        autoAllocateChunkSize: 16384,
        pull: _async(function (controller) {
          var view = controller.byobRequest.view;
          return _await(readFn(view, view.byteOffset, view.byteLength), function (_ref) {
            var {
              bytesRead
            } = _ref;
            return _invoke(function () {
              if (bytesRead === 0) {
                controller.close();
                return _callIgnored(ondone);
              }
            }, function () {
              controller.byobRequest.respond(bytesRead);
            });
          });
        }),
        cancel: _async(function () {
          return _callIgnored(ondone);
        })
      });
      var {
        readableStreamCancel
      } = require('internal/webstreams/readablestream');
      this[kRef]();
      this.once('close', () => {
        readableStreamCancel(readable);
      });
      return readable;
    }

    /**
     * @typedef {import('./streams').ReadStream
     * } ReadStream
     * @param {{
     *   encoding?: string;
     *   autoClose?: boolean;
     *   emitClose?: boolean;
     *   start: number;
     *   end?: number;
     *   highWaterMark?: number;
     *   }} [options]
     * @returns {ReadStream}
     */
  }, {
    key: "createReadStream",
    value: function createReadStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var {
        ReadStream
      } = lazyFsStreams();
      return new ReadStream(undefined, _objectSpread(_objectSpread({}, options), {}, {
        fd: this
      }));
    }

    /**
     * @typedef {import('./streams').WriteStream
     * } WriteStream
     * @param {{
     *   encoding?: string;
     *   autoClose?: boolean;
     *   emitClose?: boolean;
     *   start: number;
     *   highWaterMark?: number;
     *   flush?: boolean;
     *   }} [options]
     * @returns {WriteStream}
     */
  }, {
    key: "createWriteStream",
    value: function createWriteStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var {
        WriteStream
      } = lazyFsStreams();
      return new WriteStream(undefined, _objectSpread(_objectSpread({}, options), {}, {
        fd: this
      }));
    }
  }, {
    key: kTransfer,
    value: function () {
      if (this[kClosePromise] || this[kRefs] > 1) {
        throw lazyDOMException('Cannot transfer FileHandle while in use', 'DataCloneError');
      }
      var handle = this[kHandle];
      this[kFd] = -1;
      this[kCloseReason] = 'The FileHandle has been transferred';
      this[kHandle] = null;
      this[kRefs] = 0;
      return {
        data: {
          handle
        },
        deserializeInfo: 'internal/fs/promises:FileHandle'
      };
    }
  }, {
    key: kTransferList,
    value: function () {
      return [this[kHandle]];
    }
  }, {
    key: kDeserialize,
    value: function (_ref2) {
      var {
        handle
      } = _ref2;
      this[kHandle] = handle;
      this[kFd] = handle.fd;
    }
  }, {
    key: kRef,
    value: function () {
      this[kRefs]++;
    }
  }, {
    key: kUnref,
    value: function () {
      this[kRefs]--;
      if (this[kRefs] === 0) {
        this[kFd] = -1;
        PromisePrototypeThen(this[kHandle].close(), this[kCloseResolve], this[kCloseReject]);
      }
    }
  }], [{
    key: "isFileHandle",
    value: function isFileHandle(value) {
      return value != null && typeof value === 'object' && _brandCheck.has(_checkInRHS(value));
    }
  }]);
}(EventEmitter);
if (getOptionValue('--experimental-stream-iter')) {
  var kNullPrototo = {
    __proto__: null
  };
  var kDefaultChunkSize = 131072;
  var kNone = -1;
  /**
   * Return the file contents as an AsyncIterable<Uint8Array[]> using the
   * new streams pull model. Optional transforms and options (including
   * AbortSignal) may be provided as trailing arguments, mirroring the
   * Stream.pull() signature.
   * @param {...(Function|object)} args - Optional transforms and/or options
   * @returns {AsyncIterable<Uint8Array[]>}
   */
  FileHandle.prototype.pull = function pull() {
    if (this[kFd] === kNone) throw new ERR_INVALID_STATE('The FileHandle is closed');
    if (this[kClosePromise]) throw new ERR_INVALID_STATE('The FileHandle is closing');
    if (this[kLocked]) throw new ERR_INVALID_STATE('The FileHandle is locked');
    lazyNewStreams();
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var {
      transforms,
      options = kNullPrototo
    } = newStreamsParsePullArgs(args);
    var {
      autoClose = false,
      chunkSize: readSize = kDefaultChunkSize,
      signal
    } = options;
    var {
      start: pos = kNone,
      limit: remaining = kNone
    } = options;
    var handle = this;
    var fd = this[kFd];
    validateBoolean(autoClose, 'options.autoClose');
    if (pos !== kNone) {
      validateInteger(pos, 'options.start', 0);
    }
    if (remaining !== kNone) {
      validateInteger(remaining, 'options.limit', 1);
    }
    if (readSize !== undefined) {
      validateInteger(readSize, 'options.chunkSize', 1);
    }
    if (signal !== undefined) {
      validateAbortSignal(signal, 'options.signal');
    }
    this[kLocked] = true;
    var source = {
      __proto__: null,
      [SymbolAsyncIterator]: function () {
        return new _AsyncGenerator(function (_generator) {
          var _exit = false;
          handle[kRef]();
          return _finallyRethrows(function () {
            if (signal) {
              var _interrupt = false;
              // Signal-aware path
              return _for(function () {
                return !(_interrupt || _exit) && remaining !== 0;
              }, void 0, function () {
                if (signal.aborted) {
                  throw signal.reason ?? lazyDOMException('The operation was aborted', 'AbortError');
                }
                var toRead = remaining > 0 ? MathMin(readSize, remaining) : readSize;
                var buf = Buffer.allocUnsafe(toRead);
                var bytesRead;
                return _continue(_catchInGenerator(function () {
                  return _await(binding.read(fd, buf, 0, toRead, pos, kUsePromises), function (_binding$read) {
                    bytesRead = _binding$read || 0;
                  });
                }, function (err) {
                  ErrorCaptureStackTrace(err, handleErrorFromBinding);
                  throw err;
                }), function (_result) {
                  if (_exit) return _result;
                  if (bytesRead === 0) {
                    _interrupt = true;
                    return;
                  }
                  if (pos >= 0) pos += bytesRead;
                  if (remaining > 0) remaining -= bytesRead;
                  return _generator._yield([bytesRead < toRead ? buf.subarray(0, bytesRead) : buf]).then(_empty);
                });
              });
            } else {
              var _exit3 = false,
                _interrupt3 = false;
              // Fast path - no signal check per iteration
              return _for(function () {
                return !(_interrupt3 || _exit3) && remaining !== 0;
              }, void 0, function () {
                var toRead = remaining > 0 ? MathMin(readSize, remaining) : readSize;
                var buf = Buffer.allocUnsafe(toRead);
                var bytesRead;
                return _continue(_catchInGenerator(function () {
                  return _await(binding.read(fd, buf, 0, toRead, pos, kUsePromises), function (_binding$read2) {
                    bytesRead = _binding$read2 || 0;
                  });
                }, function (err) {
                  ErrorCaptureStackTrace(err, handleErrorFromBinding);
                  throw err;
                }), function (_result4) {
                  if (_exit3) return _result4;
                  if (bytesRead === 0) {
                    _interrupt3 = true;
                    return;
                  }
                  if (pos >= 0) pos += bytesRead;
                  if (remaining > 0) remaining -= bytesRead;
                  return _generator._yield([bytesRead < toRead ? buf.subarray(0, bytesRead) : buf]).then(_empty);
                });
              });
            }
          }, function (_wasThrown, _result6) {
            handle[kLocked] = false;
            handle[kUnref]();
            return _invoke(function () {
              if (autoClose) {
                return _awaitIgnored(handle.close());
              }
            }, function () {
              return _rethrow(_wasThrown, _result6);
            });
          });
        });
      }
    };

    // If transforms provided, wrap with pull pipeline
    if (transforms.length > 0) {
      var pullArgs = _toConsumableArray(transforms);
      if (options) {
        ArrayPrototypePush(pullArgs, options);
      }
      return newStreamsPull.apply(void 0, [source].concat(_toConsumableArray(pullArgs)));
    }
    return source;
  };

  /**
   * Return the file contents as an Iterable<Uint8Array[]> using synchronous
   * reads. Optional transforms and options may be provided as trailing
   * arguments, mirroring the Stream.pullSync() signature.
   * @param {...(Function|object)} args - Optional transforms and/or options
   * @returns {Iterable<Uint8Array[]>}
   */
  FileHandle.prototype.pullSync = function pullSync() {
    if (this[kFd] === kNone) throw new ERR_INVALID_STATE('The FileHandle is closed');
    if (this[kClosePromise]) throw new ERR_INVALID_STATE('The FileHandle is closing');
    if (this[kLocked]) throw new ERR_INVALID_STATE('The FileHandle is locked');
    lazyNewStreams();
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    var {
      transforms,
      options = kNullPrototo
    } = newStreamsParsePullArgs(args);
    var {
      autoClose = false,
      chunkSize: readSize = kDefaultChunkSize
    } = options;
    var {
      start: pos = kNone,
      limit: remaining = kNone
    } = options;
    var handle = this;
    var fd = this[kFd];
    validateBoolean(autoClose, 'options.autoClose');
    if (pos !== kNone) {
      validateInteger(pos, 'options.start', 0);
    }
    if (remaining !== kNone) {
      validateInteger(remaining, 'options.limit', 1);
    }
    if (readSize !== undefined) {
      validateInteger(readSize, 'options.chunkSize', 1);
    }
    this[kLocked] = true;
    handle[kRef]();
    function cleanup() {
      handle[kLocked] = false;
      handle[kUnref]();
      if (autoClose) {
        handle[kCloseSync]();
      }
    }
    var source = {
      __proto__: null,
      [SymbolIterator]() {
        var done = false;
        return {
          __proto__: null,
          next() {
            if (done || remaining === 0) {
              if (!done) {
                done = true;
                cleanup();
              }
              return {
                done: true,
                value: undefined
              };
            }
            var toRead = remaining > 0 ? MathMin(readSize, remaining) : readSize;
            var buf = Buffer.allocUnsafe(toRead);
            var bytesRead;
            try {
              bytesRead = binding.read(fd, buf, 0, toRead, pos) || 0;
            } catch (err) {
              done = true;
              cleanup();
              throw err;
            }
            if (bytesRead === 0) {
              done = true;
              cleanup();
              return {
                done: true,
                value: undefined
              };
            }
            if (pos >= 0) pos += bytesRead;
            if (remaining > 0) remaining -= bytesRead;
            var chunk = bytesRead < toRead ? buf.subarray(0, bytesRead) : buf;
            return {
              done: false,
              value: [chunk]
            };
          },
          return() {
            if (!done) {
              done = true;
              cleanup();
            }
            return {
              done: true,
              value: undefined
            };
          }
        };
      }
    };
    if (transforms.length > 0) {
      return newStreamsPullSync.apply(void 0, [source].concat(_toConsumableArray(transforms)));
    }
    return source;
  };

  /**
   * Return a new-streams Writer backed by this file handle.
   * The writer uses direct binding.writeBuffer / binding.writeBuffers
   * calls, bypassing the FileHandle.write() validation chain.
   *
   * Supports writev() for batch writes (single syscall per batch).
   * Handles EAGAIN with retry (up to 5 attempts), matching WriteStream.
   * @param {{
   *   autoClose?: boolean;
   *   start?: number;
   * }} [options]
   * @returns {{ write, writev, end, fail }}
   */
  FileHandle.prototype.writer = function writer() {
    var cleanup = _async(function () {
      if (closed) return;
      closed = true;
      handle[kLocked] = false;
      handle[kUnref]();
      return _invokeIgnored(function () {
        if (autoClose) {
          return _awaitIgnored(handle.close());
        }
      });
    });
    // Writev with EAGAIN retry. On partial write, concatenates remaining
    // buffers and falls back to writeAll (same approach as WriteStream).
    var writevAll = _async(function (buffers, position, signal) {
      var _exit5 = false;
      asyncPending = true;
      return _finallyRethrows(function () {
        var totalSize = 0;
        for (var i = 0; i < buffers.length; i++) {
          totalSize += buffers[i].byteLength;
        }
        var retries = 0;
        return _for(function () {
          return !_exit5 && totalSize > 0;
        }, void 0, function () {
          return _await(PromisePrototypeThen(binding.writeBuffers(fd, buffers, position, kUsePromises), undefined, handleErrorFromBinding), function (bytesWritten) {
            signal?.throwIfAborted();
            if (bytesWritten === 0) {
              if (++retries > 5) {
                throw new ERR_OPERATION_FAILED('writev failed after retries');
              }
            } else {
              retries = 0;
            }
            totalBytesWritten += bytesWritten;
            totalSize -= bytesWritten;
            if (position >= 0) position += bytesWritten;
            return _invokeIgnored(function () {
              if (totalSize > 0) {
                // Partial write - concatenate remaining and use writeAll.
                var remaining = Buffer.concat(buffers);
                var wrote = bytesWritten;
                // writeAll is already inside asyncPending = true, but
                // writeAll sets it again - that's fine (idempotent).
                return _await(writeAll(remaining, wrote, remaining.length - wrote, position, signal), function () {
                  _exit5 = true;
                });
              }
            });
          });
        });
      }, function (_wasThrown3, _result0) {
        asyncPending = false;
        return _rethrow(_wasThrown3, _result0);
      });
    }); // Synchronous write with EAGAIN retry. Throws on I/O error.
    // Used by writeSync for the full write, and by writevSync for
    // completing a partial writev.
    // Write a single buffer with EAGAIN retry (up to 5 retries).
    var writeAll = _async(function (buf, offset, length, position, signal) {
      var _exit4 = false;
      asyncPending = true;
      return _finallyRethrows(function () {
        var retries = 0;
        return _for(function () {
          return !_exit4 && length > 0;
        }, void 0, function () {
          return _await(PromisePrototypeThen(binding.writeBuffer(fd, buf, offset, length, position, kUsePromises), undefined, handleErrorFromBinding), function (bytesWritten) {
            signal?.throwIfAborted();
            if (bytesWritten === 0) {
              if (++retries > 5) {
                throw new ERR_OPERATION_FAILED('write failed after retries');
              }
            } else {
              retries = 0;
            }
            totalBytesWritten += bytesWritten;
            offset += bytesWritten;
            length -= bytesWritten;
            if (position >= 0) position += bytesWritten;
          });
        });
      }, function (_wasThrown2, _result8) {
        asyncPending = false;
        return _rethrow(_wasThrown2, _result8);
      });
    });
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototo;
    if (this[kFd] === kNone) throw new ERR_INVALID_STATE('The FileHandle is closed');
    if (this[kClosePromise]) throw new ERR_INVALID_STATE('The FileHandle is closing');
    if (this[kLocked]) throw new ERR_INVALID_STATE('The FileHandle is locked');
    lazyNewStreams();
    validateObject(options, 'options');
    var {
      autoClose = false,
      chunkSize: syncWriteThreshold = kDefaultChunkSize
    } = options;
    var {
      start: pos = kNone,
      limit: bytesRemaining = kNone
    } = options;
    var handle = this;
    var fd = this[kFd];
    var totalBytesWritten = 0;
    var closed = false;
    var closing = false;
    var pendingEndPromise = null;
    var error = null;
    var asyncPending = false;
    validateBoolean(autoClose, 'options.autoClose');
    if (pos !== kNone) {
      validateInteger(pos, 'options.start', 0);
    }
    if (bytesRemaining !== kNone) {
      validateInteger(bytesRemaining, 'options.limit', 1);
    }
    if (syncWriteThreshold !== undefined) {
      validateInteger(syncWriteThreshold, 'options.chunkSize', 1);
    }
    this[kLocked] = true;
    handle[kRef]();
    function writeSyncAll(buf, offset, length, position) {
      var retries = 0;
      while (length > 0) {
        var ctx = {};
        var bytesWritten = binding.writeBuffer(fd, buf, offset, length, position, undefined, ctx) || 0;
        if (ctx.errno !== undefined) {
          handleSyncErrorFromBinding(ctx);
        }
        if (bytesWritten === 0) {
          if (++retries > 5) {
            throw new ERR_OPERATION_FAILED('write failed after retries');
          }
        } else {
          retries = 0;
        }
        totalBytesWritten += bytesWritten;
        offset += bytesWritten;
        length -= bytesWritten;
        if (position >= 0) position += bytesWritten;
      }
    }
    return {
      __proto__: null,
      write(chunk) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototo;
        if (error) {
          return PromiseReject(error);
        }
        if (closed) {
          return PromiseReject(new ERR_INVALID_STATE.TypeError('The writer is closed'));
        }
        validateObject(options, 'options');
        var {
          signal
        } = options;
        if (signal !== undefined) {
          validateAbortSignal(signal, 'options.signal');
          if (signal.aborted) {
            return PromiseReject(signal.reason);
          }
        }
        chunk = newStreamsToUint8Array(chunk);
        if (bytesRemaining >= 0 && chunk.byteLength > bytesRemaining) {
          return PromiseReject(new ERR_OUT_OF_RANGE('write', `<= ${bytesRemaining} bytes`, chunk.byteLength));
        }
        if (bytesRemaining > 0) bytesRemaining -= chunk.byteLength;
        var position = pos;
        if (pos >= 0) pos += chunk.byteLength;
        return writeAll(chunk, 0, chunk.byteLength, position, signal);
      },
      writev(chunks) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kNullPrototo;
        if (error) {
          return PromiseReject(error);
        }
        if (closed) {
          return PromiseReject(new ERR_INVALID_STATE.TypeError('The writer is closed'));
        }
        validateObject(options, 'options');
        var {
          signal
        } = options;
        if (signal !== undefined) {
          validateAbortSignal(signal, 'options.signal');
          if (signal?.aborted) {
            return PromiseReject(signal.reason);
          }
        }
        chunks = newStreamsConvertChunks(chunks);
        var totalSize = 0;
        for (var i = 0; i < chunks.length; i++) {
          totalSize += chunks[i].byteLength;
        }
        if (bytesRemaining >= 0 && totalSize > bytesRemaining) {
          return PromiseReject(new ERR_OUT_OF_RANGE('writev', `<= ${bytesRemaining} bytes`, totalSize));
        }
        if (bytesRemaining > 0) bytesRemaining -= totalSize;
        var position = pos;
        if (pos >= 0) pos += totalSize;
        return writevAll(chunks, position, signal);
      },
      writeSync(chunk) {
        if (error || closed || asyncPending) return false;
        chunk = newStreamsToUint8Array(chunk);
        var length = chunk.byteLength;
        if (length > syncWriteThreshold) return false;
        if (length === 0) return true;
        if (bytesRemaining >= 0 && length > bytesRemaining) return false;
        var position = pos;
        // First attempt - if this fails with zero bytes written,
        // return false so pipeTo can fall back to async write().
        var ctx = {};
        var bytesWritten = binding.writeBuffer(fd, chunk, 0, length, position, undefined, ctx) || 0;
        if (ctx.errno !== undefined) return false;
        totalBytesWritten += bytesWritten;
        if (position >= 0) {
          pos = position + bytesWritten;
        }
        if (bytesWritten === length) {
          if (bytesRemaining > 0) bytesRemaining -= length;
          return true;
        }
        // Partial write - bytes are on disk. Must complete or throw.
        // Cannot return false here because pipeTo would re-send the
        // full chunk, causing duplicate data on disk.
        writeSyncAll(chunk, bytesWritten, length - bytesWritten, position >= 0 ? position + bytesWritten : -1);
        if (bytesRemaining > 0) bytesRemaining -= length;
        return true;
      },
      writevSync(chunks) {
        if (error || closed || asyncPending) return false;
        chunks = newStreamsConvertChunks(chunks);
        var totalSize = 0;
        for (var i = 0; i < chunks.length; i++) {
          totalSize += chunks[i].byteLength;
        }
        if (totalSize > syncWriteThreshold) return false;
        if (totalSize === 0) return true;
        if (bytesRemaining >= 0 && totalSize > bytesRemaining) return false;
        var position = pos;
        // writeBuffers throws on error (zero bytes written) - safe
        // to catch and return false for async fallback.
        var bytesWritten;
        try {
          bytesWritten = binding.writeBuffers(fd, chunks, position) || 0;
        } catch {
          return false;
        }
        totalBytesWritten += bytesWritten;
        if (position >= 0) {
          pos = position + bytesWritten;
        }
        if (bytesWritten === totalSize) {
          if (bytesRemaining > 0) bytesRemaining -= totalSize;
          return true;
        }
        // Partial writev - bytes are on disk. Must complete or throw.
        var rest = Buffer.concat(chunks);
        writeSyncAll(rest, bytesWritten, rest.byteLength - bytesWritten, position >= 0 ? position + bytesWritten : -1);
        if (bytesRemaining > 0) bytesRemaining -= totalSize;
        return true;
      },
      end() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kNullPrototo;
        if (error) {
          return PromiseReject(error);
        }
        if (closed) {
          return PromiseResolve(totalBytesWritten);
        }
        if (closing) {
          return pendingEndPromise;
        }
        validateObject(options, 'options');
        var {
          signal
        } = options;
        if (signal !== undefined) {
          validateAbortSignal(signal, 'options.signal');
          if (signal.aborted) {
            return PromiseReject(signal.reason);
          }
        }
        closing = true;
        pendingEndPromise = PromisePrototypeThen(cleanup(), () => totalBytesWritten);
        return pendingEndPromise;
      },
      endSync() {
        if (error) return -1;
        if (closed) return totalBytesWritten;
        if (asyncPending) return -1;
        closed = true;
        handle[kLocked] = false;
        handle[kUnref]();
        if (autoClose) {
          handle[kCloseSync]();
        }
        return totalBytesWritten;
      },
      fail(reason) {
        if (closed || error) return;
        error = reason ?? new ERR_INVALID_STATE('Failed');
        closed = true;
        handle[kLocked] = false;
        handle[kUnref]();
        if (autoClose) {
          handle[kCloseSync]();
        }
      },
      [SymbolAsyncDispose]() {
        if (closing) {
          return pendingEndPromise ?? PromiseResolve();
        }
        if (!closed && !error) {
          this.fail();
        }
        return PromiseResolve();
      },
      [SymbolDispose]() {
        this.fail();
      }
    };
  };
}
function checkAborted(signal) {
  if (signal?.aborted) throw new AbortError(undefined, {
    cause: signal.reason
  });
}
function isCustomIterable(obj) {
  return isIterable(obj) && !isArrayBufferView(obj) && typeof obj !== 'string';
}
var lazyGlob = getLazy(() => require('internal/fs/glob').Glob);
module.exports = {
  exports: {
    access,
    copyFile,
    cp,
    glob,
    open,
    opendir: promisify(opendir),
    rename,
    truncate,
    rm,
    rmdir,
    mkdir,
    readdir,
    readlink,
    symlink,
    lstat,
    stat,
    statfs,
    link,
    unlink,
    chmod,
    lchmod,
    lchown,
    chown,
    utimes,
    lutimes,
    realpath,
    mkdtemp,
    mkdtempDisposable,
    writeFile: _writeFile,
    appendFile,
    readFile: _readFile,
    watch: _watch,
    constants
  },
  FileHandle,
  kHandle,
  kLocked,
  kRef,
  kUnref
};

