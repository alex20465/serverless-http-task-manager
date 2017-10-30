const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

process.env = {
  MAX_RESPONSE_SIZE: '2000'
};