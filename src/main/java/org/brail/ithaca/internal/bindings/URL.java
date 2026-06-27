package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;

public class URL {
  private static final Logger log = LoggerFactory.getLogger(URL.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "domainToASCII", 1, URL::domainToAscii);
    meth(o, s, "domainToUnicode", 1, URL::domainToUnicode);
    meth(o, s, "format", 1, URL::format);
    meth(o, s, "getOrigin", 1, URL::getOrigin);
    meth(o, s, "parse", 1, URL::parse);
    meth(o, s, "pathToFileURL", 1, URL::pathToFileURL);
    meth(o, s, "update", 1, URL::update);
    meth(o, s, "canParse", 1, URL::canParse);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object domainToAscii(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }

  private static Object domainToUnicode(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }

  private static Object format(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }

  private static Object getOrigin(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }

  private static Object parse(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }

  /**
   * Turn a file path into a file:// URL, safely. Node does a bunch of Windows-specific stuff here
   * -- we leave that to Java for now.
   */
  private static Object pathToFileURL(Context cx, VarScope s, Object nt, Object[] args) {
    if (args.length < 2) {
      throw ScriptRuntime.rangeError("Not enough arguments");
    }
    String path = ScriptRuntime.toString(args[0]);
    var u = Path.of(path).toUri().toString();
    log.debug("URL: {}", u);
    return u;
  }

  private static Object update(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }

  private static Object canParse(Context cx, VarScope s, Object nt, Object[] args) {
    throw new AssertionError("not implemented");
  }
}
