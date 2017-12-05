const Joi = require('joi');
const { ValidationError } = require('../errors');

/**
 * @throws {ValidationError}
 * @param {any} event
 * @param {Joi.Schema} schema
 * @returns {Promise<any>}
 */
function validateEventSchema(event, schema) {
  console.log('Validation event schema', JSON.stringify(event));

  const res = Joi.validate(event, schema);
  if (res.error) {
    console.warn('Validation failed:', res.error.message);
    return Promise.reject(new ValidationError(res.error.message));
  } else {
    return Promise.resolve(res.value);
  }
}

/**
 * @param {object} obj
 * @param {Joi.Schema} schema
 * @returns {Promise<object>}
 */
function validate(obj, schema) {
  const res = Joi.validate(obj, schema);
  if (res.error) {
    throw new ValidationError(res.error.message);
  } else {
    return res.value;
  }
}

module.exports = { validateEventSchema, validate };
