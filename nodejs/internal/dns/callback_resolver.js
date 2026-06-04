'use strict';

var {
  ArrayPrototypeMap,
  FunctionPrototypeCall,
  ObjectDefineProperty,
  Symbol
} = primordials;
var {
  DNSException,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE
  }
} = require('internal/errors');
var {
  createResolverClass
} = require('internal/dns/utils');
var {
  validateFunction,
  validateString
} = require('internal/validators');
var {
  QueryReqWrap
} = internalBinding('cares_wrap');
var {
  hasObserver,
  startPerf,
  stopPerf
} = require('internal/perf/observe');
var kPerfHooksDnsLookupResolveContext = Symbol('kPerfHooksDnsLookupResolveContext');
function onresolve(err, result, ttls) {
  if (ttls && this.ttl) result = ArrayPrototypeMap(result, (address, index) => ({
    address,
    ttl: ttls[index]
  }));
  if (err) this.callback(new DNSException(err, this.bindingName, this.hostname));else {
    this.callback(null, result);
    if (this[kPerfHooksDnsLookupResolveContext] && hasObserver('dns')) {
      stopPerf(this, kPerfHooksDnsLookupResolveContext, {
        detail: {
          result
        }
      });
    }
  }
}
function resolver(bindingName) {
  function query(name, /* options, */callback) {
    var options;
    if (arguments.length > 2) {
      options = callback;
      callback = arguments[2];
    }
    validateString(name, 'name');
    validateFunction(callback, 'callback');
    var req = new QueryReqWrap();
    req.bindingName = bindingName;
    req.callback = callback;
    req.hostname = name;
    req.oncomplete = onresolve;
    req.ttl = !!options?.ttl;
    var err = this._handle[bindingName](req, name);
    if (err) throw new DNSException(err, bindingName, name);
    if (hasObserver('dns')) {
      startPerf(req, kPerfHooksDnsLookupResolveContext, {
        type: 'dns',
        name: bindingName,
        detail: {
          host: name,
          ttl: req.ttl
        }
      });
    }
    return req;
  }
  ObjectDefineProperty(query, 'name', {
    __proto__: null,
    value: bindingName
  });
  return query;
}

// This is the callback-based resolver. There is another similar
// resolver in dns/promises.js with resolve methods that are based
// on promises instead.
var {
  Resolver,
  resolveMap
} = createResolverClass(resolver);
Resolver.prototype.resolve = resolve;
function resolve(hostname, rrtype, callback) {
  var resolver;
  if (typeof rrtype === 'string') {
    resolver = resolveMap[rrtype];
  } else if (typeof rrtype === 'function') {
    resolver = resolveMap.A;
    callback = rrtype;
  } else {
    throw new ERR_INVALID_ARG_TYPE('rrtype', 'string', rrtype);
  }
  if (typeof resolver === 'function') {
    return FunctionPrototypeCall(resolver, this, hostname, callback);
  }
  throw new ERR_INVALID_ARG_VALUE('rrtype', rrtype);
}
module.exports = {
  Resolver
};

