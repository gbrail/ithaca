package org.brail.ithaca.internal.bindings;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.brail.ithaca.internal.common.DecoderState;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Symbol;
import org.mozilla.javascript.SymbolKey;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeUint8Array;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StringDecoder {
  private static final Logger log = LoggerFactory.getLogger(StringDecoder.class);

  public enum Encoding {
    ASCII,
    UTF8,
    BASE64,
    UTF16LE,
    LATIN1,
    HEX,
    BUFFER,
    BASE64URL,
  }

  private static final SymbolKey CHARSET_DECODER =
      new SymbolKey("CharsetDecoder", Symbol.Kind.REGULAR);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    Constants.populate(cx, s, o, NodeConstants.StringDecoder.class);
    // Build array of lower-cased encodings array so that util.js
    // will be able to map it to ordinals
    var encodings = cx.newArray(s, Encoding.values().length);
    putEncoding(encodings, Encoding.ASCII);
    putEncoding(encodings, Encoding.UTF8);
    putEncoding(encodings, Encoding.BASE64);
    putEncoding(encodings, Encoding.UTF16LE);
    putEncoding(encodings, Encoding.LATIN1);
    putEncoding(encodings, Encoding.HEX);
    putEncoding(encodings, Encoding.BUFFER);
    putEncoding(encodings, Encoding.BASE64URL);
    o.put("encodings", o, encodings);
    // We'll get a Buffer of this length here
    o.put("kSize", o, NodeConstants.StringDecoder.kNumFields + 1);
    meth(o, s, "decode", 1, StringDecoder::decode);
    meth(o, s, "flush", 0, StringDecoder::flush);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static void putEncoding(Scriptable encodings, Encoding enc) {
    encodings.put(enc.ordinal(), encodings, enc.name().toLowerCase(Locale.ROOT));
  }

  /**
   * The JavaScript code for string_decoder creates a Buffer and passes it as the first argument.
   * Various fields in the buffer are used to communicate back to that code. However, rather than
   * stash incomplete encodings here, we'll also stash a CharsetDecoder in that same object using a
   * symbol.
   */
  private static Object decode(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(2, args);
    if (!(args[0] instanceof NativeUint8Array state)) {
      throw ScriptRuntime.typeError("state arg must be a Buffer");
    }
    if (!(args[1] instanceof NativeUint8Array buf)) {
      throw ScriptRuntime.typeError("buffer must be a Buffer");
    }

    DecoderState decoder;
    if (state.get(CHARSET_DECODER, state) instanceof DecoderState d) {
      decoder = d;
    } else {
      decoder = new DecoderState(getCharset(state));
      state.put(CHARSET_DECODER, state, decoder);
    }

    String ret =
        decoder.decode(buf.getBuffer().getBuffer(), buf.getByteOffset(), buf.getByteLength());
    state.set(NodeConstants.StringDecoder.kBufferedBytes, decoder.bufferedBytes());
    return ret;
  }

  private static Object flush(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    if (!(args[0] instanceof NativeUint8Array state)) {
      throw ScriptRuntime.typeError("state arg must be a Buffer");
    }

    if (state.get(CHARSET_DECODER, state) instanceof DecoderState decoder) {
      return decoder.flush();
    }
    return "";
  }

  private static Charset getCharset(NativeUint8Array state) {
    int stateByte = state.get(NodeConstants.StringDecoder.kEncodingField);
    if (stateByte == Encoding.ASCII.ordinal()) {
      return StandardCharsets.US_ASCII;
    }
    if (stateByte == Encoding.UTF8.ordinal()) {
      return StandardCharsets.UTF_8;
    }
    if (stateByte == Encoding.UTF16LE.ordinal()) {
      return StandardCharsets.UTF_16LE;
    }
    if (stateByte == Encoding.LATIN1.ordinal()) {
      // Is this really "latin1" or "binary"?
      return StandardCharsets.ISO_8859_1;
    }
    // TODO hex, base64, etc.
    throw ScriptRuntime.typeError("Unknown encoding " + stateByte);
  }
}
