package org.brail.ithaca.internal;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import org.brail.ithaca.NodeException;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Loader {
  private static final Logger log = LoggerFactory.getLogger(Loader.class);

  private static final Loader instance = new Loader();

  private HashSet<String> internalModules = new HashSet<String>();

  private Loader() {
    try {
      try (var is = Loader.class.getClassLoader().getResourceAsStream("internal_modules.txt")) {
        if (is == null) {
          throw new AssertionError("internal modules file not found in \"internal_modules.txt\"");
        }
        try (var rdr = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
          String line;
          while ((line = rdr.readLine()) != null) {
            internalModules.add(line);
          }
          log.debug("Loaded {} internal modules", internalModules.size());
        }
      }
    } catch (IOException e) {
      throw new AssertionError("Error loading internal modules: " + e, e);
    }
  }

  public static Loader get() {
    return instance;
  }

  public Set<String> internalModules() {
    return internalModules;
  }

  public Callable runWrappedFunction(
      Context cx, VarScope scope, String name, String prefix, String suffix) throws NodeException {
    var ret = runWrapped(cx, scope, name, prefix, suffix);
    if (ret instanceof Callable c) {
      return c;
    }
    throw new NodeException("Internal module " + name + " is not a function");
  }

  public Object runWrapped(Context cx, VarScope scope, String name, String prefix, String suffix)
      throws NodeException {
    try {
      try (var is = openSource(name)) {
        try (var rdr = new InputStreamReader(is, StandardCharsets.UTF_8)) {
          var source = prefix + rdr.readAllAsString() + suffix;
          // Why does this need to be 2?
          var ret = cx.evaluateString(scope, source, name, 2, null);
          log.debug("Evaluated wrapped source code, result = {}", ret);
          return ret;
        }
      }
    } catch (IOException e) {
      throw new NodeException("Error reading internal module " + name + ": " + e, e);
    }
  }

  public void run(Context cx, VarScope scope, String name) throws NodeException {
    try {
      try (var is = openSource(name)) {
        try (var rdr = new InputStreamReader(is, StandardCharsets.UTF_8)) {
          var ret = cx.evaluateReader(scope, rdr, name, 2, null);
          log.debug("Evaluated source code, result = {}", ret);
        }
      }
    } catch (IOException e) {
      throw new NodeException("Error reading internal module " + name + ": " + e, e);
    }
  }

  private InputStream openSource(String name) throws NodeException, IOException {
    var resourceName = "nodejs/" + name;
    var is = Loader.class.getClassLoader().getResourceAsStream(resourceName);
    if (is == null) {
      throw new NodeException("Cannot find internal module " + name);
    }
    log.debug("Opened {}", resourceName);
    return is;
  }
}
