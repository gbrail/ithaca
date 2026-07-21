package org.brail.ithaca.internal.common;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

public class DecoderStateTest {

  @Test
  public void testBasicDecode() {
    DecoderState state = new DecoderState(StandardCharsets.UTF_8);
    String result = state.decode("Hello World".getBytes(StandardCharsets.UTF_8), 0, 11);
    assertEquals("Hello World", result);
    assertEquals("", state.flush());
  }

  @Test
  public void testPartialDecode() {
    DecoderState state = new DecoderState(StandardCharsets.UTF_8);
    // "你好" in UTF-8 is E4 BD A0 E5 A5 BD
    byte[] data = {(byte) 0xE4, (byte) 0xBD, (byte) 0xA0, (byte) 0xE5, (byte) 0xA5, (byte) 0xBD};

    // Read first 2 bytes: E4 BD (incomplete char)
    String res1 = state.decode(data, 0, 2);
    assertEquals("", res1);

    // Read next 2 bytes: A0 E5 (completes first char, starts second)
    String res2 = state.decode(data, 2, 2);
    assertEquals("你", res2);

    // Read last 2 bytes: A5 BD (completes second char)
    String res3 = state.decode(data, 4, 2);
    assertEquals("好", res3);

    assertEquals("", state.flush());
  }

  @Test
  public void testFlush() {
    DecoderState state = new DecoderState(StandardCharsets.UTF_8);
    byte[] data = {(byte) 0xE4, (byte) 0xBD}; // Incomplete "你"
    state.decode(data, 0, 2);

    // Flush should handle the remaining partial character by replacing it
    String result = state.flush();
    assertEquals("\uFFFD", result);
  }

  @Test
  public void testMixedChunks() {
    DecoderState state = new DecoderState(StandardCharsets.UTF_8);
    byte[] chunk1 = "Hello ".getBytes(StandardCharsets.UTF_8);
    byte[] chunk2 = {(byte) 0xE4, (byte) 0xBD}; // partial 你
    byte[] chunk3 = {(byte) 0xA0}; // complete 你

    assertEquals("Hello ", state.decode(chunk1, 0, chunk1.length));
    assertEquals("", state.decode(chunk2, 0, chunk2.length));
    assertEquals("你", state.decode(chunk3, 0, chunk3.length));
  }
}
