package org.brail.ithaca.integration;

import com.google.devtools.build.runfiles.Runfiles;
import java.io.IOException;
import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.Bootstrapper;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.MainLoop;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;

public abstract class IntegrationRunner {
  private final String testFile;

  protected IntegrationRunner(String testFile) {
    this.testFile = testFile;
  }

  @Test
  public void integrationTest() throws NodeException, IOException {
    var runfiles = Runfiles.preload();
    var loc = runfiles.unmapped().rlocation("_main/tests/" + testFile);
    Environment env = new Environment();
    env.setArgv(new String[] {loc});
    env.loadOptions();

    try (Context cx = Context.enter()) {
      var scope = cx.initSafeStandardObjects();
      var boot = Bootstrapper.bootstrap(cx, scope, env);
      boot.runMain(cx, scope, Bootstrapper.MainModule.MAIN);
      var loop = new MainLoop();
      loop.run(cx, scope, env);
    }
  }
}
