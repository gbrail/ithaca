'use strict';

var {
  isInternalThread,
  isMainThread,
  SHARE_ENV,
  resourceLimits,
  setEnvironmentData,
  getEnvironmentData,
  threadId,
  threadName,
  Worker
} = require('internal/worker');
var {
  MessagePort,
  MessageChannel,
  markAsUncloneable,
  moveMessagePortToContext,
  receiveMessageOnPort,
  BroadcastChannel
} = require('internal/worker/io');
var {
  postMessageToThread
} = require('internal/worker/messaging');
var {
  markAsUntransferable,
  isMarkedAsUntransferable
} = require('internal/buffer');
var {
  locks
} = require('internal/locks');
module.exports = {
  isInternalThread,
  isMainThread,
  MessagePort,
  MessageChannel,
  markAsUncloneable,
  markAsUntransferable,
  isMarkedAsUntransferable,
  moveMessagePortToContext,
  receiveMessageOnPort,
  resourceLimits,
  postMessageToThread,
  threadId,
  threadName,
  SHARE_ENV,
  Worker,
  parentPort: null,
  workerData: null,
  BroadcastChannel,
  setEnvironmentData,
  getEnvironmentData,
  locks
};

