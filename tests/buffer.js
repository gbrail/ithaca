'use strict';

const assert = require('assert');
const { Buffer } = require('buffer');
const console = require('console');

// 1. Test Buffer.isBuffer
assert.strictEqual(Buffer.isBuffer(Buffer.alloc(10)), true);
assert.strictEqual(Buffer.isBuffer([]), false);
assert.strictEqual(Buffer.isBuffer({}), false);

// 2. Test Buffer.alloc
const bufAlloc = Buffer.alloc(10);
assert.strictEqual(bufAlloc.length, 10);
for (let i = 0; i < bufAlloc.length; i++) {
  assert.strictEqual(bufAlloc[i], 0);
}

// 3. Test Buffer.alloc with fill
const bufFill = Buffer.alloc(5, 0xa);
assert.strictEqual(bufFill.length, 5);
for (let i = 0; i < bufFill.length; i++) {
  assert.strictEqual(bufFill[i], 0xa);
}

// 4. Test Buffer.from(array)
const bufArr = Buffer.from([1, 2, 3, 4, 5]);
assert.strictEqual(bufArr.length, 5);
assert.strictEqual(bufArr[0], 1);
assert.strictEqual(bufArr[4], 5);

// 5. Test Buffer.from(string)
const bufStr = Buffer.from('hello');
assert.strictEqual(bufStr.length, 5);
assert.strictEqual(bufStr.toString(), 'hello');

// 6. Test Buffer.concat
const buf1 = Buffer.from('abc');
const buf2 = Buffer.from('def');
const bufConcat = Buffer.concat([buf1, buf2]);
assert.strictEqual(bufConcat.toString(), 'abcdef');
assert.strictEqual(bufConcat.length, 6);

// 7. Test buffer element write/read via bracket notation
const bufAccess = Buffer.alloc(3);
bufAccess[0] = 100;
bufAccess[1] = 200;
bufAccess[2] = 50;
assert.strictEqual(bufAccess[0], 100);
assert.strictEqual(bufAccess[1], 200);
assert.strictEqual(bufAccess[2], 50);

// 8. Test buf.write and toString with offset/length
const bufWrite = Buffer.alloc(10);
const bytesWritten = bufWrite.write('hello', 2);
assert.strictEqual(bytesWritten, 5);
assert.strictEqual(bufWrite.toString('utf8', 2, 7), 'hello');

console.log('Buffer integration tests completed successfully.');
