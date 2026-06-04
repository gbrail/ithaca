'use strict';

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
  AggregateError,
  AggregateErrorPrototype,
  Array: _Array,
  ArrayBuffer,
  ArrayBufferPrototype,
  ArrayIsArray,
  ArrayPrototype,
  ArrayPrototypeFilter,
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeSlice,
  ArrayPrototypeSort,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  BigIntPrototypeValueOf,
  Boolean,
  BooleanPrototype,
  BooleanPrototypeValueOf,
  DataView,
  DataViewPrototype,
  Date,
  DatePrototype,
  DatePrototypeGetTime,
  DatePrototypeToISOString,
  DatePrototypeToString,
  Error,
  ErrorPrototype,
  ErrorPrototypeToString,
  Function,
  FunctionPrototype,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  FunctionPrototypeSymbolHasInstance,
  FunctionPrototypeToString,
  JSONStringify,
  Map,
  MapPrototype,
  MapPrototypeEntries,
  MapPrototypeGetSize,
  MathFloor,
  MathMax,
  MathMin,
  MathRound,
  MathSqrt,
  MathTrunc,
  Number: _Number,
  NumberIsFinite,
  NumberIsNaN,
  NumberParseFloat,
  NumberParseInt,
  NumberPrototype,
  NumberPrototypeToString,
  NumberPrototypeValueOf,
  Object: _Object,
  ObjectAssign,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetOwnPropertyNames,
  ObjectGetOwnPropertySymbols,
  ObjectGetPrototypeOf,
  ObjectIs,
  ObjectKeys,
  ObjectPrototype,
  ObjectPrototypeHasOwnProperty,
  ObjectPrototypePropertyIsEnumerable,
  ObjectPrototypeToString,
  ObjectSeal,
  ObjectSetPrototypeOf,
  Promise,
  PromisePrototype,
  RangeError,
  RangeErrorPrototype,
  ReflectApply,
  ReflectOwnKeys,
  RegExp,
  RegExpPrototype,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolReplace,
  RegExpPrototypeSymbolSplit,
  RegExpPrototypeToString,
  SafeMap,
  SafeSet,
  SafeStringIterator,
  Set,
  SetPrototype,
  SetPrototypeGetSize,
  SetPrototypeValues,
  String: _String,
  StringPrototype,
  StringPrototypeCharCodeAt,
  StringPrototypeCodePointAt,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  StringPrototypeIndexOf,
  StringPrototypeLastIndexOf,
  StringPrototypeNormalize,
  StringPrototypePadEnd,
  StringPrototypePadStart,
  StringPrototypeRepeat,
  StringPrototypeReplace,
  StringPrototypeReplaceAll,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  StringPrototypeToLowerCase,
  StringPrototypeValueOf,
  SymbolIterator,
  SymbolPrototypeToString,
  SymbolPrototypeValueOf,
  SymbolToPrimitive,
  SymbolToStringTag,
  TypeError: _TypeError,
  TypeErrorPrototype,
  TypedArray,
  TypedArrayPrototype,
  TypedArrayPrototypeGetLength,
  TypedArrayPrototypeGetSymbolToStringTag,
  Uint8Array,
  WeakMap,
  WeakMapPrototype,
  WeakSet,
  WeakSetPrototype,
  globalThis,
  uncurryThis
} = primordials;
var {
  constants: {
    ALL_PROPERTIES,
    ONLY_ENUMERABLE,
    kPending,
    kRejected
  },
  getOwnNonIndexProperties,
  getPromiseDetails,
  getProxyDetails,
  previewEntries,
  getConstructorName: internalGetConstructorName,
  getExternalValue
} = internalBinding('util');
var {
  customInspectSymbol,
  isError,
  join,
  removeColors
} = require('internal/util');
var {
  isStackOverflowError
} = require('internal/errors');
var {
  isAsyncFunction,
  isGeneratorFunction,
  isAnyArrayBuffer,
  isArrayBuffer,
  isArgumentsObject,
  isBoxedPrimitive,
  isDataView,
  isExternal,
  isMap,
  isMapIterator,
  isModuleNamespaceObject,
  isNativeError,
  isPromise,
  isSet,
  isSetIterator,
  isWeakMap,
  isWeakSet,
  isRegExp,
  isDate,
  isTypedArray,
  isStringObject,
  isNumberObject,
  isBooleanObject,
  isBigIntObject
} = require('internal/util/types');
var assert = require('internal/assert');
var {
  BuiltinModule
} = require('internal/bootstrap/realm');
var {
  validateObject,
  validateString,
  kValidateObjectAllowArray
} = require('internal/validators');
var hexSlice;
var internalUrl;
function pathToFileUrlHref(filepath) {
  internalUrl ??= require('internal/url');
  return internalUrl.pathToFileURL(filepath).href;
}
function isURL(value) {
  internalUrl ??= require('internal/url');
  return typeof value.href === 'string' && value instanceof internalUrl.URL;
}
var builtInObjects = new SafeSet(ArrayPrototypeFilter(ObjectGetOwnPropertyNames(globalThis), e => RegExpPrototypeExec(/^[A-Z][a-zA-Z0-9]+$/, e) !== null));

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var isUndetectableObject = v => typeof v === 'undefined' && v !== undefined;

// These options must stay in sync with `getUserOptions`. So if any option will
// be added or removed, `getUserOptions` must also be updated accordingly.
var inspectDefaultOptions = ObjectSeal({
  showHidden: false,
  depth: 2,
  colors: false,
  customInspect: true,
  showProxy: false,
  maxArrayLength: 100,
  maxStringLength: 10000,
  breakLength: 80,
  compact: 3,
  sorted: false,
  getters: false,
  numericSeparator: false
});
var kObjectType = 0;
var kArrayType = 1;
var kArrayExtrasType = 2;

/* eslint-disable no-control-regex */
var strEscapeSequencesRegExp = /[\x00-\x1f\x27\x5c\x7f-\x9f]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;
var strEscapeSequencesReplacer = /[\x00-\x1f\x27\x5c\x7f-\x9f]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g;
var strEscapeSequencesRegExpSingle = /[\x00-\x1f\x5c\x7f-\x9f]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;
var strEscapeSequencesReplacerSingle = /[\x00-\x1f\x5c\x7f-\x9f]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g;
/* eslint-enable no-control-regex */

