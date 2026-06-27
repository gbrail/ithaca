package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Performance {
  private static final Logger log = LoggerFactory.getLogger(ModuleWrap.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);

    var constants = cx.newObject(s);
    Constants.populate(cx, s, constants, NodeConstants.Performance.class);
    o.put("constants", o, constants);
    meth(o, s, "markBootstrapComplete", 0, Performance::markBootstrapComplete);
    meth(o, s, "setupObservers", 0, Performance::setupObservers);
    return o;
  }

  private static void meth(
          Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object markBootstrapComplete(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("Bootstrap has been marked complete");
    return Undefined.instance;
  }

  private static Object setupObservers(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setupObservers");
    return Undefined.instance;
  }
}
