'use strict';

// Delegate to the actual DOMException/QuotaExceededError implementation.
var messaging = internalBinding('messaging');
module.exports = {
  DOMException: messaging.DOMException,
  QuotaExceededError: messaging.QuotaExceededError
};

