package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Process {
  private static final String NODE_VERSION = "24.0.0";
  private static final String ITHACA_VERSION = "0.0.1";

  public static Scriptable init(Context cx, VarScope s) {
      var o = cx.newObject(s);
      var vers = cx.newObject(s);
      vers.put("node", vers, NODE_VERSION);
      vers.put("ithaca", vers, ITHACA_VERSION);
      o.put("versions", o, vers);
      o.put("version", o, NODE_VERSION);
      return o;
  }
}