'use strict';

function _empty() {}
var watch = function (filename) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  return new _AsyncGenerator(function (_generator) {
    var _exit = false;
    var path = toNamespacedPath(getValidatedPath(filename));
    validateObject(options, 'options');
    var {
      persistent = true,
      recursive = false,
      encoding = 'utf8',
      maxQueue = 2048,
      overflow = 'ignore',
      signal,
      ignore
    } = options;
    validateBoolean(persistent, 'options.persistent');
    validateBoolean(recursive, 'options.recursive');
    validateInteger(maxQueue, 'options.maxQueue');
    validateOneOf(overflow, 'options.overflow', ['ignore', 'error']);
    validateAbortSignal(signal, 'options.signal');
    validateIgnoreOption(ignore, 'options.ignore');
    if (encoding && !isEncoding(encoding)) {
      var reason = 'is invalid encoding';
      throw new ERR_INVALID_ARG_VALUE('encoding', encoding, reason);
    }
    if (signal?.aborted) throw new AbortError(undefined, {
      cause: signal.reason
    });
    var handle = new FSEvent();
    var ignoreMatcher = createIgnoreMatcher(ignore);
    var {
      promise,
      resolve
    } = PromiseWithResolvers();
    var queue = [];
    var oncancel = () => {
      handle.close();
      resolve();
    };
    return _finallyRethrows(function () {
      if (signal) {
        kResistStopPropagation ??= require('internal/event_target').kResistStopPropagation;
        signal.addEventListener('abort', oncancel, {
          __proto__: null,
          once: true,
          [kResistStopPropagation]: true
        });
      }
      handle.onchange = (status, eventType, filename) => {
        if (status < 0) {
          var error = new UVException({
            errno: status,
            syscall: 'watch',
            path: filename
          });
          error.filename = filename;
          handle.close();
          ArrayPrototypePush(queue, error);
          resolve();
          return;
        }
        // Filter events if ignore matcher is set and filename is available
        if (filename != null && ignoreMatcher?.(filename)) {
          return;
        }
        if (queue.length < maxQueue) {
          ArrayPrototypePush(queue, {
            __proto__: null,
            eventType,
            filename
          });
          resolve();
        } else if (overflow === 'error') {
          queue.length = 0;
          ArrayPrototypePush(queue, new ERR_FS_WATCH_QUEUE_OVERFLOW(maxQueue));
          resolve();
        } else {
          process.emitWarning('fs.watch maxQueue exceeded');
        }
      };
      var err = handle.start(path, persistent, recursive, encoding);
      if (err) {
        var error = new UVException({
          errno: err,
          syscall: 'watch',
          path: filename,
          message: err === UV_ENOSPC ? 'System limit for number of file watchers reached' : ''
        });
        error.filename = filename;
        handle.close();
        throw error;
      }
      return _continue(_for(function () {
        return !_exit && !signal?.aborted;
      }, void 0, function () {
        return _await(promise, function () {
          var _exit2 = false;
          return _continue(_for(function () {
            return !_exit2 && !!queue.length;
          }, void 0, function () {
            var item = ArrayPrototypeShift(queue);
            return function () {
              if (item instanceof Error) {
                throw item;
              } else {
                return _generator._yield(item).then(_empty);
              }
            }();
          }), function (_result2) {
            if (_exit2) return _result2;
            ({
              promise,
              resolve
            } = PromiseWithResolvers());
          });
        });
      }), function (_result3) {
        if (_exit) return _result3;
        if (signal?.aborted) {
          throw new AbortError(undefined, {
            cause: signal?.reason
          });
        }
      });
    }, function (_wasThrown, _result4) {
      handle.close();
      signal?.removeEventListener('abort', oncancel);
      return _rethrow(_wasThrown, _result4);
    });
  });
};
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
var {
  ArrayIsArray,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  Error,
  FunctionPrototypeCall,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  PromiseWithResolvers,
  RegExpPrototypeExec,
  Symbol
} = primordials;
var _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;
    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        var value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _for(test, update, body) {
  var stage;
  for (;;) {
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
    if (shouldContinue.then) {
      stage = 0;
      break;
    }
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.s;
      } else {
        stage = 1;
        break;
      }
    }
    if (update) {
      var updateValue = update();
      if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
        stage = 2;
        break;
      }
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    do {
      if (update) {
        updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          updateValue.then(_resumeAfterUpdate).then(void 0, reject);
          return;
        }
      }
      shouldContinue = test();
      if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
        _settle(pact, 1, result);
        return;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (_isSettledPact(result)) {
        result = result.v;
      }
    } while (!result || !result.then);
    result.then(_resumeAfterBody).then(void 0, reject);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
      } else {
        _resumeAfterBody(result);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
  function _resumeAfterUpdate() {
    if (shouldContinue = test()) {
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
      } else {
        _resumeAfterTest(shouldContinue);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
}
var {
  AbortError,
  UVException,
  codes: {
    ERR_FS_WATCH_QUEUE_OVERFLOW,
    ERR_INVALID_ARG_VALUE
  }
} = require('internal/errors');
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
var {
  kEmptyObject,
  getLazy,
  isWindows,
  isMacOS
} = require('internal/util');
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var {
  kFsStatsFieldsNumber,
  StatWatcher: _StatWatcher
} = internalBinding('fs');
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
var {
  FSEvent
} = internalBinding('fs_event_wrap');
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
}
var {
  UV_ENOSPC,
  UV_ENOENT
} = internalBinding('uv');
var _earlyReturn = /*#__PURE__*/{},
  _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator",
  _AsyncGenerator = /*#__PURE__*/function () {
    function _AsyncGenerator(entry) {
      this._entry = entry;
      this._pact = null;
      this._resolve = null;
      this._return = null;
      this._promise = null;
    }
    function _wrapReturnedValue(value) {
      return {
        value: value,
        done: true
      };
    }
    function _wrapYieldedValue(value) {
      return {
        value: value,
        done: false
      };
    }
    _AsyncGenerator.prototype._yield = function (value) {
      // Yield the value to the pending next call
      this._resolve(value && value.then ? value.then(_wrapYieldedValue) : _wrapYieldedValue(value));
      // Return a pact for an upcoming next/return/throw call
      return this._pact = new _Pact();
    };
    _AsyncGenerator.prototype.next = function (value) {
      // Advance the generator, starting it if it has yet to be started
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          var _entry = _this._entry;
          if (_entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the next call!
            return resolve(_this._promise);
          }
          // Start the generator
          _this._entry = null;
          _this._resolve = resolve;
          function returnValue(value) {
            _this._resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
            _this._pact = null;
            _this._resolve = null;
          }
          var result = _entry(_this);
          if (result && result.then) {
            result.then(returnValue, function (error) {
              if (error === _earlyReturn) {
                returnValue(_this._return);
              } else {
                var pact = new _Pact();
                _this._resolve(pact);
                _this._pact = null;
                _this._resolve = null;
                _resolve(pact, 2, error);
              }
            });
          } else {
            returnValue(result);
          }
        } else {
          // Generator is started and a yield expression is pending, settle it
          _this._pact = null;
          _this._resolve = resolve;
          _settle(_pact, 1, value);
        }
      });
    };
    _AsyncGenerator.prototype.return = function (value) {
      // Early return from the generator if started, otherwise abandons the generator
      var _this = this;
      return _this._promise = new Promise(function (resolve) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the return call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return the specified value
          _this._entry = null;
          return resolve(value && value.then ? value.then(_wrapReturnedValue) : _wrapReturnedValue(value));
        }
        // Settle the yield expression with a rejected "early return" value
        _this._return = value;
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, _earlyReturn);
      });
    };
    _AsyncGenerator.prototype.throw = function (error) {
      // Inject an exception into the pending yield expression
      var _this = this;
      return _this._promise = new Promise(function (resolve, reject) {
        var _pact = _this._pact;
        if (_pact === null) {
          if (_this._entry === null) {
            // Generator is started, but not awaiting a yield expression
            // Abandon the throw call!
            return resolve(_this._promise);
          }
          // Generator is not started, abandon it and return a rejected Promise containing the error
          _this._entry = null;
          return reject(error);
        }
        // Settle the yield expression with the value as a rejection
        _this._resolve = resolve;
        _this._pact = null;
        _settle(_pact, 2, error);
      });
    };
    _AsyncGenerator.prototype[_asyncIteratorSymbol] = function () {
      return this;
    };
    return _AsyncGenerator;
  }(),
  {
    EventEmitter
  } = require('events');
