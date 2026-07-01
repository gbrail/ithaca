package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.VarScope;

/*
 * TODO
 *   This stuff is referenced all over the runtime and we need an extensible mechanism.
 *   Would it be overkill to define some Java annotations for a class, which would have to
 *   include long and optional short name, data type, and help text?
 */

public class Options {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var optTypes = cx.newObject(s);
    Constants.populate(cx, s, optTypes, NodeConstants.OptionTypes.class);
    o.put("types", o, optTypes);
    meth(o, s, "getCLIOptionsValues", 0, Options::getCLIOptionsValues);
    meth(o, s, "getCLIOptionsInfo", 0, Options::getCLIOptionsInfo);
    meth(o, s, "getOptionsAsFlags", 0, Options::getOptionsAsFlags);
    meth(o, s, "getEmbedderOptions", 0, Options::getEmbedderOptions);
    meth(o, s, "getEnvOptionsInputType", 0, Options::getEnvOptionsInputType);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object getCLIOptionsValues(Context cx, VarScope s, Object to, Object[] args) {
    var o = cx.newObject(s);
    // Just hack together options so Node will boot!
    o.put("--enable-source-maps", o, false);
    o.put("--no-enable-source-maps", o, true);
    o.put("--frozen-intrinsics", o, false);
    o.put("--no-frozen-intrinsics", o, true);
    o.put("--conditions", o, cx.newArray(s, 0));
    o.put("--addons", o, false);
    o.put("--no-addons", o, true);
    o.put("--require-module", o, false);
    o.put("--no-require-module", o, true);
    o.put("--eval", o, "");
    o.put("--print", o, false);
    o.put("--import", o, cx.newArray(s, 0));
    o.put("--experimental-loader", o, cx.newArray(s, 0));
    return o;
  }

  private static Object getCLIOptionsInfo(Context cx, VarScope s, Object to, Object[] args) {
    return cx.newArray(s, 0);
  }

  private static Object getOptionsAsFlags(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getOptionsAsFlags not implemented");
  }

  private static Object getEmbedderOptions(Context cx, VarScope s, Object to, Object[] args) {
    // Right now we have no embedder options so don't worry about it
    return cx.newArray(s, 0);
  }

  private static Object getEnvOptionsInputType(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getEnvOptionsInputType not implemented");
  }
}
