package org.brail.ithaca.internal;

import java.util.function.Consumer;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MainLoop {
  private static final Logger log = LoggerFactory.getLogger(MainLoop.class);

  public void run(Context cx, VarScope s, Environment e) {
    log.debug("Running the main loop");
    runAllCallbacks(cx, s, e);
    while (e.isReferenced()) {
      log.debug("Ref count is {}", e.getRefCount());
      waitForCallbacks(cx, e);
      clearCallbacks(cx, e);
      runAllCallbacks(cx, s, e);
    }
    log.debug("Ref count is zero, exiting");
    clearCallbacks(cx, e);
    runAllCallbacks(cx, s, e);
  }

  private void waitForCallbacks(Context cx, Environment e) {
    try {
      e.debugReferences();
      // First time, may need to wait for a callback
      var cb = e.callbacks().take();
      cb.accept(cx);
    } catch (InterruptedException ex) {
      log.debug("Interrupted, continuing");
    }
  }

  private void clearCallbacks(Context cx, Environment e) {
    Consumer<Context> cb;
    while ((cb = e.callbacks().poll()) != null) {
      cb.accept(cx);
    }
  }

  private void runAllCallbacks(Context cx, VarScope s, Environment e) {
    var timers = e.getTimers();
    var taskQueue = e.getTaskQueue();
    taskQueue.processTicks(cx, s);
    timers.processImmediate(cx, s);
    timers.processTimers(cx, s);
    cx.processMicrotasks();
  }
}
