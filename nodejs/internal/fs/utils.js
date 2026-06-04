'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayIsArray,
  BigInt,
  Date,
  DateNow,
  DatePrototypeGetTime,
  ErrorCaptureStackTrace,
  FunctionPrototypeCall,
  MathFloor,
  MathMin,
  MathRound,
  Number: _Number,
  NumberIsFinite,
  ObjectDefineProperties,
  ObjectIs,
  ObjectSetPrototypeOf,
  ReflectOwnKeys,
  RegExpPrototypeSymbolReplace,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  Symbol: _Symbol,
  TypedArrayPrototypeAt,
  TypedArrayPrototypeIncludes,
  globalThis
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  UVException,
  codes: {
    ERR_FS_EISDIR,
    ERR_INCOMPATIBLE_OPTION_PAIR,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_NO_TEMPORAL,
    ERR_OUT_OF_RANGE
  },
  hideStackFrames
} = require('internal/errors');
var {
  isArrayBufferView,
  isBigInt64Array,
  isDate,
  isUint8Array
} = require('internal/util/types');
var {
  deprecate,
  isWindows,
  kEmptyObject,
  once,
  setOwnProperty
} = require('internal/util');
var {
  toPathIfFileURL
} = require('internal/url');
var {
  validateAbortSignal,
  validateBoolean,
  validateFunction,
  validateInt32,
  validateInteger,
  validateObject,
  validateUint32
} = require('internal/validators');
var pathModule = require('path');
var kType = _Symbol('type');
var kStats = _Symbol('stats');
var kPartialAtimeNs = _Symbol('partialAtimeNs');
var kPartialMtimeNs = _Symbol('partialMtimeNs');
var kPartialCtimeNs = _Symbol('partialCtimeNs');
var kPartialBirthtimeNs = _Symbol('kPartialBirthtimeNs');
var assert = require('internal/assert');
var {
  fs: {
    F_OK = 0,
    W_OK = 0,
    R_OK = 0,
    X_OK = 0,
    COPYFILE_EXCL,
    COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE,
    O_APPEND,
    O_CREAT,
    O_EXCL,
    O_RDONLY,
    O_RDWR,
    O_SYNC,
    O_TRUNC,
    O_WRONLY,
    S_IFBLK,
    S_IFCHR,
    S_IFDIR,
    S_IFIFO,
    S_IFLNK,
    S_IFMT,
    S_IFREG,
    S_IFSOCK,
    UV_FS_SYMLINK_DIR,
    UV_FS_SYMLINK_JUNCTION,
    UV_DIRENT_UNKNOWN,
    UV_DIRENT_FILE,
    UV_DIRENT_DIR,
    UV_DIRENT_LINK,
    UV_DIRENT_FIFO,
    UV_DIRENT_SOCKET,
    UV_DIRENT_CHAR,
    UV_DIRENT_BLOCK
  },
  os: {
    errno: {
      EISDIR
    }
  }
} = internalBinding('constants');

// The access modes can be any of F_OK, R_OK, W_OK or X_OK. Some might not be
// available on specific systems. They can be used in combination as well
// (F_OK | R_OK | W_OK | X_OK).
var kMinimumAccessMode = MathMin(F_OK, W_OK, R_OK, X_OK);
var kMaximumAccessMode = F_OK | W_OK | R_OK | X_OK;
var kDefaultCopyMode = 0;
// The copy modes can be any of COPYFILE_EXCL, COPYFILE_FICLONE or
// COPYFILE_FICLONE_FORCE. They can be used in combination as well
// (COPYFILE_EXCL | COPYFILE_FICLONE | COPYFILE_FICLONE_FORCE).
var kMinimumCopyMode = MathMin(kDefaultCopyMode, COPYFILE_EXCL, COPYFILE_FICLONE, COPYFILE_FICLONE_FORCE);
var kMaximumCopyMode = COPYFILE_EXCL | COPYFILE_FICLONE | COPYFILE_FICLONE_FORCE;

// Most platforms don't allow reads or writes >= 2 GiB.
// See https://github.com/libuv/libuv/pull/1501.
var kIoMaxLength = 2 ** 31 - 1;

