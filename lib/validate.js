const Joi = require('joi');
const {ValidationError} = require('../errors');

/**
 * @throws {ValidationError}
 * @param {any} event
 * @param {Joi.Schema} schema
 * @returns {Promise<any>}
 */
function validateEventSchema(event, schema) {
  console.log("Validation event schema", JSON.stringify(event));

  const res = Joi.validate(event, schema);
  if (res.error) {
    console.warn("Validation failed:", res.error.message);
    return Promise.reject(new ValidationError(res.error.message));
  } else {
    return Promise.resolve(res.value);
  }
}

module.exports = {validateEventSchema};
