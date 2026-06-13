package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Symbol;
import org.mozilla.javascript.SymbolKey;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

import java.util.Map;

public class Util {
  public static final SymbolKey ARROW_MESSAGE = new SymbolKey("ArrowMessage", Symbol.Kind.REGULAR);
  public static final SymbolKey DECORATED = new SymbolKey("Decorated", Symbol.Kind.REGULAR);
  public static final SymbolKey EXIT_INFO = new SymbolKey("ExitInfo", Symbol.Kind.REGULAR);

  private static final Map<String, Integer> CONSTANTS =
      Constants.loadConstantsFromResource("util_constants.txt");

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var syms = cx.newObject(s);
    syms.put("arrow_message_private_symbol", syms, ARROW_MESSAGE);
    syms.put("decorated_private_symbol", syms, DECORATED);
    syms.put("exit_info_private_symbol", syms, EXIT_INFO);
    o.put("privateSymbols", o, syms);
    o.put("constants", o, Constants.makeConstantObject(cx, s, CONSTANTS));

    o.put(
        "constructSharedArrayBuffer",
        o,
        new LambdaFunction(s, "constructSharedArrayBuffer", 1, Util::constructSharedArrayBuffer));
    o.put("guessHandleType", o, new LambdaFunction(s, "guessHandleType", 1, Util::guessHandleType));
    o.put(
        "defineLazyProperties",
        o,
        new LambdaFunction(
            s,
            "defineLazyProperties",
            3,
            (lcx, ls, _, args) -> defineLazyProperties(e, lcx, ls, args)));
    o.put("sleep", o, new LambdaFunction(s, "sleep", 1, Util::sleep));
    return o;
  }

  private static Object constructSharedArrayBuffer(
      Context cx, VarScope s, Object lt, Object[] args) {
    throw ScriptRuntime.typeError("No shared array buffers yet");
  }

  private static Object guessHandleType(Context cx, VarScope s, Object lt, Object[] args) {
    // No handle types yet
    return 0;
  }

  /**
   * Follow the node behavior. When invoked as (obj, moduleName, [properties]), then when any of
   * "properties" are looked up on "obj", we must load the "moduleName" module and assign the named
   * property from the result of the module loading to the target object.
   */
  private static Object defineLazyProperties(Environment e, Context cx, VarScope s, Object[] args) {
    if (args.length < 3) {
      throw ScriptRuntime.typeError("Not enough arguments");
    }
    var target = (ScriptableObject) ScriptRuntime.toObject(s, args[0]);
    var moduleName = ScriptRuntime.toString(args[1]);
    var propNames = ScriptRuntime.toObject(s, args[2]);
    int numPropNames = ScriptRuntime.toInt32(propNames.get("length", propNames));
    int attrs = 0;
    if (args.length > 3 && !ScriptRuntime.toBoolean(args[3])) {
      // If last argument "enumerable" is false
      attrs = ScriptableObject.DONTENUM;
    }
    for (var i = 0; i < numPropNames; i++) {
      var name = ScriptRuntime.toString(propNames.get(i, propNames));
      target.defineProperty(name, () -> getLazyValue(e, s, moduleName, name), (_) -> {}, attrs);
    }
    return Undefined.instance;
  }

  private static Object getLazyValue(
      Environment e, VarScope s, String moduleName, String propertyName) {
    var cx = Context.getCurrentContext();
    var exports = e.requireBuiltin().call(cx, s, null, new Object[] {moduleName});
    if (exports instanceof Scriptable so) {
      return so.get(propertyName, so);
    }
    return Undefined.instance;
  }

  private static Object sleep(Context cx, VarScope s, Object lt, Object[] args) {
    throw ScriptRuntime.typeError("No sleep yet");
  }
}
