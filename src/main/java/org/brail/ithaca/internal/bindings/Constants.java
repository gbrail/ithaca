package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class Constants {
  private static final Pattern ERRNO_PATTERN = Pattern.compile("([A-Za-z0-9]+)\\s+([0-9]+)");

  private static final Map<String, Integer> errnos = loadConstantsFromResource("errnos.txt");
  private static final Map<String, Integer> signals = loadConstantsFromResource("signals.txt");

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var os = cx.newObject(s);
    os.put("errno", os, makeConstantObject(cx, s, errnos));
    os.put("signals", os, makeConstantObject(cx, s, signals));
    o.put("os", o, os);
    return o;
  }

  /** Given a map of constant names and values, create a JavaScript object. */
  public static Scriptable makeConstantObject(Context cx, VarScope s, Map<String, Integer> m) {
    var o = cx.newObject(s);
    for (var e : m.entrySet()) {
      o.put(e.getKey(), o, e.getValue());
    }
    return o;
  }

  /**
   * Load a resource file with lines of the format: "name, value", with whitespace in between, and
   * treat each as a constant.
   */
  public static Map<String, Integer> loadConstantsFromResource(String name) {
    try (var is = Constants.class.getClassLoader().getResourceAsStream(name)) {
      return parseConstants(is);
    } catch (IOException e) {
      throw new AssertionError("Fatal error initializing " + name + ": " + e, e);
    }
  }

  public static Map<String, Integer> parseConstants(InputStream is) throws IOException {
    var m = new HashMap<String, Integer>();
    try (var rdr = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
      String line;
      while ((line = rdr.readLine()) != null) {
        var match = ERRNO_PATTERN.matcher(line);
        if (match.matches()) {
          int code = Integer.parseInt(match.group(2));
          m.put(match.group(1), code);
        }
      }
    }
    return m;
  }
}
