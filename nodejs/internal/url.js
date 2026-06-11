'use strict';

var _inspect$custom, _inspect$custom2, _inspect$custom3;
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _checkInRHS(e) { if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (null !== e ? typeof e : "null")); return e; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Array,
  ArrayIsArray,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  Boolean,
  Int8Array,
  IteratorPrototype,
  Number: _Number,
  ObjectDefineProperties,
  ObjectSetPrototypeOf,
  ReflectGetOwnPropertyDescriptor,
  ReflectOwnKeys,
  SafeMap,
  SafeSet,
  StringPrototypeCharAt,
  StringPrototypeCharCodeAt,
  StringPrototypeCodePointAt,
  StringPrototypeIncludes,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
  StringPrototypeToWellFormed,
  Symbol: _Symbol,
  SymbolIterator,
  SymbolToStringTag,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength,
  TypedArrayPrototypeGetByteOffset,
  decodeURIComponent
} = primordials;
var {
  URLPattern
} = internalBinding('url_pattern');
var {
  inspect
} = require('internal/util/inspect');
var {
  encodeStr,
  hexTable,
  isHexTable
} = require('internal/querystring');
var {
  getConstructorOf,
  removeColors,
  kEnumerableProperty,
  kEmptyObject,
  SideEffectFreeRegExpPrototypeSymbolReplace,
  isWindows
} = require('internal/util');
var {
  platform
} = require('internal/process/per_thread');
var {
  markTransferMode
} = require('internal/worker/js_transferable');
var {
  codes: {
    ERR_ARG_NOT_ITERABLE,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_FILE_URL_HOST,
    ERR_INVALID_FILE_URL_PATH,
    ERR_INVALID_THIS,
    ERR_INVALID_TUPLE,
    ERR_INVALID_URL,
    ERR_INVALID_URL_SCHEME,
    ERR_MISSING_ARGS,
    ERR_NO_CRYPTO
  }
} = require('internal/errors');
var {
  CHAR_AMPERSAND,
  CHAR_BACKWARD_SLASH,
  CHAR_EQUAL,
  CHAR_FORWARD_SLASH,
  CHAR_LOWERCASE_A,
  CHAR_LOWERCASE_Z,
  CHAR_PERCENT,
  CHAR_PLUS,
  CHAR_COLON
} = require('internal/constants');
var path = require('path');
var {
  Buffer
} = require('buffer');
var {
  validateFunction,
  validateObject,
  kValidateObjectAllowObjects
} = require('internal/validators');
var {
  percentDecode
} = require('internal/data_url');
var querystring = require('querystring');
var bindingUrl = internalBinding('url');
var FORWARD_SLASH = /\//g;
var contextForInspect = _Symbol('context');

// `unsafeProtocol`, `hostlessProtocol` and `slashedProtocol` is
// deliberately moved to `internal/url` rather than `url`.
// Workers does not bootstrap URL module. Therefore, `SafeSet`
// is not initialized on bootstrap. This case breaks the
// test-require-delete-array-iterator test.

// Protocols that can allow "unsafe" and "unwise" chars.
var unsafeProtocol = new SafeSet(['javascript', 'javascript:']);
// Protocols that never have a hostname.
var hostlessProtocol = new SafeSet(['javascript', 'javascript:']);
// Protocols that always contain a // bit.
var slashedProtocol = new SafeSet(['http', 'http:', 'https', 'https:', 'ftp', 'ftp:', 'gopher', 'gopher:', 'file', 'file:', 'ws', 'ws:', 'wss', 'wss:']);
var updateActions = {
  kProtocol: 0,
  kHost: 1,
  kHostname: 2,
  kPort: 3,
  kUsername: 4,
  kPassword: 5,
  kPathname: 6,
  kSearch: 7,
  kHash: 8,
  kHref: 9
};
var blob;
var cryptoRandom;
function lazyBlob() {
  blob ??= require('internal/blob');
  return blob;
}
function lazyCryptoRandom() {
  try {
    cryptoRandom ??= require('internal/crypto/random');
  } catch {
    // If Node.js built without crypto support, we'll fall
    // through here and handle it later.
  }
  return cryptoRandom;
}

