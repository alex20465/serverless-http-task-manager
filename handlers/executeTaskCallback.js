const Joi = require('joi');
const validate = require('../lib/validate');
const taskService = require('../lib/task');
const {request} = require('../lib/request');

const eventSchema = Joi.object({
  task: taskService.schemas.TaskSchema.required(),
  requestResponse: taskService.schemas.ResponseSchema.required(),
}).required();

/**
 * @param {{task: Task, requestResponse: Response}} event
 * @param {null} context
 * @param {function(Error, (Response|null))} callback
 */
function handler(event, context, callback) {
  validate.validateEventSchema(event, eventSchema)
    .then(() => request({
      uri: event.task.callback.uri,
      headers: event.task.callback.headers,
      method: event.task.callback.method,
      body: JSON.stringify(Object.assign({id: event.task.id}, event.requestResponse))
    }))
    .then((response) => callback(null, response))
    .catch((err) => callback(err, null));
}

module.exports = {handler};