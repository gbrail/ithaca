package org.brail.ithaca.internal;

import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.bindings.FakeAtomics;
import org.brail.ithaca.internal.bindings.FakeFinalizationRegistry;
import org.brail.ithaca.internal.bindings.FakeWeakRef;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;

public class Bootstrapper {
  private static final Bootstrapper instance = new Bootstrapper();

  private Bootstrapper() {}

  public static Bootstrapper get() {
    return instance;
  }

  public void bootstrap(Context cx, VarScope scope) throws NodeException {
    patchGlobals(cx, scope);
    var primordials = cx.newObject(scope);
    ScriptableObject.defineProperty(scope, "primordials", primordials, ScriptableObject.DONTENUM);
    Loader.get().run(cx, scope, "internal/per_context/primordials.js");
  }

  private void patchGlobals(Context cx, VarScope scope) {
    FakeAtomics.init(cx, scope);
    FakeFinalizationRegistry.init(cx, scope);
    FakeWeakRef.init(cx, scope);
  }
}
