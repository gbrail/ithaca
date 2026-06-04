'use strict';

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
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
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
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
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypePop,
  ArrayPrototypeShift,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  Boolean,
  RegExpPrototypeSymbolSplit,
  StringPrototypeStartsWith,
  StringPrototypeTrim,
  Symbol: _Symbol
} = primordials;
var {
  validateNumber,
  validateArray
} = require('internal/validators');
var path = require('path');
var fs = require('fs');
var os = require('os');
var debug = require('internal/util/debuglog').debuglog('repl', fn => {
  debug = fn;
});
var permission = require('internal/process/permission');
var {
  clearTimeout,
  setTimeout
} = require('timers');
var {
  reverseString
} = require('internal/readline/utils');

// The debounce is to guard against code pasted into the REPL.
var kDebounceHistoryMS = 15;
var kHistorySize = 30;

// Class fields
var kTimer = _Symbol('_kTimer');
var kWriting = _Symbol('_kWriting');
var kPending = _Symbol('_kPending');
var kRemoveHistoryDuplicates = _Symbol('_kRemoveHistoryDuplicates');
var kHistoryHandle = _Symbol('_kHistoryHandle');
var kHistoryPath = _Symbol('_kHistoryPath');
var kContext = _Symbol('_kContext');
var kIsFlushing = _Symbol('_kIsFlushing');
var kHistory = _Symbol('_kHistory');
var kSize = _Symbol('_kSize');
var kIndex = _Symbol('_kIndex');

