package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class StringDecoder {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var enc = cx.newArray(s, new Object[]{
            // Order is important to matcn Node's constants
            "ascii",
            "utf8",
            "base64",
            "utf16le",
            "latin1",
            "hex",
            "buffer",
            "base64url",
    });
    o.put("encodings", o, enc);
    return o;
  }
}
