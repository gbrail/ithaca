package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.Deserializer;
import org.brail.ithaca.internal.common.Serializer;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Serdes {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);

    var ser = new LambdaConstructor(s, "Serializer", 1, Serializer::js_constructor);
    ser.definePrototypeMethod(s, "writeHeader", 1, Serializer::js_writeHeader);
    ser.definePrototypeMethod(s, "writeValue", 1, Serializer::js_writeValue);
    ser.definePrototypeMethod(s, "releaseBuffer", 1, Serializer::js_releaseBuffer);
    ser.definePrototypeMethod(s, "transferArrayBuffer", 1, Serializer::js_transferArrayBuffer);
    ser.definePrototypeMethod(s, "writeUint32", 1, Serializer::js_writeUint32);
    ser.definePrototypeMethod(s, "writeUint64", 1, Serializer::js_writeUint64);
    ser.definePrototypeMethod(s, "writeDouble", 1, Serializer::js_writeDouble);
    ser.definePrototypeMethod(s, "writeRawBytes", 1, Serializer::js_writeRawBytes);
    ser.definePrototypeMethod(
        s,
        "_setTreatArrayBufferViewsAsHostObjects",
        1,
        Serializer::js_setTreatArrayBufferViewsAsHostObjects);
    o.put("Serializer", o, ser);

    var des = new LambdaConstructor(s, "Deserializer", 1, Deserializer::js_constructor);
    des.definePrototypeMethod(s, "readHeader", 1, Deserializer::js_readHeader);
    des.definePrototypeMethod(s, "readValue", 1, Deserializer::js_readValue);
    des.definePrototypeMethod(s, "getWireFormatVersion", 1, Deserializer::js_getWireFormatVersion);
    des.definePrototypeMethod(s, "transferArrayBuffer", 1, Deserializer::js_transferArrayBuffer);
    des.definePrototypeMethod(s, "readUint32", 1, Deserializer::js_readUint32);
    des.definePrototypeMethod(s, "readUint64", 1, Deserializer::js_readUint64);
    des.definePrototypeMethod(s, "readDouble", 1, Deserializer::js_readDouble);
    des.definePrototypeMethod(s, "_readRawBytes", 1, Deserializer::js_readRawBytes);
    o.put("Deserializer", o, des);

    return o;
  }
}
