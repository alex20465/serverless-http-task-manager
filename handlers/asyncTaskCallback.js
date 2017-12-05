const Joi = require('joi');
const PromiseRetry = require('bluebird-retry');
const validate = require('../lib/validate');
const taskService = require('../lib/task');
const {invokeLambda} = require('../lib/invokeLambda');

const {MAX_TRIES, RETRY_INTERVAL, CALLBACK_FUNCTION_NAME} = process.env;

const retryOptions = {
  max_tries: parseInt(MAX_TRIES),
  interval: parseInt(RETRY_INTERVAL),
};

const eventSchema = Joi.object({
  taskId: Joi.string().required(),
  body: Joi.string().required(),
}).required();

/**
 * @param {{taskId: string, body: string}} event
 * @param {null} context
 * @param {function(Error, (TaskResult|null))} callback
 * @returns {void}
 */
function handler(event, context, callback) {
  validate
    .validateEventSchema(event, eventSchema)
    .then(({taskId}) => taskService.get(taskId))
    .then((task) => executeCallback(task, {
      statusCode: 200,
      body: event.body,
      headers: []
    }))
    .then(callbackResponse => updateCallbackResult(event.taskId, callbackResponse))
    .then(response => callback(null, response))
    .catch(err => callback(err, null));
}

/**
 * @param {string} taskId
 * @param {Response} response
 * @returns {Promise<TaskResult>}
 */
function updateCallbackResult(taskId, response) {
  return taskService.getResult(taskId)
    .then((taskResult) => {
      taskResult.callbackResponse = response;
      return taskService.putResult(taskResult);
    });
}

/**
 * @param {Task} task
 * @param {Response} requestResponse
 * @returns Promise<TaskResult>
 * @returns {Promise<Response>}
 */
function executeCallback(task, requestResponse) {
  console.log('Perform callback', JSON.stringify({task, requestResponse}));
  const payload = {task, requestResponse};
  return PromiseRetry(() => invokeLambda(CALLBACK_FUNCTION_NAME, payload), retryOptions).catch(
    err => ({statusCode: -1, body: err.message})
  );
}

module.exports = {handler};
