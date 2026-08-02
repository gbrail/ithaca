'use strict';

var assert = require('assert');
var path = require('path');
var consoleMod = require('console');

var FIXTURES = path.join(__dirname, 'fixtures');

// ---------------------------------------------------------------
// 1. Basic module.exports and require — directory (index.js fallback)
// ---------------------------------------------------------------
{
  var modBasic = require(path.join(FIXTURES, 'basic'));
  assert.strictEqual(typeof modBasic, 'object', 'basic: should return an object');
  assert.strictEqual(modBasic.name, 'basic', 'basic: name matches');
  assert.strictEqual(modBasic.value, 42, 'basic: value matches');
  consoleMod.log('[PASS] Basic module.exports / require — directory (index.js fallback)');
}

// ---------------------------------------------------------------
// 2. Explicit file extension (.js)
// ---------------------------------------------------------------
{
  var modExplicit = require(path.join(FIXTURES, 'extensions/explicit.js'));
  assert.strictEqual(modExplicit.from, 'explicit-js', 'explicit .js: from matches');
  consoleMod.log('[PASS] Explicit file extension (.js)');
}

// ---------------------------------------------------------------
// 3. JSON import
// ---------------------------------------------------------------
{
  var modJson = require(path.join(FIXTURES, 'extensions/data.json'));
  assert.strictEqual(modJson.from, 'json-data', 'JSON: from matches');
  assert.strictEqual(modJson.answer, 42, 'JSON: answer matches');
  consoleMod.log('[PASS] JSON module import');
}

// ---------------------------------------------------------------
// 4. Relative path resolution (../)
// ---------------------------------------------------------------
{
  var modCircular = require(path.join(FIXTURES, 'circular/a.js'));
  assert.strictEqual(modCircular.name, 'circular-a', '../: module name correct');
  assert.strictEqual(modCircular.nested.level, 'nested', '../: submodule loaded via relative path');
  consoleMod.log('[PASS] Relative ../ and ./ path resolution');
}

// ---------------------------------------------------------------
// 5. Circular dependency guard
// ---------------------------------------------------------------
{
  var modDepB = require(path.join(FIXTURES, 'circular/dep-b.js'));
  assert.strictEqual(modDepB.id, 'B', 'circular: dep-b id correct');
  consoleMod.log('[PASS] Circular dependency resolution');
}

// ---------------------------------------------------------------
// 6. Module cache returns same reference
// ---------------------------------------------------------------
{
  var modCache1 = require(path.join(FIXTURES, 'basic'));
  assert.strictEqual(modCache1.value, 42, 'cache: value unchanged');

  modCache1.mutateMe = true;

  var modCache2 = require(path.join(FIXTURES, 'basic'));
  assert.strictEqual(modCache2.mutateMe, true, 'cache: mutation persisted via cache');
  consoleMod.log('[PASS] Module cache returns same object reference');
}

// ---------------------------------------------------------------
// 7. Nested ./ requires within subdirectories
// ---------------------------------------------------------------
{
  var modNest = require(path.join(FIXTURES, 'circular/a.js'));
  assert.strictEqual(modNest.nested.level, 'nested', 'nested: ./ resolve works');
  consoleMod.log('[PASS] Nested ./ requires work in subdirectories');
}

consoleMod.log('\nAll module loading tests completed successfully.');