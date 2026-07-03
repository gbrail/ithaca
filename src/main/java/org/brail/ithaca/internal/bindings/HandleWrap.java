package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.handles.Handle;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.VarScope;

public class HandleWrap {
  static void initializeConstructor(LambdaConstructor c, VarScope s) {
    c.definePrototypeMethod(s, "ref", 0, Handle::js_ref);
    c.definePrototypeMethod(s, "unref", 0, Handle::js_unref);
    c.definePrototypeMethod(s, "hasRef", 0, Handle::js_hasRef);
    c.definePrototypeMethod(s, "close", 0, Handle::js_close);
  }
}
