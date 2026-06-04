'use strict';

var {
  ArrayPrototypeForEach,
  Date,
  DatePrototypeGetDate,
  DatePrototypeGetFullYear,
  DatePrototypeGetHours,
  DatePrototypeGetMinutes,
  DatePrototypeGetMonth,
  DatePrototypeGetSeconds,
  NumberParseInt,
  ObjectDefineProperty,
  ObjectFreeze,
  String,
  globalThis
} = primordials;
var {
  getOptionValue,
  refreshOptions,
  getEmbedderOptions
} = require('internal/options');
var {
  exposeLazyInterfaces,
  defineReplaceableLazyAttribute,
  setupCoverageHooks,
  emitExperimentalWarning,
  deprecate
} = require('internal/util');
var {
  ERR_MISSING_OPTION,
  ERR_ACCESS_DENIED
} = require('internal/errors').codes;
var assert = require('internal/assert');
var {
  namespace: {
    addSerializeCallback,
    isBuildingSnapshot
  },
  runDeserializeCallbacks
} = require('internal/v8/startup_snapshot');
function prepareMainThreadExecution() {
  var expandArgv1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var initializeModules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return prepareExecution({
    expandArgv1,
    initializeModules,
    isMainThread: true,
    shouldSpawnLoaderHookWorker: initializeModules,
    shouldPreloadModules: initializeModules
  });
}
function prepareTestRunnerMainExecution() {
  var loadUserModules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  return prepareExecution({
    expandArgv1: false,
    initializeModules: true,
    isMainThread: true,
    shouldSpawnLoaderHookWorker: loadUserModules,
    shouldPreloadModules: loadUserModules
  });
}
function prepareWorkerThreadExecution() {
  prepareExecution({
    expandArgv1: false,
    isMainThread: false,
    // Module loader initialization in workers are delayed until the worker thread
    // is ready for execution.
    initializeModules: false,
    shouldSpawnLoaderHookWorker: false,
    shouldPreloadModules: false
  });
}
function prepareShadowRealmExecution() {
  // Patch the process object with legacy properties and normalizations.
  // Do not expand argv1 as it is not available in ShadowRealm.
  patchProcessObject(false);
  setupDebugEnv();

  // Disable custom loaders in ShadowRealm.
  initializeModuleLoaders({
    shouldSpawnLoaderHookWorker: false,
    shouldPreloadModules: false
  });
  var {
    privateSymbols: {
      host_defined_option_symbol
    }
  } = internalBinding('util');
  var {
    vm_dynamic_import_default_internal
  } = internalBinding('symbols');

  // For ShadowRealm.prototype.importValue(), the referrer name is
  // always null, so the native ImportModuleDynamically() callback would
  // always fallback to look up the host-defined option from the
  // global object using host_defined_option_symbol. Using
  // vm_dynamic_import_default_internal as the host-defined option
  // instructs the JS-land importModuleDynamicallyCallback() to
  // proxy the request to defaultImportModuleDynamically().
  globalThis[host_defined_option_symbol] = vm_dynamic_import_default_internal;
}
function prepareExecution(options) {
  var {
    expandArgv1,
    initializeModules,
    isMainThread,
    shouldSpawnLoaderHookWorker,
    shouldPreloadModules
  } = options;
  refreshRuntimeOptions();

  // Patch the process object and get the resolved main entry point.
  var mainEntry = patchProcessObject(expandArgv1);
  setupTraceCategoryState();
  setupInspectorHooks();
  setupNetworkInspection();
  setupNavigator();
  setupWarningHandler();
  setupFFI();
  setupSQLite();
  setupStreamIter();
  setupDTLS();
  setupVfs();
  setupQuic();
  setupWebStorage();
  setupWebsocket();
  setupEventsource();
  setupCodeCoverage();
  setupDebugEnv();
  // Process initial diagnostic reporting configuration, if present.
  initializeReport();
  setupDiagnosticsChannel();

  // Load permission system API
  initializePermission();
  initializeSourceMapsHandlers();
  initializeDeprecations();
  initializeConfigFileSupport();
  require('internal/dns/utils').initializeDns();
  if (isMainThread) {
    assert(internalBinding('worker').isMainThread);
    // Worker threads will get the manifest in the message handler.

    // Print stack trace on `SIGINT` if option `--trace-sigint` presents.
    setupStacktracePrinterOnSigint();
    initializeReportSignalHandlers(); // Main-thread-only.
    initializeHeapSnapshotSignalHandlers();
    // If the process is spawned with env NODE_CHANNEL_FD, it's probably
    // spawned by our child_process module, then initialize IPC.
    // This attaches some internal event listeners and creates:
    // process.send(), process.channel, process.connected,
    // process.disconnect().
    setupChildProcessIpcChannel();
    // If this is a worker in cluster mode, start up the communication
    // channel. This needs to be done before any user code gets executed
    // (including preload modules).
    initializeClusterIPC();

    // TODO(joyeecheung): do this for worker threads as well.
    runDeserializeCallbacks();
  } else {
    assert(!internalBinding('worker').isMainThread);
    // The setup should be called in LOAD_SCRIPT message handler.
    assert(!initializeModules);
  }
  var {
    initializeExtensionFormatMap
  } = require('internal/modules/esm/get_format');
  initializeExtensionFormatMap();
  setupVmModules();
  if (initializeModules) {
    initializeModuleLoaders({
      shouldSpawnLoaderHookWorker,
      shouldPreloadModules
    });
  }

  // This has to be done after the user module loader is initialized,
  // in case undici is externalized.
  setupHttpProxy();
  return mainEntry;
}
function setupVmModules() {
  // Patch the vm module when --experimental-vm-modules is on.
  // Please update the comments in vm.js when this block changes.
  // TODO(joyeecheung): move this to vm.js?
  if (getOptionValue('--experimental-vm-modules')) {
    var {
      Module,
      SourceTextModule,
      SyntheticModule
    } = require('internal/vm/module');
    var vm = require('vm');
    vm.Module = Module;
    vm.SourceTextModule = SourceTextModule;
    vm.SyntheticModule = SyntheticModule;
  }
}
function setupHttpProxy() {
  // This normalized from both --use-env-proxy and NODE_USE_ENV_PROXY settings.
  if (!getOptionValue('--use-env-proxy')) {
    return;
  }
  if (!process.env.HTTP_PROXY && !process.env.HTTPS_PROXY && !process.env.http_proxy && !process.env.https_proxy) {
    return;
  }
  var {
    setGlobalDispatcher,
    EnvHttpProxyAgent
  } = require('internal/deps/undici/undici');
  var envHttpProxyAgent = new EnvHttpProxyAgent();
  setGlobalDispatcher(envHttpProxyAgent);
  // For fetch, we need to set the global dispatcher from here.
  // For http/https agents, we'll configure the global agent when they are
  // actually created, in lib/_http_agent.js and lib/https.js.
  // TODO(joyeecheung): This is currently guarded with NODE_USE_ENV_PROXY and --use-env-proxy.
  // Investigate whether it's possible to enable it by default without stepping on other
  // existing libraries that sets the global dispatcher or monkey patches the global agent.
}
function initializeModuleLoaders(options) {
  var {
    shouldSpawnLoaderHookWorker,
    shouldPreloadModules
  } = options;
  // Initialize certain special module.Module properties and the CJS conditions.
  var {
    initializeCJS
  } = require('internal/modules/cjs/loader');
  initializeCJS();
  // Initialize the ESM loader and a few module callbacks.
  // If shouldSpawnLoaderHookWorker is true, later when the ESM loader is instantiated on-demand,
  // it will spawn a loader worker thread to handle async custom loader hooks.
  var {
    initializeESM
  } = require('internal/modules/esm/utils');
  initializeESM(shouldSpawnLoaderHookWorker);
  var {
    hasStartedUserCJSExecution,
    hasStartedUserESMExecution
  } = require('internal/modules/helpers');
  // At this point, no user module has been executed yet.
  assert(!hasStartedUserCJSExecution());
  assert(!hasStartedUserESMExecution());
  if (getEmbedderOptions().hasEmbedderPreload) {
    runEmbedderPreload();
  }
  // Do not enable preload modules if custom loaders are disabled.
  // For example, loader workers are responsible for doing this themselves.
  // And preload modules are not supported in ShadowRealm as well.
  if (shouldPreloadModules) {
    loadPreloadModules();
  }
  // Need to be done after --require setup.
  initializeFrozenIntrinsics();
}
function refreshRuntimeOptions() {
  refreshOptions();
}

