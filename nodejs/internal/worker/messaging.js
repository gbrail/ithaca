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
var postMessageToThread = _async(function (threadId, value, transferList, timeout) {
  if (typeof transferList === 'number' && typeof timeout === 'undefined') {
    timeout = transferList;
    transferList = [];
  }
  if (typeof timeout !== 'undefined') {
    validateNumber(timeout, 'timeout', 0);
  }
  if (threadId === currentThreadId) {
    throw new ERR_WORKER_MESSAGING_SAME_THREAD();
  }
  var memory = constructSharedArrayBuffer(WORKER_MESSAGING_SHARED_DATA);
  var status = new Int32Array(memory);
  var promise = AtomicsWaitAsync(status, WORKER_MESSAGING_STATUS_INDEX, 0, timeout).value;
  var message = {
    type: messageTypes.SEND_MESSAGE_TO_WORKER,
    source: currentThreadId,
    destination: threadId,
    value,
    memory,
    transferList
  };
  if (isMainThread) {
    handleMessageFromThread(message);
  } else {
    mainThreadPort.postMessage(message, transferList);
  }

  // Wait for the response
  return _await(promise, function (response) {
    if (response === 'timed-out') {
      throw new ERR_WORKER_MESSAGING_TIMEOUT();
    } else if (status[WORKER_MESSAGING_RESULT_INDEX] === WORKER_MESSAGING_RESULT_NO_LISTENERS) {
      throw new ERR_WORKER_MESSAGING_FAILED();
    } else if (status[WORKER_MESSAGING_RESULT_INDEX] === WORKER_MESSAGING_RESULT_LISTENER_ERROR) {
      throw new ERR_WORKER_MESSAGING_ERRORED();
    }
  });
});
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
  AtomicsNotify,
  AtomicsStore,
  AtomicsWaitAsync,
  Int32Array,
  SafeMap
} = primordials;
var {
  isMainThread,
  threadId: currentThreadId
} = internalBinding('worker');
var {
  constructSharedArrayBuffer
} = require('internal/util');
var {
  codes: {
    ERR_WORKER_MESSAGING_ERRORED,
    ERR_WORKER_MESSAGING_FAILED,
    ERR_WORKER_MESSAGING_SAME_THREAD,
    ERR_WORKER_MESSAGING_TIMEOUT
  }
} = require('internal/errors');
var {
  MessageChannel
} = require('internal/worker/io');
var {
  validateNumber
} = require('internal/validators');
var messageTypes = {
  REGISTER_MAIN_THREAD_PORT: 'registerMainThreadPort',
  UNREGISTER_MAIN_THREAD_PORT: 'unregisterMainThreadPort',
  SEND_MESSAGE_TO_WORKER: 'sendMessageToWorker',
  RECEIVE_MESSAGE_FROM_WORKER: 'receiveMessageFromWorker'
};

// This is only populated by main thread and always empty in other threads
var threadsPorts = new SafeMap();

// This is only populated in child threads and always undefined in main thread
var mainThreadPort;

// SharedArrayBuffer must always be Int32, so it's * 4.
// We need one for the operation status (performing / performed) and one for the result (success / failure).
var WORKER_MESSAGING_SHARED_DATA = 2 * 4;
var WORKER_MESSAGING_STATUS_INDEX = 0;
var WORKER_MESSAGING_RESULT_INDEX = 1;

// Response codes
var WORKER_MESSAGING_RESULT_DELIVERED = 0;
var WORKER_MESSAGING_RESULT_NO_LISTENERS = 1;
var WORKER_MESSAGING_RESULT_LISTENER_ERROR = 2;

// This event handler is always executed on the main thread only
function handleMessageFromThread(message) {
  switch (message.type) {
    case messageTypes.REGISTER_MAIN_THREAD_PORT:
      {
        var {
          threadId,
          port
        } = message;

        // Register the port
        threadsPorts.set(threadId, port);

        // Handle messages on this port
        // When a new thread wants to register a children
        // this take care of doing that.
        // This way any thread can be linked to the main one.
        port.on('message', handleMessageFromThread);

        // Never block the thread on this port
        port.unref();
      }
      break;
    case messageTypes.UNREGISTER_MAIN_THREAD_PORT:
      threadsPorts.get(message.threadId).close();
      threadsPorts.delete(message.threadId);
      break;
    case messageTypes.SEND_MESSAGE_TO_WORKER:
      {
        // Send the message to the target thread
        var {
          source,
          destination,
          value,
          transferList,
          memory
        } = message;
        sendMessageToWorker(source, destination, value, transferList, memory);
      }
      break;
  }
}
function handleMessageFromMainThread(message) {
  switch (message.type) {
    case messageTypes.RECEIVE_MESSAGE_FROM_WORKER:
      receiveMessageFromWorker(message.source, message.value, message.memory);
      break;
  }
}
function sendMessageToWorker(source, destination, value, transferList, memory) {
  // We are on the main thread, we can directly process the message
  if (destination === 0) {
    receiveMessageFromWorker(source, value, memory);
    return;
  }

  // Search the port to the target thread
  var port = threadsPorts.get(destination);
  if (!port) {
    var status = new Int32Array(memory);
    AtomicsStore(status, WORKER_MESSAGING_RESULT_INDEX, WORKER_MESSAGING_RESULT_NO_LISTENERS);
    AtomicsStore(status, WORKER_MESSAGING_STATUS_INDEX, 1);
    AtomicsNotify(status, WORKER_MESSAGING_STATUS_INDEX, 1);
    return;
  }
  port.postMessage({
    type: messageTypes.RECEIVE_MESSAGE_FROM_WORKER,
    source,
    destination,
    value,
    memory
  }, transferList);
}
function receiveMessageFromWorker(source, value, memory) {
  var response = WORKER_MESSAGING_RESULT_NO_LISTENERS;
  try {
    if (process.emit('workerMessage', value, source)) {
      response = WORKER_MESSAGING_RESULT_DELIVERED;
    }
  } catch {
    response = WORKER_MESSAGING_RESULT_LISTENER_ERROR;
  }

  // Populate the result
  var status = new Int32Array(memory);
  AtomicsStore(status, WORKER_MESSAGING_RESULT_INDEX, response);
  AtomicsStore(status, WORKER_MESSAGING_STATUS_INDEX, 1);
  AtomicsNotify(status, WORKER_MESSAGING_STATUS_INDEX, 1);
}
function createMainThreadPort(threadId) {
  // Create a channel that links the new thread to the main thread
  var {
    port1: mainThreadPortToMain,
    port2: mainThreadPortToThread
  } = new MessageChannel();
  var registrationMessage = {
    type: messageTypes.REGISTER_MAIN_THREAD_PORT,
    threadId,
    port: mainThreadPortToMain
  };
  if (isMainThread) {
    handleMessageFromThread(registrationMessage);
  } else {
    mainThreadPort.postMessage(registrationMessage, [mainThreadPortToMain]);
  }
  return mainThreadPortToThread;
}
function destroyMainThreadPort(threadId) {
  var unregistrationMessage = {
    type: messageTypes.UNREGISTER_MAIN_THREAD_PORT,
    threadId
  };
  if (isMainThread) {
    handleMessageFromThread(unregistrationMessage);
  } else {
    mainThreadPort.postMessage(unregistrationMessage);
  }
}
function setupMainThreadPort(port) {
  mainThreadPort = port;
  mainThreadPort.on('message', handleMessageFromMainThread);

  // Never block the process on this port
  mainThreadPort.unref();
}
module.exports = {
  createMainThreadPort,
  destroyMainThreadPort,
  setupMainThreadPort,
  postMessageToThread
};

