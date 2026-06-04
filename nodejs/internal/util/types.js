'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayBufferIsView,
  ObjectDefineProperties,
  TypedArrayPrototypeGetSymbolToStringTag
} = primordials;
function isDataView(value) {
  return ArrayBufferIsView(value) && TypedArrayPrototypeGetSymbolToStringTag(value) === undefined;
}
function isTypedArray(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) !== undefined;
}
function isUint8Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Uint8Array';
}
function isUint8ClampedArray(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Uint8ClampedArray';
}
function isUint16Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Uint16Array';
}
function isUint32Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Uint32Array';
}
function isInt8Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Int8Array';
}
function isInt16Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Int16Array';
}
function isInt32Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Int32Array';
}
function isFloat16Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Float16Array';
}
function isFloat32Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Float32Array';
}
function isFloat64Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'Float64Array';
}
function isBigInt64Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'BigInt64Array';
}
function isBigUint64Array(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) === 'BigUint64Array';
}
module.exports = _objectSpread(_objectSpread({}, internalBinding('types')), {}, {
  isArrayBufferView: ArrayBufferIsView,
  isDataView,
  isTypedArray,
  isUint8Array,
  isUint8ClampedArray,
  isUint16Array,
  isUint32Array,
  isInt8Array,
  isInt16Array,
  isInt32Array,
  isFloat16Array,
  isFloat32Array,
  isFloat64Array,
  isBigInt64Array,
  isBigUint64Array
});
var isCryptoKey;
var isKeyObject;
ObjectDefineProperties(module.exports, {
  isKeyObject: {
    __proto__: null,
    configurable: false,
    enumerable: true,
    value(obj) {
      if (!process.versions.openssl) {
        return false;
      }
      if (!isKeyObject) {
        ({
          isKeyObject
        } = require('internal/crypto/keys'));
      }
      return isKeyObject(obj);
    }
  },
  isCryptoKey: {
    __proto__: null,
    configurable: false,
    enumerable: true,
    value(obj) {
      if (!process.versions.openssl) {
        return false;
      }
      if (!isCryptoKey) {
        ({
          isCryptoKey
        } = require('internal/crypto/keys'));
      }
      return isCryptoKey(obj);
    }
  }
});

