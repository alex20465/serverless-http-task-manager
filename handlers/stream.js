const { AttributeValue } = require('dynamodb-data-types');
const Promise = require('bluebird');
const PromiseRetry = require('bluebird-retry');
const { invokeLambda } = require('../lib/invokeLambda');
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
 * @param {Task} task
 * @returns {Promise<TaskResult>}
 */
function executeAsync(task) {
  task.request.headers.push({
    key: 'x-callback-endpoint',
    value: `${ASYNC_CALLBACK_ENDPOINT}/${task.id}`,
  });
  return executeHandler(task).then(requestResponse => {
    // task is in-processing, there is no callback yet
    return { id: task.id, callbackResponse: null, requestResponse };
  });
}

/**
 * @param {Task} task
 * @return {Promise<TaskResult>}
 */
function executeAwait(task) {
  let requestResponse;

  return executeHandler(task)
    .then(response => {
      requestResponse = response;
      return executeCallback(task, requestResponse);
    })
    .then(callbackResponse => {
      return { id: task.id, callbackResponse, requestResponse };
    });
}

/**
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
