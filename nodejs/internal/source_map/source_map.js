// This file is a modified version of:
// https://cs.chromium.org/chromium/src/v8/tools/SourceMap.js?rcl=dd10454c1d
// from the V8 codebase. Logic specific to WebInspector is removed and linting
// is made to match the Node.js style guide.

// Copyright 2013 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// This is a copy from blink dev tools, see:
// http://src.chromium.org/viewvc/blink/trunk/Source/devtools/front_end/SourceMap.js
// revision: 153407

/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayIsArray,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSort,
  ObjectFreeze,
  ObjectPrototypeHasOwnProperty,
  StringPrototypeCharAt,
  Symbol: _Symbol
} = primordials;
var {
  validateObject
} = require('internal/validators');
var base64Map;
var VLQ_BASE_SHIFT = 5;
var VLQ_BASE_MASK = (1 << 5) - 1;
var VLQ_CONTINUATION_MASK = 1 << 5;
var kMappings = _Symbol('kMappings');
var StringCharIterator = /*#__PURE__*/function () {
  /**
   * @param {string} string
   */
  function StringCharIterator(string) {
    _classCallCheck(this, StringCharIterator);
    this._string = string;
    this._position = 0;
  }

  /**
   * @returns {string}
   */
  return _createClass(StringCharIterator, [{
    key: "next",
    value: function next() {
      return StringPrototypeCharAt(this._string, this._position++);
    }

    /**
     * @returns {string}
     */
  }, {
    key: "peek",
    value: function peek() {
      return StringPrototypeCharAt(this._string, this._position);
    }

    /**
     * @returns {boolean}
     */
  }, {
    key: "hasNext",
    value: function hasNext() {
      return this._position < this._string.length;
    }
  }]);
}();
/**
 * @class
 * Implements Source Map V3 model.
 * See https://github.com/google/closure-compiler/wiki/Source-Maps
 * for format description.
 */
