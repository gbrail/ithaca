'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  ObjectDefineProperties,
  ObjectFreeze,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeToUpperCase,
  Symbol: _Symbol
} = primordials;
var {
  ERR_ILLEGAL_CONSTRUCTOR
} = require('internal/errors').codes;
var {
  kEnumerableProperty
} = require('internal/util');
var {
  getAvailableParallelism
} = internalBinding('os');
var kInitialize = _Symbol('kInitialize');
var {
  platform,
  arch,
  version: nodeVersion
} = require('internal/process/per_thread');
var {
  getDefaultLocale
} = internalBinding('config');

/**
 * @param {string} arch
 * @param {string} platform
 * @returns {string}
 */
function getNavigatorPlatform(arch, platform) {
  if (platform === 'darwin') {
    // On macOS, modern browsers return 'MacIntel' even if running on Apple Silicon.
    return 'MacIntel';
  } else if (platform === 'win32') {
    // On Windows, modern browsers return 'Win32' even if running on a 64-bit version of Windows.
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform#usage_notes
    return 'Win32';
  } else if (platform === 'linux') {
    if (arch === 'ia32') {
      return 'Linux i686';
    } else if (arch === 'x64') {
      return 'Linux x86_64';
    }
    return `Linux ${arch}`;
  } else if (platform === 'freebsd') {
    if (arch === 'ia32') {
      return 'FreeBSD i386';
    } else if (arch === 'x64') {
      return 'FreeBSD amd64';
    }
    return `FreeBSD ${arch}`;
  } else if (platform === 'openbsd') {
    if (arch === 'ia32') {
      return 'OpenBSD i386';
    } else if (arch === 'x64') {
      return 'OpenBSD amd64';
    }
    return `OpenBSD ${arch}`;
  } else if (platform === 'sunos') {
    if (arch === 'ia32') {
      return 'SunOS i86pc';
    }
    return `SunOS ${arch}`;
  } else if (platform === 'aix') {
    return 'AIX';
  }
  return `${StringPrototypeToUpperCase(platform[0])}${StringPrototypeSlice(platform, 1)} ${arch}`;
}
var _availableParallelism = /*#__PURE__*/new WeakMap();
var _locks = /*#__PURE__*/new WeakMap();
var _userAgent = /*#__PURE__*/new WeakMap();
var _platform = /*#__PURE__*/new WeakMap();
var _languages = /*#__PURE__*/new WeakMap();
var Navigator = /*#__PURE__*/function () {
  function Navigator() {
    _classCallCheck(this, Navigator);
    // Private properties are used to avoid brand validations.
    _classPrivateFieldInitSpec(this, _availableParallelism, void 0);
    _classPrivateFieldInitSpec(this, _locks, void 0);
    _classPrivateFieldInitSpec(this, _userAgent, void 0);
    _classPrivateFieldInitSpec(this, _platform, void 0);
    _classPrivateFieldInitSpec(this, _languages, void 0);
    if (arguments[0] === kInitialize) {
      return;
    }
    throw new ERR_ILLEGAL_CONSTRUCTOR();
  }

  /**
   * @returns {number}
   */
  return _createClass(Navigator, [{
    key: "hardwareConcurrency",
    get: function () {
      _classPrivateFieldGet(_availableParallelism, this) ?? _classPrivateFieldSet(_availableParallelism, this, getAvailableParallelism());
      return _classPrivateFieldGet(_availableParallelism, this);
    }

    /**
     * @returns {LockManager}
     */
  }, {
    key: "locks",
    get: function () {
      _classPrivateFieldGet(_locks, this) ?? _classPrivateFieldSet(_locks, this, require('internal/locks').locks);
      return _classPrivateFieldGet(_locks, this);
    }

    /**
     * @returns {string}
     */
  }, {
    key: "language",
    get: function () {
      // The default locale might be changed dynamically, so always invoke the
      // binding.
      return getDefaultLocale() || 'en-US';
    }

    /**
     * @returns {Array<string>}
     */
  }, {
    key: "languages",
    get: function () {
      _classPrivateFieldGet(_languages, this) ?? _classPrivateFieldSet(_languages, this, ObjectFreeze([this.language]));
      return _classPrivateFieldGet(_languages, this);
    }

    /**
     * @returns {string}
     */
  }, {
    key: "userAgent",
    get: function () {
      _classPrivateFieldGet(_userAgent, this) ?? _classPrivateFieldSet(_userAgent, this, `Node.js/${StringPrototypeSlice(nodeVersion, 1, StringPrototypeIndexOf(nodeVersion, '.'))}`);
      return _classPrivateFieldGet(_userAgent, this);
    }

    /**
     * @returns {string}
     */
  }, {
    key: "platform",
    get: function () {
      _classPrivateFieldGet(_platform, this) ?? _classPrivateFieldSet(_platform, this, getNavigatorPlatform(arch, platform));
      return _classPrivateFieldGet(_platform, this);
    }
  }]);
}();
ObjectDefineProperties(Navigator.prototype, {
  hardwareConcurrency: kEnumerableProperty,
  language: kEnumerableProperty,
  languages: kEnumerableProperty,
  userAgent: kEnumerableProperty,
  platform: kEnumerableProperty,
  locks: kEnumerableProperty
});
module.exports = {
  getNavigatorPlatform,
  navigator: new Navigator(kInitialize),
  Navigator
};

