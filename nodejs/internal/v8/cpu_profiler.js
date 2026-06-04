'use strict';

var {
  MathFloor
} = primordials;
var {
  validateNumber,
  validateObject
} = require('internal/validators');
var kMicrosPerMilli = 1_000;
var kMaxSamplingIntervalUs = 0x7FFFFFFF;
var kMaxSamplingIntervalMs = kMaxSamplingIntervalUs / kMicrosPerMilli;
var kMaxSamplesUnlimited = 0xFFFF_FFFF;
function normalizeCpuProfileOptions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  validateObject(options, 'options');

  // TODO(ishabi): add support for 'mode' and 'filterContext' options
  var {
    sampleInterval,
    maxBufferSize
  } = options;
  var samplingIntervalMicros = 0;
  if (sampleInterval !== undefined) {
    validateNumber(sampleInterval, 'options.sampleInterval', 0, kMaxSamplingIntervalMs);
    samplingIntervalMicros = MathFloor(sampleInterval * kMicrosPerMilli);
    if (sampleInterval > 0 && samplingIntervalMicros === 0) {
      samplingIntervalMicros = 1;
    }
  }
  var size = maxBufferSize;
  var normalizedMaxSamples = kMaxSamplesUnlimited;
  if (size !== undefined) {
    validateNumber(size, 'options.maxBufferSize', 1, kMaxSamplesUnlimited);
    normalizedMaxSamples = MathFloor(size);
  }
  return {
    samplingIntervalMicros,
    maxSamples: normalizedMaxSamples
  };
}
module.exports = {
  normalizeCpuProfileOptions
};

