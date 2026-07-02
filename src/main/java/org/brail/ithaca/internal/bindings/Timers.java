package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Timers {
  private static final Logger log = LoggerFactory.getLogger(Timers.class);

  private Callable immediateCallback;
  private Callable timerCallback;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var t = new Timers();
    e.setTimers(t);
    var o = cx.newObject(s);
    o.put("timeoutInfo", o, new IntArray(1).createObject(cx, s));
    o.put("immediateInfo", o, new IntArray(3).createObject(cx, s));
    meth(o, s, "getLibuvNow", 0, Timers::getLibuvNow);
    meth(o, s, "setupTimers", 1, t::setupTimers);
    meth(o, s, "scheduleTimer", 1, t::scheduleTimer);
    meth(o, s, "toggleTimerRef", 1, t::toggleTimerRef);
    meth(o, s, "toggleImmediateRef", 1, t::toggleImmediateRef);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  public void processImmediate(Context cx, VarScope s) {
    assert immediateCallback != null;
    log.debug("processImmediate");
    immediateCallback.call(cx, s, null, ScriptRuntime.emptyArgs);
  }

  public void processTimers(Context cx, VarScope s) {
    assert timerCallback != null;
    log.debug("processTimers");
    long now = System.currentTimeMillis();
    timerCallback.call(cx, s, null, new Object[] {(double) now});
  }

  private static Timers realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, Timers.class);
  }

  private static Object getLibuvNow(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("getLibuvNow");
    return Undefined.instance;
  }

  private Object setupTimers(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setupTimers");
    assert args.length >= 2;
    immediateCallback = (Callable) args[0];
    timerCallback = (Callable) args[1];
    return Undefined.instance;
  }

  private Object scheduleTimer(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("scheduleTimer");
    return Undefined.instance;
  }

  private Object toggleTimerRef(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("toggleTimerRef");
    return Undefined.instance;
  }

  private Object toggleImmediateRef(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("toggleImmediateRef");
    return Undefined.instance;
  }
}
