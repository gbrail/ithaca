'use strict';

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var {
  ArrayPrototypeFilter,
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  ArrayPrototypeSort,
  ArrayPrototypeUnshift,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetPrototypeOf,
  ObjectKeys,
  ReflectApply,
  RegExpPrototypeExec,
  SafeSet,
  StringPrototypeCodePointAt,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  StringPrototypeToLocaleLowerCase,
  StringPrototypeTrimStart
} = primordials;
var {
  kContextId,
  getREPLResourceName,
  globalBuiltins,
  getReplBuiltinLibs,
  fixReplRequire
} = require('internal/repl/utils');
var {
  sendInspectorCommand
} = require('internal/util/inspector');
var {
  isProxy
} = require('internal/util/types');
var CJSModule = require('internal/modules/cjs/loader').Module;
var {
  extensionFormatMap
} = require('internal/modules/esm/get_format');
var path = require('path');
var fs = require('fs');
var {
  constants: {
    ALL_PROPERTIES,
    SKIP_SYMBOLS
  },
  getOwnNonIndexProperties
} = internalBinding('util');
var {
  isIdentifierStart,
  isIdentifierChar,
  parse: acornParse
} = require('internal/deps/acorn/acorn/dist/acorn');
var acornWalk = require('internal/deps/acorn/acorn-walk/dist/walk');
var importRE = /\bimport\s*\(\s*['"`](([\w@./:-]+\/)?(?:[\w@./:-]*))(?![^'"`])$/;
var requireRE = /\brequire\s*\(\s*['"`](([\w@./:-]+\/)?(?:[\w@./:-]*))(?![^'"`])$/;
var fsAutoCompleteRE = /fs(?:\.promises)?\.\s*[a-z][a-zA-Z]+\(\s*["'](.*)/;
var versionedFileNamesRe = /-\d+\.\d+/;
fixReplRequire(module);
var {
  BuiltinModule
} = require('internal/bootstrap/realm');
var nodeSchemeBuiltinLibs = ArrayPrototypeMap(getReplBuiltinLibs(), lib => `node:${lib}`);
ArrayPrototypeForEach(BuiltinModule.getSchemeOnlyModuleNames(), lib => ArrayPrototypePush(nodeSchemeBuiltinLibs, `node:${lib}`));
function isIdentifier(str) {
  if (str === '') {
    return false;
  }
  var first = StringPrototypeCodePointAt(str, 0);
  if (!isIdentifierStart(first)) {
    return false;
  }
  var firstLen = first > 0xffff ? 2 : 1;
  for (var i = firstLen; i < str.length; i += 1) {
    var cp = StringPrototypeCodePointAt(str, i);
    if (!isIdentifierChar(cp)) {
      return false;
    }
    if (cp > 0xffff) {
      i += 1;
    }
  }
  return true;
}
function isNotLegacyObjectPrototypeMethod(str) {
  return isIdentifier(str) && str !== '__defineGetter__' && str !== '__defineSetter__' && str !== '__lookupGetter__' && str !== '__lookupSetter__';
}
function getGlobalLexicalScopeNames(contextId) {
  return sendInspectorCommand(session => {
    var names = [];
    session.post('Runtime.globalLexicalScopeNames', {
      executionContextId: contextId
    }, (error, result) => {
      if (!error) names = result.names;
    });
    return names;
  }, () => []);
}
function filteredOwnPropertyNames(obj) {
  if (!obj) return [];
  // `Object.prototype` is the only non-contrived object that fulfills
  // `Object.getPrototypeOf(X) === null &&
  //  Object.getPrototypeOf(Object.getPrototypeOf(X.constructor)) === X`.
  var isObjectPrototype = false;
  if (ObjectGetPrototypeOf(obj) === null) {
    var ctorDescriptor = ObjectGetOwnPropertyDescriptor(obj, 'constructor');
    if (ctorDescriptor?.value) {
      var ctorProto = ObjectGetPrototypeOf(ctorDescriptor.value);
      isObjectPrototype = ctorProto && ObjectGetPrototypeOf(ctorProto) === obj;
    }
  }
  var filter = ALL_PROPERTIES | SKIP_SYMBOLS;
  return ArrayPrototypeFilter(getOwnNonIndexProperties(obj, filter), isObjectPrototype ? isNotLegacyObjectPrototypeMethod : isIdentifier);
}
function addCommonWords(completionGroups) {
  // Only words which do not yet exist as global property should be added to
  // this list.
  ArrayPrototypePush(completionGroups, ['async', 'await', 'break', 'case', 'catch', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null', 'return', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield']);
}
function gracefulReaddir() {
  try {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return ReflectApply(fs.readdirSync, null, args);
  } catch {
    // Continue regardless of error.
  }
}
function completeFSFunctions(match) {
  var baseName = '';
  var filePath = match[1];
  var fileList = gracefulReaddir(filePath, {
    withFileTypes: true
  });
  if (!fileList) {
    baseName = path.basename(filePath);
    filePath = path.dirname(filePath);
    fileList = gracefulReaddir(filePath, {
      withFileTypes: true
    }) || [];
  }
  var completions = ArrayPrototypeMap(ArrayPrototypeFilter(fileList, dirent => StringPrototypeStartsWith(dirent.name, baseName)), d => d.name);
  return [[completions], baseName];
}

// Provide a list of completions for the given leading text. This is
// given to the readline interface for handling tab completion.
//
// Example:
//  complete('let foo = util.')
//    -> [['util.print', 'util.debug', 'util.log', 'util.inspect'],
//        'util.' ]
//
// Warning: This evals code like "foo.bar.baz", so it could run property
// getter code. To avoid potential triggering side-effects with getters the completion
// logic is skipped when getters or proxies are involved in the expression.
// (see: https://github.com/nodejs/node/issues/57829).
function complete(line, callback) {
  // List of completion lists, one for each inheritance "level"
  var completionGroups = [];
  var completeOn, group;

  // Ignore right whitespace. It could change the outcome.
  line = StringPrototypeTrimStart(line);
  var filter = '';
  var match;
  // REPL commands (e.g. ".break").
  if ((match = RegExpPrototypeExec(/^\s*\.(\w*)$/, line)) !== null) {
    ArrayPrototypePush(completionGroups, ObjectKeys(this.commands));
    completeOn = match[1];
    if (completeOn.length) {
      filter = completeOn;
    }
  } else if ((match = RegExpPrototypeExec(requireRE, line)) !== null) {
    // require('...<Tab>')
    completeOn = match[1];
    filter = completeOn;
    if (this.allowBlockingCompletions) {
      var subdir = match[2] || '';
      var extensions = ObjectKeys(CJSModule._extensions);
      var indexes = ArrayPrototypeMap(extensions, extension => `index${extension}`);
      ArrayPrototypePush(indexes, 'package.json', 'index');
      group = [];
      var paths = [];
      if (completeOn === '.') {
        group = ['./', '../'];
      } else if (completeOn === '..') {
        group = ['../'];
      } else if (RegExpPrototypeExec(/^\.\.?\//, completeOn) !== null) {
        paths = [process.cwd()];
      } else {
        paths = [];
        ArrayPrototypePushApply(paths, module.paths);
        ArrayPrototypePushApply(paths, CJSModule.globalPaths);
      }
      ArrayPrototypeForEach(paths, dir => {
        dir = path.resolve(dir, subdir);
        var dirents = gracefulReaddir(dir, {
          withFileTypes: true
        }) || [];
        ArrayPrototypeForEach(dirents, dirent => {
          if (RegExpPrototypeExec(versionedFileNamesRe, dirent.name) !== null || dirent.name === '.npm') {
            // Exclude versioned names that 'npm' installs.
            return;
          }
          var extension = path.extname(dirent.name);
          var base = StringPrototypeSlice(dirent.name, 0, -extension.length);
          if (!dirent.isDirectory()) {
            if (StringPrototypeIncludes(extensions, extension) && (!subdir || base !== 'index')) {
              ArrayPrototypePush(group, `${subdir}${base}`);
            }
            return;
          }
          ArrayPrototypePush(group, `${subdir}${dirent.name}/`);
          var absolute = path.resolve(dir, dirent.name);
          if (ArrayPrototypeSome(gracefulReaddir(absolute) || [], subfile => ArrayPrototypeIncludes(indexes, subfile))) {
            ArrayPrototypePush(group, `${subdir}${dirent.name}`);
          }
        });
      });
      if (group.length) {
        ArrayPrototypePush(completionGroups, group);
      }
    }
    ArrayPrototypePush(completionGroups, getReplBuiltinLibs(), nodeSchemeBuiltinLibs);
  } else if ((match = RegExpPrototypeExec(importRE, line)) !== null) {
    // import('...<Tab>')
    completeOn = match[1];
    filter = completeOn;
    if (this.allowBlockingCompletions) {
      var _subdir = match[2] || '';
      // File extensions that can be imported:
      var _extensions = ObjectKeys(extensionFormatMap);

      // Only used when loading bare module specifiers from `node_modules`:
      var _indexes = ArrayPrototypeMap(_extensions, ext => `index${ext}`);
      ArrayPrototypePush(_indexes, 'package.json');
      group = [];
      var _paths = [];
      if (completeOn === '.') {
        group = ['./', '../'];
      } else if (completeOn === '..') {
        group = ['../'];
      } else if (RegExpPrototypeExec(/^\.\.?\//, completeOn) !== null) {
        _paths = [process.cwd()];
      } else {
        _paths = ArrayPrototypeSlice(module.paths);
      }
      ArrayPrototypeForEach(_paths, dir => {
        dir = path.resolve(dir, _subdir);
        var isInNodeModules = path.basename(dir) === 'node_modules';
        var dirents = gracefulReaddir(dir, {
          withFileTypes: true
        }) || [];
        ArrayPrototypeForEach(dirents, dirent => {
          var {
            name
          } = dirent;
          if (RegExpPrototypeExec(versionedFileNamesRe, name) !== null || name === '.npm') {
            // Exclude versioned names that 'npm' installs.
            return;
          }
          if (!dirent.isDirectory()) {
            var extension = path.extname(name);
            if (StringPrototypeIncludes(_extensions, extension)) {
              ArrayPrototypePush(group, `${_subdir}${name}`);
            }
            return;
          }
          ArrayPrototypePush(group, `${_subdir}${name}/`);
          if (!_subdir && isInNodeModules) {
            var absolute = path.resolve(dir, name);
            var subfiles = gracefulReaddir(absolute) || [];
            if (ArrayPrototypeSome(subfiles, subfile => {
              return ArrayPrototypeIncludes(_indexes, subfile);
            })) {
              ArrayPrototypePush(group, `${_subdir}${name}`);
            }
          }
        });
      });
      if (group.length) {
        ArrayPrototypePush(completionGroups, group);
      }
    }
    ArrayPrototypePush(completionGroups, getReplBuiltinLibs(), nodeSchemeBuiltinLibs);
  } else if ((match = RegExpPrototypeExec(fsAutoCompleteRE, line)) !== null && this.allowBlockingCompletions) {
    ({
      0: completionGroups,
      1: completeOn
    } = completeFSFunctions(match));
  } else if (line.length === 0 || RegExpPrototypeExec(/\w|\.|\$/, line[line.length - 1]) !== null) {
    var completeTarget = line.length === 0 ? line : findExpressionCompleteTarget(line);
    if (line.length !== 0 && !completeTarget) {
      completionGroupsLoaded();
      return;
    }
    var expr = '';
    completeOn = completeTarget;
    if (StringPrototypeEndsWith(line, '.')) {
      expr = StringPrototypeSlice(completeTarget, 0, -1);
    } else if (line.length !== 0) {
      var bits = StringPrototypeSplit(completeTarget, '.');
      filter = ArrayPrototypePop(bits);
      expr = ArrayPrototypeJoin(bits, '.');
    }

    // Resolve expr and get its completions.
    if (!expr) {
      // Get global vars synchronously
      ArrayPrototypePush(completionGroups, getGlobalLexicalScopeNames(this[kContextId]));
      var contextProto = this.context;
      while ((contextProto = ObjectGetPrototypeOf(contextProto)) !== null) {
        ArrayPrototypePush(completionGroups, filteredOwnPropertyNames(contextProto));
      }
      var contextOwnNames = filteredOwnPropertyNames(this.context);
      if (!this.useGlobal) {
        // When the context is not `global`, builtins are not own
        // properties of it.
        // `globalBuiltins` is a `SafeSet`, not an Array-like.
        ArrayPrototypePush.apply(void 0, [contextOwnNames].concat(_toConsumableArray(globalBuiltins)));
      }
      ArrayPrototypePush(completionGroups, contextOwnNames);
      if (filter !== '') addCommonWords(completionGroups);
      completionGroupsLoaded();
      return;
    }

    // If the target ends with a dot (e.g. `obj.foo.`) such code won't be valid for AST parsing
    // so in order to make it correct we add an identifier to its end (e.g. `obj.foo.x`)
    var parsableCompleteTarget = completeTarget.endsWith('.') ? `${completeTarget}x` : completeTarget;
    var completeTargetAst;
    try {
      completeTargetAst = acornParse(parsableCompleteTarget, {
        __proto__: null,
        sourceType: 'module',
        ecmaVersion: 'latest'
      });
    } catch {/* No need to specifically handle parse errors */}
    if (!completeTargetAst) {
      return completionGroupsLoaded();
    }
    return includesProxiesOrGetters(completeTargetAst.body[0].expression, parsableCompleteTarget, this.eval, this.context, includes => {
      if (includes) {
        // The expression involves proxies or getters, meaning that it
        // can trigger side-effectful behaviors, so bail out
        return completionGroupsLoaded();
      }
      var chaining = '.';
      if (StringPrototypeEndsWith(expr, '?')) {
        expr = StringPrototypeSlice(expr, 0, -1);
        chaining = '?.';
      }
      var memberGroups = [];
      var evalExpr = `try { ${expr} } catch {}`;
      this.eval(evalExpr, this.context, getREPLResourceName(), (e, obj) => {
        try {
          var p;
          if (typeof obj === 'object' && obj !== null || typeof obj === 'function') {
            ArrayPrototypePush(memberGroups, filteredOwnPropertyNames(obj));
            p = ObjectGetPrototypeOf(obj);
          } else {
            p = obj.constructor ? obj.constructor.prototype : null;
          }
          // Circular refs possible? Let's guard against that.
          var sentinel = 5;
          while (p !== null && sentinel-- !== 0) {
            ArrayPrototypePush(memberGroups, filteredOwnPropertyNames(p));
            p = ObjectGetPrototypeOf(p);
          }
        } catch {
          // Maybe a Proxy object without `getOwnPropertyNames` trap.
          // We simply ignore it here, as we don't want to break the
          // autocompletion. Fixes the bug
          // https://github.com/nodejs/node/issues/2119
        }
        if (memberGroups.length) {
          expr += chaining;
          ArrayPrototypeForEach(memberGroups, group => {
            ArrayPrototypePush(completionGroups, ArrayPrototypeMap(group, member => `${expr}${member}`));
          });
          filter &&= `${expr}${filter}`;
        }
        completionGroupsLoaded();
      });
    });
  }
  return completionGroupsLoaded();

  // Will be called when all completionGroups are in place
  // Useful for async autocompletion
  function completionGroupsLoaded() {
    // Filter, sort (within each group), uniq and merge the completion groups.
    if (completionGroups.length && filter) {
      var newCompletionGroups = [];
      var lowerCaseFilter = StringPrototypeToLocaleLowerCase(filter);
      ArrayPrototypeForEach(completionGroups, group => {
        var filteredGroup = ArrayPrototypeFilter(group, str => {
          // Filter is always case-insensitive following chromium autocomplete
          // behavior.
          return StringPrototypeStartsWith(StringPrototypeToLocaleLowerCase(str), lowerCaseFilter);
        });
        if (filteredGroup.length) {
          ArrayPrototypePush(newCompletionGroups, filteredGroup);
        }
      });
      completionGroups = newCompletionGroups;
    }
    var completions = [];
    // Unique completions across all groups.
    var uniqueSet = new SafeSet();
    uniqueSet.add('');
    // Completion group 0 is the "closest" (least far up the inheritance
    // chain) so we put its completions last: to be closest in the REPL.
    ArrayPrototypeForEach(completionGroups, group => {
      ArrayPrototypeSort(group, (a, b) => b > a ? 1 : -1);
      var setSize = uniqueSet.size;
      ArrayPrototypeForEach(group, entry => {
        if (!uniqueSet.has(entry)) {
          ArrayPrototypeUnshift(completions, entry);
          uniqueSet.add(entry);
        }
      });
      // Add a separator between groups.
      if (uniqueSet.size !== setSize) {
        ArrayPrototypeUnshift(completions, '');
      }
    });

    // Remove obsolete group entry, if present.
    if (completions[0] === '') {
      ArrayPrototypeShift(completions);
    }
    callback(null, [completions, completeOn]);
  }
}

/**
 * This function tries to extract a target for tab completion from code representing an expression.
 *
 * Such target is basically the last piece of the expression that can be evaluated for the potential
 * tab completion.
 *
 * Some examples:
 * - The complete target for `const a = obj.b` is `obj.b`
 *   (because tab completion will evaluate and check the `obj.b` object)
 * - The complete target for `tru` is `tru`
 *   (since we'd ideally want to complete that to `true`)
 * - The complete target for `{ a: tru` is `tru`
 *   (like the last example, we'd ideally want that to complete to true)
 * - There is no complete target for `{ a: true }`
 *   (there is nothing to complete)
 * @param {string} code the code representing the expression to analyze
 * @returns {string|null} a substring of the code representing the complete target is there was one, `null` otherwise
 */
function findExpressionCompleteTarget(code) {
  if (!code) {
    return null;
  }
  if (code.at(-1) === '.') {
    if (code.at(-2) === '?') {
      // The code ends with the optional chaining operator (`?.`),
      // such code can't generate a valid AST so we need to strip
      // the suffix, run this function's logic and add back the
      // optional chaining operator to the result if present
      var _result = findExpressionCompleteTarget(code.slice(0, -2));
      return !_result ? _result : `${_result}?.`;
    }

    // The code ends with a dot, such code can't generate a valid AST
    // so we need to strip the suffix, run this function's logic and
    // add back the dot to the result if present
    var result = findExpressionCompleteTarget(code.slice(0, -1));
    return !result ? result : `${result}.`;
  }
  var ast;
  try {
    ast = acornParse(code, {
      __proto__: null,
      sourceType: 'module',
      ecmaVersion: 'latest'
    });
  } catch {
    var keywords = code.split(' ');
    if (keywords.length > 1) {
      // Something went wrong with the parsing, however this can be due to incomplete code
      // (that is for example missing a closing bracket, as for example `{ a: obj.te`), in
      // this case we take the last code keyword and try again
      // TODO(dario-piotrowicz): make this more robust, right now we only split by spaces
      //                         but that's not always enough, for example it doesn't handle
      //                         this code: `{ a: obj['hello world'].te`
      return findExpressionCompleteTarget(keywords.at(-1));
    }

    // The ast parsing has legitimately failed so we return null
    return null;
  }
  var lastBodyStatement = ast.body[ast.body.length - 1];
  if (!lastBodyStatement) {
    return null;
  }

  // If the last statement is a block we know there is not going to be a potential
  // completion target (e.g. in `{ a: true }` there is no completion to be done)
  if (lastBodyStatement.type === 'BlockStatement') {
    return null;
  }

  // If the last statement is an expression and it has a right side, that's what we
  // want to potentially complete on, so let's re-run the function's logic on that
  if (lastBodyStatement.type === 'ExpressionStatement' && lastBodyStatement.expression.right) {
    var exprRight = lastBodyStatement.expression.right;
    var exprRightCode = code.slice(exprRight.start, exprRight.end);
    return findExpressionCompleteTarget(exprRightCode);
  }

  // If the last statement is a variable declaration statement the last declaration is
  // what we can potentially complete on, so let's re-run the function's logic on that
  if (lastBodyStatement.type === 'VariableDeclaration') {
    var lastDeclarationInit = lastBodyStatement.declarations.at(-1).init;
    if (!lastDeclarationInit) {
      // If there is no initialization we can simply return
      return null;
    }
    var lastDeclarationInitCode = code.slice(lastDeclarationInit.start, lastDeclarationInit.end);
    return findExpressionCompleteTarget(lastDeclarationInitCode);
  }

  // If the last statement is an expression statement with a unary operator (delete, typeof, etc.)
  // we want to extract the argument for completion (e.g. for `delete obj.prop` we want `obj.prop`)
  if (lastBodyStatement.type === 'ExpressionStatement' && lastBodyStatement.expression.type === 'UnaryExpression' && lastBodyStatement.expression.argument) {
    var argument = lastBodyStatement.expression.argument;
    var argumentCode = code.slice(argument.start, argument.end);
    return findExpressionCompleteTarget(argumentCode);
  }

  // If the last statement is an expression statement with "new" syntax
  // we want to extract the callee for completion (e.g. for `new Sample` we want `Sample`)
  if (lastBodyStatement.type === 'ExpressionStatement' && lastBodyStatement.expression.type === 'NewExpression' && lastBodyStatement.expression.callee) {
    var callee = lastBodyStatement.expression.callee;
    var calleeCode = code.slice(callee.start, callee.end);
    return findExpressionCompleteTarget(calleeCode);
  }

  // Walk the AST for the current block of code, and check whether it contains any
  // statement or expression type that would potentially have side effects if evaluated.
  var isAllowed = true;
  var disallow = () => isAllowed = false;
  acornWalk.simple(lastBodyStatement, {
    ForInStatement: disallow,
    ForOfStatement: disallow,
    CallExpression: disallow,
    AssignmentExpression: disallow,
    UpdateExpression: disallow
  });
  if (!isAllowed) {
    return null;
  }

  // If any of the above early returns haven't activated then it means that
  // the potential complete target is the full code (e.g. the code represents
  // a simple partial identifier, a member expression, etc...)
  return code.slice(lastBodyStatement.start, lastBodyStatement.end);
}

/**
 * Utility used to determine if an expression includes object getters or proxies.
 *
 * Example: given `obj.foo`, the function lets you know if `foo` has a getter function
 * associated to it, or if `obj` is a proxy
 * @param {any} expr The expression, in AST format to analyze
 * @param {string} exprStr The string representation of the expression
 * @param {(str: string, ctx: any, resourceName: string, cb: (error, evaled) => void) => void} evalFn
 *   Eval function to use
 * @param {any} ctx The context to use for any code evaluation
 * @param {(includes: boolean) => void} callback Callback that will be called with the result of the operation
 * @returns {void}
 */
function includesProxiesOrGetters(expr, exprStr, evalFn, ctx, callback) {
  if (expr?.type !== 'MemberExpression') {
    // If the expression is not a member one for obvious reasons no getters are involved
    return callback(false);
  }
  if (expr.object.type === 'MemberExpression') {
    // The object itself is a member expression, so we need to recurse (e.g. the expression is `obj.foo.bar`)
    return includesProxiesOrGetters(expr.object, exprStr.slice(0, expr.object.end), evalFn, ctx, (includes, lastEvaledObj) => {
      if (includes) {
        // If the recurred call found a getter we can also terminate
        return callback(includes);
      }
      if (isProxy(lastEvaledObj)) {
        return callback(true);
      }

      // If a getter/proxy hasn't been found by the recursion call we need to check if maybe a getter/proxy
      // is present here (e.g. in `obj.foo.bar` we found that `obj.foo` doesn't involve any getters so we now
      // need to check if `bar` on `obj.foo` (i.e. `lastEvaledObj`) has a getter or if `obj.foo.bar` is a proxy)
      return hasGetterOrIsProxy(lastEvaledObj, expr.property, doesHaveGetterOrIsProxy => {
        return callback(doesHaveGetterOrIsProxy);
      });
    });
  }

  // This is the base of the recursion we have an identifier for the object and an identifier or literal
  // for the property (e.g. we have `obj.foo` or `obj['foo']`, `obj` is the object identifier and `foo`
  // is the property identifier/literal)
  if (expr.object.type === 'Identifier') {
    return evalFn(`try { ${expr.object.name} } catch {}`, ctx, getREPLResourceName(), (err, obj) => {
      if (err) {
        return callback(false);
      }
      if (isProxy(obj)) {
        return callback(true);
      }
      return hasGetterOrIsProxy(obj, expr.property, doesHaveGetterOrIsProxy => {
        if (doesHaveGetterOrIsProxy) {
          return callback(true);
        }
        return evalFn(`try { ${exprStr} } catch {} `, ctx, getREPLResourceName(), (err, obj) => {
          if (err) {
            return callback(false);
          }
          return callback(false, obj);
        });
      });
    });
  }

  /**
   * Utility to see if a property has a getter associated to it or if
   * the property itself is a proxy object.
   * @returns {void}
   */
  function hasGetterOrIsProxy(obj, astProp, cb) {
    if (!obj || !astProp) {
      return cb(false);
    }
    if (astProp.type === 'Literal') {
      // We have something like `obj['foo'].x` where `x` is the literal
      return propHasGetterOrIsProxy(obj, astProp.value, cb);
    }
    if (astProp.type === 'Identifier' && exprStr.at(astProp.start - 1) === '.') {
      // We have something like `obj.foo.x` where `foo` is the identifier
      return propHasGetterOrIsProxy(obj, astProp.name, cb);
    }
    return evalFn(
    // Note: this eval runs the property expression, which might be side-effectful, for example
    //       the user could be running `obj[getKey()].` where `getKey()` has some side effects.
    //       Arguably this behavior should not be too surprising, but if it turns out that it is,
    //       then we can revisit this behavior and add logic to analyze the property expression
    //       and eval it only if we can confidently say that it can't have any side effects
    `try { ${exprStr.slice(astProp.start, astProp.end)} } catch {} `, ctx, getREPLResourceName(), (err, evaledProp) => {
      if (err) {
        return cb(false);
      }
      if (typeof evaledProp === 'string') {
        return propHasGetterOrIsProxy(obj, evaledProp, cb);
      }
      return cb(false);
    });
  }
  return callback(false);
}

/**
 * Given an object and a property name, checks whether the property has a getter, if not checks whether its
 * value is a proxy.
 *
 * Note: the order is relevant here, we want to check whether the property has a getter _before_ we check
 *       whether its value is a proxy, to ensure that is the property does have a getter we don't end up
 *       triggering it when checking its value
 * @param {any} obj The target object
 * @param {string | number | bigint | boolean | RegExp} prop The target property
 * @param {(includes: boolean) => void} cb Callback that will be called with the result of the operation
 * @returns {void}
 */
function propHasGetterOrIsProxy(obj, prop, cb) {
  var propDescriptor = ObjectGetOwnPropertyDescriptor(obj, prop);
  var propHasGetter = typeof propDescriptor?.get === 'function';
  if (propHasGetter) {
    return cb(true);
  }
  if (isProxy(obj[prop])) {
    return cb(true);
  }
  return cb(false);
}
module.exports = {
  complete
};

