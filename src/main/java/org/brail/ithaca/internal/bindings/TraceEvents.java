package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeUint8Array;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TraceEvents {
  private static final Logger log = LoggerFactory.getLogger(TraceEvents.class);

  private Callable updateHandler;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var te = new TraceEvents();
    var o = cx.newObject(s);
    meth(o, s, "setTraceCategoryStateUpdateHandler", 1, te::setTraceCategoryStateUpdateHandler);
    meth(o, s, "isTraceCategoryEnabled", 0, TraceEvents::isTraceCategoryEnabled);
    meth(o, s, "getCategoryEnabledBuffer", 1, TraceEvents::getCategoryEnabledBuffer);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private Object setTraceCategoryStateUpdateHandler(
      Context cx, VarScope s, Object nt, Object[] args) {
    log.debug("setTraceCategoryStateUpdateHandler");
    assert args.length > 0;
    assert args[0] instanceof Callable;
    updateHandler = (Callable) args[0];
    return Undefined.instance;
  }

  private static Object isTraceCategoryEnabled(Context cx, VarScope s, Object nt, Object[] args) {
    log.debug("isTraceCategoryEnabled");
    return false;
  }

  private static Object getCategoryEnabledBuffer(Context cx, VarScope s, Object nt, Object[] args) {
    var b = (NativeUint8Array) cx.newObject(s, "Uint8Array", new Object[] {1});
    b.set(0, 0);
    return b;
  }
}
