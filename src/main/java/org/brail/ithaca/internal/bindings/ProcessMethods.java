package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.mozilla.javascript.typedarrays.NativeUint32Array;
import org.mozilla.javascript.typedarrays.NativeBigUint64Array;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigInteger;
import java.nio.file.Path;
import java.io.IOError;

public class ProcessMethods {
  private static final Logger log = LoggerFactory.getLogger(ProcessMethods.class);

  private static final long NANOS_PER_SEC = 1000000000;

  private final NativeUint32Array hrtimeBuffer32;
  private final NativeBigUint64Array hrtimeBuffer64;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var pm = new ProcessMethods(cx, s);
    var o = cx.newObject(s);
    o.put("hrtimeBuffer", o, pm.hrtimeBuffer32);
    meth(o, s, "hrtime", 0, pm::hrtime);
    meth(o, s, "hrtimeBigInt", 0, pm::hrtimeBigint);
    meth(o, s, "setEmitWarningSync", 1, pm::setEmitWarningSync);
    meth(o, s, "cwd", 0, ProcessMethods::cwd);
    meth(o, s, "reallyExit", 1, ProcessMethods::reallyExit);

    meth(o, s, "patchProcessObject", 1, (lcx, ls, lto, args) -> {
      assert args.length > 0;
      Process.patch(e, lcx, ls, args[0]);
      return Undefined.instance;
    });
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private ProcessMethods(Context cx, VarScope s) {
    var timeData = (NativeArrayBuffer) cx.newObject(s, "ArrayBuffer", new Object[] {12});
    this.hrtimeBuffer32 =
        (NativeUint32Array) cx.newObject(s, "Uint32Array", new Object[] {timeData, 0, 3});
    this.hrtimeBuffer64 =
        (NativeBigUint64Array) cx.newObject(s, "BigUint64Array", new Object[] {timeData, 0, 1});
  }

  /**
   * This is the way that the Node code expects high-resolution time to be delivered -- the two
   * "hrtime" family functions fill in the pre-defined array buffer.
   */
  private Object hrtime(Context cx, VarScope s, Object to, Object[] args) {
    long t = System.nanoTime();
    hrtimeBuffer32.set(0, (t / NANOS_PER_SEC) >> 32L);
    hrtimeBuffer32.set(1, (t / NANOS_PER_SEC) & 0xffffffffL);
    hrtimeBuffer32.set(2, t % NANOS_PER_SEC);
    return Undefined.instance;
  }

  /**
   * Implement this by writing to the same buffer as "hrtime," but write a 64-bit int directly in
   * only 8 bits.
   */
  private Object hrtimeBigint(Context cx, VarScope s, Object to, Object[] args) {
    long t = System.nanoTime();
    hrtimeBuffer64.set(0, BigInteger.valueOf(t));
    return Undefined.instance;
  }

  private Object setEmitWarningSync(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("setEmitWarningSync");
    return Undefined.instance;
  }

  private static Object cwd(Context cx, VarScope s, Object to, Object[] args) {
    try {
      return Path.of(".").toAbsolutePath().toString();
    } catch (IOError e) {
      throw ScriptRuntime.constructError("Error", "Cannot get working directory");
    }
  }

  private static Object reallyExit(Context cx, VarScope s, Object to, Object[] args) {
    int code = 0;
    if (args.length > 0) {
      code = ScriptRuntime.toInt32(args[0]);
    }
    System.exit(code);
    return Undefined.instance;
  }
}
