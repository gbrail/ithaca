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
      
      org.mozilla.javascript.Scriptable components = cx.newObject(s);
      components.put("0", components, lastActiveUrl.protocolEnd);
      components.put("1", components, lastActiveUrl.usernameEnd);
      components.put("2", components, lastActiveUrl.hostStart);
      components.put("3", components, lastActiveUrl.hostEnd);
      components.put("4", components, lastActiveUrl.portOff);
      components.put("5", components, lastActiveUrl.pathnameStart);
      components.put("6", components, lastActiveUrl.searchStart);
      components.put("7", components, lastActiveUrl.hashStart);
      components.put("8", components, lastActiveUrl.schemeType);

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
    if (args.length < 1) return "";
    return ScriptRuntime.toString(args[0]).toLowerCase(); // Basic stub
  }

  private static Object domainToUnicode(Context cx, VarScope s, Object nt, Object[] args) {
    if (args.length < 1) return "";
    return ScriptRuntime.toString(args[0]); // Basic stub
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
      new java.net.URI(href);
      return true;
    } catch (URISyntaxException e) {
      return false;
    }
  }
}
