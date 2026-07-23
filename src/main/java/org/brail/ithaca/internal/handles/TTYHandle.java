package org.brail.ithaca.internal.handles;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.bindings.NodeConstants;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeUint8Array;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TTYHandle extends Stream {
  private static final Logger log = LoggerFactory.getLogger(TTYHandle.class);

  private final int fd;
  private final OutputStream out;
  private final InputStream in;

  private boolean threadStarted;

  private TTYHandle(Environment env, int fd, Scriptable context) {
    super(env);
    this.fd = fd;
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

  private static TTYHandle realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, TTYHandle.class);
  }

  @Override
  protected void blockingWrite(byte[] buf, int off, int len) throws IOException {
    assert out != null;
    out.write(buf, off, len);
    environment.streamWrap().setBytesWritten(len);
  }

  /** Stdih can't really be closed so just stop reading */
  @Override
  protected void close() {
    readStop();
  }

  /** Start the virtual thread if necessary, and mark that we should be actively reading. */
  @Override
  protected void readStart(VarScope s) {
    if (in == null) {
      throw ScriptRuntime.typeError("Cannot read from output");
    }
    super.readStart(s);
    if (!threadStarted) {
      log.debug("Starting to read from stdin");
      Thread.ofVirtual().name("Standard Input Reader").start(this::readStdin);
      threadStarted = true;
    }
  }

  private void readStdin() {
    byte[] readBuf = new byte[4096];
    int readLen;

    while (true) {
      awaitReadStart();
      try {
        readLen = in.read(readBuf);
        if (readLen < 0) {
          log.debug("Stdin read returned EOF");
          deliverEof();
          break;
        } else if (readLen > 0) {
          log.debug("Read {} bytes from stdin", readLen);
          deliverData(readBuf, readLen);
        }
      } catch (IOException ioe) {
        // All we can really do here is return EOF and stop
        log.warn("Error reading from stdin: {}", ioe, ioe);
        deliverError();
        break;
      }
    }
    // Doesn't hurt to make sure we are unreferenced
    readStop();
  }

  private void deliverData(byte[] buf, int len) {
    // Because there are multiple threads, make a copy
    byte[] deliverBuf = new byte[len];
    System.arraycopy(buf, 0, deliverBuf, 0, len);
    environment.deliverCallback(
        (cx) -> {
          // TODO create a more efficient way to do this in Rhino
          var buffer =
              (NativeUint8Array)
                  cx.newObject(onReadScope, "Uint8Array", new Object[] {deliverBuf.length});
          System.arraycopy(deliverBuf, 0, buffer.getBuffer().getBuffer(), 0, deliverBuf.length);
          environment.streamWrap().setReadBytesOrError(len);
          onRead.call(cx, onReadScope, this, new Object[] {buffer});
        });
  }

  private void deliverEof() {
    environment.deliverCallback(
        (cx) -> {
          environment.streamWrap().setReadBytesOrError(NodeConstants.Uv.EOF);
          onRead.call(cx, onReadScope, this, new Object[] {Undefined.instance});
        });
  }

  private void deliverError() {
    environment.deliverCallback(
        (cx) -> {
          environment.streamWrap().setReadBytesOrError(NodeConstants.Uv.EIO);
          onRead.call(cx, onReadScope, this, new Object[] {Undefined.instance});
        });
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
