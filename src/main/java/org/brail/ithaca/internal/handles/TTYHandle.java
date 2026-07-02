package org.brail.ithaca.internal.handles;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TTYHandle extends Stream {
  private static final Logger log = LoggerFactory.getLogger(TTYHandle.class);

  @Override
  public String getClassName() {
    return "TTY";
  }

  public static Object js_constructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    if (args.length < 1) {
      return Undefined.instance;
    }
    int fd = ScriptRuntime.toInt32(args[0]);
    log.debug("constructor for fd {}", fd);
    var h = new TTYHandle();
    h.setPrototype((Scriptable) f.getPrototypeProperty());
    h.setParentScope(f.getDeclarationScope());
    return h;
  }

  public static Object js_getWindowSize(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("getWindowSize");
    return Undefined.instance;
  }

  public static Object js_setRawMode(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("setRawMode");
    return Undefined.instance;
  }

  public static Object js_isTty(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("isTty");
    return Undefined.instance;
  }
}
