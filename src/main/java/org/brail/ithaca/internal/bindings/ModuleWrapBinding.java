package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.brail.ithaca.internal.common.ModuleWrap;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ModuleWrapBinding {
  private static final Logger log = LoggerFactory.getLogger(ModuleWrapBinding.class);

  private Callable initializeImportMetaObject;
  private Callable importModuleDynamically;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var module = new ModuleWrapBinding();
    var wrap = new LambdaConstructor(s, "ModuleWrap", 0, ModuleWrap::js_constructor);
    wrap.definePrototypeMethod(s, "link", 1, ModuleWrap::js_link);
    wrap.definePrototypeMethod(s, "getModuleRequests", 1, ModuleWrap::js_getModuleRequests);
    wrap.definePrototypeMethod(s, "instantiate", 1, ModuleWrap::js_instantiate);
    wrap.definePrototypeMethod(s, "evaluateSync", 2, ModuleWrap::js_evaluateSync);
    wrap.definePrototypeMethod(s, "evaluate", 2, ModuleWrap::js_evaluate);
    wrap.definePrototypeMethod(s, "setExport", 2, ModuleWrap::js_setExport);
    wrap.definePrototypeMethod(s, "setModuleSourceObject", 1, ModuleWrap::js_setModuleSourceObject);
    wrap.definePrototypeMethod(s, "getModuleSourceObject", 0, ModuleWrap::js_getModuleSourceObject);
    wrap.definePrototypeMethod(s, "createCachedData", 1, ModuleWrap::js_createCachedData);
    wrap.definePrototypeMethod(s, "getNamespace", 0, ModuleWrap::js_getNamespace);
    wrap.definePrototypeMethod(s, "getStatus", 0, ModuleWrap::js_getStatus);
    wrap.definePrototypeMethod(s, "getError", 0, ModuleWrap::js_getError);

    var o = cx.newObject(s);
    ScriptableObject.defineProperty(o, "ModuleWrap", wrap, 0);
    Constants.populate(cx, s, o, NodeConstants.ModuleStatus.class);
    Constants.populate(cx, s, o, NodeConstants.ModulePhase.class);
    meth(o, s, "setImportModuleDynamicallyCallback", 1, module::setImportModuleDynamicallyCallback);
    meth(
        o,
        s,
        "setInitializeImportMetaObjectCallback",
        1,
        module::setInitializeImportMetaObjectCallback);
    meth(
        o,
        s,
        "setImportMetaResolveInitializer",
        1,
        ModuleWrapBinding::setImportMetaResolveInitializer);
    meth(o, s, "createRequiredModuleFacade", 1, ModuleWrapBinding::createRequiredModuleFacade);
    meth(o, s, "throwIfPromiseRejected", 1, ModuleWrapBinding::throwIfPromiseRejected);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private Object setImportModuleDynamicallyCallback(
      Context cx, VarScope s, Object to, Object[] args) {
    importModuleDynamically = ArgUtils.getArg(args, 0, Callable.class);
    return Undefined.instance;
  }

  private Object setInitializeImportMetaObjectCallback(
      Context cx, VarScope s, Object to, Object[] args) {
    initializeImportMetaObject = ArgUtils.getArg(args, 0, Callable.class);
    return Undefined.instance;
  }

  private static Object setImportMetaResolveInitializer(
      Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setImportMetaResolveInitializer not implemented");
    return Undefined.instance;
  }

  private static Object createRequiredModuleFacade(
      Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("createRequiredModuleFacade not implemented");
  }

  // TODO: Implement for CJS→ESM interop. For now no-op.
  private static Object throwIfPromiseRejected(Context cx, VarScope s, Object to, Object[] args) {
    return Undefined.instance;
  }
}
