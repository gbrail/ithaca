package org.brail.ithaca.internal.handles;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class Handle extends ScriptableObject {
  private static final Logger log = LoggerFactory.getLogger(Handle.class);

  protected final Environment environment;

  protected volatile boolean referenced;
  protected boolean closed;

  protected Handle(Environment env) {
    this.environment = env;
  }

  @Override
  public String getClassName() {
    return "Handle";
  }

  protected abstract void close();

  protected void reference() {
    assert !referenced;
    referenced = false;
  }

  protected void unreference() {
    referenced = false;
  }

  // JavaScript interface below

  private static Handle realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, Handle.class);
  }

  public static Object js_close(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("close");
    var self = realThis(to);
    self.close();
    self.closed = true;
    if (self.referenced) {
      self.environment.unreference(self);
      self.referenced = false;
    }
    return Undefined.instance;
  }

  /**
   * ref and unref set the "referenced" flag but do not register with the environment because that
   * depends on whether we are reading or writing.
   */
  public static Object js_unref(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("unref: {}", to);
    realThis(to).unreference();
    return Undefined.instance;
  }

  public static Object js_ref(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("ref");
    realThis(to).reference();
    return Undefined.instance;
  }

  public static Object js_hasRef(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("hasRef");
    return realThis(to).referenced;
  }
}
