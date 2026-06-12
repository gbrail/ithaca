package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class AsyncContextFrame {
  private Object embedderData;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var f = new AsyncContextFrame();
    var o = cx.newObject(s);
    o.put("setContinuationPreservedEmbedderData", o, new LambdaFunction(s, "setContinuationPreservedEmbedderData",
            1, f::setContinuationPreservedEmbedderData));
    o.put("getContinuationPreservedEmbedderData", o, new LambdaFunction(s, "getContinuationPreservedEmbedderData",
            0, f::getContinuationPreservedEmbedderData));
    return o;
  }

  private Object setContinuationPreservedEmbedderData(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length > 0) {
      embedderData = args[0];
    }
    return Undefined.instance;
  }

  private Object getContinuationPreservedEmbedderData(Context cx, VarScope s, Object lt, Object[] args) {
    return embedderData;
  }
}
