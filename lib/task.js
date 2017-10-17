const assert = require('assert');
const {DynamoDB} = require('aws-sdk');
const {NotFoundError} = require('../errors');
const {AttributeValue} = require('dynamodb-data-types');

const {TASKS_TABLE, TASK_RESULTS_TABLE} = process.env;

const ddb = new DynamoDB();
const documentClient = new DynamoDB.DocumentClient();

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {string} callbackEndpoint
 * @property {string} handlerEndpoint
 * @property {string} handlerBody
 */

/**
 * @typedef {object} TaskResult
 * @property {string} id
 * @property {number} handlerStatusCode
 * @property {number} callbackStatusCode
 * @property {string} result
 */

/**
 * @param {string} id
 * @return {Promise<Task>}
 */
function get(id) {
  assert(TASKS_TABLE, 'missing environment configuration "TASKS_TABLE"');
  return documentClient.get({
    TableName: TASKS_TABLE,
    Key: {id}
  }).promise()
    .then(({Item}) => {
      if (!Item) {
        throw new NotFoundError(`Tasks results with identity ${id} not found`);
      }
      return Item;
    });
}

/**
 * @param {string} id
 * @return {Promise<TaskResult>}
 */
function getResult(id) {
  assert(TASKS_TABLE, 'missing environment configuration "TASK_RESULTS_TABLE"');
  return documentClient.get({
    TableName: TASK_RESULTS_TABLE,
    Key: {id}
  }).promise()
    .then(({Item}) => {
      if (!Item) {
        throw new NotFoundError(`Tasks results with identity ${id} not found`);
      }
      return Item;
    });
}

/**
 * @param {TaskResult} item
 * @return {Promise<TaskResult>}
 */
function putResult(item) {
  assert(TASK_RESULTS_TABLE, 'missing environment configuration "TASK_RESULTS_TABLE"');
  return documentClient.put({
    TableName: TASK_RESULTS_TABLE,
    Item: item
  }).promise().then(() => item);
}

/**
 * @param {TaskResult[]} items
 * @return {Promise<void>}
 */
function putResults(items) {
  assert(TASK_RESULTS_TABLE, 'missing environment configuration "TASK_RESULTS_TABLE"');

  const params = {RequestItems: {}};

  params.RequestItems[TASK_RESULTS_TABLE] = items.map((item) => {
    return {
      PutRequest: {
        Item: AttributeValue.wrap(item)
      }
    };
  });

  return ddb.batchWriteItem(params).promise().then(() => null);
}

/**
 * @param {Task} item
 * @return {Promise<Task>}
 */
function put(item) {
  assert(TASKS_TABLE, 'missing environment configuration "TASKS_TABLE"');
  return documentClient.put({
    TableName: TASKS_TABLE,
    Item: item
  }).promise().then(() => item);
}


module.exports = {get, getResult, putResult, put, putResults};