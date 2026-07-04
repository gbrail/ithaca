package org.brail.ithaca.internal.handles;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TTYHandle extends Stream {
  private static final Logger log = LoggerFactory.getLogger(TTYHandle.class);

  private final int fd;
  private final Scriptable context;
  private final OutputStream out;
  private final InputStream in;

  private TTYHandle(Environment env, int fd, Scriptable context) {
    super(env);
    this.fd = fd;
    this.context = context;
    switch (fd) {
      case 0:
        this.out = null;
        this.in = System.in;
        break;
      case 1:
        this.out = System.out;
        this.in = null;
        break;
      case 2:
        this.out = System.err;
        this.in = null;
        break;
      default:
        throw new AssertionError("No TTY support on fd " + fd);
    }
  }

  @Override
  public String getClassName() {
    return "TTY";
  }

  @Override
  protected void blockingWrite(byte[] buf, int off, int len) throws IOException {
    assert out != null;
    out.write(buf, off, len);
  }

  public static Scriptable js_constructor(Environment env, Object[] args) {
    if (args.length < 1) {
      return null;
    }
    int fd = ScriptRuntime.toInt32(args[0]);
    Scriptable context = null;
    if (args.length > 1) {
      context = (Scriptable) args[1];
    }
    log.debug("New TTYHandle fd = {}", fd);
    return new TTYHandle(env, fd, context);
  }

  public static Object js_getWindowSize(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("getWindowSize: not implemented");
    return Undefined.instance;
  }

  public static Object js_setRawMode(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setRawMode: not implemented");
    return Undefined.instance;
  }

  public static Object js_isTty(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("isTty: Not implemented");
    return Undefined.instance;
  }

  @Override
  public String toString() {
    return "TTYHandle(" + fd + ")";
  }
}
