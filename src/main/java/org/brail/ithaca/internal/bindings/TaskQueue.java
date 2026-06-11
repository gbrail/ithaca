package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class TaskQueue {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("enqueueMicrotask", o, new LambdaFunction(s, "enqueueMicrotask", 1, TaskQueue::enqueueMicrotask));
    return o;
  }

  private static Object enqueueMicrotask(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length > 0 && args[0] instanceof Callable c) {
      cx.enqueueMicrotask(() -> c.call(cx, s, null, args));
    }
    return Undefined.instance;
  }
}