// This class provides the internal state of a URL object. An instance of this
// class is stored in every URL object and is accessed internally by setters
// and getters. It roughly corresponds to the concept of a URL record in the
// URL Standard, with a few differences. It is also the object transported to
// the C++ binding.
// Refs: https://url.spec.whatwg.org/#concept-url
var URLContext = /*#__PURE__*/function () {
  function URLContext() {
    _classCallCheck(this, URLContext);
    _defineProperty(this, "href", '');
    _defineProperty(this, "protocol_end", 0);
    _defineProperty(this, "username_end", 0);
    _defineProperty(this, "host_start", 0);
    _defineProperty(this, "host_end", 0);
    _defineProperty(this, "pathname_start", 0);
    _defineProperty(this, "search_start", 0);
    _defineProperty(this, "hash_start", 0);
    _defineProperty(this, "port", 0);
    /**
     * Refers to `ada::scheme::type`
     *
     * enum type : uint8_t {
     *   HTTP = 0,
     *   NOT_SPECIAL = 1,
     *   HTTPS = 2,
     *   WS = 3,
     *   FTP = 4,
     *   WSS = 5,
     *   FILE = 6
     * };
     * @type {number}
     */
    _defineProperty(this, "scheme_type", 1);
  }
  return _createClass(URLContext, [{
    key: "hasPort",
    get: function () {
      return this.port !== _omitted._;
    }
  }, {
    key: "hasSearch",
    get: function () {
      return this.search_start !== _omitted._;
    }
  }, {
    key: "hasHash",
    get: function () {
      return this.hash_start !== _omitted._;
    }
  }]);
}();
// This is the maximum value uint32_t can get.
// Ada uses uint32_t(-1) for declaring omitted values.
var _omitted = {
  _: 4294967295
};
var setURLSearchParamsModified;
var setURLSearchParamsContext;
var getURLSearchParamsList;
var setURLSearchParams;
var _target = /*#__PURE__*/new WeakMap();
var _kind = /*#__PURE__*/new WeakMap();
var _index = /*#__PURE__*/new WeakMap();
_inspect$custom = inspect.custom;
var URLSearchParamsIterator = /*#__PURE__*/function () {
  // https://heycam.github.io/webidl/#dfn-default-iterator-object
  function URLSearchParamsIterator(target, kind) {
    _classCallCheck(this, URLSearchParamsIterator);
    _classPrivateFieldInitSpec(this, _target, void 0);
    _classPrivateFieldInitSpec(this, _kind, void 0);
    _classPrivateFieldInitSpec(this, _index, void 0);
    _classPrivateFieldSet(_target, this, target);
    _classPrivateFieldSet(_kind, this, kind);
    _classPrivateFieldSet(_index, this, 0);
  }
  return _createClass(URLSearchParamsIterator, [{
    key: "next",
    value: function next() {
      if (typeof this !== 'object' || this === null || !_target.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParamsIterator');
      var index = _classPrivateFieldGet(_index, this);
      var values = getURLSearchParamsList(_classPrivateFieldGet(_target, this));
      var len = values.length;
      if (index >= len) {
        return {
          done: true,
          value: undefined
        };
      }
      var name = values[index];
      var value = values[index + 1];
      _classPrivateFieldSet(_index, this, index + 2);
      var result;
      if (_classPrivateFieldGet(_kind, this) === 'key') {
        result = name;
      } else if (_classPrivateFieldGet(_kind, this) === 'value') {
        result = value;
      } else {
        result = [name, value];
      }
      return {
        done: false,
        value: result
      };
    }
  }, {
    key: _inspect$custom,
    value: function (recurseTimes, ctx) {
      if (!this || typeof this !== 'object' || !_target.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParamsIterator');
      if (typeof recurseTimes === 'number' && recurseTimes < 0) return ctx.stylize('[Object]', 'special');
      var innerOpts = _objectSpread({}, ctx);
      if (recurseTimes !== null) {
        innerOpts.depth = recurseTimes - 1;
      }
      var index = _classPrivateFieldGet(_index, this);
      var values = getURLSearchParamsList(_classPrivateFieldGet(_target, this));
      var output = [];
      for (var i = index; i < values.length; i++) {
        var isKey = (i - index) % 2 === 0;
        if (_classPrivateFieldGet(_kind, this) === 'key') {
          if (isKey) ArrayPrototypePush(output, values[i]);
        } else if (!isKey) {
          ArrayPrototypePush(output, _classPrivateFieldGet(_kind, this) === 'value' ? values[i] : [values[i - 1], values[i]]);
        }
      }
      var hasBreak = StringPrototypeIncludes(inspect(output, innerOpts), '\n');
      var outputStrs = ArrayPrototypeMap(output, p => inspect(p, innerOpts));
      var outputStr;
      if (hasBreak) {
        outputStr = `\n  ${ArrayPrototypeJoin(outputStrs, ',\n  ')}`;
      } else {
        outputStr = ` ${ArrayPrototypeJoin(outputStrs, ', ')}`;
      }
      return `${this[SymbolToStringTag]} {${outputStr} }`;
    }
  }]);
}(); // https://heycam.github.io/webidl/#dfn-iterator-prototype-object
delete URLSearchParamsIterator.prototype.constructor;
ObjectSetPrototypeOf(URLSearchParamsIterator.prototype, IteratorPrototype);
ObjectDefineProperties(URLSearchParamsIterator.prototype, {
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'URLSearchParams Iterator'
  },
  next: kEnumerableProperty
});
var _searchParams = /*#__PURE__*/new WeakMap();
var _context = /*#__PURE__*/new WeakMap();
_inspect$custom2 = inspect.custom;
var URLSearchParams = /*#__PURE__*/function () {
  // URL Standard says the default value is '', but as undefined and '' have
  // the same result, undefined is used to prevent unnecessary parsing.
  // Default parameter is necessary to keep URLSearchParams.length === 0 in
  // accordance with Web IDL spec.
  function URLSearchParams() {
    var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, URLSearchParams);
    _classPrivateFieldInitSpec(this, _searchParams, []);
    // "associated url object"
    _classPrivateFieldInitSpec(this, _context, void 0);
    markTransferMode(this, false, false);
    if (init == null) {
      // Do nothing
    } else if (typeof init === 'object' || typeof init === 'function') {
      var method = init[SymbolIterator];
      if (method === this[SymbolIterator] && _searchParams.has(_checkInRHS(init))) {
        // While the spec does not have this branch, we can use it as a
        // shortcut to avoid having to go through the costly generic iterator.
        var childParams = _classPrivateFieldGet(_searchParams, init);
        _classPrivateFieldSet(_searchParams, this, childParams.slice());
      } else if (method != null) {
        // Sequence<sequence<USVString>>
        if (typeof method !== 'function') {
          throw new ERR_ARG_NOT_ITERABLE('Query pairs');
        }

        // The following implementation differs from the URL specification:
        // Sequences must first be converted from ECMAScript objects before
        // and operations are done on them, and the operation of converting
        // the sequences would first exhaust the iterators. If the iterator
        // returns something invalid in the middle, whether it would be called
        // after that would be an observable change to the users.
        // Exhausting the iterator and later converting them to USVString comes
        // with a significant cost (~40-80%). In order optimize URLSearchParams
        // creation duration, Node.js merges the iteration and converting
        // iterations into a single iteration.
        for (var pair of init) {
          if (pair == null) {
            throw new ERR_INVALID_TUPLE('Each query pair', '[name, value]');
          } else if (ArrayIsArray(pair)) {
            // If innerSequence's size is not 2, then throw a TypeError.
            if (pair.length !== 2) {
              throw new ERR_INVALID_TUPLE('Each query pair', '[name, value]');
            }
            // Append (innerSequence[0], innerSequence[1]) to query's list.
            ArrayPrototypePush(_classPrivateFieldGet(_searchParams, this), StringPrototypeToWellFormed(`${pair[0]}`), StringPrototypeToWellFormed(`${pair[1]}`));
          } else {
            if (typeof pair !== 'object' && typeof pair !== 'function' || typeof pair[SymbolIterator] !== 'function') {
              throw new ERR_INVALID_TUPLE('Each query pair', '[name, value]');
            }
            var length = 0;
            for (var element of pair) {
              length++;
              ArrayPrototypePush(_classPrivateFieldGet(_searchParams, this), StringPrototypeToWellFormed(`${element}`));
            }

            // If innerSequence's size is not 2, then throw a TypeError.
            if (length !== 2) {
              throw new ERR_INVALID_TUPLE('Each query pair', '[name, value]');
            }
          }
        }
      } else {
        // Record<USVString, USVString>
        // Need to use reflection APIs for full spec compliance.
        var visited = new SafeMap();
        var keys = ReflectOwnKeys(init);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var desc = ReflectGetOwnPropertyDescriptor(init, key);
          if (desc !== undefined && desc.enumerable) {
            var typedKey = StringPrototypeToWellFormed(key);
            var typedValue = StringPrototypeToWellFormed(`${init[key]}`);

            // Two different keys may become the same USVString after normalization.
            // In that case, we retain the later one. Refer to WPT.
            var keyIdx = visited.get(typedKey);
            if (keyIdx !== undefined) {
              _classPrivateFieldGet(_searchParams, this)[keyIdx] = typedValue;
            } else {
              visited.set(typedKey, ArrayPrototypePush(_classPrivateFieldGet(_searchParams, this), typedKey, typedValue) - 1);
            }
          }
        }
      }
    } else {
      // https://url.spec.whatwg.org/#dom-urlsearchparams-urlsearchparams
      init = StringPrototypeToWellFormed(`${init}`);
      _classPrivateFieldSet(_searchParams, this, init ? parseParams(init) : []);
    }
  }
  return _createClass(URLSearchParams, [{
    key: _inspect$custom2,
    value: function (recurseTimes, ctx) {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      if (typeof recurseTimes === 'number' && recurseTimes < 0) return ctx.stylize('[Object]', 'special');
      var separator = ', ';
      var innerOpts = _objectSpread({}, ctx);
      if (recurseTimes !== null) {
        innerOpts.depth = recurseTimes - 1;
      }
      var innerInspect = v => inspect(v, innerOpts);
      var list = _classPrivateFieldGet(_searchParams, this);
      var output = [];
      for (var i = 0; i < list.length; i += 2) ArrayPrototypePush(output, `${innerInspect(list[i])} => ${innerInspect(list[i + 1])}`);
      var length = -separator.length;
      for (var _i = 0; _i < output.length; _i++) {
        length += removeColors(output[_i]).length + separator.length;
      }
      if (length > ctx.breakLength) {
        return `${this.constructor.name} {\n` + `  ${ArrayPrototypeJoin(output, ',\n  ')} }`;
      } else if (output.length) {
        return `${this.constructor.name} { ` + `${ArrayPrototypeJoin(output, separator)} }`;
      }
      return `${this.constructor.name} {}`;
    }
  }, {
    key: "size",
    get: function () {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      return _classPrivateFieldGet(_searchParams, this).length / 2;
    }
  }, {
    key: "append",
    value: function append(name, value) {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS('name', 'value');
      }
      name = StringPrototypeToWellFormed(`${name}`);
      value = StringPrototypeToWellFormed(`${value}`);
      ArrayPrototypePush(_classPrivateFieldGet(_searchParams, this), name, value);
      if (_classPrivateFieldGet(_context, this)) {
        setURLSearchParamsModified(_classPrivateFieldGet(_context, this));
      }
    }
  }, {
    key: "delete",
    value: function _delete(name) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      if (arguments.length < 1) {
        throw new ERR_MISSING_ARGS('name');
      }
      var list = _classPrivateFieldGet(_searchParams, this);
      name = StringPrototypeToWellFormed(`${name}`);
      var {
        length
      } = list;
      var write = 0;
      if (value !== undefined) {
        value = StringPrototypeToWellFormed(`${value}`);
        for (var i = 0; i < length; i += 2) {
          if (list[i] === name && list[i + 1] === value) {
            continue;
          }
          if (write !== i) {
            list[write] = list[i];
            list[write + 1] = list[i + 1];
          }
          write += 2;
        }
      } else {
        for (var _i2 = 0; _i2 < length; _i2 += 2) {
          if (list[_i2] === name) {
            continue;
          }
          if (write !== _i2) {
            list[write] = list[_i2];
            list[write + 1] = list[_i2 + 1];
          }
          write += 2;
        }
      }
      if (write !== length) list.length = write;
      if (_classPrivateFieldGet(_context, this)) {
        setURLSearchParamsModified(_classPrivateFieldGet(_context, this));
      }
    }
  }, {
    key: "get",
    value: function get(name) {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      if (arguments.length < 1) {
        throw new ERR_MISSING_ARGS('name');
      }
      var list = _classPrivateFieldGet(_searchParams, this);
      name = StringPrototypeToWellFormed(`${name}`);
      for (var i = 0; i < list.length; i += 2) {
        if (list[i] === name) {
          return list[i + 1];
        }
      }
      return null;
    }
  }, {
    key: "getAll",
    value: function getAll(name) {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      if (arguments.length < 1) {
        throw new ERR_MISSING_ARGS('name');
      }
      var list = _classPrivateFieldGet(_searchParams, this);
      var values = [];
      name = StringPrototypeToWellFormed(`${name}`);
      for (var i = 0; i < list.length; i += 2) {
        if (list[i] === name) {
          values.push(list[i + 1]);
        }
      }
      return values;
    }
  }, {
    key: "has",
    value: function has(name) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      if (arguments.length < 1) {
        throw new ERR_MISSING_ARGS('name');
      }
      var list = _classPrivateFieldGet(_searchParams, this);
      name = StringPrototypeToWellFormed(`${name}`);
      if (value !== undefined) {
        value = StringPrototypeToWellFormed(`${value}`);
      }
      for (var i = 0; i < list.length; i += 2) {
        if (list[i] === name) {
          if (value === undefined || list[i + 1] === value) {
            return true;
          }
        }
      }
      return false;
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS('name', 'value');
      }
      var list = _classPrivateFieldGet(_searchParams, this);
      name = StringPrototypeToWellFormed(`${name}`);
      value = StringPrototypeToWellFormed(`${value}`);
      var {
        length
      } = list;

      // If there are any name-value pairs whose name is `name`, in `list`, set
      // the value of the first such name-value pair to `value` and remove the
      // others.
      var found = false;
      var write = 0;
      for (var i = 0; i < length; i += 2) {
        var cur = list[i];
        var keep = true;
        if (cur === name) {
          if (!found) {
            list[write] = cur;
            list[write + 1] = value;
            found = true;
          } else {
            keep = false;
          }
        } else if (write !== i) {
          list[write] = cur;
          list[write + 1] = list[i + 1];
        }
        if (keep) write += 2;
      }
      if (found && write !== length) {
        list.length = write;
      }

      // Otherwise, append a new name-value pair whose name is `name` and value
      // is `value`, to `list`.
      if (!found) {
        ArrayPrototypePush(list, name, value);
      }
      if (_classPrivateFieldGet(_context, this)) {
        setURLSearchParamsModified(_classPrivateFieldGet(_context, this));
      }
    }
  }, {
    key: "sort",
    value: function sort() {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      var a = _classPrivateFieldGet(_searchParams, this);
      var len = a.length;
      if (len <= 2) {
        // Nothing needs to be done.
      } else if (len < 100) {
        // 100 is found through testing.
        // Simple stable in-place insertion sort
        // Derived from v8/src/js/array.js
        for (var i = 2; i < len; i += 2) {
          var curKey = a[i];
          var curVal = a[i + 1];
          var j = void 0;
          for (j = i - 2; j >= 0; j -= 2) {
            if (a[j] > curKey) {
              a[j + 2] = a[j];
              a[j + 3] = a[j + 1];
            } else {
              break;
            }
          }
          a[j + 2] = curKey;
          a[j + 3] = curVal;
        }
      } else {
        // Bottom-up iterative stable merge sort
        var lBuffer = new Array(len);
        var rBuffer = new Array(len);
        for (var step = 2; step < len; step *= 2) {
          for (var start = 0; start < len - 2; start += 2 * step) {
            var mid = start + step;
            var end = mid + step;
            end = end < len ? end : len;
            if (mid > end) continue;
            merge(a, start, mid, end, lBuffer, rBuffer);
          }
        }
      }
      if (_classPrivateFieldGet(_context, this)) {
        setURLSearchParamsModified(_classPrivateFieldGet(_context, this));
      }
    }

    // https://heycam.github.io/webidl/#es-iterators
    // Define entries here rather than [Symbol.iterator] as the function name
    // must be set to `entries`.
  }, {
    key: "entries",
    value: function entries() {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      return new URLSearchParamsIterator(this, 'key+value');
    }
  }, {
    key: "forEach",
    value: function forEach(callback) {
      var thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      validateFunction(callback, 'callback');
      var list = _classPrivateFieldGet(_searchParams, this);
      var i = 0;
      while (i < list.length) {
        var key = list[i];
        var value = list[i + 1];
        callback.call(thisArg, value, key, this);
        // In case the URL object's `search` is updated
        list = _classPrivateFieldGet(_searchParams, this);
        i += 2;
      }
    }

    // https://heycam.github.io/webidl/#es-iterable
  }, {
    key: "keys",
    value: function keys() {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      return new URLSearchParamsIterator(this, 'key');
    }
  }, {
    key: "values",
    value: function values() {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      return new URLSearchParamsIterator(this, 'value');
    }

    // https://heycam.github.io/webidl/#es-stringifier
    // https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
  }, {
    key: "toString",
    value: function toString() {
      if (typeof this !== 'object' || this === null || !_searchParams.has(_checkInRHS(this))) throw new ERR_INVALID_THIS('URLSearchParams');
      return serializeParams(_classPrivateFieldGet(_searchParams, this));
    }
  }]);
}();
(() => {
  setURLSearchParamsContext = (obj, ctx) => {
    _classPrivateFieldSet(_context, obj, ctx);
  };
  getURLSearchParamsList = obj => _classPrivateFieldGet(_searchParams, obj);
  setURLSearchParams = (obj, query) => {
    if (query === undefined) {
      _classPrivateFieldSet(_searchParams, obj, []);
    } else {
      _classPrivateFieldSet(_searchParams, obj, parseParams(query));
    }
  };
})();
ObjectDefineProperties(URLSearchParams.prototype, {
  append: kEnumerableProperty,
  delete: kEnumerableProperty,
  get: kEnumerableProperty,
  getAll: kEnumerableProperty,
  has: kEnumerableProperty,
  set: kEnumerableProperty,
  size: kEnumerableProperty,
  sort: kEnumerableProperty,
  entries: kEnumerableProperty,
  forEach: kEnumerableProperty,
  keys: kEnumerableProperty,
  values: kEnumerableProperty,
  toString: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'URLSearchParams'
  },
  // https://heycam.github.io/webidl/#es-iterable-entries
  [SymbolIterator]: {
    __proto__: null,
    configurable: true,
    writable: true,
    value: URLSearchParams.prototype.entries
  }
});

