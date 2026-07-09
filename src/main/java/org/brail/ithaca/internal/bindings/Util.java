package org.brail.ithaca.internal.bindings;

import java.util.ArrayList;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Symbol;
import org.mozilla.javascript.SymbolKey;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.mozilla.javascript.typedarrays.NativeArrayBufferView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Util {
  private static final Logger log = LoggerFactory.getLogger(Util.class);

  public static final SymbolKey ARROW_MESSAGE = new SymbolKey("ArrowMessage", Symbol.Kind.REGULAR);
  public static final SymbolKey DECORATED = new SymbolKey("Decorated", Symbol.Kind.REGULAR);
  public static final SymbolKey EXIT_INFO = new SymbolKey("ExitInfo", Symbol.Kind.REGULAR);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var syms = cx.newObject(s);
    syms.put("arrow_message_private_symbol", syms, ARROW_MESSAGE);
    syms.put("decorated_private_symbol", syms, DECORATED);
    syms.put("exit_info_private_symbol", syms, EXIT_INFO);
    o.put("privateSymbols", o, syms);

    var constants = cx.newObject(s);
    Constants.populate(cx, s, constants, NodeConstants.Util.class);
    o.put("constants", o, constants);

    meth(o, s, "constructSharedArrayBuffer", 1, Util::constructSharedArrayBuffer);
    meth(o, s, "guessHandleType", 1, Util::guessHandleType);
    meth(
        o,
        s,
        "defineLazyProperties",
        3,
        (lcx, ls, _, args) -> defineLazyProperties(e, lcx, ls, args));
    meth(o, s, "sleep", 1, Util::sleep);
    meth(o, s, "getExternalValue", 1, Util::getExternalValue);
    meth(o, s, "getCallSites", 0, Util::getCallSites);
    meth(o, s, "parseEnv", 1, Util::parseEnv);
    meth(o, s, "arrayBufferViewHasBuffer", 1, Util::arrayBufferViewHasBuffer);
    meth(o, s, "markPromiseAsHandled", 1, Util::markPromiseAsHandled);
    meth(o, s, "shouldAbortOnUncaughtToggle", 0, Util::shouldAbortOnUncaughtToggle);
    meth(o, s, "isInsideNodeModules", 0, Util::isInsideNodeModules);
    meth(o, s, "getPromiseDetails", 1, Util::getPromiseDetails);
    meth(o, s, "getProxyDetails", 1, Util::getProxyDetails);
    meth(o, s, "getCallerLocation", 0, Util::getCallerLocation);
    meth(o, s, "previewEntries", 0, Util::previewEntries);
    meth(o, s, "getOwnNonIndexProperties", 1, Util::getOwnNonIndexProperties);
    meth(o, s, "getConstructorName", 1, Util::getConstructorName);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object ne(String name) {
    log.debug(name + " not implemented");
    throw ScriptRuntime.typeError(name + " not implemented");
  }

  private static Object constructSharedArrayBuffer(
      Context cx, VarScope s, Object lt, Object[] args) {
    return ne("constructSharedArrayBuffer");
  }

  private static Object guessHandleType(Context cx, VarScope s, Object lt, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    int fd = ScriptRuntime.toInt32(args[0]);
    if (fd >= 0 && fd <= 2) {
      // Assume that "tty" can work for all implementations, we'll see
      return NodeConstants.HandleTypes.TTY;
    }
    // TODO
    return NodeConstants.HandleTypes.UNKNOWN;
  }

  /**
   * Follow the node behavior. When invoked as (obj, moduleName, [properties]), then when any of
   * "properties" are looked up on "obj", we must load the "moduleName" module and assign the named
   * property from the result of the module loading to the target object.
   */
  private static Object defineLazyProperties(Environment e, Context cx, VarScope s, Object[] args) {
    if (args.length < 3) {
      throw ScriptRuntime.typeError("Not enough arguments");
    }
    var target = (ScriptableObject) ScriptRuntime.toObject(s, args[0]);
    var moduleName = ScriptRuntime.toString(args[1]);
    var propNames = ScriptRuntime.toObject(s, args[2]);
    int numPropNames = ScriptRuntime.toInt32(propNames.get("length", propNames));
    int attrs = 0;
    if (args.length > 3 && !ScriptRuntime.toBoolean(args[3])) {
      // If last argument "enumerable" is false
      attrs = ScriptableObject.DONTENUM;
    }
    for (var i = 0; i < numPropNames; i++) {
      var name = ScriptRuntime.toString(propNames.get(i, propNames));
      target.defineProperty(name, () -> getLazyValue(e, s, moduleName, name), (_) -> {}, attrs);
    }
    return Undefined.instance;
  }

  private static Object getLazyValue(
      Environment e, VarScope s, String moduleName, String propertyName) {
    var cx = Context.getCurrentContext();
    var exports = e.requireBuiltin().call(cx, s, null, new Object[] {moduleName});
    if (exports instanceof Scriptable so) {
      var result = ScriptableObject.getProperty(so, propertyName);
      return (result == Scriptable.NOT_FOUND ? Undefined.instance : result);
    }
    return Undefined.instance;
  }

  private static Object sleep(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("sleep");
  }

  private static Object isInsideNodeModules(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("isInsideNodeModules not implemented, always returns false!");
    return false;
  }

  private static Object getPromiseDetails(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("getPromiseDetails");
  }

  private static Object getProxyDetails(Context cx, VarScope s, Object lt, Object[] args) {
    log.debug("getProxyDetails not implemented, always returns undefined!");
    return Undefined.instance;
  }

  private static Object getCallerLocation(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("getCallerLocation");
  }

  private static Object previewEntries(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("previewEntries");
  }

  private static Object getOwnNonIndexProperties(Context cx, VarScope s, Object lt, Object[] args) {
    var so = ArgUtils.getArg(args, 0, ScriptableObject.class);
    if (args.length > 1) {
      int filter = ScriptRuntime.toInt32(args[1]);
      log.debug("getOwnNonIndexProperties filter {} not implemented", filter);
    }
    var stringIds = new ArrayList<String>();
    for (var id : so.getIds()) {
      if (id instanceof String str) {
        // TODO do we get Symbol properties here too?
        stringIds.add(str);
      }
    }
    return cx.newArray(s, stringIds.toArray(new Object[0]));
  }

  private static Object getConstructorName(Context cx, VarScope s, Object lt, Object[] args) {
    var so = ArgUtils.getArg(args, 0, ScriptableObject.class);
    // TODO this may not always be correct!
    return so.getClassName();
  }

  private static Object getExternalValue(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("getExternalValue");
  }

  private static Object getCallSites(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("getCallSites");
  }

  private static Object parseEnv(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("parseEnv");
  }

  private static Object arrayBufferViewHasBuffer(Context cx, VarScope s, Object lt, Object[] args) {
    var view = ArgUtils.getArg(args, 0, NativeArrayBufferView.class);
    return view.getBuffer() != null;
  }

  private static Object markPromiseAsHandled(Context cx, VarScope s, Object lt, Object[] args) {
    return ne("markPromiseAsHandled");
  }

  private static Object shouldAbortOnUncaughtToggle(
      Context cx, VarScope s, Object lt, Object[] args) {
    return ne("shouldAbortOnUncaughtToggle");
  }
}
