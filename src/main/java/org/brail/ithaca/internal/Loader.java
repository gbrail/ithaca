package org.brail.ithaca.internal;

import org.brail.ithaca.NodeException;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class Loader {
  private static final Loader instance = new Loader();

  private Loader() {}

  public static Loader get() {
    return instance;
  }

  public void run(Context cx, VarScope scope, String name) throws NodeException {
    try {
      try (var is = openSource(name)) {
        try (var rdr = new InputStreamReader(is)) {
          cx.evaluateReader(scope, rdr, name, 1, null);
        }
      }
    } catch (IOException e) {
      throw new NodeException("Error reading internal module " + name + ": " + e, e);
    }
  }

  private InputStream openSource(String name) throws NodeException, IOException {
    var is = Loader.class.getClassLoader().getResourceAsStream("nodejs/" + name);
    if (is == null) {
      throw new NodeException("Cannot find internal module " + name);
    }
    return is;
  }
}
