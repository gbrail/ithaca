package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.mozilla.javascript.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ModuleWrap extends ScriptableObject {
  private static final Logger log = LoggerFactory.getLogger(ModuleWrap.class);

  private Callable initializeImportMetaObject;
  private Callable importModuleDynamically;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var module = new ModuleWrap();
    var wrap = new LambdaConstructor(s, "ModuleWrap", 0, ModuleWrap::js_constructor);
    wrap.definePrototypeMethod(s, "link", 0, ModuleWrap::link);
    wrap.definePrototypeMethod(s, "getModuleRequests", 1, ModuleWrap::getModuleRequests);
    wrap.definePrototypeMethod(s, "instantiate", 1, ModuleWrap::instantiate);
    wrap.definePrototypeMethod(s, "evaluateSync", 1, ModuleWrap::evaluateSync);
    wrap.definePrototypeMethod(s, "evaluate", 1, ModuleWrap::evaluate);
    wrap.definePrototypeMethod(s, "setExport", 1, ModuleWrap::setExport);
    wrap.definePrototypeMethod(s, "setModuleSourceObject", 1, ModuleWrap::setModuleSourceObject);
    wrap.definePrototypeMethod(s, "getModuleSourceObject", 0, ModuleWrap::getModuleSourceObject);
    wrap.definePrototypeMethod(s, "createCachedData", 1, ModuleWrap::createCachedData);
    wrap.definePrototypeMethod(s, "getNamespace", 0, ModuleWrap::getNamespace);
    wrap.definePrototypeMethod(s, "getStatus", 0, ModuleWrap::getStatus);
    wrap.definePrototypeMethod(s, "getError", 0, ModuleWrap::getError);

    // TODO hasAsyncGraph property?

    var o = cx.newObject(s);
    ScriptableObject.defineProperty(o, "ModuleWrap", wrap, 0);
    meth(o, s, "setImportModuleDynamicallyCallback", 1, module::setImportModuleDynamicallyCallback);
    meth(
        o,
        s,
        "setInitializeImportMetaObjectCallback",
        1,
        module::setInitializeImportMetaObjectCallback);
    meth(o, s, "setImportMetaResolveInitializer", 1, ModuleWrap::setImportMetaResolveInitializer);
    meth(o, s, "createRequiredModuleFacade", 1, ModuleWrap::createRequiredModuleFacade);
    meth(o, s, "throwIfPromiseRejected", 1, ModuleWrap::throwIfPromiseRejected);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  @Override
  public String getClassName() {
    return "ModuleWrap";
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

  private static Object throwIfPromiseRejected(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("throwIfPromiseRejected not implemented");
  }

  private static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new ModuleWrap();
  }

  private static Object link(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("link not implemented");
  }

  private static Object getModuleRequests(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getModuleRequests not implemented");
  }

  private static Object instantiate(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("instantiate not implemented");
  }

  private static Object evaluateSync(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("evaluateSync not implemented");
  }

  private static Object evaluate(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("evaluate not implemented");
  }

  private static Object setExport(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("setExport not implemented");
  }

  private static Object setModuleSourceObject(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("setModuleSourceObject not implemented");
  }

  private static Object getModuleSourceObject(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getModuleSourceObject not implemented");
  }

  private static Object createCachedData(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("createCachedData not implemented");
  }

  private static Object getNamespace(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getNamespace not implemented");
  }

  private static Object getStatus(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getStatus not implemented");
  }

  private static Object getError(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getError not implemented");
  }
}
