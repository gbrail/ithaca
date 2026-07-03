package org.brail.ithaca.internal.bindings;

import static org.mozilla.javascript.ClassDescriptor.Destination.PROTO;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.handles.Stream;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
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
  static ClassDescriptor.Builder applyClassDescriptor(ClassDescriptor.Builder b) {
    return HandleWrap.applyClassDescriptor(b)
        // Methods from stream_base.cc
        .withProp(PROTO, "isStreamBase", StreamWrap::alwaysTrue, StreamWrap::swallow, PROP_ATTRS)
        .withProp(PROTO, "fd", Stream::js_getFd, StreamWrap::swallow, PROP_ATTRS)
        .withProp(
            PROTO, "externalStream", Stream::js_getExternalStream, StreamWrap::swallow, PROP_ATTRS)
        .withProp(PROTO, "bytesRead", Stream::js_getBytesRead, StreamWrap::swallow, PROP_ATTRS)
        .withProp(
            PROTO, "bytesWritten", Stream::js_getBytesWritten, StreamWrap::swallow, PROP_ATTRS)
        .withMethod(PROTO, "setBlocking", 1, Stream::js_setBlocking)
        .withMethod(PROTO, "readStart", 0, Stream::js_readStart)
        .withMethod(PROTO, "readStop", 0, Stream::js_readStop)
        .withMethod(PROTO, "shutdown", 0, Stream::js_shutdown)
        .withMethod(PROTO, "useUserBuffer", 0, Stream::js_useUserBuffer)
        .withMethod(PROTO, "writev", 1, Stream::js_writev)
        .withMethod(PROTO, "writeBuffer", 1, Stream::js_writeBuffer)
        .withMethod(PROTO, "writeAsciiString", 1, Stream::js_writeAsciiString)
        .withMethod(PROTO, "writeUtf8String", 1, Stream::js_writeUtf8String)
        .withMethod(PROTO, "writeUcs2String", 1, Stream::js_writeUcs2String)
        .withMethod(PROTO, "writeLatin1String", 1, Stream::js_writeLatin1String)
        .withProp(
            PROTO,
            "onread",
            Stream::js_getOnRead,
            Stream::js_setOnRead,
            ScriptableObject.DONTENUM | ScriptableObject.PERMANENT)
        // Methods from stream_wrap.cc
        .withMethod(PROTO, "setBlocking", 1, Stream::js_setBlocking)
        .withProp(
            PROTO,
            "writeQueueSize",
            Stream::js_getWriteQueueSize,
            StreamWrap::swallow,
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
