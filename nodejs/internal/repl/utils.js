'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var {
  ArrayPrototypeFilter,
  ArrayPrototypeIncludes,
  ArrayPrototypeMap,
  Boolean: _Boolean,
  FunctionPrototypeBind,
  MathMin,
  RegExpPrototypeExec,
  SafeSet,
  SafeStringIterator,
  StringPrototypeIndexOf,
  StringPrototypeLastIndexOf,
  StringPrototypeReplaceAll,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
  StringPrototypeToLowerCase,
  StringPrototypeTrim,
  Symbol: _Symbol
} = primordials;
var {
  tokTypes: tt,
  Parser: AcornParser
} = require('internal/deps/acorn/acorn/dist/acorn');
var {
  sendInspectorCommand
} = require('internal/util/inspector');
var {
  ERR_INSPECTOR_NOT_AVAILABLE
} = require('internal/errors').codes;
var {
  clearLine,
  clearScreenDown,
  cursorTo,
  moveCursor
} = require('internal/readline/callbacks');
var {
  kIsMultiline,
  kSetLine
} = require('internal/readline/interface');
var {
  commonPrefix,
  kSubstringSearch
} = require('internal/readline/utils');
var {
  getStringWidth,
  inspect
} = require('internal/util/inspect');
var CJSModule = require('internal/modules/cjs/loader').Module;
var vm = require('vm');
var debug = require('internal/util/debuglog').debuglog('repl', fn => {
  debug = fn;
});
var previewOptions = {
  colors: false,
  depth: 1,
  showHidden: false
};
var REPL_MODE_STRICT = _Symbol('repl-strict');

