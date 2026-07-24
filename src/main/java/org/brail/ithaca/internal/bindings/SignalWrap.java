package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.SignalHandle;
import org.mozilla.javascript.*;

public class SignalWrap {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var signal = new LambdaConstructor(s, "Signal", 0, (_, _, _) -> SignalHandle.js_constructor(e));
    HandleWrap.initializeConstructor(signal, s);
    signal.definePrototypeMethod(s, "start", 0, SignalHandle::js_start);
    signal.definePrototypeMethod(s, "stop", 0, SignalHandle::js_stop);
    signal.definePrototypeProperty(
        cx,
        "onsignal",
        SignalHandle::get_onSignal,
        SignalHandle::set_onSignal,
        ScriptableObject.DONTENUM);

    var o = cx.newObject(s);
    o.put("Signal", o, signal);
    return o;
  }
}
