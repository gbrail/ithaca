package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.UDPHandle;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class UdpWrap {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);

    var udp = new LambdaConstructor(s, "UDP", 0, (_, _, _) -> UDPHandle.js_constructor(e));
    initializeConstructor(cx, s, udp);
    o.put("UDP", o, udp);

    var c = cx.newObject(s);
    Constants.populate(cx, s, c, NodeConstants.UDPConstants.class);
    o.put("constants", o, c);
    return o;
  }

  static void initializeConstructor(Context cx, VarScope s, LambdaConstructor c) {
    StreamWrap.initializeConstructor(cx, s, c);
    // TODO lots of methods
  }
}
