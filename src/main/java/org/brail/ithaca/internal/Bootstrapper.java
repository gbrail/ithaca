package org.brail.ithaca.internal;

import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.bindings.FakeAtomics;
import org.brail.ithaca.internal.bindings.FakeFinalizationRegistry;
import org.brail.ithaca.internal.bindings.FakeWeakRef;
import org.brail.ithaca.internal.bindings.Process;
import org.brail.ithaca.internal.bindings.Registry;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Bootstrapper {
  private static final Logger log = LoggerFactory.getLogger(Bootstrapper.class);

  private static final Bootstrapper instance = new Bootstrapper();

  private Bootstrapper() {}

  public static Bootstrapper get() {
    return instance;
  }

  public void bootstrap(Context cx, VarScope scope) throws NodeException {
    var l = Loader.get();
    var r = Registry.get();
    // Install built-ins that are not in Rhino yet
    patchGlobals(cx, scope);

    // Environment to share state in this realm
    var e = new Environment();

    // Initialize primordials by calling it as a function
    var primordials = cx.newObject(scope);
    var initPrimordials =
        l.runWrappedFunction(
            cx,
            scope,
            "internal/per_context/primordials.js",
            "function __initPrimordials(primordials) {",
            "}; __initPrimordials");
    initPrimordials.call(cx, scope, null, new Object[] {primordials});
    // TODO not yet
    /*
    var initDom = l.runWrappedFunction(cx, scope, "internal/per_context/domexception.js",
            "function __initDom(primordials) {", "}; __initDom");
    initDom.call(cx, scope, null, new Object[]{primordials});*/
    // TODO need exports
    // l.run(cx, scope, "internal/per_context/messageport.js");
    var process = Process.init(cx, scope);
    var linkedBinding = r.linkedBinding(e, cx, scope);
    var internalBinding = r.internalBinding(e, cx, scope);

    log.debug("Initializing realm");
    var initRealm =
        l.runWrappedFunction(
            cx,
            scope,
            "internal/bootstrap/realm.js",
            "function __initRealm(process, getLinkedBinding, getInternalBinding, primordials) {",
            "}; __initRealm");
    initRealm.call(
        cx, scope, null, new Object[] {process, linkedBinding, internalBinding, primordials});

    log.debug("Booting node.js");
    var bootNode =
        l.runWrappedFunction(
            cx,
            scope,
            "internal/bootstrap/node.js",
            "function __bootNode(process, require, internalBinding, primordials) {",
            "}; __bootNode");
    bootNode.call(
        cx,
        scope,
        null,
        new Object[] {process, e.requireBuiltin(), e.internalBinding(), primordials});

    log.debug("Owns process state");
    var procState =
            l.runWrappedFunction(
                    cx,
                    scope,
                    "internal/bootstrap/switches/does_own_process_state.js",
                    "function __bootProcessState(process, require, internalBinding, primordials) {",
                    "}; __bootProcessState");
    procState.call(
            cx,
            scope,
            null,
            new Object[] {process, e.requireBuiltin(), e.internalBinding(), primordials});

    log.debug("Is main thread");
    var mainThread =
            l.runWrappedFunction(
                    cx,
                    scope,
                    "internal/bootstrap/switches/is_main_thread.js",
                    "function __mainThread(process, require, internalBinding, primordials) {",
                    "}; __mainThread");
    mainThread.call(
            cx,
            scope,
            null,
            new Object[] {process, e.requireBuiltin(), e.internalBinding(), primordials});

    log.debug("Bootstrap complete");
  }

  /** Fix up the environment to support missing features and limitations in Rhino. */
  private void patchGlobals(Context cx, VarScope scope) {
    FakeAtomics.init(cx, scope);
    // FakeFinalizationRegistry.init(cx, scope);
    // FakeWeakRef.init(cx, scope);

    // Apply Reflect.construct compatibility shim for 3-argument constructor reflection in Rhino
    // This is a gross hack until we merge "new.target" support in to Rhino.
    String reflectShim =
        "if (typeof Reflect !== 'undefined' && typeof Reflect.construct === 'function') {\n"
            + "  const originalConstruct = Reflect.construct;\n"
            + "  Reflect.construct = function(target, args, newTarget) {\n"
            + "    if (newTarget) {\n"
            + "      const instance = originalConstruct(target, args);\n"
            + "      Object.setPrototypeOf(instance, newTarget.prototype);\n"
            + "      return instance;\n"
            + "    }\n"
            + "    return originalConstruct(target, args);\n"
            + "  };\n"
            + "}\n";
    cx.evaluateString(scope, reflectShim, "reflect-shim.js", 1, null);
  }
}
