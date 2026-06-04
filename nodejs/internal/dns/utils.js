'use strict';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypeForEach,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  FunctionPrototypeBind,
  NumberParseInt,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolReplace,
  Symbol: _Symbol
} = primordials;
var {
  codes: {
    ERR_DNS_SET_SERVERS_FAILED,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_IP_ADDRESS
  }
} = require('internal/errors');
var {
  isIP
} = require('internal/net');
var {
  getOptionValue
} = require('internal/options');
var {
  validateArray,
  validateInt32,
  validateOneOf,
  validateString,
  validateUint32
} = require('internal/validators');
var binding;
function lazyBinding() {
  binding ??= internalBinding('cares_wrap');
  return binding;
}
var IANA_DNS_PORT = 53;
var IPv6RE = /^\[([^[\]]*)\]/;
var addrSplitRE = /(^.+?)(?::(\d+))?$/;
var {
  namespace: {
    addSerializeCallback,
    addDeserializeCallback,
    isBuildingSnapshot
  }
} = require('internal/v8/startup_snapshot');
function validateTimeout(options) {
  var {
    timeout = -1
  } = _objectSpread({}, options);
  validateInt32(timeout, 'options.timeout', -1);
  // Coerce -0 to +0.
  timeout += 0;
  return timeout;
}
function validateMaxTimeout(options) {
  var {
    maxTimeout = 0
  } = _objectSpread({}, options);
  validateUint32(maxTimeout, 'options.maxTimeout');
  // Coerce -0 to +0.
  maxTimeout += 0;
  return maxTimeout;
}
function validateTries(options) {
  var {
    tries = 4
  } = _objectSpread({}, options);
  validateInt32(tries, 'options.tries', 1);
  return tries;
}
var kSerializeResolver = _Symbol('dns:resolver:serialize');
var kDeserializeResolver = _Symbol('dns:resolver:deserialize');
var kSnapshotStates = _Symbol('dns:resolver:config');
var kInitializeHandle = _Symbol('dns:resolver:initializeHandle');
var kSetServersInternal = _Symbol('dns:resolver:setServers');

