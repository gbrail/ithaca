package org.brail.ithaca.internal.bindings;

import java.nio.file.Path;
import java.util.regex.Pattern;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Symbol;
import org.mozilla.javascript.SymbolKey;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Contextify {
  private static final Logger log = LoggerFactory.getLogger(Contextify.class);

  private static final SymbolKey CONTEXT_DATA = new SymbolKey("ContextData", Symbol.Kind.REGULAR);
  private static final Pattern ESM_IMPORT = Pattern.compile("(?m)^[ \\t]*import[\\s\\n]");
  private static final Pattern ESM_EXPORT = Pattern.compile("(?m)^[ \\t]*export[\\s\\n{]");
  private static final Pattern TOP_LEVEL_VAR =
      Pattern.compile(
          "(?m)^[ \\t]*(const|let|var)\\s+(module|exports|require|__filename|__dirname)\\s*=");

  record ContextInfo(String name, String origin, VarScope scope) {}

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "makeContext", 7, Contextify::makeContext);
    meth(o, s, "compileFunction", 10, Contextify::compileFunction);
    meth(o, s, "compileFunctionForCJSLoader", 4, Contextify::compileFunctionForCJSLoader);
    meth(o, s, "containsModuleSyntax", 1, Contextify::containsModuleSyntax);
    meth(o, s, "startSigintWatchdog", 1, Contextify::startSigintWatchdog);
    meth(o, s, "stopSigintWatchdog", 1, Contextify::stopSigintWatchdog);
    meth(o, s, "watchdogHasPendingSigint", 1, Contextify::watchdogHasPendingSigint);
    meth(o, s, "measureMemory", 1, Contextify::measureMemory);

    var script = new LambdaConstructor(s, "ContextifyScript", 0, Contextify::js_script_constructor);
    script.definePrototypeMethod(s, "createCachedData", 1, ContextifyScript::createCachedData);
    script.definePrototypeMethod(s, "runInContext", 1, ContextifyScript::runInContext);
    o.put("ContextifyScript", o, script);

    // Technically these are "per context" and not "per isolate" in case that matters
    var constants = cx.newObject(s);
    var mm = cx.newObject(s);
    var mode = cx.newObject(s);
    mode.put("SUMMARY", mode, 0);
    mode.put("DETAILED", mode, 1);
    mm.put("mode", mm, mode);
    var execution = cx.newObject(s);
    execution.put("DEFAULT", execution, 0);
    execution.put("EAGER", execution, 1);
    mm.put("execution", mm, execution);
    constants.put("measureMemory", constants, mm);
    o.put("constants", o, constants);

    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  public static Scriptable makeContext(Context cx, VarScope s, Object to, Object[] args) {
    ScriptableObject contextObj = null;
    boolean isVanilla = false;

    ArgUtils.checkArgs(7, args);
    if (args[0] instanceof ScriptableObject so) {
      if (so.has(NodeConstants.PrivateSymbols.contextify_context_private_symbol, so)) {
        log.debug("Contextifying a contextified object which I thought was not OK");
        // throw ScriptRuntime.typeError("Object already contextified");
      }
      contextObj = so;
    } else if (args[0] instanceof Symbol) {
      contextObj = (ScriptableObject) cx.newObject(s);
    } else {
      throw ScriptRuntime.typeError("No object supplied");
    }

    String name = ScriptRuntime.toString(args[1]);
    String origin = ScriptRuntime.toString(args[2]);
    boolean allowEval = ScriptRuntime.toBoolean(args[3]);
    if (ScriptRuntime.toBoolean(args[4])) {
      log.debug("WASM requested but it won't be supported");
    }
    if (ScriptRuntime.toBoolean(args[5])) {
      throw ScriptRuntime.typeError("Separate microtask queue is not supported");
    }

    log.debug("Creating new context {} for {}", name, origin);
    var scope = cx.initSafeStandardObjects();
    var ctx = new ContextInfo(name, origin, scope);
    contextObj.put(CONTEXT_DATA, contextObj, ctx);
    contextObj.put(
        NodeConstants.PrivateSymbols.contextify_context_private_symbol, contextObj, true);
    return contextObj;
  }

  public static Scriptable compileFunctionForCJSLoader(
      Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(3, args);
    String code = ScriptRuntime.toString(args[0]);
    String filename = ScriptRuntime.toString(args[1]);
    boolean isSeaMain = ScriptRuntime.toBoolean(args[2]);
    // boolean shouldDetectModule = ScriptRuntime.toBoolean(args[3]);
    if (isSeaMain) {
      throw ScriptRuntime.constructError("Error", "Single-executable modules not supported");
    }
    // TODO not implemented: 5th option "host defined option"

    log.debug(
        "Compiling function (length {}) for CJS loader from {}",
        code != null ? code.length() : 0,
        filename);
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
    throw ScriptRuntime.typeError("compileFunction not implemented");
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
    log.debug("containsModuleSyntax");

    if (ESM_IMPORT.matcher(stripped).find()) return true;
    if (ESM_EXPORT.matcher(stripped).find()) return true;
    if (stripped.contains("import.meta")) return true;
    if (TOP_LEVEL_VAR.matcher(stripped).find()) return true;

    return false;
  }

  private static String stripStringsAndComments(String code) {
    log.debug("stripStringsAndComments");
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

  private static Scriptable js_script_constructor(Context cx, VarScope s, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String code = ScriptRuntime.toString(args[0]);
    String filename = ScriptRuntime.toString(args[1]);
    int firstLine = 1;
    ContextInfo context = null;
    if (args.length > 2) {
      if (args.length != 8) {
        throw ScriptRuntime.rangeError("Not enough arguments");
      }
      firstLine += ScriptRuntime.toInt32(args[2]);
      // Ignoring column offset, cached data stuff, hostDefinedOptionId
      if (args[6] instanceof ScriptableObject so) {
        var ci = so.get(CONTEXT_DATA, so);
        if (ci != Scriptable.NOT_FOUND) {
          context = (ContextInfo) ci;
        } else {
          throw ScriptRuntime.typeError("Supplied context does not have context data");
        }
      }
    }

    log.debug("Creating script for {} starting at {}", filename, firstLine);
    var scriptScope = s;
    if (context != null) {
      scriptScope = context.scope();
    }
    return new ContextifyScript(scriptScope, code, filename, firstLine);
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

    static Object createCachedData(Context cx, VarScope s, Object to, Object[] args) {
      throw ScriptRuntime.typeError("createCachedData not implemented");
    }

    static Object runInContext(Context cx, VarScope s, Object to, Object[] args) {
      ArgUtils.checkArgs(5, args);
      var self = LambdaConstructor.convertThisObject(to, ContextifyScript.class);
      var scope = self.scope;
      if (args[0] instanceof ScriptableObject so) {
        var ci = so.get(CONTEXT_DATA, so);
        if (ci != Scriptable.NOT_FOUND) {
          var context = (ContextInfo) ci;
          scope = context.scope();
          log.debug("Running in context {}", context.name());
        } else {
          throw ScriptRuntime.typeError("Supplied context does not have context data");
        }
      } else if (args[0] != null) {
        throw ScriptRuntime.typeError("Context argument must be object or null");
      }
      log.debug("Running script from {}", self.filename);
      // Wait do we wrap the code here?
      var result = cx.evaluateString(self.scope, self.code, self.filename, self.firstLine, null);
      log.debug("Result: {}", result);
      return result;
    }
  }
}
