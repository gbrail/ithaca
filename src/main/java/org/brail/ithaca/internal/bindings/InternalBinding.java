package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public interface InternalBinding {
  Scriptable init(Context cx, VarScope scope);
}
