'use strict';

var {
  ArrayPrototypeIndexOf,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSplice,
  FunctionPrototypeBind
} = primordials;
var {
  setPromiseHooks
} = internalBinding('async_wrap');
var {
  triggerUncaughtException
} = internalBinding('errors');
var {
  kEmptyObject
} = require('internal/util');
var {
  validatePlainFunction
} = require('internal/validators');
var hooks = {
  init: [],
  before: [],
  after: [],
  settled: []
};
function initAll(promise, parent) {
  var hookSet = ArrayPrototypeSlice(hooks.init);
  var exceptions = [];
  for (var i = 0; i < hookSet.length; i++) {
    var init = hookSet[i];
    try {
      init(promise, parent);
    } catch (err) {
      ArrayPrototypePush(exceptions, err);
    }
  }

  // Triggering exceptions is deferred to allow other hooks to complete
  for (var _i = 0; _i < exceptions.length; _i++) {
    var err = exceptions[_i];
    triggerUncaughtException(err, false);
  }
}
function makeRunHook(list) {
  return promise => {
    var hookSet = ArrayPrototypeSlice(list);
    var exceptions = [];
    for (var i = 0; i < hookSet.length; i++) {
      var hook = hookSet[i];
      try {
        hook(promise);
      } catch (err) {
        ArrayPrototypePush(exceptions, err);
      }
    }

    // Triggering exceptions is deferred to allow other hooks to complete
    for (var _i2 = 0; _i2 < exceptions.length; _i2++) {
      var err = exceptions[_i2];
      triggerUncaughtException(err, false);
    }
  };
}
var beforeAll = makeRunHook(hooks.before);
var afterAll = makeRunHook(hooks.after);
var settledAll = makeRunHook(hooks.settled);
function maybeFastPath(list, runAll) {
  return list.length > 1 ? runAll : list[0];
}
function update() {
  var init = maybeFastPath(hooks.init, initAll);
  var before = maybeFastPath(hooks.before, beforeAll);
  var after = maybeFastPath(hooks.after, afterAll);
  var settled = maybeFastPath(hooks.settled, settledAll);
  setPromiseHooks(init, before, after, settled);
}
function stop(list, hook) {
  var index = ArrayPrototypeIndexOf(list, hook);
  if (index >= 0) {
    ArrayPrototypeSplice(list, index, 1);
    update();
  }
}
function makeUseHook(name) {
  var list = hooks[name];
  return hook => {
    validatePlainFunction(hook, `${name}Hook`);
    ArrayPrototypePush(list, hook);
    update();
    return FunctionPrototypeBind(stop, null, list, hook);
  };
}
var onInit = makeUseHook('init');
var onBefore = makeUseHook('before');
var onAfter = makeUseHook('after');
var onSettled = makeUseHook('settled');
function createHook() {
  var {
    init,
    before,
    after,
    settled
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : kEmptyObject;
  var hooks = [];
  if (init) ArrayPrototypePush(hooks, onInit(init));
  if (before) ArrayPrototypePush(hooks, onBefore(before));
  if (after) ArrayPrototypePush(hooks, onAfter(after));
  if (settled) ArrayPrototypePush(hooks, onSettled(settled));
  return () => {
    for (var _stop of hooks) {
      _stop();
    }
  };
}
module.exports = {
  createHook,
  onInit,
  onBefore,
  onAfter,
  onSettled
};

