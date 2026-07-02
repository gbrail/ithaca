package org.brail.ithaca.internal;

import org.brail.ithaca.internal.bindings.Timers;
import org.mozilla.javascript.Callable;

public class Environment {
  /** Args passed to "main" */
  private String[] argv;

  /** Are we the main thread? */
  private boolean mainThread;

  /** Set up by realm.js to bootstrap node */
  private Callable internalBinding;

  private Callable requireBuiltin;

  /** Internal bindings we may need to share */
  private Timers timerBinding;

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

  public void setTimers(Timers timerBinding) {
    this.timerBinding = timerBinding;
  }

  public Timers getTimers() {
    return timerBinding;
  }

  public String[] argv() {
    return argv;
  }

  public void setArgv(String[] argv) {
    this.argv = argv;
  }

  public boolean mainThread() {
    return mainThread;
  }

  public void setMainThread(boolean m) {
    this.mainThread = m;
  }
}
