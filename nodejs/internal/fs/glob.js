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
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
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
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var _iterateSubpatterns = function (path, pattern) {
  return new _AsyncGenerator(function (_generator2) {
    var _this7 = this;
    var seen = _classPrivateFieldGet(_cache2, _this7).add(path, pattern);
    if (seen) {
      return;
    }
    var fullpath = resolve(_classPrivateFieldGet(_root2, _this7), path);
    return _await(_classPrivateFieldGet(_cache2, _this7).stat(fullpath), function (stat) {
      var last = pattern.last;
      return _await(_assertClassBrand(_Glob_brand, _this7, _isDirectory).call(_this7, fullpath, stat, pattern), function (isDirectory) {
        var _exit3 = false;
        var isLast = pattern.isLast(isDirectory);
        var isFirst = pattern.isFirst();
        if (_classPrivateFieldGet(_isExcluded2, _this7).call(_this7, fullpath)) {
          return;
        }
        if (isFirst && isWindows && typeof pattern.at(0) === 'string' && StringPrototypeEndsWith(pattern.at(0), ':')) {
          // Absolute path, go to root
          _assertClassBrand(_Glob_brand, _this7, _addSubpattern).call(_this7, `${pattern.at(0)}\\`, pattern.child(new SafeSet().add(1)));
          return;
        }
        if (isFirst && pattern.at(0) === '') {
          // Absolute path, go to root
          _assertClassBrand(_Glob_brand, _this7, _addSubpattern).call(_this7, '/', pattern.child(new SafeSet().add(1)));
          return;
        }
        if (isFirst && pattern.at(0) === '..') {
          // Start with .., go to parent
          _assertClassBrand(_Glob_brand, _this7, _addSubpattern).call(_this7, '../', pattern.child(new SafeSet().add(1)));
          return;
        }
        if (isFirst && pattern.at(0) === '.') {
          // Start with ., proceed
          _assertClassBrand(_Glob_brand, _this7, _addSubpattern).call(_this7, '.', pattern.child(new SafeSet().add(1)));
          return;
        }
        return _invoke(function () {
          if (isLast && typeof pattern.at(-1) === 'string') {
            // Add result if it exists
            var p = pattern.at(-1);
            return _await(_classPrivateFieldGet(_cache2, _this7).stat(join(fullpath, p)), function (stat) {
              return _invoke(function () {
                if (stat && (p || isDirectory)) {
                  var result = join(path, p);
                  return _invokeIgnored(function () {
                    if (!_classPrivateFieldGet(_results, _this7).has(result)) {
                      return _invokeIgnored(function () {
                        if (_classPrivateFieldGet(_results, _this7).add(result)) {
                          return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? stat : result).then(_empty);
                        }
                      });
                    }
                  });
                }
              }, function () {
                if (pattern.indexes.size === 1 && pattern.indexes.has(last)) {
                  _exit3 = true;
                }
              });
            });
          } else return _invokeIgnored(function () {
            if (isLast && pattern.at(-1) === lazyMinimatch().GLOBSTAR && (path !== '.' || pattern.at(0) === '.' || last === 0 && stat)) {
              // If pattern ends with **, add to results
              // if path is ".", add it only if pattern starts with "." or pattern is exactly "**"
              return _invokeIgnored(function () {
                if (!_classPrivateFieldGet(_results, _this7).has(path)) {
                  return _invokeIgnored(function () {
                    if (_classPrivateFieldGet(_results, _this7).add(path)) {
                      return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? stat : path).then(_empty);
                    }
                  });
                }
              });
            }
          });
        }, function (_result3) {
          var _exit4 = false;
          if (_exit3) return _result3;
          return _await(!isDirectory || _assertClassBrand(_Glob_brand, _this7, _isCyclic).call(_this7, fullpath, isDirectory, pattern), function (_assertClassBrand$cal) {
            if (_assertClassBrand$cal) {
              _exit4 = true;
              return;
            }
            return _await(_assertClassBrand(_Glob_brand, _this7, _nextRealpaths).call(_this7, fullpath, isDirectory, pattern), function (nextRealpaths) {
              var _exit5 = false;
              var children;
              var firstPattern = pattern.indexes.size === 1 && pattern.at(pattern.indexes.values().next().value);
              return _invoke(function () {
                if (typeof firstPattern === 'string') {
                  return _await(_classPrivateFieldGet(_cache2, _this7).stat(join(fullpath, firstPattern)), function (stat) {
                    if (stat) {
                      stat.name = firstPattern;
                      children = [stat];
                    } else {
                      _exit5 = true;
                    }
                  });
                } else {
                  return _await(_classPrivateFieldGet(_cache2, _this7).readdir(fullpath), function (_classPrivateFieldGet3) {
                    children = _classPrivateFieldGet3;
                  });
                }
              }, function (_result4) {
                var _exit6 = false;
                if (_exit5) return _result4;
                return _forTo(children, function (i) {
                  var entry = children[i];
                  var entryPath = join(path, entry.name);
                  var entryFullpath = join(fullpath, entry.name);
                  _classPrivateFieldGet(_cache2, _this7).addToStatCache(entryFullpath, entry);
                  var _entry$isDirectory = entry.isDirectory(),
                    _temp2 = !_entry$isDirectory && _classPrivateFieldGet(_followSymlinks, _this7) && entry.isSymbolicLink();
                  return _await(_entry$isDirectory || _temp2 && _classPrivateFieldGet(_cache2, _this7).followStat(entryFullpath), function (_classPrivateFieldGet4) {
                    var _exit7 = false;
                    var entryIsDirectory = _entry$isDirectory || _temp2 && !!_classPrivateFieldGet4?.isDirectory();
                    var subPatterns = new SafeSet();
                    var nSymlinks = new SafeSet();
                    return _continue(_forOf(pattern.indexes, function (index) {
                      // For each child, check potential patterns
                      if (_classPrivateFieldGet(_cache2, _this7).seen(entryPath, pattern, index) || _classPrivateFieldGet(_cache2, _this7).seen(entryPath, pattern, index + 1)) {
                        _exit6 = true;
                        return;
                      }
                      var current = pattern.at(index);
                      var nextIndex = index + 1;
                      var next = pattern.at(nextIndex);
                      var fromSymlink = !_classPrivateFieldGet(_followSymlinks, _this7) && pattern.symlinks.has(index);
                      return _invoke(function () {
                        if (current === lazyMinimatch().GLOBSTAR) {
                          var isDot = entry.name[0] === '.';
                          var nextMatches = pattern.test(nextIndex, entry.name);
                          var nextNonGlobIndex = nextIndex;
                          while (pattern.at(nextNonGlobIndex) === lazyMinimatch().GLOBSTAR) {
                            nextNonGlobIndex++;
                          }
                          var matchesDot = isDot && pattern.test(nextNonGlobIndex, entry.name);
                          if (isDot && !matchesDot || _classPrivateFieldGet(_exclude, _this7) && _classPrivateFieldGet(_exclude, _this7).call(_this7, _classPrivateFieldGet(_withFileTypes, _this7) ? entry : entry.name)) {
                            return;
                          }
                          return _invoke(function () {
                            if (!fromSymlink && entryIsDirectory) {
                              // If directory, add ** to its potential patterns
                              subPatterns.add(index);
                            } else return _invokeIgnored(function () {
                              if (!fromSymlink && index === last) {
                                // If ** is last, add to results
                                return _invokeIgnored(function () {
                                  if (!_classPrivateFieldGet(_results, _this7).has(entryPath) && _classPrivateFieldGet(_results, _this7).add(entryPath)) {
                                    return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? entry : entryPath).then(_empty);
                                  }
                                });
                              }
                            });
                          }, function () {
                            // Any pattern after ** is also a potential pattern
                            // so we can already test it here
                            return _invoke(function () {
                              if (nextMatches && nextIndex === last && !isLast) {
                                // If next pattern is the last one, add to results
                                return _invokeIgnored(function () {
                                  if (!_classPrivateFieldGet(_results, _this7).has(entryPath) && _classPrivateFieldGet(_results, _this7).add(entryPath)) {
                                    return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? entry : entryPath).then(_empty);
                                  }
                                });
                              } else if (nextMatches && entryIsDirectory) {
                                // Pattern matched, meaning two patterns forward
                                // are also potential patterns
                                // e.g **/b/c when entry is a/b - add c to potential patterns
                                subPatterns.add(index + 2);
                              }
                            }, function () {
                              if ((nextMatches || pattern.at(0) === '.') && (entryIsDirectory || entry.isSymbolicLink()) && !fromSymlink) {
                                // If pattern after ** matches, or pattern starts with "."
                                // and entry is a directory or symlink, add to potential patterns
                                subPatterns.add(nextIndex);
                              }
                              if (!_classPrivateFieldGet(_followSymlinks, _this7) && entry.isSymbolicLink()) {
                                nSymlinks.add(index);
                              }
                              return _invokeIgnored(function () {
                                if (next === '..' && entryIsDirectory) {
                                  // In case pattern is "**/..",
                                  // both parent and current directory should be added to the queue
                                  // if this is the last pattern, add to results instead
                                  var parent = join(path, '..');
                                  return _invokeIgnored(function () {
                                    if (nextIndex < last) {
                                      if (!_classPrivateFieldGet(_subpatterns, _this7).has(path) && !_classPrivateFieldGet(_cache2, _this7).seen(path, pattern, nextIndex + 1)) {
                                        _classPrivateFieldGet(_subpatterns, _this7).set(path, [pattern.child(new SafeSet().add(nextIndex + 1))]);
                                      }
                                      if (!_classPrivateFieldGet(_subpatterns, _this7).has(parent) && !_classPrivateFieldGet(_cache2, _this7).seen(parent, pattern, nextIndex + 1)) {
                                        _classPrivateFieldGet(_subpatterns, _this7).set(parent, [pattern.child(new SafeSet().add(nextIndex + 1))]);
                                      }
                                    } else {
                                      return _invoke(function () {
                                        if (!_classPrivateFieldGet(_cache2, _this7).seen(path, pattern, nextIndex)) {
                                          _classPrivateFieldGet(_cache2, _this7).add(path, pattern.child(new SafeSet().add(nextIndex)));
                                          return _invokeIgnored(function () {
                                            if (!_classPrivateFieldGet(_results, _this7).has(path)) {
                                              return _invokeIgnored(function () {
                                                if (_classPrivateFieldGet(_results, _this7).add(path)) {
                                                  return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? _classPrivateFieldGet(_cache2, _this7).statSync(fullpath) : path).then(_empty);
                                                }
                                              });
                                            }
                                          });
                                        }
                                      }, function () {
                                        return _invokeIgnored(function () {
                                          if (!_classPrivateFieldGet(_cache2, _this7).seen(path, pattern, nextIndex) || !_classPrivateFieldGet(_cache2, _this7).seen(parent, pattern, nextIndex)) {
                                            _classPrivateFieldGet(_cache2, _this7).add(parent, pattern.child(new SafeSet().add(nextIndex)));
                                            return _invokeIgnored(function () {
                                              if (!_classPrivateFieldGet(_results, _this7).has(parent)) {
                                                return _invokeIgnored(function () {
                                                  if (_classPrivateFieldGet(_results, _this7).add(parent)) {
                                                    return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? _classPrivateFieldGet(_cache2, _this7).statSync(join(_classPrivateFieldGet(_root2, _this7), parent)) : parent).then(_empty);
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      });
                                    }
                                  });
                                }
                              });
                            });
                          });
                        }
                      }, function () {
                        return _invoke(function () {
                          if (typeof current === 'string') {
                            return _invokeIgnored(function () {
                              if (pattern.test(index, entry.name) && index !== last) {
                                // If current pattern matches entry name
                                // the next pattern is a potential pattern
                                subPatterns.add(nextIndex);
                              } else return _invokeIgnored(function () {
                                if (current === '.' && pattern.test(nextIndex, entry.name)) {
                                  // If current pattern is ".", proceed to test next pattern
                                  return _invokeIgnored(function () {
                                    if (nextIndex === last) {
                                      return _invokeIgnored(function () {
                                        if (!_classPrivateFieldGet(_results, _this7).has(entryPath)) {
                                          return _invokeIgnored(function () {
                                            if (_classPrivateFieldGet(_results, _this7).add(entryPath)) {
                                              return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? entry : entryPath).then(_empty);
                                            }
                                          });
                                        }
                                      });
                                    } else {
                                      subPatterns.add(nextIndex + 1);
                                    }
                                  });
                                }
                              });
                            });
                          }
                        }, function () {
                          return _invokeIgnored(function () {
                            if (typeof current === 'object' && pattern.test(index, entry.name)) {
                              // If current pattern is a regex that matches entry name (e.g *.js)
                              // add next pattern to potential patterns, or to results if it's the last pattern
                              return _invokeIgnored(function () {
                                if (index === last) {
                                  return _invokeIgnored(function () {
                                    if (!_classPrivateFieldGet(_results, _this7).has(entryPath)) {
                                      return _invokeIgnored(function () {
                                        if (_classPrivateFieldGet(_results, _this7).add(entryPath)) {
                                          return _generator2._yield(_classPrivateFieldGet(_withFileTypes, _this7) ? entry : entryPath).then(_empty);
                                        }
                                      });
                                    }
                                  });
                                } else if (entryIsDirectory) {
                                  subPatterns.add(nextIndex);
                                }
                              });
                            }
                          });
                        });
                      });
                    }, function () {
                      return _exit7;
                    }), function (_result5) {
                      if (_exit7) return _result5;
                      if (subPatterns.size > 0) {
                        // If there are potential patterns, add to queue
                        _assertClassBrand(_Glob_brand, _this7, _addSubpattern).call(_this7, entryPath, pattern.child(subPatterns, nSymlinks, nextRealpaths));
                      }
                    });
                  }, _entry$isDirectory || !_temp2);
                }, function () {
                  return _exit6;
                });
              });
            });
          }, !isDirectory);
        });
      });
    });
  });
};
var _isCyclic = _async(function (path, isDirectory, pattern) {
  var _this6 = this;
  return !_classPrivateFieldGet(_followSymlinks, _this6) || !isDirectory ? false : _await(_classPrivateFieldGet(_cache2, _this6).realpath(path), function (real) {
    return real !== null && pattern.realpaths.has(real);
  });
});
var _nextRealpaths = _async(function (path, isDirectory, pattern) {
  var _this5 = this;
  return !_classPrivateFieldGet(_followSymlinks, _this5) || !isDirectory ? pattern.realpaths : _await(_classPrivateFieldGet(_cache2, _this5).realpath(path), function (real) {
    if (real === null) {
      return pattern.realpaths;
    }
    var realpaths = cloneSet(pattern.realpaths);
    realpaths.add(real);
    return realpaths;
  });
});
var _isDirectory = _async(function (path, stat, pattern) {
  var _exit2 = false;
  var _this4 = this;
  if (stat?.isDirectory()) {
    return true;
  }
  return stat?.isSymbolicLink() ? _invoke(function () {
    if (_classPrivateFieldGet(_followSymlinks, _this4)) {
      return _await(_classPrivateFieldGet(_cache2, _this4).followStat(path), function (_classPrivateFieldGet2) {
        var _await$_classPrivateF = !!_classPrivateFieldGet2?.isDirectory();
        _exit2 = true;
        return _await$_classPrivateF;
      });
    }
  }, function (_result2) {
    return _exit2 ? _result2 : pattern.hasSeenSymlinks;
  }) : false;
});
/**
 * @param {string} path
 * @returns {Promise<DirentFromStats|null>}
 */
var getDirent = _async(function (path) {
  var _exit = false;
  var stat;
  return _continue(_catch(function () {
    return _await(lstat(path), function (_lstat) {
      stat = _lstat;
    });
  }, function () {
    var _temp = null;
    _exit = true;
    return _temp;
  }), function (_result) {
    return _exit ? _result : new DirentFromStats(basename(path), stat, dirname(path));
  });
});
/**
 * @param {string} path
 * @returns {DirentFromStats|null}
 */
var {
  ArrayFrom,
  ArrayIsArray,
  ArrayPrototypeAt,
  ArrayPrototypeFlatMap,
  ArrayPrototypeMap,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypeSome,
  Promise,
  PromisePrototypeThen,
  SafeMap,
  SafeSet,
  StringPrototypeEndsWith
} = primordials;
var {
  lstatSync,
  readdirSync: _readdirSync,
  realpathSync: _realpathSync,
  statSync
} = require('fs');
var {
  lstat,
  readdir: _readdir,
  realpath: _realpath,
  stat
} = require('fs/promises');
var {
  join,
  resolve,
  basename,
  isAbsolute,
  dirname
} = require('path');
var {
  kEmptyObject,
  isWindows,
  isMacOS
} = require('internal/util');
var {
  validateBoolean,
  validateObject,
  validateString,
  validateStringArray
} = require('internal/validators');
var {
  DirentFromStats
} = require('internal/fs/utils');
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  },
  hideStackFrames
} = require('internal/errors');
var assert = require('internal/assert');
var {
  toPathIfFileURL
} = require('internal/url');
var minimatch;
function lazyMinimatch() {
  minimatch ??= require('internal/deps/minimatch/index');
  return minimatch;
}
function getDirentSync(path) {
  var stat;
  try {
    stat = lstatSync(path);
  } catch {
    return null;
  }
  return new DirentFromStats(basename(path), stat, dirname(path));
}

