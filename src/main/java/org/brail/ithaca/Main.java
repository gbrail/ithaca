package org.brail.ithaca;

import org.brail.ithaca.internal.Bootstrapper;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.MainLoop;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.RhinoException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {
  private static final Logger log = LoggerFactory.getLogger(Main.class);

  static void main(String[] args) {
    try (Context cx = Context.enter()) {
      var scope = cx.initStandardObjects();
      var env = new Environment();
      env.setArgv(args);

      Bootstrapper boot;
      Bootstrapper.MainModule mainMod;

      try {
        env.loadOptions();
        var opts = env.getOptions();
        assert opts != null;

        boot = Bootstrapper.bootstrap(cx, scope, env);

        if (opts.eval != null) {
          mainMod = Bootstrapper.MainModule.EVAL_STRING;
        } else if (opts.test) {
          mainMod = Bootstrapper.MainModule.TEST;
        } else {
          log.error("Only --eval and --test supported");
          System.exit(2);
          return;
        }
      } catch (NodeException ne) {
        log.error("Error in bootstrapping: {}", ne, ne);
        System.exit(3);
        return;
      }

      try {
        boot.runMain(cx, scope, mainMod);
        var loop = new MainLoop();
        loop.run(cx, scope, env);
      } catch (NodeException ne) {
        log.error("Error running script: {}", ne, ne);
        System.exit(4);
      }

    } catch (RhinoException e) {
      log.error("Script error: {}\n{}", e, e.getScriptStackTrace());
      System.exit(5);
    }
  }
}
