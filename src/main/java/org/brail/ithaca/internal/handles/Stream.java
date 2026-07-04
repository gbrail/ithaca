package org.brail.ithaca.internal.handles;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.bindings.NodeConstants;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** This handles what Node internally calls "stream_wrop" and "libuv_streamwrap" */
public abstract class Stream extends Handle {
  private static final Logger log = LoggerFactory.getLogger(Stream.class);

  protected int fd;
  protected boolean external;
  protected long bytesRead;
  protected long bytesWritten;
  protected boolean blocking;
  protected int writeQueueSize;
  protected Callable onRead;

  public Stream(Environment env) {
    super(env);
  }

  @Override
  public String getClassName() {
    return "Stream";
  }

  /**
   * Write to the underlying stream or target, wait for the write to complete, and throw an
   * exception if it fails.
   */
  protected abstract void blockingWrite(byte[] buf, int off, int len) throws IOException;

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

  public static Object js_setBlocking(Context cx, VarScope s, Object to, Object[] args) {
    if (args.length > 0) {
      var self = realThis(to);
      var blocking = ScriptRuntime.toBoolean(args[0]);
      log.debug("setBlocking: {}", blocking);
      self.blocking = blocking;
    }
    return Undefined.instance;
  }

  public static Object js_readStart(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("readStart: {}", to);
    return Undefined.instance;
  }

  public static Object js_readStop(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("readStop: {}", to);
    return Undefined.instance;
  }

  public static Object js_shutdown(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("shutdown");
    return Undefined.instance;
  }

  public static Object js_useUserBuffer(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("useUserBuffer");
    return Undefined.instance;
  }

  public static Object js_writev(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writev not implemented");
  }

  public static Object js_writeBuffer(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writeBuffer not implemented");
  }

  public static Object js_writeAsciiString(Context cx, VarScope s, Object to, Object[] args) {
    return js_writeString(cx, s, to, args, StandardCharsets.US_ASCII);
  }

  public static Object js_writeUtf8String(Context cx, VarScope s, Object to, Object[] args) {
    return js_writeString(cx, s, to, args, StandardCharsets.UTF_8);
  }

  public static Object js_writeUcs2String(Context cx, VarScope s, Object to, Object[] args) {
    return js_writeString(cx, s, to, args, StandardCharsets.UTF_16LE);
  }

  public static Object js_writeLatin1String(Context cx, VarScope s, Object to, Object[] args) {
    return js_writeString(cx, s, to, args, StandardCharsets.ISO_8859_1);
  }

  private static Object js_writeString(
      Context cx, VarScope s, Object to, Object[] args, Charset cs) {
    if (args.length < 2) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    if (!(args[0] instanceof WriteWrap ww)) {
      throw ScriptRuntime.typeError("Expected a WriteWrap");
    }
    String str;
    if (args[1] instanceof String ss) {
      str = ss;
    } else if (args[1] instanceof CharSequence seq) {
      str = seq.toString();
    } else {
      throw ScriptRuntime.typeError("Expected a string");
    }
    var self = realThis(to);
    var buf = str.getBytes(cs);
    if (!self.blocking) {
      throw new AssertionError("Only blocking writes supported now");
    }
    try {
      self.blockingWrite(buf, 0, buf.length);
      log.debug("stream write complete");
      ww.onWriteComplete(cx, s, 0);
      return 0;
    } catch (IOException e) {
      log.debug("Stream write error: {}", e, e);
      int err = NodeConstants.Errno.EIO;
      ww.onWriteComplete(cx, s, err);
      return err;
    }
  }

  public static Object js_getOnRead(Object to) {
    return realThis(to).onRead;
  }

  public static void js_setOnRead(Object to, Object arg) {
    log.debug("set onread({}): {}", to, arg);
    if (!(arg instanceof Callable c)) {
      throw ScriptRuntime.typeError("Expected callable");
    }
    realThis(to).onRead = c;
  }
}
