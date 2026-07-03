package org.brail.ithaca.internal.bindings;


import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.TTYHandle;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class TtyWrap {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var tty = new LambdaConstructor(s, "TTY", 0, TTYHandle::js_constructor);
    StreamWrap.initializeConstructor(cx, s, tty);
    tty.definePrototypeMethod(s, "getWindowSize", 0, TTYHandle::js_getWindowSize);
    tty.definePrototypeMethod(s, "setRawMode", 1, TTYHandle::js_setRawMode);
    tty.defineConstructorMethod(s, "isTTY", 0, TTYHandle::js_isTty);

    var o = cx.newObject(s);
    o.put("TTY", o, tty);
    return o;
  }
}
