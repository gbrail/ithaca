const console = require('console');
const timers = require('timers');
const assert = require('assert');

var ticks = 0;
var stage = 0;
const START_DELAY = 5000;

const ticker = timers.setInterval(() => ticks++, 100);

// Timer logic is sufficiently touchy that we should give it
// a good few seconds before booting Ithaca and the first timer
timers.setTimeout(() => {
  console.log('One: Stage %d',  stage);
  assert.equal(stage, 0);
  stage++;
}, START_DELAY);

timers.setTimeout(() => {
  console.log('Two: Stage %d',  stage);
  assert.equal(stage, 1);
  stage++;
  timers.setTimeout(() => {
    console.log('Three: Stage %d',  stage);
    assert.equal(stage, 2);
    stage++;
  }, 250);
}, START_DELAY + 500);

timers.setTimeout(() => {
  console.log('Boom: Stage %d',  stage);
  assert.equal(stage, 3);
  ticker.unref();
  // Can't guarantee exact number but other timers ran
  // for at least a second
  assert(ticks >= 9);
  console.log('Done. Ticks = %d', ticks);
}, START_DELAY + 1000);
