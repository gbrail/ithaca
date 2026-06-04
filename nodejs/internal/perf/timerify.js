'use strict';

var {
  FunctionPrototypeBind,
  MathCeil,
  ObjectDefineProperties,
  ReflectApply,
  ReflectConstruct
} = primordials;
var {
  createPerformanceNodeEntry
} = require('internal/perf/performance_entry');
var {
  now
} = require('internal/perf/utils');
var {
  validateFunction,
  validateObject
} = require('internal/validators');
var {
  isHistogram
} = require('internal/histogram');
var {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = require('internal/errors');
var {
  enqueue
} = require('internal/perf/observe');
var {
  kEmptyObject
} = require('internal/util');
function processComplete(name, start, args, histogram) {
  var duration = now() - start;
  if (histogram !== undefined) histogram.record(MathCeil(duration * 1e6));
  var entry = createPerformanceNodeEntry(name, 'function', start, duration, args);
  for (var n = 0; n < args.length; n++) entry[n] = args[n];
  enqueue(entry);
}
function timerify(fn) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  validateFunction(fn, 'fn');
  validateObject(options, 'options');
  var {
    histogram
  } = options;
  if (histogram !== undefined && (!isHistogram(histogram) || typeof histogram.record !== 'function')) {
    throw new ERR_INVALID_ARG_TYPE('options.histogram', 'RecordableHistogram', histogram);
  }
  function timerified() {
    var isConstructorCall = new.target !== undefined;
    var start = now();
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var result = isConstructorCall ? ReflectConstruct(fn, args, fn) : ReflectApply(fn, this, args);
    if (!isConstructorCall && typeof result?.finally === 'function') {
      return result.finally(FunctionPrototypeBind(processComplete, result, fn.name, start, args, histogram));
    }
    processComplete(fn.name, start, args, histogram);
    return result;
  }
  ObjectDefineProperties(timerified, {
    length: {
      __proto__: null,
      configurable: false,
      enumerable: true,
      value: fn.length
    },
    name: {
      __proto__: null,
      configurable: false,
      enumerable: true,
      value: `timerified ${fn.name}`
    }
  });
  return timerified;
}
module.exports = timerify;

