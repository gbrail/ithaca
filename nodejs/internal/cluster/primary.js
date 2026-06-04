'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  ObjectKeys,
  ObjectValues,
  SafeMap,
  StringPrototypeStartsWith
} = primordials;
var {
  codes: {
    ERR_SOCKET_BAD_PORT
  }
} = require('internal/errors');
var assert = require('internal/assert');
var {
  fork
} = require('child_process');
var path = require('path');
var EventEmitter = require('events');
var RoundRobinHandle = require('internal/cluster/round_robin_handle');
var SharedHandle = require('internal/cluster/shared_handle');
var Worker = require('internal/cluster/worker');
var {
  getInspectPort,
  isUsingInspector
} = require('internal/util/inspector');
var {
  internal,
  sendHelper
} = require('internal/cluster/utils');
var cluster = new EventEmitter();
var intercom = new EventEmitter();
var SCHED_NONE = 1;
var SCHED_RR = 2;
module.exports = cluster;
var handles = new SafeMap();
cluster.isWorker = false;
cluster.isMaster = true; // Deprecated alias. Must be same as isPrimary.
cluster.isPrimary = true;
cluster.Worker = Worker;
cluster.workers = {};
cluster.settings = {};
cluster.SCHED_NONE = SCHED_NONE; // Leave it to the operating system.
cluster.SCHED_RR = SCHED_RR; // Primary distributes connections.

var ids = 0;
var initialized = false;

// XXX(bnoordhuis) Fold cluster.schedulingPolicy into cluster.settings?
var schedulingPolicy = process.env.NODE_CLUSTER_SCHED_POLICY;
if (schedulingPolicy === 'rr') schedulingPolicy = SCHED_RR;else if (schedulingPolicy === 'none') schedulingPolicy = SCHED_NONE;else if (process.platform === 'win32') {
  // Round-robin doesn't perform well on
  // Windows due to the way IOCP is wired up.
  schedulingPolicy = SCHED_NONE;
} else schedulingPolicy = SCHED_RR;
cluster.schedulingPolicy = schedulingPolicy;
cluster.setupPrimary = function (options) {
  var settings = _objectSpread(_objectSpread({
    args: ArrayPrototypeSlice(process.argv, 2),
    exec: process.argv[1],
    execArgv: process.execArgv,
    silent: false
  }, cluster.settings), options);

  // Tell V8 to write profile data for each process to a separate file.
  // Without --logfile=v8-%p.log, everything ends up in a single, unusable
  // file. (Unusable because what V8 logs are memory addresses and each
  // process has its own memory mappings.)
  if (ArrayPrototypeSome(settings.execArgv, s => StringPrototypeStartsWith(s, '--prof')) && !ArrayPrototypeSome(settings.execArgv, s => StringPrototypeStartsWith(s, '--logfile='))) {
    settings.execArgv = [].concat(_toConsumableArray(settings.execArgv), ['--logfile=v8-%p.log']);
  }
  cluster.settings = settings;
  if (initialized === true) return process.nextTick(setupSettingsNT, settings);
  initialized = true;
  schedulingPolicy = cluster.schedulingPolicy; // Freeze policy.
  assert(schedulingPolicy === SCHED_NONE || schedulingPolicy === SCHED_RR, `Bad cluster.schedulingPolicy: ${schedulingPolicy}`);
  process.nextTick(setupSettingsNT, settings);
  process.on('internalMessage', message => {
    if (message.cmd !== 'NODE_DEBUG_ENABLED') return;
    for (var worker of ObjectValues(cluster.workers)) {
      if (worker.state === 'online' || worker.state === 'listening') {
        process._debugProcess(worker.process.pid);
      } else {
        worker.once('online', function () {
          process._debugProcess(this.process.pid);
        });
      }
    }
  });
};

