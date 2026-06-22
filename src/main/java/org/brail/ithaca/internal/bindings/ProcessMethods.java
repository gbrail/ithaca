package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.mozilla.javascript.typedarrays.NativeUint32Array;
import org.mozilla.javascript.typedarrays.NativeBigUint64Array;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigInteger;

public class ProcessMethods {
  private static final Logger log = LoggerFactory.getLogger(ProcessMethods.class);

  private static final long NANOS_PER_SEC = 1000000000;

  private final NativeUint32Array hrtimeBuffer32;
  private final NativeBigUint64Array hrtimeBuffer64;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var pm = new ProcessMethods(cx, s);
    var o = cx.newObject(s);
    o.put("hrtimeBuffer", o, pm.hrtimeBuffer32);
    o.put("hrtime", o, new LambdaFunction(s, "hrtime", 0, pm::hrtime));
    o.put("hrtimeBigInt", o, new LambdaFunction(s, "hrtimeBigInt", 0, pm::hrtimeBigint));
    o.put("setEmitWarningSync", o, new LambdaFunction(s, "setEmitWarningSync", 1, pm::setEmitWarningSync));
    return o;
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
}
