package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class Os {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "getHostname", 0, Os::getHostName);
    meth(o, s, "getLoadAvg", 0, Os::getLoadAvg);
    meth(o, s, "getUptime", 0, Os::getUptime);
    meth(o, s, "getTotalMem", 0, Os::getTotalMem);
    meth(o, s, "getFreeMem", 0, Os::getFreeMem);
    meth(o, s, "getCPUs", 0, Os::getCPUs);
    meth(o, s, "getInterfaceAddresses", 0, Os::getInterfaceAddresses);
    meth(o, s, "getHomeDirectory", 0, Os::getHomeDirectory);
    meth(o, s, "getUserInfo", 0, Os::getUserInfo);
    meth(o, s, "getPriority", 0, Os::getPriority);
    meth(o, s, "setPriority", 1, Os::setPriority);
    meth(o, s, "getAvailableParallelism", 0, Os::getAvailableParallelism);
    meth(o, s, "getOSInformation", 0, Os::getOSInformation);
    o.put("isBigEndian", o, !"little".equals(System.getProperty("sun.cpu.endian")));
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object getOSInformation(Context cx, VarScope s, Object to, Object[] args) {
    // [sysname, version, release, machine]
    // This is Java do the best we can
    var a = cx.newArray(s, 4);
    a.put(0, a, System.getProperty("os.name"));
    a.put(1, a, System.getProperty("os.version"));
    a.put(2, a, System.getProperty("os.version"));
    a.put(3, a, System.getProperty("os.arch"));
    return a;
  }

  private static Object getAvailableParallelism(Context cx, VarScope s, Object to, Object[] args) {
    return Runtime.getRuntime().availableProcessors();
  }

  private static Object setPriority(Context cx, VarScope s, Object to, Object[] args) {
    return Undefined.instance;
  }

  private static Object getPriority(Context cx, VarScope s, Object to, Object[] args) {
    return Undefined.instance;
  }

  private static Object getUserInfo(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getUserInfo not implemented");
  }

  private static Object getHomeDirectory(Context cx, VarScope s, Object to, Object[] args) {
    return System.getProperty("user.home");
  }

  private static Object getInterfaceAddresses(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getInterfaceAddresses not implemented");
  }

  private static Object getCPUs(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getCPUs not implemented");
  }

  private static Object getFreeMem(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getFreeMem not implemented");
  }

  private static Object getTotalMem(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getTotalMem not implemented");
  }

  private static Object getUptime(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getUptime not implemented");
  }

  private static Object getLoadAvg(Context cx, VarScope s, Object to, Object[] args) {
    return 0.0;
  }

  private static Object getHostName(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getHostName not implemented");
  }
}
