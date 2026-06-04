'use strict';

var {
  ArrayPrototypePop,
  Promise
} = primordials;
var {
  isIterable,
  isNodeStream,
  isWebStream
} = require('internal/streams/utils');
var {
  pipelineImpl: pl
} = require('internal/streams/pipeline');
var {
  finished
} = require('internal/streams/end-of-stream');
require('stream');
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  return new Promise((resolve, reject) => {
    var signal;
    var end;
    var lastArg = streams[streams.length - 1];
    if (lastArg && typeof lastArg === 'object' && !isNodeStream(lastArg) && !isIterable(lastArg) && !isWebStream(lastArg)) {
      var options = ArrayPrototypePop(streams);
      signal = options.signal;
      end = options.end;
    }
    pl(streams, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    }, {
      signal,
      end
    });
  });
}
module.exports = {
  finished,
  pipeline
};

