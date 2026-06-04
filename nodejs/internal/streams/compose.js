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
var {
  ArrayPrototypeSlice
} = primordials;
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
var {
  pipeline
} = require('internal/streams/pipeline');
function _empty() {}
var Duplex = require('internal/streams/duplex');
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
var {
  destroyer
} = require('internal/streams/destroy');
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
var {
  isNodeStream,
  isReadable,
  isWritable,
  isWebStream,
  isTransformStream,
  isWritableStream,
  isReadableStream
} = require('internal/streams/utils');
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
  AbortError,
  codes: {
    ERR_INVALID_ARG_VALUE,
    ERR_MISSING_ARGS
  }
} = require('internal/errors');
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
  eos
} = require('internal/streams/end-of-stream');
module.exports = function compose() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  if (streams.length === 0) {
    throw new ERR_MISSING_ARGS('streams');
  }
  if (streams.length === 1) {
    return Duplex.from(streams[0]);
  }
  var orgStreams = ArrayPrototypeSlice(streams);
  if (typeof streams[0] === 'function') {
    streams[0] = Duplex.from(streams[0]);
  }
  if (typeof streams[streams.length - 1] === 'function') {
    var idx = streams.length - 1;
    streams[idx] = Duplex.from(streams[idx]);
  }
  for (var n = 0; n < streams.length; ++n) {
    if (!isNodeStream(streams[n]) && !isWebStream(streams[n])) {
      // TODO(ronag): Add checks for non streams.
      continue;
    }
    if (n < streams.length - 1 && !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n]))) {
      throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be readable');
    }
    if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n]))) {
      throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be writable');
    }
  }
  var ondrain;
  var onfinish;
  var onclose;
  var d;
  function onfinished(err) {
    var cb = onclose;
    onclose = null;
    if (cb) {
      cb(err);
    } else if (err) {
      d.destroy(err);
    } else if (!readable && !writable) {
      d.destroy();
    }
  }
  var head = streams[0];
  var tail = pipeline(streams, onfinished);
  var writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
  var readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));

  // TODO(ronag): Avoid double buffering.
  // Implement Writable/Readable/Duplex traits.
  // See, https://github.com/nodejs/node/pull/33515.
  d = new Duplex({
    // TODO (ronag): highWaterMark?
    writableObjectMode: !!head?.writableObjectMode,
    readableObjectMode: !!tail?.readableObjectMode,
    writable,
    readable
  });
  if (writable) {
    if (isNodeStream(head)) {
      d._write = function (chunk, encoding, callback) {
        if (head.write(chunk, encoding)) {
          callback();
        } else {
          ondrain = callback;
        }
      };
      d._final = function (callback) {
        head.end();
        onfinish = callback;
      };
      head.on('drain', function () {
        if (ondrain) {
          var cb = ondrain;
          ondrain = null;
          cb();
        }
      });
    } else if (isWebStream(head)) {
      var _writable = isTransformStream(head) ? head.writable : head;
      var writer = _writable.getWriter();
      d._write = _async(function (chunk, encoding, callback) {
        return _continueIgnored(_catch(function () {
          return _await(writer.ready, function () {
            writer.write(chunk).catch(() => {});
            callback();
          });
        }, function (err) {
          callback(err);
        }));
      });
      d._final = _async(function (callback) {
        return _continueIgnored(_catch(function () {
          return _await(writer.ready, function () {
            writer.close().catch(() => {});
            onfinish = callback;
          });
        }, function (err) {
          callback(err);
        }));
      });
    }
    var toRead = isTransformStream(tail) ? tail.readable : tail;
    eos(toRead, () => {
      if (onfinish) {
        var cb = onfinish;
        onfinish = null;
        cb();
      }
    });
  }
  if (readable) {
    if (isNodeStream(tail)) {
      d._read = function () {
        tail.resume();
      };
      tail.on('data', function (chunk) {
        if (!d.push(chunk)) {
          tail.pause();
        }
      });
      tail.on('end', function () {
        d.push(null);
      });
    } else if (isWebStream(tail)) {
      var _readable = isTransformStream(tail) ? tail.readable : tail;
      var reader = _readable.getReader();
      d._read = _async(function () {
        var _exit = false;
        return _for(function () {
          return !_exit;
        }, void 0, function () {
          return _catch(function () {
            return _await(reader.read(), function (_ref) {
              var {
                value,
                done
              } = _ref;
              if (!d.push(value)) {
                _exit = true;
                return;
              }
              if (done) {
                d.push(null);
                _exit = true;
              }
            });
          }, function () {
            _exit = true;
          });
        });
      });
    }
  }
  d._destroy = function (err, callback) {
    if (!err && onclose !== null) {
      err = new AbortError();
    }
    ondrain = null;
    onfinish = null;
    if (isNodeStream(tail)) {
      destroyer(tail, err);
    }
    if (onclose === null) {
      callback(err);
    } else {
      onclose = callback;
    }
  };
  return d;
};

