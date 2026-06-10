package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Errors {
  private static final Logger log = LoggerFactory.getLogger(Errors.class);

  public static Scriptable init(Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("setEnhanceStackForFatalException", o,
            new LambdaFunction(s, "setEnhanceStackForFatalException", 1, Errors::setEnhanceStackForFatalException));
    o.put("setPrepareStackTraceCallback", o,
            new LambdaFunction(s, "setPrepareStackTraceCallback", 1, Errors::setPrepareStackTraceCallback));
    return o;
  }

  private static Object setEnhanceStackForFatalException(Context cx,
                                                         VarScope s, Object lt, Object[] args) {
    log.debug("setEnhanceStackForFatalException");
    return Undefined.instance;
  }

  private static Object setPrepareStackTraceCallback(Context cx,
                                                         VarScope s, Object lt, Object[] args) {
    log.debug("setPrepareStackTraceCallback");
    return Undefined.instance;
  }
}

