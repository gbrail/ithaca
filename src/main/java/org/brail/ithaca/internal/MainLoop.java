package org.brail.ithaca.internal;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MainLoop {
  private static final Logger log = LoggerFactory.getLogger(MainLoop.class);

  public void run(Context cx, VarScope s, Environment e) {
    log.debug("Running the main loop");
    // TODO just once until we get the hang of this!
    var timers = e.getTimers();
    assert timers != null;
    timers.processImmediate(cx, s);
    timers.processTimers(cx, s);
    cx.processMicrotasks();
    if (e.getRefCount() > 0) {
      log.warn("Handle ref count is still {}!", e.getRefCount());
      e.debugReferences();
    }
  }
}
