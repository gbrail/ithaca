package org.brail.ithaca.internal.common;

import org.mozilla.javascript.ScriptRuntime;

public class ArgUtils {
  public static void checkArgs(int required, Object[] args) {
    if (args.length < required) {
      throw ScriptRuntime.typeError("Expected at least " + required + " arguments");
    }
  }
}
