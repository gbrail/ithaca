package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.TCPHandle;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class TcpWrap {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);

    var tcp = new LambdaConstructor(s, "TCP", 0, (_, _, _) -> TCPHandle.js_constructor(e));
    initializeConstructor(cx, s, tcp);
    o.put("TCP", o, tcp);

    var connect = new LambdaConstructor(s, "TCPConnectWrap", 0, TcpWrap::js_connectWrapConstructor);
    o.put("TCPConnectWrap", o, connect);

    var c = cx.newObject(s);
    Constants.populate(cx, s, c, NodeConstants.TCPConstants.class);
    o.put("TCPConstants", o, c);
    return o;
  }

  static void initializeConstructor(Context cx, VarScope s, LambdaConstructor c) {
    StreamWrap.initializeConstructor(cx, s, c);
    c.definePrototypeMethod(s, "open", 1, TCPHandle::js_open);
    c.definePrototypeMethod(s, "bind", 1, TCPHandle::js_bind);
    c.definePrototypeMethod(s, "listen", 1, TCPHandle::js_listen);
    c.definePrototypeMethod(s, "connect", 1, TCPHandle::js_connect);
    c.definePrototypeMethod(s, "bind6", 1, TCPHandle::js_bind6);
    c.definePrototypeMethod(s, "connect6", 1, TCPHandle::js_connect6);
    c.definePrototypeMethod(s, "getsockname", 1, TCPHandle::js_getsockname);
    c.definePrototypeMethod(s, "getpeername", 1, TCPHandle::js_getpeername);
    c.definePrototypeMethod(s, "setNoDelay", 1, TCPHandle::js_setNoDelay);
    c.definePrototypeMethod(s, "setKeepAlive", 1, TCPHandle::js_setKeepAlive);
    c.definePrototypeMethod(s, "setTypeOfService", 1, TCPHandle::js_setTypeOfService);
    c.definePrototypeMethod(s, "getTypeOfService", 1, TCPHandle::js_getTypeOfService);
    c.definePrototypeMethod(s, "reset", 1, TCPHandle::js_reset);
  }

  public static Scriptable js_connectWrapConstructor(Context cx, VarScope s, Object[] args) {
    return new NativeObject();
  }
}
