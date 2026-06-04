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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Array,
  ArrayFrom,
  ArrayPrototypeFilter,
  ArrayPrototypeFind,
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  ArrayPrototypeSplice,
  Date,
  FunctionPrototypeCall,
  JSONStringify,
  MathMax,
  ObjectAssign,
  ObjectDefineProperty,
  ObjectKeys,
  ObjectValues,
  Promise,
  PromisePrototypeThen,
  PromiseResolve,
  ReflectGetOwnPropertyDescriptor,
  ReflectOwnKeys,
  RegExpPrototypeExec,
  SafeMap,
  SafePromiseAllReturnArrayLike,
  SafePromiseAllReturnVoid,
  String: _String,
  StringFromCharCode,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  StringPrototypeRepeat,
  StringPrototypeReplaceAll,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  StringPrototypeToUpperCase,
  StringPrototypeTrim
} = primordials;
var {
  ERR_DEBUGGER_ERROR
} = require('internal/errors').codes;
var {
  validateString,
  validateNumber
} = require('internal/validators');
var FS = require('fs');
var Path = require('path');
var Repl = require('repl');
var vm = require('vm');
var {
  fileURLToPath
} = require('internal/url');
var {
  customInspectSymbol,
  SideEffectFreeRegExpPrototypeSymbolReplace
} = require('internal/util');
var {
  inspect: utilInspect
} = require('internal/util/inspect');
var {
  isObjectLiteral
} = require('internal/repl/utils');
var debuglog = require('internal/util/debuglog').debuglog('inspect');
var SHORTCUTS = {
  cont: 'c',
  next: 'n',
  step: 's',
  out: 'o',
  backtrace: 'bt',
  setBreakpoint: 'sb',
  clearBreakpoint: 'cb',
  run: 'r',
  exec: 'p'
};
var HELP = StringPrototypeTrim(`
run, restart, r       Run the application or reconnect
kill                  Kill a running application or disconnect

cont, c               Resume execution
next, n               Continue to next line in current file
step, s               Step into, potentially entering a function
out, o                Step out, leaving the current function
backtrace, bt         Print the current backtrace
list                  Print the source around the current line where execution
                      is currently paused
setContextLineNumber  Set which lines to check for context
setBreakpoint, sb     Set a breakpoint
clearBreakpoint, cb   Clear a breakpoint
breakpoints           List all known breakpoints
breakOnException      Pause execution whenever an exception is thrown
breakOnUncaught       Pause execution whenever an exception isn't caught
breakOnNone           Don't pause on exceptions (this is the default)

watch(expr)           Start watching the given expression
unwatch(expr)         Stop watching an expression
unwatch(index)        Stop watching an expression at specific index from watch list
watchers              Print all watched expressions and their current values

exec(expr), p(expr), exec expr, p expr
                      Evaluate the expression and print the value
repl                  Enter a debug repl that works like exec

scripts               List application scripts that are currently loaded
scripts(true)         List all scripts (including node-internals)

profile               Start CPU profiling session.
profileEnd            Stop current CPU profiling session.
profiles              Array of completed CPU profiling sessions.
profiles[n].save(filepath = 'node.cpuprofile')
                      Save CPU profiling session to disk as JSON.

takeHeapSnapshot(filepath = 'node.heapsnapshot')
                      Take a heap snapshot and save to disk as JSON.
`);
var FUNCTION_NAME_PATTERN = /^(?:function\*? )?([^(\s]+)\(/;
function extractFunctionName(description) {
  var fnNameMatch = RegExpPrototypeExec(FUNCTION_NAME_PATTERN, description);
  return fnNameMatch ? `: ${fnNameMatch[1]}` : '';
}
var {
  builtinIds
} = internalBinding('builtins');
function isNativeUrl(url) {
  url = SideEffectFreeRegExpPrototypeSymbolReplace(/\.js$/, url, '');
  return StringPrototypeStartsWith(url, 'node:internal/') || ArrayPrototypeIncludes(builtinIds, url);
}
function getRelativePath(filenameOrURL) {
  var dir = StringPrototypeSlice(Path.join(Path.resolve(), 'x'), 0, -1);
  var filename = StringPrototypeStartsWith(filenameOrURL, 'file://') ? fileURLToPath(filenameOrURL) : filenameOrURL;

  // Change path to relative, if possible
  if (StringPrototypeStartsWith(filename, dir)) {
    return StringPrototypeSlice(filename, dir.length);
  }
  return filename;
}

// Adds spaces and prefix to number
// maxN is a maximum number we should have space for
function leftPad(n, prefix, maxN) {
  var s = n.toString();
  var nchars = MathMax(2, _String(maxN).length);
  var nspaces = nchars - s.length;
  return prefix + StringPrototypeRepeat(' ', nspaces) + s;
}
function markSourceColumn(sourceText, position, useColors) {
  if (!sourceText) return '';
  var head = StringPrototypeSlice(sourceText, 0, position);
  var tail = StringPrototypeSlice(sourceText, position);

  // Colourize char if stdout supports colours
  if (useColors) {
    tail = SideEffectFreeRegExpPrototypeSymbolReplace(/(.+?)([^\w]|$)/, tail, '\u001b[32m$1\u001b[39m$2');
  }

  // Return source line with coloured char at `position`
  return head + tail;
}
function extractErrorMessage(stack) {
  if (!stack) return '<unknown>';
  var m = RegExpPrototypeExec(/^\w+: ([^\n]+)/, stack);
  return m?.[1] ?? stack;
}
function convertResultToError(result) {
  var {
    className,
    description
  } = result;
  var err = new ERR_DEBUGGER_ERROR(extractErrorMessage(description));
  err.stack = description;
  ObjectDefineProperty(err, 'name', {
    __proto__: null,
    value: className
  });
  return err;
}
var PropertyPreview = /*#__PURE__*/function () {
  function PropertyPreview(attributes) {
    _classCallCheck(this, PropertyPreview);
    ObjectAssign(this, attributes);
  }
  return _createClass(PropertyPreview, [{
    key: customInspectSymbol,
    value: function (depth, opts) {
      switch (this.type) {
        case 'string':
        case 'undefined':
          return utilInspect(this.value, opts);
        case 'number':
        case 'boolean':
          return opts.stylize(this.value, this.type);
        case 'object':
        case 'symbol':
          if (this.subtype === 'date') {
            return utilInspect(new Date(this.value), opts);
          }
          if (this.subtype === 'array') {
            return opts.stylize(this.value, 'special');
          }
          return opts.stylize(this.value, this.subtype || 'special');
        default:
          return this.value;
      }
    }
  }]);
}();
var ObjectPreview = /*#__PURE__*/function () {
  function ObjectPreview(attributes) {
    _classCallCheck(this, ObjectPreview);
    ObjectAssign(this, attributes);
  }
  return _createClass(ObjectPreview, [{
    key: customInspectSymbol,
    value: function (depth, opts) {
      switch (this.type) {
        case 'object':
          {
            switch (this.subtype) {
              case 'date':
                return utilInspect(new Date(this.description), opts);
              case 'null':
                return utilInspect(null, opts);
              case 'regexp':
                return opts.stylize(this.description, 'regexp');
              case 'set':
                {
                  if (!this.entries) {
                    return `${this.description} ${this.overflow ? '{ ... }' : '{}'}`;
                  }
                  var values = ArrayPrototypeMap(this.entries, entry => utilInspect(new ObjectPreview(entry.value), opts));
                  return `${this.description} { ${ArrayPrototypeJoin(values, ', ')} }`;
                }
              case 'map':
                {
                  if (!this.entries) {
                    return `${this.description} ${this.overflow ? '{ ... }' : '{}'}`;
                  }
                  var mappings = ArrayPrototypeMap(this.entries, entry => {
                    var key = utilInspect(new ObjectPreview(entry.key), opts);
                    var value = utilInspect(new ObjectPreview(entry.value), opts);
                    return `${key} => ${value}`;
                  });
                  return `${this.description} { ${ArrayPrototypeJoin(mappings, ', ')} }`;
                }
              case 'array':
              case undefined:
                {
                  if (this.properties.length === 0) {
                    return this.subtype === 'array' ? '[]' : '{}';
                  }
                  var props = ArrayPrototypeMap(this.properties, (prop, idx) => {
                    var value = utilInspect(new PropertyPreview(prop));
                    if (prop.name === `${idx}`) return value;
                    return `${prop.name}: ${value}`;
                  });
                  if (this.overflow) {
                    ArrayPrototypePush(props, '...');
                  }
                  var singleLine = ArrayPrototypeJoin(props, ', ');
                  var propString = singleLine.length > 60 ? ArrayPrototypeJoin(props, ',\n  ') : singleLine;
                  return this.subtype === 'array' ? `[ ${propString} ]` : `{ ${propString} }`;
                }
              default:
                return this.description;
            }
          }
        default:
          return this.description;
      }
    }
  }]);
}();
var RemoteObject = /*#__PURE__*/function () {
  function RemoteObject(attributes) {
    _classCallCheck(this, RemoteObject);
    ObjectAssign(this, attributes);
    if (this.type === 'number') {
      this.value = this.unserializableValue ? +this.unserializableValue : +this.value;
    }
  }
  return _createClass(RemoteObject, [{
    key: customInspectSymbol,
    value: function (depth, opts) {
      switch (this.type) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'undefined':
          return utilInspect(this.value, opts);
        case 'symbol':
          return opts.stylize(this.description, 'special');
        case 'function':
          {
            var fnName = extractFunctionName(this.description);
            var formatted = `[${this.className}${fnName}]`;
            return opts.stylize(formatted, 'special');
          }
        case 'object':
          switch (this.subtype) {
            case 'date':
              return utilInspect(new Date(this.description), opts);
            case 'null':
              return utilInspect(null, opts);
            case 'regexp':
              return opts.stylize(this.description, 'regexp');
            case 'map':
            case 'set':
              {
                var preview = utilInspect(new ObjectPreview(this.preview), opts);
                return `${this.description} ${preview}`;
              }
            default:
              break;
          }
          if (this.preview) {
            return utilInspect(new ObjectPreview(this.preview), opts);
          }
          return this.description;
        default:
          return this.description;
      }
    }
  }], [{
    key: "fromEvalResult",
    value: function fromEvalResult(_ref) {
      var {
        result,
        wasThrown
      } = _ref;
      if (wasThrown) return convertResultToError(result);
      return new RemoteObject(result);
    }
  }]);
}();
var ScopeSnapshot = /*#__PURE__*/function () {
  function ScopeSnapshot(scope, properties) {
    _classCallCheck(this, ScopeSnapshot);
    ObjectAssign(this, scope);
    this.properties = new SafeMap();
    this.completionGroup = ArrayPrototypeMap(properties, prop => {
      var value = new RemoteObject(prop.value);
      this.properties.set(prop.name, value);
      return prop.name;
    });
  }
  return _createClass(ScopeSnapshot, [{
    key: customInspectSymbol,
    value: function (depth, opts) {
      var type = StringPrototypeToUpperCase(this.type[0]) + StringPrototypeSlice(this.type, 1);
      var name = this.name ? `<${this.name}>` : '';
      var prefix = `${type}${name} `;
      return SideEffectFreeRegExpPrototypeSymbolReplace(/^Map /, utilInspect(this.properties, opts), prefix);
    }
  }]);
}();
function copyOwnProperties(target, source) {
  ArrayPrototypeForEach(ReflectOwnKeys(source), prop => {
    var desc = ReflectGetOwnPropertyDescriptor(source, prop);
    ObjectDefineProperty(target, prop, desc);
  });
}
function aliasProperties(target, mapping) {
  ArrayPrototypeForEach(ObjectKeys(mapping), key => {
    var desc = ReflectGetOwnPropertyDescriptor(target, key);
    ObjectDefineProperty(target, mapping[key], desc);
  });
}
function createRepl(inspector) {
  var initAfterStart = _async(function () {
    return _await(Runtime.enable(), function () {
      return _await(Profiler.enable(), function () {
        return _await(Profiler.setSamplingInterval({
          interval: 100
        }), function () {
          return _await(Debugger.enable(), function () {
            return _await(Debugger.setAsyncCallStackDepth({
              maxDepth: 0
            }), function () {
              return _await(Debugger.setBlackboxPatterns({
                patterns: []
              }), function () {
                return _await(Debugger.setPauseOnExceptions({
                  state: pauseOnExceptionState
                }), function () {
                  return _call(restoreBreakpoints, function () {
                    return Runtime.runIfWaitingForDebugger();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  var formatWatchers = _async(function () {
    var verbose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (!watchedExpressions.length) {
      return '';
    }
    var inspectValue = expr => PromisePrototypeThen(evalInCurrentContext(expr), undefined, error => `<${error.message}>`);
    var lastIndex = watchedExpressions.length - 1;
    return _await(SafePromiseAllReturnArrayLike(watchedExpressions, inspectValue), function (values) {
      var lines = ArrayPrototypeMap(watchedExpressions, (expr, idx) => {
        var prefix = `${leftPad(idx, ' ', lastIndex)}: ${expr} =`;
        var value = inspect(values[idx]);
        if (!StringPrototypeIncludes(value, '\n')) {
          return `${prefix} ${value}`;
        }
        return `${prefix}\n    ${StringPrototypeReplaceAll(value, '\n', '\n    ')}`;
      });
      var valueList = ArrayPrototypeJoin(lines, '\n');
      return verbose ? `Watchers:\n${valueList}\n` : valueList;
    });
  });
  var evalInCurrentContext = _async(function (code) {
    var _exit = false;
    // Repl asked for scope variables
    return _invoke(function () {
      if (code === '.scope') {
        if (!selectedFrame) {
          throw new ERR_DEBUGGER_ERROR('Requires execution to be paused');
        }
        return _await(selectedFrame.loadScopes(), function (scopes) {
          var _ArrayPrototypeMap = ArrayPrototypeMap(scopes, scope => scope.completionGroup);
          _exit = true;
          return _ArrayPrototypeMap;
        });
      }
    }, function (_result) {
      return _exit ? _result : selectedFrame ? PromisePrototypeThen(Debugger.evaluateOnCallFrame({
        callFrameId: selectedFrame.callFrameId,
        expression: code,
        objectGroup: 'node-inspect',
        generatePreview: true
      }), RemoteObject.fromEvalResult) : PromisePrototypeThen(Runtime.evaluate({
        expression: code,
        objectGroup: 'node-inspect',
        generatePreview: true
      }), RemoteObject.fromEvalResult);
    });
  });
  var getSourceSnippet = _async(function (location) {
    var delta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var {
      scriptId
    } = location;
    return _await(Debugger.getScriptSource({
      scriptId
    }), function (_ref16) {
      var {
        scriptSource
      } = _ref16;
      return new SourceSnippet(location, delta, scriptSource);
    });
  });
  var {
    Debugger,
    HeapProfiler,
    Profiler,
    Runtime
  } = inspector;
  var repl;

  // Things we want to keep around
  var history = {
    control: [],
    debug: []
  };
  var watchedExpressions = [];
  var knownBreakpoints = [];
  var heapSnapshotPromise = null;
  var pauseOnExceptionState = 'none';
  var lastCommand;

  // Things we need to reset when the app restarts
  var knownScripts;
  var currentBacktrace;
  var selectedFrame;
  var exitDebugRepl;
  var contextLineNumber = 2;
  function resetOnStart() {
    knownScripts = {};
    currentBacktrace = null;
    selectedFrame = null;
    if (exitDebugRepl) exitDebugRepl();
    exitDebugRepl = null;
  }
  resetOnStart();
  var INSPECT_OPTIONS = {
    colors: inspector.stdout.isTTY
  };
  function inspect(value) {
    return utilInspect(value, INSPECT_OPTIONS);
  }
  function print(value) {
    var addNewline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var text = typeof value === 'string' ? value : inspect(value);
    return inspector.print(text, addNewline);
  }
  function getCurrentLocation() {
    if (!selectedFrame) {
      throw new ERR_DEBUGGER_ERROR('Requires execution to be paused');
    }
    return selectedFrame.location;
  }
  function isCurrentScript(script) {
    return selectedFrame && getCurrentLocation().scriptId === script.scriptId;
  }
  function formatScripts() {
    var displayNatives = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    function isVisible(script) {
      if (displayNatives) return true;
      return !script.isNative || isCurrentScript(script);
    }
    return ArrayPrototypeJoin(ArrayPrototypeMap(ArrayPrototypeFilter(ObjectValues(knownScripts), isVisible), script => {
      var isCurrent = isCurrentScript(script);
      var {
        isNative,
        url
      } = script;
      var name = `${getRelativePath(url)}${isNative ? ' <native>' : ''}`;
      return `${isCurrent ? '*' : ' '} ${script.scriptId}: ${name}`;
    }), '\n');
  }
  function listScripts() {
    var displayNatives = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    print(formatScripts(displayNatives));
  }
  listScripts[customInspectSymbol] = function listWithoutInternal() {
    return formatScripts();
  };
  var profiles = [];
  var Profile = /*#__PURE__*/function () {
    function Profile(data) {
      _classCallCheck(this, Profile);
      this.data = data;
    }
    return _createClass(Profile, [{
      key: customInspectSymbol,
      value: function (depth, _ref2) {
        var {
          stylize
        } = _ref2;
        var {
          startTime,
          endTime
        } = this.data;
        var MU = StringFromCharCode(956);
        return stylize(`[Profile ${endTime - startTime}${MU}s]`, 'special');
      }
    }, {
      key: "save",
      value: function save() {
        var filename = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'node.cpuprofile';
        var absoluteFile = Path.resolve(filename);
        var json = JSONStringify(this.data);
        FS.writeFileSync(absoluteFile, json);
        print('Saved profile to ' + absoluteFile);
      }
    }], [{
      key: "createAndRegister",
      value: function createAndRegister(_ref3) {
        var {
          profile
        } = _ref3;
        var p = new Profile(profile);
        ArrayPrototypePush(profiles, p);
        return p;
      }
    }]);
  }();
  var SourceSnippet = /*#__PURE__*/function () {
    function SourceSnippet(location, delta, scriptSource) {
      _classCallCheck(this, SourceSnippet);
      ObjectAssign(this, location);
      this.scriptSource = scriptSource;
      this.delta = delta;
    }
    return _createClass(SourceSnippet, [{
      key: customInspectSymbol,
      value: function (depth, options) {
        var {
          scriptId,
          lineNumber,
          columnNumber,
          delta,
          scriptSource
        } = this;
        var start = MathMax(1, lineNumber - delta + 1);
        var end = lineNumber + delta + 1;
        var lines = StringPrototypeSplit(scriptSource, '\n');
        return ArrayPrototypeJoin(ArrayPrototypeMap(ArrayPrototypeSlice(lines, start - 1, end), (lineText, offset) => {
          var i = start + offset;
          var isCurrent = i === lineNumber + 1;
          var markedLine = isCurrent ? markSourceColumn(lineText, columnNumber, options.colors) : lineText;
          var isBreakpoint = false;
          ArrayPrototypeForEach(knownBreakpoints, _ref4 => {
            var {
              location
            } = _ref4;
            if (!location) return;
            if (scriptId === location.scriptId && i === location.lineNumber + 1) {
              isBreakpoint = true;
            }
          });
          var prefixChar = ' ';
          if (isCurrent) {
            prefixChar = '>';
          } else if (isBreakpoint) {
            prefixChar = '*';
          }
          return `${leftPad(i, prefixChar, end)} ${markedLine}`;
        }), '\n');
      }
    }]);
  }();
  var CallFrame = /*#__PURE__*/function () {
    function CallFrame(callFrame) {
      _classCallCheck(this, CallFrame);
      ObjectAssign(this, callFrame);
    }
    return _createClass(CallFrame, [{
      key: "loadScopes",
      value: function loadScopes() {
        return SafePromiseAllReturnArrayLike(ArrayPrototypeFilter(this.scopeChain, scope => scope.type !== 'global'), _async(function (scope) {
          var {
            objectId
          } = scope.object;
          return _await(Runtime.getProperties({
            objectId,
            generatePreview: true
          }), function (_ref5) {
            var {
              result
            } = _ref5;
            return new ScopeSnapshot(scope, result);
          });
        }));
      }
    }, {
      key: "list",
      value: function list() {
        var delta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
        return getSourceSnippet(this.location, delta);
      }
    }]);
  }();
  var Backtrace = /*#__PURE__*/function (_Array) {
    function Backtrace() {
      _classCallCheck(this, Backtrace);
      return _callSuper(this, Backtrace, arguments);
    }
    _inherits(Backtrace, _Array);
    return _createClass(Backtrace, [{
      key: customInspectSymbol,
      value: function () {
        return ArrayPrototypeJoin(ArrayPrototypeMap(this, (callFrame, idx) => {
          var {
            location: {
              scriptId,
              lineNumber,
              columnNumber
            },
            functionName
          } = callFrame;
          var name = functionName || '(anonymous)';
          var script = knownScripts[scriptId];
          var relativeUrl = script && getRelativePath(script.url) || '<unknown>';
          var frameLocation = `${relativeUrl}:${lineNumber + 1}:${columnNumber}`;
          return `#${idx} ${name} ${frameLocation}`;
        }), '\n');
      }
    }], [{
      key: "from",
      value: function from(callFrames) {
        return FunctionPrototypeCall(ArrayFrom, this, callFrames, callFrame => callFrame instanceof CallFrame ? callFrame : new CallFrame(callFrame));
      }
    }]);
  }(Array);
  function prepareControlCode(input) {
    if (input === '\n') return lastCommand;
    // Add parentheses: exec process.title => exec("process.title");
    var match = RegExpPrototypeExec(/^\s*(?:exec|p)\s+([^\n]*)/, input);
    input = match ? match[1] : input;
    if (isObjectLiteral(input)) {
      // Add parentheses to make sure `input` is parsed as an expression
      input = `(${StringPrototypeTrim(input)})\n`;
    }
    if (match) {
      lastCommand = `exec(${JSONStringify(input)})`;
    } else {
      lastCommand = input;
    }
    return lastCommand;
  }
  function controlEval(input, context, filename, callback) {
    debuglog('eval:', input);
    function returnToCallback(error, result) {
      debuglog('end-eval:', input, error);
      callback(error, result);
    }
    try {
      var code = prepareControlCode(input);
      var result = vm.runInContext(code, context, filename);
      var then = result?.then;
      if (typeof then === 'function') {
        FunctionPrototypeCall(then, result, result => returnToCallback(null, result), returnToCallback);
      } else {
        returnToCallback(null, result);
      }
    } catch (e) {
      returnToCallback(e);
    }
  }
  function debugEval(input, context, filename, callback) {
    debuglog('eval:', input);
    function returnToCallback(error, result) {
      debuglog('end-eval:', input, error);
      callback(error, result);
    }
    PromisePrototypeThen(evalInCurrentContext(input), result => returnToCallback(null, result), returnToCallback);
  }
  function watchers() {
    var verbose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    return PromisePrototypeThen(formatWatchers(verbose), print);
  }

  // List source code
  function list() {
    var delta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
    if (!selectedFrame) {
      throw new ERR_DEBUGGER_ERROR('Requires execution to be paused');
    }
    return selectedFrame.list(delta).then(null, error => {
      print("You can't list source code right now");
      throw error;
    });
  }
  function setContextLineNumber() {
    var delta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
    if (!selectedFrame) {
      throw new ERR_DEBUGGER_ERROR('Requires execution to be paused');
    }
    validateNumber(delta, 'delta', 1);
    contextLineNumber = delta;
    print(`The contextLine has been changed to ${delta}.`);
  }
  function handleBreakpointResolved(_ref6) {
    var {
      breakpointId,
      location
    } = _ref6;
    var script = knownScripts[location.scriptId];
    var scriptUrl = script?.url;
    if (scriptUrl) {
      ObjectAssign(location, {
        scriptUrl
      });
    }
    var isExisting = ArrayPrototypeSome(knownBreakpoints, bp => {
      if (bp.breakpointId === breakpointId) {
        ObjectAssign(bp, {
          location
        });
        return true;
      }
      return false;
    });
    if (!isExisting) {
      ArrayPrototypePush(knownBreakpoints, {
        breakpointId,
        location
      });
    }
  }
  function listBreakpoints() {
    if (!knownBreakpoints.length) {
      print('No breakpoints yet');
      return;
    }
    function formatLocation(location) {
      if (!location) return '<unknown location>';
      var script = knownScripts[location.scriptId];
      var scriptUrl = script ? script.url : location.scriptUrl;
      return `${getRelativePath(scriptUrl)}:${location.lineNumber + 1}`;
    }
    var breaklist = ArrayPrototypeJoin(ArrayPrototypeMap(knownBreakpoints, (bp, idx) => `#${idx} ${formatLocation(bp.location)}`), '\n');
    print(breaklist);
  }
  function setBreakpoint(script, line, condition, silent) {
    function registerBreakpoint(_ref7) {
      var {
        breakpointId,
        actualLocation
      } = _ref7;
      handleBreakpointResolved({
        breakpointId,
        location: actualLocation
      });
      if (actualLocation?.scriptId) {
        if (!silent) return getSourceSnippet(actualLocation, 5);
      } else {
        print(`Warning: script '${script}' was not loaded yet.`);
      }
      return undefined;
    }

    // setBreakpoint(): set breakpoint at current location
    if (script === undefined) {
      return PromisePrototypeThen(Debugger.setBreakpoint({
        location: getCurrentLocation(),
        condition
      }), registerBreakpoint);
    }

    // setBreakpoint(line): set breakpoint in current script at specific line
    if (line === undefined && typeof script === 'number') {
      var location = {
        scriptId: getCurrentLocation().scriptId,
        lineNumber: script - 1
      };
      return PromisePrototypeThen(Debugger.setBreakpoint({
        location,
        condition
      }), registerBreakpoint);
    }
    validateString(script, 'script');

    // setBreakpoint('fn()'): Break when a function is called
    if (StringPrototypeEndsWith(script, '()')) {
      var debugExpr = `debug(${script.slice(0, -2)})`;
      var debugCall = selectedFrame ? Debugger.evaluateOnCallFrame({
        callFrameId: selectedFrame.callFrameId,
        expression: debugExpr,
        includeCommandLineAPI: true
      }) : Runtime.evaluate({
        expression: debugExpr,
        includeCommandLineAPI: true
      });
      return PromisePrototypeThen(debugCall, _ref8 => {
        var {
          result,
          wasThrown
        } = _ref8;
        if (wasThrown) return convertResultToError(result);
        return undefined; // This breakpoint can't be removed the same way
      });
    }

    // setBreakpoint('scriptname')
    var scriptId = null;
    var ambiguous = false;
    if (knownScripts[script]) {
      scriptId = script;
    } else {
      ArrayPrototypeForEach(ObjectKeys(knownScripts), id => {
        var scriptUrl = knownScripts[id].url;
        if (scriptUrl && StringPrototypeIncludes(scriptUrl, script)) {
          if (scriptId !== null) {
            ambiguous = true;
          }
          scriptId = id;
        }
      });
    }
    if (ambiguous) {
      print('Script name is ambiguous');
      return undefined;
    }
    if (line <= 0) {
      print('Line should be a positive value');
      return undefined;
    }
    if (scriptId !== null) {
      var _location = {
        scriptId,
        lineNumber: line - 1
      };
      return PromisePrototypeThen(Debugger.setBreakpoint({
        location: _location,
        condition
      }), registerBreakpoint);
    }
    var escapedPath = SideEffectFreeRegExpPrototypeSymbolReplace(/([/\\.?*()^${}|[\]])/g, script, '\\$1');
    var urlRegex = `^(.*[\\/\\\\])?${escapedPath}$`;
    return PromisePrototypeThen(Debugger.setBreakpointByUrl({
      urlRegex,
      lineNumber: line - 1,
      condition
    }), bp => {
      // TODO: handle bp.locations in case the regex matches existing files
      if (!bp.location) {
        // Fake it for now.
        ObjectAssign(bp, {
          actualLocation: {
            scriptUrl: `.*/${script}$`,
            lineNumber: line - 1
          }
        });
      }
      return registerBreakpoint(bp);
    });
  }
  function clearBreakpoint(url, line) {
    var breakpoint = ArrayPrototypeFind(knownBreakpoints, _ref9 => {
      var {
        location
      } = _ref9;
      if (!location) return false;
      var script = knownScripts[location.scriptId];
      if (!script) return false;
      return StringPrototypeIncludes(script.url, url) && location.lineNumber + 1 === line;
    });
    if (!breakpoint) {
      print(`Could not find breakpoint at ${url}:${line}`);
      return PromiseResolve();
    }
    return PromisePrototypeThen(Debugger.removeBreakpoint({
      breakpointId: breakpoint.breakpointId
    }), () => {
      var idx = ArrayPrototypeIndexOf(knownBreakpoints, breakpoint);
      ArrayPrototypeSplice(knownBreakpoints, idx, 1);
    });
  }
  function restoreBreakpoints() {
    var lastBreakpoints = ArrayPrototypeSplice(knownBreakpoints, 0);
    var newBreakpoints = ArrayPrototypeMap(ArrayPrototypeFilter(lastBreakpoints, _ref0 => {
      var {
        location
      } = _ref0;
      return !!location.scriptUrl;
    }), _ref1 => {
      var {
        location
      } = _ref1;
      return setBreakpoint(location.scriptUrl, location.lineNumber + 1);
    });
    if (!newBreakpoints.length) return PromiseResolve();
    return PromisePrototypeThen(SafePromiseAllReturnVoid(newBreakpoints), () => {
      print(`${newBreakpoints.length} breakpoints restored.`);
    });
  }
  function setPauseOnExceptions(state) {
    return PromisePrototypeThen(Debugger.setPauseOnExceptions({
      state
    }), () => {
      pauseOnExceptionState = state;
    });
  }
  Debugger.on('paused', _ref10 => {
    var {
      callFrames,
      reason /* , hitBreakpoints */
    } = _ref10;
    if (process.env.NODE_INSPECT_RESUME_ON_START === '1' && reason === 'Break on start') {
      debuglog('Paused on start, but NODE_INSPECT_RESUME_ON_START' + ' environment variable is set to 1, resuming');
      inspector.client.callMethod('Debugger.resume');
      return;
    }

    // Save execution context's data
    currentBacktrace = Backtrace.from(callFrames);
    selectedFrame = currentBacktrace[0];
    var {
      scriptId,
      lineNumber
    } = selectedFrame.location;
    var breakType = reason === 'other' ? 'break' : reason;
    var script = knownScripts[scriptId];
    var scriptUrl = script ? getRelativePath(script.url) : '[unknown]';
    var header = `${breakType} in ${scriptUrl}:${lineNumber + 1}`;
    inspector.suspendReplWhile(() => PromisePrototypeThen(SafePromiseAllReturnArrayLike([formatWatchers(true), selectedFrame.list(contextLineNumber)]), _ref11 => {
      var {
        0: watcherList,
        1: context
      } = _ref11;
      var breakContext = watcherList ? `${watcherList}\n${inspect(context)}` : inspect(context);
      print(`${header}\n${breakContext}`);
    }));
  });
  function handleResumed() {
    currentBacktrace = null;
    selectedFrame = null;
  }
  Debugger.on('resumed', handleResumed);
  Debugger.on('breakpointResolved', handleBreakpointResolved);
  Debugger.on('scriptParsed', script => {
    var {
      scriptId,
      url
    } = script;
    if (url) {
      knownScripts[scriptId] = _objectSpread({
        isNative: isNativeUrl(url)
      }, script);
    }
  });
  Profiler.on('consoleProfileFinished', _ref12 => {
    var {
      profile
    } = _ref12;
    Profile.createAndRegister({
      profile
    });
    print('Captured new CPU profile.\n' + `Access it with profiles[${profiles.length - 1}]`);
  });
  function initializeContext(context) {
    ArrayPrototypeForEach(inspector.domainNames, domain => {
      ObjectDefineProperty(context, domain, {
        __proto__: null,
        value: inspector[domain],
        enumerable: true,
        configurable: true,
        writeable: false
      });
    });
    copyOwnProperties(context, {
      get help() {
        return print(HELP);
      },
      get run() {
        return inspector.run();
      },
      get kill() {
        return inspector.killChild();
      },
      get restart() {
        return inspector.run();
      },
      get cont() {
        handleResumed();
        return Debugger.resume();
      },
      get next() {
        handleResumed();
        return Debugger.stepOver();
      },
      get step() {
        handleResumed();
        return Debugger.stepInto();
      },
      get out() {
        handleResumed();
        return Debugger.stepOut();
      },
      get pause() {
        return Debugger.pause();
      },
      get backtrace() {
        return currentBacktrace;
      },
      get breakpoints() {
        return listBreakpoints();
      },
      exec(expr) {
        return evalInCurrentContext(expr);
      },
      get profile() {
        return Profiler.start();
      },
      get profileEnd() {
        return PromisePrototypeThen(Profiler.stop(), Profile.createAndRegister);
      },
      get profiles() {
        return profiles;
      },
      takeHeapSnapshot() {
        var filename = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'node.heapsnapshot';
        if (heapSnapshotPromise) {
          print('Cannot take heap snapshot because another snapshot is in progress.');
          return heapSnapshotPromise;
        }
        heapSnapshotPromise = new Promise((resolve, reject) => {
          var absoluteFile = Path.resolve(filename);
          var writer = FS.createWriteStream(absoluteFile);
          var sizeWritten = 0;
          function onProgress(_ref13) {
            var {
              done,
              total,
              finished
            } = _ref13;
            if (finished) {
              print('Heap snapshot prepared.');
            } else {
              print(`Heap snapshot: ${done}/${total}`, false);
            }
          }
          function onChunk(_ref14) {
            var {
              chunk
            } = _ref14;
            sizeWritten += chunk.length;
            writer.write(chunk);
            print(`Writing snapshot: ${sizeWritten}`, false);
          }
          function onResolve() {
            writer.end(() => {
              teardown();
              print(`Wrote snapshot: ${absoluteFile}`);
              heapSnapshotPromise = null;
              resolve();
            });
          }
          function onReject(error) {
            teardown();
            reject(error);
          }
          function teardown() {
            HeapProfiler.removeListener('reportHeapSnapshotProgress', onProgress);
            HeapProfiler.removeListener('addHeapSnapshotChunk', onChunk);
          }
          HeapProfiler.on('reportHeapSnapshotProgress', onProgress);
          HeapProfiler.on('addHeapSnapshotChunk', onChunk);
          print('Heap snapshot: 0/0', false);
          PromisePrototypeThen(HeapProfiler.takeHeapSnapshot({
            reportProgress: true
          }), onResolve, onReject);
        });
        return heapSnapshotPromise;
      },
      get watchers() {
        return watchers();
      },
      watch(expr) {
        validateString(expr, 'expression');
        ArrayPrototypePush(watchedExpressions, expr);
      },
      unwatch(expr) {
        var index = ArrayPrototypeIndexOf(watchedExpressions, expr);

        // Unwatch by expression
        // or
        // Unwatch by watcher number
        ArrayPrototypeSplice(watchedExpressions, index !== -1 ? index : +expr, 1);
      },
      get repl() {
        // Don't display any default messages
        var listeners = ArrayPrototypeSlice(repl.listeners('SIGINT'));
        repl.removeAllListeners('SIGINT');
        var oldContext = repl.context;
        exitDebugRepl = () => {
          // Restore all listeners
          process.nextTick(() => {
            ArrayPrototypeForEach(listeners, listener => {
              repl.on('SIGINT', listener);
            });
          });

          // Exit debug repl
          repl.eval = controlEval;

          // Swap history
          history.debug = repl.history;
          repl.history = history.control;
          repl.context = oldContext;
          repl.setPrompt('debug> ');
          repl.displayPrompt();
          repl.removeListener('SIGINT', exitDebugRepl);
          repl.removeListener('exit', exitDebugRepl);
          exitDebugRepl = null;
        };

        // Exit debug repl on SIGINT
        repl.on('SIGINT', exitDebugRepl);

        // Exit debug repl on repl exit
        repl.on('exit', exitDebugRepl);

        // Set new
        repl.eval = debugEval;
        repl.context = {};

        // Swap history
        history.control = repl.history;
        repl.history = history.debug;
        repl.setPrompt('> ');
        print('Press Ctrl+C to leave debug repl');
        return repl.displayPrompt();
      },
      get version() {
        return PromisePrototypeThen(Runtime.evaluate({
          expression: 'process.versions.v8',
          contextId: 1,
          returnByValue: true
        }), _ref15 => {
          var {
            result
          } = _ref15;
          print(result.value);
        });
      },
      scripts: listScripts,
      setBreakpoint,
      clearBreakpoint,
      setPauseOnExceptions,
      get breakOnException() {
        return setPauseOnExceptions('all');
      },
      get breakOnUncaught() {
        return setPauseOnExceptions('uncaught');
      },
      get breakOnNone() {
        return setPauseOnExceptions('none');
      },
      list,
      setContextLineNumber
    });
    aliasProperties(context, SHORTCUTS);
  }
  return function startRepl() {
    try {
      inspector.client.on('close', () => {
        resetOnStart();
      });
      inspector.client.on('ready', () => {
        initAfterStart();
      });

      // Init once for the initial connection
      return _call(initAfterStart, function () {
        var replOptions = {
          prompt: 'debug> ',
          input: inspector.stdin,
          output: inspector.stdout,
          eval: controlEval,
          useGlobal: false,
          ignoreUndefined: true
        };
        repl = Repl.start(replOptions);
        initializeContext(repl.context);
        repl.on('reset', initializeContext);
        repl.defineCommand('interrupt', () => {
          // We want this for testing purposes where sending Ctrl+C can be tricky.
          repl.emit('SIGINT');
        });
        return repl;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
module.exports = createRepl;