// Resolver instances correspond 1:1 to c-ares channels.
var ResolverBase = /*#__PURE__*/function () {
  function ResolverBase() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, ResolverBase);
    var timeout = validateTimeout(options);
    var tries = validateTries(options);
    var maxTimeout = validateMaxTimeout(options);
    // If we are building snapshot, save the states of the resolver along
    // the way.
    if (isBuildingSnapshot()) {
      this[kSnapshotStates] = {
        timeout,
        tries,
        maxTimeout
      };
    }
    this[kInitializeHandle](timeout, tries, maxTimeout);
  }
  return _createClass(ResolverBase, [{
    key: kInitializeHandle,
    value: function (timeout, tries, maxTimeout) {
      var {
        ChannelWrap
      } = lazyBinding();
      this._handle = new ChannelWrap(timeout, tries, maxTimeout);
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this._handle.cancel();
    }
  }, {
    key: "getServers",
    value: function getServers() {
      return ArrayPrototypeMap(this._handle.getServers() || [], val => {
        if (!val[1] || val[1] === IANA_DNS_PORT) return val[0];
        var host = isIP(val[0]) === 6 ? `[${val[0]}]` : val[0];
        return `${host}:${val[1]}`;
      });
    }
  }, {
    key: "setServers",
    value: function setServers(servers) {
      validateArray(servers, 'servers');

      // Cache the original servers because in the event of an error while
      // setting the servers, c-ares won't have any servers available for
      // resolution.
      var newSet = [];
      ArrayPrototypeForEach(servers, (serv, index) => {
        validateString(serv, `servers[${index}]`);
        var ipVersion = isIP(serv);
        if (ipVersion !== 0) return ArrayPrototypePush(newSet, [ipVersion, serv, IANA_DNS_PORT]);
        var match = RegExpPrototypeExec(IPv6RE, serv);

        // Check for an IPv6 in brackets.
        if (match) {
          ipVersion = isIP(match[1]);
          if (ipVersion !== 0) {
            var port = NumberParseInt(RegExpPrototypeSymbolReplace(addrSplitRE, serv, '$2')) || IANA_DNS_PORT;
            return ArrayPrototypePush(newSet, [ipVersion, match[1], port]);
          }
        }

        // addr::port
        var addrSplitMatch = RegExpPrototypeExec(addrSplitRE, serv);
        if (addrSplitMatch) {
          var hostIP = addrSplitMatch[1];
          var _port = addrSplitMatch[2] || IANA_DNS_PORT;
          ipVersion = isIP(hostIP);
          if (ipVersion !== 0) {
            return ArrayPrototypePush(newSet, [ipVersion, hostIP, NumberParseInt(_port)]);
          }
        }
        throw new ERR_INVALID_IP_ADDRESS(serv);
      });
      this[kSetServersInternal](newSet, servers);
    }
  }, {
    key: kSetServersInternal,
    value: function (newSet, servers) {
      var orig = ArrayPrototypeMap(this._handle.getServers() || [], val => {
        val.unshift(isIP(val[0]));
        return val;
      });
      var errorNumber = this._handle.setServers(newSet);
      if (errorNumber !== 0) {
        // Reset the servers to the old servers, because ares probably unset them.
        this._handle.setServers(orig);
        var {
          strerror
        } = lazyBinding();
        var err = strerror(errorNumber);
        throw new ERR_DNS_SET_SERVERS_FAILED(err, servers);
      }
      if (isBuildingSnapshot()) {
        this[kSnapshotStates].servers = newSet;
      }
    }
  }, {
    key: "setLocalAddress",
    value: function setLocalAddress(ipv4, ipv6) {
      validateString(ipv4, 'ipv4');
      if (ipv6 !== undefined) {
        validateString(ipv6, 'ipv6');
      }
      this._handle.setLocalAddress(ipv4, ipv6);
      if (isBuildingSnapshot()) {
        this[kSnapshotStates].localAddress = {
          ipv4,
          ipv6
        };
      }
    }

    // TODO(joyeecheung): consider exposing this if custom DNS resolvers
    // end up being useful for snapshot users.
  }, {
    key: kSerializeResolver,
    value: function () {
      this._handle = null; // We'll restore it during deserialization.
      addDeserializeCallback(function deserializeResolver(resolver) {
        resolver[kDeserializeResolver]();
      }, this);
    }
  }, {
    key: kDeserializeResolver,
    value: function () {
      var {
        timeout,
        tries,
        maxTimeout,
        localAddress,
        servers
      } = this[kSnapshotStates];
      this[kInitializeHandle](timeout, tries, maxTimeout);
      if (localAddress) {
        var {
          ipv4,
          ipv6
        } = localAddress;
        this._handle.setLocalAddress(ipv4, ipv6);
      }
      if (servers) {
        this[kSetServersInternal](servers, servers);
      }
    }
  }]);
}();
var defaultResolver;
var dnsOrder;
var validDnsOrders = ['verbatim', 'ipv4first', 'ipv6first'];
var validFamilies = [0, 4, 6];
function initializeDns() {
  var orderFromCLI = getOptionValue('--dns-result-order');
  if (!orderFromCLI) {
    dnsOrder ??= 'verbatim';
  } else {
    // Allow the deserialized application to override order from CLI.
    validateOneOf(orderFromCLI, '--dns-result-order', validDnsOrders);
    dnsOrder = orderFromCLI;
  }
  if (!isBuildingSnapshot()) {
    return;
  }
  addSerializeCallback(() => {
    defaultResolver?.[kSerializeResolver]();
  });
}
var resolverKeys = ['getServers', 'resolve', 'resolve4', 'resolve6', 'resolveAny', 'resolveCaa', 'resolveCname', 'resolveMx', 'resolveNaptr', 'resolveNs', 'resolvePtr', 'resolveSoa', 'resolveSrv', 'resolveTlsa', 'resolveTxt', 'reverse'];
function getDefaultResolver() {
  // We do this here instead of pre-execution so that the default resolver is
  // only ever created when the user loads any dns module.
  if (defaultResolver === undefined) {
    defaultResolver = new ResolverBase();
  }
  return defaultResolver;
}
function setDefaultResolver(resolver) {
  defaultResolver = resolver;
}
function bindDefaultResolver(target, source) {
  var defaultResolver = getDefaultResolver();
  ArrayPrototypeForEach(resolverKeys, key => {
    target[key] = FunctionPrototypeBind(source[key], defaultResolver);
  });
}
function validateHints(hints) {
  var {
    AI_ADDRCONFIG,
    AI_ALL,
    AI_V4MAPPED
  } = lazyBinding();
  if ((hints & ~(AI_ADDRCONFIG | AI_ALL | AI_V4MAPPED)) !== 0) {
    throw new ERR_INVALID_ARG_VALUE('hints', hints);
  }
}
function setDefaultResultOrder(value) {
  validateOneOf(value, 'dnsOrder', validDnsOrders);
  dnsOrder = value;
}
function getDefaultResultOrder() {
  return dnsOrder;
}
function createResolverClass(resolver) {
  var resolveMap = {
    __proto__: null
  };
  var Resolver = /*#__PURE__*/function (_ResolverBase) {
    function Resolver() {
      _classCallCheck(this, Resolver);
      return _callSuper(this, Resolver, arguments);
    }
    _inherits(Resolver, _ResolverBase);
    return _createClass(Resolver);
  }(ResolverBase);
  Resolver.prototype.resolveAny = resolveMap.ANY = resolver('queryAny');
  Resolver.prototype.resolve4 = resolveMap.A = resolver('queryA');
  Resolver.prototype.resolve6 = resolveMap.AAAA = resolver('queryAaaa');
  Resolver.prototype.resolveCaa = resolveMap.CAA = resolver('queryCaa');
  Resolver.prototype.resolveCname = resolveMap.CNAME = resolver('queryCname');
  Resolver.prototype.resolveMx = resolveMap.MX = resolver('queryMx');
  Resolver.prototype.resolveNs = resolveMap.NS = resolver('queryNs');
  Resolver.prototype.resolveTlsa = resolveMap.TLSA = resolver('queryTlsa');
  Resolver.prototype.resolveTxt = resolveMap.TXT = resolver('queryTxt');
  Resolver.prototype.resolveSrv = resolveMap.SRV = resolver('querySrv');
  Resolver.prototype.resolvePtr = resolveMap.PTR = resolver('queryPtr');
  Resolver.prototype.resolveNaptr = resolveMap.NAPTR = resolver('queryNaptr');
  Resolver.prototype.resolveSoa = resolveMap.SOA = resolver('querySoa');
  Resolver.prototype.reverse = resolver('getHostByAddr');
  return {
    resolveMap,
    Resolver
  };
}

