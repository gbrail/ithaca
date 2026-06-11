package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Errors {
  private static final Logger log = LoggerFactory.getLogger(Errors.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("setEnhanceStackForFatalException", o,
            new LambdaFunction(s, "setEnhanceStackForFatalException", 1, Errors::setEnhanceStackForFatalException));
    o.put("setGetSourceMapErrorSource", o,
            new LambdaFunction(s, "setGetSourceMapErrorSource", 1, Errors::setGetSourceMapErrorSource));
    o.put("setPrepareStackTraceCallback", o,
            new LambdaFunction(s, "setPrepareStackTraceCallback", 1, Errors::setPrepareStackTraceCallback));
    o.put("setMaybeCacheGeneratedSourceMap", o,
            new LambdaFunction(s, "setMaybeCacheGeneratedSourceMap", 1, Errors::setMaybeCacheGeneratedSourceMap));
    o.put("noSideEffectsToString", o,
            new LambdaFunction(s, "noSideEffectsToString", 1, Errors::noSideEffectsToString));
    o.put("triggerUncaughtException", o,
            new LambdaFunction(s, "triggerUncaughtException", 1, Errors::triggerUncaughtException));
    o.put("getErrorSourcePositions", o,
            new LambdaFunction(s, "getErrorSourcePositions", 1, Errors::getErrorSourcePositions));
    // TODO make this more interesting and configurable later
    var ec = cx.newObject(s);
    ec.put("kGenericUserError", ec, 100);
    o.put("exitCodes", o, ec);
    return o;
  }

  private static Object setEnhanceStackForFatalException(Context cx,
                                                         VarScope s, Object lt, Object[] args) {
    log.debug("setEnhanceStackForFatalException");
    return Undefined.instance;
  }

  private static Object setGetSourceMapErrorSource(Context cx,
                                                         VarScope s, Object lt, Object[] args) {
    log.debug("setGetSourceMapErrorSource");
    return Undefined.instance;
  }

  private static Object setPrepareStackTraceCallback(Context cx,
                                                         VarScope s, Object lt, Object[] args) {
    log.debug("setPrepareStackTraceCallback");
    return Undefined.instance;
  }

  private static Object setMaybeCacheGeneratedSourceMap(Context cx,
                                                     VarScope s, Object lt, Object[] args) {
    log.debug("setMaybeCacheGeneratedSourceMap");
    return Undefined.instance;
  }
  private static Object noSideEffectsToString(Context cx,
                                                        VarScope s, Object lt, Object[] args) {
    // This is supposed to call ToString without throwing, basically
    if (args.length > 0) {
      return ScriptRuntime.toString(args[0]);
    }
    return Undefined.instance;
  }

  private static Object triggerUncaughtException(Context cx,
                                                        VarScope s, Object lt, Object[] args) {
    if (args.length > 0) {
      throw ScriptRuntime.constructError("Error", ScriptRuntime.toString(0));
    }
    return Undefined.instance;
  }

  private static Object getErrorSourcePositions(Context cx,
                                                        VarScope s, Object lt, Object[] args) {
    log.debug("getErrorSourcePositions");
    return Undefined.instance;
  }

}

