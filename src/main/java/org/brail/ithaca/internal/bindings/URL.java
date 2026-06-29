package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URISyntaxException;
import java.nio.file.Path;

public class URL {
  private static final Logger log = LoggerFactory.getLogger(URL.class);

  // These constants must match the index values used in nodejs/internal/url.js (Ada components model)
  private static final int PROTOCOL_END = 0;
  private static final int USERNAME_END = 1;
  private static final int HOST_START = 2;
  private static final int HOST_END = 3;
  private static final int PORT_OFF = 4;
  private static final int PATHNAME_START = 5;
  private static final int SEARCH_START = 6;
  private static final int HASH_START = 7;
  private static final int SCHEME_TYPE = 8;

  // Global state for the current active URL context, as Node's bindingUrl is conceptually single-threaded.
  private static JsUrl lastActiveUrl = null;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "domainToASCII", 1, URL::domainToAscii);
    meth(o, s, "domainToUnicode", 1, URL::domainToUnicode);
    meth(o, s, "format", 1, URL::format);
    meth(o, s, "getOrigin", 1, URL::getOrigin);
    meth(o, s, "parse", 2, URL::parse);
    meth(o, s, "pathToFileURL", 2, URL::pathToFileURL);
    meth(o, s, "update", 3, URL::update);
    meth(o, s, "canParse", 1, URL::canParse);

    // Exposed as a property getter for bindingUrl.urlComponents
    ((org.mozilla.javascript.ScriptableObject) o).defineProperty("urlComponents", () -> {
      if (lastActiveUrl == null) return null;
      
      // Use a JS array for indices 0-8 to be more efficient in Rhino/JS
      org.mozilla.javascript.Scriptable components = cx.newArray(s, 9);
      components.put(PROTOCOL_END, components, lastActiveUrl.protocolEnd);
      components.put(USERNAME_END, components, lastActiveUrl.usernameEnd);
      components.put(HOST_START, components, lastActiveUrl.hostStart);
      components.put(HOST_END, components, lastActiveUrl.hostEnd);
      components.put(PORT_OFF, components, lastActiveUrl.portOff);
      components.put(PATHNAME_START, components, lastActiveUrl.pathnameStart);
      components.put(SEARCH_START, components, lastActiveUrl.searchStart);
      components.put(HASH_START, components, lastActiveUrl.hashStart);
      components.put(SCHEME_TYPE, components, lastActiveUrl.schemeType);

      // Named properties as required by Node's _updateContext destructuring
      components.put("protocol_end", components, lastActiveUrl.protocolEnd);
      components.put("username_end", components, lastActiveUrl.usernameEnd);
      components.put("host_start", components, lastActiveUrl.hostStart);
      components.put("host_end", components, lastActiveUrl.hostEnd);
      components.put("port", components, lastActiveUrl.portOff); // Note: port maps to index 4
      components.put("pathname_start", components, lastActiveUrl.pathnameStart);
      components.put("search_start", components, lastActiveUrl.searchStart);
      components.put("hash_start", components, lastActiveUrl.hashStart);
      components.put("scheme_type", components, lastActiveUrl.schemeType);

      return components;
    }, null, org.mozilla.javascript.ScriptableObject.DONTENUM | org.mozilla.javascript.ScriptableObject.READONLY);

    
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object domainToAscii(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("domainToAscii not implemented");
  }

  private static Object domainToUnicode(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("domainToUnicode not implemented");
  }

  private static Object format(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }

  private static Object getOrigin(Context cx, VarScope s, Object nt, Object[] args) {
    if (args.length < 1) return "null";
    String url = ScriptRuntime.toString(args[0]);
    JsUrl jsUrl = JsUrl.create(url);
    return jsUrl.computeOrigin();
  }

  private static Object parse(Context cx, VarScope s, Object nt, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String href = ScriptRuntime.toString(args[0]);
    JsUrl jsUrl = JsUrl.create(href);
    lastActiveUrl = jsUrl;
    return jsUrl.getHref();
  }

  private static Object pathToFileURL(Context cx, VarScope s, Object nt, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String path = ScriptRuntime.toString(args[0]);
    var u = Path.of(path).toUri().toString();
    JsUrl jsUrl = JsUrl.create(u);
    lastActiveUrl = jsUrl;
    return jsUrl.getHref();
  }

  private static Object update(Context cx, VarScope s, Object nt, Object[] args) {
    if (args.length < 3) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String href = ScriptRuntime.toString(args[0]);
    int action = ((Number) args[1]).intValue();
    String value = ScriptRuntime.toString(args[2]);

    JsUrl jsUrl = JsUrl.create(href);
    switch (action) {
      case 0: jsUrl.setProtocol(value); break;
      case 1: jsUrl.setHost(value); break;
      case 2: // hostname only - reuse setHost logic for simplicity unless specified otherwise
        jsUrl.setHost(value); 
        break;
      case 3: jsUrl.setPort(value); break;
      case 4: jsUrl.setUsername(value); break;
      case 5: jsUrl.setPassword(value); break;
      case 6: jsUrl.setPathname(value); break;
      case 7: jsUrl.setSearch(value); break;
      case 8: jsUrl.setHash(value); break;
      case 9: // href only - just re-parse the whole string
        jsUrl.parse(value);
        break;
    }
    jsUrl.rebuild();
    lastActiveUrl = jsUrl;
    return jsUrl.getHref();
  }

  private static Object canParse(Context cx, VarScope s, Object nt, Object[] args) {
    if (args.length < 1) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String href = ScriptRuntime.toString(args[0]);
    try {
      JsUrl.create(href);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
