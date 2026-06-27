package org.brail.ithaca.internal.handles;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SignalHandle extends Handle {
  private static final Logger log = LoggerFactory.getLogger(SignalHandle.class);

  @Override
  public String getClassName() {
    return "Signal";
  }

  public static Scriptable js_constructor(Context cx, JSFunction f, Object nt, VarScope s, Object thisObj, Object[] args) {
    var h = new SignalHandle();
    h.setPrototype((Scriptable) f.getPrototypeProperty());
    h.setParentScope(f.getDeclarationScope());
    return h;
  }

  public static Object js_start(
          Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("start");
    return Undefined.instance;
  }

  public static Object js_stop(
          Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("stop");
    return Undefined.instance;
  }
}
