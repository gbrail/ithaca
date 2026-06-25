package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ModuleWrap extends ScriptableObject {
  private static final Logger log = LoggerFactory.getLogger(ModuleWrap.class);

  private static final ClassDescriptor DESCRIPTOR;

  static {
    DESCRIPTOR = new ClassDescriptor.Builder("ModuleWrap", 0, ModuleWrap::js_constructor).build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var c = DESCRIPTOR.buildConstructor(cx, s, new ModuleWrap(), false);
    var o = cx.newObject(s);
    ScriptableObject.defineProperty(o, "ModuleWrap", c, 0);
    meth(
        o,
        s,
        "setImportModuleDynamicallyCallback",
        1,
        ModuleWrap::setImportModuleDynamicallyCallback);
    meth(
        o,
        s,
        "setInitializeImportMetaObjectCallback",
        1,
        ModuleWrap::setInitializeImportMetaObjectCallback);
    meth(o, s, "setImportMetaResolveInitializer", 1, ModuleWrap::setImportMetaResolveInitializer);
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

  private static Scriptable js_constructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object thisObj, Object[] args) {
    return new ModuleWrap();
  }

  private static Object setImportModuleDynamicallyCallback(
      Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setImportModuleDynamicallyCallback");
    return Undefined.instance;
  }

  private static Object setInitializeImportMetaObjectCallback(
      Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setInitializeImportMetaObjectCallback");
    return Undefined.instance;
  }

  private static Object setImportMetaResolveInitializer(
      Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setImportMetaResolveInitializer");
    return Undefined.instance;
  }
}
