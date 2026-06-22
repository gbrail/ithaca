package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Modules {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var cc = cx.newObject(s);
    cc.put("FAILED", cc, 0);
    cc.put("ENABLED", cc, 1);
    cc.put("ALREADY_ENABLED", cc, 2);
    cc.put("DISABLED", cc, 2);
    o.put("compileCacheStatus", o, cc);
    var ct = cx.newObject(s);
    ct.put("kCommonJS", ct, 0);
    ct.put("kESM", ct, 1);
    ct.put("kStrippedTypeScript", ct, 2);
    o.put("cachedCodeTypes", o, ct);
    return o;
  }
}
