package org.brail.ithaca.internal.filesystem;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class FSReqPromise extends ScriptableObject {
  @Override
  public String getClassName() {
    return "FSReqPromise";
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new FSReqPromise();
  }
}