var _payload = /*#__PURE__*/new WeakMap();
var _mappings = /*#__PURE__*/new WeakMap();
var _sources = /*#__PURE__*/new WeakMap();
var _sourceContentByURL = /*#__PURE__*/new WeakMap();
var _lineLengths = /*#__PURE__*/new WeakMap();
var _parseMappingPayload = /*#__PURE__*/new WeakMap();
var _parseSections = /*#__PURE__*/new WeakMap();
var _SourceMap_brand = /*#__PURE__*/new WeakSet();
var SourceMap = /*#__PURE__*/function () {
  /**
   * @param {SourceMapV3} payload
   */
  function SourceMap(payload) {
    var {
      lineLengths
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      __proto__: null
    };
    _classCallCheck(this, SourceMap);
    /**
     * @override
     */
    _classPrivateMethodInitSpec(this, _SourceMap_brand);
    _classPrivateFieldInitSpec(this, _payload, void 0);
    _classPrivateFieldInitSpec(this, _mappings, []);
    _classPrivateFieldInitSpec(this, _sources, {});
    _classPrivateFieldInitSpec(this, _sourceContentByURL, {});
    _classPrivateFieldInitSpec(this, _lineLengths, undefined);
    _classPrivateFieldInitSpec(this, _parseMappingPayload, () => {
      if (_classPrivateFieldGet(_payload, this).sections) {
        _classPrivateFieldGet(_parseSections, this).call(this, _classPrivateFieldGet(_payload, this).sections);
      } else {
        _assertClassBrand(_SourceMap_brand, this, _parseMap).call(this, _classPrivateFieldGet(_payload, this), 0, 0);
      }
      ArrayPrototypeSort(_classPrivateFieldGet(_mappings, this), compareSourceMapEntry);
    });
    /**
     * @param {Array.<SourceMapV3.Section>} sections
     */
    _classPrivateFieldInitSpec(this, _parseSections, sections => {
      for (var i = 0; i < sections.length; ++i) {
        var section = sections[i];
        _assertClassBrand(_SourceMap_brand, this, _parseMap).call(this, section.map, section.offset.line, section.offset.column);
      }
    });
    if (!base64Map) {
      var base64Digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      base64Map = {};
      for (var i = 0; i < base64Digits.length; ++i) base64Map[base64Digits[i]] = i;
    }
    _classPrivateFieldSet(_payload, this, cloneSourceMapV3(payload));
    _classPrivateFieldGet(_parseMappingPayload, this).call(this);
    if (ArrayIsArray(lineLengths) && lineLengths.length) {
      _classPrivateFieldSet(_lineLengths, this, ObjectFreeze(ArrayPrototypeSlice(lineLengths)));
    }
  }

  /**
   * @returns {object} raw source map v3 payload.
   */
  return _createClass(SourceMap, [{
    key: "payload",
    get: function () {
      return _classPrivateFieldGet(_payload, this);
    }
  }, {
    key: kMappings,
    get: function () {
      return _classPrivateFieldGet(_mappings, this);
    }

    /**
     * @returns {number[] | undefined} line lengths of generated source code
     */
  }, {
    key: "lineLengths",
    get: function () {
      return _classPrivateFieldGet(_lineLengths, this);
    }
  }, {
    key: "findEntry",
    value:
    /**
     * @param {number} lineOffset 0-indexed line offset in compiled resource
     * @param {number} columnOffset 0-indexed column offset in compiled resource
     * @returns {object} representing start of range if found, or empty object
     */
    function findEntry(lineOffset, columnOffset) {
      var first = 0;
      var count = _classPrivateFieldGet(_mappings, this).length;
      while (count > 1) {
        var step = count >> 1;
        var middle = first + step;
        var mapping = _classPrivateFieldGet(_mappings, this)[middle];
        if (lineOffset < mapping[0] || lineOffset === mapping[0] && columnOffset < mapping[1]) {
          count = step;
        } else {
          first = middle;
          count -= step;
        }
      }
      var entry = _classPrivateFieldGet(_mappings, this)[first];
      if (!first && entry && (lineOffset < entry[0] || lineOffset === entry[0] && columnOffset < entry[1])) {
        return {};
      } else if (!entry) {
        return {};
      }
      return {
        generatedLine: entry[0],
        generatedColumn: entry[1],
        originalSource: entry[2],
        originalLine: entry[3],
        originalColumn: entry[4],
        name: entry[5]
      };
    }

    /**
     * @param {number} lineNumber 1-indexed line number in compiled resource call site
     * @param {number} columnNumber 1-indexed column number in compiled resource call site
     * @returns {object} representing origin call site if found, or empty object
     */
  }, {
    key: "findOrigin",
    value: function findOrigin(lineNumber, columnNumber) {
      var range = this.findEntry(lineNumber - 1, columnNumber - 1);
      if (range.originalSource === undefined || range.originalLine === undefined || range.originalColumn === undefined || range.generatedLine === undefined || range.generatedColumn === undefined) {
        return {};
      }
      var lineOffset = lineNumber - range.generatedLine;
      var columnOffset = columnNumber - range.generatedColumn;
      return {
        name: range.name,
        fileName: range.originalSource,
        lineNumber: range.originalLine + lineOffset,
        columnNumber: range.originalColumn + columnOffset
      };
    }
  }]);
}();
/**
 * @param {string} char
 * @returns {boolean}
 */
