'use strict';

var {
  ObjectDefineProperties
} = primordials;
var {
  hasInspector
} = internalBinding('config');
var {
  getOptionValue
} = require('internal/options');
var {
  kConstructorKey,
  Storage
} = internalBinding('webstorage');
var {
  getValidatedPath
} = require('internal/fs/utils');
var kInMemoryPath = ':memory:';
module.exports = {
  Storage
};
var lazyLocalStorage;
var lazySessionStorage;
var lazyInspectorStorage;
var localStorageWarned = false;

// Check at load time if localStorage file is provided to determine enumerability.
// If not provided, localStorage is non-enumerable to avoid breaking {...globalThis}.
var localStorageLocation = getOptionValue('--localstorage-file');
var experimentalStorageInspection = hasInspector && getOptionValue('--experimental-storage-inspection');
function getInspectorStorage() {
  if (lazyInspectorStorage === undefined) {
    lazyInspectorStorage = require('internal/inspector/webstorage');
  }
  return lazyInspectorStorage;
}
ObjectDefineProperties(module.exports, {
  __proto__: null,
  localStorage: {
    __proto__: null,
    configurable: true,
    enumerable: localStorageLocation !== '',
    get() {
      if (lazyLocalStorage === undefined) {
        if (localStorageLocation === '') {
          if (!localStorageWarned) {
            localStorageWarned = true;
            process.emitWarning('localStorage is not available because --localstorage-file was not provided.', 'ExperimentalWarning');
          }
          return undefined;
        }
        if (experimentalStorageInspection) {
          var {
            InspectorLocalStorage
          } = getInspectorStorage();
          lazyLocalStorage = new InspectorLocalStorage(kConstructorKey, getValidatedPath(localStorageLocation), true);
        } else {
          lazyLocalStorage = new Storage(kConstructorKey, getValidatedPath(localStorageLocation));
        }
      }
      return lazyLocalStorage;
    }
  },
  sessionStorage: {
    __proto__: null,
    configurable: true,
    enumerable: true,
    get() {
      if (lazySessionStorage === undefined) {
        if (experimentalStorageInspection) {
          var {
            InspectorSessionStorage
          } = getInspectorStorage();
          lazySessionStorage = new InspectorSessionStorage(kConstructorKey, kInMemoryPath, false);
        } else {
          lazySessionStorage = new Storage(kConstructorKey, kInMemoryPath);
        }
      }
      return lazySessionStorage;
    }
  }
});

