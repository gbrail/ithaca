package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.brail.ithaca.internal.bindings.Constants;
import org.junit.jupiter.api.Test;

class ConstantsParseTest {

  @Test
  void parseEmptyStream() throws Exception {
    var input = new ByteArrayInputStream("".getBytes(StandardCharsets.UTF_8));
    Map<String, Integer> result = Constants.parseConstants(input);
    assertTrue(result.isEmpty());
  }

  @Test
  void parseSingleConstant() throws Exception {
    var content = "FOO 7\n";
    var input = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    Map<String, Integer> result = Constants.parseConstants(input);
    assertEquals(1, result.size());
    assertEquals(7, result.get("FOO"));
  }

  @Test
  void parseMultipleConstants() throws Exception {
    var content = "BAR 13\nBAZ 11\nQUX 98\n";
    var input = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    Map<String, Integer> result = Constants.parseConstants(input);
    assertEquals(3, result.size());
    assertEquals(13, result.get("BAR"));
    assertEquals(11, result.get("BAZ"));
    assertEquals(98, result.get("QUX"));
  }

  @Test
  void parseSkipsMalformedLines() throws Exception {
    var content = "GOODLINE 42\nthis is not a constant\n\nBAD\tFORMAT\t123\n";
    var input = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    Map<String, Integer> result = Constants.parseConstants(input);
    assertEquals(1, result.size());
    assertEquals(42, result.get("GOODLINE"));
  }

  @Test
  void parseSkipsBlankLines() throws Exception {
    var content = "\nFOO 13\n\n\nBAR 11\n";
    var input = new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    Map<String, Integer> result = Constants.parseConstants(input);
    assertEquals(2, result.size());
    assertEquals(13, result.get("FOO"));
    assertEquals(11, result.get("BAR"));
  }

  @Test
  void parseFromResource() throws Exception {
    Map<String, Integer> result =
        Constants.loadConstantsFromResource("constants/test/test_errnos.txt");
    assertEquals(8, result.size());
    assertEquals(7, result.get("E2BIG"));
    assertEquals(13, result.get("EACCES"));
    assertEquals(11, result.get("EAGAIN"));
    assertEquals(97, result.get("EAFNOSUPPORT"));
    assertEquals(123, result.get("kAnotherConstant"));
  }
}
