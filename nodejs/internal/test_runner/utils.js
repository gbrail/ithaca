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
var setupGlobalSetupTeardownFunctions = _async(function (globalSetupPath, cwd) {
  var globalSetupFunction;
  var globalTeardownFunction;
  return _invoke(function () {
    if (globalSetupPath) {
      validatePath(globalSetupPath, 'options.globalSetupPath');
      var fileURL = pathToFileURL(resolve(cwd, globalSetupPath));
      var cascadedLoader = require('internal/modules/esm/loader').getOrInitializeCascadedLoader();
      return _await(cascadedLoader.import(fileURL, pathToFileURL(cwd + sep).href, kEmptyObject), function (globalSetupModule) {
        if (globalSetupModule.globalSetup) {
          validateFunction(globalSetupModule.globalSetup, 'globalSetupModule.globalSetup');
          globalSetupFunction = globalSetupModule.globalSetup;
        }
        if (globalSetupModule.globalTeardown) {
          validateFunction(globalSetupModule.globalTeardown, 'globalSetupModule.globalTeardown');
          globalTeardownFunction = globalSetupModule.globalTeardown;
        }
      });
    }
  }, function () {
    return {
      __proto__: null,
      globalSetupFunction,
      globalTeardownFunction
    };
  });
});
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
var getReportersMap = _async(function (reporters, destinations) {
  return SafePromiseAllReturnArrayLike(reporters, _async(function (name, i) {
    var destination = kBuiltinDestinations.get(destinations[i]) ?? createWriteStream(destinations[i], {
      __proto__: null,
      flush: true
    });

    // Load the test reporter passed to --test-reporter
    var reporter = tryBuiltinReporter(name);
    return _invoke(function () {
      if (reporter === undefined) {
        var parentURL;
        try {
          parentURL = pathToFileURL(process.cwd() + '/').href;
        } catch {
          parentURL = 'file:///';
        }
        var cascadedLoader = require('internal/modules/esm/loader').getOrInitializeCascadedLoader();
        return _await(cascadedLoader.import(name, parentURL, {
          __proto__: null
        }), function (_cascadedLoader$impor) {
          reporter = _cascadedLoader$impor;
        });
      }
    }, function () {
      if (reporter?.default) {
        reporter = reporter.default;
      }
      if (reporter?.prototype && ObjectGetOwnPropertyDescriptor(reporter.prototype, 'constructor')) {
        reporter = new reporter();
      }
      if (!reporter) {
        throw new ERR_INVALID_ARG_VALUE('Reporter', name, 'is not a valid reporter');
      }
      return {
        __proto__: null,
        reporter,
        destination
      };
    });
  }));
});
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
var {
  ArrayPrototypeFlatMap,
  ArrayPrototypeForEach,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypeReduce,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  JSONParse,
  MathFloor,
  MathImul,
  MathMax,
  MathMin,
  MathRandom,
  NumberParseInt,
  NumberPrototypeToFixed,
  ObjectGetOwnPropertyDescriptor,
  PromiseWithResolvers,
  RegExp,
  RegExpPrototypeExec,
  SafeMap,
  SafePromiseAllReturnArrayLike,
  StringPrototypePadEnd,
  StringPrototypePadStart,
  StringPrototypeRepeat,
  StringPrototypeSlice,
  StringPrototypeSplit
} = primordials;
var {
  validateAndCanonicalizeTagFilter
} = require('internal/test_runner/tag_filter');
var {
  AsyncResource
} = require('async_hooks');
var {
  tracingChannel
} = require('diagnostics_channel');
var {
  relative,
  sep,
  resolve
} = require('path');
var {
  createWriteStream,
  readFileSync
} = require('fs');
var {
  pathToFileURL
} = require('internal/url');
var {
  getOptionValue
} = require('internal/options');
var {
  green,
  yellow,
  red,
  white,
  shouldColorize
} = require('internal/util/colors');
var {
  codes: {
    ERR_INVALID_ARG_VALUE,
    ERR_TEST_FAILURE
  },
  kIsNodeError
} = require('internal/errors');
var {
  compose
} = require('stream');
var {
  validateInteger,
  validateFunction,
  validateUint32
} = require('internal/validators');
var {
  validatePath
} = require('internal/fs/utils');
var {
  emitExperimentalWarning,
  kEmptyObject
} = require('internal/util');
var coverageColors = {
  __proto__: null,
  high: green,
  medium: yellow,
  low: red
};
var kMultipleCallbackInvocations = 'multipleCallbackInvocations';
var kRegExpPattern = /^\/(.*)\/([a-z]*)$/;
var kMaxRandomSeed = 0xFFFF_FFFF;
var kPatterns = ['test', 'test/**/*', 'test-*', '*[._-]test'];
var kFileExtensions = ['js', 'mjs', 'cjs'];
if (getOptionValue('--strip-types')) {
  ArrayPrototypePush(kFileExtensions, 'ts', 'mts', 'cts');
}
var kDefaultPattern = `**/{${ArrayPrototypeJoin(kPatterns, ',')}}.{${ArrayPrototypeJoin(kFileExtensions, ',')}}`;
function createDeferredCallback() {
  var calledCount = 0;
  var {
    promise,
    resolve,
    reject
  } = PromiseWithResolvers();
  var cb = err => {
    calledCount++;

    // If the callback is called a second time, let the user know, but
    // don't let them know more than once.
    if (calledCount > 1) {
      if (calledCount === 2) {
        throw new ERR_TEST_FAILURE('callback invoked multiple times', kMultipleCallbackInvocations);
      }
      return;
    }
    if (err) {
      return reject(err);
    }
    resolve();
  };
  return {
    __proto__: null,
    promise,
    cb
  };
}
function isTestFailureError(err) {
  return err?.code === 'ERR_TEST_FAILURE' && kIsNodeError in err;
}
function convertStringToRegExp(str, name) {
  var match = RegExpPrototypeExec(kRegExpPattern, str);
  var pattern = match?.[1] ?? str;
  var flags = match?.[2] || '';
  try {
    return new RegExp(pattern, flags);
  } catch (err) {
    var msg = err?.message;
    throw new ERR_INVALID_ARG_VALUE(name, str, `is an invalid regular expression.${msg ? ` ${msg}` : ''}`);
  }
}
var kBuiltinDestinations = new SafeMap([['stdout', process.stdout], ['stderr', process.stderr]]);
var kBuiltinReporters = new SafeMap([['spec', 'internal/test_runner/reporter/spec'], ['dot', 'internal/test_runner/reporter/dot'], ['tap', 'internal/test_runner/reporter/tap'], ['junit', 'internal/test_runner/reporter/junit'], ['lcov', 'internal/test_runner/reporter/lcov']]);
var kDefaultReporter = 'spec';
var kDefaultDestination = 'stdout';

