package org.brail.ithaca.internal.bindings;

import java.util.Locale;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Config {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("hasDebugBuild", o, false);
    o.put("openSSLIsBoringSSL", o, false);
    // TODO we might need that to be true later
    o.put("hasOpenSSL", o, false);
    o.put("fipsMode", o, false);
    o.put("hasIntl", o, false);
    o.put("hasSmallICU", o, false);
    o.put("hasTracing", o, false);
    o.put("hasNodeOptions", o, false);
    o.put("hasInspector", o, false);
    o.put("noBrowserGlobals", o, true);
    // Size of pointer in bits
    o.put("bits", o, 64);
    o.put(
        "getDefaultLocale",
        o,
        new LambdaFunction(
            s, "getDefaultLocale", 0, (_, _, _, _) -> Locale.getDefault().toString()));
    return o;
  }
}
