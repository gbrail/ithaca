// Circular dependency B (references dep-a which may or may not reference this)
var a = require('./dep-a.js');
a.cb = function() { return 'B-callback'; };
module.exports = { id: 'B', refA: a };
