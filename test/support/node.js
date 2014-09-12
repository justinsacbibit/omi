var chai           = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , chaiThings     = require('chai-things')
  , Promise        = require('bluebird')
  , mongoose       = require('mongoose');

process.env.NODE_ENV = 'test';
if (process.env.CI) {
  process.env.MONGO_TEST = 'mongodb://travisci:github123integration@kahana.mongohq.com:10095/omi-ci';
}

Promise.promisifyAll(mongoose);

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiThings);

global.expect = chai.expect;
