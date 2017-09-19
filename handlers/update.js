const Joi = require('joi');
const {validateEventSchema} = require('../lib/validate');
const taskService = require('../lib/task');
const errorHandler = require('./errorHandler');

/**
 * @typedef {!LambdaResponse.<TaskResult>} UpdateResponse
 */

const eventSchema = Joi.object({
  id: Joi.string().required(),
  handlerStatusCode: Joi.number().required(),
  callbackStatusCode: Joi.number(), // optional
  result: Joi.string().required()
}).required();

/**
 * @param {TaskResult} event
 * @param {null} context
 * @param {function(Error, (UpdateResponse))} callback
 */
function handler(event, context, callback) {
  validateEventSchema(event, eventSchema)
    .then((item) => taskService.get(event.id)) // make sure the task exists
    .then(() => taskService.putResult(event)) // update the result object
    .then((item) => {
      callback(null, {success: true, response: item})
    })
    .catch((error) => errorHandler(error, callback));
}

module.exports = {handler};