// ERROR CODES
var errorCodes = {
  NODATA: 'ENODATA',
  FORMERR: 'EFORMERR',
  SERVFAIL: 'ESERVFAIL',
  NOTFOUND: 'ENOTFOUND',
  NOTIMP: 'ENOTIMP',
  REFUSED: 'EREFUSED',
  BADQUERY: 'EBADQUERY',
  BADNAME: 'EBADNAME',
  BADFAMILY: 'EBADFAMILY',
  BADRESP: 'EBADRESP',
  CONNREFUSED: 'ECONNREFUSED',
  TIMEOUT: 'ETIMEOUT',
  EOF: 'EOF',
  FILE: 'EFILE',
  NOMEM: 'ENOMEM',
  DESTRUCTION: 'EDESTRUCTION',
  BADSTR: 'EBADSTR',
  BADFLAGS: 'EBADFLAGS',
  NONAME: 'ENONAME',
  BADHINTS: 'EBADHINTS',
  NOTINITIALIZED: 'ENOTINITIALIZED',
  LOADIPHLPAPI: 'ELOADIPHLPAPI',
  ADDRGETNETWORKPARAMS: 'EADDRGETNETWORKPARAMS',
  CANCELLED: 'ECANCELLED'
};
module.exports = {
  bindDefaultResolver,
  getDefaultResolver,
  setDefaultResolver,
  validateHints,
  validateTimeout,
  validateTries,
  getDefaultResultOrder,
  setDefaultResultOrder,
  errorCodes,
  createResolverClass,
  initializeDns,
  validDnsOrders,
  validFamilies
};

