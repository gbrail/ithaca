'use strict';

var {
  ArrayPrototypePushApply,
  ArrayPrototypeSome,
  FunctionPrototypeBind,
  ObjectDefineProperty,
  ObjectKeys,
  ObjectPrototypeHasOwnProperty,
  RegExpPrototypeExec,
  SafeWeakMap
} = primordials;
var {
  validatePort
} = require('internal/validators');
var permission = require('internal/process/permission');
var kMinPort = 1024;
var kMaxPort = 65535;
var kInspectArgRegex = /--inspect(?:-brk|-port)?|--debug-port/;
var kInspectMsgRegex = /Debugger listening on ws:\/\/\[?(.+?)\]?:(\d+)\/|For help, see: https:\/\/nodejs\.org\/en\/docs\/inspector|Debugger attached|Waiting for the debugger to disconnect\.\.\./;
var _isUsingInspector = new SafeWeakMap();
function isUsingInspector() {
  var execArgv = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.execArgv;
  if (!_isUsingInspector.has(execArgv)) {
    _isUsingInspector.set(execArgv, ArrayPrototypeSome(execArgv, arg => RegExpPrototypeExec(kInspectArgRegex, arg) !== null) || RegExpPrototypeExec(kInspectArgRegex, process.env.NODE_OPTIONS) !== null);
  }
  return _isUsingInspector.get(execArgv);
}
var debugPortOffset = 1;
function getInspectPort(inspectPort) {
  if (typeof inspectPort === 'function') {
    inspectPort = inspectPort();
  } else if (inspectPort == null) {
    inspectPort = process.debugPort + debugPortOffset;
    if (inspectPort > kMaxPort) inspectPort = inspectPort - kMaxPort + kMinPort - 1;
    debugPortOffset++;
  }
  validatePort(inspectPort);
  return inspectPort;
}
var session;
function sendInspectorCommand(cb, onError) {
  var {
    hasInspector
  } = internalBinding('config');
  if (!hasInspector) return onError();
  // Do not preview when the permission model is enabled
  // because this feature require access to the inspector,
  // which is unavailable in this case.
  if (permission.isEnabled()) return onError();
  var inspector = require('inspector');
  if (session === undefined) session = new inspector.Session();
  session.connect();
  try {
    return cb(session);
  } finally {
    session.disconnect();
  }
}
function isInspectorMessage(string) {
  return isUsingInspector() && RegExpPrototypeExec(kInspectMsgRegex, string) !== null;
}

// Create a special require function for the inspector command line API
function installConsoleExtensions(commandLineApi) {
  if (commandLineApi.require) {
    return;
  }
  var {
    tryGetCwd
  } = require('internal/process/execution');
  var CJSModule = require('internal/modules/cjs/loader').Module;
  var {
    makeRequireFunction
  } = require('internal/modules/helpers');
  var consoleAPIModule = new CJSModule('<inspector console>');
  var cwd = tryGetCwd();
  consoleAPIModule.paths = [];
  ArrayPrototypePushApply(consoleAPIModule.paths, CJSModule._nodeModulePaths(cwd));
  ArrayPrototypePushApply(consoleAPIModule.paths, CJSModule.globalPaths);
  commandLineApi.require = makeRequireFunction(consoleAPIModule);
}

// Wrap a console implemented by Node.js with features from the VM inspector
function wrapConsole(consoleFromNode) {
  var {
    consoleCall,
    console: consoleFromVM
  } = internalBinding('inspector');
  for (var key of ObjectKeys(consoleFromVM)) {
    // If global console has the same method as inspector console,
    // then wrap these two methods into one. Native wrapper will preserve
    // the original stack.
    if (ObjectPrototypeHasOwnProperty(consoleFromNode, key)) {
      consoleFromNode[key] = FunctionPrototypeBind(consoleCall, consoleFromNode, consoleFromVM[key], consoleFromNode[key]);
      ObjectDefineProperty(consoleFromNode[key], 'name', {
        __proto__: null,
        value: key
      });
    } else {
      // Add additional console APIs from the inspector
      consoleFromNode[key] = consoleFromVM[key];
    }
  }
}
module.exports = {
  getInspectPort,
  installConsoleExtensions,
  isInspectorMessage,
  isUsingInspector,
  sendInspectorCommand,
  wrapConsole
};

