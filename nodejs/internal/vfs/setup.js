'use strict';

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
var {
  ArrayPrototypeIndexOf,
  ArrayPrototypePush,
  ArrayPrototypeSplice,
  PromiseResolve,
  StringPrototypeStartsWith
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  resolve,
  sep
} = require('path');
var {
  fileURLToPath,
  URL
} = require('internal/url');
var {
  kEmptyObject
} = require('internal/util');
var {
  validateObject
} = require('internal/validators');
var {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_STATE
  }
} = require('internal/errors');
var {
  createENOENT,
  createEXDEV
} = require('internal/vfs/errors');
var {
  getVirtualFd,
  closeVirtualFd
} = require('internal/vfs/fd');
var {
  assertEncoding,
  vfsState,
  setVfsHandlers
} = require('internal/fs/utils');
var permission = require('internal/process/permission');
var {
  getOptionValue
} = require('internal/options');
var debug = require('internal/util/debuglog').debuglog('vfs', fn => {
  debug = fn;
});
function toPathStr(pathOrUrl) {
  if (typeof pathOrUrl === 'string') return pathOrUrl;
  if (pathOrUrl instanceof URL) return fileURLToPath(pathOrUrl);
  if (Buffer.isBuffer(pathOrUrl)) return pathOrUrl.toString();
  return null;
}
function noopFdSync(fd) {
  if (getVirtualFd(fd)) return true;
  return undefined;
}
var noopFdPromise = PromiseResolve(true);
function noopFd(fd) {
  if (getVirtualFd(fd)) return noopFdPromise;
  return undefined;
}

// Registry of active VFS instances.
var activeVFSList = [];
var hooksInstalled = false;
var vfsHandlerObj;
function registerVFS(vfs) {
  if (permission.isEnabled() && !getOptionValue('--allow-fs-vfs')) {
    throw new ERR_INVALID_STATE('VFS cannot be used when the permission model is enabled. ' + 'Use --allow-fs-vfs to allow it.');
  }
  if (ArrayPrototypeIndexOf(activeVFSList, vfs) !== -1) return;
  var newMount = vfs.mountPoint;
  if (newMount != null) {
    for (var i = 0; i < activeVFSList.length; i++) {
      var existingMount = activeVFSList[i].mountPoint;
      if (existingMount == null) continue;
      // Use path.sep so the trailing-separator guard works on Windows where
      // mountPoint values are resolved to drive-letter / backslash paths.
      var newPrefix = newMount === sep ? sep : newMount + sep;
      var existingPrefix = existingMount === sep ? sep : existingMount + sep;
      if (newMount === existingMount || StringPrototypeStartsWith(newMount, existingPrefix) || StringPrototypeStartsWith(existingMount, newPrefix)) {
        throw new ERR_INVALID_STATE(`VFS mount '${newMount}' overlaps with existing mount '${existingMount}'`);
      }
    }
  }
  ArrayPrototypePush(activeVFSList, vfs);
  debug('register mount=%s active=%d', newMount, activeVFSList.length);
  if (!hooksInstalled) {
    vfsHandlerObj = createVfsHandlers();
    setVfsHandlers(vfsHandlerObj);
    hooksInstalled = true;
  } else if (vfsState.handlers === null) {
    setVfsHandlers(vfsHandlerObj);
  }
}
function deregisterVFS(vfs) {
  var index = ArrayPrototypeIndexOf(activeVFSList, vfs);
  if (index === -1) return;
  ArrayPrototypeSplice(activeVFSList, index, 1);
  debug('deregister active=%d', activeVFSList.length);
  if (activeVFSList.length === 0) {
    setVfsHandlers(null);
  }
}
function findVFSForExists(filename) {
  var normalized = resolve(filename);
  for (var i = 0; i < activeVFSList.length; i++) {
    var vfs = activeVFSList[i];
    if (vfs.shouldHandle(normalized)) {
      return {
        vfs,
        exists: vfs.existsSync(normalized)
      };
    }
  }
  return null;
}
function findVFSForPath(filename) {
  var normalized = resolve(filename);
  for (var i = 0; i < activeVFSList.length; i++) {
    var vfs = activeVFSList[i];
    if (vfs.shouldHandle(normalized)) {
      return {
        vfs,
        normalized
      };
    }
  }
  return null;
}

