'use strict';

function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var _asyncInstantiate = _async(function () {
  var _this6 = this;
  var jobsInGraph = new SafeSet();
  // TODO(joyeecheung): if it's not on the async loader thread, consider this already
  // linked.
  var addJobsToDependencyGraph = _async(function (moduleJob) {
    debug(`async addJobsToDependencyGraph() ${_this6.url}`, moduleJob);
    if (jobsInGraph.has(moduleJob)) {
      return;
    }
    jobsInGraph.add(moduleJob);
    var _isPromise = isPromise(moduleJob.linked);
    return _await(_isPromise ? moduleJob.linked : moduleJob.linked, function (dependencyJobs) {
      return SafePromiseAllReturnVoid(dependencyJobs, addJobsToDependencyGraph);
    }, !_isPromise);
  });
  return _await(addJobsToDependencyGraph(_this6), function () {
    try {
      if (!hasPausedEntry && _this6.inspectBrk) {
        hasPausedEntry = true;
        var initWrapper = internalBinding('inspector').callAndPauseOnStart;
        initWrapper(_this6.module.instantiate, _this6.module);
      } else {
        _this6.module.instantiate();
      }
    } catch (e) {
      decorateErrorStack(e);
      // TODO(@bcoe): Add source map support to exception that occurs as result
      // of missing named export. This is currently not possible because
      // stack trace originates in module_job, not the file itself. A hidden
      // symbol with filename could be set in node_errors.cc to facilitate this.
      if (!getSourceMapsSupport().enabled && StringPrototypeIncludes(e.message, ' does not provide an export named')) {
        var splitStack = StringPrototypeSplit(e.stack, '\n', 2);
        var {
          1: childSpecifier,
          2: name
        } = RegExpPrototypeExec(/module '(.*)' does not provide an export named '(.+)'/, e.message);
        var moduleRequests = _this6.module.getModuleRequests();
        var isCommonJS = false;
        for (var i = 0; i < moduleRequests.length; ++i) {
          if (moduleRequests[i].specifier === childSpecifier) {
            isCommonJS = _this6.commonJsDeps[i];
            break;
          }
        }
        if (isCommonJS) {
          var importStatement = splitStack[1];
          // TODO(@ctavan): The original error stack only provides the single
          // line which causes the error. For multi-line import statements we
          // cannot generate an equivalent object destructuring assignment by
          // just parsing the error stack.
          var oneLineNamedImports = RegExpPrototypeExec(/{.*}/, importStatement);
          var destructuringAssignment = oneLineNamedImports && RegExpPrototypeSymbolReplace(/\s+as\s+/g, oneLineNamedImports, ': ');
          e.message = `Named export '${name}' not found. The requested module` + ` '${childSpecifier}' is a CommonJS module, which may not support` + ' all module.exports as named exports.\nCommonJS modules can ' + 'always be imported via the default export, for example using:' + `\n\nimport pkg from '${childSpecifier}';\n${destructuringAssignment ? `const ${destructuringAssignment} = pkg;\n` : ''}`;
          var newStack = StringPrototypeSplit(e.stack, '\n');
          newStack[3] = `SyntaxError: ${e.message}`;
          e.stack = ArrayPrototypeJoin(newStack, '\n');
        }
      }
      throw e;
    }
    for (var dependencyJob of jobsInGraph) {
      // Calling `this.module.instantiate()` instantiates not only the
      // ModuleWrap in this module, but all modules in the graph.
      dependencyJob.instantiated = resolvedPromise;
    }
  });
});
/**
 * @param {ModuleRequestType} requestType Type of the module request.
 * @returns {Promise<ModuleJobBase[]>}
 */
