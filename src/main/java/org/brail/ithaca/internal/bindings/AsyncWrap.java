package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.DoubleArray;
import org.brail.ithaca.internal.common.IntArray;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AsyncWrap {
  private static final Logger log = LoggerFactory.getLogger(AsyncWrap.class);

  private IntArray hookFields;
  private DoubleArray idFields;
  private DoubleArray asyncStack;

  enum AsyncConstants {
    kInit,
    kBefore,
    kAfter,
    kDestroy,
    kTotals,
    kPromiseResolve,
    kCheck,
    kExecutionAsyncId,
    kAsyncIdCounter,
    kTriggerAsyncId,
    kDefaultTriggerAsyncId,
    kStackLength,
    kUsesExecutionAsyncResource,
    kFieldsCount,
  }

  private static final int NUM_FIELDS = AsyncConstants.kFieldsCount.ordinal();
  private static final int EXECUTION_ID = AsyncConstants.kExecutionAsyncId.ordinal();
  private static final int TRIGGER_ID = AsyncConstants.kTriggerAsyncId.ordinal();
  private static final int STACK_LENGTH = AsyncConstants.kStackLength.ordinal();
  private static final int INITIAL_STACK_SIZE = 8;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var w = new AsyncWrap();
    w.hookFields = new IntArray(NUM_FIELDS);
    w.idFields = new DoubleArray(NUM_FIELDS);
    w.asyncStack = new DoubleArray(INITIAL_STACK_SIZE);

    var o = cx.newObject(s);
    o.put("async_hook_fields", o, w.hookFields.createObject(cx, s));
    o.put("async_id_fields", o, w.idFields.createObject(cx, s));
    o.put("async_ids_stack", o, w.asyncStack.createObject(cx, s));
    o.put("pushAsyncContext", o, new LambdaFunction(s, "pushAsyncContext", 2, w::pushAsyncContext));
    o.put("popAsyncContext", o, new LambdaFunction(s, "popAsyncContext", 1, w::popAsyncContext));
    o.put(
        "clearAsyncIdStack",
        o,
        new LambdaFunction(s, "clearAsyncIdStack", 0, w::clearAsyncIdStack));
    // This stuff, resources, and the trampoline, does...something
    o.put("execution_async_resources", o, cx.newArray(s, NUM_FIELDS));
    o.put(
        "setCallbackTrampoline",
        o,
        new LambdaFunction(s, "setCallbackTrampoline", 1, AsyncWrap::setCallbackTrampoline));
    o.put(
        "executionAsyncResource",
        o,
        new LambdaFunction(s, "executionAsyncResource", 1, AsyncWrap::executionAsyncResource));
    o.put(
        "registerDestroyHook",
        o,
        new LambdaFunction(s, "registerDestroyHook", 1, AsyncWrap::registerDestroyHook));
    o.put(
        "queueDestroyAsyncId",
        o,
        new LambdaFunction(s, "queueDestroyAsyncId", 1, AsyncWrap::queueDestroyAsyncId));
    // TODO there is actually going to be a really long list of these
    o.put("Providers", o, cx.newArray(s, 0));

    var constants = cx.newObject(s);
    putConstant(constants, AsyncConstants.kInit);
    putConstant(constants, AsyncConstants.kBefore);
    putConstant(constants, AsyncConstants.kAfter);
    putConstant(constants, AsyncConstants.kDestroy);
    putConstant(constants, AsyncConstants.kTotals);
    putConstant(constants, AsyncConstants.kPromiseResolve);
    putConstant(constants, AsyncConstants.kCheck);
    putConstant(constants, AsyncConstants.kExecutionAsyncId);
    putConstant(constants, AsyncConstants.kAsyncIdCounter);
    putConstant(constants, AsyncConstants.kTriggerAsyncId);
    putConstant(constants, AsyncConstants.kDefaultTriggerAsyncId);
    putConstant(constants, AsyncConstants.kStackLength);
    putConstant(constants, AsyncConstants.kUsesExecutionAsyncResource);
    putConstant(constants, AsyncConstants.kFieldsCount);
    o.put("constants", o, constants);
    return o;
  }

  private static void putConstant(Scriptable o, AsyncConstants a) {
    o.put(a.name(), o, a.ordinal());
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
    int offset = hookFields.get(STACK_LENGTH);
    if (offset * 2 >= asyncStack.length()) {
      asyncStack.grow(3);
    }
    asyncStack.set(2 * offset, idFields.get(EXECUTION_ID));
    asyncStack.set(2 * offset + 1, idFields.get(TRIGGER_ID));
    hookFields.add(STACK_LENGTH, 1);
    idFields.set(EXECUTION_ID, id);
    idFields.set(TRIGGER_ID, triggerId);
    return Undefined.instance;
  }

  private Object popAsyncContext(Context cx, VarScope s, Object lt, Object[] args) {
    if (hookFields.get(STACK_LENGTH) == 0) {
      return false;
    }
    int offset = hookFields.get(STACK_LENGTH) - 1;
    idFields.set(EXECUTION_ID, asyncStack.get(2 * offset));
    idFields.set(TRIGGER_ID, asyncStack.get(2 * offset + 1));
    hookFields.set(STACK_LENGTH, offset);
    return hookFields.get(STACK_LENGTH) > 0;
  }

  private Object clearAsyncIdStack(Context cx, VarScope s, Object lt, Object[] args) {
    idFields.set(EXECUTION_ID, 0);
    idFields.set(TRIGGER_ID, 0);
    hookFields.set(STACK_LENGTH, 0);
    return Undefined.instance;
  }
}
