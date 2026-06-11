package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class Credentials {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    // TODO eventually
    o.put("implementsPosixCredentials", o, false);
    // Do we need to implement "safeGetenv"?
    o.put("getTempDir", o, new LambdaFunction(s, "getTempDir", 0, Credentials::getTempDir));
    return o;
  }

  private static Object getTempDir(Context cx, VarScope s, Object lt, Object[] args) {
    String v = System.getenv("TEMPDIR");
    if (v == null) {
      v = System.getenv("TMP");
    }
    if (v == null) {
      v = System.getenv("TEMP");
    }
    return v == null ? Undefined.instance : v;
  }
}
