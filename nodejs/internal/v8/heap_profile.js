'use strict';

var {
  validateBoolean,
  validateInteger,
  validateInt32,
  validateObject
} = require('internal/validators');
var {
  kSamplingNoFlags,
  kSamplingForceGC,
  kSamplingIncludeObjectsCollectedByMajorGC,
  kSamplingIncludeObjectsCollectedByMinorGC
} = internalBinding('v8');
function normalizeHeapProfileOptions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  validateObject(options, 'options');
  var {
    sampleInterval = 512 * 1024,
    stackDepth = 16,
    forceGC = false,
    includeObjectsCollectedByMajorGC = false,
    includeObjectsCollectedByMinorGC = false
  } = options;
  validateInteger(sampleInterval, 'options.sampleInterval', 1);
  validateInt32(stackDepth, 'options.stackDepth', 0);
  validateBoolean(forceGC, 'options.forceGC');
  validateBoolean(includeObjectsCollectedByMajorGC, 'options.includeObjectsCollectedByMajorGC');
  validateBoolean(includeObjectsCollectedByMinorGC, 'options.includeObjectsCollectedByMinorGC');
  var flags = kSamplingNoFlags;
  if (forceGC) flags |= kSamplingForceGC;
  if (includeObjectsCollectedByMajorGC) {
    flags |= kSamplingIncludeObjectsCollectedByMajorGC;
  }
  if (includeObjectsCollectedByMinorGC) {
    flags |= kSamplingIncludeObjectsCollectedByMinorGC;
  }
  return {
    sampleInterval,
    stackDepth,
    flags
  };
}
module.exports = {
  normalizeHeapProfileOptions
};

