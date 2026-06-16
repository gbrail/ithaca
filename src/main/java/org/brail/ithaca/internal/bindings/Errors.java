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

  public static final int EXIT_NO_FAILURE = 0;
  public static final int EXIT_GENERIC_USER_ERROR = 1;
  public static final int EXIT_INTERNAL_JS_PARSE_ERROR = 3;
  public static final int EXIT_INTERNAL_JS_EVALUATION_FAILURE = 4;
  public static final int EXIT_V8_FATAL_ERROR = 5;
  public static final int EXIT_INVALID_FATAL_EXCEPTION_MONKEY_PATCHING = 6;
  public static final int EXIT_EXCEPTION_IN_FATAL_EXCEPTION_HANDLER = 7;
  public static final int EXIT_INVALID_COMMAND_LINE_ARGUMENT = 9;
  public static final int EXIT_BOOTSTRAP_FAILURE = 10;
  public static final int EXIT_INVALID_COMMAND_LINE_ARGUMENT_2 = 12;
  public static final int EXIT_UNSETTLED_TOP_LEVEL_AWAIT = 13;
  public static final int EXIT_STARTUP_SNAPSHOT_FAILURE = 14;
  public static final int EXIT_ABORT = 134;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put(
        "setEnhanceStackForFatalException",
        o,
        new LambdaFunction(
            s, "setEnhanceStackForFatalException", 1, Errors::setEnhanceStackForFatalException));
    o.put(
        "setGetSourceMapErrorSource",
        o,
        new LambdaFunction(s, "setGetSourceMapErrorSource", 1, Errors::setGetSourceMapErrorSource));
    o.put(
        "setPrepareStackTraceCallback",
        o,
        new LambdaFunction(
            s, "setPrepareStackTraceCallback", 1, Errors::setPrepareStackTraceCallback));
    o.put(
        "setMaybeCacheGeneratedSourceMap",
        o,
        new LambdaFunction(
            s, "setMaybeCacheGeneratedSourceMap", 1, Errors::setMaybeCacheGeneratedSourceMap));
    o.put(
        "noSideEffectsToString",
        o,
        new LambdaFunction(s, "noSideEffectsToString", 1, Errors::noSideEffectsToString));
    o.put(
        "triggerUncaughtException",
        o,
        new LambdaFunction(s, "triggerUncaughtException", 1, Errors::triggerUncaughtException));
    o.put(
        "getErrorSourcePositions",
        o,
        new LambdaFunction(s, "getErrorSourcePositions", 1, Errors::getErrorSourcePositions));

    var ec = cx.newObject(s);
    ec.put("kNoFailure", ec, EXIT_NO_FAILURE);
    ec.put("kGenericUserError", ec, EXIT_GENERIC_USER_ERROR);
    ec.put("kInternalJSParseError", ec, EXIT_INTERNAL_JS_PARSE_ERROR);
    ec.put("kInternalJSEvaluationFailure", ec, EXIT_INTERNAL_JS_EVALUATION_FAILURE);
    ec.put("kV8FatalError", ec, EXIT_V8_FATAL_ERROR);
    ec.put(
        "kInvalidFatalExceptionMonkeyPatching", ec, EXIT_INVALID_FATAL_EXCEPTION_MONKEY_PATCHING);
    ec.put("kExceptionInFatalExceptionHandler", ec, EXIT_EXCEPTION_IN_FATAL_EXCEPTION_HANDLER);
    ec.put("kInvalidCommandLineArgument", ec, EXIT_INVALID_COMMAND_LINE_ARGUMENT);
    ec.put("kBootstrapFailure", ec, EXIT_BOOTSTRAP_FAILURE);
    ec.put("kInvalidCommandLineArgument2", ec, EXIT_INVALID_COMMAND_LINE_ARGUMENT_2);
    ec.put("kUnsettledTopLevelAwait", ec, EXIT_UNSETTLED_TOP_LEVEL_AWAIT);
    ec.put("kStartupSnapshotFailure", ec, EXIT_STARTUP_SNAPSHOT_FAILURE);
    ec.put("kAbort", ec, EXIT_ABORT);
    o.put("exitCodes", o, ec);

    return o;
  }

  private static Object setEnhanceStackForFatalException(
      Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("setEnhanceStackForFatalException");
    return Undefined.instance;
  }

  private static Object setGetSourceMapErrorSource(
      Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("setGetSourceMapErrorSource");
    return Undefined.instance;
  }

  private static Object setPrepareStackTraceCallback(
      Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("setPrepareStackTraceCallback");
    return Undefined.instance;
  }

  private static Object setMaybeCacheGeneratedSourceMap(
      Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("setMaybeCacheGeneratedSourceMap");
    return Undefined.instance;
  }

  private static Object noSideEffectsToString(Context cx, VarScope s, Object lt, Object[] args) {
    // This is supposed to call ToString without throwing, basically
    if (args.length > 0) {
      return ScriptRuntime.toString(args[0]);
    }
    return Undefined.instance;
  }

  private static Object triggerUncaughtException(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length > 0) {
      throw ScriptRuntime.constructError("Error", ScriptRuntime.toString(0));
    }
    return Undefined.instance;
  }

  private static Object getErrorSourcePositions(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("getErrorSourcePositions");
    return Undefined.instance;
  }
}