// Use 64kb in case the file type is not a regular file and thus do not know the
// actual file size. Increasing the value further results in more frequent over
// allocation for small files and consumes CPU time and memory that should be
// used else wise.
// Use up to 512kb per read otherwise to partition reading big files to prevent
// blocking other threads in case the available threads are all in use.
var kReadFileUnknownBufferLength = 64 * 1024;
var kReadFileBufferLength = 512 * 1024;
var kWriteFileMaxChunkSize = 512 * 1024;
var kMaxUserId = 2 ** 32 - 1;
var fs;
function lazyLoadFs() {
  return fs ??= require('fs');
}
function assertEncoding(encoding) {
  if (encoding && !Buffer.isEncoding(encoding)) {
    var reason = 'is invalid encoding';
    throw new ERR_INVALID_ARG_VALUE('encoding', encoding, reason);
  }
}
var Dirent = /*#__PURE__*/function () {
  function Dirent(name, type, path) {
    _classCallCheck(this, Dirent);
    this.name = name;
    this.parentPath = path;
    this[kType] = type;
  }
  return _createClass(Dirent, [{
    key: "isDirectory",
    value: function isDirectory() {
      return this[kType] === UV_DIRENT_DIR;
    }
  }, {
    key: "isFile",
    value: function isFile() {
      return this[kType] === UV_DIRENT_FILE;
    }
  }, {
    key: "isBlockDevice",
    value: function isBlockDevice() {
      return this[kType] === UV_DIRENT_BLOCK;
    }
  }, {
    key: "isCharacterDevice",
    value: function isCharacterDevice() {
      return this[kType] === UV_DIRENT_CHAR;
    }
  }, {
    key: "isSymbolicLink",
    value: function isSymbolicLink() {
      return this[kType] === UV_DIRENT_LINK;
    }
  }, {
    key: "isFIFO",
    value: function isFIFO() {
      return this[kType] === UV_DIRENT_FIFO;
    }
  }, {
    key: "isSocket",
    value: function isSocket() {
      return this[kType] === UV_DIRENT_SOCKET;
    }
  }]);
}();
var DirentFromStats = /*#__PURE__*/function (_Dirent) {
  function DirentFromStats(name, stats, path) {
    var _this;
    _classCallCheck(this, DirentFromStats);
    _this = _callSuper(this, DirentFromStats, [name, null, path]);
    _this[kStats] = stats;
    return _this;
  }
  _inherits(DirentFromStats, _Dirent);
  return _createClass(DirentFromStats);
}(Dirent);
var _loop = function (name) {
  if (name === 'constructor') {
    return 1; // continue
  }
  DirentFromStats.prototype[name] = function () {
    return this[kStats][name]();
  };
};
for (var name of ReflectOwnKeys(Dirent.prototype)) {
  if (_loop(name)) continue;
}
function copyObject(source) {
  var target = {};
  for (var key in source) target[key] = source[key];
  return target;
}
var bufferSep = Buffer.from(pathModule.sep);
function join(path, name) {
  if ((typeof path === 'string' || isUint8Array(path)) && name === undefined) {
    return path;
  }
  if (typeof path === 'string' && isUint8Array(name)) {
    var pathBuffer = Buffer.from(pathModule.join(path, pathModule.sep));
    return Buffer.concat([pathBuffer, name]);
  }
  if (typeof path === 'string' && typeof name === 'string') {
    return pathModule.join(path, name);
  }
  if (isUint8Array(path) && isUint8Array(name)) {
    return Buffer.concat([path, bufferSep, name]);
  }
  throw new ERR_INVALID_ARG_TYPE('path', ['string', 'Buffer'], path);
}
function getDirents(path, _ref, callback) {
  var {
    0: names,
    1: types
  } = _ref;
  var i;
  if (typeof callback === 'function') {
    var len = names.length;
    var toFinish = 0;
    callback = once(callback);
    var _loop2 = function () {
        var type = types[i];
        if (type === UV_DIRENT_UNKNOWN) {
          var _name = names[i];
          var idx = i;
          toFinish++;
          var filepath;
          try {
            filepath = join(path, _name);
          } catch (err) {
            callback(err);
            return {
              v: void 0
            };
          }
          lazyLoadFs().lstat(filepath, (err, stats) => {
            if (err) {
              callback(err);
              return;
            }
            names[idx] = new DirentFromStats(_name, stats, path);
            if (--toFinish === 0) {
              callback(null, names);
            }
          });
        } else {
          names[i] = new Dirent(names[i], types[i], path);
        }
      },
      _ret;
    for (i = 0; i < len; i++) {
      _ret = _loop2();
      if (_ret) return _ret.v;
    }
    if (toFinish === 0) {
      callback(null, names);
    }
  } else {
    var _len = names.length;
    for (i = 0; i < _len; i++) {
      names[i] = getDirent(path, names[i], types[i]);
    }
    return names;
  }
}
function getDirent(path, name, type, callback) {
  if (typeof callback === 'function') {
    if (type === UV_DIRENT_UNKNOWN) {
      var filepath;
      try {
        filepath = join(path, name);
      } catch (err) {
        callback(err);
        return;
      }
      lazyLoadFs().lstat(filepath, (err, stats) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, new DirentFromStats(name, stats, path));
      });
    } else {
      callback(null, new Dirent(name, type, path));
    }
  } else if (type === UV_DIRENT_UNKNOWN) {
    var _filepath = join(path, name);
    var stats = lazyLoadFs().lstatSync(_filepath);
    return new DirentFromStats(name, stats, path);
  } else {
    return new Dirent(name, type, path);
  }
}
function getOptions(options) {
  var defaultOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
  if (options == null || typeof options === 'function') {
    return defaultOptions;
  }
  if (typeof options === 'string') {
    defaultOptions = _objectSpread({}, defaultOptions);
    defaultOptions.encoding = options;
    options = defaultOptions;
  } else if (typeof options !== 'object') {
    throw new ERR_INVALID_ARG_TYPE('options', ['string', 'Object'], options);
  }
  if (options.encoding !== 'buffer') assertEncoding(options.encoding);
  if (options.signal !== undefined) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  return options;
}

