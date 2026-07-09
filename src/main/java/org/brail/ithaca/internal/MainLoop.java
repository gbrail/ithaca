package org.brail.ithaca.internal;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MainLoop {
  private static final Logger log = LoggerFactory.getLogger(MainLoop.class);

  public void run(Context cx, VarScope s, Environment e) {
    log.debug("Running the main loop");
    // TODO No event loop yet -- just once and out!
    var timers = e.getTimers();
    assert timers != null;
    var taskQueue = e.getTaskQueue();
    assert taskQueue != null;

    taskQueue.processTicks(cx, s);
    timers.processImmediate(cx, s);
    timers.processTimers(cx, s);
    cx.processMicrotasks();
  }
}