/**
 * Checks if a value has the shape of a WHATWG URL object.
 *
 * Using a symbol or instanceof would not be able to recognize URL objects
 * coming from other implementations (e.g. in Electron), so instead we are
 * checking some well known properties for a lack of a better test.
 *
 * We use `href` and `protocol` as they are the only properties that are
 * easy to retrieve and calculate due to the lazy nature of the getters.
 *
 * We check for `auth` and `path` attribute to distinguish legacy url instance with
 * WHATWG URL instance.
 * @param {*} self
 * @returns {self is URL}
 */
function isURL(self) {
  return Boolean(self?.href && self.protocol && self.auth === undefined && self.path === undefined);
}

/**
 * A unique symbol used as a private identifier to safely invoke the URL constructor
 * with a special parsing behavior. When passed as the third argument to the URL
 * constructor, it signals that the constructor should not throw an exception
 * for invalid URL inputs.
 */
var kParseURLSymbol = _Symbol('kParseURL');
var kCreateURLFromPosixPathSymbol = _Symbol('kCreateURLFromPosixPath');
var kCreateURLFromWindowsPathSymbol = _Symbol('kCreateURLFromWindowsPath');
var _context2 = /*#__PURE__*/new WeakMap();
var _searchParams2 = /*#__PURE__*/new WeakMap();
var _searchParamsModified = /*#__PURE__*/new WeakMap();
var _URL_brand = /*#__PURE__*/new WeakSet();
_inspect$custom3 = inspect.custom;
var URL = /*#__PURE__*/function () {
  function URL(input) {
    var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var parseSymbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    _classCallCheck(this, URL);
    _classPrivateMethodInitSpec(this, _URL_brand);
    _classPrivateFieldInitSpec(this, _context2, new URLContext());
    _classPrivateFieldInitSpec(this, _searchParams2, void 0);
    _classPrivateFieldInitSpec(this, _searchParamsModified, void 0);
    markTransferMode(this, false, false);
    if (arguments.length === 0) {
      throw new ERR_MISSING_ARGS('url');
    }

    // StringPrototypeToWellFormed is not needed.
    input = `${input}`;
    if (base !== undefined) {
      base = `${base}`;
    }
    var _href;
    if (arguments.length < 3) {
      _href = bindingUrl.parse(input, base, true);
    } else {
      var raiseException = parseSymbol !== kParseURLSymbol;
      var interpretAsWindowsPath = parseSymbol === kCreateURLFromWindowsPathSymbol;
      var _pathToFileURL = interpretAsWindowsPath || parseSymbol === kCreateURLFromPosixPathSymbol;
      _href = _pathToFileURL ? bindingUrl.pathToFileURL(input, interpretAsWindowsPath, base) : bindingUrl.parse(input, base, raiseException);
    }
    if (_href) {
      _assertClassBrand(_URL_brand, this, _updateContext).call(this, _href);
    }
  }
  return _createClass(URL, [{
    key: _inspect$custom3,
    value: function (depth, opts) {
      if (typeof depth === 'number' && depth < 0) return this;
      var constructor = getConstructorOf(this) || URL;
      var obj = {
        __proto__: {
          constructor
        }
      };
      obj.href = this.href;
      obj.origin = this.origin;
      obj.protocol = this.protocol;
      obj.username = this.username;
      obj.password = this.password;
      obj.host = this.host;
      obj.hostname = this.hostname;
      obj.port = this.port;
      obj.pathname = this.pathname;
      obj.search = this.search;
      obj.searchParams = this.searchParams;
      obj.hash = this.hash;
      if (opts.showHidden) {
        obj[contextForInspect] = _classPrivateFieldGet(_context2, this);
      }
      return `${constructor.name} ${inspect(obj, opts)}`;
    }
  }, {
    key: "toString",
    value: function toString() {
      // Updates to URLSearchParams are lazily propagated to URL, so we need to check we're in sync.
      _assertClassBrand(_URL_brand, this, _ensureSearchParamsUpdated).call(this);
      return _classPrivateFieldGet(_context2, this).href;
    }
  }, {
    key: "href",
    get: function () {
      // Updates to URLSearchParams are lazily propagated to URL, so we need to check we're in sync.
      _assertClassBrand(_URL_brand, this, _ensureSearchParamsUpdated).call(this);
      return _classPrivateFieldGet(_context2, this).href;
    },
    set: function (value) {
      value = `${value}`;
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kHref, value);
      if (!href) {
        throw new ERR_INVALID_URL(value);
      }
      _assertClassBrand(_URL_brand, this, _updateContext).call(this, href, true);
    }

    // readonly
  }, {
    key: "origin",
    get: function () {
      var protocol = StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, 0, _classPrivateFieldGet(_context2, this).protocol_end);

      // Check if scheme_type is not `NOT_SPECIAL`
      if (_classPrivateFieldGet(_context2, this).scheme_type !== 1) {
        // Check if scheme_type is `FILE`
        if (_classPrivateFieldGet(_context2, this).scheme_type === 6) {
          return 'null';
        }
        return `${protocol}//${this.host}`;
      }
      if (protocol === 'blob:') {
        var _path = this.pathname;
        if (_path.length > 0) {
          try {
            var out = new URL(_path);
            // Only return origin of scheme is `http` or `https`
            // Otherwise return a new opaque origin (null).
            if (_classPrivateFieldGet(_context2, out).scheme_type === 0 || _classPrivateFieldGet(_context2, out).scheme_type === 2) {
              return `${out.protocol}//${out.host}`;
            }
          } catch {
            // Do nothing.
          }
        }
      }
      return 'null';
    }
  }, {
    key: "protocol",
    get: function () {
      return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, 0, _classPrivateFieldGet(_context2, this).protocol_end);
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kProtocol, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "username",
    get: function () {
      if (_classPrivateFieldGet(_context2, this).protocol_end + 2 < _classPrivateFieldGet(_context2, this).username_end) {
        return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, _classPrivateFieldGet(_context2, this).protocol_end + 2, _classPrivateFieldGet(_context2, this).username_end);
      }
      return '';
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kUsername, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "password",
    get: function () {
      if (_classPrivateFieldGet(_context2, this).host_start - _classPrivateFieldGet(_context2, this).username_end > 0) {
        return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, _classPrivateFieldGet(_context2, this).username_end + 1, _classPrivateFieldGet(_context2, this).host_start);
      }
      return '';
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kPassword, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "host",
    get: function () {
      var startsAt = _classPrivateFieldGet(_context2, this).host_start;
      if (_classPrivateFieldGet(_context2, this).href[startsAt] === '@') {
        startsAt++;
      }
      // If we have an empty host, then the space between components.host_end and
      // components.pathname_start may be occupied by /.
      if (startsAt === _classPrivateFieldGet(_context2, this).host_end) {
        return '';
      }
      return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, startsAt, _classPrivateFieldGet(_context2, this).pathname_start);
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kHost, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "hostname",
    get: function () {
      var startsAt = _classPrivateFieldGet(_context2, this).host_start;
      // host_start might be "@" if the URL has credentials
      if (_classPrivateFieldGet(_context2, this).href[startsAt] === '@') {
        startsAt++;
      }
      return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, startsAt, _classPrivateFieldGet(_context2, this).host_end);
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kHostname, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "port",
    get: function () {
      if (_classPrivateFieldGet(_context2, this).hasPort) {
        return `${_classPrivateFieldGet(_context2, this).port}`;
      }
      return '';
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kPort, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "pathname",
    get: function () {
      var endsAt;
      if (_classPrivateFieldGet(_context2, this).hasSearch) {
        endsAt = _classPrivateFieldGet(_context2, this).search_start;
      } else if (_classPrivateFieldGet(_context2, this).hasHash) {
        endsAt = _classPrivateFieldGet(_context2, this).hash_start;
      }
      return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, _classPrivateFieldGet(_context2, this).pathname_start, endsAt);
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kPathname, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "search",
    get: function () {
      // Updates to URLSearchParams are lazily propagated to URL, so we need to check we're in sync.
      _assertClassBrand(_URL_brand, this, _ensureSearchParamsUpdated).call(this);
      return _assertClassBrand(_URL_brand, this, _getSearchFromContext).call(this);
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kSearch, StringPrototypeToWellFormed(`${value}`));
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href, true);
      }
    }

    // readonly
  }, {
    key: "searchParams",
    get: function () {
      // Create URLSearchParams on demand to greatly improve the URL performance.
      if (_classPrivateFieldGet(_searchParams2, this) == null) {
        _classPrivateFieldSet(_searchParams2, this, new URLSearchParams(_assertClassBrand(_URL_brand, this, _getSearchFromContext).call(this)));
        setURLSearchParamsContext(_classPrivateFieldGet(_searchParams2, this), this);
        _classPrivateFieldSet(_searchParamsModified, this, false);
      }
      return _classPrivateFieldGet(_searchParams2, this);
    }
  }, {
    key: "hash",
    get: function () {
      if (!_classPrivateFieldGet(_context2, this).hasHash || _classPrivateFieldGet(_context2, this).href.length - _classPrivateFieldGet(_context2, this).hash_start <= 1) {
        return '';
      }
      return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, _classPrivateFieldGet(_context2, this).hash_start);
    },
    set: function (value) {
      var href = bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kHash, `${value}`);
      if (href) {
        _assertClassBrand(_URL_brand, this, _updateContext).call(this, href);
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      // Updates to URLSearchParams are lazily propagated to URL, so we need to check we're in sync.
      _assertClassBrand(_URL_brand, this, _ensureSearchParamsUpdated).call(this);
      return _classPrivateFieldGet(_context2, this).href;
    }
  }], [{
    key: "parse",
    value: function parse(input) {
      var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('url');
      }
      var parsedURLObject = new URL(input, base, kParseURLSymbol);
      return parsedURLObject.href ? parsedURLObject : null;
    }
  }, {
    key: "canParse",
    value: function canParse(url) {
      var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      if (arguments.length === 0) {
        throw new ERR_MISSING_ARGS('url');
      }
      url = `${url}`;
      if (base !== undefined) {
        return bindingUrl.canParse(url, `${base}`);
      }

      // It is important to differentiate the canParse call statements
      // since they resolve into different v8 fast api overloads.
      return bindingUrl.canParse(url);
    }
  }]);
}();
function _getSearchFromContext() {
  if (!_classPrivateFieldGet(_context2, this).hasSearch) return '';
  var endsAt = _classPrivateFieldGet(_context2, this).href.length;
  if (_classPrivateFieldGet(_context2, this).hasHash) endsAt = _classPrivateFieldGet(_context2, this).hash_start;
  if (endsAt - _classPrivateFieldGet(_context2, this).search_start <= 1) return '';
  return StringPrototypeSlice(_classPrivateFieldGet(_context2, this).href, _classPrivateFieldGet(_context2, this).search_start, endsAt);
}
function _getSearchFromParams() {
  if (!_classPrivateFieldGet(_searchParams2, this)?.size) return '';
  return `?${_classPrivateFieldGet(_searchParams2, this)}`;
}
function _ensureSearchParamsUpdated() {
  // URL is updated lazily to greatly improve performance when URLSearchParams is updated repeatedly.
  // If URLSearchParams has been modified, reflect that back into URL, without cascading back.
  if (_classPrivateFieldGet(_searchParamsModified, this)) {
    _classPrivateFieldSet(_searchParamsModified, this, false);
    _assertClassBrand(_URL_brand, this, _updateContext).call(this, bindingUrl.update(_classPrivateFieldGet(_context2, this).href, updateActions.kSearch, _assertClassBrand(_URL_brand, this, _getSearchFromParams).call(this)));
  }
}
/**
 * Update the internal context state for URL.
 * @param {string} href New href string from `bindingUrl.update`.
 * @param {boolean} [shouldUpdateSearchParams] If the update has potential to update search params (href/search).
 */
