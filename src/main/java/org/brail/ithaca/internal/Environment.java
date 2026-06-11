package org.brail.ithaca.internal;

import org.mozilla.javascript.Callable;

public class Environment {
  private Callable internalBinding;
  private Callable requireBuiltin;

  public Callable internalBinding() {
    return internalBinding;
  }

  public void setInternalBinding(Callable internalBinding) {
    this.internalBinding = internalBinding;
  }

  public Callable requireBuiltin() {
    return requireBuiltin;
  }

  public void setRequireBuiltin(Callable requireBuiltin) {
    this.requireBuiltin = requireBuiltin;
  }
}
