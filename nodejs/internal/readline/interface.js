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
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
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
  ArrayFrom,
  ArrayPrototypeFilter,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypeReverse,
  ArrayPrototypeShift,
  ArrayPrototypeUnshift,
  DateNow,
  FunctionPrototypeCall,
  MathCeil,
  MathFloor,
  MathMax,
  MathMaxApply,
  NumberIsFinite,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  RegExpPrototypeExec,
  SafeStringIterator,
  StringPrototypeCodePointAt,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  StringPrototypeRepeat,
  StringPrototypeReplaceAll,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  Symbol: _Symbol,
  SymbolAsyncIterator,
  SymbolDispose
} = primordials;
var {
  AbortError,
  codes: {
    ERR_INVALID_ARG_VALUE,
    ERR_USE_AFTER_CLOSE
  }
} = require('internal/errors');
var {
  validateAbortSignal,
  validateString,
  validateUint32
} = require('internal/validators');
var {
  assignFunctionName,
  kEmptyObject
} = require('internal/util');
var {
  inspect,
  getStringWidth,
  stripVTControlCharacters
} = require('internal/util/inspect');
var EventEmitter = require('events');
var {
  addAbortListener
} = require('internal/events/abort_listener');
var {
  charLengthAt,
  charLengthLeft,
  commonPrefix,
  kSubstringSearch
} = require('internal/readline/utils');
var emitKeypressEvents;
var kFirstEventParam;
var {
  clearScreenDown,
  cursorTo,
  moveCursor
} = require('internal/readline/callbacks');
var {
  StringDecoder
} = require('string_decoder');
var {
  ReplHistory
} = require('internal/repl/history');
var kMaxUndoRedoStackSize = 2048;
var kMincrlfDelay = 100;
/**
 * The end of a line is signaled by either one of the following:
 *  - \r\n
 *  - \n
 *  - \r followed by something other than \n
 *  - \u2028 (Unicode 'LINE SEPARATOR')
 *  - \u2029 (Unicode 'PARAGRAPH SEPARATOR')
 */
var lineEnding = /\r?\n|\r(?!\n)|\u2028|\u2029/g;
var kLineObjectStream = _Symbol('line object stream');
var kQuestionCancel = _Symbol('kQuestionCancel');
var kQuestion = _Symbol('kQuestion');

// GNU readline library - keyseq-timeout is 500ms (default)
var ESCAPE_CODE_TIMEOUT = 500;

