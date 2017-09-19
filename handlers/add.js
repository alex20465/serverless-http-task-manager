const Joi = require('joi');
const uuid = require('uuid');
const {validateEventSchema} = require('../lib/validate');
const taskService = require('../lib/task');
const errorHandler = require('./errorHandler');

/**
 * @typedef {!LambdaResponse.<Task>} AddResponse
 */

const eventSchema = Joi.object({
  handlerEndpoint: Joi.string().uri().required(),
  handlerBody: Joi.string(),
  callbackEndpoint: Joi.string().uri().required()
}).required();

/**
 * @param {Task} event without id
 * @param {null} context
 * @param {function(Error, (AddResponse))} callback
 */
function handler(event, context, callback) {
  validateEventSchema(event, eventSchema)
    .then((item) => {
      item.id = uuid.v4();
      return item;
    })
    .then((item) => taskService.put(item))
    .then((item) => {
      callback(null, {success: true, response: item})
    })
    .catch((error) => errorHandler(error, callback));
}

module.exports = {handler};