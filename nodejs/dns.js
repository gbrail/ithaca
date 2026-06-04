// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var {
  ObjectDefineProperties,
  ObjectDefineProperty,
  Symbol
} = primordials;
var cares = internalBinding('cares_wrap');
var {
  isIP
} = require('internal/net');
var {
  customPromisifyArgs
} = require('internal/util');
var {
  DNSException,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
var {
  bindDefaultResolver,
  setDefaultResolver,
  validateHints,
  getDefaultResultOrder,
  setDefaultResultOrder,
  errorCodes: dnsErrorCodes,
  validDnsOrders,
  validFamilies
} = require('internal/dns/utils');
var {
  Resolver
} = require('internal/dns/callback_resolver');
var {
  NODATA,
  FORMERR,
  SERVFAIL,
  NOTFOUND,
  NOTIMP,
  REFUSED,
  BADQUERY,
  BADNAME,
  BADFAMILY,
  BADRESP,
  CONNREFUSED,
  TIMEOUT,
  EOF,
  FILE,
  NOMEM,
  DESTRUCTION,
  BADSTR,
  BADFLAGS,
  NONAME,
  BADHINTS,
  NOTINITIALIZED,
  LOADIPHLPAPI,
  ADDRGETNETWORKPARAMS,
  CANCELLED
} = dnsErrorCodes;
var {
  validateBoolean,
  validateFunction,
  validateNumber,
  validateOneOf,
  validatePort,
  validateString
} = require('internal/validators');
var {
  GetAddrInfoReqWrap,
  GetNameInfoReqWrap,
  DNS_ORDER_VERBATIM,
  DNS_ORDER_IPV4_FIRST,
  DNS_ORDER_IPV6_FIRST
} = cares;
var kPerfHooksDnsLookupContext = Symbol('kPerfHooksDnsLookupContext');
var kPerfHooksDnsLookupServiceContext = Symbol('kPerfHooksDnsLookupServiceContext');
var {
  hasObserver,
  startPerf,
  stopPerf
} = require('internal/perf/observe');
var promises = null; // Lazy loaded

function onlookup(err, addresses) {
  if (err) {
    return this.callback(new DNSException(err, 'getaddrinfo', this.hostname));
  }
  this.callback(null, addresses[0], this.family || isIP(addresses[0]));
  if (this[kPerfHooksDnsLookupContext] && hasObserver('dns')) {
    stopPerf(this, kPerfHooksDnsLookupContext, {
      detail: {
        addresses
      }
    });
  }
}
function onlookupall(err, addresses) {
  if (err) {
    return this.callback(new DNSException(err, 'getaddrinfo', this.hostname));
  }
  var family = this.family;
  for (var i = 0; i < addresses.length; i++) {
    var addr = addresses[i];
    addresses[i] = {
      address: addr,
      family: family || isIP(addr)
    };
  }
  this.callback(null, addresses);
  if (this[kPerfHooksDnsLookupContext] && hasObserver('dns')) {
    stopPerf(this, kPerfHooksDnsLookupContext, {
      detail: {
        addresses
      }
    });
  }
}

// Easy DNS A/AAAA look up
// lookup(hostname, [options,] callback)
function lookup(hostname, options, callback) {
  var hints = 0;
  var family = 0;
  var all = false;
  var dnsOrder = getDefaultResultOrder();

  // Parse arguments
  if (hostname) {
    validateString(hostname, 'hostname');
  }
  if (typeof options === 'function') {
    callback = options;
    family = 0;
  } else if (typeof options === 'number') {
    validateFunction(callback, 'callback');
    validateOneOf(options, 'family', validFamilies);
    // Coerce -0 to +0.
    family = options + 0;
  } else if (options !== undefined && typeof options !== 'object') {
    validateFunction(arguments.length === 2 ? options : callback, 'callback');
    throw new ERR_INVALID_ARG_TYPE('options', ['integer', 'object'], options);
  } else {
    validateFunction(callback, 'callback');
    if (options?.hints != null) {
      validateNumber(options.hints, 'options.hints');
      hints = options.hints >>> 0;
      validateHints(hints);
    }
    if (options?.family != null) {
      switch (options.family) {
        case 'IPv4':
          family = 4;
          break;
        case 'IPv6':
          family = 6;
          break;
        default:
          validateOneOf(options.family, 'options.family', validFamilies);
          // Coerce -0 to +0.
          family = options.family + 0;
          break;
      }
    }
    if (options?.all != null) {
      validateBoolean(options.all, 'options.all');
      all = options.all;
    }
    if (options?.verbatim != null) {
      validateBoolean(options.verbatim, 'options.verbatim');
      dnsOrder = options.verbatim ? 'verbatim' : 'ipv4first';
    }
    if (options?.order != null) {
      validateOneOf(options.order, 'options.order', validDnsOrders);
      dnsOrder = options.order;
    }
  }
  if (!hostname) {
    throw new ERR_INVALID_ARG_VALUE('hostname', hostname, 'must be a non-empty string');
  }
  var matchedFamily = isIP(hostname);
  if (matchedFamily) {
    if (all) {
      process.nextTick(callback, null, [{
        address: hostname,
        family: matchedFamily
      }]);
    } else {
      process.nextTick(callback, null, hostname, matchedFamily);
    }
    return {};
  }
  var req = new GetAddrInfoReqWrap();
  req.callback = callback;
  req.family = family;
  req.hostname = hostname;
  req.oncomplete = all ? onlookupall : onlookup;
  var order = DNS_ORDER_VERBATIM;
  if (dnsOrder === 'ipv4first') {
    order = DNS_ORDER_IPV4_FIRST;
  } else if (dnsOrder === 'ipv6first') {
    order = DNS_ORDER_IPV6_FIRST;
  }
  var err = cares.getaddrinfo(req, hostname, family, hints, order);
  if (err) {
    process.nextTick(callback, new DNSException(err, 'getaddrinfo', hostname));
    return {};
  }
  if (hasObserver('dns')) {
    var detail = {
      hostname,
      family,
      hints,
      verbatim: order === DNS_ORDER_VERBATIM,
      order: dnsOrder
    };
    startPerf(req, kPerfHooksDnsLookupContext, {
      type: 'dns',
      name: 'lookup',
      detail
    });
  }
  return req;
}
ObjectDefineProperty(lookup, customPromisifyArgs, {
  __proto__: null,
  value: ['address', 'family'],
  enumerable: false
});
function onlookupservice(err, hostname, service) {
  if (err) return this.callback(new DNSException(err, 'getnameinfo', this.hostname));
  this.callback(null, hostname, service);
  if (this[kPerfHooksDnsLookupServiceContext] && hasObserver('dns')) {
    stopPerf(this, kPerfHooksDnsLookupServiceContext, {
      detail: {
        hostname,
        service
      }
    });
  }
}
function lookupService(address, port, callback) {
  if (arguments.length !== 3) throw new ERR_MISSING_ARGS('address', 'port', 'callback');
  if (isIP(address) === 0) throw new ERR_INVALID_ARG_VALUE('address', address);
  validatePort(port);
  validateFunction(callback, 'callback');

  // Coerce -0 to +0.
  port = +port + 0;
  var req = new GetNameInfoReqWrap();
  req.callback = callback;
  req.hostname = address;
  req.port = port;
  req.oncomplete = onlookupservice;
  var err = cares.getnameinfo(req, address, port);
  if (err) throw new DNSException(err, 'getnameinfo', address);
  if (hasObserver('dns')) {
    startPerf(req, kPerfHooksDnsLookupServiceContext, {
      type: 'dns',
      name: 'lookupService',
      detail: {
        host: address,
        port
      }
    });
  }
  return req;
}
ObjectDefineProperty(lookupService, customPromisifyArgs, {
  __proto__: null,
  value: ['hostname', 'service'],
  enumerable: false
});
function defaultResolverSetServers(servers) {
  var resolver = new Resolver();
  resolver.setServers(servers);
  setDefaultResolver(resolver);
  bindDefaultResolver(module.exports, Resolver.prototype);
  if (promises !== null) bindDefaultResolver(promises, promises.Resolver.prototype);
}
module.exports = {
  lookup,
  lookupService,
  Resolver,
  getDefaultResultOrder,
  setDefaultResultOrder,
  setServers: defaultResolverSetServers,
  // uv_getaddrinfo flags
  ADDRCONFIG: cares.AI_ADDRCONFIG,
  ALL: cares.AI_ALL,
  V4MAPPED: cares.AI_V4MAPPED,
  // ERROR CODES
  NODATA,
  FORMERR,
  SERVFAIL,
  NOTFOUND,
  NOTIMP,
  REFUSED,
  BADQUERY,
  BADNAME,
  BADFAMILY,
  BADRESP,
  CONNREFUSED,
  TIMEOUT,
  EOF,
  FILE,
  NOMEM,
  DESTRUCTION,
  BADSTR,
  BADFLAGS,
  NONAME,
  BADHINTS,
  NOTINITIALIZED,
  LOADIPHLPAPI,
  ADDRGETNETWORKPARAMS,
  CANCELLED
};
bindDefaultResolver(module.exports, Resolver.prototype);
ObjectDefineProperties(module.exports, {
  promises: {
    __proto__: null,
    configurable: true,
    enumerable: true,
    get() {
      if (promises === null) {
        promises = require('internal/dns/promises');
      }
      return promises;
    }
  }
});

