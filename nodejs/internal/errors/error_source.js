'use strict';

var {
  FunctionPrototypeBind,
  StringPrototypeSlice
} = primordials;
var {
  getErrorSourcePositions
} = internalBinding('errors');
var {
  getSourceMapsSupport,
  findSourceMap,
  getSourceLine
} = require('internal/source_map/source_map_cache');

/**
 * Get the source location of an error. If source map is enabled, resolve the source location
 * based on the source map.
 *
 * The `error.stack` must not have been accessed. The resolution is based on the structured
 * error stack data.
 * @param {Error|object} error An error object, or an object being invoked with ErrorCaptureStackTrace
 * @returns {{sourceLine: string, startColumn: number}|undefined}
 */
function getErrorSourceLocation(error) {
  var pos = getErrorSourcePositions(error);
  var {
    sourceLine,
    scriptResourceName,
    lineNumber,
    startColumn
  } = pos;

  // Source map is not enabled. Return the source line directly.
  if (!getSourceMapsSupport().enabled) {
    return {
      sourceLine,
      startColumn
    };
  }
  var sm = findSourceMap(scriptResourceName);
  if (sm === undefined) {
    return;
  }
  var {
    originalLine,
    originalColumn,
    originalSource
  } = sm.findEntry(lineNumber - 1, startColumn);
  var originalSourceLine = getSourceLine(sm, originalSource, originalLine, originalColumn);
  if (!originalSourceLine) {
    return;
  }
  return {
    sourceLine: originalSourceLine,
    startColumn: originalColumn
  };
}
var memberAccessTokens = ['.', '?.', '[', ']'];
var memberNameTokens = ['name', 'string', 'num'];
var tokenizer;
/**
 * Get the first expression in a code string at the startColumn.
 * @param {string} code source code line
 * @param {number} startColumn which column the error is constructed
 * @returns {string}
 */
function getFirstExpression(code, startColumn) {
  // Lazy load acorn.
  if (tokenizer === undefined) {
    var Parser = require('internal/deps/acorn/acorn/dist/acorn').Parser;
    tokenizer = FunctionPrototypeBind(Parser.tokenizer, Parser);
  }
  var lastToken;
  var firstMemberAccessNameToken;
  var terminatingCol;
  var parenLvl = 0;
  // Tokenize the line to locate the expression at the startColumn.
  // The source line may be an incomplete JavaScript source, so do not parse the source line.
  for (var token of tokenizer(code, {
    ecmaVersion: 'latest'
  })) {
    // Peek before the startColumn.
    if (token.start < startColumn) {
      // There is a semicolon. This is a statement before the startColumn, so reset the memo.
      if (token.type.label === ';') {
        firstMemberAccessNameToken = null;
        continue;
      }
      // Try to memo the member access expressions before the startColumn, so that the
      // returned source code contains more info:
      //   assert.ok(value)
      //          ^ startColumn
      // The member expression can also be like
      //   assert['ok'](value) or assert?.ok(value)
      //               ^ startColumn      ^ startColumn
      if (memberAccessTokens.includes(token.type.label) && lastToken?.type.label === 'name') {
        // First member access name token must be a 'name'.
        firstMemberAccessNameToken ??= lastToken;
      } else if (!memberAccessTokens.includes(token.type.label) && !memberNameTokens.includes(token.type.label)) {
        // Reset the memo if it is not a simple member access.
        // For example: assert[(() => 'ok')()](value)
        //                                    ^ startColumn
        firstMemberAccessNameToken = null;
      }
      lastToken = token;
      continue;
    }
    // Now after the startColumn, this must be an expression.
    if (token.type.label === '(') {
      parenLvl++;
      continue;
    }
    if (token.type.label === ')') {
      parenLvl--;
      if (parenLvl === 0) {
        // A matched closing parenthesis found after the startColumn,
        // terminate here. Include the token.
        //   (assert.ok(false), assert.ok(true))
        //           ^ startColumn
        terminatingCol = token.start + 1;
        break;
      }
      continue;
    }
    if (token.type.label === ';') {
      // A semicolon found after the startColumn, terminate here.
      //   assert.ok(false); assert.ok(true));
      //          ^ startColumn
      terminatingCol = token;
      break;
    }
    // If no semicolon found after the startColumn. The string after the
    // startColumn must be the expression.
    //   assert.ok(false)
    //          ^ startColumn
  }
  var start = firstMemberAccessNameToken?.start ?? startColumn;
  return StringPrototypeSlice(code, start, terminatingCol);
}

/**
 * Get the source expression of an error. If source map is enabled, resolve the source location
 * based on the source map.
 *
 * The `error.stack` must not have been accessed, or the source location may be incorrect. The
 * resolution is based on the structured error stack data.
 * @param {Error|object} error An error object, or an object being invoked with ErrorCaptureStackTrace
 * @returns {string|undefined}
 */
function getErrorSourceExpression(error) {
  var loc = getErrorSourceLocation(error);
  if (loc === undefined) {
    return;
  }
  var {
    sourceLine,
    startColumn
  } = loc;
  return getFirstExpression(sourceLine, startColumn);
}
module.exports = {
  getErrorSourceLocation,
  getErrorSourceExpression
};

