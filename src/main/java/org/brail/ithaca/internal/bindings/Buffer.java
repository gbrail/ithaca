package org.brail.ithaca.internal.bindings;

import java.nio.charset.StandardCharsets;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.mozilla.javascript.typedarrays.NativeArrayBufferView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Buffer {
  private static final Logger log = LoggerFactory.getLogger(Buffer.class);

  private Scriptable prototype;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var b = new Buffer();
    var o = cx.newObject(s);
    po(o, s, "setBufferPrototype", 1, b::setBufferPrototype);
    po(o, s, "createUnsafeArrayBuffer", 1, b::createUnsafeArrayBuffer);
    po(o, s, "setDetachKey", 2, b::setDetachKey);
    po(o, s, "utf8WriteStatic", 2, Buffer::utf8WriteStatic);
    return o;
  }

  private static void po(Scriptable o, VarScope s, String name, int c, SerializableCallable t) {
    o.put(name, o, new LambdaFunction(s, name, c, t));
  }

  private Object setBufferPrototype(Context cx, VarScope s, Object lt, Object[] args) {
    assert args.length > 0;
    assert args[0] instanceof Scriptable;
    this.prototype = (Scriptable) args[0];
    return Undefined.instance;
  }

  private Object createUnsafeArrayBuffer(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length < 1) {
      // Seems weird but this is the error that the Node C++ code throws
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    double len = ScriptRuntime.toNumber(args[0]);
    var b = new NativeArrayBuffer(len);
    b.setParentScope(s);
    b.setPrototype(prototype);
    return b;
  }

  private Object setDetachKey(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("setDetachKey {}: Does nothing for now", args[1]);
    return Undefined.instance;
  }

  private static Object utf8WriteStatic(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }

    byte[] buffer;
    int bufOffset;
    int bufLen;

    if (args[0] instanceof NativeArrayBuffer nab) {
      buffer = nab.getBuffer();
      bufOffset = 0;
      bufLen = nab.getLength();
    } else if (args[0] instanceof NativeArrayBufferView abv) {
      buffer = abv.getBuffer().getBuffer();
      bufOffset = abv.getByteOffset();
      bufLen = abv.getByteLength();
    } else {
      throw ScriptRuntime.typeError("Argument is not a buffer");
    }

    var str = ScriptRuntime.toString(args[1]);
    int off = 0;
    int len = 0;
    if (args.length > 2) {
      off = ScriptRuntime.toInt32(args[2]);
    }
    if (args.length > 3) {
      len = ScriptRuntime.toInt32(args[3]);
    } else {
      len = bufLen - bufOffset - off;
    }
    len = Math.min(bufLen - bufOffset - off, len);
    if (len == 0) {
      return 0;
    }

    // Write string to bytes and then copy. There may be other options. For example,
    // this is pretty lame if we start with a big string and we're trying to write to a tiny
    // buffer.
    var strBytes = str.getBytes(StandardCharsets.UTF_8);
    int written = Math.min(strBytes.length, len);
    System.arraycopy(buffer, bufOffset + off, strBytes, 0, written);
    return written;
  }
}
