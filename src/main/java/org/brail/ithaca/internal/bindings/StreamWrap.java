package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.IntArray;
import org.brail.ithaca.internal.handles.Stream;
import org.brail.ithaca.internal.handles.WriteWrap;
import org.mozilla.javascript.Context;
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

  private IntArray baseState;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var sw = new StreamWrap();
    var o = cx.newObject(s);
    var shutdown = new LambdaConstructor(s, "ShutdownWrap", 0, StreamWrap::shutdownWrapConstructor);
    o.put("ShutdownWrap", o, shutdown);
    var write = new LambdaConstructor(s, "WriteWrap", 0, WriteWrap::js_constructor);
    initializeWriteWrap(cx, write);
    o.put("WriteWrap", o, write);
    Constants.populate(cx, s, o, NodeConstants.StreamBaseStates.class);

    // Set up the state that will be shared by all streams when
    // delivering a callback
    var baseState = new IntArray(NodeConstants.StreamBaseStates.kNumStreamBaseStateFields);
    o.put("streamBaseState", o, baseState.createObject(cx, s));
    sw.baseState = baseState;
    e.setStreamWrap(sw);
    return o;
  }

  public void setReadBytesOrError(int i) {
    baseState.set(NodeConstants.StreamBaseStates.kReadBytesOrError, i);
  }

  public void setBytesWritten(int w) {
    baseState.set(NodeConstants.StreamBaseStates.kBytesWritten, w);
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

  private static Scriptable shutdownWrapConstructor(Context cx, VarScope s, Object[] args) {
    log.debug("ShutdownWrap constructor");
    return new NativeObject();
  }

  private static void initializeWriteWrap(Context cx, LambdaConstructor c) {
    c.definePrototypeProperty(cx, "handle", WriteWrap::js_getHandle, WriteWrap::js_setHandle);
    c.definePrototypeProperty(
        cx, "oncomplete", WriteWrap::js_getOnWriteComplete, WriteWrap::js_setOnWriteComplete);
    c.definePrototypeProperty(cx, "async", WriteWrap::js_getAsync, WriteWrap::js_setAsync);
    c.definePrototypeProperty(cx, "bytes", WriteWrap::js_getBytes, WriteWrap::js_setBytes);
    c.definePrototypeProperty(cx, "buffer", WriteWrap::js_getBuffer, WriteWrap::js_setBuffer);
    c.definePrototypeProperty(cx, "callback", WriteWrap::js_getCallback, WriteWrap::js_setCallback);
  }
}