var {
  getStatsFromBinding,
  getValidatedPath
} = require('internal/fs/utils');
var {
  defaultTriggerAsyncIdScope,
  symbols: {
    owner_symbol
  }
} = require('internal/async_hooks');
var {
  toNamespacedPath
} = require('path');
var {
  validateAbortSignal,
  validateBoolean,
  validateIgnoreOption,
  validateObject,
  validateUint32,
  validateInteger,
  validateOneOf
} = require('internal/validators');
var {
  Buffer: {
    isEncoding
  }
} = require('buffer');
var {
  isRegExp
} = require('internal/util/types');
var assert = require('internal/assert');
var kOldStatus = Symbol('kOldStatus');
var kUseBigint = Symbol('kUseBigint');
var kFSWatchStart = Symbol('kFSWatchStart');
var kFSStatWatcherStart = Symbol('kFSStatWatcherStart');
var KFSStatWatcherRefCount = Symbol('KFSStatWatcherRefCount');
var KFSStatWatcherMaxRefCount = Symbol('KFSStatWatcherMaxRefCount');
var kFSStatWatcherAddOrCleanRef = Symbol('kFSStatWatcherAddOrCleanRef');
var lazyMinimatch = getLazy(() => require('internal/deps/minimatch/index'));

/**
 * Creates an ignore matcher function from the ignore option.
 * @param {string | RegExp | Function | Array} ignore - The ignore patterns
 * @returns {Function | null} A function that returns true if filename should be ignored
 */
