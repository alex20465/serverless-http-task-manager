const Joi = require('joi');
const request = require('request-promise');

const {validateEventSchema} = require('../lib/validate');
const errorHandler = require('./errorHandler');


const {FACEBOOK_URL, FACEBOOK_ACCESS_TOKEN} = process.env;

/**
 * @typedef {!LambdaResponse.<null>} SendMessageResponse
 */

const eventSchema = Joi.object({
  recipientId: Joi.string().required(),
  message: Joi.string().required(),
}).required();

/**
 * @param {{message: string, recipientId: string}} event
 * @param {null} context
 * @param {function(Error, (SendMessageResponse))} callback
 */
function handler(event, context, callback) {
  validateEventSchema(event, eventSchema)
    .then(({message, recipientId}) => {
      console.log(`send message "${message}" to ${recipientId}`);
      return request.post(FACEBOOK_URL, {
        qs: {access_token: FACEBOOK_ACCESS_TOKEN},
        json: {
          recipient: {id: recipientId},
          message: {text: `(BOT) ${message}`}
        }
      });
    })
    .then(() => {
      callback(null, {success: true, response: null})
    })
    .catch((error) => errorHandler(error, callback));
}

module.exports = {handler};