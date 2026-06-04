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
  ObjectDefineProperty,
  ObjectKeys,
  ReflectApply
} = primordials;
var {
  promisify: {
    custom: customPromisify
  }
} = require('internal/util');
var {
  streamReturningOperators,
  promiseReturningOperators
} = require('internal/streams/operators');
var {
  codes: {
    ERR_ILLEGAL_CONSTRUCTOR
  }
} = require('internal/errors');
var compose = require('internal/streams/compose');
var {
  setDefaultHighWaterMark,
  getDefaultHighWaterMark
} = require('internal/streams/state');
var {
  pipeline
} = require('internal/streams/pipeline');
var {
  destroyer
} = require('internal/streams/destroy');
var {
  eos
} = require('internal/streams/end-of-stream');
var internalBuffer = require('internal/buffer');
var promises = require('stream/promises');
var utils = require('internal/streams/utils');
var {
  isArrayBufferView,
  isUint8Array
} = require('internal/util/types');
var Stream = module.exports = require('internal/streams/legacy').Stream;
Stream.isDestroyed = utils.isDestroyed;
Stream.isDisturbed = utils.isDisturbed;
Stream.isErrored = utils.isErrored;
Stream.isReadable = utils.isReadable;
Stream.isWritable = utils.isWritable;
Stream.Readable = require('internal/streams/readable');
var streamKeys = ObjectKeys(streamReturningOperators);
var _loop = function () {
  var key = streamKeys[i];
  var op = streamReturningOperators[key];
  function fn() {
    if (new.target) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return Stream.Readable.from(ReflectApply(op, this, args));
  }
  ObjectDefineProperty(fn, 'name', {
    __proto__: null,
    value: op.name
  });
  ObjectDefineProperty(fn, 'length', {
    __proto__: null,
    value: op.length
  });
  ObjectDefineProperty(Stream.Readable.prototype, key, {
    __proto__: null,
    value: fn,
    enumerable: false,
    configurable: true,
    writable: true
  });
};
for (var i = 0; i < streamKeys.length; i++) {
  _loop();
}
var promiseKeys = ObjectKeys(promiseReturningOperators);
var _loop2 = function () {
  var key = promiseKeys[_i];
  var op = promiseReturningOperators[key];
  function fn() {
    if (new.target) {
      throw new ERR_ILLEGAL_CONSTRUCTOR();
    }
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return ReflectApply(op, this, args);
  }
  ObjectDefineProperty(fn, 'name', {
    __proto__: null,
    value: op.name
  });
  ObjectDefineProperty(fn, 'length', {
    __proto__: null,
    value: op.length
  });
  ObjectDefineProperty(Stream.Readable.prototype, key, {
    __proto__: null,
    value: fn,
    enumerable: false,
    configurable: true,
    writable: true
  });
};
for (var _i = 0; _i < promiseKeys.length; _i++) {
  _loop2();
}
Stream.Writable = require('internal/streams/writable');
Stream.Duplex = require('internal/streams/duplex');
Stream.Transform = require('internal/streams/transform');
Stream.PassThrough = require('internal/streams/passthrough');
Stream.duplexPair = require('internal/streams/duplexpair');
Stream.pipeline = pipeline;
var {
  addAbortSignal
} = require('internal/streams/add-abort-signal');
Stream.addAbortSignal = addAbortSignal;
Stream.finished = eos;
Stream.destroy = destroyer;
Stream.compose = compose;
Stream.setDefaultHighWaterMark = setDefaultHighWaterMark;
Stream.getDefaultHighWaterMark = getDefaultHighWaterMark;
ObjectDefineProperty(Stream, 'promises', {
  __proto__: null,
  configurable: true,
  enumerable: true,
  get() {
    return promises;
  }
});
ObjectDefineProperty(pipeline, customPromisify, {
  __proto__: null,
  enumerable: true,
  get() {
    return promises.pipeline;
  }
});
ObjectDefineProperty(eos, customPromisify, {
  __proto__: null,
  enumerable: true,
  get() {
    return promises.finished;
  }
});

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;
Stream._isArrayBufferView = isArrayBufferView;
Stream._isUint8Array = isUint8Array;
Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
  return new internalBuffer.FastBuffer(chunk.buffer, chunk.byteOffset, chunk.byteLength);
};

