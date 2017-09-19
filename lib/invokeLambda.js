const AWS = require('aws-sdk');
const logger = require('./logger');

const lambda = new AWS.Lambda();

/**
 * @param {string} lambdaName
 * @param {Object} payload
 * @param {Lambda} [customLambda]
 * @returns {Promise<Object>}
 */
function invokeLambda(lambdaName, payload, customLambda) {
  logger.log('invokeLambda', `Trying to invoke ${lambdaName}`, payload);
  return (customLambda || lambda)
    .invoke({
      FunctionName: lambdaName,
      Payload: JSON.stringify(payload),
    })
    .promise()
    .then(response => handleResponse(response, lambdaName));
}

/**
 * @param {string} lambdaName
 * @param {Object} payload
 * @param {Lambda} [customLambda]
 * @returns {Promise<Object>}
 */
function invokeLambdaAsync(lambdaName, payload, customLambda) {
  logger.log('invokeLambda', `Trying to invoke ${lambdaName}`, payload);
  return (customLambda || lambda)
    .invoke({
      FunctionName: lambdaName,
      InvocationType: 'Event',
      Payload: JSON.stringify(payload),
    })
    .promise()
    .then(response => handleResponseAsync(response, lambdaName));
}

/**
 * @private
 * @param {Object} response
 * @param {string} lambdaName
 * @returns {Object}
 * @throws {Error}
 */
function handleResponse(response, lambdaName) {
  logger.log('handleResponse', `Invocation response ${lambdaName}`, response);

  if (response.StatusCode === 200) {
    return JSON.parse(response.Payload);
  } else {
    throw new Error(`couldn't reach lambda function: ${lambdaName}`);
  }
}

/**
 * @private
 * @param {Object} response
 * @param {string} lambdaName
 * @returns {Object}
 * @throws {Error}
 */
function handleResponseAsync(response, lambdaName) {
  logger.log('handleResponseAsync', `Invocation response ${lambdaName}`, response);

  if (response.StatusCode !== 202) {
    throw new Error(`couldn't reach lambda function: ${lambdaName}`);
  }

  return true;
}

module.exports = {
  invokeLambda,
  invokeLambdaAsync,
};
