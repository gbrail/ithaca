'use strict';

// New Streams API - Duplex Channel
//
// Creates a pair of connected channels where data written to one
// channel's writer appears in the other channel's readable.
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
  SymbolAsyncDispose,
  SymbolAsyncIterator
} = primordials;
function _empty() {}
var {
  push
} = require('internal/streams/iter/push');
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var {
  validateAbortSignal,
  validateObject
} = require('internal/validators');

/**
 * Create a pair of connected duplex channels for bidirectional communication.
 * @param {{ highWaterMark?: number, backpressure?: string, signal?: AbortSignal,
 *           a?: object, b?: object }} [options]
 * @returns {[DuplexChannel, DuplexChannel]}
 */

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
function duplex() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    __proto__: null
  };
  validateObject(options, 'options');
  var {
    highWaterMark,
    backpressure,
    signal,
    a,
    b
  } = options;
  if (a !== undefined) {
    validateObject(a, 'options.a');
  }
  if (b !== undefined) {
    validateObject(b, 'options.b');
  }
  if (signal !== undefined) {
    validateAbortSignal(signal, 'options.signal');
  }

  // Channel A writes to B's readable (A->B direction).
  // Signal is NOT passed to push() -- we handle abort via close() below.
  var {
    writer: aWriter,
    readable: bReadable
  } = push({
    highWaterMark: a?.highWaterMark ?? highWaterMark,
    backpressure: a?.backpressure ?? backpressure
  });

  // Channel B writes to A's readable (B->A direction)
  var {
    writer: bWriter,
    readable: aReadable
  } = push({
    highWaterMark: b?.highWaterMark ?? highWaterMark,
    backpressure: b?.backpressure ?? backpressure
  });
  var aClosed = false;
  var bClosed = false;
  // Track active iterators so close() can call .return() on them
  var aReadableIterator = null;
  var bReadableIterator = null;
  var channelA = {
    __proto__: null,
    get writer() {
      return aWriter;
    },
    // Wrap readable to track the iterator for cleanup on close()
    get readable() {
      return {
        __proto__: null,
        [SymbolAsyncIterator]() {
          var iter = aReadable[SymbolAsyncIterator]();
          aReadableIterator = iter;
          return iter;
        }
      };
    },
    close: _async(function () {
      if (aClosed) return;
      aClosed = true;
      // End the writer (signals end-of-stream to B's readable)
      aWriter.endSync();
      // Stop iteration of this channel's readable
      return _invokeIgnored(function () {
        if (aReadableIterator?.return) {
          return _await(aReadableIterator.return(), function () {
            aReadableIterator = null;
          });
        }
      });
    }),
    [SymbolAsyncDispose]() {
      return this.close();
    }
  };
  var channelB = {
    __proto__: null,
    get writer() {
      return bWriter;
    },
    get readable() {
      return {
        __proto__: null,
        [SymbolAsyncIterator]() {
          var iter = bReadable[SymbolAsyncIterator]();
          bReadableIterator = iter;
          return iter;
        }
      };
    },
    close: _async(function () {
      if (bClosed) return;
      bClosed = true;
      bWriter.endSync();
      return _invokeIgnored(function () {
        if (bReadableIterator?.return) {
          return _await(bReadableIterator.return(), function () {
            bReadableIterator = null;
          });
        }
      });
    }),
    [SymbolAsyncDispose]() {
      return this.close();
    }
  };

  // Signal handler: fail both writers with the abort reason so consumers
  // see the error. This is an error-path shutdown, not a clean close.
  if (signal) {
    var abortBoth = () => {
      var reason = signal.reason;
      aWriter.fail(reason);
      bWriter.fail(reason);
    };
    if (signal.aborted) {
      abortBoth();
    } else {
      signal.addEventListener('abort', abortBoth, {
        __proto__: null,
        once: true
      });
    }
  }
  return [channelA, channelB];
}
module.exports = {
  duplex
};

