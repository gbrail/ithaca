package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

import static org.mozilla.javascript.ClassDescriptor.Destination.PROTO;

public class Process extends ScriptableObject {
  private static final String NODE_VERSION = "24.0.0";
  private static final String ITHACA_VERSION = "0.0.1";

  private static final ClassDescriptor DESCRIPTOR;

  static {
    DESCRIPTOR = new ClassDescriptor.Builder("Process", 0, Process::js_constructor).build();
  }

  public static Scriptable init(Context cx, VarScope s) {
    // Give "process" a real prototype because it gets used more like
    // a proper class than other binding objects.
    var proto = new Process();
    var c = DESCRIPTOR.buildConstructor(cx, s, proto, false);
    var o = c.construct(cx, s, ScriptRuntime.emptyArgs);
    o.setPrototype(proto);
    o.setParentScope(s);

    // Define instance properties the easy way
    ScriptableObject.defineProperty(o, "version", NODE_VERSION, DONTENUM);
    var vers = cx.newObject(s);
    vers.put("node", vers, NODE_VERSION);
    vers.put("ithaca", vers, ITHACA_VERSION);
    ScriptableObject.defineProperty(o, "versions", vers, DONTENUM);
    // Kind of guessing at the length
    ScriptableObject.defineProperty(
        o, Util.EXIT_INFO, new IntArray(4).createObject(cx, s), DONTENUM);
    return o;
  }

  @Override
  public String getClassName() {
    return "Process";
  }

  private static Scriptable js_constructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    return new Process();
  }
}
