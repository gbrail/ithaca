package org.brail.ithaca.internal.common;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.mozilla.javascript.typedarrays.NativeArrayBufferView;

public class Serializer extends ScriptableObject {
  private boolean viewsAsHostObjects;
  private ByteArrayOutputStream bos;
  private ObjectOutputStream oos;

  @Override
  public String getClassName() {
    return "Serializer";
  }

  private static Serializer realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, Serializer.class);
  }

  private void initializeStream() {
    bos = new ByteArrayOutputStream();
    try {
      oos = new ObjectOutputStream(bos);
    } catch (IOException e) {
      throw new AssertionError("Can't initialize output stream: " + e, e);
    }
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new Serializer();
  }

  public static Object js_writeHeader(Context cx, VarScope s, Object to, Object[] args) {
    // There is actually no need for us to initialize our own header
    realThis(to).initializeStream();
    return Undefined.instance;
  }

  public static Object js_writeValue(Context cx, VarScope s, Object to, Object[] args) {
    var self = realThis(to);
    assert self.oos != null;
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Expected an argument");
    }
    try {
      // TODO if viewAsHostObjects we should probably do something
      self.oos.writeObject(args[0]);
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Cannot serialize argument: " + e);
    }
    return Undefined.instance;
  }

  public static Object js_releaseBuffer(Context cx, VarScope s, Object to, Object[] args) {
    var self = realThis(to);
    assert self.oos != null;
    try {
      self.oos.close();
      // TODO have a more straightforward way to do this
      var a = (NativeArrayBufferView) cx.newObject(s, "Uint8Array", new Object[] {self.bos.size()});
      // TODO can we do this without the extra copy?
      System.arraycopy(self.bos.toByteArray(), 0, a.getBuffer().getBuffer(), 0, self.bos.size());
      // TODO maybe we don't do that until writeHeader?
      self.initializeStream();
      return a;
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Cannot serialize result: " + e);
    }
  }

  public static Object js_transferArrayBuffer(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("transferArrayBuffer not implemented");
  }

  public static Object js_writeUint32(Context cx, VarScope s, Object to, Object[] args) {
    var self = realThis(to);
    assert self.oos != null;
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Expected an argument");
    }
    try {
      self.oos.writeLong(ScriptRuntime.toUint32(args[0]));
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Cannot serialize argument: " + e);
    }
    return Undefined.instance;
  }

  public static Object js_writeUint64(Context cx, VarScope s, Object to, Object[] args) {
    var self = realThis(to);
    assert self.oos != null;
    if (args.length < 2) {
      throw ScriptRuntime.rangeError("Expected two arguments");
    }
    try {
      // Write in two parts because Java has no unsigned long
      self.oos.writeLong(ScriptRuntime.toUint32(args[0]));
      self.oos.writeLong(ScriptRuntime.toUint32(args[1]));
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Cannot serialize argument: " + e);
    }
    return Undefined.instance;
  }

  public static Object js_writeDouble(Context cx, VarScope s, Object to, Object[] args) {
    var self = realThis(to);
    assert self.oos != null;
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Expected an argument");
    }
    try {
      self.oos.writeDouble(ScriptRuntime.toNumber(args[0]));
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Cannot serialize argument: " + e);
    }
    return Undefined.instance;
  }

  public static Object js_writeRawBytes(Context cx, VarScope s, Object to, Object[] args) {
    var self = realThis(to);
    assert self.oos != null;
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Expected an argument");
    }
    try {
      if (args[0] instanceof NativeArrayBuffer b) {
        self.oos.writeInt(b.getLength());
        self.oos.write(b.getBuffer(), 0, b.getLength());
      } else if (args[0] instanceof NativeArrayBufferView v) {
        self.oos.writeInt(v.getByteLength());
        self.oos.write(v.getBuffer().getBuffer(), v.getByteOffset(), v.getByteLength());
      } else {
        throw ScriptRuntime.typeError("Expected a buffer");
      }
    } catch (IOException e) {
      throw ScriptRuntime.typeError("Cannot serialize argument: " + e);
    }
    return Undefined.instance;
  }

  public static Object js_setTreatArrayBufferViewsAsHostObjects(
      Context cx, VarScope s, Object to, Object[] args) {
    if (args.length > 0) {
      realThis(to).viewsAsHostObjects = ScriptRuntime.toBoolean(args[0]);
    }
    return Undefined.instance;
  }
}
