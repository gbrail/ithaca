'use strict';

var {
  ArrayPrototypeFilter,
  ArrayPrototypeIncludes,
  ObjectEntries,
  ObjectFromEntries,
  SafeArrayIterator
} = primordials;
var {
  types
} = require('util');
module.exports = {
  util() {
    return ObjectFromEntries(new SafeArrayIterator(ArrayPrototypeFilter(ObjectEntries(types), _ref => {
      var {
        0: key
      } = _ref;
      return ArrayPrototypeIncludes(['isArrayBuffer', 'isArrayBufferView', 'isAsyncFunction', 'isDataView', 'isDate', 'isExternal', 'isMap', 'isMapIterator', 'isNativeError', 'isPromise', 'isRegExp', 'isSet', 'isSetIterator', 'isTypedArray', 'isUint8Array', 'isAnyArrayBuffer'], key);
    })));
  },
  natives() {
    var {
      natives: result,
      configs
    } = internalBinding('builtins');
    // Legacy feature: process.binding('natives').config contains stringified
    // config.gypi. We do not use this object internally so it's fine to mutate
    // it.
    result.configs = configs;
    return result;
  }
};

