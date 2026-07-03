package org.brail.ithaca.internal.handles;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Handle extends ScriptableObject {
  private static final Logger log = LoggerFactory.getLogger(Handle.class);

  protected Environment environment;

  protected boolean referenced;
  protected boolean closed;

  @Override
  public String getClassName() {
    return "Handle";
  }

  private static Handle realThis(Object to) {
    return LambdaConstructor.convertThisObject(to, Handle.class);
  }

  protected void setEnvironment(Environment e) {
    this.environment = e;
  }

  public static Object js_close(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("close");
    var self = realThis(to);
    self.closed = true;
    if (self.referenced) {
      self.environment.decrementRefCount();
      self.referenced = false;
    }
    return Undefined.instance;
  }

  public static Object js_unref(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("unref: {}", to);
    var self = realThis(to);
    assert self.referenced;
    self.referenced = false;
    self.environment.decrementRefCount();
    return Undefined.instance;
  }

  public static Object js_ref(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("ref");
    var self = realThis(to);
    assert !self.referenced;
    self.referenced = true;
    self.environment.incrementRefCount();
    return Undefined.instance;
  }

  public static Object js_hasRef(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("hasRef");
    return realThis(to).referenced;
  }
}
