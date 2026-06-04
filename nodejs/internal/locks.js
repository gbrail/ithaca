'use strict';

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ObjectDefineProperties,
  Promise,
  PromisePrototypeThen,
  PromiseResolve,
  SafePromisePrototypeFinally,
  Symbol: _Symbol,
  SymbolToStringTag
} = primordials;
var {
  ERR_ILLEGAL_CONSTRUCTOR,
  ERR_INVALID_THIS
} = require('internal/errors');
var {
  kEmptyObject,
  lazyDOMException,
  kEnumerableProperty
} = require('internal/util');
var {
  validateAbortSignal,
  validateFunction
} = require('internal/validators');
var {
  threadId
} = require('internal/worker');
var {
  converters,
  createEnumConverter,
  createDictionaryConverter
} = require('internal/webidl');
var dc = require('diagnostics_channel');
var locks = internalBinding('locks');
var lockRequestStartChannel = dc.channel('locks.request.start');
var lockRequestGrantChannel = dc.channel('locks.request.grant');
var lockRequestMissChannel = dc.channel('locks.request.miss');
var lockRequestEndChannel = dc.channel('locks.request.end');
var kName = _Symbol('kName');
var kMode = _Symbol('kMode');
var kConstructLock = _Symbol('kConstructLock');
var kConstructLockManager = _Symbol('kConstructLockManager');

// WebIDL dictionary LockOptions
var convertLockOptions = createDictionaryConverter('LockOptions', [{
  key: 'mode',
  converter: createEnumConverter('LockMode', ['shared', 'exclusive']),
  defaultValue: () => 'exclusive'
}, {
  key: 'ifAvailable',
  converter: value => !!value,
  defaultValue: () => false
}, {
  key: 'steal',
  converter: value => !!value,
  defaultValue: () => false
}, {
  key: 'signal',
  converter: converters.object
}]);

// https://w3c.github.io/web-locks/#api-lock
var Lock = /*#__PURE__*/function () {
  function Lock() {
    var symbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var name = arguments.length > 1 ? arguments[1] : undefined;
    var mode = arguments.length > 2 ? arguments[2] : undefined;
    _classCallCheck(this, Lock);
    if (symbol !== kConstructLock) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    this[kName] = name;
    this[kMode] = mode;
  }
  return _createClass(Lock, [{
    key: "name",
    get: function () {
      if (this instanceof Lock) {
        return this[kName];
      }
      throw new ERR_INVALID_THIS('Lock');
    }
  }, {
    key: "mode",
    get: function () {
      if (this instanceof Lock) {
        return this[kMode];
      }
      throw new ERR_INVALID_THIS('Lock');
    }
  }]);
}();
ObjectDefineProperties(Lock.prototype, {
  name: kEnumerableProperty,
  mode: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    value: 'Lock',
    writable: false,
    enumerable: false,
    configurable: true
  }
});

// Helper to create Lock objects from internal C++ lock data
function createLock(internalLock) {
  return internalLock === null ? null : new Lock(kConstructLock, internalLock.name, internalLock.mode);
}

// Convert LOCK_STOLEN_ERROR to AbortError DOMException
function convertLockError(error) {
  if (error?.message === locks.LOCK_STOLEN_ERROR) {
    return lazyDOMException('The operation was aborted', 'AbortError');
  }
  return error;
}
function publishLockRequestStart(name, mode) {
  if (lockRequestStartChannel.hasSubscribers) {
    lockRequestStartChannel.publish({
      name,
      mode
    });
  }
}
function publishLockRequestGrant(name, mode) {
  if (lockRequestGrantChannel.hasSubscribers) {
    lockRequestGrantChannel.publish({
      name,
      mode
    });
  }
}
function publishLockRequestMiss(name, mode, ifAvailable) {
  if (ifAvailable && lockRequestMissChannel.hasSubscribers) {
    lockRequestMissChannel.publish({
      name,
      mode
    });
  }
}
function publishLockRequestEnd(name, mode, ifAvailable, steal, error) {
  if (lockRequestEndChannel.hasSubscribers) {
    lockRequestEndChannel.publish({
      name,
      mode,
      ifAvailable,
      steal,
      error
    });
  }
}

