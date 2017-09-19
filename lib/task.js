const assert = require('assert');
const {DynamoDB} = require('aws-sdk');
const {NotFoundError} = require('../errors');

const {TASKS_TABLE, TASK_RESULTS_TABLE} = process.env;

const db = new DynamoDB.DocumentClient();

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
 * @property {number} [callbackStatusCode]
 * @property {string} result
 */

/**
 * @param {string} id
 * @return {Promise<Task>}
 */
function get(id) {
  assert(TASKS_TABLE, 'missing environment configuration "TASKS_TABLE"');
  return db.get({
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
  return db.get({
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
  return db.put({
    TableName: TASK_RESULTS_TABLE,
    Item: item
  }).promise().then(() => item);
}

/**
 * @param {Task} item
 * @return {Promise<Task>}
 */
function put(item) {
  assert(TASKS_TABLE, 'missing environment configuration "TASKS_TABLE"');
  return db.put({
    TableName: TASKS_TABLE,
    Item: item
  }).promise().then(() => item);
}


module.exports = {get, getResult, putResult, put};