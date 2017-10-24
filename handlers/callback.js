const Joi = require('joi');
const validate = require('../lib/validate');

const eventSchema = Joi.object({
  task: Joi.object({
    id: Joi.string().required(),
    handlerEndpoint: Joi.string().uri().required(),
    callbackEndpoint: Joi.string().uri().required(),
  }).options({skipUnknown: true}).required(),
  result: Joi.object({
    handlerStatusCode: Joi.number().required(),
    result: Joi.string().required()
  }).options({skipUnknown: true}).required()
}).required();

/**
 * @param {{task: Task, result: TaskResult}} event
 * @param {null} context
 * @param {function(Error, (TaskResult|null))} callback
 */
function handler(event, context, callback) {
  validate.validateEventSchema(event, eventSchema)
    .then(() => {
      // todo: implement endpoint call
      return Object.assign({callbackStatusCode: 200}, event.result);
    })
    .then((result) => {
      setTimeout(() => callback(null, result), 9000);
    })
    .catch((err) => callback(err, null));
}

module.exports = {handler};