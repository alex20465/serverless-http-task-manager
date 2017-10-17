const {AttributeValue} = require('dynamodb-data-types');
const Promise = require('bluebird');
const {invokeLambda} = require('../lib/invokeLambda');
const {putResults} = require('../lib/task');
const {RUN_FUNCTION_NAME} = process.env;

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
  const asyncExecutions = records.map((task) => execute(task));

  // todo: prevent re-execution by catching the put-results
  Promise.all(asyncExecutions)
    .then((results) => putResults(results))
    .then(() => callback(null, null))
    .catch((err) => callback(err, null));
}

/**
 * @param {Task} record
 * @returns {Promise<TaskResult>}
 */
function execute(record) {
  return invokeLambda(RUN_FUNCTION_NAME, record);
  // todo: catch timeout error and retry
}

function extractRecords(event, events) {
  return event.Records
    .filter((record) => events.indexOf(record.eventName) !== -1)
    .map((record) => AttributeValue.unwrap(record.dynamodb.NewImage));
}

module.exports = {handler};