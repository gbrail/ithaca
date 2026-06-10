package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class Process extends ScriptableObject {
  public static Scriptable init(Context cx, VarScope scope) {
    // No descriptor for this yet, don't need it and don't want it
    // in global scope.
    return cx.newObject(scope);
  }

  @Override
  public String getClassName() {
    return "Process";
  }
}