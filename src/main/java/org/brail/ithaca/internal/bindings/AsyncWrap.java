package org.brail.ithaca.internal.bindings;


import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.brail.ithaca.internal.common.DoubleArray;
import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AsyncWrap {
  private static final Logger log = LoggerFactory.getLogger(AsyncWrap.class);

  private IntArray hookFields;
  private DoubleArray idFields;
  private DoubleArray asyncStack;

  private Callable initHook;
  private Callable beforeHook;
  private Callable afterHook;
  private Callable promiseResolveHook;

  private static final int NUM_FIELDS = NodeConstants.AsyncConstants.kFieldsCount;
  private static final int INITIAL_STACK_SIZE = 8;

  private static class AsyncWrapper extends ScriptableObject {
    @Override
    public String getClassName() {
      return "AsyncWrap";
    }
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var w = new AsyncWrap();
    e.setAsyncWrap(w);

    w.hookFields = new IntArray(NUM_FIELDS);
    w.idFields = new DoubleArray(NUM_FIELDS);
    w.asyncStack = new DoubleArray(INITIAL_STACK_SIZE);

    var o = cx.newObject(s);
    meth(o, s, "setupHooks", 1, w::setupHooks);
    meth(o, s, "setPromiseHooks", 4, AsyncWrap::setPromiseHooks);
    meth(o, s, "getPromiseHooks", 0, AsyncWrap::getPromiseHooks);
    o.put("async_hook_fields", o, w.hookFields.createObject(cx, s));
    o.put("async_id_fields", o, w.idFields.createObject(cx, s));
    o.put("async_ids_stack", o, w.asyncStack.createObject(cx, s));
    meth(o, s, "pushAsyncContext", 2, w::pushAsyncContext);
    meth(o, s, "popAsyncContext", 1, w::popAsyncContext);
    meth(o, s, "clearAsyncIdStack", 0, w::clearAsyncIdStack);
    // This stuff, resources, and the trampoline, does...something
    o.put("execution_async_resources", o, cx.newArray(s, NUM_FIELDS));
    meth(o, s, "setCallbackTrampoline", 1, AsyncWrap::setCallbackTrampoline);
    meth(o, s, "executionAsyncResource", 1, AsyncWrap::executionAsyncResource);
    meth(o, s, "registerDestroyHook", 1, AsyncWrap::registerDestroyHook);
    meth(o, s, "queueDestroyAsyncId", 1, AsyncWrap::queueDestroyAsyncId);
    // TODO there is actually going to be a really long list of these
    o.put("Providers", o, cx.newArray(s, 0));

    var constants = cx.newObject(s);
    Constants.populate(cx, s, constants, NodeConstants.AsyncConstants.class);
    o.put("constants", o, constants);

    var cons = new LambdaConstructor(s, "AsyncWrap", 0, AsyncWrap::js_constructor);
    cons.definePrototypeMethod(s, "getAsyncId", 0, AsyncWrap::getAsyncId);
    cons.definePrototypeMethod(s, "asyncReset", 0, AsyncWrap::asyncReset);
    cons.definePrototypeMethod(s, "getProviderType", 0, AsyncWrap::getProviderType);
    cons.definePrototypeMethod(
        s,
        "getAsyncContextFrameForDebuggingOnly",
        0,
        AsyncWrap::getAsyncContextFrameForDebuggingOnly);
    o.put("AsyncWrap", o, cons);

    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new AsyncWrapper();
  }

  private static Object getAsyncId(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getAsyncId not implemented");
  }

  private static Object asyncReset(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("asyncReset not implemented");
  }

  private static Object getProviderType(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getProviderType not implemented");
  }

  private static Object getAsyncContextFrameForDebuggingOnly(
      Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getAsyncContextFrameForDebuggingOnly not implemented");
  }

  private Object setupHooks(Context cx, VarScope s, Object lt, Object[] args) {
    assert args.length > 0;
    assert args[0] instanceof Scriptable;

    var hooks = (Scriptable) args[0];
    initHook = getHook(hooks, "init");
    beforeHook = getHook(hooks, "before");
    afterHook = getHook(hooks, "after");
    promiseResolveHook = getHook(hooks, "promise_resolve");
    return Undefined.instance;
  }

  private Callable getHook(Scriptable hooks, String name) {
    return (Callable) hooks.get(name, hooks);
  }

  private static Object setPromiseHooks(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setPromiseHooks: Not implemented, will do nothing");
    return Undefined.instance;
  }

  private static Object getPromiseHooks(Context cx, VarScope s, Object to, Object[] args) {
    return Undefined.instance;
  }

  private static Object setCallbackTrampoline(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("setCallbackTrampoline");
    return Undefined.instance;
  }

  private static Object executionAsyncResource(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("executionAsyncResource");
    return Undefined.instance;
  }

  private static Object registerDestroyHook(Context cx, VarScope s, Object lt, Object[] args) {
    ArgUtils.checkArgs(2, args);
    int hook = ScriptRuntime.toInt32(args[1]);
    log.debug("registerDestroyHook: {}", hook);
    return Undefined.instance;
  }

  private static Object queueDestroyAsyncId(Context cx, VarScope s, Object lt, Object[] args) {
    ArgUtils.checkArgs(1, args);
    int id = ScriptRuntime.toInt32(args[0]);
    log.debug("queueDestroyAsyncId: {}", id);
    return Undefined.instance;
  }

  private Object pushAsyncContext(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.typeError("Not enough arguments");
    }
    int id = ScriptRuntime.toInt32(args[0]);
    log.debug("pushAsyncContext: {}", id);
    int triggerId = ScriptRuntime.toInt32(args[1]);
    int offset = hookFields.get(NodeConstants.AsyncConstants.kStackLength);
    if (offset * 2 >= asyncStack.length()) {
      asyncStack.grow(3);
    }
    asyncStack.set(2 * offset, idFields.get(NodeConstants.AsyncConstants.kExecutionAsyncId));
    asyncStack.set(2 * offset + 1, idFields.get(NodeConstants.AsyncConstants.kTriggerAsyncId));
    hookFields.add(NodeConstants.AsyncConstants.kStackLength, 1);
    idFields.set(NodeConstants.AsyncConstants.kExecutionAsyncId, id);
    idFields.set(NodeConstants.AsyncConstants.kTriggerAsyncId, triggerId);
    return Undefined.instance;
  }

  private Object popAsyncContext(Context cx, VarScope s, Object lt, Object[] args) {
    if (hookFields.get(NodeConstants.AsyncConstants.kStackLength) == 0) {
      return false;
    }
    log.debug("popAsyncContext");
    int offset = hookFields.get(NodeConstants.AsyncConstants.kStackLength) - 1;
    idFields.set(NodeConstants.AsyncConstants.kExecutionAsyncId, asyncStack.get(2 * offset));
    idFields.set(NodeConstants.AsyncConstants.kTriggerAsyncId, asyncStack.get(2 * offset + 1));
    hookFields.set(NodeConstants.AsyncConstants.kStackLength, offset);
    return hookFields.get(NodeConstants.AsyncConstants.kStackLength) > 0;
  }

  private Object clearAsyncIdStack(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("clearAsyncIdStack");
    idFields.set(NodeConstants.AsyncConstants.kExecutionAsyncId, 0);
    idFields.set(NodeConstants.AsyncConstants.kTriggerAsyncId, 0);
    hookFields.set(NodeConstants.AsyncConstants.kStackLength, 0);
    return Undefined.instance;
  }
}
