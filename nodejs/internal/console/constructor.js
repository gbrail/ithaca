'use strict';

// The Console constructor is not actually used to construct the global
// console. It's exported for backwards compatibility.
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayFrom,
  ArrayIsArray,
  ArrayPrototypeForEach,
  ArrayPrototypePush,
  ArrayPrototypeUnshift,
  Boolean,
  ErrorCaptureStackTrace,
  FunctionPrototypeBind,
  MapPrototypeGet,
  MapPrototypeValues,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectKeys,
  ObjectPrototypeHasOwnProperty,
  ObjectValues,
  ReflectApply,
  ReflectConstruct,
  ReflectOwnKeys,
  RegExpPrototypeSymbolReplace,
  SafeArrayIterator,
  SafeMap,
  SafeSet,
  SafeWeakMap,
  StringPrototypeIncludes,
  StringPrototypeRepeat,
  StringPrototypeSlice,
  Symbol: _Symbol,
  SymbolHasInstance,
  SymbolToStringTag
} = primordials;
var {
  trace
} = internalBinding('trace_events');
var {
  codes: {
    ERR_CONSOLE_WRITABLE_STREAM,
    ERR_INCOMPATIBLE_OPTION_PAIR
  },
  isStackOverflowError
} = require('internal/errors');
var {
  validateArray,
  validateInteger,
  validateObject,
  validateOneOf
} = require('internal/validators');
var {
  previewEntries
} = internalBinding('util');
var {
  Buffer: {
    isBuffer
  }
} = require('buffer');
var {
  inspect,
  formatWithOptions
} = require('internal/util/inspect');
var {
  isTypedArray,
  isSet,
  isMap,
  isSetIterator,
  isMapIterator
} = require('internal/util/types');
var {
  CHAR_UPPERCASE_C: kTraceCount
} = require('internal/constants');
var kCounts = _Symbol('counts');
var {
  time,
  timeLog,
  timeEnd,
  kNone
} = require('internal/util/debuglog');
var {
  channel
} = require('diagnostics_channel');
var onLog = channel('console.log');
var onWarn = channel('console.warn');
var onError = channel('console.error');
var onInfo = channel('console.info');
var onDebug = channel('console.debug');
var kTraceConsoleCategory = 'node,node.console';
var kMaxGroupIndentation = 1000;

// Lazy loaded for startup performance.
var cliTable;
var utilColors;
function lazyUtilColors() {
  utilColors ??= require('internal/util/colors');
  return utilColors;
}

// Track amount of indentation required via `console.group()`.
var kGroupIndentationWidth = _Symbol('kGroupIndentWidth');
var kFormatForStderr = _Symbol('kFormatForStderr');
var kFormatForStdout = _Symbol('kFormatForStdout');
var kGetInspectOptions = _Symbol('kGetInspectOptions');
var kColorMode = _Symbol('kColorMode');
var kIsConsole = _Symbol('kIsConsole');
var kWriteToConsole = _Symbol('kWriteToConsole');
var kBindProperties = _Symbol('kBindProperties');
var kBindStreamsEager = _Symbol('kBindStreamsEager');
var kBindStreamsLazy = _Symbol('kBindStreamsLazy');
var kUseStdout = _Symbol('kUseStdout');
var kUseStderr = _Symbol('kUseStderr');
var optionsMap = new SafeWeakMap();
function Console(options /* or: stdout, stderr, ignoreErrors = true */) {
  // We have to test new.target here to see if this function is called
  // with new, because we need to define a custom instanceof to accommodate
  // the global console.
  if (new.target === undefined) {
    return ReflectConstruct(Console, arguments);
  }
  if (!options || typeof options.write === 'function') {
    options = {
      stdout: options,
      stderr: arguments[1],
      ignoreErrors: arguments[2]
    };
  }
  var {
    stdout,
    stderr = stdout,
    ignoreErrors = true,
    colorMode = 'auto',
    inspectOptions,
    groupIndentation
  } = options;
  if (!stdout || typeof stdout.write !== 'function') {
    throw new ERR_CONSOLE_WRITABLE_STREAM('stdout');
  }
  if (!stderr || typeof stderr.write !== 'function') {
    throw new ERR_CONSOLE_WRITABLE_STREAM('stderr');
  }
  validateOneOf(colorMode, 'colorMode', ['auto', true, false]);
  if (groupIndentation !== undefined) {
    validateInteger(groupIndentation, 'groupIndentation', 0, kMaxGroupIndentation);
  }
  if (inspectOptions !== undefined) {
    validateObject(inspectOptions, 'options.inspectOptions');
    var inspectOptionsMap = isMap(inspectOptions) ? inspectOptions : new SafeMap([[stdout, inspectOptions], [stderr, inspectOptions]]);
    for (var _inspectOptions of MapPrototypeValues(inspectOptionsMap)) {
      if (_inspectOptions.colors !== undefined && options.colorMode !== undefined) {
        throw new ERR_INCOMPATIBLE_OPTION_PAIR('options.inspectOptions.color', 'colorMode');
      }
    }
    optionsMap.set(this, inspectOptionsMap);
  }

  // Bind the prototype functions to this Console instance
  ArrayPrototypeForEach(ObjectKeys(Console.prototype), key => {
    // We have to bind the methods grabbed from the instance instead of from
    // the prototype so that users extending the Console can override them
    // from the prototype chain of the subclass.
    this[key] = FunctionPrototypeBind(this[key], this);
    ObjectDefineProperty(this[key], 'name', {
      __proto__: null,
      value: key
    });
  });
  this[kBindStreamsEager](stdout, stderr);
  this[kBindProperties](ignoreErrors, colorMode, groupIndentation);
}
var consolePropAttributes = {
  writable: true,
  enumerable: false,
  configurable: true
};

