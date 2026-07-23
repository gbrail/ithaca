'use strict';

const assert = require('assert');
const timers = require('timers');
const console = require('console');

// 1. Test setTimeout handles and execution
let timeoutCalled = false;
const t1 = timers.setTimeout(() => {
  timeoutCalled = true;
  console.log('Timeout callback executed.');
}, 10);
assert.notStrictEqual(t1, undefined, 'setTimeout should return a handle');

// 2. Test clearTimeout and cancellation
let cancelledCalled = false;
const t2 = timers.setTimeout(() => {
  cancelledCalled = true;
}, 10);
timers.clearTimeout(t2);

// Use a later timer to verify that the cancelled timer did not execute
timers.setTimeout(() => {
  assert.strictEqual(cancelledCalled, false, 'Cancelled timeout should not be executed');
  console.log('Cancellation of timeout verified.');
}, 20);

// 3. Test setInterval handles and execution
let intervalCalledCount = 0;
const i1 = timers.setInterval(() => {
  intervalCalledCount++;
  console.log(`Interval callback executed count: ${intervalCalledCount}`);
}, 10);
assert.notStrictEqual(i1, undefined, 'setInterval should return a handle');

// clear it after some time to avoid infinite loop in tests
timers.setTimeout(() => {
  timers.clearInterval(i1);
  assert.strictEqual(intervalCalledCount > 0, true, 'Interval callback should be executed at least once');
  console.log('Interval execution verified.');
}, 30);

// 4. Test setImmediate handles and execution
let immediateCalled = false;
const im1 = timers.setImmediate(() => {
  immediateCalled = true;
  console.log('Immediate callback executed.');
});
assert.notStrictEqual(im1, undefined, 'setImmediate should return a handle');

// Verify setImmediate executed using another timer (or just letting the event loop run)
timers.setTimeout(() => {
  assert.strictEqual(immediateCalled, true, 'setImmediate callback should be executed');
  console.log('setImmediate execution verified.');
}, 40);

// 5. Test clearImmediate and cancellation
let immCancelledCalled = false;
const im2 = timers.setImmediate(() => {
  immCancelledCalled = true;
});
timers.clearImmediate(im2);

timers.setTimeout(() => {
  assert.strictEqual(immCancelledCalled, false, 'Cancelled immediate should not be executed');
  console.log('Cancellation of immediate verified.');
}, 50);

console.log('Timer integration tests scheduled (waiting for callbacks)...');
