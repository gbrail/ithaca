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
      var boot = Bootstrapper.bootstrap(cx, scope, env);
      boot.runMain(cx, scope, Bootstrapper.MainModule.EVAL_STRING);
      var loop = new MainLoop();
      loop.run(cx, scope, env);
    } catch (NodeException ne) {
      System.err.println("Bootstrapping error: " + ne);
    } catch (RhinoException e) {
      System.err.println("Script error: " + e);
      System.err.println(e.getScriptStackTrace());
    }
  }
}
