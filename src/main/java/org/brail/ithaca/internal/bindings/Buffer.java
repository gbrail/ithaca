package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Buffer {
  private static final Logger log = LoggerFactory.getLogger(Buffer.class);

  private Scriptable prototype;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var b = new Buffer();
    var o = cx.newObject(s);
    o.put(
        "setBufferPrototype",
        o,
        new LambdaFunction(s, "setBufferPrototype", 1, b::setBufferPrototype));
    o.put(
        "createUnsafeArrayBuffer",
        o,
        new LambdaFunction(s, "createUnsafeArrayBuffer", 1, b::createUnsafeArrayBuffer));
    o.put("setDetachKey", o, new LambdaFunction(s, "setDetachKey", 2, b::setDetachKey));
    return o;
  }

  private Object setBufferPrototype(Context cx, VarScope s, Object lt, Object[] args) {
    assert args.length > 0;
    assert args[0] instanceof Scriptable;
    this.prototype = (Scriptable) args[0];
    return Undefined.instance;
  }

  private Object createUnsafeArrayBuffer(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length < 1) {
      return Undefined.instance;
    }
    double len = ScriptRuntime.toNumber(args[0]);
    var b = new NativeArrayBuffer(len);
    b.setParentScope(s);
    b.setPrototype(prototype);
    return b;
  }

  private Object setDetachKey(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("setDetachKey {}: Does nothing for now", args[1]);
    return Undefined.instance;
  }
}
