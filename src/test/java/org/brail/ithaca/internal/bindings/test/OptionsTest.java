package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.common.NodeOption;
import org.brail.ithaca.internal.common.OptionProcessor;
import org.junit.jupiter.api.Test;

public class OptionsTest {
  public static class TestOpts {
    @NodeOption(name = "string_opt")
    public String s1;

    @NodeOption(name = "int_opt")
    public int i1;

    @NodeOption(name = "bool_opt")
    public boolean b1;

    @NodeOption(name = "list_opt")
    public List<String> l1;
  }

  @Test
  public void testParsing() throws NodeException {
    var p = new OptionProcessor<>(TestOpts.class);
    var r =
        p.load(List.of("--string_opt=foo", "--int_opt=123", "--bool_opt=TRUE", "--list_opt=1,2,3"));
    assertTrue(r.remaining().isEmpty());
    assertEquals("foo", r.result().s1);
    assertEquals(123, r.result().i1);
    assertTrue(r.result().b1);
    assertEquals(3, r.result().l1.size());
  }
}