function _updateContext(href) {
  var shouldUpdateSearchParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var previousSearch = shouldUpdateSearchParams && _classPrivateFieldGet(_searchParams2, this) && (_classPrivateFieldGet(_searchParamsModified, this) ? _assertClassBrand(_URL_brand, this, _getSearchFromParams).call(this) : _assertClassBrand(_URL_brand, this, _getSearchFromContext).call(this));
  _classPrivateFieldGet(_context2, this).href = href;
  var {
    0: protocol_end,
    1: username_end,
    2: host_start,
    3: host_end,
    4: port,
    5: pathname_start,
    6: search_start,
    7: hash_start,
    8: scheme_type
  } = bindingUrl.urlComponents;
  _classPrivateFieldGet(_context2, this).protocol_end = protocol_end;
  _classPrivateFieldGet(_context2, this).username_end = username_end;
  _classPrivateFieldGet(_context2, this).host_start = host_start;
  _classPrivateFieldGet(_context2, this).host_end = host_end;
  _classPrivateFieldGet(_context2, this).port = port;
  _classPrivateFieldGet(_context2, this).pathname_start = pathname_start;
  _classPrivateFieldGet(_context2, this).search_start = search_start;
  _classPrivateFieldGet(_context2, this).hash_start = hash_start;
  _classPrivateFieldGet(_context2, this).scheme_type = scheme_type;
  if (_classPrivateFieldGet(_searchParams2, this)) {
    // If the search string has updated, URL becomes the source of truth, and we update URLSearchParams.
    // Only do this when we're expecting it to have changed, otherwise a change to hash etc.
    // would incorrectly compare the URLSearchParams state to the empty URL search state.
    if (shouldUpdateSearchParams) {
      var currentSearch = _assertClassBrand(_URL_brand, this, _getSearchFromContext).call(this);
      if (previousSearch !== currentSearch) {
        setURLSearchParams(_classPrivateFieldGet(_searchParams2, this), currentSearch);
        _classPrivateFieldSet(_searchParamsModified, this, false);
      }
    }

    // If we have a URLSearchParams, ensure that URL is up-to-date with any modification to it.
    _assertClassBrand(_URL_brand, this, _ensureSearchParamsUpdated).call(this);
  }
}
setURLSearchParamsModified = obj => {
  // When URLSearchParams changes, we lazily update URL on the next read/write for performance.
  _classPrivateFieldSet(_searchParamsModified, obj, true);

  // If URL has an existing search, remove it without cascading back to URLSearchParams.
  // Do this to avoid any internal confusion about whether URLSearchParams or URL is up-to-date.
  if (_classPrivateFieldGet(_context2, obj).hasSearch) {
    _assertClassBrand(_URL_brand, obj, _updateContext).call(obj, bindingUrl.update(_classPrivateFieldGet(_context2, obj).href, updateActions.kSearch, ''));
  }
};
ObjectDefineProperties(URL.prototype, {
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'URL'
  },
  toString: kEnumerableProperty,
  href: kEnumerableProperty,
  origin: kEnumerableProperty,
  protocol: kEnumerableProperty,
  username: kEnumerableProperty,
  password: kEnumerableProperty,
  host: kEnumerableProperty,
  hostname: kEnumerableProperty,
  port: kEnumerableProperty,
  pathname: kEnumerableProperty,
  search: kEnumerableProperty,
  searchParams: kEnumerableProperty,
  hash: kEnumerableProperty,
  toJSON: kEnumerableProperty
});
ObjectDefineProperties(URL, {
  canParse: {
    __proto__: null,
    configurable: true,
    writable: true,
    enumerable: true
  },
  parse: {
    __proto__: null,
    configurable: true,
    writable: true,
    enumerable: true
  }
});
function installObjectURLMethods() {
  var bindingBlob = internalBinding('blob');
  function createObjectURL(obj) {
    var cryptoRandom = lazyCryptoRandom();
    if (cryptoRandom === undefined) throw new ERR_NO_CRYPTO();
    var blob = lazyBlob();
    if (!blob.isBlob(obj)) throw new ERR_INVALID_ARG_TYPE('obj', 'Blob', obj);
    var id = cryptoRandom.randomUUID();
    bindingBlob.storeDataObject(id, obj[blob.kHandle], obj.size, obj.type);
    return `blob:nodedata:${id}`;
  }
  function revokeObjectURL(url) {
    if (arguments.length === 0) {
      throw new ERR_MISSING_ARGS('url');
    }
    bindingBlob.revokeObjectURL(`${url}`);
  }
  ObjectDefineProperties(URL, {
    createObjectURL: {
      __proto__: null,
      configurable: true,
      writable: true,
      enumerable: true,
      value: createObjectURL
    },
    revokeObjectURL: {
      __proto__: null,
      configurable: true,
      writable: true,
      enumerable: true,
      value: revokeObjectURL
    }
  });
}