/**
 * Patch the process object with legacy properties and normalizations.
 * Replace `process.argv[0]` with `process.execPath`, preserving the original `argv[0]` value as `process.argv0`.
 * Replace `process.argv[1]` with the resolved absolute file path of the entry point, if found.
 * @param {boolean} expandArgv1 - Whether to replace `process.argv[1]` with the resolved absolute file path of
 *   the main entry point.
 * @returns {string}
 */
function patchProcessObject(expandArgv1) {
  var binding = internalBinding('process_methods');
  binding.patchProcessObject(process);

  // Since we replace process.argv[0] below, preserve the original value in case the user needs it.
  ObjectDefineProperty(process, 'argv0', {
    __proto__: null,
    enumerable: true,
    // Only set it to true during snapshot building.
    configurable: isBuildingSnapshot(),
    value: process.argv[0]
  });
  process.exitCode = undefined;
  process._exiting = false;
  process.argv[0] = process.execPath;

  /** @type {string} */
  var mainEntry;
  // If requested, update process.argv[1] to replace whatever the user provided with the resolved absolute file path of
  // the entry point.
  if (expandArgv1 && process.argv[1] && process.argv[1][0] !== '-') {
    // Expand process.argv[1] into a full path.
    var path = require('path');
    try {
      mainEntry = path.resolve(process.argv[1]);
      process.argv[1] = mainEntry;
    } catch {
      // Continue regardless of error.
    }
  }

  // We need to initialize the global console here again with process.stdout
  // and friends for snapshot deserialization.
  var globalConsole = require('internal/console/global');
  var {
    initializeGlobalConsole
  } = require('internal/console/constructor');
  initializeGlobalConsole(globalConsole);

  // TODO(joyeecheung): most of these should be deprecated and removed,
  // except some that we need to be able to mutate during run time.
  addReadOnlyProcessAlias('_eval', '--eval');
  addReadOnlyProcessAlias('_print_eval', '--print');
  addReadOnlyProcessAlias('_syntax_check_only', '--check');
  addReadOnlyProcessAlias('_forceRepl', '--interactive');
  addReadOnlyProcessAlias('_preload_modules', '--require');
  addReadOnlyProcessAlias('noDeprecation', '--no-deprecation');
  addReadOnlyProcessAlias('noProcessWarnings', '--no-warnings');
  addReadOnlyProcessAlias('traceProcessWarnings', '--trace-warnings');
  addReadOnlyProcessAlias('throwDeprecation', '--throw-deprecation');
  addReadOnlyProcessAlias('profProcess', '--prof-process');
  addReadOnlyProcessAlias('traceDeprecation', '--trace-deprecation');
  addReadOnlyProcessAlias('_breakFirstLine', '--inspect-brk', false);
  addReadOnlyProcessAlias('_breakNodeFirstLine', '--inspect-brk-node', false);
  return mainEntry;
}
function addReadOnlyProcessAlias(name, option) {
  var enumerable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var value = getOptionValue(option);
  if (value) {
    ObjectDefineProperty(process, name, {
      __proto__: null,
      writable: false,
      configurable: true,
      enumerable,
      value
    });
  }
}
function setupWarningHandler() {
  var {
    onWarning,
    resetForSerialization
  } = require('internal/process/warning');
  if (getOptionValue('--warnings') && process.env.NODE_NO_WARNINGS !== '1') {
    process.on('warning', onWarning);

    // The code above would add the listener back during deserialization,
    // if applicable.
    if (isBuildingSnapshot()) {
      addSerializeCallback(() => {
        process.removeListener('warning', onWarning);
        resetForSerialization();
      });
    }
  }
}

