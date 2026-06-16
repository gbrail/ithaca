package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class TaskQueue {
  private Callable tickCallback;
  private Callable promiseRejectCallback;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var tq = new TaskQueue();
    var o = cx.newObject(s);
    o.put(
        "enqueueMicrotask",
        o,
        new LambdaFunction(s, "enqueueMicrotask", 1, TaskQueue::enqueueMicrotask));
    o.put("setTickCallback", o, new LambdaFunction(s, "setTickCallback", 1, tq::setTickCallback));
    o.put("runMicrotasks", o, new LambdaFunction(s, "runMicrotasks", 1, TaskQueue::runMicrotasks));
    o.put(
        "setPromiseRejectCallback",
        o,
        new LambdaFunction(s, "setPromiseRejectCallback", 1, tq::setPromiseRejectCallback));
    // TODO: tickInfo, yeah there's a lot there
    var c = cx.newObject(s);
    c.put("kPromiseRejectWithNoHandler", c, 0);
    c.put("kPromiseHandlerAddedAfterReject", c, 1);
    c.put("kPromiseRejectAfterResolved", c, 2);
    c.put("kPromiseResolveAfterResolved", c, 3);
    c.put("promiseRejectEvents", o, c);
    return o;
  }

  private static Object enqueueMicrotask(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length > 0 && args[0] instanceof Callable c) {
      cx.enqueueMicrotask(() -> c.call(cx, s, null, ScriptRuntime.emptyArgs));
    }
    return Undefined.instance;
  }

  private Object setTickCallback(Context cx, VarScope s, Object to, Object[] args) {
    assert args.length > 0;
    assert args[0] instanceof Callable;
    tickCallback = (Callable) args[0];
    return Undefined.instance;
  }

  private static Object runMicrotasks(Context cx, VarScope s, Object to, Object[] args) {
    cx.processMicrotasks();
    return Undefined.instance;
  }

  private Object setPromiseRejectCallback(Context cx, VarScope s, Object to, Object[] args) {
    assert args.length > 0;
    assert args[0] instanceof Callable;
    // TODO we probably need to wire this up to Rhino's unhandled promise rejection support
    promiseRejectCallback = (Callable) args[0];
    return Undefined.instance;
  }
}
