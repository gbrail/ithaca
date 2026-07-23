package org.brail.ithaca.internal.common;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.brail.ithaca.internal.Environment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;

public class TimerDataTest {

  private Environment env;
  private TimerData timerData;
  private Context cx;
  private VarScope scope;

  @BeforeEach
  public void setUp() {
    env = new Environment();
    timerData = new TimerData(env);
    cx = Context.enter();
    scope = cx.initStandardObjects();
  }

  @Test
  public void testInitialState() {
    assertFalse(timerData.outstandingImmediate());
    assertEquals(Optional.empty(), timerData.nextDelay());
  }

  @Test
  public void testReferenceManagement() {
    // Test Immediate Ref
    timerData.setImmediateRef(true);
    assertTrue(timerData.referenced());
    timerData.setImmediateRef(false);
    assertFalse(timerData.referenced());

    // Test Timer Ref
    timerData.setTimerRef(true);
    assertTrue(timerData.referenced());
    timerData.setTimerRef(false);
    assertFalse(timerData.referenced());

    // Test both combined
    timerData.setImmediateRef(true);
    timerData.setTimerRef(true);
    assertTrue(timerData.referenced());
    timerData.setImmediateRef(false);
    assertTrue(timerData.referenced());
    timerData.setTimerRef(false);
    assertFalse(timerData.referenced());
  }

  @Test
  public void testTimeoutSchedulingAndDelay() throws InterruptedException {
    long delay = 100;
    timerData.scheduleTimeout(delay);

    Optional<Long> next = timerData.nextDelay();
    assertTrue(next.isPresent());
    assertTrue(next.get() <= delay && next.get() >= delay - 50); // Account for some time passing

    // Wait a bit to see if it becomes ready
    Thread.sleep(110);
    timerData.updateNow();

    assertEquals(Optional.empty(), timerData.nextDelay());
  }

  @Test
  public void testRunReadyTimeouts() {
    AtomicBoolean immediateCalled = new AtomicBoolean(false);
    AtomicInteger timerCalledCount = new AtomicInteger(0);

    Callable immediateCb =
        (cx, s, obj, args) -> {
          immediateCalled.set(true);
          return null;
        };
    Callable timerCb =
        (cx, s, obj, args) -> {
          timerCalledCount.incrementAndGet();
          return null;
        };

    timerData.setCallbacks(immediateCb, timerCb);
    timerData.updateNow();

    // Case 1: Nothing ready
    timerData.runReadyTimeouts(cx, scope);
    assertFalse(immediateCalled.get());
    assertEquals(0, timerCalledCount.get());

    // Case 2: Immediate ready
    timerData.immediateInfo().set(0, 1); // INFO_COUNT
    timerData.runReadyTimeouts(cx, scope);
    assertTrue(immediateCalled.get());

    // Case 3: Timer ready
    timerData.scheduleTimeout(0);
    timerData.updateNow(); // Marks it as ready
    timerData.runReadyTimeouts(cx, scope);
    assertEquals(1, timerCalledCount.get());
  }

  @Test
  public void testUpdateNowClearsQueue() throws InterruptedException {
    timerData.scheduleTimeout(50);
    Thread.sleep(60);
    timerData.updateNow();
    assertEquals(Optional.empty(), timerData.nextDelay());
  }
}
