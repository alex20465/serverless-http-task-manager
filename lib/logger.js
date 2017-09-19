/**
 * @param {string} fn name of the function
 * @param {string} message
 * @param {Object} [raw]
 * @returns {void}
 */
function error(fn, message, raw) {
  log(fn, `ERROR: ${message}`, raw);
}

/**
 * @param {string} fn name of the function
 * @param {string} message
 * @param {Object} [raw]
 * @returns {void}
 */
function log(fn, message, raw) {
  if (process.env.LOADED_MOCHA_OPTS === 'true') {
    // SKIP, keeps test-result reporting clear when mocha has been loaded
    return;
  }

  console.log(
    process.env.AWS_LAMBDA_FUNCTION_NAME,
    fn,
    `"${message}"`,
    `"${JSON.stringify(raw || {})}"`
  );
}

module.exports = { error, log };