// https://websockets.spec.whatwg.org/
function setupWebsocket() {
  if (getOptionValue('--no-experimental-websocket')) {
    delete globalThis.WebSocket;
    delete globalThis.CloseEvent;
  }
}

// https://html.spec.whatwg.org/multipage/server-sent-events.html
function setupEventsource() {
  if (!getOptionValue('--experimental-eventsource')) {
    delete globalThis.EventSource;
  }
}

// TODO(aduh95): move this to internal/bootstrap/web/* when the CLI flag is
//               removed.
function setupNavigator() {
  if (getEmbedderOptions().noBrowserGlobals || getOptionValue('--no-experimental-global-navigator')) {
    return;
  }

  // https://html.spec.whatwg.org/multipage/system-state.html#the-navigator-object
  exposeLazyInterfaces(globalThis, 'internal/navigator', ['Navigator']);
  defineReplaceableLazyAttribute(globalThis, 'internal/navigator', ['navigator'], false);
}
function setupFFI() {
  if (!getOptionValue('--experimental-ffi')) {
    return;
  }
  var {
    BuiltinModule
  } = require('internal/bootstrap/realm');
  BuiltinModule.allowRequireByUsers('ffi');
}
function setupSQLite() {
  if (getOptionValue('--no-experimental-sqlite')) {
    return;
  }
  var {
    BuiltinModule
  } = require('internal/bootstrap/realm');
  BuiltinModule.allowRequireByUsers('sqlite');
}
function initializeConfigFileSupport() {
  if (getOptionValue('--experimental-config-file')) {
    emitExperimentalWarning('--experimental-config-file');
  }
}
function setupStreamIter() {
  if (!getOptionValue('--experimental-stream-iter')) {
    return;
  }
  var {
    BuiltinModule
  } = require('internal/bootstrap/realm');
  BuiltinModule.allowRequireByUsers('stream/iter');
  BuiltinModule.allowRequireByUsers('zlib/iter');
}
function setupDTLS() {
  if (!getOptionValue('--experimental-dtls')) {
    return;
  }
  var {
    BuiltinModule
  } = require('internal/bootstrap/realm');
  BuiltinModule.allowRequireByUsers('dtls');
}
function setupQuic() {
  if (!getOptionValue('--experimental-quic')) {
    return;
  }
  var {
    BuiltinModule
  } = require('internal/bootstrap/realm');
  BuiltinModule.allowRequireByUsers('quic');
}
function setupVfs() {
  if (!getOptionValue('--experimental-vfs')) {
    return;
  }
  var {
    BuiltinModule
  } = require('internal/bootstrap/realm');
  BuiltinModule.allowRequireByUsers('vfs');
}
function setupWebStorage() {
  if (getEmbedderOptions().noBrowserGlobals || !getOptionValue('--experimental-webstorage')) {
    return;
  }

  // https://html.spec.whatwg.org/multipage/webstorage.html#webstorage
  exposeLazyInterfaces(globalThis, 'internal/webstorage', ['Storage']);

  // localStorage is non-enumerable when --localstorage-file is not provided
  // to avoid breaking {...globalThis} operations.
  var localStorageFile = getOptionValue('--localstorage-file');
  var lazyLocalStorage;
  ObjectDefineProperty(globalThis, 'localStorage', {
    __proto__: null,
    enumerable: localStorageFile !== '',
    configurable: true,
    get() {
      lazyLocalStorage ??= require('internal/webstorage').localStorage;
      return lazyLocalStorage;
    },
    set(value) {
      lazyLocalStorage = value;
    }
  });
  defineReplaceableLazyAttribute(globalThis, 'internal/webstorage', ['sessionStorage']);
}
function setupCodeCoverage() {
  // Resolve the coverage directory to an absolute path, and
  // overwrite process.env so that the original path gets passed
  // to child processes even when they switch cwd. Don't do anything if the
  // --experimental-test-coverage flag is present, as the test runner will
  // handle coverage.
  if (process.env.NODE_V8_COVERAGE && !getOptionValue('--experimental-test-coverage')) {
    process.env.NODE_V8_COVERAGE = setupCoverageHooks(process.env.NODE_V8_COVERAGE);
  }
}
function setupStacktracePrinterOnSigint() {
  if (!getOptionValue('--trace-sigint')) {
    return;
  }
  require('internal/util/trace_sigint').setTraceSigInt(true);
}
function initializeReport() {
  ObjectDefineProperty(process, 'report', {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      var {
        report
      } = require('internal/process/report');
      return report;
    }
  });
}
function setupDebugEnv() {
  require('internal/util/debuglog').initializeDebugEnv(process.env.NODE_DEBUG);
  if (getOptionValue('--expose-internals')) {
    require('internal/bootstrap/realm').BuiltinModule.exposeInternals();
  }
}

