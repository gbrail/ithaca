package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.Loader;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class Builtins extends ScriptableObject {
  private Callable internalBinding;
  private Callable requireBuiltin;

  public static Scriptable init(Context cx, VarScope s) {
    var o = new Builtins();
    o.put("builtinIds", o, cx.newArray(s, Loader.get().internalModules().toArray()));
    o.put("setInternalLoaders", o, new LambdaFunction(s, "setInternalLoaders",
            2, o::setInternalLoaders));
    o.put("compileFunction", o, new LambdaFunction(s, "compileFunction",
            1, o::compileFunction));
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

  private Object setInternalLoaders(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.typeError("not enough arguments");
    }
    if (args[0] instanceof Callable c) {
      this.internalBinding = c;
    }
    if (args[1] instanceof Callable c) {
      this.requireBuiltin = c;
    }
    return Undefined.instance;
  }

  private Object compileFunction(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length < 1) {
      throw  ScriptRuntime.typeError("not enough arguments");
    }
    var id = ScriptRuntime.toString(args[0]);
    try {
      var c = Loader.get().runWrappedFunction(cx, s, id,
              "function __initModule(exports, require, module, process, internalBinding, primordials) {",
              "}; __initModule;");
      return c;
    } catch (NodeException e) {
      throw ScriptRuntime.constructError("Error", "Error loading internal module: " + e);
    }
  }
}
