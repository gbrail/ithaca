package org.brail.ithaca.internal.common;

import java.util.HashMap;
import java.util.Map;
import org.brail.ithaca.internal.bindings.NodeConstants;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.RhinoException;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ModuleWrap extends ScriptableObject {
  private static final Logger log = LoggerFactory.getLogger(ModuleWrap.class);

  private Callable evalCallback;
  private Object moduleFacade;
  private final String url;
  private boolean synthetic;
  private String sourceText;
  private int status = NodeConstants.ModuleStatus.kUninstantiated;
  private Scriptable error;
  private boolean linked = false;
  private String[] exportNames;
  private final Map<String, Object> exports = new HashMap<>();

  private ModuleWrap(String url) {
    this.url = url;
  }

  @Override
  public String getClassName() {
    return "ModuleWrap";
  }

  /**
   * Constructor: dispatches between synthetic (CJS) and native ESM paths. Synthetic: new
   * ModuleWrap(url, context, exportNames[], callback[, cjsModule]) Native: new ModuleWrap(url,
   * context, source, lineOffset, columnOffset[, idSymbol])
   */
  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    ArgUtils.checkArgs(3, args);
    var url = ScriptRuntime.toString(args[0]);
    log.debug("Module wrap: {} {}", url, args[1]);

    if (!Undefined.isUndefined(args[1])) {
      throw ScriptRuntime.typeError("Module wrap with context no longer supported");
    }

    // Do we need to check for "array like" objects here?
    boolean synthetic = ScriptRuntime.isArrayObject(args[2]);
    if (synthetic) {
      ArgUtils.getArg(args, 3, Callable.class);
    } else {
      // TODO non-synthetic modules
      throw ScriptRuntime.typeError("Non-synthetic modules not supported");
    }

    // Pull export names from a JavaScript array, make this reusable at some point
    var ea = ScriptRuntime.toObject(s, args[2]);
    int eaLen = ScriptRuntime.toInt32(ea.get("length", ea));
    var exports = new String[eaLen];
    for (int i = 0; i < eaLen; i++) {
      exports[i] = ScriptRuntime.toString(ea.get(i, ea));
    }

    var wrap = new ModuleWrap(url);
    wrap.exportNames = exports;
    wrap.evalCallback = (Callable) args[3];
    if (args.length > 4 && !Undefined.isUndefined(args[4])) {
      wrap.moduleFacade = args[4];
    }
    wrap.synthetic = true;
    return wrap;
  }

  public static Object js_getModuleRequests(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    if (!self.synthetic) {
      throw ScriptRuntime.typeError("getModuleRequests: Only synthetic modules supported");
    }
    // TODO, only synthetic modules now
    return cx.newArray(s, 0);
  }

  /** link(depWraps[]) -- no-op for synthetic modules (no real imports). */
  public static Object js_link(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    log.debug("link: {}", args);
    if (!self.synthetic) {
      throw ScriptRuntime.typeError("getModuleRequests: Only synthetic modules supported");
    }
    self.linked = true;
    return Undefined.instance;
  }

  /** Rhino doesn't really need us to do anything special to instantiate */
  public static Object js_instantiate(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    if (!self.linked && !self.synthetic) {
      log.debug("module not linked yet");
      throw ScriptRuntime.typeError("module is not linked");
    }
    self.status = NodeConstants.ModuleStatus.kInstantiated;
    log.debug("Instantiated");
    return Undefined.instance;
  }

  /** Async evaluation. Called by ESM loader path (await module.evaluate()). Returns a promise. */
  public static Object js_evaluate(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    log.debug("evaluate");
    if (self.status < NodeConstants.ModuleStatus.kInstantiated) {
      throw ScriptRuntime.typeError("module is not instantiated");
    }
    if (!self.canEvaluate()) {
      throw ScriptRuntime.typeError("module has already been evaluated, or cannot be evaluated");
    }

    if (!self.synthetic) {
      throw ScriptRuntime.typeError("Only synthetic modules are supported now");
    }
    assert self.evalCallback != null;

    self.status = NodeConstants.ModuleStatus.kEvaluating;

    var p = PromiseAdapter.uninitialized(cx, s);
    cx.enqueueMicrotask(
        () -> {
          try {
            // TODO unable to handle a top-level await
            log.debug("Evaluating...");
            self.evalCallback.call(cx, s, self, ScriptRuntime.emptyArgs);
            self.status = NodeConstants.ModuleStatus.kEvaluated;
            log.debug("Evaluation successful");
            p.fulfill(cx, s, cx.newObject(s));
          } catch (RhinoException re) {
            self.status = NodeConstants.ModuleStatus.kErrored;
            log.debug("Evaluation error: {}: stack {}", re.getMessage(), re.getStackTrace());
            var err = self.captureError(cx, s, re);
            p.reject(cx, s, err);
          }
        });

    return p;
  }

  /** Synchronous evaluation. Called by require(CJS) path. */
  public static Object js_evaluateSync(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    log.debug("evaluateSync");
    if (self.status < NodeConstants.ModuleStatus.kInstantiated) {
      throw ScriptRuntime.typeError("module is not instantiated");
    }
    if (!self.canEvaluate()) {
      throw ScriptRuntime.typeError("module has already been evaluated, or cannot be evaluated");
    }

    if (!self.synthetic) {
      throw ScriptRuntime.typeError("Only synthetic modules are supported now");
    }
    assert self.evalCallback != null;

    self.status = NodeConstants.ModuleStatus.kEvaluating;

    try {
      // TODO unable to handle a top-level await
      self.evalCallback.call(cx, s, self, ScriptRuntime.emptyArgs);
      self.status = NodeConstants.ModuleStatus.kEvaluated;
      log.debug("Evaluation successful");
    } catch (RhinoException re) {
      self.status = NodeConstants.ModuleStatus.kErrored;
      log.debug("Evaluation error: {}: stack {}", re.getMessage(), re.getStackTrace());
      self.captureError(cx, s, re);
      // Re-throw so Rhino propagates it as a JS error.
      throw re;
    }

    return js_getNamespace(cx, s, to, ScriptRuntime.emptyArgs);
  }

  public static Object js_createCachedData(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("createCachedData not implemented");
  }

  /** Returns a namespace object with all setExport entries as properties. */
  public static Object js_getNamespace(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    if (self.status < NodeConstants.ModuleStatus.kInstantiated) {
      throw ScriptRuntime.typeError("namespace of uninitialized module cannot be accessed");
    }

    var ns = cx.newObject(s, null);
    for (Map.Entry<String, Object> entry : self.exports.entrySet()) {
      ns.put(entry.getKey(), ns, entry.getValue());
    }
    return ns;
  }

  public static Object js_getStatus(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    return self.status;
  }

  public static Object js_getError(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    if (self.error != null) {
      return self.error;
    }
    return Undefined.instance;
  }

  public static Object js_setExport(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    ArgUtils.checkArgs(2, args);
    String name = ScriptRuntime.toString(args[0]);
    self.exports.put(name, args[1]);
    return Undefined.instance;
  }

  public static Object js_setModuleSourceObject(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    self.sourceText = ScriptRuntime.toString(args[0]);
    return Undefined.instance;
  }

  public static Object js_getModuleSourceObject(Context cx, VarScope s, Object to, Object[] args) {
    var self = LambdaConstructor.convertThisObject(to, ModuleWrap.class);
    if (self.sourceText != null) {
      return self.sourceText;
    }
    return Undefined.instance;
  }

  /** Store the JS error object from a RhinoException and transition to kErrored. */
  private Scriptable captureError(Context cx, VarScope s, RhinoException e) {
    Object msg = (e.getMessage() == null ? e.toString() : e.getMessage());
    error = cx.newObject(s, "Error", new Object[] {msg});
    return error;
  }

  private boolean canEvaluate() {
    return status >= NodeConstants.ModuleStatus.kInstantiated
        && status != NodeConstants.ModuleStatus.kEvaluated
        && status != NodeConstants.ModuleStatus.kErrored;
  }
}
