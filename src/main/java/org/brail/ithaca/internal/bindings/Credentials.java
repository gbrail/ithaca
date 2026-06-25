package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class Credentials {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    // TODO eventually
    o.put("implementsPosixCredentials", o, false);
    // Do we need to implement "safeGetenv"?
    meth(o, s, "getTempDir", 0, Credentials::getTempDir);
    meth(o, s, "safeGetenv", 1, Credentials::safeGetenv);
    return o;
  }

  private static void meth(
          Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
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

  private static Object safeGetenv(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length > 0) {
      var name = ScriptRuntime.toString(args[0]);
      var v = System.getenv(name);
      if (v != null) {
        return v;
      }
    }
    return Undefined.instance;
  }
}
