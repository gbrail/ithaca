'use strict';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var {
  ArrayPrototypeIncludes,
  ArrayPrototypeIndexOf,
  ArrayPrototypePush,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  FunctionPrototypeBind,
  NumberIsSafeInteger,
  ObjectDefineProperties,
  ObjectFreeze,
  ReflectApply,
  Symbol: _Symbol
} = primordials;
var {
  ERR_ASYNC_CALLBACK,
  ERR_ASYNC_TYPE,
  ERR_INVALID_ASYNC_ID,
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE
} = require('internal/errors').codes;
var {
  kEmptyObject
} = require('internal/util');
var {
  validateFunction,
  validateString
} = require('internal/validators');
var internal_async_hooks = require('internal/async_hooks');
var AsyncContextFrame = require('internal/async_context_frame');

// Get functions
// For userland AsyncResources, make sure to emit a destroy event when the
// resource gets gced.
var {
  registerDestroyHook,
  kNoPromiseHook
} = internal_async_hooks;
var {
  asyncWrap,
  executionAsyncId,
  triggerAsyncId,
  // Private API
  hasAsyncIdStack,
  getHookArrays,
  enableHooks,
  disableHooks,
  updatePromiseHookMode,
  executionAsyncResource,
  // Internal Embedder API
  newAsyncId,
  getDefaultTriggerAsyncId,
  emitInit,
  emitBefore,
  emitAfter,
  emitDestroy: _emitDestroy,
  initHooksExist,
  destroyHooksExist
} = internal_async_hooks;

// Get symbols
var {
  async_id_symbol,
  trigger_async_id_symbol,
  init_symbol,
  before_symbol,
  after_symbol,
  destroy_symbol,
  promise_resolve_symbol
} = internal_async_hooks.symbols;

// Get constants
var {
  kInit,
  kBefore,
  kAfter,
  kDestroy,
  kTotals,
  kPromiseResolve
} = internal_async_hooks.constants;

// Listener API //
var AsyncHook = /*#__PURE__*/function () {
  function AsyncHook(_ref) {
    var {
      init,
      before,
      after,
      destroy,
      promiseResolve,
      trackPromises
    } = _ref;
    _classCallCheck(this, AsyncHook);
    if (init !== undefined && typeof init !== 'function') throw new ERR_ASYNC_CALLBACK('hook.init');
    if (before !== undefined && typeof before !== 'function') throw new ERR_ASYNC_CALLBACK('hook.before');
    if (after !== undefined && typeof after !== 'function') throw new ERR_ASYNC_CALLBACK('hook.after');
    if (destroy !== undefined && typeof destroy !== 'function') throw new ERR_ASYNC_CALLBACK('hook.destroy');
    if (promiseResolve !== undefined && typeof promiseResolve !== 'function') throw new ERR_ASYNC_CALLBACK('hook.promiseResolve');
    if (trackPromises !== undefined && typeof trackPromises !== 'boolean') {
      throw new ERR_INVALID_ARG_TYPE('trackPromises', 'boolean', trackPromises);
    }
    this[init_symbol] = init;
    this[before_symbol] = before;
    this[after_symbol] = after;
    this[destroy_symbol] = destroy;
    this[promise_resolve_symbol] = promiseResolve;
    if (trackPromises === false) {
      if (promiseResolve) {
        throw new ERR_INVALID_ARG_VALUE('trackPromises', trackPromises, 'must not be false when promiseResolve is enabled');
      }
      this[kNoPromiseHook] = true;
    } else {
      // Default to tracking promises for now.
      this[kNoPromiseHook] = false;
    }
  }
  return _createClass(AsyncHook, [{
    key: "enable",
    value: function enable() {
      // The set of callbacks for a hook should be the same regardless of whether
      // enable()/disable() are run during their execution. The following
      // references are reassigned to the tmp arrays if a hook is currently being
      // processed.
      var {
        0: hooks_array,
        1: hook_fields
      } = getHookArrays();

      // Each hook is only allowed to be added once.
      if (ArrayPrototypeIncludes(hooks_array, this)) return this;
      var prev_kTotals = hook_fields[kTotals];

      // createHook() has already enforced that the callbacks are all functions,
      // so here simply increment the count of whether each callbacks exists or
      // not.
      hook_fields[kTotals] = hook_fields[kInit] += +!!this[init_symbol];
      hook_fields[kTotals] += hook_fields[kBefore] += +!!this[before_symbol];
      hook_fields[kTotals] += hook_fields[kAfter] += +!!this[after_symbol];
      hook_fields[kTotals] += hook_fields[kDestroy] += +!!this[destroy_symbol];
      hook_fields[kTotals] += hook_fields[kPromiseResolve] += +!!this[promise_resolve_symbol];
      ArrayPrototypePush(hooks_array, this);
      if (prev_kTotals === 0 && hook_fields[kTotals] > 0) {
        enableHooks();
      }
      if (!this[kNoPromiseHook]) {
        updatePromiseHookMode();
      }
      return this;
    }
  }, {
    key: "disable",
    value: function disable() {
      var {
        0: hooks_array,
        1: hook_fields
      } = getHookArrays();
      var index = ArrayPrototypeIndexOf(hooks_array, this);
      if (index === -1) return this;
      var prev_kTotals = hook_fields[kTotals];
      hook_fields[kTotals] = hook_fields[kInit] -= +!!this[init_symbol];
      hook_fields[kTotals] += hook_fields[kBefore] -= +!!this[before_symbol];
      hook_fields[kTotals] += hook_fields[kAfter] -= +!!this[after_symbol];
      hook_fields[kTotals] += hook_fields[kDestroy] -= +!!this[destroy_symbol];
      hook_fields[kTotals] += hook_fields[kPromiseResolve] -= +!!this[promise_resolve_symbol];
      ArrayPrototypeSplice(hooks_array, index, 1);
      if (prev_kTotals > 0 && hook_fields[kTotals] === 0) {
        disableHooks();
      }
      return this;
    }
  }]);
}();
function createHook(fns) {
  return new AsyncHook(fns);
}

