package org.brail.ithaca.internal.bindings;

import static org.mozilla.javascript.ClassDescriptor.Destination.PROTO;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.TCPHandle;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class TcpWrap {
  private static final ClassDescriptor TCP_DESCRIPTOR;
  private static final ClassDescriptor TCP_WRAP_DESCRIPTOR;

  static {
    var b =
        new ClassDescriptor.Builder("TCP", 0, TCPHandle::js_constructor, TCPHandle::js_constructor);
    TCP_DESCRIPTOR = applyClassDescriptor(b).build();
    TCP_WRAP_DESCRIPTOR =
        new ClassDescriptor.Builder(
                "TCPConnectWrap",
                0,
                TcpWrap::js_connectWrapConstructor,
                TcpWrap::js_connectWrapConstructor)
            .build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var c = cx.newObject(s);
    Constants.populate(cx, s, c, NodeConstants.TCPConstants.class);
    o.put("TCPConstants", o, c);
    o.put("TCP", o, TCP_DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    o.put(
        "TCPConnectWrap",
        o,
        TCP_WRAP_DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    return o;
  }

  static ClassDescriptor.Builder applyClassDescriptor(ClassDescriptor.Builder b) {
    return b.withMethod(PROTO, "open", 1, TCPHandle::js_open)
        .withMethod(PROTO, "bind", 1, TCPHandle::js_bind)
        .withMethod(PROTO, "listen", 1, TCPHandle::js_listen)
        .withMethod(PROTO, "connect", 1, TCPHandle::js_connect)
        .withMethod(PROTO, "bind6", 1, TCPHandle::js_bind6)
        .withMethod(PROTO, "connect6", 1, TCPHandle::js_connect6)
        .withMethod(PROTO, "getsockname", 1, TCPHandle::js_getsockname)
        .withMethod(PROTO, "getpeername", 1, TCPHandle::js_getpeername)
        .withMethod(PROTO, "setNoDelay", 1, TCPHandle::js_setNoDelay)
        .withMethod(PROTO, "setKeepAlive", 1, TCPHandle::js_setKeepAlive)
        .withMethod(PROTO, "setTypeOfService", 1, TCPHandle::js_setTypeOfService)
        .withMethod(PROTO, "getTypeOfService", 1, TCPHandle::js_getTypeOfService)
        .withMethod(PROTO, "reset", 1, TCPHandle::js_reset);
  }

  public static Scriptable js_connectWrapConstructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object thisObj, Object[] args) {
    var h = new NativeObject();
    h.setPrototype((Scriptable) f.getPrototypeProperty());
    h.setParentScope(f.getDeclarationScope());
    return h;
  }
}