// Fixup global.console instanceof global.console.Console
ObjectDefineProperty(Console, SymbolHasInstance, {
  __proto__: null,
  value(instance) {
    return instance[kIsConsole];
  }
});
var kColorInspectOptions = {
  colors: true
};
var kNoColorInspectOptions = {};
var kGroupIndentationString = _Symbol('kGroupIndentationString');
ObjectDefineProperties(Console.prototype, {
  [kBindStreamsEager]: _objectSpread(_objectSpread({
    __proto__: null
  }, consolePropAttributes), {}, {
    // Eager version for the Console constructor
    value: function (stdout, stderr) {
      ObjectDefineProperties(this, {
        '_stdout': _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: stdout
        }),
        '_stderr': _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: stderr
        })
      });
    }
  }),
  [kBindStreamsLazy]: _objectSpread(_objectSpread({
    __proto__: null
  }, consolePropAttributes), {}, {
    // Lazily load the stdout and stderr from an object so we don't
    // create the stdio streams when they are not even accessed
    value: function (object) {
      var stdout;
      var stderr;
      ObjectDefineProperties(this, {
        '_stdout': {
          __proto__: null,
          enumerable: false,
          configurable: true,
          get() {
            return stdout ||= object.stdout;
          },
          set(value) {
            stdout = value;
          }
        },
        '_stderr': {
          __proto__: null,
          enumerable: false,
          configurable: true,
          get() {
            return stderr ||= object.stderr;
          },
          set(value) {
            stderr = value;
          }
        }
      });
    }
  }),
  [kBindProperties]: _objectSpread(_objectSpread({
    __proto__: null
  }, consolePropAttributes), {}, {
    value: function (ignoreErrors, colorMode) {
      var groupIndentation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      ObjectDefineProperties(this, {
        '_stdoutErrorHandler': _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: createWriteErrorHandler(this, kUseStdout)
        }),
        '_stderrErrorHandler': _objectSpread(_objectSpread({}, consolePropAttributes), {}, {
          __proto__: null,
          value: createWriteErrorHandler(this, kUseStderr)
        }),
        '_ignoreErrors': _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: Boolean(ignoreErrors)
        }),
        '_times': _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: new SafeMap()
        }),
        // Corresponds to https://console.spec.whatwg.org/#count-map
        [kCounts]: _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: new SafeMap()
        }),
        [kColorMode]: _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: colorMode
        }),
        [kIsConsole]: _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: true
        }),
        [kGroupIndentationWidth]: _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: groupIndentation
        }),
        [kGroupIndentationString]: _objectSpread(_objectSpread({
          __proto__: null
        }, consolePropAttributes), {}, {
          value: ''
        }),
        [SymbolToStringTag]: {
          __proto__: null,
          writable: false,
          enumerable: false,
          configurable: true,
          value: 'console'
        }
      });
    }
  }),
  [kWriteToConsole]: _objectSpread(_objectSpread({
    __proto__: null
  }, consolePropAttributes), {}, {
    value: function (streamSymbol, string) {
      var ignoreErrors = this._ignoreErrors;
      var groupIndent = this[kGroupIndentationString];
      var useStdout = streamSymbol === kUseStdout;
      var stream = useStdout ? this._stdout : this._stderr;
      var errorHandler = useStdout ? this._stdoutErrorHandler : this._stderrErrorHandler;
      if (groupIndent.length !== 0) {
        if (StringPrototypeIncludes(string, '\n')) {
          string = RegExpPrototypeSymbolReplace(/\n/g, string, `\n${groupIndent}`);
        }
        string = groupIndent + string;
      }
      string += '\n';
      if (ignoreErrors === false) return stream.write(string);

      // There may be an error occurring synchronously (e.g. for files or TTYs
      // on POSIX systems) or asynchronously (e.g. pipes on POSIX systems), so
      // handle both situations.
      try {
        // Add and later remove a noop error handler to catch synchronous
        // errors.
        if (stream.listenerCount('error') === 0) stream.once('error', noop);
        stream.write(string, errorHandler);
      } catch (e) {
        // Console is a debugging utility, so it swallowing errors is not
        // desirable even in edge cases such as low stack space.
        if (isStackOverflowError(e)) throw e;
        // Sorry, there's no proper way to pass along the error here.
      } finally {
        stream.removeListener('error', noop);
      }
    }
  }),
  [kGetInspectOptions]: _objectSpread(_objectSpread({
    __proto__: null
  }, consolePropAttributes), {}, {
    value: function (stream) {
      var color = this[kColorMode];
      if (color === 'auto') {
        color = lazyUtilColors().shouldColorize(stream);
      }
      var inspectOptionsMap = optionsMap.get(this);
      var options = inspectOptionsMap ? MapPrototypeGet(inspectOptionsMap, stream) : undefined;
      if (options) {
        if (options.colors === undefined) {
          options.colors = color;
        }
        return options;
      }
      return color ? kColorInspectOptions : kNoColorInspectOptions;
    }
  }),
  [kFormatForStdout]: _objectSpread(_objectSpread({
    __proto__: null
  }, consolePropAttributes), {}, {
    value: function (args) {
      if (args.length === 1) {
        // Fast path: single string, don't call format.
        // Avoids ReflectApply and validation overhead.
        var a0 = args[0];
        if (typeof a0 === 'string') {
          return a0;
        }
      }
      var opts = this[kGetInspectOptions](this._stdout);
      ArrayPrototypeUnshift(args, opts);
      return ReflectApply(formatWithOptions, null, args);
    }
  }),
  [kFormatForStderr]: _objectSpread(_objectSpread({
    __proto__: null
  }, consolePropAttributes), {}, {
    value: function (args) {
      if (args.length === 1) {
        // Fast path: single string, don't call format.
        // Avoids ReflectApply and validation overhead.
        var a0 = args[0];
        if (typeof a0 === 'string') {
          return a0;
        }
      }
      var opts = this[kGetInspectOptions](this._stderr);
      ArrayPrototypeUnshift(args, opts);
      return ReflectApply(formatWithOptions, null, args);
    }
  })
});

