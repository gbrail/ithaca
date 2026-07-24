package org.brail.ithaca.internal.common;

import java.util.Optional;
import java.util.PriorityQueue;
import java.util.concurrent.TimeUnit;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.*;
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
  private final PriorityQueue<Long> nextDelay = new PriorityQueue<>();

  private Callable immediateCallback;
  private Callable timerCallback;
  private int references;
  private long timeBase;
  private long now;

  public TimerData(Environment e) {
    this.environment = e;
    this.timeBase = TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
    this.now = 0;
  }

  /**
   * Return the current timestamp in milliseconds as periodically updated when we go through the
   * event loop.
   */
  public long now() {
    return now;
  }

  /**
   * Indicate that it's time to move to the next event loop iteration. This is partly for
   * performance reasons, as we don't want to constantly call System.currentTimeMillis() but also
   * for correctness.
   */
  public void updateNow() {
    now = TimeUnit.NANOSECONDS.toMillis(System.nanoTime()) - timeBase;
  }

  public void setImmediateRef(boolean r) {
    log.debug("setImmediateRef {}", r);
    int oldRef = references;
    if (r) {
      references |= REF_IMMEDIATE;
    } else {
      references &= ~REF_IMMEDIATE;
    }
    fixReferences(oldRef);
  }

  public void setTimerRef(boolean r) {
    log.debug("setTimerRef {}", r);
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
  public boolean outstandingTimeout() {
    log.debug("timeoutInfo: {}", timeoutInfo.get(0));
    return timeoutInfo.get(INFO_COUNT) != 0;
  }

  public boolean outstandingImmediate() {
    log.debug(
        "immediateInfo: {} {} {}",
        immediateInfo.get(0),
        immediateInfo.get(1),
        immediateInfo.get(2));
    return immediateInfo.get(INFO_COUNT) != 0;
  }

  /** Indicate that we have a timeout pending for the future. */
  public void scheduleTimeout(long delay, TimeUnit unit) {
    log.debug("scheduleTimeout {}", delay);
    nextDelay.add(unit.toMillis(delay));
  }

  /** Return how long until the next timeout fires, if at all. The result is in milliseconds. */
  public Optional<Long> nextDelay() {
    Long delay = nextDelay.poll();
    return delay == null ? Optional.empty() : Optional.of(delay);
  }

  /** If timers and callbacks are scheduled, process them. */
  public void runReadyTimeouts(Context cx, VarScope s) {
    runImmediate(cx, s);
    runTimers(cx, s);
  }

  private void runImmediate(Context cx, VarScope s) {
    // Follow the pattern of the C++ code that loops and catches exceptions
    while (outstandingImmediate()) {
      immediateCallback.call(cx, s, null, ScriptRuntime.emptyArgs);
    }
  }

  private void runTimers(Context cx, VarScope s) {
    if (outstandingTimeout()) {
      var ret = timerCallback.call(cx, s, null, new Object[] {now});
      var next = ScriptRuntime.toInt32(ret);
      log.debug("Timer callback returned {} ", next);
      if (next != 0) {
        long delay = Math.max(next - now, 1);
        scheduleTimeout(delay, TimeUnit.MILLISECONDS);
      }
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
