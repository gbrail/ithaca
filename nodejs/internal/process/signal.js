'use strict';

var {
  FunctionPrototypeBind,
  SafeMap
} = primordials;
var {
  ErrnoException
} = require('internal/errors');
var {
  signals
} = internalBinding('constants').os;
var Signal;
var signalWraps = new SafeMap();
function isSignal(event) {
  return typeof event === 'string' && signals[event] !== undefined;
}

// Detect presence of a listener for the special signal types
function startListeningIfSignal(type) {
  if (isSignal(type) && !signalWraps.has(type)) {
    if (Signal === undefined) Signal = internalBinding('signal_wrap').Signal;
    var wrap = new Signal();
    wrap.unref();
    wrap.onsignal = FunctionPrototypeBind(process.emit, process, type, type);
    var signum = signals[type];
    var err = wrap.start(signum);
    if (err) {
      wrap.close();
      throw new ErrnoException(err, 'uv_signal_start');
    }
    signalWraps.set(type, wrap);
  }
}
function stopListeningIfSignal(type) {
  var wrap = signalWraps.get(type);
  if (wrap !== undefined && process.listenerCount(type) === 0) {
    wrap.close();
    signalWraps.delete(type);
  }
}
module.exports = {
  startListeningIfSignal,
  stopListeningIfSignal
};

