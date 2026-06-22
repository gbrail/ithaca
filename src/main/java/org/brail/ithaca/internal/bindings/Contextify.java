package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Contextify {
  private static final ClassDescriptor SCRIPT_DESCRIPTOR;

  static {
    SCRIPT_DESCRIPTOR = new ClassDescriptor.Builder("ContextifyScript", 0, Contextify::js_script_constructor).build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("ContextifyScript", o, SCRIPT_DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    return o;
  }

  private static Scriptable js_script_constructor(
          Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    throw new AssertionError("ContextifyScript not implemented");
  }
}
