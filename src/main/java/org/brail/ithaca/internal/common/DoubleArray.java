package org.brail.ithaca.internal.common;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ExternalArrayData;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

/**
 * We use this for internal cases where the JavaScript code is expecting an array of primitives, but
 * does not need the full functionality of the standard array types. This is more efficient and
 * easier to resize.
 */
public class DoubleArray implements ExternalArrayData {
  private double[] data;

  public DoubleArray(int size) {
    data = new double[size];
  }

  /** Create a JavaScript object that will behave like an array of integers. */
  public Scriptable createObject(Context cx, VarScope s) {
    var o = (ScriptableObject) cx.newObject(s);
    o.setExternalArrayData(s, this);
    return o;
  }

  public void grow(int factor) {
    int newLen = data.length * factor;
    double[] newData = new double[newLen];
    System.arraycopy(data, 0, newData, 0, data.length);
    data = newData;
  }

  public int length() {
    return data.length;
  }

  public double get(int index) {
    return data[index];
  }

  @Override
  public Object getArrayElement(int index) {
    if (index < data.length && index >= 0) {
      return data[index];
    }
    return Undefined.instance;
  }

  public void set(int index, double val) {
    data[index] = val;
  }

  public void add(int index, int addend) {
    data[index] += addend;
  }

  @Override
  public void setArrayElement(int index, Object value) {
    if (index < data.length && index >= 0) {
      data[index] = ScriptRuntime.toNumber(value);
    }
  }

  @Override
  public int getArrayLength() {
    return data.length;
  }
}
