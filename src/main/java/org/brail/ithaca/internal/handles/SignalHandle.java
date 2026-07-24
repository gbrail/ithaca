package org.brail.ithaca.internal.handles;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.bindings.NodeConstants;
import org.brail.ithaca.internal.common.ArgUtils;
import org.mozilla.javascript.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SignalHandle extends Handle {
  private static final Logger log = LoggerFactory.getLogger(SignalHandle.class);

  private Thread hook;
  private Callable onSignal;

  public SignalHandle(Environment env) {
    super(env);
  }

  @Override
  public String getClassName() {
    return "Signal";
  }

  private static SignalHandle realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, SignalHandle.class);
  }

  @Override
  protected void close() {
    log.debug("close");
  }

  public static Scriptable js_constructor(Environment e) {
    log.debug("constructor");
    return new SignalHandle(e);
  }

  public static Object js_start(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    var self = realThis(to);
    int sig = ScriptRuntime.toInt32(args[0]);
    if (sig != NodeConstants.Signals.SIGINT && sig != NodeConstants.Signals.SIGTERM) {
      log.warn("Ignoring attempt to listen for signal {}", sig);
      return 0;
    }
    log.debug("Installing shutdown hook for signal {}", sig);
    self.hook =
        new Thread(
            () -> {
              self.environment.deliverCallback(
                  (lcx) -> {
                    log.debug("Delivering shutdown hook for {}", sig);
                    self.onSignal.call(lcx, s, null, ScriptRuntime.emptyArgs);
                  });
            },
            "Ithaca Shutdown Hook");
    Runtime.getRuntime().addShutdownHook(self.hook);
    return 0;
  }

  public static Object js_stop(Context cx, VarScope s, Object to, Object[] args) {
    var self = realThis(to);
    if (self.hook != null) {
      Runtime.getRuntime().removeShutdownHook(self.hook);
      self.hook = null;
    }
    return 0;
  }

  public static Object get_onSignal(Scriptable to) {
    var self = realThis(to);
    if (self.onSignal != null) {
      return self.onSignal;
    }
    return Undefined.instance;
  }

  public static void set_onSignal(Scriptable to, Object o) {
    realThis(to).onSignal = (Callable) o;
  }
}
