package org.brail.ithaca.internal.common;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CoderResult;
import java.nio.charset.CodingErrorAction;

public class DecoderState {
  private final CharsetDecoder decoder;
  private byte[] leftovers = new byte[0];

  public DecoderState(Charset cs) {
    this.decoder =
        cs.newDecoder()
            .onMalformedInput(CodingErrorAction.REPLACE)
            .onUnmappableCharacter(CodingErrorAction.REPLACE);
  }

  public int bufferedBytes() {
    return leftovers.length;
  }

  /**
   * Consume the contents of "buf" and return a String containing all characters that can be
   * completely decoded. Store all incomplete data from "buf" for future calls.
   */
  public String decode(byte[] buf, int off, int len) {
    ByteBuffer in;

    if (leftovers.length == 0) {
      in = ByteBuffer.wrap(buf, off, len);
    } else {
      in = ByteBuffer.allocate(leftovers.length + len);
      in.put(leftovers);
      in.put(buf, off, len);
      in.flip();
    }

    int capacity = Math.max(8, (int) (in.remaining() * decoder.averageCharsPerByte()));
    CharBuffer out = CharBuffer.allocate(capacity);

    while (true) {
      CoderResult result = decoder.decode(in, out, false);
      if (result.isUnderflow()) break;
      if (result.isOverflow()) {
        int newCap = Math.max(out.capacity() * 2, out.capacity() + 1024);
        CharBuffer newOut = CharBuffer.allocate(newCap);
        out.flip();
        newOut.put(out);
        out = newOut;
      }
    }

    out.flip();
    String s = out.toString();

    int remaining = in.remaining();
    leftovers = new byte[remaining];
    in.get(leftovers);

    return s;
  }

  /**
   * Process any remaining data from previous calls to "decode" and return the decoded result, or an
   * empty string.
   */
  public String flush() {
    if (leftovers.length == 0) return "";

    ByteBuffer in = ByteBuffer.wrap(leftovers);
    int capacity = (int) (leftovers.length * decoder.maxCharsPerByte()) + 1;
    CharBuffer out = CharBuffer.allocate(capacity);

    decoder.decode(in, out, true);
    decoder.flush(out);
    out.flip();
    String s = out.toString();

    leftovers = new byte[0];
    return s;
  }
}
