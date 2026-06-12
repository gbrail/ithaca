package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Symbol;
import org.mozilla.javascript.SymbolKey;
import org.mozilla.javascript.VarScope;

public class Util {
  private static final SymbolKey ARROW_MESSAGE = new SymbolKey("ArrowMessage", Symbol.Kind.REGULAR);
  private static final SymbolKey DECORATED = new SymbolKey("Decorated", Symbol.Kind.REGULAR);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var syms = cx.newObject(s);
    syms.put("arrow_message_private_symbol", syms,
            ARROW_MESSAGE);
    syms.put("decorated_private_symbol", syms,
            DECORATED);
    o.put("privateSymbols", o, syms);

    var c = cx.newObject(s);
    c.put("kPending", c, 0);
    c.put("kFulfilled", c, 1);
    c.put("kRejected", c, 2);
    c.put("kExiting", c, 0);
    c.put("kExitCode", c, 1);
    c.put("kHasExitCode", c, 2);
    c.put("kExitInfoFieldCount", c, 3);
    c.put("ALL_PROPERTIES", c, 0);
    c.put("ONLY_WRITABLE", c, 1);
    c.put("ONLY_ENUMERABLE", c, 2);
    c.put("ONLY_CONFIGURABLE", c, 4);
    c.put("SKIP_STRINGS", c, 8);
    c.put("SKIP_SYMBOLS", c, 16);
    o.put("constants", o, c);

    o.put("constructSharedArrayBuffer", o, new LambdaFunction(s, "constructSharedArrayBuffer", 1,
            Util::constructSharedArrayBuffer));
    o.put("guessHandleType", o, new LambdaFunction(s, "guessHandleType", 1,
            Util::guessHandleType));
    o.put("defineLazyProperties", o, new LambdaFunction(s, "defineLazyProperties", 3,
            Util::defineLazyProperties));
    o.put("sleep", o, new LambdaFunction(s, "sleep", 1,
            Util::sleep));
    return o;
  }

  private static Object constructSharedArrayBuffer(Context cx, VarScope s, Object lt, Object[] args) {
    throw ScriptRuntime.typeError("No shared array buffers yet");
  }

  private static Object guessHandleType(Context cx, VarScope s, Object lt, Object[] args) {
    // No handle types yet
    return 0;
  }

  private static Object defineLazyProperties(Context cx, VarScope s, Object lt, Object[] args) {
    throw ScriptRuntime.typeError("No lazy properties yet");
  }

  private static Object sleep(Context cx, VarScope s, Object lt, Object[] args) {
    throw ScriptRuntime.typeError("No sleep yet");
  }
}