var keyStrRegExp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
var numberRegExp = /^(0|[1-9][0-9]*)$/;
var coreModuleRegExp = /^ {4}at (?:[^/\\(]+ \(|)node:(.+):\d+:\d+\)?$/;
var classRegExp = /^(\s+[^(]*?)\s*{/;
// eslint-disable-next-line node-core/no-unescaped-regexp-dot
var stripCommentsRegExp = /(\/\/.*?\n)|(\/\*(.|\n)*?\*\/)/g;
var kMinLineLength = 16;

// Constants to map the iterator state.
var kWeak = 0;
var kIterator = 1;
var kMapEntries = 2;

// Escaped control characters (plus the single quote and the backslash). Use
// empty strings to fill up unused entries.
var meta = ['\\x00', '\\x01', '\\x02', '\\x03', '\\x04', '\\x05', '\\x06', '\\x07',
// x07
'\\b', '\\t', '\\n', '\\x0B', '\\f', '\\r', '\\x0E', '\\x0F',
// x0F
'\\x10', '\\x11', '\\x12', '\\x13', '\\x14', '\\x15', '\\x16', '\\x17',
// x17
'\\x18', '\\x19', '\\x1A', '\\x1B', '\\x1C', '\\x1D', '\\x1E', '\\x1F',
// x1F
'', '', '', '', '', '', '', "\\'", '', '', '', '', '', '', '', '',
// x2F
'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
// x3F
'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
// x4F
'', '', '', '', '', '', '', '', '', '', '', '', '\\\\', '', '', '',
// x5F
'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
// x6F
'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '\\x7F',
// x7F
'\\x80', '\\x81', '\\x82', '\\x83', '\\x84', '\\x85', '\\x86', '\\x87',
// x87
'\\x88', '\\x89', '\\x8A', '\\x8B', '\\x8C', '\\x8D', '\\x8E', '\\x8F',
// x8F
'\\x90', '\\x91', '\\x92', '\\x93', '\\x94', '\\x95', '\\x96', '\\x97',
// x97
'\\x98', '\\x99', '\\x9A', '\\x9B', '\\x9C', '\\x9D', '\\x9E', '\\x9F' // x9F
];

// Regex used for ansi escape code splitting
// Ref: https://github.com/chalk/ansi-regex/blob/f338e1814144efb950276aac84135ff86b72dc8e/index.js
// License: MIT by Sindre Sorhus <sindresorhus@gmail.com>
// Matches all ansi escape code sequences in a string
var ansi = new RegExp('[\\u001B\\u009B][[\\]()#;?]*' + '(?:(?:(?:(?:;[-a-zA-Z\\d\\/\\#&.:=?%@~_]+)*' + '|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/\\#&.:=?%@~_]*)*)?' + '(?:\\u0007|\\u001B\\u005C|\\u009C))' + '|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?' + '[\\dA-PR-TZcf-nq-uy=><~]))', 'g');
var getStringWidth;
function getUserOptions(ctx, isCrossContext) {
  var ret = _objectSpread({
    stylize: ctx.stylize,
    showHidden: ctx.showHidden,
    depth: ctx.depth,
    colors: ctx.colors,
    customInspect: ctx.customInspect,
    showProxy: ctx.showProxy,
    maxArrayLength: ctx.maxArrayLength,
    maxStringLength: ctx.maxStringLength,
    breakLength: ctx.breakLength,
    compact: ctx.compact,
    sorted: ctx.sorted,
    getters: ctx.getters,
    numericSeparator: ctx.numericSeparator
  }, ctx.userOptions);

  // Typically, the target value will be an instance of `Object`. If that is
  // *not* the case, the object may come from another vm.Context, and we want
  // to avoid passing it objects from this Context in that case, so we remove
  // the prototype from the returned object itself + the `stylize()` function,
  // and remove all other non-primitives, including non-primitive user options.
  if (isCrossContext) {
    ObjectSetPrototypeOf(ret, null);
    for (var key of ObjectKeys(ret)) {
      if ((typeof ret[key] === 'object' || typeof ret[key] === 'function') && ret[key] !== null) {
        delete ret[key];
      }
    }
    ret.stylize = ObjectSetPrototypeOf((value, flavour) => {
      var stylized;
      try {
        stylized = `${ctx.stylize(value, flavour)}`;
      } catch {
        // Continue regardless of error.
      }
      if (typeof stylized !== 'string') return value;
      // `stylized` is a string as it should be, which is safe to pass along.
      return stylized;
    }, null);
  }
  return ret;
}

/**
 * Echos the value of any input. Tries to print the value out
 * in the best way possible given the different types.
 * @param {any} value The value to print out.
 * @param {object} opts Optional options object that alters the output.
 */
/* Legacy: value, showHidden, depth, colors */
function inspect(value, opts) {
  // Default options
  var ctx = {
    budget: {},
    indentationLvl: 0,
    seen: [],
    currentDepth: 0,
    stylize: stylizeNoColor,
    showHidden: inspectDefaultOptions.showHidden,
    depth: inspectDefaultOptions.depth,
    colors: inspectDefaultOptions.colors,
    customInspect: inspectDefaultOptions.customInspect,
    showProxy: inspectDefaultOptions.showProxy,
    maxArrayLength: inspectDefaultOptions.maxArrayLength,
    maxStringLength: inspectDefaultOptions.maxStringLength,
    breakLength: inspectDefaultOptions.breakLength,
    compact: inspectDefaultOptions.compact,
    sorted: inspectDefaultOptions.sorted,
    getters: inspectDefaultOptions.getters,
    numericSeparator: inspectDefaultOptions.numericSeparator
  };
  if (arguments.length > 1) {
    // Legacy...
    if (arguments.length > 2) {
      if (arguments[2] !== undefined) {
        ctx.depth = arguments[2];
      }
      if (arguments.length > 3 && arguments[3] !== undefined) {
        ctx.colors = arguments[3];
      }
    }
    // Set user-specified options
    if (typeof opts === 'boolean') {
      ctx.showHidden = opts;
    } else if (opts) {
      var optKeys = ObjectKeys(opts);
      for (var i = 0; i < optKeys.length; ++i) {
        var key = optKeys[i];
        // TODO(BridgeAR): Find a solution what to do about stylize. Either make
        // this function public or add a new API with a similar or better
        // functionality.
        if (ObjectPrototypeHasOwnProperty(inspectDefaultOptions, key) || key === 'stylize') {
          ctx[key] = opts[key];
        } else if (ctx.userOptions === undefined) {
          // This is required to pass through the actual user input.
          ctx.userOptions = opts;
        }
      }
    }
  }
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  if (ctx.maxArrayLength === null) ctx.maxArrayLength = Infinity;
  if (ctx.maxStringLength === null) ctx.maxStringLength = Infinity;
  return formatValue(ctx, value, 0);
}
inspect.custom = customInspectSymbol;
ObjectDefineProperty(inspect, 'defaultOptions', {
  __proto__: null,
  get() {
    return inspectDefaultOptions;
  },
  set(options) {
    validateObject(options, 'options');
    return ObjectAssign(inspectDefaultOptions, options);
  }
});

// Set Graphics Rendition https://en.wikipedia.org/wiki/ANSI_escape_code#graphics
// Each color consists of an array with the color code as first entry and the
// reset code as second entry.
var defaultFG = 39;
var defaultBG = 49;
inspect.colors = {
  __proto__: null,
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  // Alias: faint
  italic: [3, 23],
  underline: [4, 24],
  blink: [5, 25],
  // Swap foreground and background colors
  inverse: [7, 27],
  // Alias: swapcolors, swapColors
  hidden: [8, 28],
  // Alias: conceal
  strikethrough: [9, 29],
  // Alias: strikeThrough, crossedout, crossedOut
  doubleunderline: [21, 24],
  // Alias: doubleUnderline
  black: [30, defaultFG],
  red: [31, defaultFG],
  green: [32, defaultFG],
  yellow: [33, defaultFG],
  blue: [34, defaultFG],
  magenta: [35, defaultFG],
  cyan: [36, defaultFG],
  white: [37, defaultFG],
  bgBlack: [40, defaultBG],
  bgRed: [41, defaultBG],
  bgGreen: [42, defaultBG],
  bgYellow: [43, defaultBG],
  bgBlue: [44, defaultBG],
  bgMagenta: [45, defaultBG],
  bgCyan: [46, defaultBG],
  bgWhite: [47, defaultBG],
  framed: [51, 54],
  overlined: [53, 55],
  gray: [90, defaultFG],
  // Alias: grey, blackBright
  redBright: [91, defaultFG],
  greenBright: [92, defaultFG],
  yellowBright: [93, defaultFG],
  blueBright: [94, defaultFG],
  magentaBright: [95, defaultFG],
  cyanBright: [96, defaultFG],
  whiteBright: [97, defaultFG],
  bgGray: [100, defaultBG],
  // Alias: bgGrey, bgBlackBright
  bgRedBright: [101, defaultBG],
  bgGreenBright: [102, defaultBG],
  bgYellowBright: [103, defaultBG],
  bgBlueBright: [104, defaultBG],
  bgMagentaBright: [105, defaultBG],
  bgCyanBright: [106, defaultBG],
  bgWhiteBright: [107, defaultBG]
};
function defineColorAlias(target, alias) {
  ObjectDefineProperty(inspect.colors, alias, {
    __proto__: null,
    get() {
      return this[target];
    },
    set(value) {
      this[target] = value;
    },
    configurable: true,
    enumerable: false
  });
}
defineColorAlias('gray', 'grey');
defineColorAlias('gray', 'blackBright');
defineColorAlias('bgGray', 'bgGrey');
defineColorAlias('bgGray', 'bgBlackBright');
defineColorAlias('dim', 'faint');
defineColorAlias('strikethrough', 'crossedout');
defineColorAlias('strikethrough', 'strikeThrough');
defineColorAlias('strikethrough', 'crossedOut');
defineColorAlias('hidden', 'conceal');
defineColorAlias('inverse', 'swapColors');
defineColorAlias('inverse', 'swapcolors');
defineColorAlias('doubleunderline', 'doubleUnderline');

// Don't use 'blue' not visible on cmd.exe
inspect.styles = ObjectAssign({
  __proto__: null
}, {
  special: 'cyan',
  number: 'yellow',
  bigint: 'yellow',
  boolean: 'yellow',
  undefined: 'grey',
  null: 'bold',
  string: 'green',
  symbol: 'green',
  date: 'magenta',
  // "name": intentionally not styling
  regexp: highlightRegExp,
  module: 'underline'
});

// Define the palette for RegExp group depth highlighting. Can be changed by users.
inspect.styles.regexp.colors = ['green', 'red', 'yellow', 'cyan', 'magenta'];
var highlightRegExpColors = inspect.styles.regexp.colors.slice();

/**
 * Colorize a JavaScript RegExp pattern per ECMAScript grammar.
 * This is a tolerant single-pass highlighter using heuristics in some cases.
 * It supports: groups (named/unnamed, lookaround), assertions, alternation,
 * quantifiers, escapes (incl. Unicode properties), character classes and
 * backreferences.
 * @param {string} regexpString
 * @returns {string}
 */
function highlightRegExp(regexpString) {
  var out = '';
  var i = 0;
  var depth = 0;
  var inClass = false;

  // TODO(BridgeAR): Add group type tracking. That allows to increase the depth
  // in case the same type is next to each other.
  // let groupType = 0;

  // Verify palette and update cache if user changed colors
  var paletteNames = highlightRegExp.colors?.length > 0 ? highlightRegExp.colors : highlightRegExpColors;
  var palette = paletteNames.reduce((acc, name) => {
    var color = inspect.colors[name];
    if (color) acc.push([`\u001b[${color[0]}m`, `\u001b[${color[1]}m`]);
    return acc;
  }, []);
  function writeGroup(start, end) {
    var decreaseDepth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var seq = '';
    i++;
    // Only checking for the closing delimiter is a fast heuristic for regular
    // expressions without the u or v flag. A safer check would verify that the
    // read characters are all alphanumeric.
    while (i < regexpString.length && regexpString[i] !== end) {
      seq += regexpString[i++];
    }
    if (i < regexpString.length) {
      depth -= decreaseDepth;
      write(start);
      writeDepth(seq, 1, 1);
      write(end);
      depth += decreaseDepth;
    } else {
      // The group is not closed which would lead to mistakes in the output.
      // This is a workaround to prevent output from being corrupted.
      writeDepth(start, 1, -seq.length);
    }
  }
  var write = str => {
    var idx = depth % palette.length;
    // Safeguard against bugs in the implementation.
    var color = palette[idx] ?? palette[0];
    out += color[0] + str + color[1];
    return idx;
  };
  function writeDepth(str, incDepth, incI) {
    depth += incDepth;
    write(str);
    depth -= incDepth;
    i += incI;
  }

  // Opening '/'
  write('/');
  depth++;
  i = 1;

  // Parse pattern until next unescaped '/'
  while (i < regexpString.length) {
    var ch = regexpString[i];
    if (inClass) {
      if (ch === '\\') {
        var seq = '\\';
        i++;
        if (i < regexpString.length) {
          seq += regexpString[i++];
          var next = seq[1];
          if (next === 'u' && regexpString[i] === '{') {
            writeGroup(`${seq}{`, '}', 0);
            continue;
          } else if ((next === 'p' || next === 'P') && regexpString[i] === '{') {
            writeGroup(`${seq}{`, '}', 0);
            continue;
          } else if (seq[1] === 'x') {
            seq += regexpString.slice(i, i + 2);
            i += 2;
          }
        }
        write(seq);
      } else if (ch === ']') {
        depth--;
        write(']');
        i++;
        inClass = false;
      } else if (ch === '-' && regexpString[i - 1] !== '[' && i + 1 < regexpString.length && regexpString[i + 1] !== ']') {
        writeDepth('-', 1, 1);
      } else {
        write(ch);
        i++;
      }
    } else if (ch === '[') {
      // Enter class
      write('[');
      depth++;
      i++;
      inClass = true;
    } else if (ch === '(') {
      write('(');
      depth++;
      i++;
      if (i < regexpString.length && regexpString[i] === '?') {
        // Assertions and named groups
        i++;
        var a = i < regexpString.length ? regexpString[i] : '';
        if (a === ':' || a === '=' || a === '!') {
          writeDepth(`?${a}`, -1, 1);
        } else {
          var b = i + 1 < regexpString.length ? regexpString[i + 1] : '';
          if (a === '<' && (b === '=' || b === '!')) {
            writeDepth(`?<${b}`, -1, 2);
          } else if (a === '<') {
            // Named capture: write '?<name>' as a single colored token
            i++; // consume '<'
            var start = i;
            while (i < regexpString.length && regexpString[i] !== '>') {
              i++;
            }
            var name = regexpString.slice(start, i);
            if (i < regexpString.length && regexpString[i] === '>') {
              depth--;
              write('?<');
              writeDepth(name, 1, 0);
              write('>');
              depth++;
              i++;
            } else {
              writeDepth('?<', -1, 0);
              write(name);
            }
          } else {
            write('?');
          }
        }
      }
    } else if (ch === ')') {
      depth--;
      write(')');
      i++;
    } else if (ch === '\\') {
      var _seq = '\\';
      i++;
      if (i < regexpString.length) {
        _seq += regexpString[i++];
        var _next = _seq[1];
        if (i < regexpString.length) {
          if (_next === 'u' && regexpString[i] === '{') {
            writeGroup(`${_seq}{`, '}', 0);
            continue;
          } else if (_next === 'x') {
            _seq += regexpString.slice(i, i + 2);
            i += 2;
          } else if (_next >= '0' && _next <= '9') {
            while (i < regexpString.length && regexpString[i] >= '0' && regexpString[i] <= '9') {
              _seq += regexpString[i++];
            }
          } else if (_next === 'k' && regexpString[i] === '<') {
            writeGroup(`${_seq}<`, '>');
            continue;
          } else if ((_next === 'p' || _next === 'P') && regexpString[i] === '{') {
            // Unicode properties
            writeGroup(`${_seq}{`, '}', 0);
            continue;
          }
        }
      }
      writeDepth(_seq, 1, 0);
    } else if (ch === '|' || ch === '+' || ch === '*' || ch === '?' || ch === ',' || ch === '^' || ch === '$') {
      writeDepth(ch, 3, 1);
    } else if (ch === '{') {
      i++;
      var digits = '';
      while (i < regexpString.length && regexpString[i] >= '0' && regexpString[i] <= '9') {
        digits += regexpString[i++];
      }
      if (digits) {
        write('{');
        depth++;
        writeDepth(digits, 1, 0);
      }
      if (i < regexpString.length) {
        if (regexpString[i] === ',') {
          if (!digits) {
            write('{');
            depth++;
          }
          write(',');
          i++;
        } else if (!digits) {
          depth += 1;
          write('{');
          depth -= 1;
          continue;
        }
      }
      var digits2 = '';
      while (i < regexpString.length && regexpString[i] >= '0' && regexpString[i] <= '9') {
        digits2 += regexpString[i++];
      }
      if (digits2) {
        writeDepth(digits2, 1, 0);
      }
      if (i < regexpString.length && regexpString[i] === '}') {
        depth--;
        write('}');
        i++;
      }
      if (i < regexpString.length && regexpString[i] === '?') {
        writeDepth('?', 3, 1);
      }
    } else if (ch === '.') {
      writeDepth(ch, 2, 1);
    } else if (ch === '/') {
      // Stop at closing delimiter (unescaped, outside of character class)
      break;
    } else {
      writeDepth(ch, 1, 1);
    }
  }

  // Closing delimiter and flags
  writeDepth('/', -1, 1);
  if (i < regexpString.length) {
    write(regexpString.slice(i));
  }
  return out;
}
function addQuotes(str, quotes) {
  if (quotes === -1) {
    return `"${str}"`;
  }
  if (quotes === -2) {
    return `\`${str}\``;
  }
  return `'${str}'`;
}
function escapeFn(str) {
  var charCode = StringPrototypeCharCodeAt(str);
  return meta.length > charCode ? meta[charCode] : `\\u${NumberPrototypeToString(charCode, 16)}`;
}

// Escape control characters, single quotes and the backslash.
// This is similar to JSON stringify escaping.
function strEscape(str) {
  var escapeTest = strEscapeSequencesRegExp;
  var escapeReplace = strEscapeSequencesReplacer;
  var singleQuote = 39;

  // Check for double quotes. If not present, do not escape single quotes and
  // instead wrap the text in double quotes. If double quotes exist, check for
  // backticks. If they do not exist, use those as fallback instead of the
  // double quotes.
  if (StringPrototypeIncludes(str, "'")) {
    // This invalidates the charCode and therefore can not be matched for
    // anymore.
    if (!StringPrototypeIncludes(str, '"')) {
      singleQuote = -1;
    } else if (!StringPrototypeIncludes(str, '`') && !StringPrototypeIncludes(str, '${')) {
      singleQuote = -2;
    }
    if (singleQuote !== 39) {
      escapeTest = strEscapeSequencesRegExpSingle;
      escapeReplace = strEscapeSequencesReplacerSingle;
    }
  }

  // Some magic numbers that worked out fine while benchmarking with v8 6.0
  if (str.length < 5000 && RegExpPrototypeExec(escapeTest, str) === null) return addQuotes(str, singleQuote);
  if (str.length > 100) {
    str = RegExpPrototypeSymbolReplace(escapeReplace, str, escapeFn);
    return addQuotes(str, singleQuote);
  }
  var result = '';
  var last = 0;
  for (var i = 0; i < str.length; i++) {
    var point = StringPrototypeCharCodeAt(str, i);
    if (point === singleQuote || point === 92 || point < 32 || point > 126 && point < 160) {
      if (last === i) {
        result += meta[point];
      } else {
        result += `${StringPrototypeSlice(str, last, i)}${meta[point]}`;
      }
      last = i + 1;
    } else if (point >= 0xd800 && point <= 0xdfff) {
      if (point <= 0xdbff && i + 1 < str.length) {
        var _point = StringPrototypeCharCodeAt(str, i + 1);
        if (_point >= 0xdc00 && _point <= 0xdfff) {
          i++;
          continue;
        }
      }
      result += `${StringPrototypeSlice(str, last, i)}\\u${NumberPrototypeToString(point, 16)}`;
      last = i + 1;
    }
  }
  if (last !== str.length) {
    result += StringPrototypeSlice(str, last);
  }
  return addQuotes(result, singleQuote);
}
function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];
  if (style !== undefined) {
    var color = inspect.colors[style];
    if (color !== undefined) {
      return `\u001b[${color[0]}m${str}\u001b[${color[1]}m`;
    }
    if (typeof style === 'function') {
      return style(str);
    }
  }
  return str;
}
function stylizeNoColor(str) {
  return str;
}

// Return a new empty array to push in the results of the default formatter.
function getEmptyFormatArray() {
  return [];
}
function isInstanceof(object, proto) {
  try {
    return object instanceof proto;
  } catch {
    return false;
  }
}

// Special-case for some builtin prototypes in case their `constructor` property has been tampered.
var wellKnownPrototypes = new SafeMap().set(ArrayPrototype, {
  name: 'Array',
  constructor: _Array
}).set(ArrayBufferPrototype, {
  name: 'ArrayBuffer',
  constructor: ArrayBuffer
}).set(FunctionPrototype, {
  name: 'Function',
  constructor: Function
}).set(MapPrototype, {
  name: 'Map',
  constructor: Map
}).set(SetPrototype, {
  name: 'Set',
  constructor: Set
}).set(ObjectPrototype, {
  name: 'Object',
  constructor: _Object
}).set(TypedArrayPrototype, {
  name: 'TypedArray',
  constructor: TypedArray
}).set(RegExpPrototype, {
  name: 'RegExp',
  constructor: RegExp
}).set(DatePrototype, {
  name: 'Date',
  constructor: Date
}).set(DataViewPrototype, {
  name: 'DataView',
  constructor: DataView
}).set(ErrorPrototype, {
  name: 'Error',
  constructor: Error
}).set(AggregateErrorPrototype, {
  name: 'AggregateError',
  constructor: AggregateError
}).set(RangeErrorPrototype, {
  name: 'RangeError',
  constructor: RangeError
}).set(TypeErrorPrototype, {
  name: 'TypeError',
  constructor: _TypeError
}).set(BooleanPrototype, {
  name: 'Boolean',
  constructor: Boolean
}).set(NumberPrototype, {
  name: 'Number',
  constructor: _Number
}).set(StringPrototype, {
  name: 'String',
  constructor: _String
}).set(PromisePrototype, {
  name: 'Promise',
  constructor: Promise
}).set(WeakMapPrototype, {
  name: 'WeakMap',
  constructor: WeakMap
}).set(WeakSetPrototype, {
  name: 'WeakSet',
  constructor: WeakSet
});
function getConstructorName(obj, ctx, recurseTimes, protoProps) {
  var firstProto;
  var tmp = obj;
  while (obj || isUndetectableObject(obj)) {
    var wellKnownPrototypeNameAndConstructor = wellKnownPrototypes.get(obj);
    if (wellKnownPrototypeNameAndConstructor !== undefined) {
      var {
        name,
        constructor
      } = wellKnownPrototypeNameAndConstructor;
      if (FunctionPrototypeSymbolHasInstance(constructor, tmp)) {
        if (protoProps !== undefined && firstProto !== obj) {
          addPrototypeProperties(ctx, tmp, firstProto || tmp, recurseTimes, protoProps);
        }
        return name;
      }
    }
    var descriptor = ObjectGetOwnPropertyDescriptor(obj, 'constructor');
    if (descriptor !== undefined && typeof descriptor.value === 'function' && descriptor.value.name !== '' && isInstanceof(tmp, descriptor.value)) {
      if (protoProps !== undefined && (firstProto !== obj || !builtInObjects.has(descriptor.value.name))) {
        addPrototypeProperties(ctx, tmp, firstProto || tmp, recurseTimes, protoProps);
      }
      return _String(descriptor.value.name);
    }
    obj = ObjectGetPrototypeOf(obj);
    if (firstProto === undefined) {
      firstProto = obj;
    }
  }
  if (firstProto === null) {
    return null;
  }
  var res = internalGetConstructorName(tmp);
  if (recurseTimes > ctx.depth && ctx.depth !== null) {
    return `${res} <Complex prototype>`;
  }
  var protoConstr = getConstructorName(firstProto, ctx, recurseTimes + 1, protoProps);
  if (protoConstr === null) {
    return `${res} <${inspect(firstProto, _objectSpread(_objectSpread({}, ctx), {}, {
      customInspect: false,
      depth: -1
    }))}>`;
  }
  return `${res} <${protoConstr}>`;
}

// This function has the side effect of adding prototype properties to the
// `output` argument (which is an array). This is intended to highlight user
// defined prototype properties.
function addPrototypeProperties(ctx, main, obj, recurseTimes, output) {
  var depth = 0;
  var keys;
  var keySet;
  do {
    if (depth !== 0 || main === obj) {
      obj = ObjectGetPrototypeOf(obj);
      // Stop as soon as a null prototype is encountered.
      if (obj === null) {
        return;
      }
      // Stop as soon as a built-in object type is detected.
      var descriptor = ObjectGetOwnPropertyDescriptor(obj, 'constructor');
      if (descriptor !== undefined && typeof descriptor.value === 'function' && builtInObjects.has(descriptor.value.name)) {
        return;
      }
    }
    if (depth === 0) {
      keySet = new SafeSet();
    } else {
      ArrayPrototypeForEach(keys, key => keySet.add(key));
    }
    // Get all own property names and symbols.
    keys = ReflectOwnKeys(obj);
    ArrayPrototypePush(ctx.seen, main);
    for (var key of keys) {
      // Ignore the `constructor` property and keys that exist on layers above.
      if (key === 'constructor' || ObjectPrototypeHasOwnProperty(main, key) || depth !== 0 && keySet.has(key)) {
        continue;
      }
      var desc = ObjectGetOwnPropertyDescriptor(obj, key);
      if (typeof desc.value === 'function') {
        continue;
      }
      var value = formatProperty(ctx, obj, recurseTimes, key, kObjectType, desc, main);
      if (ctx.colors) {
        // Faint!
        ArrayPrototypePush(output, `\u001b[2m${value}\u001b[22m`);
      } else {
        ArrayPrototypePush(output, value);
      }
    }
    ArrayPrototypePop(ctx.seen);
    // Limit the inspection to up to three prototype layers. Using `recurseTimes`
    // is not a good choice here, because it's as if the properties are declared
    // on the current object from the users perspective.
  } while (++depth !== 3);
}

/** @type {(constructor: string, tag: string, fallback: string, size?: string) => string} */
function getPrefix(constructor, tag, fallback) {
  var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  if (constructor === null) {
    if (tag !== '' && fallback !== tag) {
      return `[${fallback}${size}: null prototype] [${tag}] `;
    }
    return `[${fallback}${size}: null prototype] `;
  }
  var result = `${constructor}${size} `;
  if (tag !== '') {
    var position = constructor.indexOf(tag);
    if (position === -1) {
      result += `[${tag}] `;
    } else {
      var endPos = position + tag.length;
      if (endPos !== constructor.length && constructor[endPos] === constructor[endPos].toLowerCase()) {
        result += `[${tag}] `;
      }
    }
  }
  return result;
}

// Look up the keys of the object.
function getKeys(value, showHidden) {
  var keys;
  var symbols = ObjectGetOwnPropertySymbols(value);
  if (showHidden) {
    keys = ObjectGetOwnPropertyNames(value);
    if (symbols.length !== 0) ArrayPrototypePushApply(keys, symbols);
  } else {
    // This might throw if `value` is a Module Namespace Object from an
    // unevaluated module, but we don't want to perform the actual type
    // check because it's expensive.
    // TODO(devsnek): track https://github.com/tc39/ecma262/issues/1209
    // and modify this logic as needed.
    try {
      keys = ObjectKeys(value);
    } catch (err) {
      assert(isNativeError(err) && err.name === 'ReferenceError' && isModuleNamespaceObject(value));
      keys = ObjectGetOwnPropertyNames(value);
    }
    if (symbols.length !== 0) {
      var filter = key => ObjectPrototypePropertyIsEnumerable(value, key);
      ArrayPrototypePushApply(keys, ArrayPrototypeFilter(symbols, filter));
    }
  }
  return keys;
}
function getCtxStyle(value, constructor, tag) {
  var fallback = '';
  if (constructor === null) {
    fallback = internalGetConstructorName(value);
    if (fallback === tag) {
      fallback = 'Object';
    }
  }
  return getPrefix(constructor, tag, fallback);
}
function formatProxy(ctx, proxy, recurseTimes) {
  if (recurseTimes > ctx.depth && ctx.depth !== null) {
    return ctx.stylize('Proxy [Array]', 'special');
  }
  recurseTimes += 1;
  ctx.indentationLvl += 2;
  var res = [formatValue(ctx, proxy[0], recurseTimes), formatValue(ctx, proxy[1], recurseTimes)];
  ctx.indentationLvl -= 2;
  return reduceToSingleString(ctx, res, '', ['Proxy [', ']'], kArrayExtrasType, recurseTimes);
}

// Note: using `formatValue` directly requires the indentation level to be
// corrected by setting `ctx.indentationLvL += diff` and then to decrease the
// value afterwards again.
function formatValue(ctx, value, recurseTimes, typedArray) {
  // Primitive types cannot have properties.
  if (typeof value !== 'object' && typeof value !== 'function' && !isUndetectableObject(value)) {
    return formatPrimitive(ctx.stylize, value, ctx);
  }
  if (value === null) {
    return ctx.stylize('null', 'null');
  }

  // Memorize the context for custom inspection on proxies.
  var context = value;
  var proxies = 0;
  // Always check for proxies to prevent side effects and to prevent triggering
  // any proxy handlers.
  var proxy = getProxyDetails(value, !!ctx.showProxy);
  if (proxy !== undefined) {
    if (ctx.showProxy) {
      if (proxy[0] === null) {
        return ctx.stylize('<Revoked Proxy>', 'special');
      }
      return formatProxy(ctx, proxy, recurseTimes);
    }
    do {
      if (proxy === null) {
        var _formatted = ctx.stylize('<Revoked Proxy>', 'special');
        for (var i = 0; i < proxies; i++) {
          _formatted = `${ctx.stylize('Proxy(', 'special')}${_formatted}${ctx.stylize(')', 'special')}`;
        }
        return _formatted;
      }
      value = proxy;
      proxy = getProxyDetails(value, false);
      proxies += 1;
    } while (proxy !== undefined);
  }

  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it.
  if (ctx.customInspect) {
    var maybeCustom = value[customInspectSymbol];
    if (typeof maybeCustom === 'function' &&
    // Filter out the util module, its inspect function is special.
    maybeCustom !== inspect &&
    // Also filter out any prototype objects using the circular check.
    ObjectGetOwnPropertyDescriptor(value, 'constructor')?.value?.prototype !== value) {
      // This makes sure the recurseTimes are reported as before while using
      // a counter internally.
      var depth = ctx.depth === null ? null : ctx.depth - recurseTimes;
      var isCrossContext = proxies !== 0 || !FunctionPrototypeSymbolHasInstance(_Object, context);
      var ret = FunctionPrototypeCall(maybeCustom, context, depth, getUserOptions(ctx, isCrossContext), inspect);
      // If the custom inspection method returned `this`, don't go into
      // infinite recursion.
      if (ret !== context) {
        if (typeof ret !== 'string') {
          return formatValue(ctx, ret, recurseTimes);
        }
        return StringPrototypeReplaceAll(ret, '\n', `\n${StringPrototypeRepeat(' ', ctx.indentationLvl)}`);
      }
    }
  }

  // Using an array here is actually better for the average case than using
  // a Set. `seen` will only check for the depth and will never grow too large.
  if (ctx.seen.includes(value)) {
    var index = 1;
    if (ctx.circular === undefined) {
      ctx.circular = new SafeMap();
      ctx.circular.set(value, index);
    } else {
      index = ctx.circular.get(value);
      if (index === undefined) {
        index = ctx.circular.size + 1;
        ctx.circular.set(value, index);
      }
    }
    return ctx.stylize(`[Circular *${index}]`, 'special');
  }
  var formatted = formatRaw(ctx, value, recurseTimes, typedArray);
  if (proxies !== 0) {
    for (var _i = 0; _i < proxies; _i++) {
      formatted = `${ctx.stylize('Proxy(', 'special')}${formatted}${ctx.stylize(')', 'special')}`;
    }
  }
  return formatted;
}
function formatRaw(ctx, value, recurseTimes, typedArray) {
  var keys;
  var protoProps;
  if (ctx.showHidden && (recurseTimes <= ctx.depth || ctx.depth === null)) {
    protoProps = [];
  }
  var constructor = getConstructorName(value, ctx, recurseTimes, protoProps);
  // Reset the variable to check for this later on.
  if (protoProps !== undefined && protoProps.length === 0) {
    protoProps = undefined;
  }
  var tag = '';
  try {
    tag = value[SymbolToStringTag];
  } catch {
    // Ignore error.
  }

  // Only list the tag in case it's non-enumerable / not an own property.
  // Otherwise we'd print this twice.
  if (typeof tag !== 'string' || tag !== '' && (ctx.showHidden ? ObjectPrototypeHasOwnProperty : ObjectPrototypePropertyIsEnumerable)(value, SymbolToStringTag)) {
    tag = '';
  }
  var base = '';
  var formatter = getEmptyFormatArray;
  var braces;
  var noIterator = true;
  var i = 0;
  var filter = ctx.showHidden ? ALL_PROPERTIES : ONLY_ENUMERABLE;
  var extrasType = kObjectType;
  var extraKeys;

  // Iterators and the rest are split to reduce checks.
  // We have to check all values in case the constructor is set to null.
  // Otherwise it would not possible to identify all types properly.
  if (SymbolIterator in value || constructor === null) {
    noIterator = false;
    if (ArrayIsArray(value)) {
      // Only set the constructor for non ordinary ("Array [...]") arrays.
      var prefix = constructor !== 'Array' || tag !== '' ? getPrefix(constructor, tag, 'Array', `(${value.length})`) : '';
      keys = getOwnNonIndexProperties(value, filter);
      braces = [`${prefix}[`, ']'];
      if (value.length === 0 && keys.length === 0 && protoProps === undefined) return `${braces[0]}]`;
      extrasType = kArrayExtrasType;
      formatter = formatArray;
    } else if (isSet(value)) {
      var size = SetPrototypeGetSize(value);
      var _prefix = getPrefix(constructor, tag, 'Set', `(${size})`);
      keys = getKeys(value, ctx.showHidden);
      formatter = constructor !== null ? FunctionPrototypeBind(formatSet, null, value) : FunctionPrototypeBind(formatSet, null, SetPrototypeValues(value));
      if (size === 0 && keys.length === 0 && protoProps === undefined) return `${_prefix}{}`;
      braces = [`${_prefix}{`, '}'];
    } else if (isMap(value)) {
      var _size = MapPrototypeGetSize(value);
      var _prefix2 = getPrefix(constructor, tag, 'Map', `(${_size})`);
      keys = getKeys(value, ctx.showHidden);
      formatter = constructor !== null ? FunctionPrototypeBind(formatMap, null, value) : FunctionPrototypeBind(formatMap, null, MapPrototypeEntries(value));
      if (_size === 0 && keys.length === 0 && protoProps === undefined) return `${_prefix2}{}`;
      braces = [`${_prefix2}{`, '}'];
    } else if (isTypedArray(value)) {
      keys = getOwnNonIndexProperties(value, filter);
      var bound = value;
      var fallback = '';
      if (constructor === null) {
        fallback = TypedArrayPrototypeGetSymbolToStringTag(value);
        // Reconstruct the array information.
        bound = new primordials[fallback](value);
      }
      var _size2 = TypedArrayPrototypeGetLength(value);
      var _prefix3 = getPrefix(constructor, tag, fallback, `(${_size2})`);
      braces = [`${_prefix3}[`, ']'];
      if (value.length === 0 && keys.length === 0 && !ctx.showHidden) return `${braces[0]}]`;
      // Special handle the value. The original value is required below. The
      // bound function is required to reconstruct missing information.
      formatter = FunctionPrototypeBind(formatTypedArray, null, bound, _size2);
      extrasType = kArrayExtrasType;
      if (ctx.showHidden) {
        extraKeys = ['BYTES_PER_ELEMENT', 'length', 'byteLength', 'byteOffset', 'buffer'];
        typedArray = true;
      }
    } else if (isMapIterator(value)) {
      keys = getKeys(value, ctx.showHidden);
      braces = getIteratorBraces('Map', tag);
      // Add braces to the formatter parameters.
      formatter = FunctionPrototypeBind(formatIterator, null, braces);
    } else if (isSetIterator(value)) {
      keys = getKeys(value, ctx.showHidden);
      braces = getIteratorBraces('Set', tag);
      // Add braces to the formatter parameters.
      formatter = FunctionPrototypeBind(formatIterator, null, braces);
    } else {
      noIterator = true;
    }
  }
  if (noIterator) {
    keys = getKeys(value, ctx.showHidden);
    braces = ['{', '}'];
    if (typeof value === 'function') {
      base = getFunctionBase(ctx, value, constructor, tag);
      if (keys.length === 0 && protoProps === undefined) return ctx.stylize(base, 'special');
    } else if (constructor === 'Object') {
      if (isArgumentsObject(value)) {
        braces[0] = '[Arguments] {';
      } else if (tag !== '') {
        braces[0] = `${getPrefix(constructor, tag, 'Object')}{`;
      }
      if (keys.length === 0 && protoProps === undefined) {
        return `${braces[0]}}`;
      }
    } else if (isRegExp(value)) {
      // Make RegExps say that they are RegExps
      base = RegExpPrototypeToString(constructor !== null ? value : new RegExp(value));
      var _prefix4 = getPrefix(constructor, tag, 'RegExp');
      if (_prefix4 !== 'RegExp ') base = `${_prefix4}${base}`;
      base = ctx.stylize(base, 'regexp');
      if (keys.length === 0 && protoProps === undefined || recurseTimes > ctx.depth && ctx.depth !== null) {
        return base;
      }
    } else if (isDate(value)) {
      // Make dates with properties first say the date
      base = NumberIsNaN(DatePrototypeGetTime(value)) ? DatePrototypeToString(value) : DatePrototypeToISOString(value);
      var _prefix5 = getPrefix(constructor, tag, 'Date');
      if (_prefix5 !== 'Date ') base = `${_prefix5}${base}`;
      if (keys.length === 0 && protoProps === undefined) {
        return ctx.stylize(base, 'date');
      }
    } else if (isError(value)) {
      base = formatError(value, constructor, tag, ctx, keys);
      if (keys.length === 0 && protoProps === undefined) return base;
    } else if (isAnyArrayBuffer(value)) {
      // Fast path for ArrayBuffer and SharedArrayBuffer.
      // Can't do the same for DataView because it has a non-primitive
      // .buffer property that we need to recurse for.
      var arrayType = isArrayBuffer(value) ? 'ArrayBuffer' : 'SharedArrayBuffer';
      var _prefix6 = getPrefix(constructor, tag, arrayType);
      if (typedArray === undefined) {
        formatter = formatArrayBuffer;
      } else if (keys.length === 0 && protoProps === undefined) {
        return _prefix6 + `{ [byteLength]: ${formatNumber(ctx.stylize, value.byteLength, false)} }`;
      }
      braces[0] = `${_prefix6}{`;
      extraKeys = ['byteLength'];
    } else if (isDataView(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'DataView')}{`;
      // .buffer goes last, it's not a primitive like the others.
      extraKeys = ['byteLength', 'byteOffset', 'buffer'];
    } else if (isPromise(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'Promise')}{`;
      formatter = formatPromise;
    } else if (isWeakSet(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'WeakSet')}{`;
      formatter = ctx.showHidden ? formatWeakSet : formatWeakCollection;
    } else if (isWeakMap(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'WeakMap')}{`;
      formatter = ctx.showHidden ? formatWeakMap : formatWeakCollection;
    } else if (isModuleNamespaceObject(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'Module')}{`;
      // Special handle keys for namespace objects.
      formatter = formatNamespaceObject.bind(null, keys);
    } else if (isBoxedPrimitive(value)) {
      base = getBoxedBase(value, ctx, keys, constructor, tag);
      if (keys.length === 0 && protoProps === undefined) {
        return base;
      }
    } else if (isURL(value) && !(recurseTimes > ctx.depth && ctx.depth !== null)) {
      base = value.href;
      if (keys.length === 0 && protoProps === undefined) {
        return base;
      }
    } else {
      if (keys.length === 0 && protoProps === undefined) {
        if (isExternal(value)) {
          var address = getExternalValue(value).toString(16);
          return ctx.stylize(`[External: ${address}]`, 'special');
        }
        return `${getCtxStyle(value, constructor, tag)}{}`;
      }
      braces[0] = `${getCtxStyle(value, constructor, tag)}{`;
    }
  }
  if (recurseTimes > ctx.depth && ctx.depth !== null) {
    var constructorName = StringPrototypeSlice(getCtxStyle(value, constructor, tag), 0, -1);
    if (constructor !== null) constructorName = `[${constructorName}]`;
    return ctx.stylize(constructorName, 'special');
  }
  recurseTimes += 1;
  ctx.seen.push(value);
  ctx.currentDepth = recurseTimes;
  var output;
  var indentationLvl = ctx.indentationLvl;
  try {
    output = formatter(ctx, value, recurseTimes);
    if (extraKeys !== undefined) {
      for (i = 0; i < extraKeys.length; i++) {
        var formatted = void 0;
        try {
          formatted = formatExtraProperties(ctx, value, recurseTimes, extraKeys[i], typedArray);
        } catch {
          var tempValue = {
            [extraKeys[i]]: value.buffer[extraKeys[i]]
          };
          formatted = formatExtraProperties(ctx, tempValue, recurseTimes, extraKeys[i], typedArray);
        }
        ArrayPrototypePush(output, formatted);
      }
    }
    for (i = 0; i < keys.length; i++) {
      ArrayPrototypePush(output, formatProperty(ctx, value, recurseTimes, keys[i], extrasType));
    }
    if (protoProps !== undefined) {
      ArrayPrototypePushApply(output, protoProps);
    }
  } catch (err) {
    if (!isStackOverflowError(err)) throw err;
    var _constructorName = StringPrototypeSlice(getCtxStyle(value, constructor, tag), 0, -1);
    return handleMaxCallStackSize(ctx, err, _constructorName, indentationLvl);
  }
  if (ctx.circular !== undefined) {
    var index = ctx.circular.get(value);
    if (index !== undefined) {
      var reference = ctx.stylize(`<ref *${index}>`, 'special');
      // Add reference always to the very beginning of the output.
      if (ctx.compact !== true) {
        base = base === '' ? reference : `${reference} ${base}`;
      } else {
        braces[0] = `${reference} ${braces[0]}`;
      }
    }
  }
  ctx.seen.pop();
  if (ctx.sorted) {
    var comparator = ctx.sorted === true ? undefined : ctx.sorted;
    if (extrasType === kObjectType) {
      ArrayPrototypeSort(output, comparator);
    } else if (keys.length > 1) {
      var sorted = ArrayPrototypeSort(ArrayPrototypeSlice(output, output.length - keys.length), comparator);
      ArrayPrototypeUnshift(sorted, output, output.length - keys.length, keys.length);
      ReflectApply(ArrayPrototypeSplice, null, sorted);
    }
  }
  var res = reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value);
  var budget = ctx.budget[ctx.indentationLvl] || 0;
  var newLength = budget + res.length;
  ctx.budget[ctx.indentationLvl] = newLength;
  // If any indentationLvl exceeds this limit, limit further inspecting to the
  // minimum. Otherwise the recursive algorithm might continue inspecting the
  // object even though the maximum string size (~2 ** 28 on 32 bit systems and
  // ~2 ** 30 on 64 bit systems) exceeded. The actual output is not limited at
  // exactly 2 ** 27 but a bit higher. This depends on the object shape.
  // This limit also makes sure that huge objects don't block the event loop
  // significantly.
  if (newLength > 2 ** 27) {
    ctx.depth = -1;
  }
  return res;
}
function getIteratorBraces(type, tag) {
  if (tag !== `${type} Iterator`) {
    if (tag !== '') tag += '] [';
    tag += `${type} Iterator`;
  }
  return [`[${tag}] {`, '}'];
}
function getBoxedBase(value, ctx, keys, constructor, tag) {
  var fn;
  var type;
  if (isNumberObject(value)) {
    fn = NumberPrototypeValueOf;
    type = 'Number';
  } else if (isStringObject(value)) {
    fn = StringPrototypeValueOf;
    type = 'String';
    // For boxed Strings, we have to remove the 0-n indexed entries,
    // since they just noisy up the output and are redundant
    // Make boxed primitive Strings look like such
    keys.splice(0, value.length);
  } else if (isBooleanObject(value)) {
    fn = BooleanPrototypeValueOf;
    type = 'Boolean';
  } else if (isBigIntObject(value)) {
    fn = BigIntPrototypeValueOf;
    type = 'BigInt';
  } else {
    fn = SymbolPrototypeValueOf;
    type = 'Symbol';
  }
  var base = `[${type}`;
  if (type !== constructor) {
    if (constructor === null) {
      base += ' (null prototype)';
    } else {
      base += ` (${constructor})`;
    }
  }
  base += `: ${formatPrimitive(stylizeNoColor, fn(value), ctx)}]`;
  if (tag !== '' && tag !== constructor) {
    base += ` [${tag}]`;
  }
  if (keys.length !== 0 || ctx.stylize === stylizeNoColor) return base;
  return ctx.stylize(base, StringPrototypeToLowerCase(type));
}
function getClassBase(value, constructor, tag) {
  var hasName = ObjectPrototypeHasOwnProperty(value, 'name');
  var name = hasName && value.name || '(anonymous)';
  var base = `class ${name}`;
  if (constructor !== 'Function' && constructor !== null) {
    base += ` [${constructor}]`;
  }
  if (tag !== '' && constructor !== tag) {
    base += ` [${tag}]`;
  }
  if (constructor !== null) {
    var superName = ObjectGetPrototypeOf(value).name;
    if (superName) {
      base += ` extends ${superName}`;
    }
  } else {
    base += ' extends [null prototype]';
  }
  return `[${base}]`;
}
function getFunctionBase(ctx, value, constructor, tag) {
  var stringified = FunctionPrototypeToString(value);
  if (StringPrototypeStartsWith(stringified, 'class') && stringified[stringified.length - 1] === '}') {
    var slice = StringPrototypeSlice(stringified, 5, -1);
    var bracketIndex = StringPrototypeIndexOf(slice, '{');
    if (bracketIndex !== -1 && (!StringPrototypeIncludes(StringPrototypeSlice(slice, 0, bracketIndex), '(') ||
    // Slow path to guarantee that it's indeed a class.
    RegExpPrototypeExec(classRegExp, RegExpPrototypeSymbolReplace(stripCommentsRegExp, slice)) !== null)) {
      return getClassBase(value, constructor, tag);
    }
  }
  var type = 'Function';
  if (isGeneratorFunction(value)) {
    type = `Generator${type}`;
  }
  if (isAsyncFunction(value)) {
    type = `Async${type}`;
  }
  var base = `[${type}`;
  if (constructor === null) {
    base += ' (null prototype)';
  }
  if (value.name === '') {
    base += ' (anonymous)';
  } else {
    base += `: ${typeof value.name === 'string' ? value.name : formatValue(ctx, value.name)}`;
  }
  base += ']';
  if (constructor !== type && constructor !== null) {
    base += ` ${constructor}`;
  }
  if (tag !== '' && constructor !== tag) {
    base += ` [${tag}]`;
  }
  return base;
}
function identicalSequenceRange(a, b) {
  for (var i = 0; i < a.length - 3; i++) {
    // Find the first entry of b that matches the current entry of a.
    var pos = ArrayPrototypeIndexOf(b, a[i]);
    if (pos !== -1) {
      var rest = b.length - pos;
      if (rest > 3) {
        var len = 1;
        var maxLen = MathMin(a.length - i, rest);
        // Count the number of consecutive entries.
        while (maxLen > len && a[i + len] === b[pos + len]) {
          len++;
        }
        if (len > 3) {
          return [len, i];
        }
      }
    }
  }
  return [0, 0];
}
function getDuplicateErrorFrameRanges(frames) {
  // Build a map: frame line -> sorted list of indices where it occurs
  var result = [];
  var lineToPositions = new SafeMap();
  for (var i = 0; i < frames.length; i++) {
    var positions = lineToPositions.get(frames[i]);
    if (positions === undefined) {
      lineToPositions.set(frames[i], [i]);
    } else {
      positions[positions.length] = i;
    }
  }
  var minimumDuplicateRange = 3;
  // Not enough duplicate lines to consider collapsing
  if (frames.length - lineToPositions.size <= minimumDuplicateRange) {
    return result;
  }
  for (var _i2 = 0; _i2 < frames.length - minimumDuplicateRange; _i2++) {
    var _positions = lineToPositions.get(frames[_i2]);
    // Find the next occurrence of the same line after i, if any
    if (_positions.length === 1 || _positions[_positions.length - 1] === _i2) {
      continue;
    }
    var current = _positions.indexOf(_i2) + 1;
    if (current === _positions.length) {
      continue;
    }

    // Theoretical maximum range, adjusted while iterating
    var range = _positions[_positions.length - 1] - _i2;
    if (range < minimumDuplicateRange) {
      continue;
    }
    var extraSteps = void 0;
    if (current + 1 < _positions.length) {
      // Optimize initial step size by choosing the greatest common divisor (GCD)
      // of all candidate distances to the same frame line. This tends to match
      // the true repeating block size and minimizes fallback iterations.
      var gcdRange = 0;
      for (var j = current; j < _positions.length; j++) {
        var distance = _positions[j] - _i2;
        while (distance !== 0) {
          var remainder = gcdRange % distance;
          if (gcdRange !== 0) {
            // Add other possible ranges as fallback
            extraSteps ??= new SafeSet();
            extraSteps.add(gcdRange);
          }
          gcdRange = distance;
          distance = remainder;
        }
        if (gcdRange === 1) break;
      }
      range = gcdRange;
      if (extraSteps) {
        extraSteps.delete(range);
        extraSteps = _toConsumableArray(extraSteps);
      }
    }
    var maxRange = range;
    var maxDuplicates = 0;
    var duplicateRanges = 0;
    for /* ignored */
    (var nextStart = _i2 + range;; nextStart += range) {
      var equalFrames = 0;
      for (var _j = 0; _j < range; _j++) {
        if (frames[_i2 + _j] !== frames[nextStart + _j]) {
          break;
        }
        equalFrames++;
      }
      // Adjust the range to match different type of ranges.
      if (equalFrames !== range) {
        if (!extraSteps?.length) {
          break;
        }
        // Memorize former range in case the smaller one would hide less.
        if (duplicateRanges !== 0 && maxRange * maxDuplicates < range * duplicateRanges) {
          maxRange = range;
          maxDuplicates = duplicateRanges;
        }
        range = extraSteps.pop();
        nextStart = _i2;
        duplicateRanges = 0;
        continue;
      }
      duplicateRanges++;
    }
    if (maxDuplicates !== 0 && maxRange * maxDuplicates >= range * duplicateRanges) {
      range = maxRange;
      duplicateRanges = maxDuplicates;
    }
    if (duplicateRanges * range >= 3) {
      result.push(_i2 + range, range, duplicateRanges);
      // Skip over the collapsed portion to avoid overlapping matches.
      _i2 += range * (duplicateRanges + 1) - 1;
    }
  }
  return result;
}
function getStackString(ctx, error) {
  var stack;
  try {
    stack = error.stack;
  } catch {
    // If stack is getter that throws, we ignore the error.
  }
  if (stack) {
    if (typeof stack === 'string') {
      return stack;
    }
    ctx.seen.push(error);
    ctx.indentationLvl += 4;
    var result = formatValue(ctx, stack);
    ctx.indentationLvl -= 4;
    ctx.seen.pop();
    return `${ErrorPrototypeToString(error)}\n    ${result}`;
  }
  return ErrorPrototypeToString(error);
}
function getStackFrames(ctx, err, stack) {
  var frames = StringPrototypeSplit(stack, '\n');
  var cause;
  try {
    ({
      cause
    } = err);
  } catch {
    // If 'cause' is a getter that throws, ignore it.
  }

  // Remove stack frames identical to frames in cause.
  if (cause != null && isError(cause)) {
    var causeStack = getStackString(ctx, cause);
    var causeStackStart = StringPrototypeIndexOf(causeStack, '\n    at');
    if (causeStackStart !== -1) {
      var causeFrames = StringPrototypeSplit(StringPrototypeSlice(causeStack, causeStackStart + 1), '\n');
      var {
        0: len,
        1: offset
      } = identicalSequenceRange(frames, causeFrames);
      if (len > 0) {
        var skipped = len - 2;
        var msg = `    ... ${skipped} lines matching cause stack trace ...`;
        frames.splice(offset + 1, skipped, ctx.stylize(msg, 'undefined'));
      }
    }
  }

  // Remove recursive repetitive stack frames in long stacks
  if (frames.length > 10) {
    var ranges = getDuplicateErrorFrameRanges(frames);
    for (var i = ranges.length - 3; i >= 0; i -= 3) {
      var _offset = ranges[i];
      var length = ranges[i + 1];
      var duplicateRanges = ranges[i + 2];
      var _msg = `    ... collapsed ${length * duplicateRanges} duplicate lines ` + 'matching above ' + (duplicateRanges > 1 ? `${length} lines ${duplicateRanges} times...` : 'lines ...');
      frames.splice(_offset, length * duplicateRanges, ctx.stylize(_msg, 'undefined'));
    }
  }
  return frames;
}

/** @type {(stack: string, constructor: string | null, name: unknown, tag: string) => string} */
function improveStack(stack, constructor, name, tag) {
  // A stack trace may contain arbitrary data. Only manipulate the output
  // for "regular errors" (errors that "look normal") for now.
  var len = name.length;
  if (typeof name !== 'string') {
    stack = StringPrototypeReplace(stack, `${name}`, `${name} [${StringPrototypeSlice(getPrefix(constructor, tag, 'Error'), 0, -1)}]`);
  }
  if (constructor === null || StringPrototypeEndsWith(name, 'Error') && StringPrototypeStartsWith(stack, name) && (stack.length === len || stack[len] === ':' || stack[len] === '\n')) {
    var fallback = 'Error';
    if (constructor === null) {
      var start = RegExpPrototypeExec(/^([A-Z][a-z_ A-Z0-9[\]()-]+)(?::|\n {4}at)/, stack) || RegExpPrototypeExec(/^([a-z_A-Z0-9-]*Error)$/, stack);
      fallback = start?.[1] || '';
      len = fallback.length;
      fallback ||= 'Error';
    }
    var prefix = StringPrototypeSlice(getPrefix(constructor, tag, fallback), 0, -1);
    if (name !== prefix) {
      if (StringPrototypeIncludes(prefix, name)) {
        if (len === 0) {
          stack = `${prefix}: ${stack}`;
        } else {
          stack = `${prefix}${StringPrototypeSlice(stack, len)}`;
        }
      } else {
        stack = `${prefix} [${name}]${StringPrototypeSlice(stack, len)}`;
      }
    }
  }
  return stack;
}
function markNodeModules(ctx, line) {
  var tempLine = '';
  var lastPos = 0;
  var searchFrom = 0;
  while (true) {
    var nodeModulePosition = StringPrototypeIndexOf(line, 'node_modules', searchFrom);
    if (nodeModulePosition === -1) {
      break;
    }

    // Ensure it's a path segment: must have a path separator before and after
    var separator = line[nodeModulePosition - 1];
    var after = line[nodeModulePosition + 12]; // 'node_modules'.length === 12

    if (after !== '/' && after !== '\\' || separator !== '/' && separator !== '\\') {
      // Not a proper segment; continue searching
      searchFrom = nodeModulePosition + 1;
      continue;
    }
    var moduleStart = nodeModulePosition + 13; // Include trailing separator

    // Append up to and including '/node_modules/'
    tempLine += StringPrototypeSlice(line, lastPos, moduleStart);
    var moduleEnd = StringPrototypeIndexOf(line, separator, moduleStart);
    if (line[moduleStart] === '@') {
      // Namespaced modules have an extra slash: @namespace/package
      moduleEnd = StringPrototypeIndexOf(line, separator, moduleEnd + 1);
    }
    var nodeModule = StringPrototypeSlice(line, moduleStart, moduleEnd);
    tempLine += ctx.stylize(nodeModule, 'module');
    lastPos = moduleEnd;
    searchFrom = moduleEnd;
  }
  if (lastPos !== 0) {
    line = tempLine + StringPrototypeSlice(line, lastPos);
  }
  return line;
}
function markCwd(ctx, line, workingDirectory) {
  var cwdStartPos = StringPrototypeIndexOf(line, workingDirectory);
  var tempLine = '';
  var cwdLength = workingDirectory.length;
  if (cwdStartPos !== -1) {
    if (StringPrototypeSlice(line, cwdStartPos - 7, cwdStartPos) === 'file://') {
      cwdLength += 7;
      cwdStartPos -= 7;
    }
    var start = line[cwdStartPos - 1] === '(' ? cwdStartPos - 1 : cwdStartPos;
    var end = start !== cwdStartPos && StringPrototypeEndsWith(line, ')') ? -1 : line.length;
    var workingDirectoryEndPos = cwdStartPos + cwdLength + 1;
    var cwdSlice = StringPrototypeSlice(line, start, workingDirectoryEndPos);
    tempLine += StringPrototypeSlice(line, 0, start);
    tempLine += ctx.stylize(cwdSlice, 'undefined');
    tempLine += StringPrototypeSlice(line, workingDirectoryEndPos, end);
    if (end === -1) {
      tempLine += ctx.stylize(')', 'undefined');
    }
  } else {
    tempLine += line;
  }
  return tempLine;
}
function safeGetCWD() {
  var workingDirectory;
  try {
    workingDirectory = process.cwd();
  } catch {
    return;
  }
  return workingDirectory;
}
function formatError(err, constructor, tag, ctx, keys) {
  var message, name, stack;
  try {
    stack = getStackString(ctx, err);
  } catch {
    return ObjectPrototypeToString(err);
  }
  var messageIsGetterThatThrows = false;
  try {
    message = err.message;
  } catch {
    messageIsGetterThatThrows = true;
  }
  var nameIsGetterThatThrows = false;
  try {
    name = err.name;
  } catch {
    nameIsGetterThatThrows = true;
  }
  if (!ctx.showHidden && keys.length !== 0) {
    var index = ArrayPrototypeIndexOf(keys, 'stack');
    if (index !== -1) {
      ArrayPrototypeSplice(keys, index, 1);
    }
    if (!messageIsGetterThatThrows) {
      var _index = ArrayPrototypeIndexOf(keys, 'message');
      // Only hide the property if it's a string and if it's part of the original stack
      if (_index !== -1 && (typeof message !== 'string' || StringPrototypeIncludes(stack, message))) {
        ArrayPrototypeSplice(keys, _index, 1);
      }
    }
    if (!nameIsGetterThatThrows) {
      var _index2 = ArrayPrototypeIndexOf(keys, 'name');
      // Only hide the property if it's a string and if it's part of the original stack
      if (_index2 !== -1 && (typeof name !== 'string' || StringPrototypeIncludes(stack, name))) {
        ArrayPrototypeSplice(keys, _index2, 1);
      }
    }
  }
  name ??= 'Error';
  if (ObjectPrototypeHasOwnProperty(err, 'cause') && (keys.length === 0 || !ArrayPrototypeIncludes(keys, 'cause'))) {
    ArrayPrototypePush(keys, 'cause');
  }

  // Print errors aggregated into AggregateError
  try {
    var errors = err.errors;
    if (ArrayIsArray(errors) && ObjectPrototypeHasOwnProperty(err, 'errors') && (keys.length === 0 || !ArrayPrototypeIncludes(keys, 'errors'))) {
      ArrayPrototypePush(keys, 'errors');
    }
  } catch {
    // If errors is a getter that throws, we ignore the error.
  }
  stack = improveStack(stack, constructor, name, tag);

  // Ignore the error message if it's contained in the stack.
  var pos = message && StringPrototypeIndexOf(stack, message) || -1;
  if (pos !== -1) pos += message.length;
  // Wrap the error in brackets in case it has no stack trace.
  var stackStart = StringPrototypeIndexOf(stack, '\n    at', pos);
  if (stackStart === -1) {
    stack = `[${stack}]`;
  } else {
    var newStack = StringPrototypeSlice(stack, 0, stackStart);
    var stackFramePart = StringPrototypeSlice(stack, stackStart + 1);
    var lines = getStackFrames(ctx, err, stackFramePart);
    if (ctx.colors) {
      // Highlight userland code and node modules.
      var workingDirectory = safeGetCWD();
      var esmWorkingDirectory;
      for (var line of lines) {
        var core = RegExpPrototypeExec(coreModuleRegExp, line);
        if (core !== null && BuiltinModule.exists(core[1])) {
          newStack += `\n${ctx.stylize(line, 'undefined')}`;
        } else {
          newStack += '\n';
          line = markNodeModules(ctx, line);
          if (workingDirectory !== undefined) {
            var newLine = markCwd(ctx, line, workingDirectory);
            if (newLine === line) {
              esmWorkingDirectory ??= pathToFileUrlHref(workingDirectory);
              newLine = markCwd(ctx, line, esmWorkingDirectory);
            }
            line = newLine;
          }
          newStack += line;
        }
      }
    } else {
      newStack += `\n${ArrayPrototypeJoin(lines, '\n')}`;
    }
    stack = newStack;
  }
  // The message and the stack have to be indented as well!
  if (ctx.indentationLvl !== 0) {
    var indentation = StringPrototypeRepeat(' ', ctx.indentationLvl);
    stack = StringPrototypeReplaceAll(stack, '\n', `\n${indentation}`);
  }
  return stack;
}
function groupArrayElements(ctx, output, value) {
  var totalLength = 0;
  var maxLength = 0;
  var i = 0;
  var outputLength = output.length;
  if (ctx.maxArrayLength < output.length) {
    // This makes sure the "... n more items" part is not taken into account.
    outputLength--;
  }
  var separatorSpace = 2; // Add 1 for the space and 1 for the separator.
  var dataLen = new _Array(outputLength);
  // Calculate the total length of all output entries and the individual max
  // entries length of all output entries. We have to remove colors first,
  // otherwise the length would not be calculated properly.
  for (; i < outputLength; i++) {
    var len = getStringWidth(output[i], ctx.colors);
    dataLen[i] = len;
    totalLength += len + separatorSpace;
    if (maxLength < len) maxLength = len;
  }
  // Add two to `maxLength` as we add a single whitespace character plus a comma
  // in-between two entries.
  var actualMax = maxLength + separatorSpace;
  // Check if at least three entries fit next to each other and prevent grouping
  // of arrays that contains entries of very different length (i.e., if a single
  // entry is longer than 1/5 of all other entries combined). Otherwise the
  // space in-between small entries would be enormous.
  if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength && (totalLength / actualMax > 5 || maxLength <= 6)) {
    var approxCharHeights = 2.5;
    var averageBias = MathSqrt(actualMax - totalLength / output.length);
    var biasedMax = MathMax(actualMax - 3 - averageBias, 1);
    // Dynamically check how many columns seem possible.
    var columns = MathMin(
    // Ideally a square should be drawn. We expect a character to be about 2.5
    // times as high as wide. This is the area formula to calculate a square
    // which contains n rectangles of size `actualMax * approxCharHeights`.
    // Divide that by `actualMax` to receive the correct number of columns.
    // The added bias increases the columns for short entries.
    MathRound(MathSqrt(approxCharHeights * biasedMax * outputLength) / biasedMax),
    // Do not exceed the breakLength.
    MathFloor((ctx.breakLength - ctx.indentationLvl) / actualMax),
    // Limit array grouping for small `compact` modes as the user requested
    // minimal grouping.
    ctx.compact * 4,
    // Limit the columns to a maximum of fifteen.
    15);
    // Return with the original output if no grouping should happen.
    if (columns <= 1) {
      return output;
    }
    var tmp = [];
    var maxLineLength = [];
    for (var _i3 = 0; _i3 < columns; _i3++) {
      var lineMaxLength = 0;
      for (var j = _i3; j < output.length; j += columns) {
        if (dataLen[j] > lineMaxLength) lineMaxLength = dataLen[j];
      }
      lineMaxLength += separatorSpace;
      maxLineLength[_i3] = lineMaxLength;
    }
    var order = StringPrototypePadStart;
    if (value !== undefined) {
      for (var _i4 = 0; _i4 < output.length; _i4++) {
        if (typeof value[_i4] !== 'number' && typeof value[_i4] !== 'bigint') {
          order = StringPrototypePadEnd;
          break;
        }
      }
    }
    // Each iteration creates a single line of grouped entries.
    for (var _i5 = 0; _i5 < outputLength; _i5 += columns) {
      // The last lines may contain less entries than columns.
      var max = MathMin(_i5 + columns, outputLength);
      var str = '';
      var _j2 = _i5;
      for (; _j2 < max - 1; _j2++) {
        // Calculate extra color padding in case it's active. This has to be
        // done line by line as some lines might contain more colors than
        // others.
        var padding = maxLineLength[_j2 - _i5] + output[_j2].length - dataLen[_j2];
        str += order(`${output[_j2]}, `, padding, ' ');
      }
      if (order === StringPrototypePadStart) {
        var _padding = maxLineLength[_j2 - _i5] + output[_j2].length - dataLen[_j2] - separatorSpace;
        str += StringPrototypePadStart(output[_j2], _padding, ' ');
      } else {
        str += output[_j2];
      }
      ArrayPrototypePush(tmp, str);
    }
    if (ctx.maxArrayLength < output.length) {
      ArrayPrototypePush(tmp, output[outputLength]);
    }
    output = tmp;
  }
  return output;
}
function handleMaxCallStackSize(ctx, err, constructorName, indentationLvl) {
  ctx.seen.pop();
  ctx.indentationLvl = indentationLvl;
  return ctx.stylize(`[${constructorName}: Inspection interrupted ` + 'prematurely. Maximum call stack size exceeded.]', 'special');
}
function addNumericSeparator(integerString) {
  var result = '';
  var i = integerString.length;
  assert(i !== 0);
  var start = integerString[0] === '-' ? 1 : 0;
  for (; i >= start + 4; i -= 3) {
    result = `_${StringPrototypeSlice(integerString, i - 3, i)}${result}`;
  }
  return i === integerString.length ? integerString : `${StringPrototypeSlice(integerString, 0, i)}${result}`;
}
function addNumericSeparatorEnd(integerString) {
  var result = '';
  var i = 0;
  for (; i < integerString.length - 3; i += 3) {
    result += `${StringPrototypeSlice(integerString, i, i + 3)}_`;
  }
  return i === 0 ? integerString : `${result}${StringPrototypeSlice(integerString, i)}`;
}
var remainingText = remaining => `... ${remaining} more item${remaining > 1 ? 's' : ''}`;
function formatNumber(fn, number, numericSeparator) {
  if (!numericSeparator) {
    // Format -0 as '-0'. Checking `number === -0` won't distinguish 0 from -0.
    if (ObjectIs(number, -0)) {
      return fn('-0', 'number');
    }
    return fn(`${number}`, 'number');
  }
  var numberString = _String(number);
  var integer = MathTrunc(number);
  if (integer === number) {
    if (!NumberIsFinite(number) || StringPrototypeIncludes(numberString, 'e')) {
      return fn(numberString, 'number');
    }
    return fn(addNumericSeparator(numberString), 'number');
  }
  if (NumberIsNaN(number)) {
    return fn(numberString, 'number');
  }
  var decimalIndex = StringPrototypeIndexOf(numberString, '.');
  var integerPart = StringPrototypeSlice(numberString, 0, decimalIndex);
  var fractionalPart = StringPrototypeSlice(numberString, decimalIndex + 1);
  return fn(`${addNumericSeparator(integerPart)}.${addNumericSeparatorEnd(fractionalPart)}`, 'number');
}
function formatBigInt(fn, bigint, numericSeparator) {
  var string = _String(bigint);
  if (!numericSeparator) {
    return fn(`${string}n`, 'bigint');
  }
  return fn(`${addNumericSeparator(string)}n`, 'bigint');
}
function formatPrimitive(fn, value, ctx) {
  if (typeof value === 'string') {
    var trailer = '';
    if (value.length > ctx.maxStringLength) {
      var remaining = value.length - ctx.maxStringLength;
      value = StringPrototypeSlice(value, 0, ctx.maxStringLength);
      trailer = `... ${remaining} more character${remaining > 1 ? 's' : ''}`;
    }
    if (ctx.compact !== true &&
    // We do not support handling unicode characters width with
    // the readline getStringWidth function as there are
    // performance implications.
    value.length > kMinLineLength && value.length > ctx.breakLength - ctx.indentationLvl - 4) {
      return ArrayPrototypeJoin(ArrayPrototypeMap(RegExpPrototypeSymbolSplit(/(?<=\n)/, value), line => fn(strEscape(line), 'string')), ` +\n${StringPrototypeRepeat(' ', ctx.indentationLvl + 2)}`) + trailer;
    }
    return fn(strEscape(value), 'string') + trailer;
  }
  if (typeof value === 'number') return formatNumber(fn, value, ctx.numericSeparator);
  if (typeof value === 'bigint') return formatBigInt(fn, value, ctx.numericSeparator);
  if (typeof value === 'boolean') return fn(`${value}`, 'boolean');
  if (typeof value === 'undefined') return fn('undefined', 'undefined');
  // es6 symbol primitive
  return fn(SymbolPrototypeToString(value), 'symbol');
}
function formatNamespaceObject(keys, ctx, value, recurseTimes) {
  var output = new _Array(keys.length);
  for (var i = 0; i < keys.length; i++) {
    try {
      output[i] = formatProperty(ctx, value, recurseTimes, keys[i], kObjectType);
    } catch (err) {
      assert(isNativeError(err) && err.name === 'ReferenceError');
      // Use the existing functionality. This makes sure the indentation and
      // line breaks are always correct. Otherwise it is very difficult to keep
      // this aligned, even though this is a hacky way of dealing with this.
      var tmp = {
        [keys[i]]: ''
      };
      output[i] = formatProperty(ctx, tmp, recurseTimes, keys[i], kObjectType);
      var pos = StringPrototypeLastIndexOf(output[i], ' ');
      // We have to find the last whitespace and have to replace that value as
      // it will be visualized as a regular string.
      output[i] = StringPrototypeSlice(output[i], 0, pos + 1) + ctx.stylize('<uninitialized>', 'special');
    }
  }
  // Reset the keys to an empty array. This prevents duplicated inspection.
  keys.length = 0;
  return output;
}

// The array is sparse and/or has extra keys
function formatSpecialArray(ctx, value, recurseTimes, maxLength, output, i) {
  var keys = ObjectKeys(value);
  var index = i;
  for (; i < keys.length && output.length < maxLength; i++) {
    var key = keys[i];
    var tmp = +key;
    // Arrays can only have up to 2^32 - 1 entries
    if (tmp > 2 ** 32 - 2) {
      break;
    }
    if (`${index}` !== key) {
      if (RegExpPrototypeExec(numberRegExp, key) === null) {
        break;
      }
      var emptyItems = tmp - index;
      var ending = emptyItems > 1 ? 's' : '';
      var message = `<${emptyItems} empty item${ending}>`;
      ArrayPrototypePush(output, ctx.stylize(message, 'undefined'));
      index = tmp;
      if (output.length === maxLength) {
        break;
      }
    }
    ArrayPrototypePush(output, formatProperty(ctx, value, recurseTimes, key, kArrayType));
    index++;
  }
  var remaining = value.length - index;
  if (output.length !== maxLength) {
    if (remaining > 0) {
      var _ending = remaining > 1 ? 's' : '';
      var _message = `<${remaining} empty item${_ending}>`;
      ArrayPrototypePush(output, ctx.stylize(_message, 'undefined'));
    }
  } else if (remaining > 0) {
    ArrayPrototypePush(output, remainingText(remaining));
  }
  return output;
}
function formatArrayBuffer(ctx, value) {
  var buffer;
  try {
    buffer = new Uint8Array(value);
  } catch {
    return [ctx.stylize('(detached)', 'special')];
  }
  if (hexSlice === undefined) hexSlice = uncurryThis(require('buffer').Buffer.prototype.hexSlice);
  var rawString = hexSlice(buffer, 0, MathMin(ctx.maxArrayLength, buffer.length));
  var str = '';
  var i = 0;
  for (; i < rawString.length - 2; i += 2) {
    str += `${rawString[i]}${rawString[i + 1]} `;
  }
  if (rawString.length > 0) {
    str += `${rawString[i]}${rawString[i + 1]}`;
  }
  var remaining = buffer.length - ctx.maxArrayLength;
  if (remaining > 0) str += ` ... ${remaining} more byte${remaining > 1 ? 's' : ''}`;
  return [`${ctx.stylize('[Uint8Contents]', 'special')}: <${str}>`];
}
function formatArray(ctx, value, recurseTimes) {
  var valLen = value.length;
  var len = MathMin(MathMax(0, ctx.maxArrayLength), valLen);
  var remaining = valLen - len;
  var output = [];
  for (var i = 0; i < len; i++) {
    var desc = ObjectGetOwnPropertyDescriptor(value, i);
    if (desc === undefined) {
      // Special handle sparse arrays.
      return formatSpecialArray(ctx, value, recurseTimes, len, output, i);
    }
    ArrayPrototypePush(output, formatProperty(ctx, value, recurseTimes, i, kArrayType, desc));
  }
  if (remaining > 0) {
    ArrayPrototypePush(output, remainingText(remaining));
  }
  return output;
}
function formatTypedArray(value, length, ctx) {
  var maxLength = MathMin(MathMax(0, ctx.maxArrayLength), length);
  var remaining = value.length - maxLength;
  var output = new _Array(maxLength);
  var elementFormatter = value.length > 0 && typeof value[0] === 'number' ? formatNumber : formatBigInt;
  for (var i = 0; i < maxLength; ++i) {
    output[i] = elementFormatter(ctx.stylize, value[i], ctx.numericSeparator);
  }
  if (remaining > 0) {
    output[maxLength] = remainingText(remaining);
  }
  return output;
}
function formatSet(value, ctx, ignored, recurseTimes) {
  var length = value.size;
  var maxLength = MathMin(MathMax(0, ctx.maxArrayLength), length);
  var remaining = length - maxLength;
  var output = [];
  ctx.indentationLvl += 2;
  var i = 0;
  for (var v of value) {
    if (i >= maxLength) break;
    ArrayPrototypePush(output, formatValue(ctx, v, recurseTimes));
    i++;
  }
  if (remaining > 0) {
    ArrayPrototypePush(output, remainingText(remaining));
  }
  ctx.indentationLvl -= 2;
  return output;
}
function formatMap(value, ctx, ignored, recurseTimes) {
  var length = value.size;
  var maxLength = MathMin(MathMax(0, ctx.maxArrayLength), length);
  var remaining = length - maxLength;
  var output = [];
  ctx.indentationLvl += 2;
  var i = 0;
  for (var {
    0: k,
    1: v
  } of value) {
    if (i >= maxLength) break;
    ArrayPrototypePush(output, `${formatValue(ctx, k, recurseTimes)} => ${formatValue(ctx, v, recurseTimes)}`);
    i++;
  }
  if (remaining > 0) {
    ArrayPrototypePush(output, remainingText(remaining));
  }
  ctx.indentationLvl -= 2;
  return output;
}
function formatSetIterInner(ctx, recurseTimes, entries, state) {
  var maxArrayLength = MathMax(ctx.maxArrayLength, 0);
  var maxLength = MathMin(maxArrayLength, entries.length);
  var output = new _Array(maxLength);
  ctx.indentationLvl += 2;
  for (var i = 0; i < maxLength; i++) {
    output[i] = formatValue(ctx, entries[i], recurseTimes);
  }
  ctx.indentationLvl -= 2;
  if (state === kWeak && !ctx.sorted) {
    // Sort all entries to have a halfway reliable output (if more entries than
    // retrieved ones exist, we can not reliably return the same output) if the
    // output is not sorted anyway.
    ArrayPrototypeSort(output);
  }
  var remaining = entries.length - maxLength;
  if (remaining > 0) {
    ArrayPrototypePush(output, remainingText(remaining));
  }
  return output;
}
function formatMapIterInner(ctx, recurseTimes, entries, state) {
  var maxArrayLength = MathMax(ctx.maxArrayLength, 0);
  // Entries exist as [key1, val1, key2, val2, ...]
  var len = entries.length / 2;
  var remaining = len - maxArrayLength;
  var maxLength = MathMin(maxArrayLength, len);
  var output = new _Array(maxLength);
  var i = 0;
  ctx.indentationLvl += 2;
  if (state === kWeak) {
    for (; i < maxLength; i++) {
      var pos = i * 2;
      output[i] = `${formatValue(ctx, entries[pos], recurseTimes)} => ${formatValue(ctx, entries[pos + 1], recurseTimes)}`;
    }
    // Sort all entries to have a halfway reliable output (if more entries than
    // retrieved ones exist, we can not reliably return the same output) if the
    // output is not sorted anyway.
    if (!ctx.sorted) ArrayPrototypeSort(output);
  } else {
    for (; i < maxLength; i++) {
      var _pos = i * 2;
      var res = [formatValue(ctx, entries[_pos], recurseTimes), formatValue(ctx, entries[_pos + 1], recurseTimes)];
      output[i] = reduceToSingleString(ctx, res, '', ['[', ']'], kArrayExtrasType, recurseTimes);
    }
  }
  ctx.indentationLvl -= 2;
  if (remaining > 0) {
    ArrayPrototypePush(output, remainingText(remaining));
  }
  return output;
}
function formatWeakCollection(ctx) {
  return [ctx.stylize('<items unknown>', 'special')];
}
function formatWeakSet(ctx, value, recurseTimes) {
  var entries = previewEntries(value);
  return formatSetIterInner(ctx, recurseTimes, entries, kWeak);
}
function formatWeakMap(ctx, value, recurseTimes) {
  var entries = previewEntries(value);
  return formatMapIterInner(ctx, recurseTimes, entries, kWeak);
}
function formatIterator(braces, ctx, value, recurseTimes) {
  var {
    0: entries,
    1: isKeyValue
  } = previewEntries(value, true);
  if (isKeyValue) {
    // Mark entry iterators as such.
    braces[0] = RegExpPrototypeSymbolReplace(/ Iterator] {$/, braces[0], ' Entries] {');
    return formatMapIterInner(ctx, recurseTimes, entries, kMapEntries);
  }
  return formatSetIterInner(ctx, recurseTimes, entries, kIterator);
}
function formatPromise(ctx, value, recurseTimes) {
  var output;
  var {
    0: state,
    1: result
  } = getPromiseDetails(value);
  if (state === kPending) {
    output = [ctx.stylize('<pending>', 'special')];
  } else {
    ctx.indentationLvl += 2;
    var str = formatValue(ctx, result, recurseTimes);
    ctx.indentationLvl -= 2;
    output = [state === kRejected ? `${ctx.stylize('<rejected>', 'special')} ${str}` : str];
  }
  return output;
}
function formatExtraProperties(ctx, value, recurseTimes, key, typedArray) {
  ctx.indentationLvl += 2;
  var str = formatValue(ctx, value[key], recurseTimes, typedArray);
  ctx.indentationLvl -= 2;

  // These entries are mainly getters. Should they be formatted like getters?
  var name = ctx.stylize(`[${key}]`, 'string');
  return `${name}: ${str}`;
}
function formatProperty(ctx, value, recurseTimes, key, type, desc) {
  var original = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : value;
  var name, str;
  var extra = ' ';
  desc ??= ObjectGetOwnPropertyDescriptor(value, key);
  if (desc.value !== undefined) {
    var diff = ctx.compact !== true || type !== kObjectType ? 2 : 3;
    ctx.indentationLvl += diff;
    str = formatValue(ctx, desc.value, recurseTimes);
    if (diff === 3 && ctx.breakLength < getStringWidth(str, ctx.colors)) {
      extra = `\n${StringPrototypeRepeat(' ', ctx.indentationLvl)}`;
    }
    ctx.indentationLvl -= diff;
  } else if (desc.get !== undefined) {
    var label = desc.set !== undefined ? 'Getter/Setter' : 'Getter';
    var s = ctx.stylize;
    var sp = 'special';
    if (ctx.getters && (ctx.getters === true || ctx.getters === 'get' && desc.set === undefined || ctx.getters === 'set' && desc.set !== undefined)) {
      ctx.indentationLvl += 2;
      try {
        var tmp = FunctionPrototypeCall(desc.get, original);
        if (tmp === null) {
          str = `${s(`[${label}:`, sp)} ${s('null', 'null')}${s(']', sp)}`;
        } else if (typeof tmp === 'object') {
          str = `${s(`[${label}]`, sp)} ${formatValue(ctx, tmp, recurseTimes)}`;
        } else {
          var primitive = formatPrimitive(s, tmp, ctx);
          str = `${s(`[${label}:`, sp)} ${primitive}${s(']', sp)}`;
        }
      } catch (err) {
        var message = `<Inspection threw (${formatValue(ctx, err, recurseTimes)})>`;
        str = `${s(`[${label}:`, sp)} ${message}${s(']', sp)}`;
      }
      ctx.indentationLvl -= 2;
    } else {
      str = ctx.stylize(`[${label}]`, sp);
    }
  } else if (desc.set !== undefined) {
    str = ctx.stylize('[Setter]', 'special');
  } else {
    str = ctx.stylize('undefined', 'undefined');
  }
  if (type === kArrayType) {
    return str;
  }
  if (typeof key === 'symbol') {
    var _tmp = RegExpPrototypeSymbolReplace(strEscapeSequencesReplacer, SymbolPrototypeToString(key), escapeFn);
    name = ctx.stylize(_tmp, 'symbol');
  } else if (RegExpPrototypeExec(keyStrRegExp, key) !== null) {
    name = key === '__proto__' ? "['__proto__']" : ctx.stylize(key, 'name');
  } else {
    name = ctx.stylize(strEscape(key), 'string');
  }
  if (desc.enumerable === false) {
    name = `[${name}]`;
  }
  return `${name}:${extra}${str}`;
}
function isBelowBreakLength(ctx, output, start, base) {
  // Each entry is separated by at least a comma. Thus, we start with a total
  // length of at least `output.length`. In addition, some cases have a
  // whitespace in-between each other that is added to the total as well.
  // TODO(BridgeAR): Add unicode support. Use the readline getStringWidth
  // function. Check the performance overhead and make it an opt-in in case it's
  // significant.
  var totalLength = output.length + start;
  if (totalLength + output.length > ctx.breakLength) return false;
  for (var i = 0; i < output.length; i++) {
    if (ctx.colors) {
      totalLength += removeColors(output[i]).length;
    } else {
      totalLength += output[i].length;
    }
    if (totalLength > ctx.breakLength) {
      return false;
    }
  }
  // Do not line up properties on the same line if `base` contains line breaks.
  return base === '' || !StringPrototypeIncludes(base, '\n');
}
function reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value) {
  if (ctx.compact !== true) {
    if (typeof ctx.compact === 'number' && ctx.compact >= 1) {
      // Memorize the original output length. In case the output is grouped,
      // prevent lining up the entries on a single line.
      var entries = output.length;
      // Group array elements together if the array contains at least six
      // separate entries.
      if (extrasType === kArrayExtrasType && entries > 6) {
        output = groupArrayElements(ctx, output, value);
      }
      // `ctx.currentDepth` is set to the most inner depth of the currently
      // inspected object part while `recurseTimes` is the actual current depth
      // that is inspected.
      //
      // Example:
      //
      // const a = { first: [ 1, 2, 3 ], second: { inner: [ 1, 2, 3 ] } }
      //
      // The deepest depth of `a` is 2 (a.second.inner) and `a.first` has a max
      // depth of 1.
      //
      // Consolidate all entries of the local most inner depth up to
      // `ctx.compact`, as long as the properties are smaller than
      // `ctx.breakLength`.
      if (ctx.currentDepth - recurseTimes < ctx.compact && entries === output.length) {
        // Line up all entries on a single line in case the entries do not
        // exceed `breakLength`. Add 10 as constant to start next to all other
        // factors that may reduce `breakLength`.
        var start = output.length + ctx.indentationLvl + braces[0].length + base.length + 10;
        if (isBelowBreakLength(ctx, output, start, base)) {
          var joinedOutput = join(output, ', ');
          if (!StringPrototypeIncludes(joinedOutput, '\n')) {
            return `${base ? `${base} ` : ''}${braces[0]} ${joinedOutput}` + ` ${braces[1]}`;
          }
        }
      }
    }
    // Line up each entry on an individual line.
    var _indentation = `\n${StringPrototypeRepeat(' ', ctx.indentationLvl)}`;
    return `${base ? `${base} ` : ''}${braces[0]}${_indentation}  ` + `${join(output, `,${_indentation}  `)}${_indentation}${braces[1]}`;
  }
  // Line up all entries on a single line in case the entries do not exceed
  // `breakLength`.
  if (isBelowBreakLength(ctx, output, 0, base)) {
    return `${braces[0]}${base ? ` ${base}` : ''} ${join(output, ', ')} ` + braces[1];
  }
  var indentation = StringPrototypeRepeat(' ', ctx.indentationLvl);
  // If the opening "brace" is too large, like in the case of "Set {",
  // we need to force the first item to be on the next line or the
  // items will not line up correctly.
  var ln = base === '' && braces[0].length === 1 ? ' ' : `${base ? ` ${base}` : ''}\n${indentation}  `;
  // Line up each entry on an individual line.
  return `${braces[0]}${ln}${join(output, `,\n${indentation}  `)} ${braces[1]}`;
}
function hasBuiltInToString(value) {
  // Prevent triggering proxy traps.
  var getFullProxy = false;
  var proxyTarget = getProxyDetails(value, getFullProxy);
  if (proxyTarget !== undefined) {
    if (proxyTarget === null) {
      return true;
    }
    return hasBuiltInToString(proxyTarget);
  }
  var hasOwnToString = ObjectPrototypeHasOwnProperty;
  var hasOwnToPrimitive = ObjectPrototypeHasOwnProperty;

  // Count objects without `toString` and `Symbol.toPrimitive` function as built-in.
  if (typeof value.toString !== 'function') {
    if (typeof value[SymbolToPrimitive] !== 'function') {
      return true;
    } else if (ObjectPrototypeHasOwnProperty(value, SymbolToPrimitive)) {
      return false;
    }
    hasOwnToString = returnFalse;
  } else if (ObjectPrototypeHasOwnProperty(value, 'toString')) {
    return false;
  } else if (typeof value[SymbolToPrimitive] !== 'function') {
    hasOwnToPrimitive = returnFalse;
  } else if (ObjectPrototypeHasOwnProperty(value, SymbolToPrimitive)) {
    return false;
  }

  // Find the object that has the `toString` property or `Symbol.toPrimitive` property
  // as own property in the prototype chain.
  var pointer = value;
  do {
    pointer = ObjectGetPrototypeOf(pointer);
  } while (!hasOwnToString(pointer, 'toString') && !hasOwnToPrimitive(pointer, SymbolToPrimitive));

  // Check closer if the object is a built-in.
  var descriptor = ObjectGetOwnPropertyDescriptor(pointer, 'constructor');
  return descriptor !== undefined && typeof descriptor.value === 'function' && builtInObjects.has(descriptor.value.name);
}
function returnFalse() {
  return false;
}
var firstErrorLine = error => StringPrototypeSplit(error.message, '\n', 1)[0];
var CIRCULAR_ERROR_MESSAGE;
function tryStringify(arg) {
  try {
    return JSONStringify(arg);
  } catch (err) {
    // Populate the circular error message lazily
    if (!CIRCULAR_ERROR_MESSAGE) {
      try {
        var a = {};
        a.a = a;
        JSONStringify(a);
      } catch (circularError) {
        CIRCULAR_ERROR_MESSAGE = firstErrorLine(circularError);
      }
    }
    if (err.name === 'TypeError' && firstErrorLine(err) === CIRCULAR_ERROR_MESSAGE) {
      return '[Circular]';
    }
    throw err;
  }
}
function format() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return formatWithOptionsInternal(undefined, args);
}
function formatWithOptions(inspectOptions) {
  validateObject(inspectOptions, 'inspectOptions', kValidateObjectAllowArray);
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  return formatWithOptionsInternal(inspectOptions, args);
}
function formatNumberNoColor(number, options) {
  return formatNumber(stylizeNoColor, number, options?.numericSeparator ?? inspectDefaultOptions.numericSeparator);
}
function formatBigIntNoColor(bigint, options) {
  return formatBigInt(stylizeNoColor, bigint, options?.numericSeparator ?? inspectDefaultOptions.numericSeparator);
}
function formatWithOptionsInternal(inspectOptions, args) {
  var first = args[0];
  var a = 0;
  var str = '';
  var join = '';
  if (typeof first === 'string') {
    if (args.length === 1) {
      return first;
    }
    var tempStr;
    var lastPos = 0;
    for (var i = 0; i < first.length - 1; i++) {
      if (StringPrototypeCharCodeAt(first, i) === 37) {
        // '%'
        var nextChar = StringPrototypeCharCodeAt(first, ++i);
        if (a + 1 !== args.length) {
          switch (nextChar) {
            case 115:
              {
                // 's'
                var tempArg = args[++a];
                if (typeof tempArg === 'number') {
                  tempStr = formatNumberNoColor(tempArg, inspectOptions);
                } else if (typeof tempArg === 'bigint') {
                  tempStr = formatBigIntNoColor(tempArg, inspectOptions);
                } else if (typeof tempArg !== 'object' || tempArg === null || !hasBuiltInToString(tempArg)) {
                  tempStr = _String(tempArg);
                } else {
                  tempStr = inspect(tempArg, _objectSpread(_objectSpread({}, inspectOptions), {}, {
                    compact: 3,
                    colors: false,
                    depth: 0
                  }));
                }
                break;
              }
            case 106:
              // 'j'
              tempStr = tryStringify(args[++a]);
              break;
            case 100:
              {
                // 'd'
                var tempNum = args[++a];
                if (typeof tempNum === 'bigint') {
                  tempStr = formatBigIntNoColor(tempNum, inspectOptions);
                } else if (typeof tempNum === 'symbol') {
                  tempStr = 'NaN';
                } else {
                  tempStr = formatNumberNoColor(_Number(tempNum), inspectOptions);
                }
                break;
              }
            case 79:
              // 'O'
              tempStr = inspect(args[++a], inspectOptions);
              break;
            case 111:
              // 'o'
              tempStr = inspect(args[++a], _objectSpread(_objectSpread({}, inspectOptions), {}, {
                showHidden: true,
                showProxy: true,
                depth: 4
              }));
              break;
            case 105:
              {
                // 'i'
                var tempInteger = args[++a];
                if (typeof tempInteger === 'bigint') {
                  tempStr = formatBigIntNoColor(tempInteger, inspectOptions);
                } else if (typeof tempInteger === 'symbol') {
                  tempStr = 'NaN';
                } else {
                  tempStr = formatNumberNoColor(NumberParseInt(tempInteger), inspectOptions);
                }
                break;
              }
            case 102:
              {
                // 'f'
                var tempFloat = args[++a];
                if (typeof tempFloat === 'symbol') {
                  tempStr = 'NaN';
                } else {
                  tempStr = formatNumberNoColor(NumberParseFloat(tempFloat), inspectOptions);
                }
                break;
              }
            case 99:
              // 'c'
              a += 1;
              tempStr = '';
              break;
            case 37:
              // '%'
              str += StringPrototypeSlice(first, lastPos, i);
              lastPos = i + 1;
              continue;
            default:
              // Any other character is not a correct placeholder
              continue;
          }
          if (lastPos !== i - 1) {
            str += StringPrototypeSlice(first, lastPos, i - 1);
          }
          str += tempStr;
          lastPos = i + 1;
        } else if (nextChar === 37) {
          str += StringPrototypeSlice(first, lastPos, i);
          lastPos = i + 1;
        }
      }
    }
    if (lastPos !== 0) {
      a++;
      join = ' ';
      if (lastPos < first.length) {
        str += StringPrototypeSlice(first, lastPos);
      }
    }
  }
  while (a < args.length) {
    var value = args[a];
    str += join;
    str += typeof value !== 'string' ? inspect(value, inspectOptions) : value;
    join = ' ';
    a++;
  }
  return str;
}
function isZeroWidthCodePoint(code) {
  return code <= 0x1F ||
  // C0 control codes
  code >= 0x7F && code <= 0x9F ||
  // C1 control codes
  code >= 0x300 && code <= 0x36F ||
  // Combining Diacritical Marks
  code >= 0x200B && code <= 0x200F ||
  // Modifying Invisible Characters
  // Combining Diacritical Marks for Symbols
  code >= 0x20D0 && code <= 0x20FF || code >= 0xFE00 && code <= 0xFE0F ||
  // Variation Selectors
  code >= 0xFE20 && code <= 0xFE2F ||
  // Combining Half Marks
  code >= 0xE0100 && code <= 0xE01EF; // Variation Selectors
}
if (internalBinding('config').hasIntl) {
  var icu = internalBinding('icu');
  // icu.getStringWidth(string, ambiguousAsFullWidth, expandEmojiSequence)
  // Defaults: ambiguousAsFullWidth = false; expandEmojiSequence = true;
  // TODO(BridgeAR): Expose the options to the user. That is probably the
  // best thing possible at the moment, since it's difficult to know what
  // the receiving end supports.
  getStringWidth = function getStringWidth(str) {
    var removeControlChars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var width = 0;
    if (removeControlChars) {
      str = stripVTControlCharacters(str);
    }
    for (var i = 0; i < str.length; i++) {
      // Try to avoid calling into C++ by first handling the ASCII portion of
      // the string. If it is fully ASCII, we skip the C++ part.
      var code = str.charCodeAt(i);
      if (code >= 127) {
        width += icu.getStringWidth(StringPrototypeNormalize(StringPrototypeSlice(str, i), 'NFC'));
        break;
      }
      width += code >= 32 ? 1 : 0;
    }
    return width;
  };
} else {
  /**
   * @param {string} str
   * @param {boolean} [removeControlChars]
   * @returns {number} number of columns required to display the given string.
   */
  getStringWidth = function getStringWidth(str) {
    var removeControlChars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var width = 0;
    if (removeControlChars) str = stripVTControlCharacters(str);
    str = StringPrototypeNormalize(str, 'NFC');
    for (var char of new SafeStringIterator(str)) {
      var code = StringPrototypeCodePointAt(char, 0);
      if (isFullWidthCodePoint(code)) {
        width += 2;
      } else if (!isZeroWidthCodePoint(code)) {
        width++;
      }
    }
    return width;
  };

  /**
   * Returns true if the character represented by a given
   * Unicode code point is full-width. Otherwise returns false.
   * @param {string} code
   * @returns {boolean}
   */
  var isFullWidthCodePoint = code => {
    // Code points are partially derived from:
    // https://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
    return code >= 0x1100 && (code <= 0x115f ||
    // Hangul Jamo
    code === 0x2329 ||
    // LEFT-POINTING ANGLE BRACKET
    code === 0x232a ||
    // RIGHT-POINTING ANGLE BRACKET
    // CJK Radicals Supplement .. Enclosed CJK Letters and Months
    code >= 0x2e80 && code <= 0x3247 && code !== 0x303f ||
    // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
    code >= 0x3250 && code <= 0x4dbf ||
    // CJK Unified Ideographs .. Yi Radicals
    code >= 0x4e00 && code <= 0xa4c6 ||
    // Hangul Jamo Extended-A
    code >= 0xa960 && code <= 0xa97c ||
    // Hangul Syllables
    code >= 0xac00 && code <= 0xd7a3 ||
    // CJK Compatibility Ideographs
    code >= 0xf900 && code <= 0xfaff ||
    // Vertical Forms
    code >= 0xfe10 && code <= 0xfe19 ||
    // CJK Compatibility Forms .. Small Form Variants
    code >= 0xfe30 && code <= 0xfe6b ||
    // Halfwidth and Fullwidth Forms
    code >= 0xff01 && code <= 0xff60 || code >= 0xffe0 && code <= 0xffe6 ||
    // Kana Supplement
    code >= 0x1b000 && code <= 0x1b001 ||
    // Enclosed Ideographic Supplement
    code >= 0x1f200 && code <= 0x1f251 ||
    // Miscellaneous Symbols and Pictographs 0x1f300 - 0x1f5ff
    // Emoticons 0x1f600 - 0x1f64f
    code >= 0x1f300 && code <= 0x1f64f ||
    // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
    code >= 0x20000 && code <= 0x3fffd);
  };
}

/**
 * Remove all VT control characters. Use to estimate displayed string width.
 * @param {string} str
 * @returns {string}
 */
function stripVTControlCharacters(str) {
  validateString(str, 'str');

  // Short-circuit: all ANSI escape sequences start with either
  // ESC (\u001B, 7-bit) or CSI (\u009B, 8-bit) introducer.
  // If neither is present, the string has no VT control characters.
  if (StringPrototypeIndexOf(str, '\u001B') === -1 && StringPrototypeIndexOf(str, '\u009B') === -1) return str;
  return RegExpPrototypeSymbolReplace(ansi, str, '');
}
module.exports = {
  identicalSequenceRange,
  inspect,
  inspectDefaultOptions,
  format,
  formatWithOptions,
  getStringWidth,
  stripVTControlCharacters,
  isZeroWidthCodePoint
};

