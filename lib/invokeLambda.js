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
    .then(({Payload, ErrorMessage, ErrorType}) => {
      if (ErrorMessage) {
        const error = new Error(ErrorMessage);
        error.type = ErrorType;
        throw error;
      } else {
        return JSON.parse(Payload);
      }
    });
}

module.exports = {
  invokeLambda,
};
