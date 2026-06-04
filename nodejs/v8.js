// Copyright (c) 2014, StrongLoop Inc.
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

'use strict';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var {
  Array,
  BigInt64Array,
  BigUint64Array,
  DataView,
  Error,
  Float32Array,
  Float64Array,
  Int16Array,
  Int32Array,
  Int8Array,
  JSONParse,
  ObjectPrototypeToString,
  SymbolDispose,
  Uint16Array,
  Uint32Array,
  Uint8Array,
  Uint8ClampedArray,
  globalThis: {
    Float16Array
  }
} = primordials;
var {
  Buffer
} = require('buffer');
var {
  validateString,
  validateOneOf,
  validateUint32
} = require('internal/validators');
var {
  Serializer,
  Deserializer
} = internalBinding('serdes');
var {
  namespace: startupSnapshot
} = require('internal/v8/startup_snapshot');
var {
  normalizeHeapProfileOptions
} = require('internal/v8/heap_profile');
var {
  normalizeCpuProfileOptions
} = require('internal/v8/cpu_profiler');
var profiler = {};
if (internalBinding('config').hasInspector) {
  profiler = internalBinding('profiler');
}
var assert = require('internal/assert');
var {
  inspect
} = require('internal/util/inspect');
var {
  FastBuffer
} = require('internal/buffer');
var {
  getValidatedPath
} = require('internal/fs/utils');
var {
  createHeapSnapshotStream,
  triggerHeapSnapshot
} = internalBinding('heap_utils');
var {
  HeapSnapshotStream,
  getHeapSnapshotOptions,
  queryObjects
} = require('internal/heap_utils');
var promiseHooks = require('internal/promise_hooks');
var {
  getOptionValue
} = require('internal/options');

/**
 * Generates a snapshot of the current V8 heap
 * and writes it to a JSON file.
 * @param {string} [filename]
 * @param {{
 *   exposeInternals?: boolean,
 *   exposeNumericValues?: boolean
 * }} [options]
 * @returns {string}
 */
function writeHeapSnapshot(filename, options) {
  if (filename !== undefined) {
    filename = getValidatedPath(filename);
  }
  var optionArray = getHeapSnapshotOptions(options);
  return triggerHeapSnapshot(filename, optionArray);
}

/**
 * Generates a snapshot of the current V8 heap
 * and returns a Readable Stream.
 * @param {{
 *   exposeInternals?: boolean,
 *   exposeNumericValues?: boolean
 * }} [options]
 * @returns {import('./stream.js').Readable}
 */
function getHeapSnapshot(options) {
  var optionArray = getHeapSnapshotOptions(options);
  var handle = createHeapSnapshotStream(optionArray);
  assert(handle);
  return new HeapSnapshotStream(handle);
}

// We need to get the buffer from the binding at the callsite since
// it's re-initialized after deserialization.
var binding = internalBinding('v8');
var {
  cachedDataVersionTag,
  setFlagsFromString: _setFlagsFromString,
  startCpuProfile: _startCpuProfile,
  stopCpuProfile: _stopCpuProfile,
  startHeapProfile: _startHeapProfile,
  stopHeapProfile: _stopHeapProfile,
  isStringOneByteRepresentation: _isStringOneByteRepresentation,
  updateHeapStatisticsBuffer,
  updateHeapSpaceStatisticsBuffer,
  updateHeapCodeStatisticsBuffer,
  setHeapSnapshotNearHeapLimit: _setHeapSnapshotNearHeapLimit,
  // Properties for heap statistics buffer extraction.
  kTotalHeapSizeIndex,
  kTotalHeapSizeExecutableIndex,
  kTotalPhysicalSizeIndex,
  kTotalAvailableSize,
  kUsedHeapSizeIndex,
  kHeapSizeLimitIndex,
  kDoesZapGarbageIndex,
  kMallocedMemoryIndex,
  kPeakMallocedMemoryIndex,
  kNumberOfNativeContextsIndex,
  kNumberOfDetachedContextsIndex,
  kTotalGlobalHandlesSizeIndex,
  kUsedGlobalHandlesSizeIndex,
  kExternalMemoryIndex,
  kTotalAllocatedBytes,
  // Properties for heap spaces statistics buffer extraction.
  kHeapSpaces,
  kSpaceSizeIndex,
  kSpaceUsedSizeIndex,
  kSpaceAvailableSizeIndex,
  kPhysicalSpaceSizeIndex,
  // Properties for heap code statistics buffer extraction.
  kCodeAndMetadataSizeIndex,
  kBytecodeAndMetadataSizeIndex,
  kExternalScriptSourceSizeIndex,
  kCPUProfilerMetaDataSizeIndex,
  heapStatisticsBuffer,
  heapCodeStatisticsBuffer,
  heapSpaceStatisticsBuffer,
  getCppHeapStatistics: _getCppHeapStatistics,
  detailLevel
} = binding;
var kNumberOfHeapSpaces = kHeapSpaces.length;

