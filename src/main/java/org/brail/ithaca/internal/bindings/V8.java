package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class V8 {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    // This one in particular will never work. Just define enough so that
    // test bootstrapping will not fail.
    var o = cx.newObject(s);
    o.put("kHeapSpaces", o, cx.newArray(s, 0));
    var dl = cx.newObject(s);
    dl.put("BRIEF", dl, 0);
    dl.put("DETAILED", dl, 1);
    o.put("detailLevel", o, dl);
    return o;
  }
}