// Make a function that can serve as the callback passed to `stream.write()`.
function createWriteErrorHandler(instance, streamSymbol) {
  return err => {
    // This conditional evaluates to true if and only if there was an error
    // that was not already emitted (which happens when the _write callback
    // is invoked asynchronously).
    var stream = streamSymbol === kUseStdout ? instance._stdout : instance._stderr;
    if (err !== null && !stream._writableState.errorEmitted) {
      // If there was an error, it will be emitted on `stream` as
      // an `error` event. Adding a `once` listener will keep that error
      // from becoming an uncaught exception, but since the handler is
      // removed after the event, non-console.* writes won't be affected.
      // we are only adding noop if there is no one else listening for 'error'
      if (stream.listenerCount('error') === 0) {
        stream.once('error', noop);
      }
    }
  };
}
function timeLogImpl(consoleRef, label, formatted, args) {
  if (args === undefined) {
    consoleRef.log('%s: %s', label, formatted);
  } else {
    consoleRef.log.apply(consoleRef, ['%s: %s', label, formatted].concat(_toConsumableArray(new SafeArrayIterator(args))));
  }
}
var consoleMethods = {
  log() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (onLog.hasSubscribers) {
      onLog.publish(args);
    }
    this[kWriteToConsole](kUseStdout, this[kFormatForStdout](args));
  },
  info() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    if (onInfo.hasSubscribers) {
      onInfo.publish(args);
    }
    this[kWriteToConsole](kUseStdout, this[kFormatForStdout](args));
  },
  debug() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    if (onDebug.hasSubscribers) {
      onDebug.publish(args);
    }
    this[kWriteToConsole](kUseStdout, this[kFormatForStdout](args));
  },
  warn() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    if (onWarn.hasSubscribers) {
      onWarn.publish(args);
    }
    this[kWriteToConsole](kUseStderr, this[kFormatForStderr](args));
  },
  error() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }
    if (onError.hasSubscribers) {
      onError.publish(args);
    }
    this[kWriteToConsole](kUseStderr, this[kFormatForStderr](args));
  },
  dir(object, options) {
    this[kWriteToConsole](kUseStdout, inspect(object, _objectSpread(_objectSpread({
      customInspect: false
    }, this[kGetInspectOptions](this._stdout)), options)));
  },
  time() {
    var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
    time(this._times, kTraceConsoleCategory, 'console.time()', kNone, label, `time::${label}`);
  },
  timeEnd() {
    var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
    timeEnd(this._times, kTraceConsoleCategory, 'console.timeEnd()', kNone, (label, formatted, args) => timeLogImpl(this, label, formatted, args), label, `time::${label}`);
  },
  timeLog() {
    var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
    for (var _len6 = arguments.length, data = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      data[_key6 - 1] = arguments[_key6];
    }
    timeLog(this._times, kTraceConsoleCategory, 'console.timeLog()', kNone, (label, formatted, args) => timeLogImpl(this, label, formatted, args), label, `time::${label}`, data);
  },
  trace: function trace() {
    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }
    var err = {
      name: 'Trace',
      message: this[kFormatForStderr](args)
    };
    ErrorCaptureStackTrace(err, trace);
    this.error(err.stack);
  },
  // Defined by: https://console.spec.whatwg.org/#assert
  assert(expression) {
    if (!expression) {
      for (var _len8 = arguments.length, args = new Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
        args[_key8 - 1] = arguments[_key8];
      }
      if (args.length && typeof args[0] === 'string') {
        args[0] = `Assertion failed: ${args[0]}`;
      } else {
        ArrayPrototypeUnshift(args, 'Assertion failed');
      }
      // The arguments will be formatted in warn() again
      ReflectApply(this.warn, this, args);
    }
  },
  // Defined by: https://console.spec.whatwg.org/#clear
  clear() {
    // It only makes sense to clear if _stdout is a TTY.
    // Otherwise, do nothing.
    if (this._stdout.isTTY && process.env.TERM !== 'dumb') {
      // The require is here intentionally to avoid readline being
      // required too early when console is first loaded.
      var {
        cursorTo,
        clearScreenDown
      } = require('internal/readline/callbacks');
      cursorTo(this._stdout, 0, 0);
      clearScreenDown(this._stdout);
    }
  },
  // Defined by: https://console.spec.whatwg.org/#count
  count() {
    var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
    // Ensures that label is a string, and only things that can be
    // coerced to strings. e.g. Symbol is not allowed
    label = `${label}`;
    var counts = this[kCounts];
    var count = counts.get(label);
    if (count === undefined) count = 1;else count++;
    counts.set(label, count);
    trace(kTraceCount, kTraceConsoleCategory, `count::${label}`, 0, count);
    this.log(`${label}: ${count}`);
  },
  // Defined by: https://console.spec.whatwg.org/#countreset
  countReset() {
    var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
    var counts = this[kCounts];
    if (!counts.has(label)) {
      process.emitWarning(`Count for '${label}' does not exist`);
      return;
    }
    trace(kTraceCount, kTraceConsoleCategory, `count::${label}`, 0, 0);
    counts.delete(`${label}`);
  },
  group() {
    for (var _len9 = arguments.length, data = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      data[_key9] = arguments[_key9];
    }
    if (data.length > 0) {
      ReflectApply(this.log, this, data);
    }
    var currentIndentation = this[kGroupIndentationString];
    currentIndentation += StringPrototypeRepeat(' ', this[kGroupIndentationWidth]);
    this[kGroupIndentationString] = currentIndentation;
  },
  groupEnd() {
    var currentIndentation = this[kGroupIndentationString];
    var newIndentation = StringPrototypeSlice(currentIndentation, 0, currentIndentation.length - this[kGroupIndentationWidth]);
    this[kGroupIndentationString] = newIndentation;
  },
  // https://console.spec.whatwg.org/#table
  table(tabularData, properties) {
    if (properties !== undefined) validateArray(properties, 'properties');
    if (tabularData === null || typeof tabularData !== 'object') return this.log(tabularData);
    cliTable ??= require('internal/cli_table');
    var final = (k, v) => this.log(cliTable(k, v));
    var _inspect = v => {
      var depth = v !== null && typeof v === 'object' && !isArray(v) && ObjectKeys(v).length > 2 ? -1 : 0;
      var opt = _objectSpread({
        depth,
        maxArrayLength: 3,
        breakLength: Infinity
      }, this[kGetInspectOptions](this._stdout));
      return inspect(v, opt);
    };
    var getIndexArray = length => ArrayFrom({
      length
    }, (_, i) => _inspect(i));
    var mapIter = isMapIterator(tabularData);
    var isKeyValue = false;
    var i = 0;
    if (mapIter) {
      var res = previewEntries(tabularData, true);
      tabularData = res[0];
      isKeyValue = res[1];
    }
    if (isKeyValue || isMap(tabularData)) {
      var _keys = [];
      var _values = [];
      var length = 0;
      if (mapIter) {
        for (; i < tabularData.length / 2; ++i) {
          ArrayPrototypePush(_keys, _inspect(tabularData[i * 2]));
          ArrayPrototypePush(_values, _inspect(tabularData[i * 2 + 1]));
          length++;
        }
      } else {
        for (var {
          0: k,
          1: v
        } of tabularData) {
          ArrayPrototypePush(_keys, _inspect(k));
          ArrayPrototypePush(_values, _inspect(v));
          length++;
        }
      }
      return final([iterKey, keyKey, valuesKey], [getIndexArray(length), _keys, _values]);
    }
    var setIter = isSetIterator(tabularData);
    if (setIter) tabularData = previewEntries(tabularData);
    var setlike = setIter || mapIter || isSet(tabularData);
    if (setlike) {
      var _values2 = [];
      var _length = 0;
      for (var _v of tabularData) {
        ArrayPrototypePush(_values2, _inspect(_v));
        _length++;
      }
      return final([iterKey, valuesKey], [getIndexArray(_length), _values2]);
    }
    var map = {
      __proto__: null
    };
    var hasPrimitives = false;
    var valuesKeyArray = [];
    var indexKeyArray = ObjectKeys(tabularData);
    for (; i < indexKeyArray.length; i++) {
      var item = tabularData[indexKeyArray[i]];
      var primitive = item === null || typeof item !== 'function' && typeof item !== 'object';
      if (properties === undefined && primitive) {
        hasPrimitives = true;
        valuesKeyArray[i] = _inspect(item);
      } else {
        var _keys2 = properties || ObjectKeys(item);
        for (var key of _keys2) {
          map[key] ??= [];
          if (primitive && properties || !ObjectPrototypeHasOwnProperty(item, key)) map[key][i] = '';else map[key][i] = _inspect(item[key]);
        }
      }
    }
    var keys = ObjectKeys(map);
    var values = ObjectValues(map);
    if (hasPrimitives) {
      ArrayPrototypePush(keys, valuesKey);
      ArrayPrototypePush(values, valuesKeyArray);
    }
    ArrayPrototypeUnshift(keys, indexKey);
    ArrayPrototypeUnshift(values, indexKeyArray);
    return final(keys, values);
  }
};
var keyKey = 'Key';
var valuesKey = 'Values';
var indexKey = '(index)';
var iterKey = '(iteration index)';
var isArray = v => ArrayIsArray(v) || isTypedArray(v) || isBuffer(v);
function noop() {}
for (var method of ReflectOwnKeys(consoleMethods)) Console.prototype[method] = consoleMethods[method];
Console.prototype.dirxml = Console.prototype.log;
Console.prototype.groupCollapsed = Console.prototype.group;
function initializeGlobalConsole(globalConsole) {
  globalConsole[kBindStreamsLazy](process);
  var {
    namespace: {
      addSerializeCallback,
      isBuildingSnapshot
    }
  } = require('internal/v8/startup_snapshot');
  if (!internalBinding('config').hasInspector || !isBuildingSnapshot()) {
    return;
  }
  var {
    console: consoleFromVM
  } = internalBinding('inspector');
  var nodeConsoleKeys = ObjectKeys(Console.prototype);
  var vmConsoleKeys = ObjectKeys(consoleFromVM);
  var originalKeys = new SafeSet(vmConsoleKeys.concat(nodeConsoleKeys));
  var inspectorConsoleKeys = new SafeSet();
  for (var key of ObjectKeys(globalConsole)) {
    if (!originalKeys.has(key)) {
      inspectorConsoleKeys.add(key);
    }
  }
  // During deserialization these should be reinstalled to console by
  // V8 when the inspector client is created.
  addSerializeCallback(() => {
    for (var _key0 of inspectorConsoleKeys) {
      globalConsole[_key0] = undefined;
    }
  });
}
module.exports = {
  Console,
  kBindStreamsLazy,
  kBindProperties,
  initializeGlobalConsole
};