function createIgnoreMatcher(ignore) {
  if (ignore == null) return null;
  var matchers = ArrayIsArray(ignore) ? ignore : [ignore];
  var compiled = [];
  var _loop = function () {
    var matcher = matchers[i];
    if (typeof matcher === 'string') {
      var mm = new (lazyMinimatch().Minimatch)(matcher, {
        __proto__: null,
        nocase: isWindows || isMacOS,
        windowsPathsNoEscape: true,
        nonegate: true,
        nocomment: true,
        optimizationLevel: 2,
        platform: process.platform,
        // matchBase allows patterns without slashes to match the basename
        // e.g., '*.log' matches 'subdir/file.log'
        matchBase: true
      });
      ArrayPrototypePush(compiled, filename => mm.match(filename));
    } else if (isRegExp(matcher)) {
      ArrayPrototypePush(compiled, filename => RegExpPrototypeExec(matcher, filename) !== null);
    } else {
      // Function
      ArrayPrototypePush(compiled, matcher);
    }
  };
  for (var i = 0; i < matchers.length; i++) {
    _loop();
  }
  return filename => {
    for (var _i = 0; _i < compiled.length; _i++) {
      if (compiled[_i](filename)) return true;
    }
    return false;
  };
}
function emitStop(self) {
  self.emit('stop');
}
function StatWatcher(bigint) {
  FunctionPrototypeCall(EventEmitter, this);
  this._handle = null;
  this[kOldStatus] = -1;
  this[kUseBigint] = bigint;
  this[KFSStatWatcherRefCount] = 1;
  this[KFSStatWatcherMaxRefCount] = 1;
}
ObjectSetPrototypeOf(StatWatcher.prototype, EventEmitter.prototype);
ObjectSetPrototypeOf(StatWatcher, EventEmitter);
function onchange(newStatus, stats) {
  var self = this[owner_symbol];
  if (self[kOldStatus] === -1 && newStatus === -1 && stats[2 /* new nlink */] === stats[16 /* old nlink */]) {
    return;
  }
  self[kOldStatus] = newStatus;
  self.emit('change', getStatsFromBinding(stats), getStatsFromBinding(stats, kFsStatsFieldsNumber));
}

