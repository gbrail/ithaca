'use strict';

var {
  isMainThread
} = require('worker_threads');
var {
  ERR_WORKER_UNSUPPORTED_OPERATION
} = require('internal/errors').codes;
var sigintWatchdog;
function getSigintWatchdog() {
  if (!sigintWatchdog) {
    var {
      SigintWatchdog
    } = require('internal/watchdog');
    sigintWatchdog = new SigintWatchdog();
  }
  return sigintWatchdog;
}
function setTraceSigInt(enable) {
  if (!isMainThread) throw new ERR_WORKER_UNSUPPORTED_OPERATION('Calling util.setTraceSigInt');
  if (enable) {
    getSigintWatchdog().start();
  } else {
    getSigintWatchdog().stop();
  }
}
;
module.exports = {
  setTraceSigInt
};

