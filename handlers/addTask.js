const Joi = require('joi');
const uuid = require('uuid');
const { validateEventSchema } = require('../lib/validate');
const taskService = require('../lib/task');

/**
 * @typedef {Task} AddResponse
 */

const eventSchema = taskService.schemas.TaskSchema.keys({
  id: Joi.string()
    .forbidden()
    .default(() => uuid.v4(), 'auto generated UUID'),
}).required();

/**
 * @param {Task} event without id
 * @param {null} context
 * @param {function(Error, (AddResponse|null))} callback
 * @returns {void}
 */
function handler(event, context, callback) {
  validateEventSchema(event, eventSchema)
    .then(item => taskService.put(item))
    .then(item => callback(null, item))
    .catch(error => callback(error, null));
}

module.exports = { handler };
