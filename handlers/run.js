const Joi = require('joi');
const validate = require('../lib/validate');

const eventSchema = Joi.object({
  id: Joi.string().required(),
  handlerEndpoint: Joi.string().uri().required(),
  handlerBody: Joi.string(),
  callbackEndpoint: Joi.string().uri().required()
}).required();

/**
 * @param {Task} event
 * @param {null} context
 * @param {function(Error, (TaskResult|null))} callback
 */
function handler(event, context, callback) {
  validate.validateEventSchema(event, eventSchema)
    .then(() => {
      // todo: implement endpoint call
      return {
        id: event.id,
        handlerStatusCode: 200,
        callbackStatusCode: 200,
        result: 'Mock'
      }
    })
    .then((result) => callback(null, result))
    .catch((err) => callback(err, null));
}

module.exports = {handler};