// application/x-www-form-urlencoded parser
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-parser
function parseParams(qs) {
  var out = [];
  var seenSep = false;
  var buf = '';
  var encoded = false;
  var encodeCheck = 0;
  var i = qs[0] === '?' ? 1 : 0;
  var pairStart = i;
  var lastPos = i;
  for (; i < qs.length; ++i) {
    var code = StringPrototypeCharCodeAt(qs, i);

    // Try matching key/value pair separator
    if (code === CHAR_AMPERSAND) {
      if (pairStart === i) {
        // We saw an empty substring between pair separators
        lastPos = pairStart = i + 1;
        continue;
      }
      if (lastPos < i) buf += qs.slice(lastPos, i);
      if (encoded) buf = querystring.unescape(buf);
      out.push(buf);

      // If `buf` is the key, add an empty value.
      if (!seenSep) out.push('');
      seenSep = false;
      buf = '';
      encoded = false;
      encodeCheck = 0;
      lastPos = pairStart = i + 1;
      continue;
    }

    // Try matching key/value separator (e.g. '=') if we haven't already
    if (!seenSep && code === CHAR_EQUAL) {
      // Key/value separator match!
      if (lastPos < i) buf += qs.slice(lastPos, i);
      if (encoded) buf = querystring.unescape(buf);
      out.push(buf);
      seenSep = true;
      buf = '';
      encoded = false;
      encodeCheck = 0;
      lastPos = i + 1;
      continue;
    }

    // Handle + and percent decoding.
    if (code === CHAR_PLUS) {
      if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i);
      buf += ' ';
      lastPos = i + 1;
    } else if (!encoded) {
      // Try to match an (valid) encoded byte (once) to minimize unnecessary
      // calls to string decoding functions
      if (code === CHAR_PERCENT) {
        encodeCheck = 1;
      } else if (encodeCheck > 0) {
        if (isHexTable[code] === 1) {
          if (++encodeCheck === 3) {
            encoded = true;
          }
        } else {
          encodeCheck = 0;
        }
      }
    }
  }

  // Deal with any leftover key or value data

  // There is a trailing &. No more processing is needed.
  if (pairStart === i) return out;
  if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i);
  if (encoded) buf = querystring.unescape(buf);
  ArrayPrototypePush(out, buf);

  // If `buf` is the key, add an empty value.
  if (!seenSep) ArrayPrototypePush(out, '');
  return out;
}

