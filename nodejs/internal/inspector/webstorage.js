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
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  Storage
} = internalBinding('webstorage');
var {
  DOMStorage
} = require('inspector');
var path = require('path');
var {
  getOptionValue
} = require('internal/options');
var InspectorLocalStorage = /*#__PURE__*/function (_Storage) {
  function InspectorLocalStorage() {
    _classCallCheck(this, InspectorLocalStorage);
    return _callSuper(this, InspectorLocalStorage, arguments);
  }
  _inherits(InspectorLocalStorage, _Storage);
  return _createClass(InspectorLocalStorage, [{
    key: "setItem",
    value: function setItem(key, value) {
      key = `${key}`;
      value = `${value}`;
      var oldValue = this.getItem(key);
      _superPropGet(InspectorLocalStorage, "setItem", this, 3)([key, value]);
      if (oldValue == null) {
        itemAdded(key, value, true);
      } else {
        itemUpdated(key, oldValue, value, true);
      }
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      key = `${key}`;
      _superPropGet(InspectorLocalStorage, "removeItem", this, 3)([key]);
      itemRemoved(key, true);
    }
  }, {
    key: "clear",
    value: function clear() {
      _superPropGet(InspectorLocalStorage, "clear", this, 3)([]);
      itemsCleared(true);
    }
  }]);
}(Storage);
var InspectorSessionStorage = /*#__PURE__*/function (_Storage2) {
  function InspectorSessionStorage() {
    _classCallCheck(this, InspectorSessionStorage);
    return _callSuper(this, InspectorSessionStorage, arguments);
  }
  _inherits(InspectorSessionStorage, _Storage2);
  return _createClass(InspectorSessionStorage, [{
    key: "setItem",
    value: function setItem(key, value) {
      key = `${key}`;
      value = `${value}`;
      var oldValue = this.getItem(key);
      _superPropGet(InspectorSessionStorage, "setItem", this, 3)([key, value]);
      if (oldValue == null) {
        itemAdded(key, value, false);
      } else {
        itemUpdated(key, oldValue, value, false);
      }
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      key = `${key}`;
      _superPropGet(InspectorSessionStorage, "removeItem", this, 3)([key]);
      itemRemoved(key, false);
    }
  }, {
    key: "clear",
    value: function clear() {
      _superPropGet(InspectorSessionStorage, "clear", this, 3)([]);
      itemsCleared(false);
    }
  }]);
}(Storage);
function itemAdded(key, value, isLocalStorage) {
  DOMStorage.domStorageItemAdded({
    key,
    newValue: value,
    storageId: {
      securityOrigin: '',
      isLocalStorage,
      storageKey: getStorageKey()
    }
  });
}
function itemUpdated(key, oldValue, newValue, isLocalStorage) {
  DOMStorage.domStorageItemUpdated({
    key,
    oldValue,
    newValue,
    storageId: {
      securityOrigin: '',
      isLocalStorage,
      storageKey: getStorageKey()
    }
  });
}
function itemRemoved(key, isLocalStorage) {
  DOMStorage.domStorageItemRemoved({
    key,
    storageId: {
      securityOrigin: '',
      isLocalStorage,
      storageKey: getStorageKey()
    }
  });
}
function itemsCleared(isLocalStorage) {
  DOMStorage.domStorageItemsCleared({
    storageId: {
      securityOrigin: '',
      isLocalStorage,
      storageKey: getStorageKey()
    }
  });
}
function getStorageKey() {
  var localStorageFile = getOptionValue('--localstorage-file');
  var resolvedAbsolutePath = path.resolve(localStorageFile);
  return 'file://' + resolvedAbsolutePath;
}
module.exports = {
  InspectorLocalStorage,
  InspectorSessionStorage
};

