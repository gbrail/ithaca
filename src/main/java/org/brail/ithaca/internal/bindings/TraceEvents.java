package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.Undefined;

public class TraceEvents {
  private Callable updateHandler;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var te = new TraceEvents();
    var o = cx.newObject(s);
    o.put(
        "setTraceCategoryStateUpdateHandler",
        o,
        new LambdaFunction(
            s, "setTraceCategoryStateUpdateHandler", 1, te::setTraceCategoryStateUpdateHandler));
    return o;
  }

  private Object setTraceCategoryStateUpdateHandler(
      Context cx, VarScope s, Object nt, Object[] args) {
    assert args.length > 0;
    assert args[0] instanceof Callable;
    updateHandler = (Callable) args[0];
    return Undefined.instance;
  }
}