var _asyncLink = _async(function (requestType) {
  var _this5 = this;
  assert(_this5.loader.isForAsyncLoaderHookWorker);
  return _await(_this5.modulePromise, function (_this5$modulePromise) {
    _this5.module = _this5$modulePromise;
    assert(_this5.module instanceof ModuleWrap);
    var moduleRequests = _this5.module.getModuleRequests();
    // Create an ArrayLike to avoid calling into userspace with `.then`
    // when returned from the async function.
    // Modules should be aligned with the moduleRequests array in order.
    var modulePromises = Array(moduleRequests.length);
    var evaluationDepJobs = [];
    _this5.commonJsDeps = Array(moduleRequests.length);
    var _loop = function () {
      var request = moduleRequests[idx];
      // Explicitly keeping track of dependency jobs is needed in order
      // to flatten out the dependency graph below in `asyncInstantiate()`,
      // so that circular dependencies can't cause a deadlock by two of
      // these `link` callbacks depending on each other.
      // TODO(joyeecheung): split this into two iterators, one for resolving and one for loading so
      // that hooks can pre-fetch sources off-thread.
      var dependencyJobPromise = _this5.loader.getOrCreateModuleJob(_this5.url, request, requestType);
      var modulePromise = PromisePrototypeThen(dependencyJobPromise, job => {
        debug(`ModuleJob.asyncLink() ${_this5.url} -> ${request.specifier}`, job);
        if (request.phase === kEvaluationPhase) {
          ArrayPrototypePush(evaluationDepJobs, job);
        }
        return job.modulePromise;
      });
      modulePromises[idx] = modulePromise;
    };
    for (var idx = 0; idx < moduleRequests.length; idx++) {
      _loop();
    }
    return _await(SafePromiseAllReturnArrayLike(modulePromises), function (modules) {
      for (var _idx = 0; _idx < moduleRequests.length; _idx++) {
        _this5.commonJsDeps[_idx] = modules[_idx].isCommonJS;
      }
      _this5.module.link(modules);
      return evaluationDepJobs;
    });
  });
});
var {
  Array,
  ArrayPrototypeFind,
  ArrayPrototypeJoin,
  ArrayPrototypePush,
  FunctionPrototype,
  ObjectSetPrototypeOf,
  PromisePrototypeThen,
  PromiseResolve,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolReplace,
  SafePromiseAllReturnArrayLike,
  SafePromiseAllReturnVoid,
  SafeSet,
  StringPrototypeIncludes,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  globalThis
} = primordials;
var debug = require('internal/util/debuglog').debuglog('esm', fn => {
  debug = fn;
});
var {
  ModuleWrap,
  kErrored,
  kEvaluated,
  kEvaluating,
  kEvaluationPhase,
  kInstantiated,
  kUninstantiated
} = internalBinding('module_wrap');
var {
  privateSymbols: {
    entry_point_module_private_symbol
  }
} = internalBinding('util');
/**
 * @typedef {import('./utils.js').ModuleRequestType} ModuleRequestType
 */
var {
  decorateErrorStack
} = require('internal/util');
var {
  isPromise
} = require('internal/util/types');
var {
  getSourceMapsSupport
} = require('internal/source_map/source_map_cache');
var assert = require('internal/assert');
var resolvedPromise = PromiseResolve();
var {
  setHasStartedUserESMExecution,
  urlToFilename
} = require('internal/modules/helpers');
var {
  getOptionValue
} = require('internal/options');
var noop = FunctionPrototype;
var {
  ERR_REQUIRE_ASYNC_MODULE,
  ERR_REQUIRE_ESM_RACE_CONDITION
} = require('internal/errors').codes;
var hasPausedEntry = false;
var CJSGlobalLike = ['require', 'module', 'exports', '__filename', '__dirname'];
var findCommonJSGlobalLikeNotDefinedError = errorMessage => ArrayPrototypeFind(CJSGlobalLike, globalLike => errorMessage === `${globalLike} is not defined`);

/**
 *
 * @param {Error} e
 * @param {string} url
 * @returns {void}
 */
