const Joi = require('joi');
const taskService = require('../lib/task');
const {validateEventSchema} = require('../lib/validate');
const {NotFoundError} = require('../errors');
const errorHandler = require('./errorHandler');

/**
 * @typedef {!LambdaResponse<{task: Task, result: TaskResult}>} GetResponse
 */

const eventSchema = Joi.object({id: Joi.string().required()}).required();

/**
 * Get the result of the task
 * @param {{id: string}} event
 * @param {null} context
 * @param {function(Error, (GetResponse))} callback
 */
function handler(event, context, callback) {
  validateEventSchema(event, eventSchema)
    .then(({id}) => taskService.get(id))
    .then((task) => {
      return taskService.getResult(task.id)
        .then((result) => {
          return {task, result}
        })
        .catch((err) => {
          if (err instanceof NotFoundError) {
            return {task, result: null};
          } else {
            throw err;
          }
        })
    })
    .then((response) => {
      callback(null, {success: true, response: response});
    })
    .catch((error) => errorHandler(error, callback));
}

module.exports = {handler};