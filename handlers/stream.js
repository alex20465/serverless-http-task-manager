const {AttributeValue} = require('dynamodb-data-types');
const Promise = require('bluebird');
const PromiseRetry = require('bluebird-retry');
const {invokeLambda} = require('../lib/invokeLambda');

const {putResults} = require('../lib/task');

const {
  MAX_TRIES,
  RETRY_INTERVAL,
  RUN_FUNCTION_NAME,
  CALLBACK_FUNCTION_NAME
} = process.env;

const retryOptions = {
  max_tries: parseInt(MAX_TRIES),
  interval: parseInt(RETRY_INTERVAL)
};


/**
 * @typedef {null} StreamResponse
 */

/**
 * @param {any} event
 * @param {null} context
 * @param {function(Error, null)} callback
 */
function handler(event, context, callback) {
  const records = extractRecords(event, ['INSERT']);

  console.log('Start processing', records.length, 'records');

  const asyncExecutions = records.map((task) => execute(task));
  // todo: prevent re-execution by catching the put-results
  Promise.all(asyncExecutions)
    .then((results) => putResults(results))
    .then(() => callback(null, null))
    .catch((err) => callback(err, null));
}

/**
 * @param {Task} task
 * @return {Promise<TaskResult>}
 */
function execute(task) {
  return executeHandler(task)
    .then((result) => executeCallback(task, result));
}

/**
 * @param {Task} task
 * @param {TaskResult} result
 * @returns Promise<TaskResult>
 */
function executeCallback(task, result) {
  console.log('Perform callback', JSON.stringify({task, result}));
  const payload = {task, result};
  return PromiseRetry(() => invokeLambda(CALLBACK_FUNCTION_NAME, payload), retryOptions)
    .then((callbackResult) => {
      return Object.assign(callbackResult, result);
    })
    .catch(() => {
      return Object.assign({callbackStatusCode: -1}, result);
    })
}

/**
 * @param {Task} record
 * @returns {Promise<TaskResult>}
 */
function executeHandler(record) {
  console.log('Perform task execution', JSON.stringify(record));
  return PromiseRetry(() => invokeLambda(RUN_FUNCTION_NAME, record), retryOptions)
    .catch((err) => {
      return {
        id: record.id,
        handlerStatusCode: -1,
        result: err.message
      }
    })
}

/**
 * @param {any} event
 * @param {Tasks[]} events
 */
function extractRecords(event, events) {
  return event.Records
    .filter((record) => events.indexOf(record.eventName) !== -1)
    .map((record) => AttributeValue.unwrap(record.dynamodb.NewImage));
}

module.exports = {handler};