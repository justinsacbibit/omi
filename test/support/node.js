var chai           = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , chaiThings     = require('chai-things')
  , Promise        = require('bluebird')
  , mongoose       = require('mongoose');

process.env.NODE_ENV = 'test';

Promise.promisifyAll(mongoose);

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiThings);

global.expect = chai.expect;
