const { S3 } = require('aws-sdk');
const uuid = require('uuid');
const req = require('request');

const { RESPONSE_BUCKET } = process.env;

const s3 = new S3();

/**
 * @param {string} uri
 * @param {string} body JSON serialized
 * @param {HeaderItem[]} headers
 * @param {'post'|'get'} method
 * @return {Promise<Response>}
 */
function request({ uri, body, headers, method }) {
  return new Promise((resolve, reject) => {
    let options = { method, uri };
    if (method === 'post') {
      options.json = body ? JSON.parse(body) : {};
    } else {
      // Use the body as query string
      options.qs = body ? JSON.parse(body) : {};
    }
    options.headers = headers ? headerItemsToMap(headers) : null;

    req(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if (typeof body !== 'string') {
          body = JSON.stringify(body);
        }
        resolve({
          body: body,
          statusCode: response.statusCode,
          headers: headerMapToItems(response.headers),
        });
      }
    });
  });
}

/**
 * @param {Response} response
 * @returns {Promise<Response>}
 */
function saveResponse(response) {
  const id = uuid.v4();
  const key = `${id.split('-', 1).pop()}/${id}`;
  return s3
    .putObject({
      Bucket: RESPONSE_BUCKET,
      Body: response.body,
      Key: key,
    })
    .promise()
    .then(() => {
      // replace the response body with the storage source reference
      response.body = `s3://${RESPONSE_BUCKET}/${key}`;
      return response;
    });
}

/**
 * @param {HeaderItem[]} headers
 * @return {object}
 */
function headerItemsToMap(headers) {
  return headers.reduce((acc, header) => {
    acc[header.key] = '' + header.value;
    return acc;
  }, {});
}

/**
 * @param {object} headerObject
 * @return {HeaderItem[]}
 */
function headerMapToItems(headerObject) {
  return Object.keys(headerObject).map(key => {
    return { key: key, value: '' + headerObject[key] };
  });
}

module.exports = { request, saveResponse };
