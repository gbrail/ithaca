package org.brail.ithaca;

import org.brail.ithaca.internal.Bootstrapper;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.RhinoException;

public class Main {
  static void main(String[] args) {
    try (Context cx = Context.enter()) {
      var scope = cx.initStandardObjects();
      Bootstrapper.get().bootstrap(cx, scope);
    } catch (NodeException ne) {
      System.err.println("Bootstrapping error: " + ne);
    } catch (RhinoException e) {
      System.err.println("Script error: " + e);
      System.err.println(e.getScriptStackTrace());
    }
  }
}