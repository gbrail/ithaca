package org.brail.ithaca.internal.common;

import org.mozilla.javascript.ScriptRuntime;

public class ArgUtils {
  public static void checkArgs(int required, Object[] args) {
    if (args.length < required) {
      throw ScriptRuntime.rangeError("Expected at least " + required + " arguments");
    }
  }

  public static <T> T getArg(Object[] args, int pos, Class<T> klass) {
    if (pos >= args.length) {
      throw ScriptRuntime.rangeError("Argument at index " + pos + " is missing");
    }
    Object arg = args[pos];
    if (!klass.isInstance(arg)) {
      throw ScriptRuntime.rangeError(
          "Argument at index " + pos + " is not of type " + klass.getSimpleName());
    }
    return klass.cast(arg);
  }
}