function _parseMap(map, lineNumber, columnNumber) {
  var sourceIndex = 0;
  var sourceLineNumber = 0;
  var sourceColumnNumber = 0;
  var nameIndex = 0;
  var sources = [];
  var originalToCanonicalURLMap = {};
  for (var i = 0; i < map.sources.length; ++i) {
    var url = map.sources[i];
    originalToCanonicalURLMap[url] = url;
    ArrayPrototypePush(sources, url);
    _classPrivateFieldGet(_sources, this)[url] = true;
    if (map.sourcesContent?.[i]) _classPrivateFieldGet(_sourceContentByURL, this)[url] = map.sourcesContent[i];
  }
  var stringCharIterator = new StringCharIterator(map.mappings);
  var sourceURL = sources[sourceIndex];
  while (true) {
    if (stringCharIterator.peek() === ',') stringCharIterator.next();else {
      while (stringCharIterator.peek() === ';') {
        lineNumber += 1;
        columnNumber = 0;
        stringCharIterator.next();
      }
      if (!stringCharIterator.hasNext()) break;
    }
    columnNumber += decodeVLQ(stringCharIterator);
    if (isSeparator(stringCharIterator.peek())) {
      ArrayPrototypePush(_classPrivateFieldGet(_mappings, this), [lineNumber, columnNumber]);
      continue;
    }
    var sourceIndexDelta = decodeVLQ(stringCharIterator);
    if (sourceIndexDelta) {
      sourceIndex += sourceIndexDelta;
      sourceURL = sources[sourceIndex];
    }
    sourceLineNumber += decodeVLQ(stringCharIterator);
    sourceColumnNumber += decodeVLQ(stringCharIterator);
    var name = void 0;
    if (!isSeparator(stringCharIterator.peek())) {
      nameIndex += decodeVLQ(stringCharIterator);
      name = map.names?.[nameIndex];
    }
    ArrayPrototypePush(_classPrivateFieldGet(_mappings, this), [lineNumber, columnNumber, sourceURL, sourceLineNumber, sourceColumnNumber, name]);
  }
}
function isSeparator(char) {
  return char === ',' || char === ';';
}

/**
 * @param {SourceMap.StringCharIterator} stringCharIterator
 * @returns {number}
 */
function decodeVLQ(stringCharIterator) {
  // Read unsigned value.
  var result = 0;
  var shift = 0;
  var digit;
  do {
    digit = base64Map[stringCharIterator.next()];
    result += (digit & VLQ_BASE_MASK) << shift;
    shift += VLQ_BASE_SHIFT;
  } while (digit & VLQ_CONTINUATION_MASK);

  // Fix the sign.
  var negative = result & 1;
  // Use unsigned right shift, so that the 32nd bit is properly shifted to the
  // 31st, and the 32nd becomes unset.
  result >>>= 1;
  if (!negative) {
    return result;
  }

  // We need to OR here to ensure the 32nd bit (the sign bit in an Int32) is
  // always set for negative numbers. If `result` were 1, (meaning `negate` is
  // true and all other bits were zeros), `result` would now be 0. But -0
  // doesn't flip the 32nd bit as intended. All other numbers will successfully
  // set the 32nd bit without issue, so doing this is a noop for them.
  return -result | 1 << 31;
}

/**
 * @param {SourceMapV3} payload
 * @returns {SourceMapV3}
 */
function cloneSourceMapV3(payload) {
  validateObject(payload, 'payload');
  payload = _objectSpread({}, payload);
  for (var key in payload) {
    if (ObjectPrototypeHasOwnProperty(payload, key) && ArrayIsArray(payload[key])) {
      payload[key] = ObjectFreeze(ArrayPrototypeSlice(payload[key]));
    }
  }
  return ObjectFreeze(payload);
}

/**
 * @param {Array} entry1 source map entry [lineNumber, columnNumber, sourceURL,
 *   sourceLineNumber, sourceColumnNumber]
 * @param {Array} entry2 source map entry.
 * @returns {number}
 */
function compareSourceMapEntry(entry1, entry2) {
  var {
    0: lineNumber1,
    1: columnNumber1
  } = entry1;
  var {
    0: lineNumber2,
    1: columnNumber2
  } = entry2;
  if (lineNumber1 !== lineNumber2) {
    return lineNumber1 - lineNumber2;
  }
  return columnNumber1 - columnNumber2;
}
module.exports = {
  kMappings,
  SourceMap
};