// Sync read: check exists first, fall through to ENOENT for mounted VFS.
function findVFSWith(filename, syscall, fn) {
  var normalized = resolve(filename);
  for (var i = 0; i < activeVFSList.length; i++) {
    var vfs = activeVFSList[i];
    if (vfs.shouldHandle(normalized)) {
      if (vfs.existsSync(normalized)) {
        return fn(vfs, normalized);
      }
      throw createENOENT(syscall, filename);
    }
  }
  return undefined;
}
function vfsRead(path, syscall, fn) {
  var pathStr = toPathStr(path);
  if (pathStr === null) return undefined;
  return findVFSWith(pathStr, syscall, fn);
}
function vfsOp(path, fn) {
  var pathStr = toPathStr(path);
  if (pathStr !== null) {
    var r = findVFSForPath(pathStr);
    if (r !== null) return fn(r.vfs, r.normalized);
  }
  return undefined;
}
function vfsOpVoid(path, fn) {
  var pathStr = toPathStr(path);
  if (pathStr !== null) {
    var r = findVFSForPath(pathStr);
    if (r !== null) {
      fn(r.vfs, r.normalized);
      return true;
    }
  }
  return undefined;
}
function checkSameVFS(srcPath, destPath, syscall, srcVfs) {
  var destNormalized = resolve(destPath);
  for (var i = 0; i < activeVFSList.length; i++) {
    var vfs = activeVFSList[i];
    if (vfs.shouldHandle(destNormalized)) {
      if (vfs !== srcVfs) {
        throw createEXDEV(syscall, srcPath);
      }
      return;
    }
  }
  throw createEXDEV(syscall, srcPath);
}
function createVfsHandlers() {
  return {
    __proto__: null,
    // ==================== Sync path-based read ops ====================

    existsSync(path) {
      var pathStr = toPathStr(path);
      if (pathStr === null) return undefined;
      var r = findVFSForExists(pathStr);
      return r !== null ? r.exists : undefined;
    },
    readFileSync(path, options) {
      if (typeof path === 'number') {
        var vfd = getVirtualFd(path);
        if (vfd) {
          var _enc = typeof options === 'string' ? options : options?.encoding;
          if (_enc && _enc !== 'buffer') assertEncoding(_enc);
          return vfd.entry.readFileSync(options);
        }
        return undefined;
      }
      var pathStr = toPathStr(path);
      if (pathStr === null) return undefined;
      var enc = typeof options === 'string' ? options : options?.encoding;
      if (enc && enc !== 'buffer') assertEncoding(enc);
      return findVFSWith(pathStr, 'open', (vfs, n) => vfs.readFileSync(n, options));
    },
    readdirSync(path, options) {
      var result = vfsRead(path, 'scandir', (vfs, n) => vfs.readdirSync(n, options));
      if (result !== undefined && options?.encoding === 'buffer' && !options?.withFileTypes) {
        for (var i = 0; i < result.length; i++) {
          if (typeof result[i] === 'string') result[i] = Buffer.from(result[i]);
        }
      }
      return result;
    },
    lstatSync(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr === null) return undefined;
      var normalized = resolve(pathStr);
      for (var i = 0; i < activeVFSList.length; i++) {
        var vfs = activeVFSList[i];
        if (vfs.shouldHandle(normalized)) {
          try {
            return vfs.lstatSync(normalized, options);
          } catch (e) {
            if (e?.code === 'ENOENT' && options?.throwIfNoEntry === false) return undefined;
            throw e;
          }
        }
      }
      return undefined;
    },
    statSync(path, options) {
      try {
        return vfsRead(path, 'stat', (vfs, n) => vfs.statSync(n, options));
      } catch (err) {
        if (err?.code === 'ENOENT' && options?.throwIfNoEntry === false) return undefined;
        throw err;
      }
    },
    realpathSync(path, options) {
      var result = vfsRead(path, 'realpath', (vfs, n) => vfs.realpathSync(n));
      if (result !== undefined && options?.encoding === 'buffer') {
        return Buffer.from(result);
      }
      return result;
    },
    accessSync(path, mode) {
      var pathStr = toPathStr(path);
      if (pathStr !== null) {
        var r = findVFSForPath(pathStr);
        if (r !== null) {
          if (mode != null && typeof mode !== 'number') {
            throw new ERR_INVALID_ARG_TYPE('mode', 'integer', mode);
          }
          r.vfs.accessSync(r.normalized, mode);
          return true;
        }
      }
      return undefined;
    },
    readlinkSync(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr === null) return undefined;
      var normalized = resolve(pathStr);
      for (var i = 0; i < activeVFSList.length; i++) {
        var vfs = activeVFSList[i];
        if (vfs.shouldHandle(normalized)) {
          var result = vfs.readlinkSync(normalized, options);
          if (options?.encoding === 'buffer') return Buffer.from(result);
          return result;
        }
      }
      return undefined;
    },
    statfsSync(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr !== null && findVFSForPath(pathStr) !== null) {
        if (options?.bigint) {
          return {
            type: 0n,
            bsize: 4096n,
            blocks: 0n,
            bfree: 0n,
            bavail: 0n,
            files: 0n,
            ffree: 0n
          };
        }
        return {
          type: 0,
          bsize: 4096,
          blocks: 0,
          bfree: 0,
          bavail: 0,
          files: 0,
          ffree: 0
        };
      }
      return undefined;
    },
    // ==================== Sync path-based write ops ====================

    writeFileSync: (path, data, options) => vfsOpVoid(path, (vfs, n) => vfs.writeFileSync(n, data, options)),
    appendFileSync: (path, data, options) => vfsOpVoid(path, (vfs, n) => vfs.appendFileSync(n, data, options)),
    mkdirSync: (path, options) => vfsOp(path, (vfs, n) => ({
      result: vfs.mkdirSync(n, options)
    })),
    rmdirSync: path => vfsOpVoid(path, (vfs, n) => vfs.rmdirSync(n)),
    rmSync: (path, options) => vfsOpVoid(path, (vfs, n) => vfs.rmSync(n, options)),
    unlinkSync: path => vfsOpVoid(path, (vfs, n) => vfs.unlinkSync(n)),
    renameSync(oldPath, newPath) {
      return vfsOpVoid(oldPath, (vfs, n) => {
        checkSameVFS(n, toPathStr(newPath), 'rename', vfs);
        vfs.renameSync(n, resolve(toPathStr(newPath)));
      });
    },
    copyFileSync(src, dest, mode) {
      return vfsOpVoid(src, (vfs, n) => {
        checkSameVFS(n, toPathStr(dest), 'copyfile', vfs);
        vfs.copyFileSync(n, resolve(toPathStr(dest)), mode);
      });
    },
    symlinkSync: (target, path, type) => vfsOpVoid(path, (vfs, n) => vfs.symlinkSync(target, n, type)),
    chmodSync: (path, mode) => vfsOpVoid(path, (vfs, n) => vfs.chmodSync(n, mode)),
    chownSync: (path, uid, gid) => vfsOpVoid(path, (vfs, n) => vfs.chownSync(n, uid, gid)),
    lchownSync: (path, uid, gid) => vfsOpVoid(path, (vfs, n) => vfs.chownSync(n, uid, gid)),
    utimesSync: (path, atime, mtime) => vfsOpVoid(path, (vfs, n) => vfs.utimesSync(n, atime, mtime)),
    lutimesSync: (path, atime, mtime) => vfsOpVoid(path, (vfs, n) => vfs.lutimesSync(n, atime, mtime)),
    truncateSync: (path, len) => vfsOpVoid(path, (vfs, n) => vfs.truncateSync(n, len)),
    linkSync(existingPath, newPath) {
      return vfsOpVoid(existingPath, (vfs, n) => {
        checkSameVFS(n, toPathStr(newPath), 'link', vfs);
        vfs.linkSync(n, resolve(toPathStr(newPath)));
      });
    },
    mkdtempSync(prefix, options) {
      var result = vfsOp(prefix, (vfs, n) => vfs.mkdtempSync(n));
      if (result !== undefined && options?.encoding === 'buffer') {
        return Buffer.from(result);
      }
      return result;
    },
    opendirSync: (path, options) => vfsOp(path, (vfs, n) => vfs.opendirSync(n, options)),
    openAsBlob(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr !== null) {
        var normalized = resolve(pathStr);
        for (var i = 0; i < activeVFSList.length; i++) {
          var vfs = activeVFSList[i];
          if (vfs.shouldHandle(normalized) && vfs.existsSync(normalized)) {
            return vfs.openAsBlob(normalized, options);
          }
        }
      }
      return undefined;
    },
    // ==================== Sync FD-based ops ====================

    openSync: (path, flags, mode) => vfsOp(path, (vfs, n) => vfs.openSync(n, flags, mode)),
    closeSync(fd) {
      var vfd = getVirtualFd(fd);
      if (vfd) {
        vfd.entry.closeSync();
        closeVirtualFd(fd);
        return true;
      }
      return undefined;
    },
    readSync(fd, buffer, offset, length, position) {
      var vfd = getVirtualFd(fd);
      if (vfd) return vfd.entry.readSync(buffer, offset, length, position);
      return undefined;
    },
    writeSync(fd, buffer, offset, length, position) {
      var vfd = getVirtualFd(fd);
      if (vfd) return vfd.entry.writeSync(buffer, offset, length, position);
      return undefined;
    },
    fstatSync(fd, options) {
      var vfd = getVirtualFd(fd);
      if (vfd) return vfd.entry.statSync(options);
      return undefined;
    },
    ftruncateSync(fd, len) {
      var vfd = getVirtualFd(fd);
      if (vfd) {
        vfd.entry.truncateSync(len);
        return true;
      }
      return undefined;
    },
    fchmodSync: noopFdSync,
    fchownSync: noopFdSync,
    futimesSync: noopFdSync,
    fdatasyncSync: noopFdSync,
    fsyncSync: noopFdSync,
    readvSync(fd, buffers, position) {
      var vfd = getVirtualFd(fd);
      if (!vfd) return undefined;
      var totalRead = 0;
      for (var i = 0; i < buffers.length; i++) {
        var buf = buffers[i];
        var pos = position != null ? position + totalRead : position;
        var bytesRead = vfd.entry.readSync(buf, 0, buf.byteLength, pos);
        totalRead += bytesRead;
        if (bytesRead < buf.byteLength) break;
      }
      return totalRead;
    },
    writevSync(fd, buffers, position) {
      var vfd = getVirtualFd(fd);
      if (!vfd) return undefined;
      var totalWritten = 0;
      for (var i = 0; i < buffers.length; i++) {
        var buf = buffers[i];
        var pos = position != null ? position + totalWritten : position;
        var bytesWritten = vfd.entry.writeSync(buf, 0, buf.byteLength, pos);
        totalWritten += bytesWritten;
        if (bytesWritten < buf.byteLength) break;
      }
      return totalWritten;
    },
    // ==================== Async FD-based ops ====================

    close(fd) {
      var vfd = getVirtualFd(fd);
      if (!vfd) return undefined;
      return vfd.entry.close().then(() => {
        closeVirtualFd(fd);
        return true;
      });
    },
    read(fd, buffer, offset, length, position) {
      var vfd = getVirtualFd(fd);
      if (!vfd) return undefined;
      return vfd.entry.read(buffer, offset, length, position).then(_ref => {
        var {
          bytesRead
        } = _ref;
        return bytesRead;
      });
    },
    write(fd, buffer, offset, length, position) {
      var vfd = getVirtualFd(fd);
      if (!vfd) return undefined;
      return vfd.entry.write(buffer, offset, length, position).then(_ref2 => {
        var {
          bytesWritten
        } = _ref2;
        return bytesWritten;
      });
    },
    fstat(fd, options) {
      var vfd = getVirtualFd(fd);
      if (!vfd) return undefined;
      return vfd.entry.stat(options);
    },
    ftruncate(fd, len) {
      var vfd = getVirtualFd(fd);
      if (!vfd) return undefined;
      return vfd.entry.truncate(len).then(() => true);
    },
    fchmod: noopFd,
    fchown: noopFd,
    futimes: noopFd,
    fdatasync: noopFd,
    fsync: noopFd,
    // ==================== Stream ops ====================

    createReadStream(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr !== null) {
        var r = findVFSForPath(pathStr);
        if (r !== null) return r.vfs.createReadStream(r.normalized, options);
      }
      return undefined;
    },
    createWriteStream(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr !== null) {
        var r = findVFSForPath(pathStr);
        if (r !== null) return r.vfs.createWriteStream(r.normalized, options);
      }
      return undefined;
    },
    // ==================== Watch ops ====================

    watch(filename, options, listener) {
      if (typeof options === 'function') {
        listener = options;
        options = kEmptyObject;
      } else if (options != null) {
        validateObject(options, 'options');
      } else {
        options = kEmptyObject;
      }
      var pathStr = toPathStr(filename);
      if (pathStr !== null) {
        var r = findVFSForPath(pathStr);
        if (r !== null) return r.vfs.watch(pathStr, options, listener);
      }
      return undefined;
    },
    // ==================== Async path-based ops ====================

    readdir(path, options) {
      var promise = vfsOp(path, (vfs, n) => vfs.promises.readdir(n, options));
      if (promise !== undefined && options?.encoding === 'buffer' && !options?.withFileTypes) {
        return promise.then(result => {
          for (var i = 0; i < result.length; i++) {
            if (typeof result[i] === 'string') result[i] = Buffer.from(result[i]);
          }
          return result;
        });
      }
      return promise;
    },
    lstat(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr === null) return undefined;
      var normalized = resolve(pathStr);
      for (var i = 0; i < activeVFSList.length; i++) {
        var vfs = activeVFSList[i];
        if (vfs.shouldHandle(normalized)) {
          return vfs.promises.lstat(normalized, options);
        }
      }
      return undefined;
    },
    stat(path, options) {
      var promise = vfsOp(path, (vfs, n) => vfs.promises.stat(n, options));
      if (promise !== undefined && options?.throwIfNoEntry === false) {
        return promise.catch(err => {
          if (err?.code === 'ENOENT') return undefined;
          throw err;
        });
      }
      return promise;
    },
    readFile(path, options) {
      if (typeof path === 'number') {
        var vfd = getVirtualFd(path);
        if (vfd) {
          var _enc2 = typeof options === 'string' ? options : options?.encoding;
          if (_enc2 && _enc2 !== 'buffer') assertEncoding(_enc2);
          return vfd.entry.readFile(options);
        }
        return undefined;
      }
      var enc = typeof options === 'string' ? options : options?.encoding;
      if (enc && enc !== 'buffer') assertEncoding(enc);
      return vfsOp(path, (vfs, n) => vfs.promises.readFile(n, options));
    },
    realpath(path, options) {
      var promise = vfsOp(path, (vfs, n) => vfs.promises.realpath(n, options));
      if (promise !== undefined && options?.encoding === 'buffer') {
        return promise.then(result => Buffer.from(result));
      }
      return promise;
    },
    access(path, mode) {
      return vfsOp(path, (vfs, n) => {
        if (mode != null && typeof mode !== 'number') {
          throw new ERR_INVALID_ARG_TYPE('mode', 'integer', mode);
        }
        return vfs.promises.access(n, mode).then(() => true);
      });
    },
    readlink(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr === null) return undefined;
      var normalized = resolve(pathStr);
      for (var i = 0; i < activeVFSList.length; i++) {
        var vfs = activeVFSList[i];
        if (vfs.shouldHandle(normalized)) {
          var promise = vfs.promises.readlink(normalized, options);
          if (options?.encoding === 'buffer') {
            return promise.then(result => Buffer.from(result));
          }
          return promise;
        }
      }
      return undefined;
    },
    chown: (path, uid, gid) => vfsOp(path, (vfs, n) => vfs.promises.chown(n, uid, gid).then(() => true)),
    lchown: (path, uid, gid) => vfsOp(path, (vfs, n) => vfs.promises.lchown(n, uid, gid).then(() => true)),
    lutimes: (path, atime, mtime) => vfsOp(path, (vfs, n) => vfs.promises.lutimes(n, atime, mtime).then(() => true)),
    statfs(path, options) {
      var pathStr = toPathStr(path);
      if (pathStr !== null && findVFSForPath(pathStr) !== null) {
        if (options?.bigint) {
          return {
            __proto__: null,
            type: 0n,
            bsize: 4096n,
            blocks: 0n,
            bfree: 0n,
            bavail: 0n,
            files: 0n,
            ffree: 0n
          };
        }
        return {
          __proto__: null,
          type: 0,
          bsize: 4096,
          blocks: 0,
          bfree: 0,
          bavail: 0,
          files: 0,
          ffree: 0
        };
      }
      return undefined;
    },
    writeFile(path, data, options) {
      return vfsOp(path, (vfs, n) => vfs.promises.writeFile(n, data, options).then(() => true));
    },
    appendFile(path, data, options) {
      return vfsOp(path, (vfs, n) => vfs.promises.appendFile(n, data, options).then(() => true));
    },
    mkdir(path, options) {
      return vfsOp(path, (vfs, n) => vfs.promises.mkdir(n, options).then(result => ({
        __proto__: null,
        result
      })));
    },
    rmdir: path => vfsOp(path, (vfs, n) => vfs.promises.rmdir(n).then(() => true)),
    rm: (path, options) => vfsOp(path, (vfs, n) => vfs.promises.rm(n, options).then(() => true)),
    unlink: path => vfsOp(path, (vfs, n) => vfs.promises.unlink(n).then(() => true)),
    rename(oldPath, newPath) {
      return vfsOp(oldPath, (vfs, n) => {
        checkSameVFS(n, toPathStr(newPath), 'rename', vfs);
        return vfs.promises.rename(n, resolve(toPathStr(newPath))).then(() => true);
      });
    },
    copyFile(src, dest, mode) {
      return vfsOp(src, (vfs, n) => {
        checkSameVFS(n, toPathStr(dest), 'copyfile', vfs);
        return vfs.promises.copyFile(n, resolve(toPathStr(dest)), mode).then(() => true);
      });
    },
    symlink(target, path, type) {
      return vfsOp(path, (vfs, n) => vfs.promises.symlink(target, n, type).then(() => true));
    },
    truncate: (path, len) => vfsOp(path, (vfs, n) => vfs.promises.truncate(n, len).then(() => true)),
    link(existingPath, newPath) {
      return vfsOp(existingPath, (vfs, n) => {
        checkSameVFS(n, toPathStr(newPath), 'link', vfs);
        return vfs.promises.link(n, resolve(toPathStr(newPath))).then(() => true);
      });
    },
    mkdtemp(prefix, options) {
      var promise = vfsOp(prefix, (vfs, n) => vfs.promises.mkdtemp(n));
      if (promise !== undefined && options?.encoding === 'buffer') {
        return promise.then(result => Buffer.from(result));
      }
      return promise;
    },
    chmod: (path, mode) => vfsOp(path, (vfs, n) => vfs.promises.chmod(n, mode).then(() => true)),
    utimes: (path, atime, mtime) => vfsOp(path, (vfs, n) => vfs.promises.utimes(n, atime, mtime).then(() => true)),
    open(path, flags, mode) {
      // openSync is synchronous, so an error thrown by the provider would
      // escape via fs.open's caller (instead of going through the callback).
      // Catch it here and surface as a rejected promise.
      return vfsOp(path, _async(function (vfs, n) {
        return vfs.openSync(n, flags, mode);
      }));
    },
    promisesOpen(path, flags, mode) {
      var pathStr = toPathStr(path);
      if (pathStr !== null) {
        var r = findVFSForPath(pathStr);
        if (r !== null) {
          var fd = r.vfs.openSync(r.normalized, flags, mode);
          var vfd = getVirtualFd(fd);
          return PromiseResolve(vfd.entry);
        }
      }
      return undefined;
    },
    lchmod: (path, mode) => vfsOp(path, (vfs, n) => vfs.promises.lchmod(n, mode).then(() => true))
  };
}
module.exports = {
  registerVFS,
  deregisterVFS
};

