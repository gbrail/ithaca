package org.brail.ithaca.internal;

import java.util.Arrays;
import java.util.IdentityHashMap;
import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.bindings.AsyncWrap;
import org.brail.ithaca.internal.bindings.TaskQueue;
import org.brail.ithaca.internal.bindings.Timers;
import org.brail.ithaca.internal.common.OptionProcessor;
import org.brail.ithaca.internal.common.Options;
import org.mozilla.javascript.Callable;
import org.slf4j.LoggerFactory;

public class Environment {
  // Logger removed to prevent early SLF4J initialization

  /** Args passed to "main" */
  private String[] argv;

  /** Are we the main thread? */
  private boolean mainThread;

  /** Set up by realm.js to bootstrap node */
  private Callable internalBinding;

  private Callable requireBuiltin;

  /** Internal bindings we may need to share */
  private Timers timerBinding;

  private TaskQueue taskQueueBinding;
  private AsyncWrap asyncWrap;

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

  public void setTaskQueue(TaskQueue taskQueueBinding) {
    this.taskQueueBinding = taskQueueBinding;
  }

  public TaskQueue getTaskQueue() {
    return taskQueueBinding;
  }

  public void setAsyncWrap(AsyncWrap asyncWrap) {
    this.asyncWrap = asyncWrap;
  }

  public AsyncWrap getAsyncWrap() {
    return asyncWrap;
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
    var remaining = r.remaining().toArray(new String[0]);
    argv = new String[remaining.length + 1];
    System.arraycopy(remaining, 0, argv, 1, remaining.length);
    argv[0] = "node";
  }

  public void reference(Object handle) {
    assert !referencedHandles.containsKey(handle);
    referencedHandles.put(handle, true);
    refCount++;
  }

  public void unreference(Object handle) {
    assert referencedHandles.containsKey(handle);
    assert refCount > 0;
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
    var log = LoggerFactory.getLogger(Environment.class);
    log.debug("Open refs:");
    for (var r : referencedHandles.keySet()) {
      log.debug("{}", r);
    }
  }
}
