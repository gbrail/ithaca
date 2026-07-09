package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.common.NodeOption;
import org.brail.ithaca.internal.common.OptionProcessor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class OptionsTest {
  private Context cx;
  private VarScope scope;

  public static class TestOpts {
    @NodeOption(name = "string_opt", shortName = "s")
    public String s1;

    @NodeOption(name = "int_opt")
    public int i1;

    @NodeOption(name = "bool_opt")
    public boolean b1;

    @NodeOption(name = "bool_opt2", shortName = "b")
    public boolean b2;

    @NodeOption(name = "list_opt")
    public List<String> l1;
  }

  @BeforeEach
  public void init() {
    cx = Context.enter();
    scope = cx.initStandardObjects();
  }

  @AfterEach
  public void destroy() {
    Context.exit();
  }

  @Test
  public void testParsing() throws NodeException {
    var p = new OptionProcessor<>(TestOpts.class);
    var r =
        p.load(
            List.of(
                "--string_opt=foo",
                "--int_opt=123",
                "--bool_opt=TRUE",
                "--no-bool_opt2",
                "--list_opt=1,2,3"));
    assertTrue(r.remaining().isEmpty());
    assertEquals("foo", r.result().s1);
    assertEquals(123, r.result().i1);
    assertTrue(r.result().b1);
    assertFalse(r.result().b2);
    assertEquals(3, r.result().l1.size());
    assertTrue(r.remaining().isEmpty());

    var so = cx.newObject(scope);
    p.storeOptions(cx, scope, so, r.result());
    assertEquals("foo", so.get("--string_opt", so));
    assertEquals(123, so.get("--int_opt", so));
    assertEquals(true, so.get("--bool_opt", so));
    var a = (Scriptable) so.get("--list_opt", so);
    assertEquals(3.0, a.get("length", a));

    var flags = p.getOptionsAsFlags(cx, scope, r.result());
    assertEquals(5.0, flags.get("length", flags));
  }

  @Test
  public void testParsing2() throws NodeException {
    var p = new OptionProcessor<>(TestOpts.class);
    var r =
        p.load(
            List.of(
                "--string_opt",
                "foo",
                "--int_opt",
                "123",
                "--bool_opt",
                "--bool_opt2",
                "--list_opt",
                "1,2,3"));
    assertTrue(r.remaining().isEmpty());
    assertEquals("foo", r.result().s1);
    assertEquals(123, r.result().i1);
    assertTrue(r.result().b1);
    assertTrue(r.result().b2);
    assertEquals(3, r.result().l1.size());
    assertTrue(r.remaining().isEmpty());

    var so = cx.newObject(scope);
    p.storeOptions(cx, scope, so, r.result());
    assertEquals("foo", so.get("--string_opt", so));
    assertEquals(123, so.get("--int_opt", so));
    assertEquals(true, so.get("--bool_opt", so));
    assertEquals(true, so.get("--bool_opt2", so));
    var a = (Scriptable) so.get("--list_opt", so);
    assertEquals(3.0, a.get("length", a));
  }

  @Test
  public void testParsing3() throws NodeException {
    var p = new OptionProcessor<>(TestOpts.class);
    var r = p.load(List.of("-s", "foo", "--bool_opt", "-b"));
    assertTrue(r.remaining().isEmpty());
    assertEquals("foo", r.result().s1);
    assertTrue(r.result().b1);
    assertTrue(r.result().b2);
    assertTrue(r.remaining().isEmpty());
  }
}
