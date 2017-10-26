const Joi = require('joi');
const validate = require('../lib/validate');
const taskService = require('../lib/task');

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
    .then(() => {
      return {
        statusCode: 200,
        body: '{}',
        headers: [{key: 'accept/type', value: 'application/text'}]
      }
    })
    .then((response) => callback(null, response))
    .catch((err) => callback(err, null));
}

module.exports = {handler};