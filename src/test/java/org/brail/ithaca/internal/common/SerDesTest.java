package org.brail.ithaca.internal.common;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.mozilla.javascript.typedarrays.NativeArrayBufferView;

public class SerDesTest {

  private Context cx;
  private VarScope scope;

  @BeforeEach
  public void setUp() {
    cx = Context.enter();
    scope = cx.initStandardObjects();
  }

  @AfterEach
  public void tearDown() {
    Context.exit();
  }

  @Test
  public void testBasicTypesRoundTrip() {
    Scriptable serObj = (Scriptable) Serializer.js_constructor(cx, scope, new Object[0]);
    Serializer.js_writeHeader(cx, scope, serObj, new Object[] {});
    Serializer ser = (Serializer) serObj;

    Serializer.js_writeValue(cx, scope, ser, new Object[] {"Hello"});
    Serializer.js_writeValue(cx, scope, ser, new Object[] {123});
    Serializer.js_writeUint32(cx, scope, ser, new Object[] {4294967295L});

    Serializer.js_writeDouble(cx, scope, ser, new Object[] {3.14159});

    Object bufObj = Serializer.js_releaseBuffer(cx, scope, ser, new Object[0]);
    assertInstanceOf(NativeArrayBufferView.class, bufObj);
    NativeArrayBufferView view = (NativeArrayBufferView) bufObj;

    Scriptable desObj = (Scriptable) Deserializer.js_constructor(cx, scope, new Object[] {view});
    Deserializer des = (Deserializer) desObj;

    assertEquals("Hello", Deserializer.js_readValue(cx, scope, des, new Object[0]));
    assertEquals(123, Deserializer.js_readValue(cx, scope, des, new Object[0]));
    assertEquals(4294967295.0, Deserializer.js_readUint32(cx, scope, des, new Object[0]));
    assertEquals(
        3.14159, (Double) Deserializer.js_readDouble(cx, scope, des, new Object[0]), 0.0001);
  }

  @Test
  public void testUint64RoundTrip() {
    Scriptable serObj = (Scriptable) Serializer.js_constructor(cx, scope, new Object[0]);
    Serializer.js_writeHeader(cx, scope, serObj, new Object[] {});
    Serializer ser = (Serializer) serObj;

    // Uint64 is written as two Uint32s
    Serializer.js_writeUint64(cx, scope, ser, new Object[] {100L, 200L});

    Object bufObj = Serializer.js_releaseBuffer(cx, scope, ser, new Object[0]);
    NativeArrayBufferView view = (NativeArrayBufferView) bufObj;

    Scriptable desObj = (Scriptable) Deserializer.js_constructor(cx, scope, new Object[] {view});
    Deserializer des = (Deserializer) desObj;

    Object result = Deserializer.js_readUint64(cx, scope, des, new Object[0]);
    assertInstanceOf(Scriptable.class, result);
  }

  @Test
  public void testRawBytesRoundTrip() {
    Scriptable serObj = (Scriptable) Serializer.js_constructor(cx, scope, new Object[0]);
    Serializer.js_writeHeader(cx, scope, serObj, new Object[] {});
    Serializer ser = (Serializer) serObj;

    // Create a buffer with some data
    byte[] data = {1, 2, 3, 4, 5};
    NativeArrayBuffer nab =
        (NativeArrayBuffer) cx.newObject(scope, "ArrayBuffer", new Object[] {data.length});
    System.arraycopy(data, 0, nab.getBuffer(), 0, data.length);

    Serializer.js_writeRawBytes(cx, scope, ser, new Object[] {nab});

    Object bufObj = Serializer.js_releaseBuffer(cx, scope, ser, new Object[0]);
    NativeArrayBufferView view = (NativeArrayBufferView) bufObj;

    Scriptable desObj = (Scriptable) Deserializer.js_constructor(cx, scope, new Object[] {view});
    Deserializer des = (Deserializer) desObj;

    Object result = Deserializer.js_readRawBytes(cx, scope, des, new Object[0]);
    assertInstanceOf(NativeArrayBufferView.class, result);
    NativeArrayBufferView resultNab = (NativeArrayBufferView) result;
    assertEquals(data.length, resultNab.getByteLength());

    byte[] resultData = new byte[data.length];
    System.arraycopy(resultNab.getBuffer().getBuffer(), 0, resultData, 0, data.length);
    assertArrayEquals(data, resultData);
  }

  @Test
  public void testRawBytesWithViewRoundTrip() {
    Scriptable serObj = (Scriptable) Serializer.js_constructor(cx, scope, new Object[0]);
    Serializer.js_writeHeader(cx, scope, serObj, new Object[] {});
    Serializer ser = (Serializer) serObj;

    // Create a buffer and a view into it
    byte[] fullData = {0, 0, 10, 20, 30, 0};
    NativeArrayBuffer nab =
        (NativeArrayBuffer) cx.newObject(scope, "ArrayBuffer", new Object[] {fullData.length});
    System.arraycopy(fullData, 0, nab.getBuffer(), 0, fullData.length);

    // View from offset 2, length 3: [10, 20, 30]
    NativeArrayBufferView view =
        (NativeArrayBufferView) cx.newObject(scope, "Uint8Array", new Object[] {nab, 2, 3});

    Serializer.js_writeRawBytes(cx, scope, ser, new Object[] {view});

    Object bufObj = Serializer.js_releaseBuffer(cx, scope, ser, new Object[0]);
    NativeArrayBufferView releasedView = (NativeArrayBufferView) bufObj;

    Scriptable desObj =
        (Scriptable) Deserializer.js_constructor(cx, scope, new Object[] {releasedView});
    Deserializer des = (Deserializer) desObj;

    Object result = Deserializer.js_readRawBytes(cx, scope, des, new Object[0]);
    assertInstanceOf(NativeArrayBufferView.class, bufObj);
    NativeArrayBufferView resultNab = (NativeArrayBufferView) result;
    assertEquals(3, resultNab.getByteLength());

    byte[] resultData = new byte[3];
    System.arraycopy(resultNab.getBuffer().getBuffer(), 0, resultData, 0, 3);
    assertArrayEquals(new byte[] {10, 20, 30}, resultData);
  }
}
