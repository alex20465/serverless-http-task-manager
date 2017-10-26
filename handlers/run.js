const validate = require('../lib/validate');
const taskService = require('../lib/task');

const eventSchema = taskService.schemas.TaskSchema.required();

/**
 * @param {Task} event
 * @param {null} context
 * @param {function(Error, (Response|null))} callback
 */
function handler(event, context, callback) {
  validate.validateEventSchema(event, eventSchema)
    .then(() => {
      // todo: implement endpoint call
      return {
        statusCode: 200,
        body: 'OK',
        headers: [{"Accept": "application/json"}]
      }
    })
    .then((result) => setTimeout(() => callback(null, result), 9000))
    .catch((err) => callback(err, null));
}

module.exports = {handler};