'use strict';

function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var {
  SymbolFor
} = primordials;
var MessageEvent = /*#__PURE__*/_createClass(function MessageEvent(data, target, type, ports) {
  _classCallCheck(this, MessageEvent);
  this.data = data;
  this.target = target;
  this.type = type;
  this.ports = ports ?? [];
});
var kHybridDispatch = SymbolFor('nodejs.internal.kHybridDispatch');
var kCurrentlyReceivingPorts = SymbolFor('nodejs.internal.kCurrentlyReceivingPorts');
exports.emitMessage = function (data, ports, type) {
  if (typeof this[kHybridDispatch] === 'function') {
    this[kCurrentlyReceivingPorts] = ports;
    try {
      this[kHybridDispatch](data, type, undefined);
    } finally {
      this[kCurrentlyReceivingPorts] = undefined;
    }
    return;
  }
  var event = new MessageEvent(data, this, type, ports);
  if (type === 'message') {
    if (typeof this.onmessage === 'function') this.onmessage(event);
  } else {
    // eslint-disable-next-line no-lonely-if
    if (typeof this.onmessageerror === 'function') this.onmessageerror(event);
  }
};

