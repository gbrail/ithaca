package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.brail.ithaca.internal.Bootstrapper;
import org.brail.ithaca.internal.Environment;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;

public class SmokeTest {
  @Test
  public void testBootstrap() {
    try (Context cx = Context.enter()) {
      var scope = cx.initStandardObjects();
      var env = new Environment();
      env.setArgv(new String[] {});
      assertDoesNotThrow(env::loadOptions);
      assertDoesNotThrow(() -> Bootstrapper.bootstrap(cx, scope, env));
    }
  }

  @Test
  public void testConsoleOut() {
    try (Context cx = Context.enter()) {
      var scope = cx.initStandardObjects();
      var env = new Environment();
      env.setArgv(new String[] {"-e", "console.log('Hello, World!');"});
      assertDoesNotThrow(env::loadOptions);
      assertDoesNotThrow(
          () -> {
            var boot = Bootstrapper.bootstrap(cx, scope, env);
            boot.runMain(cx, scope, Bootstrapper.MainModule.EVAL_STRING);
          });
    }
  }
}
