package org.brail.ithaca.internal;

import org.brail.ithaca.NodeException;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeObject;
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
    // TODO these need to be real constructors, perhaps use descriptors
    var fakeAtomics = cx.newObject(scope);
    ScriptableObject.defineProperty(scope, "Atomics", fakeAtomics, ScriptableObject.DONTENUM);
    NativeObject fakeRegistry = (NativeObject)cx.newObject(scope);
    fakeRegistry.setPrototypeProperty(cx.newObject(scope));
    ScriptableObject.defineProperty(scope, "FinalizationRegistry", fakeRegistry, ScriptableObject.DONTENUM);

  }
}
