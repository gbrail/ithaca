'use strict';

var {
  SafeMap
} = primordials;
var assert = require('internal/assert');
var dgram = require('internal/dgram');
var net = require('net');
module.exports = SharedHandle;
function SharedHandle(key, address, _ref) {
  var {
    port,
    addressType,
    fd,
    flags
  } = _ref;
  this.key = key;
  this.workers = new SafeMap();
  this.handle = null;
  this.errno = 0;
  var rval;
  if (addressType === 'udp4' || addressType === 'udp6') rval = dgram._createSocketHandle(address, port, addressType, fd, flags);else rval = net._createServerHandle(address, port, addressType, fd, flags);
  if (typeof rval === 'number') this.errno = rval;else this.handle = rval;
}
SharedHandle.prototype.add = function (worker, send) {
  assert(!this.workers.has(worker.id));
  this.workers.set(worker.id, worker);
  send(this.errno, null, this.handle);
};
SharedHandle.prototype.remove = function (worker) {
  if (!this.workers.has(worker.id)) return false;
  this.workers.delete(worker.id);
  if (this.workers.size !== 0) return false;
  this.handle.close();
  this.handle = null;
  return true;
};
SharedHandle.prototype.has = function (worker) {
  return this.workers.has(worker.id);
};

