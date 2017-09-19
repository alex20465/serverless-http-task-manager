const Joi = require('joi');
const request = require('request-promise');

const {validateEventSchema} = require('../lib/validate');
const errorHandler = require('./errorHandler');

/**
 * @typedef {!LambdaResponse.<null>} SendMessageResponse
 */

const eventSchema = Joi.object({
}).required();

/**
 * @param {{message: string, recipientId: string}} event
 * @param {null} context
 * @param {function(Error, (SendMessageResponse))} callback
 */
function handler(event, context, callback) {
  validateEventSchema(event, eventSchema)
    .then(() => {
    })
    .then(() => {
      callback(null, {success: true, response: null})
    })
    .catch((error) => errorHandler(error, callback));
}

module.exports = {handler};