// This has to be called after initializeReport() is called
function initializeReportSignalHandlers() {
  if (getOptionValue('--report-on-signal')) {
    var {
      addSignalHandler
    } = require('internal/process/report');
    addSignalHandler();
  }
}
function initializeHeapSnapshotSignalHandlers() {
  var signal = getOptionValue('--heapsnapshot-signal');
  var diagnosticDir = getOptionValue('--diagnostic-dir');
  if (!signal) return;
  require('internal/validators').validateSignalName(signal);
  var {
    writeHeapSnapshot
  } = require('v8');
  function doWriteHeapSnapshot() {
    var heapSnapshotFilename = getHeapSnapshotFilename(diagnosticDir);
    writeHeapSnapshot(heapSnapshotFilename);
  }
  process.on(signal, doWriteHeapSnapshot);

  // The code above would add the listener back during deserialization,
  // if applicable.
  if (isBuildingSnapshot()) {
    addSerializeCallback(() => {
      process.removeListener(signal, doWriteHeapSnapshot);
    });
  }
}
function setupTraceCategoryState() {
  var {
    isTraceCategoryEnabled
  } = internalBinding('trace_events');
  var {
    toggleTraceCategoryState
  } = require('internal/process/per_thread');
  toggleTraceCategoryState(isTraceCategoryEnabled('node.async_hooks'));
}
function setupInspectorHooks() {
  // If Debugger.setAsyncCallStackDepth is sent during bootstrap,
  // we cannot immediately call into JS to enable the hooks, which could
  // interrupt the JS execution of bootstrap. So instead we save the
  // notification in the inspector agent if it's sent in the middle of
  // bootstrap, and process the notification later here.
  if (internalBinding('config').hasInspector) {
    var {
      enable,
      disable
    } = require('internal/inspector_async_hook');
    internalBinding('inspector').registerAsyncHook(enable, disable);
  }
}
function setupNetworkInspection() {
  if (internalBinding('config').hasInspector && getOptionValue('--experimental-network-inspection')) {
    var {
      enable,
      disable
    } = require('internal/inspector_network_tracking');
    internalBinding('inspector').setupNetworkTracking(enable, disable);
  }
}

