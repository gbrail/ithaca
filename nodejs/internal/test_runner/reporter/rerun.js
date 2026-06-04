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
  ArrayPrototypeMap,
  ArrayPrototypePush,
  JSONStringify
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
  relative
} = require('path');
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
  writeFileSync
} = require('fs');
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
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
function reportReruns(previousRuns, globalOptions) {
  return function reporter(source) {
    try {
      var obj = {
        __proto__: null
      };
      var disambiguator = {
        __proto__: null
      };
      var currentSuite = null;
      function getTestId(data) {
        return `${relative(globalOptions.cwd, data.file)}:${data.line}:${data.column}`;
      }
      function startTest(data) {
        var originalSuite = currentSuite;
        currentSuite = {
          __proto__: null,
          data,
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
      return _await(_continue(_forAwaitOf(source, function (_ref) {
        var {
          type,
          data
        } = _ref;
        var currentTest;
        if (type === 'test:start') {
          startTest(data);
        } else if (type === 'test:fail' || type === 'test:pass') {
          if (!currentSuite) {
            startTest({
              __proto__: null,
              name: 'root',
              nesting: 0
            });
          }
          if (currentSuite.data.name !== data.name || currentSuite.data.nesting !== data.nesting) {
            startTest(data);
          }
          currentTest = currentSuite;
          if (currentSuite?.data.nesting === data.nesting) {
            currentSuite = currentSuite.parent;
          }
        }
        if (type === 'test:pass' || type === 'test:fail') {
          var baseIdentifier = getTestId(data);
          var identifier = baseIdentifier;
          if (disambiguator[baseIdentifier] !== undefined) {
            identifier += `:(${disambiguator[baseIdentifier]})`;
            disambiguator[baseIdentifier] += 1;
          } else {
            disambiguator[baseIdentifier] = 1;
          }
          if (type === 'test:pass') {
            var children = ArrayPrototypeMap(currentTest.children, child => child.data);
            obj[identifier] = {
              __proto__: null,
              name: data.name,
              children,
              passed_on_attempt: data.details.passed_on_attempt ?? data.details.attempt,
              duration_ms: data.details.duration_ms
            };
          }
        }
      }), function () {
        ArrayPrototypePush(previousRuns, obj);
        writeFileSync(globalOptions.rerunFailuresFilePath, JSONStringify(previousRuns, null, 2), 'utf8');
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
;
module.exports = {
  __proto__: null,
  reportReruns
};

