package org.brail.ithaca.internal.common;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class Serializer extends ScriptableObject {
  @Override
  public String getClassName() {
    return "Serializer";
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new Serializer();
  }

  public static Object js_writeHeader(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writeHeader not implemented");
  }

  public static Object js_writeValue(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writeValue not implemented");
  }

  public static Object js_releaseBuffer(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("releaseBuffer not implemented");
  }

  public static Object js_transferArrayBuffer(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("transferArrayBuffer not implemented");
  }

  public static Object js_writeUint32(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writeUint32 not implemented");
  }

  public static Object js_writeUint64(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writeUint64 not implemented");
  }

  public static Object js_writeDouble(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writeDouble not implemented");
  }

  public static Object js_writeRawBytes(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("writeRawBytes not implemented");
  }

  public static Object js_setTreatArrayBufferViewsAsHostObjects(
      Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("_setTreatArrayBufferViewsAsHostObjects not implemented");
  }
}