/**
 * Create a random uint32 seed.
 * @returns {number}
 */
function createRandomSeed() {
  return MathFloor(MathRandom() * (kMaxRandomSeed + 1));
}

/**
 * Create a Mulberry32 pseudo-random number generator from a uint32 seed.
 * @param {number} seed
 * @returns {() => number}
 */
function createSeededGenerator(seed) {
  var state = seed >>> 0;
  return () => {
    state = state + 0x6D2B79F5 | 0;
    var value = MathImul(state ^ state >>> 15, 1 | state);
    value ^= value + MathImul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4_294_967_296;
  };
}

/**
 * Return a deterministically shuffled copy of an array.
 * @template T
 * @param {T[]} values
 * @param {number} seed
 * @returns {T[]}
 */
function shuffleArrayWithSeed(values, seed) {
  if (values.length < 2) {
    return values;
  }
  var randomized = ArrayPrototypeSlice(values);
  var random = createSeededGenerator(seed);
  for (var i = randomized.length - 1; i > 0; i--) {
    var j = MathFloor(random() * (i + 1));
    var tmp = randomized[i];
    randomized[i] = randomized[j];
    randomized[j] = tmp;
  }
  return randomized;
}
function tryBuiltinReporter(name) {
  var builtinPath = kBuiltinReporters.get(name);
  if (builtinPath === undefined) {
    return;
  }
  return require(builtinPath);
}
function shouldColorizeTestFiles(destinations) {
  // This function assumes only built-in destinations (stdout/stderr) supports coloring
  return ArrayPrototypeSome(destinations, (_, index) => {
    var destination = kBuiltinDestinations.get(destinations[index]);
    return destination && shouldColorize(destination);
  });
}
function parsePreviousRuns(rerunFailuresFilePath) {
  var data;
  try {
    data = readFileSync(rerunFailuresFilePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      data = '[]';
    } else {
      throw err;
    }
  }
  return JSONParse(data);
}
var reporterScope = new AsyncResource('TestReporterScope');
var testChannel = tracingChannel('node.test');
var globalTestOptions;
function parseCommandLine() {
  if (globalTestOptions) {
    return globalTestOptions;
  }
  var isTestRunner = getOptionValue('--test');
  var coverage = getOptionValue('--experimental-test-coverage');
  var forceExit = getOptionValue('--test-force-exit');
  var sourceMaps = getOptionValue('--enable-source-maps');
  var updateSnapshots = getOptionValue('--test-update-snapshots');
  var watch = getOptionValue('--watch');
  var timeout = getOptionValue('--test-timeout') || Infinity;
  var randomize = getOptionValue('--test-randomize');
  var hasRandomSeedOption = getOptionValue('[has_test_random_seed]');
  var randomSeedOption = getOptionValue('--test-random-seed');
  var randomSeed;
  var rerunFailuresFilePath = getOptionValue('--test-rerun-failures');
  var isChildProcess = process.env.NODE_TEST_CONTEXT === 'child';
  var isChildProcessV8 = process.env.NODE_TEST_CONTEXT === 'child-v8';
  var globalSetupPath;
  var concurrency;
  var coverageExcludeGlobs;
  var coverageIncludeGlobs;
  var lineCoverage;
  var branchCoverage;
  var functionCoverage;
  var destinations;
  var isolation;
  var only = getOptionValue('--test-only');
  var reporters;
  var shard;
  var testNamePatterns = mapPatternFlagToRegExArray('--test-name-pattern');
  var testSkipPatterns = mapPatternFlagToRegExArray('--test-skip-pattern');
  var testTagFilters = null;
  var testTagFilterExpressions = null;
  if (isChildProcessV8) {
    kBuiltinReporters.set('v8-serializer', 'internal/test_runner/reporter/v8-serializer');
    reporters = ['v8-serializer'];
    destinations = [kDefaultDestination];
  } else if (isChildProcess) {
    reporters = ['tap'];
    destinations = [kDefaultDestination];
  } else {
    destinations = getOptionValue('--test-reporter-destination');
    reporters = getOptionValue('--test-reporter');
    globalSetupPath = getOptionValue('--test-global-setup');
    if (reporters.length === 0 && destinations.length === 0) {
      ArrayPrototypePush(reporters, kDefaultReporter);
    }
    if (reporters.length === 1 && destinations.length === 0) {
      ArrayPrototypePush(destinations, kDefaultDestination);
    }
    if (destinations.length !== reporters.length) {
      throw new ERR_INVALID_ARG_VALUE('--test-reporter', reporters, 'must match the number of specified \'--test-reporter-destination\'');
    }
  }
  if (isTestRunner) {
    isolation = getOptionValue('--test-isolation');
    var tagFilterFlag = getOptionValue('--experimental-test-tag-filter');
    if (tagFilterFlag?.length > 0) {
      emitExperimentalWarning('Test tags');
      testTagFilterExpressions = tagFilterFlag;
      // Validate at parent startup so a malformed flag fails fast,
      // independent of isolation mode. Under isolation='process' the
      // validated strings go unused at the parent (children re-validate
      // and apply the filter); the validation here only surfaces input
      // errors early.
      var validated = ArrayPrototypeMap(tagFilterFlag, (value, i) => validateAndCanonicalizeTagFilter(value, `--experimental-test-tag-filter[${i}]`));
      if (isolation === 'none') {
        testTagFilters = validated;
      }
    }
    if (isolation === 'none') {
      concurrency = 1;
    } else {
      concurrency = getOptionValue('--test-concurrency') || true;
      only = false;
      testNamePatterns = null;
      testSkipPatterns = null;
    }
    var shardOption = getOptionValue('--test-shard');
    if (shardOption) {
      if (!RegExpPrototypeExec(/^\d+\/\d+$/, shardOption)) {
        throw new ERR_INVALID_ARG_VALUE('--test-shard', shardOption, 'must be in the form of <index>/<total>');
      }
      var indexAndTotal = StringPrototypeSplit(shardOption, '/', 2);
      shard = {
        __proto__: null,
        index: NumberParseInt(indexAndTotal[0], 10),
        total: NumberParseInt(indexAndTotal[1], 10)
      };
    }
  } else {
    concurrency = 1;
    var testNamePatternFlag = getOptionValue('--test-name-pattern');
    only = getOptionValue('--test-only');
    testNamePatterns = testNamePatternFlag?.length > 0 ? ArrayPrototypeMap(testNamePatternFlag, re => convertStringToRegExp(re, '--test-name-pattern')) : null;
    var testSkipPatternFlag = getOptionValue('--test-skip-pattern');
    testSkipPatterns = testSkipPatternFlag?.length > 0 ? ArrayPrototypeMap(testSkipPatternFlag, re => convertStringToRegExp(re, '--test-skip-pattern')) : null;
    var _tagFilterFlag = getOptionValue('--experimental-test-tag-filter');
    if (_tagFilterFlag?.length > 0) {
      emitExperimentalWarning('Test tags');
      testTagFilterExpressions = _tagFilterFlag;
      testTagFilters = ArrayPrototypeMap(_tagFilterFlag, (value, i) => validateAndCanonicalizeTagFilter(value, `--experimental-test-tag-filter[${i}]`));
    }
  }
  if (coverage) {
    coverageExcludeGlobs = getOptionValue('--test-coverage-exclude');
    if (!coverageExcludeGlobs || coverageExcludeGlobs.length === 0) {
      // TODO(pmarchini): this default should follow something similar to c8 defaults
      // Default exclusions should be also exported to be used by other tools / users
      coverageExcludeGlobs = [kDefaultPattern];
    }
    coverageIncludeGlobs = getOptionValue('--test-coverage-include');
    branchCoverage = getOptionValue('--test-coverage-branches');
    lineCoverage = getOptionValue('--test-coverage-lines');
    functionCoverage = getOptionValue('--test-coverage-functions');
    validateInteger(branchCoverage, '--test-coverage-branches', 0, 100);
    validateInteger(lineCoverage, '--test-coverage-lines', 0, 100);
    validateInteger(functionCoverage, '--test-coverage-functions', 0, 100);
  }
  if (rerunFailuresFilePath) {
    validatePath(rerunFailuresFilePath, '--test-rerun-failures');
  }
  if (hasRandomSeedOption) {
    validateUint32(randomSeedOption, '--test-random-seed');
    randomSeed = randomSeedOption;
    randomize = true;
  }
  var setup = reporterScope.bind(function (rootReporter) {
    return _await(getReportersMap(reporters, destinations), function (reportersMap) {
      for (var i = 0; i < reportersMap.length; i++) {
        var {
          reporter,
          destination
        } = reportersMap[i];
        compose(rootReporter, reporter).pipe(destination);
      }
      reporterScope.reporters = reportersMap;
    });
  });
  globalTestOptions = {
    __proto__: null,
    isTestRunner,
    concurrency,
    coverage,
    coverageExcludeGlobs,
    coverageIncludeGlobs,
    destinations,
    forceExit,
    isolation,
    branchCoverage,
    functionCoverage,
    lineCoverage,
    only,
    reporters,
    setup,
    globalSetupPath,
    shard,
    sourceMaps,
    testNamePatterns,
    testSkipPatterns,
    testTagFilterExpressions,
    testTagFilters,
    timeout,
    updateSnapshots,
    watch,
    randomize,
    randomSeed,
    rerunFailuresFilePath
  };
  return globalTestOptions;
}
function mapPatternFlagToRegExArray(flagName) {
  var patterns = getOptionValue(flagName);
  if (patterns?.length > 0) {
    return ArrayPrototypeMap(patterns, re => convertStringToRegExp(re, flagName));
  }
  return null;
}
function countCompletedTest(test) {
  var harness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : test.root.harness;
  if (test.nesting === 0) {
    harness.counters.topLevel++;
  }
  if (test.reportedType === 'suite') {
    harness.counters.suites++;
    if (!test.passed && !test.isTodo) {
      harness.success = false;
    }
    return;
  }
  // Check SKIP and TODO tests first, as those should not be counted as
  // failures.
  if (test.skipped) {
    harness.counters.skipped++;
  } else if (test.isTodo) {
    harness.counters.todo++;
  } else if (test.cancelled) {
    harness.counters.cancelled++;
    harness.success = false;
  } else if (!test.passed) {
    harness.counters.failed++;
    harness.success = false;
  } else {
    harness.counters.passed++;
  }
  harness.counters.tests++;
}
var memo = new SafeMap();
function addTableLine(prefix, width) {
  var key = `${prefix}-${width}`;
  var value = memo.get(key);
  if (value === undefined) {
    value = `${prefix}${StringPrototypeRepeat('-', width)}\n`;
    memo.set(key, value);
  }
  return value;
}
var kHorizontalEllipsis = '\u2026';
function truncateStart(string, width) {
  return string.length > width ? `${kHorizontalEllipsis}${StringPrototypeSlice(string, string.length - width + 1)}` : string;
}
function truncateEnd(string, width) {
  return string.length > width ? `${StringPrototypeSlice(string, 0, width - 1)}${kHorizontalEllipsis}` : string;
}
function formatLinesToRanges(values) {
  return ArrayPrototypeMap(ArrayPrototypeReduce(values, (prev, current, index, array) => {
    if (index > 0 && current - array[index - 1] === 1) {
      prev[prev.length - 1][1] = current;
    } else {
      prev.push([current]);
    }
    return prev;
  }, []), range => ArrayPrototypeJoin(range, '-'));
}
function getUncoveredLines(lines) {
  return ArrayPrototypeFlatMap(lines, line => line.count === 0 ? line.line : []);
}
function formatUncoveredLines(lines, table) {
  if (table) return ArrayPrototypeJoin(formatLinesToRanges(lines), ' ');
  return ArrayPrototypeJoin(lines, ', ');
}
var kColumns = ['line %', 'branch %', 'funcs %'];
var kColumnsKeys = ['coveredLinePercent', 'coveredBranchPercent', 'coveredFunctionPercent'];
var kSeparator = ' | ';
function buildFileTree(summary) {
  var tree = {
    __proto__: null
  };
  var treeDepth = 1;
  var longestFile = 0;
  ArrayPrototypeForEach(summary.files, file => {
    var longestPart = 0;
    var parts = StringPrototypeSplit(relative(summary.workingDirectory, file.path), sep);
    var current = tree;
    ArrayPrototypeForEach(parts, (part, index) => {
      current[part] ||= {
        __proto__: null
      };
      current = current[part];
      // If this is the last part, add the file to the tree
      if (index === parts.length - 1) {
        current.file = file;
      }
      // Keep track of the longest part for padding
      longestPart = MathMax(longestPart, part.length);
    });
    treeDepth = MathMax(treeDepth, parts.length);
    longestFile = MathMax(longestPart, longestFile);
  });
  return {
    __proto__: null,
    tree,
    treeDepth,
    longestFile
  };
}
function getCoverageReport(pad, summary, symbol, color, table) {
  var prefix = `${pad}${symbol}`;
  var report = `${color}${prefix}start of coverage report\n`;
  var filePadLength;
  var columnPadLengths = [];
  var uncoveredLinesPadLength;
  var tableWidth;

  // Create a tree of file paths
  var {
    tree,
    treeDepth,
    longestFile
  } = buildFileTree(summary);
  if (table) {
    // Calculate expected column sizes based on the tree
    filePadLength = table && longestFile;
    filePadLength += treeDepth - 1;
    if (color) {
      filePadLength += 2;
    }
    filePadLength = MathMax(filePadLength, 'all files'.length);
    if (filePadLength > process.stdout.columns / 2) {
      filePadLength = MathFloor(process.stdout.columns / 2);
    }
    var fileWidth = filePadLength + 2;
    columnPadLengths = ArrayPrototypeMap(kColumns, column => table ? MathMax(column.length, 6) : 0);
    var columnsWidth = ArrayPrototypeReduce(columnPadLengths, (acc, columnPadLength) => acc + columnPadLength + 3, 0);
    uncoveredLinesPadLength = table && ArrayPrototypeReduce(summary.files, (acc, file) => MathMax(acc, formatUncoveredLines(getUncoveredLines(file.lines), table).length), 0);
    uncoveredLinesPadLength = MathMax(uncoveredLinesPadLength, 'uncovered lines'.length);
    var uncoveredLinesWidth = uncoveredLinesPadLength + 2;
    tableWidth = fileWidth + columnsWidth + uncoveredLinesWidth;
    var availableWidth = (process.stdout.columns || Infinity) - prefix.length;
    var columnsExtras = tableWidth - availableWidth;
    if (table && columnsExtras > 0) {
      filePadLength = MathMin(availableWidth * 0.5, filePadLength);
      uncoveredLinesPadLength = MathMax(availableWidth - columnsWidth - (filePadLength + 2) - 2, 1);
      tableWidth = availableWidth;
    } else {
      uncoveredLinesPadLength = Infinity;
    }
  }
  function getCell(string, width, pad, truncate, coverage) {
    if (!table) return string;
    var result = string;
    if (pad) result = pad(result, width);
    if (truncate) result = truncate(result, width);
    if (color && coverage !== undefined) {
      if (coverage > 90) return `${coverageColors.high}${result}${color}`;
      if (coverage > 50) return `${coverageColors.medium}${result}${color}`;
      return `${coverageColors.low}${result}${color}`;
    }
    return result;
  }
  function writeReportLine(_ref) {
    var {
      file,
      depth = 0,
      coveragesColumns,
      fileCoverage,
      uncoveredLines
    } = _ref;
    var fileColumn = `${prefix}${StringPrototypeRepeat(' ', depth)}${getCell(file, filePadLength - depth, StringPrototypePadEnd, truncateStart, fileCoverage)}`;
    var coverageColumns = ArrayPrototypeJoin(ArrayPrototypeMap(coveragesColumns, (coverage, j) => {
      var coverageText = typeof coverage === 'number' ? NumberPrototypeToFixed(coverage, 2) : coverage;
      return getCell(coverageText, columnPadLengths[j], StringPrototypePadStart, false, coverage);
    }), kSeparator);
    var uncoveredLinesColumn = getCell(uncoveredLines, uncoveredLinesPadLength, false, truncateEnd);
    return `${fileColumn}${kSeparator}${coverageColumns}${kSeparator}${uncoveredLinesColumn}\n`;
  }
  function printCoverageBodyTree(tree) {
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var _loop = function () {
      if (tree[key].file?.path) {
        var file = tree[key].file;
        var fileName = ArrayPrototypePop(StringPrototypeSplit(file.path, sep));
        var fileCoverage = 0;
        var coverages = ArrayPrototypeMap(kColumnsKeys, columnKey => {
          var percent = file[columnKey];
          fileCoverage += percent;
          return percent;
        });
        fileCoverage /= kColumnsKeys.length;
        var uncoveredLines = formatUncoveredLines(getUncoveredLines(file.lines), table);
        report += writeReportLine({
          __proto__: null,
          file: fileName,
          depth: depth,
          coveragesColumns: coverages,
          fileCoverage: fileCoverage,
          uncoveredLines: uncoveredLines
        });
      } else {
        report += writeReportLine({
          __proto__: null,
          file: key,
          depth: depth,
          coveragesColumns: ArrayPrototypeMap(columnPadLengths, () => ''),
          fileCoverage: undefined,
          uncoveredLines: ''
        });
        printCoverageBodyTree(tree[key], depth + 1);
      }
    };
    for (var key in tree) {
      _loop();
    }
  }

  // -------------------------- Coverage Report --------------------------
  if (table) report += addTableLine(prefix, tableWidth);

  // Print the header
  report += writeReportLine({
    __proto__: null,
    file: 'file',
    coveragesColumns: kColumns,
    fileCoverage: undefined,
    uncoveredLines: 'uncovered lines'
  });
  if (table) report += addTableLine(prefix, tableWidth);

  // Print the body
  printCoverageBodyTree(tree);
  if (table) report += addTableLine(prefix, tableWidth);

  // Print the footer
  var allFilesCoverages = ArrayPrototypeMap(kColumnsKeys, columnKey => summary.totals[columnKey]);
  report += writeReportLine({
    __proto__: null,
    file: 'all files',
    coveragesColumns: allFilesCoverages,
    fileCoverage: undefined,
    uncoveredLines: ''
  });
  if (table) report += addTableLine(prefix, tableWidth);
  report += `${prefix}end of coverage report\n`;
  if (color) {
    report += white;
  }
  return report;
}
module.exports = {
  convertStringToRegExp,
  countCompletedTest,
  createRandomSeed,
  createSeededGenerator,
  createDeferredCallback,
  isTestFailureError,
  kDefaultPattern,
  kMaxRandomSeed,
  parseCommandLine,
  shuffleArrayWithSeed,
  reporterScope,
  shouldColorizeTestFiles,
  getCoverageReport,
  setupGlobalSetupTeardownFunctions,
  parsePreviousRuns,
  testChannel
};

