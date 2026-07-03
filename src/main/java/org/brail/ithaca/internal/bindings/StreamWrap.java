package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.Stream;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StreamWrap {
  private static final Logger log = LoggerFactory.getLogger(StreamWrap.class);

  private static final int PROP_ATTRS =
      ScriptableObject.READONLY | ScriptableObject.DONTENUM | ScriptableObject.PERMANENT;

  private static final ClassDescriptor WRITE_WRAP_DESCRIPTOR;
  private static final ClassDescriptor SHUTDOWN_WRAP_DESCRIPTOR;

  static {
    var sb = new ClassDescriptor.Builder("ShutdownWrap", 0, StreamWrap::shutdownWrapConstructor);
    SHUTDOWN_WRAP_DESCRIPTOR = AsyncWrap.applyClassDescriptor(sb).build();
    var wb = new ClassDescriptor.Builder("WriteWrap", 0, StreamWrap::writeWrapConstructor);
    WRITE_WRAP_DESCRIPTOR = AsyncWrap.applyClassDescriptor(wb).build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put(
        "ShutdownWrap",
        o,
        SHUTDOWN_WRAP_DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    o.put("WriteWrap", o, WRITE_WRAP_DESCRIPTOR.buildConstructor(cx, s, new NativeObject(), false));
    Constants.populate(cx, s, o, NodeConstants.StreamBaseStates.class);
    // Kind of guessing on the size here
    o.put(
        "streamBaseState",
        o,
        cx.newArray(s, NodeConstants.StreamBaseStates.kNumStreamBaseStateFields));
    return o;
  }

  /**
   * Configure the constructor of a JavaScript object to have the common methods that are required
   * of any stream in Node, by delegating to the Stream class.
   */
  static void initializeConstructor(Context cx, VarScope s, LambdaConstructor c) {
    HandleWrap.initializeConstructor(c, s);
    // Methods from stream_base.cc
    c.definePrototypeProperty("isStreamBase", true, PROP_ATTRS);
    c.definePrototypeProperty(cx, "fd", Stream::js_getFd, PROP_ATTRS);
    c.definePrototypeProperty(cx, "externalStream", Stream::js_getExternalStream, PROP_ATTRS);
    c.definePrototypeProperty(cx, "bytesRead", Stream::js_getBytesRead, PROP_ATTRS);
    c.definePrototypeProperty(cx, "bytesWritten", Stream::js_getBytesWritten, PROP_ATTRS);
    c.definePrototypeMethod(s, "setBlocking", 1, Stream::js_setBlocking);
    c.definePrototypeMethod(s, "readStart", 0, Stream::js_readStart);
    c.definePrototypeMethod(s, "readStop", 0, Stream::js_readStop);
    c.definePrototypeMethod(s, "shutdown", 0, Stream::js_shutdown);
    c.definePrototypeMethod(s, "useUserBuffer", 0, Stream::js_useUserBuffer);
    c.definePrototypeMethod(s, "writev", 1, Stream::js_writev);
    c.definePrototypeMethod(s, "writeBuffer", 1, Stream::js_writeBuffer);
    c.definePrototypeMethod(s, "writeAsciiString", 1, Stream::js_writeAsciiString);
    c.definePrototypeMethod(s, "writeUtf8String", 1, Stream::js_writeUtf8String);
    c.definePrototypeMethod(s, "writeUcs2String", 1, Stream::js_writeUcs2String);
    c.definePrototypeMethod(s, "writeLatin1String", 1, Stream::js_writeLatin1String);
    c.definePrototypeProperty(
        cx,
        "onread",
        Stream::js_getOnRead,
        Stream::js_setOnRead,
        ScriptableObject.DONTENUM | ScriptableObject.PERMANENT);
    // Methods from stream_wrap.cc
    c.definePrototypeMethod(s, "setBlocking", 1, Stream::js_setBlocking);
    c.definePrototypeProperty(
        cx,
        "writeQueueSize",
        Stream::js_getWriteQueueSize,
        ScriptableObject.DONTENUM | ScriptableObject.PERMANENT);
  }

  private static void swallow(Object to, Object val) {}

  private static Object alwaysTrue(Object to) {
    return true;
  }

  private static Object shutdownWrapConstructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("ShutdownWrap constructor");
    return cx.newObject(s);
  }

  private static Object writeWrapConstructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("WriteWrap constructor");
    return cx.newObject(s);
  }
}
