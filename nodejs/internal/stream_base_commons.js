'use strict';

var {
  Array,
  Symbol
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  FastBuffer
} = require('internal/buffer');
var {
  WriteWrap,
  kReadBytesOrError,
  kArrayBufferOffset,
  kBytesWritten,
  kLastWriteWasAsync,
  streamBaseState
} = internalBinding('stream_wrap');
var {
  UV_EOF
} = internalBinding('uv');
var {
  ErrnoException
} = require('internal/errors');
var {
  owner_symbol
} = require('internal/async_hooks').symbols;
var {
  kTimeout,
  setUnrefTimeout,
  getTimerDuration
} = require('internal/timers');
var {
  isUint8Array
} = require('internal/util/types');
var {
  clearTimeout
} = require('timers');
var {
  validateFunction
} = require('internal/validators');
var kMaybeDestroy = Symbol('kMaybeDestroy');
var kUpdateTimer = Symbol('kUpdateTimer');
var kAfterAsyncWrite = Symbol('kAfterAsyncWrite');
var kHandle = Symbol('kHandle');
var kBoundSession = Symbol('kBoundSession');
var kSession = Symbol('kSession');
var debug = require('internal/util/debuglog').debuglog('stream', fn => {
  debug = fn;
});
var kBuffer = Symbol('kBuffer');
var kBufferGen = Symbol('kBufferGen');
var kBufferCb = Symbol('kBufferCb');
function handleWriteReq(req, data, encoding) {
  var {
    handle
  } = req;
  switch (encoding) {
    case 'buffer':
      {
        var ret = handle.writeBuffer(req, data);
        if (streamBaseState[kLastWriteWasAsync]) req.buffer = data;
        return ret;
      }
    case 'latin1':
    case 'binary':
      return handle.writeLatin1String(req, data);
    case 'utf8':
    case 'utf-8':
      return handle.writeUtf8String(req, data);
    case 'ascii':
      return handle.writeAsciiString(req, data);
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return handle.writeUcs2String(req, data);
    default:
      {
        var buffer = Buffer.from(data, encoding);
        var _ret = handle.writeBuffer(req, buffer);
        if (streamBaseState[kLastWriteWasAsync]) req.buffer = buffer;
        return _ret;
      }
  }
}
function onWriteComplete(status) {
  debug('onWriteComplete', status, this.error);
  var stream = this.handle[owner_symbol];
  if (status < 0) {
    var error = new ErrnoException(status, 'write', this.error);
    if (typeof this.callback === 'function') {
      return this.callback(error);
    }
    return stream.destroy(error);
  }
  if (stream.destroyed) {
    if (typeof this.callback === 'function') this.callback(null);
    return;
  }
  stream[kUpdateTimer]();
  stream[kAfterAsyncWrite](this);
  if (typeof this.callback === 'function') this.callback(null);
}
function createWriteWrap(handle, callback) {
  var req = new WriteWrap();
  req.handle = handle;
  req.oncomplete = onWriteComplete;
  req.async = false;
  req.bytes = 0;
  req.buffer = null;
  req.callback = callback;
  return req;
}
function writevGeneric(self, data, cb) {
  var req = createWriteWrap(self[kHandle], cb);
  var allBuffers = data.allBuffers;
  var chunks;
  if (allBuffers) {
    chunks = data;
    for (var i = 0; i < data.length; i++) data[i] = data[i].chunk;
  } else {
    chunks = new Array(data.length << 1);
    for (var _i = 0; _i < data.length; _i++) {
      var entry = data[_i];
      chunks[_i * 2] = entry.chunk;
      chunks[_i * 2 + 1] = entry.encoding;
    }
  }
  var err = req.handle.writev(req, chunks, allBuffers);

  // Retain chunks
  if (err === 0) req._chunks = chunks;
  afterWriteDispatched(req, err, cb);
  return req;
}
function writeGeneric(self, data, encoding, cb) {
  var req = createWriteWrap(self[kHandle], cb);
  var err = handleWriteReq(req, data, encoding);
  afterWriteDispatched(req, err, cb);
  return req;
}
function afterWriteDispatched(req, err, cb) {
  req.bytes = streamBaseState[kBytesWritten];
  req.async = !!streamBaseState[kLastWriteWasAsync];
  if (err !== 0) return cb(new ErrnoException(err, 'write', req.error));
  if (!req.async && typeof req.callback === 'function') {
    req.callback();
  }
}
function onStreamRead(arrayBuffer) {
  var nread = streamBaseState[kReadBytesOrError];
  var handle = this;
  var stream = this[owner_symbol];
  stream[kUpdateTimer]();
  if (nread > 0 && !stream.destroyed) {
    var ret;
    var result;
    var userBuf = stream[kBuffer];
    if (userBuf) {
      result = stream[kBufferCb](nread, userBuf) !== false;
      var bufGen = stream[kBufferGen];
      if (bufGen !== null) {
        var nextBuf = bufGen();
        if (isUint8Array(nextBuf)) stream[kBuffer] = ret = nextBuf;
      }
    } else {
      var offset = streamBaseState[kArrayBufferOffset];
      var buf = new FastBuffer(arrayBuffer, offset, nread);
      result = stream.push(buf);
    }
    if (!result) {
      handle.reading = false;
      if (!stream.destroyed) {
        var err = handle.readStop();
        if (err) stream.destroy(new ErrnoException(err, 'read'));
      }
    }
    return ret;
  }
  if (nread === 0) {
    return;
  }

  // After seeing EOF, most streams will be closed permanently,
  // and will not deliver any more read events after this point.
  // (equivalently, it should have called readStop on itself already).
  // Some streams may be reset and explicitly started again with a call
  // to readStart, such as TTY.

  if (nread !== UV_EOF) {
    // CallJSOnreadMethod expects the return value to be a buffer.
    // Ref: https://github.com/nodejs/node/pull/34375
    stream.destroy(new ErrnoException(nread, 'read'));
    return;
  }

  // Defer this until we actually emit end
  if (stream._readableState.endEmitted) {
    if (stream[kMaybeDestroy]) stream[kMaybeDestroy]();
  } else {
    if (stream[kMaybeDestroy]) stream.on('end', stream[kMaybeDestroy]);

    // Push a null to signal the end of data.
    // Do it before `maybeDestroy` for correct order of events:
    // `end` -> `close`
    stream.push(null);
    stream.read(0);
  }
}
function setStreamTimeout(msecs, callback) {
  if (this.destroyed) return this;
  this.timeout = msecs;

  // Type checking identical to timers.enroll()
  msecs = getTimerDuration(msecs, 'msecs');

  // Attempt to clear an existing timer in both cases -
  //  even if it will be rescheduled we don't want to leak an existing timer.
  clearTimeout(this[kTimeout]);
  if (msecs === 0) {
    if (callback !== undefined) {
      validateFunction(callback, 'callback');
      this.removeListener('timeout', callback);
    }
  } else {
    this[kTimeout] = setUnrefTimeout(this._onTimeout.bind(this), msecs);
    if (this[kSession]) this[kSession][kUpdateTimer]();
    if (this[kBoundSession]) this[kBoundSession][kUpdateTimer]();
    if (callback !== undefined) {
      validateFunction(callback, 'callback');
      this.once('timeout', callback);
    }
  }
  return this;
}
module.exports = {
  writevGeneric,
  writeGeneric,
  onStreamRead,
  kAfterAsyncWrite,
  kMaybeDestroy,
  kUpdateTimer,
  kHandle,
  kSession,
  setStreamTimeout,
  kBuffer,
  kBufferCb,
  kBufferGen
};

