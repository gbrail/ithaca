'use strict';

const assert = require('assert');
const fs = require('fs');
const { Buffer } = require('buffer');
const console = require('console');

const testFile = 'test-temp.txt';
const testRenameFile = 'test-temp-renamed.txt';
const testDir = 'test-temp-dir';
const testNestedDir = 'test-temp-dir/nested/deep';

try {
  // Clean up potential leftovers from previous failed runs
  if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  if (fs.existsSync(testRenameFile)) fs.unlinkSync(testRenameFile);
  if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });

  // 1. Test fs.writeFileSync and fs.readFileSync
  const content = 'Hello Ithaca Filesystem!';
  fs.writeFileSync(testFile, content, 'utf8');
  assert.strictEqual(fs.existsSync(testFile), true);

  const readContent = fs.readFileSync(testFile, 'utf8');
  assert.strictEqual(readContent, content);

  // 2. Test fs.openSync, fs.writeSync (Buffer), fs.readSync (Buffer) and fs.closeSync
  const bufFile = 'test-temp-buf.txt';
  if (fs.existsSync(bufFile)) fs.unlinkSync(bufFile);

  const fd = fs.openSync(bufFile, 'w+');
  const writeBuf = Buffer.from('Ithaca Buffer I/O');
  const bytesWritten = fs.writeSync(fd, writeBuf, 0, writeBuf.length, 0);
  assert.strictEqual(bytesWritten, writeBuf.length);

  // Check stats using fstatSync
  const stats = fs.fstatSync(fd);
  assert.strictEqual(stats.size - 0, writeBuf.length - 0);

  // Read back via readSync
  const readBuf = Buffer.alloc(writeBuf.length);
  const bytesRead = fs.readSync(fd, readBuf, 0, readBuf.length, 0);
  assert.strictEqual(bytesRead, writeBuf.length);
  assert.strictEqual(readBuf.toString(), 'Ithaca Buffer I/O');

  fs.closeSync(fd);
  assert.throws(() => fs.fstatSync(fd), /EBADF/);

  fs.unlinkSync(bufFile);

  // 3. Test fs.openSync, fs.writeSync (String)
  const strFile = 'test-temp-str.txt';
  if (fs.existsSync(strFile)) fs.unlinkSync(strFile);

  const fdStr = fs.openSync(strFile, 'w+');
  const strBytesWritten = fs.writeSync(fdStr, 'Ithaca String I/O', 0, 'utf8');
  assert.strictEqual(strBytesWritten, 'Ithaca String I/O'.length);
  fs.closeSync(fdStr);

  const strRead = fs.readFileSync(strFile, 'utf8');
  assert.strictEqual(strRead, 'Ithaca String I/O');
  fs.unlinkSync(strFile);

  // 4. Test fs.mkdirSync and fs.rmdirSync
  fs.mkdirSync(testDir);
  assert.strictEqual(fs.existsSync(testDir), true);
  fs.rmdirSync(testDir);
  assert.strictEqual(fs.existsSync(testDir), false);

  // 5. Test fs.mkdirSync with recursive option
  fs.mkdirSync(testNestedDir, { recursive: true });
  assert.strictEqual(fs.existsSync(testNestedDir), true);

  // 6. Test fs.renameSync
  fs.renameSync(testFile, testRenameFile);
  assert.strictEqual(fs.existsSync(testFile), false);
  assert.strictEqual(fs.existsSync(testRenameFile), true);

  // 7. Test fs.rmSync (recursive)
  fs.rmSync(testDir, { recursive: true });
  assert.strictEqual(fs.existsSync(testNestedDir), false);
  assert.strictEqual(fs.existsSync(testDir), false);

  // Clean up remaining test files
  fs.unlinkSync(testRenameFile);
  assert.strictEqual(fs.existsSync(testRenameFile), false);

  console.log('Filesystem integration tests completed successfully.');
} catch (err) {
  console.log('Test failed with error:', err);
  if (err && err.stack) console.log('Error stack:', err.stack);
  // Try to clean up on error
  try { if (fs.existsSync(testFile)) fs.unlinkSync(testFile); } catch (e) {}
  try { if (fs.existsSync(testRenameFile)) fs.unlinkSync(testRenameFile); } catch (e) {}
  try { if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true }); } catch (e) {}
  throw err;
}