// Class methods
var kNormalizeLineEndings = _Symbol('_kNormalizeLineEndings');
var kWriteToOutput = _Symbol('_kWriteToOutput');
var kOnLine = _Symbol('_kOnLine');
var kOnExit = _Symbol('_kOnExit');
var kInitializeHistory = _Symbol('_kInitializeHistory');
var kHandleHistoryInitError = _Symbol('_kHandleHistoryInitError');
var kHasWritePermission = _Symbol('_kHasWritePermission');
var kValidateOptions = _Symbol('_kValidateOptions');
var kResolveHistoryPath = _Symbol('_kResolveHistoryPath');
var kReplHistoryMessage = _Symbol('_kReplHistoryMessage');
var kFlushHistory = _Symbol('_kFlushHistory');
var kGetHistoryPath = _Symbol('_kGetHistoryPath');
var kCloseHandle = _Symbol('_kCloseHandle');
var ReplHistory = /*#__PURE__*/function () {
  function ReplHistory(context, options) {
    _classCallCheck(this, ReplHistory);
    this[kValidateOptions](options);
    this[kHistoryPath] = ReplHistory[kGetHistoryPath](options);
    this[kContext] = context;
    this[kTimer] = null;
    this[kWriting] = false;
    this[kPending] = false;
    this[kRemoveHistoryDuplicates] = options.removeHistoryDuplicates || false;
    this[kHistoryHandle] = null;
    this[kIsFlushing] = false;
    this[kSize] = options.size ?? context.historySize ?? kHistorySize;
    this[kHistory] = options.history ?? [];
    this[kIndex] = -1;
  }
  return _createClass(ReplHistory, [{
    key: "initialize",
    value: function initialize(onReadyCallback) {
      // Empty string disables persistent history
      if (this[kHistoryPath] === '') {
        // Save a reference to the context's original _historyPrev
        this.historyPrev = this[kContext]._historyPrev;
        this[kContext]._historyPrev = this[kReplHistoryMessage].bind(this);
        return onReadyCallback(null, this[kContext]);
      }
      var resolvedPath = this[kResolveHistoryPath]();
      if (!resolvedPath) {
        ReplHistory[kWriteToOutput](this[kContext], '\nError: Could not get the home directory.\n' + 'REPL session history will not be persisted.\n');

        // Save a reference to the context's original _historyPrev
        this.historyPrev = this[kContext]._historyPrev;
        this[kContext]._historyPrev = this[kReplHistoryMessage].bind(this);
        return onReadyCallback(null, this[kContext]);
      }
      if (!this[kHasWritePermission]()) {
        ReplHistory[kWriteToOutput](this[kContext], '\nAccess to FileSystemWrite is restricted.\n' + 'REPL session history will not be persisted.\n');
        return onReadyCallback(null, this[kContext]);
      }
      this[kContext].pause();
      this[kInitializeHistory](onReadyCallback).catch(err => {
        this[kHandleHistoryInitError](err, onReadyCallback);
      });
    }
  }, {
    key: "addHistory",
    value: function addHistory(isMultiline, lastCommandErrored) {
      var line = this[kContext].line;
      if (line.length === 0) return '';

      // If the history is disabled then return the line
      if (this[kSize] === 0) return line;

      // If the trimmed line is empty then return the line
      if (StringPrototypeTrim(line).length === 0) return line;

      // This is necessary because each line would be saved in the history while creating
      // a new multiline, and we don't want that.
      if (isMultiline && this[kIndex] === -1) {
        ArrayPrototypeShift(this[kHistory]);
      } else if (lastCommandErrored) {
        // If the last command errored and we are trying to edit the history to fix it
        // remove the broken one from the history
        ArrayPrototypeShift(this[kHistory]);
      }
      var normalizedLine = ReplHistory[kNormalizeLineEndings](line, '\n', '\r');
      if (this[kHistory].length === 0 || this[kHistory][0] !== normalizedLine) {
        if (this[kRemoveHistoryDuplicates]) {
          // Remove older history line if identical to new one
          var dupIndex = ArrayPrototypeIndexOf(this[kHistory], normalizedLine);
          if (dupIndex !== -1) ArrayPrototypeSplice(this[kHistory], dupIndex, 1);
        }

        // Add the new line to the history
        ArrayPrototypeUnshift(this[kHistory], normalizedLine);

        // Only store so many
        if (this[kHistory].length > this[kSize]) ArrayPrototypePop(this[kHistory]);
      }
      this[kIndex] = -1;
      var finalLine = isMultiline ? reverseString(this[kHistory][0]) : this[kHistory][0];

      // The listener could change the history object, possibly
      // to remove the last added entry if it is sensitive and should
      // not be persisted in the history, like a password
      // Emit history event to notify listeners of update
      this[kContext].emit('history', this[kHistory]);
      return finalLine;
    }
  }, {
    key: "canNavigateToNext",
    value: function canNavigateToNext() {
      return this[kIndex] > -1 && this[kHistory].length > 0;
    }
  }, {
    key: "navigateToNext",
    value: function navigateToNext(substringSearch) {
      if (!this.canNavigateToNext()) {
        return null;
      }
      var search = substringSearch || '';
      var index = this[kIndex] - 1;
      while (index >= 0 && (!StringPrototypeStartsWith(this[kHistory][index], search) || this[kContext].line === this[kHistory][index])) {
        index--;
      }
      this[kIndex] = index;
      if (index === -1) {
        return search;
      }
      return ReplHistory[kNormalizeLineEndings](this[kHistory][index], '\r', '\n');
    }
  }, {
    key: "canNavigateToPrevious",
    value: function canNavigateToPrevious() {
      return this[kHistory].length !== this[kIndex] && this[kHistory].length > 0;
    }
  }, {
    key: "navigateToPrevious",
    value: function navigateToPrevious() {
      var substringSearch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      if (!this.canNavigateToPrevious()) {
        return null;
      }
      var search = substringSearch || '';
      var index = this[kIndex] + 1;
      while (index < this[kHistory].length && (!StringPrototypeStartsWith(this[kHistory][index], search) || this[kContext].line === this[kHistory][index])) {
        index++;
      }
      this[kIndex] = index;
      if (index === this[kHistory].length) {
        return search;
      }
      return ReplHistory[kNormalizeLineEndings](this[kHistory][index], '\r', '\n');
    }
  }, {
    key: "size",
    get: function () {
      return this[kSize];
    }
  }, {
    key: "isFlushing",
    get: function () {
      return this[kIsFlushing];
    }
  }, {
    key: "history",
    get: function () {
      return this[kHistory];
    },
    set: function (value) {
      this[kHistory] = value;
    }
  }, {
    key: "index",
    get: function () {
      return this[kIndex];
    },
    set: function (value) {
      this[kIndex] = value;
    }

    // Start private methods
  }, {
    key: kResolveHistoryPath,
    value: function () {
      if (!this[kHistoryPath]) {
        try {
          this[kHistoryPath] = path.join(os.homedir(), '.node_repl_history');
          return this[kHistoryPath];
        } catch (err) {
          debug(err.stack);
          return null;
        }
      }
      return this[kHistoryPath];
    }
  }, {
    key: kHasWritePermission,
    value: function () {
      return !(permission.isEnabled() && permission.has('fs.write', this[kHistoryPath]) === false);
    }
  }, {
    key: kValidateOptions,
    value: function (options) {
      if (typeof options.history !== 'undefined') {
        validateArray(options.history, 'history');
      }
      if (typeof options.size !== 'undefined') {
        validateNumber(options.size, 'size', 0);
      }
    }
  }, {
    key: kInitializeHistory,
    value: _async(function (onReadyCallback) {
      var _this = this;
      return _catch(function () {
        // Open and close file first to ensure it exists
        // History files are conventionally not readable by others
        // 0o0600 = read/write for owner only
        return _await(fs.promises.open(_this[kHistoryPath], 'a+', 0o0600), function (hnd) {
          return _await(hnd.close(), function () {
            var _exit = false;
            var data;
            return _continue(_catch(function () {
              return _await(fs.promises.readFile(_this[kHistoryPath], 'utf8'), function (_fs$promises$readFile) {
                data = _fs$promises$readFile;
              });
            }, function (err) {
              var _this$kHandleHistoryI = _this[kHandleHistoryInitError](err, onReadyCallback);
              _exit = true;
              return _this$kHandleHistoryI;
            }), function (_result2) {
              if (_exit) return _result2;
              if (data) {
                _this[kHistory] = RegExpPrototypeSymbolSplit(/\r?\n+/, data, _this[kSize]);
              } else {
                _this[kHistory] = [];
              }
              validateArray(_this[kHistory], 'history');
              return _await(fs.promises.open(_this[kHistoryPath], 'r+'), function (handle) {
                _this[kHistoryHandle] = handle;
                return _await(handle.truncate(0), function () {
                  _this[kContext].on('line', _this[kOnLine].bind(_this));
                  _this[kContext].once('exit', _this[kOnExit].bind(_this));
                  _this[kContext].once('flushHistory', () => {
                    if (!_this[kContext].closed) {
                      _this[kContext].resume();
                      onReadyCallback(null, _this[kContext]);
                    }
                  });
                  return _awaitIgnored(_this[kFlushHistory]());
                });
              });
            });
          });
        });
      }, function (err) {
        return _await(_this[kCloseHandle](), function () {
          return _this[kHandleHistoryInitError](err, onReadyCallback);
        });
      });
    })
  }, {
    key: kHandleHistoryInitError,
    value: function (err, onReadyCallback) {
      // Cannot open history file.
      // Don't crash, just don't persist history.
      ReplHistory[kWriteToOutput](this[kContext], '\nError: Could not open history file.\n' + 'REPL session history will not be persisted.\n');
      debug(err.stack);

      // Save a reference to the context's original _historyPrev
      this.historyPrev = this[kContext]._historyPrev;
      this[kContext]._historyPrev = this[kReplHistoryMessage].bind(this);
      this[kContext].resume();
      return onReadyCallback(null, this[kContext]);
    }
  }, {
    key: kOnLine,
    value: function () {
      this[kIsFlushing] = true;
      if (this[kTimer]) {
        clearTimeout(this[kTimer]);
      }
      this[kTimer] = setTimeout(() => this[kFlushHistory](), kDebounceHistoryMS);
    }
  }, {
    key: kFlushHistory,
    value: _async(function () {
      var _this2 = this;
      _this2[kTimer] = null;
      if (_this2[kWriting]) {
        _this2[kPending] = true;
        return;
      }
      _this2[kWriting] = true;
      var historyData = ArrayPrototypeJoin(_this2[kHistory], '\n');
      return _continueIgnored(_catch(function () {
        return _await(_this2[kHistoryHandle].write(historyData, 0, 'utf8'), function () {
          _this2[kWriting] = false;
          if (_this2[kPending]) {
            _this2[kPending] = false;
            _this2[kOnLine]();
          } else {
            _this2[kIsFlushing] = Boolean(_this2[kTimer]);
            if (!_this2[kIsFlushing]) {
              _this2[kContext].emit('flushHistory');
            }
          }
        });
      }, function (err) {
        _this2[kWriting] = false;
        debug('Error writing history file:', err);
      }));
    })
  }, {
    key: kOnExit,
    value: _async(function () {
      var _this3 = this;
      if (_this3[kIsFlushing]) {
        _this3[kContext].once('flushHistory', _this3[kOnExit].bind(_this3));
        return;
      }
      _this3[kContext].off('line', _this3[kOnLine].bind(_this3));
      return _awaitIgnored(_this3[kCloseHandle]());
    })
  }, {
    key: kCloseHandle,
    value: _async(function () {
      var _this4 = this;
      return _invokeIgnored(function () {
        if (_this4[kHistoryHandle] !== null) {
          var handle = _this4[kHistoryHandle];
          _this4[kHistoryHandle] = null;
          return _continueIgnored(_catch(function () {
            return _awaitIgnored(handle.close());
          }, function (err) {
            debug('Error closing history file:', err);
          }));
        }
      });
    })
    /**
     * Closes the history file handle.
     * @returns {Promise<void>}
     */
  }, {
    key: "closeHandle",
    value: function closeHandle() {
      return this[kCloseHandle]();
    }
  }, {
    key: kReplHistoryMessage,
    value: function () {
      if (this[kHistory].length === 0) {
        ReplHistory[kWriteToOutput](this[kContext], '\nPersistent history support disabled. ' + 'Set the NODE_REPL_HISTORY environment\nvariable to ' + 'a valid, user-writable path to enable.\n');
      }
      // First restore the original method on the context
      this[kContext]._historyPrev = this.historyPrev;
      // Then call it with the correct context
      return this[kContext]._historyPrev();
    }
  }], [{
    key: kGetHistoryPath,
    value: function (options) {
      var historyPath = options.filePath;
      if (typeof historyPath === 'string') {
        historyPath = StringPrototypeTrim(historyPath);
      }
      return historyPath;
    }
  }, {
    key: kNormalizeLineEndings,
    value: function (line, from, to) {
      // Multiline history entries are saved reversed
      // History is structured with the newest entries at the top
      // and the oldest at the bottom. Multiline histories, however, only occupy
      // one line in the history file. When loading multiline history with
      // an old node binary, the history will be saved in the old format.
      // This is why we need to reverse the multilines.
      // Reversing the multilines is necessary when adding / editing and displaying them
      return reverseString(line, from, to);
    }
  }, {
    key: kWriteToOutput,
    value: function (context, message) {
      if (typeof context._writeToOutput === 'function') {
        context._writeToOutput(message);
        if (typeof context._refreshLine === 'function') {
          context._refreshLine();
        }
      }
    }
  }]);
}();
module.exports = {
  ReplHistory
};