// Deprecated alias must be same as setupPrimary
cluster.setupMaster = cluster.setupPrimary;
function setupSettingsNT(settings) {
  cluster.emit('setup', settings);
}
function createWorkerProcess(id, env) {
  var workerEnv = _objectSpread(_objectSpread(_objectSpread({}, process.env), env), {}, {
    NODE_UNIQUE_ID: `${id}`
  });
  var execArgv = _toConsumableArray(cluster.settings.execArgv);
  if (cluster.settings.inspectPort === null) {
    throw new ERR_SOCKET_BAD_PORT('Port', null, true);
  }
  if (isUsingInspector(cluster.settings.execArgv)) {
    ArrayPrototypePush(execArgv, `--inspect-port=${getInspectPort(cluster.settings.inspectPort)}`);
  }
  return fork(cluster.settings.exec, cluster.settings.args, {
    cwd: cluster.settings.cwd,
    env: workerEnv,
    serialization: cluster.settings.serialization,
    silent: cluster.settings.silent,
    windowsHide: cluster.settings.windowsHide,
    execArgv: execArgv,
    stdio: cluster.settings.stdio,
    gid: cluster.settings.gid,
    uid: cluster.settings.uid
  });
}
function removeWorker(worker) {
  assert(worker);
  delete cluster.workers[worker.id];
  if (ObjectKeys(cluster.workers).length === 0) {
    assert(handles.size === 0, 'Resource leak detected.');
    intercom.emit('disconnect');
  }
}
function removeHandlesForWorker(worker) {
  assert(worker);
  for (var {
    0: key,
    1: handle
  } of handles) {
    if (handle.remove(worker)) handles.delete(key);
  }
}
cluster.fork = function (env) {
  cluster.setupPrimary();
  var id = ++ids;
  var workerProcess = createWorkerProcess(id, env);
  var worker = new Worker({
    id: id,
    process: workerProcess
  });
  worker.on('message', function (message, handle) {
    cluster.emit('message', this, message, handle);
  });
  worker.process.once('exit', (exitCode, signalCode) => {
    /*
     * Remove the worker from the workers list only
     * if it has disconnected, otherwise we might
     * still want to access it.
     */
    if (!worker.isConnected()) {
      removeHandlesForWorker(worker);
      removeWorker(worker);
    }
    worker.exitedAfterDisconnect = !!worker.exitedAfterDisconnect;
    worker.state = 'dead';
    worker.emit('exit', exitCode, signalCode);
    cluster.emit('exit', worker, exitCode, signalCode);
  });
  worker.process.once('disconnect', () => {
    /*
     * Now is a good time to remove the handles
     * associated with this worker because it is
     * not connected to the primary anymore.
     */
    removeHandlesForWorker(worker);

    /*
     * Remove the worker from the workers list only
     * if its process has exited. Otherwise, we might
     * still want to access it.
     */
    if (worker.isDead()) removeWorker(worker);
    worker.exitedAfterDisconnect = !!worker.exitedAfterDisconnect;
    worker.state = 'disconnected';
    worker.emit('disconnect');
    cluster.emit('disconnect', worker);
  });
  worker.process.on('internalMessage', internal(worker, onmessage));
  process.nextTick(emitForkNT, worker);
  cluster.workers[worker.id] = worker;
  return worker;
};
function emitForkNT(worker) {
  cluster.emit('fork', worker);
}
cluster.disconnect = function (cb) {
  var workers = ObjectValues(cluster.workers);
  if (workers.length === 0) {
    process.nextTick(() => intercom.emit('disconnect'));
  } else {
    for (var worker of workers) {
      if (worker.isConnected()) {
        worker.disconnect();
      }
    }
  }
  if (typeof cb === 'function') intercom.once('disconnect', cb);
};
var methodMessageMapping = {
  close,
  exitedAfterDisconnect,
  listening,
  online,
  queryServer
};
function onmessage(message, handle) {
  var worker = this;
  var fn = methodMessageMapping[message.act];
  if (typeof fn === 'function') fn(worker, message);
}
function online(worker) {
  worker.state = 'online';
  worker.emit('online');
  cluster.emit('online', worker);
}
function exitedAfterDisconnect(worker, message) {
  worker.exitedAfterDisconnect = true;
  send(worker, {
    ack: message.seq
  });
}
function queryServer(worker, message) {
  // Stop processing if worker already disconnecting
  if (worker.exitedAfterDisconnect) return;
  var key = `${message.address}:${message.port}:${message.addressType}:` + `${message.fd}` + (message.port === 0 ? `:${message.index}` : '');
  var cachedHandle = handles.get(key);
  var handle;
  if (cachedHandle && !cachedHandle.has(worker)) {
    handle = cachedHandle;
  }
  if (handle === undefined) {
    var address = message.address;

    // Find shortest path for unix sockets because of the ~100 byte limit
    if (message.port < 0 && typeof address === 'string' && process.platform !== 'win32') {
      address = path.relative(process.cwd(), address);
      if (message.address.length < address.length) address = message.address;
    }

    // UDP is exempt from round-robin connection balancing for what should
    // be obvious reasons: it's connectionless. There is nothing to send to
    // the workers except raw datagrams and that's pointless.
    if (schedulingPolicy !== SCHED_RR || message.addressType === 'udp4' || message.addressType === 'udp6') {
      handle = new SharedHandle(key, address, message);
    } else {
      handle = new RoundRobinHandle(key, address, message);
    }
    if (!cachedHandle) {
      handles.set(key, handle);
    }
  }
  handle.data ||= message.data;

  // Set custom server data
  handle.add(worker, (errno, reply, serverHandle) => {
    if (!errno) {
      handles.set(key, handle); // Update in case it was replaced.
    }
    var {
      data
    } = handles.get(key);
    if (!cachedHandle && errno) {
      handles.delete(key);
    }
    send(worker, _objectSpread({
      errno,
      key,
      ack: message.seq,
      data
    }, reply), serverHandle);
  });
}
function listening(worker, message) {
  var info = {
    addressType: message.addressType,
    address: message.address,
    port: message.port,
    fd: message.fd
  };
  worker.state = 'listening';
  worker.emit('listening', info);
  cluster.emit('listening', worker, info);
}

// Server in worker is closing, remove from list. The handle may have been
// removed by a prior call to removeHandlesForWorker() so guard against that.
function close(worker, message) {
  var key = message.key;
  var handle = handles.get(key);
  if (handle && handle.remove(worker)) handles.delete(key);
}
function send(worker, message, handle, cb) {
  return sendHelper(worker.process, message, handle, cb);
}

// Extend generic Worker with methods specific to the primary process.
Worker.prototype.disconnect = function () {
  this.exitedAfterDisconnect = true;
  send(this, {
    act: 'disconnect'
  });
  removeHandlesForWorker(this);
  removeWorker(this);
  return this;
};
Worker.prototype.destroy = function (signo) {
  var signal = signo || 'SIGTERM';
  this.process.kill(signal);
};

