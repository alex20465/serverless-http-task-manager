/**
 * @Todo: Disallow empty header names and values
 */
const { AttributeValue } = require('dynamodb-data-types');
const Promise = require('bluebird');
const PromiseRetry = require('bluebird-retry');
const { invokeLambda, invokeLambdaAsync } = require('../lib/invokeLambda');
const { putResults } = require('../lib/task');

const {
  MAX_TRIES,
  RETRY_INTERVAL,
  RUN_FUNCTION_NAME,
  CALLBACK_FUNCTION_NAME,
  ASYNC_CALLBACK_ENDPOINT,
} = process.env;

const retryOptions = {
  max_tries: parseInt(MAX_TRIES),
  interval: parseInt(RETRY_INTERVAL),
};

/**
 * @typedef {null} StreamResponse
 */

/**
 * @param {any} event
 * @param {null} context
 * @param {function(Error, null)} callback
 * @returns {void}
 */
function handler(event, context, callback) {
  const records = extractRecords(event, ['INSERT']);

  console.log('Start processing', records.length, 'records');

  const asyncExecutions = records.map(task => execute(task));
  Promise.all(asyncExecutions)
    .then(results => putResults(results))
    .then(() => callback(null, null))
    .catch(err => callback(err, null));
}

/**
 * @param {Task} task
 * @return {Promise<TaskResult>}
 */
function execute(task) {
  if (task.strategy === 'await') {
    return executeAwait(task);
  } else {
    return executeAsync(task);
  }
}

/**
 * Perform the asynchronouse optimistic request.
 *
 * @param {Task} task
 * @returns {Promise<TaskResult>}
 */
function executeAsync(task) {
  task.request.headers.push({
    key: 'x-callback-endpoint',
    value: `${ASYNC_CALLBACK_ENDPOINT}/${task.id}`,
  });
  return executeHandlerAsync(task).then(() => {
    return {
      id: task.id,
      callbackResponse: null, // waiting for event to callback
      requestResponse: { statusCode: -2, body: null }, // optimistic request reponse
    };
  });
}

/**
 * Perform the await execution and callback direct after response is available.
 *
 * @param {Task} task
 * @return {Promise<TaskResult>}
 */
function executeAwait(task) {
  let requestResponse;

  return executeHandler(task)
    .then(response => {
      requestResponse = response;
      if (task.callback) {
        return executeCallback(task, requestResponse);
      } else {
        return null;
      }
    })
    .then(callbackResponse => {
      return { id: task.id, callbackResponse, requestResponse };
    });
}

/**
 * Execute callback with the request-response as task-results.
 *
 * @param {Task} task
 * @param {Response} requestResponse
 * @returns Promise<TaskResult>
 * @returns {void}
 */
function executeCallback(task, requestResponse) {
  console.log('Perform callback', JSON.stringify({ task, requestResponse }));
  const payload = { task, requestResponse };
  return PromiseRetry(() => invokeLambda(CALLBACK_FUNCTION_NAME, payload), retryOptions).catch(
    err => ({ statusCode: -1, body: err.message })
  );
}

/**
 * Execute task handler and return the response.
 *
 * @param {Task} record
 * @returns {Promise<Response>}
 */
function executeHandler(record) {
  console.log('Perform task execution', JSON.stringify(record));
  return PromiseRetry(() => invokeLambda(RUN_FUNCTION_NAME, record), retryOptions).catch(err => {
    return {
      statusCode: -1,
      body: err.message,
      headers: [{ key: 'Accept', value: 'application/json' }],
    };
  });
}

/**
 * Execute the task handler asynchronously.
 *
 * @param {Task} record
 * @returns {Promise<null>}
 */
function executeHandlerAsync(record) {
  console.log('Perform task execution', JSON.stringify(record));
  return PromiseRetry(() => invokeLambdaAsync(RUN_FUNCTION_NAME, record), retryOptions).then(
    () => null
  );
}

/**
 * @param {any} event
 * @param {Task[]} events
 * @returns {void}
 */
function extractRecords(event, events) {
  return event.Records.filter(record => events.indexOf(record.eventName) !== -1).map(record =>
    AttributeValue.unwrap(record.dynamodb.NewImage)
  );
}

module.exports = { handler };
