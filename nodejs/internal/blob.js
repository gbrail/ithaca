'use strict';

function _empty() {}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
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
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
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
  }();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var createBlobReaderIterable = function (reader) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new _AsyncGenerator(function (_generator) {
    var _exit = false;
    var {
      getReadError
    } = options;
    var wakeup = PromiseWithResolvers();
    reader.setWakeup(wakeup.resolve);
    return _finallyRethrows(function () {
      return _for(function () {
        return !_exit;
      }, void 0, function () {
        var batch = [];
        var blocked = false;
        var eos = false;
        var error = null;

        // Pull as many chunks as available synchronously.
        // reader.pull(callback) calls the callback synchronously via
        // MakeCallback, so we can collect multiple chunks per iteration
        // step without any async overhead.
        var _loop = function () {
            var pullResult;
            reader.pull((status, buffer) => {
              pullResult = {
                status,
                buffer
              };
            });
            if (pullResult.status === 0) {
              eos = true;
              return 0; // break
            }
            if (pullResult.status < 0) {
              error = typeof getReadError === 'function' ? getReadError(pullResult.status) : new ERR_INVALID_STATE('The reader is not readable');
              return 0; // break
            }
            if (pullResult.status === 2) {
              blocked = true;
              return 0; // break
            }
            ArrayPrototypePush(batch, new Uint8Array(pullResult.buffer));
            if (batch.length >= kMaxBatchChunks) return 0; // break
          },
          _ret;
        while (true) {
          _ret = _loop();
          if (_ret === 0) break;
        }
        return _invoke(function () {
          if (batch.length > 0) {
            return _generator._yield(batch).then(_empty);
          }
        }, function () {
          if (eos) {
            _exit = true;
            return;
          }
          if (error) throw error;
          return _invokeIgnored(function () {
            if (blocked) {
              return _await(wakeup.promise, function (fin) {
                wakeup = PromiseWithResolvers();
                reader.setWakeup(wakeup.resolve);
                // If the wakeup was triggered by FIN (EndReadable), the DataQueue
                // is capped. Continue the loop to pull again -- the next pull will
                // return EOS. Without this, a race between the data notification
                // and the FIN notification can leave the iterator waiting for a
                // wakeup that will never come.
                if (fin) return;
              });
            }
          });
        });
      });
    }, function (_wasThrown, _result2) {
      reader.setWakeup(undefined);
      return _rethrow(_wasThrown, _result2);
    });
  });
};
var {
  ArrayPrototypePush,
  MathMax,
  MathMin,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  PromisePrototypeThen,
  PromiseReject,
  PromiseWithResolvers,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolReplace,
  StringPrototypeSplit,
  StringPrototypeToLowerCase,
  Symbol: _Symbol,
  SymbolToStringTag,
  Uint8Array
} = primordials;
var {
  createBlob: _createBlob,
  createBlobFromFilePath: _createBlobFromFilePath,
  concat,
  getDataObject
} = internalBinding('blob');
var {
  kMaxLength
} = internalBinding('buffer');
var {
  TextDecoder,
  TextEncoder
} = require('internal/encoding');
var {
  URL
} = require('internal/url');
var {
  markTransferMode,
  kClone,
  kDeserialize
} = require('internal/worker/js_transferable');
var {
  isAnyArrayBuffer,
  isArrayBufferView
} = require('internal/util/types');
var {
  customInspectSymbol: kInspect,
  kEmptyObject,
  kEnumerableProperty,
  lazyDOMException
} = require('internal/util');
var {
  inspect
} = require('internal/util/inspect');
var {
  converters,
  createSequenceConverter
} = require('internal/webidl');
var {
  codes: {
    ERR_BUFFER_TOO_LARGE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE,
    ERR_INVALID_THIS
  }
} = require('internal/errors');
var {
  validateDictionary
} = require('internal/validators');
var {
  setImmediate
} = require('timers');
var {
  queueMicrotask
} = require('internal/process/task_queues');
var kHandle = _Symbol('kHandle');
var kType = _Symbol('kType');
var kLength = _Symbol('kLength');
var kNotCloneable = _Symbol('kNotCloneable');
var disallowedTypeCharacters = /[^\u{0020}-\u{007E}]/u;
var ReadableStream;
var enc = new TextEncoder();
var dec;

