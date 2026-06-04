'use strict';

var {
  ArrayPrototypeForEach,
  Error,
  EvalError,
  FunctionPrototypeCall,
  ObjectAssign,
  ObjectCreate,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetOwnPropertyNames,
  ObjectGetPrototypeOf,
  ObjectKeys,
  ObjectPrototypeToString,
  RangeError,
  ReferenceError,
  SafeSet,
  StringFromCharCode,
  StringPrototypeSubstring,
  SymbolFor,
  SymbolToStringTag,
  SyntaxError,
  TypeError,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength,
  TypedArrayPrototypeGetByteOffset,
  URIError
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  inspect: {
    custom: customInspectSymbol
  }
} = require('util');
var kSerializedError = 0;
var kSerializedObject = 1;
var kInspectedError = 2;
var kInspectedSymbol = 3;
var kCustomInspectedObject = 4;
var kCircularReference = 5;
var kSymbolStringLength = 'Symbol('.length;
var errors = {
  Error,
  TypeError,
  RangeError,
  URIError,
  SyntaxError,
  ReferenceError,
  EvalError
};
var errorConstructorNames = new SafeSet(ObjectKeys(errors));
function TryGetAllProperties(object) {
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : object;
  var rememberSet = arguments.length > 2 ? arguments[2] : undefined;
  var all = {
    __proto__: null
  };
  if (object === null) return all;
  ObjectAssign(all, TryGetAllProperties(ObjectGetPrototypeOf(object), target, rememberSet));
  var keys = ObjectGetOwnPropertyNames(object);
  ArrayPrototypeForEach(keys, key => {
    var descriptor;
    try {
      // TODO: create a null-prototype descriptor with needed properties only
      descriptor = ObjectGetOwnPropertyDescriptor(object, key);
    } catch {
      return;
    }
    var getter = descriptor.get;
    if (getter && key !== '__proto__') {
      try {
        descriptor.value = FunctionPrototypeCall(getter, target);
        delete descriptor.get;
        delete descriptor.set;
      } catch {
        // Continue regardless of error.
      }
    }
    if (key === 'cause') {
      descriptor.value = serializeError(descriptor.value, rememberSet);
      all[key] = descriptor;
    } else if ('value' in descriptor && typeof descriptor.value !== 'function' && typeof descriptor.value !== 'symbol') {
      all[key] = descriptor;
    }
  });
  return all;
}
function GetConstructors(object) {
  var constructors = [];
  for (var current = object; current !== null; current = ObjectGetPrototypeOf(current)) {
    var desc = ObjectGetOwnPropertyDescriptor(current, 'constructor');
    if (desc?.value) {
      ObjectDefineProperty(constructors, constructors.length, {
        __proto__: null,
        value: desc.value,
        enumerable: true
      });
    }
  }
  return constructors;
}
function GetName(object) {
  var desc = ObjectGetOwnPropertyDescriptor(object, 'name');
  return desc?.value;
}
var internalUtilInspect;
function inspect() {
  var _internalUtilInspect;
  internalUtilInspect ??= require('internal/util/inspect');
  return (_internalUtilInspect = internalUtilInspect).inspect.apply(_internalUtilInspect, arguments);
}
var serialize;
function serializeError(error) {
  var rememberSet = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new SafeSet();
  serialize ??= require('v8').serialize;
  if (typeof error === 'symbol') {
    return Buffer.from(StringFromCharCode(kInspectedSymbol) + inspect(error), 'utf8');
  }
  try {
    if (typeof error === 'object' && ObjectPrototypeToString(error) === '[object Error]') {
      if (rememberSet.has(error)) {
        return Buffer.from([kCircularReference]);
      }
      rememberSet.add(error);
      var constructors = GetConstructors(error);
      for (var i = 0; i < constructors.length; i++) {
        var name = GetName(constructors[i]);
        if (errorConstructorNames.has(name)) {
          var serialized = serialize({
            constructor: name,
            properties: TryGetAllProperties(error, error, rememberSet)
          });
          return Buffer.concat([Buffer.from([kSerializedError]), serialized]);
        }
      }
    }
  } catch {
    // Continue regardless of error.
  }
  try {
    if (error != null && customInspectSymbol in error) {
      return Buffer.from(StringFromCharCode(kCustomInspectedObject) + inspect(error), 'utf8');
    }
  } catch {
    // Continue regardless of error.
  }
  try {
    var _serialized = serialize(error);
    return Buffer.concat([Buffer.from([kSerializedObject]), _serialized]);
  } catch {
    // Continue regardless of error.
  }
  return Buffer.from(StringFromCharCode(kInspectedError) + inspect(error), 'utf8');
}
function fromBuffer(error) {
  return Buffer.from(TypedArrayPrototypeGetBuffer(error), TypedArrayPrototypeGetByteOffset(error) + 1, TypedArrayPrototypeGetByteLength(error) - 1);
}
var deserialize;
function deserializeError(error) {
  deserialize ??= require('v8').deserialize;
  switch (error[0]) {
    case kSerializedError:
      {
        var {
          constructor,
          properties
        } = deserialize(error.subarray(1));
        var ctor = errors[constructor];
        ObjectDefineProperty(properties, SymbolToStringTag, {
          __proto__: null,
          value: {
            __proto__: null,
            value: 'Error',
            configurable: true
          },
          enumerable: true
        });
        if ('cause' in properties && 'value' in properties.cause) {
          properties.cause.value = deserializeError(properties.cause.value);
        }
        return ObjectCreate(ctor.prototype, properties);
      }
    case kSerializedObject:
      return deserialize(error.subarray(1));
    case kInspectedError:
      return fromBuffer(error).toString('utf8');
    case kInspectedSymbol:
      {
        var buf = fromBuffer(error);
        return SymbolFor(StringPrototypeSubstring(buf.toString('utf8'), kSymbolStringLength, buf.length - 1));
      }
    case kCustomInspectedObject:
      return {
        __proto__: null,
        [customInspectSymbol]: () => fromBuffer(error).toString('utf8')
      };
    case kCircularReference:
      return {
        __proto__: null,
        [customInspectSymbol]: () => '[Circular object]'
      };
  }
  require('assert').fail('This should not happen');
}
module.exports = {
  serializeError,
  deserializeError
};

