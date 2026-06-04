'use strict';

var {
  findSourceMap,
  getSourceMapsSupport,
  setSourceMapsSupport
} = require('internal/source_map/source_map_cache');
var {
  Module
} = require('internal/modules/cjs/loader');
var {
  register
} = require('internal/modules/esm/loader');
var {
  SourceMap
} = require('internal/source_map/source_map');
var {
  constants,
  enableCompileCache,
  flushCompileCache,
  getCompileCacheDir
} = require('internal/modules/helpers');
var {
  findPackageJSON
} = require('internal/modules/package_json_reader');
var {
  stripTypeScriptTypes
} = require('internal/modules/typescript');
Module.register = register;
Module.constants = constants;
Module.enableCompileCache = enableCompileCache;
Module.findPackageJSON = findPackageJSON;
Module.flushCompileCache = flushCompileCache;
Module.getCompileCacheDir = getCompileCacheDir;
Module.stripTypeScriptTypes = stripTypeScriptTypes;

// SourceMap APIs
Module.findSourceMap = findSourceMap;
Module.SourceMap = SourceMap;
Module.getSourceMapsSupport = getSourceMapsSupport;
Module.setSourceMapsSupport = setSourceMapsSupport;
module.exports = Module;

