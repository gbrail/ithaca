package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.SignalHandle;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class SignalWrap {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var signal = new LambdaConstructor(s, "Signal", 0, SignalHandle::js_constructor);
    HandleWrap.initializeConstructor(signal, s);
    signal.definePrototypeMethod(s, "start", 0, SignalHandle::js_start);
    signal.definePrototypeMethod(s, "stop", 0, SignalHandle::js_stop);
    var o = cx.newObject(s);
    o.put("Signal", o, signal);
    return o;
  }
}
