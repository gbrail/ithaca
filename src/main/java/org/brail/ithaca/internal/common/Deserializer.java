package org.brail.ithaca.internal.common;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class Deserializer extends ScriptableObject {
  @Override
  public String getClassName() {
    return "Deserializer";
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new Deserializer();
  }

  public static Object js_readHeader(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("readHeader not implemented");
  }

  public static Object js_readValue(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("readValue not implemented");
  }

  public static Object js_getWireFormatVersion(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getWireFormatVersion not implemented");
  }

  public static Object js_transferArrayBuffer(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("transferArrayBuffer not implemented");
  }

  public static Object js_readUint32(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("readUint32 not implemented");
  }

  public static Object js_readUint64(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("readUint64 not implemented");
  }

  public static Object js_readDouble(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("readDouble not implemented");
  }

  public static Object js_readRawBytes(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("readRawBytes not implemented");
  }
}
