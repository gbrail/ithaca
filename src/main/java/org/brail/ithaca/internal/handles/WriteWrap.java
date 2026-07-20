package org.brail.ithaca.internal.handles;

import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class WriteWrap extends ScriptableObject {
  private static final Logger log = LoggerFactory.getLogger(WriteWrap.class);

  private Handle handle;
  private Callable onWriteComplete;
  private boolean async;
  private int bytes;
  private NativeArrayBuffer buffer;
  private Callable callback;

  @Override
  public String getClassName() {
    return "WriteWrap";
  }

  /**
   * Indicate that the write is complete. If "status" is negative then the write completed with an
   * error.
   */
  public void onWriteComplete(Context cx, VarScope s, int status) {
    assert onWriteComplete != null;
    log.debug("Calling onwrite: {}", status);
    onWriteComplete.call(cx, s, this, new Object[] {status});
  }

  private static WriteWrap realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, WriteWrap.class);
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new WriteWrap();
  }

  public static Object js_getHandle(Object to) {
    return realThis(to).handle;
  }

  public static void js_setHandle(Object to, Object val) {
    if (!(val instanceof Handle h)) {
      throw ScriptRuntime.typeError("Expected handle");
    }
    realThis(to).handle = h;
  }

  public static Object js_getOnWriteComplete(Object to) {
    return realThis(to).onWriteComplete;
  }

  public static void js_setOnWriteComplete(Object to, Object val) {
    if (!(val instanceof Callable c)) {
      throw ScriptRuntime.typeError("Expected callable");
    }
    realThis(to).onWriteComplete = c;
  }

  public static boolean js_getAsync(Object to) {
    return realThis(to).async;
  }

  public static void js_setAsync(Object to, Object val) {
    realThis(to).async = ScriptRuntime.toBoolean(val);
  }

  public static int js_getBytes(Object to) {
    return realThis(to).bytes;
  }

  public static void js_setBytes(Object to, Object val) {
    realThis(to).bytes = ScriptRuntime.toInt32(val);
  }

  public static Object js_getBuffer(Object to) {
    return realThis(to).buffer;
  }

  public static void js_setBuffer(Object to, Object val) {
    if (val == null) {
      return;
    }
    if (!(val instanceof NativeArrayBuffer b)) {
      throw ScriptRuntime.typeError("Expected array buffer, got " + val);
    }
    realThis(to).buffer = b;
  }

  public static Object js_getCallback(Object to) {
    return realThis(to).callback;
  }

  public static void js_setCallback(Object to, Object val) {
    if (!(val instanceof Callable c)) {
      throw ScriptRuntime.typeError("Expected callable");
    }
    realThis(to).callback = c;
  }
}
