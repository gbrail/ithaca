package org.brail.ithaca.internal;

import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.bindings.FakeAtomics;
import org.brail.ithaca.internal.bindings.FakeFinalizationRegistry;
import org.brail.ithaca.internal.bindings.FakeWeakRef;
import org.brail.ithaca.internal.bindings.Process;
import org.brail.ithaca.internal.bindings.Registry;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;

public class Bootstrapper {
  private static final Bootstrapper instance = new Bootstrapper();

  private Bootstrapper() {
  }

  public static Bootstrapper get() {
    return instance;
  }

  public void bootstrap(Context cx, VarScope scope) throws NodeException {
    var l = Loader.get();
    var r = Registry.get();
    // Install built-ins that are not in Rhino yet
    patchGlobals(cx, scope);

    // Initialize primordials by calling it as a function
    var primordials = cx.newObject(scope);
    var initPrimordials = l.runWrappedFunction(cx, scope, "internal/per_context/primordials.js",
            "function __initPrimordials(primordials) {", "}; __initPrimordials");
    initPrimordials.call(cx, scope, null, new Object[]{primordials});
    // TODO need new.target
    // l.run(cx, scope, "internal/per_context/domexception.js");
    // TODO need exports
    // l.run(cx, scope, "internal/per_context/messageport.js");
    var process = Process.init(cx, scope);
    var linkedBinding = r.linkedBinding(cx, scope);
    var internalBinding = r.internalBinding(cx, scope);

    var initRealm = l.runWrappedFunction(cx, scope, "internal/bootstrap/realm.js",
            "function __initRealm(process, getLinkedBinding, getInternalBinding, primordials) {",
            "}; __initRealm");
    initRealm.call(cx, scope, null, new Object[]{process, linkedBinding, internalBinding, primordials});
  }

  private void patchGlobals(Context cx, VarScope scope) {
    FakeAtomics.init(cx, scope);
    FakeFinalizationRegistry.init(cx, scope);
    FakeWeakRef.init(cx, scope);
  }
}
