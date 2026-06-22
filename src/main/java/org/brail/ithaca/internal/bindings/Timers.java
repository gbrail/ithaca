package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Timers {
  private static final Logger log = LoggerFactory.getLogger(Timers.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var t = new Timers();
    var o = cx.newObject(s);
    o.put("timeoutInfo", o, new IntArray(1).createObject(cx, s));
    o.put("immediateInfo", o, new IntArray(3).createObject(cx, s));
    o.put("setupTimers", o, new LambdaFunction(s, "setupTimers", 2, t::setupTimers));
    return o;
  }

  private Object setupTimers(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setupTimers");
    return Undefined.instance;
  }
}