// Yes, lazy loading is annoying but because of circular
// references between the url, internal/blob, and buffer
// modules, lazy loading here makes sure that things work.

function lazyReadableStream(options) {
  // eslint-disable-next-line no-global-assign
  ReadableStream ??= require('internal/webstreams/readablestream').ReadableStream;
  return new ReadableStream(options);
}
var {
  EOL
} = require('internal/constants');
function isBlob(object) {
  return object?.[kHandle] !== undefined;
}
function getSource(source, endings) {
  if (isBlob(source)) return [source.size, source[kHandle]];
  if (isAnyArrayBuffer(source)) {
    source = new Uint8Array(source);
  } else if (!isArrayBufferView(source)) {
    if (endings === 'native') source = RegExpPrototypeSymbolReplace(/\n|\r\n/g, source, EOL);
    source = enc.encode(source);
  }

  // We copy into a new Uint8Array because the underlying
  // BackingStores are going to be detached and owned by
  // the Blob.
  var {
    buffer,
    byteOffset,
    byteLength
  } = source;
  var slice = buffer.slice(byteOffset, byteOffset + byteLength);
  return [byteLength, new Uint8Array(slice)];
}
var sourcesConverter = createSequenceConverter(function (source) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  if (isBlob(source)) {
    return source;
  }
  if (isAnyArrayBuffer(source) || isArrayBufferView(source)) {
    return converters.BufferSource(source, opts);
  }
  return converters.DOMString(source, opts);
});
var Blob = /*#__PURE__*/function () {
  /**
   * @typedef {string|ArrayBuffer|ArrayBufferView|Blob} SourcePart
   */

  /**
   * @param {SourcePart[]} [sources]
   * @param {{
   *   endings? : string,
   *   type? : string,
   * }} [options]
   * @constructs Blob
   */
  function Blob() {
    var sources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 ? arguments[1] : undefined;
    _classCallCheck(this, Blob);
    markTransferMode(this, true, false);
    var sources_ = sourcesConverter(sources, {
      __proto__: null,
      context: 'sources'
    });
    validateDictionary(options, 'options');
    var {
      endings = 'transparent',
      type = ''
    } = options ?? kEmptyObject;
    endings = `${endings}`;
    if (endings !== 'transparent' && endings !== 'native') throw new ERR_INVALID_ARG_VALUE('options.endings', endings);
    var length = 0;
    for (var i = 0; i < sources_.length; ++i) {
      var {
        0: len,
        1: src
      } = getSource(sources_[i], endings);
      length += len;
      sources_[i] = src;
    }
    if (length > kMaxLength) throw new ERR_BUFFER_TOO_LARGE(kMaxLength);
    this[kHandle] = _createBlob(sources_, length);
    this[kLength] = length;
    type = `${type}`;
    this[kType] = RegExpPrototypeExec(disallowedTypeCharacters, type) !== null ? '' : StringPrototypeToLowerCase(type);
  }
  return _createClass(Blob, [{
    key: kInspect,
    value: function (depth, options) {
      if (depth < 0) return this;
      var opts = _objectSpread(_objectSpread({}, options), {}, {
        depth: options.depth == null ? null : options.depth - 1
      });
      return `Blob ${inspect({
        size: this.size,
        type: this.type
      }, opts)}`;
    }
  }, {
    key: kClone,
    value: function () {
      if (this[kNotCloneable]) {
        // We do not currently allow file-backed Blobs to be cloned or passed across
        // worker threads.
        throw new ERR_INVALID_STATE.TypeError('File-backed Blobs are not cloneable');
      }
      var handle = this[kHandle];
      var type = this[kType];
      var length = this[kLength];
      return {
        data: {
          handle,
          type,
          length
        },
        deserializeInfo: 'internal/blob:Blob'
      };
    }
  }, {
    key: kDeserialize,
    value: function (_ref) {
      var {
        handle,
        type,
        length
      } = _ref;
      this[kHandle] = handle;
      this[kType] = type;
      this[kLength] = length;
    }

    /**
     * @readonly
     * @type {string}
     */
  }, {
    key: "type",
    get: function () {
      if (!isBlob(this)) throw new ERR_INVALID_THIS('Blob');
      return this[kType];
    }

    /**
     * @readonly
     * @type {number}
     */
  }, {
    key: "size",
    get: function () {
      if (!isBlob(this)) throw new ERR_INVALID_THIS('Blob');
      return this[kLength];
    }

    /**
     * @param {number} [start]
     * @param {number} [end]
     * @param {string} [contentType]
     * @returns {Blob}
     */
  }, {
    key: "slice",
    value: function slice() {
      var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[kLength];
      var contentType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      if (!isBlob(this)) throw new ERR_INVALID_THIS('Blob');
      start = converters['long long'](start, {
        __proto__: null,
        context: 'start'
      });
      end = converters['long long'](end, {
        __proto__: null,
        context: 'end'
      });
      if (start < 0) {
        start = MathMax(this[kLength] + start, 0);
      } else {
        start = MathMin(start, this[kLength]);
      }
      if (end < 0) {
        end = MathMax(this[kLength] + end, 0);
      } else {
        end = MathMin(end, this[kLength]);
      }
      contentType = `${contentType}`;
      if (RegExpPrototypeExec(disallowedTypeCharacters, contentType) !== null) {
        contentType = '';
      } else {
        contentType = StringPrototypeToLowerCase(contentType);
      }
      var span = MathMax(end - start, 0);
      return createBlob(this[kHandle].slice(start, start + span), span, contentType);
    }

    /**
     * @returns {Promise<ArrayBuffer>}
     */
  }, {
    key: "arrayBuffer",
    value: function arrayBuffer() {
      if (!isBlob(this)) return PromiseReject(new ERR_INVALID_THIS('Blob'));
      return _arrayBuffer(this);
    }

    /**
     * @returns {Promise<string>}
     */
  }, {
    key: "text",
    value: function text() {
      if (!isBlob(this)) return PromiseReject(new ERR_INVALID_THIS('Blob'));
      dec ??= new TextDecoder();
      return PromisePrototypeThen(_arrayBuffer(this), buffer => dec.decode(buffer));
    }

    /**
     * @returns {Promise<Uint8Array>}
     */
  }, {
    key: "bytes",
    value: function bytes() {
      if (!isBlob(this)) return PromiseReject(new ERR_INVALID_THIS('Blob'));
      return PromisePrototypeThen(_arrayBuffer(this), buffer => new Uint8Array(buffer));
    }

    /**
     * @returns {ReadableStream}
     */
  }, {
    key: "stream",
    value: function stream() {
      if (!isBlob(this)) throw new ERR_INVALID_THIS('Blob');
      return createBlobReaderStream(this[kHandle].getReader());
    }
  }]);
}();
function TransferableBlob(handle, length) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  ObjectSetPrototypeOf(this, Blob.prototype);
  markTransferMode(this, true, false);
  this[kHandle] = handle;
  this[kType] = type;
  this[kLength] = length;
}
ObjectSetPrototypeOf(TransferableBlob.prototype, Blob.prototype);
ObjectSetPrototypeOf(TransferableBlob, Blob);
function createBlob(handle, length) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var transferredBlob = new TransferableBlob(handle, length, type);

  // Fix issues like: https://github.com/nodejs/node/pull/49730#discussion_r1331720053
  transferredBlob.constructor = Blob;
  return transferredBlob;
}
ObjectDefineProperty(Blob.prototype, SymbolToStringTag, {
  __proto__: null,
  configurable: true,
  value: 'Blob'
});
ObjectDefineProperties(Blob.prototype, {
  size: kEnumerableProperty,
  type: kEnumerableProperty,
  slice: kEnumerableProperty,
  stream: kEnumerableProperty,
  text: kEnumerableProperty,
  arrayBuffer: kEnumerableProperty,
  bytes: kEnumerableProperty
});
function resolveObjectURL(url) {
  url = `${url}`;
  try {
    var parsed = new URL(url);
    var split = StringPrototypeSplit(parsed.pathname, ':', 3);
    if (split.length !== 2) return;
    var {
      0: base,
      1: id
    } = split;
    if (base !== 'nodedata') return;
    var ret = getDataObject(id);
    if (ret === undefined) return;
    var {
      0: handle,
      1: length,
      2: type
    } = ret;
    if (handle !== undefined) return createBlob(handle, length, type);
  } catch {
    // If there's an error, it's ignored and nothing is returned
  }
}

