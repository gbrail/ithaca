package org.brail.ithaca.internal.filesystem;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;

public class FileHandle extends ScriptableObject {
  @Override
  public String getClassName() {
    return "FileHandle";
  }

  public static Scriptable js_constructor(Context cx, VarScope s, Object[] args) {
    return new FileHandle();
  }

  public static Object js_close(Context cd, VarScope s, Object to, Object[] args) {
    return Undefined.instance;
  }

  public static Object js_closeSync(Context cd, VarScope s, Object to, Object[] args) {
    return Undefined.instance;
  }

  public static Object js_releaseFD(Context cd, VarScope s, Object to, Object[] args) {
    return Undefined.instance;
  }
}
