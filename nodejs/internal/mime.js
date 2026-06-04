'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  FunctionPrototypeCall,
  ObjectDefineProperty,
  RegExpPrototypeExec,
  SafeMap,
  SafeStringPrototypeSearch,
  StringPrototypeCharAt,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeToLowerCase,
  SymbolIterator
} = primordials;
var {
  ERR_INVALID_MIME_SYNTAX
} = require('internal/errors').codes;
var NOT_HTTP_TOKEN_CODE_POINT = /[^!#$%&'*+\-.^_`|~A-Za-z0-9]/g;
var NOT_HTTP_QUOTED_STRING_CODE_POINT = /[^\t\u0020-~\u0080-\u00FF]/g;
var END_BEGINNING_WHITESPACE = /[^\r\n\t ]|$/;
var START_ENDING_WHITESPACE = /[\r\n\t ]*$/;
function toASCIILower(str) {
  // eslint-disable-next-line no-control-regex
  if (!/[^\x00-\x7f]/.test(str)) return StringPrototypeToLowerCase(str);
  var result = '';
  for (var i = 0; i < str.length; i++) {
    var char = str[i];
    result += char >= 'A' && char <= 'Z' ? StringPrototypeToLowerCase(char) : char;
  }
  return result;
}
var SOLIDUS = '/';
var SEMICOLON = ';';
function parseTypeAndSubtype(str) {
  // Skip only HTTP whitespace from start
  var position = SafeStringPrototypeSearch(str, END_BEGINNING_WHITESPACE);
  // read until '/'
  var typeEnd = StringPrototypeIndexOf(str, SOLIDUS, position);
  var trimmedType = typeEnd === -1 ? StringPrototypeSlice(str, position) : StringPrototypeSlice(str, position, typeEnd);
  var invalidTypeIndex = SafeStringPrototypeSearch(trimmedType, NOT_HTTP_TOKEN_CODE_POINT);
  if (trimmedType === '' || invalidTypeIndex !== -1 || typeEnd === -1) {
    throw new ERR_INVALID_MIME_SYNTAX('type', str, invalidTypeIndex);
  }
  // skip type and '/'
  position = typeEnd + 1;
  var type = toASCIILower(trimmedType);
  // read until ';'
  var subtypeEnd = StringPrototypeIndexOf(str, SEMICOLON, position);
  var rawSubtype = subtypeEnd === -1 ? StringPrototypeSlice(str, position) : StringPrototypeSlice(str, position, subtypeEnd);
  position += rawSubtype.length;
  if (subtypeEnd !== -1) {
    // skip ';'
    position += 1;
  }
  var trimmedSubtype = StringPrototypeSlice(rawSubtype, 0, SafeStringPrototypeSearch(rawSubtype, START_ENDING_WHITESPACE));
  var invalidSubtypeIndex = SafeStringPrototypeSearch(trimmedSubtype, NOT_HTTP_TOKEN_CODE_POINT);
  if (trimmedSubtype === '' || invalidSubtypeIndex !== -1) {
    throw new ERR_INVALID_MIME_SYNTAX('subtype', str, invalidSubtypeIndex);
  }
  var subtype = toASCIILower(trimmedSubtype);
  return [type, subtype, position];
}
var EQUALS_SEMICOLON_OR_END = /[;=]|$/;
var QUOTED_VALUE_PATTERN = /^(?:([\\]$)|[\\][\s\S]|[^"])*(?:(")|$)/u;
function removeBackslashes(str) {
  var ret = '';
  // We stop at str.length - 1 because we want to look ahead one character.
  var i;
  for (i = 0; i < str.length - 1; i++) {
    var c = str[i];
    if (c === '\\') {
      i++;
      ret += str[i];
    } else {
      ret += c;
    }
  }
  // We add the last character if we didn't skip to it.
  if (i === str.length - 1) {
    ret += str[i];
  }
  return ret;
}
function escapeQuoteOrSolidus(str) {
  var result = '';
  for (var i = 0; i < str.length; i++) {
    var char = str[i];
    result += char === '"' || char === '\\' ? `\\${char}` : char;
  }
  return result;
}
var encode = value => {
  if (value.length === 0) return '""';
  var encode = SafeStringPrototypeSearch(value, NOT_HTTP_TOKEN_CODE_POINT) !== -1;
  if (!encode) return value;
  var escaped = escapeQuoteOrSolidus(value);
  return `"${escaped}"`;
};
var _data = /*#__PURE__*/new WeakMap();
var _processed = /*#__PURE__*/new WeakMap();
var _string = /*#__PURE__*/new WeakMap();
var _MIMEParams_brand = /*#__PURE__*/new WeakSet();
var MIMEParams = /*#__PURE__*/function () {
  function MIMEParams() {
    _classCallCheck(this, MIMEParams);
    // Used to act as a friendly class to stringifying stuff
    // not meant to be exposed to users, could inject invalid values
    _classPrivateMethodInitSpec(this, _MIMEParams_brand);
    _classPrivateFieldInitSpec(this, _data, new SafeMap());
    // We set the flag the MIMEParams instance as processed on initialization
    // to defer the parsing of a potentially large string.
    _classPrivateFieldInitSpec(this, _processed, true);
    _classPrivateFieldInitSpec(this, _string, null);
  }
  return _createClass(MIMEParams, [{
    key: "delete",
    value:
    /**
     * @param {string} name
     * @returns {void}
     */
    function _delete(name) {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      _classPrivateFieldGet(_data, this).delete(name);
    }
  }, {
    key: "get",
    value: function get(name) {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      var data = _classPrivateFieldGet(_data, this);
      if (data.has(name)) {
        return data.get(name);
      }
      return null;
    }
  }, {
    key: "has",
    value: function has(name) {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      return _classPrivateFieldGet(_data, this).has(name);
    }
  }, {
    key: "set",
    value: function set(name, value) {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      var data = _classPrivateFieldGet(_data, this);
      name = `${name}`;
      value = `${value}`;
      var invalidNameIndex = SafeStringPrototypeSearch(name, NOT_HTTP_TOKEN_CODE_POINT);
      if (name.length === 0 || invalidNameIndex !== -1) {
        throw new ERR_INVALID_MIME_SYNTAX('parameter name', name, invalidNameIndex);
      }
      var invalidValueIndex = SafeStringPrototypeSearch(value, NOT_HTTP_QUOTED_STRING_CODE_POINT);
      if (invalidValueIndex !== -1) {
        throw new ERR_INVALID_MIME_SYNTAX('parameter value', value, invalidValueIndex);
      }
      data.set(name, value);
    }
  }, {
    key: "entries",
    value: function* entries() {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      yield* _classPrivateFieldGet(_data, this).entries();
    }
  }, {
    key: "keys",
    value: function* keys() {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      yield* _classPrivateFieldGet(_data, this).keys();
    }
  }, {
    key: "values",
    value: function* values() {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      yield* _classPrivateFieldGet(_data, this).values();
    }
  }, {
    key: "toString",
    value: function toString() {
      _assertClassBrand(_MIMEParams_brand, this, _parse).call(this);
      var ret = '';
      for (var {
        0: key,
        1: value
      } of _classPrivateFieldGet(_data, this)) {
        var encoded = encode(value);
        // Ensure they are separated
        if (ret.length) ret += ';';
        ret += `${key}=${encoded}`;
      }
      return ret;
    }
  }], [{
    key: "instantiateMimeParams",
    value:
    /**
     * Used to instantiate a MIMEParams object within the MIMEType class and
     * to allow it to be parsed lazily.
     * @returns {MIMEParams}
     */
    function instantiateMimeParams(str) {
      var instance = new MIMEParams();
      _classPrivateFieldSet(_string, instance, str);
      _classPrivateFieldSet(_processed, instance, false);
      return instance;
    }
  }]);
}();
function _parse() {
  if (_classPrivateFieldGet(_processed, this)) return; // already parsed
  var paramsMap = _classPrivateFieldGet(_data, this);
  var position = 0;
  var str = _classPrivateFieldGet(_string, this);
  var endOfSource = SafeStringPrototypeSearch(StringPrototypeSlice(str, position), START_ENDING_WHITESPACE) + position;
  while (position < endOfSource) {
    // Skip any whitespace before parameter
    position += SafeStringPrototypeSearch(StringPrototypeSlice(str, position), END_BEGINNING_WHITESPACE);
    // Read until ';' or '='
    var afterParameterName = SafeStringPrototypeSearch(StringPrototypeSlice(str, position), EQUALS_SEMICOLON_OR_END) + position;
    var parameterString = toASCIILower(StringPrototypeSlice(str, position, afterParameterName));
    position = afterParameterName;
    // If we found a terminating character
    if (position < endOfSource) {
      // Safe to use because we never do special actions for surrogate pairs
      var _char = StringPrototypeCharAt(str, position);
      // Skip the terminating character
      position += 1;
      // Ignore parameters without values
      if (_char === ';') {
        continue;
      }
    }
    // If we are at end of the string, it cannot have a value
    if (position >= endOfSource) break;
    // Safe to use because we never do special actions for surrogate pairs
    var char = StringPrototypeCharAt(str, position);
    var parameterValue = null;
    if (char === '"') {
      // Handle quoted-string form of values
      // skip '"'
      position += 1;
      // Find matching closing '"' or end of string
      //   use $1 to see if we terminated on unmatched '\'
      //   use $2 to see if we terminated on a matching '"'
      //   so we can skip the last char in either case
      var insideMatch = RegExpPrototypeExec(QUOTED_VALUE_PATTERN, StringPrototypeSlice(str, position));
      position += insideMatch[0].length;
      // Skip including last character if an unmatched '\' or '"' during
      // unescape
      var inside = insideMatch[1] || insideMatch[2] ? StringPrototypeSlice(insideMatch[0], 0, -1) : insideMatch[0];
      // Unescape '\' quoted characters
      parameterValue = removeBackslashes(inside);
      // If we did have an unmatched '\' add it back to the end
      if (insideMatch[1]) parameterValue += '\\';
    } else {
      // Handle the normal parameter value form
      var valueEnd = StringPrototypeIndexOf(str, SEMICOLON, position);
      var rawValue = valueEnd === -1 ? StringPrototypeSlice(str, position) : StringPrototypeSlice(str, position, valueEnd);
      position += rawValue.length;
      var trimmedValue = StringPrototypeSlice(rawValue, 0, SafeStringPrototypeSearch(rawValue, START_ENDING_WHITESPACE));
      // Ignore parameters without values
      if (trimmedValue === '') continue;
      parameterValue = trimmedValue;
    }
    if (parameterString !== '' && SafeStringPrototypeSearch(parameterString, NOT_HTTP_TOKEN_CODE_POINT) === -1 && SafeStringPrototypeSearch(parameterValue, NOT_HTTP_QUOTED_STRING_CODE_POINT) === -1 && paramsMap.has(parameterString) === false) {
      paramsMap.set(parameterString, parameterValue);
    }
    position++;
  }
  _classPrivateFieldSet(_data, this, paramsMap);
  _classPrivateFieldSet(_processed, this, true);
}
var MIMEParamsStringify = MIMEParams.prototype.toString;
ObjectDefineProperty(MIMEParams.prototype, SymbolIterator, {
  __proto__: null,
  configurable: true,
  value: MIMEParams.prototype.entries,
  writable: true
});
ObjectDefineProperty(MIMEParams.prototype, 'toJSON', {
  __proto__: null,
  configurable: true,
  value: MIMEParamsStringify,
  writable: true
});
var {
  instantiateMimeParams
} = MIMEParams;
delete MIMEParams.instantiateMimeParams;
var _type = /*#__PURE__*/new WeakMap();
var _subtype = /*#__PURE__*/new WeakMap();
var _parameters = /*#__PURE__*/new WeakMap();
var MIMEType = /*#__PURE__*/function () {
  function MIMEType(string) {
    _classCallCheck(this, MIMEType);
    _classPrivateFieldInitSpec(this, _type, void 0);
    _classPrivateFieldInitSpec(this, _subtype, void 0);
    _classPrivateFieldInitSpec(this, _parameters, void 0);
    string = `${string}`;
    var data = parseTypeAndSubtype(string);
    _classPrivateFieldSet(_type, this, data[0]);
    _classPrivateFieldSet(_subtype, this, data[1]);
    _classPrivateFieldSet(_parameters, this, instantiateMimeParams(StringPrototypeSlice(string, data[2])));
  }
  return _createClass(MIMEType, [{
    key: "type",
    get: function () {
      return _classPrivateFieldGet(_type, this);
    },
    set: function (v) {
      v = `${v}`;
      var invalidTypeIndex = SafeStringPrototypeSearch(v, NOT_HTTP_TOKEN_CODE_POINT);
      if (v.length === 0 || invalidTypeIndex !== -1) {
        throw new ERR_INVALID_MIME_SYNTAX('type', v, invalidTypeIndex);
      }
      _classPrivateFieldSet(_type, this, toASCIILower(v));
    }
  }, {
    key: "subtype",
    get: function () {
      return _classPrivateFieldGet(_subtype, this);
    },
    set: function (v) {
      v = `${v}`;
      var invalidSubtypeIndex = SafeStringPrototypeSearch(v, NOT_HTTP_TOKEN_CODE_POINT);
      if (v.length === 0 || invalidSubtypeIndex !== -1) {
        throw new ERR_INVALID_MIME_SYNTAX('subtype', v, invalidSubtypeIndex);
      }
      _classPrivateFieldSet(_subtype, this, toASCIILower(v));
    }
  }, {
    key: "essence",
    get: function () {
      return `${_classPrivateFieldGet(_type, this)}/${_classPrivateFieldGet(_subtype, this)}`;
    }
  }, {
    key: "params",
    get: function () {
      return _classPrivateFieldGet(_parameters, this);
    }
  }, {
    key: "toString",
    value: function toString() {
      var ret = `${_classPrivateFieldGet(_type, this)}/${_classPrivateFieldGet(_subtype, this)}`;
      var paramStr = FunctionPrototypeCall(MIMEParamsStringify, _classPrivateFieldGet(_parameters, this));
      if (paramStr.length) ret += `;${paramStr}`;
      return ret;
    }
  }]);
}();
ObjectDefineProperty(MIMEType.prototype, 'toJSON', {
  __proto__: null,
  configurable: true,
  value: MIMEType.prototype.toString,
  writable: true
});
module.exports = {
  MIMEParams,
  MIMEType
};

