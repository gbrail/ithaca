package org.brail.ithaca.internal.bindings;

import static org.mozilla.javascript.ClassDescriptor.Destination.PROTO;

import java.nio.file.Path;
import java.util.regex.Pattern;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Contextify {
  private static final Logger log = LoggerFactory.getLogger(Contextify.class);

  private static final Pattern ESM_IMPORT = Pattern.compile("(?m)^[ \\t]*import[\\s\\n]");
  private static final Pattern ESM_EXPORT = Pattern.compile("(?m)^[ \\t]*export[\\s\\n{]");
  private static final Pattern TOP_LEVEL_VAR =
      Pattern.compile(
          "(?m)^[ \\t]*(const|let|var)\\s+(module|exports|require|__filename|__dirname)\\s*=");

  private static final ClassDescriptor SCRIPT_DESCRIPTOR;

  static {
    SCRIPT_DESCRIPTOR =
        new ClassDescriptor.Builder("ContextifyScript", 0, Contextify::js_script_constructor)
            .withMethod(PROTO, "createCachedData", 1, ContextifyScript::createCachedData)
            .withMethod(PROTO, "runInContext", 1, ContextifyScript::runInContext)
            .build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "makeContext", 7, Contextify::makeContext);
    o.put(
        "ContextifyScript",
        o,
        SCRIPT_DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    meth(o, s, "compileFunction", 10, Contextify::compileFunction);
    meth(o, s, "compileFunctionForCJSLoader", 4, Contextify::compileFunctionForCJSLoader);
    meth(o, s, "containsModuleSyntax", 1, Contextify::containsModuleSyntax);
    meth(o, s, "startSigintWatchdog", 1, Contextify::startSigintWatchdog);
    meth(o, s, "stopSigintWatchdog", 1, Contextify::stopSigintWatchdog);
    meth(o, s, "watchdogHasPendingSigint", 1, Contextify::watchdogHasPendingSigint);
    meth(o, s, "measureMemory", 1, Contextify::measureMemory);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  public static Scriptable makeContext(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("makeContext not implemented");
  }

  public static Scriptable compileFunctionForCJSLoader(
      Context cx, VarScope s, Object to, Object[] args) {
    if (args.length < 4) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String code = ScriptRuntime.toString(args[0]);
    String filename = ScriptRuntime.toString(args[1]);
    boolean isSeaMain = ScriptRuntime.toBoolean(args[2]);
    // boolean shouldDetectModule = ScriptRuntime.toBoolean(args[3]);
    if (isSeaMain) {
      throw ScriptRuntime.constructError("Error", "Single-executable modules not supported");
    }
    // TODO not implemented: 5th option "host defined option"

    log.debug("Compiling function for CJS loader from {}", filename);
    Object result = cx.evaluateString(s, wrapFunctionCode(code), filename, 1, null);
    if (!(result instanceof Callable callable)) {
      throw ScriptRuntime.typeError("Source failed to compile as a function: " + filename);
    }

    // TODO fall back if it is a module, recompile in CJS mode

    var r = cx.newObject(s);
    r.put("cachedDataRejected", r, false);
    r.put("canParseAsESM", r, false);
    r.put("function", r, callable);
    r.put("sourceURL", r, getSourceURL(filename));
    // TODO sourceMapURL
    return r;
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
    var matcher =
        Pattern.compile(
                "(/\\/[^\\n"
                    + "]*)|(/\\*[\\s\\S]*?\\*/)|(\"(?:[^\"\\\\\\\\]|\\\\\\\\.)*\")|('(?:[^'\\\\\\\\]|\\\\\\\\.)*')|(`(?:[^`\\\\\\\\n"
                    + "]|\\\\\\\\.)*`)")
            .matcher(code);
    return matcher.replaceAll(m -> " ".repeat(m.group().length()));
  }

  public static Object startSigintWatchdog(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("startSigintWatchdog not implemented");
  }

  public static Object stopSigintWatchdog(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("stopSigintWatchdog not implemented");
  }

  public static Object watchdogHasPendingSigint(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("watchdogHasPendingSigint not implemented");
  }

  public static Object measureMemory(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("measureMemory not implemented");
  }

  private static Scriptable js_script_constructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String code = ScriptRuntime.toString(args[0]);
    String filename = ScriptRuntime.toString(args[1]);
    int firstLine = 1;
    if (args.length > 2) {
      if (args.length != 8) {
        throw ScriptRuntime.rangeError("Not enough arguments");
      }
      firstLine += ScriptRuntime.toInt32(args[2]);
      // Ignoring column offset, cached data stuff, hostDefinedOptionId
      if (!Undefined.isUndefined(args[6])) {
        throw new AssertionError("Contexts are not supported");
      }
    }

    log.debug("Creating script for {} starting at {}", filename, firstLine);
    var script = new ContextifyScript(s, code, filename, firstLine);
    script.setPrototype((Scriptable) f.getPrototypeProperty());
    script.setParentScope(f.getDeclarationScope());
    return script;
  }

  private static Object getSourceURL(String filename) {
    if (filename != null && !filename.isEmpty()) {
      return Path.of(filename).toUri().toString();
    }
    return Undefined.instance;
  }

  private static String wrapFunctionCode(String code) {
    final String prefix = "(function(exports, require, module, __filename, __dirname) { ";
    final String suffix = "\n});";
    return prefix + code + suffix;
  }

  public static class ContextifyScript extends ScriptableObject {
    ;
    private final VarScope scope;
    private final String code;
    private final String filename;
    private final int firstLine;

    public ContextifyScript(VarScope s, String code, String filename, int firstLine) {
      this.scope = s;
      this.code = code;
      this.filename = filename;
      this.firstLine = firstLine;
    }

    @Override
    public String getClassName() {
      return "ContextifyScript";
    }

    static Object createCachedData(
        Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
      throw new AssertionError("createCachedData not implemented");
    }

    static Object runInContext(
        Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
      if (args.length < 5) {
        throw ScriptRuntime.rangeError("Not enough arguments");
      }
      if (args[0] != null) {
        throw new AssertionError("Contexts are not supported");
      }
      var self = LambdaConstructor.convertThisObject(to, ContextifyScript.class);
      log.debug("Running script from {}", self.filename);
      // Wait do we wrap the code here?
      var result = cx.evaluateString(self.scope, self.code, self.filename, self.firstLine, null);
      return result;
    }
  }
}