// Adapted from querystring's implementation.
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-byte-serializer
var noEscape = new Int8Array([
/*
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F
*/
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 0x00 - 0x0F
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// 0x10 - 0x1F
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0,
// 0x20 - 0x2F
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
// 0x30 - 0x3F
0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 0x40 - 0x4F
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
// 0x50 - 0x5F
0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 0x60 - 0x6F
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 // 0x70 - 0x7F
]);

// Special version of hexTable that uses `+` for U+0020 SPACE.
var paramHexTable = hexTable.slice();
paramHexTable[0x20] = '+';

// application/x-www-form-urlencoded serializer
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-serializer
function serializeParams(array) {
  var len = array.length;
  if (len === 0) return '';
  var firstEncodedParam = encodeStr(array[0], noEscape, paramHexTable);
  var firstEncodedValue = encodeStr(array[1], noEscape, paramHexTable);
  var output = `${firstEncodedParam}=${firstEncodedValue}`;
  for (var i = 2; i < len; i += 2) {
    var encodedParam = encodeStr(array[i], noEscape, paramHexTable);
    var encodedValue = encodeStr(array[i + 1], noEscape, paramHexTable);
    output += `&${encodedParam}=${encodedValue}`;
  }
  return output;
}

// for merge sort
function merge(out, start, mid, end, lBuffer, rBuffer) {
  var sizeLeft = mid - start;
  var sizeRight = end - mid;
  var l, r, o;
  for (l = 0; l < sizeLeft; l++) lBuffer[l] = out[start + l];
  for (r = 0; r < sizeRight; r++) rBuffer[r] = out[mid + r];
  l = 0;
  r = 0;
  o = start;
  while (l < sizeLeft && r < sizeRight) {
    if (lBuffer[l] <= rBuffer[r]) {
      out[o++] = lBuffer[l++];
      out[o++] = lBuffer[l++];
    } else {
      out[o++] = rBuffer[r++];
      out[o++] = rBuffer[r++];
    }
  }
  while (l < sizeLeft) out[o++] = lBuffer[l++];
  while (r < sizeRight) out[o++] = rBuffer[r++];
}
function domainToASCII(domain) {
  if (arguments.length < 1) throw new ERR_MISSING_ARGS('domain');

  // StringPrototypeToWellFormed is not needed.
  return bindingUrl.domainToASCII(`${domain}`);
}
function domainToUnicode(domain) {
  if (arguments.length < 1) throw new ERR_MISSING_ARGS('domain');

  // StringPrototypeToWellFormed is not needed.
  return bindingUrl.domainToUnicode(`${domain}`);
}

