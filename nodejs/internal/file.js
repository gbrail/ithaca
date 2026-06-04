'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  DateNow,
  FunctionPrototypeCall,
  NumberIsNaN,
  ObjectDefineProperties,
  ObjectSetPrototypeOf,
  StringPrototypeToWellFormed,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  Blob,
  TransferableBlob
} = require('internal/blob');
var {
  customInspectSymbol: kInspect,
  kEnumerableProperty,
  kEmptyObject
} = require('internal/util');
var {
  codes: {
    ERR_INVALID_THIS,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
var {
  inspect
} = require('internal/util/inspect');
var {
  kClone,
  kDeserialize
} = require('internal/worker/js_transferable');
var kState = _Symbol('state');
function isFile(object) {
  return object?.[kState] !== undefined;
}
var FileState = /*#__PURE__*/_createClass(
/**
 * @param {string} name
 * @param {number} lastModified
 */
function FileState(name, lastModified) {
  _classCallCheck(this, FileState);
  _defineProperty(this, "name", void 0);
  _defineProperty(this, "lastModified", void 0);
  this.name = name;
  this.lastModified = lastModified;
});
var File = /*#__PURE__*/function (_Blob) {
  function File(fileBits, fileName) {
    var _this;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : kEmptyObject;
    _classCallCheck(this, File);
    if (arguments.length < 2) {
      throw new ERR_MISSING_ARGS('fileBits', 'fileName');
    }
    _this = _callSuper(this, File, [fileBits, options]);
    var {
      lastModified
    } = options ?? kEmptyObject;
    if (lastModified !== undefined) {
      // Using Number(...) will not throw an error for bigints.
      lastModified = +lastModified;
      if (NumberIsNaN(lastModified)) {
        lastModified = 0;
      }
    } else {
      lastModified = DateNow();
    }
    _this[kState] = new FileState(StringPrototypeToWellFormed(`${fileName}`), lastModified);
    return _this;
  }
  _inherits(File, _Blob);
  return _createClass(File, [{
    key: "name",
    get: function () {
      if (!isFile(this)) throw new ERR_INVALID_THIS('File');
      return this[kState].name;
    }
  }, {
    key: "lastModified",
    get: function () {
      if (!isFile(this)) throw new ERR_INVALID_THIS('File');
      return this[kState].lastModified;
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) {
        return this;
      }
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `File ${inspect({
        size: this.size,
        type: this.type,
        name: this[kState].name,
        lastModified: this[kState].lastModified
      }, opts)}`;
    }
  }, {
    key: kClone,
    value: function () {
      return {
        data: _objectSpread(_objectSpread({}, _superPropGet(File, kClone, this, 3)([]).data), this[kState]),
        deserializeInfo: 'internal/file:TransferableFile'
      };
    }
  }, {
    key: kDeserialize,
    value: function (data) {
      _superPropGet(File, kDeserialize, this, 3)([data]);
      this[kState] = new FileState(data.name, data.lastModified);
    }
  }]);
}(Blob);
function TransferableFile(handle, length) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  FunctionPrototypeCall(TransferableBlob, this, handle, length, type);
  ObjectSetPrototypeOf(this, File.prototype);
}
ObjectSetPrototypeOf(TransferableFile.prototype, File.prototype);
ObjectSetPrototypeOf(TransferableFile, File);
ObjectDefineProperties(File.prototype, {
  name: kEnumerableProperty,
  lastModified: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    configurable: true,
    value: 'File'
  }
});
module.exports = {
  File,
  TransferableFile
};