/**
 * @param {InternalFSBinding.FSSyncContext} ctx
 */
function handleErrorFromBinding(ctx) {
  if (ctx.errno !== undefined) {
    // libuv error numbers
    var err = new UVException(ctx);
    ErrorCaptureStackTrace(err, handleErrorFromBinding);
    throw err;
  }
  if (ctx.error !== undefined) {
    // Errors created in C++ land.
    // TODO(joyeecheung): currently, ctx.error are encoding errors
    // usually caused by memory problems. We need to figure out proper error
    // code(s) for this.
    ErrorCaptureStackTrace(ctx.error, handleErrorFromBinding);
    throw ctx.error;
  }
}
function preprocessSymlinkDestination(path, type, linkPath) {
  if (!isWindows) {
    // No preprocessing is needed on Unix.
    return path;
  }
  path = '' + path;
  if (type === 'junction') {
    // Junctions paths need to be absolute and \\?\-prefixed.
    // A relative target is relative to the link's parent directory.
    path = pathModule.resolve(linkPath, '..', path);
    return pathModule.toNamespacedPath(path);
  }
  if (pathModule.isAbsolute(path)) {
    // If the path is absolute, use the \\?\-prefix to enable long filenames
    return pathModule.toNamespacedPath(path);
  }
  // Windows symlinks don't tolerate forward slashes.
  return RegExpPrototypeSymbolReplace(/\//g, path, '\\');
}

// Constructor for file stats.
function StatsBase(dev, mode, nlink, uid, gid, rdev, blksize, ino, size, blocks) {
  this.dev = dev;
  this.mode = mode;
  this.nlink = nlink;
  this.uid = uid;
  this.gid = gid;
  this.rdev = rdev;
  this.blksize = blksize;
  this.ino = ino;
  this.size = size;
  this.blocks = blocks;
}
StatsBase.prototype.isDirectory = function () {
  return this._checkModeProperty(S_IFDIR);
};
StatsBase.prototype.isFile = function () {
  return this._checkModeProperty(S_IFREG);
};
StatsBase.prototype.isBlockDevice = function () {
  return this._checkModeProperty(S_IFBLK);
};
StatsBase.prototype.isCharacterDevice = function () {
  return this._checkModeProperty(S_IFCHR);
};
StatsBase.prototype.isSymbolicLink = function () {
  return this._checkModeProperty(S_IFLNK);
};
StatsBase.prototype.isFIFO = function () {
  return this._checkModeProperty(S_IFIFO);
};
StatsBase.prototype.isSocket = function () {
  return this._checkModeProperty(S_IFSOCK);
};
var kNsPerMsBigInt = 1_000_000n;
var kNsPerSecBigInt = 1_000_000_000n;
var kMsPerSec = 1_000;
var kNsPerMs = 1_000_000;
function msFromTimeSpec(sec, nsec) {
  return sec * kMsPerSec + nsec / kNsPerMs;
}
function nsFromTimeSpecBigInt(sec, nsec) {
  return sec * kNsPerSecBigInt + nsec;
}

// TODO(LiviaMedeiros): TemporalInstant primordial
var TemporalInstant;
function instantFromNs(nsec) {
  TemporalInstant ??= globalThis.Temporal?.Instant;
  if (TemporalInstant === undefined) {
    throw new ERR_NO_TEMPORAL();
  }
  return new TemporalInstant(nsec);
}
function instantFromTimeSpecMs(msec, nsec) {
  TemporalInstant ??= globalThis.Temporal?.Instant;
  if (TemporalInstant === undefined) {
    throw new ERR_NO_TEMPORAL();
  }
  return new TemporalInstant(BigInt(MathFloor(msec / kMsPerSec)) * kNsPerSecBigInt + BigInt(nsec));
}

// The Date constructor performs Math.floor() on the absolute value
// of the timestamp: https://tc39.es/ecma262/#sec-timeclip
// Since there may be a precision loss when the timestamp is
// converted to a floating point number, we manually round
// the timestamp here before passing it to Date().
// Refs: https://github.com/nodejs/node/pull/12607
// Refs: https://github.com/nodejs/node/pull/43714
function dateFromMs(ms) {
  // Coercing to number, ms can be bigint
  return new Date(MathRound(_Number(ms)));
}
var lazyDateFields = {
  __proto__: null,
  atime: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'atime', dateFromMs(this.atimeMs));
    },
    set(value) {
      setOwnProperty(this, 'atime', value);
    }
  },
  mtime: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'mtime', dateFromMs(this.mtimeMs));
    },
    set(value) {
      setOwnProperty(this, 'mtime', value);
    }
  },
  ctime: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'ctime', dateFromMs(this.ctimeMs));
    },
    set(value) {
      setOwnProperty(this, 'ctime', value);
    }
  },
  birthtime: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'birthtime', dateFromMs(this.birthtimeMs));
    },
    set(value) {
      setOwnProperty(this, 'birthtime', value);
    }
  }
};
var lazyTemporalFields = {
  __proto__: null,
  atimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'atimeInstant', instantFromTimeSpecMs(this.atimeMs, this[kPartialAtimeNs]));
    },
    set(value) {
      setOwnProperty(this, 'atimeInstant', value);
    }
  },
  mtimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'mtimeInstant', instantFromTimeSpecMs(this.mtimeMs, this[kPartialMtimeNs]));
    },
    set(value) {
      setOwnProperty(this, 'mtimeInstant', value);
    }
  },
  ctimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'ctimeInstant', instantFromTimeSpecMs(this.ctimeMs, this[kPartialCtimeNs]));
    },
    set(value) {
      setOwnProperty(this, 'ctimeInstant', value);
    }
  },
  birthtimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'birthtimeInstant', instantFromTimeSpecMs(this.birthtimeMs, this[kPartialBirthtimeNs]));
    },
    set(value) {
      setOwnProperty(this, 'birthtimeInstant', value);
    }
  }
};
var lazyTemporalBigIntFields = {
  __proto__: null,
  atimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'atimeInstant', instantFromNs(this.atimeNs));
    },
    set(value) {
      setOwnProperty(this, 'atimeInstant', value);
    }
  },
  mtimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'mtimeInstant', instantFromNs(this.mtimeNs));
    },
    set(value) {
      setOwnProperty(this, 'mtimeInstant', value);
    }
  },
  ctimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'ctimeInstant', instantFromNs(this.ctimeNs));
    },
    set(value) {
      setOwnProperty(this, 'ctimeInstant', value);
    }
  },
  birthtimeInstant: {
    __proto__: null,
    enumerable: true,
    configurable: true,
    get() {
      return setOwnProperty(this, 'birthtimeInstant', instantFromNs(this.birthtimeNs));
    },
    set(value) {
      setOwnProperty(this, 'birthtimeInstant', value);
    }
  }
};
function BigIntStats(dev, mode, nlink, uid, gid, rdev, blksize, ino, size, blocks, atimeNs, mtimeNs, ctimeNs, birthtimeNs) {
  FunctionPrototypeCall(StatsBase, this, dev, mode, nlink, uid, gid, rdev, blksize, ino, size, blocks);
  this.atimeMs = atimeNs / kNsPerMsBigInt;
  this.mtimeMs = mtimeNs / kNsPerMsBigInt;
  this.ctimeMs = ctimeNs / kNsPerMsBigInt;
  this.birthtimeMs = birthtimeNs / kNsPerMsBigInt;
  this.atimeNs = atimeNs;
  this.mtimeNs = mtimeNs;
  this.ctimeNs = ctimeNs;
  this.birthtimeNs = birthtimeNs;
}
ObjectSetPrototypeOf(BigIntStats.prototype, StatsBase.prototype);
ObjectSetPrototypeOf(BigIntStats, StatsBase);
ObjectDefineProperties(BigIntStats.prototype, lazyDateFields);
ObjectDefineProperties(BigIntStats.prototype, lazyTemporalBigIntFields);
BigIntStats.prototype._checkModeProperty = function (property) {
  if (isWindows && (property === S_IFIFO || property === S_IFBLK || property === S_IFSOCK)) {
    return false; // Some types are not available on Windows
  }
  return (this.mode & BigInt(S_IFMT)) === BigInt(property);
};
function Stats(dev, mode, nlink, uid, gid, rdev, blksize, ino, size, blocks, atimeS, atimeNs, mtimeS, mtimeNs, ctimeS, ctimeNs, birthtimeS, birthtimeNs) {
  FunctionPrototypeCall(StatsBase, this, dev, mode, nlink, uid, gid, rdev, blksize, ino, size, blocks);
  this.atimeMs = msFromTimeSpec(atimeS, atimeNs);
  this.mtimeMs = msFromTimeSpec(mtimeS, mtimeNs);
  this.ctimeMs = msFromTimeSpec(ctimeS, ctimeNs);
  this.birthtimeMs = msFromTimeSpec(birthtimeS, birthtimeNs);
  this[kPartialAtimeNs] = atimeNs;
  this[kPartialMtimeNs] = mtimeNs;
  this[kPartialCtimeNs] = ctimeNs;
  this[kPartialBirthtimeNs] = birthtimeNs;
}
ObjectSetPrototypeOf(Stats.prototype, StatsBase.prototype);
ObjectSetPrototypeOf(Stats, StatsBase);
ObjectDefineProperties(Stats.prototype, lazyDateFields);
ObjectDefineProperties(Stats.prototype, lazyTemporalFields);
Stats.prototype._checkModeProperty = function (property) {
  if (isWindows && (property === S_IFIFO || property === S_IFBLK || property === S_IFSOCK)) {
    return false; // Some types are not available on Windows
  }
  return (this.mode & S_IFMT) === property;
};

