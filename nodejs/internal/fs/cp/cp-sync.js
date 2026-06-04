'use strict';

// This file is a modified version of the fs-extra's copySync method.
var fsBinding = internalBinding('fs');
var {
  isSrcSubdir
} = require('internal/fs/cp/cp');
var {
  codes: {
    ERR_FS_CP_EEXIST,
    ERR_FS_CP_EINVAL,
    ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY,
    ERR_INVALID_RETURN_VALUE
  }
} = require('internal/errors');
var {
  os: {
    errno: {
      EEXIST,
      EINVAL
    }
  }
} = internalBinding('constants');
var {
  chmodSync,
  copyFileSync,
  lstatSync,
  mkdirSync,
  opendirSync,
  readlinkSync,
  statSync,
  symlinkSync,
  unlinkSync,
  utimesSync
} = require('fs');
var {
  dirname,
  isAbsolute,
  join,
  resolve
} = require('path');
var {
  isPromise
} = require('util/types');
function cpSyncFn(src, dest, opts) {
  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    var warning = 'Using the preserveTimestamps option in 32-bit ' + 'node is not recommended';
    process.emitWarning(warning, 'TimestampPrecisionWarning');
  }
  if (opts.filter) {
    var shouldCopy = opts.filter(src, dest);
    if (isPromise(shouldCopy)) {
      throw new ERR_INVALID_RETURN_VALUE('boolean', 'filter', shouldCopy);
    }
    if (!shouldCopy) return;
  }
  fsBinding.cpSyncCheckPaths(src, dest, opts.dereference, opts.recursive);
  return getStats(src, dest, opts);
}
function getStats(src, dest, opts) {
  // TODO(@anonrig): Avoid making two stat calls.
  var statSyncFn = opts.dereference ? statSync : lstatSync;
  var srcStat = statSyncFn(src);
  var destStat = statSyncFn(dest, {
    bigint: true,
    throwIfNoEntry: false
  });
  if (srcStat.isDirectory() && opts.recursive) {
    return onDir(srcStat, destStat, src, dest, opts);
  } else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) {
    return onFile(srcStat, destStat, src, dest, opts);
  } else if (srcStat.isSymbolicLink()) {
    return onLink(destStat, src, dest, opts.verbatimSymlinks);
  }

  // It is not possible to get here because all possible cases are handled above.
  var assert = require('internal/assert');
  assert.fail('Unreachable code');
}
function onFile(srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts);
  if (opts.force) {
    return fsBinding.cpSyncOverrideFile(src, dest, opts.mode, opts.preserveTimestamps);
  }
  if (opts.errorOnExist) {
    throw new ERR_FS_CP_EEXIST({
      message: `${dest} already exists`,
      path: dest,
      syscall: 'cp',
      errno: EEXIST,
      code: 'EEXIST'
    });
  }
}
function copyFile(srcStat, src, dest, opts) {
  copyFileSync(src, dest, opts.mode);
  if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src, dest);
  return setDestMode(dest, srcStat.mode);
}
function handleTimestamps(srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode);
  return setDestTimestamps(src, dest);
}
function fileIsNotWritable(srcMode) {
  return (srcMode & 0o200) === 0;
}
function makeFileWritable(dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200);
}
function setDestMode(dest, srcMode) {
  return chmodSync(dest, srcMode);
}
function setDestTimestamps(src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  var updatedSrcStat = statSync(src);
  return utimesSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
}

// TODO(@anonrig): Move this function to C++.
function onDir(srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyDir(src, dest, opts, true, srcStat.mode);
  return copyDir(src, dest, opts);
}
function copyDir(src, dest, opts, mkDir, srcMode) {
  if (!opts.filter) {
    // The caller didn't provide a js filter function, in this case
    // we can run the whole function faster in C++
    // TODO(dario-piotrowicz): look into making cpSyncCopyDir also accept the potential filter function
    return fsBinding.cpSyncCopyDir(src, dest, opts.force, opts.dereference, opts.errorOnExist, opts.verbatimSymlinks, opts.preserveTimestamps);
  }
  if (mkDir) {
    mkdirSync(dest);
  }
  var dir = opendirSync(src);
  try {
    var dirent;
    while ((dirent = dir.readSync()) !== null) {
      var {
        name
      } = dirent;
      var srcItem = join(src, name);
      var destItem = join(dest, name);
      var shouldCopy = true;
      if (opts.filter) {
        shouldCopy = opts.filter(srcItem, destItem);
        if (isPromise(shouldCopy)) {
          throw new ERR_INVALID_RETURN_VALUE('boolean', 'filter', shouldCopy);
        }
      }
      if (shouldCopy) {
        getStats(srcItem, destItem, opts);
      }
    }
  } finally {
    dir.closeSync();
    if (srcMode !== undefined) {
      setDestMode(dest, srcMode);
    }
  }
}

// TODO(@anonrig): Move this function to C++.
function onLink(destStat, src, dest, verbatimSymlinks) {
  var resolvedSrc = readlinkSync(src);
  if (!verbatimSymlinks && !isAbsolute(resolvedSrc)) {
    resolvedSrc = resolve(dirname(src), resolvedSrc);
  }
  if (!destStat) {
    return symlinkSync(resolvedSrc, dest);
  }
  var resolvedDest;
  try {
    resolvedDest = readlinkSync(dest);
  } catch (err) {
    // Dest exists and is a regular file or directory,
    // Windows may throw UNKNOWN error. If dest already exists,
    // fs throws error anyway, so no need to guard against it here.
    if (err.code === 'EINVAL' || err.code === 'UNKNOWN') {
      return symlinkSync(resolvedSrc, dest);
    }
    throw err;
  }
  if (!isAbsolute(resolvedDest)) {
    resolvedDest = resolve(dirname(dest), resolvedDest);
  }
  var srcIsDir = fsBinding.internalModuleStat(src) === 1;
  if (srcIsDir && isSrcSubdir(resolvedSrc, resolvedDest)) {
    throw new ERR_FS_CP_EINVAL({
      message: `cannot copy ${resolvedSrc} to a subdirectory of self ` + `${resolvedDest}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
      code: 'EINVAL'
    });
  }
  // Prevent copy if src is a subdir of dest since unlinking
  // dest in this case would result in removing src contents
  // and therefore a broken symlink would be created.
  if (statSync(dest).isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
    throw new ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY({
      message: `cannot overwrite ${resolvedDest} with ${resolvedSrc}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
      code: 'EINVAL'
    });
  }
  return copyLink(resolvedSrc, dest);
}
function copyLink(resolvedSrc, dest) {
  unlinkSync(dest);
  return symlinkSync(resolvedSrc, dest);
}
module.exports = {
  cpSyncFn
};