/**
 * Sets V8 command-line flags.
 * @param {string} flags
 * @returns {void}
 */
function setFlagsFromString(flags) {
  validateString(flags, 'flags');
  _setFlagsFromString(flags);
}
var _id = /*#__PURE__*/new WeakMap();
var _stopped = /*#__PURE__*/new WeakMap();
var SyncCPUProfileHandle = /*#__PURE__*/function () {
  function SyncCPUProfileHandle(id) {
    _classCallCheck(this, SyncCPUProfileHandle);
    _classPrivateFieldInitSpec(this, _id, null);
    _classPrivateFieldInitSpec(this, _stopped, false);
    _classPrivateFieldSet(_id, this, id);
  }
  return _createClass(SyncCPUProfileHandle, [{
    key: "stop",
    value: function stop() {
      if (_classPrivateFieldGet(_stopped, this)) {
        return;
      }
      _classPrivateFieldSet(_stopped, this, true);
      return _stopCpuProfile(_classPrivateFieldGet(_id, this));
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.stop();
    }
  }]);
}();
var _stopped2 = /*#__PURE__*/new WeakMap();
var SyncHeapProfileHandle = /*#__PURE__*/function () {
  function SyncHeapProfileHandle() {
    _classCallCheck(this, SyncHeapProfileHandle);
    _classPrivateFieldInitSpec(this, _stopped2, false);
  }
  return _createClass(SyncHeapProfileHandle, [{
    key: "stop",
    value: function stop() {
      if (_classPrivateFieldGet(_stopped2, this)) {
        return;
      }
      _classPrivateFieldSet(_stopped2, this, true);
      return _stopHeapProfile();
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.stop();
    }
  }]);
}();
/**
 * Starting CPU Profile.
 * @param {object} [options]
 * @param {number} [options.sampleInterval]
 * @param {number} [options.maxBufferSize]
 * @returns {SyncCPUProfileHandle}
 */
function startCpuProfile(options) {
  var {
    samplingIntervalMicros,
    maxSamples
  } = normalizeCpuProfileOptions(options);
  var id = _startCpuProfile(samplingIntervalMicros, maxSamples);
  return new SyncCPUProfileHandle(id);
}

/**
 * Starting Heap Profile.
 * @param {object} [options]
 * @param {number} [options.sampleInterval]
 * @param {number} [options.stackDepth]
 * @param {boolean} [options.forceGC]
 * @param {boolean} [options.includeObjectsCollectedByMajorGC]
 * @param {boolean} [options.includeObjectsCollectedByMinorGC]
 * @returns {SyncHeapProfileHandle}
 */
function startHeapProfile(options) {
  var {
    sampleInterval,
    stackDepth,
    flags
  } = normalizeHeapProfileOptions(options);
  _startHeapProfile(sampleInterval, stackDepth, flags);
  return new SyncHeapProfileHandle();
}

/**
 * Return whether this string uses one byte as underlying representation or not.
 * @param {string} content
 * @returns {boolean}
 */
