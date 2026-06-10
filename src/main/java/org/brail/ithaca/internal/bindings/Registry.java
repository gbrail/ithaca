package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.VarScope;

import java.util.Collection;
import java.util.HashMap;

public class Registry {
  private static final Registry INSTANCE = new Registry();

  private final HashMap<String, InternalBinding> bindings = new HashMap<>();

  public static Registry get() {
    return INSTANCE;
  }

  private Registry() {
    bindings.put("builtins", Builtins::init);
    bindings.put("errors", Errors::init);
    bindings.put("module_wrap", ModuleWrap::init);
  }

  public Collection<String> bindingNames() {
    return bindings.keySet();
  }

  public Callable internalBinding(Context cx, VarScope scope) {
    //var b = JSDescriptor<JSFunction>.builder();
    return new LambdaFunction(scope, "internalBinding", 1,
            (lcx, ls, _lt, args) -> {
              if (args.length < 1) {
                throw ScriptRuntime.constructError("Error", "Binding name must be provided");
              }
              var name = ScriptRuntime.toString(args[0]);
              var binding = get().bindings.get(name);
              if (binding == null) {
                throw ScriptRuntime.constructError("Error",
                        "Internal binding \"" + name + "\" not found");
              }
              return binding.init(lcx, ls);
            });
  }

  public Callable linkedBinding(Context cx, VarScope scope) {
    //var b = JSDescriptor<JSFunction>.builder();
    return new LambdaFunction(scope, "linkedBinding", 1,
            (_lcx, _ls, _lt, args) -> {
              if (args.length < 1) {
                throw ScriptRuntime.constructError("Error", "Binding name must be provided");
              }
              var name = ScriptRuntime.toString(args[0]);
              // TODO build a registry for these based on ServiceLoader
              throw ScriptRuntime.constructError("Error",
                      "Linked binding \"" + name + "\" not found");
            });
  }
}