/**
 * @callback validateStringArrayOrFunction
 * @param {*} value
 * @param {string} name
 */
var validateStringArrayOrFunction = hideStackFrames((value, name) => {
  if (ArrayIsArray(value)) {
    for (var i = 0; i < value.length; ++i) {
      if (typeof value[i] !== 'string') {
        throw new ERR_INVALID_ARG_TYPE(`${name}[${i}]`, 'string', value[i]);
      }
    }
    return;
  }
  if (typeof value !== 'function') {
    throw new ERR_INVALID_ARG_TYPE(name, ['string[]', 'function'], value);
  }
});

/**
 * @param {string} pattern
 * @param {options} options
 * @returns {Minimatch}
 */
function createMatcher(pattern) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var opts = _objectSpread({
    __proto__: null,
    nocase: isWindows || isMacOS,
    windowsPathsNoEscape: true,
    nonegate: true,
    nocomment: true,
    optimizationLevel: 2,
    platform: process.platform,
    nocaseMagicOnly: true
  }, options);
  return new (lazyMinimatch().Minimatch)(pattern, opts);
}
function cloneSet(values) {
  var cloned = new SafeSet();
  for (var value of values) {
    cloned.add(value);
  }
  return cloned;
}
var _cache = /*#__PURE__*/new WeakMap();
var _statsCache = /*#__PURE__*/new WeakMap();
var _followStatsCache = /*#__PURE__*/new WeakMap();
var _readdirCache = /*#__PURE__*/new WeakMap();
var _realpathCache = /*#__PURE__*/new WeakMap();
var Cache = /*#__PURE__*/function () {
  function Cache() {
    _classCallCheck(this, Cache);
    _classPrivateFieldInitSpec(this, _cache, new SafeMap());
    _classPrivateFieldInitSpec(this, _statsCache, new SafeMap());
    _classPrivateFieldInitSpec(this, _followStatsCache, new SafeMap());
    _classPrivateFieldInitSpec(this, _readdirCache, new SafeMap());
    _classPrivateFieldInitSpec(this, _realpathCache, new SafeMap());
  }
  return _createClass(Cache, [{
    key: "stat",
    value: function stat(path) {
      var cached = _classPrivateFieldGet(_statsCache, this).get(path);
      if (cached) {
        return cached;
      }
      var promise = getDirent(path);
      _classPrivateFieldGet(_statsCache, this).set(path, promise);
      return promise;
    }
  }, {
    key: "statSync",
    value: function statSync(path) {
      var cached = _classPrivateFieldGet(_statsCache, this).get(path);
      // Do not return a promise from a sync function.
      if (cached && !(cached instanceof Promise)) {
        return cached;
      }
      var val = getDirentSync(path);
      _classPrivateFieldGet(_statsCache, this).set(path, val);
      return val;
    }
  }, {
    key: "followStat",
    value: function followStat(path) {
      var cached = _classPrivateFieldGet(_followStatsCache, this).get(path);
      if (cached) {
        return cached;
      }
      var promise = PromisePrototypeThen(stat(path), null, () => null);
      _classPrivateFieldGet(_followStatsCache, this).set(path, promise);
      return promise;
    }
  }, {
    key: "followStatSync",
    value: function followStatSync(path) {
      var cached = _classPrivateFieldGet(_followStatsCache, this).get(path);
      if (cached && !(cached instanceof Promise)) {
        return cached;
      }
      var val;
      try {
        val = statSync(path);
      } catch {
        val = null;
      }
      _classPrivateFieldGet(_followStatsCache, this).set(path, val);
      return val;
    }
  }, {
    key: "realpath",
    value: function realpath(path) {
      var cached = _classPrivateFieldGet(_realpathCache, this).get(path);
      if (cached) {
        return cached;
      }
      var promise = PromisePrototypeThen(_realpath(path), null, () => null);
      _classPrivateFieldGet(_realpathCache, this).set(path, promise);
      return promise;
    }
  }, {
    key: "realpathSync",
    value: function realpathSync(path) {
      var cached = _classPrivateFieldGet(_realpathCache, this).get(path);
      if (cached && !(cached instanceof Promise)) {
        return cached;
      }
      var val;
      try {
        val = _realpathSync(path);
      } catch {
        val = null;
      }
      _classPrivateFieldGet(_realpathCache, this).set(path, val);
      return val;
    }
  }, {
    key: "addToStatCache",
    value: function addToStatCache(path, val) {
      _classPrivateFieldGet(_statsCache, this).set(path, val);
    }
  }, {
    key: "readdir",
    value: function readdir(path) {
      try {
        var _this = this;
        var cached = _classPrivateFieldGet(_readdirCache, _this).get(path);
        if (cached) {
          return _await(cached);
        }
        var promise = PromisePrototypeThen(_readdir(path, {
          __proto__: null,
          withFileTypes: true
        }), null, () => []);
        _classPrivateFieldGet(_readdirCache, _this).set(path, promise);
        return _await(promise);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "readdirSync",
    value: function readdirSync(path) {
      var cached = _classPrivateFieldGet(_readdirCache, this).get(path);
      if (cached) {
        return cached;
      }
      var val;
      try {
        val = _readdirSync(path, {
          __proto__: null,
          withFileTypes: true
        });
      } catch {
        val = [];
      }
      _classPrivateFieldGet(_readdirCache, this).set(path, val);
      return val;
    }
  }, {
    key: "add",
    value: function add(path, pattern) {
      var cache = _classPrivateFieldGet(_cache, this).get(path);
      if (!cache) {
        cache = new SafeSet();
        _classPrivateFieldGet(_cache, this).set(path, cache);
      }
      var originalSize = cache.size;
      pattern.indexes.forEach(index => cache.add(pattern.cacheKey(index)));
      return cache.size !== originalSize + pattern.indexes.size;
    }
  }, {
    key: "seen",
    value: function seen(path, pattern, index) {
      return _classPrivateFieldGet(_cache, this).get(path)?.has(pattern.cacheKey(index));
    }
  }]);
}();
var _pattern = /*#__PURE__*/new WeakMap();
var _globStrings = /*#__PURE__*/new WeakMap();
var Pattern = /*#__PURE__*/function () {
  function Pattern(pattern, globStrings, indexes, symlinks) {
    var realpaths = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new SafeSet();
    _classCallCheck(this, Pattern);
    _classPrivateFieldInitSpec(this, _pattern, void 0);
    _classPrivateFieldInitSpec(this, _globStrings, void 0);
    _defineProperty(this, "indexes", void 0);
    _defineProperty(this, "symlinks", void 0);
    _defineProperty(this, "realpaths", void 0);
    _defineProperty(this, "last", void 0);
    _classPrivateFieldSet(_pattern, this, pattern);
    _classPrivateFieldSet(_globStrings, this, globStrings);
    this.indexes = indexes;
    this.symlinks = symlinks;
    this.realpaths = realpaths;
    this.last = pattern.length - 1;
  }
  return _createClass(Pattern, [{
    key: "isLast",
    value: function isLast(isDirectory) {
      return this.indexes.has(this.last) || this.at(-1) === '' && isDirectory && this.indexes.has(this.last - 1) && this.at(-2) === lazyMinimatch().GLOBSTAR;
    }
  }, {
    key: "isFirst",
    value: function isFirst() {
      return this.indexes.has(0);
    }
  }, {
    key: "hasSeenSymlinks",
    get: function () {
      return ArrayPrototypeSome(ArrayFrom(this.indexes), i => !this.symlinks.has(i));
    }
  }, {
    key: "at",
    value: function at(index) {
      return ArrayPrototypeAt(_classPrivateFieldGet(_pattern, this), index);
    }
  }, {
    key: "child",
    value: function child(indexes) {
      var symlinks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new SafeSet();
      var realpaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.realpaths;
      return new Pattern(_classPrivateFieldGet(_pattern, this), _classPrivateFieldGet(_globStrings, this), indexes, symlinks, realpaths);
    }
  }, {
    key: "test",
    value: function test(index, path) {
      if (index > _classPrivateFieldGet(_pattern, this).length) {
        return false;
      }
      var pattern = _classPrivateFieldGet(_pattern, this)[index];
      if (pattern === lazyMinimatch().GLOBSTAR) {
        return true;
      }
      if (typeof pattern === 'string') {
        return pattern === path;
      }
      if (typeof pattern?.test === 'function') {
        return pattern.test(path);
      }
      return false;
    }
  }, {
    key: "cacheKey",
    value: function cacheKey(index) {
      var key = '';
      for (var i = index; i < _classPrivateFieldGet(_globStrings, this).length; i++) {
        key += _classPrivateFieldGet(_globStrings, this)[i];
        if (i !== _classPrivateFieldGet(_globStrings, this).length - 1) {
          key += '/';
        }
      }
      return key;
    }
  }]);
}();
var _root = /*#__PURE__*/new WeakMap();
var _isExcluded = /*#__PURE__*/new WeakMap();
var ResultSet = /*#__PURE__*/function (_SafeSet) {
  function ResultSet() {
    var _this2;
    _classCallCheck(this, ResultSet);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this2 = _callSuper(this, ResultSet, [].concat(args));
    _classPrivateFieldInitSpec(_this2, _root, '.');
    _classPrivateFieldInitSpec(_this2, _isExcluded, () => false);
    return _this2;
  }
  _inherits(ResultSet, _SafeSet);
  return _createClass(ResultSet, [{
    key: "setup",
    value: function setup(root, isExcludedFn) {
      _classPrivateFieldSet(_root, this, root);
      _classPrivateFieldSet(_isExcluded, this, isExcludedFn);
    }
  }, {
    key: "add",
    value: function add(value) {
      if (_classPrivateFieldGet(_isExcluded, this).call(this, resolve(_classPrivateFieldGet(_root, this), value))) {
        return false;
      }
      _superPropGet(ResultSet, "add", this, 3)([value]);
      return true;
    }
  }]);
}(SafeSet);
var _root2 = /*#__PURE__*/new WeakMap();
var _exclude = /*#__PURE__*/new WeakMap();
var _cache2 = /*#__PURE__*/new WeakMap();
var _results = /*#__PURE__*/new WeakMap();
var _queue = /*#__PURE__*/new WeakMap();
var _subpatterns = /*#__PURE__*/new WeakMap();
var _patterns = /*#__PURE__*/new WeakMap();
var _withFileTypes = /*#__PURE__*/new WeakMap();
var _followSymlinks = /*#__PURE__*/new WeakMap();
var _isExcluded2 = /*#__PURE__*/new WeakMap();
var _Glob_brand = /*#__PURE__*/new WeakSet();
var Glob = /*#__PURE__*/function () {
  function Glob(_pattern2) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, Glob);
    _classPrivateMethodInitSpec(this, _Glob_brand);
    _classPrivateFieldInitSpec(this, _root2, void 0);
    _classPrivateFieldInitSpec(this, _exclude, void 0);
    _classPrivateFieldInitSpec(this, _cache2, new Cache());
    _classPrivateFieldInitSpec(this, _results, new ResultSet());
    _classPrivateFieldInitSpec(this, _queue, []);
    _classPrivateFieldInitSpec(this, _subpatterns, new SafeMap());
    _classPrivateFieldInitSpec(this, _patterns, void 0);
    _classPrivateFieldInitSpec(this, _withFileTypes, void 0);
    _classPrivateFieldInitSpec(this, _followSymlinks, false);
    _classPrivateFieldInitSpec(this, _isExcluded2, () => false);
    validateObject(options, 'options');
    var {
      exclude,
      cwd,
      followSymlinks,
      withFileTypes
    } = options;
    _classPrivateFieldSet(_root2, this, toPathIfFileURL(cwd) ?? '.');
    if (followSymlinks != null) {
      validateBoolean(followSymlinks, 'options.followSymlinks');
      _classPrivateFieldSet(_followSymlinks, this, followSymlinks);
    }
    _classPrivateFieldSet(_withFileTypes, this, !!withFileTypes);
    if (exclude != null) {
      validateStringArrayOrFunction(exclude, 'options.exclude');
      if (ArrayIsArray(exclude)) {
        assert(typeof _classPrivateFieldGet(_root2, this) === 'string');
        // Convert the path part of exclude patterns to absolute paths for
        // consistent comparison before instantiating matchers.
        var matchers = exclude.map(pattern => resolve(_classPrivateFieldGet(_root2, this), pattern)).map(pattern => createMatcher(pattern));
        _classPrivateFieldSet(_isExcluded2, this, value => matchers.some(matcher => matcher.match(value)));
        _classPrivateFieldGet(_results, this).setup(_classPrivateFieldGet(_root2, this), _classPrivateFieldGet(_isExcluded2, this));
      } else {
        _classPrivateFieldSet(_exclude, this, exclude);
      }
    }
    var patterns;
    if (typeof _pattern2 === 'object') {
      validateStringArray(_pattern2, 'patterns');
      patterns = _pattern2;
    } else {
      validateString(_pattern2, 'patterns');
      patterns = [_pattern2];
    }
    this.matchers = ArrayPrototypeMap(patterns, pattern => createMatcher(pattern));
    _classPrivateFieldSet(_patterns, this, ArrayPrototypeFlatMap(this.matchers, matcher => ArrayPrototypeMap(matcher.set, (pattern, i) => new Pattern(pattern, matcher.globParts[i], new SafeSet().add(0), new SafeSet()))));
  }
  return _createClass(Glob, [{
    key: "globSync",
    value: function globSync() {
      ArrayPrototypePush(_classPrivateFieldGet(_queue, this), {
        __proto__: null,
        path: '.',
        patterns: _classPrivateFieldGet(_patterns, this)
      });
      while (_classPrivateFieldGet(_queue, this).length > 0) {
        var item = ArrayPrototypePop(_classPrivateFieldGet(_queue, this));
        for (var i = 0; i < item.patterns.length; i++) {
          _assertClassBrand(_Glob_brand, this, _addSubpatterns).call(this, item.path, item.patterns[i]);
        }
        _classPrivateFieldGet(_subpatterns, this).forEach((patterns, path) => ArrayPrototypePush(_classPrivateFieldGet(_queue, this), {
          __proto__: null,
          path,
          patterns
        }));
        _classPrivateFieldGet(_subpatterns, this).clear();
      }
      return ArrayFrom(_classPrivateFieldGet(_results, this), _classPrivateFieldGet(_withFileTypes, this) ? path => _classPrivateFieldGet(_cache2, this).statSync(isAbsolute(path) ? path : join(_classPrivateFieldGet(_root2, this), path)) : undefined);
    }
  }, {
    key: "glob",
    value: function glob() {
      return new _AsyncGenerator(function (_generator) {
        var _this3 = this;
        ArrayPrototypePush(_classPrivateFieldGet(_queue, _this3), {
          __proto__: null,
          path: '.',
          patterns: _classPrivateFieldGet(_patterns, _this3)
        });
        return _continueIgnored(_for(function () {
          return _classPrivateFieldGet(_queue, _this3).length > 0;
        }, void 0, function () {
          var item = ArrayPrototypePop(_classPrivateFieldGet(_queue, _this3));
          var i = 0;
          return _continue(_for(function () {
            return i < item.patterns.length;
          }, function () {
            return i++;
          }, function () {
            return _generator._yield(_assertClassBrand(_Glob_brand, _this3, _iterateSubpatterns).call(_this3, item.path, item.patterns[i])).then(_empty);
          }), function () {
            _classPrivateFieldGet(_subpatterns, _this3).forEach((patterns, path) => ArrayPrototypePush(_classPrivateFieldGet(_queue, _this3), {
              __proto__: null,
              path,
              patterns
            }));
            _classPrivateFieldGet(_subpatterns, _this3).clear();
          });
        }));
      });
    }
  }]);
}();
/**
 * Check if a path matches a glob pattern
 * @param {string} path the path to check
 * @param {string} pattern the glob pattern to match
 * @param {boolean} windows whether the path is on a Windows system, defaults to `isWindows`
 * @returns {boolean}
 */