// In general deprecations are initialized wherever the APIs are implemented,
// this is used to deprecate APIs implemented in C++ where the deprecation
// utilities are not easily accessible.
function initializeDeprecations() {
  var pendingDeprecation = getOptionValue('--pending-deprecation');

  // DEP0103: access to `process.binding('util').isX` type checkers
  // TODO(addaleax): Turn into a full runtime deprecation.
  var utilBinding = internalBinding('util');
  var types = require('internal/util/types');
  for (var name of ['isArrayBuffer', 'isArrayBufferView', 'isAsyncFunction', 'isDataView', 'isDate', 'isExternal', 'isMap', 'isMapIterator', 'isNativeError', 'isPromise', 'isRegExp', 'isSet', 'isSetIterator', 'isTypedArray', 'isUint8Array', 'isAnyArrayBuffer']) {
    utilBinding[name] = pendingDeprecation ? deprecate(types[name], 'Accessing native typechecking bindings of Node ' + 'directly is deprecated. ' + `Please use \`util.types.${name}\` instead.`, 'DEP0103') : types[name];
  }

  // TODO(joyeecheung): this is a legacy property exposed to process.
  // Now that we use the config binding to carry this information, remove
  // it from the process. We may consider exposing it properly in
  // process.features.
  var {
    noBrowserGlobals
  } = internalBinding('config');
  if (noBrowserGlobals) {
    ObjectDefineProperty(process, '_noBrowserGlobals', {
      __proto__: null,
      writable: false,
      enumerable: true,
      configurable: true,
      value: noBrowserGlobals
    });
  }
  if (pendingDeprecation) {
    process.binding = deprecate(process.binding, 'process.binding() is deprecated. ' + 'Please use public APIs instead.', 'DEP0111');
    process._tickCallback = deprecate(process._tickCallback, 'process._tickCallback() is deprecated', 'DEP0134');
  }
}
function setupChildProcessIpcChannel() {
  if (process.env.NODE_CHANNEL_FD) {
    var fd = NumberParseInt(process.env.NODE_CHANNEL_FD, 10);
    assert(fd >= 0);

    // Make sure it's not accidentally inherited by child processes.
    delete process.env.NODE_CHANNEL_FD;
    var serializationMode = process.env.NODE_CHANNEL_SERIALIZATION_MODE || 'json';
    delete process.env.NODE_CHANNEL_SERIALIZATION_MODE;
    require('child_process')._forkChild(fd, serializationMode);
    assert(process.send);
  }
}
function initializeClusterIPC() {
  if (process.argv[1] && process.env.NODE_UNIQUE_ID) {
    var cluster = require('cluster');
    cluster._setupWorker();
    // Make sure it's not accidentally inherited by child processes.
    delete process.env.NODE_UNIQUE_ID;
  }
}
function setupDiagnosticsChannel() {
  // Re-link native channels after snapshot deserialization since
  // JS references are cleared during serialization.
  var dc = require('diagnostics_channel');
  var dc_binding = internalBinding('diagnostics_channel');
  dc_binding.linkNativeChannel(name => dc.channel(name));
}
function initializePermission() {
  var permission = getOptionValue('--permission') || getOptionValue('--permission-audit');
  if (permission) {
    process.binding = function binding(_module) {
      throw new ERR_ACCESS_DENIED('process.binding');
    };
    // Guarantee path module isn't monkey-patched to bypass permission model
    ObjectFreeze(require('path'));
    var {
      has,
      drop
    } = require('internal/process/permission');
    var warnFlags = ['--allow-addons', '--allow-child-process', '--allow-inspector', '--allow-wasi', '--allow-worker'];
    if (process.config.variables.node_use_ffi) {
      warnFlags.splice(2, 0, '--allow-ffi');
    }
    for (var flag of warnFlags) {
      if (getOptionValue(flag)) {
        process.emitWarning(`The flag ${flag} must be used with extreme caution. ` + 'It could invalidate the permission model.', 'SecurityWarning');
      }
    }
    var warnCommaFlags = ['--allow-fs-read', '--allow-fs-write'];
    for (var _flag of warnCommaFlags) {
      var value = getOptionValue(_flag);
      if (value.length === 1 && value[0].includes(',')) {
        process.emitWarning(`The ${_flag} CLI flag has changed. ` + 'Passing a comma-separated list of paths is no longer valid. ' + 'Documentation can be found at ' + 'https://nodejs.org/api/permissions.html#file-system-permissions', 'Warning');
      }
    }
    var experimentalWarnFlags = ['--allow-net'];
    for (var _flag2 of experimentalWarnFlags) {
      if (getOptionValue(_flag2)) {
        process.emitWarning(`The flag ${_flag2} is under experimental phase.`, 'ExperimentalWarning');
      }
    }
    ObjectDefineProperty(process, 'permission', {
      __proto__: null,
      enumerable: true,
      configurable: false,
      value: {
        has,
        drop
      }
    });
  } else {
    var {
      availableFlags
    } = require('internal/process/permission');
    ArrayPrototypeForEach(availableFlags(), flag => {
      var value = getOptionValue(flag);
      if (value === true || value?.length) {
        throw new ERR_MISSING_OPTION('--permission');
      }
    });
  }
}
function initializeSourceMapsHandlers() {
  var {
    setSourceMapsSupport
  } = require('internal/source_map/source_map_cache');
  var enabled = getOptionValue('--enable-source-maps');
  setSourceMapsSupport(enabled, {
    __proto__: null,
    // TODO(legendecas): In order to smoothly improve the source map support,
    // skip source maps in node_modules and generated code with
    // `--enable-source-maps` in a semver major version.
    nodeModules: enabled,
    generatedCode: enabled
  });
}
function initializeFrozenIntrinsics() {
  if (getOptionValue('--frozen-intrinsics')) {
    emitExperimentalWarning('Frozen intristics');
    require('internal/freeze_intrinsics')();
  }
}
function runEmbedderPreload() {
  internalBinding('mksnapshot').runEmbedderPreload(process, require);
}
function loadPreloadModules() {
  // For user code, we preload modules if `-r` is passed
  var preloadModules = getOptionValue('--require');
  if (preloadModules && preloadModules.length > 0) {
    var {
      Module: {
        _preloadModules
      }
    } = require('internal/modules/cjs/loader');
    _preloadModules(preloadModules);
  }
}
function markBootstrapComplete() {
  internalBinding('performance').markBootstrapComplete();
}

