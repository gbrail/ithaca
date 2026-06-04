'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ArrayIsArray,
  Boolean,
  JSONParse,
  NumberParseInt,
  ObjectSetPrototypeOf,
  Symbol: _Symbol
} = primordials;
var {
  BlockList: BlockListHandle
} = internalBinding('block_list');
var {
  customInspectSymbol: kInspect
} = require('internal/util');
var {
  SocketAddress,
  kHandle: kSocketAddressHandle
} = require('internal/socketaddress');
var {
  markTransferMode,
  kClone,
  kDeserialize
} = require('internal/worker/js_transferable');
var {
  inspect
} = require('internal/util/inspect');
var kHandle = _Symbol('kHandle');
var {
  owner_symbol
} = internalBinding('symbols');
var {
  ERR_INVALID_ARG_VALUE,
  ERR_INVALID_ARG_TYPE
} = require('internal/errors').codes;
var {
  validateInt32,
  validateString
} = require('internal/validators');
var _BlockList_brand = /*#__PURE__*/new WeakSet();
var BlockList = /*#__PURE__*/function () {
  function BlockList() {
    _classCallCheck(this, BlockList);
    /*
    * @param {string[]} data
    * @example
    * const data = [
    *   // IPv4 examples
    *   'Subnet: IPv4 192.168.1.0/24',
    *   'Address: IPv4 10.0.0.5',
    *   'Range: IPv4 192.168.2.1-192.168.2.10',
    *   'Range: IPv4 10.0.0.1-10.0.0.10',
    *
    *   // IPv6 examples
    *   'Subnet: IPv6 2001:0db8:85a3:0000:0000:8a2e:0370:7334/64',
    *   'Address: IPv6 2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    *   'Range: IPv6 2001:0db8:85a3:0000:0000:8a2e:0370:7334-2001:0db8:85a3:0000:0000:8a2e:0370:7335',
    *   'Subnet: IPv6 2001:db8:1234::/48',
    *   'Address: IPv6 2001:db8:1234::1',
    *   'Range: IPv6 2001:db8:1234::1-2001:db8:1234::10'
    * ];
    */
    _classPrivateMethodInitSpec(this, _BlockList_brand);
    markTransferMode(this, true, false);
    this[kHandle] = new BlockListHandle();
    this[kHandle][owner_symbol] = this;
  }

  /**
   * Returns true if the value is a BlockList
   * @param {any} value
   * @returns {boolean}
   */
  return _createClass(BlockList, [{
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `BlockList ${inspect({
        rules: this.rules
      }, opts)}`;
    }
  }, {
    key: "addAddress",
    value: function addAddress(address) {
      var family = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ipv4';
      if (!SocketAddress.isSocketAddress(address)) {
        validateString(address, 'address');
        validateString(family, 'family');
        address = new SocketAddress({
          address,
          family
        });
      }
      this[kHandle].addAddress(address[kSocketAddressHandle]);
    }
  }, {
    key: "addRange",
    value: function addRange(start, end) {
      var family = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'ipv4';
      if (!SocketAddress.isSocketAddress(start)) {
        validateString(start, 'start');
        validateString(family, 'family');
        start = new SocketAddress({
          address: start,
          family
        });
      }
      if (!SocketAddress.isSocketAddress(end)) {
        validateString(end, 'end');
        validateString(family, 'family');
        end = new SocketAddress({
          address: end,
          family
        });
      }
      var ret = this[kHandle].addRange(start[kSocketAddressHandle], end[kSocketAddressHandle]);
      if (ret === false) throw new ERR_INVALID_ARG_VALUE('start', start, 'must come before end');
    }
  }, {
    key: "addSubnet",
    value: function addSubnet(network, prefix) {
      var family = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'ipv4';
      if (!SocketAddress.isSocketAddress(network)) {
        validateString(network, 'network');
        validateString(family, 'family');
        network = new SocketAddress({
          address: network,
          family
        });
      }
      switch (network.family) {
        case 'ipv4':
          validateInt32(prefix, 'prefix', 0, 32);
          break;
        case 'ipv6':
          validateInt32(prefix, 'prefix', 0, 128);
          break;
      }
      // Coerce -0 to +0.
      prefix += 0;
      this[kHandle].addSubnet(network[kSocketAddressHandle], prefix);
    }
  }, {
    key: "check",
    value: function check(address) {
      var family = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ipv4';
      if (!SocketAddress.isSocketAddress(address)) {
        validateString(address, 'address');
        validateString(family, 'family');
        try {
          address = new SocketAddress({
            address,
            family
          });
        } catch {
          // Ignore the error. If it's not a valid address, return false.
          return false;
        }
      }
      return Boolean(this[kHandle].check(address[kSocketAddressHandle]));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.rules;
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(data) {
      // The data argument must be a string, or an array of strings that
      // is JSON parseable.
      if (ArrayIsArray(data)) {
        for (var n of data) {
          if (typeof n !== 'string') {
            throw new ERR_INVALID_ARG_TYPE('data', ['string', 'string[]'], data);
          }
        }
      } else if (typeof data !== 'string') {
        throw new ERR_INVALID_ARG_TYPE('data', ['string', 'string[]'], data);
      } else {
        data = JSONParse(data);
        if (!ArrayIsArray(data)) {
          throw new ERR_INVALID_ARG_TYPE('data', ['string', 'string[]'], data);
        }
        for (var _n of data) {
          if (typeof _n !== 'string') {
            throw new ERR_INVALID_ARG_TYPE('data', ['string', 'string[]'], data);
          }
        }
      }
      _assertClassBrand(_BlockList_brand, this, _parseIPInfo).call(this, data);
    }
  }, {
    key: "rules",
    get: function () {
      return this[kHandle].getRules();
    }
  }, {
    key: kClone,
    value: function () {
      var handle = this[kHandle];
      return {
        data: {
          handle
        },
        deserializeInfo: 'internal/blocklist:InternalBlockList'
      };
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        handle
      } = _ref;
      this[kHandle] = handle;
      this[kHandle][owner_symbol] = this;
    }
  }], [{
    key: "isBlockList",
    value: function isBlockList(value) {
      return value?.[kHandle] !== undefined;
    }
  }]);
}();
function _parseIPInfo(data) {
  for (var item of data) {
    if (item.includes('IPv4')) {
      var subnetMatch = item.match(/Subnet: IPv4 (\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})/);
      if (subnetMatch) {
        var {
          1: network,
          2: prefix
        } = subnetMatch;
        this.addSubnet(network, NumberParseInt(prefix));
        continue;
      }
      var addressMatch = item.match(/Address: IPv4 (\d{1,3}(?:\.\d{1,3}){3})/);
      if (addressMatch) {
        var {
          1: address
        } = addressMatch;
        this.addAddress(address);
        continue;
      }
      var rangeMatch = item.match(/Range: IPv4 (\d{1,3}(?:\.\d{1,3}){3})-(\d{1,3}(?:\.\d{1,3}){3})/);
      if (rangeMatch) {
        var {
          1: start,
          2: end
        } = rangeMatch;
        this.addRange(start, end);
        continue;
      }
    }
    // IPv6 parsing with support for compressed addresses
    if (item.includes('IPv6')) {
      // IPv6 subnet pattern: supports both full and compressed formats
      // Examples:
      // - 2001:0db8:85a3:0000:0000:8a2e:0370:7334/64 (full)
      // - 2001:db8:85a3::8a2e:370:7334/64 (compressed)
      // - 2001:db8:85a3::192.0.2.128/64 (mixed)
      var ipv6SubnetMatch = item.match(/Subnet: IPv6 ([0-9a-fA-F:]{1,39})\/([0-9]{1,3})/i);
      if (ipv6SubnetMatch) {
        var {
          1: _network,
          2: _prefix
        } = ipv6SubnetMatch;
        this.addSubnet(_network, NumberParseInt(_prefix), 'ipv6');
        continue;
      }

      // IPv6 address pattern: supports both full and compressed formats
      // Examples:
      // - 2001:0db8:85a3:0000:0000:8a2e:0370:7334 (full)
      // - 2001:db8:85a3::8a2e:370:7334 (compressed)
      // - 2001:db8:85a3::192.0.2.128 (mixed)
      var ipv6AddressMatch = item.match(/Address: IPv6 ([0-9a-fA-F:]{1,39})/i);
      if (ipv6AddressMatch) {
        var {
          1: _address
        } = ipv6AddressMatch;
        this.addAddress(_address, 'ipv6');
        continue;
      }

      // IPv6 range pattern: supports both full and compressed formats
      // Examples:
      // - 2001:0db8:85a3:0000:0000:8a2e:0370:7334-2001:0db8:85a3:0000:0000:8a2e:0370:7335 (full)
      // - 2001:db8:85a3::8a2e:370:7334-2001:db8:85a3::8a2e:370:7335 (compressed)
      // - 2001:db8:85a3::192.0.2.128-2001:db8:85a3::192.0.2.129 (mixed)
      var ipv6RangeMatch = item.match(/Range: IPv6 ([0-9a-fA-F:]{1,39})-([0-9a-fA-F:]{1,39})/i);
      if (ipv6RangeMatch) {
        var {
          1: _start,
          2: _end
        } = ipv6RangeMatch;
        this.addRange(_start, _end, 'ipv6');
        continue;
      }
    }
  }
}
var InternalBlockList = /*#__PURE__*/_createClass(function InternalBlockList(handle) {
  _classCallCheck(this, InternalBlockList);
  markTransferMode(this, true, false);
  this[kHandle] = handle;
  if (handle !== undefined) handle[owner_symbol] = this;
});
InternalBlockList.prototype.constructor = BlockList.prototype.constructor;
ObjectSetPrototypeOf(InternalBlockList.prototype, BlockList.prototype);
module.exports = {
  BlockList,
  InternalBlockList,
  kHandle
};

