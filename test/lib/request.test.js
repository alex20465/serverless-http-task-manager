const {expect} = require('chai');
const {request} = require('../../lib/request');

describe('lib.request', () => {
  describe('POST - google.com', () => {
    let response;
    before(() => {
      return request({uri: 'http://www.google.com', method: 'post'})
        .then((res) => (response = res));
    });

    it('should return statusCode 200', () => {
      expect(response.statusCode).to.be.equal(405);
    });

    it('should respond with body length greater than 50', () => {
      expect(response.body.length).to.greaterThan(50);
    });

    it('should respond with header "content-type" item', () => {
      expect(response.headers).to.containSubset([
        {
          key: 'content-type',
          value: 'text/html; charset=UTF-8'
        }
      ]);
    })
  });
});