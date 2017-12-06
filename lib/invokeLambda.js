const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

/**
 * @param {string} lambdaName
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
function invokeLambda(lambdaName, payload) {
  return lambda
    .invoke({
      FunctionName: lambdaName,
      Payload: JSON.stringify(payload),
    })
    .promise()
    .then(({ Payload, ErrorMessage, ErrorType }) => {
      if (ErrorMessage) {
        // handle invocation Error
        const error = new Error(ErrorMessage);
        error.type = ErrorType;
        throw error;
      } else {
        const response = JSON.parse(Payload);
        if (response.errorMessage) {
          // handle invocation execution error
          const error = new Error(response.errorMessage);
          error.type = 'InvocationExecutionError';
          throw error;
        } else {
          // invocation was successful
          return response;
        }
      }
    });
}

/**
 * @param {string} lambdaName
 * @param {Object} payload
 * @returns {Promise<null>}
 */
function invokeLambdaAsync(lambdaName, payload) {
  return lambda
    .invokeAsync({
      FunctionName: lambdaName,
      Payload: JSON.stringify(payload),
    })
    .promise()
    .then(({ ErrorMessage, ErrorType }) => {
      if (ErrorMessage) {
        // handle invocation Error
        const error = new Error(ErrorMessage);
        error.type = ErrorType;
        throw error;
      } else {
        return null;
      }
    });
}

module.exports = {
  invokeLambda,
  invokeLambdaAsync,
};