function isStringOneByteRepresentation(content) {
  validateString(content, 'content');
  return _isStringOneByteRepresentation(content);
}

/**
 * Gets the current V8 heap statistics.
 * @returns {{
 *   total_heap_size: number;
 *   total_heap_size_executable: number;
 *   total_physical_size: number;
 *   total_available_size: number;
 *   used_heap_size: number;
 *   heap_size_limit: number;
 *   malloced_memory: number;
 *   peak_malloced_memory: number;
 *   does_zap_garbage: number;
 *   number_of_native_contexts: number;
 *   number_of_detached_contexts: number;
 *   }}
 */
function getHeapStatistics() {
  var buffer = heapStatisticsBuffer;
  updateHeapStatisticsBuffer();
  return {
    total_heap_size: buffer[kTotalHeapSizeIndex],
    total_heap_size_executable: buffer[kTotalHeapSizeExecutableIndex],
    total_physical_size: buffer[kTotalPhysicalSizeIndex],
    total_available_size: buffer[kTotalAvailableSize],
    used_heap_size: buffer[kUsedHeapSizeIndex],
    heap_size_limit: buffer[kHeapSizeLimitIndex],
    malloced_memory: buffer[kMallocedMemoryIndex],
    peak_malloced_memory: buffer[kPeakMallocedMemoryIndex],
    does_zap_garbage: buffer[kDoesZapGarbageIndex],
    number_of_native_contexts: buffer[kNumberOfNativeContextsIndex],
    number_of_detached_contexts: buffer[kNumberOfDetachedContextsIndex],
    total_global_handles_size: buffer[kTotalGlobalHandlesSizeIndex],
    used_global_handles_size: buffer[kUsedGlobalHandlesSizeIndex],
    external_memory: buffer[kExternalMemoryIndex],
    total_allocated_bytes: buffer[kTotalAllocatedBytes]
  };
}

/**
 * Gets the current V8 heap space statistics.
 * @returns {{
 *   space_name: string;
 *   space_size: number;
 *   space_used_size: number;
 *   space_available_size: number;
 *   physical_space_size: number;
 *   }[]}
 */
function getHeapSpaceStatistics() {
  var heapSpaceStatistics = new Array(kNumberOfHeapSpaces);
  var buffer = heapSpaceStatisticsBuffer;
  for (var i = 0; i < kNumberOfHeapSpaces; i++) {
    updateHeapSpaceStatisticsBuffer(i);
    heapSpaceStatistics[i] = {
      space_name: kHeapSpaces[i],
      space_size: buffer[kSpaceSizeIndex],
      space_used_size: buffer[kSpaceUsedSizeIndex],
      space_available_size: buffer[kSpaceAvailableSizeIndex],
      physical_space_size: buffer[kPhysicalSpaceSizeIndex]
    };
  }
  return heapSpaceStatistics;
}

/**
 * Gets the current V8 heap code statistics.
 * @returns {{
 *   code_and_metadata_size: number;
 *   bytecode_and_metadata_size: number;
 *   external_script_source_size: number;
 *   cpu_profiler_metadata_size: number;
 *   }}
 */
function getHeapCodeStatistics() {
  var buffer = heapCodeStatisticsBuffer;
  updateHeapCodeStatisticsBuffer();
  return {
    code_and_metadata_size: buffer[kCodeAndMetadataSizeIndex],
    bytecode_and_metadata_size: buffer[kBytecodeAndMetadataSizeIndex],
    external_script_source_size: buffer[kExternalScriptSourceSizeIndex],
    cpu_profiler_metadata_size: buffer[kCPUProfilerMetaDataSizeIndex]
  };
}
var heapSnapshotNearHeapLimitCallbackAdded = false;
function setHeapSnapshotNearHeapLimit(limit) {
  validateUint32(limit, 'limit', true);
  if (heapSnapshotNearHeapLimitCallbackAdded || getOptionValue('--heapsnapshot-near-heap-limit') > 0) {
    return;
  }
  heapSnapshotNearHeapLimitCallbackAdded = true;
  _setHeapSnapshotNearHeapLimit(limit);
}
var detailLevelDict = {
  __proto__: null,
  detailed: detailLevel.DETAILED,
  brief: detailLevel.BRIEF
};
function getCppHeapStatistics() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'detailed';
  validateOneOf(type, 'type', ['brief', 'detailed']);
  var result = _getCppHeapStatistics(detailLevelDict[type]);
  result.detail_level = type;
  return result;
}

