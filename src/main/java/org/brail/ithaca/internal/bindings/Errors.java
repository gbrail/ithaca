package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Errors {
  public static Scriptable init(Context cx, VarScope s) {
    var o = cx.newObject(s);
    return o;
  }
}
