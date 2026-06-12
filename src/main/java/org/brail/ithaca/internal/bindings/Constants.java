package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class Constants {
  private static final Pattern ERRNO_PATTERN = Pattern.compile("([A-Z]+)\\s+([0-9]+)");

  private static final HashMap<String, Integer> errnos = loadConstants("errnos.txt");
  private static final HashMap<String, Integer> signals = loadConstants("signals.txt");

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var os = cx.newObject(s);
    os.put("errno", os, makeConstantObject(cx, s, errnos));
    os.put("signals", os, makeConstantObject(cx, s, signals));
    o.put("os", o, os);
    return o;
  }

  private static Scriptable makeConstantObject(Context cx, VarScope s, Map<String, Integer> m) {
    var o = cx.newObject(s);
    for (var e : m.entrySet()) {
      o.put(e.getKey(), o, e.getValue());
    }
    return o;
  }

  private static HashMap<String, Integer> loadConstants(String name) {
    var m = new HashMap<String, Integer>();
    try {
      try (var is = Constants.class.getClassLoader().getResourceAsStream(name)) {
        try (var rdr = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
          var line = rdr.readLine();
          var match = ERRNO_PATTERN.matcher(line);
          if (match.matches()) {
            int code = Integer.parseInt(match.group(2));
            m.put(match.group(1), code);
          }
          return m;
        }
      }
    } catch (IOException e) {
      throw new AssertionError("Fatal error initializing " + name + ": " + e, e);
    }
  }
}
