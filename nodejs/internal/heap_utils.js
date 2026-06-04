'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ArrayPrototypeMap,
  Symbol: _Symbol,
  Uint8Array
} = primordials;
var {
  kUpdateTimer,
  onStreamRead
} = require('internal/stream_base_commons');
var {
  owner_symbol
} = require('internal/async_hooks').symbols;
var {
  Readable
} = require('stream');
var {
  validateObject,
  validateBoolean,
  validateFunction
} = require('internal/validators');
var {
  codes: {
    ERR_INVALID_ARG_VALUE
  }
} = require('internal/errors');
var {
  kEmptyObject,
  emitExperimentalWarning
} = require('internal/util');
var {
  queryObjects: _queryObjects
} = internalBinding('internal_only_v8');
var {
  inspect
} = require('internal/util/inspect');
var kHandle = _Symbol('kHandle');
function getHeapSnapshotOptions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  validateObject(options, 'options');
  var {
    exposeInternals = false,
    exposeNumericValues = false
  } = options;
  validateBoolean(exposeInternals, 'options.exposeInternals');
  validateBoolean(exposeNumericValues, 'options.exposeNumericValues');
  return new Uint8Array([+exposeInternals, +exposeNumericValues]);
}
var HeapSnapshotStream = /*#__PURE__*/function (_Readable) {
  function HeapSnapshotStream(handle) {
    var _this;
    _classCallCheck(this, HeapSnapshotStream);
    _this = _callSuper(this, HeapSnapshotStream, [{
      autoDestroy: true
    }]);
    _this[kHandle] = handle;
    handle[owner_symbol] = _this;
    handle.onread = onStreamRead;
    return _this;
  }
  _inherits(HeapSnapshotStream, _Readable);
  return _createClass(HeapSnapshotStream, [{
    key: "_read",
    value: function _read() {
      if (this[kHandle]) this[kHandle].readStart();
    }
  }, {
    key: "_destroy",
    value: function _destroy(err, callback) {
      // Release the references on the handle so that
      // it can be garbage collected.
      this[kHandle][owner_symbol] = undefined;
      this[kHandle] = undefined;
      callback(err);
    }
  }, {
    key: kUpdateTimer,
    value: function () {
      // Does nothing
    }
  }]);
}(Readable);
var inspectOptions = {
  __proto__: null,
  depth: 0
};
function queryObjects(ctor) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  validateFunction(ctor, 'constructor');
  if (options !== kEmptyObject) {
    validateObject(options, 'options');
  }
  var format = options.format || 'count';
  if (format !== 'count' && format !== 'summary') {
    throw new ERR_INVALID_ARG_VALUE('options.format', format);
  }
  emitExperimentalWarning('v8.queryObjects()');
  // Matching the console API behavior - just access the .prototype.
  var objects = _queryObjects(ctor.prototype);
  if (format === 'count') {
    return objects.length;
  }
  // options.format is 'summary'.
  return ArrayPrototypeMap(objects, object => inspect(object, inspectOptions));
}
module.exports = {
  getHeapSnapshotOptions,
  HeapSnapshotStream,
  queryObjects
};

