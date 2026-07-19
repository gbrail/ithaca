package org.brail.ithaca.internal.bindings;

import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
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

  private static Object readPackageJSON(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String path = ScriptRuntime.toString(args[0]);
    if (args.length > 1 && ScriptRuntime.toBoolean(args[1])) {
      throw ScriptRuntime.typeError("ESM modules not supported yet");
    }
    var pkg = getPackageJSON(cx, s, Path.of(path));
    if (pkg == null) {
      return Undefined.instance;
    }
    return pkg;
  }

  private static Object getNearestParentPackageJSONType(
      Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String path = ScriptRuntime.toString(args[0]);
    var pkg = traversePackages(cx, s, Path.of(path));
    if (pkg == null) {
      return Undefined.instance;
    }
    return pkg.get("type", pkg);
  }

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
    throw ScriptRuntime.typeError("getPackageScopeConfig not implemented");
  }

  private static Object getPackageType(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getPackageType not implemented");
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
        return null;
      }
      path = path.getParent();
    }
    return null;
  }

  private static Scriptable getPackageJSON(Context cx, VarScope s, Path path) {
    // TODO Real Node has a ton of caching for this
    log.debug("Reading {}", path);
    var mapper = new ObjectMapper();
    try {
      try (var rdr = new FileReader(path.toFile())) {
        var pkg = mapper.readValue(rdr, PackageJson.class);
        // Just name, main, and type for now
        // TODO likely a ton to do here
        var o = cx.newObject(s);
        if (pkg.name != null) {
          o.put("name", o, pkg.name);
        }
        if (pkg.type != null) {
          o.put("type", o, pkg.type);
        }
        if (pkg.main != null) {
          o.put("main", o, pkg.main);
        }
        return o;
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
