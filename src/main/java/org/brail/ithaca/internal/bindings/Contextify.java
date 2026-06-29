package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.VarScope;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class Contextify {

  private static final Pattern ESM_IMPORT = Pattern.compile("(?m)^[ \\t]*import[\\s\\n]");
  private static final Pattern ESM_EXPORT = Pattern.compile("(?m)^[ \\t]*export[\\s\\n{]");
  private static final Pattern TOP_LEVEL_VAR = Pattern.compile("(?m)^[ \\t]*(const|let|var)\\s+(module|exports|require|__filename|__dirname)\\s*=");

  private static final ClassDescriptor SCRIPT_DESCRIPTOR = new ClassDescriptor.Builder(
      "ContextifyScript", 0, Contextify::js_script_constructor).build();

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "compileFunctionForCJSLoader", 2, Contextify::compileFunctionForCJSLoader);
    meth(o, s, "containsModuleSyntax", 1, Contextify::containsModuleSyntax);
    meth(o, s, "compileFunction", 10, Contextify::compileFunction);

    o.put("ContextifyScript", o, SCRIPT_DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));

    return o;
  }

  private static void meth(
          Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  public static Scriptable compileFunctionForCJSLoader(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String code = ScriptRuntime.toString(args[0]);
    String filename = "";
    if (args.length > 1) {
      filename = ScriptRuntime.toString(args[1]);
    }
    boolean isSeaMain = false;
    if (args.length > 2) {
      isSeaMain = Boolean.TRUE.equals(Context.toBoolean(args[2]));
    }
    boolean shouldDetectModule = false;
    if (args.length > 3) {
      shouldDetectModule = Boolean.TRUE.equals(Context.toBoolean(args[3]));
    }

    final String prefix = "(function(exports, require, module, __filename, __dirname) { ";
    final String suffix = "\n});";
    String wrapped = prefix + code + suffix;

    Object result = cx.evaluateString(s, wrapped, filename, 1, null);
    if (!(result instanceof Callable callable)) {
      throw ScriptRuntime.typeError("Source failed to compile as a function: " + filename);
    }

    var resObj = cx.newObject(s);
    resObj.put("function", resObj, callable);
    return resObj;
  }

  public static Object compileFunction(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("compileFunction not implemented");
    /*if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String code = ScriptRuntime.toString(args[0]);
    String filename = (args.length > 1) ? ScriptRuntime.toString(args[1]) : "";
    
    // Params are typically the 9th argument in internal/vm.js's call to native compileFunction
    // Signature: code, filename, lineOffset, columnOffset, cachedData, produceCachedData, parsingContext, contextExtensions, params...
    Scriptable params = null;
    if (args.length >= 9 && args[8] instanceof Scriptable) {
      params = (Scriptable) args[8];
    }

    String paramList = "";
    if (params != null) {
      List<String> names = new ArrayList<>();
      Object lenObj = params.get("length", params);
      int length = 0;
      if (lenObj instanceof Number n) {
        length = n.intValue();
      } else if (lenObj instanceof String s) {
        try {
          length = Integer.parseInt(s);
        } catch (NumberFormatException ignored) {}
      }

      for (int i = 0; i < length; i++) {
        names.add(ScriptRuntime.toString(params.get(String.valueOf(i), params)));
      }
      paramList = String.join(", ", names);
    }

    final String prefix = "(function(" + paramList + ") { ";
    final String suffix = "\n});";
    String wrapped = prefix + code + suffix;

    Object result = cx.evaluateString(s, wrapped, filename, 1, null);
    if (!(result instanceof Callable callable)) {
      throw ScriptRuntime.typeError("Source failed to compile as a function: " + filename);
    }

    var resObj = cx.newObject(s);
    resObj.put("function", resObj, callable);
    return resObj;*/
  }

  public static Object containsModuleSyntax(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String code = ScriptRuntime.toString(args[0]);
    String stripped = stripStringsAndComments(code);

    if (ESM_IMPORT.matcher(stripped).find()) return true;
    if (ESM_EXPORT.matcher(stripped).find()) return true;
    if (stripped.contains("import.meta")) return true;
    if (TOP_LEVEL_VAR.matcher(stripped).find()) return true;

    return false;
  }

  private static String stripStringsAndComments(String code) {
    var matcher = Pattern.compile("(/\\/[^\\n]*)|(/\\*[\\s\\S]*?\\*/)|(\"(?:[^\"\\\\\\\\]|\\\\\\\\.)*\")|('(?:[^'\\\\\\\\]|\\\\\\\\.)*')|(`(?:[^`\\\\\\\\n]|\\\\\\\\.)*`)")
        .matcher(code);
    return matcher.replaceAll(m -> " ".repeat(m.group().length()));
  }

  private static Scriptable js_script_constructor(
          Context cx, org.mozilla.javascript.JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String code = ScriptRuntime.toString(args[0]);
    String filename = (args.length > 1) ? ScriptRuntime.toString(args[1]) : "";

    var script = new ContextifyScript(cx, s);
    script.put("source", script, code);
    script.put("filename", script, filename);
    return script;
  }

  public static class ContextifyScript extends org.mozilla.javascript.ScriptableObject {
    private final Context cx;
    private final VarScope s;

    public ContextifyScript(Context cx, VarScope s) {
      this.cx = cx;
      this.s = s;
    }

    @Override
    public String getClassName() {
      return "ContextifyScript";
    }
  }
}
