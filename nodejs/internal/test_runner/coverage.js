'use strict';

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var {
  ArrayFrom,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  JSONParse,
  MathFloor,
  MathMax,
  MathMin,
  NumberParseInt,
  ObjectAssign,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolSplit,
  SafeMap,
  SafeSet,
  StringPrototypeIncludes,
  StringPrototypeLocaleCompare,
  StringPrototypeStartsWith,
  StringPrototypeTrim
} = primordials;
var {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  opendirSync,
  readFileSync,
  rmSync
} = require('fs');
var {
  setupCoverageHooks
} = require('internal/util');
var {
  tmpdir
} = require('os');
var {
  join,
  resolve,
  relative
} = require('path');
var {
  fileURLToPath,
  URL
} = require('internal/url');
var {
  kMappings,
  SourceMap
} = require('internal/source_map/source_map');
var {
  codes: {
    ERR_SOURCE_MAP_CORRUPT,
    ERR_SOURCE_MAP_MISSING_SOURCE
  }
} = require('internal/errors');
var {
  matchGlobPattern
} = require('internal/fs/glob');
var {
  constants: {
    kMockSearchParam
  }
} = require('internal/test_runner/mock/loader');
var kCoverageFileRegex = /^coverage-(\d+)-(\d{13})-(\d+)\.json$/;
var kIgnoreRegex = /\/\* node:coverage ignore next (?<count>\d+ )?\*\//;
var kLineEndingRegex = /\r?\n$/u;
var kLineSplitRegex = /(?<=\r?\n)/u;
var kStatusRegex = /\/\* node:coverage (?<status>enable|disable) \*\//;
var kTypeOnlyImportRegex = /^\s*import\s+type\b/u;
var kTypeScriptSourceRegex = /\.(?:cts|mts|ts)$/u;
var stripTypeScriptTypesForCoverage;
function getStripTypeScriptTypesForCoverage() {
  if (!process.config.variables.node_use_amaro) {
    return;
  }
  stripTypeScriptTypesForCoverage ??= require('internal/modules/typescript').stripTypeScriptTypesForCoverage;
  return stripTypeScriptTypesForCoverage;
}
var CoverageLine = /*#__PURE__*/_createClass(function CoverageLine(line, startOffset, src) {
  var length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : src?.length;
  _classCallCheck(this, CoverageLine);
  var newlineLength = src == null ? 0 : RegExpPrototypeExec(kLineEndingRegex, src)?.[0].length ?? 0;
  this.line = line;
  this.src = src;
  this.startOffset = startOffset;
  this.endOffset = startOffset + length - newlineLength;
  this.ignore = false;
  this.count = this.startOffset === this.endOffset ? 1 : 0;
});
var _sourceLines = /*#__PURE__*/new WeakMap();
var _typeScriptLines = /*#__PURE__*/new WeakMap();
var TestCoverage = /*#__PURE__*/function () {
  function TestCoverage(coverageDirectory, originalCoverageDirectory, options) {
    _classCallCheck(this, TestCoverage);
    _classPrivateFieldInitSpec(this, _sourceLines, new SafeMap());
    _classPrivateFieldInitSpec(this, _typeScriptLines, new SafeSet());
    this.coverageDirectory = coverageDirectory;
    this.originalCoverageDirectory = originalCoverageDirectory;
    this.options = options;
  }
  return _createClass(TestCoverage, [{
    key: "getLines",
    value: function getLines(fileUrl, source) {
      // Split the file source into lines. Make sure the lines maintain their
      // original line endings because those characters are necessary for
      // determining offsets in the file.
      if (_classPrivateFieldGet(_sourceLines, this).has(fileUrl)) {
        return _classPrivateFieldGet(_sourceLines, this).get(fileUrl);
      }
      try {
        source ??= readFileSync(fileURLToPath(fileUrl), 'utf8');
      } catch {
        // The file can no longer be read. It may have been deleted among
        // other possibilities. Leave it out of the coverage report.
        _classPrivateFieldGet(_sourceLines, this).set(fileUrl, null);
        return;
      }
      var linesWithBreaks = RegExpPrototypeSymbolSplit(kLineSplitRegex, source);
      var ignoreCount = 0;
      var enabled = true;
      var offset = 0;
      var lines = ArrayPrototypeMap(linesWithBreaks, (line, i) => {
        var startOffset = offset;
        var coverageLine = new CoverageLine(i + 1, startOffset, line);
        offset += line.length;

        // Determine if this line is being ignored.
        if (ignoreCount > 0) {
          ignoreCount--;
          coverageLine.ignore = true;
        } else if (!enabled) {
          coverageLine.ignore = true;
        }
        if (!coverageLine.ignore) {
          // If this line is not already being ignored, check for ignore
          // comments.
          var _match = RegExpPrototypeExec(kIgnoreRegex, line);
          if (_match !== null) {
            ignoreCount = NumberParseInt(_match.groups?.count ?? 1, 10);
          }
        }

        // Check for comments to enable/disable coverage no matter what. These
        // take precedence over ignore comments.
        var match = RegExpPrototypeExec(kStatusRegex, line);
        var status = match?.groups?.status;
        if (status) {
          ignoreCount = 0;
          enabled = status === 'enable';
        }
        return coverageLine;
      });
      _classPrivateFieldGet(_sourceLines, this).set(fileUrl, lines);
      return lines;
    }
  }, {
    key: "markTypeScriptOnlyLines",
    value: function markTypeScriptOnlyLines(fileUrl, source) {
      if (_classPrivateFieldGet(_typeScriptLines, this).has(fileUrl)) {
        return;
      }
      _classPrivateFieldGet(_typeScriptLines, this).add(fileUrl);
      if (RegExpPrototypeExec(kTypeScriptSourceRegex, fileUrl) === null) {
        return;
      }
      var lines = this.getLines(fileUrl, source);
      if (!lines) {
        return;
      }
      var strippedLines;
      var stripSource = getStripTypeScriptTypesForCoverage();
      if (stripSource) {
        source ??= readFileSync(fileURLToPath(fileUrl), 'utf8');
        try {
          strippedLines = RegExpPrototypeSymbolSplit(kLineSplitRegex, stripSource(source));
        } catch {
          strippedLines = undefined;
        }
      }
      for (var i = 0; i < lines.length; ++i) {
        var originalLine = lines[i].src;
        if (StringPrototypeTrim(originalLine).length === 0) {
          continue;
        }
        if (strippedLines?.[i] !== undefined) {
          if (StringPrototypeTrim(strippedLines[i]).length === 0) {
            lines[i].ignore = true;
          }
          continue;
        }
        if (RegExpPrototypeExec(kTypeOnlyImportRegex, originalLine) !== null) {
          lines[i].ignore = true;
        }
      }
    }
  }, {
    key: "summary",
    value: function summary() {
      internalBinding('profiler').takeCoverage();
      var coverage = this.getCoverageFromDirectory();
      var coverageSummary = {
        __proto__: null,
        workingDirectory: this.options.cwd,
        files: [],
        totals: {
          __proto__: null,
          totalLineCount: 0,
          totalBranchCount: 0,
          totalFunctionCount: 0,
          coveredLineCount: 0,
          coveredBranchCount: 0,
          coveredFunctionCount: 0,
          coveredLinePercent: 0,
          coveredBranchPercent: 0,
          coveredFunctionPercent: 0
        },
        thresholds: {
          __proto__: null,
          line: this.options.lineCoverage,
          branch: this.options.branchCoverage,
          function: this.options.functionCoverage
        }
      };
      if (!coverage) {
        return coverageSummary;
      }
      for (var i = 0; i < coverage.length; ++i) {
        var {
          functions,
          url
        } = coverage[i];
        var totalBranches = 0;
        var totalFunctions = 0;
        var branchesCovered = 0;
        var functionsCovered = 0;
        var functionReports = [];
        var branchReports = [];
        var lines = this.getLines(url);
        if (!lines) {
          continue;
        }
        for (var j = 0; j < functions.length; ++j) {
          var {
            isBlockCoverage,
            ranges
          } = functions[j];
          var maxCountPerFunction = 0;
          for (var k = 0; k < ranges.length; ++k) {
            var range = ranges[k];
            maxCountPerFunction = MathMax(maxCountPerFunction, range.count);

            // Add some useful data to the range. The test runner has read these ranges
            // from a file, so we own the data structures and can do what we want.
            ObjectAssign(range, mapRangeToLines(range, lines));
            if (isBlockCoverage) {
              ArrayPrototypePush(branchReports, {
                __proto__: null,
                line: range.lines[0]?.line,
                count: range.count
              });
              if (range.count !== 0 || range.ignoredLines === range.lines.length) {
                branchesCovered++;
              }
              totalBranches++;
            }
          }
          if (j > 0 && ranges.length > 0) {
            var _range = ranges[0];
            ArrayPrototypePush(functionReports, {
              __proto__: null,
              name: functions[j].functionName,
              count: maxCountPerFunction,
              line: _range.lines[0]?.line
            });
            if (_range.count !== 0 || _range.ignoredLines === _range.lines.length) {
              functionsCovered++;
            }
            totalFunctions++;
          }
        }
        var coveredCnt = 0;
        var lineReports = [];
        for (var _j = 0; _j < lines.length; ++_j) {
          var line = lines[_j];
          if (!line.ignore) {
            ArrayPrototypePush(lineReports, {
              __proto__: null,
              line: line.line,
              count: line.count
            });
          }
          if (line.count > 0 || line.ignore) {
            coveredCnt++;
          }
        }
        ArrayPrototypePush(coverageSummary.files, {
          __proto__: null,
          path: fileURLToPath(url),
          totalLineCount: lines.length,
          totalBranchCount: totalBranches,
          totalFunctionCount: totalFunctions,
          coveredLineCount: coveredCnt,
          coveredBranchCount: branchesCovered,
          coveredFunctionCount: functionsCovered,
          coveredLinePercent: toPercentage(coveredCnt, lines.length),
          coveredBranchPercent: toPercentage(branchesCovered, totalBranches),
          coveredFunctionPercent: toPercentage(functionsCovered, totalFunctions),
          functions: functionReports,
          branches: branchReports,
          lines: lineReports
        });
        coverageSummary.totals.totalLineCount += lines.length;
        coverageSummary.totals.totalBranchCount += totalBranches;
        coverageSummary.totals.totalFunctionCount += totalFunctions;
        coverageSummary.totals.coveredLineCount += coveredCnt;
        coverageSummary.totals.coveredBranchCount += branchesCovered;
        coverageSummary.totals.coveredFunctionCount += functionsCovered;
      }
      coverageSummary.totals.coveredLinePercent = toPercentage(coverageSummary.totals.coveredLineCount, coverageSummary.totals.totalLineCount);
      coverageSummary.totals.coveredBranchPercent = toPercentage(coverageSummary.totals.coveredBranchCount, coverageSummary.totals.totalBranchCount);
      coverageSummary.totals.coveredFunctionPercent = toPercentage(coverageSummary.totals.coveredFunctionCount, coverageSummary.totals.totalFunctionCount);
      coverageSummary.files.sort(sortCoverageFiles);
      return coverageSummary;
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      // Restore the original value of process.env.NODE_V8_COVERAGE. Then, copy
      // all of the created coverage files to the original coverage directory.
      internalBinding('profiler').endCoverage();
      if (this.originalCoverageDirectory === undefined) {
        delete process.env.NODE_V8_COVERAGE;
      } else {
        process.env.NODE_V8_COVERAGE = this.originalCoverageDirectory;
        var dir;
        try {
          mkdirSync(this.originalCoverageDirectory, {
            __proto__: null,
            recursive: true
          });
          dir = opendirSync(this.coverageDirectory);
          for (var entry; (entry = dir.readSync()) !== null;) {
            var src = join(this.coverageDirectory, entry.name);
            var dst = join(this.originalCoverageDirectory, entry.name);
            copyFileSync(src, dst);
          }
        } finally {
          if (dir) {
            dir.closeSync();
          }
        }
      }
      try {
        rmSync(this.coverageDirectory, {
          __proto__: null,
          recursive: true
        });
      } catch {
        // Ignore cleanup errors.
      }
    }
  }, {
    key: "getCoverageFromDirectory",
    value: function getCoverageFromDirectory() {
      var result = new SafeMap();
      var dir;
      try {
        dir = opendirSync(this.coverageDirectory);
        for (var entry; (entry = dir.readSync()) !== null;) {
          if (RegExpPrototypeExec(kCoverageFileRegex, entry.name) === null) {
            continue;
          }
          var coverageFile = join(this.coverageDirectory, entry.name);
          var coverage = JSONParse(readFileSync(coverageFile, 'utf8'));
          this.mergeCoverage(result, this.mapCoverageWithSourceMap(coverage));
        }
        return ArrayFrom(result.values());
      } finally {
        if (dir) {
          dir.closeSync();
        }
      }
    }
  }, {
    key: "mapCoverageWithSourceMap",
    value: function mapCoverageWithSourceMap(coverage) {
      var _this = this;
      var {
        result
      } = coverage;
      var sourceMapCache = coverage['source-map-cache'];
      if (!this.options.sourceMaps || !sourceMapCache) {
        return result;
      }
      var newResult = new SafeMap();
      var _loop = function () {
        var script = result[i];
        var {
          url,
          functions
        } = script;
        if (_this.shouldSkipFileCoverage(url) || sourceMapCache[url] == null) {
          newResult.set(url, script);
          return 1; // continue
        }
        var {
          data,
          lineLengths
        } = sourceMapCache[url];
        if (!data) throw new ERR_SOURCE_MAP_CORRUPT(url);
        var offset = 0;
        var executedLines = ArrayPrototypeMap(lineLengths, (length, i) => {
          var coverageLine = new CoverageLine(i + 1, offset, null, length + 1);
          offset += length + 1;
          return coverageLine;
        });
        for (var j = 0; j < data.sources.length; ++j) {
          var source = data.sourcesContent?.[j];
          if (source != null) {
            _this.getLines(data.sources[j], source);
          }
          _this.markTypeScriptOnlyLines(data.sources[j], source);
        }
        var sourceMap = new SourceMap(data, {
          __proto__: null,
          lineLengths
        });
        for (var _j2 = 0; _j2 < functions.length; ++_j2) {
          var {
            ranges,
            functionName,
            isBlockCoverage
          } = functions[_j2];
          if (ranges == null) {
            continue;
          }
          var newUrl = void 0;
          var newRanges = [];
          for (var k = 0; k < ranges.length; ++k) {
            var {
              startOffset,
              endOffset,
              count
            } = ranges[k];
            var {
              lines
            } = mapRangeToLines(ranges[k], executedLines);
            var startEntry = sourceMap.findEntry(lines[0].line - 1, MathMax(0, startOffset - lines[0].startOffset));
            var endEntry = sourceMap.findEntry(lines[lines.length - 1].line - 1, endOffset - lines[lines.length - 1].startOffset - 1);
            if (!startEntry.originalSource && endEntry.originalSource && lines[0].line === 1 && startOffset === 0 && lines[0].startOffset === 0) {
              // Edge case when the first line is not mappable
              var {
                2: originalSource,
                3: originalLine,
                4: originalColumn
              } = sourceMap[kMappings][0];
              startEntry = {
                __proto__: null,
                originalSource,
                originalLine,
                originalColumn
              };
            }
            if (!startEntry.originalSource || startEntry.originalSource !== endEntry.originalSource) {
              // The range is not mappable. Skip it.
              continue;
            }
            newUrl ??= startEntry?.originalSource;
            var mappedLines = _this.getLines(newUrl);
            if (!mappedLines) {
              throw new ERR_SOURCE_MAP_MISSING_SOURCE(newUrl, url);
            }
            var mappedStartOffset = _this.entryToOffset(startEntry, mappedLines);
            var mappedEndOffset = _this.entryToOffset(endEntry, mappedLines) + 1;
            if (mappedStartOffset < 0 || mappedEndOffset < 1) {
              // The range is not mappable. Skip it.
              continue;
            }
            for (var l = startEntry.originalLine; l <= endEntry.originalLine; l++) {
              mappedLines[l].count = count;
            }
            ArrayPrototypePush(newRanges, {
              __proto__: null,
              startOffset: mappedStartOffset,
              endOffset: mappedEndOffset,
              count
            });
          }
          if (!newUrl) {
            // No mappable ranges. Skip the function.
            continue;
          }
          var newScript = newResult.get(newUrl) ?? {
            __proto__: null,
            url: newUrl,
            functions: []
          };
          ArrayPrototypePush(newScript.functions, {
            __proto__: null,
            functionName,
            ranges: newRanges,
            isBlockCoverage
          });
          newResult.set(newUrl, newScript);
        }
      };
      for (var i = 0; i < result.length; ++i) {
        if (_loop()) continue;
      }
      return ArrayFrom(newResult.values());
    }
  }, {
    key: "entryToOffset",
    value: function entryToOffset(entry, lines) {
      var line = MathMax(entry.originalLine, 0);
      var mappedLine = lines[line];
      if (!mappedLine) {
        // Return -1 if the line is not mappable.
        return -1;
      }
      return MathMin(mappedLine.startOffset + entry.originalColumn, mappedLine.endOffset);
    }
  }, {
    key: "mergeCoverage",
    value: function mergeCoverage(merged, coverage) {
      for (var i = 0; i < coverage.length; ++i) {
        var newScript = coverage[i];
        var {
          url
        } = newScript;
        if (this.shouldSkipFileCoverage(url)) {
          continue;
        }
        var oldScript = merged.get(url);
        if (oldScript === undefined) {
          merged.set(url, newScript);
        } else {
          mergeCoverageScripts(oldScript, newScript);
        }
      }
    }
  }, {
    key: "shouldSkipFileCoverage",
    value: function shouldSkipFileCoverage(url) {
      // This check filters out core modules, which start with 'node:' in
      // coverage reports, as well as any invalid coverages which have been
      // observed on Windows.
      if (!StringPrototypeStartsWith(url, 'file:')) return true;
      var absolutePath = fileURLToPath(url);
      var relativePath = relative(this.options.cwd, absolutePath);
      var {
        coverageExcludeGlobs: excludeGlobs,
        coverageIncludeGlobs: includeGlobs
      } = this.options;

      // This check filters out files that match the exclude globs.
      if (excludeGlobs?.length > 0) {
        for (var i = 0; i < excludeGlobs.length; ++i) {
          if (matchGlobPattern(relativePath, excludeGlobs[i]) || matchGlobPattern(absolutePath, excludeGlobs[i])) return true;
        }
      }

      // This check filters out files that do not match the include globs.
      if (includeGlobs?.length > 0) {
        for (var _i = 0; _i < includeGlobs.length; ++_i) {
          if (matchGlobPattern(relativePath, includeGlobs[_i]) || matchGlobPattern(absolutePath, includeGlobs[_i])) return false;
        }
        return true;
      }
      var searchParams = new URL(url).searchParams;
      if (searchParams.get(kMockSearchParam)) {
        return true;
      }

      // This check filters out the node_modules/ directory, unless it is explicitly included.
      return StringPrototypeIncludes(url, '/node_modules/');
    }
  }]);
}();
function toPercentage(covered, total) {
  return total === 0 ? 100 : covered / total * 100;
}
function sortCoverageFiles(a, b) {
  return StringPrototypeLocaleCompare(a.path, b.path);
}
function setupCoverage(options) {
  var originalCoverageDirectory = process.env.NODE_V8_COVERAGE;

  // If NODE_V8_COVERAGE was already specified, convert it to an absolute path
  // and store it for later. The test runner will use a temporary directory
  // so that no preexisting coverage files interfere with the results of the
  // coverage report. Then, once the coverage is computed, move the coverage
  // files back to the original NODE_V8_COVERAGE directory.
  originalCoverageDirectory &&= resolve(options.cwd, originalCoverageDirectory);
  var coverageDirectory = mkdtempSync(join(tmpdir(), 'node-coverage-'));
  var enabled = setupCoverageHooks(coverageDirectory);
  if (!enabled) {
    return null;
  }
  internalBinding('profiler').startCoverage();

  // Ensure that NODE_V8_COVERAGE is set so that coverage can propagate to
  // child processes.
  process.env.NODE_V8_COVERAGE = coverageDirectory;
  return new TestCoverage(coverageDirectory, originalCoverageDirectory, options);
}
function mapRangeToLines(range, lines) {
  var {
    startOffset,
    endOffset,
    count
  } = range;
  var mappedLines = [];
  var ignoredLines = 0;
  var start = 0;
  var end = lines.length;
  var mid;
  while (start <= end) {
    mid = MathFloor((start + end) / 2);
    var line = lines[mid];
    if (startOffset >= line?.startOffset && startOffset <= line?.endOffset) {
      while (endOffset > line?.startOffset) {
        // If the range is not covered, and the range covers the entire line,
        // then mark that line as not covered.
        if (startOffset <= line.startOffset && endOffset >= line.endOffset) {
          line.count = count;
        }
        ArrayPrototypePush(mappedLines, line);
        if (line.ignore) {
          ignoredLines++;
        }
        mid++;
        line = lines[mid];
      }
      break;
    } else if (startOffset >= line?.endOffset) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }
  return {
    __proto__: null,
    lines: mappedLines,
    ignoredLines
  };
}
function mergeCoverageScripts(oldScript, newScript) {
  // Merge the functions from the new coverage into the functions from the
  // existing (merged) coverage.
  for (var i = 0; i < newScript.functions.length; ++i) {
    var newFn = newScript.functions[i];
    var found = false;
    for (var j = 0; j < oldScript.functions.length; ++j) {
      var oldFn = oldScript.functions[j];
      if (newFn.functionName === oldFn.functionName && newFn.ranges?.[0].startOffset === oldFn.ranges?.[0].startOffset && newFn.ranges?.[0].endOffset === oldFn.ranges?.[0].endOffset) {
        // These are the same functions.
        found = true;

        // If newFn is block level coverage, then it will:
        // - Replace oldFn if oldFn is not block level coverage.
        // - Merge with oldFn if it is also block level coverage.
        // If newFn is not block level coverage, then it has no new data.
        if (newFn.isBlockCoverage) {
          if (oldFn.isBlockCoverage) {
            // Merge the oldFn ranges with the newFn ranges.
            mergeCoverageRanges(oldFn, newFn);
          } else {
            // Replace oldFn with newFn.
            oldFn.isBlockCoverage = true;
            oldFn.ranges = newFn.ranges;
          }
        }
        break;
      }
    }
    if (!found) {
      // This is a new function to track. This is possible because V8 can
      // generate a different list of functions depending on which code paths
      // are executed. For example, if a code path dynamically creates a
      // function, but that code path is not executed then the function does
      // not show up in the coverage report. Unfortunately, this also means
      // that the function counts in the coverage summary can never be
      // guaranteed to be 100% accurate.
      ArrayPrototypePush(oldScript.functions, newFn);
    }
  }
}
function mergeCoverageRanges(oldFn, newFn) {
  var mergedRanges = new SafeSet();

  // Keep all of the existing covered ranges.
  for (var i = 0; i < oldFn.ranges.length; ++i) {
    var oldRange = oldFn.ranges[i];
    if (oldRange.count > 0) {
      mergedRanges.add(oldRange);
    }
  }

  // Merge in the new ranges where appropriate.
  for (var _i2 = 0; _i2 < newFn.ranges.length; ++_i2) {
    var newRange = newFn.ranges[_i2];
    var exactMatch = false;
    for (var j = 0; j < oldFn.ranges.length; ++j) {
      var _oldRange = oldFn.ranges[j];
      if (doesRangeEqualOtherRange(newRange, _oldRange)) {
        // These are the same ranges, so keep the existing one.
        _oldRange.count += newRange.count;
        mergedRanges.add(_oldRange);
        exactMatch = true;
        break;
      }

      // Look at ranges representing missing coverage and add ranges that
      // represent the intersection.
      if (_oldRange.count === 0 && newRange.count === 0) {
        if (doesRangeContainOtherRange(_oldRange, newRange)) {
          // The new range is completely within the old range. Discard the
          // larger (old) range, and keep the smaller (new) range.
          mergedRanges.add(newRange);
        } else if (doesRangeContainOtherRange(newRange, _oldRange)) {
          // The old range is completely within the new range. Discard the
          // larger (new) range, and keep the smaller (old) range.
          mergedRanges.add(_oldRange);
        }
      }
    }

    // Add new ranges that do not represent missing coverage.
    if (newRange.count > 0 && !exactMatch) {
      mergedRanges.add(newRange);
    }
  }
  oldFn.ranges = ArrayFrom(mergedRanges);
}
function doesRangeEqualOtherRange(range, otherRange) {
  return range.startOffset === otherRange.startOffset && range.endOffset === otherRange.endOffset;
}
function doesRangeContainOtherRange(range, otherRange) {
  return range.startOffset <= otherRange.startOffset && range.endOffset >= otherRange.endOffset;
}
module.exports = {
  setupCoverage,
  TestCoverage
};

