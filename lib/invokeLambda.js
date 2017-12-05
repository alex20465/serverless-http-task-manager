const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

/**
 * @param {string} lambdaName
 * @param {Object} payload
 * @param {Lambda} [customLambda]
 * @returns {Promise<Object>}
 */
function invokeLambda(lambdaName, payload, customLambda) {
  return (customLambda || lambda)
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

module.exports = {
  invokeLambda,
};
