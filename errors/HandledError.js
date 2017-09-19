/**
 * Represents lambda custom error, which is not tracked.
 * @type {HandledError}
 */
module.exports = class HandledError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
};