// At the moment if filename is undefined, we
// 1. Throw an Error if it's the first
//    time Symbol('kFSStatWatcherStart') is called
// 2. Return silently if Symbol('kFSStatWatcherStart') has already been called
//    on a valid filename and the wrap has been initialized
// This method is a noop if the watcher has already been started.
StatWatcher.prototype[kFSStatWatcherStart] = function (filename, persistent, interval) {
  if (this._handle !== null) return;
  this._handle = new _StatWatcher(this[kUseBigint]);
  this._handle[owner_symbol] = this;
  this._handle.onchange = onchange;
  if (!persistent) this.unref();

  // uv_fs_poll is a little more powerful than ev_stat but we curb it for
  // the sake of backwards compatibility.
  this[kOldStatus] = -1;
  filename = getValidatedPath(filename, 'filename');
  validateUint32(interval, 'interval');
  // Coerce -0 to +0.
  interval += 0;
  var err = this._handle.start(toNamespacedPath(filename), interval);
  if (err) {
    var error = new UVException({
      errno: err,
      syscall: 'watch',
      path: filename
    });
    error.filename = filename;
    throw error;
  }
};

// To maximize backward-compatibility for the end user,
// a no-op stub method has been added instead of
// totally removing StatWatcher.prototype.start.
// This should not be documented.
StatWatcher.prototype.start = () => {};

// FIXME(joyeecheung): this method is not documented while there is
// another documented fs.unwatchFile(). The counterpart in
// FSWatcher is .close()
// This method is a noop if the watcher has not been started.
StatWatcher.prototype.stop = function () {
  if (this._handle === null) return;
  defaultTriggerAsyncIdScope(this._handle.getAsyncId(), process.nextTick, emitStop, this);
  this._handle.close();
  this._handle = null;
};

// Clean up or add ref counters.
StatWatcher.prototype[kFSStatWatcherAddOrCleanRef] = function (operate) {
  if (operate === 'add') {
    // Add a Ref
    this[KFSStatWatcherRefCount]++;
    this[KFSStatWatcherMaxRefCount]++;
  } else if (operate === 'clean') {
    // Clean up a single
    this[KFSStatWatcherMaxRefCount]--;
    this.unref();
  } else if (operate === 'cleanAll') {
    // Clean up all
    this[KFSStatWatcherMaxRefCount] = 0;
    this[KFSStatWatcherRefCount] = 0;
    this._handle?.unref();
  }
};
StatWatcher.prototype.ref = function () {
  // Avoid refCount calling ref multiple times causing unref to have no effect.
  if (this[KFSStatWatcherRefCount] === this[KFSStatWatcherMaxRefCount]) return this;
  if (this._handle && this[KFSStatWatcherRefCount]++ === 0) this._handle.ref();
  return this;
};
StatWatcher.prototype.unref = function () {
  // Avoid refCount calling unref multiple times causing ref to have no effect.
  if (this[KFSStatWatcherRefCount] === 0) return this;
  if (this._handle && --this[KFSStatWatcherRefCount] === 0) this._handle.unref();
  return this;
};
function FSWatcher() {
  FunctionPrototypeCall(EventEmitter, this);
  this._handle = new FSEvent();
  this._handle[owner_symbol] = this;
  this._ignoreMatcher = null;
  this._handle.onchange = (status, eventType, filename) => {
    // TODO(joyeecheung): we may check self._handle.initialized here
    // and return if that is false. This allows us to avoid firing the event
    // after the handle is closed, and to fire both UV_RENAME and UV_CHANGE
    // if they are set by libuv at the same time.
    if (status < 0) {
      if (this._handle !== null) {
        // We don't use this.close() here to avoid firing the close event.
        this._handle.close();
        this._handle = null; // Make the handle garbage collectable.
      }
      var error = new UVException({
        errno: status,
        syscall: 'watch',
        path: filename
      });
      error.filename = filename;
      this.emit('error', error);
    } else {
      // Filter events if ignore matcher is set and filename is available
      if (filename != null && this._ignoreMatcher?.(filename)) {
        return;
      }
      this.emit('change', eventType, filename);
    }
  };
}
ObjectSetPrototypeOf(FSWatcher.prototype, EventEmitter.prototype);
ObjectSetPrototypeOf(FSWatcher, EventEmitter);