/**
 * Utility function that converts a URL object into an ordinary options object
 * as expected by the `http.request` and `https.request` APIs.
 * @param {URL} url
 * @returns {Record<string, unknown>}
 */
function urlToHttpOptions(url) {
  validateObject(url, 'url', kValidateObjectAllowObjects);
  var {
    hostname,
    pathname,
    port,
    username,
    password,
    search
  } = url;
  var options = _objectSpread(_objectSpread({
    __proto__: null
  }, url), {}, {
    // In case the url object was extended by the user.
    protocol: url.protocol,
    hostname: hostname && hostname[0] === '[' ? StringPrototypeSlice(hostname, 1, -1) : hostname,
    hash: url.hash,
    search: search,
    pathname: pathname,
    path: `${pathname || ''}${search || ''}`,
    href: url.href
  });
  if (port !== '') {
    options.port = _Number(port);
  }
  if (username || password) {
    options.auth = `${decodeURIComponent(username)}:${decodeURIComponent(password)}`;
  }
  return options;
}
function getPathFromURLWin32(url) {
  var hostname = url.hostname;
  var pathname = url.pathname;
  for (var n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      var third = StringPrototypeCodePointAt(pathname, n + 2) | 0x20;
      if (pathname[n + 1] === '2' && third === 102 ||
      // 2f 2F /
      pathname[n + 1] === '5' && third === 99) {
        // 5c 5C \
        throw new ERR_INVALID_FILE_URL_PATH('must not include encoded \\ or / characters', url);
      }
    }
  }
  pathname = SideEffectFreeRegExpPrototypeSymbolReplace(FORWARD_SLASH, pathname, '\\');
  // Fast-path: if there is no percent-encoding, avoid decodeURIComponent.
  if (StringPrototypeIncludes(pathname, '%')) {
    pathname = decodeURIComponent(pathname);
  }
  if (hostname !== '') {
    // If hostname is set, then we have a UNC path
    // Pass the hostname through domainToUnicode just in case
    // it is an IDN using punycode encoding. We do not need to worry
    // about percent encoding because the URL parser will have
    // already taken care of that for us. Note that this only
    // causes IDNs with an appropriate `xn--` prefix to be decoded.
    return `\\\\${domainToUnicode(hostname)}${pathname}`;
  }
  // Otherwise, it's a local path that requires a drive letter
  var letter = StringPrototypeCodePointAt(pathname, 1) | 0x20;
  var sep = StringPrototypeCharAt(pathname, 2);
  if (letter < CHAR_LOWERCASE_A || letter > CHAR_LOWERCASE_Z ||
  // a..z A..Z
  sep !== ':') {
    throw new ERR_INVALID_FILE_URL_PATH('must be absolute', url);
  }
  return StringPrototypeSlice(pathname, 1);
}
function getPathBufferFromURLWin32(url) {
  var hostname = url.hostname;
  var pathname = url.pathname;
  // In the getPathFromURLWin32 variant, we scan the input for backslash (\)
  // and forward slash (/) characters, specifically looking for the ASCII/UTF8
  // encoding these and forbidding their use. This is a bit tricky
  // because these may conflict with non-UTF8 encodings. For instance,
  // in shift-jis, %5C identifies the symbol for the Japanese Yen and not the
  // backslash. If we have a url like file:///foo/%5c/bar, then we really have
  // no way of knowing if that %5c is meant to be a backslash \ or a yen sign.
  // Passing in an encoding option does not help since our Buffer encoding only
  // knows about certain specific text encodings and a single file path might
  // actually contain segments that use multiple encodings. It's tricky! So,
  // for this variation where we are producing a buffer, we won't scan for the
  // slashes at all, and instead will decode the bytes literally into the
  // returned Buffer. That said, that can also be tricky because, on windows,
  // the file path separator *is* the ASCII backslash. This is a known issue
  // on windows specific to the Shift-JIS encoding that we're not really going
  // to solve here. Instead, we're going to do the best we can and just
  // interpret the input url as a sequence of bytes.

  // Because we are converting to a Windows file path here, we need to replace
  // the explicit forward slash separators with backslashes. Note that this
  // intentionally disregards any percent-encoded forward slashes in the path.
  pathname = SideEffectFreeRegExpPrototypeSymbolReplace(FORWARD_SLASH, pathname, '\\');

  // Now, let's start to build our Buffer. We will initially start with a
  // Buffer allocated to fit in the entire string. Worst case there are no
  // percent encoded characters and we take the string as is. Any invalid
  // percent encodings, e.g. `%ZZ` are ignored and are passed through
  // literally.
  var decodedu8 = percentDecode(Buffer.from(pathname, 'utf8'));
  var decodedPathname = Buffer.from(TypedArrayPrototypeGetBuffer(decodedu8), TypedArrayPrototypeGetByteOffset(decodedu8), TypedArrayPrototypeGetByteLength(decodedu8));
  if (hostname !== '') {
    // If hostname is set, then we have a UNC path
    // Pass the hostname through domainToUnicode just in case
    // it is an IDN using punycode encoding. We do not need to worry
    // about percent encoding because the URL parser will have
    // already taken care of that for us. Note that this only
    // causes IDNs with an appropriate `xn--` prefix to be decoded.

    // This is a bit tricky because of the need to convert to a Buffer
    // followed by concatenation of the results.
    var prefix = Buffer.from('\\\\', 'ascii');
    var domain = Buffer.from(domainToUnicode(hostname), 'utf8');
    return Buffer.concat([prefix, domain, decodedPathname]);
  }
  // Otherwise, it's a local path that requires a drive letter
  // In this case we're only going to pay attention to the second and
  // third bytes in the decodedPathname. If first byte is either an ASCII
  // uppercase letter between 'A' and 'Z' or lowercase letter between
  // 'a' and 'z', and the second byte must be an ASCII `:` or the
  // operation will fail.

  var letter = decodedPathname[1] | 0x20;
  var sep = decodedPathname[2];
  if (letter < CHAR_LOWERCASE_A || letter > CHAR_LOWERCASE_Z ||
  // a..z A..Z
  sep !== CHAR_COLON) {
    throw new ERR_INVALID_FILE_URL_PATH('must be absolute', url);
  }

  // Now, we'll just return everything except the first byte of
  // decodedPathname
  return decodedPathname.subarray(1);
}
function getPathFromURLPosix(url) {
  if (url.hostname !== '') {
    throw new ERR_INVALID_FILE_URL_HOST(platform);
  }
  var pathname = url.pathname;
  for (var n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      var third = StringPrototypeCodePointAt(pathname, n + 2) | 0x20;
      if (pathname[n + 1] === '2' && third === 102) {
        throw new ERR_INVALID_FILE_URL_PATH('must not include encoded / characters', url);
      }
    }
  }
  // Fast-path: if there is no percent-encoding, avoid decodeURIComponent.
  return StringPrototypeIncludes(pathname, '%') ? decodeURIComponent(pathname) : pathname;
}
function getPathBufferFromURLPosix(url) {
  if (url.hostname !== '') {
    throw new ERR_INVALID_FILE_URL_HOST(platform);
  }
  var pathname = url.pathname;

  // In the getPathFromURLPosix variant, we scan the input for forward slash
  // (/) characters, specifically looking for the ASCII/UTF8 and forbidding
  // its use. This is a bit tricky because these may conflict with non-UTF8
  // encodings. Passing in an encoding option does not help since our Buffer
  // encoding only knows about certain specific text encodings and a single
  // file path might actually contain segments that use multiple encodings.
  // It's tricky! So, for this variation where we are producing a buffer, we
  // won't scan for the slashes at all, and instead will decode the bytes
  // literally into the returned Buffer. We're going to do the best we can and
  // just interpret the input url as a sequence of bytes.
  var u8 = percentDecode(Buffer.from(pathname, 'utf8'));
  return Buffer.from(TypedArrayPrototypeGetBuffer(u8), TypedArrayPrototypeGetByteOffset(u8), TypedArrayPrototypeGetByteLength(u8));
}
function fileURLToPath(path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var windows = options?.windows;
  if (typeof path === 'string') path = new URL(path);else if (!isURL(path)) throw new ERR_INVALID_ARG_TYPE('path', ['string', 'URL'], path);
  if (path.protocol !== 'file:') throw new ERR_INVALID_URL_SCHEME('file');
  return windows ?? isWindows ? getPathFromURLWin32(path) : getPathFromURLPosix(path);
}

