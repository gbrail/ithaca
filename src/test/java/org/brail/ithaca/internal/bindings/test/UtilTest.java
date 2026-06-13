package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.*;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.bindings.Util;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

class UtilTest {

  private Context context;
  private VarScope scope;

  @BeforeEach
  void setUp() {
    context = Context.enter();
    context.setLanguageVersion(Context.VERSION_ES6);
    this.scope = (VarScope) context.initStandardObjects();
  }

  @AfterEach
  void tearDown() {
    Context.exit();
  }

  @Test
  void testBasicLazyPropertyResolution() {
    LoadCounter counter = new LoadCounter();
    var env = new Environment();
    env.setRequireBuiltin(mockExportsBuilder(counter));

    var utilObj = Util.init(env, context, scope);
    var fn = (org.mozilla.javascript.Function) utilObj.get("defineLazyProperties", utilObj);

    var target = context.newObject(scope);
    var propNames = context.newArray(scope, new Object[]{"propA"});
    fn.call(context, scope, null, new Object[] {target, "mockModule", propNames});

    ScriptableObject targetObj = (ScriptableObject) target;
    assertEquals("valueA", targetObj.get("propA", targetObj));
    assertEquals(1, counter.getCount(), "module should have been loaded exactly once");
  }

  @Test
  void testMultipleLazyPropertiesFromSameModule() {
    LoadCounter counter = new LoadCounter();
    var env = new Environment();
    env.setRequireBuiltin(mockExportsBuilder(counter));

    var utilObj = Util.init(env, context, scope);
    var fn = (org.mozilla.javascript.Function) utilObj.get("defineLazyProperties", utilObj);

    var target = context.newObject(scope);
    var propNames = context.newArray(scope, new Object[]{"propA", "propB", "propC"});
    fn.call(context, scope, null, new Object[] {target, "mockModule", propNames});

    ScriptableObject targetObj = (ScriptableObject) target;
    assertEquals("valueA", targetObj.get("propA", targetObj));
    assertEquals("valueB", targetObj.get("propB", targetObj));
    assertEquals("valueC", targetObj.get("propC", targetObj));
  }

  @Test
  void testMissingPropertyReturnsUndefined() {
    var env = new Environment();
    env.setRequireBuiltin(mockExportsBuilder());

    var utilObj = Util.init(env, context, scope);
    var fn = (org.mozilla.javascript.Function) utilObj.get("defineLazyProperties", utilObj);

    var target = context.newObject(scope);
    var propNames = context.newArray(scope, new Object[]{"nonExistent"});
    fn.call(context, scope, null, new Object[] {target, "mockModule", propNames});

    ScriptableObject targetObj = (ScriptableObject) target;
    var result = targetObj.get("nonExistent", targetObj);
    assertTrue(Undefined.isUndefined(result));
  }

  @Test
  void testEnumerablePropertyDefault() {
    var env = new Environment();
    env.setRequireBuiltin(mockExportsBuilder());

    var utilObj = Util.init(env, context, scope);
    var fn = (org.mozilla.javascript.Function) utilObj.get("defineLazyProperties", utilObj);

    var target = context.newObject(scope);
    var propNames = context.newArray(scope, new Object[]{"propA"});
    fn.call(context, scope, null, new Object[] {target, "mockModule", propNames});

    ScriptableObject targetObj = (ScriptableObject) target;
    assertTrue(targetObj.has("propA", targetObj));
  }

  private Callable mockExportsBuilder() {
    return mockExportsBuilder(null);
  }

  private Callable mockExportsBuilder(LoadCounter counter) {
    return new LambdaFunction(scope, "mockExports", 1,
        (cx, s, lt, args) -> {
          if (counter != null) {
            counter.increment();
          }
          var o = cx.newObject(s);
          o.put("propA", o, "valueA");
          o.put("propB", o, "valueB");
          o.put("propC", o, "valueC");
          return o;
        });
  }

  static class LoadCounter {
    private volatile int count = 0;

    synchronized void increment() {
      this.count++;
    }

    int getCount() {
      return count;
    }
  }
}
