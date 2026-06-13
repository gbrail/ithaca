package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class Messaging {
  private Callable createObjectFunction;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var m = new Messaging();
    var o = cx.newObject(s);
    o.put(
        "setDeserializerCreateObjectFunction",
        o,
        new LambdaFunction(
            s, "setDeserializerCreateObjectFunction", 1, m::setCreateObjectFunction));
    return o;
  }

  private Object setCreateObjectFunction(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length > 0 && args[0] instanceof Callable c) {
      createObjectFunction = c;
    }
    return Undefined.instance;
  }
}
