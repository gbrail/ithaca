package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class Process extends ScriptableObject {
  private static final String CLASS_NAME = "Process";
  // TODO get from a properties file
  private static final String NODE_VERSION = "v24.0.0";
  private static final String ITHACA_VERSION = "0.0.1";
  // Technically in Java architecture doesn't matter
  private static final String ARCH = "x64";

  private String title;

  public static Process init(Context cx, VarScope s) {
    var p = new Process();
    p.setPrototype(new NativeObject());
    p.setParentScope(s);

    p.defineProperty("version", NODE_VERSION, 0);
    p.defineProperty("arch", ARCH, 0);
    String platform;
    String platName = System.getProperty("os.name", "unknown");
    if (platName.startsWith("Windows")) {
      platform = "win32";
    } else {
      platform = platName;
    }
    p.defineProperty("platform", platform, 0);
    // TODO maybe installation location?
    p.defineProperty("execPath", "/usr/bin/node", 0);

    var vers = cx.newObject(s);
    vers.put("node", vers, NODE_VERSION);
    vers.put("ithaca", vers, ITHACA_VERSION);
    vers.put("java", vers, System.getProperty("java.version", "unknown"));
    vers.put("java.vm", vers, System.getProperty("java.vm.version", "unknown"));
    ScriptableObject.defineProperty(p, "versions", vers, 0);

    var rel = cx.newObject(s);
    rel.put("name", rel, "ithaca");
    ScriptableObject.defineProperty(p, "release", rel, 0);

    // Kind of guessing at the length
    ScriptableObject.defineProperty(p, Util.EXIT_INFO, new IntArray(4).createObject(cx, s), 0);

    ScriptableObject.defineProperty(
        p, "_rawDebug", new LambdaFunction(s, "_rawDebug", 1, Process::rawDebug), 0);
    return p;
  }

  public static void patch(Environment e, Context cx, VarScope s, Object obj) {
    var p = LambdaConstructor.convertThisObject(obj, Process.class);

    // TODO can we actually set the process title in Java?
    p.defineProperty(
        "title",
        () -> p.title,
        (t) -> {
          p.title = ScriptRuntime.toString(t);
        },
        0);

    // TODO I doubt that we can get the pid in Java
    p.defineProperty("pid", 0, 0);

    // TODO pre-process arguments to "node arguments" and regular ones?
    if (e.argv() != null) {
      var argv = cx.newArray(s, e.argv().length);
      for (int i = 0; i < e.argv().length; i++) {
        argv.put(i, argv, e.argv()[i]);
      }
      p.defineProperty("argv", argv, 0);
    } else {
      p.defineProperty("argv", cx.newArray(s, 0), 0);
    }
    p.defineProperty("execArgv", cx.newArray(s, 0), 0);
  }

  public void installEnvironment(Context cx, VarScope s) {
    var e = new Env();
    e.setPrototype(new NativeObject());
    e.setParentScope(s);
    defineProperty("env", e, 0);
  }

  @Override
  public String getClassName() {
    return CLASS_NAME;
  }

  private static Object rawDebug(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length > 0) {
      String msg = ScriptRuntime.toString(args[0]);
      System.err.println(msg);
    }
    return Undefined.instance;
  }

  private static class Env extends ScriptableObject {
    @Override
    public String getClassName() {
      return "_Environment";
    }

    @Override
    public Object get(String name, Scriptable start) {
      var val = System.getenv(name);
      return val == null ? Undefined.instance : val;
    }
  }
}
