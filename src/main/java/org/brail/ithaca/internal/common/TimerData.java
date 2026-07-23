package org.brail.ithaca.internal.common;

import java.util.Optional;
import java.util.PriorityQueue;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TimerData {
  private static final Logger log = LoggerFactory.getLogger(TimerData.class);

  // Constants that need to match values in internal/timers.js
  private static final int INFO_COUNT = 0;
  private static final int INFO_REF_COUNT = 1;
  private static final int INFO_HAS_OUTSTANDING = 2;

  // Flags so we can store both "referenced" values in a bit mask
  private static final int REF_IMMEDIATE = 1;
  private static final int REF_TIMER = 2;

  private final Environment environment;
  private final IntArray timeoutInfo = new IntArray(1);
  private final IntArray immediateInfo = new IntArray(3);
  private final PriorityQueue<Long> outstandingTimeouts = new PriorityQueue<>();

  private Callable immediateCallback;
  private Callable timerCallback;
  private int references;
  private long now;
  private boolean hasReadyTimeouts;

  public TimerData(Environment e) {
    this.environment = e;
    this.now = System.currentTimeMillis();
  }

  /** Return the current timestamp as periodically updated when we go through the event loop. */
  public long now() {
    return now;
  }

  /**
   * Indicate that it's time to move to the next event loop iteration. This is partly for
   * performance reasons, as we don't want to constantly call System.currentTimeMillis() but also
   * for correctness. We also update the timer queue here.
   */
  public void updateNow() {
    now = System.currentTimeMillis();
    hasReadyTimeouts = outstandingTimeouts.removeIf(t -> t <= now);
  }

  public void setImmediateRef(boolean r) {
    int oldRef = references;
    if (r) {
      references |= REF_IMMEDIATE;
    } else {
      references &= ~REF_IMMEDIATE;
    }
    fixReferences(oldRef);
  }

  public void setTimerRef(boolean r) {
    int oldRef = references;
    if (r) {
      references |= REF_TIMER;
    } else {
      references &= ~REF_TIMER;
    }
    fixReferences(oldRef);
  }

  public boolean referenced() {
    return references != 0;
  }

  private void fixReferences(int oldReferences) {
    if (references != 0 && oldReferences == 0) {
      log.debug("Timers are referenced");
      // This doesn't seem to be necessary?
      // environment.reference(this);
    } else if (references == 0 && oldReferences != 0) {
      log.debug("Timers are no longer referenced");
      // environment.unreference(this);
    }
  }

  /**
   * Based on the array managed by JavaScript code, return whether there are immediate callbacks
   * waiting to be called.
   */
  public boolean outstandingImmediate() {
    return immediateInfo.get(INFO_COUNT) != 0;
  }

  /** Indicate that we have a timeout pending for the future. */
  public void scheduleTimeout(long delay) {
    outstandingTimeouts.add(now + delay);
  }

  /** Return how long until the next timeout fires, if at all. */
  public Optional<Long> nextDelay() {
    Long nextTimeout = outstandingTimeouts.peek();
    if (nextTimeout == null) {
      log.debug("No timers pending");
      return Optional.empty();
    }
    long next = Math.max(nextTimeout - now, 0);
    log.debug("Next timeout is in {} ms", next);
    return Optional.of(next);
  }

  /** If timers and callbacks are scheduled, process them. */
  public void runReadyTimeouts(Context cx, VarScope s) {
    if (outstandingImmediate()) {
      immediateCallback.call(cx, s, null, ScriptRuntime.emptyArgs);
    }
    if (hasReadyTimeouts) {
      timerCallback.call(cx, s, null, new Object[] {now});
    }
  }

  public IntArray timeoutInfo() {
    return timeoutInfo;
  }

  public IntArray immediateInfo() {
    return immediateInfo;
  }

  public void setCallbacks(Callable immediateCallback, Callable timerCallback) {
    this.immediateCallback = immediateCallback;
    this.timerCallback = timerCallback;
  }
}