/**
 * @param {Float64Array | BigInt64Array} stats
 * @param {number} offset
 * @returns {BigIntStats | Stats}
 */
function getStatsFromBinding(stats) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (isBigInt64Array(stats)) {
    return new BigIntStats(stats[0 + offset], stats[1 + offset], stats[2 + offset], stats[3 + offset], stats[4 + offset], stats[5 + offset], stats[6 + offset], stats[7 + offset], stats[8 + offset], stats[9 + offset], nsFromTimeSpecBigInt(stats[10 + offset], stats[11 + offset]), nsFromTimeSpecBigInt(stats[12 + offset], stats[13 + offset]), nsFromTimeSpecBigInt(stats[14 + offset], stats[15 + offset]), nsFromTimeSpecBigInt(stats[16 + offset], stats[17 + offset]));
  }
  return new Stats(stats[0 + offset], stats[1 + offset], stats[2 + offset], stats[3 + offset], stats[4 + offset], stats[5 + offset], stats[6 + offset], stats[7 + offset], stats[8 + offset], stats[9 + offset], stats[10 + offset], stats[11 + offset],
  // atime
  stats[12 + offset], stats[13 + offset],
  // mtime
  stats[14 + offset], stats[15 + offset],
  // ctime
  stats[16 + offset], stats[17 + offset] // birthtime
  );
}
var StatFs = /*#__PURE__*/_createClass(function StatFs(type, bsize, frsize, blocks, bfree, bavail, files, ffree) {
  _classCallCheck(this, StatFs);
  this.type = type;
  this.bsize = bsize;
  this.frsize = frsize;
  this.blocks = blocks;
  this.bfree = bfree;
  this.bavail = bavail;
  this.files = files;
  this.ffree = ffree;
});
function getStatFsFromBinding(stats) {
  return new StatFs(stats[0], stats[1], stats[2], stats[3], stats[4], stats[5], stats[6], stats[7]);
}
function stringToFlags(flags) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'flags';
  if (typeof flags === 'number') {
    validateInt32(flags, name);
    // Coerce -0 to +0.
    return flags + 0;
  }
  if (flags == null) {
    return O_RDONLY;
  }
  switch (flags) {
    case 'r':
      return O_RDONLY;
    case 'rs': // Fall through.
    case 'sr':
      return O_RDONLY | O_SYNC;
    case 'r+':
      return O_RDWR;
    case 'rs+': // Fall through.
    case 'sr+':
      return O_RDWR | O_SYNC;
    case 'w':
      return O_TRUNC | O_CREAT | O_WRONLY;
    case 'wx': // Fall through.
    case 'xw':
      return O_TRUNC | O_CREAT | O_WRONLY | O_EXCL;
    case 'w+':
      return O_TRUNC | O_CREAT | O_RDWR;
    case 'wx+': // Fall through.
    case 'xw+':
      return O_TRUNC | O_CREAT | O_RDWR | O_EXCL;
    case 'a':
      return O_APPEND | O_CREAT | O_WRONLY;
    case 'ax': // Fall through.
    case 'xa':
      return O_APPEND | O_CREAT | O_WRONLY | O_EXCL;
    case 'as': // Fall through.
    case 'sa':
      return O_APPEND | O_CREAT | O_WRONLY | O_SYNC;
    case 'a+':
      return O_APPEND | O_CREAT | O_RDWR;
    case 'ax+': // Fall through.
    case 'xa+':
      return O_APPEND | O_CREAT | O_RDWR | O_EXCL;
    case 'as+': // Fall through.
    case 'sa+':
      return O_APPEND | O_CREAT | O_RDWR | O_SYNC;
  }
  throw new ERR_INVALID_ARG_VALUE('flags', flags);
}
var stringToSymlinkType = hideStackFrames(type => {
  switch (type) {
    case undefined:
    case null:
    case 'file':
      return 0;
    case 'dir':
      return UV_FS_SYMLINK_DIR;
    case 'junction':
      return UV_FS_SYMLINK_JUNCTION;
  }
});

