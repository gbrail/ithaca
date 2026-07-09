package org.brail.ithaca.internal.bindings;

import java.util.function.Function;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeGenerator;
import org.mozilla.javascript.NativeMap;
import org.mozilla.javascript.NativePromise;
import org.mozilla.javascript.NativeSet;
import org.mozilla.javascript.NativeWeakMap;
import org.mozilla.javascript.NativeWeakSet;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.regexp.NativeRegExp;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;

public class Types {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    defineTypeFunc(s, o, "isArgumentsObject", (v) -> v instanceof NativeArray);
    defineTypeFunc(s, o, "isArrayBuffer", (v) -> v instanceof NativeArrayBuffer);
    defineTypeFunc(s, o, "isBigIntObject", (v) -> isScriptableClass(v, "BigInt"));
    defineTypeFunc(s, o, "isBooleanObject", (v) -> isScriptableClass(v, "Boolean"));
    defineTypeFunc(s, o, "isDate", (v) -> isScriptableClass(v, "Date"));
    defineTypeFunc(s, o, "isGeneratorFunction", (v) -> isScriptableClass(v, "GeneratorFunction"));
    defineTypeFunc(s, o, "isGeneratorObject", (v) -> v instanceof NativeGenerator);
    defineTypeFunc(s, o, "isMap", (v) -> v instanceof NativeMap);
    defineTypeFunc(s, o, "isMapIterator", (v) -> isScriptableClass(v, "Map Iterator"));
    defineTypeFunc(s, o, "isMap", (v) -> v instanceof NativeMap);
    defineTypeFunc(s, o, "isNativeError", (v) -> isScriptableClass(v, "Error"));
    defineTypeFunc(s, o, "isNumberObject", (v) -> isScriptableClass(v, "Number"));
    defineTypeFunc(s, o, "isPromise", (v) -> v instanceof NativePromise);
    defineTypeFunc(s, o, "isProxy", (v) -> isScriptableClass(v, "Proxy"));
    defineTypeFunc(s, o, "isRegExp", (v) -> v instanceof NativeRegExp);
    defineTypeFunc(s, o, "isSet", (v) -> v instanceof NativeSet);
    defineTypeFunc(s, o, "isSetIterator", (v) -> isScriptableClass(v, "Set Iterator"));
    defineTypeFunc(s, o, "isStringObject", (v) -> isScriptableClass(v, "String"));
    defineTypeFunc(s, o, "isSymbolObject", ScriptRuntime::isSymbol);
    defineTypeFunc(s, o, "isWeakMap", (v) -> v instanceof NativeWeakMap);
    defineTypeFunc(s, o, "isWeakSet", (v) -> v instanceof NativeWeakSet);
    // TODO when we implement shared array buffers
    defineTypeFunc(s, o, "isAnyArrayBuffer", (v) -> v instanceof NativeArrayBuffer);

    // TODOs
    defineTypeFunc(s, o, "isAsyncFunction", (_) -> false);
    defineTypeFunc(s, o, "isExternal", (_) -> false);
    defineTypeFunc(s, o, "isModuleNamespaceObject", (_) -> false);
    defineTypeFunc(s, o, "isSharedArrayBuffer", (v) -> false);

    defineTypeFunc(
        s,
        o,
        "isBoxedPrimitive",
        (v) -> {
          if (v instanceof ScriptableObject so) {
            switch (so.getClassName()) {
              case "Number":
              case "String":
              case "Boolean":
              case "BigInt":
              case "Symbol":
                return true;
              default:
                return false;
            }
          }
          return false;
        });

    return o;
  }

  private static boolean isScriptableClass(Object v, String name) {
    if (v instanceof ScriptableObject so) {
      return so.getClassName().equals(name);
    }
    return false;
  }

  private static void defineTypeFunc(
      VarScope s, Scriptable o, String name, Function<Object, Boolean> f) {
    o.put(
        name,
        o,
        new LambdaFunction(
            s,
            name,
            1,
            (_, _, _, args) -> {
              if (args.length > 0) {
                return f.apply(args[0]);
              }
              return false;
            }));
  }
}