// Max length of the kill ring
var kMaxLengthOfKillRing = 32;
var kMultilinePrompt = _Symbol('| ');
var kAddHistory = _Symbol('_addHistory');
var kBeforeEdit = _Symbol('_beforeEdit');
var kDecoder = _Symbol('_decoder');
var kDeleteLeft = _Symbol('_deleteLeft');
var kDeleteLineLeft = _Symbol('_deleteLineLeft');
var kDeleteLineRight = _Symbol('_deleteLineRight');
var kDeleteRight = _Symbol('_deleteRight');
var kDeleteWordLeft = _Symbol('_deleteWordLeft');
var kDeleteWordRight = _Symbol('_deleteWordRight');
var kGetDisplayPos = _Symbol('_getDisplayPos');
var kHistoryNext = _Symbol('_historyNext');
var kMoveDownOrHistoryNext = _Symbol('_moveDownOrHistoryNext');
var kHistoryPrev = _Symbol('_historyPrev');
var kMoveUpOrHistoryPrev = _Symbol('_moveUpOrHistoryPrev');
var kInsertString = _Symbol('_insertString');
var kLine = _Symbol('_line');
var kLine_buffer = _Symbol('_line_buffer');
var kKillRing = _Symbol('_killRing');
var kKillRingCursor = _Symbol('_killRingCursor');
var kMoveCursor = _Symbol('_moveCursor');
var kNormalWrite = _Symbol('_normalWrite');
var kOldPrompt = _Symbol('_oldPrompt');
var kOnLine = _Symbol('_onLine');
var kSetLine = _Symbol('_setLine');
var kPreviousKey = _Symbol('_previousKey');
var kPrompt = _Symbol('_prompt');
var kPushToKillRing = _Symbol('_pushToKillRing');
var kPushToUndoStack = _Symbol('_pushToUndoStack');
var kQuestionCallback = _Symbol('_questionCallback');
var kLastCommandErrored = _Symbol('_lastCommandErrored');
var kQuestionReject = _Symbol('_questionReject');
var kRedo = _Symbol('_redo');
var kRedoStack = _Symbol('_redoStack');
var kRefreshLine = _Symbol('_refreshLine');
var kSawKeyPress = _Symbol('_sawKeyPress');
var kSawReturnAt = _Symbol('_sawReturnAt');
var kSetRawMode = _Symbol('_setRawMode');
var kTabComplete = _Symbol('_tabComplete');
var kTabCompleter = _Symbol('_tabCompleter');
var kTtyWrite = _Symbol('_ttyWrite');
var kUndo = _Symbol('_undo');
var kUndoStack = _Symbol('_undoStack');
var kIsMultiline = _Symbol('_isMultiline');
var kWordLeft = _Symbol('_wordLeft');
var kWordRight = _Symbol('_wordRight');
var kWriteToOutput = _Symbol('_writeToOutput');
var kYank = _Symbol('_yank');
var kYanking = _Symbol('_yanking');
var kYankPop = _Symbol('_yankPop');
var kSavePreviousState = _Symbol('_savePreviousState');
var kRestorePreviousState = _Symbol('_restorePreviousState');
var kPreviousLine = _Symbol('_previousLine');
var kPreviousCursor = _Symbol('_previousCursor');
var kPreviousCursorCols = _Symbol('_previousCursorCols');
var kMultilineMove = _Symbol('_multilineMove');
var kPreviousPrevRows = _Symbol('_previousPrevRows');
var kAddNewLineOnTTY = _Symbol('_addNewLineOnTTY');
function InterfaceConstructor(input, output, completer, terminal) {
  this[kSawReturnAt] = 0;
  // TODO(BridgeAR): Document this property. The name is not ideal, so we
  // might want to expose an alias and document that instead.
  this.isCompletionEnabled = true;
  this[kSawKeyPress] = false;
  this[kPreviousKey] = null;
  this.escapeCodeTimeout = ESCAPE_CODE_TIMEOUT;
  this.tabSize = 8;
  FunctionPrototypeCall(EventEmitter, this);
  var crlfDelay;
  var prompt = '> ';
  var signal;
  if (input?.input) {
    // An options object was given
    output = input.output;
    completer = input.completer;
    terminal = input.terminal;
    signal = input.signal;

    // It is possible to configure the history through the input object
    var historySize = input.historySize;
    var history = input.history;
    var removeHistoryDuplicates = input.removeHistoryDuplicates;
    if (input.tabSize !== undefined) {
      validateUint32(input.tabSize, 'tabSize', true);
      this.tabSize = input.tabSize;
    }
    if (input.prompt !== undefined) {
      prompt = input.prompt;
    }
    if (input.escapeCodeTimeout !== undefined) {
      if (NumberIsFinite(input.escapeCodeTimeout)) {
        this.escapeCodeTimeout = input.escapeCodeTimeout;
      } else {
        throw new ERR_INVALID_ARG_VALUE('input.escapeCodeTimeout', this.escapeCodeTimeout);
      }
    }
    if (signal) {
      validateAbortSignal(signal, 'options.signal');
    }
    crlfDelay = input.crlfDelay;
    input = input.input;
    input.size = historySize;
    input.history = history;
    input.removeHistoryDuplicates = removeHistoryDuplicates;
  }
  this.setupHistoryManager(input);
  if (completer !== undefined && typeof completer !== 'function') {
    throw new ERR_INVALID_ARG_VALUE('completer', completer);
  }

  // Backwards compat; check the isTTY prop of the output stream
  //  when `terminal` was not specified
  if (terminal === undefined && !(output === null || output === undefined)) {
    terminal = !!output.isTTY;
  }
  var self = this;
  this.line = '';
  this[kIsMultiline] = false;
  this[kSubstringSearch] = null;
  this.output = output;
  this.input = input;
  this[kUndoStack] = [];
  this[kRedoStack] = [];
  this[kPreviousCursorCols] = -1;

  // The kill ring is a global list of blocks of text that were previously
  // killed (deleted). If its size exceeds kMaxLengthOfKillRing, the oldest
  // element will be removed to make room for the latest deletion. With kill
  // ring, users are able to recall (yank) or cycle (yank pop) among previously
  // killed texts, quite similar to the behavior of Emacs.
  this[kKillRing] = [];
  this[kKillRingCursor] = 0;
  this.crlfDelay = crlfDelay ? MathMax(kMincrlfDelay, crlfDelay) : kMincrlfDelay;
  this.completer = completer;
  this.setPrompt(prompt);
  this.terminal = !!terminal;
  function onerror(err) {
    self.emit('error', err);
  }
  function ondata(data) {
    self[kNormalWrite](data);
  }
  function onend() {
    if (typeof self[kLine_buffer] === 'string' && self[kLine_buffer].length > 0) {
      self.emit('line', self[kLine_buffer]);
    }
    self.close();
  }
  function ontermend() {
    if (typeof self.line === 'string' && self.line.length > 0) {
      self.emit('line', self.line);
    }
    self.close();
  }
  function onkeypress(s, key) {
    self[kTtyWrite](s, key);
    if (key?.sequence) {
      // If the key.sequence is half of a surrogate pair
      // (>= 0xd800 and <= 0xdfff), refresh the line so
      // the character is displayed appropriately.
      var ch = StringPrototypeCodePointAt(key.sequence, 0);
      if (ch >= 0xd800 && ch <= 0xdfff) self[kRefreshLine]();
    }
  }
  function onresize() {
    self[kRefreshLine]();
  }
  this[kLineObjectStream] = undefined;
  input.on('error', onerror);
  if (!this.terminal) {
    function onSelfCloseWithoutTerminal() {
      input.removeListener('data', ondata);
      input.removeListener('error', onerror);
      input.removeListener('end', onend);
    }
    input.on('data', ondata);
    input.on('end', onend);
    self.once('close', onSelfCloseWithoutTerminal);
    this[kDecoder] = new StringDecoder('utf8');
  } else {
    function onSelfCloseWithTerminal() {
      input.removeListener('keypress', onkeypress);
      input.removeListener('error', onerror);
      input.removeListener('end', ontermend);
      if (output !== null && output !== undefined) {
        output.removeListener('resize', onresize);
      }
    }
    emitKeypressEvents ??= require('internal/readline/emitKeypressEvents');
    emitKeypressEvents(input, this);

    // `input` usually refers to stdin
    input.on('keypress', onkeypress);
    input.on('end', ontermend);
    this[kSetRawMode](true);
    this.terminal = true;

    // Cursor position on the line.
    this.cursor = 0;
    if (output !== null && output !== undefined) output.on('resize', onresize);
    self.once('close', onSelfCloseWithTerminal);
  }
  if (signal) {
    var onAborted = () => self.close();
    if (signal.aborted) {
      process.nextTick(onAborted);
    } else {
      var disposable = addAbortListener(signal, onAborted);
      self.once('close', disposable[SymbolDispose]);
    }
  }

  // Current line
  this[kSetLine]('');
  input.resume();
}
ObjectSetPrototypeOf(InterfaceConstructor.prototype, EventEmitter.prototype);
ObjectSetPrototypeOf(InterfaceConstructor, EventEmitter);
var Interface = /*#__PURE__*/function (_InterfaceConstructor) {
  function Interface() {
    _classCallCheck(this, Interface);
    return _callSuper(this, Interface, arguments);
  }
  _inherits(Interface, _InterfaceConstructor);
  return _createClass(Interface, [{
    key: "columns",
    get: function () {
      if (this.output?.columns) return this.output.columns;
      return Infinity;
    }

    /**
     * Sets the prompt written to the output.
     * @param {string} prompt
     * @returns {void}
     */
  }, {
    key: "setPrompt",
    value: function setPrompt(prompt) {
      this[kPrompt] = prompt;
    }

    /**
     * Returns the current prompt used by `rl.prompt()`.
     * @returns {string}
     */
  }, {
    key: "getPrompt",
    value: function getPrompt() {
      return this[kPrompt];
    }
  }, {
    key: "setupHistoryManager",
    value: function setupHistoryManager(options) {
      this.historyManager = new ReplHistory(this, options);
      if (options.onHistoryFileLoaded) {
        this.historyManager.initialize(options.onHistoryFileLoaded);
      }
      ObjectDefineProperty(this, 'history', {
        __proto__: null,
        configurable: true,
        enumerable: true,
        get() {
          return this.historyManager.history;
        },
        set(newHistory) {
          return this.historyManager.history = newHistory;
        }
      });
      ObjectDefineProperty(this, 'historyIndex', {
        __proto__: null,
        configurable: true,
        enumerable: true,
        get() {
          return this.historyManager.index;
        },
        set(historyIndex) {
          return this.historyManager.index = historyIndex;
        }
      });
      ObjectDefineProperty(this, 'historySize', {
        __proto__: null,
        configurable: true,
        enumerable: true,
        get() {
          return this.historyManager.size;
        }
      });
      ObjectDefineProperty(this, 'isFlushing', {
        __proto__: null,
        configurable: true,
        enumerable: true,
        get() {
          return this.historyManager.isFlushing;
        }
      });
    }
  }, {
    key: kSetRawMode,
    value: function (mode) {
      var wasInRawMode = this.input.isRaw;
      if (typeof this.input.setRawMode === 'function') {
        this.input.setRawMode(mode);
      }
      return wasInRawMode;
    }

    /**
     * Writes the configured `prompt` to a new line in `output`.
     * @param {boolean} [preserveCursor]
     * @returns {void}
     */
  }, {
    key: "prompt",
    value: function prompt(preserveCursor) {
      if (this.paused) this.resume();
      if (this.terminal && process.env.TERM !== 'dumb') {
        if (!preserveCursor) this.cursor = 0;
        this[kRefreshLine]();
      } else {
        this[kWriteToOutput](this[kPrompt]);
      }
    }
  }, {
    key: kQuestion,
    value: function (query, cb) {
      if (this.closed) {
        throw new ERR_USE_AFTER_CLOSE('readline');
      }
      if (this[kQuestionCallback]) {
        this.prompt();
      } else {
        this[kOldPrompt] = this[kPrompt];
        this.setPrompt(query);
        this[kQuestionCallback] = cb;
        this.prompt();
      }
    }
  }, {
    key: kSetLine,
    value: function () {
      var line = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      this.line = line;
      this[kIsMultiline] = StringPrototypeIncludes(line, '\n');
    }
  }, {
    key: kOnLine,
    value: function (line) {
      if (this[kQuestionCallback]) {
        var cb = this[kQuestionCallback];
        this[kQuestionCallback] = null;
        this.setPrompt(this[kOldPrompt]);
        cb(line);
      } else {
        this.emit('line', line);
      }
    }
  }, {
    key: kBeforeEdit,
    value: function (oldText, oldCursor) {
      this[kPushToUndoStack](oldText, oldCursor);
    }
  }, {
    key: kQuestionCancel,
    value: function () {
      if (this[kQuestionCallback]) {
        this[kQuestionCallback] = null;
        this.setPrompt(this[kOldPrompt]);
        this.clearLine();
      }
    }
  }, {
    key: kWriteToOutput,
    value: function (stringToWrite) {
      validateString(stringToWrite, 'stringToWrite');
      if (this.output !== null && this.output !== undefined) {
        this.output.write(stringToWrite);
      }
    }
  }, {
    key: kAddHistory,
    value: function () {
      return this.historyManager.addHistory(this[kIsMultiline], this[kLastCommandErrored]);
    }
  }, {
    key: kRefreshLine,
    value: function () {
      // line length
      var line = this[kPrompt] + this.line;
      var dispPos = this[kGetDisplayPos](line);
      var lineCols = dispPos.cols;
      var lineRows = dispPos.rows;

      // cursor position
      var cursorPos = this.getCursorPos();

      // First move to the bottom of the current line, based on cursor pos
      var prevRows = this.prevRows || 0;
      if (prevRows > 0) {
        moveCursor(this.output, 0, -prevRows);
      }

      // Cursor to left edge.
      cursorTo(this.output, 0);
      // erase data
      clearScreenDown(this.output);
      if (this[kIsMultiline]) {
        var lines = StringPrototypeSplit(this.line, '\n');
        // Write first line with normal prompt
        this[kWriteToOutput](this[kPrompt] + lines[0]);

        // For continuation lines, add the "|" prefix
        for (var i = 1; i < lines.length; i++) {
          this[kWriteToOutput](`\n${kMultilinePrompt.description}` + lines[i]);
        }
      } else {
        // Write the prompt and the current buffer content.
        this[kWriteToOutput](line);
      }

      // Force terminal to allocate a new line
      if (lineCols === 0) {
        this[kWriteToOutput](' ');
      }

      // Move cursor to original position.
      cursorTo(this.output, cursorPos.cols);
      var diff = lineRows - cursorPos.rows;
      if (diff > 0) {
        moveCursor(this.output, 0, -diff);
      }
      this.prevRows = cursorPos.rows;
    }

    /**
     * Closes the `readline.Interface` instance.
     * @returns {void}
     */
  }, {
    key: "close",
    value: function close() {
      if (this.closed) return;
      this.pause();
      if (this.terminal) {
        this[kSetRawMode](false);
      }
      this.closed = true;
      this.emit('close');
    }

    /**
     * Pauses the `input` stream.
     * @returns {void | Interface}
     */
  }, {
    key: "pause",
    value: function pause() {
      if (this.closed) {
        throw new ERR_USE_AFTER_CLOSE('readline');
      }
      if (this.paused) return;
      this.input.pause();
      this.paused = true;
      this.emit('pause');
      return this;
    }

    /**
     * Resumes the `input` stream if paused.
     * @returns {void | Interface}
     */
  }, {
    key: "resume",
    value: function resume() {
      if (this.closed) {
        throw new ERR_USE_AFTER_CLOSE('readline');
      }
      if (!this.paused) return;
      this.input.resume();
      this.paused = false;
      this.emit('resume');
      return this;
    }

    /**
     * Writes either `data` or a `key` sequence identified by
     * `key` to the `output`.
     * @param {string} d
     * @param {{
     *   ctrl?: boolean;
     *   meta?: boolean;
     *   shift?: boolean;
     *   name?: string;
     *   }} [key]
     * @returns {void}
     */
  }, {
    key: "write",
    value: function write(d, key) {
      if (this.closed) {
        throw new ERR_USE_AFTER_CLOSE('readline');
      }
      if (this.paused) this.resume();
      if (this.terminal) {
        this[kTtyWrite](d, key);
      } else {
        this[kNormalWrite](d);
      }
    }
  }, {
    key: kNormalWrite,
    value: function (b) {
      if (b === undefined) {
        return;
      }
      var string = this[kDecoder].write(b);
      if (this[kSawReturnAt] && DateNow() - this[kSawReturnAt] <= this.crlfDelay) {
        if (StringPrototypeCodePointAt(string) === 10) string = StringPrototypeSlice(string, 1);
        this[kSawReturnAt] = 0;
      }

      // Run test() on the new string chunk, not on the entire line buffer.
      var newPartContainsEnding = RegExpPrototypeExec(lineEnding, string);
      if (newPartContainsEnding !== null) {
        if (this[kLine_buffer]) {
          string = this[kLine_buffer] + string;
          this[kLine_buffer] = null;
          lineEnding.lastIndex = 0; // Start the search from the beginning of the string.
          newPartContainsEnding = RegExpPrototypeExec(lineEnding, string);
        }
        this[kSawReturnAt] = StringPrototypeEndsWith(string, '\r') ? DateNow() : 0;
        var indexes = [0, newPartContainsEnding.index, lineEnding.lastIndex];
        var nextMatch;
        while ((nextMatch = RegExpPrototypeExec(lineEnding, string)) !== null) {
          ArrayPrototypePush(indexes, nextMatch.index, lineEnding.lastIndex);
        }
        var lastIndex = indexes.length - 1;
        // Either '' or (conceivably) the unfinished portion of the next line
        this[kLine_buffer] = StringPrototypeSlice(string, indexes[lastIndex]);
        for (var i = 1; i < lastIndex; i += 2) {
          this[kOnLine](StringPrototypeSlice(string, indexes[i - 1], indexes[i]));
        }
      } else if (string) {
        // No newlines this time, save what we have for next time
        if (this[kLine_buffer]) {
          this[kLine_buffer] += string;
        } else {
          this[kLine_buffer] = string;
        }
      }
    }
  }, {
    key: kInsertString,
    value: function (c) {
      this[kBeforeEdit](this.line, this.cursor);
      if (!this.isCompletionEnabled) {
        if (this.cursor < this.line.length) {
          var beg = StringPrototypeSlice(this.line, 0, this.cursor);
          var end = StringPrototypeSlice(this.line, this.cursor, this.line.length);
          this.line = beg + c + end;
        } else {
          this.line += c;
        }
        this.cursor += c.length;
        this[kWriteToOutput](c);
        return;
      }
      if (this.cursor < this.line.length) {
        var _beg = StringPrototypeSlice(this.line, 0, this.cursor);
        var _end = StringPrototypeSlice(this.line, this.cursor, this.line.length);
        this[kSetLine](_beg + c + _end);
        this.cursor += c.length;
        this[kRefreshLine]();
      } else {
        var oldPos = this.getCursorPos();
        this.line += c;
        this.cursor += c.length;
        var newPos = this.getCursorPos();
        if (oldPos.rows < newPos.rows) {
          this[kRefreshLine]();
        } else {
          this[kWriteToOutput](c);
        }
      }
    }
  }, {
    key: kTabComplete,
    value: _async(function (lastKeypressWasTab) {
      var _exit = false;
      var _this = this;
      _this.pause();
      var string = StringPrototypeSlice(_this.line, 0, _this.cursor);
      var value;
      return _continue(_finallyRethrows(function () {
        return _catch(function () {
          return _await(_this.completer(string), function (_this$completer) {
            value = _this$completer;
          });
        }, function (err) {
          _this[kWriteToOutput](`Tab completion error: ${inspect(err)}`);
          _exit = true;
        });
      }, function (_wasThrown, _result) {
        _this.resume();
        return _rethrow(_wasThrown, _result);
      }), function (_result) {
        if (_exit) return _result;
        _this[kTabCompleter](lastKeypressWasTab, value);
      });
    })
  }, {
    key: kTabCompleter,
    value: function (lastKeypressWasTab, _ref) {
      var {
        0: completions,
        1: completeOn
      } = _ref;
      // Result and the text that was completed.

      if (!completions || completions.length === 0) {
        return;
      }

      // If there is a common prefix to all matches, then apply that portion.
      var prefix = commonPrefix(ArrayPrototypeFilter(completions, e => e !== ''));
      if (StringPrototypeStartsWith(prefix, completeOn) && prefix.length > completeOn.length) {
        this[kInsertString](StringPrototypeSlice(prefix, completeOn.length));
        return;
      } else if (!StringPrototypeStartsWith(completeOn, prefix)) {
        this[kSetLine](StringPrototypeSlice(this.line, 0, this.cursor - completeOn.length) + prefix + StringPrototypeSlice(this.line, this.cursor, this.line.length));
        this.cursor = this.cursor - completeOn.length + prefix.length;
        this[kRefreshLine]();
        return;
      }
      if (!lastKeypressWasTab) {
        return;
      }
      this[kBeforeEdit](this.line, this.cursor);

      // Apply/show completions.
      var completionsWidth = ArrayPrototypeMap(completions, e => getStringWidth(e));
      var width = MathMaxApply(completionsWidth) + 2; // 2 space padding
      var maxColumns = MathFloor(this.columns / width) || 1;
      if (maxColumns === Infinity) {
        maxColumns = 1;
      }
      var output = '\r\n';
      var lineIndex = 0;
      var whitespace = 0;
      for (var i = 0; i < completions.length; i++) {
        var completion = completions[i];
        if (completion === '' || lineIndex === maxColumns) {
          output += '\r\n';
          lineIndex = 0;
          whitespace = 0;
        } else {
          output += StringPrototypeRepeat(' ', whitespace);
        }
        if (completion !== '') {
          output += completion;
          whitespace = width - completionsWidth[i];
          lineIndex++;
        } else {
          output += '\r\n';
        }
      }
      if (lineIndex !== 0) {
        output += '\r\n\r\n';
      }
      this[kWriteToOutput](output);
      this[kRefreshLine]();
    }
  }, {
    key: kWordLeft,
    value: function () {
      if (this.cursor > 0) {
        // Reverse the string and match a word near beginning
        // to avoid quadratic time complexity
        var leading = StringPrototypeSlice(this.line, 0, this.cursor);
        var reversed = ArrayPrototypeJoin(ArrayPrototypeReverse(ArrayFrom(leading)), '');
        var match = RegExpPrototypeExec(/^\s*(?:[^\w\s]+|\w+)?/, reversed);
        this[kMoveCursor](-match[0].length);
      }
    }
  }, {
    key: kWordRight,
    value: function () {
      if (this.cursor < this.line.length) {
        var trailing = StringPrototypeSlice(this.line, this.cursor);
        var match = RegExpPrototypeExec(/^(?:\s+|[^\w\s]+|\w+)\s*/, trailing);
        this[kMoveCursor](match[0].length);
      }
    }
  }, {
    key: kDeleteLeft,
    value: function () {
      if (this.cursor > 0 && this.line.length > 0) {
        this[kBeforeEdit](this.line, this.cursor);
        // The number of UTF-16 units comprising the character to the left
        var charSize = charLengthLeft(this.line, this.cursor);
        this.line = StringPrototypeSlice(this.line, 0, this.cursor - charSize) + StringPrototypeSlice(this.line, this.cursor, this.line.length);
        this.cursor -= charSize;
        this[kRefreshLine]();
      }
    }
  }, {
    key: kDeleteRight,
    value: function () {
      if (this.cursor < this.line.length) {
        this[kBeforeEdit](this.line, this.cursor);
        // The number of UTF-16 units comprising the character to the left
        var charSize = charLengthAt(this.line, this.cursor);
        this.line = StringPrototypeSlice(this.line, 0, this.cursor) + StringPrototypeSlice(this.line, this.cursor + charSize, this.line.length);
        this[kRefreshLine]();
      }
    }
  }, {
    key: kDeleteWordLeft,
    value: function () {
      if (this.cursor > 0) {
        this[kBeforeEdit](this.line, this.cursor);
        // Reverse the string and match a word near beginning
        // to avoid quadratic time complexity
        var leading = StringPrototypeSlice(this.line, 0, this.cursor);
        var reversed = ArrayPrototypeJoin(ArrayPrototypeReverse(ArrayFrom(leading)), '');
        var match = RegExpPrototypeExec(/^\s*(?:[^\w\s]+|\w+)?/, reversed);
        leading = StringPrototypeSlice(leading, 0, leading.length - match[0].length);
        this.line = leading + StringPrototypeSlice(this.line, this.cursor, this.line.length);
        this.cursor = leading.length;
        this[kRefreshLine]();
      }
    }
  }, {
    key: kDeleteWordRight,
    value: function () {
      if (this.cursor < this.line.length) {
        this[kBeforeEdit](this.line, this.cursor);
        var trailing = StringPrototypeSlice(this.line, this.cursor);
        var match = RegExpPrototypeExec(/^(?:\s+|\W+|\w+)\s*/, trailing);
        this.line = StringPrototypeSlice(this.line, 0, this.cursor) + StringPrototypeSlice(trailing, match[0].length);
        this[kRefreshLine]();
      }
    }
  }, {
    key: kDeleteLineLeft,
    value: function () {
      this[kBeforeEdit](this.line, this.cursor);
      var del = StringPrototypeSlice(this.line, 0, this.cursor);
      this[kSetLine](StringPrototypeSlice(this.line, this.cursor));
      this.cursor = 0;
      this[kPushToKillRing](del);
      this[kRefreshLine]();
    }
  }, {
    key: kDeleteLineRight,
    value: function () {
      this[kBeforeEdit](this.line, this.cursor);
      var del = StringPrototypeSlice(this.line, this.cursor);
      this[kSetLine](StringPrototypeSlice(this.line, 0, this.cursor));
      this[kPushToKillRing](del);
      this[kRefreshLine]();
    }
  }, {
    key: kPushToKillRing,
    value: function (del) {
      if (!del || del === this[kKillRing][0]) return;
      ArrayPrototypeUnshift(this[kKillRing], del);
      this[kKillRingCursor] = 0;
      while (this[kKillRing].length > kMaxLengthOfKillRing) ArrayPrototypePop(this[kKillRing]);
    }
  }, {
    key: kYank,
    value: function () {
      if (this[kKillRing].length > 0) {
        this[kYanking] = true;
        this[kInsertString](this[kKillRing][this[kKillRingCursor]]);
      }
    }
  }, {
    key: kYankPop,
    value: function () {
      if (!this[kYanking]) {
        return;
      }
      if (this[kKillRing].length > 1) {
        var lastYank = this[kKillRing][this[kKillRingCursor]];
        this[kKillRingCursor]++;
        if (this[kKillRingCursor] >= this[kKillRing].length) {
          this[kKillRingCursor] = 0;
        }
        var currentYank = this[kKillRing][this[kKillRingCursor]];
        var head = StringPrototypeSlice(this.line, 0, this.cursor - lastYank.length);
        var tail = StringPrototypeSlice(this.line, this.cursor);
        this[kSetLine](head + currentYank + tail);
        this.cursor = head.length + currentYank.length;
        this[kRefreshLine]();
      }
    }
  }, {
    key: kSavePreviousState,
    value: function () {
      this[kPreviousLine] = this.line;
      this[kPreviousCursor] = this.cursor;
      this[kPreviousPrevRows] = this.prevRows;
    }
  }, {
    key: kRestorePreviousState,
    value: function () {
      this[kSetLine](this[kPreviousLine]);
      this.cursor = this[kPreviousCursor];
      this.prevRows = this[kPreviousPrevRows];
    }
  }, {
    key: "clearLine",
    value: function clearLine() {
      this[kMoveCursor](+Infinity);
      this[kWriteToOutput]('\r\n');
      this[kSetLine]('');
      this.cursor = 0;
      this.prevRows = 0;
    }
  }, {
    key: kLine,
    value: function () {
      this[kSavePreviousState]();
      var line = this[kAddHistory]();
      this[kUndoStack] = [];
      this[kRedoStack] = [];
      this.clearLine();
      this[kOnLine](line);
    }

    // TODO(puskin94): edit [kTtyWrite] to make call this function on a new key combination
    //                 to make it add a new line in the middle of a "complete" multiline.
    //                 I tried with shift + enter but it is not detected. Find a new one.
    //                 Make sure to call this[kSavePreviousState](); && this.clearLine();
    //                 before calling this[kAddNewLineOnTTY] to simulate what [kLine] is doing.

    // When this function is called, the actual cursor is at the very end of the whole string,
    // No matter where the new line was entered.
    // This function should only be used when the output is a TTY
  }, {
    key: kAddNewLineOnTTY,
    value: function () {
      // Restore terminal state and store current line
      this[kRestorePreviousState]();
      var originalLine = this.line;

      // Split the line at the current cursor position
      var beforeCursor = StringPrototypeSlice(this.line, 0, this.cursor);
      var afterCursor = StringPrototypeSlice(this.line, this.cursor, this.line.length);

      // Add the new line where the cursor is at
      this[kSetLine](`${beforeCursor}\n${afterCursor}`);

      // To account for the new line
      this.cursor += 1;
      var hasContentAfterCursor = afterCursor.length > 0;
      var cursorIsNotOnFirstLine = this.prevRows > 0;
      var needsRewriteFirstLine = false;

      // Handle cursor positioning based on different scenarios
      if (hasContentAfterCursor) {
        var splitBeg = StringPrototypeSplit(beforeCursor, '\n');
        // Determine if we need to rewrite the first line
        needsRewriteFirstLine = splitBeg.length < 2;

        // If the cursor is not on the first line
        if (cursorIsNotOnFirstLine) {
          var splitEnd = StringPrototypeSplit(afterCursor, '\n');

          // If the cursor when I pressed enter was at least on the second line
          // I need to completely erase the line where the cursor was pressed because it is possible
          // That it was pressed in the middle of the line, hence I need to write the whole line.
          // To achieve that, I need to reach the line above the current line coming from the end
          var dy = splitEnd.length + 1;

          // Calculate how many Xs we need to move on the right to get to the end of the line
          var dxEndOfLineAbove = (splitBeg[splitBeg.length - 2] || '').length + kMultilinePrompt.description.length;
          moveCursor(this.output, dxEndOfLineAbove, -dy);

          // This is the line that was split in the middle
          // Just add it to the rest of the line that will be printed later
          afterCursor = `${splitBeg[splitBeg.length - 1]}\n${afterCursor}`;
        } else {
          // Otherwise, go to the very beginning of the first line and erase everything
          var _dy = StringPrototypeSplit(originalLine, '\n').length;
          moveCursor(this.output, 0, -_dy);
        }

        // Erase from the cursor to the end of the line
        clearScreenDown(this.output);
        if (cursorIsNotOnFirstLine) {
          this[kWriteToOutput]('\n');
        }
      }
      if (needsRewriteFirstLine) {
        this[kWriteToOutput](`${this[kPrompt]}${beforeCursor}\n${kMultilinePrompt.description}`);
      } else {
        this[kWriteToOutput](kMultilinePrompt.description);
      }

      // Write the rest and restore the cursor to where the user left it
      if (hasContentAfterCursor) {
        // Save the cursor pos, we need to come back here
        var oldCursor = this.getCursorPos();

        // Write everything after the cursor which has been deleted by clearScreenDown
        var formattedEndContent = StringPrototypeReplaceAll(afterCursor, '\n', `\n${kMultilinePrompt.description}`);
        this[kWriteToOutput](formattedEndContent);
        var newCursor = this[kGetDisplayPos](this.line);

        // Go back to where the cursor was, with relative movement
        moveCursor(this.output, oldCursor.cols - newCursor.cols, oldCursor.rows - newCursor.rows);

        // Setting how many rows we have on top of the cursor
        // Necessary for kRefreshLine
        this.prevRows = oldCursor.rows;
      } else {
        // Setting how many rows we have on top of the cursor
        // Necessary for kRefreshLine
        this.prevRows = StringPrototypeSplit(this.line, '\n').length - 1;
      }
    }
  }, {
    key: kPushToUndoStack,
    value: function (text, cursor) {
      if (ArrayPrototypePush(this[kUndoStack], {
        text,
        cursor
      }) > kMaxUndoRedoStackSize) {
        ArrayPrototypeShift(this[kUndoStack]);
      }
    }
  }, {
    key: kUndo,
    value: function () {
      if (this[kUndoStack].length <= 0) return;
      ArrayPrototypePush(this[kRedoStack], {
        text: this.line,
        cursor: this.cursor
      });
      var entry = ArrayPrototypePop(this[kUndoStack]);
      this[kSetLine](entry.text);
      this.cursor = entry.cursor;
      this[kRefreshLine]();
    }
  }, {
    key: kRedo,
    value: function () {
      if (this[kRedoStack].length <= 0) return;
      ArrayPrototypePush(this[kUndoStack], {
        text: this.line,
        cursor: this.cursor
      });
      var entry = ArrayPrototypePop(this[kRedoStack]);
      this[kSetLine](entry.text);
      this.cursor = entry.cursor;
      this[kRefreshLine]();
    }
  }, {
    key: kMultilineMove,
    value: function (direction, splitLines, _ref2) {
      var {
        rows,
        cols
      } = _ref2;
      var curr = splitLines[rows];
      var down = direction === 1;
      var adj = splitLines[rows + direction];
      var promptLen = kMultilinePrompt.description.length;
      var amountToMove;
      // Clamp distance to end of current + prompt + next/prev line + newline
      var clamp = down ? curr.length - cols + promptLen + adj.length + 1 : -cols + 1;
      var shouldClamp = cols > adj.length + 1;
      if (shouldClamp) {
        if (this[kPreviousCursorCols] === -1) {
          this[kPreviousCursorCols] = cols;
        }
        amountToMove = clamp;
      } else {
        if (down) {
          amountToMove = curr.length + 1;
        } else {
          amountToMove = -adj.length - 1;
        }
        if (this[kPreviousCursorCols] !== -1) {
          if (this[kPreviousCursorCols] <= adj.length) {
            amountToMove += this[kPreviousCursorCols] - cols;
            this[kPreviousCursorCols] = -1;
          } else {
            amountToMove = clamp;
          }
        }
      }
      this[kMoveCursor](amountToMove);
    }
  }, {
    key: kMoveDownOrHistoryNext,
    value: function () {
      var cursorPos = this.getCursorPos();
      var splitLines = StringPrototypeSplit(this.line, '\n');
      if (this[kIsMultiline] && cursorPos.rows < splitLines.length - 1) {
        this[kMultilineMove](1, splitLines, cursorPos);
        return;
      }
      this[kPreviousCursorCols] = -1;
      this[kHistoryNext]();
    }

    // TODO(BridgeAR): Add underscores to the search part and a red background in
    // case no match is found. This should only be the visual part and not the
    // actual line content!
    // TODO(BridgeAR): In case the substring based search is active and the end is
    // reached, show a comment how to search the history as before. E.g., using
    // <ctrl> + N. Only show this after two/three UPs or DOWNs, not on the first
    // one.
  }, {
    key: kHistoryNext,
    value: function () {
      if (!this.historyManager.canNavigateToNext()) {
        return;
      }
      this[kBeforeEdit](this.line, this.cursor);
      this[kSetLine](this.historyManager.navigateToNext(this[kSubstringSearch]));
      this.cursor = this.line.length; // Set cursor to end of line.
      this[kRefreshLine]();
    }
  }, {
    key: kMoveUpOrHistoryPrev,
    value: function () {
      var cursorPos = this.getCursorPos();
      if (this[kIsMultiline] && cursorPos.rows > 0) {
        var splitLines = StringPrototypeSplit(this.line, '\n');
        this[kMultilineMove](-1, splitLines, cursorPos);
        return;
      }
      this[kPreviousCursorCols] = -1;
      this[kHistoryPrev]();
    }
  }, {
    key: kHistoryPrev,
    value: function () {
      if (!this.historyManager.canNavigateToPrevious()) {
        return;
      }
      this[kBeforeEdit](this.line, this.cursor);
      this[kSetLine](this.historyManager.navigateToPrevious(this[kSubstringSearch]));
      this.cursor = this.line.length; // Set cursor to end of line.
      this[kRefreshLine]();
    }

    // Returns the last character's display position of the given string
  }, {
    key: kGetDisplayPos,
    value: function (str) {
      var offset = 0;
      var col = this.columns;
      var rows = 0;
      str = stripVTControlCharacters(str);
      for (var char of new SafeStringIterator(str)) {
        if (char === '\n') {
          // Rows must be incremented by 1 even if offset = 0 or col = +Infinity.
          rows += MathCeil(offset / col) || 1;
          // Only add prefix offset for continuation lines in user input (not prompts)
          offset = this[kIsMultiline] ? kMultilinePrompt.description.length : 0;
          continue;
        }
        // Tabs must be aligned by an offset of the tab size.
        if (char === '\t') {
          offset += this.tabSize - offset % this.tabSize;
          continue;
        }
        var width = getStringWidth(char, false /* stripVTControlCharacters */);
        if (width === 0 || width === 1) {
          offset += width;
        } else {
          // width === 2
          if ((offset + 1) % col === 0) {
            offset++;
          }
          offset += 2;
        }
      }
      var cols = offset % col;
      rows += (offset - cols) / col;
      return {
        cols,
        rows
      };
    }

    /**
     * Returns the real position of the cursor in relation
     * to the input prompt + string.
     * @returns {{
     *   rows: number;
     *   cols: number;
     *   }}
     */
  }, {
    key: "getCursorPos",
    value: function getCursorPos() {
      var strBeforeCursor = this[kPrompt] + StringPrototypeSlice(this.line, 0, this.cursor);
      return this[kGetDisplayPos](strBeforeCursor);
    }

    // This function moves cursor dx places to the right
    // (-dx for left) and refreshes the line if it is needed.
  }, {
    key: kMoveCursor,
    value: function (dx) {
      if (dx === 0) {
        return;
      }
      var oldPos = this.getCursorPos();
      this.cursor += dx;

      // Bounds check
      if (this.cursor < 0) {
        this.cursor = 0;
      } else if (this.cursor > this.line.length) {
        this.cursor = this.line.length;
      }
      var newPos = this.getCursorPos();

      // Check if cursor stayed on the line.
      if (oldPos.rows === newPos.rows) {
        var diffWidth = newPos.cols - oldPos.cols;
        moveCursor(this.output, diffWidth, 0);
      } else {
        this[kRefreshLine]();
      }
    }

    // Handle a write from the tty
  }, {
    key: kTtyWrite,
    value: function (s, key) {
      var previousKey = this[kPreviousKey];
      key ||= kEmptyObject;
      this[kPreviousKey] = key;
      var shouldResetPreviousCursorCols = true;
      if (!key.meta || key.name !== 'y') {
        // Reset yanking state unless we are doing yank pop.
        this[kYanking] = false;
      }

      // Activate or deactivate substring search.
      if ((key.name === 'up' || key.name === 'down') && !key.ctrl && !key.meta && !key.shift) {
        if (this[kSubstringSearch] === null && !this[kIsMultiline]) {
          this[kSubstringSearch] = StringPrototypeSlice(this.line, 0, this.cursor);
        }
      } else if (this[kSubstringSearch] !== null) {
        this[kSubstringSearch] = null;
        // Reset the index in case there's no match.
        if (this.history.length === this.historyIndex) {
          this.historyIndex = -1;
        }
      }

      // Undo & Redo
      if (typeof key.sequence === 'string') {
        switch (StringPrototypeCodePointAt(key.sequence, 0)) {
          case 0x1f:
            this[kUndo]();
            return;
          case 0x1e:
            this[kRedo]();
            return;
          default:
            break;
        }
      }

      // Ignore escape key, fixes
      // https://github.com/nodejs/node-v0.x-archive/issues/2876.
      if (key.name === 'escape') return;
      if (key.ctrl && key.shift) {
        /* Control and shift pressed */
        switch (key.name) {
          // TODO(BridgeAR): The transmitted escape sequence is `\b` and that is
          // identical to <ctrl>-h. It should have a unique escape sequence.
          case 'backspace':
            this[kDeleteLineLeft]();
            break;
          case 'delete':
            this[kDeleteLineRight]();
            break;
        }
      } else if (key.ctrl) {
        /* Control key pressed */

        switch (key.name) {
          case 'c':
            if (this.listenerCount('SIGINT') > 0) {
              this.emit('SIGINT');
            } else {
              // This readline instance is finished
              this.close();
              this[kQuestionReject]?.(new AbortError('Aborted with Ctrl+C'));
            }
            break;
          case 'h':
            // delete left
            this[kDeleteLeft]();
            break;
          case 'd':
            // delete right or EOF
            if (this.cursor === 0 && this.line.length === 0) {
              // This readline instance is finished
              this.close();
              this[kQuestionReject]?.(new AbortError('Aborted with Ctrl+D'));
            } else if (this.cursor < this.line.length) {
              this[kDeleteRight]();
            }
            break;
          case 'u':
            // Delete from current to start of line
            this[kDeleteLineLeft]();
            break;
          case 'k':
            // Delete from current to end of line
            this[kDeleteLineRight]();
            break;
          case 'a':
            // Go to the start of the line
            this[kMoveCursor](-Infinity);
            break;
          case 'e':
            // Go to the end of the line
            this[kMoveCursor](+Infinity);
            break;
          case 'b':
            // back one character
            this[kMoveCursor](-charLengthLeft(this.line, this.cursor));
            break;
          case 'f':
            // Forward one character
            this[kMoveCursor](+charLengthAt(this.line, this.cursor));
            break;
          case 'l':
            // Clear the whole screen
            cursorTo(this.output, 0, 0);
            clearScreenDown(this.output);
            this[kRefreshLine]();
            break;
          case 'n':
            // next history item
            this[kHistoryNext]();
            break;
          case 'p':
            // Previous history item
            this[kHistoryPrev]();
            break;
          case 'y':
            // Yank killed string
            this[kYank]();
            break;
          case 'z':
            if (process.platform === 'win32') break;
            if (this.listenerCount('SIGTSTP') > 0) {
              this.emit('SIGTSTP');
            } else {
              process.once('SIGCONT', () => {
                // Don't raise events if stream has already been abandoned.
                if (!this.paused) {
                  // Stream must be paused and resumed after SIGCONT to catch
                  // SIGINT, SIGTSTP, and EOF.
                  this.pause();
                  this.emit('SIGCONT');
                }
                // Explicitly re-enable "raw mode" and move the cursor to
                // the correct position.
                // See https://github.com/joyent/node/issues/3295.
                this[kSetRawMode](true);
                this[kRefreshLine]();
              });
              this[kSetRawMode](false);
              process.kill(process.pid, 'SIGTSTP');
            }
            break;
          case 'w': // Delete backwards to a word boundary
          // TODO(BridgeAR): The transmitted escape sequence is `\b` and that is
          // identical to <ctrl>-h. It should have a unique escape sequence.
          // Falls through
          case 'backspace':
            this[kDeleteWordLeft]();
            break;
          case 'delete':
            // Delete forward to a word boundary
            this[kDeleteWordRight]();
            break;
          case 'left':
            this[kWordLeft]();
            break;
          case 'right':
            this[kWordRight]();
            break;
        }
      } else if (key.meta) {
        /* Meta key pressed */

        switch (key.name) {
          case 'b':
            // backward word
            this[kWordLeft]();
            break;
          case 'f':
            // forward word
            this[kWordRight]();
            break;
          case 'd': // delete forward word
          case 'delete':
            this[kDeleteWordRight]();
            break;
          case 'backspace':
            // Delete backwards to a word boundary
            this[kDeleteWordLeft]();
            break;
          case 'y':
            // Doing yank pop
            this[kYankPop]();
            break;
        }
      } else {
        /* No modifier keys used */

        // \r bookkeeping is only relevant if a \n comes right after.
        if (this[kSawReturnAt] && key.name !== 'enter') this[kSawReturnAt] = 0;
        switch (key.name) {
          case 'return':
            // Carriage return, i.e. \r
            this[kSawReturnAt] = DateNow();
            this[kLine]();
            break;
          case 'enter':
            // When key interval > crlfDelay
            if (this[kSawReturnAt] === 0 || DateNow() - this[kSawReturnAt] > this.crlfDelay) {
              this[kLine]();
            }
            this[kSawReturnAt] = 0;
            break;
          case 'backspace':
            this[kDeleteLeft]();
            break;
          case 'delete':
            this[kDeleteRight]();
            break;
          case 'left':
            // Obtain the code point to the left
            this[kMoveCursor](-charLengthLeft(this.line, this.cursor));
            break;
          case 'right':
            this[kMoveCursor](+charLengthAt(this.line, this.cursor));
            break;
          case 'home':
            this[kMoveCursor](-Infinity);
            break;
          case 'end':
            this[kMoveCursor](+Infinity);
            break;
          case 'up':
            shouldResetPreviousCursorCols = false;
            this[kMoveUpOrHistoryPrev]();
            break;
          case 'down':
            shouldResetPreviousCursorCols = false;
            this[kMoveDownOrHistoryNext]();
            break;
          case 'tab':
            // If tab completion enabled, do that...
            if (typeof this.completer === 'function' && this.isCompletionEnabled) {
              var lastKeypressWasTab = previousKey && previousKey.name === 'tab';
              this[kTabComplete](lastKeypressWasTab);
              break;
            }
          // falls through
          default:
            if (typeof s === 'string' && s) {
              // Erase state of previous searches.
              lineEnding.lastIndex = 0;
              var nextMatch;
              // Keep track of the end of the last match.
              var lastIndex = 0;
              while ((nextMatch = RegExpPrototypeExec(lineEnding, s)) !== null) {
                this[kInsertString](StringPrototypeSlice(s, lastIndex, nextMatch.index));
                ({
                  lastIndex
                } = lineEnding);
                this[kLine]();
                // Restore lastIndex as the call to kLine could have mutated it.
                lineEnding.lastIndex = lastIndex;
              }
              // This ensures that the last line is written if it doesn't end in a newline.
              // Note that the last line may be the first line, in which case this still works.
              this[kInsertString](StringPrototypeSlice(s, lastIndex));
            }
        }
      }
      if (shouldResetPreviousCursorCols) {
        this[kPreviousCursorCols] = -1;
      }
    }

    /**
     * Creates an `AsyncIterator` object that iterates through
     * each line in the input stream as a string.
     * @returns {AsyncIterableIterator<string>}
     */
  }, {
    key: SymbolAsyncIterator,
    value: function () {
      if (this[kLineObjectStream] === undefined) {
        kFirstEventParam ??= require('internal/events/symbols').kFirstEventParam;
        this[kLineObjectStream] = EventEmitter.on(this, 'line', {
          close: ['close'],
          highWaterMark: 1024,
          [kFirstEventParam]: true
        });
      }
      return this[kLineObjectStream];
    }
  }]);
}(InterfaceConstructor);
Interface.prototype[SymbolDispose] = assignFunctionName(SymbolDispose, function () {
  this.close();
});
module.exports = {
  Interface,
  InterfaceConstructor,
  kAddHistory,
  kDecoder,
  kDeleteLeft,
  kDeleteLineLeft,
  kDeleteLineRight,
  kDeleteRight,
  kDeleteWordLeft,
  kDeleteWordRight,
  kGetDisplayPos,
  kHistoryNext,
  kHistoryPrev,
  kInsertString,
  kIsMultiline,
  kLine,
  kLine_buffer,
  kMoveCursor,
  kNormalWrite,
  kOldPrompt,
  kOnLine,
  kSetLine,
  kPreviousKey,
  kPrompt,
  kQuestion,
  kQuestionCallback,
  kQuestionCancel,
  kQuestionReject,
  kRefreshLine,
  kSawKeyPress,
  kSawReturnAt,
  kSetRawMode,
  kTabComplete,
  kTabCompleter,
  kTtyWrite,
  kWordLeft,
  kWordRight,
  kWriteToOutput,
  kMultilinePrompt,
  kRestorePreviousState,
  kAddNewLineOnTTY,
  kLastCommandErrored
};