var explainCommonJSGlobalLikeNotDefinedError = (e, url, hasTopLevelAwait) => {
  var notDefinedGlobalLike = e?.name === 'ReferenceError' && findCommonJSGlobalLikeNotDefinedError(e.message);
  if (notDefinedGlobalLike) {
    if (hasTopLevelAwait) {
      var advice;
      switch (notDefinedGlobalLike) {
        case 'require':
          advice = 'replace require() with import';
          break;
        case 'module':
        case 'exports':
          advice = 'use export instead of module.exports/exports';
          break;
        case '__filename':
          advice = 'use import.meta.filename instead';
          break;
        case '__dirname':
          advice = 'use import.meta.dirname instead';
          break;
      }
      e.message = `Cannot determine intended module format because both '${notDefinedGlobalLike}' and top-level await are present. If the code is intended to be CommonJS, wrap await in an async function. If the code is intended to be an ES module, ${advice}.`;
      e.code = 'ERR_AMBIGUOUS_MODULE_SYNTAX';
      return;
    }
    e.message += ' in ES module scope';
    if (StringPrototypeStartsWith(e.message, 'require ')) {
      e.message += ', you can use import instead';
    }
    var packageConfig = StringPrototypeStartsWith(url, 'file://') && RegExpPrototypeExec(/\.js(\?[^#]*)?(#.*)?$/, url) !== null && require('internal/modules/package_json_reader').getPackageScopeConfig(url);
    if (packageConfig.type === 'module') {
      e.message += '\nThis file is being treated as an ES module because it has a ' + `'.js' file extension and '${packageConfig.pjsonPath}' contains ` + '"type": "module". To treat it as a CommonJS script, rename it ' + 'to use the \'.cjs\' file extension.';
    }
  }
};
var ModuleJobBase = /*#__PURE__*/function () {
  function ModuleJobBase(loader, url, importAttributes, phase, isMain, inspectBrk) {
    _classCallCheck(this, ModuleJobBase);
    assert(typeof phase === 'number');
    this.loader = loader;
    this.importAttributes = importAttributes;
    this.phase = phase;
    this.isMain = isMain;
    this.inspectBrk = inspectBrk;
    this.url = url;
  }

  /**
   * Synchronously link the module and its dependencies.
   * @param {ModuleRequestType} requestType Type of the module request.
   * @returns {ModuleJobBase[]}
   */
  return _createClass(ModuleJobBase, [{
    key: "syncLink",
    value: function syncLink(requestType) {
      // Store itself into the cache first before linking in case there are circular
      // references in the linking. Track whether we're overwriting an existing entry
      // so we know whether to remove the temporary entry in the finally block.
      var hadPreviousEntry = this.loader.loadCache.get(this.url, this.type) !== undefined;
      this.loader.loadCache.set(this.url, this.type, this);
      var moduleRequests = this.module.getModuleRequests();
      // Modules should be aligned with the moduleRequests array in order.
      var modules = Array(moduleRequests.length);
      var evaluationDepJobs = [];
      this.commonJsDeps = Array(moduleRequests.length);
      try {
        for (var idx = 0; idx < moduleRequests.length; idx++) {
          var request = moduleRequests[idx];
          // TODO(joyeecheung): split this into two iterators, one for resolving and one for loading so
          // that hooks can pre-fetch sources off-thread.
          var job = this.loader.getOrCreateModuleJob(this.url, request, requestType);
          debug(`ModuleJobBase.syncLink() ${this.url} -> ${request.specifier}`, job);
          assert(!isPromise(job));
          assert(job.module instanceof ModuleWrap);
          if (request.phase === kEvaluationPhase) {
            ArrayPrototypePush(evaluationDepJobs, job);
          }
          modules[idx] = job.module;
          this.commonJsDeps[idx] = job.module.isCommonJS;
        }
        this.module.link(modules);
      } finally {
        if (!hadPreviousEntry) {
          // Remove the temporary entry. On failure this ensures subsequent attempts
          // don't return a broken job. On success the caller
          // (#getOrCreateModuleJobAfterResolve) will re-insert under the correct key.
          this.loader.loadCache.delete(this.url, this.type);
        }
        // If there was a previous entry (ensurePhase() path), leave this in cache -
        // it is the upgraded job and the caller will not re-insert.
      }
      return evaluationDepJobs;
    }

    /**
     * Ensure that this ModuleJob is moving towards the required phase
     * (does not necessarily mean it is ready at that phase - run does that)
     * @param {number} phase
     */
  }, {
    key: "ensurePhase",
    value: function ensurePhase(phase, requestType) {
      if (this.phase < phase) {
        this.phase = phase;
        this.linked = this.link(requestType);
        if (isPromise(this.linked)) {
          PromisePrototypeThen(this.linked, undefined, noop);
        }
      }
    }
  }]);
}();
/* A ModuleJob tracks the loading of a single Module, and the ModuleJobs of
 * its dependencies, over time. */
var _ModuleJob_brand = /*#__PURE__*/new WeakSet();
var ModuleJob = /*#__PURE__*/function (_ModuleJobBase) {
  /**
   * @param {ModuleLoader} loader The ESM loader.
   * @param {string} url URL of the module to be wrapped in ModuleJob.
   * @param {ImportAttributes} importAttributes Import attributes from the import statement.
   * @param {ModuleWrap|Promise<ModuleWrap>} moduleOrModulePromise Translated ModuleWrap for the module.
   * @param {number} phase The phase to load the module to.
   * @param {boolean} isMain Whether the module is the entry point.
   * @param {boolean} inspectBrk Whether this module should be evaluated with the
   *   first line paused in the debugger (because --inspect-brk is passed).
   * @param {ModuleRequestType} requestType Type of the module request.
   */
  function ModuleJob(loader, url) {
    var _this;
    var importAttributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      __proto__: null
    };
    var moduleOrModulePromise = arguments.length > 3 ? arguments[3] : undefined;
    var phase = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : kEvaluationPhase;
    var isMain = arguments.length > 5 ? arguments[5] : undefined;
    var inspectBrk = arguments.length > 6 ? arguments[6] : undefined;
    var _requestType = arguments.length > 7 ? arguments[7] : undefined;
    _classCallCheck(this, ModuleJob);
    _this = _callSuper(this, ModuleJob, [loader, url, importAttributes, phase, isMain, inspectBrk]);

    // Expose the promise to the ModuleWrap directly for linking below.
    _classPrivateMethodInitSpec(_this, _ModuleJob_brand);
    if (isPromise(moduleOrModulePromise)) {
      _this.modulePromise = moduleOrModulePromise;
    } else {
      _this.module = moduleOrModulePromise;
      _this.modulePromise = PromiseResolve(moduleOrModulePromise);
    }
    if (_this.phase === kEvaluationPhase) {
      // Promise for the list of all dependencyJobs.
      _this.linked = _this.link(_requestType);
      // This promise is awaited later anyway, so silence
      // 'unhandled rejection' warnings.
      if (isPromise(_this.linked)) {
        PromisePrototypeThen(_this.linked, undefined, noop);
      }
    }

    // instantiated == deep dependency jobs wrappers are instantiated,
    // and module wrapper is instantiated.
    _this.instantiated = undefined;
    return _this;
  }

  /**
   * @param {ModuleRequestType} requestType Type of the module request.
   * @returns {ModuleJobBase[]|Promise<ModuleJobBase[]>}
   */
  _inherits(ModuleJob, _ModuleJobBase);
  return _createClass(ModuleJob, [{
    key: "link",
    value: function link(requestType) {
      if (this.loader.isForAsyncLoaderHookWorker) {
        return _assertClassBrand(_ModuleJob_brand, this, _asyncLink).call(this, requestType);
      }
      return this.syncLink(requestType);
    }
  }, {
    key: "runSync",
    value: function runSync(parent) {
      assert(this.phase === kEvaluationPhase);
      assert(this.module instanceof ModuleWrap);
      var status = this.module.getStatus();
      debug('ModuleJob.runSync()', status, this.module);
      if (status === kUninstantiated) {
        // FIXME(joyeecheung): this cannot fully handle < kInstantiated. Make the linking
        // fully synchronous instead.
        if (this.module.getModuleRequests().length === 0) {
          this.module.link([]);
        }
        this.module.instantiate();
        status = this.module.getStatus();
      }
      if (status === kInstantiated || status === kErrored) {
        var filename = urlToFilename(this.url);
        var parentFilename = urlToFilename(parent?.filename);
        if (this.module.hasAsyncGraph && !getOptionValue('--experimental-print-required-tla')) {
          throw new ERR_REQUIRE_ASYNC_MODULE(filename, parentFilename);
        }
        if (status === kInstantiated) {
          setHasStartedUserESMExecution();
          var namespace = this.module.evaluateSync(filename, parentFilename);
          return {
            __proto__: null,
            module: this.module,
            namespace
          };
        }
        throw this.module.getError();
      } else if (status === kEvaluating || status === kEvaluated) {
        if (this.module.hasAsyncGraph) {
          var _filename = urlToFilename(this.url);
          var _parentFilename = urlToFilename(parent?.filename);
          throw new ERR_REQUIRE_ASYNC_MODULE(_filename, _parentFilename);
        }
        // kEvaluating can show up when this is being used to deal with CJS <-> CJS cycles.
        // Allow it for now, since we only need to ban ESM <-> CJS cycles which would be
        // detected earlier during the linking phase, though the CJS handling in the ESM
        // loader won't be able to emit warnings on pending circular exports like what
        // the CJS loader does.
        // TODO(joyeecheung): remove the re-invented require() in the ESM loader and
        // always handle CJS using the CJS loader to eliminate the quirks.
        return {
          __proto__: null,
          module: this.module,
          namespace: this.module.getNamespace()
        };
      }
      assert(status === kUninstantiated, `Unexpected module status ${status}.`);
      throw new ERR_REQUIRE_ESM_RACE_CONDITION();
    }
  }, {
    key: "run",
    value: function run() {
      var isEntryPoint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      try {
        var _this2 = this;
        debug('ModuleJob.run()', _this2.module);
        assert(_this2.phase === kEvaluationPhase);
        return _await(_assertClassBrand(_ModuleJob_brand, _this2, _instantiate).call(_this2), function () {
          var _exit = false;
          if (isEntryPoint) {
            globalThis[entry_point_module_private_symbol] = _this2.module;
          }
          var timeout = -1;
          var breakOnSigint = false;
          setHasStartedUserESMExecution();
          return _continue(_catch(function () {
            return _awaitIgnored(_this2.module.evaluate(timeout, breakOnSigint));
          }, function (e) {
            explainCommonJSGlobalLikeNotDefinedError(e, _this2.module.url, _this2.module.hasTopLevelAwait);
            throw e;
          }), function (_result) {
            return _exit ? _result : {
              __proto__: null,
              module: _this2.module
            };
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);
}(ModuleJobBase);
/**
 * This is a fully synchronous job and does not spawn additional threads in any way.
 * All the steps are ensured to be synchronous and it throws on instantiating
 * an asynchronous graph. It also disallows CJS <-> ESM cycles.
 *
 * This is used for ES modules loaded via require(esm). Modules loaded by require() in
 * imported CJS are handled by ModuleJob with the isForRequireInImportedCJS set to true instead.
 * The two currently have different caching behaviors.
 * TODO(joyeecheung): consolidate this with the isForRequireInImportedCJS variant of ModuleJob.
 */
function _instantiate() {
  if (this.instantiated === undefined) {
    this.instantiated = _assertClassBrand(_ModuleJob_brand, this, _asyncInstantiate).call(this);
  }
  return this.instantiated;
}
var ModuleJobSync = /*#__PURE__*/function (_ModuleJobBase2) {
  /**
   * @param {ModuleLoader} loader The ESM loader.
   * @param {string} url URL of the module to be wrapped in ModuleJob.
   * @param {ImportAttributes} importAttributes Import attributes from the import statement.
   * @param {ModuleWrap} moduleWrap Translated ModuleWrap for the module.
   * @param {number} phase The phase to load the module to.
   * @param {boolean} isMain Whether the module is the entry point.
   * @param {boolean} inspectBrk Whether this module should be evaluated with the
   *   first line paused in the debugger (because --inspect-brk is passed).
   */
  function ModuleJobSync(loader, url, importAttributes, moduleWrap) {
    var _this3;
    var phase = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : kEvaluationPhase;
    var isMain = arguments.length > 5 ? arguments[5] : undefined;
    var inspectBrk = arguments.length > 6 ? arguments[6] : undefined;
    var requestType = arguments.length > 7 ? arguments[7] : undefined;
    _classCallCheck(this, ModuleJobSync);
    _this3 = _callSuper(this, ModuleJobSync, [loader, url, importAttributes, phase, isMain, inspectBrk]);
    _this3.module = moduleWrap;
    assert(_this3.module instanceof ModuleWrap);
    _this3.linked = undefined;
    _this3.type = importAttributes.type;
    if (phase === kEvaluationPhase) {
      _this3.linked = _this3.link(requestType);
    }
    return _this3;
  }

  /**
   * @param {ModuleRequestType} requestType Type of the module request.
   * @returns {ModuleJobBase[]}
   */
  _inherits(ModuleJobSync, _ModuleJobBase2);
  return _createClass(ModuleJobSync, [{
    key: "link",
    value: function link(requestType) {
      // Synchronous linking is always used for ModuleJobSync.
      return this.syncLink(requestType);
    }
  }, {
    key: "modulePromise",
    get: function () {
      return PromiseResolve(this.module);
    }
  }, {
    key: "run",
    value: function run() {
      try {
        var _exit2 = false;
        var _this4 = this;
        assert(_this4.phase === kEvaluationPhase);
        // This path is hit by a require'd module that is imported again.
        var status = _this4.module.getStatus();
        debug('ModuleJobSync.run()', status, _this4.module);
        // If the module was previously required and errored, reject from import() again.
        return _await(_invoke(function () {
          if (status === kErrored) {
            throw _this4.module.getError();
          } else return function () {
            if (status > kInstantiated) {
              return _invoke(function () {
                if (_this4.evaluationPromise) {
                  return _awaitIgnored(_this4.evaluationPromise);
                }
              }, function () {
                var _proto__$module = {
                  __proto__: null,
                  module: _this4.module
                };
                _exit2 = true;
                return _proto__$module;
              });
            } else return function () {
              if (status === kInstantiated) {
                // The evaluation may have been canceled because instantiate() detected TLA first.
                // But when it is imported again, it's fine to re-evaluate it asynchronously.
                var timeout = -1;
                var breakOnSigint = false;
                _this4.evaluationPromise = _this4.module.evaluate(timeout, breakOnSigint);
                return _await(_this4.evaluationPromise, function () {
                  _this4.evaluationPromise = undefined;
                  var _proto__$module2 = {
                    __proto__: null,
                    module: _this4.module
                  };
                  _exit2 = true;
                  return _proto__$module2;
                });
              }
            }();
          }();
        }, function (_result4) {
          if (_exit2) return _result4;
          assert.fail('Unexpected status of a module that is imported again after being required. ' + `Status = ${status}`);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "runSync",
    value: function runSync(parent) {
      debug('ModuleJobSync.runSync()', this.module);
      assert(this.phase === kEvaluationPhase);
      // TODO(joyeecheung): add the error decoration logic from the async instantiate.
      this.module.instantiate();
      // If --experimental-print-required-tla is true, proceeds to evaluation even
      // if it's async because we want to search for the TLA and help users locate
      // them.
      // TODO(joyeecheung): track the asynchroniticy using v8::Module::HasTopLevelAwait()
      // and we'll be able to throw right after compilation of the modules, using acron
      // to find and print the TLA. This requires the linking to be synchronous in case
      // it runs into cached asynchronous modules that are not yet fetched.
      var parentFilename = urlToFilename(parent?.filename);
      var filename = urlToFilename(this.url);
      if (this.module.hasAsyncGraph && !getOptionValue('--experimental-print-required-tla')) {
        throw new ERR_REQUIRE_ASYNC_MODULE(filename, parentFilename);
      }
      setHasStartedUserESMExecution();
      try {
        var namespace = this.module.evaluateSync(filename, parentFilename);
        return {
          __proto__: null,
          module: this.module,
          namespace
        };
      } catch (e) {
        explainCommonJSGlobalLikeNotDefinedError(e, this.module.url, this.module.hasTopLevelAwait);
        throw e;
      }
    }
  }]);
}(ModuleJobBase);
ObjectSetPrototypeOf(ModuleJobBase.prototype, null);
module.exports = {
  ModuleJob,
  ModuleJobSync,
  ModuleJobBase
};

