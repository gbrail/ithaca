package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Timers {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("timeoutInfo", o, new IntArray(1).createObject(cx, s));
    o.put("immediateInfo", o, new IntArray(3).createObject(cx, s));
    return o;
  }
}
