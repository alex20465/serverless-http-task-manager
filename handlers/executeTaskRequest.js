const validate = require('../lib/validate');
const taskService = require('../lib/task');
const { request, saveResponse } = require('../lib/request');
const eventSchema = taskService.schemas.TaskSchema.required();

/**
 * @param {Task} event
 * @param {null} context
 * @param {function(Error, (Response|null))} callback
 * @returns {void}
 */
function handler(event, context, callback) {
  validate
    .validateEventSchema(event, eventSchema)
    .then(() => request(event.request))
    .then(response => saveResponse(response))
    .then(result => callback(null, result))
    .catch(err => callback(err, null));
}

module.exports = { handler };
