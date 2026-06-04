'use strict';

var {
  SafeStringIterator,
  Symbol
} = primordials;
var {
  charLengthAt,
  CSI,
  emitKeys
} = require('internal/readline/utils');
var {
  kSawKeyPress
} = require('internal/readline/interface');
var {
  clearTimeout,
  setTimeout
} = require('timers');
var {
  kEscape
} = CSI;
var {
  StringDecoder
} = require('string_decoder');
var KEYPRESS_DECODER = Symbol('keypress-decoder');
var ESCAPE_DECODER = Symbol('escape-decoder');

// GNU readline library - keyseq-timeout is 500ms (default)
var ESCAPE_CODE_TIMEOUT = 500;

/**
 * accepts a readable Stream instance and makes it emit "keypress" events
 */

function emitKeypressEvents(stream) {
  var iface = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (stream[KEYPRESS_DECODER]) return;
  stream[KEYPRESS_DECODER] = new StringDecoder('utf8');
  stream[ESCAPE_DECODER] = emitKeys(stream);
  stream[ESCAPE_DECODER].next();
  var triggerEscape = () => stream[ESCAPE_DECODER].next('');
  var {
    escapeCodeTimeout = ESCAPE_CODE_TIMEOUT
  } = iface;
  var timeoutId;
  function onData(input) {
    if (stream.listenerCount('keypress') > 0) {
      var string = stream[KEYPRESS_DECODER].write(input);
      if (string) {
        clearTimeout(timeoutId);

        // This supports characters of length 2.
        iface[kSawKeyPress] = charLengthAt(string, 0) === string.length;
        iface.isCompletionEnabled = false;
        var length = 0;
        for (var character of new SafeStringIterator(string)) {
          length += character.length;
          if (length === string.length) {
            iface.isCompletionEnabled = true;
          }
          try {
            stream[ESCAPE_DECODER].next(character);
            // Escape letter at the tail position
            if (length === string.length && character === kEscape) {
              timeoutId = setTimeout(triggerEscape, escapeCodeTimeout);
            }
          } catch (err) {
            // If the generator throws (it could happen in the `keypress`
            // event), we need to restart it.
            stream[ESCAPE_DECODER] = emitKeys(stream);
            stream[ESCAPE_DECODER].next();
            throw err;
          }
        }
      }
    } else {
      // Nobody's watching anyway
      stream.removeListener('data', onData);
      stream.on('newListener', onNewListener);
    }
  }
  function onNewListener(event) {
    if (event === 'keypress') {
      stream.on('data', onData);
      stream.removeListener('newListener', onNewListener);
    }
  }
  if (stream.listenerCount('keypress') > 0) {
    stream.on('data', onData);
  } else {
    stream.on('newListener', onNewListener);
  }
}
module.exports = emitKeypressEvents;

