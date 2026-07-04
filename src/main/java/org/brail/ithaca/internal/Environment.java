package org.brail.ithaca.internal;

import java.util.Arrays;
import java.util.IdentityHashMap;
import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.bindings.Timers;
import org.brail.ithaca.internal.common.OptionProcessor;
import org.brail.ithaca.internal.common.Options;
import org.mozilla.javascript.Callable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Environment {
  private static final Logger log = LoggerFactory.getLogger(Environment.class);

  /** Args passed to "main" */
  private String[] argv;

  /** Are we the main thread? */
  private boolean mainThread;

  /** Set up by realm.js to bootstrap node */
  private Callable internalBinding;

  private Callable requireBuiltin;

  /** Internal bindings we may need to share */
  private Timers timerBinding;

  /** The global handle reference count which determines when the event loop can exit */
  private int refCount;

  /** All the handles that are currently referenced, for debugging */
  private final IdentityHashMap<Object, Boolean> referencedHandles = new IdentityHashMap<>();

  private Options options;
  private final OptionProcessor<Options> optProcessor = new OptionProcessor<>(Options.class);

  public Environment() {}

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

  public Options getOptions() {
    return this.options;
  }

  public OptionProcessor<Options> getOptionProcessor() {
    return optProcessor;
  }

  public void loadOptions() throws NodeException {
    var r = optProcessor.load(Arrays.asList(argv));
    options = r.result();
  }

  public void reference(Object handle) {
    assert !referencedHandles.containsKey(handle);
    log.debug("Reference({})", handle);
    referencedHandles.put(handle, true);
    refCount++;
  }

  public void unreference(Object handle) {
    assert referencedHandles.containsKey(handle);
    assert refCount > 0;
    log.debug("Unreference({})", handle);
    referencedHandles.remove(handle);
    refCount--;
  }

  public int getRefCount() {
    return refCount;
  }

  public boolean isReferenced() {
    return refCount > 0;
  }

  public void debugReferences() {
    log.debug("Open refs:");
    for (var r : referencedHandles.keySet()) {
      log.debug("{}", r);
    }
  }
}