// Sequence number for diagnostic filenames
var sequenceNumOfheapSnapshot = 0;

// To generate the HeapSnapshotFilename while using custom diagnosticDir
function getHeapSnapshotFilename(diagnosticDir) {
  if (!diagnosticDir) return undefined;
  var date = new Date();
  var year = DatePrototypeGetFullYear(date);
  var month = String(DatePrototypeGetMonth(date) + 1).padStart(2, '0');
  var day = String(DatePrototypeGetDate(date)).padStart(2, '0');
  var hours = String(DatePrototypeGetHours(date)).padStart(2, '0');
  var minutes = String(DatePrototypeGetMinutes(date)).padStart(2, '0');
  var seconds = String(DatePrototypeGetSeconds(date)).padStart(2, '0');
  var dateString = `${year}${month}${day}`;
  var timeString = `${hours}${minutes}${seconds}`;
  var pid = process.pid;
  var threadId = internalBinding('worker').threadId;
  var fileSequence = (++sequenceNumOfheapSnapshot).toString().padStart(3, '0');
  return `${diagnosticDir}/Heap.${dateString}.${timeString}.${pid}.${threadId}.${fileSequence}.heapsnapshot`;
}
module.exports = {
  initializeModuleLoaders,
  prepareMainThreadExecution,
  prepareWorkerThreadExecution,
  prepareShadowRealmExecution,
  prepareTestRunnerMainExecution,
  markBootstrapComplete,
  loadPreloadModules,
  initializeFrozenIntrinsics
};

