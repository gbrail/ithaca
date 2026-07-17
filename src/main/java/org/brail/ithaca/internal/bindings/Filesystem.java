package org.brail.ithaca.internal.bindings;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.concurrent.TimeUnit;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.bindings.NodeConstants.FsStatsOffset;
import org.brail.ithaca.internal.common.ArgUtils;
import org.brail.ithaca.internal.filesystem.FSReqCallback;
import org.brail.ithaca.internal.filesystem.FSReqPromise;
import org.brail.ithaca.internal.filesystem.FileHandle;
import org.brail.ithaca.internal.filesystem.FileHandleCloseReq;
import org.brail.ithaca.internal.filesystem.FileHandleReqWrap;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Filesystem {
  private static final Logger log = LoggerFactory.getLogger(Filesystem.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);

    meth(o, s, "getFormatOfExtensionlessFile", 2, Filesystem::getFormatOfExtensionlessFile);
    meth(o, s, "access", 2, Filesystem::access);
    meth(o, s, "close", 1, Filesystem::close);
    meth(o, s, "existsSync", 1, Filesystem::existsSync);
    meth(o, s, "open", 2, Filesystem::open);
    meth(o, s, "openFileHandle", 2, Filesystem::openFileHandle);
    meth(o, s, "read", 3, Filesystem::read);
    meth(o, s, "readFileUtf8", 1, Filesystem::readFileUtf8);
    meth(o, s, "readBuffers", 3, Filesystem::readBuffers);
    meth(o, s, "fdatasync", 1, Filesystem::fdatasync);
    meth(o, s, "fsync", 1, Filesystem::fsync);
    meth(o, s, "rename", 3, Filesystem::rename);
    meth(o, s, "ftruncate", 2, Filesystem::ftruncate);
    meth(o, s, "rmdir", 2, Filesystem::rmdir);
    meth(o, s, "rmSync", 4, Filesystem::rmSync);
    meth(o, s, "internalModuleStat", 1, Filesystem::internalModuleStat);
    meth(o, s, "stat", 4, Filesystem::stat);
    meth(o, s, "lstat", 4, Filesystem::lstat);
    meth(o, s, "fstat", 3, Filesystem::fstat);
    meth(o, s, "statfs", 3, Filesystem::statfs);
    meth(o, s, "link", 3, Filesystem::link);
    meth(o, s, "symlink", 4, Filesystem::symlink);
    meth(o, s, "readlink", 3, Filesystem::readlink);
    meth(o, s, "unlink", 2, Filesystem::unlink);
    meth(o, s, "writeBuffer", 6, Filesystem::writeBuffer);
    meth(o, s, "writeBuffers", 4, Filesystem::writeBuffers);
    meth(o, s, "writeString", 5, Filesystem::writeString);
    meth(o, s, "writeFileUtf8", 4, Filesystem::writeFileUtf8);
    meth(o, s, "realpath", 3, Filesystem::realpath);
    meth(o, s, "copyFile", 4, Filesystem::copyFile);
    meth(o, s, "chmod", 3, Filesystem::chmod);
    meth(o, s, "fchmod", 3, Filesystem::fchmod);
    meth(o, s, "chown", 4, Filesystem::chown);
    meth(o, s, "fchown", 4, Filesystem::fchown);
    meth(o, s, "lchown", 4, Filesystem::lchown);
    meth(o, s, "utimes", 4, Filesystem::utimes);
    meth(o, s, "futimes", 4, Filesystem::futimes);
    meth(o, s, "lutimes", 4, Filesystem::lutimes);
    meth(o, s, "mkdtemp", 3, Filesystem::mkdtemp);
    meth(o, s, "cpSyncCheckPaths", 4, Filesystem::cpSyncCheckPaths);
    meth(o, s, "cpSyncOverrideFile", 4, Filesystem::cpSyncOverrideFile);
    meth(o, s, "cpSyncCopyDir", 7, Filesystem::cpSyncCopyDir);

    var reqCallback = new LambdaConstructor(s, "FSReqCallback", 0, FSReqCallback::js_constructor);
    o.put("FSReqCallback", o, reqCallback);

    var reqWrap =
        new LambdaConstructor(s, "FileHandleReqWrap", 0, FileHandleReqWrap::js_constructor);
    o.put("FileHandleReqWrap", o, reqWrap);

    var reqPromise = new LambdaConstructor(s, "FSReqPromise", 0, FSReqPromise::js_constructor);
    o.put("FSReqPromise", o, reqPromise);

    var closeReq =
        new LambdaConstructor(s, "FileHandleCloseReq", 0, FileHandleCloseReq::js_constructor);
    o.put("FileHandleCloseReq", o, closeReq);

    var fh = new LambdaConstructor(s, "FileHandle", 0, FileHandle::js_constructor);
    fh.definePrototypeMethod(s, "close", 0, FileHandle::js_close);
    fh.definePrototypeMethod(s, "closeSync", 0, FileHandle::js_closeSync);
    fh.definePrototypeMethod(s, "releaseFD", 0, FileHandle::js_releaseFD);
    o.put("FileHandle", o, fh);

    o.put("kUsePromises", o, false);
    o.put("kFsStatsFieldNumber", o, NodeConstants.FsStatsOffset.kFsStatsFieldsNumber);
    o.put("kFsStatsFsFieldNumber", o, NodeConstants.FsStatFsOffset.kFsStatFsFieldsNumber);
    o.put("kFsStatsBufferLength", o, NodeConstants.FsStatFsOffset.kFsStatsBufferLength);

    return o;
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private static Object getFormatOfExtensionlessFile(
      Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("getFormatOfExtensionlessFile not implemented");
  }

  private static Object access(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("access not implemented");
    throw ScriptRuntime.typeError("access not implemented");
  }

  private static Object close(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("close not implemented");
    throw ScriptRuntime.typeError("close not implemented");
  }

  private static Object existsSync(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("existsSync not implemented");
    throw ScriptRuntime.typeError("existsSync not implemented");
  }

  private static Object open(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("open not implemented");
    throw ScriptRuntime.typeError("open not implemented");
  }

  private static Object openFileHandle(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("openFileHandle not implemented");
    throw ScriptRuntime.typeError("openFileHandle not implemented");
  }

  private static Object read(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("read not implemented");
  }

  private static Object readFileUtf8(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("readFileUtf8 not implemented");
  }

  private static Object readBuffers(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("readBuffers not implemented");
  }

  private static Object fdatasync(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("fdatasync not implemented");
  }

  private static Object fsync(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("fsync not implemented");
  }

  private static Object rename(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("rename not implemented");
  }

  private static Object ftruncate(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("ftruncate not implemented");
  }

  private static Object rmdir(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("rmdir not implemented");
  }

  private static Object rmSync(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("rmSync not implemented");
  }

  private static Object internalModuleStat(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String path = ScriptRuntime.toString(args[0]);
    try {
      log.debug("internalModuleStat: {}", path);
      var attrs = Files.readAttributes(Path.of(path), BasicFileAttributes.class);
      if (attrs.isDirectory()) {
        return 1;
      } else if (attrs.isRegularFile()) {
        return 0;
      } else {
        // Weird thing like a device of symlink
        return NodeConstants.Uv.EFTYPE;
      }
    } catch (FileNotFoundException fnfe) {
      // Make sure we return a "uv" error code here which will be < 0
      log.debug("Not found");
      return NodeConstants.Uv.ENOENT;
    } catch (IOException ioe) {
      log.debug("I/O error: {}", ioe, ioe);
      return NodeConstants.Uv.EIO;
    }
  }

  private static Object stat(Context cx, VarScope s, Object to, Object[] args) {
    return statImpl(cx, s, to, args, true);
  }

  private static Object lstat(Context cx, VarScope s, Object to, Object[] args) {
    return statImpl(cx, s, to, args, false);
  }

  private static Object statImpl(
      Context cx, VarScope s, Object to, Object[] args, boolean followLinks) {
    ArgUtils.checkArgs(3, args);
    String path = ScriptRuntime.toString(args[0]);
    boolean useBigint = ScriptRuntime.toBoolean(args[1]);

    if (!Undefined.isUndefined(args[2])) {
      throw ScriptRuntime.typeError("Async lstat not implemented");
    } else {
      boolean throwIfNotFound = ScriptRuntime.toBoolean(args[3]);
      try {
        BasicFileAttributes attrs;
        if (followLinks) {
          attrs = Files.readAttributes(Path.of(path), BasicFileAttributes.class);
        } else {
          attrs =
              Files.readAttributes(
                  Path.of(path), BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
        }
        log.debug("stat(\"{}\" bigInt = {})", path, useBigint);
        return returnStats(cx, s, attrs, useBigint);
      } catch (FileNotFoundException fnfe) {
        log.debug("stat(\"{}\" bigInt = {}): not found", path, useBigint);
        if (throwIfNotFound) {
          throw ScriptRuntime.constructError("Error", "File not found");
        }
        return returnStatsNotFound(cx, s, useBigint);
      } catch (IOException ioe) {
        log.debug("stat(\"{}\"): {}", path, ioe.getMessage());
        throw ScriptRuntime.constructError("Error", "File error: " + ioe.getMessage());
      }
    }
  }

  private static Object fstat(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("fstat not implemented");
    throw ScriptRuntime.typeError("fstat not implemented");
  }

  private static Object statfs(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("statfs not implemented");
    throw ScriptRuntime.typeError("statfs not implemented");
  }

  private static Object returnStats(
      Context cx, VarScope s, BasicFileAttributes attrs, boolean useBigInt) {
    Scriptable a;
    if (useBigInt) {
      a = cx.newObject(s, "BigInt64Array", new Object[] {FsStatsOffset.kFsStatsFieldsNumber});
    } else {
      a = cx.newObject(s, "Float64Array", new Object[] {FsStatsOffset.kFsStatsFieldsNumber});
    }
    // TODO all the attributes, just doing the basic ones for now
    a.put(
        FsStatsOffset.kCTimeSec, a, statVal(attrs.creationTime().to(TimeUnit.SECONDS), useBigInt));
    a.put(
        FsStatsOffset.kCTimeNsec,
        a,
        statVal(attrs.creationTime().to(TimeUnit.NANOSECONDS), useBigInt));
    a.put(
        FsStatsOffset.kATimeSec,
        a,
        statVal(attrs.lastAccessTime().to(TimeUnit.SECONDS), useBigInt));
    a.put(
        FsStatsOffset.kATimeNsec,
        a,
        statVal(attrs.lastAccessTime().to(TimeUnit.NANOSECONDS), useBigInt));
    a.put(
        FsStatsOffset.kMTimeSec,
        a,
        statVal(attrs.lastModifiedTime().to(TimeUnit.SECONDS), useBigInt));
    a.put(
        FsStatsOffset.kMTimeNsec,
        a,
        statVal(attrs.lastModifiedTime().to(TimeUnit.NANOSECONDS), useBigInt));
    a.put(FsStatsOffset.kSize, a, statVal(attrs.size(), useBigInt));
    // 512-byte blocks because why not?
    a.put(FsStatsOffset.kBlkSize, a, 512);
    a.put(FsStatsOffset.kBlocks, a, statVal(attrs.size() / 512, useBigInt));
    return a;
  }

  private static Object returnStatsNotFound(Context cx, VarScope s, boolean useBigInt) {
    if (useBigInt) {
      return cx.newObject(s, "BigInt64Array", new Object[] {FsStatsOffset.kFsStatsFieldsNumber});
    } else {
      return cx.newObject(s, "Float64Array", new Object[] {FsStatsOffset.kFsStatsFieldsNumber});
    }
  }

  private static Object statVal(long val, boolean useBigInt) {
    return useBigInt ? BigInteger.valueOf(val) : (double) val;
  }

  private static Object link(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("link not implemented");
  }

  private static Object symlink(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("symlink not implemented");
  }

  private static Object readlink(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("readlink not implemented");
  }

  private static Object unlink(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("unlink not implemented");
  }

  private static Object writeBuffer(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("writeBuffer not implemented");
  }

  private static Object writeBuffers(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("writeBuffers not implemented");
  }

  private static Object writeString(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("writeString not implemented");
  }

  private static Object writeFileUtf8(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("writeFileUtf8 not implemented");
  }

  private static Object realpath(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("realpath not implemented");
  }

  private static Object copyFile(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("copyFile not implemented");
  }

  private static Object chmod(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("chmod not implemented");
  }

  private static Object fchmod(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("fchmod not implemented");
  }

  private static Object chown(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("chown not implemented");
  }

  private static Object fchown(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("fchown not implemented");
  }

  private static Object lchown(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("lchown not implemented");
  }

  private static Object utimes(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("utimes not implemented");
  }

  private static Object futimes(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("futimes not implemented");
  }

  private static Object lutimes(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("lutimes not implemented");
  }

  private static Object mkdtemp(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("mkdtemp not implemented");
  }

  private static Object cpSyncCheckPaths(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("cpSyncCheckPaths not implemented");
  }

  private static Object cpSyncOverrideFile(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("cpSyncOverrideFile not implemented");
  }

  private static Object cpSyncCopyDir(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("cpSyncCopyDir not implemented");
  }
}