/* V8 serialization API */

/* JS methods for the base objects */
Serializer.prototype._getDataCloneError = Error;

/**
 * Reads raw bytes from the deserializer's internal buffer.
 * @param {number} length
 * @returns {Buffer}
 */
Deserializer.prototype.readRawBytes = function readRawBytes(length) {
  var offset = this._readRawBytes(length);
  // `this.buffer` can be a Buffer or a plain Uint8Array, so just calling
  // `.slice()` doesn't work.
  return new FastBuffer(this.buffer.buffer, this.buffer.byteOffset + offset, length);
};
function arrayBufferViewTypeToIndex(abView) {
  var type = ObjectPrototypeToString(abView);
  if (type === '[object Int8Array]') return 0;
  if (type === '[object Uint8Array]') return 1;
  if (type === '[object Uint8ClampedArray]') return 2;
  if (type === '[object Int16Array]') return 3;
  if (type === '[object Uint16Array]') return 4;
  if (type === '[object Int32Array]') return 5;
  if (type === '[object Uint32Array]') return 6;
  if (type === '[object Float32Array]') return 7;
  if (type === '[object Float64Array]') return 8;
  if (type === '[object DataView]') return 9;
  // Index 10 is FastBuffer.
  if (type === '[object BigInt64Array]') return 11;
  if (type === '[object BigUint64Array]') return 12;
  if (type === '[object Float16Array]') return 13;
  return -1;
}
function arrayBufferViewIndexToType(index) {
  if (index === 0) return Int8Array;
  if (index === 1) return Uint8Array;
  if (index === 2) return Uint8ClampedArray;
  if (index === 3) return Int16Array;
  if (index === 4) return Uint16Array;
  if (index === 5) return Int32Array;
  if (index === 6) return Uint32Array;
  if (index === 7) return Float32Array;
  if (index === 8) return Float64Array;
  if (index === 9) return DataView;
  if (index === 10) return FastBuffer;
  if (index === 11) return BigInt64Array;
  if (index === 12) return BigUint64Array;
  if (index === 13) return Float16Array;
  return undefined;
}
var DefaultSerializer = /*#__PURE__*/function (_Serializer) {
  function DefaultSerializer() {
    var _this;
    _classCallCheck(this, DefaultSerializer);
    _this = _callSuper(this, DefaultSerializer);
    _this._setTreatArrayBufferViewsAsHostObjects(true);
    return _this;
  }

  /**
   * Used to write some kind of host object, i.e. an
   * object that is created by native C++ bindings.
   * @param {object} abView
   * @returns {void}
   */
  _inherits(DefaultSerializer, _Serializer);
  return _createClass(DefaultSerializer, [{
    key: "_writeHostObject",
    value: function _writeHostObject(abView) {
      // Keep track of how to handle different ArrayBufferViews. The default
      // Serializer for Node does not use the V8 methods for serializing those
      // objects because Node's `Buffer` objects use pooled allocation in many
      // cases, and their underlying `ArrayBuffer`s would show up in the
      // serialization. Because a) those may contain sensitive data and the user
      // may not be aware of that and b) they are often much larger than the
      // `Buffer` itself, custom serialization is applied.
      var i = 10; // FastBuffer
      if (abView.constructor !== Buffer) {
        i = arrayBufferViewTypeToIndex(abView);
        if (i === -1) {
          throw new this._getDataCloneError(`Unserializable host object: ${inspect(abView)}`);
        }
      }
      this.writeUint32(i);
      this.writeUint32(abView.byteLength);
      this.writeRawBytes(new Uint8Array(abView.buffer, abView.byteOffset, abView.byteLength));
    }
  }]);
}(Serializer);
var DefaultDeserializer = /*#__PURE__*/function (_Deserializer) {
  function DefaultDeserializer() {
    _classCallCheck(this, DefaultDeserializer);
    return _callSuper(this, DefaultDeserializer, arguments);
  }
  _inherits(DefaultDeserializer, _Deserializer);
  return _createClass(DefaultDeserializer, [{
    key: "_readHostObject",
    value:
    /**
     * Used to read some kind of host object, i.e. an
     * object that is created by native C++ bindings.
     * @returns {any}
     */
    function _readHostObject() {
      var typeIndex = this.readUint32();
      var ctor = arrayBufferViewIndexToType(typeIndex);
      var byteLength = this.readUint32();
      var byteOffset = this._readRawBytes(byteLength);
      var BYTES_PER_ELEMENT = ctor.BYTES_PER_ELEMENT || 1;
      var offset = this.buffer.byteOffset + byteOffset;
      if (offset % BYTES_PER_ELEMENT === 0) {
        return new ctor(this.buffer.buffer, offset, byteLength / BYTES_PER_ELEMENT);
      }
      // Copy to an aligned buffer first.
      var buffer_copy = Buffer.allocUnsafe(byteLength);
      buffer_copy.set(new Uint8Array(this.buffer.buffer, this.buffer.byteOffset + byteOffset, byteLength));
      return new ctor(buffer_copy.buffer, buffer_copy.byteOffset, byteLength / BYTES_PER_ELEMENT);
    }
  }]);
}(Deserializer);
/**
 * Uses a `DefaultSerializer` to serialize `value`
 * into a buffer.
 * @param {any} value
 * @returns {Buffer}
 */
