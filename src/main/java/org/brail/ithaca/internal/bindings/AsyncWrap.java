package org.brail.ithaca.internal.bindings;

import static org.mozilla.javascript.ClassDescriptor.Destination.PROTO;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.DoubleArray;
import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
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
  private Callable destroyHook;
  private Callable promiseResolveHook;

  private static final int NUM_FIELDS = NodeConstants.AsyncConstants.kFieldsCount;
  private static final int INITIAL_STACK_SIZE = 8;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var w = new AsyncWrap();
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
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  static ClassDescriptor.Builder applyClassDescriptor(ClassDescriptor.Builder b) {
    return b.withMethod(PROTO, "getAsyncId", 0, AsyncWrap::getAsyncId)
        .withMethod(PROTO, "asyncReset", 0, AsyncWrap::asyncReset)
        .withMethod(PROTO, "getProviderType", 0, AsyncWrap::getProviderType);
  }

  private static Object getAsyncId(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("getAsyncId");
    return Undefined.instance;
  }

  private static Object asyncReset(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("asyncReset");
    return Undefined.instance;
  }

  private static Object getProviderType(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    log.debug("getProviderType");
    return Undefined.instance;
  }

  private Object setupHooks(Context cx, VarScope s, Object lt, Object[] args) {
    assert args.length > 0;
    assert args[0] instanceof Scriptable;

    var hooks = (Scriptable) args[0];
    initHook = getHook(hooks, "init");
    beforeHook = getHook(hooks, "before");
    afterHook = getHook(hooks, "after");
    destroyHook = getHook(hooks, "destroy");
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
    log.debug("registerDestroyHook");
    return Undefined.instance;
  }

  private static Object queueDestroyAsyncId(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("queueDestroyAsyncId");
    return Undefined.instance;
  }

  private Object pushAsyncContext(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.typeError("Not enough arguments");
    }
    int id = ScriptRuntime.toInt32(args[0]);
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
    int offset = hookFields.get(NodeConstants.AsyncConstants.kStackLength) - 1;
    idFields.set(NodeConstants.AsyncConstants.kExecutionAsyncId, asyncStack.get(2 * offset));
    idFields.set(NodeConstants.AsyncConstants.kTriggerAsyncId, asyncStack.get(2 * offset + 1));
    hookFields.set(NodeConstants.AsyncConstants.kStackLength, offset);
    return hookFields.get(NodeConstants.AsyncConstants.kStackLength) > 0;
  }

  private Object clearAsyncIdStack(Context cx, VarScope s, Object lt, Object[] args) {
    idFields.set(NodeConstants.AsyncConstants.kExecutionAsyncId, 0);
    idFields.set(NodeConstants.AsyncConstants.kTriggerAsyncId, 0);
    hookFields.set(NodeConstants.AsyncConstants.kStackLength, 0);
    return Undefined.instance;
  }
}
