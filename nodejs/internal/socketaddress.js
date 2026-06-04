'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ObjectSetPrototypeOf,
  Symbol: _Symbol
} = primordials;
var {
  SocketAddress: _SocketAddress,
  AF_INET,
  AF_INET6
} = internalBinding('block_list');
var {
  validateObject,
  validateString,
  validatePort,
  validateUint32
} = require('internal/validators');
var {
  codes: {
    ERR_INVALID_ARG_VALUE
  }
} = require('internal/errors');
var {
  customInspectSymbol: kInspect,
  kEmptyObject
} = require('internal/util');
var {
  inspect
} = require('internal/util/inspect');
var {
  markTransferMode,
  kClone,
  kDeserialize
} = require('internal/worker/js_transferable');
var {
  URLParse
} = require('internal/url');
var kHandle = _Symbol('kHandle');
var kDetail = _Symbol('kDetail');
var SocketAddress = /*#__PURE__*/function () {
  function SocketAddress() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
    _classCallCheck(this, SocketAddress);
    markTransferMode(this, true, false);
    validateObject(options, 'options');
    var {
      family = 'ipv4'
    } = options;
    var {
      address = family === 'ipv4' ? '127.0.0.1' : '::',
      port = 0,
      flowlabel = 0
    } = options;
    var type;
    if (typeof family?.toLowerCase === 'function') family = family.toLowerCase();
    switch (family) {
      case 'ipv4':
        type = AF_INET;
        break;
      case 'ipv6':
        type = AF_INET6;
        break;
      default:
        throw new ERR_INVALID_ARG_VALUE('options.family', options.family);
    }
    validateString(address, 'options.address');
    validatePort(port, 'options.port');
    validateUint32(flowlabel, 'options.flowlabel', false);
    this[kHandle] = new _SocketAddress(address, port | 0, type, flowlabel | 0);
    this[kDetail] = this[kHandle].detail({
      address: undefined,
      port: undefined,
      family: undefined,
      flowlabel: undefined
    });
  }
  return _createClass(SocketAddress, [{
    key: "address",
    get: function () {
      return this[kDetail].address;
    }
  }, {
    key: "port",
    get: function () {
      return this[kDetail].port;
    }
  }, {
    key: "family",
    get: function () {
      return this[kDetail].family === AF_INET ? 'ipv4' : 'ipv6';
    }
  }, {
    key: "flowlabel",
    get: function () {
      // The flow label can be changed internally.
      return this[kHandle].flowlabel();
    }
  }, {
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `SocketAddress ${inspect(this.toJSON(), opts)}`;
    }
  }, {
    key: kClone,
    value: function () {
      var handle = this[kHandle];
      return {
        data: {
          handle
        },
        deserializeInfo: 'internal/socketaddress:InternalSocketAddress'
      };
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        handle
      } = _ref;
      this[kHandle] = handle;
      this[kDetail] = handle.detail({
        address: undefined,
        port: undefined,
        family: undefined,
        flowlabel: undefined
      });
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        address: this.address,
        port: this.port,
        family: this.family,
        flowlabel: this.flowlabel
      };
    }

    /**
     * Parse an "${ip}:${port}" formatted string into a SocketAddress.
     * Returns undefined if the input cannot be successfully parsed.
     * @param {string} input
     * @returns {SocketAddress|undefined}
     */
  }], [{
    key: "isSocketAddress",
    value: function isSocketAddress(value) {
      return value?.[kHandle] !== undefined;
    }
  }, {
    key: "parse",
    value: function parse(input) {
      validateString(input, 'input');
      // While URL.parse is not expected to throw, there are several
      // other pieces here that do... the destucturing, the SocketAddress
      // constructor, etc. So we wrap this in a try/catch to be safe.
      try {
        var {
          hostname: address,
          port
        } = URLParse(`http://${input}`);
        if (address.startsWith('[') && address.endsWith(']')) {
          return new SocketAddress({
            address: address.slice(1, -1),
            port: port | 0,
            family: 'ipv6'
          });
        }
        return new SocketAddress({
          address,
          port: port | 0
        });
      } catch {
        // Ignore errors here. Return undefined if the input cannot
        // be successfully parsed or is not a proper socket address.
      }
    }
  }]);
}();
var InternalSocketAddress = /*#__PURE__*/_createClass(function InternalSocketAddress(handle) {
  _classCallCheck(this, InternalSocketAddress);
  markTransferMode(this, true, false);
  this[kHandle] = handle;
  this[kDetail] = this[kHandle]?.detail({
    address: undefined,
    port: undefined,
    family: undefined,
    flowlabel: undefined
  });
});
InternalSocketAddress.prototype.constructor = SocketAddress.prototype.constructor;
ObjectSetPrototypeOf(InternalSocketAddress.prototype, SocketAddress.prototype);
module.exports = {
  SocketAddress,
  InternalSocketAddress,
  kHandle
};

