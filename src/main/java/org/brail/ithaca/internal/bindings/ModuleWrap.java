package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class ModuleWrap extends ScriptableObject {
  private static final ClassDescriptor DESCRIPTOR;

  static {
    DESCRIPTOR = new ClassDescriptor.Builder("ModuleWrap", 0, ModuleWrap::js_constructor).build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var c = DESCRIPTOR.buildConstructor(cx, s, new ModuleWrap(), false);
    var o = cx.newObject(s);
    ScriptableObject.defineProperty(o, "ModuleWrap", c, 0);
    return o;
  }

  @Override
  public String getClassName() {
    return "ModuleWrap";
  }

  private static Scriptable js_constructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object thisObj, Object[] args) {
    return new ModuleWrap();
  }
}
