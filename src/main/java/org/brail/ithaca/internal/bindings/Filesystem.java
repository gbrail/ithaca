package org.brail.ithaca.internal.bindings;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
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
import org.mozilla.javascript.typedarrays.NativeArrayBuffer;
import org.mozilla.javascript.typedarrays.NativeArrayBufferView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Filesystem {
  private static final Logger log = LoggerFactory.getLogger(Filesystem.class);

  private record OpenFile(RandomAccessFile raf, Path path) {}

  private static final ConcurrentHashMap<Integer, OpenFile> openFiles = new ConcurrentHashMap<>();
  private static final AtomicInteger nextFd = new AtomicInteger(100);

  private record BufferRange(byte[] array, int offset, int length) {}

  private static BufferRange getBufferRange(Object arg) {
    if (arg instanceof NativeArrayBuffer nab) {
      return new BufferRange(nab.getBuffer(), 0, nab.getLength());
    } else if (arg instanceof NativeArrayBufferView abv) {
      return new BufferRange(abv.getBuffer().getBuffer(), abv.getByteOffset(), abv.getByteLength());
    } else {
      throw ScriptRuntime.typeError("Argument is not a buffer");
    }
  }

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
    meth(o, s, "mkdir", 3, Filesystem::mkdir);
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
    ArgUtils.checkArgs(1, args);
    int fd = ScriptRuntime.toInt32(args[0]);
    OpenFile of = openFiles.remove(fd);
    if (of != null) {
      try {
        of.raf.close();
        log.debug("Closed fd {}", fd);
      } catch (IOException e) {
        throw ScriptRuntime.constructError(
            "Error", "Error closing fd " + fd + ": " + e.getMessage());
      }
    }
    return Undefined.instance;
  }

  private static Object existsSync(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    try {
      return Files.exists(Path.of(pathStr));
    } catch (Exception e) {
      return false;
    }
  }

  private static Object open(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(3, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    int flags = ScriptRuntime.toInt32(args[1]);
    int mode = ScriptRuntime.toInt32(args[2]);

    try {
      Path path = Path.of(pathStr).toAbsolutePath();
      boolean exists = Files.exists(path);

      boolean isWrite = (flags & (NodeConstants.Fs.O_WRONLY | NodeConstants.Fs.O_RDWR)) != 0;
      boolean isAppend = (flags & NodeConstants.Fs.O_APPEND) != 0;
      boolean isCreate = (flags & NodeConstants.Fs.O_CREAT) != 0;
      boolean isExcl = (flags & NodeConstants.Fs.O_EXCL) != 0;
      boolean isTrunc = (flags & NodeConstants.Fs.O_TRUNC) != 0;

      if (exists) {
        if (isCreate && isExcl) {
          throw ScriptRuntime.constructError(
              "Error", "EEXIST: file already exists, open '" + pathStr + "'");
        }
      } else {
        if (!isCreate) {
          throw ScriptRuntime.constructError(
              "Error", "ENOENT: no such file or directory, open '" + pathStr + "'");
        }
        Path parent = path.getParent();
        if (parent != null && !Files.exists(parent)) {
          Files.createDirectories(parent);
        }
      }

      String rafMode = isWrite ? "rw" : "r";
      RandomAccessFile raf = new RandomAccessFile(path.toFile(), rafMode);

      if (exists && isWrite && isTrunc) {
        raf.setLength(0);
      }
      if (isAppend) {
        raf.seek(raf.length());
      }

      int fd = nextFd.getAndIncrement();
      openFiles.put(fd, new OpenFile(raf, path));
      log.debug("Opened fd {} for path: {}", fd, pathStr);
      return fd;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error opening file " + pathStr + ": " + e.getMessage());
    }
  }

  private static Object openFileHandle(Context cx, VarScope s, Object to, Object[] args) {
    log.debug("openFileHandle not implemented");
    throw ScriptRuntime.typeError("openFileHandle not implemented");
  }

  private static Object read(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(5, args);
    int fd = ScriptRuntime.toInt32(args[0]);
    Object bufferArg = args[1];
    int offset = ScriptRuntime.toInt32(args[2]);
    int length = ScriptRuntime.toInt32(args[3]);
    long position = (long) ScriptRuntime.toInteger(args[4]);

    OpenFile of = openFiles.get(fd);
    if (of == null) {
      throw ScriptRuntime.constructError("Error", "EBADF: bad file descriptor, read");
    }

    try {
      BufferRange br = getBufferRange(bufferArg);
      int destOffset = br.offset + offset;
      if (destOffset < 0 || destOffset >= br.array.length) {
        throw ScriptRuntime.rangeError("Offset is out of bounds");
      }
      int maxRead = Math.min(length, br.array.length - destOffset);
      if (maxRead <= 0) {
        return 0;
      }

      long originalPointer = -1;
      if (position >= 0) {
        originalPointer = of.raf.getFilePointer();
        of.raf.seek(position);
      }

      int bytesRead = of.raf.read(br.array, destOffset, maxRead);
      if (bytesRead < 0) {
        bytesRead = 0;
      }

      if (position >= 0) {
        of.raf.seek(originalPointer);
      }

      return bytesRead;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error reading file descriptor " + fd + ": " + e.getMessage());
    }
  }

  private static Object readFileUtf8(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    if (args[0] instanceof Number) {
      throw ScriptRuntime.typeError("fds not supported yet");
    }
    String fileName = ScriptRuntime.toString(args[0]);
    // TODO ignore possible flags in args[1]
    log.debug("readFileUtf8: {}", fileName);
    try {
      return Files.readString(Path.of(fileName), StandardCharsets.UTF_8);
    } catch (FileNotFoundException fe) {
      throw ScriptRuntime.constructError("Error", "File not found: " + fileName);
    } catch (IOException e) {
      throw ScriptRuntime.constructError("Error", "I/O error reading " + fileName + ": " + e);
    }
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
    ArgUtils.checkArgs(2, args);
    String oldPath = ScriptRuntime.toString(args[0]);
    String newPath = ScriptRuntime.toString(args[1]);
    try {
      Files.move(
          Path.of(oldPath), Path.of(newPath), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
      return Undefined.instance;
    } catch (IOException e) {
      throw ScriptRuntime.constructError("Error", "Error renaming path: " + e.getMessage());
    }
  }

  private static Object ftruncate(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(2, args);
    int fd = ScriptRuntime.toInt32(args[0]);
    long len = (long) ScriptRuntime.toInteger(args[1]);

    OpenFile of = openFiles.get(fd);
    if (of == null) {
      throw ScriptRuntime.constructError("Error", "EBADF: bad file descriptor, ftruncate");
    }

    try {
      of.raf.setLength(len);
      return Undefined.instance;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error truncating file descriptor " + fd + ": " + e.getMessage());
    }
  }

  private static Object rmdir(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    try {
      Files.delete(Path.of(pathStr));
      return Undefined.instance;
    } catch (IOException e) {
      throw ScriptRuntime.constructError("Error", "Error deleting directory: " + e.getMessage());
    }
  }

  private static Object rmSync(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(4, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    boolean throwOnNoent = ScriptRuntime.toBoolean(args[1]);
    boolean recursive = ScriptRuntime.toBoolean(args[2]);
    boolean force = ScriptRuntime.toBoolean(args[3]);

    try {
      Path path = Path.of(pathStr);
      if (!Files.exists(path)) {
        if (throwOnNoent && !force) {
          throw ScriptRuntime.constructError(
              "Error", "ENOENT: no such file or directory, rm '" + pathStr + "'");
        }
        return Undefined.instance;
      }

      if (Files.isDirectory(path) && recursive) {
        try (var stream = Files.walk(path)) {
          var paths = stream.sorted(java.util.Comparator.reverseOrder()).toArray(Path[]::new);
          for (var p : paths) {
            Files.delete(p);
          }
        }
      } else {
        Files.delete(path);
      }
      return Undefined.instance;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error in rmSync for " + pathStr + ": " + e.getMessage());
    }
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
    ArgUtils.checkArgs(3, args);
    int fd = ScriptRuntime.toInt32(args[0]);
    boolean useBigint = ScriptRuntime.toBoolean(args[1]);

    OpenFile of = openFiles.get(fd);
    if (of == null) {
      throw ScriptRuntime.constructError("Error", "EBADF: bad file descriptor, fstat");
    }

    try {
      BasicFileAttributes attrs = Files.readAttributes(of.path, BasicFileAttributes.class);
      return returnStats(cx, s, attrs, useBigint);
    } catch (IOException e) {
      throw ScriptRuntime.constructError("Error", "File error: " + e.getMessage());
    }
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
    ArgUtils.checkArgs(1, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    try {
      Files.delete(Path.of(pathStr));
      return Undefined.instance;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error deleting file " + pathStr + ": " + e.getMessage());
    }
  }

  private static Object writeBuffer(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(7, args);
    int fd = ScriptRuntime.toInt32(args[0]);
    Object bufferArg = args[1];
    int offset = ScriptRuntime.toInt32(args[2]);
    int length = ScriptRuntime.toInt32(args[3]);
    Object positionArg = args[4];

    OpenFile of = openFiles.get(fd);
    if (of == null) {
      throw ScriptRuntime.constructError("Error", "EBADF: bad file descriptor, write");
    }

    try {
      BufferRange br = getBufferRange(bufferArg);
      int srcOffset = br.offset + offset;
      if (srcOffset < 0 || srcOffset >= br.array.length) {
        throw ScriptRuntime.rangeError("Offset is out of bounds");
      }
      int maxWrite = Math.min(length, br.array.length - srcOffset);
      if (maxWrite <= 0) {
        return 0;
      }

      long originalPointer = -1;
      if (positionArg != Undefined.instance && positionArg != null) {
        long position = (long) ScriptRuntime.toInteger(positionArg);
        if (position >= 0) {
          originalPointer = of.raf.getFilePointer();
          of.raf.seek(position);
        }
      }

      of.raf.write(br.array, srcOffset, maxWrite);

      if (originalPointer >= 0) {
        of.raf.seek(originalPointer);
      }

      return maxWrite;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error writing file descriptor " + fd + ": " + e.getMessage());
    }
  }

  private static Object writeBuffers(Context cx, VarScope s, Object to, Object[] args) {
    throw ScriptRuntime.typeError("writeBuffers not implemented");
  }

  private static Object writeString(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(6, args);
    int fd = ScriptRuntime.toInt32(args[0]);
    String data = ScriptRuntime.toString(args[1]);
    Object positionArg = args[2];
    String encoding =
        (args[3] != Undefined.instance && args[3] != null)
            ? ScriptRuntime.toString(args[3])
            : "utf8";

    OpenFile of = openFiles.get(fd);
    if (of == null) {
      throw ScriptRuntime.constructError("Error", "EBADF: bad file descriptor, write");
    }

    try {
      java.nio.charset.Charset charset = StandardCharsets.UTF_8;
      if (encoding.equalsIgnoreCase("ascii") || encoding.equalsIgnoreCase("us-ascii")) {
        charset = StandardCharsets.US_ASCII;
      } else if (encoding.equalsIgnoreCase("latin1") || encoding.equalsIgnoreCase("iso-8859-1")) {
        charset = StandardCharsets.ISO_8859_1;
      } else if (encoding.equalsIgnoreCase("utf16le") || encoding.equalsIgnoreCase("ucs2")) {
        charset = StandardCharsets.UTF_16LE;
      }

      byte[] bytes = data.getBytes(charset);

      long originalPointer = -1;
      if (positionArg != Undefined.instance && positionArg != null) {
        long position = (long) ScriptRuntime.toInteger(positionArg);
        if (position >= 0) {
          originalPointer = of.raf.getFilePointer();
          of.raf.seek(position);
        }
      }

      of.raf.write(bytes);

      if (originalPointer >= 0) {
        of.raf.seek(originalPointer);
      }

      return bytes.length;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error writing string to file descriptor " + fd + ": " + e.getMessage());
    }
  }

  private static Object writeFileUtf8(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(4, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    String data = ScriptRuntime.toString(args[1]);
    int flags = ScriptRuntime.toInt32(args[2]);
    int mode = ScriptRuntime.toInt32(args[3]);

    try {
      Path path = Path.of(pathStr).toAbsolutePath();
      boolean exists = Files.exists(path);

      boolean isCreate = (flags & NodeConstants.Fs.O_CREAT) != 0;
      boolean isExcl = (flags & NodeConstants.Fs.O_EXCL) != 0;
      boolean isAppend = (flags & NodeConstants.Fs.O_APPEND) != 0;

      if (exists) {
        if (isCreate && isExcl) {
          throw ScriptRuntime.constructError(
              "Error", "EEXIST: file already exists, open '" + pathStr + "'");
        }
      } else {
        if (!isCreate) {
          throw ScriptRuntime.constructError(
              "Error", "ENOENT: no such file or directory, open '" + pathStr + "'");
        }
        Path parent = path.getParent();
        if (parent != null && !Files.exists(parent)) {
          Files.createDirectories(parent);
        }
      }

      byte[] bytes = data.getBytes(StandardCharsets.UTF_8);
      if (isAppend) {
        Files.write(
            path,
            bytes,
            java.nio.file.StandardOpenOption.CREATE,
            java.nio.file.StandardOpenOption.APPEND);
      } else {
        Files.write(
            path,
            bytes,
            java.nio.file.StandardOpenOption.CREATE,
            java.nio.file.StandardOpenOption.TRUNCATE_EXISTING,
            java.nio.file.StandardOpenOption.WRITE);
      }
      return Undefined.instance;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error writing file " + pathStr + ": " + e.getMessage());
    }
  }

  private static Object realpath(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    try {
      return Path.of(pathStr).toRealPath().toString();
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error resolving real path for " + pathStr + ": " + e.getMessage());
    }
  }

  private static Object mkdir(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(3, args);
    String pathStr = ScriptRuntime.toString(args[0]);
    int mode = ScriptRuntime.toInt32(args[1]);
    boolean recursive = ScriptRuntime.toBoolean(args[2]);

    try {
      Path path = Path.of(pathStr);
      if (recursive) {
        Files.createDirectories(path);
      } else {
        Files.createDirectory(path);
      }
      return Undefined.instance;
    } catch (IOException e) {
      throw ScriptRuntime.constructError(
          "Error", "Error creating directory " + pathStr + ": " + e.getMessage());
    }
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
