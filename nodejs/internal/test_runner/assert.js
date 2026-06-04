'use strict';

var {
  SafeMap
} = primordials;
var {
  validateFunction,
  validateString
} = require('internal/validators');
var assert = require('assert');
var methodsToCopy = ['deepEqual', 'deepStrictEqual', 'doesNotMatch', 'doesNotReject', 'doesNotThrow', 'equal', 'fail', 'ifError', 'match', 'notDeepEqual', 'notDeepStrictEqual', 'notEqual', 'notStrictEqual', 'partialDeepStrictEqual', 'rejects', 'strictEqual', 'throws'];
var assertMap;
function getAssertionMap() {
  if (assertMap === undefined) {
    assertMap = new SafeMap();
    for (var i = 0; i < methodsToCopy.length; i++) {
      assertMap.set(methodsToCopy[i], assert[methodsToCopy[i]]);
    }
  }
  return assertMap;
}
function register(name, fn) {
  validateString(name, 'name');
  validateFunction(fn, 'fn');
  var map = getAssertionMap();
  map.set(name, fn);
}
module.exports = {
  getAssertionMap,
  register
};

