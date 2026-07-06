package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class ProcessWrap {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var c = cx.newObject(s);
    Constants.populate(cx, s, c, NodeConstants.ProcessFlags.class);
    o.put("constants", o, c);
    return o;
  }
}
