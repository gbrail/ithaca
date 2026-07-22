package org.brail.ithaca;

import org.brail.ithaca.internal.Bootstrapper;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.MainLoop;
import org.brail.ithaca.internal.common.Options;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.RhinoException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Console;

public class Main {
  static void main(String[] args) {
    var env = new Environment();
    env.setArgv(args);
    Options opts;
    try {
      env.loadOptions();
      opts = env.getOptions();
      if (opts.javaLog != null) {
        System.setProperty("org.slf4j.simpleLogger.defaultLogLevel", opts.javaLog.toLowerCase());
      }
    } catch (NodeException ne) {
      LoggerFactory.getLogger(Main.class).error("Error loading options: {}", ne, ne);
      System.exit(3);
      return;
    }

    Logger log = LoggerFactory.getLogger(Main.class);

    try (Context cx = Context.enter()) {
      var scope = cx.initStandardObjects();

      Bootstrapper boot;
      Bootstrapper.MainModule mainMod;

      try {
        boot = Bootstrapper.bootstrap(cx, scope, env);

        if (opts.help) {
          mainMod = Bootstrapper.MainModule.HELP;
        } else if (opts.test) {
          mainMod = Bootstrapper.MainModule.TEST;
        } else if (opts.eval != null) {
          mainMod = Bootstrapper.MainModule.EVAL_STRING;
        } else if (env.argv().length > 1) {
          // This seems correct -- user likely passed a file name
          mainMod = Bootstrapper.MainModule.MAIN;
        } else if (System.console() != null) {
          mainMod = Bootstrapper.MainModule.REPL;
        } else {
          mainMod = Bootstrapper.MainModule.STDIN;
        }
      } catch (NodeException ne) {
        log.error("Error in bootstrapping: {}", ne.getMessage(), ne);
        System.exit(3);
        return;
      }

      try {
        boot.runMain(cx, scope, mainMod);
        var loop = new MainLoop();
        loop.run(cx, scope, env);
      } catch (NodeException ne) {
        log.error("Error running script: {}", ne.getMessage(), ne);
        System.exit(4);
      }

    } catch (RhinoException e) {
      log.error("Script error: {}\n{}", e.getMessage(), e.getScriptStackTrace());
      log.debug("Stack trace: {}", e, e);
      System.exit(5);
    }
  }
}