function _isDirectorySync(path, stat, pattern) {
  if (stat?.isDirectory()) {
    return true;
  }
  if (!stat?.isSymbolicLink()) {
    return false;
  }
  if (_classPrivateFieldGet(_followSymlinks, this)) {
    return !!_classPrivateFieldGet(_cache2, this).followStatSync(path)?.isDirectory();
  }
  return pattern.hasSeenSymlinks;
}
function _nextRealpathsSync(path, isDirectory, pattern) {
  if (!_classPrivateFieldGet(_followSymlinks, this) || !isDirectory) {
    return pattern.realpaths;
  }
  var real = _classPrivateFieldGet(_cache2, this).realpathSync(path);
  if (real === null) {
    return pattern.realpaths;
  }
  var realpaths = cloneSet(pattern.realpaths);
  realpaths.add(real);
  return realpaths;
}
function _isCyclicSync(path, isDirectory, pattern) {
  if (!_classPrivateFieldGet(_followSymlinks, this) || !isDirectory) {
    return false;
  }
  var real = _classPrivateFieldGet(_cache2, this).realpathSync(path);
  return real !== null && pattern.realpaths.has(real);
}
function _addSubpattern(path, pattern) {
  if (_classPrivateFieldGet(_isExcluded2, this).call(this, path)) {
    return;
  }
  var fullpath = resolve(_classPrivateFieldGet(_root2, this), path);

  // If path is a directory, add trailing slash and test patterns again.
  if (_classPrivateFieldGet(_isExcluded2, this).call(this, `${fullpath}/`) && _classPrivateFieldGet(_cache2, this).statSync(fullpath).isDirectory()) {
    return;
  }
  if (_classPrivateFieldGet(_exclude, this)) {
    if (_classPrivateFieldGet(_withFileTypes, this)) {
      var _stat = _classPrivateFieldGet(_cache2, this).statSync(path);
      if (_stat !== null) {
        if (_classPrivateFieldGet(_exclude, this).call(this, _stat)) {
          return;
        }
      }
    } else if (_classPrivateFieldGet(_exclude, this).call(this, path)) {
      return;
    }
  }
  if (!_classPrivateFieldGet(_subpatterns, this).has(path)) {
    _classPrivateFieldGet(_subpatterns, this).set(path, [pattern]);
  } else {
    ArrayPrototypePush(_classPrivateFieldGet(_subpatterns, this).get(path), pattern);
  }
}
function _addSubpatterns(path, pattern) {
  var seen = _classPrivateFieldGet(_cache2, this).add(path, pattern);
  if (seen) {
    return;
  }
  var fullpath = resolve(_classPrivateFieldGet(_root2, this), path);
  var stat = _classPrivateFieldGet(_cache2, this).statSync(fullpath);
  var last = pattern.last;
  var isDirectory = _assertClassBrand(_Glob_brand, this, _isDirectorySync).call(this, fullpath, stat, pattern);
  var isLast = pattern.isLast(isDirectory);
  var isFirst = pattern.isFirst();
  if (_classPrivateFieldGet(_isExcluded2, this).call(this, fullpath)) {
    return;
  }
  if (isFirst && isWindows && typeof pattern.at(0) === 'string' && StringPrototypeEndsWith(pattern.at(0), ':')) {
    // Absolute path, go to root
    _assertClassBrand(_Glob_brand, this, _addSubpattern).call(this, `${pattern.at(0)}\\`, pattern.child(new SafeSet().add(1)));
    return;
  }
  if (isFirst && pattern.at(0) === '') {
    // Absolute path, go to root
    _assertClassBrand(_Glob_brand, this, _addSubpattern).call(this, '/', pattern.child(new SafeSet().add(1)));
    return;
  }
  if (isFirst && pattern.at(0) === '..') {
    // Start with .., go to parent
    _assertClassBrand(_Glob_brand, this, _addSubpattern).call(this, '../', pattern.child(new SafeSet().add(1)));
    return;
  }
  if (isFirst && pattern.at(0) === '.') {
    // Start with ., proceed
    _assertClassBrand(_Glob_brand, this, _addSubpattern).call(this, '.', pattern.child(new SafeSet().add(1)));
    return;
  }
  if (isLast && typeof pattern.at(-1) === 'string') {
    // Add result if it exists
    var p = pattern.at(-1);
    var _stat2 = _classPrivateFieldGet(_cache2, this).statSync(join(fullpath, p));
    if (_stat2 && (p || isDirectory)) {
      _classPrivateFieldGet(_results, this).add(join(path, p));
    }
    if (pattern.indexes.size === 1 && pattern.indexes.has(last)) {
      return;
    }
  } else if (isLast && pattern.at(-1) === lazyMinimatch().GLOBSTAR && (path !== '.' || pattern.at(0) === '.' || last === 0 && stat)) {
    // If pattern ends with **, add to results
    // if path is ".", add it only if pattern starts with "." or pattern is exactly "**"
    _classPrivateFieldGet(_results, this).add(path);
  }
  if (!isDirectory || _assertClassBrand(_Glob_brand, this, _isCyclicSync).call(this, fullpath, isDirectory, pattern)) {
    return;
  }
  var nextRealpaths = _assertClassBrand(_Glob_brand, this, _nextRealpathsSync).call(this, fullpath, isDirectory, pattern);
  var children;
  var firstPattern = pattern.indexes.size === 1 && pattern.at(pattern.indexes.values().next().value);
  if (typeof firstPattern === 'string') {
    var _stat3 = _classPrivateFieldGet(_cache2, this).statSync(join(fullpath, firstPattern));
    if (_stat3) {
      _stat3.name = firstPattern;
      children = [_stat3];
    } else {
      return;
    }
  } else {
    children = _classPrivateFieldGet(_cache2, this).readdirSync(fullpath);
  }
  for (var _i = 0; _i < children.length; _i++) {
    var entry = children[_i];
    var entryPath = join(path, entry.name);
    var entryFullpath = join(fullpath, entry.name);
    _classPrivateFieldGet(_cache2, this).addToStatCache(entryFullpath, entry);
    var entryIsDirectory = entry.isDirectory() || _classPrivateFieldGet(_followSymlinks, this) && entry.isSymbolicLink() && !!_classPrivateFieldGet(_cache2, this).followStatSync(entryFullpath)?.isDirectory();
    var subPatterns = new SafeSet();
    var nSymlinks = new SafeSet();
    for (var index of pattern.indexes) {
      // For each child, check potential patterns
      if (_classPrivateFieldGet(_cache2, this).seen(entryPath, pattern, index) || _classPrivateFieldGet(_cache2, this).seen(entryPath, pattern, index + 1)) {
        return;
      }
      var current = pattern.at(index);
      var nextIndex = index + 1;
      var next = pattern.at(nextIndex);
      var fromSymlink = !_classPrivateFieldGet(_followSymlinks, this) && pattern.symlinks.has(index);
      if (current === lazyMinimatch().GLOBSTAR) {
        var isDot = entry.name[0] === '.';
        var nextMatches = pattern.test(nextIndex, entry.name);
        var nextNonGlobIndex = nextIndex;
        while (pattern.at(nextNonGlobIndex) === lazyMinimatch().GLOBSTAR) {
          nextNonGlobIndex++;
        }
        var matchesDot = isDot && pattern.test(nextNonGlobIndex, entry.name);
        if (isDot && !matchesDot || _classPrivateFieldGet(_exclude, this) && _classPrivateFieldGet(_exclude, this).call(this, _classPrivateFieldGet(_withFileTypes, this) ? entry : entry.name)) {
          continue;
        }
        if (!fromSymlink && entryIsDirectory) {
          // If directory, add ** to its potential patterns
          subPatterns.add(index);
        } else if (!fromSymlink && index === last) {
          // If ** is last, add to results
          _classPrivateFieldGet(_results, this).add(entryPath);
        }

        // Any pattern after ** is also a potential pattern
        // so we can already test it here
        if (nextMatches && nextIndex === last && !isLast) {
          // If next pattern is the last one, add to results
          _classPrivateFieldGet(_results, this).add(entryPath);
        } else if (nextMatches && entryIsDirectory) {
          // Pattern matched, meaning two patterns forward
          // are also potential patterns
          // e.g **/b/c when entry is a/b - add c to potential patterns
          subPatterns.add(index + 2);
        }
        if ((nextMatches || pattern.at(0) === '.') && (entryIsDirectory || entry.isSymbolicLink()) && !fromSymlink) {
          // If pattern after ** matches, or pattern starts with "."
          // and entry is a directory or symlink, add to potential patterns
          subPatterns.add(nextIndex);
        }
        if (!_classPrivateFieldGet(_followSymlinks, this) && entry.isSymbolicLink()) {
          nSymlinks.add(index);
        }
        if (next === '..' && entryIsDirectory) {
          // In case pattern is "**/..",
          // both parent and current directory should be added to the queue
          // if this is the last pattern, add to results instead
          var parent = join(path, '..');
          if (nextIndex < last) {
            if (!_classPrivateFieldGet(_subpatterns, this).has(path) && !_classPrivateFieldGet(_cache2, this).seen(path, pattern, nextIndex + 1)) {
              _classPrivateFieldGet(_subpatterns, this).set(path, [pattern.child(new SafeSet().add(nextIndex + 1))]);
            }
            if (!_classPrivateFieldGet(_subpatterns, this).has(parent) && !_classPrivateFieldGet(_cache2, this).seen(parent, pattern, nextIndex + 1)) {
              _classPrivateFieldGet(_subpatterns, this).set(parent, [pattern.child(new SafeSet().add(nextIndex + 1))]);
            }
          } else {
            if (!_classPrivateFieldGet(_cache2, this).seen(path, pattern, nextIndex)) {
              _classPrivateFieldGet(_cache2, this).add(path, pattern.child(new SafeSet().add(nextIndex)));
              _classPrivateFieldGet(_results, this).add(path);
            }
            if (!_classPrivateFieldGet(_cache2, this).seen(path, pattern, nextIndex) || !_classPrivateFieldGet(_cache2, this).seen(parent, pattern, nextIndex)) {
              _classPrivateFieldGet(_cache2, this).add(parent, pattern.child(new SafeSet().add(nextIndex)));
              _classPrivateFieldGet(_results, this).add(parent);
            }
          }
        }
      }
      if (typeof current === 'string') {
        if (pattern.test(index, entry.name) && index !== last) {
          // If current pattern matches entry name
          // the next pattern is a potential pattern
          subPatterns.add(nextIndex);
        } else if (current === '.' && pattern.test(nextIndex, entry.name)) {
          // If current pattern is ".", proceed to test next pattern
          if (nextIndex === last) {
            _classPrivateFieldGet(_results, this).add(entryPath);
          } else {
            subPatterns.add(nextIndex + 1);
          }
        }
      }
      if (typeof current === 'object' && pattern.test(index, entry.name)) {
        // If current pattern is a regex that matches entry name (e.g *.js)
        // add next pattern to potential patterns, or to results if it's the last pattern
        if (index === last) {
          _classPrivateFieldGet(_results, this).add(entryPath);
        } else if (entryIsDirectory) {
          subPatterns.add(nextIndex);
        }
      }
    }
    if (subPatterns.size > 0) {
      // If there are potential patterns, add to queue
      _assertClassBrand(_Glob_brand, this, _addSubpattern).call(this, entryPath, pattern.child(subPatterns, nSymlinks, nextRealpaths));
    }
  }
}
function matchGlobPattern(path, pattern) {
  var windows = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : isWindows;
  validateString(path, 'path');
  validateString(pattern, 'pattern');
  return lazyMinimatch().minimatch(path, pattern, {
    kEmptyObject,
    nocase: isMacOS || isWindows,
    windowsPathsNoEscape: true,
    nonegate: true,
    nocomment: true,
    optimizationLevel: 2,
    platform: windows ? 'win32' : 'posix',
    nocaseMagicOnly: true
  });
}
module.exports = {
  __proto__: null,
  Glob,
  matchGlobPattern
};

