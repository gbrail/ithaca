package org.brail.ithaca.internal.handles;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** This handles what Node internally calls "stream_wrop" and "libuv_streamwrap" */
public class Stream extends Handle {
  private static final Logger log = LoggerFactory.getLogger(Stream.class);

  protected int fd;
  protected boolean external;
  protected long bytesRead;
  protected long bytesWritten;
  protected boolean blocking;
  protected int writeQueueSize;

  @Override
  public String getClassName() {
    return "Stream";
  }

  private static Stream realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, Stream.class);
  }

  public static Object js_getFd(Object to) {
    return realThis(to).fd;
  }

  public static Object js_getBytesRead(Object to) {
    long r = realThis(to).bytesRead;
    if (r < Integer.MAX_VALUE) {
      return (int) r;
    }
    return (double) r;
  }

  public static Object js_getBytesWritten(Object to) {
    long w = realThis(to).bytesWritten;
    if (w < Integer.MAX_VALUE) {
      return (int) w;
    }
    return (double) w;
  }

  public static Object js_getExternalStream(Object to) {
    return realThis(to).external;
  }

  public static Object js_getWriteQueueSize(Object to) {
    return realThis(to).writeQueueSize;
  }

  public static Object js_setBlocking(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    if (args.length > 0) {
      var self = realThis(to);
      var blocking = ScriptRuntime.toBoolean(args[0]);
      log.debug("setBlocking: {}", blocking);
      self.blocking = blocking;
    }
    return Undefined.instance;
  }

  public static Object js_readStart(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("readStart");
    return Undefined.instance;
  }

  public static Object js_readStop(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("readStop");
    return Undefined.instance;
  }

  public static Object js_shutdown(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("shutdown");
    return Undefined.instance;
  }

  public static Object js_useUserBuffer(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("useUserBuffer");
    return Undefined.instance;
  }

  public static Object js_writev(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("writev");
    return Undefined.instance;
  }

  public static Object js_writeBuffer(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("writeBuffer");
    return Undefined.instance;
  }

  public static Object js_writeAsciiString(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("writeAsciiString");
    return Undefined.instance;
  }

  public static Object js_writeUtf8String(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("writeUtf8String");
    return Undefined.instance;
  }

  public static Object js_writeUcs2String(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("writeUcs2String");
    return Undefined.instance;
  }

  public static Object js_writeLatin1String(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("writeLatin1String");
    return Undefined.instance;
  }

  public static Object js_getOnRead(Object to) {
    log.debug("get onread");
    return Undefined.instance;
  }

  public static void js_setOnRead(Object to, Object arg) {
    log.debug("set onread({}): {}", to, arg);
    throw ScriptRuntime.typeError("Who sets onread on stdout?");
  }
}
