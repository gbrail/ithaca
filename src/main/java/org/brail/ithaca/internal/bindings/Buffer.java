package org.brail.ithaca.internal.bindings;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
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

    po(o, s, "asciiSlice", 3, Buffer::asciiSlice);
    po(o, s, "base64Slice", 3, Buffer::base64Slice);
    po(o, s, "base64urlSlice", 3, Buffer::base64urlSlice);
    po(o, s, "latin1Slice", 3, Buffer::latin1Slice);
    po(o, s, "hexSlice", 3, Buffer::hexSlice);
    po(o, s, "ucs2Slice", 3, Buffer::ucs2Slice);
    po(o, s, "utf8Slice", 3, Buffer::utf8Slice);

    po(o, s, "asciiWriteStatic", 4, Buffer::asciiWriteStatic);
    po(o, s, "base64Write", 4, Buffer::base64Write);
    po(o, s, "base64urlWrite", 4, Buffer::base64urlWrite);
    po(o, s, "latin1WriteStatic", 4, Buffer::latin1WriteStatic);
    po(o, s, "hexWrite", 4, Buffer::hexWrite);
    po(o, s, "ucs2Write", 4, Buffer::ucs2Write);
    po(o, s, "utf8WriteStatic", 4, Buffer::utf8WriteStatic);

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

  private record BufferRange(byte[] array, int offset, int length) {}

  private static BufferRange getBufferRange(Object arg) {
    if (arg instanceof NativeArrayBuffer nab) {
      return new BufferRange(nab.getBuffer(), 0, nab.getLength());
    } else if (arg instanceof NativeArrayBufferView abv) {
      return new BufferRange(abv.getBuffer().getBuffer(), abv.getByteOffset(), abv.getByteLength());
    } else {
      throw ScriptRuntime.typeError("Argument is not a buffer");
    }
  }

  private static BufferRange getSliceRange(Object[] args) {
    BufferRange range = getBufferRange(args[0]);
    int start = 0;
    int end = range.length;
    if (args.length > 1 && args[1] != Undefined.instance && args[1] != null) {
      start = ScriptRuntime.toInt32(args[1]);
    }
    if (args.length > 2 && args[2] != Undefined.instance && args[2] != null) {
      end = ScriptRuntime.toInt32(args[2]);
    }
    // Clamp start and end
    if (start < 0) start = 0;
    if (start > range.length) start = range.length;
    if (end < start) end = start;
    if (end > range.length) end = range.length;

    return new BufferRange(range.array, range.offset + start, end - start);
  }

  private record WriteArgs(byte[] array, int targetOffset, int maxBytesToWrite, String str) {}

  private static WriteArgs getWriteArgs(Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    BufferRange range = getBufferRange(args[0]);
    String str = ScriptRuntime.toString(args[1]);

    int off = 0;
    if (args.length > 2 && args[2] != Undefined.instance && args[2] != null) {
      off = ScriptRuntime.toInt32(args[2]);
    }

    int len = range.length - off;
    if (args.length > 3 && args[3] != Undefined.instance && args[3] != null) {
      len = ScriptRuntime.toInt32(args[3]);
    }

    // Clamp offset and length
    if (off < 0) off = 0;
    if (off > range.length) off = range.length;
    if (len < 0) len = 0;
    if (len > range.length - off) len = range.length - off;

    return new WriteArgs(range.array, range.offset + off, len, str);
  }

  private static Object asciiSlice(Context cx, VarScope s, Object lt, Object[] args) {
    BufferRange range = getSliceRange(args);
    return new String(range.array, range.offset, range.length, StandardCharsets.US_ASCII);
  }

  private static Object latin1Slice(Context cx, VarScope s, Object lt, Object[] args) {
    BufferRange range = getSliceRange(args);
    return new String(range.array, range.offset, range.length, StandardCharsets.ISO_8859_1);
  }

  private static Object ucs2Slice(Context cx, VarScope s, Object lt, Object[] args) {
    BufferRange range = getSliceRange(args);
    return new String(range.array, range.offset, range.length, StandardCharsets.UTF_16LE);
  }

  private static final char[] HEX_CHARS = "0123456789abcdef".toCharArray();

  private static String bytesToHex(byte[] bytes, int offset, int length) {
    char[] hexChars = new char[length * 2];
    for (int i = 0; i < length; i++) {
      int v = bytes[offset + i] & 0xFF;
      hexChars[i * 2] = HEX_CHARS[v >>> 4];
      hexChars[i * 2 + 1] = HEX_CHARS[v & 0x0F];
    }
    return new String(hexChars);
  }

  private static Object hexSlice(Context cx, VarScope s, Object lt, Object[] args) {
    BufferRange range = getSliceRange(args);
    return bytesToHex(range.array, range.offset, range.length);
  }

  private static String bytesToBase64(byte[] bytes, int offset, int length) {
    byte[] slice = new byte[length];
    System.arraycopy(bytes, offset, slice, 0, length);
    return Base64.getEncoder().encodeToString(slice);
  }

  private static Object base64Slice(Context cx, VarScope s, Object lt, Object[] args) {
    BufferRange range = getSliceRange(args);
    return bytesToBase64(range.array, range.offset, range.length);
  }

  private static String bytesToBase64Url(byte[] bytes, int offset, int length) {
    byte[] slice = new byte[length];
    System.arraycopy(bytes, offset, slice, 0, length);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(slice);
  }

  private static Object base64urlSlice(Context cx, VarScope s, Object lt, Object[] args) {
    BufferRange range = getSliceRange(args);
    return bytesToBase64Url(range.array, range.offset, range.length);
  }

  private static Object utf8Slice(Context cx, VarScope s, Object lt, Object[] args) {
    BufferRange range = getSliceRange(args);
    return new String(range.array, range.offset, range.length, StandardCharsets.UTF_8);
  }

  private static int writeStatic(
      Object[] args, java.nio.charset.Charset charset, boolean evenBytesOnly) {
    WriteArgs w = getWriteArgs(args);
    if (w.maxBytesToWrite == 0) {
      return 0;
    }
    byte[] strBytes = w.str.getBytes(charset);
    int written = Math.min(strBytes.length, w.maxBytesToWrite);
    if (evenBytesOnly) {
      written = written - (written % 2);
    }
    System.arraycopy(strBytes, 0, w.array, w.targetOffset, written);
    return written;
  }

  private static Object utf8WriteStatic(Context cx, VarScope s, Object lt, Object[] args) {
    return writeStatic(args, StandardCharsets.UTF_8, false);
  }

  private static Object asciiWriteStatic(Context cx, VarScope s, Object lt, Object[] args) {
    return writeStatic(args, StandardCharsets.US_ASCII, false);
  }

  private static Object latin1WriteStatic(Context cx, VarScope s, Object lt, Object[] args) {
    return writeStatic(args, StandardCharsets.ISO_8859_1, false);
  }

  private static Object ucs2Write(Context cx, VarScope s, Object lt, Object[] args) {
    return writeStatic(args, StandardCharsets.UTF_16LE, true);
  }

  private static Object hexWrite(Context cx, VarScope s, Object lt, Object[] args) {
    WriteArgs w = getWriteArgs(args);
    if (w.maxBytesToWrite == 0) {
      return 0;
    }
    String hex = w.str;
    int len = hex.length();
    if (len % 2 != 0) {
      len--;
    }
    int bytesToDecode = Math.min(len / 2, w.maxBytesToWrite);
    for (int i = 0; i < bytesToDecode; i++) {
      int high = Character.digit(hex.charAt(i * 2), 16);
      int low = Character.digit(hex.charAt(i * 2 + 1), 16);
      if (high == -1 || low == -1) {
        return i;
      }
      w.array[w.targetOffset + i] = (byte) ((high << 4) | low);
    }
    return bytesToDecode;
  }

  private static Object base64Write(Context cx, VarScope s, Object lt, Object[] args) {
    WriteArgs w = getWriteArgs(args);
    if (w.maxBytesToWrite == 0) {
      return 0;
    }
    try {
      byte[] decoded = Base64.getDecoder().decode(w.str);
      int written = Math.min(decoded.length, w.maxBytesToWrite);
      System.arraycopy(decoded, 0, w.array, w.targetOffset, written);
      return written;
    } catch (IllegalArgumentException e) {
      try {
        byte[] decoded = Base64.getMimeDecoder().decode(w.str);
        int written = Math.min(decoded.length, w.maxBytesToWrite);
        System.arraycopy(decoded, 0, w.array, w.targetOffset, written);
        return written;
      } catch (IllegalArgumentException e2) {
        return 0;
      }
    }
  }

  private static Object base64urlWrite(Context cx, VarScope s, Object lt, Object[] args) {
    WriteArgs w = getWriteArgs(args);
    if (w.maxBytesToWrite == 0) {
      return 0;
    }
    try {
      byte[] decoded = Base64.getUrlDecoder().decode(w.str);
      int written = Math.min(decoded.length, w.maxBytesToWrite);
      System.arraycopy(decoded, 0, w.array, w.targetOffset, written);
      return written;
    } catch (IllegalArgumentException e) {
      return base64Write(cx, s, lt, args);
    }
  }
}