function serialize(value) {
  var ser = new DefaultSerializer();
  ser.writeHeader();
  ser.writeValue(value);
  return ser.releaseBuffer();
}

/**
 * Uses a `DefaultDeserializer` with default options
 * to read a JavaScript value from a buffer.
 * @param {Buffer | TypedArray | DataView} buffer
 * @returns {any}
 */
function deserialize(buffer) {
  var der = new DefaultDeserializer(buffer);
  der.readHeader();
  return der.readValue();
}
var _profiler = /*#__PURE__*/new WeakMap();
var GCProfiler = /*#__PURE__*/function () {
  function GCProfiler() {
    _classCallCheck(this, GCProfiler);
    _classPrivateFieldInitSpec(this, _profiler, null);
  }
  return _createClass(GCProfiler, [{
    key: "start",
    value: function start() {
      if (!_classPrivateFieldGet(_profiler, this)) {
        _classPrivateFieldSet(_profiler, this, new binding.GCProfiler());
        _classPrivateFieldGet(_profiler, this).start();
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      if (_classPrivateFieldGet(_profiler, this)) {
        var data = _classPrivateFieldGet(_profiler, this).stop();
        _classPrivateFieldSet(_profiler, this, null);
        return JSONParse(data);
      }
    }
  }, {
    key: SymbolDispose,
    value: function () {
      this.stop();
    }
  }]);
}();
module.exports = {
  cachedDataVersionTag,
  getHeapSnapshot,
  getHeapStatistics,
  getHeapSpaceStatistics,
  getHeapCodeStatistics,
  getCppHeapStatistics,
  setFlagsFromString,
  Serializer,
  Deserializer,
  DefaultSerializer,
  DefaultDeserializer,
  deserialize,
  takeCoverage: profiler.takeCoverage,
  stopCoverage: profiler.stopCoverage,
  serialize,
  writeHeapSnapshot,
  promiseHooks,
  queryObjects,
  startupSnapshot,
  setHeapSnapshotNearHeapLimit,
  GCProfiler,
  isStringOneByteRepresentation,
  startCpuProfile,
  startHeapProfile
};

