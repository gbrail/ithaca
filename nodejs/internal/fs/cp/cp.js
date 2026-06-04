'use strict';

// This file is a modified version of the fs-extra's copy method.
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var copyLink = _async(function (resolvedSrc, dest) {
  return _await(unlink(dest), function () {
    return symlink(resolvedSrc, dest);
  });
});
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
var onLink = _async(function (destStat, src, dest, opts) {
  return _await(readlink(src), function (resolvedSrc) {
    var _exit3 = false;
    if (!opts.verbatimSymlinks && !isAbsolute(resolvedSrc)) {
      resolvedSrc = resolve(dirname(src), resolvedSrc);
    }
    if (!destStat) {
      return symlink(resolvedSrc, dest);
    }
    var resolvedDest;
    return _continue(_catch(function () {
      return _await(readlink(dest), function (_readlink) {
        resolvedDest = _readlink;
      });
    }, function (err) {
      // Dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') {
        var _symlink = symlink(resolvedSrc, dest);
        _exit3 = true;
        return _symlink;
      }
      throw err;
    }), function (_result3) {
      if (_exit3) return _result3;
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
      // Do not copy if src is a subdir of dest since unlinking
      // dest in this case would result in removing src contents
      // and therefore a broken symlink would be created.
      return _await(stat(src), function (srcStat) {
        if (srcStat.isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
          throw new ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY({
            message: `cannot overwrite ${resolvedDest} with ${resolvedSrc}`,
            path: dest,
            syscall: 'cp',
            errno: EINVAL,
            code: 'EINVAL'
          });
        }
        return copyLink(resolvedSrc, dest);
      });
    });
  });
});
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
var copyDir = _async(function (src, dest, opts) {
  return _await(opendir(src), function (dir) {
    return _continueIgnored(_forAwaitOf(dir, function (_ref2) {
      var {
        name
      } = _ref2;
      var srcItem = join(src, name);
      var destItem = join(dest, name);
      return _await(checkPaths(srcItem, destItem, opts), function (_ref3) {
        var {
          destStat,
          skipped
        } = _ref3;
        return _invokeIgnored(function () {
          if (!skipped) return _awaitIgnored(getStatsForCopy(destStat, srcItem, destItem, opts));
        });
      });
    }));
  });
});
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
var mkDirAndCopy = _async(function (srcMode, src, dest, opts) {
  return _await(mkdir(dest), function () {
    return _await(copyDir(src, dest, opts), function () {
      return setDestMode(dest, srcMode);
    });
  });
});
function _empty() {}
var onDir = _async(function (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts);
  if (opts.errorOnExist && !opts.force) {
    throw new ERR_FS_CP_EEXIST({
      message: `${dest} already exists`,
      path: dest,
      syscall: 'cp',
      errno: EEXIST,
      code: 'EEXIST'
    });
  }
  return copyDir(src, dest, opts);
});
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
var setDestTimestamps = _async(function (src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  return _await(stat(src), function (updatedSrcStat) {
    return utimes(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
  });
});
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var setDestTimestampsAndMode = function (srcMode, src, dest) {
  return _await(setDestTimestamps(src, dest), function () {
    return setDestMode(dest, srcMode);
  });
};
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
var handleTimestampsAndMode = _async(function (srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  return _invoke(function () {
    if (fileIsNotWritable(srcMode)) {
      return _awaitIgnored(makeFileWritable(dest, srcMode));
    }
  }, function () {
    return setDestTimestampsAndMode(srcMode, src, dest);
  });
});
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator")) : "@@asyncIterator";
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
var _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      var result = new _Pact();
      var state = this.s;
      if (state) {
        var callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          var value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }(),
  _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _forTo(array, body, check) {
  var i = -1,
    pact,
    reject;
  function _cycle(result) {
    try {
      while (++i < array.length && (!check || !check())) {
        result = body(i);
        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
            return;
          }
        }
      }
      if (pact) {
        _settle(pact, 1, result);
      } else {
        pact = result;
      }
    } catch (e) {
      _settle(pact || (pact = new _Pact()), 2, e);
    }
  }
  _cycle();
  return pact;
}
var _copyFile = _async(function (srcStat, src, dest, opts) {
  return _await(copyFile(src, dest, opts.mode), function () {
    return opts.preserveTimestamps ? handleTimestampsAndMode(srcStat.mode, src, dest) : setDestMode(dest, srcStat.mode);
  });
});
function _forOf(target, body, check) {
  if (typeof target[_iteratorSymbol] === "function") {
    var iterator = target[_iteratorSymbol](),
      step,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (!(step = iterator.next()).done && (!check || !check())) {
          result = body(step.value);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    if (iterator.return) {
      var _fixup = function (value) {
        try {
          if (!step.done) {
            iterator.return();
          }
        } catch (e) {}
        return value;
      };
      if (pact && pact.then) {
        return pact.then(_fixup, function (e) {
          throw _fixup(e);
        });
      }
      _fixup();
    }
    return pact;
  }
  // No support for Symbol.iterator
  if (!("length" in target)) {
    throw new TypeError("Object is not iterable");
  }
  // Handle live collections properly
  var values = [];
  for (var i = 0; i < target.length; i++) {
    values.push(target[i]);
  }
  return _forTo(values, function (i) {
    return body(values[i]);
  }, check);
}
var mayCopyFile = _async(function (srcStat, src, dest, opts) {
  return function () {
    if (opts.force) {
      return _await(unlink(dest), function () {
        return _copyFile(srcStat, src, dest, opts);
      });
    } else if (opts.errorOnExist) {
      throw new ERR_FS_CP_EEXIST({
        message: `${dest} already exists`,
        path: dest,
        syscall: 'cp',
        errno: EEXIST,
        code: 'EEXIST'
      });
    }
  }();
});
function _forAwaitOf(target, body, check) {
  if (typeof target[_asyncIteratorSymbol] === "function") {
    var pact = new _Pact();
    var iterator = target[_asyncIteratorSymbol]();
    iterator.next().then(_resumeAfterNext).then(void 0, _reject);
    return pact;
    function _resumeAfterBody(result) {
      if (check && check()) {
        return _settle(pact, 1, iterator.return ? iterator.return().then(function () {
          return result;
        }) : result);
      }
      iterator.next().then(_resumeAfterNext).then(void 0, _reject);
    }
    function _resumeAfterNext(step) {
      if (step.done) {
        _settle(pact, 1);
      } else {
        Promise.resolve(body(step.value)).then(_resumeAfterBody).then(void 0, _reject);
      }
    }
    function _reject(error) {
      _settle(pact, 2, iterator.return ? iterator.return().then(function () {
        return error;
      }) : error);
    }
  }
  return Promise.resolve(_forOf(target, function (value) {
    return Promise.resolve(value).then(body);
  }, check));
}
var getStatsForCopy = _async(function (destStat, src, dest, opts) {
  var statFn = opts.dereference ? stat : lstat;
  return _await(statFn(src), function (srcStat) {
    if (srcStat.isDirectory() && opts.recursive) {
      return onDir(srcStat, destStat, src, dest, opts);
    } else if (srcStat.isDirectory()) {
      throw new ERR_FS_EISDIR({
        message: `${src} is a directory (not copied)`,
        path: src,
        syscall: 'cp',
        errno: EISDIR,
        code: 'EISDIR'
      });
    } else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) {
      return onFile(srcStat, destStat, src, dest, opts);
    } else if (srcStat.isSymbolicLink()) {
      return onLink(destStat, src, dest, opts);
    } else if (srcStat.isSocket()) {
      throw new ERR_FS_CP_SOCKET({
        message: `cannot copy a socket file: ${dest}`,
        path: dest,
        syscall: 'cp',
        errno: EINVAL,
        code: 'EINVAL'
      });
    } else if (srcStat.isFIFO()) {
      throw new ERR_FS_CP_FIFO_PIPE({
        message: `cannot copy a FIFO pipe: ${dest}`,
        path: dest,
        syscall: 'cp',
        errno: EINVAL,
        code: 'EINVAL'
      });
    }
    throw new ERR_FS_CP_UNKNOWN({
      message: `cannot copy an unknown file type: ${dest}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
      code: 'EINVAL'
    });
  });
});
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
// Recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
var checkParentPaths = _async(function (src, srcStat, dest) {
  var _exit2 = false;
  var srcParent = resolve(dirname(src));
  var destParent = resolve(dirname(dest));
  if (destParent === srcParent || destParent === parse(destParent).root) {
    return;
  }
  var destStat;
  return _continue(_catch(function () {
    return _await(stat(destParent, {
      bigint: true
    }), function (_stat) {
      destStat = _stat;
    });
  }, function (err) {
    if (err.code === 'ENOENT') {
      _exit2 = true;
      return;
    }
    throw err;
  }), function (_result) {
    if (_exit2) return _result;
    if (areIdentical(srcStat, destStat)) {
      throw new ERR_FS_CP_EINVAL({
        message: `cannot copy ${src} to a subdirectory of self ${dest}`,
        path: dest,
        syscall: 'cp',
        errno: EINVAL,
        code: 'EINVAL'
      });
    }
    return checkParentPaths(src, srcStat, destParent);
  });
});
var checkParentDir = _async(function (destStat, src, dest, opts) {
  var destParent = dirname(dest);
  return _await(pathExists(destParent), function (dirExists) {
    return dirExists ? getStatsForCopy(destStat, src, dest, opts) : _await(mkdir(destParent, {
      recursive: true
    }), function () {
      return getStatsForCopy(destStat, src, dest, opts);
    });
  });
});
var checkPaths = _async(function (src, dest, opts) {
  var _exit = false;
  var _opts$filter2 = opts.filter;
  return _await(_opts$filter2 && opts.filter(src, dest), function (_opts$filter) {
    if (_opts$filter2 && !_opts$filter) {
      var _proto__$skipped = {
        __proto__: null,
        skipped: true
      };
      _exit = true;
      return _proto__$skipped;
    }
    return _await(getStats(src, dest, opts), function (_ref) {
      var {
        0: srcStat,
        1: destStat
      } = _ref;
      if (destStat) {
        if (areIdentical(srcStat, destStat)) {
          throw new ERR_FS_CP_EINVAL({
            message: 'src and dest cannot be the same',
            path: dest,
            syscall: 'cp',
            errno: EINVAL,
            code: 'EINVAL'
          });
        }
        if (srcStat.isDirectory() && !destStat.isDirectory()) {
          throw new ERR_FS_CP_DIR_TO_NON_DIR({
            message: `cannot overwrite non-directory ${dest} ` + `with directory ${src}`,
            path: dest,
            syscall: 'cp',
            errno: EISDIR,
            code: 'EISDIR'
          });
        }
        if (!srcStat.isDirectory() && destStat.isDirectory()) {
          throw new ERR_FS_CP_NON_DIR_TO_DIR({
            message: `cannot overwrite directory ${dest} ` + `with non-directory ${src}`,
            path: dest,
            syscall: 'cp',
            errno: ENOTDIR,
            code: 'ENOTDIR'
          });
        }
      }
      if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
        throw new ERR_FS_CP_EINVAL({
          message: `cannot copy ${src} to a subdirectory of self ${dest}`,
          path: dest,
          syscall: 'cp',
          errno: EINVAL,
          code: 'EINVAL'
        });
      }
      return {
        __proto__: null,
        srcStat,
        destStat,
        skipped: false
      };
    });
  }, !_opts$filter2);
});
var cpFn = _async(function (src, dest, opts) {
  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    var warning = 'Using the preserveTimestamps option in 32-bit ' + 'node is not recommended';
    process.emitWarning(warning, 'TimestampPrecisionWarning');
  }
  return _await(checkPaths(src, dest, opts), function (stats) {
    var {
      srcStat,
      destStat,
      skipped
    } = stats;
    if (skipped) return;
    return _await(checkParentPaths(src, srcStat, dest), function () {
      return checkParentDir(destStat, src, dest, opts);
    });
  });
});
var {
  ArrayPrototypeEvery,
  ArrayPrototypeFilter,
  Boolean,
  PromisePrototypeThen,
  PromiseReject,
  SafePromiseAll,
  StringPrototypeSplit
} = primordials;
var {
  codes: {
    ERR_FS_CP_DIR_TO_NON_DIR,
    ERR_FS_CP_EEXIST,
    ERR_FS_CP_EINVAL,
    ERR_FS_CP_FIFO_PIPE,
    ERR_FS_CP_NON_DIR_TO_DIR,
    ERR_FS_CP_SOCKET,
    ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY,
    ERR_FS_CP_UNKNOWN,
    ERR_FS_EISDIR
  }
} = require('internal/errors');
var {
  os: {
    errno: {
      EEXIST,
      EISDIR,
      EINVAL,
      ENOTDIR
    }
  }
} = internalBinding('constants');
var {
  chmod,
  copyFile,
  lstat,
  mkdir,
  opendir,
  readlink,
  stat,
  symlink,
  unlink,
  utimes
} = require('fs/promises');
var {
  dirname,
  isAbsolute,
  join,
  parse,
  resolve,
  sep
} = require('path');
var fsBinding = internalBinding('fs');
function areIdentical(srcStat, destStat) {
  return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev;
}
function getStats(src, dest, opts) {
  var statFunc = opts.dereference ? file => stat(file, {
    bigint: true
  }) : file => lstat(file, {
    bigint: true
  });
  return SafePromiseAll([statFunc(src), PromisePrototypeThen(statFunc(dest), undefined, err => {
    if (err.code === 'ENOENT') return null;
    throw err;
  })]);
}
function pathExists(dest) {
  return PromisePrototypeThen(stat(dest), () => true, err => err.code === 'ENOENT' ? false : PromiseReject(err));
}
var normalizePathToArray = path => ArrayPrototypeFilter(StringPrototypeSplit(resolve(path), sep), Boolean);

// Return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir(src, dest) {
  var srcArr = normalizePathToArray(src);
  var destArr = normalizePathToArray(dest);
  return ArrayPrototypeEvery(srcArr, (cur, i) => destArr[i] === cur);
}
function onFile(srcStat, destStat, src, dest, opts) {
  if (!destStat) return _copyFile(srcStat, src, dest, opts);
  return mayCopyFile(srcStat, src, dest, opts);
}
function fileIsNotWritable(srcMode) {
  return (srcMode & 0o200) === 0;
}
function makeFileWritable(dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200);
}
function setDestMode(dest, srcMode) {
  return chmod(dest, srcMode);
}
module.exports = {
  areIdentical,
  cpFn,
  isSrcSubdir
};