// converts Date or number to a fractional UNIX timestamp
function toUnixTimestamp(time) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'time';
  // eslint-disable-next-line eqeqeq
  if (typeof time === 'string' && +time == time) {
    return +time;
  }
  if (NumberIsFinite(time)) {
    if (time < 0) {
      return DateNow() / 1000;
    }
    return time;
  }
  if (isDate(time)) {
    // Convert to 123.456 UNIX timestamp
    return DatePrototypeGetTime(time) / 1000;
  }
  throw new ERR_INVALID_ARG_TYPE(name, ['Date', 'Time in seconds'], time);
}
var validateOffsetLengthRead = hideStackFrames((offset, length, bufferLength) => {
  if (offset < 0) {
    throw new ERR_OUT_OF_RANGE.HideStackFramesError('offset', '>= 0', offset);
  }
  if (length < 0) {
    throw new ERR_OUT_OF_RANGE.HideStackFramesError('length', '>= 0', length);
  }
  if (offset + length > bufferLength) {
    throw new ERR_OUT_OF_RANGE.HideStackFramesError('length', `<= ${bufferLength - offset}`, length);
  }
});
var validateOffsetLengthWrite = hideStackFrames((offset, length, byteLength) => {
  if (offset > byteLength) {
    throw new ERR_OUT_OF_RANGE.HideStackFramesError('offset', `<= ${byteLength}`, offset);
  }
  if (length > byteLength - offset) {
    throw new ERR_OUT_OF_RANGE.HideStackFramesError('length', `<= ${byteLength - offset}`, length);
  }
  if (length < 0) {
    throw new ERR_OUT_OF_RANGE.HideStackFramesError('length', '>= 0', length);
  }
  validateInt32.withoutStackTrace(length, 'length', 0);
});
var validatePath = hideStackFrames(function (path) {
  var propName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'path';
  if (typeof path !== 'string' && !isUint8Array(path)) {
    throw new ERR_INVALID_ARG_TYPE.HideStackFramesError(propName, ['string', 'Buffer', 'URL'], path);
  }
  var pathIsString = typeof path === 'string';
  var pathIsUint8Array = isUint8Array(path);

  // We can only perform meaningful checks on strings and Uint8Arrays.
  if (!pathIsString && !pathIsUint8Array || pathIsString && !StringPrototypeIncludes(path, '\u0000') || pathIsUint8Array && !TypedArrayPrototypeIncludes(path, 0)) {
    return;
  }
  throw new ERR_INVALID_ARG_VALUE.HideStackFramesError(propName, path, 'must be a string, Uint8Array, or URL without null bytes');
});
var getValidatedPath = hideStackFrames(function (fileURLOrPath) {
  var propName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'path';
  var path = toPathIfFileURL(fileURLOrPath);
  validatePath(path, propName);
  return path;
});
var getValidatedFd = hideStackFrames(function (fd) {
  var propName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'fd';
  if (ObjectIs(fd, -0)) {
    return 0;
  }
  validateInt32(fd, propName, 0);
  return fd;
});
var validateBufferArray = hideStackFrames(function (buffers) {
  var propName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'buffers';
  if (!ArrayIsArray(buffers)) throw new ERR_INVALID_ARG_TYPE.HideStackFramesError(propName, 'ArrayBufferView[]', buffers);
  for (var i = 0; i < buffers.length; i++) {
    if (!isArrayBufferView(buffers[i])) throw new ERR_INVALID_ARG_TYPE.HideStackFramesError(propName, 'ArrayBufferView[]', buffers);
  }
  return buffers;
});
var nonPortableTemplateWarn = true;
function warnOnNonPortableTemplate(template) {
  // Template strings passed to the mkdtemp() family of functions should not
  // end with 'X' because they are handled inconsistently across platforms.
  if (nonPortableTemplateWarn && (typeof template === 'string' && StringPrototypeEndsWith(template, 'X') || typeof template !== 'string' && TypedArrayPrototypeAt(template, -1) === 0x58)) {
    process.emitWarning('mkdtemp() templates ending with X are not portable. ' + 'For details see: https://nodejs.org/api/fs.html');
    nonPortableTemplateWarn = false;
  }
}
var defaultCpOptions = {
  dereference: false,
  errorOnExist: false,
  filter: undefined,
  force: true,
  preserveTimestamps: false,
  recursive: false,
  verbatimSymlinks: false
};
var defaultRmOptions = {
  recursive: false,
  force: false,
  retryDelay: 100,
  maxRetries: 0
};
var validateCpOptions = hideStackFrames(options => {
  if (options === undefined) return _objectSpread({}, defaultCpOptions);
  validateObject(options, 'options');
  options = _objectSpread(_objectSpread({}, defaultCpOptions), options);
  validateBoolean(options.dereference, 'options.dereference');
  validateBoolean(options.errorOnExist, 'options.errorOnExist');
  validateBoolean(options.force, 'options.force');
  validateBoolean(options.preserveTimestamps, 'options.preserveTimestamps');
  validateBoolean(options.recursive, 'options.recursive');
  validateBoolean(options.verbatimSymlinks, 'options.verbatimSymlinks');
  options.mode = getValidMode(options.mode, 'copyFile');
  if (options.dereference === true && options.verbatimSymlinks === true) {
    throw new ERR_INCOMPATIBLE_OPTION_PAIR.HideStackFramesError('dereference', 'verbatimSymlinks');
  }
  if (options.filter !== undefined) {
    validateFunction(options.filter, 'options.filter');
  }
  return options;
});
var validateRmOptions = hideStackFrames((path, options, expectDir, cb) => {
  options = validateRmdirOptions(options, defaultRmOptions);
  validateBoolean.withoutStackTrace(options.force, 'options.force');
  validateBoolean.withoutStackTrace(options.recursive, 'options.recursive');
  validateInt32.withoutStackTrace(options.retryDelay, 'options.retryDelay', 0);
  validateUint32.withoutStackTrace(options.maxRetries, 'options.maxRetries');
  lazyLoadFs().lstat(path, (err, stats) => {
    if (err) {
      if (options.force && err.code === 'ENOENT') {
        return cb(null, options);
      }
      return cb(err, options);
    }
    if (expectDir && !stats.isDirectory()) {
      return cb(false);
    }
    if (stats.isDirectory() && !options.recursive) {
      var _err = new ERR_FS_EISDIR.HideStackFramesError({
        code: 'EISDIR',
        message: 'is a directory',
        path,
        syscall: 'rm',
        errno: EISDIR
      });
      return cb(_err);
    }
    return cb(null, options);
  });
});
var validateRmOptionsSync = hideStackFrames((path, options, expectDir) => {
  options = validateRmdirOptions.withoutStackTrace(options, defaultRmOptions);
  validateBoolean.withoutStackTrace(options.force, 'options.force');
  validateBoolean.withoutStackTrace(options.recursive, 'options.recursive');
  validateInt32.withoutStackTrace(options.retryDelay, 'options.retryDelay', 0);
  validateUint32.withoutStackTrace(options.maxRetries, 'options.maxRetries');
  if (!options.force || expectDir || !options.recursive) {
    var isDirectory = lazyLoadFs().lstatSync(path, {
      throwIfNoEntry: !options.force
    })?.isDirectory();
    if (expectDir && !isDirectory) {
      return false;
    }
    if (isDirectory && !options.recursive) {
      throw new ERR_FS_EISDIR.HideStackFramesError({
        code: 'EISDIR',
        message: 'is a directory',
        path,
        syscall: 'rm',
        errno: EISDIR
      });
    }
  }
  return options;
});
var validateRmdirOptions = hideStackFrames(function (options) {
  var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    __proto__: null
  };
  if (options === undefined) return defaults;
  validateObject.withoutStackTrace(options, 'options');
  options = _objectSpread(_objectSpread({}, defaults), options);
  return options;
});
var getValidMode = hideStackFrames((mode, type) => {
  var min = kMinimumAccessMode;
  var max = kMaximumAccessMode;
  var def = F_OK;
  if (type === 'copyFile') {
    min = kMinimumCopyMode;
    max = kMaximumCopyMode;
    def = mode || kDefaultCopyMode;
  } else {
    assert(type === 'access');
  }
  if (mode == null) {
    return def;
  }
  validateInteger.withoutStackTrace(mode, 'mode', min, max);
  return mode;
});
var validateStringAfterArrayBufferView = hideStackFrames((buffer, name) => {
  if (typeof buffer !== 'string') {
    throw new ERR_INVALID_ARG_TYPE.HideStackFramesError(name, ['string', 'Buffer', 'TypedArray', 'DataView'], buffer);
  }
});
var validatePosition = hideStackFrames((position, name, length) => {
  if (typeof position === 'number') {
    validateInteger.withoutStackTrace(position, name, -1);
  } else if (typeof position === 'bigint') {
    var maxPosition = 2n ** 63n - 1n - BigInt(length);
    if (!(position >= -1n && position <= maxPosition)) {
      throw new ERR_OUT_OF_RANGE.HideStackFramesError(name, `>= -1 && <= ${maxPosition}`, position);
    }
  } else {
    throw new ERR_INVALID_ARG_TYPE.HideStackFramesError(name, ['integer', 'bigint'], position);
  }
});

