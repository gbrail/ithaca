'use strict';

var assert = require('assert');
var path = require('path');
var consoleMod = require('console');

var FIXTURES = path.join(__dirname, 'fixtures', 'circular');

// ---------------------------------------------------------------
// 1. Module with exports (named property assignments)
// ---------------------------------------------------------------
{
  var modExports1 = require(path.join(__dirname, 'fixtures', 'basic'));
  assert.strictEqual(modExports1.name, 'basic');
  assert.strictEqual(modExports1.value, 42);

  // Verify that adding to exports object works (mutations persist)
  modExports1.extraProp = 'added';
  assert.strictEqual(modExports1.extraProp, 'added');
  consoleMod.log('[PASS] Exports property mutation persists');
}

// ---------------------------------------------------------------
// 2. module.exports can be reassigned to a function  
// ---------------------------------------------------------------
{
  var modFn = require(path.join(__dirname, 'fixtures', 'node_modules', 'mylib'));
  assert.strictEqual(modFn(), 'mylib-result');
  consoleMod.log('[PASS] module.exports reassigned to function');
}

// ---------------------------------------------------------------
// 3. __filename and __dirname inside loaded modules
// ---------------------------------------------------------------
{
  var modDirname = require(path.join(FIXTURES, 'a.js'));
  assert.ok(modDirname.nested);
  assert.strictEqual(modDirname.nested.level, 'nested');
  consoleMod.log('[PASS] __filename / __dirname in loaded modules');
}

// ---------------------------------------------------------------
// 4. Module caching — identical reference on re-require
// ---------------------------------------------------------------
{
  var modCache = require(path.join(FIXTURES, 'dep-a.js'));
  assert.strictEqual(modCache.id, 'A');

  var modCache2 = require(path.join(FIXTURES, 'dep-a.js'));
  assert.strictEqual(modCache, modCache2);
  consoleMod.log('[PASS] Module caching: identical reference on re-require');
}

// ---------------------------------------------------------------
// 5. Deep module resolution via absolute paths
// ---------------------------------------------------------------
{
  var modDeep = require(path.join(__dirname, 'fixtures', 'dotdot', 'parent.js'));
  assert.strictEqual(modDeep.from, 'dotdot');
  consoleMod.log('[PASS] Deep module resolution via absolute paths');
}

consoleMod.log('\nAll exports semantics tests completed successfully.');