// If the error is that we've unexpectedly ended the input,
// then let the user try to recover by adding more input.
// Note: `e` (the original exception) is not used by the current implementation,
// but may be needed in the future.
function isRecoverableError(e, code) {
  // For similar reasons as `defaultEval`, wrap expressions starting with a
  // curly brace with parenthesis.  Note: only the open parenthesis is added
  // here as the point is to test for potentially valid but incomplete
  // expressions.
  if (RegExpPrototypeExec(/^\s*\{/, code) !== null && isRecoverableError(e, `(${code}`)) return true;
  var recoverable = false;

  // Determine if the point of any error raised is at the end of the input.
  // There are two cases to consider:
  //
  //   1.  Any error raised after we have encountered the 'eof' token.
  //       This prevents us from declaring partial tokens (like '2e') as
  //       recoverable.
  //
  //   2.  Three cases where tokens can legally span lines.  This is
  //       template, comment, and strings with a backslash at the end of
  //       the line, indicating a continuation.  Note that we need to look
  //       for the specific errors of 'unterminated' kind (not, for example,
  //       a syntax error in a ${} expression in a template), and the only
  //       way to do that currently is to look at the message.  Should Acorn
  //       change these messages in the future, this will lead to a test
  //       failure, indicating that this code needs to be updated.
  //
  var RecoverableParser = AcornParser.extend(Parser => {
    return /*#__PURE__*/function (_Parser) {
      function _class() {
        _classCallCheck(this, _class);
        return _callSuper(this, _class, arguments);
      }
      _inherits(_class, _Parser);
      return _createClass(_class, [{
        key: "nextToken",
        value: function nextToken() {
          _superPropGet(_class, "nextToken", this, 3)([]);
          if (this.type === tt.eof) recoverable = true;
        }
      }, {
        key: "raise",
        value: function raise(pos, message) {
          switch (message) {
            case 'Unterminated template':
            case 'Unterminated comment':
              recoverable = true;
              break;
            case 'Unterminated string constant':
              {
                var token = StringPrototypeSlice(this.input, this.lastTokStart, this.pos);
                // See https://www.ecma-international.org/ecma-262/#sec-line-terminators
                if (RegExpPrototypeExec(/\\(?:\r\n?|\n|\u2028|\u2029)$/, token) !== null) {
                  recoverable = true;
                }
              }
          }
          _superPropGet(_class, "raise", this, 3)([pos, message]);
        }
      }]);
    }(Parser);
  });

  // Try to parse the code with acorn.  If the parse fails, ignore the acorn
  // error and return the recoverable status.
  try {
    RecoverableParser.parse(code, {
      ecmaVersion: 'latest'
    });

    // Odd case: the underlying JS engine (V8, Chakra) rejected this input
    // but Acorn detected no issue.  Presume that additional text won't
    // address this issue.
    return false;
  } catch {
    return recoverable;
  }
}
function setupPreview(repl, contextSymbol, bufferSymbol, active) {
  // Simple terminals can't handle previews.
  if (process.env.TERM === 'dumb' || !active) {
    return {
      showPreview() {},
      clearPreview() {}
    };
  }
  var inputPreview = null;
  var previewCompletionCounter = 0;
  var completionPreview = null;
  var hasCompletions = false;
  var wrapped = false;
  var escaped = null;
  function getPreviewPos() {
    var displayPos = repl._getDisplayPos(`${repl.getPrompt()}${repl.line}`);
    var cursorPos = repl.line.length !== repl.cursor ? repl.getCursorPos() : displayPos;
    return {
      displayPos,
      cursorPos
    };
  }
  function isCursorAtInputEnd() {
    var {
      cursorPos,
      displayPos
    } = getPreviewPos();
    return cursorPos.rows === displayPos.rows && cursorPos.cols === displayPos.cols;
  }
  var clearPreview = key => {
    if (inputPreview !== null) {
      var {
        displayPos,
        cursorPos
      } = getPreviewPos();
      var rows = displayPos.rows - cursorPos.rows + 1;
      moveCursor(repl.output, 0, rows);
      clearLine(repl.output);
      moveCursor(repl.output, 0, -rows);
      inputPreview = null;
    }
    if (completionPreview !== null) {
      // Prevent cursor moves if not necessary!
      var move = repl.line.length !== repl.cursor;
      var pos, _rows;
      if (move) {
        pos = getPreviewPos();
        cursorTo(repl.output, pos.displayPos.cols);
        _rows = pos.displayPos.rows - pos.cursorPos.rows;
        moveCursor(repl.output, 0, _rows);
      }
      var totalLine = `${repl.getPrompt()}${repl.line}${completionPreview}`;
      var newPos = repl._getDisplayPos(totalLine);
      // Minimize work for the terminal. It is enough to clear the right part of
      // the current line in case the preview is visible on a single line.
      if (newPos.rows === 0 || pos && pos.displayPos.rows === newPos.rows) {
        clearLine(repl.output, 1);
      } else {
        clearScreenDown(repl.output);
      }
      if (move) {
        cursorTo(repl.output, pos.cursorPos.cols);
        moveCursor(repl.output, 0, -_rows);
      }
      if (!key.ctrl && !key.shift) {
        if (key.name === 'escape') {
          if (escaped === null && key.meta) {
            escaped = repl.line;
          }
        } else if ((key.name === 'return' || key.name === 'enter') && !key.meta && escaped !== repl.line && isCursorAtInputEnd()) {
          repl._insertString(completionPreview);
        }
      }
      completionPreview = null;
    }
    if (escaped !== repl.line) {
      escaped = null;
    }
  };
  function showCompletionPreview(line, insertPreview) {
    previewCompletionCounter++;
    var count = previewCompletionCounter;
    repl.completer(line, (error, data) => {
      // Tab completion might be async and the result might already be outdated.
      if (count !== previewCompletionCounter) {
        return;
      }
      if (error) {
        debug('Error while generating completion preview', error);
        return;
      }

      // Result and the text that was completed.
      var {
        0: rawCompletions,
        1: completeOn
      } = data;
      if (!rawCompletions || rawCompletions.length === 0) {
        return;
      }
      hasCompletions = true;

      // If there is a common prefix to all matches, then apply that portion.
      var completions = ArrayPrototypeFilter(rawCompletions, _Boolean);
      var prefix = commonPrefix(completions);

      // No common prefix found.
      if (prefix.length <= completeOn.length) {
        return;
      }
      var suffix = StringPrototypeSlice(prefix, completeOn.length);
      if (insertPreview) {
        repl._insertString(suffix);
        return;
      }
      completionPreview = suffix;
      var result = repl.useColors ? `\u001b[90m${suffix}\u001b[39m` : ` // ${suffix}`;
      var {
        cursorPos,
        displayPos
      } = getPreviewPos();
      if (repl.line.length !== repl.cursor) {
        cursorTo(repl.output, displayPos.cols);
        moveCursor(repl.output, 0, displayPos.rows - cursorPos.rows);
      }
      repl.output.write(result);
      cursorTo(repl.output, cursorPos.cols);
      var totalLine = `${repl.getPrompt()}${repl.line}${suffix}`;
      var newPos = repl._getDisplayPos(totalLine);
      var rows = newPos.rows - cursorPos.rows - (newPos.cols === 0 ? 1 : 0);
      moveCursor(repl.output, 0, -rows);
    });
  }
  function isInStrictMode(repl) {
    return repl.replMode === REPL_MODE_STRICT || ArrayPrototypeIncludes(ArrayPrototypeMap(process.execArgv, e => StringPrototypeReplaceAll(StringPrototypeToLowerCase(e), '_', '-')), '--use-strict');
  }

  // This returns a code preview for arbitrary input code.
  function getInputPreview(input, callback) {
    // For similar reasons as `defaultEval`, wrap expressions starting with a
    // curly brace with parenthesis.
    if (!wrapped && input[0] === '{' && input[input.length - 1] !== ';' && isValidSyntax(input)) {
      input = `(${input})`;
      wrapped = true;
    }
    sendInspectorCommand(session => {
      session.post('Runtime.evaluate', {
        expression: input,
        throwOnSideEffect: true,
        timeout: 333,
        contextId: repl[contextSymbol]
      }, (error, preview) => {
        if (error) {
          callback(error);
          return;
        }
        var {
          result
        } = preview;
        if (result.value !== undefined) {
          callback(null, inspect(result.value, previewOptions));
          // Ignore EvalErrors, SyntaxErrors and ReferenceErrors. It is not clear
          // where they came from and if they are recoverable or not. Other errors
          // may be inspected.
        } else if (preview.exceptionDetails && (result.className === 'EvalError' || result.className === 'SyntaxError' ||
        // Report ReferenceError in case the strict mode is active
        // for input that has no completions.
        result.className === 'ReferenceError' && (hasCompletions || !isInStrictMode(repl)))) {
          callback(null, null);
        } else if (result.objectId) {
          // The writer options might change and have influence on the inspect
          // output. The user might change e.g., `showProxy`, `getters` or
          // `showHidden`. Use `inspect` instead of `JSON.stringify` to keep
          // `Infinity` and similar intact.
          var inspectOptions = inspect(_objectSpread(_objectSpread({}, repl.writer.options), {}, {
            colors: false,
            depth: 1,
            compact: true,
            breakLength: Infinity
          }), previewOptions);
          session.post('Runtime.callFunctionOn', {
            functionDeclaration: `(v) =>
                    Reflect
                    .getOwnPropertyDescriptor(globalThis, 'util')
                    .get().inspect(v, ${inspectOptions})`,
            objectId: result.objectId,
            arguments: [result]
          }, (error, preview) => {
            if (error) {
              callback(error);
            } else {
              callback(null, preview.result.value);
            }
          });
        } else {
          // Either not serializable or undefined.
          callback(null, result.unserializableValue || result.type);
        }
      });
    }, () => callback(new ERR_INSPECTOR_NOT_AVAILABLE()));
  }
  var showPreview = function () {
    var showCompletion = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    // Prevent duplicated previews after a refresh or in a multiline command.
    if (inputPreview !== null || repl[kIsMultiline] || !repl.isCompletionEnabled || !process.features.inspector) {
      return;
    }
    var line = StringPrototypeTrim(repl.line);

    // Do not preview in case the line only contains whitespace.
    if (line === '') {
      return;
    }
    hasCompletions = false;

    // Add the autocompletion preview.
    if (showCompletion) {
      var insertPreview = false;
      showCompletionPreview(repl.line, insertPreview);
    }

    // Do not preview if the command is buffered.
    if (repl[bufferSymbol]) {
      return;
    }
    var inputPreviewCallback = (error, inspected) => {
      if (inspected == null) {
        return;
      }
      wrapped = false;

      // Ignore the output if the value is identical to the current line.
      if (line === inspected) {
        return;
      }
      if (error) {
        debug('Error while generating preview', error);
        return;
      }
      // Do not preview `undefined` if colors are deactivated or explicitly
      // requested.
      if (inspected === 'undefined' && (!repl.useColors || repl.ignoreUndefined)) {
        return;
      }
      inputPreview = inspected;

      // Limit the output to maximum 250 characters. Otherwise it becomes a)
      // difficult to read and b) non terminal REPLs would visualize the whole
      // output.
      var maxColumns = MathMin(repl.columns, 250);

      // Support unicode characters of width other than one by checking the
      // actual width.
      if (inspected.length * 2 >= maxColumns && getStringWidth(inspected) > maxColumns) {
        maxColumns -= 4 + (repl.useColors ? 0 : 3);
        var res = '';
        for (var char of new SafeStringIterator(inspected)) {
          maxColumns -= getStringWidth(char);
          if (maxColumns < 0) break;
          res += char;
        }
        inspected = `${res}...`;
      }

      // Line breaks are very rare and probably only occur in case of error
      // messages with line breaks.
      var lineBreakMatch = RegExpPrototypeExec(/[\r\n\v]/, inspected);
      if (lineBreakMatch !== null) {
        inspected = `${StringPrototypeSlice(inspected, 0, lineBreakMatch.index)}`;
      }
      var result = repl.useColors ? `\u001b[90m${inspected}\u001b[39m` : `// ${inspected}`;
      var {
        cursorPos,
        displayPos
      } = getPreviewPos();
      var rows = displayPos.rows - cursorPos.rows;
      // Moves one line below all the user lines
      moveCursor(repl.output, 0, rows);
      // Writes the preview there
      repl.output.write(`\n${result}`);

      // Go back to the horizontal position of the cursor
      cursorTo(repl.output, cursorPos.cols);
      // Go back to the vertical position of the cursor
      moveCursor(repl.output, 0, -rows - 1);
    };
    var previewLine = line;
    if (completionPreview !== null && isCursorAtInputEnd() && escaped !== repl.line) {
      previewLine += completionPreview;
    }
    getInputPreview(previewLine, inputPreviewCallback);
    if (wrapped) {
      getInputPreview(previewLine, inputPreviewCallback);
    }
    wrapped = false;
  };

  // -------------------------------------------------------------------------//
  // Replace multiple interface functions. This is required to fully support  //
  // previews without changing readlines behavior.                            //
  // -------------------------------------------------------------------------//

  // Refresh prints the whole screen again and the preview will be removed
  // during that procedure. Print the preview again. This also makes sure
  // the preview is always correct after resizing the terminal window.
  var originalRefresh = FunctionPrototypeBind(repl._refreshLine, repl);
  repl._refreshLine = () => {
    inputPreview = null;
    originalRefresh();
    showPreview();
  };
  var insertCompletionPreview = true;
  // Insert the longest common suffix of the current input in case the user
  // moves to the right while already being at the current input end.
  var originalMoveCursor = FunctionPrototypeBind(repl._moveCursor, repl);
  repl._moveCursor = dx => {
    var currentCursor = repl.cursor;
    originalMoveCursor(dx);
    if (currentCursor + dx > repl.line.length && typeof repl.completer === 'function' && insertCompletionPreview) {
      var insertPreview = true;
      showCompletionPreview(repl.line, insertPreview);
    }
  };

  // This is the only function that interferes with the completion insertion.
  // Monkey patch it to prevent inserting the completion when it shouldn't be.
  var originalClearLine = FunctionPrototypeBind(repl.clearLine, repl);
  repl.clearLine = () => {
    insertCompletionPreview = false;
    originalClearLine();
    insertCompletionPreview = true;
  };
  return {
    showPreview,
    clearPreview
  };
}
function setupReverseSearch(repl) {
  // Simple terminals can't use reverse search.
  if (process.env.TERM === 'dumb') {
    return {
      reverseSearch() {
        return false;
      }
    };
  }
  var alreadyMatched = new SafeSet();
  var labels = {
    r: 'bck-i-search: ',
    s: 'fwd-i-search: '
  };
  var isInReverseSearch = false;
  var historyIndex = -1;
  var input = '';
  var cursor = -1;
  var dir = 'r';
  var lastMatch = -1;
  var lastCursor = -1;
  var promptPos;
  function checkAndSetDirectionKey(keyName) {
    if (!labels[keyName]) {
      return false;
    }
    if (dir !== keyName) {
      // Reset the already matched set in case the direction is changed. That
      // way it's possible to find those entries again.
      alreadyMatched.clear();
      dir = keyName;
    }
    return true;
  }
  function goToNextHistoryIndex() {
    // Ignore this entry for further searches and continue to the next
    // history entry.
    alreadyMatched.add(repl.history[historyIndex]);
    historyIndex += dir === 'r' ? 1 : -1;
    cursor = -1;
  }
  function search() {
    // Just print an empty line in case the user removed the search parameter.
    if (input === '') {
      print(repl.line, `${labels[dir]}_`);
      return;
    }
    // Fix the bounds in case the direction has changed in the meanwhile.
    if (dir === 'r') {
      if (historyIndex < 0) {
        historyIndex = 0;
      }
    } else if (historyIndex >= repl.history.length) {
      historyIndex = repl.history.length - 1;
    }
    // Check the history entries until a match is found.
    while (historyIndex >= 0 && historyIndex < repl.history.length) {
      var entry = repl.history[historyIndex];
      // Visualize all potential matches only once.
      if (alreadyMatched.has(entry)) {
        historyIndex += dir === 'r' ? 1 : -1;
        continue;
      }
      // Match the next entry either from the start or from the end, depending
      // on the current direction.
      if (dir === 'r') {
        // Update the cursor in case it's necessary.
        if (cursor === -1) {
          cursor = entry.length;
        }
        cursor = StringPrototypeLastIndexOf(entry, input, cursor - 1);
      } else {
        cursor = StringPrototypeIndexOf(entry, input, cursor + 1);
      }
      // Match not found.
      if (cursor === -1) {
        goToNextHistoryIndex();
        // Match found.
      } else {
        if (repl.useColors) {
          var start = StringPrototypeSlice(entry, 0, cursor);
          var end = StringPrototypeSlice(entry, cursor + input.length);
          entry = `${start}\x1B[4m${input}\x1B[24m${end}`;
        }
        print(entry, `${labels[dir]}${input}_`, cursor);
        lastMatch = historyIndex;
        lastCursor = cursor;
        // Explicitly go to the next history item in case no further matches are
        // possible with the current entry.
        if (dir === 'r' && cursor === 0 || dir === 's' && entry.length === cursor + input.length) {
          goToNextHistoryIndex();
        }
        return;
      }
    }
    print(repl.line, `failed-${labels[dir]}${input}_`);
  }
  function print(outputLine, inputLine) {
    var cursor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : repl.cursor;
    // TODO(BridgeAR): Resizing the terminal window hides the overlay. To fix
    // that, readline must be aware of this information. It's probably best to
    // add a couple of properties to readline that allow to do the following:
    // 1. Add arbitrary data to the end of the current line while not counting
    //    towards the line. This would be useful for the completion previews.
    // 2. Add arbitrary extra lines that do not count towards the regular line.
    //    This would be useful for both, the input preview and the reverse
    //    search. It might be combined with the first part?
    // 3. Add arbitrary input that is "on top" of the current line. That is
    //    useful for the reverse search.
    // 4. To trigger the line refresh, functions should be used to pass through
    //    the information. Alternatively, getters and setters could be used.
    //    That might even be more elegant.
    // The data would then be accounted for when calling `_refreshLine()`.
    // This function would then look similar to:
    //   repl.overlay(outputLine);
    //   repl.addTrailingLine(inputLine);
    //   repl.setCursor(cursor);
    // More potential improvements: use something similar to stream.cork().
    // Multiple cursor moves on the same tick could be prevented in case all
    // writes from the same tick are combined and the cursor is moved at the
    // tick end instead of after each operation.
    var rows = 0;
    if (lastMatch !== -1) {
      var line = StringPrototypeSlice(repl.history[lastMatch], 0, lastCursor);
      rows = repl._getDisplayPos(`${repl.getPrompt()}${line}`).rows;
      cursorTo(repl.output, promptPos.cols);
    } else if (isInReverseSearch && repl.line !== '') {
      rows = repl.getCursorPos().rows;
      cursorTo(repl.output, promptPos.cols);
    }
    if (rows !== 0) moveCursor(repl.output, 0, -rows);
    if (isInReverseSearch) {
      clearScreenDown(repl.output);
      repl.output.write(`${outputLine}\n${inputLine}`);
    } else {
      repl.output.write(`\n${inputLine}`);
    }
    lastMatch = -1;

    // To know exactly how many rows we have to move the cursor back we need the
    // cursor rows, the output rows and the input rows.
    var prompt = repl.getPrompt();
    var cursorLine = prompt + StringPrototypeSlice(outputLine, 0, cursor);
    var cursorPos = repl._getDisplayPos(cursorLine);
    var outputPos = repl._getDisplayPos(`${prompt}${outputLine}`);
    var inputPos = repl._getDisplayPos(inputLine);
    var inputRows = inputPos.rows - (inputPos.cols === 0 ? 1 : 0);
    rows = -1 - inputRows - (outputPos.rows - cursorPos.rows);
    moveCursor(repl.output, 0, rows);
    cursorTo(repl.output, cursorPos.cols);
  }
  function reset(string) {
    isInReverseSearch = string !== undefined;

    // In case the reverse search ends and a history entry is found, reset the
    // line to the found entry.
    if (!isInReverseSearch) {
      if (lastMatch !== -1) {
        repl[kSetLine](repl.history[lastMatch]);
        repl.cursor = lastCursor;
        repl.historyIndex = lastMatch;
      }
      lastMatch = -1;

      // Clear screen and write the current repl.line before exiting.
      cursorTo(repl.output, promptPos.cols);
      moveCursor(repl.output, 0, promptPos.rows);
      clearScreenDown(repl.output);
      if (repl.line !== '') {
        repl.output.write(repl.line);
        if (repl.line.length !== repl.cursor) {
          var {
            cols,
            rows
          } = repl.getCursorPos();
          cursorTo(repl.output, cols);
          moveCursor(repl.output, 0, rows);
        }
      }
    }
    input = string || '';
    cursor = -1;
    historyIndex = repl.historyIndex;
    alreadyMatched.clear();
  }
  function reverseSearch(string, key) {
    if (!isInReverseSearch) {
      if (key.ctrl && checkAndSetDirectionKey(key.name)) {
        historyIndex = repl.historyIndex;
        promptPos = repl._getDisplayPos(`${repl.getPrompt()}`);
        print(repl.line, `${labels[dir]}_`);
        isInReverseSearch = true;
      }
    } else if (key.ctrl && checkAndSetDirectionKey(key.name)) {
      search();
    } else if (key.name === 'backspace' || key.ctrl && (key.name === 'h' || key.name === 'w')) {
      reset(StringPrototypeSlice(input, 0, input.length - 1));
      search();
      // Special handle <ctrl> + c and escape. Those should only cancel the
      // reverse search. The original line is visible afterwards again.
    } else if (key.ctrl && key.name === 'c' || key.name === 'escape') {
      lastMatch = -1;
      reset();
      return true;
      // End search in case either enter is pressed or if any non-reverse-search
      // key (combination) is pressed.
    } else if (key.ctrl || key.meta || key.name === 'return' || key.name === 'enter' || typeof string !== 'string' || string === '') {
      reset();
      repl[kSubstringSearch] = '';
    } else {
      reset(`${input}${string}`);
      search();
    }
    return isInReverseSearch;
  }
  return {
    reverseSearch
  };
}
var startsWithBraceRegExp = /^\s*{/;
var endsWithSemicolonRegExp = /;\s*$/;
function isValidSyntax(input) {
  try {
    AcornParser.parse(input, {
      ecmaVersion: 'latest',
      allowAwaitOutsideFunction: true
    });
    return true;
  } catch {
    try {
      AcornParser.parse(`_=${input}`, {
        ecmaVersion: 'latest',
        allowAwaitOutsideFunction: true
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Checks if some provided code represents an object literal.
 * This is helpful to prevent confusing repl code evaluations where
 * strings such as `{ a : 1 }` would get interpreted as block statements
 * rather than object literals.
 * @param {string} code the code to check
 * @returns {boolean} true if the code represents an object literal, false otherwise
 */
function isObjectLiteral(code) {
  return RegExpPrototypeExec(startsWithBraceRegExp, code) !== null && RegExpPrototypeExec(endsWithSemicolonRegExp, code) === null;
}
var kContextId = _Symbol('contextId');
var path = require('path');
function fixReplRequire(replModule) {
  try {
    // Hack for require.resolve("./relative") to work properly.
    replModule.filename = path.resolve('repl');
  } catch {
    // path.resolve('repl') fails when the current working directory has been
    // deleted.  Fall back to the directory name of the (absolute) executable
    // path.  It's not really correct but what are the alternatives?
    var dirname = path.dirname(process.execPath);
    replModule.filename = path.resolve(dirname, 'repl');
  }

  // Hack for repl require to work properly with node_modules folders
  replModule.paths = CJSModule._nodeModulePaths(replModule.filename);
}
var nextREPLResourceNumber = 1;
// This prevents v8 code cache from getting confused and using a different
// cache from a resource of the same name
function getREPLResourceName() {
  return `REPL${nextREPLResourceNumber++}`;
}
var globalBuiltins = new SafeSet(vm.runInNewContext('Object.getOwnPropertyNames(globalThis)'));
var _builtinLibs = ArrayPrototypeFilter(CJSModule.builtinModules, e => e[0] !== '_' && !StringPrototypeStartsWith(e, 'node:'));

// Note: the `getReplBuiltinLibs` and `setReplBuiltinLibs` are functions used to provide getters and
//       setters for the `builtinModules` and `_builtinLibs` properties of the repl module and for making
//       sure that all internal repl modules share the same value, which can potentially be updated by users.
//       Also note that both `repl.builtinModules` and `repl._builtinLibs` are deprecated, once such properties
//       are removed these two functions should also be removed as no longer necessary.

function getReplBuiltinLibs() {
  return _builtinLibs;
}
function setReplBuiltinLibs(value) {
  _builtinLibs = value;
}
module.exports = {
  REPL_MODE_SLOPPY: _Symbol('repl-sloppy'),
  REPL_MODE_STRICT,
  isRecoverableError,
  kStandaloneREPL: _Symbol('kStandaloneREPL'),
  setupPreview,
  setupReverseSearch,
  isObjectLiteral,
  isValidSyntax,
  kContextId,
  getREPLResourceName,
  globalBuiltins,
  getReplBuiltinLibs,
  setReplBuiltinLibs,
  fixReplRequire
};

