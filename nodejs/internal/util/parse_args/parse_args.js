'use strict';

var {
  ArrayPrototypeForEach,
  ArrayPrototypeMap,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeUnshiftApply,
  ObjectEntries,
  ObjectPrototypeHasOwnProperty: ObjectHasOwn,
  StringPrototypeCharAt,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeStartsWith
} = primordials;
var {
  validateArray,
  validateBoolean,
  validateBooleanArray,
  validateObject,
  validateString,
  validateStringArray,
  validateUnion
} = require('internal/validators');
var {
  findLongOptionForShort,
  isLoneLongOption,
  isLoneShortOption,
  isLongOptionAndValue,
  isOptionValue,
  isOptionLikeValue,
  isShortOptionAndValue,
  isShortOptionGroup,
  useDefaultValueOption,
  objectGetOwn,
  optionsGetOwn
} = require('internal/util/parse_args/utils');
var {
  codes: {
    ERR_INVALID_ARG_VALUE,
    ERR_PARSE_ARGS_INVALID_OPTION_VALUE,
    ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL,
    ERR_PARSE_ARGS_UNKNOWN_OPTION
  }
} = require('internal/errors');
var {
  kEmptyObject
} = require('internal/util');
var {
  getOptionValue
} = require('internal/options');
function getMainArgs() {
  // -p / --print internally sets --eval, so this works for all cases
  var evalValue = getOptionValue('--eval');
  if (evalValue.length !== 0) {
    return ArrayPrototypeSlice(process.argv, 1);
  }
  return ArrayPrototypeSlice(process.argv, 2);
}

/**
 * In strict mode, throw for possible usage errors like --foo --bar
 * @param {object} token - from tokens as available from parseArgs
 */
function checkOptionLikeValue(token) {
  if (!token.inlineValue && isOptionLikeValue(token.value)) {
    // Only show short example if user used short option.
    var example = StringPrototypeStartsWith(token.rawName, '--') ? `'${token.rawName}=-XYZ'` : `'--${token.name}=-XYZ' or '${token.rawName}-XYZ'`;
    var errorMessage = `Option '${token.rawName}' argument is ambiguous.
Did you forget to specify the option argument for '${token.rawName}'?
To specify an option argument starting with a dash use ${example}.`;
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(errorMessage);
  }
}

/**
 * In strict mode, throw for usage errors.
 * @param {object} config - from config passed to parseArgs
 * @param {object} token - from tokens as available from parseArgs
 */
function checkOptionUsage(config, token) {
  var tokenName = token.name;
  if (!ObjectHasOwn(config.options, tokenName)) {
    // Check for negated boolean option.
    if (config.allowNegative && StringPrototypeStartsWith(tokenName, 'no-')) {
      tokenName = StringPrototypeSlice(tokenName, 3);
      if (!ObjectHasOwn(config.options, tokenName) || optionsGetOwn(config.options, tokenName, 'type') !== 'boolean') {
        throw new ERR_PARSE_ARGS_UNKNOWN_OPTION(token.rawName, config.allowPositionals);
      }
    } else {
      throw new ERR_PARSE_ARGS_UNKNOWN_OPTION(token.rawName, config.allowPositionals);
    }
  }
  var short = optionsGetOwn(config.options, tokenName, 'short');
  var shortAndLong = `${short ? `-${short}, ` : ''}--${tokenName}`;
  var type = optionsGetOwn(config.options, tokenName, 'type');
  if (type === 'string' && typeof token.value !== 'string') {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong} <value>' argument missing`);
  }
  // (Idiomatic test for undefined||null, expecting undefined.)
  if (type === 'boolean' && token.value != null) {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong}' does not take an argument`);
  }
}

/**
 * Store the option value in `values`.
 * @param {object} token - from tokens as available from parseArgs
 * @param {object} options - option configs, from parseArgs({ options })
 * @param {object} values - option values returned in `values` by parseArgs
 * @param {boolean} allowNegative - allow negative optinons if true
 */
function storeOption(token, options, values, allowNegative) {
  var longOption = token.name;
  var optionValue = token.value;
  if (longOption === '__proto__') {
    return; // No. Just no.
  }
  if (allowNegative && StringPrototypeStartsWith(longOption, 'no-') && optionValue === undefined) {
    // Boolean option negation: --no-foo
    longOption = StringPrototypeSlice(longOption, 3);
    token.name = longOption;
    optionValue = false;
  }

  // We store based on the option value rather than option type,
  // preserving the users intent for author to deal with.
  var newValue = optionValue ?? true;
  if (optionsGetOwn(options, longOption, 'multiple')) {
    // Always store value in array, including for boolean.
    // values[longOption] starts out not present,
    // first value is added as new array [newValue],
    // subsequent values are pushed to existing array.
    // (note: values has null prototype, so simpler usage)
    if (values[longOption]) {
      ArrayPrototypePush(values[longOption], newValue);
    } else {
      values[longOption] = [newValue];
    }
  } else {
    values[longOption] = newValue;
  }
}