// Shared VFS handler state for fs wrapping.
// When handlers is null, no VFS is active (zero overhead).
var vfsState = {
  __proto__: null,
  handlers: null
};
function setVfsHandlers(handlers) {
  vfsState.handlers = handlers;
}
module.exports = {
  constants: {
    kIoMaxLength,
    kMaxUserId,
    kReadFileBufferLength,
    kReadFileUnknownBufferLength,
    kWriteFileMaxChunkSize
  },
  assertEncoding,
  setVfsHandlers,
  vfsState,
  BigIntStats,
  // for testing
  copyObject,
  Dirent,
  DirentFromStats,
  getDirent,
  getDirents,
  getOptions,
  getValidatedFd,
  getValidatedPath,
  handleErrorFromBinding,
  preprocessSymlinkDestination,
  realpathCacheKey: _Symbol('realpathCacheKey'),
  getStatFsFromBinding,
  getStatsFromBinding,
  stringToFlags,
  stringToSymlinkType,
  Stats: deprecate(Stats, 'fs.Stats constructor is deprecated.', 'DEP0180'),
  toUnixTimestamp,
  validateBufferArray,
  validateCpOptions,
  validateOffsetLengthRead,
  validateOffsetLengthWrite,
  validatePath,
  validatePosition,
  validateRmOptions,
  validateRmOptionsSync,
  validateRmdirOptions,
  validateStringAfterArrayBufferView,
  warnOnNonPortableTemplate
};

