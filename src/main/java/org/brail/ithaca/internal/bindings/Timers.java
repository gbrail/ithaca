package org.brail.ithaca.internal.bindings;

import java.util.concurrent.TimeUnit;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.brail.ithaca.internal.common.TimerData;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
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

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var t = new TimerData(e);
    e.setTimers(t);
    var o = cx.newObject(s);
    o.put("timeoutInfo", o, t.timeoutInfo().createObject(cx, s));
    o.put("immediateInfo", o, t.immediateInfo().createObject(cx, s));
    meth(o, s, "getLibuvNow", 0, (lcx, ls, lto, args) -> t.now());
    meth(o, s, "setupTimers", 2, (lcx, ls, lto, args) -> Timers.setupTimers(t, ls, args));
    meth(o, s, "scheduleTimer", 1, (lcx, ls, lto, args) -> Timers.scheduleTimer(t, args));
    meth(o, s, "toggleTimerRef", 1, (lcx, ls, lto, args) -> Timers.toggleTimerRef(t, args));
    meth(o, s, "toggleImmediateRef", 1, (lcx, ls, lto, args) -> Timers.toggleImmediateRef(t, args));
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object setupTimers(TimerData t, VarScope s, Object[] args) {
    log.debug("setupTimers");
    ArgUtils.checkArgs(2, args);
    t.setCallbacks((Callable) args[0], (Callable) args[1]);
    return Undefined.instance;
  }

  private static Object scheduleTimer(TimerData t, Object[] args) {
    ArgUtils.checkArgs(1, args);
    t.scheduleTimeout((long) ScriptRuntime.toNumber(args[0]), TimeUnit.MILLISECONDS);
    return Undefined.instance;
  }

  private static Object toggleTimerRef(TimerData t, Object[] args) {
    ArgUtils.checkArgs(1, args);
    t.setTimerRef(ScriptRuntime.toBoolean(args[0]));
    return Undefined.instance;
  }

  private static Object toggleImmediateRef(TimerData t, Object[] args) {
    ArgUtils.checkArgs(1, args);
    t.setImmediateRef(ScriptRuntime.toBoolean(args[0]));
    return Undefined.instance;
  }
}
