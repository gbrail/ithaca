package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.VarScope;

public class StringDecoder {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    Constants.populate(cx, s, o, NodeConstants.StringDecoder.class);
    var enc =
        cx.newArray(
            s,
            new Object[] {
              // Order is important to match Node's constants
              "ascii", "utf8", "base64", "utf16le", "latin1", "hex", "buffer", "base64url",
            });
    o.put("encodings", o, enc);
    o.put("kSize", o, NodeConstants.StringDecoder.kNumFields + 1);

    meth(o, s, "decode", 1, StringDecoder::decode);
    meth(o, s, "flush", 0, StringDecoder::flush);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object decode(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("decode not implemented");
  }

  private static Object flush(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("flush not implemented");
  }
}
