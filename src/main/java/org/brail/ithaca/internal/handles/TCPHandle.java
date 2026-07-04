package org.brail.ithaca.internal.handles;

import java.io.IOException;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TCPHandle extends Stream {
  private static final Logger log = LoggerFactory.getLogger(TCPHandle.class);

  public TCPHandle(Environment env) {
    super(env);
  }

  @Override
  public String getClassName() {
    return "TCP";
  }

  @Override
  protected void blockingWrite(byte[] buf, int off, int len) throws IOException {
    throw new AssertionError("TCPHandle write not implemented");
  }

  public static Scriptable js_constructor(Environment e) {
    log.debug("constructor");
    return new TCPHandle(e);
  }

  public static Object js_open(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("open");
    return Undefined.instance;
  }

  public static Object js_bind(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("bind");
    return Undefined.instance;
  }

  public static Object js_listen(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("listen");
    return Undefined.instance;
  }

  public static Object js_connect(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("connect");
    return Undefined.instance;
  }

  public static Object js_bind6(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("bind6");
    return Undefined.instance;
  }

  public static Object js_connect6(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("connect6");
    return Undefined.instance;
  }

  public static Object js_getsockname(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("getsockname");
    return Undefined.instance;
  }

  public static Object js_getpeername(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("getpeername");
    return Undefined.instance;
  }

  public static Object js_setNoDelay(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setNoDelay");
    return Undefined.instance;
  }

  public static Object js_setKeepAlive(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setKeepAlive");
    return Undefined.instance;
  }

  public static Object js_setTypeOfService(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setTypeOfService");
    return Undefined.instance;
  }

  public static Object js_getTypeOfService(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("getTypeOfService");
    return Undefined.instance;
  }

  public static Object js_reset(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("reset");
    return Undefined.instance;
  }
}