// An alternative to fileURLToPath that outputs a Buffer
// instead of a string. The other fileURLToPath does not
// handle non-UTF8 encoded percent encodings at all, so
// converting to a Buffer is necessary in cases where the
// to string conversion would fail.
function fileURLToPathBuffer(path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var windows = options?.windows;
  if (typeof path === 'string') {
    path = new URL(path);
  } else if (!isURL(path)) {
    throw new ERR_INVALID_ARG_TYPE('path', ['string', 'URL'], path);
  }
  if (path.protocol !== 'file:') {
    throw new ERR_INVALID_URL_SCHEME('file');
  }
  return windows ?? isWindows ? getPathBufferFromURLWin32(path) : getPathBufferFromURLPosix(path);
}
function pathToFileURL(filepath) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  var windows = options?.windows ?? isWindows;
  var isUNC = windows && StringPrototypeStartsWith(filepath, '\\\\');
  var resolved = isUNC ? filepath : windows ? path.win32.resolve(filepath) : path.posix.resolve(filepath);
  if (isUNC || windows && StringPrototypeStartsWith(resolved, '\\\\')) {
    // UNC path format: \\server\share\resource
    // Handle extended UNC path and standard UNC path
    // "\\?\UNC\" path prefix should be ignored.
    // Ref: https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation
    var isExtendedUNC = StringPrototypeStartsWith(resolved, '\\\\?\\UNC\\');
    var prefixLength = isExtendedUNC ? 8 : 2;
    var hostnameEndIndex = StringPrototypeIndexOf(resolved, '\\', prefixLength);
    if (hostnameEndIndex === -1) {
      throw new ERR_INVALID_ARG_VALUE('path', resolved, 'Missing UNC resource path');
    }
    if (hostnameEndIndex === 2) {
      throw new ERR_INVALID_ARG_VALUE('path', resolved, 'Empty UNC servername');
    }
    var hostname = StringPrototypeSlice(resolved, prefixLength, hostnameEndIndex);
    return new URL(StringPrototypeSlice(resolved, hostnameEndIndex), hostname, kCreateURLFromWindowsPathSymbol);
  }
  // path.resolve strips trailing slashes so we must add them back
  var filePathLast = StringPrototypeCharCodeAt(filepath, filepath.length - 1);
  if ((filePathLast === CHAR_FORWARD_SLASH || (windows ?? isWindows) && filePathLast === CHAR_BACKWARD_SLASH) && resolved[resolved.length - 1] !== path.sep) resolved += '/';
  return new URL(resolved, undefined, windows ? kCreateURLFromWindowsPathSymbol : kCreateURLFromPosixPathSymbol);
}
function toPathIfFileURL(fileURLOrPath) {
  if (!isURL(fileURLOrPath)) return fileURLOrPath;
  return fileURLToPath(fileURLOrPath);
}

/**
 * This util takes a string containing a URL and return the URL origin,
 * its meant to avoid calls to `new URL` constructor.
 * @param {string} url
 * @returns {URL['origin']}
 */
function getURLOrigin(url) {
  return bindingUrl.getOrigin(url);
}
module.exports = {
  fileURLToPath,
  fileURLToPathBuffer,
  pathToFileURL,
  toPathIfFileURL,
  installObjectURLMethods,
  URL,
  URLPattern,
  URLSearchParams,
  URLParse: URL.parse,
  domainToASCII,
  domainToUnicode,
  urlToHttpOptions,
  encodeStr,
  isURL,
  urlUpdateActions: updateActions,
  getURLOrigin,
  unsafeProtocol,
  hostlessProtocol,
  slashedProtocol
};

