package org.brail.ithaca.internal.common;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.mozilla.javascript.typedarrays.NativeArrayBufferView;

public class Deserializer extends ScriptableObject {
  private final ByteArrayInputStream bis;
  private final ObjectInputStream ois;

  private Deserializer(byte[] buf, int off, int len) {
    bis = new ByteArrayInputStream(buf, off, len);
    try {
      ois = new ObjectInputStream(bis);
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Error initializing input: " + e);
    }
  }

  private static Deserializer realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, Deserializer.class);
  }

  @Override
  public String getClassName() {
    return "Deserializer";
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Expected an argument");
    }
    if (args[0] instanceof NativeArrayBuffer a) {
      return new Deserializer(a.getBuffer(), 0, a.getLength());
    }
    if (args[0] instanceof NativeArrayBufferView v) {
      return new Deserializer(v.getBuffer().getBuffer(), v.getByteOffset(), v.getByteLength());
    }
    throw ScriptRuntime.typeError("Expected a buffer or view");
  }

  public static Object js_readHeader(Context cx, VarScope s, Object to, Object[] args) {
    // Nothing to do in our implementation
    return Undefined.instance;
  }

  public static Object js_readValue(Context cx, VarScope s, Object to, Object[] args) {
    try {
      return realThis(to).ois.readObject();
    } catch (IOException | ClassNotFoundException e) {
      throw ScriptRuntime.typeError("Error deserializing: " + e);
    }
  }

  public static Object js_getWireFormatVersion(Context cx, VarScope s, Object to, Object[] args) {
    return 1;
  }

  public static Object js_transferArrayBuffer(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("transferArrayBuffer not implemented");
  }

  public static Object js_readUint32(Context cx, VarScope s, Object to, Object[] args) {
    try {
      long val = realThis(to).ois.readLong();
      return (double) val;
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Error deserializing: " + e);
    }
  }

  public static Object js_readUint64(Context cx, VarScope s, Object to, Object[] args) {
    try {
      var self = realThis(to);
      long val1 = self.ois.readLong();
      long val2 = self.ois.readLong();
      var a = cx.newArray(s, 2);
      a.put(0, a, (double) val1);
      a.put(1, a, (double) val2);
      return a;
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Error deserializing: " + e);
    }
  }

  public static Object js_readDouble(Context cx, VarScope s, Object to, Object[] args) {
    try {
      return realThis(to).ois.readDouble();
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Error deserializing: " + e);
    }
  }

  public static Object js_readRawBytes(Context cx, VarScope s, Object to, Object[] args) {
    try {
      var self = realThis(to);
      int len = self.ois.readInt();
      // TODO have a more straightforward way to do this
      var ret = (NativeArrayBufferView) cx.newObject(s, "Uint8Array", new Object[] {len});
      self.ois.readFully(ret.getBuffer().getBuffer(), 0, len);
      return ret;
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Error deserializing: " + e);
    }
  }
}
