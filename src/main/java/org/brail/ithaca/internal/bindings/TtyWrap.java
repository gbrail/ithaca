package org.brail.ithaca.internal.bindings;

import static org.mozilla.javascript.ClassDescriptor.Destination.CTOR;
import static org.mozilla.javascript.ClassDescriptor.Destination.PROTO;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.TTYHandle;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class TtyWrap {
  private static final ClassDescriptor DESCRIPTOR;

  static {
    var b =
        new ClassDescriptor.Builder("TTY", 0, TTYHandle::js_constructor, TTYHandle::js_constructor);
    DESCRIPTOR =
        StreamWrap.applyClassDescriptor(b)
            .withMethod(PROTO, "getWindowSize", 0, TTYHandle::js_getWindowSize)
            .withMethod(PROTO, "setRawMode", 1, TTYHandle::js_setRawMode)
            .withMethod(CTOR, "isTTY", 0, TTYHandle::js_isTty)
            .build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("TTY", o, DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    return o;
  }
}
