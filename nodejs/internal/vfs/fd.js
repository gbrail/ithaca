'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  SafeMap,
  Symbol: _Symbol
} = primordials;

// Private symbols
var kFd = _Symbol('kFd');
var kEntry = _Symbol('kEntry');

// VFS FDs use bit 30 set to avoid conflicts with real OS fds.
// Real fds are small non-negative integers; VFS fds start at 0x40000000.
var VFS_FD_MASK = 0x40000000;
var nextFd = 0;

// Global registry of open virtual file descriptors
var openFDs = new SafeMap();

/**
 * Represents an open virtual file descriptor.
 * Wraps a VirtualFileHandle from the provider.
 */
var VirtualFD = /*#__PURE__*/function () {
  /**
   * @param {number} fd The file descriptor number
   * @param {VirtualFileHandle} entry The virtual file handle
   */
  function VirtualFD(fd, entry) {
    _classCallCheck(this, VirtualFD);
    this[kFd] = fd;
    this[kEntry] = entry;
  }

  /**
   * Gets the file descriptor number.
   * @returns {number}
   */
  return _createClass(VirtualFD, [{
    key: "fd",
    get: function () {
      return this[kFd];
    }

    /**
     * Gets the file handle.
     * @returns {VirtualFileHandle}
     */
  }, {
    key: "entry",
    get: function () {
      return this[kEntry];
    }
  }]);
}();
/**
 * Opens a virtual file and returns its file descriptor.
 * @param {VirtualFileHandle} entry The virtual file handle
 * @returns {number} The file descriptor
 */
function openVirtualFd(entry) {
  var fd = VFS_FD_MASK | nextFd++;
  var vfd = new VirtualFD(fd, entry);
  openFDs.set(fd, vfd);
  return fd;
}

/**
 * Gets a VirtualFD by its file descriptor number.
 * @param {number} fd The file descriptor number
 * @returns {VirtualFD|undefined}
 */
function getVirtualFd(fd) {
  return openFDs.get(fd);
}

/**
 * Closes a virtual file descriptor.
 * @param {number} fd The file descriptor number
 * @returns {boolean} True if the fd was found and closed
 */
function closeVirtualFd(fd) {
  return openFDs.delete(fd);
}
module.exports = {
  VFS_FD_MASK,
  VirtualFD,
  openVirtualFd,
  getVirtualFd,
  closeVirtualFd
};

