'use strict';

var assert = require('assert');
var path = require('path');
var consoleMod = require('console');

var FIXTURES = path.join(__dirname, 'fixtures');

// ---------------------------------------------------------------
// 1. Package with "main" field in package.json
// ---------------------------------------------------------------
{
  var modPkgMain = require(path.join(FIXTURES, 'pkgmain'));
  assert.strictEqual(modPkgMain.pkgMain, true, 'pkgmain: main entry used');
  consoleMod.log('[PASS] package.json "main" field resolution');
}

// ---------------------------------------------------------------
// 2. Package with no "main" falls back to index.js
// ---------------------------------------------------------------
{
  var modNoMain = require(path.join(FIXTURES, 'nomain'));
  assert.strictEqual(modNoMain.fallback, 'index', 'nomain: index.js fallback works');
  consoleMod.log('[PASS] package.json without "main" -> index.js fallback');
}

consoleMod.log('\nAdvanced module resolution tests completed successfully.');