/**
 * Store the default option value in `values`.
 * @param {string} longOption - long option name e.g. 'foo'
 * @param {string
 *         | boolean
 *         | string[]
 *         | boolean[]} optionValue - default value from option config
 * @param {object} values - option values returned in `values` by parseArgs
 */
function storeDefaultOption(longOption, optionValue, values) {
  if (longOption === '__proto__') {
    return; // No. Just no.
  }
  values[longOption] = optionValue;
}

/**
 * Process args and turn into identified tokens:
 * - option (along with value, if any)
 * - positional
 * - option-terminator
 * @param {string[]} args - from parseArgs({ args }) or mainArgs
 * @param {object} options - option configs, from parseArgs({ options })
 * @returns {any[]}
 */
function argsToTokens(args, options) {
  var tokens = [];
  var index = -1;
  var groupCount = 0;
  var remainingArgs = ArrayPrototypeSlice(args);
  while (remainingArgs.length > 0) {
    var arg = ArrayPrototypeShift(remainingArgs);
    var nextArg = remainingArgs[0];
    if (groupCount > 0) groupCount--;else index++;

    // Check if `arg` is an options terminator.
    // Guideline 10 in https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
    if (arg === '--') {
      // Everything after a bare '--' is considered a positional argument.
      ArrayPrototypePush(tokens, {
        kind: 'option-terminator',
        index
      });
      ArrayPrototypePushApply(tokens, ArrayPrototypeMap(remainingArgs, arg => {
        return {
          kind: 'positional',
          index: ++index,
          value: arg
        };
      }));
      break; // Finished processing args, leave while loop.
    }
    if (isLoneShortOption(arg)) {
      // e.g. '-f'
      var shortOption = StringPrototypeCharAt(arg, 1);
      var longOption = findLongOptionForShort(shortOption, options);
      var value = void 0;
      var inlineValue = void 0;
      if (optionsGetOwn(options, longOption, 'type') === 'string' && isOptionValue(nextArg)) {
        // e.g. '-f', 'bar'
        value = ArrayPrototypeShift(remainingArgs);
        inlineValue = false;
      }
      ArrayPrototypePush(tokens, {
        kind: 'option',
        name: longOption,
        rawName: arg,
        index,
        value,
        inlineValue
      });
      if (value != null) ++index;
      continue;
    }
    if (isShortOptionGroup(arg, options)) {
      // Expand -fXzy to -f -X -z -y
      var expanded = [];
      for (var _index = 1; _index < arg.length; _index++) {
        var _shortOption = StringPrototypeCharAt(arg, _index);
        var _longOption = findLongOptionForShort(_shortOption, options);
        if (optionsGetOwn(options, _longOption, 'type') !== 'string' || _index === arg.length - 1) {
          // Boolean option, or last short in group. Well formed.
          ArrayPrototypePush(expanded, `-${_shortOption}`);
        } else {
          // String option in middle. Yuck.
          // Expand -abfFILE to -a -b -fFILE
          ArrayPrototypePush(expanded, `-${StringPrototypeSlice(arg, _index)}`);
          break; // finished short group
        }
      }
      ArrayPrototypeUnshiftApply(remainingArgs, expanded);
      groupCount = expanded.length;
      continue;
    }
    if (isShortOptionAndValue(arg, options)) {
      // e.g. -fFILE
      var _shortOption2 = StringPrototypeCharAt(arg, 1);
      var _longOption2 = findLongOptionForShort(_shortOption2, options);
      var _value = StringPrototypeSlice(arg, 2);
      ArrayPrototypePush(tokens, {
        kind: 'option',
        name: _longOption2,
        rawName: `-${_shortOption2}`,
        index,
        value: _value,
        inlineValue: true
      });
      continue;
    }
    if (isLoneLongOption(arg)) {
      // e.g. '--foo'
      var _longOption3 = StringPrototypeSlice(arg, 2);
      var _value2 = void 0;
      var _inlineValue = void 0;
      if (optionsGetOwn(options, _longOption3, 'type') === 'string' && isOptionValue(nextArg)) {
        // e.g. '--foo', 'bar'
        _value2 = ArrayPrototypeShift(remainingArgs);
        _inlineValue = false;
      }
      ArrayPrototypePush(tokens, {
        kind: 'option',
        name: _longOption3,
        rawName: arg,
        index,
        value: _value2,
        inlineValue: _inlineValue
      });
      if (_value2 != null) ++index;
      continue;
    }
    if (isLongOptionAndValue(arg)) {
      // e.g. --foo=bar
      var equalIndex = StringPrototypeIndexOf(arg, '=');
      var _longOption4 = StringPrototypeSlice(arg, 2, equalIndex);
      var _value3 = StringPrototypeSlice(arg, equalIndex + 1);
      ArrayPrototypePush(tokens, {
        kind: 'option',
        name: _longOption4,
        rawName: `--${_longOption4}`,
        index,
        value: _value3,
        inlineValue: true
      });
      continue;
    }
    ArrayPrototypePush(tokens, {
      kind: 'positional',
      index,
      value: arg
    });
  }
  return tokens;
}
var parseArgs = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  var args = objectGetOwn(config, 'args') ?? getMainArgs();
  var strict = objectGetOwn(config, 'strict') ?? true;
  var allowPositionals = objectGetOwn(config, 'allowPositionals') ?? !strict;
  var returnTokens = objectGetOwn(config, 'tokens') ?? false;
  var allowNegative = objectGetOwn(config, 'allowNegative') ?? false;
  var options = objectGetOwn(config, 'options') ?? {
    __proto__: null
  };
  // Bundle these up for passing to strict-mode checks.
  var parseConfig = {
    args,
    strict,
    options,
    allowPositionals,
    allowNegative
  };

  // Validate input configuration.
  validateArray(args, 'args');
  validateBoolean(strict, 'strict');
  validateBoolean(allowPositionals, 'allowPositionals');
  validateBoolean(returnTokens, 'tokens');
  validateBoolean(allowNegative, 'allowNegative');
  validateObject(options, 'options');
  ArrayPrototypeForEach(ObjectEntries(options), _ref => {
    var {
      0: longOption,
      1: optionConfig
    } = _ref;
    validateObject(optionConfig, `options.${longOption}`);

    // type is required
    var optionType = objectGetOwn(optionConfig, 'type');
    validateUnion(optionType, `options.${longOption}.type`, ['string', 'boolean']);
    if (ObjectHasOwn(optionConfig, 'short')) {
      var shortOption = optionConfig.short;
      validateString(shortOption, `options.${longOption}.short`);
      if (shortOption.length !== 1) {
        throw new ERR_INVALID_ARG_VALUE(`options.${longOption}.short`, shortOption, 'must be a single character');
      }
    }
    var multipleOption = objectGetOwn(optionConfig, 'multiple');
    if (ObjectHasOwn(optionConfig, 'multiple')) {
      validateBoolean(multipleOption, `options.${longOption}.multiple`);
    }
    var defaultValue = objectGetOwn(optionConfig, 'default');
    if (defaultValue !== undefined) {
      var validator;
      switch (optionType) {
        case 'string':
          validator = multipleOption ? validateStringArray : validateString;
          break;
        case 'boolean':
          validator = multipleOption ? validateBooleanArray : validateBoolean;
          break;
      }
      validator(defaultValue, `options.${longOption}.default`);
    }
  });

  // Phase 1: identify tokens
  var tokens = argsToTokens(args, options);

  // Phase 2: process tokens into parsed option values and positionals
  var result = {
    values: {
      __proto__: null
    },
    positionals: []
  };
  if (returnTokens) {
    result.tokens = tokens;
  }
  ArrayPrototypeForEach(tokens, token => {
    if (token.kind === 'option') {
      if (strict) {
        checkOptionUsage(parseConfig, token);
        checkOptionLikeValue(token);
      }
      storeOption(token, options, result.values, parseConfig.allowNegative);
    } else if (token.kind === 'positional') {
      if (!allowPositionals) {
        throw new ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL(token.value);
      }
      ArrayPrototypePush(result.positionals, token.value);
    }
  });

  // Phase 3: fill in default values for missing args
  ArrayPrototypeForEach(ObjectEntries(options), _ref2 => {
    var {
      0: longOption,
      1: optionConfig
    } = _ref2;
    var mustSetDefault = useDefaultValueOption(longOption, optionConfig, result.values);
    if (mustSetDefault) {
      storeDefaultOption(longOption, objectGetOwn(optionConfig, 'default'), result.values);
    }
  });
  return result;
};
module.exports = {
  parseArgs
};