// https://w3c.github.io/web-locks/#api-lock-manager
var LockManager = /*#__PURE__*/function () {
  function LockManager() {
    var symbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    _classCallCheck(this, LockManager);
    if (symbol !== kConstructLockManager) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
  }

  /**
   * Request a Web Lock for a named resource.
   * @param {string} name - The name of the lock resource
   * @param {object} [options] - Lock options (optional)
   * @param {string} [options.mode] - Lock mode: 'exclusive' or 'shared' default is exclusive
   * @param {boolean} [options.ifAvailable] - Only grant if immediately available
   * @param {boolean} [options.steal] - Steal existing locks with same name
   * @param {AbortSignal} [options.signal] - Signal to abort pending lock request
   * @param {Function} [callback] - Function called when lock is granted
   * @returns {Promise} Promise that resolves when the lock is released
   * @throws {TypeError} When name is not a string or callback is not a function
   * @throws {DOMException} When validation fails or operation is not supported
   */
  // https://w3c.github.io/web-locks/#api-lock-manager-request
  return _createClass(LockManager, [{
    key: "request",
    value: function request(name, options) {
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      try {
        if (callback === undefined) {
          callback = options;
          options = undefined;
        }
        name = converters.DOMString(name);
        validateFunction(callback, 'callback');
        if (options === undefined || typeof options === 'function') {
          options = kEmptyObject;
        }

        // Convert LockOptions dictionary
        options = convertLockOptions(options);
        var {
          mode,
          ifAvailable,
          steal,
          signal
        } = options;
        validateAbortSignal(signal, 'options.signal');
        if (signal) {
          signal.throwIfAborted();
        }
        if (name[0] === '-') {
          // If name starts with U+002D HYPHEN-MINUS (-), then reject promise with a
          // "NotSupportedError" DOMException.
          throw lazyDOMException('Lock name may not start with hyphen', 'NotSupportedError');
        }
        if (ifAvailable === true && steal === true) {
          // If both options' steal dictionary member and option's
          // ifAvailable dictionary member are true, then reject promise with a
          // "NotSupportedError" DOMException.
          throw lazyDOMException('ifAvailable and steal are mutually exclusive', 'NotSupportedError');
        }
        if (mode !== locks.LOCK_MODE_EXCLUSIVE && steal === true) {
          // If options' steal dictionary member is true and options' mode
          // dictionary member is not "exclusive", then return a promise rejected
          // with a "NotSupportedError" DOMException.
          throw lazyDOMException(`mode: "${locks.LOCK_MODE_SHARED}" and steal are mutually exclusive`, 'NotSupportedError');
        }
        if (signal && (steal === true || ifAvailable === true)) {
          // If options' signal dictionary member is present, and either of
          // options' steal dictionary member or options' ifAvailable dictionary
          // member is true, then return a promise rejected with a
          // "NotSupportedError" DOMException.
          throw lazyDOMException('signal cannot be used with steal or ifAvailable', 'NotSupportedError');
        }
        var clientId = `node-${process.pid}-${threadId}`;
        publishLockRequestStart(name, mode);

        // Handle requests with AbortSignal
        if (signal) {
          return _await(new Promise((resolve, reject) => {
            var lockGranted = false;
            var abortListener = () => {
              if (!lockGranted) {
                reject(signal.reason || lazyDOMException('The operation was aborted', 'AbortError'));
              }
            };
            signal.addEventListener('abort', abortListener, {
              once: true
            });
            var wrappedCallback = lock => {
              return PromisePrototypeThen(PromiseResolve(), () => {
                if (signal.aborted) {
                  return undefined;
                }
                lockGranted = true;
                publishLockRequestGrant(name, mode);
                return callback(createLock(lock));
              });
            };
            try {
              var released = locks.request(name, clientId, mode, steal, ifAvailable, wrappedCallback);

              // When released promise settles, clean up listener and resolve main promise
              SafePromisePrototypeFinally(PromisePrototypeThen(released, result => {
                publishLockRequestEnd(name, mode, ifAvailable, steal, undefined);
                resolve(result);
              }, error => {
                var convertedError = convertLockError(error);
                publishLockRequestEnd(name, mode, ifAvailable, steal, convertedError);
                reject(convertedError);
              }), () => signal.removeEventListener('abort', abortListener));
            } catch (error) {
              signal.removeEventListener('abort', abortListener);
              var convertedError = convertLockError(error);
              publishLockRequestEnd(name, mode, ifAvailable, steal, convertedError);
              reject(convertedError);
            }
          }));
        }

        // When ifAvailable: true and lock is not available, C++ passes null to indicate no lock granted
        var wrapCallback = internalLock => {
          if (internalLock === null) {
            publishLockRequestMiss(name, mode, ifAvailable);
          } else {
            publishLockRequestGrant(name, mode);
          }
          var lock = createLock(internalLock);
          return callback(lock);
        };

        // Standard request without signal
        return _await(_catch(function () {
          return _await(locks.request(name, clientId, mode, steal, ifAvailable, wrapCallback), function (result) {
            publishLockRequestEnd(name, mode, ifAvailable, steal, undefined);
            return result;
          });
        }, function (error) {
          var convertedError = convertLockError(error);
          publishLockRequestEnd(name, mode, ifAvailable, steal, convertedError);
          throw convertedError;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Query the current state of locks for this environment.
     * @returns {Promise<{held: Array<object>, pending: Array<object>}>} Promise resolving to lock manager snapshot
     */
    // https://w3c.github.io/web-locks/#api-lock-manager-query
  }, {
    key: "query",
    value: function query() {
      try {
        var _this = this;
        if (_this instanceof LockManager) {
          return _await(locks.query());
        }
        throw new ERR_INVALID_THIS('LockManager');
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);
}();
ObjectDefineProperties(LockManager.prototype, {
  request: kEnumerableProperty,
  query: kEnumerableProperty,
  [SymbolToStringTag]: {
    __proto__: null,
    value: 'LockManager',
    writable: false,
    enumerable: false,
    configurable: true
  }
});
module.exports = {
  Lock,
  LockManager,
  locks: new LockManager(kConstructLockManager)
};

