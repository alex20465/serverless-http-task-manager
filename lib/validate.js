const Joi = require('joi');
const {ValidationError} = require('../errors');

/**
 * @throws {ValidationError}
 * @param {any} event
 * @param {Joi.Schema} schema
 * @returns {Promise<any>}
 */
function validateEventSchema(event, schema) {
  const res = Joi.validate(event, schema);
  if (res.error) {
    return Promise.reject(new ValidationError(res.error.message));
  } else {
    return Promise.resolve(res.value);
  }
}

module.exports = {validateEventSchema};
