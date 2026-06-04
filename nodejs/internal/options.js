'use strict';

var {
  ArrayPrototypeMap,
  ArrayPrototypeSort,
  ObjectEntries,
  ObjectFromEntries,
  ObjectKeys,
  StringPrototypeReplace
} = primordials;
var {
  getCLIOptionsValues,
  getCLIOptionsInfo,
  getOptionsAsFlags,
  getEmbedderOptions: getEmbedderOptionsFromBinding,
  getEnvOptionsInputType,
  getNamespaceOptionsInputType
} = internalBinding('options');
var warnOnAllowUnauthorized = true;
var optionsDict;
var cliInfo;
var embedderOptions;
var optionsFlags;

// getCLIOptionsValues() would serialize the option values from C++ land.
// It would error if the values are queried before bootstrap is
// complete so that we don't accidentally include runtime-dependent
// states into a runtime-independent snapshot.
function getCLIOptionsFromBinding() {
  return optionsDict ??= getCLIOptionsValues();
}
function getCLIOptionsInfoFromBinding() {
  return cliInfo ??= getCLIOptionsInfo();
}
function getOptionsAsFlagsFromBinding() {
  return optionsFlags ??= getOptionsAsFlags();
}
function getEmbedderOptions() {
  return embedderOptions ??= getEmbedderOptionsFromBinding();
}
function generateConfigJsonSchema() {
  var envOptionsMap = getEnvOptionsInputType();
  var namespaceOptionsMap = getNamespaceOptionsInputType();
  function createPropertyForOptionDetail(detail) {
    var {
      type,
      description
    } = detail;
    if (type === 'array') {
      return {
        __proto__: null,
        oneOf: [{
          __proto__: null,
          type: 'string'
        }, {
          __proto__: null,
          type: 'array',
          minItems: 1,
          items: {
            __proto__: null,
            type: 'string'
          }
        }],
        description
      };
    }
    return {
      __proto__: null,
      type,
      description
    };
  }
  var configSchema = {
    __proto__: null,
    additionalProperties: false,
    required: [],
    properties: {
      $schema: {
        __proto__: null,
        type: 'string'
      },
      nodeOptions: {
        __proto__: null,
        additionalProperties: false,
        required: [],
        properties: {
          __proto__: null
        },
        type: 'object'
      },
      nodeVersion: {
        __proto__: null,
        type: 'integer'
      },
      __proto__: null
    },
    type: 'object'
  };

  // Get the root properties object for adding namespaces
  var rootProperties = configSchema.properties;
  var nodeOptions = rootProperties.nodeOptions.properties;

  // Add env options to nodeOptions (backward compatibility)
  for (var {
    0: key,
    1: type
  } of ObjectEntries(envOptionsMap)) {
    var keyWithoutPrefix = StringPrototypeReplace(key, '--', '');
    nodeOptions[keyWithoutPrefix] = createPropertyForOptionDetail(type);
  }

  // Add namespace properties at the root level
  var _loop = function () {
    // Create namespace object at the root level
    rootProperties[namespace] = {
      __proto__: null,
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: {
        __proto__: null
      }
    };
    var namespaceProperties = rootProperties[namespace].properties;

    // Add all options for this namespace
    for (var {
      0: optionName,
      1: optionType
    } of ObjectEntries(optionsMap)) {
      var _keyWithoutPrefix = StringPrototypeReplace(optionName, '--', '');
      namespaceProperties[_keyWithoutPrefix] = createPropertyForOptionDetail(optionType);
    }

    // Sort the namespace properties alphabetically
    var sortedNamespaceKeys = ArrayPrototypeSort(ObjectKeys(namespaceProperties));
    var sortedNamespaceProperties = ObjectFromEntries(ArrayPrototypeMap(sortedNamespaceKeys, key => [key, namespaceProperties[key]]));
    rootProperties[namespace].properties = sortedNamespaceProperties;
  };
  for (var {
    0: namespace,
    1: optionsMap
  } of namespaceOptionsMap) {
    _loop();
  }

  // Sort the top-level properties by key alphabetically
  var sortedKeys = ArrayPrototypeSort(ObjectKeys(nodeOptions));
  var sortedProperties = ObjectFromEntries(ArrayPrototypeMap(sortedKeys, key => [key, nodeOptions[key]]));
  configSchema.properties.nodeOptions.properties = sortedProperties;

  // Also sort the root level properties
  var sortedRootKeys = ArrayPrototypeSort(ObjectKeys(rootProperties));
  var sortedRootProperties = ObjectFromEntries(ArrayPrototypeMap(sortedRootKeys, key => [key, rootProperties[key]]));
  configSchema.properties = sortedRootProperties;
  var schema = {
    __proto__: null,
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    oneOf: [{
      __proto__: null,
      $ref: '#/$defs/config'
    }, {
      __proto__: null,
      type: 'object',
      additionalProperties: false,
      required: ['configs'],
      properties: {
        __proto__: null,
        $schema: {
          __proto__: null,
          type: 'string'
        },
        configs: {
          __proto__: null,
          type: 'array',
          minItems: 1,
          items: {
            __proto__: null,
            type: 'object',
            additionalProperties: false,
            required: ['nodeVersion', 'config'],
            properties: {
              __proto__: null,
              nodeVersion: {
                __proto__: null,
                type: 'integer'
              },
              config: {
                __proto__: null,
                $ref: '#/$defs/config'
              }
            }
          }
        }
      }
    }],
    $defs: {
      __proto__: null,
      config: configSchema
    }
  };
  return schema;
}
function refreshOptions() {
  optionsDict = undefined;
}
function getOptionValue(optionName) {
  return getCLIOptionsFromBinding()[optionName];
}
function getAllowUnauthorized() {
  var allowUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
  if (allowUnauthorized && warnOnAllowUnauthorized) {
    warnOnAllowUnauthorized = false;
    process.emitWarning('Setting the NODE_TLS_REJECT_UNAUTHORIZED ' + 'environment variable to \'0\' makes TLS connections ' + 'and HTTPS requests insecure by disabling ' + 'certificate verification.');
  }
  return allowUnauthorized;
}
module.exports = {
  getCLIOptionsInfo: getCLIOptionsInfoFromBinding,
  getOptionValue,
  getOptionsAsFlagsFromBinding,
  getAllowUnauthorized,
  getEmbedderOptions,
  generateConfigJsonSchema,
  refreshOptions
};

