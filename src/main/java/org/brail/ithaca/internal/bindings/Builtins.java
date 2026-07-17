package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.Loader;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Builtins extends ScriptableObject {
  private static final Logger log = LoggerFactory.getLogger(Builtins.class);

  private static final String PROCESS_CONFIG =
"""
  {
    "variables": {}
  }
""";

  /**
   * Prefix for module to make it loadable as a function with parameters. Add no newline so line
   * numbers come out right.
   */
  private static final String MODULE_PREFIX =
      "function __initModule(exports, require, module, process, internalBinding,primordials) {";

  /**
   * Suffix for code wrapped with the prefix. Add newline in case last line starts with a "//"
   * comment.
   */
  private static final String MODULE_SUFFIX = "\n}; __initModule";

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = new Builtins();
    o.put("config", o, PROCESS_CONFIG);
    o.put("builtinIds", o, cx.newArray(s, Loader.get().internalModules().toArray()));
    o.put(
        "setInternalLoaders",
        o,
        new LambdaFunction(
            s, "setInternalLoaders", 2, (_, _, _, args) -> o.setInternalLoaders(e, args)));
    o.put("compileFunction", o, new LambdaFunction(s, "compileFunction", 1, o::compileFunction));
    return o;
  }

  @Override
  public String getClassName() {
    return "__Builtins";
  }

  /*
  private Builtins realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, Builtins.class);
  }
   */

  private Object setInternalLoaders(Environment e, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.typeError("not enough arguments");
    }
    if (args[0] instanceof Callable c) {
      e.setInternalBinding(c);
    }
    if (args[1] instanceof Callable c) {
      e.setRequireBuiltin(c);
    }
    log.debug("Set internal loaders");
    return Undefined.instance;
  }

  private Object compileFunction(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.typeError("not enough arguments");
    }
    var id = ScriptRuntime.toString(args[0]);
    try {
      var c = Loader.get().runWrappedFunction(cx, s, id + ".js", MODULE_PREFIX, MODULE_SUFFIX);
      log.debug("Compiled internal module {}", id);
      return c;
    } catch (NodeException e) {
      throw ScriptRuntime.constructError("Error", "Error loading internal module: " + e);
    }
  }
}
