const assert = require('assert');
const { DynamoDB } = require('aws-sdk');
const { NotFoundError } = require('../errors');
const { AttributeValue } = require('dynamodb-data-types');
const Joi = require('joi');

const {
  TASKS_TABLE,
  TASK_RESULTS_TABLE,
  MAX_HEADERS,
  MAX_HEADER_VALUE_SIZE,
  MAX_RESPONSE_SIZE,
} = process.env;

const ddb = new DynamoDB();
const documentClient = new DynamoDB.DocumentClient();

/**
 * @typedef {object} HeaderItem
 * @property {string} key
 * @property {string} value
 */

/**
 * @typedef {object} Request
 * @property {string} uri
 * @property {'post'|'get'} method
 * @property {string} body
 * @property {HeaderItem[]} headers
 */

const HeaderItemSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string()
    .max(parseInt(MAX_HEADER_VALUE_SIZE))
    .required(),
});

const RequestSchema = Joi.object({
  uri: Joi.string()
    .uri()
    .required(),
  method: Joi.string()
    .valid(['post', 'get'])
    .default('post'),
  body: Joi.string()
    .max(parseInt(MAX_RESPONSE_SIZE))
    .default('{}'),
  headers: Joi.array()
    .items(HeaderItemSchema)
    .max(parseInt(MAX_HEADERS))
    .default([
      {
        key: 'Accept',
        value: 'application/json',
      },
    ]),
});

/**
 * @typedef {object} Response
 * @property {string} body
 * @property {number} statusCode
 * @property {HeaderItem[]} headers
 */

const ResponseSchema = Joi.object({
  body: Joi.string()
    .max(parseInt(MAX_RESPONSE_SIZE))
    .default('{}'),
  statusCode: Joi.number().required(),
  headers: Joi.array()
    .items(HeaderItemSchema)
    .max(parseInt(MAX_HEADERS))
    .default([]),
});

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {Request} request
 * @property {Request} callback
 * @property {'await'|'async'} strategy
 */

const TaskSchema = Joi.object({
  id: Joi.string(),
  request: RequestSchema.required(),
  callback: RequestSchema,
  strategy: Joi.string()
    .valid(['async', 'await'])
    .default('await'),
});


/**
 * @typedef {object} TaskResultItem
 * @property {string} name
 * @property {string} source
 */

const TaskResultItem = Joi.object({
  name: Joi.string().max(255).required(),
  source: Joi.string().uri().required()
});

const TaskResultList = Joi.array().items(TaskResultItem).min(1).max(255);

/**
 * @typedef {object} TaskResult
 * @property {string} id
 * @property {Response} requestResponse
 * @property {Response} callbackResponse
 */

const TaskResultSchema = Joi.object({
  id: Joi.string(),
  requestResponse: ResponseSchema.required(),
  callbackResponse: ResponseSchema.required(),
});

/**
 * @param {string} id
 * @return {Promise<Task>}
 */
function get(id) {
  assert(TASKS_TABLE, 'missing environment configuration "TASKS_TABLE"');
  return documentClient
    .get({
      TableName: TASKS_TABLE,
      Key: { id },
    })
    .promise()
    .then(({ Item }) => {
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
  return documentClient
    .get({
      TableName: TASK_RESULTS_TABLE,
      Key: { id },
    })
    .promise()
    .then(({ Item }) => {
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
  return documentClient
    .put({
      TableName: TASK_RESULTS_TABLE,
      Item: item,
    })
    .promise()
    .then(() => item);
}

/**
 * @param {TaskResult[]} items
 * @return {Promise<void>}
 */
function putResults(items) {
  assert(TASK_RESULTS_TABLE, 'missing environment configuration "TASK_RESULTS_TABLE"');

  const params = { RequestItems: {} };

  params.RequestItems[TASK_RESULTS_TABLE] = items.map(item => {
    return {
      PutRequest: {
        Item: AttributeValue.wrap(item),
      },
    };
  });

  return ddb
    .batchWriteItem(params)
    .promise()
    .then(() => null);
}

/**
 * @param {Task} item
 * @return {Promise<Task>}
 */
function put(item) {
  assert(TASKS_TABLE, 'missing environment configuration "TASKS_TABLE"');
  return documentClient
    .put({
      TableName: TASKS_TABLE,
      Item: item,
    })
    .promise()
    .then(() => item);
}

module.exports = {
  get,
  getResult,
  putResult,
  put,
  putResults,
  schemas: {
    TaskSchema,
    TaskResultSchema,
    ResponseSchema,
    RequestSchema,
    TaskResultItem,
    TaskResultList
  },
};
