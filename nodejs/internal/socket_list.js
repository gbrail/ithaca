'use strict';

function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ERR_CHILD_CLOSED_BEFORE_REPLY
} = require('internal/errors').codes;
var EventEmitter = require('events');

// This object keeps track of the sockets that are sent
var SocketListSend = /*#__PURE__*/function (_EventEmitter) {
  function SocketListSend(child, key) {
    var _this;
    _classCallCheck(this, SocketListSend);
    _this = _callSuper(this, SocketListSend);
    _this.key = key;
    _this.child = child;
    child.once('exit', () => _this.emit('exit', _this));
    return _this;
  }
  _inherits(SocketListSend, _EventEmitter);
  return _createClass(SocketListSend, [{
    key: "_request",
    value: function _request(msg, cmd, swallowErrors, callback) {
      var self = this;
      if (!this.child.connected) return onclose();
      this.child._send(msg, undefined, swallowErrors);
      function onclose() {
        self.child.removeListener('internalMessage', onreply);
        callback(new ERR_CHILD_CLOSED_BEFORE_REPLY());
      }
      function onreply(msg) {
        if (!(msg.cmd === cmd && msg.key === self.key)) return;
        self.child.removeListener('disconnect', onclose);
        self.child.removeListener('internalMessage', onreply);
        callback(null, msg);
      }
      this.child.once('disconnect', onclose);
      this.child.on('internalMessage', onreply);
    }
  }, {
    key: "close",
    value: function close(callback) {
      this._request({
        cmd: 'NODE_SOCKET_NOTIFY_CLOSE',
        key: this.key
      }, 'NODE_SOCKET_ALL_CLOSED', true, callback);
    }
  }, {
    key: "getConnections",
    value: function getConnections(callback) {
      this._request({
        cmd: 'NODE_SOCKET_GET_COUNT',
        key: this.key
      }, 'NODE_SOCKET_COUNT', false, (err, msg) => {
        if (err) return callback(err);
        callback(null, msg.count);
      });
    }
  }]);
}(EventEmitter); // This object keeps track of the sockets that are received
var SocketListReceive = /*#__PURE__*/function (_EventEmitter2) {
  function SocketListReceive(child, key) {
    var _this2;
    _classCallCheck(this, SocketListReceive);
    _this2 = _callSuper(this, SocketListReceive);
    _this2.connections = 0;
    _this2.key = key;
    _this2.child = child;
    function onempty(self) {
      if (!self.child.connected) return;
      self.child._send({
        cmd: 'NODE_SOCKET_ALL_CLOSED',
        key: self.key
      }, undefined, true);
    }
    _this2.child.on('internalMessage', msg => {
      if (msg.key !== _this2.key) return;
      if (msg.cmd === 'NODE_SOCKET_NOTIFY_CLOSE') {
        // Already empty
        if (_this2.connections === 0) return onempty(_this2);

        // Wait for sockets to get closed
        _this2.once('empty', onempty);
      } else if (msg.cmd === 'NODE_SOCKET_GET_COUNT') {
        if (!_this2.child.connected) return;
        _this2.child._send({
          cmd: 'NODE_SOCKET_COUNT',
          key: _this2.key,
          count: _this2.connections
        });
      }
    });
    return _this2;
  }
  _inherits(SocketListReceive, _EventEmitter2);
  return _createClass(SocketListReceive, [{
    key: "add",
    value: function add(obj) {
      this.connections++;

      // Notify the previous owner of the socket about its state change
      obj.socket.once('close', () => {
        this.connections--;
        if (this.connections === 0) this.emit('empty', this);
      });
    }
  }]);
}(EventEmitter);
module.exports = {
  SocketListSend,
  SocketListReceive
};

