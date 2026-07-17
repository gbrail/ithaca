package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.VarScope;

public class Modules {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "getNearestParentPackageJSONType", 1, Modules::getNearestParentPackageJSONType);
    meth(o, s, "getNearestParentPackageJSON", 1, Modules::getNearestParentPackageJSON);
    meth(o, s, "getPackageScopeConfig", 1, Modules::getPackageScopeConfig);
    meth(o, s, "getPackageType", 1, Modules::getPackageType);
    meth(o, s, "enableCompileCache", 0, Modules::enableCompileCache);
    meth(o, s, "flushCompileCache", 0, Modules::flushCompileCache);
    meth(o, s, "getCompileCacheEntry", 1, Modules::getCompileCacheEntry);
    meth(o, s, "saveCompileCacheEntry", 2, Modules::saveCompileCacheEntry);
    var cc = cx.newObject(s);
    cc.put("FAILED", cc, 0);
    cc.put("ENABLED", cc, 1);
    cc.put("ALREADY_ENABLED", cc, 2);
    cc.put("DISABLED", cc, 2);
    o.put("compileCacheStatus", o, cc);
    var ct = cx.newObject(s);
    ct.put("kCommonJS", ct, 0);
    ct.put("kESM", ct, 1);
    ct.put("kStrippedTypeScript", ct, 2);
    o.put("cachedCodeTypes", o, ct);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object getNearestParentPackageJSONType(
      Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getNearestParentPackageJSONType not implemented");
  }

  private static Object getNearestParentPackageJSON(
      Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getNearestParentPackageJSON not implemented");
  }

  private static Object getPackageScopeConfig(
      Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getPackageScopeConfig not implemented");
  }

  private static Object getPackageType(Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getPackageType not implemented");
  }

  private static Object enableCompileCache(Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("enableCompileCache not implemented");
  }

  private static Object flushCompileCache(Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("flushCompileCache not implemented");
  }

  private static Object getCompileCacheEntry(Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getCompileCacheEntry not implemented");
  }

  private static Object saveCompileCacheEntry(
      Context cx, VarScope scope, Object to, Object[] args) {
    throw ScriptRuntime.typeError("saveCompileCacheEntry not implemented");
  }
}
