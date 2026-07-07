package org.brail.ithaca.internal.filesystem;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class FileHandleReqWrap extends ScriptableObject {
  @Override
  public String getClassName() {
    return "FileHandleReqWrap";
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new FileHandleReqWrap();
  }
}
