'use strict';

var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator";
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
  }(),
  _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
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
  ArrayPrototypeFilter,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypeSome,
  NumberPrototypeToFixed,
  ObjectEntries,
  RegExpPrototypeSymbolReplace,
  String,
  StringPrototypeRepeat
} = primordials;
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
  inspectWithNoCustomRetry
} = require('internal/errors');
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
var {
  hostname
} = require('os');
function _empty() {}
var inspectOptions = {
  __proto__: null,
  colors: false,
  breakLength: Infinity
};
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
var HOSTNAME = hostname();
const _earlyReturn = /*#__PURE__*/{},
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
function escapeAttribute() {
  var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return escapeContent(RegExpPrototypeSymbolReplace(/"/g, RegExpPrototypeSymbolReplace(/\n/g, s, '&#10;'), '&quot;'));
}
function escapeContent() {
  var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return RegExpPrototypeSymbolReplace(/</g, RegExpPrototypeSymbolReplace(/(&)(?!#\d{1,7};)/g, s, '&amp;'), '&lt;');
}
function escapeComment() {
  var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return RegExpPrototypeSymbolReplace(/--/g, s, '&#45;&#45;');
}
function treeToXML(tree) {
  if (typeof tree === 'string') {
    return `${escapeContent(tree)}\n`;
  }
  var {
    tag,
    attrs,
    nesting,
    children,
    comment
  } = tree;
  var indent = StringPrototypeRepeat('\t', nesting + 1);
  if (comment) {
    return `${indent}<!-- ${escapeComment(comment)} -->\n`;
  }
  var attrsString = ArrayPrototypeJoin(ArrayPrototypeMap(ObjectEntries(attrs), _ref => {
    var {
      0: key,
      1: value
    } = _ref;
    return `${key}="${escapeAttribute(String(value))}"`;
  }), ' ');
  if (!children?.length) {
    return `${indent}<${tag} ${attrsString}/>\n`;
  }
  var childrenString = ArrayPrototypeJoin(ArrayPrototypeMap(children ?? [], treeToXML), '');
  return `${indent}<${tag} ${attrsString}>\n${childrenString}${indent}</${tag}>\n`;
}
function isFailure(node) {
  return node?.children && ArrayPrototypeSome(node.children, c => c.tag === 'failure') || node?.attrs?.failures;
}
function isSkipped(node) {
  return node?.children && ArrayPrototypeSome(node.children, c => c.tag === 'skipped') || node?.attrs?.skipped;
}
module.exports = function junitReporter(source) {
  return new _AsyncGenerator(function (_generator) {
    return _generator._yield('<?xml version="1.0" encoding="utf-8"?>\n').then(function () {
      return _generator._yield('<testsuites>\n').then(function () {
        var currentSuite = null;
        function startTest(event) {
          var originalSuite = currentSuite;
          currentSuite = {
            __proto__: null,
            attrs: {
              __proto__: null,
              name: event.data.name
            },
            nesting: event.data.nesting,
            parent: currentSuite,
            children: []
          };
          if (originalSuite?.children) {
            ArrayPrototypePush(originalSuite.children, currentSuite);
          }
          if (!currentSuite.parent) {
            ArrayPrototypePush(roots, currentSuite);
          }
        }
        var roots = [];
        return _continue(_forAwaitOf(source, function (event) {
          switch (event.type) {
            case 'test:start':
              {
                startTest(event);
                break;
              }
            case 'test:pass':
            case 'test:fail':
              {
                if (!currentSuite) {
                  startTest({
                    __proto__: null,
                    data: {
                      __proto__: null,
                      name: 'root',
                      nesting: 0
                    }
                  });
                }
                if (currentSuite.attrs.name !== event.data.name || currentSuite.nesting !== event.data.nesting) {
                  startTest(event);
                }
                var currentTest = currentSuite;
                if (currentSuite?.nesting === event.data.nesting) {
                  currentSuite = currentSuite.parent;
                }
                currentTest.attrs.time = NumberPrototypeToFixed(event.data.details.duration_ms / 1000, 6);
                var nonCommentChildren = ArrayPrototypeFilter(currentTest.children, c => c.comment == null);
                if (nonCommentChildren.length > 0) {
                  currentTest.tag = 'testsuite';
                  currentTest.attrs.disabled = 0;
                  currentTest.attrs.errors = 0;
                  currentTest.attrs.tests = nonCommentChildren.length;
                  currentTest.attrs.failures = ArrayPrototypeFilter(currentTest.children, isFailure).length;
                  currentTest.attrs.skipped = ArrayPrototypeFilter(currentTest.children, isSkipped).length;
                  currentTest.attrs.hostname = HOSTNAME;
                } else {
                  currentTest.tag = 'testcase';
                  currentTest.attrs.classname = event.data.classname ?? 'test';
                  if (event.data.file) {
                    currentTest.attrs.file = event.data.file;
                  }
                  if (event.data.skip) {
                    ArrayPrototypePush(currentTest.children, {
                      __proto__: null,
                      nesting: event.data.nesting + 1,
                      tag: 'skipped',
                      attrs: {
                        __proto__: null,
                        type: 'skipped',
                        message: event.data.skip
                      }
                    });
                  }
                  if (event.data.todo) {
                    ArrayPrototypePush(currentTest.children, {
                      __proto__: null,
                      nesting: event.data.nesting + 1,
                      tag: 'skipped',
                      attrs: {
                        __proto__: null,
                        type: 'todo',
                        message: event.data.todo
                      }
                    });
                  }
                  if (event.type === 'test:fail') {
                    var error = event.data.details?.error;
                    currentTest.children.push({
                      __proto__: null,
                      nesting: event.data.nesting + 1,
                      tag: 'failure',
                      attrs: {
                        __proto__: null,
                        type: error?.failureType || error?.code,
                        message: error?.message.trim() ?? ''
                      },
                      children: [inspectWithNoCustomRetry(error, inspectOptions)]
                    });
                    currentTest.failures = 1;
                    currentTest.attrs.failure = error?.message ?? '';
                  }
                }
                break;
              }
            case 'test:diagnostic':
              {
                var parent = currentSuite?.children ?? roots;
                ArrayPrototypePush(parent, {
                  __proto__: null,
                  nesting: event.data.nesting,
                  comment: event.data.message
                });
                break;
              }
            default:
              break;
          }
        }), function () {
          return _continue(_forOf(roots, function (suite) {
            return _generator._yield(treeToXML(suite)).then(_empty);
          }), function () {
            return _generator._yield('</testsuites>\n').then(_empty);
          });
        });
      });
    });
  });
};

