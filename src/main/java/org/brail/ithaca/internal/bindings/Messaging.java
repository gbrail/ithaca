package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.Loader;
import org.mozilla.javascript.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Messaging {
  private static final Logger log = LoggerFactory.getLogger(Messaging.class);

  private Callable createObjectFunction;
  private Object domException;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var m = new Messaging();
    var o = (ScriptableObject) cx.newObject(s);
    o.put(
        "setDeserializerCreateObjectFunction",
        o,
        new LambdaFunction(
            s, "setDeserializerCreateObjectFunction", 1, m::setCreateObjectFunction));
    o.defineProperty(
        "DOMException",
        () -> m.getDomException(s, e),
        m::setDomException,
        ScriptableObject.DONTENUM);
    return o;
  }

  private void setDomException(Object o) {
    domException = o;
  }

  private Object getDomException(VarScope s, Environment e) {
    if (domException != null) {
      log.debug("Return DOMException");
      return domException;
    }
    log.debug("Initializing DOMException");
    Context cx = Context.getCurrentContext();
    String prefix =
        """
            function __initDom(primordials, internalBinding, exports) {
            const {
              privateSymbols,
              perIsolateSymbols,
            } = internalBinding('util');
        """;
    String suffix = "\n}; __initDom";
    var exports = cx.newObject(s);
    Callable initFunc;
    try {
      initFunc =
          Loader.get()
              .runWrappedFunction(cx, s, "internal/per_context/domexception.js", prefix, suffix);
    } catch (NodeException ne) {
      throw ScriptRuntime.constructError("Error", "Error initializing DOMException: " + ne);
    }

    initFunc.call(cx, s, null, new Object[] {e.primordials(), e.internalBinding(), exports});
    domException = exports.get("DOMException", exports);
    assert domException != null;
    log.debug("DOMException is " + domException);
    return domException;
  }

  private Object setCreateObjectFunction(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length > 0 && args[0] instanceof Callable c) {
      createObjectFunction = c;
    }
    return Undefined.instance;
  }
}
