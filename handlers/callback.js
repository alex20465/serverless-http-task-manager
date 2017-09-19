const Joi = require('joi');
const request = require('request');

const {validateEventSchema} = require('../lib/validate');
const errorHandler = require('./errorHandler');

const {CALLBACK_TIMEOUT, CALLBACK_MAX_BODY_SIZE} = process.env;

/**
 * @typedef {!LambdaResponse.<TaskResult>} CallbackResponse
 */

/**
 * @typedef {object} CallbackEvent
 * @property {string} id
 * @property {string} callbackEndpoint
 * @property {number} handlerStatusCode
 * @property {string} handlerBody
 */

const eventSchema = Joi.object({
  id: Joi.string().required(),
  callbackEndpoint: Joi.string().required(),
  handlerStatusCode: Joi.number().required(),
  handlerBody: Joi.string().required()
}).required();

/**
 * @param {CallbackEvent} event
 * @param {null} context
 * @param {function(Error, (CallbackResponse))} callback
 */
function handler(event, context, callback) {
  validateEventSchema(event, eventSchema)
    .then(() => taskCallback(event))
    .then((taskResult) => {
      callback(null, {success: true, response: taskResult})
    })
    .catch((error) => errorHandler(error, callback));
}

/**
 * @param {CallbackEvent} event
 * @return {Promise<number>}
 */
function taskCallback(event) {
  let parameters = {
    url: event.callbackEndpoint,
    json: {
      handlerStatusCode: event.handlerBody,
      handlerBody: event.handlerBody
    },
    headers: {'Content-Type': 'application/json'}
  };
  return new Promise((resolve) => {
    request.post(parameters, (err, response) => {
      if (err) {
        resolve(0);
      } else {
        resolve(response.statusCode);
      }
    });
  });
}

module.exports = {handler};