const HandledError = require('./HandledError');

/**
 * Represents lambda validation error, which is not tracked.
 * @type {ValidationError}
 */
module.exports = class ValidationError extends HandledError {};
