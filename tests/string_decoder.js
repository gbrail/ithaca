'use strict';

const console = require('console');
const assert = require('assert');
const { Buffer } = require('buffer');
const string_decoder = require('string_decoder');

// 1. Basic a single-chunk write
const dec1 = new string_decoder.StringDecoder();
const t1 = Buffer.from("Hello!", 'utf8');
assert.strictEqual(dec1.write(t1), "Hello!");
assert.strictEqual(dec1.end(), '');

// 2. Multi-byte character split across chunks (UTF-8)
// "你好" (Ni Hao) is [0xE4, 0xBD, 0xA0, 0xE5, 0xA5, 0xBD]
const dec2 = new string_decoder.StringDecoder();
const utf8Data = Buffer.from("你好", 'utf8');
const part1 = utf8Data.slice(0, 2); // [0xE4, 0xBD] - incomplete first char
const part2 = utf8Data.slice(2, 4); // [0xA0, 0xE5] - completes first, starts second
const part3 = utf8Data.slice(4, 6); // [0xA5, 0xBD] - completes second

assert.strictEqual(dec2.write(part1), '', 'Should not return partial character');
assert.strictEqual(dec2.write(part2), '你', 'Should complete first char and buffer second');
assert.strictEqual(dec2.write(part3), '好', 'Should complete second char');
assert.strictEqual(dec2.end(), '', 'Nothing left to flush');

// 3. Mixed ASCII and multi-byte splits
const dec3 = new string_decoder.StringDecoder();
const mixedText = "A你B"; // [0x41, 0xE4, 0xBD, 0xA0, 0x42]
const mixedBuf = Buffer.from(mixedText, 'utf8');

// Index mapping: 0:A, 1:E4, 2:BD, 3:A0, 4:B
assert.strictEqual(dec3.write(mixedBuf.slice(0, 2)), 'A', 'Should return ASCII and buffer partial UTF-8'); // [0x41, 0xE4]
assert.strictEqual(dec3.write(mixedBuf.slice(2, 4)), '你', 'Should now complete the character'); // [0xBD, 0xA0]
assert.strictEqual(dec3.write(mixedBuf.slice(4)), 'B', 'Returns trailing ASCII'); // [0x42]

// 4. End() should flush partial sequences (if replacing) or return empty if none
const dec4 = new string_decoder.StringDecoder();
const partial = Buffer.from([0xE4, 0xBD]); // Incomplete "你"
dec4.write(partial);
// Node's StringDecoder.end() usually flushes with replacement characters for incomplete sequences
assert.strictEqual(dec4.end(), '\uFFFD');

console.log('All string_decoder tests passed!');

