package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.Loader;
import org.brail.ithaca.internal.handles.Handle;
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
    meth(o, s, "setDeserializerCreateObjectFunction", 1, m::setCreateObjectFunction);
    o.defineProperty(
        "DOMException",
        () -> m.getDomException(s, e),
        m::setDomException,
        ScriptableObject.DONTENUM);

    var msgPort =
        new LambdaConstructor(
            s, "MessagePort", 0, (lcx, ls, args) -> MessagePortWrapper.js_constructor(e, args));
    msgPort.definePrototypeMethod(s, "start", 0, MessagePortWrapper::js_start);
    msgPort.definePrototypeMethod(s, "close", 0, Handle::js_close);
    msgPort.definePrototypeMethod(s, "postMessage", 3, MessagePortWrapper::js_postMessage);
    msgPort.definePrototypeMethod(
        s, "_setWireFormatTypes", 2, MessagePortWrapper::js_setWireFormatTypes);
    msgPort.definePrototypeMethod(s, "ref", 0, Handle::js_ref);
    msgPort.definePrototypeMethod(s, "unref", 0, Handle::js_unref);
    msgPort.definePrototypeMethod(s, "hasRef", 0, Handle::js_hasRef);
    o.put("MessagePort", o, msgPort);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
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

  static class MessagePortWrapper extends Handle {
    protected MessagePortWrapper(Environment env) {
      super(env);
    }

    @Override
    public String getClassName() {
      return "MessagePort";
    }

    @Override
    protected void close() {
      log.debug("MessagePort.close (no-op)");
    }

    private static Scriptable js_constructor(Environment e, Object[] args) {
      var self = new MessagePortWrapper(e);
      if (args.length > 0 && !Undefined.isUndefined(args[0])) {
        self.put("port1Id", self, ScriptRuntime.toString(args[0]));
      }
      return self;
    }

    private static Object js_start(Context cx, VarScope s, Object to, Object[] args) {
      log.debug("MessagePort.start (no-op)");
      return Undefined.instance;
    }

    private static Object js_postMessage(Context cx, VarScope s, Object to, Object[] args) {
      log.debug("MessagePort.postMessage (no-op)");
      throw ScriptRuntime.constructError("Error", "postMessage not implemented");
    }

    private static Object js_setWireFormatTypes(Context cx, VarScope s, Object to, Object[] args) {
      log.debug("MessagePort._setWireFormatTypes (no-op)");
      return Undefined.instance;
    }
  }
}