// At the moment if filename is undefined, we
// 1. Throw an Error if it's the first time Symbol('kFSWatchStart') is called
// 2. Return silently if Symbol('kFSWatchStart') has already been called
//    on a valid filename and the wrap has been initialized
// 3. Return silently if the watcher has already been closed
// This method is a noop if the watcher has already been started.
FSWatcher.prototype[kFSWatchStart] = function (filename, persistent, recursive, encoding, ignore) {
  var throwIfNoEntry = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  if (this._handle === null) {
    // closed
    return;
  }
  assert(this._handle instanceof FSEvent, 'handle must be a FSEvent');
  if (this._handle.initialized) {
    // already started
    return;
  }
  filename = getValidatedPath(filename, 'filename');

  // Validate and create the ignore matcher
  validateIgnoreOption(ignore, 'options.ignore');
  this._ignoreMatcher = createIgnoreMatcher(ignore);
  var err = this._handle.start(toNamespacedPath(filename), persistent, recursive, encoding);
  if (err) {
    if (!throwIfNoEntry && err === UV_ENOENT) {
      return;
    }
    var error = new UVException({
      errno: err,
      syscall: 'watch',
      path: filename,
      message: err === UV_ENOSPC ? 'System limit for number of file watchers reached' : ''
    });
    error.filename = filename;
    throw error;
  }
};

// To maximize backward-compatibility for the end user,
// a no-op stub method has been added instead of
// totally removing FSWatcher.prototype.start.
// This should not be documented.
FSWatcher.prototype.start = () => {};

// This method is a noop if the watcher has not been started or
// has already been closed.
FSWatcher.prototype.close = function () {
  if (this._handle === null) {
    // closed
    return;
  }
  assert(this._handle instanceof FSEvent, 'handle must be a FSEvent');
  if (!this._handle.initialized) {
    // not started
    return;
  }
  this._handle.close();
  this._handle = null; // Make the handle garbage collectable.
  process.nextTick(emitCloseNT, this);
};
FSWatcher.prototype.ref = function () {
  if (this._handle) this._handle.ref();
  return this;
};
FSWatcher.prototype.unref = function () {
  if (this._handle) this._handle.unref();
  return this;
};
function emitCloseNT(self) {
  self.emit('close');
}

// Legacy alias on the C++ wrapper object. This is not public API, so we may
// want to runtime-deprecate it at some point. There's no hurry, though.
ObjectDefineProperty(FSEvent.prototype, 'owner', {
  __proto__: null,
  get() {
    return this[owner_symbol];
  },
  set(v) {
    return this[owner_symbol] = v;
  }
});
var kResistStopPropagation;
module.exports = {
  createIgnoreMatcher,
  FSWatcher,
  StatWatcher,
  kFSWatchStart,
  kFSStatWatcherStart,
  kFSStatWatcherAddOrCleanRef,
  watch
};

