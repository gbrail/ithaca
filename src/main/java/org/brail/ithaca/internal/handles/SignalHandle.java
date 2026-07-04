package org.brail.ithaca.internal.handles;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SignalHandle extends Handle {
  private static final Logger log = LoggerFactory.getLogger(SignalHandle.class);

  public SignalHandle(Environment env) {
    super(env);
  }

  @Override
  public String getClassName() {
    return "Signal";
  }

  public static Scriptable js_constructor(Environment e) {
    log.debug("constructor");
    return new SignalHandle(e);
  }

  public static Object js_start(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("start");
    return Undefined.instance;
  }

  public static Object js_stop(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("stop");
    return Undefined.instance;
  }
}
