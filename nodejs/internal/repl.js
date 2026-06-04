'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  Number: _Number,
  NumberIsNaN,
  NumberParseInt
} = primordials;
var REPL = require('repl');
var {
  kStandaloneREPL
} = require('internal/repl/utils');
module.exports = {
  __proto__: REPL
};
module.exports.createInternalRepl = createRepl;
function createRepl(env, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = null;
  }
  opts = _objectSpread({
    [kStandaloneREPL]: true,
    ignoreUndefined: false,
    useGlobal: true,
    breakEvalOnSigint: true
  }, opts);
  if (NumberParseInt(env.NODE_NO_READLINE)) {
    opts.terminal = false;
  }
  if (env.NODE_REPL_MODE) {
    opts.replMode = {
      'strict': REPL.REPL_MODE_STRICT,
      'sloppy': REPL.REPL_MODE_SLOPPY
    }[env.NODE_REPL_MODE.toLowerCase().trim()];
  }
  if (opts.replMode === undefined) {
    opts.replMode = REPL.REPL_MODE_SLOPPY;
  }
  var size = _Number(env.NODE_REPL_HISTORY_SIZE);
  if (!NumberIsNaN(size) && size > 0) {
    opts.size = size;
  } else {
    opts.size = 1000;
  }
  var term = 'terminal' in opts ? opts.terminal : process.stdout.isTTY;
  opts.filePath = term ? env.NODE_REPL_HISTORY : '';
  var repl = REPL.start(opts);
  repl.setupHistory({
    filePath: opts.filePath,
    size: opts.size,
    onHistoryFileLoaded: cb
  });
}

