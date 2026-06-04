'use strict';

var {
  ArrayPrototypeForEach,
  NumberMAX_SAFE_INTEGER,
  StringPrototypeToLowerCase,
  Symbol
} = primordials;
var dc = require('diagnostics_channel');
var {
  now
} = require('internal/perf/utils');
var {
  MIMEType
} = require('internal/mime');
var kInspectorRequestId = Symbol('kInspectorRequestId');

// https://chromedevtools.github.io/devtools-protocol/1-3/Network/#type-ResourceType
var kResourceType = {
  Document: 'Document',
  Stylesheet: 'Stylesheet',
  Image: 'Image',
  Media: 'Media',
  Font: 'Font',
  Script: 'Script',
  TextTrack: 'TextTrack',
  XHR: 'XHR',
  Fetch: 'Fetch',
  Prefetch: 'Prefetch',
  EventSource: 'EventSource',
  WebSocket: 'WebSocket',
  Manifest: 'Manifest',
  SignedExchange: 'SignedExchange',
  Ping: 'Ping',
  CSPViolationReport: 'CSPViolationReport',
  Preflight: 'Preflight',
  Other: 'Other'
};

/**
 * Return a monotonically increasing time in seconds since an arbitrary point in the past.
 * @returns {number}
 */
function getMonotonicTime() {
  return now() / 1000;
}
var requestId = 0;
function getNextRequestId() {
  if (requestId === NumberMAX_SAFE_INTEGER) {
    requestId = 0;
  }
  return `node-network-event-${++requestId}`;
}
;
function sniffMimeType(contentType) {
  var mimeType;
  var charset;
  try {
    var mimeTypeObj = new MIMEType(contentType);
    mimeType = StringPrototypeToLowerCase(mimeTypeObj.essence || '');
    charset = StringPrototypeToLowerCase(mimeTypeObj.params.get('charset') || '');
  } catch {
    mimeType = '';
    charset = '';
  }
  return {
    __proto__: null,
    mimeType,
    charset
  };
}
function registerDiagnosticChannels(listenerPairs) {
  function enable() {
    ArrayPrototypeForEach(listenerPairs, _ref => {
      var {
        0: channel,
        1: listener
      } = _ref;
      dc.subscribe(channel, listener);
    });
  }
  function disable() {
    ArrayPrototypeForEach(listenerPairs, _ref2 => {
      var {
        0: channel,
        1: listener
      } = _ref2;
      dc.unsubscribe(channel, listener);
    });
  }
  return {
    enable,
    disable
  };
}
module.exports = {
  kInspectorRequestId,
  kResourceType,
  getMonotonicTime,
  getNextRequestId,
  registerDiagnosticChannels,
  sniffMimeType
};

