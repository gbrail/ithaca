package org.brail.ithaca.internal;

import java.util.Optional;
import java.util.Queue;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MainLoop {
  private static final Logger log = LoggerFactory.getLogger(MainLoop.class);

  /**
   * The main event loop. In general:
   *
   * <ol>
   *   <li>Update the current time for event loop purposes
   *   <li>Process any outstanding calls from the callback queue
   *   <li>Conditionally invoke ticks, immediate calls, and timers
   *   <li>Get timeout until the next iteration of the loop, if any
   *   <li>Determine whether to continue the event loop
   * </ol>
   */
  public void run(Context cx, VarScope s, Environment e) {
    var timers = e.timers();
    var taskQueue = e.taskQueue();
    var callbacks = e.callbacks();
    boolean keepRunning = true;
    var nextDelay = Optional.of(0L);

    do {
      Consumer<Context> firstCallback = null;
      if (nextDelay.isPresent()) {
        var delay = nextDelay.get();
        if (delay > 0) {
          // If delay is zero, we will efficiently clear the queue soon.
          log.debug("Waiting for {} ms for a callback", nextDelay.get());
          try {
            firstCallback = callbacks.poll(nextDelay.get(), TimeUnit.MILLISECONDS);
          } catch (InterruptedException ex) {
            log.debug("Interrupted, continuing anyway");
          }
        }
      } else {
        log.debug("Waiting indefinitely for a callback");
        try {
          firstCallback = callbacks.take();
        } catch (InterruptedException ex) {
          log.debug("Interrupted, continuing anyway");
        }
      }

      // Always need to update our concept of "now"!
      timers.updateNow();

      // Clear whole callback queue
      runAllCallbacks(cx, callbacks, firstCallback);

      // Based on internal state, call ticks, immediate calls, and timers
      taskQueue.processTicks(cx, s);
      timers.runReadyTimeouts(cx, s);

      // Now we need to figure out if we need to stay alive
      keepRunning = false;

      log.debug("Handle reference count is {}", e.refCount());
      if (e.isReferenced()) {
        // There are handles that need us to keep alive, even forever
        e.debugReferences();
        keepRunning = true;
      }

      if (!callbacks.isEmpty()) {
        // Absolutely need to run immediately
        nextDelay = Optional.of(0L);
        keepRunning = true;
      } else if (taskQueue.tickScheduled() || timers.outstandingImmediate()) {
        // Need to process tasks immediately
        nextDelay = Optional.of(0L);
        // Timers might be scheduled, but if all unreferenced, we can exit
        keepRunning |= timers.referenced();
      } else if (timers.outstandingTimeout()) {
        // Don't need immediate timers, but do need to delay
        nextDelay = timers.nextDelay();
        keepRunning |= timers.referenced();
      } else {
        // No timers scheduled but if keepRunning is true we should
        // block indefinitely for an event
        nextDelay = Optional.empty();
      }

    } while (keepRunning);

    log.debug("Main loop exited");
  }

  private void runAllCallbacks(
      Context cx, Queue<Consumer<Context>> q, Consumer<Context> firstItem) {
    if (firstItem != null) {
      firstItem.accept(cx);
    }
    Consumer<Context> cb;
    while ((cb = q.poll()) != null) {
      cb.accept(cx);
    }
  }
}
