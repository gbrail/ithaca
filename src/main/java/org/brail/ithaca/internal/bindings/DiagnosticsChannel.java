package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DiagnosticsChannel {
  private static final Logger log = LoggerFactory.getLogger(DiagnosticsChannel.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put(
        "linkNativeChannel",
        o,
        new LambdaFunction(s, "linkNativeChannel", 1, DiagnosticsChannel::linkNativeChannel));
    o.put(
        "getOrCreateChannelIndex",
        o,
        new LambdaFunction(
            s, "getOrCreateChannelIndex", 1, DiagnosticsChannel::getOrCreateChannelIndex));
    return o;
  }

  private static Object linkNativeChannel(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("linkNativeChannel called, not implemented");
    return Undefined.instance;
  }

  private static Object getOrCreateChannelIndex(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("getOrCreateChannelIndex called, not implemented");
    return Undefined.instance;
  }
}
