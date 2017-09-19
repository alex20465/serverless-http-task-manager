const HandledError = require('./../errors/HandledError');
const logger = require('./../lib/logger');

/**
 * @typedef {{type: string, message: string}} ErrorResponse
 */

/**
 * @typedef {{success: boolean, error: ErrorResponse?, response: T}} LambdaResponse
 */

/**
 * Global catch error handler
 * @param {Error} error
 * @param {function(Error, (LambdaResponse|null))} callback
 * @returns {void}
 */
function errorHandler(error, callback) {
  if (error instanceof HandledError) {
    logger.log('errorHandler', `${error.message}`, error);
    callback(null, {
      success: false,
      response: null,
      error: {
        message: error.message,
        type: error.name,
      },
    });
  } else {
    logger.error('errorHandler', `${error.message}`, error);
    callback(error, null);
  }
}

module.exports = errorHandler;
