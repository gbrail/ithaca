'use strict';

var {
  ArrayPrototypePush,
  Int32Array,
  StringPrototypeEndsWith
} = primordials;
var {
  codes: {
    ERR_OUT_OF_RANGE
  }
} = require('internal/errors');
var colors = require('internal/util/colors');
var kNopLinesToCollapse = 5;
var kOperations = {
  DELETE: -1,
  NOP: 0,
  INSERT: 1
};
function areLinesEqual(actual, expected, checkCommaDisparity) {
  if (actual === expected) {
    return true;
  }
  if (checkCommaDisparity) {
    return actual + ',' === expected || actual === expected + ',';
  }
  return false;
}
function myersDiff(actual, expected) {
  var checkCommaDisparity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var actualLength = actual.length;
  var expectedLength = expected.length;
  var max = actualLength + expectedLength;
  if (max > 2 ** 31 - 1) {
    throw new ERR_OUT_OF_RANGE('myersDiff input size', '< 2^31', max);
  }
  var v = new Int32Array(2 * max + 1);
  var trace = [];
  for (var diffLevel = 0; diffLevel <= max; diffLevel++) {
    ArrayPrototypePush(trace, new Int32Array(v)); // Clone the current state of `v`

    for (var diagonalIndex = -diffLevel; diagonalIndex <= diffLevel; diagonalIndex += 2) {
      var offset = diagonalIndex + max;
      var previousOffset = v[offset - 1];
      var nextOffset = v[offset + 1];
      var x = diagonalIndex === -diffLevel || diagonalIndex !== diffLevel && previousOffset < nextOffset ? nextOffset : previousOffset + 1;
      var y = x - diagonalIndex;
      while (x < actualLength && y < expectedLength && areLinesEqual(actual[x], expected[y], checkCommaDisparity)) {
        x++;
        y++;
      }
      v[offset] = x;
      if (x >= actualLength && y >= expectedLength) {
        return backtrack(trace, actual, expected, checkCommaDisparity);
      }
    }
  }
}
function backtrack(trace, actual, expected, checkCommaDisparity) {
  var actualLength = actual.length;
  var expectedLength = expected.length;
  var max = actualLength + expectedLength;
  var x = actualLength;
  var y = expectedLength;
  var result = [];
  for (var diffLevel = trace.length - 1; diffLevel >= 0; diffLevel--) {
    var v = trace[diffLevel];
    var diagonalIndex = x - y;
    var offset = diagonalIndex + max;
    var prevDiagonalIndex = void 0;
    if (diagonalIndex === -diffLevel || diagonalIndex !== diffLevel && v[offset - 1] < v[offset + 1]) {
      prevDiagonalIndex = diagonalIndex + 1;
    } else {
      prevDiagonalIndex = diagonalIndex - 1;
    }
    var prevX = v[prevDiagonalIndex + max];
    var prevY = prevX - prevDiagonalIndex;
    while (x > prevX && y > prevY) {
      var actualItem = actual[x - 1];
      var value = checkCommaDisparity && !StringPrototypeEndsWith(actualItem, ',') ? expected[y - 1] : actualItem;
      ArrayPrototypePush(result, [kOperations.NOP, value]);
      x--;
      y--;
    }
    if (diffLevel > 0) {
      if (x > prevX) {
        ArrayPrototypePush(result, [kOperations.INSERT, actual[--x]]);
      } else {
        ArrayPrototypePush(result, [kOperations.DELETE, expected[--y]]);
      }
    }
  }
  return result;
}
function printSimpleMyersDiff(diff) {
  var message = '';
  for (var diffIdx = diff.length - 1; diffIdx >= 0; diffIdx--) {
    var {
      0: operation,
      1: value
    } = diff[diffIdx];
    var color = colors.white;
    if (operation === kOperations.INSERT) {
      color = colors.green;
    } else if (operation === kOperations.DELETE) {
      color = colors.red;
    }
    message += `${color}${value}${colors.white}`;
  }
  return `\n${message}`;
}
function printMyersDiff(diff, operator) {
  var message = '';
  var skipped = false;
  var nopCount = 0;
  for (var diffIdx = diff.length - 1; diffIdx >= 0; diffIdx--) {
    var {
      0: operation,
      1: value
    } = diff[diffIdx];
    var previousOperation = diffIdx < diff.length - 1 ? diff[diffIdx + 1][0] : null;

    // Avoid grouping if only one line would have been grouped otherwise
    if (previousOperation === kOperations.NOP && operation !== previousOperation) {
      if (nopCount === kNopLinesToCollapse + 1) {
        message += `${colors.white}  ${diff[diffIdx + 1][1]}\n`;
      } else if (nopCount === kNopLinesToCollapse + 2) {
        message += `${colors.white}  ${diff[diffIdx + 2][1]}\n`;
        message += `${colors.white}  ${diff[diffIdx + 1][1]}\n`;
      } else if (nopCount >= kNopLinesToCollapse + 3) {
        message += `${colors.blue}...${colors.white}\n`;
        message += `${colors.white}  ${diff[diffIdx + 1][1]}\n`;
        skipped = true;
      }
      nopCount = 0;
    }
    if (operation === kOperations.INSERT) {
      if (operator === 'partialDeepStrictEqual') {
        message += `${colors.gray}${colors.hasColors ? ' ' : '+'} ${value}${colors.white}\n`;
      } else {
        message += `${colors.green}+${colors.white} ${value}\n`;
      }
    } else if (operation === kOperations.DELETE) {
      message += `${colors.red}-${colors.white} ${value}\n`;
    } else if (operation === kOperations.NOP) {
      if (nopCount < kNopLinesToCollapse) {
        message += `${colors.white}  ${value}\n`;
      }
      nopCount++;
    }
  }
  message = message.trimEnd();
  return {
    message: `\n${message}`,
    skipped
  };
}
module.exports = {
  myersDiff,
  printMyersDiff,
  printSimpleMyersDiff
};

