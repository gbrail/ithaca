package org.brail.ithaca.internal.bindings;

import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.brail.ithaca.internal.common.PackageJson;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Modules {
  private static final Logger log = LoggerFactory.getLogger(Modules.class);

  // Indices into SerializedPackageConfig:
  // [NAME, MAIN, TYPE, PLAIN_IMPORTS, PLAIN_EXPORTS, OPTIONAL_FILE_PATH]
  private static final int PKG_NAME = 0;
  private static final int PKG_MAIN = 1;
  private static final int PKG_TYPE = 2;
  private static final int PKG_PLAIN_IMPORTS = 3;
  private static final int PKG_PLAIN_EXPORTS = 4;
  private static final int PKG_OPTIONAL_FILE_PATH = 5;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    meth(o, s, "readPackageJSON", 1, Modules::readPackageJSON);
    meth(o, s, "getNearestParentPackageJSONType", 1, Modules::getNearestParentPackageJSONType);
    meth(o, s, "getNearestParentPackageJSON", 1, Modules::getNearestParentPackageJSON);
    meth(o, s, "getPackageScopeConfig", 1, Modules::getPackageScopeConfig);
    meth(o, s, "getPackageType", 1, Modules::getPackageType);
    meth(o, s, "enableCompileCache", 0, Modules::enableCompileCache);
    meth(o, s, "flushCompileCache", 0, Modules::flushCompileCache);
    meth(o, s, "getCompileCacheEntry", 1, Modules::getCompileCacheEntry);
    meth(o, s, "saveCompileCacheEntry", 2, Modules::saveCompileCacheEntry);
    var cc = cx.newObject(s);
    cc.put("FAILED", cc, 0);
    cc.put("ENABLED", cc, 1);
    cc.put("ALREADY_ENABLED", cc, 2);
    cc.put("DISABLED", cc, 2);
    o.put("compileCacheStatus", o, cc);
    var ct = cx.newObject(s);
    ct.put("kCommonJS", ct, 0);
    ct.put("kESM", ct, 1);
    ct.put("kStrippedTypeScript", ct, 2);
    o.put("cachedCodeTypes", o, ct);
    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  /**
   * readPackageJSON(path: string): SerializedPackageConfig | undefined.
   *
   * <p>Node expects a numeric-indexed tuple (6 elements) that is consumed by
   * deserializePackageJSON() which destructures via {@code 0: name, 1: main, …}.
   */
  private static Object readPackageJSON(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String path = ScriptRuntime.toString(args[0]);
    log.debug("readPackageJSON: {} esm = {}", path, args.length > 1 ? args[1] : null);
    if (args.length > 1 && ScriptRuntime.toBoolean(args[1])) {
      throw ScriptRuntime.typeError("ESM modules not supported yet");
    }
    var pkg = getPackageJSON(cx, s, Path.of(path));
    if (pkg == null) {
      log.debug("package.json not found");
      return Undefined.instance;
    }
    log.debug("Found: {}", pkg);
    return pkg;
  }

  /** Returns just the type string or undefined. */
  private static Object getNearestParentPackageJSONType(
      Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String path = ScriptRuntime.toString(args[0]);
    var pkg = traversePackages(cx, s, Path.of(path));
    if (pkg == null) {
      return Undefined.instance;
    }
    // SerializedPackageConfig is [name, main, type, ...] — type is at index 2.
    return pkg.get(PKG_TYPE, pkg);
  }

  /** Returns the full SerializedPackageConfig tuple or undefined. */
  private static Object getNearestParentPackageJSON(
      Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String path = ScriptRuntime.toString(args[0]);
    var pkg = traversePackages(cx, s, Path.of(path));
    if (pkg == null) {
      return Undefined.instance;
    }
    return pkg;
  }

  private static Object getPackageScopeConfig(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    var arg = ScriptRuntime.toString(args[0]);
    log.debug("getPackageScopeConfig: {}", arg);
    return getPackageScopeImpl(cx, s, arg, false);
  }

  private static Object getPackageType(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    var arg = ScriptRuntime.toString(args[0]);
    log.debug("getPackageType: {}", arg);
    return getPackageScopeImpl(cx, s, arg, true);
  }

  private static Object getPackageScopeImpl(Context cx, VarScope s, String arg, boolean typeOnly) {
    URL base;
    try {
      base = new URI(arg).toURL();
    } catch (URISyntaxException | MalformedURLException e) {
      throw ScriptRuntime.typeError("Invalid URI: " + arg);
    }
    var startPath = Path.of(base.getFile());
    var packages = traversePackages(cx, s, startPath);
    if (packages == null) {
      if (typeOnly) {
        return Undefined.instance;
      }
      return Path.of(startPath.toString(), "package.json").toString();
    } else {
      if (typeOnly) {
        return packages.get(PKG_TYPE, packages);
      }
      return packages;
    }
  }

  private static Object enableCompileCache(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("enableCompileCache");
    throw ScriptRuntime.typeError("enableCompileCache not implemented");
  }

  private static Object flushCompileCache(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("flushCompileCache not implemented");
  }

  private static Object getCompileCacheEntry(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("getCompileCacheEntry");
    throw ScriptRuntime.typeError("getCompileCacheEntry not implemented");
  }

  private static Object saveCompileCacheEntry(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("saveCompileCacheEntry");
    throw ScriptRuntime.typeError("saveCompileCacheEntry not implemented");
  }

  /**
   * Walks up from {@code startPath} looking for a package.json in each ancestor directory. Stops at
   * the filesystem root or when crossing a {@code node_modules} boundary.
   */
  private static Scriptable traversePackages(Context cx, VarScope s, Path startPath) {
    var path = startPath.getParent();
    while (path != null) {
      if (path.getParent() == null) {
        return null;
      }
      if ("node_modules".equals(path.getFileName().toString())) {
        return null;
      }
      var mod = Path.of(path.toString(), "package.json");
      var pkg = getPackageJSON(cx, s, mod);
      if (pkg != null) {
        return pkg;
      }
      path = path.getParent();
    }
    return null;
  }

  /**
   * Reads and parses a package.json into a SerializedPackageConfig tuple: {@code [name, main, type,
   * plainImports, plainExports, optionalFilePath]}.
   */
  private static Scriptable getPackageJSON(Context cx, VarScope s, Path path) {
    log.debug("Reading {}", path);
    var mapper = new ObjectMapper();
    try {
      try (var rdr = new FileReader(path.toFile())) {
        var pkg = mapper.readValue(rdr, PackageJson.class);

        // Build a 6-element JS array (SerializedPackageConfig).
        var arr = cx.newArray(s, 6);

        arr.put(
            PKG_NAME,
            arr,
            pkg.name != null ? pkg.name : Undefined.instance); // undefined when absent

        arr.put(
            PKG_MAIN,
            arr,
            pkg.main != null ? pkg.main : Undefined.instance); // undefined when absent

        arr.put(
            PKG_TYPE,
            arr,
            pkg.type != null ? pkg.type : Undefined.instance); // undefined when absent

        arr.put(
            PKG_PLAIN_IMPORTS,
            arr,
            pkg.imports != null
                ? mapper.writeValueAsString(pkg.imports)
                : Undefined.instance); // undefined when absent

        arr.put(
            PKG_PLAIN_EXPORTS,
            arr,
            pkg.exports != null
                ? mapper.writeValueAsString(pkg.exports)
                : Undefined.instance); // undefined when absent

        arr.put(PKG_OPTIONAL_FILE_PATH, arr, Undefined.instance); // unused

        return arr;
      }
    } catch (FileNotFoundException e) {
      log.debug("Not found.");
      return null;
    } catch (DatabindException de) {
      log.debug("Invalid JSON: {}", de, de);
      throw ScriptRuntime.constructError(
          "Error", "Invalid package configuration for " + path + ": " + de.getMessage());
    } catch (IOException ioe) {
      log.debug("Error reading {}: {}", path, ioe, ioe);
      return null;
    }
  }
}
