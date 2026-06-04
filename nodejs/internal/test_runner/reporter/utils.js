'use strict';

var {
  ArrayPrototypeJoin,
  RegExpPrototypeSymbolSplit,
  SafeMap,
  StringPrototypeRepeat,
  hardenRegExp
} = primordials;
var colors = require('internal/util/colors');
var {
  inspectWithNoCustomRetry
} = require('internal/errors');
var indentMemo = new SafeMap();
var inspectOptions = {
  __proto__: null,
  colors: colors.shouldColorize(process.stdout),
  breakLength: Infinity
};
var reporterUnicodeSymbolMap = {
  '__proto__': null,
  'test:fail': '\u2716 ',
  'test:pass': '\u2714 ',
  'test:diagnostic': '\u2139 ',
  'test:coverage': '\u2139 ',
  'arrow:right': '\u25B6 ',
  'hyphen:minus': '\uFE63 ',
  'warning:alert': '\u26A0 '
};
var reporterColorMap = {
  '__proto__': null,
  get 'test:fail'() {
    return colors.red;
  },
  get 'test:pass'() {
    return colors.green;
  },
  get 'test:diagnostic'() {
    return colors.blue;
  },
  get 'info'() {
    return colors.blue;
  },
  get 'warn'() {
    return colors.yellow;
  },
  get 'error'() {
    return colors.red;
  }
};
function indent(nesting) {
  var value = indentMemo.get(nesting);
  if (value === undefined) {
    value = StringPrototypeRepeat('  ', nesting);
    indentMemo.set(nesting, value);
  }
  return value;
}
function formatError(error, indent) {
  var err = error.code === 'ERR_TEST_FAILURE' ? error.cause : error;
  var message = ArrayPrototypeJoin(RegExpPrototypeSymbolSplit(hardenRegExp(/\r?\n/), inspectWithNoCustomRetry(err, inspectOptions)), `\n${indent}  `);
  return `\n${indent}  ${message}\n`;
}
function formatTestReport(type, data) {
  var showErrorDetails = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var prefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var indent = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
  var color = reporterColorMap[type] ?? colors.white;
  var symbol = reporterUnicodeSymbolMap[type] ?? ' ';
  var {
    skip,
    todo,
    expectFailure
  } = data;
  var duration_ms = data.details?.duration_ms ? ` ${colors.gray}(${data.details.duration_ms}ms)${colors.white}` : '';
  var replayed = data.details?.passed_on_attempt !== undefined ? ` ${colors.gray}(passed on attempt ${data.details.passed_on_attempt})${colors.white}` : '';
  var title = `${data.name}${duration_ms}${replayed}`;
  if (skip !== undefined) {
    title += ` # ${typeof skip === 'string' && skip.length ? skip : 'SKIP'}`;
    color = colors.gray;
    symbol = reporterUnicodeSymbolMap['hyphen:minus'];
  } else if (todo !== undefined) {
    title += ` # ${typeof todo === 'string' && todo.length ? todo : 'TODO'}`;
    if (type === 'test:fail') {
      color = colors.yellow;
      symbol = reporterUnicodeSymbolMap['warning:alert'];
    }
  } else if (expectFailure !== undefined) {
    title += ` # EXPECTED FAILURE`;
  }
  var err = showErrorDetails && data.details?.error ? formatError(data.details.error, indent) : '';
  return `${prefix}${indent}${color}${symbol}${title}${colors.white}${err}`;
}
module.exports = {
  __proto__: null,
  reporterUnicodeSymbolMap,
  reporterColorMap,
  formatTestReport,
  indent
};