// TODO(@jasnell): Now that the File class exists, we might consider having
// this return a `File` instead of a `Blob`.
function createBlobFromFilePath(path, options) {
  var maybeBlob = _createBlobFromFilePath(path);
  if (maybeBlob === undefined) {
    return lazyDOMException('The blob could not be read', 'NotReadableError');
  }
  var {
    0: blob,
    1: length
  } = maybeBlob;
  var res = createBlob(blob, length, options?.type);
  res[kNotCloneable] = true;
  return res;
}
function _arrayBuffer(blob) {
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  var reader = blob[kHandle].getReader();
  var buffers = [];
  var readNext = () => {
    reader.pull((status, buffer) => {
      if (status === 0) {
        // EOS, concat & resolve
        // buffer should be undefined here
        resolve(concat(buffers));
        return;
      } else if (status < 0) {
        // The read could fail for many different reasons when reading
        // from a non-memory resident blob part (e.g. file-backed blob).
        // The error details the system error code.
        var error = lazyDOMException('The blob could not be read', 'NotReadableError');
        reject(error);
        return;
      }
      if (buffer !== undefined) buffers.push(buffer);
      queueMicrotask(() => readNext());
    });
  };
  readNext();
  return promise;
}
function createBlobReaderStream(reader) {
  return new lazyReadableStream({
    type: 'bytes',
    start(c) {
      // There really should only be one read at a time so using an
      // array here is purely defensive.
      this.pendingPulls = [];
      // Register a wakeup callback that the C++ side can invoke
      // when new data is available after a STATUS_BLOCK.
      reader.setWakeup(() => {
        if (this.pendingPulls.length > 0) {
          this.readNext(c);
        }
      });
    },
    pull(c) {
      var {
        promise,
        resolve,
        reject
      } = PromiseWithResolvers();
      this.pendingPulls.push({
        resolve,
        reject
      });
      this.readNext(c);
      return promise;
    },
    readNext(c) {
      reader.pull((status, buffer) => {
        // If pendingPulls is empty here, the stream had to have
        // been canceled, and we don't really care about the result.
        // We can simply exit.
        if (this.pendingPulls.length === 0) {
          return;
        }
        if (status === 0) {
          // EOS
          c.close();
          // This is to signal the end for byob readers
          // see https://streams.spec.whatwg.org/#example-rbs-pull
          c.byobRequest?.respond(0);
          var pending = this.pendingPulls.shift();
          pending.resolve();
          return;
        } else if (status < 0) {
          // The read could fail for many different reasons when reading
          // from a non-memory resident blob part (e.g. file-backed blob).
          // The error details the system error code.
          var error = lazyDOMException('The blob could not be read', 'NotReadableError');
          var _pending = this.pendingPulls.shift();
          c.error(error);
          _pending.reject(error);
          return;
        } else if (status === 2) {
          // STATUS_BLOCK: No data available yet. The wakeup callback
          // registered in start() will re-invoke readNext when data
          // arrives.
          return;
        }
        // ReadableByteStreamController.enqueue errors if we submit a
        // 0-length buffer. We need to check for that here.
        if (buffer !== undefined && buffer.byteLength !== 0) {
          c.enqueue(new Uint8Array(buffer));
        }
        // We keep reading until we either reach EOS, some error, or
        // we hit the flow rate of the stream (c.desiredSize).
        // We use setImmediate here because we have to allow the event
        // loop to turn in order to process any pending i/o. Using
        // queueMicrotask won't allow the event loop to turn.
        setImmediate(() => {
          if (c.desiredSize < 0) {
            // A manual backpressure check.
            if (this.pendingPulls.length !== 0) {
              var _pending2 = this.pendingPulls.shift();
              _pending2.resolve();
            }
            return;
          }
          this.readNext(c);
        });
      });
    },
    cancel(reason) {
      // Reject any currently pending pulls here.
      for (var pending of this.pendingPulls) {
        pending.reject(reason);
      }
      this.pendingPulls = [];
    }
    // We set the highWaterMark to 0 because we do not want the stream to
    // start reading immediately on creation. We want it to wait until read
    // is called.
  }, {
    highWaterMark: 0
  });
}

// Maximum number of chunks to collect in a single batch to prevent
// unbounded memory growth when the DataQueue has a large burst of data.
var kMaxBatchChunks = 16;
module.exports = {
  Blob,
  createBlob,
  createBlobFromFilePath,
  createBlobReaderIterable,
  createBlobReaderStream,
  isBlob,
  kHandle,
  resolveObjectURL,
  TransferableBlob
};

