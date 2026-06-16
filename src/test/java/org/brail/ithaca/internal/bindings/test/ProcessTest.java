package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.*;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.bindings.Process;
import org.brail.ithaca.internal.bindings.ProcessMethods;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeUint32Array;

class ProcessTest {

  private Context context;
  private VarScope scope;
  private Environment environment;

  @BeforeEach
  void setUp() {
    environment = new Environment();
    context = Context.enter();
    context.setLanguageVersion(Context.VERSION_ES6);
    this.scope = context.initStandardObjects();
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

  @Test
  void testHrtime() {
    var pm = ProcessMethods.init(environment, context, scope);
    var timeBuf = (NativeUint32Array) pm.get("hrtimeBuffer", pm);
    var hrtime = (Callable) pm.get("hrtime", pm);
    hrtime.call(context, scope, null, new Object[] {});
    assertTrue(timeBuf.get(0) >= 0);
    assertTrue(timeBuf.get(1) >= 0);
  }
}
