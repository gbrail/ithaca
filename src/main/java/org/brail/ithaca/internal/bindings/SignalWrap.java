package org.brail.ithaca.internal.bindings;

import static org.mozilla.javascript.ClassDescriptor.Destination.PROTO;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.SignalHandle;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class SignalWrap {
  private static final ClassDescriptor DESCRIPTOR;

  static {
    var b =
        new ClassDescriptor.Builder(
            "Signal", 0, SignalHandle::js_constructor, SignalHandle::js_constructor);
    DESCRIPTOR =
        HandleWrap.applyClassDescriptor(b)
            .withMethod(PROTO, "start", 0, SignalHandle::js_start)
            .withMethod(PROTO, "stop", 0, SignalHandle::js_stop)
            .build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("Signal", o, DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    return o;
  }
}