// Embedder API //

var destroyedSymbol = _Symbol('destroyed');
var contextFrameSymbol = _Symbol('context_frame');
var AsyncResource = /*#__PURE__*/function () {
  function AsyncResource(type) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : kEmptyObject;
    _classCallCheck(this, AsyncResource);
    validateString(type, 'type');
    var triggerAsyncId = opts;
    var requireManualDestroy = false;
    if (typeof opts !== 'number') {
      triggerAsyncId = opts.triggerAsyncId === undefined ? getDefaultTriggerAsyncId() : opts.triggerAsyncId;
      requireManualDestroy = !!opts.requireManualDestroy;
    }

    // Unlike emitInitScript, AsyncResource doesn't supports null as the
    // triggerAsyncId.
    if (!NumberIsSafeInteger(triggerAsyncId) || triggerAsyncId < -1) {
      throw new ERR_INVALID_ASYNC_ID('triggerAsyncId', triggerAsyncId);
    }
    this[contextFrameSymbol] = AsyncContextFrame.current();
    var asyncId = newAsyncId();
    this[async_id_symbol] = asyncId;
    this[trigger_async_id_symbol] = triggerAsyncId;
    if (initHooksExist()) {
      if (type.length === 0) {
        throw new ERR_ASYNC_TYPE(type);
      }
      emitInit(asyncId, type, triggerAsyncId, this);
    }
    if (!requireManualDestroy && destroyHooksExist()) {
      // This prop name (destroyed) has to be synchronized with C++
      var destroyed = {
        destroyed: false
      };
      this[destroyedSymbol] = destroyed;
      registerDestroyHook(this, asyncId, destroyed);
    }
  }
  return _createClass(AsyncResource, [{
    key: "runInAsyncScope",
    value: function runInAsyncScope(fn, thisArg) {
      var asyncId = this[async_id_symbol];
      emitBefore(asyncId, this[trigger_async_id_symbol], this);
      var contextFrame = this[contextFrameSymbol];
      var prior = AsyncContextFrame.exchange(contextFrame);
      try {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return ReflectApply(fn, thisArg, args);
      } finally {
        AsyncContextFrame.set(prior);
        if (hasAsyncIdStack()) emitAfter(asyncId);
      }
    }
  }, {
    key: "emitDestroy",
    value: function emitDestroy() {
      if (this[destroyedSymbol] !== undefined) {
        this[destroyedSymbol].destroyed = true;
      }
      _emitDestroy(this[async_id_symbol]);
      return this;
    }
  }, {
    key: "asyncId",
    value: function asyncId() {
      return this[async_id_symbol];
    }
  }, {
    key: "triggerAsyncId",
    value: function triggerAsyncId() {
      return this[trigger_async_id_symbol];
    }
  }, {
    key: "bind",
    value: function bind(fn, thisArg) {
      validateFunction(fn, 'fn');
      var bound;
      if (thisArg === undefined) {
        var resource = this;
        bound = function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          ArrayPrototypeUnshift(args, fn, this);
          return ReflectApply(resource.runInAsyncScope, resource, args);
        };
      } else {
        bound = FunctionPrototypeBind(this.runInAsyncScope, this, fn, thisArg);
      }
      ObjectDefineProperties(bound, {
        'length': {
          __proto__: null,
          configurable: true,
          enumerable: false,
          value: fn.length,
          writable: false
        }
      });
      return bound;
    }
  }], [{
    key: "bind",
    value: function bind(fn, type, thisArg) {
      type ||= fn.name;
      return new AsyncResource(type || 'bound-anonymous-fn').bind(fn, thisArg);
    }
  }]);
}(); // Placing all exports down here because the exported classes won't export
// otherwise.
module.exports = {
  // Public API
  get AsyncLocalStorage() {
    return AsyncContextFrame.enabled ? require('internal/async_local_storage/async_context_frame') : require('internal/async_local_storage/async_hooks');
  },
  createHook,
  executionAsyncId,
  triggerAsyncId,
  executionAsyncResource,
  asyncWrapProviders: ObjectFreeze(_objectSpread({
    __proto__: null
  }, asyncWrap.Providers)),
  // Embedder API
  AsyncResource
};

