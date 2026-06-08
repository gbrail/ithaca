package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class FakeAtomics extends ScriptableObject {
  private static final ClassDescriptor DESCRIPTOR;

  static {
    DESCRIPTOR = new ClassDescriptor.Builder("Atomics", 0, FakeAtomics::js_constructor).build();
  }

  public static void init(Context cx, VarScope scope) {
    DESCRIPTOR.buildConstructor(cx, scope, new FakeAtomics(), false);
  }

  @Override
  public String getClassName() {
    return "Atomics";
  }

  private static Scriptable js_constructor(
          Context cx, JSFunction f, Object nt, VarScope s, Object thisObj, Object[] args) {
    return new FakeAtomics();
  }
}