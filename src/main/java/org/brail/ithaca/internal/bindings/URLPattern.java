package org.brail.ithaca.internal.bindings;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.ClassDescriptor;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JSFunction;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.VarScope;
import org.teacon.urlpattern.URLPattern.ComponentType;
import org.teacon.urlpattern.URLPattern.Options;

public class URLPattern extends ScriptableObject {
  private static final String CLASS_NAME = "URLPattern";

  private static final ClassDescriptor DESCRIPTOR;

  private final org.teacon.urlpattern.URLPattern pattern;

  static {
    DESCRIPTOR =
        new ClassDescriptor.Builder(CLASS_NAME, 1, URLPattern::js_constructor)
            .withMethod(ClassDescriptor.Destination.CTOR, "exec", 1, URLPattern::exec)
            .withMethod(ClassDescriptor.Destination.CTOR, "test", 1, URLPattern::test)
            .build();
  }

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var proto = new URLPattern(null);
    var c = DESCRIPTOR.buildConstructor(cx, s, proto, false);
    var o = cx.newObject(s);
    o.put(CLASS_NAME, o, c);
    return o;
  }

  @Override
  public String getClassName() {
    return CLASS_NAME;
  }

  private URLPattern(org.teacon.urlpattern.URLPattern pattern) {
    this.pattern = pattern;
  }

  private static Scriptable js_constructor(
      Context cx, JSFunction f, Object nt, VarScope s, Object to, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.typeError("Not enough parameters");
    }
    org.teacon.urlpattern.URLPattern pattern;
    Optional<Scriptable> options = Optional.empty();
    if (args[0] instanceof Scriptable so) {
      if (args.length > 1) {
        options = Optional.of(ScriptRuntime.toObject(s, args[1]));
      }
      try {
        pattern = constructFromObject(so, options);
      } catch (IllegalArgumentException e) {
        throw ScriptRuntime.typeError("Invalid URL: " + e.toString());
      }
    } else {
      Optional<String> baseURL =
          (args.length > 1 ? Optional.of(ScriptRuntime.toString(args[1])) : Optional.empty());
      if (args.length > 2) {
        options = Optional.of(ScriptRuntime.toObject(s, args[2]));
      }
      try {
        pattern = constructFromString(ScriptRuntime.toString(args[0]), baseURL, options);
      } catch (IllegalArgumentException e) {
        throw ScriptRuntime.typeError("Invalid URL: " + e.toString());
      }
    }

    var o = new URLPattern(pattern);
    o.setParentScope(s);
    o.setPrototype((Scriptable) f.getPrototypeProperty());
    ScriptableObject.defineProperty(o, "hash", pattern.getHash(), READONLY | PERMANENT);
    // TODO ScriptableObject.defineProperty(o, "hasRegExpGroups", pattern.getHash(), READONLY |
    // PERMANENT);
    ScriptableObject.defineProperty(o, "hostname", pattern.getHostname(), READONLY | PERMANENT);
    ScriptableObject.defineProperty(o, "password", pattern.getPassword(), READONLY | PERMANENT);
    ScriptableObject.defineProperty(o, "pathname", pattern.getPathname(), READONLY | PERMANENT);
    ScriptableObject.defineProperty(o, "port", pattern.getPort(), READONLY | PERMANENT);
    ScriptableObject.defineProperty(o, "protocol", pattern.getProtocol(), READONLY | PERMANENT);
    ScriptableObject.defineProperty(o, "search", pattern.getSearch(), READONLY | PERMANENT);
    ScriptableObject.defineProperty(o, "username", pattern.getUsername(), READONLY | PERMANENT);
    return o;
  }

  private static org.teacon.urlpattern.URLPattern constructFromString(
      String url, Optional<String> baseURL, Optional<Scriptable> options) {
    return new org.teacon.urlpattern.URLPattern(url, baseURL.orElse(null), makeOptions(options));
  }

  private static org.teacon.urlpattern.URLPattern constructFromObject(
      Scriptable o, Optional<Scriptable> options) {
    var args = parseOptions(o);
    return new org.teacon.urlpattern.URLPattern(args, makeOptions(options));
  }

  private static Object exec(
      Context cx, JSFunction f, Object nt, VarScope s, Object thisObj, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.typeError("Not enough parameters");
    }
    var u = LambdaConstructor.convertThisObject(thisObj, URLPattern.class);
    if (args[0] instanceof Scriptable so) {
      var options = parseOptions(so);
      try {
        var result = u.pattern.exec(options);
        if (result.isEmpty()) {
          return null;
        }
        // Make the very complicated result thing
        var inputArray = cx.newArray(s, new Object[] {so});
        var m = result.get();
        var g = cx.newObject(s);
        // TODO TODO TODO this is very complicated.
        // Go through the complicated result structure and make a complicated thing.
        throw new AssertionError("not implemented");
      } catch (IllegalArgumentException e) {
        throw ScriptRuntime.typeError("Invalid URL: " + e.toString());
      }
    }
    String baseURL = null;
    Scriptable inputArray;
    if (args.length > 1) {
      baseURL = ScriptRuntime.toString(args[1]);
      inputArray = cx.newArray(s, new Object[] {args[0], args[1]});
    } else {
      inputArray = cx.newArray(s, new Object[] {args[0]});
    }
    var result = u.pattern.exec(ScriptRuntime.toString(args[0]), baseURL);
    if (result.isEmpty()) {
      return null;
    }
    // TODO this is certainly wrong
    var r = cx.newObject(s);
    r.put("input", r, inputArray);
    r.put("result", r, result.get());
    return r;
  }

  private static Object test(
      Context cx, JSFunction f, Object nt, VarScope s, Object thisObj, Object[] args) {
    throw new AssertionError("not implemented");
  }

  private static Options makeOptions(Optional<Scriptable> o) {
    var ignoreCase = false;
    if (o.isPresent()) {
      var s = o.get();
      if (s.has("ignoreCase", s)) {
        ignoreCase = ScriptRuntime.toBoolean(s.get("ignoreCase", s));
      }
    }
    return new Options().withIgnoreCase(ignoreCase);
  }

  private static Map<ComponentType, String> parseOptions(Scriptable o) {
    var args = new HashMap<ComponentType, String>();
    setOption(args, "protocol", org.teacon.urlpattern.URLPattern.ComponentType.PROTOCOL, o);
    setOption(args, "username", org.teacon.urlpattern.URLPattern.ComponentType.USERNAME, o);
    setOption(args, "password", org.teacon.urlpattern.URLPattern.ComponentType.PASSWORD, o);
    setOption(args, "hostname", org.teacon.urlpattern.URLPattern.ComponentType.HOSTNAME, o);
    setOption(args, "port", org.teacon.urlpattern.URLPattern.ComponentType.PORT, o);
    setOption(args, "pathname", org.teacon.urlpattern.URLPattern.ComponentType.PATHNAME, o);
    setOption(args, "search", org.teacon.urlpattern.URLPattern.ComponentType.SEARCH, o);
    setOption(args, "hash", org.teacon.urlpattern.URLPattern.ComponentType.HASH, o);
    setOption(args, "baseURL", org.teacon.urlpattern.URLPattern.ComponentType.BASE_URL, o);
    return args;
  }

  private static void setOption(
      Map<ComponentType, String> m, String name, ComponentType t, Scriptable s) {
    if (s.has(name, s)) {
      m.put(t, ScriptRuntime.toString(s.get(name, s)));
    }
  }
}
