package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.*;

import org.brail.ithaca.internal.bindings.Process;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

class ProcessTest {

  private Context context;
  private VarScope scope;

  @BeforeEach
  void setUp() {
    context = Context.enter();
    context.setLanguageVersion(Context.VERSION_ES6);
    this.scope = (VarScope) context.initStandardObjects();
  }

  @AfterEach
  void tearDown() {
    Context.exit();
  }

  @Test
  void testVersion() {
    Scriptable process = Process.init(context, scope);
    Object version = process.get("version", process);
    assertEquals("24.0.0", version);
  }

  @Test
  void testVersions() {
    Scriptable process = Process.init(context, scope);
    Object versionsObj = process.get("versions", process);
    assertNotNull(versionsObj);
    assertInstanceOf(Scriptable.class, versionsObj);

    Scriptable versions = (Scriptable) versionsObj;
    assertEquals("24.0.0", versions.get("node", versions));
    assertEquals("0.0.1", versions.get("ithaca", versions));
  }
}
